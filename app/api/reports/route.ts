import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { type, reason, description, propertyId, userId } = await request.json();

    if (!type || !description) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    if (!['SCAM', 'SPAM', 'FAKE_LISTING', 'INAPPROPRIATE', 'FAKE_PROFILE', 'OTHER'].includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid report type' }), { status: 400 });
    }

    // Validate that property or user exists
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (!property) {
        return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404 });
      }
    }

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      }
    }

    const report = await (prisma.report as any).create({
      data: {
        reportedBy: session.user.id,
        type,
        reason: reason || description,
        description: description || reason,
        propertyId: propertyId || null,
        userId: userId || null,
        status: 'PENDING',
      },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return Response.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return new Response(JSON.stringify({ error: 'Error creating report' }), { status: 500 });
  }
}
