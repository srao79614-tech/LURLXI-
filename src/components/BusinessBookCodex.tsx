import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CategoryInfo, CategoryType, CodexChapter } from '../types';
import { CATEGORIES_DATA } from '../data/categoriesData';
import {
  isPageBookmarked,
  togglePageBookmark,
  getBookmarkedPages,
} from '../utils/codexBookmarks';
import { toggleChapterCompletion, getUserPerformance } from '../utils/userStorage';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { PracticalExecutionLab } from './PracticalExecutionLab';
import {
  BookOpen,
  Bookmark,
  CheckCircle2,
  Circle,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowRight,
  ListChecks,
} from 'lucide-react';

interface BusinessBookCodexProps {
  categoryInfo: CategoryInfo;
  onAskChatbot?: (prompt: string) => void;
  onViewPerformance?: () => void;
  onSelectCategory?: (category: CategoryType) => void;
  resetKey?: number;
  userEmail?: string;
  isGmailVerified?: boolean;
  onOpenBookmarks?: () => void;
  onOpenAuth?: () => void;
}

export const BusinessBookCodex: React.FC<BusinessBookCodexProps> = ({
  categoryInfo,
  onAskChatbot,
  onViewPerformance,
  onSelectCategory,
  resetKey = 0,
  userEmail,
  isGmailVerified = false,
  onOpenBookmarks,
  onOpenAuth,
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeReadingSeconds, setActiveReadingSeconds] = useState<number>(0);
  const [isTtsSpeaking, setIsTtsSpeaking] = useState<boolean>(false);
  const [bookmarkedKeys, setBookmarkedKeys] = useState<Set<string>>(() => {
    const list = getBookmarkedPages(userEmail);
    return new Set(list.map((b) => b.id));
  });
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);

  const readingContainerRef = useRef<HTMLDivElement>(null);

  const activeChapter: CodexChapter =
    categoryInfo.chapters[activeChapterIndex] || categoryInfo.chapters[0];

  // Sync completion states
  useEffect(() => {
    const perf = getUserPerformance(userEmail);
    const catPerf = perf.courses[categoryInfo.id];
    if (catPerf && catPerf.completedChapterIds) {
      setCompletedIds(catPerf.completedChapterIds);
    } else {
      setCompletedIds([]);
    }
  }, [categoryInfo.id, userEmail, resetKey]);

  // Sync bookmarks
  useEffect(() => {
    const handleBookmarkUpdate = () => {
      const list = getBookmarkedPages(userEmail);
      setBookmarkedKeys(new Set(list.map((b) => b.id)));
    };
    window.addEventListener('lurl-bookmarks-updated', handleBookmarkUpdate);
    return () => window.removeEventListener('lurl-bookmarks-updated', handleBookmarkUpdate);
  }, [userEmail]);

  // Reading timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReadingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeChapterIndex, categoryInfo.id]);

  // Handle external navigation to chapter
  useEffect(() => {
    const handleNavigate = (e: any) => {
      const data = e.detail;
      if (!data) return;
      if (data.category && data.category !== categoryInfo.id) {
        onSelectCategory?.(data.category);
      }
      if (data.chapterId) {
        const foundIdx = categoryInfo.chapters.findIndex((c) => c.id === data.chapterId);
        if (foundIdx !== -1) {
          setActiveChapterIndex(foundIdx);
          readingContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };
    window.addEventListener('lurl-navigate-to-page', handleNavigate);
    return () => window.removeEventListener('lurl-navigate-to-page', handleNavigate);
  }, [categoryInfo, onSelectCategory]);

  // Stop audio when changing chapters
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTtsSpeaking(false);
    }
  }, [activeChapterIndex, categoryInfo.id]);

  const handleToggleChapterComplete = () => {
    playClickSound();
    const isNowDone = toggleChapterCompletion(categoryInfo.id, activeChapter.id, userEmail);
    if (isNowDone) {
      setCompletedIds((prev) => [...prev, activeChapter.id]);
      playSuccessChime();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#d47a37', '#f8b179', '#34d399', '#ffffff'],
      });
    } else {
      setCompletedIds((prev) => prev.filter((id) => id !== activeChapter.id));
    }
  };

  const handleToggleBookmarkCurrentChapter = () => {
    playClickSound();
    const bookmarkId = `${categoryInfo.id}_${activeChapter.id}_p1`;
    const wasAdded = togglePageBookmark(
      {
        id: bookmarkId,
        category: categoryInfo.id,
        categoryTitle: categoryInfo.title,
        chapterId: activeChapter.id,
        chapterNumber: activeChapter.number,
        chapterTitle: activeChapter.title,
        pageNumber: 1,
        pageHeadline: activeChapter.title,
        analyticalLens: activeChapter.subtitle,
        excerpt: activeChapter.summary,
      },
      userEmail
    );

    setBookmarkToast(
      wasAdded
        ? `✓ Chapter ${activeChapter.number} saved to your Vault!`
        : `Removed Chapter ${activeChapter.number} from Vault.`
    );
    setTimeout(() => setBookmarkToast(null), 3000);
  };

  const handleToggleTts = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isTtsSpeaking) {
      window.speechSynthesis.cancel();
      setIsTtsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${activeChapter.title}. ${activeChapter.subtitle}. ${activeChapter.summary}. ${activeChapter.content.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsTtsSpeaking(false);
      utterance.onerror = () => setIsTtsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsTtsSpeaking(true);
    }
  };

  const isCurrentChapterCompleted = completedIds.includes(activeChapter.id);
  const isCurrentChapterSaved = bookmarkedKeys.has(`${categoryInfo.id}_${activeChapter.id}_p1`);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {bookmarkToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#172033] to-[#0f1422] border border-amber-400/60 text-white text-xs font-semibold shadow-2xl flex items-center gap-2"
          >
            <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{bookmarkToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Switcher Ribbon */}
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0c101a] via-[#111726] to-[#0c101a] border border-[#252c3d] shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2638]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d47a37] animate-pulse" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#f8b179]" /> Executive Curriculum Domains:
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenBookmarks && (
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onOpenBookmarks();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Saved Vault ({bookmarkedKeys.size})</span>
              </button>
            )}
          </div>
        </div>

        {/* 5 Categories Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: 'trading', icon: '📈', label: 'Precision Trading', sub: 'Institutional Order Flow' },
            { id: 'dropshipping', icon: '📦', label: 'High-Ticket DTC', sub: 'High-Ticket Brand Scaling' },
            { id: 'ecommerce', icon: '🛒', label: 'D2C Ecommerce', sub: 'Supply Chain & Retention' },
            { id: 'startup', icon: '🏢', label: 'Startups & CRE', sub: 'Venture & Asset Mastery' },
            { id: 'skill-development', icon: '🧠', label: '50 Master Skills', sub: 'Strategic Execution' },
          ].map((c) => {
            const isSelected = categoryInfo.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  onSelectCategory?.(c.id as CategoryType);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#d47a37]/30 to-[#b85d19]/20 border-[#f8b179] text-white shadow-md ring-1 ring-[#f8b179]/40'
                    : 'bg-[#090d16] hover:bg-[#141a29] border-[#1f2638] text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span>{c.icon}</span>
                  <span className="font-mono text-[10px] text-gray-500">{categoryInfo.chapters.length} Ch</span>
                </div>
                <div className="text-xs font-bold truncate mt-1 text-white">{c.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Navigation (Chapters) + Right Chapter Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chapters Table of Contents */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#0d101a] border border-[#252c3d] p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2638]">
              <h3 className="font-['Cinzel'] text-sm font-bold tracking-wider text-[#f8b179] uppercase flex items-center gap-2">
                <Layers className="w-4 h-4" /> Chapters Curriculum
              </h3>
              <span className="text-xs text-[#9ca3af] font-mono">
                {completedIds.length}/{categoryInfo.chapters.length} Completed
              </span>
            </div>

            {/* Chapters List */}
            <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
              {categoryInfo.chapters.map((ch, idx) => {
                const isSelected = idx === activeChapterIndex;
                const isDone = completedIds.includes(ch.id);
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      playClickSound();
                      setActiveChapterIndex(idx);
                      readingContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#d47a37]/25 to-[#b85d19]/15 border-[#f8b179] shadow-md'
                        : 'bg-[#090b10] hover:bg-[#141a29] border-[#1a2133] hover:border-[#252c3d]'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <span
                        className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-[#d47a37] text-white' : 'bg-[#141824] text-gray-400'
                        }`}
                      >
                        {ch.number}
                      </span>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold leading-snug truncate ${
                            isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'
                          }`}
                        >
                          {ch.title}
                        </div>
                        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                          {ch.readTime}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChapterIndex(idx);
                        handleToggleChapterComplete();
                      }}
                      className="p-1 rounded text-gray-400 hover:text-emerald-400 shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Full Chapter Reading Experience */}
        <div className="lg:col-span-8 space-y-6" ref={readingContainerRef}>
          <div className="rounded-2xl bg-[#0d101a] border border-[#252c3d] p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Chapter Header Banner */}
            <div className="space-y-3 pb-6 border-b border-[#1f2638]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40">
                    CHAPTER {activeChapter.number}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{activeChapter.readTime}</span>
                  <span className="text-xs text-emerald-400 font-mono">
                    Time: {Math.floor(activeReadingSeconds / 60)}m {(activeReadingSeconds % 60).toString().padStart(2, '0')}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Bookmark Chapter */}
                  <button
                    type="button"
                    onClick={handleToggleBookmarkCurrentChapter}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                      isCurrentChapterSaved
                        ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-[#141824] text-gray-300 hover:text-white border-[#252c3d] hover:border-amber-400/50'
                    }`}
                    title={isCurrentChapterSaved ? 'Remove from Saved Vault' : 'Save Chapter to Vault'}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        isCurrentChapterSaved ? 'fill-amber-400 text-amber-400' : 'text-gray-400'
                      }`}
                    />
                    <span>{isCurrentChapterSaved ? 'Saved ✓' : 'Bookmark'}</span>
                  </button>

                  {/* TTS Read Aloud */}
                  <button
                    type="button"
                    onClick={handleToggleTts}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                      isTtsSpeaking
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                        : 'bg-[#141824] text-gray-300 hover:text-white border-[#252c3d]'
                    }`}
                  >
                    {isTtsSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isTtsSpeaking ? 'Stop Audio' : 'Listen'}</span>
                  </button>

                  {/* Mark Chapter Mastered */}
                  <button
                    type="button"
                    onClick={handleToggleChapterComplete}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                      isCurrentChapterCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-[#141824] text-gray-300 hover:text-white border-[#252c3d] hover:border-[#d47a37]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 ${isCurrentChapterCompleted ? 'text-emerald-400' : 'text-gray-500'}`}
                    />
                    <span>{isCurrentChapterCompleted ? 'Chapter Mastered ✓' : 'Finish Chapter'}</span>
                  </button>
                </div>
              </div>

              <h1 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold text-white tracking-wide">
                {activeChapter.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
                {activeChapter.subtitle}
              </p>
            </div>

            {/* Executive Summary Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#121826] to-[#0c101a] border border-[#d47a37]/30 space-y-2">
              <span className="text-[10px] font-mono font-bold text-[#f8b179] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f8b179]" /> EXECUTIVE OVERVIEW &amp; STRATEGIC CONTEXT
              </span>
              <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed italic">
                "{activeChapter.summary}"
              </p>
            </div>

            {/* Core Chapter Lessons & Prose */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold font-mono uppercase text-gray-300 tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#d47a37]" /> Core Analytical Framework &amp; Lessons
              </h2>
              <div className="space-y-4 text-xs sm:text-sm text-[#cbd5e1] leading-7 font-['Plus_Jakarta_Sans']">
                {activeChapter.content.map((paragraph, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-4 rounded-xl bg-[#090b10] border border-[#161d2d] hover:border-[#252c3d] transition-colors leading-relaxed"
                  >
                    <p>{paragraph}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Formulas & Mathematical Equations */}
            {activeChapter.keyFormulas && activeChapter.keyFormulas.length > 0 && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#090d16] border border-[#d47a37]/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-[#f8b179] font-bold">
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    <span>Key Mathematical Formulations</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 uppercase">INSTITUTIONAL METRICS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeChapter.keyFormulas.map((f, fIdx) => (
                    <div key={fIdx} className="p-3 rounded-lg bg-[#04060a] border border-[#1f2638] space-y-1">
                      <div className="text-gray-400 text-[11px] font-sans font-semibold">{f.name}</div>
                      <div className="text-emerald-300 font-bold font-mono text-xs">{f.formula}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic SOP Checklist */}
            {activeChapter.checklist && activeChapter.checklist.length > 0 && (
              <div className="p-4 rounded-xl bg-[#07090f] border border-[#1f2638] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono uppercase text-cyan-300 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-cyan-400" /> Strategic Execution Checklist &amp; SOP
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {activeChapter.checklist.length} Protocols
                  </span>
                </div>

                <div className="space-y-2">
                  {activeChapter.checklist.map((item, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-2.5 rounded-lg bg-[#0b0f19] border border-[#151c2d] flex items-center gap-3 text-xs text-gray-300"
                    >
                      <div className="w-4 h-4 rounded border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Chapter Navigation */}
            <div className="p-4 rounded-xl bg-[#07090f] border border-[#1f2638] flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={activeChapterIndex <= 0}
                onClick={() => {
                  playClickSound();
                  setActiveChapterIndex((prev) => Math.max(0, prev - 1));
                  readingContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-lg bg-[#141824] hover:bg-[#1f2638] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-[#252c3d]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Chapter</span>
              </button>

              <span className="text-xs font-mono text-gray-400">
                Chapter <strong className="text-[#f8b179]">{activeChapterIndex + 1}</strong> of{' '}
                {categoryInfo.chapters.length}
              </span>

              <button
                type="button"
                disabled={activeChapterIndex >= categoryInfo.chapters.length - 1}
                onClick={() => {
                  playClickSound();
                  setActiveChapterIndex((prev) => Math.min(categoryInfo.chapters.length - 1, prev + 1));
                  readingContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-2 rounded-lg bg-[#141824] hover:bg-[#1f2638] disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-[#252c3d]"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
