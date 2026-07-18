import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  FolderOpen, 
  RefreshCw, 
  Key, 
  Activity, 
  ArrowRight, 
  Check, 
  Copy, 
  Monitor, 
  Cpu,
  ExternalLink 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrading } from "@/contexts/TradingContext";
import DashboardLayout from "@/components/DashboardLayout";
import DownloadEngineFlow from "@/components/DownloadEngineFlow";
import { toast } from "sonner";

export default function EASetup() {
  const { licenseKey, connectDemo } = useTrading();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const copyKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    toast.success("License Key Copied", {
      description: "Paste this into the EA settings on your MT5 terminal."
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    // Simulate connection
    connectDemo("IC Markets");
    navigate("/connection-success");
  };

  const steps = [
    {
      id: 1,
      title: "Binary Acquisition",
      description: "Acquire the latest TradiFive Master EA engine binary for your terminal.",
      icon: Download,
      color: "bg-blue-500",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Stable Version</span>
              <span className="px-3 py-1 bg-[#D1E4FF] dark:bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase">v4.2.0</span>
            </div>
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-6">
              Download the .ex5 file. This is the core algorithmic component that will bridge your MT5 terminal with our AI Engine.
            </p>
            <button 
              onClick={() => setIsDownloading(true)}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10"
            >
              <Download size={18} /> Download Master EA
            </button>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Experts Directory",
      description: "Place the binary file into your MetaTrader 5 Expert Advisor directory.",
      icon: FolderOpen,
      color: "bg-indigo-500",
      content: (
        <div className="space-y-4">
          <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
            Open your MT5 Terminal and navigate to:
          </p>
          <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl font-mono text-[12px] flex items-center gap-3 border border-white/5">
            <span className="text-slate-300">File</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">Open Data Folder</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">MQL5</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-300">Experts</span>
          </div>
          <p className="text-[12px] text-slate-400 font-medium italic">
            * Paste the downloaded 'TradiFive_Master.ex5' file into this folder.
          </p>
        </div>
      )
    },
    {
      id: 3,
      title: "Terminal Sync",
      description: "Synchronize your MT5 terminal to detect the new trading module.",
      icon: RefreshCw,
      color: "bg-[#D1E4FF] dark:bg-emerald-500",
      content: (
        <div className="space-y-6">
          <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
            In your MT5 "Navigator" window, right-click on <span className="font-bold text-slate-900 dark:text-white">Expert Advisors</span> and select <span className="font-bold text-white">Refresh</span>.
          </p>
          <div className="aspect-video bg-slate-100 dark:bg-[#1E1E1E] rounded-2xl flex items-center justify-center border border-slate-200 dark:border-[#333333]">
             <div className="text-center space-y-2">
                <Monitor className="text-slate-400 mx-auto" size={32} />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Visual Aid: Refreshing Navigator</p>
             </div>
          </div>
          <p className="text-[13px] text-slate-500 font-medium italic text-center">
            Once it appears, drag the EA onto any active chart.
          </p>
        </div>
      )
    },
    {
      id: 4,
      title: "EA Authorization",
      description: "Input your encrypted license key into the EA configuration panel.",
      icon: Key,
      color: "bg-amber-500",
      content: (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1E1E1E] border-2 border-amber-500/10 rounded-2xl p-6 shadow-sm">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Your Unique License Key</p>
             <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] p-4 rounded-xl font-mono text-[14px] font-black text-foreground break-all">
                  {licenseKey}
                </div>
                <button 
                  onClick={copyKey}
                  className="p-4 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
             </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
             <div className="p-1 bg-amber-500 rounded-md mt-0.5">
                <ExternalLink size={12} className="text-white" />
             </div>
             <p className="text-[12px] text-amber-900/60 font-medium leading-relaxed">
               Open EA inputs tab, find the <span className="font-bold">LicenseKey</span> field, and paste your key there.
             </p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Telemetry Check",
      description: "Enable algorithmic trading and verify the live heartbeat signal.",
      icon: Activity,
      color: "bg-rose-500",
      content: (
        <div className="space-y-6">
          <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
            Ensure the <span className="px-2 py-0.5 bg-[#D1E4FF] dark:bg-blue-500merald-100 text-emerald-700 rounded-md font-bold">Algo Trading</span> button in MT5 is pressed (Green icon).
          </p>
          <div className="bg-slate-900 rounded-[2rem] p-8 text-center space-y-4 border border-white/10 shadow-2xl">
             <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="text-rose-500 animate-pulse" size={24} />
             </div>
             <h4 className="text-white font-black uppercase tracking-tight text-lg">System Verification</h4>
             <p className="text-white/40 text-[12px] font-medium max-w-[200px] mx-auto">
               Once the EA shows "Connected" in the chart corner, click below.
             </p>
             <button 
               onClick={handleComplete}
               className="w-full py-4 bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-slate-100 dark:bg-[#1E1E1E] transition-all shadow-xl"
             >
               Verify & Connect
             </button>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps.find(s => s.id === currentStep)!;

  return (
    <DashboardLayout breadcrumbs={[{ label: "Setup", path: "/settings?tab=File Setup" }, { label: "Engine Deployment" }]}>
      <div className="max-w-4xl mx-auto py-10 px-6">
        
        {/* Progress Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 text-white">
                <Cpu size={20} />
             </div>
             <div>
                <h1 className="text-[20px] font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Engine Deployment</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">5-Step Tactical Guide</p>
             </div>
          </div>

          <div className="flex items-center gap-1 min-w-[200px]">
             {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                    currentStep >= step.id ? 'bg-white' : 'bg-slate-100 dark:bg-[#1E1E1E]'
                  }`} 
                />
             ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Step Navigation */}
          <div className="lg:col-span-4 space-y-2">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-300 border flex items-center justify-between ${
                    isActive 
                    ? 'bg-white dark:bg-[#1E1E1E] border-blue-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] scale-[1.02] z-10 relative' 
                    : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isActive ? 'bg-white text-white' : 'bg-slate-100 dark:bg-[#1E1E1E] text-slate-400'
                    }`}>
                      {isCompleted ? <Check size={14} strokeWidth={4} /> : <span className="text-[11px] font-black">0{step.id}</span>}
                    </div>
                    <h4 className={`text-[11px] font-black uppercase tracking-tight ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                      {step.title}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Active Step Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-[#333333] rounded-[28px] p-8 shadow-sm flex flex-col justify-between min-h-[340px]"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 dark:border-white/5 pb-4 mb-6">
                     <h2 className="text-[16px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Step 0{currentStep}: {currentStepData.title}
                     </h2>
                     <span className="px-2 py-0.5 bg-blue-50 text-white rounded text-[9px] font-black uppercase tracking-widest">Mandatory</span>
                  </div>
                  
                  <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-8">
                    {currentStepData.description}
                  </p>

                  <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 border border-slate-50 dark:border-white/5 dark:border-white/5 shadow-inner">
                      {currentStepData.content}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 dark:border-white/5 flex justify-between items-center">
                  <button 
                    disabled={currentStep === 1}
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-900 dark:text-white disabled:opacity-0 transition-colors"
                  >
                    Previous
                  </button>
                  {currentStep < 5 ? (
                    <button 
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button 
                      onClick={handleComplete}
                      className="px-8 py-3 bg-white text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                    >
                      Verify & Activate Engine
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Download Overlay */}
        <AnimatePresence>
           {isDownloading && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                 <motion.div 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   exit={{ opacity: 0 }} 
                   onClick={() => setIsDownloading(false)}
                   className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
                 />
                 <div className="scale-90">
                    <DownloadEngineFlow 
                      onDownloadComplete={() => {
                        setHasDownloaded(true);
                        setIsDownloading(false);
                        setCurrentStep(2);
                      }}
                      fileName="TradiFive_Master_EA.ex5"
                      alreadyDownloaded={hasDownloaded}
                    />
                 </div>
              </div>
           )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}






