import React, { useState } from 'react';
import { getStandaloneHtmlContent } from '../standaloneHtmlSource';
import { downloadStandaloneHtmlFile, downloadStandaloneCssFile } from '../utils/downloadHelper';
import { openStandaloneInNewTab } from '../utils/urlHelper';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import {
  Download,
  FileCode,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Maximize2,
  RefreshCw,
  ArrowLeft,
  Check,
  Copy,
} from 'lucide-react';

interface AutonomousReadymadeViewProps {
  onReturnToTerminal?: () => void;
}

export const AutonomousReadymadeView: React.FC<AutonomousReadymadeViewProps> = ({
  onReturnToTerminal,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const htmlSource = getStandaloneHtmlContent();

  const handleDownload = () => {
    playClickSound();
    downloadStandaloneHtmlFile('LURL.html');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleDownloadCss = () => {
    playClickSound();
    downloadStandaloneCssFile('LURL.css');
  };

  const handleOpenNewTab = () => {
    playClickSound();
    openStandaloneInNewTab();
  };

  const handleCopyHtml = () => {
    playSuccessChime();
    navigator.clipboard.writeText(htmlSource);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRefresh = () => {
    playClickSound();
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 py-4 space-y-4">
      {/* Top Controls & Status Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-[#141926] via-[#0d1017] to-[#141926] border border-[#252c3d] p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onReturnToTerminal && (
            <button
              type="button"
              onClick={onReturnToTerminal}
              className="py-2 px-3 rounded-xl bg-[#121622] hover:bg-[#1a2234] text-xs font-bold text-[#f8b179] border border-[#d47a37]/40 flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Return to Terminal"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Terminal</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="cinzel text-base sm:text-lg font-bold text-white tracking-wide">
                LURL Readymade Autonomous Codex & Website
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" /> 100% In-Browser Active
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Running live without external network dependence. Zero 403/404 errors, zero redirect notices.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 sm:flex-none py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            title="Download LURL.html file to your phone/computer"
          >
            {downloadSuccess ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloadSuccess ? 'Downloaded!' : 'Download LURL.html'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCss}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#121927] hover:bg-[#1b263b] text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            title="Export LURL.css stylesheet"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export CSS</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#141824] hover:bg-[#1f2638] text-emerald-300 hover:text-white border border-emerald-500/40 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            title="Open in new browser tab via in-memory Blob (no 403 or 404)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open in Tab ↗</span>
          </button>

          <button
            type="button"
            onClick={handleCopyHtml}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-[#121622] hover:bg-[#1a202c] text-gray-300 border border-[#252c3d] flex items-center justify-center gap-1 cursor-pointer transition-colors"
            title="Copy full HTML code to clipboard"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            <span className="hidden sm:inline">{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-gray-400 hover:text-white border border-[#252c3d] cursor-pointer transition-colors"
            title="Reload Readymade View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Live Readymade Website Frame */}
      <div className="w-full rounded-2xl border-2 border-[#252c3d] overflow-hidden shadow-2xl bg-[#080a0f] relative">
        <iframe
          key={refreshKey}
          srcDoc={htmlSource}
          title="LURL Autonomous Business Codex Readymade Website"
          className="w-full h-[78vh] sm:h-[84vh] border-0 rounded-2xl bg-[#080a0f]"
          sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
        />
      </div>
    </div>
  );
};
