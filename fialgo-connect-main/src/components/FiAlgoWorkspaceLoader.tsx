import React, { useState, useEffect } from "react";

interface FiAlgoWorkspaceLoaderProps {
  targetWorkspace?: "fialgo" | "tradifive";
  onComplete: () => void;
}

interface StepConfig {
  target: number;
  duration: number;
  pause: number;
  text: string;
}

const FIALGO_STEPS: StepConfig[] = [
  { target: 35, duration: 800, pause: 200, text: "Entering new era of AutoTrade..." },
  { target: 70, duration: 900, pause: 250, text: "Synchronizing algorithmic trading engine..." },
  { target: 90, duration: 700, pause: 150, text: "Preparing your live dashboard..." },
  { target: 100, duration: 500, pause: 150, text: "Entering new era of AutoTrade..." },
];

const TRADIFIVE_STEPS: StepConfig[] = [
  { target: 35, duration: 700, pause: 200, text: "Switching to TradiFive Workspace..." },
  { target: 72, duration: 800, pause: 200, text: "Loading your trading feed & journal..." },
  { target: 100, duration: 500, pause: 150, text: "TradiFive ready, opening now..." },
];

export default function FiAlgoWorkspaceLoader({
  targetWorkspace = "fialgo",
  onComplete,
}: FiAlgoWorkspaceLoaderProps) {
  const isFiAlgo = targetWorkspace === "fialgo";
  const steps = isFiAlgo ? FIALGO_STEPS : TRADIFIVE_STEPS;

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(steps[0].text);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let currentPct = 0;

    const runSequence = async () => {
      for (let i = 0; i < steps.length; i++) {
        if (!isMounted) return;
        const step = steps[i];
        setStatusText(step.text);

        const startPct = currentPct;
        const targetPct = step.target;
        const stepDuration = step.duration;
        const startTime = Date.now();

        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (!isMounted) {
              clearInterval(interval);
              resolve();
              return;
            }
            const elapsed = Date.now() - startTime;
            const factor = Math.min(elapsed / stepDuration, 1);
            const eased = 1 - Math.pow(1 - factor, 3);
            const nextVal = Math.min(
              Math.round(startPct + (targetPct - startPct) * eased),
              targetPct
            );
            currentPct = nextVal;
            setProgress(nextVal);

            if (factor >= 1) {
              clearInterval(interval);
              resolve();
            }
          }, 20);
        });

        if (step.pause > 0 && isMounted) {
          await new Promise((r) => setTimeout(r, step.pause));
        }
      }

      if (!isMounted) return;
      setProgress(100);

      // Smooth exit
      await new Promise((r) => setTimeout(r, 180));
      if (!isMounted) return;
      setIsExiting(true);

      await new Promise((r) => setTimeout(r, 280));
      if (!isMounted) return;
      onComplete();
    };

    runSequence();

    return () => {
      isMounted = false;
    };
  }, [isFiAlgo, steps, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[999999] bg-white/95 dark:bg-[#08080A]/95 backdrop-blur-xl flex flex-col items-center justify-center font-sans select-none overflow-hidden transition-opacity duration-300 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Subtle ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(14, 165, 233, 0.12) 0%, transparent 60%)",
        }}
      />

      {/* Main Container */}
      <div
        className={`flex flex-col items-center justify-center px-6 text-center max-w-md w-full relative z-10 transition-all duration-300 ease-out ${
          isExiting ? "-translate-y-3 scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        {/* Center Logo */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-[28px] blur-md animate-pulse pointer-events-none" />
          <div className="relative w-16 h-16 rounded-[22px] bg-white dark:bg-[#121214] border border-slate-200/90 dark:border-white/[0.08] flex items-center justify-center p-3 shadow-xl">
            <img
              src={isFiAlgo ? "/fialgo-logo.png" : "/Logo_only.png"}
              alt={isFiAlgo ? "FiAlgo" : "TradiFive"}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-[18px] sm:text-[20px] font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          {isFiAlgo ? "Entering New Era of AutoTrade" : "Switching to TradiFive"}
        </h2>

        {/* Subtitle status line */}
        <p className="text-[13px] font-medium text-slate-500 dark:text-neutral-400 tracking-wide transition-all duration-200 min-h-[22px]">
          {statusText}
        </p>

        {/* Horizontal Loader */}
        <div className="w-full max-w-xs sm:max-w-sm mt-5">
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden relative border border-slate-200/50 dark:border-white/5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-75 ease-out relative ${
                isFiAlgo
                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                  : "bg-slate-900 dark:bg-white"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Minimal Percentage */}
          <div className="flex justify-between items-center mt-2 px-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500">
              {isFiAlgo ? "MT5 London LD4 Link" : "TradiFive Core"}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-neutral-300">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
