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
  
  // State for source and destination markers
  const [sourceMarker, setSourceMarker] = useState({ latitude: 23.7103, longitude: 90.4125 });
  const [destinationMarker, setDestinationMarker] = useState({ latitude: 23.6103, longitude: 90.4125 });
  const [userCoordinates, setUserCoordinates] = useState<{ latitude: number; longitude: number } | null>({latitude:0, longitude:0});
  const [isDraggingSource, setIsDraggingSource] = useState(false);
  const [isDraggingDestination, setIsDraggingDestination] = useState(false);
  const [dragCoordinates, setDragCoordinates] = useState<{latitude: number; longitude: number} | null>(null);

  // Initial setup to get user location
  useEffect(() => {
    // If initialLocation is provided, use it for the source marker
    if (initialLocation) {
      setSourceMarker({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude
      });
      return;
    }
    
    const getLocation = async () => {
      try {
        const location = await LocationService.getCurrentLocation();
        setCurrentLocation(location);
        
        // Set source marker to the current location
        setSourceMarker({
          latitude: location.latitude,
          longitude: location.longitude
        });
        
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
  }, [initialLocation]);

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
    if (sourceMarker && destinationMarker) {
      fetchAndDrawRoute(sourceMarker, destinationMarker);
    } else {
      // Clear route if source or destination is missing
      setRouteCoordinates([]);
      setRouteInfo(null);
    }
  }, [sourceMarker, destinationMarker]);

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

  // Update destination marker when destination prop changes
  useEffect(() => {
    if (destination) {
      setDestinationMarker({
        latitude: destination.latitude,
        longitude: destination.longitude
      });
    }
  }, [destination]);

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
    Geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({latitude: position.coords.latitude, longitude:position.coords.longitude});
        console.log('Current position:', position.coords);
      },
      (error) => {
        console.log('Error getting current position:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    const watchId = Geolocation.watchPosition(
      (position) => {
        const newCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        // setUserCoordinates(newCoordinates);
        
        // If trackUserLocation is enabled, update the map
        if (trackUserLocation && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: newCoordinates.latitude,
            longitude: newCoordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      },
      (error) => {
        console.log('Error watching position:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 0, // Update every 10 meters
        interval: 2000, // Update every 5 seconds
        useSignificantChanges: false,
        maximumAge: 0,
        fastestInterval: 2000 // Fastest rate in milliseconds
      }
    );

  }, []);

  // Handle source marker drag events
  const handleSourceDragStart = () => {
    console.log('Source marker drag started');
    setIsDraggingSource(true);
    setDragCoordinates(sourceMarker);
  };

  const handleSourceDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSourceMarker({ latitude, longitude });
    setDragCoordinates({ latitude, longitude });
  };

  const handleSourceDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    console.log('Source marker drag ended at:', { latitude, longitude });
    setSourceMarker({ latitude, longitude });
    setIsDraggingSource(false);
    setDragCoordinates(null);
    
    // Notify parent component if needed
    if (onSourceLocationChange) {
      onSourceLocationChange({ latitude, longitude });
    }
    
    // No need to manually update route here since the useEffect will handle it
  };

  // Handle destination marker drag events
  const handleDestinationDragStart = () => {
    console.log('Destination marker drag started');
    setIsDraggingDestination(true);
    setDragCoordinates(destinationMarker);
  };

  const handleDestinationDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDestinationMarker({ latitude, longitude });
    setDragCoordinates({ latitude, longitude });
  };

  const handleDestinationDragEnd = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    console.log('Destination marker drag ended at:', { latitude, longitude });
    setDestinationMarker({ latitude, longitude });
    setIsDraggingDestination(false);
    setDragCoordinates(null);
    
    // Notify parent component if needed
    if (onDestinationLocationChange) {
      onDestinationLocationChange({ latitude, longitude });
    }
    
    // No need to manually update route here since the useEffect will handle it
  };

  // Define custom marker components for better visual feedback
  const SourceMarkerCustomView = () => (
    <View style={styles.sourceMarkerContainer}>
      <View style={styles.sourceMarker}>
        <Ionicons name="location" size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.markerLabel}>Source</Text>
    </View>
  );

  const DestinationMarkerCustomView = () => (
    <View style={styles.destinationMarkerContainer}>
      <View style={styles.destinationMarker}>
        <Ionicons name="flag" size={24} color={COLORS.secondary} />
      </View>
      <Text style={styles.markerLabel}>Destination</Text>
    </View>
  );

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
        {/* Source location marker (draggable) */}
        <Marker 
          coordinate={sourceMarker}
          title="Source Location"
          description="Drag to reposition"
          draggable={true}
          onDragStart={handleSourceDragStart}
          onDrag={handleSourceDrag}
          onDragEnd={handleSourceDragEnd}
        >
          <SourceMarkerCustomView />
        </Marker>
        
        {/* Destination location marker (draggable) */}
        <Marker 
          coordinate={destinationMarker}
          title="Destination Location"
          description="Drag to reposition"
          draggable={true}
          onDragStart={handleDestinationDragStart}
          onDrag={handleDestinationDrag}
          onDragEnd={handleDestinationDragEnd}
        >
          <DestinationMarkerCustomView />
        </Marker>
        
        {/* User's current location marker (not draggable) */}
        {userCoordinates && (
          <Marker 
            coordinate={{latitude: userCoordinates.latitude, longitude: userCoordinates.longitude}} 
            title="Current Location"
            pinColor='orange'
          />
        )}
        
        {/* Draw route if coordinates are available */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={COLORS.primary}
          />
        )}
      </MapView>
      
      {/* Display coordinates when dragging markers */}
      {dragCoordinates && (isDraggingSource || isDraggingDestination) && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesTitle}>
            {isDraggingSource ? 'Source Location' : 'Destination Location'}
          </Text>
          <Text style={styles.coordinatesText}>
            Latitude: {dragCoordinates.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            Longitude: {dragCoordinates.longitude.toFixed(6)}
          </Text>
        </View>
      )}
      
      {/* Display route information if available */}
      {routeInfo && (
        <View style={styles.routeInfoContainer}>
          <Text style={styles.routeInfoText}>
            Distance: {routeInfo.distance} • Duration: {routeInfo.duration}
          </Text>
        </View>
      )}
      
      {/* Button to center on user location */}
      <TouchableOpacity style={styles.myLocationButton} onPress={centerOnUserLocation}>
        <Ionicons name="locate" size={24} color={COLORS.primary} />
      </TouchableOpacity>
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
  sourceMarkerContainer: {
    alignItems: 'center',
  },
  sourceMarker: {
    backgroundColor: COLORS.white,
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  markerLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
    color: COLORS.text,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  coordinatesContainer: {
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
  coordinatesTitle: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  coordinatesText: {
    color: COLORS.black,
    fontSize: 14,
  },
});

export default CustomMapView; 