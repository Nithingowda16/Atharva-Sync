import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { dispatchPushNotification } from '@/lib/push-service';
import { VerifyOtpRequest, VerifyOtpResponse } from '@/types/ets';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    const body: VerifyOtpRequest = await request.json();
    const { employeeId, boardingOtp } = body;

    if (!tripId || !employeeId || !boardingOtp) {
      return NextResponse.json(
        { error: 'tripId, employeeId, and boardingOtp are required' },
        { status: 400 }
      );
    }

    // 1. Fetch passenger record
    const passenger = await prisma.tripPassenger.findUnique({
      where: {
        tripId_employeeId: {
          tripId,
          employeeId,
        },
      },
      include: {
        trip: true,
        employee: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!passenger) {
      return NextResponse.json({ error: 'Passenger not rostered on this trip.' }, { status: 404 });
    }

    // 2. Validate OTP PIN
    if (passenger.boardingOtp !== boardingOtp.trim()) {
      return NextResponse.json(
        { error: 'Invalid boarding PIN. Verification failed.' },
        { status: 401 }
      );
    }

    const now = new Date();

    // 3. Mark passenger as BOARDED
    const updated = await prisma.tripPassenger.update({
      where: { id: passenger.id },
      data: {
        boardingStatus: 'BOARDED',
        boardedAt: now,
      },
    });

    // 4. Send confirmation push notification to employee app
    await dispatchPushNotification({
      recipientUserId: employeeId,
      title: '✅ Boarding Confirmed',
      body: `You have successfully boarded vehicle ${passenger.trip.tripCode}. Have a safe commute!`,
      data: { type: 'BOARDING_CONFIRMED', tripId }
    });

    // 5. Look up next stop in the sequence
    const nextPassenger = await prisma.tripPassenger.findFirst({
      where: {
        tripId,
        stopSequence: { gt: passenger.stopSequence },
        boardingStatus: 'SCHEDULED',
      },
      orderBy: { stopSequence: 'asc' },
      include: {
        employee: {
          select: { fullName: true }
        }
      }
    });

    const response: VerifyOtpResponse = {
      success: true,
      message: `${passenger.employee.fullName} verified and marked as BOARDED.`,
      boardedAt: now.toISOString(),
      nextPassenger: nextPassenger
        ? {
            employeeName: nextPassenger.employee.fullName,
            pickupAddress: nextPassenger.pickupAddress,
            latitude: nextPassenger.pickupLatitude,
            longitude: nextPassenger.pickupLongitude,
          }
        : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in verify-otp route:', error);
    return NextResponse.json({ error: 'Failed to verify boarding PIN' }, { status: 500 });
  }
}

