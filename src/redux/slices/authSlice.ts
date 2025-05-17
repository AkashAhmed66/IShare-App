import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { currentUser } from '../../utils/dummyData';

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
  homeAddress: SavedPlace;
  workAddress: SavedPlace;
  paymentMethods: PaymentMethod[];
  savedPlaces: SavedPlace[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  user: currentUser, // Using dummy data
  isAuthenticated: true, // Set to true for demo purposes
  isLoading: false,
  error: null,
  token: 'dummy-token-12345',
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
} = authSlice.actions;

export default authSlice.reducer; 