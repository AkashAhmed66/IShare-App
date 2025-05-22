import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  email?: string;
  isDefault: boolean;
}

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePic: string;
  homeAddress?: SavedPlace;
  workAddress?: SavedPlace;
  paymentMethods: PaymentMethod[];
  savedPlaces: SavedPlace[];
  isRider?: boolean;
  vehicleDetails?: {
    type: string;
    make: string;
    model: string;
    year: string;
    licensePlate: string;
  };
  riderDocuments?: {
    drivingLicense: string;
    insuranceInfo: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

// For demo purposes, include a demo user
const demoUser: User = {
  id: 'demo-user-123',
  name: 'Demo User',
  email: 'demo@example.com',
  phone: '+1234567890',
  profilePic: '',
  paymentMethods: [],
  savedPlaces: []
};

// Change this to true to demo the app with a pre-logged in user
const USE_DEMO_USER = false;

const initialState: AuthState = {
  user: USE_DEMO_USER ? demoUser : null,
  isAuthenticated: USE_DEMO_USER,
  isLoading: false,
  error: null,
  token: USE_DEMO_USER ? 'demo-token-123' : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    addSavedPlace: (state, action: PayloadAction<SavedPlace>) => {
      if (state.user) {
        state.user.savedPlaces = [...state.user.savedPlaces, action.payload];
      }
    },
    removeSavedPlace: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.savedPlaces = state.user.savedPlaces.filter(
          (place) => place.id !== action.payload
        );
      }
    },
    addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      if (state.user) {
        // If new payment method is set as default, remove default from others
        if (action.payload.isDefault) {
          state.user.paymentMethods = state.user.paymentMethods.map(method => ({
            ...method,
            isDefault: false
          }));
        }
        state.user.paymentMethods = [...state.user.paymentMethods, action.payload];
      }
    },
    removePaymentMethod: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.paymentMethods = state.user.paymentMethods.filter(
          (method) => method.id !== action.payload
        );
      }
    },
    setDefaultPaymentMethod: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.paymentMethods = state.user.paymentMethods.map(method => ({
          ...method,
          isDefault: method.id === action.payload
        }));
      }
    },
    convertToRider: (state, action: PayloadAction<{
      vehicleDetails: User['vehicleDetails'];
      riderDocuments: User['riderDocuments'];
    }>) => {
      if (state.user) {
        state.user.isRider = true;
        state.user.vehicleDetails = action.payload.vehicleDetails;
        state.user.riderDocuments = action.payload.riderDocuments;
      }
    },
    toggleUserMode: (state) => {
      // No-op if user is not a rider
      if (state.user && state.user.isRider) {
        // This will be used to switch between rider and passenger mode in the app
        // The actual mode state will be managed in a separate slice or component state
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserProfile,
  addSavedPlace,
  removeSavedPlace,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  convertToRider,
  toggleUserMode,
} = authSlice.actions;

export default authSlice.reducer; 