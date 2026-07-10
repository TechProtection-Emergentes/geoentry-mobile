import React, { useState } from 'react';
import { FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styled from 'styled-components/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../theme';
import { useEvents, useEventStats, ProximityEvent } from '../hooks/useEvents';
import { useDevices, getDeviceName } from '../hooks/useDevices';

const Container = styled.View`
  flex: 1;
  background-color: #111827;
  padding: ${SPACING.md}px;
`;

const Header = styled.View`
  margin-bottom: ${SPACING.lg}px;
`;

const Title = styled.Text`
  color: #ffffff;
  font-size: ${TYPOGRAPHY.title}px;
  font-weight: bold;
  margin-bottom: ${SPACING.xs}px;
`;

const Subtitle = styled.Text`
  color: #9ca3af;
  font-size: ${TYPOGRAPHY.body}px;
`;

// Stats Cards
const StatsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: ${SPACING.lg}px;
  gap: ${SPACING.md}px;
`;

const StatCard = styled.View`
  background-color: #1f2937;
  border-radius: 12px;
  padding: ${SPACING.md}px;
  flex: 1;
  min-width: 45%;
`;

const StatHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.sm}px;
`;

const StatValue = styled.Text`
  color: #ffffff;
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: bold;
`;

const StatLabel = styled.Text`
  color: #9ca3af;
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 500;
`;

const StatIcon = styled.View<{ color: string }>`
  background-color: #111827;
  border-radius: 20px;
  padding: ${SPACING.sm}px;
`;

// Events List
const EventsHeader = styled.View`
  background-color: #1f2937;
  border-radius: 12px;
  padding: ${SPACING.md}px;
  margin-bottom: ${SPACING.md}px;
`;

const EventsTitle = styled.Text`
  color: #ffffff;
  font-size: ${TYPOGRAPHY.subtitle}px;
  font-weight: bold;
`;

const EventItem = styled.View`
  background-color: #1f2937;
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  margin-bottom: ${SPACING.md}px;
  flex-direction: row;
  align-items: flex-start;
  min-height: 80px;
`;

const EventIconContainer = styled.View<{ eventType: 'enter' | 'exit' }>`
  background-color: ${({ eventType }: { eventType: 'enter' | 'exit' }) => eventType === 'enter' ? COLORS.statusGreen + '20' : COLORS.statusRed + '20'};
  border-radius: 24px;
  padding: ${SPACING.md}px;
  margin-right: ${SPACING.lg}px;
  margin-top: ${SPACING.xs}px;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
`;

const EventInfo = styled.View`
  flex: 1;
`;

const EventHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${SPACING.md}px;
  flex-wrap: wrap;
`;

const EventBadge = styled.View<{ eventType: 'enter' | 'exit' }>`
  background-color: ${({ eventType }: { eventType: 'enter' | 'exit' }) => eventType === 'enter' ? COLORS.statusGreen : COLORS.statusRed};
  border-radius: 16px;
  padding: ${SPACING.sm}px ${SPACING.md}px;
  margin-right: ${SPACING.md}px;
  margin-bottom: ${SPACING.xs}px;
`;

const EventBadgeText = styled.Text`
  color: #ffffff;
  font-size: ${TYPOGRAPHY.micro}px;
  font-weight: 600;
`;

const EventDevice = styled.Text`
  color: #ffffff;
  font-size: ${TYPOGRAPHY.body}px;
  font-weight: 600;
  flex: 1;
  margin-bottom: ${SPACING.xs}px;
`;

const EventDetails = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${SPACING.sm}px;
  flex-wrap: wrap;
`;

const EventLocation = styled.Text`
  color: #9ca3af;
  font-size: ${TYPOGRAPHY.small}px;
  margin-right: ${SPACING.lg}px;
  flex: 1;
  min-width: 120px;
  margin-bottom: ${SPACING.xs}px;
`;

const EventDistance = styled.Text`
  color: #9ca3af;
  font-size: ${TYPOGRAPHY.small}px;
  margin-bottom: ${SPACING.xs}px;
`;

const EventTime = styled.View`
  align-items: flex-end;
  justify-content: flex-start;
  min-width: 80px;
  margin-top: ${SPACING.xs}px;
`;

const EventDate = styled.Text`
  color: #ffffff;
  font-size: ${TYPOGRAPHY.small}px;
  font-weight: 600;
  margin-bottom: ${SPACING.xs}px;
`;

const EventTimeText = styled.Text`
  color: #9ca3af;
  font-size: ${TYPOGRAPHY.micro}px;
`;

const EmptyState = styled.View`
  background-color: #1f2937;
  border-radius: 12px;
  padding: ${SPACING.xl}px;
  align-items: center;
`;

const EmptyStateText = styled.Text`
  color: #9ca3af;
  font-size: ${TYPOGRAPHY.body}px;
  text-align: center;
  margin-top: ${SPACING.md}px;
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const ErrorContainer = styled.View`
  background-color: ${COLORS.statusRed}20;
  border-radius: 12px;
  padding: ${SPACING.lg}px;
  align-items: center;
`;

const ErrorText = styled.Text`
  color: ${COLORS.statusRed};
  font-size: ${TYPOGRAPHY.body}px;
  text-align: center;
`;

const EventsScreen = () => {
  const { events, loading, error, refetch } = useEvents();
  const { devices, refetch: refetchDevices } = useDevices();
  const stats = useEventStats(events);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const paginatedEvents = events.slice(0, page * ITEMS_PER_PAGE);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await Promise.all([refetch(), refetchDevices()]);
    setRefreshing(false);
  };

  const getEventTypeText = (type: string) => {
    return type === 'enter' ? 'ENTRADA' : 'SALIDA';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES'),
      time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const renderStatCard = (title: string, value: string, iconName: string, color: string) => (
    <StatCard key={title}>
      <StatHeader>
        <StatValue>{value}</StatValue>
        <StatIcon color={color}>
          <MaterialIcons name={iconName as any} size={24} color={color} />
        </StatIcon>
      </StatHeader>
      <StatLabel>{title}</StatLabel>
    </StatCard>
  );

  const renderEvent = ({ item }: { item: ProximityEvent }) => {
    const { date, time } = formatDate(item.created_at);
    const deviceName = getDeviceName(item.device_id, devices);
    const eventType = item.type as 'enter' | 'exit';

    return (
      <EventItem>
        <EventIconContainer eventType={eventType}>
          <MaterialIcons
            name={eventType === 'enter' ? 'arrow-upward' : 'arrow-downward'}
            size={24}
            color={eventType === 'enter' ? COLORS.statusGreen : COLORS.statusRed}
          />
        </EventIconContainer>
        
        <EventInfo>
          <EventHeader>
            <EventBadge eventType={eventType}>
              <EventBadgeText>{getEventTypeText(item.type)}</EventBadgeText>
            </EventBadge>
          </EventHeader>
          
          <EventDevice>{deviceName}</EventDevice>
          
          <EventDetails>
            <EventLocation>
              <MaterialIcons name="place" size={14} color="#9ca3af" />
              {' '}{item.home_location_name}
            </EventLocation>
            <EventDistance>📍 {Math.round(item.distance)}m</EventDistance>
          </EventDetails>
        </EventInfo>
        
        <EventTime>
          <EventDate>{date}</EventDate>
          <EventTimeText>{time}</EventTimeText>
        </EventTime>
      </EventItem>
    );
  };

  if (loading && events.length === 0) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" color="#60a5fa" />
        </LoadingContainer>
      </Container>
    );
  }

  if (error && events.length === 0) {
    return (
      <Container>
        <ErrorContainer>
          <MaterialIcons name="error-outline" size={48} color={COLORS.statusRed} />
          <ErrorText>Error al cargar eventos: {error}</ErrorText>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={paginatedEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onEndReached={() => {
          if (paginatedEvents.length < events.length) {
            setPage(prev => prev + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#60a5fa']}
            tintColor="#60a5fa"
          />
        }
        ListHeaderComponent={
          <>
            <Header>
              <Title>Eventos de Proximidad</Title>
              <Subtitle>Historial de entradas y salidas de dispositivos</Subtitle>
            </Header>

            <StatsContainer>
              {renderStatCard('Total Eventos', stats.totalEvents.toString(), 'event', '#60a5fa')}
              {renderStatCard('Eventos Hoy', stats.todayEvents.toString(), 'today', '#4ade80')}
              {renderStatCard('Entradas', stats.enterEvents.toString(), 'arrow-upward', '#4ade80')}
              {renderStatCard('Salidas', stats.exitEvents.toString(), 'arrow-downward', '#f87171')}
            </StatsContainer>

            <EventsHeader>
              <EventsTitle>Historial de Eventos ({events.length})</EventsTitle>
            </EventsHeader>
          </>
        }
        ListEmptyComponent={
          <EmptyState>
            <MaterialIcons name="event" size={48} color="#9ca3af" />
            <EmptyStateText>
              No hay eventos registrados. Los eventos aparecerán aquí cuando los dispositivos entren o salgan de las ubicaciones configuradas.
            </EmptyStateText>
          </EmptyState>
        }
        contentContainerStyle={{ paddingBottom: SPACING.xl * 2 }}
      />
    </Container>
  );
};

export default EventsScreen;
