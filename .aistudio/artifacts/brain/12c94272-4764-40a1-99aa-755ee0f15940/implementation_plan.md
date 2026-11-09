# Dashboard Ambient 3D Animation Upgrade (Video Replacement)

Replace the existing Medusa JF-4 procedural 3D robotic jellyfish simulator background on the LURLXI executive dashboard with a high-definition, seamlessly looping ambient MP4 video background, coupled with a dark contrast scrim to maintain readability across all trading analytics, curriculum codex, and executive modules.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1:
> - **Confirmed Integration Method**: High-definition looping video background (`https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_021419_291eb2af-5ed4-45a0-a1d6-3ef58f4bca0b.mp4`) running hardware-accelerated, muted, autoplaying, and looping seamlessly behind the dashboard.
> - **Confirmed Visual Overlay**: Dark ambient scrim tint (`bg-[#080a0f]/65` with a subtle vignette gradient) ensuring WCAG AA contrast for text, charts, trade history, and codex cards while preserving the visual depth of the 3D animation.
> - **Decommissioned Component**: The previous `MedusaJellyfishBackground` component and its heavy procedural Three.js 224-link chain animation loop are removed from the dashboard render path to free GPU memory and eliminate frame stutter.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces the procedural jellyfish Three.js model with a dedicated `DashboardVideoBackground` component that renders the user's provided 3D animation video in full-bleed viewport coverage behind the active dashboard workspace (`stage === 'application'`).
- **Target Audience / Persona**: Executives, quantitative traders, and entrepreneurs utilizing the LURL platform who require a modern visual experience without sacrificing data readability or GPU responsiveness.
- **Key Value**: Delivers the visual depth of the user's 3D animation asset while reducing client-side runtime CPU/GPU load compared to procedural Three.js mesh rebuilding, ensuring 60fps performance across devices.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **First-Step Entry Preserved**: Users land on Step 1 ("Facet" WebGL smoked-glass hero entry screen). The dashboard background does not mount until the user completes the entry and verification stages.
2. **Step 2 Verification & Onboarding**: The user authenticates via Gmail / executive profile setup.
3. **Dashboard Reveal**: Upon entering `stage === 'application'`, the dashboard mounts with the new ambient 3D video animation looping in the background. Content cards, order books, Bitcoin charts, and codex text float above it with subtle backdrop blur and dark contrast protection.

### Visual Identity & Theme
- **Background Aesthetic**: Cinematic dark-slate tech atmosphere (`#080a0f`) with fluid motion from the provided 3D video.
- **Color Palette & Scrim Math**:
  - Base Video: Object-fit `cover`, 100vw × 100vh, fixed positioning at `z-0`.
  - Primary Scrim: `rgba(8, 10, 15, 0.65)` overlay (`backdrop-blur-[2px]`) to suppress excessive video brightness spikes.
  - Vignette Gradient: Radial gradient from transparent center to `rgba(6, 8, 14, 0.85)` at viewport edges, drawing focus toward the center content container.
- **Typography & Hierarchy**:
  - Display Font: `Cinzel` for brand headlines and track titles.
  - Numerical Telemetry: `Plus Jakarta Sans` with `tabular-nums` and `JetBrains Mono` for Bitcoin trade timestamps, prices, and mastery counters.
- **Motion & Video Attributes**:
  - `autoPlay`, `loop`, `muted`, `playsInline` attributes applied.
  - `disablePictureInPicture` and `controlsList="nodownload nofullscreen noremoteplayback"` to keep the video strictly ambient.
  - Gentle fade-in opacity transition once the video metadata has loaded (`loadeddata` event) to avoid abrupt black-frame flashes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native HTML5 Video Element vs. Three.js VideoTexture Canvas**
  - *Chosen Approach*: Clean native `<video>` element with hardware acceleration and CSS backdrop filters.
  - *Why*: Native HTML5 `<video>` decodes directly via browser hardware decoders (GPU VRAM) with minimal main-thread JavaScript execution, unlike Three.js `VideoTexture` which uploads every frame into a WebGL texture 60 times per second, causing unnecessary thermal throttling.
  - *Alternatives Considered*: Rendering via Three.js canvas was rejected because it consumes excessive memory and duplicates rendering work already handled by the browser engine.

- **Decision 2: Safe Fallback for Video Loading / Network Interruption**
  - *Chosen Approach*: Implement a graceful dark ambient gradient placeholder while the remote cloudfront video streams, preventing white flashes or broken visual states.
  - *Why*: Ensures zero-glitch visual transitions on slower connections.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           App.tsx                               │
│  (State: stage === 'application', activeTab, selectedCategory)   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
  ┌───────────────────────────────┐  ┌───────────────────────────────┐
  │  DashboardVideoBackground.tsx │  │    Dashboard Content Layers   │
  │  - Fixed inset-0 (z-0)        │  │    (Relative z-10)            │
  │  - HTML5 <video> (MP4 stream) │  │  - Header & Breadcrumbs       │
  │  - Dark Scrim (z-1)           │  │  - BusinessBookCodex          │
  │  - Radial Vignette (z-1)      │  │  - BtcDemoTradingView         │
  └───────────────────────────────┘  │  - Performance Dashboard      │
                                     └───────────────────────────────┘
```

### Component Implementation Scope

1. **`src/components/DashboardVideoBackground.tsx`**:
   - Create a dedicated component encapsulating the ambient video, error handling, load state, and dark ambient scrim overlay.
   - Props: `videoUrl` (defaulting to `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_021419_291eb2af-5ed4-45a0-a1d6-3ef58f4bca0b.mp4`).
2. **`src/App.tsx`**:
   - Remove `import { MedusaJellyfishBackground }` and replace with `import { DashboardVideoBackground }`.
   - Update line 692 to mount `<DashboardVideoBackground />` when `stage === 'application'`.
3. **Clean Up `MedusaJellyfishBackground.tsx`**:
   - Retire the old 950-line Medusa jellyfish Three.js component.
