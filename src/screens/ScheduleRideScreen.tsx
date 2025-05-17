import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

const ScheduleRideScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const rideOption = route.params?.rideOption;

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleConfirm = () => {
    const scheduledDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    navigation.navigate('RideConfirmation', {
      rideOption,
      scheduledTime: scheduledDateTime.toISOString(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Schedule a Ride</Text>
          <Text style={styles.headerSubtitle}>
            Choose when you'd like your ride
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pick a Date</Text>
          <TouchableOpacity
            style={styles.dateTimeContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
            <Text style={styles.dateTimeText}>
              {date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.text} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Pick a Time</Text>
          <TouchableOpacity
            style={styles.dateTimeContainer}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={24} color={COLORS.primary} />
            <Text style={styles.dateTimeText}>
              {time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            <Ionicons name="chevron-down" size={20} color={COLORS.text} />
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={onTimeChange}
            />
          )}
        </View>

        {rideOption && (
          <View style={styles.rideOptionCard}>
            <Text style={styles.sectionTitle}>Selected Ride</Text>
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
          </View>
        )}

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm Schedule</Text>
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
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
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
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    padding: 16,
    justifyContent: 'space-between',
  },
  dateTimeText: {
    ...FONTS.body3,
    color: COLORS.text,
    flex: 1,
    marginLeft: 12,
  },
  rideOptionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 24,
    ...SHADOWS.light,
  },
  rideOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  confirmButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmButtonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default ScheduleRideScreen; 