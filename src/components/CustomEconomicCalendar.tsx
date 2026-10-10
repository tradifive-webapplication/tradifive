import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomEconomicCalendar = () => {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1C1C1E]">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-slate-100 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <span className="text-[13px] font-bold text-slate-900 dark:text-white">Today: Oct 9</span>
          <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 cursor-pointer hover:text-emerald-500 transition-colors">
            <span className="text-emerald-500 text-[10px]">▶</span> Up Next
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> 
            Search Events
          </span>
          <span onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-1 cursor-pointer hover:text-blue-500 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Filter
          </span>
        </div>
      </div>
      
      {/* Table Header */}
      <div className="grid grid-cols-[50px_60px_60px_50px_1fr_45px_45px_60px_60px_60px_45px] bg-slate-50 dark:bg-[#252528] text-slate-500 dark:text-slate-400 px-2 py-1.5 text-[11px] font-bold border-b border-slate-200 dark:border-white/5 shrink-0">
        <div className="text-center">Date</div>
        <div className="text-center">Time</div>
        <div className="text-center">Currency</div>
        <div className="text-center">Impact</div>
        <div className="pl-4">Event</div>
        <div className="text-center">Alerts</div>
        <div className="text-center">Detail</div>
        <div className="text-center">Actual</div>
        <div className="text-center">Forecast</div>
        <div className="text-center">Previous</div>
        <div className="text-center">Graph</div>
      </div>
      
      {/* Table Body */}
      <div className="flex flex-col flex-1 overflow-y-auto amazing-scrollbar">
        {[
          { date: 'Fri\nOct 9', time: '5:00am', cur: 'JPY', impact: 'low', event: 'Household Spending y/y', act: '-3.1%', actCol: 'text-rose-500', fcast: '-3.5%', prev: '-3.6%' },
          { time: '11:30am', cur: 'JPY', impact: 'low', event: 'Prelim Machine Tool Orders y/y', act: '60.4%', actCol: 'text-slate-900 dark:text-white', fcast: '', prev: '64.7%' },
          { time: '12:30pm', cur: 'CHF', impact: 'low', event: 'SECO Consumer Climate', act: '-36', actCol: 'text-rose-500', fcast: '-32', prev: '-33', folder: true },
          { time: '1:30pm', cur: 'EUR', impact: 'low', event: 'Italian Industrial Production m/m', act: '-1.3%', actCol: 'text-rose-500', fcast: '0.0%', prev: '0.7%' },
          { time: 'All Day', cur: 'EUR', impact: 'low', event: 'ECOFIN Meetings', act: '', actCol: '', fcast: '', prev: '' },
          { time: '6:00pm', next: true, cur: 'CAD', impact: 'high', event: 'Employment Change', act: '', actCol: '', fcast: '6.1K', prev: '-41.7K' },
          { cur: 'CAD', impact: 'high', event: 'Unemployment Rate', act: '', actCol: '', fcast: '6.5%', prev: '6.4%' },
          { time: '7:30pm', cur: 'USD', impact: 'med', event: 'Prelim UoM Consumer Sentiment', act: '', actCol: '', fcast: '47.5', prev: '48.1', prevSub: '▼', prevSubCol: 'text-amber-500' },
          { cur: 'USD', impact: 'med', event: 'Prelim UoM Inflation Expectations', act: '', actCol: '', fcast: '', prev: '4.6%' },
          { date: 'Mon\nOct 12', time: '9:00am', cur: 'GBP', impact: 'high', event: 'GDP m/m', act: '', actCol: '', fcast: '0.2%', prev: '-0.1%' },
          { time: '1:00pm', cur: 'USD', impact: 'low', event: 'NFIB Small Business Index', act: '', actCol: '', fcast: '91.5', prev: '91.2' },
          { time: '8:30pm', cur: 'USD', impact: 'high', event: 'CPI m/m', act: '', actCol: '', fcast: '0.1%', prev: '0.2%' },
        ].map((row, i) => (
          <div key={i} className={`grid grid-cols-[50px_60px_60px_50px_1fr_45px_45px_60px_60px_60px_45px] px-2 py-2 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors text-[11px]`}>
            <div className="text-center text-slate-500 font-bold whitespace-pre-line leading-tight">{row.date || ''}</div>
            <div className="text-center font-medium text-slate-700 dark:text-slate-300 flex justify-center items-center">
              {row.next && <span className="text-emerald-500 mr-1 text-[9px]">▶</span>}
              {row.time || ''}
            </div>
            <div className="text-center font-bold text-slate-900 dark:text-white flex justify-center items-center">{row.cur}</div>
            <div className="flex justify-center items-center">
              <div className={`w-3.5 h-2.5 rounded-sm shadow-sm flex items-center justify-center ${row.impact === 'low' ? 'bg-amber-400' : row.impact === 'med' ? 'bg-orange-500' : 'bg-rose-600'}`}>
              </div>
            </div>
            <div className="pl-3 font-medium text-slate-900 dark:text-slate-200 truncate pr-3 flex items-center">{row.event}</div>
            <div className="flex justify-center items-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-slate-600 hover:text-amber-500 cursor-pointer transition-colors"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path></svg>
            </div>
            <div className="flex justify-center items-center">
              {row.folder ? 
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500 cursor-pointer hover:text-blue-600"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg> : 
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 cursor-pointer hover:text-amber-500"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>
              }
            </div>
            <div className={`text-center font-bold flex justify-center items-center ${row.actCol}`}>{row.act}</div>
            <div className="text-center flex justify-center items-center text-slate-700 dark:text-slate-300 font-medium">{row.fcast}</div>
            <div className="text-center text-slate-700 dark:text-slate-300 font-medium flex justify-center items-center">
              {row.prev} {row.prevSub && <span className={`${row.prevSubCol} ml-1`}>{row.prevSub}</span>}
            </div>
            <div className="flex justify-center items-center">
              <div className="flex items-end h-[10px] gap-[1px] opacity-80 cursor-pointer hover:opacity-100 transition-opacity">
                <div className="w-[2px] h-[3px] bg-emerald-500 rounded-sm"></div>
                <div className="w-[2px] h-[6px] bg-rose-500 rounded-sm"></div>
                <div className="w-[2px] h-[9px] bg-blue-500 rounded-sm"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer / Load More */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-[#252528] border-t border-slate-200 dark:border-white/5 text-[11px] text-blue-600 dark:text-blue-400 font-bold cursor-pointer hover:underline text-center shrink-0">
        Load More Events
      </div>
    </div>
  );
};

export default CustomEconomicCalendar;
