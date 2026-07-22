import { useColorScheme } from 'react-native';
import { useStore } from '@/app/store';

// ─── Exact palette from web/admin app dark theme (index.css .dark class) ────
// --background: 0 0% 4%        → #0a0a0a
// --card:       0 0% 4%        → #0a0a0a
// --secondary:  0 0% 11%       → #1c1c1c
// --accent:     0 0% 17%       → #2b2b2b
// --border:     216 34% 17%    → #1e2a3a
// --foreground: 0 0% 91%       → #e8e8e8
// --muted-fg:   0 0% 57%       → #919191

export function useAppTheme() {
  const deviceColorScheme = useColorScheme();

  // Preferences nested inside currentUser.preferences
  const preferences = useStore((state) => state.currentUser?.preferences);
  const systemThemeMode = preferences?.systemThemeMode ?? 'light';
  const darkModeOverride = preferences?.darkModeOverride ?? false;

  const isDark =
    systemThemeMode === 'dark' ||
    darkModeOverride === true ||
    (systemThemeMode === 'auto' && deviceColorScheme === 'dark');

  const theme = {
    // Page backgrounds
    background:   isDark ? '#0a0a0a' : '#f4f4f6',
    // Card / surface backgrounds
    card:         isDark ? '#111111' : '#ffffff',
    cardAlt:      isDark ? '#1c1c1c' : '#f8fafc',
    // Elevated surfaces (modals, dropdowns)
    elevated:     isDark ? '#1c1c1c' : '#ffffff',
    // Accent/highlight surfaces
    accent:       isDark ? '#2b2b2b' : '#f1f5f9',
    // Borders
    border:       isDark ? '#1e2a3a' : '#e2e8f0',
    cardBorder:   isDark ? '#222222' : '#e2e8f0',
    separator:    isDark ? '#1a1a1a' : '#f1f5f9',
    // Text
    text:         isDark ? '#e8e8e8' : '#0f172a',
    textDim:      isDark ? '#919191' : '#64748b',
    textSecondary:isDark ? '#919191' : '#64748b',
    textMuted:    isDark ? '#636363' : '#94a3b8',
    // Inputs
    inputBg:      isDark ? '#111111' : '#f8fafc',
    inputBorder:  isDark ? '#1e2a3a' : '#e2e8f0',
    // Tab bar
    tabBar:       isDark ? '#0a0a0a' : '#ffffff',
    tabBarBorder: isDark ? '#1a1a1a' : '#e2e8f0',
    // Status bar
    statusBar:    isDark ? ('light-content' as const) : ('dark-content' as const),
    // Primary brand colour (unchanged in both modes)
    primary:      '#6366f1',
    primaryLight: '#818cf8',
  } as const;

  return { isDark, theme };
}
