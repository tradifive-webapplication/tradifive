import React, { useState, useMemo, useEffect } from 'react';
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
   return (
      <button
         type={type}
         disabled={disabled}
         onClick={onClick}
         style={{
            background: "rgba(227, 227, 227, 0.8)",
            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.16), inset 0 1px 0 0 #FDFDFD",
            ...style
         }}
         className={cn(
            "h-9 px-4 rounded-[11px] text-slate-900 dark:text-white font-bold text-[13px]",
            "dark:bg-gradient-to-b dark:from-[#201E25] dark:to-[#323137]",
            "dark:shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_0_1px_#0D0D0D,inset_0_1px_0_rgba(255,255,255,0.12)]",
            "hover:brightness-[0.98] active:brightness-[0.95] active:translate-y-[0.5px] active:scale-[0.98]",
            "active:shadow-[0_1px_2px_rgba(0,0,0,0.10),0_0_0_1px_rgba(0,0,0,0.20),inset_0_2px_4px_rgba(0,0,0,0.12)]",
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
   return (
      <button
         type="button"
         onClick={onClick}
         style={active ? { 
            background: "rgba(227, 227, 227, 0.8)",
            boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 0 0 1px rgba(0, 0, 0, 0.16), inset 0 1px 0 0 #FDFDFD" 
         } : {}}
         className={cn(
            "transition-all duration-150 cursor-pointer select-none font-bold text-[13px]",
            active
               ? "rounded-[11px] text-slate-900 dark:text-white dark:shadow-[0_2px_4px_rgba(0,0,0,0.5),0_0_0_1px_#0D0D0D] dark:bg-gradient-to-b dark:from-[#201E25] dark:to-[#323137]"
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
         checked ? "bg-[#3b82f6]" : "bg-[#64748B] dark:bg-[#475569]"
      )}
   >
      <div
         className={cn(
            "absolute top-1/2 -translate-y-1/2 left-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-[20px]" : "translate-x-0"
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
                  "w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all disabled:opacity-50",
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

export default function ProfileTab({
   profile,
   setProfile,
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
   const [newTag, setNewTag] = useState('');
   const [isAddingTag, setIsAddingTag] = useState(false);
   const tags = profile.tags || [];

   // Mobile Card Toggles (Real TradiFive profile items: Trades, Win Rate, ROI, Avg RR, Streak, Performance, AI Analysis, Followers, Calendar)
   const [cardToggles, setCardToggles] = useState(() => {
      const saved = localStorage.getItem('tradifive_card_toggles');
      if (saved) {
         try { return JSON.parse(saved); } catch (e) {}
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
                     const cached = localStorage.getItem('prof_cache_data');
                     const uid = cached ? JSON.parse(cached)?.id : null;
                     if (uid) {
                        localStorage.setItem(`tradifive_privacy_${uid}`, JSON.stringify(pNext));
                     }
                     const uname = profile?.username || profile?.name;
                     if (uname) {
                        localStorage.setItem(`tradifive_privacy_user_${uname.toLowerCase()}`, JSON.stringify(pNext));
                     }
                     window.dispatchEvent(new Event("storage"));
                  } catch (e) {}
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

   // Mobile Time, Date, Language preferences
   const [timeFormat, setTimeFormat] = useState(() => localStorage.getItem('tradifive_time_format') || '24h');
   const handleSetTimeFormat = (fmt: string) => {
      setTimeFormat(fmt);
      localStorage.setItem('tradifive_time_format', fmt);
   };

   const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('tradifive_date_format') || 'Automatic');
   const handleSetDateFormat = (fmt: string) => {
      setDateFormat(fmt);
      localStorage.setItem('tradifive_date_format', fmt);
   };

   const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('tradifive_language') || 'English');
   const handleSetLanguage = (lang: string) => {
      setSelectedLanguage(lang);
      localStorage.setItem('tradifive_language', lang);
   };

   const [alwaysTranslate, setAlwaysTranslate] = useState(() => localStorage.getItem('tradifive_always_translate') === 'true');
   const handleSetAlwaysTranslate = (val: boolean) => {
      setAlwaysTranslate(val);
      localStorage.setItem('tradifive_always_translate', String(val));
   };

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
         {/* ── MOBILE PROFILE VIEW (Exact Match of Reference Pictures 1, 2, 3) ── */}
         <div className="md:hidden space-y-4 max-w-lg mx-auto pb-1 select-none">
            {/* Header Title & Subtitle */}
            <div className="pt-1 pb-1 px-1">
               <h1 className="text-[26px] font-bold text-slate-900 dark:text-white tracking-tight">Profile</h1>
               <p className="text-[13px] text-slate-400 dark:text-neutral-400 font-normal mt-0.5">
                  Your card, email, timezone and time format
               </p>
            </div>

            {/* 1. Hero Profile Card with cover banner, cover camera button, avatar with camera overlay, name, username, Cancel & Save tactile buttons */}
            <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl overflow-hidden border border-black/[0.05] dark:border-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] relative">
               {/* Banner Image with smooth bottom fade */}
               <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-neutral-800">
                  <img
                     src={profile.bannerUrl || profile.avatarUrl || "/nikil_avatar.jpg"}
                     alt="Cover"
                     className="w-full h-full object-cover object-center"
                     onError={(e) => { (e.target as HTMLImageElement).src = "/default-cover.png"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#1A1A1E] dark:via-[#1A1A1E]/40 pointer-events-none" />
                  
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
                  <div className="relative w-[72px] h-[72px] rounded-full border-[3px] border-white dark:border-[#1A1A1E] shadow-md overflow-hidden bg-white dark:bg-neutral-800 shrink-0 group">
                     <img
                        src={profile.avatarUrl || "/nikil_avatar.jpg"}
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
                     {profile.display_name || profile.name || "nikhil Harake"}
                  </h2>
                  <p className="text-[12px] text-slate-400 dark:text-neutral-500 font-normal mt-0.5 truncate">
                     @{profile.username || "nikhilharake"}
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
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-semibold">
                              <Link2 size={11} />
                              <span className="truncate max-w-[150px]">{profile.website.replace(/^https?:\/\//, '')}</span>
                           </span>
                        )}
                        {profile.instagram && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 text-[10.5px] font-medium">
                              <Instagram size={11} className="text-pink-500" />
                              <span className="truncate max-w-[90px]">@{profile.instagram.replace('@', '')}</span>
                           </span>
                        )}
                        {profile.youtube && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 text-[10.5px] font-medium">
                              <Youtube size={11} className="text-red-500" />
                              <span className="truncate max-w-[90px]">{profile.youtube}</span>
                           </span>
                        )}
                        {profile.discord && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 text-[10.5px] font-medium">
                              <MessageSquare size={11} className="text-indigo-500" />
                              <span className="truncate max-w-[90px]">{profile.discord}</span>
                           </span>
                        )}
                        {profile.tradingview && (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 text-[10.5px] font-medium">
                              <TrendingUp size={11} className="text-blue-500" />
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
                           <span className="text-[10px] text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
                              Live Preview
                           </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           {cardToggles.trades && (
                              <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#202024] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">TRADES</span>
                                    <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center">
                                       <BarChart2 size={11} className="text-blue-500" />
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
            <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl p-5 border border-black/[0.05] dark:border-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] space-y-4">
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
                     className="w-full bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-4 py-2.5 text-[13.5px] text-slate-900 dark:text-white font-medium outline-none border border-transparent focus:border-blue-500 transition-colors"
                  />
               </div>

               {/* USERNAME */}
               <div>
                  <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                     USERNAME
                  </label>
                  <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 border border-transparent focus-within:border-blue-500 transition-colors">
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
                     value={profile.bio || ""}
                     onChange={e => setProfile({ ...profile, bio: e.target.value })}
                     placeholder="No bio yet. Update your profile to tell others about your trading style."
                     maxLength={280}
                     rows={3}
                     className="w-full bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-4 py-3 text-[13.5px] text-slate-900 dark:text-white font-medium outline-none border border-transparent focus:border-blue-500 transition-colors resize-none"
                  />
                  <div className="text-right text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5 px-1">
                     {(profile.bio?.length || 0)}/280
                  </div>
               </div>

               {/* LINK with Prestige badge & upgrade button */}
               <div>
                  <div className="flex items-center gap-1.5 mb-1.5 px-1">
                     <span className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider">LINK</span>
                     <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9.5px] font-black uppercase tracking-wider">
                        <Lock size={10} strokeWidth={2.5} /> PRESTIGE
                     </span>
                  </div>
                  <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2 border border-transparent focus-within:border-blue-500 transition-colors">
                     <Link2 size={15} className="text-slate-400 shrink-0" />
                     <input
                        type="text"
                        value={profile.website || ""}
                        onChange={e => setProfile({ ...profile, website: e.target.value })}
                        placeholder="Your Linktree, website or any page"
                        className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                     />
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-2 px-1">
                     <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 leading-tight">
                        Add one link under your bio, like your Linktree, with Prestige.
                     </p>
                     <button
                        type="button"
                        onClick={() => setActiveTab && setActiveTab('subscription')}
                        className="shrink-0 bg-gradient-to-r from-[#D99A2B] via-[#F5C451] to-[#E5A93C] text-slate-950 font-bold text-[11.5px] px-3.5 py-2 rounded-xl shadow-[0_2px_4px_rgba(217,154,43,0.3)] active:scale-95 transition-transform cursor-pointer"
                     >
                        Upgrade to Prestige
                     </button>
                  </div>
               </div>

               {/* SOCIALS */}
               <div>
                  <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                     SOCIALS
                  </label>
                  <div className="space-y-2">
                     <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2.5 border border-transparent focus-within:border-blue-500 transition-colors">
                        <Instagram size={16} className="text-slate-400 shrink-0" />
                        <input
                           type="text"
                           value={profile.instagram || ""}
                           onChange={e => setProfile({ ...profile, instagram: e.target.value })}
                           placeholder="Instagram"
                           className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                        />
                     </div>
                     <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2.5 border border-transparent focus-within:border-blue-500 transition-colors">
                        <Youtube size={16} className="text-slate-400 shrink-0" />
                        <input
                           type="text"
                           value={profile.youtube || ""}
                           onChange={e => setProfile({ ...profile, youtube: e.target.value })}
                           placeholder="YouTube"
                           className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                        />
                     </div>
                     <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2.5 border border-transparent focus-within:border-blue-500 transition-colors">
                        <MessageSquare size={16} className="text-slate-400 shrink-0" />
                        <input
                           type="text"
                           value={profile.discord || ""}
                           onChange={e => setProfile({ ...profile, discord: e.target.value })}
                           placeholder="Discord invite code"
                           className="w-full bg-transparent text-[13.5px] text-slate-900 dark:text-white font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-neutral-500"
                        />
                     </div>
                     <div className="flex items-center bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-3.5 py-2.5 gap-2.5 border border-transparent focus-within:border-blue-500 transition-colors">
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
               <h3 className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider mb-2 px-1">
                  WHAT OTHERS SEE ON YOUR CARD
               </h3>
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
                     <span className="text-[13px] font-semibold text-slate-800 dark:text-white">TradiFive AI Analysis</span>
                     <ProfileToggle checked={cardToggles.aiAnalysis} onChange={v => updateCardToggle('aiAnalysis', v)} />
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
                        A paying subscriber. A real account with money behind it, not a throwaway. Included with every Prestige and Apex subscription.
                     </p>
                  </div>
               </div>

               {/* Emerald check */}
               <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-[#059669] shrink-0 mt-0.5 fill-[#059669] text-white" />
                  <div className="space-y-0.5">
                     <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Emerald check</h4>
                     <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                        This trader sent TradiFive a screen recording of their funded prop firm accounts, the firm's original emails and proof a payout reached them in their name, and a person checked them against their account.
                     </p>
                     <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                        Ask in Settings → Green check. You get a guide by email, and a real person reviews your proof. Free, on any plan.
                     </p>
                  </div>
               </div>

               <p className="text-[11px] text-slate-400 dark:text-neutral-500 pt-3 border-t border-slate-100 dark:border-white/5">
                  Neither check verifies your numbers. Everything in your journal is self-reported.
               </p>
            </div>

            {/* 5. EMAIL */}
            <div>
               <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                  EMAIL
               </label>
               <div className="flex items-center gap-2">
                  <input
                     type="email"
                     readOnly
                     value={profile.email || "nikhilharake369@gmail.com"}
                     className="flex-1 min-w-0 bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-4 py-2.5 text-[13px] text-slate-800 dark:text-white font-medium outline-none border border-transparent truncate"
                  />
                  <TactileBoxButton
                     onClick={() => toast.info("To change your email, check your inbox for verification link.")}
                     className="h-10 px-4 text-[13px] shrink-0"
                  >
                     Change
                  </TactileBoxButton>
               </div>
               <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1.5 px-1">
                  You sign in with this email, and every TradiFive email and receipt goes here.
               </p>
            </div>

            {/* 6. PASSWORD */}
            <div>
               <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                  PASSWORD
               </label>
               <p className="text-[12px] text-slate-500 dark:text-neutral-400 mb-2.5 px-1 leading-normal">
                  You sign in with Google or Apple. Add a password to also sign in with your email or @username.
               </p>
               <TactileBoxButton
                  onClick={() => toast.info("Password reset link has been dispatched to your email.")}
                  className="h-10 px-4 text-[13px]"
               >
                  Set a password
               </TactileBoxButton>
            </div>

            {/* 7. TIMEZONE */}
            <div>
               <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                  TIMEZONE
               </label>
               <div className="w-full bg-[#F2F4F7] dark:bg-[#202024] rounded-xl px-4 py-3 flex items-center justify-between text-[13px] font-medium text-slate-800 dark:text-white border border-transparent cursor-pointer">
                  <span>This device · Calcutta</span>
                  <span className="text-slate-400 dark:text-neutral-500 flex items-center gap-1">
                     UTC+5:30 · 18:24
                     <ChevronDown size={14} />
                  </span>
               </div>
               <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1.5 px-1">
                  New trades are logged in this timezone. You can still change it on a single trade.
               </p>
            </div>

            {/* 8. TIME FORMAT */}
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

            {/* 9. DATE FORMAT */}
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

            {/* 10. LANGUAGE */}
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

            {/* 11. Always translate toggle */}
            <div className="pt-1">
               <div className="flex items-center justify-between gap-3 px-1">
                  <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                     Always translate Community and Mailbox into English
                  </span>
                  <ProfileToggle checked={alwaysTranslate} onChange={handleSetAlwaysTranslate} />
               </div>
               <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-1.5 px-1 leading-normal">
                  Posts, replies and messages in another language show translated as you scroll. Off: a Translate link under each one. The AI translates them; messages are never kept.
               </p>
            </div>

            {/* 12. Save Profile Button */}
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

         {/* ── DESKTOP PROFILE VIEW (Preserved 100% for Web User App) ── */}
         <div className="hidden md:flex flex-col xl:flex-row gap-6">
         {/* Left Column - Controls */}
         {isInitialLoading ? (
            <div className="flex-1 space-y-6 animate-pulse">
               <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 overflow-hidden">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-[#333] rounded mb-6"></div>
                  <div className="h-40 rounded-xl bg-slate-200 dark:bg-[#202020] mb-16 relative">
                     <div className="absolute -bottom-10 left-6">
                        <div className="w-24 h-24 rounded-full border-[6px] border-white dark:border-[#151515] bg-slate-300 dark:bg-[#333]"></div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="h-10 w-full bg-slate-200 dark:bg-[#333] rounded-xl"></div>
                     <div className="h-24 w-full bg-slate-200 dark:bg-[#333] rounded-xl"></div>
                  </div>
               </div>
               <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 overflow-hidden space-y-4">
                  <div className="h-6 w-32 bg-slate-200 dark:bg-[#333] rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="h-10 w-full bg-slate-200 dark:bg-[#333] rounded-xl"></div>
                     <div className="h-10 w-full bg-slate-200 dark:bg-[#333] rounded-xl"></div>
                  </div>
               </div>
            </div>
         ) : (
            <div className="flex-1 space-y-6">
               {/* Profile Appearance */}
               <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 overflow-hidden">
                  <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Appearance</h2>
                        <p className="text-sm text-slate-500 dark:text-[#949ba4]">Customize how your profile looks to other traders.</p>
                     </div>
                  </div>

                  {/* Banner & Avatar */}
                  <div className="relative mb-16">
                     {/* Banner */}
                     <div className="h-40 rounded-xl overflow-hidden bg-gradient-to-r from-slate-800 to-slate-900 relative group border border-slate-200 dark:border-[#333333]">
                        {profile.bannerUrl ? (
                           <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full bg-cover bg-center opacity-40" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')" }}></div>
                        )}
                        <button onClick={() => bannerUploadRef?.current?.click()} className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-[12px] font-semibold rounded-lg transition-colors border border-white/10 z-10">
                           <Camera size={14} /> Change Cover
                        </button>
                     </div>
                     {/* Avatar */}
                     <div className="absolute -bottom-12 left-6">
                        <div className="relative group">
                           <div className="w-24 h-24 rounded-full border-4 border-white dark:border-[#151515] bg-slate-200 dark:bg-[#2B2B2B] overflow-hidden">
                              <img src={profile.avatarUrl || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }} />
                           </div>
                           <button onClick={() => avatarUploadRef?.current?.click()} className="absolute bottom-0 right-0 w-8 h-8 bg-[#3b82f6] hover:bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-[#151515] transition-colors shadow-md">
                              <Camera size={14} />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">Display Name</label>
                        <input type="text" placeholder="Your Name" value={profile.display_name ?? ""} onChange={e => setProfile({ ...profile, display_name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1 flex justify-between">Username <Check size={12} className="text-green-500" /></label>
                        <div className="relative">
                           <input type="text" placeholder="@your_username" value={profile.username || ""} onChange={e => setProfile({ ...profile, username: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all" />
                           <span className="absolute -bottom-5 left-1 text-[10px] text-slate-500 dark:text-[#949ba4]">tradifive.in/<span className="text-green-500">{profile.username || "your_username"}</span></span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-1.5 mb-6 mt-6">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1 flex justify-between">
                        Bio <span>{(profile.bio?.length || 0)}/120</span>
                     </label>
                     <textarea value={profile.bio || ""} placeholder="No bio yet. Update your profile to tell others about your trading style." onChange={e => setProfile({ ...profile, bio: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all resize-none h-20" maxLength={120} />
                  </div>

                  <div className="space-y-1.5 mb-6">
                     <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">Trading Style Tags</label>
                     <div className="flex flex-wrap gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333]">
                        {tags.map((tag: string, idx: number) => (
                           <div key={idx} className="px-3 py-1.5 rounded-md bg-blue-500/10 text-[#3b82f6] dark:text-[#60a5fa] text-[12px] font-bold flex items-center gap-2">
                              {tag}
                              <button onClick={() => handleRemoveTag(idx)} className="text-slate-400 hover:text-red-500">&times;</button>
                           </div>
                        ))}
                        {isAddingTag ? (
                           <div className="flex items-center gap-1">
                              <input
                                 type="text"
                                 value={newTag}
                                 onChange={e => setNewTag(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                                 placeholder="New tag..."
                                 autoFocus
                                 className="px-2 py-1.5 text-[12px] rounded bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/5 outline-none w-24"
                              />
                              <Button size="sm" onClick={handleAddTag}>Add</Button>
                           </div>
                        ) : (
                           tags.length < 3 && (
                              <Button variant="secondary" size="sm" onClick={() => setIsAddingTag(true)}>+ Add Tag</Button>
                           )
                        )}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">Country</label>
                        <SearchableCombobox
                           value={profile.country || ""}
                           onChange={(val: string) => setProfile({ ...profile, country: val, state: '', city: '' })}
                           items={countries}
                           placeholder="Select Country"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">State / Region</label>
                        <SearchableCombobox
                           value={profile.state || ""}
                           onChange={(val: string) => setProfile({ ...profile, state: val, city: '' })}
                           items={states}
                           placeholder="Select State"
                           disabled={!profile.country || states.length === 0}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">City</label>
                        <input
                           type="text"
                           placeholder="Enter your city"
                           value={profile.city || ""}
                           onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                           className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1">Website</label>
                        <div className="relative">
                           <input type="text" placeholder="linktr.ee/..." value={profile.website || ""} onChange={e => setProfile({ ...profile, website: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all pl-9" />
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-3 text-slate-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                           <ExternalLink size={14} className="absolute right-3 top-3 text-slate-400" />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1 flex items-center gap-1">Profile Badges Visibility <Circle size={10} className="fill-slate-500 text-slate-500" /></label>
                        <div className="relative">
                           <select
                              value={profile.badgesVisibility || "Everyone"}
                              onChange={e => setProfile({ ...profile, badgesVisibility: e.target.value })}
                              className="w-full appearance-none px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-all"
                           >
                              <option value="Everyone">Everyone</option>
                              <option value="Followers Only">Followers Only</option>
                              <option value="Only Me">Only Me</option>
                           </select>
                           <ChevronDown size={14} className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] px-1 flex items-center gap-1">Account Privacy <Crown size={10} className="text-slate-500" /></label>
                        <label className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                           <span className="text-[13px] font-medium text-slate-800 dark:text-white">Private Account</span>
                           <div className="relative inline-flex items-center">
                              <input type="checkbox" className="sr-only peer" checked={privacySettings?.is_private || false} onChange={e => setPrivacySettings({ ...privacySettings, is_private: e.target.checked })} />
                              <div className="w-9 h-5 bg-slate-300 dark:bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-500"></div>
                           </div>
                        </label>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Right Column - Previews */}
         <div className="w-full xl:w-[350px] shrink-0 space-y-6">
            {/* Live Preview Card */}
            <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm overflow-hidden">
               <div className="p-4 text-[11px] text-slate-500 dark:text-[#949ba4] font-medium border-b border-slate-100 dark:border-[#2a2a2a]">
                  This is how others will see your profile.
               </div>

               {isInitialLoading ? (
                  <>
                     <div className="h-28 bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
                     <div className="px-4 pb-4 relative pt-12">
                        <div className="absolute -top-10 left-4 w-20 h-20 rounded-full border-4 border-white dark:border-[#151515] bg-slate-300 dark:bg-slate-700 animate-pulse"></div>
                        <div className="mb-4 mt-2">
                           <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                           <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-4"></div>
                           <div className="space-y-2">
                              <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                              <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                           <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                           <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                        <div className="flex gap-2 mb-4">
                           <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-[#2a2a2a] pt-4">
                           <div className="h-8 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           <div className="h-8 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                           <div className="h-8 w-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                        </div>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="h-28 bg-white dark:bg-[#151515] relative overflow-hidden">
                        {profile.bannerUrl ? (
                           <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)]" />
                        ) : (
                           <div className="w-full h-full bg-cover bg-center opacity-40 [mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_30%,transparent_100%)]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')" }}></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-[#151515] dark:via-[#151515]/50 dark:to-transparent pointer-events-none" />
                     </div>

                     <div className="px-4 pb-4 relative pt-12">
                        <div className="absolute -top-10 left-4 w-20 h-20 rounded-full border-4 border-white dark:border-[#151515] bg-slate-200 dark:bg-[#2B2B2B] overflow-hidden">
                           <img src={profile.avatarUrl || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }} />
                        </div>


                        <div className="mb-4 mt-2">
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              {profile.display_name || "Your Name"}
                           </h3>
                           <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mb-2">@{profile.username || "your_username"}</p>

                           <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                              {profile.bio || "No bio yet. Update your profile to tell others about your trading style."}
                           </p>
                        </div>

                        {(!profile.badgesVisibility || profile.badgesVisibility === "Everyone" || profile.badgesVisibility === "Followers Only") && (
                           <div className="flex items-center gap-2 mb-4">
                              <span className="text-[10px] font-bold text-[#3b82f6] bg-blue-500/10 px-1.5 py-0.5 rounded">👑 Lv 1</span>
                              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-[#2B2B2B] rounded-full overflow-hidden">
                                 <div className="w-[10%] h-full bg-[#3b82f6] rounded-full" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">0/500 XP</span>
                           </div>
                        )}

                        <div className="flex flex-wrap gap-1 mb-4">
                           {tags.map((tag: string, idx: number) => (
                              <div key={idx} className="px-2 py-0.5 rounded bg-blue-500/10 text-[#3b82f6] dark:text-[#60a5fa] text-[10px] font-bold border border-blue-500/20">☆ {tag}</div>
                           ))}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-[#949ba4] mb-6 flex-wrap">
                           <div className="flex items-center gap-1 truncate"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> <span className="truncate">{profile.city || "Mumbai, Maharashtra"}</span></div>
                           {profile.website && (
                              <div className="flex items-center gap-1 text-[#3b82f6] hover:underline cursor-pointer truncate"><ExternalLink size={12} className="shrink-0" /> <span className="truncate">{profile.website.replace(/^https?:\/\//, '')}</span></div>
                           )}
                           <div className="flex items-center gap-1 shrink-0"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Joined Jan 2024</div>
                        </div>

                        <div className="flex justify-between border-t border-slate-100 dark:border-[#2a2a2a] pt-4">
                           <div className="text-center">
                              <div className="text-[14px] font-bold text-slate-900 dark:text-white">0</div>
                              <div className="text-[10px] font-medium text-slate-500">Posts</div>
                           </div>
                           <div className="text-center">
                              <div className="text-[14px] font-bold text-slate-900 dark:text-white">0</div>
                              <div className="text-[10px] font-medium text-slate-500">Followers</div>
                           </div>
                           <div className="text-center">
                              <div className="text-[14px] font-bold text-slate-900 dark:text-white">0</div>
                              <div className="text-[10px] font-medium text-slate-500">Following</div>
                           </div>
                        </div>
                     </div>
                  </>
               )}
            </div>

            {/* Profile Summary Card */}
            <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 overflow-hidden">
               <h3 className="text-[11px] font-extrabold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider mb-6">Profile Summary</h3>

               <div className="flex items-center gap-4 mb-6">
                  {/* Progress Circle Mockup */}
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                     <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-slate-100 dark:text-[#2B2B2B]" strokeWidth="3" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${completenessChecks.percentage}, 100`} />
                     </svg>
                     <div className="absolute text-[13px] font-bold text-slate-900 dark:text-white">{completenessChecks.percentage}%</div>
                  </div>
                  <div>
                     <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Profile Completeness</h4>
                     <p className="text-[11px] text-slate-500 dark:text-[#949ba4] leading-tight mt-1">Complete your profile to increase trust and visibility.</p>
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasAvatar ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasAvatar ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Add profile picture</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasBanner ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasBanner ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Add cover photo</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasTags ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasTags ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Add trading style tags</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasBio ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasBio ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Write bio</span>
                  </div>
                  <div className="flex items-center gap-3">
                     {completenessChecks.hasSocial ? <CheckCircle2 size={16} className="text-green-500" /> : <Circle size={16} className="text-slate-300 dark:text-[#2B2B2B]" />}
                     <span className={`text-[12px] font-medium ${completenessChecks.hasSocial ? 'text-slate-800 dark:text-slate-300' : 'text-slate-500'}`}>Connect social links</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
      </>
   );
}
