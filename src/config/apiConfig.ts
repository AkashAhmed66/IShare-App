import { Platform } from 'react-native';

// The base URL for the API
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost works
// For physical devices, use your computer's local IP address

// !!!! IMPORTANT !!!!
// BEFORE RUNNING THE APP ON YOUR PHYSICAL DEVICE:
// 1. Change the LOCAL_IP below to your computer's IP address on your local network
// 2. Ensure your phone and computer are on the same network
// 3. Make sure port 5000 is not blocked by your firewall

const isAndroid = Platform.OS === 'android';
const isPhysicalDevice = true; // Set to true when testing on a physical device

// !!! CHANGE THIS to your computer's actual IP address when testing on a physical device !!!
const LOCAL_IP = '192.168.0.104'; // Example: Replace with your actual IP (ipconfig/ifconfig)

// Use the Vercel API URL for all environments
export const API_URL = 'https://api-vercel-five-opal.vercel.app';

console.log(`[Config] Using API URL: ${API_URL}`);

// Socket.io connection URL (same as API URL)
export const SOCKET_URL = API_URL;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  CURRENT_USER: '/api/auth/me',
  VERIFY_EMAIL: '/api/auth/verify-email',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  
  // Users
  USER_PROFILE: '/api/users/profile',
  UPDATE_PROFILE: '/api/users/profile',
  SAVED_PLACES: '/api/users/saved-places',
  USER_PAYMENT_METHODS: '/api/users/payment-methods',
  
  // Rides
  CREATE_RIDE: '/api/rides',
  USER_RIDES: '/api/rides',
  RIDE_DETAILS: (id: string) => `/api/rides/${id}`,
  UPDATE_RIDE_STATUS: (id: string) => `/api/rides/${id}/status`,
  SCHEDULE_RIDE: '/api/rides/schedule',
  RECURRING_RIDES: '/api/rides/recurring',
  
  // Drivers
  NEARBY_DRIVERS: '/api/drivers/nearby',
  DRIVER_LOCATION: '/api/drivers/location',
  DRIVER_STATUS: '/api/drivers/status',
  DRIVER_STATS: '/api/drivers/stats',
  
  // Messages
  SEND_MESSAGE: '/api/messages',
  CONVERSATION: (userId: string) => `/api/messages/conversation/${userId}`,
  RIDE_MESSAGES: (rideId: string) => `/api/messages/ride/${rideId}`,
  MARK_AS_READ: (messageId: string) => `/api/messages/${messageId}/read`,
  UNREAD_COUNT: '/api/messages/unread',
  
  // Notifications
  GET_NOTIFICATIONS: '/api/notifications',
  MARK_NOTIFICATION_READ: (id: string) => `/api/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/api/notifications/read-all',
  DELETE_NOTIFICATION: (id: string) => `/api/notifications/${id}`,
  CLEAR_NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_UNREAD_COUNT: '/api/notifications/unread/count',
  REGISTER_DEVICE_TOKEN: '/api/notifications/device-token',
  
  // Payments
  PAYMENT_INTENT: '/api/payments/create-intent',
  PAYMENT_METHODS: '/api/payments/methods',
  PAYMENT_HISTORY: '/api/payments/history',
  
  // Ratings
  CREATE_RATING: '/api/ratings',
  USER_RATINGS: (userId: string) => `/api/ratings/user/${userId}`,
};

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 30000; 