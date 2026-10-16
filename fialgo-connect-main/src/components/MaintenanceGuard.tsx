import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Clock, ShieldCheck, AlertOctagon } from 'lucide-react';

interface MaintenanceState {
  active: boolean;
  mode: 'Soft' | 'Limited' | 'Full';
  severity: 'Info' | 'Warning' | 'Critical';
  title: string;
  message: string;
  resolutionTime: string;
  startTime: string;
  endTime: string;
  autoSchedule: boolean;
  whitelist: string;
}

export const MaintenanceGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [maint, setMaint] = useState<MaintenanceState | null>(null);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const fetchMaintenance = async () => {
      const { data } = await supabase.from('system_settings').select('*').eq('id', 'maintenance_mode').maybeSingle();
      if (data?.value) {
        setMaint(data.value);
        checkWhitelist(data.value.whitelist);
      }
    };

    const checkWhitelist = async (whitelistStr: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (whitelistStr && user && whitelistStr.includes(user.id)) {
        setIsWhitelisted(true);
      }
    };

    fetchMaintenance();

    const channel = supabase.channel('maint_guard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings', filter: 'id=eq.maintenance_mode' }, (payload: any) => {
        if (payload.new?.value) {
          setMaint(payload.new.value);
          checkWhitelist(payload.new.value.whitelist);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Timer logic for countdown
  useEffect(() => {
    if (maint?.endTime) {
      const timer = setInterval(() => {
        const end = new Date(maint.endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) {
          setTimeLeft('SEC');
          clearInterval(timer);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [maint?.endTime]);

  if (maint?.active && maint.mode === 'Full' && !isWhitelisted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center p-6 font-sans overflow-hidden">
        {/* Background Decorative Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/[0.02] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/[0.03] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center relative z-10"
        >
          <div className="flex justify-center mb-10">
             <div className="relative group">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <div className="w-24 h-24 bg-[#121212] border border-amber-500/30 rounded-[2rem] flex items-center justify-center relative shadow-2xl">
                   <Wrench size={40} className="text-amber-500" />
                </div>
             </div>
          </div>

          <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-4">
            {maint.title}
          </h1>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full mb-8">
             <AlertOctagon size={14} className="text-amber-500" />
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{maint.severity} Protocol Active</span>
          </div>

          <p className="text-neutral-500 text-[13px] leading-relaxed mb-12 font-medium">
            {maint.message}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-12">
             <div className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center group hover:border-amber-500/20 transition-all">
                <Clock className="text-neutral-600 mb-2 mx-auto" size={20} />
                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Time Remaining</p>
                <p className="text-2xl font-mono font-black text-white tracking-widest">{timeLeft || '--:--:--'}</p>
             </div>
             <div className="bg-[#111] border border-white/5 rounded-2xl p-6 text-center group hover:border-blue-500/20 transition-all">
                <ShieldCheck className="text-neutral-600 mb-2 mx-auto" size={20} />
                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mb-1">Mode Status</p>
                <p className="text-2xl font-black text-slate-200 tracking-widest uppercase">{maint.mode}</p>
             </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center">
             <p className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest animate-pulse">
                Auto-reconnecting to trading clusters...
             </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {maint?.active && maint.mode === 'Limited' && !isWhitelisted && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 inset-x-0 z-[50] bg-amber-600/90 backdrop-blur-md text-white py-2 px-6 shadow-2xl flex items-center justify-center gap-4"
          >
             <Clock size={16} />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">Limited Mode Active: Trading Engines Temporarily Offline (Resumes in {timeLeft})</span>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
};

