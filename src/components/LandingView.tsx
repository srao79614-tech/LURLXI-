import React from 'react';
import { motion } from 'motion/react';
import { ThreeDLogo } from './ThreeDLogo';
import { playNetflixIntroSound, playClickSound } from '../utils/soundEffects';
import { UserSession, UserProfile } from '../types';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bot,
  ShoppingBag,
  Rocket,
  ShieldCheck,
  Crown,
  Volume2,
  BarChart3,
  BookOpen,
  Mic,
  FileCode2,
  User,
  Edit3,
  SlidersHorizontal,
} from 'lucide-react';

interface LandingViewProps {
  onEnterSelection: () => void;
  onOpenAuth: () => void;
  onOpenPerformance: () => void;
  onOpenStandaloneDownload: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  userSession: UserSession | null;
  userProfile?: UserProfile;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onEnterSelection,
  onOpenAuth,
  onOpenPerformance,
  onOpenStandaloneDownload,
  onOpenProfile,
  onOpenSettings,
  userSession,
  userProfile,
}) => {
  const isVerified = Boolean(userSession?.isVerified);

  const handleEnter = () => {
    if (!isVerified) {
      playClickSound();
      onOpenAuth();
      return;
    }
    // For first-time verification, ensure age profile is completed
    const cleanEmail = userSession?.email?.toLowerCase().trim();
    const hasAgeProfile = cleanEmail && (
      localStorage.getItem(`lurl_age_profile_done_${cleanEmail}`) === 'true' ||
      Boolean(userProfile?.age && Number(userProfile.age) >= 18)
    );
    if (!hasAgeProfile) {
      playClickSound();
      onOpenAuth();
      return;
    }
    playClickSound();
    onEnterSelection();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 flex flex-col items-center text-center animate-in fade-in duration-300">
      {/* 3D Bronze Emblem with interactive lighting */}
      <div className="relative mb-6">
        <ThreeDLogo size="hero" showText={true} interactive={true} />
      </div>

      {/* Main Headline */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d47a37]/15 text-[#f8b179] text-xs font-semibold border border-[#d47a37]/30 mb-4">
        <Sparkles className="w-3.5 h-3.5" />{' '}
        {isVerified
          ? 'Step 1 Complete: Gmail ID Verified ✓ • Step 2: Complete Age Profile & Open Dashboard'
          : 'Step 1 of 2: Verify Your Gmail ID First (Dashboard & Navigator Tabs Unlock After Verification)'}
      </div>

      <h1 className="font-['Cinzel'] text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-wide max-w-4xl leading-tight">
        Autonomous Business Intelligence & Operational Codex
      </h1>

      <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#9ca3af] max-w-2xl leading-relaxed">
        The definitive operating system for <strong className="text-white">Precision Trading</strong>, <strong className="text-white">AI Dropshipping</strong>, <strong className="text-white">Enterprise E-Commerce</strong>, and <strong className="text-white">AI Startups</strong>. Integrated with Google Gemini 3.8 Flash voice AI and personal performance telemetry.
      </p>

      {/* Primary Action Buttons: Strict 2-Step Gate (1. Verify Gmail ID -> 2. Enter Platform) */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl">
        {!isVerified ? (
          <button
            type="button"
            id="landing-login-btn"
            onClick={onOpenAuth}
            className="w-full py-4 px-8 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#d47a37] via-[#e08a46] to-[#b85d19] hover:from-[#e59350] hover:to-[#a2480f] shadow-[0_10px_35px_rgba(212,122,55,0.4)] flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            <ShieldCheck className="w-5 h-5 text-amber-200 animate-pulse" />
            <span>Step 1: Verify Gmail ID</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <>
            <button
              type="button"
              id="landing-enter-platform-btn"
              onClick={handleEnter}
              className="w-full py-4 px-8 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 via-[#d47a37] to-[#b85d19] hover:from-emerald-500 hover:to-[#a2480f] shadow-[0_10px_35px_rgba(16,185,129,0.35)] flex items-center justify-center gap-3 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Volume2 className="w-4 h-4 text-amber-200 animate-pulse" />
              <span>Step 2: Enter Platform & Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="landing-switch-gmail-btn"
              onClick={() => {
                playClickSound();
                onOpenAuth();
              }}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl text-sm font-semibold text-[#f8b179] bg-[#121622] hover:bg-[#1a2130] border border-[#d47a37]/40 shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4 text-[#34d399]" />
              <span>Switch Gmail ID</span>
            </button>
          </>
        )}
      </div>

      {/* App Profile Status Capsule - ONLY shown after Gmail Verification */}
      {isVerified && userProfile && (
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-3 py-2 px-4 rounded-full bg-[#10131d] border border-[#252c3d] text-xs shadow-sm">
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            className="w-5 h-5 rounded-full object-cover border border-[#d47a37] shrink-0 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <span className="text-white font-bold">{userProfile.name}</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
            PERMANENT PROFILE SAVED ✓
          </span>
          <span className="text-[#6b7280]">•</span>
          <span className="text-[#9ca3af]">Age {userProfile.age}</span>
          {userProfile.profession && (
            <>
              <span className="text-[#6b7280]">•</span>
              <span className="text-[#cbd5e1]">{userProfile.profession}</span>
            </>
          )}
          <span className="text-[#6b7280]">•</span>
          <span className="text-[#f8b179] capitalize">{userProfile.selectedCategory}</span>
          <span className="text-[#6b7280]">•</span>
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-[11px] font-bold text-[#cbd5e1] hover:text-[#f8b179] underline cursor-pointer flex items-center gap-1"
          >
            <SlidersHorizontal className="w-2.5 h-2.5 text-[#f8b179]" />
            <span>Settings</span>
          </button>
          <span className="text-[#6b7280]">•</span>
          <button
            type="button"
            onClick={onOpenProfile}
            className="text-[11px] font-bold text-[#f8b179] hover:text-white underline cursor-pointer"
          >
            Edit & Save Profile
          </button>
        </div>
      )}

      {/* Feature Badges Showcase */}
      <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-5xl">
        <div className="p-5 rounded-xl bg-[#0f131d]/80 border border-[#252c3d] text-left">
          <div className="mb-3.5">
            <TrendingUp className="w-6 h-6 text-[#f8b179]" />
          </div>
          <h4 className="font-['Cinzel'] text-sm font-bold text-white">Precision Trading</h4>
          <p className="text-[11px] text-[#9ca3af] mt-1">Wyckoff accumulation, order blocks, and Kelly Criterion risk sizing.</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f131d]/80 border border-[#252c3d] text-left">
          <div className="mb-3.5">
            <Bot className="w-6 h-6 text-[#f8b179]" />
          </div>
          <h4 className="font-['Cinzel'] text-sm font-bold text-white">AI Dropshipping</h4>
          <p className="text-[11px] text-[#9ca3af] mt-1">Algorithmic product discovery, 3s viral hooks, and sub-48h dispatch.</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f131d]/80 border border-[#252c3d] text-left">
          <div className="mb-3.5">
            <ShoppingBag className="w-6 h-6 text-[#f8b179]" />
          </div>
          <h4 className="font-['Cinzel'] text-sm font-bold text-white">Brand E-Commerce</h4>
          <p className="text-[11px] text-[#9ca3af] mt-1">CM2 unit economics, zero customer churn, and 90-day LTV compounding.</p>
        </div>

        <div className="p-5 rounded-xl bg-[#0f131d]/80 border border-[#252c3d] text-left">
          <div className="mb-3.5">
            <Rocket className="w-6 h-6 text-[#f8b179]" />
          </div>
          <h4 className="font-['Cinzel'] text-sm font-bold text-white">Autonomous Startups</h4>
          <p className="text-[11px] text-[#9ca3af] mt-1">Proprietary vector memory moats, venture term sheets, and Rule of 40.</p>
        </div>
      </div>

      {/* Quick Access Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#9ca3af]">
        <span className="flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-[#f8b179]" /> Bidirectional Voice Chat & Doubt Solver
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-[#34d399]" /> Permanent Learning & Performance History
        </span>
        <span>•</span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> 100% Online Infinite Knowledge Book (∞ Pages)
        </span>
      </div>
    </div>
  );
};
