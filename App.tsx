import './src/services/backgroundLocationTask';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, SafeAreaView, Platform, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from './src/theme';
import { HomeLocationProvider } from './src/contexts/HomeLocationContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CustomTabBar } from './src/components/CustomTabBar';
// Import screens
import HomeScreen from './src/screens/HomeScreen';
import DevicesScreen from './src/screens/DevicesScreen';
import StatsScreen from './src/screens/StatsScreen';
import GroupsScreen from './src/screens/GroupsScreen';
import LocationScreen from './src/screens/LocationScreen';
import MoreScreen from './src/screens/MoreScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AppContainer = styled.View`
    flex: 1;
    background-color: ${({ theme }: { theme: any }) => theme.COLORS.background};
`;

const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: ${theme.COLORS.background};
`;

// Safe Area Wrapper Component
const SafeScreenWrapper = ({ children }: { children: React.ReactNode }) => {
    const insets = useSafeAreaInsets();
    return (
        <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: theme.COLORS.background }}>
            {children}
        </View>
    );
};

// Wrapped Screen Components
const SafeHomeScreen = () => (
    <SafeScreenWrapper>
        <HomeScreen />
    </SafeScreenWrapper>
);

const SafeGroupsScreen = () => (
    <SafeScreenWrapper>
        <GroupsScreen />
    </SafeScreenWrapper>
);

const SafeDevicesScreen = () => (
    <SafeScreenWrapper>
        <DevicesScreen />
    </SafeScreenWrapper>
);

const SafeStatsScreen = () => (
    <SafeScreenWrapper>
        <StatsScreen />
    </SafeScreenWrapper>
);

const SafeLocationScreen = () => (
    <SafeScreenWrapper>
        <LocationScreen />
    </SafeScreenWrapper>
);

const SafeMoreScreen = () => (
    <SafeScreenWrapper>
        <MoreScreen />
    </SafeScreenWrapper>
);

function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

function MainTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                headerStyle: {
                    backgroundColor: theme.COLORS.background,
                    height: 56,
                },
                headerTintColor: theme.COLORS.textPrimary,
                headerTitleStyle: {
                    fontSize: theme.TYPOGRAPHY.subtitle,
                    fontWeight: '600',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={SafeHomeScreen}
                options={{
                    title: 'Dashboard',
                }}
            />
            <Tab.Screen
                name="Groups"
                component={SafeGroupsScreen}
                options={{
                    title: 'Ubicaciones',
                }}
            />
            <Tab.Screen
                name="Devices"
                component={SafeDevicesScreen}
                options={{
                    title: 'Devices',
                }}
            />
            <Tab.Screen
                name="Stats"
                component={SafeStatsScreen}
                options={{
                    title: 'Eventos',
                }}
            />
            <Tab.Screen
                name="Location"
                component={SafeLocationScreen}
                options={{
                    title: 'Analíticas',
                }}
            />
            <Tab.Screen
                name="More"
                component={SafeMoreScreen}
                options={{
                    title: 'Soporte',
                }}
            />
        </Tab.Navigator>
    );
}

function AppNavigator() {
    const { session, loading } = useAuth();

    if (loading) {
        return (
            <LoadingContainer>
                <ActivityIndicator size="large" color={theme.COLORS.accent} />
            </LoadingContainer>
        );
    }

    return (
        <NavigationContainer>
            <AppContainer>
                <StatusBar barStyle="light-content" backgroundColor={theme.COLORS.background} />
                {session ? <MainTabNavigator /> : <AuthStack />}
            </AppContainer>
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <AuthProvider>
                        <HomeLocationProvider>
                            <ThemeProvider theme={theme}>
                                <AppNavigator />
                            </ThemeProvider>
                        </HomeLocationProvider>
                    </AuthProvider>
                </SafeAreaView>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}