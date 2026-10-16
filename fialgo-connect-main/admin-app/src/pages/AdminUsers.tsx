import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Search,
  Filter,
  MoreHorizontal,
  Ban,
  RefreshCcw,
  User,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Mail,
  CalendarCheck
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

const UserInspectorDialog = ({ user, onBanUser, onUpdateStanding }: any) => {
  const [standing, setStanding] = useState(user.account_standing || 'GOOD');
  const [message, setMessage] = useState(user.standing_message || '');

  return (
    <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-[440px] rounded-[2rem]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3 text-xl font-bold">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <User className="text-blue-500" size={18} />
          </div>
          User Inspector
        </DialogTitle>
      </DialogHeader>

      <div className="py-6 space-y-6">
        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 text-center">
          <p className="text-sm font-bold text-white mb-1">{user.full_name || user.email}</p>
          <p className="text-xs text-slate-500 font-mono mb-4">{user.id}</p>
          <div className="flex items-center justify-center gap-4">
            <div className="px-3 py-1 bg-slate-800/50 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level: {user.plan_type || 'Basic'}</div>
            <div className="px-3 py-1 bg-blue-500/10 rounded-lg text-[10px] font-bold text-blue-400 uppercase tracking-widest">{user.subscription_status}</div>
          </div>
        </div>

        <div className="space-y-4 px-1">
           <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">Account Standing</p>
           <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Standing Level</label>
              <select 
                 value={standing} 
                 onChange={e => setStanding(e.target.value)}
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                 <option value="GOOD">Good Standing</option>
                 <option value="WARNING">Warning</option>
                 <option value="RESTRICTED">Restricted</option>
                 <option value="BANNED">Banned</option>
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium">Message to User</label>
              <textarea 
                 value={message} 
                 onChange={e => setMessage(e.target.value)}
                 placeholder="Enter a custom warning or restriction message..."
                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-24"
              />
           </div>
           <Button 
              onClick={() => onUpdateStanding(user.id, standing, message)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-5 shadow-sm"
           >
              Update Account Standing
           </Button>
        </div>

        <div className="space-y-3 px-1">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-2">Advanced Actions</p>
          <Button variant="outline" className="w-full justify-start border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800 rounded-xl py-6">
            <RefreshCcw className="mr-3 h-5 w-5 text-blue-500" />
            Flush MT5 Account Data
          </Button>
          <Button
            variant="destructive"
            className="w-full justify-start bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl py-6"
            onClick={() => onBanUser(user.id, user.is_banned)}
          >
            <Ban className="mr-3 h-5 w-5" />
            {user.is_banned ? 'Restore User Privileges' : 'Terminate User Access'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*');
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

  const handleBanUser = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase.rpc('admin_ban_user', {
      target_user_id: userId,
      ban_status: !currentStatus
    });
    if (error) {
      console.error(error);
      toast.error("Update failed");
    }
    else {
      toast.success(currentStatus ? "User access restored" : "User banned from platform");
      fetchUsers();
    }
  };

  const handleUpdateStanding = async (userId: string, newStanding: string, newMessage: string) => {
    const { error } = await supabase.from('profiles').update({ 
       account_standing: newStanding, 
       standing_message: newMessage,
       is_banned: newStanding === 'BANNED' 
    }).eq('id', userId);
    
    if (error) toast.error("Update failed");
    else {
      toast.success("Account standing updated successfully");
      fetchUsers();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">User Management</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Client Base Control</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={16} />
            <Input
              placeholder="Search master database..."
              className="bg-slate-900/50 border-slate-800 pl-10 w-[240px] rounded-xl focus:ring-blue-500/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white rounded-xl">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] bg-black/20 border-b border-slate-800">
              <tr>
                <th className="px-8 py-5">User Identity</th>
                <th className="px-6 py-5">Security Status</th>
                <th className="px-6 py-5">Joined Station</th>
                <th className="px-6 py-5">Last Connection</th>
                <th className="px-8 py-5 text-right">Utility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-500/5 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 text-slate-500 font-bold group-hover:border-blue-500/50 transition-all">
                        {user.full_name?.charAt(0).toUpperCase() || <Mail size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200">{user.full_name || "Anonymous User"}</p>
                        <p className="text-[11px] text-slate-500 font-mono italic">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {user.is_banned ? (
                      <span className="flex items-center gap-2 text-rose-500 text-[10px] font-bold uppercase tracking-wider bg-rose-500/5 px-2.5 py-1 rounded-full border border-rose-500/10 w-fit">
                        <ShieldAlert size={12} />
                        Blacklisted
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10 w-fit">
                        <ShieldCheck size={12} />
                        Authorized
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CalendarCheck size={14} className="text-slate-600" />
                      <span className="text-xs font-medium">
                        {new Date(user.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className={user.last_login_at ? "text-blue-500" : "text-slate-700"} />
                      <span className="text-xs font-medium text-slate-400">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
                          : "Never Sign-in"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl" onClick={() => setSelectedUser(user)}>
                          <MoreHorizontal size={18} />
                        </Button>
                      </DialogTrigger>
                      <UserInspectorDialog user={user} onBanUser={handleBanUser} onUpdateStanding={handleUpdateStanding} />
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
