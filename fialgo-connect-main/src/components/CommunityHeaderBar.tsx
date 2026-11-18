import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home as IconlyHome,
  Discovery as IconlyDiscovery,
  Play as IconlyPlay,
  Chat as IconlyChat,
  TwoUsers as IconlyTwoUsers,
  Notification as IconlyNotification,
} from "react-iconly";
import { triggerHaptic } from "@/utils/haptics";
import { supabase } from "@/lib/supabase";

export type CommunityTabId = "home" | "discover" | "live" | "inbox" | "channels";

interface CommunityHeaderBarProps {
  activeTab: CommunityTabId;
  showNotifications: boolean;
  onToggleNotifications: () => void;
  onActiveTabClick?: () => void;
  unreadCount?: number;
  className?: string;
}

export default function CommunityHeaderBar({
  activeTab,
  showNotifications,
  onToggleNotifications,
  onActiveTabClick,
  unreadCount,
  className = "",
}: CommunityHeaderBarProps) {
  const navigate = useNavigate();
  const [internalUnread, setInternalUnread] = useState(0);

  useEffect(() => {
    if (typeof unreadCount === "number") return;
    let active = true;
    const loadUnread = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user?.id) return;
        const [{ count: nCount }, { count: rCount }] = await Promise.all([
          supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("is_read", false),
          supabase
            .from("social_follow_requests")
            .select("id", { count: "exact", head: true })
            .eq("target_id", user.id),
        ]);
        if (active) setInternalUnread((nCount || 0) + (rCount || 0));
      } catch {
        // ignore
      }
    };
    loadUnread();
    return () => {
      active = false;
    };
  }, [unreadCount]);

  const effectiveUnread = typeof unreadCount === "number" ? unreadCount : internalUnread;

  const navItems: {
    id: CommunityTabId;
    label: string;
    path: string;
    renderIcon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      id: "home",
      label: "Home",
      path: "/home",
      renderIcon: (active) => (
        <IconlyHome
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={22}
        />
      ),
    },
    {
      id: "discover",
      label: "Discover",
      path: "/discover",
      renderIcon: (active) => (
        <IconlyDiscovery
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={22}
        />
      ),
    },
    {
      id: "live",
      label: "Live",
      path: "/creator/live",
      renderIcon: (active) => (
        <IconlyPlay
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={22}
        />
      ),
    },
    {
      id: "inbox",
      label: "Inbox",
      path: "/inbox",
      renderIcon: (active) => (
        <IconlyChat
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={22}
        />
      ),
    },
    {
      id: "channels",
      label: "Channels",
      path: "/channel",
      renderIcon: (active) => (
        <IconlyTwoUsers
          set="curved"
          stroke={active ? "bold" : "regular"}
          primaryColor="currentColor"
          size={22}
        />
      ),
    },
  ];

  return (
    <div className={`w-full bg-white dark:bg-[#121212] shrink-0 ${className}`}>
      {/* Row 0: Profile Pic (left) + Iconly Notification Bell (right) */}
      <div className="flex items-center justify-between px-6 pt-2.5 pb-1.5">
        <button
          type="button"
          onClick={() => {
            triggerHaptic("selection");
            navigate("/profile");
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shrink-0 active:scale-95 transition-transform cursor-pointer"
          title="Your Profile"
          aria-label="Your Profile"
        >
          <img
            src={localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg"}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg";
            }}
          />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic("selection");
            onToggleNotifications();
          }}
          className={`relative w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
            showNotifications
              ? "bg-slate-100 dark:bg-white/15 text-slate-900 dark:text-white"
              : "text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/10"
          }`}
          title={showNotifications ? "Close Notifications" : "Notifications"}
          aria-label="Notifications"
        >
          <IconlyNotification
            set={showNotifications ? "bold" : "curved"}
            stroke="bold"
            primaryColor="currentColor"
            size={22}
          />
          {effectiveUnread > 0 && !showNotifications && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-[#121212]" />
          )}
        </button>
      </div>

      {/* Row 1: 5-Icon Curved Iconly Navigation Bar */}
      <div className="w-full border-b border-slate-200/80 dark:border-white/10 px-3">
        <div className="grid grid-cols-5 items-center w-full">
        {navItems.map((item) => {
          const isCurrent = item.id === activeTab && !showNotifications;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                triggerHaptic("selection");
                if (item.id === activeTab) {
                  if (showNotifications) {
                    onToggleNotifications();
                  } else if (onActiveTabClick) {
                    onActiveTabClick();
                  }
                } else {
                  navigate(item.path);
                }
              }}
              title={item.label}
              aria-label={item.label}
              className={`flex items-center justify-center py-2.5 sm:py-3 relative cursor-pointer transition-colors select-none ${
                isCurrent
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {item.renderIcon(isCurrent)}
              {isCurrent && (
                <motion.div
                  layoutId="community-active-underline"
                  transition={{ type: "spring", stiffness: 450, damping: 34 }}
                  className="absolute bottom-0 inset-x-0 mx-auto w-9 h-[3px] bg-blue-600 rounded-full"
                />
              )}
            </button>
          );
        })}
        </div>
      </div>
    </div>
  );
}
