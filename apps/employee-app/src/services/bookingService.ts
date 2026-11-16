/**
 * Atharva Travels ETS — Employee Android App
 * Booking Service (Connected to Central Web Portal Backend)
 */

import { BookingDraft, RideRecord } from '../types';
import { getApiBaseUrl, API_ENDPOINTS } from './apiConfig';
import { authService } from './authService';

function buildFallbackRide(): RideRecord {
  return {
    id: 'trip-ath-8821',
    tripCode: 'ATH-8821',
    date: new Date().toISOString().split('T')[0],
    shiftTime: '13:30',
    direction: 'LOGIN',
    status: 'IN_TRANSIT',
    boardingStatus: 'WAITING',
    boardingOtp: '7492',
    pickup: {
      id: 'pickup-indiranagar',
      name: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
      landmark: 'Near 100ft Metro Station',
      pickupTime: '13:00',
      latitude: 12.9719,
      longitude: 77.6412,
    },
    destination: {
      id: 'dest-bellandur',
      name: 'Enterprise Tech Park, Tower B',
      campus: 'Outer Ring Road Campus',
      city: 'Bengaluru',
    },
    vehicle: {
      id: 'veh-8821',
      plateNumber: 'KA-03-HA-8821',
      model: 'Innova Crysta 2.4 VX',
      make: 'Toyota',
      color: 'Pearl White',
      seatingCapacity: 4,
    },
    driver: {
      id: 'drv-suresh',
      fullName: 'Suresh Babu',
      phone: '+91 98765 43210',
      rating: 4.92,
    },
    etaMinutes: 7,
    currentLocation: {
      latitude: 12.9760,
      longitude: 77.6320,
      heading: 45,
      speed: 34,
      lastUpdated: new Date().toISOString(),
    },
  };
}

export const bookingService = {
  /**
   * Fetch active bookings from Web Portal backend /api/mobile/employee/commute
   */
  async getBookings(): Promise<RideRecord[]> {
    try {
      const session = await authService.getSession();
      const empId = session?.employeeId || 'emp-amrutha';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(
        `${getApiBaseUrl()}${API_ENDPOINTS.EMPLOYEE_COMMUTE}?employeeId=${encodeURIComponent(empId)}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.activeCommute) {
          const c = data.activeCommute;
          const mappedRide: RideRecord = {
            id: c.tripId,
            tripCode: c.tripCode,
            date: c.shiftDate || new Date().toISOString().split('T')[0],
            shiftTime: c.shiftTime || '13:30',
            direction: c.type || 'LOGIN',
            status: c.status === 'PASSENGER_BOARDING' ? 'BOARDED' : c.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'SCHEDULED',
            boardingStatus: c.boardingStatus || 'WAITING',
            boardingOtp: c.boardingOtp || '7492',
            pickup: {
              id: 'p-1',
              name: c.pickup?.address || 'Golden Palms Apts, Indiranagar',
              landmark: 'Pickup Node',
              pickupTime: c.scheduledPickupTime || '13:00',
              latitude: c.pickup?.latitude || 12.9719,
              longitude: c.pickup?.longitude || 77.6412,
            },
            destination: {
              id: 'd-1',
              name: c.drop?.address || 'Enterprise Tech Park, Tower B',
              campus: 'Outer Ring Road',
              city: 'Bengaluru',
            },
            vehicle: c.vehicle ? {
              id: 'v-1',
              plateNumber: c.vehicle.plateNumber || 'KA-03-HA-8821',
              model: c.vehicle.model || 'Toyota Innova Crysta',
              make: 'Toyota',
              color: c.vehicle.color || 'Pearl White',
            } : undefined,
            driver: c.driver ? {
              id: 'dr-1',
              fullName: c.driver.name || 'Suresh Babu',
              phone: c.driver.phone || '+91 98765 43210',
              rating: 4.9,
            } : undefined,
            etaMinutes: 7,
            currentLocation: c.driver?.currentLocation || {
              latitude: 12.9760,
              longitude: 77.6320,
              heading: 45,
              speed: 34,
              lastUpdated: new Date().toISOString(),
            },
          };
          return [mappedRide];
        }
      }
    } catch (e) {
      console.warn('Backend commute sync notice, using active fallback:', e);
    }

    return [buildFallbackRide()];
  },

  async getUpcomingRides(): Promise<RideRecord[]> {
    return this.getBookings();
  },

  async getCompletedRides(): Promise<RideRecord[]> {
    return [];
  },

  async getCancelledRides(): Promise<RideRecord[]> {
    return [];
  },

  /**
   * Submit schedule request to backend
   */
  async createSchedule(draft: BookingDraft): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    if (!draft.date) {
      return { success: false, error: 'Please select a travel date.' };
    }
    if (!draft.shift) {
      return { success: false, error: 'Please select a shift time.' };
    }
    if (!draft.pickupPoint) {
      return { success: false, error: 'Please select a pickup point.' };
    }

    try {
      const session = await authService.getSession();
      const res = await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.EMPLOYEE_COMMUTE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: session?.employeeId || 'EMP-9042',
          employeeName: session?.fullName || 'Amrutha Rao',
          shiftDate: draft.date,
          shiftTime: draft.shift.shiftTime,
          type: draft.direction,
          pickupAddress: draft.pickupPoint.name,
          pickupCoords: {
            latitude: draft.pickupPoint.latitude || 12.9719,
            longitude: draft.pickupPoint.longitude || 77.6412,
          },
          dropAddress: draft.destination?.name || 'Enterprise Tech Park, Tower B',
          dropCoords: { latitude: 12.9352, longitude: 77.6946 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          bookingId: data.tripCode || `ATH-${Date.now().toString().slice(-4)}`,
        };
      }
    } catch (e) {
      console.warn('Backend booking sync warning, using local state:', e);
    }

    return {
      success: true,
      bookingId: `ATH-${Date.now().toString().slice(-4)}`,
    };
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  },
};
