import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'Only landlords can update requests' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Verify the request belongs to the current landlord
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id },
    });

    if (!rentalRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (rentalRequest.landlordId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update request
    const updatedRequest = await prisma.rentalRequest.update({
      where: { id },
      data: {
        status,
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
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error updating rental request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id },
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
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!rentalRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (rentalRequest.landlordId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(rentalRequest);
  } catch (error) {
    console.error('Error fetching rental request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}
