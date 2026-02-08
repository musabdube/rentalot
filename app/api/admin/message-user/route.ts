import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can send messages' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, message } = body;

    if (!userId || !message || !message.trim()) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create a message from admin to user (not tied to a rental request)
    const adminMessage = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId: userId,
        content: `[ADMIN MESSAGE]\n\n${message}`,
        status: 'SENT',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: adminMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
