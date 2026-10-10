/**
 * Stage 2 Application Workspace with all 5 Tabs for Standalone LURL HTML
 */
export function getApplicationWorkspace(): string {
  return `  <!-- ==================== STAGE 2: APPLICATION PLATFORM (POST-SELECTION) ==================== -->
  <main id="application-stage" class="relative z-10 max-w-6xl mx-auto px-2 sm:px-6 py-4 sm:py-6 text-center flex flex-col items-center hidden w-full">
    <!-- Active Domain Banner -->
    <div class="w-full flex flex-col sm:flex-row items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#0e1118] border border-[#252c3d] mb-4 gap-3 text-left">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#141824] border border-[#d47a37]/40 flex items-center justify-center text-xl shrink-0" id="current-track-icon">
          📈
        </div>
        <div>
          <div class="text-[10px] font-mono text-[#f8b179] uppercase tracking-wider">Active Business Track</div>
          <div class="cinzel text-base sm:text-lg font-bold text-white" id="current-track-title">Trading Core & Bitcoin</div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button onclick="toggleSlidebar(true)" class="px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm">
          <span>☰</span>
          <span>Slidebar</span>
        </button>
        <button onclick="backToSelection()" class="px-3 py-1.5 rounded-xl bg-[#10141e] hover:bg-[#192030] text-gray-300 hover:text-white border border-[#252c3d] text-xs cursor-pointer">
          Switch Track
        </button>
      </div>
    </div>

    <!-- Main Navigation Tabs Bar (Exact Match with Preview) -->
    <div class="w-full overflow-x-auto pb-1 mb-5">
      <div class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0c0f16] border border-[#252c3d] w-max min-w-full justify-start sm:justify-center">
        <button id="tab-btn-trading" onclick="switchTab('trading')" class="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md">
          <span>📈</span>
          <span>BTC Demo Trading</span>
        </button>
        <button id="tab-btn-codex" onclick="switchTab('codex')" class="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-transparent text-gray-400 hover:text-white hover:bg-[#141824]">
          <span>📖</span>
          <span>Business Codex</span>
        </button>
        <button id="tab-btn-ai-chat" onclick="switchTab('ai-chat')" class="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-transparent text-gray-400 hover:text-white hover:bg-[#141824]">
          <span>🤖</span>
          <span>AI Assistant</span>
        </button>
        <button id="tab-btn-share-thoughts" onclick="switchTab('share-thoughts')" class="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-transparent text-gray-400 hover:text-white hover:bg-[#141824]">
          <span>💬</span>
          <span>Share Thoughts</span>
        </button>
        <button id="tab-btn-performance" onclick="switchTab('performance')" class="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-transparent text-gray-400 hover:text-white hover:bg-[#141824]">
          <span>📊</span>
          <span>My Performance</span>
        </button>
      </div>
    </div>

    <!-- ==================== TAB 1: BTC DEMO TRADING TERMINAL ==================== -->
    <div id="tab-content-trading" class="w-full text-left space-y-4">
      <!-- Trading Header Stats -->
      <div class="p-4 sm:p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#f7931a]/10 border border-[#f7931a]/40 flex items-center justify-center text-[#f7931a] text-xl font-bold">
            ₿
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="cinzel text-lg sm:text-xl font-bold text-white">BTC / USDT</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">PERP</span>
            </div>
            <div class="text-xs text-gray-400 font-mono">Professional Candlestick & Paper Execution</div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-5 text-xs font-mono">
          <div>
            <div class="text-gray-500 text-[10px] uppercase">Mark Price</div>
            <div id="terminal-price" class="text-lg font-bold text-emerald-400">$67,420.00</div>
          </div>
          <div>
            <div class="text-gray-500 text-[10px] uppercase">Paper Balance</div>
            <div id="terminal-balance" class="text-lg font-bold text-white">$10,000.00</div>
          </div>
          <div>
            <div class="text-gray-500 text-[10px] uppercase">Unrealized P&L</div>
            <div id="terminal-total-pnl" class="text-lg font-bold text-gray-400">$0.00</div>
          </div>
          <button onclick="resetPaperBalance()" class="px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-gray-300 border border-[#252c3d] text-xs cursor-pointer">
            ↺ Reset
          </button>
        </div>
      </div>

      <!-- Chart Toolbar & Candlestick Canvas -->
      <div class="p-4 sm:p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1f2638] text-xs font-mono">
          <div class="flex items-center gap-1.5">
            <span class="text-gray-500 text-[10px]">TIMEFRAME:</span>
            <button onclick="setTimeframe('1m')" class="px-2 py-0.5 rounded bg-[#141824] text-gray-300 hover:text-white border border-[#252c3d]">1m</button>
            <button onclick="setTimeframe('5m')" class="px-2 py-0.5 rounded bg-[#141824] text-gray-300 hover:text-white border border-[#252c3d]">5m</button>
            <button onclick="setTimeframe('15m')" class="px-2 py-0.5 rounded bg-[#d47a37] text-white font-bold">15m</button>
            <button onclick="setTimeframe('1h')" class="px-2 py-0.5 rounded bg-[#141824] text-gray-300 hover:text-white border border-[#252c3d]">1h</button>
            <button onclick="setTimeframe('4h')" class="px-2 py-0.5 rounded bg-[#141824] text-gray-300 hover:text-white border border-[#252c3d]">4h</button>
          </div>

          <div class="flex items-center gap-3 text-[11px] text-gray-400">
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" id="chk-ma20" checked onchange="renderChart()" class="accent-[#f8b179]">
              <span class="text-amber-400">MA(20)</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" id="chk-ema50" checked onchange="renderChart()" class="accent-cyan-400">
              <span class="text-cyan-400">EMA(50)</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" id="chk-bb" checked onchange="renderChart()" class="accent-purple-400">
              <span class="text-purple-400">Bollinger</span>
            </label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" id="chk-rsi" checked onchange="renderChart()" class="accent-emerald-400">
              <span class="text-emerald-400">RSI (14)</span>
            </label>
          </div>
        </div>

        <!-- SVG Candlestick Graphic -->
        <div class="relative w-full h-72 sm:h-80 bg-[#080a0f] rounded-xl border border-[#1f2638] overflow-hidden p-2 flex flex-col justify-between">
          <svg id="trading-svg-chart" class="w-full h-56" viewBox="0 0 640 220" preserveAspectRatio="none">
            <!-- Grid Lines -->
            <line x1="0" y1="55" x2="640" y2="55" stroke="#171d2b" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="0" y1="110" x2="640" y2="110" stroke="#171d2b" stroke-width="1" stroke-dasharray="3,3" />
            <line x1="0" y1="165" x2="640" y2="165" stroke="#171d2b" stroke-width="1" stroke-dasharray="3,3" />
            <g id="svg-candles-group"></g>
          </svg>
          <!-- RSI Sub-Panel -->
          <div id="rsi-container" class="h-16 border-t border-[#1f2638] pt-1 px-2 flex flex-col justify-between font-mono text-[9px] text-gray-500">
            <div class="flex justify-between items-center text-emerald-400">
              <span>RSI(14): <strong id="rsi-val" class="text-white">56.4</strong></span>
              <span>OVERBOUGHT (70) / OVERSOLD (30)</span>
            </div>
            <svg id="rsi-svg" class="w-full h-10" viewBox="0 0 640 40" preserveAspectRatio="none">
              <line x1="0" y1="12" x2="640" y2="12" stroke="#f43f5e" stroke-dasharray="2,2" stroke-width="0.8" opacity="0.5" />
              <line x1="0" y1="28" x2="640" y2="28" stroke="#10b981" stroke-dasharray="2,2" stroke-width="0.8" opacity="0.5" />
              <polyline id="rsi-polyline" fill="none" stroke="#10b981" stroke-width="1.5" points="0,20 640,20" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Order Book & Execution Form Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Order Book (5 cols) -->
        <div class="lg:col-span-5 p-4 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl font-mono text-xs space-y-2.5">
          <div class="flex items-center justify-between pb-2 border-b border-[#252c3d]">
            <span class="font-bold text-white cinzel">Order Book</span>
            <span class="text-[10px] text-gray-400">SPREAD: 0.50 USDT</span>
          </div>

          <!-- Asks (Red) -->
          <div class="space-y-1">
            <div class="text-[10px] text-gray-500 flex justify-between">
              <span>PRICE (USDT)</span>
              <span>SIZE (BTC)</span>
              <span>TOTAL</span>
            </div>
            <div id="orderbook-asks" class="space-y-1"></div>
          </div>

          <!-- Mid Price Separator -->
          <div class="py-1.5 px-3 rounded-lg bg-[#141824] border border-[#252c3d] flex items-center justify-between font-bold">
            <span id="orderbook-mid-price" class="text-emerald-400 text-sm">$67,420.00</span>
            <span class="text-[10px] text-gray-400">Real-Time Depth</span>
          </div>

          <!-- Bids (Green) -->
          <div id="orderbook-bids" class="space-y-1"></div>
        </div>

        <!-- Order Form (7 cols) -->
        <div class="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-[#252c3d]">
            <span class="cinzel font-bold text-white text-base">Trade Order Form</span>
            <span class="text-xs text-gray-400 font-mono">1% Kelly Risk Rule</span>
          </div>

          <!-- Long / Short Switch -->
          <div class="grid grid-cols-2 gap-2">
            <button id="order-side-long" onclick="setOrderSide('LONG')" class="py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md cursor-pointer transition-all">
              ▲ BUY / LONG
            </button>
            <button id="order-side-short" onclick="setOrderSide('SHORT')" class="py-2.5 rounded-xl font-bold text-xs bg-[#141824] text-gray-300 border border-[#252c3d] hover:bg-rose-900/40 cursor-pointer transition-all">
              ▼ SELL / SHORT
            </button>
          </div>

          <!-- Leverage Slider -->
          <div class="space-y-1.5 text-xs font-mono">
            <div class="flex justify-between text-gray-400">
              <span>Leverage:</span>
              <span id="order-leverage-label" class="text-[#f8b179] font-bold">10x</span>
            </div>
            <input type="range" id="order-leverage" min="1" max="100" value="10" oninput="updateOrderSummary()" class="w-full accent-[#d47a37]">
            <div class="flex justify-between text-[10px] text-gray-500">
              <span>1x</span>
              <span>10x</span>
              <span>25x</span>
              <span>50x</span>
              <span>100x</span>
            </div>
          </div>

          <!-- Margin Amount & Quick Percentages -->
          <div class="space-y-2 text-xs">
            <div class="flex justify-between text-gray-400">
              <span>Position Size (BTC):</span>
              <span class="text-gray-500 font-mono">Avail: <strong id="order-avail-balance" class="text-white">$10,000</strong></span>
            </div>
            <div class="flex gap-2">
              <input type="number" id="order-amount" step="0.01" min="0.01" value="0.10" oninput="updateOrderSummary()" class="flex-1 px-3 py-2.5 rounded-xl bg-[#080a0f] border border-[#252c3d] text-white font-mono text-xs outline-none focus:border-[#d47a37]">
              <div class="flex gap-1 font-mono">
                <button onclick="setAmountPct(25)" class="px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-gray-300 border border-[#252c3d] text-[10px]">25%</button>
                <button onclick="setAmountPct(50)" class="px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-gray-300 border border-[#252c3d] text-[10px]">50%</button>
                <button onclick="setAmountPct(75)" class="px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-gray-300 border border-[#252c3d] text-[10px]">75%</button>
                <button onclick="setAmountPct(100)" class="px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-gray-300 border border-[#252c3d] text-[10px]">100%</button>
              </div>
            </div>
          </div>

          <!-- SL & TP -->
          <div class="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label class="text-gray-400 text-[10px]">STOP LOSS (USDT)</label>
              <input type="number" id="order-sl" placeholder="66,500" class="w-full px-3 py-2 rounded-xl bg-[#080a0f] border border-[#252c3d] text-white text-xs mt-1 outline-none focus:border-rose-500">
            </div>
            <div>
              <label class="text-gray-400 text-[10px]">TAKE PROFIT (USDT)</label>
              <input type="number" id="order-tp" placeholder="69,800" class="w-full px-3 py-2 rounded-xl bg-[#080a0f] border border-[#252c3d] text-white text-xs mt-1 outline-none focus:border-emerald-500">
            </div>
          </div>

          <!-- Order Summary Readout -->
          <div class="p-3 rounded-xl bg-[#090b10] border border-[#252c3d] text-[11px] font-mono space-y-1 text-gray-400">
            <div class="flex justify-between">
              <span>Required Margin:</span>
              <span id="order-margin-cost" class="text-white font-bold">$674.20 USDT</span>
            </div>
            <div class="flex justify-between">
              <span>Est. Liquidation Price:</span>
              <span id="order-liq-price" class="text-amber-400 font-bold">$60,678.00 USDT</span>
            </div>
          </div>

          <!-- Submit Button -->
          <button id="btn-place-order" onclick="placeOrder()" class="w-full py-3 rounded-xl gold-gradient text-white text-xs sm:text-sm font-bold shadow-lg hover:opacity-95 transition-opacity cursor-pointer">
            Execute Market Order (Kelly 1% Cleared)
          </button>
        </div>
      </div>

      <!-- Active Open Positions & Trade History -->
      <div class="p-4 sm:p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#252c3d]">
          <span class="cinzel font-bold text-white text-sm">Open Positions (<span id="positions-count">0</span>)</span>
          <span class="text-xs text-gray-400 font-mono">Live Mark Pricing</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left font-mono text-xs">
            <thead>
              <tr class="text-[10px] text-gray-500 border-b border-[#1f2638]">
                <th class="py-2">SYMBOL</th>
                <th class="py-2">SIDE</th>
                <th class="py-2">SIZE</th>
                <th class="py-2">ENTRY</th>
                <th class="py-2">MARK</th>
                <th class="py-2">LIQ PRICE</th>
                <th class="py-2">PNL (ROE%)</th>
                <th class="py-2 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody id="positions-table-body">
              <tr>
                <td colspan="8" class="text-center py-6 text-gray-500">No active positions open. Execute an order above.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: BUSINESS CODEX ==================== -->
    <div id="tab-content-codex" class="w-full text-left space-y-4 hidden">
      <!-- Daily Focus Execution Directive -->
      <div id="standalone-daily-focus-card" class="p-4 rounded-2xl bg-gradient-to-r from-[#0d1017] via-[#111522] to-[#0d1017] border border-[#252c3d] shadow-lg relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d47a37]/60 to-transparent pointer-events-none"></div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 shrink-0">
            <div id="standalone-focus-icon" class="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d47a37]/25 to-[#b85d19]/15 text-[#f8b179] border border-[#d47a37]/35 flex items-center justify-center font-bold text-sm">
              🎯
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="cinzel text-xs font-bold text-white uppercase tracking-wider">Daily Focus</span>
                <span id="standalone-focus-date" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181f2f] text-[#9ca3af] border border-[#252f44]">Today</span>
                <span class="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">🔥 1d Streak</span>
              </div>
              <p class="text-[11px] text-gray-400 mt-0.5">One non-negotiable operational milestone for today</p>
            </div>
          </div>
          <div class="flex-1 max-w-lg">
            <div id="standalone-focus-view" class="flex items-center justify-between gap-2 bg-[#090b10] border border-[#1f2638] rounded-xl px-3 py-2">
              <label class="flex items-center gap-2 flex-1 cursor-pointer select-none min-w-0">
                <input id="standalone-focus-checkbox" type="checkbox" onchange="toggleStandaloneFocus(this.checked)" class="w-4 h-4 rounded text-[#d47a37] accent-[#d47a37] cursor-pointer shrink-0">
                <span id="standalone-focus-text" class="text-xs text-gray-200 truncate">Execute Wyckoff volume confirmation on all trade entries</span>
              </label>
              <button onclick="editStandaloneFocus()" title="Edit Target" class="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 cursor-pointer shrink-0">✎</button>
            </div>
            <form id="standalone-focus-edit-form" onsubmit="saveStandaloneFocus(event)" class="flex items-center gap-2 hidden">
              <input id="standalone-focus-input" type="text" placeholder="Set today's primary objective..." class="flex-1 px-3 py-1.5 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]">
              <button type="submit" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white text-xs font-bold cursor-pointer shrink-0">Commit</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Codex Chapter Navigation Pills -->
      <div class="p-4 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#252c3d]">
          <div>
            <h3 class="cinzel text-base font-bold text-white" id="codex-discipline-title">Trading Core Executive Directives</h3>
            <p class="text-xs text-gray-400">Zero-doubt operating mandates with audio speech reader and interactive quiz</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="readCurrentChapterAloud()" id="btn-read-codex" class="px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors">
              <span>🔊 Read Aloud</span>
            </button>
          </div>
        </div>

        <div id="codex-chapter-pills" class="flex flex-wrap gap-2 pt-1">
          <!-- Filled by JavaScript based on active domain -->
        </div>
      </div>

      <!-- Active Chapter Content Card -->
      <div class="p-5 sm:p-7 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-[#252c3d] pb-3">
          <div>
            <div class="text-[10px] font-mono text-[#f8b179] font-bold uppercase tracking-wider" id="codex-chapter-number">CHAPTER 01 // MANDATE</div>
            <h2 class="cinzel text-xl sm:text-2xl font-bold text-white mt-0.5" id="codex-chapter-heading">Liquidity Sweep & Wyckoff Accumulation</h2>
          </div>
          <span class="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">VERIFIED DIRECTIVE</span>
        </div>

        <div id="codex-chapter-text" class="text-xs sm:text-sm text-gray-300 space-y-3.5 leading-relaxed">
          <!-- Dynamically populated -->
        </div>

        <!-- Interactive Knowledge Check Quiz -->
        <div class="mt-6 pt-6 border-t border-[#252c3d] space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-lg">🎯</span>
              <h4 class="cinzel text-base font-bold text-white">Interactive Knowledge Check</h4>
            </div>
            <span class="text-xs font-mono text-[#f8b179]" id="quiz-score-indicator">SCORE: 0 / 3</span>
          </div>

          <div id="codex-quiz-container" class="space-y-4">
            <!-- Rendered by JS -->
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 3: AUTONOMOUS AI ADVISOR ==================== -->
    <div id="tab-content-ai-chat" class="w-full text-left space-y-4 hidden">
      <div class="p-5 sm:p-7 rounded-2xl bg-[#0e1118] border border-[#d47a37]/40 shadow-2xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#252c3d] gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40">
                🎙️ Autonomous Voice Intelligence
              </span>
              <span class="text-xs text-emerald-400 font-mono">100% Offline Capable</span>
            </div>
            <h3 class="cinzel text-xl font-bold text-white mt-1">LURL Autonomous AI Advisor</h3>
          </div>

          <div class="flex items-center gap-2">
            <button id="voice-listen-toggle" onclick="toggleSpeechRecognition()" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#141824] hover:bg-[#1f2638] text-white border border-[#252c3d] flex items-center gap-2 transition-colors cursor-pointer">
              <span id="mic-icon">🎙️</span>
              <span id="mic-status-label">Speak (Mic)</span>
            </button>
            <button id="auto-speak-btn" onclick="toggleAutoSpeak()" class="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#141824] text-[#f8b179] border border-[#252c3d] cursor-pointer">
              🔊 Voice: <span id="auto-speak-val" class="font-bold">ON</span>
            </button>
          </div>
        </div>

        <!-- Chat Conversation Messages -->
        <div id="standalone-chat-box" class="h-80 overflow-y-auto space-y-4 p-4 rounded-xl bg-[#080a0f] border border-[#1f2638] text-xs">
          <div class="p-4 rounded-xl bg-[#141824] border border-[#252c3d] text-gray-200">
            <div class="font-bold text-[#f8b179] mb-1 flex items-center justify-between">
              <span>LURL Autonomous AI Core (<span id="chat-domain-label">TRADING</span>)</span>
              <button onclick="speakLastResponse()" class="text-[11px] text-gray-400 hover:text-white cursor-pointer">🔊 Read Aloud</button>
            </div>
            Welcome to LURL Autonomous Business Intelligence. Press <strong>Speak (Mic)</strong> or enter any question below. All algorithms, mathematical models, and risk rules run entirely within your browser with zero latency and zero doubt.
          </div>
        </div>

        <!-- Chat Input Form -->
        <form onsubmit="handleSend(event)" class="flex gap-2">
          <input
            id="standalone-input"
            type="text"
            placeholder="Ask anything about trading rules, viral dropship scripts, CRO, or startup moats..."
            class="flex-1 px-4 py-3 rounded-xl bg-[#080a0f] border border-[#252c3d] text-white text-xs sm:text-sm outline-none focus:border-[#d47a37] transition-colors"
          />
          <button
            type="submit"
            class="px-5 py-3 rounded-xl gold-gradient text-white text-xs sm:text-sm font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <span>Ask AI</span>
            <span>↵</span>
          </button>
        </form>

        <!-- Quick Question Prompts -->
        <div class="flex flex-wrap gap-2 text-[11px] text-gray-400 pt-1">
          <span class="text-gray-500">Quick Prompts:</span>
          <button onclick="askPrompt('What is the exact Wyckoff liquidity sweep entry rule?')" class="hover:text-[#f8b179] hover:underline cursor-pointer">Wyckoff Entry</button>
          <span>•</span>
          <button onclick="askPrompt('How do I write a 3-second viral hook for TikTok ads?')" class="hover:text-[#f8b179] hover:underline cursor-pointer">3s Hook Script</button>
          <span>•</span>
          <button onclick="askPrompt('What are the 3 mandatory post-purchase email flows for 40% repeat LTV?')" class="hover:text-[#f8b179] hover:underline cursor-pointer">D2C Retention</button>
          <span>•</span>
          <button onclick="askPrompt('How do I build a vector memory moat that protects against open-source models?')" class="hover:text-[#f8b179] hover:underline cursor-pointer">AI Startup Moat</button>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 4: SHARE THOUGHTS & COMMUNITY FORUM ==================== -->
    <div id="tab-content-share-thoughts" class="w-full text-left space-y-4 hidden">
      <!-- Create New Thought Card -->
      <div class="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#252c3d]">
          <h3 class="cinzel text-base font-bold text-white">Share Executive Strategy</h3>
          <span class="text-xs text-gray-400 font-mono">Peer Validation Forum</span>
        </div>
        <div class="space-y-2.5">
          <input id="thought-title" type="text" placeholder="Strategy Heading (e.g., Wyckoff Liquidity Sizing at Asian Open)" class="w-full px-3 py-2 rounded-xl bg-[#080a0f] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]">
          <textarea id="thought-body" rows="3" placeholder="Detail the hypothesis, data points, or rule execution..." class="w-full px-3 py-2 rounded-xl bg-[#080a0f] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]"></textarea>
          <div class="flex justify-between items-center pt-1">
            <select id="thought-category" class="px-3 py-1.5 rounded-lg bg-[#141824] border border-[#252c3d] text-xs text-gray-300">
              <option value="trading">Trading Core</option>
              <option value="dropshipping">AI Dropshipping</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="startup">AI Startup</option>
            </select>
            <button onclick="submitThought()" class="px-5 py-2 rounded-xl gold-gradient text-white text-xs font-bold shadow-md cursor-pointer">
              Publish Thought
            </button>
          </div>
        </div>
      </div>

      <!-- Thoughts Stream -->
      <div class="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-4">
        <h3 class="cinzel text-base font-bold text-white pb-2 border-b border-[#252c3d]">Community Discussions</h3>
        <div id="thoughts-stream" class="space-y-3">
          <!-- Filled by JS -->
        </div>
      </div>
    </div>

    <!-- ==================== TAB 5: MY PERFORMANCE & ANALYTICS ==================== -->
    <div id="tab-content-performance" class="w-full text-left space-y-4 hidden">
      <!-- Performance Metrics Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="p-4 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl">
          <div class="text-[10px] text-gray-400 uppercase font-mono">Win Rate</div>
          <div id="perf-win-rate" class="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1">68.4%</div>
          <div class="text-[10px] text-gray-500 mt-1">Target: >60%</div>
        </div>
        <div class="p-4 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl">
          <div class="text-[10px] text-gray-400 uppercase font-mono">Total Realized P&L</div>
          <div id="perf-total-pnl" class="text-xl sm:text-2xl font-bold text-emerald-400 font-mono mt-1">+$1,450.00</div>
          <div class="text-[10px] text-gray-500 mt-1">ROI: +14.5%</div>
        </div>
        <div class="p-4 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl">
          <div class="text-[10px] text-gray-400 uppercase font-mono">Profit Factor</div>
          <div id="perf-profit-factor" class="text-xl sm:text-2xl font-bold text-white font-mono mt-1">2.42</div>
          <div class="text-[10px] text-gray-500 mt-1">Gross Win / Gross Loss</div>
        </div>
        <div class="p-4 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl">
          <div class="text-[10px] text-gray-400 uppercase font-mono">Executive Rank</div>
          <div class="text-xl sm:text-2xl font-bold text-[#f8b179] font-mono mt-1">VIP Sovereign</div>
          <div class="text-[10px] text-emerald-400 mt-1">👑 Top 1% Cleared</div>
        </div>
      </div>

      <!-- Equity Curve Chart -->
      <div class="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#252c3d]">
          <span class="cinzel font-bold text-white text-base">Simulated Equity Curve ($USD)</span>
          <span class="text-xs text-emerald-400 font-mono font-bold">+14.50% All-Time</span>
        </div>
        <div class="w-full h-44 bg-[#080a0f] rounded-xl border border-[#1f2638] p-3 flex flex-col justify-between">
          <svg id="perf-equity-svg" class="w-full h-32" viewBox="0 0 600 120" preserveAspectRatio="none">
            <line x1="0" y1="30" x2="600" y2="30" stroke="#171d2b" stroke-dasharray="2,2" />
            <line x1="0" y1="60" x2="600" y2="60" stroke="#171d2b" stroke-dasharray="2,2" />
            <line x1="0" y1="90" x2="600" y2="90" stroke="#171d2b" stroke-dasharray="2,2" />
            <polyline id="perf-equity-polyline" fill="none" stroke="#d47a37" stroke-width="2.5" points="0,100 80,95 160,88 240,70 320,75 400,50 480,45 600,25" />
          </svg>
          <div class="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>Start: $10,000.00</span>
            <span>Current: $11,450.00</span>
          </div>
        </div>
      </div>

      <!-- Domain Mastery Progress -->
      <div class="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-3">
        <h3 class="cinzel text-base font-bold text-white pb-2 border-b border-[#252c3d]">Domain Competency Matrix</h3>
        <div class="space-y-3 text-xs font-mono">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-300">01. Trading Core (Wyckoff & Kelly Risk)</span>
              <span class="text-emerald-400 font-bold">100% (Certified)</span>
            </div>
            <div class="w-full h-2 rounded-full bg-[#141824] overflow-hidden"><div class="h-full bg-emerald-500 w-full"></div></div>
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-300">02. AI Dropshipping (Viral Hooks & ERP)</span>
              <span class="text-[#f8b179] font-bold">85%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-[#141824] overflow-hidden"><div class="h-full bg-[#d47a37] w-[85%]"></div></div>
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-300">03. E-Commerce (Checkout CRO & LTV)</span>
              <span class="text-[#f8b179] font-bold">78%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-[#141824] overflow-hidden"><div class="h-full bg-[#d47a37] w-[78%]"></div></div>
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-300">04. AI Startup Moats (Vector Graphs & ARR)</span>
              <span class="text-[#f8b179] font-bold">90%</span>
            </div>
            <div class="w-full h-2 rounded-full bg-[#141824] overflow-hidden"><div class="h-full bg-[#d47a37] w-[90%]"></div></div>
          </div>
        </div>
      </div>
    </div>
  </main>`;
}
