export interface TradeData {
  id?: string | number;
  profit?: number;
  closed_at?: string;
  created_at?: string;
  open_time?: string;
  type?: string;
  volume?: number | string;
}

export function calculateTradingMetrics(trades: TradeData[], initialBalance: number = 10000) {
  if (!trades || trades.length === 0) {
    return {
      profitFactor: "0.00",
      expectancy: "0.00R",
      maxDrawdown: "0.00%",
      consistencyScore: 0,
      emotionalDiscipline: 0,
      revengeRisk: "Low",
      confidenceScore: 0,
      bestSession: "N/A",
      suggestedImprovement: "Take your first trade",
      totalPnlPercent: "+0.00%",
      chartPath: "M0,35 L100,35",
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
    "New York (8AM - 5PM)": 0
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

    // Drawdown Calculation
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

  // Profit Factor
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 99.99 : 0) : (grossProfit / grossLoss);

  // Expectancy (R)
  const winRate = totalTrades > 0 ? wins / totalTrades : 0;
  const lossRate = totalTrades > 0 ? losses / totalTrades : 0;
  const avgWin = wins > 0 ? grossProfit / wins : 0;
  const avgLoss = losses > 0 ? grossLoss / losses : 0;
  const rewardRiskRatio = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? 2 : 0);
  const expectancy = (winRate * rewardRiskRatio) - (lossRate * 1);

  // Max Drawdown %
  const maxDrawdownPct = (maxDrawdownAbs / initialBalance) * 100;

  // Consistency Score
  const days = Object.values(dailyPnL);
  let consistencyScore = 50;
  if (days.length > 1) {
    const mean = days.reduce((a, b) => a + b, 0) / days.length;
    const variance = days.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / days.length;
    const stdDev = Math.sqrt(variance);
    // Rough heuristic: Lower StdDev relative to Mean = higher consistency.
    const coef = stdDev / (Math.abs(mean) || 1);
    consistencyScore = Math.max(0, Math.min(100, 100 - (coef * 10)));
  } else if (days.length === 1) {
    consistencyScore = 70;
  }

  // Emotional Discipline
  let emotionalDiscipline = 100 - (totalConsecutiveLossStreaks * 15);
  emotionalDiscipline = Math.max(0, Math.min(100, emotionalDiscipline));

  // Revenge Risk
  let revengeRisk = "Low";
  if (emotionalDiscipline < 50) revengeRisk = "High";
  else if (emotionalDiscipline < 80) revengeRisk = "Medium";

  // Confidence Score (Blend of WinRate and ProfitFactor)
  const pfScore = Math.min(100, (profitFactor / 3) * 100);
  let confidenceScore = Math.round((winRate * 100 * 0.6) + (pfScore * 0.4));
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

  // Total PnL %
  const totalPnlPct = (totalPnl / initialBalance) * 100;
  const sign = totalPnlPct >= 0 ? "+" : "";

  // Suggested Improvement
  let suggestedImprovement = "Keep up the good work!";
  if (profitFactor < 1.0) suggestedImprovement = "Focus on cutting losses earlier";
  else if (winRate < 0.4) suggestedImprovement = "Review trade entries for better accuracy";
  else if (emotionalDiscipline < 70) suggestedImprovement = "Avoid revenge trading after losses";
  else if (rewardRiskRatio < 1.0) suggestedImprovement = "Work on holding winners longer";

  // Generate SVG Path for Line Chart
  // Canvas bounds: 0 to 100 (X), 0 to 40 (Y). 0 is top, 40 is bottom.
  let chartPath = "M0,35 Q12,32 25,24 T55,27 T75,10 T100,3"; // default
  if (sortedTrades.length > 0) {
    let runPnl = 0;
    const pnlPoints = [0];
    for (const t of sortedTrades) {
      runPnl += (Number(t.profit) || 0);
      pnlPoints.push(runPnl);
    }
    const maxPnl = Math.max(...pnlPoints);
    const minPnl = Math.min(...pnlPoints);
    const range = maxPnl - minPnl || 1;

    // Scale X from 0 to 100
    // Scale Y from 5 to 35 (to give 5px padding top/bottom)
    const points = pnlPoints.map((p, idx) => {
      const x = (idx / (pnlPoints.length - 1)) * 100;
      const y = 35 - ((p - minPnl) / range) * 30;
      return `${x},${y}`;
    });

    if (points.length === 1) {
      chartPath = `M0,20 L100,20`;
    } else if (points.length === 2) {
      chartPath = `M${points[0]} L${points[1]}`;
    } else {
      // Simple line path for accuracy (bezier can overshoot)
      chartPath = `M${points.join(' L')}`;
    }
  }

  return {
    profitFactor: profitFactor.toFixed(2),
    expectancy: (expectancy > 0 ? "+" : "") + expectancy.toFixed(2) + "R",
    maxDrawdown: "-" + maxDrawdownPct.toFixed(2) + "%",
    consistencyScore: Math.round(consistencyScore),
    emotionalDiscipline: Math.round(emotionalDiscipline),
    revengeRisk,
    confidenceScore,
    bestSession,
    suggestedImprovement,
    totalPnlPercent: `${sign}${totalPnlPct.toFixed(2)}%`,
    chartPath,
    totalTrades
  };
}
