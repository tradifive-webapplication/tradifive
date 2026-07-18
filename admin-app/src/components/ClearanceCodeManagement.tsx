import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { KeyRound, CheckCircle2, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { ROLE_LABELS, type AdminRole } from "../lib/rbac";

export default function ClearanceCodeManagement() {
  const { adminUser } = useAdminAuth();
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newRole, setNewRole] = useState<AdminRole>("employee");
  const [customCode, setCustomCode] = useState("");

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    const { data } = await supabase
      .from("signup_clearance_codes")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setCodes(data);
      setLoading(false);
    }
  };

  const generateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUser) return;
    
    // Security check: HR cannot generate CEO codes
    if (adminUser.role === "hr_manager" && newRole === "ceo") {
      toast.error("You do not have permission to generate CEO clearance codes.");
      return;
    }

    const codeToInsert = customCode.trim() || `TDF_${newRole.toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const { data, error } = await supabase
      .from("signup_clearance_codes")
      .insert({
        code: codeToInsert,
        assigned_role: newRole,
        created_by_email: adminUser.email,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      toast.error(error.message || "Failed to generate code");
    } else {
      toast.success("New Clearance Code Generated");
      setCodes([data, ...codes]);
      setIsCreating(false);
      setCustomCode("");
    }
  };

  const toggleRevoke = async (id: string, currentStatus: boolean, roleAssigned: string) => {
    // Security check: HR cannot revoke CEO codes
    if (adminUser?.role === "hr_manager" && roleAssigned === "ceo") {
      toast.error("You cannot modify a CEO clearance code.");
      return;
    }

    const newStatus = !currentStatus;
    const { error } = await supabase
      .from("signup_clearance_codes")
      .update({ is_active: newStatus })
      .eq("id", id);
      
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(newStatus ? "Code Restored" : "Code Revoked");
      setCodes(codes.map(c => c.id === id ? { ...c, is_active: newStatus } : c));
    }
  };

  const deleteCode = async (id: string, codeStr: string, roleAssigned: string) => {
    // Security check
    if (adminUser?.role === "hr_manager" && roleAssigned === "ceo") {
      toast.error("You cannot delete a CEO clearance code.");
      return;
    }

    if (!window.confirm(`PERMANENTLY DELETE code: ${codeStr}?\n\nThis cannot be undone.`)) return;
    
    const { error } = await supabase
      .from("signup_clearance_codes")
      .delete()
      .eq("id", id);
      
    if (error) {
      toast.error("Failed to delete code");
    } else {
      toast.success("Code Permanently Deleted");
      setCodes(codes.filter(c => c.id !== id));
    }
  };

  if (loading) return null;

  return (
    <div className="mt-8 bg-[#1A1A1A] border border-white/5 rounded-lg overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 to-blue-600"></div>
      
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KeyRound className="text-blue-500" size={16} />
          <div>
            <h2 className="text-white text-[12px] font-bold uppercase tracking-[0.2em]">Master Clearance Codes</h2>
            <p className="text-neutral-500 text-[10px] mt-0.5">Manage signup codes mapped to roles</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
        >
          <Plus size={12} /> New Code
        </button>
      </div>

      {isCreating && (
        <form onSubmit={generateCode} className="p-6 border-b border-white/5 bg-black/20 flex items-end gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Assign Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as AdminRole)}
              className="w-full bg-[#121212] border border-white/10 rounded-sm py-2 px-3 text-[11px] text-white focus:outline-none uppercase"
            >
              {Object.keys(ROLE_LABELS).map((role) => (
                <option key={role} value={role} disabled={adminUser?.role === "hr_manager" && role === "ceo"}>
                  {ROLE_LABELS[role as AdminRole]} {adminUser?.role === "hr_manager" && role === "ceo" ? "(Locked)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Custom Code (Optional)</label>
            <input
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.replace(/\s+/g, ''))}
              placeholder="Leave blank to auto-generate"
              className="w-full bg-[#121212] border border-white/10 rounded-sm py-2 px-3 text-[11px] text-white focus:outline-none uppercase font-mono"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest h-[34px]">
            Create Code
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#121212] border-b border-white/5">
              <th className="px-6 py-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Clearance Code</th>
              <th className="px-6 py-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Assigned Role</th>
              <th className="px-6 py-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {codes.map((code) => (
              <tr key={code.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className={`text-[12px] font-bold uppercase tracking-widest font-mono ${code.is_active ? "text-blue-400" : "text-neutral-500 line-through"}`}>
                    {code.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-neutral-300 uppercase">
                    {ROLE_LABELS[code.assigned_role as AdminRole] || code.assigned_role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {code.is_active ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full w-max">
                      <CheckCircle2 size={12} className="text-emerald-400" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-500/10 px-2 py-0.5 rounded-full w-max">
                      <X size={12} className="text-neutral-500" /> Revoked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleRevoke(code.id, code.is_active, code.assigned_role)}
                      className={`px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
                        code.is_active 
                          ? "bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white"
                          : "bg-emerald-900 hover:bg-emerald-800 text-emerald-400 hover:text-emerald-200"
                      }`}
                    >
                      {code.is_active ? "Revoke" : "Restore"}
                    </button>
                    <button
                      onClick={() => deleteCode(code.id, code.code, code.assigned_role)}
                      className="px-2 py-1.5 bg-red-900/20 hover:bg-red-900 text-red-500 hover:text-white rounded transition-colors"
                      title="Permanently Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {codes.length === 0 && (
          <div className="p-8 text-center text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
            No clearance codes found
          </div>
        )}
      </div>
    </div>
  );
}
