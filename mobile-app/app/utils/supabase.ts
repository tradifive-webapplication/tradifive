import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

// SECURITY: Load from app.json > extra or .env via expo-constants
// To configure, add these to your app.json under "extra":
//   "supabaseUrl": "https://your-project.supabase.co",
//   "supabaseAnonKey": "your-anon-key"
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || "";
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || "";

import { Platform } from 'react-native';

// SSR-safe storage wrapper for AsyncStorage on Web
const ssrSafeStorage = {
  getItem: async (key: string) => {
    if (typeof window === 'undefined') {
      return null;
    }
    if (Platform.OS === 'web') {
      return window.localStorage.getItem(key);
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, value);
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Ignore
    }
  },
  removeItem: async (key: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key);
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // Ignore
    }
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ssrSafeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
