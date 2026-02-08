import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

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
    const where: any = {};
    if (status) where.status = status;

    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        city: true,
        suburb: true,
        street: true,
        rentAmount: true,
        bedrooms: true,
        bathrooms: true,
        type: true,
        status: true,
        isPinned: true,
        pinnedAt: true,
        isFeatured: true,
        featuredUntil: true,
        featureRequested: true,
        featureRequestedAt: true,
        pinRequested: true,
        pinRequestedAt: true,
        createdAt: true,
        images: {
          select: {
            id: true,
            url: true,
            isMain: true,
            caption: true,
          },
        },
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { pinnedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 200,
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching admin properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
