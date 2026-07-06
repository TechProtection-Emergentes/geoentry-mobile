import React, { useState, useEffect } from 'react';
import { ScrollView, Switch, TouchableOpacity, TextInput, Alert, Modal, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { useHomeLocation } from '../contexts/HomeLocationContext';
import { useAuth } from '../contexts/AuthContext';
import { useSensors } from '../hooks/useSensors';
import HomeSetupScreen from './HomeSetupScreen';

const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: ${SPACING.lg}px;
  padding-bottom: ${SPACING.xl}px;
`;

const SectionTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.md}px;
  margin-top: ${SPACING.xl}px;
`;

const SettingItem = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 56px;
`;

const SettingText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
`;

const ProfileCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.lg}px;
  align-items: center;
`;

const ProfileAvatar = styled.View`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${COLORS.accent};
  align-items: center;
  justify-content: center;
  margin-bottom: ${SPACING.md}px;
`;

const AvatarText = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.title}px;
  font-weight: bold;
`;

const ProfileName = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.xs}px;
`;

const ProfileDetail = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  text-align: center;
  margin-bottom: ${SPACING.xs}px;
`;

const ActionButton = styled.TouchableOpacity<{ destructive?: boolean; accent?: boolean }>`
  background-color: ${(props: { destructive: any; accent: any; }) =>
    props.destructive ? COLORS.destructive :
      props.accent ? '#FFD700' :
        COLORS.secondary
  };
  border-radius: 8px;
  padding: ${SPACING.md}px ${SPACING.lg}px;
  margin-vertical: ${SPACING.sm}px;
  align-items: center;
`;

const ButtonText = styled.Text<{ dark?: boolean }>`
  color: ${(props: { dark: any; }) => props.dark ? COLORS.background : COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
`;

const AccordionItem = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  margin-bottom: ${SPACING.sm}px;
  overflow: hidden;
`;

const AccordionHeader = styled.TouchableOpacity`
  padding: ${SPACING.md}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const AccordionTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
`;

const AccordionContent = styled.View`
  padding: 0 ${SPACING.md}px ${SPACING.md}px ${SPACING.md}px;
`;

const AccordionText = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  line-height: 20px;
`;

const FormContainer = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.lg}px;
`;

const FormLabel = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  margin-bottom: ${SPACING.xs}px;
  margin-top: ${SPACING.sm}px;
`;

const FormInput = styled.TextInput`
  background-color: ${COLORS.secondary};
  border-radius: 4px;
  padding: ${SPACING.md}px;
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  min-height: 40px;
`;

const FormTextArea = styled.TextInput`
  background-color: ${COLORS.secondary};
  border-radius: 4px;
  padding: ${SPACING.md}px;
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  height: 80px;
  text-align-vertical: top;
`;

const SensorCard = styled.View`
  background-color: ${COLORS.secondary}33;
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SensorInfo = styled.View`
  flex: 1;
`;

const SensorName = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
`;

const SensorType = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  margin-top: 2px;
`;

const SensorStatus = styled.Text<{ isOn: boolean }>`
  color: ${(props: { isOn: boolean }) => props.isOn ? COLORS.accent : COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  margin-top: 2px;
`;

const SensorActions = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${SPACING.sm}px;
`;

const IconButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${COLORS.secondary};
  align-items: center;
  justify-content: center;
`;

const SensorTypeButton = styled.TouchableOpacity<{ selected: boolean }>`
  background-color: ${(props: { selected: boolean }) => props.selected ? COLORS.accent : COLORS.secondary};
  padding: ${SPACING.sm}px ${SPACING.md}px;
  border-radius: 20px;
  margin-right: ${SPACING.sm}px;
  margin-bottom: ${SPACING.sm}px;
`;

const SensorTypeText = styled.Text<{ selected: boolean }>`
  color: ${(props: { selected: boolean }) => props.selected ? COLORS.background : COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
`;

const notifications = [
  { id: '1', icon: 'security', text: 'Security system armed', time: '2 hours ago' },
  { id: '2', icon: 'lightbulb', text: 'Living room lights scheduled', time: '4 hours ago' },
  { id: '3', icon: 'person-add', text: 'New member added to group', time: '1 day ago' },
];

const faqItems = [
  {
    id: '1',
    question: 'How do I add a new device?',
    answer: 'Go to the Devices tab, tap the + button, and follow the setup wizard to connect your device to the network.'
  },
  {
    id: '2',
    question: 'Why is my device showing as offline?',
    answer: 'Check your WiFi connection and ensure the device is powered on. Try restarting the device or check for firmware updates.'
  },
  {
    id: '3',
    question: 'How do I share access with family members?',
    answer: 'In the Groups tab, tap "Add Member" and send an invitation link. They\'ll need to download the app and accept the invitation.'
  },
];

const MoreScreen = () => {
  const navigation = useNavigation();
  const { state } = useHomeLocation();
  const { homeLocations } = state;
  const { signOut, user } = useAuth();
  const { 
    sensors, 
    loading: sensorsLoading, 
    createSensor, 
    updateSensorStatus, 
    deleteSensor,
    availableTypes,
    loadAvailableTypes,
    isControlsEnabled,
    proximityStatus
  } = useSensors();

  const [darkMode, setDarkMode] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [brightness, setBrightness] = useState(86);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showHomeSetup, setShowHomeSetup] = useState(false);
  const [showSensorModal, setShowSensorModal] = useState(false);
  const [newSensor, setNewSensor] = useState({
    name: '',
    sensor_type: 'led_tv' as 'led_tv' | 'smart_light' | 'air_conditioner' | 'coffee_maker',
    isActive: true
  });

  // Actualizar el tipo de sensor seleccionado cuando cambien los tipos disponibles
  useEffect(() => {
    if (availableTypes.length > 0) {
      setNewSensor(prev => ({
        ...prev,
        sensor_type: availableTypes[0] as 'led_tv' | 'smart_light' | 'air_conditioner' | 'coffee_maker'
      }));
    }
  }, [availableTypes]);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    issueType: 'Technical',
    description: ''
  });

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
  };

  const handleSubmitContact = () => {
    Alert.alert('Success', 'Your message has been sent. We\'ll get back to you soon!');
    setContactForm({ name: '', email: '', issueType: 'Technical', description: '' });
  };

  const handleCreateSensor = async () => {
    if (!isControlsEnabled) {
      Alert.alert(
        '🏠 Control Bloqueado', 
        'Solo puedes crear dispositivos cuando estés en casa.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    if (availableTypes.length === 0) {
      Alert.alert(
        'Límite Alcanzado', 
        'Ya tienes todos los tipos de sensores disponibles. Solo se permite uno de cada tipo.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    if (!newSensor.name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para el sensor');
      return;
    }

    const success = await createSensor({
      name: newSensor.name.trim(),
      sensor_type: newSensor.sensor_type,
      isActive: newSensor.isActive
    });

    if (success) {
      Alert.alert('Éxito', 'Sensor creado exitosamente');
      setNewSensor({
        name: '',
        sensor_type: 'led_tv',
        isActive: true
      });
      setShowSensorModal(false);
    }
  };

  const handleDeleteSensor = (sensorId: string, sensorName: string) => {
    if (!isControlsEnabled) {
      Alert.alert(
        '🏠 Control Bloqueado', 
        'Solo puedes eliminar dispositivos cuando estés en casa.',
        [{ text: 'Entendido', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      'Eliminar Sensor',
      `¿Estás seguro de que quieres eliminar "${sensorName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteSensor(sensorId)
        }
      ]
    );
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'led_tv': return 'tv';
      case 'smart_light': return 'lightbulb';
      case 'air_conditioner': return 'ac-unit';
      case 'coffee_maker': return 'coffee-maker';
      default: return 'device-unknown';
    }
  };

  const getSensorTypeLabel = (type: string) => {
    switch (type) {
      case 'led_tv': return 'TV LED';
      case 'smart_light': return 'Luz Inteligente';
      case 'air_conditioner': return 'Aire Acondicionado';
      case 'coffee_maker': return 'Cafetera';
      default: return type;
    }
  };

  return (
    <Container>
      <Content showsVerticalScrollIndicator={false}>
        <SectionTitle>Suscripción</SectionTitle>
        <SettingItem style={{ 
          backgroundColor: COLORS.accent + '11',
          marginBottom: SPACING.lg,
          borderColor: COLORS.accent + '33',
          borderWidth: 1
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MaterialIcons 
              name="workspace-premium" 
              size={28} 
              color={COLORS.accent} 
              style={{ marginRight: SPACING.md }}
            />
            <View>
              <SettingText style={{ fontWeight: 'bold', fontSize: TYPOGRAPHY.body }}>Plan IA Premium</SettingText>
              <SettingText style={{ fontSize: TYPOGRAPHY.small, color: COLORS.accent, marginTop: 2 }}>
                Activo • Gestionar en Panel Web
              </SettingText>
            </View>
          </View>
        </SettingItem>

        <SectionTitle>Settings</SectionTitle>

        <TouchableOpacity 
          onPress={() => setShowHomeSetup(true)}
          style={{ 
            backgroundColor: `${COLORS.secondary}33`,
            borderRadius: 8,
            padding: SPACING.md,
            marginBottom: SPACING.sm,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 56,
          }}
        >
          <SettingText>Configurar Ubicaciones</SettingText>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <SettingText style={{
              marginRight: SPACING.xs,
              color: COLORS.accent,
              fontSize: TYPOGRAPHY.small
            }}>
              {homeLocations.length} ubicaci{homeLocations.length !== 1 ? 'ones' : 'ón'}
            </SettingText>
            <MaterialIcons name="chevron-right" size={20} color={COLORS.accent} />
          </View>
        </TouchableOpacity>

        <SectionTitle>Dispositivos Inteligentes</SectionTitle>
        
        {/* Estado de Proximidad */}
        <SettingItem style={{ 
          backgroundColor: isControlsEnabled ? COLORS.accent + '22' : COLORS.textPrimary + '11',
          marginBottom: SPACING.md
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MaterialIcons 
              name={isControlsEnabled ? "home" : "home-filled"} 
              size={24} 
              color={isControlsEnabled ? COLORS.accent : COLORS.textPrimary + '66'} 
              style={{ marginRight: SPACING.sm }}
            />
            <View style={{ flex: 1 }}>
              <SettingText style={{ 
                fontWeight: '600',
                color: isControlsEnabled ? COLORS.accent : COLORS.textPrimary + '66'
              }}>
                {isControlsEnabled ? 'En Casa' : 'Fuera de Casa'}
              </SettingText>
              <Text style={{ 
                color: COLORS.textPrimary + '99',
                fontSize: TYPOGRAPHY.small,
                marginTop: 2
              }}>
                {isControlsEnabled 
                  ? 'Controles disponibles'
                  : 'Controles bloqueados'
                }
              </Text>
            </View>
            {!isControlsEnabled && (
              <MaterialIcons name="lock" size={20} color={COLORS.textPrimary + '66'} />
            )}
            {proximityStatus.loading && (
              <MaterialIcons 
                name="sync" 
                size={20} 
                color={COLORS.textPrimary + '66'} 
                style={{ marginLeft: SPACING.xs }}
              />
            )}
          </View>
        </SettingItem>
        
        <TouchableOpacity 
          onPress={() => setShowSensorModal(true)}
          disabled={!isControlsEnabled || availableTypes.length === 0}
          style={{ 
            backgroundColor: (isControlsEnabled && availableTypes.length > 0) ? COLORS.accent : COLORS.textPrimary + '33',
            borderRadius: 8,
            padding: SPACING.md,
            marginBottom: SPACING.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (isControlsEnabled && availableTypes.length > 0) ? 1 : 0.6
          }}
        >
          <MaterialIcons 
            name="add" 
            size={20} 
            color={(isControlsEnabled && availableTypes.length > 0) ? COLORS.background : COLORS.textPrimary + '66'} 
            style={{ marginRight: SPACING.xs }} 
          />
          <Text style={{
            color: (isControlsEnabled && availableTypes.length > 0) ? COLORS.background : COLORS.textPrimary + '66',
            fontSize: TYPOGRAPHY.body,
            fontWeight: '600'
          }}>
            {availableTypes.length === 0 ? 'Todos los tipos agregados' : 'Agregar Dispositivo'}
          </Text>
        </TouchableOpacity>

        {sensorsLoading ? (
          <SettingItem>
            <SettingText>Cargando dispositivos...</SettingText>
          </SettingItem>
        ) : sensors.length === 0 ? (
          <SettingItem>
            <SettingText style={{ color: COLORS.textPrimary + '99' }}>
              No tienes dispositivos configurados
            </SettingText>
          </SettingItem>
        ) : (
          sensors.map((sensor) => (
            <SensorCard key={sensor.id} style={{ 
              opacity: isControlsEnabled ? 1 : 0.6,
              backgroundColor: isControlsEnabled ? COLORS.secondary : COLORS.secondary + '66'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <MaterialIcons 
                  name={getSensorIcon(sensor.sensor_type)} 
                  size={24} 
                  color={
                    !isControlsEnabled ? COLORS.textPrimary + '66' :
                    sensor.isActive ? COLORS.accent : COLORS.textPrimary + '99'
                  } 
                  style={{ marginRight: SPACING.sm }}
                />
                <SensorInfo>
                  <SensorName style={{ 
                    color: isControlsEnabled ? COLORS.textPrimary : COLORS.textPrimary + '66'
                  }}>
                    {sensor.name}
                  </SensorName>
                  <SensorType style={{ 
                    color: isControlsEnabled ? COLORS.textPrimary + '99' : COLORS.textPrimary + '66'
                  }}>
                    {getSensorTypeLabel(sensor.sensor_type)}
                  </SensorType>
                  <SensorStatus 
                    isOn={sensor.isActive}
                    style={{ 
                      color: !isControlsEnabled ? COLORS.textPrimary + '66' : 
                             sensor.isActive ? COLORS.accent : COLORS.textPrimary + '99'
                    }}
                  >
                    {!isControlsEnabled ? 'Bloqueado' :
                     sensor.isActive ? 'Activo' : 'Inactivo'}
                  </SensorStatus>
                </SensorInfo>
                {!isControlsEnabled && (
                  <MaterialIcons 
                    name="lock" 
                    size={16} 
                    color={COLORS.textPrimary + '66'} 
                    style={{ marginRight: SPACING.sm }}
                  />
                )}
              </View>
              <SensorActions>
                <IconButton 
                  onPress={() => handleDeleteSensor(sensor.id, sensor.name)}
                  disabled={!isControlsEnabled}
                  style={{ opacity: isControlsEnabled ? 1 : 0.5 }}
                >
                  <MaterialIcons 
                    name="delete" 
                    size={20} 
                    color={isControlsEnabled ? COLORS.destructive : COLORS.textPrimary + '66'} 
                  />
                </IconButton>
              </SensorActions>
            </SensorCard>
          ))
        )}

        <SectionTitle>Support</SectionTitle>
        {faqItems.map((item) => (
          <AccordionItem key={item.id}>
            <AccordionHeader
              onPress={() => setExpandedFAQ(expandedFAQ === item.id ? null : item.id)}
            >
              <AccordionTitle>{item.question}</AccordionTitle>
              <MaterialIcons
                name={expandedFAQ === item.id ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={20}
                color={COLORS.textPrimary}
              />
            </AccordionHeader>
            {expandedFAQ === item.id && (
              <AccordionContent>
                <AccordionText>{item.answer}</AccordionText>
              </AccordionContent>
            )}
          </AccordionItem>
        ))}

        <FormContainer>
          <AccordionTitle style={{ marginBottom: SPACING.md }}>Contact Support</AccordionTitle>

          <FormLabel>Name</FormLabel>
          <FormInput
            value={contactForm.name}
            onChangeText={(text: any) => setContactForm(prev => ({ ...prev, name: text }))}
            placeholder="Your name"
            placeholderTextColor={`${COLORS.textPrimary}66`}
          />

          <FormLabel>Email</FormLabel>
          <FormInput
            value={contactForm.email}
            onChangeText={(text: any) => setContactForm(prev => ({ ...prev, email: text }))}
            placeholder="your.email@example.com"
            placeholderTextColor={`${COLORS.textPrimary}66`}
            keyboardType="email-address"
          />

          <FormLabel>Issue Type</FormLabel>
          <TouchableOpacity>
            <FormInput
              value={contactForm.issueType}
              editable={false}
              style={{ backgroundColor: COLORS.secondary }}
            />
          </TouchableOpacity>

          <FormLabel>Description</FormLabel>
          <FormTextArea
            value={contactForm.description}
            onChangeText={(text: any) => setContactForm(prev => ({ ...prev, description: text }))}
            placeholder="Describe your issue..."
            placeholderTextColor={`${COLORS.textPrimary}66`}
            multiline
          />

          <ActionButton onPress={handleSubmitContact} style={{ marginTop: SPACING.md }}>
            <ButtonText>Submit</ButtonText>
          </ActionButton>
        </FormContainer>
        <SectionTitle>Profile</SectionTitle>
        <ProfileCard>
          <ProfileAvatar>
            <AvatarText>{user?.full_name?.charAt(0).toUpperCase() || 'U'}</AvatarText>
          </ProfileAvatar>
          <ProfileName>{user?.full_name || 'Usuario'}</ProfileName>
          <ProfileDetail>{user?.email || ''}</ProfileDetail>
        </ProfileCard>

        <ActionButton onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color={COLORS.textPrimary} style={{ marginRight: SPACING.sm }} />
          <ButtonText>Cerrar Sesión</ButtonText>
        </ActionButton>

        {/* Espacio adicional al final */}
        <View style={{ height: SPACING.xl }} />
      </Content>

      {/* Home Setup Modal */}
      <Modal
        visible={showHomeSetup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHomeSetup(false)}
      >
        <Container style={{ paddingTop: 40 }}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 50,
              right: 20,
              zIndex: 1000,
              backgroundColor: COLORS.secondary,
              borderRadius: 20,
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setShowHomeSetup(false)}
          >
            <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <HomeSetupScreen />
        </Container>
      </Modal>

      {/* Create Sensor Modal */}
      <Modal
        visible={showSensorModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowSensorModal(false)}
      >
        <Container style={{ paddingTop: 40 }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg,
            paddingBottom: SPACING.md,
          }}>
            <Text style={{
              color: COLORS.textPrimary,
              fontSize: TYPOGRAPHY.title,
              fontWeight: '600'
            }}>
              Nuevo Dispositivo
            </Text>
            <TouchableOpacity onPress={() => setShowSensorModal(false)}>
              <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: SPACING.lg }}>
            <FormContainer>
              <FormLabel>Nombre del Dispositivo</FormLabel>
              <FormInput
                value={newSensor.name}
                onChangeText={(text: string) => setNewSensor(prev => ({ ...prev, name: text }))}
                placeholder="Ej: TV Sala Principal"
                placeholderTextColor={`${COLORS.textPrimary}66`}
              />

              <FormLabel>Tipo de Dispositivo</FormLabel>
              {availableTypes.length === 0 ? (
                <View style={{
                  padding: SPACING.md,
                  backgroundColor: COLORS.secondary + '66',
                  borderRadius: 8,
                  marginBottom: SPACING.md,
                }}>
                  <Text style={{
                    color: COLORS.textPrimary + '99',
                    fontSize: TYPOGRAPHY.small,
                    textAlign: 'center',
                  }}>
                    Ya tienes todos los tipos de sensores disponibles.{'\n'}
                    Solo se permite uno de cada tipo.
                  </Text>
                </View>
              ) : (
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginTop: SPACING.xs,
                  marginBottom: SPACING.md,
                }}>
                  {availableTypes.map((type) => {
                    const typeLabels = {
                      'led_tv': 'TV LED',
                      'smart_light': 'Luz Inteligente', 
                      'air_conditioner': 'Aire Acondicionado',
                      'coffee_maker': 'Cafetera',
                    };
                    
                    return (
                      <SensorTypeButton
                        key={type}
                        selected={newSensor.sensor_type === type}
                        onPress={() => setNewSensor(prev => ({ 
                          ...prev, 
                          sensor_type: type as any 
                        }))}
                      >
                        <SensorTypeText selected={newSensor.sensor_type === type}>
                          {typeLabels[type as keyof typeof typeLabels]}
                        </SensorTypeText>
                      </SensorTypeButton>
                    );
                  })}
                </View>
              )}

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: SPACING.md,
                marginBottom: SPACING.lg,
              }}>
                <Text style={{
                  color: COLORS.textPrimary,
                  fontSize: TYPOGRAPHY.body,
                }}>
                  Dispositivo Activo
                </Text>
                <Switch
                  value={newSensor.isActive}
                  onValueChange={(value) => setNewSensor(prev => ({ ...prev, isActive: value }))}
                  trackColor={{ false: COLORS.secondary, true: COLORS.accent }}
                  thumbColor={COLORS.textPrimary}
                />
              </View>

              <ActionButton onPress={handleCreateSensor} disabled={sensorsLoading}>
                <MaterialIcons 
                  name="add" 
                  size={20} 
                  color={COLORS.textPrimary} 
                  style={{ marginRight: SPACING.xs }} 
                />
                <ButtonText>
                  {sensorsLoading ? 'Creando...' : 'Crear Dispositivo'}
                </ButtonText>
              </ActionButton>
            </FormContainer>
          </ScrollView>
        </Container>
      </Modal>
    </Container>
  );
};

export default MoreScreen;