/**
 * Bencho-Grade Interface Sound Effects Engine
 * Generates zero-latency, high-fidelity Web Audio API micro-sounds.
 * Zero network requests, 0kb bundle assets, instant tactile audio feedback.
 */

import { triggerHaptic, HapticStyle } from './haptics';

export type SoundEffectType =
  | 'click'
  | 'pop'
  | 'like'
  | 'unlike'
  | 'toggleOn'
  | 'toggleOff'
  | 'tab'
  | 'success'
  | 'notification'
  | 'delete'
  | 'modalOpen'
  | 'modalClose'
  | 'error';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const setting = localStorage.getItem('tradifive_sound_enabled');
    return setting === null ? true : setting === 'true';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('tradifive_sound_enabled', enabled ? 'true' : 'false');
  } catch {}
}

export function toggleSoundEnabled(): boolean {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  if (next) {
    playSound('toggleOn');
  }
  return next;
}

/**
 * Play a synthesized UI sound effect with optional coordinated haptic vibration.
 */
export function playSound(
  type: SoundEffectType,
  options?: { volume?: number; haptic?: HapticStyle | false }
): void {
  if (!isSoundEnabled()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterVolume = options?.volume ?? 1.0;

  // Coordinate with native haptics if requested (default matches sound personality)
  if (options?.haptic !== false) {
    const hapticMap: Record<SoundEffectType, HapticStyle> = {
      click: 'light',
      pop: 'light',
      like: 'selection',
      unlike: 'light',
      toggleOn: 'medium',
      toggleOff: 'light',
      tab: 'selection',
      success: 'success',
      notification: 'medium',
      delete: 'medium',
      modalOpen: 'light',
      modalClose: 'light',
      error: 'error',
    };
    triggerHaptic(options?.haptic || hapticMap[type] || 'light');
  }

  try {
    switch (type) {
      case 'click': {
        // Crisp, mechanical micro-click (18ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.018);

        gain.gain.setValueAtTime(0.09 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.018);
        break;
      }

      case 'tab': {
        // Ultra-subtle selection tick (10ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.012);

        gain.gain.setValueAtTime(0.04 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.012);
        break;
      }

      case 'pop':
      case 'like': {
        // Satisfying resonant bubble pop with musical shimmer (120ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.035);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.09);

        gain.gain.setValueAtTime(0.18 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);

        // Sweet harmonic chime on 'like'
        if (type === 'like') {
          const chime = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          chime.type = 'triangle';
          chime.frequency.setValueAtTime(1318.51, now + 0.02); // E6
          chimeGain.gain.setValueAtTime(0.08 * masterVolume, now + 0.02);
          chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          chime.connect(chimeGain);
          chimeGain.connect(ctx.destination);
          chime.start(now + 0.02);
          chime.stop(now + 0.18);
        }
        break;
      }

      case 'unlike': {
        // Subtle low pop (60ms)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);

        gain.gain.setValueAtTime(0.08 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }

      case 'toggleOn': {
        // Uplifting ascending two-tone micro-arpeggio
        const notes = [659.25, 987.77]; // E5 -> B5
        notes.forEach((freq, idx) => {
          const noteTime = now + idx * 0.045;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.09 * masterVolume, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.065);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.065);
        });
        break;
      }

      case 'toggleOff': {
        // Descending two-tone deactivation
        const notes = [987.77, 659.25]; // B5 -> E5
        notes.forEach((freq, idx) => {
          const noteTime = now + idx * 0.045;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.07 * masterVolume, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.065);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.065);
        });
        break;
      }

      case 'success': {
        // Rich, elegant 4-note ascending major celebration chord
        // C5 (523.25) -> E5 (659.25) -> G5 (783.99) -> C6 (1046.50)
        const chord = [523.25, 659.25, 783.99, 1046.5];
        chord.forEach((freq, i) => {
          const startTime = now + i * 0.045;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          const duration = i === chord.length - 1 ? 0.35 : 0.18;
          gain.gain.setValueAtTime(0.12 * masterVolume, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        });
        break;
      }

      case 'notification': {
        // High crystalline glass chime
        const freqs = [1046.5, 1318.51]; // C6 -> E6
        freqs.forEach((freq, idx) => {
          const noteTime = now + idx * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.11 * masterVolume, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.28);
        });
        break;
      }

      case 'delete': {
        // Muffled downward thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);

        gain.gain.setValueAtTime(0.12 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }

      case 'modalOpen': {
        // Airy rising whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.075);

        gain.gain.setValueAtTime(0.06 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.075);
        break;
      }

      case 'modalClose': {
        // Airy falling whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.065);

        gain.gain.setValueAtTime(0.05 * masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.065);
        break;
      }

      case 'error': {
        // Two low caution pulses
        [280, 240].forEach((freq, idx) => {
          const noteTime = now + idx * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0.14 * masterVolume, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.09);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.09);
        });
        break;
      }
    }
  } catch (err) {
    console.debug('Sound synthesis failed', err);
  }
}
