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
      return NextResponse.json({ error: 'Only admins can reject properties' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || null;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return NextResponse.json({ error: 'Property not found' }, { status: 404 });

    const updated = await prisma.property.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    // Optionally persist rejection reason as a notification to landlord
    try {
      await prisma.notification.create({
        data: {
          userId: property.landlordId,
          title: 'Property Rejected',
          message: `Your property "${updated.title}" was rejected.${reason ? ' Reason: ' + reason : ''}`,
          type: 'PROPERTY_REJECTED',
          relatedId: updated.id,
          relatedType: 'PROPERTY',
        },
      });
    } catch (e) {
      console.error('Failed to create rejection notification', e);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error rejecting property:', error);
    return NextResponse.json({ error: 'Failed to reject property' }, { status: 500 });
  }
}
