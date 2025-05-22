import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { RootState } from '../redux/store';
import { formatDistanceToNow } from '../utils/dateUtils';
import { socketService } from '../services/socketService';
import { apiService } from '../services/apiService';

// Sample avatar for when no image is available
const DEFAULT_AVATAR = require('../assets/default-avatar.png');

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    profilePic?: string;
  };
  receiver: {
    _id: string;
    name: string;
    profilePic?: string;
  };
  ride: string;
  createdAt: string;
  isRead: boolean;
  attachments?: Array<{
    type: 'image' | 'audio' | 'location';
    url: string;
    metadata?: any;
  }>;
}

const ChatScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const flatListRef = useRef<FlatList>(null);

  // Get passed parameters
  const { otherUser, rideId } = route.params;

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set header title to the other user's name
    navigation.setOptions({
      title: otherUser.name,
      headerRight: () => (
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {
            // Navigate to ride details or user profile
            navigation.navigate('RideDetailsScreen', { rideId });
          }}
        >
          <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      ),
    });

    // Load messages for this ride
    loadMessages();

    // Listen for new messages
    const messageListener = socketService.socket.on('new_message', (newMessage: Message) => {
      if (
        newMessage.ride === rideId &&
        ((newMessage.sender._id === otherUser._id && newMessage.receiver._id === user?._id) ||
         (newMessage.sender._id === user?._id && newMessage.receiver._id === otherUser._id))
      ) {
        setMessages(prevMessages => [newMessage, ...prevMessages]);
        
        // Mark message as read if we received it
        if (newMessage.sender._id === otherUser._id && !newMessage.isRead) {
          markMessageAsRead(newMessage._id);
        }
      }
    });

    return () => {
      // Clean up
      socketService.socket.off('new_message', messageListener);
    };
  }, []);

  const loadMessages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get(`/messages/ride/${rideId}`);
      setMessages(response.data);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user || isSending) return;
    
    setIsSending(true);
    
    try {
      const messageData = {
        receiverId: otherUser._id,
        rideId,
        content: inputMessage.trim(),
      };
      
      const response = await apiService.post('/messages', messageData);
      setMessages(prevMessages => [response.data, ...prevMessages]);
      setInputMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await apiService.put(`/messages/${messageId}/read`);
      
      // Update local message state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender._id === user?._id;
    const avatar = item.sender.profilePic 
      ? { uri: item.sender.profilePic } 
      : DEFAULT_AVATAR;
      
    return (
      <View 
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
        ]}
      >
        {!isMyMessage && (
          <Image source={avatar} style={styles.avatar} />
        )}
        
        <View 
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
          ]}
        >
          <Text style={styles.messageText}>{item.content}</Text>
          <Text 
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime
            ]}
          >
            {formatDistanceToNow(new Date(item.createdAt))}
            {isMyMessage && (
              <Text> {item.isRead ? ' • Read' : ' • Sent'}</Text>
            )}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      );
    }
    
    if (messages.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={50} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubText}>Start the conversation with your {otherUser.role === 'driver' ? 'driver' : 'passenger'}</Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesContainer}
          inverted
          ListHeaderComponent={renderHeader()}
        />
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Ionicons name="close-circle" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textSecondary}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputMessage.trim() || isSending) && styles.disabledSendButton
            ]}
            onPress={sendMessage}
            disabled={!inputMessage.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons name="send" size={20} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...SHADOWS.medium,
  },
  myMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.cardBackground,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  messageTime: {
    ...FONTS.caption,
    marginTop: 4,
  },
  myMessageTime: {
    color: COLORS.lightText,
    textAlign: 'right',
  },
  otherMessageTime: {
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    ...FONTS.body3,
    color: COLORS.text,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: COLORS.primaryLight,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    ...FONTS.h3,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptySubText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.error,
    padding: 12,
    margin: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    ...FONTS.body3,
    color: COLORS.white,
    flex: 1,
  },
  infoButton: {
    paddingHorizontal: 16,
  },
});

export default ChatScreen; 