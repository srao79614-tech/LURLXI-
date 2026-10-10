import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, ChevronLeft } from 'lucide-react';
import { playWipeSound } from '../utils/soundEffects';
import { getStoredGestureSettings, GestureSettings } from '../utils/gestureSettings';

interface SlideToOpenOptionProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const SlideToOpenOption: React.FC<SlideToOpenOptionProps> = ({
  isOpen,
  onOpen,
}) => {
  const [gestureSettings, setGestureSettings] = useState<GestureSettings>(getStoredGestureSettings);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setGestureSettings(getStoredGestureSettings());
    };
    window.addEventListener('lurl-gesture-settings-updated', handleUpdate);
    return () => window.removeEventListener('lurl-gesture-settings-updated', handleUpdate);
  }, []);

  // Auto-dim / tuck away on scroll so it never hangs out over reading text
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let timer: any = null;

    const handleScroll = () => {
      if (Math.abs(window.scrollY - lastScrollY) > 80) {
        setIsScrolledDown(true);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          setIsScrolledDown(false);
        }, 1200);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (isOpen || !gestureSettings.edgeSwipeDrawerEnabled) return null;

  return (
    <>
      {/* Sleek, Non-Intrusive Floating HUD Trigger (Docked neatly at viewport edge, zero hanging out) */}
      <aside
        aria-label="Executive Command HUD"
        className={`fixed right-0 bottom-24 z-30 select-none pointer-events-auto transition-all duration-300 ${
          isScrolledDown && gestureSettings.autoHideHudOnScroll ? 'opacity-20 translate-x-2' : 'opacity-100 translate-x-0'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative flex items-center justify-end">
          {/* Tooltip hint on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 6, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-full mr-2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090d16]/95 border border-[#d47a37]/50 shadow-[0_4px_25px_rgba(0,0,0,0.85)] text-[11px] text-amber-200 font-semibold whitespace-nowrap backdrop-blur-md"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Navigation HUD</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sleek Edge Trigger Button */}
          <button
            type="button"
            id="slide-bar-left-trigger"
            onClick={() => {
              if (gestureSettings.swipeSoundFeedback) playWipeSound();
              onOpen();
            }}
            className="flex items-center gap-1.5 bg-gradient-to-l from-[#141a28] via-[#0d121c] to-[#1a140d] hover:from-[#1c2438] hover:to-[#261c12] border-y border-l border-amber-500/50 rounded-l-full py-2 px-3 sm:px-3.5 shadow-[-4px_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[-6px_4px_25px_rgba(212,122,55,0.4)] cursor-pointer group transition-all active:scale-95"
            title="Open Executive Navigation HUD"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-mono font-bold text-amber-300 tracking-wider uppercase">
              HUD
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </aside>
    </>
  );
};
