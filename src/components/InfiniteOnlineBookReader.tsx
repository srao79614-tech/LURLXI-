import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryType, InfiniteBookPage } from '../types';
import { logBookPageRead, getUserPerformance } from '../utils/userStorage';
import { logActivity } from '../utils/activityHistory';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { CATEGORIES_DATA } from '../data/categoriesData';
import {
  getChapterBookPage,
  PAGES_PER_CHAPTER,
  TOTAL_PAGES_PER_CATEGORY,
} from '../utils/chapterBookEngine';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  CheckCircle2,
  Calculator,
  ExternalLink,
  Search,
  RefreshCw,
  Award,
  Layers,
  Check,
  Copy,
  HelpCircle,
  Zap,
  History,
  Clock,
  Volume2,
  VolumeX,
  Flame,
  AlertCircle,
  CheckCheck,
} from 'lucide-react';

interface InfiniteOnlineBookReaderProps {
  category: CategoryType;
  categoryTitle: string;
  onAskChatbot: (prompt: string) => void;
  onViewHistory?: () => void;
}

export const InfiniteOnlineBookReader: React.FC<InfiniteOnlineBookReaderProps> = ({
  category,
  categoryTitle,
  onAskChatbot,
  onViewHistory,
}) => {
  const [pageNumber, setPageNumber] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`lurl_infinite_book_last_page_${category}`);
      return saved ? Math.max(1, parseInt(saved, 10) || 1) : 1;
    } catch {
      return 1;
    }
  });
  const [jumpInput, setJumpInput] = useState<string>('1');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [pageData, setPageData] = useState<InfiniteBookPage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [studiedPages, setStudiedPages] = useState<number[]>([]);
  const [showRewardPulse, setShowRewardPulse] = useState<boolean>(false);
  const [copiedFormula, setCopiedFormula] = useState<boolean>(false);
  const [scrollExtraPagesCount, setScrollExtraPagesCount] = useState<number>(5);
  const infiniteScrollSentinelRef = useRef<HTMLDivElement | null>(null);

  // Real-Time Reading Engine State & Telemetry
  const [activeReadingSeconds, setActiveReadingSeconds] = useState<number>(0);
  const [pageReadingScroll, setPageReadingScroll] = useState<number>(0);
  const [isReadingAutoCompleted, setIsReadingAutoCompleted] = useState<boolean>(false);
  const [readingPromptWarning, setReadingPromptWarning] = useState<string | null>(null);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState<boolean>(false);
  const bookPageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveReadingSeconds(0);
    setIsReadingAutoCompleted(false);
    setReadingPromptWarning(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTtsSpeaking(false);
    }
  }, [pageNumber, category]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setActiveReadingSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!bookPageContainerRef.current) return;
      const el = bookPageContainerRef.current;
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const visible = windowHeight - rect.top;
      const total = rect.height;
      if (total <= 0) return;
      const pct = Math.min(100, Math.max(0, Math.round((visible / total) * 100)));
      setPageReadingScroll(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pageNumber, pageData]);

  const readingComprehensionPercent = Math.min(
    100,
    Math.round(pageReadingScroll * 0.7 + Math.min(30, (activeReadingSeconds / 15) * 30))
  );

  const handleToggleTts = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isTtsSpeaking) {
      window.speechSynthesis.cancel();
      setIsTtsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const title = pageData?.subtopicTitle || localDeepBookPage.pageHeadline;
    const summary = pageData?.executiveSummary || localDeepBookPage.longFormProse[0];
    const fullText = `${title}. ${summary}. ${pageData?.sections?.map((s) => `${s.heading}. ${s.paragraphs.join(' ')}`).join(' ') || ''}`;
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsTtsSpeaking(false);
    utterance.onerror = () => setIsTtsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsTtsSpeaking(true);
  };

  useEffect(() => {
    setScrollExtraPagesCount(5);
  }, [pageNumber, category]);

  useEffect(() => {
    const sentinel = infiniteScrollSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setScrollExtraPagesCount((prev) => Math.min(200, prev + 5));
        }
      },
      { root: null, rootMargin: '600px 0px', threshold: 0.01 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pageNumber, category, isLoading]);

  const catChapters = CATEGORIES_DATA[category]?.chapters || CATEGORIES_DATA.trading.chapters;
  const mappedChapterIdx = Math.min(
    catChapters.length - 1,
    Math.floor((Math.max(1, pageNumber) - 1) / PAGES_PER_CHAPTER) % catChapters.length
  );
  const mappedChapter = catChapters[mappedChapterIdx] || catChapters[0];
  const mappedChapterPageNum = ((Math.max(1, pageNumber) - 1) % PAGES_PER_CHAPTER) + 1;
  const localDeepBookPage = getChapterBookPage(
    category,
    mappedChapter,
    mappedChapterIdx,
    mappedChapterPageNum
  );
  const extraScrollBookPages = Array.from({ length: scrollExtraPagesCount }, (_, idx) => {
    const p = pageNumber + idx + 1;
    const chIdx = Math.min(
      catChapters.length - 1,
      Math.floor((p - 1) / PAGES_PER_CHAPTER) % catChapters.length
    );
    const ch = catChapters[chIdx] || catChapters[0];
    const chP = ((p - 1) % PAGES_PER_CHAPTER) + 1;
    return { globalPage: p, data: getChapterBookPage(category, ch, chIdx, chP) };
  });

  // Sync studied pages from history and localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lurl_infinite_book_studied_${category}`);
      const parsed = saved ? JSON.parse(saved) : [];
      const perf = getUserPerformance();
      const fromHist = (perf.history || [])
        .filter((h) => h.type === 'book_page_read' && h.category === category && h.pageNumber)
        .map((h) => Number(h.pageNumber));
      const merged = Array.from(new Set([...parsed, ...fromHist]));
      setStudiedPages(merged);
    } catch {
      setStudiedPages([]);
    }
  }, [category]);

  // Reset or restore page number when category changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`lurl_infinite_book_last_page_${category}`);
      const initialPage = saved ? Math.max(1, parseInt(saved, 10) || 1) : 1;
      setPageNumber(initialPage);
      setJumpInput(String(initialPage));
      setCustomTopic('');
    } catch {
      setPageNumber(1);
      setJumpInput('1');
    }
  }, [category]);

  const fetchOnlineBookPage = async (targetPage: number, topicOverride?: string, forceRefresh = false) => {
    setIsLoading(true);
    try {
      localStorage.setItem(`lurl_infinite_book_last_page_${category}`, String(targetPage));
    } catch {}

    try {
      const res = await fetch('/api/book/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          pageNumber: targetPage,
          customTopic: topicOverride !== undefined ? topicOverride : customTopic,
          forceRefresh,
        }),
      });
      const data = await res.json();
      if (data?.success && data?.page) {
        setPageData(data.page);
      }
    } catch (err) {
      console.error('Online book page fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineBookPage(pageNumber);
  }, [category, pageNumber]);

  const handleMarkPageStudied = (forceBypass = false) => {
    if (!pageData) return;
    const isAlreadyStudied = studiedPages.includes(pageNumber);

    if (!isAlreadyStudied && !forceBypass && readingComprehensionPercent < 50) {
      setReadingPromptWarning(
        `Active Reading Required: To prevent fake progress, LURL processes online book pages through real-time reading. Current depth: ${pageReadingScroll}% scrolled, ${activeReadingSeconds}s read. Please review the sections and formulas below, or click Fast-Track Confirm.`
      );
      playClickSound();
      return;
    }

    setReadingPromptWarning(null);
    playSuccessChime();

    if (!isAlreadyStudied) {
      const updated = [...studiedPages, pageNumber];
      setStudiedPages(updated);
      try {
        localStorage.setItem(`lurl_infinite_book_studied_${category}`, JSON.stringify(updated));
      } catch {}
    }

    const takeawayText =
      pageData.whatYouLearntSummary?.join(' • ') || pageData.executiveSummary;

    logBookPageRead(category, pageNumber, pageData.subtopicTitle, takeawayText);
    logActivity(
      category as any,
      `Studied Infinite Book Page #${pageNumber}`,
      `${pageData.subtopicTitle} (${categoryTitle})`
    );

    setShowRewardPulse(true);
    setTimeout(() => setShowRewardPulse(false), 3200);
  };

  const handleNextPage = () => {
    playClickSound();
    const next = pageNumber + 1;
    setPageNumber(next);
    setJumpInput(String(next));
  };

  const handlePrevPage = () => {
    if (pageNumber <= 1) return;
    playClickSound();
    const prev = Math.max(1, pageNumber - 1);
    setPageNumber(prev);
    setJumpInput(String(prev));
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Math.max(1, parseInt(jumpInput, 10) || 1);
    playClickSound();
    setPageNumber(parsed);
    setJumpInput(String(parsed));
  };

  const handleTopicSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;
    playClickSound();
    fetchOnlineBookPage(pageNumber, customTopic.trim(), true);
  };

  const isCurrentPageStudied = studiedPages.includes(pageNumber);

  return (
    <div className="space-y-6">
      {/* Top Infinite Book Navigation & Online Status Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0e1320] via-[#121828] to-[#0e1320] border border-[#d47a37]/40 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1f2638]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                100% LIVE ONLINE KNOWLEDGE STREAM
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40">
                PAGE #{pageNumber.toLocaleString()} OF {TOTAL_PAGES_PER_CATEGORY.toLocaleString()}+ (30,000+ PLATFORM PAGES)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30">
                {studiedPages.length} Pages Studied & Saved to Private History
              </span>
            </div>
            <h3 className="font-['Cinzel'] text-lg sm:text-xl font-bold text-white">
              {pageData?.volumeTitle || `The Infinite Online Encyclopedia of ${categoryTitle}`}
            </h3>
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Flip through unlimited online pages or synthesize any deep topic on demand. Every studied page is permanently saved to your Learning History Vault.
            </p>
          </div>

          {/* Page Flipper Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={pageNumber <= 1 || isLoading}
              className="px-3 py-2 rounded-xl bg-[#141926] hover:bg-[#1f273b] disabled:opacity-40 text-white border border-[#2b354d] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev Page</span>
            </button>

            <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
              <span className="text-xs text-[#9ca3af] font-mono">Page #</span>
              <input
                type="number"
                min={1}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                className="w-20 px-2.5 py-1.5 rounded-xl bg-[#090b10] border border-[#d47a37]/50 text-white font-mono text-xs font-bold text-center outline-none focus:border-[#f8b179]"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 rounded-xl bg-[#1a2133] hover:bg-[#252f47] text-[#f8b179] border border-[#d47a37]/40 text-xs font-bold cursor-pointer"
              >
                Go
              </button>
            </form>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer transition-all"
            >
              <span>Next Page #{pageNumber + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Page Presets & Live Online Topic Deep-Dive Input */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-[#9ca3af] mr-1">Quick Jump (6,000+ Pages):</span>
            {[1, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 6000].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  playClickSound();
                  setPageNumber(p);
                  setJumpInput(String(p));
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                  pageNumber === p
                    ? 'bg-[#d47a37] text-white border-[#f8b179]'
                    : 'bg-[#090b10] text-[#9ca3af] hover:text-white border-[#1f2638]'
                }`}
              >
                P.{p}
              </button>
            ))}
          </div>

          <form onSubmit={handleTopicSynthesize} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-[#6b7280] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder={`Load online knowledge on any ${category} topic...`}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#090b10] border border-[#252c3d] focus:border-[#d47a37] text-xs text-white placeholder-[#6b7280] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !customTopic.trim()}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Fetch Online</span>
            </button>
          </form>
        </div>
      </div>

      {/* Subtle Progress Reward Animation Banner when Page Studied */}
      <AnimatePresence>
        {showRewardPulse && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-900/80 to-emerald-950/90 border border-emerald-400/50 shadow-xl flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                <Award className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <span>Page #{pageNumber} Recorded in Permanent Learning History!</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 font-mono text-[10px]">
                    +5m Study XP
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90">
                  Your key takeaways from "{pageData?.subtopicTitle}" have been permanently archived in your History & Performance Vault.
                </p>
              </div>
            </div>
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-emerald-400"
              >
                <History className="w-3.5 h-3.5" />
                <span>View History Vault</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Book Page Sheet */}
      {isLoading || !pageData ? (
        <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-12 text-center space-y-4 shadow-2xl">
          <RefreshCw className="w-8 h-8 text-[#d47a37] animate-spin mx-auto" />
          <div className="space-y-1">
            <h4 className="font-['Cinzel'] text-base font-bold text-white">
              Synthesizing Online Knowledge Book — Page #{pageNumber}...
            </h4>
            <p className="text-xs text-[#9ca3af]">
              Connecting to LURL Live Online Gemini Knowledge Core for {categoryTitle}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          key={`${category}-${pageNumber}-${pageData.subtopicTitle}`}
          ref={bookPageContainerRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-6 sm:p-8 shadow-2xl space-y-8 relative overflow-hidden"
        >
          {/* Top Accent Progress Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#d47a37] via-amber-400 to-emerald-400" />

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2638]">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40">
                  BOOK PAGE #{pageData.pageNumber}
                </span>
                <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/30">
                  {pageData.chapterTitle}
                </span>
                <span className="text-xs text-[#6b7280] font-mono">{pageData.readTime}</span>
              </div>
              <h2 className="font-['Cinzel'] text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                {pageData.subtopicTitle}
              </h2>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleMarkPageStudied()}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isCurrentPageStudied
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isCurrentPageStudied ? 'Studied & Saved in History ✓' : 'Mark Page Studied & Save'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time Reading Progress Engine HUD */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#111726] via-[#141b2c] to-[#0f1422] border border-[#d47a37]/50 shadow-lg space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1f2638]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                  Real-Time Reading Engine Active
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleTts}
                title={isTtsSpeaking ? 'Stop Speech' : 'Listen to Page Text Read Aloud'}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isTtsSpeaking
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-[#182030] text-[#f8b179] border-[#d47a37]/30 hover:bg-[#20293d]'
                }`}
              >
                {isTtsSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span>Stop Listening</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Along (TTS)</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#090b10] border border-[#1f2638]">
                <span className="text-[10px] text-[#9ca3af] block">Active Read Time</span>
                <span className="font-mono font-bold text-white flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#f8b179]" />
                  <span>{Math.floor(activeReadingSeconds / 60)}m {(activeReadingSeconds % 60).toString().padStart(2, '0')}s</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#090b10] border border-[#1f2638]">
                <span className="text-[10px] text-[#9ca3af] block">Scroll Read Depth</span>
                <span className="font-mono font-bold text-[#f8b179] flex items-center gap-1 mt-0.5">
                  <BookOpen className="w-3 h-3" />
                  <span>{pageReadingScroll}% Read</span>
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#090b10] border border-[#1f2638]">
                <span className="text-[10px] text-[#9ca3af] block">Processing Status</span>
                <span className={`font-mono font-bold text-[11px] flex items-center gap-1 mt-0.5 ${readingComprehensionPercent >= 75 || isCurrentPageStudied ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {readingComprehensionPercent >= 75 || isCurrentPageStudied ? (
                    <>
                      <CheckCheck className="w-3 h-3" /> 100% Retained
                    </>
                  ) : (
                    <>
                      <Flame className="w-3 h-3 text-amber-400 animate-pulse" /> {readingComprehensionPercent}% Processed
                    </>
                  )}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-[#090b10] border border-[#1f2638]">
                <span className="text-[10px] text-[#9ca3af] block">Real-Time Process</span>
                <span className="font-mono text-[11px] text-cyan-300 mt-0.5 block truncate">
                  {readingComprehensionPercent >= 75 || isCurrentPageStudied
                    ? 'Verified in Vault ✓'
                    : 'Reading in real-time'}
                </span>
              </div>
            </div>

            <div className="w-full bg-[#090b10] h-2 rounded-full overflow-hidden border border-[#1f2638]">
              <div
                className="h-full bg-gradient-to-r from-[#d47a37] via-amber-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${isCurrentPageStudied ? 100 : readingComprehensionPercent}%` }}
              />
            </div>
          </div>

          {/* Real-Time Reading Prompt Warning */}
          {readingPromptWarning && (
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs text-amber-200 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[#e5e7eb]">{readingPromptWarning}</p>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setReadingPromptWarning(null)}
                  className="px-2.5 py-1 rounded bg-[#141824] hover:bg-[#1f2638] text-white font-bold cursor-pointer"
                >
                  Continue Reading
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkPageStudied(true)}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Fast-Track Confirm
                </button>
              </div>
            </div>
          )}

          {/* Executive Summary Callout */}
          <div className="p-4 rounded-xl bg-[#141824] border-l-4 border-[#d47a37] text-xs sm:text-sm text-[#e5e7eb] leading-relaxed">
            <span className="font-bold text-[#f8b179] uppercase tracking-wider block mb-1 text-[11px]">
              Executive Thesis — Page #{pageData.pageNumber}
            </span>
            {pageData.executiveSummary}
          </div>

          {/* Deep Textbook Sections */}
          <div className="space-y-6">
            {pageData.sections.map((sec, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#111520] border border-[#1f2638] space-y-3"
              >
                <h3 className="font-['Cinzel'] text-base font-bold text-[#f8b179] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#d47a37]" />
                  <span>{sec.heading}</span>
                </h3>
                <div className="space-y-3 text-xs sm:text-sm text-[#d1d5db] leading-7">
                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>
                <div className="p-3 rounded-xl bg-[#090b10] border border-[#d47a37]/30 flex items-start gap-2 text-xs text-amber-200">
                  <Sparkles className="w-4 h-4 text-[#f8b179] shrink-0 mt-0.5" />
                  <span>
                    <strong>Core Principle:</strong> {sec.keyPrinciple}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quantitative Formula Box */}
          {pageData.quantitativeFormula && (
            <div className="p-5 rounded-2xl bg-[#090b10] border border-[#d47a37]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f8b179] flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span>Quantitative Model: {pageData.quantitativeFormula.name}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pageData.quantitativeFormula.equation);
                    setCopiedFormula(true);
                    setTimeout(() => setCopiedFormula(false), 2000);
                  }}
                  className="text-xs text-[#9ca3af] hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedFormula ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Formula
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 rounded-xl bg-[#141824] font-mono text-xs sm:text-sm text-emerald-300 border border-[#252c3d] overflow-x-auto">
                {pageData.quantitativeFormula.equation}
              </div>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                {pageData.quantitativeFormula.application}
              </p>
            </div>
          )}

          {/* Empirical Strategy & Statistics Benchmark Table */}
          <div className="p-5 rounded-2xl bg-[#090b10] border border-[#252c3d] space-y-3 overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                📊 {localDeepBookPage.empiricalStatisticsTable.tableTitle}
              </h4>
              <span className="text-[10px] font-mono text-[#9ca3af]">
                {localDeepBookPage.empiricalStatisticsTable.sampleSizeNote}
              </span>
            </div>
            <table className="w-full text-left text-xs border-collapse min-w-[540px]">
              <thead>
                <tr className="border-b border-[#1f2638] text-[10px] font-mono uppercase text-[#9ca3af]">
                  <th className="py-2 px-2.5">Strategic Metric</th>
                  <th className="py-2 px-2.5">Retail Baseline</th>
                  <th className="py-2 px-2.5 text-[#f8b179]">Institutional Target</th>
                  <th className="py-2 px-2.5 text-emerald-400">Top-Decile (P90)</th>
                  <th className="py-2 px-2.5 text-right">Variance / Edge Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161b28] font-mono text-[11px]">
                {localDeepBookPage.empiricalStatisticsTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-[#121724]/60">
                    <td className="py-2.5 px-2.5 font-sans font-semibold text-white">
                      {row.metric}
                    </td>
                    <td className="py-2.5 px-2.5 text-rose-300/90">{row.retailBaseline}</td>
                    <td className="py-2.5 px-2.5 text-[#f8b179] font-bold">
                      {row.institutionalTarget}
                    </td>
                    <td className="py-2.5 px-2.5 text-emerald-400 font-bold">
                      {row.p90Benchmark}
                    </td>
                    <td className="py-2.5 px-2.5 text-right text-cyan-300">
                      {row.varianceImpact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Worked Quantitative Proof from Unabridged Chapter Engine */}
          <div className="p-5 rounded-2xl bg-[#111520] border border-[#d47a37]/35 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#f8b179]">
                Step-by-Step Numerical Proof — {localDeepBookPage.workedMathematicalProof.title}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Ch.{localDeepBookPage.chapterNumber} · Page #{localDeepBookPage.chapterPageNumber}/500
              </span>
            </div>
            <div className="space-y-1.5 text-xs font-mono text-[#cbd5e1]">
              {localDeepBookPage.workedMathematicalProof.stepByStepDerivation.map((line, lIdx) => (
                <div key={lIdx} className="p-2 rounded bg-[#090b10] border border-[#1f2638]">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Tactical Playbook & Real-World Case Study Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#111520] border border-[#1f2638] space-y-3">
              <h4 className="font-['Cinzel'] text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Step-by-Step Tactical Execution</span>
              </h4>
              <div className="space-y-2.5">
                {pageData.tacticalPlaybook.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] text-xs text-[#e5e7eb] leading-relaxed"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {pageData.realWorldCaseStudy && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#19140e] to-[#111520] border border-[#d47a37]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#f8b179]">
                      Institutional Case Study
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {pageData.realWorldCaseStudy.metricResult}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-white">
                    {pageData.realWorldCaseStudy.organization}
                  </h5>
                  <p className="text-xs text-[#d1d5db] leading-relaxed">
                    {pageData.realWorldCaseStudy.analysis}
                  </p>
                </div>
              )}

              {/* What You Learnt Summary Box */}
              <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>What You Learnt on Page #{pageData.pageNumber}</span>
                </h5>
                <ul className="space-y-1.5">
                  {pageData.whatYouLearntSummary.map((item, wIdx) => (
                    <li key={wIdx} className="text-xs text-[#d1d5db] flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Live Online Web References & Citations */}
          {pageData.onlineReferences && pageData.onlineReferences.length > 0 && (
            <div className="pt-4 border-t border-[#1f2638] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Verified Online Knowledge Sources & Web References</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {pageData.onlineReferences.map((ref, rIdx) => (
                  <a
                    key={rIdx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-xl bg-[#090b10] hover:bg-[#141a29] border border-[#1f2638] hover:border-cyan-500/40 transition-all group block"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-cyan-300 mb-1">
                      <span className="truncate">{ref.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 ml-1 opacity-70" />
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 block mb-1">
                      {ref.domain}
                    </span>
                    <p className="text-[11px] text-[#9ca3af] line-clamp-2">{ref.insight}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Continuous Multi-Page Unabridged Scroll Continuation */}
          <div className="pt-6 border-t-2 border-[#d47a37]/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-['Cinzel'] text-base font-bold text-white">
                  Continuous Book Scroll — Subsequent Pages (#{pageNumber + 1} to #{pageNumber + scrollExtraPagesCount})
                </h4>
                <p className="text-xs text-[#9ca3af]">
                  Read continuously like a physical textbook. Keep scrolling down or load more pages below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setScrollExtraPagesCount((prev) => prev + 5);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/40 text-xs font-bold cursor-pointer shrink-0"
              >
                + Append 5 More Pages to Scroll
              </button>
            </div>

            {extraScrollBookPages.map(({ globalPage, data }) => (
              <div
                key={`scroll-extra-${globalPage}`}
                className="p-6 rounded-2xl bg-[#111520] border border-[#252c3d] space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1f2638]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40">
                      BOOK PAGE #{globalPage.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      Chapter {data.chapterNumber} (Page #{data.chapterPageNumber}/500)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setPageNumber(globalPage);
                      setJumpInput(String(globalPage));
                    }}
                    className="text-xs font-mono text-emerald-400 hover:underline cursor-pointer"
                  >
                    Focus Page #{globalPage} →
                  </button>
                </div>

                <h5 className="font-['Cinzel'] text-base font-bold text-white">
                  {data.pageHeadline}
                </h5>

                <div className="space-y-3 text-xs sm:text-sm text-[#d1d5db] leading-7">
                  {data.longFormProse.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] font-mono text-xs text-emerald-300 overflow-x-auto">
                  {data.workedMathematicalProof.equation}
                </div>
              </div>
            ))}

            {/* Automatic Infinite Scroll Sentinel */}
            <div
              ref={infiniteScrollSentinelRef}
              className="p-4 rounded-xl bg-[#090b10] border border-[#252c3d] flex items-center justify-between text-xs text-[#9ca3af]"
            >
              <span>
                Continuous Book Stream Active — Scrolling down automatically loads subsequent pages (#{pageNumber + 1}–#{pageNumber + scrollExtraPagesCount} loaded)
              </span>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setScrollExtraPagesCount((prev) => prev + 10);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#d47a37] hover:bg-[#e08a46] text-white font-bold cursor-pointer"
              >
                + Load 10 More Pages
              </button>
            </div>
          </div>

          {/* Bottom Page Navigation & AI Doubt Clarifier Bar */}
          <div className="pt-6 border-t border-[#1f2638] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() =>
                onAskChatbot(
                  `Clarify all my doubts about ${categoryTitle} Book Page #${pageData.pageNumber} ("${pageData.subtopicTitle}") and give me a practical example.`
                )
              }
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1e2538] text-[#f8b179] border border-[#d47a37]/40 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Clarify Doubts on Page #{pageData.pageNumber} with AI Advisor</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={pageNumber <= 1}
                className="px-4 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1f2638] disabled:opacity-40 text-white border border-[#252c3d] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Page #{Math.max(1, pageNumber - 1)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isCurrentPageStudied) handleMarkPageStudied();
                  handleNextPage();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] text-white text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <span>Complete & Turn to Page #{pageNumber + 1}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
