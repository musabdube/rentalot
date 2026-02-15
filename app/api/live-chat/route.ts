import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get or create a chat for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');

    // If chatId is provided, get specific chat with messages
    if (chatId) {
      const chat = await prisma.liveChat.findUnique({
        where: { id: chatId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      if (!chat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }

      // Check if user has access to this chat
      if (chat.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(chat);
    }

    // Otherwise, get or create user's open chat
    let chat = await prisma.liveChat.findFirst({
      where: {
        userId: session.user.id,
        status: 'OPEN',
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // If no open chat exists, create one
    if (!chat) {
      chat = await prisma.liveChat.create({
        data: {
          userId: session.user.id,
          status: 'OPEN',
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
  }
}

// POST - Send a message in the chat
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { chatId, content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Get or create chat
    let chat;
    if (chatId) {
      chat = await prisma.liveChat.findUnique({
        where: { id: chatId },
      });

      if (!chat) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }

      // Check access
      if (chat.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Find or create open chat for user
      chat = await prisma.liveChat.findFirst({
        where: {
          userId: session.user.id,
          status: 'OPEN',
        },
      });

      if (!chat) {
        chat = await prisma.liveChat.create({
          data: {
            userId: session.user.id,
            status: 'OPEN',
          },
        });
      }
    }

    // Create message
    const isAdmin = session.user.role === 'ADMIN';
    const message = await prisma.liveChatMessage.create({
      data: {
        chatId: chat.id,
        senderId: session.user.id,
        senderName: session.user.name || 'User',
        senderRole: (session.user.role || 'TENANT') as any,
        content: content.trim(),
        isAdminMessage: isAdmin,
      },
    });

    // Update chat's lastMessageAt
    await prisma.liveChat.update({
      where: { id: chat.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// PATCH - Update chat status or mark messages as read
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { chatId, action } = body;

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const chat = await prisma.liveChat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Check access
    if (chat.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'close') {
      // Close the chat
      const updatedChat = await prisma.liveChat.update({
        where: { id: chatId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
        },
      });
      return NextResponse.json(updatedChat);
    }

    if (action === 'markRead') {
      // Mark all messages as read for the current user
      const isAdmin = session.user.role === 'ADMIN';
      
      await prisma.liveChatMessage.updateMany({
        where: {
          chatId,
          isAdminMessage: !isAdmin, // Mark other party's messages as read
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
  }
}
