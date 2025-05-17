import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

// Mock data for ride options
const rideOptions = [
  {
    id: '1',
    name: 'Standard',
    icon: 'car-outline',
    price: 12.50,
    time: '5 min',
    description: 'Affordable rides for everyday use',
  },
  {
    id: '2',
    name: 'Premium',
    icon: 'car-sport-outline',
    price: 18.75,
    time: '4 min',
    description: 'High-end vehicles for comfort',
  },
  {
    id: '3',
    name: 'XL',
    icon: 'car-outline',
    price: 22.00,
    time: '7 min',
    description: 'Spacious vehicles for groups',
  },
];

// Define the RideOption type
type RideOption = {
  id: string;
  name: string;
  icon: string;
  price: number;
  time: string;
  description: string;
};

const RideOptionsScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedOption, setSelectedOption] = useState(rideOptions[0].id);

  const handleConfirm = () => {
    navigation.navigate('RideConfirmation', {
      rideOption: rideOptions.find(option => option.id === selectedOption),
    });
  };

  const handleSchedule = () => {
    navigation.navigate('ScheduleRide', {
      rideOption: rideOptions.find(option => option.id === selectedOption),
    });
  };

  const renderRideOption = ({ item }: { item: RideOption }) => {
    const isSelected = selectedOption === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.optionCard,
          isSelected && styles.selectedOptionCard,
        ]}
        onPress={() => setSelectedOption(item.id)}
      >
        <View style={[
          styles.optionIconContainer,
          isSelected && styles.selectedOptionIconContainer
        ]}>
          <Ionicons name={item.icon} size={24} color={isSelected ? COLORS.white : COLORS.primary} />
        </View>
        
        <View style={styles.optionDetails}>
          <Text style={[styles.optionName, isSelected && styles.selectedOptionText]}>{item.name}</Text>
          <Text style={styles.optionDescription}>{item.description}</Text>
          <Text style={styles.optionTime}>{item.time} away</Text>
        </View>
        
        <View style={styles.optionPriceContainer}>
          <Text style={[styles.optionPrice, isSelected && styles.selectedOptionText]}>${item.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Ride</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={rideOptions}
        keyExtractor={(item) => item.id}
        renderItem={renderRideOption}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.scheduleButton}
          onPress={handleSchedule}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
          <Text style={styles.scheduleButtonText}>Schedule</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm Ride</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: SIZES.padding,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOptionCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedOptionIconContainer: {
    backgroundColor: COLORS.primary,
  },
  optionDetails: {
    flex: 1,
  },
  optionName: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 2,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  optionDescription: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  optionTime: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
  },
  optionPriceContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  optionPrice: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  footer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    marginRight: 12,
  },
  scheduleButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '600' as const,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: SIZES.radius - 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600' as const,
  },
});

export default RideOptionsScreen; 