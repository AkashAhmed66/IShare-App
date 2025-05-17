import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

interface DriverInfo {
  id: string;
  name: string;
  rating: number;
  car: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  distance: string;
}

interface RideStatusCardProps {
  status: 'searching' | 'driverAssigned' | 'driverArrived' | 'inProgress' | 'completed' | 'cancelled';
  driver?: DriverInfo;
  estimatedTime?: string;
  estimatedPrice?: number;
  onCallDriver?: () => void;
  onMessageDriver?: () => void;
  onCancelRide?: () => void;
  onRateDriver?: () => void;
  style?: ViewStyle;
}

const RideStatusCard: React.FC<RideStatusCardProps> = ({
  status,
  driver,
  estimatedTime,
  estimatedPrice,
  onCallDriver,
  onMessageDriver,
  onCancelRide,
  onRateDriver,
  style,
}) => {
  // Helper function to get status title and description
  const getStatusInfo = () => {
    switch (status) {
      case 'searching':
        return {
          title: 'Finding your driver',
          description: 'Please wait while we match you with a driver...',
          icon: 'search',
        };
      case 'driverAssigned':
        return {
          title: `${driver?.name} is on the way`,
          description: `Estimated arrival: ${estimatedTime || 'Calculating...'}`,
          icon: 'car',
        };
      case 'driverArrived':
        return {
          title: `${driver?.name} has arrived`,
          description: 'Your driver is waiting at the pickup location',
          icon: 'location',
        };
      case 'inProgress':
        return {
          title: 'Ride in progress',
          description: `Estimated arrival at destination: ${estimatedTime || 'Calculating...'}`,
          icon: 'navigate',
        };
      case 'completed':
        return {
          title: 'Ride completed',
          description: 'Thank you for riding with IShare!',
          icon: 'checkmark-circle',
        };
      case 'cancelled':
        return {
          title: 'Ride cancelled',
          description: 'Your ride has been cancelled',
          icon: 'close-circle',
        };
      default:
        return {
          title: '',
          description: '',
          icon: '',
        };
    }
  };

  const { title, description, icon } = getStatusInfo();

  // Display loading state for searching status
  if (status === 'searching') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.searchingContainer}>
          <Ionicons name="search" size={40} color={COLORS.primary} />
          <Text style={styles.searchingTitle}>{title}</Text>
          <Text style={styles.searchingDescription}>{description}</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancelRide}>
            <Text style={styles.cancelText}>Cancel Ride</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Display completed or cancelled state
  if (status === 'completed' || status === 'cancelled') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.completedContainer}>
          <Ionicons
            name={icon}
            size={40}
            color={status === 'completed' ? COLORS.success : COLORS.error}
          />
          <Text style={styles.completedTitle}>{title}</Text>
          <Text style={styles.completedDescription}>{description}</Text>

          {status === 'completed' && (
            <View style={styles.completedDetails}>
              <Text style={styles.completedPrice}>
                Total: ${estimatedPrice?.toFixed(2) || '0.00'}
              </Text>
              <TouchableOpacity
                style={styles.rateButton}
                onPress={onRateDriver}
              >
                <Text style={styles.rateText}>Rate your driver</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Display driver information for other states
  return (
    <View style={[styles.container, style]}>
      {driver && (
        <>
          <View style={styles.statusHeader}>
            <Ionicons name={icon} size={24} color={COLORS.primary} />
            <Text style={styles.statusTitle}>{title}</Text>
          </View>

          <Text style={styles.statusDescription}>{description}</Text>

          <View style={styles.driverInfo}>
            <View style={styles.driverProfile}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
                style={styles.driverImage}
              />
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.rating}>{driver.rating}</Text>
                </View>
              </View>
            </View>

            <View style={styles.carInfo}>
              <Text style={styles.carDetails}>
                {driver.car.color} {driver.car.make} {driver.car.model}
              </Text>
              <Text style={styles.licensePlate}>{driver.car.licensePlate}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onMessageDriver}
            >
              <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onCallDriver}
            >
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelRideButton]}
              onPress={onCancelRide}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.error} />
              <Text style={[styles.actionText, styles.cancelText]}>
                Cancel Ride
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    margin: 16,
    ...SHADOWS.medium,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginLeft: 10,
  },
  statusDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  driverInfo: {
    marginBottom: 16,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
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
  },
  rating: {
    ...FONTS.body4,
    color: COLORS.text,
    marginLeft: 4,
  },
  carInfo: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carDetails: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  licensePlate: {
    ...FONTS.h4,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    ...FONTS.body4,
    color: COLORS.primary,
    marginLeft: 6,
  },
  cancelRideButton: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
  },
  cancelText: {
    color: COLORS.error,
  },
  searchingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  searchingTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  searchingDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  cancelButton: {
    padding: 12,
  },
  completedContainer: {
    alignItems: 'center',
    padding: 20,
  },
  completedTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  completedDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  completedDetails: {
    width: '100%',
    alignItems: 'center',
  },
  completedPrice: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: 16,
  },
  rateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: SIZES.radius,
  },
  rateText: {
    ...FONTS.body4,
    color: COLORS.white,
  },
});

export default RideStatusCard; 