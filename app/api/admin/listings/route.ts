import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Get approved/active properties available for featuring
    const listings = await prisma.property.findMany({
      where: {
        available: true,
        status: { in: ['APPROVED', 'ACTIVE'] },
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
        status: true,
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
        isFeatured: 'desc',
      },
    });

    const formatted = listings.map((listing) => ({
      ...listing,
      price: listing.rentAmount,
      location: [listing.street, listing.suburb, listing.city].filter(Boolean).join(', '),
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error('Error fetching listings:', error);
    return new Response('Error fetching listings', { status: 500 });
  }
}
