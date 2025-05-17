import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

// Type definition for location data
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  timestamp?: number;
  heading?: number;
}

// Type definition for location error
export interface LocationError {
  code: number;
  message: string;
}

// Type definition for location watcher
export type LocationWatcher = { remove: () => void };

/**
 * Request location permissions for Android
 * @returns Promise<boolean> indicating if permission was granted
 */
const requestAndroidLocationPermission = async (): Promise<boolean> => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "IShare needs access to your location for ride tracking and pickups.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};

/**
 * Get the current location once
 * @param options Optional configuration options
 * @returns Promise with location data
 */
export const getCurrentLocation = (options = {}): Promise<LocationData> => {
  return new Promise(async (resolve, reject) => {
    // Check platform and request permissions if needed
    if (Platform.OS === 'android') {
      const hasPermission = await requestAndroidLocationPermission();
      if (!hasPermission) {
        reject(new Error('Location permission denied'));
        return;
      }
    }

    // Get current position
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, speed, timestamp, heading } = position.coords;
        resolve({
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
          timestamp,
          heading
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        ...options
      }
    );
  });
};

/**
 * Watch the user's location with updates
 * @param onLocationChange Callback for location updates
 * @param onError Callback for errors
 * @param options Optional configuration options
 * @returns Location watcher object with remove method
 */
export const watchLocation = (
  onLocationChange: (location: LocationData) => void,
  onError?: (error: LocationError) => void,
  options = {}
): LocationWatcher => {
  // Check platform and request permissions if needed
  if (Platform.OS === 'android') {
    requestAndroidLocationPermission().then(hasPermission => {
      if (!hasPermission && onError) {
        onError({
          code: 1,
          message: 'Location permission denied'
        });
      }
    });
  }

  // Start watching position
  const watchId = Geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy, altitude, speed, timestamp, heading } = position.coords;
      onLocationChange({
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        timestamp,
        heading
      });
    },
    (error) => {
      console.error('Location watch error:', error);
      if (onError) {
        onError(error);
      }
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Minimum distance (meters) between updates
      interval: 5000, // Minimum time (milliseconds) between updates
      fastestInterval: 2000, // Fastest rate at which app can handle updates
      ...options
    }
  );

  // Return watcher object
  return {
    remove: () => {
      Geolocation.clearWatch(watchId);
    }
  };
};

/**
 * Check if location services are enabled
 * @returns Promise<boolean> indicating if location services are enabled
 */
export const isLocationEnabled = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      () => resolve(true),
      () => resolve(false),
      { timeout: 5000 }
    );
  });
};

// Export the Location Service as a singleton
const LocationService = {
  getCurrentLocation,
  watchLocation,
  isLocationEnabled
};

export default LocationService; 