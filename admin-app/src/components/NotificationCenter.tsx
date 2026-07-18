import { useState, useEffect, useRef } from "react";
import { Bell, Check, X, ShieldAlert, MessageSquare, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "MESSAGE" | "ALERT";
  timestamp: Date;
  read: boolean;
}

export function playSciFiPing() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); 
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

export const dispatchNotification = (title: string, message: string, type: "INFO" | "MESSAGE" | "ALERT" = "INFO") => {
  window.dispatchEvent(new CustomEvent('tradifive_notification', {
    detail: { title, message, type }
  }));
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewNotification = (e: any) => {
      const { title, message, type } = e.detail;
      const newNotif: AppNotification = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        type,
        timestamp: new Date(),
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);
      playSciFiPing();
    };

    window.addEventListener('tradifive_notification', handleNewNotification);
    return () => window.removeEventListener('tradifive_notification', handleNewNotification);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case "ALERT": return <ShieldAlert size={12} className="text-red-500" />;
      case "MESSAGE": return <MessageSquare size={12} className="text-blue-500" />;
      default: return <Info size={12} className="text-emerald-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className={`radar-button ${unreadCount > 0 ? 'active' : ''} transition-none`}
      >
        <Bell size={14} className={unreadCount > 0 ? "text-white" : "text-neutral-500"} />
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+12px)] right-0 w-[320px] bg-[#1a1a24]/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/5 flex items-center justify-between bg-[#121212]">
              <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <Bell size={12} /> System Alerts
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  className="text-[9px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center gap-1"
                >
                  <Check size={10} /> Mark Read
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-3">
                    <Check size={16} className="text-neutral-600" />
                  </div>
                  <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">All Clear</p>
                  <p className="text-[9px] text-neutral-600 mt-1">No pending alerts</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-none cursor-pointer ${!notif.read ? 'bg-white/[0.03]' : 'opacity-60'}`}
                      onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-bold ${!notif.read ? 'text-white' : 'text-neutral-400'} truncate`}>{notif.title}</p>
                          <p className="text-[10px] text-neutral-500 mt-1 leading-snug line-clamp-2">{notif.message}</p>
                          <p className="text-[8px] font-mono text-neutral-600 mt-2">
                            {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                        {!notif.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
