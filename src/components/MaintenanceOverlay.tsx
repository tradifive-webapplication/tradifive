import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hammer, Server, ShieldAlert, Cpu, Timer } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function MaintenanceOverlay() {
  const [maintenance, setMaintenance] = useState<{ active: boolean; reason: string } | null>(null);

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'maintenance_mode')
        .maybeSingle();
      
      if (data) {
        setMaintenance(data.value);
      }
    };

    fetchMaintenanceStatus();

    const channel = supabase.channel('maintenance_sync')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'system_settings', 
        filter: 'key=eq.maintenance_mode' 
      }, (payload: any) => {
        if (payload.new) {
          setMaintenance(payload.new.value);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!maintenance?.active) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Premium Glass Background */}
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/80 backdrop-blur-[40px] pointer-events-auto"></div>
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl mx-auto p-12 bg-white dark:bg-[#1E1E1E] dark:bg-[#1E1E1E] border border-slate-200 dark:border-[#333333]/50 dark:border-white/5 rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative z-10 text-center"
      >
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="w-24 h-24 bg-amber-500/10 rounded-[32px] flex items-center justify-center border border-amber-500/20">
              <Hammer size={48} className="text-amber-600 animate-bounce" />
            </div>
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-[#1E1E1E] dark:bg-blue-500 rounded-2xl shadow-lg border border-slate-100 dark:border-[#333333] dark:border-white/5 flex items-center justify-center">
              <Server size={20} className="text-slate-400 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white dark:text-white tracking-tight uppercase">System Hub Offline</h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-full">
            <ShieldAlert size={14} className="text-amber-600" />
            <span className="text-[11px] font-black text-amber-600 uppercase tracking-widest">Platform Maintenance Active</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-[#141414] dark:bg-blue-500 border border-slate-100 dark:border-[#333333] dark:border-white/5 rounded-3xl p-8 mb-10">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mb-3">Institutional Directive</p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-200 dark:text-slate-200 mb-2">{maintenance.reason}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
             Our engineering cluster is currently performing a surgical update to the execution core. All tactical bridges are temporarily restricted.
          </p>
        </div>

        <div className="flex items-center justify-center gap-8 border-t border-slate-100 dark:border-[#333333] dark:border-white/5 pt-10">
          <div className="text-center">
             <div className="flex items-center gap-2 text-slate-900 dark:text-white dark:text-white font-bold text-lg">
                <Cpu size={18} className="text-slate-200" />
                <span>ACTIVE</span>
             </div>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status</p>
          </div>
          <div className="h-8 w-[1px] bg-slate-100 dark:bg-[#1E1E1E] dark:bg-white/5"></div>
          <div className="text-center">
             <div className="flex items-center gap-2 text-slate-900 dark:text-white dark:text-white font-bold text-lg">
                <Timer size={18} className="text-amber-500" />
                <span>60M</span>
             </div>
             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Est. Buffer</p>
          </div>
        </div>
      </motion.div>

      {/* Floating Status Bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-slate-900 text-white rounded-full shadow-2xl border border-white/5 z-20">
         <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider">Master Control Restricting Access</span>
         </div>
      </div>
    </div>
  );
}





