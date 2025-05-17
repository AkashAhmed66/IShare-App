import React, { useState } from 'react';
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

const RideConfirmationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { rideOption, scheduledTime } = route.params || {};

  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = () => {
    setIsConfirming(true);
    
    // Simulate loading
    setTimeout(() => {
      setIsConfirming(false);
      navigation.navigate('RideStatus', {
        rideOption,
        scheduledTime,
        paymentMethod
      });
    }, 1500);
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

  // Mock pickup and dropoff locations
  const pickup = {
    name: 'Current Location',
    address: '123 Main St, Anytown, USA',
  };

  const dropoff = {
    name: 'Central Mall',
    address: '456 Shopping Ave, Anytown, USA',
  };

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
                <Text style={styles.rideOptionDescription}>
                  {rideOption.description}
                </Text>
              </View>
              <Text style={styles.rideOptionPrice}>
                ${rideOption.price.toFixed(2)}
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
          style={[styles.confirmButton, isConfirming && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={isConfirming}
        >
          <Text style={styles.confirmButtonText}>
            {isConfirming ? 'Confirming...' : 'Confirm Ride'}
          </Text>
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
    ...FONTS.h4,
    color: COLORS.text,
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
    marginBottom: 12,
  },
  rideDetailText: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: 8,
    width: 100,
  },
  rideDetailValue: {
    ...FONTS.body4,
    color: COLORS.text,
    flex: 1,
  },
  paymentSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentText: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.inactive,
  },
  confirmButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default RideConfirmationScreen; 