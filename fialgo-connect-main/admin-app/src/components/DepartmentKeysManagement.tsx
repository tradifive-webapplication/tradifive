import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { KeyRound, Circle, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DEPARTMENT_ORDER } from "../lib/rbac";

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

export default function DepartmentKeysManagement() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newDept, setNewDept] = useState(DEPARTMENT_ORDER[0]);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchKeys = async () => {
      const { data } = await supabase
        .from("department_access_keys")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (isMounted && data) {
        setKeys(data);
        setLoading(false);
      }
    };

    fetchKeys();
    const interval = setInterval(fetchKeys, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const generateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel) return;
    
    // Format: TDF-DEPT-1234
    const deptPrefix = newDept.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    const randomNums = Math.floor(1000 + Math.random() * 9000);
    const keyCode = `TDF-${deptPrefix}-${randomNums}`;

    const { data, error } = await supabase
      .from("department_access_keys")
      .insert({
        key_code: keyCode,
        department: newDept,
        label: newLabel,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to generate key");
    } else {
      toast.success("New Department Key Generated");
      setKeys([data, ...keys]);
      setIsCreating(false);
      setNewLabel("");
    }
  };

  const revokeKey = async (id: string, keyCode: string) => {
    if (!window.confirm(`REVOKE KEY: ${keyCode}?\n\nUsers trying to log in with this key will be blocked.`)) return;
    
    const { error } = await supabase
      .from("department_access_keys")
      .update({ is_active: false })
      .eq("id", id);
      
    if (error) {
      toast.error("Failed to revoke key");
    } else {
      toast.success("Key Revoked.");
      setKeys(keys.map(k => k.id === id ? { ...k, is_active: false } : k));
    }
  };

  if (loading) return null;

  return (
    <div className="mt-12 bg-[#1A1A1A] border border-white/5 rounded-lg overflow-hidden relative shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 to-red-600"></div>
      
      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KeyRound className="text-red-500" size={16} />
          <div>
            <h2 className="text-white text-[12px] font-bold uppercase tracking-[0.2em]">Master Dept Keys</h2>
            <p className="text-neutral-500 text-[10px] mt-0.5">Manage 2FA secret access codes for departments</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5"
        >
          <Plus size={12} /> New Key
        </button>
      </div>

      {isCreating && (
        <form onSubmit={generateKey} className="p-6 border-b border-white/5 bg-black/20 flex items-end gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Department</label>
            <select
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-sm py-2 px-3 text-[11px] text-white focus:outline-none uppercase"
            >
              {DEPARTMENT_ORDER.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Holder Identity / Label</label>
            <input
              required
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. HR Manager / Navin"
              className="w-full bg-[#121212] border border-white/10 rounded-sm py-2 px-3 text-[11px] text-white focus:outline-none uppercase"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-sm text-[10px] font-bold uppercase tracking-widest h-[34px]">
            Generate Code
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#121212] border-b border-white/5">
              <th className="px-6 py-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Key Code</th>
              <th className="px-6 py-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Identity / Label</th>
              <th className="px-6 py-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Status / Last Used</th>
              <th className="px-6 py-3 text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {keys.map((key) => (
              <tr key={key.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <span className="text-[12px] font-bold text-red-400 uppercase tracking-widest font-mono">
                    {key.key_code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center text-[10px] text-white font-bold border border-white/10 uppercase">
                      {key.department.substring(0, 2)}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-neutral-300 uppercase">{key.label}</p>
                      <p className="text-[9px] text-neutral-500 uppercase tracking-widest">DEPT: {key.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {key.is_active ? (
                    <div className="flex items-center gap-1.5">
                      {formatLastSeen(key.last_used_at) === "Online" ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Circle size={6} className="fill-emerald-400" />
                          Online
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                          Active ({formatLastSeen(key.last_used_at)})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1">
                      <X size={10} /> Revoked
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {key.is_active && (
                    <button
                      onClick={() => revokeKey(key.id, key.key_code)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded text-[9px] font-bold uppercase tracking-widest transition-all"
                    >
                      Revoke
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!window.confirm(`PERMANENTLY DELETE key: ${key.key_code}?\n\nThis cannot be undone.`)) return;
                      const { error } = await supabase.from("department_access_keys").delete().eq("id", key.id);
                      if (error) toast.error("Failed to delete key");
                      else {
                        toast.success("Key deleted permanently.");
                        setKeys(keys.filter(k => k.id !== key.id));
                      }
                    }}
                    className="ml-2 px-2 py-1.5 bg-neutral-900 hover:bg-red-900 text-neutral-500 hover:text-white rounded transition-colors"
                    title="Permanently Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {keys.length === 0 && (
          <div className="p-8 text-center text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
            No active department keys found
          </div>
        )}
      </div>
    </div>
  );
}
