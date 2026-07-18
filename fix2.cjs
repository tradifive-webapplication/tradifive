const fs = require('fs');
let content = fs.readFileSync('src/pages/RiskGuard.tsx', 'utf8');

const boxes = [
  { 
    titleMatch: 'Target Capital Guard', 
    oldDescRegex: /<p[^>]*>Configure target goals and parameters<\\/p>/,
    tooltip: 'Set profit goals to track progress and stay motivated.',
    sub: 'Track your profit goals',
    iconColor: 'indigo-500'
  },
  { 
    titleMatch: "{activeMarket === 'indian' ? 'Max Quantity Guard' : 'Max Lot Guard'}", 
    oldDescRegex: /<p[^>]*>Enforce maximum order volume thresholds.*?</,
    tooltip: 'Enforce maximum order volume thresholds to prevent oversized trades.',
    sub: 'Enforce position sizing limits',
    iconColor: 'blue-500'
  },
  { 
    titleMatch: 'Drawdown Guard', 
    oldDescRegex: /<p[^>]*>Automatically lock your terminal if the daily loss limit is hit\\.?<\\/p>/,
    tooltip: 'Automatically lock your terminal if the daily loss limit is hit.',
    sub: 'Protect equity with daily limits',
    iconColor: 'emerald-500'
  },
  { 
    titleMatch: 'Expiry & Event Locks', 
    oldDescRegex: /<p[^>]*>Freeze trading on high-volatility days like options expiries\\.?<\\/p>/,
    tooltip: 'Freeze trading on high-volatility days like options expiries.',
    sub: 'Block high-volatility days',
    iconColor: 'purple-500'
  },
  { 
    titleMatch: 'Discipline Sentinel', 
    oldDescRegex: /<p[^>]*>Restrict the maximum number of trades per day to prevent overtrading\\.?<\\/p>/,
    tooltip: 'Restrict the maximum number of trades per day to prevent overtrading.',
    sub: 'Lock max daily executions',
    iconColor: 'cyan-500'
  },
  { 
    titleMatch: 'Session Sentinel', 
    oldDescRegex: /<p[^>]*>Only allow trading during specified market sessions\\.?<\\/p>/,
    tooltip: 'Only allow trading during specified market sessions.',
    sub: 'Restrict hourly trading windows',
    iconColor: 'sky-500'
  }
];

boxes.forEach(b => {
  const lines = content.split('\\n');
  let startIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<h3') && lines[i].includes(b.titleMatch)) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    console.log('Could not find', b.titleMatch);
    return;
  }

  let hasTooltip = false;
  for (let i = startIdx; i < startIdx + 10; i++) {
     if (lines[i] && lines[i].includes('TooltipProvider')) {
        hasTooltip = true;
     }
  }

  if (!hasTooltip) {
     const h3Line = lines[startIdx];
     
     let pIdx = -1;
     for (let i = startIdx; i < startIdx + 5; i++) {
        if (lines[i] && b.oldDescRegex.test(lines[i])) {
           pIdx = i;
           break;
        }
     }
     
     if (pIdx !== -1) {
        let pattern = new RegExp('(<div[^>]*>\\\\s*)' + h3Line.replace(/([.*+?^=!:${}()|\\[\\]\\\\\\/])/g, '\\\\$1') + '(\\\\s*)' + lines[pIdx].replace(/([.*+?^=!:${}()|\\[\\]\\\\\\/])/g, '\\\\$1'));
        
        content = content.replace(pattern, \`<div>
   <div className="flex items-center gap-1.5">
      \${h3Line.trim()}
      <TooltipProvider delayDuration={100}>
         <Tooltip>
            <TooltipTrigger asChild>
               <button type="button" className="text-slate-400 hover:text-\${b.iconColor} transition-colors">
                  <Info size={13} strokeWidth={2.5} />
               </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px] p-2 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#252528] shadow-xl">
               <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">\${b.tooltip}</p>
            </TooltipContent>
         </Tooltip>
      </TooltipProvider>
   </div>
   <p className="text-[10px] text-slate-400 font-medium mt-0.5">\${b.sub}</p>\`);
     } else {
        console.log('Could not find p tag for', b.titleMatch);
     }
  } else {
     console.log(b.titleMatch, 'already has Tooltip');
  }
});

fs.writeFileSync('src/pages/RiskGuard.tsx', content);
console.log('Fixed tooltips and subtitles!');
