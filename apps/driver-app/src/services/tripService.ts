/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Trip Manifest & Lifecycle Management Service
 */

import { TripRecord, PassengerStop, PassengerStatus } from '../types';
import { offlineStorage } from './offlineStorage';
import { syncService } from './syncService';

export const tripService = {
  /**
   * Fetches the active trip for the logged in driver.
   * Checks offline cache first; if online, fetches from server and caches locally.
   */
  async getActiveTrip(): Promise<TripRecord | null> {
    const isOnline = syncService.getIsOnline();
    const cached = await offlineStorage.getActiveManifest();

    if (!isOnline && cached) {
      return cached;
    }

    // If cached exists and is in progress, return it
    if (cached) {
      return cached;
    }

    return null;
  },

  /**
   * Starts an assigned trip route
   */
  async startTrip(tripId: string, startOdometer: number): Promise<TripRecord | null> {
    const currentTrip = await offlineStorage.getActiveManifest();
    if (!currentTrip || currentTrip.id !== tripId) return null;

    const startedTrip: TripRecord = {
      ...currentTrip,
      status: 'IN_TRANSIT',
      startOdometer,
      startedAt: new Date().toISOString(),
    };

    await offlineStorage.saveActiveManifest(startedTrip);
    await offlineStorage.queueAction('START_TRIP', tripId, {
      startOdometer,
      timestamp: startedTrip.startedAt,
    });
    await syncService.flushOutbox();

    return startedTrip;
  },

  /**
   * Verifies an employee's 4-digit secret boarding OTP offline or online
   */
  async verifyBoardingOtp(
    tripId: string,
    passengerId: string,
    enteredOtp: string
  ): Promise<{ success: boolean; message: string; updatedTrip?: TripRecord }> {
    const trip = await offlineStorage.getActiveManifest();
    if (!trip || trip.id !== tripId) {
      return { success: false, message: 'Trip not found or expired.' };
    }

    const passenger = trip.stops.find((s) => s.id === passengerId);
    if (!passenger) {
      return { success: false, message: 'Passenger not listed on this roster.' };
    }

    if (passenger.boardingOtp.trim() !== enteredOtp.trim()) {
      return { success: false, message: 'Invalid OTP PIN. Please check employee boarding pass.' };
    }

    const updatedTrip = await offlineStorage.updatePassengerStatusLocally(
      tripId,
      passengerId,
      'BOARDED',
      enteredOtp
    );

    await syncService.flushOutbox();

    return {
      success: true,
      message: `${passenger.name} successfully boarded!`,
      updatedTrip: updatedTrip || undefined,
    };
  },

  /**
   * Validates a scanned QR payload from the Employee App
   * Format: {"type":"ETS_BOARDING","tripId":"...","employeeId":"...","otp":"..."}
   */
  async verifyQrPayload(
    tripId: string,
    qrDataString: string
  ): Promise<{ success: boolean; message: string; updatedTrip?: TripRecord }> {
    try {
      let payload: any;
      try {
        payload = JSON.parse(qrDataString);
      } catch {
        // Fallback if plain OTP string was scanned
        if (qrDataString && qrDataString.length === 4) {
          payload = { otp: qrDataString };
        } else {
          return { success: false, message: 'Unrecognized QR format.' };
        }
      }

      const trip = await offlineStorage.getActiveManifest();
      if (!trip || trip.id !== tripId) {
        return { success: false, message: 'Active trip mismatch.' };
      }

      // Match by employeeId or OTP
      let targetPassenger: PassengerStop | undefined;
      if (payload.employeeId) {
        targetPassenger = trip.stops.find((s) => s.employeeId === payload.employeeId);
      } else if (payload.otp) {
        targetPassenger = trip.stops.find((s) => s.boardingOtp === payload.otp);
      }

      if (!targetPassenger) {
        return { success: false, message: 'Employee not found on this trip manifest.' };
      }

      const updatedTrip = await offlineStorage.updatePassengerStatusLocally(
        tripId,
        targetPassenger.id,
        'BOARDED',
        targetPassenger.boardingOtp
      );

      await syncService.flushOutbox();

      return {
        success: true,
        message: `${targetPassenger.name} boarded successfully via QR!`,
        updatedTrip: updatedTrip || undefined,
      };
    } catch (err) {
      return { success: false, message: 'Error processing QR boarding code.' };
    }
  },

  /**
   * Marks a passenger as a NO_SHOW after 5 minutes wait
   */
  async reportNoShow(
    tripId: string,
    passengerId: string
  ): Promise<{ success: boolean; updatedTrip?: TripRecord }> {
    const updatedTrip = await offlineStorage.updatePassengerStatusLocally(
      tripId,
      passengerId,
      'NO_SHOW'
    );
    await syncService.flushOutbox();
    return { success: true, updatedTrip: updatedTrip || undefined };
  },

  /**
   * Completes a trip
   */
  async completeTrip(
    tripId: string,
    endOdometer: number,
    womenSafetyConfirmed: boolean
  ): Promise<TripRecord | null> {
    const trip = await offlineStorage.getActiveManifest();
    if (!trip || trip.id !== tripId) return null;

    const completedTrip: TripRecord = {
      ...trip,
      status: 'COMPLETED',
      endOdometer,
      completedAt: new Date().toISOString(),
    };

    await offlineStorage.saveActiveManifest(completedTrip);
    await offlineStorage.queueAction('COMPLETE_TRIP', tripId, {
      endOdometer,
      womenSafetyConfirmed,
      timestamp: completedTrip.completedAt,
    });

    await syncService.flushOutbox();

    return completedTrip;
  },

  /**
   * Sets up a realistic default roster trip if no manifest is currently cached
   */
  async setupInitialRosterIfEmpty(driverPlate: string): Promise<TripRecord> {
    const existing = await offlineStorage.getActiveManifest();
    if (existing) return existing;

    const initialTrip: TripRecord = {
      id: `trip-pilot-${Date.now()}`,
      tripCode: 'ATH-2026-00412',
      type: 'LOGIN',
      shiftDate: new Date().toISOString().split('T')[0],
      shiftTime: '14:00',
      corporateClient: 'Enterprise Tech Park, Tower B',
      routeName: 'Indiranagar 100ft → Domlur → EGL Tech Park',
      status: 'SCHEDULED',
      vehiclePlate: driverPlate || 'KA-03-HA-8821',
      totalDistanceKm: 14.8,
      estimatedMinutes: 38,
      stops: [
        {
          id: 'stop-1',
          employeeId: 'emp-101',
          name: 'Priya Sharma',
          phone: '+919871122334',
          sequence: 1,
          address: 'HAL 2nd Stage, 80ft Road, Indiranagar',
          coords: { latitude: 12.98, longitude: 77.625 },
          scheduledTime: '01:05 PM',
          boardingOtp: '3190',
          status: 'WAITING',
        },
        {
          id: 'stop-2',
          employeeId: 'emp-102',
          name: 'Amrutha Rao',
          phone: '+919845011223',
          sequence: 2,
          address: 'Indiranagar 100ft Road (Near Metro Pillar 42)',
          coords: { latitude: 12.9725, longitude: 77.643 },
          scheduledTime: '01:20 PM',
          boardingOtp: '7492',
          status: 'WAITING',
          isReassigned: true,
          reassignmentReason: 'Shifted 300m to Metro Pillar 42 due to road work.',
        },
        {
          id: 'stop-3',
          employeeId: 'emp-103',
          name: 'Karthik Natarajan',
          phone: '+919988733445',
          sequence: 3,
          address: 'Domlur Layout, Inner Ring Road, Domlur',
          coords: { latitude: 12.962, longitude: 77.648 },
          scheduledTime: '01:35 PM',
          boardingOtp: '5821',
          status: 'WAITING',
        },
      ],
    };

    await offlineStorage.saveActiveManifest(initialTrip);
    return initialTrip;
  },
};
