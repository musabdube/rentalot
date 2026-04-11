import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/roommate/messages?listingId=xxx  – get conversation thread
// GET /api/roommate/messages?inbox=true     – get all conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Inbox view: return all conversations the user is part of, grouped by listingId
    const inbox = request.nextUrl.searchParams.get('inbox');
    if (inbox === 'true') {
      const allMessages = await prisma.roommateMessage.findMany({
        where: {
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              tenant: { select: { id: true, name: true, avatar: true } },
            },
          },
          sender: { select: { id: true, name: true, avatar: true } },
          receiver: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Group by listingId, keeping the latest message per thread
      const convMap = new Map<string, any>();
      for (const msg of allMessages) {
        const otherUser = msg.senderId === session.user.id ? msg.receiver : msg.sender;
        if (!convMap.has(msg.listingId)) {
          convMap.set(msg.listingId, {
            listingId: msg.listingId,
            listing: msg.listing,
            otherUser,
            lastMessage: msg,
            unreadCount: 0,
          });
        }
        if (!msg.readAt && msg.receiverId === session.user.id) {
          convMap.get(msg.listingId).unreadCount++;
        }
      }

      return NextResponse.json(Array.from(convMap.values()));
    }

    const listingId = request.nextUrl.searchParams.get('listingId');
    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    // Only participants (sender/receiver) or admin can read
    const isAdmin = session.user.role === 'ADMIN';

    const messages = await prisma.roommateMessage.findMany({
      where: {
        listingId,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { senderId: session.user.id },
                { receiverId: session.user.id },
              ],
            }),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark messages for this user as read
    await prisma.roommateMessage.updateMany({
      where: { listingId, receiverId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });

    return NextResponse.json(messages);
  } catch (err) {
    console.error('GET /api/roommate/messages', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/roommate/messages – send a message about a listing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, receiverId, content } = body;

    if (!listingId || !receiverId || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (session.user.id === receiverId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    // Verify the listing exists and is public
    const listing = await prisma.roommateListing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (!['APPROVED', 'ACTIVE'].includes(listing.status) && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Listing is not available' }, { status: 403 });
    }

    const message = await prisma.roommateMessage.create({
      data: {
        listingId,
        senderId: session.user.id,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error('POST /api/roommate/messages', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
