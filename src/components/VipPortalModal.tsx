import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Crown,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Home,
  Layers,
  BookOpen,
  CandlestickChart,
  BarChart3,
  X,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { VipSettings, UserSession } from '../types';
import { maskEmail, isPrivilegedAdminEmail, MASTER_VIP_PASSWORD } from '../utils/maskEmail';
import { playClickSound } from '../utils/soundEffects';

interface VipPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession | null;
  onSaveSettings: (settings: VipSettings) => void;
  onNavigateBack?: (destination?: 'home' | 'categories' | 'codex' | 'trading' | 'performance') => void;
  onOpenVipChatBox?: () => void;
}

export const VipPortalModal: React.FC<VipPortalModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onSaveSettings,
  onNavigateBack,
  onOpenVipChatBox,
}) => {
  const [settings, setSettings] = useState<VipSettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('lurl_vip_settings_v1');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return {
      platformName: 'LURL Executive Core',
      tradingRiskCeiling: '1.5% Max Daily Drawdown',
      dropshippingAutoFulfill: 'Enabled (Sub-48h AI Dispatch)',
      ecommerceRetentionTarget: '38% 60-day Repeat Rate',
      startupMoatMultipliers: 'Proprietary Vector Memory + Zero Marginal Inference',
      executiveNotes:
        'Private alpha unlocked for authorized proprietor. All systems calibrated for maximum autonomous business conversion.',
    };
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [vipEmailInput, setVipEmailInput] = useState('');
  const [vipPasscode, setVipPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isUnlockedWithPasscode, setIsUnlockedWithPasscode] = useState(false);
  const [isCrownHovered, setIsCrownHovered] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPasscodeError(null);
    setVipEmailInput('');
    setVipPasscode('');
    fetch('/api/vip/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data?.settings) {
          setSettings(data.settings);
          try {
            localStorage.setItem('lurl_vip_settings_v1', JSON.stringify(data.settings));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const isPrivileged = isPrivilegedAdminEmail(userSession?.email) || isUnlockedWithPasscode;

  const isAuthorized = Boolean(
    isUnlockedWithPasscode || (userSession?.isVip && isPrivilegedAdminEmail(userSession?.email))
  );

  const handleReturnToPlatform = (destination?: 'home' | 'categories' | 'codex' | 'trading' | 'performance') => {
    playClickSound();
    if (onNavigateBack) {
      onNavigateBack(destination);
    } else {
      onClose();
    }
  };

  const handleUnlockWithPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);

    const enteredEmail = vipEmailInput.trim().toLowerCase();
    const enteredPasscode = vipPasscode.trim();

    if (!enteredEmail) {
      setPasscodeError('Please enter your authorized VIP Gmail ID in the blank.');
      return;
    }
    if (!enteredPasscode) {
      setPasscodeError('Please enter your Secret VIP Passcode in the blank.');
      return;
    }

    const isEmailVip = isPrivilegedAdminEmail(enteredEmail);
    const isPasscodeCorrect = enteredPasscode === MASTER_VIP_PASSWORD;

    if (!isEmailVip || !isPasscodeCorrect) {
      setPasscodeError('Access Restricted: Invalid VIP credentials. Authorization is strictly private and secret.');
      return;
    }

    setIsUnlockedWithPasscode(true);
    setVipPasscode('');
    setVipEmailInput('');

    if (userSession) {
      const updated = { ...userSession, isVip: true, email: enteredEmail };
      localStorage.setItem('lurl_session', JSON.stringify(updated));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) return;

    setIsLoading(true);
    try {
      try {
        localStorage.setItem('lurl_vip_settings_v1', JSON.stringify(settings));
      } catch (err) {}
      onSaveSettings(settings);

      const targetEmail =
        userSession?.email && isPrivilegedAdminEmail(userSession.email)
          ? userSession.email
          : 'srao79614@gmail.com';

      const response = await fetch('/api/vip/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, settings }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.settings) {
          onSaveSettings(data.settings);
        }
      }
    } catch (err) {
      // Already persisted locally and propagated to parent state
    } finally {
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="vip-portal-modal-overlay"
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 pt-4 pb-24 sm:py-8 overflow-y-auto"
        >
          {/* Subtle Backdrop Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            id="vip-portal-container"
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 16,
              boxShadow: '0 0 0px rgba(248, 177, 121, 0)',
              borderColor: 'rgba(248, 177, 121, 0.25)',
            }}
            animate={
              isCrownHovered
                ? {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    boxShadow: [
                      '0 0 35px rgba(248, 177, 121, 0.45), 0 20px 70px rgba(212, 122, 55, 0.35)',
                      '0 0 75px rgba(255, 215, 0, 0.9), 0 25px 105px rgba(212, 122, 55, 0.65)',
                      '0 0 35px rgba(248, 177, 121, 0.45), 0 20px 70px rgba(212, 122, 55, 0.35)',
                    ],
                    borderColor: [
                      'rgba(248, 177, 121, 0.7)',
                      'rgba(255, 215, 0, 1)',
                      'rgba(248, 177, 121, 0.7)',
                    ],
                  }
                : {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    boxShadow: [
                      '0 0 0px rgba(248, 177, 121, 0)',
                      '0 0 50px rgba(248, 177, 121, 0.6), 0 25px 90px rgba(212, 122, 55, 0.45)',
                      '0 0 30px rgba(248, 177, 121, 0.35), 0 20px 70px rgba(212, 122, 55, 0.3)',
                    ],
                    borderColor: [
                      'rgba(248, 177, 121, 0.3)',
                      'rgba(255, 215, 0, 0.95)',
                      'rgba(248, 177, 121, 0.7)',
                    ],
                  }
            }
            transition={
              isCrownHovered
                ? {
                    boxShadow: { repeat: Infinity, duration: 1.25, ease: 'easeInOut' },
                    borderColor: { repeat: Infinity, duration: 1.25, ease: 'easeInOut' },
                  }
                : {
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                    boxShadow: { duration: 1.2, ease: 'easeOut' },
                    borderColor: { duration: 1.2, ease: 'easeOut' },
                  }
            }
            exit={{ opacity: 0, scale: 0.95, y: 12, transition: { duration: 0.22, ease: 'easeIn' } }}
            className="relative w-full max-w-2xl my-8 rounded-2xl bg-[#0d1017] border border-[#f8b179]/70 p-6 sm:p-8 overflow-hidden shadow-2xl transition-colors z-10"
          >
        {/* Subtle Luxury Gold Shimmer Top Bar */}
        <motion.div
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.15 }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent pointer-events-none"
        />

        {/* Crown Hover Triggered Golden Halo Pulse Overlay */}
        <AnimatePresence>
          {isCrownHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 0.8, 0.35] }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.25, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-2xl border-2 border-[#ffd700] pointer-events-none z-20 shadow-[inset_0_0_40px_rgba(255,215,0,0.22)]"
            />
          )}
        </AnimatePresence>

        {/* Ambient VIP Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#d47a37]/25 via-[#f8b179]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#d47a37]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#252c3d] mb-6">
          <div className="flex items-center gap-4">
            {/* Free-Standing VIP Crown Icon with Hover Trigger */}
            <div
              id="vip-crown-icon-badge"
              onMouseEnter={() => setIsCrownHovered(true)}
              onMouseLeave={() => setIsCrownHovered(false)}
              className="relative group cursor-pointer p-1.5"
            >
              <motion.div
                animate={
                  isCrownHovered
                    ? {
                        scale: 1.16,
                        rotate: [0, -5, 5, 0],
                      }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex items-center justify-center"
              >
                <Crown className="w-8 h-8 text-[#ffd700] drop-shadow-[0_0_14px_rgba(255,215,0,0.85)]" />
              </motion.div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-['Cinzel'] text-xl sm:text-2xl font-bold tracking-wide text-white">
                  VIP Inner Qualities Portal
                </h2>
                <span className="text-xs font-mono font-bold text-[#ffd700] tracking-wider">
                  · Proprietor Level
                </span>
              </div>
              <p className="text-xs text-[#9ca3af] mt-0.5">
                Restricted to: <span className="font-mono text-[#f8b179]">Authorized Proprietor Clearance</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="vip-top-back-btn"
              onClick={() => handleReturnToPlatform()}
              className="text-xs font-bold text-[#f8b179] hover:text-white px-3.5 py-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] border border-[#d47a37]/60 hover:border-[#f8b179] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#f8b179]" />
              <span>Back to Platform</span>
            </button>
            <button
              type="button"
              id="vip-top-close-btn"
              onClick={() => handleReturnToPlatform()}
              className="text-xs text-[#9ca3af] hover:text-white p-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] border border-[#252c3d] transition-colors cursor-pointer"
              title="Close VIP Portal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Platform Navigation Bar inside VIP Portal */}
        <div className="mb-5 p-2.5 rounded-xl bg-[#090c14] border border-[#252c3d] flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-mono text-[#9ca3af] px-1">Quick Return Navigation:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleReturnToPlatform('home')}
              className="px-2.5 py-1.5 rounded-lg bg-[#141926] hover:bg-[#1e2638] text-[#f8b179] hover:text-white border border-[#d47a37]/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => handleReturnToPlatform('categories')}
              className="px-2.5 py-1.5 rounded-lg bg-[#141926] hover:bg-[#1e2638] text-[#cbd5e1] hover:text-white border border-[#252c3d] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-[#f8b179]" />
              <span>Categories</span>
            </button>
            <button
              type="button"
              onClick={() => handleReturnToPlatform('codex')}
              className="px-2.5 py-1.5 rounded-lg bg-[#141926] hover:bg-[#1e2638] text-[#cbd5e1] hover:text-white border border-[#252c3d] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#f8b179]" />
              <span>Codex</span>
            </button>
            <button
              type="button"
              onClick={() => handleReturnToPlatform('trading')}
              className="px-2.5 py-1.5 rounded-lg bg-[#141926] hover:bg-[#1e2638] text-[#cbd5e1] hover:text-white border border-[#252c3d] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <CandlestickChart className="w-3.5 h-3.5 text-amber-400" />
              <span>Trading</span>
            </button>
            <button
              type="button"
              onClick={() => handleReturnToPlatform('performance')}
              className="px-2.5 py-1.5 rounded-lg bg-[#141926] hover:bg-[#1e2638] text-[#cbd5e1] hover:text-white border border-[#252c3d] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Security Check & Passcode Unlock Form */}
        {!isAuthorized ? (
          <div className="p-6 sm:p-8 text-center space-y-4 rounded-xl bg-[#141824] border border-[#d47a37]/40 shadow-xl">
            <Lock className="w-10 h-10 text-[#f8b179] mx-auto animate-pulse" />
            <h3 className="font-['Cinzel'] text-lg font-bold text-white">
              VIP Executive Clearance Gateway
            </h3>
            <p className="text-xs text-[#9ca3af] max-w-md mx-auto leading-relaxed">
              Proprietor-Level Authorization Required. All credentials and inner qualities are strictly private, secret, and encrypted.
            </p>
            <p className="text-xs font-mono text-amber-400/80">
              ⚡ Private Executive Verification Gateway
            </p>

            <form onSubmit={handleUnlockWithPasscode} className="max-w-sm mx-auto space-y-3.5 pt-2 text-left">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">
                  Authorized VIP Gmail ID
                </label>
                <input
                  id="vip-modal-email-input"
                  type="text"
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck="false"
                  name="secret_vip_gmail_blank"
                  value={vipEmailInput}
                  onChange={(e) => setVipEmailInput(e.target.value)}
                  placeholder="Enter VIP Gmail ID"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090b10] border border-[#2d3748] focus:border-[#d47a37] text-white text-xs font-mono outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">
                  Secret VIP Passcode
                </label>
                <input
                  id="vip-modal-passcode-input"
                  type="password"
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck="false"
                  name="secret_vip_code_blank"
                  value={vipPasscode}
                  onChange={(e) => setVipPasscode(e.target.value)}
                  placeholder="Enter Secret VIP Passcode"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090b10] border border-[#2d3748] focus:border-[#d47a37] text-white text-xs font-mono tracking-widest outline-none transition-all"
                />
              </div>

              {passcodeError && (
                <p className="text-xs text-rose-400 font-medium text-center">{passcodeError}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleReturnToPlatform()}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#f8b179] hover:text-white bg-[#0e121a] hover:bg-[#181f2c] border border-[#d47a37]/50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  id="vip-modal-unlock-btn"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] shadow-md transition-all cursor-pointer"
                >
                  Verify VIP Clearance
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5 text-left">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#d47a37]/15 to-[#b85d19]/10 border border-[#f8b179]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#f8b179]" />
                <span className="text-xs font-semibold text-white">
                  VIP Executive Clearance: Authenticated
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#34d399]">All Rights Granted</span>
            </div>

            {/* VIP Chat Box & Anti-Tamper Defense Sentinel Entry Card */}
            {onOpenVipChatBox && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#18151f] via-[#151a24] to-[#121927] border border-[#f8b179]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#ffd700]" />
                    <span className="text-xs font-bold text-white">
                      VIP Private Chat Box & Anti-Tamper Sentinel
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#d47a37]/20 border border-[#f8b179]/40 text-[10px] font-mono text-[#ffd700]">
                      TOP SECRET
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af]">
                    Chat with Athena in total isolation. Instant alerts on any hack or tamper attempt. View confidential charts invisible to anyone else.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onOpenVipChatBox();
                  }}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Open VIP Chat Box</span>
                </button>
              </div>
            )}

            {/* Active Google AdMob Monetization Unit Status */}
            <div className="p-3.5 rounded-xl bg-[#090c14] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">Google AdMob App & Ad Units Integrated</span>
                </div>
                <p className="text-[11px] font-mono text-emerald-300 select-all">
                  App ID: ca-app-pub-3767067209003943~6726537867
                </p>
                <p className="text-[11px] font-mono text-[#f8b179] select-all">
                  Ad Unit 1: ca-app-pub-3767067209003943/2800569440 • Ad Unit 2: ca-app-pub-3767067209003943/1431647456
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-[10px] self-start sm:self-center">
                ADMOB MEDIATION ACTIVE
              </span>
            </div>

            {/* Inner Qualities Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">
                  Trading Inner Quality (Risk Ceiling)
                </label>
                <input
                  type="text"
                  value={settings.tradingRiskCeiling}
                  onChange={(e) =>
                    setSettings({ ...settings, tradingRiskCeiling: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">
                  AI Dropshipping Inner Quality (Fulfillment)
                </label>
                <input
                  type="text"
                  value={settings.dropshippingAutoFulfill}
                  onChange={(e) =>
                    setSettings({ ...settings, dropshippingAutoFulfill: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">
                  E-Commerce Inner Quality (Retention Target)
                </label>
                <input
                  type="text"
                  value={settings.ecommerceRetentionTarget}
                  onChange={(e) =>
                    setSettings({ ...settings, ecommerceRetentionTarget: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">
                  AI Startup Inner Quality (Moat Multipliers)
                </label>
                <input
                  type="text"
                  value={settings.startupMoatMultipliers}
                  onChange={(e) =>
                    setSettings({ ...settings, startupMoatMultipliers: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">
                Executive Notes & Global Platform Directives
              </label>
              <textarea
                rows={3}
                value={settings.executiveNotes}
                onChange={(e) => setSettings({ ...settings, executiveNotes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37] resize-none"
              />
            </div>

            {/* Actions: Prominent Back Navigation Button + Save Button */}
            <div className="pt-4 border-t border-[#1f2638] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                id="vip-bottom-back-btn"
                onClick={() => handleReturnToPlatform()}
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-[#f8b179] hover:text-white bg-[#141824] hover:bg-[#1f2638] border border-[#d47a37]/60 hover:border-[#f8b179] shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-[#f8b179]" />
                <span>← Back to Platform</span>
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {isSaved && (
                  <span className="text-xs text-[#34d399] font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Saved!
                  </span>
                )}

                <button
                  type="submit"
                  id="vip-save-settings-button"
                  disabled={isLoading}
                  className="py-2.5 px-5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Inner Qualities
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
