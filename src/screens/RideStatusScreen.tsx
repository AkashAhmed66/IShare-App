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

// Default driver data (will be replaced by real data from server)
const defaultDriverData = {
  id: '',
  name: 'Finding Driver...',
  rating: 0,
  photo: '',
  car: {
    model: '',
    color: '',
    plate: '',
  },
};

const RideStatusScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { 
    rideId, 
    rideOption, 
    scheduledTime, 
    paymentMethod,
    pickupLocation, 
    dropoffLocation 
  } = route.params || {};

  const [rideStatus, setRideStatus] = useState('searching');
  const [estimatedTime, setEstimatedTime] = useState(5);
  const [rideStarted, setRideStarted] = useState(false);
  const [driverData, setDriverData] = useState(defaultDriverData);
  const [driverLocation, setDriverLocation] = useState(null);
  const [fare, setFare] = useState(rideOption?.price || 0);
  const [isConnected, setIsConnected] = useState(false);
  
  // Get user from redux state
  const { user } = useSelector((state: any) => state.auth);
  
  // Effect to check socket connection and set up event listeners
  useEffect(() => {
    // Check connection and authenticate if needed
    const checkConnection = () => {
      const connected = socketService.isConnected();
      setIsConnected(connected);
      
      if (!connected && user?.id) {
        console.log('[RideStatus] Socket not connected, attempting to connect...');
        socketService.initialize(user.id);
        socketService.authenticateUser(user.id, 'passenger');
      }
    };
    
    checkConnection();
    
    // Set up socket event listeners
    const setupListeners = () => {
      // Listen for driver assigned
      socketService.socket?.on('driver_assigned', handleDriverAssigned);
      
      // Listen for driver accepted
      socketService.socket?.on('driver_accepted', handleDriverAccepted);
      
      // Listen for driver arrived
      socketService.socket?.on('driver_arrived', handleDriverArrived);
      
      // Listen for ride started
      socketService.socket?.on('ride_started', handleRideStarted);
      
      // Listen for ride completed
      socketService.socket?.on('ride_completed', handleRideCompleted);
      
      // Listen for driver location updates
      socketService.socket?.on('driver_location_update', handleDriverLocationUpdate);
      
      // Listen for fare updates
      socketService.socket?.on('fare_update', handleFareUpdate);
      
      // Listen for ride cancellation
      socketService.socket?.on('ride_cancelled', handleRideCancelled);
    };
    
    setupListeners();
    
    // Clean up listeners on unmount
    return () => {
      socketService.socket?.off('driver_assigned', handleDriverAssigned);
      socketService.socket?.off('driver_accepted', handleDriverAccepted);
      socketService.socket?.off('driver_arrived', handleDriverArrived);
      socketService.socket?.off('ride_started', handleRideStarted);
      socketService.socket?.off('ride_completed', handleRideCompleted);
      socketService.socket?.off('driver_location_update', handleDriverLocationUpdate);
      socketService.socket?.off('fare_update', handleFareUpdate);
      socketService.socket?.off('ride_cancelled', handleRideCancelled);
    };
  }, [user?.id, rideId]);
  
  // Event handlers for socket events
  const handleDriverAssigned = (data) => {
    console.log('[RideStatus] Driver assigned:', data);
    if (data.rideId !== rideId) return;
    
    setRideStatus('driverFound');
    setEstimatedTime(parseFloat(data.estimatedArrival) || 5);
    
    // Update driver data
    setDriverData({
      id: data.driverId,
      name: data.driverName || 'Driver',
      rating: data.driverRating || 4.5,
      photo: data.driverPhoto || '',
      car: {
        model: data.vehicleDetails?.model || 'Vehicle',
        color: data.vehicleDetails?.color || 'Unknown',
        plate: data.vehicleDetails?.licensePlate || '',
      },
    });
  };
  
  const handleDriverAccepted = (data) => {
    console.log('[RideStatus] Driver accepted:', data);
    if (data.rideId !== rideId) return;
    
    setRideStatus('driverAccepted');
    setEstimatedTime(3); // Default estimate if not provided
  };
  
  const handleDriverArrived = (data) => {
    console.log('[RideStatus] Driver arrived:', data);
    if (data.rideId !== rideId) return;
    
    setRideStatus('arrived');
    setEstimatedTime(0);
    
    // Play sound or vibrate to alert user
    // Vibration.vibrate();
  };
  
  const handleRideStarted = (data) => {
    console.log('[RideStatus] Ride started:', data);
    if (data.rideId !== rideId) return;
    
    setRideStatus('inProgress');
    setRideStarted(true);
  };
  
  const handleRideCompleted = (data) => {
    console.log('[RideStatus] Ride completed:', data);
    if (data.rideId !== rideId) return;
    
    setRideStatus('completed');
    
    // Update final fare
    if (data.finalFare) {
      setFare(data.finalFare);
    }
    
    // Show completion dialog
    setTimeout(() => {
      Alert.alert(
        'Ride Completed',
        `Your ride has been completed. Final fare: ${data.finalFare} ${data.currency || 'BDT'}`,
        [
          { 
            text: 'Rate Driver', 
            onPress: () => navigation.navigate('HomeScreen', { showRateDialog: true, driverId: data.driverId })
          },
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('HomeScreen')
          }
        ]
      );
    }, 1000);
  };
  
  const handleDriverLocationUpdate = (data) => {
    console.log('[RideStatus] Driver location update:', data);
    if (data.rideId !== rideId) return;
    
    setDriverLocation(data.location);
    
    // If we have both pickup and driver locations, calculate ETA
    if (pickupLocation && data.location && rideStatus !== 'inProgress') {
      const distanceKm = calculateDistance(
        pickupLocation.latitude,
        pickupLocation.longitude,
        data.location.latitude, 
        data.location.longitude
      );
      
      // Rough calculation: 30 km/h average speed = 2 min per km
      const eta = Math.max(1, Math.round(distanceKm * 2));
      setEstimatedTime(eta);
    }
  };
  
  const handleFareUpdate = (data) => {
    console.log('[RideStatus] Fare update:', data);
    if (data.rideId !== rideId) return;
    
    setFare(data.fare);
  };
  
  const handleRideCancelled = (data) => {
    console.log('[RideStatus] Ride cancelled:', data);
    if (data.rideId !== rideId) return;
    
    Alert.alert(
      'Ride Cancelled',
      `Your ride was cancelled by the ${data.cancelledBy}.`,
      [{ text: 'OK', onPress: () => navigation.navigate('HomeScreen') }]
    );
  };
  
  // Calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
  
  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };
  
  // Function to call driver
  const handleCall = () => {
    // In a real app, this would initiate a phone call
    Alert.alert(
      'Call Driver',
      `Call ${driverData.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', style: 'default' }
      ]
    );
  };
  
  // Function to message driver
  const handleMessage = () => {
    // In a real app, this would open a messaging interface
    navigation.navigate('Chat', { recipientId: driverData.id, recipientName: driverData.name });
  };
  
  // Function to cancel ride
  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            if (rideId) {
              socketService.cancelRide(rideId);
              navigation.navigate('HomeScreen');
            }
          }
        }
      ]
    );
  };
  
  // Function to handle ride completion
  const handleComplete = () => {
    // In a real app, this would trigger completion flow
    navigation.navigate('HomeScreen');
  };
  
  // Format scheduled time if available
  const formattedTime = scheduledTime
    ? new Date(scheduledTime).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Now';

  // Helper function to render status message
  const renderStatusMessage = () => {
    switch (rideStatus) {
      case 'searching':
        return 'Finding you a driver...';
      case 'driverFound':
      case 'driverAccepted':
        return 'Driver is on the way';
      case 'arriving':
        return 'Your driver is arriving soon';
      case 'arrived':
        return 'Your driver has arrived';
      case 'inProgress':
        return 'Enjoy your ride';
      case 'completing':
      case 'completed':
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
            {driverLocation && (
              <Text style={styles.driverLocationText}>
                Driver at: {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
              </Text>
            )}
          </View>
        </View>

        {!isConnected && (
          <View style={styles.connectionWarning}>
            <Ionicons name="wifi" size={20} color={COLORS.error} />
            <Text style={styles.connectionWarningText}>
              Not connected to server. Attempting to reconnect...
            </Text>
          </View>
        )}

        <View style={styles.statusContainer}>
          <View style={styles.statusIconContainer}>
            <Ionicons 
              name={
                rideStatus === 'searching' ? 'search-outline' :
                rideStatus === 'driverFound' || rideStatus === 'driverAccepted' ? 'car-outline' :
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
            {(rideStatus === 'driverFound' || rideStatus === 'driverAccepted' || rideStatus === 'arriving') && (
              <Text style={styles.statusSubtitle}>
                {estimatedTime} {estimatedTime === 1 ? 'minute' : 'minutes'} away
              </Text>
            )}
            {rideStatus === 'searching' && (
              <View style={styles.searchingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.statusSubtitle}>Looking for drivers...</Text>
              </View>
            )}
          </View>
        </View>

        {rideStatus !== 'searching' && driverData.id && (
          <View style={styles.card}>
            <View style={styles.driverInfoContainer}>
              {driverData.photo ? (
                <Image 
                  source={{ uri: driverData.photo }} 
                  style={styles.driverPhoto}
                  defaultSource={require('../assets/default-avatar.png')}
                />
              ) : (
                <View style={styles.driverPhotoPlaceholder}>
                  <Ionicons name="person" size={24} color={COLORS.white} />
                </View>
              )}
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{driverData.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFC043" />
                  <Text style={styles.ratingText}>{driverData.rating}</Text>
                </View>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleMessage}
                  disabled={rideStatus === 'searching'}
                >
                  <Ionicons 
                    name="chatbubble-outline" 
                    size={22} 
                    color={rideStatus === 'searching' ? COLORS.textSecondary : COLORS.primary} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={handleCall}
                  disabled={rideStatus === 'searching'}
                >
                  <Ionicons 
                    name="call-outline" 
                    size={22} 
                    color={rideStatus === 'searching' ? COLORS.textSecondary : COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {driverData.car.model && (
              <View style={styles.carInfoContainer}>
                <Ionicons name="car-outline" size={20} color={COLORS.text} />
                <Text style={styles.carInfoText}>
                  {driverData.car.model} • {driverData.car.color} • {driverData.car.plate}
                </Text>
              </View>
            )}
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
                <Text style={styles.rideOptionPrice}>
                  {fare} {rideOption.currency || 'BDT'}
                </Text>
              </View>
              <View style={styles.paymentBadge}>
                <Text style={styles.paymentBadgeText}>{paymentMethod}</Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Bottom buttons for cancellation or completion */}
        {rideStatus !== 'completed' && (
          <TouchableOpacity 
            style={[
              styles.cancelButton,
              (rideStatus === 'inProgress' || !isConnected) && styles.disabledButton
            ]}
            onPress={handleCancel}
            disabled={rideStatus === 'inProgress' || !isConnected}
          >
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}
        
        {rideStatus === 'completed' && (
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={handleComplete}
          >
            <Text style={styles.completeButtonText}>Done</Text>
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
  driverLocationText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  statusContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  statusTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtitle: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  driverPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
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
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  carInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius - 4,
    padding: 12,
  },
  carInfoText: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: 8,
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
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 16,
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
    color: COLORS.primary,
    marginTop: 2,
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius - 4,
  },
  paymentBadgeText: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  cancelButton: {
    backgroundColor: COLORS.errorLight,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    ...FONTS.body3,
    color: COLORS.error,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default RideStatusScreen; 