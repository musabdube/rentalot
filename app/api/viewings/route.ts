import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get viewings for the user
    const viewings = await prisma.viewing.findMany({
      where: {
        OR: [
          { tenantId: session.user.id },
          {
            property: {
              landlordId: session.user.id,
            },
          },
        ],
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            suburb: true,
            street: true,
            rentAmount: true,
            landlord: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { preferredDate: 'asc' },
    });

    return NextResponse.json(viewings);
  } catch (error) {
    console.error('Error fetching viewings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch viewings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      propertyId,
      visitorName,
      visitorEmail,
      visitorPhone,
      preferredDate,
      preferredTime,
      notes,
    } = body;

    // Validate required fields
    if (
      !propertyId ||
      !visitorName ||
      !visitorEmail ||
      !visitorPhone ||
      !preferredDate ||
      !preferredTime
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if viewing already exists for same date and time
    const existingViewing = await prisma.viewing.findFirst({
      where: {
        propertyId,
        preferredDate,
        preferredTime,
      },
    });

    if (existingViewing) {
      return NextResponse.json(
        { error: 'This time slot is already booked' },
        { status: 409 }
      );
    }

    // If slotId provided, ensure slot exists and is not booked, then create viewing and mark slot booked
    const slotId = (body as any).slotId as string | undefined;

    if (slotId) {
      const slot = await prisma.viewingSlot.findUnique({ where: { id: slotId } });
      if (!slot) {
        return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
      }
      if (slot.isBooked) {
        return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
      }
      if (slot.propertyId !== propertyId) {
        return NextResponse.json({ error: 'Slot does not belong to this property' }, { status: 400 });
      }

      const viewing = await prisma.viewing.create({
        data: {
          propertyId,
          tenantId: session.user.id,
          visitorName,
          visitorEmail,
          visitorPhone,
          preferredDate,
          preferredTime,
          notes: notes || null,
          status: 'PENDING',
        },
        include: {
          property: {
            select: { title: true, city: true, suburb: true, street: true },
          },
        },
      });

      // mark slot booked
      await prisma.viewingSlot.update({ where: { id: slotId }, data: { isBooked: true, bookingId: viewing.id } });

      return NextResponse.json(viewing, { status: 201 });
    }

    // Create viewing without slot
    const viewing = await prisma.viewing.create({
      data: {
        propertyId,
        tenantId: session.user.id,
        visitorName,
        visitorEmail,
        visitorPhone,
        preferredDate,
        preferredTime,
        notes: notes || null,
        status: 'PENDING',
      },
      include: {
        property: {
          select: {
            title: true,
            city: true,
            suburb: true,
            street: true,
          },
        },
      },
    });

    return NextResponse.json(viewing, { status: 201 });
  } catch (error) {
    console.error('Error creating viewing:', error);
    return NextResponse.json(
      { error: 'Failed to create viewing' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const viewingId = searchParams.get('id');
    const body = await request.json();
    const { status } = body;

    if (!viewingId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get viewing to check ownership
    const viewing = await prisma.viewing.findUnique({
      where: { id: viewingId },
      include: { property: true },
    });

    if (!viewing) {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 });
    }

    // Check if user is landlord or tenant
    if (
      session.user.role === 'LANDLORD' &&
      viewing.property.landlordId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      session.user.role === 'TENANT' &&
      viewing.tenantId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updatedViewing = await prisma.viewing.update({
      where: { id: viewingId },
      data: { status },
      include: {
        property: {
          select: {
            title: true,
            city: true,
            suburb: true,
            street: true,
          },
        },
      },
    });

    return NextResponse.json(updatedViewing);
  } catch (error) {
    console.error('Error updating viewing:', error);
    return NextResponse.json(
      { error: 'Failed to update viewing' },
      { status: 500 }
    );
  }
}
