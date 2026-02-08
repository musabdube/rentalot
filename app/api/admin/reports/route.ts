import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      select: {
        id: true,
        type: true,
        reason: true,
        description: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            suburb: true,
            street: true,
            rentAmount: true,
            bedrooms: true,
            bathrooms: true,
            area: true,
            type: true,
            landlord: {
              select: {
                id: true,
                name: true,
              },
            },
            images: {
              select: {
                id: true,
                url: true,
                isMain: true,
                caption: true,
              },
            },
          },
        },
        reportedUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return new Response('Error fetching reports', { status: 500 });
  }
}
