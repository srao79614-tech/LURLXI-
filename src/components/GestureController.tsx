import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { playClickSound, playWipeSound } from '../utils/soundEffects';
import { getStoredGestureSettings, GestureSettings, saveStoredGestureSettings } from '../utils/gestureSettings';

export type WorkspaceTab = 'codex' | 'bookmarks' | 'skills-book' | 'demo-trading' | 'ai-chat' | 'share-thoughts' | 'performance';

const TAB_CONFIGS: { id: WorkspaceTab; label: string; icon: string }[] = [
  { id: 'codex', label: 'Course Codex', icon: '📖' },
  { id: 'bookmarks', label: 'Saved Pages', icon: '🔖' },
  { id: 'skills-book', label: '50 Skills', icon: '🧭' },
  { id: 'demo-trading', label: 'Live Trading', icon: '📈' },
  { id: 'ai-chat', label: 'AI Advisor', icon: '🤖' },
  { id: 'share-thoughts', label: 'Network', icon: '🌐' },
  { id: 'performance', label: 'Ledger', icon: '📊' },
];

interface GestureControllerProps {
  currentTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  enabled?: boolean;
}

export const GestureController: React.FC<GestureControllerProps> = ({
  currentTab,
  onTabChange,
  enabled = true,
}) => {
  const [gestureSettings, setGestureSettings] = useState<GestureSettings>(getStoredGestureSettings);
  const [gestureNotice, setGestureNotice] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const noticeTimerRef = useRef<any>(null);

  useEffect(() => {
    const handleSettingsUpdate = () => {
      setGestureSettings(getStoredGestureSettings());
    };
    window.addEventListener('lurl-gesture-settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('lurl-gesture-settings-updated', handleSettingsUpdate);
  }, []);

  const currentIndex = TAB_CONFIGS.findIndex((t) => t.id === currentTab);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const nextTab = TAB_CONFIGS[currentIndex - 1].id;
      if (gestureSettings.swipeSoundFeedback) playWipeSound();
      onTabChange(nextTab);
      showNotice(`Switched to ${TAB_CONFIGS[currentIndex - 1].label}`, 'left');
    }
  };

  const goToNext = () => {
    if (currentIndex < TAB_CONFIGS.length - 1) {
      const nextTab = TAB_CONFIGS[currentIndex + 1].id;
      if (gestureSettings.swipeSoundFeedback) playWipeSound();
      onTabChange(nextTab);
      showNotice(`Switched to ${TAB_CONFIGS[currentIndex + 1].label}`, 'right');
    }
  };

  const showNotice = (text: string, direction: 'left' | 'right') => {
    setGestureNotice(text);
    setSwipeDirection(direction);
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = setTimeout(() => {
      setGestureNotice(null);
      setSwipeDirection(null);
    }, 1200);
  };

  // High-Precision Touch Swipe Engine (Calibrated, zero-hanging, no blocking reading scroll)
  useEffect(() => {
    if (!enabled || !gestureSettings.swipeTabNavigationEnabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      // Do NOT trigger if user is interacting with interactive charts, inputs, sliders or code blocks
      if (
        target?.closest('input') ||
        target?.closest('textarea') ||
        target?.closest('select') ||
        target?.closest('button') ||
        target?.closest('canvas') ||
        target?.closest('.tradingview-chart') ||
        target?.closest('.no-swipe-zone')
      ) {
        touchStartXRef.current = null;
        return;
      }

      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
      touchStartTimeRef.current = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartXRef.current === null || touchStartYRef.current === null) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - touchStartXRef.current;
      const deltaY = endY - touchStartYRef.current;
      const elapsedTime = Date.now() - touchStartTimeRef.current;

      touchStartXRef.current = null;
      touchStartYRef.current = null;

      // Dynamic thresholds from settings
      let minDistance = 70;
      let maxDuration = 450;
      if (gestureSettings.swipeSensitivity === 'sensitive') {
        minDistance = 45;
        maxDuration = 550;
      } else if (gestureSettings.swipeSensitivity === 'strict') {
        minDistance = 110;
        maxDuration = 350;
      }

      // Horizontal gesture validation: must be primarily horizontal and swift
      if (
        Math.abs(deltaX) > minDistance &&
        Math.abs(deltaX) > Math.abs(deltaY) * 1.8 &&
        elapsedTime < maxDuration
      ) {
        if (deltaX < 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentIndex, enabled, gestureSettings]);

  // Keyboard Left / Right Navigation (when not typing)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, enabled]);

  return (
    <>
      {/* Dynamic Gesture Feedback Toast */}
      <AnimatePresence>
        {gestureNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0a0e17]/95 border border-[#d47a37]/60 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl text-xs font-mono font-bold text-amber-300">
              {swipeDirection === 'left' ? (
                <ChevronLeft className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : (
                <ChevronRight className="w-4 h-4 text-amber-400 animate-pulse" />
              )}
              <span>{gestureNotice}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Gesture Dock: Only rendered if explicitly enabled in Settings and placed comfortably above bottom navigation */}
      {gestureSettings.floatingHudVisible && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-35 select-none pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#090d16]/95 border border-[#d47a37]/50 shadow-[0_12px_40px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            {/* Previous Tab Gesture Button */}
            <button
              type="button"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
              className="p-1 rounded-full hover:bg-[#151c2e] text-[#9ca3af] hover:text-amber-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Swipe right or click for Previous Module (Alt + ◀)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Dots Indicator for 6 Workspace Engines */}
            <div className="flex items-center gap-1 px-1.5">
              {TAB_CONFIGS.map((tab, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onTabChange(tab.id);
                    }}
                    className={`transition-all cursor-pointer flex items-center justify-center ${
                      isActive
                        ? 'w-5 h-2 rounded-full bg-gradient-to-r from-amber-400 to-[#d47a37] shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                        : 'w-2 h-2 rounded-full bg-[#252f44] hover:bg-[#3b4968]'
                    }`}
                    title={`Jump to ${tab.label}`}
                  />
                );
              })}
            </div>

            {/* Current Engine Badge */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-gray-300 font-semibold px-2 py-0.5 rounded-full bg-[#121826] border border-[#1e273a]">
              <span>{TAB_CONFIGS[currentIndex]?.icon}</span>
              <span className="truncate max-w-[85px]">{TAB_CONFIGS[currentIndex]?.label}</span>
            </div>

            {/* Next Tab Gesture Button */}
            <button
              type="button"
              onClick={goToNext}
              disabled={currentIndex === TAB_CONFIGS.length - 1}
              className="p-1 rounded-full hover:bg-[#151c2e] text-[#9ca3af] hover:text-amber-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
              title="Swipe left or click for Next Module (Alt + ▶)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Dismiss / Minimize HUD Button so it never hangs out unwanted */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                saveStoredGestureSettings({ floatingHudVisible: false });
              }}
              className="p-1 ml-1 rounded-full hover:bg-rose-950/40 text-gray-400 hover:text-rose-300 border-l border-[#1f2638] transition-colors cursor-pointer"
              title="Hide floating HUD (can be re-enabled in Settings)"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
