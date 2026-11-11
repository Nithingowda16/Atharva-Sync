import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId') || 'drv-suresh';

    const { activeTrip, driver } = await db.getDriverManifest(driverId);

    if (!activeTrip) {
      return NextResponse.json({
        tripManifest: null,
        driver,
        message: 'No active trip currently assigned.',
      });
    }

    const manifest = {
      tripId: activeTrip.id,
      tripCode: activeTrip.tripCode,
      type: activeTrip.type,
      shiftDate: activeTrip.shiftDate,
      shiftTime: activeTrip.shiftTime,
      status: activeTrip.status,
      routeName: activeTrip.routeName,
      vehiclePlate: activeTrip.vehicle.plateNumber,
      vehicleModel: `${activeTrip.vehicle.make} ${activeTrip.vehicle.model}`,
      driverName: activeTrip.driver.fullName,
      driverPhone: activeTrip.driver.phone,
      totalStops: activeTrip.passengers.length,
      boardedCount: activeTrip.passengers.filter((p) => p.boardingStatus === 'BOARDED').length,
      currentLocation: activeTrip.currentLocation,
      stops: activeTrip.passengers.map((p) => ({
        id: p.id,
        passengerId: p.employeeId,
        empCode: p.employeeCode,
        name: p.fullName,
        phone: p.phone,
        sequence: p.stopSequence,
        pickupAddress: p.pickupAddress,
        pickupCoords: p.pickupCoords,
        dropAddress: p.dropAddress,
        dropCoords: p.dropCoords,
        scheduledPickupTime: p.scheduledPickupTime,
        pin: p.boardingOtp,
        boardingStatus: p.boardingStatus,
        isLocationReassigned: p.isLocationReassigned || false,
        reassignmentDetails: p.reassignmentDetails || null,
        noShowReason: p.noShowReason || null,
      })),
    };

    return NextResponse.json({ tripManifest: manifest, driver });
  } catch (error: any) {
    console.error('Error fetching driver manifest:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve manifest' }, { status: 500 });
  }
}
