/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Persistent Offline Storage & Outbox Action Queue Engine
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TripRecord,
  DriverProfile,
  QueuedAction,
  OfflineActionType,
  PassengerStatus,
  DriverDutyStatus,
} from '../types';

const KEYS = {
  MANIFEST: '@atharva_driver_active_manifest',
  PROFILE: '@atharva_driver_profile',
  OUTBOX: '@atharva_driver_outbox_queue',
  CHECKIN: '@atharva_driver_vehicle_checkin',
};

export const offlineStorage = {
  // 1. ACTIVE TRIP MANIFEST CACHING
  async saveActiveManifest(trip: TripRecord): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.MANIFEST, JSON.stringify(trip));
    } catch (err) {
      console.warn('Error saving active manifest to local storage:', err);
    }
  },

  async getActiveManifest(): Promise<TripRecord | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.MANIFEST);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn('Error reading active manifest from local storage:', err);
      return null;
    }
  },

  async clearActiveManifest(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.MANIFEST);
    } catch (err) {
      console.warn('Error clearing manifest:', err);
    }
  },

  // 2. PASSENGER STATUS TRANSITIONS (OFFLINE-CAPABLE)
  async updatePassengerStatusLocally(
    tripId: string,
    passengerId: string,
    status: PassengerStatus,
    otpUsed?: string
  ): Promise<TripRecord | null> {
    const currentTrip = await this.getActiveManifest();
    if (!currentTrip || currentTrip.id !== tripId) return null;

    const nowIso = new Date().toISOString();
    const updatedStops = currentTrip.stops.map((stop) => {
      if (stop.id === passengerId) {
        return {
          ...stop,
          status,
          boardedAt: status === 'BOARDED' ? nowIso : stop.boardedAt,
          noShowAt: status === 'NO_SHOW' ? nowIso : stop.noShowAt,
        };
      }
      return stop;
    });

    const updatedTrip: TripRecord = {
      ...currentTrip,
      stops: updatedStops,
    };

    await this.saveActiveManifest(updatedTrip);

    // Queue action for cloud sync
    await this.queueAction(
      status === 'BOARDED' ? 'BOARD_PASSENGER' : 'REPORT_NO_SHOW',
      tripId,
      {
        passengerId,
        status,
        otpUsed,
        timestamp: nowIso,
      }
    );

    return updatedTrip;
  },

  // 3. OUTBOX EVENT SOURCING (ACTION QUEUE)
  async queueAction(
    action: OfflineActionType,
    tripId: string,
    payload: Record<string, any>
  ): Promise<void> {
    try {
      const existingQueue = await this.getQueuedActions();
      const newAction: QueuedAction = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        action,
        tripId,
        payload,
        timestamp: new Date().toISOString(),
      };
      existingQueue.push(newAction);
      await AsyncStorage.setItem(KEYS.OUTBOX, JSON.stringify(existingQueue));
    } catch (err) {
      console.warn('Error queueing offline action:', err);
    }
  },

  async getQueuedActions(): Promise<QueuedAction[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.OUTBOX);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.warn('Error fetching queued actions:', err);
      return [];
    }
  },

  async clearQueuedActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.OUTBOX);
    } catch (err) {
      console.warn('Error clearing outbox queue:', err);
    }
  },

  // 4. DRIVER PROFILE PERSISTENCE
  async saveDriverProfile(profile: DriverProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn('Error saving driver profile:', err);
    }
  },

  async getDriverProfile(): Promise<DriverProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn('Error reading driver profile:', err);
      return null;
    }
  },

  async updateDutyStatus(status: DriverDutyStatus): Promise<DriverProfile | null> {
    const profile = await this.getDriverProfile();
    if (!profile) return null;
    const updated = { ...profile, dutyStatus: status };
    await this.saveDriverProfile(updated);
    return updated;
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        KEYS.MANIFEST,
        KEYS.PROFILE,
        KEYS.OUTBOX,
        KEYS.CHECKIN,
      ]);
    } catch (err) {
      console.warn('Error clearing storage:', err);
    }
  },
};
