import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ViewStyle
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

interface LocationInputProps {
  label: string;
  placeholder: string;
  value: string;
  onPress: () => void;
  editable?: boolean;
  icon?: string;
  style?: ViewStyle;
  isDestination?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({
  label,
  placeholder,
  value,
  onPress,
  editable = false,
  icon = 'location',
  style,
  isDestination = false,
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={isDestination ? 'location' : 'navigate'} 
          size={20} 
          color={isDestination ? COLORS.error : COLORS.primary} 
        />
        {!isDestination && (
          <View style={styles.verticalLine} />
        )}
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          editable={editable}
          pointerEvents="none"
        />
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.inactive} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  iconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  verticalLine: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginTop: 4,
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    ...FONTS.body5,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    ...FONTS.body3,
    color: COLORS.text,
    padding: 0,
  },
});

export default LocationInput; 