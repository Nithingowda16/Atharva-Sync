/**
 * Atharva Travels ETS — Driver Android App (Atharva Pilot)
 * Driver Authentication & Profile Service
 */

import { DriverProfile } from '../types';
import { offlineStorage } from './offlineStorage';

export const authService = {
  async login(
    identifier: string,
    pin: string
  ): Promise<{ success: boolean; message: string; profile?: DriverProfile }> {
    if (!identifier || !pin) {
      return { success: false, message: 'Please enter both Driver ID / Phone and PIN.' };
    }

    if (pin.length < 4) {
      return { success: false, message: 'PIN must be at least 4 digits.' };
    }

    // Provisioned corporate driver profile
    const profile: DriverProfile = {
      id: 'drv-suresh',
      fullName: 'Suresh Babu',
      phone: '+91 98765 43210',
      licenseNumber: 'KA-03-2018-009124',
      licenseExpiry: '2032-05-15',
      rating: 4.92,
      totalTripsCompleted: 842,
      assignedVehicleId: 'veh-8821',
      assignedVehiclePlate: 'KA-03-HA-8821',
      assignedVehicleModel: 'Toyota Innova Crysta 2.4 VX',
      dutyStatus: 'OFFLINE',
      complianceStatus: 'VALID',
    };

    await offlineStorage.saveDriverProfile(profile);

    return {
      success: true,
      message: 'Driver authenticated successfully.',
      profile,
    };
  },

  async getCurrentProfile(): Promise<DriverProfile | null> {
    return await offlineStorage.getDriverProfile();
  },

  async logout(): Promise<void> {
    await offlineStorage.clearAll();
  },
};
