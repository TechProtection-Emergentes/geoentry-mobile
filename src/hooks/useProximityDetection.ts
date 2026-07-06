import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useHomeLocation } from '../contexts/HomeLocationContext';
import { Coordinates, HomeLocation } from '../types/location';
import { apiService } from '../services/apiService';
import { deviceService } from '../services/deviceService';
import { checkProximity } from '../utils/locationUtils';
import { LOCATION_TASK_NAME } from '../services/backgroundLocationTask';

interface UseProximityDetectionOptions {
  enableWatching?: boolean;
  watchInterval?: number; // in milliseconds
  minDistanceFilter?: number; // in meters
}

interface ProximityEvent {
  type: 'enter' | 'exit';
  homeLocation: HomeLocation;
  distance: number;
}

// Removed local proximity functions, imported from utils

export const useProximityDetection = (options: UseProximityDetectionOptions = {}) => {
  const {
    enableWatching = false,
    watchInterval = 5000,
    minDistanceFilter = 10,
  } = options;

  const { state, dispatch, addHistoryEntry } = useHomeLocation();
  const { homeLocations, proximitySettings, detectionState } = state;

  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastProximityCheck, setLastProximityCheck] = useState<Date | null>(null);

  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const proximityCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const lastKnownProximityState = useRef<boolean>(false);

  // Proximity event callbacks
  const onProximityEnter = useCallback(async (event: ProximityEvent) => {
    
    // Add history entry
    await addHistoryEntry({
      homeLocationId: event.homeLocation.id,
      eventType: 'enter',
      distance: event.distance,
    });

    // Send event to API
    try {
      const deviceId = await deviceService.getDeviceId();
      const userId = await deviceService.getUserId();
      
      await apiService.sendProximityEvent({
        type: 'enter',
        homeLocationId: event.homeLocation.id,
        homeLocationName: event.homeLocation.name,
        coordinates: event.homeLocation.coordinates,
        distance: event.distance,
        timestamp: new Date().toISOString(),
        deviceId,
        userId,
      });
      
      console.log('Proximity enter event sent successfully to REST API');
    } catch (error) {
      console.error('Error sending proximity enter event to API:', error);
    }

    // Update detection state - reset modal shown flag on new entry
    dispatch({
      type: 'SET_DETECTION_STATE',
      payload: {
        isNearHome: true,
        nearestHomeLocation: event.homeLocation,
        currentDistance: event.distance,
        lastDetectionTime: new Date().toISOString(),
        modalShownForCurrentSession: false, // Reset to allow modal to show again
      },
    });
  }, [addHistoryEntry, dispatch]);

  const onProximityExit = useCallback(async (event: ProximityEvent) => {
    
    // Add history entry
    await addHistoryEntry({
      homeLocationId: event.homeLocation.id,
      eventType: 'exit',
      distance: event.distance,
    });

    // Send event to API
    try {
      const deviceId = await deviceService.getDeviceId();
      const userId = await deviceService.getUserId();
      
      await apiService.sendProximityEvent({
        type: 'exit',
        homeLocationId: event.homeLocation.id,
        homeLocationName: event.homeLocation.name,
        coordinates: event.homeLocation.coordinates,
        distance: event.distance,
        timestamp: new Date().toISOString(),
        deviceId,
        userId,
      });
      
      console.log('Proximity exit event sent successfully to REST API');
    } catch (error) {
      console.error('Error sending proximity exit event to API:', error);
    }

    // Update detection state - reset modal shown flag when exiting
    dispatch({
      type: 'SET_DETECTION_STATE',
      payload: {
        isNearHome: false,
        nearestHomeLocation: event.homeLocation,
        currentDistance: event.distance,
        lastDetectionTime: new Date().toISOString(),
        modalShownForCurrentSession: false, // Reset for next time they enter
      },
    });
  }, [addHistoryEntry, dispatch]);

  // Check proximity for current location
  const checkCurrentProximity = useCallback(
    (location: Coordinates) => {
      if (!proximitySettings.isEnabled || homeLocations.length === 0) {
        return;
      }

      const proximityResult = checkProximity(location, homeLocations);
      
      // Update current distance in state
      dispatch({
        type: 'SET_DETECTION_STATE',
        payload: {
          currentDistance: proximityResult.distance,
          nearestHomeLocation: proximityResult.nearestLocation,
        },
      });

      // Check for proximity changes
      const wasNearHome = lastKnownProximityState.current;
      const isNowNearHome = proximityResult.isNearHome;

      if (!wasNearHome && isNowNearHome && proximityResult.nearestLocation) {
        // Entered proximity
        onProximityEnter({
          type: 'enter',
          homeLocation: proximityResult.nearestLocation,
          distance: proximityResult.distance || 0,
        });
      } else if (wasNearHome && !isNowNearHome && proximityResult.nearestLocation) {
        // Exited proximity
        onProximityExit({
          type: 'exit',
          homeLocation: proximityResult.nearestLocation,
          distance: proximityResult.distance || 0,
        });
      }

      lastKnownProximityState.current = isNowNearHome;
      setLastProximityCheck(new Date());
    },
    [homeLocations, proximitySettings.isEnabled, onProximityEnter, onProximityExit, dispatch]
  );

  // Get current location once
  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      setError(null);

      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        throw new Error('Permisos de ubicación no concedidos');
      }

      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Servicios de ubicación desactivados');
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const coordinates: Coordinates = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      };

      setCurrentLocation(coordinates);
      checkCurrentProximity(coordinates);
      
      return coordinates;
    } catch (err: any) {
      console.error('Error getting current location:', err);
      setError(err.message || 'Error al obtener la ubicación');
      return null;
    }
  }, [checkCurrentProximity]);

  // Start watching location
  const startWatching = useCallback(async () => {
    try {
      if (isWatching || !proximitySettings.isEnabled) return;

      setError(null);

      // 1. Pedir permisos en primer plano
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== 'granted') throw new Error('Permisos básicos denegados');

      // 2. Pedir permisos en SEGUNDO PLANO
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      if (bgStatus !== 'granted') throw new Error('Permisos en background denegados');

      // 3. Registrar el Location Update con TaskManager
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: minDistanceFilter,
        deferredUpdatesInterval: watchInterval,
        showsBackgroundLocationIndicator: true,
      });

      setIsWatching(true);
      console.log('Proximity watching started en BACKGROUND');
    } catch (err: any) {
      console.error('Error starting location watching:', err);
      setError(err.message || 'Error al iniciar el monitoreo');
    }
  }, [isWatching, proximitySettings.isEnabled, watchInterval, minDistanceFilter]);

  // Stop watching location
  const stopWatching = useCallback(async () => {
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (e) {
      console.error('Error deteniendo tracking', e);
    }
    setIsWatching(false);
    console.log('Proximity watching stopped');
  }, []);

  // Force proximity check
  const forceProximityCheck = useCallback(async () => {
    const location = await getCurrentLocation();
    return location;
  }, [getCurrentLocation]);

  // Auto-start watching if enabled
  useEffect(() => {
    if (enableWatching && proximitySettings.isEnabled && !isWatching) {
      startWatching();
    } else if ((!enableWatching || !proximitySettings.isEnabled) && isWatching) {
      stopWatching();
    }
  }, [enableWatching, proximitySettings.isEnabled, isWatching, startWatching, stopWatching]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    // State
    currentLocation,
    isWatching,
    error,
    detectionState,
    lastProximityCheck,
    
    // Actions
    getCurrentLocation,
    startWatching,
    stopWatching,
    forceProximityCheck,
  };
};
