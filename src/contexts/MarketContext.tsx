import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Globe, Activity } from 'lucide-react';

export type MarketType = 'forex' | 'indian';

interface MarketContextType {
  activeMarket: MarketType;
  setActiveMarket: (market: MarketType) => void;
  isLoading: boolean;
  isSwitching: boolean;
  finishSwitching: () => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMarket, setActiveMarket] = useState<MarketType>('forex');
  const [isLoading, setIsLoading] = useState(true);
  const [isDataSwitching, setIsDataSwitching] = useState(false);
  const [isAnimationRunning, setIsAnimationRunning] = useState(false);

  const isSwitching = isDataSwitching || isAnimationRunning;

  useEffect(() => {
    const fetchUserMarket = async () => {
      setIsLoading(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session?.session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('preferred_market')
            .eq('id', session.session.user.id)
            .single();

          if (!error && data?.preferred_market) {
            if (data.preferred_market === 'forex' || data.preferred_market === 'indian') {
              setActiveMarket(data.preferred_market as MarketType);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching market preference', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserMarket();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          fetchUserMarket();
        } else if (event === 'SIGNED_OUT') {
          setActiveMarket('forex');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const finishSwitching = () => {
    setIsDataSwitching(false);
  };

  const handleSetActiveMarket = async (market: MarketType) => {
    if (market === activeMarket) return;
    
    setIsDataSwitching(true);
    setIsAnimationRunning(true);
    setActiveMarket(market);
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        await supabase
          .from('profiles')
          .update({ preferred_market: market })
          .eq('id', session.session.user.id);
      }
    } catch (error) {
      console.error('Failed to save market preference', error);
      toast.error('Failed to save market preference');
    }

    // Fallback timeout in case finishSwitching isn't called by a data-fetching hook like useHomeData
    const isHome = window.location.pathname === '/';
    setTimeout(() => {
      setIsDataSwitching(false);
    }, isHome ? 10000 : 5000);
  };

  return (
    <MarketContext.Provider value={{ activeMarket, setActiveMarket: handleSetActiveMarket, isLoading, isSwitching, finishSwitching }}>
      {children}
      <AnimatePresence>
        {isSwitching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[99999] bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center select-none font-sans w-screen h-screen"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="w-full max-w-[300px] flex flex-col items-center justify-center"
            >
              {/* Up: Title */}
              <p className="text-[9px] text-slate-400 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mb-8 text-center px-4 leading-relaxed">
                SWITCHING CONTEXT
              </p>

              {/* Middle: Loading Bar */}
              <div className="relative w-full">
                {/* The Bar Track */}
                <div className="w-full h-2 bg-slate-100 dark:bg-[#1E1E1E] border border-slate-200/50 dark:border-white/5 rounded-full overflow-hidden">
                  {/* Progress Fill */}
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "22%", "22%", "58%", "58%", "82%", "82%", "100%"] }}
                    transition={{ 
                      duration: 4.5, 
                      times: [0, 0.15, 0.35, 0.45, 0.7, 0.8, 0.9, 1],
                      ease: "easeInOut" 
                    }}
                    onAnimationComplete={() => {
                      setIsAnimationRunning(false);
                    }}
                  />
                </div>
              </div>

              {/* Down: Status text */}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-[0.15em] uppercase mt-5 animate-[fadeInUp_0.4s_ease-out] text-center animate-pulse">
                {activeMarket === 'indian' ? 'Connecting to NSE/BSE endpoints...' : 'Establishing Global Forex relays...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
