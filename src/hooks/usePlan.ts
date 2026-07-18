import { useState, useEffect, useCallback } from 'react';

export type PlanTier = 'starter' | 'pro' | 'elite';

export type PlanFeature =
  | 'journal_full'        // Full journal with calendar & behavior insights (Pro+)
  | 'journal_basic'       // Basic journal (all plans)
  | 'balance_hiding'      // Balance / privacy hiding (Pro+)
  | 'loss_cooldown'       // Loss cooldown & revenge-trade protection (Pro+)
  | 'private_channels'    // Create & manage private channels (Pro+)
  | 'competitions'        // Trading competitions (Pro+)
  | 'risk_guard_advanced' // Advanced Risk Guard controls (Pro+)
  | 'risk_guard_strategy' // Strategy-level Risk Guard (Elite only)
  | 'ai_coach_realtime'   // Real-time AI trade feedback (Pro+)
  | 'ai_coach_deep'       // Deep behavioral analytics (Elite only)
  | 'mentor_access'       // Mentor account monitoring access (Pro+)
  | 'shared_workspace'    // Shared trading workspace (Elite only)
  | 'performance_reviews' // Personal performance reviews (Elite only)
  | 'automated_trading'   // AI-assisted automated trading (Elite only)
  | 'inbox_favorites'     // Inbox Favorites section (Pro+)
  | 'inbox_support'       // Inbox Support section (Pro+)
  | 'calendar_insights';  // Journal calendar insights (Pro+)

/** Map old plan names to the new naming convention */
const normalizePlan = (raw: string | null): PlanTier => {
  // BYPASS: Always return 'elite' for development/testing
  return 'elite';
};

/** AI credit caps per plan */
export const AI_CREDITS: Record<PlanTier, number> = {
  starter: 10,
  pro: 50,
  elite: 100,
};

/** Competition slots per plan */
export const COMPETITION_SLOTS: Record<PlanTier, number> = {
  starter: 0,
  pro: 1,
  elite: 2,
};

/** Feature access matrix */
const FEATURE_ACCESS: Record<PlanFeature, PlanTier[]> = {
  journal_basic:       ['starter', 'pro', 'elite'],
  journal_full:        ['pro', 'elite'],
  calendar_insights:   ['pro', 'elite'],
  balance_hiding:      ['pro', 'elite'],
  loss_cooldown:       ['pro', 'elite'],
  private_channels:    ['pro', 'elite'],
  competitions:        ['pro', 'elite'],
  risk_guard_advanced: ['pro', 'elite'],
  risk_guard_strategy: ['elite'],
  ai_coach_realtime:   ['pro', 'elite'],
  ai_coach_deep:       ['elite'],
  mentor_access:       ['pro', 'elite'],
  shared_workspace:    ['elite'],
  performance_reviews: ['elite'],
  automated_trading:   ['elite'],
  inbox_favorites:     ['pro', 'elite'],
  inbox_support:       ['pro', 'elite'],
};

export function usePlan() {
  const [plan, setPlan] = useState<PlanTier>(() =>
    normalizePlan(localStorage.getItem('tradifive_cached_plan'))
  );

  useEffect(() => {
    const handleUpdate = () => {
      setPlan(normalizePlan(localStorage.getItem('tradifive_cached_plan')));
    };

    // Listen for plan upgrades dispatched from Settings/Upgrade pages
    window.addEventListener('tradifive_profile_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
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

  return {
    plan,
    isStarter,
    isPro,
    isElite,
    isProOrElite,
    canAccess,
    aiCredits,
    competitionSlots,
  };
}
