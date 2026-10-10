/**
 * Floating Chat Widgets, Footer, and Settings/Profile/VIP Modals
 */
export function getFloatingWidgetsAndModals(): string {
  return `  <!-- ==================== FLOATING WIDGETS ==================== -->
  <!-- Floating Worldwide Chat (Bottom-Left) -->
  <div class="fixed bottom-4 left-4 z-40">
    <div id="worldwide-chat-window" class="hidden mb-2 w-80 sm:w-96 rounded-2xl bg-[#0c1018] border border-[#252c3d] shadow-2xl p-4 text-xs font-mono flex flex-col h-96">
      <div class="flex items-center justify-between pb-2 border-b border-[#252c3d] mb-2">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span class="font-bold text-white cinzel">Worldwide Executive Room</span>
        </div>
        <button onclick="toggleWorldwideChat()" class="text-gray-400 hover:text-white">✕</button>
      </div>
      <div id="worldwide-chat-messages" class="flex-1 overflow-y-auto space-y-2 p-1 text-[11px]">
        <div class="p-2 rounded bg-[#141824] border border-[#252c3d] text-gray-300">
          <span class="text-[#f8b179] font-bold">@Sovereign79:</span> BTC 4H sweep confirmed. Wyckoff spring active.
        </div>
        <div class="p-2 rounded bg-[#141824] border border-[#252c3d] text-gray-300">
          <span class="text-emerald-400 font-bold">@Marcus_D2C:</span> Scaled TikTok ads with sub-48h tracking. ROAS 3.4x.
        </div>
      </div>
      <form onsubmit="sendWorldwideMessage(event)" class="mt-2 flex gap-1">
        <input id="worldwide-input" type="text" placeholder="Share live intel..." class="flex-1 px-2.5 py-1.5 rounded-lg bg-[#080a0f] border border-[#252c3d] text-white text-[11px] outline-none focus:border-[#d47a37]">
        <button type="submit" class="px-3 py-1.5 rounded-lg gold-gradient text-white text-[11px] font-bold">Send</button>
      </form>
    </div>
    <button onclick="toggleWorldwideChat()" class="p-3 rounded-full bg-[#121622] hover:bg-[#1a2234] text-white border border-[#252c3d] hover:border-emerald-500/50 shadow-xl cursor-pointer flex items-center gap-2 group transition-all">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
      <span class="text-xs font-bold text-gray-200 hidden sm:inline">Worldwide Chat</span>
      <span class="text-xs">💬</span>
    </button>
  </div>

  <!-- Floating Meta AI Advisor (Bottom-Right) -->
  <div class="fixed bottom-4 right-4 z-40">
    <div id="floating-ai-window" class="hidden mb-2 w-80 sm:w-96 rounded-2xl bg-[#0c1018] border border-[#d47a37]/50 shadow-2xl p-4 text-xs font-mono flex flex-col h-96">
      <div class="flex items-center justify-between pb-2 border-b border-[#252c3d] mb-2">
        <div class="flex items-center gap-2">
          <span class="text-base">🤖</span>
          <span class="font-bold text-white cinzel">Meta AI Copilot</span>
        </div>
        <button onclick="toggleFloatingAi()" class="text-gray-400 hover:text-white">✕</button>
      </div>
      <div id="floating-ai-messages" class="flex-1 overflow-y-auto space-y-2 p-1 text-[11px]">
        <div class="p-2 rounded bg-[#141824] border border-[#252c3d] text-gray-300">
          <strong class="text-[#f8b179]">AI Copilot:</strong> Ask any instantaneous question regarding technical setups or business moats.
        </div>
      </div>
      <form onsubmit="sendFloatingAi(event)" class="mt-2 flex gap-1">
        <input id="floating-ai-input" type="text" placeholder="Ask Copilot..." class="flex-1 px-2.5 py-1.5 rounded-lg bg-[#080a0f] border border-[#252c3d] text-white text-[11px] outline-none focus:border-[#d47a37]">
        <button type="submit" class="px-3 py-1.5 rounded-lg gold-gradient text-white text-[11px] font-bold">↵</button>
      </form>
    </div>
    <button onclick="toggleFloatingAi()" class="p-3 rounded-full gold-gradient text-white shadow-xl cursor-pointer flex items-center gap-2 group hover:scale-105 transition-all">
      <span class="text-base">🤖</span>
      <span class="text-xs font-bold text-white hidden sm:inline">AI Copilot</span>
    </button>
  </div>

  <!-- Footer -->
  <footer class="border-t border-[#1f2638] bg-[#07090e] py-6 px-4 text-center text-xs text-gray-500 mt-12">
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>LURL Executive Intelligence • Standalone In-Browser Autonomous Edition</span>
      </div>
      <div>
        <span>Authenticated Executive: </span>
        <span id="footer-user-email" class="text-[#f8b179] font-mono">executive@lurl.vip</span>
      </div>
    </div>
  </footer>

  <!-- ==================== SPECIALIZED MODALS ==================== -->
  <!-- VIP Passcode Modal -->
  <div id="vip-modal-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div id="vip-modal-box" class="bg-[#0e1118] border border-[#f8b179]/60 rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative vip-entrance-glow transition-all">
      <!-- Subtle Gold Shimmer Top Accent -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ffd700] to-transparent pointer-events-none"></div>
      <div class="flex items-center justify-between pb-3 border-b border-[#252c3d] mb-4">
        <div class="flex items-center gap-2">
          <button onclick="closeVipModal()" class="text-xs text-[#cbd5e1] hover:text-white px-2 py-1 rounded bg-[#141824] border border-[#252c3d] cursor-pointer">
            ← Back
          </button>
          <h3 class="cinzel text-lg font-bold text-[#f8b179] flex items-center gap-2">
            <span id="standalone-vip-crown" class="cursor-pointer inline-block transition-transform hover:scale-125 select-none" onmouseenter="document.getElementById('vip-modal-box')?.classList.add('vip-pulse-glow')" onmouseleave="document.getElementById('vip-modal-box')?.classList.remove('vip-pulse-glow')" title="VIP Crown • Hover to trigger gold pulse glow">👑</span>
            <span>Proprietor VIP Portal</span>
          </h3>
        </div>
        <button onclick="closeVipModal()" class="text-gray-400 hover:text-white text-base cursor-pointer">✕</button>
      </div>
      <div class="space-y-3 text-xs">
        <div class="p-3 rounded-xl bg-gradient-to-r from-[#d47a37]/20 to-[#b85d19]/10 border border-[#f8b179]/40 text-gray-200">
          <div class="font-bold text-[#f8b179] mb-1">Executive Proprietor Sanctuary</div>
          Clearance Status: <span class="font-mono text-emerald-400 font-bold">Authorized VIP Executive Access</span>
        </div>
        <p class="text-gray-400">Enter master proprietor VIP password (1029384756) to unlock inner qualities:</p>
        <input id="vip-secret-code" type="password" placeholder="Enter VIP Password (1029384756)" class="w-full px-3 py-2.5 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]">
        <div class="flex gap-2 pt-1">
          <button onclick="verifyVipSecret()" class="flex-1 py-2.5 rounded-xl gold-gradient text-white font-bold shadow-md cursor-pointer">
            Unlock Clearance
          </button>
          <button onclick="unlockVipDirect()" class="flex-1 py-2.5 rounded-xl bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#f8b179]/40 font-bold cursor-pointer">
            1-Click Direct
          </button>
        </div>
        <button onclick="closeVipModal()" class="w-full py-2 rounded-xl bg-[#121622] hover:bg-[#1a2130] text-gray-300 hover:text-white text-xs text-center border border-[#252c3d] mt-2 cursor-pointer">
          ← Back to Platform
        </button>
      </div>
    </div>
  </div>

  <!-- Settings Modal -->
  <div id="settings-modal-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0e1118] border border-[#252c3d] rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative modal-scale-in">
      <div class="flex items-center justify-between pb-3 border-b border-[#252c3d] mb-4">
        <div class="flex items-center gap-2">
          <button onclick="closeSettingsModal()" class="text-xs text-[#cbd5e1] hover:text-white px-2 py-1 rounded bg-[#141824] border border-[#252c3d] cursor-pointer">
            ← Back
          </button>
          <h3 class="cinzel text-lg font-bold text-white flex items-center gap-2">
            <span>⚙️</span><span>Platform Settings</span>
          </h3>
        </div>
        <button onclick="closeSettingsModal()" class="text-gray-400 hover:text-white text-base cursor-pointer">✕</button>
      </div>
      <div class="space-y-4 text-xs">
        <div class="p-3 rounded-xl bg-[#090b10] border border-[#252c3d] flex items-center justify-between">
          <div>
            <div class="font-bold text-white">Synthesizer Background Music (BGM)</div>
            <div class="text-[10px] text-gray-400">Ambient soundscapes generated via Web Audio API</div>
          </div>
          <button onclick="toggleBgm()" id="modal-bgm-btn" class="px-3 py-1.5 rounded-lg bg-[#141824] text-[#f8b179] border border-[#d47a37]/40 font-bold cursor-pointer">
            OFF
          </button>
        </div>
        <div class="p-3 rounded-xl bg-[#090b10] border border-[#252c3d] flex items-center justify-between">
          <div>
            <div class="font-bold text-white">Audio Sound Effects</div>
            <div class="text-[10px] text-gray-400">Execution clicks and achievement chimes</div>
          </div>
          <span class="text-emerald-400 font-bold">ACTIVE</span>
        </div>
        <div class="p-3 rounded-xl bg-[#090b10] border border-[#252c3d] flex items-center justify-between">
          <div>
            <div class="font-bold text-white">Reset Local Simulation Data</div>
            <div class="text-[10px] text-gray-400">Restore paper balance to $10,000 and clear history</div>
          </div>
          <button onclick="resetAllData()" class="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/40 cursor-pointer">
            Reset Data
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- User Profile Modal -->
  <div id="profile-modal-overlay" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-[#0e1118] border border-[#252c3d] rounded-2xl max-w-md w-full p-6 text-left shadow-2xl relative modal-scale-in">
      <div class="flex items-center justify-between pb-3 border-b border-[#252c3d] mb-4">
        <div class="flex items-center gap-2">
          <button onclick="closeProfileModal()" class="text-xs text-[#cbd5e1] hover:text-white px-2 py-1 rounded bg-[#141824] border border-[#252c3d] cursor-pointer">
            ← Back
          </button>
          <h3 class="cinzel text-lg font-bold text-white flex items-center gap-2">
            <span>👤</span><span>Executive Profile & Identity</span>
          </h3>
        </div>
        <button onclick="closeProfileModal()" class="text-gray-400 hover:text-white text-base cursor-pointer">✕</button>
      </div>
      <div class="space-y-3 text-xs">
        <div class="p-4 rounded-xl bg-[#090b10] border border-[#252c3d] space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Account:</span>
            <span id="profile-modal-email" class="font-bold font-mono text-[#f8b179]">executive@lurl.vip</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Tenure:</span>
            <span class="font-mono text-emerald-400 font-bold">5 Months (Verified)</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-400">Clearance Tier:</span>
            <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold font-mono text-[10px] border border-emerald-500/30">👑 VIP Sovereign</span>
          </div>
        </div>
        <div>
          <label class="text-[11px] text-gray-400">Switch / Update Email Identity:</label>
          <div class="flex gap-2 mt-1">
            <input id="profile-email-input" type="email" value="executive@lurl.vip" class="flex-1 px-3 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]">
            <button onclick="saveProfileEmail()" class="px-4 py-2 rounded-xl gold-gradient text-white font-bold cursor-pointer">
              Save
            </button>
          </div>
        </div>
        <button onclick="closeProfileModal()" class="w-full py-2 rounded-xl bg-[#121622] hover:bg-[#1a2130] text-gray-300 hover:text-white text-xs text-center border border-[#252c3d] mt-2 cursor-pointer">
          ← Back to Platform
        </button>
      </div>
    </div>
  </div>`;
}
