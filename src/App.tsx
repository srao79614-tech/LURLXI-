/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CategoryType, UserSession, VipSettings, AppStage, UserProfile } from './types';
import { CATEGORIES_DATA } from './data/categoriesData';
import { ThreeDLogo } from './components/ThreeDLogo';
import { AuthModal } from './components/AuthModal';
import { LandingView } from './components/LandingView';
import { SelectionProcessView } from './components/SelectionProcessView';
import { BusinessBookCodex } from './components/BusinessBookCodex';
import { CodexBookmarksManager } from './components/CodexBookmarksManager';
import { AiChatbot } from './components/AiChatbot';
import { ShareThoughtsFuse } from './components/ShareThoughtsFuse';
import { UserPerformanceDashboard } from './components/UserPerformanceDashboard';
import { VipPortalModal } from './components/VipPortalModal';
import { MobileAppNavBar } from './components/MobileAppNavBar';
import { UserProfileModal } from './components/UserProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { BtcDemoTradingView } from './components/BtcDemoTradingView';
import { SlideBarMenu } from './components/SlideBarMenu';
import { SlideToOpenOption } from './components/SlideToOpenOption';
import { SkillsBookViewer } from './components/SkillsBookViewer';
import { GestureController } from './components/GestureController';
import { FloatingMetaAiChatbot } from './components/FloatingMetaAiChatbot';
import { FloatingWorldwideChat } from './components/FloatingWorldwideChat';
import { FloatingVipChat } from './components/FloatingVipChat';
import { CyberSecurityShieldModal } from './components/CyberSecurityShieldModal';
import { DeveloperCalligraphySignature } from './components/DeveloperCalligraphySignature';
import { AdMobBannerUnit, AdMobAppOpenAdModal } from './components/AdMobBannerUnit';
import { getActiveServerOrigin } from './utils/urlHelper';
import { calculateUserTenure, getTierBadgeStyle } from './utils/tierSystem';
import {
  getUserProfile,
  saveUserProfile,
  createDefaultProfileForAccount,
  resetUserProgress,
  syncProfileFromServer,
  syncPerformanceFromServer,
  restoreFullVaultFromServer,
  syncFullVaultToServer,
  scheduleVaultSync,
  getPermanentEmailCookie,
  setPermanentEmailCookie,
  clearPermanentEmailCookie,
  DEFAULT_USER_EMAIL,
} from './utils/userStorage';
import { logActivity } from './utils/activityHistory';
import { maskEmail, isPrivilegedAdminEmail } from './utils/maskEmail';
import { initSecurityShield } from './utils/securityShield';
import { testFirestoreConnection, auth, onAuthStateChanged, syncUserProfileToFirestore } from './firebase';
import {
  startAmbientBgm,
  stopAmbientBgm,
  isBgmPlaying,
  playClickSound,
} from './utils/soundEffects';
import {
  Crown,
  ShieldCheck,
  MessageSquare,
  LogOut,
  Mail,
  BookOpen,
  Bookmark,
  Bot,
  Zap,
  Download,
  CheckCircle2,
  Sparkles,
  Layers,
  ChevronRight,
  BarChart3,
  Volume2,
  VolumeX,
  ArrowLeft,
  SlidersHorizontal,
  User,
  RotateCcw,
  CandlestickChart,
  Globe,
  Compass,
  Smartphone,
  Home,
} from 'lucide-react';

export default function App() {
  // Synchronously restore verified session on mount if one exists specifically in this browser
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('lurl_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed?.email &&
          parsed?.isVerified &&
          /^[a-z0-9._%+-]+@gmail\.com$/i.test(String(parsed.email).trim())
        ) {
          parsed.isVip = isPrivilegedAdminEmail(parsed.email);
          parsed.hasEnteredWebsite = true;
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (userSession?.email && userSession.email !== 'guest@lurl.app') {
      return getUserProfile(userSession.email, 'trading');
    }
    return createDefaultProfileForAccount('guest@lurl.app', 'trading');
  });

  const [hasEnteredWebsite, setHasEnteredWebsite] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    if (
      userSession?.isVerified &&
      userSession?.email &&
      /^[a-z0-9._%+-]+@gmail\.com$/i.test(userSession.email.trim())
    ) {
      return true;
    }
    return false;
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCat = localStorage.getItem('lurl_selected_category') as CategoryType;
        if (savedCat && CATEGORIES_DATA[savedCat]) return savedCat;
      } catch {}
    }
    return userProfile?.selectedCategory || 'trading';
  });

  // Staged multi-step flow: 'landing' -> 'select' -> 'application'
  const [stage, setStage] = useState<AppStage>(() => {
    if (typeof window === 'undefined') return 'landing';
    const isGmailOk = Boolean(
      userSession?.isVerified &&
      userSession?.email &&
      /^[a-z0-9._%+-]+@gmail\.com$/i.test(userSession.email.trim())
    );
    if (!isGmailOk) {
      return 'landing';
    }
    try {
      const savedStageLocal = localStorage.getItem('lurl_active_stage') as AppStage;
      if (savedStageLocal === 'application' || savedStageLocal === 'select') {
        return savedStageLocal;
      }
    } catch {}
    const saved = userProfile?.savedStage;
    if (saved && saved !== 'landing') return saved;
    const pref = userProfile?.preferredTab;
    if (pref && pref !== 'home' && pref !== 'select') return 'application';
    return 'select';
  });

  const [selectSubTab, setSelectSubTab] = useState<'home' | 'categories'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const sub = localStorage.getItem('lurl_select_subtab');
        if (sub === 'home' || sub === 'categories') return sub;
      } catch {}
    }
    return 'home';
  });

  const [activeTab, setActiveTab] = useState<'codex' | 'bookmarks' | 'skills-book' | 'ai-chat' | 'share-thoughts' | 'performance' | 'demo-trading' | 'readymade'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTabLocal = localStorage.getItem('lurl_active_tab') as any;
        if (
          savedTabLocal &&
          ['codex', 'bookmarks', 'skills-book', 'ai-chat', 'share-thoughts', 'performance', 'demo-trading', 'readymade'].includes(
            savedTabLocal
          )
        ) {
          return savedTabLocal;
        }
      } catch {}
    }
    const pref = userProfile?.preferredTab;
    if (pref && pref !== 'home' && pref !== 'select') {
      return pref;
    }
    return 'codex';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isVipChatBoxOpen, setIsVipChatBoxOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSecurityShieldModalOpen, setIsSecurityShieldModalOpen] = useState(false);
  const [isSlideBarOpen, setIsSlideBarOpen] = useState(false);
  const [chatbotQuery, setChatbotQuery] = useState<string>('');
  const [isBgmOn, setIsBgmOn] = useState(false);
  const [progressResetCounter, setProgressResetCounter] = useState(0);
  const [chatbotResetCounter, setChatbotResetCounter] = useState(0);
  const [activeServerUrl, setActiveServerUrl] = useState<string>(() => getActiveServerOrigin());
  const [copiedUrlFeedback, setCopiedUrlFeedback] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [globalModuleToast, setGlobalModuleToast] = useState<{
    chapterTitle: string;
    category: string;
    newMastery: number;
  } | null>(null);

  // Initialize Autonomous Anti-Tamper & Intrusion Defense Shield
  useEffect(() => {
    const cleanupShield = initSecurityShield();
    return () => {
      cleanupShield();
    };
  }, []);

  // Whether the user has verified a valid Gmail ID AND actively entered the platform (never true on the 'landing' gate)
  const isGmailVerified = Boolean(
    userSession?.isVerified &&
    userSession?.email &&
    /^[a-z0-9._%+-]+@gmail\.com$/i.test(userSession.email.trim())
  );
  const isVerifiedAndEntered = Boolean(isGmailVerified && hasEnteredWebsite && stage !== 'landing');

  useEffect(() => {
    setActiveServerUrl(getActiveServerOrigin());
    testFirestoreConnection();

    // Firebase Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase().trim();
        const isVip =
          cleanEmail === 'srao79614@gmail.com' ||
          cleanEmail === 'lurlbusiness7@gmail.com' ||
          isPrivilegedAdminEmail(cleanEmail);

        syncUserProfileToFirestore(fbUser, {
          isVip,
          role: isVip ? 'VIP Executive Founder' : 'Verified Member',
        }).catch(() => {});

        setUserSession((prev) => {
          if (!prev) {
            return {
              email: cleanEmail,
              name: fbUser.displayName || cleanEmail.split('@')[0],
              verified: true,
              isVerified: true,
              verifiedAt: Date.now(),
              provider: 'gmail',
              isVip,
              hasEnteredWebsite: true,
            };
          }
          return {
            ...prev,
            email: cleanEmail,
            isVip: isVip || prev.isVip,
            isVerified: true,
          };
        });

        setUserProfile((prev) => ({
          ...prev,
          email: cleanEmail,
          isVip: isVip || prev.isVip,
          role: isVip ? 'VIP Executive Founder' : prev.role,
        }));
      }
    });

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      unsubscribeAuth();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for course module completions to display a subtle global reward animation
  useEffect(() => {
    const handleModuleCompleted = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setGlobalModuleToast({
          chapterTitle: customEvent.detail.chapterTitle || 'Course Module',
          category: customEvent.detail.category || 'codex',
          newMastery: customEvent.detail.newMastery || 100,
        });
        const t = setTimeout(() => setGlobalModuleToast(null), 5000);
        return () => clearTimeout(t);
      }
    };
    window.addEventListener('lurl-module-completed', handleModuleCompleted);
    return () => window.removeEventListener('lurl-module-completed', handleModuleCompleted);
  }, []);

  // Guarantee that slide bar never appears or stays open before the selection process
  useEffect(() => {
    if (stage !== 'application' || !isVerifiedAndEntered) {
      setIsSlideBarOpen(false);
    }
  }, [stage, isVerifiedAndEntered]);

  // Website Experience Tier calculated for current profile
  const headerTenure = calculateUserTenure(userProfile);
  const headerTierBadge = getTierBadgeStyle(headerTenure.currentTier);

  // VIP Settings in memory / synchronized with backend
  const [vipSettings, setVipSettings] = useState<VipSettings>({
    platformName: 'LURL Executive Core',
    tradingRiskCeiling: '1.5% Max Daily Drawdown',
    dropshippingAutoFulfill: 'Enabled (Sub-48h AI Dispatch)',
    ecommerceRetentionTarget: '38% 60-day Repeat Rate',
    startupMoatMultipliers: 'Proprietary Vector Memory + Zero Marginal Inference',
    executiveNotes: 'Private alpha unlocked for Authorized Executive.',
  });

  // Restore full permanent vault on mount ONLY for the currently authenticated session
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!userSession?.email || userSession.email === 'guest@lurl.app' || !userSession.isVerified) {
      return;
    }
    const currentEmail = userSession.email.trim().toLowerCase();
    restoreFullVaultFromServer(currentEmail, (restored) => {
      if (restored.email.toLowerCase() === currentEmail) {
        setUserSession(restored.session);
        setUserProfile(restored.profile);
        setHasEnteredWebsite(true);
        if (restored.profile.selectedCategory) {
          setSelectedCategory(restored.profile.selectedCategory);
        }
        const savedStage =
          (localStorage.getItem('lurl_active_stage') as AppStage) ||
          restored.profile.savedStage;
        const savedTab =
          (localStorage.getItem('lurl_active_tab') as any) ||
          restored.profile.preferredTab;
        if (savedTab && savedTab !== 'home' && savedTab !== 'select') {
          setActiveTab(savedTab);
          setStage(savedStage && savedStage !== 'landing' ? savedStage : 'application');
        } else {
          setStage(savedStage && savedStage !== 'landing' ? savedStage : 'select');
        }
      }
    });
  }, [userSession?.email]);

  // Sync permanent profile & performance with backend server disk on mount / login
  useEffect(() => {
    if (userSession?.email && userSession.isVerified) {
      setPermanentEmailCookie(userSession.email);
      syncProfileFromServer(userSession.email, (synced) => {
        setUserProfile(synced);
        if (synced.selectedCategory) {
          setSelectedCategory(synced.selectedCategory);
        }
      });
      syncPerformanceFromServer(userSession.email);
    }
  }, [userSession?.email, userSession?.isVerified]);

  // Automatically persist active category, tab, subTab, and stage into localStorage, userProfile, and Server Vault
  useEffect(() => {
    if (userSession?.email && isGmailVerified && hasEnteredWebsite && stage !== 'landing') {
      try {
        localStorage.setItem('lurl_selected_category', selectedCategory);
        localStorage.setItem('lurl_active_stage', stage);
        localStorage.setItem('lurl_active_tab', activeTab);
        localStorage.setItem('lurl_select_subtab', selectSubTab);
      } catch {}
      const currentProf = getUserProfile(userSession.email, selectedCategory);
      const updatedProf: UserProfile = {
        ...currentProf,
        selectedCategory,
        savedStage: stage,
        preferredTab: stage === 'select' ? 'select' : activeTab,
        hasEnteredWebsite: true,
      };
      const saved = saveUserProfile(updatedProf);
      setUserProfile(saved);
      scheduleVaultSync(userSession.email);
    }
  }, [selectedCategory, activeTab, selectSubTab, stage, hasEnteredWebsite, userSession?.email, isGmailVerified]);

  const handleProfileUpdated = (updated: UserProfile) => {
    const saved = saveUserProfile(updated);
    setUserProfile(saved);
    if (saved.selectedCategory && saved.selectedCategory !== selectedCategory) {
      setSelectedCategory(saved.selectedCategory);
    }
    if (saved.preferredTab && isVerifiedAndEntered) {
      if (saved.preferredTab === 'home' || saved.preferredTab === 'select') {
        setStage('select');
        setSelectSubTab('home');
      } else {
        setStage('application');
        setActiveTab(saved.preferredTab);
      }
    }
    if (userSession) {
      const updatedSession = { ...userSession, name: saved.name, age: saved.age, profile: saved, hasEnteredWebsite: true };
      setUserSession(updatedSession);
      localStorage.setItem('lurl_session', JSON.stringify(updatedSession));
      scheduleVaultSync(userSession.email);
    }
  };

  const handleLogout = () => {
    playClickSound();
    // Ensure current profile & vault remain permanently saved before ending active session
    if (userProfile?.email && userProfile.email !== 'guest@lurl.app') {
      saveUserProfile({ ...userProfile, hasEnteredWebsite: true });
      syncFullVaultToServer(userProfile.email);
    }
    fetch('/api/vault/logout', { method: 'POST' }).catch(() => {});
    clearPermanentEmailCookie();
    localStorage.setItem('lurl_explicit_logout', 'true');
    localStorage.removeItem('lurl_session');
    try {
      sessionStorage.removeItem('lurl_gmail_verified_v4');
      sessionStorage.removeItem('lurl_platform_entered_v4');
    } catch (e) {}
    setUserSession(null);
    setHasEnteredWebsite(false);
    // Switch display to guest profile while keeping user's permanent profile intact in storage
    setUserProfile(getUserProfile('guest@lurl.app', selectedCategory));
    setStage('landing');
    window.dispatchEvent(new CustomEvent('lurl-account-changed', { detail: { email: 'guest@lurl.app' } }));
  };

  const handleRestartToWelcome = () => {
    playClickSound();
    setStage('landing');
  };

  const handleResetProgress = () => {
    resetUserProgress(userSession?.email);
    setProgressResetCounter((prev) => prev + 1);
  };

  const handleResetChatbot = () => {
    setChatbotResetCounter((prev) => prev + 1);
  };

  const handleFactoryReset = () => {
    playClickSound();
    // Preserve permanent profile registry & session across resets so user's saved profile & login are never lost
    const permanentRegistry = localStorage.getItem('lurl_permanent_profiles_registry_v1');
    const lastVerified = localStorage.getItem('lurl_last_verified_profile_v1');
    const currentSession = localStorage.getItem('lurl_session');
    localStorage.clear();
    if (permanentRegistry) {
      localStorage.setItem('lurl_permanent_profiles_registry_v1', permanentRegistry);
    }
    if (lastVerified) {
      localStorage.setItem('lurl_last_verified_profile_v1', lastVerified);
    }
    if (currentSession) {
      localStorage.setItem('lurl_session', currentSession);
    }
    window.location.reload();
  };

  const handleToggleBgm = () => {
    playClickSound();
    if (isBgmOn) {
      stopAmbientBgm();
      setIsBgmOn(false);
    } else {
      startAmbientBgm(0.08);
      setIsBgmOn(true);
    }
  };

  const handleEnterWebsiteAfterVerification = (profileToUse?: UserProfile) => {
    const prof = profileToUse || userProfile;

    // Check if user needs first-time age profile completion
    const cleanEmail = userSession?.email?.toLowerCase().trim();
    const hasCompletedAge = cleanEmail && (
      localStorage.getItem(`lurl_age_profile_done_${cleanEmail}`) === 'true' ||
      Boolean(prof?.age && Number(prof.age) >= 18)
    );

    if (!hasCompletedAge && cleanEmail) {
      setIsAuthModalOpen(true);
      return;
    }

    try {
      localStorage.removeItem('lurl_explicit_logout');
      localStorage.setItem('lurl_gmail_verified_v4', 'true');
      localStorage.setItem('lurl_platform_entered_v4', 'true');
      sessionStorage.setItem('lurl_gmail_verified_v4', 'true');
      sessionStorage.setItem('lurl_platform_entered_v4', 'true');
    } catch (e) {}
    setHasEnteredWebsite(true);
    setSelectSubTab('home');
    if (userSession) {
      const updatedSession = { ...userSession, hasEnteredWebsite: true };
      setUserSession(updatedSession);
      localStorage.setItem('lurl_session', JSON.stringify(updatedSession));
      scheduleVaultSync(userSession.email);
    }
    const pref = prof?.preferredTab;
    if (pref === 'demo-trading') {
      setSelectedCategory('trading');
      setActiveTab('demo-trading');
    } else if (pref && pref !== 'home' && pref !== 'select') {
      setActiveTab(pref);
    } else {
      setActiveTab('performance');
    }
    // Directly open the application dashboard workspace
    setStage('application');
  };

  const handleLoginSuccess = (session: UserSession) => {
    // Flush previous account's state to permanent server vault before switching accounts
    if (
      userSession?.email &&
      userSession.email !== 'guest@lurl.app' &&
      userSession.email.toLowerCase() !== session.email.toLowerCase()
    ) {
      syncFullVaultToServer(userSession.email);
    }

    // 1-Time Permanent Login: Immediately verify, enter website, and restore permanent vault
    localStorage.removeItem('lurl_explicit_logout');
    const cleanEmail = session.email.toLowerCase().trim();
    const isVipEmail =
      cleanEmail === 'srao79614@gmail.com' ||
      cleanEmail === 'lurlbusiness7@gmail.com' ||
      isPrivilegedAdminEmail(cleanEmail);
    session.isVip = isVipEmail;
    session.hasEnteredWebsite = true;
    session.isVerified = true;
    setPermanentEmailCookie(session.email);

    const accountProfile = getUserProfile(session.email, selectedCategory);
    if (session.age) {
      accountProfile.age = Number(session.age);
    }
    if (session.profession) {
      accountProfile.profession = session.profession;
      accountProfile.role = isVipEmail ? 'VIP Executive Founder' : session.profession;
    }
    if (session.profile?.avatarUrl) {
      accountProfile.avatarUrl = session.profile.avatarUrl;
    }
    accountProfile.isVip = isVipEmail;
    if (!accountProfile.role) {
      accountProfile.role = isVipEmail ? 'VIP Executive Founder' : 'Verified Member';
    }
    accountProfile.hasEnteredWebsite = true;
    const savedProfile = saveUserProfile(accountProfile);
    session.profile = savedProfile;
    session.name = savedProfile.name;

    try {
      localStorage.setItem('lurl_gmail_verified_v4', 'true');
      localStorage.setItem('lurl_platform_entered_v4', 'true');
      sessionStorage.setItem('lurl_gmail_verified_v4', 'true');
      sessionStorage.setItem('lurl_platform_entered_v4', 'true');
      localStorage.setItem(`lurl_age_profile_done_${cleanEmail}`, 'true');
    } catch (e) {}

    setUserSession(session);
    localStorage.setItem('lurl_session', JSON.stringify(session));
    setUserProfile(savedProfile);
    if (savedProfile.selectedCategory) {
      setSelectedCategory(savedProfile.selectedCategory);
    }
    setHasEnteredWebsite(true);

    const pref = savedProfile.preferredTab;
    if (pref && pref !== 'home' && pref !== 'select') {
      setActiveTab(pref);
    } else {
      setActiveTab('performance');
    }
    // Directly open to the application dashboard!
    setStage('application');
    setIsAuthModalOpen(false);
    window.dispatchEvent(new CustomEvent('lurl-account-changed', { detail: { email: session.email } }));

    // Restore & sync full permanent vault from server disk for this Gmail account
    restoreFullVaultFromServer(session.email, (restored) => {
      setUserProfile(restored.profile);
      if (restored.profile.selectedCategory) {
        setSelectedCategory(restored.profile.selectedCategory);
      }
      if (restored.profile.preferredTab && restored.profile.preferredTab !== 'home' && restored.profile.preferredTab !== 'select') {
        setActiveTab(restored.profile.preferredTab);
        setStage('application');
      }
      window.dispatchEvent(new CustomEvent('lurl-account-changed', { detail: { email: session.email } }));
    }).then(() => {
      syncFullVaultToServer(session.email);
    });
  };

  const handleSelectTrack = (
    cat: CategoryType,
    defaultTab: 'codex' | 'skills-book' | 'ai-chat' | 'share-thoughts' | 'performance' | 'demo-trading' = 'codex'
  ) => {
    setSelectedCategory(cat);
    const nextTab = cat === 'skill-development' && defaultTab === 'codex' ? 'skills-book' : defaultTab;
    setActiveTab(nextTab);
    setStage('application');
    // Open slide bar immediately AFTER the selection process has completed!
    setIsSlideBarOpen(true);
    if (userSession?.email) {
      logActivity(
        cat,
        `Entered ${cat.toUpperCase()} Track (${nextTab})`,
        `Switched active focus to ${CATEGORIES_DATA[cat]?.title || cat}`,
        { tab: nextTab },
        userSession.email
      );
    }
  };

  const handleAskChatbotFromCodex = (query: string) => {
    setChatbotQuery(query);
    setActiveTab('ai-chat');
  };

  const categoryInfo = CATEGORIES_DATA[selectedCategory];

  return (
    <div className={`min-h-screen bg-[#080a0f] text-[#e5e7eb] font-['Plus_Jakarta_Sans'] antialiased selection:bg-[#d47a37]/30 selection:text-[#f8b179] ${isVerifiedAndEntered ? 'pb-20' : ''}`}>
      {/* Background 3D Radial Grid Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#d47a37]/10 via-transparent to-transparent blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#b85d19]/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f26380a_1px,transparent_1px),linear-gradient(to_bottom,#1f26380a_1px,transparent_1px)] bg-[size:3rem_3rem]" />
      </div>

      {/* Main Top Navigation Header with Stage Breadcrumbs */}
      <header
        id="lurl-main-header"
        className="sticky top-0 z-40 w-full bg-[#0a0d14]/90 border-b border-[#252c3d] backdrop-blur-md transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand Logo & Name with Slidebar Drawer Trigger */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Slidebar Menu Drawer Button - ONLY AFTER VERIFYING GMAIL & ENTERING WEBSITE */}
            {isVerifiedAndEntered && (
              <button
                type="button"
                id="header-slidebar-btn"
                onClick={() => {
                  playClickSound();
                  setIsSlideBarOpen(true);
                }}
                title="Open Slidebar Menu"
                className="p-2 text-[#f8b179] hover:text-white flex items-center gap-2 transition-colors cursor-pointer group shrink-0"
              >
                <span className="text-lg font-bold leading-none">☰</span>
                <span className="hidden sm:inline text-xs font-bold text-white group-hover:text-[#f8b179]">Menu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                playClickSound();
                if (isVerifiedAndEntered) {
                  setStage('select');
                  setSelectSubTab('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  setStage('landing');
                }
              }}
              className="flex items-center gap-3.5 cursor-pointer text-left group"
            >
              <ThreeDLogo size="sm" interactive={false} />
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-['Cinzel'] text-xl sm:text-2xl font-extrabold tracking-[0.2em] bg-gradient-to-r from-[#f8b179] via-[#d47a37] to-[#f3974e] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                    LURL
                  </span>
                  {Boolean(isVerifiedAndEntered && userSession?.isVip && isPrivilegedAdminEmail(userSession.email)) && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#ffd700] tracking-wider pl-1">
                      <Crown className="w-4 h-4 text-[#ffd700] drop-shadow-[0_0_8px_rgba(255,215,0,0.75)] shrink-0" />
                      <span>VIP</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#9ca3af] tracking-wider uppercase hidden sm:block mt-0.5">
                  Autonomous Business Codex
                </p>
              </div>
            </button>
          </div>

          {/* Right Action Tools: Tabs & Profile ONLY shown AFTER verifying Gmail and entering the website */}
          <div className="flex items-center gap-3 sm:gap-5">
            {isVerifiedAndEntered && (
              <>
                {/* Ambient BGM Synth Toggle */}
                <button
                  type="button"
                  id="bgm-audio-toggle-btn"
                  onClick={handleToggleBgm}
                  title={isBgmOn ? 'Mute Background Audio' : 'Play Background Ambient Music (BGM)'}
                  className={`p-2 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isBgmOn
                      ? 'text-[#f8b179]'
                      : 'text-[#9ca3af] hover:text-white'
                  }`}
                >
                  {isBgmOn ? (
                    <>
                      <Volume2 className="w-4 h-4 text-[#f8b179] animate-pulse shrink-0" />
                      <span className="hidden md:inline">BGM</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 shrink-0" />
                      <span className="hidden md:inline">BGM</span>
                    </>
                  )}
                </button>

                {/* Free-Standing Uncongested VIP Crown Symbol */}
                <button
                  type="button"
                  id="vip-portal-top-btn"
                  onClick={() => {
                    playClickSound();
                    setIsVipModalOpen(true);
                  }}
                  title="Open VIP Executive Portal"
                  className="px-2.5 py-1.5 text-xs font-bold text-[#ffd700] hover:text-amber-200 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer group"
                >
                  <Crown className="w-5 h-5 text-[#ffd700] drop-shadow-[0_0_10px_rgba(255,215,0,0.7)] shrink-0 transition-transform group-hover:scale-110" />
                  <span className="hidden sm:inline tracking-wider font-mono">VIP</span>
                </button>

                {/* Autonomous Cyber Defense Sentinel Shield Button */}
                <button
                  type="button"
                  id="header-security-shield-btn"
                  onClick={() => {
                    playClickSound();
                    setIsSecurityShieldModalOpen(true);
                  }}
                  title="Open Autonomous Cyber Defense Sentinel: Deep Packet WAF, Anti-Malware & Virus Immunity Shield"
                  className="px-2.5 py-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer group"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
                  <span className="hidden md:inline tracking-wider font-mono text-[11px] font-bold">100% Secure</span>
                </button>

                {/* Executive Settings Button */}
                <button
                  type="button"
                  id="header-settings-btn"
                  onClick={() => {
                    playClickSound();
                    setIsSettingsModalOpen(true);
                  }}
                  title="Open Executive Settings: Sound, Account Switch, and Restart All"
                  className="p-2 text-[#9ca3af] hover:text-[#f8b179] flex items-center gap-2 transition-all cursor-pointer group"
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#f8b179] group-hover:rotate-45 transition-transform shrink-0" />
                  <span className="hidden lg:inline text-xs font-semibold text-white group-hover:text-[#f8b179]">Settings</span>
                </button>

                {/* App Profile Button (Permanently Saved) */}
                <button
                  type="button"
                  id="header-profile-btn"
                  onClick={() => {
                    playClickSound();
                    setIsProfileModalOpen(true);
                  }}
                  title={`Open Permanently Saved Profile: ${headerTierBadge.label} Tier (${headerTenure.daysActive} days active)`}
                  className="flex items-center gap-2.5 py-1 px-2 hover:opacity-90 transition-all cursor-pointer group"
                >
                  <div className="relative shrink-0">
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#d47a37]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-[#0a0d14]" />
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-white group-hover:text-[#f8b179] transition-colors leading-none">
                      {userProfile.name}
                    </span>
                    <span className="text-[10px] text-[#9ca3af] leading-none mt-1">
                      {userProfile.profession || headerTierBadge.label} · <span className="capitalize text-[#f8b179]">{userProfile.selectedCategory}</span>
                    </span>
                  </div>
                </button>
              </>
            )}

            {/* Auth Button */}
            {isGmailVerified && userSession ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#252c3d]">
                {!isVerifiedAndEntered && (
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      handleEnterWebsiteAfterVerification();
                    }}
                    className="py-1.5 px-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Enter Platform</span>
                  </button>
                )}
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-white leading-none">
                    {userSession.email === 'lurlbusiness7@gmail.com'
                      ? 'Administrator'
                      : Boolean(userSession.isVip && isPrivilegedAdminEmail(userSession.email))
                      ? 'VIP Executive'
                      : maskEmail(userSession.email)}
                  </span>
                  <span className="text-[10px] text-[#34d399] font-mono mt-1">
                    {Boolean(userSession.isVip && isPrivilegedAdminEmail(userSession.email))
                      ? 'VIP Proprietor'
                      : 'Gmail Verified ✓'}
                  </span>
                </div>
                <button
                  type="button"
                  id="logout-btn"
                  onClick={handleLogout}
                  title="Logout session (Profile stays permanently saved)"
                  className="p-2 text-[#9ca3af] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="header-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>Verify Gmail to Enter</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Official Website Full Online Production Bar - ONLY SHOWN AFTER VERIFYING GMAIL & ENTERING WEBSITE */}
      {isVerifiedAndEntered && (
      <div className="bg-[#080b12] border-b border-[#1f2638] py-2 px-3 sm:px-4 text-xs select-none">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FULL ONLINE • 200 OK
            </span>
            <span className="text-gray-400 font-medium hidden sm:inline">Official URL:</span>
            <div className="flex items-center gap-1.5 bg-[#0e131f] px-2.5 py-0.5 rounded-lg border border-[#252f44]">
              <Globe className="w-3 h-3 text-[#f8b179]" />
              <span className="font-mono text-[#f8b179] font-bold select-all text-[11px] sm:text-xs tracking-tight">
                {activeServerUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(activeServerUrl);
                playClickSound();
                setCopiedUrlFeedback(true);
                setTimeout(() => setCopiedUrlFeedback(false), 2000);
              }}
              className="px-2.5 py-1 rounded text-[11px] font-bold text-[#f8b179] hover:text-white bg-[#161c2b] hover:bg-[#20293d] border border-[#d47a37]/40 flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              title="Copy official live URL to clipboard"
            >
              {copiedUrlFeedback ? '✓ Copied URL!' : '📋 Copy URL'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              className="px-2 py-1 rounded bg-[#10141f] hover:bg-[#1a2133] text-gray-300 hover:text-white border border-[#252c3d] cursor-pointer flex items-center gap-1"
              title="Toggle Fullscreen Edge-to-Edge Experience"
            >
              <span>⛶ Fullscreen</span>
            </button>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setStage('application');
                setActiveTab('codex');
              }}
              className="text-emerald-400 hover:text-white underline font-semibold cursor-pointer flex items-center gap-1"
              title="Open Infinite Online Knowledge Book (∞ Pages)"
            >
              <BookOpen className="w-3 h-3 text-emerald-400" />
              <span>Infinite Online Book (∞ Pages)</span>
            </button>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setStage('application');
                setActiveTab('performance');
              }}
              className="text-amber-300 hover:underline font-semibold cursor-pointer flex items-center gap-1"
              title="Open History & What You Learnt Vault"
            >
              <BarChart3 className="w-3 h-3 text-amber-300" />
              <span>History & Performance Vault</span>
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Subtle Floating Module Completion Progress Toast */}
      {globalModuleToast && (
        <div className="fixed top-24 right-6 z-50 max-w-sm rounded-2xl bg-gradient-to-r from-[#0c1f1a]/95 via-[#0e261f]/95 to-[#131824]/95 border border-emerald-500/50 p-4 shadow-[0_15px_45px_rgba(16,185,129,0.3)] backdrop-blur-xl animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Module Mastered • Saved to History
                </span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {globalModuleToast.newMastery}%
                </span>
              </div>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {globalModuleToast.chapterTitle}
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-[#090d14] overflow-hidden border border-emerald-500/30">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300 transition-all duration-700"
                  style={{ width: `${globalModuleToast.newMastery}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 100% Online Live Connection Guard Overlay (Displayed only if browser loses internet connection) */}
      {!isOnline && (
        <div className="fixed inset-0 z-50 bg-[#06080d]/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-[#0e131f] border border-amber-500/40 p-6 sm:p-8 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
              <Globe className="w-7 h-7 animate-pulse" />
            </div>
            <h2 className="font-['Cinzel'] text-xl font-bold text-white">
              Active Online Connection Required
            </h2>
            <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
              LURL operates <strong className="text-white">100% Full Online</strong> to synthesize live infinite book pages, real-time worldwide strategy streams, and AI doubt clarification. Please connect to the internet to continue.
            </p>
            <button
              type="button"
              onClick={() => setIsOnline(navigator.onLine)}
              className="w-full py-3 px-5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] cursor-pointer shadow-lg"
            >
              Verify Online Connection & Resume
            </button>
          </div>
        </div>
      )}

      {/* Main Multi-Stage Body - Strictly gated behind Gmail Verification & Website Entry */}
      <main className="relative z-10 min-h-[calc(100vh-140px)]">
        {/* STAGE 1: Welcome & Landing Portal (Always shown before verifying Gmail & entering platform) */}
        {(!isVerifiedAndEntered || stage === 'landing') && (
          <LandingView
            onEnterSelection={() => {
              if (!isGmailVerified) {
                setIsAuthModalOpen(true);
              } else {
                handleEnterWebsiteAfterVerification();
              }
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenPerformance={() => {
              if (!isGmailVerified) {
                setIsAuthModalOpen(true);
              } else {
                try {
                  sessionStorage.setItem('lurl_gmail_verified_v4', 'true');
                  sessionStorage.setItem('lurl_platform_entered_v4', 'true');
                } catch (e) {}
                setHasEnteredWebsite(true);
                setStage('application');
                setActiveTab('performance');
              }
            }}
            onOpenStandaloneDownload={() => {
              if (!isGmailVerified) {
                setIsAuthModalOpen(true);
              } else {
                try {
                  sessionStorage.setItem('lurl_gmail_verified_v4', 'true');
                  sessionStorage.setItem('lurl_platform_entered_v4', 'true');
                } catch (e) {}
                setHasEnteredWebsite(true);
                setStage('application');
                setActiveTab('codex');
              }
            }}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            userSession={userSession}
            userProfile={userProfile}
          />
        )}

        {/* STAGE 2: Selection Process (ONLY accessible after verifying Gmail & entering website) */}
        {isVerifiedAndEntered && stage === 'select' && (
          <SelectionProcessView
            onSelectTrack={handleSelectTrack}
            onOpenPerformanceDashboard={() => {
              setStage('application');
              setActiveTab('performance');
            }}
            onOpenVipPortal={() => setIsVipModalOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onBack={handleRestartToWelcome}
            userSession={userSession}
            userProfile={userProfile}
          />
        )}

        {/* STAGE 3: The Dedicated Application Process (ONLY accessible after verifying Gmail & entering website) */}
        {isVerifiedAndEntered && stage === 'application' && (
          <div className="w-full">
            {/* Compact Context Strip: Active Focus Track & Full Top Navigation Menu */}
            <div className="bg-[#0b0e16] border-b border-[#252c3d] py-2.5 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setStage('select');
                    }}
                    className="py-1 px-3 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-xs font-semibold text-[#f8b179] border border-[#d47a37]/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Back to Selection Process & Track Chooser"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Selection Process
                  </button>

                  <div className="h-4 w-px bg-[#252c3d] hidden sm:block" />

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6b7280] hidden sm:inline">Active Track:</span>
                    <span className="font-bold text-[#f8b179] capitalize">
                      {categoryInfo.title.split('&')[0]}
                    </span>
                  </div>
                </div>

                {/* Full In-Page Navigation Menu Tabs */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab('codex');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'codex'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-[#141824]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Code X</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab('bookmarks');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'bookmarks'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-[#141824]'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab('share-thoughts');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'share-thoughts'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-[#141824]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                    <span>AI Fuse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab('ai-chat');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'ai-chat'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-[#141824]'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Chatbot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      if (selectedCategory !== 'trading') {
                        setSelectedCategory('trading');
                      }
                      setActiveTab('demo-trading');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'demo-trading' || activeTab === 'skills-book'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-[#141824]'
                    }`}
                  >
                    <CandlestickChart className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Trading</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab('performance');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'performance'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-[#141824]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-[#f8b179]" />
                    <span>Performance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Application Workspace View */}
            {activeTab === 'demo-trading' && selectedCategory === 'trading' && (
              <div className="w-full px-2 sm:px-4 py-2 sm:py-4 animate-in fade-in duration-300">
                <BtcDemoTradingView
                  userSession={userSession}
                  userProfile={userProfile}
                  onOpenProfile={() => setIsProfileModalOpen(true)}
                  onAskChatbot={(prompt) => {
                    setChatbotQuery(prompt);
                    setActiveTab('ai-chat');
                  }}
                />
              </div>
            )}

            {activeTab === 'skills-book' && (
              <SkillsBookViewer
                onAskChatbot={(prompt) => {
                  setChatbotQuery(prompt);
                  setActiveTab('ai-chat');
                }}
                onBackToCourses={() => setActiveTab('codex')}
              />
            )}

            {activeTab === 'codex' && (
              <BusinessBookCodex
                categoryInfo={categoryInfo}
                onAskChatbot={handleAskChatbotFromCodex}
                onViewPerformance={() => setActiveTab('performance')}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
                resetKey={progressResetCounter}
                userEmail={userSession?.email}
                onOpenBookmarks={() => setActiveTab('bookmarks')}
              />
            )}

            {activeTab === 'bookmarks' && (
              <CodexBookmarksManager
                onNavigateToPage={(category, chapterId, pageNumber) => {
                  setSelectedCategory(category);
                  setActiveTab('codex');
                  window.dispatchEvent(
                    new CustomEvent('lurl-navigate-to-page', {
                      detail: { category, chapterId, pageNumber },
                    })
                  );
                }}
                onBackToCodex={() => setActiveTab('codex')}
                userEmail={userSession?.email}
              />
            )}

            {activeTab === 'ai-chat' && (
              <AiChatbot
                category={selectedCategory}
                initialQuery={chatbotQuery}
                onClearInitialQuery={() => setChatbotQuery('')}
                resetKey={chatbotResetCounter}
              />
            )}

            {activeTab === 'share-thoughts' && (
              <ShareThoughtsFuse
                currentCategory={selectedCategory}
                userSession={userSession}
                onRequestLogin={() => setIsAuthModalOpen(true)}
              />
            )}

            {activeTab === 'performance' && (
              <UserPerformanceDashboard
                userEmail={userSession?.email}
                resetKey={progressResetCounter}
                onSelectCourse={(cat) => {
                  setSelectedCategory(cat);
                  setActiveTab('codex');
                }}
                onAskVoiceAdvisor={(prompt, cat) => {
                  if (cat) setSelectedCategory(cat);
                  setChatbotQuery(prompt);
                  setActiveTab('ai-chat');
                }}
              />
            )}

            {/* Integrated Google AdMob Unit (ca-app-pub-3767067209003943/1431647456) */}
            <AdMobBannerUnit placement="workspace" />
          </div>
        )}
      </main>

      {/* Global Footer with Full Online Credentials */}
      <footer className="relative z-10 border-t border-[#252c3d] bg-[#07090e] py-8 px-4 sm:px-6 text-center text-xs text-[#6b7280]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="font-['Cinzel'] font-bold text-white tracking-widest">LURL</span>
              <span>•</span>
              <span className="text-gray-300 font-medium">Autonomous Business Intelligence Platform</span>
            </div>
            <span className="hidden sm:inline text-gray-700">|</span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Online: <span className="text-[#f8b179] font-bold select-all">{activeServerUrl}</span></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(activeServerUrl);
                playClickSound();
                setCopiedUrlFeedback(true);
                setTimeout(() => setCopiedUrlFeedback(false), 2000);
              }}
              className="text-[#f8b179] hover:underline cursor-pointer font-semibold flex items-center gap-1"
            >
              <span>{copiedUrlFeedback ? '✓ Copied URL' : '📋 Copy URL'}</span>
            </button>
            {isVerifiedAndEntered && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setStage('select');
                  }}
                  className="text-[#9ca3af] hover:text-white cursor-pointer"
                >
                  Selection Process
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setStage('application');
                    setActiveTab('performance');
                  }}
                  className="text-[#9ca3af] hover:text-white cursor-pointer"
                >
                  Performance Graphic
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsSettingsModalOpen(true);
                  }}
                  className="text-[#f8b179] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-3 h-3 text-[#f8b179]" />
                  <span>Settings</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom-most Small Calligraphy Developer Signature visible on scrolling down */}
        <DeveloperCalligraphySignature variant="footer" />
      </footer>

      {/* Google AdMob App Open Ad Unit (ca-app-pub-3767067209003943/1431647456) on App Launch */}
      <AdMobAppOpenAdModal />

      {/* Auth Modal (Gmail ID & Step 2 Verification + Age Profile) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        defaultEmail={userSession?.email || DEFAULT_USER_EMAIL}
        existingProfile={userProfile}
      />

      {/* VIP Executive Portal Modal */}
      <VipPortalModal
        isOpen={isVipModalOpen}
        onClose={() => setIsVipModalOpen(false)}
        userSession={userSession}
        onSaveSettings={(newSettings) => setVipSettings(newSettings)}
        onOpenVipChatBox={() => {
          setIsVipModalOpen(false);
          setIsVipChatBoxOpen(true);
        }}
        onNavigateBack={(destination) => {
          setIsVipModalOpen(false);
          if (!destination) return;
          if (destination === 'home') {
            setStage('select');
            setSelectSubTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (destination === 'categories') {
            setStage('select');
            setSelectSubTab('categories');
            setTimeout(() => {
              const el = document.getElementById('platform-categories-grid');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
          } else if (destination === 'codex') {
            setStage('application');
            setActiveTab('codex');
          } else if (destination === 'trading') {
            setSelectedCategory('trading');
            setStage('application');
            setActiveTab('demo-trading');
          } else if (destination === 'performance') {
            setStage('application');
            setActiveTab('performance');
          }
        }}
      />

      {/* Floating Interactive Chat Widgets - ONLY SHOWN AFTER GMAIL VERIFICATION & PLATFORM ENTRY */}
      {isVerifiedAndEntered && (
        <>
          {/* Floating VIP Chatting Icon & Room (Athena AI & Anti-Tamper Defense Sentinel) */}
          <FloatingVipChat
            isOpen={isVipChatBoxOpen}
            onOpen={() => setIsVipChatBoxOpen(true)}
            onClose={() => setIsVipChatBoxOpen(false)}
            userSession={userSession}
            onElevateVip={() => {
              if (userSession) {
                const elevatedSession = { ...userSession, isVip: true };
                setUserSession(elevatedSession);
                localStorage.setItem('lurl_session', JSON.stringify(elevatedSession));
              }
              const elevatedProfile = { ...userProfile, isVip: true, role: 'VIP Executive' };
              saveUserProfile(elevatedProfile);
              setUserProfile(elevatedProfile);
            }}
          />

          {/* WhatsApp Meta AI Style Floating Chatbot Button & Dialog */}
          <FloatingMetaAiChatbot
            currentCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />

          {/* Floating Worldwide Conversation Icon & Stream Window */}
          <FloatingWorldwideChat />
        </>
      )}

      {/* User Profile Modal (Gmail, Name, Age, Selected Track, Avatar Logo) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userSession={userSession}
        currentCategory={selectedCategory}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Executive Settings Modal (Sound, Account Switch, Restart All) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        userSession={userSession}
        userProfile={userProfile}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSecuritySentinel={() => setIsSecurityShieldModalOpen(true)}
        onLogout={handleLogout}
        onRestartToWelcome={handleRestartToWelcome}
        onResetProgress={handleResetProgress}
        onResetChatbot={handleResetChatbot}
        onFactoryReset={handleFactoryReset}
      />

      {/* Autonomous Cyber Defense Sentinel Modal */}
      <CyberSecurityShieldModal
        isOpen={isSecurityShieldModalOpen}
        onClose={() => setIsSecurityShieldModalOpen(false)}
        userEmail={userSession?.email}
        isVip={userSession?.isVip}
      />

      {/* Full-Featured Slide Bar Navigation Menu - ONLY AFTER VERIFYING GMAIL & ENTERING WEBSITE */}
      {isVerifiedAndEntered && (
        <>
          <SlideBarMenu
            isOpen={isSlideBarOpen}
            onClose={() => setIsSlideBarOpen(false)}
            onNavigate={(targetStage, targetTab) => {
              if (targetStage === 'landing') {
                handleRestartToWelcome();
                return;
              }
              setStage(targetStage);
              if (targetTab) {
                setActiveTab(targetTab);
              }
            }}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenVipPortal={() => setIsVipModalOpen(true)}
            onOpenVipChatBox={() => setIsVipChatBoxOpen(true)}
            onOpenSecuritySentinel={() => setIsSecurityShieldModalOpen(true)}
            onOpenStandaloneDownload={() => {
              setStage('application');
              setActiveTab('performance');
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            isBgmOn={isBgmOn}
            onToggleBgm={handleToggleBgm}
            userSession={userSession}
            userProfile={userProfile}
            selectedCategory={selectedCategory}
            currentTab={stage === 'application' ? activeTab : undefined}
          />

          {/* Interactive Slide Option: Drag or swipe to the left to open sidebar */}
          <SlideToOpenOption
            isOpen={isSlideBarOpen}
            onOpen={() => setIsSlideBarOpen(true)}
            onClose={() => setIsSlideBarOpen(false)}
          />

          {/* Real-Time Gesture Swipe & Fast Tab Switch Controller */}
          <GestureController
            currentTab={activeTab as any}
            onTabChange={(newTab) => {
              setStage('application');
              setActiveTab(newTab);
            }}
            enabled={true}
          />

          {/* Unified Bottom ("Down") Navigation Bar - ONLY AFTER VERIFYING GMAIL & ENTERING PLATFORM */}
          <MobileAppNavBar
            stage={stage}
            activeTab={activeTab}
            selectSubTab={selectSubTab}
            onNavigateHome={() => {
              setStage('select');
              setSelectSubTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateCategories={() => {
              setStage('select');
              setSelectSubTab('categories');
              setTimeout(() => {
                const el = document.getElementById('platform-categories-grid');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 60);
            }}
            onNavigateCodex={() => {
              setStage('application');
              setActiveTab('codex');
            }}
            onNavigateSkillsBook={() => {
              setStage('application');
              setActiveTab('skills-book');
            }}
            onNavigateTrading={() => {
              setSelectedCategory('trading');
              setStage('application');
              setActiveTab('demo-trading');
            }}
            onNavigateChatbot={() => {
              setStage('application');
              setActiveTab('ai-chat');
            }}
            onNavigateThoughtsFuse={() => {
              setStage('application');
              setActiveTab('share-thoughts');
            }}
            onNavigatePerformance={() => {
              setStage('application');
              setActiveTab('performance');
            }}
            onNavigateBookmarks={() => {
              setStage('application');
              setActiveTab('bookmarks');
            }}
          />
        </>
      )}
    </div>
  );
}
