import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can view analytics' },
        { status: 403 }
      );
    }

    // Get current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // User Statistics
    const totalUsers = await prisma.user.count();
    const totalTenants = await prisma.user.count({ where: { role: 'TENANT' } });
    const totalLandlords = await prisma.user.count({ where: { role: 'LANDLORD' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const verifiedUsers = await prisma.user.count({ where: { verificationStatus: true } });
    const newUsersThisMonth = await prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } });

    // Property Statistics
    const totalProperties = await prisma.property.count();
    const activeProperties = await prisma.property.count({ where: { status: 'ACTIVE' } });
    const pendingProperties = await prisma.property.count({ where: { status: 'PENDING' } });
    const rejectedProperties = await prisma.property.count({ where: { status: 'REJECTED' } });
    const approvedProperties = await prisma.property.count({ where: { status: 'APPROVED' } });

    // Property by Type
    const propertyByTypeRaw = await prisma.property.groupBy({
      by: ['type'],
      _count: true,
    });
    const propertyByType = propertyByTypeRaw.reduce((acc, item) => {
      acc[item.type || 'Unknown'] = item._count;
      return acc;
    }, {} as { [key: string]: number });

    // Properties by City
    const propertiesByCityRaw = await prisma.property.groupBy({
      by: ['city'],
      _count: true,
    });
    const propertiesByCity = propertiesByCityRaw.reduce((acc, item) => {
      acc[item.city || 'Unknown'] = acc[item.city || 'Unknown'] || 0;
      acc[item.city || 'Unknown'] += item._count;
      return acc;
    }, {} as { [key: string]: number });

    // Rental Request Statistics
    const totalRentalRequests = await prisma.rentalRequest.count();
    const pendingRequests = await prisma.rentalRequest.count({ where: { status: 'PENDING' } });
    const approvedRequests = await prisma.rentalRequest.count({ where: { status: 'APPROVED' } });
    const rejectedRequests = await prisma.rentalRequest.count({ where: { status: 'REJECTED' } });
    const completedRequests = await prisma.rentalRequest.count({ where: { status: 'COMPLETED' } });
    const cancelledRequests = await prisma.rentalRequest.count({ where: { status: 'CANCELLED' } });

    // Message Statistics
    const totalMessages = await prisma.message.count();
    const unreadMessages = await prisma.message.count({ where: { status: 'SENT' } });
    const archivedMessages = await prisma.message.count({ where: { status: 'ARCHIVED' } });
    const messagesSentThisMonth = await prisma.message.count({ where: { createdAt: { gte: firstDayOfMonth } } });

    // Viewing Statistics
    const totalViewings = await prisma.viewing.count();
    const pendingViewings = await prisma.viewing.count({ where: { status: 'PENDING' } });
    const confirmedViewings = await prisma.viewing.count({ where: { status: 'CONFIRMED' } });
    const cancelledViewings = await prisma.viewing.count({ where: { status: 'CANCELLED' } });
    const completedViewings = await prisma.viewing.count({ where: { status: 'COMPLETED' } });

    // Report Statistics
    const totalReports = await prisma.report.count();
    const pendingReports = await prisma.report.count({ where: { status: 'PENDING' } });
    const resolvedReports = await prisma.report.count({ where: { status: 'RESOLVED' } });

    const reportsByTypeRaw = await prisma.report.groupBy({
      by: ['type'],
      _count: true,
    });
    const reportsByType = reportsByTypeRaw.reduce((acc, item) => {
      acc[item.type || 'Unknown'] = item._count;
      return acc;
    }, {} as { [key: string]: number });

    // Payment Statistics
    const totalPayments = await prisma.payment.count();
    const completedPayments = await prisma.payment.count({ where: { status: 'COMPLETED' } });
    const pendingPayments = await prisma.payment.count({ where: { status: 'PENDING' } });
    const failedPayments = await prisma.payment.count({ where: { status: 'FAILED' } });

    const paymentSum = await prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: {
        amount: true,
      },
    });
    const totalPaymentAmount = paymentSum._sum?.amount || 0;

    // Calculate derived metrics
    const avgPropertiesPerLandlord = totalLandlords > 0 ? totalProperties / totalLandlords : 0;
    const avgRentalRequestsPerProperty = totalProperties > 0 ? totalRentalRequests / totalProperties : 0;

    // Engagement rate = (active users / total users)
    const activeUsers = totalTenants + totalLandlords;
    const platformEngagementRate = totalUsers > 0 ? activeUsers / totalUsers : 0;

    return NextResponse.json({
      // User Stats
      totalUsers,
      totalTenants,
      totalLandlords,
      totalAdmins,
      verifiedUsers,
      newUsersThisMonth,

      // Property Stats
      totalProperties,
      activeProperties,
      pendingProperties,
      rejectedProperties,
      approvedProperties,
      propertyByType,
      propertiesByCity,

      // Rental Request Stats
      totalRentalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      completedRequests,
      cancelledRequests,

      // Message Stats
      totalMessages,
      unreadMessages,
      archivedMessages,
      messagesSentThisMonth,

      // Viewing Stats
      totalViewings,
      pendingViewings,
      confirmedViewings,
      cancelledViewings,
      completedViewings,

      // Report Stats
      totalReports,
      pendingReports,
      resolvedReports,
      reportsByType,

      // Payment Stats
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalPaymentAmount,

      // Platform Growth
      avgPropertiesPerLandlord,
      avgRentalRequestsPerProperty,
      platformEngagementRate,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
