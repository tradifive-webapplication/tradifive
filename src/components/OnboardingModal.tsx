import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Rocket, Zap, ShieldCheck, BarChart3, X } from "lucide-react";
import { PushableButton } from "./PushableButton";

interface OnboardingModalProps {
  onComplete: () => void;
  userId?: string;
}

const ONBOARDING_KEY = "tradifive_onboarding_seen";

export const OnboardingModal = ({ onComplete, userId }: OnboardingModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!userId) return;
    
    const userKey = `tradifive_onboarding_seen_${userId}`;
    const hasSeen = localStorage.getItem(userKey);
    
    if (!hasSeen) {
      // Small delay to show after initial dashboard load as requested
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  const steps = [
    {
      title: "Welcome to Tradifive 🚀",
      description: "Experience the next generation of institutional-grade automated trading. Your mission starts here.",
      accentText: "Join the elite traders...",
      icon: <Rocket className="w-12 h-12 text-slate-200" />,
      image: "/onboarding_welcome.png",
      color: "from-blue-500/20 to-indigo-500/20",
      accent: "blue",
      stats: [
        { label: "Active Nodes", value: "1,248" },
        { label: "Uptime", value: "99.9%" }
      ]
    },
    {
      title: "Tactical Algo Engine 🤖",
      description: "Deploy advanced trading algorithms with a single click. Precision execution meets simplified control.",
      accentText: "Let the machines do the work.",
      icon: <Zap className="w-12 h-12 text-amber-500" />,
      image: "/onboarding_algo.png",
      color: "from-amber-500/20 to-orange-500/20",
      accent: "amber",
      stats: [
        { label: "Execution", value: "42ms" },
        { label: "Success", value: "94.2%" }
      ]
    },
    {
      title: "Institutional Risk Shield 🛡️",
      description: "Protect your capital with real-time risk management protocols. Automated halts keep your drawdown in check.",
      accentText: "Your capital, protected.",
      icon: <ShieldCheck className="w-12 h-12 text-rose-500" />,
      image: "/onboarding_risk.png",
      color: "from-rose-500/20 to-red-500/20",
      accent: "rose",
      stats: [
        { label: "Max DD", value: "3.5%" },
        { label: "Protection", value: "24/7" }
      ]
    },
    {
      title: "Precision Analytics 📊",
      description: "Deep-dive into your performance with high-fidelity charts and automated journaling for every trade.",
      accentText: "Knowledge is power.",
      icon: <BarChart3 className="w-12 h-12 text-emerald-500" />,
      image: "/onboarding_analytics.png",
      color: "from-emerald-500/20 to-teal-500/20",
      accent: "emerald",
      stats: [
        { label: "Profit Factor", value: "2.84" },
        { label: "Win Ratio", value: "72%" }
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    if (userId) {
      const userKey = `tradifive_onboarding_seen_${userId}`;
      localStorage.setItem(userKey, "true");
    }
    onComplete();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
          onClick={handleComplete}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-white dark:bg-[#1E1E1E] rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row border border-white/20"
        >
          {/* Close Button */}
          <button
            onClick={handleComplete}
            className="absolute top-8 right-8 z-30 p-2.5 rounded-2xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#333333] hover:bg-slate-100 dark:bg-[#1E1E1E] transition-all text-slate-400 hover:text-slate-600 shadow-sm"
          >
            <X size={18} />
          </button>

          {/* Left Side: Image/Visual */}
          <div className={`relative w-full md:w-[45%] h-80 md:h-auto bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center overflow-hidden border-r border-slate-100 dark:border-[#333333]`}>
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full h-full p-12 flex items-center justify-center"
              >
                <img 
                  src={steps[currentStep].image} 
                  alt={steps[currentStep].title}
                  className="max-w-full max-h-full object-contain rounded-[32px] shadow-[0_30px_60px_rgba(0,0,0,0.2)]"
                />
              </motion.div>
            </AnimatePresence>

            {/* Float Stats Badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`stats-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-8 left-8 right-8 z-20 flex gap-3"
              >
                {steps[currentStep].stats.map((stat, i) => (
                  <div key={i} className="flex-1 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-[55%] p-10 md:p-16 flex flex-col justify-between bg-white dark:bg-[#1E1E1E]">
            <div className="space-y-10">
              {/* Step Counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex gap-1.5">
                    {steps.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-700 ${idx === currentStep ? 'w-10 bg-white' : 'w-2 bg-slate-100 dark:bg-[#1E1E1E]'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] ml-2">
                    Protocol {currentStep + 1}
                  </span>
                </div>
                <div className="handwriting text-slate-200 text-xl font-bold rotate-[-5deg] opacity-60">
                  {steps[currentStep].accentText}
                </div>
              </div>

              {/* Text Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="inline-flex p-3.5 rounded-3xl bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] mb-2 shadow-sm">
                    {steps[currentStep].icon}
                  </div>
                  <h2 className="text-[42px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                    {steps[currentStep].title.split(' ').map((word, i) => (
                      <span key={i} className={i === 0 ? "" : i === steps[currentStep].title.split(' ').length - 1 ? "" : "text-white"}>{word} </span>
                    ))}
                  </h2>
                  <p className="text-slate-500 text-lg leading-relaxed font-medium max-w-md">
                    {steps[currentStep].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-16 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`group flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900 dark:text-white'}`}
              >
                <div className="w-9 h-9 rounded-full border border-slate-200 dark:border-[#333333] flex items-center justify-center group-hover:border-slate-900 transition-colors">
                  <ChevronLeft size={18} />
                </div>
                Back
              </button>

              <div className="flex items-center gap-4">
                <PushableButton
                  onClick={handleNext}
                  className="min-w-[140px]"
                >
                  <span className="flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[11px] py-1">
                    {currentStep === steps.length - 1 ? "Complete" : "Next"}
                    <ChevronRight size={18} />
                  </span>
                </PushableButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};





