import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Only tenants can request deletion' }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        deleteRequested: true,
        deleteRequestedAt: new Date(),
      },
      select: { id: true, deleteRequested: true, deleteRequestedAt: true },
    });

    return NextResponse.json({ message: 'Delete request submitted', user });
  } catch (err) {
    console.error('Error creating delete request:', err);
    return NextResponse.json({ error: 'Failed to request deletion' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Only tenants can cancel deletion request' }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { deleteRequested: false, deleteRequestedAt: null },
      select: { id: true, deleteRequested: true },
    });

    return NextResponse.json({ message: 'Delete request cancelled', user });
  } catch (err) {
    console.error('Error cancelling delete request:', err);
    return NextResponse.json({ error: 'Failed to cancel delete request' }, { status: 500 });
  }
}
