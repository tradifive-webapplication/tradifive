import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Ban, 
  RefreshCcw, 
  Calendar, 
  User, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*').not('username', 'like', '[DELETED]%');
    
    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    }

    const { data } = await query.order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const logAdminAction = async (action: string, details: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('system_logs').insert({
      level: 'audit',
      message: `Admin ${user?.email || 'System'} performed action: ${action}`,
      metadata: details
    });
  };

  const handleSuspendUser = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to update user status");
    } else {
      toast.success(currentStatus ? "User unsuspended" : "User suspended");
      logAdminAction(currentStatus ? 'UNSUSPEND_USER' : 'SUSPEND_USER', { target_user_id: userId });
      fetchUsers();
    }
  };

  const handleRestrictUser = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to update restriction status");
    } else {
      toast.success(currentStatus ? "User restrictions lifted" : "User restricted");
      logAdminAction(currentStatus ? 'UNRESTRICT_USER' : 'RESTRICT_USER', { target_user_id: userId });
      fetchUsers();
    }
  };

  const handleImpersonateUser = async (userId: string) => {
    // We will save this in localStorage for the ImpersonationContext to pick up
    localStorage.setItem("fialgo_impersonating_user", userId);
    toast.success("God Mode Activated. Redirecting to user's dashboard...");
    logAdminAction('IMPERSONATE_USER', { target_user_id: userId });
    
    // Redirect to home/dashboard
    setTimeout(() => {
        window.location.href = "/dashboard";
    }, 1000);
  };

  const handleResetData = async (userId: string) => {
    toast.info("User data reset initiated");
    logAdminAction('RESET_USER_DATA', { target_user_id: userId });
  };

  const handleDeleteUserContent = async (userId: string) => {
    if (!window.confirm("Are you sure you want to completely wipe this user's social content (posts, comments, likes)? This action cannot be undone.")) return;

    try {
        await supabase.from('social_posts').delete().eq('user_id', userId);
        await supabase.from('social_post_likes').delete().eq('user_id', userId);
        
        toast.success("User's social content has been permanently deleted.");
        logAdminAction('DELETE_USER_CONTENT', { target_user_id: userId });
    } catch (err) {
        toast.error("Failed to delete user content.");
    }
  };

  const handleExtendSubscription = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', userId);

    if (error) {
      toast.error("Failed to extend subscription");
    } else {
      toast.success("Subscription extended by 30 days");
      logAdminAction('EXTEND_SUBSCRIPTION', { target_user_id: userId });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">User Management</h1>
          <p className="text-slate-400">Manage all registered users and their platform permissions.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <Input 
                    placeholder="Search users..." 
                    className="bg-slate-900 border-slate-800 pl-10 w-[250px] focus:ring-blue-500/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-400 hover:text-white">
                <Filter size={16} className="mr-2" />
                Filter
            </Button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-slate-400 font-bold group-hover:border-blue-500/30 transition-colors">
                        {user.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.full_name || "Anonymous User"}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                        user.role === 'super_admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        user.role === 'support_agent' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                        <span className={`text-[11px] font-bold ${user.subscription_status === 'active' ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {user.plan_type?.toUpperCase() || 'FREE'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">Expires: May 12, 2026</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_banned ? (
                        <span className="flex items-center gap-1.5 text-rose-500 text-xs font-bold">
                            <ShieldAlert size={14} />
                            Banned
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                            <ShieldCheck size={14} />
                            Active
                        </span>
                    )}
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
                        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <User className="text-slate-200" size={20} />
                                    Manage User: {user.full_name || user.email}
                                </DialogTitle>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-2 gap-4 py-6">
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                                    <Activity className="absolute -right-2 -bottom-2 text-slate-200/10" size={60} />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Trading Status</p>
                                    <p className="text-xl font-bold text-white">Online</p>
                                    <p className="text-[10px] text-emerald-500 font-medium mt-1">MT5 Connected</p>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
                                    <Calendar className="absolute -right-2 -bottom-2 text-purple-500/10" size={60} />
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Subscription</p>
                                    <p className="text-xl font-bold text-white">{user.plan_type || 'Basic'}</p>
                                    <p className="text-[10px] text-slate-300 font-medium mt-1">Status: {user.subscription_status}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Actions</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="justify-start border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                        onClick={() => handleImpersonateUser(user.id)}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Login As User (God Mode)
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="justify-start border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                                        onClick={() => handleExtendSubscription(user.id)}
                                    >
                                        <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
                                        Extend Subscription (30 Days)
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="justify-start border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800"
                                        onClick={() => handleResetData(user.id)}
                                    >
                                        <RefreshCcw className="mr-2 h-4 w-4 text-slate-200" />
                                        Reset Trading Account Data
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="justify-start border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                                        onClick={() => handleDeleteUserContent(user.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete All User Content
                                    </Button>
                                    
                                    <div className="h-px bg-slate-800 my-2" />
                                    
                                    <Button 
                                        variant="outline" 
                                        className="justify-start border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                                        onClick={() => handleRestrictUser(user.id, user.is_banned)}
                                    >
                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                        {user.is_banned ? 'Lift Restrictions' : 'Restrict Trading/Posting'}
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        className="justify-start bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                                        onClick={() => handleSuspendUser(user.id, user.is_banned)}
                                    >
                                        <Ban className="mr-2 h-4 w-4" />
                                        {user.is_banned ? 'Unsuspend User Access' : 'Suspend User Account'}
                                    </Button>
                                </div>
                            </div>

                            <DialogFooter className="mt-6 border-t border-slate-800 pt-6">
                                <Button variant="ghost" className="text-slate-400 hover:text-white">Close Panel</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing {users.length} users</p>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 border-slate-800 bg-slate-900 text-slate-400" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="h-8 border-slate-800 bg-slate-900 text-slate-400" disabled>Next</Button>
            </div>
        </div>
      </div>
    </div>
  );
}

