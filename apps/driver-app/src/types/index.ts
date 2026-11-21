/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Core TypeScript Definitions & Models
 */

export type Language = 'en' | 'kn' | 'hi';

export type DriverDutyStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE';

export type ComplianceStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export interface DriverProfile {
  id: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  rating: number;
  totalTripsCompleted: number;
  vendorName?: string;
  assignedVehicleId: string;
  assignedVehiclePlate: string;
  assignedVehicleModel: string;
  dutyStatus: DriverDutyStatus;
  complianceStatus: ComplianceStatus;
}

export type PassengerStatus = 'WAITING' | 'BOARDED' | 'NO_SHOW';

export interface PassengerStop {
  id: string;
  employeeId: string;
  name: string;
  phone: string;
  sequence: number;
  address: string;
  coords: {
    latitude: number;
    longitude: number;
  };
  scheduledTime: string;
  boardingOtp: string;
  status: PassengerStatus;
  isReassigned?: boolean;
  reassignmentReason?: string;
  boardedAt?: string;
  noShowAt?: string;
}

export type TripType = 'LOGIN' | 'LOGOUT' | 'RENTALZ' | 'FLEXI';

export type TripStatus = 'SCHEDULED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';

export interface TripRecord {
  id: string;
  tripCode: string;
  type: TripType;
  shiftDate: string;
  shiftTime: string;
  corporateClient: string;
  routeName: string;
  status: TripStatus;
  vehiclePlate: string;
  totalDistanceKm: number;
  estimatedMinutes: number;
  startOdometer?: number;
  endOdometer?: number;
  stops: PassengerStop[];
  startedAt?: string;
  completedAt?: string;
}

export type OfflineActionType =
  | 'START_TRIP'
  | 'REACHED_STOP'
  | 'BOARD_PASSENGER'
  | 'REPORT_NO_SHOW'
  | 'COMPLETE_TRIP';

export interface QueuedAction {
  id: string;
  action: OfflineActionType;
  tripId: string;
  payload: Record<string, any>;
  timestamp: string;
}

export type DriverScreenName =
  | 'Login'
  | 'VehicleCheckin'
  | 'DutyHome'
  | 'ActiveTrip'
  | 'TripCompletion'
  | 'EmergencySos'
  | 'DriverProfile'
  | 'UpcomingTrips'
  | 'CompletedTrips'
  | 'OfficesNavigation'
  | 'SwitchOffices'
  | 'About';
