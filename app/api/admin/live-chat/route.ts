import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get all chats for admin
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const chats = await prisma.liveChat.findMany({
      where: status ? { status: status as 'OPEN' | 'CLOSED' } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatar: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get only the last message for preview
        },
        _count: {
          select: {
            messages: {
              where: {
                isAdminMessage: false,
                read: false,
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching admin chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}
