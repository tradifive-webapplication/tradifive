const fs = require('fs');

const path = 'src/components/journal/JournalMetrics.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update static METRIC_CONTENT to put icon/badge on the right
code = code.replace(
  `      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>
        <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />
        <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">255</span>
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>
        <div className="flex items-center gap-1.5">
          <span className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">255</span>
          <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />
        </div>
      </div>`
);

code = code.replace(
  `      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>
        <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>
        <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
      </div>`
);

code = code.replace(
  `      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
        <MetricTooltip content="Your current active streak of winning or losing trades, as well as current drawdown risk metrics." />
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
        <MetricTooltip content="Your current active streak of winning or losing trades, as well as current drawdown risk metrics." />
      </div>`
);

code = code.replace(
  `      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>
        <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio)." />
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>
        <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio)." />
      </div>`
);

code = code.replace(
  `      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>
        <MetricTooltip content="Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable." />
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>
        <MetricTooltip content="Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable." />
      </div>`
);

// 2. Update dynamic metrics block
let lines = code.split(/\r?\n/);
for (let i = 0; i < lines.length; i++) {
  // Fix Account Balance & P&L dynamic loading
  if (lines[i].includes('p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>') &&
      lines[i-1] && lines[i-1].includes('gap-1.5')) {
    // This is the gap-1.5 container
    lines[i-1] = lines[i-1].replace('gap-1.5', 'justify-between w-full');
    // We also need to move the badge so it is grouped with the tooltip on the right
    // Let's find the badge line
    if (lines[i+2] && lines[i+2].includes('rounded-full')) {
      const badgeContent = lines[i+2].trim();
      const tooltipContent = lines[i+1].trim();
      const indent = lines[i+1].match(/^\s*/)[0];
      lines[i+1] = `${indent}<div className="flex items-center gap-1.5">`;
      lines[i+2] = `${indent}  ${badgeContent}`;
      // insert tooltip after badge
      lines.splice(i+3, 0, `${indent}  ${tooltipContent}`, `${indent}</div>`);
      i += 2; // skip added lines
    }
  }

  // Fix other 4 dynamic metrics from gap-1.5 to justify-between
  if (lines[i].includes('p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"') && 
      (lines[i].includes('Trade Win %') || lines[i].includes('Current Streak') || lines[i].includes('Avg Win/Loss') || lines[i].includes('Profit Factor'))) {
    if (lines[i-1] && lines[i-1].includes('gap-1.5')) {
      lines[i-1] = lines[i-1].replace('gap-1.5', 'justify-between w-full');
    }
  }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Successfully aligned tooltips to the right side of the metrics cards!');
