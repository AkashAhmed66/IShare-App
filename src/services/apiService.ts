import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL, DEFAULT_HEADERS } from '../config/apiConfig';
import * as Storage from '../utils/asyncStorageUtils';

// Set this to true if you want to use mock responses instead of real API
const USE_MOCK_API = false;

// Create axios instance with shorter timeout for development
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Increased timeout for mobile networks
  headers: DEFAULT_HEADERS,
});

// API call counter for debugging
let apiCallCounter = 0;

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const callId = ++apiCallCounter;
    const method = config.method?.toUpperCase() || 'UNKNOWN';
    const url = config.url || 'UNKNOWN';
    
    console.log(`[API-${callId}] REQUEST: ${method} ${url}`);
    console.log(`[API-${callId}] Request URL: ${API_URL}${url}`);
    
    if (config.data) {
      // Log request data but remove sensitive fields
      const sanitizedData = { ...config.data };
      if (sanitizedData.password) sanitizedData.password = '********';
      console.log(`[API-${callId}] Request Body:`, JSON.stringify(sanitizedData));
    }
    
    // Get token from storage
    const token = await Storage.getItem('authToken');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API-${callId}] Using authorization token`);
    } else {
      console.log(`[API-${callId}] No authorization token available`);
    }
    
    // Store the call ID for response matching
    config.headers['X-Call-ID'] = callId.toString();
    
    return config;
  },
  (error) => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const callId = response.config.headers?.['X-Call-ID'] || 'UNKNOWN';
    const method = response.config.method?.toUpperCase() || 'UNKNOWN';
    const url = response.config.url || 'UNKNOWN';
    
    console.log(`[API-${callId}] RESPONSE: ${response.status} for ${method} ${url}`);
    
    // Log response data but truncate if too large
    const responseData = JSON.stringify(response.data);
    console.log(`[API-${callId}] Response Body:`, 
      responseData.length > 500 ? responseData.substring(0, 500) + "..." : responseData
    );
    
    return response;
  },
  async (error: AxiosError) => {
    // Get call ID if available
    const callId = error.config?.headers?.['X-Call-ID'] || 'UNKNOWN';
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';
    
    // Check if error is a timeout or network error
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error(`[API-${callId}] NETWORK ERROR: ${method} ${url}`);
      console.error(`[API-${callId}] Details:`, error.message);
      
      if (USE_MOCK_API) {
        console.warn(`[API-${callId}] Using mock response due to connection error`);
        const mockResponse = getMockResponse(error.config);
        return Promise.resolve({ data: mockResponse });
      }
      
      return Promise.reject(new Error(`Unable to connect to the server (${API_URL}). Please check your network connection.`));
    }
    
    const status = error.response?.status;
    const originalRequest = error.config;
    
    console.error(`[API-${callId}] ERROR ${status}: ${method} ${url}`);
    console.error(`[API-${callId}] Response:`, error.response?.data);
    
    // If error is 401 (Unauthorized) and it's not a retry
    if (status === 401 && !originalRequest?.headers?.['X-Retry']) {
      console.log(`[API-${callId}] Attempting token refresh for 401 error`);
      
      // Get refresh token
      const refreshToken = await Storage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          // Try to get new token
          console.log(`[API-${callId}] Calling refresh token API`);
          const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
            refreshToken,
          });
          
          // If successful, update tokens
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Store new tokens
          await Storage.setItem('authToken', accessToken);
          await Storage.setItem('refreshToken', newRefreshToken);
          
          console.log(`[API-${callId}] Token refresh successful, retrying original request`);
          
          // Update authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers['X-Retry'] = 'true';
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error(`[API-${callId}] Token refresh failed:`, refreshError);
          
          // If refresh fails, clear tokens
          await Storage.removeItem('authToken');
          await Storage.removeItem('refreshToken');
          
          // Return the original error
          return Promise.reject(error);
        }
      } else {
        console.log(`[API-${callId}] No refresh token available`);
      }
    }
    
    return Promise.reject(error);
  }
);

// Mock response function
function getMockResponse(config: any): any {
  const { method, url } = config || {};
  
  console.log(`[MOCK] Generating mock response for ${method} ${url}`);
  
  // Login endpoint mock
  if (method?.toLowerCase() === 'post' && url?.includes('/api/auth/login')) {
    return {
      user: {
        _id: 'mock-user-123',
        name: 'Mock User',
        email: 'mock@example.com',
        phone: '+1234567890',
        role: 'user',
        profilePic: ''
      },
      token: 'mock-token-xyz',
      refreshToken: 'mock-refresh-token-xyz'
    };
  }
  
  // Current user endpoint mock
  if (method?.toLowerCase() === 'get' && url?.includes('/api/auth/me')) {
    return {
      _id: 'mock-user-123',
      name: 'Mock User',
      email: 'mock@example.com',
      phone: '+1234567890',
      role: 'user',
      profilePic: ''
    };
  }
  
  // Default mock response
  return {};
}

// API service methods
class ApiService {
  // GET request
  async get<T>(url: string, params?: any): Promise<T> {
    if (USE_MOCK_API) {
      console.log(`[MOCK] GET ${url}`);
      return getMockResponse({ method: 'get', url }) as T;
    }
    
    try {
      const response = await api.get<T>(url, { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }
  
  // POST request
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      console.log(`[MOCK] POST ${url}`);
      return getMockResponse({ method: 'post', url, data }) as T;
    }
    
    try {
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }
  
  // PUT request
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      console.log(`[MOCK] PUT ${url}`);
      return getMockResponse({ method: 'put', url, data }) as T;
    }
    
    try {
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }
  
  // DELETE request
  async delete<T>(url: string, params?: any): Promise<T> {
    if (USE_MOCK_API) {
      console.log(`[MOCK] DELETE ${url}`);
      return getMockResponse({ method: 'delete', url }) as T;
    }
    
    try {
      const response = await api.delete<T>(url, { params });
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }
  
  // PATCH request
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    if (USE_MOCK_API) {
      console.log(`[MOCK] PATCH ${url}`);
      return getMockResponse({ method: 'patch', url, data }) as T;
    }
    
    try {
      const response = await api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error as AxiosError);
      throw error;
    }
  }
  
  // Handle API errors
  private handleApiError(error: AxiosError): void {
    const status = error.response?.status;
    
    // Already logged in interceptor, just pass through
  }
}

// Export singleton instance
export const apiService = new ApiService(); 