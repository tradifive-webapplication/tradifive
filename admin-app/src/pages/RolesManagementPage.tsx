import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { ROLE_LABELS, type AdminRole, DEPARTMENT_ORDER } from "../lib/rbac";
import { UserCog, Save, Building2, Circle } from "lucide-react";
import { createNotification } from "../lib/notifications";
import { logAdminAction } from "../lib/audit";
import DepartmentKeysManagement from "../components/DepartmentKeysManagement";
import ClearanceCodeManagement from "../components/ClearanceCodeManagement";

const formatLastSeen = (dateString: string | null) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 2) return "Online";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function RolesManagementPage() {
  const { adminUser, activeRole } = useAdminAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchAdmins = async (showLoading = true) => {
      if (showLoading) setLoading(true);
      const { data } = await supabase.from("admin_profiles").select("*").order("created_at", { ascending: true });
      if (isMounted) {
        setAdmins(data || []);
        setLoading(false);
      }
    };
    
    fetchAdmins();
    
    // Auto-refresh every 30 seconds for live online status
    const interval = setInterval(() => fetchAdmins(false), 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const canManageUser = (currentUser: any, targetUser: any) => {
    if (!currentUser) return false;
    if (currentUser.id === targetUser.id) return false; // Cannot edit self

    if (currentUser.role === "ceo") return true;

    if (currentUser.role === "hr_manager") {
      return targetUser.role !== "ceo"; // HR can manage anyone except CEO
    }

    // Department Heads can manage 'employees' who are either Unassigned or in their own department
    const isDeptHead = ["technical_lead", "risk_analyst", "operations_executive", "support_executive"].includes(currentUser.role);
    if (isDeptHead) {
      const targetDept = targetUser.department || "Unassigned";
      const isSubordinate = targetUser.role === "employee" || !targetUser.role;
      const isMyDept = targetDept === currentUser.department || targetDept === "Unassigned";
      
      if (isSubordinate && isMyDept) {
        return true;
      }
    }

    return false;
  };

  const updateRole = async (userId: string, newRole: string) => {
    const targetUser = admins.find(a => a.id === userId);
    if (!canManageUser(adminUser, targetUser)) return;
    
    const { error } = await supabase
      .from("admin_profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (!error) {
      setAdmins(prev => prev.map(a => a.id === userId ? { ...a, role: newRole } : a));
      
      await logAdminAction({
        adminId: activeRole || "admin",
        action: "UPDATE",
        targetId: userId,
        targetType: "admin_role",
        details: `Assigned role: ${newRole}`,
      });

      // Notify
      await createNotification({
        userId,
        type: "SECURITY",
        title: "Role Updated",
        message: `Your administrative role has been updated to ${newRole.toUpperCase()} by the CEO.`,
        priority: "high"
      });
    }
  };

  const updateDepartment = async (userId: string, newDept: string) => {
    const targetUser = admins.find(a => a.id === userId);
    if (!canManageUser(adminUser, targetUser)) return;
    
    const { error } = await supabase
      .from("admin_profiles")
      .update({ department: newDept })
      .eq("id", userId);

    if (!error) {
      setAdmins(prev => prev.map(a => a.id === userId ? { ...a, department: newDept } : a));
      
      await logAdminAction({
        adminId: activeRole || "admin",
        action: "UPDATE",
        targetId: userId,
        targetType: "admin_department",
        details: `Assigned department: ${newDept}`,
      });

      await createNotification({
        userId,
        type: "SYSTEM",
        title: "Department Assignment Updated",
        message: `You have been reassigned to the ${newDept.toUpperCase()} department.`,
        priority: "normal"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-widest text-white uppercase">Personnel</h1>
        <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">Access Control</p>
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <UserCog size={14} className="text-neutral-700" /> Admin Team ({admins.length})
          </h2>
        </div>
        <table className="w-full text-left whitespace-nowrap">
          <thead className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.2em] bg-white/[0.01] border-b border-white/5">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-5 py-3.5">Assigned Role</th>
              <th className="px-5 py-3.5">Department</th>
              <th className="px-5 py-3.5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-12 text-center text-neutral-700 text-[10px] uppercase tracking-widest">Scanning credentials...</td></tr>
            ) : admins.map(admin => (
              <tr key={admin.id} className="hover:bg-white/[0.01] transition-none group">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#121212] border border-white/5 flex items-center justify-center text-[10px] font-bold text-neutral-600">
                      {admin.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-neutral-300 uppercase">{admin.full_name || "Admin"}</p>
                      <p className="text-[9px] text-neutral-800 font-mono lower-case">{admin.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {canManageUser(adminUser, admin) ? (
                    <select
                      value={admin.role || "employee"}
                      onChange={(e) => updateRole(admin.id, e.target.value)}
                      className="bg-[#121212] border border-white/5 rounded px-2 py-1 text-[10px] text-white outline-none cursor-pointer uppercase tracking-widest font-bold text-neutral-500 hover:text-white transition-colors"
                    >
                      {Object.keys(ROLE_LABELS).map(role => (
                        <option key={role} value={role}>{ROLE_LABELS[role as AdminRole]}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      {ROLE_LABELS[admin.role as AdminRole] || admin.role?.replace(/_/g, " ")}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {canManageUser(adminUser, admin) ? (
                    <div className="flex items-center gap-2">
                      <Building2 size={12} className="text-neutral-600" />
                      <select
                        value={admin.department || "Unassigned"}
                        onChange={(e) => updateDepartment(admin.id, e.target.value)}
                        className="bg-[#121212] border border-white/5 rounded px-2 py-1 text-[10px] text-white outline-none cursor-pointer uppercase tracking-widest font-bold text-neutral-500 hover:text-white transition-colors"
                      >
                        <option value="Unassigned">Unassigned</option>
                        {DEPARTMENT_ORDER.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                      <Building2 size={12} className="text-neutral-600" />
                      {admin.department || "Unassigned"}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {formatLastSeen(admin.last_login_at) === "Online" ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Circle size={6} className="fill-emerald-400" />
                        Online
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono">
                        {admin.last_login_at ? formatLastSeen(admin.last_login_at) : "Never"}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClearanceCodeManagement />
      <DepartmentKeysManagement />
    </div>
  );
}
