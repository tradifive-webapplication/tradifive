/**
 * Tradifive — Trade XP Engine
 *
 * Awards XP only for profitable, disciplined trades.
 * XP is NOT awarded for social actions (likes, follows, comments).
 * All XP awards are validated server-side via Supabase RPC.
 */

import { supabase } from "@/lib/supabase";
import { calculateTradingMetrics, TradeData } from "@/utils/tradeMetrics";
import { toast } from "sonner";

export interface TradeXPResult {
  xpAwarded: number;
  consistencyScore: number;
  disciplineScore: number;
  eligible: boolean;
  reason?: string;
}

// Thresholds for XP eligibility
const MIN_CONSISTENCY_SCORE = 50; // Minimum to be eligible
const MIN_DISCIPLINE_SCORE = 40;  // Minimum discipline to earn XP

/**
 * Evaluates whether a closed trade should earn XP.
 * Calculates XP amount based on:
 * - Whether trade is profitable
 * - Consistency score from full trade history
 * - Emotional discipline score
 */
export function evaluateTradeForXP(
  closedTrade: TradeData,
  allTrades: TradeData[],
  initialBalance: number = 10000
): TradeXPResult {
  const profit = Number(closedTrade.profit) || 0;

  // Must be profitable
  if (profit <= 0) {
    return {
      xpAwarded: 0,
      consistencyScore: 0,
      disciplineScore: 0,
      eligible: false,
      reason: "Trade is not profitable"
    };
  }

  // Calculate metrics from full history
  const metrics = calculateTradingMetrics(allTrades, initialBalance);
  const consistencyScore = metrics.consistencyScore;
  const disciplineScore = metrics.emotionalDiscipline;

  // Check minimum thresholds
  if (consistencyScore < MIN_CONSISTENCY_SCORE) {
    return {
      xpAwarded: 0,
      consistencyScore,
      disciplineScore,
      eligible: false,
      reason: `Consistency score too low (${consistencyScore}/100, need ${MIN_CONSISTENCY_SCORE}+)`
    };
  }

  if (disciplineScore < MIN_DISCIPLINE_SCORE) {
    return {
      xpAwarded: 0,
      consistencyScore,
      disciplineScore,
      eligible: false,
      reason: `Discipline score too low (${disciplineScore}/100, need ${MIN_DISCIPLINE_SCORE}+)`
    };
  }

  // Calculate XP: base 25 + up to 75 bonus for high consistency
  const baseXP = 25;
  const bonusXP = Math.min(75, Math.max(0, Math.round((consistencyScore - 50) * 3)));
  const xpAwarded = Math.min(100, baseXP + bonusXP);

  return {
    xpAwarded,
    consistencyScore,
    disciplineScore,
    eligible: true
  };
}

/**
 * Awards XP for a profitable disciplined trade via server-side RPC.
 * The server validates everything — this cannot be spoofed client-side.
 */
export async function awardTradeXPSecure(
  tradeId: string,
  allTrades: TradeData[],
  closedTrade: TradeData,
  initialBalance: number = 10000
): Promise<TradeXPResult | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    // First evaluate locally to give instant feedback
    const evaluation = evaluateTradeForXP(closedTrade, allTrades, initialBalance);
    if (!evaluation.eligible) return evaluation;

    // Then validate and award server-side
    const { data, error } = await supabase.rpc('award_trade_xp', {
      p_user_id: session.user.id,
      p_trade_id: tradeId,
      p_consistency_score: evaluation.consistencyScore,
      p_discipline_score: evaluation.disciplineScore,
      p_profit: Number(closedTrade.profit)
    });

    if (error) {
      console.error('Trade XP RPC error:', error);
      return null;
    }

    if (!data?.success) {
      // Server rejected (e.g., already awarded)
      return { ...evaluation, eligible: false, reason: data?.error };
    }

    // Show success toast
    toast.success(`🏆 Disciplined Trade! +${data.xp_awarded} XP`, {
      description: `Consistency: ${evaluation.consistencyScore}% | Discipline: ${evaluation.disciplineScore}%`
    });

    return {
      xpAwarded: data.xp_awarded,
      consistencyScore: evaluation.consistencyScore,
      disciplineScore: evaluation.disciplineScore,
      eligible: true
    };

  } catch (err) {
    console.error('awardTradeXPSecure error:', err);
    return null;
  }
}

/**
 * Check if an account qualifies as "consistent" for the AI coach to recognize.
 * Returns a summary the AI coach can use to praise or coach the user.
 */
export function getConsistencyAssessment(allTrades: TradeData[], initialBalance = 10000): {
  isConsistent: boolean;
  label: "Elite" | "Consistent" | "Developing" | "Risky";
  consistencyScore: number;
  disciplineScore: number;
  profitFactor: string;
  recommendation: string;
} {
  if (!allTrades || allTrades.length < 3) {
    return {
      isConsistent: false,
      label: "Developing",
      consistencyScore: 0,
      disciplineScore: 0,
      profitFactor: "0.00",
      recommendation: "Take at least 3 trades to get a consistency assessment."
    };
  }

  const metrics = calculateTradingMetrics(allTrades, initialBalance);

  let label: "Elite" | "Consistent" | "Developing" | "Risky" = "Developing";
  if (metrics.consistencyScore >= 80 && metrics.emotionalDiscipline >= 80) label = "Elite";
  else if (metrics.consistencyScore >= 60 && metrics.emotionalDiscipline >= 50) label = "Consistent";
  else if (metrics.emotionalDiscipline < 40) label = "Risky";

  return {
    isConsistent: metrics.consistencyScore >= 60 && metrics.emotionalDiscipline >= 50,
    label,
    consistencyScore: metrics.consistencyScore,
    disciplineScore: metrics.emotionalDiscipline,
    profitFactor: metrics.profitFactor,
    recommendation: metrics.suggestedImprovement
  };
}
