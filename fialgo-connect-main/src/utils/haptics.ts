/**
 * Haptics Utility
 * Provides native tactile vibration feedback across mobile browsers (Android Chrome, Edge, Firefox, Samsung Internet, WebViews).
 * Gracefully falls back on platforms that don't support the HTML5 Vibration API (e.g. desktop or iOS Safari).
 */

export type HapticStyle = 
  | 'selection' 
  | 'light' 
  | 'medium' 
  | 'heavy' 
  | 'success' 
  | 'warning' 
  | 'error';

let lastHapticTime = 0;

export function triggerHaptic(style: HapticStyle = 'light'): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  // Prevent rapid-fire vibrations within 50ms
  if (now - lastHapticTime < 50) return;
  lastHapticTime = now;

  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      switch (style) {
        case 'selection':
          navigator.vibrate(8);
          break;
        case 'light':
          navigator.vibrate(12);
          break;
        case 'medium':
          navigator.vibrate(22);
          break;
        case 'heavy':
          navigator.vibrate(35);
          break;
        case 'success':
          navigator.vibrate([10, 30, 15]);
          break;
        case 'warning':
          navigator.vibrate([20, 40, 20]);
          break;
        case 'error':
          navigator.vibrate([35, 50, 35]);
          break;
        default:
          navigator.vibrate(12);
      }
    } catch {
      // Safe no-op if vibration is blocked or restricted by browser policy
    }
  }
}

/**
 * Initializes a global touch listener so that ANY button, interactive tab,
 * link, or clickable element automatically vibrates with a crisp native haptic pulse on mobile.
 */
export function initGlobalHaptics(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handlePointerDown = (e: PointerEvent) => {
    // Only fire on touch or stylus interactions
    const isTouch = 
      e.pointerType === 'touch' || 
      e.pointerType === 'pen' || 
      ('ontouchstart' in window);

    if (!isTouch) return;

    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(
      'button, [role="button"], a, input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select, [data-haptic], .haptic-tap'
    );

    if (interactive) {
      if ((interactive as HTMLButtonElement).disabled) return;
      triggerHaptic('light');
    }
  };

  window.addEventListener('pointerdown', handlePointerDown, { passive: true, capture: true });

  return () => {
    window.removeEventListener('pointerdown', handlePointerDown, { capture: true });
  };
}
