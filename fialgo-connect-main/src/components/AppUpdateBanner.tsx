import React, { useEffect, useState, useCallback, useRef } from "react";
import { RefreshCw, X } from "lucide-react";

declare const __APP_BUILD_VERSION__: string;

const CURRENT_VERSION =
  typeof __APP_BUILD_VERSION__ !== "undefined" ? __APP_BUILD_VERSION__ : "dev";

export const AppUpdateBanner: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [reloading, setReloading] = useState(false);
  const dismissedVersionRef = useRef<string | null>(null);

  const checkForUpdate = useCallback(async () => {
    // Only poll in production builds (skip local dev HMR)
    if (!import.meta.env.PROD || CURRENT_VERSION === "dev") return;
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!res.ok) return;
      const data = await res.json();
      const latestVersion = data?.version ? String(data.version) : null;
      if (
        latestVersion &&
        latestVersion !== CURRENT_VERSION &&
        dismissedVersionRef.current !== latestVersion
      ) {
        setUpdateAvailable(true);
      }
    } catch {
      // Ignore transient offline/network failures
    }
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || CURRENT_VERSION === "dev") return;

    // Initial check shortly after mount, then periodic polling every 45s
    const initialTimer = window.setTimeout(checkForUpdate, 10_000);
    const interval = window.setInterval(checkForUpdate, 45_000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkForUpdate();
      }
    };

    const handlePreloadError = () => {
      setUpdateAvailable(true);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", checkForUpdate);
    window.addEventListener("vite:preloadError", handlePreloadError);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", checkForUpdate);
      window.removeEventListener("vite:preloadError", handlePreloadError);
    };
  }, [checkForUpdate]);

  const handleReload = async () => {
    setReloading(true);
    try {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
    } catch {
      // Ignore cache clear failures
    }
    window.location.reload();
  };

  const handleDismiss = async () => {
    setUpdateAvailable(false);
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data?.version) dismissedVersionRef.current = String(data.version);
      }
    } catch {
      // Ignore
    }
  };

  if (!updateAvailable) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[calc(max(0.75rem,env(safe-area-inset-bottom))+5.1rem)] sm:bottom-6 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[calc(100vw-1.5rem)]"
    >
      <div className="bg-white dark:bg-[#1E1E22] rounded-[18px] pl-4 pr-2.5 py-2 figma-card-shadow border border-black/[0.06] dark:border-white/10 flex items-center gap-3 whitespace-nowrap">
        <span className="text-[13.5px] font-medium text-slate-800 dark:text-slate-100 tracking-tight">
          TradiFive has been updated.
        </span>

        <button
          type="button"
          onClick={handleReload}
          disabled={reloading}
          className="tactile-white-pill rounded-full px-3.5 py-1.5 text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer select-none disabled:opacity-60"
        >
          <RefreshCw
            size={13}
            strokeWidth={2.2}
            className={reloading ? "animate-spin" : ""}
          />
          <span>{reloading ? "Reloading..." : "Reload"}</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Dismiss update notification"
          title="Dismiss"
        >
          <X size={15} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
};

export default AppUpdateBanner;
