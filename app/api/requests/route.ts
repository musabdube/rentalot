import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Only tenants can create rental requests' },
        { status: 403 }
      );
    }

    const { propertyId, moveInDate, moveOutDate, tenantPhone, tenantEmail, tenantOccupation, tenantIncome, tenantEmployer, tenantReferences, tenantNotes } = await req.json();

    // Validate required fields
    if (!propertyId || !moveInDate) {
      return NextResponse.json(
        { error: 'Property ID and move-in date are required' },
        { status: 400 }
      );
    }

    // Validate property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { 
        id: true, 
        landlordId: true, 
        status: true,
        availabilityStatus: true,
        available: true,
      },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if property listing is active
    if (property.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This property listing is not active' },
        { status: 400 }
      );
    }

    // Check if property is available for rental
    if (property.availabilityStatus !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'This property is not currently available for rental' },
        { status: 400 }
      );
    }

    // Check if tenant already has a pending request for this property
    const existingRequest = await prisma.rentalRequest.findFirst({
      where: {
        propertyId,
        tenantId: session.user.id,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this property' },
        { status: 400 }
      );
    }

    // Create rental request
    const rentalRequest = await prisma.rentalRequest.create({
      data: {
        propertyId,
        tenantId: session.user.id,
        landlordId: property.landlordId,
        moveInDate: new Date(moveInDate),
        moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
        tenantPhone: tenantPhone || null,
        tenantEmail: tenantEmail || null,
        tenantOccupation: tenantOccupation || null,
        tenantIncome: tenantIncome || null,
        tenantEmployer: tenantEmployer || null,
        tenantReferences: tenantReferences || null,
        tenantNotes: tenantNotes || null,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            suburb: true,
            street: true,
            type: true,
            rentAmount: true,
            currency: true,
            images: { where: { isMain: true } },
          },
        },
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            verificationStatus: true,
          },
        },
      },
    });

    return NextResponse.json(rentalRequest, { status: 201 });
  } catch (error) {
    console.error('Create rental request error:', error);
    return NextResponse.json(
      { error: 'Failed to create rental request' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get requests based on user role
    let requests;

    if (session.user.role === 'TENANT') {
      requests = await prisma.rentalRequest.findMany({
        where: { tenantId: session.user.id },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              suburb: true,
              street: true,
              type: true,
              rentAmount: true,
              currency: true,
              images: { where: { isMain: true }, take: 1 },
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              verificationStatus: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (session.user.role === 'LANDLORD') {
      requests = await prisma.rentalRequest.findMany({
        where: { landlordId: session.user.id },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              suburb: true,
              street: true,
              type: true,
              rentAmount: true,
              currency: true,
            },
          },
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              verificationStatus: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(requests || []);
  } catch (error) {
    console.error('Fetch rental requests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental requests' },
      { status: 500 }
    );
  }
}

