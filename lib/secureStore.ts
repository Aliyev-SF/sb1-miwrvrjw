/**
 * A web-compatible replacement for expo-secure-store
 * This is used when the app is running in a web browser
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Interface to match SecureStore's API
interface SecureStoreInterface {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
}

// Web implementation using localStorage
const webSecureStore: SecureStoreInterface = {
  getItemAsync: async (key: string) => {
    return localStorage.getItem(key);
  },
  setItemAsync: async (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  deleteItemAsync: async (key: string) => {
    localStorage.removeItem(key);
  },
};

// Native implementation using expo-secure-store
const nativeSecureStore: SecureStoreInterface = {
  getItemAsync: SecureStore.getItemAsync,
  setItemAsync: SecureStore.setItemAsync,
  deleteItemAsync: SecureStore.deleteItemAsync,
};

// Export the appropriate implementation based on platform
export default Platform.OS === 'web' ? webSecureStore : nativeSecureStore;