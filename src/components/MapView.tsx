import React from 'react';
import { 
  StyleSheet, 
  View, 
  ViewStyle,
  ActivityIndicator,
  Text
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../styles/theme';
import MapView from 'react-native-maps';

interface CustomMapViewProps {
  currentLocation: { latitude: number; longitude: number } | null;
  destination?: { latitude: number; longitude: number } | null;
  pickup?: { latitude: number; longitude: number } | null;
  routeCoordinates?: Array<{ latitude: number; longitude: number }>;
  nearbyDrivers?: Array<{
    id: string;
    location: { latitude: number; longitude: number };
  }>;
  highDemandAreas?: Array<{
    id: string;
    coordinates: { latitude: number; longitude: number };
    radius: number;
    demandLevel: number;
  }>;
  showDemandHeatmap?: boolean;
  isLoading?: boolean;
  style?: ViewStyle;
  onRegionChange?: (region: any) => void;
  onMapPress?: (event: any) => void;
  selectedDriver?: string;
}

const CustomMapView: React.FC<CustomMapViewProps> = ({
  currentLocation,
  destination,
  pickup,
  isLoading = false,
  style,
  ...rest
}) => {
  if (!currentLocation && isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapBackground}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: 23.7103,
            longitude: 90.4125,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsPointsOfInterest={true}
          showsTraffic={true}
          showsBuildings={true}
        > 

        </MapView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e8e8e8',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: '#d0d0d0',
  },
  mainRoad: {
    position: 'absolute',
    width: '100%',
    height: 16,
    backgroundColor: '#bdbdbd',
    zIndex: 2,
  },
  buildingLarge: {
    position: 'absolute',
    width: '10%',
    height: '8%',
    backgroundColor: '#c0c0c0',
    borderRadius: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 3,
    zIndex: 3,
  },
  buildingMedium: {
    position: 'absolute',
    width: '7%',
    height: '5%',
    backgroundColor: '#c8c8c8',
    borderRadius: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    zIndex: 3,
  },
  buildingSmall: {
    position: 'absolute',
    width: '5%',
    height: '3%',
    backgroundColor: '#d0d0d0',
    borderRadius: 1,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    zIndex: 3,
  },
  park: {
    position: 'absolute',
    width: '15%',
    height: '12%',
    backgroundColor: COLORS.paleLavender,
    borderRadius: 40,
    top: '42%',
    left: '42%',
    zIndex: 2,
  },
  waterArea: {
    position: 'absolute',
    width: '20%',
    height: '15%',
    backgroundColor: '#bbdefb',
    borderRadius: 100,
    top: '75%',
    left: '40%',
    zIndex: 2,
  },
  currentLocationMarker: {
    position: 'absolute',
    top: '43%',
    left: '40%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    zIndex: 10,
  },
  pickupMarker: {
    position: 'absolute',
    top: '48%',
    left: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    zIndex: 10,
  },
  destinationMarker: {
    position: 'absolute',
    top: '33%',
    left: '60%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    zIndex: 10,
  },
});

export default CustomMapView; 