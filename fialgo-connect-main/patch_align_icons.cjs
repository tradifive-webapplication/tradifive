const fs = require('fs');

const path = 'src/components/journal/JournalMetrics.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace all header wrappers for winrate, streak, avgwinloss, profitfactor
// In static METRIC_CONTENT:
code = code.replace(
  `<div className="flex items-center justify-between">\r\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>`,
  `<div className="flex items-center gap-1.5">\r\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>`
);
code = code.replace(
  `<div className="flex items-center justify-between">\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>`,
  `<div className="flex items-center gap-1.5">\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>`
);

code = code.replace(
  `<div className="flex items-center justify-between">\r\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>`,
  `<div className="flex items-center gap-1.5">\r\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>`
);
code = code.replace(
  `<div className="flex items-center justify-between">\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>`,
  `<div className="flex items-center gap-1.5">\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>`
);

code = code.replace(
  `<div className="flex items-center justify-between">\r\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>`,
  `<div className="flex items-center gap-1.5">\r\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>`
);
code = code.replace(
  `<div className="flex items-center justify-between">\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>`,
  `<div className="flex items-center gap-1.5">\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>`
);

code = code.replace(
  `<div className="flex items-center justify-between">\r\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>`,
  `<div className="flex items-center gap-1.5">\r\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>`
);
code = code.replace(
  `<div className="flex items-center justify-between">\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>`,
  `<div className="flex items-center gap-1.5">\n        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>`
);


// In dynamic metrics block:
let lines = code.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"') && 
      (lines[i].includes('Trade Win %') || lines[i].includes('Current Streak') || lines[i].includes('Avg Win/Loss') || lines[i].includes('Profit Factor'))) {
    // Check if the previous line is flex items-center justify-between
    if (lines[i-1] && lines[i-1].includes('justify-between')) {
      lines[i-1] = lines[i-1].replace('justify-between', 'gap-1.5');
    }
  }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Successfully aligned all info icons next to their titles!');
