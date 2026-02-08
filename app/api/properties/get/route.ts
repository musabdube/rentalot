import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const propertyId = searchParams.get('id');

    // If specific property ID requested
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          images: true,
          landlord: {
            select: { id: true, name: true, avatar: true, email: true },
          },
        },
      });

      if (!property) {
        return NextResponse.json(
          { error: 'Property not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: property.id,
        title: property.title,
        description: property.description,
        rentAmount: property.rentAmount,
        price: property.rentAmount, // Legacy support
        city: property.city,
        suburb: property.suburb,
        street: property.street,
        nearbyLandmark: property.nearbyLandmark,
        gpsLatitude: property.gpsLatitude,
        gpsLongitude: property.gpsLongitude,
        currency: property.currency || 'USD',
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        toilets: property.toilets,
        area: property.area,
        imageUrl: property.images.find(img => img.isMain)?.url || property.images[0]?.url || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        images: property.images,
        features: property.features || [],
        type: property.type.toLowerCase() as 'apartment' | 'house' | 'villa' | 'studio',
        available: property.available,
        isVerified: property.isVerified,
        isPinned: property.isPinned,
        pinnedAt: property.pinnedAt,
        status: property.status,
        landlordId: property.landlordId,
        landlord: property.landlord,
        landlordName: property.landlord?.name,
        landlordAvatar: property.landlord?.avatar,
        // Additional fields
        depositAmount: property.depositAmount,
        leaseTerm: property.leaseTerm,
        negotiable: property.negotiable,
        yardSize: property.yardSize,
        veranda: property.veranda,
        fenced: property.fenced,
        pavedDriveway: property.pavedDriveway,
        lounge: property.lounge,
        diningRoom: property.diningRoom,
        kitchen: property.kitchen,
        parkingSpaces: property.parkingSpaces,
        garage: property.garage,
        carport: property.carport,
        municipalWater: property.municipalWater,
        borehole: property.borehole,
        waterTank: property.waterTank,
        tankCapacity: property.tankCapacity,
        zesaAvailable: property.zesaAvailable,
        solarSystem: property.solarSystem,
        solarBackupHours: property.solarBackupHours,
        generator: property.generator,
        internetReady: property.internetReady,
        fiberAvailable: property.fiberAvailable,
        wifiIncluded: property.wifiIncluded,
        walled: property.walled,
        electricGate: property.electricGate,
        burglarBars: property.burglarBars,
        securityAlarm: property.securityAlarm,
        guardedArea: property.guardedArea,
        neighborhoodWatch: property.neighborhoodWatch,
        furnished: property.furnished,
        recentlyRenovated: property.recentlyRenovated,
        tiles: property.tiles,
        ceiling: property.ceiling,
        builtInCupboards: property.builtInCupboards,
        mainBedroomEnsuite: property.mainBedroomEnsuite,
        petsAllowed: property.petsAllowed,
        smokingAllowed: property.smokingAllowed,
        sharedProperty: property.sharedProperty,
        sharedBathroom: property.sharedBathroom,
        // Student-friendly
        studentFriendly: property.studentFriendly,
        nearCampus: property.nearCampus,
        campusName: property.campusName,
        distanceToCampus: property.distanceToCampus,
        walkingDistance: property.walkingDistance,
        publicTransportNearby: property.publicTransportNearby,
        sharedRoomAllowed: property.sharedRoomAllowed,
        utilitiesIncluded: property.utilitiesIncluded,
        studyFriendly: property.studyFriendly,
      });
    }

    // Fetch all available APPROVED/ACTIVE properties, with pinned items first
    const properties = await prisma.property.findMany({
      where: {
        available: true,
        status: {
          in: ['ACTIVE', 'APPROVED'],
        },
      },
      include: {
        images: {
          where: { isMain: true },
          select: { url: true },
        },
        landlord: {
          select: { name: true, avatar: true },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { pinnedAt: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    });

    // Fetch all images for each property
    const propertiesWithAllImages = await Promise.all(
      properties.map(async (property) => {
        const allImages = await prisma.propertyImage.findMany({
          where: { propertyId: property.id },
        });
        return { ...property, allImages };
      })
    );

    // Transform Prisma data to match Property interface
    const formattedProperties = propertiesWithAllImages.map((property) => ({
      id: property.id,
      title: property.title,
      description: property.description,
      rentAmount: property.rentAmount,
      price: property.rentAmount, // Legacy support
      city: property.city,
      suburb: property.suburb,
      street: property.street,
      nearbyLandmark: property.nearbyLandmark,
      gpsLatitude: property.gpsLatitude,
      gpsLongitude: property.gpsLongitude,
      currency: property.currency || 'USD',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      toilets: property.toilets,
      area: property.area,
      imageUrl: property.images[0]?.url || 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
      images: property.allImages,
      features: property.features || [],
      type: property.type.toLowerCase() as 'apartment' | 'house' | 'villa' | 'studio',
      available: property.available,
      isVerified: property.isVerified,
      isPinned: property.isPinned,
      pinnedAt: property.pinnedAt,
      landlordId: property.landlordId,
      landlord: property.landlord ? { id: property.landlordId, name: property.landlord.name } : undefined,
      landlordName: property.landlord?.name,
      landlordAvatar: property.landlord?.avatar,
      // Additional fields
      depositAmount: property.depositAmount,
      leaseTerm: property.leaseTerm,
      negotiable: property.negotiable,
      yardSize: property.yardSize,
      veranda: property.veranda,
      fenced: property.fenced,
      pavedDriveway: property.pavedDriveway,
      lounge: property.lounge,
      diningRoom: property.diningRoom,
      kitchen: property.kitchen,
      parkingSpaces: property.parkingSpaces,
      garage: property.garage,
      carport: property.carport,
      municipalWater: property.municipalWater,
      borehole: property.borehole,
      waterTank: property.waterTank,
      tankCapacity: property.tankCapacity,
      zesaAvailable: property.zesaAvailable,
      solarSystem: property.solarSystem,
      solarBackupHours: property.solarBackupHours,
      generator: property.generator,
      internetReady: property.internetReady,
      fiberAvailable: property.fiberAvailable,
      wifiIncluded: property.wifiIncluded,
      walled: property.walled,
      electricGate: property.electricGate,
      burglarBars: property.burglarBars,
      securityAlarm: property.securityAlarm,
      guardedArea: property.guardedArea,
      neighborhoodWatch: property.neighborhoodWatch,
      furnished: property.furnished,
      recentlyRenovated: property.recentlyRenovated,
      tiles: property.tiles,
      ceiling: property.ceiling,
      builtInCupboards: property.builtInCupboards,
      mainBedroomEnsuite: property.mainBedroomEnsuite,
      petsAllowed: property.petsAllowed,
      smokingAllowed: property.smokingAllowed,
      sharedProperty: property.sharedProperty,
      sharedBathroom: property.sharedBathroom,
      // Student-friendly
      studentFriendly: property.studentFriendly,
      nearCampus: property.nearCampus,
      campusName: property.campusName,
      distanceToCampus: property.distanceToCampus,
      walkingDistance: property.walkingDistance,
      publicTransportNearby: property.publicTransportNearby,
      sharedRoomAllowed: property.sharedRoomAllowed,
      utilitiesIncluded: property.utilitiesIncluded,
      studyFriendly: property.studyFriendly,
    }));

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
