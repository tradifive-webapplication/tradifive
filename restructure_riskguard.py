import re

with open('src/pages/RiskGuard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. useDashboardData hook
content = content.replace(
    'const { balance, isConnected, lastClosedTrade, recentTrades, tradesToday } = useDashboardData();',
    'const { balance, isConnected, lastClosedTrade, recentTrades, tradesToday, todayProfit, avgDisciplineScore, serverData } = useDashboardData();'
)

# 2. Main layout opening
content = content.replace(
    '<div className="max-w-none mx-auto w-full font-sans pb-32 space-y-8 select-none">',
    '''<div className="max-w-[1600px] mx-auto w-full font-sans pb-32 select-none">
            <div className="flex flex-col xl:flex-row gap-8 items-start">
               {/* Main content column */}
               <div className="flex-1 w-full space-y-8">'''
)

# 3. Main layout closing + Sidebar
sidebar = '''               </div>
               
               {/* SIDEBAR */}
               <div className="w-full xl:w-[320px] shrink-0 sticky top-24 space-y-6">
                  {/* Risk Score */}
                  <div className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none relative overflow-hidden isolate">
                     <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white mb-6">AI Risk Score</h3>
                     <div className="flex flex-col items-center justify-center">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                 className="text-slate-100 dark:text-slate-800"
                                 strokeWidth="3"
                                 stroke="currentColor"
                                 fill="none"
                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                 className="text-emerald-500"
                                 strokeWidth="3"
                                 strokeDasharray={`${avgDisciplineScore || 85}, 100`}
                                 stroke="currentColor"
                                 fill="none"
                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                           </svg>
                           <div className="absolute flex flex-col items-center">
                              <span className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">{avgDisciplineScore || 85}</span>
                              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Excellent</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Connected Accounts */}
                  <div className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none">
                     <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white mb-4">Connected Accounts</h3>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center">
                                 <Link2 size={14} strokeWidth={2.5} />
                              </div>
                              <div>
                                 <p className="text-[12px] font-bold text-slate-800 dark:text-white">{serverData?.broker_name || 'Primary Broker'}</p>
                                 <p className="text-[10px] font-semibold text-emerald-500">Connected</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[12px] font-bold text-slate-800 dark:text-white">{sym}{balance.toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Daily PnL */}
                  <div className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none flex items-center justify-between">
                     <div>
                        <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white">Daily PnL</h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Realized Profit/Loss</p>
                     </div>
                     <div className={`px-3 py-1.5 rounded-xl ${todayProfit >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'} font-bold text-[14px]`}>
                        {todayProfit >= 0 ? '+' : ''}{sym}{(todayProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                     </div>
                  </div>

                  {/* Today's Summary */}
                  <div className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none">
                     <h3 className="text-[14px] font-semibold text-slate-800 dark:text-white mb-4">Today's Summary</h3>
                     <div className="space-y-4">
                        <div className="flex items-start gap-3">
                           <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={12} strokeWidth={3} />
                           </div>
                           <div>
                              <p className="text-[12px] font-bold text-slate-800 dark:text-white leading-tight">Drawdown Kept Under 2%</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Excellent risk management</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3">
                           <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={12} strokeWidth={3} />
                           </div>
                           <div>
                              <p className="text-[12px] font-bold text-slate-800 dark:text-white leading-tight">No Revenge Trades</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Emotional freezing active</p>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>

            {/* HARD STOP OVERLAY */}'''

content = content.replace('{/* HARD STOP OVERLAY */}', sidebar)

# 4. Small Boxes Grid replacement
content = content.replace(
    'className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"',
    'className="grid grid-cols-1 md:grid-cols-2 gap-6"'
)

# 5. Top Boxes Grid replacement
content = content.replace(
    'className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-2"',
    'className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-2"'
)

with open('src/pages/RiskGuard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
