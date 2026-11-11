import { NextRequest, NextResponse } from 'next/server';
import db, { TripState } from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await db.getTripById(params.id);
    if (!trip) {
      return NextResponse.json({ error: `Trip ${params.id} not found` }, { status: 404 });
    }
    return NextResponse.json({ success: true, trip });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const nextStatus = body.status as TripState;
    const actor = body.actor || 'Operations Command';

    if (!nextStatus) {
      return NextResponse.json({ error: 'status field is required' }, { status: 400 });
    }

    const updated = await db.updateTripStatus(params.id, nextStatus, actor);
    return NextResponse.json({
      success: true,
      message: `Trip ${updated.tripCode} status updated to ${updated.status}`,
      trip: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
