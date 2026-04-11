import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/bookings — tenant: my bookings; landlord: bookings on their properties
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user;
    const status = request.nextUrl.searchParams.get('status') || undefined;
    const propertyId = request.nextUrl.searchParams.get('propertyId') || undefined;

    let where: Record<string, unknown> = {};

    if (role === 'TENANT') {
      where.guestId = userId;
    } else if (role === 'LANDLORD') {
      where.hostId = userId;
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;

    const bookings = await prisma.shortTermBooking.findMany({
      where,
      orderBy: { checkIn: 'asc' },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            suburb: true,
            images: { where: { isMain: true }, take: 1, select: { url: true } },
          },
        },
        guest: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bookings — tenant creates a booking request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Only tenants can create bookings' }, { status: 403 });
    }

    const body = await request.json();
    const { propertyId, checkIn, checkOut, guestNotes } = body;

    if (!propertyId || !checkIn || !checkOut) {
      return NextResponse.json({ error: 'propertyId, checkIn and checkOut are required' }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json({ error: 'checkOut must be after checkIn' }, { status: 400 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return NextResponse.json({ error: 'checkIn cannot be in the past' }, { status: 400 });
    }

    const totalNights = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Fetch property and validate
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        shortTermAvailable: true,
        shortTermPricePerNight: true,
        shortTermMinNights: true,
        shortTermMaxNights: true,
        landlordId: true,
        status: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    if (!property.shortTermAvailable) {
      return NextResponse.json({ error: 'This property does not offer short-term stays' }, { status: 400 });
    }
    if (property.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Property is not available for booking' }, { status: 400 });
    }
    if (totalNights < (property.shortTermMinNights ?? 1)) {
      return NextResponse.json({ error: `Minimum stay is ${property.shortTermMinNights} night(s)` }, { status: 400 });
    }
    if (property.shortTermMaxNights && totalNights > property.shortTermMaxNights) {
      return NextResponse.json({ error: `Maximum stay is ${property.shortTermMaxNights} night(s)` }, { status: 400 });
    }
    if (!property.shortTermPricePerNight) {
      return NextResponse.json({ error: 'Property pricing not configured' }, { status: 400 });
    }

    // Check for date overlaps with existing APPROVED or PENDING bookings
    const overlapping = await prisma.shortTermBooking.findFirst({
      where: {
        propertyId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { checkIn: { lt: checkOutDate }, checkOut: { gt: checkInDate } },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json({ error: 'Selected dates overlap with an existing booking' }, { status: 409 });
    }

    const pricePerNight = property.shortTermPricePerNight;
    const totalPrice = pricePerNight * totalNights;

    const booking = await prisma.shortTermBooking.create({
      data: {
        propertyId,
        guestId: session.user.id,
        hostId: property.landlordId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalNights,
        pricePerNight,
        totalPrice,
        guestNotes: guestNotes || null,
      },
      include: {
        property: { select: { id: true, title: true, city: true } },
        guest: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
