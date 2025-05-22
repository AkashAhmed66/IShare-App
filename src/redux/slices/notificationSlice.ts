import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notifications as dummyNotifications } from '../../utils/dummyData';

// Notification interface
export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'ride' | 'payment' | 'promo' | 'system' | 'driver_update'; 
  relatedId?: string;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isSocketConnected: boolean;
  lastUpdated: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: dummyNotifications.map(n => ({
    ...n,
    type: (n.title.toLowerCase().includes('ride') ? 'ride' : 
           n.title.toLowerCase().includes('payment') ? 'payment' : 
           n.title.toLowerCase().includes('promo') ? 'promo' : 'system') as any
  })),
  unreadCount: dummyNotifications.filter((notif) => !notif.read).length,
  isSocketConnected: false,
  lastUpdated: null,
  isLoading: false,
  error: null
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // Socket connection status
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
    },
    
    // Set all notifications
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(notif => !notif.read).length;
      state.lastUpdated = new Date().toISOString();
      state.isLoading = false;
      state.error = null;
    },
    
    // Loading state actions
    fetchNotificationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    fetchNotificationsSuccess: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(notif => !notif.read).length;
      state.lastUpdated = new Date().toISOString();
      state.isLoading = false;
    },
    
    fetchNotificationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Add a new notification
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      state.lastUpdated = new Date().toISOString();
    },
    
    // Mark notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (notif) => notif.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    // Mark all notifications as read
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    
    // Delete a notification
    deleteNotification: (state, action: PayloadAction<string>) => {
      const notificationIndex = state.notifications.findIndex(
        (notif) => notif.id === action.payload
      );
      
      if (notificationIndex !== -1) {
        const isUnread = !state.notifications[notificationIndex].read;
        state.notifications.splice(notificationIndex, 1);
        
        if (isUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },
    
    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    // Receive driver update (from socket)
    receiveDriverUpdate: (
      state,
      action: PayloadAction<{
        driverId: string;
        status: string;
        location: { latitude: number; longitude: number };
        eta: string;
        rideId?: string;
      }>
    ) => {
      // Create a new driver update notification
      const driverUpdateNotification: Notification = {
        id: `driver-update-${Date.now()}`,
        title: 'Driver Update',
        body: `Your driver's status changed to: ${action.payload.status}. ETA: ${action.payload.eta}`,
        time: new Date().toISOString(),
        read: false,
        type: 'driver_update',
        relatedId: action.payload.rideId,
        data: action.payload
      };
      
      state.notifications.unshift(driverUpdateNotification);
      state.unreadCount += 1;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Receive high demand update (from socket)
    receiveHighDemandUpdate: (
      state,
      action: PayloadAction<{
        areaId: string;
        areaName: string;
        demandLevel: number;
      }>
    ) => {
      // Create a notification about high demand area
      if (action.payload.demandLevel > 0.7) {
        const highDemandNotification: Notification = {
          id: `high-demand-${Date.now()}`,
          title: 'High Demand Alert',
          body: `Prices may be higher in ${action.payload.areaName} due to increased demand.`,
          time: new Date().toISOString(),
          read: false,
          type: 'system',
          data: action.payload
        };
        
        state.notifications.unshift(highDemandNotification);
        state.unreadCount += 1;
        state.lastUpdated = new Date().toISOString();
      }
    },
    
    // Receive promo notification (from socket)
    receivePromoNotification: (
      state,
      action: PayloadAction<{
        promoCode: string;
        description: string;
        expiryDate: string;
      }>
    ) => {
      // Create a promotion notification
      const promoNotification: Notification = {
        id: `promo-${Date.now()}`,
        title: 'New Promotion Available',
        body: `${action.payload.description} Use code: ${action.payload.promoCode}. Expires: ${action.payload.expiryDate}`,
        time: new Date().toISOString(),
        read: false,
        type: 'promo',
        data: action.payload
      };
      
      state.notifications.unshift(promoNotification);
      state.unreadCount += 1;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  setSocketConnected,
  setNotifications,
  fetchNotificationsStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  receiveDriverUpdate,
  receiveHighDemandUpdate,
  receivePromoNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer; 