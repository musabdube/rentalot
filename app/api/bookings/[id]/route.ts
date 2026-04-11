import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/bookings/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.shortTermBooking.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true, title: true, city: true, suburb: true,
            images: { where: { isMain: true }, take: 1, select: { url: true } },
          },
        },
        guest: { select: { id: true, name: true, email: true, phone: true } },
        host: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { role, id: userId } = session.user;
    const isAdmin = role === 'ADMIN';
    const isGuest = booking.guestId === userId;
    const isHost = booking.hostId === userId;

    if (!isAdmin && !isGuest && !isHost) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('GET /api/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/bookings/[id] — approve / reject / cancel
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.shortTermBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const { role, id: userId } = session.user;
    const isAdmin = role === 'ADMIN';
    const isGuest = booking.guestId === userId;
    const isHost = booking.hostId === userId;

    if (!isAdmin && !isGuest && !isHost) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, hostNotes, rejectionNote } = body;

    const validActions = ['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Permission checks per action
    if (action === 'APPROVED' || action === 'REJECTED') {
      if (!isHost && !isAdmin) {
        return NextResponse.json({ error: 'Only the host or admin can approve/reject' }, { status: 403 });
      }
      if (booking.status !== 'PENDING') {
        return NextResponse.json({ error: 'Can only approve/reject PENDING bookings' }, { status: 400 });
      }
    }

    if (action === 'CANCELLED') {
      if (!isGuest && !isHost && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (!['PENDING', 'APPROVED'].includes(booking.status)) {
        return NextResponse.json({ error: 'Can only cancel PENDING or APPROVED bookings' }, { status: 400 });
      }
    }

    if (action === 'COMPLETED') {
      if (!isHost && !isAdmin) {
        return NextResponse.json({ error: 'Only the host or admin can mark as completed' }, { status: 403 });
      }
      if (booking.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Can only complete APPROVED bookings' }, { status: 400 });
      }
    }

    const updated = await prisma.shortTermBooking.update({
      where: { id },
      data: {
        status: action,
        ...(hostNotes !== undefined && { hostNotes }),
        ...(rejectionNote !== undefined && { rejectionNote }),
      },
      include: {
        property: { select: { id: true, title: true } },
        guest: { select: { id: true, name: true, email: true } },
        host: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ booking: updated });
  } catch (error) {
    console.error('PATCH /api/bookings/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
