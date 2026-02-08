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

    // Get total messages count
    const totalMessages = await prisma.message.count();

    // Get active conversations (unique rental requests with messages)
    const totalConversations = await prisma.rentalRequest.count({
      where: {
        messages: {
          some: {}, // Has at least one message
        },
      },
    });

    return NextResponse.json({
      totalMessages,
      totalConversations,
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message stats' },
      { status: 500 }
    );
  }
}
