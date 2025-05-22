import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import MapsService from '../services/mapsService';

// Mock saved locations - keep these as they could represent user's saved places
const mockSavedLocations = [
  { id: 'home', name: 'Home', address: '123 Home St, Anytown', isSaved: true },
  { id: 'work', name: 'Work', address: '456 Office Blvd, Anytown', isSaved: true },
  { id: 'saved1', name: 'Gym', address: '789 Fitness Ave, Anytown', isSaved: true },
  { id: 'saved2', name: 'Grocery Store', address: '101 Food St, Anytown', isSaved: true },
];

const LocationSearchScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [apiKeyStatus, setApiKeyStatus] = useState<{valid: boolean, message: string} | null>(null);
  
  // Get the current location and location type from route params
  const currentLocation = route.params?.currentLocation || { latitude: 23.8103, longitude: 90.4125 };
  const locationType = route.params?.locationType || 'destination';

  // Test API key on component mount
  useEffect(() => {
    const testApiKey = async () => {
      try {
        const result = await MapsService.testGoogleMapsApiKey();
        console.log('API key test result:', result);
        
        if (!result.valid) {
          let message = `Google Maps API Key Error: ${result.status} - ${result.error_message}`;
          
          // Add specific guidance for REQUEST_DENIED
          if (result.status === 'REQUEST_DENIED') {
            message += '\n\nREQUEST_DENIED usually means your API key has restrictions or is invalid. Common causes include:';
            message += '\n- API key restrictions (IP, referrer, or Android app)';
            message += '\n- Missing API enabling (Places API, Directions API, etc.)';
            message += '\n- Billing issues on your Google Cloud account';
          }
          
          setApiKeyStatus({
            valid: false,
            message: message
          });
        } else {
          setApiKeyStatus({
            valid: true,
            message: 'Google Maps API Key is valid'
          });
        }
      } catch (error) {
        console.error('Failed to test API key:', error);
        setApiKeyStatus({
          valid: false,
          message: `Failed to test API key: ${error.message}`
        });
      }
    };

    testApiKey();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Only search if query is at least 2 characters
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Set up debounce to avoid too many API calls
    const debounceTimer = setTimeout(async () => {
      try {
        // Use the Maps Service to get locations
        const results = await MapsService.searchPlaces(searchQuery, currentLocation);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching places:', error);
        // If we get an API error, wait a moment before allowing more requests
        // This helps with rate limits and network issues
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Keep the UI functional even if the API fails
        setSearchResults([]);
        // Don't show an alert as it can be disruptive to the user experience
      } finally {
        setIsSearching(false);
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    // Debug: Log search results whenever they change
    if (searchResults.length > 0) {
      console.log('Search results:', searchResults.length, 'items');
      console.log('First result sample:', searchResults[0]);
    }
  }, [searchResults]);

  const handleLocationSelect = (location: any) => {
    // Make sure we have valid coordinates before returning to the previous screen
    if (!location.coordinates || !location.coordinates.latitude || !location.coordinates.longitude) {
      console.error('Selected location has invalid coordinates:', location);
      return;
    }

    console.log('Selected location with coordinates:', location);
    
    // Return the selected location to the previous screen
    navigation.navigate({
      name: route.params?.returnScreen || 'Home',
      params: {
        selectedLocation: {
          ...location,
          // Ensure coordinates are in the correct format
          coordinates: {
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude
          }
        },
        locationType: locationType,
      },
      merge: true,
    });
  };

  const renderLocationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIconContainer}>
        <Ionicons 
          name={item.isSaved ? 'star' : (item.types && item.types.includes('point_of_interest') ? 'business-outline' : 'location-outline')} 
          size={20} 
          color={item.isSaved ? COLORS.warning : COLORS.primary} 
        />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationAddress}>{item.address}</Text>
        {item.coordinates && (
          <Text style={styles.locationCoordinates}>
            {item.coordinates.latitude.toFixed(6)}, {item.coordinates.longitude.toFixed(6)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSavedLocations = () => (
    <>
      <Text style={styles.sectionTitle}>Saved Places</Text>
      {mockSavedLocations.map(location => (
        <TouchableOpacity
          key={location.id}
          style={styles.locationItem}
          onPress={() => handleLocationSelect({
            id: location.id,
            name: location.name,
            address: location.address,
            coordinates: {
              // You would typically have real coordinates for saved locations
              // These are placeholder values
              latitude: 23.8103 + parseFloat(`0.0${location.id.charCodeAt(0) % 10}`),
              longitude: 90.4125 + parseFloat(`0.0${location.id.charCodeAt(0) % 10}`)
            }
          })}
        >
          <View style={[styles.locationIconContainer, styles.savedIconContainer]}>
            <Ionicons 
              name={location.id === 'home' ? 'home' : location.id === 'work' ? 'briefcase' : 'star'} 
              size={20} 
              color={COLORS.primary} 
            />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{location.name}</Text>
            <Text style={styles.locationAddress}>{location.address}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={locationType === 'source' ? "Search pickup location" : "Where to?"}
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Display API key status if there's an error */}
      {apiKeyStatus && !apiKeyStatus.valid && (
        <View style={styles.apiErrorContainer}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          <View style={styles.apiErrorTextContainer}>
            {apiKeyStatus.message.split('\n').map((line, index) => (
              <Text 
                key={index} 
                style={[
                  styles.apiErrorText, 
                  index > 0 && styles.apiErrorHint,
                  line.startsWith('-') && styles.apiErrorBullet
                ]}
              >
                {line}
              </Text>
            ))}
            <Text style={[styles.apiErrorHint, styles.apiErrorImportant]}>
              Try regenerating your Google Maps API key and enabling the necessary APIs.
            </Text>
          </View>
        </View>
      )}

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : searchQuery.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderLocationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {isSearching ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
              ) : searchQuery.trim().length < 2 ? (
                <View>
                  <Ionicons name="search" size={40} color={COLORS.textSecondary} style={styles.emptyIcon} />
                  <Text style={styles.emptyText}>Type at least 2 characters to search</Text>
                </View>
              ) : (
                <View>
                  <Ionicons name="location-outline" size={40} color={COLORS.textSecondary} style={styles.emptyIcon} />
                  <Text style={styles.emptyText}>No results found</Text>
                  <Text style={styles.emptySubtext}>Try a different search term or location</Text>
                </View>
              )}
            </View>
          }
        />
      ) : (
        <View style={styles.savedLocationsContainer}>{renderSavedLocations()}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius - 4,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...SHADOWS.light,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    ...FONTS.body3,
    color: COLORS.text,
  },
  listContent: {
    padding: 16,
  },
  savedLocationsContainer: {
    padding: 16,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  savedIconContainer: {
    backgroundColor: COLORS.primaryLight,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  locationAddress: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  locationCoordinates: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  emptyIcon: {
    marginBottom: 10,
  },
  emptySubtext: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  apiErrorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    margin: 16,
    backgroundColor: COLORS.errorLight || '#FFEBEE',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: SIZES.radius - 4,
  },
  apiErrorTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  apiErrorText: {
    ...FONTS.body3,
    color: COLORS.error,
    marginBottom: 10,
  },
  apiErrorHint: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  apiErrorBullet: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginLeft: 20,
  },
  apiErrorImportant: {
    ...FONTS.body3,
    color: COLORS.error,
    fontWeight: 'bold',
  },
});

export default LocationSearchScreen; 