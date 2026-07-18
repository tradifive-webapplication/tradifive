import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ── ALLOWED XP EVENT TYPES ──────────────────────────────────────────────────
// XP is ONLY awarded for trading-related actions and referrals.
// Social actions (likes, follows, comments) do NOT earn XP.
const ALLOWED_XP_EVENTS = new Set([
  'DAILY_CHECKIN',
  'DAILY_DIRECTIVE',
  'TRADE_XP',
  'REFERRAL',
  'MT5_CONNECT',
  'JOURNAL_ENTRY',
  'ZERO_RISK_VIOLATION',
  'WEEKLY_CONSISTENCY',
  'COMPETITION',
  'SIM_ACTION',  // legacy — kept for backward compat
]);

export interface LedgerEntry {
  event: string;
  date: string;
  mult: string;
  xp: string;
}

export interface GamificationState {
  level: number;
  xp: number;
  xp_required: number;
  streak: number;
  bounty_balance: number;
  ledger: LedgerEntry[];
  unlocked_items: number[];
  completed_missions: number[];
}

const STORAGE_KEY = "tradifive_gamification_state";

const DEFAULT_STATE: GamificationState = {
  level: 1,
  xp: 0,
  xp_required: 500,
  streak: 0,
  bounty_balance: 0,
  ledger: [],
  unlocked_items: [],
  completed_missions: [],
};

const triggerStateUpdate = () => {
  window.dispatchEvent(new Event("tradifive_xp_update"));
};

export function getGamificationState(): GamificationState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
    return DEFAULT_STATE;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_STATE;
  }
}

export function saveGamificationState(state: GamificationState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  triggerStateUpdate();
}

// Client-side rate limit for XP events (anti-abuse)
const XP_RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_XP_EVENTS_PER_WINDOW = 10;
let xpEventCount = 0;
let xpWindowStart = Date.now();

function isXPRateLimited(): boolean {
  const now = Date.now();
  if (now - xpWindowStart > XP_RATE_WINDOW_MS) {
    xpEventCount = 0;
    xpWindowStart = now;
  }
  xpEventCount++;
  return xpEventCount > MAX_XP_EVENTS_PER_WINDOW;
}

// Background sync helper — syncs XP to Supabase server-side
const syncXPToSupabase = (amount: number, currentXP: number, currentLevel: number, eventName: string, state: GamificationState) => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      const userId = session.user.id;

      // 1. Sync stats to profiles table
      supabase
        .from('profiles')
        .update({
          xp_total: currentXP,
          xp_level: currentLevel,
          streak_days: state.streak
        })
        .eq('id', userId)
        .then(({ error }) => {
          if (error) console.error('Error syncing profile XP:', error);
        });

      // 2. Log transaction in user_xp_ledger with event type
      const eventType = ALLOWED_XP_EVENTS.has('SIM_ACTION') ? 'SIM_ACTION' : 'DAILY_DIRECTIVE';
      supabase
        .from('user_xp_ledger')
        .insert({
          user_id: userId,
          xp_amount: amount,
          event_type: eventType,
          description: eventName,
          source_page: 'rewards'
        })
        .then(({ error }) => {
          if (error) console.error('Error logging XP transaction:', error);
        });
    }
  });
};

export function addXP(amount: number, eventName: string, multLabel = "1.0x") {
  // Anti-abuse: check rate limit
  if (isXPRateLimited()) {
    console.warn('XP rate limit hit — too many XP events in short period');
    return getGamificationState();
  }

  const state = getGamificationState();
  let currentXP = state.xp + amount;
  let currentLevel = state.level;
  let currentXpRequired = state.xp_required;
  let leveledUp = false;

  while (currentXP >= currentXpRequired) {
    currentXP -= currentXpRequired;
    currentLevel += 1;
    currentXpRequired = Math.floor(500 * Math.pow(currentLevel, 1.2));
    leveledUp = true;
  }

  const rewardCurrencyGained = amount;
  const newBalance = state.bounty_balance + rewardCurrencyGained;

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const newEntry: LedgerEntry = {
    event: eventName,
    date: dateStr,
    mult: multLabel,
    xp: `+${amount} XP`,
  };

  const updatedState: GamificationState = {
    ...state,
    level: currentLevel,
    xp: currentXP,
    xp_required: currentXpRequired,
    bounty_balance: newBalance,
    ledger: [newEntry, ...state.ledger].slice(0, 50),
  };

  saveGamificationState(updatedState);

  // Trigger background database synchronization
  syncXPToSupabase(amount, currentXP, currentLevel, eventName, updatedState);

  if (leveledUp) {
    toast.success(`🎉 LEVEL UP! You reached Level ${currentLevel}!`, {
      description: "Unlocked new platform benefits and profile customizations.",
      duration: 5000,
    });
  } else {
    toast.success(`${eventName}: +${amount} XP!`);
  }

  return updatedState;
}

export function unlockBenefit(itemId: number, cost: number): boolean {
  const state = getGamificationState();
  if (state.bounty_balance < cost) {
    toast.error("Insufficient bounty balance to unlock this item!");
    return false;
  }

  if (state.unlocked_items.includes(itemId)) {
    toast.error("This benefit is already unlocked!");
    return false;
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const updatedState: GamificationState = {
    ...state,
    bounty_balance: state.bounty_balance - cost,
    unlocked_items: [...state.unlocked_items, itemId],
    ledger: [
      {
        event: `Unlocked Benefit #${itemId}`,
        date: dateStr,
        mult: "Purchase",
        xp: `-${cost} Coins`,
      },
      ...state.ledger,
    ],
  };

  saveGamificationState(updatedState);

  // Trigger background database synchronization
  syncXPToSupabase(-cost, updatedState.xp, updatedState.level, `Unlocked Benefit #${itemId}`, updatedState);

  toast.success("Successfully unlocked benefit!");
  return true;
}

export function completeMission(missionId: number, xpReward: number, text: string) {
  const state = getGamificationState();
  if (state.completed_missions.includes(missionId)) {
    return state;
  }

  const updatedState = {
    ...state,
    completed_missions: [...state.completed_missions, missionId],
  };
  
  saveGamificationState(updatedState);
  addXP(xpReward, `Completed Directive: ${text}`);
  return getGamificationState();
}

// Loads live database stats and XP history to seed local states
export async function syncGamificationWithSupabase() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const userId = session.user.id;

    // 1. Fetch profile level and XP
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_total, xp_level, streak_days')
      .eq('id', userId)
      .maybeSingle();

    // 2. Fetch ledger history
    const { data: dbLedger } = await supabase
      .from('user_xp_ledger')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const localState = getGamificationState();

    // DB values ALWAYS take priority over localStorage
    let mergedLevel = 1;
    let mergedXP = 0;
    let mergedStreak = 0;

    if (profile) {
      if (profile.xp_level !== null && profile.xp_level > 0) mergedLevel = profile.xp_level;
      if (profile.xp_total !== null && profile.xp_total >= 0) mergedXP = profile.xp_total;
      if (profile.streak_days !== null && profile.streak_days >= 0) mergedStreak = profile.streak_days;
    } else {
      // No DB profile yet — fall back to localStorage values
      mergedLevel = localState.level;
      mergedXP = localState.xp;
      mergedStreak = localState.streak;
    }

    let mergedLedger = localState.ledger;
    if (dbLedger && dbLedger.length > 0) {
      mergedLedger = dbLedger.map(row => {
        const dateObj = row.created_at ? new Date(row.created_at) : new Date();
        const dateStr = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        return {
          event: row.description || 'Discipline Event',
          date: dateStr,
          mult: row.xp_amount >= 0 ? "1.0x" : "Spend",
          xp: row.xp_amount >= 0 ? `+${row.xp_amount} XP` : `${row.xp_amount} Coins`
        };
      });
    }

    const nextXpRequired = Math.floor(500 * Math.pow(mergedLevel, 1.2));

    const updatedState: GamificationState = {
      ...localState,
      level: mergedLevel,
      xp: mergedXP,
      xp_required: nextXpRequired,
      streak: mergedStreak,
      ledger: mergedLedger
    };

    saveGamificationState(updatedState);
  } catch (err) {
    console.error('Error synchronizing gamification state:', err);
  }
}

export function verifyJournalAntiCheat(content: string): { valid: boolean; reason?: string } {
  if (content.length < 80) {
    return { valid: false, reason: "Journal entry is too brief (must be at least 80 characters long to earn XP)." };
  }
  
  const hash = content.trim().toLowerCase();
  const pastEntries = JSON.parse(localStorage.getItem("tradifive_past_journal_hashes") || "[]");
  if (pastEntries.includes(hash)) {
    return { valid: false, reason: "Abuse Warning: Duplicate journal entry detected. Paste content does not yield XP." };
  }

  const updatedHashes = [hash, ...pastEntries].slice(0, 10);
  localStorage.setItem("tradifive_past_journal_hashes", JSON.stringify(updatedHashes));

  return { valid: true };
}
