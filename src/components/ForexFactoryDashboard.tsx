import React from 'react';

const ForexFactoryDashboard = () => {
  return (
    <div className="w-full h-full overflow-y-auto amazing-scrollbar bg-[#F3F4F6] text-[#333333] p-4" style={{ fontFamily: 'Verdana, Arial, sans-serif' }}>
      
      {/* 1. MAJORS SECTION */}
      <div className="border border-[#B3B9C5] bg-white mb-4">
        {/* Header */}
        <div className="flex justify-between items-center px-2 py-1 bg-gradient-to-b from-[#4F6C95] to-[#3C5781] text-white text-[11px] font-bold">
          <span>Majors</span>
          <div className="flex items-center gap-3 font-normal">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-3 h-3" /> Live
            </label>
            <span className="flex items-center gap-1 cursor-pointer hover:underline">
              <span className="text-[10px]">ⓘ</span> About
            </span>
          </div>
        </div>
        
        {/* Grid */}
        <div className="flex text-[11px] leading-tight">
          {/* Left Labels */}
          <div className="w-[120px] bg-[#E8EAEF] border-r border-[#D3D7E0] flex flex-col shrink-0 text-[#444444]">
            <div className="h-6 flex items-center justify-center border-b border-white">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" className="opacity-50"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
            <div className="h-7 flex items-center px-2 text-[#3B5998] border-b border-white">Bid</div>
            <div className="h-[60px] flex items-center px-2 text-[#3B5998] border-b border-white">Chart: Last 6 hr</div>
            <div className="h-7 flex items-center px-2 text-[#3B5998] border-b border-white">Pip Chg: 6 hr</div>
            <div className="h-7 flex items-center px-2 text-[#3B5998] bg-[#D4E4CD]">
              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[4px] border-l-[#4BA145] border-b-[4px] border-b-transparent mr-1"></div>
              % Chg: 6 hr
            </div>
          </div>
          
          {/* Currency Columns */}
          {[
            { pair: 'EUR/USD', bid: '1.1227', sub: '1', chart: 'text-blue-500', pip: '0', pipCol: 'text-[#4BA145]', pct: '-0.00%', pctCol: 'text-[#4BA145]' },
            { pair: 'GBP/USD', bid: '1.3240', sub: '4', chart: 'text-blue-600', pip: '-3', pipCol: 'text-[#E23F3F]', pct: '-0.02%', pctCol: 'text-[#E23F3F]' },
            { pair: 'USD/JPY', bid: '158.38', sub: '2', chart: 'text-blue-400', pip: '49', pipCol: 'text-[#4BA145]', pct: '0.31%', pctCol: 'text-[#4BA145]' },
            { pair: 'USD/CHF', bid: '0.8300', sub: '8', chart: 'text-blue-700', pip: '-1', pipCol: 'text-[#E23F3F]', pct: '-0.01%', pctCol: 'text-[#E23F3F]' },
            { pair: 'USD/CAD', bid: '1.4223', sub: '7', chart: 'text-blue-500', pip: '14', pipCol: 'text-[#4BA145]', pct: '0.10%', pctCol: 'text-[#4BA145]' },
            { pair: 'AUD/USD', bid: '0.6978', sub: '8', chart: 'text-blue-500', pip: '4', pipCol: 'text-[#4BA145]', pct: '0.06%', pctCol: 'text-[#4BA145]' },
            { pair: 'NZD/USD', bid: '0.5611', sub: '3', chart: 'text-blue-600', pip: '-3', pipCol: 'text-[#E23F3F]', pct: '-0.05%', pctCol: 'text-[#E23F3F]' },
            { pair: 'Gold/USD', bid: '4192.8', sub: '5', chart: 'text-blue-400', pip: 'na', pipCol: 'text-[#999999]', pct: '0.51%', pctCol: 'text-[#4BA145]' },
          ].map((col, i) => (
            <div key={col.pair} className="flex-1 flex flex-col border-r border-[#D3D7E0] last:border-r-0 text-center font-bold">
              <div className="h-6 flex items-center justify-center border-b border-[#D3D7E0] bg-[#F7F8F9] cursor-pointer hover:bg-slate-100">
                {col.pair} <span className="text-[9px] text-[#888] ml-1">▼</span>
              </div>
              <div className="h-7 flex items-center justify-center border-b border-[#F0F0F0]">
                {col.bid}<span className="text-[9px] text-gray-400 align-top leading-[10px]">{col.sub}</span>
              </div>
              <div className={`h-[60px] flex items-center justify-center border-b border-[#F0F0F0] ${col.chart} relative`}>
                <svg width="40" height="20" viewBox="0 0 100 50" className="opacity-80">
                  {/* Mock candlestick pattern */}
                  <line x1="10" y1="20" x2="10" y2="40" stroke="currentColor" strokeWidth="2" />
                  <rect x="8" y="25" width="4" height="10" fill="currentColor" />
                  <line x1="30" y1="10" x2="30" y2="30" stroke="currentColor" strokeWidth="2" />
                  <rect x="28" y="15" width="4" height="10" fill="currentColor" />
                  <line x1="50" y1="5" x2="50" y2="45" stroke="currentColor" strokeWidth="2" />
                  <rect x="48" y="10" width="4" height="30" fill="currentColor" />
                  <line x1="70" y1="15" x2="70" y2="35" stroke="currentColor" strokeWidth="2" />
                  <rect x="68" y="20" width="4" height="10" fill="transparent" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="90" y1="20" x2="90" y2="40" stroke="currentColor" strokeWidth="2" />
                  <rect x="88" y="25" width="4" height="10" fill="transparent" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className={`h-7 flex items-center justify-center border-b border-[#F0F0F0] ${col.pipCol}`}>{col.pip}</div>
              <div className={`h-7 flex items-center justify-center ${col.pctCol} font-normal`}>{col.pct}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. NEWS SECTION */}
      <div className="flex gap-4 mb-4">
        
        {/* Latest Stories */}
        <div className="flex-1 border border-[#B3B9C5] bg-white">
          <div className="flex justify-between items-center px-2 py-1 bg-gradient-to-b from-[#4F6C95] to-[#3C5781] text-white text-[11px] font-bold">
            <span>News / Latest Stories</span>
            <div className="flex items-center gap-2 font-normal text-[10px]">
              <span className="cursor-pointer">▲</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" className="w-3 h-3" /> Stream
              </label>
            </div>
          </div>
          <div className="p-2 space-y-3">
            {[
              { title: "South Island leads as NZ house values stall since 2023 election", src: "mpamag.com", time: "5 min ago", type: "article" },
              { title: "Swiss consumer sentiment practically the same as a year ago", src: "seco.admin.ch", time: "58 min ago", type: "folder" },
              { title: "ECB Watch: Still waiting for round two", src: "corporate.nordea.com", time: "1 hr 40 min ago", type: "article" },
              { title: "Gold rises toward $4,180 as Treasury yields ease from 24-year highs and US dollar pauses", src: "investinglive.com", time: "2 hr 59 min ago", type: "article", comments: "1 comment" }
            ].map((news, i) => (
              <div key={i} className="text-[11px] border-b border-dashed border-[#DDDDDD] pb-2 last:border-0 last:pb-0">
                <div className="flex items-start gap-1">
                  {news.type === 'folder' ? 
                    <span className="text-[#F4C430] shrink-0 mt-[1px]">📁</span> : 
                    <span className="text-gray-400 shrink-0 mt-[1px]">📄</span>
                  }
                  <a href="#" className="text-[#3B5998] font-bold hover:underline leading-snug">{news.title}</a>
                </div>
                <div className="text-[#777777] ml-4 mt-[2px]">
                  From <a href="#" className="underline hover:text-[#3B5998]">{news.src}</a> | {news.time} {news.comments && <span className="text-[#4BA145]"> | {news.comments} ▼</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="px-2 py-1 bg-[#F9F9F9] border-t border-[#EEEEEE] text-[10px] text-[#3B5998] font-bold cursor-pointer hover:underline">
            ↓ More
          </div>
        </div>

        {/* Hot Story */}
        <div className="flex-1 border border-[#B3B9C5] bg-white flex flex-col">
          <div className="flex justify-between items-center px-2 py-1 bg-gradient-to-b from-[#4F6C95] to-[#3C5781] text-white text-[11px] font-bold">
            <span>News / Hot Story</span>
            <span className="font-normal text-[10px] cursor-pointer">▲</span>
          </div>
          <div className="p-3 flex-1">
            <div className="flex items-start gap-1 mb-2">
              <span className="text-gray-400 shrink-0 mt-[2px]">📄</span>
              <a href="#" className="text-[#3B5998] text-[14px] font-bold hover:underline leading-tight">
                Gold rises toward $4,180 as Treasury yields ease from 24-year highs and US dollar pauses
              </a>
            </div>
            <div className="flex gap-2">
              <img src="https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=150&h=100" alt="Gold bars" className="w-[100px] h-[75px] object-cover border border-[#CCCCCC] p-[1px]" />
              <div className="text-[11px]">
                <div className="text-[#777777] mb-1">
                  <a href="#" className="underline hover:text-[#3B5998]">From investinglive.com</a> | 2 hr 59 min ago | <span className="text-[#4BA145]">1 comment ▼</span>
                </div>
                <p className="text-[#333333] leading-snug">
                  Gold's rebound is tied closely to the pullback in Treasury yields, leaving it exposed if the bond selloff resumes ahead of the Fed's October meeting. With markets pricing an 82% chance of a hike by December, any strong US data or hawkish Fed commentary could quickly push yields back up and gold back toward its recent lows. Oil remains the...
                </p>
              </div>
            </div>
          </div>
          <div className="px-2 py-1 bg-[#F9F9F9] border-t border-[#EEEEEE] text-[10px] text-[#3B5998] font-bold cursor-pointer hover:underline mt-auto">
            ↓ More
          </div>
        </div>

      </div>

      {/* 3. CALENDAR SECTION */}
      <div className="border border-[#B3B9C5] bg-white text-[11px]">
        {/* Header */}
        <div className="flex justify-between items-center px-2 py-1 bg-gradient-to-b from-[#4F6C95] to-[#3C5781] text-white font-bold">
          <div className="flex items-center gap-2">
            <span className="cursor-pointer">◀</span>
            <span>Today: Oct 9</span>
            <span className="cursor-pointer">▶</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-normal">
            <span className="flex items-center gap-1 cursor-pointer hover:underline text-[#A6E8A6]">▶ Up Next</span>
            <span className="flex items-center gap-1 cursor-pointer hover:underline">🔍 Search Events</span>
            <span className="flex items-center gap-1 cursor-pointer hover:underline">▼ Filter</span>
          </div>
        </div>
        
        {/* Table Header */}
        <div className="grid grid-cols-[60px_60px_60px_30px_1fr_40px_40px_60px_60px_60px_40px] bg-[#899DBE] text-white px-1 py-[2px] font-bold border-b border-white">
          <div className="text-center">Date</div>
          <div className="text-center underline cursor-pointer hover:text-blue-100">1:34pm</div>
          <div className="text-center">Currency</div>
          <div className="text-center">Impact</div>
          <div className="pl-2"></div>
          <div className="text-center">Alerts</div>
          <div className="text-center">Detail</div>
          <div className="text-center">Actual</div>
          <div className="text-center">Forecast</div>
          <div className="text-center">Previous</div>
          <div className="text-center">Graph</div>
        </div>
        
        {/* Table Body */}
        <div className="flex flex-col">
          {[
            { date: 'Fri\nOct 9', time: '5:00am', cur: 'JPY', impact: 'yellow', event: 'Household Spending y/y', act: '-3.1%', actCol: 'text-[#E23F3F]', fcast: '-3.5%', prev: '-3.6%' },
            { time: '11:30am', cur: 'JPY', impact: 'yellow', event: 'Prelim Machine Tool Orders y/y', act: '60.4%', actCol: 'text-[#333333]', fcast: '', prev: '64.7%' },
            { time: '12:30pm', cur: 'CHF', impact: 'yellow', event: 'SECO Consumer Climate', act: '-36', actCol: 'text-[#E23F3F]', fcast: '-32', prev: '-33', folder: true },
            { time: '1:30pm', cur: 'EUR', impact: 'yellow', event: 'Italian Industrial Production m/m', act: '-1.3%', actCol: 'text-[#E23F3F]', fcast: '0.0%', prev: '0.7%' },
            { time: 'All Day', cur: 'EUR', impact: 'yellow', event: 'ECOFIN Meetings', act: '', actCol: '', fcast: '', prev: '' },
            { time: '6:00pm', next: true, cur: 'CAD', impact: 'red', event: 'Employment Change', act: '', actCol: '', fcast: '6.1K', prev: '-41.7K' },
            { cur: 'CAD', impact: 'red', event: 'Unemployment Rate', act: '', actCol: '', fcast: '6.5%', prev: '6.4%' },
            { time: '7:30pm', cur: 'USD', impact: 'orange', event: 'Prelim UoM Consumer Sentiment', act: '', actCol: '', fcast: '47.5', prev: '48.1', prevSub: '▼', prevSubCol: 'text-[#F4C430]' },
            { cur: 'USD', impact: 'orange', event: 'Prelim UoM Inflation Expectations', act: '', actCol: '', fcast: '', prev: '4.6%' },
          ].map((row, i) => (
            <div key={i} className={`grid grid-cols-[60px_60px_60px_30px_1fr_40px_40px_60px_60px_60px_40px] px-1 py-[6px] border-b border-[#F0F0F0] hover:bg-[#F9F9F9] ${i % 2 === 0 ? 'bg-[#FAFAFA]' : 'bg-white'}`}>
              <div className="text-center text-[#777777] font-bold whitespace-pre-line leading-tight">{row.date || ''}</div>
              <div className="text-center text-[#777777]">
                {row.next && <span className="text-[#4BA145] mr-1">▶</span>}
                {row.time || ''}
              </div>
              <div className="text-center font-bold text-[#555]">{row.cur}</div>
              <div className="flex justify-center items-center">
                <div className={`w-[14px] h-[10px] rounded-sm ${row.impact === 'yellow' ? 'bg-[#FFD13B] border-[#D9A300]' : row.impact === 'orange' ? 'bg-[#FF8800] border-[#CC6D00]' : 'bg-[#FF3333] border-[#CC0000]'} border-b-2`} />
              </div>
              <div className="pl-2 text-[#333333] truncate pr-2">{row.event}</div>
              <div className="flex justify-center items-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#DDDDDD"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path></svg>
              </div>
              <div className="flex justify-center items-center">
                {row.folder ? 
                  <span className="text-[#3B5998] cursor-pointer text-[14px]">📂</span> : 
                  <span className="text-[#F4C430] cursor-pointer text-[14px]">📁</span>
                }
              </div>
              <div className={`text-center font-bold ${row.actCol}`}>{row.act}</div>
              <div className="text-center">{row.fcast}</div>
              <div className="text-center text-[#333]">
                {row.prev} {row.prevSub && <span className={row.prevSubCol}>{row.prevSub}</span>}
              </div>
              <div className="flex justify-center items-center">
                <div className="flex items-end h-[12px] gap-[1px]">
                  <div className="w-[3px] h-[4px] bg-[#4BA145]"></div>
                  <div className="w-[3px] h-[8px] bg-[#E23F3F]"></div>
                  <div className="w-[3px] h-[12px] bg-[#3B5998]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-2 py-1 bg-[#F9F9F9] border-t border-[#EEEEEE] text-[10px] text-[#3B5998] font-bold cursor-pointer hover:underline">
          ↓ More
        </div>
      </div>

    </div>
  );
};

export default ForexFactoryDashboard;
