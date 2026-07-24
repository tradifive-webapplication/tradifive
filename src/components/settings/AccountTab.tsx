import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Smartphone, ShieldCheck, CheckCircle2, Users, AlertTriangle, ShieldAlert, Ban } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import defaultAvatar from '@/assets/default-avatar.svg';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogClose, AlertDialogPopup, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AccountTab({
   profile,
   isInitialLoading,
   setActiveSubTab,
   onEditProfile,
   onEditPhone
}: {
   profile?: any,
   isInitialLoading?: boolean,
   setActiveSubTab: (id: string) => void,
   onEditProfile?: () => void,
   onEditPhone?: () => void
}) {
   const [revealEmail, setRevealEmail] = useState(false);
   const [revealPhone, setRevealPhone] = useState(false);

   const [localStanding, setLocalStanding] = useState<string | null>(null);
   const [localMessage, setLocalMessage] = useState<string | null>(null);
   const [isDismissing, setIsDismissing] = useState(false);

   useEffect(() => {
      setLocalStanding(null);
      setLocalMessage(null);
   }, [profile]);

   const standing = localStanding !== null ? localStanding : (profile?.account_standing || 'GOOD');
   const standingMessage = localMessage !== null ? localMessage : (profile?.standing_message || '');

   const handleDismissStanding = async () => {
      setIsDismissing(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) throw new Error("Not authenticated");

         const { error } = await supabase.from('profiles').update({
            account_standing: 'GOOD',
            standing_message: null
         }).eq('id', user.id);

         if (error) throw error;
         toast.success("Account standing acknowledged successfully.");
         setLocalStanding('GOOD');
         setLocalMessage('');
         window.dispatchEvent(new Event("tradifive_profile_update"));
      } catch (err: any) {
         toast.error(err.message || "Failed to acknowledge warning");
      } finally {
         setIsDismissing(false);
      }
   };

   const displayName = profile?.display_name || profile?.name || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'TradiFive User';
   const username = profile?.username || 'not_set';
   const email = profile?.email || '';

   const [isPasswordLoading, setIsPasswordLoading] = useState(false);
   const [authAppEnabled, setAuthAppEnabled] = useState(false);
   const [securityKeyEnabled, setSecurityKeyEnabled] = useState(false);

   const handlePasswordReset = async () => {
      if (!profile?.email) {
         toast.error("No email associated with this account.");
         return;
      }
      setIsPasswordLoading(true);
      try {
         const { error } = await supabase.auth.resetPasswordForEmail(profile.email);
         if (error) throw error;
         toast.success(`Password reset instructions sent to ${maskEmail(profile.email)}`);
      } catch (e: any) {
         toast.error(e.message || "Failed to send password reset");
      } finally {
         setIsPasswordLoading(false);
      }
   };

   const maskEmail = (emailStr: string) => {
      if (!emailStr || !emailStr.includes('@')) return emailStr;
      const [local, domain] = emailStr.split('@');
      if (local.length <= 1) return emailStr;
      return `${local.charAt(0)}${'*'.repeat(local.length - 1)}@${domain}`;
   };

   const phoneNumber = profile?.phone || '';
   const maskPhone = (phoneStr: string) => {
      if (!phoneStr) return phoneStr;
      const digits = phoneStr.replace(/\D/g, '');
      if (digits.length < 4) return phoneStr;
      return `********${digits.slice(-3)}`;
   };

   useEffect(() => {
      const handleScroll = (e: Event) => {
         const container = e.target as HTMLElement;
         const sections = ['account-info', 'password-security', 'account-standing', 'family-center'];
         let currentActive = sections[0];

         // Check if scrolled to the bottom
         const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;

         if (isAtBottom) {
            currentActive = sections[sections.length - 1];
         } else {
            for (const section of sections) {
               const el = document.getElementById(section);
               if (el && container.scrollTop >= (el.offsetTop - 150)) {
                  currentActive = section;
               }
            }
         }

         setActiveSubTab(currentActive);
      };
      const scrollContainer = document.getElementById('settings-scroll-container');
      if (scrollContainer) {
         scrollContainer.addEventListener('scroll', handleScroll);
         return () => scrollContainer.removeEventListener('scroll', handleScroll);
      }
   }, [setActiveSubTab]);

   if (isInitialLoading) {
      return (
         <div className="space-y-6 pb-24 font-sans animate-pulse">
            <section>
               <div className="bg-slate-50 dark:bg-[#151515] p-6 rounded-2xl border border-slate-200 dark:border-[#333333] shadow-sm space-y-6">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-[#333] rounded mb-2"></div>

                  <div className="h-28 bg-slate-200 dark:bg-[#202020] relative rounded-xl border border-slate-200 dark:border-transparent">
                     <div className="absolute -bottom-10 left-6">
                        <div className="w-24 h-24 rounded-full border-[6px] border-white dark:border-[#151515] bg-slate-300 dark:bg-[#333]"></div>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6">
                     <div className="space-y-2 mt-4 sm:mt-0">
                        <div className="h-6 w-48 bg-slate-200 dark:bg-[#333] rounded"></div>
                        <div className="h-4 w-32 bg-slate-200 dark:bg-[#333] rounded"></div>
                     </div>
                     <div className="h-9 w-32 bg-slate-200 dark:bg-[#333] rounded-md"></div>
                  </div>

                  <div className="h-[1px] bg-slate-200/60 dark:bg-[#333333]" />

                  <div className="flex justify-between items-center">
                     <div className="space-y-2">
                        <div className="h-3 w-16 bg-slate-200 dark:bg-[#333] rounded"></div>
                        <div className="h-5 w-40 bg-slate-200 dark:bg-[#333] rounded"></div>
                     </div>
                     <div className="h-8 w-16 bg-slate-200 dark:bg-[#333] rounded"></div>
                  </div>

                  <div className="h-[1px] bg-slate-200/60 dark:bg-[#333333]" />

                  <div className="flex justify-between items-center">
                     <div className="space-y-2">
                        <div className="h-3 w-20 bg-slate-200 dark:bg-[#333] rounded"></div>
                        <div className="h-5 w-32 bg-slate-200 dark:bg-[#333] rounded"></div>
                     </div>
                     <div className="h-8 w-16 bg-slate-200 dark:bg-[#333] rounded"></div>
                  </div>
               </div>
            </section>

            <section>
               <div className="bg-slate-50 dark:bg-[#151515] p-6 rounded-2xl border border-slate-200 dark:border-[#333333] shadow-sm space-y-6">
                  <div className="h-4 w-32 bg-slate-200 dark:bg-[#333] rounded"></div>
                  <div className="flex justify-between items-center">
                     <div className="space-y-2">
                        <div className="h-5 w-40 bg-slate-200 dark:bg-[#333] rounded"></div>
                        <div className="h-4 w-64 bg-slate-200 dark:bg-[#333] rounded"></div>
                     </div>
                     <div className="h-10 w-24 bg-slate-200 dark:bg-[#333] rounded"></div>
                  </div>
               </div>
            </section>
         </div>
      );
   }

   return (
      <div className="space-y-6 pb-24 font-sans">

         {/* SECTION 1: MY ACCOUNT */}
         <section id="account-info">
            <div className="bg-slate-50 dark:bg-[#151515] p-6 rounded-2xl border border-slate-200 dark:border-[#333333] shadow-sm space-y-6">
               <h2 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest mb-2">My Account</h2>

               {/* Banner with Avatar */}
               <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative rounded-xl border border-slate-200 dark:border-transparent">
                  {/* Avatar */}
                  <div className="absolute -bottom-10 left-6">
                     <div className="w-24 h-24 rounded-full border-[6px] border-white dark:border-[#151515] bg-slate-200 dark:bg-[#1C1C1E] flex items-center justify-center overflow-hidden relative group cursor-pointer shadow-sm">
                        <img src={profile?.avatarUrl || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = defaultAvatar; }} />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-white text-[10px] font-bold uppercase tracking-wider">Change</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Profile Info Header & Controls */}
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6">
                  <div>
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">{displayName}</h3>
                     <p className="text-sm font-medium text-slate-500 dark:text-[#949ba4]">@{username}</p>
                  </div>
                  <button onClick={onEditProfile} className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 text-white text-[13px] font-semibold rounded-md shadow-sm transition-colors">
                     Edit User Profile
                  </button>
               </div>

               <div className="h-[1px] bg-slate-200/60 dark:bg-[#333333]" />

               {/* Email */}
               <div className="flex justify-between items-center">
                  <div>
                     <p className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider mb-1">Email</p>
                     <div className="flex items-center gap-2">
                        <p className={`text-[14px] font-medium ${email ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-400 italic'}`}>
                           {email ? (revealEmail ? email : maskEmail(email)) : 'Not provided'}
                        </p>
                        {email && (
                           <button onClick={() => setRevealEmail(!revealEmail)} className="text-[13px] text-blue-500 hover:underline">
                              {revealEmail ? "Hide" : "Reveal"}
                           </button>
                        )}
                     </div>
                  </div>
                  <button onClick={onEditProfile} className="px-3 py-1.5 bg-white dark:bg-[#202022] hover:bg-slate-50 dark:hover:bg-[#2c2c2f] border border-slate-200 dark:border-[#333333] text-slate-800 dark:text-white text-[13px] font-semibold rounded transition-colors shadow-sm">
                     Edit
                  </button>
               </div>

               <div className="h-[1px] bg-slate-200/60 dark:bg-[#333333]" />

               {/* Phone */}
               <div className="flex justify-between items-center">
                  <div>
                     <p className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider mb-1">Phone Number</p>
                     <div className="flex items-center gap-2">
                        <p className={`text-[14px] font-medium ${phoneNumber ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-400 italic'}`}>
                           {phoneNumber ? (revealPhone ? phoneNumber : maskPhone(phoneNumber)) : 'Not provided'}
                        </p>
                        {phoneNumber && (
                           <button onClick={() => setRevealPhone(!revealPhone)} className="text-[13px] text-blue-500 hover:underline">
                              {revealPhone ? "Hide" : "Reveal"}
                           </button>
                        )}
                     </div>
                  </div>
                  <button onClick={onEditPhone} className="px-3 py-1.5 bg-white dark:bg-[#202022] hover:bg-slate-50 dark:hover:bg-[#2c2c2f] border border-slate-200 dark:border-[#333333] text-slate-800 dark:text-white text-[13px] font-semibold rounded transition-colors shadow-sm">
                     Edit
                  </button>
               </div>
            </div>
         </section>

         {/* SECTION 2: PASSWORD & SECURITY */}
         <section id="password-security">
            <div className="bg-slate-50 dark:bg-[#151515] p-6 rounded-2xl border border-slate-200 dark:border-[#333333] shadow-sm space-y-6">
               <h2 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">Password & Security</h2>

               {/* Change Password Card Row */}
               <div className="flex justify-between items-center gap-4">
                  <div>
                     <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Change Password</h3>
                     <p className="text-[13px] text-slate-500 dark:text-[#949ba4] mt-1">Update your password to keep your account secure.</p>
                  </div>
                  <button
                     onClick={handlePasswordReset}
                     disabled={isPasswordLoading}
                     className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-50 text-white text-[13px] font-semibold rounded-md shadow-sm transition-colors shrink-0"
                  >
                     {isPasswordLoading ? 'Sending...' : 'Change Password'}
                  </button>
               </div>

               <div className="h-[1px] bg-slate-200/60 dark:bg-[#333333]" />

               {/* MFA Details */}
               <div className="space-y-5">
                  <div className="flex items-center gap-3">
                     <ShieldCheck size={24} className="text-green-500" />
                     <div>
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white uppercase tracking-wide">Two-Factor Authentication</h3>
                        <p className="text-[13px] text-slate-500 dark:text-[#949ba4] mt-0.5">Add an extra layer of security to your Tradifive account.</p>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-[#121212] border border-slate-200/50 dark:border-[#333333] shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-[#3b82f6]">
                              <Smartphone size={20} />
                           </div>
                           <div>
                              <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Authenticator App</h4>
                              <p className="text-[12px] text-slate-500 dark:text-[#949ba4]">Use an app like Google Authenticator or Authy.</p>
                           </div>
                        </div>
                        <button
                           onClick={() => {
                              if (!authAppEnabled) toast.success("Authenticator App configured and enabled!");
                              else toast.info("Authenticator App disabled.");
                              setAuthAppEnabled(!authAppEnabled);
                           }}
                           className={`px-4 py-2 ${authAppEnabled ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-slate-100 dark:bg-[#202022] hover:bg-slate-200 dark:hover:bg-[#2c2c2f] text-slate-800 dark:text-white'} border border-slate-200 dark:border-transparent text-[13px] font-semibold rounded transition-colors shadow-sm`}
                        >
                           {authAppEnabled ? 'Disable' : 'Enable'}
                        </button>
                     </div>

                     <div className="flex justify-between items-center p-4 rounded-xl bg-white dark:bg-[#121212] border border-slate-200/50 dark:border-[#333333] shadow-sm">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                              <Key size={20} />
                           </div>
                           <div>
                              <h4 className="text-[14px] font-bold text-slate-900 dark:text-white">Security Keys</h4>
                              <p className="text-[12px] text-slate-500 dark:text-[#949ba4]">Use a hardware security key (like YubiKey) for maximum security.</p>
                           </div>
                        </div>
                        <button
                           onClick={() => {
                              if (!securityKeyEnabled) toast.success("Security Key successfully registered!");
                              else toast.info("Security Key removed.");
                              setSecurityKeyEnabled(!securityKeyEnabled);
                           }}
                           className={`px-4 py-2 ${securityKeyEnabled ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-slate-100 dark:bg-[#202022] hover:bg-slate-200 dark:hover:bg-[#2c2c2f] text-slate-800 dark:text-white'} border border-slate-200 dark:border-transparent text-[13px] font-semibold rounded transition-colors shadow-sm`}
                        >
                           {securityKeyEnabled ? 'Remove Key' : 'Register Key'}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* SECTION 3: ACCOUNT STANDING */}
         <section id="account-standing">
            <div className={`p-6 md:p-8 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center space-y-4 py-10 transition-colors
               ${(!standing || standing === 'GOOD') ? 'bg-slate-50 dark:bg-[#151515] border-slate-200 dark:border-[#333333]' : ''}
               ${standing === 'WARNING' ? 'bg-yellow-50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-900/30' : ''}
               ${standing === 'RESTRICTED' ? 'bg-orange-50 dark:bg-orange-950/10 border-orange-200 dark:border-orange-900/30' : ''}
               ${standing === 'BANNED' ? 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30' : ''}
            `}>
               <h2 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest self-start mb-2">Account Standing</h2>

               {(!standing || standing === 'GOOD') && (
                  <>
                     <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mt-2">
                        <CheckCircle2 size={32} className="text-green-500" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your account is in good standing</h3>
                        <p className="text-[13px] text-slate-500 dark:text-[#949ba4] max-w-md mx-auto leading-relaxed">
                           {standingMessage || "You have no active warnings, restrictions, or bans. Thank you for following the community guidelines and keeping Tradifive a safe environment for all traders."}
                        </p>
                     </div>
                  </>
               )}

               {standing === 'WARNING' && (
                  <>
                     <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center mt-2">
                        <AlertTriangle size={32} className="text-yellow-600 dark:text-yellow-500" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-400 mb-2">Account Warning</h3>
                        <p className="text-[13px] text-yellow-700/80 dark:text-yellow-500/80 max-w-md mx-auto leading-relaxed font-medium">
                           {standingMessage || "Your account has received a warning for violating community guidelines. Further violations may result in restrictions."}
                        </p>
                        <button
                           onClick={handleDismissStanding}
                           disabled={isDismissing}
                           className="mt-4 px-5 py-2 bg-yellow-600 dark:bg-yellow-500 hover:bg-yellow-700 text-white font-bold text-xs rounded transition-all shadow-sm"
                        >
                           {isDismissing ? "Processing..." : "Got It"}
                        </button>
                     </div>
                  </>
               )}

               {standing === 'RESTRICTED' && (
                  <>
                     <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mt-2">
                        <ShieldAlert size={32} className="text-orange-600 dark:text-orange-500" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-orange-800 dark:text-orange-400 mb-2">Account Restricted</h3>
                        <p className="text-[13px] text-orange-700/80 dark:text-orange-500/80 max-w-md mx-auto leading-relaxed font-medium">
                           {standingMessage || "Certain features on your account have been restricted. Please check your email or contact support for more information."}
                        </p>
                        <button
                           onClick={handleDismissStanding}
                           disabled={isDismissing}
                           className="mt-4 px-5 py-2 bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 text-white font-bold text-xs rounded transition-all shadow-sm"
                        >
                           {isDismissing ? "Processing..." : "Got It"}
                        </button>
                     </div>
                  </>
               )}

               {standing === 'BANNED' && (
                  <>
                     <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mt-2">
                        <Ban size={32} className="text-red-600 dark:text-red-500" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Account Banned</h3>
                        <p className="text-[13px] text-red-700/80 dark:text-red-500/80 max-w-md mx-auto leading-relaxed font-medium">
                           {standingMessage || "Your account has been permanently suspended from Tradifive."}
                        </p>
                     </div>
                  </>
               )}
            </div>
         </section>

         {/* SECTION 4: FAMILY CENTER */}
         <section id="family-center">
            <div className="bg-slate-50 dark:bg-[#151515] p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-[#333333] shadow-sm flex flex-col items-center justify-center text-center space-y-6">
               <h2 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest self-start mb-2">Family Center</h2>
               <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mt-2">
                  <Users size={40} className="text-[#3b82f6]" />
               </div>
               <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Welcome to Family Center</h3>
                  <p className="text-[14px] text-slate-500 dark:text-[#949ba4] max-w-lg mx-auto leading-relaxed">
                     Family Center is a new tool that helps you manage connected teen accounts. Monitor their trading activity safely, set guardrails, and stay informed without intruding on their space.
                  </p>
               </div>
               <div className="flex gap-4 mt-2">
                  <button className="px-5 py-2.5 bg-[#3b82f6] hover:bg-blue-600 text-white text-[14px] font-semibold rounded-md shadow-sm transition-colors">
                     Enable Family Center
                  </button>
                  <button className="px-5 py-2.5 bg-white dark:bg-[#1e1e21] hover:bg-slate-100 dark:hover:bg-[#2b2b2b] border border-slate-200 dark:border-[#333333] text-slate-800 dark:text-white text-[14px] font-semibold rounded-md transition-colors shadow-sm">
                     Learn More
                  </button>
               </div>
            </div>
         </section>

         {/* SECTION 5: DANGER ZONE */}
         <section id="danger-zone">
            <div className="bg-slate-50 dark:bg-[#151515] p-6 md:p-8 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm flex flex-col space-y-6">
               <h2 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest self-start mb-2">
                  Danger Zone
               </h2>
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                     <h3 className="text-[15px] font-bold text-red-800 dark:text-red-400 mb-1">Delete Account</h3>
                     <p className="text-[13px] text-red-700/80 dark:text-red-500/80 max-w-md leading-relaxed">
                        Permanently remove your account and all associated data. This action cannot be undone.
                     </p>
                  </div>

                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold shrink-0">
                           Delete Account
                        </Button>
                     </AlertDialogTrigger>
                     <AlertDialogPopup>
                        <AlertDialogHeader>
                           <AlertDialogTitle className="font-sans text-[1.15rem] text-slate-900 dark:text-white tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                           <AlertDialogDescription className="text-[0.95rem] text-slate-500 dark:text-slate-400 mt-1">
                              This action cannot be undone. This will permanently delete your account
                              and remove your data from our servers.
                           </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                           <AlertDialogClose render={<Button variant="ghost" className="m-0 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800" />}>Cancel</AlertDialogClose>
                           <AlertDialogClose 
                              onClick={() => toast.error('Account deletion not fully implemented yet.')}
                              render={<Button variant="destructive" className="m-0 rounded-[12px] bg-[#f53a3a] hover:bg-[#df2c2c] text-white font-semibold shadow-[0_2px_8px_-2px_rgba(245,58,58,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] border border-[#d62828] text-[15px]" />}
                           >
                              Delete Account
                           </AlertDialogClose>
                        </AlertDialogFooter>
                     </AlertDialogPopup>
                  </AlertDialog>
               </div>
            </div>
         </section>
      </div>
   );
}
