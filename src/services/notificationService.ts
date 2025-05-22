import { apiService } from './apiService';
import { socketService } from './socketService';
import { store } from '../redux/store';
import { 
  addNotification, 
  clearAllNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  setNotifications
} from '../redux/slices/notificationSlice';

// Extended notification type with additional fields
export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'ride' | 'payment' | 'promo' | 'system' | 'driver_update'; 
  relatedId?: string; // ID of related entity (ride, payment, etc.)
  data?: any; // Additional data associated with notification
}

class NotificationService {
  /**
   * Fetch all notifications for current user
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiService.get<{ notifications: Notification[] }>('/api/notifications');
      
      // Update notifications in Redux
      store.dispatch(setNotifications(response.notifications));
      
      return response.notifications;
    } catch (error) {
      console.error('[NotificationService] Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiService.put(`/api/notifications/${notificationId}/read`);
      
      // Update in Redux
      store.dispatch(markAsRead(notificationId));
    } catch (error) {
      console.error(`[NotificationService] Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiService.put('/api/notifications/read-all');
      
      // Update in Redux
      store.dispatch(markAllAsRead());
    } catch (error) {
      console.error('[NotificationService] Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiService.delete(`/api/notifications/${notificationId}`);
      
      // Update in Redux
      store.dispatch(deleteNotification(notificationId));
    } catch (error) {
      console.error(`[NotificationService] Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await apiService.delete('/api/notifications');
      
      // Update in Redux
      store.dispatch(clearAllNotifications());
    } catch (error) {
      console.error('[NotificationService] Error clearing all notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiService.get<{ count: number }>('/api/notifications/unread/count');
      return response.count;
    } catch (error) {
      console.error('[NotificationService] Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(token: string, platform: 'ios' | 'android'): Promise<void> {
    try {
      await apiService.post('/api/notifications/device-token', { token, platform });
      console.log('[NotificationService] Device token registered successfully');
    } catch (error) {
      console.error('[NotificationService] Error registering device token:', error);
      throw error;
    }
  }

  /**
   * Handle incoming notification from socket
   */
  handleSocketNotification(notification: Notification): void {
    // Add to Redux store
    store.dispatch(addNotification(notification));
    
    // Could trigger a local push notification here if app is in background
    // (would require react-native-push-notification or similar)
  }
  
  /**
   * Navigation handler to open appropriate screen based on notification type
   */
  navigateToNotificationDestination(navigation: any, notification: Notification): void {
    switch (notification.type) {
      case 'ride':
        if (notification.relatedId) {
          navigation.navigate('RideStatus', { rideId: notification.relatedId });
        } else {
          navigation.navigate('RideHistory');
        }
        break;
        
      case 'payment':
        navigation.navigate('Payment');
        break;
        
      case 'promo':
        navigation.navigate('HomeScreen', { showPromo: true });
        break;
        
      case 'driver_update':
        if (notification.relatedId) {
          navigation.navigate('RideStatus', { rideId: notification.relatedId });
        }
        break;
        
      case 'system':
      default:
        // Do nothing or navigate to home
        navigation.navigate('HomeScreen');
        break;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService(); 