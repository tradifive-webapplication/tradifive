import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Bell,
  UserPlus,
  MessageSquare,
  Hash,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Award,
  Check,
  X,
  ArrowRight
} from "lucide-react";

// Web Audio API Pleasant Dual-Tone Apple/Slack Style Chime
export const playBigTechChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc2.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.12);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);
  } catch (_) {}
};

// Mobile Haptic Vibration Pattern
export const triggerMobileHaptics = () => {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([25, 45, 25]);
    }
  } catch (_) {}
};

interface PushNotificationToastProps {
  t: string | number;
  avatar?: string | null;
  name: string;
  handle?: string | null;
  badgeType: "follow" | "message" | "channel" | "trade" | "risk" | "system";
  headline: string;
  body: string;
  timeAgoText?: string;
  primaryAction?: {
    label: string;
    onClick: () => void | Promise<void>;
    successLabel?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

function PushNotificationCard({
  t,
  avatar,
  name,
  handle,
  badgeType,
  headline,
  body,
  timeAgoText = "Just now",
  primaryAction,
  secondaryAction
}: PushNotificationToastProps) {
  const [actionDone, setActionDone] = React.useState(false);
  const [loadingAction, setLoadingAction] = React.useState(false);

  const getBadgeIcon = () => {
    switch (badgeType) {
      case "follow":
        return <UserPlus size={10} className="text-white" />;
      case "message":
        return <MessageSquare size={10} className="text-white" />;
      case "channel":
        return <Hash size={10} className="text-white" />;
      case "trade":
        return <TrendingUp size={10} className="text-white" />;
      case "risk":
        return <ShieldAlert size={10} className="text-white" />;
      default:
        return <Bell size={10} className="text-white" />;
    }
  };

  const getBadgeColor = () => {
    switch (badgeType) {
      case "follow":
        return "bg-indigo-600";
      case "message":
        return "bg-blue-600";
      case "channel":
        return "bg-emerald-600";
      case "trade":
        return "bg-emerald-500";
      case "risk":
        return "bg-amber-500";
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div
      onClick={() => {
        if (secondaryAction) {
          secondaryAction.onClick();
        } else if (primaryAction && !actionDone) {
          primaryAction.onClick();
        }
      }}
      className="w-[calc(100vw-24px)] max-w-[400px] p-3.5 bg-white/95 dark:bg-[#12131A]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14),0_4px_14px_rgba(0,0,0,0.06)] flex items-start gap-3 relative overflow-hidden select-none cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] group font-sans"
    >
      {/* Sender Avatar / Icon with Badge */}
      <div className="relative shrink-0 mt-0.5">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10 shadow-xs"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/default-avatar.svg";
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            {name ? name[0].toUpperCase() : "T"}
          </div>
        )}
        <div
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${getBadgeColor()} border-2 border-white dark:border-[#12131A] flex items-center justify-center shadow-xs`}
        >
          {getBadgeIcon()}
        </div>
      </div>

      {/* Notification Body */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
              {name}
            </h4>
            {handle && (
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 truncate">
                @{handle}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 shrink-0">
            {timeAgoText}
          </span>
        </div>

        <p className="text-[12px] text-slate-600 dark:text-slate-300 font-normal line-clamp-2 mt-0.5 leading-snug break-words">
          {headline && <span className="font-semibold text-slate-900 dark:text-white">{headline} </span>}
          {body}
        </p>

        {/* Action Controls */}
        <div className="flex items-center gap-2 mt-2.5">
          {primaryAction && (
            <button
              type="button"
              disabled={actionDone || loadingAction}
              onClick={async (e) => {
                e.stopPropagation();
                if (actionDone) return;
                setLoadingAction(true);
                try {
                  await primaryAction.onClick();
                  setActionDone(true);
                  setTimeout(() => toast.dismiss(t), 2000);
                } catch (_) {
                } finally {
                  setLoadingAction(false);
                }
              }}
              className={`h-7 px-3 rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1.5 ${
                actionDone
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20"
                  : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 active:scale-95"
              }`}
            >
              {actionDone ? (
                <>
                  <Check size={12} strokeWidth={2.8} />
                  <span>{primaryAction.successLabel || "Done"}</span>
                </>
              ) : (
                <span>{primaryAction.label}</span>
              )}
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t);
                secondaryAction.onClick();
              }}
              className="h-7 px-2.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white text-[11px] font-semibold transition-colors flex items-center gap-1"
            >
              <span>{secondaryAction.label}</span>
              <ArrowRight size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toast.dismiss(t);
        }}
        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors -mr-1 -mt-1 cursor-pointer"
        title="Dismiss"
      >
        <X size={12} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default function GlobalPushNotificationListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const handledIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let notifsChannel: any = null;
    let dmChannel: any = null;
    let followsChannel: any = null;
    let channelMsgsChannel: any = null;

    const setupListeners = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentUserId = user.id;

      // Request browser notification permission if supported
      try {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
          Notification.requestPermission().catch(() => {});
        }
      } catch (_) {}

      // 1. Channel for public.notifications table
      notifsChannel = supabase
        .channel(`push-notifs-${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${currentUserId}`
          },
          async (payload) => {
            const row = payload.new;
            if (!row || !row.id) return;

            // Prevent duplicate triggers
            const dedupeKey = `notif-${row.id}`;
            if (handledIdsRef.current.has(dedupeKey)) return;
            handledIdsRef.current.add(dedupeKey);

            // Audio & Haptic feedback
            playBigTechChime();
            triggerMobileHaptics();

            const meta = row.metadata || {};
            const type = (row.type || "").toUpperCase();

            // Extract sender info
            let senderName = meta.sender_name || row.sender_username || "A trader";
            let senderUsername = meta.sender_username || row.sender_username || null;
            let senderAvatar = meta.sender_avatar || row.sender_avatar || null;
            const senderId = meta.sender_id || row.sender_id || null;

            // If actor info is missing, fetch from profiles if senderId exists
            if (!senderUsername && senderId) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("display_name, username, avatar_url")
                .eq("id", senderId)
                .maybeSingle();

              if (profile) {
                senderName = profile.display_name || profile.username || senderName;
                senderUsername = profile.username;
                senderAvatar = profile.avatar_url;
              }
            }

            // Desktop notification fallback if window is backgrounded
            if (document.hidden && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              try {
                new Notification(row.title || "TradiFive Notification", {
                  body: row.message || "",
                  icon: senderAvatar || "/pwa-192x192.png"
                });
              } catch (_) {}
            }

            // Determine badge type and buttons based on notification type
            if (type === "FOLLOW" || row.title?.toLowerCase().includes("follow")) {
              const followTargetId = senderId;
              toast.custom(
                (t) => (
                  <PushNotificationCard
                    t={t}
                    avatar={senderAvatar}
                    name={senderName}
                    handle={senderUsername}
                    badgeType="follow"
                    headline=""
                    body={row.message || "started following you!"}
                    primaryAction={
                      followTargetId
                        ? {
                            label: "Follow Back",
                            successLabel: "Following",
                            onClick: async () => {
                              await supabase.from("social_follows").insert({
                                follower_id: currentUserId,
                                following_id: followTargetId
                              });
                              // Also send reciprocal notification
                              await supabase.from("notifications").insert([{
                                user_id: followTargetId,
                                type: "FOLLOW",
                                title: "New Follower",
                                message: `${user.user_metadata?.full_name || user.email?.split("@")[0] || "Someone"} followed you back!`,
                                priority: "normal",
                                is_read: false,
                                metadata: {
                                  sender_id: currentUserId,
                                  sender_username: user.user_metadata?.username,
                                  sender_avatar: user.user_metadata?.avatar_url
                                }
                              }]);
                            }
                          }
                        : undefined
                    }
                    secondaryAction={
                      senderUsername
                        ? {
                            label: "View Profile",
                            onClick: () => navigate(`/profile/${senderUsername}`)
                          }
                        : {
                            label: "View All",
                            onClick: () => navigate("/notifications")
                          }
                    }
                  />
                ),
                { duration: 6500, id: `toast-${row.id}` }
              );
            } else if (type === "TRADE" || type === "RISK_GUARD") {
              toast.custom(
                (t) => (
                  <PushNotificationCard
                    t={t}
                    avatar={null}
                    name={row.title || "Trading Alert"}
                    handle={null}
                    badgeType={type === "RISK_GUARD" ? "risk" : "trade"}
                    headline=""
                    body={row.message || ""}
                    primaryAction={{
                      label: "View Journal",
                      onClick: () => navigate("/journal/history")
                    }}
                  />
                ),
                { duration: 6000, id: `toast-${row.id}` }
              );
            } else {
              toast.custom(
                (t) => (
                  <PushNotificationCard
                    t={t}
                    avatar={senderAvatar}
                    name={senderName || row.title || "TradiFive Alert"}
                    handle={senderUsername}
                    badgeType="system"
                    headline=""
                    body={row.message || ""}
                    secondaryAction={{
                      label: "View Alerts",
                      onClick: () => navigate("/notifications")
                    }}
                  />
                ),
                { duration: 6000, id: `toast-${row.id}` }
              );
            }
          }
        )
        .subscribe();

      // 2. Fallback Direct Follow Listener (if public.social_follows is inserted directly)
      followsChannel = supabase
        .channel(`push-follows-${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "social_follows",
            filter: `following_id=eq.${currentUserId}`
          },
          async (payload) => {
            const followerId = payload.new?.follower_id;
            if (!followerId) return;

            const dedupeKey = `follow-${followerId}`;
            if (handledIdsRef.current.has(dedupeKey)) return;
            handledIdsRef.current.add(dedupeKey);

            // Fetch follower profile
            const { data: follower } = await supabase
              .from("profiles")
              .select("id, display_name, username, avatar_url")
              .eq("id", followerId)
              .maybeSingle();

            const name = follower?.display_name || follower?.username || "A trader";
            const username = follower?.username;
            const avatar = follower?.avatar_url;

            playBigTechChime();
            triggerMobileHaptics();

            toast.custom(
              (t) => (
                <PushNotificationCard
                  t={t}
                  avatar={avatar}
                  name={name}
                  handle={username}
                  badgeType="follow"
                  headline=""
                  body="started following you!"
                  primaryAction={{
                    label: "Follow Back",
                    successLabel: "Following",
                    onClick: async () => {
                      await supabase.from("social_follows").insert({
                        follower_id: currentUserId,
                        following_id: followerId
                      });
                    }
                  }}
                  secondaryAction={
                    username
                      ? {
                          label: "View Profile",
                          onClick: () => navigate(`/profile/${username}`)
                        }
                      : undefined
                  }
                />
              ),
              { duration: 6500, id: `toast-follow-${followerId}` }
            );
          }
        )
        .subscribe();

      // 3. Direct Message Listener
      dmChannel = supabase
        .channel(`push-dm-${currentUserId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "direct_messages",
            filter: `receiver_id=eq.${currentUserId}`
          },
          async (payload) => {
            const msg = payload.new;
            if (!msg || !msg.sender_id) return;

            // If user is currently in /inbox, suppress toast
            if (location.pathname.startsWith("/inbox")) return;

            const dedupeKey = `dm-${msg.id}`;
            if (handledIdsRef.current.has(dedupeKey)) return;
            handledIdsRef.current.add(dedupeKey);

            playBigTechChime();
            triggerMobileHaptics();

            const { data: sender } = await supabase
              .from("profiles")
              .select("id, display_name, username, avatar_url")
              .eq("id", msg.sender_id)
              .maybeSingle();

            const name = sender?.display_name || sender?.username || "Trader";
            const username = sender?.username;
            const avatar = sender?.avatar_url;

            toast.custom(
              (t) => (
                <PushNotificationCard
                  t={t}
                  avatar={avatar}
                  name={name}
                  handle={username}
                  badgeType="message"
                  headline="sent you a message:"
                  body={msg.content || "Attached media"}
                  primaryAction={{
                    label: "Reply",
                    onClick: () => {
                      navigate("/inbox", { state: { targetUserId: msg.sender_id } });
                    }
                  }}
                />
              ),
              { duration: 6500, id: `toast-dm-${msg.id}` }
            );
          }
        )
        .subscribe();

      // 4. Channel Message Listener (for channels the user belongs to)
      try {
        const { data: memberChannels } = await supabase
          .from("channel_members")
          .select("channel_id, channels:channel_id(name)")
          .eq("user_id", currentUserId);

        const channelMap: Record<string, string> = {};
        if (memberChannels && memberChannels.length > 0) {
          memberChannels.forEach((mc: any) => {
            if (mc.channel_id) {
              channelMap[mc.channel_id] = mc.channels?.name || "channel";
            }
          });

          channelMsgsChannel = supabase
            .channel(`push-channel-msgs-${currentUserId}`)
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "channel_messages"
              },
              async (payload) => {
                const msg = payload.new;
                if (!msg || msg.user_id === currentUserId) return;
                if (!channelMap[msg.channel_id]) return;

                // Suppress if user is currently looking at that channel
                if (location.pathname.includes(msg.channel_id)) return;

                const dedupeKey = `ch-${msg.id}`;
                if (handledIdsRef.current.has(dedupeKey)) return;
                handledIdsRef.current.add(dedupeKey);

                playBigTechChime();
                triggerMobileHaptics();

                const { data: author } = await supabase
                  .from("profiles")
                  .select("display_name, username, avatar_url")
                  .eq("id", msg.user_id)
                  .maybeSingle();

                const channelName = channelMap[msg.channel_id];
                const authorName = author?.display_name || author?.username || "Trader";

                toast.custom(
                  (t) => (
                    <PushNotificationCard
                      t={t}
                      avatar={author?.avatar_url}
                      name={`#${channelName}`}
                      handle={authorName}
                      badgeType="channel"
                      headline=""
                      body={msg.content || "Sent a message"}
                      primaryAction={{
                        label: "Open Channel",
                        onClick: () => navigate(`/channel/${msg.channel_id}`)
                      }}
                    />
                  ),
                  { duration: 6000, id: `toast-ch-${msg.id}` }
                );
              }
            )
            .subscribe();
        }
      } catch (_) {}
    };

    setupListeners();

    return () => {
      if (notifsChannel) supabase.removeChannel(notifsChannel);
      if (followsChannel) supabase.removeChannel(followsChannel);
      if (dmChannel) supabase.removeChannel(dmChannel);
      if (channelMsgsChannel) supabase.removeChannel(channelMsgsChannel);
    };
  }, [navigate, location.pathname]);

  return null;
}
