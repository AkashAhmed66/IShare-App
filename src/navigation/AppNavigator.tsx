import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MapScreen from '../screens/MapScreen';
import RideOptionsScreen from '../screens/RideOptionsScreen';
import ScheduleRideScreen from '../screens/ScheduleRideScreen';
import RideHistoryScreen from '../screens/RideHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import LocationSearchScreen from '../screens/LocationSearchScreen';
import RideConfirmationScreen from '../screens/RideConfirmationScreen';
import RideStatusScreen from '../screens/RideStatusScreen';
import PaymentScreen from '../screens/PaymentScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HighDemandScreen from '../screens/HighDemandScreen';

import { COLORS } from '../styles/theme';

// Stack navigators
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const RideStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const NotificationStack = createStackNavigator();

// Tab navigator
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Common header options for reuse
const getCommonHeaderOptions = (title: string) => ({
  headerTitle: title,
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: COLORS.white,
  headerTitleAlign: 'center' as const,
});

// Home Stack Navigator
const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="HomeScreen" 
      component={HomeScreen} 
      options={getCommonHeaderOptions('IShare')}
    />
    <HomeStack.Screen 
      name="LocationSearch" 
      component={LocationSearchScreen} 
      options={getCommonHeaderOptions('Search Location')}
    />
    <HomeStack.Screen 
      name="HighDemand" 
      component={HighDemandScreen} 
      options={getCommonHeaderOptions('High Demand Areas')}
    />
  </HomeStack.Navigator>
);

// Ride Stack Navigator
const RideStackNavigator = () => (
  <RideStack.Navigator>
    <RideStack.Screen 
      name="MapScreen" 
      component={MapScreen} 
      options={getCommonHeaderOptions('Book a Ride')}
    />
    <RideStack.Screen 
      name="RideOptions" 
      component={RideOptionsScreen} 
      options={getCommonHeaderOptions('Select Ride')}
    />
    <RideStack.Screen 
      name="ScheduleRide" 
      component={ScheduleRideScreen} 
      options={getCommonHeaderOptions('Schedule Ride')}
    />
    <RideStack.Screen 
      name="RideConfirmation" 
      component={RideConfirmationScreen} 
      options={getCommonHeaderOptions('Confirm Ride')}
    />
    <RideStack.Screen 
      name="RideStatus" 
      component={RideStatusScreen} 
      options={getCommonHeaderOptions('Ride Status')}
    />
    <RideStack.Screen 
      name="Payment" 
      component={PaymentScreen} 
      options={getCommonHeaderOptions('Payment')}
    />
  </RideStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="ProfileScreen" 
      component={ProfileScreen} 
      options={getCommonHeaderOptions('Profile')}
    />
    <ProfileStack.Screen 
      name="RideHistory" 
      component={RideHistoryScreen} 
      options={getCommonHeaderOptions('Ride History')}
    />
    <ProfileStack.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={getCommonHeaderOptions('Settings')}
    />
    <ProfileStack.Screen 
      name="Payment" 
      component={PaymentScreen} 
      options={getCommonHeaderOptions('Payment Methods')}
    />
  </ProfileStack.Navigator>
);

// Notification Stack Navigator
const NotificationStackNavigator = () => (
  <NotificationStack.Navigator>
    <NotificationStack.Screen 
      name="NotificationsScreen" 
      component={NotificationsScreen} 
      options={getCommonHeaderOptions('Notifications')}
    />
  </NotificationStack.Navigator>
);

// Tab Navigator
const TabNavigator = () => {
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Ride') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Ride" component={RideStackNavigator} />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationStackNavigator}
        options={{
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <TabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator; 