import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Share,
  RefreshCw,
  Check,
  Lock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { usePlan } from "@/hooks/usePlan";
import { MagicTextReveal } from "@/components/ui/magic-text-reveal";

export interface NewsCalendarEvent {
  id: string;
  event_title: string;
  currency: string;
  event_time: string;
  impact: "High" | "Medium" | "Low" | "Holiday" | string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

const MAJOR_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "NZD"] as const;
const DEFAULT_CURRENCIES = ["USD", "EUR", "GBP", "JPY"];
const DEFAULT_IMPACTS = ["High", "Medium"];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getEventTradingDateKey(iso: string): string {
  // Forex Factory timestamps carry the trading-day date prefix (e.g. "2026-11-18T14:00:00-05:00")
  if (typeof iso === "string" && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
    return iso.slice(0, 10);
  }
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : toDateKey(d);
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

function formatEventTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDayHeader(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getImpactStyle(impact: string) {
  const norm = (impact || "").toLowerCase();
  if (norm === "high") {
    return {
      dot: "bg-rose-600 dark:bg-rose-500",
      label: "High",
    };
  }
  if (norm === "medium") {
    return {
      dot: "bg-amber-500",
      label: "Medium",
    };
  }
  return {
    dot: "bg-slate-400",
    label: "Low",
  };
}

function normalizeFeedArray(data: any[]): NewsCalendarEvent[] {
  return data
    .filter((item) => item && (item.title || item.event_title) && (item.date || item.event_time))
    .map((item: any, i: number) => ({
      id: `${item.country || item.currency || "GL"}-${(item.title || item.event_title || "").replace(/\s+/g, "_")}-${item.date || item.event_time || i}`,
      event_title: item.title || item.event_title || "Economic Event",
      currency: String(item.country || item.currency || "USD").toUpperCase(),
      event_time: item.date || item.event_time,
      impact: item.impact || "Low",
      forecast: item.forecast || "",
      previous: item.previous || "",
      actual: item.actual || "",
    }))
    .sort(
      (a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime()
    );
}

function isCacheFreshForThisWeek(items: NewsCalendarEvent[]): boolean {
  if (!items.length) return false;
  const now = new Date();
  const sixDaysMs = 6 * 24 * 60 * 60 * 1000;
  return items.some((ev) => {
    const t = new Date(ev.event_time).getTime();
    return !isNaN(t) && Math.abs(t - now.getTime()) <= sixDaysMs;
  });
}

export interface DashboardNewsCardProps {
  compact?: boolean;
  externalViewMode?: "day" | "week";
  onExternalViewModeChange?: (mode: "day" | "week") => void;
  externalImpacts?: string[];
  onExternalImpactsChange?: (impacts: string[]) => void;
}

export const DashboardNewsCard: React.FC<DashboardNewsCardProps> = ({
  compact = false,
  externalViewMode,
  onExternalViewModeChange,
  externalImpacts,
  onExternalImpactsChange,
}) => {
  const { isStarter } = usePlan();
  const navigate = useNavigate();
  const [events, setEvents] = useState<NewsCalendarEvent[]>(() => {
    try {
      const cached = localStorage.getItem("tf_calendar_cache_v2");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && isCacheFreshForThisWeek(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Ignore cache read errors
    }
    return [];
  });

  const [loading, setLoading] = useState(events.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [internalSelectedImpacts, setInternalSelectedImpacts] = useState<string[]>(DEFAULT_IMPACTS);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(DEFAULT_CURRENCIES);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const viewMode = externalViewMode ?? internalViewMode;
  const setViewMode = (mode: "day" | "week") => {
    setInternalViewMode(mode);
    onExternalViewModeChange?.(mode);
  };

  const selectedImpacts = externalImpacts ?? internalSelectedImpacts;

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const fetchEvents = async (manual = false) => {
    if (manual) setRefreshing(true);
    else if (events.length === 0) setLoading(true);

    let fetched: NewsCalendarEvent[] = [];

    // Try live Forex Factory sources in order
    const endpoints = [
      "/api/economic-calendar",
      "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
      "https://www.tradifive.in/api/economic-calendar",
    ];

    for (const url of endpoints) {
      if (fetched.length > 0) break;
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) continue;
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("json") && !url.endsWith(".json")) continue;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          fetched = normalizeFeedArray(data);
        }
      } catch {
        // Try next source
      }
    }

    // Fallback to Supabase economic_calendar table
    if (fetched.length === 0) {
      try {
        const { data } = await supabase
          .from("economic_calendar")
          .select("*")
          .order("event_time", { ascending: true });
        if (data && data.length > 0) {
          fetched = normalizeFeedArray(data);
        }
      } catch {
        // Ignore fallback failure
      }
    }

    if (fetched.length > 0) {
      setEvents(fetched);
      try {
        localStorage.setItem("tf_calendar_cache_v2", JSON.stringify(fetched));
        localStorage.setItem("tf_calendar_last_fetch", new Date().toISOString());
      } catch {
        // Ignore storage errors
      }
      if (manual) toast.success(`Updated with ${fetched.length} live events`);
    } else if (manual) {
      toast.error("Could not fetch live Forex Factory feed right now");
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents(false);
  }, []);

  const today = useMemo(() => new Date(), []);
  const isTodaySelected = isSameCalendarDay(selectedDate, today);
  const selectedKey = toDateKey(selectedDate);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const impactMatch =
        selectedImpacts.length === 0 ||
        selectedImpacts.some(
          (imp) => imp.toLowerCase() === (ev.impact || "").toLowerCase()
        );
      const currencyMatch =
        selectedCurrencies.length === 0 ||
        selectedCurrencies.includes((ev.currency || "").toUpperCase());

      if (!impactMatch || !currencyMatch) return false;

      if (viewMode === "day") {
        return getEventTradingDateKey(ev.event_time) === selectedKey;
      }
      return true;
    });
  }, [events, selectedImpacts, selectedCurrencies, viewMode, selectedKey]);

  const groupedByDay = useMemo(() => {
    if (viewMode !== "week") return null;
    const map = new Map<string, { label: string; items: NewsCalendarEvent[] }>();
    filteredEvents.forEach((ev) => {
      const key = getEventTradingDateKey(ev.event_time);
      if (!key) return;
      if (!map.has(key)) {
        const [y, m, d] = key.split("-").map(Number);
        const dt = new Date(y, (m || 1) - 1, d || 1);
        map.set(key, { label: formatDayHeader(dt), items: [] });
      }
      map.get(key)!.items.push(ev);
    });
    return Array.from(map.values());
  }, [filteredEvents, viewMode]);

  const stepDay = (delta: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + delta);
      return next;
    });
  };

  const toggleImpact = (imp: string) => {
    const next = selectedImpacts.includes(imp)
      ? selectedImpacts.filter((x) => x !== imp)
      : [...selectedImpacts, imp];
    setInternalSelectedImpacts(next);
    onExternalImpactsChange?.(next);
  };

  const toggleCurrency = (cur: string) => {
    setSelectedCurrencies((prev) =>
      prev.includes(cur) ? prev.filter((x) => x !== cur) : [...prev, cur]
    );
  };

  const handleShareNews = async () => {
    const header =
      viewMode === "day"
        ? `TradiFive Economic News — ${formatDayHeader(selectedDate)}`
        : "TradiFive Economic News — This Week";
    const lines =
      filteredEvents.length > 0
        ? filteredEvents
            .slice(0, 12)
            .map(
              (ev) =>
                `• ${formatEventTime(ev.event_time)} [${ev.currency}] ${ev.event_title} (${ev.impact})`
            )
            .join("\n")
        : "No major scheduled events for the selected filters.";

    const text = `${header}\n${lines}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: header, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("News schedule copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("News schedule copied");
      } catch {
        toast.error("Unable to copy schedule");
      }
    }
  };

  const activeFilterCount =
    (selectedImpacts.length !== DEFAULT_IMPACTS.length ||
      !DEFAULT_IMPACTS.every((i) => selectedImpacts.includes(i))
      ? 1
      : 0) +
    (selectedCurrencies.length !== DEFAULT_CURRENCIES.length ||
      !DEFAULT_CURRENCIES.every((c) => selectedCurrencies.includes(c))
      ? 1
      : 0);

  return (
    <section
      className={`relative overflow-hidden ${
        compact
          ? "bg-white dark:bg-[#17171A] rounded-[22px] p-4 shadow-[0_2px_14px_rgba(15,23,42,0.045)] dark:shadow-none border border-slate-200/80 dark:border-white/[0.08]"
          : "bg-white dark:bg-[#17171A] rounded-[16px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-10px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-200/80 dark:border-white/[0.07]"
      }`}
    >
      <div className={`flex flex-col flex-1 min-h-0 ${isStarter ? "blur-[2px] select-none pointer-events-none opacity-75" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <h2 className={`${compact ? "text-[14px] font-bold" : "text-[13px] font-semibold"} text-slate-900 dark:text-white tracking-tight shrink-0`}>
            News
          </h2>
          <span className={`${compact ? "text-[11px]" : "text-[12px]"} text-slate-400 dark:text-neutral-500 truncate`}>
            Forex Factory · this week
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* Filters */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => {
                if (isStarter) {
                  toast.info("Pro Feature · News Filters", {
                    description: "Upgrade to Pro to filter economic events by impact and currency.",
                    action: { label: "Upgrade", onClick: () => navigate("/upgrade") },
                  });
                  return;
                }
                setFiltersOpen((o) => !o);
              }}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11.5px] font-medium transition-colors cursor-pointer ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.05]"
              }`}
            >
              <SlidersHorizontal size={12} strokeWidth={2} />
              <span>Filter</span>
              {activeFilterCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>

            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-full mt-1.5 w-[250px] rounded-2xl bg-white dark:bg-[#1E1E22] border border-slate-200/80 dark:border-white/10 shadow-[0_14px_34px_rgba(15,23,42,0.14)] p-3.5 z-30 space-y-3"
                >
                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Impact
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["High", "Medium", "Low"].map((imp) => {
                        const active = selectedImpacts.includes(imp);
                        const st = getImpactStyle(imp);
                        return (
                          <button
                            key={imp}
                            type="button"
                            onClick={() => toggleImpact(imp)}
                            className={`px-2.5 py-1 rounded-full text-[11.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                              active
                                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white"
                                : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-neutral-300 border-slate-200 dark:border-white/10"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {imp}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Currencies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {MAJOR_CURRENCIES.map((cur) => {
                        const active = selectedCurrencies.includes(cur);
                        return (
                          <button
                            key={cur}
                            type="button"
                            onClick={() => toggleCurrency(cur)}
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer border ${
                              active
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-neutral-300 border-slate-200 dark:border-white/10"
                            }`}
                          >
                            {cur}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleShareNews}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Share schedule"
            aria-label="Share schedule"
          >
            <Share size={12.5} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => fetchEvents(true)}
            disabled={refreshing}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh live news"
            aria-label="Refresh live news"
          >
            <RefreshCw
              size={12.5}
              strokeWidth={2}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Mode Switcher + Day Stepper Row & Events */}
      <div className="flex flex-col min-h-[200px]">
        <div className={`flex items-center justify-between gap-1.5 ${compact ? "mb-2.5 flex-wrap" : "mb-3.5"}`}>
        <div className="inline-flex items-center p-0.5 rounded-[11px] bg-slate-100/90 dark:bg-white/[0.06]">
          {(["day", "week"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`relative ${compact ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]"} rounded-[9px] font-semibold transition-colors cursor-pointer ${
                viewMode === mode
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {viewMode === mode && (
                <motion.span
                  layoutId={compact ? "home-news-mode-pill" : "news-mode-pill"}
                  transition={{ type: "spring", stiffness: 460, damping: 34 }}
                  className="absolute inset-0 bg-white dark:bg-[#26262B] rounded-[9px] shadow-[0_1px_4px_rgba(15,23,42,0.09)]"
                />
              )}
              <span className="relative z-10 capitalize">{mode}</span>
            </button>
          ))}
        </div>

        {viewMode === "day" && (
          <div className={`flex items-center ${compact ? "gap-1" : "gap-1.5"}`}>
            <button
              type="button"
              onClick={() => stepDay(-1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft size={compact ? 13 : 14} strokeWidth={2.2} />
            </button>

            <div className="flex items-baseline gap-1">
              <span className={`${compact ? "text-[11.5px]" : "text-[13px]"} font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap`}>
                {formatDayHeader(selectedDate)}
              </span>
              {isTodaySelected ? (
                <span className={`${compact ? "text-[10.5px]" : "text-[11px]"} font-semibold text-blue-600 dark:text-blue-400`}>
                  Today
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date())}
                  className={`${compact ? "text-[10.5px]" : "text-[11px]"} font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer`}
                >
                  Today
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => stepDay(1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Next day"
            >
              <ChevronRight size={compact ? 13 : 14} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-7 rounded-lg bg-slate-100/80 dark:bg-white/[0.04] animate-pulse"
            />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[12.5px] font-medium text-slate-500 dark:text-neutral-400">
            No matching events{viewMode === "day" ? ` for ${formatDayHeader(selectedDate)}` : " this week"}.
          </p>
          {viewMode === "day" && events.length > 0 && (
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className="mt-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              See full week →
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${selectedKey}-${selectedImpacts.join(",")}-${selectedCurrencies.join(",")}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {viewMode === "day" ? (
              <div className={`divide-y divide-slate-100/80 dark:divide-white/[0.04] ${compact ? "max-h-[260px] overflow-y-auto amazing-scrollbar pr-0.5" : ""}`}>
                {filteredEvents.map((ev) => {
                  const st = getImpactStyle(ev.impact);
                  if (compact) {
                    return (
                      <div key={ev.id} className="py-2 group">
                        <div className="grid grid-cols-[52px_10px_32px_1fr] items-center gap-1.5 text-[12px]">
                          <span className="font-mono text-[10.5px] font-semibold text-slate-500 dark:text-neutral-400 tabular-nums whitespace-nowrap">
                            {formatEventTime(ev.event_time)}
                          </span>
                          <span className="flex items-center justify-center" title={`${ev.impact} Impact`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          </span>
                          <span className="text-[9.5px] font-bold px-1 py-0.5 rounded-md bg-slate-100/90 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 text-center leading-none">
                            {ev.currency}
                          </span>
                          <span title={ev.event_title} className="font-medium text-slate-800 dark:text-slate-100 truncate">
                            {ev.event_title}
                          </span>
                        </div>
                        {(ev.forecast || ev.previous) && (
                          <div className="pl-[108px] mt-0.5 flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-neutral-500 tabular-nums">
                            {ev.forecast && <span>F:{ev.forecast}</span>}
                            {ev.previous && <span>P:{ev.previous}</span>}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={ev.id}
                      className="grid grid-cols-[64px_12px_36px_1fr] items-center gap-2 py-2 text-[12.5px] group"
                    >
                      <span className="font-mono text-[11.5px] font-semibold text-slate-500 dark:text-neutral-400 tabular-nums">
                        {formatEventTime(ev.event_time)}
                      </span>
                      <span className="flex items-center justify-center" title={`${ev.impact} Impact`}>
                        <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      </span>
                      <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100/90 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 text-center">
                        {ev.currency}
                      </span>
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="font-medium text-slate-800 dark:text-slate-100 truncate">
                          {ev.event_title}
                        </span>
                        {(ev.forecast || ev.previous) && (
                          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10.5px] font-mono text-slate-400 dark:text-neutral-500 shrink-0">
                            {ev.forecast && <span>F:{ev.forecast}</span>}
                            {ev.previous && <span>P:{ev.previous}</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`space-y-3 ${compact ? "max-h-[260px]" : "max-h-[290px]"} overflow-y-auto amazing-scrollbar pr-1`}>
                {groupedByDay?.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-1.5">
                      {group.label}
                    </p>
                    <div className="space-y-1.5">
                      {group.items.map((ev) => {
                        const st = getImpactStyle(ev.impact);
                        return (
                          <div
                            key={ev.id}
                            className={`grid ${compact ? "grid-cols-[52px_10px_32px_1fr] gap-1.5 text-[11.5px]" : "grid-cols-[64px_12px_36px_1fr] gap-2 text-[12px]"} items-center py-1`}
                          >
                            <span className={`font-mono ${compact ? "text-[10.5px]" : "text-[11px]"} font-semibold text-slate-500 dark:text-neutral-400 tabular-nums whitespace-nowrap`}>
                              {formatEventTime(ev.event_time)}
                            </span>
                            <span className="flex items-center justify-center">
                              <span className={`${compact ? "w-1.5 h-1.5" : "w-2 h-2"} rounded-full ${st.dot}`} />
                            </span>
                            <span className={`${compact ? "text-[9.5px] px-1" : "text-[10px] px-1.5"} font-bold py-0.5 rounded-md bg-slate-100/90 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 text-center leading-none`}>
                              {ev.currency}
                            </span>
                            <span title={ev.event_title} className="text-slate-800 dark:text-slate-100 font-medium truncate">
                              {ev.event_title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-neutral-500">
        <Check size={11} strokeWidth={2.5} className="shrink-0" />
        <span className="truncate">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}{" "}
          {viewMode === "day" ? `across ${formatDayHeader(selectedDate)}` : "this week"}
          {selectedImpacts.length > 0 ? ` · ${selectedImpacts.join(", ")}` : ""}
          {selectedCurrencies.length > 0
            ? ` · ${selectedCurrencies.slice(0, 4).join(" ")}${selectedCurrencies.length > 4 ? " +" : ""}`
            : ""}
        </span>
      </div>
      </div>
      </div>

      {isStarter && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-auto">
          <div className="backdrop-blur-md bg-white/95 dark:bg-[#1A1A1E]/95 border border-slate-200/80 dark:border-white/15 px-3.5 py-2.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 max-w-[320px] w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                <Lock size={14} strokeWidth={2.4} />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <MagicTextReveal
                  text="Economic Calendar"
                  fontSize={13}
                  fontWeight={700}
                  className="leading-tight"
                />
                <p className="text-[10px] font-semibold text-slate-400 dark:text-neutral-400">
                  Pro &amp; Elite
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/upgrade")}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11.5px] font-bold shrink-0 shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default DashboardNewsCard;
