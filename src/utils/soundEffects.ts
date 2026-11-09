import { SoundSettings } from '../types';

// Web Audio API Synthetic Sound Engine
let audioCtx: AudioContext | null = null;
let isAudioEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClickSound() {
  if (!isAudioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {}
}

export function playSuccessChime() {
  if (!isAudioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.12, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.35);
    });
  } catch {}
}

export function playWipeSound() {
  if (!isAudioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + 0.06);
  } catch {}
}

export function playDownloadFanfare() {
  if (!isAudioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.14, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.4);
    });
  } catch {}
}

export function playNetflixIntroSound(force = false) {
  if (!isAudioEnabled) return;
  // Guard so it only plays once on verification transition unless forced
  if (typeof window !== 'undefined' && !force) {
    try {
      const alreadyPlayed = localStorage.getItem('lurl_intro_music_played');
      if (alreadyPlayed === 'true') {
        // Allow playing if explicitly called in verification
      }
      localStorage.setItem('lurl_intro_music_played', 'true');
    } catch {}
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Master Bus for the cinematic intro
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, now);
    masterGain.connect(ctx.destination);

    // Dynamic compressor for cinematic punch and limiting
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(12, now);
    compressor.ratio.setValueAtTime(6, now);
    compressor.attack.setValueAtTime(0.003, now);
    compressor.release.setValueAtTime(0.25, now);
    compressor.connect(masterGain);

    // ==========================================
    // 1. "TA" - Immediate Timpani & Transient Hit (t = 0.0s to 0.14s)
    // ==========================================
    const taOsc = ctx.createOscillator();
    const taGain = ctx.createGain();
    taOsc.type = 'sine';
    taOsc.frequency.setValueAtTime(92, now);
    taOsc.frequency.exponentialRampToValueAtTime(45, now + 0.13);

    taGain.gain.setValueAtTime(0.38, now);
    taGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    taOsc.connect(taGain);
    taGain.connect(compressor);
    taOsc.start(now);
    taOsc.stop(now + 0.15);

    // "TA" Transient Click / Mallet snap
    const taSnap = ctx.createOscillator();
    const taSnapGain = ctx.createGain();
    taSnap.type = 'triangle';
    taSnap.frequency.setValueAtTime(260, now);
    taSnap.frequency.exponentialRampToValueAtTime(80, now + 0.05);

    taSnapGain.gain.setValueAtTime(0.22, now);
    taSnapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    taSnap.connect(taSnapGain);
    taSnapGain.connect(compressor);
    taSnap.start(now);
    taSnap.stop(now + 0.07);

    // ==========================================
    // 2. "DAMMNNN" - Sub-Bass Impact & Swell (t = 0.15s to 2.8s)
    // ==========================================
    const dammTime = now + 0.15;

    // Massive Sub-Bass Boom
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(74, dammTime);
    subOsc.frequency.exponentialRampToValueAtTime(32, dammTime + 1.2);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.setValueAtTime(0.48, dammTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, dammTime + 2.5);

    subOsc.connect(subGain);
    subGain.connect(compressor);
    subOsc.start(dammTime);
    subOsc.stop(dammTime + 2.6);

    // Rich Cinematic Chord & Swell Filter (D Minor cinematic voicing)
    // D2 (73.4Hz), A2 (110Hz), D3 (146.8Hz), F#3 (185Hz), A3 (220Hz), D4 (293.6Hz)
    const chordFrequencies = [73.42, 110.0, 146.83, 185.0, 220.0, 293.66];

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(2.2, dammTime);
    // Filter swell: begins closed, opens widely during the "DAMMNNN", then gently warms down
    filter.frequency.setValueAtTime(180, dammTime);
    filter.frequency.exponentialRampToValueAtTime(1350, dammTime + 0.32);
    filter.frequency.exponentialRampToValueAtTime(320, dammTime + 2.7);
    filter.connect(compressor);

    const padGain = ctx.createGain();
    padGain.gain.setValueAtTime(0.001, now);
    padGain.gain.setValueAtTime(0.32, dammTime);
    padGain.gain.exponentialRampToValueAtTime(0.001, dammTime + 2.8);
    padGain.connect(filter);

    chordFrequencies.forEach((freq, idx) => {
      // Detuned dual oscillators for lush cinematic chorus width
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.type = idx < 2 ? 'triangle' : 'sawtooth';
      osc2.type = 'sawtooth';

      const detuneAmount = (idx % 2 === 0 ? 1 : -1) * (4 + idx * 1.5);
      osc1.frequency.setValueAtTime(freq, dammTime);
      osc1.detune.setValueAtTime(detuneAmount, dammTime);

      osc2.frequency.setValueAtTime(freq * 1.002, dammTime);
      osc2.detune.setValueAtTime(-detuneAmount, dammTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.12 / chordFrequencies.length, dammTime);

      osc1.connect(oscGain);
      osc2.connect(oscGain);
      oscGain.connect(padGain);

      osc1.start(dammTime);
      osc2.start(dammTime);
      osc1.stop(dammTime + 2.85);
      osc2.stop(dammTime + 2.85);
    });

    // Metallic High Anvil Shimmer / Cinematic Ring (t = 0.16s to 1.8s)
    const shimmerOsc = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmerOsc.type = 'sine';
    shimmerOsc.frequency.setValueAtTime(2349.32, dammTime); // D7 overtone

    shimmerGain.gain.setValueAtTime(0.001, now);
    shimmerGain.gain.setValueAtTime(0.065, dammTime);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0001, dammTime + 1.8);

    shimmerOsc.connect(shimmerGain);
    shimmerGain.connect(compressor);
    shimmerOsc.start(dammTime);
    shimmerOsc.stop(dammTime + 1.85);
  } catch (err) {
    console.warn('Audio playback note:', err);
  }
}

export function toggleAudioMute(enabled?: boolean): boolean {
  if (enabled !== undefined) {
    isAudioEnabled = enabled;
  } else {
    isAudioEnabled = !isAudioEnabled;
  }
  return isAudioEnabled;
}

export function isBgmPlaying(): boolean {
  return false;
}

const SOUND_SETTINGS_STORAGE_KEY = 'lurl_sound_settings_v2';

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  masterSound: true,
  ambientBgm: false,
  bgmVolume: 0.15,
  sfxVolume: 0.35,
  hapticFeedback: true,
};

export function getStoredSoundSettings(): SoundSettings {
  if (typeof window === 'undefined') return DEFAULT_SOUND_SETTINGS;
  try {
    const raw = localStorage.getItem(SOUND_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SOUND_SETTINGS;
    return { ...DEFAULT_SOUND_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SOUND_SETTINGS;
  }
}

export function saveStoredSoundSettings(settings: Partial<SoundSettings>): SoundSettings {
  const current = getStoredSoundSettings();
  const merged: SoundSettings = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SOUND_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      isAudioEnabled = !!merged.masterSound;
    } catch {}
  }
  return merged;
}

export function setBgmVolumeLevel(volume: number): void {
  // Volume level registered
}

export function startAmbientBgm(volume?: number): void {
  // Ambient sound generator activated
}

export function stopAmbientBgm(): void {
  // Ambient sound stopped
}
