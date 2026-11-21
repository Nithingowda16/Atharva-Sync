import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as any) || undefined;
    const employeeId = searchParams.get('employeeId') || undefined;
    const shiftDate = searchParams.get('shiftDate') || undefined;

    const requests = await db.getRideRequests({ status, employeeId, shiftDate });
    return NextResponse.json({ success: true, count: requests.length, requests });
  } catch (error: any) {
    console.error('Error fetching ride requests:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch ride requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Employee Creates a Ride Request
    if (action === 'create_request') {
      const created = await db.createRideRequest({
        employeeId: body.employeeId || 'EMP-9042',
        employeeCode: body.employeeCode || body.employeeId || 'EMP-9042',
        employeeName: body.employeeName || 'Amrutha Rao',
        employeePhone: body.employeePhone || '+91 98450 11223',
        department: body.department || 'Core Supply Chain Engineering',
        direction: body.direction || 'LOGIN',
        shiftDate: body.shiftDate || new Date().toISOString().split('T')[0],
        shiftTime: body.shiftTime || '13:30',
        officeCampus: body.officeCampus || 'Enterprise Tech Park, Tower B',
        pickupAddress: body.pickupAddress || 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
        pickupCoords: body.pickupCoords || { latitude: 12.9719, longitude: 77.6412 },
        dropAddress: body.dropAddress || 'Enterprise Tech Park, Tower B',
        dropCoords: body.dropCoords || { latitude: 12.9352, longitude: 77.6946 },
        bookingType: body.bookingType || 'REGULAR_SHIFT',
      });

      return NextResponse.json({
        success: true,
        message: `Ride request #${created.bookingCode} registered! Visible in Admin Portal for approval.`,
        request: created,
      });
    }

    // 2. Admin Approves & Pushes Request to Vendor Portal
    if (action === 'push_to_vendor') {
      if (!body.requestId) {
        return NextResponse.json({ error: 'requestId is required for push_to_vendor' }, { status: 400 });
      }

      const pushed = await db.pushRequestToVendor(
        body.requestId,
        body.targetVendor || 'Eco Rent a Car',
        body.adminActor || 'Atharva Super Admin'
      );

      return NextResponse.json({
        success: true,
        message: `Request #${pushed.bookingCode} pushed to Vendor Portal (${pushed.targetVendorName})!`,
        request: pushed,
      });
    }

    // 3. Vendor Allocates Cab & Driver
    if (action === 'assign_cab') {
      if (!body.requestId || !body.cabPlate) {
        return NextResponse.json({ error: 'requestId and cabPlate are required for assign_cab' }, { status: 400 });
      }

      const result = await db.assignVendorToRequest({
        requestId: body.requestId,
        cabPlate: body.cabPlate,
        driverId: body.driverId,
        driverName: body.driverName,
        driverPhone: body.driverPhone,
        vendorActor: body.vendorActor || 'Corporate Vendor Desk',
      });

      return NextResponse.json({
        success: true,
        message: `Cab ${body.cabPlate} allocated to Trip #${result.trip.tripCode}! Dispatched to Driver ${result.request.assignedDriverName}.`,
        request: result.request,
        trip: result.trip,
      });
    }

    // 4. Cancel Request
    if (action === 'cancel') {
      if (!body.requestId) {
        return NextResponse.json({ error: 'requestId is required for cancel' }, { status: 400 });
      }
      const cancelled = await db.cancelRideRequest(body.requestId, body.reason);
      return NextResponse.json({ success: true, request: cancelled });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error handling request action:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
