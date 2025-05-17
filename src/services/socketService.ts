import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
  receiveDriverUpdate,
  receiveHighDemandUpdate,
  receivePromoNotification,
  setSocketConnected,
} from '../redux/slices/notificationSlice';
import { updateDriverLocation } from '../redux/slices/mapSlice';

// Using a dummy socket URL for demonstration
const SOCKET_URL = 'https://api.ishare-app.com';

class SocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;

  // Initialize socket connection
  initialize(userId: string): void {
    this.userId = userId;
    
    // Close existing connection if any
    this.disconnect();
    
    // Create new connection
    this.socket = io(SOCKET_URL, {
      query: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    
    this.setupListeners();
  }
  
  // Set up event listeners
  private setupListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
      store.dispatch(setSocketConnected(true));
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      store.dispatch(setSocketConnected(false));
    });
    
    this.socket.on('driver_update', (data) => {
      console.log('Driver update received:', data);
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
      console.log('High demand update received:', data);
      store.dispatch(receiveHighDemandUpdate(data));
    });
    
    this.socket.on('promo_notification', (data) => {
      console.log('Promo notification received:', data);
      store.dispatch(receivePromoNotification(data));
    });
    
    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnect attempt #${attemptNumber}`);
    });
    
    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
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
}

export default new SocketService(); 