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
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            title: true,
            landlord: {
              select: {
                name: true,
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
    });

    if (!report) {
      return new Response('Report not found', { status: 404 });
    }

    return Response.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    return new Response('Error fetching report', { status: 500 });
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
    const { status, adminNotes } = await request.json();

    if (!['PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED', 'ACTION_TAKEN'].includes(status)) {
      return new Response('Invalid status', { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        adminNotes,
      },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
        property: {
          select: {
            title: true,
            landlord: {
              select: {
                name: true,
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
    });

    return Response.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return new Response('Error updating report', { status: 500 });
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
    await prisma.report.delete({
      where: { id },
    });

    return new Response('Report deleted', { status: 200 });
  } catch (error) {
    console.error('Error deleting report:', error);
    return new Response('Error deleting report', { status: 500 });
  }
}
