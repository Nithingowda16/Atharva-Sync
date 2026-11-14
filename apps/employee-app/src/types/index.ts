/**
 * Atharva Travels ETS — Employee Android App
 * Comprehensive TypeScript Domain & Navigation Types
 */

export type ScreenName =
  | 'Splash'
  | 'Login'
  | 'ForgotPassword'
  | 'Home'
  | 'MyBookings'
  | 'RideDetails'
  | 'LiveTracking'
  | 'QrBoarding'
  | 'CreateSchedule'
  | 'ShiftSelection'
  | 'PickupLocation'
  | 'RouteSelection'
  | 'BookingReview'
  | 'Profile'
  | 'History'
  | 'MyAddress'
  | 'Notifications'
  | 'HelpSupport'
  | 'Feedback'
  | 'Settings'
  | 'EmergencySos';

export type MainTab = 'Bookings' | 'Profile';

export type JourneyDirection = 'LOGIN' | 'LOGOUT'; // LOGIN = Go to work, LOGOUT = Return home

export interface ShiftRecord {
  id: string;
  shiftTime: string;
  travelDurationMinutes: number;
  direction: JourneyDirection;
  shiftWindow?: string;
  cutoffTime?: string;
  isAvailable?: boolean;
}

export interface PickupPoint {
  id: string;
  name: string;
  landmark?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isPrimary?: boolean;
}

export interface DestinationOffice {
  id: string;
  name: string;
  campus: string;
  city: string;
  address?: string;
}

export interface RouteRecord {
  id: string;
  routeCode: string;
  name: string;
  direction: JourneyDirection;
  estimatedDurationMinutes: number;
  totalDistanceKm?: number;
  stopsCount?: number;
}

export interface BookingDraft {
  date?: string;
  direction: JourneyDirection;
  pickupPoint?: PickupPoint;
  destination?: DestinationOffice;
  shift?: ShiftRecord;
  route?: RouteRecord;
  specialNeeds?: boolean;
  notes?: string;
}

export type TripStatus =
  | 'SCHEDULED'
  | 'DRIVER_ASSIGNED'
  | 'TRIP_STARTED'
  | 'ON_THE_WAY'
  | 'APPROACHING_STOP'
  | 'ARRIVED_AT_STOP'
  | 'BOARDING'
  | 'DEPARTED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED';

export type BoardingStatus = 'WAITING' | 'BOARDED' | 'NO_SHOW' | 'CANCELLED';

export interface AssignedVehicle {
  id: string;
  plateNumber: string;
  model: string;
  make: string;
  color?: string;
  seatingCapacity?: number;
}

export interface AssignedDriver {
  id: string;
  fullName: string;
  phone: string;
  rating?: number;
}

export interface RideRecord {
  id: string;
  tripCode: string;
  date: string;
  shiftTime: string;
  direction: JourneyDirection;
  status: TripStatus;
  boardingStatus: BoardingStatus;
  boardingOtp?: string;
  qrPayload?: string;
  pickup: PickupPoint;
  destination: DestinationOffice;
  route?: RouteRecord;
  vehicle?: AssignedVehicle;
  driver?: AssignedDriver;
  etaMinutes?: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    lastUpdated?: string;
  };
}

export interface UserAddress {
  id: string;
  label: string; // 'Home', 'Office', 'Secondary'
  addressLine: string;
  landmark?: string;
  city: string;
  pincode?: string;
  isPrimary: boolean;
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  type: 'TRIP_UPDATE' | 'DELAY' | 'BOARDING' | 'ALERT' | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
  tripId?: string;
}

export interface SupportTicket {
  id: string;
  ticketCode: string;
  subject: string;
  category: 'ROSTER_ISSUE' | 'CAB_DELAY' | 'ESCORT_SECURITY' | 'APP_ISSUE' | 'OTHER';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  description: string;
}

export interface FeedbackSubmission {
  rating: number;
  category: string;
  feedbackText: string;
  tripId?: string;
}

export interface UserProfile {
  employeeId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  department?: string;
  primaryOffice?: string;
}

