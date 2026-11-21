/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Trip Manifest & Lifecycle Management Service
 */

import { TripRecord, PassengerStop, PassengerStatus } from '../types';
import { offlineStorage } from './offlineStorage';
import { syncService } from './syncService';
import { getApiBaseUrl, API_ENDPOINTS } from './apiConfig';

export const tripService = {
  /**
   * Fetches the active trip for the logged in driver.
   * Checks offline cache first; if online, fetches from server and caches locally.
   */
  async getActiveTrip(driverId?: string, vehiclePlate?: string): Promise<TripRecord | null> {
    const isOnline = syncService.getIsOnline();
    const cached = await offlineStorage.getActiveManifest();

    if (isOnline) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const url = `${getApiBaseUrl()}${API_ENDPOINTS.DRIVER_MANIFEST}?driverId=${encodeURIComponent(
          driverId || 'drv-suresh'
        )}&plate=${encodeURIComponent(vehiclePlate || '')}`;

        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.tripManifest) {
            const m = data.tripManifest;
            const mapped: TripRecord = {
              id: m.tripId,
              tripCode: m.tripCode,
              type: (m.type as any) || 'LOGIN',
              shiftDate: m.shiftDate,
              shiftTime: m.shiftTime,
              corporateClient: 'Enterprise Tech Park, Tower B',
              routeName: m.routeName || 'Indiranagar ➔ Enterprise Tech Park',
              status: m.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'SCHEDULED',
              vehiclePlate: m.vehiclePlate || vehiclePlate || 'KA-03-HA-8821',
              totalDistanceKm: 14.8,
              estimatedMinutes: 35,
              stops: (m.stops || []).map((s: any, idx: number) => ({
                id: s.id,
                employeeId: s.passengerId || s.empCode || `emp-${idx + 1}`,
                name: s.name,
                phone: s.phone,
                sequence: s.sequence || idx + 1,
                address: s.pickupAddress,
                coords: s.pickupCoords || { latitude: 12.9719, longitude: 77.6412 },
                scheduledTime: s.scheduledPickupTime || m.shiftTime,
                boardingOtp: s.pin || '1234',
                status: s.boardingStatus === 'BOARDED' ? 'BOARDED' : s.boardingStatus === 'NO_SHOW' ? 'NO_SHOW' : 'WAITING',
                isReassigned: s.isLocationReassigned || false,
                reassignmentReason: s.reassignmentDetails?.reason,
              })),
            };

            await offlineStorage.saveActiveManifest(mapped);
            return mapped;
          } else {
            // No trip assigned on server
            if (cached && cached.status !== 'IN_TRANSIT') {
              await offlineStorage.saveActiveManifest(null as any);
              return null;
            }
          }
        }
      } catch (e) {
        console.warn('Driver trip manifest sync notice:', e);
      }
    }

    // Return cached if exists
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
};
