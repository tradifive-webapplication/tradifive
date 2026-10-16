const fs = require('fs');
let content = fs.readFileSync('src/pages/RiskGuard.tsx', 'utf8');

const boxes = [
  { 
    titleMatch: 'Target Capital Guard', 
    oldP: '<p className="text-[10px] text-slate-400 font-medium">Configure target goals and parameters</p>',
    tooltip: 'Set profit goals to track progress and stay motivated.',
    sub: 'Track your profit goals',
    iconColor: 'indigo-500'
  },
  { 
    titleMatch: "{activeMarket === 'indian' ? 'Max Quantity Guard' : 'Max Lot Guard'}", 
    oldP: '<p className="text-[10px] text-slate-400 font-medium">Enforce maximum order volume thresholds</p>',
    tooltip: 'Enforce maximum order volume thresholds to prevent oversized trades.',
    sub: 'Enforce position sizing limits',
    iconColor: 'blue-500'
  },
  { 
    titleMatch: 'Drawdown Guard', 
    oldP: '<p className="text-[10px] text-slate-400 font-medium">Automatically lock your terminal if the daily loss limit is hit.</p>',
    tooltip: 'Automatically lock your terminal if the daily loss limit is hit.',
    sub: 'Protect equity with daily limits',
    iconColor: 'emerald-500'
  },
  { 
    titleMatch: 'Expiry & Event Locks', 
    oldP: '<p className="text-[10px] text-slate-400 font-medium">Freeze trading on high-volatility days like options expiries</p>',
    tooltip: 'Freeze trading on high-volatility days like options expiries.',
    sub: 'Block high-volatility days',
    iconColor: 'purple-500'
  },
  { 
    titleMatch: 'Discipline Sentinel', 
    oldP: '<p className="text-[10px] text-slate-400 font-medium">Restrict the maximum number of trades per day to prevent overtrading</p>',
    tooltip: 'Restrict the maximum number of trades per day to prevent overtrading.',
    sub: 'Lock max daily executions',
    iconColor: 'cyan-500'
  },
  { 
    titleMatch: 'Session Sentinel', 
    oldP: '<p className="text-[10px] text-slate-400 font-medium">Only allow trading during specified market sessions</p>',
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
        if (lines[i] && lines[i].includes(b.oldP.split('>')[1].split('<')[0])) {
           pIdx = i;
           break;
        }
     }
     
     if (pIdx !== -1) {
        // Just extract the indentation of h3Line
        let indentation = h3Line.match(/^\\s*/)[0];
        // Ensure indentation is correct for the wrapper by stripping 3 spaces (since it was inside a div originally)
        let wrapperIndentation = indentation.slice(0, Math.max(0, indentation.length - 3));
        
        let targetBlock = lines[startIdx - 1] + '\\n' + lines[startIdx] + '\\n' + lines[pIdx];
        
        let newBlock = \`\${wrapperIndentation}<div>
\${wrapperIndentation}   <div className="flex items-center gap-1.5">
\${h3Line}
\${wrapperIndentation}      <TooltipProvider delayDuration={100}>
\${wrapperIndentation}         <Tooltip>
\${wrapperIndentation}            <TooltipTrigger asChild>
\${wrapperIndentation}               <button type="button" className="text-slate-400 hover:text-\${b.iconColor} transition-colors">
\${wrapperIndentation}                  <Info size={13} strokeWidth={2.5} />
\${wrapperIndentation}               </button>
\${wrapperIndentation}            </TooltipTrigger>
\${wrapperIndentation}            <TooltipContent side="top" className="max-w-[200px] p-2 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#252528] shadow-xl">
\${wrapperIndentation}               <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">\${b.tooltip}</p>
\${wrapperIndentation}            </TooltipContent>
\${wrapperIndentation}         </Tooltip>
\${wrapperIndentation}      </TooltipProvider>
\${wrapperIndentation}   </div>
\${wrapperIndentation}   <p className="text-[10px] text-slate-400 font-medium mt-0.5">\${b.sub}</p>\`;
        
        content = content.replace(targetBlock, newBlock);
     } else {
        console.log('Could not find p tag for', b.titleMatch);
     }
  } else {
     console.log(b.titleMatch, 'already has Tooltip');
  }
});

fs.writeFileSync('src/pages/RiskGuard.tsx', content);
console.log('Fixed tooltips and subtitles!');
