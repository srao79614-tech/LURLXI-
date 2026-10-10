import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CategoryType, UserPerformanceProfile } from '../types';
import { getUserPerformance, toggleChapterCompletion } from '../utils/userStorage';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import {
  Award,
  CandlestickChart,
  Globe,
  ShoppingBag,
  Cpu,
  Compass,
  Crown,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';

export interface CodexMilestoneBadge {
  id: string;
  category: CategoryType | 'all';
  orderLabel: string;
  badgeTitle: string;
  categoryTitle: string;
  citation: string;
  quantitativeStandard: string;
  accentHex: string;
  secondaryHex: string;
  isUnlocked: boolean;
  completedModules: number;
  totalModules: number;
  progressPercent: number;
  minutesLogged: number;
  unlockedAtTimestamp?: number;
  chapters: Array<{
    id: string;
    number: string;
    title: string;
    isCompleted: boolean;
  }>;
}

interface CodexMilestoneBadgeGalleryProps {
  activeCategory?: CategoryType;
  userEmail?: string;
  resetKey?: number;
  onSelectCategory?: (category: CategoryType) => void;
  onOpenChapter?: (category: CategoryType, chapterId: string, chapterIndex: number) => void;
  onMilestoneUnlocked?: (badgeTitle: string, category: CategoryType) => void;
  compact?: boolean;
}

const SMOOTH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BADGE_METADATA: Array<{
  category: CategoryType;
  orderLabel: string;
  badgeTitle: string;
  citation: string;
  quantitativeStandard: string;
  accentHex: string;
  secondaryHex: string;
}> = [
  {
    category: 'trading',
    orderLabel: 'Order 01 · Capital & Order Flow',
    badgeTitle: 'Institutional Liquidity Sovereign',
    citation:
      'Awarded for completing every module in the Algorithmic Trading & Capital Allocation Codex, verifying mastery of session liquidity sweeps and fractional Kelly risk.',
    quantitativeStandard: 'EV > +0.35R · Risk ≤ 1.0% Equity',
    accentHex: '#f8b179',
    secondaryHex: '#d47a37',
  },
  {
    category: 'dropshipping',
    orderLabel: 'Order 02 · Viral Velocity & ERP',
    badgeTitle: 'Global Supply-Chain Architect',
    citation:
      'Awarded for completing every module in the AI Dropshipping & Global Logistics Codex, verifying 3-second viral hook engineering and sub-48h private agent dispatch.',
    quantitativeStandard: '3s Hold ≥ 35% · Break-Even ROAS ≤ 1.45x',
    accentHex: '#38bdf8',
    secondaryHex: '#0284c7',
  },
  {
    category: 'ecommerce',
    orderLabel: 'Order 03 · Brand Equity & LTV',
    badgeTitle: 'Retention & CM2 Laureate',
    citation:
      'Awarded for completing every module in the Next-Gen D2C E-Commerce Codex, verifying Contribution Margin 2 expansion and automated post-purchase LTV flows.',
    quantitativeStandard: 'CM2 ≥ 26% · 60-Day Repeat ≥ 32%',
    accentHex: '#34d399',
    secondaryHex: '#059669',
  },
  {
    category: 'startup',
    orderLabel: 'Order 04 · Autonomous Venture',
    badgeTitle: 'Autonomous Venture Founder',
    citation:
      'Awarded for completing every module in the High-Growth AI Startups Codex, verifying defensible proprietary data moats and sub-6-month CAC payback.',
    quantitativeStandard: 'LTV : CAC ≥ 3.5x · Payback ≤ 6 Mo',
    accentHex: '#a78bfa',
    secondaryHex: '#7c3aed',
  },
  {
    category: 'skill-development',
    orderLabel: 'Order 05 · Cognitive Myelination',
    badgeTitle: 'Ultradian Polymath Strategist',
    citation:
      'Awarded for completing every module in the Executive Skill Development Codex, verifying 90-minute deliberate struggle blocks and rapid competence synthesis.',
    quantitativeStandard: '90m Ultradian Block · 3.2x Velocity',
    accentHex: '#fbbf24',
    secondaryHex: '#d97706',
  },
];

/**
 * Renders a custom multi-layered SVG milestone emblem with progress ring and domain icon.
 */
const MilestoneBadgeCrestSvg: React.FC<{
  badge: CodexMilestoneBadge;
  size?: 'sm' | 'lg';
}> = ({ badge, size = 'sm' }) => {
  const dimension = size === 'lg' ? 88 : 68;
  const radius = size === 'lg' ? 36 : 27;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, badge.progressPercent)) / 100) * circumference;

  const renderCategoryIcon = () => {
    const iconClass =
      size === 'lg'
        ? `w-7 h-7 ${badge.isUnlocked ? 'text-white' : 'text-[#6b7280]'}`
        : `w-5 h-5 ${badge.isUnlocked ? 'text-white' : 'text-[#6b7280]'}`;

    switch (badge.category) {
      case 'trading':
        return <CandlestickChart className={iconClass} />;
      case 'dropshipping':
        return <Globe className={iconClass} />;
      case 'ecommerce':
        return <ShoppingBag className={iconClass} />;
      case 'startup':
        return <Cpu className={iconClass} />;
      case 'skill-development':
        return <Compass className={iconClass} />;
      case 'all':
      default:
        return <Crown className={iconClass} />;
    }
  };

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0 select-none"
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`crest-grad-${badge.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={badge.accentHex} stopOpacity={badge.isUnlocked ? 1 : 0.35} />
            <stop
              offset="100%"
              stopColor={badge.secondaryHex}
              stopOpacity={badge.isUnlocked ? 0.9 : 0.2}
            />
          </linearGradient>
          <radialGradient id={`crest-core-${badge.id}`} cx="50%" cy="40%" r="60%">
            <stop
              offset="0%"
              stopColor={badge.isUnlocked ? badge.accentHex : '#1f2638'}
              stopOpacity={badge.isUnlocked ? 0.32 : 0.15}
            />
            <stop offset="100%" stopColor="#090b10" stopOpacity={0.95} />
          </radialGradient>
        </defs>

        {/* Outer Octagonal / Heraldic Ring Track */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill={`url(#crest-core-${badge.id})`}
          stroke="#1f2638"
          strokeWidth={size === 'lg' ? 3 : 2.5}
        />

        {/* Animated Mastery Progress Arc */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={`url(#crest-grad-${badge.id})`}
          strokeWidth={size === 'lg' ? 3.2 : 2.8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
          className="transition-all duration-500"
        />

        {/* Inner Precision Ring */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius - (size === 'lg' ? 7 : 5)}
          fill="none"
          stroke={badge.isUnlocked ? badge.accentHex : '#252c3d'}
          strokeOpacity={badge.isUnlocked ? 0.45 : 0.5}
          strokeWidth={1}
          strokeDasharray={badge.isUnlocked ? undefined : '2 2'}
        />
      </svg>

      {/* Center Domain Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {renderCategoryIcon()}
      </div>

      {/* Status Corner Indicator */}
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border ${
          badge.isUnlocked
            ? 'bg-emerald-500 border-[#090b10] text-slate-950'
            : 'bg-[#141824] border-[#252c3d] text-[#6b7280]'
        }`}
      >
        {badge.isUnlocked ? (
          <Check className="w-3 h-3 stroke-[3]" />
        ) : (
          <Lock className="w-2.5 h-2.5" />
        )}
      </div>
    </div>
  );
};

export const CodexMilestoneBadgeGallery: React.FC<CodexMilestoneBadgeGalleryProps> = ({
  activeCategory,
  userEmail,
  resetKey,
  onSelectCategory,
  onOpenChapter,
  onMilestoneUnlocked,
  compact = false,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [profile, setProfile] = useState<UserPerformanceProfile>(() =>
    getUserPerformance(userEmail)
  );
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'in-progress'>('all');
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>(
    activeCategory ? `badge-${activeCategory}` : 'badge-trading'
  );
  const [justUnlockedBadgeTitle, setJustUnlockedBadgeTitle] = useState<string | null>(null);

  // Sync profile when activeCategory, userEmail, resetKey, or storage events fire
  useEffect(() => {
    setProfile(getUserPerformance(userEmail));
  }, [userEmail, resetKey, activeCategory]);

  useEffect(() => {
    if (activeCategory) {
      setSelectedBadgeId(`badge-${activeCategory}`);
    }
  }, [activeCategory]);

  useEffect(() => {
    const refreshFromStorage = () => {
      setProfile(getUserPerformance(userEmail));
    };

    window.addEventListener('lurl-module-completed', refreshFromStorage);
    window.addEventListener('lurl-performance-updated', refreshFromStorage);
    window.addEventListener('storage', refreshFromStorage);
    return () => {
      window.removeEventListener('lurl-module-completed', refreshFromStorage);
      window.removeEventListener('lurl-performance-updated', refreshFromStorage);
      window.removeEventListener('storage', refreshFromStorage);
    };
  }, [userEmail]);

  // Build milestone badges for all 5 business categories + Grand Codex Sovereign badge
  const milestoneBadges: CodexMilestoneBadge[] = useMemo(() => {
    const categoryBadges: CodexMilestoneBadge[] = BADGE_METADATA.map((meta) => {
      const catData = CATEGORIES_DATA[meta.category];
      const courseProgress = profile.courses?.[meta.category];

      // Include any synthesized extra chapters stored locally for this category
      let extraChapters: Array<{ id: string; number: string; title: string }> = [];
      try {
        const savedExtra = localStorage.getItem(`lurl_codex_extra_${meta.category}`);
        if (savedExtra) {
          const parsed = JSON.parse(savedExtra);
          if (Array.isArray(parsed)) {
            extraChapters = parsed;
          }
        }
      } catch {}

      const allCatChapters = [...(catData?.chapters || []), ...extraChapters];
      const completedSet = new Set(courseProgress?.completedChapterIds || []);
      const completedCount = allCatChapters.filter((ch) => completedSet.has(ch.id)).length;
      const totalCount = Math.max(1, allCatChapters.length);
      const progressPercent = Math.min(100, Math.round((completedCount / totalCount) * 100));
      const isUnlocked = completedCount >= totalCount && totalCount > 0;

      return {
        id: `badge-${meta.category}`,
        category: meta.category,
        orderLabel: meta.orderLabel,
        badgeTitle: meta.badgeTitle,
        categoryTitle: catData?.title || courseProgress?.title || meta.category,
        citation: meta.citation,
        quantitativeStandard: meta.quantitativeStandard,
        accentHex: meta.accentHex,
        secondaryHex: meta.secondaryHex,
        isUnlocked,
        completedModules: completedCount,
        totalModules: totalCount,
        progressPercent,
        minutesLogged: courseProgress?.minutesSpent || 0,
        unlockedAtTimestamp: isUnlocked ? courseProgress?.lastStudiedAt : undefined,
        chapters: allCatChapters.map((ch) => ({
          id: ch.id,
          number: ch.number,
          title: ch.title,
          isCompleted: completedSet.has(ch.id),
        })),
      };
    });

    const unlockedCatCount = categoryBadges.filter((b) => b.isUnlocked).length;
    const totalModulesAll = categoryBadges.reduce((acc, b) => acc + b.totalModules, 0);
    const completedModulesAll = categoryBadges.reduce((acc, b) => acc + b.completedModules, 0);
    const allMinutes = categoryBadges.reduce((acc, b) => acc + b.minutesLogged, 0);
    const apexProgress = Math.min(
      100,
      Math.round((completedModulesAll / Math.max(1, totalModulesAll)) * 100)
    );
    const isApexUnlocked = unlockedCatCount === categoryBadges.length;

    const apexBadge: CodexMilestoneBadge = {
      id: 'badge-all',
      category: 'all',
      orderLabel: 'Apex Order · Complete Codex Mastery',
      badgeTitle: 'Grand Sovereign of the LURL Codex',
      categoryTitle: 'All 5 Business Categories Completed',
      citation:
        'Supreme institutional distinction awarded upon unlocking all five Business Category Milestone Badges across Trading, Dropshipping, D2C E-Commerce, AI Startups, and 50 Skills.',
      quantitativeStandard: `${unlockedCatCount}/5 Categories Mastered · ${completedModulesAll}/${totalModulesAll} Modules`,
      accentHex: '#34d399',
      secondaryHex: '#f8b179',
      isUnlocked: isApexUnlocked,
      completedModules: completedModulesAll,
      totalModules: totalModulesAll,
      progressPercent: apexProgress,
      minutesLogged: allMinutes,
      unlockedAtTimestamp: isApexUnlocked ? Date.now() : undefined,
      chapters: categoryBadges.map((b, idx) => ({
        id: b.id,
        number: `0${idx + 1}`,
        title: `${b.categoryTitle} (${b.completedModules}/${b.totalModules} Modules)`,
        isCompleted: b.isUnlocked,
      })),
    };

    return [...categoryBadges, apexBadge];
  }, [profile]);

  const unlockedCount = useMemo(
    () => milestoneBadges.filter((b) => b.isUnlocked).length,
    [milestoneBadges]
  );

  const unlockedCategoryCount = useMemo(
    () => milestoneBadges.filter((b) => b.category !== 'all' && b.isUnlocked).length,
    [milestoneBadges]
  );

  const filteredBadges = useMemo(() => {
    if (filterMode === 'unlocked') {
      return milestoneBadges.filter((b) => b.isUnlocked);
    }
    if (filterMode === 'in-progress') {
      return milestoneBadges.filter((b) => !b.isUnlocked);
    }
    return milestoneBadges;
  }, [milestoneBadges, filterMode]);

  const inspectedBadge = useMemo(
    () =>
      milestoneBadges.find((b) => b.id === selectedBadgeId) ||
      milestoneBadges[0],
    [milestoneBadges, selectedBadgeId]
  );

  // Toggle a module directly from the Milestone Inspector to unlock or test milestone badges
  const handleToggleModuleFromBadge = (
    category: CategoryType,
    chapterId: string,
    chapterTitle: string
  ) => {
    playClickSound();
    const prevBadge = milestoneBadges.find((b) => b.category === category);
    const wasUnlocked = prevBadge?.isUnlocked ?? false;

    toggleChapterCompletion(category, chapterId, chapterTitle, userEmail);
    const updatedProfile = getUserPerformance(userEmail);
    setProfile({ ...updatedProfile });
    window.dispatchEvent(new CustomEvent('lurl-performance-updated'));

    const updatedCourse = updatedProfile.courses[category];
    const nowUnlocked =
      (updatedCourse?.completedChapterIds.length || 0) >= (updatedCourse?.totalChapters || 2);

    if (!wasUnlocked && nowUnlocked && prevBadge) {
      playSuccessChime();
      setJustUnlockedBadgeTitle(prevBadge.badgeTitle);
      if (onMilestoneUnlocked) {
        onMilestoneUnlocked(prevBadge.badgeTitle, category);
      }
      window.setTimeout(() => setJustUnlockedBadgeTitle(null), 4500);
    }
  };

  return (
    <motion.div
      id="codex-milestone-badge-gallery"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: SMOOTH_EASE }}
      className="mb-6 p-5 sm:p-6 rounded-2xl bg-[#0e1118] border border-[#252c3d] space-y-5"
    >
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1f2638]">
        <div className="space-y-1">
          {/* Clean unboxed metadata kicker */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9ca3af] tabular-nums">
            <span className="text-[#f8b179] font-semibold">Codex Milestone Achievement Gallery</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#34d399]">
              {unlockedCategoryCount}/5 Business Categories Completed
            </span>
            <span aria-hidden="true">·</span>
            <span>{unlockedCount}/6 Total Insignias Unlocked</span>
          </div>

          <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white tracking-wide">
            Unlocked Category Milestone Achievements & Credentials
          </h3>
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090b10] border border-[#252c3d] self-start lg:self-auto">
          {(
            [
              { id: 'all', label: `All Badges (${milestoneBadges.length})` },
              { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
              {
                id: 'in-progress',
                label: `In Progress (${milestoneBadges.length - unlockedCount})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                playClickSound();
                setFilterMode(tab.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                filterMode === tab.id
                  ? 'bg-[#d47a37] text-white'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Toast Banner When a Category Milestone Badge Is Newly Unlocked */}
      <AnimatePresence>
        {justUnlockedBadgeTitle && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: SMOOTH_EASE }}
            className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-between gap-3 text-xs text-emerald-200"
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-emerald-300 shrink-0" />
              <span>
                Milestone Achievement Unlocked:{' '}
                <strong className="text-white">{justUnlockedBadgeTitle}</strong> — 100% of Codex
                Category Modules Verified!
              </span>
            </div>
            <span className="font-mono text-[#f8b179] shrink-0">UNLOCKED ✓</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Badge Gallery Grid (6 Milestone Emblems) */}
      {filteredBadges.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#090b10] border border-[#1f2638] text-center space-y-2">
          <p className="text-xs text-[#9ca3af]">
            {filterMode === 'unlocked'
              ? 'No business category badges are fully unlocked yet. Complete all modules in any Codex category below to unlock its milestone insignia.'
              : 'All 6 Codex Milestone Achievement Badges have been unlocked!'}
          </p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="px-3.5 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-xs font-semibold text-[#f8b179] border border-[#d47a37]/40 cursor-pointer"
          >
            Show All Badges
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge, idx) => {
            const isSelected = inspectedBadge?.id === badge.id;
            const isCurrentCodexCategory =
              activeCategory && badge.category === activeCategory;

            return (
              <motion.button
                key={badge.id}
                type="button"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34, delay: idx * 0.05, ease: SMOOTH_EASE }}
                whileHover={
                  prefersReducedMotion
                    ? undefined
                    : { y: -2, transition: { duration: 0.15, ease: SMOOTH_EASE } }
                }
                onClick={() => {
                  playClickSound();
                  setSelectedBadgeId(badge.id);
                }}
                className={`p-4 rounded-xl text-left transition-all cursor-pointer flex items-start gap-3.5 border ${
                  isSelected
                    ? 'bg-[#141927] border-[#f8b179]'
                    : badge.isUnlocked
                    ? 'bg-[#111622] border-emerald-500/40 hover:border-emerald-400/70'
                    : 'bg-[#0b0e16] border-[#1f2638] hover:border-[#2e3850]'
                }`}
              >
                <MilestoneBadgeCrestSvg badge={badge} size="sm" />

                <div className="min-w-0 flex-1 space-y-1">
                  {/* Unboxed Metadata Line */}
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                    <span
                      className={
                        badge.isUnlocked ? 'text-[#34d399] font-semibold' : 'text-[#9ca3af]'
                      }
                    >
                      {badge.isUnlocked ? 'UNLOCKED' : `${badge.progressPercent}% COMPLETE`}
                    </span>
                    <span className="text-[#6b7280]">
                      {badge.completedModules}/{badge.totalModules} Modules
                    </span>
                  </div>

                  {/* Milestone Title */}
                  <h4 className="text-sm font-bold text-white truncate">
                    {badge.badgeTitle}
                  </h4>

                  {/* Category Name */}
                  <p className="text-xs text-[#9ca3af] truncate">
                    {badge.categoryTitle}
                    {isCurrentCodexCategory ? ' · Active Track' : ''}
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#1c2230] h-1.5 rounded-full overflow-hidden pt-0 mt-1.5">
                    <motion.div
                      initial={
                        prefersReducedMotion
                          ? { scaleX: badge.progressPercent / 100 }
                          : { scaleX: 0 }
                      }
                      animate={{ scaleX: badge.progressPercent / 100 }}
                      transition={{ duration: 0.55, delay: 0.1 + idx * 0.05, ease: SMOOTH_EASE }}
                      style={{
                        background: badge.isUnlocked
                          ? `linear-gradient(90deg, ${badge.accentHex}, #34d399)`
                          : badge.accentHex,
                      }}
                      className="h-full w-full origin-left rounded-full"
                    />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Selected Milestone Detail & Interactive Module Completion Drawer */}
      {inspectedBadge && !compact && (
        <div className="pt-4 border-t border-[#1f2638] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left 7 Cols: Crest + Citation + Quantitative Standard */}
          <div className="lg:col-span-7 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <MilestoneBadgeCrestSvg badge={inspectedBadge} size="lg" />

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9ca3af] tabular-nums">
                <span className="text-[#f8b179] font-semibold">{inspectedBadge.orderLabel}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    inspectedBadge.isUnlocked ? 'text-[#34d399] font-semibold' : 'text-[#9ca3af]'
                  }
                >
                  {inspectedBadge.isUnlocked
                    ? 'Milestone Credential Verified ✓'
                    : `${inspectedBadge.totalModules - inspectedBadge.completedModules} Module(s) Remaining to Unlock`}
                </span>
                {inspectedBadge.minutesLogged > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{inspectedBadge.minutesLogged}m Logged</span>
                  </>
                )}
              </div>

              <h4 className="font-['Cinzel'] text-base sm:text-lg font-bold text-white">
                {inspectedBadge.badgeTitle} — {inspectedBadge.categoryTitle}
              </h4>

              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                {inspectedBadge.citation}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono">
                <span className="text-[#34d399]">
                  Standard: {inspectedBadge.quantitativeStandard}
                </span>

                {inspectedBadge.category !== 'all' &&
                  onSelectCategory &&
                  inspectedBadge.category !== activeCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onSelectCategory(inspectedBadge.category as CategoryType);
                      }}
                      className="text-[#f8b179] hover:underline font-sans font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open {inspectedBadge.categoryTitle.split('&')[0]} Codex</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Milestone Requirements / Chapter Book Navigator */}
          <div className="lg:col-span-5 space-y-2 lg:border-l lg:border-[#1f2638] lg:pl-6">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9ca3af]">
              <span>
                {inspectedBadge.category === 'all'
                  ? 'CATEGORY MILESTONE VOLUMES'
                  : `CHAPTER BOOK VOLUMES (${inspectedBadge.totalModules} CH · ${inspectedBadge.totalModules * 500} PAGES)`}
              </span>
              <span className="text-white tabular-nums">
                {inspectedBadge.completedModules}/{inspectedBadge.totalModules} Read
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {inspectedBadge.chapters.map((ch, chIdx) => {
                const canInteract = inspectedBadge.category !== 'all';
                return (
                  <div
                    key={ch.id}
                    className={`w-full p-2 rounded-lg border text-left flex items-center justify-between gap-2 text-xs transition-colors ${
                      ch.isCompleted
                        ? 'bg-emerald-950/25 border-emerald-500/40 text-white'
                        : 'bg-[#090b10] border-[#1f2638] hover:border-[#d47a37]/40 text-[#d1d5db]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        if (canInteract && onOpenChapter) {
                          onOpenChapter(inspectedBadge.category as CategoryType, ch.id, chIdx);
                        } else if (canInteract && onSelectCategory) {
                          onSelectCategory(inspectedBadge.category as CategoryType);
                        }
                      }}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left cursor-pointer hover:text-[#f8b179]"
                    >
                      <span className="px-1.5 py-0.5 rounded bg-[#141824] text-[#f8b179] font-mono text-[10px] font-bold shrink-0">
                        Ch.{ch.number}
                      </span>
                      <span className="truncate font-medium">
                        {ch.title}
                      </span>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {canInteract && (
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            if (onOpenChapter) {
                              onOpenChapter(inspectedBadge.category as CategoryType, ch.id, chIdx);
                            } else if (onSelectCategory) {
                              onSelectCategory(inspectedBadge.category as CategoryType);
                            }
                          }}
                          className="px-2 py-0.5 rounded bg-[#d47a37]/20 hover:bg-[#d47a37] text-[#f8b179] hover:text-white border border-[#d47a37]/40 text-[10px] font-mono font-bold cursor-pointer transition-colors"
                        >
                          Read 500p →
                        </button>
                      )}
                      {canInteract && (
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleModuleFromBadge(
                              inspectedBadge.category as CategoryType,
                              ch.id,
                              ch.title
                            )
                          }
                          title={ch.isCompleted ? 'Mark Unread' : 'Mark Chapter Read'}
                          className={`p-1 rounded border cursor-pointer ${
                            ch.isCompleted
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-[#141824] border-[#252c3d] text-gray-500 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
