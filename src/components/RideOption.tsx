import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ViewStyle 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { RideOption as RideOptionType } from '../redux/slices/rideSlice';

interface RideOptionProps {
  option: RideOptionType;
  isSelected: boolean;
  onSelect: (option: RideOptionType) => void;
  style?: ViewStyle;
}

const RideOption: React.FC<RideOptionProps> = ({
  option,
  isSelected,
  onSelect,
  style,
}) => {
  const { name, description, estimatedTime, price, image, capacity } = option;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        style,
      ]}
      onPress={() => onSelect(option)}
      activeOpacity={0.7}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={image} size={24} color={COLORS.text} />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.time}>{estimatedTime}</Text>
          </View>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.capacity}>
            <Ionicons name="person" size={14} color={COLORS.textSecondary} />
            {` ${capacity} ${capacity > 1 ? 'persons' : 'person'} max`}
          </Text>
        </View>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${price.toFixed(2)}</Text>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} style={styles.checkIcon} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: SIZES.radius,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  time: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  description: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  capacity: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  checkIcon: {
    marginTop: 4,
  },
});

export default RideOption; 