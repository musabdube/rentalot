import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all blog posts for admin review
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const posts = await prisma.blogPost.findMany({
      where: status ? { status: status as any } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// PATCH - Approve or reject a blog post
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postId, action, rejectionReason } = body;

    if (!postId || !action) {
      return NextResponse.json(
        { error: 'Post ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const updateData: any = {
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    };

    if (action === 'approve') {
      updateData.status = 'APPROVED';
      updateData.publishedAt = new Date();
      updateData.rejectionReason = null;
    } else {
      updateData.status = 'REJECTED';
      updateData.rejectionReason = rejectionReason || 'No reason provided';
    }

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error reviewing blog post:', error);
    return NextResponse.json({ error: 'Failed to review blog post' }, { status: 500 });
  }
}
