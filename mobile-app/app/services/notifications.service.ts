import { supabase } from '../utils/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: 'SECURITY' | 'SYSTEM' | 'PAYMENT' | 'TRADE' | 'ACCOUNT';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  is_read: boolean;
  metadata?: any;
  created_at: string;
}

export class NotificationsService {
  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (error) {
      console.error('[NotificationsService] Error fetching notifications:', error.message);
      return [];
    }
    return data || [];
  }

  static async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
      
    if (error) throw new Error(error.message);
  }
}
