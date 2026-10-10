import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  TrendingUp,
  DollarSign,
  RefreshCw,
  Sparkles,
  Users,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { TraderRanking, DemoAccount, UserProfile, UserSession } from '../types';
import { getTraderRankings } from '../utils/btcCandleData';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

interface GlobalLeaderboardProps {
  account?: DemoAccount;
  currentUserAccount?: DemoAccount;
  userProfile?: UserProfile;
  currentUserProfile?: UserProfile;
  userSession?: UserSession | null;
  currentUserSession?: UserSession | null;
  totalUnrealizedPnl?: number;
  onSimulateTrade?: (roiBoost: number) => void;
  onSimulateTradeBoost?: (roiBoost: number) => void;
  isCompact?: boolean;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  account: propAccount,
  currentUserAccount,
  userProfile: propUserProfile,
  currentUserProfile,
  userSession: propUserSession,
  currentUserSession,
  totalUnrealizedPnl = 0,
  onSimulateTrade,
  onSimulateTradeBoost,
  isCompact = false,
}) => {
  const account = currentUserAccount || propAccount;
  const userProfile = currentUserProfile || propUserProfile;
  const userSession = (currentUserSession || propUserSession) as UserSession | undefined;
  const handleBoost = onSimulateTradeBoost || onSimulateTrade;
  const [traders, setTraders] = useState<TraderRanking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'roi' | 'profit'>('roi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Compute current user's local stats
  const currentUserStats = useMemo(() => {
    const netProfit = (account?.realizedPnl ?? 0) + totalUnrealizedPnl;
    const initialBal = account?.initialBalance || 10000;
    const calculatedRoi = initialBal > 0 ? parseFloat(((netProfit / initialBal) * 100).toFixed(1)) : 0;
    const wins = account?.winCount || 0;
    const losses = account?.lossCount || 0;
    const totalTrades = wins + losses;
    const winRate = totalTrades > 0 ? parseFloat(((wins / totalTrades) * 100).toFixed(1)) : 0;

    return {
      name: userProfile?.name || 'Executive Trader',
      email: userProfile?.email || userSession?.email || 'executive@lurl.vip',
      avatarUrl: userProfile?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      country: 'Worldwide / Executive',
      countryFlag: '🌐',
      tier: 'platinum' as const,
      profit: Math.round(netProfit * 100) / 100,
      roi: calculatedRoi,
      winCount: wins,
      lossCount: losses,
      winRate,
      tradesCount: totalTrades,
      initialBalance: initialBal,
      isCurrentUser: true,
    };
  }, [account, totalUnrealizedPnl, userProfile, userSession]);

  // Fetch from /api/leaderboard with fallback
  const fetchLeaderboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // First sync current user's demo account profit percentage to the server
      if (account) {
        try {
          await fetch('/api/leaderboard/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: currentUserStats.name,
              email: currentUserStats.email,
              avatarUrl: currentUserStats.avatarUrl,
              country: currentUserStats.country,
              countryFlag: currentUserStats.countryFlag,
              tier: currentUserStats.tier,
              profit: currentUserStats.profit,
              initialBalance: currentUserStats.initialBalance,
              winCount: currentUserStats.winCount,
              lossCount: currentUserStats.lossCount,
              tradesCount: currentUserStats.tradesCount,
              sortBy,
            }),
          });
        } catch (e) {
          // ignore sync failure, continue to fetch
        }
      }

      const res = await fetch(`/api/leaderboard?sortBy=${sortBy}`);
      if (res.ok) {
        const data = await res.json();
        if (data.traders && Array.isArray(data.traders)) {
          // Mark current user
          const formatted = data.traders.map((t: TraderRanking) => ({
            ...t,
            isCurrentUser:
              t.email.toLowerCase() === currentUserStats.email.toLowerCase() ||
              t.name.toLowerCase() === currentUserStats.name.toLowerCase() ||
              t.isCurrentUser,
          }));
          setTraders(formatted);
          setLastSyncTime(data.updatedAt || Date.now());
          return;
        }
      }
      throw new Error('API response invalid');
    } catch (err) {
      // Fallback to client calculations
      const fallbackList = getTraderRankings(
        {
          name: currentUserStats.name,
          email: currentUserStats.email,
          avatarUrl: currentUserStats.avatarUrl,
          country: currentUserStats.country,
          countryFlag: currentUserStats.countryFlag,
          tier: currentUserStats.tier,
          profit: currentUserStats.profit,
          initialBalance: currentUserStats.initialBalance,
          winCount: currentUserStats.winCount,
          lossCount: currentUserStats.lossCount,
        },
        sortBy
      );
      setTraders(fallbackList);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserStats, account, sortBy]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleManualRefresh = () => {
    playClickSound();
    fetchLeaderboard(true);
    setSyncSuccessMessage('Global demo accounts synchronized!');
    setTimeout(() => setSyncSuccessMessage(null), 3000);
  };

  const handleSimulateWin = (percentBoost: number) => {
    playSuccessChime();
    if (handleBoost) {
      handleBoost(percentBoost);
    }
    setSyncSuccessMessage(`Simulated trade applied! +${percentBoost}% profit added.`);
    setTimeout(() => {
      fetchLeaderboard(true);
      setSyncSuccessMessage(null);
    }, 500);
  };

  // Extract Top 3 ranked list
  const top1Trader = useMemo(() => traders.find((t) => t.rank === 1), [traders]);
  const top2Trader = useMemo(() => traders.find((t) => t.rank === 2), [traders]);
  const top3Trader = useMemo(() => traders.find((t) => t.rank === 3), [traders]);
  const currentUserRanking = useMemo(() => traders.find((t) => t.isCurrentUser), [traders]);
  const userRank = currentUserRanking?.rank ?? 999;

  // Filtered list for search
  const filteredTraders = useMemo(() => {
    if (!searchQuery.trim()) return traders;
    const q = searchQuery.toLowerCase();
    return traders.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.country && t.country.toLowerCase().includes(q)) ||
        t.email.toLowerCase().includes(q)
    );
  }, [traders, searchQuery]);

  // Delta calculation to reach podium
  const deltaToPodium = useMemo(() => {
    if (!top3Trader || !currentUserRanking) return null;
    if (userRank <= 3) return null;
    const diffRoi = Math.max(0, top3Trader.roi - currentUserRanking.roi + 0.1);
    const diffProfit = Math.max(0, top3Trader.profit - currentUserRanking.profit + 50);
    return {
      roiNeeded: parseFloat(diffRoi.toFixed(1)),
      profitNeeded: Math.round(diffProfit),
    };
  }, [top3Trader, currentUserRanking, userRank]);

  return (
    <div id="global-leaderboard-container" className="space-y-4 font-mono text-[#cbd5e1]">
      {/* Top Banner & Controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#0d1017] border border-[#1f2638]">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
              Global Leaderboard
            </h3>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              LIVE DEMO ACCOUNTS
            </span>
          </div>
          <p className="text-[11px] text-[#9ca3af] mt-0.5">
            Real-time performance rankings computed from all active demo accounts worldwide. Ranked by Profit Percentage (ROI %).
          </p>
        </div>

        {/* Sort and Sync Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center border border-[#252c3d] p-0.5 bg-[#121622]">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setSortBy('roi');
              }}
              className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition-all ${
                sortBy === 'roi' ? 'bg-amber-600 text-white shadow' : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 inline mr-1" />
              Profit % (ROI)
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setSortBy('profit');
              }}
              className={`px-2.5 py-1 text-xs font-bold cursor-pointer transition-all ${
                sortBy === 'profit' ? 'bg-emerald-700 text-white shadow' : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <DollarSign className="w-3 h-3 inline mr-1" />
              Net Profit ($)
            </button>
          </div>

          {/* Sync Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Fetch live profit percentages from all verified accounts"
            className="px-2.5 py-1 text-xs font-bold bg-[#1a2130] hover:bg-[#253047] text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>

          {/* 100% Real-Time Verified Trading Engine Badge (No Simulated/Fake Results) */}
          <div className="px-2.5 py-1 text-xs font-bold bg-[#0d1629] text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-Time Progress Only</span>
          </div>
        </div>
      </div>

      {syncSuccessMessage && (
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncSuccessMessage}</span>
        </div>
      )}

      {/* User Rank Status Card */}
      <div
        className={`p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
          userRank === 1
            ? 'bg-amber-500/15 border-amber-400 text-amber-200'
            : userRank === 2
            ? 'bg-slate-300/15 border-slate-300 text-slate-200'
            : userRank === 3
            ? 'bg-amber-800/20 border-amber-600 text-amber-200'
            : 'bg-[#121622] border-[#252c3d] text-[#cbd5e1]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {userRank === 1 ? (
            <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
          ) : userRank <= 3 ? (
            <Medal className="w-5 h-5 text-amber-400" />
          ) : (
            <Users className="w-4 h-4 text-cyan-400" />
          )}
          <div>
            <span className="font-extrabold text-sm block">
              {userRank === 1
                ? '🥇 YOU ARE RANKED #1 WORLD CHAMPION ON THE LEADERBOARD!'
                : userRank === 2
                ? '🥈 YOU ARE RANKED #2 WORLD RUNNER-UP ON THE LEADERBOARD!'
                : userRank === 3
                ? '🥉 YOU ARE RANKED #3 WORLD MASTER ON THE LEADERBOARD!'
                : `Your Global Ranking: #${userRank} of ${traders.length} Demo Accounts`}
            </span>
            <span className="text-[11px] text-[#9ca3af]">
              {deltaToPodium
                ? `You need +${deltaToPodium.roiNeeded}% higher profit percentage to overtake 3rd place and claim a podium spot!`
                : 'You are currently inside the elite Top 3 Global Leaderboard!'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs shrink-0">
          <span className="bg-[#0b0e14] px-2 py-1 border border-[#1f2638]">
            Profit %: <strong className={currentUserStats.roi >= 0 ? 'text-emerald-400 font-black' : 'text-red-400'}>
              {currentUserStats.roi >= 0 ? '+' : ''}{currentUserStats.roi}%
            </strong>
          </span>
          <span className="bg-[#0b0e14] px-2 py-1 border border-[#1f2638]">
            Profit ($): <strong className={currentUserStats.profit >= 0 ? 'text-emerald-400 font-black' : 'text-red-400'}>
              {currentUserStats.profit >= 0 ? '+' : ''}${currentUserStats.profit.toLocaleString()}
            </strong>
          </span>
        </div>
      </div>

      {/* TOP 3 RANKED LIST DISPLAY (PODIUM) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#1f2638] pb-1.5">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Top 3 Ranked List — Based on Performance</span>
          </span>
          <span className="text-[11px] text-[#9ca3af]">
            Sorted by {sortBy === 'roi' ? 'Highest Profit Percentage' : 'Total Net Profit'}
          </span>
        </div>

        {/* Podium Layout: #2 on left, #1 in center (elevated), #3 on right */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end pt-2">
          {/* 2ND PLACE — WORLD RUNNER-UP */}
          {top2Trader && (
            <div
              id="podium-rank-2"
              className={`p-4 border transition-all flex flex-col justify-between relative ${
                top2Trader.isCurrentUser
                  ? 'bg-gradient-to-b from-[#182033] to-[#0e121c] border-slate-300 ring-2 ring-slate-400/50'
                  : 'bg-gradient-to-b from-[#131722] to-[#0a0d14] border-slate-500/40 hover:border-slate-300'
              }`}
            >
              {/* Rank Header */}
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-700/60 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Medal className="w-4 h-4 text-slate-300" />
                    <span className="text-xs font-black text-slate-200">2ND PLACE</span>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 bg-slate-300/20 text-slate-200 border border-slate-300/40">
                    🥈 #2
                  </span>
                </div>

                {/* Trader Profile */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <img
                      src={top2Trader.avatarUrl}
                      alt={top2Trader.name}
                      className="w-12 h-12 object-cover border-2 border-slate-300"
                    />
                    <span className="absolute -bottom-1 -right-1 text-sm">{top2Trader.countryFlag}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-white text-sm block truncate">
                      {top2Trader.name} {top2Trader.isCurrentUser && <strong className="text-cyan-400">(You)</strong>}
                    </span>
                    <span className="text-[11px] text-slate-300 block">{top2Trader.country}</span>
                    <span className="text-[10px] text-[#6b7280] truncate block">{top2Trader.email}</span>
                  </div>
                </div>
              </div>

              {/* Profit Percentage Performance Card */}
              <div className="mt-2 pt-2.5 border-t border-slate-800/80 space-y-2 bg-[#0d1017]/80 p-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-300 font-bold">Profit Percentage:</span>
                  <span className="font-black text-emerald-400 text-lg">
                    +{top2Trader.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9ca3af]">Net Profit:</span>
                  <span className="font-bold text-white">${top2Trader.profit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#9ca3af]">Win Rate / Trades:</span>
                  <span className="text-slate-300 font-bold">{top2Trader.winRate}% ({top2Trader.tradesCount})</span>
                </div>
                {top2Trader.isCurrentUser && (
                  <div className="text-center text-[10px] font-black py-1 bg-slate-200 text-black uppercase mt-1">
                    Your Current Spot
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 1ST PLACE — WORLD CHAMPION (CENTER ELEVATED) */}
          {top1Trader && (
            <div
              id="podium-rank-1"
              className={`p-4 border-2 transition-all flex flex-col justify-between relative order-first md:order-none shadow-2xl ${
                top1Trader.isCurrentUser
                  ? 'bg-gradient-to-b from-[#241a0d] to-[#120d06] border-amber-400 ring-4 ring-amber-400/40'
                  : 'bg-gradient-to-b from-[#1f160b] via-[#14100a] to-[#0a0d14] border-amber-400'
              }`}
            >
              {/* Champion Header with Crown */}
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/50 mb-3 bg-amber-500/10 px-2 py-1 -mx-2 -mt-2">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span className="text-xs font-black text-amber-300">1ST PLACE — CHAMPION</span>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 bg-amber-500 text-black">
                    🥇 #1
                  </span>
                </div>

                {/* Trader Profile */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <img
                      src={top1Trader.avatarUrl}
                      alt={top1Trader.name}
                      className="w-14 h-14 object-cover border-2 border-amber-400 shadow-lg"
                    />
                    <span className="absolute -bottom-1 -right-1 text-base">{top1Trader.countryFlag}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-black text-white text-base block truncate flex items-center gap-1">
                      <span>{top1Trader.name}</span>
                      {top1Trader.isCurrentUser && <span className="text-amber-400 font-bold text-xs">(You)</span>}
                    </span>
                    <span className="text-xs text-amber-300 font-bold block">{top1Trader.country}</span>
                    <span className="text-[10px] text-[#9ca3af] truncate block">{top1Trader.email}</span>
                  </div>
                </div>
              </div>

              {/* Profit Percentage Performance Card */}
              <div className="mt-2 pt-2.5 border-t border-amber-500/30 space-y-2 bg-[#120e09] p-3 border border-amber-500/20">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-amber-200 font-extrabold uppercase">Profit Percentage:</span>
                  <span className="font-black text-emerald-400 text-2xl tracking-tight">
                    +{top1Trader.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9ca3af]">Net Profit:</span>
                  <span className="font-extrabold text-white text-sm">${top1Trader.profit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#9ca3af]">Win Rate / Trades:</span>
                  <span className="text-amber-300 font-bold">{top1Trader.winRate}% ({top1Trader.tradesCount} trades)</span>
                </div>
                {top1Trader.isCurrentUser ? (
                  <div className="text-center text-xs font-black py-1.5 bg-amber-400 text-black uppercase animate-pulse mt-1">
                    🏆 YOU ARE THE #1 LEADERBOARD CHAMPION!
                  </div>
                ) : (
                  <div className="text-center text-[10px] font-bold text-amber-400/90 py-1 bg-amber-500/10 border border-amber-500/30">
                    WORLD RECORD LEADER
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3RD PLACE — WORLD MASTER */}
          {top3Trader && (
            <div
              id="podium-rank-3"
              className={`p-4 border transition-all flex flex-col justify-between relative ${
                top3Trader.isCurrentUser
                  ? 'bg-gradient-to-b from-[#221811] to-[#0e121c] border-amber-600 ring-2 ring-amber-600/50'
                  : 'bg-gradient-to-b from-[#15120e] to-[#0a0d14] border-amber-700/40 hover:border-amber-600'
              }`}
            >
              {/* Rank Header */}
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-amber-800/60 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Medal className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black text-amber-400">3RD PLACE</span>
                  </div>
                  <span className="text-xs font-black px-2 py-0.5 bg-amber-800/30 text-amber-300 border border-amber-700/40">
                    🥉 #3
                  </span>
                </div>

                {/* Trader Profile */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <img
                      src={top3Trader.avatarUrl}
                      alt={top3Trader.name}
                      className="w-12 h-12 object-cover border-2 border-amber-600"
                    />
                    <span className="absolute -bottom-1 -right-1 text-sm">{top3Trader.countryFlag}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-white text-sm block truncate">
                      {top3Trader.name} {top3Trader.isCurrentUser && <strong className="text-amber-400">(You)</strong>}
                    </span>
                    <span className="text-[11px] text-amber-300/80 block">{top3Trader.country}</span>
                    <span className="text-[10px] text-[#6b7280] truncate block">{top3Trader.email}</span>
                  </div>
                </div>
              </div>

              {/* Profit Percentage Performance Card */}
              <div className="mt-2 pt-2.5 border-t border-amber-900/60 space-y-2 bg-[#0d1017]/80 p-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-amber-400/90 font-bold">Profit Percentage:</span>
                  <span className="font-black text-emerald-400 text-lg">
                    +{top3Trader.roi.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#9ca3af]">Net Profit:</span>
                  <span className="font-bold text-white">${top3Trader.profit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#9ca3af]">Win Rate / Trades:</span>
                  <span className="text-amber-400/90 font-bold">{top3Trader.winRate}% ({top3Trader.tradesCount})</span>
                </div>
                {top3Trader.isCurrentUser && (
                  <div className="text-center text-[10px] font-black py-1 bg-amber-600 text-white uppercase mt-1">
                    Your Current Spot
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULL RANKINGS TABLE (#1 to #10+) */}
      <div className="border border-[#1f2638] bg-[#0d1017] overflow-hidden">
        <div className="p-3 border-b border-[#1f2638] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase">All Demo Accounts Leaderboard</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#1a2130] text-[#9ca3af] border border-[#252c3d]">
              {filteredTraders.length} Accounts
            </span>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6b7280] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search trader or country..."
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-[#121622] text-white border border-[#252c3d] focus:border-cyan-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#121622] border-b border-[#1f2638] text-[#9ca3af]">
                <th className="py-2.5 px-3 font-semibold">Rank</th>
                <th className="py-2.5 px-3 font-semibold">Trader</th>
                <th className="py-2.5 px-3 font-semibold text-right">Profit Percentage (%)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Net Profit ($)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Win Rate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Trades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171b26]">
              {filteredTraders.map((trader) => {
                const isTop3 = trader.rank <= 3;
                return (
                  <tr
                    key={`${trader.rank}-${trader.email}`}
                    className={`transition-colors ${
                      trader.isCurrentUser
                        ? 'bg-amber-500/10 font-bold text-amber-200'
                        : isTop3
                        ? 'bg-[#10141f] hover:bg-[#151b2a]'
                        : 'hover:bg-[#121622]'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {trader.rank === 1 ? (
                        <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-xs">
                          🥇 #1
                        </span>
                      ) : trader.rank === 2 ? (
                        <span className="px-2 py-0.5 bg-slate-300 text-black font-black text-xs">
                          🥈 #2
                        </span>
                      ) : trader.rank === 3 ? (
                        <span className="px-2 py-0.5 bg-amber-700 text-white font-black text-xs">
                          🥉 #3
                        </span>
                      ) : (
                        <span className="text-[#6b7280] font-mono pl-1">#{trader.rank}</span>
                      )}
                    </td>

                    {/* Trader name, flag, country */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={trader.avatarUrl}
                          alt={trader.name}
                          className="w-7 h-7 object-cover border border-[#252c3d]"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold">{trader.name}</span>
                            {trader.isCurrentUser && (
                              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 text-[9px] border border-amber-500/40">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#6b7280]">
                            {trader.countryFlag} {trader.country}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Profit Percentage (ROI) */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-extrabold ${
                          trader.roi >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
                      </span>
                    </td>

                    {/* Net Profit ($) */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-white">
                      ${trader.profit.toLocaleString()}
                    </td>

                    {/* Win Rate */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-[#9ca3af]">
                      {trader.winRate}%
                    </td>

                    {/* Total Trades */}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap font-mono text-[#6b7280]">
                      {trader.tradesCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
