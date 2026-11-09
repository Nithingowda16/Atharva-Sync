import { Coordinates } from '@/types/ets';

/**
 * Calculates the great-circle distance between two points on the Earth's surface using the Haversine formula
 * Returns distance in kilometers (km)
 */
export function calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimates driving arrival time in minutes assuming average city transit speed
 */
export function estimateEtaMinutes(distanceKm: number, averageSpeedKmh = 25): number {
  if (distanceKm <= 0) return 0;
  const hours = distanceKm / averageSpeedKmh;
  return Math.ceil(hours * 60);
}

