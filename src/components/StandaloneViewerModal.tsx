import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Copy, Check, Maximize2, Minimize2, ExternalLink, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { getStandaloneHtmlContent } from '../standaloneHtmlSource';
import { downloadStandaloneHtmlFile, downloadStandaloneCssFile } from '../utils/downloadHelper';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

interface StandaloneViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneViewerModal: React.FC<StandaloneViewerModalProps> = ({ isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const htmlContent = useMemo(() => {
    return getStandaloneHtmlContent();
  }, [iframeKey]);

  const handleCopyCode = () => {
    playClickSound();
    try {
      navigator.clipboard.writeText(htmlContent);
      setCopiedHtml(true);
      playSuccessChime();
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    playClickSound();
    downloadStandaloneHtmlFile('LURL.html');
  };

  const handleRefresh = () => {
    playClickSound();
    setIframeKey((prev) => prev + 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="standalone-viewer-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden"
        >
          {/* Subtle Backdrop Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`relative flex flex-col bg-[#0b0e14] border border-[#d47a37]/50 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden transition-all duration-300 z-10 ${
              isFullscreen
                ? 'w-full h-full rounded-none border-0'
                : 'w-full max-w-6xl h-[92vh] max-h-[950px]'
            }`}
          >
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-[#111622] border-b border-[#222a3d] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#d47a37] to-[#8d3d0a] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                L
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide font-['Cinzel']">
                    LURL Standalone Website
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Independent • Zero 403</span>
                  </span>
                </div>
                <p className="text-[10px] text-[#9ca3af] hidden sm:block">
                  Full standalone offline edition running completely independent of external servers
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                title="Reload standalone engine"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#182030] hover:bg-[#222c42] text-[#9ca3af] hover:text-white border border-[#2d374d] text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Reload</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy entire standalone HTML code"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#182030] hover:bg-[#222c42] text-[#cbd5e1] hover:text-white border border-[#2d374d] text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedHtml ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-[11px]">Copied Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#f8b179]" />
                    <span className="hidden md:inline">Copy HTML</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                title="Download LURL.html to your device"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save LURL.html</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                className="p-1.5 rounded-lg bg-[#182030] hover:bg-[#222c42] text-[#9ca3af] hover:text-white border border-[#2d374d] cursor-pointer transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                title="Close viewer"
                className="p-1.5 rounded-lg bg-[#1a1414] hover:bg-rose-950 text-gray-400 hover:text-rose-300 border border-rose-900/40 cursor-pointer transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Standalone Sandbox Iframe */}
          <div className="flex-1 w-full h-full bg-[#0a0d14] relative overflow-hidden">
            <iframe
              key={iframeKey}
              id="standalone-live-iframe"
              srcDoc={htmlContent}
              title="LURL Standalone Autonomous Business Suite"
              sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals"
              className="w-full h-full border-0 block"
            />
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
