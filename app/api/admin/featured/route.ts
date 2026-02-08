import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get only currently featured properties that are approved
    const now = new Date();
    const properties = await prisma.property.findMany({
      where: {
        isFeatured: true,
        status: 'APPROVED',
        // Include expired featured properties to show what was featured
      },
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
        isFeatured: true,
        featuredUntil: true,
        createdAt: true,
        landlord: {
          select: {
            name: true,
            email: true,
          },
        },
        images: {
          select: {
            url: true,
            isMain: true,
          },
        },
      },
      orderBy: {
        featuredUntil: 'asc', // Show expiring soon first
      },
    });

    return Response.json(properties);
  } catch (error) {
    console.error('Error fetching featured properties:', error);
    return new Response('Error fetching featured properties', { status: 500 });
  }
}
