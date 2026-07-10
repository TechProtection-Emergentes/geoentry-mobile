import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import tw from 'twrnc';
import { useDevices, useDeviceStats } from '../hooks/useDevices';
import { useEvents } from '../hooks/useEvents';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { deviceService } from '../services/deviceService';
import { Modal } from 'react-native';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <View style={tw`bg-gray-800 rounded-lg p-4 flex-1 mx-1`}>
    <View style={tw`flex-row items-center justify-between`}>
      <View style={tw`flex-1`}>
        <Text style={tw`text-gray-400 text-sm font-medium`}>{title}</Text>
        <Text style={tw`text-white text-2xl font-bold mt-1`}>{value}</Text>
      </View>
      <View style={[tw`p-2 rounded-full`, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
    </View>
  </View>
);

interface DeviceCardProps {
  device: any;
  eventCounts: {
    total: number;
    today: number;
  };
  userProfile: any;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, eventCounts, userProfile }) => (
  <View style={tw`bg-gray-800 rounded-lg p-5 mb-4`}>
    <View style={tw`flex-row items-start`}>
      <View style={tw`bg-blue-600 rounded-lg w-12 h-12 items-center justify-center mr-4`}>
        <MaterialIcons name="smartphone" size={24} color="white" />
      </View>
      
      <View style={tw`flex-1`}>
        <Text style={tw`text-white text-lg font-semibold mb-3`}>{device.name}</Text>
        
        <View style={tw`flex-row mb-3`}>
          <View style={tw`flex-1 mr-4`}>
            <Text style={tw`text-gray-400 text-sm`}>Tipo:</Text>
            <Text style={tw`text-white`}>{device.type}</Text>
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-gray-400 text-sm`}>Usuario:</Text>
            <Text style={tw`text-white`}>{userProfile?.full_name || 'N/A'}</Text>
          </View>
        </View>
        
        <Text style={tw`text-gray-400 text-sm mb-4`}>
          Email: {userProfile?.email || 'N/A'}
        </Text>
        
        <View style={tw`flex-row items-center justify-between`}>
          <View style={tw`items-center`}>
            <Text style={tw`text-blue-400 text-xl font-bold`}>{eventCounts.total}</Text>
            <Text style={tw`text-gray-400 text-xs`}>Total Eventos</Text>
          </View>
          <View style={tw`items-center`}>
            <Text style={tw`text-green-400 text-xl font-bold`}>{eventCounts.today}</Text>
            <Text style={tw`text-gray-400 text-xs`}>Hoy</Text>
          </View>
          <View style={tw`items-center`}>
            <View style={tw`bg-green-600 px-3 py-1 rounded`}>
              <Text style={tw`text-white text-sm`}>Activo</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  </View>
);

const DevicesScreen: React.FC = () => {
  const { devices, loading: devicesLoading, error: devicesError, refetch: refetchDevices } = useDevices();
  const { events, loading: eventsLoading, error: eventsError, refetch: refetchEvents } = useEvents();
  const { profile: userProfile, loading: profileLoading } = useCurrentUser();
  const stats = useDeviceStats(devices, events);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [provisionModalVisible, setProvisionModalVisible] = useState(false);
  const [provisionSSID, setProvisionSSID] = useState('');
  const [provisionPassword, setProvisionPassword] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionMessage, setProvisionMessage] = useState('');

  const loading = devicesLoading || eventsLoading || profileLoading;
  const error = devicesError || eventsError;

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (userProfile?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEventCounts = (deviceId: string) => {
    const deviceEvents = events.filter(event => event.device_id === deviceId);
    const today = new Date().toDateString();
    const todayEvents = deviceEvents.filter(event => {
      if (!event.created_at) return false;
      return new Date(event.created_at).toDateString() === today;
    });

    return {
      total: deviceEvents.length,
      today: todayEvents.length,
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchDevices(), refetchEvents()]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleProvisionDevice = async () => {
    if (!provisionSSID) {
      setProvisionMessage('Por favor ingresa el nombre de tu red WiFi');
      return;
    }

    setProvisioning(true);
    setProvisionMessage('Enviando datos al dispositivo (192.168.4.1)... Asegúrate de estar conectado a la red "GeoEntry-Setup"');

    try {
      const deviceId = await deviceService.getDeviceId();
      const payload = {
        ssid: provisionSSID,
        password: provisionPassword,
        userId: userProfile?.id,
        deviceId: deviceId,
      };

      const response = await fetch('http://192.168.4.1/api/provision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setProvisionMessage('¡Dispositivo configurado con éxito! Se reiniciará y conectará a tu WiFi.');
        setTimeout(() => {
          setProvisionModalVisible(false);
          setProvisionMessage('');
          setProvisionSSID('');
          setProvisionPassword('');
        }, 3000);
      } else {
        const errorText = await response.text();
        setProvisionMessage(`Error al configurar: ${errorText}`);
      }
    } catch (error) {
      setProvisionMessage('Error de conexión. ¿Estás seguro de que estás conectado a la red WiFi del ESP32 (GeoEntry-Setup)?');
      console.error('Error provisioning:', error);
    } finally {
      setProvisioning(false);
    }
  };

  const statsCards = [
    { 
      title: 'Total Dispositivos', 
      value: stats.totalDevices.toString(), 
      icon: 'smartphone' as keyof typeof MaterialIcons.glyphMap, 
      color: '#60a5fa' 
    },
    { 
      title: 'Dispositivos Activos', 
      value: stats.activeDevices.toString(), 
      icon: 'check-circle' as keyof typeof MaterialIcons.glyphMap, 
      color: '#4ade80' 
    },
    { 
      title: 'Fuera de Zona', 
      value: stats.devicesOutOfZone.toString(), 
      icon: 'location-off' as keyof typeof MaterialIcons.glyphMap, 
      color: '#f87171' 
    },
    { 
      title: 'Sin Actividad', 
      value: stats.inactiveDevices.toString(), 
      icon: 'pause-circle-outline' as keyof typeof MaterialIcons.glyphMap, 
      color: '#9ca3af' 
    },
  ];

  if (loading && !refreshing) {
    return (
      <View style={tw`flex-1 bg-gray-900 items-center justify-center`}>
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text style={tw`text-white mt-4`}>Cargando dispositivos...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={tw`flex-1 bg-gray-900 items-center justify-center px-6`}>
        <MaterialIcons name="error-outline" size={48} color="#f87171" />
        <Text style={tw`text-red-400 text-center mt-4`}>
          Error al cargar dispositivos: {error}
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
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={tw`p-4 pb-8`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#60a5fa"
            colors={['#60a5fa']}
          />
        }
      >
        {/* Header */}
        <View style={tw`mb-6 flex-row justify-between items-center`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-white text-2xl font-bold`}>Dispositivos</Text>
            <Text style={tw`text-gray-400 mt-1`}>
              Gestiona todos los dispositivos registrados
            </Text>
          </View>
          <Pressable
            style={tw`bg-blue-600 p-3 rounded-full`}
            onPress={() => setProvisionModalVisible(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </Pressable>
        </View>

        {/* Stats Cards */}
        <View style={tw`mb-6`}>
          <View style={tw`flex-row mb-3`}>
            <StatCard {...statsCards[0]} />
            <StatCard {...statsCards[1]} />
          </View>
        </View>

        {/* Device List */}
        {filteredDevices.length === 0 ? (
          <View style={tw`items-center py-8`}>
            <MaterialIcons name="smartphone" size={48} color="#9ca3af" />
            <Text style={tw`text-gray-400 text-center mt-4`}>
              {devices.length === 0 
                ? 'No tienes dispositivos registrados' 
                : 'No se encontraron dispositivos'}
            </Text>
          </View>
        ) : (
          filteredDevices.map((device) => (
            <DeviceCard
              key={device.id}
              device={device}
              eventCounts={getEventCounts(device.id)}
              userProfile={userProfile}
            />
          ))
        )}
      </ScrollView>

      {/* Provisioning Modal */}
      <Modal
        visible={provisionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setProvisionModalVisible(false)}
      >
        <View style={tw`flex-1 justify-end bg-black/50`}>
          <View style={tw`bg-gray-800 rounded-t-3xl p-6`}>
            <View style={tw`flex-row justify-between items-center mb-6`}>
              <Text style={tw`text-white text-xl font-bold`}>Configurar Nuevo ESP32</Text>
              <Pressable onPress={() => setProvisionModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#9ca3af" />
              </Pressable>
            </View>

            <Text style={tw`text-gray-300 mb-4`}>
              1. Enciende el ESP32. Si es nuevo, creará una red WiFi llamada <Text style={tw`font-bold text-white`}>GeoEntry-Setup</Text>.{'\n'}
              2. Conecta tu celular a esa red WiFi.{'\n'}
              3. Ingresa los datos de tu WiFi de casa y presiona Configurar.
            </Text>

            <View style={tw`mb-4`}>
              <Text style={tw`text-gray-400 mb-2`}>Nombre de tu WiFi (SSID)</Text>
              <TextInput
                style={tw`bg-gray-700 text-white rounded-lg p-3`}
                placeholder="MiWifiCasa"
                placeholderTextColor="#6b7280"
                value={provisionSSID}
                onChangeText={setProvisionSSID}
                autoCapitalize="none"
              />
            </View>

            <View style={tw`mb-6`}>
              <Text style={tw`text-gray-400 mb-2`}>Contraseña del WiFi</Text>
              <TextInput
                style={tw`bg-gray-700 text-white rounded-lg p-3`}
                placeholder="Secreta123"
                placeholderTextColor="#6b7280"
                value={provisionPassword}
                onChangeText={setProvisionPassword}
                secureTextEntry
              />
            </View>

            {provisionMessage ? (
              <Text style={tw`text-blue-400 mb-4 text-center font-medium`}>{provisionMessage}</Text>
            ) : null}

            <Pressable
              style={tw`bg-blue-600 rounded-lg p-4 flex-row justify-center items-center ${provisioning ? 'opacity-70' : ''}`}
              onPress={handleProvisionDevice}
              disabled={provisioning}
            >
              {provisioning ? (
                <ActivityIndicator size="small" color="white" style={tw`mr-2`} />
              ) : (
                <MaterialIcons name="wifi" size={20} color="white" style={tw`mr-2`} />
              )}
              <Text style={tw`text-white text-lg font-bold text-center`}>
                {provisioning ? 'Configurando...' : 'Configurar Dispositivo'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DevicesScreen;