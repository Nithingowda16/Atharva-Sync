import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json({ error: 'employeeId query param is required' }, { status: 400 });
    }

    // 1. Fetch employee's active scheduled trip
    const passengerRecord = await prisma.tripPassenger.findFirst({
      where: {
        employeeId,
        boardingStatus: { in: ['SCHEDULED', 'DRIVER_ARRIVED', 'BOARDED'] },
      },
      include: {
        trip: {
          include: {
            vehicle: true,
            driver: {
              include: {
                driverProfile: true,
              },
            },
            passengers: {
              include: {
                employee: {
                  select: { fullName: true },
                },
              },
              orderBy: { stopSequence: 'asc' },
            },
          },
        },
      },
    });

    if (!passengerRecord) {
      return NextResponse.json({ activeCommute: null, message: 'No active commute scheduled for today.' });
    }

    const { trip } = passengerRecord;
    const driverProfile = trip.driver.driverProfile;

    const activeCommute = {
      tripId: trip.id,
      tripCode: trip.tripCode,
      type: trip.type,
      status: trip.status,
      scheduledPickupTime: passengerRecord.scheduledPickupTime,
      boardingOtp: passengerRecord.boardingOtp,
      boardingStatus: passengerRecord.boardingStatus,
      isLocationReassigned: passengerRecord.isLocationReassigned,
      pickup: {
        address: passengerRecord.pickupAddress,
        latitude: passengerRecord.pickupLatitude,
        longitude: passengerRecord.pickupLongitude,
      },
      drop: {
        address: passengerRecord.dropAddress,
        latitude: passengerRecord.dropLatitude,
        longitude: passengerRecord.dropLongitude,
      },
      vehicle: {
        plateNumber: trip.vehicle.plateNumber,
        model: `${trip.vehicle.make} ${trip.vehicle.model}`,
        color: trip.vehicle.color,
      },
      driver: {
        name: trip.driver.fullName,
        phone: trip.driver.phoneNumber,
        rating: driverProfile?.rating || 5.0,
        currentLocation: {
          latitude: driverProfile?.currentLatitude || 12.9760,
          longitude: driverProfile?.currentLongitude || 77.6320,
          speed: driverProfile?.currentSpeed || 32,
          heading: driverProfile?.currentHeading || 45,
          lastUpdated: driverProfile?.lastLocationUpdate,
        },
      },
      coRiders: trip.passengers.map((p) => ({
        id: p.id,
        name: p.employee.fullName,
        sequence: p.stopSequence,
        status: p.boardingStatus,
        pickupAddress: p.pickupAddress,
      })),
    };

    return NextResponse.json({ activeCommute });
  } catch (error) {
    console.error('Error fetching employee commute:', error);
    return NextResponse.json({ error: 'Failed to retrieve commute' }, { status: 500 });
  }
}

