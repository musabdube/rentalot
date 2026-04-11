import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST /api/tenant/switch-role  – allow a TENANT to switch to LANDLORD
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Only tenants can switch to landlord' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: 'LANDLORD' },
    });

    return NextResponse.json({ success: true, newRole: 'LANDLORD' });
  } catch (err) {
    console.error('POST /api/tenant/switch-role', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
