const fs = require('fs');
const gen = fs.readFileSync('tab_replace_general.cjs.txt', 'utf8');
const pro = fs.readFileSync('tab_replace_profiles.cjs.txt', 'utf8');
const not = fs.readFileSync('tab_replace_notifications.cjs.txt', 'utf8');
const app = fs.readFileSync('tab_replace_appearance.cjs.txt', 'utf8');

const settingsContent = `import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
   User, Settings as SettingsIcon, Bell, Palette, Camera, Check, Link2, 
   Twitter, Instagram, Youtube, Trash2, Mail, Shield, MessageSquare, 
   Smartphone, AlertTriangle, Monitor, Moon, Sun, MonitorSmartphone, Power
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
      onClick={onChange}
      className={\`group relative flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 overflow-hidden
         \${checked 
            ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_12px_rgba(99,102,241,0.4)]' 
            : 'bg-gradient-to-b from-[#222222] to-[#1a1a1a] dark:from-[#111111] dark:to-[#0a0a0a] border border-slate-200/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.2)]'
         }
      \`}
   >
      {checked && (
         <div className="absolute inset-0 bg-white/20 translate-y-[-50%] rounded-full blur-md"></div>
      )}
      <div className="relative z-10 flex items-center gap-2">
         {Icon && <Icon size={14} className={\`transition-colors duration-300 \${checked ? 'text-white' : 'text-slate-500 dark:text-slate-400'}\`} />}
         <span className={\`text-[11px] font-black uppercase tracking-widest transition-colors duration-300 \${checked ? 'text-white' : 'text-slate-500 dark:text-slate-400'}\`}>
            {label}
         </span>
      </div>
   </button>
);

const AnimatedCheckbox = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
   <button type="button" onClick={onChange} className="group relative flex items-center justify-center w-6 h-6 rounded-[6px] transition-all duration-300 overflow-hidden outline-none ring-0 border border-slate-300 dark:border-[#333333] bg-white dark:bg-[#111111]">
      <div className={\`absolute inset-0 transition-all duration-300 \${checked ? 'bg-indigo-500 dark:bg-indigo-500 scale-100' : 'bg-transparent scale-0'}\`} />
      {checked && <Check size={14} strokeWidth={4} className="relative z-10 text-white" />}
   </button>
);

export default function Settings() {
   const [activeTab, setActiveTab] = useState('general');
   const [loading, setLoading] = useState(false);
   
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
      isPrivate: false,
      hideFollowers: false,
      hideTrades: false
   });
   
   const [password, setPassword] = useState({ current: '', new: '', confirm: '' });
   const avatarUploadRef = useRef<HTMLInputElement>(null);
   const bannerUploadRef = useRef<HTMLInputElement>(null);

   // Notifications State
   const [globalOff, setGlobalOff] = useState(false);
   const [globalEmailOnly, setGlobalEmailOnly] = useState(false);
   const [notifications, setNotifications] = useState({
      messages: [
         { id: 'direct', label: 'Direct Messages', app: true, push: true, email: true },
         { id: 'groups', label: 'Group Messages', app: true, push: false, email: false },
         { id: 'tags', label: 'Mentions & Tags', app: true, push: true, email: true }
      ],
      channels: [
         { id: 'posts', label: 'New Channel Posts', app: true, push: false, email: false },
         { id: 'live', label: 'Live Streams & Voice', app: true, push: true, email: true },
         { id: 'replies', label: 'Replies to my posts', app: true, push: true, email: false }
      ],
      ai: [
         { id: 'daily', label: 'Daily Briefing', app: true, push: true, email: true },
         { id: 'analysis', label: 'Post-Trade Analysis', app: true, push: false, email: false },
         { id: 'insights', label: 'Market Insights', app: false, push: false, email: true },
         { id: 'habits', label: 'Trading Habits Feedback', app: true, push: true, email: false }
      ],
      alerts: [
         { id: 'execution', label: 'Trade Executions', app: true, push: true, email: true },
         { id: 'drops', label: 'Price Drops & Spikes', app: true, push: true, email: false },
         { id: 'risk', label: 'Risk Guard Warnings', app: true, push: true, email: true },
         { id: 'downtime', label: 'System Downtime', app: true, push: true, email: true }
      ],
      account: [
         { id: 'logins', label: 'New Device Logins', app: true, push: true, email: true },
         { id: 'billing', label: 'Subscription & Billing', app: true, push: false, email: true },
         { id: 'sms', label: 'SMS Security Alerts', app: false, push: true, email: false }
      ]
   });

   // Appearance State
   const [theme, setTheme] = useState('system');

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
         const { error } = await supabase.from('profiles').update({
            first_name: profile.firstName,
            last_name: profile.lastName,
            name: profile.name,
            bio: profile.bio,
            website: profile.website,
            twitter_url: profile.twitter,
            instagram_url: profile.instagram,
            youtube_url: profile.youtube
         }).eq('id', user.id);
         
         if (error) throw error;
         toast.success('Preferences saved');
      } catch (e: any) {
         toast.error('Failed to update profile');
      } finally {
         setLoading(false);
      }
   };

   const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
       // Mock
   };
   
   const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
       // Mock
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
                                       : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#222222]'
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
                              \${gen}
                              \${pro}
                              \${not}
                              \${app}
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
      </DashboardLayout>
   );
}
`;

fs.writeFileSync('src/pages/Settings.tsx', settingsContent, 'utf8');
console.log('Settings.tsx fully reconstructed and saved!');
