import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import EmptyState from '../components/EmptyState';
import { RootState } from '../redux/store';
import { notificationService, Notification } from '../services/notificationService';
import { socketService } from '../services/socketService';
import { 
  fetchNotificationsStart, 
  fetchNotificationsFailure, 
  fetchNotificationsSuccess,
  markAllAsRead as markAllReadAction 
} from '../redux/slices/notificationSlice';

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading, error } = useSelector(
    (state: RootState) => state.notification
  );
  
  const [refreshing, setRefreshing] = useState(false);

  // Load notifications when screen mounts
  useEffect(() => {
    loadNotifications();
  }, []);

  // Mark all as read when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      handleMarkAllAsRead();
    });
    return unsubscribe;
  }, [navigation]);

  // Function to load notifications from the server
  const loadNotifications = async () => {
    dispatch(fetchNotificationsStart());
    try {
      const fetchedNotifications = await notificationService.getNotifications();
      dispatch(fetchNotificationsSuccess(fetchedNotifications));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      dispatch(fetchNotificationsFailure(error.message || 'Failed to load notifications'));
    }
  };

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Handle notification press
  const handleNotificationPress = async (notification: Notification) => {
    try {
      // Mark as read in backend
      await notificationService.markAsRead(notification.id);
      
      // Navigate to appropriate screen based on notification type
      notificationService.navigateToNotificationDestination(navigation, notification);
    } catch (error) {
      console.error('Error handling notification press:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      dispatch(markAllReadAction());
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      Alert.alert(
        'Clear All Notifications',
        'Are you sure you want to clear all notifications? This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear All', 
            style: 'destructive',
            onPress: async () => {
              await notificationService.clearAllNotifications();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  // Simulate a test notification (for debugging)
  const simulateNotification = () => {
    socketService.simulateNotification(
      'ride', 
      'Test Notification',
      'This is a test notification from the app.',
      { testData: true }
    );
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
      case 'driver_update':
        return 'navigate-outline';
      case 'system':
      default:
        return 'notifications-outline';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.read ? styles.readNotification : styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, styles[`${item.type}IconContainer` as keyof typeof styles] || styles.systemIconContainer]}>
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
          {item.body}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="notifications"
      message={error ? `Error: ${error}` : "You don't have any notifications yet"}
      actionText={error ? "Try Again" : "Test Notification"}
      onAction={error ? loadNotifications : simulateNotification}
    />
  );

  if (isLoading && !refreshing && notifications.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {notifications.length > 0 ? (
        <>
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
              />
            }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 12,
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
  driver_updateIconContainer: {
    backgroundColor: COLORS.info,
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