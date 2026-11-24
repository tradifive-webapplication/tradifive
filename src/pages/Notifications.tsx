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
  Users,
  AtSign,
  TrendingUp,
  Award,
  Eye,
  Check,
  RefreshCw
} from "lucide-react";
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

          // Hydrate initial 'Following' state for Follow notifications
          const targetIdsToLoad = new Set<string>();
          const usernamesToLookup = new Set<string>();

          for (const n of data ?? []) {
            const isFollowNotif = n.type === 'FOLLOW' || n.title?.toLowerCase().includes('follow');
            if (isFollowNotif) {
              const tId = n.sender_id || n.actor_id || n.from_user_id || n.metadata?.sender_id;
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

          if (namesArray.length > 0) {
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
                  followedIds.add(idToUsernameMap[d.following_id]);
                }
              });
              setFollowedBackIds(followedIds);
            }
          }
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

      await supabase.from("social_follow_requests").delete().eq("id", requestId);
      await supabase.from("social_follows").insert([{ follower_id: requesterId, following_id: user.id }]);

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

  const markRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    } catch (e) {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) {
      toast.info("All notifications are already marked as read");
      return;
    }
    const unreadIds = unread.map(n => n.id);
    try {
      await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotif = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await supabase.from("notifications").delete().eq("id", id);
    } catch (e) {}
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const clearAllNotifications = () => {
    if (notifications.length === 0) {
      toast.info("No notifications to clear");
      return;
    }
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
    const actorId = notif.sender_id || notif.actor_id || notif.from_user_id;
    if (actorId) {
      navigate(`/user/${actorId}`);
      return;
    }

    let actorName = notif.sender_username || notif.actor_username || notif.from_username;
    if (!actorName && (notif.type === 'FOLLOW' || notif.title?.toLowerCase().includes('follow'))) {
      const match = notif.message?.match(/^(.*?)\s+started following you!/i);
      if (match) {
        actorName = match[1];
      }
    }

    if (actorName) {
      try {
        const { data: profile } = await supabase.from('profiles').select('id, username').eq('username', actorName).maybeSingle();
        if (profile) {
          navigate(`/user/${profile.id}`);
          return;
        }

        const { data: profileByName } = await supabase.from('profiles')
          .select('id')
          .or(`display_name.ilike.%${actorName}%,full_name.ilike.%${actorName}%`)
          .limit(1)
          .maybeSingle();

        if (profileByName) {
          navigate(`/user/${profileByName.id}`);
          return;
        }
      } catch (e) {}

      navigate(`/user/${actorName}`);
    }
  };

  const handleFollowBack = async (notif: any, e: React.MouseEvent) => {
    e.stopPropagation();

    let targetId = notif.sender_id || notif.actor_id || notif.from_user_id || notif.metadata?.sender_id;
    let targetUsername = notif.sender_username || notif.actor_username || notif.from_username || notif.metadata?.sender_username;

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
    if (!replyText.trim()) {
      toast.error("Write something first");
      return;
    }
    setSubmittingReply(true);
    toast.success(`Replied to ${recipient}`);
    setReplyText("");
    setSubmittingReply(false);
    setExpandedId(null);
    markRead(notifId);
  };

  // ── Icon & color helpers (Case-Insensitive & Type-Safe) ───────────────────
  const normalizeType = (type?: string, title?: string) => {
    const raw = (type || '').trim();
    const t = raw.toUpperCase().replace(/[-\s]/g, '_');
    if (t) return t;
    const titleUpper = (title || '').toUpperCase();
    if (titleUpper.includes('PROFILE VIEW') || titleUpper.includes('PROFILE VISITOR')) return 'PROFILE_VIEW';
    if (titleUpper.includes('FOLLOW')) return 'FOLLOW';
    if (titleUpper.includes('RISK GUARD') || titleUpper.includes('DRAWDOWN')) return 'RISK_GUARD';
    if (titleUpper.includes('TRADE') || titleUpper.includes('ORDER')) return 'TRADE';
    return 'GENERAL';
  };

  const isTradeType = (type?: string, title?: string) => {
    const t = normalizeType(type, title);
    return t === 'TRADE' || t === 'RISK_GUARD' || t === 'ORDER' || t === 'POSITION' || t === 'CIRCUIT_BREAKER' || t === 'DRAWDOWN_ALERT';
  };

  const isSocialType = (type?: string, title?: string) => {
    const t = normalizeType(type, title);
    return t === 'SOCIAL' || t === 'FOLLOW' || t === 'PROFILE_VIEW' || t === 'PROFILE_VISIT' || t === 'PROFILE_VISITOR' || t === 'MENTION' || t === 'COMMENT' || t === 'LIKE';
  };

  const isSystemType = (type?: string, title?: string) => {
    const t = normalizeType(type, title);
    return t === 'SYSTEM' || t === 'SECURITY' || t === 'PAYMENT' || t === 'AI_COACH' || t === 'ACHIEVEMENT' || t === 'AUTH' || t === 'SUBSCRIPTION';
  };

  const getTypeConfig = (type: string, title?: string) => {
    const t = normalizeType(type, title);
    const titleUpper = (title || '').toUpperCase();

    if (t === 'PROFILE_VIEW' || t === 'PROFILE_VISIT' || t === 'PROFILE_VISITOR' || titleUpper.includes('PROFILE VIEW') || titleUpper.includes('PROFILE VISITOR')) {
      return {
        icon: Eye,
        color: 'text-cyan-600 dark:text-cyan-400',
        bg: 'bg-cyan-50 dark:bg-cyan-500/15',
        badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-500/30',
        label: 'Profile View',
        dot: 'bg-cyan-500'
      };
    }

    if (t === 'RISK_GUARD' || t === 'CIRCUIT_BREAKER' || t === 'DRAWDOWN_ALERT' || titleUpper.includes('RISK GUARD')) {
      return {
        icon: ShieldAlert,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/15',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30',
        label: 'Risk Guard',
        dot: 'bg-amber-500'
      };
    }

    if (t === 'AI_COACH' || t === 'COPILOT' || titleUpper.includes('AI COACH')) {
      return {
        icon: Sparkles,
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-500/15',
        badge: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 border-violet-200/80 dark:border-violet-500/30',
        label: 'AI Coach',
        dot: 'bg-violet-500'
      };
    }

    if (t === 'TRADE' || t === 'ORDER' || t === 'POSITION' || titleUpper.includes('TRADE')) {
      return {
        icon: TrendingUp,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-500/15',
        badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-200/80 dark:border-blue-500/30',
        label: 'Trade Fill',
        dot: 'bg-blue-500'
      };
    }

    if (t === 'FOLLOW' || t === 'FOLLOWER' || titleUpper.includes('FOLLOW')) {
      return {
        icon: UserPlus,
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-500/15',
        badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-500/30',
        label: 'Follow',
        dot: 'bg-indigo-500'
      };
    }

    if (t === 'MENTION' || titleUpper.includes('MENTION')) {
      return {
        icon: AtSign,
        color: 'text-sky-600 dark:text-sky-400',
        bg: 'bg-sky-50 dark:bg-sky-500/15',
        badge: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border-sky-200/80 dark:border-sky-500/30',
        label: 'Mention',
        dot: 'bg-sky-500'
      };
    }

    if (t === 'ACHIEVEMENT' || t === 'REWARD' || t === 'XP' || titleUpper.includes('ACHIEVEMENT') || titleUpper.includes('XP')) {
      return {
        icon: Award,
        color: 'text-amber-500 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/15',
        badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-200/80 dark:border-amber-500/30',
        label: 'Achievement',
        dot: 'bg-amber-500'
      };
    }

    if (t === 'PAYMENT' || t === 'SETTLEMENT' || t === 'WITHDRAWAL' || t === 'SUBSCRIPTION') {
      return {
        icon: CreditCard,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/15',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30',
        label: 'Payment',
        dot: 'bg-emerald-500'
      };
    }

    if (t === 'SECURITY' || t === 'AUTH' || t === 'PASSWORD') {
      return {
        icon: ShieldAlert,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-500/15',
        badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/30',
        label: 'Security',
        dot: 'bg-rose-500'
      };
    }

    if (t === 'SOCIAL' || t === 'COMMENT' || t === 'LIKE') {
      return {
        icon: Heart,
        color: 'text-rose-500 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-500/15',
        badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border-rose-200/80 dark:border-rose-500/30',
        label: 'Community',
        dot: 'bg-rose-500'
      };
    }

    if (t === 'SYSTEM' || t === 'ANNOUNCEMENT' || t === 'UPDATE') {
      return {
        icon: Activity,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/15',
        badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-500/30',
        label: 'System',
        dot: 'bg-emerald-500'
      };
    }

    return {
      icon: Bell,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-500/15',
      badge: 'bg-slate-100 text-slate-700 dark:bg-white/[0.08] dark:text-neutral-300 border-slate-200/80 dark:border-white/10',
      label: type ? type.replace(/_/g, ' ') : 'General',
      dot: 'bg-blue-500'
    };
  };

  const timeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  // ── Tab Counts & Grouping ────────────────────────────────────────────────
  const unreadCount = notifications.filter(n => !n.is_read).length;
  const tradeCount = notifications.filter(n => isTradeType(n.type, n.title)).length;
  const socialCount = notifications.filter(n => isSocialType(n.type, n.title)).length;
  const systemCount = notifications.filter(n => isSystemType(n.type, n.title)).length;

  const FILTER_TABS = [
    { id: "ALL", label: "All Alerts", count: notifications.length },
    { id: "UNREAD", label: "Unread", count: unreadCount },
    { id: "TRADE", label: "Trading & Risk", count: tradeCount },
    { id: "SOCIAL", label: "Community", count: socialCount },
    { id: "SYSTEM", label: "System", count: systemCount },
  ];

  // ── Filtering ────────────────────────────────────────────────────────────
  const filteredNotifs = notifications
    .filter(n => {
      if (filter === "ALL") return true;
      if (filter === "UNREAD") return !n.is_read;
      if (filter === "TRADE") return isTradeType(n.type, n.title);
      if (filter === "SOCIAL") return isSocialType(n.type, n.title);
      if (filter === "SYSTEM") return isSystemType(n.type, n.title);
      return normalizeType(n.type, n.title) === filter;
    })
    .filter(n => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        n.title?.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q) ||
        n.type?.toLowerCase().includes(q)
      );
    });

  const grouped = (() => {
    const today: any[] = [];
    const archive: any[] = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    filteredNotifs.forEach(n => {
      const d = new Date(n.created_at || Date.now());
      if (d >= startOfToday) today.push(n);
      else archive.push(n);
    });
    return { today, archive };
  })();

  // ── High-Craft Big-Tech Row Renderer ─────────────────────────────────────
  function renderItem(n: any) {
    const isExpanded = expandedId === n.id;
    const cfg = getTypeConfig(n.type, n.title);
    const IconComp = cfg.icon;
    const hasActor = !!(n.sender_username || n.actor_username || n.from_username || n.sender_id || n.actor_id || n.from_user_id || n.metadata?.sender_username || n.metadata?.sender_id);
    const actorName = n.sender_name || n.actor_name || n.from_name || n.metadata?.sender_name || n.sender_username || n.actor_username || n.from_username || n.metadata?.sender_username || null;
    const actorAvatar = n.sender_avatar || n.actor_avatar || n.avatar || n.metadata?.sender_avatar || null;

    const normType = normalizeType(n.type, n.title);
    const isFollowNotif = normType === 'FOLLOW';
    const isCommentNotif = normType === 'SOCIAL' && (n.title?.toLowerCase().includes('comment') || n.title?.toLowerCase().includes('replied'));
    const isProfileView = normType === 'PROFILE_VIEW';

    let extractedUsername = null;
    if (!hasActor && isFollowNotif && n.message) {
      const match = n.message.match(/^(.*?)\s+started following you!/i);
      if (match) extractedUsername = match[1];
    }
    const hasFollowTarget = hasActor || !!extractedUsername;
    const targetId = n.sender_id || n.actor_id || n.from_user_id || extractedUsername;
    const isFollowedBack = targetId && followedBackIds.has(targetId);
    const hasExpandedContent = !!n.details || !!n.actionLabel || (normType === "SOCIAL" && isCommentNotif);

    // Natural human phrasing
    let displayMessage = n.message;
    if (isProfileView && (!n.message || n.message === 'viewed your profile' || n.message.trim() === '')) {
      displayMessage = "Viewed your trading profile, performance stats, and public journal.";
    }

    return (
      <div
        key={n.id}
        onClick={() => {
          if (hasExpandedContent) setExpandedId(isExpanded ? null : n.id);
          if (!n.is_read) markRead(n.id);
        }}
        className={`group relative px-4 sm:px-5 py-3.5 sm:py-4 transition-colors cursor-pointer ${
          !n.is_read
            ? 'bg-blue-50/[0.22] dark:bg-blue-950/[0.12] hover:bg-blue-50/40 dark:hover:bg-blue-950/20'
            : 'bg-white dark:bg-[#151518] hover:bg-slate-50/80 dark:hover:bg-white/[0.02]'
        }`}
      >
        <div className="flex items-start gap-3 sm:gap-3.5">
          {/* Unread Status Dot */}
          <div className="w-2 flex items-center justify-center shrink-0 pt-2.5">
            {!n.is_read ? (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full opacity-0" />
            )}
          </div>

          {/* Icon or Avatar */}
          <div className="shrink-0 relative">
            {actorAvatar ? (
              <div
                className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shrink-0 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); if (hasActor) handleUserClick(n, e); }}
              >
                <img src={actorAvatar} alt={actorName || ''} className="w-full h-full object-cover" />
              </div>
            ) : actorName ? (
              <div
                className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); if (hasActor) handleUserClick(n, e); }}
              >
                {actorName[0]?.toUpperCase()}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-neutral-300 flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-white/[0.06]">
                <IconComp size={15} strokeWidth={1.75} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-semibold text-slate-900 dark:text-white leading-tight">
                {actorName && hasActor ? (
                  <span
                    className="hover:underline cursor-pointer"
                    onClick={(e) => handleUserClick(n, e)}
                  >
                    {actorName}
                  </span>
                ) : (
                  n.title || "Alert"
                )}
              </span>

              <span className="text-[11px] font-medium text-slate-400 dark:text-neutral-500">
                · {cfg.label}
              </span>

              {n.priority === 'high' && (
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-200/60 dark:border-rose-500/20">
                  Priority
                </span>
              )}
            </div>

            {displayMessage && (
              <p className="text-[12.5px] text-slate-600 dark:text-neutral-300 mt-1 leading-relaxed">
                {extractedUsername && displayMessage.startsWith(extractedUsername) ? (
                  <>
                    <span
                      className="font-medium text-slate-900 dark:text-white hover:underline cursor-pointer"
                      onClick={(e) => handleUserClick(n, e)}
                    >
                      {extractedUsername}
                    </span>
                    {displayMessage.slice(extractedUsername.length)}
                  </>
                ) : (
                  displayMessage
                )}
              </p>
            )}

            {/* Inline Action Buttons */}
            {(hasFollowTarget || hasActor || hasExpandedContent || isProfileView) && (
              <div className="flex items-center gap-2 mt-2 pt-1 flex-wrap" onClick={(e) => e.stopPropagation()}>
                {isFollowNotif && hasFollowTarget && (
                  <FollowButton
                    isFollowing={isFollowedBack}
                    onToggleFollow={(e) => {
                      if (isFollowedBack) {
                        e.stopPropagation();
                        return;
                      }
                      handleFollowBack(n, e);
                    }}
                    text="Follow Back"
                    disabled={isFollowedBack}
                  />
                )}

                {hasActor && (
                  <button
                    type="button"
                    onClick={(e) => handleUserClick(n, e)}
                    className="h-6 px-2.5 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
                  >
                    View profile
                  </button>
                )}

                {isProfileView && !hasActor && (
                  <button
                    type="button"
                    onClick={() => navigate("/channel")}
                    className="h-6 px-2.5 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    <Users size={11} />
                    <span>Explore community</span>
                  </button>
                )}

                {hasExpandedContent && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : n.id)}
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer ml-auto"
                  >
                    {isExpanded ? "Hide details" : "Details"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Timestamp & Hover Actions */}
          <div className="flex items-center gap-2 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
            <span className="text-[11.5px] font-mono text-slate-400 dark:text-neutral-500 whitespace-nowrap">
              {timeAgo(n.created_at)}
            </span>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {!n.is_read && (
                <button
                  type="button"
                  onClick={(e) => markRead(n.id, e)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  title="Mark as read"
                >
                  <Check size={13} strokeWidth={2} />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => deleteNotif(n.id, e)}
                className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                title="Delete notification"
              >
                <Trash2 size={13} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && hasExpandedContent && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="overflow-hidden mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] text-xs text-slate-600 dark:text-neutral-300"
            >
              {n.details && <p className="leading-relaxed">{n.details}</p>}
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-neutral-500 pt-2 font-mono">
                <span>{new Date(n.created_at).toLocaleString()}</span>
                {n.actionLabel && (
                  <button
                    type="button"
                    onClick={() => toast.success(`Executed: "${n.actionLabel}"`)}
                    className="px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold text-xs"
                  >
                    {n.actionLabel}
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[940px] mx-auto pb-20 px-4 sm:px-6 py-4 font-sans select-none space-y-4">

        {/* ── Top Header (Big-Tech Minimalist & Calm) ── */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[18px] sm:text-[20px] font-semibold tracking-tight text-slate-900 dark:text-white leading-none">
              Notifications
            </h1>
            {unreadCount > 0 ? (
              <span className="text-[11.5px] font-medium text-slate-500 dark:text-neutral-400 tabular-nums">
                ({unreadCount} unread)
              </span>
            ) : (
              <span className="text-[11.5px] font-medium text-slate-400 dark:text-neutral-500">
                · All caught up
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={markAllRead}
              className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <CheckCheck size={13} />
              <span className="hidden sm:inline">Mark all as read</span>
            </button>

            <button
              type="button"
              onClick={clearAllNotifications}
              className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">Clear</span>
            </button>

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="h-8 w-8 rounded-lg text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors flex items-center justify-center cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* ── Filter Bar & Search ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map(t => {
              const active = filter === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFilter(t.id)}
                  className={`relative px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10"
                      : "text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-neutral-200"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-[10px] tabular-nums font-mono opacity-70">
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[200px] sm:min-w-[220px]">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter alerts..."
              className="w-full h-8 bg-slate-100/70 dark:bg-white/[0.05] border border-transparent focus:border-slate-300 dark:focus:border-white/15 rounded-lg pl-7 pr-7 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* ── Follow Requests Box (if any) ── */}
        {followRequests.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-neutral-500 uppercase px-1">
              Follow Requests ({followRequests.length})
            </div>
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#151518] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden shadow-xs">
              {followRequests.map(req => (
                <div key={req.id} className="flex items-center justify-between p-3.5 sm:px-4">
                  <div className="flex items-center gap-3 cursor-pointer min-w-0" onClick={() => navigate(`/user/${req.requester_id}`)}>
                    {req.requester?.avatar_url ? (
                      <img src={req.requester.avatar_url} alt="Avatar" className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-white/10" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-700 dark:text-neutral-300 font-semibold text-xs">
                        {(req.requester?.display_name || req.requester?.username || "U")[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {req.requester?.display_name || req.requester?.username}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-neutral-500 truncate">
                        Wants to connect with you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {req.accepted ? (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        Accepted
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); acceptFollowRequest(req.id, req.requester_id); }}
                          className="h-7 px-3 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-medium rounded-md text-xs transition-colors cursor-pointer"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); declineFollowRequest(req.id); }}
                          className="h-7 px-2.5 text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white text-xs transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main Notifications List ── */}
        {loading ? (
          <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#151518] divide-y divide-slate-100 dark:divide-white/[0.06] overflow-hidden">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-slate-50/50 dark:bg-white/[0.02] animate-pulse" />
            ))}
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="py-16 px-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#151518]">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-neutral-500 flex items-center justify-center mx-auto mb-2.5">
              <Check size={18} />
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-neutral-200">
              No notifications
            </p>
            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1 max-w-sm mx-auto">
              {filter !== "ALL"
                ? "No alerts found in this filter."
                : "Activity, execution fills, and risk triggers will show up here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {grouped.today.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-neutral-500 uppercase px-1 flex items-center justify-between">
                  <span>Today</span>
                  <span className="font-mono text-[10px]">{grouped.today.length}</span>
                </div>
                <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#151518] divide-y divide-slate-100 dark:divide-white/[0.06] shadow-xs overflow-hidden">
                  {grouped.today.map(n => renderItem(n))}
                </div>
              </div>
            )}
            {grouped.archive.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-neutral-500 uppercase px-1 flex items-center justify-between">
                  <span>Earlier</span>
                  <span className="font-mono text-[10px]">{grouped.archive.length}</span>
                </div>
                <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#151518] divide-y divide-slate-100 dark:divide-white/[0.06] shadow-xs overflow-hidden">
                  {grouped.archive.map(n => renderItem(n))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Clear All Confirmation Modal ── */}
      <Dialog open={showClearHistoryModal} onOpenChange={setShowClearHistoryModal}>
        <DialogContent className="sm:max-w-[360px] p-0 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#17171A] [&>button]:hidden shadow-lg">
          <div className="flex flex-col items-center text-center p-6 space-y-3 font-sans">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200/70 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trash2 size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-white">
                Clear all notifications?
              </DialogTitle>
              <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                This will remove all notifications from your ledger. This action cannot be undone.
              </p>
            </div>
            <div className="flex w-full gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearHistoryModal(false)}
                className="flex-1 h-8 rounded-lg font-medium text-xs text-slate-700 dark:text-neutral-300 bg-white dark:bg-[#1E1E1E] hover:bg-slate-50 dark:hover:bg-white/[0.05] border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearAllNotifications}
                className="flex-1 h-8 rounded-lg font-medium text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
