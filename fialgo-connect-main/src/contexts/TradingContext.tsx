import React, { createContext, useContext } from "react";
import { useMockTrading } from "@/hooks/useMockTrading";

type TradingContextType = ReturnType<typeof useMockTrading>;

const TradingContext = createContext<TradingContextType | null>(null);

export const TradingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trading = useMockTrading();
  return <TradingContext.Provider value={trading}>{children}</TradingContext.Provider>;
};

export function useTrading() {
  const ctx = useContext(TradingContext);
  if (!ctx) throw new Error("useTrading must be inside TradingProvider");
  return ctx;
}
