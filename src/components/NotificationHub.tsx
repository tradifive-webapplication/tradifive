import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { triggerCustomNotification } from "./CustomNotification";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  ShieldAlert,
  Settings,
  CreditCard,
  Zap,
  CheckCheck,
  Clock,
  Heart,
  Sparkles,
  Activity,
  UserPlus,
  TrendingUp,
  AtSign,
  Award,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'SOCIAL':    return { icon: Heart,      color: 'text-rose-500',   bg: 'bg-rose-500/10',   label: 'Social' };
    case 'RISK_GUARD':return { icon: ShieldAlert, color: 'text-amber-500',  bg: 'bg-amber-500/10',  label: 'Risk' };
    case 'AI_COACH':  return { icon: Sparkles,    color: 'text-violet-500', bg: 'bg-violet-500/10', label: 'AI' };
    case 'SYSTEM':    return { icon: Activity,    color: 'text-emerald-500',bg: 'bg-emerald-500/10',label: 'System' };
    case 'SECURITY':  return { icon: ShieldAlert, color: 'text-red-500',    bg: 'bg-red-500/10',    label: 'Security' };
    case 'PAYMENT':   return { icon: CreditCard,  color: 'text-emerald-600',bg: 'bg-emerald-500/10',label: 'Payment' };
    case 'TRADE':     return { icon: TrendingUp,  color: 'text-blue-500',   bg: 'bg-blue-500/10',   label: 'Trade' };
    case 'FOLLOW':    return { icon: UserPlus,    color: 'text-indigo-500', bg: 'bg-indigo-500/10', label: 'Follow' };
    case 'MENTION':   return { icon: AtSign,      color: 'text-cyan-500',   bg: 'bg-cyan-500/10',   label: 'Mention' };
    case 'ACHIEVEMENT':return{icon: Award,        color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Achievement' };
    default:          return { icon: Bell,        color: 'text-slate-400',  bg: 'bg-slate-500/10',  label: 'General' };
  }
};

const timeAgo = (dateStr: string) => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'recently';
  }
};

export default function NotificationHub() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase.channel(`notifications_${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload: any) => {
          const newNotif = payload.new;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);

          let toastType: 'info' | 'error' | 'success' = 'info';
          if (newNotif.type === 'SECURITY' || newNotif.priority === 'high') toastType = 'error';
          else if (newNotif.type === 'SYSTEM' || newNotif.type === 'ACCOUNT') toastType = 'success';

          triggerCustomNotification({
            title: newNotif.title,
            message: newNotif.message,
            type: toastType,
            persist: false
          });
        })
        .subscribe();

      return channel;
    };

    const channelPromise = setupRealtime();
    return () => {
      channelPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleNotifClick = (n: any) => {
    markAsRead(n.id);
    // Navigate based on type
    const actor = n.sender_username || n.actor_username || n.from_username;
    if ((n.type === 'SOCIAL' || n.type === 'FOLLOW') && actor) {
      navigate(`/user/${actor}`);
      setIsOpen(false);
    } else if (n.type === 'TRADE' || n.type === 'RISK_GUARD') {
      navigate('/dashboard');
      setIsOpen(false);
    } else if (n.type === 'AI_COACH') {
      navigate('/ai-coach');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 transition-all group"
      >
        <Bell size={18} className="text-muted-foreground group-hover:text-foreground transition-colors" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-white dark:border-[#0F111A]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[100]"
            />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute right-0 top-12 w-[400px] bg-white dark:bg-[#0F111A] rounded-3xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-none overflow-hidden z-[110]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/[0.05]">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[480px] overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'thin' }}>
                {notifications.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center mb-4">
                      <Bell size={22} className="text-slate-300 dark:text-slate-400" />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-700 dark:text-white">You're all caught up!</p>
                    <p className="text-[12px] text-slate-400 dark:text-slate-400 mt-1.5 leading-relaxed max-w-[220px]">No new notifications right now. Check back later.</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((n) => {
                      const cfg = getTypeConfig(n.type);
                      const IconComp = cfg.icon;
                      const actorAvatar = n.sender_avatar || n.actor_avatar || n.avatar || null;
                      const actorName = n.sender_name || n.actor_name || n.from_name || n.sender_username || n.actor_username || null;

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleNotifClick(n)}
                          className={`group relative flex items-start gap-3.5 px-5 py-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer border-b border-slate-100 dark:border-white/[0.04] last:border-0 ${!n.is_read ? 'bg-blue-50/30 dark:bg-blue-500/[0.03]' : ''}`}
                        >
                          {/* Unread indicator */}
                          {!n.is_read && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-blue-500 rounded-r-full" />
                          )}

                          {/* Avatar / Icon */}
                          <div className="shrink-0 relative mt-0.5">
                            {actorAvatar ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-[#1A1D28] shadow-sm">
                                <img src={actorAvatar} alt={actorName || ''} className="w-full h-full object-cover" />
                              </div>
                            ) : actorName ? (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-2 border-white dark:border-[#1A1D28] shadow-sm text-white font-bold text-sm">
                                {actorName[0]?.toUpperCase()}
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center`}>
                                <IconComp size={18} className={cfg.color} />
                              </div>
                            )}
                            {(actorAvatar || actorName) && (
                              <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full ${cfg.bg} border-2 border-white dark:border-[#0F111A] flex items-center justify-center`}>
                                <IconComp size={10} className={cfg.color} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13.5px] leading-snug ${!n.is_read ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300'}`}>
                              {actorName ? (
                                <>
                                  <span className="font-bold">{actorName}</span>{' '}
                                  <span className={n.is_read ? 'text-slate-500 dark:text-slate-400' : ''}>
                                    {n.title?.replace(actorName, '').trim() || n.title}
                                  </span>
                                </>
                              ) : n.title}
                            </p>
                            {n.message && (
                              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                            )}
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className={`text-[11px] font-semibold ${!n.is_read ? 'text-blue-500' : 'text-slate-400 dark:text-slate-400'}`}>
                                {timeAgo(n.created_at)}
                              </span>
                            </div>
                          </div>

                          {/* Unread dot */}
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-5 py-3.5 border-t border-slate-100 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.02]">
                  <button
                    onClick={() => { navigate('/notifications'); setIsOpen(false); }}
                    className="w-full flex items-center justify-center gap-1.5 text-[12.5px] font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-0.5"
                  >
                    View all notifications
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
