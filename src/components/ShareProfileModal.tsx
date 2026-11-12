import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Crown,
  ShieldCheck,
  Sparkles,
  QrCode,
  Download
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

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/user/${username}`
    : `https://www.tradifive.in/user/${username}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(profileUrl)}&bgcolor=18181b&color=ffffff&margin=10`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
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
          text: `Join ${displayName} on TradiFive — The Platform for Disciplined Trading.`,
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
      `Hey! Check out my official trading profile on TradiFive 📈\n\n👤 ${displayName} (@${username})\n🚀 Join me on TradiFive: ${profileUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(
      `Trading with discipline on @tradifive! Check out my official profile:\n${profileUrl}\n\n#Forex #Trading #TradiFive #Discipline`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(`Check out ${displayName}'s trading profile on TradiFive!`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(profileUrl)}&text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, "_blank", "noopener,noreferrer");
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
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-[440px] rounded-3xl bg-[#0F0F12] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(37,99,235,0.15)] overflow-hidden text-white font-sans z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Share2 size={15} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white tracking-tight">Share Profile</h3>
                <p className="text-[11px] text-zinc-400">Invite friends & share your trading passport</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* Visual Big-Tech Profile Card Preview */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#18181D] to-[#121216] border border-white/10 overflow-hidden shadow-xl">
              {/* Card Banner with Soft Fade */}
              <div className="h-28 w-full relative overflow-hidden bg-[#1E1E24]">
                <img
                  src={bannerUrl}
                  alt="Cover"
                  className="w-full h-full object-cover [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)]"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/default-cover.png"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181D] via-[#18181D]/50 to-transparent pointer-events-none" />

                {/* Top Branding Strip */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10.5px] font-black tracking-wider uppercase text-white shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    TradiFive
                  </div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-white/70 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                    Official Passport
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-4 pb-4 pt-1 relative">
                {/* Avatar */}
                <div className="absolute -top-10 left-4 z-10">
                  <div className="w-16 h-16 rounded-full border-2 border-[#18181D] overflow-hidden bg-[#24242A] shadow-lg">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.svg"; }}
                    />
                  </div>
                </div>

                <div className="pl-[74px] min-h-[42px] flex flex-col justify-center">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-[15px] font-extrabold text-white truncate leading-tight">
                      {displayName}
                    </h4>
                    <ShieldCheck size={14} className="text-blue-400 shrink-0" />
                  </div>
                  <p className="text-[11.5px] text-zinc-400 font-medium">@{username}</p>
                </div>

                {/* Trader Badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 text-[10px] font-bold border border-blue-500/25">
                    <Crown size={10} /> Lvl {level}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 text-[10px] font-medium border border-white/10 truncate max-w-[200px]">
                    {style}
                  </span>
                </div>

                {/* QR Code toggle / Callout */}
                <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Join me on TradiFive</span>
                  </div>
                  <button
                    onClick={() => setShowQr(!showQr)}
                    className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <QrCode size={13} />
                    <span>{showQr ? "Hide QR" : "Show QR"}</span>
                  </button>
                </div>

                {/* QR Display */}
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col items-center justify-center text-center"
                  >
                    <img
                      src={qrCodeUrl}
                      alt="Profile QR Code"
                      className="w-36 h-36 rounded-lg bg-zinc-900 border border-white/10 p-1"
                    />
                    <p className="text-[10px] text-zinc-400 mt-2">Scan with camera to open profile instantly</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Link Copy Box */}
            <div className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-zinc-300 font-mono truncate flex-1 select-all">
                {profileUrl}
              </span>
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                }`}
              >
                {copied ? (
                  <>
                    <Check size={13} strokeWidth={2.5} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Share Grid */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
                Share directly to
              </p>
              <div className="grid grid-cols-4 gap-2">
                {/* WhatsApp */}
                <button
                  onClick={shareToWhatsapp}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] transition-all cursor-pointer group active:scale-95"
                >
                  <span className="text-lg">💬</span>
                  <span className="text-[10.5px] font-bold">WhatsApp</span>
                </button>

                {/* Twitter / X */}
                <button
                  onClick={shareToTwitter}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer group active:scale-95"
                >
                  <span className="text-lg font-black font-sans">𝕏</span>
                  <span className="text-[10.5px] font-bold">Twitter</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={shareToTelegram}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 text-[#29b6f6] transition-all cursor-pointer group active:scale-95"
                >
                  <span className="text-lg">✈️</span>
                  <span className="text-[10.5px] font-bold">Telegram</span>
                </button>

                {/* More / Native */}
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition-all cursor-pointer group active:scale-95"
                >
                  <Share2 size={17} />
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
