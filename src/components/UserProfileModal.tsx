import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryType, UserProfile, UserSession, UserExperienceTier } from '../types';
import {
  getUserProfile,
  saveUserProfile,
  getUserPerformance,
  getPrivateAccountChatbotHistory,
  getPrivateWordChartAndWorldwideHistory,
  deleteUserHistoryItem,
  DEFAULT_AVATARS,
} from '../utils/userStorage';
import { getActivityHistory } from '../utils/activityHistory';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { calculateUserTenure, TIER_MILESTONES, getTierBadgeStyle } from '../utils/tierSystem';
import { maskEmail, isPrivilegedAdminEmail } from '../utils/maskEmail';
import {
  User,
  Mail,
  Calendar,
  Layers,
  Camera,
  Upload,
  Check,
  X,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Bot,
  ShoppingBag,
  Rocket,
  Image as ImageIcon,
  Save,
  Award,
  Briefcase,
  Crown,
  Medal,
  Clock,
  CheckCircle2,
  Lock,
  ChevronRight,
  Compass,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession | null;
  currentCategory: CategoryType;
  onProfileUpdated: (updatedProfile: UserProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userSession,
  currentCategory,
  onProfileUpdated,
}) => {
  const initialEmail = userSession?.email || 'guest@lurl.app';
  const [profile, setProfile] = useState<UserProfile>(() =>
    getUserProfile(initialEmail, currentCategory)
  );
  const [isEditing, setIsEditing] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [privateVaultTab, setPrivateVaultTab] = useState<
    'all' | 'chatbot' | 'word-chart' | 'books'
  >('all');
  const [perfData, setPerfData] = useState(() => getUserPerformance(initialEmail));
  const [privateChatHistory, setPrivateChatHistory] = useState(() =>
    getPrivateAccountChatbotHistory(initialEmail)
  );
  const [privateWordChartData, setPrivateWordChartData] = useState(() =>
    getPrivateWordChartAndWorldwideHistory(initialEmail)
  );
  const [privateActivities, setPrivateActivities] = useState(() =>
    getActivityHistory(initialEmail)
  );

  const refreshPrivateAccountVault = (targetEmail: string) => {
    setPerfData(getUserPerformance(targetEmail));
    setPrivateChatHistory(getPrivateAccountChatbotHistory(targetEmail));
    setPrivateWordChartData(getPrivateWordChartAndWorldwideHistory(targetEmail));
    setPrivateActivities(getActivityHistory(targetEmail));
  };

  useEffect(() => {
    if (isOpen) {
      const p = getUserProfile(initialEmail, currentCategory);
      setProfile(p);
      setIsEditing(true);
      setSaveSuccess(false);
      refreshPrivateAccountVault(initialEmail);
    }
  }, [isOpen, initialEmail, currentCategory]);

  const persistProfilePermanently = (nextProfile: UserProfile, showBanner = true) => {
    const safeEmail = userSession?.email && userSession.email !== 'guest@lurl.app'
      ? userSession.email.trim().toLowerCase()
      : initialEmail;
    const profileWithEmail = { ...nextProfile, email: safeEmail };
    const saved = saveUserProfile(profileWithEmail);
    setProfile(saved);
    onProfileUpdated(saved);
    if (showBanner) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (under 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const updated = { ...profile, avatarUrl: dataUrl };
        persistProfilePermanently(updated, true);
        playSuccessChime();
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    let finalAvatar = profile.avatarUrl;
    if (customAvatarUrl.trim()) {
      finalAvatar = customAvatarUrl.trim();
    }

    const updated: UserProfile = {
      ...profile,
      email: initialEmail,
      name: (profile.name || '').trim() || (isPrivilegedAdminEmail(initialEmail) ? 'VIP Executive' : 'Platform Member'),
      avatarUrl: finalAvatar,
      age: Math.min(99, Math.max(16, Number(profile.age) || 24)),
      bio: profile.bio || '',
    };

    persistProfilePermanently(updated, true);
    playSuccessChime();
  };

  const categoryMeta = CATEGORIES_DATA[profile.selectedCategory] || CATEGORIES_DATA.trading;

  const tenure = calculateUserTenure(profile);
  const tierBadge = getTierBadgeStyle(tenure.currentTier);

  const categoryIcons: Record<CategoryType, React.ReactNode> = {
    trading: <TrendingUp className="w-4 h-4 text-[#f8b179]" />,
    dropshipping: <Bot className="w-4 h-4 text-[#f8b179]" />,
    ecommerce: <ShoppingBag className="w-4 h-4 text-[#f8b179]" />,
    startup: <Rocket className="w-4 h-4 text-[#f8b179]" />,
    'skill-development': <Compass className="w-4 h-4 text-[#f8b179]" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl rounded-2xl bg-[#0a0d14] border border-[#252c3d] shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden z-10"
          >
          {/* Top Decorative Bronze Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#d47a37] via-[#f8b179] to-[#b85d19]" />

          {/* Modal Header */}
          <div className="p-5 pb-4 flex items-center justify-between border-b border-[#1f2638]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#d47a37]/15 border border-[#d47a37]/30 flex items-center justify-center">
                <User className="w-4 h-4 text-[#f8b179]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Cinzel'] text-lg font-bold text-white tracking-wide">
                    Executive User Profile
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${tierBadge.bg} ${tierBadge.border}`}
                    style={{ color: tierBadge.color }}
                  >
                    {tenure.currentTier === 'platinum' ? (
                      <Crown className="w-3 h-3" />
                    ) : tenure.currentTier === 'gold' ? (
                      <Award className="w-3 h-3" />
                    ) : (
                      <Medal className="w-3 h-3" />
                    )}
                    <span>{tierBadge.label} TIER</span>
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af]">
                  Website tenure milestones, trading experience level, and executive credentials
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#9ca3af] hover:text-white hover:bg-[#1a202c] transition-colors cursor-pointer border border-transparent hover:border-[#252c3d]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-300"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Profile permanently saved to your verified Gmail account & server storage!</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">PERMANENT SYNC ✓</span>
            </motion.div>
          )}

          {/* Modal Content */}
          <div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto space-y-6">
            {/* Avatar & Hero Identity Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-[#10141f] border border-[#252c3d]">
              {/* Avatar Picture with Change Badge */}
              <div className="relative group shrink-0">
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#d47a37] shadow-md"
                  referrerPolicy="no-referrer"
                />
                <label
                  htmlFor="avatar-file-input"
                  className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-[#d47a37] hover:bg-[#e08a46] text-white shadow-md cursor-pointer transition-all flex items-center justify-center"
                  title="Upload profile picture"
                >
                  <Camera className="w-3 h-3" />
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Identity Details */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-['Cinzel'] text-xl font-bold text-white">
                    {profile.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#34d399]/15 text-[#34d399] text-[10px] font-mono font-bold border border-[#34d399]/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Gmail Verified
                  </span>
                  {Boolean(profile.isVip || isPrivilegedAdminEmail(profile.email)) ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/40 flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-400" /> VIP EXECUTIVE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 text-[10px] font-mono font-bold border border-sky-500/30 flex items-center gap-1">
                      <User className="w-3 h-3 text-sky-400" /> Member Analyst
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1 ${tierBadge.bg} ${tierBadge.border}`}
                    style={{ color: tierBadge.color }}
                  >
                    <span>{tierBadge.label} TIER</span>
                  </span>
                </div>

                {/* Gmail Address (Privacy Masked) */}
                <div className="text-xs text-[#9ca3af] flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-[#f8b179]" />
                  <span>{maskEmail(profile.email)}</span>
                  <span className="text-[10px] text-gray-500 font-sans">(Protected)</span>
                </div>

                {/* Age & Track Pill */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#090b10] border border-[#1f2638] text-[11px] text-[#9ca3af] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#f8b179]" /> Age: <strong className="text-white">{profile.age}</strong>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#090b10] border border-[#1f2638] text-[11px] text-[#9ca3af] flex items-center gap-1.5">
                    {categoryIcons[profile.selectedCategory]}
                    <span>Track: <strong className="text-white capitalize">{profile.selectedCategory}</strong></span>
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#090b10] border border-[#1f2638] text-[11px] text-[#9ca3af] flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-[#f8b179]" />
                    <span>Tenure: <strong className="text-white">{tenure.daysActive} Days ({tenure.monthsActive} Mo)</strong></span>
                  </span>
                </div>
              </div>

              {/* Permanent Save Status & Quick Save Button */}
              <div className="flex flex-col items-end gap-1.5 self-center sm:self-start">
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PERMANENT STORAGE ACTIVE</span>
                </span>
                {profile.lastSavedAt && (
                  <span className="text-[10px] font-mono text-[#6b7280]">
                    Saved: {new Date(profile.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </div>
            </div>

            {/* SECTION: Experience Performance Table (4 Tiers based on Website Usage) */}
            <div className="p-4 rounded-2xl bg-[#0f131d] border border-[#252c3d] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2638] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#f8b179]" />
                    <h4 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                      Experience Performance Milestones
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">
                    Website usage seniority tiers unlocked at 1 Month (Bronze), 3 Months (Silver), 7 Months (Gold), and 1 Year (Platinum).
                  </p>
                </div>

                {/* Practical Verified Tenure Display */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-1 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Practical Real Tenure
                  </span>
                  <span className="text-[11px] font-mono text-[#9ca3af]">
                    Registered: {new Date(profile.joinDate || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Progress to Next Tier Bar */}
              <div className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#9ca3af]">Current Active Level:</span>
                    <strong style={{ color: tierBadge.color }}>{tierBadge.label} TIER</strong>
                    <span className="text-[#6b7280]">({tenure.daysActive} Days Active)</span>
                  </div>
                  <div>
                    {tenure.nextMilestone ? (
                      <span className="text-[#cbd5e1]">
                        {tenure.daysToNext} Days until <strong>{tenure.nextMilestone.badgeLabel}</strong> ({tenure.progressPercent}%)
                      </span>
                    ) : (
                      <span className="text-[#38bdf8] font-bold flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5" /> Highest Master Rank Achieved
                      </span>
                    )}
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full h-2 rounded-full bg-[#181d2c] overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${tenure.progressPercent}%`,
                      backgroundColor: tierBadge.color,
                    }}
                  />
                </div>
              </div>

              {/* 4-Tier Experience Performance Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#252c3d] text-[#6b7280] font-mono text-[10px] uppercase">
                      <th className="py-2.5 px-3">Tier Level</th>
                      <th className="py-2.5 px-3">Required Usage</th>
                      <th className="py-2.5 px-3">Demo Benchmark</th>
                      <th className="py-2.5 px-3">Backtesting & Strategy Perks</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b2130]">
                    {TIER_MILESTONES.map((m) => {
                      const isUnlocked = tenure.daysActive >= m.requiredDays;
                      const isCurrent = tenure.currentTier === m.tier;

                      return (
                        <tr
                          key={m.tier}
                          className={`transition-colors ${
                            isCurrent
                              ? 'bg-[#182030]/60'
                              : isUnlocked
                              ? 'bg-transparent hover:bg-[#121622]/40'
                              : 'opacity-65 hover:opacity-85'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                                style={{
                                  color: m.accentColor,
                                  backgroundColor: m.badgeBg,
                                  borderColor: m.badgeBorder,
                                }}
                              >
                                {m.badgeLabel}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] px-1 py-0.2 bg-[#d47a37]/30 text-[#f8b179] font-mono font-bold">
                                  YOU ARE HERE
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 font-mono font-semibold text-white">
                            {m.requiredMonths} {m.requiredMonths === 1 ? 'Month' : 'Months'}
                            <span className="text-[#6b7280] block text-[10px]">({m.requiredDays} Days)</span>
                          </td>

                          <td className="py-3 px-3 font-mono text-[#cbd5e1]">
                            {m.benchmarkVolume}
                          </td>

                          <td className="py-3 px-3">
                            <ul className="space-y-0.5 text-[11px] text-[#9ca3af]">
                              {m.perks.slice(0, 2).map((perk, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-[#f8b179]" />
                                  <span>{perk}</span>
                                </li>
                              ))}
                            </ul>
                          </td>

                          <td className="py-3 px-3 text-right">
                            {isUnlocked ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 border border-emerald-700/50">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>UNLOCKED</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-[#9ca3af] bg-[#141824] px-2 py-0.5 border border-[#252c3d]">
                                <Lock className="w-3 h-3 text-[#6b7280]" />
                                <span>{m.requiredDays - tenure.daysActive}d remaining</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION: Private Account History & Vault (AI Chatbot, Word Chart, Worldwide & Book History) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0f131d] border border-[#d47a37]/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1f2638]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                      Private Account Vault & Saved History
                    </h4>
                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold">
                      100% PRIVATE TO {maskEmail(profile.email)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">
                    Your AI Chatbot conversations, Word Conversion Chart audits, Worldwide strategies, and Book chapters/pages are privately encrypted and saved in your account.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 shrink-0">
                  <span>{privateChatHistory.length} Chats</span>
                  <span>•</span>
                  <span>
                    {privateWordChartData.wordChartEntries.length +
                      privateWordChartData.worldwideEvents.length}{' '}
                    Word Chart
                  </span>
                  <span>•</span>
                  <span>{(perfData.history || []).length} Vault Logs</span>
                </div>
              </div>

              {/* Filter Tabs for Private History */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  {
                    id: 'all',
                    label: `All Private History (${(perfData.history || []).length + privateActivities.length})`,
                  },
                  {
                    id: 'chatbot',
                    label: `🤖 AI Chatbot History (${privateChatHistory.length})`,
                  },
                  {
                    id: 'word-chart',
                    label: `📊 Word Chart & Worldwide (${
                      privateWordChartData.wordChartEntries.length +
                      privateWordChartData.worldwideEvents.length
                    })`,
                  },
                  {
                    id: 'books',
                    label: `📖 Book & Chapters Studied (${
                      (perfData.history || []).filter(
                        (h) => h.type === 'chapter_completed' || h.type === 'book_page_read'
                      ).length
                    })`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setPrivateVaultTab(tab.id as any);
                    }}
                    className={`px-3 py-1.5 text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                      privateVaultTab === tab.id
                        ? 'bg-[#d47a37] text-white border-[#f8b179]'
                        : 'bg-[#090b10] text-[#9ca3af] hover:text-white border-[#1f2638]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Private History Items List */}
              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {privateVaultTab === 'chatbot' && (
                  <>
                    {privateChatHistory.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#6b7280] bg-[#090b10] border border-[#1f2638]">
                        No private AI Chatbot queries recorded yet. Ask any question in the AI Voice Advisor or Floating Chatbot and it will be saved privately here.
                      </div>
                    ) : (
                      privateChatHistory.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-[#090b10] border border-[#1f2638] hover:border-[#d47a37]/40 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2 text-[10px] font-mono">
                            <span className="text-[#f8b179] uppercase font-bold">
                              [{item.category}] AI Chatbot · Private Session
                            </span>
                            <span className="text-[#6b7280]">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="font-semibold text-white">Q: {item.question}</div>
                          <div className="text-[#9ca3af] line-clamp-3 leading-relaxed">
                            A: {item.answer.replace(/[#*_`]/g, '')}
                          </div>
                        </div>
                      ))
                    )}
                  </>
                )}

                {privateVaultTab === 'word-chart' && (
                  <>
                    {privateWordChartData.wordChartEntries.length === 0 &&
                    privateWordChartData.worldwideEvents.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#6b7280] bg-[#090b10] border border-[#1f2638]">
                        No private Word Conversion Chart or Worldwide strategies saved yet. Analyze hooks or share thoughts in the Thoughts Fuse tab to save them privately here.
                      </div>
                    ) : (
                      <>
                        {privateWordChartData.wordChartEntries.map((wc) => (
                          <div
                            key={wc.id}
                            className="p-3 bg-[#090b10] border border-[#1f2638] hover:border-emerald-500/40 space-y-1.5 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                              <span className="text-emerald-400 font-bold uppercase">
                                📊 WORD CHART · Hook {wc.hookScore}/100 · {wc.cvr} · {wc.estimatedRoas}
                              </span>
                              <span className="text-[#6b7280]">
                                {new Date(wc.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="font-semibold text-white">{wc.title}</div>
                            <p className="text-[#9ca3af] line-clamp-2">{wc.copyText}</p>
                            {wc.rewrittenHook && (
                              <div className="text-[11px] text-[#f8b179] font-mono">
                                Optimized Hook: "{wc.rewrittenHook}"
                              </div>
                            )}
                          </div>
                        ))}
                        {privateWordChartData.worldwideEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-3 bg-[#090b10] border border-[#1f2638] space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-cyan-400 font-bold uppercase">
                                [{ev.category}] {ev.title}
                              </span>
                              <span className="text-[#6b7280]">
                                {new Date(ev.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[#9ca3af]">{ev.description}</p>
                            {ev.keyTakeaway && (
                              <div className="text-[11px] text-emerald-300 font-mono">
                                {ev.keyTakeaway}
                              </div>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}

                {privateVaultTab === 'books' && (
                  <>
                    {(perfData.history || []).filter(
                      (h) => h.type === 'chapter_completed' || h.type === 'book_page_read'
                    ).length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#6b7280] bg-[#090b10] border border-[#1f2638]">
                        No chapters or book pages marked studied yet. Read any chapter or 500-page manuscript to record it privately in your profile.
                      </div>
                    ) : (
                      (perfData.history || [])
                        .filter(
                          (h) => h.type === 'chapter_completed' || h.type === 'book_page_read'
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-[#090b10] border border-[#1f2638] space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="text-[#f8b179] font-bold uppercase">
                                [{item.category}] {item.title}
                              </span>
                              <span className="text-[#6b7280]">
                                {new Date(item.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-[#9ca3af]">{item.description}</p>
                            {item.keyTakeaway && (
                              <p className="text-[11px] text-emerald-400 font-mono">
                                Takeaway: {item.keyTakeaway}
                              </p>
                            )}
                          </div>
                        ))
                    )}
                  </>
                )}

                {privateVaultTab === 'all' && (
                  <>
                    {(perfData.history || []).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-[#090b10] border border-[#1f2638] hover:border-[#252c3d] flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                            <span className="text-[#f8b179] font-bold uppercase">
                              [{item.category}]
                            </span>
                            <span className="text-white font-semibold truncate">{item.title}</span>
                            <span className="text-[#6b7280]">
                              {new Date(item.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[#9ca3af] leading-relaxed">{item.description}</p>
                          {item.keyTakeaway && (
                            <p className="text-[11px] text-emerald-400 font-mono">
                              {item.keyTakeaway}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            deleteUserHistoryItem(item.id, initialEmail);
                            refreshPrivateAccountVault(initialEmail);
                          }}
                          className="text-[10px] font-mono text-[#6b7280] hover:text-rose-400 px-1.5 py-0.5 border border-transparent hover:border-rose-500/30 cursor-pointer shrink-0"
                          title="Delete from Private History"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>

            {/* Profile Form (View or Edit Mode) */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* Field 1: Gmail Address (Fixed / Authenticated) */}
              <div>
                <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1.5">
                  Verified Gmail Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={maskEmail(profile.email)}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080a0f] border border-[#1f2638] text-gray-400 text-xs font-mono cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-[#6b7280] mt-1">
                  Gmail address masked for executive privacy ({maskEmail(profile.email)}). Fully retained internally.
                </p>
              </div>

              {/* Field 2 & 3: Name, Age & Profession */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1.5">
                    Profile Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profile.name}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Enter your name"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white outline-none transition-all ${
                        isEditing
                          ? 'bg-[#090b10] border border-[#d47a37] focus:ring-1 focus:ring-[#d47a37]'
                          : 'bg-[#080a0f] border border-[#1f2638] text-gray-300 cursor-default'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1.5">
                    Age
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="16"
                      max="100"
                      value={profile.age}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      placeholder="e.g. 28"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white outline-none transition-all ${
                        isEditing
                          ? 'bg-[#090b10] border border-[#d47a37] focus:ring-1 focus:ring-[#d47a37]'
                          : 'bg-[#080a0f] border border-[#1f2638] text-gray-300 cursor-default'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1.5">
                    Profession
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={profile.profession || ''}
                      disabled={!isEditing}
                      onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                      placeholder="e.g. Quantitative Trader"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs text-white outline-none transition-all ${
                        isEditing
                          ? 'bg-[#090b10] border border-[#d47a37] focus:ring-1 focus:ring-[#d47a37]'
                          : 'bg-[#080a0f] border border-[#1f2638] text-gray-300 cursor-default'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Field 3B: Bio / Personal Background */}
              <div>
                <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1.5">
                  Personal Bio & Strategy Focus
                </label>
                <textarea
                  rows={2}
                  value={profile.bio || ''}
                  disabled={!isEditing}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Enter your personal background, strategy notes, or learning objectives..."
                  className={`w-full px-3.5 py-2 rounded-xl text-xs text-white outline-none transition-all resize-none ${
                    isEditing
                      ? 'bg-[#090b10] border border-[#d47a37] focus:ring-1 focus:ring-[#d47a37]'
                      : 'bg-[#080a0f] border border-[#1f2638] text-gray-300 cursor-default'
                  }`}
                />
              </div>

              {/* Field 4: Selected Operational Category (Auto-saves permanently on click) */}
              <div>
                <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1.5">
                  Selected Focus Category (Permanently Saved)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['trading', 'dropshipping', 'ecommerce', 'startup', 'skill-development'] as CategoryType[]).map((cat) => {
                    const isSelected = profile.selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          const updated = { ...profile, selectedCategory: cat };
                          persistProfilePermanently(updated, true);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#141824] border-[#d47a37] shadow-sm'
                            : 'bg-[#080a0f] border-[#1f2638] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <div className="p-1.5 rounded-lg bg-[#0d1017] border border-[#252c3d] shrink-0">
                          {categoryIcons[cat]}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <span className="text-xs font-bold text-white block capitalize truncate">
                            {cat === 'dropshipping' ? 'AI Dropship' : cat === 'startup' ? 'AI Startup' : cat === 'skill-development' ? 'Skill Dev' : cat}
                          </span>
                          <span className="text-[10px] text-[#6b7280] truncate block">
                            {cat === 'trading'
                              ? 'Wyckoff & Kelly Risk'
                              : cat === 'dropshipping'
                              ? 'Viral Hooks & Logistics'
                              : cat === 'ecommerce'
                              ? 'D2C Unit Economics'
                              : cat === 'startup'
                              ? 'Moats & Venture VC'
                              : '50 Skills & Practice'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 4B: Default Saved Tab After Entering Website */}
              <div>
                <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1.5">
                  Default Saved Website Tab (Opens Automatically After Gmail Verification)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'select', label: 'Categories Hub' },
                    { id: 'demo-trading', label: 'Live BTC Trading' },
                    { id: 'codex', label: 'Course Codex' },
                    { id: 'skills-book', label: '50 Skills Book' },
                    { id: 'ai-chat', label: 'AI Voice Advisor' },
                    { id: 'share-thoughts', label: 'Thoughts Fuse' },
                    { id: 'performance', label: 'My Performance' },
                    { id: 'home', label: 'Home Portal' },
                  ].map((tabItem) => {
                    const currentPref = profile.preferredTab || 'select';
                    const isSelected = currentPref === tabItem.id;
                    return (
                      <button
                        key={tabItem.id}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          const updated: UserProfile = {
                            ...profile,
                            preferredTab: tabItem.id as any,
                          };
                          persistProfilePermanently(updated, true);
                        }}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#d47a37]/20 border-[#d47a37] text-[#f8b179]'
                            : 'bg-[#080a0f] border-[#1f2638] text-[#9ca3af] hover:text-white'
                        }`}
                      >
                        <span className="truncate">{tabItem.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#f8b179] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 5: Profile Picture Selection (Always Available & Auto-Saves Permanently) */}
              <div className="space-y-3 pt-2 border-t border-[#1f2638]">
                <label className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider block">
                  Choose or Upload Profile Picture / Logo (Permanently Saved)
                </label>

                {/* Preset Avatars */}
                <div className="grid grid-cols-4 gap-2.5">
                  {DEFAULT_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        const updated = { ...profile, avatarUrl: av.url };
                        persistProfilePermanently(updated, true);
                      }}
                      className={`relative p-1 rounded-xl border transition-all cursor-pointer group ${
                        profile.avatarUrl === av.url
                          ? 'border-[#f8b179] ring-2 ring-[#d47a37]/50'
                          : 'border-[#252c3d] hover:border-[#d47a37]'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        className="w-full h-12 rounded-lg object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[9px] text-[#9ca3af] block text-center mt-1 truncate">
                        {av.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom URL or Upload option */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="custom-avatar-upload"
                    className="px-3 py-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploading ? 'Saving Photo...' : 'Upload Local Photo'}</span>
                    <input
                      id="custom-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex-1 relative">
                    <ImageIcon className="w-3.5 h-3.5 text-[#6b7280] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#080a0f] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons - Always visible so user can save permanently with 1 click */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-[#1f2638]">
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>All changes persist permanently across reloads & logins</span>
                </span>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[#9ca3af] hover:text-white bg-[#141824] hover:bg-[#1a202c] border border-[#252c3d] cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Permanently</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
