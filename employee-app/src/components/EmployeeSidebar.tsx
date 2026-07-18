import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEmployeeAuth } from "../contexts/EmployeeAuthContext";
import { LayoutDashboard, UserCircle, LogOut, Headphones, MessageSquare, Cpu, Wrench, ScanSearch, ShieldAlert, Activity, Target, ClipboardList, BarChart3, Users, Landmark, Receipt, Building2, CalendarDays, Radio, Flag, Megaphone, BookOpen, Crown } from "lucide-react";

export default function EmployeeSidebar() {
  const { adminUser, signOut } = useEmployeeAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/", icon: LayoutDashboard },
    { id: "my-tasks", label: "My Tasks", path: "/tasks", icon: ClipboardList },
    { id: "profile", label: "My Profile", path: "/profile", icon: UserCircle },
  ];

  // Natively mapped department tools (Currently only Sales is ported)
  const DEPARTMENT_PAGES: Record<string, { label: string, path: string, icon: any }[]> = {
    sales_executive: [
      { label: "Sales Dashboard", path: "/sales", icon: BarChart3 },
      { label: "Leads & Pipeline", path: "/sales/leads", icon: Users },
      { label: "Campaigns", path: "/sales/campaigns", icon: Megaphone }
    ]
  };

  const departmentLinks = adminUser?.role ? DEPARTMENT_PAGES[adminUser.role] : null;

  return (
    <aside className="w-[260px] h-screen bg-[#1E1E1E] border-r border-white/5 flex flex-col shrink-0 select-none p-4 relative z-[100]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-8 px-2 relative">
        <img
          src="/favicon.png"
          alt="Icon"
          className="h-6 w-auto object-contain drop-shadow-md"
        />
        <img
          src="/Dark mode logo with white.png"
          alt="Tradifive"
          className="h-[22px] w-auto object-contain mt-0.5 opacity-90"
        />
      </div>

      <div className="mb-4 px-2">
        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Employee Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto space-y-1 px-1 scrollbar-hide">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-none group relative z-20 cursor-pointer pointer-events-auto
                ${isActive
                  ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                  : "text-neutral-500 hover:text-neutral-300"
                }`}
            >
              <item.icon
                size={15}
                className={isActive ? "text-white" : "text-zinc-700 group-hover:text-zinc-500"}
              />
              <span className="flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}

        {departmentLinks && departmentLinks.length > 0 && (
          <>
            <div className="mt-8 mb-4 px-2 pt-4 border-t border-white/5">
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Department Tools</p>
            </div>
            
            {departmentLinks.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-none group cursor-pointer ${
                    isActive ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                  }`}
                >
                  <item.icon size={15} className={`transition-colors ${isActive ? "text-emerald-500" : "text-zinc-600 group-hover:text-emerald-500"}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User Session Profile */}
      <div className="mt-4 border-t border-white/5 pt-4 px-2">
        <div className="flex items-center gap-3 min-w-0 p-2 bg-white/[0.02] border border-white/5 rounded">
          <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white uppercase overflow-hidden shrink-0 shadow-lg bg-zinc-900">
            {adminUser?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-white truncate">{adminUser?.full_name || "Employee"}</p>
            <p className="text-[9px] text-neutral-600 truncate uppercase tracking-tighter">
              {adminUser?.role?.replace("_", " ") || "Staff Access"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-none"
        >
          <LogOut size={12} />
          Disconnect
        </button>
      </div>
    </aside>
  );
}
