import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateAdminSession } from '@/lib/auth';
import { TelemetryUpdatePayload } from '@/types/ets';

export async function POST(request: NextRequest) {
  try {
    const session = await validateAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Access Denied: Restricted access portal. Authorized administrator session required.' },
        { status: 403 }
      );
    }

    const body: TelemetryUpdatePayload = await request.json();
    const { tripId, driverId, latitude, longitude, heading, speed } = body;

    if (!tripId || !driverId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'tripId, driverId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const now = new Date();

    // 1. Update DriverProfile current position
    await prisma.driverProfile.updateMany({
      where: { userId: driverId },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        currentHeading: heading ?? null,
        currentSpeed: speed ?? null,
        lastLocationUpdate: now,
      },
    });

    // 2. Append to telemetry trail audit log
    const log = await prisma.locationAuditLog.create({
      data: {
        tripId,
        driverId,
        latitude,
        longitude,
        heading: heading ?? null,
        speed: speed ?? null,
        timestamp: now,
      },
    });

    return NextResponse.json({
      success: true,
      logId: log.id,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error in telemetry route:', error);
    return NextResponse.json({ error: 'Failed to record telemetry' }, { status: 500 });
  }
}

// GET endpoint to fetch latest driver location for active trip
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get('tripId');

  if (!tripId) {
    return NextResponse.json({ error: 'tripId is required' }, { status: 400 });
  }

  const latestLog = await prisma.locationAuditLog.findFirst({
    where: { tripId },
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json({ latest: latestLog });
}

