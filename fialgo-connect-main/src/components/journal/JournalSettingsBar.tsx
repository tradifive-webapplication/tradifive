import { useState, useRef, useEffect } from "react";
import { ChevronDown, Eye, EyeOff, Percent, DollarSign } from "lucide-react";
import { useJournalSettings, CURRENCIES, CurrencyCode } from "@/contexts/JournalSettingsContext";
import { useTrading } from "@/contexts/TradingContext";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";

export default function JournalSettingsBar() {
  const { isStarter } = usePlan();
  const {
    currency,
    setCurrency,
    hideBalance,
    setHideBalance,
    hideOnlyBalance,
    setHideOnlyBalance,
    percentageOnly,
    setPercentageOnly,
  } = useJournalSettings();

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center gap-3 flex-wrap">

      {/* Currency Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setCurrencyOpen(v => !v)}
          className={`inline-flex items-center gap-2 h-[44px] px-4 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 ${
            currencyOpen
              ? "border-white dark:border-white/5 bg-gradient-to-b from-[#E8E8EC] to-[#F4F4F4] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:shadow-none text-slate-900 dark:text-white"
              : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-700 dark:text-slate-300 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
          }`}
        >
          <span className="tabular-nums">{currency.code}</span>
          <span className="text-slate-400 dark:text-slate-400 font-medium">{currency.symbol}</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${currencyOpen ? "rotate-180" : ""}`} />
        </button>

        {currencyOpen && (
          <div className="absolute top-full left-0 mt-2 w-[220px] bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/30 z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => { setCurrency(c.code as CurrencyCode); setCurrencyOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                  currency.code === c.code
                    ? "bg-slate-50 dark:bg-white/5"
                    : "hover:bg-slate-50/60 dark:hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-bold text-slate-900 dark:text-white">{c.code}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 ml-2 font-medium">{c.name}</span>
                </div>
                <span className="text-[12px] font-bold text-slate-400 dark:text-slate-400 tabular-nums">{c.symbol}</span>
                {currency.code === c.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hide Balance Toggle */}
      <button
        onClick={() => {
          if (isStarter) {
            toast.error("Premium Feature", { description: "Upgrade to Pro to use privacy features." });
            return;
          }
          setHideBalance(!hideBalance);
        }}
        className={`inline-flex items-center gap-1.5 h-[44px] px-4 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 ${
          hideBalance
            ? "border-white dark:border-white/5 bg-gradient-to-b from-[#FEF3C7] to-[#FFFBEB] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#F59E0B40] dark:shadow-none text-amber-700 dark:text-amber-400"
            : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
        } ${isStarter ? 'opacity-60' : ''}`}
      >
        {isStarter && <div className="text-blue-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>}
        {hideBalance ? <EyeOff size={14} /> : <Eye size={14} />}
        <span>{hideBalance ? "Hidden" : "Hide Balance"}</span>
      </button>

      {/* Hide Only Balance Toggle */}
      <button
        onClick={() => {
          if (isStarter) {
            toast.error("Premium Feature", { description: "Upgrade to Pro to use privacy features." });
            return;
          }
          setHideOnlyBalance(!hideOnlyBalance);
        }}
        className={`inline-flex items-center gap-1.5 h-[44px] px-4 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 ${
          hideOnlyBalance
            ? "border-white dark:border-white/5 bg-gradient-to-b from-[#F3F0FF] to-[#FAF8FF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#A78BFA40] dark:shadow-none text-violet-600 dark:text-violet-400"
            : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
        } ${isStarter ? 'opacity-60' : ''}`}
      >
        {isStarter && <div className="text-blue-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>}
        {hideOnlyBalance ? <EyeOff size={14} /> : <Eye size={14} />}
        <span>{hideOnlyBalance ? "Hidden Balance" : "Hide Only Balance"}</span>
      </button>

      {/* Percentage Only Toggle */}
      <button
        onClick={() => {
          if (isStarter) {
            toast.error("Premium Feature", { description: "Upgrade to Pro to use privacy features." });
            return;
          }
          setPercentageOnly(!percentageOnly);
        }}
        className={`inline-flex items-center gap-1.5 h-[44px] px-4 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 ${
          percentageOnly
            ? "border-white dark:border-white/5 bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-none text-indigo-700 dark:text-indigo-400"
            : "border-white dark:border-white/5 bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
        } ${isStarter ? 'opacity-60' : ''}`}
      >
        {isStarter && <div className="text-blue-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>}
        <Percent size={14} />
        <span>{percentageOnly ? "Only" : "Show %"}</span>
      </button>

    </div>
  );
}
