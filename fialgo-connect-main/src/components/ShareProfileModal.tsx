import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Share2,
  Sparkles,
  QrCode,
  TrendingUp,
  Monitor,
  Smartphone,
  ExternalLink,
  Image as ImageIcon,
  Sliders,
  User,
  Link as LinkIcon,
  Download,
  ShieldCheck,
  Award,
  DollarSign,
  Users,
  Briefcase,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { getMergedSocialLinks } from "@/components/ProfileSocialIcons";

export interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: {
    id?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    banner_url?: string;
    bio?: string;
    tagline?: string;
    trading_style?: string;
    trades_count?: number;
    win_rate?: string | number;
    followers_count?: number;
    pnl?: string | number;
    funded_accounts?: number;
    level?: number;
    [key: string]: any;
  } | null;
}

type DeviceMode = "desktop" | "phone";
type ToolTab = "profile" | "background" | "stats" | "share";
type BgTheme = "liquid-chrome" | "obsidian" | "cyber" | "aurora" | "minimal";

interface BioSettings {
  bio: string;
  tagline: string;
  typeItOut: boolean;
  avatarUrl: string;
  backgroundTheme: BgTheme;
  customBgUrl: string | null;
  ctaText: string;
  showWinRate: boolean;
  showPnl: boolean;
  showTrades: boolean;
  showFollowers: boolean;
  showFundedAccounts: boolean;
  socials: {
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
    discord: string;
    tradingview: string;
  };
}

export default function ShareProfileModal({
  isOpen,
  onClose,
  profile,
}: ShareProfileModalProps) {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [activeTab, setActiveTab] = useState<ToolTab>("profile");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const displayName = profile?.display_name || "TradiFive Trader";
  const username = profile?.username || "trader";
  const avatarUrl = profile?.avatar_url || "/default-avatar.svg";
  const winRate = profile?.win_rate ? String(profile.win_rate).replace("%", "") + "%" : "68.4%";
  const tradesCount = profile?.trades_count || 142;
  const followersCount = profile?.followers_count || 320;
  const pnlValue = profile?.pnl || "+$14,250";
  const fundedAccountsCount = profile?.funded_accounts || 2;

  const storageKey = `tf_bio_links_settings_${username.toLowerCase()}`;

  // Load persistent user settings
  const [settings, setSettings] = useState<BioSettings>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    const initialSocials = getMergedSocialLinks(profile as any);
    return {
      bio: profile?.bio || "Discipline over motivation. Documenting my journey through funded trading accounts.",
      tagline: profile?.tagline || "NQ & Gold scalper. Funded since March.",
      typeItOut: true,
      avatarUrl: avatarUrl,
      backgroundTheme: "liquid-chrome",
      customBgUrl: null,
      ctaText: "Journal with me on TradiFive",
      showWinRate: true,
      showPnl: false,
      showTrades: true,
      showFollowers: true,
      showFundedAccounts: true,
      socials: {
        instagram: initialSocials.instagram || "",
        twitter: initialSocials.twitter || "",
        tiktok: "",
        youtube: initialSocials.youtube || "",
        discord: initialSocials.discord || "",
        tradingview: initialSocials.tradingview || "",
      },
    };
  });

  // Typewriter effect for Tagline
  const [displayedTagline, setDisplayedTagline] = useState("");
  useEffect(() => {
    if (!settings.typeItOut || !settings.tagline) {
      setDisplayedTagline(settings.tagline || "");
      return;
    }
    let index = 0;
    let isDeleting = false;
    let timer: any;
    const text = settings.tagline;

    const tick = () => {
      if (!isDeleting) {
        if (index <= text.length) {
          setDisplayedTagline(text.slice(0, index));
          index++;
          timer = setTimeout(tick, 60);
        } else {
          timer = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 2000);
        }
      } else {
        if (index > 0) {
          setDisplayedTagline(text.slice(0, index));
          index--;
          timer = setTimeout(tick, 35);
        } else {
          isDeleting = false;
          timer = setTimeout(tick, 600);
        }
      }
    };

    tick();
    return () => clearTimeout(timer);
  }, [settings.tagline, settings.typeItOut]);

  if (!isOpen) return null;

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/user/${username}`
      : `https://tradifive.in/user/${username}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    profileUrl
  )}&bgcolor=0a0b10&color=ffffff&margin=14`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile bio link copied to clipboard!");
      setTimeout(() => setCopied(false), 2400);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} (@${username}) on TradiFive`,
          text: `Check out my verified trading profile and bio link on TradiFive!`,
          url: profileUrl,
        });
        toast.success("Shared successfully!");
      } catch (err: any) {
        if (err.name !== "AbortError") handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
      // Also update merged social links for the user
      localStorage.setItem(
        `tradifive_social_links_user_${username.toLowerCase()}`,
        JSON.stringify(settings.socials)
      );
      toast.success("Saved! Your bio link & passport have been updated.");
    } catch {
      toast.error("Could not save settings locally.");
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSettings((prev) => ({
        ...prev,
        avatarUrl: reader.result as string,
      }));
      toast.success("Profile picture updated!");
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Studio Modal Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[920px] rounded-[28px] sm:rounded-[32px] bg-[#0c0d12] border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95),0_0_50px_rgba(59,130,246,0.12)] overflow-hidden text-white font-sans z-10 flex flex-col max-h-[92vh]"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-blue-600/10 blur-[80px] pointer-events-none" />

          {/* ── Top Header ── */}
          <div className="flex items-start justify-between px-6 pt-5 pb-3 shrink-0 relative z-10 border-b border-white/[0.06]">
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-extrabold text-white tracking-tight leading-tight">
                Links & Trading Passport
              </h2>
              <p className="text-[12.5px] text-zinc-400 mt-0.5">
                Your own page for your bio, free on every plan. Anyone who joins through it counts as yours.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Scrollable Body ── */}
          <div className="flex-1 overflow-y-auto amazing-scrollbar px-6 py-5 space-y-6 relative z-10">
            {/* Top Bar: "Your page" URL + Action Pills */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
              <div className="min-w-0 flex-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Your page
                </span>
                <span className="text-[17px] sm:text-[19px] font-black text-white font-mono tracking-tight truncate block mt-0.5 select-all">
                  tradifive.in/@{username}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-[12px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15 active:scale-95 shadow-sm"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copied ? "Copied!" : "Copy link"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-[12px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15 active:scale-95 shadow-sm"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>
                <a
                  href={`/user/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  <ExternalLink size={13} />
                  <span>View live</span>
                </a>
              </div>
            </div>

            {/* ── PREVIEW SECTION ── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-zinc-400">
                  What visitors see. Move your cursor over it, then customize below.
                </span>
                {/* Desktop / Phone Switcher */}
                <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.05] border border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setDeviceMode("desktop")}
                    className={`px-3 py-1 rounded-lg text-[11.5px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      deviceMode === "desktop"
                        ? "bg-white text-black shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Monitor size={13} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("phone")}
                    className={`px-3 py-1 rounded-lg text-[11.5px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      deviceMode === "phone"
                        ? "bg-white text-black shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>Phone</span>
                  </button>
                </div>
              </div>

              {/* Simulated Device Frame */}
              <div
                className={`relative mx-auto rounded-[24px] border border-white/15 overflow-hidden shadow-2xl transition-all duration-300 ${
                  deviceMode === "desktop"
                    ? "w-full max-w-[840px] aspect-[16/10] max-h-[420px]"
                    : "w-[300px] aspect-[9/18] max-h-[520px] rounded-[36px] border-4 border-zinc-800"
                }`}
              >
                {/* Desktop Browser Bar */}
                {deviceMode === "desktop" && (
                  <div className="h-9 px-4 bg-[#14151b] border-b border-white/[0.08] flex items-center justify-between z-20 relative select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    </div>
                    <div className="px-4 py-0.5 rounded-full bg-black/50 border border-white/10 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 max-w-[260px] truncate">
                      <LinkIcon size={10} className="text-zinc-500" />
                      <span>tradifive.in/@{username}</span>
                    </div>
                    <div className="w-12" />
                  </div>
                )}

                {/* Phone Notch */}
                {deviceMode === "phone" && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-30" />
                )}

                {/* ── Live Device Canvas ── */}
                <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                  {/* Dynamic 3D Theme Background */}
                  <div className="absolute inset-0 pointer-events-none">
                    {settings.backgroundTheme === "liquid-chrome" && (
                      <div className="w-full h-full bg-[#0a0b10] relative overflow-hidden">
                        {/* 3D Liquid Chrome Ambient Reflections */}
                        <div className="absolute -inset-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400/25 via-zinc-800/20 to-black/90 blur-[40px]" />
                        <svg className="absolute inset-0 w-full h-full opacity-35 mix-blend-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0,0 C30,40 70,20 100,50 L100,100 L0,100 Z" fill="url(#liquidChrome)" />
                          <defs>
                            <linearGradient id="liquidChrome" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                              <stop offset="50%" stopColor="#888888" stopOpacity="0.1" />
                              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    )}
                    {settings.backgroundTheme === "obsidian" && (
                      <div className="w-full h-full bg-gradient-to-b from-[#181920] via-[#0f1015] to-[#08080a]" />
                    )}
                    {settings.backgroundTheme === "cyber" && (
                      <div className="w-full h-full bg-[#090a12] bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.2)_0%,transparent_50%)]" />
                    )}
                    {settings.backgroundTheme === "aurora" && (
                      <div className="w-full h-full bg-[#060b0e] bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.3)_0%,transparent_60%)]" />
                    )}
                    {settings.backgroundTheme === "minimal" && (
                      <div className="w-full h-full bg-[#0e0f13]" />
                    )}
                  </div>

                  {/* ── Centered Glass Trading Card ── */}
                  <motion.div
                    layout
                    className={`relative z-10 w-full rounded-[24px] bg-[#101117]/85 backdrop-blur-xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] flex flex-col items-center text-center p-5 sm:p-6 transition-all ${
                      deviceMode === "desktop" ? "max-w-[340px]" : "max-w-[250px]"
                    }`}
                  >
                    {/* Avatar with Metallic Ring */}
                    <div className="relative mb-3">
                      <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-white/40 via-white/10 to-blue-500/50 shadow-xl">
                        <div className="w-full h-full rounded-full overflow-hidden bg-black">
                          <img
                            src={settings.avatarUrl}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/default-avatar.svg";
                            }}
                          />
                        </div>
                      </div>
                      <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-black flex items-center justify-center text-white">
                        <ShieldCheck size={9} strokeWidth={3} />
                      </span>
                    </div>

                    {/* Name & Handle */}
                    <h3 className="text-[16px] font-black text-white flex items-center justify-center gap-1.5 leading-tight">
                      <span>@{username}</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">
                        ✓
                      </span>
                    </h3>

                    {/* Dynamic Tagline (With Typewriter Animation) */}
                    {settings.tagline && (
                      <p className="text-[11.5px] text-zinc-300 font-medium mt-1 leading-snug min-h-[18px]">
                        {displayedTagline}
                        {settings.typeItOut && <span className="animate-pulse">|</span>}
                      </p>
                    )}

                    {/* Bio */}
                    {settings.bio && (
                      <p className="text-[10.5px] text-zinc-400 mt-1 line-clamp-2 max-w-[280px]">
                        {settings.bio}
                      </p>
                    )}

                    {/* ── Toggleable Numbers on Page ── */}
                    <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
                      {settings.showTrades && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300">
                          {tradesCount} trades
                        </span>
                      )}
                      {settings.showWinRate && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                          {winRate} Win
                        </span>
                      )}
                      {settings.showPnl && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400">
                          {pnlValue}
                        </span>
                      )}
                      {settings.showFundedAccounts && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400">
                          {fundedAccountsCount} Funded
                        </span>
                      )}
                      {settings.showFollowers && (
                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300">
                          {followersCount} followers
                        </span>
                      )}
                    </div>

                    {/* Social Round Buttons */}
                    <div className="flex items-center justify-center gap-2 mt-3.5 flex-wrap">
                      {settings.socials.instagram && (
                        <span className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 text-[11px] transition-colors">
                          📸
                        </span>
                      )}
                      {settings.socials.twitter && (
                        <span className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 text-[11px] transition-colors">
                          𝕏
                        </span>
                      )}
                      {settings.socials.tradingview && (
                        <span className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 text-[10px] font-bold transition-colors">
                          TV
                        </span>
                      )}
                      {settings.socials.discord && (
                        <span className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 text-[11px] transition-colors">
                          💬
                        </span>
                      )}
                      {settings.socials.youtube && (
                        <span className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-zinc-300 text-[11px] transition-colors">
                          ▶
                        </span>
                      )}
                    </div>

                    {/* Primary CTA Button */}
                    <div className="w-full mt-4">
                      <button
                        type="button"
                        className="w-full py-2 px-3 rounded-full bg-white hover:bg-zinc-100 text-black text-[12px] font-bold tracking-tight shadow-md transition-all active:scale-95"
                      >
                        {settings.ctaText}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ── FLOATING TOOLBAR DOCK (Exact Photo 2 & 3 Dock) ── */}
              <div className="flex justify-center pt-2">
                <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white/10 dark:bg-white/[0.08] backdrop-blur-xl border border-white/15 shadow-xl">
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "profile"
                        ? "bg-white text-black shadow-md"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    <User size={13} />
                    <span>Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("background")}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "background"
                        ? "bg-white text-black shadow-md"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>Background</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("stats")}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "stats"
                        ? "bg-white text-black shadow-md"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Sliders size={13} />
                    <span>Card & Numbers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("share")}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === "share"
                        ? "bg-white text-black shadow-md"
                        : "text-zinc-300 hover:text-white"
                    }`}
                  >
                    <Share2 size={13} />
                    <span>Share & QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ml-1"
                  >
                    <Check size={13} strokeWidth={3} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ── CUSTOMIZER EDITOR ACCORDION / PANELS ── */}
            <div className="pt-2">
              {/* Tab 1: YOUR PROFILE (Exact Photo 3) */}
              {activeTab === "profile" && (
                <div className="p-5 sm:p-6 rounded-[24px] bg-white/[0.03] border border-white/[0.08] space-y-6">
                  <div>
                    <h3 className="text-[17px] font-extrabold text-white tracking-tight">
                      Your profile
                    </h3>
                    <p className="text-[12px] text-zinc-400 mt-0.5">
                      Your picture, the line under your name, your bio and the numbers you show.
                    </p>
                  </div>

                  {/* Picture & Bio Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Picture */}
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 block mb-1">
                        PICTURE
                      </span>
                      <p className="text-[12px] text-zinc-500 mb-3">
                        Your profile picture shows on your page.
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[12.5px] font-bold inline-flex items-center gap-2 transition-colors cursor-pointer border border-white/15"
                      >
                        <ImageIcon size={14} />
                        <span>Change picture</span>
                      </button>
                    </div>

                    {/* Bio */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
                          BIO
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          {settings.bio.length}/280
                        </span>
                      </div>
                      <textarea
                        value={settings.bio}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, bio: e.target.value.slice(0, 280) }))
                        }
                        placeholder="Write a brief intro..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  {/* Tagline & Type it out */}
                  <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
                        TAGLINE
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {settings.tagline.length}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, tagline: e.target.value.slice(0, 60) }))
                      }
                      placeholder="NQ scalper. Funded since March."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[13px] text-white placeholder:text-zinc-600 outline-none focus:border-blue-500 transition-colors"
                    />

                    {/* Type it out Toggle */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="text-[13px] font-bold text-white block">
                          Type it out
                        </span>
                        <span className="text-[11.5px] text-zinc-400 block">
                          The line writes itself when someone opens your page.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.typeItOut}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, typeItOut: e.target.checked }))
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/15 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                      </label>
                    </div>
                  </div>

                  {/* Numbers on your page */}
                  <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 block">
                        NUMBERS ON YOUR PAGE
                      </span>
                      <p className="text-[12px] text-zinc-500">
                        All off until you turn them on. Your profile card shows the same.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Win rate */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[13px] font-semibold text-white">Win rate</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showWinRate}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, showWinRate: e.target.checked }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/15 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                        </label>
                      </div>

                      {/* P&L */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[13px] font-semibold text-white">P&L</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showPnl}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, showPnl: e.target.checked }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/15 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                        </label>
                      </div>

                      {/* Trades */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[13px] font-semibold text-white">Trades</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showTrades}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, showTrades: e.target.checked }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/15 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                        </label>
                      </div>

                      {/* Followers */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <span className="text-[13px] font-semibold text-white">Followers</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showFollowers}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, showFollowers: e.target.checked }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/15 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                        </label>
                      </div>

                      {/* Funded accounts */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] sm:col-span-2">
                        <span className="text-[13px] font-semibold text-white">Funded accounts</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showFundedAccounts}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                showFundedAccounts: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-white/15 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Socials Grid */}
                  <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 block">
                        SOCIALS
                      </span>
                      <p className="text-[12px] text-zinc-500">
                        Round buttons under your name. Your username or full address.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                          Instagram
                        </label>
                        <input
                          type="text"
                          value={settings.socials.instagram}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socials: { ...prev.socials, instagram: e.target.value },
                            }))
                          }
                          placeholder="@handle"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-[12.5px] text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                          X (Twitter)
                        </label>
                        <input
                          type="text"
                          value={settings.socials.twitter}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socials: { ...prev.socials, twitter: e.target.value },
                            }))
                          }
                          placeholder="@handle"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-[12.5px] text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                          TradingView
                        </label>
                        <input
                          type="text"
                          value={settings.socials.tradingview}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socials: { ...prev.socials, tradingview: e.target.value },
                            }))
                          }
                          placeholder="username"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-[12.5px] text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                          Discord
                        </label>
                        <input
                          type="text"
                          value={settings.socials.discord}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socials: { ...prev.socials, discord: e.target.value },
                            }))
                          }
                          placeholder="invite code or username"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-[12.5px] text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                          YouTube
                        </label>
                        <input
                          type="text"
                          value={settings.socials.youtube}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socials: { ...prev.socials, youtube: e.target.value },
                            }))
                          }
                          placeholder="@channel"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-[12.5px] text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                          TikTok
                        </label>
                        <input
                          type="text"
                          value={settings.socials.tiktok}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socials: { ...prev.socials, tiktok: e.target.value },
                            }))
                          }
                          placeholder="@handle"
                          className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-[12.5px] text-white placeholder:text-zinc-600 outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: 3D BACKGROUND THEMES */}
              {activeTab === "background" && (
                <div className="p-5 sm:p-6 rounded-[24px] bg-white/[0.03] border border-white/[0.08] space-y-4">
                  <div>
                    <h3 className="text-[17px] font-extrabold text-white tracking-tight">
                      Background Theme
                    </h3>
                    <p className="text-[12px] text-zinc-400 mt-0.5">
                      Choose the 3D aesthetic backdrop that appears behind your link-in-bio card.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                    {[
                      { id: "liquid-chrome", name: "Liquid Chrome 3D", desc: "Metallic fluid" },
                      { id: "obsidian", name: "Obsidian Wave", desc: "Dark sculpted" },
                      { id: "cyber", name: "Cyber Neon", desc: "Indigo & Pink" },
                      { id: "aurora", name: "Deep Aurora", desc: "Emerald borealis" },
                      { id: "minimal", name: "Stealth Minimal", desc: "Clean matte" },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, backgroundTheme: bg.id as BgTheme }))
                        }
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                          settings.backgroundTheme === bg.id
                            ? "bg-white/10 border-blue-500 shadow-md ring-1 ring-blue-500"
                            : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]"
                        }`}
                      >
                        <span className="text-[12px] font-bold text-white block">
                          {bg.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">
                          {bg.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: CARD & BUTTON SETTINGS */}
              {activeTab === "stats" && (
                <div className="p-5 sm:p-6 rounded-[24px] bg-white/[0.03] border border-white/[0.08] space-y-4">
                  <div>
                    <h3 className="text-[17px] font-extrabold text-white tracking-tight">
                      Call to Action & Card Styling
                    </h3>
                    <p className="text-[12px] text-zinc-400 mt-0.5">
                      Customize the primary button on your bio page to convert visitors into followers or copy-traders.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 block mb-1">
                      BUTTON TEXT
                    </label>
                    <input
                      type="text"
                      value={settings.ctaText}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, ctaText: e.target.value }))
                      }
                      placeholder="Journal with me on TradiFive"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-[13px] text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Tab 4: SHARE & QR */}
              {activeTab === "share" && (
                <div className="p-5 sm:p-6 rounded-[24px] bg-white/[0.03] border border-white/[0.08] space-y-6">
                  <div>
                    <h3 className="text-[17px] font-extrabold text-white tracking-tight">
                      Share & QR Code
                    </h3>
                    <p className="text-[12px] text-zinc-400 mt-0.5">
                      Share your bio passport link directly across platforms or download your print-ready QR code.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* QR Code */}
                    <div className="flex flex-col items-center p-4 rounded-2xl bg-black/50 border border-white/10 text-center">
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="w-40 h-40 rounded-xl bg-[#0a0b10] p-2 border border-white/15 shadow-lg"
                      />
                      <p className="text-[11px] text-zinc-400 font-medium mt-2.5">
                        Scan to visit verified trading passport
                      </p>
                    </div>

                    {/* Direct Social Share Buttons */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400 block mb-2">
                        SHARE DIRECTLY TO
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Check out my verified trading passport on TradiFive! 📈\n\n👉 ${profileUrl}`
                          );
                          window.open(`https://wa.me/?text=${text}`, "_blank");
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[12.5px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>Share on WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Trading with discipline on @tradifive! Check out my official trading bio page:\n\n${profileUrl}\n\n#Trading #Forex #TradiFive`
                          );
                          window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-[12.5px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>Share on X (Twitter)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const text = encodeURIComponent(
                            `Check out my verified trading passport on TradiFive!`
                          );
                          window.open(
                            `https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${text}`,
                            "_blank"
                          );
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[12.5px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>Share on Telegram</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
