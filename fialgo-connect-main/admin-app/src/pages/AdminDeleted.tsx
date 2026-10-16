import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  Search, 
  UserX,
  UserCheck,
  Calendar,
  Mail,
  ScanEye
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDeleted() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDeletedUsers = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*').like('username', '[DELETED]%').order('created_at', { ascending: false });
    
    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to fetch deleted users");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, [searchTerm]);

  const handleRestoreUser = async (user: any) => {
    if (!window.confirm(`Are you sure you want to restore ${user.full_name || user.email}? They will regain full access to the platform.`)) return;
    
    // Remove the [DELETED] prefix
    const originalUsername = user.username.replace('[DELETED]_', '');

    const { error } = await supabase
      .from('profiles')
      .update({ 
          username: originalUsername,
          is_frozen: false,
          account_standing: 'GOOD'
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to restore user");
    } else {
      toast.success("User restored successfully");
      fetchDeletedUsers();
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Deleted Records</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Manage & Restore Soft-Deleted Accounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH DELETED..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1E1E1E] border border-white/5 rounded pl-9 pr-4 py-2 text-[10px] font-mono text-white outline-none focus:border-white/20 transition-all w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Trader Identity</th>
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Original ID</th>
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Date Joined</th>
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-right">Utility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-600 text-[10px] uppercase font-mono tracking-widest animate-pulse">
                  Scanning Archive...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                   <div className="flex flex-col items-center gap-3">
                     <UserX size={30} className="text-neutral-800" />
                     <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed"> No Deleted Traders Found </p>
                   </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded bg-[#121212] border border-red-500/50 text-red-500 shadow-lg shadow-red-500/10 flex items-center justify-center text-[10px] font-bold">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded opacity-50 grayscale" />
                        ) : (
                          user.full_name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-[11px] font-bold text-neutral-400 uppercase line-through">{user.full_name || 'No Name'}</p>
                           <ScanEye size={10} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-neutral-600 mt-0.5">
                          <Mail size={10} />
                          <span className="font-mono">{user.email || user.username}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-mono text-neutral-500 bg-[#121212] px-2 py-1 rounded border border-white/5">
                      {user.id.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-neutral-500">
                      <Calendar size={12} />
                      <span className="text-[9px] font-mono">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleRestoreUser(user)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 text-[9px] font-bold uppercase transition-all"
                      >
                        <UserCheck size={12} />
                        Restore Access
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
