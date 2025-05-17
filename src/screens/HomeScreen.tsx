import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomMapView from '../components/MapView';

// Mock data for recent rides
const recentRides = [
  { id: '1', location: 'Home', address: '123 Main Street', icon: 'home-outline', coordinates: {latitude: 23.8103, longitude: 90.4125} },
  { id: '2', location: 'Work', address: '456 Office Park', icon: 'briefcase-outline', coordinates: {latitude: 23.8203, longitude: 90.4225} },
  { id: '3', location: 'Shopping Mall', address: '789 Market Street', icon: 'cart-outline', coordinates: {latitude: 23.8150, longitude: 90.4050} },
];

// Mock location suggestions for search
const locationSuggestions = [
  { id: '1', name: 'Airport', address: 'International Airport', coordinates: {latitude: 23.8423, longitude: 90.4027} },
  { id: '2', name: 'Central Park', address: 'City Center', coordinates: {latitude: 23.8103, longitude: 90.4325} },
  { id: '3', name: 'University', address: 'University Campus', coordinates: {latitude: 23.7903, longitude: 90.4125} },
  { id: '4', name: 'Hospital', address: 'General Hospital', coordinates: {latitude: 23.8203, longitude: 90.3925} },
  { id: '5', name: 'Train Station', address: 'Central Station', coordinates: {latitude: 23.8003, longitude: 90.4225} },
];

// Mock data for suggested rides
const suggestedRides = [
  { id: '1', name: 'Standard', price: '$10-15', time: '5 min', icon: 'car-outline' },
  { id: '2', name: 'Comfort', price: '$15-20', time: '8 min', icon: 'car-sport-outline' },
  { id: '3', name: 'XL', price: '$20-25', time: '10 min', icon: 'car-outline' },
];

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Current Location');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState(locationSuggestions);
  const [editingMarker, setEditingMarker] = useState<'source' | 'destination' | null>(null);

  // Source and destination location state variables - using default values
  const [sourceLocation, setSourceLocation] = useState({
    latitude: 23.8103,
    longitude: 90.4125,
  });
  
  const [destinationLocation, setDestinationLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const searchInputRef = useRef<TextInput>(null);

  // Filter locations based on search query
  React.useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = locationSuggestions.filter(
        location => 
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locationSuggestions);
    }
  }, [searchQuery]);

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
              setEditingMarker('source');
              setShowSearchModal(true);
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
              setEditingMarker('destination');
              setShowSearchModal(true);
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleLocationSelect = (item: any) => {
    if (editingMarker === 'source') {
      setSourceLocation(item.coordinates);
      setCurrentLocation(item.name);
    } else {
      setDestinationLocation(item.coordinates);
    }
    setShowSearchModal(false);
    setSearchQuery('');
    setEditingMarker(null);
  };

  const handleRecentLocationSelect = (item: any) => {
    setDestinationLocation(item.coordinates);
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
    setShowSearchModal(true);
    setEditingMarker('destination');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <CustomMapView
            currentLocation={sourceLocation}
            destination={destinationLocation}
            style={styles.mapView}
            onSourceLocationChange={handleSourceLocationChange}
            onDestinationLocationChange={handleDestinationLocationChange}
            onCustomMarkerPress={handleMarkerPress}
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

      {/* Search Location Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.searchHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                setShowSearchModal(false);
                setSearchQuery('');
              }}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.black} />
            </TouchableOpacity>
            
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={editingMarker === 'source' ? "Search for pickup location" : "Search for destination"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchResultItem}
                onPress={() => handleLocationSelect(item)}
              >
                <View style={styles.searchLocationIcon}>
                  <Ionicons 
                    name={editingMarker === 'source' ? "location-outline" : "flag-outline"} 
                    size={20} 
                    color={editingMarker === 'source' ? "#4285F4" : "#EA4335"} 
                  />
                </View>
                <View>
                  <Text style={styles.searchLocationName}>{item.name}</Text>
                  <Text style={styles.searchLocationAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              isLoading ? (
                <View style={styles.loadingSearchResults}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Searching locations...</Text>
                </View>
              ) : (
                <View style={styles.emptySearchResults}>
                  <Text style={styles.emptySearchText}>No locations found</Text>
                </View>
              )
            }
          />
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchLocationName: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  searchLocationAddress: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  loadingSearchResults: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  emptySearchResults: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
  },
  emptySearchText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
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