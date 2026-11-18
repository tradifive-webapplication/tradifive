import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  Search as IconlySearch,
  Filter as IconlyFilter,
  Notification as IconlyNotification,
} from "react-iconly";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface InlineNotificationsPanelProps {
  userId?: string;
  onUnreadCountChange?: (count: number) => void;
}

export default function InlineNotificationsPanel({
  userId: propUserId,
  onUnreadCountChange,
}: InlineNotificationsPanelProps) {
  const navigate = useNavigate();
  const [resolvedUserId, setResolvedUserId] = useState<string>(propUserId || "");
  const userId = propUserId || resolvedUserId;

  useEffect(() => {
    if (propUserId) {
      setResolvedUserId(propUserId);
      return;
    }
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active && data?.user?.id) {
        setResolvedUserId(data.user.id);
      }
    });
    return () => {
      active = false;
    };
  }, [propUserId]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [followRequests, setFollowRequests] = useState<any[]>([]);
  const [actorProfiles, setActorProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unread">("all");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [mutedIds, setMutedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("tradifive_muted_notification_ids") || "[]");
    } catch {
      return [];
    }
  });

  const fetchAll = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [reqRes, notifRes] = await Promise.all([
        supabase
          .from("social_follow_requests")
          .select(
            "*, requester:profiles!social_follow_requests_requester_id_fkey(id, display_name, full_name, username, avatar_url)"
          )
          .eq("target_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(60),
      ]);

      const reqs = reqRes.data || [];
      const notifs = notifRes.data || [];
      setFollowRequests(reqs);
      setNotifications(notifs);

      // Hydrate sender avatars if present
      const actorIds = Array.from(
        new Set(
          notifs
            .map((n: any) => n.sender_id || n.actor_id || n.from_user_id)
            .filter(Boolean)
        )
      );
      if (actorIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, username, avatar_url")
          .in("id", actorIds);
        if (profs) {
          const map: Record<string, any> = {};
          profs.forEach((p: any) => {
            map[p.id] = p;
          });
          setActorProfiles(map);
        }
      }

      if (onUnreadCountChange) {
        const unreadNotifs = notifs.filter((n: any) => !n.is_read).length;
        onUnreadCountChange(unreadNotifs + reqs.length);
      }
    } catch (err) {
      console.error("Error loading inline notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [userId]);

  const formatShortDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const diffMs = Math.max(0, Date.now() - date.getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const handleMarkAllRead = async () => {
    setShowFilterMenu(false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (onUnreadCountChange) onUnreadCountChange(followRequests.length);
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      toast.success("All notifications marked as read");
    } catch {
      // ignore
    }
  };

  const handleOpenNotification = async (notif: any) => {
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      try {
        await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
      } catch {}
    }

    if (notif.link && typeof notif.link === "string") {
      if (notif.link.startsWith("http")) {
        window.open(notif.link, "_blank", "noopener,noreferrer");
      } else {
        navigate(notif.link);
      }
      return;
    }

    if (notif.post_id) {
      navigate(`/post/${notif.post_id}`);
      return;
    }

    const actorId = notif.sender_id || notif.actor_id || notif.from_user_id;
    const actor = actorId ? actorProfiles[actorId] : null;
    if (actor?.username) {
      navigate(`/user/${actor.username}`);
      return;
    }

    navigate("/notifications");
  };

  const handleMuteNotification = async (notif: any) => {
    const nextMuted = Array.from(new Set([...mutedIds, String(notif.id)]));
    setMutedIds(nextMuted);
    try {
      localStorage.setItem(
        "tradifive_muted_notification_ids",
        JSON.stringify(nextMuted.slice(-200))
      );
    } catch {}

    try {
      await supabase.from("notifications").update({ is_read: true }).eq("id", notif.id);
    } catch {}

    toast.info("Notification muted");
  };

  const handleFollowRequestAction = async (req: any, accept: boolean) => {
    setFollowRequests((prev) => prev.filter((r) => r.id !== req.id));
    try {
      if (accept && req.requester_id) {
        await supabase
          .from("social_follows")
          .insert([{ follower_id: req.requester_id, following_id: userId }]);
        toast.success("Follow request accepted");
      } else {
        toast.info("Follow request declined");
      }
      await supabase.from("social_follow_requests").delete().eq("id", req.id);
    } catch (err) {
      console.error("Follow request action failed:", err);
    }
  };

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notifications.filter((n) => {
      if (mutedIds.includes(String(n.id))) return false;
      if (filterMode === "unread" && n.is_read) return false;
      if (!q) return true;
      const actorId = n.sender_id || n.actor_id || n.from_user_id;
      const actor = actorId ? actorProfiles[actorId] : null;
      const haystack = `${n.title || ""} ${n.message || ""} ${actor?.full_name || ""} ${
        actor?.username || ""
      }`.toLowerCase();
      return haystack.includes(q);
    });
  }, [notifications, mutedIds, filterMode, searchQuery, actorProfiles]);

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return followRequests;
    return followRequests.filter((r) => {
      const name = `${r.requester?.display_name || ""} ${r.requester?.full_name || ""} ${
        r.requester?.username || ""
      }`.toLowerCase();
      return name.includes(q);
    });
  }, [followRequests, searchQuery]);

  return (
    <div className="px-2.5 sm:px-4 pt-4 pb-8">
      {/* Header: "Notifications" + Circular Filter Button */}
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">
          Notifications
        </h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFilterMenu((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Filter notifications"
            aria-label="Filter notifications"
          >
            <IconlyFilter set="curved" stroke="bold" primaryColor="currentColor" size={18} />
          </button>

          {showFilterMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowFilterMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 shadow-xl py-1.5 z-40 text-[13px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setFilterMode("all");
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer ${
                    filterMode === "all"
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  All notifications
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFilterMode("unread");
                    setShowFilterMenu(false);
                  }}
                  className={`w-full px-3.5 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer ${
                    filterMode === "unread"
                      ? "text-blue-600 dark:text-blue-400 font-bold"
                      : "text-slate-700 dark:text-slate-200"
                  }`}
                >
                  Unread only
                </button>
                <div className="my-1 border-t border-slate-100 dark:border-white/10" />
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Search Pill */}
      <div className="flex items-center gap-2.5 h-11 px-4 rounded-full bg-slate-100/90 dark:bg-white/[0.07] border border-transparent focus-within:border-slate-300 dark:focus-within:border-white/20 transition-colors mb-3">
        <span className="text-slate-400 dark:text-zinc-500 shrink-0 flex items-center">
          <IconlySearch set="curved" stroke="regular" primaryColor="currentColor" size={18} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or what happened"
          className="flex-1 bg-transparent text-[14.5px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none"
        />
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-14">
          <Loader2 size={22} className="animate-spin text-slate-400" />
        </div>
      ) : filteredRequests.length === 0 && filteredNotifications.length === 0 ? (
        <div className="py-16 text-center flex flex-col items-center gap-2.5">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-400">
            <IconlyNotification set="curved" stroke="regular" primaryColor="currentColor" size={24} />
          </div>
          <p className="text-[15px] font-bold text-slate-800 dark:text-white">
            {searchQuery ? "No matching notifications" : "You're all caught up"}
          </p>
          <p className="text-[13px] text-slate-400 dark:text-zinc-500 max-w-xs">
            {searchQuery
              ? "Try searching a different trader name or keyword."
              : "Likes, replies, follows, and TradiFive alerts will appear here."}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-white/10">
          {/* Pending Follow Requests */}
          {filteredRequests.map((req) => {
            const name =
              req.requester?.display_name ||
              req.requester?.full_name ||
              req.requester?.username ||
              "Trader";
            const avatar = req.requester?.avatar_url || "/default-avatar.svg";
            return (
              <div key={`req-${req.id}`} className="py-4 flex items-start gap-3">
                <img
                  src={avatar}
                  alt={name}
                  onClick={() =>
                    req.requester?.username && navigate(`/user/${req.requester.username}`)
                  }
                  className="w-11 h-11 rounded-full object-cover bg-slate-100 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 shrink-0 cursor-pointer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14.5px] text-slate-800 dark:text-slate-100 leading-snug">
                      <span className="font-bold text-slate-900 dark:text-white">{name}</span>{" "}
                      <span className="text-slate-600 dark:text-slate-300">
                        requested to follow you
                      </span>
                    </p>
                    <span className="text-[12.5px] text-slate-400 dark:text-zinc-500 shrink-0">
                      {formatShortDate(req.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={() => handleFollowRequestAction(req, true)}
                      className="px-5 py-1.5 rounded-full tactile-black-pill text-[13px] font-bold cursor-pointer select-none"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFollowRequestAction(req, false)}
                      className="px-5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-800 dark:text-slate-200 text-[13px] font-bold transition-colors cursor-pointer select-none"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Standard Notifications */}
          {filteredNotifications.map((notif) => {
            const actorId = notif.sender_id || notif.actor_id || notif.from_user_id;
            const actor = actorId ? actorProfiles[actorId] : null;
            const isSystem = !actor;
            const displayActor = actor
              ? actor.display_name || actor.full_name || actor.username || "Trader"
              : "TRADIFIVE";
            const avatarSrc = actor ? actor.avatar_url || "/default-avatar.svg" : "/tf-logo.png";

            return (
              <div key={notif.id} className="py-4 flex items-start gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-900 dark:bg-white/10 border border-slate-200/70 dark:border-white/10 shrink-0 flex items-center justify-center">
                  <img
                    src={avatarSrc}
                    alt={displayActor}
                    className={isSystem ? "w-7 h-7 object-contain" : "w-full h-full object-cover"}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg";
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span
                        className={`text-[14.5px] font-bold leading-tight ${
                          isSystem
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {displayActor}
                      </span>
                      {isSystem && (
                        <>
                          <CheckCircle2
                            size={14}
                            className="text-emerald-500 fill-emerald-500/15 shrink-0"
                          />
                          <span className="text-[10.5px] font-extrabold px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-white/15 text-slate-500 dark:text-zinc-400 tracking-wide">
                            TF
                          </span>
                        </>
                      )}
                      {notif.title && (
                        <span className="text-[14px] text-slate-600 dark:text-slate-300 leading-snug">
                          {notif.title}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                      <span className="text-[12.5px] text-slate-400 dark:text-zinc-500">
                        {formatShortDate(notif.created_at)}
                      </span>
                    </div>
                  </div>

                  {notif.message && (
                    <p className="text-[13.5px] text-slate-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-snug break-words">
                      {notif.message}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2.5">
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(notif)}
                      className="px-5 py-1.5 rounded-full tactile-black-pill text-[13px] font-bold cursor-pointer select-none"
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMuteNotification(notif)}
                      className="px-5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-slate-800 dark:text-slate-200 text-[13px] font-bold transition-colors cursor-pointer select-none"
                    >
                      Mute
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
