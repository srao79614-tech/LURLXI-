import { getActiveSessionEmail, scheduleVaultSync } from './userStorage';

export interface ChapterUserNoteData {
  category: string;
  chapterId: string;
  chapterTitle?: string;
  chapterNumber?: string;
  noteText: string;
  updatedAt: number;
}

const STORAGE_PREFIX = 'lurl_user_chapter_notes_v1';

function getStorageKey(category: string, chapterId: string, email?: string): string {
  const cleanEmail = (email || getActiveSessionEmail() || 'default_user').trim().toLowerCase();
  return `${STORAGE_PREFIX}_${cleanEmail}_${category}_${chapterId}`;
}

export function getChapterUserNote(category: string, chapterId: string, email?: string): { noteText: string; updatedAt: number | null } {
  if (typeof window === 'undefined') return { noteText: '', updatedAt: null };
  try {
    const key = getStorageKey(category, chapterId, email);
    const raw = localStorage.getItem(key);
    if (!raw) return { noteText: '', updatedAt: null };
    const parsed = JSON.parse(raw);
    return {
      noteText: typeof parsed.noteText === 'string' ? parsed.noteText : '',
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : null,
    };
  } catch (err) {
    console.warn('Failed to read chapter user note:', err);
    return { noteText: '', updatedAt: null };
  }
}

export function saveChapterUserNote(
  category: string,
  chapterId: string,
  noteText: string,
  chapterMeta?: { chapterTitle?: string; chapterNumber?: string },
  email?: string
): { noteText: string; updatedAt: number } {
  const updatedAt = Date.now();
  if (typeof window === 'undefined') return { noteText, updatedAt };

  try {
    const key = getStorageKey(category, chapterId, email);
    const data: ChapterUserNoteData = {
      category,
      chapterId,
      chapterTitle: chapterMeta?.chapterTitle,
      chapterNumber: chapterMeta?.chapterNumber,
      noteText,
      updatedAt,
    };
    localStorage.setItem(key, JSON.stringify(data));

    // Also maintain a registry of chapters that have notes
    const registryKey = `${STORAGE_PREFIX}_index_${(email || getActiveSessionEmail() || 'default_user').trim().toLowerCase()}`;
    const registryRaw = localStorage.getItem(registryKey);
    const registry: string[] = registryRaw ? JSON.parse(registryRaw) : [];
    const entryId = `${category}:${chapterId}`;
    if (noteText.trim()) {
      if (!registry.includes(entryId)) {
        registry.push(entryId);
        localStorage.setItem(registryKey, JSON.stringify(registry));
      }
    } else {
      const filtered = registry.filter((id) => id !== entryId);
      localStorage.setItem(registryKey, JSON.stringify(filtered));
    }

    // Schedule background synchronization to the user's permanent server vault
    scheduleVaultSync(email);

    // Dispatch custom event so any active viewers update synchronously
    window.dispatchEvent(
      new CustomEvent('lurl-user-notes-updated', {
        detail: { category, chapterId, noteText, updatedAt },
      })
    );
  } catch (err) {
    console.warn('Failed to save chapter user note:', err);
  }

  return { noteText, updatedAt };
}

export function deleteChapterUserNote(category: string, chapterId: string, email?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(category, chapterId, email);
    localStorage.removeItem(key);

    const registryKey = `${STORAGE_PREFIX}_index_${(email || getActiveSessionEmail() || 'default_user').trim().toLowerCase()}`;
    const registryRaw = localStorage.getItem(registryKey);
    if (registryRaw) {
      const registry: string[] = JSON.parse(registryRaw);
      const filtered = registry.filter((id) => id !== `${category}:${chapterId}`);
      localStorage.setItem(registryKey, JSON.stringify(filtered));
    }

    scheduleVaultSync(email);
    window.dispatchEvent(
      new CustomEvent('lurl-user-notes-updated', {
        detail: { category, chapterId, noteText: '', updatedAt: Date.now() },
      })
    );
  } catch (err) {
    console.warn('Failed to delete chapter user note:', err);
  }
}

export function countCategoryNotes(category: string, email?: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const registryKey = `${STORAGE_PREFIX}_index_${(email || getActiveSessionEmail() || 'default_user').trim().toLowerCase()}`;
    const registryRaw = localStorage.getItem(registryKey);
    if (!registryRaw) return 0;
    const registry: string[] = JSON.parse(registryRaw);
    return registry.filter((item) => item.startsWith(`${category}:`)).length;
  } catch {
    return 0;
  }
}
