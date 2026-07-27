import re

with open('src/pages/RiskGuard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

sidebar_content = '''               {/* SIDEBAR */}
               <div className="w-[280px] xl:w-[320px] shrink-0 sticky top-24 space-y-6">
                  {/* Risk Score */}
                  <div className="p-6 rounded-[22px] bg-white border border-slate-200 dark:bg-[#1E1E1E] dark:border-white/5 relative">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-8">AI Risk Score</h3>
                     <div className="flex flex-col items-center justify-center">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                 className="text-slate-100 dark:text-slate-800"
                                 strokeWidth="3.5"
                                 stroke="currentColor"
                                 fill="none"
                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                 className="text-[#10B981]"
                                 strokeWidth="3.5"
                                 strokeDasharray={`${avgDisciplineScore || 85}, 100`}
                                 stroke="currentColor"
                                 fill="none"
                                 strokeLinecap="round"
                                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                           </svg>
                           <div className="absolute flex flex-col items-center mt-1">
                              <span className="text-[34px] font-black text-slate-900 dark:text-white tabular-nums leading-none tracking-tight">{avgDisciplineScore || 85}</span>
                              <span className="text-[9px] font-bold text-[#10B981] uppercase tracking-widest mt-1">Excellent</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Connected Accounts */}
                  <div className="p-6 rounded-[22px] bg-white border border-slate-200 dark:bg-[#1E1E1E] dark:border-white/5">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-5">Connected Accounts</h3>
                     <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-[#F8FAFC] dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-3.5">
                           <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 flex items-center justify-center shrink-0">
                              <Link2 size={16} strokeWidth={2.5} />
                           </div>
                           <div>
                              <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">{serverData?.broker_name || 'Primary Broker'}</p>
                              <p className="text-[11px] font-semibold text-[#10B981] mt-0.5">Connected</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[13px] font-bold text-slate-900 dark:text-white">{sym}{balance.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  {/* Daily PnL */}
                  <div className="p-6 rounded-[22px] bg-white border border-slate-200 dark:bg-[#1E1E1E] dark:border-white/5 flex items-center justify-between">
                     <div>
                        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">Daily PnL</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">Realized Profit/Loss</p>
                     </div>
                     <div className={`px-3.5 py-1.5 rounded-full ${todayProfit >= 0 ? 'bg-emerald-50 text-[#10B981] dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'} font-bold text-[14px]`}>
                        {todayProfit >= 0 ? '+' : ''}{sym}{(todayProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                     </div>
                  </div>

                  {/* Today's Summary */}
                  <div className="p-6 rounded-[22px] bg-white border border-slate-200 dark:bg-[#1E1E1E] dark:border-white/5">
                     <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-5">Today's Summary</h3>
                     <div className="space-y-5">
                        <div className="flex items-start gap-3.5">
                           <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#10B981] dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={14} strokeWidth={3} />
                           </div>
                           <div>
                              <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">Drawdown Kept Under 2%</p>
                              <p className="text-[11px] text-slate-400 mt-1 font-medium">Excellent risk management</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3.5">
                           <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#10B981] dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check size={14} strokeWidth={3} />
                           </div>
                           <div>
                              <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">No Revenge Trades</p>
                              <p className="text-[11px] text-slate-400 mt-1 font-medium">Emotional freezing active</p>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>

         {/* HARD STOP OVERLAY */}'''

end_feature_box = content.rfind('</FeatureBox>')
if end_feature_box != -1:
    hard_stop = content.find('{/* HARD STOP OVERLAY */}', end_feature_box)
    part_before = content[:end_feature_box + len('</FeatureBox>\n')]
    part_after = content[hard_stop:]
    
    middle_replacement = f'''                  </div>
               </div>
            </div>
            {{/* Closes flex-1 main content column */}}
            
{sidebar_content}'''
    
    new_content = part_before + middle_replacement + part_after[len('{{/* HARD STOP OVERLAY */}}'):]
    with open('src/pages/RiskGuard.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Done!")
