import React, { useState } from "react";
import { X, Monitor, Smartphone, ExternalLink, RefreshCw, Terminal, Globe, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LiveAppViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveAppView({ isOpen, onClose }: LiveAppViewProps) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [env, setEnv] = useState<"local" | "prod">("local");

  const url = env === "local" ? "http://localhost:5173" : "https://tradifive.in";

  if (!isOpen) return null;

  const handleLaunch = (targetUrl?: string) => {
    window.open(targetUrl || url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans select-none">
      {/* Header Bar - Exactly like the first screenshot layout */}
      <header className="h-[60px] shrink-0 bg-[#0d0d0d] border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleLaunch(url)}
            className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all active:scale-[0.98]"
            title="Launch current environment in a new tab"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live User App</span>
          </button>

          <div className="flex items-center bg-[#1a1a1a] p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setEnv("local")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                env === "local" ? "bg-white/10 text-white shadow" : "text-neutral-500 hover:text-white"
              }`}
            >
              Localhost
            </button>
            <button
              onClick={() => setEnv("prod")}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                env === "prod" ? "bg-white/10 text-white shadow" : "text-neutral-500 hover:text-white"
              }`}
            >
              Production
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 mx-2" />

          <div className="flex items-center bg-[#1a1a1a] p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setDeviceView("desktop")}
              className={`p-1.5 rounded transition-all ${
                deviceView === "desktop" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
              }`}
              title="Desktop View"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setDeviceView("mobile")}
              className={`p-1.5 rounded transition-all ${
                deviceView === "mobile" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
              }`}
              title="Mobile View"
            >
              <Smartphone size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span 
            onClick={() => handleLaunch(url)}
            className="text-neutral-500 text-[10px] font-mono tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:text-white hover:border-white/10 transition-all"
            title="Click to launch"
          >
            {url}
          </span>
          <button
            onClick={() => {
              const iframe = document.getElementById("live-app-iframe") as HTMLIFrameElement;
              if (iframe) iframe.src = iframe.src;
            }}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Refresh iframe"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => handleLaunch(url)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={14} />
          </button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Close View"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Mock Screen UI Container */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-6 bg-[#060606]">
        <motion.div
          layout
          className={`bg-white rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 relative border border-white/10 ${
            deviceView === "mobile" 
              ? "flex-none w-[380px] h-[800px] max-h-[90vh]" 
              : "flex-none w-full h-[90vh] max-w-[1600px] max-h-[1000px]"
          }`}
        >
          <iframe
            id="live-app-iframe"
            src={url}
            className="w-full h-full border-none bg-white"
            title="Live App Viewer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-top-navigation"
          />
        </motion.div>
      </div>
    </div>
  );
}
