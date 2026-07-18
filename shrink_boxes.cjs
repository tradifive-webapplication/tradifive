const fs = require('fs');
const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// LIVE RISK MONITOR

// Headers
code = code.replace(
  /<h2 className="text-\[14px\] font-bold text-slate-900 dark:text-white tracking-\[0\.1em\] uppercase">Live Risk Monitor<\/h2>/,
  `<h2 className="text-[12px] font-bold text-slate-900 dark:text-white tracking-[0.1em] uppercase">Live Risk Monitor</h2>`
);
code = code.replace(
  /<h2 className="text-\[14px\] font-bold text-slate-900 dark:text-white tracking-widest uppercase">AI Coach Insights<\/h2>/,
  `<h2 className="text-[12px] font-bold text-slate-900 dark:text-white tracking-widest uppercase">AI Coach Insights</h2>`
);
code = code.replace(
  /<h2 className="text-\[14px\] font-bold text-slate-900 dark:text-white tracking-widest uppercase">Journal Preview<\/h2>/,
  `<h2 className="text-[12px] font-bold text-slate-900 dark:text-white tracking-widest uppercase">Journal Preview</h2>`
);

// Live Risk Monitor Inner Grid
code = code.replace(
  /<div className="grid grid-cols-2 gap-x-8 gap-y-10 mb-10">/,
  `<div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-6">`
);

// Loading skeleton grid
code = code.replace(
  /<div className="grid grid-cols-2 gap-x-8 gap-y-8 mb-4 pb-6">/,
  `<div className="grid grid-cols-2 gap-x-6 gap-y-6 mb-4 pb-6">`
);

// Large numbers
code = code.replace(
  /text-\[32px\]/g,
  `text-[24px]`
);

// Daily executions limit text
code = code.replace(
  /<span className="text-slate-400 dark:text-slate-500 text-\[20px\] font-bold">\/ \{riskMonitorData\.executionsLimit\}<\/span>/,
  `<span className="text-slate-400 dark:text-slate-500 text-[16px] font-bold">/ {riskMonitorData.executionsLimit}</span>`
);

// Revenge guard status text
code = code.replace(
  /text-\[20px\] font-bold \$\{riskMonitorData\.revengeGuardTextClass\}/,
  `text-[16px] font-bold \${riskMonitorData.revengeGuardTextClass}`
);

// Emergency stop container
code = code.replace(
  /className={`flex items-center justify-between p-4 rounded-\[16px\] transition-all duration-300 \$\{emergencyStop/,
  `className={\`flex items-center justify-between p-3 rounded-[12px] transition-all duration-300 \${emergencyStop`
);
code = code.replace(
  /className={`w-10 h-10 flex items-center justify-center rounded-full/g,
  `className={\`w-8 h-8 flex items-center justify-center rounded-full`
);
code = code.replace(
  /className={`text-\[15px\] font-bold tracking-tight/g,
  `className={\`text-[13px] font-bold tracking-tight`
);
code = code.replace(
  /className={`text-\[12px\] font-medium \$\{emergencyStop \? "text-rose-500 dark:text-rose-400\/80"/g,
  `className={\`text-[11px] font-medium \${emergencyStop ? "text-rose-500 dark:text-rose-400/80"`
);


// AI COACH INSIGHTS
code = code.replace(
  /<div className="flex-1 space-y-4">/g,
  `<div className="flex-1 space-y-3">`
);
code = code.replace(
  /className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full/g,
  `className={\`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full`
);

// Change icon sizes from 14 to 12
code = code.replace(/size=\{14\}/g, `size={12}`);

// Ask AI Coach button
code = code.replace(
  /<button onClick=\{\(\) => navigate\("\/ai-coach"\)\} className="w-full mt-8 flex items-center justify-center gap-2 py-3\.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-\[13px\] rounded-full transition-all shadow-sm hover:shadow-md active:scale-\[0\.98\]">/g,
  `<button onClick={() => navigate("/ai-coach")} className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[12px] rounded-full transition-all shadow-sm hover:shadow-md active:scale-[0.98]">`
);

fs.writeFileSync(path, code);
console.log('Successfully replaced values in Dashboard.tsx');
