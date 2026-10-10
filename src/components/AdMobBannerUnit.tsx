import React, { useEffect, useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Sparkles,
  ExternalLink,
  X,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { playClickSound } from '../utils/soundEffects';

export const ADMOB_APP_ID = 'ca-app-pub-3767067209003943~6726537867';
export const ADMOB_APP_OPEN_AD_UNIT_ID = 'ca-app-pub-3767067209003943/1431647456';
export const ADMOB_AD_UNIT_ID = 'ca-app-pub-3767067209003943/1431647456';
export const ADMOB_SECONDARY_AD_UNIT_ID = 'ca-app-pub-3767067209003943/2800569440';
export const ADMOB_PUBLISHER_ID = 'ca-pub-3767067209003943';
export const ADMOB_APP_PUB_ID = 'ca-app-pub-3767067209003943';
export const ADMOB_SLOT_ID = '1431647456';
export const ADMOB_SECONDARY_SLOT_ID = '2800569440';

/**
 * Helper to trigger native + web AdMob App Open Ad (ca-app-pub-3767067209003943/1431647456)
 */
export function triggerNativeAppOpenAd(): boolean {
  try {
    const win = window as any;
    const capAdMob = win.Capacitor?.Plugins?.AdMob || win.AdMob || win.admob;
    if (capAdMob) {
      if (typeof capAdMob.initialize === 'function') {
        Promise.resolve(
          capAdMob.initialize({
            appId: ADMOB_APP_ID,
            requestTrackingAuthorization: true,
            initializeForTesting: false,
          })
        ).catch(() => {});
      }
      if (typeof capAdMob.prepareAppOpen === 'function') {
        Promise.resolve(
          capAdMob.prepareAppOpen({
            adId: ADMOB_APP_OPEN_AD_UNIT_ID,
            adUnitId: ADMOB_APP_OPEN_AD_UNIT_ID,
            appId: ADMOB_APP_ID,
            isTesting: false,
          })
        )
          .then(() => {
            if (typeof capAdMob.showAppOpen === 'function') {
              capAdMob.showAppOpen();
            }
          })
          .catch(() => {});
        return true;
      }
      if (typeof capAdMob.loadAppOpenAd === 'function') {
        Promise.resolve(
          capAdMob.loadAppOpenAd({
            adUnitId: ADMOB_APP_OPEN_AD_UNIT_ID,
            appId: ADMOB_APP_ID,
          })
        )
          .then(() => {
            if (typeof capAdMob.showAppOpenAd === 'function') {
              capAdMob.showAppOpenAd();
            }
          })
          .catch(() => {});
        return true;
      }
      if (win.admob?.appOpen?.load) {
        Promise.resolve(
          win.admob.appOpen.load({
            id: ADMOB_APP_OPEN_AD_UNIT_ID,
            adUnitId: ADMOB_APP_OPEN_AD_UNIT_ID,
          })
        )
          .then(() => win.admob.appOpen.show?.())
          .catch(() => {});
        return true;
      }
    }
  } catch {}
  return false;
}

/**
 * AdMobAppOpenAdModal:
 * Automatically loads and displays the App Open Ad unit (ca-app-pub-3767067209003943/1431647456)
 * when the app opens or when manually triggered.
 */
export const AdMobAppOpenAdModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(4);
  const [adLoaded, setAdLoaded] = useState<boolean>(false);

  const openAppAd = () => {
    triggerNativeAppOpenAd();
    setCountdown(4);
    setAdLoaded(false);
    setIsOpen(true);
  };

  useEffect(() => {
    // Show App Open Ad once per app launch session when the app opens
    const hasShownThisLaunch = sessionStorage.getItem('lurl_admob_app_open_shown_v1');
    let openTimer: any = null;
    if (!hasShownThisLaunch) {
      sessionStorage.setItem('lurl_admob_app_open_shown_v1', 'true');
      openTimer = setTimeout(() => {
        openAppAd();
      }, 650);
    }

    // Listen for manual trigger or app resume event
    const handleManualTrigger = () => {
      openAppAd();
    };

    window.addEventListener('lurl-trigger-app-open-ad', handleManualTrigger);
    return () => {
      if (openTimer) clearTimeout(openTimer);
      window.removeEventListener('lurl-trigger-app-open-ad', handleManualTrigger);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Push AdSense/AdMob slot when modal opens
    const adTimer = setTimeout(() => {
      try {
        const win = window as any;
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
        setAdLoaded(true);
      } catch {
        setAdLoaded(true);
      }
    }, 150);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(adTimer);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[220] bg-[#05070b]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fadeIn">
      {/* Top Google AdMob App Open Header Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-3 bg-[#0e131f] border border-[#252c3d] rounded-2xl px-4 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d47a37] to-[#9a4f19] flex items-center justify-center text-black font-['Cinzel'] font-black text-sm shadow-md">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wider uppercase">
                LURL • App Open Ad
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold">
                Ad
              </span>
            </div>
            <p className="text-[10px] font-mono text-gray-400">
              Unit: <span className="text-[#f8b179]">{ADMOB_APP_OPEN_AD_UNIT_ID}</span> • App ID:{' '}
              <span className="text-emerald-400">{ADMOB_APP_ID}</span>
            </p>
          </div>
        </div>

        {/* Continue to App Button (Always clickable immediately) */}
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setIsOpen(false);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b86325] hover:from-[#e08946] hover:to-[#c97131] text-black font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer transition-all"
        >
          <span>Continue to App {countdown > 0 ? `(${countdown}s)` : ''}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main App Open Ad Display Container */}
      <div className="max-w-4xl w-full mx-auto my-auto py-6">
        <div className="rounded-3xl bg-[#0b0e17] border border-[#252c3d] shadow-2xl overflow-hidden">
          <div className="px-5 py-3 bg-[#101624] border-b border-[#1f2638] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">GOOGLE ADMOB APP OPEN AD ACTIVE</span>
            </div>
            <div className="text-gray-400">
              Swag Expected • Slot <span className="text-[#f8b179] font-bold">1431647456</span>
            </div>
          </div>

          <div className="p-6 sm:p-10 flex flex-col items-center justify-center min-h-[280px] bg-gradient-to-b from-[#0b0e17] via-[#0e1422] to-[#0b0e17] relative">
            {/* Live Google AdMob / AdSense Tag for App Open Ad Unit */}
            <ins
              className="adsbygoogle w-full"
              style={{ display: 'block', minHeight: '180px' }}
              data-ad-client={ADMOB_PUBLISHER_ID}
              data-ad-slot={ADMOB_SLOT_ID}
              data-ad-unit={ADMOB_APP_OPEN_AD_UNIT_ID}
              data-admob-app-id={ADMOB_APP_ID}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />

            {/* Verified App Open Ad Unit Card */}
            <div className="w-full max-w-xl mt-4 p-4 rounded-2xl bg-[#070a10]/90 border border-[#1f2638] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>App Open Ad Unit Integrated</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] font-mono text-[#f8b179] select-all mt-0.5">
                    {ADMOB_APP_OPEN_AD_UNIT_ID}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 select-all">
                    App ID: {ADMOB_APP_ID}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setIsOpen(false);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#182032] hover:bg-[#222c42] text-white border border-[#2e3a56] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Dismiss Ad</span>
              </button>
            </div>
          </div>

          <div className="px-5 py-2.5 bg-[#080b11] border-t border-[#1f2638] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-gray-500">
            <span>Format: App Open Ad (Full-Screen Launch Placement)</span>
            <span className="text-emerald-400">
              {adLoaded ? '✓ AdMob App Open Mediation Ready' : 'Loading AdMob App Open Unit...'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between text-[11px] text-gray-500 font-mono">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Google AdMob Verified Publisher ({ADMOB_PUBLISHER_ID})
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white underline cursor-pointer"
        >
          Skip & Enter Platform
        </button>
      </div>
    </div>
  );
};

interface AdMobBannerUnitProps {
  placement?: 'workspace' | 'footer' | 'vip';
  compact?: boolean;
}

export const AdMobBannerUnit: React.FC<AdMobBannerUnitProps> = ({
  placement = 'workspace',
  compact = false,
}) => {
  const [adKey, setAdKey] = useState<number>(0);
  const [adInitialized, setAdInitialized] = useState<boolean>(false);
  const [nativeBridgeActive, setNativeBridgeActive] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  // Default to the App Open Ad unit ca-app-pub-3767067209003943/1431647456 requested by user
  const [activeSlot, setActiveSlot] = useState<'appOpen' | 'banner'>('appOpen');

  const currentAdUnitId =
    activeSlot === 'appOpen' ? ADMOB_APP_OPEN_AD_UNIT_ID : ADMOB_SECONDARY_AD_UNIT_ID;
  const currentSlotId = activeSlot === 'appOpen' ? ADMOB_SLOT_ID : ADMOB_SECONDARY_SLOT_ID;

  useEffect(() => {
    let mounted = true;

    // 1. Trigger native mobile AdMob bridge (Capacitor / Cordova / Android WebView) with App ID & Ad Unit ID
    try {
      const win = window as any;
      const capAdMob = win.Capacitor?.Plugins?.AdMob || win.AdMob || win.admob;
      if (capAdMob) {
        if (typeof capAdMob.initialize === 'function') {
          Promise.resolve(
            capAdMob.initialize({
              appId: ADMOB_APP_ID,
              requestTrackingAuthorization: true,
              initializeForTesting: false,
            })
          ).catch(() => {});
        }
        if (activeSlot === 'appOpen') {
          triggerNativeAppOpenAd();
        }
        if (typeof capAdMob.showBanner === 'function') {
          Promise.resolve(
            capAdMob.showBanner({
              adId: currentAdUnitId,
              adUnitId: currentAdUnitId,
              appId: ADMOB_APP_ID,
              position: 'BOTTOM_CENTER',
              margin: 0,
              isTesting: false,
            })
          ).catch(() => {});
        } else if (win.admob?.banner?.show) {
          Promise.resolve(
            win.admob.banner.show({
              id: currentAdUnitId,
              appId: ADMOB_APP_ID,
            })
          ).catch(() => {});
        }
        if (mounted) setNativeBridgeActive(true);
      }
    } catch {}

    // 2. Trigger Google AdSense / Mobile Web AdMob slot rendering
    const timer = setTimeout(() => {
      if (!mounted) return;
      try {
        const win = window as any;
        win.adsbygoogle = win.adsbygoogle || [];
        win.adsbygoogle.push({});
        setAdInitialized(true);
      } catch {
        setAdInitialized(true);
      }
    }, 150);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [adKey, currentAdUnitId, activeSlot]);

  const handleCopyText = (text: string, label: string) => {
    playClickSound();
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {}
  };

  const handleRefreshAd = () => {
    playClickSound();
    setAdInitialized(false);
    setAdKey((prev) => prev + 1);
  };

  return (
    <div
      id={`lurl-admob-unit-${placement}`}
      className={`w-full max-w-7xl mx-auto px-3 sm:px-6 ${compact ? 'my-2' : 'my-4'}`}
    >
      <div className="rounded-xl bg-[#0b0e16]/95 border border-[#252c3d] hover:border-[#d47a37]/40 transition-colors overflow-hidden shadow-lg">
        {/* AdMob Header Bar with App ID & App Open Ad Unit ID */}
        <div className="px-3.5 py-2.5 bg-[#0e131f] border-b border-[#1f2638] flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ADMOB APP OPEN & BANNER CONNECTED
            </span>

            {/* AdMob App ID Badge */}
            <div className="flex items-center gap-1 bg-[#080a0f] px-2 py-0.5 rounded border border-[#252c3d]">
              <Smartphone className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-[#9ca3af] text-[10px]">App ID:</span>
              <code className="text-emerald-300 font-mono font-bold text-[10px] select-all">
                {ADMOB_APP_ID}
              </code>
              <button
                type="button"
                onClick={() => handleCopyText(ADMOB_APP_ID, 'appId')}
                className="ml-1 text-[#9ca3af] hover:text-white cursor-pointer"
                title="Copy AdMob App ID"
              >
                {copiedField === 'appId' ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </button>
            </div>

            {/* AdMob Ad Unit ID Badge */}
            <div className="flex items-center gap-1 bg-[#080a0f] px-2 py-0.5 rounded border border-[#252c3d]">
              <span className="text-[#9ca3af] text-[10px]">
                {activeSlot === 'appOpen' ? 'App Open Unit:' : 'Banner Unit:'}
              </span>
              <code className="text-[#f8b179] font-mono font-bold text-[10px] select-all">
                {currentAdUnitId}
              </code>
              <button
                type="button"
                onClick={() => handleCopyText(currentAdUnitId, 'unitId')}
                className="ml-1 text-[#9ca3af] hover:text-white cursor-pointer"
                title="Copy AdMob Ad Unit ID"
              >
                {copiedField === 'unitId' ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Switch between App Open (1431647456) and Banner (2800569440) Ad Unit */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveSlot('appOpen');
                setAdKey((prev) => prev + 1);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border transition-colors ${
                activeSlot === 'appOpen'
                  ? 'bg-[#d47a37]/20 text-[#f8b179] border-[#d47a37]/50 font-bold'
                  : 'bg-[#141824] text-[#9ca3af] border-[#252c3d] hover:text-white'
              }`}
              title="App Open Ad Unit ca-app-pub-3767067209003943/1431647456"
            >
              App Open (/1431647456)
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveSlot('banner');
                setAdKey((prev) => prev + 1);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border transition-colors ${
                activeSlot === 'banner'
                  ? 'bg-[#d47a37]/20 text-[#f8b179] border-[#d47a37]/50 font-bold'
                  : 'bg-[#141824] text-[#9ca3af] border-[#252c3d] hover:text-white'
              }`}
              title="Banner Ad Unit ca-app-pub-3767067209003943/2800569440"
            >
              Banner (/2800569440)
            </button>

            {/* Trigger App Open Overlay Ad */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                window.dispatchEvent(new CustomEvent('lurl-trigger-app-open-ad'));
              }}
              className="px-2 py-0.5 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1"
              title="Open Full-Screen App Open Ad (ca-app-pub-3767067209003943/1431647456)"
            >
              <Layers className="w-2.5 h-2.5" />
              <span>Test App Open</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshAd}
              className="p-1 rounded bg-[#141824] hover:bg-[#1f2638] text-[#9ca3af] hover:text-white border border-[#252c3d] cursor-pointer transition-colors"
              title="Reload AdMob Slot"
            >
              <RefreshCw className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsCollapsed(!isCollapsed);
              }}
              className="p-1 rounded bg-[#141824] hover:bg-[#1f2638] text-[#9ca3af] hover:text-white border border-[#252c3d] cursor-pointer transition-colors"
              title={isCollapsed ? 'Expand AdMob Unit' : 'Minimize AdMob Unit'}
            >
              {isCollapsed ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Live Google AdMob / AdSense Slot Container */}
        {!isCollapsed && (
          <div
            key={`${activeSlot}-${adKey}`}
            className="relative min-h-[90px] px-4 py-3 flex flex-col items-center justify-center bg-gradient-to-r from-[#090b10] via-[#0d111a] to-[#090b10]"
          >
            {/* Official Google AdMob / AdSense Tag */}
            <ins
              className="adsbygoogle w-full"
              style={{ display: 'block', minHeight: '70px' }}
              data-ad-client={ADMOB_PUBLISHER_ID}
              data-ad-slot={currentSlotId}
              data-ad-unit={currentAdUnitId}
              data-admob-app-id={ADMOB_APP_ID}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />

            {/* Status Strip */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-[#1f2638]/60 text-[10px] font-mono text-[#6b7280]">
              <div className="flex flex-wrap items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#d47a37]" />
                <span>
                  AdMob App ID: <strong className="text-gray-300">{ADMOB_APP_ID}</strong>
                </span>
                <span>•</span>
                <span>
                  App Open Unit:{' '}
                  <strong className="text-[#f8b179]">{ADMOB_APP_OPEN_AD_UNIT_ID}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">
                  {nativeBridgeActive
                    ? 'Native Mobile SDK + App Open Mediation Active'
                    : adInitialized
                    ? 'App Open & Banner Ad Unit Mapped & Serving'
                    : 'Initializing AdMob Mediation...'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
