import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const shiftTime = searchParams.get('shiftTime') || undefined;
    const type = (searchParams.get('type') as 'LOGIN' | 'LOGOUT') || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const search = searchParams.get('search') || undefined;

    const trips = await db.getTrips({
      date,
      shiftTime,
      type,
      status,
      search,
    });

    return NextResponse.json({ success: true, count: trips.length, trips });
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch trips' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.shiftDate || !body.shiftTime || !body.routeName || !body.vehicleId || !body.driverId) {
      return NextResponse.json(
        { error: 'shiftDate, shiftTime, routeName, vehicleId, and driverId are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.passengers) || body.passengers.length === 0) {
      return NextResponse.json(
        { error: 'At least one passenger must be assigned to the trip' },
        { status: 400 }
      );
    }

    const createdTrip = await db.createTrip({
      shiftDate: body.shiftDate,
      shiftTime: body.shiftTime,
      type: body.type || 'LOGIN',
      corporateClient: body.corporateClient || 'Enterprise Tech Park',
      routeName: body.routeName,
      vehicleId: body.vehicleId,
      driverId: body.driverId,
      passengers: body.passengers,
      actor: body.actor || 'Atharva Super Admin',
    });

    return NextResponse.json({
      success: true,
      message: `Trip ${createdTrip.tripCode} successfully created and assigned to vehicle ${createdTrip.vehicle.plateNumber}.`,
      trip: createdTrip,
    });
  } catch (error: any) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: error.message || 'Failed to create trip' }, { status: 500 });
  }
}
