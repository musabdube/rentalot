import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, validateDataUrlSize } from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'Only landlords can view their properties' },
        { status: 403 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Verify the property belongs to the current landlord
    if (property.landlordId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'Only landlords can update properties' },
        { status: 403 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Verify the property belongs to the current landlord
    if (property.landlordId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      images,
      // Location
      city,
      suburb,
      street,
      nearbyLandmark,
      gpsLatitude,
      gpsLongitude,
      // Pricing
      rentAmount,
      currency,
      depositAmount,
      leaseTerm,
      negotiable,
      // Rooms
      bedrooms,
      bathrooms,
      toilets,
      lounge,
      diningRoom,
      kitchen,
      area,
      // Garden/Yard
      yardSize,
      veranda,
      fenced,
      pavedDriveway,
      // Parking
      parkingSpaces,
      garage,
      carport,
      // Water
      municipalWater,
      borehole,
      waterTank,
      tankCapacity,
      // Power
      zesaAvailable,
      solarSystem,
      solarBackupHours,
      generator,
      // Connectivity
      internetReady,
      fiberAvailable,
      wifiIncluded,
      // Security
      walled,
      electricGate,
      burglarBars,
      securityAlarm,
      guardedArea,
      neighborhoodWatch,
      // Condition
      furnished,
      recentlyRenovated,
      tiles,
      ceiling,
      builtInCupboards,
      mainBedroomEnsuite,
      petsAllowed,
      smokingAllowed,
      sharedProperty,
      sharedBathroom,
      // Student-friendly
      studentFriendly,
      nearCampus,
      campusName,
      distanceToCampus,
      walkingDistance,
      publicTransportNearby,
      sharedRoomAllowed,
      utilitiesIncluded,
      studyFriendly,
    } = body;
    
    // Debug: Log student-friendly fields
    console.log('Student-Friendly Update:', {
      studentFriendly,
      nearCampus,
      campusName,
      distanceToCampus,
      walkingDistance,
      publicTransportNearby,
      sharedRoomAllowed,
      utilitiesIncluded,
      studyFriendly,
    });

    // Determine allowed status changes from landlord: only DRAFT or PENDING
    const requestedStatus = (body as any).status;
    const allowedLandlordStatus = requestedStatus === 'DRAFT' ? 'DRAFT' : requestedStatus === 'PENDING' ? 'PENDING' : undefined;

    // Validate required fields
    if (!title || !rentAmount || !bedrooms || !bathrooms || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: title, rentAmount, bedrooms, bathrooms, city' },
        { status: 400 }
      );
    }

    // Delete existing images if new ones are provided
    let processedImages: Array<{ url: string; isMain?: boolean }> | null = null;
    if (images && Array.isArray(images)) {
      // Validate data URLs first
      for (const img of images) {
        if (typeof img?.url === 'string' && img.url.startsWith('data:')) {
          if (!validateDataUrlSize(img.url)) {
            return NextResponse.json(
              { error: 'One or more images exceed the maximum allowed size' },
              { status: 400 }
            );
          }
        }
      }

      await prisma.propertyImage.deleteMany({
        where: { propertyId: id },
      });

      // upload/process images (keep original URL if upload not configured or fails)
      processedImages = await Promise.all(
        images.map(async (image: { url: string; isMain?: boolean }, index: number) => {
          const isMain = image.isMain || index === 0;
          if (!image?.url) return { url: image.url, isMain };

          const uploaded = await uploadToCloudinary(image.url);
          return {
            url: uploaded || image.url,
            isMain,
          };
        })
      );
    }

    // Update property with all new fields
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        // Basic
        title,
        description: description || property.description,
        type: type.toUpperCase(),
        
        // Location
        city,
        suburb: suburb || property.suburb,
        street: street || property.street,
        nearbyLandmark: nearbyLandmark || property.nearbyLandmark,
        gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : property.gpsLatitude,
        gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : property.gpsLongitude,
        
        // Pricing
        rentAmount: parseInt(rentAmount),
        currency: currency || 'USD',
        depositAmount: depositAmount ? parseInt(depositAmount) : null,
        leaseTerm: leaseTerm || 'monthly',
        negotiable: negotiable || false,
        
        // Rooms
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        toilets: toilets ? parseInt(toilets) : 0,
        lounge: lounge ?? false,
        diningRoom: diningRoom ?? false,
        kitchen: kitchen ?? false,
        area: area ? parseInt(area) : null,
        
        // Garden/Yard
        yardSize: yardSize || 'small',
        veranda: veranda ?? false,
        fenced: fenced ?? false,
        pavedDriveway: pavedDriveway ?? false,
        
        // Parking
        parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : 0,
        garage: garage ?? false,
        carport: carport ?? false,
        
        // Water
        municipalWater: municipalWater ?? false,
        borehole: borehole ?? false,
        waterTank: waterTank ?? false,
        tankCapacity: tankCapacity != null ? String(tankCapacity) : null,
        
        // Power
        zesaAvailable: zesaAvailable ?? false,
        solarSystem: solarSystem ?? false,
        solarBackupHours: solarBackupHours ? parseInt(solarBackupHours) : null,
        generator: generator ?? false,
        
        // Connectivity
        internetReady: internetReady ?? false,
        fiberAvailable: fiberAvailable ?? false,
        wifiIncluded: wifiIncluded ?? false,
        
        // Security
        walled: walled ?? false,
        electricGate: electricGate ?? false,
        burglarBars: burglarBars ?? false,
        securityAlarm: securityAlarm ?? false,
        guardedArea: guardedArea ?? false,
        neighborhoodWatch: neighborhoodWatch ?? false,
        
        // Condition
        furnished: furnished || 'No',
        recentlyRenovated: recentlyRenovated ?? false,
        tiles: tiles ?? false,
        ceiling: ceiling ?? false,
        builtInCupboards: builtInCupboards ?? false,
        mainBedroomEnsuite: mainBedroomEnsuite ?? false,
        petsAllowed: petsAllowed ?? false,
        smokingAllowed: smokingAllowed ?? false,
        sharedProperty: sharedProperty ?? false,
        sharedBathroom: sharedBathroom ?? false,
        
        // Student-friendly
        studentFriendly: studentFriendly ?? false,
        nearCampus: nearCampus ?? false,
        campusName: campusName || null,
        distanceToCampus: distanceToCampus ? parseFloat(distanceToCampus) : null,
        walkingDistance: walkingDistance ?? false,
        publicTransportNearby: publicTransportNearby ?? false,
        sharedRoomAllowed: sharedRoomAllowed ?? false,
        utilitiesIncluded: utilitiesIncluded ?? false,
        studyFriendly: studyFriendly ?? false,
        
        // Images
        ...(processedImages && processedImages.length > 0 && {
          images: {
            create: processedImages.map((image: { url: string; isMain?: boolean }, index: number) => ({
              url: image.url,
              isMain: image.isMain || index === 0,
            })),
          },
        }),
        // Allow landlord to set DRAFT or PENDING when publishing/saving
        ...(allowedLandlordStatus && { status: allowedLandlordStatus }),
      },
      include: {
        images: true,
        landlord: {
          select: { name: true },
        },
      },
    });

    // If the property was verified, notify all admins about the update
    if (property.isVerified) {
      try {
        // Get all admin users
        const admins = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { id: true },
        });

        // Create notifications for all admins
        if (admins.length > 0) {
          await prisma.notification.createMany({
            data: admins.map(admin => ({
              userId: admin.id,
              title: 'Verified Property Updated',
              message: `A verified property "${updatedProperty.title}" has been updated by ${updatedProperty.landlord?.name || 'landlord'}. Please review the changes.`,
              type: 'PROPERTY_UPDATE',
              relatedId: updatedProperty.id,
              relatedType: 'PROPERTY',
            })),
          });
          console.log(`✅ Notified ${admins.length} admin(s) about verified property update: ${updatedProperty.title}`);
        }
      } catch (notificationError) {
        console.error('Failed to create admin notifications:', notificationError);
        // Don't fail the update if notification creation fails
      }
    }

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'Only landlords can delete properties' },
        { status: 403 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Verify the property belongs to the current landlord
    if (property.landlordId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete images first (due to foreign key constraint)
    await prisma.propertyImage.deleteMany({
      where: { propertyId: id },
    });

    // Delete property
    await prisma.property.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}
