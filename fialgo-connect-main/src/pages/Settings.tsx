import { RunningNumber } from '@/components/ui/RunningNumber';
import { AnimatedInput } from '@/components/ui/animated-input';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../theme-switch.css';
import DashboardLayout from '@/components/DashboardLayout';
import logoOnly from '@/assets/Logo_only.png';
import defaultAvatar from '@/assets/default-avatar.svg';
import AccountTab from '@/components/settings/AccountTab';
import ProfileTab, { TactileBoxButton, ProfileAccountPreferencesCard } from '@/components/settings/ProfileTab';
import HelpTab from '@/components/settings/HelpTab';
import ReportTab from '@/components/settings/ReportTab';
import CreatorTab from '@/components/settings/CreatorTab';
import { supabase } from '@/lib/supabase';
import { usePlan } from '@/hooks/usePlan';
import { performAppLogout } from '@/utils/logout';
import { useMarket } from '@/contexts/MarketContext';
import { toast } from 'sonner';
import { applyThemeWithTransition } from '@/utils/themeTransition';
import { getGamificationState, saveGamificationState } from '@/utils/gamification';
import { validateUsername } from '@/utils/usernameValidation';
import { PricingCards } from '@/components/PricingCards';
import { initiateRazorpayCheckout } from '@/lib/razorpay';
import ThemeSwitch from '@/components/ThemeSwitch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
   Settings as SettingsIcon, Camera, Check, 
   Twitter, Instagram, Youtube, Trash2, Shield, 
   Smartphone, Monitor, Moon, Sun, MonitorSmartphone, Power, X,
   Key, Lock, Globe, Bot, Brain, TrendingUp, Gem, Receipt, Hash, Award, 
   FileText, ChevronDown, CheckCircle, RefreshCw, Eye, EyeOff,
   ArrowUpRight, ShieldCheck, Terminal, Volume2, Calendar, LockKeyhole, Sparkles,
   CircleUserRound, Languages, BellRing, MessageCircle, AlertCircle, Inbox, MoreVertical, ArrowRight, Plus, Minus, Download,
   AlertTriangle, Palette, Mail, Link2, Info, Crown, CreditCard, MessageSquare, LogOut,
   ChevronLeft, Sliders, Copy, Pencil, HelpCircle, MousePointer } from 'lucide-react';
import { triggerHaptic } from '@/utils/haptics';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Category, Notification, Star, Swap, TicketStar, Wallet, Chat, InfoCircle, Danger, Logout, Edit, Search, ChevronRight, Activity, ShieldDone, Document, Setting } from 'react-iconly';
import { useAICoachData } from '@/hooks/useAICoachData';
import { useTradingTheme } from '@/hooks/useTradingTheme';
import { TradingThemeId } from '@/utils/tradingTheme';

const TAB_TITLES: Record<string, string> = {
   account: "Account & Security",
   general: "General Details",
   profile: "Profile",
   security: "Account & Security",
   privacy: "Privacy & Community",
   appearance: "Theme & Display",
   notifications: "Notifications",
   ai: "AI Coach",
   trading: "Accounts & Brokers",
   subscription: "Subscription",
   channel: "Channel Settings",
   creator: "Creator Account",
   help: "Help Center",
   report: "Report a Problem",
   terms: "Terms & Policies"
};

const TAB_SUBTITLES: Record<string, string> = {
   profile: "Your card, bio, avatar, banner and privacy preferences",
   account: "Manage email, password, sessions, standing and data export",
   security: "Protect your account with password and session controls",
   privacy: "Control profile visibility and community privacy",
   notifications: "Choose which trade alerts and activity pings you receive",
   trading: "Connect MetaTrader 5 and Indian broker accounts",
   ai: "Customize your TradiFive AI Coach persona and guardrails",
   subscription: "Manage your active plan, perks and billing history",
   appearance: "Switch light or dark theme and display preferences",
   channel: "Configure your community channel and messaging settings",
   creator: "Manage creator monetization, payouts and subscriber perks",
   help: "Guides, FAQs and direct TradiFive support",
   report: "Share bugs or issues directly with our engineering team",
};

const PushableButton = ({ children, onClick, type = 'primary', className = '', ...props }: any) => {
   const baseClasses = "relative rounded-xl font-bold transition-all duration-200 active:top-[2px] active:shadow-none overflow-hidden";
   
   const types = {
      primary: "bg-indigo-650 text-white shadow-[0_4px_0_rgb(67,56,202)] hover:bg-indigo-700 active:shadow-[0_0px_0_rgb(67,56,202)]",
      secondary: "bg-white dark:bg-[#121212] text-slate-700 dark:text-slate-200 shadow-[0_4px_0_rgb(203,213,225)] dark:shadow-none hover:bg-slate-50 dark:hover:bg-[#222225] border border-slate-200 dark:border-transparent",
      danger: "bg-red-500 text-white shadow-[0_4px_0_rgb(185,28,28)] hover:bg-red-400 active:shadow-[0_0px_0_rgb(185,28,28)]"
   };

   return (
      <button 
         className={`${baseClasses} ${types[type as keyof typeof types]} ${className}`}
         onClick={onClick}
         {...props}
      >
         <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-[-50%] rounded-full blur-md"></div>
         <span className="relative z-10 block">{children}</span>
      </button>
   );
};

const ConsistencyToggleButton = ({ label, checked, onChange, icon: Icon, type = 'button' }: any) => (
   <button
      type={type}
      onClick={onChange}
      className={`inline-flex items-center gap-1.5 h-[44px] px-5 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 ${
         checked
         ? "border-white dark:border-transparent bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-none text-indigo-700 dark:text-indigo-400"
         : "border-white dark:border-transparent bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-none text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-none"
      }`}
   >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
   </button>
);

const AnimatedCheckbox = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
   <button 
      type="button" 
      onClick={() => onChange(!checked)} 
      className={`group relative flex items-center justify-center w-[18px] h-[18px] rounded-[5px] transition-all duration-200 overflow-hidden outline-none ring-0 border ${checked ? 'border-[#5865F2] bg-[#5865F2]' : 'border-slate-300 dark:border-[#313338] bg-white dark:bg-[#1e1f22]'}`}
   >
      {checked && <Check size={11} strokeWidth={4} className="relative z-10 text-white" />}
   </button>
);

const SettingsToggle = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
   <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-9 h-[20px] rounded-full transition-colors duration-200 outline-none focus:outline-none ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${checked ? 'bg-[#3b82f6]' : 'bg-slate-300 dark:bg-[#2b2d31]'}`}
   >
      <div className={`absolute top-1/2 -translate-y-1/2 left-[3px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-[16px]' : 'translate-x-0'}`} />
   </button>
);

const BrokerIcon = ({ name, size = 36 }: { name: string; size?: number }) => {
   const colors: Record<string, string> = {
      icmarkets: "from-emerald-500 to-teal-600 text-white",
      zerodha: "from-blue-500 to-sky-600 text-white",
      dhan: "from-amber-400 to-yellow-500 text-slate-900",
      upstox: "from-purple-500 to-indigo-600 text-white",
      groww: "from-cyan-500 to-teal-500 text-white",
      angelone: "from-orange-500 to-amber-600 text-white",
      ibkr: "from-red-600 to-rose-700 text-white",
      pepperstone: "from-slate-800 to-slate-900 text-white",
      ic: "from-emerald-500 to-teal-600 text-white",
      vantage: "from-blue-600 to-indigo-700 text-white",
      exness: "from-yellow-400 to-yellow-600 text-slate-900",
      xm: "from-red-500 to-red-700 text-white"
   };
   
   const initials: Record<string, string> = {
      icmarkets: "IC",
      zerodha: "Z",
      dhan: "D",
      upstox: "U",
      groww: "G",
      angelone: "A",
      ibkr: "IB",
      pepperstone: "P",
      ic: "IC",
      vantage: "V",
      exness: "EX",
      xm: "XM"
   };

   const colorClass = colors[name] || "from-slate-400 to-slate-500 text-white";
   const letter = initials[name] || name.charAt(0).toUpperCase();

   return (
      <div 
         style={{ width: size, height: size }}
         className={`rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center font-extrabold text-[12px] tracking-wider shadow-sm shrink-0`}
      >
         {letter}
      </div>
   );
};

export default function Settings() {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const { activeMarket } = useMarket();
   const { isStarter, isElite, brokerAccountLimit } = usePlan();
   const isBrokerLocked = isStarter || brokerAccountLimit <= 0;

   const normalizeTab = (rawTab: string | null) => {
      if (!rawTab) return 'profile';
      if (rawTab === 'plan') return 'subscription';
      if (rawTab === 'profiles') return 'profile';
      if (rawTab === 'File Setup' || rawTab === 'risk' || rawTab === 'preferences' || rawTab === 'trading-preferences') return 'trading';
      return rawTab;
   };

   const [activeTab, setActiveTab] = useState(() => normalizeTab(searchParams.get('tab')));
   const [mobileShowDetails, setMobileShowDetails] = useState(() => Boolean(searchParams.get('tab')));

   useEffect(() => {
      const rawTab = searchParams.get('tab');
      if (rawTab) {
         if (rawTab === 'plan') {
            navigate('/upgrade', { replace: true });
            return;
         }
         setActiveTab(normalizeTab(rawTab));
         setMobileShowDetails(true);
         if (rawTab === 'profiles') {
            setIsDesktopEditingProfile(true);
         }
      } else {
         setMobileShowDetails(false);
      }

      const planParam = searchParams.get('plan');
      if (planParam && ['starter', 'pro', 'elite'].includes(planParam)) {
         setSelectedPlan(planParam);
      }
   }, [searchParams, navigate]);
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const headerTitle = TAB_TITLES[activeTab] || "Settings";
   const [activeSubTab, setActiveSubTab] = useState('account-info');
   const [activePlan, setActivePlan] = useState(() => localStorage.getItem('tradifive_cached_plan') || 'starter');
   const [selectedPlan, setSelectedPlan] = useState(() => activePlan);
   const [searchQuery, setSearchQuery] = useState('');
   const [loading, setLoading] = useState(false);
   const [isInitialLoading, setIsInitialLoading] = useState(() => {
      try {
         return !(localStorage.getItem('prof_cache_data') || localStorage.getItem('tradifive_cached_username'));
      } catch {
         return true;
      }
   });
   const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
   
   // Billing State
   const [billingHistory, setBillingHistory] = useState<any[]>([]);
   const [loadingBilling, setLoadingBilling] = useState(true);
   const [downgradeModalPlan, setDowngradeModalPlan] = useState<'starter' | 'pro' | null>(null);
   const [isChangingPlan, setIsChangingPlan] = useState(false);
   const [billingInterval, setBillingInterval] = useState<'monthly' | 'annually'>('monthly');
   const [discountCodeInput, setDiscountCodeInput] = useState('');
   const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);
   const [showRefundModal, setShowRefundModal] = useState(false);

   const applyPlanChange = async (newPlan: 'starter' | 'pro' | 'elite') => {
      setIsChangingPlan(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            await supabase.from('profiles').update({
               subscription_status: newPlan,
               plan_type: newPlan,
            }).eq('id', user.id);
            localStorage.setItem('tradifive_selected_plan', newPlan);
            localStorage.setItem('tradifive_cached_plan', newPlan);
            const limits = { starter: 5, pro: 50, elite: 150, institutional: 1000 };
            const newMax = limits[newPlan] || 5;
            localStorage.setItem(`tradifive_ai_credits_${user.id}`, String(newMax));
            window.dispatchEvent(new Event('tradifive_profile_update'));
         }
         setActivePlan(newPlan);
         setSelectedPlan(newPlan);
         toast.success(`Plan updated to ${newPlan === 'starter' ? 'Standard' : newPlan.charAt(0).toUpperCase() + newPlan.slice(1)}!`);
      } catch (err: any) {
         console.error('Error applying plan change:', err);
         toast.error('Failed to change plan. Please try again.');
      } finally {
         setIsChangingPlan(false);
         setDowngradeModalPlan(null);
      }
   };

   const handleSettingsUpgrade = async (plan: 'starter' | 'pro' | 'elite') => {
      if (plan === 'starter') {
         setDowngradeModalPlan('starter');
         return;
      }
      const BYPASS_RAZORPAY_FOR_TESTING = true;
      if (BYPASS_RAZORPAY_FOR_TESTING) {
         await applyPlanChange(plan);
         return;
      }
      const price = plan === 'pro' ? 1399 : 2799;
      try {
         const { data: { user } } = await supabase.auth.getUser();
         await initiateRazorpayCheckout({
            amount: price * 100,
            currency: 'INR',
            name: 'TradiFive',
            description: `${plan.toUpperCase()} Membership Upgrade`,
            receipt: `sett_upg_${plan}_${Date.now()}`,
            notes: {
               plan,
               userId: user?.id || 'guest',
            },
            prefill: {
               email: user?.email || undefined,
               name: userProfile?.display_name || user?.user_metadata?.full_name || undefined,
            },
            onSuccess: async () => {
               await applyPlanChange(plan);
            },
         });
      } catch (err: any) {
         console.error('Settings upgrade error:', err);
         toast.error(err.message || 'Failed to start checkout.');
      }
   };

   const handleSettingsDowngrade = (plan: 'starter' | 'pro' | 'elite') => {
      if (plan === 'starter' || plan === 'pro') {
         setDowngradeModalPlan(plan);
      }
   };
   
   // Modals State
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [isDesktopEditingProfile, setIsDesktopEditingProfile] = useState(false);
   const [showSmsModal, setShowSmsModal] = useState(false);
   const [phoneDraft, setPhoneDraft] = useState('');
   const [isSavingPhone, setIsSavingPhone] = useState(false);
   const [isConnectingBroker, setIsConnectingBroker] = useState(false);
   const [selectedBrokerToConnect, setSelectedBrokerToConnect] = useState('');
   const [mt5SettingsForm, setMt5SettingsForm] = useState({ server: '', login: '', password: '' });
   const [showMt5SettingsPass, setShowMt5SettingsPass] = useState(false);
   const [isConnectingMt5Settings, setIsConnectingMt5Settings] = useState(false);
   const [mt5ConnectedServer, setMt5ConnectedServer] = useState('');
   
   // Profile State (pre-hydrated from cache to avoid opening flash)
   const [profile, setProfile] = useState<any>(() => {
      let cached: any = {};
      try {
         const raw = localStorage.getItem('prof_cache_data');
         if (raw) cached = JSON.parse(raw) || {};
      } catch {
         // Ignore malformed cache
      }
      const cachedDisplay = cached.display_name || localStorage.getItem('tradifive_cached_display_name') || '';
      const cachedUser = cached.username || localStorage.getItem('tradifive_cached_username') || '';
      const cachedAvatar = cached.avatar_url || localStorage.getItem('tradifive_cached_avatar_url') || '';
      const cachedBanner = cached.banner_url || localStorage.getItem('tradifive_cached_banner_url') || '';
      return {
         firstName: cached.first_name || '',
         lastName: cached.last_name || '',
         name: cachedDisplay,
         display_name: cachedDisplay,
         username: cachedUser,
         email: cached.email || '',
         phone: cached.phone || '',
         avatarUrl: cachedAvatar,
         bannerUrl: cachedBanner,
         bio: cached.bio || '',
         tags: [],
         website: cached.website || '',
         twitter: cached.twitter_url || '',
         instagram: cached.instagram_id || '',
         youtube: cached.youtube_url || '',
         address: '',
         city: cached.location || '',
         state: '',
         zipCode: '',
         country: cached.country || '',
         dob: '',
         gender: '',
         countryEmoji: cached.country_emoji || '🌍',
         isPrivate: false,
         hideFollowers: false,
         hideTrades: false,
         account_standing: 'GOOD',
         standing_message: '',
         preferred_market: 'global'
      };
   });
   
   const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
   const avatarUploadRef = useRef<HTMLInputElement>(null);
   const bannerUploadRef = useRef<HTMLInputElement>(null);

   // Privacy State
   const [privacySettings, setPrivacySettings] = useState<Record<string, any>>({
      show_location: true,
      show_winrate: true,
      show_roi: true,
      show_streak: true,
      show_trades: true,
      is_private: false,
      account_type: 'personal'
   });

   // Notifications State with Persistence
   const [globalOff, setGlobalOff] = useState(() => {
      try {
         return localStorage.getItem('tradifive_notif_global_off') === 'true';
      } catch {
         return false;
      }
   });
   const [globalEmailOnly, setGlobalEmailOnly] = useState(() => {
      try {
         return localStorage.getItem('tradifive_notif_email_only') === 'true';
      } catch {
         return false;
      }
   });
   const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(() => {
      try {
         return localStorage.getItem('tradifive_notif_sound') !== 'false';
      } catch {
         return true;
      }
   });

   const DEFAULT_NOTIFICATIONS = {
      alerts: [
         { id: 'trade', label: 'Trade Execution Fills', desc: 'Instant alert when a manual or algo order opens or closes.', push: true, app: true, email: true },
         { id: 'price', label: 'Price Targets & Stop Loss Hits', desc: 'Real-time alert when market hits your take-profit or stop-loss.', push: true, app: true, email: false },
         { id: 'risk', label: 'RiskGuard & Drawdown Limits', desc: 'Immediate alarm when approaching max daily drawdown or exposure limit.', push: true, app: true, email: true },
      ],
      ai_coach: [
         { id: 'insights', label: 'Real-Time Psychology Insights', desc: 'AI Coach alerts when detecting revenge trading or emotional pacing.', push: true, app: true, email: false },
         { id: 'weekly_report', label: 'Monday Performance Audit Statement', desc: 'Notification when your weekly audited statement is ready to download.', push: true, app: true, email: true },
         { id: 'morning_plan', label: 'Daily Pre-Market Directives', desc: 'Morning notification to review your trading rules before market open.', push: false, app: true, email: false },
      ],
      messages: [
         { id: 'direct', label: 'Direct Messages & Mentions', desc: 'Private messages from other traders, channels, and @mentions.', push: true, app: true, email: false },
         { id: 'group', label: 'Channel & Group Activities', desc: 'Replies, pinned messages, and trade ideas in followed channels.', push: false, app: true, email: false },
      ],
      text: [
         { id: 'sms_alerts', label: 'Security & 2FA Login Alerts', desc: 'Immediate notification when an unrecognized login or IP is detected.', push: true, app: true, email: true },
         { id: 'settlements', label: 'Weekly Profit Settlements', desc: 'Payout confirmations, profit share invoices, and wallet receipts.', push: true, app: true, email: true },
      ],
   };

   const [notifications, setNotifications] = useState(() => {
      try {
         const saved = localStorage.getItem('tradifive_user_notifications');
         if (saved) {
            const parsed = JSON.parse(saved);
            return { ...DEFAULT_NOTIFICATIONS, ...parsed };
         }
      } catch {
         // Ignore malformed saved notifications
      }
      return DEFAULT_NOTIFICATIONS;
   });

    // Appearance State
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
   const [accentColor, setAccentColor] = useState('blue');
   const [layoutDensity, setLayoutDensity] = useState('comfortable');
   const [terminalLogging, setTerminalLogging] = useState(false);
   const [fullScreenLayout, setFullScreenLayout] = useState(() => localStorage.getItem('fialgo_full_screen') === 'true');
   const { themeId: pnlTheme, changeTheme: changePnlTheme, THEMES: PNL_THEMES } = useTradingTheme();
   const [cursorStyle, setCursorStyle] = useState<"3d" | "dot" | "system">(() => {
     if (typeof window === "undefined") return "3d";
     return (localStorage.getItem('tradifive_cursor_style') as "3d" | "dot" | "system") || "3d";
   });

   const handleCursorStyleChange = (style: "3d" | "dot" | "system") => {
     setCursorStyle(style);
     try {
       localStorage.setItem('tradifive_cursor_style', style);
       window.dispatchEvent(new CustomEvent('tradifive_cursor_change', { detail: style }));
     } catch {
       // Ignore storage restrictions
     }
     const names: Record<string, string> = {
       "3d": "3D Glossy Arrow",
       "dot": "Minimal Precision Dot",
       "system": "Classic System Default",
     };
     toast.success(`${names[style]} cursor selected`);
   };

   // New Tab States
   const [language, setLanguage] = useState('en');
   const [aiTone, setAiTone] = useState(() => localStorage.getItem('tradifive_ai_persona') || 'Analytical Quant');
   const [aiVoice, setAiVoice] = useState('female');
   const [aiFrequency, setAiFrequency] = useState(() => localStorage.getItem('tradifive_ai_frequency') || 'Every Trade');
   const [aiAutoReview, setAiAutoReview] = useState(() => localStorage.getItem('tradifive_ai_auto_review') !== 'false');
   const [connectedBroker, setConnectedBroker] = useState<string>('');
   const [brokerApiKey, setBrokerApiKey] = useState('');
   const [brokerClientId, setBrokerClientId] = useState('');
   const [isSyncing, setIsSyncing] = useState(false);
   
   const [bgFadeStyle, setBgFadeStyle] = useState(() => localStorage.getItem('fialgo_bg_fade_style') || 'purple');
   const [lastSyncedTime, setLastSyncedTime] = useState('Just now');
   
   // Creator Settings
   const [creatorHandle, setCreatorHandle] = useState('');
   const [creatorCategory, setCreatorCategory] = useState('Day Trading');
   const [creatorBio, setCreatorBio] = useState('');
   
   // Channel Settings
   const [feedVisibility, setFeedVisibility] = useState('public');
   const [channelRules, setChannelRules] = useState('No self-promotion, maintain civil discussions.');

   // Help FAQ Open state
   const [openFaqId, setOpenFaqId] = useState<number | null>(null);

   // Report State
   const [reportCategory, setReportCategory] = useState('bug');
   const [reportSubject, setReportSubject] = useState('');
   const [reportDescription, setReportDescription] = useState('');

   // Global User ID for AI Credits
   const [globalUserId, setGlobalUserId] = useState<string>('');
   
   const { creditsLeft, maxCredits } = useAICoachData();
   const aiCredits = creditsLeft ?? 0;
   const activeMaxCredits = maxCredits ?? 10;

   // Billing Cards Expand State
   const [starterExpanded, setStarterExpanded] = useState(false);
   const [proExpanded, setProExpanded] = useState(false);
   const [eliteExpanded, setEliteExpanded] = useState(false);

   const handleCloseSettings = () => {
      const fromDhan = localStorage.getItem('dhan_auth_completed') === 'true';
      if (fromDhan) {
         localStorage.removeItem('dhan_auth_completed');
         navigate('/home', { replace: true });
      } else if (document.referrer && !document.referrer.includes(window.location.host)) {
         navigate('/home', { replace: true });
      } else if (window.history.length > 2) {
         navigate(-1);
      } else {
         navigate('/home', { replace: true });
      }
   };

   // Escape key close handling
   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape') {
            handleCloseSettings();
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
         window.removeEventListener('keydown', handleKeyDown);
      };
   }, [navigate]);

   // Listen for authentication completion from popup tab
   useEffect(() => {
      const handleStorage = (e: StorageEvent) => {
         if (e.key === 'dhan_auth_completed' && e.newValue === 'true') {
            setConnectedBroker('dhan');
            setIsConnectingBroker(false);
            setSelectedBrokerToConnect('');
            localStorage.removeItem('dhan_auth_completed');
            toast.dismiss();
            toast.success('Successfully connected your Dhan account!');
         }
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
   }, []);



   // Load privacy settings and profile details on mount
   useEffect(() => {
      const fetchUserData = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            // Load privacy settings from localStorage
            const storedPrivacy = localStorage.getItem(`tradifive_privacy_${user.id}`);
            if (storedPrivacy) {
               setPrivacySettings(JSON.parse(storedPrivacy));
            }
                        setGlobalUserId(user.id);
             
             const params = new URLSearchParams(window.location.search);

             // Check Dhan OAuth redirect callback params
             const tokenId = params.get('tokenId');
             if (tokenId) {
                const storedUserId = localStorage.getItem('dhan_connecting_user_id');
                const storedClientId = localStorage.getItem('dhan_connecting_client_id');
                
                if (storedUserId === user.id && storedClientId) {
                   localStorage.removeItem('dhan_connecting_user_id');
                   localStorage.removeItem('dhan_connecting_client_id');
                   
                   toast.promise(
                      (async () => {
                         const { data, error } = await supabase.functions.invoke('sync-indian-trades', {
                            body: {
                               action: 'consume-consent',
                               tokenId: tokenId,
                               userId: user.id,
                               dhanClientId: storedClientId
                            }
                         });
                         if (error || !data || !data.success) {
                             let errorMessage = error?.message || 'Failed to link account';
                             if (error && (error as any).context) {
                                try {
                                   const errBody = await (error as any).context.json();
                                   errorMessage = errBody.error || errorMessage;
                                } catch (_) {
                                   try {
                                      const errText = await (error as any).context.text();
                                      if (errText) errorMessage = errText;
                                   } catch {
                                      // Ignore non-text error context
                                   }
                                }
                             }
                             throw new Error(errorMessage);
                          }
                         
                         setConnectedBroker('dhan');
                         setBrokerClientId(storedClientId);
                         setIsConnectingBroker(false);
                         
                         localStorage.setItem('dhan_auth_completed', 'true');

                         const url = new URL(window.location.href);
                         url.searchParams.delete('tokenId');
                         window.history.replaceState({}, document.title, url.pathname + url.search);
                         
                         // Try to close the tab automatically. If browser blocks it, it's okay.
                         setTimeout(() => {
                            window.close();
                         }, 1500);
                      })(),
                      {
                         loading: 'Completing secure Dhan connection...',
                         success: 'Successfully connected your Dhan account!',
                         error: (err: any) => `Connection failed: ${err.message}`
                      }
                   );
                }
             }

             // Check Stripe redirect outcome params
             const success = params.get('success');
            const plan = params.get('plan');
            const sessId = params.get('session_id') || 'generic';
            
            let currentPlan = localStorage.getItem('tradifive_selected_plan') || 'starter';
            
            if (success === 'true') {
               const processedKey = `tradifive_processed_session_${sessId}`;
               if (!localStorage.getItem(processedKey)) {
                  localStorage.setItem(processedKey, 'true');
                  if (plan && ['pro', 'elite'].includes(plan)) {
                     localStorage.setItem('tradifive_selected_plan', plan);
                     currentPlan = plan;
                     
                     const limits = { starter: 5, pro: 50, elite: 150, institutional: 1000 };
                     const newMax = limits[plan as keyof typeof limits] || 50;
                     localStorage.setItem(`tradifive_ai_credits_${user.id}`, String(newMax));
                     
                     try {
                        await supabase.from('profiles').update({
                           subscription_status: plan
                        }).eq('id', user.id);
                     } catch (err) {
                        console.error("Error updating subscription status in profiles:", err);
                     }
                     
                     toast.success(`Successfully upgraded to ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan!`, {
                        description: `Your daily AI credits limit is now ${newMax}.`
                     });
                  }
               }
               navigate('/settings?tab=ai', { replace: true });
            } else if (params.get('canceled') === 'true') {
               toast.error("Upgrade cancelled.", {
                  description: "Your payment session was closed."
               });
               navigate('/settings?tab=ai', { replace: true });
            }
            
            setSelectedPlan(currentPlan);
            
            const limits = { starter: 5, pro: 50, elite: 150, institutional: 1000 };
            const max = limits[currentPlan as keyof typeof limits] || 5;
            
            // Load profile details from database
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (data) {
               if (data.subscription_status) {
                  localStorage.setItem('tradifive_cached_plan', data.subscription_status);
                  setActivePlan(data.subscription_status);
                  setSelectedPlan(prev => ['starter', 'pro', 'elite'].includes(new URLSearchParams(window.location.search).get('plan') || '') ? prev : data.subscription_status);
               } else {
                  localStorage.setItem('tradifive_cached_plan', 'starter');
                  setActivePlan('starter');
                  setSelectedPlan(prev => ['starter', 'pro', 'elite'].includes(new URLSearchParams(window.location.search).get('plan') || '') ? prev : 'starter');
               }
               
               if (data.account_type) {
                  setPrivacySettings(prev => ({ ...prev, account_type: data.account_type }));
               }
               let savedLocalSocial: Record<string, string> = {};
               try {
                  const s = localStorage.getItem(`tradifive_social_links_${user.id}`);
                  if (s) savedLocalSocial = JSON.parse(s);
               } catch {
       // Ignore storage restrictions
     }
               setProfile({
                  firstName: data.first_name || '',
                  lastName: data.last_name || '',
                  name: data.display_name || data.first_name || '',
                  display_name: data.display_name || data.first_name || '',
                  username: data.username || '',
                  email: user.email || '',
                  phone: (data as any).phone || user.phone || '',
                  avatarUrl: data.avatar_url || '',
                  bannerUrl: data.banner_url || '',
                  bio: data.bio || '',
                  tags: data.trading_style ? data.trading_style.split(',') : [],
                  website: data.website || savedLocalSocial.website || '',
                  twitter: data.twitter_url || savedLocalSocial.twitter || '',
                  instagram: data.instagram_id || data.instagram_url || savedLocalSocial.instagram || '',
                  youtube: data.youtube_url || savedLocalSocial.youtube || '',
                  discord: data.discord_url || data.discord || savedLocalSocial.discord || '',
                  tradingview: data.tradingview_url || data.tradingview || savedLocalSocial.tradingview || '',
                  address: data.address || '',
                  city: data.city || '',
                  state: data.state || '',
                  zipCode: data.zip_code || '',
                  country: data.country || '',
                  dob: data.dob || '',
                  gender: data.gender || '',
                  countryEmoji: data.country_emoji || '🌍',
                  isPrivate: data.is_private || false,
                  hideFollowers: data.hide_followers || false,
                  hideTrades: data.hide_trades || false,
                  account_standing: data.account_standing || 'GOOD',
                  standing_message: data.standing_message || '',
                  preferred_market: data.preferred_market || 'global'
               });
               setCreatorHandle(data.username ? `@${data.username}_trades` : '');
            } else {
                // Load fallback from localStorage cache only if it belongs to current user
                const cached = localStorage.getItem('prof_cache_data');
                if (cached) {
                   const parsed = JSON.parse(cached);
                   if (parsed.id === user.id) {
                      setProfile({
                         firstName: parsed.first_name || '',
                         lastName: parsed.last_name || '',
                         name: parsed.display_name || parsed.first_name || '',
                         display_name: parsed.display_name || parsed.first_name || '',
                         username: parsed.username || '',
                         email: user.email || '',
                         avatarUrl: parsed.avatar_url || '',
                         bannerUrl: parsed.banner_url || '',
                         bio: parsed.bio || '',
                         tags: parsed.trading_style ? parsed.trading_style.split(',') : [],
                         website: parsed.website || '',
                         twitter: parsed.twitter_url || '',
                         instagram: parsed.instagram_url || '',
                         youtube: parsed.youtube_url || '',
                         address: parsed.address || '',
                         city: parsed.city || '',
                         state: parsed.state || '',
                         zipCode: parsed.zip_code || '',
                         country: parsed.country || '',
                         dob: parsed.dob || '',
                         gender: parsed.gender || '',
                         countryEmoji: parsed.country_emoji || '🌍',
                         isPrivate: parsed.is_private || false,
                         hideFollowers: parsed.hide_followers || false,
                         hideTrades: parsed.hide_trades || false
                      });
                      setCreatorHandle(parsed.username ? `@${parsed.username}_trades` : '');
                   } else {
                      // Initial empty state fallback for new profiles
                      setProfile(prev => ({
                         ...prev,
                         email: user.email || ''
                      }));
                   }
                } else {
                   setProfile(prev => ({
                      ...prev,
                      email: user.email || ''
                   }));
                }
             }

            // Fetch billing history
            try {
               const { data: billingData, error: billingError } = await supabase
                  .from('billing_history')
                  .select('*')
                  .eq('user_id', user.id)
                  .order('created_at', { ascending: false });
                  
               if (billingData && !billingError) {
                  setBillingHistory(billingData);
               } else {
                  setBillingHistory([]);
               }
            } catch (err) {
               console.error("Error fetching billing history:", err);
               setBillingHistory([]);
            } finally {
               setLoadingBilling(false);
            }

            // Fetch broker & MT5 connections
            try {
               const { data: brokerData } = await supabase
                  .from('broker_connections')
                  .select('*')
                  .eq('user_id', user.id);
               if (brokerData && brokerData.length > 0) {
                  setConnectedBroker(brokerData[0].broker_name);
                  setBrokerClientId(brokerData[0].client_id || '');
                  setBrokerApiKey(brokerData[0].api_key ? '••••••••••••••••' : '');
               } else {
                  const { data: mt5Row } = await supabase
                     .from('mt5_accounts')
                     .select('account_number, broker_server, broker, is_connected')
                     .eq('user_id', user.id)
                     .eq('is_connected', true)
                     .maybeSingle();
                  if (mt5Row?.account_number) {
                     setConnectedBroker('mt5');
                     setBrokerClientId(mt5Row.account_number);
                     setMt5ConnectedServer(mt5Row.broker_server || '');
                  }
               }
            } catch (err) {
               console.error("Error fetching broker connections:", err);
            }
         }
      };
      fetchUserData().finally(() => setIsInitialLoading(false));
   }, []);

   const handleToggle = (category: string, id: string, type: 'app' | 'push' | 'email') => {
      if (globalOff) {
         setGlobalOff(false);
         try { localStorage.setItem('tradifive_notif_global_off', 'false'); } catch { /* ignore */ }
      }
      if (type !== 'email' && globalEmailOnly) {
         setGlobalEmailOnly(false);
         try { localStorage.setItem('tradifive_notif_email_only', 'false'); } catch { /* ignore */ }
      }
      setNotifications(prev => {
         const next = {
            ...prev,
            [category]: (prev as any)[category].map((n: any) => 
               n.id === id ? { ...n, [type]: !n[type] } : n
            )
         };
         try {
            localStorage.setItem('tradifive_user_notifications', JSON.stringify(next));
         } catch {
            // Ignore malformed saved notifications
         }
         return next;
      });
      triggerHaptic('selection');
      toast.success('Notification preferences updated');
   };

   const handleGlobalOff = () => {
      const newState = !globalOff;
      setGlobalOff(newState);
      if (newState) setGlobalEmailOnly(false);
      try {
         localStorage.setItem('tradifive_notif_global_off', String(newState));
         if (newState) localStorage.setItem('tradifive_notif_email_only', 'false');
      } catch {
         // Ignore malformed saved notifications
      }
      
      const newNotifs = { ...notifications };
      Object.keys(newNotifs).forEach(key => {
         (newNotifs as any)[key] = (newNotifs as any)[key].map((n: any) => ({
            ...n, app: !newState, push: !newState, email: !newState
         }));
      });
      setNotifications(newNotifs);
      try {
         localStorage.setItem('tradifive_user_notifications', JSON.stringify(newNotifs));
      } catch {
         // Ignore malformed saved notifications
      }
      toast(newState ? 'All alerts paused (DND active)' : 'Notifications restored');
   };

   const handleEmailOnly = () => {
      const newState = !globalEmailOnly;
      setGlobalEmailOnly(newState);
      if (newState) setGlobalOff(false);
      try {
         localStorage.setItem('tradifive_notif_email_only', String(newState));
         if (newState) localStorage.setItem('tradifive_notif_global_off', 'false');
      } catch {
         // Ignore malformed saved notifications
      }
      
      const newNotifs = { ...notifications };
      Object.keys(newNotifs).forEach(key => {
         (newNotifs as any)[key] = (newNotifs as any)[key].map((n: any) => ({
            ...n, app: !newState, push: !newState, email: true
         }));
      });
      setNotifications(newNotifs);
      try {
         localStorage.setItem('tradifive_user_notifications', JSON.stringify(newNotifs));
      } catch {
         // Ignore malformed saved notifications
      }
      toast(newState ? 'Email-only mode enabled' : 'Multi-channel notifications active');
   };

   const handleResetNotificationDefaults = () => {
      setGlobalOff(false);
      setGlobalEmailOnly(false);
      setSoundAlertsEnabled(true);
      setNotifications(DEFAULT_NOTIFICATIONS);
      try {
         localStorage.removeItem('tradifive_user_notifications');
         localStorage.setItem('tradifive_notif_global_off', 'false');
         localStorage.setItem('tradifive_notif_email_only', 'false');
         localStorage.setItem('tradifive_notif_sound', 'true');
      } catch {
         // Ignore malformed saved notifications
      }
      toast.success('Notification settings reset to defaults');
   };

   const handleToggleSound = () => {
      const next = !soundAlertsEnabled;
      setSoundAlertsEnabled(next);
      try {
         localStorage.setItem('tradifive_notif_sound', String(next));
      } catch {
         // Ignore malformed saved notifications
      }
      toast(next ? 'Sound chimes enabled' : 'Sound chimes muted');
   };

   const emailStatementsEnabled = !globalOff && Boolean(notifications?.ai_coach?.find((n: any) => n.id === 'weekly_report')?.email);
   const handleToggleEmailStatements = () => {
      const nextVal = !emailStatementsEnabled;
      if (nextVal && globalOff) {
         setGlobalOff(false);
         try { localStorage.setItem('tradifive_notif_global_off', 'false'); } catch { /* ignore */ }
      }
      setNotifications((prev: any) => {
         const next = {
            ...prev,
            ai_coach: (prev.ai_coach || []).map((n: any) =>
               n.id === 'weekly_report' ? { ...n, email: nextVal } : n
            ),
         };
         try { localStorage.setItem('tradifive_user_notifications', JSON.stringify(next)); } catch { /* ignore */ }
         return next;
      });
      triggerHaptic('selection');
      toast.success(nextVal ? 'Email audit statements enabled' : 'Email audit statements muted');
   };

   const handleUpdateProfile = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      
      const requestedUsername = profile.username || profile.name || null;
      if (requestedUsername) {
         const validation = validateUsername(requestedUsername);
         if (!validation.isValid) {
            toast.error(validation.message);
            return;
         }
      }

      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;
         setLoading(true);
         
         const updatePayload = {
            first_name: profile.firstName,
            last_name: profile.lastName,
            display_name: profile.display_name !== undefined ? profile.display_name : (profile.name || `${profile.firstName} ${profile.lastName}`.trim()),
            username: profile.username || profile.name || null,
            has_chosen_username: !!(profile.username || profile.name),
            bio: profile.bio,
            trading_style: profile.tags?.length ? profile.tags.join(',') : null,
            website: profile.website,
            instagram_id: profile.instagram,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zip_code: profile.zipCode,
            country: profile.country,
            date_of_birth: profile.dob || null,
            gender: profile.gender,
            avatar_url: profile.avatarUrl,
            banner_url: profile.bannerUrl
         };
         
         const { error } = await supabase.from('profiles').update(updatePayload).eq('id', user.id);
         
         if (error) throw error;
         
         // Save privacy settings locally
         const updatedPrivacySettings = { ...privacySettings, is_private: privacySettings.is_private };
         localStorage.setItem(`tradifive_privacy_${user.id}`, JSON.stringify(updatedPrivacySettings));
         const effectiveUsername = profile.username || profile.name || user.id;
         localStorage.setItem(`tradifive_privacy_user_${effectiveUsername.toLowerCase()}`, JSON.stringify(updatedPrivacySettings));
         localStorage.setItem("tradifive_cached_account_type", privacySettings.account_type || 'personal');
         window.dispatchEvent(new Event("storage"));
         
         // Save social links locally so Profile & Public Profile display them immediately
         const socialLinksPayload = {
            website: profile.website || '',
            instagram: profile.instagram || '',
            youtube: profile.youtube || '',
            discord: (profile as any).discord || '',
            tradingview: (profile as any).tradingview || '',
            twitter: profile.twitter || '',
         };
         localStorage.setItem(`tradifive_social_links_${user.id}`, JSON.stringify(socialLinksPayload));
         localStorage.setItem(`tradifive_social_links_user_${effectiveUsername.toLowerCase()}`, JSON.stringify(socialLinksPayload));

         const updatedCache = {
            id: user.id,
            first_name: profile.firstName,
            last_name: profile.lastName,
            display_name: profile.display_name !== undefined ? profile.display_name : (profile.name || `${profile.firstName} ${profile.lastName}`.trim()),
            username: effectiveUsername,
            avatar_url: profile.avatarUrl,
            banner_url: profile.bannerUrl,
            bio: profile.bio,
            website: profile.website || '',
            instagram_id: profile.instagram || '',
            youtube_url: profile.youtube || '',
            discord: (profile as any).discord || '',
            tradingview: (profile as any).tradingview || '',
            twitter_url: profile.twitter || '',
            location: profile.city,
            country: profile.country,
            country_emoji: profile.countryEmoji
         };
         
         localStorage.setItem('prof_cache_data', JSON.stringify(updatedCache));
         localStorage.setItem(`tradifive_mock_profile_${effectiveUsername.toLowerCase()}`, JSON.stringify(updatedCache));
         
         // Update tradifive cache keys for sidebar
         localStorage.setItem("tradifive_cached_display_name", profile.display_name !== undefined ? profile.display_name : (profile.name || `${profile.firstName} ${profile.lastName}`.trim()));
         localStorage.setItem("tradifive_cached_username", effectiveUsername);
         localStorage.setItem("tradifive_cached_avatar_url", profile.avatarUrl);
         if (profile.bannerUrl) {
            localStorage.setItem("tradifive_cached_banner_url", profile.bannerUrl);
         } else {
            localStorage.removeItem("tradifive_cached_banner_url");
         }
         
         // Dispatch update event
         window.dispatchEvent(new Event("tradifive_profile_update"));
         
         toast.success('Preferences saved successfully');
      } catch (e: any) {
         console.error("Profile update error FULL:", e);
         toast.error(`Error: ${e?.message || JSON.stringify(e)}`);
      } finally {
         setLoading(false);
      }
   };

   const handleFullScreenChange = (checked: boolean) => {
      setFullScreenLayout(checked);
      localStorage.setItem('fialgo_full_screen', String(checked));
      window.dispatchEvent(new Event('fialgo_full_screen_changed'));
   };

   const handleThemeChange = (newTheme: string) => {
      setTheme(newTheme);
      applyThemeWithTransition(newTheme as 'light' | 'dark', () => {
         // Theme transition completed
      });
   };

   const handleForceSync = async () => {
      setIsSyncing(true);
      try {
         const isGlobal = ['mt5', 'mt4', 'icmarkets', 'vantage', 'exness', 'xm'].includes(connectedBroker);
         
         if (isGlobal) {
            const { error } = await supabase.functions.invoke('sync-metaapi-trades');
            if (error) throw error;
            toast.success('Synchronized global trading activity!');
         } else {
            const { error } = await supabase.functions.invoke('sync-indian-trades');
            if (error) throw error;
            toast.success(`Synchronized trading activity from ${connectedBroker.toUpperCase()}!`);
         }
         setLastSyncedTime('Just now');
      } catch (err: any) {
         console.error("Sync error:", err);
         toast.error(`Sync failed: ${err.message || 'Please check your credentials.'}`);
      } finally {
         setIsSyncing(false);
      }
   };

   const handleConnectBrokerSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const isGlobal = activeMarket !== 'indian' || ['mt5', 'mt4', 'icmarkets', 'vantage', 'exness', 'xm'].includes(selectedBrokerToConnect);
      
      if (isGlobal) {
         if (isBrokerLocked) {
            toast.info('Pro & Elite Feature · Live MT5 Sync', {
               description: 'Upgrade to Pro or Elite to connect a live MetaTrader 5 broker account.',
               action: {
                  label: 'Upgrade',
                  onClick: () => navigate('/upgrade'),
               },
            });
            return;
         }
         const cleanAccount = mt5SettingsForm.login.trim();
         const cleanPassword = mt5SettingsForm.password.trim();
         const cleanServer = mt5SettingsForm.server.trim();
         if (!cleanAccount || !cleanPassword || !cleanServer) {
            toast.error('Please enter MT5 Server Name, Account Number, and Password.');
            return;
         }

         setIsConnectingMt5Settings(true);
         const toastId = toast.loading('Connecting MT5 account...', {
            description: `Authenticating with ${cleanServer}...`,
         });

         try {
            const { data: { user } } = await supabase.auth.getUser();
            let deployed = false;
            let deployData: any = null;
            let errMsg = '';

            try {
               const res = await fetch('/api/deploy-metaapi', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                     accountNumber: cleanAccount,
                     masterPassword: cleanPassword,
                     brokerServer: cleanServer,
                     purpose: 'risk_journal',
                     userId: user?.id,
                  }),
               });
               if (res.ok) {
                  deployData = await res.json();
                  deployed = true;
               } else if (res.status !== 404) {
                  const errBody = await res.json().catch(() => ({}));
                  errMsg = errBody.error || errBody.message || 'Unable to verify MT5 credentials.';
               }
            } catch {
               // Fallback to Supabase Edge Function below
            }

            if (!deployed && !errMsg) {
               const { data, error } = await supabase.functions.invoke('deploy-metaapi-account', {
                  body: {
                     accountNumber: cleanAccount,
                     masterPassword: cleanPassword,
                     brokerServer: cleanServer,
                     purpose: 'risk_journal',
                     userId: user?.id,
                  },
               });
               if (error) {
                  errMsg = error.message || 'Unable to connect to MT5 bridge. Please verify your server, account number, and password.';
               } else {
                  deployed = true;
                  deployData = data;
               }
            }

            toast.dismiss(toastId);

            if (!deployed && errMsg) {
               toast.error('MT5 Connection Failed', { description: errMsg });
               return;
            }

            if (user) {
               await supabase.from('mt5_accounts').upsert({
                  user_id: user.id,
                  account_number: cleanAccount,
                  broker_server: cleanServer,
                  server: cleanServer,
                  broker: cleanServer.split('-')[0] || 'MT5',
                  connection_status: 'deployed',
                  is_connected: true,
                  metaapi_account_id: deployData?.accountId || deployData?.id || `mt5-${cleanAccount}`,
                  updated_at: new Date().toISOString(),
               }, { onConflict: 'user_id, account_number' }).then(() => undefined, () => undefined);
            }

            setConnectedBroker('mt5');
            setBrokerClientId(cleanAccount);
            setMt5ConnectedServer(cleanServer);
            setMt5SettingsForm({ server: '', login: '', password: '' });
            setIsConnectingBroker(false);
            setSelectedBrokerToConnect('');
            toast.success('MT5 account connected!');
         } catch (err: any) {
            toast.dismiss(toastId);
            toast.error('MT5 Connection Failed', { description: err?.message || 'Unexpected error connecting account.' });
         } finally {
            setIsConnectingMt5Settings(false);
         }
         return;
      }

      if (selectedBrokerToConnect === 'dhan') {
         try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
               toast.error('You must be logged in to connect a broker');
               return;
            }
            
            // 1. Call generate-consent on Edge Function
            const { data, error } = await supabase.functions.invoke('sync-indian-trades', {
               body: {
                  action: 'generate-consent',
                  dhanClientId: brokerClientId
               }
            });
            
            if (error || !data || !data.consentAppId) {
                const errorMessage = error?.message || 'Failed to generate consent app ID';
                throw new Error(errorMessage);
             }
            
            localStorage.setItem('dhan_connecting_client_id', brokerClientId);
            localStorage.setItem('dhan_connecting_user_id', user.id);
            
            toast.loading('Redirecting to Dhan secure login...', { duration: 3000 });
            setTimeout(() => {
               window.open(`https://auth.dhan.co/login/consentApp-login?consentAppId=${data.consentAppId}`, '_blank');
            }, 1500);
         } catch (err: any) {
            console.error("Error generating Dhan consent:", err);
            toast.error(`Failed to initiate login: ${err.message}`);
         }
         return;
      }
      
      // For Zerodha and Upstox, we insert into the database so that useDashboardData auto-syncs.
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) {
            toast.error('You must be logged in to connect a broker');
            return;
         }

         if (selectedBrokerToConnect === 'zerodha' && !brokerApiKey) {
             toast.error('API Key is required for Zerodha');
             return;
         }
         
         if (selectedBrokerToConnect === 'upstox' && !brokerClientId) {
             toast.error('Client ID is required for Upstox');
             return;
         }

         toast.loading(`Connecting to ${selectedBrokerToConnect.toUpperCase()}...`, { id: 'broker-connect' });

         const { error } = await supabase
            .from('broker_connections')
            .upsert({
               user_id: user.id,
               broker_name: selectedBrokerToConnect,
               client_id: brokerClientId || 'connected',
               api_key: brokerApiKey || 'connected',
               connection_status: 'active',
               updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, broker_name' });

         if (error) throw error;
         
         toast.success(`Successfully linked ${selectedBrokerToConnect.toUpperCase()}! Your data will now sync.`, { id: 'broker-connect' });
         setConnectedBroker(selectedBrokerToConnect);
         setIsConnectingBroker(false);
         setSelectedBrokerToConnect('');

      } catch (err: any) {
         console.error("Error saving broker:", err);
         toast.error(`Failed to connect: ${err.message}`, { id: 'broker-connect' });
      }
   };

   const handleDisconnectBroker = async () => {
       const isGlobal = ['mt5', 'mt4', 'icmarkets', 'vantage', 'exness', 'xm'].includes(connectedBroker);
       
       if (isGlobal) {
          try {
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
                await supabase
                   .from('mt5_accounts')
                   .update({ is_connected: false, updated_at: new Date().toISOString() })
                   .eq('user_id', user.id)
                   .eq('is_connected', true);
             }
          } catch (err) {
             console.error("Error disconnecting MT5:", err);
          }
          setConnectedBroker('');
          setBrokerClientId('');
          setMt5ConnectedServer('');
          toast.success('Disconnected MT5 account');
          return;
       }
       
       try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;
          
          const { error } = await supabase
             .from('broker_connections')
             .delete()
             .eq('user_id', user.id)
             .eq('broker_name', connectedBroker);
             
          if (error) throw error;
          
          setConnectedBroker('');
          setBrokerClientId('');
          setBrokerApiKey('');
          toast.success('Successfully disconnected broker account');
       } catch (err: any) {
          console.error("Error disconnecting broker:", err);
          toast.error(`Failed to disconnect: ${err.message}`);
       }
    };

   const handleReportSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!reportSubject || !reportDescription) {
         toast.error('Please fill out all problem report fields');
         return;
      }
   toast.success('Problem report logged. Our support team will investigate.');
      setReportSubject('');
      setReportDescription('');
   };

   // Define structural settings categories for left sidebar (grouped like ACCOUNT / TRADING / APP)
   const sidebarSections = [
      {
         title: "Account",
         items: [
            { id: "profile", label: "Profile", icon: User },
            { 
               id: "account", 
               label: "Account & Security", 
               icon: ShieldDone,
               children: [
                  { id: "account-info", label: "Account Info" },
                  { id: "password-security", label: "Password & Security" },
                  { id: "active-sessions", label: "Active Sessions" },
                  { id: "account-standing", label: "Account Standing" },
                  { id: "family-center", label: "Family Center" },
                  { id: "data-export", label: "Export & Privacy" },
                  { id: "danger-zone", label: "Danger Zone" }
               ]
            },
            { id: "notifications", label: "Notifications", icon: Notification }
         ]
      },
      {
         title: "Trading",
         items: [
            { id: "trading", label: "Accounts & Brokers", icon: Wallet },
            { id: "ai", label: "AI Coach", icon: Sparkles }
         ]
      },
      {
         title: "App",
         items: [
            { id: "appearance", label: "Preferences", icon: Category },
            { id: "subscription", label: "Subscription", icon: TicketStar },
            { id: "channel", label: "Channel Settings", icon: Chat },
            { id: "creator", label: "Creator Account", icon: Star },
            { id: "help", label: "Help Center", icon: InfoCircle },
            { id: "report", label: "Report a Problem", icon: Danger },
            { id: "logout", label: "Log Out", icon: Logout }
         ]
      }
   ];

   // Filter the sidebar list using query search AND plan requirement
   const filteredSections = sidebarSections.map(section => {
      const items = section.items.filter(item => {
         // Hide Creator Account tab if not on Elite plan
         if (item.id === 'creator' && activePlan !== 'elite') return false;
         
         return item.label.toLowerCase().includes(searchQuery.toLowerCase());
      });
      return { ...section, items };
   }).filter(section => section.items.length > 0);

   const displayName = `${profile.firstName} ${profile.lastName}`.trim() || profile.name || "username";

   const tabTitles = TAB_TITLES;

   const resizeImageFile = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.95): Promise<string> => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
               const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
               const width = Math.max(1, Math.round(img.width * scale));
               const height = Math.max(1, Math.round(img.height * scale));

               // If image already fits within HD bounds and is reasonably sized, keep original quality
               if (scale === 1 && file.size <= 2 * 1024 * 1024 && typeof e.target?.result === 'string') {
                  resolve(e.target.result);
                  return;
               }

               const canvas = document.createElement('canvas');
               canvas.width = width;
               canvas.height = height;
               const ctx = canvas.getContext('2d');
               if (ctx) {
                  ctx.imageSmoothingEnabled = true;
                  ctx.imageSmoothingQuality = 'high';
                  ctx.drawImage(img, 0, 0, width, height);
                  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
                  resolve(canvas.toDataURL(mime, quality));
               } else {
                  resolve(e.target?.result as string);
               }
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
         };
         reader.onerror = reject;
         reader.readAsDataURL(file);
      });
   };

   return (
      <DashboardLayout 
         breadcrumbs={[{ label: "Home", path: "/home" }, { label: "Settings", path: "/settings" }]}
         noScroll={true}
         hideBottomNav={mobileShowDetails}
      >
      <motion.div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[3px] p-0 sm:p-6 md:p-8 select-none font-sans"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ duration: 0.16, ease: "easeOut" }}
      >
         
         {/* Click outside backdrop container back to dashboard page (desktop/tablet only) */}
         <div className="absolute inset-0 hidden sm:block" onClick={handleCloseSettings} />

         {/* Centered Settings Dialog Modal Box */}
         <div className="relative w-full h-full sm:h-[88vh] sm:max-h-[860px] max-w-[1160px] rounded-none sm:rounded-[24px] bg-white dark:bg-[#141417] text-slate-800 dark:text-[#dbdee1] flex flex-col overflow-hidden shadow-[0_24px_80px_rgba(15,23,42,0.22)] border-0 sm:border sm:border-slate-200/70 dark:sm:border-white/[0.08] z-10 pb-16 md:pb-0">
            
            {/* ── DESKTOP TOP BANNER HERO (md+ web user app) ── */}
            <div className="hidden md:block relative shrink-0 select-none">
               <div className="relative h-[116px] w-full overflow-hidden bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#6D28D9] dark:from-[#1E3A8A] dark:via-[#312E81] dark:to-[#4C1D95]">
                  {profile.bannerUrl ? (
                     <img
                        src={profile.bannerUrl}
                        alt="Profile banner"
                        className="w-full h-full object-cover object-center"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                     />
                  ) : (
                     <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(255,255,255,0.24),transparent_55%),radial-gradient(circle_at_82%_70%,rgba(167,139,250,0.32),transparent_50%)]"
                     />
                  )}
                  {/* Crisp bottom-edge blend without washing out upper banner detail */}
                  <div
                     aria-hidden="true"
                     className="absolute inset-x-0 bottom-0 h-9 pointer-events-none dark:hidden"
                     style={{ background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 42%, rgba(255,255,255,0) 100%)" }}
                  />
                  <div
                     aria-hidden="true"
                     className="absolute inset-x-0 bottom-0 h-9 pointer-events-none hidden dark:block"
                     style={{ background: "linear-gradient(to top, rgba(20,20,23,1) 0%, rgba(20,20,23,0.65) 42%, rgba(20,20,23,0) 100%)" }}
                  />

                  {/* Top-Right Translucent Close Circle */}
                  <button
                     type="button"
                     onClick={handleCloseSettings}
                     className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                     title="Close Settings"
                     aria-label="Close Settings"
                  >
                     <X size={15} strokeWidth={2.2} />
                  </button>
               </div>

               {/* Overlapping Avatar + Identity Row */}
               <div className="relative z-10 -mt-12 px-7 pb-3 flex items-end gap-3.5">
                  <button
                     type="button"
                     onClick={() => setActiveTab('profile')}
                     className="w-[74px] h-[74px] rounded-full ring-4 ring-white dark:ring-[#141417] shadow-md overflow-hidden bg-slate-100 dark:bg-neutral-800 shrink-0 cursor-pointer active:scale-95 transition-transform"
                     aria-label="View profile settings"
                  >
                     <img
                        src={profile.avatarUrl || defaultAvatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                     />
                  </button>
                  <div className="min-w-0 pb-1">
                     <h2 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                        {displayName}
                     </h2>
                     <p className="text-[12.5px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
                        @{profile.username || "trader"} · {['elite', 'institutional'].includes(String(activePlan || '').toLowerCase()) ? 'Elite' : ['pro', 'advanced'].includes(String(activePlan || '').toLowerCase()) ? 'Pro' : 'Standard'}
                     </p>
                  </div>
               </div>
            </div>

            {/* ── MAIN MODAL BODY (Mobile list/detail OR Desktop 2-column sidebar + content) ── */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
            
             {/* ── MOBILE SETTINGS NAVIGATION (Matching Reference Picture 2) ── */}
             <div className={`${mobileShowDetails ? 'hidden' : 'flex md:hidden'} w-full bg-[#F4F5F7] dark:bg-[#121215] flex-col h-full min-h-0 overflow-y-auto amazing-scrollbar select-none`}>
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#1A1A1E] shrink-0 sticky top-0 z-20">
                   <h1 className="text-[17px] font-bold text-slate-900 dark:text-white">Settings</h1>
                   <button 
                      onClick={handleCloseSettings} 
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white active:scale-90 transition-transform cursor-pointer"
                      aria-label="Close settings"
                   >
                      <X size={15} />
                   </button>
                </div>

                <div className="p-4 space-y-4 pb-28">
                   {/* 1. Hero Profile Card with cover banner, overlapping avatar, Name, Username and Edit button */}
                   <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl overflow-hidden border border-black/[0.05] dark:border-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] relative">
                      {/* Banner Image with clean gradient fallback */}
                      <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#6D28D9] dark:from-[#1E3A8A] dark:via-[#312E81] dark:to-[#4C1D95]">
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
                               className="absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(255,255,255,0.24),transparent_55%),radial-gradient(circle_at_82%_70%,rgba(167,139,250,0.32),transparent_50%)]"
                            />
                         )}
                         <div
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-10 pointer-events-none dark:hidden"
                            style={{ background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0.65) 42%, rgba(255,255,255,0) 100%)" }}
                         />
                         <div
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-10 pointer-events-none hidden dark:block"
                            style={{ background: "linear-gradient(to top, rgba(26,26,30,1) 0%, rgba(26,26,30,0.65) 42%, rgba(26,26,30,0) 100%)" }}
                         />
                      </div>

                      {/* Overlapping Avatar */}
                      <div className="relative -mt-9 ml-4 flex items-end justify-between pr-4">
                         <div className="w-16 h-16 rounded-full border-2 border-white dark:border-[#1A1A1E] shadow-md overflow-hidden bg-white dark:bg-neutral-800 shrink-0">
                            <img
                               src={profile.avatarUrl || defaultAvatar}
                               alt={displayName}
                               className="w-full h-full object-cover"
                               onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                            />
                         </div>
                      </div>

                      {/* Name, Username & Edit button row */}
                      <div className="px-4 pt-2.5 pb-4 flex items-center justify-between">
                         <div className="min-w-0 pr-3">
                            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white truncate leading-tight">
                               {displayName}
                            </h2>
                            <p className="text-[12px] text-slate-400 dark:text-neutral-500 font-normal mt-0.5 truncate">
                               @{profile.username || "nikhilharake"}
                            </p>
                         </div>
                         <TactileBoxButton
                            onClick={() => {
                               triggerHaptic("selection");
                               setActiveTab("profile");
                               setMobileShowDetails(true);
                            }}
                            className="h-9 px-4 shrink-0"
                            title="Edit profile"
                         >
                            <Pencil size={13.5} strokeWidth={2.4} className="text-slate-900 dark:text-white shrink-0" />
                            <span className="text-[13.5px] font-bold text-slate-900 dark:text-white leading-none tracking-tight">Edit</span>
                         </TactileBoxButton>
                      </div>
                   </div>

                   {/* 2. Search Settings Box */}
                   <div className="flex items-center gap-2 bg-[#F3F4F6] dark:bg-[#1E1E22] rounded-xl px-3.5 py-2.5 border border-slate-200/90 dark:border-white/[0.08] focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-[#232329] transition-colors">
                      <span className="text-slate-400 dark:text-neutral-500 shrink-0 flex items-center">
                         <Search set="curved" stroke="bold" primaryColor="currentColor" size={15} />
                      </span>
                      <input
                         type="text"
                         placeholder="Search settings"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full min-w-0 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none"
                      />
                      {searchQuery && (
                         <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer"
                         >
                            Clear
                         </button>
                      )}
                   </div>

                   {/* 3. Grouped Settings Lists (Matching Reference Picture 2) */}
                   <div className="space-y-4 pt-1">
                      {/* Section: ACCOUNT */}
                      {(!searchQuery || "account profile activity trophies security notifications delete history privacy".includes(searchQuery.toLowerCase())) && (
                         <div>
                            <h3 className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
                               ACCOUNT
                            </h3>
                            <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl border border-black/[0.05] dark:border-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                               {(!searchQuery || "profile".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('profile'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <User set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Profile</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               {(!searchQuery || "activity".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('account'); setActiveSubTab('active-sessions'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <Activity set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Activity</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               {(!searchQuery || "trophies badges standing".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('account'); setActiveSubTab('account-standing'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <Star set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Trophies & Standing</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               {(!searchQuery || "security password green check".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('account'); setActiveSubTab('password-security'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <ShieldDone set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Security & Password</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               {(!searchQuery || "notifications alerts".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('notifications'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <Notification set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Notifications</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               {(!searchQuery || "delete history privacy data".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('account'); setActiveSubTab('data-export'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <Document set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Data & Privacy</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}
                            </div>
                         </div>
                      )}

                      {/* Section: TRADING */}
                      {(!searchQuery || "trading accounts brokers".includes(searchQuery.toLowerCase())) && (
                         <div>
                            <h3 className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
                               TRADING
                            </h3>
                            <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl border border-black/[0.05] dark:border-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                               {(!searchQuery || "accounts brokers".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('trading'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <Wallet set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Accounts & Brokers</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}
                            </div>
                         </div>
                      )}

                      {/* Section: PREFERENCES & SUPPORT */}
                      {(!searchQuery || "subscription theme appearance help report logout".includes(searchQuery.toLowerCase())) && (
                         <div>
                            <h3 className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-2 px-1">
                               PREFERENCES & SUPPORT
                            </h3>
                            <div className="bg-white dark:bg-[#1A1A1E] rounded-2xl border border-black/[0.05] dark:border-white/5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03)] divide-y divide-slate-100 dark:divide-white/5 overflow-hidden">
                               {(!searchQuery || "subscription plan billing".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('subscription'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <TicketStar set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Subscription & Plan</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               {(!searchQuery || "theme appearance display".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('appearance'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <Category set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Theme & Display</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               {(!searchQuery || "help center desk support".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('help'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <InfoCircle set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Help Center</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               {(!searchQuery || "report problem issue".includes(searchQuery.toLowerCase())) && (
                                  <button
                                     type="button"
                                     onClick={() => { setActiveTab('report'); setMobileShowDetails(true); }}
                                     className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] active:bg-slate-100/70 transition-colors cursor-pointer text-left"
                                  >
                                     <div className="flex items-center gap-3">
                                        <div className="text-slate-700 dark:text-neutral-300">
                                           <Danger set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                        </div>
                                        <span className="text-[13.5px] font-semibold text-slate-800 dark:text-white">Report a Problem</span>
                                     </div>
                                     <ChevronRight set="curved" primaryColor="currentColor" size={14} className="text-slate-400 dark:text-neutral-500" />
                                  </button>
                               )}

                               <button
                                  type="button"
                                  onClick={() => setShowLogoutConfirm(true)}
                                  className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/50 dark:hover:bg-rose-500/10 active:bg-rose-100/50 transition-colors cursor-pointer text-left"
                               >
                                  <div className="flex items-center gap-3">
                                     <div className="text-rose-500">
                                        <Logout set="curved" stroke="bold" primaryColor="currentColor" size={17} />
                                     </div>
                                     <span className="text-[13.5px] font-semibold text-rose-500">Log Out</span>
                                  </div>
                               </button>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>

             {/* ── DESKTOP SIDEBAR PANEL (Clean White Rail with Elevated Active Pill) ── */}
             <div className="hidden md:flex w-[256px] bg-white dark:bg-[#141417] flex-col h-full min-h-0 shrink-0">

               <div className="pt-1 pb-5 px-5 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                  {/* Search Settings Pill */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[11px] bg-[#F4F5F8] dark:bg-white/[0.06] border border-slate-200/90 dark:border-white/[0.1] focus-within:border-[#2563EB] focus-within:bg-white dark:focus-within:bg-[#1C1C21] shadow-2xs transition-all">
                     <span className="text-slate-400 dark:text-neutral-500 shrink-0 flex items-center">
                        <Search stroke="bold" set="curved" primaryColor="currentColor" size={14} />
                     </span>
                     <input
                        type="text"
                        placeholder="Search settings"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full min-w-0 bg-transparent text-[12.5px] placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-slate-100 outline-none"
                     />
                     {searchQuery && (
                        <button
                           type="button"
                           onClick={() => setSearchQuery('')}
                           className="text-[10.5px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0 cursor-pointer"
                        >
                           Clear
                        </button>
                     )}
                  </div>

                  {/* Grouped Sections (ACCOUNT / TRADING / APP) */}
                  <div className="space-y-5">
                     {filteredSections.map((section, idx) => (
                        <div key={idx}>
                           <h3 className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-[0.08em] mb-1.5 px-2.5">
                              {section.title}
                           </h3>
                           <div className="space-y-1">
                              {section.items.map((item: any) => {
                                 const isActive = activeTab === item.id;
                                 const isLogout = item.id === 'logout';
                                 return (
                                    <div key={item.id} className="flex flex-col">
                                       <button
                                          type="button"
                                          onClick={async () => {
                                             if (isLogout) {
                                                setShowLogoutConfirm(true);
                                             } else {
                                                setActiveTab(item.id);
                                                setMobileShowDetails(true);
                                                if (item.children) setActiveSubTab(item.children[0].id);
                                             }
                                          }}
                                          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-[12px] text-[13.5px] transition-all duration-150 text-left cursor-pointer ${
                                             isLogout
                                                ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                                                : isActive
                                                ? 'bg-white dark:bg-[#1E1E24] text-slate-900 dark:text-white font-semibold shadow-[0_2px_10px_rgba(15,23,42,0.07),0_0_0_1px_rgba(15,23,42,0.06)] dark:shadow-none dark:border dark:border-white/10'
                                                : 'text-slate-600 dark:text-neutral-400 hover:bg-slate-100/75 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white font-medium'
                                          }`}
                                       >
                                          <span
                                             className={`w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0 transition-colors ${
                                                isLogout
                                                   ? 'text-rose-500'
                                                   : isActive
                                                   ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                                                   : 'text-slate-500 dark:text-neutral-400'
                                             }`}
                                          >
                                             {item.icon === Sparkles || item.icon === Sliders ? (
                                                <item.icon size={15} strokeWidth={2.1} />
                                             ) : (
                                                <item.icon
                                                   stroke="bold"
                                                   set="curved"
                                                   size={16}
                                                   primaryColor="currentColor"
                                                />
                                             )}
                                          </span>
                                          <span className="truncate">{item.label}</span>
                                       </button>

                                       {item.children && isActive && (
                                          <div className="mt-1.5 ml-5 pl-3.5 border-l border-slate-200 dark:border-white/10 flex flex-col gap-1 relative py-0.5">
                                             {item.children.map((child: any) => (
                                                <button
                                                   key={child.id}
                                                   type="button"
                                                   onClick={() => {
                                                      setActiveSubTab(child.id);
                                                      setMobileShowDetails(true);
                                                      const el = document.getElementById(child.id);
                                                      const container = document.getElementById('settings-scroll-container');
                                                      if (el && container) {
                                                         container.scrollTo({ top: el.offsetTop - 90, behavior: 'smooth' });
                                                      }
                                                   }}
                                                   className={`relative text-left text-[12.5px] font-medium transition-colors py-1 cursor-pointer ${
                                                      activeSubTab === child.id
                                                         ? 'text-slate-900 dark:text-white font-semibold'
                                                         : 'text-slate-400 dark:text-neutral-500 hover:text-slate-700 dark:hover:text-neutral-200'
                                                   }`}
                                                >
                                                   {activeSubTab === child.id && (
                                                      <div className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-slate-900 dark:bg-white rounded-r-full" />
                                                   )}
                                                   {child.label}
                                                </button>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     ))}
                  </div>

                  {/* Subtle Footer Links */}
                  <div className="mt-auto pt-4 px-2 select-none border-t border-slate-100 dark:border-white/[0.06]">
                     <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">v2.0.0</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                           Connected
                        </span>
                     </div>
                     <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-medium text-slate-400">
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 dark:hover:text-neutral-200 transition-colors">Privacy Policy</a>
                        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 dark:hover:text-neutral-200 transition-colors">Terms</a>
                        <a href="/risk-disclosure" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 dark:hover:text-neutral-200 transition-colors">Risk Disclosure</a>
                        <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700 dark:hover:text-neutral-200 transition-colors">Refund Policy</a>
                     </div>
                  </div>
               </div>
             </div>

            {/* RIGHT CONTENT PANEL inside Modal */}
            <div className={`${mobileShowDetails ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 bg-[#F4F5F7] dark:bg-[#121215] md:bg-white md:dark:bg-[#141417] h-full min-h-0 overflow-hidden relative flex flex-col`}>
               
               {/* Mobile-only Sticky Back Header (Desktop uses Hero close + clean section title) */}
               <div className="flex md:hidden bg-white dark:bg-[#1A1A1E] px-4 py-3 border-b border-slate-200/60 dark:border-white/5 items-center justify-between shrink-0 sticky top-0 z-20">
                  <div className="flex items-center gap-2 min-w-0">
                     <button
                        type="button"
                        onClick={() => setMobileShowDetails(false)}
                        className="flex items-center gap-1 text-[14px] font-medium text-slate-800 dark:text-neutral-200 py-1 px-1 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
                     >
                        <ChevronLeft size={18} />
                        <span>Settings</span>
                     </button>
                  </div>
                  
                  <button
                      type="button"
                      onClick={handleCloseSettings}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white active:scale-90 transition-transform cursor-pointer shrink-0"
                      title="Close Settings"
                   >
                      <X size={15} />
                   </button>
               </div>

               {/* Scrollable Content Container */}
               <div id="settings-scroll-container" className="w-full flex-1 min-h-0 overflow-y-auto amazing-scrollbar scroll-smooth overscroll-contain">

                  {/* Scrollable Content wrapper with padding */}
                  <div className="w-full mx-auto pt-2 md:pt-1 px-3 sm:px-6 md:px-8 pb-6 md:pb-12 space-y-5">
                     {/* Desktop Clean Section Heading & Subtitle */}
                     <div className="hidden md:block mb-5 max-w-[820px]">
                        <h1 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                           {headerTitle}
                        </h1>
                        {TAB_SUBTITLES[activeTab] && (
                           <p className="text-[13px] text-slate-400 dark:text-neutral-500 mt-1">
                              {TAB_SUBTITLES[activeTab]}
                           </p>
                        )}
                     </div>

                     <AnimatePresence mode="wait" initial={false}>

                     {/* TAB 0: ACCOUNT SETTINGS */}
                     {activeTab === 'account' && (
                        <motion.div
                           key="account"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="space-y-5 w-full max-w-[780px]"
                        >
                           <AccountTab 
                              profile={profile}
                              isInitialLoading={isInitialLoading}
                              setActiveSubTab={setActiveSubTab} 
                              onEditProfile={() => {
                                 setActiveTab('profile');
                                 setIsDesktopEditingProfile(true);
                              }}
                              onEditPhone={() => {
                                 setPhoneDraft(profile.phone || '');
                                 setShowSmsModal(true);
                              }}
                              onProfileUpdated={(patch) => setProfile((prev: any) => ({ ...prev, ...patch }))}
                           />
                        </motion.div>
                     )}

                     {/* TAB 1: PROFILE INFORMATION & PRIVACY */}
                     {activeTab === 'profile' && (
                        <motion.div
                           key="profile"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="space-y-5 w-full max-w-[820px]"
                        >
                           {/* Desktop Profile Overview Showcase Card when NOT in edit mode */}
                           {!isDesktopEditingProfile && (
                              <div className="hidden md:block space-y-5">
                                 {/* Card 1: Profile Showcase Card (Clean Banner + Fade + Avatar + Name + Bio preview + Edit Profile) */}
                                 <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_4px_22px_rgba(15,23,42,0.05)] dark:shadow-none overflow-hidden">
                                    <div className="relative h-[200px] w-full overflow-hidden bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#6D28D9] dark:from-[#1E3A8A] dark:via-[#312E81] dark:to-[#4C1D95]">
                                       {profile.bannerUrl ? (
                                          <img
                                             src={profile.bannerUrl}
                                             alt="Profile cover"
                                             className="w-full h-full object-cover object-center"
                                             onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                          />
                                       ) : (
                                          <div
                                             aria-hidden="true"
                                             className="absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(255,255,255,0.24),transparent_55%),radial-gradient(circle_at_82%_70%,rgba(167,139,250,0.32),transparent_50%)]"
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
                                    </div>

                                    <div className="px-6 pb-6">
                                       <div className="relative z-10 -mt-12 mb-3">
                                          <div className="w-[76px] h-[76px] rounded-full ring-4 ring-white dark:ring-[#1B1B20] shadow-md overflow-hidden bg-slate-100 dark:bg-neutral-800">
                                             <img
                                                src={profile.avatarUrl || defaultAvatar}
                                                alt={displayName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                                             />
                                          </div>
                                       </div>

                                       <h2 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                                          {displayName}
                                       </h2>
                                       <p className="text-[13px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                          @{profile.username || "trader"}
                                       </p>

                                       {profile.bio?.trim() && (
                                          <p className="text-[13px] text-slate-600 dark:text-neutral-300 mt-3 leading-relaxed max-w-xl">
                                             {profile.bio.trim()}
                                          </p>
                                       )}

                                       <div className="mt-4">
                                          <TactileBoxButton
                                             onClick={() => {
                                                triggerHaptic("selection");
                                                setIsDesktopEditingProfile(true);
                                             }}
                                             className="h-9 px-4"
                                          >
                                             <Pencil size={13.5} strokeWidth={2.2} className="text-slate-800 dark:text-white" />
                                             <span>Edit profile</span>
                                          </TactileBoxButton>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Card 2: Email, Password, Timezone, Time/Date Format & Language */}
                                 <ProfileAccountPreferencesCard
                                    profile={profile}
                                    onManageEmail={() => {
                                       setActiveTab('account');
                                       setActiveSubTab('email-management');
                                    }}
                                    onSetPassword={() => {
                                       setActiveTab('account');
                                       setActiveSubTab('password-security');
                                    }}
                                 />
                              </div>
                           )}

                           {/* Mobile ALWAYS renders ProfileTab; Desktop renders full ProfileTab editor when Edit profile is clicked */}
                           <div id="settings-profile-editor" className={isDesktopEditingProfile ? "block" : "md:hidden"}>
                              {isDesktopEditingProfile && (
                                 <div className="hidden md:flex items-center justify-between mb-4">
                                    <button
                                       type="button"
                                       onClick={() => setIsDesktopEditingProfile(false)}
                                       className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                                    >
                                       <ChevronLeft size={15} />
                                       <span>Back to profile card</span>
                                    </button>
                                 </div>
                              )}
                              <ProfileTab 
                                 profile={profile} 
                                 setProfile={setProfile} 
                                 activePlan={activePlan}
                                 privacySettings={privacySettings} 
                                 setPrivacySettings={setPrivacySettings} 
                                 avatarUploadRef={avatarUploadRef} 
                                 bannerUploadRef={bannerUploadRef} 
                                 isInitialLoading={isInitialLoading}
                                 onSave={async () => {
                                    await handleUpdateProfile();
                                    setIsDesktopEditingProfile(false);
                                 }}
                                 onCancel={() => {
                                    setIsDesktopEditingProfile(false);
                                    setMobileShowDetails(false);
                                 }}
                                 loading={loading}
                                 setActiveTab={setActiveTab}
                              />
                           </div>

                           {/* Hidden inputs triggers */}
                           <input type="file" ref={avatarUploadRef} accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 try {
                                    const base64 = await resizeImageFile(file, 768, 768, 0.94);
                                    setProfile((p: any) => ({...p, avatarUrl: base64}));
                                 } catch (err) {
                                    console.error("Failed to resize avatar", err);
                                 }
                              }
                           }} />
                           <input type="file" ref={bannerUploadRef} accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 try {
                                    const base64 = await resizeImageFile(file, 2560, 1600, 0.95);
                                    setProfile((p: any) => ({...p, bannerUrl: base64}));
                                 } catch (err) {
                                    console.error("Failed to resize banner", err);
                                 }
                              }
                           }} />

                        </motion.div>
                     )}

                     {/* TAB 2: ACCOUNT & SECURITY */}
                     {activeTab === 'security' && (
                        <motion.div
                           key="security"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-6 w-full max-w-[740px] mx-auto"
                        >
                           

                           <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200/50 dark:border-transparent space-y-5">
                              <h4 className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                 <Key size={14} className="text-indigo-650" /> Password Controls
                              </h4>
                              <p className="text-[12px] text-slate-500">Need to update your security credentials? Click below to dispatch an automated secure reset trigger to your registered email.</p>
                              <button 
                                 onClick={() => { toast.success("Password reset token dispatched to registered address."); }}
                                 className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded transition-all shadow-sm"
                              >
                                 Change Password
                              </button>
                           </div>

                           {/* MFA Card */}
                           <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200/50 dark:border-transparent space-y-5">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-1">
                                    <h4 className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                       <ShieldCheck size={14} className="text-indigo-650" /> Two-Factor Authentication (2FA)
                                    </h4>
                                    <p className="text-[12px] text-slate-500 max-w-md">Protect your Tradifive account with an extra layer of security. Verify logging attempts with an authenticator app (Google Authenticator, Duo).</p>
                                 </div>
                                 <span className="px-2 py-0.5 rounded bg-slate-250 dark:bg-[#121212] text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-300 dark:border-transparent">Disabled</span>
                              </div>
                              <button 
                                 onClick={() => { toast.info("Authenticating via SMS code setup modal instead"); setShowSmsModal(true); }}
                                 className="px-5 py-2.5 bg-slate-250 hover:bg-slate-350 dark:bg-[#121212] dark:hover:bg-[#222225] text-slate-800 dark:text-white font-bold text-xs rounded transition-all shadow-sm"
                              >
                                 Enable 2FA Authentication
                              </button>
                           </div>

                           {/* Danger zone */}
                           <div className="p-6 rounded-xl border-2 border-red-500/20 bg-red-50 dark:bg-red-950/5 space-y-5">
                              <div className="space-y-1">
                                 <h4 className="text-[11px] font-semibold text-red-650 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
                                    <AlertTriangle size={14} /> Danger Zone / Account Suspension
                                 </h4>
                                 <p className="text-[12px] text-red-700/80 dark:text-red-400/80">Deactivating deletes active billing, stops AI sync engines, and hides trading logs instantly. This action cannot be reversed without support verification.</p>
                              </div>
                              <div className="flex gap-4">
                                 <button 
                                    onClick={() => { toast.error("Deactivation request initialized. Check email for details."); }}
                                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded transition-all shadow-md active:translate-y-[1px]"
                                 >
                                    Deactivate Account
                                 </button>
                              </div>
                           </div>

                        </motion.div>
                     )}

                     {/* TAB 3: PRIVACY & COMMUNITY */}
                     {activeTab === 'privacy' && (
                        <motion.div
                           key="privacy"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-6 w-full max-w-[740px] mx-auto"
                        >
                           
                           {/* Visibility list */}
                           <div className="p-6 rounded-xl bg-slate-50 dark:bg-[#121212] border border-slate-200/50 dark:border-transparent space-y-4">
                              <h4 className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Analytics Sharing Preferences</h4>
                              
                              <div className="space-y-3">
                                 <div className={`p-4 rounded-lg bg-white dark:bg-[#121212] flex items-center justify-between transition-opacity`}>
                                    <div className="flex flex-col gap-0.5 max-w-[80%]">
                                       <span className="text-[13px] font-bold text-slate-800 dark:text-white">Private Profile Account</span>
                                       <span className="text-[11px] text-slate-500">Only approved followers can view your feed posts and calendar heatmap.</span>
                                    </div>
                                    <SettingsToggle checked={privacySettings.is_private} onChange={(v) => setPrivacySettings((prev: any) => ({ ...prev, is_private: v }))} />
                                 </div>

                                 {[
                                    { key: "show_location", label: "Share Location Indicators", desc: "Allow community members to view city, state, and flag emojis." },
                                    { key: "show_winrate", label: "Share Win Rate Stats", desc: "Publicly showcase win rate metrics in feed panels." },
                                    { key: "show_roi", label: "Share ROI (All Time)", desc: "Render active PnL curve percentages on public profiles." },
                                    { key: "show_streak", label: "Share Active Trading Streaks", desc: "Show consecutive green/red trading days." },
                                    { key: "show_trades", label: "Share Active Trade Ledger", desc: "Allows open viewing of individual position histories." }
                                 ].map((item) => (
                                    <div key={item.key} className="p-4 rounded-lg bg-white dark:bg-[#121212] flex items-center justify-between">
                                       <div className="flex flex-col gap-0.5 max-w-[80%]">
                                          <span className="text-[13px] font-bold text-slate-800 dark:text-white">{item.label}</span>
                                          <span className="text-[11px] text-slate-500">{item.desc}</span>
                                       </div>
                                       <SettingsToggle checked={privacySettings[item.key]} onChange={(v) => setPrivacySettings((prev: any) => ({ ...prev, [item.key]: v }))} />
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="flex justify-end pt-2 pb-8">
                              <ConsistencyToggleButton 
                                 label="Save Privacy Preferences" 
                                 checked={true} 
                                 onChange={() => handleUpdateProfile()} 
                              />
                           </div>

                        </motion.div>
                     )}

                     {/* TAB 4: PREFERENCES / THEME & DISPLAY */}
                     {activeTab === 'appearance' && (
                        <motion.div
                           key="appearance"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="space-y-5 w-full max-w-[820px]"
                        >
                           {/* Card 1: Workspace Display & Appearance Controls */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 divide-y divide-slate-100 dark:divide-white/[0.06]">
                              {/* Global Color Theme */}
                              <div className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                 <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                       {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                                    </div>
                                    <div className="min-w-0">
                                       <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white">Global Color Theme</h3>
                                       <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                          Switch light or dark workspace lighting across all pages.
                                       </p>
                                    </div>
                                 </div>
                                 <ThemeSwitch checked={theme === 'dark'} onChange={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')} />
                              </div>

                              {/* Immersive Full Screen */}
                              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                 <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                       <Monitor size={16} />
                                    </div>
                                    <div className="min-w-0">
                                       <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white">Immersive Full Screen</h3>
                                       <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                          Stretch workspace views edge-to-edge without outer margins.
                                       </p>
                                    </div>
                                 </div>
                                 <SettingsToggle checked={fullScreenLayout} onChange={handleFullScreenChange} />
                              </div>

                              {/* Background Fade Style (Light Mode) */}
                              <div className={`py-4 flex-col sm:flex-row sm:items-center justify-between gap-4 ${theme === 'dark' ? 'hidden' : 'flex'} dark:hidden`}>
                                 <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                                       <Palette size={16} />
                                    </div>
                                    <div className="min-w-0">
                                       <h3 className="text-[13.5px] font-bold text-slate-900">Background Fade Style</h3>
                                       <p className="text-[12px] text-slate-400 mt-0.5">
                                          Subtle ambient tint in light mode pages.
                                       </p>
                                    </div>
                                 </div>
                                 <div className="w-[155px] shrink-0">
                                    <Select
                                       value={bgFadeStyle}
                                       onValueChange={(value) => {
                                          setBgFadeStyle(value);
                                          localStorage.setItem("fialgo_bg_fade_style", value);
                                          window.dispatchEvent(new Event("fialgo_bg_style_changed"));
                                       }}
                                    >
                                       <SelectTrigger className="w-full bg-[#F4F5F8] border border-slate-200/80 text-slate-800 text-[12.5px] font-semibold rounded-xl h-9 focus:ring-2 focus:ring-[#2563EB]/25">
                                          <SelectValue placeholder="Select Fade" />
                                       </SelectTrigger>
                                       <SelectContent className="bg-white border-slate-200 rounded-xl shadow-lg z-[9999]">
                                          <SelectItem value="purple" className="text-[12.5px] font-semibold cursor-pointer">Purple Fade</SelectItem>
                                          <SelectItem value="gray" className="text-[12.5px] font-semibold cursor-pointer">Gray Fade</SelectItem>
                                          <SelectItem value="black" className="text-[12.5px] font-semibold cursor-pointer">Black Fade</SelectItem>
                                          <SelectItem value="blue" className="text-[12.5px] font-semibold cursor-pointer">Blue Fade</SelectItem>
                                          <SelectItem value="rose" className="text-[12.5px] font-semibold cursor-pointer">Rose Fade</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>

                              {/* Interface Accent Tint */}
                              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                 <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                       <Sparkles size={16} />
                                    </div>
                                    <div className="min-w-0">
                                       <h3 className="text-[13.5px] font-bold text-slate-900 dark:text-white">Interface Accent Tint</h3>
                                       <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                          Choose your highlight color across active tabs and controls.
                                       </p>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2 shrink-0">
                                    {[
                                       { id: 'blue', color: 'bg-[#2563EB]', name: 'TradiFive Blue' },
                                       { id: 'emerald', color: 'bg-emerald-500', name: 'Emerald' },
                                       { id: 'purple', color: 'bg-purple-500', name: 'Royal Violet' },
                                       { id: 'amber', color: 'bg-amber-500', name: 'Amber' },
                                       { id: 'rose', color: 'bg-rose-500', name: 'Rose' },
                                    ].map((tint) => (
                                       <button
                                          key={tint.id}
                                          type="button"
                                          title={tint.name}
                                          onClick={() => {
                                             setAccentColor(tint.id);
                                             localStorage.setItem('tradifive_accent_color', tint.id);
                                             toast.success(tint.name + ' accent selected');
                                          }}
                                          className={'w-7 h-7 rounded-full cursor-pointer ' + tint.color + ' flex items-center justify-center transition-all ' + (accentColor === tint.id ? 'ring-2 ring-offset-2 ring-[#2563EB] dark:ring-offset-[#1B1B20] scale-105' : 'opacity-75 hover:opacity-100')}
                                       >
                                          {accentColor === tint.id && <Check size={13} className="text-white" strokeWidth={3} />}
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           {/* Card 2: Trading & P&L Colors Palette */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-4">
                              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                 <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <TrendingUp size={16} />
                                 </div>
                                 <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                       <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                          Trading &amp; P&amp;L Colors
                                       </h3>
                                       <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400">
                                          Dashboard &amp; Journal
                                       </span>
                                    </div>
                                    <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                       Choose how profit, loss, equity curves, and trade logs are colored.
                                    </p>
                                 </div>
                              </div>

                              {/* 3 Selectable Theme Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                 {(Object.keys(PNL_THEMES) as TradingThemeId[]).map((id) => {
                                    const t = PNL_THEMES[id];
                                    const isSelected = pnlTheme === id;
                                    return (
                                       <button
                                          key={id}
                                          type="button"
                                          onClick={() => {
                                             changePnlTheme(id);
                                             localStorage.setItem('tradifive_chart_theme', id === 'monochrome' ? 'classic' : id);
                                             toast.success(`Applied ${t.label} palette across Dashboard & Journal`);
                                          }}
                                          className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                                             isSelected
                                                ? "border-[#2563EB] bg-blue-50/35 dark:bg-blue-500/10 ring-1 ring-[#2563EB]/30"
                                                : "border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                                          }`}
                                       >
                                          <div>
                                             <div className="flex items-center justify-between gap-1 mb-1.5">
                                                <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                                                   {t.label}
                                                </span>
                                                {isSelected ? (
                                                   <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                                                      <Check size={10} strokeWidth={3} />
                                                   </span>
                                                ) : t.badge ? (
                                                   <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-neutral-300">
                                                      {t.badge}
                                                   </span>
                                                ) : null}
                                             </div>
                                             <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
                                                {t.subLabel}
                                             </p>
                                          </div>

                                          {/* Live Swatch Preview */}
                                          <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] text-[11px] font-bold tabular-nums">
                                             <span className={`px-2 py-0.5 rounded-md text-[11px] ${t.profitBadge}`}>
                                                {t.previewProfit}
                                             </span>
                                             <span className={`px-2 py-0.5 rounded-md text-[11px] ${t.lossBadge}`}>
                                                {t.previewLoss}
                                             </span>
                                          </div>
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>

                           {/* Card 3: Mouse Pointer & Cursor Selection */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-4">
                              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                 <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                    <MousePointer size={16} />
                                 </div>
                                 <div className="min-w-0">
                                    <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                       Mouse Pointer &amp; Cursor
                                    </h3>
                                    <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                       Choose your desktop mouse pointer style and click feedback.
                                    </p>
                                 </div>
                              </div>

                              {/* 3 Selectable Cursor Cards */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                 {[
                                    {
                                       id: '3d' as const,
                                       title: '3D Glossy Arrow',
                                       badge: 'Recommended',
                                       desc: 'Sleek beveled arrow with crisp contrast & click feedback.',
                                       preview: (
                                          <div className="w-full h-12 rounded-xl bg-slate-100 dark:bg-black/30 flex items-center justify-center relative overflow-hidden">
                                             <img src="/custom-cursor.png" alt="3D Arrow" className="w-5 h-5 object-contain drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.20)]" />
                                          </div>
                                       ),
                                    },
                                    {
                                       id: 'dot' as const,
                                       title: 'Precision Dot',
                                       badge: 'Modern',
                                       desc: 'Minimalist dot cursor with subtle dynamic hover ring.',
                                       preview: (
                                          <div className="w-full h-12 rounded-xl bg-slate-100 dark:bg-black/30 flex items-center justify-center relative overflow-hidden">
                                             <div className="w-3.5 h-3.5 rounded-full bg-slate-900 dark:bg-white shadow-sm ring-4 ring-[#2563EB]/20" />
                                          </div>
                                       ),
                                    },
                                    {
                                       id: 'system' as const,
                                       title: 'System Default',
                                       badge: 'Classic',
                                       desc: 'Standard native OS pointer across all panels.',
                                       preview: (
                                          <div className="w-full h-12 rounded-xl bg-slate-100 dark:bg-black/30 flex items-center justify-center relative overflow-hidden">
                                             <MousePointer size={18} className="text-slate-700 dark:text-neutral-300" />
                                          </div>
                                       ),
                                    },
                                 ].map((opt) => {
                                    const isSelected = cursorStyle === opt.id;
                                    return (
                                       <button
                                          key={opt.id}
                                          type="button"
                                          onClick={() => handleCursorStyleChange(opt.id)}
                                          className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                                             isSelected
                                                ? "border-[#2563EB] bg-blue-50/35 dark:bg-blue-500/10 ring-1 ring-[#2563EB]/30"
                                                : "border-slate-200/80 dark:border-white/[0.08] bg-slate-50/70 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20"
                                          }`}
                                       >
                                          <div>
                                             <div className="flex items-center justify-between gap-1 mb-1.5">
                                                <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                                                   {opt.title}
                                                </span>
                                                {isSelected ? (
                                                   <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                                                      <Check size={10} strokeWidth={3} />
                                                   </span>
                                                ) : (
                                                   <span className="text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-neutral-400">
                                                      {opt.badge}
                                                   </span>
                                                )}
                                             </div>
                                             <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed mb-3">
                                                {opt.desc}
                                             </p>
                                          </div>

                                          {opt.preview}
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>
                        </motion.div>
                     )}


                     {/* TAB 6: NOTIFICATIONS (Consistent Settings Cards, Switches & Pills) */}
                     {activeTab === 'notifications' && (
                        <motion.div
                           key="notifications"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="space-y-5 w-full max-w-[820px]"
                        >
                           {/* Delivery Overview & Quick Actions Card */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                                 <div>
                                    <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                       Delivery Controls
                                    </h3>
                                    <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                       Pause alerts, restrict to email digests, or reset to default routing.
                                    </p>
                                 </div>

                                 <div className="flex items-center gap-2 flex-wrap shrink-0">
                                    <button
                                       type="button"
                                       onClick={handleGlobalOff}
                                       className={`h-8 px-3.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                                          globalOff
                                             ? 'bg-rose-600 text-white border border-rose-600 shadow-xs'
                                             : 'tactile-white-pill text-slate-700 dark:text-neutral-200'
                                       }`}
                                    >
                                       <Power size={12.5} strokeWidth={2.2} />
                                       <span>{globalOff ? 'Muted (DND)' : 'Pause All'}</span>
                                    </button>
                                    <button
                                       type="button"
                                       onClick={handleEmailOnly}
                                       className={`h-8 px-3.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 ${
                                          globalEmailOnly
                                             ? 'bg-[#2563EB] text-white border border-[#2563EB] shadow-xs'
                                             : 'tactile-white-pill text-slate-700 dark:text-neutral-200'
                                       }`}
                                    >
                                       <Mail size={12.5} strokeWidth={2.2} />
                                       <span>Email Only</span>
                                    </button>
                                    <button
                                       type="button"
                                       onClick={handleResetNotificationDefaults}
                                       className="tactile-white-pill h-8 px-3 rounded-full text-[12px] font-semibold flex items-center gap-1.5 text-slate-600 hover:text-slate-900 dark:text-neutral-300 dark:hover:text-white cursor-pointer select-none active:scale-95"
                                       title="Reset to defaults"
                                    >
                                       <RefreshCw size={12.5} strokeWidth={2.2} />
                                       <span>Reset</span>
                                    </button>
                                 </div>
                              </div>

                              {/* 3 Master Delivery Channels */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                 {/* Push alerts */}
                                 <div className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07] px-3.5 py-3 flex items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                       <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                          <Smartphone size={15} />
                                       </div>
                                       <div className="min-w-0">
                                          <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate">Push Alerts</h4>
                                          <p className="text-[11px] text-slate-400 dark:text-neutral-500 truncate">{globalOff ? 'Paused' : 'Active on device'}</p>
                                       </div>
                                    </div>
                                    <SettingsToggle checked={!globalOff} onChange={handleGlobalOff} />
                                 </div>

                                 {/* Sound Chimes */}
                                 <div className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07] px-3.5 py-3 flex items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                       <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                          <Volume2 size={15} />
                                       </div>
                                       <div className="min-w-0">
                                          <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate">Audio Chimes</h4>
                                          <p className="text-[11px] text-slate-400 dark:text-neutral-500 truncate">{soundAlertsEnabled ? 'Fills & warnings' : 'Muted'}</p>
                                       </div>
                                    </div>
                                    <SettingsToggle checked={soundAlertsEnabled} onChange={handleToggleSound} />
                                 </div>

                                 {/* Email Digests */}
                                 <div className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07] px-3.5 py-3 flex items-center justify-between gap-2.5">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                       <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                          <Mail size={15} />
                                       </div>
                                       <div className="min-w-0">
                                          <h4 className="text-[12.5px] font-bold text-slate-900 dark:text-white truncate">Email Statements</h4>
                                          <p className="text-[11px] text-slate-400 dark:text-neutral-500 truncate">{emailStatementsEnabled ? 'Monday audits' : 'Paused'}</p>
                                       </div>
                                    </div>
                                    <SettingsToggle checked={emailStatementsEnabled} onChange={handleToggleEmailStatements} />
                                 </div>
                              </div>
                           </div>

                           {/* Notification Category Cards */}
                           {[
                              {
                                 key: 'alerts',
                                 title: 'Trading & Execution Alerts',
                                 desc: 'Real-time fills, stop loss hits, and critical drawdown alarms.',
                                 icon: AlertTriangle,
                              },
                              {
                                 key: 'ai_coach',
                                 title: 'AI Coach & Daily Routine',
                                 desc: 'Psychology detection, Monday audit statements, and morning directives.',
                                 icon: Brain,
                              },
                              {
                                 key: 'messages',
                                 title: 'Community & Discussions',
                                 desc: 'Direct messages from mentors, @mentions, and channel announcements.',
                                 icon: MessageSquare,
                              },
                              {
                                 key: 'text',
                                 title: 'Security & Payouts',
                                 desc: '2FA security alerts, new device logins, and weekly profit settlements.',
                                 icon: ShieldCheck,
                              }
                           ].map((section) => (
                              <div
                                 key={section.key}
                                 className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 space-y-3"
                              >
                                 {/* Section Header */}
                                 <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                       <section.icon size={16} />
                                    </div>
                                    <div>
                                       <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                          {section.title}
                                       </h3>
                                       <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                          {section.desc}
                                       </p>
                                    </div>
                                 </div>

                                 {/* Notification Items */}
                                 <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                    {((notifications as any)[section.key] || []).map((notif: any) => (
                                       <div
                                          key={notif.id}
                                          className="py-3 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                                       >
                                          <div className="min-w-0 pr-2">
                                             <h4 className="text-[13px] font-semibold text-slate-800 dark:text-neutral-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                {notif.label}
                                             </h4>
                                             {notif.desc && (
                                                <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5 leading-relaxed">
                                                   {notif.desc}
                                                </p>
                                             )}
                                          </div>

                                          {/* Consistent Settings Channel Pills (Push / In-App / Email) */}
                                          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                                             {(['push', 'app', 'email'] as const).map((channel) => {
                                                const isActive = !!notif[channel];
                                                const label = channel === 'push' ? 'Push' : channel === 'app' ? 'In-App' : 'Email';
                                                return (
                                                   <button
                                                      key={channel}
                                                      type="button"
                                                      onClick={() => handleToggle(section.key, notif.id, channel)}
                                                      className={`h-7 px-3 rounded-full text-[11px] font-semibold transition-all cursor-pointer select-none active:scale-95 ${
                                                         isActive
                                                            ? 'bg-[#2563EB] text-white border border-[#2563EB] shadow-[0_2px_6px_rgba(37,99,235,0.24)]'
                                                            : 'bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-neutral-400 border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-800 dark:hover:text-white'
                                                      }`}
                                                      title={`Toggle ${label} alert`}
                                                   >
                                                      {label}
                                                   </button>
                                                );
                                             })}
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                        </motion.div>
                     )}

                     {/* TAB 7: AI COACH */}
                     {activeTab === 'ai' && (
                        <motion.div
                           key="ai"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="space-y-5 w-full max-w-[820px]"
                        >
                           {/* Card 1: AI Coach Access & Daily Credits */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                       <Sparkles size={16} />
                                    </div>
                                    <div className="min-w-0">
                                       <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                          AI Usage &amp; Daily Quota
                                       </h3>
                                       <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                          {isStarter
                                             ? 'TradiFive AI Coach is available on Pro & Elite subscriptions.'
                                             : `Your ${activePlan === 'elite' ? 'Elite' : 'Pro'} plan includes live trade analysis and coaching bandwidth.`}
                                       </p>
                                    </div>
                                 </div>

                                 {!isStarter ? (
                                    <div className="text-left sm:text-right shrink-0">
                                       <p className="text-[22px] font-bold text-[#2563EB] dark:text-blue-400 tracking-tight tabular-nums leading-none">
                                          {aiCredits} <span className="text-[12.5px] font-semibold text-slate-400 dark:text-neutral-500">/ {activeMaxCredits}</span>
                                       </p>
                                       <p className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mt-1">
                                          Credits Left
                                       </p>
                                    </div>
                                 ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/15 border border-blue-200/70 dark:border-blue-500/25 text-[11px] font-bold shrink-0 self-start sm:self-center">
                                       <Lock size={11} strokeWidth={2.5} className="text-[#2563EB] dark:text-blue-400" />
                                       <span className="btn-shine">Pro &amp; Elite</span>
                                    </span>
                                 )}
                              </div>

                              {!isStarter && (
                                 <div className="w-full bg-slate-100 dark:bg-white/[0.06] rounded-full h-2 overflow-hidden">
                                    <div
                                       className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
                                       style={{ width: `${Math.min(100, Math.max(0, (aiCredits / activeMaxCredits) * 100))}%` }}
                                    />
                                 </div>
                              )}

                              <div className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div className="min-w-0">
                                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                                       {isStarter ? 'Unlock TradiFive AI Coach' : 'Need Higher Daily AI Quota?'}
                                    </h4>
                                    <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                       {isStarter
                                          ? 'Upgrade to Pro or Elite to audit live setups, psychology patterns, and weekly trade reviews.'
                                          : 'Upgrade to Elite for maximum daily prompts and priority model reasoning.'}
                                    </p>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={() => navigate('/upgrade')}
                                    className="h-9 px-4 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold shadow-xs inline-flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer active:scale-95 transition-all"
                                 >
                                    <span>{isStarter ? 'Upgrade' : 'View Plans'}</span>
                                    <ArrowRight size={13} />
                                 </button>
                              </div>
                           </div>

                           {/* Card 2: AI Coach Persona & Guardrails */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-5">
                              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                 <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                    Coach Persona &amp; Guardrails
                                 </h3>
                                 <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                    Select the coaching style and feedback cadence inside TradiFive AI.
                                 </p>
                              </div>

                              <div>
                                 <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-2 px-1">
                                    COACH PERSONA
                                 </label>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                       {
                                          id: 'Strict Guard',
                                          desc: 'Direct, zero-excuse rule enforcement on risk and tilt.',
                                       },
                                       {
                                          id: 'Analytical Quant',
                                          desc: 'Data-first review focused on expectancy, R-multiple, and edge.',
                                       },
                                       {
                                          id: 'Mindset Partner',
                                          desc: 'Balanced psychological reflection to prevent emotional mistakes.',
                                       },
                                    ].map((persona) => {
                                       const selected = aiTone === persona.id;
                                       return (
                                          <button
                                             key={persona.id}
                                             type="button"
                                             onClick={() => {
                                                if (isStarter) {
                                                   toast.info('Pro & Elite Feature · AI Coach', {
                                                      description: 'Upgrade to Pro or Elite to customize AI Coach personas.',
                                                      action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
                                                   });
                                                   return;
                                                }
                                                setAiTone(persona.id);
                                                localStorage.setItem('tradifive_ai_persona', persona.id);
                                                if (globalUserId) localStorage.setItem(`tradifive_ai_persona_${globalUserId}`, persona.id);
                                                toast.success(`AI persona set to ${persona.id}`);
                                             }}
                                             className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                                                selected
                                                   ? 'border-[#2563EB] bg-blue-50/40 dark:bg-blue-500/10 ring-1 ring-[#2563EB]/25'
                                                   : 'border-slate-200/80 dark:border-white/[0.08] bg-slate-50/60 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
                                             }`}
                                          >
                                             <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[13px] font-bold text-slate-900 dark:text-white">
                                                   {persona.id}
                                                </span>
                                                {selected && (
                                                   <span className="w-4 h-4 rounded-full bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                                                      <Check size={10} strokeWidth={3} />
                                                   </span>
                                                )}
                                             </div>
                                             <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                                                {persona.desc}
                                             </p>
                                          </button>
                                       );
                                    })}
                                 </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                 <div>
                                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Analysis Cadence</h4>
                                    <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                       Choose when AI Coach highlights session feedback.
                                    </p>
                                 </div>
                                 <div className="inline-flex p-1 bg-[#EAECEF] dark:bg-[#232329] rounded-xl gap-1 shrink-0 self-start sm:self-center">
                                    {['Every Trade', 'Session End', 'Tilt Only'].map((freq) => (
                                       <button
                                          key={freq}
                                          type="button"
                                          onClick={() => {
                                             if (isStarter) {
                                                toast.info('Pro & Elite Feature · AI Coach', {
                                                   description: 'Upgrade to Pro or Elite to enable automated AI coaching.',
                                                   action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
                                                });
                                                return;
                                             }
                                             setAiFrequency(freq);
                                             localStorage.setItem('tradifive_ai_frequency', freq);
                                             toast.success(`AI cadence set to ${freq}`);
                                          }}
                                          className={`px-3 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all cursor-pointer ${
                                             aiFrequency === freq
                                                ? 'bg-white dark:bg-[#1B1B20] text-slate-900 dark:text-white shadow-xs'
                                                : 'text-slate-500 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
                                          }`}
                                       >
                                          {freq}
                                       </button>
                                    ))}
                                 </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-4">
                                 <div>
                                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Post-Trade Auto Reflection</h4>
                                    <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                       Automatically check closed MT5 trades for early-exit or revenge bias.
                                    </p>
                                 </div>
                                 <SettingsToggle
                                    checked={!isStarter && aiAutoReview}
                                    onChange={(v) => {
                                       if (isStarter) {
                                          toast.info('Pro & Elite Feature · AI Coach', {
                                             description: 'Upgrade to Pro or Elite to enable automated trade reflections.',
                                             action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
                                          });
                                          return;
                                       }
                                       setAiAutoReview(v);
                                       localStorage.setItem('tradifive_ai_auto_review', String(v));
                                    }}
                                 />
                              </div>
                           </div>
                        </motion.div>
                     )}

                           {/* TAB 8: ACCOUNTS & BROKERS */}
                     {activeTab === 'trading' && (
                        <motion.div
                           key="trading"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="space-y-5 w-full max-w-[820px]"
                        >
                           {/* Card 1: MT5 Connection (Forex / Global) or Indian Broker Connector */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-5">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-100 dark:border-blue-500/25 flex items-center justify-center shrink-0 overflow-hidden">
                                       {activeMarket === 'indian' ? (
                                          <Wallet size={18} primaryColor="#2563EB" />
                                       ) : (
                                          <img src="/Mt5 logo.png" alt="MT5" className="w-6 h-6 object-contain" />
                                       )}
                                    </div>
                                    <div>
                                       <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                          {activeMarket === 'indian' ? 'Indian Broker Accounts' : 'MetaTrader 5 (MT5) Connection'}
                                       </h3>
                                       <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                          {activeMarket === 'indian'
                                             ? 'Link your Zerodha, Dhan, or Upstox account for live execution sync.'
                                             : 'Connect via MT5 from any broker worldwide — Vantage, Exness, XM, IC Markets, or prop firms.'}
                                       </p>
                                    </div>
                                 </div>

                                 {connectedBroker ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200/80 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold shrink-0 self-start sm:self-center">
                                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                       Active Sync
                                    </span>
                                 ) : isBrokerLocked && activeMarket !== 'indian' ? (
                                    <button
                                       type="button"
                                       onClick={() => navigate('/upgrade')}
                                       className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-center active:scale-95"
                                    >
                                       <Lock size={12} strokeWidth={2.3} />
                                       <span>Upgrade</span>
                                    </button>
                                 ) : null}
                              </div>

                              {/* Connected Account Summary */}
                              {connectedBroker && !isConnectingBroker && (
                                 <div className="rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.07] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                       <div className="w-11 h-11 rounded-xl bg-white dark:bg-[#232329] border border-slate-200/70 dark:border-white/10 flex items-center justify-center shrink-0">
                                          {['mt5', 'mt4', 'vantage', 'exness', 'xm', 'icmarkets'].includes(connectedBroker) ? (
                                             <img src="/Mt5 logo.png" alt="MT5" className="w-6 h-6 object-contain" />
                                          ) : (
                                             <BrokerIcon name={connectedBroker} size={26} />
                                          )}
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-[13.5px] font-bold text-slate-900 dark:text-white truncate capitalize">
                                             {connectedBroker === 'mt5' ? 'MetaTrader 5' : connectedBroker}
                                          </p>
                                          <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate tabular-nums">
                                             {brokerClientId ? `Account #${brokerClientId}` : 'Live Account Connected'}
                                             {mt5ConnectedServer ? ` · ${mt5ConnectedServer}` : ''}
                                          </p>
                                       </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                                       <button
                                          type="button"
                                          onClick={() => {
                                             if (!isElite && activeMarket !== 'indian') {
                                                toast.info('Elite Feature · Multiple Accounts', {
                                                   description: 'Upgrade to Elite to connect multiple MT5 accounts simultaneously.',
                                                   action: { label: 'Upgrade', onClick: () => navigate('/upgrade') },
                                                });
                                                return;
                                             }
                                             setIsConnectingBroker(true);
                                             setSelectedBrokerToConnect(activeMarket === 'indian' ? '' : 'mt5');
                                          }}
                                          className="tactile-white-pill h-8 px-3.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5 text-slate-700 dark:text-neutral-200 cursor-pointer"
                                       >
                                          <Plus size={13} />
                                          <span>Add Account</span>
                                       </button>
                                       <button
                                          type="button"
                                          onClick={handleDisconnectBroker}
                                          className="h-8 px-3.5 rounded-full text-[12px] font-semibold bg-rose-50 dark:bg-rose-500/15 hover:bg-rose-100 dark:hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-500/25 transition-colors cursor-pointer"
                                       >
                                          Disconnect
                                       </button>
                                    </div>
                                 </div>
                              )}

                              {/* MT5 Only Direct Connect Form (Global / Forex) */}
                              {activeMarket !== 'indian' && (!connectedBroker || isConnectingBroker) && (
                                 <form onSubmit={handleConnectBrokerSubmit} className="space-y-4">
                                    {isBrokerLocked && (
                                       <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] p-3.5 flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-2.5 min-w-0">
                                             <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center shrink-0">
                                                <Lock size={14} strokeWidth={2.4} />
                                             </div>
                                             <div className="min-w-0">
                                                <span className="btn-shine text-[12.5px] font-bold block leading-tight">
                                                   Live MT5 Auto-Sync
                                                </span>
                                                <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
                                                   Pro &amp; Elite · Auto-sync live MT5 trades &amp; Risk Guard
                                                </p>
                                             </div>
                                          </div>
                                          <button
                                             type="button"
                                             onClick={() => navigate('/upgrade')}
                                             className="px-3.5 py-1.5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[11.5px] font-semibold shrink-0 shadow-xs cursor-pointer active:scale-95 transition-all"
                                          >
                                             Upgrade
                                          </button>
                                       </div>
                                    )}

                                    <div className="space-y-3.5">
                                       <div>
                                          <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                                             MT5 Server Name
                                          </label>
                                          <input
                                             type="text"
                                             value={mt5SettingsForm.server}
                                             onChange={(e) => setMt5SettingsForm((p) => ({ ...p, server: e.target.value }))}
                                             placeholder="e.g. VantageInternational-Live, Exness-MT5Real9"
                                             className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-[#1E1E24] transition-colors"
                                          />
                                          <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-1 px-1">
                                             Enter the exact MetaTrader 5 server name provided by your broker.
                                          </p>
                                       </div>

                                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                          <div>
                                             <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                                                MT5 Account Number
                                             </label>
                                             <input
                                                type="text"
                                                value={mt5SettingsForm.login}
                                                onChange={(e) => setMt5SettingsForm((p) => ({ ...p, login: e.target.value }))}
                                                placeholder="e.g. 98310842"
                                                className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-[#1E1E24] transition-colors tabular-nums"
                                             />
                                          </div>
                                          <div>
                                             <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                                                Password
                                             </label>
                                             <div className="relative">
                                                <input
                                                   type={showMt5SettingsPass ? 'text' : 'password'}
                                                   value={mt5SettingsForm.password}
                                                   onChange={(e) => setMt5SettingsForm((p) => ({ ...p, password: e.target.value }))}
                                                   placeholder="Enter MT5 password"
                                                   className="w-full h-10 pl-3.5 pr-9 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-[#1E1E24] transition-colors"
                                                />
                                                <button
                                                   type="button"
                                                   onClick={() => setShowMt5SettingsPass((v) => !v)}
                                                   className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 cursor-pointer"
                                                   aria-label={showMt5SettingsPass ? 'Hide password' : 'Show password'}
                                                >
                                                   {showMt5SettingsPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                                </button>
                                             </div>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-white/[0.06]">
                                       {isConnectingBroker && (
                                          <TactileBoxButton
                                             onClick={() => {
                                                setIsConnectingBroker(false);
                                                setSelectedBrokerToConnect('');
                                             }}
                                             className="h-9 px-4 text-[12.5px]"
                                          >
                                             Cancel
                                          </TactileBoxButton>
                                       )}
                                       {isBrokerLocked ? (
                                          <button
                                             type="button"
                                             onClick={() => navigate('/upgrade')}
                                             className="h-9 px-5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                                          >
                                             <Lock size={13} strokeWidth={2.4} />
                                             <span>Connect MT5 Account</span>
                                          </button>
                                       ) : (
                                          <button
                                             type="submit"
                                             disabled={isConnectingMt5Settings}
                                             className="h-9 px-5 rounded-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-[12.5px] font-semibold shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                                          >
                                             <Link2 size={14} />
                                             <span>{isConnectingMt5Settings ? 'Connecting...' : 'Connect MT5 Account'}</span>
                                          </button>
                                       )}
                                    </div>
                                 </form>
                              )}

                              {/* Indian Broker Picker & Form (Indian Market) */}
                              {activeMarket === 'indian' && (!connectedBroker || isConnectingBroker) && (
                                 <div className="space-y-4">
                                    {!selectedBrokerToConnect ? (
                                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                          {(['zerodha', 'dhan', 'upstox'] as const).map((broker) => (
                                             <button
                                                key={broker}
                                                type="button"
                                                onClick={() => setSelectedBrokerToConnect(broker)}
                                                className="rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-blue-50/60 dark:hover:bg-blue-500/10 border border-slate-200/80 dark:border-white/[0.08] hover:border-blue-300 dark:hover:border-blue-500/30 p-4 flex items-center gap-3 transition-all cursor-pointer text-left"
                                             >
                                                <BrokerIcon name={broker} size={32} />
                                                <div>
                                                   <p className="text-[13.5px] font-bold text-slate-900 dark:text-white capitalize">{broker}</p>
                                                   <p className="text-[11px] text-slate-400 dark:text-neutral-500">API Integration</p>
                                                </div>
                                             </button>
                                          ))}
                                       </div>
                                    ) : (
                                       <form onSubmit={handleConnectBrokerSubmit} className="space-y-3.5 max-w-md">
                                          {selectedBrokerToConnect !== 'dhan' && (
                                             <div>
                                                <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                                                   API Key Token
                                                </label>
                                                <input
                                                   type="text"
                                                   required
                                                   value={brokerApiKey}
                                                   onChange={(e) => setBrokerApiKey(e.target.value)}
                                                   placeholder="KITE-XXXXX or UPSTOX-XXXXX"
                                                   className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] text-slate-900 dark:text-white outline-none focus:border-[#2563EB]"
                                                />
                                             </div>
                                          )}
                                          <div>
                                             <label className="text-[10.5px] font-bold text-slate-400 dark:text-neutral-400 uppercase tracking-wider block mb-1.5 px-1">
                                                Client ID
                                             </label>
                                             <input
                                                type="text"
                                                required
                                                value={brokerClientId}
                                                onChange={(e) => setBrokerClientId(e.target.value)}
                                                placeholder={selectedBrokerToConnect === 'dhan' ? 'e.g. 1000000000' : 'User unique ID'}
                                                className="w-full h-10 px-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] text-slate-900 dark:text-white outline-none focus:border-[#2563EB]"
                                             />
                                          </div>
                                          <div className="flex items-center gap-2.5 pt-2">
                                             <TactileBoxButton
                                                onClick={() => setSelectedBrokerToConnect('')}
                                                className="h-9 px-4 text-[12.5px]"
                                             >
                                                Back
                                             </TactileBoxButton>
                                             <button
                                                type="submit"
                                                className="h-9 px-5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold inline-flex items-center gap-2 cursor-pointer shadow-xs"
                                             >
                                                <Link2 size={14} />
                                                <span>Connect {selectedBrokerToConnect.toUpperCase()}</span>
                                             </button>
                                          </div>
                                       </form>
                                    )}
                                 </div>
                              )}
                           </div>

                           {/* Card 2: Partner Forex Brokers (Promoting Vantage + top MT5-compatible brokers) */}
                           {activeMarket !== 'indian' && (
                              <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-4">
                                 <div className="pb-4 border-b border-slate-100 dark:border-white/[0.06]">
                                    <div className="flex items-center gap-2">
                                       <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                          Open a Partner Forex Account
                                       </h3>
                                       <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/15 border border-amber-200/70 dark:border-amber-500/25 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                                          +500 XP
                                       </span>
                                    </div>
                                    <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                       Don't have an MT5 account yet? Open directly with Vantage (featured partner) or any MT5-compatible broker below.
                                    </p>
                                 </div>

                                 <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                    {[
                                       {
                                          id: 'vantage',
                                          name: 'Vantage Markets',
                                          badge: 'Featured Partner',
                                          featured: true,
                                          desc: 'Raw ECN spreads · Fast execution · MT5 compatible',
                                          url: 'https://www.vantagemarkets.com/',
                                       },
                                       {
                                          id: 'exness',
                                          name: 'Exness',
                                          badge: null,
                                          featured: false,
                                          desc: 'Instant withdrawals · Zero swap options · MT5 compatible',
                                          url: 'https://www.exness.com/',
                                       },
                                       {
                                          id: 'xm',
                                          name: 'XM Global',
                                          badge: null,
                                          featured: false,
                                          desc: 'Ultra low spreads · Instant order routing · MT5 compatible',
                                          url: 'https://www.xm.com/',
                                       },
                                       {
                                          id: 'icmarkets',
                                          name: 'IC Markets',
                                          badge: null,
                                          featured: false,
                                          desc: 'True ECN pricing · Deep liquidity · MT5 compatible',
                                          url: 'https://www.icmarkets.com/',
                                       },
                                       {
                                          id: 'pepperstone',
                                          name: 'Pepperstone',
                                          badge: null,
                                          featured: false,
                                          desc: 'Institutional execution · Raw spreads · MT5 compatible',
                                          url: 'https://www.pepperstone.com/',
                                       },
                                    ].map((partner) => (
                                       <div
                                          key={partner.id}
                                          className="py-3 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                       >
                                          <div className="flex items-center gap-3 min-w-0">
                                             <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#232329] border border-slate-200/70 dark:border-white/[0.08] flex items-center justify-center shrink-0">
                                                <BrokerIcon name={partner.id} size={24} />
                                             </div>
                                             <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                   <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                                                      {partner.name}
                                                   </h4>
                                                   {partner.badge && (
                                                      <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/15 text-[#2563EB] dark:text-blue-400 text-[10px] font-bold">
                                                         {partner.badge}
                                                      </span>
                                                   )}
                                                </div>
                                                <p className="text-[11.5px] text-slate-400 dark:text-neutral-500 mt-0.5 truncate">
                                                   {partner.desc}
                                                </p>
                                             </div>
                                          </div>

                                          <button
                                             type="button"
                                             onClick={() => window.open(partner.url, '_blank', 'noopener,noreferrer')}
                                             className={
                                                partner.featured
                                                   ? 'h-8 px-4 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[12px] font-semibold inline-flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-center cursor-pointer active:scale-95 transition-all'
                                                   : 'tactile-white-pill h-8 px-3.5 rounded-full text-[12px] font-semibold inline-flex items-center gap-1.5 text-slate-800 dark:text-white shrink-0 self-start sm:self-center cursor-pointer'
                                             }
                                          >
                                             <span>{partner.featured ? 'Open Vantage' : 'Open Account'}</span>
                                             <ArrowUpRight size={13} />
                                          </button>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </motion.div>
                     )}



                     {/* TAB 10: SUBSCRIPTION MANAGEMENT */}
                     {activeTab === 'subscription' && (() => {
      const normalizePlan = (p: string | null | undefined): 'starter' | 'pro' | 'elite' => {
         if (!p) return 'starter';
         const lower = p.toLowerCase();
         if (lower === 'pro' || lower === 'intermediate') return 'pro';
         if (lower === 'elite' || lower === 'advanced' || lower === 'institutional') return 'elite';
         return 'starter';
      };
      const currentTier = normalizePlan(activePlan);

      const nextBillingDate = (() => {
         if (billingHistory && billingHistory.length > 0 && billingHistory[0]?.period_end) {
            try {
               return new Date(billingHistory[0].period_end).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            } catch {
       // Ignore storage restrictions
     }
         }
         const d = new Date();
         d.setDate(d.getDate() + 30);
         return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      })();

      const memberSinceDate = (() => {
         if (profile?.createdAt) {
            try {
               return new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            } catch {
       // Ignore storage restrictions
     }
         }
         return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      })();

      return (
         <motion.div
            key="subscription"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="space-y-5 w-full max-w-[820px] pb-12"
         >
            {/* Card 1: Active Subscription Overview */}
            <div className="bg-white dark:bg-[#1B1B20] rounded-[22px] border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none space-y-3.5">
               <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-slate-900 dark:text-white">
                     {currentTier === 'starter' ? 'Standard Plan' : currentTier === 'pro' ? 'Pro Plan' : 'Elite Plan'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-slate-200/50 dark:border-white/10">
                     {currentTier === 'starter' ? 'Standard active' : `${currentTier.toUpperCase()} active`}
                  </span>
               </div>

               <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100 dark:border-white/5">
                     <span className="text-slate-500 dark:text-slate-400">Plan status</span>
                     <span className="font-semibold text-slate-900 dark:text-white">
                        {currentTier === 'starter' ? 'Active (Free tier)' : 'Active (Paid monthly)'}
                     </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100 dark:border-white/5">
                     <span className="text-slate-500 dark:text-slate-400">Current rate</span>
                     <span className="font-semibold text-slate-900 dark:text-white tabular-nums flex items-center gap-1">
                        {currentTier === 'starter' ? (
                           <>
                              <RunningNumber value={0} prefix="₹" /> <span>/ forever</span>
                           </>
                        ) : currentTier === 'pro' ? (
                           <>
                              <RunningNumber value={billingInterval === 'monthly' ? 1399 : 1119} prefix="₹" />
                              <span>{billingInterval === 'monthly' ? '/ month' : '/ month (billed annually)'}</span>
                           </>
                        ) : (
                           <>
                              <RunningNumber value={billingInterval === 'monthly' ? 2799 : 2239} prefix="₹" />
                              <span>{billingInterval === 'monthly' ? '/ month' : '/ month (billed annually)'}</span>
                           </>
                        )}
                     </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100 dark:border-white/5">
                     <span className="text-slate-500 dark:text-slate-400">Next payment</span>
                     <span className="font-semibold text-slate-900 dark:text-white">
                        {currentTier === 'starter' ? 'No charges scheduled' : `${nextBillingDate} · ${currentTier === 'pro' ? (billingInterval === 'monthly' ? '₹1,399' : '₹1,119') : (billingInterval === 'monthly' ? '₹2,799' : '₹2,239')}`}
                     </span>
                  </div>
               </div>

               <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mb-2">
                     Have a code? Add it before your next billing cycle and it counts on your next payment.
                  </p>
                  <div className="flex items-center gap-2">
                     <AnimatedInput
                        type="text"
                        placeholder="Discount code"
                        value={discountCodeInput}
                        onChange={(e) => setDiscountCodeInput(e.target.value)}
                        className="flex-1 h-9 px-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1E22] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                     />
                     <TactileBoxButton
                        onClick={() => {
                           if (!discountCodeInput.trim()) return toast.error("Please enter a discount code");
                           setAppliedDiscount(discountCodeInput.trim().toUpperCase());
                           toast.success(`Discount code "${discountCodeInput.trim().toUpperCase()}" applied!`);
                           setDiscountCodeInput('');
                        }}
                        className="h-9 px-5 text-xs font-bold"
                     >
                        Add
                     </TactileBoxButton>
                  </div>
                  {appliedDiscount && (
                     <div className="mt-2 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Check size={12} /> Code {appliedDiscount} applied
                     </div>
                  )}
               </div>
            </div>

            {/* Card 2: Billing Summary */}
            <div className="bg-white dark:bg-[#1B1B20] rounded-[22px] border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Billing</span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-full border border-slate-200/50 dark:border-white/10">
                     {currentTier === 'starter' ? 'Free tier' : 'Active'}
                  </span>
               </div>

               <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-white/5">
                     <span className="text-slate-500 dark:text-slate-400">Plan</span>
                     <span className="font-semibold text-slate-900 dark:text-white">
                        {currentTier === 'starter' ? 'Free · ₹0 a month' : currentTier === 'pro' ? 'Pro · ₹1,399 a month' : 'Elite · ₹2,799 a month'}
                     </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-white/5">
                     <span className="text-slate-500 dark:text-slate-400">Member since</span>
                     <span className="font-semibold text-slate-900 dark:text-white">{memberSinceDate}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-white/5">
                     <span className="text-slate-500 dark:text-slate-400">Next renewal</span>
                     <span className="font-semibold text-slate-900 dark:text-white">
                        {currentTier === 'starter' ? 'None (Free plan)' : `${nextBillingDate} · ₹${currentTier === 'pro' ? (billingInterval === 'monthly' ? '1,399' : '1,119') : (billingInterval === 'monthly' ? '2,799' : '2,239')}`}
                     </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-t border-slate-100 dark:border-white/5">
                     <span className="text-slate-500 dark:text-slate-400">Payment method</span>
                     <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CreditCard size={13} className="text-slate-500" />
                        {currentTier === 'starter' ? 'None required' : 'Razorpay Secure Checkout'}
                     </span>
                  </div>
               </div>

               <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11.5px] text-slate-500 flex items-center gap-1.5">
                  <ArrowUpRight size={13} className="text-slate-400" /> Change plan or manage subscription below
               </div>
            </div>

            {/* Card 3: Payments / Invoices */}
            <div className="bg-white dark:bg-[#1B1B20] rounded-[22px] border border-slate-200/80 dark:border-white/[0.08] p-5 sm:p-6 shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none">
               <div className="text-xs font-bold text-slate-900 dark:text-white mb-3">Payments</div>
               {billingHistory && billingHistory.length > 0 ? (
                  <div className="space-y-2">
                     {billingHistory.map((inv: any) => (
                        <div key={inv.id || Math.random()} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-white/5 last:border-b-0">
                           <span className="text-slate-500">
                              {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                           </span>
                           <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              ₹{Number(inv.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              <span
                                 className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-normal cursor-pointer hover:underline text-xs"
                                 onClick={() => toast.info(`Invoice receipt #${String(inv.id || '').slice(0, 8)} generated`)}
                              >
                                 Invoice
                              </span>
                           </span>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="py-3 text-center">
                     <p className="text-xs text-slate-500 dark:text-slate-400">No payment invoices yet</p>
                     <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {currentTier === 'starter'
                           ? 'You are currently on the Free tier. Upgrade below to activate pro features.'
                           : 'Receipts and tax invoices will automatically appear here.'}
                     </p>
                  </div>
               )}
            </div>

            {/* Card 4: Billing Cycle Switcher */}
            <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
               <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Billing cycle</div>
                  <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">Switch to annual for a lower monthly rate</p>
               </div>
               <div className="bg-slate-100 dark:bg-white/5 p-1 rounded-full inline-flex items-center gap-1 border border-slate-200/80 dark:border-white/10">
                  <button
                     onClick={() => setBillingInterval('monthly')}
                     className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        billingInterval === 'monthly'
                           ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                           : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                     }`}
                  >
                     Monthly
                  </button>
                  <button
                     onClick={() => setBillingInterval('annually')}
                     className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        billingInterval === 'annually'
                           ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                           : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                     }`}
                  >
                     Annual
                  </button>
               </div>
            </div>

            {/* Card 5: Free Plan */}
            <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">Free Plan</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">1 broker connection, basic trading journal & core risk guard</p>
               </div>
               <div className="flex items-center gap-4 self-end sm:self-auto">
                  <RunningNumber value={0} prefix="₹" className="text-sm font-bold text-slate-900 dark:text-white" />
                  {currentTier === 'starter' ? (
                     <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
                        Current
                     </span>
                  ) : (
                     <TactileBoxButton
                        onClick={() => handleSettingsDowngrade('starter')}
                        className="h-8 px-4 text-xs font-semibold rounded-xl"
                     >
                        Switch
                     </TactileBoxButton>
                  )}
               </div>
            </div>

            {/* Card 6: Pro Plan — ₹1,399/mo */}
            <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                     Pro Plan
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                     Up to 6 broker connections, loss cooldown & 50 AI coach credits/day
                  </p>
               </div>
               <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                     <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums flex items-baseline justify-end gap-0.5">
                        <RunningNumber value={billingInterval === 'monthly' ? 1399 : 1119} prefix="₹" />
                        <span className="text-xs text-slate-400 font-normal">/mo</span>
                     </span>
                     {billingInterval === 'annually' && (
                        <div className="text-[10px] text-slate-400">Billed annually</div>
                     )}
                  </div>
                  {currentTier === 'pro' ? (
                     <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
                        Current
                     </span>
                  ) : currentTier === 'elite' ? (
                     <TactileBoxButton
                        onClick={() => handleSettingsDowngrade('pro')}
                        className="h-8 px-4 text-xs font-semibold rounded-xl"
                     >
                        Switch
                     </TactileBoxButton>
                  ) : (
                     <TactileBoxButton
                        onClick={() => handleSettingsUpgrade('pro')}
                        className="h-8 px-4 text-xs font-semibold rounded-xl"
                     >
                        Switch
                     </TactileBoxButton>
                  )}
               </div>
            </div>

            {/* Card 7: Elite Plan — ₹2,799/mo + TOP badge */}
            <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div>
                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                     Elite Plan
                     <span className="bg-[#7c3aed] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        TOP
                     </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                     Unlimited broker connections, automated trading & 100 AI credits/day
                  </p>
               </div>
               <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                     <span className="text-sm font-bold text-purple-600 dark:text-purple-400 tabular-nums flex items-baseline justify-end gap-0.5">
                        <RunningNumber value={billingInterval === 'monthly' ? 2799 : 2239} prefix="₹" />
                        <span className="text-xs text-slate-400 font-normal">/mo</span>
                     </span>
                     {billingInterval === 'annually' && (
                        <div className="text-[10px] text-slate-400">Billed annually</div>
                     )}
                  </div>
                  {currentTier === 'elite' ? (
                     <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/5">
                        Current
                     </span>
                  ) : (
                     <TactileBoxButton
                        onClick={() => handleSettingsUpgrade('elite')}
                        className="h-8 px-4 text-xs font-semibold rounded-xl"
                     >
                        Switch
                     </TactileBoxButton>
                  )}
               </div>
            </div>

            {/* Card 8: Refund & Cancellation */}
            <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
               <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Refund</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                     This sends a message to us, it does not refund automatically. Your plan stays active until the refund is issued.
                  </p>
               </div>
               <TactileBoxButton
                  onClick={() => {
                     toast.success("Refund request submitted", {
                        description: "Our billing support team will review your account within 24 hours."
                     });
                  }}
                  className="h-9 px-4 text-xs font-semibold rounded-xl flex items-center gap-1.5 self-end sm:self-auto shrink-0"
               >
                  <HelpCircle size={14} className="text-slate-400" />
                  Request
               </TactileBoxButton>
            </div>
         </motion.div>
      );
   })()}

                     {/* TAB 11: CHANNEL SETTINGS */}
                     {activeTab === 'channel' && (
                        <motion.div
                           key="channel"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="space-y-5 w-full max-w-[820px]"
                        >
                           {/* Card 1: Channel Privacy Level */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-4">
                              <div className="pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                 <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                    Channel Privacy Level
                                 </h3>
                                 <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                    Determine who can search, view, and interact with posts in your channel.
                                 </p>
                              </div>

                              <div className="space-y-2.5">
                                 {[
                                    {
                                       id: 'public',
                                       title: 'Public (Everyone)',
                                       desc: 'Anyone on TradiFive can search and read your channel posts.',
                                    },
                                    {
                                       id: 'request',
                                       title: 'Request-Only',
                                       desc: 'Traders must request approval before joining and reading posts.',
                                    },
                                    {
                                       id: 'private',
                                       title: 'Private (Paid Subscribers)',
                                       desc: 'Only your approved or paid channel members have access.',
                                    },
                                 ].map((opt) => {
                                    const active = feedVisibility === opt.id;
                                    return (
                                       <button
                                          key={opt.id}
                                          type="button"
                                          onClick={() => {
                                             setFeedVisibility(opt.id);
                                             localStorage.setItem('tradifive_channel_visibility', opt.id);
                                             toast.success('Channel visibility updated');
                                          }}
                                          className={`w-full text-left p-3.5 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer ${
                                             active
                                                ? 'border-[#2563EB] bg-blue-50/35 dark:bg-blue-500/10'
                                                : 'border-slate-200/70 dark:border-white/[0.07] bg-slate-50/60 dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20'
                                          }`}
                                       >
                                          <div className={`mt-0.5 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${active ? 'border-[#2563EB]' : 'border-slate-300 dark:border-neutral-600'}`}>
                                             {active && <div className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                                          </div>
                                          <div>
                                             <div className="text-[13.5px] font-semibold text-slate-900 dark:text-white">{opt.title}</div>
                                             <div className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">{opt.desc}</div>
                                          </div>
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>

                           {/* Card 2: Channel Guidelines */}
                           <div className="rounded-[22px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-4">
                              <div>
                                 <h3 className="text-[14.5px] font-bold text-slate-900 dark:text-white tracking-tight">
                                    Channel Guidelines
                                 </h3>
                                 <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                                    Displayed to traders before they join your channel.
                                 </p>
                              </div>

                              <textarea
                                 rows={4}
                                 value={channelRules}
                                 onChange={e => setChannelRules(e.target.value)}
                                 className="w-full p-3.5 rounded-xl bg-[#F4F5F8] dark:bg-[#232329] border border-slate-200/80 dark:border-white/[0.08] text-[13px] text-slate-800 dark:text-white outline-none resize-none focus:border-[#2563EB] focus:bg-white dark:focus:bg-[#1E1E24] placeholder:text-slate-400 transition-colors"
                                 placeholder="Set the rules and guidelines for your channel..."
                              />

                              <div className="flex justify-end">
                                 <button
                                    type="button"
                                    onClick={() => {
                                       localStorage.setItem(`tradifive_channel_rules_${globalUserId || 'default'}`, channelRules);
                                       toast.success('Channel guidelines saved!');
                                    }}
                                    className="h-9 px-5 rounded-full bg-[#2563EB] hover:bg-blue-700 text-white text-[12.5px] font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
                                 >
                                    Save Guidelines
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {/* TAB 12: CREATOR / BUSINESS ACCOUNT */}
                     {activeTab === 'creator' && (
                        <motion.div
                           key="creator"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="space-y-5 w-full max-w-[820px]"
                        >
                           <CreatorTab 
                              privacySettings={privacySettings}
                              setPrivacySettings={setPrivacySettings}
                              creatorHandle={creatorHandle}
                              setCreatorHandle={setCreatorHandle}
                              creatorCategory={creatorCategory}
                              setCreatorCategory={setCreatorCategory}
                              creatorBio={creatorBio}
                              setCreatorBio={setCreatorBio}
                              profile={profile}
                              selectedPlan={selectedPlan}
                           />
                        </motion.div>
                     )}

                     {/* TAB 13: HELP CENTER */}
                     {activeTab === 'help' && (
                        <motion.div
                           key="help"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="w-full max-w-[820px]"
                        >
                           <HelpTab />
                        </motion.div>
                     )}

                     {/* TAB 14: REPORT A PROBLEM */}
                     {activeTab === 'report' && (
                        <motion.div
                           key="report"
                           initial={{ opacity: 0, y: 6 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -6 }}
                           transition={{ duration: 0.16, ease: "easeOut" }}
                           className="w-full max-w-[820px]"
                        >
                           <ReportTab />
                        </motion.div>
                     )}

                  </AnimatePresence>
                  </div>

               </div>
            </div>

            </div>

         </div>

         {/* EDIT PROFILE DETAILS MODAL */}
         <AnimatePresence>
            {isEditModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-[#333333] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                  >
                     <div className="p-6 border-b border-slate-100 dark:border-[#333333] flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-250">
                           <X size={20} />
                        </button>
                     </div>
                     <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); setIsEditModalOpen(false); }} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">First Name</label>
                              <AnimatedInput type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Last Name</label>
                              <AnimatedInput type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Username</label>
                           <AnimatedInput type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Email</label>
                           <AnimatedInput type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Address</label>
                              <AnimatedInput type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">City</label>
                              <AnimatedInput type="text" value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">State</label>
                              <AnimatedInput type="text" value={profile.state || ''} onChange={e => setProfile({...profile, state: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Zip Code</label>
                              <AnimatedInput type="text" value={profile.zipCode || ''} onChange={e => setProfile({...profile, zipCode: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Country</label>
                              <AnimatedInput type="text" value={profile.country || ''} onChange={e => setProfile({...profile, country: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Date of Birth</label>
                              <AnimatedInput type="text" value={profile.dob || ''} onChange={e => setProfile({...profile, dob: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Gender</label>
                              <AnimatedInput type="text" value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-[#333333] flex justify-end items-center gap-3">
                           <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-[#2C2C2E] text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-colors">Cancel</button>
                           <ConsistencyToggleButton 
                              label="Save Details" 
                              checked={true} 
                              type="submit" 
                           />
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* PHONE VERIFICATION MODAL */}
         <AnimatePresence>
            {showSmsModal && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.96, y: 6 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.96, y: 6 }}
                     transition={{ duration: 0.16, ease: "easeOut" }}
                     className="bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/10 rounded-[22px] w-full max-w-md overflow-hidden shadow-2xl p-6"
                  >
                     <div className="flex justify-between items-center mb-2">
                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white tracking-tight">Phone Number</h3>
                        <button type="button" onClick={() => setShowSmsModal(false)} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer">
                           <X size={16} />
                        </button>
                     </div>
                     <p className="text-[12px] text-slate-500 dark:text-neutral-400 mb-4">Save your mobile number for account recovery and security alerts.</p>
                     <div className="space-y-4">
                        <div>
                           <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">Phone Number</label>
                           <AnimatedInput
                              type="tel"
                              value={phoneDraft}
                              onChange={(e) => setPhoneDraft(e.target.value)}
                              placeholder="Enter phone number with country code"
                              className="w-full bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-all"
                           />
                        </div>
                        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
                           <button
                              type="button"
                              disabled={isSavingPhone}
                              onClick={() => setShowSmsModal(false)}
                              className="tactile-white-pill rounded-full px-4 py-2 text-xs font-semibold cursor-pointer"
                           >
                              Cancel
                           </button>
                           <button
                              type="button"
                              disabled={isSavingPhone}
                              onClick={async () => {
                                 const cleaned = phoneDraft.trim();
                                 if (!cleaned || cleaned.replace(/\D/g, '').length < 7) {
                                    toast.error("Please enter a valid phone number.");
                                    return;
                                 }
                                 setIsSavingPhone(true);
                                 try {
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (user) {
                                       await supabase.from('profiles').update({ phone: cleaned } as any).eq('id', user.id);
                                    }
                                    setProfile((prev: any) => ({ ...prev, phone: cleaned }));
                                    toast.success("Phone number saved successfully!");
                                    setShowSmsModal(false);
                                 } catch (err: any) {
                                    toast.error(err?.message || "Failed to save phone number.");
                                 } finally {
                                    setIsSavingPhone(false);
                                 }
                              }}
                              className="rounded-full px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                           >
                              {isSavingPhone ? "Saving..." : "Save Number"}
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
           <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#333333] shadow-2xl rounded-2xl p-6">
             <DialogHeader>
               <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <LogOut className="text-red-500" size={24} />
                 Confirm Logout
               </DialogTitle>
               <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                 Are you sure you want to log out? You will need to log in again to access your account.
               </DialogDescription>
             </DialogHeader>
             <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
               <button 
                 type="button" 
                 onClick={() => setShowLogoutConfirm(false)}
                 className="h-[38px] px-5 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#222226] text-slate-700 dark:text-slate-200 font-semibold text-[13.5px] hover:bg-slate-50 dark:hover:bg-[#2b2b30] transition-all duration-150 active:scale-[0.985] shadow-sm"
               >
                 Cancel
               </button>
               <button 
                 type="button" 
                 onClick={async () => {
                   setShowLogoutConfirm(false);
                   setIsLoggingOut(true);
                   await performAppLogout('/login?logout=true');
                 }}
                 className="h-[38px] px-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-[13.5px] transition-all duration-150 active:scale-[0.985] shadow-sm shadow-rose-500/25 flex items-center justify-center min-w-[105px]"
               >
                 {isLoggingOut ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                   "Log Out"
                 )}
               </button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

               {/* Plan Downgrade Confirmation Dialog */}
         <Dialog open={!!downgradeModalPlan} onOpenChange={(open) => !open && setDowngradeModalPlan(null)}>
           <DialogContent className="sm:max-w-[440px] bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#333333] shadow-2xl rounded-3xl p-7 text-slate-900 dark:text-white">
             <DialogHeader>
               <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                 <AlertCircle size={24} />
               </div>
               <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                 Downgrade to {downgradeModalPlan === 'starter' ? 'Free Plan (₹0)' : 'Pro Plan (₹1,399/mo)'}?
               </DialogTitle>
               <DialogDescription className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                 {downgradeModalPlan === 'starter'
                   ? 'By switching to the Free plan, your broker connections will be limited to 1, daily AI credits will revert to 20/day, and automated execution features will be paused.'
                   : 'By downgrading to Pro (₹1,399/mo), broker connections will be set to 6 and AI credits will be 100/day.'}
               </DialogDescription>
             </DialogHeader>
             <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2.5 sm:justify-end">
               <TactileBoxButton 
                 onClick={() => setDowngradeModalPlan(null)}
                 disabled={isChangingPlan}
                 className="h-10 px-5 rounded-xl font-semibold text-xs"
               >
                 Keep Current Plan
               </TactileBoxButton>
               <button 
                 type="button" 
                 disabled={isChangingPlan}
                 onClick={() => downgradeModalPlan && applyPlanChange(downgradeModalPlan)}
                 className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
               >
                 {isChangingPlan ? (
                   <>
                     <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     Updating...
                   </>
                 ) : (
                   'Confirm Downgrade'
                 )}
               </button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

</motion.div>
      </DashboardLayout>
   );
}

