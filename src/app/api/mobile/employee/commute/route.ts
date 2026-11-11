import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || 'emp-amrutha';

    const { activeTrip, passenger } = await db.getEmployeeCommute(employeeId);

    if (!activeTrip || !passenger) {
      return NextResponse.json({
        activeCommute: null,
        message: 'No active commute scheduled for today.',
      });
    }

    const activeCommute = {
      tripId: activeTrip.id,
      tripCode: activeTrip.tripCode,
      type: activeTrip.type,
      shiftDate: activeTrip.shiftDate,
      shiftTime: activeTrip.shiftTime,
      status: activeTrip.status,
      employeeId: passenger.employeeId,
      employeeCode: passenger.employeeCode,
      employeeName: passenger.fullName,
      scheduledPickupTime: passenger.scheduledPickupTime,
      boardingOtp: passenger.boardingOtp,
      boardingStatus: passenger.boardingStatus,
      boardedAt: passenger.boardedAt,
      isLocationReassigned: passenger.isLocationReassigned || false,
      pickup: {
        address: passenger.pickupAddress,
        latitude: passenger.pickupCoords.latitude,
        longitude: passenger.pickupCoords.longitude,
      },
      drop: {
        address: passenger.dropAddress,
        latitude: passenger.dropCoords.latitude,
        longitude: passenger.dropCoords.longitude,
      },
      vehicle: {
        plateNumber: activeTrip.vehicle.plateNumber,
        model: `${activeTrip.vehicle.make} ${activeTrip.vehicle.model}`,
        color: activeTrip.vehicle.color,
      },
      driver: {
        name: activeTrip.driver.fullName,
        phone: activeTrip.driver.phone,
        rating: `${activeTrip.driver.rating} ★`,
        currentLocation: activeTrip.currentLocation || {
          latitude: passenger.pickupCoords.latitude + 0.004,
          longitude: passenger.pickupCoords.longitude - 0.003,
          speed: 32,
          heading: 45,
          lastUpdated: new Date().toISOString(),
        },
      },
      coRiders: activeTrip.passengers.map((p) => ({
        id: p.id,
        name: p.fullName,
        sequence: p.stopSequence,
        status: p.boardingStatus,
        pickupAddress: p.pickupAddress,
      })),
    };

    return NextResponse.json({ activeCommute });
  } catch (error: any) {
    console.error('Error fetching employee commute:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve commute' }, { status: 500 });
  }
}
