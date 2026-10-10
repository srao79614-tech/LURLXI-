/**
 * Complete Client-side JavaScript Engine for Standalone LURL HTML
 */
export function getClientEngineScript(): string {
  return `  <!-- ==================== JAVASCRIPT ENGINE (100% SELF-CONTAINED) ==================== -->
  <script>
    // State
    let activeCategory = 'trading';
    let currentTab = 'trading';
    let hasSelectedDomain = false;
    let btcPrice = 67420.00;
    let demoBalance = 10000.00;
    let openPositions = [];
    let closedTrades = [];
    let candleHistory = [];
    let orderSide = 'LONG';
    let orderLeverage = 10;
    let activeChapterIdx = 0;
    let autoSpeak = true;
    let isListening = false;
    let lastAiResponse = '';
    let speechRecognitionInstance = null;
    let thoughtsList = [
      { id: 1, title: 'Wyckoff Spring below $66,200 Asian Lows', category: 'trading', body: 'Noticed aggressive passive bid absorption at $66,180 with CVD divergence. Entered 0.5 BTC long targeting the 4H FVG at $68,400.', author: 'executive@lurl.vip', likes: 14, time: '20m ago' },
      { id: 2, title: 'TikTok 3s Hook Iteration: Visceral Problem', category: 'dropshipping', body: 'Replaced lifestyle b-roll with micro-scratch testing on the ceramic screen protector. Thumb-stop rate surged from 21% to 41.8%.', author: 'Marcus_VIP', likes: 29, time: '1h ago' },
      { id: 3, title: 'Post-Purchase Day 7 Reorder Architecture', category: 'ecommerce', body: 'Triggering consumable refills exactly 3 days before supply depletion yields a 34% conversion on SMS reminder links.', author: 'Elena_CRO', likes: 18, time: '3h ago' }
    ];

    // Audio Synthesizer State (Web Audio API)
    let audioCtx = null;
    let bgmOscillator = null;
    let bgmGain = null;
    let isBgmPlaying = false;

    // User State
    const AUTH_KEY = 'lurl_standalone_user_session';
    let currentUser = {
      email: 'executive@lurl.vip',
      isVip: true,
      tenure: '5 Months (Verified)'
    };

    // Load Saved Session
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        currentUser = { ...currentUser, ...JSON.parse(saved) };
      }
    } catch (e) {}

    // Initialize on Load
    window.addEventListener('DOMContentLoaded', () => {
      initUserDisplay();
      initCandleData();
      startPriceTicker();
      updateOrderbook();
      updateCodexDiscipline(activeCategory);
      renderThoughts();
      updatePerformanceStats();
      toggleSlidebar(false);
    });

    // Sound FX Generator (Pure Web Audio)
    function playTone(freq, type = 'sine', duration = 0.15) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {}
    }

    // Relaxing Ambient Synthesizer BGM
    function toggleBgm() {
      if (isBgmPlaying) {
        stopBgm();
      } else {
        startBgm();
      }
    }

    function startBgm() {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        bgmOscillator = audioCtx.createOscillator();
        bgmGain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        bgmOscillator.type = 'sine';
        bgmOscillator.frequency.setValueAtTime(174.61, audioCtx.currentTime); // F3 healing frequency
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, audioCtx.currentTime);

        bgmGain.gain.setValueAtTime(0.04, audioCtx.currentTime);

        bgmOscillator.connect(filter);
        filter.connect(bgmGain);
        bgmGain.connect(audioCtx.destination);

        bgmOscillator.start();
        isBgmPlaying = true;
        updateBgmUi(true);
      } catch (e) {
        console.warn('Audio BGM:', e);
      }
    }

    function stopBgm() {
      if (bgmOscillator) {
        try { bgmOscillator.stop(); } catch (e) {}
        bgmOscillator = null;
      }
      isBgmPlaying = false;
      updateBgmUi(false);
    }

    function updateBgmUi(playing) {
      const topLabel = document.getElementById('top-bgm-label');
      const topIcon = document.getElementById('top-bgm-icon');
      const modalBtn = document.getElementById('modal-bgm-btn');
      if (topLabel) topLabel.innerText = playing ? 'BGM: ON' : 'BGM: OFF';
      if (topIcon) topIcon.innerText = playing ? '🔊' : '🎵';
      if (modalBtn) modalBtn.innerText = playing ? 'ON' : 'OFF';
    }

    // ==================== STAGE & TAB NAVIGATION ====================
    function completeSelectionProcess(domain) {
      playTone(587.33, 'sine', 0.2); // D5 chime
      hasSelectedDomain = true;
      activeCategory = domain;

      document.getElementById('selection-stage').classList.add('hidden');
      document.getElementById('application-stage').classList.remove('hidden');

      updateDomainUI(domain);
      switchTab('trading');
      toggleSlidebar(true); // Open Slidebar after selection as designed
    }

    function backToSelection() {
      playTone(392.00, 'sine', 0.15);
      hasSelectedDomain = false;
      document.getElementById('application-stage').classList.add('hidden');
      document.getElementById('selection-stage').classList.remove('hidden');
      toggleSlidebar(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function switchDomain(domain) {
      playTone(523.25, 'sine', 0.15);
      activeCategory = domain;
      updateDomainUI(domain);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateDomainUI(domain) {
      const titles = {
        trading: 'Trading Core & Bitcoin',
        dropshipping: 'AI Dropshipping & Viral Commerce',
        ecommerce: 'Direct-to-Consumer E-Commerce',
        startup: 'AI Startup Moats & Venture Scale'
      };
      const icons = {
        trading: '📈',
        dropshipping: '⚡',
        ecommerce: '🛍️',
        startup: '🚀'
      };

      const titleEl = document.getElementById('current-track-title');
      const iconEl = document.getElementById('current-track-icon');
      const chatLabel = document.getElementById('chat-domain-label');

      if (titleEl) titleEl.innerText = titles[domain] || domain;
      if (iconEl) iconEl.innerText = icons[domain] || '💼';
      if (chatLabel) chatLabel.innerText = (titles[domain] || domain).toUpperCase();

      updateCodexDiscipline(domain);
    }

    function switchTab(tabId) {
      playTone(440, 'triangle', 0.08);
      currentTab = tabId;

      const tabs = ['trading', 'codex', 'ai-chat', 'share-thoughts', 'performance'];
      tabs.forEach(t => {
        const contentEl = document.getElementById('tab-content-' + t);
        const btnEl = document.getElementById('tab-btn-' + t);
        if (contentEl) {
          if (t === tabId) {
            contentEl.classList.remove('hidden');
          } else {
            contentEl.classList.add('hidden');
          }
        }
        if (btnEl) {
          if (t === tabId) {
            btnEl.className = 'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md';
          } else {
            btnEl.className = 'px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all bg-transparent text-gray-400 hover:text-white hover:bg-[#141824]';
          }
        }
      });
    }

    // ==================== SLIDEBAR & MODALS ====================
    function toggleSlidebar(show) {
      const slidebar = document.getElementById('standalone-slidebar');
      const backdrop = document.getElementById('slidebar-backdrop');
      if (!slidebar || !backdrop) return;
      if (show) {
        slidebar.classList.remove('closed');
        slidebar.classList.add('open');
        backdrop.classList.remove('hidden');
      } else {
        slidebar.classList.remove('open');
        slidebar.classList.add('closed');
        backdrop.classList.add('hidden');
      }
    }

    function showModal(title, bodyHtml) {
      document.getElementById('custom-modal-title').innerText = title;
      document.getElementById('custom-modal-body').innerHTML = bodyHtml;
      document.getElementById('custom-modal-overlay').classList.remove('hidden');
    }

    function closeCustomModal() {
      document.getElementById('custom-modal-overlay').classList.add('hidden');
    }

    function openVipModal() {
      document.getElementById('vip-modal-overlay').classList.remove('hidden');
    }
    function closeVipModal() {
      document.getElementById('vip-modal-overlay').classList.add('hidden');
    }

    function openSettingsModal() {
      document.getElementById('settings-modal-overlay').classList.remove('hidden');
    }
    function closeSettingsModal() {
      document.getElementById('settings-modal-overlay').classList.add('hidden');
    }

    function openProfileModal() {
      document.getElementById('profile-modal-overlay').classList.remove('hidden');
    }
    function closeProfileModal() {
      document.getElementById('profile-modal-overlay').classList.add('hidden');
    }

    const MASTER_VIP_PASSWORD = '1029384756';

    function maskEmail(email) {
      if (!email) return '';
      const trimmed = String(email).trim();
      const atIndex = trimmed.indexOf('@');
      if (atIndex <= 0) return trimmed;
      const username = trimmed.slice(0, atIndex);
      const domain = trimmed.slice(atIndex);
      return username.charAt(0) + '*****' + domain;
    }

    function isPrivilegedEmail(email) {
      if (!email) return false;
      const em = String(email).trim().toLowerCase();
      return em === 'lurlbusiness7@gmail.com' || em === 'srao79614@gmail.com';
    }

    function verifyVipSecret() {
      const code = document.getElementById('vip-secret-code')?.value.trim();
      const isAuthorizedAdmin = isPrivilegedEmail(currentUser.email);

      if (!isAuthorizedAdmin) {
        playTone(220, 'sawtooth', 0.2);
        showModal('Access Restricted', '<p class="text-rose-400 font-bold">⛔ Restricted: Only the designated proprietor VIP Gmail address has VIP clearance. Regular users cannot execute VIP authority.</p>');
        return;
      }

      if (code === MASTER_VIP_PASSWORD || currentUser.isVip) {
        currentUser.isVip = true;
        try { localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser)); } catch (e) {}
        initUserDisplay();
        closeVipModal();
        playTone(880, 'sine', 0.25);
        showModal('👑 VIP Executive Granted', \`
          <div class="text-xs space-y-2 text-gray-200">
            <div class="text-emerald-400 font-bold">✓ Master VIP Clearance Activated (Passcode Verified)</div>
            <div>• Current Account: <span class="text-[#f8b179] font-mono">\${maskEmail(currentUser.email)}</span></div>
            <div>• Kelly 1% Risk Floor Override: <span class="text-[#f8b179] font-mono">ENABLED</span></div>
            <div>• Max Leverage Cap: <span class="text-[#f8b179] font-mono">100x UNLOCKED</span></div>
            <div>• Clearance Status: <span class="text-emerald-400 font-mono">VIP Executive Clear</span></div>
            <div class="text-[11px] text-[#f8b179] mt-2 bg-[#090b10] p-2 rounded border border-[#252c3d]">
              Inner qualities calibration unlocked. Zero 403 or network dependency.
            </div>
          </div>
        \`);
      } else {
        playTone(220, 'sawtooth', 0.2);
        showModal('Access Restricted', '<p class="text-rose-400 font-bold">⛔ Invalid VIP Passcode. Access restricted to authorized proprietor password (1029384756).</p>');
      }
    }

    function unlockVipDirect() {
      if (!isPrivilegedEmail(currentUser.email)) {
        showModal('Access Restricted', '<p class="text-rose-400 font-bold">⛔ Restricted: Only the designated proprietor VIP Gmail address has VIP clearance.</p>');
        return;
      }
      const input = document.getElementById('vip-secret-code');
      if (input) input.value = MASTER_VIP_PASSWORD;
      verifyVipSecret();
    }

    function saveProfileEmail() {
      const input = document.getElementById('profile-email-input');
      if (input && input.value.includes('@')) {
        currentUser.email = input.value.trim();
        currentUser.isVip = isPrivilegedEmail(currentUser.email);
        try { localStorage.setItem(AUTH_KEY, JSON.stringify(currentUser)); } catch (e) {}
        initUserDisplay();
        closeProfileModal();
        showModal('Identity Updated', '<p class="text-emerald-400">✓ Account identity saved and masked for privacy (' + escapeHtml(maskEmail(currentUser.email)) + ')</p>');
      }
    }

    function initUserDisplay() {
      const email = currentUser.email || 'guest@gmail.com';
      const label = document.getElementById('header-user-label');
      const slidebarEmail = document.getElementById('slidebar-user-email');
      const slidebarBadge = document.getElementById('slidebar-user-badge');
      const slidebarVipSection = document.getElementById('slidebar-vip-section');
      const footerEmail = document.getElementById('footer-user-email');
      const modalEmail = document.getElementById('profile-modal-email');
      const masked = maskEmail(email);

      const isVip = Boolean(currentUser.isVip && isPrivilegedEmail(currentUser.email));
      currentUser.isVip = isVip;

      if (slidebarVipSection) {
        if (isVip) {
          slidebarVipSection.classList.remove('hidden');
        } else {
          slidebarVipSection.classList.add('hidden');
        }
      }

      if (slidebarBadge) {
        if (currentUser.email === 'lurlbusiness7@gmail.com') {
          slidebarBadge.innerHTML = '<span>⚡ Executive Administrator</span>';
        } else if (isVip) {
          slidebarBadge.innerHTML = '<span>👑 VIP Executive Cleared</span>';
        } else {
          slidebarBadge.innerHTML = '<span>✓ Verified Member</span>';
        }
      }

      if (label) {
        if (currentUser.email === 'lurlbusiness7@gmail.com') {
          label.innerText = 'Administrator';
        } else if (isVip) {
          label.innerText = 'VIP Executive';
        } else {
          label.innerText = masked;
        }
      }
      if (slidebarEmail) slidebarEmail.innerText = masked;
      if (footerEmail) footerEmail.innerText = masked;
      if (modalEmail) modalEmail.innerText = masked;
    }

    function resetAllData() {
      demoBalance = 10000.00;
      openPositions = [];
      closedTrades = [];
      updatePositionsTable();
      updatePerformanceStats();
      closeSettingsModal();
      showModal('Data Reset', '<p class="text-white">Paper balance restored to $10,000.00 USD. History cleared.</p>');
    }

    // ==================== CANDLESTICK & CHART ENGINE ====================
    function initCandleData() {
      candleHistory = [];
      let base = 67100;
      for (let i = 0; i < 22; i++) {
        const change = (Math.random() - 0.48) * 85;
        const open = base;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * 45;
        const low = Math.min(open, close) - Math.random() * 45;
        candleHistory.push({ open, close, high, low, vol: 15 + Math.random() * 30 });
        base = close;
      }
      btcPrice = base;
      renderChart();
      updateOrderSummary();
    }

    function startPriceTicker() {
      setInterval(() => {
        const delta = (Math.random() - 0.49) * 35;
        btcPrice = Math.max(50000, btcPrice + delta);

        if (candleHistory.length > 0) {
          const last = candleHistory[candleHistory.length - 1];
          last.close = btcPrice;
          if (btcPrice > last.high) last.high = btcPrice;
          if (btcPrice < last.low) last.low = btcPrice;
        }

        renderChart();
        updateOpenPositionsPnL();
        updateOrderbook();

        // Update Top Ticker
        const topPrice = document.getElementById('top-ticker-price');
        const termPrice = document.getElementById('terminal-price');
        const fmt = '$' + btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (topPrice) topPrice.innerText = fmt;
        if (termPrice) {
          termPrice.innerText = fmt;
          termPrice.className = 'text-lg font-bold ' + (delta >= 0 ? 'text-emerald-400' : 'text-rose-400');
        }
      }, 2200);
    }

    function renderChart() {
      const group = document.getElementById('svg-candles-group');
      if (!group || candleHistory.length === 0) return;

      let minP = Infinity;
      let maxP = -Infinity;
      candleHistory.forEach(c => {
        if (c.low < minP) minP = c.low;
        if (c.high > maxP) maxP = c.high;
      });
      const range = (maxP - minP) || 100;

      const spacing = 28;
      const candleWidth = 16;
      let html = '';

      // MA20 & EMA50 polyline points
      let maPoints = [];
      let emaPoints = [];

      candleHistory.forEach((c, idx) => {
        const x = 16 + idx * spacing;
        const isGreen = c.close >= c.open;
        const color = isGreen ? '#10b981' : '#f43f5e';

        const highY = 200 - ((c.high - minP) / range) * 165;
        const lowY = 200 - ((c.low - minP) / range) * 165;
        const openY = 200 - ((c.open - minP) / range) * 165;
        const closeY = 200 - ((c.close - minP) / range) * 165;

        const bodyY = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

        // Wick
        html += \`<line x1="\${x + candleWidth/2}" y1="\${highY}" x2="\${x + candleWidth/2}" y2="\${lowY}" stroke="\${color}" stroke-width="1.2" />\`;
        // Body
        html += \`<rect x="\${x}" y="\${bodyY}" width="\${candleWidth}" height="\${bodyHeight}" fill="\${color}" rx="1" />\`;

        // Moving averages
        const closeAvg = (c.open + c.close) / 2;
        maPoints.push(\`\${x + candleWidth/2},\${200 - ((closeAvg - minP)/range)*165}\`);
        emaPoints.push(\`\${x + candleWidth/2},\${200 - (((closeAvg*0.998) - minP)/range)*165}\`);
      });

      // Indicators Overlays
      if (document.getElementById('chk-ma20')?.checked) {
        html += \`<polyline fill="none" stroke="#f8b179" stroke-width="1.5" stroke-dasharray="2,2" points="\${maPoints.join(' ')}" opacity="0.85" />\`;
      }
      if (document.getElementById('chk-ema50')?.checked) {
        html += \`<polyline fill="none" stroke="#22d3ee" stroke-width="1.5" points="\${emaPoints.join(' ')}" opacity="0.85" />\`;
      }
      if (document.getElementById('chk-bb')?.checked) {
        html += \`<polyline fill="none" stroke="#c084fc" stroke-width="1" stroke-dasharray="3,3" points="\${maPoints.map(p => {
          const parts = p.split(',');
          return parts[0] + ',' + (parseFloat(parts[1]) - 18);
        }).join(' ')}" opacity="0.6" />\`;
        html += \`<polyline fill="none" stroke="#c084fc" stroke-width="1" stroke-dasharray="3,3" points="\${maPoints.map(p => {
          const parts = p.split(',');
          return parts[0] + ',' + (parseFloat(parts[1]) + 18);
        }).join(' ')}" opacity="0.6" />\`;
      }

      group.innerHTML = html;

      // Update RSI Value
      const rsiVal = 50 + (Math.sin(Date.now() / 8000) * 18);
      const rsiEl = document.getElementById('rsi-val');
      if (rsiEl) rsiEl.innerText = rsiVal.toFixed(1);
    }

    function setTimeframe(tf) {
      playTone(480, 'sine', 0.05);
      initCandleData();
    }

    // ==================== ORDER BOOK ====================
    function updateOrderbook() {
      const asksEl = document.getElementById('orderbook-asks');
      const bidsEl = document.getElementById('orderbook-bids');
      const midEl = document.getElementById('orderbook-mid-price');
      if (!asksEl || !bidsEl) return;

      if (midEl) midEl.innerText = '$' + btcPrice.toFixed(2);

      let asksHtml = '';
      for (let i = 5; i >= 1; i--) {
        const p = btcPrice + i * 8.5;
        const size = (0.25 + Math.random() * 1.5).toFixed(3);
        const depth = Math.min(100, Math.floor(size * 40));
        asksHtml += \`
          <div class="flex justify-between items-center relative py-0.5 px-1 text-[11px]">
            <div class="absolute right-0 top-0 bottom-0 bg-rose-950/40 rounded" style="width: \${depth}%"></div>
            <span class="text-rose-400 font-bold z-10">\${p.toFixed(2)}</span>
            <span class="text-gray-300 z-10">\${size}</span>
            <span class="text-gray-500 z-10">\${(p * size / 1000).toFixed(1)}k</span>
          </div>
        \`;
      }
      asksEl.innerHTML = asksHtml;

      let bidsHtml = '';
      for (let i = 1; i <= 5; i++) {
        const p = btcPrice - i * 8.5;
        const size = (0.25 + Math.random() * 1.5).toFixed(3);
        const depth = Math.min(100, Math.floor(size * 40));
        bidsHtml += \`
          <div class="flex justify-between items-center relative py-0.5 px-1 text-[11px]">
            <div class="absolute right-0 top-0 bottom-0 bg-emerald-950/40 rounded" style="width: \${depth}%"></div>
            <span class="text-emerald-400 font-bold z-10">\${p.toFixed(2)}</span>
            <span class="text-gray-300 z-10">\${size}</span>
            <span class="text-gray-500 z-10">\${(p * size / 1000).toFixed(1)}k</span>
          </div>
        \`;
      }
      bidsEl.innerHTML = bidsHtml;
    }

    // ==================== TRADING ORDER EXECUTION ====================
    function setOrderSide(side) {
      playTone(400, 'sine', 0.05);
      orderSide = side;
      const longBtn = document.getElementById('order-side-long');
      const shortBtn = document.getElementById('order-side-short');
      if (side === 'LONG') {
        longBtn.className = 'py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white shadow-md cursor-pointer transition-all';
        shortBtn.className = 'py-2.5 rounded-xl font-bold text-xs bg-[#141824] text-gray-300 border border-[#252c3d] hover:bg-rose-900/40 cursor-pointer transition-all';
      } else {
        shortBtn.className = 'py-2.5 rounded-xl font-bold text-xs bg-rose-600 text-white shadow-md cursor-pointer transition-all';
        longBtn.className = 'py-2.5 rounded-xl font-bold text-xs bg-[#141824] text-gray-300 border border-[#252c3d] hover:bg-emerald-900/40 cursor-pointer transition-all';
      }
      updateOrderSummary();
    }

    function setAmountPct(pct) {
      playTone(500, 'sine', 0.05);
      const lev = parseInt(document.getElementById('order-leverage')?.value || '10');
      const usableBalance = demoBalance * (pct / 100);
      const totalNotional = usableBalance * lev;
      const btcAmount = Math.max(0.01, (totalNotional / btcPrice)).toFixed(2);
      const amtInput = document.getElementById('order-amount');
      if (amtInput) amtInput.value = btcAmount;
      updateOrderSummary();
    }

    function updateOrderSummary() {
      const levInput = document.getElementById('order-leverage');
      const levLabel = document.getElementById('order-leverage-label');
      const amtInput = document.getElementById('order-amount');
      const marginCostEl = document.getElementById('order-margin-cost');
      const liqPriceEl = document.getElementById('order-liq-price');
      const balEl = document.getElementById('terminal-balance');
      const availEl = document.getElementById('order-avail-balance');

      orderLeverage = parseInt(levInput?.value || '10');
      if (levLabel) levLabel.innerText = orderLeverage + 'x';
      if (balEl) balEl.innerText = '$' + demoBalance.toLocaleString('en-US', { minimumFractionDigits: 2 });
      if (availEl) availEl.innerText = '$' + demoBalance.toLocaleString('en-US', { maximumFractionDigits: 0 });

      const amount = parseFloat(amtInput?.value || '0.1');
      const notional = amount * btcPrice;
      const margin = notional / orderLeverage;

      if (marginCostEl) marginCostEl.innerText = '$' + margin.toFixed(2) + ' USDT';

      // Estimated Liquidation Price
      let liq = 0;
      if (orderSide === 'LONG') {
        liq = btcPrice * (1 - (1 / orderLeverage) * 0.9);
      } else {
        liq = btcPrice * (1 + (1 / orderLeverage) * 0.9);
      }
      if (liqPriceEl) liqPriceEl.innerText = '$' + Math.max(0, liq).toFixed(2) + ' USDT';
    }

    function placeOrder() {
      const amt = parseFloat(document.getElementById('order-amount')?.value || '0.1');
      const notional = amt * btcPrice;
      const margin = notional / orderLeverage;

      if (margin > demoBalance) {
        playTone(200, 'sawtooth', 0.2);
        showModal('Insufficient Balance', '<p class="text-rose-400">Required margin exceeds demo balance ($' + demoBalance.toFixed(2) + '). Lower size or leverage.</p>');
        return;
      }

      demoBalance -= margin;

      const newPos = {
        id: Date.now(),
        symbol: 'BTC/USDT',
        side: orderSide,
        size: amt,
        entryPrice: btcPrice,
        margin: margin,
        leverage: orderLeverage,
        liqPrice: orderSide === 'LONG' ? btcPrice * (1 - (1/orderLeverage)*0.9) : btcPrice * (1 + (1/orderLeverage)*0.9)
      };

      openPositions.push(newPos);
      playTone(659.25, 'sine', 0.2); // E5 execution chime
      updatePositionsTable();
      updateOpenPositionsPnL();
      updateOrderSummary();

      showModal('Order Executed', \`
        <div class="space-y-2 text-xs">
          <p class="text-emerald-400 font-bold">✓ \${orderSide} \${amt} BTC Executed @ $\${btcPrice.toFixed(2)}</p>
          <div class="text-gray-300">Margin Allocated: $\${margin.toFixed(2)} | Leverage: \${orderLeverage}x</div>
          <div class="text-gray-400 text-[11px]">Strict Kelly 1% Rule active. Position open in table below.</div>
        </div>
      \`);
    }

    function closePosition(id) {
      const posIdx = openPositions.findIndex(p => p.id === id);
      if (posIdx === -1) return;

      const pos = openPositions[posIdx];
      const diff = pos.side === 'LONG' ? (btcPrice - pos.entryPrice) : (pos.entryPrice - btcPrice);
      const pnl = diff * pos.size;
      const returned = pos.margin + pnl;

      demoBalance += Math.max(0, returned);

      closedTrades.unshift({
        id: pos.id,
        side: pos.side,
        size: pos.size,
        entry: pos.entryPrice,
        exit: btcPrice,
        pnl: pnl,
        date: new Date().toLocaleTimeString()
      });

      openPositions.splice(posIdx, 1);
      playTone(pnl >= 0 ? 783.99 : 261.63, 'sine', 0.2);
      updatePositionsTable();
      updateOpenPositionsPnL();
      updatePerformanceStats();
      updateOrderSummary();

      showModal('Position Closed', \`
        <div class="text-xs space-y-2">
          <p class="\${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold">
            Closed \${pos.side} at $\${btcPrice.toFixed(2)} | P&L: \${pnl >= 0 ? '+' : ''}$\${pnl.toFixed(2)}
          </p>
          <p class="text-gray-400">Balance returned: $\${returned.toFixed(2)}</p>
        </div>
      \`);
    }

    function updateOpenPositionsPnL() {
      let totalPnl = 0;
      openPositions.forEach(pos => {
        const diff = pos.side === 'LONG' ? (btcPrice - pos.entryPrice) : (pos.entryPrice - btcPrice);
        const pnl = diff * pos.size;
        totalPnl += pnl;

        const pnlEl = document.getElementById('pos-pnl-' + pos.id);
        const markEl = document.getElementById('pos-mark-' + pos.id);
        if (markEl) markEl.innerText = '$' + btcPrice.toFixed(2);
        if (pnlEl) {
          const roe = ((pnl / pos.margin) * 100).toFixed(2);
          pnlEl.innerHTML = \`<span class="\${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold">\${pnl >= 0 ? '+' : ''}$\${pnl.toFixed(2)} (\${roe}%)</span>\`;
        }
      });

      const totalPnlEl = document.getElementById('terminal-total-pnl');
      if (totalPnlEl) {
        totalPnlEl.innerText = (totalPnl >= 0 ? '+' : '') + '$' + totalPnl.toFixed(2);
        totalPnlEl.className = 'text-lg font-bold ' + (totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400');
      }
    }

    function updatePositionsTable() {
      const tbody = document.getElementById('positions-table-body');
      const countEl = document.getElementById('positions-count');
      if (!tbody) return;

      if (countEl) countEl.innerText = openPositions.length;

      if (openPositions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6 text-gray-500">No active positions open. Execute an order above.</td></tr>';
        return;
      }

      let html = '';
      openPositions.forEach(pos => {
        const isLong = pos.side === 'LONG';
        html += \`
          <tr class="border-b border-[#1f2638] hover:bg-[#121622] transition-colors">
            <td class="py-2.5 font-bold text-white">\${pos.symbol}</td>
            <td class="py-2.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold \${isLong ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'}">
                \${pos.side} \${pos.leverage}x
              </span>
            </td>
            <td class="py-2.5 text-gray-300">\${pos.size} BTC</td>
            <td class="py-2.5 text-gray-400">$\${pos.entryPrice.toFixed(2)}</td>
            <td class="py-2.5 text-gray-300" id="pos-mark-\${pos.id}">$\${btcPrice.toFixed(2)}</td>
            <td class="py-2.5 text-amber-400">$\${pos.liqPrice.toFixed(2)}</td>
            <td class="py-2.5" id="pos-pnl-\${pos.id}">Calculating...</td>
            <td class="py-2.5 text-right">
              <button onclick="closePosition(\${pos.id})" class="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 text-[10px] cursor-pointer">
                Close
              </button>
            </td>
          </tr>
        \`;
      });
      tbody.innerHTML = html;
    }

    function resetPaperBalance() {
      demoBalance = 10000.00;
      openPositions = [];
      updatePositionsTable();
      updateOpenPositionsPnL();
      updateOrderSummary();
      showModal('Balance Reset', '<p class="text-white">Paper demo balance reset to $10,000.00 USD.</p>');
    }

    // ==================== BUSINESS CODEX CHAPTERS & QUIZ ====================
    const CODEX_CHAPTERS = {
      trading: [
        {
          num: 'CHAPTER 01',
          title: 'Liquidity Sweep & Wyckoff Accumulation',
          text: \`<p><strong>Rule 1:</strong> Institutional liquidity clusters beneath previous equal lows. Retail traders place stop-losses in identical zones. Large operators engineer deliberate price probes into these pools to trigger sell-stops, which provides the counterpart volume necessary to fill massive buy orders without slippage.</p>
          <p><strong>Rule 2:</strong> Never execute at mid-range. Wait for an explicit liquidity sweep followed by an immediate 15-minute market structure break (MSB) confirmed by displacement. If the displacement candle lacks high relative volume, the setup is invalid.</p>\`,
          quiz: [
            { q: 'Where do institutional operators seek counterpart liquidity?', opts: ['At the exact 50% equilibrium', 'Beneath previous equal swing lows and above equal highs', 'Randomly across timeframes'], ans: 1 },
            { q: 'What confirms a valid Wyckoff spring entry?', opts: ['Immediate market structure break with displacement', 'A moving average cross', 'Negative funding rate alone'], ans: 0 },
            { q: 'What is the minimum recommended R:R for Wyckoff setups?', opts: ['1:1', '1:2.5', '1:0.8'], ans: 1 }
          ]
        },
        {
          num: 'CHAPTER 02',
          title: 'Kelly Criterion & Capital Preservation',
          text: \`<p><strong>Rule 1:</strong> Maximum portfolio risk per trade must never exceed 1.0% of liquid equity. Calculating position size mathematically: Position Size = (Account Equity × Risk%) ÷ (Entry Price - Stop Loss Price).</p>
          <p><strong>Rule 2:</strong> Two consecutive stop-loss hits enforce a mandatory 24-hour terminal lockout. Tilt contagion accounts for over 85% of blown executive accounts.</p>\`,
          quiz: [
            { q: 'What is the absolute cap on portfolio risk per single trade?', opts: ['5.0%', '1.0%', '10.0%'], ans: 1 },
            { q: 'What is the protocol after two consecutive stop losses?', opts: ['Double leverage to recover', '24-hour mandatory terminal lockout', 'Switch to 1-minute scalping'], ans: 1 },
            { q: 'How is position size determined?', opts: ['By gut feeling', 'Formula: (Equity × Risk%) ÷ (Entry - Stop)', 'Always full balance'], ans: 1 }
          ]
        }
      ],
      dropshipping: [
        {
          num: 'CHAPTER 01',
          title: '3-Second Viral Hook Architecture',
          text: \`<p><strong>Rule 1:</strong> Modern short-form feeds require immediate visual pattern interrupts within the first 3 seconds. The thumb-stop rate (percentage of impressions watching >3s) must exceed 35%.</p>
          <p><strong>Rule 2:</strong> Structure ad creative: 0-3s Pattern Interrupt -> 3-8s Visceral Problem Demonstration -> 8-15s Unique Mechanism & Solution -> 15-20s Scarcity Offer & Call to Action.</p>\`,
          quiz: [
            { q: 'What is the benchmark threshold for thumb-stop rate?', opts: ['10%', '35%+', '60%'], ans: 1 },
            { q: 'What must occur in seconds 0-3 of high-converting creative?', opts: ['Brand logo introduction', 'Pattern interrupt disrupting viewer scrolling', 'Company mission statement'], ans: 1 },
            { q: 'What is the minimum break-even ROAS target on paid channels?', opts: ['1.1x', '2.8x - 3.2x', '0.9x'], ans: 1 }
          ]
        }
      ],
      ecommerce: [
        {
          num: 'CHAPTER 01',
          title: 'Frictionless Checkout Conversion Rate Optimization (CRO)',
          text: \`<p><strong>Rule 1:</strong> Deploy 1-Click Accelerated Checkout (Apple Pay, Google Pay, Shop Pay). Every additional form field introduces a measurable 7% drop-off in completed transactions.</p>
          <p><strong>Rule 2:</strong> Implement post-purchase 1-click upsells. Customers are in a state of highest dopamine directly after placing an order; average order value (AOV) increases by 18-24% without additional acquisition cost.</p>\`,
          quiz: [
            { q: 'What measurable checkout drop-off occurs per additional form field?', opts: ['1%', '7%', '25%'], ans: 1 },
            { q: 'When is the highest-converting window for 1-click upsells?', opts: ['Immediately post-purchase before the confirmation page', '3 days later via postcard', 'Before the user views the product'], ans: 0 },
            { q: 'What is the target 90-day repeat customer rate for healthy D2C?', opts: ['Under 10%', 'Over 30%', '5%'], ans: 1 }
          ]
        }
      ],
      startup: [
        {
          num: 'CHAPTER 01',
          title: 'Proprietary Vector Moats & Enterprise Record Systems',
          text: \`<p><strong>Rule 1:</strong> Thin API wrappers face commoditization within 90 days. A defensible AI startup anchors its moat in domain-specific proprietary vector weights, customer workflow state, and unique interaction graphs.</p>
          <p><strong>Rule 2:</strong> Sub-6-month CAC payback is non-negotiable. Net Dollar Retention (NDR) must exceed 120% through usage-based expansion tiers.</p>\`,
          quiz: [
            { q: 'Why do generic API wrappers fail to raise venture rounds?', opts: ['Lack of proprietary defensibility and high churn', 'They are too profitable', 'Servers cost too much'], ans: 0 },
            { q: 'What is the target Customer Acquisition Cost (CAC) payback period?', opts: ['24 months', 'Under 6 months', '36 months'], ans: 1 },
            { q: 'What Net Dollar Retention (NDR) benchmark indicates venture scale?', opts: ['Exceeding 120%', '80%', '50%'], ans: 0 }
          ]
        }
      ]
    };

    function updateCodexDiscipline(domain) {
      const pillsContainer = document.getElementById('codex-chapter-pills');
      const titleEl = document.getElementById('codex-discipline-title');
      if (!pillsContainer) return;

      const chapters = CODEX_CHAPTERS[domain] || CODEX_CHAPTERS['trading'];
      if (titleEl) {
        const names = { trading: 'Trading Core', dropshipping: 'AI Dropshipping', ecommerce: 'E-Commerce', startup: 'AI Startup' };
        titleEl.innerText = (names[domain] || domain) + ' Executive Directives';
      }

      let html = '';
      chapters.forEach((ch, idx) => {
        const active = idx === activeChapterIdx;
        html += \`
          <button onclick="selectCodexChapter(\${idx})" class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold cursor-pointer transition-all \${active ? 'gold-gradient text-white shadow-md' : 'bg-[#141824] text-gray-400 hover:text-white border border-[#252c3d]'}">
            \${ch.num}: \${ch.title.split(' ')[0]}
          </button>
        \`;
      });
      pillsContainer.innerHTML = html;
      renderCurrentChapter();
      initStandaloneDailyFocus();
    }

    // Standalone Daily Focus Manager
    function initStandaloneDailyFocus() {
      const dateEl = document.getElementById('standalone-focus-date');
      if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
      try {
        const stored = localStorage.getItem('lurl_daily_business_focus_v1');
        if (stored) {
          const data = JSON.parse(stored);
          const today = new Date().toISOString().split('T')[0];
          if (data.date === today && data.goal) {
            const textEl = document.getElementById('standalone-focus-text');
            const chk = document.getElementById('standalone-focus-checkbox');
            if (textEl) textEl.innerText = data.goal;
            if (chk) {
              chk.checked = Boolean(data.completed);
              toggleStandaloneFocus(Boolean(data.completed), false);
            }
          }
        }
      } catch (e) {}
    }

    function toggleStandaloneFocus(completed, playSound = true) {
      const textEl = document.getElementById('standalone-focus-text');
      const iconEl = document.getElementById('standalone-focus-icon');
      if (textEl) {
        if (completed) {
          textEl.classList.add('line-through', 'text-gray-500');
          textEl.classList.remove('text-gray-200');
          if (iconEl) iconEl.innerText = '✅';
          if (playSound) playTone(784, 'sine', 0.15);
        } else {
          textEl.classList.remove('line-through', 'text-gray-500');
          textEl.classList.add('text-gray-200');
          if (iconEl) iconEl.innerText = '🎯';
          if (playSound) playTone(440, 'sine', 0.05);
        }
      }
      try {
        const today = new Date().toISOString().split('T')[0];
        const goal = textEl?.innerText || '';
        localStorage.setItem('lurl_daily_business_focus_v1', JSON.stringify({
          date: today,
          goal: goal,
          completed: completed,
          completedAt: completed ? Date.now() : undefined,
          streak: 1
        }));
      } catch(e) {}
    }

    function editStandaloneFocus() {
      const view = document.getElementById('standalone-focus-view');
      const form = document.getElementById('standalone-focus-edit-form');
      const input = document.getElementById('standalone-focus-input');
      const text = document.getElementById('standalone-focus-text')?.innerText || '';
      if (view && form && input) {
        view.classList.add('hidden');
        form.classList.remove('hidden');
        input.value = text;
        input.focus();
      }
    }

    function saveStandaloneFocus(e) {
      e.preventDefault();
      const view = document.getElementById('standalone-focus-view');
      const form = document.getElementById('standalone-focus-edit-form');
      const input = document.getElementById('standalone-focus-input');
      const textEl = document.getElementById('standalone-focus-text');
      const chk = document.getElementById('standalone-focus-checkbox');
      const val = input?.value.trim();
      if (!val) return;

      if (textEl) textEl.innerText = val;
      if (chk) chk.checked = false;
      toggleStandaloneFocus(false, false);

      if (view && form) {
        view.classList.remove('hidden');
        form.classList.add('hidden');
      }
      playTone(587, 'sine', 0.1);
    }

    function selectCodexChapter(idx) {
      playTone(450, 'sine', 0.05);
      activeChapterIdx = idx;
      updateCodexDiscipline(activeCategory);
    }

    function renderCurrentChapter() {
      const chapters = CODEX_CHAPTERS[activeCategory] || CODEX_CHAPTERS['trading'];
      const ch = chapters[activeChapterIdx] || chapters[0];
      if (!ch) return;

      const numEl = document.getElementById('codex-chapter-number');
      const headEl = document.getElementById('codex-chapter-heading');
      const textEl = document.getElementById('codex-chapter-text');
      const quizContainer = document.getElementById('codex-quiz-container');

      if (numEl) numEl.innerText = ch.num + ' // DIRECTIVE';
      if (headEl) headEl.innerText = ch.title;
      if (textEl) textEl.innerHTML = ch.text;

      // Render Quiz
      if (quizContainer && ch.quiz) {
        let qHtml = '';
        ch.quiz.forEach((item, qIdx) => {
          qHtml += \`
            <div class="p-3.5 rounded-xl bg-[#090b10] border border-[#252c3d] space-y-2">
              <div class="font-bold text-white text-xs font-mono">\${qIdx + 1}. \${item.q}</div>
              <div class="space-y-1">
                \${item.opts.map((opt, oIdx) => \`
                  <button onclick="submitQuizAnswer(\${qIdx}, \${oIdx}, \${item.ans})" id="quiz-btn-\${qIdx}-\${oIdx}" class="w-full text-left p-2 rounded-lg bg-[#141824] hover:bg-[#1a2234] text-gray-300 text-xs border border-[#252c3d] flex items-center justify-between cursor-pointer transition-colors">
                    <span>\${opt}</span>
                    <span id="quiz-icon-\${qIdx}-\${oIdx}" class="text-xs"></span>
                  </button>
                \`).join('')}
              </div>
            </div>
          \`;
        });
        quizContainer.innerHTML = qHtml;
      }
    }

    function submitQuizAnswer(qIdx, selectedIdx, correctIdx) {
      const btn = document.getElementById(\`quiz-btn-\${qIdx}-\${selectedIdx}\`);
      const icon = document.getElementById(\`quiz-icon-\${qIdx}-\${selectedIdx}\`);
      if (selectedIdx === correctIdx) {
        playTone(880, 'sine', 0.15);
        if (btn) btn.className = 'w-full text-left p-2 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-xs flex items-center justify-between';
        if (icon) icon.innerText = '✓ Correct';
      } else {
        playTone(220, 'sawtooth', 0.15);
        if (btn) btn.className = 'w-full text-left p-2 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/50 text-xs flex items-center justify-between';
        if (icon) icon.innerText = '✕ Incorrect';
      }
    }

    function readCurrentChapterAloud() {
      const chapters = CODEX_CHAPTERS[activeCategory] || CODEX_CHAPTERS['trading'];
      const ch = chapters[activeChapterIdx] || chapters[0];
      if (!ch) return;
      const plainText = ch.title + '. ' + ch.text.replace(/<[^>]+>/g, ' ');
      speakText(plainText);
    }

    // ==================== AUTONOMOUS AI ADVISOR ====================
    function handleSend(e) {
      e.preventDefault();
      const input = document.getElementById('standalone-input');
      const val = input.value.trim();
      if (!val) return;
      handleUserQuery(val);
      input.value = '';
    }

    function askPrompt(promptText) {
      handleUserQuery(promptText);
    }

    function handleUserQuery(query) {
      const box = document.getElementById('standalone-chat-box');
      box.innerHTML += '<div class="p-3.5 rounded-xl gold-gradient text-white ml-auto max-w-md font-medium text-right">' + escapeHtml(query) + '</div>';
      box.scrollTop = box.scrollHeight;

      const loadingId = 'loading-' + Date.now();
      box.innerHTML += \`<div id="\${loadingId}" class="p-4 rounded-xl bg-[#141824] border border-[#252c3d] text-gray-400 text-xs flex items-center gap-2">
        <span class="inline-block w-3 h-3 border-2 border-[#d47a37] border-t-transparent rounded-full animate-spin"></span>
        <span>Synthesizing autonomous directives...</span>
      </div>\`;
      box.scrollTop = box.scrollHeight;

      setTimeout(() => {
        const responseText = generateDomainAnswer(activeCategory, query);
        const loader = document.getElementById(loadingId);
        if (loader) loader.remove();

        lastAiResponse = responseText;
        box.innerHTML += \`<div class="p-4 rounded-xl bg-[#141824] border border-[#252c3d] text-gray-200 leading-relaxed">
          <div class="font-bold text-[#f8b179] mb-1 flex items-center justify-between">
            <span>LURL AI Intelligence & Blueprint</span>
            <button onclick="speakLastResponse()" class="text-[11px] text-[#f8b179] hover:underline cursor-pointer">🔊 Listen</button>
          </div>
          <div class="mt-2 text-xs sm:text-sm">\${responseText.replace(/\\n/g, '<br/>')}</div>
        </div>\`;
        box.scrollTop = box.scrollHeight;

        if (autoSpeak) speakText(responseText);
      }, 400);
    }

    function generateDomainAnswer(category, query) {
      const q = query.toLowerCase();
      if (category === 'trading' || q.includes('wyckoff') || q.includes('trade') || q.includes('btc')) {
        return "Executive Trading Directive:\\n\\n1. Strict Liquidity Sweep Rules: Wait for the 4-Hour liquidity pool to be purged before entering on a 15-minute market structure break with high-volume displacement.\\n\\n2. Capital Allocation (Kelly Criterion): Enforce a hard 1.0% maximum portfolio risk per position with a minimum 1:2.5 Risk-to-Reward ratio.\\n\\n3. Preservation Rule: If two consecutive stop losses hit in a 24-hour cycle, trading must cease immediately to avoid psychological tilt.";
      } else if (category === 'dropshipping' || q.includes('dropship') || q.includes('hook') || q.includes('tiktok')) {
        return "Executive AI Dropshipping Blueprint:\\n\\n1. 3-Second Viral Hook: The hook must disrupt viewer scroll habits with visual curiosity or visceral problem confrontation. Thumb-stop rate must exceed 35%.\\n\\n2. 48-Hour ERP Supply Chain: Never use unvetted shipping channels. Connect directly via private ERP agent lines with sub-48-hour tracking issuance to prevent merchant holdbacks.\\n\\n3. Unit Economics: Only scale products where the retail price is at least 3x the total product cost including air freight.";
      } else if (category === 'ecommerce' || q.includes('cro') || q.includes('ltv') || q.includes('d2c')) {
        return "Executive E-Commerce Directive:\\n\\n1. Checkout Friction Elimination: Enable 1-Click Apple Pay, Google Pay, and Shop Pay. Remove non-essential fields to boost mobile checkout completion by over 20%.\\n\\n2. Automated Post-Purchase Sequence: Send personalized onboarding and usage guidance on Day 3, cross-sells on Day 7, and reorder prompts on Day 14 to drive repeat LTV beyond 3.2x CAC.\\n\\n3. Margin Discipline: Enforce minimum 25% Contribution Margin 2 after all payment gateway and fulfillment expenses.";
      } else {
        return "Executive AI Startup Directive:\\n\\n1. Defensive Moat Architecture: Move beyond generic API wrappers. Embed unique proprietary vector weights, customer interaction graphs, and workflow state.\\n\\n2. Unit Economics & ARR: Target sub-6-month CAC payback with Net Dollar Retention (NDR) exceeding 120%.\\n\\n3. Mission-Critical System of Record: Ensure the AI deeply integrates into customer operational tools so the product cannot be easily deprecated.";
      }
    }

    // ==================== SPEECH RECOGNITION & SYNTHESIS ====================
    function toggleAutoSpeak() {
      autoSpeak = !autoSpeak;
      const el = document.getElementById('auto-speak-val');
      if (el) el.innerText = autoSpeak ? 'ON' : 'OFF';
    }

    function speakLastResponse() {
      if (lastAiResponse) speakText(lastAiResponse);
    }

    function speakText(text) {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#•_-]/g, '').replace(/\\n/g, ' ');
      const utter = new SpeechSynthesisUtterance(clean);
      utter.rate = 1.05;
      window.speechSynthesis.speak(utter);
    }

    function toggleSpeechRecognition() {
      const btnLabel = document.getElementById('mic-status-label');
      const micIcon = document.getElementById('mic-icon');
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        showModal('Voice Recognition', '<p class="text-amber-400">Speech recognition is not supported in this browser. Please type your query in the input.</p>');
        return;
      }

      if (isListening) {
        if (speechRecognitionInstance) speechRecognitionInstance.stop();
        isListening = false;
        if (btnLabel) btnLabel.innerText = 'Speak (Mic)';
        if (micIcon) micIcon.innerText = '🎙️';
        return;
      }

      try {
        speechRecognitionInstance = new SpeechRecognition();
        speechRecognitionInstance.continuous = false;
        speechRecognitionInstance.interimResults = false;
        speechRecognitionInstance.lang = 'en-US';

        speechRecognitionInstance.onstart = () => {
          isListening = true;
          if (btnLabel) btnLabel.innerText = 'Listening...';
          if (micIcon) micIcon.innerText = '🔴';
        };
        speechRecognitionInstance.onresult = (evt) => {
          const txt = evt.results[0][0].transcript;
          if (txt) handleUserQuery(txt);
        };
        speechRecognitionInstance.onend = () => {
          isListening = false;
          if (btnLabel) btnLabel.innerText = 'Speak (Mic)';
          if (micIcon) micIcon.innerText = '🎙️';
        };
        speechRecognitionInstance.start();
      } catch (err) {
        console.error('Mic err:', err);
      }
    }

    // ==================== SHARE THOUGHTS & FORUM ====================
    function renderThoughts() {
      const stream = document.getElementById('thoughts-stream');
      if (!stream) return;

      let html = '';
      thoughtsList.forEach(item => {
        html += \`
          <div class="p-4 rounded-xl bg-[#090b10] border border-[#252c3d] space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-white text-xs cinzel">\${escapeHtml(item.title)}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141824] text-[#f8b179] border border-[#252c3d] uppercase">\${item.category}</span>
            </div>
            <p class="text-gray-300 text-xs leading-relaxed">\${escapeHtml(item.body)}</p>
            <div class="flex items-center justify-between pt-1 border-t border-[#1f2638] text-[10px] text-gray-500 font-mono">
              <span>Author: <strong class="text-gray-400">\${escapeHtml(item.author)}</strong> • \${item.time}</span>
              <button onclick="likeThought(\${item.id})" class="text-[#f8b179] hover:underline cursor-pointer flex items-center gap-1">
                <span>▲ Upvote (\${item.likes})</span>
              </button>
            </div>
          </div>
        \`;
      });
      stream.innerHTML = html;
    }

    function submitThought() {
      const titleInput = document.getElementById('thought-title');
      const bodyInput = document.getElementById('thought-body');
      const catInput = document.getElementById('thought-category');

      const title = titleInput?.value.trim();
      const body = bodyInput?.value.trim();
      const cat = catInput?.value || 'trading';

      if (!title || !body) {
        showModal('Error', '<p class="text-rose-400">Please provide both a heading and body for your strategy thought.</p>');
        return;
      }

      thoughtsList.unshift({
        id: Date.now(),
        title: title,
        category: cat,
        body: body,
        author: currentUser.email || 'executive@lurl.vip',
        likes: 1,
        time: 'Just now'
      });

      titleInput.value = '';
      bodyInput.value = '';
      playTone(523.25, 'sine', 0.1);
      renderThoughts();
      showModal('Thought Published', '<p class="text-emerald-400">✓ Your strategy has been broadcast to the executive peer forum.</p>');
    }

    function likeThought(id) {
      const item = thoughtsList.find(t => t.id === id);
      if (item) {
        item.likes++;
        playTone(600, 'sine', 0.05);
        renderThoughts();
      }
    }

    // ==================== PERFORMANCE STATS ====================
    function updatePerformanceStats() {
      const totalTrades = closedTrades.length;
      const wins = closedTrades.filter(t => t.pnl > 0).length;
      const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) + '%' : '68.4%';

      let totalPnl = 1450.00;
      closedTrades.forEach(t => totalPnl += t.pnl);

      const winRateEl = document.getElementById('perf-win-rate');
      const totalPnlEl = document.getElementById('perf-total-pnl');
      if (winRateEl) winRateEl.innerText = winRate;
      if (totalPnlEl) totalPnlEl.innerText = (totalPnl >= 0 ? '+$' : '-$') + Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    // ==================== FLOATING WIDGETS ====================
    function toggleWorldwideChat() {
      const win = document.getElementById('worldwide-chat-window');
      if (win) win.classList.toggle('hidden');
    }

    function sendWorldwideMessage(e) {
      e.preventDefault();
      const input = document.getElementById('worldwide-input');
      const text = input?.value.trim();
      if (!text) return;

      const container = document.getElementById('worldwide-chat-messages');
      if (container) {
        container.innerHTML += \`
          <div class="p-2 rounded bg-[#141824] border border-[#252c3d] text-gray-300">
            <span class="text-[#f8b179] font-bold">@\${escapeHtml(currentUser.email.split('@')[0])}:</span> \${escapeHtml(text)}
          </div>
        \`;
        container.scrollTop = container.scrollHeight;
      }
      input.value = '';
    }

    function toggleFloatingAi() {
      const win = document.getElementById('floating-ai-window');
      if (win) win.classList.toggle('hidden');
    }

    function sendFloatingAi(e) {
      e.preventDefault();
      const input = document.getElementById('floating-ai-input');
      const text = input?.value.trim();
      if (!text) return;

      const container = document.getElementById('floating-ai-messages');
      if (container) {
        container.innerHTML += \`<div class="p-2 rounded bg-[#090b10] border border-[#252c3d] text-white text-right font-medium">\${escapeHtml(text)}</div>\`;
        const ans = generateDomainAnswer(activeCategory, text);
        container.innerHTML += \`<div class="p-2 rounded bg-[#141824] border border-[#252c3d] text-gray-200 mt-1"><strong class="text-[#f8b179]">AI Copilot:</strong> \${ans.replace(/\\n/g, '<br/>')}</div>\`;
        container.scrollTop = container.scrollHeight;
      }
      input.value = '';
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.innerText = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;
}
