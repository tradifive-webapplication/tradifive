/**
 * Tradifive Security — Input Sanitization Utility
 * 
 * Provides sanitization helpers to protect against XSS, injection,
 * and open redirect attacks throughout the application.
 */

/**
 * Strips HTML tags and encodes dangerous characters to prevent XSS.
 * Use before rendering any user-supplied content as text.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
}

/**
 * Strips all HTML tags (for plain text fields).
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Validates and sanitizes an email address.
 * Returns null if the email is invalid.
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  // RFC 5322 simplified regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed) || trimmed.length > 320) return null;
  return trimmed;
}

/**
 * Validates password strength for Tradifive.
 * Returns an error message string, or null if valid.
 */
export function validatePassword(password: string): string | null {
  if (!password || typeof password !== "string") return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 128) return "Password is too long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}

/**
 * Sanitizes a referral code to prevent injection.
 * Only allows alphanumeric characters and hyphens.
 */
export function sanitizeReferralCode(code: string): string {
  if (!code || typeof code !== "string") return "";
  return code.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 32);
}

/**
 * Sanitizes a username: only allow alphanumeric, underscores, dots.
 * Prevents injection via profile creation.
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== "string") return "";
  return username
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, "")
    .slice(0, 30);
}

/**
 * Validates a URL is safe (same-origin or known trusted domains).
 * Prevents open redirect attacks.
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url, window.location.origin);
    const trustedDomains = [
      window.location.hostname,
      "tradifive.in",
      "www.tradifive.in",
    ];
    return trustedDomains.includes(parsed.hostname);
  } catch {
    // Relative URLs are always safe
    return url.startsWith("/") && !url.startsWith("//");
  }
}

/**
 * Sanitizes free-text fields (bio, notes, messages).
 * Strips HTML but preserves newlines and whitespace.
 */
export function sanitizeFreeText(input: string, maxLength = 2000): string {
  if (!input || typeof input !== "string") return "";
  return stripHtml(input).slice(0, maxLength);
}

/**
 * Validates name fields (first name, last name).
 * Allows letters, spaces, hyphens, apostrophes (international names).
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== "string") return "";
  return name
    .replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, "")
    .trim()
    .slice(0, 64);
}
