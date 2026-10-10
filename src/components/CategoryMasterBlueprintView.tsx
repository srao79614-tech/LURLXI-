import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { CategoryInfo } from '../types';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { logActivity } from '../utils/activityHistory';
import { PracticalExecutionLab } from './PracticalExecutionLab';
import {
  BookOpen,
  ShieldCheck,
  Target,
  Zap,
  Compass,
  CheckCircle2,
  ArrowRight,
  Layers,
  Clock,
  Sparkles,
  AlertTriangle,
  Award,
  Volume2,
  VolumeX,
  CheckCheck,
  Flame,
} from 'lucide-react';

export type CodexViewMode =
  | 'chapters'
  | 'infinite-online-book'
  | 'full-book'
  | 'solution'
  | 'strategy'
  | 'tactics'
  | 'how-to-learn';

interface CategoryMasterBlueprintViewProps {
  categoryInfo: CategoryInfo;
  activeMode: CodexViewMode;
  onChangeMode: (mode: CodexViewMode) => void;
  onAskChatbot: (prompt: string) => void;
  completedIds: string[];
  onToggleComplete: (chapterId: string, chapterTitle: string, e?: React.MouseEvent) => void;
  onOpenChapterBook?: (chapterId: string) => void;
}

export const CategoryMasterBlueprintView: React.FC<CategoryMasterBlueprintViewProps> = ({
  categoryInfo,
  activeMode,
  onChangeMode,
  onAskChatbot,
  completedIds,
  onToggleComplete,
  onOpenChapterBook,
}) => {
  const blueprint = categoryInfo.masterBlueprint;
  if (!blueprint) return null;

  return (
    <div className="space-y-6">
      {/* 1. Category Overview & Solution View */}
      {activeMode === 'solution' && (
        <motion.div
          key="solution-view"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Executive Book Thesis Banner */}
          <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1f2638]">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#f8b179]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#f8b179]">
                  {blueprint.bookOverview.volumeTitle}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-[#161c2a] text-emerald-400 border border-emerald-500/30">
                  {blueprint.bookOverview.estimatedTotalHours}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#161c2a] text-amber-300 border border-amber-500/30">
                  {blueprint.bookOverview.difficultyLevel}
                </span>
              </div>
            </div>

            <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white">
              Executive Category Thesis & Market Reality
            </h3>

            <div className="space-y-4 text-[#d1d5db] text-sm sm:text-base leading-relaxed">
              {blueprint.bookOverview.executiveThesis.map((para, idx) => (
                <p key={idx} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* 4 Core Pillars Grid */}
            <div className="pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f8b179] mb-3">
                The 4 Core Institutional Pillars of {categoryInfo.title.split('&')[0]}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.bookOverview.corePillars.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#121622] border border-[#252c3d] hover:border-[#d47a37]/50 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bold text-white text-sm">{pillar.title}</h5>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
                        {pillar.metricBenchmark}
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af] leading-relaxed">{pillar.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Problem Diagnosis vs LURL End-to-End Solution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#0e1118] border border-rose-500/30 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Industry Problem & Failure Diagnosis (Why 95% Fail)</span>
              </div>
              <div className="space-y-3 text-sm text-[#d1d5db] leading-relaxed">
                {blueprint.categorySolution.problemDiagnosis.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#0e1118] border border-emerald-500/30 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>The LURL Category Solution Architecture</span>
              </div>
              <div className="space-y-3 text-sm text-[#d1d5db] leading-relaxed">
                {blueprint.categorySolution.solutionArchitecture.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Layer System Stack */}
          <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-6 sm:p-8 space-y-5">
            <h4 className="font-['Cinzel'] text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#f8b179]" />
              <span>Complete 4-Layer Category Solution Stack</span>
            </h4>

            <div className="space-y-3">
              {blueprint.categorySolution.systemStack.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#121622] border border-[#1f2638] flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-[#f8b179] uppercase">{item.layer}</div>
                    <div className="text-sm font-bold text-white">{item.component}</div>
                  </div>
                  <div className="text-xs text-[#9ca3af] md:max-w-md md:text-right">{item.purpose}</div>
                </div>
              ))}
            </div>

            {/* Expected Outcomes */}
            <div className="pt-4 border-t border-[#1f2638]">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                Verified Category Solution Outcomes
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {blueprint.categorySolution.expectedOutcomes.map((out, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] flex items-start gap-2.5 text-xs text-[#e5e7eb]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{out}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1f2638]">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onChangeMode('strategy');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#161c2a] hover:bg-[#1f283d] text-xs font-bold text-[#f8b179] border border-[#d47a37]/40 flex items-center gap-2 cursor-pointer"
              >
                <span>Next: View Master Strategy & Phases</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onAskChatbot(
                    `Give me a complete breakdown of the ${categoryInfo.title} Solution Architecture and how to implement all 4 layers step by step.`
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Discuss Category Solution in AI Chat</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Master Strategy & Phase Blueprint View */}
      {activeMode === 'strategy' && (
        <motion.div
          key="strategy-view"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#1f2638] pb-4">
              <span className="text-xs font-mono font-bold text-[#f8b179] uppercase tracking-wider">
                Per-Category Grand Strategy
              </span>
              <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white mt-1">
                {categoryInfo.title.split('&')[0]} — Master Strategic Doctrine & 4-Phase Scaling Blueprint
              </h3>
            </div>

            <div className="space-y-3 text-sm sm:text-base text-[#d1d5db] leading-relaxed bg-[#121622] p-5 rounded-xl border border-[#d47a37]/30">
              {blueprint.masterStrategy.strategicDoctrine.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* 4 Strategic Phases */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f8b179]">
                Sequential 4-Phase Execution & Scaling Architecture
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {blueprint.masterStrategy.phases.map((phase, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#121622] border border-[#252c3d] hover:border-[#d47a37]/60 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#d47a37]/20 text-[#f8b179] font-mono text-xs font-bold border border-[#d47a37]/40">
                          {phase.phaseNumber}: {phase.timeframe}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          {phase.kpiTarget}
                        </span>
                      </div>
                      <h5 className="font-['Cinzel'] text-base font-bold text-white">{phase.title}</h5>
                      <p className="text-xs text-[#cbd5e1] leading-relaxed">{phase.objective}</p>

                      <div className="space-y-1.5 pt-2 border-t border-[#1f2638]">
                        {phase.keyActions.map((act, aIdx) => (
                          <div key={aIdx} className="flex items-start gap-2 text-xs text-[#9ca3af]">
                            <span className="text-[#f8b179] font-bold">•</span>
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Ironclad Strategic & Risk Rules */}
            <div className="pt-4 border-t border-[#1f2638]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Ironclad Risk, Capital & Strategic Guardrails</span>
              </h4>
              <div className="space-y-2">
                {blueprint.masterStrategy.riskAndCapitalRules.map((rule, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] text-xs sm:text-sm text-[#e5e7eb] flex items-start gap-3"
                  >
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold shrink-0">
                      0{rIdx + 1}
                    </span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1f2638]">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onChangeMode('tactics');
                }}
                className="px-4 py-2.5 rounded-xl bg-[#161c2a] hover:bg-[#1f283d] text-xs font-bold text-[#f8b179] border border-[#d47a37]/40 flex items-center gap-2 cursor-pointer"
              >
                <span>Next: View Tactical Playbook & SOPs</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  onAskChatbot(
                    `Build me a personalized 90-day strategic execution plan for ${categoryInfo.title} following Phases I through IV.`
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Stress-Test Strategy in AI Chat</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Tactical Playbook & SOPs View */}
      {activeMode === 'tactics' && (
        <motion.div
          key="tactics-view"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#1f2638] pb-4">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Battle-Tested Per-Category Execution Tactics
              </span>
              <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white mt-1">
                {categoryInfo.title.split('&')[0]} — Tactical Playbook & Field SOPs
              </h3>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">{blueprint.tacticalPlaybook.tacticalSummary}</p>
            </div>

            {/* Interactive Category Practical Lab & Execution Simulator */}
            <PracticalExecutionLab
              category={categoryInfo.id}
              chapterNumber="01"
              chapterTitle={`${categoryInfo.title.split('&')[0]} Live Strategy`}
            />

            <div className="space-y-5">
              {blueprint.tacticalPlaybook.tactics.map((tactic) => (
                <div
                  key={tactic.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#121622] border border-[#252c3d] hover:border-[#d47a37] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1f2638]">
                    <h4 className="font-['Cinzel'] text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#f8b179] shrink-0" />
                      <span>{tactic.name}</span>
                    </h4>
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold">
                      {tactic.targetMetric}
                    </span>
                  </div>

                  {/* Trigger Condition */}
                  <div className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] text-xs">
                    <span className="font-bold text-[#f8b179] uppercase tracking-wider block mb-1">
                      When to Deploy (Trigger Condition):
                    </span>
                    <span className="text-[#d1d5db]">{tactic.triggerCondition}</span>
                  </div>

                  {/* Exact Step-by-Step Protocol */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      Exact Step-by-Step Tactical Protocol:
                    </div>
                    {tactic.exactProtocol.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#e5e7eb]">
                        <span className="w-5 h-5 rounded-full bg-[#d47a37]/20 text-[#f8b179] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>

                  {/* Defensive Counter-Measure & AI Drill Button */}
                  <div className="pt-3 border-t border-[#1f2638] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-amber-300/90 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Defensive Counter-Measure:</strong> {tactic.counterMeasure}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onAskChatbot(
                          `Walk me through a live step-by-step simulation and numerical example of "${tactic.name}" in ${categoryInfo.title}.`
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#1a2234] hover:bg-[#d47a37] text-xs font-bold text-[#f8b179] hover:text-white border border-[#d47a37]/40 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Drill This Tactic in AI Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. How to Learn It (Complete Mastery Curriculum & Study Roadmap) */}
      {activeMode === 'how-to-learn' && (
        <motion.div
          key="how-to-learn-view"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#1f2638] pb-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Complete Per-Category Learning Methodology
              </span>
              <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white mt-1">
                How to Learn & Master {categoryInfo.title.split('&')[0]} From Zero to Institutional Operator
              </h3>
            </div>

            {/* Cognitive & Practical Learning Philosophy */}
            <div className="p-5 rounded-xl bg-[#121622] border border-emerald-500/30 space-y-3 text-sm sm:text-base text-[#d1d5db] leading-relaxed">
              {blueprint.howToLearn.learningPhilosophy.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            {/* 4-Stage Study Roadmap */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f8b179] flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>30-Day Step-by-Step Study & Practice Roadmap</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blueprint.howToLearn.studyRoadmap.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#121622] border border-[#252c3d] space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{st.stage}</span>
                        <span className="px-2.5 py-0.5 rounded bg-[#d47a37]/20 text-[#f8b179] font-mono text-xs font-bold">
                          {st.duration}
                        </span>
                      </div>
                      <p className="text-xs text-[#cbd5e1] leading-relaxed">
                        <strong className="text-[#f8b179]">Focus:</strong> {st.focus}
                      </p>
                      <p className="text-xs text-[#9ca3af] leading-relaxed">
                        <strong className="text-white">Daily Routine:</strong> {st.dailyRoutine}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#090b10] border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                      <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Graduation Milestone:</strong> {st.milestoneToPass}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily 80-Minute Study Block Schedule */}
            <div className="space-y-3 pt-4 border-t border-[#1f2638]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f8b179] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Recommended Daily 80-Minute Study & Execution Schedule</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {blueprint.howToLearn.dailySchedule.map((slot, sIdx) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-[#090b10] border border-[#1f2638] space-y-1.5">
                    <div className="font-mono text-xs font-bold text-[#f8b179]">{slot.timeBlock}</div>
                    <div className="text-xs font-bold text-white">{slot.activity}</div>
                    <p className="text-[11px] text-[#9ca3af] leading-relaxed">{slot.output}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mastery Verification Checklist */}
            <div className="pt-4 border-t border-[#1f2638]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                Category Mastery Verification Standards
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {blueprint.howToLearn.masteryVerificationChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#121622] border border-[#1f2638] flex items-start gap-2.5 text-xs text-[#e5e7eb]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 5. Continuous Full-Book Edition Reader (All 6 Chapters Back-to-Back) */}
      {activeMode === 'full-book' && (
        <motion.div
          key="full-book-view"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#17130e] via-[#0e1118] to-[#121622] border border-[#d47a37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-[#f8b179] uppercase">
                Unabridged Continuous Book Edition • {categoryInfo.chapters.length} Complete Chapters
              </span>
              <h3 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white mt-1">
                {blueprint.bookOverview.volumeTitle}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onChangeMode('infinite-online-book');
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-xs font-bold text-emerald-300 border border-emerald-500/40 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Infinite Online Book (∞ Pages)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onChangeMode('chapters');
                }}
                className="px-4 py-2 rounded-xl bg-[#161c2a] hover:bg-[#1f283d] text-xs font-bold text-[#f8b179] border border-[#d47a37]/40 cursor-pointer shrink-0"
              >
                Switch to Single-Chapter Reader
              </button>
            </div>
          </div>

          {categoryInfo.chapters.map((ch) => {
            const isDone = completedIds.includes(ch.id);
            return (
              <div
                key={ch.id}
                className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-6 sm:p-8 shadow-2xl space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1f2638]">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#f8b179] uppercase">
                      Chapter {ch.number} of {categoryInfo.chapters.length} • 500 Pages Unabridged • {ch.readTime}
                    </span>
                    <h4 className="font-['Cinzel'] text-xl sm:text-2xl font-bold text-white mt-1">{ch.title}</h4>
                    <p className="text-xs sm:text-sm text-[#9ca3af] mt-0.5">{ch.subtitle}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        if (onOpenChapterBook) {
                          onOpenChapterBook(ch.id);
                        } else {
                          onChangeMode('chapters');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white border border-[#f8b179]/40 shadow-md"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Read All 500 Pages of Ch.{ch.number}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => onToggleComplete(ch.id, ch.title, e)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-[#141824] text-[#9ca3af] hover:text-white border-[#252c3d]'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isDone ? 'Completed ✓' : 'Mark Chapter Read'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-[#d1d5db] leading-relaxed">
                  {ch.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {ch.keyFormulas && ch.keyFormulas.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ch.keyFormulas.map((f, fIdx) => (
                      <div key={fIdx} className="p-4 rounded-xl bg-[#090b10] border border-[#d47a37]/30 space-y-1.5">
                        <div className="text-xs font-bold text-[#f8b179] uppercase">{f.name}</div>
                        <div className="font-mono text-xs sm:text-sm font-bold text-white bg-[#141824] p-2.5 rounded-lg">
                          {f.formula}
                        </div>
                        <p className="text-xs text-[#9ca3af]">{f.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}

                {ch.operationalSop && ch.operationalSop.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-white">
                      Standard Operating Procedure (SOP):
                    </div>
                    {ch.operationalSop.map((step, sIdx) => (
                      <div key={sIdx} className="p-3 rounded-xl bg-[#121622] border border-[#1f2638] text-xs sm:text-sm text-[#e5e7eb]">
                        <strong className="text-[#f8b179] mr-2">0{sIdx + 1}.</strong>
                        {step}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};
