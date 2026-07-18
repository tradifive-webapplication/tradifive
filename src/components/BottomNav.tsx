import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Discovery, Activity, User } from "react-iconly";

const tabs = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/discover", icon: Discovery, label: "Discover" },
  { path: "/ai-coach", icon: Activity, label: "Coach" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 dark:bg-[#121212]/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-white/5 pb-safe">
      <div className="flex items-center justify-around px-2 py-3">
        {tabs.map((tab) => {
          const active = location.pathname.startsWith(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center gap-1 px-4 py-1"
            >
              <motion.div
                animate={{ scale: active ? 1.15 : 1, y: active ? -2 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <tab.icon
                  set={active ? "bold" : "curved"}
                  primaryColor={active ? "#4f46e5" : "#64748b"}
                  size={24}
                />
              </motion.div>
              <span
                className={`text-[10px] font-bold tracking-wide transition-colors ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"
                  }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
