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
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

// Mock location data
const mockLocations = [
  { id: '1', name: 'Central Mall', address: '123 Shopping Ave, Anytown', isSaved: false },
  { id: '2', name: 'Downtown Park', address: '456 Nature St, Anytown', isSaved: false },
  { id: '3', name: 'City Hospital', address: '789 Health Blvd, Anytown', isSaved: false },
  { id: '4', name: 'Grand Hotel', address: '101 Luxury Ln, Anytown', isSaved: false },
  { id: '5', name: 'Train Station', address: '202 Transit Rd, Anytown', isSaved: false },
  { id: '6', name: 'University Campus', address: '303 Education Dr, Anytown', isSaved: false },
  { id: '7', name: 'Sport Stadium', address: '404 Game St, Anytown', isSaved: false },
  { id: '8', name: 'Conference Center', address: '505 Meeting Blvd, Anytown', isSaved: false },
];

// Mock saved locations
const mockSavedLocations = [
  { id: 'home', name: 'Home', address: '123 Home St, Anytown', isSaved: true },
  { id: 'work', name: 'Work', address: '456 Office Blvd, Anytown', isSaved: true },
  { id: 'saved1', name: 'Gym', address: '789 Fitness Ave, Anytown', isSaved: true },
  { id: 'saved2', name: 'Grocery Store', address: '101 Food St, Anytown', isSaved: true },
];

const LocationSearchScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API call delay
    const timeoutId = setTimeout(() => {
      const filteredResults = mockLocations.filter(
        location => 
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (location: any) => {
    // In a real app, would set selected location in redux
    navigation.goBack();
  };

  const renderLocationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIconContainer}>
        <Ionicons 
          name={item.isSaved ? 'star' : 'location-outline'} 
          size={20} 
          color={item.isSaved ? COLORS.warning : COLORS.primary} 
        />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationAddress}>{item.address}</Text>
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
          onPress={() => handleLocationSelect(location)}
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
          placeholder="Where to?"
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
              <Text style={styles.emptyText}>No results found</Text>
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
});

export default LocationSearchScreen; 