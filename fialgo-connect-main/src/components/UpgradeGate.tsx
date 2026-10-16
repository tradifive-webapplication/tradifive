import React from 'react';
import { Lock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlan, PlanTier } from '@/hooks/usePlan';

interface UpgradeGateProps {
  /** Which plan is needed to unlock this feature */
  requiredPlan: 'pro' | 'elite';
  /** Human-readable feature name shown in the overlay */
  feature?: string;
  /** Visual mode: 'blur' = blur children + overlay, 'lock-icon' = just an inline lock badge */
  mode?: 'blur' | 'lock-icon';
  children: React.ReactNode;
  className?: string;
}

const PLAN_LABEL: Record<PlanTier, string> = {
  starter: 'Starter',
  pro: 'Pro',
  elite: 'Elite',
};

const PLAN_GRADIENT: Record<'pro' | 'elite', string> = {
  pro: 'from-amber-500 to-orange-500',
  elite: 'from-purple-600 to-indigo-600',
};

const PLAN_TEXT: Record<'pro' | 'elite', string> = {
  pro: 'text-amber-600 dark:text-amber-400',
  elite: 'text-purple-600 dark:text-purple-400',
};

export function UpgradeGate({
  requiredPlan,
  feature,
  mode = 'blur',
  children,
  className = '',
}: UpgradeGateProps) {
  const { canAccess, plan } = usePlan();
  const navigate = useNavigate();

  // Determine if the user's plan satisfies the requirement
  const hasAccess =
    requiredPlan === 'pro'
      ? plan === 'pro' || plan === 'elite'
      : plan === 'elite';

  if (hasAccess) {
    return <>{children}</>;
  }

  if (mode === 'lock-icon') {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {children}
        <span
          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
            requiredPlan === 'pro'
              ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
              : 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400'
          }`}
        >
          <Lock size={8} />
          {PLAN_LABEL[requiredPlan]}
        </span>
      </span>
    );
  }

  // Default: blur mode
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Blurred children */}
      <div className="select-none pointer-events-none blur-[3px] brightness-75 saturate-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-4 bg-white/60 dark:bg-[#111]/60 backdrop-blur-[2px] rounded-xl">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${PLAN_GRADIENT[requiredPlan]} flex items-center justify-center mb-3 shadow-lg`}>
          <Lock size={18} className="text-white" />
        </div>
        {feature && (
          <p className="text-[13px] font-bold text-slate-800 dark:text-white text-center mb-1">
            {feature}
          </p>
        )}
        <p className={`text-[11px] font-semibold text-center mb-4 ${PLAN_TEXT[requiredPlan]}`}>
          {PLAN_LABEL[requiredPlan]} plan required
        </p>
        <button
          onClick={() => navigate(`/upgrade?plan=${requiredPlan}`)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wide text-white shadow-md transition-all hover:brightness-110 active:scale-95 bg-gradient-to-r ${PLAN_GRADIENT[requiredPlan]}`}
        >
          <Sparkles size={12} />
          Upgrade to {PLAN_LABEL[requiredPlan]}
        </button>
      </div>
    </div>
  );
}

/** Convenience inline lock badge (no blur) */
export function PlanLockBadge({ requiredPlan }: { requiredPlan: 'pro' | 'elite' }) {
  const { plan } = usePlan();
  const hasAccess =
    requiredPlan === 'pro' ? plan === 'pro' || plan === 'elite' : plan === 'elite';

  if (hasAccess) return null;

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ml-1 ${
        requiredPlan === 'pro'
          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400'
          : 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400'
      }`}
    >
      <Lock size={8} />
      {PLAN_LABEL[requiredPlan]}
    </span>
  );
}
