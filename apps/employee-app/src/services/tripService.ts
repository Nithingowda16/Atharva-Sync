/**
 * Atharva Travels ETS — Employee Android App
 * Route, Trip & Tracking Service Interfaces (Phase 1 Frontend Placeholders)
 */

import { RouteRecord, RideRecord, PickupPoint, DestinationOffice } from '../types';

export const routeService = {
  async getAvailableRoutes(direction: 'LOGIN' | 'LOGOUT'): Promise<RouteRecord[]> {
    return [];
  },

  async getRegisteredPickupPoints(): Promise<PickupPoint[]> {
    return [];
  },

  async getCompanyOffices(): Promise<DestinationOffice[]> {
    return [];
  },
};

export const tripService = {
  async getActiveTrip(): Promise<RideRecord | null> {
    return null;
  },

  async getRideDetails(tripId: string): Promise<RideRecord | null> {
    return null;
  },

  async getTripHistory(): Promise<RideRecord[]> {
    return [];
  },
};

export const trackingService = {
  async getLiveTelemetry(tripId: string): Promise<{
    hasTelemetry: boolean;
    latitude?: number;
    longitude?: number;
    speed?: number;
    etaMinutes?: number;
  }> {
    return {
      hasTelemetry: false,
    };
  },
};

