import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  UserX,
  UserCheck,
  MoreHorizontal
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminDeleted() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchDeletedUsers = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*').like('username', '[DELETED]%');
    
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
    if (!window.confirm("Are you sure you want to restore this user? They will regain access to the platform.")) return;
    
    // Remove the [DELETED] prefix
    const originalUsername = user.username.replace('[DELETED]_', '');

    const { error } = await supabase
      .from('profiles')
      .update({ 
          username: originalUsername,
          is_banned: false
      })
      .eq('id', user.id);

    if (error) {
      toast.error("Failed to restore user");
    } else {
      toast.success("User restored successfully");
      fetchDeletedUsers();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <UserX className="text-rose-500" size={28} />
            Deleted Records
          </h1>
          <p className="text-slate-400 mt-2">Manage soft-deleted users and restore accounts if necessary.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <Input 
                placeholder="Search deleted users..." 
                className="pl-10 bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-rose-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Original ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date Joined</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                      Loading deleted records...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <UserX size={40} className="mx-auto text-slate-700 mb-3" />
                    No deleted users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <UserX size={18} className="text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user.full_name || 'No Name'}</p>
                          <p className="text-xs text-slate-500">{user.email || user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                        {user.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Dialog>
                          <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-300" onClick={() => setSelectedUser(user)}>
                                  <MoreHorizontal size={18} />
                              </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                              <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                      <UserX className="text-rose-500" size={20} />
                                      Manage Deleted User
                                  </DialogTitle>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                  <p className="text-sm text-slate-400">
                                      This user has been soft-deleted. Their data remains in the database, but they are blocked from logging in.
                                  </p>
                                  <Button 
                                      variant="outline" 
                                      className="w-full justify-start border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                      onClick={() => handleRestoreUser(user)}
                                  >
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Restore User Access
                                  </Button>
                              </div>
                          </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
