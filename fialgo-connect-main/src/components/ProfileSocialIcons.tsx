import React from "react";
import { Globe } from "lucide-react";

export interface ProfileSocialData {
  id?: string;
  username?: string;
  instagram?: string;
  instagram_id?: string;
  instagram_url?: string;
  youtube?: string;
  youtube_url?: string;
  discord?: string;
  discord_url?: string;
  tradingview?: string;
  tradingview_url?: string;
  twitter?: string;
  twitter_url?: string;
  website?: string;
}

function normalizeUrl(raw: string, prefix: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes(".") && !trimmed.startsWith("@")) {
    return `https://${trimmed}`;
  }
  return `${prefix}${trimmed.replace(/^@/, "")}`;
}

export function getMergedSocialLinks(profile: ProfileSocialData | null | undefined) {
  let localLinks: Record<string, string> = {};
  try {
    if (profile?.id) {
      const byId = localStorage.getItem(`tradifive_social_links_${profile.id}`);
      if (byId) localLinks = { ...localLinks, ...JSON.parse(byId) };
    }
    if (profile?.username) {
      const byUser = localStorage.getItem(
        `tradifive_social_links_user_${profile.username.toLowerCase()}`
      );
      if (byUser) localLinks = { ...localLinks, ...JSON.parse(byUser) };
    }
  } catch {
    // ignore storage errors
  }

  return {
    instagram:
      profile?.instagram_id ||
      profile?.instagram_url ||
      profile?.instagram ||
      localLinks.instagram ||
      "",
    discord:
      profile?.discord_url ||
      profile?.discord ||
      localLinks.discord ||
      "",
    tradingview:
      profile?.tradingview_url ||
      profile?.tradingview ||
      localLinks.tradingview ||
      "",
    youtube:
      profile?.youtube_url ||
      profile?.youtube ||
      localLinks.youtube ||
      "",
    twitter:
      profile?.twitter_url ||
      profile?.twitter ||
      localLinks.twitter ||
      "",
    website: profile?.website || localLinks.website || "",
  };
}

export const ProfileSocialIcons: React.FC<{
  profile?: ProfileSocialData | null;
}> = ({ profile }) => {
  const links = getMergedSocialLinks(profile);

  const items: { key: string; href: string; label: string; icon: React.ReactNode }[] = [];

  if (links.instagram) {
    items.push({
      key: "instagram",
      href: normalizeUrl(links.instagram, "https://instagram.com/"),
      label: "Instagram",
      icon: (
        <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      ),
    });
  }

  if (links.discord) {
    items.push({
      key: "discord",
      href: normalizeUrl(links.discord, "https://discord.gg/"),
      label: "Discord",
      icon: (
        <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      ),
    });
  }

  if (links.tradingview) {
    items.push({
      key: "tradingview",
      href: normalizeUrl(links.tradingview, "https://www.tradingview.com/u/"),
      label: "TradingView",
      icon: (
        <svg viewBox="0 0 36 28" className="w-[18px] h-[18px]" fill="currentColor">
          <path d="M14 22H7V11H0V4h14v18zM28 22h-8l7.5-18h8L28 22z" />
          <circle cx="20" cy="8" r="4" />
        </svg>
      ),
    });
  }

  if (links.youtube) {
    items.push({
      key: "youtube",
      href: normalizeUrl(links.youtube, "https://youtube.com/@"),
      label: "YouTube",
      icon: (
        <svg viewBox="0 0 24 24" className="w-[17px] h-[17px]" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    });
  }

  if (links.twitter) {
    items.push({
      key: "twitter",
      href: normalizeUrl(links.twitter, "https://x.com/"),
      label: "X",
      icon: (
        <svg viewBox="0 0 24 24" className="w-[15px] h-[15px]" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    });
  }

  if (links.website) {
    items.push({
      key: "website",
      href: normalizeUrl(links.website, "https://"),
      label: "Website",
      icon: <Globe size={16} strokeWidth={2.2} />,
    });
  }

  if (items.length === 0) return null;

  return (
    <>
      {items.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
          title={item.label}
          aria-label={item.label}
        >
          {item.icon}
        </a>
      ))}
    </>
  );
};

export const DefaultCoverWaves: React.FC = () => (
  <div className="w-full h-full bg-gradient-to-b from-[#6e7075] via-[#8a8c91] to-[#c4c6ca] dark:from-[#26262a] dark:via-[#202024] dark:to-[#1A1A1E] relative overflow-hidden">
    <svg
      viewBox="0 0 800 220"
      preserveAspectRatio="none"
      className="w-full h-full opacity-55 dark:opacity-35"
    >
      <path
        d="M0,55 Q120,25 250,60 T520,45 T800,65 L800,220 L0,220 Z"
        fill="#4b4d52"
        fillOpacity="0.45"
      />
      <path
        d="M0,95 Q160,60 320,98 T640,82 T800,105 L800,220 L0,220 Z"
        fill="#3a3c40"
        fillOpacity="0.42"
      />
      <path
        d="M0,135 Q200,98 390,132 T720,120 T800,140 L800,220 L0,220 Z"
        fill="#2c2e32"
        fillOpacity="0.35"
      />
      <path
        d="M0,170 Q180,148 380,172 T740,162 T800,175 L800,220 L0,220 Z"
        fill="#ffffff"
        fillOpacity="0.28"
      />
    </svg>
  </div>
);

export default ProfileSocialIcons;
