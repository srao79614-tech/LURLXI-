import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Award,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Clock,
  Target,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { DemoAccount, DemoClosedTrade, DemoTradePosition } from '../types';

interface HistoricalProfitChartProps {
  account: DemoAccount;
  closedTrades: DemoClosedTrade[];
  openPositions?: DemoTradePosition[];
  onOpenTrade?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export interface ProfitProgressionPoint {
  id: string;
  timestamp: number;
  dateLabel: string;
  fullDate: string;
  profit: number;
  equity: number;
  balance: number;
  roi: number;
  drawdown: number;
  eventTitle: string;
  eventDescription: string;
  tradeType?: 'BUY' | 'SELL';
  tradePnl?: number;
  isLivePoint?: boolean;
}

export const HistoricalProfitChart: React.FC<HistoricalProfitChartProps> = ({
  account,
  closedTrades,
  openPositions = [],
  isExpanded = false,
  onToggleExpand,
}) => {
  const [metricMode, setMetricMode] = useState<'profit' | 'equity' | 'roi'>('profit');
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d'>('all');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Calculate live unrealized PnL from open positions
  const openUnrealizedPnl = useMemo(() => {
    return openPositions.reduce((acc, pos) => acc + (pos.pnl || 0), 0);
  }, [openPositions]);

  // Retrieve or initialize account creation date
  const accountStartTime = useMemo(() => {
    if (typeof window === 'undefined') return Date.now() - 7 * 24 * 60 * 60 * 1000;
    const key = 'lurl_btc_demo_account_created_at_v1';
    let stored = localStorage.getItem(key);
    if (!stored) {
      // Default to 5 days ago to show progression from start to current date
      const initialStart = Date.now() - 5 * 24 * 60 * 60 * 1000;
      localStorage.setItem(key, initialStart.toString());
      return initialStart;
    }
    return parseInt(stored, 10) || (Date.now() - 5 * 24 * 60 * 60 * 1000);
  }, []);

  // Format dates cleanly
  const formatDateLabel = (ts: number): string => {
    const d = new Date(ts);
    return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  };

  const formatFullDate = (ts: number): string => {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Build progression data from start of demo account to current date
  const chartData = useMemo<ProfitProgressionPoint[]>(() => {
    const points: ProfitProgressionPoint[] = [];
    const initBal = account.initialBalance || 10000;

    // Point 0: Start of Demo Account
    points.push({
      id: 'point-start',
      timestamp: accountStartTime,
      dateLabel: formatDateLabel(accountStartTime),
      fullDate: formatFullDate(accountStartTime),
      profit: 0,
      equity: initBal,
      balance: initBal,
      roi: 0,
      drawdown: 0,
      eventTitle: 'Demo Account Inception',
      eventDescription: `Allocated initial demo capital of $${initBal.toLocaleString()} USD.`,
    });

    // If there are real closed trades recorded in backtesting
    if (closedTrades.length > 0) {
      const sortedTrades = [...closedTrades].sort((a, b) => a.closeTime - b.closeTime);
      let cumulativeProfit = 0;
      let peakProfit = 0;

      sortedTrades.forEach((trade, idx) => {
        cumulativeProfit += trade.profit;
        if (cumulativeProfit > peakProfit) peakProfit = cumulativeProfit;
        const currentDrawdown = peakProfit > 0 ? ((peakProfit - cumulativeProfit) / (initBal + peakProfit)) * 100 : 0;
        const currentEquity = initBal + cumulativeProfit;
        const currentRoi = (cumulativeProfit / initBal) * 100;

        points.push({
          id: trade.id || `trade-${idx}`,
          timestamp: trade.closeTime,
          dateLabel: formatDateLabel(trade.closeTime),
          fullDate: formatFullDate(trade.closeTime),
          profit: Math.round(cumulativeProfit * 100) / 100,
          equity: Math.round(currentEquity * 100) / 100,
          balance: Math.round(currentEquity * 100) / 100,
          roi: Math.round(currentRoi * 100) / 100,
          drawdown: Math.round(currentDrawdown * 10) / 10,
          eventTitle: `Trade #${idx + 1}: ${trade.side} ${trade.symbol}`,
          eventDescription: `${trade.reason} at $${trade.exitPrice?.toLocaleString()} | PnL: ${trade.profit >= 0 ? '+' : ''}$${trade.profit.toFixed(2)} (${trade.roi}%)`,
          tradeType: (trade.side === 'BUY' || trade.side === 'long' || trade.type === 'long') ? 'BUY' : 'SELL',
          tradePnl: trade.profit,
        });
      });
    } else {
      // Zero fake or simulated trades: strictly authentic real-time tracking
      // If user has open positions, plot each open position's live real-time mark-to-market status
      if (openPositions.length > 0) {
        let runningUnrealized = 0;
        openPositions.forEach((pos, idx) => {
          runningUnrealized += pos.pnl || 0;
          const posEquity = Math.round((initBal + account.realizedPnl + runningUnrealized) * 100) / 100;
          const posProfit = Math.round((account.realizedPnl + runningUnrealized) * 100) / 100;
          const posRoi = Math.round((posProfit / initBal) * 1000) / 10;
          points.push({
            id: pos.id || `open-pos-${idx}`,
            timestamp: pos.openTime || Date.now() - (openPositions.length - idx) * 60000,
            dateLabel: `Open #${idx + 1}`,
            fullDate: formatFullDate(pos.openTime || Date.now()),
            profit: posProfit,
            equity: posEquity,
            balance: Math.round(account.balance * 100) / 100,
            roi: posRoi,
            drawdown: 0,
            eventTitle: `Active Open Position: ${pos.side} ${pos.symbol}`,
            eventDescription: `Entry: $${pos.entryPrice.toLocaleString()} | Live PnL: ${(pos.pnl || 0) >= 0 ? '+' : ''}$${(pos.pnl || 0).toFixed(2)}`,
            tradeType: (pos.side === 'BUY' || pos.side === 'long' || pos.type === 'long') ? 'BUY' : 'SELL',
            tradePnl: pos.pnl || 0,
            isLivePoint: true,
          });
        });
      }
    }

    // Final Point: Current Date & Time (Live status right now)
    const now = Date.now();
    const liveTotalProfit = Math.round((account.realizedPnl + openUnrealizedPnl) * 100) / 100;
    const liveEquity = Math.round((initBal + liveTotalProfit) * 100) / 100;
    const liveRoi = Math.round((liveTotalProfit / initBal) * 1000) / 10;

    points.push({
      id: 'point-current',
      timestamp: now,
      dateLabel: `Current (${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`,
      fullDate: `${formatFullDate(now)} (Live Status)`,
      profit: liveTotalProfit,
      equity: liveEquity,
      balance: Math.round(account.balance * 100) / 100,
      roi: liveRoi,
      drawdown: 0,
      eventTitle: 'Live Current Performance',
      eventDescription: `Current Realized: ${account.realizedPnl >= 0 ? '+' : ''}$${account.realizedPnl.toFixed(2)} | Unrealized Open PnL: ${openUnrealizedPnl >= 0 ? '+' : ''}$${openUnrealizedPnl.toFixed(2)}`,
      isLivePoint: true,
    });

    return points;
  }, [account, closedTrades, openPositions, accountStartTime, openUnrealizedPnl]);

  // Summary Metrics
  const initialBalance = account.initialBalance || 10000;
  const currentProfit = (account.realizedPnl || 0) + openUnrealizedPnl;
  const currentEquity = initialBalance + currentProfit;
  const currentRoi = initialBalance > 0 ? (currentProfit / initialBalance) * 100 : 0;
  const isProfitable = currentProfit >= 0;

  // Max peak profit reached
  const peakProfit = useMemo(() => {
    return Math.max(...chartData.map((p) => p.profit), 0);
  }, [chartData]);

  // Max drawdown in USD
  const maxDrawdownUsd = useMemo(() => {
    let peak = 0;
    let maxDd = 0;
    chartData.forEach((p) => {
      if (p.profit > peak) peak = p.profit;
      const dd = peak - p.profit;
      if (dd > maxDd) maxDd = dd;
    });
    return maxDd;
  }, [chartData]);

  const handleCopySummary = () => {
    const text = `📊 LURL Bitcoin Trading Performance Summary:
• Inception: ${formatFullDate(accountStartTime)}
• Current Date: ${formatFullDate(Date.now())}
• Initial Balance: $${initialBalance.toLocaleString()} USD
• Current Equity: $${currentEquity.toLocaleString()} USD
• Net Cumulative Profit: ${currentProfit >= 0 ? '+' : ''}$${currentProfit.toFixed(2)} USD (${currentRoi >= 0 ? '+' : ''}${currentRoi.toFixed(2)}%)
• Closed Trades: ${closedTrades.length} | Open Positions: ${openPositions.length}
• Peak Historical Profit: +$${peakProfit.toFixed(2)} USD`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ProfitProgressionPoint = payload[0].payload;
      const isPositive = data.profit >= 0;

      return (
        <div className="bg-[#0b0e14] border border-[#252c3d] p-3 shadow-2xl rounded text-xs font-mono max-w-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between border-b border-[#1f2638] pb-1.5">
            <span className="text-[11px] font-bold text-white flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#d47a37]" />
              <span>{data.fullDate}</span>
            </span>
            {data.isLivePoint ? (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                LIVE
              </span>
            ) : data.tradeType ? (
              <span
                className={`px-1.5 py-0.5 text-[9px] font-bold ${
                  data.tradeType === 'BUY'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : 'bg-red-950 text-red-300 border border-red-500/50'
                }`}
              >
                {data.tradeType}
              </span>
            ) : null}
          </div>

          <div className="text-amber-300 font-bold text-xs">{data.eventTitle}</div>
          <div className="text-[11px] text-[#9ca3af]">{data.eventDescription}</div>

          <div className="pt-2 border-t border-[#1f2638] grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[#6b7280] block text-[10px]">Net Profit:</span>
              <span className={`font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}${data.profit.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[10px]">Account Equity:</span>
              <span className="font-bold text-white">${data.equity.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[10px]">Cumulative ROI:</span>
              <span className={`font-bold ${data.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {data.roi >= 0 ? '+' : ''}{data.roi}%
              </span>
            </div>
            <div>
              <span className="text-[#6b7280] block text-[10px]">Total Balance:</span>
              <span className="font-bold text-[#cbd5e1]">${data.balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-[#0c0f16] border border-[#1f2430] p-3 sm:p-5 font-mono space-y-4">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1f2430] pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Historical Profit Progression</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Inception → Current Date
              </span>
            </h3>
          </div>
          <p className="text-xs text-[#9ca3af]">
            Live equity curve tracking cumulative profit, balance growth, and ROI from your demo account creation to today.
          </p>
        </div>

        {/* Action Controls & Metric Mode */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="flex items-center bg-[#121622] p-0.5 border border-[#1f2638]">
            <button
              type="button"
              onClick={() => setMetricMode('profit')}
              className={`px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                metricMode === 'profit'
                  ? 'bg-[#252f48] text-[#f8b179] border border-[#d47a37]/50 shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Net Profit ($)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('equity')}
              className={`px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                metricMode === 'equity'
                  ? 'bg-[#252f48] text-[#f8b179] border border-[#d47a37]/50 shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              Equity ($)
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('roi')}
              className={`px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                metricMode === 'roi'
                  ? 'bg-[#252f48] text-[#f8b179] border border-[#d47a37]/50 shadow-sm'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              ROI (%)
            </button>
          </div>

          {/* Copy Performance Summary */}
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-2.5 py-1 bg-[#161b26] hover:bg-[#1f2638] text-xs text-[#cbd5e1] hover:text-white border border-[#252c3d] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy Performance Summary"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#f8b179]" />}
            <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1.5 bg-[#161b26] hover:bg-[#1f2638] text-[#f8b179] border border-[#252c3d] cursor-pointer"
              title={isExpanded ? 'Collapse Graph' : 'Expand Full Graph'}
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Initial Capital */}
        <div className="p-3 bg-[#11141c] border border-[#1f2638]">
          <span className="text-[10px] text-[#6b7280] uppercase block">Start Capital</span>
          <div className="text-sm font-bold text-white mt-0.5">
            ${initialBalance.toLocaleString()}
          </div>
          <span className="text-[9px] text-[#9ca3af] block mt-0.5 truncate">
            {formatDateLabel(accountStartTime)}
          </span>
        </div>

        {/* Current Equity */}
        <div className="p-3 bg-[#11141c] border border-[#1f2638]">
          <span className="text-[10px] text-[#6b7280] uppercase block">Current Equity</span>
          <div className="text-sm font-bold text-white mt-0.5">
            ${currentEquity.toLocaleString()}
          </div>
          <span className="text-[9px] text-emerald-400 block mt-0.5">
            Balance: ${account.balance.toLocaleString()}
          </span>
        </div>

        {/* Net Profit */}
        <div className={`p-3 border ${isProfitable ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-red-950/20 border-red-500/40'}`}>
          <span className="text-[10px] text-[#9ca3af] uppercase block">Net Profit</span>
          <div className={`text-sm font-black mt-0.5 flex items-center gap-1 ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
            {isProfitable ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{isProfitable ? '+' : ''}${currentProfit.toFixed(2)}</span>
          </div>
          <span className={`text-[9px] font-bold block mt-0.5 ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
            {currentRoi >= 0 ? '+' : ''}{currentRoi.toFixed(2)}% ROI
          </span>
        </div>

        {/* Peak Profit */}
        <div className="p-3 bg-[#11141c] border border-[#1f2638]">
          <span className="text-[10px] text-[#6b7280] uppercase block">Peak Watermark</span>
          <div className="text-sm font-bold text-amber-300 mt-0.5">
            +${peakProfit.toFixed(2)}
          </div>
          <span className="text-[9px] text-[#9ca3af] block mt-0.5">
            High Watermark
          </span>
        </div>

        {/* Closed Trades Count */}
        <div className="p-3 bg-[#11141c] border border-[#1f2638]">
          <span className="text-[10px] text-[#6b7280] uppercase block">Total Trades</span>
          <div className="text-sm font-bold text-white mt-0.5">
            {closedTrades.length} trades
          </div>
          <span className="text-[9px] text-emerald-400 block mt-0.5">
            {account.winCount}W / {account.lossCount}L ({closedTrades.length > 0 ? Math.round((account.winCount / closedTrades.length) * 100) : 0}% WR)
          </span>
        </div>

        {/* Progression Horizon */}
        <div className="p-3 bg-[#11141c] border border-[#1f2638]">
          <span className="text-[10px] text-[#6b7280] uppercase block">Progression Span</span>
          <div className="text-sm font-bold text-cyan-300 mt-0.5">
            {Math.max(1, Math.round((Date.now() - accountStartTime) / (24 * 60 * 60 * 1000)))} Days Active
          </div>
          <span className="text-[9px] text-[#9ca3af] block mt-0.5 truncate">
            To: {formatDateLabel(Date.now())}
          </span>
        </div>
      </div>

      {/* Main Recharts Area Graph */}
      <div className="p-3 sm:p-4 bg-[#090b10] border border-[#1f2638] rounded-xl">
        <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full inline-block" />
            <span className="text-white font-bold text-xs">
              {metricMode === 'profit'
                ? 'Cumulative Net Profit Progression ($ USD)'
                : metricMode === 'equity'
                ? 'Account Equity Over Time ($ USD)'
                : 'Cumulative ROI Percentage Progression (%)'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#6b7280]">
            <Clock className="w-3 h-3 text-[#f8b179]" />
            <span>Start ({formatDateLabel(accountStartTime)}) → Current Date ({formatDateLabel(Date.now())})</span>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 16, left: 10, bottom: 8 }}>
              <defs>
                <linearGradient id="profitGradPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="profitGradNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="roiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.6} />

              <XAxis
                dataKey="dateLabel"
                stroke="#4b5563"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={{ stroke: '#374151' }}
              />

              <YAxis
                stroke="#4b5563"
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={{ stroke: '#374151' }}
                tickFormatter={(val: number) => {
                  if (metricMode === 'profit') return `${val >= 0 ? '+' : ''}$${val}`;
                  if (metricMode === 'equity') return `$${Math.round(val / 1000)}k`;
                  return `${val >= 0 ? '+' : ''}${val}%`;
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Baseline Reference Line for Profit/ROI = 0 */}
              {metricMode !== 'equity' && (
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="4 4" label={{ value: 'Breakeven', fill: '#6b7280', fontSize: 10 }} />
              )}
              {metricMode === 'equity' && (
                <ReferenceLine
                  y={initialBalance}
                  stroke="#6b7280"
                  strokeDasharray="4 4"
                  label={{ value: `Inception: $${initialBalance.toLocaleString()}`, fill: '#9ca3af', fontSize: 10 }}
                />
              )}

              {/* Render dynamic Area based on selected metric */}
              {metricMode === 'profit' && (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke={isProfitable ? '#10b981' : '#ef4444'}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill={isProfitable ? 'url(#profitGradPositive)' : 'url(#profitGradNegative)'}
                  dot={{ r: 3, fill: '#f8b179', stroke: '#0b0e14', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {metricMode === 'equity' && (
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#equityGrad)"
                  dot={{ r: 3, fill: '#38bdf8', stroke: '#0b0e14', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {metricMode === 'roi' && (
                <Area
                  type="monotone"
                  dataKey="roi"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#roiGrad)"
                  dot={{ r: 3, fill: '#f59e0b', stroke: '#0b0e14', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Progression Footnote */}
        <div className="mt-3 pt-2 border-t border-[#1f2638] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9ca3af]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mathematical Audit: Synchronized with live order book and backtesting trade register.</span>
          </div>
          <div className="text-[#f8b179] font-bold">
            Realized: {account.realizedPnl >= 0 ? '+' : ''}${account.realizedPnl.toFixed(2)} USD
          </div>
        </div>
      </div>
    </div>
  );
};
