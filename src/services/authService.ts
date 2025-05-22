import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';
import { socketService } from './socketService';
import * as Storage from '../utils/asyncStorageUtils';

// Type definition for user
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePic?: string;
  role: 'user' | 'driver' | 'admin';
  isVerified?: boolean;
  rating?: {
    average: number;
    count: number;
  };
  homeAddress?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
    _id: string;
  };
  workAddress?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isDefault: boolean;
    _id: string;
  };
  paymentMethods?: Array<{
    type: string;
    cardNumber?: string;
    cardHolderName?: string;
    expiryMonth?: number;
    expiryYear?: number;
    last4?: string;
    brand?: string;
    isDefault: boolean;
    _id: string;
  }>;
  savedPlaces?: Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    isDefault?: boolean;
    _id: string;
  }>;
  driverInfo?: {
    // Driver-specific info
    licenseNumber?: string;
    isActive?: boolean;
    isVerified?: boolean;
    vehicleDetails?: {
      model?: string;
      make?: string;
      year?: number;
      color?: string;
      licensePlate?: string;
    };
  };
}

// Auth response type
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'userData',
};

class AuthService {
  private currentUser: User | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize auth service
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    console.log('[Auth] Initializing auth service');
    
    try {
      // Try to get the current user from storage
      const user = await this.getCurrentUser();
      if (user) {
        console.log('[Auth] User already logged in:', user.name);
      } else {
        console.log('[Auth] No user logged in');
      }
    } catch (error) {
      console.error('[Auth] Error initializing auth service:', error);
    } finally {
      this.isInitialized = true;
    }
  }

  /**
   * Register a new user
   */
  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: 'user' | 'driver';
  }): Promise<User> {
    console.log('[Auth] Registering new user:', userData.email);
    
    try {
      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        userData
      );
      
      if (!response || !response.user || !response.token) {
        console.error('[Auth] Invalid register response:', response);
        throw new Error('Invalid response from server');
      }
      
      console.log('[Auth] Registration successful for:', response.user.email);
      await this.setSession(response);
      return response.user;
    } catch (error) {
      console.error('[Auth] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<User> {
    console.log('[Auth] Attempting login for:', email);
    
    try {
      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        { email, password }
      );
      
      if (!response || !response.user || !response.token) {
        console.error('[Auth] Invalid login response:', response);
        throw new Error('Invalid response from server');
      }
      
      console.log('[Auth] Login successful for:', response.user.email);
      await this.setSession(response);
      return response.user;
    } catch (error) {
      console.error('[Auth] Login failed:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    console.log('[Auth] Logging out user');
    
    try {
      // Get current token for the request
      const token = await this.getToken();
      
      if (token) {
        try {
          // Call logout endpoint to invalidate the token on the server
          await apiService.post(API_ENDPOINTS.LOGOUT);
          console.log('[Auth] API logout successful');
        } catch (error) {
          console.error('[Auth] Error during API logout:', error);
          // Continue with local logout even if API call fails
        }
      }
    } finally {
      // Clear socket connection
      try {
        import('./socketService').then(({ socketService }) => {
          socketService.disconnect();
          console.log('[Auth] Socket disconnected');
        });
      } catch (e) {
        console.warn('[Auth] Could not disconnect socket:', e);
      }
      
      // Clear local storage and state
      await this.clearSession();
      console.log('[Auth] Local session cleared');
    }
  }

  /**
   * Get the authentication token
   */
  async getToken(): Promise<string | null> {
    const token = await Storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    return token;
  }

  /**
   * Verify if token is valid by checking with the server
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiService.get(API_ENDPOINTS.CURRENT_USER);
      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('[Auth] Token verification failed: Token invalid');
        return false;
      }
      // Network error or other issue, assume token still valid
      console.warn('[Auth] Token verification error:', error.message);
      return true;
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    // Return the cached user if available
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      // Try to get from storage
      const userData = await Storage.getItem(STORAGE_KEYS.USER);
      const token = await Storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        console.log('[Auth] No auth token found');
        return null;
      }
      
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
          console.log('[Auth] User loaded from storage:', this.currentUser?.name);
          
          // Optionally verify token with server
          // const isValid = await this.verifyToken(token);
          // if (!isValid) {
          //   console.log('[Auth] Stored token is invalid, clearing session');
          //   await this.clearSession();
          //   return null;
          // }
          
          return this.currentUser;
        } catch (parseError) {
          console.error('[Auth] Error parsing user data:', parseError);
          await Storage.removeItem(STORAGE_KEYS.USER);
        }
      }

      // If not in storage but token exists, fetch from API
      if (token) {
        console.log('[Auth] Token exists, fetching current user from API');
        try {
          const response = await apiService.get<User>(API_ENDPOINTS.CURRENT_USER);
          
          if (!response || !response._id) {
            throw new Error('Invalid user data received from server');
          }
          
          console.log('[Auth] User fetched from API:', response.name);
          this.currentUser = response;
          await Storage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
          return response;
        } catch (apiError: any) {
          console.error('[Auth] Error fetching current user from API:', apiError);
          // If API call fails with auth error, clear the session
          if (apiError.response?.status === 401) {
            console.log('[Auth] Token invalid, clearing session');
            await this.clearSession();
          }
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('[Auth] Error getting current user:', error);
      await this.clearSession();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await Storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const user = await this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put<User>(
        API_ENDPOINTS.UPDATE_PROFILE,
        profileData
      );
      
      // Update stored user data
      this.currentUser = response;
      await Storage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      return await apiService.get<User>(`/api/users/${userId}`);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Store authentication data in storage
   */
  private async setSession(authData: AuthResponse): Promise<void> {
    try {
      console.log('[Auth] Setting session data');
      await Storage.setItem(STORAGE_KEYS.AUTH_TOKEN, authData.token);
      await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
      await Storage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData.user));
      
      this.currentUser = authData.user;
      
      // Connect to socket with auth
      socketService.authenticateUser(
        authData.user._id,
        authData.user.role === 'driver' ? 'driver' : 'passenger'
      );
      
      console.log('[Auth] Session data stored successfully');
    } catch (error) {
      console.error('[Auth] Error setting auth session:', error);
      throw error;
    }
  }

  /**
   * Clear all authentication data
   */
  private async clearSession(): Promise<void> {
    try {
      console.log('[Auth] Clearing session data');
      
      // Use the clearAllStorage function instead of individual removal
      await Storage.clearAllStorage();
      
      this.currentUser = null;
      
      // Disconnect from socket
      socketService.disconnect();
      
      console.log('[Auth] Session data cleared successfully');
    } catch (error) {
      console.error('[Auth] Error clearing auth session:', error);
      throw error;
    }
  }
}

export const authService = new AuthService(); 