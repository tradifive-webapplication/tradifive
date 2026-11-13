import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Share2,
  Crown,
  ShieldCheck,
  Sparkles,
  QrCode,
  TrendingUp,
  Award,
  Link as LinkIcon,
  Cpu
} from "lucide-react";
import { toast } from "sonner";

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    banner_url?: string;
    bio?: string;
    trading_style?: string;
    trades_count?: number;
    win_rate?: string | number;
    followers_count?: number;
    level?: number;
  };
}

export default function ShareProfileModal({
  isOpen,
  onClose,
  profile
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const displayName = profile?.display_name || "TradiFive Trader";
  const username = profile?.username || "trader";
  const avatarUrl = profile?.avatar_url || "/default-avatar.svg";
  const bannerUrl = profile?.banner_url || "/default-cover.png";
  const level = profile?.level || 1;
  const style = profile?.trading_style?.split(",")[0] || "Forex & Gold Trader";
  const winRate = profile?.win_rate ? String(profile.win_rate).replace("%", "") + "%" : "68%";
  const tradesCount = profile?.trades_count || 0;

  // Always resolve to the official production URL so shared links work worldwide
  const profileUrl = typeof window !== "undefined"
    ? (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? `https://tradifive.in/user/${username}`
        : `${window.location.origin}/user/${username}`)
    : `https://tradifive.in/user/${username}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(profileUrl)}&bgcolor=090a0f&color=ffffff&margin=12`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile passport link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} on TradiFive`,
          text: `Check out ${displayName}'s official trading passport on TradiFive — The Platform for Disciplined Trading.`,
          url: profileUrl,
        });
        toast.success("Shared successfully!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const shareToWhatsapp = () => {
    const text = encodeURIComponent(
      `Hey! Check out my official Trading Passport on TradiFive 📈\n\n👤 ${displayName} (@${username})\n🏆 Level ${level} · ${style}\n\n👉 View my verified profile: ${profileUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(
      `Trading with discipline on @tradifive! Check out my verified trading passport:\n\n${profileUrl}\n\n#Trading #Forex #TradiFive #Discipline`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(`Check out ${displayName}'s official Trading Passport on TradiFive!`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[430px] rounded-[28px] bg-[#0c0d12] border border-white/10 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9),0_0_50px_rgba(59,130,246,0.12)] overflow-hidden text-white font-sans z-10"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-blue-500/10 blur-[60px] pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
                <Share2 size={14} />
              </div>
              <div>
                <h3 className="text-[15px] font-extrabold text-white tracking-tight flex items-center gap-1.5 leading-none">
                  Share Profile
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 font-medium leading-none">
                  Invite friends & share your trading passport
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <X size={15} />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-4 relative z-10">
            {/* ── THE TRADING PASSPORT CARD (Luxury Fintech Physical-Card Aesthetic) ── */}
            <div className="relative rounded-[22px] bg-gradient-to-b from-[#151720] via-[#10121a] to-[#0a0b10] border border-white/[0.12] overflow-hidden shadow-[0_16px_40px_-10px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.15)]">
              {/* Card Banner Cover with Soft Fade */}
              <div className="h-28 w-full relative overflow-hidden bg-[#181a24]">
                <img
                  src={bannerUrl}
                  alt="Cover"
                  className="w-full h-full object-cover [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)] opacity-85"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/default-cover.png"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10121a] via-[#10121a]/60 to-transparent pointer-events-none" />

                {/* Top Branding Strip */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[10px] font-black tracking-wider uppercase text-white shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    TradiFive
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/80 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center gap-1 shadow-sm">
                    <Cpu size={10} className="text-cyan-400" />
                    Official Passport
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4.5 pb-4 pt-1 relative">
                {/* Avatar with Metallic Ring */}
                <div className="absolute -top-10 left-4 z-10">
                  <div className="w-[62px] h-[62px] rounded-full p-[2px] bg-gradient-to-br from-white/30 via-white/10 to-blue-500/40 shadow-xl">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#181922]">
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                      />
                    </div>
                  </div>
                </div>

                {/* Name & Handle */}
                <div className="pl-[72px] min-h-[44px] flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[15px] font-extrabold text-white truncate leading-tight tracking-tight">
                      {displayName}
                    </h4>
                    <ShieldCheck size={14} className="text-sky-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium tracking-tight">@{username}</p>
                </div>

                {/* Badges Pill Row */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                    <Crown size={10.5} /> Lvl {level}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 text-[10px] font-semibold border border-white/10 truncate max-w-[210px]">
                    <Award size={10} className="text-amber-400 shrink-0" />
                    {style}
                  </span>
                </div>

                {/* Verified Telemetry Strip */}
                <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/[0.08]">
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Win Rate</p>
                    <p className="text-[12.5px] font-black text-emerald-400 mt-0.5 leading-none flex items-center justify-center gap-0.5">
                      <TrendingUp size={11} /> {winRate}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Trades</p>
                    <p className="text-[12.5px] font-black text-white mt-0.5 leading-none">
                      {tradesCount > 0 ? tradesCount : "Verified"}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Identity</p>
                    <p className="text-[12.5px] font-black text-sky-400 mt-0.5 leading-none">
                      Active
                    </p>
                  </div>
                </div>

                {/* QR Code Toggle Footer */}
                <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Join me on TradiFive</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQr(!showQr)}
                    className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <QrCode size={12.5} />
                    <span>{showQr ? "Hide QR" : "Show QR"}</span>
                  </button>
                </div>

                {/* Animated QR Display */}
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3.5 rounded-2xl bg-black/75 border border-white/10 flex flex-col items-center justify-center text-center shadow-lg"
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Profile QR Code"
                      className="w-36 h-36 rounded-xl bg-[#090a0f] border border-white/15 p-1.5"
                    />
                    <p className="text-[10px] text-zinc-400 font-medium mt-2">
                      Scan with camera to open verified profile instantly
                    </p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ── LINK COPY BOX (Sleek Obsidian Input with Capsule Button) ── */}
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-inner">
              <LinkIcon size={13} className="text-zinc-500 shrink-0" />
              <span className="text-[11.5px] text-zinc-300 font-mono truncate flex-1 select-all">
                {profileUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  borderRadius: 100,
                  padding: "7px 16px",
                  fontWeight: 700,
                  fontSize: 11.5,
                  letterSpacing: "0.01em",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  background: copied
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 2px 6px rgba(0, 0, 0, 0.25)",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  flexShrink: 0
                }}
                className="active:scale-95 hover:brightness-110"
              >
                {copied ? (
                  <>
                    <Check size={12} strokeWidth={2.6} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* ── DIRECT SHARE CHANNELS (Official Crisp SVG Logos, No Childish Emojis) ── */}
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Share directly to
              </p>
              <div className="grid grid-cols-4 gap-2">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={shareToWhatsapp}
                  title="Share to WhatsApp"
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/10 border border-white/[0.08] hover:border-emerald-500/30 text-white/90 hover:text-emerald-400 transition-all cursor-pointer group active:scale-95"
                >
                  <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.63C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.04C9.36 7.04 9.09 7.1 8.87 7.34C8.65 7.58 8.02 8.16 8.02 9.35C8.02 10.54 8.89 11.69 9.01 11.85C9.13 12.01 10.69 14.42 13.11 15.46C15.12 16.32 15.53 16.15 15.97 16.11C16.41 16.07 17.39 15.53 17.59 14.97C17.79 14.41 17.79 13.93 17.73 13.83C17.67 13.73 17.51 13.67 17.27 13.55C17.03 13.43 15.86 12.85 15.64 12.77C15.42 12.69 15.26 12.65 15.1 12.89C14.94 13.13 14.48 13.67 14.34 13.83C14.2 13.99 14.06 14.01 13.82 13.89C13.58 13.77 12.8 13.51 11.88 12.69C11.16 12.05 10.67 11.26 10.53 11.02C10.39 10.78 10.51 10.65 10.63 10.53C10.74 10.42 10.88 10.24 11.02 10.08C11.16 9.92 11.2 9.8 11.29 9.64C11.38 9.48 11.34 9.34 11.28 9.22C11.22 9.1 10.76 7.97 10.57 7.51C10.38 7.07 10.19 7.13 10.05 7.12C9.92 7.11 9.77 7.04 9.53 7.04Z" />
                  </svg>
                  <span className="text-[10.5px] font-bold">WhatsApp</span>
                </button>

                {/* Twitter / X */}
                <button
                  type="button"
                  onClick={shareToTwitter}
                  title="Share to X"
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/25 text-white/90 hover:text-white transition-all cursor-pointer group active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current transition-transform group-hover:scale-110 my-0.5" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[10.5px] font-bold">Twitter</span>
                </button>

                {/* Telegram */}
                <button
                  type="button"
                  onClick={shareToTelegram}
                  title="Share to Telegram"
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-sky-500/10 border border-white/[0.08] hover:border-sky-500/30 text-white/90 hover:text-sky-400 transition-all cursor-pointer group active:scale-95"
                >
                  <svg className="w-5 h-5 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                  <span className="text-[10.5px] font-bold">Telegram</span>
                </button>

                {/* More / System Share */}
                <button
                  type="button"
                  onClick={handleNativeShare}
                  title="More sharing options"
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl bg-white/[0.03] hover:bg-blue-500/10 border border-white/[0.08] hover:border-blue-500/30 text-white/90 hover:text-blue-400 transition-all cursor-pointer group active:scale-95"
                >
                  <Share2 size={18} className="transition-transform group-hover:scale-110" />
                  <span className="text-[10.5px] font-bold">More</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
