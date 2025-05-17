import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

// Mock high demand areas data
const mockHighDemandAreas = [
  {
    id: '1',
    name: 'Downtown',
    description: 'City center area with high demand',
    demandLevel: 90,
    price: 1.8,
    coordinates: {
      latitude: 37.785834,
      longitude: -122.406417,
    },
  },
  {
    id: '2',
    name: 'Financial District',
    description: 'Business district with surge pricing',
    demandLevel: 85,
    price: 1.7,
    coordinates: {
      latitude: 37.792121,
      longitude: -122.402806,
    },
  },
  {
    id: '3',
    name: 'Central Station',
    description: 'Transport hub with high demand',
    demandLevel: 75,
    price: 1.5,
    coordinates: {
      latitude: 37.779527,
      longitude: -122.413756,
    },
  },
  {
    id: '4',
    name: 'Shopping Center',
    description: 'Popular shopping area',
    demandLevel: 65,
    price: 1.4,
    coordinates: {
      latitude: 37.784121,
      longitude: -122.407355,
    },
  },
  {
    id: '5',
    name: 'University',
    description: 'Campus area with moderate demand',
    demandLevel: 55,
    price: 1.3,
    coordinates: {
      latitude: 37.771537,
      longitude: -122.410841,
    },
  },
  {
    id: '6',
    name: 'Harbor Area',
    description: 'Waterfront with moderate demand',
    demandLevel: 45,
    price: 1.2,
    coordinates: {
      latitude: 37.808312,
      longitude: -122.409239,
    },
  },
];

const HighDemandScreen = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'high', 'medium', 'low'

  const filteredAreas = (() => {
    switch (activeFilter) {
      case 'high':
        return mockHighDemandAreas.filter(area => area.demandLevel >= 70);
      case 'medium':
        return mockHighDemandAreas.filter(area => area.demandLevel >= 50 && area.demandLevel < 70);
      case 'low':
        return mockHighDemandAreas.filter(area => area.demandLevel < 50);
      default:
        return mockHighDemandAreas;
    }
  })();

  const handleAreaPress = (area: any) => {
    // In a real app, would navigate to map screen with area highlighted
    navigation.navigate('MapScreen', { initialRegion: area.coordinates });
  };

  const getDemandLevelColor = (level: number) => {
    if (level >= 70) return COLORS.error;
    if (level >= 50) return COLORS.warning;
    return COLORS.success;
  };

  const renderAreaItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.areaItem}
      onPress={() => handleAreaPress(item)}
    >
      <View style={styles.areaHeader}>
        <Text style={styles.areaName}>{item.name}</Text>
        <View 
          style={[
            styles.demandBadge, 
            { backgroundColor: `${getDemandLevelColor(item.demandLevel)}25` }
          ]}
        >
          <Text style={[
            styles.demandText,
            { color: getDemandLevelColor(item.demandLevel) }
          ]}>
            {item.demandLevel}% Demand
          </Text>
        </View>
      </View>
      
      <Text style={styles.areaDescription}>{item.description}</Text>
      
      <View style={styles.areaFooter}>
        <View style={styles.priceInfo}>
          <Ionicons name="trending-up" size={18} color={COLORS.primary} />
          <Text style={styles.priceMultiplier}>{item.price.toFixed(1)}x</Text>
          <Text style={styles.priceLabel}>surge pricing</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>High Demand Areas</Text>
        <Text style={styles.headerSubtitle}>
          Prices may be higher in these areas due to increased demand
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'all' && styles.activeFilter]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'high' && styles.activeFilter]}
          onPress={() => setActiveFilter('high')}
        >
          <Text style={[styles.filterText, activeFilter === 'high' && styles.activeFilterText]}>
            High
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'medium' && styles.activeFilter]}
          onPress={() => setActiveFilter('medium')}
        >
          <Text style={[styles.filterText, activeFilter === 'medium' && styles.activeFilterText]}>
            Medium
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, activeFilter === 'low' && styles.activeFilter]}
          onPress={() => setActiveFilter('low')}
        >
          <Text style={[styles.filterText, activeFilter === 'low' && styles.activeFilterText]}>
            Low
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAreas}
        renderItem={renderAreaItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No areas match the selected filter</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    backgroundColor: COLORS.white,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius - 4,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: COLORS.primaryLight,
  },
  filterText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  areaItem: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  areaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  areaName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  demandBadge: {
    borderRadius: SIZES.radius - 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  demandText: {
    ...FONTS.body5,
    fontWeight: '600',
  },
  areaDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  areaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceMultiplier: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 4,
  },
  priceLabel: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
});

export default HighDemandScreen; 