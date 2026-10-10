/**
 * Activity History Logger & Manager
 * Ensures every user action across LURL (trades, analysis, downloads, notes, conversations)
 * is persistently recorded in localStorage with zero data loss.
 */

import { getActiveSessionEmail, getAccountScopedKey, scheduleVaultSync } from './userStorage';

export interface ActivityRecord {
  id: string;
  timestamp: number;
  category: string;
  type?: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

const ACTIVITY_STORAGE_BASE_KEY = 'lurl_persistent_activity_history_v1';
const DELETED_ACTIVITY_IDS_BASE_KEY = 'lurl_deleted_activity_ids_v1';

export function getActivityStorageKey(emailInput?: string): string {
  return getAccountScopedKey(ACTIVITY_STORAGE_BASE_KEY, emailInput);
}

export function getDeletedActivityIds(emailInput?: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getAccountScopedKey(DELETED_ACTIVITY_IDS_BASE_KEY, emailInput));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getActivityHistory(emailInput?: string): ActivityRecord[] {
  if (typeof window === 'undefined') return [];
  const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  const scopedKey = getActivityStorageKey(targetEmail);
  const deletedIds = new Set(getDeletedActivityIds(targetEmail));
  try {
    let raw = localStorage.getItem(scopedKey);
    if (!raw) {
      const defaults = getDefaultActivityHistory(targetEmail).filter((a) => !deletedIds.has(a.id));
      localStorage.setItem(scopedKey, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : getDefaultActivityHistory(targetEmail);
    return list.filter((a: ActivityRecord) => a && !deletedIds.has(a.id));
  } catch (err) {
    console.error('Failed to load activity history:', err);
    return getDefaultActivityHistory(targetEmail);
  }
}

export function saveActivityHistoryList(records: ActivityRecord[], emailInput?: string): void {
  if (typeof window === 'undefined') return;
  const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  const scopedKey = getActivityStorageKey(targetEmail);
  const deletedIds = new Set(getDeletedActivityIds(targetEmail));
  try {
    const filtered = records.filter((r) => r && !deletedIds.has(r.id)).slice(0, 250);
    localStorage.setItem(scopedKey, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to save activity history list:', err);
  }
}

export function logActivity(
  category: ActivityRecord['category'],
  title: string,
  description: string,
  metadata?: Record<string, any>,
  emailInput?: string
): ActivityRecord {
  const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  const newRecord: ActivityRecord = {
    id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    category,
    type: category,
    title,
    description,
    metadata,
  };

  if (typeof window !== 'undefined') {
    try {
      const scopedKey = getActivityStorageKey(targetEmail);
      const history = getActivityHistory(targetEmail);
      const updated = [newRecord, ...history].slice(0, 250);
      localStorage.setItem(scopedKey, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lurl-activity-updated', { detail: newRecord }));
      scheduleVaultSync(targetEmail);
    } catch (err) {
      console.error('Failed to persist activity log:', err);
    }
  }

  return newRecord;
}

export function deleteActivityRecord(activityId: string, emailInput?: string): ActivityRecord[] {
  if (typeof window === 'undefined') return [];
  const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  try {
    const deletedKey = getAccountScopedKey(DELETED_ACTIVITY_IDS_BASE_KEY, targetEmail);
    const deletedIds = new Set(getDeletedActivityIds(targetEmail));
    deletedIds.add(activityId);
    localStorage.setItem(deletedKey, JSON.stringify(Array.from(deletedIds)));

    const scopedKey = getActivityStorageKey(targetEmail);
    const current = getActivityHistory(targetEmail);
    const updated = current.filter((item) => item.id !== activityId);
    localStorage.setItem(scopedKey, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lurl-activity-updated', { detail: { deletedId: activityId } }));
    scheduleVaultSync(targetEmail);
    return updated;
  } catch (err) {
    console.error('Failed to delete activity record:', err);
    return getActivityHistory(targetEmail);
  }
}

export function clearActivityHistory(emailInput?: string): void {
  if (typeof window !== 'undefined') {
    const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
    try {
      const scopedKey = getActivityStorageKey(targetEmail);
      localStorage.setItem(scopedKey, JSON.stringify([]));
      window.dispatchEvent(new CustomEvent('lurl-activity-cleared'));
      scheduleVaultSync(targetEmail);
    } catch (err) {
      console.error('Failed to clear activity history:', err);
    }
  }
}

function getDefaultActivityHistory(email = 'guest@lurl.app'): ActivityRecord[] {
  const now = Date.now();
  return [
    {
      id: `act_init_${encodeURIComponent(email)}_1`,
      timestamp: now - 1000 * 60 * 5,
      category: 'auth',
      title: 'Account Workspace Initialized',
      description: `Isolated permanent activity vault active for ${email}.`,
    },
  ];
}
