import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';
import { socketService } from './socketService';
import { User } from './authService';

// Interfaces
export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Ride {
  _id: string;
  user: string | User;
  driver?: string | User;
  pickupLocation: Location;
  dropoffLocation: Location;
  rideType: 'standard' | 'premium' | 'shared' | 'xl';
  status: RideStatus;
  requestTime: string;
  scheduledTime?: string;
  isScheduled: boolean;
  estimatedDistance?: number;
  estimatedDuration?: number;
  estimatedPrice: number;
  finalPrice?: number;
  paymentMethod: string;
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded';
  rating?: {
    user?: {
      value?: number;
      comment?: string;
    };
    driver?: {
      value?: number;
      comment?: string;
    };
  };
  route?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
}

export type RideStatus =
  | 'searching'
  | 'driverAssigned'
  | 'driverAccepted'
  | 'driverArrived'
  | 'inProgress'
  | 'completed'
  | 'cancelled'
  | 'noDriverFound';

class RideService {
  /**
   * Request a new ride
   */
  async requestRide(rideDetails: {
    pickupLocation: Location;
    dropoffLocation: Location;
    rideType: 'standard' | 'premium' | 'shared' | 'xl';
    paymentMethod: string;
    isScheduled?: boolean;
    scheduledTime?: string;
    estimatedPrice: number;
  }): Promise<Ride> {
    try {
      // Create the ride via API
      const response = await apiService.post<Ride>(
        API_ENDPOINTS.CREATE_RIDE,
        rideDetails
      );

      // For immediate rides, also request via socket for real-time matching
      if (!rideDetails.isScheduled) {
        const user = await import('./authService').then(m => m.authService.getCurrentUser());
        if (user) {
          socketService.requestRide({
            userId: user._id,
            pickupLocation: rideDetails.pickupLocation,
            dropoffLocation: rideDetails.dropoffLocation,
            rideType: rideDetails.rideType,
            paymentMethod: rideDetails.paymentMethod,
            estimatedPrice: rideDetails.estimatedPrice
          });
        }
      }

      return response;
    } catch (error) {
      console.error('Error requesting ride:', error);
      throw error;
    }
  }

  /**
   * Get user's ride history
   */
  async getUserRides(status?: RideStatus, limit = 10, skip = 0): Promise<Ride[]> {
    try {
      let url = API_ENDPOINTS.USER_RIDES;
      const params: Record<string, any> = { limit, skip };
      
      if (status) {
        params.status = status;
      }
      
      return await apiService.get<Ride[]>(url, params);
    } catch (error) {
      console.error('Error fetching user rides:', error);
      throw error;
    }
  }

  /**
   * Get a single ride by ID
   */
  async getRideById(rideId: string): Promise<Ride> {
    try {
      return await apiService.get<Ride>(
        API_ENDPOINTS.RIDE_DETAILS(rideId)
      );
    } catch (error) {
      console.error('Error fetching ride details:', error);
      throw error;
    }
  }

  /**
   * Cancel a ride
   */
  async cancelRide(rideId: string): Promise<Ride> {
    try {
      const response = await apiService.put<Ride>(
        API_ENDPOINTS.UPDATE_RIDE_STATUS(rideId),
        { status: 'cancelled' }
      );

      // Also cancel via socket for real-time update
      const user = await import('./authService').then(m => m.authService.getCurrentUser());
      if (user) {
        socketService.cancelRide(user._id, rideId);
      }

      return response;
    } catch (error) {
      console.error('Error cancelling ride:', error);
      throw error;
    }
  }

  /**
   * Schedule a ride for later
   */
  async scheduleRide(rideDetails: {
    pickupLocation: Location;
    dropoffLocation: Location;
    rideType: 'standard' | 'premium' | 'shared' | 'xl';
    paymentMethod: string;
    scheduledTime: string;
    estimatedPrice: number;
    recurringDays?: string[];
  }): Promise<Ride> {
    try {
      return await apiService.post<Ride>(
        API_ENDPOINTS.SCHEDULE_RIDE,
        {
          ...rideDetails,
          isScheduled: true
        }
      );
    } catch (error) {
      console.error('Error scheduling ride:', error);
      throw error;
    }
  }

  /**
   * Submit a rating for a completed ride
   */
  async submitRating(
    rideId: string,
    ratedUserId: string,
    score: number,
    comment?: string,
    categories?: {
      punctuality?: number;
      cleanliness?: number;
      courtesy?: number;
      safety?: number;
    }
  ): Promise<void> {
    try {
      // Submit via API
      await apiService.post(
        API_ENDPOINTS.CREATE_RATING,
        {
          rideId,
          ratedUserId,
          score,
          comment,
          categories
        }
      );

      // Also notify via socket for real-time updates
      const user = await import('./authService').then(m => m.authService.getCurrentUser());
      if (user) {
        socketService.submitRating({
          rideId,
          ratedUserId,
          raterUserId: user._id,
          score,
          comment,
          categories
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }
  }

  /**
   * Setup socket listeners for ride events
   */
  setupRideListeners(callbacks: {
    onDriverAssigned?: (data: any) => void;
    onDriverAccepted?: (data: any) => void;
    onDriverArrived?: (data: any) => void;
    onRideStarted?: (data: any) => void;
    onRideCompleted?: (data: any) => void;
    onRideCancelled?: (data: any) => void;
    onDriverLocationUpdate?: (data: any) => void;
    onRideRequestError?: (data: any) => void;
  }) {
    // Set up listeners for each event type
    if (callbacks.onDriverAssigned) {
      socketService.socket.on('driver_assigned', callbacks.onDriverAssigned);
    }
    
    if (callbacks.onDriverAccepted) {
      socketService.socket.on('driver_accepted', callbacks.onDriverAccepted);
    }
    
    if (callbacks.onDriverArrived) {
      socketService.socket.on('driver_arrived', callbacks.onDriverArrived);
    }
    
    if (callbacks.onRideStarted) {
      socketService.socket.on('ride_started', callbacks.onRideStarted);
    }
    
    if (callbacks.onRideCompleted) {
      socketService.socket.on('ride_completed', callbacks.onRideCompleted);
    }
    
    if (callbacks.onRideCancelled) {
      socketService.socket.on('ride_cancelled', callbacks.onRideCancelled);
    }
    
    if (callbacks.onDriverLocationUpdate) {
      socketService.socket.on('driver_location_update', callbacks.onDriverLocationUpdate);
    }
    
    if (callbacks.onRideRequestError) {
      socketService.socket.on('ride_request_error', callbacks.onRideRequestError);
    }

    // Return cleanup function
    return () => {
      if (callbacks.onDriverAssigned) {
        socketService.socket.off('driver_assigned', callbacks.onDriverAssigned);
      }
      
      if (callbacks.onDriverAccepted) {
        socketService.socket.off('driver_accepted', callbacks.onDriverAccepted);
      }
      
      if (callbacks.onDriverArrived) {
        socketService.socket.off('driver_arrived', callbacks.onDriverArrived);
      }
      
      if (callbacks.onRideStarted) {
        socketService.socket.off('ride_started', callbacks.onRideStarted);
      }
      
      if (callbacks.onRideCompleted) {
        socketService.socket.off('ride_completed', callbacks.onRideCompleted);
      }
      
      if (callbacks.onRideCancelled) {
        socketService.socket.off('ride_cancelled', callbacks.onRideCancelled);
      }
      
      if (callbacks.onDriverLocationUpdate) {
        socketService.socket.off('driver_location_update', callbacks.onDriverLocationUpdate);
      }
      
      if (callbacks.onRideRequestError) {
        socketService.socket.off('ride_request_error', callbacks.onRideRequestError);
      }
    };
  }
}

export const rideService = new RideService(); 