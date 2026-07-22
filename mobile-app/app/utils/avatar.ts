import { Image } from 'react-native';

export const getAvatarUrl = (avatarUrl?: string | null, email?: string | null, seed?: string | null): string => {
  // If user uploaded a profile picture or has a Google Auth email image (which is stored in avatarUrl), use it
  if (avatarUrl && avatarUrl.trim() !== '' && !avatarUrl.includes('api.dicebear.com')) {
    return avatarUrl;
  }

  // Otherwise, use a default generated photo based on their name/email
  const fallbackName = seed || (email ? email.split('@')[0] : 'U');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=e2e8f0&color=475569&size=150`;
};
