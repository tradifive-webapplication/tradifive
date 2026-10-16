import React from 'react';
import { Server, CheckCircle2, AlertCircle, Plus, ShieldCheck, RefreshCw } from 'lucide-react';

import { motion } from "framer-motion";

const GlassCard = ({ children, className = "", noPadding = false }: { children: React.ReactNode; className?: string; noPadding?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={`bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] border-2 border-white rounded-[22px] ${noPadding ? '' : 'p-5'} shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] transition-all dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none ${className}`}
  >
    {children}
  </motion.div>
);


const Brokers = () => {
  const connectedBrokers = [
    { name: 'Exness', server: 'Exness-Real14', status: 'Connected', statusCol: 'text-emerald-500 bg-emerald-500/10', ping: '24ms', type: 'MetaTrader 5', account: '89124412' },
    { name: 'FTMO', server: 'FTMO-Server', status: 'Connected', statusCol: 'text-emerald-500 bg-emerald-500/10', ping: '18ms', type: 'MetaTrader 4', account: '11029344' },
    { name: 'Eightcap', server: 'Eightcap-Live2', status: 'Warning', statusCol: 'text-amber-500 bg-amber-500/10', ping: '142ms', type: 'MetaTrader 5', account: '44910023' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Connected Brokers</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Manage your trading accounts and server connections.</p>
          </div>
          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors">
            <Plus className="w-4 h-4" /> Add Broker
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400">
            <Server className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Active Connections</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">3</p>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">All systems nominal</span>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400">
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Avg Latency</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">61ms</p>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-md w-fit">
            <span className="text-xs font-bold">Optimal trade execution</span>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Security</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Secured</p>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-md w-fit">
            <span className="text-xs font-bold">End-to-end encrypted API</span>
          </div>
        </GlassCard>
      </div>

      <GlassCard noPadding>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Broker Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#1E1E1E]/50 border-b border-slate-100 dark:border-white/5">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Broker</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Account ID</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Platform</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Server Name</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Latency</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-white/5">
              {connectedBrokers.map((broker, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs">
                      {broker.name.charAt(0)}
                    </div>
                    {broker.name}
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{broker.account}</td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{broker.type}</td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{broker.server}</td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{broker.ping}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${broker.statusCol}`}>
                      {broker.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Brokers;
