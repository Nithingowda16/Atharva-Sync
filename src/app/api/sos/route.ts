import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { employeeId, tripId, latitude, longitude, notes } = await request.json();

    if (!employeeId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'employeeId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    const alert = await db.triggerSOS({
      tripId,
      employeeId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      notes,
    });

    return NextResponse.json({
      success: true,
      alert,
      message: '🚨 Emergency SOS broadcasted. Operations Command Center alerted.',
    });
  } catch (error: any) {
    console.error('Error processing SOS:', error);
    return NextResponse.json({ error: error.message || 'Failed to process SOS' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const alerts = await db.getSOSAlerts();
    return NextResponse.json({ success: true, count: alerts.length, alerts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, status, adminName, notes } = body;

    if (!alertId || !status) {
      return NextResponse.json({ error: 'alertId and status are required' }, { status: 400 });
    }

    const updated = await db.updateSOSStatus(alertId, status, adminName, notes);
    return NextResponse.json({
      success: true,
      alert: updated,
      message: `SOS incident status changed to ${status}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
