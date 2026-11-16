import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import FiAlgoAdminSidebar from "./FiAlgoAdminSidebar";
import FiAlgoAdminTopbar from "./FiAlgoAdminTopbar";
import { LayoutDashboard, Bot, Activity, FileText, Settings } from "lucide-react";

export default function FiAlgoLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Enforce white mode strictly in FiAlgo Workspace
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 overflow-hidden font-sans selection:bg-purple-100">
      {/* Desktop Persistent Sidebar & Mobile Drawer */}
      <FiAlgoAdminSidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar matching AdminLayout */}
        <FiAlgoAdminTopbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Content Area - Full Matte Width & Proper Mobile Fit (Light/White Mode) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#F8FAFC] p-3.5 sm:p-5 md:p-6 pb-24 lg:pb-6">
          <div className="max-w-[1500px] mx-auto w-full min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock (Modeled directly after AdminLayout.tsx mobile dock) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <Link
          to="/fialgo"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            location.pathname === "/fialgo"
              ? "text-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <LayoutDashboard size={18} />
          <span className="text-[9px] uppercase tracking-wider mt-0.5">Overview</span>
        </Link>

        <Link
          to="/auto-trade/dashboard"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors relative ${
            location.pathname.startsWith("/auto-trade/dashboard")
              ? "text-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Bot size={18} />
          <span className="text-[9px] uppercase tracking-wider mt-0.5">Terminal</span>
          <span className="absolute top-0 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </Link>

        <Link
          to="/auto-trade/active-bots"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            location.pathname.startsWith("/auto-trade/active-bots")
              ? "text-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity size={18} />
          <span className="text-[9px] uppercase tracking-wider mt-0.5">Bots</span>
        </Link>

        <Link
          to="/auto-trade/history"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            location.pathname.startsWith("/auto-trade/history")
              ? "text-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText size={18} />
          <span className="text-[9px] uppercase tracking-wider mt-0.5">Orders</span>
        </Link>

        <Link
          to="/auto-trade/license"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            location.pathname.startsWith("/auto-trade/license")
              ? "text-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Settings size={18} />
          <span className="text-[9px] uppercase tracking-wider mt-0.5">License</span>
        </Link>
      </nav>
    </div>
  );
}
