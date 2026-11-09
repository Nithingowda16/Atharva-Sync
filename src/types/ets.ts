import { UserRole as PrismaUserRole } from '@prisma/client';

export type UserRole = PrismaUserRole | 'ADMIN';
export type TripType = 'PICKUP' | 'DROP';
export type TripStatus = 'SCHEDULED' | 'DRIVER_ASSIGNED' | 'EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type BoardingStatus = 'SCHEDULED' | 'DRIVER_ARRIVED' | 'BOARDED' | 'NO_SHOW' | 'CANCELLED' | 'DROPPED';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ReassignLocationRequest {
  tripId: string;
  employeeId: string;
  newCoordinates: Coordinates;
  updatedAddress: string;
  reason: string;
  initiatedByRole: UserRole;
}

export interface ReassignLocationResponse {
  success: boolean;
  message: string;
  eventId: string;
  updatedTripPassengerId: string;
  driverNotified: boolean;
  distanceDeltaKm: number;
}

export interface TelemetryUpdatePayload {
  tripId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: string;
}

export interface VerifyOtpRequest {
  tripId: string;
  employeeId: string;
  boardingOtp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  boardedAt: string;
  nextPassenger?: {
    employeeName: string;
    pickupAddress: string;
    latitude: number;
    longitude: number;
  };
}

export interface CorporateRosterMetric {
  totalRostered: number;
  allocatedVehicles: number;
  activeTrips: number;
  safeEscortsDeployed: number;
  onTimeSlaPercentage: number;
}

export interface DriverDutyInfo {
  driverId: string;
  fullName: string;
  phone: string;
  vehiclePlate: string;
  vehicleModel: string;
  dutyStatus: 'OFFLINE' | 'AVAILABLE' | 'ON_TRIP' | 'ON_BREAK';
  activeTripId?: string;
  passengersToPickupCount: number;
}


export interface PushNotificationPayload {
  recipientUserId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}
