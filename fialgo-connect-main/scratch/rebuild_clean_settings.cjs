const fs = require('fs');
const path = require('path');

try {
    const general = fs.readFileSync(path.join(__dirname, 'general.txt'), 'utf8').trim();
    const profiles = fs.readFileSync(path.join(__dirname, 'profiles.txt'), 'utf8').trim();
    let notifications = fs.readFileSync(path.join(__dirname, 'notifications.txt'), 'utf8').trim();
    const appearance = fs.readFileSync(path.join(__dirname, 'appearance.txt'), 'utf8').trim();

    // Clean notifications tab:
    // 1. Replace JoystickSwitch with ConsistencyToggleButton
    notifications = notifications.replace(
        /<JoystickSwitch\s+checked=\{globalOff\}\s+onChange={handleGlobalOff\}\s*\/>\s*<span\s+className="[^"]+">Switch off all<\/span>/g,
        `<ConsistencyToggleButton checked={globalOff} onChange={() => handleGlobalOff()} label="Switch off all" icon={Power} />`
    );
    notifications = notifications.replace(
        /<JoystickSwitch\s+checked=\{globalEmailOnly\}\s+onChange=\{handleEmailOnly\}\s*\/>\s*<span\s+className="[^"]+">Email only<\/span>/g,
        `<ConsistencyToggleButton checked={globalEmailOnly} onChange={() => handleEmailOnly()} label="Email only" icon={Mail} />`
    );

    // 2. Remove borders between list items
    notifications = notifications.replace(
        /className=\{\`flex flex-col md:flex-row md:items-center justify-between py-3 gap-4 \$\{i !== \(notifications as any\)\[section\.key\]\.length - 1 \? 'border-b border-slate-100 dark:border-\[\#222\]' : ''\}\`\}/g,
        `className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-4"`
    );

    // 3. Ensure notifications block is properly closed with )}
    if (!notifications.trim().endsWith(')}')) {
        notifications = notifications.trim() + '\n                        )}';
    }

    // Assemble Settings.tsx
    const settingsContent = `import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
   User, Settings as SettingsIcon, Bell, Palette, Camera, Check, Link2, 
   Twitter, Instagram, Youtube, Trash2, Mail, Shield, MessageSquare, 
   Smartphone, AlertTriangle, Monitor, Moon, Sun, MonitorSmartphone, Power, X
} from 'lucide-react';

const PushableButton = ({ children, onClick, type = 'primary', className = '', ...props }: any) => {
   const baseClasses = "relative rounded-xl font-bold transition-all duration-200 active:top-[2px] active:shadow-none overflow-hidden";
   
   const types = {
      primary: "bg-indigo-600 text-white shadow-[0_4px_0_rgb(67,56,202)] hover:bg-indigo-500 active:shadow-[0_0px_0_rgb(67,56,202)]",
      secondary: "bg-white dark:bg-[#1E1E1E] text-slate-700 dark:text-slate-200 shadow-[0_4px_0_rgb(203,213,225)] dark:shadow-[0_4px_0_rgb(15,15,15)] hover:bg-slate-50 dark:hover:bg-[#252525] border border-slate-200 dark:border-[#333]",
      danger: "bg-red-500 text-white shadow-[0_4px_0_rgb(185,28,28)] hover:bg-red-400 active:shadow-[0_0px_0_rgb(185,28,28)]"
   };

   return (
      <button 
         className={\`\${baseClasses} \${types[type as keyof typeof types]} \${className}\`}
         onClick={onClick}
         {...props}
      >
         <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-[-50%] rounded-full blur-md"></div>
         <span className="relative z-10 block">{children}</span>
      </button>
   );
};

const ConsistencyToggleButton = ({ label, checked, onChange, icon: Icon }: any) => (
   <button
      type="button"
      onClick={onChange}
      className={\`inline-flex items-center gap-1.5 h-[44px] px-4 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 \${
         checked
         ? "border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:from-[#1E1B4B] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#3730A340] text-indigo-700 dark:text-indigo-400"
         : "border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#252528] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#333336] text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.4),0_0_0_2px_#44444A]"
      }\`}
   >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
   </button>
);

const AnimatedCheckbox = ({ checked, onChange }: { checked: boolean, onChange: (checked: boolean) => void }) => (
   <button 
      type="button" 
      onClick={() => onChange(!checked)} 
      className="group relative flex items-center justify-center w-6 h-6 rounded-[6px] transition-all duration-200 overflow-hidden outline-none ring-0 border border-slate-300 dark:border-[#333333] bg-white dark:bg-[#111111]"
   >
      <div className={\`absolute inset-0 transition-all duration-200 \${checked ? 'bg-indigo-500 scale-100' : 'bg-transparent scale-0'}\`} />
      {checked && <Check size={14} strokeWidth={4} className="relative z-10 text-white" />}
   </button>
);

const SettingsToggle = ({ checked, onChange, disabled = false }: { checked: boolean, onChange: (v: boolean) => void, disabled?: boolean }) => (
   <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={\`relative w-12 h-6 rounded-full transition-colors duration-200 outline-none focus:outline-none \${disabled ? 'opacity-40 cursor-not-allowed' : ''} \${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-[#2C2C2E]'}\`}
   >
      <div className={\`absolute top-1/2 -translate-y-1/2 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 \${checked ? 'translate-x-6' : 'translate-x-0'}\`} />
   </button>
);

export default function Settings() {
   const [activeTab, setActiveTab] = useState('general');
   const [loading, setLoading] = useState(false);
   
   // Modals State
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [showSmsModal, setShowSmsModal] = useState(false);
   
   // Profile State
   const [profile, setProfile] = useState({
      firstName: '',
      lastName: '',
      name: '',
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
      hideTrades: false
   });
   
   const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
   const avatarUploadRef = useRef<HTMLInputElement>(null);
   const bannerUploadRef = useRef<HTMLInputElement>(null);

   // Privacy State
   const [privacySettings, setPrivacySettings] = useState({
      show_location: true,
      show_winrate: true,
      show_roi: true,
      show_streak: true,
      show_trades: true,
      is_private: false,
      account_type: 'personal' as 'personal' | 'creator' | 'business'
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
         { id: 'system', label: 'System Alerts', push: true, app: true, email: true },
      ],
      account: [
         { id: 'challenge', label: 'Challenge Updates', push: true, app: true, email: true },
         { id: 'billing', label: 'Billing & Subs', push: false, app: true, email: true },
         { id: 'security', label: 'Security Alerts', push: true, app: true, email: true },
      ]
   });

   // Appearance State
   const [theme, setTheme] = useState('system');
   const [accentColor, setAccentColor] = useState('blue');
   const [layoutDensity, setLayoutDensity] = useState('comfortable');
   const [terminalLogging, setTerminalLogging] = useState(false);

   // Read tab parameter from URL search params
   useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
         setActiveTab(tabParam);
      }
   }, []);

   // Load privacy settings and profile details on mount
   useEffect(() => {
      const fetchUserData = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
            // Load privacy settings from localStorage
            const storedPrivacy = localStorage.getItem(\`tradifive_privacy_\${user.id}\`);
            if (storedPrivacy) {
               setPrivacySettings(JSON.parse(storedPrivacy));
            }
            
            // Load profile details from database
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
            if (data) {
               setProfile({
                  firstName: data.first_name || '',
                  lastName: data.last_name || '',
                  name: data.username || '',
                  email: user.email || '',
                  avatarUrl: data.avatar_url || '',
                  bannerUrl: data.banner_url || '',
                  bio: data.bio || '',
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
                  hideTrades: data.hide_trades || false
               });
            } else {
               // Load fallback from localStorage cache
               const cached = localStorage.getItem('prof_cache_data');
               if (cached) {
                  const parsed = JSON.parse(cached);
                  setProfile({
                     firstName: parsed.first_name || '',
                     lastName: parsed.last_name || '',
                     name: parsed.username || '',
                     email: user.email || '',
                     avatarUrl: parsed.avatar_url || '',
                     bannerUrl: parsed.banner_url || '',
                     bio: parsed.bio || '',
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
               }
            }
         }
      };
      fetchUserData();
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
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) return;
         setLoading(true);
         
         // Update profile in DB
         const { error } = await supabase.from('profiles').update({
            first_name: profile.firstName,
            last_name: profile.lastName,
            username: profile.name,
            bio: profile.bio,
            website: profile.website,
            twitter_url: profile.twitter,
            instagram_url: profile.instagram,
            youtube_url: profile.youtube,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zip_code: profile.zipCode,
            country: profile.country,
            dob: profile.dob,
            gender: profile.gender,
            country_emoji: profile.countryEmoji
         }).eq('id', user.id);
         
         if (error) throw error;
         
         // Save privacy settings locally
         localStorage.setItem(\`tradifive_privacy_\${user.id}\`, JSON.stringify(privacySettings));
         localStorage.setItem(\`tradifive_privacy_user_\${profile.name.toLowerCase()}\`, JSON.stringify(privacySettings));
         
         const updatedCache = {
            id: user.id,
            first_name: profile.firstName,
            last_name: profile.lastName,
            display_name: \`\${profile.firstName} \${profile.lastName}\`.trim() || profile.name,
            username: profile.name,
            avatar_url: profile.avatarUrl,
            banner_url: profile.bannerUrl,
            bio: profile.bio,
            location: profile.city,
            country: profile.country,
            country_emoji: profile.countryEmoji
         };
         
         localStorage.setItem('prof_cache_data', JSON.stringify(updatedCache));
         localStorage.setItem(\`tradifive_mock_profile_\${profile.name.toLowerCase()}\`, JSON.stringify(updatedCache));
         
         // Update tradifive cache keys for sidebar
         localStorage.setItem("tradifive_cached_display_name", \`\${profile.firstName} \${profile.lastName}\`.trim() || profile.name);
         localStorage.setItem("tradifive_cached_username", profile.name);
         localStorage.setItem("tradifive_cached_avatar_url", profile.avatarUrl);
         
         // Dispatch update event
         window.dispatchEvent(new Event("tradifive_profile_update"));
         
         toast.success('Preferences saved');
      } catch (e: any) {
         console.error(e);
         toast.error('Failed to update profile');
      } finally {
         setLoading(false);
      }
   };

   const tabs = [
      { id: 'general', label: 'General', icon: SettingsIcon },
      { id: 'profiles', label: 'Public Profile', icon: User },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'appearance', label: 'Appearance', icon: Palette }
   ];

   return (
      <DashboardLayout>
         <div className="min-h-screen bg-slate-50 dark:bg-[#0A0A0A]">
            {/* Header */}
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
               <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-[#0A0A0A] to-transparent"></div>
               <div className="px-8 pt-8 relative z-10">
                  <h1 className="text-2xl font-black text-white tracking-tight">Settings & Preferences</h1>
                  <p className="text-indigo-100 font-medium mt-1">Manage your account settings and preferences.</p>
               </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-20">
               <div className="flex flex-col lg:flex-row gap-8">
                  
                  {/* Sidebar */}
                  <div className="w-full lg:w-64 shrink-0">
                     <div className="bg-white dark:bg-[#151515] rounded-[24px] border border-slate-200 dark:border-[#333333] p-3 shadow-sm sticky top-24">
                        <div className="space-y-1">
                           {tabs.map((tab) => (
                              <button
                                 key={tab.id}
                                 onClick={() => setActiveTab(tab.id)}
                                 className={\`w-full flex items-center gap-3 px-4 py-3 rounded-[16px] text-sm font-bold transition-all duration-200
                                    \${activeTab === tab.id 
                                       ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' 
                                       : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#222222]'
                                    }
                                 \`}
                              >
                                 <tab.icon size={18} />
                                 {tab.label}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1">
                     <div className="bg-white dark:bg-[#151515] rounded-[32px] border border-slate-200 dark:border-[#333333] shadow-sm overflow-hidden">
                        <div className="p-8 lg:p-10">
                           <AnimatePresence mode="wait">
                              ${general}
                              ${profiles}
                              ${notifications}
                              ${appearance}
                           </AnimatePresence>

                           {/* Save Button Footer */}
                           <div className="mt-12 pt-8 border-t border-slate-100 dark:border-[#222222] flex justify-end">
                              <PushableButton 
                                 type="primary" 
                                 className="px-16 py-3" 
                                 onClick={handleUpdateProfile}
                              >
                                 {loading ? 'Saving...' : 'Save Preferences'}
                              </PushableButton>
                           </div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
         
         {/* Edit Details Modal */}
         <AnimatePresence>
            {isEditModalOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#333] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                  >
                     <div className="p-6 border-b border-slate-100 dark:border-[#222] flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile Details</h3>
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                           <X size={20} />
                        </button>
                     </div>
                     <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); setIsEditModalOpen(false); }} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto amazing-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">First Name</label>
                              <input type="text" value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Last Name</label>
                              <input type="text" value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Username</label>
                           <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Email</label>
                           <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Address</label>
                              <input type="text" value={profile.address || ''} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">City</label>
                              <input type="text" value={profile.city || ''} onChange={e => setProfile({...profile, city: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">State</label>
                              <input type="text" value={profile.state || ''} onChange={e => setProfile({...profile, state: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Zip Code</label>
                              <input type="text" value={profile.zipCode || ''} onChange={e => setProfile({...profile, zipCode: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Country</label>
                              <input type="text" value={profile.country || ''} onChange={e => setProfile({...profile, country: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Date of Birth</label>
                              <input type="text" value={profile.dob || ''} onChange={e => setProfile({...profile, dob: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Gender</label>
                              <input type="text" value={profile.gender || ''} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                           </div>
                        </div>
                        <div className="pt-4 border-t border-slate-100 dark:border-[#222] flex justify-end gap-3">
                           <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 bg-slate-100 dark:bg-[#2C2C2E] text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-colors">Cancel</button>
                           <button type="submit" className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors">Save Details</button>
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* SMS Phone Verification Modal */}
         <AnimatePresence>
            {showSmsModal && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#333] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6"
                  >
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Phone Number</h3>
                        <button type="button" onClick={() => setShowSmsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                           <X size={20} />
                        </button>
                     </div>
                     <p className="text-xs text-slate-500 mb-4">Enter your mobile phone number to receive SMS security alerts and code verifications.</p>
                     <div className="space-y-4">
                        <div>
                           <label className="text-xs font-bold text-slate-550 uppercase tracking-wide block mb-1">Phone Number</label>
                           <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-slate-50 dark:bg-[#252528] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none" />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#222]">
                           <button type="button" onClick={() => setShowSmsModal(false)} className="px-5 py-2 bg-slate-100 dark:bg-[#2C2C2E] text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-colors">Cancel</button>
                           <button type="button" onClick={() => { toast.success("Phone number added!"); setShowSmsModal(false); }} className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors">Save Number</button>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </DashboardLayout>
   );
}
`;

    fs.writeFileSync(path.join(__dirname, '..', 'src', 'pages', 'Settings.tsx'), settingsContent, 'utf8');
    console.log('Reconstructed Settings.tsx successfully!');
} catch (err) {
    console.error('Error during reconstruction:', err);
}
