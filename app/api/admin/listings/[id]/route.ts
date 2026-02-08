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
    const listing = await prisma.property.findUnique({
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

    if (!listing) {
      return new Response('Listing not found', { status: 404 });
    }

    return Response.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return new Response('Error fetching listing', { status: 500 });
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
    const body = await request.json();
    const { isFeatured, daysToFeature = 30, status } = body;

    let updateData: any = {};

    // Handle status update (activate/reject property)
    if (status) {
      if (status === 'ACTIVE' || status === 'APPROVED') {
        updateData.status = 'ACTIVE';
      } else if (status === 'REJECTED') {
        updateData.status = 'REJECTED';
      }
    }

    // Handle featured status update
    if (isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;

      if (isFeatured) {
        // Calculate featured until date
        const featuredUntil = new Date();
        featuredUntil.setDate(featuredUntil.getDate() + daysToFeature);
        updateData.featuredUntil = featuredUntil;
      } else {
        // Remove featured until date
        updateData.featuredUntil = null;
      }
    }

    const listing = await prisma.property.update({
      where: { id },
      data: updateData,
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

    return Response.json(listing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return new Response('Error updating listing', { status: 500 });
  }
}
