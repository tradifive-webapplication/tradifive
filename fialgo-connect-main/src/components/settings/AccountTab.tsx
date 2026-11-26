import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Key,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Users,
  AlertTriangle,
  ShieldAlert,
  Ban,
  Loader2,
  Trash2,
  Laptop,
  Download,
  Mail,
  FileSpreadsheet,
  FileJson,
  Shield,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const SETTINGS_CARD =
  'rounded-[20px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/[0.08] shadow-[0_2px_14px_rgba(15,23,42,0.04)] dark:shadow-none p-5 sm:p-6 space-y-4';

const SETTINGS_BOX =
  'p-4 rounded-xl bg-slate-50/90 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.07]';

export default function AccountTab({
  profile,
  isInitialLoading,
  setActiveSubTab,
  onEditPhone,
  onProfileUpdated,
}: {
  profile?: any;
  isInitialLoading?: boolean;
  setActiveSubTab: (id: string) => void;
  onEditProfile?: () => void;
  onEditPhone?: () => void;
  onProfileUpdated?: (patch: Record<string, any>) => void;
}) {
  const navigate = useNavigate();
  const [revealEmail, setRevealEmail] = useState(false);
  const [revealPhone, setRevealPhone] = useState(false);

  const [localStanding, setLocalStanding] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [isDismissing, setIsDismissing] = useState(false);

  // Email Update Dialog State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Password Update Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  // 2FA TOTP (Real Supabase MFA)
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [mfaQrSvg, setMfaQrSvg] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaFactorPendingId, setMfaFactorPendingId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [isMfaWorking, setIsMfaWorking] = useState(false);

  // Active Sessions State (Live Supabase auth session)
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [sessionRevoked, setSessionRevoked] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{
    lastSignIn?: string;
    provider?: string;
  }>({});

  // Guardian Mode State
  const [isFamilyCenterModalOpen, setIsFamilyCenterModalOpen] = useState(false);
  const [isFamilyLearnMoreOpen, setIsFamilyLearnMoreOpen] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState(() => localStorage.getItem('tf_guardian_email') || '');
  const [guardianMaxLoss, setGuardianMaxLoss] = useState(() => localStorage.getItem('tf_guardian_max_loss') || '2500');
  const [guardianStrictPaper, setGuardianStrictPaper] = useState(() => localStorage.getItem('tf_guardian_strict_paper') === 'true');
  const [guardianWeeklyReport, setGuardianWeeklyReport] = useState(() => localStorage.getItem('tf_guardian_weekly_report') !== 'false');
  const [familyCenterActive, setFamilyCenterActive] = useState(() => Boolean(localStorage.getItem('tf_guardian_email')));

  // Data Export State
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  // Complete Account Deletion States
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setLocalStanding(null);
    setLocalMessage(null);
  }, [profile]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [{ data: sessionRes }, mfaRes] = await Promise.all([
          supabase.auth.getSession(),
          supabase.auth.mfa?.listFactors?.().catch(() => ({ data: null })) ?? Promise.resolve({ data: null }),
        ]);

        if (mounted && sessionRes?.session?.user) {
          const u = sessionRes.session.user;
          setSessionInfo({
            lastSignIn: u.last_sign_in_at
              ? new Date(u.last_sign_in_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : undefined,
            provider: u.app_metadata?.provider || 'email',
          });
        }

        const verifiedTotp = mfaRes?.data?.totp?.find((f: any) => f.status === 'verified');
        if (mounted && verifiedTotp) {
          setTotpFactorId(verifiedTotp.id);
        }
      } catch {
        // Non-fatal session/MFA probe
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const standing = localStanding !== null ? localStanding : (profile?.account_standing || 'GOOD');
  const standingMessage = localMessage !== null ? localMessage : (profile?.standing_message || '');

  const getDeviceDetails = () => {
    const ua = navigator.userAgent;
    let os = 'Desktop Device';
    if (ua.includes('Win')) os = 'Windows PC';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android Mobile';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'Apple iOS';

    let browser = 'Web Browser';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('Chrome/')) browser = 'Google Chrome';
    else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari/')) browser = 'Apple Safari';

    return { os, browser };
  };

  const currentDevice = getDeviceDetails();
  const email = profile?.email || '';
  const phoneNumber = profile?.phone || '';

  const maskEmail = (emailStr: string) => {
    if (!emailStr || !emailStr.includes('@')) return emailStr;
    const [local, domain] = emailStr.split('@');
    if (local.length <= 1) return emailStr;
    return `${local.charAt(0)}${'*'.repeat(local.length - 1)}@${domain}`;
  };

  const maskPhone = (phoneStr: string) => {
    if (!phoneStr) return phoneStr;
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length < 4) return phoneStr;
    return `••••••${digits.slice(-4)}`;
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newEmail.trim();
    if (!cleaned || !cleaned.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (cleaned.toLowerCase() === (email || '').toLowerCase()) {
      toast.info('That is already your current email address.');
      return;
    }
    setIsUpdatingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: cleaned });
      if (error) throw error;
      onProfileUpdated?.({ email: cleaned });
      toast.success('Confirmation link sent!', {
        description: `Check ${cleaned} to confirm your updated login email.`,
      });
      setIsEmailModalOpen(false);
      setNewEmail('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update email address.');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleDismissStanding = async () => {
    setIsDismissing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ account_standing: 'GOOD', standing_message: null })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Account standing acknowledged.');
      setLocalStanding('GOOD');
      setLocalMessage('');
      window.dispatchEvent(new Event('tradifive_profile_update'));
    } catch (err: any) {
      toast.error(err.message || 'Failed to acknowledge standing');
    } finally {
      setIsDismissing(false);
    }
  };

  const handleDirectPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully!');
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('No email associated with this account.');
      return;
    }
    setIsPasswordLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success(`Password reset link sent to ${maskEmail(email)}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to send password reset');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleToggleMfa = async () => {
    if (isMfaWorking) return;
    if (totpFactorId) {
      setIsMfaWorking(true);
      try {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactorId });
        if (error) throw error;
        setTotpFactorId(null);
        toast.info('Authenticator 2FA disabled.');
      } catch (err: any) {
        toast.error(err?.message || 'Unable to disable 2FA.');
      } finally {
        setIsMfaWorking(false);
      }
      return;
    }

    setIsMfaWorking(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'TradiFive Authenticator',
      });
      if (error) throw error;
      setMfaFactorPendingId(data.id);
      setMfaQrSvg(data.totp.qr_code);
      setMfaSecret(data.totp.secret);
      setMfaCode('');
      setIsMfaModalOpen(true);
    } catch (err: any) {
      toast.error(err?.message || '2FA enrollment is unavailable for this sign-in method.');
    } finally {
      setIsMfaWorking(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = mfaCode.replace(/\s+/g, '');
    if (cleaned.length !== 6) {
      toast.error('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setIsMfaWorking(true);
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorPendingId,
        code: cleaned,
      });
      if (error) throw error;
      setTotpFactorId(mfaFactorPendingId);
      setIsMfaModalOpen(false);
      setMfaCode('');
      toast.success('Two-Factor Authentication enabled!');
    } catch (err: any) {
      toast.error(err?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsMfaWorking(false);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    setIsRevokingSessions(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      setSessionRevoked(true);
      toast.success('Signed out from all other devices.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to revoke other sessions.');
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const handleSaveFamilyCenter = async () => {
    if (guardianEmail && !guardianEmail.includes('@')) {
      toast.error('Please enter a valid guardian or mentor email.');
      return;
    }

    localStorage.setItem('tf_guardian_email', guardianEmail);
    localStorage.setItem('tf_guardian_max_loss', guardianMaxLoss);
    localStorage.setItem('tf_guardian_strict_paper', String(guardianStrictPaper));
    localStorage.setItem('tf_guardian_weekly_report', String(guardianWeeklyReport));
    setFamilyCenterActive(Boolean(guardianEmail));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ guardian_email: guardianEmail || null } as any)
          .eq('id', user.id);
      }
    } catch {
      // Optional sync
    }

    toast.success(guardianEmail ? 'Guardian Guard active!' : 'Guardian settings saved.');
    setIsFamilyCenterModalOpen(false);
  };

  const handleExportTradingCsv = async () => {
    setIsExportingCsv(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please log in to export your trades.');

      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!trades || trades.length === 0) {
        toast.info('No recorded trades found to export.');
        return;
      }

      const headers = ['Trade ID', 'Symbol', 'Side', 'Lots', 'Open Price', 'Close Price', 'P&L', 'Closed At'];
      const rows = trades.map((t: any) => [
        t.id,
        t.symbol || 'N/A',
        t.type || t.side || 'BUY',
        t.lot_size ?? t.lots ?? t.quantity ?? 0,
        t.open_price ?? t.entry_price ?? t.price ?? 0,
        t.close_price ?? t.exit_price ?? 0,
        t.profit ?? t.pnl ?? 0,
        t.closed_at || t.created_at || '',
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tradifive_trade_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${trades.length} trades to CSV!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate CSV export');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportAccountJson = async () => {
    setIsExportingJson(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please log in to export your account data.');

      const [profileRes, tradesRes, riskRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('trades').select('*').eq('user_id', user.id).limit(500),
        supabase.from('user_risk_configs').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      const exportPayload = {
        export_version: '2.0.0',
        export_date: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: profileRes.data || {},
        risk_config: riskRes.data || {},
        trades: tradesRes.data || [],
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tradifive_account_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Account backup downloaded!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate JSON backup');
    } finally {
      setIsExportingJson(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      toast.error('Please type DELETE to confirm permanent account deletion.');
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User session not found.');
        navigate('/login');
        return;
      }

      const userId = user.id;

      try {
        await supabase.rpc('delete_user_account');
      } catch (rpcErr) {
        console.warn('RPC delete_user_account fallback execution:', rpcErr);
      }

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

      await supabase.auth.signOut();
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // Ignore storage restrictions
      }

      toast.success('Your account and all associated data have been permanently erased.');
      navigate('/account-deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account completely.');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      const sections = [
        'account-info',
        'password-security',
        'active-sessions',
        'account-standing',
        'family-center',
        'data-export',
        'danger-zone',
      ];
      let currentActive = sections[0];
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10;

      if (isAtBottom) {
        currentActive = sections[sections.length - 1];
      } else {
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el && container.scrollTop >= el.offsetTop - 150) {
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
      <div className="space-y-4 pb-16 font-sans animate-pulse">
        <div className={`${SETTINGS_CARD} h-40`} />
        <div className={`${SETTINGS_CARD} h-44`} />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16 font-sans">
      {/* SECTION 1: SIGN-IN & CONTACT DETAILS */}
      <section id="account-info">
        <div className={SETTINGS_CARD}>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Sign-In &amp; Contact
            </h3>
            <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
              Login email and mobile recovery contact for your account.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
            {/* Email */}
            <div className="py-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                  Email Address
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className={`text-[13.5px] font-semibold truncate ${email ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'}`}>
                    {email ? (revealEmail ? email : maskEmail(email)) : 'Not provided'}
                  </p>
                  {email && (
                    <button
                      type="button"
                      onClick={() => setRevealEmail(!revealEmail)}
                      className="text-[12px] font-semibold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {revealEmail ? 'Hide' : 'Reveal'}
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewEmail(email || '');
                  setIsEmailModalOpen(true);
                }}
                className="tactile-white-pill rounded-full px-4 py-1.5 text-[12px] font-semibold shrink-0 cursor-pointer"
              >
                Edit
              </button>
            </div>

            {/* Phone Number */}
            <div className="pt-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                  Phone Number
                </p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className={`text-[13.5px] font-semibold ${phoneNumber ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-neutral-500 italic'}`}>
                    {phoneNumber ? (revealPhone ? phoneNumber : maskPhone(phoneNumber)) : 'Not provided'}
                  </p>
                  {phoneNumber && (
                    <button
                      type="button"
                      onClick={() => setRevealPhone(!revealPhone)}
                      className="text-[12px] font-semibold text-[#2563EB] dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      {revealPhone ? 'Hide' : 'Reveal'}
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onEditPhone}
                className="tactile-white-pill rounded-full px-4 py-1.5 text-[12px] font-semibold shrink-0 cursor-pointer"
              >
                {phoneNumber ? 'Edit' : 'Add'}
              </button>
            </div>
          </div>

          {/* Update Email Modal */}
          <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
            <DialogContent className="sm:max-w-[420px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/10 rounded-[22px]">
              <DialogHeader>
                <DialogTitle className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail size={16} className="text-blue-600 dark:text-blue-400" />
                  Update Email Address
                </DialogTitle>
                <DialogDescription className="text-[12px] text-slate-500 dark:text-neutral-400">
                  A verification email will be sent to your new address to confirm the change.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateEmail} className="space-y-4 py-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <DialogFooter className="gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="tactile-white-pill rounded-full px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingEmail}
                    className="rounded-full px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {isUpdatingEmail ? 'Sending...' : 'Update Email'}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* SECTION 2: PASSWORD & TWO-FACTOR AUTHENTICATION */}
      <section id="password-security">
        <div className={SETTINGS_CARD}>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Password &amp; Authentication
            </h3>
            <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
              Protect your account credentials and enable 2FA verification.
            </p>
          </div>

          {/* Password Controls Box */}
          <div className={`${SETTINGS_BOX} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Key size={16} />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Account Password</h4>
                <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  Change your password directly or send a reset link via email.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={isPasswordLoading}
                className="tactile-white-pill rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold cursor-pointer disabled:opacity-60"
              >
                {isPasswordLoading ? 'Sending...' : 'Reset Email'}
              </button>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="tactile-black-pill rounded-full px-4 py-1.5 text-[11.5px] font-bold cursor-pointer"
              >
                Update Password
              </button>
            </div>
          </div>

          {/* Authenticator App (TOTP 2FA) Box */}
          <div className={`${SETTINGS_BOX} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Smartphone size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                    Authenticator App (2FA)
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      totpFactorId
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-200/70 dark:bg-white/10 text-slate-500 dark:text-neutral-400'
                    }`}
                  >
                    {totpFactorId ? 'Enabled' : 'Off'}
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-0.5">
                  Verify logins using Google Authenticator, 1Password, or Authy.
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={isMfaWorking}
              onClick={handleToggleMfa}
              className={`rounded-full px-4 py-1.5 text-[11.5px] font-bold shrink-0 cursor-pointer transition-all disabled:opacity-60 ${
                totpFactorId
                  ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100'
                  : 'tactile-white-pill'
              }`}
            >
              {isMfaWorking ? 'Working...' : totpFactorId ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>

          {/* Direct Password Dialog */}
          <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
            <DialogContent className="sm:max-w-[420px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/10 rounded-[22px]">
              <DialogHeader>
                <DialogTitle className="text-[16px] font-bold text-slate-900 dark:text-white">Update Password</DialogTitle>
                <DialogDescription className="text-[12px] text-slate-500 dark:text-neutral-400">
                  Enter a new password of at least 6 characters.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleDirectPasswordChange} className="space-y-4 py-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <DialogFooter className="gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    className="tactile-white-pill rounded-full px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="rounded-full px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Save Password'}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* TOTP 2FA Setup Dialog */}
          <Dialog open={isMfaModalOpen} onOpenChange={setIsMfaModalOpen}>
            <DialogContent className="sm:max-w-[420px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/10 rounded-[22px]">
              <DialogHeader>
                <DialogTitle className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck size={17} className="text-emerald-600" />
                  Set Up Authenticator 2FA
                </DialogTitle>
                <DialogDescription className="text-[12px] text-slate-500 dark:text-neutral-400">
                  Scan this QR code in Google Authenticator or Authy, then enter the 6-digit code.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleVerifyMfa} className="space-y-4 py-1">
                {mfaQrSvg && (
                  <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-slate-200">
                    <img src={mfaQrSvg} alt="2FA QR Code" className="w-36 h-36" />
                    {mfaSecret && (
                      <p className="text-[10.5px] font-mono text-slate-500 break-all text-center">
                        Secret: {mfaSecret}
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono tracking-widest bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <DialogFooter className="gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMfaModalOpen(false)}
                    className="tactile-white-pill rounded-full px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isMfaWorking}
                    className="rounded-full px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    {isMfaWorking ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* SECTION 3: ACTIVE LOGIN SESSIONS */}
      <section id="active-sessions">
        <div className={SETTINGS_CARD}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                Active Sessions
              </h3>
              <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                Current authenticated browser session and remote sign-out controls.
              </p>
            </div>
            <button
              type="button"
              disabled={isRevokingSessions || sessionRevoked}
              onClick={handleRevokeAllOtherSessions}
              className="tactile-white-pill rounded-full px-4 py-1.5 text-[11.5px] font-semibold shrink-0 cursor-pointer disabled:opacity-60"
            >
              {isRevokingSessions
                ? 'Signing out...'
                : sessionRevoked
                ? 'Other Devices Signed Out'
                : 'Sign Out Other Devices'}
            </button>
          </div>

          <div className={`${SETTINGS_BOX} flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Laptop size={17} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                    {currentDevice.browser} on {currentDevice.os}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Current Session
                  </span>
                </div>
                <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-0.5 truncate">
                  {sessionInfo.lastSignIn
                    ? `Signed in ${sessionInfo.lastSignIn} via ${sessionInfo.provider || 'email'}`
                    : 'Authenticated encrypted TLS session'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ACCOUNT STANDING */}
      <section id="account-standing">
        <div
          className={`${SETTINGS_CARD} ${
            standing === 'WARNING'
              ? '!bg-amber-50/70 dark:!bg-amber-500/10 !border-amber-200 dark:!border-amber-500/25'
              : standing === 'RESTRICTED'
              ? '!bg-orange-50/70 dark:!bg-orange-500/10 !border-orange-200 dark:!border-orange-500/25'
              : standing === 'BANNED'
              ? '!bg-rose-50/70 dark:!bg-rose-500/10 !border-rose-200 dark:!border-rose-500/25'
              : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  !standing || standing === 'GOOD'
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : standing === 'WARNING'
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : standing === 'RESTRICTED'
                    ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                    : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}
              >
                {!standing || standing === 'GOOD' ? (
                  <CheckCircle2 size={20} />
                ) : standing === 'WARNING' ? (
                  <AlertTriangle size={20} />
                ) : standing === 'RESTRICTED' ? (
                  <ShieldAlert size={20} />
                ) : (
                  <Ban size={20} />
                )}
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                  {!standing || standing === 'GOOD'
                    ? 'Account Standing: Good'
                    : standing === 'WARNING'
                    ? 'Account Warning'
                    : standing === 'RESTRICTED'
                    ? 'Account Restricted'
                    : 'Account Banned'}
                </h3>
                <p className="text-[12px] text-slate-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  {standingMessage ||
                    'No active warnings or restrictions on your TradiFive account.'}
                </p>
              </div>
            </div>
            {(standing === 'WARNING' || standing === 'RESTRICTED') && (
              <button
                type="button"
                onClick={handleDismissStanding}
                disabled={isDismissing}
                className="tactile-white-pill rounded-full px-4 py-1.5 text-xs font-semibold shrink-0 cursor-pointer"
              >
                {isDismissing ? 'Saving...' : 'Got It'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 5: GUARDIAN GUARD */}
      <section id="family-center">
        <div className={SETTINGS_CARD}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
                    Guardian &amp; Mentor Guard
                  </h3>
                  {familyCenterActive && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      Active · {guardianEmail}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
                  Assign a mentor or guardian email for drawdown alerts and weekly discipline summaries.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFamilyLearnMoreOpen(true)}
                className="tactile-white-pill rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold cursor-pointer"
              >
                Learn more
              </button>
              <button
                type="button"
                onClick={() => setIsFamilyCenterModalOpen(true)}
                className="rounded-full px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11.5px] font-bold shadow-sm transition-colors cursor-pointer"
              >
                {familyCenterActive ? 'Manage' : 'Configure'}
              </button>
            </div>
          </div>

          <Dialog open={isFamilyCenterModalOpen} onOpenChange={setIsFamilyCenterModalOpen}>
            <DialogContent className="sm:max-w-[440px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/10 rounded-[22px]">
              <DialogHeader>
                <DialogTitle className="text-[16px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                  Configure Guardian Guard
                </DialogTitle>
                <DialogDescription className="text-[12px] text-slate-500 dark:text-neutral-400">
                  Set protective drawdown thresholds and assign an accountability email.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Guardian / Mentor Email
                  </label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="mentor@domain.com"
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Max Daily Loss Limit
                  </label>
                  <input
                    type="number"
                    value={guardianMaxLoss}
                    onChange={(e) => setGuardianMaxLoss(e.target.value)}
                    placeholder="2500"
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-slate-50 dark:bg-[#202024] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className={`${SETTINGS_BOX} flex items-center justify-between gap-3`}>
                  <div>
                    <span className="text-[12.5px] font-bold text-slate-900 dark:text-white block">
                      Weekly Discipline Digest
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400">
                      Send weekly execution and rule-adherence summary.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuardianWeeklyReport(!guardianWeeklyReport)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
                      guardianWeeklyReport ? 'bg-blue-600' : 'bg-slate-300 dark:bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        guardianWeeklyReport ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFamilyCenterModalOpen(false)}
                  className="tactile-white-pill rounded-full px-4 py-2 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFamilyCenter}
                  className="rounded-full px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Save Guard Settings
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isFamilyLearnMoreOpen} onOpenChange={setIsFamilyLearnMoreOpen}>
            <DialogContent className="sm:max-w-[440px] bg-white dark:bg-[#1B1B20] border border-slate-200/80 dark:border-white/10 rounded-[22px]">
              <DialogHeader>
                <DialogTitle className="text-[16px] font-bold text-slate-900 dark:text-white">
                  About Guardian Guard
                </DialogTitle>
                <DialogDescription className="text-[12px] text-slate-500 dark:text-neutral-400">
                  Accountability and risk oversight without sharing broker credentials.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2.5 text-[12.5px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                <p>1. Receives read-only discipline summaries without seeing private passwords.</p>
                <p>2. Logs breaches if your configured daily drawdown threshold is hit.</p>
              </div>
              <DialogFooter>
                <button
                  type="button"
                  onClick={() => setIsFamilyLearnMoreOpen(false)}
                  className="tactile-black-pill rounded-full px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Got it
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* SECTION 6: DATA EXPORT */}
      <section id="data-export">
        <div className={SETTINGS_CARD}>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white tracking-tight">
              Export Trading &amp; Account Data
            </h3>
            <p className="text-[12px] text-slate-400 dark:text-neutral-500 mt-0.5">
              Download your recorded trades and account settings anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className={`${SETTINGS_BOX} flex flex-col justify-between gap-3`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FileSpreadsheet size={16} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Trading Ledger (CSV)</h4>
                  <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Spreadsheet export of your closed trades, lots, prices, and P&amp;L.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isExportingCsv}
                onClick={handleExportTradingCsv}
                className="tactile-white-pill rounded-full py-2 px-4 text-[12px] font-semibold w-full inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isExportingCsv ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download size={13} />}
                <span>{isExportingCsv ? 'Generating CSV...' : 'Download CSV'}</span>
              </button>
            </div>

            <div className={`${SETTINGS_BOX} flex flex-col justify-between gap-3`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileJson size={16} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">Account Backup (JSON)</h4>
                  <p className="text-[11.5px] text-slate-500 dark:text-neutral-400 mt-0.5">
                    Full archive of your profile, risk rules, and trade records.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isExportingJson}
                onClick={handleExportAccountJson}
                className="tactile-white-pill rounded-full py-2 px-4 text-[12px] font-semibold w-full inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isExportingJson ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download size={13} />}
                <span>{isExportingJson ? 'Generating JSON...' : 'Download JSON'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: DANGER ZONE */}
      <section id="danger-zone">
        <div className="rounded-[20px] bg-white dark:bg-[#1B1B20] border border-rose-200/90 dark:border-rose-500/25 shadow-[0_2px_14px_rgba(15,23,42,0.04)] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-[14px] font-bold text-rose-600 dark:text-rose-400 tracking-tight">
                Delete Account
              </h3>
              <p className="text-[12px] text-slate-500 dark:text-neutral-400 mt-0.5 max-w-md leading-relaxed">
                Permanently erase your account, trade ledger, MT5 links, and posts. This cannot be undone.
              </p>
            </div>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) setDeleteConfirmText('');
              }}
            >
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="rounded-full px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-bold shrink-0 shadow-sm transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[440px] border-rose-500/20 bg-white dark:bg-[#1B1B20] rounded-[22px]">
                <DialogHeader>
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-2">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <DialogTitle className="text-[16px] font-bold text-slate-900 dark:text-white">
                    Permanently Delete Account?
                  </DialogTitle>
                  <DialogDescription className="text-[12.5px] text-slate-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                    This permanently erases your login, trading ledger, MT5 connections, journal entries, and profile data.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-2">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                    Type <span className="text-rose-600 font-black">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    disabled={isDeleting}
                    className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#202024] text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <DialogFooter className="gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setDeleteConfirmText('');
                    }}
                    className="tactile-white-pill rounded-full px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                    className="rounded-full px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                    onClick={handleDeleteAccount}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Permanently Delete</span>
                    )}
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>
    </div>
  );
}
