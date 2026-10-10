import { CategoryType } from '../types';
import { getActiveSessionEmail, getAccountScopedKey } from './userStorage';

export interface CodexBookmarkItem {
  id: string; // e.g. "trading_ch1_p14"
  category: CategoryType;
  categoryTitle: string;
  chapterId: string;
  chapterNumber: string;
  chapterTitle: string;
  pageNumber: number;
  globalPageNumber?: number;
  pageHeadline: string;
  analyticalLens?: string;
  subDisciplineFocus?: string;
  excerpt: string;
  createdAt: number;
}

const BOOKMARKS_STORAGE_BASE_KEY = 'lurl_codex_saved_bookmarks_v5';

export function getBookmarksStorageKey(emailInput?: string): string {
  return getAccountScopedKey(BOOKMARKS_STORAGE_BASE_KEY, emailInput);
}

export function getBookmarkedPages(emailInput?: string): CodexBookmarkItem[] {
  if (typeof window === 'undefined') return [];
  const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  const key = getBookmarksStorageKey(targetEmail);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isPageBookmarked(
  category: CategoryType,
  chapterId: string,
  pageNumber: number,
  emailInput?: string
): boolean {
  const bookmarks = getBookmarkedPages(emailInput);
  const bookmarkId = `${category}_${chapterId}_p${pageNumber}`;
  return bookmarks.some((b) => b.id === bookmarkId);
}

export function togglePageBookmark(
  bookmarkData: Omit<CodexBookmarkItem, 'id' | 'createdAt'> & { id?: string },
  emailInput?: string
): boolean {
  if (typeof window === 'undefined') return false;
  const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  const key = getBookmarksStorageKey(targetEmail);
  const bookmarkId = bookmarkData.id || `${bookmarkData.category}_${bookmarkData.chapterId}_p${bookmarkData.pageNumber}`;
  const existing = getBookmarkedPages(targetEmail);
  const isExisting = existing.some((b) => b.id === bookmarkId);

  let updated: CodexBookmarkItem[];
  let wasAdded: boolean;

  if (isExisting) {
    updated = existing.filter((b) => b.id !== bookmarkId);
    wasAdded = false;
  } else {
    const newBookmark: CodexBookmarkItem = {
      ...bookmarkData,
      id: bookmarkId,
      createdAt: Date.now(),
    };
    updated = [newBookmark, ...existing].slice(0, 500); // Save up to 500 pages
    wasAdded = true;
  }

  try {
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('lurl-bookmarks-updated', {
        detail: { bookmarkId, wasAdded, count: updated.length },
      })
    );
  } catch (err) {
    console.error('Failed to save bookmark:', err);
  }

  return wasAdded;
}

export function removeBookmark(bookmarkId: string, emailInput?: string): void {
  if (typeof window === 'undefined') return;
  const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  const key = getBookmarksStorageKey(targetEmail);
  const existing = getBookmarkedPages(targetEmail);
  const updated = existing.filter((b) => b.id !== bookmarkId);

  try {
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('lurl-bookmarks-updated', {
        detail: { bookmarkId, wasAdded: false, count: updated.length },
      })
    );
  } catch (err) {
    console.error('Failed to remove bookmark:', err);
  }
}

export function clearAllBookmarks(emailInput?: string): void {
  if (typeof window === 'undefined') return;
  const targetEmail = (emailInput || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  const key = getBookmarksStorageKey(targetEmail);
  try {
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent('lurl-bookmarks-updated', {
        detail: { wasAdded: false, count: 0 },
      })
    );
  } catch {}
}
