export interface TradeData {
  id?: string | number;
  ticket?: string | number;
  profit?: number;
  closed_at?: string;
  created_at?: string;
  open_time?: string;
  type?: string;
  volume?: number | string;
  risk_reward_ratio?: number;
  rr?: number;
  symbol?: string;
}

export interface TradingMetricsResult {
  profitFactor: string;
  expectancy: string;
  maxDrawdown: string;
  consistencyScore: number;
  consistencyDisplay: string;
  emotionalDiscipline: number;
  revengeRisk: "Low" | "Medium" | "High";
  confidenceScore: number;
  bestSession: string;
  suggestedImprovement: string;
  totalPnl: number;
  formattedPnl: string;
  totalPnlPercent: string;
  avgRR: string;
  chartPath: string;
  totalTrades: number;
}

export function calculateTradingMetrics(
  trades: TradeData[],
  initialBalance: number = 10000,
  currencySymbol: string = "$"
): TradingMetricsResult {
  // Ensure initialBalance is a realistic non-zero divisor (min $100) to prevent division-by-zero / +100000% bugs
  const safeBalance = Math.max(100, Number(initialBalance) || 10000);

  if (!trades || trades.length === 0) {
    return {
      profitFactor: "0.00",
      expectancy: "0.00R",
      maxDrawdown: "0.00%",
      consistencyScore: 0,
      consistencyDisplay: "—",
      emotionalDiscipline: 0,
      revengeRisk: "Low",
      confidenceScore: 0,
      bestSession: "N/A",
      suggestedImprovement: "Take your first trade",
      totalPnl: 0,
      formattedPnl: `${currencySymbol}0.00`,
      totalPnlPercent: "+0.00%",
      avgRR: "0.00R",
      chartPath: "M0,20 L100,20",
      totalTrades: 0,
    };
  }

  // Sort trades chronologically
  const sortedTrades = [...trades].sort((a, b) => {
    const tA = new Date(a.closed_at || a.created_at || a.open_time || 0).getTime();
    const tB = new Date(b.closed_at || b.created_at || b.open_time || 0).getTime();
    return tA - tB;
  });

  let grossProfit = 0;
  let grossLoss = 0;
  let wins = 0;
  let losses = 0;
  let totalPnl = 0;

  let peakCumulative = 0;
  let maxDrawdownAbs = 0;

  const dailyPnL: Record<string, number> = {};

  const sessionProfits = {
    "Asian (8PM - 3AM)": 0,
    "London (3AM - 11AM)": 0,
    "New York (8AM - 5PM)": 0,
  };

  let consecutiveLosses = 0;
  let totalConsecutiveLossStreaks = 0; // For Emotional Discipline penalty

  for (const t of sortedTrades) {
    const profit = Number(t.profit) || 0;
    totalPnl += profit;

    // Daily PnL for consistency
    const dateObj = new Date(t.closed_at || t.created_at || t.open_time || Date.now());
    const dateKey = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
    dailyPnL[dateKey] = (dailyPnL[dateKey] || 0) + profit;

    // Profit Factor & Win/Loss Tracking
    if (profit > 0) {
      grossProfit += profit;
      wins++;
      consecutiveLosses = 0;
    } else if (profit < 0) {
      grossLoss += Math.abs(profit);
      losses++;
      consecutiveLosses++;
      if (consecutiveLosses >= 3) {
        totalConsecutiveLossStreaks++;
        consecutiveLosses = 0; // Reset after penalty trigger
      }
    } else {
      consecutiveLosses = 0; // Break streak on breakeven
    }

    // Drawdown Calculation relative to equity curve peak
    if (totalPnl > peakCumulative) {
      peakCumulative = totalPnl;
    }
    const currentDrawdown = peakCumulative - totalPnl;
    if (currentDrawdown > maxDrawdownAbs) {
      maxDrawdownAbs = currentDrawdown;
    }

    // Sessions (UTC based simple approximation)
    const hour = dateObj.getUTCHours();
    if (hour >= 0 && hour < 8) sessionProfits["Asian (8PM - 3AM)"] += profit;
    else if (hour >= 8 && hour < 13) sessionProfits["London (3AM - 11AM)"] += profit;
    else if (hour >= 13 && hour < 20) sessionProfits["New York (8AM - 5PM)"] += profit;
    else sessionProfits["Asian (8PM - 3AM)"] += profit;
  }

  const totalTrades = wins + losses;
  const winRate = totalTrades > 0 ? wins / totalTrades : 0;
  const lossRate = totalTrades > 0 ? losses / totalTrades : 0;
  const avgWin = wins > 0 ? grossProfit / wins : 0;
  const avgLoss = losses > 0 ? grossLoss / losses : 0;

  // 1. Profit Factor: Undefined when 0 losses exist; display institutional dash '——' instead of 99.99
  let profitFactorStr = "0.00";
  if (grossLoss === 0) {
    if (grossProfit > 0) {
      profitFactorStr = "——"; // No loss trades exist yet; division by zero is undefined
    } else {
      profitFactorStr = "0.00";
    }
  } else {
    const pf = grossProfit / grossLoss;
    profitFactorStr = pf > 50 ? "50.0+" : pf.toFixed(2);
  }

  // 2. Explicit Risk-Reward and Expectancy (R)
  const explicitRRs = sortedTrades
    .map((t) => Number(t.risk_reward_ratio) || Number(t.rr) || 0)
    .filter((r) => r > 0);

  let avgRR = "0.00R";
  if (explicitRRs.length > 0) {
    const avgR = explicitRRs.reduce((a, b) => a + b, 0) / explicitRRs.length;
    avgRR = `${avgR.toFixed(2)}R`;
  } else if (avgLoss > 0 && avgWin > 0) {
    avgRR = `${(avgWin / avgLoss).toFixed(2)}R`;
  } else if (avgWin > 0 && avgLoss === 0) {
    avgRR = "1.00R";
  }

  let expectancyStr = "0.00R";
  if (losses > 0 && avgLoss > 0) {
    const rewardRiskRatio = avgWin / avgLoss;
    const exp = (winRate * rewardRiskRatio) - (lossRate * 1);
    expectancyStr = (exp >= 0 ? "+" : "") + exp.toFixed(2) + "R";
  } else if (wins > 0 && explicitRRs.length > 0) {
    const avgExplicitRR = explicitRRs.reduce((a, b) => a + b, 0) / explicitRRs.length;
    expectancyStr = `+${avgExplicitRR.toFixed(2)}R`;
  } else if (wins > 0 && losses === 0) {
    expectancyStr = "+1.00R";
  } else {
    expectancyStr = "0.00R";
  }

  // 3. Max Drawdown % (Accurate against verified capital, no negative zero)
  const maxDrawdownPct = safeBalance > 0 ? (maxDrawdownAbs / safeBalance) * 100 : 0;
  const maxDrawdownStr = maxDrawdownPct > 0 ? `-${maxDrawdownPct.toFixed(2)}%` : "0.00%";

  // 4. Consistency Score: Requires at least 3 days for standard deviation. For 1-2 days, calculate day win rate
  const days = Object.values(dailyPnL);
  let consistencyScore = 0;
  let consistencyDisplay = "—";

  if (days.length >= 3) {
    const mean = days.reduce((a, b) => a + b, 0) / days.length;
    const variance = days.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / days.length;
    const stdDev = Math.sqrt(variance);
    const coef = stdDev / (Math.abs(mean) || 1);
    consistencyScore = Math.max(0, Math.min(100, Math.round(100 - (coef * 10))));
    consistencyDisplay = `${consistencyScore}%`;
  } else if (days.length > 0 && totalTrades > 0) {
    const winningDays = days.filter((p) => p > 0).length;
    consistencyScore = Math.round((winningDays / days.length) * 100);
    consistencyDisplay = `${consistencyScore}%`;
  } else {
    consistencyScore = 0;
    consistencyDisplay = "—";
  }

  // 5. Emotional Discipline
  let emotionalDiscipline = 100 - totalConsecutiveLossStreaks * 15;
  emotionalDiscipline = Math.max(0, Math.min(100, emotionalDiscipline));

  // Revenge Risk
  let revengeRisk: "Low" | "Medium" | "High" = "Low";
  if (emotionalDiscipline < 50) revengeRisk = "High";
  else if (emotionalDiscipline < 80) revengeRisk = "Medium";

  // Confidence Score (Blend of WinRate and ProfitFactor)
  const numericPf = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 3 : 0);
  const pfScore = Math.min(100, (numericPf / 3) * 100);
  let confidenceScore = Math.round(winRate * 100 * 0.6 + pfScore * 0.4);
  if (totalTrades === 0) confidenceScore = 0;

  // Best Session
  let bestSession = "N/A";
  let maxSessProfit = -Infinity;
  for (const [sess, pnl] of Object.entries(sessionProfits)) {
    if (pnl > maxSessProfit) {
      maxSessProfit = pnl;
      bestSession = sess;
    }
  }
  if (maxSessProfit === 0 && totalTrades === 0) bestSession = "N/A";

  // 6. Total PnL & Formatted Values
  const totalPnlPct = (totalPnl / safeBalance) * 100;
  const pnlSign = totalPnl >= 0 ? "+" : "";
  const formattedPnl = `${pnlSign}${currencySymbol}${Math.abs(totalPnl).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const totalPnlPercent = `${pnlSign}${totalPnlPct.toFixed(2)}%`;

  // Suggested Improvement
  let suggestedImprovement = "Keep up the good work!";
  if (grossLoss > 0 && grossProfit / grossLoss < 1.0) suggestedImprovement = "Focus on cutting losses earlier";
  else if (winRate < 0.4) suggestedImprovement = "Review trade entries for better accuracy";
  else if (emotionalDiscipline < 70) suggestedImprovement = "Avoid revenge trading after losses";
  else if (avgLoss > 0 && avgWin / avgLoss < 1.0) suggestedImprovement = "Work on holding winners longer";

  // 7. Generate SVG Path for Line Chart
  // Canvas bounds: 0 to 100 (X), 0 to 40 (Y). 0 is top, 40 is bottom.
  let chartPath = "M0,20 L100,20";
  if (sortedTrades.length > 0) {
    let runPnl = 0;
    const pnlPoints = [0];
    for (const t of sortedTrades) {
      runPnl += Number(t.profit) || 0;
      pnlPoints.push(runPnl);
    }
    const maxPnl = Math.max(...pnlPoints);
    const minPnl = Math.min(...pnlPoints);
    const range = maxPnl - minPnl || 1;

    // Scale X from 0 to 100, Scale Y from 6 to 34 (8px breathing room)
    const points = pnlPoints.map((p, idx) => {
      const x = Math.round((idx / (pnlPoints.length - 1)) * 100);
      const y = Math.round(34 - ((p - minPnl) / range) * 28);
      return `${x},${y}`;
    });

    if (points.length === 1) {
      chartPath = `M0,20 L100,20`;
    } else if (points.length === 2) {
      chartPath = `M${points[0]} L${points[1]}`;
    } else {
      chartPath = `M${points.join(" L")}`;
    }
  }

  return {
    profitFactor: profitFactorStr,
    expectancy: expectancyStr,
    maxDrawdown: maxDrawdownStr,
    consistencyScore: Math.round(consistencyScore),
    consistencyDisplay,
    emotionalDiscipline: Math.round(emotionalDiscipline),
    revengeRisk,
    confidenceScore,
    bestSession,
    suggestedImprovement,
    totalPnl,
    formattedPnl,
    totalPnlPercent,
    avgRR,
    chartPath,
    totalTrades,
  };
}
