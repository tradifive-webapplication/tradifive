import { Redirect, useRootNavigationState } from 'expo-router';
import { Platform } from 'react-native';

export default function Index() {
  const rootNavigationState = useRootNavigationState();

  if (!rootNavigationState?.key) return null;

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const hasSession = Object.keys(window.localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (hasSession) {
      return <Redirect href="/(tabs)" />;
    }
  }
  // Always start with the Splash Screen
  return <Redirect href="/splash" />;
}
