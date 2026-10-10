import React from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Wallet, Clock, CheckCircle2, ShieldCheck, Play, Pause, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const performanceData = [
  { day: '01', balance: 5000 },
  { day: '05', balance: 5120 },
  { day: '10', balance: 5080 },
  { day: '15', balance: 5350 },
  { day: '20', balance: 5490 },
  { day: '25', balance: 5410 },
  { day: '30', balance: 5742 },
];

const recentTrades = [
  { id: 1, pair: 'EURUSD', type: 'BUY', lot: 0.1, time: '10:42 AM', pnl: 42.50, status: 'win' },
  { id: 2, pair: 'XAUUSD', type: 'SELL', lot: 0.05, time: '09:15 AM', pnl: -12.20, status: 'loss' },
  { id: 3, pair: 'GBPUSD', type: 'BUY', lot: 0.1, time: '08:30 AM', pnl: 85.10, status: 'win' },
  { id: 4, pair: 'USDJPY', type: 'SELL', lot: 0.2, time: 'Yesterday', pnl: 112.00, status: 'win' },
  { id: 5, pair: 'EURJPY', type: 'BUY', lot: 0.1, time: 'Yesterday', pnl: -24.50, status: 'loss' },
];

const boxStyle = "p-5 md:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:rounded-[22px] dark:shadow-none";

interface Props {
  onBack: () => void;
  algo: { name: string; risk: string; deposit: number };
  mt5Account: string;
}

export default function AITradingDashboard({ onBack, algo, mt5Account }: Props) {
  return (
    <div className="w-full font-sans animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 mt-2">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-3">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Setup
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold text-slate-900 dark:text-[#F7F8FA] tracking-tight leading-none">Bot Dashboard</h1>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Trading
            </span>
          </div>
        </div>

        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#2B2F35] rounded-xl text-[12px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2B2F35] transition-colors flex items-center gap-2 shadow-sm">
             <Pause className="w-4 h-4 text-amber-500" /> Pause Bot
           </button>
           <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[12px] font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
             <Activity className="w-4 h-4" /> View VPS Logs
           </button>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`${boxStyle} p-4 md:p-5 flex flex-col justify-center`}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Total Net Profit</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[24px] font-bold text-slate-900 dark:text-white leading-none">+$742.00</h3>
            <span className="text-[12px] font-bold text-emerald-500 mb-0.5 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5" /> 14.8%</span>
          </div>
        </div>
        
        <div className={`${boxStyle} p-4 md:p-5 flex flex-col justify-center`}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Today's PnL</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[24px] font-bold text-slate-900 dark:text-white leading-none">+$30.30</h3>
          </div>
        </div>

        <div className={`${boxStyle} p-4 md:p-5 flex flex-col justify-center`}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Win Rate</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[24px] font-bold text-slate-900 dark:text-white leading-none">82%</h3>
          </div>
        </div>

        <div className={`${boxStyle} p-4 md:p-5 flex flex-col justify-center`}>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Max Drawdown</p>
          <div className="flex items-end gap-2">
            <h3 className="text-[24px] font-bold text-slate-900 dark:text-white leading-none">3.1%</h3>
            <span className="text-[12px] font-bold text-slate-400 mb-0.5">Low Risk</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`${boxStyle} h-[380px] flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Balance Growth (30D)</h3>
               <div className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-[#1A1A1C] px-2.5 py-1 rounded-md">Live MT5 Data</div>
            </div>
            
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.2} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} domain={['dataMin - 100', 'dataMax + 100']} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: '#1A1A1C', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#10B981' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className={`${boxStyle}`}>
             <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-4">Recent Trades</h3>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-slate-100 dark:border-white/5">
                     <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pair</th>
                     <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</th>
                     <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Lot</th>
                     <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Time</th>
                     <th className="pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Profit</th>
                   </tr>
                 </thead>
                 <tbody>
                   {recentTrades.map(trade => (
                     <tr key={trade.id} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                       <td className="py-3 text-[13px] font-bold text-slate-900 dark:text-white">{trade.pair}</td>
                       <td className="py-3">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trade.type === 'BUY' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                           {trade.type}
                         </span>
                       </td>
                       <td className="py-3 text-[13px] font-semibold text-slate-600 dark:text-slate-300">{trade.lot}</td>
                       <td className="py-3 text-[12px] text-slate-500">{trade.time}</td>
                       <td className={`py-3 text-[13px] font-bold text-right ${trade.status === 'win' ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {trade.status === 'win' ? '+' : ''}{trade.pnl > 0 ? trade.pnl.toFixed(2) : trade.pnl.toFixed(2)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className={`${boxStyle}`}>
            <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-4">Connection Details</h3>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-[12px] text-slate-500">Algorithm</span>
                 <span className="text-[13px] font-bold text-slate-900 dark:text-white">{algo.name}</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[12px] text-slate-500">MT5 Account</span>
                 <span className="text-[13px] font-bold text-slate-900 dark:text-white">{mt5Account || '8492018'}</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[12px] text-slate-500">Broker</span>
                 <span className="text-[13px] font-bold text-slate-900 dark:text-white">Tradifive Verified</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[12px] text-slate-500">Risk Profile</span>
                 <span className="text-[13px] font-bold text-slate-900 dark:text-white">{algo.risk}</span>
               </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl">
                 <ShieldCheck className="w-5 h-5 text-emerald-500" />
                 <div>
                   <p className="text-[11px] font-bold text-emerald-900 dark:text-emerald-400 leading-tight">License Active</p>
                   <p className="text-[10px] text-emerald-700 dark:text-emerald-500/80 mt-0.5">Valid until lifetime</p>
                 </div>
              </div>
            </div>
          </div>
          
          <div className={`${boxStyle} bg-slate-50/50`}>
             <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Auto-Trading Rules</h3>
             <ul className="space-y-2">
               <li className="text-[11px] text-slate-500 leading-relaxed">• Do not manually close trades opened by the bot.</li>
               <li className="text-[11px] text-slate-500 leading-relaxed">• Keep your MT5 terminal running 24/5 or use our provided VPS.</li>
               <li className="text-[11px] text-slate-500 leading-relaxed">• Maintain the minimum deposit of ${algo.deposit} to avoid margin calls.</li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
