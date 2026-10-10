import React from 'react';

const MajorsWidget = () => {
  return (
    <div className="w-full mb-6">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl border border-slate-200 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#252528]">
          <h2 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">Majors</h2>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
              <input type="checkbox" defaultChecked className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /> 
              Live
            </label>
            <span className="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              About
            </span>
          </div>
        </div>
        
        {/* Grid */}
        <div className="flex text-[11px] leading-tight overflow-x-auto amazing-scrollbar">
          {/* Left Labels */}
          <div className="w-[100px] bg-slate-50 dark:bg-[#252528] border-r border-slate-200 dark:border-white/5 flex flex-col shrink-0 font-medium text-slate-500 dark:text-slate-400">
            <div className="h-6 flex items-center justify-center border-b border-slate-200 dark:border-white/5">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <div className="h-7 flex items-center px-3 border-b border-slate-200 dark:border-white/5">Bid</div>
            <div className="h-[50px] flex items-center px-3 border-b border-slate-200 dark:border-white/5">Chart: Last 6 hr</div>
            <div className="h-7 flex items-center px-3 border-b border-slate-200 dark:border-white/5">Pip Chg: 6 hr</div>
            <div className="h-7 flex items-center px-3 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#2C2C2E]">
              % Chg: 6 hr
            </div>
          </div>
          
          {/* Currency Columns */}
          {[
            { pair: 'EUR/USD', bid: '1.1227', sub: '1', chart: 'text-blue-500', pip: '0', pipCol: 'text-emerald-500', pct: '-0.00%', pctCol: 'text-emerald-500' },
            { pair: 'GBP/USD', bid: '1.3240', sub: '4', chart: 'text-blue-500', pip: '-3', pipCol: 'text-rose-500', pct: '-0.02%', pctCol: 'text-rose-500' },
            { pair: 'USD/JPY', bid: '158.38', sub: '2', chart: 'text-blue-500', pip: '49', pipCol: 'text-emerald-500', pct: '0.31%', pctCol: 'text-emerald-500' },
            { pair: 'USD/CHF', bid: '0.8300', sub: '8', chart: 'text-blue-500', pip: '-1', pipCol: 'text-rose-500', pct: '-0.01%', pctCol: 'text-rose-500' },
            { pair: 'USD/CAD', bid: '1.4223', sub: '7', chart: 'text-blue-500', pip: '14', pipCol: 'text-emerald-500', pct: '0.10%', pctCol: 'text-emerald-500' },
            { pair: 'AUD/USD', bid: '0.6978', sub: '8', chart: 'text-blue-500', pip: '4', pipCol: 'text-emerald-500', pct: '0.06%', pctCol: 'text-emerald-500' },
            { pair: 'NZD/USD', bid: '0.5611', sub: '3', chart: 'text-blue-500', pip: '-3', pipCol: 'text-rose-500', pct: '-0.05%', pctCol: 'text-rose-500' },
            { pair: 'Gold/USD', bid: '4192.8', sub: '5', chart: 'text-blue-500', pip: 'na', pipCol: 'text-slate-400', pct: '0.51%', pctCol: 'text-emerald-500' },
          ].map((col, i) => (
            <div key={col.pair} className="min-w-[85px] flex-1 flex flex-col border-r border-slate-200 dark:border-white/5 last:border-r-0 text-center">
              <div className="h-6 flex items-center justify-center border-b border-slate-200 dark:border-white/5 font-bold text-slate-900 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-[#252528] transition-colors">
                {col.pair} <svg className="ml-1 w-2.5 h-2.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <div className="h-7 flex items-center justify-center border-b border-slate-200 dark:border-white/5 font-bold text-slate-900 dark:text-white text-[12px]">
                {col.bid}<span className="text-[9px] text-slate-400 ml-[1px] align-top">{col.sub}</span>
              </div>
              <div className={`h-[50px] flex items-center justify-center border-b border-slate-200 dark:border-white/5 ${col.chart} relative`}>
                <svg width="45" height="25" viewBox="0 0 100 50" className="opacity-90">
                  <line x1="10" y1="20" x2="10" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="7.5" y="25" width="5" height="10" fill="currentColor" rx="1" />
                  <line x1="30" y1="10" x2="30" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="27.5" y="15" width="5" height="10" fill="currentColor" rx="1" />
                  <line x1="50" y1="5" x2="50" y2="45" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="47.5" y="10" width="5" height="30" fill="currentColor" rx="1" />
                  <line x1="70" y1="15" x2="70" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="67.5" y="20" width="5" height="10" fill="transparent" stroke="currentColor" strokeWidth="1.5" rx="1" />
                  <line x1="90" y1="20" x2="90" y2="40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <rect x="87.5" y="25" width="5" height="10" fill="transparent" stroke="currentColor" strokeWidth="1.5" rx="1" />
                </svg>
              </div>
              <div className={`h-7 flex items-center justify-center border-b border-slate-200 dark:border-white/5 font-bold ${col.pipCol}`}>{col.pip}</div>
              <div className={`h-7 flex items-center justify-center font-bold ${col.pctCol}`}>{col.pct}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MajorsWidget;
