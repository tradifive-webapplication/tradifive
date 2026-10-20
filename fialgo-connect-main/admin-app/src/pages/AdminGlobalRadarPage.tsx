import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { supabase } from "../lib/supabase";
import { Globe, Cpu, Activity, Clock, Server, Terminal, Network, ShieldCheck, Zap } from "lucide-react";

export default function AdminGlobalRadarPage() {
  const { adminUser } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  
  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch users & generate real logs
  useEffect(() => {
    async function initRadar() {
      const { data, error } = await supabase.from("profiles").select("*").limit(100).order("created_at", { ascending: false });
      if (data) setUsers(data);
      
      const { data: logsData } = await supabase.from("system_logs").select("*").order("created_at", { ascending: false }).limit(15);
      if (logsData && logsData.length > 0) {
        setLiveLogs(logsData.reverse().map(log => `[${new Date(log.created_at).toISOString().split('T')[1].substring(0,8)}] [${log.level}] ${log.message}`));
      }
    }
    initRadar();

    const channel = supabase.channel('radar_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, (payload: any) => {
        const log = payload.new;
        setLiveLogs(prev => [
          ...prev.slice(-20),
          `[${new Date(log.created_at).toISOString().split('T')[1].substring(0,8)}] [${log.level}] ${log.message}`
        ]);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        supabase.from("profiles").select("*").limit(100).order("created_at", { ascending: false }).then(({data}) => {
          if (data) setUsers(data);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);



  return (
    <div className="min-h-[calc(100dvh-120px)] lg:h-[calc(100vh-56px)] bg-[#03070c] text-cyan-500 font-mono overflow-y-auto lg:overflow-hidden relative flex flex-col p-3 sm:p-4 rounded-xl border border-cyan-500/20">
      {/* Background CRT scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20 mix-blend-overlay"></div>

      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-cyan-500/30 pb-3 mb-4 shrink-0 gap-3">
        <div className="flex gap-4 sm:gap-8 items-end">
          <div>
            <div className="text-[9px] sm:text-[10px] text-cyan-700 tracking-widest mb-1">LOCAL SYSTEM TIME</div>
            <div className="text-2xl sm:text-4xl font-bold text-cyan-400 tracking-tighter leading-none glow-text">
              {currentTime.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-[9px] sm:text-[10px] text-cyan-600 mt-1">NODE: ROOT_CLI</div>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-[9px] sm:text-[10px] text-cyan-700 tracking-widest mb-1">AUTHORIZATION</div>
          <div className="text-xs sm:text-sm font-bold text-emerald-400 flex items-center sm:justify-end gap-2 uppercase">
            <ShieldCheck size={14} /> CLEARANCE: {adminUser?.role}
          </div>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-visible lg:overflow-hidden">
        
        {/* LEFT COLUMN: Referrals & Users */}
        <div className="col-span-1 border border-cyan-500/20 bg-[#001420]/30 flex flex-col relative overflow-hidden backdrop-blur-sm min-h-[280px] lg:min-h-0 rounded-lg">
          <div className="bg-cyan-500/10 px-3 py-1.5 border-b border-cyan-500/20 text-[10px] font-bold tracking-widest flex justify-between">
            <span>NETWORK STATUS</span>
            <span className="text-cyan-700">SYS.01</span>
          </div>
          <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            
            {/* Active Nodes */}
            <div>
              <div className="text-[9px] text-cyan-600 mb-2 border-b border-cyan-900 pb-1">GLOBAL NODES</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 flex items-center gap-2"><Zap size={12} /> TOTAL REGISTERED</span>
                <span className="text-emerald-400 font-bold">{users.length}</span>
              </div>
            </div>

            {/* Referral Matrix */}
            <div className="flex-1">
              <div className="text-[9px] text-cyan-600 mb-2 border-b border-cyan-900 pb-1 flex items-center gap-2">
                <Network size={12} /> RECENT REFERRAL LINKS
              </div>
              <div className="space-y-3 mt-3">
                {users.slice(0, 5).map((u, i) => (
                  <div key={i} className="text-[10px]">
                    <div className="flex justify-between text-cyan-700 mb-1">
                      <span>TRACE_{u.id.substring(0,4)}</span>
                      <span>{u.referral_code ? "ACTIVE" : "PENDING"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400">
                      <span className="truncate w-16 text-cyan-600">{u.referral_code || `REF_${u.id.substring(0,4)}`}</span>
                      <span className="text-cyan-800">→</span>
                      <span className="truncate flex-1">{u.full_name || u.username || "Unknown"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Live Terminal & Main Console */}
        <div className="col-span-1 lg:col-span-2 border border-cyan-500/20 bg-black/60 flex flex-col relative">
          <div className="bg-cyan-500/10 px-3 py-1.5 border-b border-cyan-500/20 text-[10px] font-bold tracking-widest flex items-center gap-2">
            <Terminal size={12} /> MAIN TERMINAL
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col-reverse">
            <AnimatePresence>
              {liveLogs.map((log, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={log + i}
                  className="text-[11px] mb-1 leading-relaxed"
                >
                  <span className="text-cyan-700 mr-2">&gt;</span>
                  <span className={log.includes("ERROR") ? "text-red-400" : log.includes("OK") ? "text-emerald-400" : "text-cyan-400"}>
                    {log}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {/* Input mock */}
          <div className="border-t border-cyan-500/20 p-2 bg-cyan-950/20 flex items-center gap-2">
            <span className="text-cyan-500 animate-pulse font-bold text-sm">_</span>
            <input 
              type="text" 
              className="bg-transparent border-none outline-none text-cyan-400 text-xs w-full font-mono placeholder-cyan-900"
              placeholder="AWAITING COMMAND INPUT..."
              disabled
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Cyber Globe / Map Mock */}
        <div className="col-span-1 border border-cyan-500/20 bg-[#001420]/30 flex flex-col relative overflow-hidden backdrop-blur-sm">
          <div className="bg-cyan-500/10 px-3 py-1.5 border-b border-cyan-500/20 text-[10px] font-bold tracking-widest flex items-center gap-2">
            <Globe size={12} /> GLOBAL THEATER
          </div>
          <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
            
            {/* Holographic CSS Globe Effect */}
            <div className="relative w-48 h-48 rounded-full border border-cyan-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)]">
              {/* Globe Grid lines */}
              <div className="absolute inset-0 border border-cyan-500/20 rounded-full"></div>
              <div className="absolute w-full h-[1px] bg-cyan-500/20 top-1/4"></div>
              <div className="absolute w-full h-[1px] bg-cyan-500/20 top-1/2"></div>
              <div className="absolute w-full h-[1px] bg-cyan-500/20 top-3/4"></div>
              
              <div className="absolute h-full w-[1px] bg-cyan-500/20 left-1/4"></div>
              <div className="absolute h-full w-[1px] bg-cyan-500/20 left-1/2"></div>
              <div className="absolute h-full w-[1px] bg-cyan-500/20 left-3/4"></div>

              {/* Pulsing Dots removed (Requires Geocoding API) */}
              
              {/* Radar Sweeper */}
              <motion.div 
                className="absolute w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-cyan-500/10 to-cyan-400/40 origin-bottom-left border-r border-cyan-400/50"
                style={{ top: '0', left: '50%' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <div className="mt-8 w-full">
              <div className="text-[9px] text-cyan-600 mb-2 border-b border-cyan-900 pb-1">GEOLOCATION LOGS</div>
              <div className="space-y-1">
                {users.slice(0, 4).map((u, i) => {
                  return (
                    <div key={i} className="flex justify-between items-center text-[9px]">
                      <span className="text-emerald-500 flex items-center gap-1">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                        {u.country || "UNKNOWN"}
                      </span>
                      <span className="text-cyan-700 font-mono truncate max-w-[100px]">{u.id}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Global Glow Injector */}
      <style>{`
        .glow-text {
          text-shadow: 0 0 10px rgba(6,182,212,0.5), 0 0 20px rgba(6,182,212,0.3);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(6, 182, 212, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
