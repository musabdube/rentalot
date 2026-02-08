import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/admin-messages - Fetch admin's sent messages grouped by recipient
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can access this' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (userId) {
      // Get all messages with a specific user (both directions)
      const messages = await prisma.message.findMany({
        where: {
          rentalRequestId: null,
          OR: [
            {
              senderId: session.user.id,
              receiverId: userId,
            },
            {
              senderId: userId,
              receiverId: session.user.id,
            },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json(messages);
    }

    // Get all admin messages sent by this admin
    const adminMessages = await prisma.message.findMany({
      where: {
        rentalRequestId: null,
        senderId: session.user.id,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by receiver
    const groupedByReceiver = adminMessages.reduce((acc: any, msg) => {
      const receiverId = msg.receiver.id;
      if (!acc[receiverId]) {
        acc[receiverId] = {
          receiverId: msg.receiver.id,
          receiver: msg.receiver,
          messages: [],
          lastMessage: null,
          messageCount: 0,
          lastMessageDate: null,
        };
      }
      acc[receiverId].messages.push(msg);
      acc[receiverId].messageCount += 1;
      if (!acc[receiverId].lastMessage) {
        acc[receiverId].lastMessage = msg;
        acc[receiverId].lastMessageDate = msg.createdAt;
      }
      return acc;
    }, {});

    // Convert to array and sort by most recent
    const conversations = Object.values(groupedByReceiver)
      .sort((a: any, b: any) => new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime());

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
