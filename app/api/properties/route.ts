import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToCloudinary, validateDataUrlSize } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only landlords can create properties
    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'Only landlords can create properties' },
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
      shortTermAvailable,
      shortTermPricePerNight,
      shortTermMinNights,
      shortTermMaxNights,
      status,
      saveAsDraft,
    } = body;

    // Validate required fields
    if (!title || !rentAmount || !bedrooms || !bathrooms || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: title, rentAmount, bedrooms, bathrooms, city' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      );
    }

    // Validate data-URL sizes and upload/process images (keep original URL if upload not configured or fails)
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

    const processedImages = await Promise.all(
      images.map(async (image: { url: string; isMain?: boolean }, index: number) => {
        const isMain = image.isMain || index === 0;
        if (!image?.url) return { url: image.url, isMain };

        // Attempt upload; Cloudinary accepts remote URLs and data URLs as `file`
        const uploaded = await uploadToCloudinary(image.url);
        return {
          url: uploaded || image.url,
          isMain,
        };
      })
    );

    // Determine status: allow landlord to save as draft
    const finalStatus = (typeof status === 'string' && status === 'DRAFT') || saveAsDraft ? 'DRAFT' : 'PENDING';

    // Create property with all new fields
    const property = await prisma.property.create({
      data: {
        // Basic
        title,
        description: description || '',
        type: type.toUpperCase(),
        
        // Location
        city,
        suburb: suburb || '',
        street: street || '',
        nearbyLandmark: nearbyLandmark || '',
        gpsLatitude: gpsLatitude ? parseFloat(gpsLatitude) : null,
        gpsLongitude: gpsLongitude ? parseFloat(gpsLongitude) : null,
        
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
        lounge: lounge || false,
        diningRoom: diningRoom || false,
        kitchen: kitchen || false,
        area: area ? parseInt(area) : null,
        
        // Garden/Yard
        yardSize: yardSize || 'small',
        veranda: veranda || false,
        fenced: fenced || false,
        pavedDriveway: pavedDriveway || false,
        
        // Parking
        parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : 0,
        garage: garage || false,
        carport: carport || false,
        
        // Water
        municipalWater: municipalWater || false,
        borehole: borehole || false,
        waterTank: waterTank || false,
        tankCapacity: tankCapacity || null,
        
        // Power
        zesaAvailable: zesaAvailable || false,
        solarSystem: solarSystem || false,
        solarBackupHours: solarBackupHours ? parseInt(solarBackupHours) : null,
        generator: generator || false,
        
        // Connectivity
        internetReady: internetReady || false,
        fiberAvailable: fiberAvailable || false,
        wifiIncluded: wifiIncluded || false,
        
        // Security
        walled: walled || false,
        electricGate: electricGate || false,
        burglarBars: burglarBars || false,
        securityAlarm: securityAlarm || false,
        guardedArea: guardedArea || false,
        neighborhoodWatch: neighborhoodWatch || false,
        
        // Condition
        furnished: furnished || 'No',
        recentlyRenovated: recentlyRenovated || false,
        tiles: tiles || false,
        ceiling: ceiling || false,
        builtInCupboards: builtInCupboards || false,
        mainBedroomEnsuite: mainBedroomEnsuite || false,
        petsAllowed: petsAllowed || false,
        smokingAllowed: smokingAllowed || false,
        sharedProperty: sharedProperty || false,
        sharedBathroom: sharedBathroom || false,
        
        // Student-friendly
        studentFriendly: studentFriendly || false,
        nearCampus: nearCampus || false,
        campusName: campusName || null,
        distanceToCampus: distanceToCampus ? parseFloat(distanceToCampus) : null,
        walkingDistance: walkingDistance || false,
        publicTransportNearby: publicTransportNearby || false,
        sharedRoomAllowed: sharedRoomAllowed || false,
        utilitiesIncluded: utilitiesIncluded || false,
        studyFriendly: studyFriendly || false,
        
        // Short-term bookings
        shortTermAvailable: shortTermAvailable || false,
        shortTermPricePerNight: shortTermPricePerNight ? parseInt(shortTermPricePerNight) : null,
        shortTermMinNights: shortTermMinNights ? parseInt(shortTermMinNights) : 1,
        shortTermMaxNights: shortTermMaxNights ? parseInt(shortTermMaxNights) : null,
        
        // System fields
        available: true,
        status: finalStatus,
        landlordId: session.user.id,
        images: {
          create: processedImages.map((image: { url: string; isMain?: boolean }) => ({
            url: image.url,
            isMain: image.isMain || false,
          })),
        },
      },
      include: {
        images: true,
        landlord: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}
