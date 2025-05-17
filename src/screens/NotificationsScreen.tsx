import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import EmptyState from '../components/EmptyState';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    title: 'Ride Completed',
    message: 'Your ride to Central Mall has been completed. Rate your experience!',
    time: '2023-10-15T14:45:00',
    read: false,
    type: 'ride',
  },
  {
    id: '2',
    title: 'Payment Processed',
    message: 'Your payment of $15.75 has been processed successfully.',
    time: '2023-10-15T14:40:00',
    read: false,
    type: 'payment',
  },
  {
    id: '3',
    title: 'Ride Scheduled',
    message: 'Your ride to Conference Center has been scheduled for tomorrow at 10:00 AM.',
    time: '2023-10-14T18:30:00',
    read: true,
    type: 'ride',
  },
  {
    id: '4',
    title: 'Discount Offer',
    message: 'Get 20% off on your next 3 rides! Use code SHARE20.',
    time: '2023-10-12T10:15:00',
    read: true,
    type: 'promo',
  },
  {
    id: '5',
    title: 'New Feature',
    message: 'You can now schedule rides up to 7 days in advance!',
    time: '2023-10-10T09:00:00',
    read: true,
    type: 'system',
  },
];

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState(mockNotifications);

  useEffect(() => {
    // In a real app, would dispatch an action to mark all notifications as read
    // dispatch(markAllNotificationsAsRead());
  }, []);

  const handleNotificationPress = (notification: any) => {
    // Mark notification as read
    const updatedNotifications = notifications.map(item => 
      item.id === notification.id ? { ...item, read: true } : item
    );
    setNotifications(updatedNotifications);

    // Navigate based on notification type
    if (notification.type === 'ride') {
      navigation.navigate('RideHistory');
    } else if (notification.type === 'payment') {
      navigation.navigate('Payment');
    } else if (notification.type === 'promo') {
      navigation.navigate('HomeScreen');
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    // In a real app, would dispatch an action to clear notifications
    // dispatch(clearAllNotifications());
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ride':
        return 'car-outline';
      case 'payment':
        return 'card-outline';
      case 'promo':
        return 'gift-outline';
      case 'system':
        return 'information-circle-outline';
      default:
        return 'notifications-outline';
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, styles[`${item.type}IconContainer`]]}>
        <Ionicons 
          name={getNotificationIcon(item.type)} 
          size={20} 
          color={COLORS.white} 
        />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{formatTimeAgo(item.time)}</Text>
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="notifications"
      message="You don't have any notifications yet"
      actionText="Refresh"
      onAction={() => setNotifications(mockNotifications)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {notifications.length > 0 ? (
        <>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />

          <TouchableOpacity style={styles.clearButton} onPress={clearNotifications}>
            <Text style={styles.clearButtonText}>Clear All Notifications</Text>
          </TouchableOpacity>
        </>
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // To allow space for the clear button
  },
  notificationItem: {
    flexDirection: 'row',
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  unreadNotification: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  readNotification: {
    backgroundColor: COLORS.white,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rideIconContainer: {
    backgroundColor: COLORS.primary,
  },
  paymentIconContainer: {
    backgroundColor: COLORS.success,
  },
  promoIconContainer: {
    backgroundColor: COLORS.warning,
  },
  systemIconContainer: {
    backgroundColor: COLORS.textSecondary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationTitle: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  notificationTime: {
    ...FONTS.small,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  notificationMessage: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    top: 18,
    right: 16,
  },
  clearButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 16,
    borderRadius: SIZES.radius - 4,
    alignItems: 'center',
  },
  clearButtonText: {
    ...FONTS.body3,
    color: COLORS.error,
    fontWeight: '500',
  },
});

export default NotificationsScreen; 