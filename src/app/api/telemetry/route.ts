import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tripId, driverId, latitude, longitude, heading, speed } = body;

    if (!tripId || !driverId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'tripId, driverId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const result = await db.updateTelemetry({
      tripId,
      driverId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      heading: heading !== undefined ? Number(heading) : undefined,
      speed: speed !== undefined ? Number(speed) : undefined,
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      currentLocation: result.trip.currentLocation,
    });
  } catch (error: any) {
    console.error('Error recording telemetry:', error);
    return NextResponse.json({ error: error.message || 'Failed to record telemetry' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    if (tripId) {
      const trip = await db.getTripById(tripId);
      return NextResponse.json({
        success: true,
        tripId,
        currentLocation: trip?.currentLocation || null,
        status: trip?.status,
        vehiclePlate: trip?.vehicle.plateNumber,
        driver: trip?.driver.fullName,
        passengersCount: trip?.passengers.length,
        boardedCount: trip?.passengers.filter((p) => p.boardingStatus === 'BOARDED').length,
      });
    }

    // Return all active fleet vehicles' latest positions
    const trips = await db.getTrips();
    const fleetTelemetry = trips.map((t) => ({
      tripId: t.id,
      tripCode: t.tripCode,
      status: t.status,
      shiftTime: t.shiftTime,
      type: t.type,
      vehiclePlate: t.vehicle.plateNumber,
      vehicleModel: `${t.vehicle.make} ${t.vehicle.model}`,
      driverName: t.driver.fullName,
      driverPhone: t.driver.phone,
      passengersCount: t.passengers.length,
      boardedCount: t.passengers.filter((p) => p.boardingStatus === 'BOARDED').length,
      currentLocation: t.currentLocation || {
        latitude: t.passengers[0]?.pickupCoords.latitude || 12.9719,
        longitude: t.passengers[0]?.pickupCoords.longitude || 77.6412,
        heading: 45,
        speed: 30,
        lastUpdated: new Date().toISOString(),
      },
    }));

    return NextResponse.json({ success: true, count: fleetTelemetry.length, fleet: fleetTelemetry });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
