import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking, ScrollView, Clipboard, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { useHomeLocation } from '../contexts/HomeLocationContext';
import { useProximityDetection } from '../hooks/useProximityDetection';
import { ProximityModal } from '../components/ProximityModal';
import { calculateDistance } from '../utils/locationUtils';

// Styled Components
const Container = styled.ScrollView`
  flex: 1;
  background-color: ${COLORS.background};
  padding: ${SPACING.lg}px;
`;

const StatusCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
  align-items: center;
`;

const StatusIcon = styled.View<{ status: 'loading' | 'success' | 'error' }>`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: ${({ status }: { status: 'loading' | 'success' | 'error' }) => 
    status === 'loading' ? COLORS.accent :
    status === 'success' ? '#4CAF50' :
    '#F44336'};
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.md}px;
`;

const StatusText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  text-align: center;
`;

const CoordinatesCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
`;

const CardTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.md}px;
`;

const CoordinateRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.sm}px;
`;

const CoordinateLabel = styled.Text`
  color: ${COLORS.accent};
  font-size: ${TYPOGRAPHY.body}px;
`;

const CoordinateValue = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 500;
  flex: 1;
  text-align: right;
  margin-right: ${SPACING.sm}px;
`;

const AddressCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
`;

const AddressText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  line-height: 22px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  background-color: ${({ variant }: { variant?: 'primary' | 'secondary' }) => variant === 'secondary' ? COLORS.secondary : COLORS.accent};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  align-items: center;
  margin-bottom: ${SPACING.md}px;
  flex-direction: row;
  justify-content: center;
`;

const ButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  color: ${({ variant }: { variant?: 'primary' | 'secondary' }) => variant === 'secondary' ? COLORS.textPrimary : COLORS.background};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-left: ${SPACING.sm}px;
`;

const AccuracyIndicator = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${SPACING.sm}px;
`;

const AccuracyDot = styled.View<{ level: 'high' | 'medium' | 'low' }>`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({ level }: { level: 'high' | 'medium' | 'low' }) => 
    level === 'high' ? '#4CAF50' :
    level === 'medium' ? '#FF9800' :
    '#F44336'};
  margin-right: ${SPACING.xs}px;
`;

const AccuracyText = styled.Text`
  color: ${COLORS.accent};
  font-size: ${TYPOGRAPHY.small}px;
`;

const ProximityCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
`;

const ProximityHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${SPACING.md}px;
`;

const ProximityTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
`;

const ProximityStatus = styled.Text<{ isNear: boolean }>`
  color: ${(props: { isNear: boolean }) => props.isNear ? COLORS.statusGreen : COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.body}px;
  margin-bottom: ${SPACING.sm}px;
`;

const HomeLocationItem = styled.TouchableOpacity`
  background-color: ${COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HomeLocationInfo = styled.View`
  flex: 1;
`;

const HomeLocationName = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-bottom: ${SPACING.xs}px;
`;

const HomeLocationDistance = styled.Text<{ isNear: boolean }>`
  color: ${(props: { isNear: boolean }) => props.isNear ? COLORS.statusGreen : COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
`;

const SettingsSection = styled.View`
  margin-top: ${SPACING.lg}px;
`;

const SettingRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${SPACING.md}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${COLORS.background};
`;

const SettingLabel = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  flex: 1;
`;

const HistoryItem = styled.View`
  background-color: ${COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
`;

const HistoryIcon = styled.View<{ eventType: 'enter' | 'exit' }>`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${(props: { eventType: 'enter' | 'exit' }) => props.eventType === 'enter' ? COLORS.statusGreen : COLORS.statusRed}33;
  align-items: center;
  justify-content: center;
  margin-right: ${SPACING.md}px;
`;

const HistoryInfo = styled.View`
  flex: 1;
`;

const HistoryText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-bottom: ${SPACING.xs}px;
`;

const HistoryTime = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
`;

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
}

interface AddressData {
  street: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
}

type LocationStatus = 'idle' | 'loading' | 'success' | 'error';

const LocationScreen: React.FC = () => {
  const { state, updateProximitySettings, dispatch } = useHomeLocation();
  const { homeLocations, proximitySettings, locationHistory } = state;
  
  const {
    currentLocation,
    isWatching,
    error: proximityError,
    detectionState,
    startWatching,
    stopWatching,
    getCurrentLocation: getProximityLocation,
  } = useProximityDetection({
    enableWatching: proximitySettings.isEnabled,
  });

  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<AddressData | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showProximityModal, setShowProximityModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'location' | 'proximity' | 'settings' | 'history'>('location');
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);

  useEffect(() => {
    checkLocationPermission();
    return () => {
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }
    };
  }, []);
  // Show proximity modal when entering home area
  useEffect(() => {
    if (detectionState.isNearHome && 
        detectionState.nearestHomeLocation && 
        proximitySettings.showNotifications &&
        !detectionState.modalShownForCurrentSession &&
        !showProximityModal) {
      setShowProximityModal(true);
    }
  }, [detectionState.isNearHome, detectionState.modalShownForCurrentSession, proximitySettings.showNotifications, showProximityModal]);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === Location.PermissionStatus.GRANTED) {
        getCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      setErrorMessage('Error al verificar permisos');
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === Location.PermissionStatus.GRANTED) {
        getCurrentLocation();
      } else if (status === Location.PermissionStatus.DENIED) {
        Alert.alert(
          'Permisos Necesarios',
          'Esta aplicación necesita acceso a tu ubicación para funcionar correctamente. Ve a Configuración para habilitarlo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ir a Configuración', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setErrorMessage('Error al solicitar permisos');
    }
  };

  const getCurrentLocation = async () => {
    try {      setStatus('loading');
      setErrorMessage('');

      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Los servicios de ubicación están desactivados');
      }

      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const locationData: LocationData = {
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
        accuracy: locationResult.coords.accuracy,
        altitude: locationResult.coords.altitude,
        speed: locationResult.coords.speed,
        timestamp: locationResult.timestamp,
      };

      setLocation(locationData);
      setStatus('success');
      
      await getAddressFromCoordinates(locationData.latitude, locationData.longitude);
      
    } catch (error: any) {
      console.error('Error getting location:', error);
      setStatus('error');
      
      if (error.code === 'E_LOCATION_TIMEOUT') {
        setErrorMessage('Tiempo de espera agotado. Intenta nuevamente.');
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        setErrorMessage('Ubicación no disponible. Verifica que el GPS esté activado.');
      } else {
        setErrorMessage(error.message || 'Error al obtener la ubicación');
      }
    }
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const addressResult = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addressResult.length > 0) {
        const addr = addressResult[0];
        setAddress({
          street: `${addr.name || ''} ${addr.street || ''}`.trim(),
          city: addr.city || '',
          region: addr.region || '',
          country: addr.country || '',
          postalCode: addr.postalCode || '',
        });
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const startWatchingLocation = async () => {
    try {
      if (watchSubscription.current) {
        watchSubscription.current.remove();
      }

      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (locationResult) => {
          const locationData: LocationData = {
            latitude: locationResult.coords.latitude,
            longitude: locationResult.coords.longitude,
            accuracy: locationResult.coords.accuracy,
            altitude: locationResult.coords.altitude,
            speed: locationResult.coords.speed,
            timestamp: locationResult.timestamp,
          };
          setLocation(locationData);
        }
      );
      setIsWatchingLocation(true);
    } catch (error) {
      console.error('Error watching location:', error);
    }
  };

  const stopWatchingLocation = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
      setIsWatchingLocation(false);
    }
  };

  const copyCoordinates = async () => {
    if (location) {
      const coords = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      await Clipboard.setString(coords);
      Alert.alert('Copiado', 'Coordenadas copiadas al portapapeles');
    }
  };

  const shareLocation = () => {
    if (location) {
      const coords = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      const url = `https://www.google.com/maps?q=${coords}`;
      
      Alert.alert(
        'Compartir Ubicación',
        `Coordenadas: ${coords}\n\nAbrir en Google Maps?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Abrir', onPress: () => Linking.openURL(url) }
        ]
      );
    }
  };

  const getAccuracyLevel = (accuracy: number | null): 'high' | 'medium' | 'low' => {
    if (!accuracy) return 'low';
    if (accuracy <= 10) return 'high';
    if (accuracy <= 50) return 'medium';
    return 'low';
  };

  const getAccuracyText = (accuracy: number | null): string => {
    if (!accuracy) return 'Precisión desconocida';
    const level = getAccuracyLevel(accuracy);
    return `${accuracy.toFixed(1)}m - ${
      level === 'high' ? 'Excelente' :
      level === 'medium' ? 'Buena' : 'Baja'
    }`;
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'loading':
        return {
          icon: 'gps-fixed' as const,
          text: 'Obteniendo ubicación...',
          status: 'loading' as const
        };
      case 'success':
        return {
          icon: 'location-on' as const,
          text: 'Ubicación obtenida',
          status: 'success' as const
        };
      case 'error':
        return {
          icon: 'location-off' as const,
          text: errorMessage || 'Error al obtener ubicación',
          status: 'error' as const
        };
      default:
        return {
          icon: 'location-searching' as const,
          text: 'Presiona para obtener ubicación',
          status: 'loading' as const
        };
    }
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const handleEnterHome = () => {
    setShowProximityModal(false);
    
    // Mark modal as shown for current session
    dispatch({
      type: 'SET_DETECTION_STATE',
      payload: {
        modalShownForCurrentSession: true,
      },
    });
    
    // Here you could trigger home automation
    Alert.alert('Bienvenido a casa', 'Dispositivos activados automáticamente');
  };

  const handleCloseModal = () => {
    setShowProximityModal(false);
    
    // Mark modal as shown for current session even if dismissed
    dispatch({
      type: 'SET_DETECTION_STATE',
      payload: {
        modalShownForCurrentSession: true,
      },
    });
  };

  const toggleProximityDetection = async (enabled: boolean) => {
    await updateProximitySettings({ isEnabled: enabled });
    if (enabled) {
      startWatching();
    } else {
      stopWatching();
    }
  };

  if (permissionStatus !== Location.PermissionStatus.GRANTED) {
    return (
      <Container contentContainerStyle={{ flex: 1, justifyContent: 'center' }}>
        <StatusCard>
          <StatusIcon status="error">
            <MaterialIcons name="location-disabled" size={30} color="white" />
          </StatusIcon>
          <StatusText>
            {permissionStatus === Location.PermissionStatus.DENIED
              ? 'Permisos de ubicación denegados'
              : 'Se necesitan permisos de ubicación'
            }
          </StatusText>
        </StatusCard>
        
        <ActionButton onPress={requestLocationPermission}>
          <MaterialIcons name="location-on" size={20} color={COLORS.background} />
          <ButtonText>Solicitar Permisos</ButtonText>
        </ActionButton>
      </Container>
    );
  }

  const statusInfo = getStatusInfo();
  return (
    <>
      <Container>
        {/* Section Navigation */}
        <CoordinatesCard>
          <CardTitle>Ubicación y Proximidad</CardTitle>
          <View style={{ flexDirection: 'row', marginBottom: SPACING.md }}>
            {[
              { key: 'location', label: 'Ubicación', icon: 'my-location' },
              { key: 'proximity', label: 'Proximidad', icon: 'home' },
            ].map((section) => (
              <TouchableOpacity
                key={section.key}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: SPACING.sm,
                  backgroundColor: activeSection === section.key ? COLORS.accent + '33' : 'transparent',
                  borderRadius: 8,
                  marginHorizontal: SPACING.xs,
                }}
                onPress={() => setActiveSection(section.key as any)}
              >
                <MaterialIcons 
                  name={section.icon as any} 
                  size={20} 
                  color={activeSection === section.key ? COLORS.accent : COLORS.textPrimary + '99'} 
                />
                <Text 
                  style={{
                    color: activeSection === section.key ? COLORS.accent : COLORS.textPrimary + '99',
                    fontSize: TYPOGRAPHY.small,
                    marginTop: SPACING.xs,
                  }}
                >
                  {section.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </CoordinatesCard>

        {/* Location Section */}
        {activeSection === 'location' && (
          <>
            <StatusCard>
              <StatusIcon status={statusInfo.status}>
                <MaterialIcons 
                  name={statusInfo.icon} 
                  size={30} 
                  color="white" 
                />
              </StatusIcon>
              <StatusText>{statusInfo.text}</StatusText>
            </StatusCard>

            {location && (
              <>
                <CoordinatesCard>
                  <CardTitle>Coordenadas</CardTitle>
                  <CoordinateRow>
                    <CoordinateLabel>Latitud:</CoordinateLabel>
                    <CoordinateValue>{location.latitude.toFixed(6)}</CoordinateValue>
                    <TouchableOpacity onPress={copyCoordinates}>
                      <MaterialIcons name="content-copy" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                  </CoordinateRow>
                  <CoordinateRow>
                    <CoordinateLabel>Longitud:</CoordinateLabel>
                    <CoordinateValue>{location.longitude.toFixed(6)}</CoordinateValue>
                    <TouchableOpacity onPress={copyCoordinates}>
                      <MaterialIcons name="content-copy" size={20} color={COLORS.accent} />
                    </TouchableOpacity>
                  </CoordinateRow>
                  {location.altitude !== null && (
                    <CoordinateRow>
                      <CoordinateLabel>Altitud:</CoordinateLabel>
                      <CoordinateValue>{location.altitude.toFixed(1)}m</CoordinateValue>
                      <View style={{ width: 20 }} />
                    </CoordinateRow>
                  )}
                  {location.speed !== null && location.speed > 0 && (
                    <CoordinateRow>
                      <CoordinateLabel>Velocidad:</CoordinateLabel>
                      <CoordinateValue>{(location.speed * 3.6).toFixed(1)} km/h</CoordinateValue>
                      <View style={{ width: 20 }} />
                    </CoordinateRow>
                  )}
                  <AccuracyIndicator>
                    <AccuracyDot level={getAccuracyLevel(location.accuracy)} />
                    <AccuracyText>{getAccuracyText(location.accuracy)}</AccuracyText>
                  </AccuracyIndicator>
                </CoordinatesCard>

                {address && (
                  <AddressCard>
                    <CardTitle>Dirección</CardTitle>
                    <AddressText>
                      {[address.street, address.city, address.region, address.country]
                        .filter(Boolean)
                        .join(', ')}
                      {address.postalCode && ` ${address.postalCode}`}
                    </AddressText>
                  </AddressCard>
                )}
              </>
            )}

            <ActionButton onPress={getCurrentLocation} disabled={status === 'loading'}>
              <MaterialIcons 
                name="my-location" 
                size={20} 
                color={COLORS.background} 
              />
              <ButtonText>Actualizar Ubicación</ButtonText>
            </ActionButton>

            {location && (
              <>
                <ActionButton 
                  variant="secondary" 
                  onPress={isWatchingLocation ? stopWatchingLocation : startWatchingLocation}
                >
                  <MaterialIcons 
                    name={isWatchingLocation ? "location-disabled" : "track-changes"} 
                    size={20} 
                    color={COLORS.textPrimary} 
                  />
                  <ButtonText variant="secondary">
                    {isWatchingLocation ? 'Detener Seguimiento' : 'Seguimiento en Tiempo Real'}
                  </ButtonText>
                </ActionButton>

                <ActionButton variant="secondary" onPress={shareLocation}>
                  <MaterialIcons name="share" size={20} color={COLORS.textPrimary} />
                  <ButtonText variant="secondary">Compartir Ubicación</ButtonText>
                </ActionButton>
              </>
            )}
          </>
        )}

        {/* Proximity Section */}
        {activeSection === 'proximity' && (
          <>
            <ProximityCard>
              <ProximityHeader>
                <ProximityTitle>Detección de Proximidad</ProximityTitle>
                <Switch
                  value={proximitySettings.isEnabled}
                  onValueChange={toggleProximityDetection}
                  trackColor={{ false: COLORS.secondary, true: COLORS.accent }}
                  thumbColor={COLORS.textPrimary}
                />
              </ProximityHeader>

              <ProximityStatus isNear={detectionState.isNearHome}>
                {detectionState.isNearHome ? 
                  `¡Estás cerca de casa! (${detectionState.currentDistance ? formatDistance(detectionState.currentDistance) : 'calculando...'})` :
                  `Fuera del área de casa ${detectionState.currentDistance ? `(${formatDistance(detectionState.currentDistance)})` : ''}`
                }
              </ProximityStatus>

              <View style={{ marginBottom: SPACING.md }}>
                <Text style={{ color: COLORS.textPrimary + '99', fontSize: TYPOGRAPHY.small, marginBottom: SPACING.sm }}>
                  Estado del monitoreo: {isWatching ? 'Activo' : 'Inactivo'}
                </Text>
                {detectionState.lastDetectionTime && (
                  <Text style={{ color: COLORS.textPrimary + '99', fontSize: TYPOGRAPHY.small }}>
                    Última detección: {formatDateTime(detectionState.lastDetectionTime)}
                  </Text>
                )}
              </View>

              {homeLocations.length === 0 ? (
                <Text style={{ color: COLORS.textPrimary + '99', textAlign: 'center', padding: SPACING.lg }}>
                  No hay ubicaciones de casa configuradas
                </Text>
              ) : (
                <>
                  <Text style={{ color: COLORS.textPrimary, fontSize: TYPOGRAPHY.body, fontWeight: '600', marginBottom: SPACING.md }}>
                    Ubicaciones de Casa ({homeLocations.filter(loc => loc.isActive).length} activas)
                  </Text>
                  
                  {homeLocations.map((homeLocation) => {
                    const distance = currentLocation ? 
                      calculateDistance(currentLocation, homeLocation.coordinates) : null;
                    const isNear = distance ? distance <= homeLocation.radius : false;
                    
                    return (
                      <HomeLocationItem key={homeLocation.id}>
                        <HomeLocationInfo>
                          <HomeLocationName>{homeLocation.name}</HomeLocationName>
                          <HomeLocationDistance isNear={isNear}>
                            {distance ? formatDistance(distance) : 'Calculando...'} • Radio: {homeLocation.radius}m
                            {!homeLocation.isActive && ' • Inactiva'}                          
                            </HomeLocationDistance>
                        </HomeLocationInfo>
                        <View style={{ alignItems: 'center' }}>
                          <MaterialIcons 
                            name={isNear ? "home" : "location-city"} 
                            size={24} 
                            color={isNear ? COLORS.statusGreen : COLORS.textPrimary + '99'} 
                          />
                        </View>
                      </HomeLocationItem>
                    );
                  })}
                </>
              )}
            </ProximityCard>
          </>        
        )}
      </Container>

      <ProximityModal
        visible={showProximityModal}
        homeLocation={detectionState.nearestHomeLocation}
        distance={detectionState.currentDistance || 0}
        onEnterHome={handleEnterHome}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default LocationScreen;
