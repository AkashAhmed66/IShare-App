import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { AppMode } from '../redux/slices/appModeSlice';
import SplashScreen from '../screens/SplashScreen';
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { loginSuccess } from '../redux/slices/authSlice';
import * as Storage from '../utils/asyncStorageUtils';

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
import AppModeScreen from '../screens/AppModeScreen';

// Rider Screens
import RiderSignupScreen from '../screens/RiderSignupScreen';
import RiderHomeScreen from '../screens/RiderHomeScreen';
import RiderRideScreen from '../screens/RiderRideScreen';

import { COLORS } from '../styles/theme';

// Stack navigators
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const RideStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const NotificationStack = createStackNavigator();
const RiderStack = createStackNavigator();
const MainStack = createStackNavigator();

// Tab navigator
const Tab = createBottomTabNavigator();
const RiderTab = createBottomTabNavigator();

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
      name="LocationSearchScreen" 
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
    <ProfileStack.Screen 
      name="RiderSignup" 
      component={RiderSignupScreen} 
      options={{ headerShown: false }}
    />
    <ProfileStack.Screen 
      name="AppMode" 
      component={AppModeScreen} 
      options={{ headerShown: false }}
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

// Rider Stack Navigator
const RiderStackNavigator = () => (
  <RiderStack.Navigator>
    <RiderStack.Screen 
      name="RiderHomeScreen" 
      component={RiderHomeScreen} 
      options={getCommonHeaderOptions('Driver Home')}
    />
    <RiderStack.Screen 
      name="RiderRide" 
      component={RiderRideScreen} 
      options={getCommonHeaderOptions('Active Ride')}
    />
    <RiderStack.Screen 
      name="RiderProfile" 
      component={ProfileScreen} 
      options={getCommonHeaderOptions('Driver Profile')}
    />
    <RiderStack.Screen 
      name="RiderEarnings" 
      component={ProfileScreen} // This should be replaced with actual RiderEarningsScreen when available
      options={getCommonHeaderOptions('My Earnings')}
    />
    <RiderStack.Screen 
      name="RiderRideSummary" 
      component={ProfileScreen} // This should be replaced with actual RiderRideSummaryScreen when available
      options={getCommonHeaderOptions('Ride Summary')}
    />
    <RiderStack.Screen 
      name="ProfileScreen" 
      component={ProfileScreen} 
      options={getCommonHeaderOptions('Profile')}
    />
    <RiderStack.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={getCommonHeaderOptions('Settings')}
    />
    <RiderStack.Screen 
      name="AppMode" 
      component={AppModeScreen} 
      options={{ headerShown: false }}
    />
  </RiderStack.Navigator>
);

// Tab Navigator for Passenger Mode
const PassengerTabNavigator = () => {
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

// Tab Navigator for Rider Mode
const RiderTabNavigator = () => {
  const unreadCount = useSelector((state: RootState) => state.notification.unreadCount);
  
  return (
    <RiderTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'RiderDashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'RiderEarnings') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'RiderProfile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'RiderNotifications') {
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
      <RiderTab.Screen 
        name="RiderDashboard" 
        component={RiderStackNavigator} 
        options={{ title: 'Dashboard' }} 
      />
      <RiderTab.Screen 
        name="RiderNotifications" 
        component={NotificationStackNavigator}
        options={{
          title: 'Notifications',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <RiderTab.Screen 
        name="RiderProfile" 
        component={ProfileStackNavigator} 
        options={{ title: 'Profile' }}
      />
    </RiderTab.Navigator>
  );
};

// Main Navigator with Mode Switching
const MainNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { currentMode } = useSelector((state: RootState) => state.appMode);
  
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {currentMode === AppMode.PASSENGER ? (
        <MainStack.Screen 
          name="PassengerMode" 
          component={PassengerTabNavigator}
          options={{ animationEnabled: false }}
        />
      ) : user?.isRider ? (
        <MainStack.Screen 
          name="RiderMode" 
          component={RiderTabNavigator}
          options={{ animationEnabled: false }}
        />
      ) : (
        <MainStack.Screen 
          name="PassengerMode" 
          component={PassengerTabNavigator}
          options={{ animationEnabled: false }}
        />
      )}
      
      <MainStack.Screen name="AppMode" component={AppModeScreen} />
    </MainStack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        // Get token from storage
        const token = await authService.getToken();
        
        if (token) {
          // Get current user 
          const user = await authService.getCurrentUser();
          
          if (user) {
            // Prepare user data for Redux
            const userData = {
              user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profilePic: user.profilePic || '',
                paymentMethods: [],
                savedPlaces: [],
                isRider: user.role === 'driver',
              },
              token: token
            };
            
            // Dispatch login success to update Redux state
            dispatch(loginSuccess(userData));
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        // Set loading to false regardless of outcome
        setIsLoading(false);
      }
    };
    
    // Short delay to simulate loading and avoid flash of login screen
    setTimeout(() => {
      checkAuthStatus();
    }, 1000);
  }, [dispatch]);
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator; 