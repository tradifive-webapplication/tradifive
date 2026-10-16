import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { X, FolderDown, ArrowRight, ShieldCheck, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DownloadEngineFlowProps {
  onDownloadComplete: () => void;
  fileName: string;
  alreadyDownloaded?: boolean;
}

const DownloadEngineFlow = ({ onDownloadComplete, fileName, alreadyDownloaded }: DownloadEngineFlowProps) => {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    setProgress(0);
    setIsFinished(false);

    let currentProgress = 0;
    const interval = setInterval(() => {
      // Smooth but variable progress
      const increment = Math.random() * 8 + 3;
      currentProgress = Math.min(currentProgress + increment, 100);

      setProgress(Math.round(currentProgress));

      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsFinished(true);
        if (!alreadyDownloaded) {
          handleAutoDownload();
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, [alreadyDownloaded]);

  const handleAutoDownload = () => {
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = "/" + fileName;
      link.download = fileName;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white dark:bg-[#1E1E1E] rounded-[32px] p-8 md:p-10 border border-slate-100 dark:border-[#333333] shadow-[0_20px_60px_rgba(0,0,0,0.04)] relative overflow-hidden"
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16" />

        {/* Title Section */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-[24px] font-bold tracking-tight text-slate-900 dark:text-white mb-2">Engine Deployment</h2>
          <p className="text-slate-500 font-medium text-[14px]">Preparing your secure algorithmic connector.</p>
        </div>

        {/* Status Card */}
        <div className="bg-[#F9FAFF] rounded-[28px] border border-slate-100 dark:border-[#333333] p-8 flex flex-col items-center justify-center mb-8 group">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative mb-6"
          >
            <div className="w-20 h-20 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-[0_10px_25px_rgba(99,102,241,0.1)] flex items-center justify-center border border-indigo-50 transition-transform group-hover:scale-105 duration-500">
              {isFinished ? (
                <ShieldCheck size={40} className="text-emerald-500" strokeWidth={1.5} />
              ) : (
                <div className="relative">
                  <FolderDown size={40} className="text-indigo-500 animate-pulse" strokeWidth={1.5} />
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Download size={14} className="text-indigo-400" />
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="text-center">
            <h3 className="text-slate-900 dark:text-slate-200 font-bold text-[16px] mb-1">
              {isFinished ? "Engine Ready" : "Preparing Package..."}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
              <p className="text-slate-500 text-[13px] font-semibold">{fileName}</p>
            </div>
          </div>
        </div>

        {/* Progress Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-6 border border-slate-100 dark:border-[#333333] shadow-[0_4px_20px_rgba(0,0,0,0.02)] mb-10"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-[10px] shrink-0 border border-indigo-100">
              EX5
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-700 text-[13px] font-bold truncate pr-4">Authentication Heartbeat</span>
                <span className="text-indigo-600 text-[13px] font-black">{progress}%</span>
              </div>
              <div className="relative h-2 w-full bg-slate-100 dark:bg-[#1E1E1E] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {isFinished ? (
              <motion.button
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onDownloadComplete}
                className="w-full group py-4 bg-indigo-600 text-white rounded-2xl font-bold text-[15px] transition-all hover:bg-indigo-700 shadow-[0_15px_30px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2"
              >
                Continue Setup <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="px-6 py-2.5 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-full text-slate-400 text-[12px] font-bold tracking-wide uppercase">
                  Processing Files...
                </div>
                <p className="text-slate-400 text-[12px] font-medium opacity-80 mt-2 text-center max-w-xs">
                  {alreadyDownloaded ? "Re-verifying engine integrity." : "The secure download will start automatically."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default DownloadEngineFlow;




