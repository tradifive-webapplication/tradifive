import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type PlanTier = 'starter' | 'pro' | 'elite';

export type PlanFeature =
  | 'journal_full'        // Full journal with calendar & behavior insights (Pro+)
  | 'journal_basic'       // Basic journal (all plans)
  | 'trade_screenshots'   // Chart screenshots & visual proof (Pro+)
  | 'pdf_export'          // Statement & report PDF export (Pro+)
  | 'home_customize'      // Customize Home page layout (Pro+)
  | 'balance_hiding'      // Balance / privacy hiding (Pro+)
  | 'loss_cooldown'       // Loss cooldown & revenge-trade protection (Pro+)
  | 'public_channels'     // Create public channel (All plans: 1 on Standard)
  | 'private_channels'    // Create & manage private channels (Pro+)
  | 'vip_channels'        // Monetized VIP channels (Elite only)
  | 'competitions'        // Trading competitions (Pro+)
  | 'risk_guard_advanced' // Advanced Risk Guard controls (Pro+)
  | 'risk_guard_strategy' // Full strategy-level Risk Guard & lockouts (Elite only)
  | 'ai_coach_realtime'   // Real-time AI trade feedback (Pro+)
  | 'ai_coach_deep'       // Deep behavioral analytics (Elite only)
  | 'notifications_basic' // In-app & browser push alerts (Pro+)
  | 'notifications_instant' // Instant Telegram & WhatsApp alerts (Elite only)
  | 'verified_badge'      // Verified badge & priority feed reach (Elite only)
  | 'mentor_access'       // Mentor account monitoring access (Elite only)
  | 'shared_workspace'    // Shared trading workspace (Elite only)
  | 'performance_reviews' // Personal performance reviews (Elite only)
  | 'automated_trading'   // AI-assisted automated trading - Coming Soon (Elite only)
  | 'inbox_favorites'     // Inbox Favorites section (Pro+)
  | 'inbox_support'       // Inbox Support section (Pro+)
  | 'calendar_insights';  // Journal calendar insights (Pro+)

/** Map plan strings reliably (no forced bypass) */
const normalizePlan = (raw: string | null | undefined): PlanTier => {
  const v = String(raw || '').toLowerCase().trim();
  if (v === 'elite' || v === 'advanced' || v === 'institutional') return 'elite';
  if (v === 'pro' || v === 'intermediate') return 'pro';
  return 'starter';
};

/** AI credit caps per day per plan */
export const AI_CREDITS: Record<PlanTier, number> = {
  starter: 5,
  pro: 50,
  elite: 150,
};

/** Live MT5 / broker account caps per plan */
export const BROKER_ACCOUNT_LIMITS: Record<PlanTier, number> = {
  starter: 0,
  pro: 1,
  elite: 3,
};

/** Daily Home feed post caps per plan */
export const DAILY_POST_LIMITS: Record<PlanTier, number> = {
  starter: 1,
  pro: Infinity,
  elite: Infinity,
};

/** Home Watchlist symbol caps per plan */
export const WATCHLIST_LIMITS: Record<PlanTier, number> = {
  starter: 3,
  pro: Infinity,
  elite: Infinity,
};

/** Owned channels cap per plan */
export const CHANNEL_LIMITS: Record<PlanTier, number> = {
  starter: 1, // 1 Public channel
  pro: 3,     // Up to 3 Public or Private channels
  elite: Infinity,
};

/** Competition slots per plan */
export const COMPETITION_SLOTS: Record<PlanTier, number> = {
  starter: 0,
  pro: 1,
  elite: 2,
};

/** Feature access matrix */
const FEATURE_ACCESS: Record<PlanFeature, PlanTier[]> = {
  journal_basic:         ['starter', 'pro', 'elite'],
  journal_full:          ['pro', 'elite'],
  trade_screenshots:     ['pro', 'elite'],
  pdf_export:            ['pro', 'elite'],
  home_customize:        ['pro', 'elite'],
  calendar_insights:     ['pro', 'elite'],
  balance_hiding:        ['pro', 'elite'],
  loss_cooldown:         ['pro', 'elite'],
  public_channels:       ['starter', 'pro', 'elite'],
  private_channels:      ['pro', 'elite'],
  vip_channels:          ['elite'],
  competitions:          ['pro', 'elite'],
  risk_guard_advanced:   ['pro', 'elite'],
  risk_guard_strategy:   ['elite'],
  ai_coach_realtime:     ['pro', 'elite'],
  ai_coach_deep:         ['elite'],
  notifications_basic:   ['pro', 'elite'],
  notifications_instant: ['elite'],
  verified_badge:        ['elite'],
  mentor_access:         ['elite'],
  shared_workspace:      ['elite'],
  performance_reviews:   ['elite'],
  automated_trading:     ['elite'],
  inbox_favorites:       ['pro', 'elite'],
  inbox_support:         ['pro', 'elite'],
};

export function usePlan() {
  const [plan, setPlan] = useState<PlanTier>(() =>
    normalizePlan(localStorage.getItem('tradifive_cached_plan') || localStorage.getItem('tradifive_selected_plan'))
  );

  useEffect(() => {
    let mounted = true;

    const syncFromProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;
        const { data } = await supabase
          .from('profiles')
          .select('subscription_status, plan_type')
          .eq('id', session.user.id)
          .maybeSingle();
        const serverPlan = normalizePlan(data?.subscription_status || data?.plan_type);
        if (mounted) {
          setPlan(serverPlan);
          try {
            localStorage.setItem('tradifive_cached_plan', serverPlan);
          } catch {}
        }
      } catch {}
    };

    syncFromProfile();

    const handleUpdate = () => {
      setPlan(normalizePlan(localStorage.getItem('tradifive_cached_plan') || localStorage.getItem('tradifive_selected_plan')));
    };

    // Listen for plan upgrades dispatched from Settings/Upgrade pages
    window.addEventListener('tradifive_profile_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('tradifive_profile_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const canAccess = useCallback(
    (feature: PlanFeature): boolean => {
      return FEATURE_ACCESS[feature]?.includes(plan) ?? false;
    },
    [plan]
  );

  const isStarter = plan === 'starter';
  const isPro = plan === 'pro';
  const isElite = plan === 'elite';
  const isProOrElite = isPro || isElite;

  const aiCredits = AI_CREDITS[plan];
  const competitionSlots = COMPETITION_SLOTS[plan];
  const brokerAccountLimit = BROKER_ACCOUNT_LIMITS[plan];
  const dailyPostLimit = DAILY_POST_LIMITS[plan];
  const watchlistLimit = WATCHLIST_LIMITS[plan];
  const channelLimit = CHANNEL_LIMITS[plan];

  return {
    plan,
    isStarter,
    isPro,
    isElite,
    isProOrElite,
    canAccess,
    aiCredits,
    competitionSlots,
    brokerAccountLimit,
    dailyPostLimit,
    watchlistLimit,
    channelLimit,
  };
}
