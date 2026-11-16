import { NextResponse } from 'next/server';

const recentStatusBroadcasts: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tripId, employeeId = '111', message, senderRole = 'EMPLOYEE' } = body;

    const record = {
      id: `broadcast-${Date.now()}`,
      tripId: tripId || 'ATH-8821',
      employeeId,
      senderRole,
      message,
      timestamp: new Date().toISOString(),
    };

    recentStatusBroadcasts.unshift(record);
    if (recentStatusBroadcasts.length > 50) {
      recentStatusBroadcasts.pop();
    }

    return NextResponse.json({
      success: true,
      message: 'Status broadcast sent successfully.',
      broadcast: record,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send broadcast' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({
    success: true,
    broadcasts: recentStatusBroadcasts,
  });
}

