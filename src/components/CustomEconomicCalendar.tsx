import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  Flame,
  Clock,
  Sparkles,
  SlidersHorizontal,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CalendarEventItem {
  id: string;
  event_title: string;
  currency: string;
  event_time: string;
  impact: 'High' | 'Medium' | 'Low' | 'Holiday' | string;
  forecast?: string;
  previous?: string;
  actual?: string;
  source?: string;
}

const CURRENCIES = ['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'NZD'] as const;

export default function CustomEconomicCalendar() {
  const [events, setEvents] = useState<CalendarEventItem[]>(() => {
    try {
      const cached = localStorage.getItem('tf_calendar_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [loading, setLoading] = useState(events.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => {
    try {
      const t = localStorage.getItem('tf_calendar_last_fetch');
      if (t) return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {}
    return '';
  });

  // View mode: 'today' | 'tomorrow' | 'week' | 'day'
  const [viewMode, setViewMode] = useState<'today' | 'tomorrow' | 'week' | 'day'>('today');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [impactFilters, setImpactFilters] = useState<Record<string, boolean>>({
    High: true,
    Medium: false,
    Low: false,
    Holiday: false,
  });
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const b = localStorage.getItem('tf_calendar_bookmarks');
      return b ? new Set(JSON.parse(b)) : new Set();
    } catch {
      return new Set();
    }
  });

  const nextEventRef = useRef<HTMLDivElement | null>(null);
  const tableContainerRef = useRef<HTMLDivElement | null>(null);

  // ── 1. Live Data Fetcher & Daily Refresh ──
  const fetchEvents = async (manual = false) => {
    if (manual) setRefreshing(true);
    else if (events.length === 0) setLoading(true);

    let fetchedData: CalendarEventItem[] = [];

    // Strategy A: Fetch live from proxy endpoint (/api/economic-calendar)
    try {
      const res = await fetch('/api/economic-calendar', { cache: 'no-cache' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          fetchedData = data.map((item: any) => ({
            id: `${item.country || 'GL'}-${(item.title || '').replace(/\s+/g, '_')}-${item.date}`,
            event_title: item.title || 'Economic Event',
            currency: item.country || 'USD',
            event_time: item.date,
            impact: item.impact || 'Low',
            forecast: item.forecast || '',
            previous: item.previous || '',
            actual: item.actual || '',
            source: 'ForexFactory',
          }));

          // Background sync to Supabase table
          supabase.from('economic_calendar').select('count', { count: 'exact' }).then(async ({ count }) => {
            if (!count || count < 50 || manual) {
              const rows = fetchedData.map((d) => ({
                event_title: d.event_title,
                currency: d.currency,
                event_time: d.event_time,
                impact: d.impact,
                forecast: d.forecast,
                previous: d.previous,
                actual: d.actual,
                source: 'ForexFactory',
              }));
              await supabase.from('economic_calendar').delete().neq('id', '00000000-0000-0000-0000-000000000000');
              await supabase.from('economic_calendar').insert(rows);
            }
          });
        }
      }
    } catch (err) {
      console.warn('Proxy fetch failed, fallback to Supabase:', err);
    }

    // Strategy B: Fetch from Supabase economic_calendar table
    if (fetchedData.length === 0) {
      try {
        const { data, error } = await supabase
          .from('economic_calendar')
          .select('*')
          .order('event_time', { ascending: true });

        if (!error && data && data.length > 0) {
          fetchedData = data.map((row: any) => ({
            id: row.id,
            event_title: row.event_title || 'Economic Event',
            currency: row.currency || 'USD',
            event_time: row.event_time || new Date().toISOString(),
            impact: row.impact || 'Low',
            forecast: row.forecast || '',
            previous: row.previous || '',
            actual: row.actual || '',
            source: row.source || 'ForexFactory',
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch failed:', err);
      }
    }

    if (fetchedData.length > 0) {
      setEvents(fetchedData);
      try {
        localStorage.setItem('tf_calendar_cache', JSON.stringify(fetchedData));
        localStorage.setItem('tf_calendar_last_fetch', new Date().toISOString());
      } catch {}
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastRefreshed(timeStr);
      if (manual) toast.success(`Economic calendar updated with ${fetchedData.length} live events`);
    } else if (manual) {
      toast.error('Could not refresh live calendar at this time');
    }

    setLoading(false);
    setRefreshing(false);
  };

  // Mount effect & Daily auto-refresh check
  useEffect(() => {
    fetchEvents();

    // Check if day changed every 5 minutes
    const interval = setInterval(() => {
      try {
        const last = localStorage.getItem('tf_calendar_last_fetch');
        if (last) {
          const lastDate = new Date(last).toDateString();
          const nowDate = new Date().toDateString();
          if (lastDate !== nowDate) {
            fetchEvents();
          }
        }
      } catch {}
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // ── Date Navigation Helpers ──
  const navigateDay = (direction: 'prev' | 'next') => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(next);
    setViewMode('day');
  };

  const handleSelectViewMode = (mode: 'today' | 'tomorrow' | 'week') => {
    setViewMode(mode);
    const d = new Date();
    if (mode === 'tomorrow') d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        toast.info('Alert reminder saved for this release');
      }
      try {
        localStorage.setItem('tf_calendar_bookmarks', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  // ── Filtered Events & Date Computations ──
  const now = new Date();
  const todayStr = now.toDateString();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toDateString();

  const currentDayLabel = useMemo(() => {
    if (viewMode === 'week') return 'Full Week';
    const dateStr = currentDate.toDateString();
    if (dateStr === todayStr) return 'Today: ' + currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (dateStr === tomorrowStr) return 'Tomorrow: ' + currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, [viewMode, currentDate, todayStr, tomorrowStr]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const evDate = new Date(ev.event_time);
      const evDateStr = evDate.toDateString();

      // View mode filter
      if (viewMode === 'today' && evDateStr !== todayStr) return false;
      if (viewMode === 'tomorrow' && evDateStr !== tomorrowStr) return false;
      if (viewMode === 'day' && evDateStr !== currentDate.toDateString()) return false;

      // Currency filter
      if (selectedCurrency !== 'ALL' && ev.currency !== selectedCurrency) return false;

      // Impact filter
      const normImpact = ev.impact === 'High' ? 'High' : ev.impact === 'Medium' || ev.impact === 'Med' ? 'Medium' : ev.impact === 'Holiday' ? 'Holiday' : 'Low';
      if (!impactFilters[normImpact]) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.event_title.toLowerCase().includes(q);
        const matchesCur = ev.currency.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCur) return false;
      }

      return true;
    });
  }, [events, viewMode, currentDate, selectedCurrency, impactFilters, searchQuery, todayStr, tomorrowStr]);

  // Find next upcoming event
  const nextEvent = useMemo(() => {
    const futureEvents = events.filter((e) => new Date(e.event_time) >= now);
    return futureEvents.length > 0 ? futureEvents[0] : null;
  }, [events]);

  const scrollToNextEvent = () => {
    if (nextEvent) {
      const nextDate = new Date(nextEvent.event_time);
      if (nextDate.toDateString() === todayStr) {
        setViewMode('today');
      } else {
        setCurrentDate(nextDate);
        setViewMode('day');
      }
      setTimeout(() => {
        nextEventRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  const getImpactBadge = (impact: string) => {
    const norm = impact.toLowerCase();
    if (norm === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          High
        </span>
      );
    }
    if (norm === 'medium' || norm === 'med') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Med
        </span>
      );
    }
    if (norm === 'holiday') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
          Holiday
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-300/40 dark:border-white/10">
        Low
      </span>
    );
  };

  const getCurrencyBadge = (cur: string) => {
    const colors: Record<string, string> = {
      USD: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      EUR: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      GBP: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      JPY: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      CAD: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      AUD: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      CHF: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      NZD: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    };
    const c = colors[cur] || 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    return (
      <span className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-[11px] border ${c}`}>
        {cur}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1C1C1E] text-slate-900 dark:text-slate-100 select-none">
      {/* ── TOP CONTROL BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200/80 dark:border-white/5 bg-slate-50/70 dark:bg-[#202023] shrink-0">
        {/* Date Navigator & Quick Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white dark:bg-[#27272b] border border-slate-200 dark:border-white/10 rounded-lg p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => navigateDay('prev')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[120px] text-center">
              {currentDayLabel}
            </span>
            <button
              type="button"
              onClick={() => navigateDay('next')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              title="Next Day"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Quick timeframe tabs */}
          <div className="hidden sm:flex items-center bg-white dark:bg-[#27272b] border border-slate-200 dark:border-white/10 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSelectViewMode('today')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'today'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleSelectViewMode('tomorrow')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'tomorrow'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleSelectViewMode('week')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Action Controls: Up Next, Search, Filter, Live Refresh */}
        <div className="flex items-center gap-2">
          {nextEvent && (
            <button
              type="button"
              onClick={scrollToNextEvent}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-all shadow-sm active:scale-95"
              title="Jump to next upcoming release"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Up Next
            </button>
          )}

          {/* Search Input */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event / ccy..."
              className="w-32 sm:w-44 pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#27272b] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Popover Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filterDropdownOpen
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-[#27272b] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal size={13} />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* Filter Dropdown Menu */}
            {filterDropdownOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl bg-white dark:bg-[#222226] border border-slate-200 dark:border-white/10 shadow-2xl z-50 text-xs flex flex-col gap-3"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-white/10">
                  <span className="font-bold text-slate-900 dark:text-white">Impact Level</span>
                  <button
                    type="button"
                    onClick={() => setFilterDropdownOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['High', 'Medium', 'Low', 'Holiday'].map((lvl) => (
                    <label
                      key={lvl}
                      className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <input
                        type="checkbox"
                        checked={impactFilters[lvl]}
                        onChange={(e) => setImpactFilters((prev) => ({ ...prev, [lvl]: e.target.checked }))}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{lvl}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() =>
                      setImpactFilters({ High: true, Medium: true, Low: true, Holiday: false })
                    }
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterDropdownOpen(false)}
                    className="px-3 py-1 rounded bg-blue-600 text-white font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Refresh Button */}
          <button
            type="button"
            onClick={() => fetchEvents(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#27272b] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm disabled:opacity-50"
            title="Refresh latest economic data from ForexFactory"
          >
            <RotateCw size={13} className={refreshing ? 'animate-spin text-blue-500' : ''} />
            <span className="hidden md:inline">{refreshing ? 'Fetching...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ── CURRENCY PILLS STRIP ── */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-[#1a1a1c] overflow-x-auto amazing-scrollbar shrink-0 text-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0">
          Currencies:
        </span>
        {CURRENCIES.map((cur) => {
          const active = selectedCurrency === cur;
          return (
            <button
              key={cur}
              type="button"
              onClick={() => setSelectedCurrency(cur)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all shrink-0 ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#252528] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-white/5'
              }`}
            >
              {cur}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
          {lastRefreshed && <span>Sync: {lastRefreshed}</span>}
          <span>{filteredEvents.length} events</span>
        </div>
      </div>

      {/* ── TABLE HEADER ── */}
      <div className="grid grid-cols-[68px_74px_62px_62px_1fr_64px_64px_64px_38px] items-center px-3 py-2 bg-slate-100/90 dark:bg-[#232326] text-slate-600 dark:text-slate-400 text-[11px] font-bold border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 shrink-0">
        <div className="text-center">Date</div>
        <div className="text-center">Time</div>
        <div className="text-center">Cur</div>
        <div className="text-center">Impact</div>
        <div className="pl-3">Event Name</div>
        <div className="text-center">Actual</div>
        <div className="text-center">Forecast</div>
        <div className="text-center">Previous</div>
        <div className="text-center">Alert</div>
      </div>

      {/* ── TABLE BODY ── */}
      <div ref={tableContainerRef} className="flex flex-col flex-1 overflow-y-auto amazing-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-9 rounded-lg bg-slate-100 dark:bg-white/5 animate-pulse flex items-center px-4"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <CalendarIcon size={36} className="text-slate-300 dark:text-slate-600 mb-3" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No scheduled events found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              There are no releases matching your current filters for {currentDayLabel}. Try switching to 'This Week' or clearing filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCurrency('ALL');
                setSearchQuery('');
                setImpactFilters({ High: true, Medium: true, Low: true, Holiday: true });
                setViewMode('week');
              }}
              className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors"
            >
              View Full Week
            </button>
          </div>
        ) : (
          filteredEvents.map((row, idx) => {
            const evDate = new Date(row.event_time);
            const isRowNext = nextEvent?.id === row.id;
            const isBookmarked = bookmarkedIds.has(row.id);

            // Format time in 12-hour format
            const timeStr = evDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });

            // Date badge
            const dayStr = evDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            // Check actual vs forecast comparison
            const actualVal = parseFloat(row.actual?.replace(/[^0-9.-]/g, '') || '');
            const forecastVal = parseFloat(row.forecast?.replace(/[^0-9.-]/g, '') || '');
            const hasComparison = !isNaN(actualVal) && !isNaN(forecastVal);
            const isActualBetter = hasComparison && actualVal >= forecastVal;
            const isActualWorse = hasComparison && actualVal < forecastVal;

            return (
              <div
                key={row.id || idx}
                ref={isRowNext ? nextEventRef : null}
                className={`grid grid-cols-[68px_74px_62px_62px_1fr_64px_64px_64px_38px] items-center px-3 py-2.5 border-b border-slate-100 dark:border-white/5 text-[11px] transition-colors ${
                  isRowNext
                    ? 'bg-emerald-500/10 dark:bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/30'
                    : idx % 2 === 0
                    ? 'bg-transparent'
                    : 'bg-slate-50/50 dark:bg-white/[0.015]'
                } hover:bg-blue-50/40 dark:hover:bg-white/[0.04]`}
              >
                {/* Date */}
                <div className="text-center font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap leading-tight text-[10px]">
                  {dayStr.replace(/,.*$/, '')}
                  <span className="block text-[9.5px] font-normal text-slate-400">
                    {evDate.getDate()} {evDate.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                </div>

                {/* Time */}
                <div className="text-center font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
                  {isRowNext && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                  <span>{row.event_time.includes('T00:00') ? 'All Day' : timeStr}</span>
                </div>

                {/* Currency */}
                <div className="flex justify-center items-center">{getCurrencyBadge(row.currency)}</div>

                {/* Impact */}
                <div className="flex justify-center items-center">{getImpactBadge(row.impact)}</div>

                {/* Event Name */}
                <div className="pl-3 pr-2 flex items-center gap-2 min-w-0">
                  <span
                    className="font-bold text-slate-900 dark:text-slate-100 truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title={row.event_title}
                  >
                    {row.event_title}
                  </span>
                  {isRowNext && (
                    <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                      Next
                    </span>
                  )}
                </div>

                {/* Actual */}
                <div
                  className={`text-center font-black flex justify-center items-center ${
                    row.actual
                      ? isActualBetter
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isActualWorse
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-900 dark:text-white'
                      : 'text-slate-400 font-normal'
                  }`}
                >
                  {row.actual || '—'}
                </div>

                {/* Forecast */}
                <div className="text-center font-medium text-slate-600 dark:text-slate-400 flex justify-center items-center">
                  {row.forecast || '—'}
                </div>

                {/* Previous */}
                <div className="text-center font-medium text-slate-600 dark:text-slate-400 flex justify-center items-center">
                  {row.previous || '—'}
                </div>

                {/* Alert Notification Toggle */}
                <div className="flex justify-center items-center">
                  <button
                    type="button"
                    onClick={(e) => toggleBookmark(row.id, e)}
                    className={`p-1 rounded transition-colors ${
                      isBookmarked
                        ? 'text-amber-500 bg-amber-500/10'
                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-500'
                    }`}
                    title={isBookmarked ? 'Reminder enabled' : 'Set reminder alert'}
                  >
                    {isBookmarked ? <BellRing size={13} /> : <Bell size={13} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── FOOTER STATUS BAR ── */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-50 dark:bg-[#202023] border-t border-slate-200/80 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Live ForexFactory Feed Active</span>
          <span className="text-slate-400 hidden sm:inline">· Refreshes automatically daily</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSelectViewMode('week')}
            className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
          >
            Show All Events This Week
          </button>
        </div>
      </div>
    </div>
  );
}
