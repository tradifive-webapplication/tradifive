import { supabase } from "@/lib/supabase";

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

export async function uploadSupportAttachment(
  file: File,
  userId?: string
): Promise<ChatAttachment | null> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `support/${userId || 'guest'}/${Date.now()}_${cleanName}`;

  let detectedType: 'image' | 'video' | 'document' = 'document';
  if (file.type.startsWith('image/')) {
    detectedType = 'image';
  } else if (file.type.startsWith('video/')) {
    detectedType = 'video';
  }

  try {
    // 1. Try uploading to 'attachments' bucket
    const { data, error } = await supabase.storage.from('attachments').upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

    if (!error && data) {
      const { data: urlData } = supabase.storage.from('attachments').getPublicUrl(path);
      return {
        url: urlData.publicUrl,
        type: detectedType,
        name: file.name,
        size: file.size
      };
    }

    // 2. Try 'support-attachments' bucket as fallback
    const { data: data2, error: error2 } = await supabase.storage.from('support-attachments').upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

    if (!error2 && data2) {
      const { data: urlData2 } = supabase.storage.from('support-attachments').getPublicUrl(path);
      return {
        url: urlData2.publicUrl,
        type: detectedType,
        name: file.name,
        size: file.size
      };
    }
  } catch (err) {
    console.warn("Storage upload failed, falling back to base64 if image:", err);
  }

  // 3. Fallback for images: Data URI Base64 (up to 3MB)
  if (detectedType === 'image' && file.size < 3 * 1024 * 1024) {
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      return {
        url: base64,
        type: 'image',
        name: file.name,
        size: file.size
      };
    } catch (e) {
      console.error("Base64 conversion failed:", e);
    }
  }

  return null;
}
