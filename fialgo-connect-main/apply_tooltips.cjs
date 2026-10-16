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
    titleMatch: 'Max Quantity Guard', 
    oldDescRegex: /<p[^>]*>Enforce maximum order volume thresholds<\\/p>/,
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
  },
  { 
    titleMatch: 'Guardian PIN', 
    oldDescRegex: /<p[^>]*>Require a 4-digit PIN to override your max loss limit\\.?<\\/p>/,
    tooltip: 'Require a 4-digit PIN to override your max loss limit.',
    sub: 'Prevent emotional overrides',
    iconColor: 'amber-500'
  },
  { 
    titleMatch: 'Terminal Hard Stop', 
    oldDescRegex: /<p[^>]*>Triggers a full-screen lockdown when daily limits are breached\\.?<\\/p>/,
    tooltip: 'Triggers a full-screen lockdown when daily limits are breached.',
    sub: 'Force lock on limit breach',
    iconColor: 'rose-500'
  }
];

boxes.forEach(b => {
  // Find the exact h3 block:
  // e.g. <h3 className="...">Target Capital Guard</h3>
  const lines = content.split('\\n');
  let startIdx = -1;
  let titleStr = b.titleMatch;
  if (titleStr === 'Max Quantity Guard') {
    titleStr = "{activeMarket === 'indian' ? 'Max Quantity Guard' : 'Max Lot Guard'}";
  }

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<h3') && lines[i].includes(titleStr)) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    console.log('Could not find', b.titleMatch);
    return;
  }

  // The <h3> is found. Now let's find the closing </div> for this header block.
  // We want to replace the whole `<div> <h3...>...</h3> <p>...</p> </div>` or whatever is there.
  
  // Wait, let's just use string replacement on the exact block.
  let blockStart = startIdx - 1; // Assuming the wrapper <div> is the line before <h3>, e.g. `<div>` or `<div className="flex items-center gap-1.5">`
  
  // To be safe, if we ALREADY have the TooltipProvider for this block, we shouldn't add another one.
  // We can just verify if the next few lines have TooltipProvider.
  let hasTooltip = false;
  for (let i = startIdx; i < startIdx + 10; i++) {
     if (lines[i] && lines[i].includes('TooltipProvider')) {
        hasTooltip = true;
     }
  }

  if (!hasTooltip) {
     // Apply tooltip + subtitle wrapper
     const h3Line = lines[startIdx];
     const pLineRegex = b.oldDescRegex;
     
     // Find the p line index
     let pIdx = -1;
     for (let i = startIdx; i < startIdx + 5; i++) {
        if (lines[i] && pLineRegex.test(lines[i])) {
           pIdx = i;
           break;
        }
     }
     
     if (pIdx !== -1) {
        // We found the <p>. Replace the whole div wrapper.
        let matchStr = lines[startIdx - 1] + '\\n' + lines[startIdx] + '\\n' + lines[pIdx];
        
        let indentation = lines[startIdx - 1].match(/^\\s*/)[0];
        
        let newBlock = \`\${indentation}<div>
\${indentation}   <div className="flex items-center gap-1.5">
\${h3Line}
\${indentation}      <TooltipProvider delayDuration={100}>
\${indentation}         <Tooltip>
\${indentation}            <TooltipTrigger asChild>
\${indentation}               <button type="button" className="text-slate-400 hover:text-\${b.iconColor} transition-colors">
\${indentation}                  <Info size={13} strokeWidth={2.5} />
\${indentation}               </button>
\${indentation}            </TooltipTrigger>
\${indentation}            <TooltipContent side="top" className="max-w-[200px] p-2 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#252528] shadow-xl">
\${indentation}               <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">\${b.tooltip}</p>
\${indentation}            </TooltipContent>
\${indentation}         </Tooltip>
\${indentation}      </TooltipProvider>
\${indentation}   </div>
\${indentation}   <p className="text-[10px] text-slate-400 font-medium mt-0.5">\${b.sub}</p>\`;

        // It's possible the wrapper isn't lines[startIdx-1] if there are other classes.
        // Let's just do a regex replace on the file string directly.
        let pattern = new RegExp('(<div[^>]*>\\\\s*)' + h3Line.replace(/([.*+?^=!:${}()|\\[\\]\\\\\\/])/g, '\\\\$1') + '(\\\\s*)' + lines[pIdx].replace(/([.*+?^=!:${}()|\\[\\]\\\\\\/])/g, '\\\\$1'));
        
        let replacement = '$1' + \`
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
   <p className="text-[10px] text-slate-400 font-medium mt-0.5">\${b.sub}</p>\`;
        
        // Actually, $1 already contains `<div className="...">`. 
        // We might end up nesting incorrectly if we replace `<div...>` with `<div...><div className="flex...">`.
        // The original is `<div className="relative z-20 flex items-center justify-between"> <div> <h3...> <p...> </div>`. 
        // The `<div...>` immediately above `h3` is just `<div>` in some cases, or `<div>` inside a flex container.
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
     }
  }
});

fs.writeFileSync('src/pages/RiskGuard.tsx', content);
console.log('Fixed tooltips and subtitles.');
