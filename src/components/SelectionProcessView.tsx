import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CategoryType, UserPerformanceProfile, UserSession, UserProfile } from '../types';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { getUserPerformance } from '../utils/userStorage';
import { playClickSound } from '../utils/soundEffects';
import { calculateUserTenure, getTierBadgeStyle } from '../utils/tierSystem';
import { isPrivilegedAdminEmail } from '../utils/maskEmail';
import {
  TrendingUp,
  Bot,
  ShoppingBag,
  Rocket,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Award,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  Zap,
  ShieldCheck,
  ChevronRight,
  Crown,
  User,
  Mail,
  Calendar,
  Edit3,
  SlidersHorizontal,
  CandlestickChart,
  Medal,
  Compass,
} from 'lucide-react';

interface SelectionProcessViewProps {
  onSelectTrack: (category: CategoryType, defaultTab?: 'codex' | 'skills-book' | 'ai-chat' | 'share-thoughts' | 'performance' | 'demo-trading') => void;
  onOpenPerformanceDashboard: () => void;
  onOpenVipPortal?: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  onBack?: () => void;
  userSession: UserSession | null;
  userProfile?: UserProfile;
}

export const SelectionProcessView: React.FC<SelectionProcessViewProps> = ({
  onSelectTrack,
  onOpenPerformanceDashboard,
  onOpenVipPortal,
  onOpenProfile,
  onOpenSettings,
  onBack,
  userSession,
  userProfile,
}) => {
  const [profile, setProfile] = useState<UserPerformanceProfile>(() => getUserPerformance(userSession?.email));

  useEffect(() => {
    const updateProfile = () => {
      setProfile(getUserPerformance(userSession?.email));
    };
    updateProfile();
    window.addEventListener('lurl-performance-updated', updateProfile);
    window.addEventListener('lurl-vault-restored', updateProfile);
    window.addEventListener('lurl-account-changed', updateProfile);
    return () => {
      window.removeEventListener('lurl-performance-updated', updateProfile);
      window.removeEventListener('lurl-vault-restored', updateProfile);
      window.removeEventListener('lurl-account-changed', updateProfile);
    };
  }, [userSession?.email]);

  const iconMap: Record<CategoryType, React.ReactNode> = {
    trading: <TrendingUp className="w-8 h-8 text-[#f8b179]" />,
    dropshipping: <Bot className="w-8 h-8 text-[#f8b179]" />,
    ecommerce: <ShoppingBag className="w-8 h-8 text-[#f8b179]" />,
    startup: <Rocket className="w-8 h-8 text-[#f8b179]" />,
    'skill-development': <Compass className="w-8 h-8 text-[#f8b179]" />,
  };

  const handleTrackChosen = (
    cat: CategoryType,
    defaultTab: 'codex' | 'skills-book' | 'ai-chat' | 'share-thoughts' | 'performance' | 'demo-trading' = 'codex'
  ) => {
    playClickSound();
    onSelectTrack(cat, defaultTab);
  };

  const categories = Object.values(CATEGORIES_DATA);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-300">
      {/* Navigation Bar with Back Button */}
      {onBack && (
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            id="selection-back-btn"
            onClick={() => {
              playClickSound();
              onBack();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121622] hover:bg-[#1a2130] text-sm font-semibold text-[#cbd5e1] hover:text-white border border-[#252c3d] hover:border-[#d47a37]/50 shadow-md transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#f8b179]" />
            <span>← Exit to Welcome Gate</span>
          </button>
          <span className="text-xs text-[#6b7280] font-mono">Stage 2: Operational Selection</span>
        </div>
      )}

      {/* Focus Track Selection Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d47a37]/15 text-[#f8b179] text-xs font-semibold border border-[#d47a37]/30 mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Stage 2: Operational Selection
        </div>
        <h2 className="font-['Cinzel'] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-wide">
          Who Is Operating Today?
        </h2>
        <p className="text-sm sm:text-base text-[#9ca3af] mt-2 leading-relaxed">
          Select your dedicated course track to enter the focused application workspace, or review your cumulative performance analytics.
        </p>
      </div>

      {/* App Profile Status Bar */}
      {userProfile && (() => {
        const tenure = calculateUserTenure(userProfile);
        const tierBadge = getTierBadgeStyle(tenure.currentTier);

        return (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#101420] via-[#0d1017] to-[#15120e] border border-[#252c3d] hover:border-[#d47a37]/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative shrink-0">
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-[#d47a37] shadow-md"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#0d1017]" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="font-['Cinzel'] text-lg font-bold text-white tracking-wide">
                    {userProfile.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${tierBadge.bg} ${tierBadge.border}`}
                    style={{ color: tierBadge.color }}
                  >
                    <Medal className="w-2.5 h-2.5" />
                    <span>{tierBadge.label} TIER</span>
                    <span className="text-[#9ca3af] font-normal">({tenure.daysActive}d)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#d47a37]/20 text-[#f8b179] text-[10px] font-mono font-bold border border-[#d47a37]/40 flex items-center gap-1">
                    <User className="w-2.5 h-2.5" /> App Profile
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#9ca3af]">
                  <span className="flex items-center gap-1 font-mono text-[#cbd5e1]">
                    <Mail className="w-3 h-3 text-[#f8b179]" /> {userProfile.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#cbd5e1]">
                    <Calendar className="w-3 h-3 text-[#f8b179]" /> Age {userProfile.age}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-[#f8b179]">
                    Preferred Track: <strong className="capitalize text-white">{userProfile.selectedCategory}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="selection-settings-btn"
                onClick={() => {
                  playClickSound();
                  onOpenSettings?.();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#141824] hover:bg-[#1f2638] border border-[#252c3d] hover:border-[#d47a37] shadow flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#f8b179]" />
                <span>Settings</span>
              </button>

              <button
                type="button"
                id="selection-edit-profile-btn"
                onClick={() => {
                  playClickSound();
                  onOpenProfile?.();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#f8b179] bg-[#d47a37]/15 hover:bg-[#d47a37]/25 border border-[#d47a37]/40 shadow flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Profile & Private Account History</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* 5 Course Tracks Grid */}
      <div id="platform-categories-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8 scroll-mt-24">
        {categories.map((cat) => {
          const course = profile?.courses?.[cat.id];
          const completedCount = course?.completedChapterIds?.length || 0;
          const totalChapters = course?.totalChapters || cat.chapters?.length || 2;
          const compPercent = Math.round((completedCount / totalChapters) * 100);

          return (
            <motion.div
              key={cat.id}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl bg-[#0f121a]/95 border border-[#252c3d] hover:border-[#d47a37] p-5 shadow-xl hover:shadow-[0_12px_35px_rgba(212,122,55,0.2)] flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Track Icon & Page Counter */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-1 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {iconMap[cat.id as CategoryType]}
                  </div>

                  <span className="text-xs font-mono font-bold text-[#f8b179]">
                    {compPercent}% Learned
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-['Cinzel'] text-lg font-bold text-white tracking-wide group-hover:text-[#f8b179] transition-colors mb-2">
                  {cat.title.split('&')[0]}
                </h3>

                <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-2 mb-4">
                  {cat.shortDesc}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex justify-between text-[11px] text-[#6b7280]">
                    <span>Learning Progress</span>
                    <span className="text-white font-mono">{completedCount}/{totalChapters} Chapters</span>
                  </div>
                  <div className="w-full bg-[#1c2230] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#d47a37] to-[#f8b179] h-full rounded-full transition-all duration-500"
                      style={{ width: `${compPercent}%` }}
                    />
                  </div>
                </div>

                {/* Key Spec & Complete Category Book Contents */}
                <div className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] text-xs space-y-2 mb-5">
                  <div className="flex items-center justify-between border-b border-[#1f2638] pb-1.5">
                    <span className="text-[10px] text-[#6b7280] uppercase tracking-wider">{cat.stats?.[0]?.label || 'Curriculum Volume'}</span>
                    <span className="text-xs font-bold text-[#f8b179] font-mono">{cat.stats?.[0]?.value || `${cat.chapters?.length || 6} Codex Volumes`}</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-[#9ca3af]">
                    <div className="flex items-center justify-between">
                      <span>📖 Book Chapters:</span>
                      <span className="text-white font-mono font-bold">
                        {cat.chapters.length} Ch · 500p/Ch
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>♟️ Strategy & Stats:</span>
                      <span className="text-emerald-400 font-mono">
                        4 Phases • {cat.masterBlueprint?.tacticalPlaybook.tactics.length || 5} SOPs
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🌐 Category Book:</span>
                      <span className="text-emerald-300 font-mono font-bold">
                        {(cat.chapters.length * 500).toLocaleString()}+ Pages
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🎓 How to Learn:</span>
                      <span className="text-amber-300 font-mono">
                        {cat.masterBlueprint?.bookOverview.estimatedTotalHours.split(' ')[0] || '45'}h Roadmap
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-[#1f2638]">
                {/* Dedicated Simulated BTC Demo Trading button for Trading Category */}
                {cat.id === 'trading' && (
                  <button
                    type="button"
                    id="enter-demo-trading-btn"
                    onClick={() => handleTrackChosen('trading', 'demo-trading')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-amber-300 bg-gradient-to-r from-amber-950/60 to-[#1e1710] hover:from-amber-900/70 hover:to-[#2d2116] border border-amber-500/50 hover:border-amber-400 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                  >
                    <CandlestickChart className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Live Online BTC Trading Desk</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE
                    </span>
                  </button>
                )}

                {/* Dedicated Grand Codex button for Skill Development Category */}
                {cat.id === 'skill-development' && (
                  <button
                    type="button"
                    id="enter-skills-codex-btn"
                    onClick={() => handleTrackChosen('skill-development', 'skills-book')}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-amber-300 bg-gradient-to-r from-amber-950/60 to-[#1e1710] hover:from-amber-900/70 hover:to-[#2d2116] border border-amber-500/50 hover:border-amber-400 flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer group"
                  >
                    <Compass className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>50 Skills Master Codex</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      10 PILLARS
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  id={`enter-track-btn-${cat.id}`}
                  onClick={() => handleTrackChosen(cat.id as CategoryType, 'codex')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read {cat.chapters.length} Chapters ({(cat.chapters.length * 500).toLocaleString()}p)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTrackChosen(cat.id as CategoryType, 'ai-chat')}
                    className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-[#141824] hover:bg-[#1f2638] text-[#9ca3af] hover:text-white border border-[#252c3d] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Bot className="w-3 h-3 text-[#d47a37]" /> Voice AI
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTrackChosen(cat.id as CategoryType, 'share-thoughts')}
                    className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-[#141824] hover:bg-[#1f2638] text-[#9ca3af] hover:text-white border border-[#252c3d] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3 h-3 text-[#f8b179]" /> Thoughts
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Row: Personal Performance Dashboard + VIP Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Performance Graphic Highlight Card (2 cols) */}
        <div className="md:col-span-2 rounded-2xl bg-gradient-to-r from-[#121622] via-[#101420] to-[#18130e] border border-[#d47a37]/40 p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> User Performance Engine
              </span>
              <span className="text-xs text-[#34d399] font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Storage Active
              </span>
            </div>

            <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-extrabold text-white tracking-wide">
              Personal Performance & Learning Graphics
            </h3>

            <p className="text-xs sm:text-sm text-[#9ca3af] max-w-xl leading-relaxed">
              Inspect your cumulative course completion, weekly study velocity, cross-disciplinary mastery charts, and complete chronological learning history.
            </p>

            <div className="flex items-center gap-6 pt-1 text-xs">
              <div>
                <span className="text-[#6b7280] block">Overall Mastery:</span>
                <strong className="text-emerald-400 font-bold font-mono text-sm">
                  {profile?.performanceMetrics?.overallMastery ?? profile?.overallMastery ?? 0}/100
                </strong>
              </div>
              <div>
                <span className="text-[#6b7280] block">Total Study Time:</span>
                <strong className="text-white font-bold font-mono text-sm">
                  {Math.floor(((profile?.totalStudyMinutes ?? profile?.totalMinutes) || 0) / 60)}h {((profile?.totalStudyMinutes ?? profile?.totalMinutes) || 0) % 60}m
                </strong>
              </div>
              <div>
                <span className="text-[#6b7280] block">History Log:</span>
                <strong className="text-[#f8b179] font-bold font-mono text-sm">
                  {profile?.history?.length ?? 0} Events Stored
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            id="open-performance-dashboard-btn"
            onClick={() => {
              playClickSound();
              onOpenPerformanceDashboard();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-all"
          >
            <span>Open Performance Graphics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* VIP Executive Suite Card (1 col) */}
        <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#ffd700] flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.75)] shrink-0" />
                <span>VIP Executive Hub</span>
              </span>
              <span className="text-[10px] font-mono text-[#6b7280]">Restricted</span>
            </div>

            <h4 className="font-['Cinzel'] text-lg font-bold text-white tracking-wide">
              Proprietary Parameters
            </h4>

            <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed">
              Manage custom risk ceilings, autonomous dropshipping dispatch triggers, and venture capital dilution matrices.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-[#1f2638]">
            <button
              type="button"
              onClick={onOpenVipPortal}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#ffd700] bg-[#141824] hover:bg-[#1f2638] border border-[#d47a37]/40 flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
            >
              <Crown className="w-4 h-4 text-[#ffd700] shrink-0" />
              <span>Open VIP Executive Suite</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
