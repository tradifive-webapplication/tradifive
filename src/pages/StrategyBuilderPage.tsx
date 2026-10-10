import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Send, Bot, Code, Cpu, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StrategyBuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [isBuilding, setIsBuilding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleBuild = () => {
    if (!prompt.trim()) return;
    setIsBuilding(true);
    // Simulate build process
    setTimeout(() => {
      setIsBuilding(false);
      setIsComplete(true);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto w-full font-sans p-4 md:p-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">AI Strategy Builder</h1>
          <p className="text-slate-500 dark:text-neutral-400 text-lg max-w-2xl mx-auto">
            Describe your trading strategy in plain English. Our AI will automatically generate the code, backtest parameters, and build the custom trading bot for you.
          </p>
        </div>

        {!isComplete ? (
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200/50 dark:border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="relative z-10">
              <label className="block text-sm font-semibold text-slate-700 dark:text-white/80 mb-3">
                Strategy Requirements
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Build a scalping bot for EURUSD on the 5-minute timeframe. It should enter a long position when the RSI drops below 30 and the MACD line crosses above the signal line. Set a 15-pip take profit and a 10-pip stop loss..."
                className="w-full h-48 bg-slate-50 dark:bg-[#121214] border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-slate-700 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-[15px] leading-relaxed"
              />

              <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-white/50">
                  <Sparkles size={16} className="text-amber-500" />
                  Be as detailed as possible with indicators, timeframes, and risk management.
                </div>
                
                <Button 
                  onClick={handleBuild}
                  disabled={!prompt.trim() || isBuilding}
                  className="w-full md:w-auto h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/20"
                >
                  {isBuilding ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Building Algorithm...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Code size={18} />
                      Generate Strategy
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 text-center shadow-sm border border-emerald-500/20 relative overflow-hidden"
          >
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Strategy Built Successfully!</h2>
            <p className="text-slate-500 dark:text-white/60 mb-8 max-w-md mx-auto">
              We have generated the algorithm based on your description. It is now ready for backtesting or live deployment.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => setIsComplete(false)}
                variant="outline"
                className="h-12 px-8 rounded-full border-slate-200 dark:border-white/10 dark:text-white"
              >
                Create Another
              </Button>
              <Button 
                onClick={() => {/* navigate to backtest */}}
                className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20"
              >
                Run Backtest
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
