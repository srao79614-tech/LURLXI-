import { DemoCandle, DemoAccount, DemoTradePosition, DemoClosedTrade, TraderRanking, UserExperienceTier } from '../types';
import { getAccountScopedKey, scheduleVaultSync } from './userStorage';

const DEMO_ACCOUNT_STORAGE_KEY = 'lurl_btc_demo_account_v1';
const DEMO_POSITIONS_STORAGE_KEY = 'lurl_btc_demo_positions_v1';
const DEMO_CLOSED_STORAGE_KEY = 'lurl_btc_demo_closed_v1';

// Seeded pseudorandom generator for deterministic, realistic price charts
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Fetches real-time candlestick klines from Binance Public API.
 * Returns parsed candles with calculated EMA, RSI, and Bollinger Bands.
 */
export async function fetchLiveBtcCandles(interval = '15m', limit = 120): Promise<DemoCandle[]> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`);
    if (!res.ok) throw new Error(`Binance API HTTP status ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const candles: DemoCandle[] = data.map((item: any) => {
        const time = Number(item[0]);
        const dateObj = new Date(time);
        const timeLabel = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
        return {
          time,
          timeLabel,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5]),
        };
      });
      calculateIndicators(candles);
      return candles;
    }
  } catch (err) {
    console.warn('Real-time Binance kline fetch fallback:', err);
  }
  return generateBtcCandles('wyckoff', limit);
}

/**
 * Fetches real-time BTC/USDT spot price.
 */
export async function fetchLiveBtcPrice(): Promise<number> {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
    if (res.ok) {
      const data = await res.json();
      const p = parseFloat(data.price);
      if (p > 0) return p;
    }
  } catch (e) {
    try {
      const cb = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      if (cb.ok) {
        const data = await cb.json();
        const p = parseFloat(data?.data?.amount);
        if (p > 0) return p;
      }
    } catch {}
  }
  return 0;
}

export function generateBtcCandles(scenario = 'wyckoff', count = 160): DemoCandle[] {
  const candles: DemoCandle[] = [];
  const rand = createSeededRandom(scenario === 'wyckoff' ? 42 : scenario === 'breakout' ? 108 : scenario === 'sweep' ? 256 : 777);

  let currentPrice = 84500;
  let now = Date.now() - count * 15 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const time = now + i * 15 * 60 * 1000;
    const dateObj = new Date(time);
    const timeLabel = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

    // Scenario bias
    let bias = 0;
    if (scenario === 'wyckoff') {
      if (i < 40) bias = Math.sin(i * 0.15) * 60; // range
      else if (i >= 40 && i < 65) bias = -120; // spring drop
      else if (i >= 65 && i < 110) bias = 180; // markup phase
      else bias = Math.sin(i * 0.2) * 50 + 40; // higher consolidation
    } else if (scenario === 'breakout') {
      if (i < 60) bias = Math.sin(i * 0.3) * 40;
      else if (i >= 60 && i < 100) bias = 240;
      else bias = Math.sin(i * 0.2) * 60 + 30;
    } else if (scenario === 'sweep') {
      if (i >= 50 && i <= 60) bias = -250; // sharp wick sweep
      else if (i > 60 && i <= 75) bias = 320; // aggressive squeeze
      else bias = (rand() - 0.48) * 80;
    } else {
      bias = (rand() - 0.49) * 120;
    }

    const delta = (rand() - 0.49) * 220 + bias * 0.4;
    const open = Math.round(currentPrice);
    const close = Math.round(Math.max(45000, currentPrice + delta));
    const high = Math.round(Math.max(open, close) + rand() * 160 + 20);
    const low = Math.round(Math.min(open, close) - rand() * 160 - 20);
    const volume = Math.round(15 + rand() * 85 + (Math.abs(close - open) / 10));

    candles.push({
      time,
      timeLabel,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  // Compute Technical Indicators
  calculateIndicators(candles);
  return candles;
}

function calculateIndicators(candles: DemoCandle[]) {
  // EMA 20, 50, 200
  calcEma(candles, 20, 'ema20');
  calcEma(candles, 50, 'ema50');
  calcEma(candles, 200, 'ema200');

  // RSI 14
  calcRsi(candles, 14);

  // Bollinger Bands 20, 2
  calcBollinger(candles, 20, 2);
}

function calcEma(candles: DemoCandle[], period: number, key: 'ema20' | 'ema50' | 'ema200') {
  const k = 2 / (period + 1);
  let prevEma = candles[0].close;

  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      candles[i][key] = prevEma;
    } else {
      const currClose = candles[i].close;
      prevEma = currClose * k + prevEma * (1 - k);
      candles[i][key] = Math.round(prevEma * 10) / 10;
    }
  }
}

function calcRsi(candles: DemoCandle[], period = 14) {
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period && i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      candles[i].rsi = 50;
      continue;
    }

    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      candles[i].rsi = 100;
    } else {
      const rs = avgGain / avgLoss;
      candles[i].rsi = Math.round((100 - 100 / (1 + rs)) * 10) / 10;
    }
  }
}

function calcBollinger(candles: DemoCandle[], period = 20, mult = 2) {
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      candles[i].bbMiddle = candles[i].close;
      candles[i].bbUpper = candles[i].close + 250;
      candles[i].bbLower = candles[i].close - 250;
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const sma = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - sma, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    candles[i].bbMiddle = Math.round(sma * 10) / 10;
    candles[i].bbUpper = Math.round((sma + mult * stdDev) * 10) / 10;
    candles[i].bbLower = Math.round((sma - mult * stdDev) * 10) / 10;
  }
}

// Demo Account Persistence - Strictly synchronized with real user trades and isolated per account
export function getDemoAccount(emailInput?: string): DemoAccount {
  if (typeof window === 'undefined') {
    return {
      initialBalance: 10000,
      balance: 10000,
      equity: 10000,
      realizedPnl: 0,
      winCount: 0,
      lossCount: 0,
      totalVolumeUsd: 0,
    };
  }

  const scopedKey = getAccountScopedKey(DEMO_ACCOUNT_STORAGE_KEY, emailInput);
  try {
    const raw = localStorage.getItem(scopedKey);
    const closed = getClosedTrades(emailInput);
    const openPos = getDemoPositions(emailInput);

    let initBal = 10000;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.initialBalance === 'number' && parsed.initialBalance > 0) {
        initBal = parsed.initialBalance;
      }
    }

    const realizedPnl = Math.round(closed.reduce((acc, t) => acc + (t.profit || 0), 0) * 100) / 100;
    const winCount = closed.filter((t) => t.profit > 0).length;
    const lossCount = closed.filter((t) => t.profit < 0).length;
    const totalVolumeUsd = Math.round(closed.reduce((acc, t) => acc + (t.sizeUsd || 0), 0) * 100) / 100;
    const openMargin = openPos.reduce((acc, p) => acc + (p.sizeUsd || 0), 0);
    const openUnrealized = openPos.reduce((acc, p) => acc + (p.pnl || 0), 0);

    const synced: DemoAccount = {
      initialBalance: initBal,
      balance: Math.max(0, Math.round((initBal + realizedPnl - openMargin) * 100) / 100),
      equity: Math.max(0, Math.round((initBal + realizedPnl + openUnrealized) * 100) / 100),
      realizedPnl,
      winCount,
      lossCount,
      totalVolumeUsd,
    };

    localStorage.setItem(scopedKey, JSON.stringify(synced));
    return synced;
  } catch {
    return {
      initialBalance: 10000,
      balance: 10000,
      equity: 10000,
      realizedPnl: 0,
      winCount: 0,
      lossCount: 0,
      totalVolumeUsd: 0,
    };
  }
}

export function saveDemoAccount(account: DemoAccount, emailInput?: string) {
  if (typeof window === 'undefined') return;
  try {
    const scopedKey = getAccountScopedKey(DEMO_ACCOUNT_STORAGE_KEY, emailInput);
    localStorage.setItem(scopedKey, JSON.stringify(account));
    scheduleVaultSync(emailInput);
  } catch (e) {
    console.error('Failed to save demo account', e);
  }
}

export function resetDemoAccount(newBalance = 10000, emailInput?: string): DemoAccount {
  const fresh: DemoAccount = {
    initialBalance: newBalance,
    balance: newBalance,
    equity: newBalance,
    realizedPnl: 0,
    winCount: 0,
    lossCount: 0,
    totalVolumeUsd: 0,
  };
  saveDemoAccount(fresh, emailInput);
  saveDemoPositions([], emailInput);
  saveClosedTrades([], emailInput);
  return fresh;
}

export function getDemoPositions(emailInput?: string): DemoTradePosition[] {
  if (typeof window === 'undefined') return [];
  try {
    const scopedKey = getAccountScopedKey(DEMO_POSITIONS_STORAGE_KEY, emailInput);
    const raw = localStorage.getItem(scopedKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDemoPositions(positions: DemoTradePosition[], emailInput?: string) {
  if (typeof window === 'undefined') return;
  try {
    const scopedKey = getAccountScopedKey(DEMO_POSITIONS_STORAGE_KEY, emailInput);
    localStorage.setItem(scopedKey, JSON.stringify(positions));
    scheduleVaultSync(emailInput);
  } catch (e) {
    console.error('Failed to save demo positions', e);
  }
}

export function getClosedTrades(emailInput?: string): DemoClosedTrade[] {
  if (typeof window === 'undefined') return [];
  try {
    const scopedKey = getAccountScopedKey(DEMO_CLOSED_STORAGE_KEY, emailInput);
    const raw = localStorage.getItem(scopedKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Return only genuine user executed trades
        return parsed.filter(
          (t) =>
            !t.id?.startsWith('trade_seed_') &&
            !t.id?.startsWith('trade-pro-') &&
            !t.id?.startsWith('sim_')
        );
      }
    }
    return [];
  } catch {
    return [];
  }
}

export function saveClosedTrades(trades: DemoClosedTrade[], emailInput?: string) {
  if (typeof window === 'undefined') return;
  try {
    const scopedKey = getAccountScopedKey(DEMO_CLOSED_STORAGE_KEY, emailInput);
    localStorage.setItem(scopedKey, JSON.stringify(trades));
    scheduleVaultSync(emailInput);
  } catch (e) {
    console.error('Failed to save closed trades', e);
  }
}

// Global Demo Traders Ranking Data
export function getTraderRankings(
  currentUserStats: {
    name: string;
    email: string;
    avatarUrl: string;
    tier: UserExperienceTier;
    profit: number;
    initialBalance: number;
    winCount: number;
    lossCount: number;
    country?: string;
    countryFlag?: string;
  },
  sortBy: 'roi' | 'profit' = 'roi'
): TraderRanking[] {
  const baseCommunityTraders: Omit<TraderRanking, 'rank' | 'badgeTitle'>[] = [
    {
      name: 'Alexander Volkov',
      email: 'volkov.quant@hedge.io',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      country: 'Switzerland',
      countryFlag: '🇨🇭',
      tier: 'platinum',
      profit: 24650.0,
      roi: 246.5,
      winRate: 78.4,
      tradesCount: 142,
    },
    {
      name: 'Elena Rostova',
      email: 'e.rostova@alphaflow.ch',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      country: 'Singapore',
      countryFlag: '🇸🇬',
      tier: 'platinum',
      profit: 18920.0,
      roi: 189.2,
      winRate: 74.1,
      tradesCount: 98,
    },
    {
      name: 'Kenji Takahashi',
      email: 'k.takahashi@tokyo-quant.jp',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      country: 'Japan',
      countryFlag: '🇯🇵',
      tier: 'gold',
      profit: 15320.0,
      roi: 153.2,
      winRate: 71.8,
      tradesCount: 76,
    },
    {
      name: 'Marcus Sterling',
      email: 'm.sterling@deribit.vip',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      country: 'United Kingdom',
      countryFlag: '🇬🇧',
      tier: 'gold',
      profit: 12480.0,
      roi: 124.8,
      winRate: 69.5,
      tradesCount: 65,
    },
    {
      name: 'Devon Vance',
      email: 'devon.vance@citadel-desk.com',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      country: 'United States',
      countryFlag: '🇺🇸',
      tier: 'gold',
      profit: 8940.0,
      roi: 89.4,
      winRate: 66.7,
      tradesCount: 52,
    },
    {
      name: 'Fatima Al-Mansoor',
      email: 'f.almansoor@dubai-capital.ae',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      country: 'United Arab Emirates',
      countryFlag: '🇦🇪',
      tier: 'silver',
      profit: 7120.0,
      roi: 71.2,
      winRate: 65.0,
      tradesCount: 44,
    },
    {
      name: 'Sarah Chen',
      email: 'schen.crypto@binance.sg',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      country: 'Hong Kong',
      countryFlag: '🇭🇰',
      tier: 'silver',
      profit: 5410.0,
      roi: 54.1,
      winRate: 63.2,
      tradesCount: 38,
    },
    {
      name: 'Julian Thorne',
      email: 'jthorne@propfirm.uk',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      country: 'Australia',
      countryFlag: '🇦🇺',
      tier: 'bronze',
      profit: 2150.0,
      roi: 21.5,
      winRate: 58.3,
      tradesCount: 24,
    },
    {
      name: 'Maximilian Weber',
      email: 'm.weber@frankfurt-desk.de',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
      country: 'Germany',
      countryFlag: '🇩🇪',
      tier: 'bronze',
      profit: 1420.0,
      roi: 14.2,
      winRate: 54.5,
      tradesCount: 18,
    },
  ];

  const totalTrades = currentUserStats.winCount + currentUserStats.lossCount;
  const userWinRate = totalTrades > 0 ? parseFloat(((currentUserStats.winCount / totalTrades) * 100).toFixed(1)) : 0;
  const userRoi = currentUserStats.initialBalance > 0
    ? parseFloat(((currentUserStats.profit / currentUserStats.initialBalance) * 100).toFixed(1))
    : 0;

  const currentTraderEntry: Omit<TraderRanking, 'rank' | 'badgeTitle'> = {
    name: currentUserStats.name || 'You (Executive Trader)',
    email: currentUserStats.email,
    avatarUrl: currentUserStats.avatarUrl,
    country: currentUserStats.country || 'Worldwide',
    countryFlag: currentUserStats.countryFlag || '🌐',
    tier: currentUserStats.tier,
    profit: Math.round(currentUserStats.profit * 100) / 100,
    roi: userRoi,
    winRate: userWinRate,
    tradesCount: totalTrades,
    isCurrentUser: true,
  };

  const allTraders = [...baseCommunityTraders, currentTraderEntry];

  // Sort descending by profit percentage (ROI) or Net Profit ($)
  if (sortBy === 'roi') {
    allTraders.sort((a, b) => b.roi - a.roi);
  } else {
    allTraders.sort((a, b) => b.profit - a.profit);
  }

  return allTraders.map((trader, idx) => {
    const rank = idx + 1;
    let badgeTitle = 'Worldwide Trader';
    if (rank === 1) badgeTitle = '🥇 1st Worldwide Champion';
    else if (rank === 2) badgeTitle = '🥈 2nd Worldwide Runner-Up';
    else if (rank === 3) badgeTitle = '🥉 3rd Worldwide Master';
    else if (rank <= 5) badgeTitle = 'Top 5 Worldwide Elite';
    else if (rank <= 10) badgeTitle = 'Top 10 Worldwide';

    return {
      ...trader,
      rank,
      badgeTitle,
    };
  });
}
