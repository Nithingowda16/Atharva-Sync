import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';
import { dispatchPushNotification } from '@/lib/push-service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    const body = await request.json();
    const { employeeId, employeeCode, boardingOtp, driverId } = body;

    const identifier = employeeId || employeeCode;

    if (!tripId || !identifier || !boardingOtp) {
      return NextResponse.json(
        { error: 'tripId, employee identifier (ID or code), and boardingOtp are required' },
        { status: 400 }
      );
    }

    const result = await db.verifyPassengerBoarding({
      tripId,
      employeeIdOrCode: identifier,
      boardingPin: boardingOtp,
      driverId,
    });

    // Send push notification if push-service is configured
    try {
      await dispatchPushNotification({
        recipientUserId: result.passenger.employeeId,
        title: '✅ Boarding Confirmed',
        body: `You have successfully boarded vehicle ${result.trip.vehicle.plateNumber} for trip ${result.trip.tripCode}. Have a safe commute!`,
        data: { type: 'BOARDING_CONFIRMED', tripId: result.trip.id },
      });
    } catch (e) {}

    // Find next pending passenger
    const nextPassenger = result.trip.passengers.find(
      (p) => p.stopSequence > result.passenger.stopSequence && p.boardingStatus !== 'BOARDED'
    );

    return NextResponse.json({
      success: true,
      message: result.message,
      boardedAt: result.passenger.boardedAt,
      passenger: result.passenger,
      trip: result.trip,
      nextPassenger: nextPassenger
        ? {
            employeeName: nextPassenger.fullName,
            pickupAddress: nextPassenger.pickupAddress,
            latitude: nextPassenger.pickupCoords.latitude,
            longitude: nextPassenger.pickupCoords.longitude,
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify boarding PIN' }, { status: 400 });
  }
}
