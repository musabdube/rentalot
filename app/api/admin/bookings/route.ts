import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/bookings — admin view of all short-term bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = request.nextUrl.searchParams.get('status') || undefined;
    const propertyId = request.nextUrl.searchParams.get('propertyId') || undefined;
    const guestId = request.nextUrl.searchParams.get('guestId') || undefined;
    const from = request.nextUrl.searchParams.get('from') || undefined;
    const to = request.nextUrl.searchParams.get('to') || undefined;
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (propertyId) where.propertyId = propertyId;
    if (guestId) where.guestId = guestId;
    if (from || to) {
      where.checkIn = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    const [total, bookings] = await prisma.$transaction([
      prisma.shortTermBooking.count({ where }),
      prisma.shortTermBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
      }),
    ]);

    return NextResponse.json({ bookings, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('GET /api/admin/bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
