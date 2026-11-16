/**
 * Atharva Travels ETS — Employee Android App
 * API Configuration & Network Base URL Provider
 * 
 * - Default 10.0.2.2:3000 for standard Android Emulator loopback
 * - 10.182.158.131:3000 for physical phone on local Wi-Fi
 * - Configurable at runtime via Settings screen
 */

import { Platform } from 'react-native';

export const DEFAULT_EMULATOR_URL = 'http://10.0.2.2:3000/api';
export const DEFAULT_LAN_URL = 'http://10.182.158.131:3000/api';

let currentApiBaseUrl = Platform.OS === 'android' ? DEFAULT_EMULATOR_URL : 'http://localhost:3000/api';

export function getApiBaseUrl(): string {
  return currentApiBaseUrl;
}

export function setApiBaseUrl(url: string): void {
  let cleaned = url.trim().replace(/\/+$/, '');
  if (!cleaned.endsWith('/api') && !cleaned.includes('/api/')) {
    cleaned = `${cleaned}/api`;
  }
  currentApiBaseUrl = cleaned;
}

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  EMPLOYEE_COMMUTE: '/mobile/employee/commute',
  TRIPS: '/trips',
  TELEMETRY: '/telemetry',
  SOS: '/sos',
  REASSIGN_LOCATION: (tripId: string) => `/trips/${tripId}/reassign-location`,
  NOTIFICATIONS: '/notifications',
};

