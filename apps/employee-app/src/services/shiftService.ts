/**
 * Atharva Travels ETS — Employee Android App
 * Shift Service Interface (Phase 1 Frontend Placeholder)
 * 
 * Strict No-Mock-Data: Returns empty shifts list until populated by central backend.
 */

import { ShiftRecord, JourneyDirection } from '../types';

export const shiftService = {
  /**
   * Fetch shifts for a given date and direction
   * In Phase 1: Returns empty array by default unless loaded from central DB.
   */
  async getAvailableShifts(date: string, direction: JourneyDirection): Promise<ShiftRecord[]> {
    // Phase 2 will query /api/shifts?date=${date}&direction=${direction}
    return [];
  },
};

