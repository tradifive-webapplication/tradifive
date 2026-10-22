import { useState, useEffect } from "react";
import { 
  Search, ShieldAlert, Check, Trash2, AlertTriangle, Loader2, 
  Ban, UserX, UserCheck, MessageSquare, Heart, RefreshCw, FileText
} from "lucide-react";
import { supabase } from "../lib/supabase";

interface FlagItem {
  id: string;
  reporter_id: string;
  content_id: string;
  content_type: string;
  reason: string;
  details?: string;
  status: "pending" | "resolved";
  created_at: string;
  profiles?: { full_name?: string };
}

interface SocialPostItem {
  id: string;
  user_id: string;
  content: string;
  media_url?: string;
  media_urls?: string[];
  symbol?: string;
  like_count?: number;
  comment_count?: number;
  created_at: string;
  profiles?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
    is_frozen?: boolean;
    is_banned?: boolean;
    email?: string;
  };
}

interface SuspendedUserItem {
  id: string;
  full_name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  is_frozen: boolean;
  is_banned: boolean;
  created_at: string;
}

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState<"posts" | "flags" | "suspended">("posts");
  const [loading, setLoading] = useState(true);
  
  // Tab 1: Flags state
  const [flags, setFlags] = useState<FlagItem[]>([]);
  const [flagFilter, setFlagFilter] = useState<"pending" | "resolved">("pending");

  // Tab 2: All Community Posts state
  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [postSearch, setPostSearch] = useState("");

  // Tab 3: Suspended Users state
  const [suspendedUsers, setSuspendedUsers] = useState<SuspendedUserItem[]>([]);

  useEffect(() => {
    if (activeTab === "flags") fetchFlags();
    else if (activeTab === "posts") fetchPosts();
    else if (activeTab === "suspended") fetchSuspendedUsers();
  }, [activeTab, flagFilter]);

  // Fetch flagged queue
  const fetchFlags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('moderation_flags')
        .select(`*, profiles:reporter_id (full_name)`)
        .eq('status', flagFilter)
        .order('created_at', { ascending: false });
        
      if (!error && data) setFlags(data);
      else setFlags([]);
    } catch (err) {
      console.error("Error fetching flags:", err);
      setFlags([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all community posts with author profiles
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          id, user_id, content, media_url, media_urls, symbol, like_count, comment_count, created_at,
          profiles:user_id (id, full_name, username, avatar_url, is_frozen, is_banned, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setPosts(data as any[]);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all suspended users
  const fetchSuspendedUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, email, avatar_url, is_frozen, is_banned, created_at')
        .or('is_frozen.eq.true,is_banned.eq.true')
        .order('created_at', { ascending: false });

      if (!error && data) setSuspendedUsers(data as SuspendedUserItem[]);
      else setSuspendedUsers([]);
    } catch (err) {
      console.error("Error fetching suspended users:", err);
      setSuspendedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Action: Delete Single Post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Permanently delete this post and its comments/likes? This cannot be undone.")) return;
    try {
      await supabase.from('social_post_likes').delete().eq('post_id', postId);
      const { error } = await supabase.from('social_posts').delete().eq('id', postId);
      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== postId));
      alert("Post has been removed successfully.");
    } catch (err: any) {
      alert("Failed to delete post: " + (err.message || err));
    }
  };

  // Action: Suspend User (Freeze / Ban)
  const handleToggleSuspendUser = async (userId: string, currentSuspended: boolean) => {
    const actionWord = currentSuspended ? "restore access for" : "suspend and freeze";
    if (!window.confirm(`Are you sure you want to ${actionWord} this trader?`)) return;

    try {
      const newStatus = !currentSuspended;
      const { error } = await supabase.rpc('admin_ban_user', {
        target_user_id: userId,
        ban_status: newStatus
      });
      if (error) throw error;

      alert(`Trader has been successfully ${newStatus ? 'suspended' : 'restored'}.`);
      if (activeTab === "posts") fetchPosts();
      else if (activeTab === "suspended") fetchSuspendedUsers();
    } catch (err: any) {
      alert("Failed to update user status: " + (err.message || err));
    }
  };

  // Action: Purge User & All Data (Permanent Nuclear Option)
  const handlePurgeUserAndData = async (userId: string, traderName?: string) => {
    const name = traderName || "this user";
    const confirmText = prompt(`⚠️ NUCLEAR INTERVENTION: This will wipe ALL data (trades, posts, comments, MT5 accounts, direct messages) and PERMANENTLY delete ${name}.\n\nType 'PURGE' to execute:`);
    if (confirmText !== "PURGE") return;

    try {
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId });
      if (error) throw error;

      alert(`Trader ${name} and all associated data have been completely purged.`);
      if (activeTab === "posts") fetchPosts();
      else if (activeTab === "suspended") fetchSuspendedUsers();
    } catch (err: any) {
      alert("Failed to purge user: " + (err.message || err));
    }
  };

  // Action: Resolve Flag
  const resolveFlag = async (flag: FlagItem, action: 'approve' | 'delete') => {
    try {
      if (action === 'delete' && flag.content_id) {
        await supabase.from('social_posts').delete().eq('id', flag.content_id);
      }
      await supabase.from('moderation_flags').update({ status: 'resolved' }).eq('id', flag.id);
      setFlags(prev => prev.filter(f => f.id !== flag.id));
      alert(action === 'delete' ? "Content removed and report resolved." : "Report dismissed.");
    } catch (err: any) {
      alert("Error resolving flag: " + (err.message || err));
    }
  };

  // Filter posts by search
  const filteredPosts = posts.filter(p => {
    if (!postSearch.trim()) return true;
    const term = postSearch.toLowerCase();
    const contentMatch = p.content?.toLowerCase().includes(term);
    const authorMatch = p.profiles?.full_name?.toLowerCase().includes(term) || p.profiles?.username?.toLowerCase().includes(term);
    const symbolMatch = p.symbol?.toLowerCase().includes(term);
    return contentMatch || authorMatch || symbolMatch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">Content &amp; User Moderation</h1>
          <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            Community Integrity, Anti-Spam &amp; Account Enforcement
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === "posts") fetchPosts();
            else if (activeTab === "flags") fetchFlags();
            else if (activeTab === "suspended") fetchSuspendedUsers();
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1E1E] hover:bg-white/5 border border-white/5 rounded text-neutral-400 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={12} className={loading ? "animate-spin text-blue-500" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
        <button 
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 cursor-pointer ${
            activeTab === 'posts' ? 'text-white border-blue-500 bg-white/[0.02]' : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <FileText size={12} />
          All Community Posts
          <span className="ml-1.5 bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-mono">{posts.length}</span>
        </button>

        <button 
          onClick={() => setActiveTab("flags")}
          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 cursor-pointer ${
            activeTab === 'flags' ? 'text-white border-blue-500 bg-white/[0.02]' : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <AlertTriangle size={12} />
          Flagged Reports
          {flags.filter(f => f.status === 'pending').length > 0 && (
            <span className="ml-1.5 bg-rose-500 text-white px-1.5 py-0.5 rounded text-[8px] font-mono">
              {flags.filter(f => f.status === 'pending').length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab("suspended")}
          className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors border-b-2 cursor-pointer ${
            activeTab === 'suspended' ? 'text-white border-blue-500 bg-white/[0.02]' : 'text-neutral-500 border-transparent hover:text-neutral-300'
          }`}
        >
          <Ban size={12} />
          Suspended Users
          {suspendedUsers.length > 0 && (
            <span className="ml-1.5 bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[8px] font-mono">{suspendedUsers.length}</span>
          )}
        </button>
      </div>

      {/* ── TAB 1: ALL COMMUNITY POSTS ── */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
              <input 
                type="text" 
                placeholder="Search posts by text, author, or symbol..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="w-full bg-[#1E1E1E] border border-white/5 rounded pl-9 pr-4 py-2 text-[11px] font-mono text-white outline-none focus:border-white/20 transition-all placeholder:text-neutral-600"
              />
            </div>
            <span className="text-[10px] font-mono text-neutral-500">
              Showing {filteredPosts.length} posts
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 size={24} className="text-blue-500 animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-[#1E1E1E] border border-white/5 rounded p-12 flex flex-col items-center justify-center text-center">
              <MessageSquare size={32} className="text-neutral-700 mb-3" />
              <p className="text-white text-sm font-bold">No Community Posts Found</p>
              <p className="text-neutral-500 text-[11px] mt-1 max-w-sm">
                {postSearch ? `No posts match "${postSearch}".` : "Community feed is completely clear for the beta launch."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredPosts.map(post => {
                const author = post.profiles;
                const isAuthorSuspended = author?.is_frozen || author?.is_banned;
                return (
                  <div key={post.id} className="bg-[#1E1E1E] border border-white/5 hover:border-white/10 rounded p-4 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#121212] border border-white/5 overflow-hidden flex items-center justify-center text-xs font-bold text-neutral-300 shrink-0">
                          {author?.avatar_url ? (
                            <img src={author.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            author?.full_name?.charAt(0) || "U"
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">{author?.full_name || "Anonymous Trader"}</span>
                            {author?.username && (
                              <span className="text-[10px] font-mono text-neutral-500">@{author.username}</span>
                            )}
                            {isAuthorSuspended && (
                              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                Suspended
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-mono text-neutral-600">
                            {new Date(post.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {post.symbol && (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0">
                          {post.symbol}
                        </span>
                      )}
                    </div>

                    <p className="text-[12px] text-neutral-300 leading-relaxed whitespace-pre-wrap mb-3">
                      {post.content}
                    </p>

                    {post.media_url && (
                      <div className="mb-3 max-h-48 overflow-hidden rounded border border-white/5 bg-black/40">
                        <img src={post.media_url} alt="Post attachment" className="w-full max-h-48 object-cover" />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Heart size={11} /> {post.like_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare size={11} /> {post.comment_count || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Delete this post */}
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          title="Delete this specific post"
                        >
                          <Trash2 size={11} />
                          <span>Delete Post</span>
                        </button>

                        {/* Suspend or Unsuspend Author */}
                        {post.user_id && (
                          <button
                            onClick={() => handleToggleSuspendUser(post.user_id, Boolean(isAuthorSuspended))}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                              isAuthorSuspended 
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                            }`}
                            title={isAuthorSuspended ? "Restore user access" : "Suspend user account"}
                          >
                            {isAuthorSuspended ? <UserCheck size={11} /> : <UserX size={11} />}
                            <span>{isAuthorSuspended ? "Unsuspend User" : "Suspend User"}</span>
                          </button>
                        )}

                        {/* Purge User & All Data */}
                        {post.user_id && (
                          <button
                            onClick={() => handlePurgeUserAndData(post.user_id, author?.full_name)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                            title="Completely remove user and all their data"
                          >
                            <Ban size={11} />
                            <span>Purge User</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: FLAGGED REPORTS ── */}
      {activeTab === "flags" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFlagFilter("pending")}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                flagFilter === 'pending' ? 'bg-blue-500 text-white' : 'bg-[#1E1E1E] text-neutral-400 hover:text-white'
              }`}
            >
              Pending Review
            </button>
            <button
              onClick={() => setFlagFilter("resolved")}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                flagFilter === 'resolved' ? 'bg-blue-500 text-white' : 'bg-[#1E1E1E] text-neutral-400 hover:text-white'
              }`}
            >
              Resolved Log
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 size={24} className="text-blue-500 animate-spin" />
            </div>
          ) : flags.length === 0 ? (
            <div className="bg-[#1E1E1E] border border-white/5 rounded p-12 flex flex-col items-center justify-center text-center">
              <ShieldAlert size={32} className="text-emerald-500 mb-4 opacity-50" />
              <p className="text-white text-sm font-bold">Queue Empty</p>
              <p className="text-neutral-500 text-[11px] mt-1">No {flagFilter} content moderation reports.</p>
            </div>
          ) : (
            flags.map((flag) => (
              <div key={flag.id} className="bg-[#1E1E1E] border border-rose-500/20 rounded p-5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="px-2 py-1 bg-black border border-white/5 rounded text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                      {flag.content_type}
                    </div>
                    <span className="text-[11px] font-bold text-white">Reported by @{flag.profiles?.full_name || 'Anonymous'}</span>
                    <span className="text-[10px] text-neutral-600">{new Date(flag.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded text-rose-500">
                    <AlertTriangle size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{flag.reason}</span>
                  </div>
                </div>

                {flag.details && (
                  <p className="text-xs text-neutral-400 mb-4 bg-black/30 p-2.5 rounded border border-white/5">
                    {flag.details}
                  </p>
                )}

                {flagFilter === 'pending' && (
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button 
                      onClick={() => resolveFlag(flag, 'approve')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-black border border-white/5 rounded hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-[9px] font-bold text-neutral-400 uppercase tracking-widest cursor-pointer"
                    >
                      <Check size={12} />
                      Dismiss / Keep
                    </button>
                    <button 
                      onClick={() => resolveFlag(flag, 'delete')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded transition-colors text-[9px] font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(225,29,72,0.3)] cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Delete Content
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB 3: SUSPENDED USERS ── */}
      {activeTab === "suspended" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 size={24} className="text-blue-500 animate-spin" />
            </div>
          ) : suspendedUsers.length === 0 ? (
            <div className="bg-[#1E1E1E] border border-white/5 rounded p-12 flex flex-col items-center justify-center text-center">
              <ShieldAlert size={32} className="text-emerald-500 mb-4 opacity-50" />
              <p className="text-white text-sm font-bold">No Suspended Users</p>
              <p className="text-neutral-500 text-[11px] mt-1">All registered trader accounts are in good standing.</p>
            </div>
          ) : (
            <div className="bg-[#1E1E1E] border border-white/5 rounded overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5">
                    <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Suspended Trader</th>
                    <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Email</th>
                    <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                    <th className="p-4 text-[9px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                  {suspendedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.01]">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold">
                            {user.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{user.full_name || "Unidentified User"}</p>
                            {user.username && <p className="text-[10px] font-mono text-neutral-500">@{user.username}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-[10px] font-mono text-neutral-400">
                        {user.email || "N/A"}
                      </td>
                      <td className="p-4">
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          Restricted / Banned
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleSuspendUser(user.id, true)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <UserCheck size={11} />
                            <span>Restore Access</span>
                          </button>
                          <button
                            onClick={() => handlePurgeUserAndData(user.id, user.full_name)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <Ban size={11} />
                            <span>Purge User &amp; Data</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
