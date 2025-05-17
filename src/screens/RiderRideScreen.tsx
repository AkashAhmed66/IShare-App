import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import CustomMapView from '../components/MapView';

// Ride status enum
enum RideStatus {
  ACCEPTED = 'ACCEPTED',
  ARRIVING = 'ARRIVING',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

const RiderRideScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { ride } = route.params || {};
  
  const [rideStatus, setRideStatus] = useState<RideStatus>(RideStatus.ACCEPTED);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  useEffect(() => {
    // Start the timer when ride is in progress
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);
  
  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleArriveAtPickup = () => {
    Alert.alert(
      'Confirm Arrival',
      'Have you arrived at the pickup location?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => {
            setRideStatus(RideStatus.ARRIVED);
          },
        },
      ]
    );
  };
  
  const handleStartRide = () => {
    Alert.alert(
      'Start Ride',
      'Confirm that the passenger is in your vehicle and you are ready to start the ride',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Start Ride',
          onPress: () => {
            setRideStatus(RideStatus.IN_PROGRESS);
            setIsTimerRunning(true);
          },
        },
      ]
    );
  };
  
  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride',
      'Confirm that you have reached the destination and the ride is complete',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete Ride',
          onPress: () => {
            setRideStatus(RideStatus.COMPLETED);
            setIsTimerRunning(false);
            navigation.navigate('RiderRideSummary', {
              ride,
              duration: timer,
              fare: ride.fare,
            });
          },
        },
      ]
    );
  };
  
  const handleCancelRide = (reason: string) => {
    setRideStatus(RideStatus.CANCELLED);
    setShowCancelModal(false);
    
    Alert.alert(
      'Ride Cancelled',
      'The ride has been cancelled. You will be redirected to the home screen.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('RiderHomeScreen'),
        },
      ]
    );
  };
  
  const cancelReasons = [
    "Can't find passenger",
    "Vehicle issues",
    "Passenger requested cancellation",
    "Wrong pickup location",
    "Emergency situation",
    "Traffic or road closure",
  ];
  
  const renderStatusPanel = () => {
    switch (rideStatus) {
      case RideStatus.ACCEPTED:
      case RideStatus.ARRIVING:
        return (
          <View style={styles.statusPanel}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Picking Up Passenger</Text>
              <View style={styles.statusIndicator}>
                <Text style={styles.statusText}>En Route</Text>
              </View>
            </View>
            
            <View style={styles.directionsContainer}>
              <Text style={styles.directionsText}>
                Navigate to pickup location: {ride?.pickup.address}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleArriveAtPickup}
            >
              <Text style={styles.actionButtonText}>I've Arrived at Pickup</Text>
            </TouchableOpacity>
          </View>
        );
        
      case RideStatus.ARRIVED:
        return (
          <View style={styles.statusPanel}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Waiting for Passenger</Text>
              <View style={styles.statusIndicator}>
                <Text style={styles.statusText}>At Pickup</Text>
              </View>
            </View>
            
            <View style={styles.directionsContainer}>
              <Text style={styles.directionsText}>
                You have arrived at {ride?.pickup.address}. Please wait for the passenger.
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleStartRide}
            >
              <Text style={styles.actionButtonText}>Start Ride</Text>
            </TouchableOpacity>
          </View>
        );
        
      case RideStatus.IN_PROGRESS:
        return (
          <View style={styles.statusPanel}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Ride in Progress</Text>
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                <Text style={styles.timerText}>{formatTimer()}</Text>
              </View>
            </View>
            
            <View style={styles.directionsContainer}>
              <Text style={styles.directionsText}>
                Navigate to destination: {ride?.dropoff.address}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCompleteRide}
            >
              <Text style={styles.actionButtonText}>Complete Ride</Text>
            </TouchableOpacity>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  const renderCancelModal = () => (
    <Modal
      visible={showCancelModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Ride</Text>
            <TouchableOpacity onPress={() => setShowCancelModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalSubtitle}>Please select a reason for cancellation:</Text>
          
          <ScrollView style={styles.reasonsContainer}>
            {cancelReasons.map((reason, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.reasonItem}
                onPress={() => {
                  setCancelReason(reason);
                  handleCancelRide(reason);
                }}
              >
                <Text style={styles.reasonText}>{reason}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.closeCancelButton}
            onPress={() => setShowCancelModal(false)}
          >
            <Text style={styles.closeCancelButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <CustomMapView
          currentLocation={ride?.pickup.coordinates}
          destination={ride?.dropoff.coordinates}
          style={styles.map}
        />
        
        <View style={styles.mapOverlay}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (rideStatus === RideStatus.ACCEPTED || rideStatus === RideStatus.ARRIVING) {
                setShowCancelModal(true);
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons 
              name={rideStatus === RideStatus.ACCEPTED || rideStatus === RideStatus.ARRIVING ? "close" : "arrow-back"} 
              size={24} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetHandle} />
        
        <View style={styles.passengerInfoContainer}>
          <View style={styles.passengerIconContainer}>
            <Ionicons name="person" size={32} color={COLORS.primary} />
          </View>
          
          <View style={styles.passengerDetails}>
            <Text style={styles.passengerName}>{ride?.passenger.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{ride?.passenger.rating}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={20} color={COLORS.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.rideDetailsContainer}>
          <View style={styles.locationContainer}>
            <View style={styles.locationDots}>
              <View style={styles.startDot} />
              <View style={styles.dottedLine} />
              <View style={styles.endDot} />
            </View>
            
            <View style={styles.addressContainer}>
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>PICKUP</Text>
                <Text style={styles.addressText}>{ride?.pickup.address}</Text>
              </View>
              
              <View style={styles.addressItem}>
                <Text style={styles.addressLabel}>DROPOFF</Text>
                <Text style={styles.addressText}>{ride?.dropoff.address}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.tripInfoContainer}>
            <View style={styles.tripInfoItem}>
              <Ionicons name="cash-outline" size={20} color={COLORS.text} />
              <Text style={styles.tripInfoText}>{ride?.fare}</Text>
            </View>
            
            <View style={styles.tripInfoDivider} />
            
            <View style={styles.tripInfoItem}>
              <Ionicons name="map-outline" size={20} color={COLORS.text} />
              <Text style={styles.tripInfoText}>{ride?.estimatedDistance}</Text>
            </View>
            
            <View style={styles.tripInfoDivider} />
            
            <View style={styles.tripInfoItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.text} />
              <Text style={styles.tripInfoText}>{ride?.estimatedDuration}</Text>
            </View>
          </View>
        </View>
        
        {renderStatusPanel()}
        
        {(rideStatus === RideStatus.ACCEPTED || rideStatus === RideStatus.ARRIVING) && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={styles.cancelButtonText}>Cancel Ride</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {renderCancelModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding,
    ...SHADOWS.dark,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 10,
  },
  passengerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  passengerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: 4,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideDetailsContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  },
  addressItem: {
    marginBottom: 16,
  },
  addressLabel: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  addressText: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  tripInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripInfoText: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: 8,
  },
  tripInfoDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  statusPanel: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginTop: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  statusIndicator: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...FONTS.body5,
    color: COLORS.primary,
    fontWeight: '600',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: {
    ...FONTS.body5,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  directionsContainer: {
    marginBottom: 16,
  },
  directionsText: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    padding: SIZES.padding,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  modalSubtitle: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  reasonsContainer: {
    maxHeight: 300,
  },
  reasonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reasonText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  closeCancelButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  closeCancelButtonText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
});

export default RiderRideScreen; 