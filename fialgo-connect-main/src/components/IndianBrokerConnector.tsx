import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Loader2,
  Shield,
  CheckCircle2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface IndianBrokerConnectorProps {
  brokerId: string;
}

export const IndianBrokerConnector: React.FC<IndianBrokerConnectorProps> = ({ brokerId }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectedClientId, setConnectedClientId] = useState('');

  const brokerName = brokerId === 'dhan' ? 'Dhan' : brokerId === 'zerodha' ? 'Zerodha Kite' : brokerId.charAt(0).toUpperCase() + brokerId.slice(1);

  const triggerSync = async (userId: string) => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-indian-trades', {
        body: { action: 'sync', userId }
      });
      if (error) throw error;
      console.log('Sync result:', data);
    } catch (err: any) {
      console.warn('Initial sync warning (non-blocking):', err.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    // Listen for the message from the simulated OAuth popup
    const handleMessage = async (event: MessageEvent) => {
      // Allow messages from same origin
      if (event.data?.type === 'BROKER_AUTH_SUCCESS' && event.data?.payload?.brokerId === brokerId) {
        setLoading(true);
        try {
          const { clientId, apiKey, apiSecret } = event.data.payload;
          
          const { data: { session } } = await supabase.auth.getSession();
          const user = session?.user;
          if (!user) throw new Error('You must be logged in to connect a broker.');

          // 1. Remove any existing connection for this broker
          await supabase
            .from('broker_connections')
            .delete()
            .eq('user_id', user.id)
            .eq('broker_name', brokerId);

          // 2. Save API credentials to broker_connections
          const { error: insertError } = await supabase
            .from('broker_connections')
            .insert({
              user_id: user.id,
              broker_name: brokerId,
              client_id: clientId,
              api_key: apiKey,
              api_secret: apiSecret,
              connection_status: 'active'
            });

          if (insertError) throw insertError;

          setConnectedClientId(clientId);
          setSuccess(true);
          toast.success(`${brokerName} Connected!`, {
            description: 'Fetching your account balance and trade history...',
          });

          // 3. Immediately trigger sync to pull balance + trades from broker API
          await triggerSync(user.id);

          toast.success('Account Synced', {
            description: 'Your balance and trades are now live in your Journal & Risk Guard.',
          });

        } catch (err: any) {
          toast.error('Connection Failed', {
            description: err.message || 'Please try authenticating again.',
          });
          setSuccess(false);
        } finally {
          setLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [brokerId, brokerName]);

  const openAuthPopup = () => {
    const width = 500;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // In a real app, this would be the actual broker's OAuth URL
    window.open(
      `/broker-auth/${brokerId}`,
      `${brokerName} Auth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-12">
      {/* Visual Identity Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
           {brokerId === 'dhan' ? (
              <span className="text-3xl font-black text-amber-500">D</span>
           ) : brokerId === 'zerodha' ? (
              <span className="text-3xl font-black text-blue-500">K</span>
           ) : (
              <span className="text-3xl font-black text-indigo-400">{brokerName[0]}</span>
           )}
        </div>
        <ArrowRight className="text-white/20" size={18} />
        <div className="w-16 h-16 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-xl p-3">
          <img 
            src="/favicon.png" 
            alt="Tradifive" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Text Header */}
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
          Connect your {brokerName} API <br /> to Tradifive
        </h2>
        <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[320px] mx-auto">
          Your connection is secured via standard OAuth 2.0. We never see or store your primary login password.
        </p>
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full flex flex-col items-center gap-6 py-8"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 size={36} className="text-emerald-400" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">{brokerName} Connected!</h3>
            <p className="text-slate-400 text-[13px] font-medium">
              {syncing ? (
                <span className="flex items-center gap-2 justify-center text-amber-400">
                  <RefreshCw size={12} className="animate-spin" /> Syncing balance and trades...
                </span>
              ) : (
                'Your account balance, equity, and trades are live in Journal & Risk Guard.'
              )}
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full text-[11px] text-slate-500 bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span>Client ID</span>
              <span className="text-slate-300 font-mono">{connectedClientId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Broker</span>
              <span className="text-emerald-400 font-bold">{brokerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Active
              </span>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-6"
        >
          <button
            onClick={openAuthPopup}
            disabled={loading}
            className={`w-full group relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-sm transition-all overflow-hidden ${
              brokerId === 'zerodha' 
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_rgba(37,99,235,0.2)]'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center gap-2">
                {loading ? (
                    <><Loader2 className="animate-spin" size={18} /> Awaiting Authorization...</>
                ) : (
                    <>Authenticate with {brokerName} <ExternalLink size={16} /></>
                )}
            </span>
          </button>
          
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-4">
            <Shield className="text-emerald-500 shrink-0 mt-0.5" size={16} />
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Bank-Level Security</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                By proceeding, you will be securely redirected to {brokerName}. Tradifive does not have access to your funds or withdrawal capabilities.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
