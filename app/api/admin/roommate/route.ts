import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/roommate – admin overview of all roommate listings + activity stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = 20;

    const where = status ? { status: status as never } : {};

    const [listings, total, pendingCount, messageCount] = await Promise.all([
      prisma.roommateListing.findMany({
        where,
        include: {
          tenant: { select: { id: true, name: true, email: true, avatar: true, verificationStatus: true } },
          property: { select: { id: true, title: true, city: true } },
          _count: { select: { messages: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.roommateListing.count({ where }),
      prisma.roommateListing.count({ where: { status: 'PENDING' } }),
      prisma.roommateMessage.count(),
    ]);

    return NextResponse.json({ listings, total, pendingCount, messageCount, page, limit });
  } catch (err) {
    console.error('GET /api/admin/roommate', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/admin/roommate – approve / reject / flag a listing
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, adminNote } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const allowed = ['APPROVED', 'ACTIVE', 'REJECTED', 'INACTIVE', 'PENDING'];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.roommateListing.update({
      where: { id },
      data: { status, adminNote: adminNote ?? null },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/admin/roommate', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
