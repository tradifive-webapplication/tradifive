import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { triggerHaptic } from "@/utils/haptics";
import { 
  Home, Category, Document, ShieldDone, Activity, Setting, 
  Bookmark, TicketStar, 
  ChevronRight 
} from "react-iconly";
import { Sparkles, ArrowUp, X, MoreHorizontal, HelpCircle, Trophy, Lock } from "lucide-react";
import { toast } from "sonner";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null);

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
      isActive: (p: string) =>
        (p === "/" || p.startsWith("/home") || p.startsWith("/post/")) && !isMoreOpen,
      renderIcon: (active: boolean) => (
        <Home
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={20}
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
        <Category
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={20}
        />
      ),
    },
    {
      id: "journal",
      label: "Journal",
      path: "/journal",
      isActive: (p: string) => p.startsWith("/journal") && !isMoreOpen,
      renderIcon: (active: boolean) => (
        <Document
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={20}
        />
      ),
    },
    {
      id: "riskguard",
      label: "RiskGuard",
      path: "/risk-guard",
      isActive: (p: string) => p.startsWith("/risk-guard") && !isMoreOpen,
      renderIcon: (active: boolean) => (
        <ShieldDone
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={20}
        />
      ),
    },
    {
      id: "menu",
      label: "Menu",
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
    const trimmed = promptText.trim();
    if (trimmed) {
      navigate("/ai-coach", {
        state: {
          initialMessages: [
            { role: "user", content: trimmed, timestamp: new Date().toISOString() },
          ],
          initialIsThinking: true,
        },
      });
    } else {
      navigate("/ai-coach");
    }
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
        className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 md:hidden bg-[#F8F9FA]/95 dark:bg-[#121215]/95 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-full shadow-[0_6px_25px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] p-1.5 select-none"
      >
        <div className="flex items-center justify-between gap-1 w-full">
          {tabs.map((tab) => {
            const active = tab.isActive(location.pathname);
            const isHovered = hoveredTabId === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab)}
                onMouseEnter={() => setHoveredTabId(tab.id)}
                onMouseLeave={() => setHoveredTabId(null)}
                className="relative flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-full min-h-[48px] cursor-pointer select-none transition-all duration-150 ease-out hover:-translate-y-[1px] active:translate-y-[0.5px] active:scale-[0.98] touch-manipulation"
              >
                {/* Active Tactile Pill (rounded-full matching dock curves, white fill, inner bottom shadow, 1px ring, drop shadow) */}
                {active && (
                  <motion.div
                    layoutId="mobile-nav-active-pill"
                    className="absolute inset-0 rounded-full dark:bg-gradient-to-b dark:from-[#201E25] dark:to-[#323137] dark:shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_0_1px_#0D0D0D,inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-150"
                    style={{
                      background: isHovered ? "#F8F9FA" : "#FFFFFF",
                      boxShadow: isHovered
                        ? "0 3.5px 7px 0 rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.14), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.06), inset 0 1px 0 0 #FFFFFF"
                        : "0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.12), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.07), inset 0 1px 0 0 #FFFFFF",
                    }}
                    transition={{ type: "spring", stiffness: 550, damping: 34 }}
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
                        ? "font-bold text-slate-900 dark:text-white"
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
              transition={{ duration: 0.16, ease: "easeOut" }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/60 will-change-opacity"
            />

            {/* Sheet Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-h-[86vh] bg-[#F4F5F7] dark:bg-[#121215] border-t border-slate-200/80 dark:border-white/10 rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col will-change-transform transform-gpu"
            >
              {/* Sheet Drag Handle & Header */}
              <div className="pt-3 pb-2 px-5 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 shrink-0 relative bg-white/70 dark:bg-[#121215]/70 backdrop-blur-md">
                <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20 absolute left-1/2 -translate-x-1/2 top-2.5" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">More</h2>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-200/60 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white mt-1 active:scale-90 transition-transform cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Sheet Scrollable Body */}
              <div className="flex-1 overflow-y-auto amazing-scrollbar overscroll-contain p-4 space-y-3.5 pb-24 touch-pan-y">
                {/* 1. AI Coach Card (LiquidCoach Style with Figma Card 2 Shadow) */}
                <div className="bg-[#E8EDF2] dark:bg-[#1C1E24] rounded-[24px] p-4 space-y-3 figma-card-shadow">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
                      <Sparkles size={12} strokeWidth={2.4} />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">TradiFive AI</span>
                  </div>

                  <div>
                    <h3 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
                      Ask about your week
                    </h3>
                    <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                      TradiFive AI comes with your plan
                    </p>
                  </div>

                  <form onSubmit={handleSubmitAIPrompt} className="relative flex items-center">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ask anything"
                      className="w-full bg-[#DDE2EA] dark:bg-[#282A32] rounded-xl pl-3.5 pr-11 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-neutral-400 border border-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!aiPrompt.trim()}
                      className="absolute right-1.5 w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all shadow-xs cursor-pointer"
                      aria-label="Send prompt"
                    >
                      <ArrowUp size={13} strokeWidth={2.6} />
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
                        className="shrink-0 text-[11px] font-medium px-3.5 py-1.5 rounded-full bg-[#DCE1E9] dark:bg-[#2A2C35] hover:bg-slate-300/80 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-200 border-0 active:scale-95 transition-all cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Core TradiFive Pages (Figma Card 2 Diffused Shadow) */}
                <div className="bg-white dark:bg-[#1A1A1E] rounded-[24px] figma-card-shadow divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                  {/* TradiFive AI Coach Full Page */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/ai-coach")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <Sparkles size={18} />
                      </div>
                      <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                        TradiFive AI Coach
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500 text-[12.5px] font-normal">
                      <span>Full page</span>
                      <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                    </div>
                  </button>

                  {/* AutoTrade (Locked) */}
                  <button
                    type="button"
                    onClick={() => {
                      toast.info("AutoTrade is locked for maintenance & upgrades.", {
                        description: "Our team is updating the trading engine. This feature will return shortly.",
                        icon: "🔒",
                      });
                    }}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <Activity set="curved" stroke="bold" primaryColor="currentColor" size={18} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white dark:bg-[#1C1C1F] border border-slate-200 dark:border-white/15 text-slate-500 dark:text-zinc-400 flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                          <Lock size={9} className="stroke-[2.5]" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                            AutoTrade
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-zinc-400 text-[9px] font-semibold">
                            Locked
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 dark:text-neutral-500">
                          Maintenance & upgrades
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500 text-[11px] font-medium">
                      <Lock size={12} />
                      <span>Locked</span>
                    </div>
                  </button>

                  {/* Rewards */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/rewards")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <Trophy size={18} className="text-slate-700 dark:text-neutral-300 stroke-[2.2]" />
                      </div>
                      <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                        Rewards
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500 text-[12.5px] font-normal">
                      <span>XP & perks</span>
                      <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                    </div>
                  </button>

                  {/* Saved Posts */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/home?tab=saved")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <Bookmark set="curved" stroke="bold" primaryColor="currentColor" size={18} />
                      </div>
                      <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                        Saved Posts
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500 text-[12.5px] font-normal">
                      <span>Pinned feeds</span>
                      <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                    </div>
                  </button>

                  {/* Refer & Earn */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/referrals")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <TicketStar set="curved" stroke="bold" primaryColor="currentColor" size={18} />
                      </div>
                      <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                        Refer & Earn
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500 text-[12.5px] font-normal">
                      <span>Invite & earn</span>
                      <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                    </div>
                  </button>
                </div>

                {/* 3. SYSTEM & PREFERENCES Section (Figma Card 2 Diffused Shadow) */}
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 px-1 pt-1">
                  SYSTEM & PREFERENCES
                </p>

                <div className="bg-white dark:bg-[#1A1A1E] rounded-[24px] figma-card-shadow divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/settings")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <Setting set="curved" stroke="bold" primaryColor="currentColor" size={18} />
                      </div>
                      <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                        Settings
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500 text-[12.5px] font-normal">
                      <span>Preferences</span>
                      <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                    </div>
                  </button>

                  {/* Help & Support */}
                  <button
                    type="button"
                    onClick={() => handleNavigate("/support")}
                    className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.08] text-slate-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                        <HelpCircle size={18} />
                      </div>
                      <span className="text-[13.5px] font-semibold text-slate-900 dark:text-white">
                        Help & Support
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-neutral-500 text-[12.5px] font-normal">
                      <span>24/7 Desk</span>
                      <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
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
