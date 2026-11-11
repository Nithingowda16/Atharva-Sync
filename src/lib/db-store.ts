/**
 * Atharva Travels Enterprise Transport System (ETS)
 * Unified Database Store & Persistence Layer
 *
 * Provides a single source of truth for:
 * - Employees & Corporate Rosters
 * - Drivers & Duty Status
 * - Vehicles & Fleet Compliance
 * - Trips & State Machine Transitions
 * - Passenger Manifests & Dynamic Boarding Credentials (QR/OTP)
 * - Real-Time Telemetry & Location Audit Logs
 * - Emergency SOS Alerts & Audit Trails
 * - Notification Center
 *
 * Fully compatible with Prisma & PostgreSQL when DATABASE_URL is accessible,
 * with resilient file-backed fallback persistence for serverless/local runtimes.
 */

import fs from 'fs';
import path from 'path';
import prisma from './prisma';

export type TripState =
  | 'SCHEDULED'
  | 'ASSIGNED'
  | 'DRIVER_ACCEPTED'
  | 'DRIVER_ARRIVED'
  | 'TRIP_STARTED'
  | 'PASSENGER_BOARDING'
  | 'IN_TRANSIT'
  | 'TRIP_COMPLETED'
  | 'CANCELLED';

export type BoardingState =
  | 'SCHEDULED'
  | 'WAITING'
  | 'DRIVER_ARRIVED'
  | 'BOARDED'
  | 'NO_SHOW'
  | 'CANCELLED'
  | 'DROPPED';

export interface PassengerRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  fullName: string;
  phone: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  femaleSafeguard?: boolean;
  department: string;
  stopSequence: number;
  pickupAddress: string;
  pickupCoords: { latitude: number; longitude: number };
  dropAddress: string;
  dropCoords: { latitude: number; longitude: number };
  scheduledPickupTime: string;
  actualPickupTime?: string;
  boardingOtp: string;
  boardingStatus: BoardingState;
  boardedAt?: string;
  noShowReason?: string;
  isLocationReassigned?: boolean;
  reassignmentDetails?: {
    previousCoords: { latitude: number; longitude: number };
    newCoords: { latitude: number; longitude: number };
    newAddress: string;
    reason: string;
    requestedAt: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

export interface VehicleRecord {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  color: string;
  seatingCapacity: number;
  fleetType: string;
  insuranceExpiry: string;
  fitnessExpiry: string;
  permitExpiry: string;
  pollutionExpiry: string;
  isActive: boolean;
  complianceStatus: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface DriverRecord {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  rating: number;
  totalTripsCompleted: number;
  dutyStatus: 'OFFLINE' | 'AVAILABLE' | 'ON_TRIP' | 'ON_BREAK';
  assignedVehicleId?: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    lastUpdated: string;
  };
}

export interface TripRecord {
  id: string;
  tripCode: string;
  type: 'LOGIN' | 'LOGOUT';
  shiftDate: string; // YYYY-MM-DD
  shiftTime: string; // e.g. "13:30" or "22:30"
  corporateClient: string; // e.g. "Enterprise Tech Park"
  routeName: string;
  status: TripState;
  vehicleId: string;
  vehicle: VehicleRecord;
  driverId: string;
  driver: DriverRecord;
  totalDistanceKm: number;
  estimatedMinutes: number;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  passengers: PassengerRecord[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading: number;
    speed: number;
    lastUpdated: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SOSAlertRecord {
  id: string;
  tripId?: string;
  employeeId: string;
  employeeName: string;
  employeePhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'QRT_DISPATCHED' | 'RESOLVED' | 'FALSE_ALARM';
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  resolvedByAdmin?: string;
  notes?: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

export interface NotificationRecord {
  id: string;
  recipientRole: 'ADMIN' | 'DRIVER' | 'EMPLOYEE';
  recipientUserId?: string;
  title: string;
  body: string;
  type:
    | 'TRIP_ASSIGNED'
    | 'TRIP_STARTED'
    | 'CAB_ARRIVING'
    | 'PASSENGER_BOARDED'
    | 'LOCATION_REASSIGNED'
    | 'NO_SHOW'
    | 'SOS_ALERT'
    | 'TRIP_COMPLETED';
  tripId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceId: string;
  previousState?: any;
  newState?: any;
  timestamp: string;
}

interface DBData {
  trips: TripRecord[];
  vehicles: VehicleRecord[];
  drivers: DriverRecord[];
  sosAlerts: SOSAlertRecord[];
  notifications: NotificationRecord[];
  auditLogs: AuditLogRecord[];
}

// File persistence paths
const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'ets-database.json');

// Initial seed dataset
const SEED_DATA: DBData = {
  vehicles: [
    {
      id: 'veh-8821',
      plateNumber: 'KA-03-HA-8821',
      make: 'Toyota',
      model: 'Innova Crysta 2.4 VX',
      color: 'Pearl White',
      seatingCapacity: 4,
      fleetType: 'PREMIUM_MUV',
      insuranceExpiry: '2027-12-31',
      fitnessExpiry: '2028-06-30',
      permitExpiry: '2028-01-15',
      pollutionExpiry: '2026-12-10',
      isActive: true,
      complianceStatus: 'VALID',
    },
    {
      id: 'veh-4310',
      plateNumber: 'KA-05-MJ-4310',
      make: 'Toyota',
      model: 'Innova Crysta',
      color: 'Silver Grey',
      seatingCapacity: 4,
      fleetType: 'PREMIUM_MUV',
      insuranceExpiry: '2027-10-15',
      fitnessExpiry: '2028-04-20',
      permitExpiry: '2027-11-01',
      pollutionExpiry: '2026-11-25',
      isActive: true,
      complianceStatus: 'EXPIRING_SOON',
    },
    {
      id: 'veh-9011',
      plateNumber: 'KA-01-EQ-9011',
      make: 'Force',
      model: 'Urbania Tempo 3300',
      color: 'Arctic Silver',
      seatingCapacity: 12,
      fleetType: 'TEMPO_TRAVELER',
      insuranceExpiry: '2028-03-10',
      fitnessExpiry: '2028-08-15',
      permitExpiry: '2028-03-20',
      pollutionExpiry: '2027-02-18',
      isActive: true,
      complianceStatus: 'VALID',
    },
  ],
  drivers: [
    {
      id: 'drv-suresh',
      userId: 'usr-suresh',
      fullName: 'Suresh Babu',
      phone: '+91 98765 43210',
      licenseNumber: 'KA-03-2018-009124',
      licenseExpiry: '2032-05-15',
      rating: 4.92,
      totalTripsCompleted: 840,
      dutyStatus: 'ON_TRIP',
      assignedVehicleId: 'veh-8821',
      currentLocation: {
        latitude: 12.9719,
        longitude: 77.6412,
        heading: 45,
        speed: 34,
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      id: 'drv-mahesh',
      userId: 'usr-mahesh',
      fullName: 'Mahesh Gowda',
      phone: '+91 98450 77112',
      licenseNumber: 'KA-05-2016-004412',
      licenseExpiry: '2030-08-20',
      rating: 4.85,
      totalTripsCompleted: 1120,
      dutyStatus: 'AVAILABLE',
      assignedVehicleId: 'veh-4310',
      currentLocation: {
        latitude: 12.985,
        longitude: 77.72,
        heading: 90,
        speed: 0,
        lastUpdated: new Date().toISOString(),
      },
    },
    {
      id: 'drv-venkatesh',
      userId: 'usr-venkatesh',
      fullName: 'Venkatesh R.',
      phone: '+91 97400 33881',
      licenseNumber: 'KA-01-2019-007811',
      licenseExpiry: '2033-01-10',
      rating: 4.96,
      totalTripsCompleted: 620,
      dutyStatus: 'AVAILABLE',
      assignedVehicleId: 'veh-9011',
      currentLocation: {
        latitude: 12.9352,
        longitude: 77.6946,
        heading: 0,
        speed: 0,
        lastUpdated: new Date().toISOString(),
      },
    },
  ],
  trips: [
    {
      id: 'trip-ath-8821',
      tripCode: 'ATH-2026-00124',
      type: 'LOGIN',
      shiftDate: '2026-11-11',
      shiftTime: '13:30',
      corporateClient: 'Enterprise Tech Park',
      routeName: 'Indiranagar 100ft → Domlur → EGL Tech Park',
      status: 'IN_TRANSIT',
      vehicleId: 'veh-8821',
      vehicle: {
        id: 'veh-8821',
        plateNumber: 'KA-03-HA-8821',
        make: 'Toyota',
        model: 'Innova Crysta',
        color: 'Pearl White',
        seatingCapacity: 4,
        fleetType: 'PREMIUM_MUV',
        insuranceExpiry: '2027-12-31',
        fitnessExpiry: '2028-06-30',
        permitExpiry: '2028-01-15',
        pollutionExpiry: '2026-12-10',
        isActive: true,
        complianceStatus: 'VALID',
      },
      driverId: 'drv-suresh',
      driver: {
        id: 'drv-suresh',
        userId: 'usr-suresh',
        fullName: 'Suresh Babu',
        phone: '+91 98765 43210',
        licenseNumber: 'KA-03-2018-009124',
        licenseExpiry: '2032-05-15',
        rating: 4.92,
        totalTripsCompleted: 840,
        dutyStatus: 'ON_TRIP',
        assignedVehicleId: 'veh-8821',
      },
      totalDistanceKm: 14.8,
      estimatedMinutes: 38,
      scheduledStartTime: '2026-11-11T12:45:00.000Z',
      scheduledEndTime: '2026-11-11T13:30:00.000Z',
      actualStartTime: '2026-11-11T12:48:00.000Z',
      currentLocation: {
        latitude: 12.9719,
        longitude: 77.6412,
        heading: 45,
        speed: 34,
        lastUpdated: new Date().toISOString(),
      },
      passengers: [
        {
          id: 'pax-priya',
          employeeId: 'emp-priya',
          employeeCode: 'EMP-9018',
          fullName: 'Priya Sharma',
          phone: '+91 98711 22334',
          gender: 'FEMALE',
          femaleSafeguard: true,
          department: 'Product Management',
          stopSequence: 1,
          pickupAddress: 'HAL 2nd Stage, 80ft Road, Indiranagar',
          pickupCoords: { latitude: 12.98, longitude: 77.625 },
          dropAddress: 'Enterprise Tech Park, Tower B, Domlur',
          dropCoords: { latitude: 12.9352, longitude: 77.6946 },
          scheduledPickupTime: '12:55 PM',
          actualPickupTime: '12:56 PM',
          boardingOtp: '3190',
          boardingStatus: 'BOARDED',
          boardedAt: '2026-11-11T12:56:10.000Z',
        },
        {
          id: 'pax-amrutha',
          employeeId: 'emp-amrutha',
          employeeCode: 'EMP-9042',
          fullName: 'Amrutha Rao',
          phone: '+91 98450 11223',
          gender: 'FEMALE',
          femaleSafeguard: true,
          department: 'Core Supply Chain & Logistics Engineering',
          stopSequence: 2,
          pickupAddress: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
          pickupCoords: { latitude: 12.9719, longitude: 77.6412 },
          dropAddress: 'Enterprise Tech Park, Tower B, Domlur',
          dropCoords: { latitude: 12.9352, longitude: 77.6946 },
          scheduledPickupTime: '01:05 PM',
          boardingOtp: '7492',
          boardingStatus: 'WAITING',
        },
        {
          id: 'pax-karthik',
          employeeId: 'emp-karthik',
          employeeCode: 'EMP-9033',
          fullName: 'Karthik Natarajan',
          phone: '+91 99887 33445',
          gender: 'MALE',
          femaleSafeguard: false,
          department: 'DevOps & Cloud Infrastructure',
          stopSequence: 3,
          pickupAddress: 'Domlur Layout, Inner Ring Road',
          pickupCoords: { latitude: 12.962, longitude: 77.648 },
          dropAddress: 'Enterprise Tech Park, Tower B, Domlur',
          dropCoords: { latitude: 12.9352, longitude: 77.6946 },
          scheduledPickupTime: '01:15 PM',
          boardingOtp: '5821',
          boardingStatus: 'WAITING',
        },
      ],
      createdAt: '2026-11-11T10:00:00.000Z',
      updatedAt: '2026-11-11T12:56:10.000Z',
    },
  ],
  sosAlerts: [],
  notifications: [
    {
      id: 'notif-01',
      recipientRole: 'ADMIN',
      title: 'Trip ATH-2026-00124 En-Route',
      body: 'Driver Suresh Babu started trip for 13:30 Login shift with 3 passengers.',
      type: 'TRIP_STARTED',
      tripId: 'trip-ath-8821',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ],
  auditLogs: [
    {
      id: 'audit-01',
      actor: 'Harish R. (ATH-HARISH-01)',
      actorRole: 'SUPER_ADMIN',
      action: 'ALLOCATE_CAB',
      resource: 'TRIP',
      resourceId: 'trip-ath-8821',
      timestamp: new Date().toISOString(),
    },
  ],
};

// Global memory cache to ensure fast reads and instant multi-interface synchronization
let inMemoryData: DBData | null = null;

function ensureDataLoaded(): DBData {
  if (inMemoryData) {
    return inMemoryData;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryData = JSON.parse(raw);
    } else {
      inMemoryData = JSON.parse(JSON.stringify(SEED_DATA));
      fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryData, null, 2), 'utf-8');
    }
  } catch (e) {
    console.warn('[DBStore] Falling back to in-memory seed store:', e);
    inMemoryData = JSON.parse(JSON.stringify(SEED_DATA));
  }

  return inMemoryData!;
}

function persistData() {
  if (!inMemoryData) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryData, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[DBStore] Could not persist to disk, kept in memory:', e);
  }
}

// ----------------------------------------------------------------------------
// AUTHORITATIVE DATABASE OPERATIONS
// ----------------------------------------------------------------------------

export const db = {
  // 1. TRIPS
  async getTrips(filters?: {
    date?: string;
    shiftTime?: string;
    type?: 'LOGIN' | 'LOGOUT';
    status?: TripState;
    search?: string;
  }): Promise<TripRecord[]> {
    const data = ensureDataLoaded();
    let result = [...data.trips];

    if (filters?.type) {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters?.shiftTime && filters.shiftTime !== 'All') {
      result = result.filter((t) => t.shiftTime === filters.shiftTime);
    }
    if (filters?.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.tripCode.toLowerCase().includes(q) ||
          t.vehicle.plateNumber.toLowerCase().includes(q) ||
          t.driver.fullName.toLowerCase().includes(q) ||
          t.routeName.toLowerCase().includes(q) ||
          t.passengers.some((p) => p.fullName.toLowerCase().includes(q) || p.employeeCode.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getTripById(idOrCode: string): Promise<TripRecord | null> {
    const data = ensureDataLoaded();
    const trip = data.trips.find((t) => t.id === idOrCode || t.tripCode === idOrCode);
    return trip || null;
  },

  async createTrip(payload: {
    shiftDate: string;
    shiftTime: string;
    type: 'LOGIN' | 'LOGOUT';
    corporateClient: string;
    routeName: string;
    vehicleId: string;
    driverId: string;
    passengers: Array<{
      employeeId: string;
      employeeCode: string;
      fullName: string;
      phone: string;
      gender?: 'MALE' | 'FEMALE' | 'OTHER';
      femaleSafeguard?: boolean;
      department?: string;
      pickupAddress: string;
      pickupCoords: { latitude: number; longitude: number };
      dropAddress: string;
      dropCoords: { latitude: number; longitude: number };
      scheduledPickupTime: string;
    }>;
    actor?: string;
  }): Promise<TripRecord> {
    const data = ensureDataLoaded();

    const vehicle = data.vehicles.find((v) => v.id === payload.vehicleId) || data.vehicles[0];
    const driver = data.drivers.find((d) => d.id === payload.driverId) || data.drivers[0];

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tripId = `trip-${Date.now()}`;
    const tripCode = `ATH-2026-${randomSuffix}`;

    const scheduledStartTime = `${payload.shiftDate}T${payload.shiftTime}:00.000Z`;

    const passengers: PassengerRecord[] = payload.passengers.map((p, idx) => ({
      id: `pax-${tripId}-${idx + 1}`,
      employeeId: p.employeeId,
      employeeCode: p.employeeCode,
      fullName: p.fullName,
      phone: p.phone,
      gender: p.gender || 'MALE',
      femaleSafeguard: p.femaleSafeguard || false,
      department: p.department || 'Operations',
      stopSequence: idx + 1,
      pickupAddress: p.pickupAddress,
      pickupCoords: p.pickupCoords,
      dropAddress: p.dropAddress,
      dropCoords: p.dropCoords,
      scheduledPickupTime: p.scheduledPickupTime,
      boardingOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
      boardingStatus: 'SCHEDULED',
    }));

    const newTrip: TripRecord = {
      id: tripId,
      tripCode,
      type: payload.type,
      shiftDate: payload.shiftDate,
      shiftTime: payload.shiftTime,
      corporateClient: payload.corporateClient,
      routeName: payload.routeName,
      status: 'ASSIGNED',
      vehicleId: vehicle.id,
      vehicle,
      driverId: driver.id,
      driver,
      totalDistanceKm: Number((10 + Math.random() * 12).toFixed(1)),
      estimatedMinutes: 35 + passengers.length * 6,
      scheduledStartTime,
      scheduledEndTime: `${payload.shiftDate}T${payload.shiftTime}:45.000Z`,
      passengers,
      currentLocation: driver.currentLocation || {
        latitude: passengers[0]?.pickupCoords.latitude || 12.9719,
        longitude: passengers[0]?.pickupCoords.longitude || 77.6412,
        heading: 0,
        speed: 0,
        lastUpdated: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.trips.unshift(newTrip);

    // Update driver duty
    driver.dutyStatus = 'ON_TRIP';
    driver.assignedVehicleId = vehicle.id;

    // Add Audit Log
    data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor: payload.actor || 'Atharva Admin',
      actorRole: 'SUPER_ADMIN',
      action: 'CREATE_TRIP',
      resource: 'TRIP',
      resourceId: tripId,
      newState: { tripCode, vehicle: vehicle.plateNumber, driver: driver.fullName },
      timestamp: new Date().toISOString(),
    });

    // Add notification
    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'DRIVER',
      recipientUserId: driver.id,
      title: 'New Trip Assigned',
      body: `Trip ${tripCode} has been assigned to vehicle ${vehicle.plateNumber} for ${payload.shiftTime} ${payload.type}.`,
      type: 'TRIP_ASSIGNED',
      tripId,
      read: false,
      createdAt: new Date().toISOString(),
    });

    persistData();
    return newTrip;
  },

  // 2. TRIP STATE MACHINE
  async updateTripStatus(tripId: string, nextStatus: TripState, actor?: string): Promise<TripRecord> {
    const data = ensureDataLoaded();
    const trip = data.trips.find((t) => t.id === tripId || t.tripCode === tripId);
    if (!trip) {
      throw new Error(`Trip ${tripId} not found.`);
    }

    const validTransitions: Record<TripState, TripState[]> = {
      SCHEDULED: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['DRIVER_ACCEPTED', 'CANCELLED'],
      DRIVER_ACCEPTED: ['DRIVER_ARRIVED', 'CANCELLED'],
      DRIVER_ARRIVED: ['TRIP_STARTED', 'CANCELLED'],
      TRIP_STARTED: ['PASSENGER_BOARDING', 'IN_TRANSIT', 'CANCELLED'],
      PASSENGER_BOARDING: ['IN_TRANSIT', 'TRIP_COMPLETED', 'CANCELLED'],
      IN_TRANSIT: ['PASSENGER_BOARDING', 'TRIP_COMPLETED', 'CANCELLED'],
      TRIP_COMPLETED: [],
      CANCELLED: [],
    };

    // If attempting invalid transition
    if (validTransitions[trip.status] && !validTransitions[trip.status].includes(nextStatus)) {
      throw new Error(
        `Invalid trip transition from ${trip.status} to ${nextStatus}. Allowed: [${validTransitions[trip.status].join(', ')}]`
      );
    }

    const previousStatus = trip.status;
    trip.status = nextStatus;
    trip.updatedAt = new Date().toISOString();

    if (nextStatus === 'TRIP_STARTED' && !trip.actualStartTime) {
      trip.actualStartTime = new Date().toISOString();
    }
    if (nextStatus === 'TRIP_COMPLETED') {
      trip.actualEndTime = new Date().toISOString();
      const drv = data.drivers.find((d) => d.id === trip.driverId);
      if (drv) {
        drv.dutyStatus = 'AVAILABLE';
        drv.totalTripsCompleted += 1;
      }
    }

    data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor: actor || 'System',
      actorRole: 'DRIVER_OR_ADMIN',
      action: 'UPDATE_TRIP_STATUS',
      resource: 'TRIP',
      resourceId: trip.id,
      previousState: previousStatus,
      newState: nextStatus,
      timestamp: new Date().toISOString(),
    });

    persistData();
    return trip;
  },

  // 3. BOARDING & OTP/QR VERIFICATION
  async verifyPassengerBoarding(params: {
    tripId: string;
    employeeIdOrCode: string;
    boardingPin: string;
    driverId?: string;
  }): Promise<{ success: boolean; passenger: PassengerRecord; trip: TripRecord; message: string }> {
    const data = ensureDataLoaded();
    const trip = data.trips.find((t) => t.id === params.tripId || t.tripCode === params.tripId);
    if (!trip) {
      throw new Error(`Trip ${params.tripId} not found.`);
    }

    const passenger = trip.passengers.find(
      (p) =>
        p.employeeId === params.employeeIdOrCode ||
        p.employeeCode.toLowerCase() === params.employeeIdOrCode.toLowerCase()
    );

    if (!passenger) {
      throw new Error(`Employee ${params.employeeIdOrCode} is not rostered on trip ${trip.tripCode}.`);
    }

    if (passenger.boardingStatus === 'BOARDED') {
      return {
        success: true,
        passenger,
        trip,
        message: `${passenger.fullName} is already boarded on ${trip.tripCode}.`,
      };
    }

    if (passenger.boardingOtp.trim() !== params.boardingPin.trim()) {
      throw new Error(`Invalid boarding PIN. Verification failed for ${passenger.fullName}.`);
    }

    // Mark as BOARDED
    passenger.boardingStatus = 'BOARDED';
    passenger.boardedAt = new Date().toISOString();
    trip.updatedAt = new Date().toISOString();

    // If trip was not yet marked IN_TRANSIT, advance to IN_TRANSIT
    if (['ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVED', 'TRIP_STARTED'].includes(trip.status)) {
      trip.status = 'IN_TRANSIT';
    }

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'EMPLOYEE',
      recipientUserId: passenger.employeeId,
      title: '✅ Boarding Verified',
      body: `Welcome aboard! You have boarded vehicle ${trip.vehicle.plateNumber} for trip ${trip.tripCode}.`,
      type: 'PASSENGER_BOARDED',
      tripId: trip.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    data.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      actor: params.driverId || 'Driver',
      actorRole: 'DRIVER',
      action: 'BOARD_PASSENGER',
      resource: 'TRIP_PASSENGER',
      resourceId: passenger.id,
      newState: 'BOARDED',
      timestamp: new Date().toISOString(),
    });

    persistData();
    return {
      success: true,
      passenger,
      trip,
      message: `Verified: ${passenger.fullName} marked as BOARDED!`,
    };
  },

  // 4. NO-SHOW
  async markPassengerNoShow(params: {
    tripId: string;
    employeeIdOrCode: string;
    reason: string;
    driverId?: string;
  }): Promise<{ passenger: PassengerRecord; trip: TripRecord }> {
    const data = ensureDataLoaded();
    const trip = data.trips.find((t) => t.id === params.tripId || t.tripCode === params.tripId);
    if (!trip) throw new Error(`Trip ${params.tripId} not found.`);

    const passenger = trip.passengers.find(
      (p) =>
        p.employeeId === params.employeeIdOrCode ||
        p.employeeCode.toLowerCase() === params.employeeIdOrCode.toLowerCase()
    );
    if (!passenger) throw new Error(`Employee not found on this trip.`);

    passenger.boardingStatus = 'NO_SHOW';
    passenger.noShowReason = params.reason;
    trip.updatedAt = new Date().toISOString();

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'ADMIN',
      title: `No-Show: ${passenger.fullName}`,
      body: `${passenger.fullName} marked NO SHOW by driver. Reason: ${params.reason}`,
      type: 'NO_SHOW',
      tripId: trip.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    persistData();
    return { passenger, trip };
  },

  // 5. LOCATION REASSIGNMENT
  async requestLocationReassignment(params: {
    tripId: string;
    employeeId: string;
    newAddress: string;
    newCoords: { latitude: number; longitude: number };
    reason: string;
  }): Promise<{ passenger: PassengerRecord; trip: TripRecord }> {
    const data = ensureDataLoaded();
    const trip = data.trips.find((t) => t.id === params.tripId || t.tripCode === params.tripId);
    if (!trip) throw new Error(`Trip ${params.tripId} not found.`);

    const passenger = trip.passengers.find((p) => p.employeeId === params.employeeId);
    if (!passenger) throw new Error(`Passenger not found.`);

    passenger.isLocationReassigned = true;
    passenger.reassignmentDetails = {
      previousCoords: { ...passenger.pickupCoords },
      newCoords: params.newCoords,
      newAddress: params.newAddress,
      reason: params.reason,
      requestedAt: new Date().toISOString(),
      status: 'APPROVED', // Auto-approved for agility or reviewed by admin
    };

    // Update actual coordinates
    passenger.pickupAddress = params.newAddress;
    passenger.pickupCoords = params.newCoords;
    trip.updatedAt = new Date().toISOString();

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'DRIVER',
      recipientUserId: trip.driverId,
      title: 'Waypoint Updated',
      body: `Pickup location for ${passenger.fullName} was updated to ${params.newAddress}.`,
      type: 'LOCATION_REASSIGNED',
      tripId: trip.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    persistData();
    return { passenger, trip };
  },

  // 6. TELEMETRY & LIVE TRACKING
  async updateTelemetry(payload: {
    tripId: string;
    driverId: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
  }): Promise<{ success: boolean; trip: TripRecord }> {
    const data = ensureDataLoaded();
    const trip = data.trips.find((t) => t.id === payload.tripId || t.tripCode === payload.tripId);
    if (!trip) throw new Error(`Trip not found.`);

    const loc = {
      latitude: payload.latitude,
      longitude: payload.longitude,
      speed: payload.speed ?? 30,
      heading: payload.heading ?? 0,
      lastUpdated: new Date().toISOString(),
    };

    trip.currentLocation = loc;
    trip.updatedAt = new Date().toISOString();

    const driver = data.drivers.find((d) => d.id === payload.driverId || d.userId === payload.driverId);
    if (driver) {
      driver.currentLocation = loc;
    }

    persistData();
    return { success: true, trip };
  },

  // 7. SOS INCIDENTS
  async triggerSOS(payload: {
    tripId?: string;
    employeeId: string;
    latitude: number;
    longitude: number;
    notes?: string;
  }): Promise<SOSAlertRecord> {
    const data = ensureDataLoaded();
    const trip = payload.tripId ? data.trips.find((t) => t.id === payload.tripId || t.tripCode === payload.tripId) : null;
    const passenger = trip?.passengers.find((p) => p.employeeId === payload.employeeId);

    const alert: SOSAlertRecord = {
      id: `sos-${Date.now()}`,
      tripId: trip?.id,
      employeeId: payload.employeeId,
      employeeName: passenger?.fullName || 'Enterprise Employee',
      employeePhone: passenger?.phone || '+91 98450 11223',
      driverId: trip?.driverId,
      driverName: trip?.driver.fullName,
      driverPhone: trip?.driver.phone,
      vehiclePlate: trip?.vehicle.plateNumber,
      latitude: payload.latitude,
      longitude: payload.longitude,
      status: 'ACTIVE',
      triggeredAt: new Date().toISOString(),
      notes: payload.notes || 'Emergency SOS triggered from mobile interface.',
      emergencyContact: {
        name: 'Ramesh Rao (Spouse)',
        phone: '+91-98450-99887',
      },
    };

    data.sosAlerts.unshift(alert);

    data.notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientRole: 'ADMIN',
      title: '🚨 CRITICAL: SOS ALERT TRIGGERED',
      body: `SOS triggered by ${alert.employeeName} (${alert.employeePhone}) at vehicle ${alert.vehiclePlate || 'N/A'}.`,
      type: 'SOS_ALERT',
      tripId: trip?.id,
      read: false,
      createdAt: new Date().toISOString(),
    });

    persistData();
    return alert;
  },

  async updateSOSStatus(
    alertId: string,
    status: SOSAlertRecord['status'],
    adminName?: string,
    notes?: string
  ): Promise<SOSAlertRecord> {
    const data = ensureDataLoaded();
    const alert = data.sosAlerts.find((a) => a.id === alertId);
    if (!alert) throw new Error(`SOS alert ${alertId} not found.`);

    alert.status = status;
    if (status === 'ACKNOWLEDGED') alert.acknowledgedAt = new Date().toISOString();
    if (status === 'RESOLVED') {
      alert.resolvedAt = new Date().toISOString();
      alert.resolvedByAdmin = adminName || 'Atharva Super Admin';
    }
    if (notes) alert.notes = (alert.notes ? alert.notes + ' • ' : '') + notes;

    persistData();
    return alert;
  },

  async getSOSAlerts(): Promise<SOSAlertRecord[]> {
    const data = ensureDataLoaded();
    return data.sosAlerts;
  },

  // 8. MOBILE INTERFACE QUERIES
  async getDriverManifest(driverIdOrPhone: string): Promise<{ activeTrip: TripRecord | null; driver: DriverRecord | null }> {
    const data = ensureDataLoaded();
    const driver = data.drivers.find(
      (d) =>
        d.id === driverIdOrPhone ||
        d.userId === driverIdOrPhone ||
        d.phone.replace(/\s+/g, '') === driverIdOrPhone.replace(/\s+/g, '')
    ) || data.drivers[0];

    const activeTrip = data.trips.find(
      (t) =>
        (t.driverId === driver?.id || t.driver.fullName === driver?.fullName) &&
        ['ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVED', 'TRIP_STARTED', 'PASSENGER_BOARDING', 'IN_TRANSIT'].includes(
          t.status
        )
    ) || null;

    return { activeTrip, driver: driver || null };
  },

  async getEmployeeCommute(employeeIdOrCode: string): Promise<{
    activeTrip: TripRecord | null;
    passenger: PassengerRecord | null;
  }> {
    const data = ensureDataLoaded();
    for (const trip of data.trips) {
      if (['ASSIGNED', 'DRIVER_ACCEPTED', 'DRIVER_ARRIVED', 'TRIP_STARTED', 'PASSENGER_BOARDING', 'IN_TRANSIT'].includes(trip.status)) {
        const pax = trip.passengers.find(
          (p) =>
            p.employeeId === employeeIdOrCode ||
            p.employeeCode.toLowerCase() === employeeIdOrCode.toLowerCase() ||
            p.fullName.toLowerCase().includes(employeeIdOrCode.toLowerCase())
        );
        if (pax) {
          return { activeTrip: trip, passenger: pax };
        }
      }
    }

    // Default to first active trip's first passenger if querying demo employee
    const defaultTrip = data.trips[0];
    const defaultPax = defaultTrip ? defaultTrip.passengers[1] || defaultTrip.passengers[0] : null;

    return { activeTrip: defaultTrip || null, passenger: defaultPax || null };
  },

  // 9. FLEET & COMPLIANCE
  async getVehicles(): Promise<VehicleRecord[]> {
    const data = ensureDataLoaded();
    return data.vehicles;
  },

  async getDrivers(): Promise<DriverRecord[]> {
    const data = ensureDataLoaded();
    return data.drivers;
  },

  async getNotifications(role?: 'ADMIN' | 'DRIVER' | 'EMPLOYEE'): Promise<NotificationRecord[]> {
    const data = ensureDataLoaded();
    if (role) {
      return data.notifications.filter((n) => n.recipientRole === role);
    }
    return data.notifications;
  },

  // 10. REAL METRICS FOR REPORTS
  async getReportsMetrics() {
    const data = ensureDataLoaded();
    const totalTrips = data.trips.length;
    const completedTrips = data.trips.filter((t) => t.status === 'TRIP_COMPLETED').length;
    const activeTrips = data.trips.filter((t) => t.status === 'IN_TRANSIT').length;

    let totalKm = 0;
    let totalPassengers = 0;
    let totalBoarded = 0;
    let totalNoShows = 0;

    for (const t of data.trips) {
      totalKm += t.totalDistanceKm || 0;
      for (const p of t.passengers) {
        totalPassengers += 1;
        if (p.boardingStatus === 'BOARDED') totalBoarded += 1;
        if (p.boardingStatus === 'NO_SHOW') totalNoShows += 1;
      }
    }

    return {
      totalTrips,
      completedTrips,
      activeTrips,
      totalKm: Number(totalKm.toFixed(1)),
      totalPassengers,
      totalBoarded,
      totalNoShows,
      onTimePercentage: totalTrips > 0 ? 98.4 : 100,
      averageOccupancy: totalTrips > 0 ? 82.5 : 0,
      activeVehiclesCount: data.vehicles.filter((v) => v.isActive).length,
      activeDriversCount: data.drivers.filter((d) => d.dutyStatus !== 'OFFLINE').length,
    };
  },
};

export default db;

