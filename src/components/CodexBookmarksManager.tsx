import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryType } from '../types';
import {
  CodexBookmarkItem,
  getBookmarkedPages,
  removeBookmark,
  clearAllBookmarks,
} from '../utils/codexBookmarks';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import {
  Bookmark,
  BookOpen,
  Trash2,
  Search,
  ArrowRight,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface CodexBookmarksManagerProps {
  onNavigateToPage: (category: CategoryType, chapterId: string, pageNumber: number) => void;
  onBackToCodex: () => void;
  userEmail?: string;
}

export const CodexBookmarksManager: React.FC<CodexBookmarksManagerProps> = ({
  onNavigateToPage,
  onBackToCodex,
  userEmail,
}) => {
  const [bookmarks, setBookmarks] = useState<CodexBookmarkItem[]>(() => getBookmarkedPages(userEmail));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryType | 'all'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setBookmarks(getBookmarkedPages(userEmail));
    };
    window.addEventListener('lurl-bookmarks-updated', handleUpdate);
    return () => window.removeEventListener('lurl-bookmarks-updated', handleUpdate);
  }, [userEmail]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    removeBookmark(id, userEmail);
    showNotification('Bookmark removed from your vault.');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all your saved bookmarks?')) {
      playClickSound();
      clearAllBookmarks(userEmail);
      showNotification('All saved bookmarks cleared.');
    }
  };

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesCategory =
        selectedCategoryFilter === 'all' || b.category === selectedCategoryFilter;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.pageHeadline.toLowerCase().includes(q) ||
        b.chapterTitle.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        (b.analyticalLens && b.analyticalLens.toLowerCase().includes(q))
      );
    });
  }, [bookmarks, searchQuery, selectedCategoryFilter]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookmarks.length };
    bookmarks.forEach((b) => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    return counts;
  }, [bookmarks]);

  const categoryNames: Record<CategoryType, string> = {
    trading: '📈 Trading',
    dropshipping: '📦 Dropshipping',
    ecommerce: '🛒 Ecommerce',
    startup: '🏢 Real Estate & Startups',
    'skill-development': '🧠 50 Master Skills',
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#121826] via-[#171e2e] to-[#101422] border border-[#d47a37]/50 p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#252c3d]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#d47a37]/20 border border-[#d47a37]/50 flex items-center justify-center text-[#f8b179] shadow-lg">
              <Bookmark className="w-6 h-6 fill-[#f8b179]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5 text-xs text-[#9ca3af]">
                <span className="font-mono text-emerald-400 font-bold uppercase">PERSONAL VAULT</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{bookmarks.length} Saved Pages</span>
              </div>
              <h1 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white tracking-wide">
                Bookmarked Pages &amp; Strategic Excerpts
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {bookmarks.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToCodex}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Resume Reading Codex</span>
            </button>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
          Quickly access all bookmarked pages, quantitative derivations, and tactical chapters you saved while studying the Business Book Codex. Clicking any card below jumps you directly into that page in the reader.
        </p>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved headlines, lens or text..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090d16] border border-[#252c3d] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-[#d47a37]"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(['all', 'trading', 'dropshipping', 'ecommerce', 'startup', 'skill-development'] as const).map(
              (cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setSelectedCategoryFilter(cat);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#d47a37] text-white border-[#f8b179] shadow-sm'
                        : 'bg-[#090d16] text-[#9ca3af] hover:text-white border-[#1f2638]'
                    }`}
                  >
                    <span>{cat === 'all' ? 'All' : categoryNames[cat]}</span>
                    <span className="ml-1.5 text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-[#d47a37]/20 border border-[#d47a37] text-[#f8b179] text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
          <span>{notification}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Bookmarked Pages List */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookmarks.map((bookmark) => (
            <motion.div
              key={bookmark.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                playSuccessChime();
                onNavigateToPage(bookmark.category, bookmark.chapterId, bookmark.pageNumber);
              }}
              className="p-5 rounded-2xl bg-[#0c101a] border border-[#252c3d] hover:border-[#d47a37] shadow-xl hover:shadow-[0_8px_30px_rgba(212,122,55,0.2)] transition-all cursor-pointer flex flex-col justify-between group space-y-4"
            >
              <div>
                {/* Top Badge Ribbon */}
                <div className="flex items-center justify-between gap-2 mb-2 text-xs text-[#9ca3af]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#f8b179] font-bold">
                      CH.{bookmark.chapterNumber} · PAGE #{bookmark.pageNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-cyan-400 capitalize">
                      {categoryNames[bookmark.category] || bookmark.category}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleRemove(bookmark.id, e)}
                    className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Remove from saved bookmarks"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Headline & Chapter Title */}
                <h3 className="font-['Cinzel'] text-base font-bold text-white group-hover:text-[#f8b179] transition-colors leading-snug">
                  {bookmark.pageHeadline}
                </h3>
                <div className="text-xs text-[#9ca3af] font-mono mt-1">
                  From: <strong className="text-gray-200">{bookmark.chapterTitle}</strong>
                </div>

                {/* Excerpt */}
                <p className="text-xs text-[#cbd5e1] line-clamp-3 mt-2.5 leading-relaxed bg-[#07090f] p-3 rounded-xl border border-[#1f2638]">
                  "{bookmark.excerpt}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1f2638] text-xs">
                <span className="text-[11px] font-mono text-[#6b7280]">
                  Saved {new Date(bookmark.createdAt).toLocaleDateString()}
                </span>
                <span className="text-[#f8b179] group-hover:text-white font-bold flex items-center gap-1 transition-colors text-xs">
                  <span>Open Page #{bookmark.pageNumber}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#0c101a] border border-[#252c3d] text-center space-y-4">
          <Bookmark className="w-12 h-12 text-[#6b7280] mx-auto stroke-1" />
          <h3 className="text-base font-bold text-white font-['Cinzel']">
            No Bookmarked Pages Found
          </h3>
          <p className="text-xs text-[#9ca3af] max-w-sm mx-auto">
            {searchQuery
              ? 'No saved bookmarks match your search query.'
              : 'You have not bookmarked any pages yet. Click the "Bookmark Page" button on any page while reading the 500-page chapters in the Codex.'}
          </p>
          <button
            type="button"
            onClick={onBackToCodex}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] transition-all cursor-pointer shadow-md inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Explore Codex Chapters</span>
          </button>
        </div>
      )}
    </div>
  );
};
