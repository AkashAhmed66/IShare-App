import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { loginSuccess, loginStart, loginFailure } from '../redux/slices/authSlice';
import { authService } from '../services/authService';
import { API_URL } from '../config/apiConfig';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Checking connection...'
  });

  // Check API connection on mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  // Function to check API connection
  const checkApiConnection = async () => {
    try {
      console.log('Testing API connection to:', API_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_URL}`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('API connection successful');
        setApiStatus({
          connected: true,
          message: 'Connected to server'
        });
      } else {
        console.log('API connection failed with status:', response.status);
        setApiStatus({
          connected: false,
          message: `Server error: ${response.status}`
        });
      }
    } catch (error: any) {
      console.error('API connection error:', error);
      setApiStatus({
        connected: false,
        message: error.name === 'AbortError' 
          ? 'Connection timeout' 
          : `Connection error: ${error.message}`
      });
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    dispatch(loginStart());
    
    console.log(`Attempting to login with API at: ${API_URL}`);
    console.log(`Email: ${email}`);

    try {
      // For testing/demo purposes only - use this if your API is not running
      if (email === 'demo@example.com' && password === 'password') {
        console.log('Using demo account');
        
        // Mock user data for demo purposes
        const userData = {
          user: {
            id: 'demo-user-id',
            name: 'Demo User',
            email: email,
            phone: '+1234567890',
            profilePic: '',
            paymentMethods: [],  // Add these to fix the type error
            savedPlaces: []      // Add these to fix the type error
          },
          token: 'mock-token-123'
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch(loginSuccess(userData));
        console.log('Demo login successful');
        return;
      }
      
      // Call the login API through authService
      console.log('Calling login API...');
      const user = await authService.login(email, password);
      console.log('API response received:', JSON.stringify(user));
      
      // Get the auth token
      const token = await authService.getToken();
      
      if (!user || !token) {
        throw new Error('Login failed: Invalid response from server');
      }
      
      console.log('Login successful for user:', user.name);
      
      // Create the user data object to match the expected structure
      const userData = {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profilePic: user.profilePic || '',
          paymentMethods: [], // Adding these empty arrays to match required type
          savedPlaces: [],    // Adding these empty arrays to match required type
        },
        token: token
      };
      
      // Dispatch success action to Redux
      dispatch(loginSuccess(userData));
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Get detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Invalid email or password';
      console.log('Error details:', errorMessage);
      
      dispatch(loginFailure(errorMessage));
      
      Alert.alert(
        'Login Failed',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.appName}>IShare</Text>
            <Text style={styles.tagline}>Ride together, save together</Text>
            <Text style={styles.apiUrl}>{API_URL}</Text>
            <Text style={[
              styles.connectionStatus,
              { color: apiStatus.connected ? COLORS.success : COLORS.error }
            ]}>
              {apiStatus.message}
            </Text>
            {!apiStatus.connected && (
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={checkApiConnection}
              >
                <Text style={styles.retryText}>Retry Connection</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Login</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.textSecondary}
                secureTextEntry={secureTextEntry}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={toggleSecureTextEntry} style={styles.eyeIcon}>
                <Ionicons
                  name={secureTextEntry ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color={COLORS.text} />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.registerContainer}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerLink}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  appName: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginBottom: 8,
  },
  tagline: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  apiUrl: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  connectionStatus: {
    ...FONTS.body4,
    marginTop: 4
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 4
  },
  retryText: {
    ...FONTS.body4,
    color: COLORS.white
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    paddingHorizontal: 16,
    marginBottom: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    ...FONTS.body3,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    ...FONTS.body4,
    color: COLORS.primary,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius - 4,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: COLORS.inactive,
  },
  buttonText: {
    ...FONTS.body3,
    color: COLORS.white,
    fontWeight: '600',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
    marginHorizontal: 10,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius - 4,
    height: 50,
    marginBottom: 24,
  },
  socialButtonText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 10,
  },
  registerContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  registerText: {
    ...FONTS.body4,
    color: COLORS.textSecondary,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginScreen; 