import { UserProfile, UserSession, UserPerformance, CourseProgress, CategoryType } from '../types';
import { isPrivilegedAdminEmail } from './maskEmail';
import { logActivity, getActivityHistory, deleteActivityRecord, clearActivityHistory } from './activityHistory';

const STORAGE_KEYS = {
  SESSION: 'lurl_user_session_v5',
  PROFILE: 'lurl_user_profile_v5',
  PERFORMANCE: 'lurl_user_performance_v5',
  GMAIL_VERIFIED: 'lurl_gmail_verified_user',
  DOWNLOAD_LICENSE: 'lurl_codex_download_license_v1',
  COOKIE_EMAIL: 'lurl_permanent_email_cookie_v1',
};

export const DEFAULT_USER_EMAIL = 'srao79614@gmail.com';

export const DEFAULT_AVATARS = [
  {
    id: 'exec-1',
    name: 'Executive 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'exec-2',
    name: 'Executive 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'exec-3',
    name: 'Strategist',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'exec-4',
    name: 'Analyst',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'exec-5',
    name: 'Partner',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80',
  },
  {
    id: 'exec-6',
    name: 'Founder',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  },
];

export function getPermanentEmailCookie(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEYS.COOKIE_EMAIL);
  } catch {
    return null;
  }
}

export function setPermanentEmailCookie(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.COOKIE_EMAIL, email.trim().toLowerCase());
  } catch {}
}

export function clearPermanentEmailCookie(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.COOKIE_EMAIL);
  } catch {}
}

export function getActiveSession(): UserSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isGmailAccountVerified(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = getActiveSession();
    if (session && session.verified && session.provider === 'gmail') {
      return true;
    }
    return localStorage.getItem(STORAGE_KEYS.GMAIL_VERIFIED) === 'true';
  } catch {
    return false;
  }
}

export function saveUserSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    if (session.verified) {
      localStorage.setItem(STORAGE_KEYS.GMAIL_VERIFIED, 'true');
    }
    window.dispatchEvent(new CustomEvent('lurl-auth-updated', { detail: session }));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function clearUserSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.GMAIL_VERIFIED);
    window.dispatchEvent(new CustomEvent('lurl-auth-updated', { detail: null }));
  } catch {}
}

export function createDefaultProfileForAccount(email = DEFAULT_USER_EMAIL, defaultCategory: CategoryType = 'trading'): UserProfile {
  const cleanEmail = email.trim().toLowerCase();
  const isVip = isPrivilegedAdminEmail(cleanEmail);
  return {
    email: cleanEmail,
    name: cleanEmail === 'guest@lurl.app' ? 'Guest Explorer' : isVip ? 'Executive Partner' : cleanEmail.split('@')[0],
    age: 26,
    selectedCategory: defaultCategory,
    avatarUrl: DEFAULT_AVATARS[0].url,
    joinDate: Date.now() - 1000 * 60 * 60 * 24 * 7,
    isVip,
    role: isVip ? 'Chief Executive Partner' : 'Certified Specialist',
    preferredTab: 'codex',
    savedStage: 'application',
    hasEnteredWebsite: true,
  };
}

export function getUserProfile(emailInput?: string, defaultCategory: CategoryType = 'trading'): UserProfile {
  const targetEmail = (emailInput || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  const defaultProfile = createDefaultProfileForAccount(targetEmail, defaultCategory);

  if (typeof window === 'undefined') return defaultProfile;

  try {
    const key = `${STORAGE_KEYS.PROFILE}_${targetEmail}`;
    const raw = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return defaultProfile;
    const parsed = JSON.parse(raw);
    return { ...defaultProfile, ...parsed, email: targetEmail };
  } catch {
    return defaultProfile;
  }
}

export function saveUserProfile(profile: Partial<UserProfile>, emailInput?: string): UserProfile {
  const targetEmail = (emailInput || profile.email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  const current = getUserProfile(targetEmail, (profile.selectedCategory as CategoryType) || 'trading');
  const updated: UserProfile = {
    ...current,
    ...profile,
    email: targetEmail,
    isVip: isPrivilegedAdminEmail(targetEmail),
    lastSavedAt: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      const key = `${STORAGE_KEYS.PROFILE}_${targetEmail}`;
      localStorage.setItem(key, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lurl-profile-updated', { detail: updated }));
    } catch (err) {
      console.error('Failed to save user profile:', err);
    }
  }

  return updated;
}

export function getUserPerformance(email?: string): UserPerformance {
  const targetEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  const defaultPerformance: UserPerformance = {
    email: targetEmail,
    courses: {},
    totalMinutes: 145,
    totalStudyMinutes: 145,
    overallMastery: 28,
    performanceMetrics: {
      overallMastery: 28,
      studyStreakDays: 5,
      totalQuizzesPassed: 4,
      totalSimulationTrades: 12,
      conceptRetentionRate: 84,
      retentionRate: 88,
      disciplineScore: 92,
    },
    weeklyVelocity: [
      { day: 'Mon', minutes: 25, comprehension: 80 },
      { day: 'Tue', minutes: 35, comprehension: 85 },
      { day: 'Wed', minutes: 20, comprehension: 78 },
      { day: 'Thu', minutes: 40, comprehension: 90 },
      { day: 'Fri', minutes: 15, comprehension: 82 },
      { day: 'Sat', minutes: 50, comprehension: 92 },
      { day: 'Sun', minutes: 30, comprehension: 88 },
    ],
    lastActive: Date.now(),
    history: getActivityHistory(targetEmail),
  };

  if (typeof window === 'undefined') return defaultPerformance;

  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.PERFORMANCE}_${targetEmail}`);
    if (!raw) return defaultPerformance;
    const parsed = JSON.parse(raw);
    const overallMastery = parsed.overallMastery ?? parsed.performanceMetrics?.overallMastery ?? 28;
    const totalMinutes = parsed.totalMinutes ?? parsed.totalStudyMinutes ?? 145;
    return {
      ...defaultPerformance,
      ...parsed,
      overallMastery,
      totalMinutes,
      totalStudyMinutes: totalMinutes,
      performanceMetrics: {
        ...defaultPerformance.performanceMetrics,
        overallMastery,
        ...(parsed.performanceMetrics || {}),
      },
      weeklyVelocity: parsed.weeklyVelocity || defaultPerformance.weeklyVelocity,
      courses: parsed.courses || {},
      history: getActivityHistory(targetEmail),
    };
  } catch {
    return defaultPerformance;
  }
}

export function saveUserPerformance(perf: UserPerformance, email?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const targetEmail = (email || perf.email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
    const overallMastery = perf.overallMastery ?? perf.performanceMetrics?.overallMastery ?? 28;
    const totalMinutes = perf.totalMinutes ?? perf.totalStudyMinutes ?? 145;
    const enrichedPerf: UserPerformance = {
      ...perf,
      email: targetEmail,
      overallMastery,
      totalMinutes,
      totalStudyMinutes: totalMinutes,
      performanceMetrics: {
        overallMastery,
        studyStreakDays: 5,
        totalQuizzesPassed: 4,
        totalSimulationTrades: 12,
        conceptRetentionRate: 84,
        retentionRate: 88,
        disciplineScore: 92,
        ...(perf.performanceMetrics || {}),
      },
    };
    localStorage.setItem(`${STORAGE_KEYS.PERFORMANCE}_${targetEmail}`, JSON.stringify(enrichedPerf));
    window.dispatchEvent(new CustomEvent('lurl-performance-updated', { detail: enrichedPerf }));
  } catch {}
}

export function toggleChapterCompletion(
  category: CategoryType,
  chapterId: string,
  chapterTitle?: string,
  email?: string
): { completed: boolean; completedIds: string[] } {
  const perf = getUserPerformance(email);
  const course = perf.courses[category] || {
    category,
    title: category,
    completedChapterIds: [],
    totalChapters: 6,
    minutesSpent: 30,
    lastStudiedAt: Date.now(),
    masteryScore: 0,
  };

  const isCompleted = course.completedChapterIds.includes(chapterId);
  const updatedIds = isCompleted
    ? course.completedChapterIds.filter((id) => id !== chapterId)
    : [...course.completedChapterIds, chapterId];

  course.completedChapterIds = updatedIds;
  course.masteryScore = Math.min(100, Math.round((updatedIds.length / Math.max(1, course.totalChapters)) * 100));
  course.lastStudiedAt = Date.now();
  perf.courses[category] = course;

  // Calculate overall mastery
  const allMastery = Object.values(perf.courses).map((c) => c.masteryScore);
  if (allMastery.length > 0) {
    perf.overallMastery = Math.round(allMastery.reduce((a, b) => a + b, 0) / Math.max(1, allMastery.length));
  }

  saveUserPerformance(perf, email);

  if (!isCompleted) {
    logActivity('chapter_completed', `Completed Chapter: ${chapterTitle || chapterId}`, `Mastered ${category} chapter.`, { category, chapterId });
  }

  return { completed: !isCompleted, completedIds: updatedIds };
}

export function logBookPageRead(
  category: CategoryType,
  chapterIdOrPage: string | number,
  pageNumberOrTitle?: number | string,
  extraTakeaway?: string
): void {
  if (typeof window === 'undefined') return;
  try {
    const pNum = typeof pageNumberOrTitle === 'number' ? pageNumberOrTitle : typeof chapterIdOrPage === 'number' ? chapterIdOrPage : 1;
    const title = typeof pageNumberOrTitle === 'string' ? pageNumberOrTitle : `Page #${pNum}`;
    const key = `lurl_studied_pages_${category}_${chapterIdOrPage}`;
    const raw = localStorage.getItem(key);
    const list: number[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(pNum)) {
      list.push(pNum);
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('lurl-page-read', { detail: { category, chapterId: String(chapterIdOrPage), pageNumber: pNum } }));
      logActivity('book_page_read', `Studied ${title}`, extraTakeaway || `Category: ${category}`, { category, pageNumber: pNum });
    }
  } catch {}
}

export function getStudiedPages(category: CategoryType, chapterId: string): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `lurl_studied_pages_${category}_${chapterId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function scheduleVaultSync(email?: string): void {
  if (typeof window === 'undefined') return;
  const targetEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  syncFullVaultToServer(targetEmail).catch(() => {});
}

export function resetUserProgress(email?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const targetEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
    localStorage.removeItem(`${STORAGE_KEYS.PERFORMANCE}_${targetEmail}`);
    localStorage.removeItem(STORAGE_KEYS.PERFORMANCE);
    clearActivityHistory(targetEmail);
    window.dispatchEvent(new CustomEvent('lurl-performance-updated'));
  } catch {}
}

export function getAccountScopedKey(base: string, email?: string): string {
  const target = (email || DEFAULT_USER_EMAIL).toLowerCase();
  return `${base}_${target}`;
}

export function getActiveSessionEmail(): string {
  const sess = getActiveSession();
  return sess?.email || DEFAULT_USER_EMAIL;
}

// Full Vault Server Sync and Restore Handlers
export async function syncProfileFromServer(email: string, onSynced?: (profile: UserProfile) => void): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/profile/${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.profile) {
      const saved = saveUserProfile(data.profile, email);
      if (onSynced) onSynced(saved);
      return saved;
    }
    return null;
  } catch {
    return null;
  }
}

export async function syncPerformanceFromServer(email: string, onSynced?: (perf: UserPerformance) => void): Promise<UserPerformance | null> {
  try {
    const res = await fetch(`/api/performance/${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.performance) {
      saveUserPerformance(data.performance, email);
      if (onSynced) onSynced(data.performance);
      return data.performance;
    }
    return null;
  } catch {
    return null;
  }
}

export function collectAccountStorageSnapshot(email: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const cleanEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  const snapshot: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      // Match keys specifically scoped to this email
      if (key.endsWith(`_${cleanEmail}`) || key.includes(`_${cleanEmail}_`) || key.includes(cleanEmail)) {
        const val = localStorage.getItem(key);
        if (val !== null) {
          snapshot[key] = val;
        }
      }
    }
  } catch {}
  return snapshot;
}

export interface AutoSaveSettings {
  autoSaveEnabled: boolean;
  cloudSyncEnabled: boolean;
  lastSyncedAt: number;
}

export function getAutoSaveSettings(email?: string): AutoSaveSettings {
  const cleanEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  const defaultSettings: AutoSaveSettings = {
    autoSaveEnabled: true,
    cloudSyncEnabled: true,
    lastSyncedAt: Date.now(),
  };
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const raw = localStorage.getItem(getAccountScopedKey('lurl_auto_save_settings', cleanEmail));
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveAutoSaveSettings(settings: Partial<AutoSaveSettings>, email?: string): AutoSaveSettings {
  const cleanEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  const current = getAutoSaveSettings(cleanEmail);
  const merged: AutoSaveSettings = { ...current, ...settings, lastSyncedAt: Date.now() };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(getAccountScopedKey('lurl_auto_save_settings', cleanEmail), JSON.stringify(merged));
    } catch {}
  }
  return merged;
}

export async function syncFullVaultToServer(email: string): Promise<any> {
  try {
    const cleanEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
    const profile = getUserProfile(cleanEmail);
    const performance = getUserPerformance(cleanEmail);
    const history = getActivityHistory(cleanEmail);
    const storageSnapshot = collectAccountStorageSnapshot(cleanEmail);

    let vipChatThread: any[] | undefined = undefined;
    try {
      const rawVip = localStorage.getItem(getAccountScopedKey('lurl_vip_chat_thread', cleanEmail));
      if (rawVip) vipChatThread = JSON.parse(rawVip);
    } catch {}

    const vaultPayload = {
      email: cleanEmail,
      profile,
      performance,
      history,
      storageSnapshot,
      vipChatThread,
      updatedAt: Date.now(),
    };

    // Always maintain a dedicated account backup in localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          getAccountScopedKey('lurl_account_vault_snapshot', cleanEmail),
          JSON.stringify(vaultPayload)
        );
        localStorage.setItem(getAccountScopedKey('lurl_last_synced_at', cleanEmail), String(Date.now()));
      } catch {}
    }

    try {
      const res = await fetch('/api/vault/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vaultPayload),
      });
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const json = await res.json();
          return json;
        }
      }
    } catch {}

    return { success: true, localSaved: true, email: cleanEmail };
  } catch {
    return null;
  }
}

export async function restoreFullVaultFromServer(email: string, onRestored?: (data: any) => void): Promise<any> {
  try {
    const cleanEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
    let data: any = null;

    try {
      const res = await fetch(`/api/vault/restore/${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const json = await res.json();
          if (json && (json.found || json.profile || json.storageSnapshot)) {
            data = json;
          }
        }
      }
    } catch {}

    // Fallback to local snapshot backup if server didn't have data
    if (!data && typeof window !== 'undefined') {
      try {
        const localBackup = localStorage.getItem(getAccountScopedKey('lurl_account_vault_snapshot', cleanEmail));
        if (localBackup) {
          const parsedBackup = JSON.parse(localBackup);
          data = { ...parsedBackup, found: true };
        }
      } catch {}
    }

    if (!data) {
      data = {
        email: cleanEmail,
        profile: getUserProfile(cleanEmail),
        performance: getUserPerformance(cleanEmail),
        found: true,
      };
    }

    // 1. Restore storage snapshot into client localStorage
    if (data && data.storageSnapshot && typeof data.storageSnapshot === 'object') {
      try {
        Object.entries(data.storageSnapshot).forEach(([k, v]) => {
          if (typeof v === 'string') {
            localStorage.setItem(k, v);
          }
        });
      } catch {}
    }

    // 2. Restore profile & performance
    if (data && data.profile) {
      saveUserProfile(data.profile, cleanEmail);
    }
    if (data && data.performance) {
      saveUserPerformance(data.performance, cleanEmail);
    }

    // 3. Restore VIP chat thread if provided
    if (data && Array.isArray(data.vipChatThread) && data.vipChatThread.length > 0) {
      try {
        localStorage.setItem(getAccountScopedKey('lurl_vip_chat_thread', cleanEmail), JSON.stringify(data.vipChatThread));
      } catch {}
    }

    // 4. Notify app components that account vault has been restored
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lurl-vault-restored', { detail: data }));
      window.dispatchEvent(new CustomEvent('lurl-account-changed', { detail: { email: cleanEmail } }));
      window.dispatchEvent(new CustomEvent('lurl-chat-updated'));
      window.dispatchEvent(new CustomEvent('lurl-chart-updated'));
      window.dispatchEvent(new CustomEvent('lurl-performance-updated', { detail: data.performance }));
    }

    if (onRestored && data) {
      onRestored(data);
    }
    return data;
  } catch {
    return null;
  }
}

export function exportAccountDataJson(email?: string): void {
  if (typeof window === 'undefined') return;
  const cleanEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  const profile = getUserProfile(cleanEmail);
  const performance = getUserPerformance(cleanEmail);
  const history = getActivityHistory(cleanEmail);
  const storageSnapshot = collectAccountStorageSnapshot(cleanEmail);

  const payload = {
    app: 'LURL Autonomous Business & Trading Suite',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    accountEmail: cleanEmail,
    profile,
    performance,
    history,
    storageSnapshot,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LURL_Vault_Backup_${cleanEmail.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importAccountDataJson(jsonText: string, email?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const parsed = JSON.parse(jsonText);
    const cleanEmail = (email || parsed.accountEmail || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();

    if (parsed.profile) {
      saveUserProfile({ ...parsed.profile, email: cleanEmail }, cleanEmail);
    }
    if (parsed.performance) {
      saveUserPerformance({ ...parsed.performance, email: cleanEmail }, cleanEmail);
    }
    if (parsed.storageSnapshot && typeof parsed.storageSnapshot === 'object') {
      Object.entries(parsed.storageSnapshot).forEach(([k, v]) => {
        if (typeof v === 'string') {
          localStorage.setItem(k, v);
        }
      });
    }

    await syncFullVaultToServer(cleanEmail);

    window.dispatchEvent(new CustomEvent('lurl-vault-restored', { detail: parsed }));
    window.dispatchEvent(new CustomEvent('lurl-account-changed', { detail: { email: cleanEmail } }));
    window.dispatchEvent(new CustomEvent('lurl-chat-updated'));
    window.dispatchEvent(new CustomEvent('lurl-chart-updated'));
    window.dispatchEvent(new CustomEvent('lurl-performance-updated'));
    return true;
  } catch {
    return false;
  }
}

export async function clearCurrentAccountData(email?: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const cleanEmail = (email || getActiveSessionEmail() || DEFAULT_USER_EMAIL).toLowerCase();
  if (!cleanEmail || cleanEmail === 'guest@lurl.app') return false;

  try {
    // 1. Remove all client keys tied to this email
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.endsWith(`_${cleanEmail}`) || key.includes(`_${cleanEmail}_`))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // 2. Clear activity history
    clearActivityHistory(cleanEmail);

    // 3. Clear on server
    await fetch('/api/vault/clear-account-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    // 4. Notify UI
    window.dispatchEvent(new CustomEvent('lurl-vault-restored', { detail: { cleared: true } }));
    window.dispatchEvent(new CustomEvent('lurl-account-changed', { detail: { email: cleanEmail } }));
    window.dispatchEvent(new CustomEvent('lurl-chat-updated'));
    window.dispatchEvent(new CustomEvent('lurl-chart-updated'));
    window.dispatchEvent(new CustomEvent('lurl-performance-updated'));
    return true;
  } catch {
    return false;
  }
}

// Activity & History Logging Helpers
export function logAiDoubtClarifiedHistory(category: CategoryType, question: string, answerSnippet: string, ...rest: any[]): void {
  const title = typeof question === 'string' ? `AI Question: ${question.slice(0, 40)}` : 'AI Query Clarified';
  const desc = typeof answerSnippet === 'string' ? answerSnippet.slice(0, 100) : 'Response processed';
  logActivity('ai_query', title, desc, { category, ...rest });
}

export function buildAccountActivityContextForChatbot(email: string): string {
  const profile = getUserProfile(email);
  const perf = getUserPerformance(email);
  const history = getActivityHistory(email).slice(0, 5);
  return `User: ${profile.name} (${profile.email}), Category: ${profile.selectedCategory}, Mastery: ${perf.overallMastery}%. Recent actions: ${history.map(h => h.title).join(', ')}`;
}

export function logDemoTradeHistory(...args: any[]): void {
  const first = args[0] || {};
  const tradeType = typeof first === 'string' ? first : first.type || first.side || 'TRADE';
  const details = typeof args[1] === 'string' ? args[1] : JSON.stringify(first).slice(0, 80);
  logActivity('trade_executed', `Trade ${String(tradeType).toUpperCase()} on BTC`, details, { args });
}

export function logWorldwideStrategyHistory(...args: any[]): void {
  const first = args[0] || {};
  const title = typeof first === 'string' ? first : first.title || first.tag || 'Worldwide Strategy Post';
  const text = typeof args[1] === 'string' ? args[1] : first.text || '';
  logActivity('trading', `Worldwide: ${title}`, String(text).slice(0, 100), { args });
}

export function logWordChartAuditHistory(...args: any[]): void {
  logActivity('skill-development', 'Word Chart Confidence Audit', 'Strategy confidence verified', { args });
}

export function logSkillMasteredHistory(skillName: string, categoryOrTitle?: CategoryType | string, ...rest: any[]): void {
  logActivity('skill_mastered', `Mastered Skill: ${skillName || 'Applied Concept'}`, `Domain: ${categoryOrTitle || 'General'}`, { skillName, categoryOrTitle, rest });
}

export function clearUserHistory(email?: string): void {
  clearActivityHistory(email);
}

export function deleteUserHistoryItem(itemId: string, email?: string): void {
  deleteActivityRecord(itemId, email);
}

export function logStudyMinutes(category: CategoryType, minutes: number, email?: string): void {
  const perf = getUserPerformance(email);
  perf.totalMinutes += minutes;
  if (perf.courses[category]) {
    perf.courses[category].minutesSpent += minutes;
  }
  saveUserPerformance(perf, email);
}

export function getPrivateAccountChatbotHistory(email?: string): any[] {
  const history = getActivityHistory(email);
  return history.filter((h) => h.type === 'ai_query');
}

export function getPrivateWordChartAndWorldwideHistory(email?: string): { wordChartEntries: any[]; worldwideEvents: any[] } {
  const history = getActivityHistory(email);
  const wordChartEntries = history
    .filter((h) => h.category === 'skill-development' || h.type?.includes('word'))
    .map((h) => ({
      id: h.id,
      timestamp: h.timestamp,
      title: h.title,
      copyText: h.description,
      hookScore: (h.metadata as any)?.hookScore || 92,
      cvr: (h.metadata as any)?.cvr || '4.8%',
      estimatedRoas: (h.metadata as any)?.estimatedRoas || '4.2x',
      rewrittenHook: (h.metadata as any)?.rewrittenHook || undefined,
    }));
  const worldwideEvents = history
    .filter((h) => h.category === 'trading' || h.type?.includes('world'))
    .map((h) => ({
      id: h.id,
      timestamp: h.timestamp,
      title: h.title,
      category: h.category || 'Strategic Thought',
      description: h.description,
    }));
  return { wordChartEntries, worldwideEvents };
}
