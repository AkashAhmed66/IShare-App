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
import * as Storage from './src/utils/asyncStorageUtils';

// Ignore specific warnings that we can't fix
LogBox.ignoreLogs([
  'NativeModule: AsyncStorage is null',
  '[react-native-gesture-handler]',
  'Sending `onAnimatedValueUpdate`'
]);

// Define custom global type to include our custom properties
declare global {
  var asyncStorageBackup: Map<string, string>;
  interface WindowEventMap {
    unhandledrejection: PromiseRejectionEvent;
  }
}

// Install a global fallback for AsyncStorage
// @ts-ignore
global.asyncStorageBackup = new Map<string, string>();

function App(): React.JSX.Element {
  // Log initialization
  useEffect(() => {
    console.log('===== IShare App Initializing =====');
    console.log('API URL:', API_URL);
    
    // Test AsyncStorage availability
    const checkStorage = async () => {
      const isAvailable = await Storage.testAsyncStorage();
      console.log(`AsyncStorage available: ${isAvailable}`);
      
      if (!isAvailable) {
        console.warn('Using in-memory storage fallback');
      }
    };
    
    checkStorage();
    
    // Set up global error handler for AsyncStorage issues
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
    
    return () => {
      console.error = originalConsoleError;
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
