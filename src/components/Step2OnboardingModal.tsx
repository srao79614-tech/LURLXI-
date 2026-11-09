import React, { useState } from 'react';
import { CategoryType, UserProfile, UserSession } from '../types';
import { Sparkles, Check, ArrowRight, ShieldCheck, TrendingUp, ShoppingBag, Rocket, Brain, Upload, X } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

interface Step2OnboardingModalProps {
  isOpen: boolean;
  userSession: UserSession | null;
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

export const Step2OnboardingModal: React.FC<Step2OnboardingModalProps> = ({
  isOpen,
  userSession,
  initialProfile,
  onComplete,
  onClose,
}) => {
  const [name, setName] = useState(initialProfile.name || userSession?.name || 'Executive Founder');
  const [age, setAge] = useState(initialProfile.age || 26);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(
    initialProfile.selectedCategory || 'trading'
  );
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl || userSession?.profile?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Synthesized Web Audio Netflix-style Bass Drop
  const playNetflixBassDrop = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch (e) {}
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 256, 0.85);
      if (compressed) {
        setAvatarUrl(compressed);
      }
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);

    // Play Netflix-style intro sound if first time
    if (!localStorage.getItem('lurl_hasSeenIntro')) {
      playNetflixBassDrop();
      localStorage.setItem('lurl_hasSeenIntro', 'true');
    }

    const emailCandidate = (userSession?.email || initialProfile.email || 'srao79614@gmail.com').trim().toLowerCase();
    const isGmailVip = Boolean(emailCandidate.endsWith('@gmail.com'));

    const updated: UserProfile = {
      ...initialProfile,
      email: emailCandidate,
      name: name.trim() || 'Executive Founder',
      age: Number(age) || 26,
      selectedCategory,
      avatarUrl,
      isVip: true,
      role: isGmailVip ? 'VIP Executive Founder' : 'Executive Leader',
      hasEnteredWebsite: true,
      savedStage: 'application',
    };

    // Complete onboarding and immediately advance to the dashboard!
    setIsSaving(false);
    onComplete(updated);
  };

  const handleDismiss = () => {
    if (onClose) {
      onClose();
    } else {
      // Auto-submit current values to advance to dashboard
      const emailCandidate = (userSession?.email || initialProfile.email || 'srao79614@gmail.com').trim().toLowerCase();
      onComplete({
        ...initialProfile,
        email: emailCandidate,
        name: name.trim() || 'Executive Founder',
        age: Number(age) || 26,
        selectedCategory,
        avatarUrl,
        isVip: true,
        hasEnteredWebsite: true,
        savedStage: 'application',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0b0e17] border border-[#d47a37]/50 shadow-[0_20px_70px_rgba(212,122,55,0.25)] p-6 sm:p-8 overflow-hidden text-left">
        {/* Close / Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2233] transition-colors cursor-pointer z-20"
          title="Continue to Dashboard"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-gradient-to-b from-[#d47a37]/20 via-[#b85d19]/5 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d47a37]/15 border border-[#d47a37]/40 text-[#f8b179] text-xs font-mono font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#f8b179]" />
              <span>STEP 2 OF 2 • EXECUTIVE SETUP</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity Verified</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-['Cinzel'] tracking-tight text-white mb-1">
            Configure Autonomous Profile
          </h2>
          <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed mb-6">
            Customize your executive identity and designate your core focus discipline to unlock the operational codex.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex Vance"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121724] border border-[#232c40] text-white text-sm focus:border-[#d47a37] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Executive Age
                </label>
                <input
                  type="number"
                  min="16"
                  max="99"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#121724] border border-[#232c40] text-white text-sm focus:border-[#d47a37] focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* Profile Avatar Upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Profile Icon / Avatar
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1a2233] border border-[#252f44] flex items-center justify-center overflow-hidden shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-[#f8b179] text-sm">
                      {(name || 'LX').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#141b2a] hover:bg-[#1a2336] border border-[#252f44] text-xs font-semibold text-gray-300 hover:text-white cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-[#f8b179]" />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </label>
                <span className="text-[11px] text-gray-500">Square PNG or JPG recommended</span>
              </div>
            </div>

            {/* Core Category Selection (Pick 1) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Core Discipline Category (Must Pick One)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Trading */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('trading')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    selectedCategory === 'trading'
                      ? 'bg-[#d47a37]/15 border-[#d47a37] shadow-[0_0_15px_rgba(212,122,55,0.2)]'
                      : 'bg-[#121724] border-[#222a3d] hover:border-gray-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${selectedCategory === 'trading' ? 'bg-[#d47a37]/25 text-[#f8b179]' : 'bg-[#181f30] text-gray-400'}`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Trading AI</span>
                      {selectedCategory === 'trading' && <Check className="w-3.5 h-3.5 text-[#f8b179]" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">Order book flow & algorithmic alpha</p>
                  </div>
                </button>

                {/* 2. Dropshipping */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('dropshipping')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    selectedCategory === 'dropshipping'
                      ? 'bg-[#d47a37]/15 border-[#d47a37] shadow-[0_0_15px_rgba(212,122,55,0.2)]'
                      : 'bg-[#121724] border-[#222a3d] hover:border-gray-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${selectedCategory === 'dropshipping' ? 'bg-[#d47a37]/25 text-[#f8b179]' : 'bg-[#181f30] text-gray-400'}`}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Dropshipping AI</span>
                      {selectedCategory === 'dropshipping' && <Check className="w-3.5 h-3.5 text-[#f8b179]" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">Sub-48h supplier routing & scaling</p>
                  </div>
                </button>

                {/* 3. Startups */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('startup')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    selectedCategory === 'startup'
                      ? 'bg-[#d47a37]/15 border-[#d47a37] shadow-[0_0_15px_rgba(212,122,55,0.2)]'
                      : 'bg-[#121724] border-[#222a3d] hover:border-gray-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${selectedCategory === 'startup' ? 'bg-[#d47a37]/25 text-[#f8b179]' : 'bg-[#181f30] text-gray-400'}`}>
                    <Rocket className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Startups AI</span>
                      {selectedCategory === 'startup' && <Check className="w-3.5 h-3.5 text-[#f8b179]" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">Micro-SaaS & multi-agent systems</p>
                  </div>
                </button>

                {/* 4. Skill Development */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('skill-development')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    selectedCategory === 'skill-development'
                      ? 'bg-[#d47a37]/15 border-[#d47a37] shadow-[0_0_15px_rgba(212,122,55,0.2)]'
                      : 'bg-[#121724] border-[#222a3d] hover:border-gray-600'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${selectedCategory === 'skill-development' ? 'bg-[#d47a37]/25 text-[#f8b179]' : 'bg-[#181f30] text-gray-400'}`}>
                    <Brain className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Skill Mastery AI</span>
                      {selectedCategory === 'skill-development' && <Check className="w-3.5 h-3.5 text-[#f8b179]" />}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">Executive cognitive engineering</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full mt-4 py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-[#d47a37] via-[#e28741] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] disabled:opacity-60 cursor-pointer shadow-[0_10px_30px_rgba(212,122,55,0.35)] flex items-center justify-center gap-2 transition-all"
            >
              <span>{isSaving ? 'Saving Profile...' : 'Save & Continue to Dashboard'}</span>
              {!isSaving && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
