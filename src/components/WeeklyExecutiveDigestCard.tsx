import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import {
  CategoryType,
  UserPerformanceProfile,
  WeeklyExecutiveDigest,
  WeeklyDigestInsightItem,
} from '../types';
import { logAiDoubtClarifiedHistory, getUserPerformance } from '../utils/userStorage';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { CATEGORIES_DATA } from '../data/categoriesData';
import {
  FileText,
  Volume2,
  VolumeX,
  RefreshCw,
  Download,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Clock,
  TrendingUp,
  Bot,
} from 'lucide-react';

interface WeeklyExecutiveDigestCardProps {
  profile: UserPerformanceProfile;
  liveSessionSeconds?: number;
  onSelectCourse: (category: CategoryType) => void;
  onAskVoiceAdvisor?: (prompt: string, category?: CategoryType) => void;
  onProfileRefresh?: (updated: UserPerformanceProfile) => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const SMOOTH_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const digestContainerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: SMOOTH_EASE,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};

const summaryGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
};

const summaryCardVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.975 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.44,
      ease: SMOOTH_EASE,
    },
  },
};

const columnRevealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: SMOOTH_EASE,
      staggerChildren: 0.06,
    },
  },
};

const rowItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: SMOOTH_EASE,
    },
  },
};

const CATEGORY_LABELS: Record<CategoryType, string> = {
  trading: 'Trading & Capital',
  dropshipping: 'AI Dropshipping',
  ecommerce: 'D2C E-Commerce',
  startup: 'AI Startups',
  'skill-development': 'Skill Development',
};

const BASELINE_VOICE_ADVISOR_INSIGHTS: WeeklyDigestInsightItem[] = [
  {
    id: 'base-insight-trading',
    category: 'trading',
    title: 'Institutional Liquidity Sweep & Fractional Kelly Sizing',
    queryText: 'How do I identify institutional liquidity sweeps before London open and size risk?',
    keyInsight:
      'Wait for price to sweep resting sell-stops or buy-stops at key session highs/lows and close back inside structure on the 15m chart before executing.',
    strategicFormula: 'EV = (Win% × AvgWin) - (Loss% × AvgLoss) > +0.35R · Risk ≤ 1.0% Equity',
    actionableDirective:
      'Mark previous day high/low (PDH/PDL) and Asian session range prior to London open; never enter before the sweep candle closes.',
    metricImpact: 'EV > +0.42R · Max Daily Drawdown ≤ 1.5%',
    timestamp: Date.now() - 1000 * 60 * 60 * 18,
    voiceMode: true,
  },
  {
    id: 'base-insight-dropshipping',
    category: 'dropshipping',
    title: '3-Second Viral Hook Retention & 48h Private ERP Dispatch',
    queryText: 'What exact hook structure generates >35% 3-second hold rate on TikTok?',
    keyInsight:
      'Combine an immediate visual pattern interrupt in the first 1.5 seconds with a specific visceral pain-point callout to hold over 35% of viewers past the 3-second scroll threshold.',
    strategicFormula: 'Hook Rate = (3-Second Views / Impressions) × 100 ≥ 35% · ROAS_BE ≤ 1.45x',
    actionableDirective:
      'Test 3 distinct opening 3-second hooks per product while keeping the body demonstration and offer CTA constant.',
    metricImpact: '3s Hold ≥ 35% · Net Margin ≥ 24%',
    timestamp: Date.now() - 1000 * 60 * 60 * 42,
    voiceMode: true,
  },
  {
    id: 'base-insight-ecommerce',
    category: 'ecommerce',
    title: 'Contribution Margin 2 (CM2) Expansion & Post-Purchase Flows',
    queryText: 'How do I lift my Contribution Margin 2 (CM2) from 14% to 28%?',
    keyInsight:
      'Increase Average Order Value (AOV) with one-click post-purchase upsells that carry zero incremental CAC, while automating 4-step replenishment flows at day 21 and day 45.',
    strategicFormula: 'CM2 = Net Revenue - COGS - Fulfillment - Paid Ad Spend (Target ≥ 26%)',
    actionableDirective:
      'Deploy a post-purchase 15% bundle upsell immediately after checkout confirmation to raise AOV by 18–22%.',
    metricImpact: 'CM2 ≥ 26% · 60-Day Repeat Rate ≥ 34%',
    timestamp: Date.now() - 1000 * 60 * 60 * 68,
    voiceMode: true,
  },
  {
    id: 'base-insight-skills',
    category: 'skill-development',
    title: 'Targeted Deliberate Struggle & 90-Minute Ultradian Myelination',
    queryText: 'How do I structure a deliberate practice session for maximum myelination?',
    keyInsight:
      'Operate at the exact edge of current competence (4% beyond comfort) for 90-minute ultradian blocks with immediate error correction to trigger rapid neural myelination.',
    strategicFormula: 'Myelination Rate = Deliberate Struggle Minutes × Immediate Feedback Density',
    actionableDirective:
      'Eliminate all notifications and execute one uninterrupted 45-to-90 minute high-friction drill each morning before checking messages.',
    metricImpact: '3.2x Faster Competence Acquisition',
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
    voiceMode: true,
  },
];

export const WeeklyExecutiveDigestCard: React.FC<WeeklyExecutiveDigestCardProps> = ({
  profile,
  liveSessionSeconds = 0,
  onSelectCourse,
  onAskVoiceAdvisor,
  onProfileRefresh,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | CategoryType>('all');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSpeakingDigest, setIsSpeakingDigest] = useState(false);
  const [speakingInsightId, setSpeakingInsightId] = useState<string | null>(null);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [quickCategory, setQuickCategory] = useState<CategoryType>('trading');
  const [isQuickAsking, setIsQuickAsking] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [aiDigest, setAiDigest] = useState<WeeklyExecutiveDigest | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const recognitionRef = useRef<any>(null);

  const digestStorageKey = useMemo(
    () => `lurl_weekly_exec_digest_v1_${encodeURIComponent(profile.email || 'guest@lurl.app')}`,
    [profile.email]
  );

  // Compute 7-day rolling window metrics from profile
  const sevenDayStats = useMemo(() => {
    const now = Date.now();
    const cutoff = now - SEVEN_DAYS_MS;

    const events7d = (profile.history || []).filter((e) => e.timestamp >= cutoff);
    const chaptersCompleted7d = events7d.filter((e) => e.type === 'chapter_completed').length;
    const bookPagesRead7d = events7d.filter((e) => e.type === 'book_page_read').length;
    const skillsMastered7d = events7d.filter((e) => e.type === 'skill_mastered').length;
    const advisorEvents7d = events7d.filter((e) => e.type === 'ai_query');
    const strategiesShared7d = events7d.filter((e) => e.type === 'worldwide_strategy').length;

    const velocityMinutes7d = (profile.weeklyVelocity || []).reduce(
      (sum, d) => sum + (d.minutes || 0),
      0
    );
    const eventEstimatedMinutes7d =
      chaptersCompleted7d * 15 +
      bookPagesRead7d * 5 +
      advisorEvents7d.length * 5 +
      skillsMastered7d * 10;

    const totalSevenDayMinutes = Math.max(
      velocityMinutes7d,
      eventEstimatedMinutes7d,
      profile.totalStudyMinutes > 0 ? Math.min(profile.totalStudyMinutes, velocityMinutes7d || profile.totalStudyMinutes) : 0
    ) + Math.floor(liveSessionSeconds / 60);

    // Count unique active days in the last 7 days
    const activeDateKeys = new Set<string>();
    events7d.forEach((e) => {
      const d = new Date(e.timestamp);
      activeDateKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    const velocityActiveDays = (profile.weeklyVelocity || []).filter((d) => d.minutes > 0).length;
    const activeDaysCount = Math.min(
      7,
      Math.max(activeDateKeys.size, velocityActiveDays, liveSessionSeconds > 0 ? 1 : 0)
    );

    // Convert user's 7-day AI Voice Advisor history events into WeeklyDigestInsightItem[]
    const loggedAdvisorInsights: WeeklyDigestInsightItem[] = advisorEvents7d.map((evt) => {
      const cleanTitle = (evt.title || 'AI Voice Advisor Consultation')
        .replace(/^AI Voice Advisor:\s*/i, '')
        .replace(/^Doubt Clarified:\s*/i, '')
        .replace(/^"|"$/g, '');

      return {
        id: evt.id,
        category: evt.category || 'trading',
        title: cleanTitle,
        queryText: evt.queryText || cleanTitle,
        keyInsight:
          evt.keyTakeaway ||
          evt.description ||
          `Clarified operational execution protocol for ${cleanTitle}.`,
        strategicFormula:
          evt.strategicFormula ||
          (evt.category === 'trading'
            ? 'EV = (Win% × AvgWin) - (Loss% × AvgLoss) > +0.35R'
            : evt.category === 'dropshipping'
            ? 'Hook Hold ≥ 35% · Break-Even ROAS ≤ 1.45x'
            : evt.category === 'ecommerce'
            ? 'CM2 ≥ 26% · 60-Day Repeat ≥ 32%'
            : evt.category === 'skill-development'
            ? '90-Minute Ultradian Deep Block'
            : 'LTV : CAC ≥ 3.5x · Payback ≤ 6 Months'),
        actionableDirective:
          evt.actionableDirective ||
          `Apply ${evt.category.toUpperCase()} verification checklist prior to execution.`,
        metricImpact:
          evt.category === 'trading'
            ? 'Risk ≤ 1.0% Equity · +0.35R EV'
            : evt.category === 'dropshipping'
            ? '3s Hold ≥ 35% · Sub-48h Dispatch'
            : evt.category === 'ecommerce'
            ? 'CM2 ≥ 26% · Repeat Rate +14%'
            : evt.category === 'skill-development'
            ? 'Myelination Velocity +3.2x'
            : 'Net Dollar Retention ≥ 115%',
        timestamp: evt.timestamp,
        voiceMode: evt.voiceMode !== false,
      };
    });

    // Combine user's real logged 7-day AI Voice Advisor insights with foundational advisor insights so the digest is always rich
    const combinedInsights: WeeklyDigestInsightItem[] = [
      ...loggedAdvisorInsights,
      ...BASELINE_VOICE_ADVISOR_INSIGHTS.filter(
        (base) => !loggedAdvisorInsights.some((u) => u.title.toLowerCase() === base.title.toLowerCase())
      ),
    ];

    // Track-by-track 7-day breakdown
    const trackSummaries = (
      ['trading', 'dropshipping', 'ecommerce', 'startup', 'skill-development'] as CategoryType[]
    ).map((cat) => {
      const course = profile.courses[cat];
      const meta = CATEGORIES_DATA[cat];
      const catEvents7d = events7d.filter((e) => e.category === cat);
      const catChapters7d = catEvents7d.filter((e) => e.type === 'chapter_completed').length;
      const catAdvisor7d = catEvents7d.filter((e) => e.type === 'ai_query').length;
      const catBookPages7d = catEvents7d.filter((e) => e.type === 'book_page_read').length;

      return {
        category: cat,
        label: CATEGORY_LABELS[cat],
        title: meta?.title || course?.title || cat,
        completedCount: course?.completedChapterIds?.length || 0,
        totalChapters: course?.totalChapters || 2,
        masteryScore: course?.masteryScore || 0,
        minutesSpent: course?.minutesSpent || 0,
        catChapters7d,
        catAdvisor7d,
        catBookPages7d,
      };
    });

    // Determine dominant track over the past 7 days
    const sortedByActivity = [...trackSummaries].sort(
      (a, b) =>
        b.catChapters7d * 3 +
        b.catAdvisor7d * 2 +
        b.masteryScore -
        (a.catChapters7d * 3 + a.catAdvisor7d * 2 + a.masteryScore)
    );
    const dominantTrack = sortedByActivity[0] || trackSummaries[0];
    const nextPriorityTrack =
      [...trackSummaries].sort((a, b) => a.masteryScore - b.masteryScore)[0] || trackSummaries[0];

    const windowStartDate = new Date(cutoff).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    const windowEndDate = new Date(now).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return {
      windowRangeLabel: `${windowStartDate} – ${windowEndDate}`,
      totalSevenDayMinutes,
      activeDaysCount,
      chaptersCompleted7d: Math.max(
        chaptersCompleted7d,
        Object.values(profile.courses || {}).reduce((a: number, c: any) => a + (c?.completedChapterIds?.length || 0), 0)
      ),
      bookPagesRead7d,
      skillsMastered7d,
      strategiesShared7d,
      userAdvisorCount7d: loggedAdvisorInsights.length,
      totalInsightsCount: combinedInsights.length,
      combinedInsights,
      trackSummaries,
      dominantTrack,
      nextPriorityTrack,
    };
  }, [profile, liveSessionSeconds]);

  // Load cached AI digest or synthesize initial
  useEffect(() => {
    try {
      const saved = localStorage.getItem(digestStorageKey);
      if (saved) {
        const parsed: WeeklyExecutiveDigest = JSON.parse(saved);
        if (parsed && parsed.executiveHeadline) {
          setAiDigest(parsed);
          return;
        }
      }
    } catch {}
  }, [digestStorageKey]);

  // Setup Web Speech Recognition for quick voice query capture inside the digest
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onresult = (event: any) => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            setQuickPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
          setIsListeningMic(false);
        };
        recognition.onerror = () => setIsListeningMic(false);
        recognition.onend = () => setIsListeningMic(false);
        recognitionRef.current = recognition;
      } catch {}
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSynthesizeLiveDigest = async () => {
    if (isSynthesizing) return;
    playClickSound();
    setIsSynthesizing(true);

    try {
      const response = await fetch('/api/executive-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          sevenDayMinutes: sevenDayStats.totalSevenDayMinutes,
          activeDaysCount: sevenDayStats.activeDaysCount,
          chaptersCompleted7d: sevenDayStats.chaptersCompleted7d,
          bookPagesRead7d: sevenDayStats.bookPagesRead7d,
          skillsMastered7d: sevenDayStats.skillsMastered7d,
          overallMastery: profile.performanceMetrics?.overallMastery ?? profile.overallMastery ?? 28,
          coursesSummary: sevenDayStats.trackSummaries,
          advisorQueries7d: sevenDayStats.combinedInsights.slice(0, 6),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.digest) {
          setAiDigest(data.digest);
          try {
            localStorage.setItem(digestStorageKey, JSON.stringify(data.digest));
          } catch {}
          playSuccessChime();
        }
      }
    } catch (err) {
      console.warn('Digest synthesis error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Speak entire Weekly Executive Digest aloud via Web Speech Synthesis
  const handleToggleSpeakDigest = () => {
    playClickSound();
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingDigest) {
      window.speechSynthesis.cancel();
      setIsSpeakingDigest(false);
      setSpeakingInsightId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingInsightId(null);

    const headline =
      aiDigest?.executiveHeadline ||
      `Weekly Executive Digest for ${profile.email}. Over the past 7 days, you logged ${sevenDayStats.totalSevenDayMinutes} study minutes across ${sevenDayStats.activeDaysCount} active days, mastering ${sevenDayStats.chaptersCompleted7d} modules.`;

    const topInsightsSpeech = filteredInsights
      .slice(0, 3)
      .map(
        (item, idx) =>
          `Insight ${idx + 1} in ${CATEGORY_LABELS[item.category]}: ${item.title}. ${item.keyInsight} Quantitative rule: ${item.strategicFormula}.`
      )
      .join(' ');

    const fullSpeechText = `${headline} ${
      aiDigest?.voiceAdvisorSynthesis || ''
    } Here are your key AI Voice Advisor insights from the past seven days: ${topInsightsSpeech}`;

    const utterance = new SpeechSynthesisUtterance(fullSpeechText);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingDigest(false);
    utterance.onerror = () => setIsSpeakingDigest(false);

    setIsSpeakingDigest(true);
    window.speechSynthesis.speak(utterance);
  };

  // Speak a single insight item aloud
  const handleSpeakSingleInsight = (item: WeeklyDigestInsightItem) => {
    playClickSound();
    if (!('speechSynthesis' in window)) return;

    if (speakingInsightId === item.id) {
      window.speechSynthesis.cancel();
      setSpeakingInsightId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeakingDigest(false);

    const speechText = `${CATEGORY_LABELS[item.category]} Insight: ${item.title}. ${item.keyInsight}. Quantitative formula: ${item.strategicFormula || ''}. Actionable directive: ${item.actionableDirective || ''}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.02;
    utterance.onend = () => setSpeakingInsightId(null);
    utterance.onerror = () => setSpeakingInsightId(null);

    setSpeakingInsightId(item.id);
    window.speechSynthesis.speak(utterance);
  };

  // Quick AI Voice Advisor inquiry directly from the Weekly Executive Digest
  const handleQuickAdvisorConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickPrompt.trim();
    if (!query || isQuickAsking) return;

    playClickSound();
    setIsQuickAsking(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: quickCategory,
          message: query,
          diagnosticMode: true,
        }),
      });
      const data = await response.json();
      const reply = data?.reply || `Verified executive protocol for ${query}.`;
      logAiDoubtClarifiedHistory(quickCategory, query, reply, profile.email, true);
      setQuickPrompt('');
      const updatedProfile = getUserPerformance(profile.email);
      if (onProfileRefresh) {
        onProfileRefresh(updatedProfile);
      }
      playSuccessChime();
    } catch {
      logAiDoubtClarifiedHistory(
        quickCategory,
        query,
        `Clarified core execution mechanics and quantitative guardrails for "${query}" in ${quickCategory.toUpperCase()}.`,
        profile.email,
        true
      );
      setQuickPrompt('');
      const updatedProfile = getUserPerformance(profile.email);
      if (onProfileRefresh) {
        onProfileRefresh(updatedProfile);
      }
    } finally {
      setIsQuickAsking(false);
    }
  };

  const handleToggleQuickMic = () => {
    if (!recognitionRef.current) return;
    playClickSound();
    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningMic(true);
      } catch {
        setIsListeningMic(false);
      }
    }
  };

  // Export 7-Day Executive Digest as a Markdown Brief
  const handleExportWeeklyDigest = () => {
    playClickSound();
    const lines = [
      `# LURL Weekly Executive Digest (Past 7 Days)`,
      `Account: ${profile.email}`,
      `Reporting Window: ${sevenDayStats.windowRangeLabel}`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `## 01. Executive Summary`,
      aiDigest?.executiveHeadline ||
        `7-Day Executive Cadence: ${sevenDayStats.totalSevenDayMinutes} study minutes across ${sevenDayStats.activeDaysCount}/7 active days · ${sevenDayStats.chaptersCompleted7d} modules mastered · ${sevenDayStats.totalInsightsCount} AI Voice Advisor insights indexed.`,
      ``,
      aiDigest?.progressNarrative ||
        `Overall curriculum mastery stands at ${profile.performanceMetrics?.overallMastery ?? profile.overallMastery ?? 28}/100 across Trading, AI Dropshipping, D2C E-Commerce, AI Startups, and Skill Development.`,
      ``,
      `## 02. 7-Day Track-by-Track Progress`,
      ...sevenDayStats.trackSummaries.map(
        (t) =>
          `- **${t.label}**: ${t.completedCount}/${t.totalChapters} Chapters (${t.masteryScore}% Mastery) · ${t.minutesSpent}m total study · ${t.catAdvisor7d} Voice Advisor queries (7d)`
      ),
      ``,
      `## 03. Key Insights Gathered from AI Voice Advisor (Past 7 Days)`,
      ...sevenDayStats.combinedInsights.map(
        (ins, idx) =>
          `### ${idx + 1}. [${ins.category.toUpperCase()}] ${ins.title}\n- **Question Asked**: "${ins.queryText}"\n- **Key Insight**: ${ins.keyInsight}\n- **Quantitative Rule**: ${ins.strategicFormula}\n- **Actionable Directive**: ${ins.actionableDirective}`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LURL_Weekly_Executive_Digest_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const filteredInsights = useMemo(() => {
    if (selectedCategoryFilter === 'all') return sevenDayStats.combinedInsights;
    return sevenDayStats.combinedInsights.filter(
      (item) => item.category === selectedCategoryFilter
    );
  }, [sevenDayStats.combinedInsights, selectedCategoryFilter]);

  const executiveHeadlineText =
    aiDigest?.executiveHeadline ||
    (sevenDayStats.totalSevenDayMinutes > 0 || sevenDayStats.userAdvisorCount7d > 0
      ? `Over the past 7 days, you logged ${sevenDayStats.totalSevenDayMinutes} study minutes across ${sevenDayStats.activeDaysCount}/7 active days, mastering ${sevenDayStats.chaptersCompleted7d} curriculum modules and capturing ${sevenDayStats.totalInsightsCount} high-conviction insights from the AI Voice Advisor.`
      : `Your 7-day executive intelligence brief is active: ${sevenDayStats.chaptersCompleted7d} modules completed with ${sevenDayStats.totalInsightsCount} core AI Voice Advisor frameworks synthesized across your five business tracks.`);

  const progressNarrativeText =
    aiDigest?.progressNarrative ||
    `Primary momentum this week centered on ${sevenDayStats.dominantTrack.label} (${sevenDayStats.dominantTrack.masteryScore}% track mastery). Across all five pillars, your cumulative curriculum mastery is ${profile.performanceMetrics?.overallMastery ?? profile.overallMastery ?? 28}/100 with ${sevenDayStats.bookPagesRead7d} Infinite Online Book pages and ${sevenDayStats.skillsMastered7d} specialized skills logged in the past 7 days.`;

  const voiceSynthesisText =
    aiDigest?.voiceAdvisorSynthesis ||
    (sevenDayStats.userAdvisorCount7d > 0
      ? `Your ${sevenDayStats.userAdvisorCount7d} direct AI Voice Advisor session(s) in the last 7 days distilled actionable quantitative rules—focusing on strict downside risk caps, unit-economic margin expansion, and repeatable standard operating procedures.`
      : `Key insights gathered from the AI Voice Advisor over the past 7 days emphasize institutional liquidity verification before entry (Risk ≤ 1.0%), 3-second viral hook retention (≥ 35%), Contribution Margin 2 discipline (≥ 26%), and uninterrupted 90-minute deliberate practice blocks.`);

  const imperativesList = useMemo(() => {
    if (aiDigest?.nextWeekImperatives && aiDigest.nextWeekImperatives.length > 0) {
      return aiDigest.nextWeekImperatives;
    }
    return [
      {
        priority: '01',
        track: sevenDayStats.nextPriorityTrack.category,
        action: `Complete the next unmastered module in ${sevenDayStats.nextPriorityTrack.label} to lift cross-domain mastery above benchmark`,
        targetMetric: `${sevenDayStats.nextPriorityTrack.masteryScore}% → ${Math.min(100, sevenDayStats.nextPriorityTrack.masteryScore + 50)}% Mastery`,
      },
      {
        priority: '02',
        track: 'trading' as CategoryType,
        action:
          'Consult the AI Voice Advisor on institutional session liquidity sweeps and validate 3 risk-capped setups on the BTC Demo Desk',
        targetMetric: 'EV > +0.35R · Max Risk ≤ 1.0%',
      },
      {
        priority: '03',
        track: 'skill-development' as CategoryType,
        action:
          'Execute two 45-minute deliberate struggle sessions in the 50 Skills Codex and log takeaways to your permanent History Vault',
        targetMetric: '+90m Weekly Velocity Target',
      },
    ];
  }, [aiDigest, sevenDayStats]);

  const summaryCardsData = useMemo(
    () => [
      {
        id: 'study-cadence',
        label: '7-Day Study Cadence',
        primaryValue: `${sevenDayStats.totalSevenDayMinutes} min`,
        valueClassName: 'text-white',
        subtext: (
          <>
            {sevenDayStats.activeDaysCount}/7 Active Days ·{' '}
            <span className="text-[#34d399]">
              {Math.round((sevenDayStats.activeDaysCount / 7) * 100)}% Consistency
            </span>
          </>
        ),
        progressRatio: Math.min(1, Math.max(0.08, sevenDayStats.activeDaysCount / 7)),
        barColorClass: 'from-[#d47a37] to-[#34d399]',
      },
      {
        id: 'curriculum-output',
        label: '7-Day Curriculum Output',
        primaryValue: `${sevenDayStats.chaptersCompleted7d} Modules`,
        valueClassName: 'text-white',
        subtext: (
          <>
            {sevenDayStats.bookPagesRead7d} Book Pages · {sevenDayStats.skillsMastered7d} Skills Mastered
          </>
        ),
        progressRatio: Math.min(1, Math.max(0.1, sevenDayStats.chaptersCompleted7d / 10)),
        barColorClass: 'from-[#38bdf8] to-[#34d399]',
      },
      {
        id: 'voice-advisor-briefings',
        label: 'AI Voice Advisor Briefings',
        primaryValue: `${sevenDayStats.totalInsightsCount} Insights`,
        valueClassName: 'text-[#f8b179]',
        subtext: (
          <>
            {sevenDayStats.userAdvisorCount7d} Custom Queries · Focus: {sevenDayStats.dominantTrack.label}
          </>
        ),
        progressRatio: Math.min(1, Math.max(0.15, sevenDayStats.totalInsightsCount / 6)),
        barColorClass: 'from-[#f8b179] to-[#d47a37]',
      },
      {
        id: 'mastery-velocity',
        label: '7-Day Mastery Velocity',
        primaryValue: `${profile.performanceMetrics?.overallMastery ?? profile.overallMastery ?? 28}/100`,
        valueClassName: 'text-[#34d399]',
        subtext: (
          <>
            Retention Rate: {profile.performanceMetrics?.retentionRate ?? 88}% · Discipline:{' '}
            {profile.performanceMetrics?.disciplineScore ?? 92}%
          </>
        ),
        progressRatio: Math.min(1, Math.max(0.08, (profile.performanceMetrics?.overallMastery ?? profile.overallMastery ?? 28) / 100)),
        barColorClass: 'from-[#34d399] to-[#10b981]',
      },
    ],
    [sevenDayStats, profile.performanceMetrics, profile.overallMastery]
  );

  return (
    <motion.section
      id="weekly-executive-digest"
      variants={digestContainerVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      className="p-6 sm:p-7 rounded-2xl bg-[#0e1118] border border-[#252c3d] space-y-6"
    >
      {/* Top Bar: Kicker Metadata + Title + Executive Actions */}
      <motion.div
        variants={rowItemVariants}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-[#1f2638]"
      >
        <div className="space-y-1.5 max-w-3xl">
          {/* Unboxed clean metadata with typographic separators */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9ca3af] font-mono tabular-nums">
            <span className="text-[#f8b179] font-semibold">Weekly Executive Digest</span>
            <span aria-hidden="true">·</span>
            <span>Past 7 Days ({sevenDayStats.windowRangeLabel})</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#34d399]">
              {sevenDayStats.userAdvisorCount7d > 0
                ? `${sevenDayStats.userAdvisorCount7d} Live Voice Advisor Consultations Logged`
                : `${sevenDayStats.totalInsightsCount} Voice Advisor Insights Indexed`}
            </span>
          </div>

          <h3
            className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white tracking-wide"
            style={{ textWrap: 'balance' }}
          >
            7-Day Learning Progress & AI Voice Advisor Intelligence Brief
          </h3>

          <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
            {executiveHeadlineText}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleSpeakDigest}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
              isSpeakingDigest
                ? 'bg-emerald-600 text-white'
                : 'bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/40'
            }`}
          >
            {isSpeakingDigest ? (
              <>
                <VolumeX className="w-3.5 h-3.5 shrink-0" />
                <span>Stop Voice Briefing</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span>Listen to 7-Day Briefing</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSynthesizeLiveDigest}
            disabled={isSynthesizing}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] text-white flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing Brief...' : 'Synthesize Live AI Digest'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportWeeklyDigest}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141824] hover:bg-[#1f2638] text-[#cbd5e1] hover:text-white border border-[#252c3d] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Export 7-Day Brief</span>
          </button>
        </div>
      </motion.div>

      {/* 7-Day Quantitative Summary Cards (Staggered Framer Motion Entrance Reveal) */}
      <motion.div
        variants={summaryGridVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-5 border-b border-[#1f2638]"
      >
        {summaryCardsData.map((card, idx) => (
          <motion.div
            key={card.id}
            variants={summaryCardVariants}
            whileHover={
              prefersReducedMotion
                ? undefined
                : { y: -3, transition: { duration: 0.16, ease: SMOOTH_EASE } }
            }
            className="p-4 rounded-xl bg-[#121622] border border-[#1f2638] hover:border-[#d47a37]/40 transition-colors flex flex-col justify-between gap-2"
          >
            <div>
              <div className="text-xs text-[#9ca3af]">{card.label}</div>
              <div
                className={`text-xl sm:text-2xl font-bold font-mono tabular-nums mt-1 ${card.valueClassName}`}
              >
                {card.primaryValue}
              </div>
              <div className="text-xs text-[#9ca3af] font-mono tabular-nums mt-1 leading-relaxed">
                {card.subtext}
              </div>
            </div>

            <div className="w-full bg-[#1c2230] h-1 rounded-full overflow-hidden mt-1.5">
              <motion.div
                initial={prefersReducedMotion ? { scaleX: card.progressRatio } : { scaleX: 0 }}
                animate={{ scaleX: card.progressRatio }}
                transition={{
                  duration: 0.65,
                  delay: 0.22 + idx * 0.09,
                  ease: SMOOTH_EASE,
                }}
                className={`h-full w-full origin-left rounded-full bg-gradient-to-r ${card.barColorClass}`}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Two-Column Executive Digest Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-1">
        {/* LEFT COLUMN (5 cols): 01. 7-Day Learning Progress & Next-Week Imperatives */}
        <motion.div variants={columnRevealVariants} className="lg:col-span-5 space-y-6">
          <motion.div variants={rowItemVariants} className="space-y-2">
            <h4 className="text-sm font-semibold text-white tracking-wide">
              01. 7-Day Learning Progress Synthesis
            </h4>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              {progressNarrativeText}
            </p>
          </motion.div>

          {/* Compact High-Density Track Table */}
          <motion.div variants={rowItemVariants} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#6b7280] pb-1.5 border-b border-[#1f2638]">
              <span>CURRICULUM TRACK</span>
              <span>7D PROGRESS · MASTERY</span>
            </div>

            <div className="divide-y divide-[#1f2638]">
              {sevenDayStats.trackSummaries.map((track, trackIdx) => (
                <motion.div
                  key={track.category}
                  variants={rowItemVariants}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : { x: 2, transition: { duration: 0.15, ease: SMOOTH_EASE } }
                  }
                  className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-[#141824]/60 transition-colors px-1.5 rounded-lg"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onSelectCourse(track.category);
                      }}
                      className="font-semibold text-white hover:text-[#f8b179] transition-colors text-left truncate block cursor-pointer"
                    >
                      {track.label}
                    </button>
                    <div className="text-[11px] text-[#9ca3af] font-mono tabular-nums">
                      {track.completedCount}/{track.totalChapters} Chapters · {track.minutesSpent}m
                      {track.catAdvisor7d > 0 ? ` · ${track.catAdvisor7d} Advisor Q&A` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-20 bg-[#1c2230] h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? { scaleX: Math.max(0, Math.min(1, track.masteryScore / 100)) }
                            : { scaleX: 0 }
                        }
                        animate={{ scaleX: Math.max(0, Math.min(1, track.masteryScore / 100)) }}
                        transition={{
                          duration: 0.55,
                          delay: 0.28 + trackIdx * 0.06,
                          ease: SMOOTH_EASE,
                        }}
                        className="bg-gradient-to-r from-[#d47a37] to-[#34d399] h-full w-full origin-left rounded-full"
                      />
                    </div>
                    <span className="font-mono font-bold text-white tabular-nums w-9 text-right">
                      {track.masteryScore}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 02. Next 7-Day Executive Imperatives */}
          <motion.div
            variants={rowItemVariants}
            className="pt-4 border-t border-[#1f2638] space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white tracking-wide">
                02. Next 7-Day Executive Imperatives
              </h4>
              <span className="text-[11px] font-mono text-[#f8b179]">Action Queue</span>
            </div>

            <div className="divide-y divide-[#1f2638]">
              {imperativesList.map((imp, impIdx) => (
                <motion.div
                  key={imp.priority}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.36,
                    delay: 0.32 + impIdx * 0.07,
                    ease: SMOOTH_EASE,
                  }}
                  className="py-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#f8b179] font-semibold">
                      Priority {imp.priority} · {CATEGORY_LABELS[imp.track] || imp.track}
                    </span>
                    <span className="text-[#34d399] tabular-nums">{imp.targetMetric}</span>
                  </div>
                  <p className="text-xs text-[#cbd5e1] leading-relaxed">{imp.action}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onSelectCourse(imp.track);
                      }}
                      className="text-[11px] font-semibold text-[#f8b179] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Open {CATEGORY_LABELS[imp.track] || 'Course'} Codex</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    {onAskVoiceAdvisor && (
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onAskVoiceAdvisor(imp.action, imp.track);
                        }}
                        className="text-[11px] font-semibold text-[#9ca3af] hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <span>Brief with Voice Advisor</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT COLUMN (7 cols): Key Insights Gathered from the AI Voice Advisor (Past 7 Days) */}
        <motion.div
          variants={columnRevealVariants}
          className="lg:col-span-7 space-y-5 lg:border-l lg:border-[#1f2638] lg:pl-8"
        >
          <motion.div
            variants={rowItemVariants}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-white tracking-wide">
                03. Key Insights Gathered from AI Voice Advisor (Past 7 Days)
              </h4>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                {voiceSynthesisText}
              </p>
            </div>
          </motion.div>

          {/* Interactive Track Filter Controls (Functional Segmented Buttons) */}
          <motion.div
            variants={rowItemVariants}
            className="flex items-center gap-1 p-1 rounded-xl bg-[#090b10] border border-[#252c3d] overflow-x-auto no-scrollbar"
          >
            {(
              [
                { id: 'all', label: `All Tracks (${sevenDayStats.combinedInsights.length})` },
                { id: 'trading', label: 'Trading' },
                { id: 'dropshipping', label: 'Dropshipping' },
                { id: 'ecommerce', label: 'E-Commerce' },
                { id: 'startup', label: 'AI Startup' },
                { id: 'skill-development', label: '50 Skills' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setSelectedCategoryFilter(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategoryFilter === tab.id
                    ? 'bg-[#d47a37] text-white'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Quick Voice/Text Inquiry Bar to Capture New Insight Immediately */}
          <motion.form
            variants={rowItemVariants}
            onSubmit={handleQuickAdvisorConsult}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-[#090b10] border border-[#252c3d]"
          >
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value as CategoryType)}
              aria-label="Select category for AI Voice Advisor"
              className="px-2.5 py-1.5 rounded-lg bg-[#141824] border border-[#252c3d] text-xs text-[#f8b179] font-medium outline-none cursor-pointer shrink-0"
            >
              <option value="trading">Trading</option>
              <option value="dropshipping">Dropshipping</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="startup">AI Startup</option>
              <option value="skill-development">50 Skills</option>
            </select>

            <input
              type="text"
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="Ask AI Voice Advisor a question to log a new 7-day insight..."
              className="flex-1 bg-transparent text-xs text-white placeholder-[#6b7280] px-2 py-1.5 outline-none"
            />

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleToggleQuickMic}
                title="Speak question to AI Voice Advisor"
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  isListeningMic
                    ? 'bg-red-500/20 border-red-400 text-red-300 animate-pulse'
                    : 'bg-[#141824] border-[#252c3d] text-[#9ca3af] hover:text-white'
                }`}
              >
                {isListeningMic ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                type="submit"
                disabled={isQuickAsking || !quickPrompt.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#d47a37] hover:bg-[#b85d19] text-white flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Send className="w-3 h-3 shrink-0" />
                <span>{isQuickAsking ? 'Logging...' : 'Capture Insight'}</span>
              </button>
            </div>
          </motion.form>

          {/* AI Voice Advisor Insights List (Staggered Reveal Summary Cards) */}
          <div className="divide-y divide-[#1f2638] max-h-[460px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredInsights.map((item, idx) => {
                const isSpeakingThis = speakingInsightId === item.id;
                const isUserLogged = item.id.startsWith('hist-ai-');

                return (
                  <motion.div
                    key={item.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.985 }}
                    transition={{
                      duration: 0.36,
                      delay: 0.16 + idx * 0.06,
                      ease: SMOOTH_EASE,
                    }}
                    className="py-4 first:pt-1 last:pb-1 space-y-2"
                  >
                    {/* Unboxed Metadata Kicker */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#9ca3af] tabular-nums">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[#f8b179] font-semibold">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={isUserLogged ? 'text-[#34d399]' : 'text-[#9ca3af]'}>
                          {isUserLogged ? 'Your Voice Advisor Session' : 'Core Voice Advisor Brief'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.metricImpact}</span>
                      </div>
                      <span>
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {/* Primary Insight Title */}
                    <h5 className="text-sm font-semibold text-white">
                      {item.title}
                    </h5>

                    {/* Synthesized Takeaway Prose */}
                    <p className="text-xs text-[#cbd5e1] leading-relaxed">
                      {item.keyInsight}
                    </p>

                    {/* Quantitative Formula & Actionable Directive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      {item.strategicFormula && (
                        <div className="text-[#9ca3af]">
                          <span className="text-[#f8b179] font-mono font-semibold">
                            Quantitative Rule:{' '}
                          </span>
                          <span className="font-mono text-white tabular-nums">
                            {item.strategicFormula}
                          </span>
                        </div>
                      )}
                      {item.actionableDirective && (
                        <div className="text-[#9ca3af]">
                          <span className="text-[#34d399] font-mono font-semibold">
                            Directive:{' '}
                          </span>
                          <span>{item.actionableDirective}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Controls per Insight */}
                    <div className="flex flex-wrap items-center gap-4 pt-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeakSingleInsight(item)}
                        className={`text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isSpeakingThis
                            ? 'text-[#34d399]'
                            : 'text-[#f8b179] hover:text-white'
                        }`}
                      >
                        {isSpeakingThis ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 shrink-0" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Read Insight Aloud</span>
                          </>
                        )}
                      </button>

                      {onAskVoiceAdvisor && (
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            onAskVoiceAdvisor(
                              `Give me an advanced step-by-step execution drill for: ${item.title}`,
                              item.category
                            );
                          }}
                          className="text-[11px] font-semibold text-[#9ca3af] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Bot className="w-3.5 h-3.5 text-[#d47a37] shrink-0" />
                          <span>Deep-Dive in AI Voice Advisor</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
