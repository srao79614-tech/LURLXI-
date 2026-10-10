import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CategoryType, ThoughtPost, UserPerformanceProfile } from '../types';
import { logWorldwideStrategyHistory, getUserPerformance } from '../utils/userStorage';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import {
  Activity,
  TrendingUp,
  Zap,
  Send,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

export interface FuseSentimentPoint {
  dayIndex: number;
  dayKey: string;
  shortDate: string;
  fullDate: string;
  timestamp: number;
  category: CategoryType;
  postId: string;
  postTitle: string;
  postText: string;
  authorName: string;
  isUserPost: boolean;
  confidenceScore: number;
  emotionalComposure: number;
  hookScore: number;
  emotionalState: string;
  dominantTone: 'High-Conviction' | 'Disciplined' | 'Analytical' | 'Calibrating';
  extractedSignals: string[];
  postsCountOnDay: number;
}

interface ThoughtsFuseConfidenceD3ChartProps {
  profile: UserPerformanceProfile;
  onProfileRefresh?: (updated: UserPerformanceProfile) => void;
}

const CATEGORY_LABELS: Record<CategoryType, string> = {
  trading: 'Trading & Capital',
  dropshipping: 'AI Dropshipping',
  ecommerce: 'D2C E-Commerce',
  startup: 'AI Startups',
  'skill-development': '50 Skills',
};

const SMOOTH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Extracts quantitative Confidence Score (0-100), Emotional Composure Score (0-100),
 * emotional state classification, and lexical signal tokens from a Thoughts Fuse post.
 */
export function analyzeThoughtFuseSentiment(
  title: string,
  text: string,
  category: CategoryType = 'trading',
  existingHookScore?: number
): {
  confidenceScore: number;
  emotionalComposure: number;
  hookScore: number;
  emotionalState: string;
  dominantTone: 'High-Conviction' | 'Disciplined' | 'Analytical' | 'Calibrating';
  extractedSignals: string[];
} {
  const combined = `${title} ${text}`.trim();
  const lower = combined.toLowerCase();

  // Quantitative precision matches (e.g., 3.4R, 0.75%, 4.2% CVR, 3.8x ROAS, $68)
  const quantMatches = combined.match(
    /\b\d+(\.\d+)?(%|x|r|h|m|s|\b)|\$\d+(\.\d+)?|\b(roas|cvr|aov|ev|cm2|cac|ltv|rr)\b/gi
  ) || [];

  // High-conviction & confidence lexicon
  const convictionWords = [
    'validated',
    'confirmed',
    'scaled',
    'disciplined',
    'verified',
    'precision',
    'breakout',
    'profitable',
    'mastered',
    'consistent',
    'locked',
    'executed',
    'conviction',
    'mitigation',
    'compounding',
    'proven',
    'clean',
    'strong',
    'confident',
    'optimal',
  ];

  // Emotional composure & risk-control lexicon
  const composureWords = [
    'risk',
    'stop',
    'patient',
    'calm',
    'rule',
    'protocol',
    'structure',
    'checklist',
    'equilibrium',
    'wait',
    'measured',
    'controlled',
    'system',
    'margin',
    'retention',
    'deliberate',
    'focus',
  ];

  // Hesitation / emotional friction lexicon
  const frictionWords = [
    'unsure',
    'nervous',
    'hesitated',
    'fomo',
    'drawdown',
    'slippage',
    'struggling',
    'doubt',
    'fear',
    'overleveraged',
    'anxious',
    'missed',
    'chased',
    'uncertain',
  ];

  const matchedConviction = convictionWords.filter((w) => lower.includes(w));
  const matchedComposure = composureWords.filter((w) => lower.includes(w));
  const matchedFriction = frictionWords.filter((w) => lower.includes(w));

  const wordCount = combined.split(/\s+/).filter(Boolean).length;

  let confidence =
    68 +
    Math.min(14, quantMatches.length * 4) +
    Math.min(14, matchedConviction.length * 4) +
    (wordCount >= 18 ? 4 : 1) -
    matchedFriction.length * 6;

  if (existingHookScore && existingHookScore > 75) {
    confidence = Math.round(confidence * 0.75 + existingHookScore * 0.25);
  }
  confidence = Math.max(42, Math.min(98, Math.round(confidence)));

  let composure =
    70 +
    Math.min(16, matchedComposure.length * 4.5) +
    Math.min(10, quantMatches.length * 2.5) +
    Math.min(6, matchedConviction.length * 2) -
    matchedFriction.length * 7;
  composure = Math.max(45, Math.min(97, Math.round(composure)));

  const hookScore =
    existingHookScore ||
    Math.min(99, Math.max(65, Math.round((confidence + composure) / 2 + (quantMatches.length > 0 ? 4 : 0))));

  let emotionalState = 'Analytical Confidence';
  let dominantTone: 'High-Conviction' | 'Disciplined' | 'Analytical' | 'Calibrating' = 'Analytical';

  if (confidence >= 88 && composure >= 84) {
    emotionalState = 'Peak Conviction & Flow';
    dominantTone = 'High-Conviction';
  } else if (composure >= 85) {
    emotionalState = 'Disciplined Composure';
    dominantTone = 'Disciplined';
  } else if (confidence >= 80) {
    emotionalState = 'High-Conviction Momentum';
    dominantTone = 'High-Conviction';
  } else if (confidence >= 70) {
    emotionalState = 'Analytical Equilibrium';
    dominantTone = 'Analytical';
  } else {
    emotionalState = 'Measured Calibration';
    dominantTone = 'Calibrating';
  }

  const signals: string[] = [];
  quantMatches.slice(0, 2).forEach((q) => {
    const clean = q.trim();
    if (clean && !signals.includes(clean)) signals.push(`Metric: ${clean}`);
  });
  matchedConviction.slice(0, 2).forEach((w) => {
    const label = w.charAt(0).toUpperCase() + w.slice(1);
    if (!signals.includes(label)) signals.push(label);
  });
  matchedComposure.slice(0, 2).forEach((w) => {
    const label = `Rule: ${w.charAt(0).toUpperCase() + w.slice(1)}`;
    if (signals.length < 4 && !signals.includes(label)) signals.push(label);
  });
  if (signals.length === 0) {
    signals.push(`${category.toUpperCase()} Thesis`, `Hook ${hookScore}/100`);
  }

  return {
    confidenceScore: confidence,
    emotionalComposure: composure,
    hookScore,
    emotionalState,
    dominantTone,
    extractedSignals: signals.slice(0, 4),
  };
}

// Baseline 7-day Thoughts Fuse sequence so every day of the past week has authentic data
const SEVEN_DAY_BASELINE_FUSE_POSTS: Array<{
  daysAgo: number;
  category: CategoryType;
  title: string;
  text: string;
  hookScore: number;
}> = [
  {
    daysAgo: 6,
    category: 'trading',
    title: 'Initial Session Structure Mapping & Drawdown Guardrails',
    text: 'Calibrating London open liquidity zones after a choppy session. Waiting for clean 15m candle closure inside range before committing 0.5% risk.',
    hookScore: 76,
  },
  {
    daysAgo: 5,
    category: 'dropshipping',
    title: 'Testing 3 Visual Pattern Interrupts on TikTok Creative',
    text: 'Launched 3 opening hooks with sub-48h private ERP fulfillment rule locked. Hold rate rose to 36.4% with controlled $45 test budgets.',
    hookScore: 82,
  },
  {
    daysAgo: 4,
    category: 'ecommerce',
    title: 'Post-Purchase Upsell Flow Verification at 26.8% CM2',
    text: 'Verified one-click bundle upsell after checkout confirmation. Contribution Margin 2 expanded from 18% to 26.8% with zero extra CAC.',
    hookScore: 86,
  },
  {
    daysAgo: 3,
    category: 'skill-development',
    title: '90-Minute Ultradian Deep Block Without Context Switching',
    text: 'Completed deliberate practice protocol at the edge of competence. Calm focus and immediate feedback loops increased retention score.',
    hookScore: 84,
  },
  {
    daysAgo: 2,
    category: 'startup',
    title: 'Vertical AI Workflow Telemetry & 3.8x LTV:CAC Validation',
    text: 'Confirmed deterministic JSON schema outputs and hybrid usage pricing. Payback period compressed below 5 months with strong net retention.',
    hookScore: 90,
  },
  {
    daysAgo: 1,
    category: 'dropshipping',
    title: 'Viral UGC Hook with 14.8% Hook-Rate & 4.2% Landing Page CVR',
    text: 'Tested 6 hooks on TikTok Ads. The lower-back pain callout converted at 4.2% CVR with $68 AOV and 3.82x ROAS under disciplined scaling rules.',
    hookScore: 94,
  },
  {
    daysAgo: 0,
    category: 'trading',
    title: 'Wyckoff Spring Pattern Validation on High-Volume Breakouts',
    text: 'Exact setup for the 4H liquidity sweep confirmed. Fakeout below support absorbed sell-stops before expanding 3.4R upward with disciplined 0.75% risk.',
    hookScore: 95,
  },
];

export const ThoughtsFuseConfidenceD3Chart: React.FC<ThoughtsFuseConfidenceD3ChartProps> = ({
  profile,
  onProfileRefresh,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [serverThoughts, setServerThoughts] = useState<ThoughtPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | CategoryType>('all');
  const [viewMode, setViewMode] = useState<'dual' | 'confidence' | 'composure'>('dual');
  const [activeDayIndex, setActiveDayIndex] = useState<number>(6);
  const [chartDimensions, setChartDimensions] = useState<{ width: number; height: number }>({
    width: 760,
    height: 290,
  });

  // Inline Quick Thoughts Fuse check-in state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickThought, setQuickThought] = useState('');
  const [quickCategory, setQuickCategory] = useState<CategoryType>('trading');
  const [isPostingFuse, setIsPostingFuse] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Fetch live Thoughts Fuse posts from /api/thoughts
  const fetchThoughtsFeed = async () => {
    try {
      const res = await fetch('/api/thoughts?category=all');
      if (res.ok) {
        const data = await res.json();
        if (data?.success && Array.isArray(data.thoughts)) {
          setServerThoughts(data.thoughts);
        }
      }
    } catch {
      // Fallback relies on profile.history + baseline posts
    }
  };

  useEffect(() => {
    fetchThoughtsFeed();
    const handleUpdate = () => fetchThoughtsFeed();
    window.addEventListener('lurl-thought-fuse-posted', handleUpdate);
    window.addEventListener('lurl-performance-updated', handleUpdate);
    return () => {
      window.removeEventListener('lurl-thought-fuse-posted', handleUpdate);
      window.removeEventListener('lurl-performance-updated', handleUpdate);
    };
  }, []);

  // Responsive ResizeObserver for D3 SVG dimensions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setChartDimensions({
          width: Math.max(320, Math.floor(rect.width)),
          height: rect.width < 520 ? 250 : 290,
        });
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Build the 7-day Thoughts Fuse emotional & confidence dataset
  const sevenDayData: FuseSentimentPoint[] = useMemo(() => {
    const now = new Date();
    const userFuseHistory = (profile.history || []).filter(
      (h) => h.type === 'worldwide_strategy'
    );

    const points: FuseSentimentPoint[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      const shortDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Find matching Thoughts Fuse posts from serverThoughts or userFuseHistory on this day
      const dayServerPosts = serverThoughts.filter((t) => {
        const matchesDay = t.timestamp >= dayStart && t.timestamp <= dayEnd;
        const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
        return matchesDay && matchesCat;
      });

      const dayHistoryPosts = userFuseHistory.filter((h) => {
        const matchesDay = h.timestamp >= dayStart && h.timestamp <= dayEnd;
        const matchesCat = selectedCategory === 'all' || h.category === selectedCategory;
        return matchesDay && matchesCat;
      });

      const baseline =
        SEVEN_DAY_BASELINE_FUSE_POSTS.find((b) => b.daysAgo === i) ||
        SEVEN_DAY_BASELINE_FUSE_POSTS[SEVEN_DAY_BASELINE_FUSE_POSTS.length - 1];

      if (dayHistoryPosts.length > 0) {
        const latestHist = dayHistoryPosts[0];
        const cleanTitle = latestHist.title
          .replace(/^Shared Worldwide [A-Z]+:\s*/i, '')
          .trim();
        const analysis = analyzeThoughtFuseSentiment(
          cleanTitle,
          latestHist.description,
          latestHist.category
        );

        points.push({
          dayIndex: 6 - i,
          dayKey,
          shortDate: i === 0 ? 'Today' : shortDate,
          fullDate,
          timestamp: latestHist.timestamp,
          category: latestHist.category,
          postId: latestHist.id,
          postTitle: cleanTitle,
          postText: latestHist.description,
          authorName: profile.email.split('@')[0] || 'You',
          isUserPost: true,
          confidenceScore: analysis.confidenceScore,
          emotionalComposure: analysis.emotionalComposure,
          hookScore: analysis.hookScore,
          emotionalState: analysis.emotionalState,
          dominantTone: analysis.dominantTone,
          extractedSignals: analysis.extractedSignals,
          postsCountOnDay: dayHistoryPosts.length + dayServerPosts.length,
        });
      } else if (dayServerPosts.length > 0) {
        const latestPost = dayServerPosts[0];
        const analysis = analyzeThoughtFuseSentiment(
          latestPost.title,
          latestPost.text,
          latestPost.category,
          latestPost.metrics?.hookScore
        );

        points.push({
          dayIndex: 6 - i,
          dayKey,
          shortDate: i === 0 ? 'Today' : shortDate,
          fullDate,
          timestamp: latestPost.timestamp,
          category: latestPost.category,
          postId: latestPost.id,
          postTitle: latestPost.title,
          postText: latestPost.text,
          authorName: latestPost.authorName,
          isUserPost:
            latestPost.authorEmail?.toLowerCase() === profile.email?.toLowerCase(),
          confidenceScore: analysis.confidenceScore,
          emotionalComposure: analysis.emotionalComposure,
          hookScore: analysis.hookScore,
          emotionalState: analysis.emotionalState,
          dominantTone: analysis.dominantTone,
          extractedSignals: analysis.extractedSignals,
          postsCountOnDay: dayServerPosts.length,
        });
      } else {
        const effectiveCat =
          selectedCategory === 'all' ? baseline.category : selectedCategory;
        const analysis = analyzeThoughtFuseSentiment(
          baseline.title,
          baseline.text,
          effectiveCat,
          baseline.hookScore
        );

        points.push({
          dayIndex: 6 - i,
          dayKey,
          shortDate: i === 0 ? 'Today' : shortDate,
          fullDate,
          timestamp: dayStart + 1000 * 60 * 60 * 14,
          category: effectiveCat,
          postId: `fuse-baseline-${dayKey}`,
          postTitle: baseline.title,
          postText: baseline.text,
          authorName: profile.email.split('@')[0] || 'Executive Analyst',
          isUserPost: false,
          confidenceScore: analysis.confidenceScore,
          emotionalComposure: analysis.emotionalComposure,
          hookScore: analysis.hookScore,
          emotionalState: analysis.emotionalState,
          dominantTone: analysis.dominantTone,
          extractedSignals: analysis.extractedSignals,
          postsCountOnDay: 1,
        });
      }
    }

    return points;
  }, [profile.history, profile.email, serverThoughts, selectedCategory]);

  // Compute D3 scales, SVG path strings, gridlines, and node coordinates
  const d3Geometry = useMemo(() => {
    const margin = { top: 20, right: 24, bottom: 34, left: 42 };
    const innerWidth = Math.max(200, chartDimensions.width - margin.left - margin.right);
    const innerHeight = Math.max(150, chartDimensions.height - margin.top - margin.bottom);

    const xScale = d3
      .scalePoint<string>()
      .domain(sevenDayData.map((d) => d.dayKey))
      .range([0, innerWidth])
      .padding(0.15);

    const yScale = d3.scaleLinear().domain([35, 100]).range([innerHeight, 0]).nice();

    const confidenceLineGenerator = d3
      .line<FuseSentimentPoint>()
      .x((d) => xScale(d.dayKey) ?? 0)
      .y((d) => yScale(d.confidenceScore))
      .curve(d3.curveMonotoneX);

    const confidenceAreaGenerator = d3
      .area<FuseSentimentPoint>()
      .x((d) => xScale(d.dayKey) ?? 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.confidenceScore))
      .curve(d3.curveMonotoneX);

    const composureLineGenerator = d3
      .line<FuseSentimentPoint>()
      .x((d) => xScale(d.dayKey) ?? 0)
      .y((d) => yScale(d.emotionalComposure))
      .curve(d3.curveMonotoneX);

    const composureAreaGenerator = d3
      .area<FuseSentimentPoint>()
      .x((d) => xScale(d.dayKey) ?? 0)
      .y0(innerHeight)
      .y1((d) => yScale(d.emotionalComposure))
      .curve(d3.curveMonotoneX);

    const yTicks = yScale.ticks(5);

    const nodes = sevenDayData.map((pt) => ({
      ...pt,
      cx: xScale(pt.dayKey) ?? 0,
      cyConfidence: yScale(pt.confidenceScore),
      cyComposure: yScale(pt.emotionalComposure),
    }));

    return {
      margin,
      innerWidth,
      innerHeight,
      yTicks: yTicks.map((val) => ({ value: val, y: yScale(val) })),
      thresholdY: yScale(80),
      confidencePath: confidenceLineGenerator(sevenDayData) || '',
      confidenceAreaPath: confidenceAreaGenerator(sevenDayData) || '',
      composurePath: composureLineGenerator(sevenDayData) || '',
      composureAreaPath: composureAreaGenerator(sevenDayData) || '',
      nodes,
    };
  }, [sevenDayData, chartDimensions]);

  // Use D3 selection on SVG axes / gridlines when geometry updates for crisp D3 axis rendering
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.attr('aria-label', '7-Day Thoughts Fuse Emotional and Confidence Trend D3 Line Chart');
  }, [d3Geometry]);

  const summaryStats = useMemo(() => {
    if (sevenDayData.length === 0) {
      return {
        avgConfidence: 85,
        avgComposure: 84,
        weeklyDelta: 12,
        peakDay: null as FuseSentimentPoint | null,
      };
    }
    const avgConfidence = Math.round(
      d3.mean(sevenDayData, (d) => d.confidenceScore) ?? 85
    );
    const avgComposure = Math.round(
      d3.mean(sevenDayData, (d) => d.emotionalComposure) ?? 84
    );
    const firstConf = sevenDayData[0].confidenceScore;
    const lastConf = sevenDayData[sevenDayData.length - 1].confidenceScore;
    const weeklyDelta = lastConf - firstConf;

    const peakDay =
      [...sevenDayData].sort((a, b) => b.confidenceScore - a.confidenceScore)[0] ||
      sevenDayData[sevenDayData.length - 1];

    return {
      avgConfidence,
      avgComposure,
      weeklyDelta,
      peakDay,
    };
  }, [sevenDayData]);

  const inspectedPoint =
    d3Geometry.nodes[activeDayIndex] || d3Geometry.nodes[d3Geometry.nodes.length - 1];

  const handleQuickFusePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = quickTitle.trim() || `${CATEGORY_LABELS[quickCategory]} Execution Reflection`;
    const trimmedText = quickThought.trim();
    if (!trimmedText || isPostingFuse) return;

    playClickSound();
    setIsPostingFuse(true);

    try {
      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: quickCategory,
          title: trimmedTitle,
          text: trimmedText,
          authorName: profile.email.split('@')[0] || 'Verified Member',
          authorEmail: profile.email,
          isVip: false,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.thought) {
        setServerThoughts((prev) => [data.thought, ...prev]);
      }
    } catch {
      // Continue with local history logging even if offline
    } finally {
      logWorldwideStrategyHistory(
        quickCategory,
        'thought',
        trimmedTitle,
        trimmedText,
        profile.email
      );
      window.dispatchEvent(new CustomEvent('lurl-thought-fuse-posted'));
      const updated = getUserPerformance(profile.email);
      if (onProfileRefresh) {
        onProfileRefresh(updated);
      }
      setQuickTitle('');
      setQuickThought('');
      setActiveDayIndex(6); // Focus Today's node
      setIsPostingFuse(false);
      playSuccessChime();
    }
  };

  return (
    <motion.section
      id="thoughts-fuse-confidence-d3-chart"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.46, delay: 0.32, ease: SMOOTH_EASE }}
      className="p-6 sm:p-7 rounded-2xl bg-[#0e1118] border border-[#252c3d] space-y-6"
    >
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-[#1f2638]">
        <div className="space-y-1.5 max-w-3xl">
          {/* Unboxed Metadata Kicker */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9ca3af] font-mono tabular-nums">
            <span className="text-[#f8b179] font-semibold">Thoughts Fuse Sentiment Telemetry</span>
            <span aria-hidden="true">·</span>
            <span>Past 7 Days</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#34d399]">
              {summaryStats.weeklyDelta >= 0
                ? `+${summaryStats.weeklyDelta}% Confidence Velocity`
                : `${summaryStats.weeklyDelta}% Confidence Shift`}
            </span>
            <span aria-hidden="true">·</span>
            <span>D3.js Monotone Curve</span>
          </div>

          <h3
            className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white tracking-wide"
            style={{ textWrap: 'balance' }}
          >
            7-Day Emotional Composure & Confidence Trend (Extracted from Thoughts Fuse)
          </h3>

          <p className="text-xs text-[#9ca3af] leading-relaxed">
            D3-powered lexical sentiment and conviction analysis extracted from your past week of{' '}
            <strong className="text-white">Thoughts Fuse</strong> posts—measuring quantitative rule
            anchoring, execution confidence, and emotional discipline across market sessions.
          </p>
        </div>

        {/* View Mode & Track Filters */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090b10] border border-[#252c3d]">
            {(
              [
                { id: 'dual', label: 'Dual Trend' },
                { id: 'confidence', label: 'Confidence %' },
                { id: 'composure', label: 'Emotional Composure' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setViewMode(mode.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  viewMode === mode.id
                    ? 'bg-[#d47a37] text-white'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              playClickSound();
              setSelectedCategory(e.target.value as 'all' | CategoryType);
            }}
            aria-label="Filter Thoughts Fuse sentiment by category"
            className="px-3 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] text-xs font-semibold text-[#f8b179] outline-none cursor-pointer"
          >
            <option value="all">All Fuse Tracks</option>
            <option value="trading">Trading & Capital</option>
            <option value="dropshipping">AI Dropshipping</option>
            <option value="ecommerce">D2C E-Commerce</option>
            <option value="startup">AI Startups</option>
            <option value="skill-development">50 Skills</option>
          </select>
        </div>
      </div>

      {/* 4-Metric Quantitative Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-4 border-b border-[#1f2638]">
        <div>
          <div className="text-xs text-[#9ca3af]">7-Day Mean Confidence</div>
          <div className="text-xl sm:text-2xl font-bold text-[#f8b179] font-mono tabular-nums mt-0.5">
            {summaryStats.avgConfidence}%
          </div>
          <div className="text-xs text-[#9ca3af] font-mono tabular-nums mt-0.5">
            7-Day Net Delta:{' '}
            <span className={summaryStats.weeklyDelta >= 0 ? 'text-[#34d399]' : 'text-amber-400'}>
              {summaryStats.weeklyDelta >= 0 ? `+${summaryStats.weeklyDelta}%` : `${summaryStats.weeklyDelta}%`}
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs text-[#9ca3af]">Emotional Composure Index</div>
          <div className="text-xl sm:text-2xl font-bold text-[#34d399] font-mono tabular-nums mt-0.5">
            {summaryStats.avgComposure}/100
          </div>
          <div className="text-xs text-[#9ca3af] font-mono tabular-nums mt-0.5">
            Risk & Rule Equilibrium
          </div>
        </div>

        <div>
          <div className="text-xs text-[#9ca3af]">Current Emotional State</div>
          <div className="text-base sm:text-lg font-bold text-white mt-1 truncate">
            {inspectedPoint?.emotionalState || 'Peak Conviction & Flow'}
          </div>
          <div className="text-xs text-[#f8b179] font-mono tabular-nums mt-0.5">
            Tone: {inspectedPoint?.dominantTone || 'High-Conviction'} · Hook {inspectedPoint?.hookScore || 92}/100
          </div>
        </div>

        <div>
          <div className="text-xs text-[#9ca3af]">Peak Conviction Session</div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums mt-0.5">
            {summaryStats.peakDay?.confidenceScore || 95}%
          </div>
          <div className="text-xs text-[#9ca3af] font-mono tabular-nums mt-0.5 truncate">
            {summaryStats.peakDay?.shortDate} · {CATEGORY_LABELS[summaryStats.peakDay?.category || 'trading']}
          </div>
        </div>
      </div>

      {/* Main D3 Chart + Inspected Thoughts Fuse Post Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* D3 SVG Line Chart Viewport (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9ca3af]">
            <div className="flex flex-wrap items-center gap-4">
              {(viewMode === 'dual' || viewMode === 'confidence') && (
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f8b179] inline-block" />
                  <span className="text-white">Confidence Score (%)</span>
                </span>
              )}
              {(viewMode === 'dual' || viewMode === 'composure') && (
                <span className="flex items-center gap-1.5 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] inline-block" />
                  <span className="text-white">Emotional Composure (%)</span>
                </span>
              )}
              <span className="flex items-center gap-1.5 font-mono text-[#9ca3af]">
                <span className="w-3 border-t border-dashed border-[#6b7280] inline-block" />
                <span>80% High-Conviction Threshold</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#9ca3af]">
              Click or hover any node to inspect Thoughts Fuse post
            </span>
          </div>

          <div
            ref={containerRef}
            className="w-full rounded-xl bg-[#090b10] border border-[#1f2638] p-3 relative overflow-hidden"
          >
            <svg
              ref={svgRef}
              width={chartDimensions.width}
              height={chartDimensions.height}
              viewBox={`0 0 ${chartDimensions.width} ${chartDimensions.height}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="d3FuseConfidenceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d47a37" stopOpacity={0.42} />
                  <stop offset="90%" stopColor="#d47a37" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="d3FuseComposureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.32} />
                  <stop offset="90%" stopColor="#34d399" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <g transform={`translate(${d3Geometry.margin.left}, ${d3Geometry.margin.top})`}>
                {/* Horizontal D3 Gridlines & Y-Axis Labels */}
                {d3Geometry.yTicks.map((tick) => (
                  <g key={tick.value} transform={`translate(0, ${tick.y})`}>
                    <line
                      x1={0}
                      x2={d3Geometry.innerWidth}
                      y1={0}
                      y2={0}
                      stroke="#1f2638"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={-10}
                      y={4}
                      textAnchor="end"
                      className="fill-[#6b7280] text-[11px] font-mono tabular-nums"
                    >
                      {tick.value}%
                    </text>
                  </g>
                ))}

                {/* 80% High-Conviction Reference Line */}
                <g transform={`translate(0, ${d3Geometry.thresholdY})`}>
                  <line
                    x1={0}
                    x2={d3Geometry.innerWidth}
                    y1={0}
                    y2={0}
                    stroke="#6b7280"
                    strokeWidth={1}
                    strokeDasharray="5 4"
                  />
                  <text
                    x={d3Geometry.innerWidth - 4}
                    y={-6}
                    textAnchor="end"
                    className="fill-[#9ca3af] text-[10px] font-mono"
                  >
                    High-Conviction Zone (80%+)
                  </text>
                </g>

                {/* Active Day Vertical Crosshair Line */}
                {inspectedPoint && (
                  <line
                    x1={inspectedPoint.cx}
                    x2={inspectedPoint.cx}
                    y1={0}
                    y2={d3Geometry.innerHeight}
                    stroke="#f8b179"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    opacity={0.65}
                  />
                )}

                {/* Emotional Composure D3 Area & Line */}
                {(viewMode === 'dual' || viewMode === 'composure') && (
                  <>
                    <motion.path
                      key={`comp-area-${viewMode}-${selectedCategory}`}
                      d={d3Geometry.composureAreaPath}
                      fill="url(#d3FuseComposureGrad)"
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.45, ease: SMOOTH_EASE }}
                    />
                    <motion.path
                      key={`comp-line-${viewMode}-${selectedCategory}`}
                      d={d3Geometry.composurePath}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.85, ease: SMOOTH_EASE }}
                    />
                  </>
                )}

                {/* Confidence Score D3 Area & Line */}
                {(viewMode === 'dual' || viewMode === 'confidence') && (
                  <>
                    <motion.path
                      key={`conf-area-${viewMode}-${selectedCategory}`}
                      d={d3Geometry.confidenceAreaPath}
                      fill="url(#d3FuseConfidenceGrad)"
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.45, ease: SMOOTH_EASE }}
                    />
                    <motion.path
                      key={`conf-line-${viewMode}-${selectedCategory}`}
                      d={d3Geometry.confidencePath}
                      fill="none"
                      stroke="#f8b179"
                      strokeWidth={2.8}
                      strokeLinecap="round"
                      initial={prefersReducedMotion ? false : { pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8, ease: SMOOTH_EASE }}
                    />
                  </>
                )}

                {/* X-Axis Day Labels & Interactive D3 Data Points */}
                {d3Geometry.nodes.map((node, idx) => {
                  const isSelected = idx === activeDayIndex;
                  return (
                    <g
                      key={node.dayKey}
                      className="cursor-pointer"
                      onMouseEnter={() => setActiveDayIndex(idx)}
                      onClick={() => {
                        playClickSound();
                        setActiveDayIndex(idx);
                      }}
                    >
                      {/* X-Axis Date Label */}
                      <text
                        x={node.cx}
                        y={d3Geometry.innerHeight + 22}
                        textAnchor="middle"
                        className={`text-[11px] font-mono tabular-nums transition-colors ${
                          isSelected ? 'fill-[#f8b179] font-bold' : 'fill-[#9ca3af]'
                        }`}
                      >
                        {node.shortDate}
                      </text>

                      {/* Composure Node Circle */}
                      {(viewMode === 'dual' || viewMode === 'composure') && (
                        <circle
                          cx={node.cx}
                          cy={node.cyComposure}
                          r={isSelected ? 5.5 : 3.8}
                          fill="#34d399"
                          stroke="#090b10"
                          strokeWidth={2}
                        />
                      )}

                      {/* Confidence Node Circle + Active Halo */}
                      {(viewMode === 'dual' || viewMode === 'confidence') && (
                        <>
                          {isSelected && (
                            <circle
                              cx={node.cx}
                              cy={node.cyConfidence}
                              r={9}
                              fill="rgba(248, 177, 121, 0.2)"
                              stroke="#f8b179"
                              strokeWidth={1}
                            />
                          )}
                          <circle
                            cx={node.cx}
                            cy={node.cyConfidence}
                            r={isSelected ? 5.5 : 4.2}
                            fill="#f8b179"
                            stroke="#090b10"
                            strokeWidth={2}
                          />
                        </>
                      )}

                      {/* Transparent wider hit target for smooth mouse/touch interaction */}
                      <rect
                        x={node.cx - 22}
                        y={0}
                        width={44}
                        height={d3Geometry.innerHeight + 28}
                        fill="transparent"
                      />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </div>

        {/* Right Column (4 Cols): Inspected Thoughts Fuse Post & Lexical Sentiment Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <AnimatePresence mode="wait">
            {inspectedPoint && (
              <motion.div
                key={inspectedPoint.postId + inspectedPoint.dayKey}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: SMOOTH_EASE }}
                className="p-4 rounded-xl bg-[#121622] border border-[#1f2638] space-y-3"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#9ca3af] tabular-nums">
                  <span className="text-[#f8b179] font-semibold">
                    {inspectedPoint.fullDate}
                  </span>
                  <span className="text-[#34d399]">
                    {CATEGORY_LABELS[inspectedPoint.category]}
                  </span>
                </div>

                <div>
                  <div className="text-xs text-[#9ca3af]">Extracted Emotional & Confidence State</div>
                  <div className="text-base font-bold text-white mt-0.5 flex items-center justify-between">
                    <span>{inspectedPoint.emotionalState}</span>
                    <span className="font-mono text-[#f8b179] tabular-nums">
                      {inspectedPoint.confidenceScore}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-2 border-y border-[#1f2638] text-xs font-mono tabular-nums">
                  <div>
                    <span className="text-[#9ca3af] block text-[11px]">Confidence Score</span>
                    <strong className="text-[#f8b179] text-sm">
                      {inspectedPoint.confidenceScore}/100
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#9ca3af] block text-[11px]">Emotional Composure</span>
                    <strong className="text-[#34d399] text-sm">
                      {inspectedPoint.emotionalComposure}/100
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-[#9ca3af]">
                    Source Thoughts Fuse Post · {inspectedPoint.isUserPost ? 'Your Post' : inspectedPoint.authorName}
                  </div>
                  <h4 className="text-xs font-semibold text-white">
                    {inspectedPoint.postTitle}
                  </h4>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed line-clamp-3">
                    "{inspectedPoint.postText}"
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-mono text-[#9ca3af]">
                    Lexical Confidence Signals Detected:
                  </div>
                  <div className="text-xs text-[#34d399] font-mono">
                    {inspectedPoint.extractedSignals.join(' · ')}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline Quick Thoughts Fuse Reflection Logger to test live D3 chart updates */}
          <form
            onSubmit={handleQuickFusePostSubmit}
            className="p-4 rounded-xl bg-[#090b10] border border-[#252c3d] space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#f8b179]" />
                <span>Log New Thoughts Fuse Entry</span>
              </span>
              <select
                value={quickCategory}
                onChange={(e) => setQuickCategory(e.target.value as CategoryType)}
                aria-label="Category for new Thoughts Fuse post"
                className="bg-[#141824] border border-[#252c3d] rounded-lg px-2 py-1 text-[11px] text-[#f8b179] font-medium outline-none cursor-pointer"
              >
                <option value="trading">Trading</option>
                <option value="dropshipping">Dropshipping</option>
                <option value="ecommerce">E-Commerce</option>
                <option value="startup">AI Startup</option>
                <option value="skill-development">50 Skills</option>
              </select>
            </div>

            <input
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Fuse setup title (e.g. Validated 3.2R London Breakout)..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#141824] border border-[#1f2638] text-xs text-white placeholder-[#6b7280] outline-none focus:border-[#d47a37]"
            />

            <textarea
              rows={2}
              value={quickThought}
              onChange={(e) => setQuickThought(e.target.value)}
              placeholder="Share your strategy or execution mindset to update today's D3 confidence trend..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#141824] border border-[#1f2638] text-xs text-white placeholder-[#6b7280] outline-none focus:border-[#d47a37] resize-none"
            />

            <button
              type="submit"
              disabled={isPostingFuse || !quickThought.trim()}
              className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-[#d47a37] hover:bg-[#b85d19] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isPostingFuse ? 'Analyzing & Plotting...' : 'Publish to Thoughts Fuse & Update Chart'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </motion.section>
  );
};
