import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = params.id;
    const body = await request.json();
    const { employeeId, employeeCode, reason, driverId } = body;

    const identifier = employeeId || employeeCode;

    if (!tripId || !identifier) {
      return NextResponse.json(
        { error: 'tripId and employee identifier are required' },
        { status: 400 }
      );
    }

    const result = await db.markPassengerNoShow({
      tripId,
      employeeIdOrCode: identifier,
      reason: reason || 'Passenger was not present at pickup location after waiting period',
      driverId,
    });

    return NextResponse.json({
      success: true,
      message: `${result.passenger.fullName} marked as NO SHOW.`,
      passenger: result.passenger,
      trip: result.trip,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
