const fs = require('fs');
let code = fs.readFileSync('src/pages/TradifiveAI.tsx', 'utf8');

// 1. Remove mock data from Recent Audits
code = code.replace(
  'const initialSessions: ChatSession[] = [\n      {\n        id: "sess_1",',
  'const initialSessions: ChatSession[] = [];\n    /*\n      {\n        id: "sess_1",'
);
code = code.replace(
  '      }\n    ];\n    setSessions(initialSessions);',
  '      }\n    ];\n    */\n    setSessions(initialSessions);'
);

// 2. MT5 Bridge Logic
const oldBridge = `<div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#212123] dark:to-[#171719] rounded-[20px] p-3.5 border-2 border-white dark:border-[#1A1A1A] flex items-center justify-between shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#2B2B2F]">
                  <div className="overflow-hidden">
                    <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 truncate leading-snug">
                      {isConnected ? accountMetrics?.name || (activeMarket === 'indian' ? "Dhan Workspace" : "Marcel Workspace") : (activeMarket === 'indian' ? "Dhan Workspace" : "Marcel Workspace")}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold leading-none mt-1">
                      {isConnected ? \`\${activeMarket === 'indian' ? 'Broker' : 'MT5'} #\${accountMetrics?.account_number || (activeMarket === 'indian' ? '110593' : '28120136')}\` : (activeMarket === 'indian' ? 'Broker #110593' : 'MT5 #28120136')}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border border-emerald-500/20">
                    Live
                  </div>
                </div>`;

const newBridge = `<div className="bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#212123] dark:to-[#171719] rounded-[20px] p-3.5 border-2 border-white dark:border-[#1A1A1A] flex items-center justify-between shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#2B2B2F]">
                  {isConnected ? (
                    <>
                      <div className="overflow-hidden">
                        <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 truncate leading-snug">
                          {accountMetrics?.name || "Connected Workspace"}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 font-semibold leading-none mt-1">
                          {activeMarket === 'indian' ? 'Broker' : 'MT5'} #{accountMetrics?.account_number || '000000'}
                        </p>
                      </div>
                      <div className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border border-emerald-500/20">
                        Live
                      </div>
                    </>
                  ) : (
                    <div className="w-full flex justify-center">
                      <span className="text-[12px] font-bold text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer" onClick={() => window.location.href = '/broker-connect'}>
                        Connect Broker
                      </span>
                    </div>
                  )}
                </div>`;

code = code.replace(oldBridge, newBridge);

// 3. New Chat Button UI Change
const oldButton = `className={\`flex items-center gap-3 w-full rounded-2xl transition-all h-11 border \${isSidebarCollapsed
                    ? "justify-center px-0 hover:bg-slate-100 dark:hover:bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400"
                    : "px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-900/20 dark:shadow-indigo-500/20 border-transparent"
                  }\`}`;

const newButton = `className={\`flex items-center gap-3 w-full rounded-full transition-all h-11 border \${isSidebarCollapsed
                    ? "justify-center px-0 hover:bg-slate-100 dark:hover:bg-white/[0.04] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400"
                    : "px-4 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border-purple-100 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20 shadow-sm"
                  }\`}`;

code = code.replace(oldButton, newButton);

fs.writeFileSync('src/pages/TradifiveAI.tsx', code);
console.log('AI Coach updates applied!');
