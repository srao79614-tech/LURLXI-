import React, { useState } from 'react';
import { Download, Copy, Check, Code, FileCode, FileText, Sparkles, ExternalLink, Link2, MonitorPlay, Smartphone } from 'lucide-react';
import { getStandaloneHtmlContent } from '../standaloneHtmlSource';
import { getStandaloneCssContent } from '../standaloneCssSource';
import { downloadStandaloneCssFile, downloadStandaloneHtmlFile } from '../utils/downloadHelper';
import { openStandaloneInNewTab, getActiveServerOrigin } from '../utils/urlHelper';

export const StandaloneHtmlExport: React.FC = () => {
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedCss, setCopiedCss] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [cssDownloaded, setCssDownloaded] = useState(false);

  const activeOrigin = getActiveServerOrigin();
  const directDownloadHtmlUrl = `${activeOrigin}/api/download/lurl.html`;
  const directDownloadCssUrl = `${activeOrigin}/api/download/lurl.css`;

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(directDownloadHtmlUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleDownloadHtml = () => {
    downloadStandaloneHtmlFile('LURL.html');
  };

  const handleDownloadCss = () => {
    setCssDownloaded(true);
    downloadStandaloneCssFile('LURL.css');
    setTimeout(() => setCssDownloaded(false), 2500);
  };

  const handleCopyHtml = () => {
    const htmlContent = getStandaloneHtmlContent();
    navigator.clipboard.writeText(htmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleCopyCss = () => {
    const cssContent = getStandaloneCssContent();
    navigator.clipboard.writeText(cssContent);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2500);
  };

  return (
    <div
      id="standalone-html-exporter"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 mb-8"
    >
      <div className="rounded-2xl bg-gradient-to-r from-[#17130e] via-[#121622] to-[#0e1017] border border-[#d47a37]/40 p-6 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#d47a37]/20 border border-[#d47a37]/50 flex items-center justify-center text-[#f8b179] shrink-0 shadow-inner">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Cinzel'] text-lg font-bold text-white tracking-wide">
                Standalone HTML & CSS Bundles
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#34d399]/15 text-[#34d399] text-[10px] font-mono font-bold border border-[#34d399]/30">
                100% Zero-Error Standalone
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] mt-1 max-w-xl leading-relaxed">
              Export the complete LURL application as a self-contained <span className="font-mono text-white">LURL.html</span> or standalone <span className="font-mono text-[#f8b179]">LURL.css</span> stylesheet. Error-free, stands autonomously with the website, and ready for CodePen or production hosting.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 bg-[#090b10] px-2.5 py-1 rounded-lg border border-[#252c3d] text-[#f8b179]">
                <span>HTML URL:</span>
                <span className="text-gray-300 truncate max-w-[170px] sm:max-w-xs">{directDownloadHtmlUrl}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#090b10] px-2.5 py-1 rounded-lg border border-[#252c3d] text-cyan-400">
                <span>CSS URL:</span>
                <span className="text-gray-300 truncate max-w-[170px] sm:max-w-xs">{directDownloadCssUrl}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Export Full App (.ZIP) Button */}
          <a
            href="/api/download/full-app.zip"
            download="lurl-full-app.zip"
            id="download-full-project-zip-btn"
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(16,185,129,0.25)] transition-all text-center"
            title="Download the full application source code and Android Studio project as a ZIP archive"
          >
            <Download className="w-4 h-4" />
            <span>Export Full App (.ZIP)</span>
          </a>

          {/* Android Studio Project View Button */}
          <button
            type="button"
            id="open-android-studio-btn"
            onClick={() => window.dispatchEvent(new CustomEvent('lurl-open-android-project'))}
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0d1629] hover:bg-[#13213d] text-sky-300 border border-sky-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_2px_10px_rgba(56,189,248,0.2)]"
            title="Open Android Studio Project Files & Instructions"
          >
            <Smartphone className="w-4 h-4 text-sky-400" />
            <span>Android Studio Project</span>
          </button>

          {/* Export CSS Button */}
          <button
            type="button"
            id="export-standalone-css-btn"
            onClick={handleDownloadCss}
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-bold bg-[#151c2e] hover:bg-[#1f2a44] text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_2px_10px_rgba(6,182,212,0.15)]"
            title="Download error-free standalone LURL.css stylesheet"
          >
            {cssDownloaded ? (
              <>
                <Check className="w-4 h-4 text-[#34d399]" />
                <span>Downloaded CSS!</span>
              </>
            ) : (
              <>
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span>Export CSS (LURL.css)</span>
              </>
            )}
          </button>

          {/* Copy CSS Button */}
          <button
            type="button"
            id="copy-css-btn"
            onClick={handleCopyCss}
            className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#141824] hover:bg-[#1f2638] text-[#cbd5e1] border border-[#252c3d] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            title="Copy CSS to clipboard"
          >
            {copiedCss ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#34d399]" />
                <span>Copied CSS</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#9ca3af]" />
                <span>Copy CSS</span>
              </>
            )}
          </button>

          {/* Download HTML Button */}
          <button
            type="button"
            onClick={handleDownloadHtml}
            id="download-standalone-html-btn"
            className="flex-1 sm:flex-none py-2.5 px-5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#d47a37] via-[#b85d19] to-[#8d3d0a] hover:from-[#e08a46] hover:to-[#a2480f] flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(212,122,55,0.3)] transition-all text-center"
          >
            <Download className="w-4 h-4" />
            <span>Download LURL.html</span>
          </button>

          <button
            type="button"
            onClick={openStandaloneInNewTab}
            id="open-in-browser-html-btn"
            className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#141824] hover:bg-[#1f2638] text-white border border-[#252c3d] hover:border-[#d47a37] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            title="Launch full standalone independent website with zero network error"
          >
            <MonitorPlay className="w-3.5 h-3.5 text-emerald-400" />
            <span>View Standalone ↗</span>
          </button>

          <button
            type="button"
            id="copy-direct-url-btn"
            onClick={handleCopyDirectLink}
            className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/40 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
            title="Copy live URL link"
          >
            {linkCopied ? (
              <>
                <Check className="w-4 h-4 text-[#34d399]" /> Copied URL
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" /> Copy URL
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
