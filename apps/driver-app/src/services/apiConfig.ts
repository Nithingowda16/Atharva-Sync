/**
 * Atharva Travels ETS — Driver Android App (HR Pilot)
 * API Configuration & Network Base URL Provider
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
  DRIVER_DUTY: '/mobile/driver/duty',
  DRIVER_MANIFEST: '/mobile/driver/trip-manifest',
  VERIFY_OTP: (tripId: string) => `/trips/${tripId}/verify-otp`,
  NO_SHOW: (tripId: string) => `/trips/${tripId}/no-show`,
  TELEMETRY: '/telemetry',
};
