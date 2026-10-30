import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarket } from '@/contexts/MarketContext';
import { supabase } from '@/lib/supabase';
import { Globe, TrendingUp, Sparkles, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const MarketSelectorModal = () => {
  const { setActiveMarket } = useMarket();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'username' | 'market'>('username');
  
  // Username state
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  // Market state
  const [isSavingMarket, setIsSavingMarket] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, preferred_market')
            .eq('id', session.session.user.id)
            .single();

          if (!error) {
            if (!data?.username) {
              setStep('username');
              setIsOpen(true);
            } else if (!data?.preferred_market) {
              setStep('market');
              setIsOpen(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || username.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    setIsSavingUsername(true);
    setUsernameError("");

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error("No active session");

      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', session.session.user.id);

      if (error) {
        if (error.code === '23505') { // Unique violation
          setUsernameError("Username is already taken. Try another.");
        } else {
          setUsernameError("Failed to save username.");
        }
        throw error;
      }

      localStorage.setItem("tradifive_cached_username", username);
      setStep('market');
    } catch (error) {
      console.error('Error saving username:', error);
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleSelectMarket = async (market: 'forex' | 'indian') => {
    setIsSavingMarket(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        await supabase
          .from('profiles')
          .update({ preferred_market: market })
          .eq('id', session.session.user.id);
      }
      
      setActiveMarket(market);
      setIsOpen(false);
      toast.success(`Welcome to the ${market === 'forex' ? 'Global' : 'Indian'} Market space!`);
    } catch (error) {
      console.error('Error saving market:', error);
      toast.error('Failed to save market preference.');
    } finally {
      setIsSavingMarket(false);
    }
  };

  if (isLoading || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Cinematic Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xl"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-[560px] bg-white dark:bg-[#0A0A0A] rounded-[32px] shadow-[0_0_80px_rgba(0,0,0,0.1)] dark:shadow-none border border-slate-200/50 dark:border-white/5 overflow-hidden"
        >
          {/* Subtle Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />

          {/* Header Step Indicators */}
          <div className="relative z-10 px-8 pt-8 pb-4 flex items-center justify-center gap-3">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 'username' ? 'w-12 bg-blue-500' : 'w-4 bg-slate-200 dark:bg-[#333]'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step === 'market' ? 'w-12 bg-blue-500' : 'w-4 bg-slate-200 dark:bg-[#333]'}`} />
          </div>

          <div className="relative z-10 p-8 pt-2">
            <AnimatePresence mode="wait">
              {step === 'username' ? (
                <motion.div
                  key="username-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 mb-6 border border-blue-100 dark:border-blue-500/20 shadow-inner">
                      <User className="w-7 h-7 text-blue-500" />
                    </div>
                    <h2 className="text-[28px] font-black text-slate-900 dark:text-white mb-3 tracking-tight">Claim Your Identity</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed max-w-[400px] mx-auto">
                      Choose a unique username for your TradiFive profile. This is how other traders will identify you in the community.
                    </p>
                  </div>

                  <form onSubmit={handleSaveUsername} className="space-y-6 max-w-[400px] mx-auto">
                    <div className="space-y-2">
                      <div className="relative flex items-center group">
                        <div className="absolute left-4 text-slate-400 font-bold group-focus-within:text-blue-500 transition-colors">@</div>
                        <input 
                          type="text" 
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                          placeholder="alexmorgan"
                          className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white pl-10 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-semibold text-lg placeholder:text-slate-300 dark:placeholder:text-[#444]"
                          autoFocus
                          maxLength={20}
                        />
                        {username.length > 2 && !usernameError && (
                          <div className="absolute right-4 text-green-500">
                            <CheckCircle2 size={20} />
                          </div>
                        )}
                      </div>
                      <AnimatePresence>
                        {usernameError && (
                          <motion.p 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-rose-500 text-sm font-semibold pl-2"
                          >
                            {usernameError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSavingUsername || username.length < 3}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black py-4 rounded-2xl font-bold text-[16px] transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-xl shadow-slate-900/10 dark:shadow-white/10"
                    >
                      {isSavingUsername ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="market-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 mb-6 border border-indigo-100 dark:border-indigo-500/20 shadow-inner">
                      <Sparkles className="w-7 h-7 text-indigo-500" />
                    </div>
                    <h2 className="text-[28px] font-black text-slate-900 dark:text-white mb-3 tracking-tight">Choose Your Arena</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed max-w-[400px] mx-auto">
                      Select your primary market to personalize your experience. Don't worry, you can always switch this later.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleSelectMarket('forex')}
                      disabled={isSavingMarket}
                      className="group relative flex flex-col items-center p-8 bg-white dark:bg-[#111] hover:bg-slate-50 dark:hover:bg-[#151515] border-2 border-slate-100 dark:border-white/5 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-[24px] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 dark:group-hover:from-indigo-500/10 transition-colors" />
                      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all duration-300">
                        <Globe className="w-8 h-8 text-indigo-500" />
                      </div>
                      <h3 className="text-[18px] font-black text-slate-900 dark:text-white mb-2">Global Markets</h3>
                      <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                        Forex, Crypto & Indices.<br/>MT4/MT5 Integration.
                      </p>
                    </button>

                    <button 
                      onClick={() => handleSelectMarket('indian')}
                      disabled={isSavingMarket}
                      className="group relative flex flex-col items-center p-8 bg-white dark:bg-[#111] hover:bg-slate-50 dark:hover:bg-[#151515] border-2 border-slate-100 dark:border-white/5 hover:border-orange-500 dark:hover:border-orange-500 rounded-[24px] transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 dark:group-hover:from-orange-500/10 transition-colors" />
                      <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-orange-100 dark:group-hover:bg-orange-500/20 transition-all duration-300">
                        <TrendingUp className="w-8 h-8 text-orange-500" />
                      </div>
                      <h3 className="text-[18px] font-black text-slate-900 dark:text-white mb-2">Indian Market</h3>
                      <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                        NSE, BSE & F&O.<br/>Dhan, Kite, Upstox.
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
