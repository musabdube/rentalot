import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/messages - Fetch messages for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Handle admin messages
      if (conversationId === 'admin-messages') {
        const messages = await prisma.message.findMany({
          where: {
            rentalRequestId: null,
            OR: [
              { senderId: session.user.id },
              { receiverId: session.user.id },
            ],
          },
          include: {
              sender: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
              receiver: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
            },
          orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json(messages);
      }

      // Get messages for a specific conversation
      const messages = await prisma.message.findMany({
        where: {
          rentalRequestId: conversationId,
          OR: [
            { senderId: session.user.id },
            { receiverId: session.user.id },
          ],
        },
        include: {
          sender: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
          receiver: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
        },
        orderBy: { createdAt: 'asc' },
      });

      return NextResponse.json(messages);
    }

    // Get all conversations (grouped by rental request)
    const conversations = await prisma.rentalRequest.findMany({
      where: {
        OR: [
          { tenantId: session.user.id },
          { landlordId: session.user.id },
        ],
      },
      select: {
        id: true,
        propertyId: true,
        tenantId: true,
        landlordId: true,
        property: { select: { title: true } },
        tenant: { select: { id: true, name: true, avatar: true, email: true, verificationStatus: true } },
        landlord: { select: { id: true, name: true, avatar: true, email: true, verificationStatus: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Transform conversations to include unread count
    const formattedConversations = conversations.map((conv) => ({
      ...conv,
      unreadCount: conv.messages.filter(
        (m) => m.receiverId === session.user.id && m.status !== 'READ'
      ).length,
      lastMessage: conv.messages[0],
    }));

    // Get admin messages (messages with null rentalRequestId sent to this user)
    const adminMessages = await prisma.message.findMany({
      where: {
        rentalRequestId: null,
        receiverId: session.user.id,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
        receiver: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Create a virtual conversation for admin messages if any exist
    if (adminMessages.length > 0) {
      const last = adminMessages[0];
      const adminConversation = {
        id: 'admin-messages',
        propertyId: '',
        tenantId: '',
        landlordId: '',
        // provide a minimal property object to match the selected shape { title: string }
        property: { title: 'Admin Messages' },
        // provide minimal tenant/landlord objects matching the selected shapes
        tenant: { id: '', name: '', avatar: null, email: '', verificationStatus: false },
        landlord: { id: '', name: '', avatar: null, email: '', verificationStatus: false },
        // include the last message in the messages array so shape matches other conversations
        messages: [last],
        unreadCount: adminMessages.filter((m) => m.status !== 'READ').length,
        // use the full message object (includes sender.id) to satisfy expected type
        lastMessage: last,
        isAdminMessages: true,
      };

      formattedConversations.unshift(adminConversation);
    }

    return NextResponse.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rentalRequestId, receiverId, content } = body;

    if (!rentalRequestId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to find existing rental request or create one for inquiries/admin reports
    let rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id: rentalRequestId },
    });

    // If rental request doesn't exist and this is an inquiry (starts with "inquiry-"), create it
    if (!rentalRequest && rentalRequestId.startsWith('inquiry-')) {
      const propertyId = rentalRequestId.replace('inquiry-', '');
      
      // Get property details to find landlord
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      // Create rental request for inquiry
      rentalRequest = await prisma.rentalRequest.create({
        data: {
          id: rentalRequestId,
          propertyId,
          tenantId: session.user.id,
          landlordId: property.landlordId,
          status: 'PENDING', // Use PENDING for inquiries
          moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
    }

    // If rental request doesn't exist and this is an admin report (starts with "admin-report-"), create it
    if (!rentalRequest && rentalRequestId.startsWith('admin-report-')) {
      const reportId = rentalRequestId.replace('admin-report-', '');
      
      // Get report to find property and landlord
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          property: true,
        },
      });

      if (!report || !report.property) {
        return NextResponse.json(
          { error: 'Report or property not found' },
          { status: 404 }
        );
      }

      // Create rental request for admin message
      rentalRequest = await prisma.rentalRequest.create({
        data: {
          id: rentalRequestId,
          propertyId: report.property.id,
          tenantId: session.user.id, // Admin is sending as tenant for this purpose
          landlordId: report.property.landlordId,
          status: 'PENDING',
          moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
    }

    // If rental request doesn't exist and this is an admin property message (starts with "admin-property-"), create it
    if (!rentalRequest && rentalRequestId.startsWith('admin-property-')) {
      const propertyId = rentalRequestId.replace('admin-property-', '');
      
      // Get property to find landlord
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      if (!adminUser) {
        return NextResponse.json(
          { error: 'Admin user not found' },
          { status: 404 }
        );
      }

      // Create rental request for admin message
      rentalRequest = await prisma.rentalRequest.create({
        data: {
          id: rentalRequestId,
          propertyId,
          tenantId: adminUser.id,
          landlordId: property.landlordId,
          status: 'PENDING',
          moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      });
    }

    if (!rentalRequest) {
      return NextResponse.json(
        { error: 'Rental request not found' },
        { status: 404 }
      );
    }

    // For admin messages, check if user is admin or involved in the rental
    if (rentalRequestId.startsWith('admin-report-') || rentalRequestId.startsWith('admin-property-')) {
      if (session.user?.role !== 'ADMIN' && rentalRequest.landlordId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to send admin messages' },
          { status: 401 }
        );
      }
    } else {
      if (
        rentalRequest.tenantId !== session.user.id &&
        rentalRequest.landlordId !== session.user.id
      ) {
        return NextResponse.json(
          { error: 'Unauthorized to message in this conversation' },
          { status: 401 }
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        rentalRequestId: rentalRequest.id,
        senderId: session.user.id,
        receiverId: rentalRequest.landlordId === session.user.id ? rentalRequest.tenantId : rentalRequest.landlordId,
        content,
        status: 'SENT',
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
        receiver: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
      },
    });

    // Update rental request updated timestamp
    await prisma.rentalRequest.update({
      where: { id: rentalRequest.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PATCH /api/messages - Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const messageId = searchParams.get('id');
    const conversationId = searchParams.get('conversationId');

    if (messageId) {
      // Mark specific message as read
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }

      if (message.receiverId !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to mark this message as read' },
          { status: 401 }
        );
      }

      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { status: 'READ', readAt: new Date() },
        include: {
          sender: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
          receiver: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
        },
      });

      return NextResponse.json(updatedMessage);
    }

    if (conversationId) {
      // Mark all messages in a conversation as read
      await prisma.message.updateMany({
        where: {
          rentalRequestId: conversationId,
          receiverId: session.user.id,
          status: { not: 'READ' },
        },
        data: { status: 'READ', readAt: new Date() },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'No message or conversation ID provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
