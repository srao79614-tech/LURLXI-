import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import {
  X,
  CandlestickChart,
  BookOpen,
  Bot,
  Zap,
  BarChart3,
  Crown,
  Download,
  User,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  ExternalLink,
  Bookmark,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
  Globe,
  Radio,
  Compass,
  ArrowRight,
  Activity,
  Cpu,
  MoveRight,
  ShoppingBag,
  TrendingUp,
  Smartphone,
  MessageSquare,
} from 'lucide-react';
import { CategoryType, UserSession, UserProfile } from '../types';
import { ThreeDLogo } from './ThreeDLogo';
import { playClickSound, playWipeSound } from '../utils/soundEffects';
import { getActiveServerOrigin } from '../utils/urlHelper';
import { maskEmail, isPrivilegedAdminEmail } from '../utils/maskEmail';
import { CATEGORIES_DATA } from '../data/categoriesData';

interface SlideBarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (
    stage: 'landing' | 'select' | 'application',
    tab?: 'codex' | 'bookmarks' | 'skills-book' | 'ai-chat' | 'share-thoughts' | 'performance' | 'demo-trading'
  ) => void;
  onSelectCategory?: (category: CategoryType) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenVipPortal: () => void;
  onOpenVipChatBox?: () => void;
  onOpenSecuritySentinel?: () => void;
  onOpenStandaloneDownload: () => void;
  onOpenAuth: () => void;
  isBgmOn: boolean;
  onToggleBgm: () => void;
  userSession: UserSession | null;
  userProfile: UserProfile;
  selectedCategory: CategoryType;
  currentTab?: string;
}

export const SlideBarMenu: React.FC<SlideBarMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectCategory,
  onOpenProfile,
  onOpenSettings,
  onOpenVipPortal,
  onOpenVipChatBox,
  onOpenSecuritySentinel,
  onOpenStandaloneDownload,
  onOpenAuth,
  isBgmOn,
  onToggleBgm,
  userSession,
  userProfile,
  selectedCategory,
  currentTab,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string>(() => getActiveServerOrigin());
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isWiping, setIsWiping] = useState(false);

  // Motion values for real-time wipe/drag tracking
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [0, 200], [1, 0.45]);
  const dragScale = useTransform(dragX, [0, 200], [1, 0.94]);
  const wipeIndicatorOpacity = useTransform(dragX, [0, 50, 150], [0, 0.6, 1]);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setLiveUrl(getActiveServerOrigin());
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) +
          ' UTC'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Reset drag value on open
  useEffect(() => {
    if (isOpen) {
      dragX.set(0);
      setIsWiping(false);
    }
  }, [isOpen, dragX]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const navItems = [
    {
      id: 'demo-trading',
      label: 'Bitcoin Demo Trading Terminal',
      desc: 'Real-time candlestick charts, leverage risk sizing & simulator',
      icon: CandlestickChart,
      stage: 'application' as const,
      tab: 'demo-trading' as const,
      badge: 'Interactive Live',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      activeColor: 'from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/60',
    },
    {
      id: 'skills-book',
      label: 'The Grand Codex of Skill Development',
      desc: '10 Universal Pillars, 50 Master Curriculums & Global Rankings',
      icon: Compass,
      stage: 'application' as const,
      tab: 'skills-book' as const,
      badge: '50 Master Skills',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      activeColor: 'from-amber-600/25 via-amber-500/10 to-transparent border-amber-400',
    },
    {
      id: 'codex',
      label: 'Executive Course Codex',
      desc: 'Complete curriculum for Trading, Dropshipping, Ecom, Startups & Skills',
      icon: BookOpen,
      stage: 'application' as const,
      tab: 'codex' as const,
      badge: '5 Tracks',
      badgeColor: 'text-[#f8b179] bg-[#d47a37]/15 border-[#d47a37]/30',
      activeColor: 'from-[#d47a37]/20 via-[#d47a37]/10 to-transparent border-[#d47a37]',
    },
    {
      id: 'bookmarks',
      label: 'Saved Bookmarks Vault',
      desc: 'Quick access to all saved chapter pages, formulas & analytical excerpts',
      icon: Bookmark,
      stage: 'application' as const,
      tab: 'bookmarks' as const,
      badge: 'Saved Pages',
      badgeColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
      activeColor: 'from-amber-600/25 via-amber-500/10 to-transparent border-amber-400',
    },
    {
      id: 'ai-chat',
      label: 'AI Autonomous Advisor',
      desc: 'Self-adapting Gemini 3.8 Flash-Intelligence with voice synthesis',
      icon: Bot,
      stage: 'application' as const,
      tab: 'ai-chat' as const,
      badge: 'Voice Active',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      activeColor: 'from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500/60',
    },
    {
      id: 'share-thoughts',
      label: 'Worldwide Conversation Network',
      desc: 'Real-time strategies, tactics & ideas with photo/video upload',
      icon: Globe,
      stage: 'application' as const,
      tab: 'share-thoughts' as const,
      badge: 'Global Media',
      badgeColor: 'text-sky-400 bg-sky-500/15 border-sky-500/30',
      activeColor: 'from-sky-500/20 via-sky-500/10 to-transparent border-sky-500/60',
    },
    {
      id: 'performance',
      label: 'Classic Performance Dashboard',
      desc: 'Institutional ledger, historical learning metrics & mastery charts',
      icon: BarChart3,
      stage: 'application' as const,
      tab: 'performance' as const,
      badge: 'Classic Style',
      badgeColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      activeColor: 'from-purple-500/20 via-purple-500/10 to-transparent border-purple-500/60',
    },
  ];

  // Category switcher data
  const categoryPills: { id: CategoryType; label: string; icon: any }[] = [
    { id: 'trading', label: 'Trading', icon: TrendingUp },
    { id: 'dropshipping', label: 'Dropship', icon: Bot },
    { id: 'ecommerce', label: 'E-com', icon: ShoppingBag },
    { id: 'startup', label: 'Startup', icon: Zap },
    { id: 'skill-development', label: '50 Skills', icon: Compass },
  ];

  // Touch gesture handler for swiping/wiping anywhere on the drawer
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartXRef.current;
    if (deltaX > 25) {
      setIsWiping(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsWiping(false);
    if (touchStartXRef.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const deltaX = endX - touchStartXRef.current;
    const deltaY = endY - (touchStartYRef.current ?? endY);
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Fast wipe to the right (deltaX > 45px and not a vertical scroll)
    if (deltaX > 45 && Math.abs(deltaY) < 110) {
      playWipeSound();
      onClose();
    }
  };

  // Horizontal trackpad wipe dismissal
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaX > 45) {
      playWipeSound();
      onClose();
    }
  };

  // Framer-motion drag dismissal handler (wipe with mouse or touch drag)
  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    setIsWiping(false);
    // If dragged right more than 65px OR flicked with velocity > 200px/s
    if (info.offset.x > 65 || info.velocity.x > 200) {
      playWipeSound();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end select-none">
          {/* High-tech Backdrop overlay with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => {
              playWipeSound();
              onClose();
            }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Sliding Sidebar Drawer with Smooth Spring Animation (No hanging out, instant snap) */}
          <motion.aside
            ref={drawerRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ right: 0.6, left: 0 }}
            onDragEnd={handleDragEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.7,
            }}
            className="relative w-full max-w-[420px] sm:max-w-[450px] h-full bg-[#080b12]/98 backdrop-blur-2xl border-l border-[#d47a37]/40 shadow-[-25px_0_70px_rgba(0,0,0,0.85)] z-10 flex flex-col justify-between overflow-hidden cursor-default group"
          >
            {/* Real-time Dynamic Wipe Indicator Overlay (Glows when user wipes) */}
            <motion.div
              style={{ opacity: wipeIndicatorOpacity }}
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#d47a37]/15 to-[#d47a37]/30 z-40 flex items-center justify-center backdrop-blur-[2px]"
            >
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/90 border border-amber-400 shadow-[0_0_35px_rgba(212,122,55,0.6)] text-amber-300 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
                <span>Wiping Out</span>
                <MoveRight className="w-5 h-5 text-amber-400" />
              </div>
            </motion.div>

            {/* Left Edge Tactile Wipe Rail (Click/Drag handle to dismiss smoothly) */}
            <div
              title="Wipe or pull right to close"
              className="absolute left-0 top-0 bottom-0 w-2.5 hover:w-3.5 bg-gradient-to-b from-[#d47a37]/30 via-[#d47a37]/70 to-[#d47a37]/30 hover:bg-[#f8b179] transition-all cursor-ew-resize z-30 flex items-center justify-center opacity-70 group-hover:opacity-100"
            >
              <div className="w-1 h-8 rounded-full bg-white/70 shadow-sm" />
            </div>

            {/* TOP FIXED SECTION: HEADER & WIPE PILL */}
            <div className="border-b border-[#1f2638] bg-gradient-to-r from-[#0d121c] via-[#090c14] to-[#111724] pl-3 pr-4 pt-3 pb-3 shrink-0">
              {/* Wipe Handle Bar */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                  <Activity className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>HUD ACTIVE</span>
                  <span className="text-[#6b7280]">•</span>
                  <span className="text-gray-300 font-medium">{currentTime || 'ONLINE'}</span>
                </div>

                {/* Gesture Wipe Pill Indicator */}
                <div
                  onClick={() => {
                    playWipeSound();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#141a27] hover:bg-[#1e273b] border border-[#2b3852] hover:border-amber-400/60 text-[#9ca3af] hover:text-amber-300 transition-all cursor-pointer group/wipe"
                  title="Click or wipe right to close"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
                    Wipe ➔
                  </span>
                  <MoveRight className="w-3 h-3 text-amber-400 group-hover/wipe:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Header Title & Close Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ThreeDLogo size="sm" interactive={false} />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['Cinzel'] text-xl font-black tracking-widest bg-gradient-to-r from-[#f8b179] via-amber-200 to-[#d47a37] bg-clip-text text-transparent">
                        LURL
                      </span>
                      <span className="text-[9px] font-mono text-[#f8b179] px-2 py-0.5 rounded-full bg-[#d47a37]/15 border border-[#d47a37]/40 tracking-wider">
                        ADVANCED HUD
                      </span>
                    </div>
                    <p className="text-[10px] text-[#9ca3af] tracking-wider uppercase flex items-center gap-1">
                      <span>Executive Operating System</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playWipeSound();
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-[#121624] hover:bg-[#1d2438] text-[#9ca3af] hover:text-white border border-[#252c3d] hover:border-amber-500/50 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Close Slidebar (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rapid Category Switcher Pill Bar (All 5 Pillars) */}
              <div className="mt-3 pt-2 border-t border-[#182030]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#6b7280] mb-1.5 px-0.5">
                  <span className="uppercase tracking-wider">Active Pillar Focus:</span>
                  <span className="text-amber-400 font-bold capitalize">
                    {selectedCategory === 'skill-development' ? '50 Skills Codex' : selectedCategory}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {categoryPills.map((pill) => {
                    const isSelected = selectedCategory === pill.id;
                    const Icon = pill.icon;
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onSelectCategory?.(pill.id);
                        }}
                        className={`py-1 px-1.5 rounded-lg text-center transition-all flex flex-col items-center gap-0.5 cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-b from-[#d47a37]/25 to-[#b85d19]/15 border-amber-400/70 text-amber-200 shadow-[0_0_12px_rgba(212,122,55,0.3)]'
                            : 'bg-[#0d1018] hover:bg-[#151a26] border-[#1d2536] text-[#9ca3af] hover:text-white'
                        }`}
                        title={`Switch to ${pill.label}`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-gray-400'}`} />
                        <span className="text-[9px] font-semibold truncate w-full">{pill.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SCROLLABLE MIDDLE CONTENT */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 custom-scrollbar">
              {/* Verified Website Live URL Box */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0c1018] to-[#07090f] border border-[#d47a37]/35 shadow-inner">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-300 font-semibold flex items-center gap-1.5 text-[11px]">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Official Website URL
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-bold">
                    100% FULL ONLINE
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#05070c] p-2 rounded-lg border border-[#1f2638]">
                  <span className="text-[11px] text-gray-300 font-mono truncate flex-1 select-all">
                    {liveUrl}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="p-1.5 rounded-md bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] transition-colors cursor-pointer shrink-0"
                    title="Copy Official Website URL"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* User Profile Mini Banner */}
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                  onOpenProfile();
                }}
                className="w-full p-3 rounded-xl bg-[#0f1422] hover:bg-[#151c2e] border border-[#232c40] hover:border-amber-400/50 transition-all flex items-center justify-between text-left cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#d47a37]"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f1422]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#f8b179] transition-colors flex items-center gap-2">
                      <span>{userProfile.name}</span>
                      {Boolean(userProfile.isVip || isPrivilegedAdminEmail(userSession?.email)) ? (
                        <span className="text-[10px] font-mono font-bold text-[#ffd700] flex items-center gap-1.5">
                          <Crown className="w-4 h-4 text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.75)] shrink-0" />
                          <span>VIP</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-sky-300">
                          · MEMBER
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {userSession?.email ? maskEmail(userSession.email) : 'Guest Analyst'} • Age {userProfile.age || 24}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#f8b179] transition-transform group-hover:translate-x-1" />
              </button>

              {/* Infinite Online Book Launcher Item */}
              <button
                type="button"
                id="slidebar-infinite-book-btn"
                onClick={() => {
                  playClickSound();
                  onNavigate('application', 'codex');
                  onClose();
                }}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-[#0d1629] to-[#09101e] hover:from-[#13213d] hover:to-[#0f1a30] border border-emerald-500/30 hover:border-emerald-400/60 transition-all flex items-center justify-between text-left cursor-pointer group shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <Globe className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center gap-2">
                      <span>Infinite Online Book (∞ Pages)</span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        · 100% Online
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Unlimited live web-synthesized pages for every category
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>

              {/* Navigation Items List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#6b7280] uppercase tracking-wider px-1">
                  <span>Platform Modules</span>
                  <span className="font-mono text-amber-500/80">6 ENGINES</span>
                </div>

                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.tab;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onNavigate(item.stage, item.tab);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer relative overflow-hidden group/item ${
                        isActive
                          ? `bg-gradient-to-r ${item.activeColor} border text-white shadow-md`
                          : 'bg-[#0b0e17] hover:bg-[#121724] text-gray-300 border border-[#1b2233] hover:border-[#2b3852]'
                      }`}
                    >
                      {/* Active Left Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                      )}

                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <Icon
                          className={`w-5 h-5 shrink-0 transition-transform group-hover/item:scale-110 ${
                            isActive ? 'text-amber-300' : 'text-[#f8b179]'
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white group-hover/item:text-amber-200 transition-colors truncate">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-gray-400 truncate">
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-[#9ca3af] whitespace-nowrap shrink-0">
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Proprietary Secret VIP Portal */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onClose();
                    onOpenVipPortal();
                  }}
                  className="w-full p-3.5 rounded-xl bg-gradient-to-r from-[#201509] via-[#1a1309] to-[#120e06] hover:from-[#2a1c0c] hover:to-[#1e150a] border border-amber-400/50 transition-all flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <Crown className="w-5 h-5 text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Proprietorship VIP Portal</span>
                        <span className="text-[10px] text-[#ffd700] font-mono">
                          · VIP
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-200/70">
                        Restricted executive clearance & directives
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </button>

                {onOpenVipChatBox && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onClose();
                      onOpenVipChatBox();
                    }}
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-[#170e1a] via-[#15121f] to-[#0d121c] hover:from-[#221528] hover:to-[#141b2b] border border-[#f8b179]/60 transition-all flex items-center justify-between text-left cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <MessageSquare className="w-5 h-5 text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>VIP Chat Box & Sentinel</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                            ISOLATED
                          </span>
                        </div>
                        <div className="text-[10px] text-[#9ca3af]">
                          Chat with Athena • Intrusion Alerts • Private Charts
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#f8b179] group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                )}

                {onOpenSecuritySentinel && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onClose();
                      onOpenSecuritySentinel();
                    }}
                    className="w-full p-3.5 rounded-xl bg-gradient-to-r from-[#0d171d] via-[#0d141e] to-[#0a1018] hover:from-[#112028] hover:to-[#0f1724] border border-emerald-500/40 transition-all flex items-center justify-between text-left cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform animate-pulse" />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Cyber Defense Sentinel</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                            100% ARMED
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400">
                          Deep WAF · Anti-Malware · Virus Immunity Scan
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>
                )}
              </div>

              {/* Learning History & Performance Vault Quick Launcher */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onNavigate('application', 'performance');
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-xl bg-[#0b0e17] hover:bg-[#121724] border border-[#1b2233] hover:border-emerald-500/40 transition-all flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        History & What You Learnt Vault
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Complete performance telemetry & permanently saved study log
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-[#34d399] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Online
                  </span>
                </button>
              </div>
            </div>

            {/* BOTTOM HUD COMMAND CENTER */}
            <div className="p-3.5 border-t border-[#1f2638] bg-gradient-to-t from-[#05070c] to-[#0c1018] space-y-2.5 shrink-0">
              {/* BGM Toggle & Settings */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onToggleBgm();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    isBgmOn
                      ? 'bg-gradient-to-r from-amber-500/25 to-[#b85d19]/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(212,122,55,0.25)]'
                      : 'bg-[#101420] text-gray-400 hover:text-white border-[#222b3d]'
                  }`}
                >
                  {isBgmOn ? (
                    <>
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <div className="flex items-center gap-1">
                        <span>BGM: ON</span>
                        <span className="flex items-end gap-0.5 h-3 ml-0.5">
                          <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse" />
                          <span className="w-0.5 h-3 bg-amber-400 animate-pulse" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-2 bg-amber-400 animate-pulse" style={{ animationDelay: '300ms' }} />
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>BGM: OFF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onClose();
                    onOpenSettings();
                  }}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#101420] hover:bg-[#182030] text-white border border-[#222b3d] hover:border-amber-400/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#f8b179]" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Status Diagnostics */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-gray-300">Gemini 3.8 Intelligence</span>
                </span>
                <span className="font-mono text-[#6b7280]">Wipe ➔ to dismiss</span>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
