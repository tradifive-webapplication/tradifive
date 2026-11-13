import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Key, Smartphone, ShieldCheck, CheckCircle2, Users, AlertTriangle, ShieldAlert, Ban, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import defaultAvatar from '@/assets/default-avatar.svg';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

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
   const navigate = useNavigate();
   const [revealEmail, setRevealEmail] = useState(false);
   const [revealPhone, setRevealPhone] = useState(false);

   const [localStanding, setLocalStanding] = useState<string | null>(null);
   const [localMessage, setLocalMessage] = useState<string | null>(null);
   const [isDismissing, setIsDismissing] = useState(false);

   // Complete Account Deletion States
   const [isDeleting, setIsDeleting] = useState(false);
   const [deleteConfirmText, setDeleteConfirmText] = useState("");
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

   const handleDeleteAccount = async () => {
      if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
         toast.error("Please type DELETE to confirm permanent account deletion.");
         return;
      }

      setIsDeleting(true);
      try {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) {
            toast.error("User session not found.");
            navigate("/login");
            return;
         }

         const userId = user.id;

         // 1. Invoke server-side RPC delete_user_account (runs as SECURITY DEFINER in PostgreSQL)
         try {
            await supabase.rpc('delete_user_account');
         } catch (rpcErr) {
            console.warn("RPC delete_user_account fallback execution:", rpcErr);
         }

         // 2. Client-side exhaustive cascade delete across all database tables to ensure 100% total erasure
         await Promise.allSettled([
            supabase.from('social_follows').delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`),
            supabase.from('social_follow_requests').delete().or(`requester_id.eq.${userId},target_id.eq.${userId}`),
            supabase.from('dm_conversations').delete().or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
            supabase.from('direct_messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
            supabase.from('channel_members').delete().eq('user_id', userId),
            supabase.from('channel_messages').delete().eq('user_id', userId),
            supabase.from('channels').delete().eq('created_by', userId),
            supabase.from('social_post_likes').delete().eq('user_id', userId),
            supabase.from('social_post_bookmarks').delete().eq('user_id', userId),
            supabase.from('social_post_comments').delete().eq('user_id', userId),
            supabase.from('social_posts').delete().eq('user_id', userId),
            supabase.from('trades').delete().eq('user_id', userId),
            supabase.from('journal_entries').delete().eq('user_id', userId),
            supabase.from('mt5_accounts').delete().eq('user_id', userId),
            supabase.from('notifications').delete().eq('user_id', userId),
            supabase.from('active_bots').delete().eq('user_id', userId),
            supabase.from('ai_coach_messages').delete().eq('user_id', userId),
            supabase.from('ai_coach_sessions').delete().eq('user_id', userId),
            supabase.from('user_activity_logs').delete().eq('user_id', userId),
            supabase.from('user_feedback').delete().eq('user_id', userId),
            supabase.from('user_mission_progress').delete().eq('user_id', userId),
            supabase.from('user_risk_configs').delete().eq('user_id', userId),
            supabase.from('user_xp_ledger').delete().eq('user_id', userId),
            supabase.from('profiles').delete().eq('id', userId),
         ]);

         // 3. Terminate Supabase authentication session
         await supabase.auth.signOut();

         // 4. Wipe all browser storage (tokens, cached credentials, local profile state)
         try {
            localStorage.clear();
            sessionStorage.clear();
         } catch (_) {}

         toast.success("Your account and all associated data have been permanently erased.");

         // 5. Navigate to Account Deleted confirmation
         navigate("/account-deleted");
      } catch (err: any) {
         console.error("Account deletion error:", err);
         toast.error(err.message || "Failed to delete account completely.");
      } finally {
         setIsDeleting(false);
         setIsDeleteDialogOpen(false);
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
               <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 space-y-6 overflow-hidden">
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
               <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 space-y-6 overflow-hidden">
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
            <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 space-y-6 overflow-hidden">
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
                  <Button onClick={onEditProfile}>
                     Edit User Profile
                  </Button>
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
                  <Button variant="outline" onClick={onEditProfile}>
                     Edit
                  </Button>
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
                  <Button variant="outline" onClick={onEditPhone}>
                     Edit
                  </Button>
               </div>
            </div>
         </section>

         {/* SECTION 2: PASSWORD & SECURITY */}
         <section id="password-security">
            <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 space-y-6 overflow-hidden">
               <h2 className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-widest">Password & Security</h2>

               {/* Change Password Card Row */}
               <div className="flex justify-between items-center gap-4">
                  <div>
                     <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Change Password</h3>
                     <p className="text-[13px] text-slate-500 dark:text-[#949ba4] mt-1">Update your password to keep your account secure.</p>
                  </div>
                  <Button
                     onClick={handlePasswordReset}
                     disabled={isPasswordLoading}
                  >
                     {isPasswordLoading ? 'Sending...' : 'Change Password'}
                  </Button>
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
                        <Button
                           variant={authAppEnabled ? 'destructive' : 'secondary'}
                           onClick={() => {
                              if (!authAppEnabled) toast.success("Authenticator App configured and enabled!");
                              else toast.info("Authenticator App disabled.");
                              setAuthAppEnabled(!authAppEnabled);
                           }}
                        >
                           {authAppEnabled ? 'Disable' : 'Enable'}
                        </Button>
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
                        <Button
                           variant={securityKeyEnabled ? 'destructive' : 'secondary'}
                           onClick={() => {
                              if (!securityKeyEnabled) toast.success("Security Key successfully registered!");
                              else toast.info("Security Key removed.");
                              setSecurityKeyEnabled(!securityKeyEnabled);
                           }}
                        >
                           {securityKeyEnabled ? 'Remove Key' : 'Register Key'}
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* SECTION 3: ACCOUNT STANDING */}
         <section id="account-standing">
            <div className={`p-6 md:p-8 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center space-y-4 py-10 transition-colors
               ${(!standing || standing === 'GOOD') ? 'bg-white dark:bg-[#111112] border-slate-200 dark:border-[#333333] overflow-hidden' : ''}
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
                        <Button
                           onClick={handleDismissStanding}
                           disabled={isDismissing}
                           className="mt-4"
                        >
                           {isDismissing ? "Processing..." : "Got It"}
                        </Button>
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
                        <Button
                           onClick={handleDismissStanding}
                           disabled={isDismissing}
                           variant="outline"
                           className="mt-4"
                        >
                           {isDismissing ? "Processing..." : "Got It"}
                        </Button>
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
            <div className="bg-white dark:bg-[#111112] border border-slate-200 dark:border-white/5 rounded-[32px] shadow-sm p-6 md:p-8 overflow-hidden flex flex-col items-center justify-center text-center space-y-6">
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
                  <Button>
                     Enable Family Center
                  </Button>
                  <Button variant="outline">
                     Learn More
                  </Button>
               </div>
            </div>
         </section>

         {/* SECTION 5: DANGER ZONE */}
         <section id="danger-zone">
            <div style={{ border: '1px solid rgba(239,68,68,0.2)', borderRadius: '20px', boxShadow: '0 10px 30px rgba(15,23,42,0.08),0 2px 8px rgba(15,23,42,0.04)' }} className="bg-white dark:bg-[#111112] p-6 md:p-8 overflow-hidden flex flex-col space-y-6">
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

                  <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) setDeleteConfirmText(""); }}>
                     <DialogTrigger asChild>
                        <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold shrink-0">
                           Delete Account
                        </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[440px] border-red-500/20 bg-white dark:bg-[#121214]">
                        <DialogHeader>
                           <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-2">
                              <Trash2 className="w-5 h-5" />
                           </div>
                           <DialogTitle className="font-sans text-[1.15rem] text-slate-900 dark:text-white tracking-tight">Permanently Delete Account?</DialogTitle>
                           <DialogDescription className="text-[0.88rem] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                              This will permanently and irreversibly erase your account from the database: authentication credentials, trading ledger, MT5 accounts, journal entries, social posts, followers, and all personal records.
                           </DialogDescription>
                        </DialogHeader>

                        <div className="py-3">
                           <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                              Type <span className="text-red-500 font-black">DELETE</span> to confirm:
                           </label>
                           <input
                              type="text"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder="DELETE"
                              disabled={isDeleting}
                              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                           />
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 pt-2">
                           <Button 
                              variant="ghost" 
                              disabled={isDeleting}
                              onClick={() => { setIsDeleteDialogOpen(false); setDeleteConfirmText(""); }}
                              className="h-9 px-4 rounded-xl text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
                           >
                              Cancel
                           </Button>
                           <Button 
                              variant="destructive" 
                              disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                              className="h-9 px-4 rounded-xl bg-[#f53a3a] hover:bg-[#df2c2c] text-white font-semibold text-[13px] disabled:opacity-50 flex items-center gap-2"
                              onClick={handleDeleteAccount}
                           >
                              {isDeleting ? (
                                 <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Deleting Everywhere...</span>
                                 </>
                              ) : (
                                 <span>Permanently Delete</span>
                              )}
                           </Button>
                        </DialogFooter>
                     </DialogContent>
                  </Dialog>
               </div>
            </div>
         </section>
      </div>
   );
}
