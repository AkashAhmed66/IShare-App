import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback in-memory storage in case AsyncStorage fails
const inMemoryStorage = new Map<string, string>();

/**
 * Get an item from storage
 */
export const getItem = async (key: string): Promise<string | null> => {
  try {
    console.log(`Getting value for key: ${key}`);
    // Try to get from actual AsyncStorage first
    try {
      const value = await AsyncStorage.getItem(key);
      return value;
    } catch (asyncError) {
      console.warn(`AsyncStorage error, falling back to in-memory for key ${key}:`, asyncError);
      return inMemoryStorage.get(key) || null;
    }
  } catch (error) {
    console.error(`Error getting item ${key} from storage:`, error);
    return null;
  }
};

/**
 * Set an item in storage
 */
export const setItem = async (key: string, value: string): Promise<boolean> => {
  try {
    console.log(`Setting key: ${key} with value length: ${value.length}`);
    
    // Store in both AsyncStorage and in-memory fallback
    try {
      await AsyncStorage.setItem(key, value);
    } catch (asyncError) {
      console.warn(`AsyncStorage error, using only in-memory for key ${key}:`, asyncError);
    }
    
    // Also store in memory as fallback
    inMemoryStorage.set(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting item ${key} in storage:`, error);
    return false;
  }
};

/**
 * Remove an item from storage
 */
export const removeItem = async (key: string): Promise<boolean> => {
  try {
    console.log(`Removing key: ${key}`);
    
    // Remove from both AsyncStorage and in-memory fallback
    try {
      await AsyncStorage.removeItem(key);
    } catch (asyncError) {
      console.warn(`AsyncStorage error while removing key ${key}:`, asyncError);
    }
    
    // Also remove from in-memory fallback
    inMemoryStorage.delete(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from storage:`, error);
    return false;
  }
};

/**
 * Test if storage is available
 */
export const testAsyncStorage = async (): Promise<boolean> => {
  try {
    await AsyncStorage.setItem('__test__', 'test');
    await AsyncStorage.removeItem('__test__');
    return true;
  } catch (error) {
    console.warn('AsyncStorage is not available, using in-memory storage');
    return false;
  }
};

/**
 * Clear all storage
 * This should be called during logout to ensure all data is cleared
 */
export const clearAllStorage = async (): Promise<boolean> => {
  try {
    console.log('Clearing all storage');
    
    // Clear AsyncStorage
    try {
      await AsyncStorage.clear();
    } catch (asyncError) {
      console.warn('AsyncStorage error while clearing storage:', asyncError);
    }
    
    // Clear in-memory fallback
    inMemoryStorage.clear();
    console.log('All storage cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// Export a compatible AsyncStorage interface
export default {
  getItem,
  setItem,
  removeItem,
  clearAllStorage,
  getAllKeys: async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      return Array.from(inMemoryStorage.keys());
    }
  },
  multiGet: async (keys: string[]) => {
    try {
      return await AsyncStorage.multiGet(keys);
    } catch (error) {
      return keys.map(key => [key, inMemoryStorage.get(key) || null]);
    }
  },
  multiSet: async (keyValuePairs: [string, string][]) => {
    try {
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      keyValuePairs.forEach(([key, value]) => inMemoryStorage.set(key, value));
    }
    return null;
  },
  multiRemove: async (keys: string[]) => {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      keys.forEach(key => inMemoryStorage.delete(key));
    }
    return null;
  },
  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      inMemoryStorage.clear();
    }
    return null;
  },
}; 