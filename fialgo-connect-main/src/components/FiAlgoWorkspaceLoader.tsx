import React, { useState, useEffect } from "react";

interface FiAlgoWorkspaceLoaderProps {
  onComplete: () => void;
}

const PHASES = [
  { at: 0, text: "Initializing Algo Execution Engine..." },
  { at: 28, text: "Connecting MT5 Terminal Bridge..." },
  { at: 58, text: "Configuring Institutional Risk Guard..." },
  { at: 82, text: "Syncing Live Automated Strategies..." },
  { at: 98, text: "Workspace Ready! Launching..." },
];

export default function FiAlgoWorkspaceLoader({ onComplete }: FiAlgoWorkspaceLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing Algo Execution Engine...");
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Ensure White Mode is strictly active
    document.documentElement.classList.remove("dark");
    try {
      localStorage.setItem("tradifive_theme", "light");
      localStorage.setItem("theme", "light");
    } catch (e) {}

    const startTime = Date.now();
    const duration = 1400; // 1.4s smooth progress

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);

      const matchedPhase = [...PHASES].reverse().find((p) => pct >= p.at);
      if (matchedPhase) {
        setStatusText(matchedPhase.text);
      }

      if (pct >= 100) {
        clearInterval(interval);
        // Begin exit transition (smooth transition to top-left like admin app)
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            onComplete();
          }, 380);
        }, 160);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#F8FAFC] flex flex-col items-center justify-center font-sans select-none overflow-hidden transition-opacity duration-300 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at 50% 40%, rgba(168, 85, 247, 0.08) 0%, rgba(248, 250, 252, 0.98) 70%)",
      }}
    >
      {/* Ambient background grid */}
      <div 
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)",
          backgroundSize: "36px 36px"
        }}
      />

      {/* Main Content Container with graceful exit animation */}
      <div
        className={`flex flex-col items-center justify-center px-6 text-center max-w-md w-full relative z-10 transition-all duration-500 ease-out ${
          isExiting ? "-translate-y-8 scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        {/* Glowing Logo Container */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-4 rounded-3xl bg-purple-500/15 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-center p-3.5 shadow-[0_10px_25px_-5px_rgba(168,85,247,0.15)]">
            <img
              src="/fialgo-logo.png"
              alt="FiAlgo"
              className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(168,85,247,0.3)]"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-2 font-sans">
          Building your FiAlgo Workspace
        </h2>

        {/* Dynamic Phase Subtitle */}
        <p className="text-[13px] font-medium text-slate-500 min-h-[22px] tracking-wide transition-all duration-200">
          {statusText}
        </p>

        {/* Horizontal Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm mt-6">
          <div className="w-full h-2 rounded-full bg-slate-200/80 p-0.5 overflow-hidden border border-slate-300/60 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 transition-all duration-75 ease-out shadow-[0_0_12px_rgba(168,85,247,0.5)] relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/80 rounded-full blur-[1px]" />
            </div>
          </div>

          {/* Progress Percent + Algo Tag */}
          <div className="flex items-center justify-between mt-2.5 px-0.5 text-[11px] font-mono">
            <span className="text-purple-600 font-bold uppercase tracking-wider">
              ALGO ENGINE v2.4
            </span>
            <span className="text-slate-600 font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Subtle Tech Footer Pill */}
        <div className="mt-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Institutional Low-Latency MT5 Bridge
          </span>
        </div>
      </div>
    </div>
  );
}
