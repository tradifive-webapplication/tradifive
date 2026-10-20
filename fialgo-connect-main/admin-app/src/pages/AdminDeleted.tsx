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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-widest text-white uppercase">Deleted Records</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">
            Manage & Restore Soft-Deleted Accounts
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH DELETED..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1E1E1E] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono text-white outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#1E1E1E] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-500 text-[10px] uppercase font-mono tracking-widest animate-pulse">
            Scanning Archive...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <UserX size={30} className="text-neutral-700" />
            <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest">No Deleted Traders Found</p>
          </div>
        ) : (
          <>
            {/* Mobile Touch Cards */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-3.5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#121212] border border-red-500/50 text-red-500 shadow-lg shadow-red-500/10 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-lg opacity-50 grayscale" />
                        ) : (
                          user.full_name?.charAt(0) || "U"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-neutral-400 uppercase line-through truncate">{user.full_name || 'No Name'}</p>
                        <div className="flex items-center gap-1.5 text-[9px] text-neutral-500 mt-0.5 truncate">
                          <Mail size={10} className="shrink-0" />
                          <span className="font-mono truncate">{user.email || user.username}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <div>
                      <span className="text-[8px] text-neutral-500 uppercase tracking-wider block">Joined</span>
                      <span className="text-neutral-400 font-mono text-[9px]">{new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <button 
                      onClick={() => handleRestoreUser(user)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[9px] font-bold uppercase tracking-wider transition-all"
                    >
                      <UserCheck size={12} />
                      Restore Access
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                  {filteredUsers.map((user) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
