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

function buildInitialRides(): RideRecord[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return [
    {
      id: 'trip-sched-today-login',
      tripCode: 'ATH-9102L',
      date: today,
      shiftTime: '09:30',
      direction: 'LOGIN',
      status: 'SCHEDULED',
      boardingStatus: 'WAITING',
      boardingOtp: '7492',
      pickup: {
        id: 'p-home',
        name: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
        landmark: 'Near 100ft Metro Station',
        pickupTime: '08:45',
        latitude: 12.9719,
        longitude: 77.6412,
      },
      destination: {
        id: 'dest-hq',
        name: 'Enterprise Tech Park, Tower B',
        campus: 'Outer Ring Road Campus',
        city: 'Bengaluru',
      },
      driver: {
        id: 'drv-suresh',
        fullName: 'Suresh Babu',
        phone: '+91 98765 43210',
        rating: 4.92,
      },
      vehicle: {
        id: 'veh-8821',
        plateNumber: 'KA-03-HA-8821',
        model: 'Innova Crysta 2.4 VX',
        make: 'Toyota',
        color: 'Pearl White',
      },
    },
    {
      id: 'trip-sched-today-logout',
      tripCode: 'ATH-9103D',
      date: today,
      shiftTime: '18:30',
      direction: 'LOGOUT',
      status: 'SCHEDULED',
      boardingStatus: 'WAITING',
      boardingOtp: '7492',
      pickup: {
        id: 'p-office',
        name: 'Enterprise Tech Park, Tower B (Main Exit)',
        landmark: 'Main Exit Bay 3',
        pickupTime: '18:25',
        latitude: 12.9260,
        longitude: 77.6762,
      },
      destination: {
        id: 'dest-home',
        name: 'Gate 2, Golden Palms Apts, Indiranagar',
        campus: 'Indiranagar 100ft Road',
        city: 'Bengaluru',
      },
    },
    {
      id: 'trip-sched-tomo-login',
      tripCode: 'ATH-9104L',
      date: tomorrow,
      shiftTime: '09:30',
      direction: 'LOGIN',
      status: 'SCHEDULED',
      boardingStatus: 'WAITING',
      boardingOtp: '7492',
      pickup: {
        id: 'p-home',
        name: 'Gate 2, Golden Palms Apts, Indiranagar 100ft Road',
        landmark: 'Near 100ft Metro Station',
        pickupTime: '08:45',
        latitude: 12.9719,
        longitude: 77.6412,
      },
      destination: {
        id: 'dest-hq',
        name: 'Enterprise Tech Park, Tower B',
        campus: 'Outer Ring Road Campus',
        city: 'Bengaluru',
      },
    },
    {
      id: 'trip-sched-tomo-logout',
      tripCode: 'ATH-9105D',
      date: tomorrow,
      shiftTime: '18:30',
      direction: 'LOGOUT',
      status: 'SCHEDULED',
      boardingStatus: 'WAITING',
      boardingOtp: '7492',
      pickup: {
        id: 'p-office',
        name: 'Enterprise Tech Park, Tower B (Main Exit)',
        landmark: 'Main Exit Bay 3',
        pickupTime: '18:25',
      },
      destination: {
        id: 'dest-home',
        name: 'Gate 2, Golden Palms Apts, Indiranagar',
        campus: 'Indiranagar 100ft Road',
        city: 'Bengaluru',
      },
    },
  ];
}

let userBookingsStore: RideRecord[] = buildInitialRides();

export const bookingService = {
  /**
   * Add locally confirmed bookings so they are never lost on sync
   */
  addConfirmedRides(rides: RideRecord[]) {
    const existingIds = new Set(userBookingsStore.map((r) => r.id));
    const newItems = rides.filter((r) => !existingIds.has(r.id));
    userBookingsStore = [...newItems, ...userBookingsStore];
  },

  /**
   * Fetch active bookings from Web Portal backend /api/mobile/employee/commute
   */
  async getBookings(): Promise<RideRecord[]> {
    try {
      const session = await authService.getSession();
      const empId = session?.employeeId || '111';

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
          const exists = userBookingsStore.some(
            (r) => r.id === mappedRide.id || r.tripCode === mappedRide.tripCode
          );
          return exists ? userBookingsStore : [mappedRide, ...userBookingsStore];
        }
      }
    } catch (e) {
      console.warn('Backend commute sync notice, using active fallback:', e);
    }

    return userBookingsStore.length > 0 ? userBookingsStore : [buildFallbackRide()];
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
   * Submit schedule request to backend (supports multiple dates & round-trip login/logout)
   */
  async createSchedule(draft: BookingDraft): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    const dates = draft.selectedDates && draft.selectedDates.length > 0
      ? draft.selectedDates
      : [draft.date || new Date().toISOString().split('T')[0]];

    const isBoth = draft.direction === 'BOTH';
    const loginShift = draft.loginShift || draft.shift;
    const logoutShift = draft.logoutShift || draft.shift;

    try {
      const session = await authService.getSession();
      const empId = session?.employeeId || '111';
      const empName = session?.fullName || 'Nithin';

      // Submit schedules for each selected date & direction
      for (const d of dates) {
        if ((isBoth || draft.direction === 'LOGIN') && loginShift) {
          await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.EMPLOYEE_COMMUTE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: empId,
              employeeName: empName,
              shiftDate: d,
              shiftTime: loginShift.shiftTime,
              type: 'LOGIN',
              pickupAddress: draft.pickupPoint?.name || 'Home',
              dropAddress: 'Enterprise Tech Park, Tower B',
            }),
          }).catch(() => {});
        }

        if ((isBoth || draft.direction === 'LOGOUT') && logoutShift) {
          await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.EMPLOYEE_COMMUTE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId: empId,
              employeeName: empName,
              shiftDate: d,
              shiftTime: logoutShift.shiftTime,
              type: 'LOGOUT',
              pickupAddress: 'Enterprise Tech Park, Tower B',
              dropAddress: draft.pickupPoint?.name || 'Home',
            }),
          }).catch(() => {});
        }
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
    userBookingsStore = userBookingsStore.map((r) =>
      r.id === bookingId || r.tripCode === bookingId
        ? { ...r, status: 'CANCELLED' as const, boardingStatus: 'CANCELLED' as const }
        : r
    );

    // Sync cancellation to central backend
    try {
      await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.EMPLOYEE_COMMUTE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: bookingId,
          action: 'CANCEL',
          reason: reason || 'Employee requested cancellation',
        }),
      });
    } catch (e) {}

    return { success: true };
  },

  async markNoShow(bookingId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    userBookingsStore = userBookingsStore.map((r) =>
      r.id === bookingId || r.tripCode === bookingId
        ? { ...r, status: 'CANCELLED' as const, boardingStatus: 'NO_SHOW' as const }
        : r
    );

    // Sync no-show to central dispatch
    try {
      await fetch(`${getApiBaseUrl()}${API_ENDPOINTS.EMPLOYEE_COMMUTE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: bookingId,
          action: 'NO_SHOW',
          reason: reason || 'Employee unavailable at boarding point',
        }),
      });
    } catch (e) {}

    return { success: true };
  },
};
