import React, { useEffect, useState } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import MapView, { Circle, Region } from 'react-native-maps';
import { COLORS } from '../styles/theme';

interface HighDemandArea {
  id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in km
  demandLevel: number; // 0-1 scale
}

interface HeatMapViewProps {
  highDemandAreas: HighDemandArea[];
  initialRegion?: Region;
  style?: StyleProp<ViewStyle>;
  onRegionChange?: (region: Region) => void;
  onPress?: () => void;
}

const HeatMapView: React.FC<HeatMapViewProps> = ({
  highDemandAreas,
  initialRegion,
  style,
  onRegionChange,
  onPress,
}) => {
  // Default initial region (San Francisco)
  const defaultRegion = {
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Convert km to meters for radius
  const convertRadiusToMeters = (radiusInKm: number) => radiusInKm * 1000;

  // Get color based on demand level (0-1)
  const getDemandColor = (demandLevel: number) => {
    // Colors range from green (low) to yellow (medium) to red (high)
    if (demandLevel < 0.3) {
      return `${COLORS.success}80`; // Green with 50% opacity
    } else if (demandLevel < 0.6) {
      return `${COLORS.warning}80`; // Yellow with 50% opacity
    } else {
      return `${COLORS.error}80`; // Red with 50% opacity
    }
  };

  // Get stroke color based on demand level (darker version of fill)
  const getStrokeColor = (demandLevel: number) => {
    if (demandLevel < 0.3) {
      return COLORS.success;
    } else if (demandLevel < 0.6) {
      return COLORS.warning;
    } else {
      return COLORS.error;
    }
  };

  return (
    <MapView
      style={[styles.map, style]}
      initialRegion={initialRegion || defaultRegion}
      onRegionChange={onRegionChange}
      onPress={onPress}
    >
      {highDemandAreas.map((area) => (
        <Circle
          key={area.id}
          center={area.coordinates}
          radius={convertRadiusToMeters(area.radius)}
          fillColor={getDemandColor(area.demandLevel)}
          strokeColor={getStrokeColor(area.demandLevel)}
          strokeWidth={1}
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default HeatMapView; 