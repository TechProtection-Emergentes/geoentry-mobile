import { Coordinates, HomeLocation } from '../types/location';

export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export const findNearestHomeLocation = (
  currentLocation: Coordinates,
  homeLocations: HomeLocation[]
): { location: HomeLocation; distance: number } | null => {
  if (homeLocations.length === 0) return null;

  const activeLocations = homeLocations.filter(loc => loc.isActive);
  if (activeLocations.length === 0) return null;

  let nearest: { location: HomeLocation; distance: number } | null = null;

  for (const homeLocation of activeLocations) {
    const distance = calculateDistance(currentLocation, homeLocation.coordinates);
    
    if (!nearest || distance < nearest.distance) {
      nearest = { location: homeLocation, distance };
    }
  }

  return nearest;
};

export const checkProximity = (
  currentLocation: Coordinates,
  homeLocations: HomeLocation[]
): {
  isNearHome: boolean;
  nearestLocation: HomeLocation | null;
  distance: number | null;
  withinRadius: boolean;
} => {
  const nearest = findNearestHomeLocation(currentLocation, homeLocations);
  
  if (!nearest) {
    return {
      isNearHome: false,
      nearestLocation: null,
      distance: null,
      withinRadius: false,
    };
  }

  const withinRadius = nearest.distance <= nearest.location.radius;

  return {
    isNearHome: withinRadius,
    nearestLocation: nearest.location,
    distance: nearest.distance,
    withinRadius,
  };
};
