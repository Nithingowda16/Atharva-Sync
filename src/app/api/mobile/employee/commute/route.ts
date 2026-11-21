import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || 'emp-amrutha';

    const { activeTrip, passenger, pendingRequests } = await db.getEmployeeCommute(employeeId);

    if (!activeTrip || !passenger) {
      return NextResponse.json({
        activeCommute: null,
        pendingRequests: pendingRequests || [],
        message: pendingRequests && pendingRequests.length > 0
          ? `Ride scheduled (${pendingRequests[0].shiftTime} ${pendingRequests[0].direction}) - Awaiting Admin & Vendor allocation.`
          : 'No active commute scheduled for today.',
      });
    }

    const activeCommute = {
      tripId: activeTrip.id,
      tripCode: activeTrip.tripCode,
      type: activeTrip.type,
      shiftDate: activeTrip.shiftDate,
      shiftTime: activeTrip.shiftTime,
      status: activeTrip.status,
      employeeId: passenger.employeeId,
      employeeCode: passenger.employeeCode,
      employeeName: passenger.fullName,
      scheduledPickupTime: passenger.scheduledPickupTime,
      boardingOtp: passenger.boardingOtp,
      boardingStatus: passenger.boardingStatus,
      boardedAt: passenger.boardedAt,
      isLocationReassigned: passenger.isLocationReassigned || false,
      pickup: {
        address: passenger.pickupAddress,
        latitude: passenger.pickupCoords.latitude,
        longitude: passenger.pickupCoords.longitude,
      },
      drop: {
        address: passenger.dropAddress,
        latitude: passenger.dropCoords.latitude,
        longitude: passenger.dropCoords.longitude,
      },
      vehicle: {
        plateNumber: activeTrip.vehicle.plateNumber,
        model: `${activeTrip.vehicle.make} ${activeTrip.vehicle.model}`,
        color: activeTrip.vehicle.color,
      },
      driver: {
        name: activeTrip.driver.fullName,
        phone: activeTrip.driver.phone,
        rating: `${activeTrip.driver.rating} ★`,
        currentLocation: activeTrip.currentLocation || {
          latitude: passenger.pickupCoords.latitude + 0.004,
          longitude: passenger.pickupCoords.longitude - 0.003,
          speed: 32,
          heading: 45,
          lastUpdated: new Date().toISOString(),
        },
      },
      coRiders: activeTrip.passengers.map((p) => ({
        id: p.id,
        name: p.fullName,
        sequence: p.stopSequence,
        status: p.boardingStatus,
        pickupAddress: p.pickupAddress,
      })),
    };

    return NextResponse.json({ activeCommute });
  } catch (error: any) {
    console.error('Error fetching employee commute:', error);
    return NextResponse.json({ error: error.message || 'Failed to retrieve commute' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId = 'EMP-9042',
      employeeName = 'Amrutha Rao',
      shiftDate = new Date().toISOString().split('T')[0],
      shiftTime = '13:30',
      type = 'LOGIN',
      direction = type,
      bookingType = 'REGULAR_SHIFT',
      pickupAddress = 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
      dropAddress = 'Enterprise Tech Park, Tower B',
      pickupCoords = { latitude: 12.9719, longitude: 77.6412 },
      dropCoords = { latitude: 12.9352, longitude: 77.6946 },
    } = body;

    // 1. Create RideRequestRecord for Admin review & Vendor push
    const rideRequest = await db.createRideRequest({
      employeeId,
      employeeCode: employeeId,
      employeeName,
      employeePhone: '+91 98450 11223',
      department: 'Core Supply Chain & Logistics Engineering',
      direction: direction as 'LOGIN' | 'LOGOUT',
      shiftDate,
      shiftTime,
      officeCampus: 'Enterprise Tech Park, Tower B',
      pickupAddress,
      pickupCoords,
      dropAddress,
      dropCoords,
      bookingType: bookingType as any,
    });

    return NextResponse.json({
      success: true,
      message: `Shift ${shiftTime} on ${shiftDate} successfully booked! Request #${rideRequest.bookingCode} submitted to Admin Portal.`,
      bookingCode: rideRequest.bookingCode,
      boardingOtp: rideRequest.boardingOtp,
      shiftTime,
      shiftDate,
      request: rideRequest,
    });
  } catch (error: any) {
    console.error('Error creating employee booking:', error);
    return NextResponse.json({ error: error.message || 'Failed to book schedule' }, { status: 500 });
  }
}
