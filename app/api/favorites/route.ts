import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // Return 200 with a clear unauthenticated shape for anonymous users
      return NextResponse.json({ authenticated: false, favorites: [] }, { status: 200 });
    }

    const favorites = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        favoritedProperties: {
          include: {
            images: { where: { isMain: true } },
            landlord: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({ authenticated: true, favorites: favorites?.favoritedProperties || [] });
  } catch (error) {
    console.error('Fetch favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await req.json();

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Add to favorites
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        favoritedProperties: {
          connect: { id: propertyId },
        },
      },
    });

    return NextResponse.json(
      { message: 'Added to favorites' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await req.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        favoritedProperties: {
          disconnect: { id: propertyId },
        },
      },
    });

    return NextResponse.json(
      { message: 'Removed from favorites' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
