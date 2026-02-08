import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get unverified properties
    const unverifiedProperties = await prisma.property.findMany({
      where: { isVerified: false },
      include: {
        images: { select: { url: true, isMain: true } },
        landlord: { select: { id: true, name: true, email: true, verificationStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get unverified tenants (users with TENANT role)
    const unverifiedTenants = await prisma.user.findMany({
      where: {
        role: 'TENANT',
        verificationStatus: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        bio: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            rentalRequestsAsTenant: true,
            favoritedProperties: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get unverified landlords
    const unverifiedLandlords = await prisma.user.findMany({
      where: {
        role: 'LANDLORD',
        verificationStatus: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        bio: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            propertiesOwned: true,
            rentalRequestsAsLandlord: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      unverifiedProperties: unverifiedProperties.map((prop) => ({
        ...prop,
        imageUrl: prop.images.find((img: any) => img.isMain)?.url || prop.images[0]?.url || null,
      })),
      unverifiedTenants,
      unverifiedLandlords,
      stats: {
        totalUnverifiedProperties: unverifiedProperties.length,
        totalUnverifiedTenants: unverifiedTenants.length,
        totalUnverifiedLandlords: unverifiedLandlords.length,
      },
    });
  } catch (error) {
    console.error('Error fetching unverified items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unverified items' },
      { status: 500 }
    );
  }
}
