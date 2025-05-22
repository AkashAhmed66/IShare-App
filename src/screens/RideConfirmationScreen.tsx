import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { socketService } from '../services/socketService';
import { useSelector } from 'react-redux';

const RideConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { rideOption, scheduledTime, pickupLocation, dropoffLocation } = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [rideId, setRideId] = useState<string | null>(null);
  
  // Get user ID from authentication state
  const { user } = useSelector((state: any) => state.auth);
  
  // Effect to check socket connection
  useEffect(() => {
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
      
      if (!connected && user?.id) {
        console.log('Socket not connected, attempting to connect...');
        socketService.initialize(user.id);
        socketService.authenticateUser(user.id, 'passenger');
      }
    };
    
    checkConnection();
    
    // Check connection periodically
    const interval = setInterval(checkConnection, 5000);
    
    return () => clearInterval(interval);
  }, [user]);

  // Handle ride confirmation
  const handleConfirm = () => {
    if (!isConnected) {
      Alert.alert(
        'Connection Error',
        'Not connected to the server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (!pickupLocation || !dropoffLocation) {
      Alert.alert(
        'Error',
        'Please select both pickup and dropoff locations',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsConfirming(true);
    
    // Calculate distance using haversine formula (straight line)
    const distance = calculateDistance(
      pickupLocation.latitude,
      pickupLocation.longitude,
      dropoffLocation.latitude,
      dropoffLocation.longitude
    );
    
    // Calculate estimated price based on distance (20 taka per km)
    const estimatedPrice = Math.round(distance * 20);
    
    // Prepare ride details
    const rideDetails = {
      pickupLocation,
      dropoffLocation,
      rideType: rideOption?.type || 'standard',
      estimatedDistance: distance,
      estimatedDuration: Math.round(distance * 3), // Rough estimate: 20 km/h = 3 min/km
      estimatedPrice,
      paymentMethod,
      scheduledTime: scheduledTime || null,
      isScheduled: !!scheduledTime
    };
    
    console.log('Sending ride request with details:', rideDetails);
    
    // Send ride request via WebSocket
    socketService.sendRideRequest(rideDetails);
    
    // Listen for ride request confirmation
    const rideRequestListener = (data: any) => {
      console.log('Received ride request confirmation:', data);
      setRideId(data.rideId);
      setIsConfirming(false);
      
      // Navigate to ride status screen
      navigation.navigate('RideStatus', {
        rideId: data.rideId,
        rideOption: {
          ...rideOption,
          price: data.estimatedPrice
        },
        scheduledTime,
        paymentMethod,
        pickupLocation,
        dropoffLocation,
        estimatedDistance: data.estimatedDistance,
        currency: data.currency || 'BDT'
      });
      
      // Remove listener after use
      socketService.socket?.off('ride_request_received', rideRequestListener);
    };
    
    // Listen for errors
    const errorListener = (data: any) => {
      console.error('Ride request error:', data);
      setIsConfirming(false);
      
      Alert.alert(
        'Request Failed',
        data.message || 'Failed to request ride. Please try again.',
        [{ text: 'OK' }]
      );
      
      // Remove listener after use
      socketService.socket?.off('ride_request_error', errorListener);
    };
    
    // Add temporary listeners
    socketService.socket?.on('ride_request_received', rideRequestListener);
    socketService.socket?.on('ride_request_error', errorListener);
    
    // Set timeout to prevent indefinite loading
    setTimeout(() => {
      if (isConfirming) {
        setIsConfirming(false);
        Alert.alert(
          'Request Timeout',
          'The server took too long to respond. Please try again.',
          [{ text: 'OK' }]
        );
        socketService.socket?.off('ride_request_received', rideRequestListener);
        socketService.socket?.off('ride_request_error', errorListener);
      }
    }, 15000);
  };

  // Calculate distance between two coordinates in kilometers (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Convert degrees to radians
  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapPreview}>
          {/* This would typically be a MapView component */}
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={60} color={COLORS.primary} />
            <Text style={styles.mapPlaceholderText}>Map Preview</Text>
          </View>
        </View>

        {!isConnected && (
          <View style={styles.connectionWarning}>
            <Ionicons name="wifi" size={20} color={COLORS.error} />
            <Text style={styles.connectionWarningText}>
              Not connected to server. Checking connection...
            </Text>
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
                <Text style={styles.locationName}>
                  {pickupLocation?.name || 'Current Location'}
                </Text>
                <Text style={styles.locationAddress}>
                  {pickupLocation?.address || 'Loading address...'}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.locationItem}>
                <Text style={styles.locationName}>
                  {dropoffLocation?.name || 'Destination'}
                </Text>
                <Text style={styles.locationAddress}>
                  {dropoffLocation?.address || 'Loading address...'}
                </Text>
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
                  name={rideOption.icon || 'car-outline'}
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.rideOptionInfo}>
                <Text style={styles.rideOptionName}>{rideOption.name}</Text>
                <Text style={styles.rideOptionDescription}>
                  {rideOption.description || 'Standard ride'}
                </Text>
              </View>
              <Text style={styles.rideOptionPrice}>
                {pickupLocation && dropoffLocation ? (
                  `${Math.round(calculateDistance(
                    pickupLocation.latitude,
                    pickupLocation.longitude,
                    dropoffLocation.latitude,
                    dropoffLocation.longitude
                  ) * 20)} BDT`
                ) : (
                  rideOption.price ? `${rideOption.price.toFixed(2)} BDT` : 'Calculating...'
                )}
              </Text>
            </View>
            
            <View style={styles.rideDetailRow}>
              <Ionicons name="time-outline" size={20} color={COLORS.text} />
              <Text style={styles.rideDetailText}>Pickup time:</Text>
              <Text style={styles.rideDetailValue}>{formattedTime}</Text>
            </View>
            
            <View style={styles.rideDetailRow}>
              <Ionicons name="cash-outline" size={20} color={COLORS.text} />
              <Text style={styles.rideDetailText}>Payment:</Text>
              <TouchableOpacity 
                style={styles.paymentSelector}
                onPress={() => navigation.navigate('Payment')}
              >
                <Text style={styles.paymentText}>{paymentMethod}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[
            styles.confirmButton, 
            (isConfirming || !isConnected) && styles.disabledButton
          ]}
          onPress={handleConfirm}
          disabled={isConfirming || !isConnected}
        >
          {isConfirming ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.confirmButtonText}>Finding Drivers...</Text>
            </View>
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Ride</Text>
          )}
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
  scrollContent: {
    padding: SIZES.padding,
  },
  mapPreview: {
    height: 150,
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
  connectionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: 10,
    borderRadius: SIZES.radius,
    marginBottom: 16,
  },
  connectionWarningText: {
    ...FONTS.body4,
    color: COLORS.error,
    marginLeft: 8,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOWS.light,
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
    marginBottom: 16,
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
  rideOptionDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  rideOptionPrice: {
    ...FONTS.h4,
    color: COLORS.primary,
  },
  rideDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rideDetailText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  rideDetailValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
  },
  paymentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
  },
  confirmButtonText: {
    ...FONTS.body2,
    color: COLORS.white,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RideConfirmationScreen; 