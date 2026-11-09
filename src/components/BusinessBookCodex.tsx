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
import {
  getChapterUserNote,
  saveChapterUserNote,
  deleteChapterUserNote,
  countCategoryNotes,
} from '../utils/userNotesStorage';
import { PAGES_PER_CHAPTER, TOTAL_PAGES_PER_CATEGORY } from '../utils/chapterBookEngine';
import { InfiniteOnlineBookReader } from './InfiniteOnlineBookReader';
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
  FileText,
  PenLine,
  Save,
  Download,
  Trash2,
  X,
  PanelRightClose,
  PanelRightOpen,
  Copy,
  ExternalLink,
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

  // View Mode: Executive Chapter Guide vs. 9,000+ Page Infinite Book Reader
  const [viewMode, setViewMode] = useState<'chapter' | 'infinite-9000-reader'>('chapter');

  // User Notes Side Panel State
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem('lurl_codex_notes_open');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 1280;
    } catch {
      return true;
    }
  });

  const [noteContent, setNoteContent] = useState<string>('');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [categoryNotesCount, setCategoryNotesCount] = useState<number>(0);
  const [copiedExcerptToast, setCopiedExcerptToast] = useState<boolean>(false);

  const readingContainerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeChapter: CodexChapter =
    categoryInfo.chapters[activeChapterIndex] || categoryInfo.chapters[0];

  // Save notes open/closed preference
  const toggleNotesPanel = () => {
    playClickSound();
    setIsNotesOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lurl_codex_notes_open', String(next));
      } catch {}
      return next;
    });
  };

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

  // Load User Notes whenever active chapter, category, or user changes
  useEffect(() => {
    if (!activeChapter) return;
    const { noteText, updatedAt } = getChapterUserNote(categoryInfo.id, activeChapter.id, userEmail);
    setNoteContent(noteText);
    setLastSavedTimestamp(updatedAt);
    setCategoryNotesCount(countCategoryNotes(categoryInfo.id, userEmail));
  }, [activeChapter?.id, categoryInfo.id, userEmail]);

  // Listen for external notes updates (e.g. from background sync or other tabs)
  useEffect(() => {
    const handleNotesUpdate = (e: any) => {
      const detail = e.detail;
      if (detail && detail.category === categoryInfo.id) {
        if (detail.chapterId === activeChapter?.id) {
          setNoteContent(detail.noteText || '');
          setLastSavedTimestamp(detail.updatedAt || Date.now());
        }
        setCategoryNotesCount(countCategoryNotes(categoryInfo.id, userEmail));
      }
    };
    window.addEventListener('lurl-user-notes-updated', handleNotesUpdate);
    return () => window.removeEventListener('lurl-user-notes-updated', handleNotesUpdate);
  }, [categoryInfo.id, activeChapter?.id, userEmail]);

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
          setViewMode('chapter');
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

  // User Notes Handlers
  const handleNoteTextChange = (text: string) => {
    setNoteContent(text);
    setIsSaving(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      const res = saveChapterUserNote(
        categoryInfo.id,
        activeChapter.id,
        text,
        { chapterTitle: activeChapter.title, chapterNumber: activeChapter.number },
        userEmail
      );
      setLastSavedTimestamp(res.updatedAt);
      setIsSaving(false);
      setCategoryNotesCount(countCategoryNotes(categoryInfo.id, userEmail));
    }, 600);
  };

  const handleManualSaveNote = () => {
    playClickSound();
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    const res = saveChapterUserNote(
      categoryInfo.id,
      activeChapter.id,
      noteContent,
      { chapterTitle: activeChapter.title, chapterNumber: activeChapter.number },
      userEmail
    );
    setLastSavedTimestamp(res.updatedAt);
    setIsSaving(false);
    setCategoryNotesCount(countCategoryNotes(categoryInfo.id, userEmail));
    playSuccessChime();
    setBookmarkToast(`✓ Personal notes for Chapter ${activeChapter.number} saved!`);
    setTimeout(() => setBookmarkToast(null), 2500);
  };

  const handleInsertNoteChip = (snippet: string) => {
    playClickSound();
    const current = noteContent;
    const addition = current.trim() ? `\n\n${snippet}` : snippet;
    const updated = `${current}${addition}`;
    setNoteContent(updated);
    const res = saveChapterUserNote(
      categoryInfo.id,
      activeChapter.id,
      updated,
      { chapterTitle: activeChapter.title, chapterNumber: activeChapter.number },
      userEmail
    );
    setLastSavedTimestamp(res.updatedAt);
    setCategoryNotesCount(countCategoryNotes(categoryInfo.id, userEmail));
  };

  const handleCopyChapterExcerpt = () => {
    playClickSound();
    const excerptSnippet = `> "${activeChapter.summary}"\n> — Chapter ${activeChapter.number}: ${activeChapter.title}\n\n`;
    handleInsertNoteChip(excerptSnippet);
    setCopiedExcerptToast(true);
    setTimeout(() => setCopiedExcerptToast(false), 2000);
  };

  const handleDownloadNoteMarkdown = () => {
    playClickSound();
    const filename = `${categoryInfo.id}_Chapter_${activeChapter.number}_Personal_Notes.md`;
    const markdown = `# Chapter ${activeChapter.number}: ${activeChapter.title}
Domain: ${categoryInfo.title}
Subtitle: ${activeChapter.subtitle}
Summary: ${activeChapter.summary}
Updated: ${lastSavedTimestamp ? new Date(lastSavedTimestamp).toLocaleString() : new Date().toLocaleString()}

---

## Executive Personal Notes & Strategic Insights

${noteContent || '_No notes recorded yet._'}

---
*Generated by LURL Executive Codex Platform — Permanent Learning Vault*
`;
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearNote = () => {
    playClickSound();
    if (!noteContent.trim()) return;
    if (window.confirm(`Clear and delete all personal notes for Chapter ${activeChapter.number}?`)) {
      deleteChapterUserNote(categoryInfo.id, activeChapter.id, userEmail);
      setNoteContent('');
      setLastSavedTimestamp(null);
      setCategoryNotesCount(countCategoryNotes(categoryInfo.id, userEmail));
      setBookmarkToast(`Cleared notes for Chapter ${activeChapter.number}.`);
      setTimeout(() => setBookmarkToast(null), 2500);
    }
  };

  const isCurrentChapterCompleted = completedIds.includes(activeChapter.id);
  const isCurrentChapterSaved = bookmarkedKeys.has(`${categoryInfo.id}_${activeChapter.id}_p1`);
  const hasCurrentChapterNotes = Boolean(noteContent && noteContent.trim().length > 0);
  const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0;
  const charCount = noteContent.length;

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
            {/* 9,000+ Page Infinite Book Reader Toggle */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setViewMode((prev) => (prev === 'chapter' ? 'infinite-9000-reader' : 'chapter'));
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'infinite-9000-reader'
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400/40'
                  : 'bg-[#141824] hover:bg-[#1f2638] border-cyan-500/40 text-cyan-300 hover:text-white'
              }`}
              title="Launch the 9,000+ page per chapter live online encyclopedia"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {viewMode === 'infinite-9000-reader' ? 'Exit 9,000+ Reader' : '📖 9,000+ Page Codex Reader'}
              </span>
            </button>

            {/* User Notes Toggle Ribbon Button */}
            <button
              type="button"
              onClick={toggleNotesPanel}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isNotesOpen
                  ? 'bg-amber-500/20 border-amber-400/70 text-amber-300 shadow-md ring-1 ring-amber-400/30'
                  : 'bg-[#141824] hover:bg-[#1f2638] border-[#252c3d] text-gray-300 hover:text-white'
              }`}
              title="Toggle persistent chapter user notes side panel"
            >
              <PenLine className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Personal Notes ({categoryNotesCount})
              </span>
              {hasCurrentChapterNotes && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" title="Notes saved for this chapter" />
              )}
            </button>

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

        {/* 5 Categories Bar - All with 15 chapters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { id: 'trading', icon: '📈', label: 'Precision Trading', sub: 'Institutional Order Flow' },
            { id: 'dropshipping', icon: '📦', label: 'High-Ticket DTC', sub: 'High-Ticket Brand Scaling' },
            { id: 'ecommerce', icon: '🛒', label: 'D2C Ecommerce', sub: 'Supply Chain & Retention' },
            { id: 'startup', icon: '🏢', label: 'Startups & CRE', sub: 'Venture & Asset Mastery' },
            { id: 'skill-development', icon: '🧠', label: '50 Master Skills', sub: 'Strategic Execution' },
          ].map((c) => {
            const isSelected = categoryInfo.id === c.id;
            const chCount = CATEGORIES_DATA[c.id as CategoryType]?.chapters?.length || 15;
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
                  <span className="font-mono text-[10px] text-[#f8b179] font-bold">{chCount} Chapters</span>
                </div>
                <div className="text-xs font-bold truncate mt-1 text-white">{c.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: 9,000+ Page Infinite Book Reader */}
      {viewMode === 'infinite-9000-reader' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090d16] border border-[#252c3d]">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setViewMode('chapter');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] font-bold text-xs flex items-center gap-1.5 border border-[#d47a37]/40 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>← Return to Chapter {activeChapter.number} Executive Curriculum</span>
            </button>
            <div className="text-xs font-mono text-gray-400 hidden sm:block">
              Currently navigating Chapter <strong className="text-white">{activeChapter.number}</strong> (9,500 Pages per chapter · 142,500 domain pages)
            </div>
          </div>
          <InfiniteOnlineBookReader
            category={categoryInfo.id}
            categoryTitle={categoryInfo.title}
            onAskChatbot={onAskChatbot || (() => {})}
            initialPage={activeChapterIndex * PAGES_PER_CHAPTER + 1}
            onBackToCodex={() => setViewMode('chapter')}
            userEmail={userEmail}
          />
        </div>
      ) : (
        /* VIEW MODE 2: Multi-Column Codex Layout (TOC + Chapter Content + Persistent User Notes Panel) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Chapters Table of Contents (15 full chapters) */}
          <div className={`${isNotesOpen ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-4 transition-all duration-300`}>
            <div className="rounded-2xl bg-[#0d101a] border border-[#252c3d] p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1f2638]">
                <h3 className="font-['Cinzel'] text-sm font-bold tracking-wider text-[#f8b179] uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Chapters Curriculum
                </h3>
                <span className="text-xs text-[#9ca3af] font-mono">
                  {completedIds.length}/{categoryInfo.chapters.length} Done
                </span>
              </div>

              {/* Chapters List (Numbered 01 to 15) */}
              <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
                {categoryInfo.chapters.map((ch, idx) => {
                  const isSelected = idx === activeChapterIndex;
                  const isDone = completedIds.includes(ch.id);
                  const { noteText: itemNote } = getChapterUserNote(categoryInfo.id, ch.id, userEmail);
                  const hasNote = Boolean(itemNote && itemNote.trim().length > 0);

                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        playClickSound();
                        setActiveChapterIndex(idx);
                        readingContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#d47a37]/25 to-[#b85d19]/15 border-[#f8b179] shadow-md'
                          : 'bg-[#090b10] hover:bg-[#141a29] border-[#1a2133] hover:border-[#252c3d]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 pr-2">
                        <span
                          className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
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
                          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                            <span>{ch.readTime}</span>
                            {hasNote && (
                              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                • Note
                              </span>
                            )}
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
                        title={isDone ? 'Mastered' : 'Mark complete'}
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

              {/* 9,000+ Page Notice */}
              <div className="p-3 rounded-xl bg-[#090d16] border border-[#1f2638] text-[11px] text-gray-400 space-y-1">
                <div className="text-[#f8b179] font-bold flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-[#d47a37]" /> 9,000+ Pages Available
                </div>
                <p className="text-[10px] leading-relaxed text-gray-400">
                  Each chapter contains 9,500 dedicated deep-dive encyclopedia pages with formulas, algorithmic proofs, and case studies.
                </p>
              </div>
            </div>
          </div>

          {/* Center Column: Full Chapter Content */}
          <div
            className={`${
              isNotesOpen ? 'lg:col-span-5 xl:col-span-5' : 'lg:col-span-8'
            } space-y-6 transition-all duration-300`}
            ref={readingContainerRef}
          >
            <div className="rounded-2xl bg-[#0d101a] border border-[#252c3d] p-5 sm:p-7 shadow-2xl space-y-6">
              {/* Chapter Header Banner */}
              <div className="space-y-3 pb-6 border-b border-[#1f2638]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40">
                      CHAPTER {activeChapter.number}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{activeChapter.readTime}</span>
                    <span className="text-xs text-emerald-400 font-mono">
                      Time: {Math.floor(activeReadingSeconds / 60)}m {(activeReadingSeconds % 60).toString().padStart(2, '0')}s
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Toggle User Notes Panel */}
                    <button
                      type="button"
                      onClick={toggleNotesPanel}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                        isNotesOpen
                          ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-sm'
                          : 'bg-[#141824] text-gray-300 hover:text-white border-[#252c3d] hover:border-amber-400/50'
                      }`}
                      title={isNotesOpen ? 'Close User Notes panel' : 'Open User Notes panel'}
                    >
                      <PenLine className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isNotesOpen ? 'Hide Notes' : 'Personal Notes'}</span>
                      {hasCurrentChapterNotes && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>

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
                      <span>{isTtsSpeaking ? 'Stop' : 'Listen'}</span>
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
                      <span>{isCurrentChapterCompleted ? 'Mastered ✓' : 'Finish'}</span>
                    </button>
                  </div>
                </div>

                <h1 className="font-['Cinzel'] text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wide">
                  {activeChapter.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
                  {activeChapter.subtitle}
                </p>
              </div>

              {/* Executive Summary Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#121826] to-[#0c101a] border border-[#d47a37]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#f8b179] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#f8b179]" /> EXECUTIVE OVERVIEW &amp; STRATEGIC CONTEXT
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyChapterExcerpt}
                    className="text-[10px] font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                    title="Copy summary into your personal notes"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedExcerptToast ? 'Copied to Notes ✓' : 'Quote to Notes'}</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed italic">
                  "{activeChapter.summary}"
                </p>
              </div>

              {/* 9,000+ Page Direct Jump Callout */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0d1726] to-[#090e18] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Deep-Dive 9,000+ Pages Encyclopedia</span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Jump into Chapter {activeChapter.number}'s 9,500 dedicated interactive book pages with real-time proofs.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setViewMode('infinite-9000-reader');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <span>Open 9,000+ Page Reader</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
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
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-[11px] font-sans font-semibold">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => handleInsertNoteChip(`- Formula (${f.name}): \`${f.formula}\``)}
                            className="text-[10px] text-amber-400 hover:text-white"
                            title="Add to Notes"
                          >
                            + Note
                          </button>
                        </div>
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
                        className="p-2.5 rounded-lg bg-[#0b0f19] border border-[#151c2d] flex items-center justify-between gap-3 text-xs text-gray-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                          <span>{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleInsertNoteChip(`[ ] SOP Action: ${item}`)}
                          className="text-[10px] font-mono text-cyan-400 hover:text-white shrink-0"
                          title="Add SOP item to your notes"
                        >
                          + Note
                        </button>
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

                <span className="text-xs font-mono text-gray-400 text-center">
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

          {/* Right Column: Persistent 'User Notes' Side Panel */}
          {isNotesOpen && (
            <div className="lg:col-span-4 xl:col-span-4 space-y-4">
              <div className="rounded-2xl bg-[#0d101a] border border-amber-500/40 p-4 sm:p-5 shadow-2xl space-y-4 sticky top-24">
                {/* Notes Header Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2638]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
                      <PenLine className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-['Cinzel'] text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wide">
                        Chapter {activeChapter.number} Notes
                      </h3>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {isSaving ? (
                          <span className="text-amber-400 font-bold animate-pulse">Autosaving...</span>
                        ) : lastSavedTimestamp ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Saved to Vault
                          </span>
                        ) : (
                          <span>Personal insights &amp; formulas</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={toggleNotesPanel}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2133] transition-colors"
                      title="Collapse Notes Panel"
                    >
                      <PanelRightClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Insert Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">
                    Quick Insert Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInsertNoteChip('- Key Takeaway: ')}
                      className="px-2.5 py-1 rounded-lg bg-[#141926] hover:bg-[#1f273b] border border-[#263148] text-[11px] font-mono text-amber-300 cursor-pointer transition-colors"
                    >
                      + Takeaway
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertNoteChip('- Mathematical Metric: ')}
                      className="px-2.5 py-1 rounded-lg bg-[#141926] hover:bg-[#1f273b] border border-[#263148] text-[11px] font-mono text-emerald-300 cursor-pointer transition-colors"
                    >
                      + Formula
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertNoteChip('[ ] Action Protocol: ')}
                      className="px-2.5 py-1 rounded-lg bg-[#141926] hover:bg-[#1f273b] border border-[#263148] text-[11px] font-mono text-cyan-300 cursor-pointer transition-colors"
                    >
                      + Action Step
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyChapterExcerpt}
                      className="px-2.5 py-1 rounded-lg bg-[#141926] hover:bg-[#1f273b] border border-[#263148] text-[11px] font-mono text-[#f8b179] cursor-pointer transition-colors flex items-center gap-1"
                      title="Quote chapter summary into notes"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Quote Chapter</span>
                    </button>
                  </div>
                </div>

                {/* The Persistent Text Area */}
                <div className="space-y-2">
                  <textarea
                    value={noteContent}
                    onChange={(e) => handleNoteTextChange(e.target.value)}
                    placeholder={`Write your personal insights, trading plans, mathematical derivations, or execution notes for Chapter ${activeChapter.number} here...\n\nAll notes persist automatically and sync with your Learning Vault.`}
                    rows={13}
                    className="w-full p-3.5 rounded-xl bg-[#080b12] border border-[#232c40] focus:border-amber-400/80 text-white text-xs sm:text-sm font-sans leading-relaxed outline-none transition-all placeholder:text-gray-600 resize-y"
                  />

                  {/* Character, Word & Status Count */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 px-1">
                    <span>
                      {wordCount} words · {charCount} chars
                    </span>
                    <span>
                      {hasCurrentChapterNotes ? (
                        <span className="text-emerald-400 font-bold">● Active Chapter Note</span>
                      ) : (
                        <span>Drafting</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div className="pt-2 border-t border-[#1f2638] flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleManualSaveNote}
                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                      title="Force save note now"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadNoteMarkdown}
                      disabled={!noteContent.trim()}
                      className="px-2.5 py-1.5 rounded-lg bg-[#141926] hover:bg-[#1f273b] disabled:opacity-40 text-gray-300 hover:text-white border border-[#263148] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="Download as Markdown (.md)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.MD</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearNote}
                    disabled={!noteContent.trim()}
                    className="px-2.5 py-1.5 rounded-lg bg-[#141926] hover:bg-rose-950/40 disabled:opacity-40 text-gray-400 hover:text-rose-300 border border-[#263148] hover:border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Clear this chapter's note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>

                {/* Vault Sync Info Footer */}
                <div className="p-2.5 rounded-xl bg-[#07090f] border border-[#1a2133] text-[10px] font-mono text-gray-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Vault Sync Enabled</span>
                  </span>
                  <span>{categoryNotesCount} chapters with notes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
