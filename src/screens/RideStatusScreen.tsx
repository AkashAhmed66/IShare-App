import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

// Mock driver data
const driverData = {
  id: 'driver1',
  name: 'Michael Johnson',
  rating: 4.8,
  photo: 'https://randomuser.me/api/portraits/men/32.jpg',
  car: {
    model: 'Toyota Camry',
    color: 'Silver',
    plate: 'ABC 123',
  },
};

const RideStatusScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { rideOption, scheduledTime, paymentMethod } = route.params || {};

  const [rideStatus, setRideStatus] = useState('searching');
  const [estimatedTime, setEstimatedTime] = useState(5);
  const [rideStarted, setRideStarted] = useState(false);
  
  // For demo purposes, simulate ride status changes
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setRideStatus('driverFound');
      setEstimatedTime(3);
    }, 3000);
    
    const timer2 = setTimeout(() => {
      setRideStatus('arriving');
      setEstimatedTime(1);
    }, 6000);
    
    const timer3 = setTimeout(() => {
      setRideStatus('arrived');
      setEstimatedTime(0);
    }, 9000);
    
    const timer4 = setTimeout(() => {
      setRideStarted(true);
      setRideStatus('inProgress');
    }, 12000);
    
    const timer5 = setTimeout(() => {
      setRideStatus('completing');
    }, 18000);
    
    // Cleanup timers
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);
  
  const handleCall = () => {
    // In a real app, this would initiate a phone call
    console.log('Calling driver...');
  };
  
  const handleMessage = () => {
    // In a real app, this would open a messaging interface
    console.log('Messaging driver...');
  };
  
  const handleCancel = () => {
    // Show confirmation dialog in a real app
    navigation.goBack();
  };
  
  const handleComplete = () => {
    // In a real app, would show payment confirmation and rating
    navigation.navigate('HomeScreen');
  };
  
  const formattedTime = scheduledTime
    ? new Date(scheduledTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Now';

  // Mock pickup and dropoff locations for this demo
  const pickup = {
    name: 'Current Location',
    address: '123 Main St, Anytown, USA',
  };

  const dropoff = {
    name: 'Central Mall',
    address: '456 Shopping Ave, Anytown, USA',
  };

  const renderStatusMessage = () => {
    switch (rideStatus) {
      case 'searching':
        return 'Finding you a driver...';
      case 'driverFound':
        return 'Driver is on the way';
      case 'arriving':
        return 'Your driver is arriving soon';
      case 'arrived':
        return 'Your driver has arrived';
      case 'inProgress':
        return 'Enjoy your ride';
      case 'completing':
        return 'Arriving at destination';
      default:
        return 'Finding you a driver...';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapPreview}>
          {/* This would typically be a MapView component */}
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={60} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>Live Map</Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusIconContainer}>
            <Ionicons 
              name={
                rideStatus === 'searching' ? 'search-outline' :
                rideStatus === 'driverFound' ? 'car-outline' :
                rideStatus === 'arriving' || rideStatus === 'arrived' ? 'navigate-outline' :
                rideStatus === 'inProgress' ? 'map-outline' :
                'checkmark-circle-outline'
              } 
              size={24} 
              color={COLORS.white} 
            />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>{renderStatusMessage()}</Text>
            {rideStatus !== 'arrived' && rideStatus !== 'inProgress' && rideStatus !== 'completing' && (
              <Text style={styles.statusSubtitle}>
                {estimatedTime} {estimatedTime === 1 ? 'minute' : 'minutes'} away
              </Text>
            )}
          </View>
        </View>

        {rideStatus !== 'searching' && (
          <View style={styles.card}>
            <View style={styles.driverInfoContainer}>
              <Image 
                source={{ uri: driverData.photo }} 
                style={styles.driverPhoto}
                defaultSource={require('../assets/default-avatar.png')} // Fallback image
              />
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{driverData.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFC043" />
                  <Text style={styles.ratingText}>{driverData.rating}</Text>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
                  <Ionicons name="chatbubble-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                  <Ionicons name="call-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.carInfoContainer}>
              <Ionicons name="car-outline" size={20} color={COLORS.text} />
              <Text style={styles.carInfoText}>
                {driverData.car.model} • {driverData.car.color} • {driverData.car.plate}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.locationContainer}>
            <View style={styles.locationIcons}>
              <View style={styles.pickupIcon}>
                <Ionicons name="navigate" size={16} color={COLORS.primary} />
              </View>
              <View style={styles.dashedLine} />
              <View style={styles.dropoffIcon}>
                <Ionicons name="location" size={16} color={COLORS.error} />
              </View>
            </View>
            
            <View style={styles.locationDetails}>
              <View style={styles.locationItem}>
                <Text style={styles.locationName}>{pickup.name}</Text>
                <Text style={styles.locationAddress}>{pickup.address}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.locationItem}>
                <Text style={styles.locationName}>{dropoff.name}</Text>
                <Text style={styles.locationAddress}>{dropoff.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {rideOption && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Ride Details</Text>
            <View style={styles.rideOptionRow}>
              <View style={styles.rideOptionIconContainer}>
                <Ionicons
                  name={rideOption.icon}
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.rideOptionInfo}>
                <Text style={styles.rideOptionName}>{rideOption.name}</Text>
                <Text style={styles.rideOptionPrice}>
                  ${rideOption.price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentBadgeText}>{paymentMethod}</Text>
              </View>
            </View>
          </View>
        )}

        {rideStatus === 'completing' ? (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>Complete Ride</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
  },
  mapPreview: {
    height: 200,
    marginBottom: 16,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  mapPlaceholder: {
    height: '100%',
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  statusSubtitle: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  driverInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  carInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius - 4,
    padding: 12,
  },
  carInfoText: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: 8,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
  },
  locationIcons: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  pickupIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedLine: {
    height: 40,
    width: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 4,
    marginLeft: 11.5,
  },
  dropoffIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationDetails: {
    flex: 1,
  },
  locationItem: {
    marginBottom: 8,
  },
  locationName: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  locationAddress: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  rideOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rideOptionInfo: {
    flex: 1,
  },
  rideOptionName: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  rideOptionPrice: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  paymentBadge: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.radius - 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  paymentBadgeText: {
    ...FONTS.body5,
    color: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: SIZES.radius - 4,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelButtonText: {
    ...FONTS.body3,
    color: COLORS.error,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  completeButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default RideStatusScreen; 