import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  CheckCircle2,
  Circle,
  Pencil,
  RotateCcw,
  Sparkles,
  Flame,
  Check,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { playSuccessChime, playClickSound } from '../utils/soundEffects';
import { logActivity } from '../utils/activityHistory';

interface DailyFocusProps {
  category: string;
  className?: string;
}

interface StoredDailyFocus {
  date: string;
  goal: string;
  completed: boolean;
  completedAt?: number;
  streak?: number;
}

const STORAGE_KEY = 'lurl_daily_business_focus_v1';

const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
  trading: [
    'Execute Wyckoff volume confirmation on all trade entries',
    'Limit risk to strict 1.0% per session with zero revenge orders',
    'Review 4H liquidity pools & log pre-market bias in trading journal',
    'Backtest 20 higher timeframe order block retests before placing live trade',
  ],
  dropshipping: [
    'Test 3 high-hook video creatives on TikTok Ads before noon',
    'Audit supplier lead times & negotiate 10% batch fulfillment discount',
    'Optimize product page CTA conversion rate via A/B hero layout',
    'Identify 2 breakout products with >3.5x markup potential',
  ],
  ecommerce: [
    'Deploy post-purchase Klaviyo flow to capture repeat orders within 7 days',
    'Audit top 5 exit-intent dropoff pages and streamline checkout funnel',
    'Review cohort LTV-to-CAC ratio across paid acquisition channels',
    'Set up automated SMS abandoned cart recovery sequence',
  ],
  startups: [
    'Conduct 5 in-depth user interviews with paying alpha testers',
    'Ship 1 high-friction onboarding bottleneck fix to improve week-1 retention',
    'Send targeted personalized outreach to 15 Tier-1 strategic partners',
    'Refine pitch deck unit economics slide with verified cohort metrics',
  ],
  startup: [
    'Conduct 5 in-depth user interviews with paying alpha testers',
    'Ship 1 high-friction onboarding bottleneck fix to improve week-1 retention',
    'Send targeted personalized outreach to 15 Tier-1 strategic partners',
    'Refine pitch deck unit economics slide with verified cohort metrics',
  ],
  'skill-development': [
    'Execute 45 minutes of deliberate practice at the boundary of failure',
    'Audit skill stack: identify one complementary asymmetric multiplier to acquire',
    'Take a 5-question mastery quiz in the 50 Skills Codex and deconstruct error patterns',
    'Review 10-step clinical roadmap and log daily myelin retention drill',
  ],
};

const DEFAULT_SUGGESTIONS = [
  'Execute the #1 highest-leverage revenue task before checking inbox',
  'Audit unit economics and eliminate lowest-margin operational bottleneck',
  'Automate or delegate one recurring workflow to reclaim 90 minutes',
  'Conduct 3 strategic customer outreach touchpoints to secure retention',
];

export const DailyFocus: React.FC<DailyFocusProps> = ({ category, className = '' }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const formattedToday = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const [goal, setGoal] = useState('');
  const [completed, setCompleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [streak, setStreak] = useState(1);
  const [justCompleted, setJustCompleted] = useState(false);

  // Load from localStorage on mount or date change
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: StoredDailyFocus = JSON.parse(raw);
        if (data.date === todayStr) {
          setGoal(data.goal || '');
          setCompleted(Boolean(data.completed));
          setInputValue(data.goal || '');
          setStreak(data.streak || 1);
          setIsEditing(!data.goal);
          return;
        } else {
          // New day rollover
          const prevCompleted = data.completed;
          const newStreak = prevCompleted ? (data.streak || 1) + 1 : 1;
          setStreak(newStreak);
          setGoal('');
          setCompleted(false);
          setInputValue('');
          setIsEditing(true);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setIsEditing(true);
  }, [todayStr]);

  const saveFocusState = (newGoal: string, newCompleted: boolean, newStreak: number) => {
    const data: StoredDailyFocus = {
      date: todayStr,
      goal: newGoal,
      completed: newCompleted,
      completedAt: newCompleted ? Date.now() : undefined,
      streak: newStreak,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  };

  const handleSetGoal = (targetGoal?: string) => {
    const textToSave = (targetGoal || inputValue).trim();
    if (!textToSave) return;
    playClickSound();
    setGoal(textToSave);
    setInputValue(textToSave);
    setIsEditing(false);
    saveFocusState(textToSave, completed, streak);

    logActivity(
      'system',
      'Daily Business Focus Set',
      `Target: "${textToSave.slice(0, 80)}" for ${formattedToday}`
    );
  };

  const handleToggleComplete = () => {
    const nextCompleted = !completed;
    setCompleted(nextCompleted);

    if (nextCompleted) {
      playSuccessChime();
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 2400);

      logActivity(
        'system',
        'Daily Business Focus Accomplished! 🎯',
        `Completed: "${goal}" on ${formattedToday} (Streak: ${streak}d)`
      );
    } else {
      playClickSound();
    }

    saveFocusState(goal, nextCompleted, streak);
  };

  const handleResetGoal = () => {
    playClickSound();
    setIsEditing(true);
    setInputValue(goal);
  };

  const handleClearGoal = () => {
    playClickSound();
    setGoal('');
    setInputValue('');
    setCompleted(false);
    setIsEditing(true);
    saveFocusState('', false, streak);
  };

  const currentSuggestions = CATEGORY_SUGGESTIONS[category] || DEFAULT_SUGGESTIONS;

  return (
    <div
      id="daily-focus-component"
      className={`relative rounded-2xl bg-gradient-to-r from-[#0d1017] via-[#111522] to-[#0d1017] border border-[#252c3d] hover:border-[#d47a37]/50 transition-all duration-300 p-4 sm:p-5 shadow-lg overflow-hidden ${className}`}
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#d47a37]/60 to-transparent pointer-events-none" />

      {/* Completion Aura Pulse */}
      <AnimatePresence>
        {justCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-emerald-500/10 pointer-events-none border border-emerald-500/40 rounded-2xl z-0"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        {/* Header Badge & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              completed
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                : 'bg-gradient-to-br from-[#d47a37]/25 to-[#b85d19]/15 text-[#f8b179] border border-[#d47a37]/35'
            }`}
          >
            {completed ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Cinzel'] text-xs font-bold text-white tracking-wider uppercase">
                Daily Focus
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181f2f] text-[#9ca3af] border border-[#252f44]">
                {formattedToday}
              </span>
              <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>{streak}d Streak</span>
              </span>
            </div>
            <p className="text-[11px] text-[#9ca3af] mt-0.5">
              One non-negotiable operational milestone for today
            </p>
          </div>
        </div>

        {/* Content Section: Either Setting or Active Goal */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSetGoal();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Set your primary business objective for today..."
                  maxLength={120}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] focus:border-[#d47a37] text-white text-xs placeholder-[#4b5563] outline-none transition-all pr-8"
                  autoFocus={!goal}
                />
                {inputValue && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-500">
                    {inputValue.length}/120
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shrink-0 cursor-pointer shadow-md flex items-center gap-1.5 transition-all"
              >
                <span>Commit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {goal && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-2 rounded-xl bg-[#141824] hover:bg-[#1a2130] text-gray-400 hover:text-white text-xs cursor-pointer border border-[#252c3d] transition-colors"
                >
                  Cancel
                </button>
              )}
            </form>
          ) : (
            <div className="flex items-center justify-between gap-3 bg-[#090b10]/80 border border-[#1f2638] rounded-xl px-3.5 py-2.5">
              <div
                onClick={handleToggleComplete}
                className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer group select-none"
                title={completed ? 'Click to mark as pending' : 'Click to mark as completed'}
              >
                <button
                  type="button"
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                    completed
                      ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                      : 'border-2 border-[#4b5563] group-hover:border-[#f8b179] bg-transparent'
                  }`}
                >
                  {completed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                </button>
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-xs font-medium transition-all block truncate ${
                      completed
                        ? 'line-through text-gray-500'
                        : 'text-gray-100 group-hover:text-[#f8b179]'
                    }`}
                  >
                    {goal}
                  </span>
                </div>
              </div>

              {/* Status / Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                {completed ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Done
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-semibold">
                    In Progress
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetGoal}
                  title="Edit Target"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#141824] transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClearGoal}
                  title="Clear Target"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-[#141824] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Focus Tags for Quick 1-Click Pick (shown only when editing & input is empty) */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 pt-3 border-t border-[#1a2133] overflow-hidden"
          >
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[#9ca3af] mb-2">
              <Sparkles className="w-3 h-3 text-[#f8b179]" />
              <span>Recommended Operational Directives:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {currentSuggestions.map((suggestion, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => {
                    setInputValue(suggestion);
                    handleSetGoal(suggestion);
                  }}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-[#090b10] hover:bg-[#151a27] border border-[#252f44] hover:border-[#d47a37]/60 text-gray-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 group"
                >
                  <span className="text-[#d47a37] group-hover:translate-x-0.5 transition-transform">›</span>
                  <span className="truncate max-w-[280px] sm:max-w-none">{suggestion}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
