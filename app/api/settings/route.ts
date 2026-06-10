import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 3600; // cache settings for 1 hour

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 'settings' },
      select: {
        platformName: true,
        heroImageUrl: true,
      },
    });

    if (!settings) {
      return NextResponse.json({ platformName: 'RentALot', heroImageUrl: null });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}
