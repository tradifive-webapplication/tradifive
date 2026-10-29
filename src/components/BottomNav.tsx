import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Category, Activity, Chat, User } from "react-iconly";
import { triggerHaptic } from "@/utils/haptics";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAutoTradeSetup =
    typeof window !== "undefined" &&
    localStorage.getItem("tradifive_auto_trade_setup") === "true";
  const autoTradePath = isAutoTradeSetup
    ? "/auto-trade/dashboard"
    : "/auto-trade/setup";

  const tabs = [
    {
      id: "home",
      label: "Home",
      path: "/home",
      isActive: (p: string) => p === "/" || p.startsWith("/home"),
      renderIcon: (active: boolean) => (
        <Home
          set={active ? "bold" : "curved"}
          primaryColor={active ? "#2563EB" : "currentColor"}
          size={22}
        />
      ),
    },
    {
      id: "autotrade",
      label: "AutoTrade",
      path: autoTradePath,
      isActive: (p: string) =>
        p.startsWith("/auto-trade") ||
        p.startsWith("/strategy") ||
        p.startsWith("/my-robots"),
      renderIcon: (active: boolean) => (
        <Activity
          set={active ? "bold" : "curved"}
          primaryColor={active ? "#2563EB" : "currentColor"}
          size={22}
        />
      ),
    },
    {
      id: "dashboard",
      label: "Terminal",
      path: "/dashboard",
      isActive: (p: string) =>
        p.startsWith("/dashboard") ||
        p.startsWith("/portfolio") ||
        p.startsWith("/broker-connect"),
      renderIcon: (active: boolean) => (
        <Category
          set={active ? "bold" : "curved"}
          primaryColor={active ? "#2563EB" : "currentColor"}
          size={22}
        />
      ),
    },
    {
      id: "profile",
      label: "Profile",
      path: "/profile",
      isActive: (p: string) =>
        p.startsWith("/profile") || p.startsWith("/settings"),
      renderIcon: (active: boolean) => (
        <User
          set={active ? "bold" : "curved"}
          primaryColor={active ? "#2563EB" : "currentColor"}
          size={22}
        />
      ),
    },
  ];

  const handleTabClick = (path: string) => {
    triggerHaptic("selection");
    navigate(path);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/92 dark:bg-[#111114]/92 backdrop-blur-2xl border-t border-slate-200/70 dark:border-white/[0.08] pb-[max(env(safe-area-inset-bottom),0.55rem)] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] select-none"
    >
      <div className="flex items-center justify-around px-3 max-w-md mx-auto">
        {tabs.map((tab) => {
          const active = tab.isActive(location.pathname);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 group cursor-pointer"
            >
              <div className="relative flex items-center justify-center">
                {active && (
                  <motion.div
                    layoutId="bottom-nav-active-pill"
                    className="absolute inset-0 -mx-3 -my-1 rounded-full bg-blue-500/10 dark:bg-blue-400/15"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={{ scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
                  transition={{ type: "spring", stiffness: 450, damping: 25 }}
                  className={`relative z-10 flex items-center justify-center h-6 transition-colors ${
                    active
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  }`}
                >
                  {tab.renderIcon(active)}
                </motion.div>
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 transition-all font-sans ${
                  active
                    ? "font-bold text-blue-600 dark:text-blue-400"
                    : "font-semibold text-slate-500 dark:text-zinc-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

