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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify the request belongs to the current tenant
    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id },
    });

    if (!rentalRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (rentalRequest.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only tenants can cancel their own pending requests
    if (status === 'CANCELLED' && rentalRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only cancel pending requests' },
        { status: 400 }
      );
    }

    // Update request
    const updatedRequest = await prisma.rentalRequest.update({
      where: { id },
      data: { status },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            suburb: true,
            street: true,
            type: true,
            rentAmount: true,
            currency: true,
            images: { where: { isMain: true }, take: 1 },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            verificationStatus: true,
            avatar: true,
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

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
            type: true,
            rentAmount: true,
            currency: true,
            bedrooms: true,
            bathrooms: true,
            area: true,
            images: { take: 10 },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            verificationStatus: true,
            avatar: true,
          },
        },
      },
    });

    if (!rentalRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check authorization - tenant or landlord only
    if (
      rentalRequest.tenantId !== session.user.id &&
      rentalRequest.landlordId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
      where: { id },
    });

    if (!rentalRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Only tenant can delete their own request or landlord can delete any request from their properties
    if (
      rentalRequest.tenantId !== session.user.id &&
      rentalRequest.landlordId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.rentalRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rental request:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}
