import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/roommate/listings – browse all approved/active listings (public), or own listing for tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = request.nextUrl;
    const own = searchParams.get('own') === 'true';
    const location = searchParams.get('location') ?? '';
    const maxBudget = searchParams.get('maxBudget');

    if (own) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const listings = await prisma.roommateListing.findMany({
        where: { tenantId: session.user.id },
        include: {
          property: { select: { id: true, title: true, city: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(listings);
    }

    // Public browse – only APPROVED / ACTIVE
    const where: Record<string, unknown> = {
      status: { in: ['APPROVED', 'ACTIVE'] },
    };
    if (location) {
      where.preferredLocation = { contains: location, mode: 'insensitive' };
    }
    if (maxBudget) {
      where.budget = { lte: Number(maxBudget) };
    }

    const listings = await prisma.roommateListing.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true, avatar: true, verificationStatus: true } },
        property: { select: { id: true, title: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(listings);
  } catch (err) {
    console.error('GET /api/roommate/listings', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/roommate/listings – tenant creates a listing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Both tenants AND landlords can post roommate listings (tenants searching for roommates)
    const body = await request.json();
    const {
      title, bio, budget, currency = 'USD',
      preferredLocation, moveInDate, moveOutDate,
      smoking, pets, studyFriendly, nightOwl, earlyBird,
      cleanliness, gender, occupation, propertyId,
    } = body;

    if (!title || !bio || !budget || !preferredLocation || !moveInDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent duplicate active listing
    const existing = await prisma.roommateListing.findFirst({
      where: {
        tenantId: session.user.id,
        status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'You already have an active roommate listing. Please update or remove it first.' },
        { status: 409 },
      );
    }

    const listing = await prisma.roommateListing.create({
      data: {
        tenantId: session.user.id,
        title,
        bio,
        budget: Number(budget),
        currency,
        preferredLocation,
        moveInDate: new Date(moveInDate),
        moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
        smoking: Boolean(smoking),
        pets: Boolean(pets),
        studyFriendly: Boolean(studyFriendly),
        nightOwl: Boolean(nightOwl),
        earlyBird: Boolean(earlyBird),
        cleanliness: cleanliness ?? null,
        gender: gender ?? null,
        occupation: occupation ?? null,
        propertyId: propertyId ?? null,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    console.error('POST /api/roommate/listings', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
