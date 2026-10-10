import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  X, User, Wallet, TrendingUp, ShieldCheck, ShieldAlert,
  MessageSquare, History, Terminal, Activity, DollarSign,
  BadgeAlert, Clock, ArrowUpRight, ArrowDownRight, Bell,
  Trash2, Send, UserX, UserCheck, CreditCard, AlertTriangle,
  Eye, Lock, Unlock, RefreshCcw, Ban, CheckCircle2, Crown,
  Mail, Phone, MapPin, Calendar, Zap, Star, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createNotification } from "../lib/notifications";

interface UserDeepScanProps {
  userId: string;
  onClose: () => void;
}

type TabId = "overview" | "trades" | "comm" | "discipline" | "activity" | "controls";

const NOTIFICATION_TEMPLATES = [
  { label: "Account Warning", type: "SECURITY" as const, title: "Account Warning", message: "Your account has received a compliance warning. Please review our terms of service." },
  { label: "Platform Update", type: "SYSTEM" as const, title: "Platform Update Available", message: "A new platform update is available. Please refresh your app for the latest features." },
  { label: "Billing Reminder", type: "BILLING" as const, title: "Subscription Renewal Reminder", message: "Your subscription is due for renewal. Please update your payment details to avoid interruption." },
  { label: "Support Response", type: "SUPPORT" as const, title: "Support Team Response", message: "Our support team has responded to your inquiry. Please check your support tickets." },
  { label: "Trade Alert", type: "TRADE" as const, title: "Trade Activity Alert", message: "Unusual trading activity has been detected on your account. Please review your recent trades." },
];

export default function UserDeepScan({ userId, onClose }: UserDeepScanProps) {
  const [data, setData] = useState<any>({
    profile: null, account: null, trades: [], tickets: [],
    feedback: [], logs: [], notifications: [], journals: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [customNotif, setCustomNotif] = useState({ title: "", message: "", type: "SYSTEM" as const });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [standing, setStanding] = useState("GOOD");
  const [standingMessage, setStandingMessage] = useState("");

  useEffect(() => {
    if (data.profile) {
      setStanding(data.profile.account_standing || "GOOD");
      setStandingMessage(data.profile.standing_message || "");
    }
  }, [data.profile]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [profileRes, accountRes, tradesRes, ticketsRes, feedbackRes, logsRes, notifsRes, journalsRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).single(),
          supabase.from("mt5_accounts").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("trades").select("*").eq("user_id", userId).order("closed_at", { ascending: false }).limit(50),
          supabase.from("support_tickets").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
          supabase.from("user_feedback").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
          supabase.from("user_activity_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
          supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
          supabase.from("journal_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20)
        ]);
        setData({
          profile: profileRes.data, account: accountRes.data,
          trades: tradesRes.data || [], tickets: ticketsRes.data || [],
          feedback: feedbackRes.data || [], logs: logsRes.data || [],
          notifications: notifsRes.data || [], journals: journalsRes.data || []
        });
      } catch (err) {
        console.error("Deep Scan Failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();

    const ch = supabase.channel(`deep_scan_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (p: any) => setData((prev: any) => ({ ...prev, profile: p.new })))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  // ─── ACTIONS ───────────────────────────────────────────────────────────────

  const toggleFreeze = async () => {
    const isFrozen = data.profile?.is_frozen || data.profile?.is_banned;
    setActionLoading("freeze");
    
    // Use the RPC function which bypasses RLS safely
    const { error } = await supabase.rpc('admin_ban_user', {
      target_user_id: userId,
      ban_status: !isFrozen
    });

    if (!error) {
      setData((prev: any) => ({ ...prev, profile: { ...prev.profile, is_frozen: !isFrozen, is_banned: !isFrozen } }));
      await createNotification({
        userId, type: "SECURITY",
        title: isFrozen ? "Account Access Restored" : "Account Access Suspended",
        message: isFrozen
          ? "Your account access has been fully restored by the compliance team. Welcome back."
          : "Your account has been temporarily suspended pending a compliance review. Contact support for details.",
        priority: "high"
      });
      showToast(isFrozen ? "✅ Account Restored" : "🔒 Account Frozen");
    } else {
      console.error("RPC Error:", error);
      showToast("Action failed — check Supabase RLS permissions", "error");
    }
    setActionLoading(null);
  };

  const updateStanding = async () => {
    setActionLoading("standing");
    const { error } = await supabase.rpc('admin_update_standing', {
      target_user_id: userId,
      p_standing: standing,
      p_message: standingMessage
    });

    if (!error) {
      setData((prev: any) => ({
        ...prev,
        profile: {
          ...prev.profile,
          account_standing: standing,
          standing_message: standingMessage,
          is_banned: standing === "BANNED",
          is_frozen: standing === "BANNED" || standing === "RESTRICTED"
        }
      }));
      await createNotification({
        userId, type: "SECURITY",
        title: standing === "GOOD" ? "Account in Good Standing" : `Account Standing: ${standing}`,
        message: standingMessage || (
          standing === "GOOD"
            ? "Your account is back in good standing. Thank you for following our guidelines."
            : `Your account standing is now ${standing}. Please check your settings.`
        ),
        priority: "high"
      });
      showToast("✅ Account Standing Updated");
    } else {
      console.error(error);
      showToast("Standing update failed", "error");
    }
    setActionLoading(null);
  };

  const changePlan = async (newPlan: string) => {
    setActionLoading("plan");
    const { error } = await supabase.rpc('admin_change_plan', {
      target_user_id: userId,
      p_plan: newPlan
    });
    if (!error) {
      setData((prev: any) => ({ ...prev, profile: { ...prev.profile, subscription_status: newPlan } }));
      await createNotification({
        userId, type: "BILLING",
        title: "Subscription Plan Updated",
        message: `Your subscription has been changed to ${newPlan.toUpperCase()} by the admin team.`,
        priority: "normal"
      });
      showToast(`✅ Plan changed to ${newPlan.toUpperCase()}`);
    } else {
      showToast("Plan change failed", "error");
    }
    setActionLoading(null);
  };

  const resetXP = async () => {
    setActionLoading("xp");
    const { error } = await supabase.rpc('admin_reset_xp', {
      target_user_id: userId
    });
    if (!error) {
      setData((prev: any) => ({ ...prev, profile: { ...prev.profile, xp: 0, streak_days: 0, discipline_level: 1 } }));
      await createNotification({
        userId, type: "ACCOUNT",
        title: "XP & Progress Reset",
        message: "Your experience points and streak have been reset by the admin team.",
        priority: "high"
      });
      showToast("✅ XP & Streak Reset");
    } else {
      showToast("Reset failed", "error");
    }
    setActionLoading(null);
  };

  const sendCustomNotification = async () => {
    if (!customNotif.title || !customNotif.message) return;
    setActionLoading("notif");
    await createNotification({
      userId, type: customNotif.type,
      title: customNotif.title, message: customNotif.message,
      priority: "high"
    });
    // Log in activity
    await supabase.from("user_activity_logs").insert([{
      user_id: userId, event_type: "ADMIN_NOTIFICATION",
      description: `Admin sent notification: "${customNotif.title}"`
    }]).select();
    showToast("✅ Notification delivered to user");
    setShowNotifModal(false);
    setCustomNotif({ title: "", message: "", type: "SYSTEM" });
    setActionLoading(null);
  };

  const useTemplate = (tpl: typeof NOTIFICATION_TEMPLATES[0]) => {
    setCustomNotif({ title: tpl.title, message: tpl.message, type: tpl.type as any });
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== data.profile?.email) return;
    setActionLoading("delete");
    // Soft delete via RPC to bypass RLS
    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: userId
    });
    if (!error) {
      showToast("✅ Account flagged as deleted. Remove from auth via Supabase Dashboard.");
      setShowDeleteModal(false);
      setTimeout(onClose, 1500);
    } else {
      showToast("Delete failed — check Supabase RLS", "error");
    }
    setActionLoading(null);
  };

  const markTradesAllowlisted = async () => {
    setActionLoading("whitelist");
    await supabase.rpc('admin_verify_account', { target_user_id: userId });
    setData((prev: any) => ({ ...prev, profile: { ...prev.profile, is_verified: true } }));
    await createNotification({ userId, type: "ACCOUNT", title: "Account Verified", message: "Your account has been verified by the admin team. You now have full access.", priority: "normal" });
    showToast("✅ Account marked as verified");
    setActionLoading(null);
  };

  if (loading && !data.profile) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.3em] animate-pulse">Initiating Surgical Probe...</p>
        </div>
      </div>
    );
  }

  const netPnl = data.trades.reduce((acc: number, t: any) => acc + (t.profit || 0), 0);
  const winRate = data.trades.length > 0
    ? Math.round((data.trades.filter((t: any) => t.profit > 0).length / data.trades.length) * 100)
    : 0;

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Financial Core", icon: Wallet },
    { id: "trades", label: "Execution Logs", icon: History },
    { id: "discipline", label: "Profile & Stats", icon: ShieldCheck },
    { id: "comm", label: "Support", icon: MessageSquare },
    { id: "activity", label: "Activity Feed", icon: Activity },
    { id: "controls", label: "⚙ Admin Controls", icon: Terminal },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-2xl border ${toast.type === "success" ? "bg-emerald-900/80 border-emerald-500/30 text-emerald-400" : "bg-red-900/80 border-red-500/30 text-red-400"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-6xl h-full max-h-[92vh] bg-[#0e0e0e] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-bold text-lg uppercase ${data.profile?.is_frozen ? "border-red-500/50 bg-red-500/10 text-red-400" : "border-blue-500/30 bg-blue-500/10 text-blue-400"}`}>
              {data.profile?.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-white tracking-widest uppercase">{data.profile?.full_name || "Unknown User"}</h2>
                {data.profile?.is_frozen && <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 uppercase animate-pulse">FROZEN</span>}
                {data.profile?.is_verified && <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase">VERIFIED</span>}
                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${
                  data.profile?.subscription_status === "elite" ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                  data.profile?.subscription_status === "pro" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                  "bg-neutral-500/10 border-neutral-500/20 text-neutral-500"
                }`}>{data.profile?.subscription_status || "free"}</span>
              </div>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{data.profile?.email} • ID: {userId.substring(0, 12)}...</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white border border-white/5 transition-all">
            <X size={16} />
          </button>
        </header>

        {/* Tabs */}
        <div className="px-6 border-b border-white/5 bg-black/20 flex gap-1 overflow-x-auto shrink-0">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-3 text-[9px] font-bold uppercase tracking-[0.12em] flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? "border-blue-500 text-white" : "border-transparent text-neutral-600 hover:text-neutral-400"} ${tab.id === "controls" ? "text-amber-500 border-amber-500/50" : ""}`}
            >
              <tab.icon size={11} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-black/10">
          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Account Balance", value: `$${data.account?.balance?.toLocaleString() || "0"}`, icon: DollarSign, color: "text-blue-400" },
                    { label: "Equity", value: `$${data.account?.equity?.toLocaleString() || "0"}`, icon: Activity, color: "text-emerald-400" },
                    { label: "Net P&L", value: `$${netPnl.toFixed(2)}`, icon: TrendingUp, color: netPnl >= 0 ? "text-emerald-500" : "text-red-500" },
                    { label: "Win Rate", value: `${winRate}%`, icon: BarChart3, color: "text-amber-400" },
                  ].map((m, i) => (
                    <div key={i} className="bg-[#1a1a1a] border border-white/5 p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <m.icon size={14} className="text-neutral-600" />
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
                      </div>
                      <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{m.label}</p>
                      <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Card */}
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><User size={12} className="text-blue-500" /> Identity Record</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {[
                        { label: "Email", value: data.profile?.email, icon: Mail },
                        { label: "Phone", value: data.profile?.phone || "Not provided", icon: Phone },
                        { label: "Location", value: `${data.profile?.city || ""}${data.profile?.city ? ", " : ""}${data.profile?.country || "Not provided"}`, icon: MapPin },
                        { label: "Joined", value: data.profile?.created_at ? new Date(data.profile.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Unknown", icon: Calendar },
                        { label: "Instagram", value: data.profile?.instagram_id ? `@${data.profile.instagram_id}` : "Not provided", icon: Star },
                      ].map(row => (
                        <div key={row.label} className="flex items-center gap-3">
                          <row.icon size={11} className="text-neutral-700 shrink-0" />
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{row.label}</span>
                            <span className="text-[10px] text-neutral-300 font-mono text-right ml-4 truncate max-w-[200px]">{row.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                      <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={12} className="text-amber-500" /> Account Status</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {[
                        { label: "Account State", value: (data.profile?.is_frozen || data.profile?.is_banned) ? "FROZEN" : "OPERATIONAL", color: (data.profile?.is_frozen || data.profile?.is_banned) ? "text-red-400" : "text-emerald-400" },
                        { label: "Subscription", value: (data.profile?.subscription_status || "free").toUpperCase(), color: "text-blue-400" },
                        { label: "Verified", value: data.profile?.is_verified ? "YES" : "NO", color: data.profile?.is_verified ? "text-emerald-400" : "text-neutral-500" },
                        { label: "MT5 Account", value: data.account ? "LINKED" : "NOT LINKED", color: data.account ? "text-emerald-400" : "text-neutral-500" },
                        { label: "MT5 Algo", value: data.account?.algo_status ? "RUNNING" : "HALTED", color: data.account?.algo_status ? "text-emerald-400" : "text-neutral-500" },
                        { label: "Open Tickets", value: `${data.tickets.filter((t: any) => t.status === "open").length} open`, color: data.tickets.filter((t: any) => t.status === "open").length > 0 ? "text-amber-400" : "text-neutral-500" },
                      ].map(row => (
                        <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                          <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{row.label}</span>
                          <span className={`text-[10px] font-bold ${row.color}`}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><Bell size={12} className="text-blue-500" /> Notifications Sent to User</h3>
                    <span className="text-[9px] text-neutral-600">{data.notifications.length} total</span>
                  </div>
                  <div className="divide-y divide-white/[0.03] max-h-[250px] overflow-y-auto">
                    {data.notifications.length === 0 ? (
                      <p className="text-[10px] text-neutral-700 uppercase text-center py-10 tracking-widest">No notifications</p>
                    ) : data.notifications.map((n: any, i: number) => (
                      <div key={i} className="px-5 py-3 flex items-start gap-3">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.is_read ? "bg-neutral-700" : "bg-blue-500"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-neutral-300 uppercase truncate">{n.title}</p>
                          <p className="text-[9px] text-neutral-600 mt-0.5 truncate">{n.message}</p>
                        </div>
                        <span className="text-[8px] text-neutral-700 font-mono whitespace-nowrap">{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── TRADES ── */}
            {activeTab === "trades" && (
              <motion.div key="trades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Total Trades", value: data.trades.length },
                    { label: "Win Rate", value: `${winRate}%` },
                    { label: "Net P&L", value: `$${netPnl.toFixed(2)}` },
                    { label: "Avg Trade", value: data.trades.length > 0 ? `$${(netPnl / data.trades.length).toFixed(2)}` : "₹0" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4">
                      <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-lg font-bold text-white">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Last 50 Executions</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-black/20 border-b border-white/5">
                        <tr>
                          {["Date", "Ticket", "Symbol", "Type", "Volume", "Profit"].map(h => (
                            <th key={h} className="px-5 py-3 text-[9px] font-bold text-neutral-600 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {data.trades.length === 0 ? (
                          <tr><td colSpan={6} className="py-16 text-center text-[10px] text-neutral-700 uppercase tracking-widest">No trade history found</td></tr>
                        ) : data.trades.map((t: any) => (
                          <tr key={t.id} className="hover:bg-white/[0.01]">
                            <td className="px-5 py-3 text-[10px] text-neutral-500 font-mono">{t.closed_at ? new Date(t.closed_at).toLocaleDateString() : "—"}</td>
                            <td className="px-5 py-3 text-[10px] text-neutral-600 font-mono">#{t.ticket}</td>
                            <td className="px-5 py-3 text-[11px] text-white font-bold">{t.symbol}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${t.trade_type === "BUY" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>{t.trade_type}</span>
                            </td>
                            <td className="px-5 py-3 text-[10px] text-neutral-500 font-mono">{t.volume || "—"}</td>
                            <td className={`px-5 py-3 font-bold text-[11px] ${t.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>${t.profit >= 0 ? "+" : ""}{(t.profit || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── DISCIPLINE ── */}
            {activeTab === "discipline" && (
              <motion.div key="discipline" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Discipline Level", value: `Lvl ${data.profile?.discipline_level || 1}` },
                    { label: "Total XP", value: `${(data.profile?.xp || 0).toLocaleString()} XP` },
                    { label: "Streak", value: `${data.profile?.streak_days || 0} days 🔥` },
                    { label: "Journal Entries", value: data.journals.length },
                  ].map(s => (
                    <div key={s.label} className="bg-[#1a1a1a] border border-white/5 p-4 rounded-xl">
                      <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-lg font-bold text-white">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]"><h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Personal Info</h3></div>
                    <div className="p-5 space-y-3">
                      {[
                        ["Phone", data.profile?.phone], ["DOB", data.profile?.date_of_birth], ["Gender", data.profile?.gender],
                        ["Instagram", data.profile?.instagram_id ? `@${data.profile.instagram_id}` : null],
                        ["Address", data.profile?.address], ["City", data.profile?.city], ["State", data.profile?.state], ["Country", data.profile?.country],
                      ].map(([label, value]) => (
                        <div key={label as string} className="flex justify-between py-1.5 border-b border-white/[0.02] last:border-0">
                          <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">{label}</span>
                          <span className="text-[10px] text-neutral-300 font-mono">{value as string || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]"><h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Journal Entries</h3></div>
                    <div className="p-5 space-y-3 max-h-[350px] overflow-y-auto">
                      {data.journals.length === 0 ? (
                        <p className="text-[10px] text-neutral-700 uppercase tracking-widest text-center py-10">No journals</p>
                      ) : data.journals.map((j: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                          <div className="flex justify-between mb-1.5">
                            <p className="text-[10px] font-bold text-neutral-300">{j.title || j.symbol || "Entry"}</p>
                            <span className="text-[8px] text-neutral-600 font-mono">{new Date(j.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-[9px] text-neutral-500 line-clamp-2">{j.notes || j.description || "No notes"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SUPPORT ── */}
            {activeTab === "comm" && (
              <motion.div key="comm" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><BadgeAlert size={12} className="text-orange-500" /> Support Tickets ({data.tickets.length})</h3>
                  </div>
                  <div className="divide-y divide-white/[0.03] max-h-[300px] overflow-y-auto">
                    {data.tickets.length === 0 ? (
                      <p className="text-[10px] text-neutral-700 uppercase text-center py-10 tracking-widest">No tickets raised</p>
                    ) : data.tickets.map((ticket: any) => (
                      <div key={ticket.id} className="px-5 py-4">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[11px] font-bold text-white">{ticket.subject}</p>
                          <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${ticket.status === "open" ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"}`}>{ticket.status}</span>
                        </div>
                        <p className="text-[9px] text-neutral-500 mb-1.5">{ticket.description}</p>
                        <span className="text-[8px] text-neutral-700 font-mono">{new Date(ticket.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={12} className="text-emerald-500" /> User Feedback ({data.feedback.length})</h3>
                  </div>
                  <div className="divide-y divide-white/[0.03] max-h-[250px] overflow-y-auto">
                    {data.feedback.length === 0 ? (
                      <p className="text-[10px] text-neutral-700 uppercase text-center py-10 tracking-widest">No feedback submitted</p>
                    ) : data.feedback.map((f: any, i: number) => (
                      <div key={i} className="px-5 py-4">
                        <div className="flex items-center gap-1 mb-1.5">
                          {[1,2,3,4,5].map(s => <span key={s} className={`text-[10px] ${s <= f.rating ? "text-amber-400" : "text-neutral-700"}`}>★</span>)}
                          <span className="ml-2 text-[8px] text-neutral-600 font-mono">{new Date(f.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] font-bold text-neutral-400 mb-1">{f.category || "Review"}</p>
                        <p className="text-[9px] text-neutral-500 italic">"{f.description}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ACTIVITY ── */}
            {activeTab === "activity" && (
              <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><Activity size={12} className="text-blue-500" /> Activity Log ({data.logs.length})</h3>
                    <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /><span className="text-[8px] text-neutral-600 uppercase tracking-widest">Live Trace</span></div>
                  </div>
                  <div className="p-5">
                    {data.logs.length === 0 ? (
                      <div className="py-16 text-center"><Terminal size={28} className="text-neutral-800 mb-4 mx-auto" /><p className="text-[10px] text-neutral-600 uppercase tracking-widest">No activity recorded</p></div>
                    ) : (
                      <div className="space-y-3">
                        {data.logs.map((log: any) => (
                          <div key={log.id} className="flex gap-3 p-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${log.event_type === "LOGIN" ? "bg-emerald-500/10 text-emerald-500" : log.event_type === "LOGOUT" ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"}`}>
                              {log.event_type === "LOGIN" ? <ArrowUpRight size={12} /> : log.event_type === "LOGOUT" ? <ArrowDownRight size={12} /> : <Activity size={12} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <p className="text-[10px] font-bold text-white uppercase tracking-tight">{log.event_type}</p>
                                <span className="text-[8px] text-neutral-600 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-[9px] text-neutral-500 mt-0.5">{log.description || "System event recorded"}</p>
                              {log.ip_address && <p className="text-[8px] text-neutral-700 font-mono mt-0.5">IP: {log.ip_address}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ADMIN CONTROLS ── */}
            {activeTab === "controls" && (
              <motion.div key="controls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Warning banner */}
                <div className="bg-amber-500/[0.04] border border-amber-500/15 rounded-xl p-4 flex items-center gap-3">
                  <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wide">All actions below are permanent and immediately affect the user's web & mobile experience.</p>
                </div>

                {/* Section: Account Governance */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={12} className="text-red-400" /> Account Governance</h3>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Freeze / Unfreeze */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[11px] font-bold text-white uppercase">{(data.profile?.is_frozen || data.profile?.is_banned) ? "Restore Account" : "Freeze Account"}</p>
                          <p className="text-[9px] text-neutral-500 mt-1">{(data.profile?.is_frozen || data.profile?.is_banned) ? "Re-enable full platform access" : "Block all trading & platform access"}</p>
                        </div>
                        {(data.profile?.is_frozen || data.profile?.is_banned) ? <Unlock size={18} className="text-emerald-500" /> : <Lock size={18} className="text-red-400" />}
                      </div>
                      <button onClick={toggleFreeze} disabled={actionLoading === "freeze"}
                        className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${(data.profile?.is_frozen || data.profile?.is_banned) ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20" : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"}`}>
                        {actionLoading === "freeze" ? "Processing..." : (data.profile?.is_frozen || data.profile?.is_banned) ? "🔓 Restore Account" : "🔒 Freeze Account"}
                      </button>
                    </div>

                    {/* Verify Account */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[11px] font-bold text-white uppercase">Verify Account</p>
                          <p className="text-[9px] text-neutral-500 mt-1">Grant verified badge & full trust status</p>
                        </div>
                        <CheckCircle2 size={18} className="text-blue-400" />
                      </div>
                      <button onClick={markTradesAllowlisted} disabled={actionLoading === "whitelist" || data.profile?.is_verified}
                        className="w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-40">
                        {data.profile?.is_verified ? "✅ Already Verified" : actionLoading === "whitelist" ? "Processing..." : "✓ Mark as Verified"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section: Account Standing Controls */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert size={12} className="text-blue-400" /> Account Standing & Warnings
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest block">Standing Level</label>
                        <select
                          value={standing}
                          onChange={(e) => setStanding(e.target.value)}
                          className="w-full bg-[#121212] border border-white/5 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-white/20"
                        >
                          <option value="GOOD">Good Standing</option>
                          <option value="WARNING">Warning</option>
                          <option value="RESTRICTED">Restricted</option>
                          <option value="BANNED">Banned</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest block">Message to User</label>
                        <textarea
                          value={standingMessage}
                          onChange={(e) => setStandingMessage(e.target.value)}
                          placeholder="Enter a custom warning or restriction message..."
                          rows={2}
                          className="w-full bg-[#121212] border border-white/5 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-white/20 resize-none font-sans"
                        />
                      </div>
                    </div>

                    <button
                      onClick={updateStanding}
                      disabled={actionLoading === "standing"}
                      className="w-full py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      {actionLoading === "standing" ? "Updating..." : "Update Account Standing"}
                    </button>
                  </div>
                </div>

                {/* Section: Subscription Override */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><Crown size={12} className="text-purple-400" /> Subscription Override</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-4">Current plan: <span className="text-white font-bold">{(data.profile?.subscription_status || "free").toUpperCase()}</span></p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["trial", "pro", "elite", "expired"].map(plan => (
                        <button key={plan} onClick={() => changePlan(plan)} disabled={actionLoading === "plan" || data.profile?.subscription_status === plan}
                          className={`py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border transition-all disabled:opacity-40 ${
                            plan === "elite" ? "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20" :
                            plan === "pro" ? "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20" :
                            plan === "trial" ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20" :
                            "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                          }`}>
                          {plan === "trial" ? "Pro Trial (7d)" : plan}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section: Notifications */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><Bell size={12} className="text-blue-400" /> Send Custom Notification</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Quick Templates */}
                    <div>
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-2 font-bold">Quick Templates</p>
                      <div className="flex flex-wrap gap-2">
                        {NOTIFICATION_TEMPLATES.map(tpl => (
                          <button key={tpl.label} onClick={() => { useTemplate(tpl); setShowNotifModal(true); }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-neutral-400 hover:text-white hover:bg-white/10 uppercase tracking-widest transition-all">
                            {tpl.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => setShowNotifModal(true)}
                      className="w-full py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Send size={13} /> Compose Custom Notification
                    </button>
                  </div>
                </div>

                {/* Section: Gamification */}
                <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2"><Zap size={12} className="text-amber-400" /> Gamification Controls</h3>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase">Reset XP & Streak</p>
                        <p className="text-[9px] text-neutral-500 mt-1">Set XP to 0, streak to 0, discipline level to 1</p>
                      </div>
                      <button onClick={resetXP} disabled={actionLoading === "xp"}
                        className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-[10px] font-bold uppercase tracking-widest transition-all">
                        {actionLoading === "xp" ? "Resetting..." : "Reset Progress"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section: Danger Zone - Delete */}
                <div className="bg-red-500/[0.03] border border-red-500/15 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-red-500/10 bg-red-500/[0.03]">
                    <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2"><Trash2 size={12} /> Danger Zone — Account Deletion</h3>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/[0.03] border border-red-500/10">
                      <div>
                        <p className="text-[11px] font-bold text-red-400 uppercase">Delete Account</p>
                        <p className="text-[9px] text-neutral-500 mt-1">Permanently remove user. Action requires email confirmation. Irreversible.</p>
                      </div>
                      <button onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">Live-Linked • Real-time Active</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNotifModal(true)}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest transition-all flex items-center gap-2">
              <Bell size={12} /> Notify User
            </button>
            <button onClick={onClose}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-[10px] font-bold uppercase tracking-widest transition-all">
              Close
            </button>
          </div>
        </footer>
      </motion.div>

      {/* ── NOTIFICATION MODAL ── */}
      <AnimatePresence>
        {showNotifModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowNotifModal(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-[#131313] border border-white/10 rounded-2xl w-full max-w-[520px] shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-blue-400" />
                  <h3 className="text-[12px] font-bold text-white uppercase tracking-widest">Send Notification</h3>
                </div>
                <button onClick={() => setShowNotifModal(false)} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-neutral-500 hover:text-white"><X size={14} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest block mb-2">Recipient</label>
                  <div className="px-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-lg text-[11px] text-neutral-300">{data.profile?.full_name} — {data.profile?.email}</div>
                </div>
                <div>
                  <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest block mb-2">Type</label>
                  <select value={customNotif.type} onChange={e => setCustomNotif({ ...customNotif, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-lg text-[11px] text-white outline-none">
                    {["SECURITY", "SYSTEM", "BILLING", "SUPPORT", "TRADE", "ACCOUNT"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest block mb-2">Title</label>
                  <input value={customNotif.title} onChange={e => setCustomNotif({ ...customNotif, title: e.target.value })}
                    placeholder="Notification title..."
                    className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-white/5 rounded-lg text-[11px] text-white outline-none focus:border-white/20" />
                </div>
                <div>
                  <label className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest block mb-2">Message</label>
                  <textarea value={customNotif.message} onChange={e => setCustomNotif({ ...customNotif, message: e.target.value })}
                    placeholder="Full notification message..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/5 rounded-lg text-[11px] text-white outline-none focus:border-white/20 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowNotifModal(false)} className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hover:text-white">Cancel</button>
                  <button onClick={sendCustomNotification} disabled={!customNotif.title || !customNotif.message || actionLoading === "notif"}
                    className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    <Send size={12} /> {actionLoading === "notif" ? "Sending..." : "Send Notification"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#131313] border border-red-500/20 rounded-2xl w-full max-w-[450px] shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-red-500/10">
                <div className="flex items-center gap-3 mb-1">
                  <Trash2 size={18} className="text-red-500" />
                  <h3 className="text-[13px] font-bold text-red-400 uppercase tracking-widest">Confirm Account Deletion</h3>
                </div>
                <p className="text-[10px] text-neutral-500">This action is permanent and irreversible. All user data will be marked deleted.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-red-500/[0.05] border border-red-500/10 rounded-xl p-4">
                  <p className="text-[10px] text-red-400 font-bold mb-2 uppercase">You are deleting:</p>
                  <p className="text-[12px] font-bold text-white">{data.profile?.full_name}</p>
                  <p className="text-[10px] text-neutral-400 font-mono">{data.profile?.email}</p>
                </div>
                <div>
                  <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest block mb-2">Type the user's email to confirm:</label>
                  <input value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder={data.profile?.email}
                    className="w-full px-4 py-3 bg-[#0e0e0e] border border-red-500/20 rounded-lg text-[11px] text-white outline-none focus:border-red-500/40 font-mono" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }} className="flex-1 py-2.5 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest hover:text-white">Cancel</button>
                  <button onClick={deleteAccount} disabled={deleteConfirmText !== data.profile?.email || actionLoading === "delete"}
                    className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-30 flex items-center justify-center gap-2">
                    <Trash2 size={12} /> {actionLoading === "delete" ? "Deleting..." : "Permanently Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
