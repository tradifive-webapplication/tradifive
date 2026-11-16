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
    // Ensure Dark Mode matching Admin App is active immediately
    document.documentElement.classList.add("dark");
    try {
      localStorage.setItem("tradifive_theme", "dark");
      localStorage.setItem("theme", "dark");
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
      className={`fixed inset-0 z-[99999] bg-[#0A0A0C] flex flex-col items-center justify-center font-sans select-none overflow-hidden transition-opacity duration-300 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        background: "radial-gradient(circle at 50% 40%, rgba(147, 51, 234, 0.18) 0%, rgba(10, 10, 12, 0.98) 70%)",
      }}
    >
      {/* Ambient background grid */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
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
          <div className="absolute -inset-4 rounded-3xl bg-purple-600/25 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-3.5 shadow-2xl backdrop-blur-md">
            <img
              src="/fialgo-logo.png"
              alt="FiAlgo"
              className="w-full h-full object-contain drop-shadow-[0_0_16px_rgba(168,85,247,0.7)]"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2 font-sans">
          Building your FiAlgo Workspace
        </h2>

        {/* Dynamic Phase Subtitle */}
        <p className="text-[13px] font-medium text-slate-400 min-h-[22px] tracking-wide transition-all duration-200">
          {statusText}
        </p>

        {/* Horizontal Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm mt-6">
          <div className="w-full h-2 rounded-full bg-white/[0.08] p-0.5 overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-75 ease-out shadow-[0_0_14px_rgba(168,85,247,0.9)] relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/70 rounded-full blur-[1px]" />
            </div>
          </div>

          {/* Progress Percent + Algo Tag */}
          <div className="flex items-center justify-between mt-2.5 px-0.5 text-[11px] font-mono">
            <span className="text-purple-400/90 font-bold uppercase tracking-wider">
              ALGO ENGINE v2.4
            </span>
            <span className="text-slate-400 font-semibold">{progress}%</span>
          </div>
        </div>

        {/* Subtle Tech Footer Pill */}
        <div className="mt-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Institutional Low-Latency MT5 Bridge
          </span>
        </div>
      </div>
    </div>
  );
}
