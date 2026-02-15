import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get single blog post by slug
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug },
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

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Only allow viewing approved posts or own posts
    if (post.status !== 'APPROVED') {
      if (!session?.user?.id || (post.authorId !== session.user.id && session.user.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }
    }

    // Increment view count
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });

    // Get user's vote if logged in
    let userVote = null;
    if (session?.user?.id) {
      const vote = await prisma.blogVote.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: session.user.id,
          },
        },
      });
      userVote = vote?.voteType || null;
    }

    return NextResponse.json({
      ...post,
      userVote,
    });
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    const errorMessage = error?.message || 'Failed to fetch blog post';
    return NextResponse.json({ 
      error: errorMessage,
      details: 'Blog tables may not exist. Run: npx prisma migrate dev --name add_blog_system'
    }, { status: 500 });
  }
}
