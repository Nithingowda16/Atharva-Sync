/**
 * Atharva Travels Enterprise Transport System - Storage & Persistence Engine
 * Ensures all allocations, contracts, fleet vehicles, drivers, compliance rules,
 * and vendor team authorizations stay permanently saved in the portal.
 */

export const STORAGE_KEYS = {
  ROUTES: 'atharva_routes_persist_v1',
  CONTRACTS: 'atharva_contracts_persist_v1',
  VEHICLES: 'atharva_vehicles_persist_v1',
  DRIVERS: 'atharva_drivers_persist_v1',
  COMPLIANCE: 'atharva_compliance_persist_v1',
  DEVICES: 'atharva_devices_persist_v1',
  VENDOR_USERS: 'atharva_vendor_users_persist_v1',
  PASSENGER_STATE: 'atharva_passenger_state_persist_v1',
};

export function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[Atharva Storage] Error reading key "${key}":`, err);
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[Atharva Storage] Error writing key "${key}":`, err);
  }
}

