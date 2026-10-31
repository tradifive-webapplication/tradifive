import { LayoutDashboard, Users, UserX, CreditCard, Activity, LifeBuoy, Terminal, LogOut, ChevronLeft, ClipboardList, Bot, Receipt } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import fialgoLogo from "@/assets/fialgo-logo.png";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const adminMenu = [
  { path: "/admin/overview", icon: LayoutDashboard, label: "Overview" },
  { path: "/admin/auto-trade", icon: Bot, label: "Auto Trade & Licenses" },
  { path: "/admin/settlements", icon: Receipt, label: "Weekly Settlements" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/deleted", icon: UserX, label: "Deleted Records" },
  { path: "/admin/finance", icon: CreditCard, label: "Subscriptions" },
  { path: "/admin/waitlist", icon: ClipboardList, label: "Waitlist" },
  { path: "/admin/trading", icon: Activity, label: "Trading Engine" },
  { path: "/admin/support", icon: LifeBuoy, label: "Support" },
  { path: "/admin/logs", icon: Terminal, label: "System Logs" },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowLogoutConfirm(true);
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    setIsLoggingOut(false);
    navigate("/");
  };

  return (
    <aside className="relative z-40 flex h-full w-[260px] flex-col overflow-hidden bg-slate-950 border-r border-slate-800">
      <div className="flex flex-col h-full overflow-y-auto">
        {/* Logo Section */}
        <div className="flex h-[80px] w-full items-center justify-start px-8 border-b border-slate-900 mt-2 shrink-0">
          <img
            src={fialgoLogo}
            alt="Fialgo Admin"
            className="h-14 object-contain invert"
          />
        </div>

        {/* Back to User Dashboard */}
        <div className="px-4 py-4">
            <button 
                onClick={() => navigate("/journal")}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-blue-300 transition-colors bg-blue-500/10 rounded-lg w-full"
            >
                <ChevronLeft size={14} />
                Back to Dashboard
            </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 px-4 space-y-2">
          <p className="px-4 text-[10px] font-bold tracking-widest text-slate-500 mb-4 uppercase">
            Admin Panel
          </p>
          <nav className="space-y-1">
            {adminMenu.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 px-6 py-3 text-[14px] transition-all duration-200 relative group rounded-xl ${
                    active
                      ? "bg-white/10 text-slate-300 font-bold border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                  )}
                  <item.icon 
                    size={18} 
                    className={`transition-colors duration-200 ${active ? "text-slate-200" : "text-slate-500 group-hover:text-slate-300"}`} 
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 mt-auto border-t border-slate-900">
          <button 
            onClick={handleLogoutClick}
            className="flex w-full items-center gap-3 px-6 py-3 text-[14px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all rounded-xl"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <LogOut className="text-red-500" size={24} />
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-slate-400 mt-2 text-sm">
              Are you sure you want to log out of the admin panel?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <button 
              type="button" 
              onClick={() => setShowLogoutConfirm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors shadow-md flex items-center justify-center min-w-[100px]"
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Log Out"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}


