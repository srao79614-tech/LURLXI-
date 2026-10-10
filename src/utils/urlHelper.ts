/**
 * Dynamic URL helper to ensure URLs resolve to the active, running server
 * and prevent 404/403 "That's an error / URL not found" errors.
 */

import { getStandaloneHtmlContent } from '../standaloneHtmlSource';
import { downloadStandaloneHtmlFile } from './downloadHelper';

export function getActiveServerOrigin(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    if (
      origin &&
      origin !== 'null' &&
      !origin.startsWith('file:') &&
      !origin.includes('about:blank')
    ) {
      if (origin.includes('ais-dev-')) {
        return origin.replace('ais-dev-', 'ais-pre-');
      }
      return origin;
    }
  }
  return 'https://ais-pre-jarlnydtozntujr3q4ekgz-174979012702.asia-southeast1.run.app';
}

export function getDirectHtmlViewUrl(): string {
  const origin = getActiveServerOrigin();
  return origin ? `${origin}/view-html` : '/view-html';
}

export function getDirectHtmlDownloadUrl(): string {
  const origin = getActiveServerOrigin();
  return origin ? `${origin}/api/download/lurl.html` : '/api/download/lurl.html';
}

export function getDirectCssDownloadUrl(): string {
  const origin = getActiveServerOrigin();
  return origin ? `${origin}/api/download/lurl.css` : '/api/download/lurl.css';
}

/**
 * Safely requests opening the standalone independent website in the in-app viewer.
 * Avoids window.open / external redirects that trigger Google Cloud Run 403 Forbidden errors.
 */
export function openStandaloneInNewTab(): void {
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lurl-open-standalone-viewer'));
    }
  } catch (err) {
    console.error('Failed to dispatch standalone viewer event, falling back to direct download:', err);
    downloadStandaloneHtmlFile('LURL.html');
  }
}


