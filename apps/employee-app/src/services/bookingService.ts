/**
 * Atharva Travels ETS — Employee Android App
 * Booking Service Interface (Phase 1 Frontend Placeholder)
 * 
 * Strict No-Mock-Data: Returns empty arrays when no data exists.
 */

import { BookingDraft, RideRecord } from '../types';

export const bookingService = {
  /**
   * Fetch active bookings for current employee
   * Phase 1: Returns empty list ([]); no fake bookings
   */
  async getBookings(): Promise<RideRecord[]> {
    // Phase 2 will call: GET /api/mobile/employee/commute
    return [];
  },

  async getUpcomingRides(): Promise<RideRecord[]> {
    return [];
  },

  async getCompletedRides(): Promise<RideRecord[]> {
    return [];
  },

  async getCancelledRides(): Promise<RideRecord[]> {
    return [];
  },

  /**
   * Submit schedule request
   * Phase 1: Validates draft locally, does not push to backend
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

    // Phase 2 hook
    return {
      success: true,
      bookingId: `DRAFT-${Date.now()}`,
    };
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  },
};

