import re

with open('src/pages/RiskGuard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Risk Score
risk_score_old = '''                  {/* Risk Score */}
                  <div className="p-5 xl:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none relative">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-6">Risk Score</h3>
                     <div className="flex flex-col items-center justify-center">
                        <div className="relative w-40 h-24 flex items-end justify-center overflow-hidden mb-2">
                           <svg className="absolute w-40 h-40 transform rotate-180 origin-center" viewBox="0 0 100 100">
                              <path
                                 d="M 10 50 A 40 40 0 0 1 90 50"
                                 fill="none"
                                 stroke="#E2E8F0"
                                 strokeWidth="12"
                                 strokeLinecap="round"
                                 className="dark:stroke-slate-800"
                              />
                              <path
                                 d="M 10 50 A 40 40 0 0 1 90 50"
                                 fill="none"
                                 stroke="url(#riskGradient)"
                                 strokeWidth="12"
                                 strokeLinecap="round"
                                 strokeDasharray="125.6"
                                 strokeDashoffset={125.6 - (125.6 * (avgDisciplineScore || 85)) / 100}
                                 className="transition-all duration-1000 ease-out"
                              />
                              <defs>
                                 <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="50%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#EF4444" />
                                 </linearGradient>
                              </defs>
                           </svg>
                           <div className="flex items-baseline gap-1 relative z-10 translate-y-2">
                              <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{avgDisciplineScore || 85}</span>
                              <span className="text-sm font-bold text-slate-400">/100</span>
                           </div>
                        </div>
                        <div className="text-center mt-2">
                           <p className="text-[15px] font-bold text-[#10B981]">Excellent</p>
                           <p className="text-[11px] font-semibold text-[#10B981]/70 mt-0.5">You are trading with discipline</p>
                        </div>
                     </div>
                  </div>'''

risk_score_new = '''                  {/* Risk Score */}
                  <div className="p-5 xl:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none relative">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-6">Risk Score</h3>
                     <div className="flex flex-col items-center justify-center">
                        <div className="relative w-full flex flex-col items-center justify-center mb-1">
                           <svg className="w-48 overflow-visible" viewBox="0 0 100 56">
                              <path
                                 d="M 10 50 A 40 40 0 0 1 90 50"
                                 fill="none"
                                 stroke="#E2E8F0"
                                 strokeWidth="11"
                                 strokeLinecap="round"
                                 className="dark:stroke-slate-800"
                              />
                              <path
                                 d="M 10 50 A 40 40 0 0 1 90 50"
                                 fill="none"
                                 stroke="url(#riskGradient)"
                                 strokeWidth="11"
                                 strokeLinecap="round"
                                 strokeDasharray="125.66"
                                 strokeDashoffset={125.66 - (125.66 * (avgDisciplineScore || 85)) / 100}
                                 className="transition-all duration-1000 ease-out"
                              />
                              <defs>
                                 <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#EF4444" />
                                    <stop offset="50%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#10B981" />
                                 </linearGradient>
                              </defs>
                           </svg>
                           <div className="absolute bottom-[-10px] flex items-baseline gap-0.5">
                              <span className="text-[40px] font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">{avgDisciplineScore || 85}</span>
                              <span className="text-[14px] font-bold text-slate-400">/100</span>
                           </div>
                        </div>
                        <div className="text-center mt-3">
                           <p className="text-[15px] font-bold text-[#10B981]">Excellent</p>
                           <p className="text-[11px] font-semibold text-[#10B981]/70 mt-0.5">You are trading with discipline</p>
                        </div>
                     </div>
                  </div>'''

connected_account_old = '''                  {/* Connected Account */}
                  <div className="p-5 xl:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none relative">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-5">Connected Account</h3>
                     
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                           <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
                                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 22h20L12 2zm0 3.8l6.1 12.2H5.9L12 5.8z" />
                                 </svg>
                              </div>
                              <div className="flex items-baseline gap-2">
                                 <p className="text-[14px] font-bold text-slate-900 dark:text-white">{serverData?.broker_name || 'Zerodha'}</p>
                                 <p className="text-[11px] font-bold text-slate-400">NKN123</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10 dark:text-emerald-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Balance</span>
                              <span className="text-[13px] font-bold text-slate-900 dark:text-white">{sym}{(balance || 0).toLocaleString()}</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Daily P&L</span>
                              <span className={`text-[13px] font-bold ${todayProfit >= 0 ? 'text-[#10B981]' : 'text-rose-500'}`}>
                                 {todayProfit >= 0 ? '+' : ''}{sym}{(todayProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="font-semibold opacity-80">({todayProfit >= 0 ? '+' : ''}{((todayProfit / (balance || 1)) * 100).toFixed(2)}%)</span>
                              </span>
                           </div>
                        </div>

                        <button className="w-full mt-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white text-[12px] font-bold transition-colors">
                           Manage Connection
                        </button>
                     </div>
                  </div>'''

connected_account_new = '''                  {/* Connected Account */}
                  <div className="p-5 xl:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none relative">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-5">Connected Account</h3>
                     
                     <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                           <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center shrink-0">
                                 <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L2 22h20L12 2zm0 3.8l6.1 12.2H5.9L12 5.8z" />
                                 </svg>
                              </div>
                              <div className="flex items-baseline gap-2">
                                 <p className="text-[14px] font-bold text-slate-900 dark:text-white">{serverData?.broker_name || (activeMarket === 'forex' ? 'MetaTrader 5' : 'Zerodha')}</p>
                                 <p className="text-[11px] font-bold text-slate-400">{activeMarket === 'forex' ? 'MT5-LIVE' : 'NKN123'}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10 dark:text-emerald-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Balance</span>
                              <span className="text-[13px] font-bold text-slate-900 dark:text-white">{sym}{(balance || 0).toLocaleString()}</span>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400">Daily P&L</span>
                              <span className={`text-[13px] font-bold ${todayProfit >= 0 ? 'text-[#10B981]' : 'text-rose-500'}`}>
                                 {todayProfit >= 0 ? '+' : ''}{sym}{(todayProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="font-semibold opacity-80">({todayProfit >= 0 ? '+' : ''}{((todayProfit / (balance || 1)) * 100).toFixed(2)}%)</span>
                              </span>
                           </div>
                        </div>

                        <button className="w-full mt-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white text-[12px] font-bold transition-colors">
                           Manage Connection
                        </button>
                     </div>
                  </div>'''

content = content.replace(risk_score_old, risk_score_new)
content = content.replace(connected_account_old, connected_account_new)

with open('src/pages/RiskGuard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated successfully")
