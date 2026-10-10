/**
 * Slidebar, Header, Ticker, and Modals for Standalone LURL HTML
 */
export function getHeaderAndModals(): string {
  return `  <!-- Slidebar Drawer Menu (Fixed overlay) -->
  <div id="slidebar-backdrop" class="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm hidden" onclick="toggleSlidebar(false)"></div>
  <aside id="standalone-slidebar" class="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-[#0c1018] border-r border-[#252c3d] z-50 closed flex flex-col justify-between shadow-2xl p-5 overflow-y-auto">
    <div>
      <div class="flex items-center justify-between pb-4 border-b border-[#252c3d] mb-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full border border-[#d47a37] p-1 flex items-center justify-center bg-[#090b10] shadow-[0_0_12px_rgba(212,122,55,0.4)]">
            <span class="text-xs font-bold text-[#f8b179]">L</span>
          </div>
          <div>
            <div class="cinzel text-lg font-bold text-white leading-tight">LURL</div>
            <div class="text-[9px] text-gray-400 uppercase tracking-wider">Slidebar Navigation</div>
          </div>
        </div>
        <button onclick="toggleSlidebar(false)" class="p-1.5 rounded-lg bg-[#141824] text-gray-400 hover:text-white border border-[#252c3d] text-xs cursor-pointer">✕</button>
      </div>

      <!-- Active User Card in Slidebar -->
      <div id="slidebar-user-card" class="p-3.5 rounded-xl bg-[#090c14] border border-[#252c3d] mb-4">
        <div class="text-[10px] text-gray-400 mb-1">Authenticated Account</div>
        <div id="slidebar-user-email" class="text-xs font-bold text-[#f8b179] truncate">guest@gmail.com</div>
        <div id="slidebar-user-badge" class="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1 font-mono">
          <span>✓ Verified Member</span>
        </div>
      </div>

      <!-- Tabs Navigation in Slidebar -->
      <div class="space-y-1 text-xs">
        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1 pt-1 pb-1">Platform Modules</div>
        <button onclick="switchTab('trading'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span class="flex items-center gap-2"><span>📈</span><span>BTC Demo Trading</span></span>
          <span class="text-[9px] text-amber-400 font-mono">Live</span>
        </button>
        <button onclick="switchTab('codex'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span class="flex items-center gap-2"><span>📖</span><span>Business Codex</span></span>
          <span class="text-[9px] text-cyan-400 font-mono">Directives</span>
        </button>
        <button onclick="switchTab('ai-chat'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span class="flex items-center gap-2"><span>🤖</span><span>Autonomous AI Advisor</span></span>
          <span class="text-[9px] text-emerald-400 font-mono">Voice Online</span>
        </button>
        <button onclick="switchTab('share-thoughts'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span class="flex items-center gap-2"><span>💬</span><span>Share Thoughts & Forum</span></span>
          <span class="text-[9px] text-purple-400 font-mono">Community</span>
        </button>
        <button onclick="switchTab('performance'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span class="flex items-center gap-2"><span>📊</span><span>My Performance & Analytics</span></span>
          <span class="text-[9px] text-emerald-400 font-mono">Stats</span>
        </button>

        <div class="pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-1">Switch Business Domain</div>
        <button onclick="switchDomain('trading'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span>01. Trading Core (BTC)</span>
          <span class="text-[9px] text-[#f8b179] font-mono">Wyckoff</span>
        </button>
        <button onclick="switchDomain('dropshipping'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span>02. AI Dropshipping</span>
          <span class="text-[9px] text-[#f8b179] font-mono">Viral 3s</span>
        </button>
        <button onclick="switchDomain('ecommerce'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span>03. E-Commerce Architecture</span>
          <span class="text-[9px] text-[#f8b179] font-mono">D2C CRO</span>
        </button>
        <button onclick="switchDomain('startup'); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-white flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span>04. AI Startup Moats</span>
          <span class="text-[9px] text-[#f8b179] font-mono">Vector ARR</span>
        </button>

        <div id="slidebar-vip-section" class="hidden">
          <div class="pt-3 pb-1 text-[10px] font-bold text-[#f8b179] uppercase tracking-wider px-1">Executive Controls</div>
          <button onclick="openVipModal(); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-[#201509] to-[#141824] text-[#f8b179] flex items-center justify-between border border-[#f8b179]/40 font-bold cursor-pointer shadow-sm">
            <span class="flex items-center gap-1.5"><span>👑</span><span>Proprietor VIP Portal</span></span>
            <span class="text-[9px] text-[#f8b179] font-mono">PIN 1029384756</span>
          </button>
        </div>
        <button onclick="openSettingsModal(); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#0e1118] hover:bg-[#181d2a] text-gray-300 flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span class="flex items-center gap-1.5"><span>⚙️</span><span>Platform Settings & Audio</span></span>
          <span class="text-[9px] text-gray-400">Audio / BGM</span>
        </button>
        <button onclick="backToSelection(); toggleSlidebar(false);" class="w-full text-left p-2.5 rounded-xl bg-[#0e1118] hover:bg-[#181d2a] text-gray-300 flex items-center justify-between border border-[#252c3d] cursor-pointer">
          <span class="flex items-center gap-1.5"><span>🔄</span><span>Re-Select Track (Stage 1)</span></span>
          <span class="text-[9px] text-gray-400">Domains</span>
        </button>
      </div>
    </div>

    <div class="pt-4 border-t border-[#252c3d] text-[10px] text-gray-400">
      <div>Standalone Single-File Autonomous Edition</div>
      <div class="text-[#34d399] mt-0.5 font-mono">● 100% In-Browser Active • Zero 403/404</div>
    </div>
  </aside>

  <!-- Top Real-Time System Ticker Bar -->
  <div class="bg-gradient-to-r from-[#0d1017] via-[#121622] to-[#0d1017] border-b border-[#252c3d] px-3 sm:px-6 py-2 text-[11px] text-gray-300 flex flex-wrap items-center justify-between gap-2 z-40 relative">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
        <span class="font-bold text-emerald-400 font-mono">BTC/USDT</span>
        <span id="top-ticker-price" class="font-bold font-mono text-white">$67,420.00</span>
        <span id="top-ticker-change" class="text-emerald-400 font-mono font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">+2.45%</span>
      </div>
      <div class="hidden md:flex items-center gap-3 text-[10px] text-gray-400 font-mono">
        <span>24h H: <span id="top-ticker-high" class="text-gray-200">$68,150.00</span></span>
        <span>24h L: <span id="top-ticker-low" class="text-gray-200">$65,920.00</span></span>
        <span>24h Vol: <span class="text-gray-200">42,890 BTC</span></span>
      </div>
    </div>

    <div class="flex items-center gap-2 text-xs">
      <button onclick="toggleBgm()" id="top-bgm-btn" class="px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/40 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors" title="Toggle relaxing ambient synthesizer BGM">
        <span id="top-bgm-icon">🎵</span>
        <span id="top-bgm-label">BGM: OFF</span>
      </button>
      <button onclick="openVipModal()" class="px-2.5 py-1 rounded-lg bg-[#1a140d] hover:bg-[#281d11] text-[#f8b179] border border-[#f8b179]/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors" title="Secret VIP Proprietorship Portal">
        <span>👑</span>
        <span class="hidden sm:inline">VIP Secret</span>
      </button>
    </div>
  </div>

  <!-- Main Sticky Header -->
  <header class="border-b border-[#252c3d] bg-[#0a0d14]/95 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <!-- Hamburger Toggle Button -->
      <button id="header-slidebar-btn" onclick="toggleSlidebar(true)" title="Open Slidebar Navigation Menu" class="p-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#252c3d] items-center justify-center cursor-pointer transition-all shadow-sm flex">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- 3D Gold Logo -->
      <div id="header-logo" onclick="toggleSlidebar(true)" class="w-9 h-9 rounded-full border-2 border-[#d47a37] p-1 flex items-center justify-center bg-[#090b10] shadow-[0_0_15px_rgba(212,122,55,0.4)] cursor-pointer hover:scale-105 transition-transform">
        <svg viewBox="0 0 200 200" class="w-full h-full">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#d47a37" stroke-width="12" />
          <path d="M 54 50 C 40 85 45 130 82 142 C 105 150 120 135 125 110 C 130 85 115 65 95 65 C 75 65 68 85 72 108 C 76 130 92 145 120 145" fill="none" stroke="#f8b179" stroke-width="16" stroke-linecap="round"/>
        </svg>
      </div>

      <div>
        <h1 class="cinzel text-lg sm:text-xl font-bold tracking-widest gold-text leading-tight">LURL</h1>
        <p class="text-[9px] sm:text-[10px] text-gray-400 tracking-wider hidden sm:block">THE EXECUTIVE CODEX</p>
      </div>
    </div>

    <!-- Right Header Controls -->
    <div id="auth-controls" class="flex items-center gap-2 sm:gap-2.5">
      <button onclick="openSettingsModal()" class="p-2 rounded-xl bg-[#121622] hover:bg-[#1a202c] text-gray-300 hover:text-white border border-[#252c3d] cursor-pointer transition-colors" title="Settings & Sound">
        <span>⚙️</span>
      </button>

      <button id="header-user-btn" onclick="openProfileModal()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#141824] hover:bg-[#1f2638] text-white border border-[#252c3d] hover:border-[#d47a37]/50 flex items-center gap-1.5 cursor-pointer shadow-sm">
        <span class="text-amber-400">👑</span>
        <span id="header-user-label" class="truncate max-w-[130px]">VIP Executive</span>
      </button>
    </div>
  </header>

  <!-- Universal Custom Modal -->
  <div id="custom-modal-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0e1118] border border-[#252c3d] rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-[#252c3d] mb-4">
        <h3 id="custom-modal-title" class="cinzel text-lg font-bold text-white">Notice</h3>
        <button onclick="closeCustomModal()" class="text-gray-400 hover:text-white text-base cursor-pointer p-1">✕</button>
      </div>
      <div id="custom-modal-body" class="text-xs text-gray-300 space-y-3 leading-relaxed"></div>
      <div class="mt-5 flex justify-end">
        <button onclick="closeCustomModal()" class="px-4 py-2 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-white text-xs font-semibold border border-[#252c3d] cursor-pointer">
          Close
        </button>
      </div>
    </div>
  </div>`;
}
