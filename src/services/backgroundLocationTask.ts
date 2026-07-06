import * as TaskManager from 'expo-task-manager';
import { apiService } from './apiService';
import { deviceService } from './deviceService';
import { checkProximity } from '../utils/locationUtils';
import { Coordinates } from '../types/location';

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

      // Evaluar proximidad
      const proximityResult = checkProximity(currentLocation, homeLocations);

      if (proximityResult.isNearHome && proximityResult.nearestLocation) {
        // Obtenemos IDs
        const deviceId = await deviceService.getDeviceId();
        const userId = await deviceService.getUserId();
        
        // Disparar el evento de entrada (Enter)
        console.log(`🏠 [Background] Cerca de: ${proximityResult.nearestLocation.name}`);
        
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
      }
    } catch (e) {
      console.error('Error procesando ubicación en segundo plano:', e);
    }
  }
});
