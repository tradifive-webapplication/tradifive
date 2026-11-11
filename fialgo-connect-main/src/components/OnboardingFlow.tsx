import React, { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, ChevronLeft, Loader2, ArrowRight, Sun, TrendingUp, Zap, Shield, 
  BarChart2, Sliders, Globe, Coins, MoreHorizontal, Target, Layers, Activity, 
  Scale, PenTool, Clock, Compass, Trophy, Ban, Briefcase, Sparkles, MessageCircle,
  CheckCircle2, X
} from "lucide-react";
import { toast } from "sonner";

interface OnboardingFlowProps {
  user: User;
  initialStep?: 'username' | 'market';
  onComplete: () => void;
}

type StepKey = 'NAME' | 'HANDLE' | 'STYLE' | 'MARKET' | 'EDGE' | 'HERE TO' | 'FOUND US' | 'ACCOUNT';

const STEPS_ORDER: StepKey[] = [
  'NAME',
  'HANDLE',
  'STYLE',
  'MARKET',
  'EDGE',
  'HERE TO',
  'FOUND US',
  'ACCOUNT'
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Form State
  const [name, setName] = useState(() => {
    return user.user_metadata?.full_name || user.user_metadata?.name || "";
  });
  const [handle, setHandle] = useState("");
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);

  const [style, setStyle] = useState<string>("");
  const [market, setMarket] = useState<string>("");
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [selectedHereTo, setSelectedHereTo] = useState<string[]>([]);
  const [foundUs, setFoundUs] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = STEPS_ORDER[currentStepIndex];

  // Auto-generate suggested handle if empty when name is typed
  useEffect(() => {
    if (!handle && name) {
      const suggested = name.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15);
      if (suggested.length >= 3) {
        setHandle(suggested);
        checkHandleAvailability(suggested);
      }
    }
  }, [name]);

  const checkHandleAvailability = async (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!clean) {
      setHandleAvailable(null);
      setHandleError(null);
      return;
    }

    if (clean.length < 3) {
      setHandleAvailable(false);
      setHandleError("Handle must be at least 3 characters.");
      return;
    }

    setIsCheckingHandle(true);
    setHandleError(null);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', clean)
        .maybeSingle();

      if (error) throw error;

      if (data && data.id !== user.id) {
        setHandleAvailable(false);
        setHandleError("This handle is already taken.");
      } else {
        setHandleAvailable(true);
        setHandleError(null);
      }
    } catch (err) {
      setHandleAvailable(null);
      setHandleError("Unable to verify handle.");
    } finally {
      setIsCheckingHandle(false);
    }
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setHandle(val);
    setHandleAvailable(null);
    setHandleError(null);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      checkHandleAvailability(val);
    }, 300);
  };

  const toggleMultiSelect = (item: string, currentList: string[], setList: (val: string[]) => void) => {
    if (currentList.includes(item)) {
      setList(currentList.filter(x => x !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS_ORDER.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleFinalSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const finalUsername = handle || `trader_${user.id.slice(0, 6)}`;
      const finalName = name.trim() || user.email?.split('@')[0] || "Trader";

      // 1. Update Supabase profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: finalName,
          display_name: finalName,
          username: finalUsername,
          trading_style: style || "Day trading",
          preferred_market: market ? market.toLowerCase() : "forex",
          has_chosen_username: true,
        })
        .eq('id', user.id);

      if (profileError) {
        console.warn("Profile update note:", profileError);
      }

      // 2. Update user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: finalName,
          display_name: finalName,
          username: finalUsername,
          trading_style: style || "Day trading",
          preferred_market: market || "Forex",
          onboarding_completed: true,
          edge: selectedEdges,
          here_to: selectedHereTo,
          found_us: foundUs
        }
      }).catch(() => {});

      // 3. Local sync & events
      localStorage.setItem("tradifive_cached_username", finalUsername);
      localStorage.setItem("tradifive_cached_display_name", finalName);
      localStorage.setItem("tradifive_onboarding_completed", "true");
      window.dispatchEvent(new Event("tradifive_profile_update"));

      toast.success(`Welcome to TradiFive, @${finalUsername}!`);
      onComplete();
    } catch (err: any) {
      console.error("Error saving onboarding profile:", err);
      toast.error("Failed to save profile. Proceeding to dashboard.");
      onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if Continue button should be enabled on current step
  const isContinueEnabled = () => {
    switch (currentStep) {
      case 'NAME':
        return name.trim().length >= 2;
      case 'HANDLE':
        return handle.length >= 3 && handleAvailable === true;
      case 'STYLE':
        return style.length > 0;
      case 'MARKET':
        return market.length > 0;
      case 'EDGE':
        return selectedEdges.length > 0;
      case 'HERE TO':
        return selectedHereTo.length > 0;
      case 'FOUND US':
        return foundUs.length > 0;
      case 'ACCOUNT':
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#08080A] text-white flex flex-col overflow-y-auto selection:bg-blue-600/30">
      {/* ── TOP HEADER BAR ── */}
      <header className="w-full h-16 px-6 sm:px-10 flex items-center justify-between shrink-0 bg-[#08080A]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img 
            src="/tf-logo.png" 
            alt="TradiFive Icon" 
            className="w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] object-contain shrink-0" 
          />
          <img 
            src="/Dark mode logo with white.png" 
            alt="TradiFive" 
            className="h-[28px] sm:h-[33px] w-auto object-contain shrink-0" 
          />
        </div>

        <div className="flex items-center gap-5 text-xs">
          <span className="text-zinc-500 hidden sm:inline-block truncate max-w-[180px]">
            {user.email}
          </span>
          <button
            type="button"
            onClick={handleFinalSave}
            className="text-zinc-400 hover:text-white transition-colors font-medium px-2 py-1 rounded hover:bg-white/5"
          >
            Skip
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row px-8 sm:px-12 md:px-16 py-6 md:py-10 gap-10 md:gap-12 lg:gap-16">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-full md:w-60 shrink-0 flex flex-col pb-6 md:pb-0 md:pr-6 pt-6 md:pt-28 lg:pt-32">
          <div className="flex flex-row md:flex-col gap-0 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            {/* Dynamic Steps */}
            {STEPS_ORDER.map((s, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isPassed = idx < currentStepIndex;

              // Resolved value display
              let valDisplay = "";
              if (s === 'NAME') valDisplay = name;
              else if (s === 'HANDLE') valDisplay = handle ? `@${handle}` : "";
              else if (s === 'STYLE') valDisplay = style;
              else if (s === 'MARKET') valDisplay = market;
              else if (s === 'EDGE') valDisplay = selectedEdges.join(', ');
              else if (s === 'HERE TO') valDisplay = selectedHereTo.join(', ');
              else if (s === 'FOUND US') valDisplay = foundUs;
              else if (s === 'ACCOUNT') valDisplay = isPassed ? "Complete" : "";

              return (
                <div 
                  key={s} 
                  onClick={() => isPassed && setCurrentStepIndex(idx)}
                  className={`h-[58px] flex flex-col justify-center border-b border-white/[0.08] transition-all duration-200 ${isPassed ? 'cursor-pointer hover:opacity-80' : ''}`}
                >
                  <div className="flex items-center">
                    <span className={`text-[11px] font-sans font-bold tracking-[0.16em] uppercase transition-colors ${
                      isCurrent 
                        ? 'text-white' 
                        : isPassed 
                        ? 'text-zinc-300' 
                        : 'text-zinc-500'
                    }`}>
                      {s}
                    </span>
                  </div>

                  <div className="h-4 flex items-center mt-1">
                    {valDisplay ? (
                      <span className={`text-xs font-medium truncate max-w-[200px] ${
                        isCurrent ? 'text-white' : 'text-zinc-400'
                      }`}>
                        {valDisplay}
                      </span>
                    ) : isCurrent ? (
                      <div className="w-6 h-[2px] bg-white rounded-full" />
                    ) : (
                      <div className="w-6 h-[1.5px] bg-zinc-800 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── CENTER QUESTION CANVAS ── */}
        <div className="flex-1 flex items-center justify-center py-4 md:py-8">
          <main className="w-full max-w-xl flex flex-col justify-center">
            {/* Back button */}
            <div className="h-8 mb-2 flex items-center">
              {currentStepIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
              )}
            </div>

            {/* Current Step Label */}
            <div className="text-[11px] font-sans font-bold tracking-[0.18em] text-zinc-400 uppercase mb-3">
              {currentStep}
            </div>

            <AnimatePresence mode="wait">
              {/* ── STEP 1: NAME ── */}
              {currentStep === 'NAME' && (
                <motion.div
                  key="step-name"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-8">
                    What should we call you?
                  </h1>

                  <div className="mb-2">
                    <input
                      type="text"
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && isContinueEnabled() && handleNext()}
                      placeholder="Your name"
                      className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-500 text-2xl sm:text-3xl text-white placeholder-zinc-600 py-3 outline-none transition-colors"
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 mb-8">
                    Your display name across the TradiFive ecosystem — journal, AI coach, community, and leaderboards.
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: HANDLE ── */}
              {currentStep === 'HANDLE' && (
                <motion.div
                  key="step-handle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-8">
                    Claim your handle.
                  </h1>

                  <div className="mb-2 relative flex items-center border-b border-zinc-800 focus-within:border-zinc-500 transition-colors">
                    <span className="text-2xl sm:text-3xl text-zinc-600 font-bold mr-1">@</span>
                    <input
                      type="text"
                      autoFocus
                      value={handle}
                      onChange={handleHandleChange}
                      onKeyDown={(e) => e.key === 'Enter' && isContinueEnabled() && handleNext()}
                      placeholder="yourhandle"
                      className="w-full bg-transparent text-2xl sm:text-3xl text-white placeholder-zinc-600 py-3 outline-none transition-colors"
                    />
                    {isCheckingHandle && (
                      <div className="absolute right-2 text-zinc-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="h-6 mb-8 flex items-center">
                    {handleAvailable === true && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check size={14} strokeWidth={3} /> @{handle} is free
                      </span>
                    )}
                    {handleAvailable === false && (
                      <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                        <X size={14} strokeWidth={3} /> {handleError || "This handle is already taken."}
                      </span>
                    )}
                    {handleAvailable === null && !isCheckingHandle && (
                      <span className="text-xs sm:text-sm text-zinc-500">
                        This will be your unique trader identity across TradiFive.
                      </span>
                    )}
                  </div>
                </motion.div>
              )}

            {/* ── STEP 3: STYLE ── */}
            {currentStep === 'STYLE' && (
              <motion.div
                key="step-style"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-8">
                  How do you trade?
                </h1>

                <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8">
                  {[
                    { label: "Day trading", icon: Sun },
                    { label: "Swing", icon: TrendingUp },
                    { label: "Scalping", icon: Zap },
                    { label: "Position", icon: Shield },
                  ].map((item) => {
                    const isSelected = style === item.label;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setStyle(item.label)}
                        className={`inline-flex items-center gap-2 h-8 px-3.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none border ${
                          isSelected
                            ? "bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-[#60a5fa] border-[#3b82f6]/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                            : "bg-[#171717] text-zinc-300 hover:text-white border-white/[0.08] hover:border-white/[0.18] hover:bg-[#1f2026]"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-[#60a5fa]" : "text-zinc-500"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: MARKET ── */}
            {currentStep === 'MARKET' && (
              <motion.div
                key="step-market"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-8">
                  What do you trade?
                </h1>

                <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8">
                  {[
                    { label: "Futures", icon: BarChart2 },
                    { label: "Stocks", icon: TrendingUp },
                    { label: "Options", icon: Sliders },
                    { label: "Forex", icon: Globe },
                    { label: "Crypto", icon: Coins },
                    { label: "Other", icon: MoreHorizontal },
                  ].map((item) => {
                    const isSelected = market === item.label;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setMarket(item.label)}
                        className={`inline-flex items-center gap-2 h-8 px-3.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none border ${
                          isSelected
                            ? "bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-[#60a5fa] border-[#3b82f6]/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                            : "bg-[#171717] text-zinc-300 hover:text-white border-white/[0.08] hover:border-white/[0.18] hover:bg-[#1f2026]"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-[#60a5fa]" : "text-zinc-500"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: EDGE ── */}
            {currentStep === 'EDGE' && (
              <motion.div
                key="step-edge"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-8">
                  What's your edge?
                </h1>

                <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8">
                  {[
                    { label: "ICT concepts", icon: Target },
                    { label: "SMC", icon: Layers },
                    { label: "Order flow", icon: Activity },
                    { label: "Supply & demand", icon: Scale },
                    { label: "Price action", icon: BarChart2 },
                    { label: "Breakout", icon: Zap },
                    { label: "My own", icon: PenTool },
                    { label: "Something else", icon: Clock },
                  ].map((item) => {
                    const isSelected = selectedEdges.includes(item.label);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => toggleMultiSelect(item.label, selectedEdges, setSelectedEdges)}
                        className={`inline-flex items-center gap-2 h-8 px-3.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none border ${
                          isSelected
                            ? "bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-[#60a5fa] border-[#3b82f6]/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                            : "bg-[#171717] text-zinc-300 hover:text-white border-white/[0.08] hover:border-white/[0.18] hover:bg-[#1f2026]"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-[#60a5fa]" : "text-zinc-500"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 6: HERE TO ── */}
            {currentStep === 'HERE TO' && (
              <motion.div
                key="step-here-to"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-8">
                  What are you here to do?
                </h1>

                <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8">
                  {[
                    { label: "Find consistency", icon: Compass },
                    { label: "Grow my account", icon: TrendingUp },
                    { label: "Pass a prop eval", icon: Trophy },
                    { label: "Build discipline", icon: Shield },
                    { label: "Track my performance", icon: BarChart2 },
                    { label: "Stop revenge trading", icon: Ban },
                    { label: "Go full-time", icon: Briefcase },
                    { label: "Something else", icon: Sparkles },
                  ].map((item) => {
                    const isSelected = selectedHereTo.includes(item.label);
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => toggleMultiSelect(item.label, selectedHereTo, setSelectedHereTo)}
                        className={`inline-flex items-center gap-2 h-8 px-3.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none border ${
                          isSelected
                            ? "bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-[#60a5fa] border-[#3b82f6]/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                            : "bg-[#171717] text-zinc-300 hover:text-white border-white/[0.08] hover:border-white/[0.18] hover:bg-[#1f2026]"
                        }`}
                      >
                        <Icon size={14} className={isSelected ? "text-[#60a5fa]" : "text-zinc-500"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 7: FOUND US ── */}
            {currentStep === 'FOUND US' && (
              <motion.div
                key="step-found-us"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-8">
                  Where did you hear about us?
                </h1>

                <div className="flex flex-wrap gap-2 sm:gap-2.5 mb-8">
                  {[
                    "Discord", "Instagram", "TikTok", "YouTube", "X", 
                    "A friend", "Google", "AI", "Reddit", "Somewhere else"
                  ].map((item) => {
                    const isSelected = foundUs === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFoundUs(item)}
                        className={`inline-flex items-center h-8 px-3.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer select-none border ${
                          isSelected
                            ? "bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-[#60a5fa] border-[#3b82f6]/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                            : "bg-[#171717] text-zinc-300 hover:text-white border-white/[0.08] hover:border-white/[0.18] hover:bg-[#1f2026]"
                        }`}
                      >
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 8: ACCOUNT (Completion) ── */}
            {currentStep === 'ACCOUNT' && (
              <motion.div
                key="step-account"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
                  You're all set!
                </h1>
                <p className="text-sm text-zinc-400 mb-8">
                  Your profile has been created. Welcome to the TradiFive ecosystem.
                </p>

                <div className="bg-[#121316] rounded-2xl p-6 mb-8 space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-mono text-zinc-500">TRADER IDENTITY</span>
                    <span className="text-sm font-bold text-white">{name} <span className="text-blue-400">(@{handle})</span></span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-xs font-mono text-zinc-500">STYLE & MARKET</span>
                    <span className="text-sm font-semibold text-zinc-200">{style || "Day trading"} · {market || "Forex"}</span>
                  </div>
                  {selectedEdges.length > 0 && (
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs font-mono text-zinc-500">TRADING EDGE</span>
                      <span className="text-sm font-semibold text-zinc-200">{selectedEdges.join(", ")}</span>
                    </div>
                  )}
                  {selectedHereTo.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-zinc-500">PRIMARY GOAL</span>
                      <span className="text-sm font-semibold text-zinc-200">{selectedHereTo.join(", ")}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── ACTION BUTTONS ── */}
          <div className="flex items-center gap-4 mt-2">
            <button
              type="button"
              disabled={!isContinueEnabled() || isSaving}
              onClick={handleNext}
              className={`h-11 px-8 rounded-lg text-sm font-bold tracking-normal transition-all duration-200 inline-flex items-center justify-center gap-2 border-0 ${
                isContinueEnabled()
                  ? "bg-gradient-to-br from-[#1e293b] to-[#0f172a] hover:from-[#253347] hover:to-[#131c33] text-[#60a5fa] hover:text-[#93c5fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.4)] active:scale-[0.985] cursor-pointer"
                  : "bg-[#111622] text-[#60a5fa]/30 cursor-not-allowed opacity-50"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#60a5fa]" />
                  <span>Saving...</span>
                </>
              ) : currentStep === 'ACCOUNT' ? (
                <span>Enter Dashboard</span>
              ) : (
                <span>Continue</span>
              )}
            </button>

            {currentStepIndex > 1 && currentStepIndex < STEPS_ORDER.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="text-xs text-zinc-400 hover:text-white font-medium transition-colors px-2 py-1"
              >
                Skip this
              </button>
            )}
          </div>
        </main>
        </div>

        {/* ── RIGHT BALANCER (Ensures Center Question is 100% centered) ── */}
        <div className="hidden md:block w-60 shrink-0 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
};
