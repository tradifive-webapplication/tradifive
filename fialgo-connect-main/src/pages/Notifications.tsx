import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ShieldAlert,
  Settings,
  CreditCard,
  Zap,
  Trash2,
  CheckCircle2,
  Search,
  MessageSquare,
  Heart,
  Sparkles,
  UserCheck,
  CheckCheck,
  X,
  Activity,
  ArrowRight,
  Clock,
  Send,
  UserPlus,
  AtSign,
  TrendingUp,
  Award,
} from "lucide-react";
import { TickSquare as IconlyTickSquare, Delete as IconlyDelete, Search as IconlySearch, AddUser as IconlyAddUser, Notification as IconlyNotification } from "react-iconly";
import LeaderboardPanel from "@/components/LeaderboardPanel";
import { FollowButton } from "@/components/ui/FollowButton";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export default function Notifications() {
  const navigate = useNavigate();
  const [followRequests, setFollowRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showClearHistoryModal, setShowClearHistoryModal] = useState(false);
  const [followedBackIds, setFollowedBackIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);



    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {

        const [requestsRes, notifsRes] = await Promise.all([
          supabase
            .from("social_follow_requests")
            .select("*, requester:profiles!social_follow_requests_requester_id_fkey(id, display_name, username, avatar_url)")
            .eq("target_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100)
        ]);

        if (requestsRes.data) {
          setFollowRequests(requestsRes.data);
        }

        const { data, error } = notifsRes;

        if (error) {
          setNotifications([]);
        } else {
          setNotifications(data ?? []);

          // --- Hydrate initial 'Following' state for Follow notifications ---
          const targetIdsToLoad = new Set<string>();
          const usernamesToLookup = new Set<string>();

          for (const n of data ?? []) {
            const isFollowNotif = n.type === 'FOLLOW' || n.title?.toLowerCase().includes('follow');
            if (isFollowNotif) {
              const tId = n.sender_id || n.actor_id || n.from_user_id;
              if (tId) {
                targetIdsToLoad.add(tId);
              } else if (n.message) {
                const match = n.message.match(/^(.*?)\s+started following you!/i);
                if (match) {
                  usernamesToLookup.add(match[1]);
                }
              }
            }
          }

          const idToUsernameMap: Record<string, string> = {};
          const namesArray = Array.from(usernamesToLookup);

          // Try to find them all in a single query by username
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, username, display_name, full_name')
            .in('username', namesArray);

          if (profiles) {
            profiles.forEach(profile => {
              targetIdsToLoad.add(profile.id);
              idToUsernameMap[profile.id] = profile.username || '';
            });
          }

          // If some weren't found, try by display_name (fallback)
          const foundUsernames = new Set(profiles?.map(p => p.username));
          const missingNames = namesArray.filter(n => !foundUsernames.has(n));

          if (missingNames.length > 0) {
            const { data: displayProfiles } = await supabase
              .from('profiles')
              .select('id, username, display_name')
              .in('display_name', missingNames);

            if (displayProfiles) {
              displayProfiles.forEach(profile => {
                targetIdsToLoad.add(profile.id);
                idToUsernameMap[profile.id] = profile.display_name || '';
              });
            }
          }

          if (targetIdsToLoad.size > 0) {
            const { data: followedData } = await supabase
              .from('social_follows')
              .select('following_id')
              .eq('follower_id', user.id)
              .in('following_id', Array.from(targetIdsToLoad));

            if (followedData) {
              const followedIds = new Set<string>();
              followedData.forEach(d => {
                followedIds.add(d.following_id);
                if (idToUsernameMap[d.following_id]) {
                  followedIds.add(idToUsernameMap[d.following_id]); // Map back to text string so JSX match works
                }
              });
              setFollowedBackIds(followedIds);
            }
          }
          // ----------------------------------------------------------------
        }
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };


  const acceptFollowRequest = async (requestId: string, requesterId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete request
      await supabase.from("social_follow_requests").delete().eq("id", requestId);

      // Create follow
      await supabase.from("social_follows").insert([{ follower_id: requesterId, following_id: user.id }]);

      // Mark as accepted locally instead of filtering it out immediately
      setFollowRequests(prev => prev.map(r => r.id === requestId ? { ...r, accepted: true } : r));
      toast.success("Follow request accepted");
    } catch (e: any) {
      toast.error("Failed to accept request");
    }
  };

  const declineFollowRequest = async (requestId: string) => {
    try {
      await supabase.from("social_follow_requests").delete().eq("id", requestId);
      setFollowRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success("Follow request declined");
    } catch (e: any) {
      toast.error("Failed to decline request");
    }
  };

  const markRead = async (id: string) => {
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    } catch (e) { }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) { toast.info("All caught up!"); return; }
    const unreadIds = unread.map(n => n.id);
    try {
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    } catch (e) { }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotif = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await supabase.from("notifications").delete().eq("id", id);
    } catch (e) { }
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const clearAllNotifications = () => {
    if (notifications.length === 0) return;
    setShowClearHistoryModal(true);
  };

  const confirmClearAllNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("notifications").delete().eq("user_id", user.id);
      if (error) throw error;

      setNotifications([]);
      setShowClearHistoryModal(false);
      toast.success("All notifications cleared");
    } catch (e: any) {
      toast.error("Failed to clear notifications");
    }
  };

  const handleUserClick = async (notif: any, e: React.MouseEvent) => {
    e.stopPropagation();
    // Use explicit IDs if available
    const actorId = notif.sender_id || notif.actor_id || notif.from_user_id;
    if (actorId) {
      navigate(`/user/${actorId}`);
      return;
    }

    let actorName = notif.sender_username || notif.actor_username || notif.from_username;

    // Extract from message if it's a follow notification
    if (!actorName && (notif.type === 'FOLLOW' || notif.title?.toLowerCase().includes('follow'))) {
      const match = notif.message?.match(/^(.*?)\s+started following you!/i);
      if (match) {
        actorName = match[1];
      }
    }

    if (actorName) {
      // It might be a username or a full name. Navigate to it, UserProfilePublic handles basic username lookups.
      // But if it's a full name with spaces, it might fail. Let's try to lookup the real username or ID first.
      try {
        const { data: profile } = await supabase.from('profiles').select('id, username').eq('username', actorName).maybeSingle();
        if (profile) {
          navigate(`/user/${profile.id}`);
          return;
        }

        // Try looking up by display_name or full_name
        const { data: profileByName } = await supabase.from('profiles')
          .select('id')
          .or(`display_name.ilike.%${actorName}%,full_name.ilike.%${actorName}%`)
          .limit(1)
          .maybeSingle();

        if (profileByName) {
          navigate(`/user/${profileByName.id}`);
          return;
        }
      } catch (e) { }

      // Fallback
      navigate(`/user/${actorName}`);
    }
  };

  const handleFollowBack = async (notif: any, e: React.MouseEvent) => {
    e.stopPropagation();

    let targetId = notif.sender_id || notif.actor_id || notif.from_user_id;
    let targetUsername = notif.sender_username || notif.actor_username || notif.from_username;

    if (!targetId && !targetUsername && (notif.type === 'FOLLOW' || notif.title?.toLowerCase().includes('follow'))) {
      const match = notif.message?.match(/^(.*?)\s+started following you!/i);
      if (match) {
        targetUsername = match[1];
      }
    }

    if (!targetId && !targetUsername) {
      toast.error("Could not identify user to follow");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in");
        return;
      }

      if (!targetId && targetUsername) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('username', targetUsername).maybeSingle();
        if (profile) {
          targetId = profile.id;
        } else {
          const { data: profile2 } = await supabase.from('profiles').select('id').or(`display_name.ilike.%${targetUsername}%,full_name.ilike.%${targetUsername}%`).limit(1).maybeSingle();
          if (profile2) targetId = profile2.id;
        }
      }

      if (!targetId) {
        toast.error("User not found");
        return;
      }

      // Check if already following
      const { data: existing } = await supabase.from('social_follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetId);

      if (existing && existing.length > 0) {
        setFollowedBackIds(prev => new Set(prev).add(targetId));
        toast.info(`You are already following ${targetUsername || 'this user'}`);
        return;
      }

      const { error } = await supabase.from('social_follows').insert({
        follower_id: user.id,
        following_id: targetId
      });

      if (error) throw error;

      setFollowedBackIds(prev => new Set(prev).add(targetId));
      toast.success(`You followed ${targetUsername || 'them'} back!`);
    } catch (err) {
      toast.error("Failed to follow user");
    }
  };

  const handleSendReply = (notifId: string, recipient: string) => {
    if (!replyText.trim()) { toast.error("Write something first"); return; }
    setSubmittingReply(true);
    toast.success(`Replied to ${recipient}`);
    setReplyText("");
    setSubmittingReply(false);
    setExpandedId(null);
    markRead(notifId);
  };

  // ── Icon & colour helpers ──────────────────────────────────────────────────
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'SOCIAL':
        return { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', badge: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20', label: 'Social', dot: 'bg-rose-500' };
      case 'RISK_GUARD':
        return { icon: ShieldAlert, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', badge: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', label: 'Risk Guard', dot: 'bg-amber-500' };
      case 'AI_COACH':
        return { icon: Sparkles, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', badge: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border-violet-200 dark:border-violet-500/20', label: 'AI Coach', dot: 'bg-violet-500' };
      case 'SYSTEM':
        return { icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', label: 'System', dot: 'bg-emerald-500' };
      case 'SECURITY':
        return { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10', badge: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20', label: 'Security', dot: 'bg-red-500' };
      case 'PAYMENT':
        return { icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', label: 'Payment', dot: 'bg-emerald-600' };
      case 'TRADE':
        return { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', badge: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', label: 'Trade', dot: 'bg-blue-500' };
      case 'FOLLOW':
        return { icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', badge: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20', label: 'Follow', dot: 'bg-indigo-500' };
      case 'MENTION':
        return { icon: AtSign, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10', badge: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/20', label: 'Mention', dot: 'bg-cyan-500' };
      case 'ACHIEVEMENT':
        return { icon: Award, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10', badge: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20', label: 'Achievement', dot: 'bg-yellow-500' };
      default:
        return { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-[#1E1E1E]', badge: 'bg-slate-50 text-slate-600 dark:bg-[#1E1E1E] dark:text-[#999] border-slate-200 dark:border-white/5', label: type || 'General', dot: 'bg-slate-400' };
    }
  };

  const timeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  const formatNotifTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const hrs = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hrs}:${mins}`;
    } catch {
      return '';
    }
  };

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredNotifs = notifications
    .filter(n => filter === "ALL" || n.type === filter)
    .filter(n => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q) ||
        n.type?.toLowerCase().includes(q)
      );
    });

  const getCount = (type: string) => type === "ALL" ? notifications.length : notifications.filter(n => n.type === type).length;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const grouped = (() => {
    const today: any[] = [], archive: any[] = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    filteredNotifs.forEach(n => {
      const d = new Date(n.created_at || Date.now());
      if (d >= startOfToday) today.push(n);
      else archive.push(n);
    });
    return { today, archive };
  })();

  const FILTER_TABS = ["ALL", "AI_COACH", "SOCIAL", "RISK_GUARD", "SYSTEM"];

  // ── Card renderer ──────────────────────────────────────────────────────────
  function renderCard(n: any) {
    const isExpanded = expandedId === n.id;
    const cfg = getTypeConfig(n.type);
    const IconComp = cfg.icon;
    const hasActor = !!(n.sender_username || n.actor_username || n.from_username || n.sender_id || n.actor_id || n.from_user_id);
    const actorName = n.sender_name || n.actor_name || n.from_name || n.sender_username || n.actor_username || n.from_username || null;
    const actorAvatar = n.sender_avatar || n.actor_avatar || n.avatar || null;

    // Determine if this is a "follower" style notification
    const isFollowNotif = n.type === 'FOLLOW' || n.title?.toLowerCase().includes('follow');
    const isLikeNotif = n.type === 'SOCIAL' && (n.title?.toLowerCase().includes('like') || n.title?.toLowerCase().includes('liked'));
    const isCommentNotif = n.type === 'SOCIAL' && (n.title?.toLowerCase().includes('comment') || n.title?.toLowerCase().includes('replied'));

    let extractedUsername = null;
    if (!hasActor && isFollowNotif && n.message) {
      const match = n.message.match(/^(.*?)\s+started following you!/i);
      if (match) {
        extractedUsername = match[1];
      }
    }
    const hasFollowTarget = hasActor || !!extractedUsername;

    // Resolve targetId for Follow Back button state
    const targetId = n.sender_id || n.actor_id || n.from_user_id || extractedUsername;
    const isFollowedBack = targetId && followedBackIds.has(targetId);

    // Determine if expanded content is completely empty
    const hasExpandedContent = !!n.details || !!n.actionLabel || (n.type === "SOCIAL" && isCommentNotif);

    return (
      <motion.div
        layout
        key={n.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${!n.is_read
            ? 'bg-white dark:bg-[#1E1E1E] border-slate-200 dark:border-white/5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-none'
            : 'bg-slate-50/50 dark:bg-[#1E1E1E] border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-[#111318]'
          }`}
        onClick={() => {
          setExpandedId(isExpanded ? null : n.id);
          if (!n.is_read) markRead(n.id);
        }}
      >
        {/* Unread left accent bar */}
        {!n.is_read && (
          <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${cfg.dot}`} />
        )}

        <div className="p-4 sm:p-5 flex items-start gap-4">
          {/* Avatar / Icon */}
          <div className="shrink-0 relative">
            {actorAvatar ? (
              <div
                className="w-11 h-11 rounded-full overflow-hidden border-2 border-white dark:border-white/5 shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-slate-400/40 transition-all"
                onClick={(e) => { e.stopPropagation(); if (hasActor) handleUserClick(n, e); }}
              >
                <img src={actorAvatar} alt={actorName || ''} className="w-full h-full object-cover" />
              </div>
            ) : actorName ? (
              <div
                className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-2 border-white dark:border-white/5 shadow-sm cursor-pointer ring-2 ring-transparent hover:ring-slate-400/40 transition-all text-white font-bold text-sm"
                onClick={(e) => { e.stopPropagation(); if (hasActor) handleUserClick(n, e); }}
              >
                {actorName[0]?.toUpperCase()}
              </div>
            ) : (
              <div className={`w-11 h-11 rounded-full ${cfg.bg} flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-sm`}>
                <IconComp size={20} className={cfg.color} />
              </div>
            )}

            {/* Badge icon on avatar */}
            {(actorAvatar || actorName) && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${cfg.bg} border-2 border-white dark:border-white/5 flex items-center justify-center shadow-sm`}>
                <IconComp size={10} className={cfg.color} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                {/* Title */}
                <p className={`text-[14px] leading-snug ${!n.is_read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-[#CCC]'}`}>
                  {actorName && hasActor ? (
                    <>
                      <span
                        className="font-bold hover:underline cursor-pointer"
                        onClick={(e) => handleUserClick(n, e)}
                      >
                        {actorName}
                      </span>{' '}
                      <span className={n.is_read ? 'text-slate-500 dark:text-[#999]' : 'text-slate-700 dark:text-[#EEE]'}>
                        {/* Strip the actor name from title if it's already included */}
                        {n.title?.replace(actorName, '').trim() || n.title}
                      </span>
                    </>
                  ) : (
                    n.title
                  )}
                </p>

                {/* Message */}
                {n.message && (
                  <p className="text-[13px] text-slate-500 dark:text-[#999] mt-0.5 leading-relaxed line-clamp-2">
                    {extractedUsername && n.message.startsWith(extractedUsername) ? (
                      <>
                        <span
                          className="font-bold text-slate-700 dark:text-[#CCC] hover:underline cursor-pointer"
                          onClick={(e) => handleUserClick(n, e)}
                        >
                          {extractedUsername}
                        </span>
                        {n.message.slice(extractedUsername.length)}
                      </>
                    ) : (
                      n.message
                    )}
                  </p>
                )}

                {/* Time + type badge */}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[11px] font-semibold ${!n.is_read ? 'text-slate-700 dark:text-[#EEE]' : 'text-slate-400 dark:text-slate-400'}`}>
                    {timeAgo(n.created_at)}
                  </span>
                  {!isFollowNotif && (
                    <>
                      <span className="text-slate-200 dark:text-slate-300">·</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </>
                  )}
                  {n.priority === 'high' && (
                    <>
                      <span className="text-slate-200 dark:text-slate-300">·</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-200 dark:border-red-500/20">
                        Priority
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right side: actions */}
              <div className="flex flex-row items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                {/* Follow Back Button (Always visible) */}
                {isFollowNotif && hasFollowTarget && (
                  <FollowButton
                    isFollowing={isFollowedBack}
                    onToggleFollow={(e) => {
                      if (isFollowedBack) {
                        e.stopPropagation();
                        return; // Do nothing if already followed
                      }
                      handleFollowBack(n, e);
                    }}
                    text="Follow Back"
                    disabled={isFollowedBack}
                  />
                )}

                <div className="flex flex-col items-end gap-2">
                  {/* Unread dot */}
                  {!n.is_read && (
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-1`} />
                  )}

                  {/* Action buttons (show on hover) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.is_read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        title="Mark as read"
                      >
                        <IconlyTickSquare set="curved" primaryColor="currentColor" size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => deleteNotif(n.id, e)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <IconlyDelete set="curved" primaryColor="currentColor" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded details panel */}
        <AnimatePresence>
          {isExpanded && hasExpandedContent && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="mx-4 sm:mx-5 mb-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1E1E1E] border border-slate-100 dark:border-white/5 space-y-3">
                {n.details && (
                  <p className="text-[13px] text-slate-600 dark:text-[#999] leading-relaxed">{n.details}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                    {new Date(n.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>

                  {n.actionLabel && (
                    <button
                      onClick={() => toast.success(`Executed: "${n.actionLabel}"`)}
                      className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all flex items-center gap-1 active:scale-95"
                    >
                      {n.actionLabel}
                      <ArrowRight size={10} />
                    </button>
                  )}
                </div>

                {/* Inline reply for SOCIAL comment notifications */}
                {n.type === "SOCIAL" && isCommentNotif && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex-1 bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-2 px-3 py-2">
                      <input
                        type="text"
                        placeholder="Write a reply…"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        className="flex-1 bg-transparent text-[13px] text-slate-800 dark:text-[#EEE] placeholder:text-slate-400 focus:outline-none"
                        onKeyDown={e => { if (e.key === 'Enter') handleSendReply(n.id, actorName || 'them'); }}
                        onClick={e => e.stopPropagation()}
                      />
                      <button
                        disabled={submittingReply}
                        onClick={(e) => { e.stopPropagation(); handleSendReply(n.id, actorName || 'them'); }}
                        className="p-1.5 bg-slate-900 dark:bg-white hover:opacity-80 text-white dark:text-slate-900 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  const renderSectionHeader = (title: string, count: number) => {
    if (count === 0) return null;
    return (
      <div className="flex items-center justify-between pt-4 pb-2">
        <span className="text-[10px] font-black tracking-widest text-slate-450 dark:text-slate-400 uppercase">{title}</span>
        <div className="h-px flex-1 bg-slate-100 dark:bg-[#1E1E1E]/60 mx-4" />
        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-slate-100 dark:bg-[#1E1E1E] text-[9.5px] font-black text-slate-505 dark:text-[#999] border border-slate-200/50 dark:border-white/5 shrink-0">{count}</span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto pb-20 px-3 sm:px-4 font-sans select-none">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 sm:py-8 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
              Tactical Command
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/10 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {unreadCount} UNREAD
                </span>
              )}
            </h1>
            <p className="text-[13px] sm:text-[14px] text-slate-500 dark:text-[#888] mt-1.5 font-medium">Real-time alerts, system risk guards, and institutional updates.</p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={markAllRead}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[12px] sm:text-[13px] font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 sm:gap-2"
            >
              <IconlyTickSquare set="curved" primaryColor="currentColor" size={16} className="text-slate-500 dark:text-slate-400" />
              Verify All
            </button>
            <button
              onClick={clearAllNotifications}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-rose-50/80 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl text-[12px] sm:text-[13px] font-semibold text-rose-600 dark:text-rose-400 transition-colors flex items-center gap-1.5 sm:gap-2"
              title="Purge Archive"
            >
              <IconlyDelete set="curved" primaryColor="currentColor" size={16} />
              Purge Archive
            </button>
          </div>
        </div>

        {/* ── SEARCH + FILTER TABS ── */}
        <div className="p-1.5 sm:p-2 bg-slate-50 dark:bg-[#1E1E1E]/80 rounded-2xl md:rounded-full flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3 mb-6 sm:mb-8 border border-slate-200/60 dark:border-white/5 shadow-sm">
          {/* Search */}
          <div className="relative w-full md:flex-1 md:max-w-md shrink-0">
            <IconlySearch set="curved" primaryColor="currentColor" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search directives..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1E1E1E] border border-slate-100 dark:border-white/5 rounded-full pl-9 pr-8 py-2 text-[13px] text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto min-w-0 scrollbar-hide py-1 pr-1">
            {FILTER_TABS.map(t => {
              const active = filter === t;
              return (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`shrink-0 text-[12px] capitalize tracking-wide px-4 py-1.5 rounded-full transition-all ${active
                      ? 'bg-white dark:bg-[#222] text-[#1e293b] dark:text-white font-bold shadow-[0_1px_3px_rgba(0,0,0,0.05)] border border-slate-200/80 dark:border-white/5'
                      : 'text-slate-500 dark:text-slate-400 font-semibold hover:text-slate-800 dark:hover:text-slate-200 border border-transparent hover:bg-slate-200/30 dark:hover:bg-white/5'
                    }`}
                >
                  {t === "ALL" ? "All" : t.toLowerCase().replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>


        {/* ── FOLLOW REQUESTS ── */}
        {followRequests.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 mb-4 px-1">
              <IconlyAddUser set="curved" primaryColor="currentColor" size={16} className="text-slate-500 dark:text-[#999]" />
              <h2 className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">Follow Requests ({followRequests.length})</h2>
            </div>
            {followRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] dark:shadow-none">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${req.requester_id}`)}>
                  {req.requester?.avatar_url ? (
                    <img src={req.requester.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1E1E1E] flex items-center justify-center">
                      <IconlyAddUser set="curved" primaryColor="currentColor" size={16} className="text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{req.requester?.display_name || req.requester?.username}</p>
                    <p className="text-[12px] font-semibold text-slate-500 dark:text-[#999] mt-0.5">Wants to follow you</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {req.accepted ? (
                    <>
                      <span className="text-[12px] font-bold text-slate-500 dark:text-[#999] px-2">Accepted</span>
                      <button onClick={(e) => { e.stopPropagation(); setFollowRequests(prev => prev.filter(r => r.id !== req.id)); }} className="px-4 py-1.5 bg-slate-100 dark:bg-[#1E1E1E] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-[#CCC] text-[12px] font-bold rounded-full transition-all">Delete</button>
                    </>
                  ) : (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); acceptFollowRequest(req.id, req.requester_id); }} className="px-4 py-1.5 bg-slate-900 dark:bg-white hover:opacity-80 text-white dark:text-slate-900 text-[12px] font-bold rounded-full transition-all active:scale-95">Accept</button>
                      <button onClick={(e) => { e.stopPropagation(); declineFollowRequest(req.id); }} className="px-4 py-1.5 bg-slate-100 dark:bg-[#1E1E1E] hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-[#CCC] text-[12px] font-bold rounded-full transition-all">Decline</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── NOTIFICATIONS LIST ── */}
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-slate-50/50 dark:bg-[#1E1E1E]/50 animate-pulse rounded-[20px] border border-slate-100 dark:border-white/5" />
            ))}
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:bg-none dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none rotate-3">
                <IconlyNotification set="curved" primaryColor="currentColor" size={32} className="text-slate-400 dark:text-slate-400 -rotate-3" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">You're all caught up!</h3>
            <p className="text-[14px] text-slate-500 dark:text-[#888] mt-2 max-w-xs font-medium">There are no critical directives or new alerts requiring your attention at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.today.length > 0 && (
              <div className="space-y-3">
                {renderSectionHeader("Today", grouped.today.length)}
                <AnimatePresence initial={false}>
                  {grouped.today.map(n => renderCard(n))}
                </AnimatePresence>
              </div>
            )}
            {grouped.archive.length > 0 && (
              <div className="space-y-3">
                {renderSectionHeader("Archive History", grouped.archive.length)}
                <AnimatePresence initial={false}>
                  {grouped.archive.map(n => renderCard(n))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear All Modal */}
      <Dialog open={showClearHistoryModal} onOpenChange={setShowClearHistoryModal}>
        <DialogContent className="sm:max-w-[340px] p-0 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1E1E1E] [&>button]:hidden">
          <div className="flex flex-col items-center text-center p-8 space-y-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-500/10 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 flex items-center justify-center">
                <IconlyDelete set="curved" primaryColor="currentColor" size={24} className="text-red-500" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-[18px] font-bold text-slate-900 dark:text-white">Clear all notifications?</DialogTitle>
              <p className="text-[13.5px] text-slate-500 dark:text-[#999] mt-2 leading-relaxed">This will permanently delete all your notifications. This action cannot be undone.</p>
            </div>
            <div className="flex w-full gap-2.5">
              <button
                onClick={() => setShowClearHistoryModal(false)}
                className="flex-1 py-3 rounded-full font-semibold text-[14px] text-slate-700 dark:text-[#CCC] bg-slate-100 dark:bg-[#1E1E1E] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearAllNotifications}
                className="flex-1 py-3 rounded-full font-semibold text-[14px] text-white bg-gradient-to-r from-red-500 to-rose-500 shadow-lg shadow-red-500/25 hover:brightness-110 transition-all active:scale-95"
              >
                Clear All
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
