/**
 * IShare - Ride Sharing App
 */

import React, { useEffect } from 'react';
import { StatusBar, SafeAreaView, StyleSheet, Text, LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/styles/theme';
import { API_URL } from './src/config/apiConfig';

// Ignore specific warnings that we can't fix
LogBox.ignoreLogs([
  'NativeModule: AsyncStorage is null',
  '[react-native-gesture-handler]',
  'Sending `onAnimatedValueUpdate`'
]);

// Install a global fallback for AsyncStorage
global.asyncStorageBackup = new Map<string, string>();

function App(): React.JSX.Element {
  // Log initialization
  useEffect(() => {
    console.log('===== IShare App Initializing =====');
    console.log('API URL:', API_URL);
    
    // Set up global error handler
    const originalConsoleError = console.error;
    
    console.error = (...args: any[]) => {
      // Check if this is the AsyncStorage error
      if (args[0] && typeof args[0] === 'string' && 
          args[0].includes('NativeModule: AsyncStorage is null')) {
        console.log('AsyncStorage error detected, using in-memory fallback');
        return;
      }
      // Pass through to original console.error
      originalConsoleError(...args);
    };
    
    // Set up global unhandled promise rejection handler
    const handlePromiseRejection = (event: any) => {
      console.error('UNHANDLED PROMISE REJECTION:', event.reason);
    };

    // Add event listener
    if (global.addEventListener) {
      global.addEventListener('unhandledrejection', handlePromiseRejection);
    }
    
    return () => {
      console.error = originalConsoleError;
      
      // Remove event listener
      if (global.removeEventListener) {
        global.removeEventListener('unhandledrejection', handlePromiseRejection);
      }
    };
  }, []);
  
  return (
    <Provider store={store}>
      <SafeAreaView style={styles.container}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={COLORS.primary} 
        />
        <AppNavigator />
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
