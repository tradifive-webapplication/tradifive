import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/integrations/supabase/types';

export type DbRiskConfig = Database['public']['Tables']['user_risk_configs']['Row'];

export function useRiskConfig(userId: string | undefined) {
  const [config, setConfig] = useState<DbRiskConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_risk_configs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching risk config:', error);
        return;
      }
      setConfig(data);
    } catch (err) {
      console.error('Error in fetchConfig:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchConfig();
    }
  }, [userId, fetchConfig]);

  const saveConfig = async (updates: Partial<Omit<DbRiskConfig, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!userId) return null;
    try {
      const { data: existing } = await supabase
        .from('user_risk_configs')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let result;
      if (existing) {
        const { data, error } = await supabase
          .from('user_risk_configs')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('user_risk_configs')
          .insert({
            ...updates,
            user_id: userId
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      setConfig(result);
      return result;
    } catch (err) {
      console.error('Error saving risk config:', err);
      return null;
    }
  };

  return {
    config,
    loading,
    saveConfig,
    refetchConfig: fetchConfig
  };
}
