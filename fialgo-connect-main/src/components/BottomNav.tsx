import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { 
  Home, Activity, LayoutGrid, User, MoreHorizontal,
  Sparkles, ArrowUp, X, ChevronRight, BookOpen, Building2, ShieldCheck, 
  Cpu, ReceiptText, Trophy, ShoppingBag, Gift, Layers, FileText, Settings, 
  HelpCircle
} from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const isAutoTradeSetup =
    typeof window !== "undefined" &&
    localStorage.getItem("tradifive_auto_trade_setup") === "true";
  const autoTradePath = isAutoTradeSetup
    ? "/auto-trade/dashboard"
    : "/auto-trade/setup";

  const tabs = [
    {
      id: "home",
      label: "Home",
      path: "/home",
      isActive: (p: string) => (p === "/" || p.startsWith("/home")) && !isMoreOpen,
      renderIcon: (active: boolean) => (
        <Home
          size={20}
          strokeWidth={active ? 2.2 : 1.8}
        />
      ),
    },
    {
      id: "autotrade",
      label: "AutoTrade",
      path: autoTradePath,
      isActive: (p: string) =>
        (p.startsWith("/auto-trade") ||
        p.startsWith("/strategy") ||
        p.startsWith("/my-robots") ||
        p.startsWith("/weekly-settlements") ||
        p.startsWith("/settlements")) && !isMoreOpen,
      renderIcon: (active: boolean) => (
        <Activity
          size={20}
          strokeWidth={active ? 2.2 : 1.8}
        />
      ),
    },
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/dashboard",
      isActive: (p: string) =>
        (p.startsWith("/dashboard") ||
        p.startsWith("/portfolio") ||
        p.startsWith("/broker-connect")) && !isMoreOpen,
      renderIcon: (active: boolean) => (
        <LayoutGrid
          size={20}
          strokeWidth={active ? 2.2 : 1.8}
        />
      ),
    },
    {
      id: "profile",
      label: "Profile",
      path: "/profile",
      isActive: (p: string) =>
        (p.startsWith("/profile") || p.startsWith("/settings")) && !isMoreOpen,
      renderIcon: (active: boolean) => (
        <User
          size={20}
          strokeWidth={active ? 2.2 : 1.8}
        />
      ),
    },
    {
      id: "more",
      label: "More",
      path: "#more",
      isMore: true,
      isActive: () => isMoreOpen,
      renderIcon: (active: boolean) => (
        <MoreHorizontal
          size={20}
          strokeWidth={active ? 2.4 : 1.8}
        />
      ),
    },
  ];

  const handleTabClick = (tab: any) => {
    triggerHaptic("selection");
    if (tab.isMore) {
      setIsMoreOpen(prev => !prev);
      return;
    }
    setIsMoreOpen(false);
    navigate(tab.path);
  };

  const handleAskAI = (promptText: string) => {
    triggerHaptic("selection");
    setIsMoreOpen(false);
    window.dispatchEvent(
      new CustomEvent("open-floating-ai-coach", {
        detail: { text: promptText, autoSend: !!promptText.trim() },
      })
    );
  };

  const handleSubmitAIPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const q = aiPrompt.trim();
    setAiPrompt("");
    handleAskAI(q);
  };

  const handleNavigate = (path: string) => {
    triggerHaptic("selection");
    setIsMoreOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* ── Modern Floating Pill Bottom Navigation Dock (Matching Reference Image) ── */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-3.5 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 md:hidden bg-[#F2F4F7]/95 dark:bg-[#131417]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-1 select-none"
      >
        <div className="flex items-center justify-between gap-1 w-full">
          {tabs.map((tab) => {
            const active = tab.isActive(location.pathname);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                className="relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-full cursor-pointer select-none active:scale-95 transition-transform"
              >
                {/* Active White Stadium Pill (Encloses both icon and label) */}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active-pill"
                    className="absolute inset-0 rounded-full bg-white dark:bg-[#202024] border border-slate-200/90 dark:border-white/12 shadow-[0_1px_4px_rgba(0,0,0,0.07)] dark:shadow-none"
                    transition={{ type: "spring", stiffness: 480, damping: 36 }}
                  />
                )}

                <div
                  className={`relative z-10 flex flex-col items-center justify-center transition-colors duration-150 ${
                    active
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-center h-5">
                    {tab.renderIcon(active)}
                  </div>

                  <span
                    className={`text-[10px] sm:text-[10.5px] mt-0.5 tracking-tight leading-none font-sans ${
                      active
                        ? "font-semibold text-slate-900 dark:text-white"
                        : "font-normal text-slate-500 dark:text-zinc-400"
                    }`}
                  >
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── More Bottom Sheet (Matching Reference Picture 2) ── */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed inset-0 z-[100] md:hidden flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Sheet Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="relative z-10 w-full max-h-[86vh] bg-[#f8fafc] dark:bg-[#121215] border-t border-slate-200/80 dark:border-white/10 rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Sheet Drag Handle & Header */}
              <div className="pt-3 pb-2 px-5 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 shrink-0 relative">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 absolute left-1/2 -translate-x-1/2 top-2.5" />
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">More</h2>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200/70 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white mt-1 active:scale-90 transition-transform cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Sheet Scrollable Body */}
              <div className="flex-1 overflow-y-auto amazing-scrollbar p-4 space-y-4 pb-24">
                {/* 1. AI Coach Card (LiquidCoach Style from Reference Image 2) */}
                <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl p-4 border border-slate-200/70 dark:border-white/10 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Sparkles size={14} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">TradiFive AI Coach</span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Ask about your week</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">TradiFive AI Coach analyzes your trading psychology</p>
                  </div>

                  <form onSubmit={handleSubmitAIPrompt} className="relative flex items-center">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask anything"
                      className="w-full bg-slate-100/80 dark:bg-[#252529] rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 border border-slate-200/50 dark:border-white/5 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!aiPrompt.trim()}
                      className="absolute right-1.5 w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <ArrowUp size={14} strokeWidth={2.5} />
                    </button>
                  </form>

                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
                    {[
                      "Grade my psychology this week",
                      "Am I revenge trading?",
                      "Review my risk exposure"
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleAskAI(chip)}
                        className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#252529] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 border border-slate-200/60 dark:border-white/5 active:scale-95 transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Core Trading List (Group 1) */}
                <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleAskAI("")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">AI Coach</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Full view</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/broker-connect")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <Building2 size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Prop firms & Brokers</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Add an account</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/journal")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Study & Journal</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Log a trade</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/strategy-builder")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                        <Cpu size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Strategy Builder</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Add a setup</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/risk-guard")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">RiskGuard</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Discipline shield</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/weekly-settlements")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                        <ReceiptText size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Profit Settlements</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Settlements hub</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/competitions")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                        <Trophy size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Showcase & Competitions</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Leaderboard</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/store")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                        <ShoppingBag size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Creator Store</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Tools & bots</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/referrals")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center shrink-0">
                        <Gift size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Gift a plan</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Rewards</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>
                </div>

                {/* 3. TODAY Section (Matching Reference Image 2) */}
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-neutral-500 px-1 pt-1">
                  TODAY
                </p>

                <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl border border-slate-200/70 dark:border-white/10 shadow-xs divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleNavigate("/dashboard")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <Layers size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Desk</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Terminal</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/auto-trade/history")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Today's plan</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>Audit log</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/settings")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <Settings size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Settings</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <ChevronRight size={14} />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavigate("/support")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <HelpCircle size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Help & Support</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-neutral-500 text-xs font-medium">
                      <span>24/7 Desk</span>
                      <ChevronRight size={14} />
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
