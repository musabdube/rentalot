import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary, validateDataUrlSize } from '@/lib/cloudinary';

// GET - Fetch all approved blog posts (public) or user's own posts
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    
    const hashtag = searchParams.get('hashtag');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const myPosts = searchParams.get('myPosts') === 'true';
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular, trending

    let where: any = {};

    // If user wants their own posts
    if (myPosts && session?.user?.id) {
      where.authorId = session.user.id;
    } else {
      // Public feed - only approved posts
      where.status = 'APPROVED';
    }

    // Filter by hashtag
    if (hashtag) {
      where.hashtags = {
        has: hashtag.toLowerCase().replace(/^#+/, ''),
      };
    }

    // Filter by category
    if (category && category !== 'all') {
      where.category = category;
    }

    // Search in title, excerpt, content
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Sorting
    let orderBy: any = {};
    switch (sortBy) {
      case 'popular':
        orderBy = { upvotes: 'desc' };
        break;
      case 'trending':
        // Trending = high upvotes recently (simplified)
        orderBy = [{ upvotes: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'recent':
      default:
        orderBy = { publishedAt: 'desc' };
        break;
    }

    const posts = await prisma.blogPost.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    // Include user's vote if logged in — single batch query instead of N+1
    if (session?.user?.id) {
      const postIds = posts.map((p) => p.id);
      const userVotes = await prisma.blogVote.findMany({
        where: {
          userId: session.user.id,
          postId: { in: postIds },
        },
        select: { postId: true, voteType: true },
      });
      const voteMap = new Map(userVotes.map((v) => [v.postId, v.voteType]));

      const postsWithVotes = posts.map((post) => ({
        ...post,
        userVote: voteMap.get(post.id) || null,
      }));

      return NextResponse.json({ posts: postsWithVotes });
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch blog posts',
      details: error?.message || 'Unknown error',
      hint: 'Blog tables may not exist. Run: npx prisma migrate dev --name add_blog_system'
    }, { status: 500 });
  }
}

// POST - Create a new blog post
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      content,
      excerpt,
      coverImage,
      hashtags,
      category,
      status,
    } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Date.now();

    // Process hashtags - ensure they are lowercase
    const processedHashtags = Array.isArray(hashtags)
      ? hashtags.map((tag: string) => tag.toLowerCase().replace(/^#+/, ''))
      : [];

    // Upload cover image to Cloudinary if it's a data URL
    let uploadedCoverImage = coverImage;
    if (coverImage && coverImage.startsWith('data:')) {
      // Validate size
      if (!validateDataUrlSize(coverImage)) {
        return NextResponse.json(
          { error: 'Cover image is too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }
      
      const uploaded = await uploadToCloudinary(coverImage);
      if (uploaded) {
        uploadedCoverImage = uploaded;
      }
    }

    const post = await prisma.blogPost.create({
      data: {
        authorId: session.user.id,
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt?.trim() || content.trim().substring(0, 200) + '...',
        coverImage: uploadedCoverImage,
        hashtags: processedHashtags,
        category: category || 'general',
        status: status === 'DRAFT' ? 'DRAFT' : 'PENDING', // Default to PENDING for review
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ 
      error: 'Failed to create blog post',
      details: error?.message || 'Unknown error',
      hint: 'Blog tables may not exist. Run: npx prisma migrate dev --name add_blog_system'
    }, { status: 500 });
  }
}

// PATCH - Update a blog post
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postId, ...updateData } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists and user is the author
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Upload cover image to Cloudinary if it's a data URL
    if (updateData.coverImage && updateData.coverImage.startsWith('data:')) {
      // Validate size
      if (!validateDataUrlSize(updateData.coverImage)) {
        return NextResponse.json(
          { error: 'Cover image is too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }
      
      const uploaded = await uploadToCloudinary(updateData.coverImage);
      if (uploaded) {
        updateData.coverImage = uploaded;
      }
    }

    // Process hashtags if provided
    if (updateData.hashtags) {
      updateData.hashtags = Array.isArray(updateData.hashtags)
        ? updateData.hashtags.map((tag: string) => tag.toLowerCase().replace(/^#+/, ''))
        : [];
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE - Delete a blog post
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const postId = body.id || body.postId;

    console.log('Delete request - postId:', postId, 'userId:', session.user.id);

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists and user is the author
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    console.log('Found post:', post ? `${post.id} by ${post.authorId}` : 'null');

    if (!post) {
      return NextResponse.json({ error: 'Post not found', postId }, { status: 404 });
    }

    if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - You can only delete your own posts' }, { status: 403 });
    }

    // Delete associated votes first (due to foreign key constraint)
    await prisma.blogVote.deleteMany({
      where: { postId: postId },
    });

    // Then delete the post
    await prisma.blogPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ 
      error: 'Failed to delete blog post',
      details: error?.message 
    }, { status: 500 });
  }
}
