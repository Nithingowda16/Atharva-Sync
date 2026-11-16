/**
 * Atharva Travels ETS — Employee Android App
 * Shift Service (Connected to Central Web Portal Backend)
 */

import { ShiftRecord, JourneyDirection } from '../types';

export const shiftService = {
  /**
   * Fetch shifts for a given date and direction
   */
  async getAvailableShifts(date: string, direction: JourneyDirection): Promise<ShiftRecord[]> {
    if (direction === 'LOGIN') {
      return [
        {
          id: 'shift-login-1',
          shiftTime: '13:30',
          cutoffTime: '11:00',
          direction: 'LOGIN',
          isAvailable: true,
          badgeLabel: 'Primary Inward',
        },
        {
          id: 'shift-login-2',
          shiftTime: '14:00',
          cutoffTime: '11:30',
          direction: 'LOGIN',
          isAvailable: true,
          badgeLabel: 'Afternoon Shift',
        },
        {
          id: 'shift-login-3',
          shiftTime: '17:30',
          cutoffTime: '15:00',
          direction: 'LOGIN',
          isAvailable: true,
          badgeLabel: 'Evening Twilight',
        },
      ];
    } else {
      return [
        {
          id: 'shift-logout-1',
          shiftTime: '21:30',
          cutoffTime: '19:00',
          direction: 'LOGOUT',
          isAvailable: true,
          badgeLabel: 'Escort Guard Safeguard',
        },
        {
          id: 'shift-logout-2',
          shiftTime: '22:30',
          cutoffTime: '20:00',
          direction: 'LOGOUT',
          isAvailable: true,
          badgeLabel: 'Night Shift Safeguard',
        },
      ];
    }
  },
};
