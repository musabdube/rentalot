import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'Only landlords can view requests' },
        { status: 403 }
      );
    }

    const requests = await prisma.rentalRequest.findMany({
      where: {
        landlordId: session.user.id,
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
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching rental requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
