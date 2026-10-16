/**
 * Tradifive Security — Client-Side Rate Limiter
 *
 * Implements exponential backoff and attempt tracking for auth flows.
 * This is defense-in-depth: server-side (Supabase Auth) also enforces limits.
 *
 * Usage:
 *   const limiter = createRateLimiter("login");
 *   if (limiter.isBlocked()) { return; }
 *   limiter.recordAttempt();
 */

interface RateLimiterConfig {
  /** Max attempts before lockout */
  maxAttempts: number;
  /** Base lockout duration in ms (doubles each lockout) */
  baseLockoutMs: number;
  /** Maximum lockout cap in ms */
  maxLockoutMs: number;
  /** Window in which attempts are counted (ms) */
  windowMs: number;
}

interface RateLimiterState {
  attempts: number;
  windowStart: number;
  lockedUntil: number;
  lockoutCount: number;
}

const DEFAULTS: RateLimiterConfig = {
  maxAttempts: 5,
  baseLockoutMs: 30_000,     // 30 seconds
  maxLockoutMs: 900_000,     // 15 minutes
  windowMs: 300_000,         // 5 minute window
};

function getStateKey(id: string): string {
  return `tradifive_rl_${id}`;
}

function loadState(id: string): RateLimiterState {
  try {
    const raw = sessionStorage.getItem(getStateKey(id));
    if (raw) return JSON.parse(raw) as RateLimiterState;
  } catch {
    // ignore
  }
  return { attempts: 0, windowStart: Date.now(), lockedUntil: 0, lockoutCount: 0 };
}

function saveState(id: string, state: RateLimiterState): void {
  try {
    sessionStorage.setItem(getStateKey(id), JSON.stringify(state));
  } catch {
    // ignore in private browsing
  }
}

export interface RateLimiter {
  /** Returns true if the user is currently locked out */
  isBlocked(): boolean;
  /** Returns remaining lockout time in seconds (0 if not locked) */
  getRemainingLockoutSeconds(): number;
  /** Records a failed attempt. Returns true if now locked out. */
  recordFailedAttempt(): boolean;
  /** Resets attempts (call on successful auth) */
  reset(): void;
  /** Returns how many attempts remain before lockout */
  attemptsRemaining(): number;
}

export function createRateLimiter(
  id: string,
  config: Partial<RateLimiterConfig> = {}
): RateLimiter {
  const cfg = { ...DEFAULTS, ...config };

  return {
    isBlocked() {
      const state = loadState(id);
      return Date.now() < state.lockedUntil;
    },

    getRemainingLockoutSeconds() {
      const state = loadState(id);
      const remaining = state.lockedUntil - Date.now();
      return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
    },

    recordFailedAttempt() {
      const state = loadState(id);
      const now = Date.now();

      // Reset window if expired
      if (now - state.windowStart > cfg.windowMs) {
        state.attempts = 0;
        state.windowStart = now;
      }

      state.attempts += 1;

      if (state.attempts >= cfg.maxAttempts) {
        state.lockoutCount += 1;
        // Exponential backoff: 30s, 60s, 120s, 240s... capped at maxLockoutMs
        const lockoutDuration = Math.min(
          cfg.baseLockoutMs * Math.pow(2, state.lockoutCount - 1),
          cfg.maxLockoutMs
        );
        state.lockedUntil = now + lockoutDuration;
        state.attempts = 0;
        state.windowStart = now;
        saveState(id, state);
        return true;
      }

      saveState(id, state);
      return false;
    },

    reset() {
      sessionStorage.removeItem(getStateKey(id));
    },

    attemptsRemaining() {
      const state = loadState(id);
      return Math.max(0, cfg.maxAttempts - state.attempts);
    },
  };
}

/** Pre-configured limiters for common flows */
export const loginLimiter = createRateLimiter("login", {
  maxAttempts: 5,
  baseLockoutMs: 30_000,
  maxLockoutMs: 900_000,
});

export const otpLimiter = createRateLimiter("otp", {
  maxAttempts: 3,
  baseLockoutMs: 60_000,
  maxLockoutMs: 600_000,
});

export const passwordResetLimiter = createRateLimiter("password_reset", {
  maxAttempts: 3,
  baseLockoutMs: 60_000,
  maxLockoutMs: 300_000,
});

/**
 * AI Coach rate limiter — matches server-side limit.
 * 15 requests per minute, escalating lockout on repeated abuse.
 */
export const aiCoachLimiter = createRateLimiter("ai_coach", {
  maxAttempts: 15,
  baseLockoutMs: 60_000,     // 1 minute
  maxLockoutMs: 900_000,     // 15 minutes max
  windowMs: 60_000,          // 1 minute window
});

/**
 * XP action rate limiter — prevents XP farming exploits.
 * Max 10 XP-earning events per minute.
 */
export const xpActionLimiter = createRateLimiter("xp_action", {
  maxAttempts: 10,
  baseLockoutMs: 60_000,
  maxLockoutMs: 300_000,
  windowMs: 60_000,
});

/**
 * Referral action limiter — prevents referral abuse.
 * Max 5 referral actions per hour.
 */
export const referralLimiter = createRateLimiter("referral", {
  maxAttempts: 5,
  baseLockoutMs: 3_600_000,  // 1 hour lockout
  maxLockoutMs: 3_600_000,
  windowMs: 3_600_000,       // 1 hour window
});
