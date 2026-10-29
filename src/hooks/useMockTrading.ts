import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const PAIRS = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "BTCUSD", "AUDUSD", "NZDUSD", "USDCAD"];

export interface Trade {
  id: string;
  pair: string;
  lot: number;
  profit: number;
  time: string;
  type: "buy" | "sell";
}

export type SubType = "none" | "trial" | "beginner" | "intermediate" | "advanced";
export type LicStatus = "active" | "expiring" | "deleted";
export type AcctType = "demo" | "real";

export interface TerminalState {
  algoEngine: boolean;
  riskGuard: boolean;
  journal: boolean;
  competitions: boolean;
}

export interface TradingState {
  balance: number;
  equity: number;
  netProfit: number;
  isConnected: boolean;
  isAlgoRunning: boolean;
  trades: Trade[];
  heatmapData: number[];
  strategy: string | null;
  brokerConnected: boolean;
  licenseKey: string;

  // New Global States for Licensing
  userSubscription: SubType;
  licenseStatus: LicStatus;
  accountType: AcctType;
  daysRemaining: number;

  // Master EA Terminal State
  terminalState: TerminalState;
}

const generateTrade = (): Trade => ({
  id: Math.random().toString(36).slice(2, 9),
  pair: PAIRS[Math.floor(Math.random() * PAIRS.length)],
  lot: +(Math.random() * 0.5 + 0.01).toFixed(2),
  profit: +(Math.random() * 200 - 80).toFixed(2),
  time: new Date().toLocaleTimeString(),
  type: Math.random() > 0.5 ? "buy" : "sell",
});

const generateHeatmap = () =>
  Array.from({ length: 14 }, () => +(Math.random() * 400 - 150).toFixed(2));

export function useMockTrading() {
  const [state, setState] = useState<TradingState>({
    balance: 0,
    equity: 0,
    netProfit: 0,
    isConnected: false,
    isAlgoRunning: false,
    trades: [],
    heatmapData: [],
    strategy: null,
    brokerConnected: true,
    licenseKey: "FIALGO-" + Math.random().toString(36).slice(2, 10).toUpperCase(),

    // Default Licensing States
    userSubscription: "none",
    licenseStatus: "active",
    accountType: "demo",
    daysRemaining: 30, // Starts at 30

    // Master EA Default
    terminalState: {
      algoEngine: false,
      riskGuard: false,
      journal: false,
      competitions: false,
    },
  });

  // Watch for License Deletion logic
  useEffect(() => {
    if (state.daysRemaining <= 0 && state.licenseStatus !== "deleted") {
      setState(prev => ({
        ...prev,
        licenseStatus: "deleted",
        isAlgoRunning: false // Kill-switch
      }));
    } else if (state.daysRemaining <= 5 && state.daysRemaining > 0 && state.licenseStatus !== "expiring") {
      setState(prev => ({ ...prev, licenseStatus: "expiring" }));
    } else if (state.daysRemaining > 5 && state.licenseStatus !== "active") {
      setState(prev => ({ ...prev, licenseStatus: "active" }));
    }
  }, [state.daysRemaining, state.licenseStatus]);

  useEffect(() => {
    // Background simulation deactivated. 
    // Live trades are now exclusively driven by actual broker connection data.
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === "marketing@fialgo.com" || session?.user?.email === "nikilharake369@gmail.com") {
        setState(prev => ({
          ...prev,
          userSubscription: "advanced",
          brokerConnected: true,
          licenseStatus: "active"
        }));
      }
    };
    checkUser();

    // Listen for auth changes to dynamically update subscription level
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === "marketing@fialgo.com" || session?.user?.email === "nikilharake369@gmail.com") {
        setState(prev => ({
          ...prev,
          userSubscription: "advanced",
          brokerConnected: true,
          licenseStatus: "active"
        }));
      } else if (!session) {
        setState(prev => ({
          ...prev,
          userSubscription: "none"
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleAlgo = useCallback(() => {
    setState((p) => ({ ...p, isAlgoRunning: !p.isAlgoRunning }));
  }, []);

  const setSubscription = useCallback((sub: SubType, acc: AcctType) => {
    setState((p) => ({
      ...p,
      userSubscription: sub,
      accountType: sub === "trial" ? "demo" : acc,
      daysRemaining: sub === "trial" ? 7 : 30,
      licenseStatus: "active",
      licenseKey: "FIALGO-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
      brokerConnected: true
    }));
  }, []);

  const connectDemo = useCallback((broker: string) => {
    setState((p) => ({
      ...p,
      isConnected: true,
      brokerConnected: true,
      balance: 500,
      equity: 500,
      netProfit: 0,
      trades: [],
      userSubscription: "trial",
      daysRemaining: 7,
      licenseStatus: "active"
    }));
  }, []);

  const topUp = useCallback((amount: number) => {
    setState((p) => ({
      ...p,
      balance: +(p.balance + amount).toFixed(2),
      equity: +(p.equity + amount).toFixed(2),
    }));
  }, []);

  const reactivateLicense = useCallback(() => {
    setState((p) => ({
      ...p,
      daysRemaining: 30,
      licenseStatus: "active",
      licenseKey: "FIALGO-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    }));
  }, []);

  // Exposed for demo purposes to simulate passage of time
  const decreaseDays = useCallback(() => {
    setState((p) => ({ ...p, daysRemaining: Math.max(0, p.daysRemaining - 5) }));
  }, []);

  const updateTerminalMode = useCallback((mode: keyof TerminalState) => {
    setState(prev => {
      const currentTerminal = prev.terminalState;
      const newState = { ...currentTerminal, [mode]: !currentTerminal[mode] };

      let finalized: TerminalState;

      // Logic Rule 1: Algo Engine ON -> Others OFF
      if (mode === 'algoEngine' && newState.algoEngine) {
        finalized = {
          algoEngine: true,
          riskGuard: false,
          journal: false,
          competitions: false,
        };
      }
      // Logic Rule 2: Risk Guard ON -> Journal ON, Algo Engine OFF
      else if (mode === 'riskGuard' && newState.riskGuard) {
        finalized = {
          ...newState,
          journal: true,
          algoEngine: false,
        };
      }
      // Logic Rule 3: Competitions ON -> Algo OFF, Risk & Journal ON
      else if (mode === 'competitions' && newState.competitions) {
        finalized = {
          ...newState,
          algoEngine: false,
          riskGuard: true,
          journal: true,
        };
      }
      // General Toggle (Ensure Algo OFF if anything else is turned ON)
      else if (mode !== 'algoEngine' && newState[mode]) {
        finalized = { ...newState, algoEngine: false };
      }
      else {
        finalized = newState;
      }

      return { ...prev, terminalState: finalized };
    });
  }, []);

  return { ...state, toggleAlgo, setSubscription, reactivateLicense, decreaseDays, connectDemo, topUp, updateTerminalMode };
}
