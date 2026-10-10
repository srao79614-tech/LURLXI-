import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DemoCandle,
  DemoAccount,
  DemoTradePosition,
  DemoClosedTrade,
  TraderRanking,
  UserProfile,
  UserSession,
} from '../types';
import {
  generateBtcCandles,
  fetchLiveBtcCandles,
  fetchLiveBtcPrice,
  getDemoAccount,
  saveDemoAccount,
  resetDemoAccount,
  getDemoPositions,
  saveDemoPositions,
  getClosedTrades,
  saveClosedTrades,
  getTraderRankings,
} from '../utils/btcCandleData';
import { calculateUserTenure, getTierBadgeStyle } from '../utils/tierSystem';
import {
  scheduleVaultSync,
  getAccountScopedKey,
  logDemoTradeHistory,
  logAiDoubtClarifiedHistory,
  buildAccountActivityContextForChatbot,
} from '../utils/userStorage';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import {
  getActiveServerOrigin,
  getDirectHtmlDownloadUrl,
  getDirectCssDownloadUrl,
  getDirectHtmlViewUrl,
  openStandaloneInNewTab,
} from '../utils/urlHelper';
import { downloadStandaloneCssFile, downloadStandaloneHtmlFile } from '../utils/downloadHelper';
import { logActivity } from '../utils/activityHistory';
import { HistoricalProfitChart } from './HistoricalProfitChart';
import { GlobalLeaderboard } from './GlobalLeaderboard';
import { TradePerformanceSummary } from './TradePerformanceSummary';
import { WorldwideConversationColumn } from './WorldwideConversationColumn';
import {
  CandlestickChart,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Sliders,
  DollarSign,
  ShieldAlert,
  Award,
  Crown,
  Medal,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Activity,
  Maximize2,
  Minimize2,
  ChevronDown,
  Settings,
  HelpCircle,
  BarChart2,
  RefreshCw,
  Target,
  Shield,
  Zap,
  Download,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Trophy,
  Flame,
  FileCode,
  Sparkles,
  MousePointer,
  Crosshair,
  Pencil,
  Type,
  Ruler,
  Trash2,
  Undo2,
  Split,
  Camera,
  Magnet,
  Eye,
  EyeOff,
  Smartphone,
  CheckSquare,
  Bot,
  Send,
  MessageSquare,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { getStandaloneHtmlContent } from '../standaloneHtmlSource';

interface BtcDemoTradingViewProps {
  userSession: UserSession | null;
  userProfile?: UserProfile;
  onOpenProfile?: () => void;
  onAskChatbot?: (prompt: string) => void;
}

export type TimeFrame = '1m' | '5m' | '15m' | '1H' | '4H' | '1D';
export type ChartStyle = 'candles' | 'hollow' | 'heikin' | 'line' | 'area';
export type BottomTab = 'positions' | 'history' | 'worldwide' | 'profit-chart' | 'rankings' | 'strategy';

export type DrawingTool =
  | 'cursor'
  | 'trendline'
  | 'horizontal'
  | 'fibonacci'
  | 'long_position'
  | 'short_position'
  | 'text'
  | 'measure';

export interface ChartDrawing {
  id: string;
  type: DrawingTool;
  p1: { candleIndex: number; price: number };
  p2?: { candleIndex: number; price: number };
  text?: string;
  color?: string;
  rr?: {
    entryPrice: number;
    targetPrice: number;
    stopLossPrice: number;
    rrRatio: number;
  };
}

export const BtcDemoTradingView: React.FC<BtcDemoTradingViewProps> = ({
  userSession,
  userProfile,
  onOpenProfile,
  onAskChatbot,
}) => {
  // Scenario state
  const [selectedScenario, setSelectedScenario] = useState<string>('live');
  const [allCandles, setAllCandles] = useState<DemoCandle[]>(() => generateBtcCandles('wyckoff', 180));
  
  // Chart settings
  const [timeframe, setTimeframe] = useState<TimeFrame>(() => {
    try {
      return (localStorage.getItem('lurl_btc_demo_timeframe') as TimeFrame) || '15m';
    } catch {
      return '15m';
    }
  });

  // Real-Time Live Market Feed State (Binance Public Stream - Zero Fake Results)
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);
  const [liveBtcSpotPrice, setLiveBtcSpotPrice] = useState<number>(0);
  const [live24hChange, setLive24hChange] = useState<number>(0);
  const [liveStreamConnected, setLiveStreamConnected] = useState<boolean>(false);

  // Live Stream Effect: Loads live market klines & continuous 2-second ticker polling
  useEffect(() => {
    let isMounted = true;
    let pollInterval: any = null;

    async function loadInitialCandles() {
      try {
        const live = await fetchLiveBtcCandles(timeframe, 120);
        if (isMounted && live && live.length > 0) {
          setAllCandles(live);
          setReplayIndex(live.length);
          setLiveStreamConnected(true);
        }
      } catch (err) {
        console.warn('Live candle initial stream fallback:', err);
      }
    }

    if (isLiveStream) {
      loadInitialCandles();
    }

    const pollLiveTicker = async () => {
      if (!isLiveStream) return;
      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        if (res.ok && isMounted) {
          const data = await res.json();
          const p = parseFloat(data.lastPrice);
          const chg = parseFloat(data.priceChangePercent);
          if (p > 0) {
            setLiveBtcSpotPrice(p);
            setLive24hChange(chg);
            setLiveStreamConnected(true);
            setAllCandles((prev) => {
              if (!prev || prev.length === 0) return prev;
              const updated = [...prev];
              const last = { ...updated[updated.length - 1] };
              last.close = p;
              if (p > last.high) last.high = p;
              if (p < last.low) last.low = p;
              updated[updated.length - 1] = last;
              return updated;
            });
          }
        }
      } catch (e) {
        // Fallback
      }
    };

    pollLiveTicker();
    pollInterval = setInterval(pollLiveTicker, 2000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [timeframe, isLiveStream]);
  
  // Replay Backtesting Engine
  const [replayIndex, setReplayIndex] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1); // 0.5x, 1x, 2x, 5x, 10x

  // Account-scoped chart settings helper
  const getStoredChartConfig = (email?: string) => {
    try {
      const key = getAccountScopedKey('lurl_btc_chart_config', email);
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  };

  const initialChartConfig = getStoredChartConfig(userSession?.email);

  // Chart settings
  const [chartStyle, setChartStyle] = useState<ChartStyle>(initialChartConfig?.chartStyle || 'candles');
  const [showEma20, setShowEma20] = useState<boolean>(initialChartConfig?.showEma20 ?? true);
  const [showEma50, setShowEma50] = useState<boolean>(initialChartConfig?.showEma50 ?? true);
  const [showEma200, setShowEma200] = useState<boolean>(initialChartConfig?.showEma200 ?? false);
  const [showBollinger, setShowBollinger] = useState<boolean>(initialChartConfig?.showBollinger ?? false);
  const [showRsi, setShowRsi] = useState<boolean>(initialChartConfig?.showRsi ?? true);
  const [showMacd, setShowMacd] = useState<boolean>(initialChartConfig?.showMacd ?? false);
  const [showVwap, setShowVwap] = useState<boolean>(initialChartConfig?.showVwap ?? false);
  const [showVolume, setShowVolume] = useState<boolean>(initialChartConfig?.showVolume ?? true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // TradingView-Grade Drawing & Markup Suite
  const [activeDrawingTool, setActiveDrawingTool] = useState<DrawingTool>('cursor');
  const [drawings, setDrawings] = useState<ChartDrawing[]>(() => {
    try {
      const scopedKey = getAccountScopedKey('lurl_btc_demo_drawings_v1', userSession?.email);
      const saved = localStorage.getItem(scopedKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [
      {
        id: 'init-support',
        type: 'horizontal',
        p1: { candleIndex: 8, price: 61500 },
        color: '#10b981',
        text: 'Support (Daily FVG / Demand) $61,500',
      },
      {
        id: 'init-resistance',
        type: 'horizontal',
        p1: { candleIndex: 8, price: 65200 },
        color: '#ef4444',
        text: 'Resistance (Liquidity Sweep Pool) $65,200',
      },
    ];
  });
  const [drawingStartPoint, setDrawingStartPoint] = useState<{ candleIndex: number; price: number } | null>(null);
  const [currentHoverCoords, setCurrentHoverCoords] = useState<{ candleIndex: number; price: number; svgX: number; svgY: number } | null>(null);
  const [magnetMode, setMagnetMode] = useState<boolean>(true);
  const [showDrawings, setShowDrawings] = useState<boolean>(true);
  const [textNoteModal, setTextNoteModal] = useState<{ open: boolean; candleIndex: number; price: number } | null>(null);
  const [textNoteInput, setTextNoteInput] = useState<string>('Fair Value Gap (FVG)');
  const [copiedSnapshot, setCopiedSnapshot] = useState<boolean>(false);

  // In-Chart AI Chatbot Slidebar State
  const defaultAiIntro = {
    role: 'ai' as const,
    text: 'Institutional AI Trading Co-Pilot active. I am actively monitoring your real-time BTC/USDT chart and all your saved account activities. Click any prompt below or ask any question to analyze current market structure, calculate entry and stop-loss levels, detect liquidity sweeps, or configure 1:3 R:R setups.',
    timestamp: 'Online',
  };

  const getStoredAiChatMessages = (email?: string) => {
    try {
      const key = getAccountScopedKey('lurl_btc_demo_ai_chat', email);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [defaultAiIntro];
  };

  const [isAiChatSidebarOpen, setIsAiChatSidebarOpen] = useState<boolean>(false);
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; timestamp: string }>>(() =>
    getStoredAiChatMessages(userSession?.email)
  );
  const [aiChatInput, setAiChatInput] = useState<string>('');
  const [isAiChatLoading, setIsAiChatLoading] = useState<boolean>(false);
  const [isAiChatSpeechOn, setIsAiChatSpeechOn] = useState<boolean>(false);

  // Hovered candle for crosshair info
  const [hoveredCandle, setHoveredCandle] = useState<DemoCandle | null>(null);

  // Account & Positions
  const [account, setAccount] = useState<DemoAccount>(() => getDemoAccount(userSession?.email));
  const [positions, setPositions] = useState<DemoTradePosition[]>(() => getDemoPositions(userSession?.email));
  const [closedTrades, setClosedTrades] = useState<DemoClosedTrade[]>(() => getClosedTrades(userSession?.email));
  const [bottomTab, setBottomTab] = useState<BottomTab>(() => {
    try {
      const key = getAccountScopedKey('lurl_btc_demo_bottom_tab', userSession?.email);
      return (localStorage.getItem(key) as BottomTab) || 'history';
    } catch {
      return 'history';
    }
  });
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState<boolean>(false);
  const [selectedCapital, setSelectedCapital] = useState<number>(10000);

  useEffect(() => {
    try {
      const tfKey = getAccountScopedKey('lurl_btc_demo_timeframe', userSession?.email);
      const btKey = getAccountScopedKey('lurl_btc_demo_bottom_tab', userSession?.email);
      localStorage.setItem(tfKey, timeframe);
      localStorage.setItem(btKey, bottomTab);

      // Save chart configuration under this account
      const chartConfigKey = getAccountScopedKey('lurl_btc_chart_config', userSession?.email);
      localStorage.setItem(
        chartConfigKey,
        JSON.stringify({
          chartStyle,
          showEma20,
          showEma50,
          showEma200,
          showBollinger,
          showRsi,
          showMacd,
          showVwap,
          showVolume,
          timeframe,
          bottomTab,
        })
      );

      const scopedKey = getAccountScopedKey('lurl_btc_demo_drawings_v1', userSession?.email);
      localStorage.setItem(scopedKey, JSON.stringify(drawings));
      scheduleVaultSync(userSession?.email);
    } catch {}
  }, [
    timeframe,
    bottomTab,
    drawings,
    chartStyle,
    showEma20,
    showEma50,
    showEma200,
    showBollinger,
    showRsi,
    showMacd,
    showVwap,
    showVolume,
    userSession?.email,
  ]);

  // Auto-save in-chart AI chat messages
  useEffect(() => {
    if (aiChatMessages.length > 0) {
      try {
        const chatKey = getAccountScopedKey('lurl_btc_demo_ai_chat', userSession?.email);
        localStorage.setItem(chatKey, JSON.stringify(aiChatMessages.slice(-60)));
        if (aiChatMessages.length > 1) {
          scheduleVaultSync(userSession?.email);
        }
      } catch {}
    }
  }, [aiChatMessages, userSession?.email]);

  useEffect(() => {
    const syncAccountTradingState = () => {
      setAccount(getDemoAccount(userSession?.email));
      setPositions(getDemoPositions(userSession?.email));
      setClosedTrades(getClosedTrades(userSession?.email));
      setAiChatMessages(getStoredAiChatMessages(userSession?.email));

      const cfg = getStoredChartConfig(userSession?.email);
      if (cfg) {
        if (cfg.chartStyle) setChartStyle(cfg.chartStyle);
        if (cfg.showEma20 !== undefined) setShowEma20(cfg.showEma20);
        if (cfg.showEma50 !== undefined) setShowEma50(cfg.showEma50);
        if (cfg.showEma200 !== undefined) setShowEma200(cfg.showEma200);
        if (cfg.showBollinger !== undefined) setShowBollinger(cfg.showBollinger);
        if (cfg.showRsi !== undefined) setShowRsi(cfg.showRsi);
        if (cfg.showMacd !== undefined) setShowMacd(cfg.showMacd);
        if (cfg.showVwap !== undefined) setShowVwap(cfg.showVwap);
        if (cfg.showVolume !== undefined) setShowVolume(cfg.showVolume);
      }

      try {
        const tfKey = getAccountScopedKey('lurl_btc_demo_timeframe', userSession?.email);
        const tf = localStorage.getItem(tfKey) as TimeFrame;
        if (tf) setTimeframe(tf);
        const btKey = getAccountScopedKey('lurl_btc_demo_bottom_tab', userSession?.email);
        const bt = localStorage.getItem(btKey) as BottomTab;
        if (bt) setBottomTab(bt);
        const scopedKey = getAccountScopedKey('lurl_btc_demo_drawings_v1', userSession?.email);
        const dr = localStorage.getItem(scopedKey);
        if (dr) setDrawings(JSON.parse(dr));
      } catch {}
    };
    syncAccountTradingState();
    window.addEventListener('lurl-vault-restored', syncAccountTradingState);
    window.addEventListener('lurl-account-changed', syncAccountTradingState);
    window.addEventListener('lurl-chart-updated', syncAccountTradingState);
    return () => {
      window.removeEventListener('lurl-vault-restored', syncAccountTradingState);
      window.removeEventListener('lurl-account-changed', syncAccountTradingState);
      window.removeEventListener('lurl-chart-updated', syncAccountTradingState);
    };
  }, [userSession?.email]);

  // Order Entry Form
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<string>('62000');
  const [positionAmountUsd, setPositionAmountUsd] = useState<string>('2000');
  const [leverage, setLeverage] = useState<number>(5);
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('64500');
  const [stopLossPrice, setStopLossPrice] = useState<string>('60500');

  // Website Download in Chart Section states
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isDownloadingHtml, setIsDownloadingHtml] = useState<boolean>(false);

  // Worldwide Leaderboard Ranking Sorting Mode: 'roi' (Profit %) vs 'profit' ($)
  const [rankingSortBy, setRankingSortBy] = useState<'roi' | 'profit'>('roi');

  const containerRef = useRef<HTMLDivElement>(null);

  // Live Website URL & Chart Menu Share State
  const liveWebsiteUrl = getActiveServerOrigin();
  const [showWebsiteUrlModal, setShowWebsiteUrlModal] = useState<boolean>(false);
  const [copiedWebsiteUrl, setCopiedWebsiteUrl] = useState<boolean>(false);

  const handleCopyWebsiteUrl = () => {
    playSuccessChime();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(liveWebsiteUrl);
    }
    setCopiedWebsiteUrl(true);
    setTimeout(() => setCopiedWebsiteUrl(false), 2500);
  };

  // Direct Browser Download URLs and Standalone View URLs
  const directDownloadUrl = getDirectHtmlDownloadUrl();
  const directDownloadCssUrl = getDirectCssDownloadUrl();
  const directHtmlViewUrl = getDirectHtmlViewUrl();
  const [copiedCssLink, setCopiedCssLink] = useState(false);
  const [copiedHtmlViewUrl, setCopiedHtmlViewUrl] = useState(false);
  const [isDownloadingCss, setIsDownloadingCss] = useState(false);

  const handleCopyHtmlViewUrl = () => {
    playSuccessChime();
    navigator.clipboard.writeText(directHtmlViewUrl);
    setCopiedHtmlViewUrl(true);
    setTimeout(() => setCopiedHtmlViewUrl(false), 2500);
  };

  const handleCopyDownloadLink = () => {
    playClickSound();
    navigator.clipboard.writeText(directDownloadUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCssDownloadLink = () => {
    playClickSound();
    navigator.clipboard.writeText(directDownloadCssUrl);
    setCopiedCssLink(true);
    setTimeout(() => setCopiedCssLink(false), 2500);
  };

  const handleDirectBlobDownload = () => {
    playClickSound();
    setIsDownloadingHtml(true);
    downloadStandaloneHtmlFile('LURL.html');
    logActivity('export', 'Downloaded Standalone HTML', 'Exported single-file autonomous LURL.html');
    playSuccessChime();
    setTimeout(() => setIsDownloadingHtml(false), 1500);
  };

  const handleDirectCssDownload = () => {
    playClickSound();
    setIsDownloadingCss(true);
    downloadStandaloneCssFile('LURL.css');
    logActivity('export', 'Downloaded Standalone CSS', 'Exported error-free LURL.css stylesheet');
    playSuccessChime();
    setTimeout(() => setIsDownloadingCss(false), 1500);
  };

  // Quick Simulation Demo Trade to boost profit and test 1st/2nd/3rd Worldwide Ranking
  const handleSimulateWinningTrade = (boostRoi: number = 260) => {
    playClickSound();
    const tradeProfit = Math.round(account.initialBalance * (boostRoi / 100) * 10) / 10;
    const now = Date.now();
    const closed: DemoClosedTrade = {
      id: `trade-pro-${now}`,
      symbol: 'BTC/USD',
      side: 'BUY',
      entryPrice: Math.round(currentPrice * 0.96),
      exitPrice: currentPrice,
      sizeBtc: 0.5,
      sizeUsd: Math.round(account.initialBalance * 0.4),
      leverage: 25,
      openTime: now - 3600000,
      closeTime: now,
      profit: tradeProfit,
      roi: boostRoi,
      reason: 'TP Triggered',
    };

    const updatedClosed = [closed, ...closedTrades];
    setClosedTrades(updatedClosed);
    saveClosedTrades(updatedClosed, userSession?.email);

    const updatedAcc: DemoAccount = {
      ...account,
      balance: Math.round((account.balance + tradeProfit) * 100) / 100,
      realizedPnl: Math.round((account.realizedPnl + tradeProfit) * 100) / 100,
      winCount: account.winCount + 1,
    };
    setAccount(updatedAcc);
    saveDemoAccount(updatedAcc, userSession?.email);
    logDemoTradeHistory(
      `Closed Winning BTC/USD BUY Trade (+$${tradeProfit.toLocaleString()})`,
      `Executed 25x BUY trade from $${closed.entryPrice.toLocaleString()} to $${closed.exitPrice.toLocaleString()}`,
      `Realized PnL: +$${tradeProfit.toLocaleString()} (+${boostRoi}% ROI) | New Balance: $${updatedAcc.balance.toLocaleString()}`,
      userSession?.email
    );
    logActivity(
      'trading',
      `Closed Winning BTC/USD BUY Trade (+$${tradeProfit.toLocaleString()})`,
      `Realized PnL: +$${tradeProfit.toLocaleString()} (+${boostRoi}% ROI) | Balance: $${updatedAcc.balance.toLocaleString()}`,
      { tradeId: closed.id, profit: tradeProfit, roi: boostRoi },
      userSession?.email
    );
    playSuccessChime();
  };

  // CSV Export for Trade History
  const handleExportTradesCsv = () => {
    if (closedTrades.length === 0) return;
    const headers = [
      'Trade ID,Symbol,Side,Leverage,Entry Price ($),Exit Price ($),Size BTC,Margin USD,Realized PnL ($),ROI (%),Exit Reason,Opened At,Closed At',
    ];
    const rows = closedTrades.map((t) =>
      [
        t.id,
        t.symbol,
        t.side,
        `${t.leverage}x`,
        t.entryPrice,
        t.exitPrice,
        t.sizeBtc,
        t.sizeUsd,
        t.profit.toFixed(2),
        t.roi.toFixed(2),
        `"${t.reason}"`,
        new Date(t.openTime).toISOString(),
        new Date(t.closeTime).toISOString(),
      ].join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LURL_BTC_Trade_History_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // User Tenure & Tier calculation
  const tenure = useMemo(() => calculateUserTenure(userProfile), [userProfile]);
  const tierStyle = useMemo(() => getTierBadgeStyle(tenure.currentTier), [tenure.currentTier]);

  // Current visible candles based on live stream or replay bar
  const visibleCandles = useMemo(() => {
    return isLiveStream ? allCandles : allCandles.slice(0, replayIndex);
  }, [allCandles, replayIndex, isLiveStream]);

  const currentCandle = visibleCandles[visibleCandles.length - 1] || allCandles[0];
  const currentPrice = (isLiveStream && liveBtcSpotPrice > 0) ? liveBtcSpotPrice : (currentCandle ? currentCandle.close : 84500);

  // Sync initial limit & SL/TP prices to current price
  useEffect(() => {
    if (orderType === 'MARKET') {
      setLimitPrice(currentPrice.toString());
    }
  }, [currentPrice, orderType]);

  // Scenario switch
  const handleScenarioChange = (scenario: string) => {
    playClickSound();
    setSelectedScenario(scenario);
    const newCandles = generateBtcCandles(scenario, 180);
    setAllCandles(newCandles);
    setReplayIndex(100);
    setIsPlaying(false);
  };

  // Replay timer loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(150, 1000 / replaySpeed);
    const timer = setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= allCandles.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, replaySpeed, allCandles.length]);

  // Check positions for TP/SL triggers or update unrealized PnL on each new candle
  useEffect(() => {
    if (!currentCandle) return;

    setPositions((prevPositions) => {
      const remaining: DemoTradePosition[] = [];
      const newClosed: DemoClosedTrade[] = [];
      let balanceDelta = 0;
      let winsDelta = 0;
      let lossesDelta = 0;

      for (const pos of prevPositions) {
        const markPrice = currentCandle.close;
        const priceDiff = pos.side === 'BUY' ? markPrice - pos.entryPrice : pos.entryPrice - markPrice;
        const pnl = priceDiff * pos.sizeBtc * pos.leverage;
        const pnlPercent = (priceDiff / pos.entryPrice) * 100 * pos.leverage;

        // Check TP
        let triggeredReason: DemoClosedTrade['reason'] | null = null;
        if (pos.takeProfit) {
          if (pos.side === 'BUY' && markPrice >= pos.takeProfit) triggeredReason = 'TP Triggered';
          if (pos.side === 'SELL' && markPrice <= pos.takeProfit) triggeredReason = 'TP Triggered';
        }

        // Check SL
        if (pos.stopLoss) {
          if (pos.side === 'BUY' && markPrice <= pos.stopLoss) triggeredReason = 'SL Triggered';
          if (pos.side === 'SELL' && markPrice >= pos.stopLoss) triggeredReason = 'SL Triggered';
        }

        // Check Liquidation
        if (pnl <= -pos.sizeUsd) {
          triggeredReason = 'Liquidation';
        }

        if (triggeredReason) {
          const finalPnl = triggeredReason === 'Liquidation' ? -pos.sizeUsd : Math.round(pnl * 100) / 100;
          newClosed.push({
            id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            symbol: 'BTC/USD',
            side: pos.side,
            entryPrice: pos.entryPrice,
            exitPrice: markPrice,
            sizeBtc: pos.sizeBtc,
            sizeUsd: pos.sizeUsd,
            leverage: pos.leverage,
            openTime: pos.openTime,
            closeTime: currentCandle.time,
            profit: finalPnl,
            roi: Math.round((finalPnl / pos.sizeUsd) * 1000) / 10,
            reason: triggeredReason,
          });

          balanceDelta += pos.sizeUsd + finalPnl;
          if (finalPnl > 0) winsDelta++;
          else lossesDelta++;
        } else {
          remaining.push({
            ...pos,
            currentPrice: markPrice,
            pnl: Math.round(pnl * 100) / 100,
            pnlPercent: Math.round(pnlPercent * 10) / 10,
          });
        }
      }

      if (newClosed.length > 0) {
        setClosedTrades((prevClosed) => {
          const updated = [...newClosed, ...prevClosed];
          saveClosedTrades(updated, userSession?.email);
          return updated;
        });

        setAccount((prevAcc) => {
          const newBalance = Math.max(0, prevAcc.balance + balanceDelta);
          const newRealizedPnl = prevAcc.realizedPnl + newClosed.reduce((sum, t) => sum + t.profit, 0);
          const updatedAcc: DemoAccount = {
            ...prevAcc,
            balance: Math.round(newBalance * 100) / 100,
            realizedPnl: Math.round(newRealizedPnl * 100) / 100,
            winCount: prevAcc.winCount + winsDelta,
            lossCount: prevAcc.lossCount + lossesDelta,
          };
          saveDemoAccount(updatedAcc, userSession?.email);
          return updatedAcc;
        });
        newClosed.forEach((tc) => {
          const pnlSign = tc.profit >= 0 ? '+' : '';
          logDemoTradeHistory(
            `${tc.reason}: BTC/USD ${tc.side} (${pnlSign}$${tc.profit.toLocaleString()})`,
            `${tc.leverage}x ${tc.side} closed at $${tc.exitPrice.toLocaleString()} (Entry: $${tc.entryPrice.toLocaleString()})`,
            `Realized PnL: ${pnlSign}$${tc.profit.toLocaleString()} (${pnlSign}${tc.roi}% ROI)`,
            userSession?.email
          );
          logActivity(
            'trading',
            `${tc.reason}: BTC/USD ${tc.side} (${pnlSign}$${tc.profit.toLocaleString()})`,
            `${tc.leverage}x ${tc.side} closed at $${tc.exitPrice.toLocaleString()} | ROI: ${pnlSign}${tc.roi}%`,
            { tradeId: tc.id, profit: tc.profit, roi: tc.roi },
            userSession?.email
          );
        });
        playSuccessChime();
      }

      saveDemoPositions(remaining, userSession?.email);
      return remaining;
    });
  }, [currentCandle, userSession?.email]);

  // Compute live Equity
  const totalUnrealizedPnl = useMemo(() => {
    return positions.reduce((sum, p) => sum + p.pnl, 0);
  }, [positions]);

  const liveEquity = useMemo(() => {
    return Math.round((account.balance + totalUnrealizedPnl) * 100) / 100;
  }, [account.balance, totalUnrealizedPnl]);

  // Execute Order
  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    playClickSound();

    const amountUsd = parseFloat(positionAmountUsd) || 1000;
    if (amountUsd > account.balance) {
      alert('Insufficient demo cash balance for this position margin!');
      return;
    }

    const execPrice = orderType === 'MARKET' ? currentPrice : (parseFloat(limitPrice) || currentPrice);
    const sizeBtc = parseFloat(((amountUsd * leverage) / execPrice).toFixed(4));
    const tp = takeProfitPrice ? parseFloat(takeProfitPrice) : undefined;
    const sl = stopLossPrice ? parseFloat(stopLossPrice) : undefined;

    // Liquidation price estimate
    const liqDrop = execPrice / leverage;
    const liquidationPrice = orderSide === 'BUY'
      ? Math.max(100, Math.round(execPrice - liqDrop * 0.95))
      : Math.round(execPrice + liqDrop * 0.95);

    const newPos: DemoTradePosition = {
      id: `pos-${Date.now()}`,
      symbol: 'BTC/USD',
      side: orderSide,
      entryPrice: execPrice,
      currentPrice: execPrice,
      sizeBtc,
      sizeUsd: amountUsd,
      leverage,
      stopLoss: sl,
      takeProfit: tp,
      openTime: currentCandle.time,
      pnl: 0,
      pnlPercent: 0,
      liquidationPrice,
    };

    // Deduct margin from balance
    const updatedAcc: DemoAccount = {
      ...account,
      balance: Math.max(0, Math.round((account.balance - amountUsd) * 100) / 100),
      totalVolumeUsd: account.totalVolumeUsd + amountUsd * leverage,
    };
    setAccount(updatedAcc);
    saveDemoAccount(updatedAcc, userSession?.email);

    const updatedPositions = [newPos, ...positions];
    setPositions(updatedPositions);
    saveDemoPositions(updatedPositions, userSession?.email);

    logDemoTradeHistory(
      `Opened BTC/USD ${orderSide} Position ($${amountUsd.toLocaleString()} @ ${leverage}x)`,
      `Entry: $${execPrice.toLocaleString()} | Size: ${sizeBtc} BTC | TP: ${tp ? '$' + tp.toLocaleString() : 'None'} | SL: ${sl ? '$' + sl.toLocaleString() : 'None'}`,
      `Active ${orderSide} position opened at $${execPrice.toLocaleString()} with ${leverage}x leverage.`,
      userSession?.email
    );
    logActivity(
      'trading',
      `Opened BTC/USD ${orderSide} Position ($${amountUsd.toLocaleString()} @ ${leverage}x)`,
      `Entry: $${execPrice.toLocaleString()} | Size: ${sizeBtc} BTC`,
      { positionId: newPos.id, side: orderSide, entryPrice: execPrice, leverage },
      userSession?.email
    );
    playSuccessChime();
  };

  // Close single position manually
  const handleClosePosition = (id: string) => {
    playClickSound();
    const pos = positions.find((p) => p.id === id);
    if (!pos) return;

    const finalPnl = pos.pnl;
    const closed: DemoClosedTrade = {
      id: `trade-${Date.now()}`,
      symbol: 'BTC/USD',
      side: pos.side,
      entryPrice: pos.entryPrice,
      exitPrice: currentPrice,
      sizeBtc: pos.sizeBtc,
      sizeUsd: pos.sizeUsd,
      leverage: pos.leverage,
      openTime: pos.openTime,
      closeTime: currentCandle.time,
      profit: finalPnl,
      roi: Math.round((finalPnl / pos.sizeUsd) * 1000) / 10,
      reason: 'Manual Close',
    };

    const remaining = positions.filter((p) => p.id !== id);
    setPositions(remaining);
    saveDemoPositions(remaining, userSession?.email);

    const updatedClosed = [closed, ...closedTrades];
    setClosedTrades(updatedClosed);
    saveClosedTrades(updatedClosed, userSession?.email);

    const updatedAcc: DemoAccount = {
      ...account,
      balance: Math.max(0, Math.round((account.balance + pos.sizeUsd + finalPnl) * 100) / 100),
      realizedPnl: Math.round((account.realizedPnl + finalPnl) * 100) / 100,
      winCount: finalPnl > 0 ? account.winCount + 1 : account.winCount,
      lossCount: finalPnl <= 0 ? account.lossCount + 1 : account.lossCount,
    };
    setAccount(updatedAcc);
    saveDemoAccount(updatedAcc, userSession?.email);

    const pnlSign = finalPnl >= 0 ? '+' : '';
    logDemoTradeHistory(
      `Closed BTC/USD ${pos.side} Position (${pnlSign}$${finalPnl.toLocaleString()})`,
      `Manual Close at $${currentPrice.toLocaleString()} (Entry: $${pos.entryPrice.toLocaleString()}, ${pos.leverage}x)`,
      `Realized PnL: ${pnlSign}$${finalPnl.toLocaleString()} (${pnlSign}${closed.roi}% ROI) | Balance: $${updatedAcc.balance.toLocaleString()}`,
      userSession?.email
    );
    logActivity(
      'trading',
      `Closed BTC/USD ${pos.side} Position (${pnlSign}$${finalPnl.toLocaleString()})`,
      `Manual Close at $${currentPrice.toLocaleString()} | ROI: ${pnlSign}${closed.roi}%`,
      { tradeId: closed.id, profit: finalPnl, roi: closed.roi },
      userSession?.email
    );
  };

  // Send message to AI Chatbot with real-time chart context
  const handleSendAiChatMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || aiChatInput.trim();
    if (!textToSend || isAiChatLoading) return;

    playClickSound();
    const userMsg = {
      role: 'user' as const,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAiChatMessages((prev) => [...prev, userMsg]);
    setAiChatInput('');
    setIsAiChatLoading(true);

    const price = currentCandle ? currentCandle.close : 63500;
    const rsiVal = currentCandle?.rsi ?? 50;
    const ema20Val = currentCandle?.ema20 ?? price;
    const ema50Val = currentCandle?.ema50 ?? price;
    const trend = price > ema50Val ? 'BULLISH' : 'BEARISH';

    const promptWithContext = `[BTC/USDT Real-time Chart: Timeframe: ${timeframe}, Price: $${price.toLocaleString()}, EMA20: $${ema20Val.toLocaleString()}, EMA50: $${ema50Val.toLocaleString()}, RSI: ${rsiVal}, Bias: ${trend}, Scenario: ${selectedScenario}]
Trading Question: ${textToSend}`;

    try {
      const activitySummary = buildAccountActivityContextForChatbot(userSession?.email);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'trading',
          message: promptWithContext,
          email: userSession?.email,
          activitySummary,
        }),
      });
      const data = await res.json();
      const reply = data.reply || 'Institutional trading analysis complete. Enforce 1.0% maximum risk per trade.';
      logAiDoubtClarifiedHistory('trading', textToSend, reply, userSession?.email);
      logActivity(
        'trading',
        `Chart AI Co-Pilot: ${textToSend.slice(0, 50)}`,
        reply.replace(/[#*_`>-]/g, '').slice(0, 180),
        { timeframe, price },
        userSession?.email
      );
      setAiChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (isAiChatSpeechOn && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const clean = reply.replace(/[*#_`]/g, '');
        const utter = new SpeechSynthesisUtterance(clean.slice(0, 200));
        window.speechSynthesis.speak(utter);
      }
    } catch (err) {
      setAiChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Market Structure Assessment:\n• Current BTC Price: $${price.toLocaleString()} with ${trend} momentum.\n• Technical Signals: EMA20 at $${ema20Val.toLocaleString()}, EMA50 at $${ema50Val.toLocaleString()}, RSI at ${rsiVal}.\n• Execution Guideline: Await retest of the nearest liquidity imbalance before initiating trades. Maintain a minimum 1:2.5 to 1:3 risk-to-reward ratio.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiChatLoading(false);
    }
  };

  // Reset demo account
  const handleResetAccount = () => {
    playClickSound();
    const fresh = resetDemoAccount(selectedCapital, userSession?.email);
    setAccount(fresh);
    setPositions([]);
    setClosedTrades([]);
    setIsAccountSettingsOpen(false);
  };

  // Global Worldwide Rankings with current user stats & sorting mode
  const traderRankings = useMemo(() => {
    return getTraderRankings(
      {
        name: userProfile?.name || 'Executive Trader',
        email: userProfile?.email || userSession?.email || 'executive@lurl.vip',
        avatarUrl: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        country: 'Worldwide / Executive',
        countryFlag: '🌐',
        tier: tenure.currentTier,
        profit: account.realizedPnl + totalUnrealizedPnl,
        initialBalance: account.initialBalance,
        winCount: account.winCount,
        lossCount: account.lossCount,
      },
      rankingSortBy
    );
  }, [userProfile, userSession, tenure.currentTier, account, totalUnrealizedPnl, rankingSortBy]);

  const currentUserRanking = useMemo(
    () => traderRankings.find((t) => t.isCurrentUser),
    [traderRankings]
  );
  const userRank = currentUserRanking?.rank ?? 999;
  const top1Trader = traderRankings.find((t) => t.rank === 1);
  const top2Trader = traderRankings.find((t) => t.rank === 2);
  const top3Trader = traderRankings.find((t) => t.rank === 3);

  // SVG Chart Dimensions & Coordinates
  const chartWidth = 760;
  const chartHeight = 360;
  const chartPadding = { top: 20, right: 70, bottom: 40, left: 15 };
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  // Price Scale Extents
  const { minPrice, maxPrice } = useMemo(() => {
    if (visibleCandles.length === 0) return { minPrice: 55000, maxPrice: 65000 };
    let min = Infinity;
    let max = -Infinity;
    for (const c of visibleCandles) {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (showBollinger && c.bbLower && c.bbLower < min) min = c.bbLower;
      if (showBollinger && c.bbUpper && c.bbUpper > max) max = c.bbUpper;
    }
    const pad = (max - min) * 0.08;
    return {
      minPrice: Math.floor(min - pad),
      maxPrice: Math.ceil(max + pad),
    };
  }, [visibleCandles, showBollinger]);

  const priceToY = (price: number) => {
    const range = maxPrice - minPrice || 1;
    return chartPadding.top + innerHeight - ((price - minPrice) / range) * innerHeight;
  };

  const candleSpacing = innerWidth / Math.max(1, visibleCandles.length);
  const candleWidth = Math.max(2, Math.min(10, candleSpacing * 0.72));

  // EMA Polyline Paths
  const ema20Points = useMemo(() => {
    return visibleCandles
      .map((c, i) => {
        if (!c.ema20) return null;
        const x = chartPadding.left + i * candleSpacing + candleSpacing / 2;
        const y = priceToY(c.ema20);
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [visibleCandles, candleSpacing, minPrice, maxPrice]);

  const ema50Points = useMemo(() => {
    return visibleCandles
      .map((c, i) => {
        if (!c.ema50) return null;
        const x = chartPadding.left + i * candleSpacing + candleSpacing / 2;
        const y = priceToY(c.ema50);
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [visibleCandles, candleSpacing, minPrice, maxPrice]);

  const ema200Points = useMemo(() => {
    return visibleCandles
      .map((c, i) => {
        if (!c.ema200) return null;
        const x = chartPadding.left + i * candleSpacing + candleSpacing / 2;
        const y = priceToY(c.ema200);
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [visibleCandles, candleSpacing, minPrice, maxPrice]);

  // Bollinger Cloud Polygon
  const bollingerPolygon = useMemo(() => {
    if (!showBollinger || visibleCandles.length === 0) return '';
    const upperPts: string[] = [];
    const lowerPts: string[] = [];
    visibleCandles.forEach((c, i) => {
      if (c.bbUpper && c.bbLower) {
        const x = chartPadding.left + i * candleSpacing + candleSpacing / 2;
        upperPts.push(`${x},${priceToY(c.bbUpper)}`);
        lowerPts.unshift(`${x},${priceToY(c.bbLower)}`);
      }
    });
    return [...upperPts, ...lowerPts].join(' ');
  }, [visibleCandles, showBollinger, candleSpacing, minPrice, maxPrice]);

  // Price Gridlines
  const priceGridLevels = useMemo(() => {
    const step = Math.round((maxPrice - minPrice) / 6 / 100) * 100 || 200;
    const levels: number[] = [];
    for (let p = Math.ceil(minPrice / step) * step; p <= maxPrice; p += step) {
      levels.push(p);
    }
    return levels;
  }, [minPrice, maxPrice]);

  const yToPrice = (y: number) => {
    const range = maxPrice - minPrice || 1;
    const clampedY = Math.max(chartPadding.top, Math.min(chartPadding.top + innerHeight, y));
    const normalized = (chartPadding.top + innerHeight - clampedY) / innerHeight;
    return Math.round(minPrice + normalized * range);
  };

  const candleIndexToX = (idx: number) => {
    return chartPadding.left + idx * candleSpacing + candleSpacing / 2;
  };

  // Unlocked TradingView Heikin-Ashi Candle Calculation
  const displayCandles = useMemo(() => {
    if (chartStyle !== 'heikin') return visibleCandles;
    const haList: DemoCandle[] = [];
    let prevOpen = visibleCandles[0]?.open || 60000;
    let prevClose = visibleCandles[0]?.close || 60000;

    for (let i = 0; i < visibleCandles.length; i++) {
      const c = visibleCandles[i];
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = i === 0 ? (c.open + c.close) / 2 : (prevOpen + prevClose) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);

      haList.push({
        ...c,
        open: Math.round(haOpen),
        high: Math.round(haHigh),
        low: Math.round(haLow),
        close: Math.round(haClose),
      });

      prevOpen = haOpen;
      prevClose = haClose;
    }
    return haList;
  }, [visibleCandles, chartStyle]);

  // Line & Area Points
  const linePoints = useMemo(() => {
    if (chartStyle !== 'line' && chartStyle !== 'area') return '';
    return displayCandles
      .map((c, i) => {
        const x = candleIndexToX(i);
        const y = priceToY(c.close);
        return `${x},${y}`;
      })
      .join(' ');
  }, [displayCandles, chartStyle, candleSpacing, minPrice, maxPrice]);

  const areaPolygon = useMemo(() => {
    if (chartStyle !== 'area' || displayCandles.length === 0) return '';
    const firstX = candleIndexToX(0);
    const lastX = candleIndexToX(displayCandles.length - 1);
    const bottomY = chartPadding.top + innerHeight;
    return `${firstX},${bottomY} ${linePoints} ${lastX},${bottomY}`;
  }, [linePoints, chartStyle, displayCandles]);

  // Unlocked Institutional VWAP (Volume Weighted Average Price)
  const vwapPoints = useMemo(() => {
    if (!showVwap || visibleCandles.length === 0) return '';
    let cumVol = 0;
    let cumVolPrice = 0;
    return visibleCandles
      .map((c, i) => {
        const typical = (c.high + c.low + c.close) / 3;
        cumVol += c.volume;
        cumVolPrice += typical * c.volume;
        const vwapVal = cumVol > 0 ? cumVolPrice / cumVol : typical;
        const x = candleIndexToX(i);
        const y = priceToY(vwapVal);
        return `${x},${y}`;
      })
      .join(' ');
  }, [visibleCandles, showVwap, candleSpacing, minPrice, maxPrice]);

  // Unlocked TradingView MACD (12, 26, 9) Calculation
  const macdData = useMemo(() => {
    if (!showMacd || visibleCandles.length === 0) return { list: [], maxHist: 1 };
    const k12 = 2 / (12 + 1);
    const k26 = 2 / (26 + 1);
    const k9 = 2 / (9 + 1);

    let ema12 = visibleCandles[0].close;
    let ema26 = visibleCandles[0].close;
    const macdArr: number[] = [];

    for (let i = 0; i < visibleCandles.length; i++) {
      const price = visibleCandles[i].close;
      ema12 = i === 0 ? price : price * k12 + ema12 * (1 - k12);
      ema26 = i === 0 ? price : price * k26 + ema26 * (1 - k26);
      macdArr.push(ema12 - ema26);
    }

    let signal = macdArr[0] || 0;
    let maxAbsHist = 1;
    const result = macdArr.map((m, i) => {
      signal = i === 0 ? m : m * k9 + signal * (1 - k9);
      const hist = m - signal;
      if (Math.abs(hist) > maxAbsHist) maxAbsHist = Math.abs(hist);
      return {
        macd: m,
        signal,
        histogram: hist,
      };
    });

    return { list: result, maxHist: maxAbsHist || 1 };
  }, [visibleCandles, showMacd]);

  // Svg Mouse & Interaction Coordinate Tracker
  const getSvgCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = chartWidth / (rect.width || 1);
    const scaleY = chartHeight / (rect.height || 1);

    const svgX = clientX * scaleX;
    const svgY = clientY * scaleY;

    const rawIdx = Math.floor((svgX - chartPadding.left) / candleSpacing);
    const candleIndex = Math.max(0, Math.min(visibleCandles.length - 1, rawIdx));
    let price = yToPrice(svgY);

    if (magnetMode && visibleCandles[candleIndex]) {
      const c = visibleCandles[candleIndex];
      const candidates = [c.open, c.high, c.low, c.close];
      let closest = candidates[0];
      let minD = Math.abs(price - closest);
      for (const cand of candidates) {
        const d = Math.abs(price - cand);
        if (d < minD) {
          minD = d;
          closest = cand;
        }
      }
      price = closest;
    }

    return { candleIndex, price, svgX, svgY };
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const coords = getSvgCoordinates(e);
    setCurrentHoverCoords(coords);
    if (visibleCandles[coords.candleIndex]) {
      setHoveredCandle(visibleCandles[coords.candleIndex]);
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeDrawingTool === 'cursor') return;
    const { candleIndex, price } = getSvgCoordinates(e);

    // 1. Horizontal ray: 1 click
    if (activeDrawingTool === 'horizontal') {
      playClickSound();
      const isRes = price >= currentPrice;
      const newD: ChartDrawing = {
        id: `draw-${Date.now()}`,
        type: 'horizontal',
        p1: { candleIndex, price },
        color: isRes ? '#ef4444' : '#10b981',
        text: isRes ? `Resistance $${price.toLocaleString()}` : `Support $${price.toLocaleString()}`,
      };
      setDrawings((prev) => [...prev, newD]);
      setActiveDrawingTool('cursor');
      return;
    }

    // 2. Long Position Tool (TradingView style 1:3 R:R setup)
    if (activeDrawingTool === 'long_position') {
      playSuccessChime();
      const target = Math.round(price * 1.032);
      const stop = Math.round(price * 0.988);
      const risk = price - stop;
      const reward = target - price;
      const rrRatio = Math.round((reward / (risk || 1)) * 100) / 100;
      const newD: ChartDrawing = {
        id: `draw-${Date.now()}`,
        type: 'long_position',
        p1: { candleIndex, price },
        color: '#10b981',
        rr: {
          entryPrice: price,
          targetPrice: target,
          stopLossPrice: stop,
          rrRatio,
        },
      };
      setDrawings((prev) => [...prev, newD]);
      setOrderSide('BUY');
      setLimitPrice(price.toString());
      setTakeProfitPrice(target.toString());
      setStopLossPrice(stop.toString());
      setActiveDrawingTool('cursor');
      return;
    }

    // 3. Short Position Tool (TradingView style 1:3 R:R setup)
    if (activeDrawingTool === 'short_position') {
      playSuccessChime();
      const target = Math.round(price * 0.968);
      const stop = Math.round(price * 1.012);
      const risk = stop - price;
      const reward = price - target;
      const rrRatio = Math.round((reward / (risk || 1)) * 100) / 100;
      const newD: ChartDrawing = {
        id: `draw-${Date.now()}`,
        type: 'short_position',
        p1: { candleIndex, price },
        color: '#ef4444',
        rr: {
          entryPrice: price,
          targetPrice: target,
          stopLossPrice: stop,
          rrRatio,
        },
      };
      setDrawings((prev) => [...prev, newD]);
      setOrderSide('SELL');
      setLimitPrice(price.toString());
      setTakeProfitPrice(target.toString());
      setStopLossPrice(stop.toString());
      setActiveDrawingTool('cursor');
      return;
    }

    // 4. Text Note
    if (activeDrawingTool === 'text') {
      playClickSound();
      setTextNoteModal({ open: true, candleIndex, price });
      return;
    }

    // 5. 2-Point Tools (Trendline, Fibonacci, Measure)
    if (!drawingStartPoint) {
      playClickSound();
      setDrawingStartPoint({ candleIndex, price });
    } else {
      playSuccessChime();
      const newD: ChartDrawing = {
        id: `draw-${Date.now()}`,
        type: activeDrawingTool,
        p1: drawingStartPoint,
        p2: { candleIndex, price },
        color:
          activeDrawingTool === 'trendline'
            ? '#38bdf8'
            : activeDrawingTool === 'fibonacci'
            ? '#f59e0b'
            : '#a855f7',
      };
      setDrawings((prev) => [...prev, newD]);
      setDrawingStartPoint(null);
      setActiveDrawingTool('cursor');
    }
  };

  // Save text note annotation to chart
  const handleSaveTextAnnotation = () => {
    if (!textNoteModal) return;
    playSuccessChime();
    const newDrawing: ChartDrawing = {
      id: `text-${Date.now()}`,
      type: 'text',
      p1: { candleIndex: textNoteModal.candleIndex, price: textNoteModal.price },
      color: '#f8b179',
      text: textNoteInput.trim() || 'Fair Value Gap (FVG)',
    };
    setDrawings((prev) => [...prev, newDrawing]);
    setTextNoteModal(null);
    setActiveDrawingTool('cursor');
  };

  // Smart Markup Presets
  const handleAutoSmcMarkups = () => {
    playSuccessChime();
    if (visibleCandles.length < 10) return;
    let highest = visibleCandles[0];
    let lowest = visibleCandles[0];
    let highIdx = 0;
    let lowIdx = 0;

    visibleCandles.forEach((c, i) => {
      if (c.high > highest.high) {
        highest = c;
        highIdx = i;
      }
      if (c.low < lowest.low) {
        lowest = c;
        lowIdx = i;
      }
    });

    const newDrawings: ChartDrawing[] = [
      {
        id: `smc-res-${Date.now()}`,
        type: 'horizontal',
        p1: { candleIndex: highIdx, price: highest.high },
        color: '#ef4444',
        text: `SMC EQH Liquidity Pool $${highest.high.toLocaleString()}`,
      },
      {
        id: `smc-sup-${Date.now()}`,
        type: 'horizontal',
        p1: { candleIndex: lowIdx, price: lowest.low },
        color: '#10b981',
        text: `SMC EQL Institutional Demand $${lowest.low.toLocaleString()}`,
      },
      {
        id: `smc-fvg-${Date.now()}`,
        type: 'text',
        p1: {
          candleIndex: Math.min(visibleCandles.length - 1, Math.max(0, highIdx - 5)),
          price: Math.round((highest.high + lowest.low) / 2),
        },
        color: '#38bdf8',
        text: 'FVG (Fair Value Gap) Imbalance',
      },
      {
        id: `smc-trend-${Date.now()}`,
        type: 'trendline',
        p1: { candleIndex: lowIdx, price: lowest.low },
        p2: { candleIndex: visibleCandles.length - 1, price: currentPrice },
        color: '#f59e0b',
      },
    ];

    setDrawings((prev) => [...prev, ...newDrawings]);
    setShowDrawings(true);
  };

  const handleAutoFibonacci = () => {
    playSuccessChime();
    if (visibleCandles.length < 5) return;
    let highest = visibleCandles[0];
    let lowest = visibleCandles[0];
    let highIdx = 0;
    let lowIdx = 0;

    visibleCandles.forEach((c, i) => {
      if (c.high > highest.high) {
        highest = c;
        highIdx = i;
      }
      if (c.low < lowest.low) {
        lowest = c;
        lowIdx = i;
      }
    });

    const fibDrawing: ChartDrawing = {
      id: `fib-${Date.now()}`,
      type: 'fibonacci',
      p1: { candleIndex: lowIdx, price: lowest.low },
      p2: { candleIndex: highIdx, price: highest.high },
      color: '#f59e0b',
    };

    setDrawings((prev) => [...prev, fibDrawing]);
    setShowDrawings(true);
  };

  const handleAutoRiskReward = (side: 'BUY' | 'SELL') => {
    playSuccessChime();
    const lastIdx = visibleCandles.length - 1;
    const entry = currentPrice;
    if (side === 'BUY') {
      const target = Math.round(entry * 1.03);
      const stop = Math.round(entry * 0.99);
      const risk = entry - stop;
      const reward = target - entry;
      const rrRatio = Math.round((reward / (risk || 1)) * 100) / 100;
      const newD: ChartDrawing = {
        id: `rr-long-${Date.now()}`,
        type: 'long_position',
        p1: { candleIndex: lastIdx, price: entry },
        color: '#10b981',
        rr: {
          entryPrice: entry,
          targetPrice: target,
          stopLossPrice: stop,
          rrRatio,
        },
      };
      setDrawings((prev) => [...prev, newD]);
      setOrderSide('BUY');
      setLimitPrice(entry.toString());
      setTakeProfitPrice(target.toString());
      setStopLossPrice(stop.toString());
    } else {
      const target = Math.round(entry * 0.97);
      const stop = Math.round(entry * 1.01);
      const risk = stop - entry;
      const reward = entry - target;
      const rrRatio = Math.round((reward / (risk || 1)) * 100) / 100;
      const newD: ChartDrawing = {
        id: `rr-short-${Date.now()}`,
        type: 'short_position',
        p1: { candleIndex: lastIdx, price: entry },
        color: '#ef4444',
        rr: {
          entryPrice: entry,
          targetPrice: target,
          stopLossPrice: stop,
          rrRatio,
        },
      };
      setDrawings((prev) => [...prev, newD]);
      setOrderSide('SELL');
      setLimitPrice(entry.toString());
      setTakeProfitPrice(target.toString());
      setStopLossPrice(stop.toString());
    }
  };

  const handleUndoDrawing = () => {
    playClickSound();
    setDrawings((prev) => prev.slice(0, -1));
    setDrawingStartPoint(null);
  };

  const handleClearDrawings = () => {
    playClickSound();
    setDrawings([]);
    setDrawingStartPoint(null);
  };

  const handleSnapshot = () => {
    playSuccessChime();
    setCopiedSnapshot(true);
    setTimeout(() => setCopiedSnapshot(false), 2500);
  };

  // Risk Reward calculation
  const calculatedRiskReward = useMemo(() => {
    const ep = parseFloat(limitPrice) || currentPrice;
    const tp = parseFloat(takeProfitPrice);
    const sl = parseFloat(stopLossPrice);
    if (!tp || !sl || ep === sl) return '1 : 2.0';

    if (orderSide === 'BUY') {
      const reward = Math.max(0, tp - ep);
      const risk = Math.max(0.1, ep - sl);
      return `1 : ${(reward / risk).toFixed(2)}`;
    } else {
      const reward = Math.max(0, ep - tp);
      const risk = Math.max(0.1, sl - ep);
      return `1 : ${(reward / risk).toFixed(2)}`;
    }
  }, [limitPrice, currentPrice, takeProfitPrice, stopLossPrice, orderSide]);

  return (
    <div
      className={`space-y-4 transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#080a0f] p-2 sm:p-4 overflow-y-auto flex flex-col h-screen w-screen'
          : 'w-full'
      }`}
    >
      {/* 1. Legal Disclaimer Banner: Purely Demo/Educational Strategy Backtesting */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <div>
            <strong className="text-amber-300 font-mono font-bold uppercase mr-1.5">
              Simulated Backtest Environment:
            </strong>
            <span className="text-[#e2e8f0]">
              Strictly for educational strategy validation and historical candle paper trading on Bitcoin. No real capital or financial transactions.
            </span>
          </div>
        </div>

        {/* User Tenure Tier Badge in Terminal Header */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenProfile}
            title="View your Experience Performance Table"
            className={`px-2.5 py-1 text-[11px] font-mono font-bold border flex items-center gap-1.5 cursor-pointer hover:brightness-110 transition-all ${tierStyle.bg} ${tierStyle.border}`}
            style={{ color: tierStyle.color }}
          >
            {tenure.currentTier === 'platinum' ? (
              <Crown className="w-3.5 h-3.5" />
            ) : tenure.currentTier === 'gold' ? (
              <Award className="w-3.5 h-3.5" />
            ) : (
              <Medal className="w-3.5 h-3.5" />
            )}
            <span>{tierStyle.label} TIER</span>
            <span className="text-[#9ca3af] font-normal">({tenure.daysActive}d)</span>
          </button>
        </div>
      </div>

      {/* 2. TradingView-Grade Main Terminal Frame */}
      <div className="bg-[#0b0e14] border border-[#1f2430] shadow-2xl">
        {/* Top Header Bar: Symbol, Live Price, 24h Stats & Scenario Selector */}
        <div className="p-3 border-b border-[#1f2430] flex flex-wrap items-center justify-between gap-3 bg-[#11141c]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-mono text-base font-extrabold text-white tracking-wider flex items-center gap-1.5">
                <span>BTC / USD</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  CRYPTO DEMO
                </span>
              </h2>
            </div>

            <div className="h-4 w-px bg-[#252c3d] hidden sm:block" />

            {/* Current Price display */}
            <div className="flex items-baseline gap-2 font-mono">
              <span className="text-lg sm:text-xl font-black text-white">
                ${currentPrice.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-400 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +$1,420.00 (+2.38%)
              </span>
            </div>
          </div>

          {/* Historical Scenarios & Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-[#6b7280] font-mono hidden md:inline">Backtest Scenario:</span>
            <select
              value={selectedScenario}
              onChange={(e) => handleScenarioChange(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono font-semibold bg-[#161b26] text-white border border-[#252c3d] outline-none cursor-pointer hover:border-[#d47a37]"
            >
              <option value="wyckoff">Wyckoff Spring & Accumulation</option>
              <option value="breakout">Bullish Flag Expansion</option>
              <option value="sweep">Liquidity Sweep & Short Squeeze</option>
              <option value="range">Range Scalping Volatility</option>
            </select>

            <button
              type="button"
              onClick={() => setIsAccountSettingsOpen(true)}
              className="px-2.5 py-1 text-xs font-mono text-[#f8b179] bg-[#1a202c] hover:bg-[#252d3d] border border-[#d47a37]/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Capital: ${account.initialBalance.toLocaleString()}</span>
            </button>

            {/* DIRECT "Copy URL" BUTTON IN CHART SECTION */}
            <button
              type="button"
              id="chart-header-copy-url-btn"
              onClick={handleCopyWebsiteUrl}
              title="Copy live trading chart web address to clipboard"
              className={`px-3 py-1 text-xs font-mono font-bold border flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                copiedWebsiteUrl
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-500/30'
                  : 'bg-[#18233a] hover:bg-[#233152] text-cyan-300 border-cyan-400/70 hover:text-white'
              }`}
            >
              {copiedWebsiteUrl ? <Check className="w-3.5 h-3.5 text-white animate-bounce" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedWebsiteUrl ? '✓ URL Copied!' : 'Copy URL'}</span>
            </button>

            {/* Website URL in Chart Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWebsiteUrlModal(!showWebsiteUrlModal)}
                title="View Website URL and Share Link"
                className="px-2.5 py-1 text-xs font-mono text-cyan-300 bg-[#131b2b] hover:bg-[#1a253c] border border-cyan-500/40 flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-45 transition-transform" />
                <span className="font-bold">Website URL</span>
                <ExternalLink className="w-3 h-3 text-cyan-400 opacity-70" />
              </button>

              {/* Website URL Popover Dropdown */}
              {showWebsiteUrlModal && (
                <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 bg-[#0e1118] border border-[#252c3d] p-3.5 shadow-2xl z-50 font-mono space-y-3 rounded-xl">
                  <div className="flex items-center justify-between border-b border-[#1f2638] pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#f8b179]" />
                      <span>Live Website & Standalone Access</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowWebsiteUrlModal(false)}
                      className="text-[#9ca3af] hover:text-white text-xs px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* 1. Live Running Website URL */}
                  <div>
                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>1. Full Error-Free Live Website (Full Stack)</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#121622] border border-[#1f2638] p-1.5 text-xs text-[#cbd5e1] break-all rounded-lg">
                      <span className="text-emerald-300 select-all font-mono text-[11px] leading-tight flex-1">
                        {liveWebsiteUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyWebsiteUrl}
                        className="px-2 py-1 bg-[#1a2234] hover:bg-[#25324d] text-white text-[10px] font-bold border border-emerald-500/40 shrink-0 cursor-pointer flex items-center gap-1 rounded"
                        title="Copy URL to clipboard"
                      >
                        {copiedWebsiteUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[#f8b179]" />}
                        <span>{copiedWebsiteUrl ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Standalone HTML Direct Web View */}
                  <div>
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>2. Standalone HTML Direct View (100% In-Browser)</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#121622] border border-[#1f2638] p-1.5 text-xs text-[#cbd5e1] break-all rounded-lg">
                      <span className="text-cyan-300 select-all font-mono text-[11px] leading-tight flex-1">
                        {directHtmlViewUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyHtmlViewUrl}
                        className="px-2 py-1 bg-[#1a2234] hover:bg-[#25324d] text-white text-[10px] font-bold border border-cyan-500/40 shrink-0 cursor-pointer flex items-center gap-1 rounded"
                        title="Copy standalone view URL"
                      >
                        {copiedHtmlViewUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-300" />}
                        <span>{copiedHtmlViewUrl ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1f2638] text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        openStandaloneInNewTab();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#1a2234] text-[#f8b179] hover:text-white border border-[#d47a37]/40 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Launch Standalone</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        downloadStandaloneHtmlFile('LURL.html');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#141b2b] text-cyan-300 hover:text-white border border-cyan-500/40 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>Save LURL.html</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TradingView Toolbar: Timeframes, Indicators, Chart Style, and Bar Replay Controls */}
        <div className="px-3 py-2 border-b border-[#1f2430] bg-[#0d1017] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Timeframe Selectors & Live Stream Indicator */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              {(['1m', '5m', '15m', '1H', '4H', '1D'] as TimeFrame[]).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setTimeframe(tf);
                  }}
                  className={`px-2 py-0.5 text-xs font-bold border transition-colors cursor-pointer ${
                    timeframe === tf
                      ? 'bg-[#d47a37] text-white border-[#d47a37]'
                      : 'bg-[#121622] text-[#9ca3af] hover:text-white border-[#1f2638]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Real-Time Live Feed Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-[11px] font-bold shadow-sm select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE SPOT: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              {live24hChange !== 0 && (
                <span className={live24hChange >= 0 ? 'text-emerald-300' : 'text-red-400'}>
                  ({live24hChange >= 0 ? '+' : ''}{live24hChange.toFixed(2)}%)
                </span>
              )}
            </div>
          </div>

          {/* Chart Style Switcher (TradingView Unlocked feature) */}
          <div className="flex items-center gap-1 bg-[#121622] p-0.5 border border-[#1f2638]">
            {(
              [
                { id: 'candles', label: 'Candles' },
                { id: 'hollow', label: 'Hollow' },
                { id: 'heikin', label: 'Heikin-Ashi' },
                { id: 'line', label: 'Line' },
                { id: 'area', label: 'Area' },
              ] as { id: ChartStyle; label: string }[]
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  playClickSound();
                  setChartStyle(st.id);
                }}
                className={`px-2 py-0.5 text-[10px] font-bold transition-all cursor-pointer ${
                  chartStyle === st.id
                    ? 'bg-[#252f48] text-[#f8b179] border border-[#d47a37]/50'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Indicator Toggles */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setShowEma20(!showEma20)}
              className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer ${
                showEma20
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                  : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
              }`}
            >
              EMA 20
            </button>
            <button
              type="button"
              onClick={() => setShowEma50(!showEma50)}
              className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer ${
                showEma50
                  ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                  : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
              }`}
            >
              EMA 50
            </button>
            <button
              type="button"
              onClick={() => setShowEma200(!showEma200)}
              className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer ${
                showEma200
                  ? 'bg-purple-950 text-purple-300 border-purple-500/50'
                  : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
              }`}
            >
              EMA 200
            </button>
            <button
              type="button"
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer ${
                showBollinger
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50'
                  : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
              }`}
            >
              BB (20,2)
            </button>
            <button
              type="button"
              onClick={() => setShowVwap(!showVwap)}
              className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer ${
                showVwap
                  ? 'bg-teal-950 text-teal-300 border-teal-500/50'
                  : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
              }`}
            >
              VWAP
            </button>
            <button
              type="button"
              onClick={() => setShowRsi(!showRsi)}
              className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer ${
                showRsi
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
              }`}
            >
              RSI 14
            </button>
            <button
              type="button"
              onClick={() => setShowMacd(!showMacd)}
              className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer ${
                showMacd
                  ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                  : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
              }`}
            >
              MACD
            </button>

            {/* Historical Profit-Over-Time Graph Toggle */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setBottomTab('profit-chart');
              }}
              title="View Historical Profit-Over-Time Graph (Recharts)"
              className={`px-2 py-0.5 text-[10px] font-bold border cursor-pointer flex items-center gap-1 transition-all ${
                bottomTab === 'profit-chart'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-[#121622] text-[#9ca3af] hover:text-emerald-300 border-[#1f2638]'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Profit Curve</span>
            </button>

            {/* Snapshot */}
            <button
              type="button"
              onClick={handleSnapshot}
              title="Copy Chart Snapshot Link"
              className="p-1 bg-[#121622] hover:bg-[#1a202c] text-[#9ca3af] hover:text-white border border-[#1f2638] cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* Direct Copy URL button in chart toolbar */}
            <button
              type="button"
              id="chart-toolbar-copy-url-btn"
              onClick={handleCopyWebsiteUrl}
              title="Copy chart URL to clipboard"
              className={`p-1 px-2 border cursor-pointer flex items-center gap-1 text-[10px] font-bold transition-all ${
                copiedWebsiteUrl
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-[#141c2c] hover:bg-[#1d273d] text-cyan-300 border-cyan-500/50'
              }`}
            >
              {copiedWebsiteUrl ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedWebsiteUrl ? '✓ Copied' : 'Copy URL'}</span>
            </button>

            {/* Quick Top 3 Leaderboard Button */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setBottomTab('rankings');
              }}
              title="Jump to Top 3 Global Leaderboard"
              className={`p-1 px-2 border cursor-pointer flex items-center gap-1 text-[10px] font-bold transition-all ${
                bottomTab === 'rankings'
                  ? 'bg-amber-900/80 text-amber-200 border-amber-500'
                  : 'bg-[#171d2b] hover:bg-[#20283c] text-amber-300 border-amber-500/40'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Top 3 Leaderboard</span>
            </button>

            {/* Full Web Browser Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsFullscreen(!isFullscreen);
              }}
              title={isFullscreen ? 'Exit Full Browser View' : 'Expand Full Screen in Web Browser'}
              className={`p-1 border cursor-pointer flex items-center gap-1 text-[10px] font-bold transition-all ${
                isFullscreen
                  ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                  : 'bg-[#1a2130] hover:bg-[#253047] text-[#f8b179] border-[#d47a37]/40'
              }`}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Full Browser'}</span>
            </button>
          </div>

          {/* Bar Replay Controls (TradingView Backtester Highlight!) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#131722] border border-[#252c3d]">
            <span className="text-[10px] text-[#f8b179] font-bold px-1 uppercase hidden lg:inline">
              Bar Replay:
            </span>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-2 py-1 flex items-center gap-1 font-bold text-xs cursor-pointer ${
                isPlaying
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#1e2536] text-emerald-400 hover:bg-[#283248]'
              }`}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsPlaying(false);
                setReplayIndex((prev) => Math.min(allCandles.length, prev + 1));
              }}
              title="Step forward 1 candle"
              className="p-1 bg-[#1e2536] hover:bg-[#283248] text-[#9ca3af] hover:text-white cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {/* Replay Speed */}
            <select
              value={replaySpeed}
              onChange={(e) => setReplaySpeed(parseFloat(e.target.value))}
              className="px-1.5 py-0.5 bg-[#0b0e14] text-[#cbd5e1] text-[11px] border border-[#252c3d] cursor-pointer"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
              <option value="10">10x</option>
            </select>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setReplayIndex(40);
                setIsPlaying(false);
              }}
              title="Restart backtest replay from initial bar"
              className="p-1 text-[#9ca3af] hover:text-white hover:bg-[#1f2638] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>

            <span className="text-[10px] text-[#6b7280] font-mono pl-1">
              Bar {replayIndex}/{allCandles.length}
            </span>
          </div>
        </div>

        {/* Live Account Metrics Bar */}
        <div className="px-4 py-2 bg-[#0e121b] border-b border-[#1f2430] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-[#6b7280] uppercase block">Demo Balance</span>
            <span className="font-bold text-white">${account.balance.toLocaleString()}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#6b7280] uppercase block">Total Equity</span>
            <span className="font-bold text-[#f8b179]">${liveEquity.toLocaleString()}</span>
          </div>

          <div>
            <span className="text-[10px] text-[#6b7280] uppercase block">Unrealized PnL</span>
            <span className={`font-bold ${totalUnrealizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}${totalUnrealizedPnl.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#6b7280] uppercase block">Realized PnL</span>
            <span className={`font-bold ${account.realizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {account.realizedPnl >= 0 ? '+' : ''}${account.realizedPnl.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#6b7280] uppercase block">Win Rate</span>
            <span className="font-bold text-white">
              {account.winCount + account.lossCount > 0
                ? `${((account.winCount / (account.winCount + account.lossCount)) * 100).toFixed(1)}%`
                : '0.0%'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#6b7280] uppercase block">Open Positions</span>
            <span className="font-bold text-white">{positions.length} Active</span>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleResetAccount}
              title="Reset Demo Account to Initial Capital"
              className="text-[10px] font-bold text-[#f8b179] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>Reset Account</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Left Chart + Right Order Placement Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* LEFT: Interactive Candlestick Chart Area (8 cols) */}
          <div className="lg:col-span-8 p-3 bg-[#090c12] border-b lg:border-b-0 lg:border-r border-[#1f2430] flex flex-col justify-between">
            {/* DEDICATED IN-CHART FULL WEBSITE DOWNLOADING LINK SECTION (WEB BROWSER) */}
            <div
              id="chart-full-website-download-section"
              className="mb-3 p-3 bg-gradient-to-r from-[#141824] via-[#0f131d] to-[#1c140c] border-2 border-amber-500/50 shadow-xl font-mono"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
                      FULL WEBSITE DOWNLOAD
                    </span>
                    <span className="text-xs font-bold text-white">
                      Complete LURL Platform (Offline & Web Browser Ready)
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/30 font-semibold">
                      Self-Contained .html
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] mt-1">
                    Downloads the complete website including Bitcoin simulated backtesting chart, AI Dropshipping, E-commerce, AI Startups, VIP Portal, Worldwide Leaderboard, and Codex.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* APK / Android Web App Package Download */}
                  <button
                    type="button"
                    id="chart-apk-download-anchor"
                    onClick={() => {
                      playClickSound();
                      downloadStandaloneHtmlFile('LURL-Trading-Suite.html');
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_2px_10px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                    title="Download complete offline Android & Web App APK/Package"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Download APK / Web App</span>
                  </button>

                  {/* Direct Browser Download Link */}
                  <button
                    type="button"
                    id="chart-direct-download-anchor"
                    onClick={() => {
                      playClickSound();
                      handleDirectBlobDownload();
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#d47a37] via-[#b85d19] to-[#8d3d0a] hover:from-[#e08a46] hover:to-[#a2480f] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_2px_10px_rgba(212,122,55,0.3)] transition-all cursor-pointer"
                    title="Download complete website file LURL.html to your computer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Full Website (.html)</span>
                  </button>

                  {/* Direct Browser View Link */}
                  <button
                    type="button"
                    id="chart-browser-open-link"
                    onClick={() => {
                      playClickSound();
                      openStandaloneInNewTab();
                    }}
                    className="px-2.5 py-1.5 bg-[#141824] hover:bg-[#1f2638] text-[#cbd5e1] hover:text-white border border-[#252c3d] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Launch the full standalone website in-app without 403 error"
                  >
                    <ExternalLink className="w-3 h-3 text-amber-400" />
                    <span>Launch Standalone</span>
                  </button>

                  {/* Instant Client Fallback Download */}
                  <button
                    type="button"
                    id="chart-client-blob-download-btn"
                    onClick={handleDirectBlobDownload}
                    disabled={isDownloadingHtml}
                    className="px-2.5 py-1.5 bg-[#11141c] hover:bg-[#1a202c] text-[#f8b179] border border-[#d47a37]/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    title="Generate instant offline bundle directly in client memory"
                  >
                    <Globe className="w-3 h-3 text-amber-400" />
                    <span>{isDownloadingHtml ? 'Generating...' : 'Instant File'}</span>
                  </button>

                  {/* Quick Worldwide Rank Badge */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setBottomTab('rankings');
                    }}
                    className={`px-2 py-1 text-[10px] font-bold border flex items-center gap-1 transition-all cursor-pointer ${
                      userRank === 1
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                        : userRank === 2
                        ? 'bg-slate-300/20 text-slate-200 border-slate-300'
                        : userRank === 3
                        ? 'bg-amber-700/20 text-amber-200 border-amber-600'
                        : 'bg-[#141824] text-[#9ca3af] border-[#252c3d] hover:text-white'
                    }`}
                    title="Click to view Worldwide Rankings & Top 3 Podium"
                  >
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span>
                      {userRank === 1
                        ? '🥇 1st Worldwide'
                        : userRank === 2
                        ? '🥈 2nd Worldwide'
                        : userRank === 3
                        ? '🥉 3rd Worldwide'
                        : `Rank #${userRank}`}
                    </span>
                  </button>
                </div>
              </div>

              {/* Chart Download & Live Links Hub (Direct in Chart) */}
              <div className="mt-2.5 pt-2.5 border-t border-[#1f2638] flex flex-col gap-2 bg-[#090d16]/80 p-3 rounded-xl border border-cyan-500/20 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-[#f8b179]" />
                      Download Files & Standalone Code (Chart Hub)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                      100% Zero-Error
                    </span>
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Download LURL.html */}
                    <button
                      type="button"
                      id="chart-download-html-btn"
                      onClick={handleDirectBlobDownload}
                      className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-[#d47a37] to-[#9e460c] hover:from-[#e58a46] hover:to-[#b85310] text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                      title="Download complete autonomous LURL.html website"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloadingHtml ? 'Downloading...' : 'Download LURL.html'}</span>
                    </button>

                    {/* Download LURL.css */}
                    <button
                      type="button"
                      id="chart-download-css-btn"
                      onClick={handleDirectCssDownload}
                      className="px-3 py-1.5 text-xs font-bold bg-[#141e30] hover:bg-[#1f2f4c] text-cyan-300 border border-cyan-500/40 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                      title="Download standalone LURL.css stylesheet"
                    >
                      <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isDownloadingCss ? 'Exporting...' : 'Export LURL.css'}</span>
                    </button>

                    {/* Open in Browser Actions */}
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        openStandaloneInNewTab();
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 hover:text-white border border-emerald-500/40 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      title="Open full error-free live website in a new tab (no 403 or 404)"
                    >
                      <Globe className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Open Website ↗</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        openStandaloneInNewTab();
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-[#111622] hover:bg-[#192233] text-cyan-300 hover:text-white border border-cyan-500/40 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                      title="Open standalone zero-dependency HTML view in a new tab (no 403 or 404)"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Open Standalone ↗</span>
                    </button>
                  </div>
                </div>

                {/* Direct Links Grid with 1-Click Copy */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1.5 border-t border-[#182133]">
                  {/* Standalone HTML Direct View URL */}
                  <div className="flex items-center justify-between gap-1.5 bg-[#07090e] px-2.5 py-1.5 rounded-lg border border-cyan-500/30">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-cyan-400 font-mono font-bold shrink-0 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-cyan-400" />
                        Standalone View:
                      </span>
                      <code className="text-[11px] text-cyan-200 select-all truncate font-mono">
                        {directHtmlViewUrl}
                      </code>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          openStandaloneInNewTab();
                        }}
                        className="px-1.5 py-0.5 text-[10px] font-bold bg-[#131b2b] text-cyan-300 hover:text-white border border-cyan-500/40 rounded cursor-pointer"
                        title="Open in new tab via in-memory Blob (no 403 or 404)"
                      >
                        Open ↗
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyHtmlViewUrl}
                        className="px-2 py-0.5 text-[10px] font-bold bg-[#141a29] hover:bg-[#1f283d] text-cyan-300 border border-cyan-500/30 rounded cursor-pointer transition-colors"
                        title="Copy Standalone View URL"
                      >
                        {copiedHtmlViewUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* HTML Direct Download Link */}
                  <div className="flex items-center justify-between gap-1.5 bg-[#07090e] px-2.5 py-1.5 rounded-lg border border-[#20283a]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-[#f8b179] font-mono font-bold shrink-0">HTML File URL:</span>
                      <code className="text-[11px] text-gray-300 select-all truncate font-mono">
                        {directDownloadUrl}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyDownloadLink}
                      className="px-2 py-0.5 text-[10px] font-bold bg-[#141a29] hover:bg-[#1f283d] text-[#f8b179] border border-[#d47a37]/30 rounded cursor-pointer shrink-0 transition-colors"
                      title="Copy HTML direct download URL"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* CSS Link */}
                  <div className="flex items-center justify-between gap-1.5 bg-[#07090e] px-2.5 py-1.5 rounded-lg border border-[#20283a]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-cyan-400 font-mono font-bold shrink-0">CSS URL:</span>
                      <code className="text-[11px] text-cyan-200 select-all truncate font-mono">
                        {directDownloadCssUrl}
                      </code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCssDownloadLink}
                      className="px-2 py-0.5 text-[10px] font-bold bg-[#141a29] hover:bg-[#1f283d] text-cyan-300 border border-cyan-500/30 rounded cursor-pointer shrink-0 transition-colors"
                      title="Copy CSS stylesheet URL"
                    >
                      {copiedCssLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Full Error-Free Live Running Website Link */}
                  <div className="flex items-center justify-between gap-1.5 bg-[#07090e] px-2.5 py-1.5 rounded-lg border border-emerald-500/30">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold shrink-0 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-emerald-400" />
                        Full Live Website:
                      </span>
                      <code className="text-[11px] text-emerald-200 select-all truncate font-mono">
                        {liveWebsiteUrl}
                      </code>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <a
                        href={liveWebsiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-1.5 py-0.5 text-[10px] font-bold bg-[#112217] text-emerald-300 hover:text-white border border-emerald-500/40 rounded"
                        title="Open live website in new tab"
                      >
                        Open
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyWebsiteUrl}
                        className="px-2 py-0.5 text-[10px] font-bold bg-[#141a29] hover:bg-[#1f283d] text-emerald-300 border border-emerald-500/30 rounded cursor-pointer transition-colors"
                        title="Copy live website URL"
                      >
                        {copiedWebsiteUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Info Header: OHLC, Indicator Values & Smart Auto-Markups */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#9ca3af] pb-2 border-b border-[#181d2a]">
              <div className="flex items-center gap-3">
                <span>O: <strong className="text-white">${(hoveredCandle || currentCandle).open.toLocaleString()}</strong></span>
                <span>H: <strong className="text-emerald-400">${(hoveredCandle || currentCandle).high.toLocaleString()}</strong></span>
                <span>L: <strong className="text-red-400">${(hoveredCandle || currentCandle).low.toLocaleString()}</strong></span>
                <span>C: <strong className="text-white">${(hoveredCandle || currentCandle).close.toLocaleString()}</strong></span>
              </div>

              {/* Smart Auto Markups & Indicator values */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {showEma20 && <span className="text-cyan-400 text-[10px]">EMA20: {(hoveredCandle || currentCandle).ema20}</span>}
                {showEma50 && <span className="text-amber-400 text-[10px]">EMA50: {(hoveredCandle || currentCandle).ema50}</span>}
                {showVwap && <span className="text-teal-400 text-[10px]">VWAP: Active</span>}
                {showRsi && <span className="text-emerald-400 text-[10px]">RSI: {(hoveredCandle || currentCandle).rsi}</span>}

                {/* Instant Analysis Presets */}
                <div className="flex items-center gap-1 pl-2 border-l border-[#1f2638]">
                  <button
                    type="button"
                    onClick={handleAutoSmcMarkups}
                    className="px-1.5 py-0.5 bg-[#141d2d] hover:bg-[#1f2d47] text-[#38bdf8] border border-[#38bdf8]/40 text-[10px] font-bold cursor-pointer"
                    title="Auto-detect Smart Money Concepts (SMC): Liquidity sweeps, Demand/Supply pools & FVG"
                  >
                    Auto SMC
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFibonacci}
                    className="px-1.5 py-0.5 bg-[#1c1810] hover:bg-[#2c2414] text-[#f59e0b] border border-[#f59e0b]/40 text-[10px] font-bold cursor-pointer"
                    title="Auto-draw Fibonacci Retracement across visible swing high and low"
                  >
                    Auto Fib
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoRiskReward('BUY')}
                    className="px-1.5 py-0.5 bg-[#0f2419] hover:bg-[#163826] text-[#22c55e] border border-[#22c55e]/40 text-[10px] font-bold cursor-pointer"
                    title="Auto 1:3 Long Risk-to-Reward Position Box"
                  >
                    1:3 Long
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAutoRiskReward('SELL')}
                    className="px-1.5 py-0.5 bg-[#291214] hover:bg-[#3f191c] text-[#ef4444] border border-[#ef4444]/40 text-[10px] font-bold cursor-pointer"
                    title="Auto 1:3 Short Risk-to-Reward Position Box"
                  >
                    1:3 Short
                  </button>
                </div>
              </div>
            </div>

            {/* Active Drawing Tool Banner Notification */}
            {activeDrawingTool !== 'cursor' && (
              <div className="mt-1.5 px-2.5 py-1 bg-[#1a2333] border border-[#38bdf8]/50 text-xs text-[#38bdf8] font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    Active Tool: <strong className="uppercase text-white">{activeDrawingTool.replace('_', ' ')}</strong>
                    {drawingStartPoint ? ' — Click second anchor point on the chart' : ' — Click on the chart to set first point'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDrawingTool('cursor');
                    setDrawingStartPoint(null);
                  }}
                  className="text-[10px] text-[#9ca3af] hover:text-white underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Main Trading Area: Left Drawing Toolbar Dock + Interactive SVG Chart Canvas */}
            <div className="flex items-stretch my-2 bg-[#06080d] border border-[#1a202e] relative">
              {/* Left Vertical TradingView Drawing Dock */}
              <div className="w-10 bg-[#0c1018] border-r border-[#181d2a] p-1 flex flex-col items-center justify-between shrink-0 select-none z-10">
                <div className="flex flex-col items-center gap-1">
                  {/* AI Chatbot Icon in the Slidebar */}
                  <button
                    type="button"
                    id="slidebar-ai-chatbot-btn"
                    onClick={() => {
                      playClickSound();
                      setIsAiChatSidebarOpen(!isAiChatSidebarOpen);
                    }}
                    title={isAiChatSidebarOpen ? 'Close AI Chatbot Slidebar' : 'Open AI Chatbot Slidebar (Real-time Trading Co-Pilot)'}
                    className={`p-1.5 rounded transition-all cursor-pointer relative group ${
                      isAiChatSidebarOpen
                        ? 'bg-gradient-to-b from-[#d47a37] to-[#b85d19] text-white shadow-[0_0_12px_rgba(212,122,55,0.6)]'
                        : 'text-[#f8b179] bg-[#d47a37]/15 hover:bg-[#d47a37]/30 hover:text-white border border-[#d47a37]/50'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
                  </button>

                  <div className="w-6 h-px bg-[#1e2536] my-0.5" />

                  {/* Cursor / Crosshair */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveDrawingTool('cursor');
                      setDrawingStartPoint(null);
                    }}
                    title="Crosshair Cursor (Inspect & Pan)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      activeDrawingTool === 'cursor'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#192132]'
                    }`}
                  >
                    <MousePointer className="w-4 h-4" />
                  </button>

                  {/* Trendline */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveDrawingTool('trendline');
                      setDrawingStartPoint(null);
                    }}
                    title="Trendline Tool (2-point line with delta %)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      activeDrawingTool === 'trendline'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#192132]'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>

                  {/* Horizontal Ray (Support / Resistance) */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveDrawingTool('horizontal');
                      setDrawingStartPoint(null);
                    }}
                    title="Horizontal Ray (Support / Resistance Level)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      activeDrawingTool === 'horizontal'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#192132]'
                    }`}
                  >
                    <Split className="w-4 h-4" />
                  </button>

                  {/* Fibonacci Retracement */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveDrawingTool('fibonacci');
                      setDrawingStartPoint(null);
                    }}
                    title="Fibonacci Retracement (Golden pocket 61.8% highlight)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      activeDrawingTool === 'fibonacci'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#192132]'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </button>

                  {/* Long Position Risk-to-Reward Tool */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveDrawingTool('long_position');
                      setDrawingStartPoint(null);
                    }}
                    title="Long Position Tool (TradingView 1:3 R:R Target Box)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      activeDrawingTool === 'long_position'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-400 hover:text-emerald-300 hover:bg-[#192132]'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                  </button>

                  {/* Short Position Risk-to-Reward Tool */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveDrawingTool('short_position');
                      setDrawingStartPoint(null);
                    }}
                    title="Short Position Tool (TradingView 1:3 R:R Target Box)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      activeDrawingTool === 'short_position'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-red-400 hover:text-red-300 hover:bg-[#192132]'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </button>

                  {/* Text Note Annotation */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveDrawingTool('text');
                      setDrawingStartPoint(null);
                    }}
                    title="Text Note Annotation (Chart Callout)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      activeDrawingTool === 'text'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#192132]'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                  </button>

                  {/* Measure / Ruler */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveDrawingTool('measure');
                      setDrawingStartPoint(null);
                    }}
                    title="Measure Tool (Distance, bars & % delta)"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      activeDrawingTool === 'measure'
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#192132]'
                    }`}
                  >
                    <Ruler className="w-4 h-4" />
                  </button>
                </div>

                {/* Lower Utilities: Magnet, Hide, Undo, Clear */}
                <div className="flex flex-col items-center gap-1 pt-2 border-t border-[#181d2a]">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setMagnetMode(!magnetMode);
                    }}
                    title={magnetMode ? 'Magnet Mode Enabled (Snaps to OHLC)' : 'Magnet Mode Disabled'}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      magnetMode ? 'text-amber-400 bg-amber-400/10' : 'text-[#6b7280] hover:text-white'
                    }`}
                  >
                    <Magnet className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setShowDrawings(!showDrawings);
                    }}
                    title={showDrawings ? 'Hide All Drawings' : 'Show All Drawings'}
                    className="p-1.5 rounded text-[#9ca3af] hover:text-white hover:bg-[#192132] cursor-pointer"
                  >
                    {showDrawings ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleUndoDrawing}
                    disabled={drawings.length === 0}
                    title="Undo Last Drawing"
                    className="p-1.5 rounded text-[#9ca3af] hover:text-white hover:bg-[#192132] disabled:opacity-30 cursor-pointer"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleClearDrawings}
                    disabled={drawings.length === 0}
                    title="Clear All Drawings"
                    className="p-1.5 rounded text-[#9ca3af] hover:text-red-400 hover:bg-[#192132] disabled:opacity-30 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive SVG Chart Container */}
              <div className="relative flex-1 overflow-hidden" ref={containerRef}>
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-auto cursor-crosshair select-none"
                  onMouseMove={handleSvgMouseMove}
                  onClick={handleSvgClick}
                  onMouseLeave={() => {
                    setHoveredCandle(null);
                    setCurrentHoverCoords(null);
                  }}
                >
                  {/* Horizontal Gridlines & Price Labels */}
                  {priceGridLevels.map((p) => {
                    const y = priceToY(p);
                    return (
                      <g key={p}>
                        <line
                          x1={chartPadding.left}
                          y1={y}
                          x2={chartWidth - chartPadding.right}
                          y2={y}
                          stroke="#151b26"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />
                        <text
                          x={chartWidth - chartPadding.right + 6}
                          y={y + 3}
                          fill="#6b7280"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          ${p.toLocaleString()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Bollinger Bands Shaded Area */}
                  {showBollinger && bollingerPolygon && (
                    <polygon points={bollingerPolygon} fill="rgba(99, 102, 241, 0.08)" />
                  )}

                  {/* Area Chart Gradient Fill */}
                  {chartStyle === 'area' && areaPolygon && (
                    <polygon points={areaPolygon} fill="rgba(212, 122, 55, 0.18)" />
                  )}

                  {/* Line Chart Polyline */}
                  {(chartStyle === 'line' || chartStyle === 'area') && linePoints && (
                    <polyline points={linePoints} fill="none" stroke="#f8b179" strokeWidth="2" />
                  )}

                  {/* EMA Indicator Lines */}
                  {showEma20 && ema20Points && (
                    <polyline points={ema20Points} fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                  )}
                  {showEma50 && ema50Points && (
                    <polyline points={ema50Points} fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                  )}
                  {showEma200 && ema200Points && (
                    <polyline points={ema200Points} fill="none" stroke="#a855f7" strokeWidth="1.5" />
                  )}

                  {/* VWAP Polyline */}
                  {showVwap && vwapPoints && (
                    <polyline points={vwapPoints} fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="4 2" />
                  )}

                  {/* Candlesticks Rendering (Solid, Hollow, or Heikin-Ashi) */}
                  {chartStyle !== 'line' &&
                    chartStyle !== 'area' &&
                    displayCandles.map((candle, idx) => {
                      const isBull = candle.close >= candle.open;
                      const color = isBull ? '#22c55e' : '#ef4444';
                      const xCenter = candleIndexToX(idx);
                      const wickX = xCenter;
                      const wickYHigh = priceToY(candle.high);
                      const wickYLow = priceToY(candle.low);
                      const bodyY = priceToY(Math.max(candle.open, candle.close));
                      const bodyHeight = Math.max(2, Math.abs(priceToY(candle.open) - priceToY(candle.close)));
                      const bodyX = xCenter - candleWidth / 2;

                      return (
                        <g
                          key={candle.time}
                          onMouseEnter={() => setHoveredCandle(candle)}
                          className="transition-opacity hover:opacity-80"
                        >
                          {/* Upper & Lower Wick */}
                          <line
                            x1={wickX}
                            y1={wickYHigh}
                            x2={wickX}
                            y2={wickYLow}
                            stroke={color}
                            strokeWidth="1"
                          />
                          {/* Real Body */}
                          <rect
                            x={bodyX}
                            y={bodyY}
                            width={candleWidth}
                            height={bodyHeight}
                            fill={chartStyle === 'hollow' && isBull ? '#090c12' : color}
                            stroke={color}
                            strokeWidth="1"
                          />
                        </g>
                      );
                    })}

                  {/* Current Price Ray (Right border indicator) */}
                  <line
                    x1={chartPadding.left}
                    y1={priceToY(currentPrice)}
                    x2={chartWidth - chartPadding.right}
                    y2={priceToY(currentPrice)}
                    stroke="#f8b179"
                    strokeDasharray="2 2"
                    strokeWidth="1"
                  />
                  {/* Price Tag Pill */}
                  <rect
                    x={chartWidth - chartPadding.right + 2}
                    y={priceToY(currentPrice) - 8}
                    width={64}
                    height={16}
                    fill="#d47a37"
                  />
                  <text
                    x={chartWidth - chartPadding.right + 6}
                    y={priceToY(currentPrice) + 4}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    ${currentPrice.toLocaleString()}
                  </text>

                  {/* Active Open Positions Entry Level Lines on Chart */}
                  {positions.map((pos) => {
                    const y = priceToY(pos.entryPrice);
                    const color = pos.side === 'BUY' ? '#22c55e' : '#ef4444';
                    return (
                      <g key={pos.id}>
                        <line
                          x1={chartPadding.left}
                          y1={y}
                          x2={chartWidth - chartPadding.right}
                          y2={y}
                          stroke={color}
                          strokeWidth="1"
                          strokeDasharray="4 2"
                        />
                        <rect
                          x={chartPadding.left + 5}
                          y={y - 7}
                          width={90}
                          height={14}
                          fill={pos.side === 'BUY' ? '#14532d' : '#7f1d1d'}
                          stroke={color}
                        />
                        <text
                          x={chartPadding.left + 8}
                          y={y + 3}
                          fill="#ffffff"
                          fontSize="8"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {pos.side} {pos.leverage}x @ ${pos.entryPrice}
                        </text>
                      </g>
                    );
                  })}

                  {/* User Drawings Layer (TradingView Unlocked Capabilities) */}
                  {showDrawings &&
                    drawings.map((d) => {
                      // 1. Horizontal Ray
                      if (d.type === 'horizontal') {
                        const y = priceToY(d.p1.price);
                        return (
                          <g key={d.id}>
                            <line
                              x1={chartPadding.left}
                              y1={y}
                              x2={chartWidth - chartPadding.right}
                              y2={y}
                              stroke={d.color || '#38bdf8'}
                              strokeWidth="1.5"
                              strokeDasharray="4 2"
                            />
                            <rect
                              x={chartWidth - chartPadding.right + 2}
                              y={y - 8}
                              width={64}
                              height={16}
                              fill={d.color || '#38bdf8'}
                            />
                            <text
                              x={chartWidth - chartPadding.right + 6}
                              y={y + 4}
                              fill="#ffffff"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              ${d.p1.price.toLocaleString()}
                            </text>
                            {d.text && (
                              <text
                                x={chartPadding.left + 6}
                                y={y - 4}
                                fill={d.color || '#38bdf8'}
                                fontSize="9"
                                fontWeight="bold"
                                fontFamily="monospace"
                              >
                                {d.text}
                              </text>
                            )}
                          </g>
                        );
                      }

                      // 2. Trendline
                      if (d.type === 'trendline' && d.p2) {
                        const x1 = candleIndexToX(d.p1.candleIndex);
                        const y1 = priceToY(d.p1.price);
                        const x2 = candleIndexToX(d.p2.candleIndex);
                        const y2 = priceToY(d.p2.price);
                        const midX = (x1 + x2) / 2;
                        const midY = (y1 + y2) / 2;
                        const deltaPrice = d.p2.price - d.p1.price;
                        const pct = ((deltaPrice / (d.p1.price || 1)) * 100).toFixed(1);
                        return (
                          <g key={d.id}>
                            <line
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke={d.color || '#38bdf8'}
                              strokeWidth="2"
                            />
                            <circle cx={x1} cy={y1} r="3.5" fill={d.color || '#38bdf8'} />
                            <circle cx={x2} cy={y2} r="3.5" fill={d.color || '#38bdf8'} />
                            <rect
                              x={midX - 35}
                              y={midY - 14}
                              width={70}
                              height={14}
                              fill="#0e131f"
                              stroke={d.color || '#38bdf8'}
                              strokeWidth="1"
                            />
                            <text
                              x={midX}
                              y={midY - 3}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {deltaPrice >= 0 ? '+' : ''}${deltaPrice} ({pct}%)
                            </text>
                          </g>
                        );
                      }

                      // 3. Fibonacci Retracement
                      if (d.type === 'fibonacci' && d.p2) {
                        const lowPrice = Math.min(d.p1.price, d.p2.price);
                        const highPrice = Math.max(d.p1.price, d.p2.price);
                        const diff = highPrice - lowPrice;
                        const levels = [
                          { ratio: 0, label: '0.0% (Base)', color: '#64748b' },
                          { ratio: 0.236, label: '23.6%', color: '#94a3b8' },
                          { ratio: 0.382, label: '38.2%', color: '#38bdf8' },
                          { ratio: 0.5, label: '50.0% (Eq)', color: '#22c55e' },
                          { ratio: 0.618, label: '61.8% Golden', color: '#f59e0b' },
                          { ratio: 0.786, label: '78.6%', color: '#ec4899' },
                          { ratio: 1.0, label: '100.0% (High)', color: '#ef4444' },
                        ];
                        const y382 = priceToY(lowPrice + diff * 0.382);
                        const y618 = priceToY(lowPrice + diff * 0.618);
                        const goldenHeight = Math.abs(y382 - y618);
                        const goldenY = Math.min(y382, y618);
                        return (
                          <g key={d.id}>
                            <rect
                              x={chartPadding.left}
                              y={goldenY}
                              width={innerWidth}
                              height={goldenHeight}
                              fill="rgba(245, 158, 11, 0.12)"
                              stroke="#f59e0b"
                              strokeWidth="0.5"
                              strokeDasharray="2 2"
                            />
                            {levels.map((lvl) => {
                              const p = lowPrice + diff * lvl.ratio;
                              const y = priceToY(p);
                              return (
                                <g key={lvl.ratio}>
                                  <line
                                    x1={chartPadding.left}
                                    y1={y}
                                    x2={chartWidth - chartPadding.right}
                                    y2={y}
                                    stroke={lvl.color}
                                    strokeWidth={lvl.ratio === 0.618 ? '1.5' : '1'}
                                    strokeDasharray={lvl.ratio === 0.618 ? 'none' : '3 3'}
                                  />
                                  <text
                                    x={chartPadding.left + 4}
                                    y={y - 3}
                                    fill={lvl.color}
                                    fontSize="8"
                                    fontWeight={lvl.ratio === 0.618 ? 'bold' : 'normal'}
                                    fontFamily="monospace"
                                  >
                                    {lvl.label}: ${Math.round(p).toLocaleString()}
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        );
                      }

                      // 4. Long Position Tool (1:3 R:R Box)
                      if (d.type === 'long_position' && d.rr) {
                        const entryX = candleIndexToX(d.p1.candleIndex);
                        const boxWidth = Math.min(220, innerWidth - (entryX - chartPadding.left));
                        const yEntry = priceToY(d.rr.entryPrice);
                        const yTarget = priceToY(d.rr.targetPrice);
                        const yStop = priceToY(d.rr.stopLossPrice);
                        const targetHeight = Math.abs(yEntry - yTarget);
                        const stopHeight = Math.abs(yStop - yEntry);
                        const rewardPct = (((d.rr.targetPrice - d.rr.entryPrice) / d.rr.entryPrice) * 100).toFixed(2);
                        const riskPct = (((d.rr.entryPrice - d.rr.stopLossPrice) / d.rr.entryPrice) * 100).toFixed(2);
                        return (
                          <g key={d.id}>
                            <rect
                              x={entryX}
                              y={yTarget}
                              width={boxWidth}
                              height={targetHeight}
                              fill="rgba(34, 197, 94, 0.18)"
                              stroke="#22c55e"
                              strokeWidth="1"
                            />
                            <rect
                              x={entryX}
                              y={yEntry}
                              width={boxWidth}
                              height={stopHeight}
                              fill="rgba(239, 68, 68, 0.18)"
                              stroke="#ef4444"
                              strokeWidth="1"
                            />
                            <line
                              x1={entryX}
                              y1={yEntry}
                              x2={entryX + boxWidth}
                              y2={yEntry}
                              stroke="#38bdf8"
                              strokeWidth="1.5"
                            />
                            <rect
                              x={entryX + 6}
                              y={yEntry - 16}
                              width={130}
                              height={14}
                              fill="#0b0e14"
                              stroke="#38bdf8"
                              strokeWidth="1"
                            />
                            <text
                              x={entryX + 10}
                              y={yEntry - 5}
                              fill="#38bdf8"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              Risk/Reward: 1 : {d.rr.rrRatio}
                            </text>
                            <text
                              x={entryX + 6}
                              y={yTarget + 10}
                              fill="#22c55e"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              TP: ${d.rr.targetPrice.toLocaleString()} (+{rewardPct}%)
                            </text>
                            <text
                              x={entryX + 6}
                              y={yStop - 4}
                              fill="#ef4444"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              SL: ${d.rr.stopLossPrice.toLocaleString()} (-{riskPct}%)
                            </text>
                          </g>
                        );
                      }

                      // 5. Short Position Tool (1:3 R:R Box)
                      if (d.type === 'short_position' && d.rr) {
                        const entryX = candleIndexToX(d.p1.candleIndex);
                        const boxWidth = Math.min(220, innerWidth - (entryX - chartPadding.left));
                        const yEntry = priceToY(d.rr.entryPrice);
                        const yTarget = priceToY(d.rr.targetPrice);
                        const yStop = priceToY(d.rr.stopLossPrice);
                        const stopHeight = Math.abs(yEntry - yStop);
                        const targetHeight = Math.abs(yTarget - yEntry);
                        const rewardPct = (((d.rr.entryPrice - d.rr.targetPrice) / d.rr.entryPrice) * 100).toFixed(2);
                        const riskPct = (((d.rr.stopLossPrice - d.rr.entryPrice) / d.rr.entryPrice) * 100).toFixed(2);
                        return (
                          <g key={d.id}>
                            <rect
                              x={entryX}
                              y={yStop}
                              width={boxWidth}
                              height={stopHeight}
                              fill="rgba(239, 68, 68, 0.18)"
                              stroke="#ef4444"
                              strokeWidth="1"
                            />
                            <rect
                              x={entryX}
                              y={yEntry}
                              width={boxWidth}
                              height={targetHeight}
                              fill="rgba(34, 197, 94, 0.18)"
                              stroke="#22c55e"
                              strokeWidth="1"
                            />
                            <line
                              x1={entryX}
                              y1={yEntry}
                              x2={entryX + boxWidth}
                              y2={yEntry}
                              stroke="#38bdf8"
                              strokeWidth="1.5"
                            />
                            <rect
                              x={entryX + 6}
                              y={yEntry - 16}
                              width={130}
                              height={14}
                              fill="#0b0e14"
                              stroke="#38bdf8"
                              strokeWidth="1"
                            />
                            <text
                              x={entryX + 10}
                              y={yEntry - 5}
                              fill="#38bdf8"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              Risk/Reward: 1 : {d.rr.rrRatio}
                            </text>
                            <text
                              x={entryX + 6}
                              y={yStop + 10}
                              fill="#ef4444"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              SL: ${d.rr.stopLossPrice.toLocaleString()} (-{riskPct}%)
                            </text>
                            <text
                              x={entryX + 6}
                              y={yTarget - 4}
                              fill="#22c55e"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              TP: ${d.rr.targetPrice.toLocaleString()} (+{rewardPct}%)
                            </text>
                          </g>
                        );
                      }

                      // 6. Text Note
                      if (d.type === 'text') {
                        const x = candleIndexToX(d.p1.candleIndex);
                        const y = priceToY(d.p1.price);
                        return (
                          <g key={d.id}>
                            <circle cx={x} cy={y} r="3" fill="#f8b179" />
                            <rect
                              x={x - 4}
                              y={y - 20}
                              width={Math.max(60, (d.text?.length || 10) * 6 + 14)}
                              height={16}
                              fill="#111624"
                              stroke="#d47a37"
                              strokeWidth="1"
                            />
                            <text
                              x={x + 2}
                              y={y - 9}
                              fill="#f8b179"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              📌 {d.text}
                            </text>
                          </g>
                        );
                      }

                      // 7. Measure Ruler
                      if (d.type === 'measure' && d.p2) {
                        const x1 = candleIndexToX(d.p1.candleIndex);
                        const y1 = priceToY(d.p1.price);
                        const x2 = candleIndexToX(d.p2.candleIndex);
                        const y2 = priceToY(d.p2.price);
                        const rectX = Math.min(x1, x2);
                        const rectY = Math.min(y1, y2);
                        const rectW = Math.abs(x2 - x1);
                        const rectH = Math.abs(y2 - y1);
                        const bars = Math.abs(d.p2.candleIndex - d.p1.candleIndex);
                        const deltaP = d.p2.price - d.p1.price;
                        const deltaPct = (((d.p2.price - d.p1.price) / (d.p1.price || 1)) * 100).toFixed(2);
                        return (
                          <g key={d.id}>
                            <rect
                              x={rectX}
                              y={rectY}
                              width={rectW}
                              height={rectH}
                              fill="rgba(56, 189, 248, 0.15)"
                              stroke="#38bdf8"
                              strokeWidth="1"
                              strokeDasharray="2 2"
                            />
                            <rect
                              x={rectX + rectW / 2 - 55}
                              y={rectY + rectH / 2 - 10}
                              width={110}
                              height={20}
                              fill="#0b0e14"
                              stroke="#38bdf8"
                              strokeWidth="1"
                            />
                            <text
                              x={rectX + rectW / 2}
                              y={rectY + rectH / 2 + 3}
                              textAnchor="middle"
                              fill="#38bdf8"
                              fontSize="8"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {bars} bars | {deltaP >= 0 ? '+' : ''}${deltaP} ({deltaPct}%)
                            </text>
                          </g>
                        );
                      }

                      return null;
                    })}

                  {/* In-progress drawing preview line/box */}
                  {drawingStartPoint && currentHoverCoords && (
                    <g pointerEvents="none">
                      {activeDrawingTool === 'trendline' && (
                        <line
                          x1={candleIndexToX(drawingStartPoint.candleIndex)}
                          y1={priceToY(drawingStartPoint.price)}
                          x2={currentHoverCoords.svgX}
                          y2={currentHoverCoords.svgY}
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                      )}
                      {activeDrawingTool === 'measure' && (
                        <rect
                          x={Math.min(candleIndexToX(drawingStartPoint.candleIndex), currentHoverCoords.svgX)}
                          y={Math.min(priceToY(drawingStartPoint.price), currentHoverCoords.svgY)}
                          width={Math.abs(currentHoverCoords.svgX - candleIndexToX(drawingStartPoint.candleIndex))}
                          height={Math.abs(currentHoverCoords.svgY - priceToY(drawingStartPoint.price))}
                          fill="rgba(56, 189, 248, 0.15)"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}
                    </g>
                  )}

                  {/* Interactive Crosshair Overlay & Price/Time Pills */}
                  {currentHoverCoords && (
                    <g pointerEvents="none">
                      {/* Vertical Time Line */}
                      <line
                        x1={currentHoverCoords.svgX}
                        y1={chartPadding.top}
                        x2={currentHoverCoords.svgX}
                        y2={chartPadding.top + innerHeight}
                        stroke="#475569"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      {/* Horizontal Price Line */}
                      <line
                        x1={chartPadding.left}
                        y1={currentHoverCoords.svgY}
                        x2={chartWidth - chartPadding.right}
                        y2={currentHoverCoords.svgY}
                        stroke="#475569"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                      {/* Dynamic Axis Price Tag */}
                      <rect
                        x={chartWidth - chartPadding.right + 2}
                        y={currentHoverCoords.svgY - 8}
                        width={64}
                        height={16}
                        fill="#1e293b"
                        stroke="#475569"
                        strokeWidth="0.8"
                      />
                      <text
                        x={chartWidth - chartPadding.right + 6}
                        y={currentHoverCoords.svgY + 4}
                        fill="#38bdf8"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        ${currentHoverCoords.price.toLocaleString()}
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* Right Vertical Slidebar Rail (TradingView layout) */}
              <div className="w-10 bg-[#0c1018] border-l border-[#181d2a] p-1 flex flex-col items-center justify-start gap-1 shrink-0 select-none z-10 hidden sm:flex">
                <button
                  type="button"
                  id="right-slidebar-ai-chatbot-btn"
                  onClick={() => {
                    playClickSound();
                    setIsAiChatSidebarOpen(!isAiChatSidebarOpen);
                  }}
                  title={isAiChatSidebarOpen ? 'Close AI Chatbot Slidebar' : 'Open AI Chatbot Slidebar'}
                  className={`p-1.5 rounded transition-all cursor-pointer relative group ${
                    isAiChatSidebarOpen
                      ? 'bg-gradient-to-b from-[#d47a37] to-[#b85d19] text-white shadow-md'
                      : 'text-[#f8b179] bg-[#d47a37]/15 hover:bg-[#d47a37]/30 hover:text-white border border-[#d47a37]/50'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
                </button>
              </div>

              {/* In-Chart AI Chatbot Slide-out Panel */}
              {isAiChatSidebarOpen && (
                <div className="absolute sm:relative top-0 right-0 bottom-0 h-full w-84 sm:w-96 max-w-[92vw] bg-[#0a0e17] border-l border-[#1f2638] flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200">
                  {/* Slidebar Top Header */}
                  <div className="p-3 bg-[#0d121e] border-b border-[#1f2638] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-[#d47a37]/20 border border-[#d47a37]/40 text-[#f8b179]">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          LURL AI Trading Assistant
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        </h4>
                        <span className="text-[10px] text-[#9ca3af]">Real-time Chart Intelligence</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setIsAiChatSpeechOn(!isAiChatSpeechOn);
                        }}
                        title={isAiChatSpeechOn ? 'Voice Audio Readout ON' : 'Voice Audio Readout OFF'}
                        className={`p-1 rounded text-xs transition-colors cursor-pointer ${
                          isAiChatSpeechOn ? 'text-[#f8b179] bg-[#d47a37]/20' : 'text-[#6b7280] hover:text-white'
                        }`}
                      >
                        {isAiChatSpeechOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                      </button>

                      {onAskChatbot && (
                        <button
                          type="button"
                          onClick={() => {
                            playClickSound();
                            onAskChatbot(aiChatMessages[aiChatMessages.length - 1]?.text || 'Analyze BTC market structure');
                          }}
                          title="Open Full AI Voice Advisor Tab"
                          className="p-1 rounded text-xs text-[#9ca3af] hover:text-[#f8b179] hover:bg-[#181f2f] cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setIsAiChatSidebarOpen(false);
                        }}
                        title="Close Slidebar"
                        className="p-1 rounded text-[#9ca3af] hover:text-white hover:bg-[#181f2f] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Real-time Ticker Snapshot */}
                  <div className="px-3 py-1.5 bg-[#080b12] border-b border-[#181d2a] flex items-center justify-between text-[10px] font-mono text-[#9ca3af]">
                    <span>BTC: <strong className="text-emerald-400">${currentPrice.toLocaleString()}</strong></span>
                    <span>RSI: <strong className="text-amber-400">{currentCandle?.rsi || 50}</strong></span>
                    <span className="text-cyan-400">TF: {timeframe}</span>
                  </div>

                  {/* Chat Messages Log */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[360px] sm:max-h-[420px] text-xs">
                    {aiChatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[88%] p-2.5 rounded-lg leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white font-medium'
                              : 'bg-[#141824] border border-[#252c3d] text-gray-200'
                          }`}
                        >
                          {msg.role === 'ai' && (
                            <div className="flex items-center justify-between mb-1 pb-1 border-b border-[#252c3d] text-[10px] text-[#f8b179] font-bold">
                              <span>AI Co-Pilot</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if ('speechSynthesis' in window) {
                                    window.speechSynthesis.cancel();
                                    const clean = msg.text.replace(/[*#_`]/g, '');
                                    const utter = new SpeechSynthesisUtterance(clean.slice(0, 200));
                                    window.speechSynthesis.speak(utter);
                                  }
                                }}
                                className="hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Volume2 className="w-3 h-3" /> Listen
                              </button>
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                        <span className="text-[9px] text-[#6b7280] mt-0.5 px-1">{msg.timestamp}</span>
                      </div>
                    ))}

                    {isAiChatLoading && (
                      <div className="p-2.5 rounded-lg bg-[#141824] border border-[#252c3d] text-gray-400 text-xs flex items-center gap-2 max-w-[85%]">
                        <span className="w-3 h-3 border-2 border-[#d47a37] border-t-transparent rounded-full animate-spin" />
                        <span>Formulating institutional setup analysis...</span>
                      </div>
                    )}
                  </div>

                  {/* Quick-Prompt Action Chips */}
                  <div className="p-2 bg-[#0c1018] border-t border-[#181d2a] flex items-center gap-1.5 overflow-x-auto text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleSendAiChatMessage('Analyze the current BTC market structure and bias')}
                      disabled={isAiChatLoading}
                      className="px-2 py-1 rounded bg-[#141b29] hover:bg-[#1e283d] text-[#38bdf8] border border-[#38bdf8]/30 whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      ⚡ Analyze BTC
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiChatMessage('Identify key Order Blocks, FVGs and Liquidity pools')}
                      disabled={isAiChatLoading}
                      className="px-2 py-1 rounded bg-[#141b29] hover:bg-[#1e283d] text-emerald-400 border border-emerald-500/30 whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      🎯 Order Blocks
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendAiChatMessage('Calculate a 1:3 Risk-to-Reward trade plan with entry, stop and target')}
                      disabled={isAiChatLoading}
                      className="px-2 py-1 rounded bg-[#141b29] hover:bg-[#1e283d] text-amber-400 border border-amber-500/30 whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      🛡️ 1:3 R:R Plan
                    </button>
                  </div>

                  {/* Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendAiChatMessage();
                    }}
                    className="p-2 bg-[#090c12] border-t border-[#181d2a] flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={aiChatInput}
                      onChange={(e) => setAiChatInput(e.target.value)}
                      placeholder="Ask AI Chatbot about this chart..."
                      disabled={isAiChatLoading}
                      className="flex-1 bg-[#121622] border border-[#252c3d] focus:border-[#d47a37] rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!aiChatInput.trim() || isAiChatLoading}
                      className="px-3 py-1.5 rounded bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#c96c24] text-white text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Sub-chart: MACD (12, 26, 9) Oscillator */}
            {showMacd && (
              <div className="pt-2 pb-1 border-t border-[#181d2a]">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">MACD (12, 26, 9):</span>
                    <span className="text-cyan-400 font-bold">
                      Line: {macdData.list[visibleCandles.length - 1]?.macd.toFixed(1) || '0'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      Signal: {macdData.list[visibleCandles.length - 1]?.signal.toFixed(1) || '0'}
                    </span>
                    <span className="text-white">
                      Hist: {macdData.list[visibleCandles.length - 1]?.histogram.toFixed(1) || '0'}
                    </span>
                  </div>
                  <span className="text-[#6b7280]">Zero Center Oscillator</span>
                </div>

                <div className="h-10 bg-[#090c12] border border-[#181d2a] relative flex items-center px-1 overflow-hidden">
                  <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-[#1f2638]" />
                  <div className="flex items-center w-full h-full justify-between gap-[1px]">
                    {macdData.list.map((m, mIdx) => {
                      const isPos = m.histogram >= 0;
                      const hNorm = Math.min(1, Math.abs(m.histogram) / (macdData.maxHist || 1));
                      const barH = Math.max(1, hNorm * 18);
                      return (
                        <div key={mIdx} className="flex-1 flex flex-col items-center justify-center h-full">
                          <div
                            style={{ height: `${barH}px` }}
                            className={`w-full max-w-[4px] transition-all ${
                              isPos ? 'bg-emerald-500 mb-auto mt-2' : 'bg-rose-500 mt-auto mb-2'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-chart: RSI 14 (TradingView Style Oscillator) */}
            {showRsi && (
              <div className="pt-2 border-t border-[#181d2a] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-emerald-400 font-bold">RSI (14):</span>
                  <span className="text-white">{currentCandle.rsi || 50}</span>
                  <span className="text-[#6b7280]">| 70 OB / 30 OS</span>
                </div>
                {/* Mini Visual Bar */}
                <div className="w-36 h-1.5 bg-[#1a202c] overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, currentCandle.rsi || 50))}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Order Entry & Risk Management Panel (4 cols) */}
          <div className="lg:col-span-4 p-4 bg-[#0d1017] flex flex-col justify-between">
            <form onSubmit={handleExecuteOrder} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1f2638] pb-2">
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#f8b179]" />
                  <span>Order Execution</span>
                </h3>
                <span className="text-[10px] text-[#9ca3af] font-mono">
                  Avail: <strong className="text-white">${account.balance.toLocaleString()}</strong>
                </span>
              </div>

              {/* Order Side: BUY (Long) vs SELL (Short) */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setOrderSide('BUY');
                  }}
                  className={`py-2 text-xs font-mono font-bold border transition-all cursor-pointer ${
                    orderSide === 'BUY'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                      : 'bg-[#141824] text-[#9ca3af] hover:text-white border-[#252c3d]'
                  }`}
                >
                  BUY / LONG
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setOrderSide('SELL');
                  }}
                  className={`py-2 text-xs font-mono font-bold border transition-all cursor-pointer ${
                    orderSide === 'SELL'
                      ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                      : 'bg-[#141824] text-[#9ca3af] hover:text-white border-[#252c3d]'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Order Type: Market vs Limit */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setOrderType('MARKET')}
                  className={`flex-1 py-1 text-center border cursor-pointer ${
                    orderType === 'MARKET'
                      ? 'bg-[#d47a37]/30 text-[#f8b179] border-[#d47a37]'
                      : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('LIMIT')}
                  className={`flex-1 py-1 text-center border cursor-pointer ${
                    orderType === 'LIMIT'
                      ? 'bg-[#d47a37]/30 text-[#f8b179] border-[#d47a37]'
                      : 'bg-[#121622] text-[#6b7280] border-[#1f2638]'
                  }`}
                >
                  Limit
                </button>
              </div>

              {orderType === 'LIMIT' && (
                <div>
                  <label className="text-[10px] text-[#9ca3af] font-mono block mb-1">Limit Price ($)</label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#080a0f] border border-[#252c3d] text-white text-xs font-mono outline-none focus:border-[#d47a37]"
                  />
                </div>
              )}

              {/* Position Margin Amount (USD) */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9ca3af] mb-1">
                  <span>Margin Allocation (USD)</span>
                  <span>BTC Size: ~{(((parseFloat(positionAmountUsd) || 1000) * leverage) / currentPrice).toFixed(4)} BTC</span>
                </div>
                <input
                  type="number"
                  min="100"
                  max={account.balance}
                  value={positionAmountUsd}
                  onChange={(e) => setPositionAmountUsd(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#080a0f] border border-[#252c3d] text-white text-xs font-mono outline-none focus:border-[#d47a37]"
                />

                {/* Percentage Quick Pickers */}
                <div className="grid grid-cols-4 gap-1.5 mt-1.5 text-[10px] font-mono">
                  {[10, 25, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        const val = Math.floor((account.balance * pct) / 100);
                        setPositionAmountUsd(Math.max(100, val).toString());
                      }}
                      className="py-1 bg-[#141824] hover:bg-[#1f2638] text-[#9ca3af] hover:text-white border border-[#252c3d] cursor-pointer text-center"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Leverage Selection */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#9ca3af] mb-1">
                  <span>Paper Leverage</span>
                  <span className="text-[#f8b179] font-bold">{leverage}x Multiple</span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-[11px] font-mono">
                  {[1, 2, 5, 10, 20].map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setLeverage(lev)}
                      className={`py-1 text-center border cursor-pointer ${
                        leverage === lev
                          ? 'bg-[#d47a37] text-white border-[#d47a37] font-bold'
                          : 'bg-[#141824] text-[#9ca3af] border-[#252c3d]'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Take Profit & Stop Loss Risk Parameters */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <label className="text-[10px] text-emerald-400 block mb-1">Take Profit ($)</label>
                  <input
                    type="number"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    placeholder="e.g. 64500"
                    className="w-full px-2 py-1 bg-[#080a0f] border border-[#252c3d] text-white text-xs outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-red-400 block mb-1">Stop Loss ($)</label>
                  <input
                    type="number"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    placeholder="e.g. 60500"
                    className="w-full px-2 py-1 bg-[#080a0f] border border-[#252c3d] text-white text-xs outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Risk:Reward Metric */}
              <div className="p-2 bg-[#090c12] border border-[#1f2638] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#9ca3af]">Risk / Reward Ratio:</span>
                <strong className="text-[#f8b179]">{calculatedRiskReward}</strong>
              </div>

              {/* Execute Order CTA */}
              <button
                type="submit"
                className={`w-full py-2.5 text-xs font-mono font-bold tracking-wider uppercase border shadow-lg transition-all cursor-pointer ${
                  orderSide === 'BUY'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-400'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white border-red-400'
                }`}
              >
                EXECUTE DEMO {orderSide} (BTC/USD)
              </button>
            </form>
          </div>
        </div>

        {/* 3. Bottom Workspace Tabs: Open Positions, Trade History & Global Leaderboard */}
        <div className="border-t border-[#1f2430] bg-[#0c0f16]">
          {/* Tab Navigation */}
          <div className="px-3 border-b border-[#1f2430] flex items-center gap-2 overflow-x-auto text-xs font-mono">
            <button
              type="button"
              onClick={() => setBottomTab('positions')}
              className={`py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                bottomTab === 'positions'
                  ? 'border-[#f8b179] text-white bg-[#141824]'
                  : 'border-transparent text-[#9ca3af] hover:text-white'
              }`}
            >
              Open Positions ({positions.length})
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('history')}
              className={`py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                bottomTab === 'history'
                  ? 'border-[#f8b179] text-white bg-[#141824]'
                  : 'border-transparent text-[#9ca3af] hover:text-white'
              }`}
            >
              Trade History ({closedTrades.length})
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('worldwide')}
              className={`py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                bottomTab === 'worldwide'
                  ? 'border-cyan-400 text-cyan-300 bg-[#141824]'
                  : 'border-transparent text-[#9ca3af] hover:text-cyan-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Worldwide Conversation</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800/50 rounded font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('profit-chart')}
              className={`py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                bottomTab === 'profit-chart'
                  ? 'border-emerald-400 text-emerald-300 bg-[#141824]'
                  : 'border-transparent text-[#9ca3af] hover:text-emerald-300'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Profit Over Time (Live Graph)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  account.realizedPnl >= 0
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                    : 'bg-red-950 text-red-400 border border-red-800/50'
                }`}
              >
                {account.realizedPnl >= 0 ? '+' : ''}${account.realizedPnl.toFixed(0)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setBottomTab('rankings')}
              className={`py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                bottomTab === 'rankings'
                  ? 'border-amber-400 text-amber-300 bg-[#141824]'
                  : 'border-transparent text-[#9ca3af] hover:text-amber-300'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Global Leaderboard (Top 3)</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-mono">
                {userRank <= 3 ? `Top 3 (#${userRank})` : `#${userRank}`}
              </span>
            </button>
          </div>

          {/* Tab Content 1: Open Positions */}
          {bottomTab === 'positions' && (
            <div className="p-4 overflow-x-auto">
              {positions.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-[#6b7280]">
                  No active open positions. Select BUY or SELL above to execute a simulated backtesting trade.
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-[#1f2638] text-[10px] text-[#6b7280] uppercase">
                      <th className="py-2 px-3">Symbol</th>
                      <th className="py-2 px-3">Side / Lev</th>
                      <th className="py-2 px-3">Size</th>
                      <th className="py-2 px-3">Entry Price</th>
                      <th className="py-2 px-3">Mark Price</th>
                      <th className="py-2 px-3">Liq Price</th>
                      <th className="py-2 px-3">PnL ($)</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181d2a]">
                    {positions.map((pos) => (
                      <tr key={pos.id} className="hover:bg-[#121622]/50">
                        <td className="py-2.5 px-3 font-bold text-white">{pos.symbol}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold ${
                              pos.side === 'BUY'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                : 'bg-red-950 text-red-300 border border-red-700/50'
                            }`}
                          >
                            {pos.side} {pos.leverage}x
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#cbd5e1]">{pos.sizeBtc} BTC (${pos.sizeUsd})</td>
                        <td className="py-2.5 px-3 text-white">${pos.entryPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-white">${pos.currentPrice.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-red-400">${pos.liquidationPrice.toLocaleString()}</td>
                        <td className={`py-2.5 px-3 font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} ({pos.pnlPercent}%)
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleClosePosition(pos.id)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-[#1e2536] hover:bg-red-900/60 text-red-300 border border-red-800/40 cursor-pointer"
                          >
                            Close Position
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab Content 2: Closed Trades History & Worldwide Conversation Column */}
          {bottomTab === 'history' && (
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Main Column (8 cols): Trade Performance Summary Card & Trade History Table */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Trade Performance Summary Card */}
                  <TradePerformanceSummary
                    closedTrades={closedTrades}
                    onExportCsv={handleExportTradesCsv}
                  />

                  {/* Trade History Table */}
                  <div className="overflow-x-auto border border-[#1f2638] rounded-xl bg-[#0f121a] shadow-xl">
                    <div className="p-3 bg-[#131826] border-b border-[#1f2638] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          Trade Executions Ledger
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2438] text-[#9ca3af]">
                          {closedTrades.length} Records
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#6b7280]">
                        Simulated demo entries & exits
                      </span>
                    </div>
                {closedTrades.length === 0 ? (
                  <div className="py-10 text-center text-xs font-mono text-[#6b7280]">
                    <div className="text-sm font-semibold text-[#9ca3af] mb-1">No Past Simulated Trades</div>
                    <div>Execute a BUY or SELL order above and close the position to log your trade history.</div>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-[#1f2638] bg-[#141824] text-[10px] text-[#9ca3af] uppercase tracking-wider">
                        <th className="py-2.5 px-3">Closed Timestamp</th>
                        <th className="py-2.5 px-3">Symbol / Side / Lev</th>
                        <th className="py-2.5 px-3">Simulated Entry</th>
                        <th className="py-2.5 px-3">Simulated Exit</th>
                        <th className="py-2.5 px-3">Volume & Margin</th>
                        <th className="py-2.5 px-3">Trigger Reason</th>
                        <th className="py-2.5 px-3 text-right">Profit / Loss (PnL)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#181d2a]">
                      {closedTrades.map((t) => {
                        const closeDate = new Date(t.closeTime);
                        const openDate = new Date(t.openTime);
                        const durationSec = Math.max(0, Math.floor((t.closeTime - t.openTime) / 1000));
                        const durationStr =
                          durationSec < 60
                            ? `${durationSec}s`
                            : durationSec < 3600
                            ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s`
                            : `${Math.floor(durationSec / 3600)}h ${Math.floor((durationSec % 3600) / 60)}m`;

                        const priceDiff = t.side === 'BUY' ? t.exitPrice - t.entryPrice : t.entryPrice - t.exitPrice;
                        const pricePct = ((priceDiff / t.entryPrice) * 100).toFixed(2);

                        return (
                          <tr key={t.id} className="hover:bg-[#121622]/70 transition-colors">
                            {/* Timestamp */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-semibold text-white">
                                {closeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })},{' '}
                                {closeDate.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </div>
                              <div className="text-[10px] text-[#6b7280] flex items-center gap-1 mt-0.5">
                                <span>Opened: {openDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                <span>•</span>
                                <span className="text-[#f8b179]">⏱️ {durationStr}</span>
                              </div>
                            </td>

                            {/* Symbol & Side / Leverage */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{t.symbol}</span>
                                <span
                                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                                    t.side === 'BUY'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                                      : 'bg-red-950 text-red-300 border border-red-700/50'
                                  }`}
                                >
                                  {t.side === 'BUY' ? 'LONG' : 'SHORT'} {t.leverage}x
                                </span>
                              </div>
                            </td>

                            {/* Simulated Entry Price */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="text-white font-medium">${t.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                              <div className="text-[10px] text-[#6b7280]">Entry Order</div>
                            </td>

                            {/* Simulated Exit Price */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="text-white font-medium">${t.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                              <div
                                className={`text-[10px] font-semibold ${
                                  priceDiff >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                {priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(2)} ({pricePct}%)
                              </div>
                            </td>

                            {/* Volume & Margin */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <div className="text-[#cbd5e1]">{t.sizeBtc} BTC</div>
                              <div className="text-[10px] text-[#9ca3af]">${t.sizeUsd.toLocaleString()} Margin</div>
                            </td>

                            {/* Trigger Reason */}
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${
                                  t.reason === 'TP Triggered'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
                                    : t.reason === 'SL Triggered'
                                    ? 'bg-red-950/60 text-red-300 border-red-800/40'
                                    : 'bg-[#181f2f] text-[#9ca3af] border-[#252f44]'
                                }`}
                              >
                                {t.reason}
                              </span>
                            </td>

                            {/* Realized Profit/Loss */}
                            <td className="py-2.5 px-3 whitespace-nowrap text-right">
                              <div
                                className={`font-bold text-sm ${
                                  t.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}
                              >
                                {t.profit >= 0 ? '+' : ''}${t.profit.toFixed(2)}
                              </div>
                              <div
                                className={`text-[10px] font-mono ${
                                  t.roi >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'
                                }`}
                              >
                                ROI: {t.roi >= 0 ? '+' : ''}{t.roi.toFixed(2)}%
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                  </div>
                </div>

                {/* Right Column (4 cols): Worldwide Conversation Column ("make a colum for that simple") */}
                <div className="lg:col-span-4">
                  <WorldwideConversationColumn userSession={userSession} />
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Worldwide Conversation Dedicated Full View */}
          {bottomTab === 'worldwide' && (
            <div className="p-3 sm:p-5 max-w-5xl mx-auto">
              <WorldwideConversationColumn userSession={userSession} isFullWidth={true} />
            </div>
          )}

          {/* Tab Content: Historical Profit-Over-Time Graph (Recharts) */}
          {bottomTab === 'profit-chart' && (
            <div className="p-2 sm:p-4">
              <HistoricalProfitChart
                account={account}
                closedTrades={closedTrades}
                openPositions={positions}
                isExpanded={isFullscreen}
                onToggleExpand={() => setIsFullscreen(!isFullscreen)}
              />
            </div>
          )}

          {/* Tab Content 3: Global Trader Rankings Leaderboard with 1st, 2nd, 3rd Podium (Server-Backed Real-Time) */}
          {bottomTab === 'rankings' && (
            <div className="p-2 sm:p-4">
              <GlobalLeaderboard
                currentUserAccount={account}
                currentUserProfile={userProfile}
                currentUserSession={userSession}
              />
            </div>
          )}
        </div>
      </div>

      {/* Text Annotation Input Modal */}
      {textNoteModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0e1118] border border-[#252c3d] p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
              <Type className="w-4 h-4 text-[#f8b179]" />
              <span>Add Chart Text Annotation</span>
            </h3>
            <p className="text-xs text-[#9ca3af]">
              Place a custom analysis note, price callout, or setup note at this chart level.
            </p>
            <input
              type="text"
              value={textNoteInput}
              onChange={(e) => setTextNoteInput(e.target.value)}
              placeholder="e.g. Liquidity sweep / Daily demand zone"
              autoFocus
              className="w-full bg-[#121622] border border-[#1f2638] px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#d47a37]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTextAnnotation();
                }
              }}
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2638]">
              <button
                type="button"
                onClick={() => {
                  setTextNoteModal(null);
                  setActiveDrawingTool('cursor');
                }}
                className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white bg-[#141824] border border-[#252c3d] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTextAnnotation}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#d47a37] hover:bg-[#e08a46] cursor-pointer"
              >
                Place on Chart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings / Capital Modal */}
      {isAccountSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#0e1118] border border-[#252c3d] p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#f8b179]" />
              <span>Demo Account Capital Settings</span>
            </h3>
            <p className="text-xs text-[#9ca3af]">
              Select your simulated starting capital to restart your Bitcoin backtesting ledger.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[1000, 10000, 50000, 100000].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setSelectedCapital(cap)}
                  className={`py-2 text-center border cursor-pointer ${
                    selectedCapital === cap
                      ? 'bg-[#d47a37] text-white border-[#d47a37] font-bold'
                      : 'bg-[#141824] text-[#9ca3af] border-[#252c3d]'
                  }`}
                >
                  ${cap.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1f2638]">
              <button
                type="button"
                onClick={() => setIsAccountSettingsOpen(false)}
                className="px-3 py-1.5 text-xs text-[#9ca3af] hover:text-white bg-[#141824] border border-[#252c3d] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAccount}
                className="px-4 py-1.5 text-xs font-bold text-white bg-[#d47a37] hover:bg-[#e08a46] cursor-pointer"
              >
                Apply & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
