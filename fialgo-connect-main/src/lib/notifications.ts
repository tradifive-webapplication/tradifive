import { supabase } from "./supabase";

export type NotificationType =
  | 'SECURITY'
  | 'SYSTEM'
  | 'PAYMENT'
  | 'TRADE'
  | 'ACCOUNT'
  | 'FOLLOW'
  | 'FOLLOW_REQUEST'
  | 'FOLLOW_ACCEPTED'
  | 'MESSAGE'
  | 'CHANNEL_MESSAGE'
  | 'SOCIAL'
  | 'MENTION'
  | 'ACHIEVEMENT'
  | 'RISK_GUARD'
  | 'PROFILE_VIEW';

interface NotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high';
  metadata?: any;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  priority = 'normal',
  metadata = {}
}: NotificationOptions) {
  try {
    const { error } = await supabase.from("notifications").insert([{
      user_id: userId,
      type,
      title,
      message,
      priority,
      metadata
    }]);

    if (error) console.error("Notification delivery failed:", error);
  } catch (err) {
    console.error("System error recording notification:", err);
  }
}
