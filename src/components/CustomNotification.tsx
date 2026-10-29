import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Hourglass, AlertTriangle, RotateCcw, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createNotification } from '../lib/notifications';

export const playNotificationSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Drop to A4

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio context failed", e);
  }
};

export const triggerCustomNotification = async (props: Omit<CustomNotificationProps, 't'> & { persist?: boolean }) => {
  // Sound is now handled globally in Toaster

  // Persist to database for notification center if not already coming from DB
  if (props.persist !== false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await createNotification({
          userId: user.id,
          type: props.type === 'error' ? 'SECURITY' : 'SYSTEM',
          title: props.title,
          message: props.message,
          priority: props.type === 'error' ? 'high' : 'normal'
        });
      }
    } catch (err) {
      console.error("Failed to persist notification:", err);
    }
  }

  toast.custom((t) => <CustomNotification t={t} {...props} />, {
    duration: props.duration ? props.duration * 1000 : 12000,
    position: 'top-center',
  });
};

interface CustomNotificationProps {
  t: string | number;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onAction?: () => void;
  actionLabel?: string;
  duration?: number;
  persist?: boolean;
}

export const CustomNotification: React.FC<CustomNotificationProps> = ({
  t,
  title,
  message,
  type = 'info',
  onAction,
  actionLabel = 'View Changes',
  duration = 12
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      toast.dismiss(t);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, t]);

  // Design tokens based on the provided images
  const config = {
    info: {
      bg: 'bg-white dark:bg-[#14151e]', 
      border: 'border-slate-200/90 dark:border-white/10',
      iconBg: 'bg-blue-50 dark:bg-blue-500/10',
      iconBorder: 'border-blue-200 dark:border-blue-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      Icon: Hourglass,
      badgeText: 'Update',
      badgeBg: 'bg-blue-600',
      badgeTextColor: 'text-white',
      BadgeIcon: Loader2,
    },
    error: {
      bg: 'bg-white dark:bg-[#14151e]', 
      border: 'border-rose-200/90 dark:border-rose-500/20',
      iconBg: 'bg-rose-50 dark:bg-rose-500/10',
      iconBorder: 'border-rose-200 dark:border-rose-500/20', 
      iconColor: 'text-rose-600 dark:text-rose-400',
      Icon: AlertTriangle,
      badgeText: 'Alert',
      badgeBg: 'bg-rose-600',
      badgeTextColor: 'text-white',
      BadgeIcon: AlertTriangle,
    },
    success: {
      bg: 'bg-white dark:bg-[#14151e]', 
      border: 'border-emerald-200/90 dark:border-emerald-500/20',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconBorder: 'border-emerald-200 dark:border-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      Icon: RotateCcw,
      badgeText: 'Success', 
      badgeBg: 'bg-emerald-600',
      badgeTextColor: 'text-white',
      BadgeIcon: null,
    }
  };

  const style = config[type];
  const { Icon, BadgeIcon } = style;

  return (
    <div className={`relative w-full max-w-[420px] p-4 sm:p-5 rounded-2xl border ${style.bg} ${style.border} shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl pointer-events-auto mt-2 font-sans`}>
      {/* Absolute Badge at Top Center */}
      {style.badgeText && (
        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold ${style.badgeBg} ${style.badgeTextColor} shadow-sm`}>
          {BadgeIcon && <BadgeIcon size={14} className={BadgeIcon === Loader2 ? 'animate-spin' : ''} />}
          {style.badgeText}
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Left Icon */}
        <div className={`shrink-0 w-11 h-11 rounded-[12px] flex items-center justify-center border ${style.iconBg} ${style.iconBorder} ${style.iconColor}`}>
          <Icon size={22} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-[16px] font-semibold text-slate-900 leading-tight">
            {title}
          </h3>
          <p className="text-[14px] text-slate-600 leading-snug mt-1">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-3.5">
            {onAction && (
              <button
                onClick={() => {
                  onAction();
                  toast.dismiss(t);
                }}
                className="px-4 py-2 rounded-[8px] text-[14px] font-medium text-[#E23939] transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(to bottom, #FFFFFF, #F2F2F2)',
                  boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.12), 0px 0px 0px 1px rgba(228, 228, 228, 0.3), inset 0px 0px 0px 1px #FFFFFF'
                }}
              >
                {actionLabel}
              </button>
            )}
            
            <button
              onClick={() => toast.dismiss(t)}
              className="text-[14px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
