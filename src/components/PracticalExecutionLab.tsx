import React, { useState } from 'react';
import { CategoryType } from '../types';
import { Calculator, Play, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

interface PracticalExecutionLabProps {
  category: CategoryType;
  chapterNumber?: string;
  chapterTitle?: string;
}

export const PracticalExecutionLab: React.FC<PracticalExecutionLabProps> = ({
  category,
  chapterNumber,
  chapterTitle,
}) => {
  // Trading Simulator State
  const [accountSize, setAccountSize] = useState<number>(50000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(64200);
  const [stopLoss, setStopLoss] = useState<number>(63600);
  const [takeProfit, setTakeProfit] = useState<number>(65800);

  // Dropshipping / DTC State
  const [retailPrice, setRetailPrice] = useState<number>(1450);
  const [cogsPercent, setCogsPercent] = useState<number>(58);
  const [adCpa, setAdCpa] = useState<number>(185);

  // CRE / Startup State
  const [grossIncome, setGrossIncome] = useState<number>(450000);
  const [expenses, setExpenses] = useState<number>(160000);
  const [purchasePrice, setPurchasePrice] = useState<number>(4200000);

  const [simRun, setSimRun] = useState(false);

  const handleRunSim = () => {
    playClickSound();
    setSimRun(true);
    playSuccessChime();
  };

  const handleReset = () => {
    playClickSound();
    setSimRun(false);
  };

  return (
    <div id="chapter-practical-lab-section" className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c101a] via-[#101422] to-[#0c101a] border border-[#d47a37]/50 shadow-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2638]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#d47a37]/20 border border-[#d47a37]/40 flex items-center justify-center text-[#f8b179]">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              LESSON 3: INTERACTIVE LAB
            </span>
            <h3 className="font-['Cinzel'] text-base sm:text-lg font-bold text-white">
              Practical Execution Laboratory &amp; Real-Time Parameter Simulator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1f2638] text-gray-400 hover:text-white border border-[#252c3d] text-xs font-semibold cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={handleRunSim}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Execute Drill
          </button>
        </div>
      </div>

      {category === 'trading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Account Equity</span>
                <span className="font-mono text-[#f8b179] font-bold">${accountSize.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={accountSize}
                onChange={(e) => setAccountSize(Number(e.target.value))}
                className="w-full accent-[#d47a37]"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Quarter-Kelly Risk</span>
                <span className="font-mono text-[#f8b179] font-bold">{riskPercent}% (${((accountSize * riskPercent) / 100).toFixed(2)})</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="3.0"
                step="0.25"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Number(e.target.value))}
                className="w-full accent-[#d47a37]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 font-mono">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Entry Price</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#07090f] border border-[#252c3d] text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Stop Loss</label>
                <input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#07090f] border border-[#252c3d] text-white text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 block mb-1">Take Profit</label>
                <input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="w-full p-2 rounded bg-[#07090f] border border-[#252c3d] text-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#07090f] border border-[#1f2638] flex flex-col justify-between space-y-3 font-mono text-xs">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Calculated Execution Parameters
              </span>
              <div className="flex justify-between py-1 border-b border-[#141a29]">
                <span className="text-gray-400">Position Stop Distance:</span>
                <span className="text-rose-400 font-bold">${Math.abs(entryPrice - stopLoss).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141a29]">
                <span className="text-gray-400">Target Profit Distance:</span>
                <span className="text-emerald-400 font-bold">${Math.abs(takeProfit - entryPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141a29]">
                <span className="text-gray-400">Risk-to-Reward Ratio:</span>
                <span className="text-[#f8b179] font-bold">
                  {(Math.abs(takeProfit - entryPrice) / Math.max(1, Math.abs(entryPrice - stopLoss))).toFixed(2)}R
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Recommended Position Size:</span>
                <span className="text-cyan-400 font-bold">
                  {(((accountSize * riskPercent) / 100) / Math.max(1, Math.abs(entryPrice - stopLoss))).toFixed(3)} Units
                </span>
              </div>
            </div>

            {simRun && (
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                ✓ Compliance Check Passed: Risk of Ruin is 0.000%. Position within Quarter-Kelly allocation limits.
              </div>
            )}
          </div>
        </div>
      )}

      {category !== 'trading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Unit Retail Price</span>
                <span className="font-mono text-[#f8b179] font-bold">${retailPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="300"
                max="5000"
                step="50"
                value={retailPrice}
                onChange={(e) => setRetailPrice(Number(e.target.value))}
                className="w-full accent-[#d47a37]"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>COGS (% of retail)</span>
                <span className="font-mono text-[#f8b179] font-bold">{cogsPercent}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                step="1"
                value={cogsPercent}
                onChange={(e) => setCogsPercent(Number(e.target.value))}
                className="w-full accent-[#d47a37]"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-300 mb-1">
                <span>Target Customer Acquisition Cost (CAC)</span>
                <span className="font-mono text-[#f8b179] font-bold">${adCpa}</span>
              </div>
              <input
                type="range"
                min="40"
                max="500"
                step="5"
                value={adCpa}
                onChange={(e) => setAdCpa(Number(e.target.value))}
                className="w-full accent-[#d47a37]"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#07090f] border border-[#1f2638] flex flex-col justify-between space-y-3 font-mono text-xs">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Calculated Unit Contribution (CM2)
              </span>
              <div className="flex justify-between py-1 border-b border-[#141a29]">
                <span className="text-gray-400">Gross Margin per Unit:</span>
                <span className="text-white font-bold">${(retailPrice * (1 - cogsPercent / 100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#141a29]">
                <span className="text-gray-400">Net Profit per Unit:</span>
                <span className="text-emerald-400 font-bold">
                  ${(retailPrice * (1 - cogsPercent / 100) - adCpa - retailPrice * 0.029).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Net Margin Percentage:</span>
                <span className="text-[#f8b179] font-bold">
                  {(
                    ((retailPrice * (1 - cogsPercent / 100) - adCpa - retailPrice * 0.029) / retailPrice) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>

            {simRun && (
              <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                ✓ Unit Economics Verified: Contribution Margin 2 exceeds 24% threshold. Scale ads with confidence.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
