import React, { useState, useRef } from 'react';
import { View, Text, ActivityIndicator, Pressable, Alert, Modal, ScrollView } from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import * as Location from 'expo-location';
import { useLocations } from '../hooks/useLocations';
import { useDevices } from '../hooks/useDevices';
import { useEvents } from '../hooks/useEvents';
import { HomeLocation } from '../types/location';

interface LocationStats {
  eventsLast24h: number;
  devicesRegistered: number;
  isOccupied: boolean;
}

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const LocationsScreen: React.FC = () => {
  const { locations, loading: locationsLoading, error: locationsError, refetch: refetchLocations } = useLocations();
  const { devices, loading: devicesLoading, refetch: refetchDevices } = useDevices();
  const { events, loading: eventsLoading, refetch: refetchEvents } = useEvents();
  
  const mapRef = useRef<MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState<HomeLocation | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [refreshing, setRefreshing] = useState(false);


  // Default region (Peru/Lima area)
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: -12.0464,
    longitude: -77.0428,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const loading = locationsLoading || devicesLoading || eventsLoading;

  // Get user's current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permisos de ubicación denegados');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);
      
      // Center map on user location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
    }
  };

  // Get statistics for a location
  const getLocationStats = (location: HomeLocation): LocationStats => {
    // Events in last 24 hours for this location
    const last24h = new Date();
    last24h.setDate(last24h.getDate() - 1);
    
    const recentEvents = events.filter(event => 
      event.home_location_id === location.id && 
      event.created_at && 
      new Date(event.created_at) > last24h
    );

    // Devices registered to this location (simplified - all user devices for now)
    const locationDevices = devices.length;

    // Check if occupied based on recent "enter" events without corresponding "exit"
    const enterEvents = recentEvents.filter(e => e.type === 'enter');
    const exitEvents = recentEvents.filter(e => e.type === 'exit');
    const isOccupied = enterEvents.length > exitEvents.length;

    return {
      eventsLast24h: recentEvents.length,
      devicesRegistered: locationDevices,
      isOccupied,
    };
  };

  // Refresh all data
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchLocations(), refetchDevices(), refetchEvents()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Center map on all locations
  const centerMapOnLocations = () => {
    if (locations.length === 0 || !mapRef.current) return;

    if (locations.length === 1) {
      mapRef.current.animateToRegion({
        latitude: locations[0].coordinates.latitude,
        longitude: locations[0].coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      const coordinates = locations.map(loc => ({
        latitude: loc.coordinates.latitude,
        longitude: loc.coordinates.longitude,
      }));
      
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  React.useEffect(() => {
    if (locations.length > 0) {
      centerMapOnLocations();
    }
  }, [locations]);

  if (loading && locations.length === 0) {
    return (
      <View style={tw`flex-1 bg-gray-900 items-center justify-center`}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={tw`text-white mt-4`}>Cargando ubicaciones...</Text>
      </View>
    );
  }

  if (locationsError && locations.length === 0) {
    return (
      <View style={tw`flex-1 bg-gray-900 items-center justify-center px-6`}>
        <MaterialIcons name="error-outline" size={48} color="#f87171" />
        <Text style={tw`text-red-400 text-center mt-4`}>
          Error al cargar ubicaciones: {locationsError}
        </Text>
        <Pressable
          style={tw`bg-blue-600 px-6 py-3 rounded-lg mt-4`}
          onPress={onRefresh}
        >
          <Text style={tw`text-white font-medium`}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-900`}>
      {/* Header */}
      <View style={tw`bg-gray-800 px-4 py-3 flex-row items-center justify-between`}>
        <View>
          <Text style={tw`text-white text-xl font-bold`}>Ubicaciones</Text>
          <Text style={tw`text-gray-400 text-sm`}>
            {locations.length} ubicación{locations.length !== 1 ? 'es' : ''} configurada{locations.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
        <View style={tw`flex-row`}>
          <Pressable
            style={tw`bg-blue-600 rounded-lg p-3 mr-2`}
            onPress={getCurrentLocation}
          >
            <MaterialIcons name="my-location" size={20} color="white" />
          </Pressable>
          
          <Pressable
            style={tw`bg-green-600 rounded-lg p-3 mr-2`}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
          </Pressable>
          
          <Pressable
            style={tw`bg-gray-700 rounded-lg p-3`}
            onPress={centerMapOnLocations}
          >
            <MaterialIcons name="center-focus-strong" size={20} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Map */}
      <View style={tw`flex-1`}>
        <MapView
          ref={mapRef}
          style={tw`flex-1`}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              title="Mi ubicación"
              description="Tu ubicación actual"
              pinColor="#10b981"
            />
          )}

          {/* Location markers and circles */}
          {locations.map((location) => {
            const stats = getLocationStats(location);
            const isActive = location.isActive;
            
            return (
              <React.Fragment key={location.id}>
                {/* Geofence circle */}
                <Circle
                  center={{
                    latitude: location.coordinates.latitude,
                    longitude: location.coordinates.longitude,
                  }}
                  radius={location.radius}
                  strokeColor={isActive ? '#60a5fa80' : '#9ca3af40'}
                  fillColor={isActive ? '#60a5fa20' : '#9ca3af10'}
                  strokeWidth={2}
                />
                
                {/* Location marker */}
                <Marker
                  coordinate={{
                    latitude: location.coordinates.latitude,
                    longitude: location.coordinates.longitude,
                  }}
                  onPress={() => setSelectedLocation(location)}
                  title={location.name}
                  description={`${stats.isOccupied ? 'Ocupado' : 'Libre'} • ${stats.eventsLast24h} eventos (24h)`}
                  pinColor={isActive ? '#3b82f6' : '#6b7280'}
                />
              </React.Fragment>
            );
          })}
        </MapView>
        
        {/* Leyenda */}
        <View style={tw`absolute top-4 left-4 bg-gray-800 rounded-lg p-3 shadow-lg opacity-90`}>
          <Text style={tw`text-white font-bold text-xs mb-2`}>Leyenda</Text>
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`w-3 h-3 rounded-full bg-green-500 mr-2`} />
            <Text style={tw`text-gray-300 text-xs`}>Tú (Celular)</Text>
          </View>
          <View style={tw`flex-row items-center mb-2`}>
            <View style={tw`w-3 h-3 rounded-full bg-blue-500 mr-2`} />
            <Text style={tw`text-gray-300 text-xs`}>Casa / Zona</Text>
          </View>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-3 h-3 rounded-full bg-gray-500 mr-2`} />
            <Text style={tw`text-gray-300 text-xs`}>Inactiva</Text>
          </View>
        </View>
      </View>

      {/* Stats Footer */}
      <View style={tw`bg-gray-800 px-4 py-3`}>
        <View style={tw`flex-row justify-between items-center`}>
          <View style={tw`items-center`}>
            <Text style={tw`text-blue-400 text-lg font-bold`}>
              {locations.filter(l => l.isActive).length}
            </Text>
            <Text style={tw`text-gray-400 text-xs`}>Activas</Text>
          </View>
          
          <View style={tw`items-center`}>
            <Text style={tw`text-green-400 text-lg font-bold`}>
              {locations.filter(l => getLocationStats(l).isOccupied).length}
            </Text>
            <Text style={tw`text-gray-400 text-xs`}>Ocupadas</Text>
          </View>
          
          <View style={tw`items-center`}>
            <Text style={tw`text-yellow-400 text-lg font-bold`}>
              {events.filter(e => {
                if (!e.created_at) return false;
                const eventDate = new Date(e.created_at);
                const today = new Date();
                return eventDate.toDateString() === today.toDateString();
              }).length}
            </Text>
            <Text style={tw`text-gray-400 text-xs`}>Eventos hoy</Text>
          </View>
          
          <View style={tw`items-center`}>
            <Text style={tw`text-purple-400 text-lg font-bold`}>
              {devices.length}
            </Text>
            <Text style={tw`text-gray-400 text-xs`}>Dispositivos</Text>
          </View>
        </View>
      </View>

      {/* Empty state */}
      {locations.length === 0 && !loading && (
        <View style={tw`absolute inset-0 bg-gray-900 bg-opacity-90 items-center justify-center`}>
          <MaterialIcons name="location-off" size={64} color="#9ca3af" />
          <Text style={tw`text-gray-400 text-xl font-bold mt-4 mb-2`}>
            No hay ubicaciones configuradas
          </Text>
          <Text style={tw`text-gray-500 text-center px-8`}>
            Agrega ubicaciones desde la configuración para verlas en el mapa
          </Text>
        </View>
      )}

      {/* Location Details Modal */}
      <Modal
        visible={selectedLocation !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedLocation(null)}
      >
        <View style={tw`flex-1 bg-black bg-opacity-50 justify-end`}>
          <View style={tw`bg-white rounded-t-2xl p-6 max-h-80`}>
            {selectedLocation && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={tw`flex-row items-center justify-between mb-4`}>
                  <Text style={tw`text-gray-900 text-xl font-bold`}>
                    {selectedLocation.name}
                  </Text>
                  <Pressable
                    onPress={() => setSelectedLocation(null)}
                    style={tw`p-2`}
                  >
                    <MaterialIcons name="close" size={24} color="#6b7280" />
                  </Pressable>
                </View>

                {selectedLocation.address && (
                  <View style={tw`flex-row items-center mb-4`}>
                    <MaterialIcons name="location-on" size={20} color="#6b7280" />
                    <Text style={tw`text-gray-600 ml-2 flex-1`}>
                      {selectedLocation.address}
                    </Text>
                  </View>
                )}

                <View style={tw`flex-row items-center mb-4`}>
                  <View style={[
                    tw`w-3 h-3 rounded-full mr-3`,
                    { backgroundColor: getLocationStats(selectedLocation).isOccupied ? '#10b981' : '#6b7280' }
                  ]} />
                  <Text style={tw`text-gray-700 text-lg`}>
                    {getLocationStats(selectedLocation).isOccupied ? 'Ocupado' : 'Libre'}
                  </Text>
                </View>

                <View style={tw`bg-gray-50 rounded-lg p-4 mb-4`}>
                  <Text style={tw`text-gray-900 font-semibold mb-3`}>Estadísticas</Text>
                  
                  <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text style={tw`text-gray-600`}>Eventos (24h)</Text>
                    <Text style={tw`text-gray-900 font-medium`}>
                      {getLocationStats(selectedLocation).eventsLast24h}
                    </Text>
                  </View>
                  
                  <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text style={tw`text-gray-600`}>Dispositivos</Text>
                    <Text style={tw`text-gray-900 font-medium`}>
                      {getLocationStats(selectedLocation).devicesRegistered}
                    </Text>
                  </View>
                  
                  <View style={tw`flex-row justify-between items-center mb-2`}>
                    <Text style={tw`text-gray-600`}>Radio</Text>
                    <Text style={tw`text-gray-900 font-medium`}>
                      {selectedLocation.radius}m
                    </Text>
                  </View>
                  
                  <View style={tw`flex-row justify-between items-center border-t border-gray-200 pt-2 mt-2`}>
                    <Text style={tw`text-gray-600`}>Estado</Text>
                    <View style={tw`flex-row items-center`}>
                      <View style={[
                        tw`w-2 h-2 rounded-full mr-2`,
                        { backgroundColor: selectedLocation.isActive ? '#10b981' : '#ef4444' }
                      ]} />
                      <Text style={tw`text-gray-900 font-medium`}>
                        {selectedLocation.isActive ? 'Activo' : 'Inactivo'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable
                  style={tw`bg-blue-600 rounded-lg py-3 items-center`}
                  onPress={() => setSelectedLocation(null)}
                >
                  <Text style={tw`text-white font-medium`}>Cerrar</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LocationsScreen;