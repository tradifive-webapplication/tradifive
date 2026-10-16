import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { Users, ShieldAlert, Search, Filter, Mail, Calendar, UserCheck, UserX, ScanEye, Ban, Trash2 } from "lucide-react";
import UserDeepScan from "../components/UserDeepScan";
import { createNotification } from "../lib/notifications";
import { logAdminAction } from "../lib/audit";

export default function UsersPage() {
  const { activeRole } = useAdminAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // New States
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterSub, setFilterSub] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterSub, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .not('username', 'like', '[DELETED]%')
        .order("created_at", { ascending: false });
        
      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }
      if (filterSub !== "all") {
        query = query.eq('subscription_status', filterSub);
      }
      if (filterStatus === "frozen") {
        query = query.or(`is_frozen.eq.true,is_banned.eq.true`);
      } else if (filterStatus === "active") {
        query = query.eq('is_frozen', false).eq('is_banned', false);
      }

      // Pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);
      
      const { data, count, error } = await query;
      
      if (error) {
        console.error("CRITICAL: User Sync Failed:", error.message, error.details);
      } else {
        if (data) setUsers(data);
        if (count !== null) setTotalCount(count);
      }
    } catch (err) {
      console.error("Unknown Boot Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const debouncedRealtimeFetch = () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = setTimeout(() => {
        fetchUsers();
      }, 2000);
    };

    const channel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, debouncedRealtimeFetch)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    };
  }, [page, debouncedSearch, filterSub, filterStatus, itemsPerPage]);

  const toggleUserFreeze = async (e: React.MouseEvent, userId: string, currentStatus: boolean) => {
    e.stopPropagation();
    const newStatus = !currentStatus;
    
    setUsers(users.map(u => u.id === userId ? { ...u, is_banned: newStatus, is_frozen: newStatus } : u));

    const { error } = await supabase.rpc('admin_ban_user', {
      target_user_id: userId,
      ban_status: newStatus
    });

    if (error) {
      console.error(error);
      setUsers(users.map(u => u.id === userId ? { ...u, is_banned: currentStatus, is_frozen: currentStatus } : u));
    } else {
      await logAdminAction({
        adminId: activeRole || "admin",
        action: newStatus ? "FREEZE" : "UNFREEZE",
        targetId: userId,
        targetType: "user",
        details: newStatus ? "Account frozen" : "Account unfrozen",
      });
      await createNotification({
        userId,
        type: 'SECURITY',
        title: newStatus ? 'Account Access Restricted' : 'Account Access Restored',
        message: newStatus 
          ? 'Your account has been frozen by the compliance department. Please check your email for details.' 
          : 'Security review complete. Your account access has been fully restored.',
        priority: 'high'
      });
    }
  };
  const handleDeleteUserContent = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to completely wipe this user's social content (posts, comments, likes)? This action cannot be undone.")) return;

    try {
        await supabase.from('social_posts').delete().eq('user_id', userId);
        await supabase.from('social_post_likes').delete().eq('user_id', userId);
        
        await logAdminAction({
          adminId: activeRole || "admin",
          action: "DELETE",
          targetId: userId,
          targetType: "user_content",
          details: "User social content wiped",
        });

        await createNotification({
            userId,
            type: 'SECURITY',
            title: 'Content Removed',
            message: 'Your social content has been permanently removed by an admin due to a violation of our community guidelines.',
            priority: 'high'
        });
        
        alert("User's social content has been permanently deleted.");
    } catch (err) {
        alert("Failed to delete user content.");
    }
  };

  const handleDeleteUser = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    const confirmName = prompt("Type 'DELETE' to confirm permanent soft-deletion of this user account. This cannot be undone.");
    if (confirmName !== "DELETE") return;

    try {
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
      if (error) throw error;
      
      // Update local UI state to remove the user from list since query filters out '[DELETED]%'
      setUsers(users.filter(u => u.id !== userId));
      
      await logAdminAction({
        adminId: activeRole || "admin",
        action: "DELETE",
        targetId: userId,
        targetType: "user",
        details: "User account permanently soft-deleted",
      });

      alert("User account has been successfully deleted.");
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete user account: " + err.message);
    }
  };

  const handleCleanOrphanedData = async () => {
    if (!window.confirm("Are you sure you want to scan and delete all posts and likes from users that no longer exist?")) return;

    try {
        // Fetch all current user IDs from profiles
        const { data: profiles, error: profileErr } = await supabase.from('profiles').select('id');
        if (profileErr) throw profileErr;
        
        const validUserIds = profiles.map(p => p.id);

        if (validUserIds.length === 0) {
            alert("No profiles found. Aborting to prevent accidental mass deletion.");
            return;
        }

        // Delete posts where user_id is not in validUserIds
        // Supabase JS doesn't have a simple 'not in' for an array of 1000s of IDs easily without hitting URL length limits.
        // It's safer to fetch posts, find orphans, and delete them in batches.
        const { data: posts } = await supabase.from('social_posts').select('id, user_id');
        if (posts) {
            const orphanedPostIds = posts.filter(p => !validUserIds.includes(p.user_id)).map(p => p.id);
            if (orphanedPostIds.length > 0) {
                // Delete in chunks of 100 to avoid limits
                for (let i = 0; i < orphanedPostIds.length; i += 100) {
                    const chunk = orphanedPostIds.slice(i, i + 100);
                    await supabase.from('social_posts').delete().in('id', chunk);
                }
            }
            alert(`Successfully deleted ${orphanedPostIds.length} orphaned posts/stories.`);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to clean orphaned data.");
    }
  };
  const exportCSV = () => {
    const headers = ["ID", "Full Name", "Email", "Subscription", "Discipline", "XP", "Frozen", "Banned", "Created At"];
    const csvContent = [
      headers.join(","),
      ...users.map(u => [
        u.id, `"${u.full_name || ""}"`, u.email, u.subscription_status, u.discipline_level, u.xp, u.is_frozen, u.is_banned, u.created_at
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "tradifive_users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;
  const paginatedUsers = users;

  return (
    <div className="space-y-6">
      {selectedUserId && (
        <UserDeepScan 
          userId={selectedUserId} 
          onClose={() => {
             setSelectedUserId(null);
             fetchUsers(); // Refresh when closed to reflect any changes
          }} 
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Surgical User Registry</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time individual account intervention, identity dossiers & compliance governance
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <div className="relative flex-1 sm:flex-none min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
            <input 
              type="text" 
              placeholder="Search traders by name, email, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full sm:w-64 bg-[#1C1C20] border border-white/[0.08] focus:border-blue-500/60 rounded-lg pl-9 pr-4 text-xs text-neutral-200 placeholder-neutral-500 outline-none transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-10 w-10 border rounded-lg flex items-center justify-center transition-all ${showFilters ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'bg-[#1C1C20] border-white/[0.08] text-neutral-400 hover:text-white'}`}
            title="Toggle Filter Options"
          >
            <Filter size={15} />
          </button>
          <button 
            onClick={handleCleanOrphanedData}
            className="h-10 px-3.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-all font-semibold text-xs shrink-0"
            title="Delete posts from deleted users"
          >
            Clean Posts
          </button>
          <button 
            onClick={exportCSV}
            className="h-10 px-3.5 bg-[#1C1C20] border border-white/[0.08] hover:border-white/20 rounded-lg text-neutral-200 hover:text-emerald-400 transition-all text-xs font-semibold shrink-0"
            title="Export to CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-[#161618] border border-white/[0.08] rounded-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400">Subscription:</span>
            <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="h-9 bg-[#1C1C20] border border-white/[0.08] rounded-lg px-3 text-xs text-neutral-200 outline-none focus:border-blue-500/60">
              <option value="all">All Subscriptions</option>
              <option value="free">Free</option>
              <option value="trial">Pro Trial (7d)</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
              <option value="creator">Creator</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-400">Status:</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-9 bg-[#1C1C20] border border-white/[0.08] rounded-lg px-3 text-xs text-neutral-200 outline-none focus:border-blue-500/60">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="frozen">Frozen / Restricted</option>
            </select>
          </div>
        </div>
      )}

      <div className="bg-[#161618] border border-white/[0.08] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/[0.08]">
              <th className="p-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Trader Identity</th>
              <th className="p-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Subscription</th>
              <th className="p-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Discipline</th>
              <th className="p-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">XP / Streak</th>
              <th className="p-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Linked Since</th>
              <th className="p-4 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider text-right">Account Governance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr><td colSpan={6} className="p-12 text-center text-neutral-400 text-xs animate-pulse">Loading trader accounts...</td></tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-16 text-center">
                   <div className="flex flex-col items-center gap-2.5">
                     <Users size={28} className="text-neutral-600" />
                     <p className="text-neutral-400 text-xs font-medium">No traders match your search criteria</p>
                   </div>
                </td>
              </tr>
            ) : paginatedUsers.map(user => (
              <tr 
                key={user.id} 
                onClick={() => setSelectedUserId(user.id)}
                className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${user.is_frozen ? 'bg-red-500/10 border border-red-500/40 text-red-400 shadow-sm' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'}`}>
                      {user.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                         <p className="text-xs font-semibold text-white">{user.full_name || "Unidentified Trader"}</p>
                         <ScanEye size={12} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                    user.subscription_status === 'elite' ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' :
                    user.subscription_status === 'pro' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                    user.subscription_status === 'trial' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                    'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  }`}>
                    {user.subscription_status === 'trial' ? "Pro Trial (7d)" : (user.subscription_status || "Free")}
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-xs font-semibold text-amber-400">Lvl {user.discipline_level || 1}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-300">{(user.xp || 0).toLocaleString()} XP</span>
                    {(user.streak_days || 0) > 0 && (
                      <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">{user.streak_days}d 🔥</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Calendar size={13} className="text-neutral-500" />
                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {(user.is_frozen || user.is_banned) && (
                      <div className="flex items-center gap-1.5 animate-pulse">
                         <ShieldAlert size={13} className="text-red-400" />
                         <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">Restricted</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 bg-[#1C1C20] p-1 rounded-lg border border-white/[0.08]" onClick={(e) => e.stopPropagation()}>
                      <button 
                         onClick={(e) => handleDeleteUserContent(e, user.id)}
                         className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all hover:bg-rose-500/15 text-rose-400"
                         title="Wipe User Content"
                      >
                         <Trash2 size={12} /> Wipe
                      </button>
                      <button 
                         onClick={(e) => handleDeleteUser(e, user.id)}
                         className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all hover:bg-red-600/15 text-red-400"
                         title="Permanently Delete User"
                      >
                         <Ban size={12} /> Delete
                      </button>
                      <button 
                         onClick={(e) => toggleUserFreeze(e, user.id, (user.is_frozen || user.is_banned))}
                         className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${(user.is_frozen || user.is_banned) ? 'bg-red-500/20 text-red-400' : 'hover:bg-white/5 text-neutral-300'}`}
                      >
                         {(user.is_frozen || user.is_banned) ? <UserX size={12} /> : <UserCheck size={12} />}
                         {(user.is_frozen || user.is_banned) ? "Restore" : "Freeze"}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#161618] border border-white/[0.08] rounded-xl p-4">
          <span className="text-xs text-neutral-400">
            Showing {totalCount > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-8 px-3 bg-[#1C1C20] hover:bg-[#25252B] border border-white/[0.08] rounded-lg text-xs font-semibold text-neutral-200 disabled:opacity-40 transition-all"
            >
              PREV
            </button>
            <span className="text-xs font-semibold text-neutral-300">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 px-3 bg-[#1C1C20] hover:bg-[#25252B] border border-white/[0.08] rounded-lg text-xs font-semibold text-neutral-200 disabled:opacity-40 transition-all"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
