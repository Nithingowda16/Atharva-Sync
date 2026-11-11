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

    const { employeeId, newCoordinates, updatedAddress, reason } = body;

    if (!tripId || !employeeId || !newCoordinates || !updatedAddress) {
      return NextResponse.json(
        { error: 'tripId, employeeId, newCoordinates, and updatedAddress are required' },
        { status: 400 }
      );
    }

    const result = await db.requestLocationReassignment({
      tripId,
      employeeId,
      newAddress: updatedAddress,
      newCoords: newCoordinates,
      reason: reason || 'Live pickup location adjustment requested by passenger',
    });

    return NextResponse.json({
      success: true,
      message: `Pickup location reassigned to ${updatedAddress}. Driver waypoint updated.`,
      passenger: result.passenger,
      trip: result.trip,
    });
  } catch (error: any) {
    console.error('Error reassigning location:', error);
    return NextResponse.json({ error: error.message || 'Failed to reassign location' }, { status: 500 });
  }
}
