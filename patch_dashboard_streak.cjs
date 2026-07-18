const fs = require('fs');
const path = 'src/pages/Dashboard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add the useMemo logic for Trading Streak
const useMemoHookStr = `
  const { streakVal, bestStreak, streakDots } = useMemo(() => {
    let currentStreak = 0;
    let best = 0;
    const dots = [];
    if (recentTrades && recentTrades.length > 0) {
      const closedTrades = recentTrades.filter((t) => t.profit !== undefined && t.profit !== null && t.closed_at);
      const sortedDesc = [...closedTrades].sort((a, b) => new Date(b.closed_at || b.created_at).getTime() - new Date(a.closed_at || a.created_at).getTime());
      for (const t of sortedDesc) {
        if (Number(t.profit) > 0) { currentStreak++; } else { break; }
      }
      
      let runLen = 0;
      const chronoTrades = [...closedTrades].sort((a, b) => new Date(a.closed_at || a.created_at).getTime() - new Date(b.closed_at || b.created_at).getTime());
      for (const t of chronoTrades) {
        if (Number(t.profit) > 0) { runLen++; if (runLen > best) best = runLen; } else { runLen = 0; }
      }
      
      const today = new Date();
      const dailyPnl = {};
      for (const t of closedTrades) {
        const d = new Date(t.closed_at || t.created_at);
        const key = \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`;
        dailyPnl[key] = (dailyPnl[key] || 0) + Number(t.profit || 0);
      }
      for (let i = 14; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = \`\${d.getFullYear()}-\${String(d.getMonth()+1).padStart(2,'0')}-\${String(d.getDate()).padStart(2,'0')}\`;
        if (dailyPnl[key] !== undefined) {
          dots.push({ date: key, status: dailyPnl[key] > 0 ? 'green' : 'red' });
        } else {
          dots.push({ date: key, status: 'gray' });
        }
      }
    }
    return {
      streakVal: \`\${currentStreak} Day\${currentStreak !== 1 ? 's' : ''}\`,
      bestStreak: best,
      streakDots: dots
    };
  }, [recentTrades]);
`;

code = code.replace(
  `  const displayTrades = useMemo(() => {`,
  `${useMemoHookStr}\n  const displayTrades = useMemo(() => {`
);

// 2. Add the UI widget
const widgetUI = `
            {/* Trading Streak Widget */}
            <GlassCard className="flex flex-col p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#222]/60 mb-1">
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Flame size={16} className="text-orange-500 fill-orange-500/10" />
                  <span>Trading Streak</span>
                </h3>
                <span className="text-[14px] font-bold text-orange-500 leading-none">{streakVal}</span>
              </div>

              <div className="flex justify-between text-xs font-semibold text-slate-455 mt-3 mb-1">
                <span className="text-slate-500">Current Streak</span>
                <span className="text-slate-500">Best: <strong className="text-slate-900 dark:text-white font-extrabold">{bestStreak} Day{bestStreak !== 1 ? 's' : ''}</strong></span>
              </div>

              <div className="flex items-center justify-between gap-1.5 py-1">
                {(streakDots.length > 0 ? streakDots : Array.from({length: 15}, () => ({date: '', status: 'gray'}))).map((dot, idx) => (
                  <span 
                    key={idx}
                    title={dot.date}
                    className={\`w-2.5 h-2.5 rounded-full block border border-white/5 shadow-sm \${
                      dot.status === 'green' ? 'bg-[#10b981]' : (dot.status === 'red' ? 'bg-[#ef4444]' : 'bg-slate-200 dark:bg-[#1A1A1A]')
                    }\`} 
                  />
                ))}
              </div>

              <div className="flex justify-between text-[9px] text-slate-455 font-bold uppercase tracking-widest leading-none mt-1 text-slate-400">
                <span>{streakDots.length > 0 ? (() => { const d = new Date(streakDots[0].date); return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', {day: 'numeric', month: 'short'}); })() : ''}</span>
                <span>Today</span>
              </div>
            </GlassCard>
`;

code = code.replace(
  `<div className="lg:col-span-1 space-y-4">`,
  `<div className="lg:col-span-1 space-y-4">\n${widgetUI}`
);

fs.writeFileSync(path, code);
console.log('Done!');
