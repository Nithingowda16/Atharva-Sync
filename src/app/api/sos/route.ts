import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { validateAdminSession } from '@/lib/auth';
import { dispatchPushNotification } from '@/lib/push-service';

export async function POST(request: NextRequest) {
  try {
    const session = await validateAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Access Denied: Restricted access portal. Authorized administrator session required.' },
        { status: 403 }
      );
    }

    const { employeeId, tripId, latitude, longitude, incidentNotes } = await request.json();

    if (!employeeId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'employeeId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    // 1. Create emergency alert record
    const alert = await prisma.emergencyAlert.create({
      data: {
        employeeId,
        tripId: tripId || null,
        reportedLatitude: latitude,
        reportedLongitude: longitude,
        status: 'ACTIVE',
        incidentNotes: incidentNotes || 'SOS triggered by employee from mobile/portal interface.',
      },
      include: {
        employee: {
          include: {
            employeeProfile: true,
          },
        },
      },
    });

    // 2. Alert all active Admins via push notification
    const admins = await prisma.user.findMany({
      where: { role: 'ATHARVA_ADMIN', isActive: true },
      select: { id: true },
    });

    for (const admin of admins) {
      await dispatchPushNotification({
        recipientUserId: admin.id,
        title: '🚨 CRITICAL: SOS ALERT TRIGGERED',
        body: `SOS triggered by ${alert.employee.fullName} (${alert.employee.phoneNumber}) at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        data: {
          type: 'EMERGENCY_SOS',
          alertId: alert.id,
          employeeId,
          latitude,
          longitude,
        },
      });
    }

    return NextResponse.json({
      success: true,
      alertId: alert.id,
      status: alert.status,
      emergencyContact: {
        name: alert.employee.employeeProfile?.emergencyContactName,
        phone: alert.employee.employeeProfile?.emergencyContactPhone,
      },
      message: 'SOS successfully registered. Transport Command Center alerted.',
    });
  } catch (error) {
    console.error('Error in SOS route:', error);
    return NextResponse.json({ error: 'Failed to process SOS alert' }, { status: 500 });
  }
}

