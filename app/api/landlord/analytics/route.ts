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
    const landlordId = session.user.id;
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    // Run all counts/aggregations in parallel — no full row fetches
    const [
      totalProperties,
      activeListings,
      occupiedProperties,
      totalRequests,
      approvedRequests,
      thisMonthRequests,
      rentAggregate,
      topPropertyData,
    ] = await Promise.all([
      prisma.property.count({ where: { landlordId } }),
      prisma.property.count({ where: { landlordId, status: 'ACTIVE' } }),
      prisma.property.count({ where: { landlordId, availabilityStatus: 'PENDING_RENT' } }),
      prisma.rentalRequest.count({ where: { landlordId } }),
      prisma.rentalRequest.count({ where: { landlordId, status: 'APPROVED' } }),
      prisma.rentalRequest.count({ where: { landlordId, createdAt: { gte: thisMonthStart } } }),
      prisma.property.aggregate({ where: { landlordId }, _avg: { rentAmount: true }, _sum: { rentAmount: true } }),
      // Top property by request count — one query with groupBy
      prisma.rentalRequest.groupBy({
        by: ['propertyId'],
        where: { landlordId },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 1,
      }),
    ]);

    const averageRent = Math.round(rentAggregate._avg.rentAmount ?? 0);
    const occupancyRate = totalProperties > 0 ? Math.round((occupiedProperties / totalProperties) * 100) : 0;
    const totalRevenue = (rentAggregate._avg.rentAmount ?? 0) * occupiedProperties;

    // Resolve top property title if we have a result
    let topProperty = null;
    if (topPropertyData.length > 0) {
      const topProp = await prisma.property.findUnique({
        where: { id: topPropertyData[0].propertyId },
        select: { title: true },
      });
      const topPropRequests = topPropertyData[0]._count.id;
      topProperty = {
        title: topProp?.title ?? 'Unknown',
        views: topPropRequests,
        requests: topPropRequests,
      };
    }

    return NextResponse.json({
      totalProperties,
      activeListings,
      totalViews: totalRequests,
      rentalRequests: totalRequests,
      approvedRequests,
      totalRevenue,
      occupancyRate,
      averageRent,
      viewsThisMonth: totalRequests,
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
