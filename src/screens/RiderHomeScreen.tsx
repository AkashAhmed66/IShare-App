import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import CustomMapView from '../components/MapView';

// Mock data for ride requests
const rideRequestsData = [
  {
    id: '1',
    passenger: {
      name: 'John Smith',
      rating: 4.8,
      trips: 42,
    },
    pickup: {
      address: '123 Main St',
      coordinates: { latitude: 23.8103, longitude: 90.4125 },
    },
    dropoff: {
      address: '456 Elm St',
      coordinates: { latitude: 23.8203, longitude: 90.4225 },
    },
    estimatedDistance: '3.2 km',
    estimatedDuration: '12 min',
    fare: '$15.50',
    type: 'Standard',
  },
  {
    id: '2',
    passenger: {
      name: 'Emma Johnson',
      rating: 4.9,
      trips: 87,
    },
    pickup: {
      address: '789 Oak Ave',
      coordinates: { latitude: 23.8150, longitude: 90.4050 },
    },
    dropoff: {
      address: '101 Pine Blvd',
      coordinates: { latitude: 23.8243, longitude: 90.4198 },
    },
    estimatedDistance: '5.7 km',
    estimatedDuration: '18 min',
    fare: '$22.75',
    type: 'Premium',
  },
  {
    id: '3',
    passenger: {
      name: 'Michael Wong',
      rating: 4.7,
      trips: 23,
    },
    pickup: {
      address: '555 Maple Dr',
      coordinates: { latitude: 23.8080, longitude: 90.4180 },
    },
    dropoff: {
      address: '222 Cedar Ln',
      coordinates: { latitude: 23.8190, longitude: 90.4295 },
    },
    estimatedDistance: '4.1 km',
    estimatedDuration: '15 min',
    fare: '$18.25',
    type: 'Standard',
  },
];

// Mock data for earnings
const earningsData = {
  today: 85.50,
  week: 435.75,
  month: 1890.25,
  trips: {
    completed: 8,
    cancelled: 1,
  },
  hours: 6.5,
};

const RiderHomeScreen = () => {
  const navigation = useNavigation<any>();
  const [isOnline, setIsOnline] = useState(true);
  const [rideRequests, setRideRequests] = useState(rideRequestsData);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    
    if (isOnline) {
      // Going offline
      Alert.alert(
        'Going Offline',
        'You won\'t receive new ride requests while offline.',
        [{ text: 'OK' }]
      );
    } else {
      // Going online
      Alert.alert(
        'You\'re Online',
        'You\'ll now receive ride requests in your area.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleAcceptRide = (rideId: string) => {
    const ride = rideRequests.find(req => req.id === rideId);
    
    if (ride) {
      Alert.alert(
        'Accept Ride',
        `Are you sure you want to accept the ride for ${ride.passenger.name}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Accept',
            onPress: () => {
              setActiveRide(ride);
              setRideRequests(rideRequests.filter(req => req.id !== rideId));
              setShowRequestDetails(false);
              
              // Navigate to active ride screen
              navigation.navigate('RiderRide', { ride });
            },
          },
        ]
      );
    }
  };
  
  const handleDeclineRide = (rideId: string) => {
    Alert.alert(
      'Decline Ride',
      'Are you sure you want to decline this ride request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Decline',
          onPress: () => {
            setRideRequests(rideRequests.filter(req => req.id !== rideId));
            setShowRequestDetails(false);
            
            if (selectedRequest === rideId) {
              setSelectedRequest(null);
            }
          },
        },
      ]
    );
  };
  
  const handleRideRequestSelect = (rideId: string) => {
    setSelectedRequest(rideId);
    setShowRequestDetails(true);
  };
  
  const renderRideRequestItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.rideRequestCard}
      onPress={() => handleRideRequestSelect(item.id)}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.fareText}>{item.fare}</Text>
        <View style={styles.rideTypeTag}>
          <Text style={styles.rideTypeText}>{item.type}</Text>
        </View>
      </View>
      
      <View style={styles.locationContainer}>
        <View style={styles.locationDots}>
          <View style={styles.startDot} />
          <View style={styles.dottedLine} />
          <View style={styles.endDot} />
        </View>
        
        <View style={styles.addressContainer}>
          <Text style={styles.addressText} numberOfLines={1}>{item.pickup.address}</Text>
          <Text style={styles.addressText} numberOfLines={1}>{item.dropoff.address}</Text>
        </View>
      </View>
      
      <View style={styles.rideInfoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.estimatedDuration}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="map-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.estimatedDistance}</Text>
        </View>
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRide(item.id)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRide(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  const renderRequestDetails = () => {
    const request = rideRequests.find(req => req.id === selectedRequest);
    
    if (!request) return null;
    
    return (
      <View style={styles.requestDetailsModal}>
        <View style={styles.requestDetailsHeader}>
          <TouchableOpacity 
            onPress={() => setShowRequestDetails(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.requestDetailsTitle}>Ride Details</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.requestDetailsContent}>
          <View style={styles.mapPreviewContainer}>
            <CustomMapView
              currentLocation={request.pickup.coordinates}
              destination={request.dropoff.coordinates}
              style={styles.mapPreview}
            />
          </View>
          
          <View style={styles.passengerInfoContainer}>
            <View style={styles.userIconContainer}>
              <Ionicons name="person" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.passengerDetails}>
              <Text style={styles.passengerName}>{request.passenger.name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{request.passenger.rating}</Text>
                <Text style={styles.tripsText}>({request.passenger.trips} trips)</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.detailedLocationsContainer}>
            <View style={styles.locationDots}>
              <View style={styles.startDot} />
              <View style={[styles.dottedLine, { height: 50 }]} />
              <View style={styles.endDot} />
            </View>
            
            <View style={styles.addressContainer}>
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>PICKUP</Text>
                <Text style={styles.detailedAddressText}>{request.pickup.address}</Text>
              </View>
              
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>DROPOFF</Text>
                <Text style={styles.detailedAddressText}>{request.dropoff.address}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.rideDetailsContainer}>
            <View style={styles.rideDetailItem}>
              <Ionicons name="cash-outline" size={20} color={COLORS.text} />
              <Text style={styles.rideDetailLabel}>Fare</Text>
              <Text style={styles.rideDetailValue}>{request.fare}</Text>
            </View>
            
            <View style={styles.rideDetailItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.text} />
              <Text style={styles.rideDetailLabel}>Est. Time</Text>
              <Text style={styles.rideDetailValue}>{request.estimatedDuration}</Text>
            </View>
            
            <View style={styles.rideDetailItem}>
              <Ionicons name="map-outline" size={20} color={COLORS.text} />
              <Text style={styles.rideDetailLabel}>Distance</Text>
              <Text style={styles.rideDetailValue}>{request.estimatedDistance}</Text>
            </View>
            
            <View style={styles.rideDetailItem}>
              <Ionicons name="car-outline" size={20} color={COLORS.text} />
              <Text style={styles.rideDetailLabel}>Ride Type</Text>
              <Text style={styles.rideDetailValue}>{request.type}</Text>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.requestDetailsActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.declineButton, styles.largeButton]}
            onPress={() => {
              handleDeclineRide(request.id);
            }}
          >
            <Text style={styles.declineButtonText}>Decline Ride</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton, styles.largeButton]}
            onPress={() => {
              handleAcceptRide(request.id);
            }}
          >
            <Text style={styles.acceptButtonText}>Accept Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderEarningsSummary = () => (
    <TouchableOpacity 
      style={styles.earningsSummaryCard}
      onPress={() => navigation.navigate('RiderEarnings')}
    >
      <View style={styles.earningsHeader}>
        <Text style={styles.earningsHeaderText}>Today's Earnings</Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
      </View>
      
      <Text style={styles.earningsAmount}>${earningsData.today.toFixed(2)}</Text>
      
      <View style={styles.earningsDetails}>
        <View style={styles.earningsDetailItem}>
          <Text style={styles.earningsDetailValue}>{earningsData.trips.completed}</Text>
          <Text style={styles.earningsDetailLabel}>Trips</Text>
        </View>
        
        <View style={styles.earningsDetailDivider} />
        
        <View style={styles.earningsDetailItem}>
          <Text style={styles.earningsDetailValue}>{earningsData.hours} hrs</Text>
          <Text style={styles.earningsDetailLabel}>Online</Text>
        </View>
        
        <View style={styles.earningsDetailDivider} />
        
        <View style={styles.earningsDetailItem}>
          <Text style={styles.earningsDetailValue}>${(earningsData.today / earningsData.hours).toFixed(2)}</Text>
          <Text style={styles.earningsDetailLabel}>Per Hr</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('RiderProfile')}
        >
          <Ionicons name="person-circle-outline" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.statusSwitchContainer}>
          <Text style={[styles.statusText, isOnline ? styles.onlineText : styles.offlineText]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: COLORS.inactive, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.notificationsButton}
          onPress={() => navigation.navigate('NotificationsScreen')}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      {!isOnline && (
        <View style={styles.offlineNotice}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.offlineNoticeText}>
            You're offline. Go online to receive ride requests.
          </Text>
        </View>
      )}
      
      <ScrollView style={styles.content}>
        {renderEarningsSummary()}
        
        <View style={styles.rideRequestsContainer}>
          <Text style={styles.sectionTitle}>Ride Requests</Text>
          
          {rideRequests.length > 0 ? (
            <FlatList
              data={rideRequests}
              keyExtractor={(item) => item.id}
              renderItem={renderRideRequestItem}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyRequestsContainer}>
              <Ionicons name="car-outline" size={48} color={COLORS.primary} />
              <Text style={styles.emptyRequestsText}>No ride requests at the moment</Text>
              <Text style={styles.emptyRequestsSubtext}>
                {isOnline 
                  ? 'Ride requests will appear here when they become available' 
                  : 'Go online to receive ride requests'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {showRequestDetails && renderRequestDetails()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...SHADOWS.light,
  },
  statusText: {
    ...FONTS.body4,
    fontWeight: '600',
    marginRight: 8,
  },
  onlineText: {
    color: COLORS.primary,
  },
  offlineText: {
    color: COLORS.textSecondary,
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  offlineNoticeText: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  earningsSummaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsHeaderText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  earningsAmount: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 16,
  },
  earningsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  earningsDetailValue: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  earningsDetailLabel: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
  },
  earningsDetailDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 16,
  },
  rideRequestsContainer: {
    marginBottom: 20,
  },
  rideRequestCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fareText: {
    ...FONTS.h3,
    color: COLORS.primary,
    fontWeight: '700',
  },
  rideTypeTag: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rideTypeText: {
    ...FONTS.body5,
    color: COLORS.primary,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationDots: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  startDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  dottedLine: {
    height: 30,
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
    marginLeft: 5.5,
  },
  endDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.secondary,
  },
  addressContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  addressText: {
    ...FONTS.body4,
    color: COLORS.text,
    marginBottom: 16,
  },
  rideInfoContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 10,
    borderRadius: SIZES.radius - 4,
    alignItems: 'center',
    flex: 0.48,
  },
  largeButton: {
    height: 50,
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  acceptButtonText: {
    ...FONTS.body4,
    color: COLORS.white,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  declineButtonText: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  emptyRequestsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
  },
  emptyRequestsText: {
    ...FONTS.h4,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyRequestsSubtext: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  requestDetailsModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    ...SHADOWS.dark,
  },
  requestDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  requestDetailsTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestDetailsContent: {
    flex: 1,
  },
  mapPreviewContainer: {
    height: 180,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    ...SHADOWS.light,
  },
  mapPreview: {
    flex: 1,
  },
  passengerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...FONTS.body4,
    color: COLORS.text,
    fontWeight: '600',
    marginLeft: 4,
  },
  tripsText: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  detailedLocationsContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
  },
  addressItem: {
    marginBottom: 24,
  },
  addressLabel: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailedAddressText: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  rideDetailsContainer: {
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    padding: 16,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rideDetailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideDetailLabel: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginLeft: 8,
    width: 60,
  },
  rideDetailValue: {
    ...FONTS.body4,
    color: COLORS.text,
    fontWeight: '500',
  },
  requestDetailsActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default RiderHomeScreen; 