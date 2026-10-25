import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';

// SECURITY: Load from app.json > extra or .env via expo-constants
// To configure, add these to your app.json under "extra":
//   "supabaseUrl": "https://your-project.supabase.co",
//   "supabaseAnonKey": "your-anon-key"
const FALLBACK_SUPABASE_URL = "https://rylwyxhupwpwsdbvuoej.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bHd5eGh1cHdwd3NkYnZ1b2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MzI1NTcsImV4cCI6MjA5MjAwODU1N30.xuRj9PZgZys2b64pNnjhXOVyDjtGVFlBno2o9hiisHA";

const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || (Constants as any).manifest?.extra?.supabaseUrl || (Constants as any).manifest2?.extra?.expoClient?.extra?.supabaseUrl || FALLBACK_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || (Constants as any).manifest?.extra?.supabaseAnonKey || (Constants as any).manifest2?.extra?.expoClient?.extra?.supabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY;

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
