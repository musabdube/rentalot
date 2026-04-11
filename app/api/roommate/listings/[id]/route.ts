import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/roommate/listings/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const listing = await prisma.roommateListing.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, name: true, avatar: true, verificationStatus: true, bio: true } },
        property: { select: { id: true, title: true, city: true, suburb: true, rentAmount: true } },
        _count: { select: { messages: true } },
      },
    });
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(listing);
  } catch (err) {
    console.error('GET /api/roommate/listings/[id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/roommate/listings/[id] – owner or admin can update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listing = await prisma.roommateListing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isOwner = listing.tenantId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Admins can change status; owners can update listing details
    if (isAdmin) {
      const updated = await prisma.roommateListing.update({
        where: { id },
        data: {
          status: body.status ?? listing.status,
          adminNote: body.adminNote ?? listing.adminNote,
        },
      });
      return NextResponse.json(updated);
    }

    const {
      title, bio, budget, currency, preferredLocation,
      moveInDate, moveOutDate, smoking, pets, studyFriendly,
      nightOwl, earlyBird, cleanliness, gender, occupation, propertyId,
    } = body;

    const updated = await prisma.roommateListing.update({
      where: { id },
      data: {
        title: title ?? listing.title,
        bio: bio ?? listing.bio,
        budget: budget != null ? Number(budget) : listing.budget,
        currency: currency ?? listing.currency,
        preferredLocation: preferredLocation ?? listing.preferredLocation,
        moveInDate: moveInDate ? new Date(moveInDate) : listing.moveInDate,
        moveOutDate: moveOutDate ? new Date(moveOutDate) : listing.moveOutDate,
        smoking: smoking != null ? Boolean(smoking) : listing.smoking,
        pets: pets != null ? Boolean(pets) : listing.pets,
        studyFriendly: studyFriendly != null ? Boolean(studyFriendly) : listing.studyFriendly,
        nightOwl: nightOwl != null ? Boolean(nightOwl) : listing.nightOwl,
        earlyBird: earlyBird != null ? Boolean(earlyBird) : listing.earlyBird,
        cleanliness: cleanliness ?? listing.cleanliness,
        gender: gender ?? listing.gender,
        occupation: occupation ?? listing.occupation,
        propertyId: propertyId !== undefined ? propertyId : listing.propertyId,
        // Reset to PENDING so admin re-reviews after edits
        status: 'PENDING',
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PUT /api/roommate/listings/[id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/roommate/listings/[id] – owner or admin
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listing = await prisma.roommateListing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const isOwner = listing.tenantId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.roommateListing.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/roommate/listings/[id]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
