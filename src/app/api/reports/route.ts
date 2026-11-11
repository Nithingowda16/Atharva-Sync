import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const metrics = await db.getReportsMetrics();
    const vehicles = await db.getVehicles();
    const drivers = await db.getDrivers();

    return NextResponse.json({
      success: true,
      metrics,
      vehicles: vehicles.map((v) => ({
        id: v.id,
        plate: v.plateNumber,
        model: `${v.make} ${v.model}`,
        capacity: v.seatingCapacity,
        compliance: v.complianceStatus,
        insuranceExpiry: v.insuranceExpiry,
        fitnessExpiry: v.fitnessExpiry,
      })),
      drivers: drivers.map((d) => ({
        id: d.id,
        name: d.fullName,
        phone: d.phone,
        rating: d.rating,
        totalTrips: d.totalTripsCompleted,
        duty: d.dutyStatus,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
