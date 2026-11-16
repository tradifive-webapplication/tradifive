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

// 1 single line of 4-5 words, easy to understand
const FIALGO_STEPS: StepConfig[] = [
  { target: 28, duration: 1100, pause: 400, text: "Launching FiAlgo Workspace..." },
  { target: 62, duration: 1300, pause: 500, text: "Loading algorithmic trading engine..." },
  { target: 88, duration: 1000, pause: 400, text: "Preparing your live dashboard..." },
  { target: 100, duration: 700, pause: 250, text: "FiAlgo ready, entering now..." },
];

const TRADIFIVE_STEPS: StepConfig[] = [
  { target: 35, duration: 750, pause: 250, text: "Switching to TradiFive Workspace..." },
  { target: 72, duration: 850, pause: 300, text: "Loading your trading feed..." },
  { target: 100, duration: 600, pause: 250, text: "TradiFive ready, opening now..." },
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
    if (isFiAlgo) {
      // Preserve TradiFive theme before entering FiAlgo dark mode
      try {
        if (!localStorage.getItem("tradifive_user_theme")) {
          const current =
            localStorage.getItem("theme") ||
            (document.documentElement.classList.contains("dark") ? "dark" : "light");
          localStorage.setItem("tradifive_user_theme", current);
        }
      } catch (e) {}
      document.documentElement.classList.add("dark");
    }

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
      await new Promise((r) => setTimeout(r, 200));
      if (!isMounted) return;
      setIsExiting(true);

      await new Promise((r) => setTimeout(r, 350));
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
      className={`fixed inset-0 z-[999999] bg-[#08080A] flex flex-col items-center justify-center font-sans select-none overflow-hidden transition-opacity duration-300 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundColor: "#08080A",
      }}
    >
      {/* Subtle ambient lighting */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.03) 0%, transparent 60%)",
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
          <div className="w-16 h-16 rounded-2xl bg-[#121214] border border-white/[0.08] flex items-center justify-center p-3 shadow-2xl">
            <img
              src={isFiAlgo ? "/fialgo-logo.png" : "/Logo_only.png"}
              alt={isFiAlgo ? "FiAlgo" : "TradiFive"}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* ONLY 1 LINE OF TEXT (4-5 words max, clean and easy to understand in 5 sec) */}
        <p className="text-[14px] sm:text-[15px] font-semibold text-white tracking-wide transition-all duration-200 min-h-[24px]">
          {statusText}
        </p>

        {/* Wide Horizontal White Loader */}
        <div className="w-full max-w-xs sm:max-w-sm mt-5">
          <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden relative">
            <div
              className="h-full rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.95)] transition-all duration-75 ease-out relative"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Minimal Percentage */}
          <div className="flex justify-end mt-2 px-0.5">
            <span className="text-[11px] font-mono font-medium text-neutral-400">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
