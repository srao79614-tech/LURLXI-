import { UserExperienceTier, TierMilestone, UserProfile } from '../types';

export const TIER_MILESTONES: TierMilestone[] = [
  {
    tier: 'bronze',
    title: 'Bronze Tier Member',
    requiredMonths: 1,
    requiredDays: 30,
    badgeLabel: 'BRONZE',
    accentColor: '#cd7f32',
    badgeBg: 'rgba(205, 127, 50, 0.15)',
    badgeBorder: 'rgba(205, 127, 50, 0.45)',
    summary: 'Unlocked upon 1 month of verified platform activity.',
    benchmarkVolume: '$50,000 Volume Target',
    perks: [
      'Simulated BTC Backtesting Engine with 1m & 5m bars',
      'Standard Technical Indicators (EMA 20/50/200, RSI 14)',
      '$10,000 Demo Capital Allocation',
      'Paper Trading Order Execution (Long / Short)',
      'Community Thoughts Sharing & Profile Badge',
    ],
  },
  {
    tier: 'silver',
    title: 'Silver Tier Specialist',
    requiredMonths: 3,
    requiredDays: 90,
    badgeLabel: 'SILVER',
    accentColor: '#cbd5e1',
    badgeBg: 'rgba(203, 213, 225, 0.15)',
    badgeBorder: 'rgba(203, 213, 225, 0.45)',
    summary: 'Unlocked upon 3 months of consistent strategy backtesting.',
    benchmarkVolume: '$250,000 Volume Target',
    perks: [
      'Accelerated Bar Replay Speeds (2x, 5x, 10x step replay)',
      'Bollinger Bands, MACD Histogram & Volume Profile',
      'Multi-Timeframe Historical Candle Synching (15m, 1H, 4H)',
      'Custom Demo Account Capital Settings ($1,000 to $50,000)',
      'Automated Risk:Reward & Position Sizing Calculator',
    ],
  },
  {
    tier: 'gold',
    title: 'Gold Tier Executive',
    requiredMonths: 7,
    requiredDays: 210,
    badgeLabel: 'GOLD',
    accentColor: '#f59e0b',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeBorder: 'rgba(245, 158, 11, 0.45)',
    summary: 'Unlocked upon 7 months of seasoned platform experience.',
    benchmarkVolume: '$1,000,000 Volume Target',
    perks: [
      'Simulated Order Book & Liquidity Sweep Detection',
      'Auto Support & Resistance Zone Plotting',
      '$100,000 Institutional Demo Margin Account',
      'Quantitative Backtest Statistics & Drawdown Heatmaps',
      'Global Demo Trader Leaderboard Verified Ranking',
    ],
  },
  {
    tier: 'platinum',
    title: 'Platinum Tier Master',
    requiredMonths: 12,
    requiredDays: 365,
    badgeLabel: 'PLATINUM',
    accentColor: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    badgeBorder: 'rgba(56, 189, 248, 0.5)',
    summary: 'Unlocked upon 1 full year (365 days) of elite backtest mastery.',
    benchmarkVolume: '$5,000,000+ Master Volume',
    perks: [
      'Master Level Trader Badge & Diamond Glow Profile Ring',
      'Unlimited Historical Bar Replay Database for BTC',
      'Unrestricted Demo Capital ($500,000+ Custom Allocations)',
      'Institutional Wyckoff Spring & Absorption Alerts',
      'Hall of Fame Placement on Executive Leaderboard',
    ],
  },
];

export interface UserTenureCalculation {
  daysActive: number;
  monthsActive: number;
  currentTier: UserExperienceTier;
  milestone: TierMilestone | null;
  nextMilestone: TierMilestone | null;
  progressPercent: number;
  daysToNext: number;
  isSimulated: boolean;
}

export function calculateUserTenure(profile?: UserProfile | null): UserTenureCalculation {
  let daysActive = 1; // Default Day 1 baseline
  const isSimulated = false;

  if (profile?.joinDate) {
    const diffMs = Math.max(0, Date.now() - profile.joinDate);
    daysActive = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  const monthsActive = parseFloat((daysActive / 30).toFixed(1));

  let currentTier: UserExperienceTier = 'novice';
  let milestone: TierMilestone | null = null;
  let nextMilestone: TierMilestone | null = TIER_MILESTONES[0];
  let progressPercent = 0;
  let daysToNext = 30 - daysActive;

  if (daysActive >= 365) {
    currentTier = 'platinum';
    milestone = TIER_MILESTONES[3];
    nextMilestone = null;
    progressPercent = 100;
    daysToNext = 0;
  } else if (daysActive >= 210) {
    currentTier = 'gold';
    milestone = TIER_MILESTONES[2];
    nextMilestone = TIER_MILESTONES[3];
    const range = 365 - 210;
    const progress = daysActive - 210;
    progressPercent = Math.min(100, Math.round((progress / range) * 100));
    daysToNext = 365 - daysActive;
  } else if (daysActive >= 90) {
    currentTier = 'silver';
    milestone = TIER_MILESTONES[1];
    nextMilestone = TIER_MILESTONES[2];
    const range = 210 - 90;
    const progress = daysActive - 90;
    progressPercent = Math.min(100, Math.round((progress / range) * 100));
    daysToNext = 210 - daysActive;
  } else if (daysActive >= 30) {
    currentTier = 'bronze';
    milestone = TIER_MILESTONES[0];
    nextMilestone = TIER_MILESTONES[1];
    const range = 90 - 30;
    const progress = daysActive - 30;
    progressPercent = Math.min(100, Math.round((progress / range) * 100));
    daysToNext = 90 - daysActive;
  } else {
    currentTier = 'novice';
    milestone = null;
    nextMilestone = TIER_MILESTONES[0];
    progressPercent = Math.min(99, Math.round((daysActive / 30) * 100));
    daysToNext = Math.max(1, 30 - daysActive);
  }

  return {
    daysActive,
    monthsActive,
    currentTier,
    milestone,
    nextMilestone,
    progressPercent,
    daysToNext,
    isSimulated,
  };
}

export function getTierBadgeStyle(tier: UserExperienceTier): {
  label: string;
  color: string;
  bg: string;
  border: string;
  shadow: string;
} {
  switch (tier) {
    case 'platinum':
      return {
        label: 'PLATINUM',
        color: '#38bdf8',
        bg: 'bg-sky-500/20',
        border: 'border-sky-400/50',
        shadow: 'shadow-[0_0_12px_rgba(56,189,248,0.3)]',
      };
    case 'gold':
      return {
        label: 'GOLD',
        color: '#fbbf24',
        bg: 'bg-amber-500/20',
        border: 'border-amber-400/50',
        shadow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]',
      };
    case 'silver':
      return {
        label: 'SILVER',
        color: '#cbd5e1',
        bg: 'bg-slate-400/20',
        border: 'border-slate-300/50',
        shadow: 'shadow-[0_0_12px_rgba(203,213,225,0.25)]',
      };
    case 'bronze':
      return {
        label: 'BRONZE',
        color: '#f8b179',
        bg: 'bg-[#d47a37]/20',
        border: 'border-[#d47a37]/50',
        shadow: 'shadow-[0_0_10px_rgba(212,122,55,0.25)]',
      };
    default:
      return {
        label: 'NOVICE',
        color: '#9ca3af',
        bg: 'bg-gray-800/40',
        border: 'border-gray-700/60',
        shadow: 'none',
      };
  }
}
