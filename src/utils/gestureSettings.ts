export interface GestureSettings {
  swipeTabNavigationEnabled: boolean;
  swipeSensitivity: 'sensitive' | 'balanced' | 'strict';
  floatingHudVisible: boolean;
  swipeSoundFeedback: boolean;
  edgeSwipeDrawerEnabled: boolean;
  autoHideHudOnScroll: boolean;
}

const DEFAULT_GESTURE_SETTINGS: GestureSettings = {
  swipeTabNavigationEnabled: true,
  swipeSensitivity: 'balanced',
  floatingHudVisible: false, // Default to clean, modern UI - zero hanging out
  swipeSoundFeedback: true,
  edgeSwipeDrawerEnabled: true,
  autoHideHudOnScroll: true,
};

const STORAGE_KEY = 'lurl_gesture_settings';

export function getStoredGestureSettings(): GestureSettings {
  if (typeof window === 'undefined') return DEFAULT_GESTURE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GESTURE_SETTINGS;
    return { ...DEFAULT_GESTURE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GESTURE_SETTINGS;
  }
}

export function saveStoredGestureSettings(updates: Partial<GestureSettings>): GestureSettings {
  const current = getStoredGestureSettings();
  const updated = { ...current, ...updates };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lurl-gesture-settings-updated', { detail: updated }));
    } catch {
      // Storage error fallback
    }
  }
  return updated;
}
