import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all conversations with their messages
    const conversations = await prisma.rentalRequest.findMany({
      where: {
        messages: {
          some: {}, // Must have at least one message
        },
      },
      select: {
        id: true,
        propertyId: true,
        tenant: {
          select: { id: true, name: true, email: true },
        },
        landlord: {
          select: { id: true, name: true, email: true },
        },
        property: {
          select: { title: true },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, email: true },
            },
            receiver: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Format conversations
    const formattedConversations = conversations.map((conv) => ({
      id: conv.id,
      propertyId: conv.propertyId,
      tenant: conv.tenant,
      landlord: conv.landlord,
      property: conv.property,
      messages: conv.messages,
      messageCount: conv.messages.length,
      lastMessage: conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null,
    }));

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
