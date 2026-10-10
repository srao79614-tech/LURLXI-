import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  User,
  LogOut,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  X,
  Check,
  ShieldCheck,
  Crown,
  Bell,
  Sparkles,
  AlertTriangle,
  Play,
  Layers,
  ArrowRight,
  Mail,
  Calendar,
  Volume1,
  BookOpen,
  MessageSquare,
  Trash2,
  Globe,
  MoveHorizontal,
  Hand,
  Compass,
  Database,
  Save,
  Cloud,
  Upload,
  Download,
} from 'lucide-react';
import { SoundSettings, UserSession, UserProfile, CategoryType } from '../types';
import { maskEmail, isPrivilegedAdminEmail } from '../utils/maskEmail';
import {
  getStoredSoundSettings,
  saveStoredSoundSettings,
  playNetflixIntroSound,
  playSuccessChime,
  playClickSound,
  startAmbientBgm,
  stopAmbientBgm,
  setBgmVolumeLevel,
} from '../utils/soundEffects';
import {
  getStoredGestureSettings,
  saveStoredGestureSettings,
  GestureSettings,
} from '../utils/gestureSettings';
import {
  getAutoSaveSettings,
  saveAutoSaveSettings,
  syncFullVaultToServer,
  restoreFullVaultFromServer,
  exportAccountDataJson,
  importAccountDataJson,
  clearCurrentAccountData,
  AutoSaveSettings,
} from '../utils/userStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession | null;
  userProfile: UserProfile;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  onOpenSecuritySentinel?: () => void;
  onLogout: () => void;
  onRestartToWelcome: () => void;
  onResetProgress: () => void;
  onResetChatbot: () => void;
  onFactoryReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userSession,
  userProfile,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenSecuritySentinel,
  onLogout,
  onRestartToWelcome,
  onResetProgress,
  onResetChatbot,
  onFactoryReset,
}) => {
  const [activeTab, setActiveTab] = useState<'sound' | 'saving' | 'account' | 'gestures' | 'restart' | 'security'>('sound');
  const [soundSettings, setSoundSettings] = useState<SoundSettings>(getStoredSoundSettings);
  const [gestureSettings, setGestureSettings] = useState<GestureSettings>(getStoredGestureSettings);
  const [autoSaveSettings, setAutoSaveSettings] = useState<AutoSaveSettings>(() => getAutoSaveSettings(userSession?.email));
  const [testSoundPlaying, setTestSoundPlaying] = useState(false);
  const [factoryConfirmOpen, setFactoryConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isSyncingVault, setIsSyncingVault] = useState(false);
  const [isRestoringVault, setIsRestoringVault] = useState(false);
  const [importInputOpen, setImportInputOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSoundSettings(getStoredSoundSettings());
      setGestureSettings(getStoredGestureSettings());
      setFactoryConfirmOpen(false);
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleUpdateSound = (updates: Partial<SoundSettings>) => {
    playClickSound();
    const updated = saveStoredSoundSettings(updates);
    setSoundSettings(updated);
    showToast('Sound preferences updated');
  };

  const handleUpdateGestures = (updates: Partial<GestureSettings>) => {
    playClickSound();
    const updated = saveStoredGestureSettings(updates);
    setGestureSettings(updated);
    showToast('Swipe & Earth settings saved');
  };

  const handleTestIntroSound = () => {
    setTestSoundPlaying(true);
    playNetflixIntroSound(true);
    setTimeout(() => setTestSoundPlaying(false), 1200);
  };

  const handleTestSuccessSound = () => {
    setTestSoundPlaying(true);
    playSuccessChime();
    setTimeout(() => setTestSoundPlaying(false), 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          {/* Backdrop click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#0d1017] border border-[#252c3d] shadow-2xl rounded-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 bg-[#121622] border-b border-[#1f2638] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#d47a37]/15 border border-[#d47a37]/40 flex items-center justify-center">
                  <SlidersHorizontal className="w-5 h-5 text-[#f8b179]" />
                </div>
                <div>
                  <h3 className="font-['Cinzel'] text-xl font-bold text-white tracking-wide">
                    Executive Control Center
                  </h3>
                  <p className="text-xs text-[#9ca3af]">
                    System sound, account authentication, and platform restart options
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-[#181d2a] hover:bg-[#252c3d] text-[#9ca3af] hover:text-white border border-[#252c3d] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs (Square Profile) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 bg-[#0a0d14] border-b border-[#1f2638]">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('sound');
                }}
                className={`py-3 px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'sound'
                    ? 'border-[#f8b179] text-[#f8b179] bg-[#121622]'
                    : 'border-transparent text-[#9ca3af] hover:text-white hover:bg-[#0e121a]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Sound</span>
              </button>

              <button
                type="button"
                id="settings-tab-saving-btn"
                onClick={() => {
                  playClickSound();
                  setActiveTab('saving');
                }}
                className={`py-3 px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'saving'
                    ? 'border-cyan-400 text-cyan-400 bg-[#121622]'
                    : 'border-transparent text-[#9ca3af] hover:text-white hover:bg-[#0e121a]'
                }`}
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Saving & Vault</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('account');
                }}
                className={`py-3 px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'account'
                    ? 'border-[#f8b179] text-[#f8b179] bg-[#121622]'
                    : 'border-transparent text-[#9ca3af] hover:text-white hover:bg-[#0e121a]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Account</span>
              </button>

              <button
                type="button"
                id="settings-tab-gestures-btn"
                onClick={() => {
                  playClickSound();
                  setActiveTab('gestures');
                }}
                className={`py-3 px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'gestures'
                    ? 'border-[#f8b179] text-[#f8b179] bg-[#121622]'
                    : 'border-transparent text-[#9ca3af] hover:text-white hover:bg-[#0e121a]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Swipe/Earth</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('restart');
                }}
                className={`py-3 px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'restart'
                    ? 'border-[#f8b179] text-[#f8b179] bg-[#121622]'
                    : 'border-transparent text-[#9ca3af] hover:text-white hover:bg-[#0e121a]'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setActiveTab('security');
                }}
                className={`py-3 px-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                  activeTab === 'security'
                    ? 'border-emerald-400 text-emerald-400 bg-[#121622]'
                    : 'border-transparent text-[#9ca3af] hover:text-white hover:bg-[#0e121a]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cyber Defense</span>
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Toast Feedback */}
              {toastMessage && (
                <div className="p-2.5 bg-[#d47a37]/20 border border-[#d47a37] text-[#f8b179] text-xs font-semibold rounded-xl flex items-center justify-between animate-fadeIn">
                  <span>{toastMessage}</span>
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}

              {/* TAB 1: SOUND & AUDIO */}
              {activeTab === 'sound' && (
                <div className="space-y-5">
                  <div className="p-4 bg-[#121622] border border-[#1f2638] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-[#f8b179]" />
                          <span>Master Audio & Sound Effects</span>
                        </div>
                        <p className="text-xs text-[#9ca3af] mt-0.5">
                          Enables all tactical clicks, success chimes, and cinematic audio synthesizers
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUpdateSound({ masterSound: !soundSettings.masterSound })}
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors border cursor-pointer ${
                          soundSettings.masterSound
                            ? 'bg-[#d47a37] border-[#f8b179]'
                            : 'bg-[#181d2a] border-[#252c3d]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                            soundSettings.masterSound ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Individual Audio Switches */}
                  <div className="space-y-3">
                    {/* Intro Welcome Sound */}
                    <div className="p-3.5 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Intro Welcome Chime</div>
                        <div className="text-[11px] text-[#9ca3af]">
                          Plays the soothing ambient arpeggio chord when completing verification
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!soundSettings.masterSound}
                        onClick={() => handleUpdateSound({ introChime: !soundSettings.introChime })}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors border cursor-pointer ${
                          soundSettings.introChime && soundSettings.masterSound
                            ? 'bg-[#d47a37] border-[#f8b179]'
                            : 'bg-[#181d2a] border-[#252c3d] opacity-60'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                            soundSettings.introChime && soundSettings.masterSound
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Ambient BGM Drone */}
                    <div className="p-3.5 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">Ambient Executive BGM Drone</div>
                        <div className="text-[11px] text-[#9ca3af]">
                          Subtle, continuous focus synthesizer pad designed for deep study
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!soundSettings.masterSound}
                        onClick={() => {
                          const newBgm = !soundSettings.ambientBgm;
                          handleUpdateSound({ ambientBgm: newBgm });
                          if (newBgm && soundSettings.masterSound) {
                            startAmbientBgm(soundSettings.bgmVolume);
                          } else {
                            stopAmbientBgm();
                          }
                        }}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors border cursor-pointer ${
                          soundSettings.ambientBgm && soundSettings.masterSound
                            ? 'bg-[#d47a37] border-[#f8b179]'
                            : 'bg-[#181d2a] border-[#252c3d] opacity-60'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                            soundSettings.ambientBgm && soundSettings.masterSound
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* BGM Volume Slider */}
                    {soundSettings.ambientBgm && soundSettings.masterSound && (
                      <div className="p-3.5 bg-[#121622] border border-[#252c3d] rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-white">
                          <span className="flex items-center gap-1.5">
                            <Volume1 className="w-3.5 h-3.5 text-[#f8b179]" /> BGM Volume Level
                          </span>
                          <span className="font-mono text-[#f8b179]">{soundSettings.bgmVolume}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          step="5"
                          value={soundSettings.bgmVolume}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setSoundSettings((prev) => ({ ...prev, bgmVolume: val }));
                            setBgmVolumeLevel(val);
                            saveStoredSoundSettings({ bgmVolume: val });
                          }}
                          className="w-full accent-[#d47a37] cursor-pointer h-1.5 bg-[#1f2638] rounded-full"
                        />
                      </div>
                    )}

                    {/* Voice Auto-Speak */}
                    <div className="p-3.5 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">AI Voice Output (Text-to-Speech)</div>
                        <div className="text-[11px] text-[#9ca3af]">
                          Automatically reads out executive chatbot solutions using Web Speech Synthesis
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!soundSettings.masterSound}
                        onClick={() => handleUpdateSound({ voiceAutoSpeak: !soundSettings.voiceAutoSpeak })}
                        className={`w-10 h-5 rounded-full p-0.5 transition-colors border cursor-pointer ${
                          soundSettings.voiceAutoSpeak && soundSettings.masterSound
                            ? 'bg-[#d47a37] border-[#f8b179]'
                            : 'bg-[#181d2a] border-[#252c3d] opacity-60'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                            soundSettings.voiceAutoSpeak && soundSettings.masterSound
                              ? 'translate-x-5'
                              : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Sound Test Panel */}
                  <div className="p-4 bg-[#0a0d14] border border-[#252c3d] rounded-xl space-y-3">
                    <div className="text-xs font-bold text-[#f8b179] uppercase tracking-wider">
                       Audio Verification & Sound Test
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleTestIntroSound}
                        className="py-2.5 px-3 rounded-xl bg-[#121622] hover:bg-[#1a202c] border border-[#d47a37]/50 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 text-[#f8b179]" />
                        <span>Test Intro Chime</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleTestSuccessSound}
                        className="py-2.5 px-3 rounded-xl bg-[#121622] hover:bg-[#1a202c] border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Test Success Chime</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1b: AUTONOMOUS SAVING & ACCOUNT-ISOLATED DATA VAULT */}
              {activeTab === 'saving' && (
                <div className="space-y-6">
                  {/* Account Isolation Banner */}
                  <div className="p-4 bg-gradient-to-br from-[#121929] to-[#0c101c] border border-cyan-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <Database className="w-5 h-5 text-cyan-400" />
                        <div>
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <span>Account-Isolated Data Vault</span>
                            <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full">
                              STRICT PRIVACY
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400">
                            Active Account: <span className="font-mono text-cyan-300 font-semibold">{userSession?.email || 'guest@lurl.app'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">100% Isolated & Auto-Saved</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Every account maintains its own private vault. When you switch accounts or log into another profile, your chat history, VIP messages, worldwide posts, trading charts, and drawings automatically arrange per account without any data leakage.
                    </p>
                  </div>

                  {/* Master Auto-Save Toggle */}
                  <div className="p-4 bg-[#121622] border border-[#252c3d] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <Save className="w-4 h-4 text-[#f8b179]" />
                          <span>Autonomous Real-Time Saving</span>
                        </div>
                        <p className="text-xs text-[#9ca3af]">
                          Automatically saves every message, chart markup, trade, and profile change immediately to both local memory and the permanent cloud vault.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoSaveSettings.autoSaveEnabled}
                          onChange={(e) => {
                            playClickSound();
                            const updated = saveAutoSaveSettings({ autoSaveEnabled: e.target.checked }, userSession?.email);
                            setAutoSaveSettings(updated);
                            showToast(e.target.checked ? 'Autonomous real-time saving enabled' : 'Auto-saving paused');
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#1f2638] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d47a37]" />
                      </label>
                    </div>

                    {/* Real-Time Auto-Save Coverage Grid */}
                    <div className="pt-3 border-t border-[#1f2638] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-[#090c14] border border-[#1f2638] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🤖</span>
                          <div>
                            <div className="font-semibold text-white">AI Chatbot History</div>
                            <div className="text-[10px] text-gray-400">All 5 Tracks · Grounded Intelligence</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 rounded-full">Auto-Saving</span>
                      </div>

                      <div className="p-2.5 bg-[#090c14] border border-[#1f2638] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">👑</span>
                          <div>
                            <div className="font-semibold text-white">VIP Athena Chats & Defense</div>
                            <div className="text-[10px] text-gray-400">Encrypted Radar · Threat Matrices</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#ffd700] font-bold bg-[#ffd700]/10 px-2 py-0.5 border border-[#ffd700]/30 rounded-full">Encrypted</span>
                      </div>

                      <div className="p-2.5 bg-[#090c14] border border-[#1f2638] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📈</span>
                          <div>
                            <div className="font-semibold text-white">BTC Trading Charts & Markups</div>
                            <div className="text-[10px] text-gray-400">Timeframes · Drawings · Indicators</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 rounded-full">Auto-Saving</span>
                      </div>

                      <div className="p-2.5 bg-[#090c14] border border-[#1f2638] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🌐</span>
                          <div>
                            <div className="font-semibold text-white">Worldwide Chats & Reactions</div>
                            <div className="text-[10px] text-gray-400">Posts · Replies · Liked Ledgers</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/30 rounded-full">Auto-Saving</span>
                      </div>

                      <div className="p-2.5 bg-[#090c14] border border-[#1f2638] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📊</span>
                          <div>
                            <div className="font-semibold text-white">Word Conversion Charts</div>
                            <div className="text-[10px] text-gray-400">Copy Audits · Hook Scores · CVR</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 rounded-full">Auto-Saving</span>
                      </div>

                      <div className="p-2.5 bg-[#090c14] border border-[#1f2638] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">👤</span>
                          <div>
                            <div className="font-semibold text-white">Profile & Mastery Performance</div>
                            <div className="text-[10px] text-gray-400">Stage · Preferences · Curriculum</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30 rounded-full">Auto-Saving</span>
                      </div>
                    </div>
                  </div>

                  {/* Cloud Vault Actions */}
                  <div className="p-4 bg-[#121622] border border-[#252c3d] rounded-xl space-y-3">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <Cloud className="w-4 h-4 text-cyan-400" />
                      <span>Cloud Vault Synchronization & Backups</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        disabled={isSyncingVault}
                        onClick={async () => {
                          playClickSound();
                          setIsSyncingVault(true);
                          try {
                            const res = await syncFullVaultToServer(userSession?.email || 'guest@lurl.app');
                            if (res && res.success) {
                              playSuccessChime();
                              showToast('All chats, charts, and profile synchronized to cloud vault!');
                            } else {
                              showToast('Cloud vault synchronized locally');
                            }
                          } finally {
                            setIsSyncingVault(false);
                          }
                        }}
                        className="p-3 bg-[#181d2a] hover:bg-[#252c3d] border border-cyan-500/40 text-cyan-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingVault ? 'animate-spin' : ''}`} />
                        <span>{isSyncingVault ? 'Syncing...' : 'Sync All to Cloud Now'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isRestoringVault}
                        onClick={async () => {
                          playClickSound();
                          setIsRestoringVault(true);
                          try {
                            const res = await restoreFullVaultFromServer(userSession?.email || 'guest@lurl.app');
                            if (res && res.found) {
                              playSuccessChime();
                              showToast('Account chats, charts & profile restored from vault!');
                            } else {
                              showToast('Current account data re-aligned successfully');
                            }
                          } finally {
                            setIsRestoringVault(false);
                          }
                        }}
                        className="p-3 bg-[#181d2a] hover:bg-[#252c3d] border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isRestoringVault ? 'animate-spin' : ''}`} />
                        <span>{isRestoringVault ? 'Restoring...' : 'Restore & Re-Align Vault'}</span>
                      </button>
                    </div>

                    {/* JSON Export / Import buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          exportAccountDataJson(userSession?.email || 'guest@lurl.app');
                          showToast('Account data backup downloaded (.json)');
                        }}
                        className="p-2.5 bg-[#0c101a] hover:bg-[#141926] border border-[#252c3d] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Export Account Data (JSON)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setImportInputOpen(!importInputOpen);
                        }}
                        className="p-2.5 bg-[#0c101a] hover:bg-[#141926] border border-[#252c3d] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Import Account Backup</span>
                      </button>
                    </div>

                    {importInputOpen && (
                      <div className="p-3 bg-[#090b12] border border-[#1f2638] rounded-xl space-y-2 mt-2">
                        <div className="text-[11px] text-gray-300 font-semibold">Paste Backup JSON to Restore:</div>
                        <textarea
                          value={importJsonText}
                          onChange={(e) => setImportJsonText(e.target.value)}
                          placeholder="Paste exported LURL JSON backup here..."
                          className="w-full h-24 p-2 bg-[#121622] border border-[#252c3d] rounded-lg text-xs font-mono text-white resize-none focus:outline-none focus:border-cyan-500"
                        />
                        {importError && <div className="text-[11px] text-rose-400">{importError}</div>}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setImportInputOpen(false);
                              setImportJsonText('');
                              setImportError(null);
                            }}
                            className="px-3 py-1 bg-[#1a1f2e] text-gray-300 text-xs rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              playClickSound();
                              setImportError(null);
                              const success = await importAccountDataJson(importJsonText, userSession?.email || 'guest@lurl.app');
                              if (success) {
                                playSuccessChime();
                                showToast('Account backup successfully restored and synchronized!');
                                setImportInputOpen(false);
                                setImportJsonText('');
                              } else {
                                setImportError('Invalid JSON format or corrupted backup file.');
                              }
                            }}
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg cursor-pointer"
                          >
                            Restore Backup
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Danger Zone: Clear Current Account Only */}
                  <div className="p-4 bg-rose-950/15 border border-rose-900/40 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Clear Current Account History Only</span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Resets chats and chart drawings for <span className="text-white font-mono">{userSession?.email || 'guest@lurl.app'}</span>. All other accounts remain 100% unaffected.
                        </p>
                      </div>
                      {!clearConfirmOpen ? (
                        <button
                          type="button"
                          onClick={() => setClearConfirmOpen(true)}
                          className="px-3 py-1.5 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-700/50 text-rose-300 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Clear History
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setClearConfirmOpen(false)}
                            className="px-2.5 py-1 bg-[#181d2a] text-gray-300 text-xs rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              playClickSound();
                              await clearCurrentAccountData(userSession?.email || 'guest@lurl.app');
                              setClearConfirmOpen(false);
                              showToast(`History cleared for ${userSession?.email || 'guest@lurl.app'}`);
                            }}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Confirm Reset
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'account' && (
                <div className="space-y-5">
                  {/* Current Active Account Card */}
                  <div className="p-4 bg-[#121622] border border-[#252c3d] rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    {/* Rounded Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={userProfile.avatarUrl}
                        alt={userProfile.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-[#d47a37] shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border border-[#121622]" />
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <span className="font-['Cinzel'] text-base font-bold text-white">
                          {userProfile.name}
                        </span>
                        {Boolean(userSession?.isVip && isPrivilegedAdminEmail(userSession?.email)) ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#d47a37]/20 text-[#f8b179] text-[10px] font-mono font-bold border border-[#d47a37]/50 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-[#f8b179]" /> VIP Executive
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Verified Member
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-[#9ca3af] flex items-center justify-center sm:justify-start gap-1 font-mono">
                        <Mail className="w-3 h-3 text-[#f8b179]" />
                        <span>{maskEmail(userProfile.email)}</span>
                      </div>

                      <div className="text-xs text-[#6b7280]">
                        Age: <span className="text-white font-medium">{userProfile.age}</span> • Active Track:{' '}
                        <span className="text-[#f8b179] font-medium capitalize">
                          {userProfile.selectedCategory}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Account Action Buttons */}
                  <div className="space-y-3">
                    {/* Switch / Change Account Button */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-[#f8b179]" />
                          <span>Change / Switch Account</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Authenticate with a different Gmail address or VIP pass
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onClose();
                          onOpenAuthModal();
                        }}
                        className="py-2 px-4 rounded-xl bg-[#d47a37] hover:bg-[#b85d19] text-white text-xs font-bold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                      >
                        <span>Switch Account</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Edit Profile Button */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#f8b179]" />
                          <span>Edit Profile Credentials</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Change your profile name, age, primary track, and square logo
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onClose();
                          onOpenProfileModal();
                        }}
                        className="py-2 px-4 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Edit Profile
                      </button>
                    </div>

                    {/* Log Out Button */}
                    {userSession && (
                      <div className="p-4 bg-[#0f131d] border border-red-900/30 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-red-400 flex items-center gap-2">
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out of Current Session</span>
                          </div>
                          <p className="text-[11px] text-[#9ca3af] mt-0.5">
                            Ends session for {maskEmail(userSession.email)} on this browser
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            onLogout();
                            onClose();
                          }}
                          className="py-2 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SWIPE, EARTH NAVIGATION & GESTURE TELEMETRY */}
              {activeTab === 'gestures' && (
                <div className="space-y-5">
                  <div className="p-3.5 bg-[#121622] border border-[#252c3d] rounded-xl text-xs text-[#9ca3af] flex items-center justify-between gap-3">
                    <div>
                      <strong className="text-white">Swipe & Earth Navigation Engine:</strong> Calibrated touch gestures, zero-hanging HUD edge docking, and 100% online cloud synchronization telemetry.
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                      LIVE ENGINE
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Setting 1: Horizontal Tab Swipe Switching */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <MoveHorizontal className="w-4 h-4 text-[#f8b179]" />
                          <span>Horizontal Swipe Tab Switching</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Swipe left/right anywhere on the screen to switch between Codex, Skills, Trading, AI, and Network modules
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateGestures({
                            swipeTabNavigationEnabled: !gestureSettings.swipeTabNavigationEnabled,
                          })
                        }
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer border ${
                          gestureSettings.swipeTabNavigationEnabled
                            ? 'bg-[#d47a37] border-[#f8b179]'
                            : 'bg-[#181d2a] border-[#252c3d]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                            gestureSettings.swipeTabNavigationEnabled ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Setting 2: Swipe Sensitivity Calibration */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <Compass className="w-4 h-4 text-[#f8b179]" />
                          <span>Swipe Gesture Sensitivity & Distance Threshold</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#f8b179] uppercase">
                          {gestureSettings.swipeSensitivity}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9ca3af]">
                        Adjust how far you must swipe horizontally before a module transition triggers. Use Balanced or Strict to prevent accidental triggers while scrolling reading text.
                      </p>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {(
                          [
                            { id: 'sensitive', label: 'Ultra-Sensitive', desc: '45px threshold' },
                            { id: 'balanced', label: 'Balanced (Optimal)', desc: '70px threshold' },
                            { id: 'strict', label: 'Strict (Reading)', desc: '110px threshold' },
                          ] as const
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleUpdateGestures({ swipeSensitivity: opt.id })}
                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                              gestureSettings.swipeSensitivity === opt.id
                                ? 'bg-[#d47a37]/20 border-[#f8b179] text-white shadow-sm'
                                : 'bg-[#141824] border-[#252c3d] text-[#9ca3af] hover:text-white'
                            }`}
                          >
                            <div className="text-xs font-bold">{opt.label}</div>
                            <div className="text-[10px] text-[#6b7280] font-mono mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Setting 3: Floating HUD Dock (Eliminate Hanging Out) */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <Hand className="w-4 h-4 text-emerald-400" />
                          <span>Floating Bottom Module Gesture Dock</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Displays floating bottom quick-nav indicators. Keep OFF for clean, unhindered reading without any elements hanging out over content.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateGestures({
                            floatingHudVisible: !gestureSettings.floatingHudVisible,
                          })
                        }
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer border ${
                          gestureSettings.floatingHudVisible
                            ? 'bg-[#d47a37] border-[#f8b179]'
                            : 'bg-[#181d2a] border-[#252c3d]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                            gestureSettings.floatingHudVisible ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Setting 4: Auto-Hide HUD on Scroll (Zero Obstruction) */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4 text-[#f8b179]" />
                          <span>Auto-Tuck Edge HUD When Scrolling</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Smoothly tucks the edge drawer trigger flush against the screen margin while reading book chapters so it never hangs out over text.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateGestures({
                            autoHideHudOnScroll: !gestureSettings.autoHideHudOnScroll,
                          })
                        }
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer border ${
                          gestureSettings.autoHideHudOnScroll
                            ? 'bg-emerald-600 border-emerald-400'
                            : 'bg-[#181d2a] border-[#252c3d]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                            gestureSettings.autoHideHudOnScroll ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Setting 5: Swipe Audio & Haptic Sound */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-[#f8b179]" />
                          <span>Swipe Audio Sound Effects</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Play subtle mechanical whoosh / wipe audio when swiping between platform engines
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateGestures({
                            swipeSoundFeedback: !gestureSettings.swipeSoundFeedback,
                          })
                        }
                        className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer border ${
                          gestureSettings.swipeSoundFeedback
                            ? 'bg-[#d47a37] border-[#f8b179]'
                            : 'bg-[#181d2a] border-[#252c3d]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                            gestureSettings.swipeSoundFeedback ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Setting 6: 100% Online Earth Telemetry & Zero Fake Data Guarantee */}
                    <div className="p-4 bg-gradient-to-br from-[#0c1322] to-[#0a0d14] border border-emerald-500/40 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>100% Online Earth Telemetry & Real Information Guarantee</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          VERIFIED REAL
                        </span>
                      </div>
                      <p className="text-[11px] text-[#cbd5e1] leading-relaxed">
                        Nothing is simulated or placeholder. Every chapter manuscript, 500-page book stream, and quantitative derivation is synthesized directly from verified macroeconomic, quantitative trading, supply chain, and neuro-cognitive research.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                        <div className="p-2 rounded-lg bg-[#070a10] border border-[#1f2638]">
                          <span className="text-[#6b7280] block">Global Protocol</span>
                          <span className="text-emerald-400 font-bold">100% Live Online</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#070a10] border border-[#1f2638]">
                          <span className="text-[#6b7280] block">Chapters Depth</span>
                          <span className="text-[#f8b179] font-bold">500 Pages / Ch</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#070a10] border border-[#1f2638]">
                          <span className="text-[#6b7280] block">Total Platform Pages</span>
                          <span className="text-cyan-300 font-bold">37,500+ Pages</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#070a10] border border-[#1f2638]">
                          <span className="text-[#6b7280] block">Sync Latency</span>
                          <span className="text-emerald-300 font-bold">&lt; 18ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Reset Gestures Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          handleUpdateGestures({
                            swipeTabNavigationEnabled: true,
                            swipeSensitivity: 'balanced',
                            floatingHudVisible: false,
                            swipeSoundFeedback: true,
                            edgeSwipeDrawerEnabled: true,
                            autoHideHudOnScroll: true,
                          });
                          showToast('Gestures reset to default calibrated parameters');
                        }}
                        className="py-1.5 px-3 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-[#9ca3af] hover:text-white border border-[#252c3d] text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Reset Gesture Calibration to Defaults
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'restart' && (
                <div className="space-y-5">
                  <div className="p-3.5 bg-[#121622] border border-[#252c3d] rounded-xl text-xs text-[#9ca3af]">
                    Choose from granular restart operations or perform a complete platform reset to factory baseline.
                  </div>

                  <div className="space-y-3">
                    {/* Option 1: Restart Navigation to Welcome Page */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-[#f8b179]" />
                          <span>Restart Platform to Welcome Stage</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Returns the viewport to the introductory welcome experience while preserving your saved study data and account
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onRestartToWelcome();
                          onClose();
                        }}
                        className="py-2 px-3.5 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-white border border-[#252c3d] text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        Restart Stage
                      </button>
                    </div>

                    {/* Option 2: Reset Course & Chapter Progress */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#f8b179]" />
                          <span>Reset Learning Progress & Scores</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Clears completed chapters, mastery benchmarks, and quiz checkpoints back to 0%
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onResetProgress();
                          showToast('Learning progress reset to 0%');
                        }}
                        className="py-2 px-3.5 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-amber-400 border border-amber-500/40 text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        Reset Progress
                      </button>
                    </div>

                    {/* Option 3: Reset AI Chatbot Dialogue */}
                    <div className="p-4 bg-[#0f131d] border border-[#252c3d] rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-[#f8b179]" />
                          <span>Clear AI Chatbot History</span>
                        </div>
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">
                          Clears all active messages and diagnosis logs in the AI Chatbot to start a fresh query stream
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          onResetChatbot();
                          showToast('Chat history cleared');
                        }}
                        className="py-2 px-3.5 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-white border border-[#252c3d] text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        Clear Chat
                      </button>
                    </div>

                    {/* Option 4: Full Factory Reset */}
                    <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-red-400 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Factory Reset (Complete Platform Reset)</span>
                          </div>
                          <p className="text-[11px] text-[#9ca3af] mt-1 leading-relaxed">
                            Permanently wipes all local preferences, session tokens, custom thoughts, and resets all settings to original factory specifications.
                          </p>
                        </div>
                        {!factoryConfirmOpen && (
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setFactoryConfirmOpen(true);
                            }}
                            className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer transition-colors shrink-0 shadow-md"
                          >
                            Factory Reset
                          </button>
                        )}
                      </div>

                      {/* Confirmation Prompt */}
                      {factoryConfirmOpen && (
                        <div className="p-3 bg-red-950/60 border border-red-700 rounded-xl space-y-2 animate-fadeIn">
                          <div className="text-xs font-bold text-red-300">
                            Are you certain? This will wipe all progress and return the platform to zero.
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onFactoryReset();
                              }}
                              className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                            >
                              Yes, Reset Everything
                            </button>
                            <button
                              type="button"
                              onClick={() => setFactoryConfirmOpen(false)}
                              className="py-1.5 px-3 rounded-lg bg-[#121622] hover:bg-[#1a202c] text-gray-300 text-xs font-bold cursor-pointer border border-[#252c3d]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CYBER DEFENSE & MALWARE SENTINEL */}
              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div className="p-4 bg-gradient-to-br from-[#101726] to-[#0c101b] border border-emerald-500/30 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="text-sm font-bold text-white">Autonomous Cyber Defense Sentinel</div>
                          <div className="text-[11px] text-gray-400">Multi-Layer WAF · Heuristic Anti-Malware · Virus Immunity</div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                        100% ARMED
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed">
                      All system endpoints, feeds, and client sessions are protected against SQL injection, cross-site scripting (XSS), malware executable droppers (.exe, .dll, .bat, .sh), and unauthorized token forgery.
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                      <div className="p-2.5 bg-black/40 border border-gray-800 rounded-lg text-xs">
                        <span className="text-[10px] uppercase font-mono text-gray-400 block">Session Encryption</span>
                        <span className="font-mono text-emerald-400 font-bold mt-0.5 block">HMAC-SHA256 (Timing-Safe)</span>
                      </div>
                      <div className="p-2.5 bg-black/40 border border-gray-800 rounded-lg text-xs">
                        <span className="text-[10px] uppercase font-mono text-gray-400 block">Malware Droppers</span>
                        <span className="font-mono text-emerald-400 font-bold mt-0.5 block">0 Allowed (Quarantined)</span>
                      </div>
                    </div>

                    {onOpenSecuritySentinel && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            onClose();
                            onOpenSecuritySentinel();
                          }}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Launch Full Cyber Defense Sentinel & Run Malware Scan</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#0a0d14] border-t border-[#1f2638] flex items-center justify-between text-xs text-[#9ca3af]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>Executive State Synchronized</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="py-1.5 px-4 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-white border border-[#252c3d] font-semibold cursor-pointer transition-colors"
              >
                Close Settings
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
