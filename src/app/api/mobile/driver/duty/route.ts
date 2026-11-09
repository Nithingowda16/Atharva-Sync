import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { DriverDutyStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { driverId, dutyStatus } = await request.json();

    if (!driverId || !dutyStatus) {
      return NextResponse.json({ error: 'driverId and dutyStatus are required' }, { status: 400 });
    }

    const updated = await prisma.driverProfile.updateMany({
      where: { userId: driverId },
      data: {
        dutyStatus: dutyStatus as DriverDutyStatus,
      },
    });

    return NextResponse.json({
      success: true,
      driverId,
      dutyStatus,
      message: `Driver duty status updated to ${dutyStatus}`,
    });
  } catch (error) {
    console.error('Error updating driver duty:', error);
    return NextResponse.json({ error: 'Failed to update duty status' }, { status: 500 });
  }
}

