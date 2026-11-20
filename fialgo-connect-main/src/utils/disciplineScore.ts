import { addXP, getGamificationState, saveGamificationState } from "./gamification";
import { supabase } from "@/lib/supabase";

export interface DisciplineBreakdown {
  stopLossRate: number; // 0 - 100%
  stopLossScore: number; // max 30 pts
  lotSizeRate: number; // 0 - 100%
  lotSizeScore: number; // max 25 pts
  cooldownScore: number; // max 25 pts
  tradeCapScore: number; // max 20 pts
  tradesCount: number;
  maxDailyTrades: number;
}

export interface DailyDisciplineRecord {
  date: string; // YYYY-MM-DD
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D";
  tradesCount: number;
  stopLossRate: number;
  xpEarned: number;
}

export interface ForexDisciplineState {
  score: number; // 0 - 100
  grade: "A+" | "A" | "B" | "C" | "D";
  streakDays: number;
  isSessionWrapped: boolean;
  lastWrappedDate: string;
  breakdown: DisciplineBreakdown;
  calendarHistory: Record<string, DailyDisciplineRecord>;
}

const STORAGE_KEY = "tradifive_forex_discipline_state";

export function calculateGrade(score: number): "A+" | "A" | "B" | "C" | "D" {
  if (score >= 95) return "A+";
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 50) return "C";
  return "D";
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DEFAULT_DISCIPLINE_STATE: ForexDisciplineState = {
  score: 96,
  grade: "A+",
  streakDays: 16,
  isSessionWrapped: false,
  lastWrappedDate: "",
  breakdown: {
    stopLossRate: 100,
    stopLossScore: 30,
    lotSizeRate: 95,
    lotSizeScore: 24,
    cooldownScore: 25,
    tradeCapScore: 17,
    tradesCount: 3,
    maxDailyTrades: 4,
  },
  calendarHistory: {
    "2026-11-15": { date: "2026-11-15", score: 98, grade: "A+", tradesCount: 2, stopLossRate: 100, xpEarned: 120 },
    "2026-11-16": { date: "2026-11-16", score: 92, grade: "A", tradesCount: 3, stopLossRate: 100, xpEarned: 100 },
    "2026-11-17": { date: "2026-11-17", score: 88, grade: "A", tradesCount: 4, stopLossRate: 100, xpEarned: 90 },
    "2026-11-18": { date: "2026-11-18", score: 95, grade: "A+", tradesCount: 3, stopLossRate: 100, xpEarned: 120 },
    "2026-11-19": { date: "2026-11-19", score: 94, grade: "A+", tradesCount: 2, stopLossRate: 100, xpEarned: 120 },
    "2026-11-20": { date: "2026-11-20", score: 96, grade: "A+", tradesCount: 3, stopLossRate: 100, xpEarned: 120 },
  },
};

export function getForexDisciplineState(): ForexDisciplineState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DISCIPLINE_STATE));
      return DEFAULT_DISCIPLINE_STATE;
    }
    const parsed = JSON.parse(raw);
    const today = getTodayDateString();
    
    // Check if new day
    if (parsed.lastWrappedDate && parsed.lastWrappedDate !== today) {
      parsed.isSessionWrapped = false;
    }

    return parsed;
  } catch (err) {
    console.error("Error reading discipline state:", err);
    return DEFAULT_DISCIPLINE_STATE;
  }
}

export function saveForexDisciplineState(state: ForexDisciplineState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("tradifive_discipline_update", { detail: state }));
  } catch (err) {
    console.error("Error saving discipline state:", err);
  }
}

export function wrapUpForexSession(): { success: boolean; score: number; grade: string; xpEarned: number } {
  const state = getForexDisciplineState();
  const today = getTodayDateString();

  if (state.isSessionWrapped && state.lastWrappedDate === today) {
    return {
      success: false,
      score: state.score,
      grade: state.grade,
      xpEarned: 0,
    };
  }

  // Calculate XP reward based on score grade
  let xpEarned = 50;
  if (state.score >= 95) xpEarned = 150;
  else if (state.score >= 85) xpEarned = 100;
  else if (state.score >= 70) xpEarned = 75;

  const newStreak = state.streakDays + 1;

  // Add record to calendar history
  const newHistory = {
    ...state.calendarHistory,
    [today]: {
      date: today,
      score: state.score,
      grade: state.grade,
      tradesCount: state.breakdown.tradesCount,
      stopLossRate: state.breakdown.stopLossRate,
      xpEarned,
    },
  };

  const updatedState: ForexDisciplineState = {
    ...state,
    streakDays: newStreak,
    isSessionWrapped: true,
    lastWrappedDate: today,
    calendarHistory: newHistory,
  };

  saveForexDisciplineState(updatedState);

  // Sync to gamification XP and streak
  addXP(xpEarned, `Forex Session Wrapped (${state.grade} Grade)`, "Discipline");

  const gamState = getGamificationState();
  saveGamificationState({
    ...gamState,
    streak: newStreak,
  });

  // Sync to Supabase profiles
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      supabase
        .from("profiles")
        .update({
          streak_days: newStreak,
        })
        .eq("id", session.user.id)
        .then(() => {});
    }
  });

  return {
    success: true,
    score: state.score,
    grade: state.grade,
    xpEarned,
  };
}
