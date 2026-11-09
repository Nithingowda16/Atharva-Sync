import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json({ error: 'driverId is required' }, { status: 400 });
    }

    // Fetch active or assigned trip for this driver
    const trip = await prisma.trip.findFirst({
      where: {
        driverId,
        status: { in: ['SCHEDULED', 'DRIVER_ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS'] },
      },
      include: {
        vehicle: true,
        passengers: {
          include: {
            employee: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
              },
            },
            reassignmentEvents: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { stopSequence: 'asc' },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ tripManifest: null, message: 'No active trip assigned.' });
    }

    const manifest = {
      tripId: trip.id,
      tripCode: trip.tripCode,
      type: trip.type,
      status: trip.status,
      vehiclePlate: trip.vehicle.plateNumber,
      totalStops: trip.passengers.length,
      stops: trip.passengers.map((p) => {
        const latestReassignment = p.reassignmentEvents[0];
        return {
          passengerId: p.employee.id,
          name: p.employee.fullName,
          phone: p.employee.phoneNumber,
          sequence: p.stopSequence,
          pickupAddress: p.pickupAddress,
          pickupCoords: {
            latitude: p.pickupLatitude,
            longitude: p.pickupLongitude,
          },
          scheduledPickupTime: p.scheduledPickupTime,
          boardingStatus: p.boardingStatus,
          isLocationReassigned: p.isLocationReassigned,
          reassignmentDetails: latestReassignment
            ? {
                previousCoords: {
                  lat: latestReassignment.previousLat,
                  lng: latestReassignment.previousLng,
                },
                newCoords: {
                  lat: latestReassignment.newLat,
                  lng: latestReassignment.newLng,
                },
                reason: latestReassignment.reason,
                timestamp: latestReassignment.createdAt,
              }
            : null,
        };
      }),
    };

    return NextResponse.json({ tripManifest: manifest });
  } catch (error) {
    console.error('Error in driver trip manifest route:', error);
    return NextResponse.json({ error: 'Failed to retrieve manifest' }, { status: 500 });
  }
}

