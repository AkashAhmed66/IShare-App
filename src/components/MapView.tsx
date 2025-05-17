import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ViewStyle,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../styles/theme';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region, Circle } from 'react-native-maps';
import LocationService, { LocationData } from '../services/locationService';
import MapsService from '../services/mapsService';
import Geolocation from '@react-native-community/geolocation';

Geolocation.setRNConfiguration({
  authorizationLevel: 'always',
  enableBackgroundLocationUpdates: true,
  locationProvider: 'auto',
  skipPermissionRequests: false,
});

interface CustomMapViewProps {
  currentLocation?: { latitude: number; longitude: number } | null;
  destination?: { latitude: number; longitude: number } | null;
  pickup?: { latitude: number; longitude: number } | null;
  routeCoordinates?: Array<{ latitude: number; longitude: number }>;
  nearbyDrivers?: Array<{
    id: string;
    location: { latitude: number; longitude: number };
  }>;
  highDemandAreas?: Array<{
    id: string;
    coordinates: { latitude: number; longitude: number };
    radius: number;
    demandLevel: number;
  }>;
  showDemandHeatmap?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  onRegionChange?: (region: Region) => void;
  onMapPress?: (event: any) => void;
  selectedDriver?: string;
  onSourceLocationChange?: (location: { latitude: number; longitude: number }) => void;
  onDestinationLocationChange?: (location: { latitude: number; longitude: number }) => void;
  onCustomMarkerPress?: (type: 'source' | 'destination') => void;
  trackUserLocation?: boolean;
}

const CustomMapView: React.FC<CustomMapViewProps> = ({
  currentLocation: initialLocation,
  destination,
  pickup,
  routeCoordinates: externalRouteCoordinates,
  nearbyDrivers = [],
  highDemandAreas = [],
  showDemandHeatmap = false,
  isLoading = false,
  style,
  onRegionChange,
  onMapPress,
  selectedDriver,
  onSourceLocationChange,
  onDestinationLocationChange,
  onCustomMarkerPress,
  trackUserLocation = false,
}) => {
  // Map and location state
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(initialLocation || null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationWatcher, setLocationWatcher] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{ latitude: number; longitude: number }>>(
    externalRouteCoordinates || []
  );
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
  } | null>(null);

  // Initial setup to get user location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const location = await LocationService.getCurrentLocation();
        setCurrentLocation(location);
        
        // Notify parent component if needed
        if (onSourceLocationChange && !initialLocation) {
          onSourceLocationChange(location);
        }

        // Center map on user's location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setLocationError('Unable to get your location. Please enable location services.');
      }
    };

    if (!initialLocation) {
      getLocation();
    }
  }, []);

  // Track user location if needed
  useEffect(() => {
    if (trackUserLocation) {
      startLocationTracking();
    }

    return () => {
      // Cleanup location watcher
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, [trackUserLocation]);

  // Update route when source or destination changes
  useEffect(() => {
    if (currentLocation && destination) {
      fetchAndDrawRoute(currentLocation, destination);
    } else {
      // Clear route if either source or destination is missing
      setRouteCoordinates([]);
      setRouteInfo(null);
    }
  }, [currentLocation, destination]);

  // Update external coordinates if provided
  useEffect(() => {
    if (externalRouteCoordinates && externalRouteCoordinates.length > 0) {
      setRouteCoordinates(externalRouteCoordinates);
      
      // Fit the map to show the entire route
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(externalRouteCoordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }, 500); // Small delay to ensure map is ready
      }
    }
  }, [externalRouteCoordinates]);

  // Start tracking user location
  const startLocationTracking = () => {
    // Clear any existing watcher
    if (locationWatcher) {
      locationWatcher.remove();
    }

    // Create a new watcher
    const watcher = LocationService.watchLocation(
      (location) => {
        setCurrentLocation(location);
        
        // Only update source location if tracking is on
        if (onSourceLocationChange && trackUserLocation) {
          onSourceLocationChange(location);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
        setLocationError(`Location error: ${error.message}`);
      }
    );

    setLocationWatcher(watcher);
  };

  // Fetch route between two points
  const fetchAndDrawRoute = async (
    source: { latitude: number; longitude: number },
    dest: { latitude: number; longitude: number }
  ) => {
    try {
      const routeData = await MapsService.getDirections(source, dest);
      setRouteCoordinates(routeData.coordinates);
      setRouteInfo({
        distance: routeData.distance,
        duration: routeData.duration
      });

      // Fit the map to show the entire route
      if (mapRef.current && routeData.coordinates.length > 0) {
        mapRef.current.fitToCoordinates(routeData.coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Route Error', 'Unable to fetch route. Please try again.');
    }
  };

  // Center map on user location
  const centerOnUserLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  // Handle marker press
  const handleMarkerPress = (type: 'source' | 'destination') => {
    if (onCustomMarkerPress) {
      onCustomMarkerPress(type);
    }
  };

  useEffect(() => {
    Geolocation.requestAuthorization(
      () => {
        console.log('Authorization granted');
      },
      (error) => {
        console.log('Authorization error:', error);
      }
    );
  }, []);

  // Show loading indicator if loading
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Show error if location services are disabled
  if (locationError) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Ionicons name="location-off" size={48} color={COLORS.error} />
        <Text style={styles.errorText}>{locationError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => LocationService.getCurrentLocation()
            .then(location => {
              setCurrentLocation(location);
              setLocationError(null);
            })
            .catch(err => setLocationError('Unable to get location. Please enable location services.'))
          }
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: currentLocation?.latitude || 23.7103,
          longitude: currentLocation?.longitude || 90.4125,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsPointsOfInterest={true}
        showsTraffic={true}
        showsBuildings={true}
        onRegionChange={onRegionChange}
        onPress={onMapPress}
      >
        <Marker coordinate={{ latitude: 23.7103, longitude: 90.4125 }} 
          title="Current Location"
          pinColor={COLORS.primary}
        />
        <Marker coordinate={{ latitude: 23.6103, longitude: 90.4125 }} 
          title="Current Location"
          pinColor={COLORS.secondary}
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
  },
  currentLocationMarkerContainer: {
    alignItems: 'center',
  },
  currentLocationMarker: {
    backgroundColor: COLORS.white,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  destinationMarkerContainer: {
    alignItems: 'center',
  },
  destinationMarker: {
    backgroundColor: COLORS.white,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  pickupMarkerContainer: {
    alignItems: 'center',
  },
  pickupMarker: {
    backgroundColor: COLORS.white,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  driverMarkerContainer: {
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  selectedDriverMarkerContainer: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  routeInfoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 5,
    padding: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  routeInfoText: {
    color: COLORS.black,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CustomMapView; 