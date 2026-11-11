/**
 * @license
 * Standalone, single-file autonomous HTML source for LURL Executive Codex.
 * Runs anywhere with zero dependencies, 100% self-contained, offline-ready.
 * Pin-to-pin parity with preview application.
 */

import { getStylesAndHead } from './standaloneHtmlParts/stylesAndHead.ts';
import { getHeaderAndModals } from './standaloneHtmlParts/headerAndModals.ts';
import { getStageSelection } from './standaloneHtmlParts/stageSelection.ts';
import { getApplicationWorkspace } from './standaloneHtmlParts/applicationWorkspace.ts';
import { getFloatingWidgetsAndModals } from './standaloneHtmlParts/floatingWidgets.ts';
import { getClientEngineScript } from './standaloneHtmlParts/clientEngineScript.ts';

export function getStandaloneHtmlContent(): string {
  return [
    getStylesAndHead(),
    getHeaderAndModals(),
    getStageSelection(),
    getApplicationWorkspace(),
    getFloatingWidgetsAndModals(),
    getClientEngineScript()
  ].join('\n');
}
