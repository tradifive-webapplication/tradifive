import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TerminalModeController from '@/components/TerminalModeController';
import { Cpu, Server, ShieldCheck, Zap } from 'lucide-react';

export default function MasterEA() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Settings", path: "/settings" }, { label: "Master EA" }]}>
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Server size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-[32px] font-black text-foreground uppercase tracking-tight leading-none">Master EA Terminal</h1>
            <p className="text-[15px] text-slate-400 font-bold uppercase tracking-wider mt-2">Core Assignment Control Hub</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left Column: The Brain */}
          <div className="space-y-6">
            <TerminalModeController />
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-[32px] p-8 space-y-4">
              <div className="flex items-center gap-3 text-white">
                <ShieldCheck size={20} />
                <h4 className="font-black uppercase tracking-tight text-sm">Security Protocol</h4>
              </div>
              <p className="text-[13px] text-slate-500 font-medium leading-relaxed">
                Terminal assignments are pushed to your localized cloud node via MetaApi. 
                Switching modes will instantly reconfigure the EA logic on your MT5 terminal.
              </p>
            </div>
          </div>

          {/* Right Column: Deployment Details */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-[32px] border border-slate-100 dark:border-[#333333] p-8 shadow-sm">
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-6 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" /> Deployment Status
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-white/5 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cloud Latency</span>
                  <span className="text-sm font-black text-foreground">12ms</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-white/5 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Node Location</span>
                  <span className="text-sm font-black text-foreground">London (LD4)</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-white/5 dark:border-white/5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">EA Version</span>
                  <span className="text-sm font-black text-foreground">v4.2.0-stable</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Uptime</span>
                  <span className="text-sm font-black text-emerald-500">99.98%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Cpu size={80} />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight mb-4">Strategic Override</h3>
              <p className="text-white/60 text-[13px] leading-relaxed mb-6">
                Need to force a global halt? Use the Emergency Kill-Switch in the Risk Guard dashboard for instant termination of all active mandates.
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-black text-[11px] uppercase tracking-widest border border-white/10">
                Go to Risk Guard
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}




