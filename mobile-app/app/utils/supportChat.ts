import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

export interface ChatAttachment {
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
  size?: number;
}

export interface ParsedChatMessage {
  text: string;
  attachments: ChatAttachment[];
}

export function serializeChatMessage(text: string, attachments: ChatAttachment[]): string {
  if (!attachments || attachments.length === 0) {
    return text.trim();
  }
  return JSON.stringify({
    type: 'rich_chat',
    text: text.trim(),
    attachments
  });
}

export function parseChatMessage(raw: string): ParsedChatMessage {
  if (!raw) return { text: '', attachments: [] };
  try {
    const data = JSON.parse(raw);
    if (data && (data.type === 'rich_chat' || Array.isArray(data.attachments))) {
      return {
        text: data.text || '',
        attachments: Array.isArray(data.attachments) ? data.attachments : []
      };
    }
  } catch (e) {
    // raw is plain text
  }
  return {
    text: raw,
    attachments: []
  };
}

export async function uploadMobileAttachment(
  uri: string,
  name: string,
  detectedType: 'image' | 'video' | 'document',
  userId?: string
): Promise<ChatAttachment | null> {
  const cleanName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `support/${userId || 'mobile_user'}/${Date.now()}_${cleanName}`;

  try {
    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const mime = detectedType === 'image'
      ? (name.endsWith('.png') ? 'image/png' : 'image/jpeg')
      : detectedType === 'video'
        ? 'video/mp4'
        : 'application/octet-stream';

    // Decode base64 to Uint8Array for Supabase upload
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { data, error } = await supabase.storage.from('attachments').upload(path, bytes, {
      contentType: mime,
      upsert: true,
    });

    if (!error && data) {
      const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(path);
      return {
        url: urlData.publicUrl,
        type: detectedType,
        name,
      };
    }

    // Fallback to data URI if under 3MB
    if (detectedType === 'image' && base64Data.length < 4 * 1024 * 1024) {
      return {
        url: `data:${mime};base64,${base64Data}`,
        type: 'image',
        name,
      };
    }
  } catch (e) {
    console.warn("Mobile upload failed, trying direct base64 fallback:", e);
    try {
      if (detectedType === 'image') {
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return {
          url: `data:image/jpeg;base64,${base64Data}`,
          type: 'image',
          name,
        };
      }
    } catch (err) {
      console.error("Base64 fallback failed:", err);
    }
  }

  return null;
}
