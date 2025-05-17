import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Calendar } from 'react-native-calendars';
import { COLORS, SIZES, FONTS, SHADOWS } from '../styles/theme';
import CustomButton from './CustomButton';
import moment from 'moment';

interface ScheduleRideModalProps {
  visible: boolean;
  onClose: () => void;
  onSchedule: (date: Date, isRecurring: boolean, recurringDays: string[]) => void;
  initialDate?: Date;
  initialIsRecurring?: boolean;
  initialRecurringDays?: string[];
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

// Time slots for scheduling
const TIME_SLOTS = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
  '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30',
];

const ScheduleRideModal: React.FC<ScheduleRideModalProps> = ({
  visible,
  onClose,
  onSchedule,
  initialDate = new Date(),
  initialIsRecurring = false,
  initialRecurringDays = [],
}) => {
  const [selectedDate, setSelectedDate] = useState(moment(initialDate).format('YYYY-MM-DD'));
  const [selectedTime, setSelectedTime] = useState(moment(initialDate).format('HH:mm'));
  const [isRecurring, setIsRecurring] = useState(initialIsRecurring);
  const [recurringDays, setRecurringDays] = useState<string[]>(initialRecurringDays);

  // Format current date for calendar
  const today = moment().format('YYYY-MM-DD');

  // Generate marked dates for calendar
  const getMarkedDates = () => {
    const markedDates: any = {};
    markedDates[selectedDate] = { selected: true, selectedColor: COLORS.primary };
    return markedDates;
  };

  // Toggle day selection for recurring rides
  const toggleDay = (day: string) => {
    if (recurringDays.includes(day)) {
      setRecurringDays(recurringDays.filter((d) => d !== day));
    } else {
      setRecurringDays([...recurringDays, day]);
    }
  };

  // Handle schedule button press
  const handleSchedule = () => {
    const dateTime = moment(`${selectedDate} ${selectedTime}`, 'YYYY-MM-DD HH:mm').toDate();
    onSchedule(dateTime, isRecurring, recurringDays);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Schedule a Ride</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Calendar
              current={selectedDate}
              minDate={today}
              onDayPress={(day) => setSelectedDate(day.dateString)}
              markedDates={getMarkedDates()}
              theme={{
                calendarBackground: COLORS.white,
                textSectionTitleColor: COLORS.text,
                selectedDayBackgroundColor: COLORS.primary,
                selectedDayTextColor: COLORS.white,
                todayTextColor: COLORS.primary,
                dayTextColor: COLORS.text,
                textDisabledColor: COLORS.inactive,
                dotColor: COLORS.primary,
                arrowColor: COLORS.primary,
                monthTextColor: COLORS.text,
                indicatorColor: COLORS.primary,
              }}
            />

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Select Time</Text>
            <View style={styles.timeContainer}>
              {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.selectedTimeSlot,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text
                    style={[
                      styles.timeText,
                      selectedTime === time && styles.selectedTimeText,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.recurringContainer}>
              <View style={styles.recurringHeader}>
                <Text style={styles.sectionTitle}>Make it recurring?</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: COLORS.inactive, true: COLORS.primaryLight }}
                  thumbColor={isRecurring ? COLORS.primary : COLORS.white}
                />
              </View>

              {isRecurring && (
                <View style={styles.daysContainer}>
                  {DAYS_OF_WEEK.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayButton,
                        recurringDays.includes(day) && styles.selectedDayButton,
                      ]}
                      onPress={() => toggleDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          recurringDays.includes(day) && styles.selectedDayText,
                        ]}
                      >
                        {day.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <CustomButton
              title="Schedule Ride"
              onPress={handleSchedule}
              size="large"
              style={styles.scheduleButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    ...SHADOWS.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 10,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '22%',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedTimeSlot: {
    backgroundColor: COLORS.primary,
  },
  timeText: {
    ...FONTS.body4,
    color: COLORS.text,
  },
  selectedTimeText: {
    color: COLORS.white,
  },
  recurringContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  recurringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '13%',
    height: 40,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    ...FONTS.body5,
    color: COLORS.text,
  },
  selectedDayText: {
    color: COLORS.white,
  },
  footer: {
    marginTop: 10,
  },
  scheduleButton: {
    width: '100%',
  },
});

export default ScheduleRideModal; 