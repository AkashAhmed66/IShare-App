import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { rideOptions, scheduledRides, recentRides } from '../../utils/dummyData';

export interface Location {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface RideOption {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  price: number;
  image: string;
  capacity: number;
}

export interface ScheduledRide {
  id: string;
  date: string;
  time: string;
  pickup: string;
  destination: string;
  price: number;
  recurringDays: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface RideRequest {
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  selectedRideOption: RideOption | null;
  scheduledTime: Date | null;
  isScheduled: boolean;
  isRecurring: boolean;
  recurringDays: string[];
  estimatedPrice: number | null;
  estimatedDuration: number | null;
  estimatedDistance: number | null;
  promoCode: string | null;
}

export interface RideState {
  rideRequest: RideRequest;
  availableRideOptions: RideOption[];
  isSearchingRide: boolean;
  currentRide: {
    id: string | null;
    status: 'searching' | 'driverAssigned' | 'driverArrived' | 'inProgress' | 'completed' | 'cancelled' | null;
    driver: any | null;
    startTime: Date | null;
    endTime: Date | null;
  };
  scheduledRides: ScheduledRide[];
  recentRides: any[];
  error: string | null;
}

const initialState: RideState = {
  rideRequest: {
    pickupLocation: null,
    dropoffLocation: null,
    selectedRideOption: null,
    scheduledTime: null,
    isScheduled: false,
    isRecurring: false,
    recurringDays: [],
    estimatedPrice: null,
    estimatedDuration: null,
    estimatedDistance: null,
    promoCode: null,
  },
  availableRideOptions: rideOptions,
  isSearchingRide: false,
  currentRide: {
    id: null,
    status: null,
    driver: null,
    startTime: null,
    endTime: null,
  },
  scheduledRides: scheduledRides,
  recentRides: recentRides,
  error: null,
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    setPickupLocation: (state, action: PayloadAction<Location>) => {
      state.rideRequest.pickupLocation = action.payload;
    },
    setDropoffLocation: (state, action: PayloadAction<Location>) => {
      state.rideRequest.dropoffLocation = action.payload;
    },
    selectRideOption: (state, action: PayloadAction<RideOption>) => {
      state.rideRequest.selectedRideOption = action.payload;
    },
    setScheduledTime: (state, action: PayloadAction<Date | null>) => {
      state.rideRequest.scheduledTime = action.payload;
      state.rideRequest.isScheduled = !!action.payload;
    },
    toggleRecurring: (state, action: PayloadAction<boolean>) => {
      state.rideRequest.isRecurring = action.payload;
      // Clear recurring days if toggling off
      if (!action.payload) {
        state.rideRequest.recurringDays = [];
      }
    },
    setRecurringDays: (state, action: PayloadAction<string[]>) => {
      state.rideRequest.recurringDays = action.payload;
    },
    setRideEstimates: (
      state,
      action: PayloadAction<{
        price: number;
        duration: number;
        distance: number;
      }>
    ) => {
      state.rideRequest.estimatedPrice = action.payload.price;
      state.rideRequest.estimatedDuration = action.payload.duration;
      state.rideRequest.estimatedDistance = action.payload.distance;
    },
    applyPromoCode: (state, action: PayloadAction<string>) => {
      state.rideRequest.promoCode = action.payload;
    },
    requestRide: (state) => {
      state.isSearchingRide = true;
      state.currentRide.status = 'searching';
      state.error = null;
    },
    rideRequestSuccess: (state, action: PayloadAction<{ rideId: string; driver: any }>) => {
      state.isSearchingRide = false;
      state.currentRide = {
        id: action.payload.rideId,
        status: 'driverAssigned',
        driver: action.payload.driver,
        startTime: new Date(),
        endTime: null,
      };
    },
    rideRequestFailure: (state, action: PayloadAction<string>) => {
      state.isSearchingRide = false;
      state.currentRide.status = null;
      state.error = action.payload;
    },
    updateRideStatus: (
      state,
      action: PayloadAction<{
        status:
          | 'driverAssigned'
          | 'driverArrived'
          | 'inProgress'
          | 'completed'
          | 'cancelled';
      }>
    ) => {
      state.currentRide.status = action.payload.status;
      
      if (action.payload.status === 'completed' && state.currentRide.id) {
        state.currentRide.endTime = new Date();
        
        // Add to recent rides
        const newRide = {
          id: state.currentRide.id,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          pickup: state.rideRequest.pickupLocation?.name || 'Unknown',
          destination: state.rideRequest.dropoffLocation?.name || 'Unknown',
          price: state.rideRequest.estimatedPrice || 0,
          driverName: state.currentRide.driver?.name || 'Unknown Driver',
          status: 'completed',
        };
        
        state.recentRides = [newRide, ...state.recentRides];
      }
    },
    scheduleRide: (state) => {
      if (state.rideRequest.pickupLocation && 
          state.rideRequest.dropoffLocation && 
          state.rideRequest.scheduledTime &&
          state.rideRequest.selectedRideOption) {
        
        const newScheduledRide: ScheduledRide = {
          id: `sched${Date.now()}`,
          date: state.rideRequest.scheduledTime.toISOString().split('T')[0],
          time: state.rideRequest.scheduledTime.toTimeString().slice(0, 5),
          pickup: state.rideRequest.pickupLocation.name,
          destination: state.rideRequest.dropoffLocation.name,
          price: state.rideRequest.estimatedPrice || state.rideRequest.selectedRideOption.price,
          recurringDays: state.rideRequest.isRecurring ? [...state.rideRequest.recurringDays] : [],
          status: 'scheduled',
        };
        
        state.scheduledRides = [newScheduledRide, ...state.scheduledRides];
        
        // Reset ride request
        state.rideRequest = {
          ...initialState.rideRequest,
          pickupLocation: state.rideRequest.pickupLocation,
          dropoffLocation: state.rideRequest.dropoffLocation,
        };
      }
    },
    cancelScheduledRide: (state, action: PayloadAction<string>) => {
      const rideIndex = state.scheduledRides.findIndex(ride => ride.id === action.payload);
      if (rideIndex !== -1) {
        state.scheduledRides[rideIndex].status = 'cancelled';
      }
    },
    resetRideRequest: (state) => {
      state.rideRequest = initialState.rideRequest;
    },
    clearCurrentRide: (state) => {
      state.currentRide = initialState.currentRide;
    },
  },
});

export const {
  setPickupLocation,
  setDropoffLocation,
  selectRideOption,
  setScheduledTime,
  toggleRecurring,
  setRecurringDays,
  setRideEstimates,
  applyPromoCode,
  requestRide,
  rideRequestSuccess,
  rideRequestFailure,
  updateRideStatus,
  scheduleRide,
  cancelScheduledRide,
  resetRideRequest,
  clearCurrentRide,
} = rideSlice.actions;

export default rideSlice.reducer; 