import { supabase } from '../utils/supabase';

export interface MT5Account {
  id: string;
  user_id: string;
  account_number: string;
  broker: string;
  server: string;
  balance: number;
  equity: number;
  margin: number;
  margin_free: number;
  algo_status: boolean;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  account_id: string;
  symbol: string;
  profit: number;
  type: string;
  volume: number;
  closed_at: string | null;
  created_at: string;
  notes?: string;
}

export class TradingService {
  static async getAccountMetrics(userId: string): Promise<MT5Account | null> {
    try {
      const { data, error } = await supabase
        .from('mt5_accounts')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data[0];
      }
    } catch (err: any) {
      console.error('[TradingService] Error fetching account metrics:', err.message);
    }
    
    // Return null when no real MT5 account is linked yet
    return null;
  }

  static async getRecentTrades(userId: string): Promise<Trade[]> {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('closed_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data;
      }
    } catch (err: any) {
      console.error('[TradingService] Error fetching recent trades:', err.message);
    }
    
    // Return empty array instead of mock data
    return [];
  }

  static async toggleAlgoStatus(userId: string, newState: boolean) {
    const { error } = await supabase
      .from('mt5_accounts')
      .update({ algo_status: newState })
      .eq('user_id', userId);
      
    if (error) throw new Error(error.message);
  }
}
