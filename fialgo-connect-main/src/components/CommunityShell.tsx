import React, { Suspense, createContext, useContext, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import CommunityHeaderBar, { CommunityTabId } from "@/components/CommunityHeaderBar";
import InlineNotificationsPanel from "@/components/InlineNotificationsPanel";
import { supabase } from "@/lib/supabase";

interface CommunityShellContextValue {
  inShell: boolean;
  setHeaderActions: (node: React.ReactNode) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const CommunityShellContext = createContext<CommunityShellContextValue>({
  inShell: false,
  setHeaderActions: () => {},
  scrollContainerRef: { current: null },
});

export function useCommunityShell() {
  return useContext(CommunityShellContext);
}

export function CommunityPageWrapper({
  children,
  breadcrumbs,
  headerActions,
  noPadding = true,
  noScroll = true,
  hideBottomNav = false,
}: {
  children: React.ReactNode;
  breadcrumbs?: { label: string; path?: string }[];
  headerActions?: React.ReactNode;
  noPadding?: boolean;
  noScroll?: boolean;
  hideBottomNav?: boolean;
}) {
  const { inShell, setHeaderActions } = useCommunityShell();

  useEffect(() => {
    if (!inShell) return;
    setHeaderActions(headerActions ?? null);
    return () => setHeaderActions(null);
  }, [inShell, headerActions, setHeaderActions]);

  if (inShell) {
    return <>{children}</>;
  }

  return (
    <DashboardLayout
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
      noPadding={noPadding}
      noScroll={noScroll}
      hideBottomNav={hideBottomNav}
    >
      {children}
    </DashboardLayout>
  );
}

const TAB_ORDER: Record<CommunityTabId, number> = {
  home: 0,
  discover: 1,
  live: 2,
  inbox: 3,
  channels: 4,
};

function resolveActiveTab(pathname: string): CommunityTabId {
  if (
    pathname.startsWith("/discover") ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/store") ||
    pathname.startsWith("/auto-trade/marketplace") ||
    pathname.startsWith("/learning") ||
    pathname.startsWith("/courses")
  ) {
    return "discover";
  }
  if (pathname.startsWith("/creator/live")) return "live";
  if (pathname.startsWith("/inbox")) return "inbox";
  if (pathname.startsWith("/channel")) return "channels";
  return "home";
}

export default function CommunityShell() {
  const location = useLocation();
  const activeTab = resolveActiveTab(location.pathname);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [headerActions, setHeaderActions] = useState<React.ReactNode>(null);

  const prevTabRef = useRef<CommunityTabId>(activeTab);
  const direction =
    TAB_ORDER[activeTab] >= TAB_ORDER[prevTabRef.current] ? 1 : -1;

  // Close inline notifications & reset scroll cleanly when switching tabs or query params
  useEffect(() => {
    setShowNotifications(false);
    prevTabRef.current = activeTab;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [activeTab, location.search]);

  // Clear page-provided headerActions when switching between tabs
  useEffect(() => {
    setHeaderActions(null);
  }, [location.pathname]);

  // Load unread count once for the persistent header bell
  useEffect(() => {
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
        if (active) setUnreadCount((nCount || 0) + (rCount || 0));
      } catch {
        // ignore
      }
    };
    loadUnread();
    return () => {
      active = false;
    };
  }, []);

  // Chat pages (Inbox / Channels) need fixed height so bottom message composer stays pinned
  const isFixedHeightRoute =
    !showNotifications && (activeTab === "inbox" || activeTab === "channels");

  return (
    <CommunityShellContext.Provider
      value={{ inShell: true, setHeaderActions, scrollContainerRef }}
    >
      <DashboardLayout noScroll={true} noPadding={true} headerActions={headerActions}>
        <div
          ref={scrollContainerRef}
          style={{ WebkitOverflowScrolling: "touch", willChange: "scroll-position" }}
          className={
            isFixedHeightRoute
              ? "w-full h-full flex flex-col min-h-0 overflow-hidden bg-white dark:bg-[#121212]"
              : "w-full h-full overflow-y-auto overflow-x-hidden overscroll-y-contain amazing-scrollbar bg-white dark:bg-[#121212]"
          }
        >
          {/* Persistent Community Header — stays stationary on tab switch, scrolls up smoothly with content */}
          <CommunityHeaderBar
            activeTab={activeTab}
            showNotifications={showNotifications}
            onToggleNotifications={() => {
              setShowNotifications((prev) => !prev);
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            unreadCount={unreadCount}
            onActiveTabClick={() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
              }
              window.dispatchEvent(new CustomEvent("community-scroll-top"));
            }}
          />

          {/* Only the Lower Page Area Animates & Changes */}
          <div
            className={
              isFixedHeightRoute
                ? "flex-1 min-h-0 relative overflow-hidden"
                : "w-full relative"
            }
          >
            {showNotifications ? (
              <motion.div
                key="community-inline-notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="w-full pb-24 md:pb-8"
              >
                <div className="w-full max-w-[760px] mx-auto">
                  <InlineNotificationsPanel onUnreadCountChange={setUnreadCount} />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={
                  isFixedHeightRoute
                    ? "w-full h-full min-h-0 flex flex-col overflow-hidden"
                    : "w-full"
                }
              >
                <Suspense
                  fallback={
                    <div className="w-full py-24 flex items-center justify-center">
                      <div className="w-7 h-7 border-2 border-slate-200 border-t-slate-900 dark:border-white/15 dark:border-t-white rounded-full animate-spin" />
                    </div>
                  }
                >
                  <Outlet />
                </Suspense>
              </motion.div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </CommunityShellContext.Provider>
  );
}
