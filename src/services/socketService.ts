import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
  receiveDriverUpdate,
  receiveHighDemandUpdate,
  receivePromoNotification,
  setSocketConnected,
  addNotification
} from '../redux/slices/notificationSlice';
import { updateDriverLocation } from '../redux/slices/mapSlice';
import { SOCKET_URL } from '../config/apiConfig';
import { Notification } from './notificationService';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private userType: 'passenger' | 'driver' | null = null;

  // Initialize socket connection
  initialize(userId: string): void {
    this.userId = userId;
    
    // Close existing connection if any
    this.disconnect();
    
    console.log(`[Socket] Initializing socket connection to ${SOCKET_URL}`);
    console.log(`[Socket] Connecting as user ${userId}`);
    
    try {
      // Create new connection
      this.socket = io(SOCKET_URL, {
        query: { userId },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 10000
      });
      
      this.setupListeners();
      console.log('[Socket] Socket connection initialized');
    } catch (error) {
      console.error('[Socket] Error initializing socket:', error);
    }
  }
  
  // Authenticate user (can be called after initialization)
  authenticateUser(userId: string, userType: 'passenger' | 'driver'): void {
    console.log(`[Socket] Authenticating user ${userId} as ${userType}`);
    this.userId = userId;
    this.userType = userType;
    
    if (this.socket) {
      this.socket.emit('authenticate', { userId, userType });
    } else {
      console.log('[Socket] Socket not connected, initializing first');
      this.initialize(userId);
      if (this.socket) {
        this.socket.emit('authenticate', { userId, userType });
      }
    }
  }
  
  // Check if socket is connected
  isConnected(): boolean {
    return !!this.socket?.connected;
  }
  
  // Set up event listeners
  private setupListeners(): void {
    if (!this.socket) {
      console.warn('[Socket] Cannot setup listeners, socket is null');
      return;
    }
    
    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
      store.dispatch(setSocketConnected(true));
      
      // Re-authenticate if we have userId and userType
      if (this.userId && this.userType) {
        this.socket?.emit('authenticate', { 
          userId: this.userId, 
          userType: this.userType 
        });
      }
    });
    
    this.socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
      store.dispatch(setSocketConnected(false));
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });
    
    this.socket.on('driver_update', (data) => {
      console.log('[Socket] Driver update received:', data);
      store.dispatch(receiveDriverUpdate(data));
      
      // Also update the driver's location on the map
      if (data.location) {
        store.dispatch(updateDriverLocation({
          driverId: data.driverId,
          location: data.location,
        }));
      }
    });
    
    this.socket.on('high_demand_update', (data) => {
      console.log('[Socket] High demand update received:', data);
      store.dispatch(receiveHighDemandUpdate(data));
    });
    
    this.socket.on('promo_notification', (data) => {
      console.log('[Socket] Promo notification received:', data);
      store.dispatch(receivePromoNotification(data));
    });
    
    // Generic notification handler for all types of notifications
    this.socket.on('notification', (notification: Notification) => {
      console.log('[Socket] Notification received:', notification);
      store.dispatch(addNotification(notification));
    });
    
    // New ride request notification (for drivers)
    this.socket.on('ride_request', (data) => {
      console.log('[Socket] Ride request notification received:', data);
      
      const notification: Notification = {
        id: `ride-request-${Date.now()}`,
        title: 'New Ride Request',
        body: `New ride request from ${data.pickupLocation} to ${data.destination}`,
        time: new Date().toISOString(),
        read: false,
        type: 'ride',
        relatedId: data.rideId,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Ride status update notification
    this.socket.on('ride_status_update', (data) => {
      console.log('[Socket] Ride status update notification received:', data);
      
      const notification: Notification = {
        id: `ride-status-${Date.now()}`,
        title: 'Ride Status Update',
        body: `Your ride status has changed to: ${data.status}`,
        time: new Date().toISOString(),
        read: false,
        type: 'ride',
        relatedId: data.rideId,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Payment notification
    this.socket.on('payment_processed', (data) => {
      console.log('[Socket] Payment processed notification received:', data);
      
      const notification: Notification = {
        id: `payment-${Date.now()}`,
        title: 'Payment Processed',
        body: `Your payment of $${data.amount} has been processed successfully.`,
        time: new Date().toISOString(),
        read: false,
        type: 'payment',
        relatedId: data.paymentId,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Error handling
    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });
    
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket] Reconnect attempt #${attemptNumber}`);
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed');
    });
  }
  
  // Send ride request to server
  sendRideRequest(rideDetails: any): void {
    if (!this.socket) return;
    this.socket.emit('ride_request', { userId: this.userId, ...rideDetails });
  }
  
  // Send cancel ride request
  cancelRide(rideId: string): void {
    if (!this.socket) return;
    this.socket.emit('cancel_ride', { userId: this.userId, rideId });
  }
  
  // Send schedule ride request
  scheduleRide(rideDetails: any): void {
    if (!this.socket) return;
    this.socket.emit('schedule_ride', { userId: this.userId, ...rideDetails });
  }
  
  // Send user location updates
  updateUserLocation(location: { latitude: number; longitude: number }): void {
    if (!this.socket) return;
    this.socket.emit('update_user_location', { userId: this.userId, location });
  }
  
  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
      store.dispatch(setSocketConnected(false));
    }
  }
  
  // For simulation purposes - mimics receiving real-time updates
  simulateDriverUpdate(driverData: any): void {
    store.dispatch(receiveDriverUpdate(driverData));
    
    if (driverData.location) {
      store.dispatch(updateDriverLocation({
        driverId: driverData.driverId,
        location: driverData.location,
      }));
    }
  }
  
  // Simulate high demand update
  simulateHighDemandUpdate(areaData: any): void {
    store.dispatch(receiveHighDemandUpdate(areaData));
  }
  
  // Simulate promo notification
  simulatePromoNotification(promoData: any): void {
    store.dispatch(receivePromoNotification(promoData));
  }
  
  // Simulate a generic notification
  simulateNotification(type: string, title: string, body: string, data: any = null): void {
    const notification: Notification = {
      id: `simulated-${Date.now()}`,
      title: title,
      body: body,
      time: new Date().toISOString(),
      read: false,
      type: type as any,
      data: data
    };
    
    store.dispatch(addNotification(notification));
  }
}

// Export as named export instead of default
export const socketService = new SocketService(); 