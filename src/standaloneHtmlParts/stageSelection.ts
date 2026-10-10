/**
 * Stage 1 Selection Process for Standalone LURL HTML
 */
export function getStageSelection(): string {
  return `  <!-- ==================== STAGE 1: SELECTION PROCESS (INITIAL VIEW) ==================== -->
  <section id="selection-stage" class="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center flex flex-col items-center">
    <div onclick="toggleSlidebar(true)" class="logo-3d-wrap w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-[#d47a37] p-2.5 flex items-center justify-center bg-[#0e1118] shadow-[0_0_45px_rgba(212,122,55,0.4)] mb-6 cursor-pointer hover:scale-105 transition-transform">
      <svg viewBox="0 0 200 200" class="w-full h-full">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#d47a37" stroke-width="12" />
        <path d="M 54 50 C 40 85 45 130 82 142 C 105 150 120 135 125 110 C 130 85 115 65 95 65 C 75 65 68 85 72 108 C 76 130 92 145 120 145 C 148 145 158 115 156 85" fill="none" stroke="#f8b179" stroke-width="16" stroke-linecap="round"/>
      </svg>
    </div>

    <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#d47a37]/15 border border-[#d47a37]/35 text-[#f8b179] text-xs font-semibold mb-4">
      <span>✦ Step 1: Selection Process</span>
    </div>

    <h2 class="cinzel text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">SELECT YOUR BUSINESS TRACK</h2>
    <p class="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
      Choose your primary executive domain to begin. After your selection, the full platform, interactive Bitcoin demo terminal, autonomous AI advisor, codex directives, and navigation slidebar will unlock.
    </p>

    <!-- 4 Domain Selection Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full text-left max-w-4xl">
      <!-- 01: Trading -->
      <div onclick="completeSelectionProcess('trading')" class="group p-6 rounded-2xl bg-[#0e1118] border-2 border-[#252c3d] hover:border-[#d47a37] cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-mono text-[#f8b179] font-bold">01 // TRACK</span>
          <span class="text-2xl">📈</span>
        </div>
        <h3 class="cinzel text-xl font-bold text-white mb-2 group-hover:text-[#f8b179] transition-colors">Trading Core & Bitcoin</h3>
        <p class="text-xs text-gray-400 mb-4 leading-relaxed">Wyckoff accumulation, liquidity sweep mechanics, live candlestick simulation, and strict 1% risk management.</p>
        <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#f8b179] group-hover:translate-x-1 transition-transform">
          <span>Select Track & Unlock Platform</span>
          <span>→</span>
        </div>
      </div>

      <!-- 02: Dropshipping -->
      <div onclick="completeSelectionProcess('dropshipping')" class="group p-6 rounded-2xl bg-[#0e1118] border-2 border-[#252c3d] hover:border-[#d47a37] cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-mono text-[#f8b179] font-bold">02 // TRACK</span>
          <span class="text-2xl">⚡</span>
        </div>
        <h3 class="cinzel text-xl font-bold text-white mb-2 group-hover:text-[#f8b179] transition-colors">AI Dropshipping</h3>
        <p class="text-xs text-gray-400 mb-4 leading-relaxed">Algorithmic product vetting, 3-second viral TikTok hook scripts, and 48-hour automated ERP fulfillment chains.</p>
        <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#f8b179] group-hover:translate-x-1 transition-transform">
          <span>Select Track & Unlock Platform</span>
          <span>→</span>
        </div>
      </div>

      <!-- 03: E-Commerce -->
      <div onclick="completeSelectionProcess('ecommerce')" class="group p-6 rounded-2xl bg-[#0e1118] border-2 border-[#252c3d] hover:border-[#d47a37] cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-mono text-[#f8b179] font-bold">03 // TRACK</span>
          <span class="text-2xl">🛍️</span>
        </div>
        <h3 class="cinzel text-xl font-bold text-white mb-2 group-hover:text-[#f8b179] transition-colors">E-Commerce Architecture</h3>
        <p class="text-xs text-gray-400 mb-4 leading-relaxed">Direct-to-consumer brand equity, checkout conversion rate optimization, and 90-day LTV compounding workflows.</p>
        <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#f8b179] group-hover:translate-x-1 transition-transform">
          <span>Select Track & Unlock Platform</span>
          <span>→</span>
        </div>
      </div>

      <!-- 04: AI Startup -->
      <div onclick="completeSelectionProcess('startup')" class="group p-6 rounded-2xl bg-[#0e1118] border-2 border-[#252c3d] hover:border-[#d47a37] cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-mono text-[#f8b179] font-bold">04 // TRACK</span>
          <span class="text-2xl">🚀</span>
        </div>
        <h3 class="cinzel text-xl font-bold text-white mb-2 group-hover:text-[#f8b179] transition-colors">AI Startup Moats</h3>
        <p class="text-xs text-gray-400 mb-4 leading-relaxed">Proprietary vector embeddings, enterprise systems of record, ARR expansion velocity, and seed pitch architecture.</p>
        <div class="inline-flex items-center gap-1.5 text-xs font-bold text-[#f8b179] group-hover:translate-x-1 transition-transform">
          <span>Select Track & Unlock Platform</span>
          <span>→</span>
        </div>
      </div>
    </div>
  </section>`;
}
