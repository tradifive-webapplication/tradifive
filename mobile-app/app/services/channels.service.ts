import { supabase } from '../utils/supabase';

export interface Channel {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  is_verified: boolean;
  member_count: number;
  created_at: string;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: any;
}

export class ChannelsService {
  static async getChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
      .from('community_channels')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('[ChannelsService] Error fetching channels:', error.message);
      return [];
    }
    return data || [];
  }

  static async getMessages(channelId: string): Promise<ChannelMessage[]> {
    const { data, error } = await supabase
      .from('channel_messages')
      .select('*, profiles(*)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('[ChannelsService] Error fetching messages:', error.message);
      return [];
    }
    return data || [];
  }

  static async sendMessage(channelId: string, userId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('channel_messages')
      .insert([{ channel_id: channelId, user_id: userId, content }]);
      
    if (error) throw new Error(error.message);
  }
}
