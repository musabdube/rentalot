import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'LANDLORD') {
      return NextResponse.json(
        { error: 'Only landlords can access this' },
        { status: 403 }
      );
    }

    // Get all properties for this landlord
    const properties = await prisma.property.findMany({
      where: { landlordId: session.user.id },
      include: {
        rentalRequests: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Get total rental requests
    const allRentalRequests = await prisma.rentalRequest.findMany({
      where: { landlordId: session.user.id },
      select: {
        id: true,
        status: true,
        propertyId: true,
        createdAt: true,
      },
    });

    // Calculate metrics
    const totalProperties = properties.length;
    const activeListings = properties.filter(p => p.status === 'ACTIVE').length;
    const occupiedProperties = properties.filter(p => p.availabilityStatus === 'PENDING_RENT').length;
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;

    // Calculate total requests per property (use as proxy for "views")
    const totalRequests = allRentalRequests.length;
    const totalViews = totalRequests; // Use rental requests as engagement metric
    const approvedRequests = allRentalRequests.filter(r => r.status === 'APPROVED').length;

    // Calculate revenue (mock - replace with actual payment data)
    const totalRevenue = properties.reduce((sum, p) => sum + p.rentAmount * occupiedProperties, 0);
    const averageRent = properties.length > 0 ? Math.round(properties.reduce((sum, p) => sum + p.rentAmount, 0) / properties.length) : 0;

    // Get this month stats
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    
    const thisMonthRequests = allRentalRequests.filter(r => 
      new Date(r.createdAt) >= thisMonthStart
    ).length;

    // Get top property (by rental requests count)
    let topProperty = null;
    if (properties.length > 0) {
      const sortedByRequests = [...properties].sort((a, b) => b.rentalRequests.length - a.rentalRequests.length);
      const topProp = sortedByRequests[0];
      const topPropRequests = topProp.rentalRequests.length;
      
      topProperty = {
        title: topProp.title,
        views: topPropRequests, // Using rental request count as engagement metric
        requests: topPropRequests,
      };
    }

    return NextResponse.json({
      totalProperties,
      activeListings,
      totalViews,
      rentalRequests: totalRequests,
      approvedRequests,
      totalRevenue,
      occupancyRate,
      averageRent,
      viewsThisMonth: totalViews, // Mock - should track separately
      requestsThisMonth: thisMonthRequests,
      topProperty,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
