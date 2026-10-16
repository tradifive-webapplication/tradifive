const fs = require('fs');

const path = 'src/components/journal/JournalCharts.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Style chart titles to use Outfit and font-black
code = code.replace(
  `className="text-[15px] font-bold text-slate-900 dark:text-slate-200 dark:text-white leading-tight"`,
  `className="text-[14px] font-black text-slate-900 dark:text-slate-200 tracking-tight leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}`
);

// 2. Style Recent Trades tabs
code = code.replace(
  `className={\`pb-3 text-[15px] font-bold transition-all relative \${tab === "recent" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600"}\`}`,
  `className={\`pb-2 text-[12px] font-extrabold uppercase tracking-wider transition-all relative \${tab === "recent" ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"}\`}`
);
code = code.replace(
  `className={\`pb-3 text-[15px] font-bold transition-all relative \${tab === "open" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600"}\`}`,
  `className={\`pb-2 text-[12px] font-extrabold uppercase tracking-wider transition-all relative \${tab === "open" ? "text-slate-900 dark:text-white" : "text-slate-400 hover:text-slate-600"}\`}`
);

// Update indicator line in recent trades tabs
code = code.replace(
  `<div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400" />`,
  `<div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />`
);
code = code.replace(
  `<div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400" />`,
  `<div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />`
);

// 3. Style Table Headers in Recent Trades
code = code.replace(
  `className="text-center py-3 text-[12px] font-black text-slate-900 dark:text-slate-200 rounded-l-xl"`,
  `className="text-center py-3 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider rounded-l-xl"`
);
code = code.replace(
  `className="text-center py-3 text-[12px] font-black text-slate-900 dark:text-slate-200"`,
  `className="text-center py-3 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"`
);
code = code.replace(
  `className="text-right py-3 pr-4 text-[12px] font-black text-slate-900 dark:text-slate-200 rounded-r-xl"`,
  `className="text-right py-3 pr-4 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider rounded-r-xl"`
);

fs.writeFileSync(path, code);
console.log('Successfully patched JournalCharts.tsx with premium styling and matching styles!');
