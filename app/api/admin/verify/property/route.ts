import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, verified } = body;

    if (!propertyId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    const property = await prisma.property.update({
      where: { id: propertyId },
      data: {
        isVerified: verified,
        ...(verified ? { status: 'ACTIVE', available: true } : {}),
      },
      include: {
        landlord: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({
      message: `Property ${verified ? 'verified' : 'unverified'} successfully`,
      property,
    });
  } catch (error) {
    console.error('Error verifying property:', error);
    return NextResponse.json(
      { error: 'Failed to verify property' },
      { status: 500 }
    );
  }
}
