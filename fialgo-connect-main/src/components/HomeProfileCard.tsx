import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Instagram } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useMarket } from "@/contexts/MarketContext";

interface HomeProfileCardProps {
  userId?: string;
}

export default function HomeProfileCard({ userId }: HomeProfileCardProps) {
  const navigate = useNavigate();
  const { activeMarket } = useMarket();

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

  // Compact style tag badge (e.g. LIQ, SMC, ICT, PA)
  const styleTag = (() => {
    const raw = String(profile?.trading_style || profile?.strategy_tag || "").trim();
    if (!raw) return "LIQ";
    if (raw.length <= 5) return raw.toUpperCase();
    return raw.slice(0, 3).toUpperCase();
  })();

  const favoritePair =
    String(profile?.favorite_pair || profile?.primary_symbol || "").trim().toUpperCase() ||
    (activeMarket === "indian" ? "NIFTY50" : "XAUUSD");

  const instagramUrl = profile?.instagram_url || profile?.instagram || "";

  const handleSocialClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (instagramUrl) {
      const href = instagramUrl.startsWith("http")
        ? instagramUrl
        : `https://instagram.com/${instagramUrl.replace(/^@/, "")}`;
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      navigate("/profile");
    }
  };

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

        {/* Top-Right Circular Instagram / Social Button */}
        <button
          type="button"
          onClick={handleSocialClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer"
          title={instagramUrl ? "Open Instagram" : "Edit profile links"}
          aria-label="Social link"
        >
          <Instagram size={15} strokeWidth={2} />
        </button>
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

        {/* Name + Verified Badge + Style Pill + Favorite Pair Pill */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="text-[15.5px] font-bold text-[#3B2E7E] dark:text-white tracking-tight leading-tight truncate hover:underline cursor-pointer"
              >
                {rawName}
              </button>
              {/* Verified Blue Badge */}
              <svg
                viewBox="0 0 22 22"
                className="w-[15px] h-[15px] shrink-0 text-[#2563EB]"
                fill="currentColor"
                aria-label="Verified"
              >
                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
              </svg>
              {/* Style Pill (e.g. LIQ) */}
              <span className="px-1.5 py-[1px] rounded-[6px] border border-slate-200/90 dark:border-white/15 text-[10.5px] font-semibold text-slate-600 dark:text-neutral-300 leading-tight tracking-wide">
                {styleTag}
              </span>
            </div>
            <p className="text-[12.5px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
              @{username}
            </p>
          </div>

          {/* Favorite Instrument Pill (e.g. XAUUSD with Gold Bars Badge) */}
          <div className="inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-100/90 dark:bg-white/[0.07] shrink-0">
            <span className="w-5 h-5 rounded-full bg-[#B5891C] flex items-center justify-center shrink-0 shadow-xs">
              <svg viewBox="0 0 16 16" className="w-3 h-3 text-[#FEF08A]" fill="currentColor">
                <path d="M5.5 4.5h5l.8 2.2H4.7l.8-2.2zM2.6 8.2h4.6l.8 2.4H1.8l.8-2.4zm6.2 0h4.6l.8 2.4H8l.8-2.4z" />
              </svg>
            </span>
            <span className="text-[11.5px] font-bold text-slate-900 dark:text-white tracking-tight">
              {favoritePair}
            </span>
          </div>
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
