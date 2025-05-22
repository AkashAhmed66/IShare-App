import { apiService } from './apiService';
import { API_ENDPOINTS } from '../config/apiConfig';
import { socketService } from './socketService';
import { User } from './authService';

// Message interface
export interface Message {
  _id: string;
  content: string;
  sender: string | User;
  receiver: string | User;
  ride: string;
  createdAt: string;
  isRead: boolean;
  attachments?: Array<{
    type: 'image' | 'audio' | 'location';
    url: string;
    metadata?: any;
  }>;
}

class MessageService {
  /**
   * Send a new message
   */
  async sendMessage(
    receiverId: string,
    rideId: string,
    content: string,
    attachments?: Array<{ type: string; url: string; metadata?: any }>
  ): Promise<Message> {
    try {
      // Send via API
      const response = await apiService.post<Message>(
        API_ENDPOINTS.SEND_MESSAGE,
        {
          receiverId,
          rideId,
          content,
          attachments
        }
      );

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send a message via socket for immediate delivery
   * This should be used alongside the API call for reliability
   */
  sendMessageViaSocket(
    senderId: string,
    receiverId: string,
    rideId: string,
    content: string,
    attachments?: Array<{ type: string; url: string; metadata?: any }>
  ): boolean {
    return socketService.sendMessage({
      senderId,
      receiverId,
      rideId,
      content,
      attachments
    });
  }

  /**
   * Get conversation between current user and another user
   */
  async getConversation(userId: string, limit = 50, skip = 0): Promise<Message[]> {
    try {
      return await apiService.get<Message[]>(
        `${API_ENDPOINTS.CONVERSATION(userId)}?limit=${limit}&skip=${skip}`
      );
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  /**
   * Get all messages for a specific ride
   */
  async getRideMessages(rideId: string, limit = 100, skip = 0): Promise<Message[]> {
    try {
      return await apiService.get<Message[]>(
        `${API_ENDPOINTS.RIDE_MESSAGES(rideId)}?limit=${limit}&skip=${skip}`
      );
    } catch (error) {
      console.error('Error fetching ride messages:', error);
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<Message> {
    try {
      const response = await apiService.put<Message>(
        API_ENDPOINTS.MARK_AS_READ(messageId)
      );

      // Also notify via socket for real-time updates
      socketService.markMessageAsRead(messageId);

      return response;
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Get count of unread messages
   */
  async getUnreadCount(): Promise<{ total: number; byUser: Array<{ sender: User; count: number }> }> {
    try {
      return await apiService.get(API_ENDPOINTS.UNREAD_COUNT);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Set up socket listeners for incoming messages
   * @param callbacks Object containing callback functions for message events
   */
  setupMessageListeners(callbacks: {
    onNewMessage?: (message: Message) => void;
    onMessageRead?: (data: { messageId: string; readBy: string; readAt: Date }) => void;
  }) {
    // Listen for new messages
    if (callbacks.onNewMessage) {
      socketService.socket.on('new_message', callbacks.onNewMessage);
    }

    // Listen for read receipts
    if (callbacks.onMessageRead) {
      socketService.socket.on('message_read', callbacks.onMessageRead);
    }

    return () => {
      // Cleanup function to remove listeners
      if (callbacks.onNewMessage) {
        socketService.socket.off('new_message', callbacks.onNewMessage);
      }
      if (callbacks.onMessageRead) {
        socketService.socket.off('message_read', callbacks.onMessageRead);
      }
    };
  }
}

export const messageService = new MessageService(); 