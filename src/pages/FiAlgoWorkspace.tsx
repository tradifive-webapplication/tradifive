import React, { useEffect, useState } from "react";
import AutoTradeDashboardPage from "./AutoTradeDashboardPage";
import AITrading from "./AITrading";

export default function FiAlgoWorkspace() {
  const [isSetup, setIsSetup] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem("tradifive_auto_trade_setup") === "true";
  });

  useEffect(() => {
    const handleSetupDone = () => {
      setIsSetup(localStorage.getItem("tradifive_auto_trade_setup") === "true");
    };
    window.addEventListener("tradifive_auto_trade_setup_done", handleSetupDone);
    window.addEventListener("storage", handleSetupDone);
    return () => {
      window.removeEventListener("tradifive_auto_trade_setup_done", handleSetupDone);
      window.removeEventListener("storage", handleSetupDone);
    };
  }, []);

  if (isSetup) {
    return <AutoTradeDashboardPage />;
  }

  return <AITrading />;
}
