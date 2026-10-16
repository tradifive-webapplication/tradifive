import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Loader2,
  User,
  Eye,
  HelpCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const MT5Connector: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    masterPassword: '',
    brokerServer: '',
    manualAccountId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('deploy-metaapi-account', {
        body: {
          accountNumber: formData.accountNumber,
          masterPassword: formData.masterPassword,
          brokerServer: formData.brokerServer,
          manualAccountId: formData.manualAccountId,
          purpose: 'risk_journal'
        }
      });

      if (error) {
        let msg = "Sync Failed";
        try {
          const errorData = await error.context.json();
          msg = errorData.error || error.message;
        } catch (e) {
          msg = error.message;
        }
        throw new Error(msg);
      }

      setSuccess(true);
      toast.success('Connection Active', {
        description: 'Account successfully synced with Risk Guard.',
      });

      await supabase.functions.invoke('sync-metaapi-trades');

    } catch (err: any) {
      toast.error('Sync Failed', {
        description: err.message || 'Please verify your credentials or server name.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto py-12">
      {/* Visual Identity Header */}
      <div className="flex items-center gap-6 mb-10">
        <div className="w-16 h-16 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-xl">
          <img src="/Mt5 logo.png" alt="MT5" className="w-10 h-10 object-contain" />
        </div>
        <ArrowRight className="text-white/20" size={18} />
        <div className="w-16 h-16 flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-xl">
          <img
            src="/favicon.png"
            alt="Tradifive"
            className="w-10 h-10 object-contain"
          />
        </div>
      </div>

      {/* Text Header */}
      <div className="text-center mb-10 space-y-3">
        <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
          Connect your MetaTrader 5 account <br /> to Tradifive
        </h2>
        <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[320px] mx-auto">
          Log in using the credentials provided by your broker or prop firm to get started.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="space-y-2">
          <label className="text-[13px] font-bold text-slate-400 ml-1">Account Number</label>
          <input
            required
            type="text"
            placeholder="e.g. 50971432"
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-4 px-5 text-[15px] text-white placeholder-slate-700 outline-none focus:border-blue-500/50 transition-all"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold text-slate-400 ml-1">Password</label>
          <div className="relative">
            <input
              required
              type="password"
              placeholder="••••••••••••"
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-4 px-5 text-[15px] text-white placeholder-slate-700 outline-none focus:border-blue-500/50 transition-all"
              value={formData.masterPassword}
              onChange={(e) => setFormData({ ...formData, masterPassword: e.target.value })}
            />
            <Eye size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[13px] font-bold text-slate-400 ml-1">Server</label>
          <div className="relative">
            <input
              required
              type="text"
              placeholder="e.g. Exness-MT5Real9"
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-4 px-5 text-[15px] text-white placeholder-slate-700 outline-none focus:border-blue-500/50 transition-all"
              value={formData.brokerServer}
              onChange={(e) => setFormData({ ...formData, brokerServer: e.target.value })}
            />
            <HelpCircle size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40" />
          </div>
        </div>

        <div className="pt-4">
          <button
            disabled={loading || success}
            className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all flex items-center justify-center gap-2 ${success
                ? "bg-emerald-500 text-white cursor-default"
                : "bg-[#2563EB] hover:bg-[#3B82F6] text-white active:scale-[0.98]"
              }`}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : success ? (
              "Connected"
            ) : (
              "Log In"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MT5Connector;
