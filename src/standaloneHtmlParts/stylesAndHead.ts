/**
 * Styles, Head tags, and fonts for Standalone LURL HTML
 */
export function getStylesAndHead(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LURL — The Executive Business Codex & Trading Terminal</title>
  <meta name="description" content="Autonomous executive business platform for Trading, AI Dropshipping, E-commerce, and AI Startups with built-in AI advisor and Bitcoin demo trading.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: #080a0f;
      color: #e5e7eb;
      margin: 0;
      padding: 0;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .cinzel { font-family: 'Cinzel', serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
    .gold-gradient { background: linear-gradient(135deg, #f8b179 0%, #d47a37 50%, #b85d19 100%); }
    .gold-text { background: linear-gradient(135deg, #f8b179, #d47a37); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .gold-border { border-color: rgba(212, 122, 55, 0.4); }
    .logo-3d-wrap {
      perspective: 800px;
      transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);
    }
    .logo-3d-wrap:hover { transform: rotateY(15deg) rotateX(5deg) scale(1.03); }
    #standalone-slidebar {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    #standalone-slidebar.closed { transform: translateX(-100%); }
    #standalone-slidebar.open { transform: translateX(0); }
    @keyframes vipEntranceGlow {
      0% {
        opacity: 0;
        transform: scale(0.93) translateY(20px);
        box-shadow: 0 0 0px rgba(248, 177, 121, 0);
        border-color: rgba(248, 177, 121, 0.2);
      }
      50% {
        opacity: 1;
        box-shadow: 0 0 45px rgba(248, 177, 121, 0.6), 0 25px 80px rgba(212, 122, 55, 0.4);
        border-color: rgba(255, 215, 0, 0.95);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
        box-shadow: 0 0 25px rgba(248, 177, 121, 0.35), 0 20px 60px rgba(212, 122, 55, 0.25);
        border-color: rgba(248, 177, 121, 0.65);
      }
    }
    .vip-entrance-glow {
      animation: vipEntranceGlow 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes vipCrownPulseGlow {
      0%, 100% {
        box-shadow: 0 0 35px rgba(248, 177, 121, 0.45), 0 20px 70px rgba(212, 122, 55, 0.35);
        border-color: rgba(248, 177, 121, 0.7);
      }
      50% {
        box-shadow: 0 0 75px rgba(255, 215, 0, 0.9), 0 25px 105px rgba(212, 122, 55, 0.65);
        border-color: rgba(255, 215, 0, 1);
      }
    }
    .vip-pulse-glow {
      animation: vipCrownPulseGlow 1.25s ease-in-out infinite !important;
    }
    @keyframes modalScaleInFade {
      0% {
        opacity: 0;
        transform: scale(0.94) translateY(14px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .modal-scale-in {
      animation: modalScaleInFade 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0a0d14; }
    ::-webkit-scrollbar-thumb { background: #252c3d; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #d47a37; }
  </style>
</head>
<body class="min-h-screen bg-[#080a0f] text-[#e5e7eb] flex flex-col justify-between selection:bg-[#d47a37]/30 selection:text-[#f8b179]">
  <!-- Background Glow & Subtle Grid -->
  <div class="fixed inset-0 pointer-events-none z-0">
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[450px] bg-gradient-to-b from-[#d47a37]/12 via-transparent to-transparent blur-3xl"></div>
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#1f26380a_1px,transparent_1px),linear-gradient(to_bottom,#1f26380a_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
  </div>`;
}
