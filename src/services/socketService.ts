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
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  // Initialize socket connection
  initialize(userId: string): void {
    this.userId = userId;
    
    // Close existing connection if any
    this.disconnect();
    
    console.log(`[Socket] Initializing socket connection to ${SOCKET_URL}`);
    console.log(`[Socket] Connecting as user ${userId}`);
    
    try {
      // Create new connection with better error handling
      this.socket = io(SOCKET_URL, {
        query: { userId },
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        timeout: 10000
      });
      
      this.socket.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
        this.handleReconnect();
      });
      
      this.socket.io.on('reconnect_failed', () => {
        console.error('[Socket] Reconnection failed after multiple attempts');
        store.dispatch(setSocketConnected(false));
        
        // Create an offline notification
        const notification: Notification = {
          id: `conn-error-${Date.now()}`,
          title: 'Connection Error',
          body: 'Unable to connect to the service. Please check your internet connection.',
          time: new Date().toISOString(),
          read: false,
          type: 'system',
          data: null
        };
        
        store.dispatch(addNotification(notification));
      });
      
      this.setupListeners();
      console.log('[Socket] Socket connection initialized');
    } catch (error) {
      console.error('[Socket] Error initializing socket:', error);
    }
  }
  
  // Handle reconnection logic
  private handleReconnect(): void {
    this.reconnectAttempts++;
    console.log(`[Socket] Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Socket] Maximum reconnect attempts reached');
      return;
    }
    
    // Try to reconnect after delay
    setTimeout(() => {
      if (!this.socket?.connected && this.userId) {
        this.initialize(this.userId);
      }
    }, 3000);
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
      
      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
      
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
    
    this.socket.on('welcome', (data) => {
      console.log('[Socket] Welcome message:', data.message);
    });
    
    this.socket.on('authenticated', (data) => {
      console.log('[Socket] Authentication successful:', data);
    });
    
    // Driver location updates
    this.socket.on('driver_location_update', (data) => {
      console.log('[Socket] Driver location update received:', data);
      
      // Update the driver's location on the map
      if (data.location) {
        store.dispatch(updateDriverLocation({
          driverId: data.driverId,
          location: data.location,
        }));
      }
    });
    
    // Driver assigned for ride
    this.socket.on('driver_assigned', (data) => {
      console.log('[Socket] Driver assigned:', data);
      
      const notification: Notification = {
        id: `driver-assigned-${Date.now()}`,
        title: 'Driver Found',
        body: `${data.driverName} is coming to pick you up in ${data.estimatedArrival}.`,
        time: new Date().toISOString(),
        read: false,
        type: 'ride',
        relatedId: data.rideId || null,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Driver accepted ride
    this.socket.on('driver_accepted', (data) => {
      console.log('[Socket] Driver accepted:', data);
      
      const notification: Notification = {
        id: `driver-accepted-${Date.now()}`,
        title: 'Ride Accepted',
        body: data.message || 'Your driver has accepted your ride request.',
        time: new Date().toISOString(),
        read: false,
        type: 'ride',
        relatedId: data.rideId,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Driver arrived at pickup
    this.socket.on('driver_arrived', (data) => {
      console.log('[Socket] Driver arrived:', data);
      
      const notification: Notification = {
        id: `driver-arrived-${Date.now()}`,
        title: 'Driver Arrived',
        body: data.message || 'Your driver has arrived at your location.',
        time: new Date().toISOString(),
        read: false,
        type: 'ride',
        relatedId: data.rideId,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Ride started
    this.socket.on('ride_started', (data) => {
      console.log('[Socket] Ride started:', data);
      
      const notification: Notification = {
        id: `ride-started-${Date.now()}`,
        title: 'Ride Started',
        body: data.message || 'Your ride has started. Enjoy your journey!',
        time: new Date().toISOString(),
        read: false,
        type: 'ride',
        relatedId: data.rideId,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Ride completed
    this.socket.on('ride_completed', (data) => {
      console.log('[Socket] Ride completed:', data);
      
      const notification: Notification = {
        id: `ride-completed-${Date.now()}`,
        title: 'Ride Completed',
        body: `Your ride has been completed. Final fare: ${data.finalFare} ${data.currency || 'BDT'}`,
        time: new Date().toISOString(),
        read: false,
        type: 'ride',
        relatedId: data.rideId,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Fare updates during ride
    this.socket.on('fare_update', (data) => {
      console.log('[Socket] Fare update:', data);
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
    
    // Ride request confirmation
    this.socket.on('ride_request_received', (data) => {
      console.log('[Socket] Ride request confirmation received:', data);
      
      const notification: Notification = {
        id: `ride-request-${Date.now()}`,
        title: 'Ride Request Received',
        body: `We're searching for drivers. Estimated fare: ${data.estimatedPrice} ${data.currency || 'BDT'}`,
        time: new Date().toISOString(),
        read: false,
        type: 'ride',
        relatedId: data.rideId,
        data: data
      };
      
      store.dispatch(addNotification(notification));
    });
    
    // Ride cancellation
    this.socket.on('ride_cancelled', (data) => {
      console.log('[Socket] Ride cancellation notification received:', data);
      
      const notification: Notification = {
        id: `ride-cancelled-${Date.now()}`,
        title: 'Ride Cancelled',
        body: data.message || 'Your ride has been cancelled.',
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
        body: `Your payment of ${data.amount} ${data.currency || 'BDT'} has been processed successfully.`,
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
  
  // Send ride request to server with proper ride details
  sendRideRequest(rideDetails: any): void {
    if (!this.socket) {
      console.error('[Socket] Cannot send ride request: Socket not connected');
      return;
    }
    
    if (!this.userId) {
      console.error('[Socket] Cannot send ride request: User not authenticated');
      return;
    }
    
    console.log('[Socket] Sending ride request:', rideDetails);
    this.socket.emit('ride_request', { 
      userId: this.userId, 
      ...rideDetails,
      requestTime: new Date().toISOString()
    });
  }
  
  // Send cancel ride request
  cancelRide(rideId: string): void {
    if (!this.socket || !this.userId) return;
    console.log('[Socket] Cancelling ride:', rideId);
    this.socket.emit('cancel_ride', { userId: this.userId, rideId });
  }
  
  // Send schedule ride request
  scheduleRide(rideDetails: any): void {
    if (!this.socket || !this.userId) return;
    console.log('[Socket] Scheduling ride:', rideDetails);
    this.socket.emit('schedule_ride', { 
      userId: this.userId, 
      ...rideDetails,
      isScheduled: true
    });
  }
  
  // Send user location updates
  updateUserLocation(location: { latitude: number; longitude: number }): void {
    if (!this.socket || !this.userId) return;
    console.log('[Socket] Updating user location:', location);
    this.socket.emit('update_location', { userId: this.userId, location });
  }
  
  // Send driver status updates (for driver app)
  updateDriverStatus(isActive: boolean): void {
    if (!this.socket || !this.userId || this.userType !== 'driver') return;
    console.log('[Socket] Updating driver status:', isActive ? 'active' : 'inactive');
    this.socket.emit('driver_status', { userId: this.userId, isActive });
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