import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateDistanceKm } from '@/lib/geolocation';
import { notifyDriverLocationReassigned } from '@/lib/push-service';
import { validateAdminSession } from '@/lib/auth';
import { ReassignLocationRequest, ReassignLocationResponse } from '@/types/ets';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await validateAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Access Denied: Restricted access portal. Authorized administrator session required.' },
        { status: 403 }
      );
    }

    const tripId = params.id;
    const body: ReassignLocationRequest = await request.json();

    const { employeeId, newCoordinates, updatedAddress, reason, initiatedByRole } = body;

    if (!tripId || !employeeId || !newCoordinates || !updatedAddress) {
      return NextResponse.json(
        { error: 'tripId, employeeId, newCoordinates, and updatedAddress are required' },
        { status: 400 }
      );
    }

    // 1. Fetch trip and existing passenger stop
    const tripPassenger = await prisma.tripPassenger.findUnique({
      where: {
        tripId_employeeId: {
          tripId,
          employeeId,
        },
      },
      include: {
        trip: {
          include: {
            driver: true,
          },
        },
        employee: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!tripPassenger) {
      return NextResponse.json(
        { error: 'TripPassenger record not found for this trip and employee.' },
        { status: 404 }
      );
    }

    const previousCoords = {
      latitude: tripPassenger.pickupLatitude,
      longitude: tripPassenger.pickupLongitude,
    };

    const distanceDelta = calculateDistanceKm(previousCoords, newCoordinates);

    // 2. Perform Transaction: Update Passenger Coordinates & Record Audit Event
    const [updatedPassenger, reassignmentEvent] = await prisma.$transaction([
      prisma.tripPassenger.update({
        where: { id: tripPassenger.id },
        data: {
          pickupLatitude: newCoordinates.latitude,
          pickupLongitude: newCoordinates.longitude,
          pickupAddress: updatedAddress,
          isLocationReassigned: true,
        },
      }),
      prisma.locationReassignmentEvent.create({
        data: {
          tripPassengerId: tripPassenger.id,
          driverId: tripPassenger.trip.driverId,
          previousLat: previousCoords.latitude,
          previousLng: previousCoords.longitude,
          newLat: newCoordinates.latitude,
          newLng: newCoordinates.longitude,
          updatedAddress,
          reason: reason || 'Live pickup location update due to passenger requirement/issue',
          initiatedByRole: (initiatedByRole === 'ADMIN' ? 'ATHARVA_ADMIN' : initiatedByRole) || 'EMPLOYEE',
          notifiedDriver: true,
        },
      }),
      // Also update employee profile live coordinates
      prisma.employeeProfile.updateMany({
        where: { userId: employeeId },
        data: {
          liveLatitude: newCoordinates.latitude,
          liveLongitude: newCoordinates.longitude,
          lastLocationUpdate: new Date(),
        },
      }),
    ]);

    // 3. Dispatch Push Notification to the Driver App
    await notifyDriverLocationReassigned({
      driverUserId: tripPassenger.trip.driverId,
      employeeName: tripPassenger.employee.fullName,
      updatedAddress,
      newCoords: newCoordinates,
      reason: reason || 'Pickup location re-routed',
      tripCode: tripPassenger.trip.tripCode,
    });

    const response: ReassignLocationResponse = {
      success: true,
      message: `Employee pickup coordinates reassigned to driver successfully. Shifted by ${distanceDelta} km.`,
      eventId: reassignmentEvent.id,
      updatedTripPassengerId: updatedPassenger.id,
      driverNotified: true,
      distanceDeltaKm: distanceDelta,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in reassign-location API:', error);
    return NextResponse.json(
      { error: 'Internal server error while reassigning location' },
      { status: 500 }
    );
  }
}

