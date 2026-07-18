const fs = require('fs');

const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update mockTrades to have notes
const oldMockTrades = `  const mockTrades = [
     { id: '1', symbol: 'NIFTY', profit: 450.00, type: 'BUY', closed_at: dayBefore.toISOString(), is_pending: false },
     { id: '2', symbol: 'BANKNIFTY', profit: -120.00, type: 'SELL', closed_at: dayBefore.toISOString(), is_pending: false },
     { id: '3', symbol: 'RELIANCE', profit: 800.00, type: 'BUY', closed_at: yesterday.toISOString(), is_pending: false },
     { id: '4', symbol: 'TCS', profit: -50.00, type: 'BUY', closed_at: yesterday.toISOString(), is_pending: false },
     { id: '5', symbol: 'HDFC', profit: 600.00, type: 'SELL', closed_at: today.toISOString(), is_pending: false },
     { id: '6', symbol: 'INFY', profit: 650.50, type: 'BUY', closed_at: today.toISOString(), is_pending: false },
  ];`;

const newMockTrades = `  const mockTrades = [
     { id: '1', symbol: 'NIFTY', profit: 450.00, type: 'BUY', closed_at: dayBefore.toISOString(), is_pending: false, notes: 'Followed strategy perfectly, exited at target.' },
     { id: '2', symbol: 'BANKNIFTY', profit: -120.00, type: 'SELL', closed_at: dayBefore.toISOString(), is_pending: false, notes: 'Stopped out early. Adhered to strict loss rule.' },
     { id: '3', symbol: 'RELIANCE', profit: 800.00, type: 'BUY', closed_at: yesterday.toISOString(), is_pending: false, notes: 'Great breakout execution on high volume.' },
     { id: '4', symbol: 'TCS', profit: -50.00, type: 'BUY', closed_at: yesterday.toISOString(), is_pending: false, notes: 'Minor loss, setup invalidation reached.' },
     { id: '5', symbol: 'HDFC', profit: 600.00, type: 'SELL', closed_at: today.toISOString(), is_pending: false, notes: 'Rode the trend to dynamic support level.' },
     { id: '6', symbol: 'INFY', profit: 650.50, type: 'BUY', closed_at: today.toISOString(), is_pending: false, notes: 'Perfect pull-back entry near key moving average.' },
  ];`;

code = code.replace(oldMockTrades, newMockTrades);

// 2. Update render block in Journal Preview (use state or calculated data)
const oldRenderBlock = `                  <div className={\`transition-all duration-500 \${isStarter ? 'blur-[6px] opacity-30 select-none pointer-events-none' : ''}\`}>
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3">
                       <p className="text-[13px] text-slate-500 font-medium text-center py-4">No recent journal entries to preview.</p>
                    </div>
                  </div>`;

const newRenderBlock = `                  <div className={\`transition-all duration-500 \${isStarter ? 'blur-[6px] opacity-30 select-none pointer-events-none' : ''}\`}>
                    {journalPreviewData.trades.length === 0 ? (
                      <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3">
                         <p className="text-[13px] text-slate-500 font-medium text-center py-4">No recent journal entries to preview.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {/* Best Symbol Insight Banner */}
                        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/20 rounded-xl flex items-start gap-2.5">
                          <div className="mt-0.5 p-1 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Sparkles size={13} />
                          </div>
                          <div>
                            <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{journalPreviewData.bestSymbolInsight.title}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">{journalPreviewData.bestSymbolInsight.subtitle}</p>
                          </div>
                        </div>

                        {/* Recent Completed Trades */}
                        <div className="flex flex-col gap-2">
                          {journalPreviewData.trades.map((trade) => {
                            const isProfit = trade.profit >= 0;
                            return (
                              <div key={trade.id} className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-3 flex flex-col justify-between hover:border-slate-200 dark:hover:border-white/20 transition-all">
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[12.5px] font-bold text-slate-800 dark:text-slate-200">{trade.symbol}</span>
                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{trade.time}</span>
                                  </div>
                                  <span className={\`text-[12.5px] font-black \${isProfit ? 'text-emerald-500' : 'text-rose-500'} tabular-nums\`}>
                                    {isProfit ? '+' : ''}\${trade.profit.toFixed(2)}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic line-clamp-1">
                                  "{trade.note}"
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>`;

code = code.replace(oldRenderBlock, newRenderBlock);

fs.writeFileSync(path, code);
console.log('Successfully added mock journal entries UI!');
