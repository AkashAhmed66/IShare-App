import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import EmptyState from '../components/EmptyState';

// Mock ride history data
const mockRideHistory = [
  {
    id: '1',
    date: '2023-10-15T14:30:00',
    pickup: '123 Main St, Anytown',
    dropoff: 'Central Mall, Anytown',
    price: 15.75,
    status: 'completed',
    rideType: 'Standard',
  },
  {
    id: '2',
    date: '2023-10-12T09:15:00',
    pickup: 'Home',
    dropoff: 'Work',
    price: 12.50,
    status: 'completed',
    rideType: 'Standard',
  },
  {
    id: '3',
    date: '2023-10-10T18:45:00',
    pickup: 'Restaurant, Anytown',
    dropoff: 'Home',
    price: 18.25,
    status: 'completed',
    rideType: 'Premium',
  },
  {
    id: '4',
    date: '2023-10-05T10:00:00',
    pickup: 'Work',
    dropoff: 'Conference Center',
    price: 22.00,
    status: 'completed',
    rideType: 'XL',
  },
];

const RideHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [rideHistory, setRideHistory] = useState(mockRideHistory);
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'completed', 'cancelled'

  const filteredRides = filterActive === 'all' 
    ? rideHistory 
    : rideHistory.filter(ride => ride.status === filterActive);

  const handleRidePress = (ride: any) => {
    // In a real app, would navigate to ride details
    console.log('Ride selected:', ride.id);
  };

  const renderRideItem = ({ item }: { item: any }) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity 
        style={styles.rideItem}
        onPress={() => handleRidePress(item)}
      >
        <View style={styles.rideHeader}>
          <View style={styles.rideTypeContainer}>
            <Ionicons 
              name={item.rideType === 'XL' ? 'car-sport-outline' : 'car-outline'} 
              size={16} 
              color={COLORS.primary} 
            />
            <Text style={styles.rideType}>{item.rideType}</Text>
          </View>
          <Text style={styles.ridePrice}>${item.price.toFixed(2)}</Text>
        </View>
        
        <View style={styles.rideDateTime}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.rideDate}>{formattedDate} at {formattedTime}</Text>
        </View>
        
        <View style={styles.rideLocations}>
          <View style={styles.locationIcons}>
            <View style={styles.pickupIcon}>
              <Ionicons name="navigate" size={12} color={COLORS.primary} />
            </View>
            <View style={styles.dashedLine} />
            <View style={styles.dropoffIcon}>
              <Ionicons name="location" size={12} color={COLORS.error} />
            </View>
          </View>
          
          <View style={styles.locationTexts}>
            <Text style={styles.locationText} numberOfLines={1}>{item.pickup}</Text>
            <Text style={styles.locationText} numberOfLines={1}>{item.dropoff}</Text>
          </View>
        </View>

        <View style={styles.rideFooter}>
          <View style={[
            styles.statusBadge, 
            item.status === 'cancelled' ? styles.cancelledBadge : styles.completedBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'cancelled' ? styles.cancelledText : styles.completedText
            ]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="car"
      message="You haven't taken any rides yet"
      actionText="Book a Ride"
      onAction={() => navigation.navigate('Ride')}
    />
  );

  const clearHistory = () => {
    setRideHistory([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {rideHistory.length > 0 ? (
        <>
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[styles.filterButton, filterActive === 'all' && styles.activeFilter]}
              onPress={() => setFilterActive('all')}
            >
              <Text style={[styles.filterText, filterActive === 'all' && styles.activeFilterText]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filterActive === 'completed' && styles.activeFilter]}
              onPress={() => setFilterActive('completed')}
            >
              <Text style={[styles.filterText, filterActive === 'completed' && styles.activeFilterText]}>
                Completed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.filterButton, filterActive === 'cancelled' && styles.activeFilter]}
              onPress={() => setFilterActive('cancelled')}
            >
              <Text style={[styles.filterText, filterActive === 'cancelled' && styles.activeFilterText]}>
                Cancelled
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredRides}
            renderItem={renderRideItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No rides match the selected filter</Text>
              </View>
            }
          />

          <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
            <Text style={styles.clearButtonText}>Clear History</Text>
          </TouchableOpacity>
        </>
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius - 4,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: COLORS.primaryLight,
  },
  filterText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // To allow space for the clear button
  },
  rideItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideType: {
    ...FONTS.body4,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 6,
  },
  ridePrice: {
    ...FONTS.h4,
    color: COLORS.primary,
  },
  rideDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideDate: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  rideLocations: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  locationIcons: {
    width: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  pickupIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    height: 20,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 2,
    marginLeft: 7.5,
  },
  dropoffIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTexts: {
    flex: 1,
    justifyContent: 'space-between',
    height: 40,
  },
  locationText: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius - 8,
  },
  completedBadge: {
    backgroundColor: 'rgba(5, 148, 79, 0.1)',
  },
  cancelledBadge: {
    backgroundColor: 'rgba(225, 25, 0, 0.1)',
  },
  statusText: {
    ...FONTS.body5,
    fontWeight: '500',
  },
  completedText: {
    color: COLORS.success,
  },
  cancelledText: {
    color: COLORS.error,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  clearButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 16,
    borderRadius: SIZES.radius - 4,
    alignItems: 'center',
  },
  clearButtonText: {
    ...FONTS.body3,
    color: COLORS.error,
    fontWeight: '600',
  },
});

export default RideHistoryScreen; 