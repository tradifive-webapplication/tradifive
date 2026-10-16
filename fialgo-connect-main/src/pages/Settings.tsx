import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../theme-switch.css';
import DashboardLayout from '@/components/DashboardLayout';
import logoOnly from '@/assets/Logo_only.png';
import defaultAvatar from '@/assets/default-avatar.svg';
import AccountTab from '@/components/settings/AccountTab';
import ProfileTab from '@/components/settings/ProfileTab';
import HelpTab from '@/components/settings/HelpTab';
import ReportTab from '@/components/settings/ReportTab';
import CreatorTab from '@/components/settings/CreatorTab';
import { supabase } from '@/lib/supabase';
import { useMarket } from '@/contexts/MarketContext';
import { toast } from 'sonner';
import { applyThemeWithTransition } from '@/utils/themeTransition';
import { getGamificationState, saveGamificationState } from '@/utils/gamification';
import { validateUsername } from '@/utils/usernameValidation';
import { PricingCards } from '@/components/PricingCards';
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
   AlertTriangle, Palette, Mail, Link2, Info, Crown, CreditCard, MessageSquare, LogOut
, ChevronLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Category, Notification, Star, Swap, TicketStar, Wallet, Chat, InfoCircle, Danger, Logout, Edit, Search, ChevronRight } from 'react-iconly';
import { useAICoachData } from '@/hooks/useAICoachData';

const TAB_TITLES: Record<string, string> = {
   account: "My Account",
   general: "General Details",
   profile: "Edit Profile & Privacy",
   security: "Account & Security",
   privacy: "Privacy & Community",
   appearance: "Theme",
   notifications: "Notifications",
   ai: "AI Assistant",
   trading: "Broker & Integrations",
   subscription: "Subscription",
   channel: "Channel Settings",
   creator: "Creator Account",
   help: "Help Center",
   report: "Report a Problem",
   terms: "Terms & Policies"
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

   const normalizeTab = (rawTab: string | null) => {
      if (!rawTab) return 'account';
      if (rawTab === 'plan') return 'subscription';
      if (rawTab === 'profiles') return 'profile';
      if (rawTab === 'File Setup') return 'trading';
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
   const [isInitialLoading, setIsInitialLoading] = useState(true);
   const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
   
   // Billing State
   const [billingHistory, setBillingHistory] = useState<any[]>([]);
   const [loadingBilling, setLoadingBilling] = useState(true);
   
   // Modals State
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [showSmsModal, setShowSmsModal] = useState(false);
   const [isConnectingBroker, setIsConnectingBroker] = useState(false);
   const [selectedBrokerToConnect, setSelectedBrokerToConnect] = useState('');
   
   // Profile State
   const [profile, setProfile] = useState({
      firstName: '',
      lastName: '',
      name: '',
      display_name: '',
      username: '',
      email: '',
      avatarUrl: '',
      bannerUrl: '',
      bio: '',
      website: '',
      twitter: '',
      instagram: '',
      youtube: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      dob: '',
      gender: '',
      countryEmoji: '🌍',
      isPrivate: false,
      hideFollowers: false,
      hideTrades: false,
      account_standing: 'GOOD',
      standing_message: '',
      preferred_market: 'global'
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

   // Notifications State
   const [globalOff, setGlobalOff] = useState(false);
   const [globalEmailOnly, setGlobalEmailOnly] = useState(false);
   const [notifications, setNotifications] = useState({
      messages: [
         { id: 'direct', label: 'Direct Messages', push: true, app: true, email: false },
         { id: 'group', label: 'Group Messages', push: true, app: true, email: false },
         { id: 'mentions', label: 'Mentions & Tags', push: true, app: true, email: true },
      ],
      text: [
         { id: 'sms_alerts', label: 'SMS Security Alerts', push: true, app: false, email: false },
         { id: 'push_marketing', label: 'Push Marketing & Promos', push: false, app: false, email: false },
      ],
      alerts: [
         { id: 'trade', label: 'Trade Execution Alerts', push: true, app: true, email: true },
         { id: 'price', label: 'Price Drops & Spikes', push: true, app: true, email: false },
         { id: 'risk', label: 'Risk Guard Warnings', push: true, app: true, email: true },
      ],
      ai_coach: [
         { id: 'insights', label: 'AI Coach Insights', push: true, app: true, email: false },
         { id: 'weekly_report', label: 'Weekly Performance Reports', push: false, app: true, email: true },
      ],
      channels: [
         { id: 'announcements', label: 'Channel Announcements', push: true, app: true, email: true },
         { id: 'replies', label: 'Replies & Threads', push: true, app: true, email: false },
      ],
      inboxes: [
         { id: 'news', label: 'Community News', push: false, app: true, email: true },
         { id: 'invites', label: 'Friend & Group Invites', push: true, app: true, email: false },
      ]
   });

    // Appearance State
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
   const [accentColor, setAccentColor] = useState('blue');
   const [layoutDensity, setLayoutDensity] = useState('comfortable');
   const [terminalLogging, setTerminalLogging] = useState(false);
   const [fullScreenLayout, setFullScreenLayout] = useState(() => localStorage.getItem('fialgo_full_screen') === 'true');

   // New Tab States
   const [language, setLanguage] = useState('en');
   const [aiTone, setAiTone] = useState('strict');
   const [aiVoice, setAiVoice] = useState('female');
   const [aiFrequency, setAiFrequency] = useState('medium');
   const [connectedBroker, setConnectedBroker] = useState<string>('');
   const [brokerApiKey, setBrokerApiKey] = useState('');
   const [brokerClientId, setBrokerClientId] = useState('');
   const [isSyncing, setIsSyncing] = useState(false);
   
   const [bgFadeStyle, setBgFadeStyle] = useState(() => localStorage.getItem('fialgo_bg_fade_style') || 'purple');
   const [lastSyncedTime, setLastSyncedTime] = useState('Just now');
   const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
   
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
                                   } catch (__) {}
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
                     
                     const limits = { starter: 20, pro: 100, elite: 350, institutional: 1000 };
                     const newMax = limits[plan as keyof typeof limits] || 100;
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
            
            const limits = { starter: 20, pro: 100, elite: 350, institutional: 1000 };
            const max = limits[currentPlan as keyof typeof limits] || 20;
            
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
               setProfile({
                  firstName: data.first_name || '',
                  lastName: data.last_name || '',
                  name: data.display_name || data.first_name || '',
                  display_name: data.display_name || data.first_name || '',
                  username: data.username || '',
                  email: user.email || '',
                  avatarUrl: data.avatar_url || '',
                  bannerUrl: data.banner_url || '',
                  bio: data.bio || '',
                  tags: data.trading_style ? data.trading_style.split(',') : [],
                  website: data.website || '',
                  twitter: data.twitter_url || '',
                  instagram: data.instagram_url || '',
                  youtube: data.youtube_url || '',
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

            // Fetch broker connections
            try {
               const { data: brokerData } = await supabase
                  .from('broker_connections')
                  .select('*')
                  .eq('user_id', user.id);
               if (brokerData && brokerData.length > 0) {
                  setConnectedBroker(brokerData[0].broker_name);
                  setBrokerClientId(brokerData[0].client_id || '');
                  setBrokerApiKey(brokerData[0].api_key ? '••••••••••••••••' : '');
               }
            } catch (err) {
               console.error("Error fetching broker connections:", err);
            }
         }
      };
      fetchUserData().finally(() => setIsInitialLoading(false));
   }, []);

   const handleToggle = (category: string, id: string, type: 'app' | 'push' | 'email') => {
      setNotifications(prev => ({
         ...prev,
         [category]: (prev as any)[category].map((n: any) => 
            n.id === id ? { ...n, [type]: !n[type] } : n
         )
      }));
   };

   const handleGlobalOff = () => {
      const newState = !globalOff;
      setGlobalOff(newState);
      if (newState) setGlobalEmailOnly(false);
      
      const newNotifs = { ...notifications };
      Object.keys(newNotifs).forEach(key => {
         (newNotifs as any)[key] = (newNotifs as any)[key].map((n: any) => ({
            ...n, app: !newState, push: !newState, email: !newState
         }));
      });
      setNotifications(newNotifs);
   };

   const handleEmailOnly = () => {
      const newState = !globalEmailOnly;
      setGlobalEmailOnly(newState);
      if (newState) setGlobalOff(false);
      
      const newNotifs = { ...notifications };
      Object.keys(newNotifs).forEach(key => {
         (newNotifs as any)[key] = (newNotifs as any)[key].map((n: any) => ({
            ...n, app: !newState, push: !newState, email: true
         }));
      });
      setNotifications(newNotifs);
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
         
         const updatedCache = {
            id: user.id,
            first_name: profile.firstName,
            last_name: profile.lastName,
            display_name: profile.display_name !== undefined ? profile.display_name : (profile.name || `${profile.firstName} ${profile.lastName}`.trim()),
            username: effectiveUsername,
            avatar_url: profile.avatarUrl,
            banner_url: profile.bannerUrl,
            bio: profile.bio,
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
      
      const isGlobal = ['mt5', 'mt4', 'icmarkets', 'vantage', 'exness', 'xm'].includes(selectedBrokerToConnect);
      
      if (isGlobal) {
         setConnectedBroker(selectedBrokerToConnect);
         setIsConnectingBroker(false);
         toast.success(`Successfully connected to ${selectedBrokerToConnect.toUpperCase()}!`);
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
                let errorMessage = error?.message || 'Failed to generate consent app ID';
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
          setConnectedBroker('');
          toast.success('Disconnected broker account');
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

   // Define structural settings categories for left sidebar
   const sidebarSections = [
      {
         title: "My Account",
         items: [
            { 
               id: "account", 
               label: "Account", 
               icon: User,
               children: [
                  { id: "account-info", label: "Account Info" },
                  { id: "password-security", label: "Password & Security" },
                  { id: "account-standing", label: "Account Standing" },
                  { id: "family-center", label: "Family Center" }
               ]
            }
         ]
      },
      {
         title: "Personalization",
         items: [
            { id: "appearance", label: "Theme", icon: Category },
            { id: "notifications", label: "Notifications", icon: Notification }
         ]
      },
      {
         title: "AI & Tools",
         items: [
            { id: "ai", label: "AI Coach", icon: Sparkles },
            { id: "trading", label: "Broker & Integrations", icon: Swap }
         ]
      },
      {
         title: "Billing",
         items: [
            { id: "subscription", label: "Subscription", icon: Wallet }
         ]
      },
      {
         title: "Community & Channels",
         items: [
            { id: "channel", label: "Channel Settings", icon: Chat },
            { id: "creator", label: "Creator Account", icon: TicketStar }
         ]
      },
      {
         title: "Support",
         items: [
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

   const resizeImageFile = (file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<string> => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader();
         reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
               const canvas = document.createElement('canvas');
               let width = img.width;
               let height = img.height;

               if (width > height) {
                  if (width > maxWidth) {
                     height = Math.round((height * maxWidth) / width);
                     width = maxWidth;
                  }
               } else {
                  if (height > maxHeight) {
                     width = Math.round((width * maxHeight) / height);
                     height = maxHeight;
                  }
               }

               canvas.width = width;
               canvas.height = height;
               const ctx = canvas.getContext('2d');
               if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  resolve(canvas.toDataURL('image/jpeg', quality));
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
         transition={{ duration: 0.05, ease: "easeOut" }}
      >
         
         {/* Click outside backdrop container back to dashboard page (desktop/tablet only) */}
         <div className="absolute inset-0 hidden sm:block" onClick={handleCloseSettings} />

         {/* Centered Settings Dialog Modal Box */}
         <div className="relative w-full h-full sm:h-auto max-w-[1440px] max-h-full sm:max-h-[880px] rounded-none sm:rounded-[16px] bg-white dark:bg-[#121212] text-slate-800 dark:text-[#dbdee1] flex overflow-hidden shadow-2xl border-0 sm:border sm:border-slate-200/60 dark:sm:border-white/5 z-10 pb-16 md:pb-0">
            
            {/* LEFT SIDEBAR PANEL inside Modal */}
            <div className={`${mobileShowDetails ? 'hidden md:flex' : 'flex'} w-full md:w-64 bg-[#f2f3f5] dark:bg-[#1E1E1E] flex-col h-full border-r border-slate-200/60 dark:border-white/5 shrink-0`}>
               {/* Mobile Header for Settings Sidebar */}
               <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-slate-200/60 dark:border-white/5 bg-white dark:bg-[#1A1A1C] shrink-0">
                  <span className="text-[14px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">Settings</span>
                  <button onClick={handleCloseSettings} className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-white">
                     <X size={16} />
                  </button>
               </div>

               <div className="py-6 px-4 flex flex-col gap-4 h-full overflow-y-auto amazing-scrollbar">
                            {/* Mini Profile Display */}
                  <div 
                     onClick={() => {
                        setActiveTab('profile');
                        setMobileShowDetails(true);
                     }}
                     className="group bg-slate-200/50 dark:bg-[#121212] p-3 rounded-[16px] flex items-center gap-3 shadow-sm border border-slate-300/30 dark:border-transparent cursor-pointer hover:bg-slate-300/30 dark:hover:bg-[#292929]/50 transition-all"
                  >
                     <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-300 dark:bg-[#1E1E1E] shadow-inner">
                        <img 
                           src={profile.avatarUrl || defaultAvatar} 
                           alt="Avatar" 
                           className="w-full h-full object-cover" 
                           onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }}
                        />
                     </div>
                     <div className="min-w-0 flex-1 text-left">
                        <p className="text-[12px] font-semibold text-slate-800 dark:text-white truncate leading-tight">
                           {displayName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className="text-[11px] text-blue-500 dark:text-blue-400 font-bold tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                              edit profile
                           </span>
                           <Edit stroke="bold" set="curved" size={12} className="text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors" />
                        </div>
                     </div>
                     <div className="text-slate-500 dark:text-slate-400 p-1">
                        <User stroke="bold" set="curved" size={18} />
                     </div>
                  </div>

                  {/* Navigation Search Input */}
                  <div className="relative">
                     <Search stroke="bold" set="curved" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#949ba4]" size={14} />
                     <input 
                        type="text" 
                        placeholder="Search settings..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#e3e5e8] dark:bg-[#121212] border border-transparent text-[12px] placeholder:text-slate-500 text-slate-800 dark:text-slate-200 outline-none focus:bg-slate-100 dark:focus:bg-[#000000] transition-colors"
                     />
                     {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-655 dark:hover:text-slate-200">
                           Clear
                        </button>
                     )}
                  </div>

                  {/* Sections Iterations */}
                  <div className="space-y-4">
                     {filteredSections.map((section, idx) => (
                        <div key={idx}>
                           <h3 className="text-[12px] font-bold text-slate-550 dark:text-[#949ba4] uppercase tracking-wider mb-2 px-2">
                              {section.title}
                           </h3>
                           <div className="space-y-0.5">
                              {section.items.map((item: any) => {
                                 const isActive = activeTab === item.id;
                                 return (
                                    <div key={item.id} className="flex flex-col">
                                       <button
                                          onClick={async () => { 
                                             if (item.id === 'logout') {
                                                setShowLogoutConfirm(true);
                                             } else {
                                                setActiveTab(item.id); 
                                                setMobileShowDetails(true);
                                                if(item.children) setActiveSubTab(item.children[0].id); 
                                             }
                                          }}
                                          className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-[15px] font-medium transition-all duration-150 text-left ${
                                             item.id === 'logout'
                                             ? 'text-rose-500 hover:bg-rose-500/10 dark:hover:bg-rose-500/10'
                                             : isActive 
                                             ? 'bg-[#e3e5e8] dark:bg-[#3F4147]/60 text-slate-800 dark:text-white shadow-sm font-semibold' 
                                             : 'text-slate-600 dark:text-[#B5BAC1] hover:bg-[#e3e5e8]/60 dark:hover:bg-[#3F4147]/40 hover:text-slate-800 dark:hover:text-[#DBDEE1]'
                                          }`}
                                       >
                                          {item.icon === Sparkles ? (
                                             <item.icon size={20} className={item.id === 'logout' ? 'text-rose-500' : isActive ? 'text-indigo-650 dark:text-white' : ''} strokeWidth={isActive ? 2.5 : 1.5} />
                                          ) : (
                                             <item.icon 
                                                stroke={isActive ? "bold" : "regular"} 
                                                set="curved" 
                                                size={20} 
                                                className={item.id === 'logout' ? 'text-rose-500' : isActive ? 'text-indigo-650 dark:text-white' : ''} 
                                             />
                                          )}
                                          <span className={isActive ? "font-bold" : "font-medium"}>{item.label}</span>
                                       </button>
                                       {item.children && isActive && (
                                          <div className="mt-1.5 ml-4 pl-3.5 border-l border-slate-300 dark:border-white/5 flex flex-col gap-1.5 relative py-1">
                                             {item.children.map((child: any) => (
                                                <button
                                                   key={child.id}
                                                   onClick={() => {
                                                      setActiveSubTab(child.id);
                                                      setMobileShowDetails(true);
                                                      const el = document.getElementById(child.id);
                                                      const container = document.getElementById('settings-scroll-container');
                                                      if (el && container) {
                                                         container.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
                                                      }
                                                   }}
                                                   className={`relative text-left text-[14px] font-medium transition-colors py-1 ${
                                                      activeSubTab === child.id 
                                                      ? 'text-slate-800 dark:text-white' 
                                                      : 'text-slate-500 dark:text-[#B5BAC1] hover:text-slate-700 dark:hover:text-[#DBDEE1]'
                                                   }`}
                                                >
                                                   {activeSubTab === child.id && (
                                                      <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-slate-800 dark:bg-white rounded-r-full" />
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
                           {idx < filteredSections.length - 1 && section.title !== "Support" && (
                              <div className="h-[1px] bg-slate-300/40 dark:bg-white/5 my-3.5 mx-1.5" />
                           )}
                        </div>
                     ))}
                  </div>

                  <div className="mt-auto pt-4 pb-4 px-4 select-none border-t border-slate-150 dark:border-zinc-800/40">
                     <div className="flex items-center justify-between mb-3.5">
                        <span className="text-[10px] font-mono tracking-wider text-slate-400 dark:text-zinc-400 uppercase">v2.0.0 Stable</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-zinc-400 font-medium">
                           <span className="flex h-1.5 w-1.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                           </span>
                           Connected
                        </span>
                     </div>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-medium text-slate-400 dark:text-zinc-400">
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-zinc-300 hover:underline transition-colors">Privacy Policy</a>
                        <a href="/risk-disclosure" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-zinc-300 hover:underline transition-colors">Risk Disclosure</a>
                        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-zinc-300 hover:underline transition-colors">Terms of Service</a>
                        <a href="/cookie-policy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-zinc-300 hover:underline transition-colors">Cookie Policy</a>
                        <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-zinc-300 hover:underline transition-colors">Refund Policy</a>
                        <a href="/aml-kyc-policy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-zinc-300 hover:underline transition-colors">AML & KYC</a>
                     </div>
                  </div>
               </div>
            </div>

            {/* RIGHT CONTENT PANEL inside Modal */}
            <div className={`${mobileShowDetails ? 'flex' : 'hidden md:flex'} flex-1 bg-white dark:bg-[#121212] h-full overflow-hidden relative flex flex-col`}>
               
               {/* Fixed Header outside the scrollable container at the top */}
               <div className="bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-sm px-4 sm:px-6 md:px-8 py-3 border-b border-slate-150 dark:border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                     {/* Mobile Back Button to return to Settings Sidebar */}
                     <button
                        type="button"
                        onClick={() => setMobileShowDetails(false)}
                        className="flex md:hidden items-center gap-1 text-[13px] font-bold text-blue-600 dark:text-blue-400 py-1 px-2 -ml-2 rounded-lg hover:bg-blue-50 dark:hover:bg-white/5 transition-colors shrink-0"
                     >
                        <ChevronLeft size={18} />
                        <span>Settings</span>
                     </button>
                     <h1 className="text-[13px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider truncate">
                        {headerTitle}
                     </h1>
                  </div>
                  
                  <button
                      onClick={handleCloseSettings}
                      className="group flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none text-slate-450 hover:text-rose-500 dark:hover:text-rose-400 transition-all hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#FCA5A5] dark:hover:shadow-none active:scale-95 shrink-0"
                      title="Close Settings"
                   >
                      <X size={15} className="transition-transform group-hover:rotate-90 duration-200" />
                   </button>
               </div>

               {/* Scrollable Content Container */}
               <div id="settings-scroll-container" className="w-full flex-1 overflow-y-auto amazing-scrollbar scroll-smooth">

                  {/* Scrollable Content wrapper with padding */}
                  <div className="w-full mx-auto pt-4 sm:pt-10 px-3 sm:px-10 pb-28 sm:pb-12 space-y-6">
                     <AnimatePresence mode="wait">

                     {/* TAB 0: ACCOUNT SETTINGS */}
                     {activeTab === 'account' && (
                        <motion.div
                           key="account"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-6 w-full max-w-[740px] mx-auto"
                        >
                           <AccountTab 
                              profile={profile}
                              isInitialLoading={isInitialLoading}
                              setActiveSubTab={setActiveSubTab} 
                              onEditProfile={() => setActiveTab('profile')}
                              onEditPhone={() => setShowSmsModal(true)}
                           />
                        </motion.div>
                     )}

                     {/* TAB 1: PROFILE INFORMATION & PRIVACY */}
                     {activeTab === 'profile' && (
                        <motion.div
                           key="profile"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-6 w-full max-w-[1100px] mx-auto"
                        >


                           <ProfileTab 
                              profile={profile} 
                              setProfile={setProfile} 
                              privacySettings={privacySettings} 
                              setPrivacySettings={setPrivacySettings} 
                              avatarUploadRef={avatarUploadRef} 
                              bannerUploadRef={bannerUploadRef} 
                              isInitialLoading={isInitialLoading}
                           />

                           {/* Hidden inputs triggers */}
                           <input type="file" ref={avatarUploadRef} accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 try {
                                    const base64 = await resizeImageFile(file, 250, 250, 0.8);
                                    setProfile(p => ({...p, avatarUrl: base64}));
                                 } catch (err) {
                                    console.error("Failed to resize avatar", err);
                                 }
                              }
                           }} />
                           <input type="file" ref={bannerUploadRef} accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 try {
                                    const base64 = await resizeImageFile(file, 800, 400, 0.8);
                                    setProfile(p => ({...p, bannerUrl: base64}));
                                 } catch (err) {
                                    console.error("Failed to resize banner", err);
                                 }
                              }
                           }} />

                           <div className="flex justify-end items-center pt-6 pb-4 border-t border-slate-200/60 dark:border-slate-800">
                              <button 
                                 type="button"
                                 onClick={() => handleUpdateProfile()}
                                 disabled={loading}
                                 className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                 {loading ? 'Saving...' : 'Save Profile Changes'}
                              </button>
                           </div>

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

                     {/* TAB 4: APPEARANCE */}
                     {activeTab === 'appearance' && (
                        <motion.div
                           key="appearance"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-6 w-full max-w-[740px] mx-auto"
                        >
                           <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-[#3f4147] pb-4">
                              Theme
                           </h2>
                           <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-4">
                              Customize how the app looks and feels across all your devices. Tweak lighting, colors, and layout density to create your perfect workspace.
                           </p>

                           {/* Color Theme Box */}
                           <div className="bg-slate-50 dark:bg-[#151515] p-5 rounded-2xl border border-slate-200 dark:border-[#2a2a2a] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 rounded-full bg-slate-200/60 dark:bg-[#202022] flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                 </div>
                                 <div className="space-y-1">
                                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">Global Color Theme</h3>
                                    <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] max-w-md">
                                       Toggles the full lighting environment across the entire application interface. Changes are applied instantly.
                                    </p>
                                 </div>
                              </div>
                              <ThemeSwitch checked={theme === 'dark'} onChange={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')} />
                           </div>

                           {/* Full Screen Layout Box */}
                           <div className="bg-slate-50 dark:bg-[#151515] p-5 rounded-2xl border border-slate-200 dark:border-[#2a2a2a] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mt-4">
                              <div className="flex gap-4">
                                 <div className="w-10 h-10 rounded-full bg-slate-200/60 dark:bg-[#202022] flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                                    <Monitor size={18} />
                                 </div>
                                 <div className="space-y-1">
                                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">Immersive Full Screen</h3>
                                    <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] max-w-md">
                                       Removes the rounded curves and margin padding, stretching the content to fill the entire screen for a more immersive experience.
                                    </p>
                                 </div>
                              </div>
                              <SettingsToggle checked={fullScreenLayout} onChange={handleFullScreenChange} />
                           </div>
                           
                           {/* Background Fade Theme Box */}
                           <div className={`bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm flex-col md:flex-row md:items-center justify-between gap-6 mt-4 ${theme === 'dark' ? 'hidden' : 'flex'} dark:hidden`}>
                                 <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center shrink-0 text-slate-600">
                                       <Palette size={18} />
                                    </div>
                                    <div className="space-y-1">
                                       <h3 className="text-[16px] font-bold text-slate-900 mb-1">Background Fade Style</h3>
                                       <p className="text-[13px] text-slate-500 max-w-md">
                                          Customize the background gradient color. Choose from various subtle fades to suit your preference in light mode.
                                       </p>
                                    </div>
                                 </div>
                                 <div className="relative w-[140px]">
                                    <Select
                                       value={bgFadeStyle}
                                       onValueChange={(value) => {
                                          setBgFadeStyle(value);
                                          localStorage.setItem("fialgo_bg_fade_style", value);
                                          window.dispatchEvent(new Event("fialgo_bg_style_changed"));
                                       }}
                                    >
                                       <SelectTrigger className="w-full bg-white border border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl h-10 shadow-sm focus:ring-2 focus:ring-indigo-500/50">
                                          <SelectValue placeholder="Select Fade" />
                                       </SelectTrigger>
                                       <SelectContent className="bg-white border-slate-200 rounded-xl shadow-lg z-[9999]">
                                          <SelectItem value="purple" className="text-[13px] font-semibold cursor-pointer">Purple Fade</SelectItem>
                                          <SelectItem value="gray" className="text-[13px] font-semibold cursor-pointer">Gray Fade</SelectItem>
                                          <SelectItem value="black" className="text-[13px] font-semibold cursor-pointer">Black Fade</SelectItem>
                                          <SelectItem value="blue" className="text-[13px] font-semibold cursor-pointer">Blue Fade</SelectItem>
                                          <SelectItem value="rose" className="text-[13px] font-semibold cursor-pointer">Rose Fade</SelectItem>
                                       </SelectContent>
                                    </Select>
                                 </div>
                           </div>

                        </motion.div>
                     )}


                     {/* TAB 6: NOTIFICATIONS */}
                     {activeTab === 'notifications' && (
                        <motion.div
                           key="notifications"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-6 w-full max-w-[740px] mx-auto"
                        >
                           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-[#3f4147] pb-4 mb-6">
                              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white">
                                 Notifications
                              </h2>
                              {/* Global Control Hub */}
                              <div className="flex items-center gap-3 text-[12px] font-bold">
                                 <button 
                                    onClick={handleGlobalOff} 
                                    className="group flex items-center justify-center gap-2 h-8 px-4 rounded-full border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-all hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#FCA5A5] dark:hover:shadow-none active:scale-95 shrink-0"
                                 >
                                    <Power size={14} className="transition-transform group-hover:scale-110 duration-200" /> Switch off all
                                 </button>
                                 <button 
                                    onClick={handleEmailOnly} 
                                    className="group flex items-center justify-center gap-2 h-8 px-4 rounded-full border-2 border-white dark:border-white/5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:bg-none dark:bg-[#1E1E1E] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-none text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#A5B4FC] dark:hover:shadow-none active:scale-95 shrink-0"
                                 >
                                    <Mail size={14} className="transition-transform group-hover:scale-110 duration-200" /> Email only
                                 </button>
                              </div>
                           </div>
                           <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-8">Configure push alerts, app notifications, security reminders, and emails.</p>

                           {/* Sections iteration */}
                           {[
                              { key: 'messages', title: 'Message Preferences', desc: 'Alerts for direct messages, groups, and @username mentions.', icon: MessageSquare },
                              { key: 'text', title: 'SMS Security Alerts', desc: 'Secure phone log alerts and promotional bulletins.', icon: Smartphone },
                              { key: 'alerts', title: 'Trading Execution Alerts', desc: 'Price ticks, target alerts, and risk guard parameters.', icon: AlertTriangle },
                              { key: 'ai_coach', title: 'AI Coach Notifications', desc: 'Insights, performance reports, and coaching suggestions.', icon: Brain },
                              { key: 'channels', title: 'Channels & Communities', desc: 'Announcements, replies, and channel activities.', icon: Hash },
                              { key: 'inboxes', title: 'Inboxes & Networking', desc: 'Friend requests, invites, and community news.', icon: Inbox }
                           ].map((section) => (
                              <div key={section.key} className="space-y-6 p-6 rounded-xl bg-slate-50 dark:bg-[#1a1b1e]">
                                 <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-[#1e1f22] rounded-full flex items-center justify-center shrink-0 text-[#DBDEE1]">
                                       <section.icon size={18} />
                                    </div>
                                    <div>
                                       <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">{section.title}</h3>
                                       <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1]">{section.desc}</p>
                                    </div>
                                 </div>

                                 <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-[#80848e] uppercase tracking-wider mb-2">
                                       <span>Event Type</span>
                                       <div className="flex text-center w-48 justify-end">
                                          <span className="w-16">Push</span>
                                          <span className="w-16">App</span>
                                          <span className="w-16">Email</span>
                                       </div>
                                    </div>

                                    {(notifications as any)[section.key].map((notif: any) => (
                                       <div key={notif.id} className="flex items-center justify-between py-2 group">
                                          <span className="text-[15px] font-medium text-slate-800 dark:text-[#DBDEE1] pr-4">{notif.label}</span>
                                          <div className="flex justify-end w-48 shrink-0">
                                             <div className="w-16 flex justify-center">
                                                <AnimatedCheckbox checked={notif.push} onChange={() => handleToggle(section.key, notif.id, 'push')} />
                                             </div>
                                             <div className="w-16 flex justify-center">
                                                <AnimatedCheckbox checked={notif.app} onChange={() => handleToggle(section.key, notif.id, 'app')} />
                                             </div>
                                             <div className="w-16 flex justify-center">
                                                <AnimatedCheckbox checked={notif.email} onChange={() => handleToggle(section.key, notif.id, 'email')} />
                                             </div>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                        </motion.div>
                     )}

                     {/* TAB 7: AI ASSISTANT */}
                     {activeTab === 'ai' && (
                        <motion.div
                           key="ai"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-6 w-full max-w-[740px] mx-auto"
                        >
                           <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-[#3f4147] pb-4">
                              AI Assistant
                           </h2>
                           <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-8">Configure your AI Coach's tone, voice, and analysis frequency.</p>

                           {/* AI Credits Card */}
                           <div className="p-6 rounded-xl border-2 border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                 <div className="space-y-1">
                                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                       <Sparkles size={16} className="text-indigo-600" /> AI Usage & Credits
                                    </h3>
                                    <p className="text-[13px] text-slate-600 dark:text-slate-400 max-w-md">
                                       Your {activePlan.charAt(0).toUpperCase() + activePlan.slice(1)} plan includes high-tier AI inference bandwidth. Each prompt consumes 1 credit.
                                    </p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                                       {aiCredits} <span className="text-sm font-semibold text-slate-500">/ {activeMaxCredits}</span>
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Credits Remaining</p>
                                 </div>
                              </div>
                                    <div className="w-full bg-indigo-200 dark:bg-indigo-950/50 rounded-full h-2 mt-2">
                                       <div 
                                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" 
                                          style={{ width: `${Math.min(100, Math.max(0, (aiCredits / activeMaxCredits) * 100))}%` }}
                                       />
                                    </div>
                                    <div className="space-y-4">
                                       <div className="mt-4 p-4 rounded-xl bg-white dark:bg-black/20 border border-slate-200/50 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                                          <div className="space-y-1">
                                             <h4 className="text-sm font-black text-slate-800 dark:text-white">Need More Daily Credits?</h4>
                                             <p className="text-[11px] text-slate-500 font-semibold">Your plan provides a strict daily credit quota. Upgrading your subscription plan increases your daily allowance immediately.</p>
                                          </div>
                                          <button 
                                             onClick={() => navigate('/upgrade')}
                                             className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-1 shrink-0"
                                          >
                                             View Plans <ArrowRight size={13} />
                                          </button>
                                       </div>
                                    </div>
                                 </div>


                              </motion.div>
                           )}

                           {/* TAB 8: BROKER & INTEGRATIONS */}
                           {activeTab === 'trading' && (
                              <motion.div
                                 key="trading"
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -10 }}
                                 transition={{ duration: 0.2 }}
                                 className="space-y-6 w-full max-w-[1100px] mx-auto"
                              >
                                       <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-[#3f4147] pb-4">
                                    Broker & Integrations
                                 </h2>
                                 <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-8">Manage your connected trading accounts and third-party integrations.</p>

                                 {/* Connected Brokers Box */}
                                 <div className={isConnectingBroker || selectedBrokerToConnect ? "w-full" : "bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm w-full overflow-hidden p-6 md:p-8"}>
                                    {!(isConnectingBroker || selectedBrokerToConnect) && (
                                       <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Connected Brokers</h3>
                                    )}
                                    
                                    {isConnectingBroker || selectedBrokerToConnect ? (
                                       <div className="bg-white dark:bg-[#111112] border border-slate-200/80 dark:border-white/5 rounded-[36px] shadow-[0_8px_40px_rgb(0,0,0,0.03)] w-full overflow-hidden p-6 md:p-10 relative">
                                          <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-white/5 pb-5">
                                             <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
                                                {!selectedBrokerToConnect ? 'Select A Broker' : `Connect ${selectedBrokerToConnect}`}
                                             </h3>
                                             <button type="button" onClick={() => {
                                                if (selectedBrokerToConnect) {
                                                   setSelectedBrokerToConnect('');
                                                } else {
                                                   setIsConnectingBroker(false);
                                                }
                                             }} className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all text-[13px] font-bold border border-slate-200/60 dark:border-white/5 active:scale-95 shadow-sm">
                                                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                                Back
                                             </button>
                                          </div>
                                          
                                          {!selectedBrokerToConnect ? (
                                             <div className="space-y-8">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                  <p className="text-[15px] text-slate-500 dark:text-[#949ba4] font-medium leading-relaxed max-w-2xl">
                                                     Select your trading platform or broker to sync your live accounts and start tracking your performance.
                                                  </p>
                                                </div>
                                                
                                                <div className="flex flex-wrap gap-5 md:gap-6">
                                                   {['zerodha', 'dhan', 'upstox', 'mt5', 'mt4', 'icmarkets', 'vantage', 'exness', 'xm'].filter(broker => { const isGlobal = ['mt5', 'mt4', 'icmarkets', 'vantage', 'exness', 'xm'].includes(broker); return activeMarket === 'indian' ? !isGlobal : isGlobal; }).map(broker => (
                                                      <button
                                                         key={broker}
                                                         onClick={() => setSelectedBrokerToConnect(broker)}
                                                         className={`group w-[150px] md:w-[160px] relative flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-slate-50/80 dark:from-[#1A1A24] dark:to-[#121215] border border-slate-200/80 dark:border-white/10 hover:border-${broker === 'zerodha' ? 'blue' : broker === 'dhan' ? 'yellow' : broker === 'upstox' ? 'purple' : 'indigo'}-500/50 rounded-[32px] transition-all duration-500 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)] hover:-translate-y-1 active:translate-y-0 active:scale-95 overflow-hidden`}
                                                      >
                                                         {/* Background Glow on Hover tailored to broker */}
                                                         <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${broker === 'zerodha' ? 'bg-blue-500/5' : broker === 'dhan' ? 'bg-yellow-500/5' : broker === 'upstox' ? 'bg-purple-500/5' : 'bg-indigo-500/5'}`} />
                                                         <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${broker === 'zerodha' ? 'bg-blue-400/20' : broker === 'dhan' ? 'bg-yellow-400/20' : broker === 'upstox' ? 'bg-purple-400/20' : 'bg-indigo-400/20'}`} />
                                                         
                                                         <div className={`relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white dark:bg-black/50 border border-slate-100 dark:border-white/5 rounded-[24px] shadow-sm mb-4 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 z-10 overflow-hidden`}>
                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />
                                                            {broker === 'mt5' || broker === 'mt4' ? (
                                                               <img src="/Mt5 logo.png" alt="MT" className="w-10 h-10 md:w-12 md:h-12 object-contain drop-shadow-lg" />
                                                            ) : (
                                                               <BrokerIcon name={broker} size={48} />
                                                            )}
                                                         </div>
                                                         
                                                         <span className={`relative z-10 text-[13px] md:text-[14px] font-black text-slate-800 dark:text-white capitalize text-center tracking-tight transition-colors duration-300 ${broker === 'zerodha' ? 'group-hover:text-blue-600 dark:group-hover:text-blue-400' : broker === 'dhan' ? 'group-hover:text-yellow-600 dark:group-hover:text-yellow-400' : broker === 'upstox' ? 'group-hover:text-purple-600 dark:group-hover:text-purple-400' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                                                            {broker === 'mt5' ? 'MetaTrader 5' : broker === 'mt4' ? 'MetaTrader 4' : broker === 'icmarkets' ? 'IC Markets' : broker}
                                                         </span>
                                                      </button>
                                                   ))}
                                                </div>

                                                {activeMarket !== 'indian' && (
                                                <div className="mt-10 bg-gradient-to-r from-[#EEF2FF] to-[#F8FAFC] dark:from-[#16161D] dark:to-[#111113] border border-indigo-100 dark:border-[#2A2A35] rounded-[24px] p-6 md:p-8 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                                                   <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-colors duration-500"></div>
                                                   <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5 md:gap-6">
                                                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-[18px] bg-indigo-500 dark:bg-indigo-500/20 shadow-[0_4px_20px_rgba(99,102,241,0.4)] dark:shadow-none border border-indigo-400 dark:border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                         <Sparkles size={28} className="text-white dark:text-indigo-400" />
                                                      </div>
                                                      <div className="flex-1">
                                                         <h4 className="text-[17px] md:text-[18px] font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Don't have an account?</h4>
                                                         <p className="text-[13.5px] text-slate-600 dark:text-[#949BA4] mb-5 sm:mb-0 leading-relaxed max-w-xl">
                                                            Sign up with our partners like <span className="font-bold text-indigo-600 dark:text-indigo-400">Vantage</span>, <span className="font-bold text-indigo-600 dark:text-indigo-400">Exness</span>, or <span className="font-bold text-indigo-600 dark:text-indigo-400">XM</span> to instantly get <span className="font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase text-[11px] tracking-wider ml-1">+500 XP</span> and exclusive platform benefits!
                                                         </p>
                                                      </div>
                                                      <button className="px-6 py-3 md:py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[13px] md:text-[14px] font-bold rounded-[14px] shadow-lg hover:shadow-xl transition-all active:scale-95 shrink-0 whitespace-nowrap">
                                                         View Partner Offers
                                                      </button>
                                                   </div>
                                                </div>
                                                )}
                                             </div>
                                          ) : (
                                             <>
                                                <p className="text-xs text-slate-505 mb-6 font-sans">
                                                   {selectedBrokerToConnect === 'dhan' 
                                                      ? "Link your Dhan account. Enter your Client ID to securely redirect and authorize TradiFive." 
                                                      : "Link your live trading account. Enter your secure API key or login credentials to pull transaction histories."}
                                                </p>
                                                
                                                <form onSubmit={handleConnectBrokerSubmit} className="space-y-4 max-w-md">
                                                   {selectedBrokerToConnect === 'icmarkets' || selectedBrokerToConnect === 'vantage' || selectedBrokerToConnect === 'exness' || selectedBrokerToConnect === 'xm' || selectedBrokerToConnect === 'mt5' || selectedBrokerToConnect === 'mt4' ? (
                                                      <>
                                                         <div>
                                                            <label className="text-xs font-bold text-slate-555 uppercase tracking-wide block mb-1">MT5 Login ID</label>
                                                            <input type="text" required placeholder="e.g. 98310842" className="w-full bg-white dark:bg-[#202020] border border-slate-300 dark:border-white/10 shadow-sm rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                                                         </div>
                                                         <div>
                                                            <label className="text-xs font-bold text-slate-555 uppercase tracking-wide block mb-1">MT5 Investor Password</label>
                                                            <input type="password" required className="w-full bg-white dark:bg-[#202020] border border-slate-300 dark:border-white/10 shadow-sm rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                                                         </div>
                                                         <div>
                                                            <label className="text-xs font-bold text-slate-555 uppercase tracking-wide block mb-1">Server</label>
                                                            <input type="text" required placeholder="e.g. Vantage-Live-1" className="w-full bg-white dark:bg-[#202020] border border-slate-300 dark:border-white/10 shadow-sm rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" />
                                                         </div>
                                                      </>
                                                   ) : (
                                                      <>
                                                         {selectedBrokerToConnect !== 'dhan' && (
                                                            <div>
                                                               <label className="text-xs font-bold text-slate-555 uppercase tracking-wide block mb-1">API Key Token</label>
                                                               <input 
                                                                  type="text" 
                                                                  required 
                                                                  value={brokerApiKey}
                                                                  onChange={(e) => setBrokerApiKey(e.target.value)}
                                                                  placeholder="KITE-XXXXX or UPSTOX-XXXXX" 
                                                                  className="w-full bg-white dark:bg-[#202020] border border-slate-300 dark:border-white/10 shadow-sm rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" 
                                                               />
                                                            </div>
                                                         )}
                                                         <div>
                                                            <label className="text-xs font-bold text-slate-555 uppercase tracking-wide block mb-1">Client ID</label>
                                                            <input 
                                                               type="text" 
                                                               required 
                                                               value={brokerClientId}
                                                               onChange={(e) => setBrokerClientId(e.target.value)}
                                                               placeholder={selectedBrokerToConnect === 'dhan' ? "e.g. 1000000000" : "User unique ID"} 
                                                               className="w-full bg-white dark:bg-[#202020] border border-slate-300 dark:border-white/10 shadow-sm rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all" 
                                                            />
                                                         </div>
                                                      </>
                                                   )}
                                                   <div className="flex justify-start gap-3 pt-6 mt-4">
                                                      <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2">
                                                         <Link2 size={18} />
                                                         Connect Account
                                                      </button>
                                                   </div>
                                                </form>
                                             </>
                                          )}
                                       </div>
                                    ) : connectedBroker ? (
                                       <>
                                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 rounded-[24px] bg-gradient-to-r from-[#FFFFFF] to-[#F8F9FA] dark:from-[#1C1C1E] dark:to-[#121214] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] transition-shadow mb-4">
                                          <div className="flex items-center gap-4">
                                             <div className="w-14 h-14 flex items-center justify-center bg-white dark:bg-black/40 border border-slate-100 dark:border-white/10 rounded-[14px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_2px_10px_rgba(255,255,255,0.02)] shrink-0">
                                                {connectedBroker === 'mt5' || connectedBroker === 'mt4' ? (
                                                   <img src="/Mt5 logo.png" alt="MT" className="w-9 h-9 object-contain drop-shadow-md" />
                                                ) : (
                                                   <BrokerIcon name={connectedBroker} size={36} />
                                                )}
                                             </div>
                                             <div>
                                                <div className="flex items-center gap-3">
                                                   <h4 className="text-[15px] md:text-[16px] font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
                                                      {connectedBroker === 'mt5' ? 'MetaTrader 5' : connectedBroker === 'mt4' ? 'MetaTrader 4' : connectedBroker}
                                                   </h4>
                                                   <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                                      Active Sync
                                                   </span>
                                                </div>
                                                <p className="text-[13px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">
                                                   {brokerClientId ? `Client ID • ${brokerClientId}` : 'Live Account • 892314902'}
                                                </p>
                                             </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                             <button 
                                                onClick={() => {
                                                   if (connectedBroker === 'dhan') {
                                                      window.open('https://hq.dhan.co/', '_blank');
                                                   } else if (connectedBroker === 'zerodha') {
                                                      window.open('https://kite.trade/', '_blank');
                                                   } else {
                                                      toast.info("Manage settings for this broker in their developer console.");
                                                   }
                                                }}
                                                className="flex-1 md:flex-none px-5 py-2.5 bg-slate-100 dark:bg-[#242428] hover:bg-slate-200 dark:hover:bg-[#2A2A2F] border border-slate-200 dark:border-transparent text-slate-800 dark:text-white text-[13px] font-bold rounded-[12px] transition-all active:scale-95 shadow-sm"
                                             >
                                                Manage
                                             </button>
                                             <button 
                                                onClick={handleDisconnectBroker}
                                                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[13px] font-bold rounded-[12px] transition-all active:scale-95"
                                             >
                                                Disconnect
                                             </button>
                                          </div>
                                       </div>
                                       <button 
                                          onClick={() => setIsConnectingBroker(true)}
                                          className="w-full py-6 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[24px] flex flex-col items-center justify-center text-slate-500 dark:text-[#949ba4] hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:border-indigo-300/50 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all group"
                                       >
                                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all text-slate-400 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                             <Plus size={22} />
                                          </div>
                                          <span className="text-[14px] font-extrabold tracking-tight">Connect Another Broker</span>
                                       </button>
                                       </>
                                    ) : (
                                       
                                          <div className="relative overflow-hidden flex flex-col items-center justify-center py-10 px-6 border border-slate-200/60 dark:border-white/5 rounded-[28px] bg-gradient-to-b from-white to-slate-50/50 dark:from-[#111112] dark:to-[#0A0A0B] text-slate-500 dark:text-slate-400 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                                          {/* Glowing Background Orbs */}
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
                                          
                                          <div className="relative mb-6">
                                             <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/20 blur-lg rounded-full" />
                                             <div className="relative w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-50 to-white dark:from-[#1A1A24] dark:to-[#121215] border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-[0_4px_12px_rgba(99,102,241,0.12)] rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                                                <Link2 size={24} strokeWidth={2.5} />
                                             </div>
                                          </div>
                                          
                                          <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight z-10">No Broker Connected</h4>
                                          <p className="text-[14px] mb-8 max-w-md text-center text-slate-500 dark:text-[#8B92A0] leading-relaxed font-medium z-10">
                                             Link your trading account to unlock real-time performance tracking, automated journaling, and advanced AI risk management.
                                          </p>
                                          
                                          <button 
                                             onClick={() => setIsConnectingBroker(true)}
                                             className="relative group px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[16px] text-[14px] font-bold transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_8px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 overflow-hidden z-10"
                                          >
                                             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                             <span className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                                                <Plus size={18} strokeWidth={3} />
                                                Connect Your Broker
                                             </span>
                                          </button>
                                          
                                          <div className="mt-8 flex items-center gap-5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 z-10 bg-slate-100/50 dark:bg-black/20 px-5 py-2.5 rounded-full border border-slate-200 dark:border-white/5">
                                             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"/><span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Zerodha</span></div>
                                             <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]"/><span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Dhan</span></div>
                                             <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                             <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"/><span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Upstox</span></div>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              </motion.div>
                           )}



                     {/* TAB 10: SUBSCRIPTION MANAGEMENT */}
                     {activeTab === 'subscription' && (
                        <motion.div
                           key="subscription"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-6 w-full max-w-[740px] mx-auto"
                        >
                           <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-[#3f4147] pb-4">
                              <div>
                                 <h2 className="text-[20px] font-bold text-slate-900 dark:text-white">Subscription & Billing</h2>
                                 <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mt-1">Manage your plan, payment methods, and billing history.</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 <button 
                                    className="px-5 py-2.5 border border-rose-200/80 dark:border-rose-950/30 bg-rose-50/50 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:hover:bg-rose-950/35 text-[#E23939] dark:text-rose-400 text-[12px] font-bold rounded-full transition-all shadow-sm"
                                 >
                                    Cancel Plan
                                 </button>
                                 <button 
                                    onClick={() => navigate('/upgrade')}
                                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-[12px] font-bold rounded-full border-none transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98]"
                                 >
                                    Upgrade
                                 </button>
                              </div>
                           </div>

                           <div className="flex flex-col gap-6">
                              {/* Current Plan Overview */}
                              <div className="p-6 rounded-[20px] bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 relative overflow-hidden shadow-sm">
                                 
                                 <div className="flex items-start justify-between relative z-10 mb-8">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                          <Crown size={24} className="text-white" />
                                       </div>
                                       <div>
                                          <h3 className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-0.5">
                                             {activePlan.charAt(0).toUpperCase() + activePlan.slice(1)} 
                                             <span className="px-2 py-0.5 rounded text-emerald-500 text-[10px] font-bold uppercase tracking-wide border border-emerald-500/30 ml-1">Active</span>
                                          </h3>
                                          <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1]">
                                             {activePlan === 'starter' ? 'Free plan active.' : 'Billed monthly. Auto-renews soon.'}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <div className="text-[24px] font-black text-slate-900 dark:text-white">
                                          {activePlan === 'starter' ? '₹0' : activePlan === 'pro' ? '₹1,499' : activePlan === 'elite' ? '₹2,999' : '₹0'}
                                       </div>
                                       <div className="text-[12px] text-slate-500 font-medium">per month</div>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4 relative z-10">
                                    <div className="p-4 rounded-[16px] border border-slate-200 dark:border-[#2b2d31] bg-transparent">
                                       <div className="text-[12px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider mb-1">API Requests</div>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[15px] font-medium text-slate-800 dark:text-[#DBDEE1]">Unlimited</span>
                                          <span className="text-[12px] text-emerald-500 font-medium">Included</span>
                                       </div>
                                    </div>
                                    <div className="p-4 rounded-[16px] border border-slate-200 dark:border-[#2b2d31] bg-transparent">
                                       <div className="text-[12px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider mb-1">Brokers Linked</div>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[15px] font-medium text-slate-800 dark:text-[#DBDEE1]">
                                             {connectedBroker ? '1' : '0'}
                                          </span>
                                          <span className="text-[12px] text-slate-500 dark:text-[#B5BAC1] font-medium">
                                             / {selectedPlan === 'starter' ? '1' : selectedPlan === 'pro' ? '6' : 'Unlimited'} Active
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Payment Method */}
                              <div className="p-6 rounded-[20px] bg-white dark:bg-[#151515] border border-slate-200/80 dark:border-white/5 flex flex-col relative overflow-hidden shadow-sm">
                                 <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
                                    <CreditCard size={16} className="text-indigo-500" /> Payment Method
                                 </h3>
                                 
                                 <div className="flex-1 relative z-10">
                                    <div className="p-8 bg-transparent rounded-[16px] border border-slate-200 border-dashed dark:border-[#2b2d31] flex flex-col items-center justify-center text-center">
                                       <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
                                          <CreditCard size={20} className="text-slate-400" />
                                       </div>
                                       <span className="text-[14px] font-bold text-slate-800 dark:text-[#DBDEE1] block">No payment method</span>
                                       <span className="text-[12px] text-slate-500 dark:text-[#B5BAC1] block mt-1 max-w-[200px]">You haven't linked a card or UPI id yet.</span>
                                    </div>
                                 </div>
                                 
                                 <button 
                                    onClick={() => { toast.info("Razorpay payment gateway integration is pending."); }}
                                    className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-[12px] font-bold rounded-full border-none transition-all text-center flex items-center justify-center gap-2 relative z-10 shadow-sm"
                                 >
                                    <Plus size={14} /> Add Payment Method
                                 </button>
                              </div>
                           </div>

                           {/* Billing History */}
                           <div className="py-2 mt-8">
                              <div className="flex items-center justify-between mb-6">
                                 <h3 className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Receipt size={16} className="text-slate-400" /> Billing History
                                 </h3>
                                 <button className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11.5px] font-bold rounded-full border-none transition-all flex items-center gap-1.5 shadow-sm">
                                    <Download size={14} /> Download All
                                 </button>
                              </div>
                              
                              <div className="divide-y divide-slate-100 dark:divide-white/5">
                                 {loadingBilling ? (
                                    <div className="py-8 text-center text-slate-500 font-medium">Loading billing history...</div>
                                 ) : billingHistory.length === 0 ? (
                                    <div className="py-8 text-center text-slate-500 font-medium">No billing history available yet.</div>
                                 ) : billingHistory.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-6 group">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 border border-zinc-200/50 dark:border-white/5">
                                             <FileText size={16} className="text-slate-400" />
                                          </div>
                                          <div>
                                             <span className="text-[15px] font-medium text-slate-800 dark:text-[#DBDEE1] block">
                                                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                             </span>
                                             <span className="text-[13px] text-slate-500 dark:text-[#B5BAC1] block mt-0.5">
                                                {(item.plan?.charAt(0).toUpperCase() + item.plan?.slice(1)) || 'Plan'} • {item.stripe_invoice_id || item.id?.slice(0, 8).toUpperCase()}
                                             </span>
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-6">
                                          <span className="text-[14px] font-bold text-slate-900 dark:text-white">₹{parseFloat(item.amount || '0').toLocaleString('en-IN')}</span>
                                          <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide">
                                             <Check size={12} /> {item.status?.toUpperCase() || 'PAID'}
                                          </div>
                                          <button className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 transition-all border-none hidden sm:flex shadow-sm">
                                             <Download size={14} />
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {/* TAB 11: CHANNEL SETTINGS */}
                     {activeTab === 'channel' && (
                        <motion.div
                           key="channel"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="w-full max-w-[740px] mx-auto"
                        >
                           <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-[#3f4147] pb-4">
                              Channel Settings
                           </h2>

                           <div className="space-y-8">
                              {/* Channel Privacy Level (Discord Spam filter style) */}
                              <div>
                                 <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">Channel Privacy Level</h3>
                                 <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mb-4">Determine who can search, view, and interact with posts in your channel.</p>
                                 
                                 <div className="space-y-4">
                                    <div className="flex items-start gap-3 cursor-pointer group" onClick={() => { setFeedVisibility('public'); toast.success('Visibility updated!'); }}>
                                       <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${feedVisibility === 'public' ? 'border-[#5865F2]' : 'border-slate-300 dark:border-[#80848E] group-hover:border-slate-400 dark:group-hover:border-[#DBDEE1]'}`}>
                                          {feedVisibility === 'public' && <div className="w-2.5 h-2.5 rounded-full bg-[#5865F2]"></div>}
                                       </div>
                                       <div>
                                          <div className="text-[15px] font-medium text-slate-800 dark:text-[#DBDEE1]">Public (Everyone)</div>
                                          <div className="text-[13px] text-slate-500 dark:text-[#B5BAC1]">Anyone can search and read posts.</div>
                                       </div>
                                    </div>

                                    <div className="flex items-start gap-3 cursor-pointer group" onClick={() => { setFeedVisibility('request'); toast.success('Visibility updated!'); }}>
                                       <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${feedVisibility === 'request' ? 'border-[#5865F2]' : 'border-slate-300 dark:border-[#80848E] group-hover:border-slate-400 dark:group-hover:border-[#DBDEE1]'}`}>
                                          {feedVisibility === 'request' && <div className="w-2.5 h-2.5 rounded-full bg-[#5865F2]"></div>}
                                       </div>
                                       <div>
                                          <div className="text-[15px] font-medium text-slate-800 dark:text-[#DBDEE1]">Request-Only</div>
                                          <div className="text-[13px] text-slate-500 dark:text-[#B5BAC1]">Users must request access to join and read posts.</div>
                                       </div>
                                    </div>

                                    <div className="flex items-start gap-3 cursor-pointer group" onClick={() => { setFeedVisibility('private'); toast.success('Visibility updated!'); }}>
                                       <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${feedVisibility === 'private' ? 'border-[#5865F2]' : 'border-slate-300 dark:border-[#80848E] group-hover:border-slate-400 dark:group-hover:border-[#DBDEE1]'}`}>
                                          {feedVisibility === 'private' && <div className="w-2.5 h-2.5 rounded-full bg-[#5865F2]"></div>}
                                       </div>
                                       <div>
                                          <div className="text-[15px] font-medium text-slate-800 dark:text-[#DBDEE1]">Private (Paid subscription)</div>
                                          <div className="text-[13px] text-slate-500 dark:text-[#B5BAC1]">Only paid subscribers have access to this channel.</div>
                                       </div>
                                    </div>
                                 </div>
                              </div>

                              {/* Divider */}
                              <div className="h-[1px] w-full bg-slate-200 dark:bg-[#3f4147]"></div>

                              {/* Channel Guidelines */}
                              <div>
                                 <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-4">Channel Guidelines</h3>
                                 <textarea
                                    rows={4}
                                    value={channelRules}
                                    onChange={e => setChannelRules(e.target.value)}
                                    className="w-full p-4 rounded-md bg-slate-50 dark:bg-[#1E1F22] border border-transparent text-[14px] text-slate-800 dark:text-[#DBDEE1] outline-none resize-none focus:ring-1 focus:ring-[#5865F2] placeholder-slate-400 dark:placeholder-[#80848E]"
                                    placeholder="Set the rules and guidelines for your channel..."
                                 />
                                 <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] mt-2">These rules will be displayed to users before they join your channel.</p>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {/* TAB 12: CREATOR / BUSINESS ACCOUNT */}
                     {activeTab === 'creator' && (
                        <motion.div
                           key="creator"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="space-y-8 w-full max-w-[740px] mx-auto animate-in fade-in duration-300"
                        >
                           <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-[#3f4147] pb-4">
                              Creator Account
                           </h2>

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
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="w-full"
                        >
                           <HelpTab />
                        </motion.div>
                     )}

                     {/* TAB 14: REPORT A PROBLEM */}
                     {activeTab === 'report' && (
                        <motion.div
                           key="report"
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, y: -10 }}
                           transition={{ duration: 0.2 }}
                           className="w-full max-w-[740px] mx-auto"
                        >
                           <ReportTab />
                        </motion.div>
                     )}

                  </AnimatePresence>
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
                     <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); setIsEditModalOpen(false); }} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto amazing-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">First Name</label>
                              <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Last Name</label>
                              <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Username</label>
                           <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Email</label>
                           <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Address</label>
                              <input type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">City</label>
                              <input type="text" value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">State</label>
                              <input type="text" value={profile.state || ''} onChange={e => setProfile({...profile, state: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Zip Code</label>
                              <input type="text" value={profile.zipCode || ''} onChange={e => setProfile({...profile, zipCode: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Country</label>
                              <input type="text" value={profile.country || ''} onChange={e => setProfile({...profile, country: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Date of Birth</label>
                              <input type="text" value={profile.dob || ''} onChange={e => setProfile({...profile, dob: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Gender</label>
                              <input type="text" value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
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
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-[#333333] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6"
                  >
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Phone Number</h3>
                        <button type="button" onClick={() => setShowSmsModal(false)} className="text-slate-400 hover:text-slate-655 dark:hover:text-slate-250">
                           <X size={20} />
                        </button>
                     </div>
                     <p className="text-xs text-slate-505 mb-4">Enter your mobile phone number to receive SMS security alerts and code verifications.</p>
                     <div className="space-y-4">
                        <div>
                           <label className="text-xs font-bold text-slate-555 uppercase tracking-wide block mb-1">Phone Number</label>
                           <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#333333]">
                           <button type="button" onClick={() => setShowSmsModal(false)} className="px-5 py-2 bg-slate-100 dark:bg-[#2C2C2E] text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-colors">Cancel</button>
                           <button type="button" onClick={() => { toast.success("Phone number verified successfully!"); setShowSmsModal(false); }} className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors">Save Number</button>
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
                 className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-[#333333] text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-[#2A2A2A] transition-colors"
               >
                 Cancel
               </button>
               <button 
                 type="button" 
                 onClick={async () => {
                   setShowLogoutConfirm(false);
                   setIsLoggingOut(true);
                   await supabase.auth.signOut();
                   toast.success("Logged out successfully");
                   setIsLoggingOut(false);
                   navigate('/login');
                 }}
                 className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors shadow-md shadow-red-500/20 flex items-center justify-center min-w-[100px]"
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

      </motion.div>
      </DashboardLayout>
   );
}

