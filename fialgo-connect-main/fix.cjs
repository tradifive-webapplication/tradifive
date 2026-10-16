const fs = require('fs');

let content = fs.readFileSync('riskguard_dump.txt', 'utf8');
let lines = content.split('\n');

// Find the end of Session Sentinel (the line with `</AnimatePresence>`)
// Actually, let's find the line index of `Session Guard Live`
let sessionGuardIdx = lines.findIndex(l => l.includes('Session Guard Live'));
if (sessionGuardIdx === -1) {
  console.log("Could not find Session Guard Live!");
  process.exit(1);
}

// Find the `</motion.div>` that closes Session Sentinel
let endIdx = sessionGuardIdx;
let motionDivCount = 0;
while (endIdx < lines.length) {
  if (lines[endIdx].includes('</motion.div>')) {
     motionDivCount++;
     if (motionDivCount === 2) { // The one for the overlay, and the one for the main block
        break;
     }
  }
  endIdx++;
}

console.log("End of Session Sentinel at line:", endIdx);

// Slice the file up to this point
let topHalf = lines.slice(0, endIdx + 1).join('\n');

// Now we append the Guardian PIN and Terminal Hard Stop, followed by the correct closing structure.
const bottomHalf = `
                     {activeMarket === 'indian' && (
                        <>
                           {/* BOX: GUARDIAN PIN */}
                           <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.14 }}
                              className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] transition-all dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none flex flex-col justify-between space-y-6 relative overflow-hidden isolate"
                           >
                              <div className="relative z-20 flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
                                       <Key size={16} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-1.5">
                                          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Guardian PIN</h3>
                                          <TooltipProvider delayDuration={100}>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <button type="button" className="text-slate-400 hover:text-amber-500 transition-colors">
                                                      <Info size={13} strokeWidth={2.5} />
                                                   </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-[200px] p-2 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#252528] shadow-xl">
                                                   <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Require a 4-digit PIN to override your max loss limit.</p>
                                                </TooltipContent>
                                             </Tooltip>
                                          </TooltipProvider>
                                       </div>
                                       <p className="text-[10px] text-slate-400 font-medium mt-0.5">Prevent emotional overrides</p>
                                    </div>
                                 </div>
                                 <Switch checked={pinActive} onChange={setPinActive} />
                              </div>

                              <div className="space-y-1.5">
                                 <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Set 4-Digit PIN</label>
                                 <div className="relative">
                                    <input
                                       type={showPin ? "text" : "password"}
                                       value={guardianPin}
                                       onChange={e => {
                                          const val = e.target.value.replace(/\\D/g, '').slice(0, 4);
                                          setGuardianPin(val);
                                       }}
                                       placeholder="••••"
                                       className="w-full bg-[#F4F4F4] dark:bg-[#1A1A1C] border-2 border-[#E7E7E7] dark:border-[#252528] text-slate-800 dark:text-white text-[14px] font-bold rounded-[16px] px-4 py-3 outline-none focus:border-amber-500/50 dark:focus:border-amber-500/50 transition-colors placeholder:text-slate-400/50 tracking-widest"
                                    />
                                    <button
                                       type="button"
                                       onClick={() => setShowPin(!showPin)}
                                       className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors"
                                    >
                                       {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                 </div>
                              </div>
                           </motion.div>

                           {/* BOX: TERMINAL HARD STOP */}
                           <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.16 }}
                              className="p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] transition-all dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none flex flex-col justify-start space-y-6 relative overflow-hidden isolate"
                           >
                              <div className="relative z-20 flex items-center justify-between pb-3">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50">
                                       <MonitorOff size={16} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-1.5">
                                          <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Terminal Hard Stop</h3>
                                          <TooltipProvider delayDuration={100}>
                                             <Tooltip>
                                                <TooltipTrigger asChild>
                                                   <button type="button" className="text-slate-400 hover:text-rose-500 transition-colors">
                                                      <Info size={13} strokeWidth={2.5} />
                                                   </button>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="max-w-[200px] p-2 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#252528] shadow-xl">
                                                   <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">Triggers a full-screen lockdown when daily limits are breached.</p>
                                                </TooltipContent>
                                             </Tooltip>
                                          </TooltipProvider>
                                       </div>
                                       <p className="text-[10px] text-slate-400 font-medium mt-0.5">Force lock on limit breach</p>
                                    </div>
                                 </div>
                              </div>

                              <div className="space-y-4">
                                 <div className="p-3.5 flex flex-col gap-3 rounded-[16px] bg-[#F4F4F4]/50 dark:bg-[#1A1A1C]/50 border border-transparent shadow-sm">
                                    <div className="flex items-center justify-between">
                                       <div>
                                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Force Action Lockout</p>
                                          <p className="text-[10px] text-slate-400 font-medium mt-1">Simulate a max-loss breach</p>
                                       </div>
                                       <button
                                          onClick={() => setHardStopActive(true)}
                                          className="px-4 py-2 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[11px] font-bold hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                       >
                                          Trigger Demo Lock
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        </>
                     )}
                  </div>
               </div>
            </div>

            {/* HARD STOP OVERLAY */}
            <AnimatePresence>
               {hardStopActive && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     transition={{ duration: 0.4, ease: "easeOut" }}
                     className="fixed inset-0 z-[99999] bg-[#0A0A0A]/95 backdrop-blur-xl flex flex-col items-center justify-center text-center px-6 overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-950/40 via-transparent to-transparent pointer-events-none" />

                     <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="relative"
                     >
                        <div className="absolute inset-0 bg-rose-500 blur-[80px] opacity-20 rounded-full" />
                        <AlertTriangle className="w-28 h-28 text-rose-500 mb-8 relative z-10" />
                     </motion.div>

                     <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
                        HARD STOP <span className="text-rose-500">ENGAGED</span>
                     </h1>

                     <p className="text-xl md:text-2xl font-medium text-slate-300 max-w-2xl mx-auto leading-relaxed">
                        You have breached your daily drawdown limit. All open positions have been aggressively squared off.
                     </p>

                     <div className="mt-10 flex flex-col items-center gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                           <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">Terminal Lockout Ends In</p>
                           <div className="flex items-center justify-center gap-3 text-4xl font-black text-white tabular-nums">
                              <span>04</span><span className="text-rose-500/50">:</span>
                              <span>12</span><span className="text-rose-500/50">:</span>
                              <span>59</span>
                           </div>
                           <p className="text-slate-500 text-xs mt-3">Access restores at 15:30 IST</p>
                        </div>
                     </div>

                     {/* Hidden bypass for demo/testing purposes */}
                     <button
                        onDoubleClick={() => setHardStopActive(false)}
                        className="absolute bottom-8 opacity-0 hover:opacity-20 text-[10px] text-white tracking-widest uppercase font-bold transition-opacity"
                     >
                        [Double click to bypass demo]
                     </button>
                  </motion.div>
               )}
            </AnimatePresence>
         </DashboardLayout>
      );
   }
`;

fs.writeFileSync('src/pages/RiskGuard.tsx', topHalf + '\\n' + bottomHalf);
console.log('Successfully repaired file structure.');
