import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import secureStore from './secureStore';

// SecureStore adapter for Supabase auth
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return secureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return secureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return secureStore.deleteItemAsync(key);
  },
};

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});