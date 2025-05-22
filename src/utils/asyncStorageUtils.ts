// Create a pure in-memory implementation since AsyncStorage native module is null
const inMemoryStorage = new Map<string, string>();

/**
 * Get an item from storage
 */
export const getItem = async (key: string): Promise<string | null> => {
  try {
    console.log(`Getting value for key: ${key}`);
    return inMemoryStorage.get(key) || null;
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
    console.log(`Setting key: ${key} with value: ${value}`);
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
  // In-memory storage is always available
  return true;
};

// Export a mock AsyncStorage interface
export default {
  getItem: (key: string) => Promise.resolve(inMemoryStorage.get(key) || null),
  setItem: (key: string, value: string) => {
    inMemoryStorage.set(key, value);
    return Promise.resolve(null);
  },
  removeItem: (key: string) => {
    inMemoryStorage.delete(key);
    return Promise.resolve(null);
  },
  getAllKeys: () => Promise.resolve(Array.from(inMemoryStorage.keys())),
  multiGet: (keys: string[]) => Promise.resolve(
    keys.map(key => [key, inMemoryStorage.get(key) || null])
  ),
  multiSet: (keyValuePairs: [string, string][]) => {
    keyValuePairs.forEach(([key, value]) => inMemoryStorage.set(key, value));
    return Promise.resolve(null);
  },
  multiRemove: (keys: string[]) => {
    keys.forEach(key => inMemoryStorage.delete(key));
    return Promise.resolve(null);
  },
  clear: () => {
    inMemoryStorage.clear();
    return Promise.resolve(null);
  },
}; 