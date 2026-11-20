import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type WorkspaceType = "tradifive" | "fialgo";

interface WorkspaceContextType {
  activeWorkspace: WorkspaceType;
  switchWorkspace: (workspace: WorkspaceType) => void;
  isFiAlgo: boolean;
  isTradiFive: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const WORKSPACE_STORAGE_KEY = "tradifive_active_workspace";

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isFiAlgoPath = (p: string) => {
    return (
      p.startsWith("/fialgo") ||
      p.startsWith("/auto-trade") ||
      p.startsWith("/strategy-builder") ||
      p.startsWith("/weekly-settlements") ||
      p.startsWith("/license") ||
      p.startsWith("/activation") ||
      p.startsWith("/ai-trading")
    );
  };

  // Initialize from URL or localStorage
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(() => {
    if (typeof window !== "undefined") {
      if (isFiAlgoPath(window.location.pathname)) {
        return "fialgo";
      }
      const saved = localStorage.getItem(WORKSPACE_STORAGE_KEY) as WorkspaceType;
      if (saved === "fialgo" || saved === "tradifive") {
        return saved;
      }
    }
    return "tradifive";
  });

  // Sync active workspace whenever route changes and maintain proper theme
  useEffect(() => {
    const isFiAlgo = isFiAlgoPath(location.pathname);

    if (isFiAlgo) {
      setActiveWorkspace("fialgo");
      try {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, "fialgo");
      } catch (e) {}
    } else {
      setActiveWorkspace("tradifive");
      try {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, "tradifive");
      } catch (e) {}
    }
  }, [location.pathname]);

  const switchWorkspace = (workspace: WorkspaceType) => {
    if (workspace === "fialgo") {
      try {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, "fialgo");
      } catch (e) {}
      setActiveWorkspace("fialgo");
      try {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme !== "dark") {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {}
      const isSetup =
        typeof window !== "undefined" &&
        localStorage.getItem("tradifive_auto_trade_setup") === "true";
      navigate(isSetup ? "/auto-trade/dashboard" : "/auto-trade/setup");
    } else {
      try {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, "tradifive");
      } catch (e) {}
      setActiveWorkspace("tradifive");
      navigate("/dashboard");
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        activeWorkspace,
        switchWorkspace,
        isFiAlgo: activeWorkspace === "fialgo",
        isTradiFive: activeWorkspace === "tradifive",
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    // Graceful fallback if used outside provider
    const isFiAlgo = typeof window !== "undefined" && (window.location.pathname.startsWith("/fialgo") || localStorage.getItem(WORKSPACE_STORAGE_KEY) === "fialgo");
    return {
      activeWorkspace: (isFiAlgo ? "fialgo" : "tradifive") as WorkspaceType,
      switchWorkspace: (ws: WorkspaceType) => {
        try { localStorage.setItem(WORKSPACE_STORAGE_KEY, ws); } catch (e) {}
        if (typeof window !== "undefined") {
          window.location.href = ws === "fialgo" ? "/auto-trade/dashboard" : "/dashboard";
        }
      },
      isFiAlgo,
      isTradiFive: !isFiAlgo,
    };
  }
  return context;
};
