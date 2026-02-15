import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Vote on a blog post (upvote or downvote)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { postId, voteType } = body;

    if (!postId || !voteType) {
      return NextResponse.json(
        { error: 'Post ID and vote type are required' },
        { status: 400 }
      );
    }

    if (voteType !== 'UPVOTE' && voteType !== 'DOWNVOTE') {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be UPVOTE or DOWNVOTE' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Check if user already voted
    const existingVote = await prisma.blogVote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.user.id,
        },
      },
    });

    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.voteType === voteType) {
        await prisma.$transaction([
          prisma.blogVote.delete({
            where: { id: existingVote.id },
          }),
          prisma.blogPost.update({
            where: { id: postId },
            data: {
              [voteType === 'UPVOTE' ? 'upvotes' : 'downvotes']: {
                decrement: 1,
              },
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          action: 'removed',
          voteType: null,
        });
      } else {
        // Change vote type
        await prisma.$transaction([
          prisma.blogVote.update({
            where: { id: existingVote.id },
            data: { voteType },
          }),
          prisma.blogPost.update({
            where: { id: postId },
            data: {
              [existingVote.voteType === 'UPVOTE' ? 'upvotes' : 'downvotes']: {
                decrement: 1,
              },
              [voteType === 'UPVOTE' ? 'upvotes' : 'downvotes']: {
                increment: 1,
              },
            },
          }),
        ]);

        return NextResponse.json({
          success: true,
          action: 'changed',
          voteType,
        });
      }
    } else {
      // Create new vote
      await prisma.$transaction([
        prisma.blogVote.create({
          data: {
            postId,
            userId: session.user.id,
            voteType,
          },
        }),
        prisma.blogPost.update({
          where: { id: postId },
          data: {
            [voteType === 'UPVOTE' ? 'upvotes' : 'downvotes']: {
              increment: 1,
            },
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        action: 'created',
        voteType,
      });
    }
  } catch (error) {
    console.error('Error voting on blog post:', error);
    return NextResponse.json({ error: 'Failed to vote on blog post' }, { status: 500 });
  }
}
