import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
        landlord: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!property) {
      return new Response('Property not found', { status: 404 });
    }

    return Response.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return new Response('Error fetching property', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  try {
    const { status, isPinned, isFeatured, featureRequested, pinRequested } = await request.json();

    if (status && !['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE'].includes(status)) {
      return new Response('Invalid status', { status: 400 });
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(isPinned !== undefined && {
          isPinned: Boolean(isPinned),
          pinnedAt: isPinned ? new Date() : null,
        }),
        ...(isFeatured !== undefined && {
          isFeatured: Boolean(isFeatured),
          featuredUntil: isFeatured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
        }),
        ...(featureRequested !== undefined && {
          featureRequested: Boolean(featureRequested),
          featureRequestedAt: featureRequested ? new Date() : null,
        }),
        ...(pinRequested !== undefined && {
          pinRequested: Boolean(pinRequested),
          pinRequestedAt: pinRequested ? new Date() : null,
        }),
      },
      include: {
        images: true,
        landlord: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return Response.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return new Response('Error updating property', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete property images first
    await prisma.propertyImage.deleteMany({
      where: { propertyId: id },
    });

    // Delete related rental requests and messages
    const rentalRequests = await prisma.rentalRequest.findMany({
      where: { propertyId: id },
    });

    for (const rentalRequest of rentalRequests) {
      await prisma.message.deleteMany({
        where: { rentalRequestId: rentalRequest.id },
      });
    }

    await prisma.rentalRequest.deleteMany({
      where: { propertyId: id },
    });

    // Delete property
    await prisma.property.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Property deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error deleting property:', error);
    return new Response(JSON.stringify({ error: 'Error deleting property' }), { status: 500 });
  }
}
