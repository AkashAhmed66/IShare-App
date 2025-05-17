import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  FlatList,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomMapView from '../components/MapView';
import MapsService from '../services/mapsService';

// Mock data for recent rides
const recentRides = [
  { id: '1', location: 'Home', address: '123 Main Street', icon: 'home-outline', coordinates: {latitude: 23.8103, longitude: 90.4125} },
  { id: '2', location: 'Work', address: '456 Office Park', icon: 'briefcase-outline', coordinates: {latitude: 23.8203, longitude: 90.4225} },
  { id: '3', location: 'Shopping Mall', address: '789 Market Street', icon: 'cart-outline', coordinates: {latitude: 23.8150, longitude: 90.4050} },
];

// Mock data for suggested rides
const suggestedRides = [
  { id: '1', name: 'Standard', price: '$10-15', time: '5 min', icon: 'car-outline' },
  { id: '2', name: 'Comfort', price: '$15-20', time: '8 min', icon: 'car-sport-outline' },
  { id: '3', name: 'XL', price: '$20-25', time: '10 min', icon: 'car-outline' },
];

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Current Location');
  
  // Route-related state
  const [routeCoordinates, setRouteCoordinates] = useState<Array<{latitude: number; longitude: number}>>([]);
  const [routeInfo, setRouteInfo] = useState<{distance: string; duration: string} | null>(null);

  // Source and destination location state variables - using default values
  const [sourceLocation, setSourceLocation] = useState({
    latitude: 23.8103,
    longitude: 90.4125,
  });
  
  const [destinationLocation, setDestinationLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Handle location selected from the LocationSearchScreen
  useEffect(() => {
    if (route.params?.selectedLocation && route.params?.locationType) {
      const { selectedLocation, locationType } = route.params;
      
      if (locationType === 'source') {
        setSourceLocation(selectedLocation.coordinates);
        setCurrentLocation(selectedLocation.name);
      } else if (locationType === 'destination') {
        setDestinationLocation(selectedLocation.coordinates);
      }
      
      // Clear the params to avoid re-processing
      navigation.setParams({ selectedLocation: undefined, locationType: undefined });
    }
  }, [route.params?.selectedLocation]);
  
  // Get route when source or destination changes
  useEffect(() => {
    if (sourceLocation && destinationLocation) {
      fetchRoute(sourceLocation, destinationLocation);
    } else {
      // Clear route if source or destination is missing
      setRouteCoordinates([]);
      setRouteInfo(null);
    }
  }, [sourceLocation, destinationLocation]);

  // Function to fetch route between two points
  const fetchRoute = async (
    source: { latitude: number; longitude: number },
    dest: { latitude: number; longitude: number }
  ) => {
    setIsLoading(true);
    try {
      const routeData = await MapsService.getDirections(source, dest);
      setRouteCoordinates(routeData.coordinates);
      setRouteInfo({
        distance: routeData.distance,
        duration: routeData.duration
      });
    } catch (error) {
      console.error('Error fetching route:', error);
      Alert.alert('Route Error', 'Unable to fetch directions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceLocationChange = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setSourceLocation(location);
    setCurrentLocation('Updated Location');
  };

  const handleDestinationLocationChange = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setDestinationLocation(location);
  };

  const handleMarkerPress = (type: 'source' | 'destination') => {
    if (type === 'source') {
      Alert.alert(
        'Source Location',
        'You can tap this marker to edit the source location',
        [
          {
            text: 'Use Current Location',
            onPress: () => {
              // Simulate getting current location
              const simulatedLocation = {
                latitude: 23.8103 + (Math.random() * 0.02 - 0.01),
                longitude: 90.4125 + (Math.random() * 0.02 - 0.01)
              };
              setSourceLocation(simulatedLocation);
              setCurrentLocation('Current Location (Simulated)');
            }
          },
          {
            text: 'Search for Location',
            onPress: () => {
              // Navigate to LocationSearchScreen for source location
              navigation.navigate('LocationSearchScreen', {
                currentLocation: sourceLocation,
                locationType: 'source',
                returnScreen: 'Home'
              });
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert(
        'Destination',
        'You can tap this marker to edit the destination',
        [
          {
            text: 'Search for Location',
            onPress: () => {
              // Navigate to LocationSearchScreen for destination
              navigation.navigate('LocationSearchScreen', {
                currentLocation: sourceLocation,
                locationType: 'destination',
                returnScreen: 'Home'
              });
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleLocationSelect = (item: any) => {
    setDestinationLocation(item.coordinates);
  };

  const handleRecentLocationSelect = (item: any) => {
    if (item.coordinates) {
      setDestinationLocation(item.coordinates);
      // If we have source location, the route will be automatically fetched
      // via the useEffect that watches for changes to source and destination
    }
  };

  const handleBookRide = () => {
    if (destinationLocation) {
      navigation.navigate('MapScreen', {
        sourceLocation,
        destinationLocation
      });
    } else {
      Alert.alert('Select Destination', 'Please select a destination on the map first');
    }
  };

  const handleScheduleRide = () => {
    navigation.navigate('ScheduleRide');
  };

  const handleRideOptionSelect = (option: string) => {
    navigation.navigate('RideOptions', { rideType: option });
  };

  const handleViewHighDemand = () => {
    navigation.navigate('HighDemand');
  };

  const handleOpenSearch = () => {
    // Navigate to LocationSearchScreen instead of showing modal
    navigation.navigate('LocationSearchScreen', {
      currentLocation: sourceLocation,
      locationType: 'destination',
      returnScreen: 'Home'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <CustomMapView
            currentLocation={sourceLocation}
            destination={destinationLocation}
            routeCoordinates={routeCoordinates} 
            style={styles.mapView}
            onSourceLocationChange={handleSourceLocationChange}
            onDestinationLocationChange={handleDestinationLocationChange}
            onCustomMarkerPress={handleMarkerPress}
            isLoading={isLoading}
          />
          <Text style={styles.simulationNotice}>
            Simulated Map View (Intentional)
          </Text>
          <View style={styles.mapOverlay}>
            <TouchableOpacity 
              style={styles.currentLocationButton}
              onPress={() => {
                // Simulated location update
                const simulatedLocation = {
                  latitude: 23.8103 + (Math.random() * 0.02 - 0.01),
                  longitude: 90.4125 + (Math.random() * 0.02 - 0.01)
                };
                setSourceLocation(simulatedLocation);
                setCurrentLocation('Current Location (Simulated)');
              }}
            >
              <Ionicons name="locate" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          {/* Route info overlay */}
          {routeInfo && destinationLocation && (
            <View style={styles.routeInfoOverlay}>
              <View style={styles.routeInfoContainer}>
                <Text style={styles.routeInfoText}>
                  <Ionicons name="time-outline" size={16} color={COLORS.black} /> {routeInfo.duration}
                  {' • '}
                  <Ionicons name="navigate-outline" size={16} color={COLORS.black} /> {routeInfo.distance}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Add profile button to the map overlay */}
        <View style={styles.profileButtonOverlay}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Where are you going?</Text>
          
          <TouchableOpacity 
            style={styles.locationInput}
            onPress={handleOpenSearch}
          >
            <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.locationInputText}>
              {destinationLocation 
                ? 'Destination selected. Tap to search or edit' 
                : 'Search for a destination'}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, !destinationLocation && styles.disabledButton]}
              onPress={handleBookRide}
              disabled={!destinationLocation}
            >
              <Ionicons name="car-outline" size={24} color={COLORS.white} />
              <Text style={styles.buttonText}>Book Ride</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]}
              onPress={handleScheduleRide}
            >
              <Ionicons name="calendar-outline" size={24} color={COLORS.black} />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>Schedule</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Destinations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Destinations</Text>
          <FlatList
            data={recentRides}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentRidesContainer}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.recentRideItem}
                onPress={() => handleRecentLocationSelect(item)}
              >
                <View style={styles.recentRideIconContainer}>
                  <Ionicons name={item.icon} size={20} color={COLORS.black} />
                </View>
                <View>
                  <Text style={styles.recentRideTitle}>{item.location}</Text>
                  <Text style={styles.recentRideAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Suggested Rides Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suggested Rides</Text>
          {suggestedRides.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.suggestedRideItem}
              onPress={() => handleRideOptionSelect(item.name)}
            >
              <View style={styles.suggestedRideIconContainer}>
                <Ionicons name={item.icon} size={24} color={COLORS.black} />
              </View>
              <View style={styles.suggestedRideInfo}>
                <Text style={styles.suggestedRideName}>{item.name}</Text>
                <Text style={styles.suggestedRideTime}>{item.time}</Text>
              </View>
              <Text style={styles.suggestedRidePrice}>{item.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* High Demand Areas */}
        <TouchableOpacity 
          style={styles.highDemandButton}
          onPress={handleViewHighDemand}
        >
          <Ionicons name="flame-outline" size={20} color={COLORS.error} />
          <Text style={styles.highDemandText}>View high demand areas</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.text} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  staticMapFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.paleLavender,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapFallbackText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '500',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  currentLocationButton: {
    backgroundColor: COLORS.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  routeInfoOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  routeInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  routeInfoText: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    margin: SIZES.padding,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 16,
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    padding: 12,
    marginBottom: 20,
  },
  locationInputText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 0.48,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: COLORS.black,
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
  },
  recentRidesContainer: {
    paddingVertical: 8,
  },
  recentRideItem: {
    backgroundColor: COLORS.white,
    marginRight: 12,
    padding: 12,
    borderRadius: SIZES.radius - 4,
    width: 180,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentRideIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentRideTitle: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  recentRideAddress: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  suggestedRideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius - 4,
    padding: 16,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  suggestedRideIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  suggestedRideInfo: {
    flex: 1,
  },
  suggestedRideName: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  suggestedRideTime: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  suggestedRidePrice: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  highDemandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SIZES.padding,
    marginBottom: 30,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius - 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
  },
  highDemandText: {
    ...FONTS.body3,
    color: COLORS.text,
    flex: 1,
    marginLeft: 12,
  },
  mapView: {
    width: '100%',
    height: '100%',
  },
  disabledButton: {
    backgroundColor: COLORS.inactive || '#CCCCCC',
  },
  simulationNotice: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 4,
    zIndex: 1000,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  profileButtonOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default HomeScreen; 