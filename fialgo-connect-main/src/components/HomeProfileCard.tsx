import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface HomeProfileCardProps {
  userId?: string;
}

export default function HomeProfileCard({ userId }: HomeProfileCardProps) {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(() => {
    try {
      const uid = userId || localStorage.getItem("tradifive_user_id") || "";
      if (uid) {
        const cached = localStorage.getItem(`prof_cache_data_${uid}`);
        if (cached) return JSON.parse(cached);
      }
      return {
        display_name: localStorage.getItem("tradifive_cached_display_name") || "Trader",
        username: localStorage.getItem("tradifive_cached_username") || "trader",
        avatar_url: localStorage.getItem("tradifive_cached_avatar_url") || "/default-avatar.svg",
        banner_url: localStorage.getItem("tradifive_cached_banner_url") || "",
      };
    } catch {
      return {
        display_name: "Trader",
        username: "trader",
        avatar_url: "/default-avatar.svg",
        banner_url: "",
      };
    }
  });

  const [followersCount, setFollowersCount] = useState<number>(() => {
    try {
      const uid = userId || localStorage.getItem("tradifive_user_id") || "";
      const cached = uid ? localStorage.getItem(`prof_cache_followers_${uid}`) : null;
      return cached ? Number(cached) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [followingCount, setFollowingCount] = useState<number>(() => {
    try {
      const uid = userId || localStorage.getItem("tradifive_user_id") || "";
      const cached = uid ? localStorage.getItem(`prof_cache_following_${uid}`) : null;
      return cached ? Number(cached) || 0 : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let uid = userId;
        if (!uid) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          uid = user?.id;
        }
        if (!uid) return;

        const [profRes, followersRes, followingRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
          supabase
            .from("social_follows")
            .select("*", { count: "exact", head: true })
            .eq("following_id", uid),
          supabase
            .from("social_follows")
            .select("*", { count: "exact", head: true })
            .eq("follower_id", uid),
        ]);

        if (!active) return;

        if (profRes.data) {
          setProfile(profRes.data);
          try {
            localStorage.setItem(`prof_cache_data_${uid}`, JSON.stringify(profRes.data));
          } catch {
            // ignore
          }
        }
        if (typeof followersRes.count === "number") {
          setFollowersCount(followersRes.count);
          try {
            localStorage.setItem(`prof_cache_followers_${uid}`, String(followersRes.count));
          } catch {
            // ignore
          }
        }
        if (typeof followingRes.count === "number") {
          setFollowingCount(followingRes.count);
          try {
            localStorage.setItem(`prof_cache_following_${uid}`, String(followingRes.count));
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore network errors gracefully
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const rawName =
    profile?.display_name ||
    profile?.full_name ||
    profile?.username ||
    "Trader";
  const username = (profile?.username || rawName)
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "");
  const avatarSrc = profile?.avatar_url || "/default-avatar.svg";
  const bannerSrc =
    profile?.banner_url && profile.banner_url !== "/default-cover.png"
      ? profile.banner_url
      : avatarSrc;

  // Compact style tag badge (e.g. DAY, LIQ, SMC) — only shown if profile has one
  const styleTag = (() => {
    const raw = String(profile?.trading_style || profile?.strategy_tag || "").trim();
    if (!raw) return "";
    if (raw.length <= 5) return raw.toUpperCase();
    return raw.slice(0, 3).toUpperCase();
  })();

  return (
    <div className="rounded-[22px] bg-white dark:bg-[#17171A] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.045)] dark:shadow-none overflow-hidden select-none">
      {/* Banner Header with Smooth Bottom Fade */}
      <div className="relative h-[112px] w-full overflow-hidden bg-slate-200/70 dark:bg-white/[0.05]">
        <img
          src={bannerSrc}
          alt="Profile banner"
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg";
          }}
        />
        {/* Soft white/dark fade melting banner cleanly into card surface */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white via-white/55 to-transparent dark:from-[#17171A] dark:via-[#17171A]/55" />
      </div>

      {/* Card Body */}
      <div className="px-4 pb-4">
        {/* Overlapping Circular Avatar */}
        <div className="relative z-10 -mt-9 mb-2.5 flex items-end justify-between">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="w-[62px] h-[62px] rounded-full overflow-hidden ring-[3.5px] ring-white dark:ring-[#17171A] bg-slate-100 dark:bg-white/10 shadow-sm shrink-0 cursor-pointer active:scale-95 transition-transform"
            aria-label="Open profile"
          >
            <img
              src={avatarSrc}
              alt={rawName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg";
              }}
            />
          </button>
        </div>

        {/* Name + Optional Style Pill + Handle */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="text-[15.5px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate hover:underline cursor-pointer"
            >
              {rawName}
            </button>
            {styleTag && (
              <span className="px-1.5 py-[1px] rounded-[6px] border border-slate-200/90 dark:border-white/15 text-[10.5px] font-semibold text-slate-600 dark:text-neutral-300 leading-tight tracking-wide">
                {styleTag}
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
            @{username}
          </p>
        </div>

        {/* Bottom Row: Following / Followers + View profile Pill */}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="flex items-center gap-3 text-[12.5px] cursor-pointer group"
          >
            <span className="text-slate-500 dark:text-neutral-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors tabular-nums">
              <strong className="font-bold text-slate-900 dark:text-white">
                {followingCount}
              </strong>{" "}
              following
            </span>
            <span className="text-slate-500 dark:text-neutral-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors tabular-nums">
              <strong className="font-bold text-slate-900 dark:text-white">
                {followersCount}
              </strong>{" "}
              followers
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="px-4 py-1.5 rounded-full bg-white dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/15 hover:bg-slate-50 dark:hover:bg-white/[0.11] text-[12.5px] font-semibold text-slate-900 dark:text-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] active:scale-[0.97] transition-all cursor-pointer shrink-0"
          >
            View profile
          </button>
        </div>
      </div>
    </div>
  );
}
