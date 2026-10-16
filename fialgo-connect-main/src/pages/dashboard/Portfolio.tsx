import React from 'react';
import { Wallet, TrendingUp, PieChart, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Percent } from 'lucide-react';

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


const Portfolio = () => {
  const activePositions = [
    { symbol: 'EUR/USD', type: 'BUY', size: '1.5', entry: '1.0945', current: '1.0965', pnl: '+,300.00', pnlCol: 'text-emerald-500' },
    { symbol: 'XAU/USD', type: 'SELL', size: '0.5', entry: '2024.50', current: '2019.20', pnl: '+,265.00', pnlCol: 'text-emerald-500' },
    { symbol: 'GBP/JPY', type: 'BUY', size: '2.0', entry: '190.45', current: '190.20', pnl: '-,410.00', pnlCol: 'text-rose-500' },
    { symbol: 'BTC/USD', type: 'BUY', size: '0.1', entry: '64200.00', current: '64800.00', pnl: '+,60.00', pnlCol: 'text-emerald-500' },
    { symbol: 'US30', type: 'SELL', size: '1.0', entry: '39400', current: '39450', pnl: '-,50.00', pnlCol: 'text-rose-500' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-white">Portfolio & Holdings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your asset allocation and active positions across all connected accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard>
          <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400">
            <Wallet className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Total Balance</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">$124,532.00</p>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-md w-fit">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">+2.4% today</span>
          </div>
        </GlassCard>
        
        <GlassCard>
          <div className="flex items-center gap-2 mb-3 text-slate-500 dark:text-slate-400">
            <PieChart className="w-4 h-4 text-purple-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Margin Used</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">12.5%</p>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-md w-fit">
            <span className="text-xs font-bold">$15,566.50 locked</span>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-center items-center">
           <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-3">
             <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
           </div>
           <p className="text-sm font-bold text-slate-900 dark:text-white">Diversify Portfolio</p>
           <p className="text-xs text-slate-500 mt-1">Connect more asset classes</p>
        </GlassCard>
      </div>

      <GlassCard noPadding>
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Active Positions</h2>
          <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md">5 Open Trades</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#1E1E1E]/50 border-b border-slate-100 dark:border-white/5">
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Symbol</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Size</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entry Price</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Price</th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Unrealized P&L</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-white/5">
              {activePositions.map((pos, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900 dark:text-white">{pos.symbol}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${pos.type === 'BUY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                      {pos.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{pos.size}</td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{pos.entry}</td>
                  <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-300">{pos.current}</td>
                  <td className={`px-5 py-3 font-bold text-right ${pos.pnlCol}`}>{pos.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default Portfolio;
