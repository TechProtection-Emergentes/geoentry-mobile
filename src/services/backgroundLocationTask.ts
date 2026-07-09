import * as TaskManager from 'expo-task-manager';
import { apiService } from './apiService';
import { deviceService } from './deviceService';
import { checkProximity } from '../utils/locationUtils';
import { Coordinates } from '../types/location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_STATE_KEY = '@geoentry_last_proximity_state';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Error en background task:', error);
    return;
  }
  if (data) {
    try {
      const { locations } = data as any;
      if (!locations || locations.length === 0) return;

      const currentLocationCoords = locations[0].coords;
      const currentLocation: Coordinates = {
        latitude: currentLocationCoords.latitude,
        longitude: currentLocationCoords.longitude,
      };

      console.log('📍 [Background] Ubicación detectada:', currentLocation);

      // Obtener ubicaciones guardadas desde la API (Supabase)
      const homeLocations = await apiService.getLocations();
      
      if (homeLocations.length === 0) {
        console.log('No hay ubicaciones registradas para el usuario.');
        return;
      }

      // Leer estado anterior
      const lastStateRaw = await AsyncStorage.getItem(LAST_STATE_KEY);
      const lastState = lastStateRaw ? JSON.parse(lastStateRaw) : { isNearHome: false, locationId: null };

      // Evaluar proximidad
      const proximityResult = checkProximity(currentLocation, homeLocations);

      // Si el estado cambió a "Cerca de casa" (Enter)
      if (proximityResult.isNearHome && proximityResult.nearestLocation) {
        if (!lastState.isNearHome || lastState.locationId !== proximityResult.nearestLocation.id) {
          const deviceId = await deviceService.getDeviceId();
          const userId = await deviceService.getUserId();
          
          console.log(`🏠 [Background] Cerca de: ${proximityResult.nearestLocation.name} (EVENTO ENTER ENVIADO)`);
          
          await apiService.sendProximityEvent({
            type: 'enter',
            homeLocationId: proximityResult.nearestLocation.id,
            homeLocationName: proximityResult.nearestLocation.name,
            coordinates: proximityResult.nearestLocation.coordinates,
            distance: proximityResult.distance || 0,
            timestamp: new Date().toISOString(),
            deviceId,
            userId: userId || undefined,
          });

          // Guardar nuevo estado
          await AsyncStorage.setItem(LAST_STATE_KEY, JSON.stringify({ 
            isNearHome: true, 
            locationId: proximityResult.nearestLocation.id 
          }));
        } else {
          console.log(`🏠 [Background] Sigues cerca de: ${proximityResult.nearestLocation.name} (Ignorando)`);
        }
      } 
      // Si el estado cambió a "Lejos de casa" (Exit)
      else if (!proximityResult.isNearHome && lastState.isNearHome) {
        const deviceId = await deviceService.getDeviceId();
        const userId = await deviceService.getUserId();
        
        // Encontrar la última ubicación de la que salimos para reportarla
        const lastLocation = homeLocations.find((l: any) => l.id === lastState.locationId);
        
        if (lastLocation) {
          console.log(`🚪 [Background] Saliste de: ${lastLocation.name} (EVENTO EXIT ENVIADO)`);
          
          await apiService.sendProximityEvent({
            type: 'exit',
            homeLocationId: lastLocation.id,
            homeLocationName: lastLocation.name,
            coordinates: lastLocation.coordinates,
            distance: proximityResult.distance || 0,
            timestamp: new Date().toISOString(),
            deviceId,
            userId: userId || undefined,
          });
        }

        // Guardar nuevo estado
        await AsyncStorage.setItem(LAST_STATE_KEY, JSON.stringify({ 
          isNearHome: false, 
          locationId: null 
        }));
      }
    } catch (e) {
      console.error('Error procesando ubicación en segundo plano:', e);
    }
  }
});
