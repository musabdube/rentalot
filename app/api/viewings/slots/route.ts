import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/viewings/slots?propertyId=&date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const propertyId = searchParams.get('propertyId');
    const date = searchParams.get('date');

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 });
    }

    const where: any = { propertyId };

    if (date) {
      const start = new Date(date + 'T00:00:00.000Z');
      const end = new Date(date + 'T23:59:59.999Z');
      where.date = { gte: start, lte: end };
    }

    const slots = await prisma.viewingSlot.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(slots);
  } catch (err) {
    console.error('Error fetching slots:', err);
    return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 });
  }
}

// POST - landlord creates a slot
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'LANDLORD') return NextResponse.json({ error: 'Only landlords can create slots' }, { status: 403 });

    const body = await request.json();
    const { propertyId, date, startTime, endTime } = body;

    if (!propertyId || !date || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure landlord owns property
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.landlordId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized or property not found' }, { status: 403 });
    }

    const slotDate = new Date(date + 'T00:00:00.000Z');

    const slot = await prisma.viewingSlot.create({
      data: {
        propertyId,
        date: slotDate,
        startTime,
        endTime,
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (err) {
    console.error('Error creating slot:', err);
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 });
  }
}
