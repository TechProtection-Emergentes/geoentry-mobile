import { HomeLocation } from '../types/location';
import { Database } from '../types/supabase';
import { supabase } from '../supabase/supabase-client';
import { deviceService } from './deviceService';

//const API_BASE_URL = 'https://geoentry-rest-api.onrender.com/api';
const API_BASE_URL = 'http://192.168.18.59:3000/api';

// Tipos basados en la estructura de Supabase
type LocationRow = Database['public']['Tables']['locations']['Row'];
type LocationInsert = Database['public']['Tables']['locations']['Insert'];
type ProximityEventInsert = Database['public']['Tables']['proximity_events']['Insert'];

export interface ApiHomeLocation {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  address?: string;
  is_active: boolean;
  profile_id: string;
  created_at?: string;
}

export interface ProximityEvent {
  type: 'enter' | 'exit';
  homeLocationId: string;
  homeLocationName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number;
  timestamp: string;
  deviceId?: string;
  userId?: string;
}

// Tipo que coincide exactamente con la estructura esperada por el DTO del backend
export interface BackendProximityEvent {
  type: string; // 'enter' | 'exit'
  home_location_id: string;
  home_location_name: string;
  latitude: number;
  longitude: number;
  distance: number;
  device_id?: string | null;
  user_id?: string | null;
  // created_at se omite porque se genera automáticamente en el backend
}

export interface Sensor {
  id: string;
  name: string;
  sensor_type: 'led_tv' | 'smart_light' | 'air_conditioner' | 'coffee_maker';
  isActive: boolean;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateSensorData {
  name: string;
  sensor_type: 'led_tv' | 'smart_light' | 'air_conditioner' | 'coffee_maker';
  isActive: boolean;
}

class ApiService {
  private proximityEventEndpoint = '/proximity-events';
  
  setProximityEventEndpoint(endpoint: string) {
    this.proximityEventEndpoint = endpoint;
  }

  // Obtener el usuario actual de Supabase
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Supabase auth error:', error);
        return null;
      }
      
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}. Response: ${errorText}`);
      }

      const responseText = await response.text();

      if (!responseText) {
        return {} as T;
      }

      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Guardar una nueva ubicación
  async saveLocation(location: Omit<HomeLocation, 'id' | 'createdAt'>): Promise<HomeLocation> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const apiLocation: Omit<ApiHomeLocation, 'id' | 'created_at'> = {
      name: location.name,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      radius: location.radius,
      address: location.address || '',
      is_active: location.isActive,
      profile_id: userId,
    };


    const result = await this.makeRequest<ApiHomeLocation>('/locations', {
      method: 'POST',
      body: JSON.stringify(apiLocation),
    });

    // Convertir la respuesta de la API al formato interno
    return {
      id: result.id || Date.now().toString(),
      name: result.name,
      coordinates: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
      radius: result.radius,
      address: result.address || '',
      isActive: result.is_active,
      createdAt: result.created_at || new Date().toISOString(),
    };
  }

  // Obtener todas las ubicaciones
  async getLocations(): Promise<HomeLocation[]> {
    try {
      const userId = await this.getCurrentUserId();
      
      if (!userId) {
        return [];
      }

      // Obtener solo las ubicaciones del usuario actual
      const url = `/locations?profile_id=${userId}`;
      
      const result = await this.makeRequest<ApiHomeLocation[]>(url);
      
      // Convertir la respuesta de la API al formato interno
      const locations = result.map(apiLocation => ({
        id: apiLocation.id || Date.now().toString(),
        name: apiLocation.name,
        coordinates: {
          latitude: apiLocation.latitude,
          longitude: apiLocation.longitude,
        },
        radius: apiLocation.radius,
        address: apiLocation.address || '',
        isActive: apiLocation.is_active,
        createdAt: apiLocation.created_at || new Date().toISOString(),
      }));
      
      return locations;
    } catch (error) {
      console.error('Error in getLocations:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return [];
    }
  }

  // Actualizar una ubicación
  async updateLocation(id: string, updates: Partial<HomeLocation>): Promise<HomeLocation> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const apiUpdates: Partial<ApiHomeLocation> = {
      name: updates.name,
      latitude: updates.coordinates?.latitude,
      longitude: updates.coordinates?.longitude,
      radius: updates.radius,
      address: updates.address,
      is_active: updates.isActive,
      profile_id: userId, // Asegurar que siempre se incluya el user_id
    };


    const result = await this.makeRequest<ApiHomeLocation>(`/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(apiUpdates),
    });

    return {
      id: result.id || id,
      name: result.name,
      coordinates: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
      radius: result.radius,
      address: result.address || '',
      isActive: result.is_active,
      createdAt: result.created_at || new Date().toISOString(),
    };
  }

  // Eliminar una ubicación
  async deleteLocation(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await this.makeRequest(`/locations/${id}?profile_id=${userId}`, {
      method: 'DELETE',
    });
  }

  // Enviar evento de proximidad
  async sendProximityEvent(event: ProximityEvent): Promise<void> {
    try {
      
      // Verificar salud de la API primero
      const isApiHealthy = await this.checkApiHealth();
      if (!isApiHealthy) {
        console.warn('API is not healthy, skipping proximity event send');
        return;
      }

      // Obtener el user_id actual
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.error('User not authenticated, cannot send proximity event');
        return;
      }
      
      // Formatear el evento para que coincida exactamente con la estructura de Supabase
      const formattedEvent: BackendProximityEvent = {
        type: event.type,
        home_location_id: event.homeLocationId,
        home_location_name: event.homeLocationName,
        latitude: event.coordinates.latitude,
        longitude: event.coordinates.longitude,
        distance: event.distance,
        device_id: (event.deviceId && this.isValidUUID(event.deviceId)) ? event.deviceId : null,
        user_id: userId, // Usar el user_id actual del usuario autenticado
        // created_at se genera automáticamente en el backend, no enviar
      };
      
      
      // Validar que device_id sea UUID si se proporciona
      if (formattedEvent.device_id && !this.isValidUUID(formattedEvent.device_id)) {
        console.warn('Device ID is not a valid UUID, sending as null:', formattedEvent.device_id);
        formattedEvent.device_id = null;
      }
        
      // Usar el endpoint correcto
      await this.makeRequest(this.proximityEventEndpoint, {
        method: 'POST',
        body: JSON.stringify(formattedEvent),
      });
      
    } catch (error) {
      console.error('Failed to send proximity event to API:', error);
    }
  }

  // Verificar si la API está disponible
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  // Función para validar si un string es un UUID válido
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Registrar dispositivo móvil en el backend
  async registerDevice(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn('User not authenticated, cannot register device');
        return;
      }

      const deviceId = await deviceService.getDeviceId();
      const deviceInfo = await deviceService.initializeDeviceInfo();

      if (!this.isValidUUID(deviceId)) {
        console.warn('Device ID is not a valid UUID, cannot register device:', deviceId);
        return;
      }

      // Verificar si el dispositivo ya existe
      try {
        await this.makeRequest(`/devices/${deviceId}`, { method: 'GET' });
        return;
      } catch (error) {
        // Dispositivo no existe, continuar con el registro
      }

      const deviceData = {
        id: deviceId,
        name: deviceInfo.deviceName || 'Mobile Device',
        type: `${deviceInfo.platform} ${deviceInfo.osVersion}`,
        profile_id: userId,
      };


      await this.makeRequest('/devices', {
        method: 'POST',
        body: JSON.stringify(deviceData),
      });

    } catch (error) {
      console.error('Failed to register device:', error);
      // No lanzar error para no interrumpir la funcionalidad
    }
  }

  // Obtener eventos de proximidad del usuario
  async getEvents(): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return [];
      }

      // Obtener eventos del usuario actual
      const result = await this.makeRequest<any[]>(`/proximity-events/user/${userId}`);
      
      return result.map(event => ({
        id: event.id || Date.now().toString(),
        type: event.type,
        latitude: event.latitude,
        longitude: event.longitude,
        distance: event.distance,
        home_location_id: event.home_location_id,
        home_location_name: event.home_location_name,
        device_id: event.device_id,
        user_id: event.user_id,
        created_at: event.created_at,
      }));
    } catch (error) {
      return [];
    }
  }

  // Obtener dispositivos del usuario
  async getDevices(): Promise<any[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return [];
      }

      // Obtener dispositivos del usuario actual
      const result = await this.makeRequest<any[]>(`/devices/user/${userId}`);
      
      return result.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type,
        profile_id: device.profile_id,
        created_at: device.created_at,
        updated_at: device.updated_at,
      }));
    } catch (error) {
      return [];
    }
  }

  async getSensorsByUser(userId?: string): Promise<any[]> {
    try {
      const targetUserId = userId || await this.getCurrentUserId();
      if (!targetUserId) {
        return [];
      }

      const result = await this.makeRequest<any[]>(`/sensors/user/${targetUserId}`);
      return result;
    } catch (error) {
      console.error('Error fetching sensors:', error);
      return [];
    }
  }

  async getSensorsByUserAndType(sensorType: 'led_tv' | 'smart_light' | 'air_conditioner' | 'coffee_maker', userId?: string): Promise<any[]> {
    try {
      const targetUserId = userId || await this.getCurrentUserId();
      if (!targetUserId) {
        return [];
      }

      const result = await this.makeRequest<any[]>(`/sensors/user/${targetUserId}/type/${sensorType}`);
      return result;
    } catch (error) {
      console.error('Error fetching sensors by type:', error);
      return [];
    }
  }

  async createSensorForUser(sensorData: {
    name: string;
    sensor_type: 'led_tv' | 'smart_light' | 'air_conditioner' | 'coffee_maker';
    isActive: boolean;
  }, userId?: string): Promise<any> {
    try {
      const targetUserId = userId || await this.getCurrentUserId();
      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      const result = await this.makeRequest(`/sensors/user/${targetUserId}`, {
        method: 'POST',
        body: JSON.stringify(sensorData),
      });
      return result;
    } catch (error) {
      console.error('Error creating sensor:', error);
      throw error;
    }
  }

  async updateSensorStatus(sensorId: string, isActive: boolean): Promise<any> {
    try {
      const result = await this.makeRequest(`/sensors/${sensorId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      return result;
    } catch (error) {
      console.error('Error updating sensor status:', error);
      throw error;
    }
  }

  async deleteSensor(sensorId: string): Promise<void> {
    try {
      await this.makeRequest(`/sensors/${sensorId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting sensor:', error);
      throw error;
    }
  }

  async getAvailableSensorTypes(userId?: string): Promise<string[]> {
    try {
      const targetUserId = userId || await this.getCurrentUserId();
      if (!targetUserId) {
        throw new Error('User not authenticated');
      }

      const result = await this.makeRequest<{ availableTypes: string[] }>(`/sensors/user/${targetUserId}/available-types`);
      return result.availableTypes;
    } catch (error) {
      console.error('Error fetching available sensor types:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();
