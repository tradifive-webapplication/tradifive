import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FiAlgoWorkspaceLoader from "@/components/FiAlgoWorkspaceLoader";

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
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initialize from URL or localStorage
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.pathname.startsWith("/fialgo") ||
        window.location.pathname.startsWith("/auto-trade") ||
        window.location.pathname.startsWith("/strategy-builder") ||
        window.location.pathname.startsWith("/weekly-settlements")
      ) {
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
    if (
      location.pathname.startsWith("/fialgo") ||
      location.pathname.startsWith("/auto-trade") ||
      location.pathname.startsWith("/strategy-builder") ||
      location.pathname.startsWith("/weekly-settlements")
    ) {
      setActiveWorkspace("fialgo");
      // FiAlgo Workspace runs in Dark/Black Mode matching Admin App
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("tradifive_theme", "dark");
        localStorage.setItem("theme", "dark");
        localStorage.setItem(WORKSPACE_STORAGE_KEY, "fialgo");
      } catch (e) {}
    } else if (
      location.pathname === "/home" ||
      location.pathname.startsWith("/journal") ||
      location.pathname.startsWith("/channel") ||
      location.pathname.startsWith("/competitions") ||
      location.pathname.startsWith("/creator") ||
      location.pathname.startsWith("/ai-coach") ||
      location.pathname.startsWith("/discover") ||
      location.pathname.startsWith("/settings") ||
      location.pathname.startsWith("/risk-guard")
    ) {
      setActiveWorkspace("tradifive");
      try {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, "tradifive");
      } catch (e) {}
    }
  }, [location.pathname]);

  const switchWorkspace = (workspace: WorkspaceType) => {
    if (workspace === "fialgo") {
      // Enter Dark / Black Mode like admin app
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("tradifive_theme", "dark");
        localStorage.setItem("theme", "dark");
        localStorage.setItem(WORKSPACE_STORAGE_KEY, "fialgo");
      } catch (e) {}

      setIsTransitioning(true);
    } else {
      setActiveWorkspace("tradifive");
      try {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, "tradifive");
      } catch (e) {}
      navigate("/home");
    }
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
    setActiveWorkspace("fialgo");
    navigate("/fialgo");
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
      {isTransitioning && (
        <FiAlgoWorkspaceLoader onComplete={handleTransitionComplete} />
      )}
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
          window.location.href = ws === "fialgo" ? "/fialgo" : "/home";
        }
      },
      isFiAlgo,
      isTradiFive: !isFiAlgo,
    };
  }
  return context;
};
