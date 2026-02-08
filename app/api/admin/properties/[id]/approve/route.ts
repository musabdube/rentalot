import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can approve properties' }, { status: 403 });
    }

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const updated = await prisma.property.update({
      where: { id },
      data: { status: 'ACTIVE', available: true },
    });

    // Optionally create a notification for landlord
    try {
      await prisma.notification.create({
        data: {
          userId: property.landlordId,
          title: 'Property Approved',
          message: `Your property "${updated.title}" has been approved and is now active.`,
          type: 'PROPERTY_APPROVED',
          relatedId: updated.id,
          relatedType: 'PROPERTY',
        },
      });
    } catch (e) {
      console.error('Failed to create approval notification', e);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error approving property:', error);
    return NextResponse.json({ error: 'Failed to approve property' }, { status: 500 });
  }
}
