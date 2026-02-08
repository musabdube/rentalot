import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.user.role !== 'LANDLORD') return NextResponse.json({ error: 'Only landlords can delete slots' }, { status: 403 });

    const slot = await prisma.viewingSlot.findUnique({ where: { id } });
    if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 });
    if (slot.isBooked) return NextResponse.json({ error: 'Cannot delete a booked slot' }, { status: 400 });

    // Verify ownership
    const property = await prisma.property.findUnique({ where: { id: slot.propertyId } });
    if (!property || property.landlordId !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    await prisma.viewingSlot.delete({ where: { id } });
    return NextResponse.json({ message: 'Slot deleted' });
  } catch (err) {
    console.error('Error deleting slot:', err);
    return NextResponse.json({ error: 'Failed to delete slot' }, { status: 500 });
  }
}
