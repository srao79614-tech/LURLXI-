/**
 * @license
 * Standalone, single-file autonomous HTML source for LURL Executive Codex.
 * Runs anywhere with zero dependencies, 100% self-contained, offline-ready.
 * Pin-to-pin parity with preview application.
 */

import { getStylesAndHead } from './standaloneHtmlParts/stylesAndHead';
import { getHeaderAndModals } from './standaloneHtmlParts/headerAndModals';
import { getStageSelection } from './standaloneHtmlParts/stageSelection';
import { getApplicationWorkspace } from './standaloneHtmlParts/applicationWorkspace';
import { getFloatingWidgetsAndModals } from './standaloneHtmlParts/floatingWidgets';
import { getClientEngineScript } from './standaloneHtmlParts/clientEngineScript';

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
