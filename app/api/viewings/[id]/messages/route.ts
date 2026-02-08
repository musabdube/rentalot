import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/viewings/[id]/messages - Fetch messages for a viewing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: viewingId } = await params;

    // Get the viewing to verify access
    const viewing = await prisma.viewing.findUnique({
      where: { id: viewingId },
      include: {
        property: {
          include: {
            landlord: { select: { id: true, name: true, avatar: true } },
          },
        },
        tenant: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!viewing) {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 });
    }

    // Verify user is either the tenant or the property landlord
    const isAuthorized =
      viewing.tenantId === session.user.id || viewing.property.landlord.id === session.user.id;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get messages for this viewing from custom storage
    // For now, we'll use the rental request messages table if viewing is linked to a rental request
    // Otherwise, we'll return empty array
    const messages = await (prisma.message as any).findMany({
      where: {
        OR: [
          // Messages where viewing is mentioned in the rental request context
          {
            rentalRequest: {
              OR: [
                { tenantId: viewing.tenantId },
                { landlordId: viewing.property.landlord.id },
              ],
            },
          },
        ],
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    }).catch(() => []);

    // Include viewing details in response
    return NextResponse.json({
      viewing: {
        id: viewing.id,
        propertyTitle: viewing.property.title,
        tenantId: viewing.tenantId,
        tenantName: viewing.tenant.name,
        landlordId: viewing.property.landlord.id,
        landlordName: viewing.property.landlord.name,
        status: viewing.status,
      },
      messages: messages || [],
    });
  } catch (error) {
    console.error('Failed to fetch viewing messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/viewings/[id]/messages - Send a message for a viewing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: viewingId } = await params;
    const body = await request.json();
    const { message, receiverId } = body;

    if (!message || !receiverId) {
      return NextResponse.json(
        { error: 'Message and receiverId are required' },
        { status: 400 }
      );
    }

    // Get the viewing to verify access
    const viewing = await prisma.viewing.findUnique({
      where: { id: viewingId },
      include: {
        property: {
          include: {
            landlord: { select: { id: true } },
          },
        },
      },
    });

    if (!viewing) {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 });
    }

    // Verify user is either the tenant or the property landlord
    const isAuthorized =
      viewing.tenantId === session.user.id || viewing.property.landlord.id === session.user.id;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create or find a rental request to store messages
    // (using rental request as the container since Message model is tied to it)
    let rentalRequest = await prisma.rentalRequest.findFirst({
      where: {
        propertyId: viewing.propertyId,
        tenantId: viewing.tenantId,
      },
    });

    if (!rentalRequest) {
      // Create a new rental request if it doesn't exist
      // Use a default move-in date (30 days from now) for messaging purposes
      const moveInDate = new Date();
      moveInDate.setDate(moveInDate.getDate() + 30);

      rentalRequest = await prisma.rentalRequest.create({
        data: {
          propertyId: viewing.propertyId,
          tenantId: viewing.tenantId,
          landlordId: viewing.property.landlord.id,
          status: 'PENDING',
          moveInDate: moveInDate,
        },
      });
    }

    // Create the message
    const newMessage = await prisma.message.create({
      data: {
        rentalRequestId: rentalRequest.id,
        senderId: session.user.id,
        receiverId,
        content: message,
        status: 'SENT',
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
