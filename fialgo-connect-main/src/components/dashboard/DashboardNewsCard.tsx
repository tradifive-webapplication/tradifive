import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Share,
  RefreshCw,
  Check,
  Radio,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
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
      badge: "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/25",
      label: "High",
    };
  }
  if (norm === "medium") {
    return {
      dot: "bg-amber-500",
      badge: "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25",
      label: "Med",
    };
  }
  return {
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-500 border-slate-200/70 dark:bg-white/10 dark:text-neutral-400 dark:border-white/10",
    label: "Low",
  };
}

export const DashboardNewsCard: React.FC = () => {
  const [events, setEvents] = useState<NewsCalendarEvent[]>(() => {
    try {
      const cached = localStorage.getItem("tf_calendar_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore cache error
    }
    return [];
  });

  const [loading, setLoading] = useState(events.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(DEFAULT_IMPACTS);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(DEFAULT_CURRENCIES);
  const filterRef = useRef<HTMLDivElement | null>(null);

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

    try {
      const res = await fetch("/api/economic-calendar", { cache: "no-cache" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          fetched = data.map((item: any, i: number) => ({
            id: `${item.country || "GL"}-${(item.title || "").replace(/\s+/g, "_")}-${item.date || i}`,
            event_title: item.title || "Economic Event",
            currency: (item.country || "USD").toUpperCase(),
            event_time: item.date,
            impact: item.impact || "Low",
            forecast: item.forecast || "",
            previous: item.previous || "",
            actual: item.actual || "",
          }));
        }
      }
    } catch {
      // Fallback below
    }

    if (fetched.length === 0) {
      try {
        const { data } = await supabase
          .from("economic_calendar")
          .select("*")
          .order("event_time", { ascending: true });
        if (data && data.length > 0) {
          fetched = data.map((row: any) => ({
            id: row.id,
            event_title: row.event_title || "Economic Event",
            currency: (row.currency || "USD").toUpperCase(),
            event_time: row.event_time || new Date().toISOString(),
            impact: row.impact || "Low",
            forecast: row.forecast || "",
            previous: row.previous || "",
            actual: row.actual || "",
          }));
        }
      } catch {
        // Ignore fallback failure
      }
    }

    if (fetched.length > 0) {
      fetched.sort(
        (a, b) => new Date(a.event_time).getTime() - new Date(b.event_time).getTime()
      );
      setEvents(fetched);
      try {
        localStorage.setItem("tf_calendar_cache", JSON.stringify(fetched));
        localStorage.setItem("tf_calendar_last_fetch", new Date().toISOString());
      } catch {
        // Ignore storage error
      }
      if (manual) toast.success("Market radar refreshed");
    } else if (manual) {
      toast.info("Calendar is up to date");
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEvents(false);
  }, []);

  const today = useMemo(() => new Date(), []);
  const isTodaySelected = isSameCalendarDay(selectedDate, today);

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
        const evDate = new Date(ev.event_time);
        if (isNaN(evDate.getTime())) return false;
        return isSameCalendarDay(evDate, selectedDate);
      }
      return true;
    });
  }, [events, selectedImpacts, selectedCurrencies, viewMode, selectedDate]);

  const groupedByDay = useMemo(() => {
    if (viewMode !== "week") return null;
    const map = new Map<string, { label: string; items: NewsCalendarEvent[] }>();
    filteredEvents.forEach((ev) => {
      const d = new Date(ev.event_time);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) {
        map.set(key, { label: formatDayHeader(d), items: [] });
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
    setSelectedImpacts((prev) =>
      prev.includes(imp) ? prev.filter((x) => x !== imp) : [...prev, imp]
    );
  };

  const toggleCurrency = (cur: string) => {
    setSelectedCurrencies((prev) =>
      prev.includes(cur) ? prev.filter((x) => x !== cur) : [...prev, cur]
    );
  };

  const handleShareNews = async () => {
    const header =
      viewMode === "day"
        ? `TradiFive Market Radar — ${formatDayHeader(selectedDate)}`
        : "TradiFive Market Radar — This Week";
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
        toast.success("Market calendar copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        toast.success("Market calendar copied");
      } catch {
        toast.error("Unable to copy calendar");
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
    <section className="bg-white dark:bg-[#17171A] rounded-[16px] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_20px_-10px_rgba(15,23,42,0.06)] dark:shadow-none border border-slate-200/80 dark:border-white/[0.07]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-semibold text-slate-900 dark:text-white tracking-tight">
            Market radar
          </h2>
          <span className="text-[12px] text-slate-400 dark:text-neutral-500">
            Forex Factory
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Filters */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
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
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw
              size={12.5}
              strokeWidth={2}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* Mode Switcher + Day Stepper Row */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="inline-flex items-center p-0.5 rounded-[11px] bg-slate-100/90 dark:bg-white/[0.06]">
          {(["day", "week"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`relative px-3 py-1 rounded-[9px] text-[12px] font-semibold transition-colors cursor-pointer ${
                viewMode === mode
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {viewMode === mode && (
                <motion.span
                  layoutId="news-mode-pill"
                  transition={{ type: "spring", stiffness: 460, damping: 34 }}
                  className="absolute inset-0 bg-white dark:bg-[#26262B] rounded-[9px] shadow-[0_1px_4px_rgba(15,23,42,0.09)]"
                />
              )}
              <span className="relative z-10 capitalize">{mode}</span>
            </button>
          ))}
        </div>

        {viewMode === "day" && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => stepDay(-1)}
              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Previous day"
            >
              <ChevronLeft size={14} strokeWidth={2.2} />
            </button>

            <div className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight">
                {formatDayHeader(selectedDate)}
              </span>
              {isTodaySelected ? (
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  Today
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedDate(new Date())}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
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
              <ChevronRight size={14} strokeWidth={2.2} />
            </button>
          </div>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="space-y-2 py-2">
          {[1, 2, 3].map((n) => (
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
            key={`${viewMode}-${selectedDate.toDateString()}-${selectedImpacts.join(",")}-${selectedCurrencies.join(",")}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            {viewMode === "day" ? (
              <div className="divide-y divide-slate-100/80 dark:divide-white/[0.04]">
                {filteredEvents.map((ev) => {
                  const st = getImpactStyle(ev.impact);
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
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10.5px] font-mono text-slate-400 dark:text-neutral-500 shrink-0">
                            {ev.forecast && <span>F:{ev.forecast}</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 max-h-[290px] overflow-y-auto amazing-scrollbar pr-1">
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
                            className="grid grid-cols-[64px_12px_36px_1fr] items-center gap-2 py-1 text-[12px]"
                          >
                            <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-neutral-400 tabular-nums">
                              {formatEventTime(ev.event_time)}
                            </span>
                            <span className="flex items-center justify-center">
                              <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100/90 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 text-center">
                              {ev.currency}
                            </span>
                            <span className="text-slate-800 dark:text-slate-100 font-medium truncate">
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
          {viewMode === "day" ? `on ${formatDayHeader(selectedDate)}` : "this week"}
          {selectedImpacts.length > 0 ? ` · ${selectedImpacts.join(", ")}` : ""}
          {selectedCurrencies.length > 0
            ? ` · ${selectedCurrencies.slice(0, 4).join(" ")}${selectedCurrencies.length > 4 ? " +" : ""}`
            : ""}
        </span>
      </div>
    </section>
  );
};

export default DashboardNewsCard;
