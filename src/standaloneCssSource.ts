/**
 * @license
 * Standalone, 100% self-contained, error-free CSS stylesheet for the LURL platform.
 * Contains all base resets, typography, gold & cyber color palettes, trading terminal styles,
 * animations, responsive layouts, and UI components.
 * Operates independently with zero errors and stands with the website itself.
 */

export function getStandaloneCssContent(): string {
  return `/* ==========================================================================
   LURL EXECUTIVE CODEX & TRADING TERMINAL — STANDALONE STYLESHEET
   Version: 3.8.0 Production Standalone
   No external dependencies required. Standalone error-free stylesheet.
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

/* --- 1. Global Reset & Box Sizing --- */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
  color-scheme: dark;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #080a0f;
  color: #e5e7eb;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  selection-background-color: rgba(212, 122, 55, 0.35);
  selection-color: #f8b179;
}

/* --- 2. Typography Styles --- */
.font-cinzel, h1.cinzel, .cinzel {
  font-family: 'Cinzel', Georgia, serif;
}

.font-mono, code, pre, .mono {
  font-family: 'JetBrains Mono', Consolas, Monaco, 'Courier New', monospace;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.25;
}

p {
  line-height: 1.6;
  color: #9ca3af;
}

/* --- 3. Luxury Gold & Metallic Color System --- */
.gold-gradient {
  background: linear-gradient(135deg, #f8b179 0%, #d47a37 50%, #b85d19 100%);
}

.gold-text {
  background: linear-gradient(135deg, #fce0cd 0%, #f8b179 40%, #d47a37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.gold-border {
  border-color: rgba(212, 122, 55, 0.4);
}

.gold-glow {
  box-shadow: 0 0 25px rgba(212, 122, 55, 0.25);
}

/* --- 4. Trading Terminal Color Highlights --- */
.text-profit, .text-emerald {
  color: #34d399 !important;
}

.bg-profit, .bg-emerald-badge {
  background-color: rgba(6, 78, 59, 0.8) !important;
  color: #a7f3d0 !important;
  border: 1px solid rgba(16, 185, 129, 0.4) !important;
}

.text-loss, .text-red {
  color: #f87171 !important;
}

.bg-loss, .bg-red-badge {
  background-color: rgba(127, 29, 29, 0.8) !important;
  color: #fecaca !important;
  border: 1px solid rgba(239, 68, 68, 0.4) !important;
}

/* --- 5. Terminal Cards, Borders & Structural Layout --- */
.lurl-card {
  background: linear-gradient(180deg, #111522 0%, #0c0f18 100%);
  border: 1px solid #1f273b;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6);
  position: relative;
  overflow: hidden;
}

.lurl-card:hover {
  border-color: #2e3b57;
}

.lurl-header {
  background-color: rgba(10, 13, 20, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid #1c2335;
  position: sticky;
  top: 0;
  z-index: 50;
}

/* --- 6. Custom Interactive Buttons --- */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.825rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #d47a37 0%, #b85d19 100%);
  border: 1px solid rgba(248, 177, 121, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(212, 122, 55, 0.25);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #e08a46 0%, #cb6b23 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(212, 122, 55, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.3rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.825rem;
  font-weight: 600;
  color: #cbd5e1;
  background-color: #141926;
  border: 1px solid #232d42;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
}

.btn-secondary:hover {
  background-color: #1d2538;
  color: #ffffff;
  border-color: #384768;
}

/* --- 7. Data Tables & Ledgers --- */
table.lurl-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.775rem;
  text-align: left;
}

table.lurl-table th {
  padding: 0.75rem 1rem;
  background-color: #131826;
  color: #9ca3af;
  text-transform: uppercase;
  font-size: 0.675rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #1f273b;
}

table.lurl-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #151a29;
  color: #e5e7eb;
}

table.lurl-table tr:hover td {
  background-color: rgba(22, 28, 44, 0.6);
}

/* --- 8. 3D Logo Transform Effects --- */
.logo-3d-wrap {
  perspective: 900px;
  transform-style: preserve-3d;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.logo-3d-wrap:hover {
  transform: rotateY(12deg) rotateX(6deg) scale(1.04);
}

/* --- 9. Smooth Scrollbars --- */
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}

::-webkit-scrollbar-track {
  background: #080a0f;
}

::-webkit-scrollbar-thumb {
  background: #1f273b;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb:hover {
  background: #d47a37;
}

/* --- 10. Keyframe Animations --- */
@keyframes lurlPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.96); }
}

@keyframes lurlShimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.animate-pulse-slow {
  animation: lurlPulse 3s infinite ease-in-out;
}

.animate-shimmer {
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%);
  background-size: 200% 100%;
  animation: lurlShimmer 2.5s infinite;
}

/* --- 11. Responsive Breakpoints --- */
@media (max-width: 768px) {
  .lurl-card {
    padding: 1rem;
  }
  
  table.lurl-table th, table.lurl-table td {
    padding: 0.5rem 0.65rem;
    font-size: 0.725rem;
  }
}
`;
}
