import React from 'react';
import { BookOpen, Bookmark, Layers, Flame, Bot, CandlestickChart } from 'lucide-react';
import { ActiveWorkspaceTab, AppStage } from '../types';
import { playClickSound } from '../utils/soundEffects';

interface MobileAppNavBarProps {
  stage?: AppStage;
  activeTab?: ActiveWorkspaceTab;
  setActiveTab?: (tab: ActiveWorkspaceTab) => void;
  selectSubTab?: 'home' | 'categories';
  bookmarksCount?: number;
  onNavigateHome?: () => void;
  onNavigateCategories?: () => void;
  onNavigateCodex?: () => void;
  onNavigateSkillsBook?: () => void;
  onNavigateTrading?: () => void;
  onNavigateChatbot?: () => void;
  onNavigateThoughtsFuse?: () => void;
  onNavigatePerformance?: () => void;
  onNavigateBookmarks?: () => void;
}

export const MobileAppNavBar: React.FC<MobileAppNavBarProps> = ({
  stage = 'application',
  activeTab = 'codex',
  setActiveTab,
  selectSubTab = 'home',
  bookmarksCount = 0,
  onNavigateHome,
  onNavigateCategories,
  onNavigateCodex,
  onNavigateSkillsBook,
  onNavigateTrading,
  onNavigateChatbot,
  onNavigateThoughtsFuse,
  onNavigatePerformance,
  onNavigateBookmarks,
}) => {
  const isSelectionActive = stage === 'select';

  return (
    <nav
      aria-label="Bottom Full Quick Navigation Menu"
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw] px-2 sm:px-3 py-1.5 sm:py-2 rounded-2xl bg-[#0b0f19]/95 backdrop-blur-xl border border-[#d47a37]/60 shadow-[0_12px_40px_rgba(0,0,0,0.9)] flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar"
    >
      {/* 1. Selection Process */}
      <button
        type="button"
        id="navbar-menu-selection"
        onClick={() => {
          playClickSound();
          if (onNavigateCategories) onNavigateCategories();
          else if (onNavigateHome) onNavigateHome();
        }}
        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
          isSelectionActive
            ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md ring-1 ring-[#f8b179]/40'
            : 'text-gray-400 hover:text-white hover:bg-[#141a29]'
        }`}
        title="Selection Process & Track Picker"
      >
        <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f8b179] shrink-0" />
        <span className="text-[11px] sm:text-xs">Selection</span>
      </button>

      {/* 2. Code X (Course Codex) */}
      <button
        type="button"
        id="navbar-menu-codex"
        onClick={() => {
          playClickSound();
          if (onNavigateCodex) onNavigateCodex();
          else if (setActiveTab) setActiveTab('codex');
        }}
        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
          !isSelectionActive && activeTab === 'codex'
            ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md ring-1 ring-[#f8b179]/40'
            : 'text-gray-400 hover:text-white hover:bg-[#141a29]'
        }`}
        title="Executive Code X (Course Codex)"
      >
        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-[11px] sm:text-xs">Code X</span>
      </button>

      {/* 3. Saved Bookmarks Vault */}
      <button
        type="button"
        id="navbar-menu-saved"
        onClick={() => {
          playClickSound();
          if (onNavigateBookmarks) onNavigateBookmarks();
          else if (setActiveTab) setActiveTab('bookmarks');
        }}
        className={`relative px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
          !isSelectionActive && activeTab === 'bookmarks'
            ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md ring-1 ring-[#f8b179]/40'
            : 'text-gray-400 hover:text-white hover:bg-[#141a29]'
        }`}
        title="Saved Bookmarks & Vault"
      >
        <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-[11px] sm:text-xs">Saved</span>
        {bookmarksCount > 0 && (
          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] sm:text-[10px] font-bold font-mono flex items-center justify-center shrink-0">
            {bookmarksCount}
          </span>
        )}
      </button>

      {/* 4. AI Fuse */}
      <button
        type="button"
        id="navbar-menu-fuse"
        onClick={() => {
          playClickSound();
          if (onNavigateThoughtsFuse) onNavigateThoughtsFuse();
          else if (setActiveTab) setActiveTab('share-thoughts');
        }}
        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
          !isSelectionActive && activeTab === 'share-thoughts'
            ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md ring-1 ring-[#f8b179]/40'
            : 'text-gray-400 hover:text-white hover:bg-[#141a29]'
        }`}
        title="AI Fuse Community & Strategic Market Thoughts"
      >
        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
        <span className="text-[11px] sm:text-xs">AI Fuse</span>
      </button>

      {/* 5. AI Chatbot */}
      <button
        type="button"
        id="navbar-menu-chatbot"
        onClick={() => {
          playClickSound();
          if (onNavigateChatbot) onNavigateChatbot();
          else if (setActiveTab) setActiveTab('ai-chat');
        }}
        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
          !isSelectionActive && activeTab === 'ai-chat'
            ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md ring-1 ring-[#f8b179]/40'
            : 'text-gray-400 hover:text-white hover:bg-[#141a29]'
        }`}
        title="Athena AI Executive Chatbot Copilot"
      >
        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
        <span className="text-[11px] sm:text-xs">AI Chatbot</span>
      </button>

      {/* 6. Trading (Bitcoin Simulated Technical Analysis & Demo) */}
      <button
        type="button"
        id="navbar-menu-trading"
        onClick={() => {
          playClickSound();
          if (onNavigateTrading) onNavigateTrading();
          else if (setActiveTab) setActiveTab('demo-trading');
        }}
        className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
          !isSelectionActive && (activeTab === 'demo-trading' || activeTab === 'skills-book')
            ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md ring-1 ring-[#f8b179]/40'
            : 'text-gray-400 hover:text-white hover:bg-[#141a29]'
        }`}
        title="Bitcoin Technical Analysis & Demo Trading"
      >
        <CandlestickChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
        <span className="text-[11px] sm:text-xs">Trading</span>
      </button>
    </nav>
  );
};
