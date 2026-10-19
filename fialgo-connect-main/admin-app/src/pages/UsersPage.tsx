import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import { Users, ShieldAlert, Search, Filter, Mail, Calendar, UserCheck, UserX, ScanEye, Ban, Trash2, BotOff } from "lucide-react";
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

  const handleRevokeAISetup = async (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const userName = user.full_name || user.email || "this user";
    if (!window.confirm(`Are you sure you want to revoke the AI Trading setup for ${userName}?\n\nThis will:\n1. Disconnect their MT5 trading account.\n2. Invalidate their activation license key.\n3. Wipe their AutoTrade configuration.\n\nThe user will be required to pay and set up a new account if they wish to reconnect.`)) {
      return;
    }

    try {
      // 1. Delete MT5 accounts for this user
      await supabase.from("mt5_accounts").delete().eq("user_id", user.id);

      // 2. Clear activation key in profiles
      await supabase.from("profiles").update({ activation_key: null }).eq("id", user.id);

      // 3. Delete any active IB proof requests for this user
      await supabase.from("ib_proof_requests").delete().eq("user_id", user.id);

      // 4. Remove approved license payment request if tracked in system_settings
      try {
        const { data: sysSet } = await supabase.from("system_settings").select("*").eq("id", "license_payment_requests").maybeSingle();
        if (sysSet?.value && Array.isArray(sysSet.value)) {
          const filtered = sysSet.value.filter((r: any) => r.user_id !== user.id && r.userId !== user.id);
          await supabase.from("system_settings").upsert({ id: "license_payment_requests", value: filtered });
        }
      } catch (ePay) {}

      // 5. Send notification to the user
      try {
        await createNotification(
          user.id,
          "SYSTEM",
          "AI Trading Setup Revoked",
          "Your AI Trading connection has been revoked by administration. To connect a new account, please visit the AI Trading Setup page and complete activation."
        );
      } catch (eNotif) {}

      // 6. Audit log
      try {
        await logAdminAction(
          "REVOKE_AI_TRADING_SETUP",
          user.id,
          { targetEmail: user.email, adminRole: activeRole }
        );
      } catch (eAudit) {}

      alert(`AI Trading setup successfully revoked for ${userName}. If the user logs in, they will be required to pay and connect a new account.`);
      fetchUsers();
    } catch (err: any) {
      console.error("Failed to revoke AI Trading setup:", err);
      alert(`Error revoking AI setup: ${err.message || err}`);
    }
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Surgical User Registry</h1>
          <p className="text-neutral-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Real-time individual account intervention & governance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH TRADERS..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#1E1E1E] border border-white/5 rounded pl-9 pr-4 py-2 text-[10px] font-mono text-white outline-none focus:border-white/20 transition-all w-64"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 border rounded transition-all ${showFilters ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-[#1E1E1E] border-white/5 text-neutral-500 hover:text-white'}`}
          >
            <Filter size={16} />
          </button>
          <button 
            onClick={handleCleanOrphanedData}
            className="p-2 bg-rose-500/10 border border-rose-500/20 rounded text-rose-500 hover:bg-rose-500/20 transition-all font-bold text-[10px] uppercase"
            title="Delete posts from deleted users"
          >
            Clean Orphaned Posts
          </button>
          <button 
            onClick={exportCSV}
            className="p-2 bg-[#1E1E1E] border border-white/5 rounded text-neutral-500 hover:text-emerald-400 transition-all text-[10px] uppercase font-bold"
            title="Export to CSV"
          >
            Export CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-[#1E1E1E] border border-white/5 rounded-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Subscription:</span>
            <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="bg-[#121212] border border-white/5 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-white/20">
              <option value="all">All</option>
              <option value="free">Free</option>
              <option value="trial">Pro Trial (7d)</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
              <option value="creator">Creator</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Status:</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-[#121212] border border-white/5 rounded px-2 py-1 text-[10px] text-white outline-none focus:border-white/20">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen/Banned</option>
            </select>
          </div>
        </div>
      )}

      <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Trader Identity</th>
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Subscription</th>
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Discipline</th>
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">XP / Streak</th>
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Linked Since</th>
              <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-right">Account Governance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-neutral-600 text-[10px] uppercase font-mono tracking-widest animate-pulse">Scanning Bio-Grid...</td></tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-20 text-center">
                   <div className="flex flex-col items-center gap-3">
                     <Users size={30} className="text-neutral-800" />
                     <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-widest leading-relaxed"> No Traders Detected in Sector </p>
                   </div>
                </td>
              </tr>
            ) : paginatedUsers.map(user => (
              <tr 
                key={user.id} 
                onClick={() => setSelectedUserId(user.id)}
                className="hover:bg-white/[0.01] cursor-pointer transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded bg-[#121212] border flex items-center justify-center text-[10px] font-bold transition-all ${user.is_frozen ? 'border-red-500/50 text-red-500 shadow-lg shadow-red-500/10' : 'border-white/5 text-neutral-400'}`}>
                      {user.full_name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="text-[11px] font-bold text-white uppercase">{user.full_name || "Unidentified Trader"}</p>
                         <ScanEye size={10} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-neutral-500 mt-0.5">
                        <Mail size={10} />
                        <span className="font-mono">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className={`inline-flex items-center px-2 py-0.5 rounded border ${
                    user.subscription_status === 'elite' ? 'bg-purple-500/10 border-purple-500/20 text-purple-500' :
                    user.subscription_status === 'pro' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                    user.subscription_status === 'trial' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  }`}>
                    <span className="text-[9px] font-bold uppercase tracking-tighter">
                      {user.subscription_status === 'trial' ? "Pro Trial (7d)" : (user.subscription_status || "Free")}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[11px] font-bold text-amber-500">Lvl {user.discipline_level || 1}</span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-neutral-400">{(user.xp || 0).toLocaleString()} XP</span>
                    {(user.streak_days || 0) > 0 && (
                      <span className="text-[9px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">{user.streak_days}d 🔥</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Calendar size={12} />
                    <span className="text-[9px] font-mono">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-6">
                    {(user.is_frozen || user.is_banned) && (
                      <div className="flex items-center gap-2 animate-pulse">
                         <ShieldAlert size={12} className="text-red-500" />
                         <span className="text-[8px] font-bold text-red-500 uppercase tracking-[0.2em]">Restricted</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 bg-[#121212] p-1 rounded-full border border-white/5">
                      <button 
                         onClick={(e) => handleRevokeAISetup(e, user)}
                         className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all hover:bg-amber-500/10 text-amber-500 border border-amber-500/20"
                         title="Revoke AI Trading setup (disconnects MT5 & requires user to pay to reconnect)"
                      >
                         <BotOff size={12} /> Revoke AI
                      </button>
                      <button 
                         onClick={(e) => handleDeleteUserContent(e, user.id)}
                         className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all hover:bg-rose-500/10 text-rose-500"
                         title="Wipe User Content"
                      >
                         <Trash2 size={12} /> Wipe
                      </button>
                      <button 
                         onClick={(e) => handleDeleteUser(e, user.id)}
                         className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all hover:bg-red-600/10 text-red-600"
                         title="Permanently Delete User"
                      >
                         <Ban size={12} /> Delete
                      </button>
                      <button 
                         onClick={(e) => toggleUserFreeze(e, user.id, (user.is_frozen || user.is_banned))}
                         className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${(user.is_frozen || user.is_banned) ? 'bg-red-500/10 text-red-500 shadow-inner shadow-red-500/20' : 'hover:bg-white/5 text-neutral-600'}`}
                      >
                         {(user.is_frozen || user.is_banned) ? <UserX size={12} /> : <UserCheck size={12} />}
                         {(user.is_frozen || user.is_banned) ? "Restore Account" : "Freeze Account"}
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-[#1E1E1E] border border-white/5 rounded p-4">
          <span className="text-[10px] font-mono text-neutral-500">
            Showing {totalCount > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, totalCount)} of {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-white/5 rounded text-[10px] font-bold text-white hover:bg-white/10 disabled:opacity-50"
            >
              PREV
            </button>
            <span className="text-[10px] font-bold text-neutral-400">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-white/5 rounded text-[10px] font-bold text-white hover:bg-white/10 disabled:opacity-50"
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
