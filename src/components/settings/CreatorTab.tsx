import React, { useState } from "react";
import { 
  Crown, User, Check, DollarSign, Wallet, TrendingUp, Users, 
  ExternalLink, Bell, Globe, Sparkles, RefreshCw, Mail, CheckCircle2,
  Lock, Zap, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface CreatorTabProps {
  privacySettings: any;
  setPrivacySettings: (val: any) => void;
  creatorHandle: string;
  setCreatorHandle: (val: string) => void;
  creatorCategory: string;
  setCreatorCategory: (val: string) => void;
  creatorBio: string;
  setCreatorBio: (val: string) => void;
  profile: any;
  selectedPlan?: string;
}

export default function CreatorTab({
  privacySettings,
  setPrivacySettings,
  creatorHandle,
  setCreatorHandle,
  creatorCategory,
  setCreatorCategory,
  creatorBio,
  setCreatorBio,
  profile,
  selectedPlan = 'starter',
}: CreatorTabProps) {
  const navigate = useNavigate();
  const isElite = selectedPlan === 'elite';
  const isCreatorMode = privacySettings?.account_type === "creator";

  // State local variables
  const [subEnabled, setSubEnabled] = useState(true);
  const [price, setPrice] = useState("29.99");
  const [tipsEnabled, setTipsEnabled] = useState(true);
  const [signalSyncEnabled, setSignalSyncEnabled] = useState(true);
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [stripeConnected, setStripeConnected] = useState(true);
  const [earnings, setEarnings] = useState(1245.50);
  const [withdrawing, setWithdrawing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Application verification state (simulated or real state tracker)
  const [verificationStatus, setVerificationStatus] = useState<"not_applied" | "review" | "approved">(
    isCreatorMode ? "approved" : "review"
  );

  const handleApply = () => {
    setVerificationStatus("review");
    toast.success("Verification application submitted successfully! Our compliance desk will review it shortly.");
  };

  const handleWithdraw = () => {
    if (earnings <= 0) {
      toast.error("No earnings available for withdrawal.");
      return;
    }
    setWithdrawing(true);
    toast.loading("Initiating withdrawal via Stripe Express...", { id: "withdraw" });
    
    setTimeout(() => {
      setEarnings(0);
      setWithdrawing(false);
      toast.success("Withdrawal of $" + earnings.toFixed(2) + " successfully completed! Funds will reach your bank account in 1-2 business days.", { id: "withdraw" });
    }, 2500);
  };

  const handleSwitchAccountType = async (type: "personal" | "creator") => {
    setPrivacySettings((prev: any) => {
      const updated = {
        ...prev,
        account_type: type,
        is_private: type !== "personal" ? false : prev?.is_private,
      };

      // Also write to privacy localStorage immediately
      try {
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            localStorage.setItem(`tradifive_privacy_${user.id}`, JSON.stringify(updated));
          }
        });
      } catch (e) {
        console.error(e);
      }

      return updated;
    });
    localStorage.setItem("tradifive_cached_account_type", type);
    window.dispatchEvent(new Event("storage"));
    
    // Update Supabase immediately
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // await supabase.from("profiles").update({ account_type: type }).eq("id", user.id);
        window.dispatchEvent(new Event("tradifive_profile_update"));
      }
    } catch (err) {
      console.error(err);
    }
    
    setVerificationStatus(type === "creator" ? "approved" : "review");
    toast.success(`Account switched to ${type.toUpperCase()} mode.`);
  };

  const handleSaveSettings = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Creator account configurations saved!");
    }, 800);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Account Mode Switch Card — Elite gated */}
      <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm dark:shadow-none">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Account Mode</h2>
            <p className="text-sm text-slate-500 dark:text-[#949ba4] mt-1">Switch between Personal and Creator to unlock monetization and mentorship features.</p>
          </div>
          {!isElite && (
            <span className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <Lock size={10} /> Elite Only
            </span>
          )}
        </div>

        {isElite ? (
          // ── Elite subscriber: show the actual switch ────────────────────
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            {/* Personal Card */}
            <div 
              onClick={() => handleSwitchAccountType("personal")}
              className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                !isCreatorMode 
                  ? "border-blue-500 bg-blue-500/[0.02] dark:bg-blue-500/[0.02]" 
                  : "border-slate-200 dark:border-[#333333] bg-slate-50/50 dark:bg-[#1c1c1e] hover:border-slate-300 dark:hover:border-white/5"
              }`}
            >
              {!isCreatorMode && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!isCreatorMode ? "bg-blue-500/10 text-blue-500" : "bg-slate-200 dark:bg-zinc-800 text-slate-500"}`}>
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Account</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Connect MT4/MT5, write posts, and follow creators.</p>
                </div>
              </div>
            </div>

            {/* Creator Card */}
            <div 
              onClick={() => handleSwitchAccountType("creator")}
              className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                isCreatorMode 
                  ? "border-purple-500 bg-purple-500/[0.02] dark:bg-purple-500/[0.02]" 
                  : "border-slate-200 dark:border-[#333333] bg-slate-50/50 dark:bg-[#1c1c1e] hover:border-slate-300 dark:hover:border-white/5"
              }`}
            >
              {isCreatorMode && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCreatorMode ? "bg-purple-500/10 text-purple-500" : "bg-slate-200 dark:bg-zinc-800 text-slate-500"}`}>
                  <Crown size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Creator Account</h3>
                    <span className="text-[8px] font-black bg-purple-500 text-white px-1.5 py-0.5 rounded tracking-wide">PRO</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">Sell subscriptions, broadcast signals, and manage channels.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // ── Non-elite: locked upgrade prompt ───────────────────────────
          <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-purple-500/30 bg-gradient-to-br from-purple-500/[0.04] to-blue-500/[0.03] p-6">
            {/* Decorative glow */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Icon */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Crown size={26} className="text-purple-500" />
              </div>

              {/* Copy */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white">Creator Mode is an Elite Feature</h3>
                  <span className="text-[9px] font-black bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded tracking-widest">ELITE</span>
                </div>
                <p className="text-[13px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                  Upgrade to the <strong className="text-slate-700 dark:text-slate-200">Elite Plan</strong> to unlock Creator Mode — monetise your signals, run mentorship programs, build private communities, and access the Creator Dashboard.
                </p>

                {/* What's included teaser */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {[
                    'Creator Dashboard & analytics',
                    'Mentorship Hub for students',
                    'Paid subscriptions & tipping',
                    'Community signal broadcasting',
                    'Stripe earnings & payouts',
                    'Discord webhook integrations',
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-zinc-400">
                      <CheckCircle2 size={13} className="text-purple-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={() => navigate('/upgrade?plan=elite')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-[13px] font-bold shadow-md shadow-purple-500/20 transition-all active:scale-95"
              >
                <Zap size={14} /> Upgrade to Elite
              </button>
              <button
                onClick={() => navigate('/upgrade')}
                className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Compare plans <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Verification Application Status (if not creator mode / under review) */}
      {isElite && !isCreatorMode && (
        <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2a2a2a] pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Verification Application</h3>
            {verificationStatus === "review" ? (
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                Under Review
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-850 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-transparent">
                Not Applied
              </span>
            )}
          </div>

          {verificationStatus === "review" ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-650 dark:text-[#B5BAC1] leading-relaxed">
                Our content moderation board is currently validating your trading history and audience metrics. You will receive an automated email notification once approved.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C1C1E] border border-slate-200 dark:border-[#2b2b2b] text-xs text-slate-500 dark:text-zinc-400 space-y-2 mt-4">
                <p className="font-bold text-slate-700 dark:text-zinc-300">Pending Review Audits:</p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Broker identity match verification: Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Win-rate checklist (Minimum 10 trades): Passed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Historical maximum drawdown audit: Ongoing</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-650 dark:text-[#B5BAC1] leading-relaxed">
                Unlock monetization capabilities, charge monthly membership fees, share premium trade hooks, and display a verified PRO creator badge on your feed.
              </p>
              <div className="space-y-2.5 my-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-350">Requirements to Apply:</h4>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span>Link an active read-only broker account (MT4, MT5, or cTrader).</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span>Complete KYC/AML verification under Settings &gt; Account.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-zinc-400">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span>Execute a minimum of 10 trades on your linked ledger.</span>
                </div>
              </div>
              <button 
                onClick={handleApply}
                className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors text-white text-xs font-bold shadow-md shadow-indigo-500/10"
              >
                Submit Application
              </button>
            </div>
          )}
        </div>
      )}

      {/* If approved/switch is on Creator, unlock all advanced configurations */}
      {isCreatorMode && (
        <>
          {/* Status approved banner */}
          <div className="flex items-center justify-between p-4 bg-emerald-500/[0.03] border border-emerald-500/20 rounded-2xl shadow-sm select-none">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-500 leading-none">Creator Account Verified</p>
                <p className="text-[10px] text-zinc-500 mt-1">Your profile features a PRO verification badge and unlocks premium options.</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Status: Active</span>
          </div>


          {/* 4. Monetization & Signal Pricing Settings */}
          <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-[#2a2a2a] pb-3.5">
              Monetization & Signal Settings
            </h3>

            <div className="space-y-6">
              {/* Subscription Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#1c1c1e] border border-slate-200/50 dark:border-[#2b2b2b]">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Enable Premium Membership</h4>
                  <p className="text-xs text-slate-500 mt-1">Allow other users to pay a subscription to view your private feed and copy signals.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={subEnabled} onChange={e => setSubEnabled(e.target.checked)} />
                  <div className="w-10 h-6 bg-slate-300 dark:bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {subEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                  {/* Subscription price */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wide">Monthly Subscription Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-[13px] font-bold text-slate-500">$</span>
                      <input 
                        type="number" 
                        value={price} 
                        onChange={e => setPrice(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl pl-8 pr-12 py-2.5 text-[13px] font-bold text-slate-800 dark:text-white outline-none focus:border-[#3b82f6]"
                      />
                      <span className="absolute right-4 top-3.5 text-[10px] font-bold text-slate-500 uppercase">/ month</span>
                    </div>
                  </div>

                  {/* Signal sync */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wide">Trade Signal Webhooks</label>
                    <label className="flex items-center justify-between w-full h-[46px] px-4 py-2 bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl cursor-pointer">
                      <span className="text-xs font-bold text-slate-550 dark:text-zinc-400">Auto-Broadcast Trades</span>
                      <div className="relative inline-flex items-center">
                        <input type="checkbox" className="sr-only peer" checked={signalSyncEnabled} onChange={e => setSignalSyncEnabled(e.target.checked)} />
                        <div className="w-8 h-4.5 bg-slate-300 dark:bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-purple-500"></div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tips Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-[#1c1c1e] border border-slate-200/50 dark:border-[#2b2b2b]">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">Enable Viewer Tipping</h4>
                  <p className="text-xs text-slate-500 mt-1">Allow followers to tip your profile in custom values directly from your publications.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={tipsEnabled} onChange={e => setTipsEnabled(e.target.checked)} />
                  <div className="w-10 h-6 bg-slate-300 dark:bg-[#333333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 5. Integrations & Discord Alerting */}
          <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-[#2a2a2a] pb-3.5">
              Community Sync Alerts
            </h3>

            <div className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Automatically push trade updates, chart posts, and signal notifications to your external community servers.
              </p>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wide">Discord Channel Webhook URL</label>
                <input 
                  type="text" 
                  value={discordWebhook}
                  placeholder="https://discord.com/api/webhooks/..." 
                  onChange={e => setDiscordWebhook(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-[#202020] border border-slate-200/60 dark:border-[#333333] rounded-xl px-4 py-2.5 text-[13px] font-medium text-slate-800 dark:text-white outline-none focus:border-[#3b82f6] transition-colors focus:ring-1 focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          {/* 6. Earnings Withdrawals & Stripe Connect */}
          <div className="bg-white dark:bg-[#151515] rounded-2xl border border-slate-200 dark:border-[#333333] p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 border-b border-slate-100 dark:border-[#2a2a2a] pb-3.5">
              Creator Earnings & Stripe
            </h3>

            <div className="space-y-6">
              {/* Mock Earnings stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-[#1C1C1E] border border-slate-200/50 dark:border-[#2b2b2b] rounded-xl">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Available Balance</span>
                    <Wallet size={14} className="text-purple-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">${earnings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#1C1C1E] border border-slate-200/50 dark:border-[#2b2b2b] rounded-xl">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Active Subs</span>
                    <Users size={14} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">42</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-[#1C1C1E] border border-slate-200/50 dark:border-[#2b2b2b] rounded-xl">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Lifetime Gross</span>
                    <TrendingUp size={14} className="text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">₹5,840.00</p>
                </div>
              </div>

              {/* Stripe connected state card */}
              <div className="p-4 bg-[#0A0A0C] border border-[#232328] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#5433FF]/10 text-[#5433FF] dark:text-[#a594ff] flex items-center justify-center font-bold text-sm">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white leading-none">Stripe Express Account</p>
                      <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 leading-none">Connected</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1">Payout status active: `acct_1Nj382xXX9112`</p>
                  </div>
                </div>
                
                <button 
                  type="button"
                  className="px-3.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-750 bg-zinc-900 text-zinc-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  Manage Stripe
                  <ExternalLink size={11} className="text-zinc-500" />
                </button>
              </div>

              <div className="flex justify-end mt-8">
                <button 
                  onClick={handleSaveSettings}
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/10 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isUpdating ? "Saving..." : "Save Config"}
                </button>
              </div>

            </div>
          </div>
        </>
      )}

    </div>
  );
}
