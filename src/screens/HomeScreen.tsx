import React from 'react';
import { Dimensions, View, Text, Switch, Pressable, Alert, Vibration, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { Header } from '../components/Header';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSensors } from '../hooks/useSensors';

const Container = styled.View`
  flex: 1;
  background-color: ${COLORS.background};
`;

const Content = styled.ScrollView`
  flex: 1;
  padding: ${SPACING.lg}px;
`;

const WelcomeSection = styled.View`
  margin-bottom: ${SPACING.xl}px;
`;

const WelcomeTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.title}px;
  font-weight: bold;
  margin-bottom: ${SPACING.xs}px;
`;

const WelcomeSubtitle = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.body}px;
`;

const FeatureCard = styled.TouchableOpacity`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin: ${SPACING.xs}px;
  elevation: 2;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  aspect-ratio: 1;
  align-items: center;
  justify-content: center;
`;

const FeatureTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
  margin-top: ${SPACING.sm}px;
  text-align: center;
`;

const MapPreview = styled.TouchableOpacity`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  height: 180px;
  margin-vertical: ${SPACING.lg}px;
  align-items: center;
  justify-content: center;
`;

const MapText = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.body}px;
`;

const QuickStatsContainer = styled.View`
  margin-vertical: ${SPACING.lg}px;
`;

const AnalyticsSection = styled.View`
  margin-top: ${SPACING.xl}px;
`;

const AnalyticsCard = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.md}px;
`;

const AnalyticsHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${SPACING.md}px;
`;

const AnalyticsTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-left: ${SPACING.sm}px;
`;

const MetricsGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const MetricCard = styled.View`
  background-color: ${COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  width: 48%;
  margin-bottom: ${SPACING.sm}px;
  align-items: center;
`;

const MetricValue = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.title}px;
  font-weight: bold;
  margin-bottom: ${SPACING.xs}px;
`;

const MetricLabel = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  text-align: center;
`;

const DeviceAnalysisItem = styled.View`
  background-color: ${COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DeviceInfo = styled.View`
  flex: 1;
`;

const DeviceName = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-bottom: ${SPACING.xs}px;
`;

const DeviceStats = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
`;

const EventsBadge = styled.View`
  background-color: ${COLORS.accent};
  border-radius: 12px;
  padding: ${SPACING.xs}px ${SPACING.sm}px;
`;

const EventsCount = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
`;

const ChartContainer = styled.View`
  margin-vertical: ${SPACING.md}px;
  align-items: center;
`;

const ChartTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-bottom: ${SPACING.sm}px;
  text-align: center;
`;

const NoDataContainer = styled.View`
  background-color: ${COLORS.background};
  border-radius: 8px;
  padding: ${SPACING.lg}px;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

const NoDataText = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.body}px;
  text-align: center;
`;

const SensorTypeContainer = styled.View`
  background-color: ${COLORS.secondary};
  border-radius: 8px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.md}px;
`;

const SensorTypeHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${SPACING.md}px;
`;

const SensorTypeTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  margin-left: ${SPACING.sm}px;
  flex: 1;
`;

const SensorItem = styled.View`
  background-color: ${COLORS.background};
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

const SensorStatus = styled.Text`
  color: ${COLORS.textPrimary}99;
  font-size: ${TYPOGRAPHY.small}px;
  margin-top: ${SPACING.xs}px;
`;

interface HoldButtonProps {
  isActive: boolean;
  disabled?: boolean;
}

const HoldButton = styled(Pressable) <HoldButtonProps>`
  background-color: ${(props: HoldButtonProps) => props.disabled ? COLORS.textPrimary + '11' : props.isActive ? COLORS.accent + '22' : COLORS.textPrimary + '11'};
  border-radius: 20px;
  padding: ${SPACING.xs}px ${SPACING.md}px;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${(props: HoldButtonProps) => props.disabled ? 'transparent' : props.isActive ? COLORS.accent : 'transparent'};
  overflow: hidden;
`;

const AnimatedFill = styled(Animated.View) <{ isActive: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: ${(props: { isActive: any; }) => props.isActive ? COLORS.accent + '44' : COLORS.textPrimary + '33'};
  border-radius: 20px;
`;

const AnimatedHoldButtonComponent = ({ isActive, disabled, onToggle, children }: any) => {
  const fillAnim = React.useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.timing(fillAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleLongPress = () => {
    if (disabled) return;
    Vibration.vibrate(50);
    onToggle();
  };

  return (
    <HoldButton
      isActive={isActive}
      disabled={disabled}
      delayLongPress={800}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      onPress={() => {
        if (!disabled) {
          Alert.alert('Mantén presionado', 'Para evitar accidentes, mantén presionado el botón por 1 segundo para cambiar el estado.');
        }
      }}
    >
      <AnimatedFill
        isActive={isActive}
        style={{
          width: fillAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%']
          })
        }}
      />
      {children}
    </HoldButton>
  );
};

const HoldButtonText = styled.Text<HoldButtonProps>`
  color: ${(props: HoldButtonProps) => props.disabled ? COLORS.textPrimary + '44' : props.isActive ? COLORS.accent : COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
  z-index: 1;
`;

const SectionTitle = styled.Text`
  color: ${COLORS.textPrimary};
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: 600;
  margin-bottom: ${SPACING.md}px;
`;

// Configuración de tipos de sensores con sus iconos y etiquetas
const sensorTypeConfig = {
  led_tv: { icon: 'tv', label: 'TV LED' },
  smart_light: { icon: 'lightbulb', label: 'Luces Inteligentes' },
  air_conditioner: { icon: 'ac-unit', label: 'Aire Acondicionado' },
  coffee_maker: { icon: 'coffee-maker', label: 'Cafetera' },
  smart_lock: { icon: 'lock', label: 'Cerradura Inteligente' },
} as const;

type SensorType = keyof typeof sensorTypeConfig;

const HomeScreen = () => {
  const { metrics, chartData, deviceAnalysis, isLoading } = useAnalytics();
  const {
    sensors,
    updateSensorStatus,
    loading: sensorsLoading,
    loadSensors,
    isControlsEnabled,
    proximityStatus
  } = useSensors();

  // Recargar sensores cuando la pantalla entre en foco
  useFocusEffect(
    React.useCallback(() => {
      loadSensors();
    }, [loadSensors])
  );

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (SPACING.lg * 4); // Accounting for padding

  // Agrupar sensores por tipo
  const sensorsByType = sensors.reduce((acc, sensor) => {
    const type = sensor.sensor_type as SensorType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(sensor);
    return acc;
  }, {} as Record<SensorType, typeof sensors>);

  // Obtener solo los tipos que el usuario tiene
  const availableSensorTypes = Object.keys(sensorsByType) as SensorType[];

  const handleToggleSensor = async (sensorId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await updateSensorStatus(sensorId, newStatus);
  };

  // Configuración de los gráficos
  const chartConfig = {
    backgroundColor: COLORS.secondary,
    backgroundGradientFrom: COLORS.secondary,
    backgroundGradientTo: COLORS.secondary,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 111, 255, ${opacity})`, // COLORS.accent
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 8,
    },
    propsForVerticalLabels: {
      fontSize: 10,
    },
    propsForHorizontalLabels: {
      fontSize: 10,
    },
  };

  const renderSensorsByType = () => {
    if (sensorsLoading && availableSensorTypes.length === 0) {
      return (
        <View style={{ padding: SPACING.md, alignItems: 'center' }}>
          <Text style={{ color: COLORS.textPrimary + '99' }}>Cargando sensores...</Text>
        </View>
      );
    }

    if (availableSensorTypes.length === 0) {
      return (
        <View style={{
          backgroundColor: COLORS.secondary,
          borderRadius: 8,
          padding: SPACING.lg,
          alignItems: 'center',
          marginBottom: SPACING.md
        }}>
          <MaterialIcons name="sensors-off" size={48} color={COLORS.textPrimary + '66'} />
          <Text style={{
            color: COLORS.textPrimary + '99',
            textAlign: 'center',
            marginTop: SPACING.sm
          }}>
            No tienes sensores configurados.{'\n'}
            Ve a Configuración para agregar algunos.
          </Text>
        </View>
      );
    }

    return availableSensorTypes.map((sensorType) => {
      const typeConfig = sensorTypeConfig[sensorType];
      const typeSensors = sensorsByType[sensorType];

      return (
        <SensorTypeContainer key={sensorType}>
          <SensorTypeHeader>
            <MaterialIcons
              name={typeConfig.icon as any}
              size={24}
              color={COLORS.accent}
            />
            <SensorTypeTitle>{typeConfig.label}</SensorTypeTitle>
            {!isControlsEnabled && (
              <MaterialIcons
                name="lock"
                size={16}
                color={COLORS.textPrimary + '66'}
                style={{ marginLeft: 8 }}
              />
            )}
          </SensorTypeHeader>

          {typeSensors.map((sensor) => (
            <SensorItem key={sensor.id} style={{
              opacity: isControlsEnabled ? 1 : 0.6
            }}>
              <SensorInfo>
                <SensorName style={{
                  color: isControlsEnabled ? COLORS.textPrimary : COLORS.textPrimary + '66'
                }}>
                  {sensor.name}
                </SensorName>
                <SensorStatus style={{
                  color: isControlsEnabled
                    ? (sensor.isActive ? COLORS.accent : COLORS.textPrimary + '99')
                    : COLORS.textPrimary + '66'
                }}>
                  {!isControlsEnabled ? 'Bloqueado (fuera de casa)' :
                    sensor.isActive ? 'Encendido' : 'Apagado'}
                </SensorStatus>
              </SensorInfo>
              <AnimatedHoldButtonComponent
                isActive={sensor.isActive}
                disabled={!isControlsEnabled}
                onToggle={() => handleToggleSensor(sensor.id, sensor.isActive)}
              >
                <MaterialIcons
                  name={sensor.isActive ? "power" : "power-off"}
                  size={16}
                  color={!isControlsEnabled ? COLORS.textPrimary + '44' : sensor.isActive ? COLORS.accent : COLORS.textPrimary}
                  style={{ marginRight: 4, zIndex: 1 }}
                />
                <HoldButtonText isActive={sensor.isActive} disabled={!isControlsEnabled}>
                  {sensor.isActive ? 'ON' : 'OFF'}
                </HoldButtonText>
              </AnimatedHoldButtonComponent>
            </SensorItem>
          ))}
        </SensorTypeContainer>
      );
    });
  };

  const formatLastEvent = (dateString: string) => {
    if (dateString === 'N/A') return 'Sin eventos';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      if (diffHours > 0) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      return 'Hace menos de 1 hora';
    } catch {
      return 'Sin eventos';
    }
  };

  // Preparar datos para el gráfico de barras (Entradas vs Salidas por ubicación)
  const barChartData = {
    labels: chartData.timeChart.map(item => item.location),
    datasets: [
      {
        data: chartData.timeChart.map(item => item.entradas),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
      },
      {
        data: chartData.timeChart.map(item => item.salidas),
        color: (opacity = 1) => `rgba(248, 113, 113, ${opacity})`, // Red
      }
    ],
    legend: ['Entradas', 'Salidas']
  };

  // Preparar datos para el gráfico de pie (Distribución de eventos por dispositivo)
  const pieChartData = chartData.deviceChart.map((item, index) => ({
    name: item.device,
    population: item.eventos,
    color: [
      '#4F6FFF', // accent
      '#10b981', // green
      '#f87171', // red
      '#a78bfa', // purple
      '#fbbf24', // yellow
    ][index % 5],
    legendFontColor: COLORS.textPrimary,
    legendFontSize: 12,
  }));

  return (
    <Container>
      <Header />
      <Content showsVerticalScrollIndicator={false}>
        <WelcomeSection>
          <WelcomeTitle>Welcome to GeoEntry</WelcomeTitle>
          <WelcomeSubtitle>Manage your smart home devices</WelcomeSubtitle>
        </WelcomeSection>

        {/* Banner de Seguridad Centralizada */}
        <View style={{
          backgroundColor: `${COLORS.accent}15`,
          padding: SPACING.md,
          borderRadius: 8,
          marginBottom: SPACING.lg,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: `${COLORS.accent}30`
        }}>
          <MaterialIcons name="security" size={24} color={COLORS.accent} style={{ marginRight: SPACING.sm }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.textPrimary, fontWeight: 'bold', fontSize: TYPOGRAPHY.small }}>
              Seguridad Centralizada
            </Text>
            <Text style={{ color: COLORS.textPrimary + '99', fontSize: TYPOGRAPHY.small }}>
              Las alertas críticas y roles familiares se administran desde tu Panel Web.
            </Text>
          </View>
        </View>

        {/* Estado de Proximidad */}
        <AnalyticsCard style={{ marginBottom: SPACING.lg }}>
          <AnalyticsHeader>
            <MaterialIcons
              name={isControlsEnabled ? "home" : "home-filled"}
              size={24}
              color={isControlsEnabled ? COLORS.accent : COLORS.textPrimary + '66'}
            />
            <AnalyticsTitle>Estado Actual</AnalyticsTitle>
            {proximityStatus.loading && (
              <MaterialIcons
                name="sync"
                size={16}
                color={COLORS.textPrimary + '66'}
                style={{ marginLeft: 'auto' }}
              />
            )}
          </AnalyticsHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm }}>
            <Text style={{
              color: isControlsEnabled ? COLORS.accent : COLORS.textPrimary + '66',
              fontSize: TYPOGRAPHY.body,
              fontWeight: '600',
              marginRight: SPACING.sm
            }}>
              {isControlsEnabled ? '🏠 En Casa' : '🚪 Fuera de Casa'}
            </Text>
            {!isControlsEnabled && (
              <MaterialIcons name="lock" size={16} color={COLORS.textPrimary + '66'} />
            )}
          </View>
          <Text style={{
            color: COLORS.textPrimary + '99',
            fontSize: TYPOGRAPHY.small
          }}>
            {isControlsEnabled
              ? 'Los controles de sensores están disponibles'
              : 'Los controles están bloqueados hasta que regreses a casa'
            }
          </Text>
          {proximityStatus.lastEventTime && (
            <Text style={{
              color: COLORS.textPrimary + '66',
              fontSize: TYPOGRAPHY.small,
              marginTop: SPACING.xs
            }}>
              Último evento: {formatLastEvent(proximityStatus.lastEventTime)}
            </Text>
          )}
        </AnalyticsCard>

        <SectionTitle>Quick Controls</SectionTitle>
        {renderSensorsByType()}

        {/* Analíticas */}
        {!isLoading && (
          <AnalyticsSection>
            <SectionTitle>Analíticas de Eventos</SectionTitle>

            {/* Métricas Principales */}
            <AnalyticsCard>
              <AnalyticsHeader>
                <MaterialIcons name="analytics" size={24} color={COLORS.accent} />
                <AnalyticsTitle>Resumen de Actividad</AnalyticsTitle>
              </AnalyticsHeader>
              <MetricsGrid>
                <MetricCard>
                  <MetricValue style={{ color: COLORS.accent }}>
                    {metrics.todayEvents}
                  </MetricValue>
                  <MetricLabel>Eventos Hoy</MetricLabel>
                </MetricCard>
                <MetricCard>
                  <MetricValue style={{ color: '#10b981' }}>
                    {metrics.totalEnters}
                  </MetricValue>
                  <MetricLabel>Total Entradas</MetricLabel>
                </MetricCard>
                <MetricCard>
                  <MetricValue style={{ color: '#f87171' }}>
                    {metrics.totalExits}
                  </MetricValue>
                  <MetricLabel>Total Salidas</MetricLabel>
                </MetricCard>
                <MetricCard>
                  <MetricValue style={{ color: '#a78bfa' }}>
                    {metrics.activeDevices}
                  </MetricValue>
                  <MetricLabel>Dispositivos Activos</MetricLabel>
                </MetricCard>
              </MetricsGrid>
            </AnalyticsCard>

            {/* Análisis de Dispositivos */}
            <AnalyticsCard>
              <AnalyticsHeader>
                <MaterialIcons name="phone-android" size={24} color={COLORS.accent} />
                <AnalyticsTitle>Actividad por Dispositivo</AnalyticsTitle>
              </AnalyticsHeader>
              {deviceAnalysis.length > 0 ? (
                deviceAnalysis.slice(0, 5).map((device, index) => (
                  <DeviceAnalysisItem key={index}>
                    <DeviceInfo>
                      <DeviceName>{device.device_name}</DeviceName>
                      <DeviceStats>
                        {formatLastEvent(device.last_event)}
                      </DeviceStats>
                    </DeviceInfo>
                    <EventsBadge>
                      <EventsCount>{device.total_events}</EventsCount>
                    </EventsBadge>
                  </DeviceAnalysisItem>
                ))
              ) : (
                <View style={{ padding: SPACING.md, alignItems: 'center' }}>
                  <Text style={{ color: COLORS.textPrimary + '99', textAlign: 'center' }}>
                    No hay datos de dispositivos disponibles
                  </Text>
                </View>
              )}
            </AnalyticsCard>

            {/* Ratio Entradas/Salidas */}
            <AnalyticsCard>
              <AnalyticsHeader>
                <MaterialIcons name="compare-arrows" size={24} color={COLORS.accent} />
                <AnalyticsTitle>Balance de Entradas y Salidas</AnalyticsTitle>
              </AnalyticsHeader>
              <MetricsGrid>
                <MetricCard style={{ width: '100%' }}>
                  <MetricValue style={{ color: COLORS.accent }}>
                    {metrics.enterExitRatio.toFixed(2)}
                  </MetricValue>
                  <MetricLabel>
                    Ratio Entradas/Salidas{'\n'}
                    {metrics.totalEnters > metrics.totalExits ? 'Más entradas' :
                      metrics.totalEnters < metrics.totalExits ? 'Más salidas' : 'Equilibrado'}
                  </MetricLabel>
                </MetricCard>
              </MetricsGrid>
            </AnalyticsCard>

            {/* Mensaje cuando no hay datos */}
            {chartData.timeChart.length === 0 && chartData.deviceChart.length === 0 && (
              <AnalyticsCard>
                <NoDataContainer>
                  <MaterialIcons name="analytics" size={48} color={COLORS.textPrimary + '66'} />
                  <NoDataText>
                    No hay suficientes datos para mostrar gráficos.{'\n'}
                    Los gráficos aparecerán cuando tengas eventos registrados.
                  </NoDataText>
                </NoDataContainer>
              </AnalyticsCard>
            )}
          </AnalyticsSection>
        )}
      </Content>
    </Container>
  );
};

export default HomeScreen;