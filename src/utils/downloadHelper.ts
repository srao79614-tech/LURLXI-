/**
 * Download Helper for Standalone Autonomous Files (HTML & CSS)
 * Handles client-side browser file download generation with zero external dependencies.
 */

import { getStandaloneHtmlContent } from '../standaloneHtmlSource';
import { getStandaloneCssContent } from '../standaloneCssSource';
import { logActivity } from './activityHistory';

export function downloadStandaloneHtmlFile(filename = 'LURL.html'): boolean {
  try {
    const htmlContent = getStandaloneHtmlContent();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    logActivity(
      'export',
      'Downloaded Standalone Autonomous HTML',
      `Downloaded ${filename} for offline and independent browser execution.`,
      { filename, sizeBytes: blob.size }
    );
    return true;
  } catch (err) {
    console.error('Failed to trigger HTML download:', err);
    return false;
  }
}

export function downloadStandaloneCssFile(filename = 'LURL.css'): boolean {
  try {
    const cssContent = getStandaloneCssContent();
    const blob = new Blob([cssContent], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    logActivity(
      'export',
      'Downloaded Standalone CSS Stylesheet',
      `Downloaded ${filename} standalone stylesheet.`,
      { filename, sizeBytes: blob.size }
    );
    return true;
  } catch (err) {
    console.error('Failed to trigger CSS download:', err);
    return false;
  }
}
