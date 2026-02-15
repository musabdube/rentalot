import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Check if Settings model exists and is accessible
    if (!prisma.settings) {
      return new Response(
        JSON.stringify({ 
          error: 'Prisma client needs to be regenerated. Please restart your dev server.',
          hint: 'Run: npx prisma generate in a fresh terminal'
        }),
        { status: 503 }
      );
    }

    let settings = await (prisma.settings as any).findUnique({
      where: { id: 'settings' },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await (prisma.settings as any).create({
        data: { id: 'settings' },
      });
    }

    return Response.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new Response('Error fetching settings', { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();

    // Extract only the fields we allow to be updated
    const allowedFields = {
      platformName: data.platformName,
      platformEmail: data.platformEmail,
      maintenanceMode: data.maintenanceMode,
      enableReporting: data.enableReporting,
      enableMessaging: data.enableMessaging,
      enableViewingSchedule: data.enableViewingSchedule,
      enablePayments: data.enablePayments,
      requireLandlordVerification: data.requireLandlordVerification,
      autoApproveListing: data.autoApproveListing,
      platformCommissionPercent: data.platformCommissionPercent,
      minCommissionAmount: data.minCommissionAmount,
      maxFeaturedDays: data.maxFeaturedDays,
      featuredListingPrice: data.featuredListingPrice,
      maxUploadSizeMB: data.maxUploadSizeMB,
      maxImagesPerListing: data.maxImagesPerListing,
      heroImageUrl: data.heroImageUrl || null,
      adminNotes: data.adminNotes,
    };

    const settings = await (prisma.settings as any).upsert({
      where: { id: 'settings' },
      update: allowedFields,
      create: {
        id: 'settings',
        ...allowedFields,
      },
    });

    return Response.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return new Response('Error updating settings', { status: 500 });
  }
}

