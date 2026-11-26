import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
   Camera, ExternalLink, Check, ChevronDown, CheckCircle2, Circle,
   ArrowRight, ChevronsUpDown, User, Crown, Briefcase, Lock, Link2, 
   Instagram, Youtube, MessageSquare, TrendingUp, X, BarChart2, Target, Flame 
} from 'lucide-react';
import { Country, State } from 'country-state-city';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import defaultAvatar from '@/assets/default-avatar.svg';

export const TactileBoxButton = ({ children, onClick, className = "", disabled = false, style = {}, type = "button", ...props }: any) => {
   const [isHovered, setIsHovered] = useState(false);
   const [isPressed, setIsPressed] = useState(false);

   // Resting: clean white with soft inner bottom shadow
   const restingShadow = "0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.12), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.07), inset 0 1px 0 0 #FFFFFF";
   // Hover: slight lift with elevated depth, subtle soft bottom line, top highlight
   const hoverShadow = "0 3.5px 7px 0 rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.14), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.06), inset 0 1px 0 0 #FFFFFF";
   // Pressed / Active: tactile pressed cushion
   const pressedShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.20), inset 0 2px 4px 0 rgba(0, 0, 0, 0.12)";

   // Subtle hover background change (very soft off-white #F8F9FA instead of dark grey)
   const currentBackground = isPressed
      ? "#EDEDF0"
      : isHovered
      ? "#F8F9FA"
      : "#FFFFFF";

   const currentShadow = isPressed
      ? pressedShadow
      : isHovered
      ? hoverShadow
      : restingShadow;

   return (
      <button
         type={type}
         disabled={disabled}
         onClick={onClick}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
         onMouseDown={() => setIsPressed(true)}
         onMouseUp={() => setIsPressed(false)}
         onTouchStart={() => setIsPressed(true)}
         onTouchEnd={() => setIsPressed(false)}
         style={{
            background: currentBackground,
            boxShadow: currentShadow,
            ...style
         }}
         className={cn(
            "h-9 px-4 rounded-full text-slate-900 dark:text-white font-semibold text-[13px]",
            "dark:bg-gradient-to-b dark:from-[#201E25] dark:to-[#323137]",
            "dark:shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_0_1px_#0D0D0D,inset_0_1px_0_rgba(255,255,255,0.12)]",
            "hover:-translate-y-[1.5px] active:translate-y-[0.5px] active:scale-[0.98]",
            "inline-flex items-center justify-center gap-1.5 transition-all duration-150 ease-out cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed",
            className
         )}
         {...props}
      >
         {children}
      </button>
   );
};

export const TactileSegmentButton = ({ active, children, onClick, className = "" }: any) => {
   const [isHovered, setIsHovered] = useState(false);

   return (
      <button
         type="button"
         onClick={onClick}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
         style={active ? { 
            background: isHovered ? "#F8F9FA" : "#FFFFFF",
            boxShadow: isHovered 
               ? "0 3.5px 7px 0 rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.14), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.06), inset 0 1px 0 0 #FFFFFF" 
               : "0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.12), inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.07), inset 0 1px 0 0 #FFFFFF" 
         } : {}}
         className={cn(
            "transition-all duration-150 cursor-pointer select-none font-bold text-[13px]",
            active
               ? "rounded-[11px] text-slate-900 dark:text-white hover:-translate-y-[1px] dark:shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_0_1px_#0D0D0D] dark:bg-gradient-to-b dark:from-[#201E25] dark:to-[#323137]"
               : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white bg-transparent border border-transparent",
            className
         )}
      >
         {children}
      </button>
   );
};

const ProfileToggle = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
   <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
         "relative w-11 h-[24px] rounded-full transition-colors duration-200 outline-none focus:outline-none shrink-0 cursor-pointer",
         disabled && "opacity-40 cursor-not-allowed",
         checked ? "bg-slate-900 dark:bg-white" : "bg-slate-300 dark:bg-white/20"
      )}
   >
      <div
         className={cn(
            "absolute top-1/2 -translate-y-1/2 left-[3px] w-[18px] h-[18px] rounded-full shadow-sm transition-transform duration-200",
            checked ? "translate-x-[20px] bg-white dark:bg-slate-900" : "translate-x-0 bg-white"
         )}
      />
   </button>
);

const SearchableCombobox = ({ value, onChange, items, placeholder, disabled }: any) => {
   const [open, setOpen] = useState(false);
   const [search, setSearch] = useState("");

   const filteredItems = useMemo(() => {
      if (!search) return items.slice(0, 50);
      return items.filter((item: any) => item.name.toLowerCase().includes(search.toLowerCase())).slice(0, 50);
   }, [items, search]);

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <button
               disabled={disabled}
               className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-slate-900 dark:focus:border-white transition-all disabled:opacity-50",
                  !value && "text-slate-500"
               )}
            >
               <span className="truncate">{value || placeholder}</span>
               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>
         </PopoverTrigger>
         <PopoverContent className="w-[300px] p-0" align="start">
            <Command shouldFilter={false}>
               <CommandInput
                  placeholder={`Search ${placeholder.toLowerCase()}...`}
                  value={search}
                  onValueChange={setSearch}
               />
               <CommandList>
                  <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
                  <CommandGroup>
                     {filteredItems.map((item: any) => (
                        <CommandItem
                           key={item.name}
                           value={item.name}
                           onSelect={() => {
                              onChange(item.name);
                              setOpen(false);
                              setSearch("");
                           }}
                        >
                           <Check
                              className={cn(
                                 "mr-2 h-4 w-4",
                                 value === item.name ? "opacity-100" : "opacity-0"
                              )}
                           />
                           {item.name}
                        </CommandItem>
                     ))}
                  </CommandGroup>
               </CommandList>
            </Command>
         </PopoverContent>
      </Popover>
   );
};

export function ProfileAccountPreferencesCard({
   profile,
   onManageEmail,
   onSetPassword,
}: {
   profile: any;
   onManageEmail?: () => void;
   onSetPassword?: () => void;
}) {
   const [timeFormat, setTimeFormat] = useState(() => localStorage.getItem('tradifive_time_format') || '24h');
   const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('tradifive_date_format') || 'Automatic');
   const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('tradifive_language') || 'English');

   const timezoneSummary = useMemo(() => {
      try {
         const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Calcutta';
         const city = tzName.split('/').pop()?.replace(/_/g, ' ') || 'Calcutta';
         const now = new Date();
         const offsetMin = -now.getTimezoneOffset();
         const sign = offsetMin >= 0 ? '+' : '-';
         const absMin = Math.abs(offsetMin);
         const hrs = Math.floor(absMin / 60);
         const mins = absMin % 60;
         const utcLabel = mins === 0 ? `UTC${sign}${hrs}` : `UTC${sign}${hrs}:${String(mins).padStart(2, '0')}`;
         const timeLabel = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: timeFormat === '12h',
         });
         return { city, right: `${utcLabel} · ${timeLabel}` };
      } catch {
         return { city: 'Calcutta', right: 'UTC+5:30 · 18:24' };
      }
   }, [timeFormat]);

   const handleSetTimeFormat = (fmt: string) => {
      setTimeFormat(fmt);
      localStorage.setItem('tradifive_time_format', fmt);
   };

   const handleSetDateFormat = (fmt: string) => {
      setDateFormat(fmt);
      localStorage.setItem('tradifive_date_format', fmt);
   };

   const handleSetLanguage = (lang: string) => {
      setSelectedLanguage(lang);
      localStorage.setItem('tradifive_language', lang);
   };

   return (
      <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-5">
         {/* EMAIL */}
         <div>
            <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
               EMAIL
            </label>
            <div className="flex items-center gap-2">
               <input
                  type="email"
                  readOnly
                  value={profile?.email || "nikhilharake369@gmail.com"}
                  className="flex-1 min-w-0 bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white font-medium outline-none border border-transparent truncate"
               />
               <TactileBoxButton
                  onClick={() => {
                     if (onManageEmail) {
                        onManageEmail();
                     } else {
                        toast.info("Open Account & Security to update your email.");
                     }
                  }}
                  className="h-10 px-4 text-[13px] shrink-0"
               >
                  Change
               </TactileBoxButton>
            </div>
            <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1.5 px-1">
               You sign in with this email, and every TradiFive email and receipt goes here.
            </p>
         </div>

         {/* PASSWORD */}
         <div>
            <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
               PASSWORD
            </label>
            <p className="text-[12px] text-slate-500 dark:text-neutral-400 mb-2.5 px-1 leading-normal">
               You sign in with Google or Apple. Add a password to also sign in with your email or @username.
            </p>
            <TactileBoxButton
               onClick={() => {
                  if (onSetPassword) {
                     onSetPassword();
                  } else {
                     toast.info("Open Account & Security to set or update your password.");
                  }
               }}
               className="h-10 px-4 text-[13px]"
            >
               Set a password
            </TactileBoxButton>
         </div>

         {/* TIMEZONE */}
         <div>
            <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
               TIMEZONE
            </label>
            <div className="w-full bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-4 py-3 flex items-center justify-between text-[13px] font-medium text-slate-800 dark:text-white border border-transparent">
               <span>This device · {timezoneSummary.city}</span>
               <span className="text-slate-400 dark:text-neutral-500 flex items-center gap-1 tabular-nums">
                  {timezoneSummary.right}
                  <ChevronDown size={14} />
               </span>
            </div>
            <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1.5 px-1">
               New trades are logged in this timezone. You can still change it on a single trade.
            </p>
         </div>

         {/* TIME FORMAT */}
         <div>
            <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
               TIME FORMAT
            </label>
            <div className="inline-flex p-1 bg-[#EAECEF] dark:bg-[#202024] rounded-xl gap-1">
               <TactileSegmentButton
                  active={timeFormat === '12h'}
                  onClick={() => handleSetTimeFormat('12h')}
                  className="px-4 py-1.5"
               >
                  AM / PM
               </TactileSegmentButton>
               <TactileSegmentButton
                  active={timeFormat === '24h'}
                  onClick={() => handleSetTimeFormat('24h')}
                  className="px-4 py-1.5"
               >
                  24h
               </TactileSegmentButton>
            </div>
            <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1.5 px-1">
               Changes every time in TradiFive right away, for example 09:30 and 14:15.
            </p>
         </div>

         {/* DATE FORMAT */}
         <div>
            <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
               DATE FORMAT
            </label>
            <div className="inline-flex p-1 bg-[#EAECEF] dark:bg-[#202024] rounded-xl gap-1">
               {['Automatic', '07.10', '10/07'].map((fmt) => (
                  <TactileSegmentButton
                     key={fmt}
                     active={dateFormat === fmt}
                     onClick={() => handleSetDateFormat(fmt)}
                     className="px-3.5 py-1.5"
                  >
                     {fmt}
                  </TactileSegmentButton>
               ))}
            </div>
            <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1.5 px-1">
               How a date is written with numbers, for example 7 October: 10/07. Imported CSV files that do not say use this order too.
            </p>
         </div>

         {/* LANGUAGE */}
         <div>
            <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
               LANGUAGE
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#EAECEF] dark:bg-[#202024] rounded-2xl">
               {[
                  'English', 'Español', 'Deutsch',
                  'Français', 'Português', 'Русский',
                  '日本語', '简体中文', 'Tiếng Việt'
               ].map((lang) => (
                  <TactileSegmentButton
                     key={lang}
                     active={selectedLanguage === lang}
                     onClick={() => handleSetLanguage(lang)}
                     className="py-2.5 px-1 text-center"
                  >
                     {lang}
                  </TactileSegmentButton>
               ))}
            </div>
            <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1.5 px-1">
               Every screen in TradiFive, and the AI. Your own notes stay as you wrote them.
            </p>
         </div>
      </div>
   );
}

export default function ProfileTab({
   profile,
   setProfile,
   activePlan = 'starter',
   privacySettings,
   setPrivacySettings,
   avatarUploadRef,
   bannerUploadRef,
   isInitialLoading,
   onSave,
   onCancel,
   loading = false,
   setActiveTab
}: any) {
   const isStarterPlan = !['pro', 'elite', 'advanced', 'institutional'].includes(String(activePlan || '').toLowerCase());
   const bioInputRef = useRef<HTMLTextAreaElement | null>(null);
   const [newTag, setNewTag] = useState('');
   const [isAddingTag, setIsAddingTag] = useState(false);
   const tags = profile.tags || [];

   // Mobile Card Toggles (Real TradiFive profile items: Trades, Win Rate, ROI, Avg RR, Streak, Performance, AI Analysis, Followers, Calendar)
   const [cardToggles, setCardToggles] = useState(() => {
      const saved = localStorage.getItem('tradifive_card_toggles');
      if (saved) {
         try { return JSON.parse(saved); } catch { /* ignore invalid cache */ }
      }
      return {
         trades: privacySettings?.show_trades ?? true,
         winRate: privacySettings?.show_winrate ?? true,
         roi: privacySettings?.show_roi ?? true,
         avgRR: privacySettings?.show_avg_rr ?? true,
         streak: privacySettings?.show_streak ?? true,
         tradingPerformance: privacySettings?.show_performance ?? true,
         aiAnalysis: privacySettings?.show_ai_analysis ?? true,
         followers: privacySettings?.show_followers ?? true,
         calendar: privacySettings?.show_calendar ?? true,
      };
   });

   const updateCardToggle = (key: string, val: boolean) => {
      setCardToggles((prev: any) => {
         const next = { ...prev, [key]: val };
         localStorage.setItem('tradifive_card_toggles', JSON.stringify(next));

         // Sync with privacySettings in state and localStorage
         if (setPrivacySettings) {
            const privacyKeyMap: Record<string, string> = {
               trades: 'show_trades',
               winRate: 'show_winrate',
               roi: 'show_roi',
               avgRR: 'show_avg_rr',
               streak: 'show_streak',
               tradingPerformance: 'show_performance',
               aiAnalysis: 'show_ai_analysis',
               followers: 'show_followers',
               calendar: 'show_calendar',
            };
            const pKey = privacyKeyMap[key];
            if (pKey) {
               setPrivacySettings((pPrev: any) => {
                  const pNext = { ...pPrev, [pKey]: val };
                  try {
                     let uid = profile?.id || localStorage.getItem('tradifive_user_id');
                     if (!uid) {
                        const cached = localStorage.getItem('prof_cache_data');
                        uid = cached ? JSON.parse(cached)?.id : null;
                     }
                     if (!uid) {
                        for (let i = 0; i < localStorage.length; i++) {
                           const k = localStorage.key(i);
                           if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
                              const parsed = JSON.parse(localStorage.getItem(k) || '{}');
                              if (parsed?.user?.id) { uid = parsed.user.id; break; }
                           }
                        }
                     }
                     if (uid) {
                        localStorage.setItem(`tradifive_privacy_${uid}`, JSON.stringify(pNext));
                     }
                     const uname = profile?.username || profile?.name;
                     if (uname) {
                        localStorage.setItem(`tradifive_privacy_user_${uname.toLowerCase()}`, JSON.stringify(pNext));
                     }
                     window.dispatchEvent(new Event("storage"));
                  } catch { /* ignore storage restrictions */ }
                  return pNext;
               });
            }
         }
         return next;
      });
   };

   const [userStats, setUserStats] = useState({
      tradesCount: 0,
      winRate: "0%",
      roi: "0.00%",
      avgRR: "0",
      streak: "0 Days"
   });

   useEffect(() => {
      let mounted = true;
      (async () => {
         try {
            const { data: { user } } = await supabase.auth.getUser();
            const targetId = user?.id || profile?.id;
            if (!targetId) return;

            const { data: tradesData } = await supabase
               .from('trades')
               .select('*')
               .eq('user_id', targetId);

            if (mounted && tradesData && tradesData.length > 0) {
               const total = tradesData.length;
               const wins = tradesData.filter((t: any) => Number(t.profit) > 0).length;
               const wr = total > 0 ? Math.round((wins / total) * 100) : 0;
               const pnlSum = tradesData.reduce((acc: number, t: any) => acc + Number(t.profit || 0), 0);

               let currentStreak = 0;
               const sortedTrades = [...tradesData].sort((a: any, b: any) => 
                  new Date(b.closed_at || b.created_at).getTime() - new Date(a.closed_at || a.created_at).getTime()
               );
               for (const t of sortedTrades) {
                  if (Number(t.profit) > 0) {
                     currentStreak++;
                  } else {
                     break;
                  }
               }

               let totalRR = 0;
               let rrCount = 0;
               for (const t of tradesData) {
                  const r = Number(t.risk_reward_ratio || t.rr || 0);
                  if (r > 0) {
                     totalRR += r;
                     rrCount++;
                  }
               }
               const avgRR = rrCount > 0 ? (totalRR / rrCount).toFixed(1) : "0";

               const { data: mt5Data } = await supabase
                  .from('mt5_accounts')
                  .select('balance')
                  .eq('user_id', targetId)
                  .maybeSingle();

               const balance = mt5Data?.balance || 10000;
               const roiPercent = balance > 0 ? (pnlSum / balance) * 100 : 0;

               setUserStats({
                  tradesCount: total,
                  winRate: `${wr}%`,
                  roi: (pnlSum >= 0 ? "+" : "") + roiPercent.toFixed(2) + "%",
                  avgRR: avgRR,
                  streak: `${currentStreak} Day${currentStreak !== 1 ? 's' : ''}`
               });
            }
         } catch (err) {
            console.warn("Could not load user stats for preview", err);
         }
      })();
      return () => { mounted = false; };
   }, [profile?.id]);

   const handleAddTag = () => {
      if (newTag.trim() && tags.length < 3) {
         setProfile({ ...profile, tags: [...tags, newTag.trim()] });
         setNewTag('');
         setIsAddingTag(false);
      }
   };

   const handleRemoveTag = (indexToRemove: number) => {
      setProfile({ ...profile, tags: tags.filter((_: string, idx: number) => idx !== indexToRemove) });
   };

   const countries = useMemo(() => Country.getAllCountries(), []);
   const selectedCountryCode = useMemo(() => countries.find(c => c.name === profile.country)?.isoCode, [profile.country, countries]);

   const states = useMemo(() => selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) || [] : [], [selectedCountryCode]);
   const selectedStateCode = useMemo(() => states.find(s => s.name === profile.state)?.isoCode, [profile.state, states]);

   const completenessChecks = useMemo(() => {
      const checks = {
         hasAvatar: !!profile.avatarUrl,
         hasBanner: !!profile.bannerUrl,
         hasTags: tags && tags.length > 0,
         hasBio: !!profile.bio && profile.bio.trim().length > 0,
         hasSocial: !!profile.website
      };
      const completedCount = Object.values(checks).filter(Boolean).length;
      return {
         ...checks,
         percentage: Math.round((completedCount / 5) * 100)
      };
   }, [profile.avatarUrl, profile.bannerUrl, tags, profile.bio, profile.website]);

   return (
      <>
         {/* â”€â”€ UNIFIED PROFILE EDITOR (Same complete experience on Mobile & Desktop Web App) â”€â”€ */}
         <div className="space-y-5 max-w-lg md:max-w-[780px] mx-auto md:mx-0 pb-2 select-none">
            {/* Mobile-only Header Title & Subtitle (Desktop already renders header in Settings.tsx) */}
            <div className="md:hidden pt-1 pb-1 px-1">
               <h1 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">Profile</h1>
               <p className="text-[13px] text-slate-400 dark:text-neutral-400 font-normal mt-0.5">
                  Your card, email, timezone and time format
               </p>
            </div>

            {/* 1. Hero Profile Card with crisp cover banner (or gradient), cover camera button, avatar with camera overlay, name, username, Cancel & Save tactile buttons */}
            <div className="bg-white dark:bg-[#1B1B20] rounded-[22px] overflow-hidden border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none relative">
               {/* Banner Image with clean editorial monochrome fallback */}
               <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-zinc-800 via-neutral-900 to-zinc-950">
                  {profile.bannerUrl ? (
                     <img
                        src={profile.bannerUrl}
                        alt="Cover"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                     />
                  ) : (
                     <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_24%_32%,rgba(255,255,255,0.12),transparent_55%)]"
                     />
                  )}
                  <div
                     aria-hidden="true"
                     className="absolute inset-x-0 bottom-0 h-12 pointer-events-none dark:hidden"
                     style={{ background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 40%, rgba(255,255,255,0) 100%)" }}
                  />
                  <div
                     aria-hidden="true"
                     className="absolute inset-x-0 bottom-0 h-12 pointer-events-none hidden dark:block"
                     style={{ background: "linear-gradient(to top, rgba(27,27,32,1) 0%, rgba(27,27,32,0.65) 40%, rgba(27,27,32,0) 100%)" }}
                  />
                  
                  {/* Cover camera button */}
                  <button
                     type="button"
                     onClick={() => bannerUploadRef?.current?.click()}
                     className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[12px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer z-10"
                  >
                     <Camera size={13} className="text-white" />
                     <span>Cover</span>
                  </button>
               </div>

               {/* Overlapping Avatar */}
               <div className="relative -mt-10 ml-4 flex items-end justify-between pr-4">
                  <div className="relative w-[72px] h-[72px] rounded-full border-[3px] border-white dark:border-[#1B1B20] shadow-md overflow-hidden bg-white dark:bg-neutral-800 shrink-0 group">
                     <img
                        src={profile.avatarUrl || defaultAvatar}
                        alt={profile.display_name || profile.name || "User"}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                     />
                     {/* Camera overlay */}
                     <button
                        type="button"
                        onClick={() => avatarUploadRef?.current?.click()}
                        className="absolute inset-0 bg-black/35 hover:bg-black/55 backdrop-blur-[1px] flex items-center justify-center text-white transition-opacity cursor-pointer"
                        title="Change Avatar"
                     >
                        <Camera size={20} className="text-white drop-shadow" />
                     </button>
                  </div>
               </div>

               {/* Name, Username, Live Bio, Link & Stats (Live Card Preview) */}
               <div className="px-4 pt-2.5 pb-4">
                  <h2 className="text-[17px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                     {profile.display_name || profile.name || "Trader"}
                  </h2>
                  <p className="text-[12px] text-slate-400 dark:text-neutral-500 font-normal mt-0.5 truncate">
                     @{profile.username || "trader"}
                  </p>

                  {/* Live Bio Preview */}
                  <p className="text-[13px] text-slate-700 dark:text-neutral-200 font-normal leading-relaxed mt-2.5 whitespace-pre-wrap break-words">
                     {profile.bio && profile.bio.trim().length > 0 ? (
                        profile.bio
                     ) : (
                        <span className="text-slate-400 dark:text-neutral-500 italic text-[12px]">
                           No bio yet. Update your profile to tell others about your trading style.
                        </span>
                     )}
                  </p>

                  {/* Live Link & Socials */}
                  {(profile.website || profile.instagram || profile.youtube || profile.discord || profile.tradingview) && (
                     <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                        {profile.website && (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.07] text-slate-700 dark:text-neutral-200 text-[11px] font-semibold">
                              <Link2 size={11} />
                              <span className="truncate max-w-[150px]">{profile.website.replace(/^https?:\/\//, '')}</span>
                           </span>
                        )}
                        {profile.instagram && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 text-[10.5px] font-medium">
                              <Instagram size={11} className="text-slate-500 dark:text-neutral-400" />
                              <span className="truncate max-w-[90px]">@{profile.instagram.replace('@', '')}</span>
                           </span>
                        )}
                        {profile.youtube && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 text-[10.5px] font-medium">
                              <Youtube size={11} className="text-slate-500 dark:text-neutral-400" />
                              <span className="truncate max-w-[90px]">{profile.youtube}</span>
                           </span>
                        )}
                        {profile.discord && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 text-[10.5px] font-medium">
                              <MessageSquare size={11} className="text-slate-500 dark:text-neutral-400" />
                              <span className="truncate max-w-[90px]">{profile.discord}</span>
                           </span>
                        )}
                        {profile.tradingview && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 text-[10.5px] font-medium">
                              <TrendingUp size={11} className="text-slate-500 dark:text-neutral-400" />
                              <span className="truncate max-w-[90px]">{profile.tradingview}</span>
                           </span>
                        )}
                     </div>
                  )}

                  {/* Live Active Stats Badges / Cards (Trades, Win Rate, ROI, Avg RR, Streak) */}
                  {(cardToggles.trades || cardToggles.winRate || cardToggles.roi || cardToggles.avgRR || cardToggles.streak) && (
                     <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
                              WHAT OTHERS SEE ON YOUR CARD
                           </span>
                           <span className="text-[10px] text-slate-600 dark:text-neutral-300 font-semibold bg-slate-100 dark:bg-white/[0.07] px-2 py-0.5 rounded-full">
                              Live Preview
                           </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           {cardToggles.trades && (
                              <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">TRADES</span>
                                    <div className="w-5 h-5 rounded-full bg-slate-200/70 dark:bg-white/10 flex items-center justify-center">
                                       <BarChart2 size={11} className="text-slate-600 dark:text-neutral-300" />
                                    </div>
                                 </div>
                                 <span className="text-[16px] font-extrabold text-slate-900 dark:text-white leading-tight font-sans">
                                    {userStats.tradesCount}
                                 </span>
                              </div>
                           )}
                           {cardToggles.winRate && (
                              <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">WIN RATE</span>
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                       <CheckCircle2 size={11} className="text-emerald-500" />
                                    </div>
                                 </div>
                                 <span className="text-[16px] font-extrabold text-slate-900 dark:text-white leading-tight font-sans">
                                    {userStats.winRate}
                                 </span>
                              </div>
                           )}
                           {cardToggles.roi && (
                              <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">ROI (ALL TIME)</span>
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                       <TrendingUp size={11} className="text-emerald-500" />
                                    </div>
                                 </div>
                                 <span className="text-[16px] font-extrabold text-emerald-500 leading-tight font-sans">
                                    {userStats.roi}
                                 </span>
                              </div>
                           )}
                           {cardToggles.avgRR && (
                              <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">AVG RR</span>
                                    <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                                       <Target size={11} className="text-purple-500" />
                                    </div>
                                 </div>
                                 <span className="text-[16px] font-extrabold text-slate-900 dark:text-white leading-tight font-sans">
                                    {userStats.avgRR}
                                 </span>
                              </div>
                           )}
                           {cardToggles.streak && (
                              <div className={`py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between ${
                                 (!cardToggles.trades && !cardToggles.winRate && !cardToggles.roi && !cardToggles.avgRR) ? 'col-span-2' : ''
                              }`}>
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">STREAK</span>
                                    <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center">
                                       <Flame size={11} className="text-orange-500" />
                                    </div>
                                 </div>
                                 <span className="text-[16px] font-extrabold text-slate-900 dark:text-white leading-tight font-sans">
                                    {userStats.streak}
                                 </span>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Tactile buttons row */}
                  <div className="flex items-center gap-2.5 mt-3.5">
                     <TactileBoxButton
                        onClick={onCancel}
                        className="h-9 px-5 text-[13px]"
                     >
                        Cancel
                     </TactileBoxButton>
                     <TactileBoxButton
                        onClick={onSave}
                        disabled={loading}
                        className="h-9 px-5 text-[13px]"
                     >
                        {loading ? 'Saving...' : 'Save'}
                     </TactileBoxButton>
                  </div>
               </div>
            </div>

            {/* 2. Main Profile Settings Card (DISPLAY NAME, USERNAME, BIO, LINK, SOCIALS) */}
            <div className="bg-white dark:bg-[#1B1B20] rounded-[22px] p-5 border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none space-y-4">
               {/* DISPLAY NAME */}
               <div>
                  <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                     DISPLAY NAME
                  </label>
                  <input
                     type="text"
                     value={profile.display_name ?? profile.name ?? ""}
                     onChange={e => setProfile({ ...profile, display_name: e.target.value, name: e.target.value })}
                     placeholder="Display Name"
                     className="w-full bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-4 py-2.5 text-[13.5px] text-slate-900 dark:text-white font-medium outline-none border border-transparent focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
               </div>

               {/* USERNAME */}
               <div>
                  <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                     USERNAME
                  </label>
                  <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 border border-transparent focus-within:border-slate-900 dark:focus-within:border-white transition-colors">
                     <span className="text-[13.5px] font-semibold text-slate-400 mr-1 select-none">@</span>
                     <input
                        type="text"
                        value={profile.username || ""}
                        onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, '') })}
                        placeholder="username"
                        className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none"
                     />
                  </div>
                  <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1 px-1">
                     3 to 20 letters, numbers, dots or underscores.
                  </p>
               </div>

               {/* BIO */}
               <div>
                  <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                     BIO
                  </label>
                  <textarea
                     ref={bioInputRef}
                     value={profile.bio || ""}
                     onChange={e => setProfile({ ...profile, bio: e.target.value })}
                     placeholder="No bio yet. Update your profile to tell others about your trading style."
                     maxLength={280}
                     rows={3}
                     className="w-full bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-4 py-3 text-[13.5px] text-slate-900 dark:text-white font-medium outline-none border border-transparent focus:border-slate-900 dark:focus:border-white transition-colors resize-none"
                  />
                  <div className="text-right text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5 px-1">
                     {(profile.bio?.length || 0)}/280
                  </div>
               </div>

               {/* LINK with Pro & Elite unified badge */}
               <div>
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                     <span className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">LINK</span>
                     {isStarterPlan && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.08] text-[10px] font-bold text-slate-700 dark:text-neutral-200">
                           <Lock size={10} strokeWidth={2.4} />
                           <span>Pro &amp; Elite</span>
                        </span>
                     )}
                  </div>
                  <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2 border border-transparent focus-within:border-slate-900 dark:focus-within:border-white transition-colors">
                     <Link2 size={15} className="text-slate-400 shrink-0" />
                     <input
                        type="text"
                        value={profile.website || ""}
                        disabled={isStarterPlan}
                        onChange={e => setProfile({ ...profile, website: e.target.value })}
                        placeholder="Your website or trading link"
                        className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500 disabled:opacity-60 disabled:cursor-not-allowed"
                     />
                  </div>
                  {isStarterPlan && (
                     <div className="flex items-center justify-between gap-3 mt-2 px-1">
                        <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 leading-tight">
                           Showcase a custom link directly on your public profile card with Pro or Elite.
                        </p>
                        <TactileBoxButton
                           onClick={() => setActiveTab && setActiveTab('subscription')}
                           className="h-8 px-4 shrink-0 text-[12px] font-semibold"
                        >
                           Upgrade
                        </TactileBoxButton>
                     </div>
                  )}
               </div>

               {/* SOCIALS */}
               <div>
                  <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                     SOCIALS
                  </label>
                  <div className="space-y-2">
                     <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2.5 border border-transparent focus-within:border-slate-900 dark:focus-within:border-white transition-colors">
                        <Instagram size={16} className="text-slate-400 shrink-0" />
                        <input
                           type="text"
                           value={profile.instagram || ""}
                           onChange={e => setProfile({ ...profile, instagram: e.target.value })}
                           placeholder="Instagram"
                           className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                        />
                     </div>
                     <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2.5 border border-transparent focus-within:border-slate-900 dark:focus-within:border-white transition-colors">
                        <Youtube size={16} className="text-slate-400 shrink-0" />
                        <input
                           type="text"
                           value={profile.youtube || ""}
                           onChange={e => setProfile({ ...profile, youtube: e.target.value })}
                           placeholder="YouTube"
                           className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                        />
                     </div>
                     <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2.5 border border-transparent focus-within:border-slate-900 dark:focus-within:border-white transition-colors">
                        <MessageSquare size={16} className="text-slate-400 shrink-0" />
                        <input
                           type="text"
                           value={profile.discord || ""}
                           onChange={e => setProfile({ ...profile, discord: e.target.value })}
                           placeholder="Discord invite code"
                           className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                        />
                     </div>
                     <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2.5 border border-transparent focus-within:border-slate-900 dark:focus-within:border-white transition-colors">
                        <TrendingUp size={16} className="text-slate-400 shrink-0" />
                        <input
                           type="text"
                           value={profile.tradingview || ""}
                           onChange={e => setProfile({ ...profile, tradingview: e.target.value })}
                           placeholder="TradingView"
                           className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                        />
                     </div>
                  </div>
                  <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1 px-1">
                     A username or a link to your profile. Empty ones stay hidden.
                  </p>
               </div>
            </div>

            {/* 3. WHAT OTHERS SEE ON YOUR CARD */}
            <div>
               <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">
                     WHAT OTHERS SEE ON YOUR CARD
                  </h3>
                  {(() => {
                     const toggleKeys = ['trades', 'winRate', 'roi', 'avgRR', 'streak', 'tradingPerformance', 'followers', 'calendar'];
                     const anyOn = toggleKeys.some((k) => cardToggles[k] !== false);
                     return (
                        <button
                           type="button"
                           onClick={() => {
                              const nextVal = !anyOn;
                              toggleKeys.forEach((k) => updateCardToggle(k, nextVal));
                           }}
                           className="text-[11px] font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer"
                        >
                           {anyOn ? 'Hide all' : 'Show all'}
                        </button>
                     );
                  })()}
               </div>
               <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl border border-black/[0.05] dark:border-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                  <div className="flex items-center justify-between py-2.5 px-3.5">
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">Trades</span>
                     <ProfileToggle checked={cardToggles.trades} onChange={v => updateCardToggle('trades', v)} />
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3.5">
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">Win rate</span>
                     <ProfileToggle checked={cardToggles.winRate} onChange={v => updateCardToggle('winRate', v)} />
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3.5">
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">ROI (All time)</span>
                     <ProfileToggle checked={cardToggles.roi} onChange={v => updateCardToggle('roi', v)} />
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3.5">
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">Avg RR</span>
                     <ProfileToggle checked={cardToggles.avgRR} onChange={v => updateCardToggle('avgRR', v)} />
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3.5">
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">Streak</span>
                     <ProfileToggle checked={cardToggles.streak} onChange={v => updateCardToggle('streak', v)} />
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3.5">
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">Trading Performance</span>
                     <ProfileToggle checked={cardToggles.tradingPerformance} onChange={v => updateCardToggle('tradingPerformance', v)} />
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3.5">
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">Followers & Following</span>
                     <ProfileToggle checked={cardToggles.followers} onChange={v => updateCardToggle('followers', v)} />
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3.5">
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">Trading Calendar</span>
                     <ProfileToggle checked={cardToggles.calendar} onChange={v => updateCardToggle('calendar', v)} />
                  </div>
               </div>
               <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-2 px-1 leading-normal">
                  All off until you turn them on. Only what you switch on is shown or shared, from your live trades, never paper.
               </p>
            </div>

            {/* 4. Verification Card */}
            <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl p-5 border border-black/[0.05] dark:border-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] space-y-4">
               <div>
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Verification</h3>
                  <p className="text-[12px] text-slate-500 dark:text-neutral-400 mt-1 leading-normal">
                     Their numbers are self-reported from their own journal. Read them as someone's own record-keeping, not as results.
                  </p>
               </div>

               {/* Blue check */}
               <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-[#2563EB] shrink-0 mt-0.5 fill-[#2563EB] text-white" />
                  <div className="space-y-0.5">
                     <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Blue check</h4>
                     <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                        Included with every active Pro subscription — confirms a verified paying Pro trader, not a throwaway account.
                     </p>
                  </div>
               </div>

               {/* Green check */}
               <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5 fill-[#059669] text-white" />
                  <div className="space-y-0.5">
                     <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Green check</h4>
                     <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                        Reserved exclusively for Elite members (not available on Pro). Awarded after submitting screen recording proof of funded prop firm accounts, original firm emails, and verified payouts in their name.
                     </p>
                     <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                        Elite members can request verification in Settings → Account.
                     </p>
                  </div>
               </div>

               <p className="text-[11px] text-slate-400 dark:text-neutral-500 pt-3 border-t border-slate-100 dark:border-white/5">
                  Neither check verifies your numbers. Everything in your journal is self-reported.
               </p>
            </div>

            <div className="md:hidden">
               <ProfileAccountPreferencesCard
                  profile={profile}
                  onManageEmail={() => setActiveTab && setActiveTab('account')}
                  onSetPassword={() => setActiveTab && setActiveTab('account')}
               />
            </div>

            {/* 11. Save Profile Button */}
            <div className="pt-2 pb-1 px-1">
               <TactileBoxButton
                  onClick={onSave}
                  disabled={loading}
                  className="h-10 px-5 text-[13.5px] font-bold"
               >
                  {loading ? 'Saving...' : 'Save Profile'}
               </TactileBoxButton>
            </div>
         </div>
      </>
   );
}
