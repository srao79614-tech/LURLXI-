import React from 'react';
import { DemoClosedTrade } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  Activity,
  Award,
  Download,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';

interface TradePerformanceSummaryProps {
  closedTrades: DemoClosedTrade[];
  onExportCsv?: () => void;
}

export const TradePerformanceSummary: React.FC<TradePerformanceSummaryProps> = ({
  closedTrades,
  onExportCsv,
}) => {
  // 1. Trade Count Metrics
  const totalTrades = closedTrades.length;
  const longTrades = closedTrades.filter((t) => t.side === 'BUY').length;
  const shortTrades = closedTrades.filter((t) => t.side === 'SELL').length;
  const totalMarginUsd = closedTrades.reduce((acc, t) => acc + (t.sizeUsd || 0), 0);
  const totalBtcVolume = closedTrades.reduce((acc, t) => acc + (t.sizeBtc || 0), 0);

  // 2. Win Rate Metrics
  const winningTrades = closedTrades.filter((t) => t.profit > 0);
  const losingTrades = closedTrades.filter((t) => t.profit < 0);
  const breakEvenTrades = closedTrades.filter((t) => t.profit === 0);

  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const lossRate = totalTrades > 0 ? (losingTrades.length / totalTrades) * 100 : 0;

  // 3. Profit / Loss Metrics
  const netProfitLoss = closedTrades.reduce((acc, t) => acc + t.profit, 0);
  const grossProfit = winningTrades.reduce((acc, t) => acc + t.profit, 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.profit, 0));
  const profitFactor =
    grossLoss > 0
      ? (grossProfit / grossLoss).toFixed(2)
      : grossProfit > 0
      ? 'MAX'
      : '0.00';

  const averageTradePnL = totalTrades > 0 ? netProfitLoss / totalTrades : 0;
  const averageRoi = totalTrades > 0 ? closedTrades.reduce((acc, t) => acc + (t.roi || 0), 0) / totalTrades : 0;
  const bestTrade = totalTrades > 0 ? Math.max(...closedTrades.map((t) => t.profit)) : 0;
  const worstTrade = totalTrades > 0 ? Math.min(...closedTrades.map((t) => t.profit)) : 0;

  const isProfitable = netProfitLoss >= 0;

  return (
    <div
      id="trade-performance-summary-card"
      className="rounded-xl bg-gradient-to-b from-[#111624] to-[#0c101a] border border-[#232c40] p-4 sm:p-5 shadow-2xl relative overflow-hidden"
    >
      {/* Background Accent Gradient Glow */}
      <div
        className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15 ${
          isProfitable ? 'bg-emerald-500' : 'bg-red-500'
        }`}
      />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1d2538] relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f8b179]/10 border border-[#f8b179]/30 flex items-center justify-center text-[#f8b179] shadow-inner">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-mono font-bold text-white tracking-wide">
                Trade Performance Summary
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Auto-Calculated
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#9ca3af] mt-0.5">
              Live algorithmic statistics compiled across {totalTrades} executed demo orders
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          {onExportCsv && totalTrades > 0 && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-1.5 rounded text-[11px] font-mono font-semibold bg-[#182032] hover:bg-[#222d46] text-[#cbd5e1] hover:text-white border border-[#2b3954] flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              title="Download Trade History as CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#f8b179]" />
              <span>Export CSV</span>
            </button>
          )}

          <div
            className={`px-3 py-1 rounded text-xs font-mono font-bold border flex items-center gap-1.5 ${
              isProfitable
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : 'bg-red-950/80 text-red-300 border-red-700/60'
            }`}
          >
            {isProfitable ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Profitable Portfolio</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>Drawdown Phase</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3 Primary Highlighted Metrics: Win Rate, Net PnL, Trade Count */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4 relative z-10">
        {/* Metric 1: TOTAL WIN RATE */}
        <div className="p-3.5 rounded-lg bg-[#0e121c] border border-[#1e2638] hover:border-[#2f3c57] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                Total Win Rate
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                PF: {profitFactor}x
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                {winRate.toFixed(1)}%
              </span>
              <span className="text-xs font-mono text-[#9ca3af]">
                ({winningTrades.length}W / {losingTrades.length}L)
              </span>
            </div>

            {/* Visual Dual-Ratio Bar */}
            <div className="w-full h-2 rounded-full bg-[#182030] overflow-hidden flex mt-2.5">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${totalTrades > 0 ? winRate : 0}%` }}
                title={`Win Rate: ${winRate.toFixed(1)}%`}
              />
              <div
                className="bg-red-500 h-full transition-all duration-500"
                style={{ width: `${totalTrades > 0 ? lossRate : 0}%` }}
                title={`Loss Rate: ${lossRate.toFixed(1)}%`}
              />
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-[#181f2f] flex items-center justify-between text-[10px] font-mono text-[#cbd5e1]">
            <span>
              Wins: <strong className="text-emerald-400">+{winningTrades.length}</strong>
            </span>
            <span>
              Losses: <strong className="text-red-400">-{losingTrades.length}</strong>
            </span>
            <span>
              Breakeven: <strong className="text-[#9ca3af]">{breakEvenTrades.length}</strong>
            </span>
          </div>
        </div>

        {/* Metric 2: NET PROFIT / LOSS */}
        <div className="p-3.5 rounded-lg bg-[#0e121c] border border-[#1e2638] hover:border-[#2f3c57] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-[#f8b179]" />
                Net Profit / Loss
              </span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isProfitable
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40'
                    : 'bg-red-950 text-red-300 border border-red-800/40'
                }`}
              >
                Avg ROI: {averageRoi >= 0 ? '+' : ''}
                {averageRoi.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span
                className={`text-2xl sm:text-3xl font-bold font-mono ${
                  isProfitable ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isProfitable ? '+' : ''}${netProfitLoss.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-[#9ca3af]">USD</span>
            </div>

            <div className="text-[11px] font-mono text-[#cbd5e1] mt-2">
              Avg per trade:{' '}
              <strong className={averageTradePnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {averageTradePnL >= 0 ? '+' : ''}${averageTradePnL.toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-[#181f2f] flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#9ca3af]">
              Best: <strong className="text-emerald-400">+${bestTrade.toFixed(2)}</strong>
            </span>
            <span className="text-[#9ca3af]">
              Worst: <strong className="text-red-400">${worstTrade.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Metric 3: TRADE COUNT */}
        <div className="p-3.5 rounded-lg bg-[#0e121c] border border-[#1e2638] hover:border-[#2f3c57] transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-400" />
                Trade Count
              </span>
              <span className="text-xs font-mono text-[#cbd5e1]">
                {totalBtcVolume.toFixed(3)} BTC
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                {totalTrades}
              </span>
              <span className="text-xs font-mono text-[#9ca3af]">Closed Executions</span>
            </div>

            <div className="flex items-center gap-2 mt-2 text-[11px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">
                {longTrades} Longs ({totalTrades > 0 ? ((longTrades / totalTrades) * 100).toFixed(0) : 0}%)
              </span>
              <span className="px-2 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-800/40">
                {shortTrades} Shorts ({totalTrades > 0 ? ((shortTrades / totalTrades) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-[#181f2f] flex items-center justify-between text-[10px] font-mono text-[#9ca3af]">
            <span>Total Margin Allocated:</span>
            <strong className="text-white">${totalMarginUsd.toLocaleString()} USD</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
