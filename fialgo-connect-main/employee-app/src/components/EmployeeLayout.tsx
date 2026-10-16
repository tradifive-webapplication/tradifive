import { useLocation } from "react-router-dom";
import React from "react";
import { useEmployeeAuth } from "../contexts/EmployeeAuthContext";
import { Bell, ChevronRight } from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const { adminUser, signOut } = useEmployeeAuth();
  const location = useLocation();

  const pageName = location.pathname === "/" ? "My Workspace" : 
    location.pathname.substring(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex h-screen bg-[#121212] text-[#E5E5E5] overflow-hidden font-sans selection:bg-white/10">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - Stealth Minimal */}
        <header className="h-[56px] flex items-center justify-between px-8 bg-[#121212] border-b border-zinc-900/80 relative z-50">
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-neutral-700 font-bold uppercase tracking-widest text-[10px]">Terminal</span>
            <ChevronRight size={12} className="text-neutral-800" />
            <h2 className="text-[12px] font-bold text-white uppercase tracking-widest truncate">{pageName}</h2>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 text-neutral-500 hover:text-white hover:bg-white/[0.05] rounded transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Main Content Area - Full Matte Width */}
        <main className="flex-1 overflow-y-auto bg-[#121212] p-6">
          <div className="max-w-[1500px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
