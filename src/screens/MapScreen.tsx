import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import CustomMapView from '../components/MapView';

const MapScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [pickupLocation, setPickupLocation] = useState('Current Location');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [destination, setDestination] = useState<{latitude: number; longitude: number} | null>(null);
  
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 23.8103,
    longitude: 90.4125,
  });

  // Use route params if available
  useEffect(() => {
    if (route.params) {
      const { sourceLocation, destinationLocation } = route.params;
      
      if (sourceLocation) {
        setCurrentLocation(sourceLocation);
      }
      
      if (destinationLocation) {
        setDestination(destinationLocation);
        setDropoffLocation('Selected Destination');
      }
    }
  }, [route.params]);

  const handleSourceLocationChange = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setCurrentLocation(location);
    setPickupLocation('Updated Pickup Location');
    
    Alert.alert('Source Location Updated', 
      'In a real app, this would update the map marker position.');
  };

  const handleDestinationLocationChange = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setDestination(location);
    setDropoffLocation('Updated Destination');
    
    Alert.alert('Destination Updated', 
      'In a real app, this would update the map marker position.');
  };

  const handleMarkerPress = (type: 'source' | 'destination') => {
    if (type === 'source') {
      Alert.alert(
        'Source Location',
        'You can tap this marker to edit the source location',
        [
          {
            text: 'Move a bit East',
            onPress: () => {
              setCurrentLocation({
                ...currentLocation,
                longitude: currentLocation.longitude + 0.01
              });
              setPickupLocation('Moved East');
            }
          },
          {
            text: 'Move a bit South',
            onPress: () => {
              setCurrentLocation({
                ...currentLocation,
                latitude: currentLocation.latitude - 0.01
              });
              setPickupLocation('Moved South');
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      Alert.alert(
        'Destination',
        'You can tap this marker to edit the destination',
        [
          {
            text: 'Move a bit North',
            onPress: () => {
              if (destination) {
                setDestination({
                  ...destination,
                  latitude: destination.latitude + 0.01
                });
                setDropoffLocation('Moved North');
              }
            }
          },
          {
            text: 'Move a bit West',
            onPress: () => {
              if (destination) {
                setDestination({
                  ...destination,
                  longitude: destination.longitude - 0.01
                });
                setDropoffLocation('Moved West');
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleProceed = () => {
    if (dropoffLocation) {
      try {
        navigation.navigate('RideOptions', {
          pickup: {
            name: pickupLocation,
            coordinates: currentLocation
          },
          dropoff: {
            name: dropoffLocation,
            coordinates: destination || {
              latitude: currentLocation.latitude + 0.01,
              longitude: currentLocation.longitude + 0.01
            }
          },
        });
      } catch (error) {
        console.log('Navigation error:', error);
        Alert.alert('Error', 'Unable to proceed at this time.');
      }
    } else {
      Alert.alert('Select Destination', 'Please select a drop-off location');
    }
  };

  const handleLocationSelect = (type: 'pickup' | 'dropoff') => {
    if (type === 'pickup') {
      setPickupLocation('Selected Pickup Location');
    } else {
      setDropoffLocation('Selected Destination');
      // Set a sample destination location if none exists
      if (!destination) {
        setDestination({
          latitude: currentLocation.latitude + 0.01,
          longitude: currentLocation.longitude + 0.01
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <CustomMapView
          style={styles.map}
          currentLocation={currentLocation}
          destination={destination}
          onSourceLocationChange={handleSourceLocationChange}
          onDestinationLocationChange={handleDestinationLocationChange}
          onCustomMarkerPress={handleMarkerPress}
        />
        <Text style={styles.simulationNotice}>
          Simulated Map View (Intentional)
        </Text>

        {/* Navigation controls in map overlay */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              try {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Home');
                }
              } catch (error) {
                console.log('Navigation error:', error);
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.locationPanel}>
        <View style={styles.locationContainer}>
          <View style={styles.locationDots}>
            <View style={styles.startDot} />
            <View style={styles.dottedLine} />
            <View style={styles.endDot} />
          </View>
          
          <View style={styles.locationInputs}>
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => handleLocationSelect('pickup')}
            >
              <Text style={styles.locationText}>
                {pickupLocation || 'Set pickup location'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.locationInput}
              onPress={() => handleLocationSelect('dropoff')}
            >
              <Text
                style={[
                  styles.locationText,
                  !dropoffLocation && styles.placeholderText
                ]}
              >
                {dropoffLocation || 'Where to?'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.proceedButton,
            !dropoffLocation && styles.disabledButton
          ]}
          onPress={handleProceed}
          disabled={!dropoffLocation}
        >
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
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
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1000,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  locationPanel: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SIZES.radius,
    borderTopRightRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 20,
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
  locationInputs: {
    flex: 1,
  },
  locationInput: {
    height: 40,
    justifyContent: 'center',
  },
  locationText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
  proceedButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.inactive,
  },
  proceedButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  simulationNotice: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 4,
    zIndex: 1000,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
});

export default MapScreen;
