import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { notifications } from '../../utils/dummyData';

interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isSocketConnected: boolean;
  lastUpdated: string | null;
}

const initialState: NotificationState = {
  notifications: notifications,
  unreadCount: notifications.filter((notif) => !notif.read).length,
  isSocketConnected: false,
  lastUpdated: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
      state.lastUpdated = new Date().toISOString();
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (notif) => notif.id === action.payload
      );
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
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
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    receiveDriverUpdate: (
      state,
      action: PayloadAction<{
        driverId: string;
        status: string;
        location: { latitude: number; longitude: number };
        eta: string;
      }>
    ) => {
      // Create a new driver update notification
      const driverUpdateNotification: Notification = {
        id: `driver-update-${Date.now()}`,
        title: 'Driver Update',
        body: `Your driver's status changed to: ${action.payload.status}. ETA: ${action.payload.eta}`,
        time: 'Just now',
        read: false,
      };
      
      state.notifications.unshift(driverUpdateNotification);
      state.unreadCount += 1;
      state.lastUpdated = new Date().toISOString();
    },
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
          time: 'Just now',
          read: false,
        };
        
        state.notifications.unshift(highDemandNotification);
        state.unreadCount += 1;
        state.lastUpdated = new Date().toISOString();
      }
    },
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
        time: 'Just now',
        read: false,
      };
      
      state.notifications.unshift(promoNotification);
      state.unreadCount += 1;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  setSocketConnected,
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