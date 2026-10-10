import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Award,
  Zap,
  Sparkles,
  Filter,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  Compass,
  Briefcase,
  Layers,
  GraduationCap,
  TrendingUp,
  Activity,
  Flame,
  Brain,
  Shield,
  Star,
  ExternalLink,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import {
  ALL_50_SKILLS,
  SKILLS_BOOK_PARTS,
  SkillLesson,
  TOTAL_WORLD_SKILLS_ESTIMATE,
  BOOK_INTRODUCTION,
  OVERALL_ADVANTAGES_OF_SKILL_DEVELOPMENT,
  BEGINNER_ROADMAP_STEPS,
  MASTER_SUMMARY_TABLE,
  TOP_20_IN_DEMAND_SKILLS_2025,
  MOTIVATIONAL_CLOSING_LINE,
} from '../data/skillsBook';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { logSkillMasteredHistory, scheduleVaultSync } from '../utils/userStorage';

interface SkillsBookViewerProps {
  onAskChatbot?: (prompt: string) => void;
  onBackToCourses?: () => void;
}

type TabSection =
  | 'overview'
  | 'curriculum'
  | 'roadmap'
  | 'lifestyle'
  | 'tools'
  | 'practice'
  | 'careers'
  | 'case-study'
  | 'quiz'
  | 'advantages';

export const SkillsBookViewer: React.FC<SkillsBookViewerProps> = ({
  onAskChatbot,
  onBackToCourses,
}) => {
  const [selectedPartNumber, setSelectedPartNumber] = useState<number>(() => {
    try {
      const s = localStorage.getItem('lurl_skills_part_num');
      return s ? parseInt(s, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }); // 0 = all
  const [selectedSkillId, setSelectedSkillId] = useState<string>(() => {
    try {
      return localStorage.getItem('lurl_skills_selected_id') || 'skill-1';
    } catch {
      return 'skill-1';
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<TabSection>(() => {
    try {
      return (localStorage.getItem('lurl_skills_active_subtab') as TabSection) || 'overview';
    } catch {
      return 'overview';
    }
  });
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'codex' | 'census' | 'in-demand' | 'summary-table' | 'framework'>(() => {
    try {
      return (localStorage.getItem('lurl_skills_view_mode') as any) || 'codex';
    } catch {
      return 'codex';
    }
  });

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Completed skills storage
  const [completedSkills, setCompletedSkills] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('grand_skills_completed_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('lurl_skills_part_num', String(selectedPartNumber));
      localStorage.setItem('lurl_skills_selected_id', selectedSkillId);
      localStorage.setItem('lurl_skills_active_subtab', activeSubTab);
      localStorage.setItem('lurl_skills_view_mode', viewMode);
      scheduleVaultSync();
    } catch {}
  }, [selectedPartNumber, selectedSkillId, activeSubTab, viewMode]);

  useEffect(() => {
    const handleVaultRestored = () => {
      try {
        const stored = localStorage.getItem('grand_skills_completed_ids');
        if (stored) setCompletedSkills(JSON.parse(stored));
        const sId = localStorage.getItem('lurl_skills_selected_id');
        if (sId) setSelectedSkillId(sId);
        const sTab = localStorage.getItem('lurl_skills_active_subtab') as TabSection;
        if (sTab) setActiveSubTab(sTab);
        const sMode = localStorage.getItem('lurl_skills_view_mode') as any;
        if (sMode) setViewMode(sMode);
      } catch {}
    };
    window.addEventListener('lurl-vault-restored', handleVaultRestored);
    return () => window.removeEventListener('lurl-vault-restored', handleVaultRestored);
  }, []);

  const toggleSkillCompleted = (id: string) => {
    setCompletedSkills((prev) => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('grand_skills_completed_ids', JSON.stringify(updated));
        scheduleVaultSync();
      } catch (e) {
        console.error(e);
      }
      if (!exists) {
        playSuccessChime();
        const foundSkill = ALL_50_SKILLS.find((s) => s.id === id);
        if (foundSkill) {
          logSkillMasteredHistory(
            foundSkill.id,
            foundSkill.name,
            foundSkill.partTitle,
            foundSkill.finalTakeaway
          );
        }
      } else {
        playClickSound();
      }
      return updated;
    });
  };

  // Filter skills list
  const filteredSkills = useMemo(() => {
    return ALL_50_SKILLS.filter((skill) => {
      const matchesPart = selectedPartNumber === 0 || skill.partNumber === selectedPartNumber;
      const matchesDifficulty =
        difficultyFilter === 'all' ||
        skill.difficultyLevel.level.toLowerCase().includes(difficultyFilter.toLowerCase());
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        skill.name.toLowerCase().includes(query) ||
        skill.partTitle.toLowerCase().includes(query) ||
        skill.tagline.toLowerCase().includes(query) ||
        skill.whatYouWillLearn.some((t) => t.toLowerCase().includes(query)) ||
        skill.careerOpportunities.some((c) => c.role.toLowerCase().includes(query));

      return matchesPart && matchesDifficulty && matchesQuery;
    });
  }, [selectedPartNumber, difficultyFilter, searchQuery]);

  // Current active skill
  const currentSkill = useMemo(() => {
    return ALL_50_SKILLS.find((s) => s.id === selectedSkillId) || ALL_50_SKILLS[0];
  }, [selectedSkillId]);

  // Reset quiz when skill changes
  useEffect(() => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  }, [selectedSkillId]);

  const currentSkillIndex = ALL_50_SKILLS.findIndex((s) => s.id === currentSkill.id);
  const prevSkill = currentSkillIndex > 0 ? ALL_50_SKILLS[currentSkillIndex - 1] : null;
  const nextSkill = currentSkillIndex < ALL_50_SKILLS.length - 1 ? ALL_50_SKILLS[currentSkillIndex + 1] : null;

  const handleSelectSkill = (id: string) => {
    playClickSound();
    setSelectedSkillId(id);
  };

  const handleCopySkillSummary = () => {
    const text = `The Grand Codex of Skill Development: Skill #${currentSkill.skillNumber} - ${currentSkill.name} (${currentSkill.partTitle})\n${currentSkill.tagline}\n\nTop Careers:\n${currentSkill.careerOpportunities.slice(0, 3).map((c) => `• ${c.role} (${c.salaryRange})`).join('\n')}\n\nFinal Takeaway: ${currentSkill.finalTakeaway}`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const calculateQuizScore = () => {
    let score = 0;
    currentSkill.quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="w-full min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col">
      {/* Top Banner / Hero Header */}
      <div className="border-b border-[#252c3d] bg-gradient-to-r from-[#121622] via-[#161c2b] to-[#121622] px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                10 Universal Pillars • 50 Curriculums
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#1f2638] text-slate-300 border border-[#2b354d]">
                World Census: ~10,000+ Skills
              </span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hidden sm:inline">
                {completedSkills.length}/50 Mastered
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span className="text-[#d47a37]">The Grand Codex of Skill Development</span>
              <span className="text-xs px-2 py-0.5 bg-[#d47a37]/20 text-[#f8b179] font-mono border border-[#d47a37]/30">
                v2.0 Complete
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              An architectural encyclopedia deconstructing human competence into 18 clinical dimensions: psychological, business, technical, vocational, medical, communicative, athletic, and fine performing arts.
            </p>
          </div>

          {/* Quick View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
            <button
              onClick={() => {
                playClickSound();
                setViewMode('codex');
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'codex'
                  ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md'
                  : 'bg-[#181f2f] text-slate-400 hover:text-white border border-[#273248]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>50 Skills Manual</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setViewMode('census');
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'census'
                  ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md'
                  : 'bg-[#181f2f] text-slate-400 hover:text-white border border-[#273248]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>World Census</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setViewMode('in-demand');
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'in-demand'
                  ? 'bg-gradient-to-r from-amber-500 to-[#d47a37] text-white shadow-md'
                  : 'bg-[#181f2f] text-slate-400 hover:text-white border border-[#273248]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Top 20 In-Demand</span>
            </button>
            <button
              onClick={() => {
                playClickSound();
                setViewMode('summary-table');
              }}
              className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'summary-table'
                  ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-md'
                  : 'bg-[#181f2f] text-slate-400 hover:text-white border border-[#273248]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Master Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area Based on Mode */}
      {viewMode === 'census' && (
        <div className="max-w-6xl mx-auto p-6 md:p-10 w-full space-y-8 animate-fadeIn">
          <div className="bg-[#121622] border border-[#252c3d] p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl md:text-2xl font-black text-white">
                Global Census: Total Skills in Human Civilization
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-mono bg-[#161c2b] p-4 border border-[#2a354c]">
              {TOTAL_WORLD_SKILLS_ESTIMATE.censusStatement}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOTAL_WORLD_SKILLS_ESTIMATE.breakdown.map((item, idx) => (
                <div key={idx} className="bg-[#181f30] border border-[#263147] p-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-200">{item.part}</span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 border border-amber-500/20">
                    {item.range}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-[#252c3d] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                Estimated Global Total: <strong className="text-amber-300">{TOTAL_WORLD_SKILLS_ESTIMATE.totalEstimated}</strong>
              </span>
              <button
                onClick={() => setViewMode('codex')}
                className="px-4 py-2 bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Explore the 50 Master Curriculums</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Overall 20 Advantages */}
          <div className="bg-[#121622] border border-[#252c3d] p-6 md:p-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#d47a37]" />
              <span>Universal Law: The 20 Strategic Advantages of Deliberate Skill Development</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OVERALL_ADVANTAGES_OF_SKILL_DEVELOPMENT.map((adv, idx) => (
                <div key={idx} className="bg-[#161c2b] border border-[#263147] p-4">
                  <h4 className="text-xs font-bold text-[#f8b179] mb-1.5 uppercase tracking-wide">
                    {adv.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{adv.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'in-demand' && (
        <div className="max-w-6xl mx-auto p-6 md:p-10 w-full space-y-6 animate-fadeIn">
          <div className="bg-[#121622] border border-[#252c3d] p-6 md:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                  <span>The Top 20 Most In-Demand & Highly Compensated Skills (2025–2030)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ranked by global enterprise scarcity, automated AI resistance, and institutional compensation velocity.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {TOP_20_IN_DEMAND_SKILLS_2025.map((item) => (
                <div
                  key={item.rank}
                  className="bg-[#161c2b] border border-[#263147] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 flex items-center justify-center bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-black shrink-0">
                      #{item.rank}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white">{item.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-[#20293d] text-slate-300 border border-[#2e3b56]">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.reason}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 border border-emerald-500/20 block">
                      {item.averageCompensation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'summary-table' && (
        <div className="max-w-7xl mx-auto p-6 md:p-10 w-full space-y-6 animate-fadeIn">
          <div className="bg-[#121622] border border-[#252c3d] p-6 md:p-8 overflow-x-auto">
            <h2 className="text-xl md:text-2xl font-black text-white mb-2 flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#d47a37]" />
              <span>Master Summary Matrix Across All 10 Parts</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Complete high-altitude index comparing learning time horizons, global census counts, and top monetization opportunities.
            </p>

            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#2d384f] bg-[#171e2e] text-[11px] font-extrabold uppercase text-slate-300 tracking-wider">
                  <th className="p-3">Pillar & Domain</th>
                  <th className="p-3">Global Census</th>
                  <th className="p-3">Skills Analyzed in Book</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3">Time Horizon</th>
                  <th className="p-3">Apex Career & Comp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21293a] text-xs">
                {MASTER_SUMMARY_TABLE.map((row) => (
                  <tr key={row.partNumber} className="hover:bg-[#182030] transition-colors">
                    <td className="p-3 font-bold text-white whitespace-nowrap">
                      {row.partName}
                    </td>
                    <td className="p-3 text-amber-300 font-mono whitespace-nowrap">{row.approxWorldSkills}</td>
                    <td className="p-3 text-slate-300">{row.skillsCovered}</td>
                    <td className="p-3 text-slate-300">{row.difficulty}</td>
                    <td className="p-3 text-slate-400 whitespace-nowrap">{row.timeToLearn}</td>
                    <td className="p-3 text-emerald-400 font-mono font-semibold">{row.topCareerOption}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 50 Skills Codex View: Master-Detail Layout */}
      {viewMode === 'codex' && (
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full border-x border-[#252c3d]">
          {/* Left Column: Parts & Skills Navigator */}
          <div className="w-full lg:w-80 lg:shrink-0 bg-[#0d1017] border-b lg:border-b-0 lg:border-r border-[#252c3d] flex flex-col h-auto lg:h-[calc(100vh-140px)]">
            {/* Search and Filters */}
            <div className="p-3 border-b border-[#252c3d] space-y-2 bg-[#121622]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search 50 skills, jobs, topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#181f2f] border border-[#29344b] text-xs text-white pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#d47a37]"
                />
              </div>

              {/* Part Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <select
                  value={selectedPartNumber}
                  onChange={(e) => setSelectedPartNumber(Number(e.target.value))}
                  className="w-full bg-[#181f2f] border border-[#29344b] text-xs text-slate-200 px-2 py-1 focus:outline-none focus:border-[#d47a37]"
                >
                  <option value={0}>All 10 Domains (50 Skills)</option>
                  {SKILLS_BOOK_PARTS.map((p) => (
                    <option key={p.partNumber} value={p.partNumber}>
                      Part {p.partNumber}: {p.title}
                    </option>
                  ))}
                </select>

                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="bg-[#181f2f] border border-[#29344b] text-xs text-slate-200 px-2 py-1 focus:outline-none focus:border-[#d47a37]"
                >
                  <option value="all">Diff</option>
                  <option value="beginner">Beg</option>
                  <option value="intermediate">Mid</option>
                  <option value="advanced">Adv</option>
                </select>
              </div>
            </div>

            {/* Scrollable Skills List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1e2638] text-xs">
              {filteredSkills.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No skills match your filters.</p>
                </div>
              ) : (
                filteredSkills.map((skill) => {
                  const isSelected = skill.id === currentSkill.id;
                  const isDone = completedSkills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => handleSelectSkill(skill.id)}
                      className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1e2638] text-white border-l-4 border-l-[#d47a37]'
                          : 'hover:bg-[#141924] text-slate-300'
                      }`}
                    >
                      <span className="text-base shrink-0 mt-0.5">{skill.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-amber-400">
                            #{skill.skillNumber} • Part {skill.partNumber}
                          </span>
                          {isDone && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <h4 className="font-bold text-xs truncate text-white">{skill.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{skill.tagline}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Progress Bar */}
            <div className="p-3 bg-[#121622] border-t border-[#252c3d] text-xs flex items-center justify-between">
              <span className="text-slate-400">Mastery Progress</span>
              <span className="font-mono font-bold text-amber-300">
                {Math.round((completedSkills.length / 50) * 100)}% ({completedSkills.length}/50)
              </span>
            </div>
          </div>

          {/* Right Column: Full In-Depth Clinical Skill Lesson */}
          <div className="flex-1 bg-[#10141f] flex flex-col h-auto lg:h-[calc(100vh-140px)] overflow-y-auto">
            {/* Skill Header */}
            <div className="p-6 md:p-8 bg-[#141926] border-b border-[#252c3d]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40 text-xs font-mono font-bold">
                    Skill #{currentSkill.skillNumber} of 50
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#1f2638] text-slate-300 border border-[#2b354d] text-xs font-bold">
                    {currentSkill.partEmoji} Part {currentSkill.partNumber}: {currentSkill.partTitle}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold">
                    {currentSkill.difficultyLevel.level}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSkillCompleted(currentSkill.id)}
                    className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      completedSkills.includes(currentSkill.id)
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#1a2233] text-slate-300 hover:text-white border border-[#2a3752]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{completedSkills.includes(currentSkill.id) ? 'Mastered' : 'Mark as Mastered'}</span>
                  </button>

                  <button
                    onClick={handleCopySkillSummary}
                    className="p-1.5 bg-[#1a2233] text-slate-300 hover:text-white border border-[#2a3752] cursor-pointer"
                    title="Copy Summary"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  {onAskChatbot && (
                    <button
                      onClick={() =>
                        onAskChatbot(
                          `Please explain the foundational architecture, practice drills, and monetization strategies for mastering Skill #${currentSkill.skillNumber}: ${currentSkill.name}.`
                        )
                      }
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-[#d47a37] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Consult AI Advisor</span>
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{currentSkill.emoji}</span>
                <span>{currentSkill.name}</span>
              </h2>
              <p className="text-sm text-amber-200/90 mt-2 font-medium leading-relaxed max-w-4xl">
                {currentSkill.tagline}
              </p>

              {/* Sub-Tabs Navigation for 18 Clinical Points */}
              <div className="flex items-center gap-1 overflow-x-auto mt-6 pt-4 border-t border-[#252c3d] pb-1">
                {(
                  [
                    { id: 'overview', label: '1. Overview & Genesis' },
                    { id: 'curriculum', label: '2. 12-Point Curriculum' },
                    { id: 'roadmap', label: '3. 10-Step Roadmap' },
                    { id: 'lifestyle', label: '4. Daily Life Routines' },
                    { id: 'tools', label: '5. Tools & Resources' },
                    { id: 'practice', label: '6. Practice & Mistakes' },
                    { id: 'careers', label: '7. Career Valuation' },
                    { id: 'case-study', label: '8. Case Study' },
                    { id: 'quiz', label: '9. Interactive Test' },
                    { id: 'advantages', label: '10. Strategic Advantages' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playClickSound();
                      setActiveSubTab(tab.id);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeSubTab === tab.id
                        ? 'bg-[#d47a37] text-white shadow-sm'
                        : 'bg-[#181f2f] text-slate-400 hover:text-white hover:bg-[#1e263a]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tabbed Content Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Tab 1: Overview & Genesis */}
              {activeSubTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Point 2: Clinical Introduction</span>
                    </h3>
                    <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
                      {currentSkill.introduction.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      <span>Point 3: Why This Skill Matters</span>
                    </h3>
                    <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
                      {currentSkill.whyItMatters.map((p, idx) => (
                        <p key={idx} className="flex items-start gap-2">
                          <span className="text-[#d47a37] mt-1 font-bold">▪</span>
                          <span>{p}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Compass className="w-4 h-4" />
                      <span>Point 4: Historic Genesis & Evolutionary Origin</span>
                    </h3>
                    <div className="space-y-2 text-sm text-slate-300 leading-relaxed">
                      {currentSkill.historyOrigin.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>

                  {/* Time to Learn & Difficulty Summary Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#161c2c] border border-[#28344e] p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Point 9: Time Investment Horizon
                      </h4>
                      <ul className="text-xs space-y-1.5 text-slate-300">
                        <li><strong>Beginner:</strong> {currentSkill.timeToLearn.beginner}</li>
                        <li><strong>Intermediate:</strong> {currentSkill.timeToLearn.intermediate}</li>
                        <li><strong>Advanced:</strong> {currentSkill.timeToLearn.advanced}</li>
                        <li className="text-amber-300 pt-1 font-mono"><strong>Daily Cadence:</strong> {currentSkill.timeToLearn.dailyCommitment}</li>
                      </ul>
                    </div>

                    <div className="bg-[#161c2c] border border-[#28344e] p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Point 10: Difficulty Level & Demands
                      </h4>
                      <div className="text-xs text-slate-300 space-y-2">
                        <span className="inline-block px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          {currentSkill.difficultyLevel.level}
                        </span>
                        <p>{currentSkill.difficultyLevel.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Curriculum (Point 5) */}
              {activeSubTab === 'curriculum' && (
                <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Point 5: What You Will Learn (12 Core Modules)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    The microscopic anatomical breakdowns required to operationalize this capability from theory into muscle memory:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {currentSkill.whatYouWillLearn.map((topic, idx) => (
                      <div
                        key={idx}
                        className="bg-[#181f2f] border border-[#28334b] p-3 flex items-start gap-3"
                      >
                        <span className="w-5 h-5 flex items-center justify-center bg-[#d47a37]/20 text-[#f8b179] font-mono text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-slate-200 leading-relaxed font-medium">
                          {topic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: 10-Step Roadmap (Point 6) */}
              {activeSubTab === 'roadmap' && (
                <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Point 6: How to Learn It — 10-Step Master Progression</span>
                  </h3>
                  <div className="space-y-3">
                    {currentSkill.howToLearnSteps.map((st) => (
                      <div
                        key={st.stepNumber}
                        className="bg-[#181f2f] border border-[#28334b] p-4 flex items-start gap-4"
                      >
                        <span className="w-8 h-8 flex items-center justify-center bg-[#d47a37] text-white font-mono font-black text-xs shrink-0">
                          {st.stepNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-white mb-1">{st.title}</h4>
                          <p className="text-xs text-slate-300 leading-relaxed">{st.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Lifestyle (Point 7) */}
              {activeSubTab === 'lifestyle' && (
                <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span>Point 7: How to Develop It in Life (Long-Term Behavioral Habits)</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentSkill.howToDevelopInLife.map((habit, idx) => (
                      <div
                        key={idx}
                        className="bg-[#181f2f] border border-[#28334b] p-3 flex items-start gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-200 leading-relaxed">{habit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Tools & Resources (Point 8) */}
              {activeSubTab === 'tools' && (
                <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Point 8: Essential Tools, Hardware, Apps, & Literature</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSkill.toolsAndResources.map((tool, idx) => (
                      <div key={idx} className="bg-[#181f2f] border border-[#28334b] p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="text-xs font-bold text-white">{tool.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#252f44] text-amber-300 border border-[#323f5b]">
                            {tool.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{tool.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Practice & Mistakes (Points 11, 12, 13) */}
              {activeSubTab === 'practice' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Daily Practice Methods */}
                  <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>Point 11: 6 Daily Deliberate Practice Regimens</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentSkill.dailyPracticeMethods.map((drill, idx) => (
                        <div key={idx} className="bg-[#181f2f] border border-[#28334b] p-3 text-xs text-slate-200">
                          <strong className="text-amber-300 block mb-1">Drill {idx + 1}:</strong>
                          {drill}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Common Mistakes & Fixes */}
                  <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>Point 12: Common Beginner Mistakes & Immediate Fixes</span>
                    </h3>
                    <div className="space-y-3">
                      {currentSkill.commonMistakes.map((item, idx) => (
                        <div key={idx} className="bg-[#181f2f] border border-[#28334b] p-3 text-xs space-y-1">
                          <p className="text-rose-300 font-semibold">❌ Mistake: {item.mistake}</p>
                          <p className="text-emerald-300 font-medium">✅ The Clinical Fix: {item.fix}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Metrics */}
                  <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span>Point 13: How to Measure Objective Progress</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {currentSkill.howToMeasureProgress.map((metric, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">✓</span>
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 7: Career Opportunities (Point 14) */}
              {activeSubTab === 'careers' && (
                <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>Point 14: Career Opportunities & Institutional Compensation Ledger</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSkill.careerOpportunities.map((career, idx) => (
                      <div key={idx} className="bg-[#181f2f] border border-[#28334b] p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-xs font-bold text-white">{career.role}</h4>
                          </div>
                          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 inline-block mb-2">
                            {career.salaryRange}
                          </span>
                          <p className="text-xs text-slate-400 leading-relaxed">{career.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 8: Case Study (Point 15) */}
              {activeSubTab === 'case-study' && (
                <div className="bg-[#141926] border border-[#252c3d] p-6 md:p-8 space-y-4 animate-fadeIn">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Point 15: Historical Real-Life Exemplar</span>
                  </h3>
                  <div className="bg-[#181f2f] border border-[#28334b] p-6 space-y-4">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="text-amber-400">★</span>
                      <span>{currentSkill.realLifeExample.personOrProfile}</span>
                    </h4>
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                      {currentSkill.realLifeExample.story}
                    </p>
                    <div className="p-4 bg-[#1e273b] border-l-4 border-l-[#d47a37] text-xs font-medium text-amber-200">
                      <strong>Core Philosophical Principle:</strong> {currentSkill.realLifeExample.keyTakeaway}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 9: Interactive Quiz (Point 16) */}
              {activeSubTab === 'quiz' && (
                <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>Point 16: Mastery Verification Exam (5 Interactive Questions)</span>
                    </h3>
                    {quizSubmitted && (
                      <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Score: {calculateQuizScore()} / 5 ({Math.round((calculateQuizScore() / 5) * 100)}%)
                      </span>
                    )}
                  </div>

                  <div className="space-y-6">
                    {currentSkill.quizQuestions.map((q, qIdx) => {
                      const selectedOption = quizAnswers[qIdx];
                      const isCorrect = selectedOption === q.correctAnswer;
                      return (
                        <div key={qIdx} className="bg-[#181f2f] border border-[#28334b] p-4 space-y-3">
                          <h4 className="text-xs md:text-sm font-bold text-white">
                            Question {qIdx + 1}: {q.question}
                          </h4>
                          <div className="space-y-2">
                            {q.options.map((opt, optIdx) => {
                              const isThisSelected = selectedOption === optIdx;
                              let btnClass = 'bg-[#1e273b] text-slate-300 border-[#2f3d5b] hover:bg-[#25314a]';
                              if (quizSubmitted) {
                                if (optIdx === q.correctAnswer) {
                                  btnClass = 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50';
                                } else if (isThisSelected && !isCorrect) {
                                  btnClass = 'bg-rose-500/20 text-rose-200 border-rose-500/50';
                                }
                              } else if (isThisSelected) {
                                btnClass = 'bg-[#d47a37] text-white border-[#d47a37]';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  disabled={quizSubmitted}
                                  onClick={() => {
                                    playClickSound();
                                    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
                                  }}
                                  className={`w-full text-left p-2.5 text-xs border transition-all cursor-pointer flex items-start gap-2.5 ${btnClass}`}
                                >
                                  <span className="font-mono font-bold shrink-0 mt-0.5">
                                    {String.fromCharCode(65 + optIdx)}.
                                  </span>
                                  <span>{opt}</span>
                                </button>
                              );
                            })}
                          </div>

                          {quizSubmitted && (
                            <div className="p-3 bg-[#1e273b] text-xs text-slate-300 border-l-2 border-l-amber-400">
                              <p className="font-bold text-amber-300 mb-1">
                                {isCorrect ? '✓ Correct!' : '✗ Incorrect.'}
                              </p>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={() => {
                          playSuccessChime();
                          setQuizSubmitted(true);
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white font-bold text-xs cursor-pointer"
                      >
                        Submit Test & Calculate Score
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          playClickSound();
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                        className="px-5 py-2.5 bg-[#1e273b] hover:bg-[#25314a] text-slate-200 font-bold text-xs border border-[#2e3b56] cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Test</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 10: Strategic Advantages (Point 17 & 18) */}
              {activeSubTab === 'advantages' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-[#141926] border border-[#252c3d] p-6 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      <span>Point 17: 10 Strategic Multipliers & Advantages</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentSkill.advantages.map((adv, idx) => (
                        <div key={idx} className="bg-[#181f2f] border border-[#28334b] p-3 text-xs">
                          <strong className="text-[#f8b179] block mb-1 uppercase tracking-wide">
                            {idx + 1}. {adv.category}:
                          </strong>
                          <span className="text-slate-300 leading-relaxed">{adv.benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Takeaway Box */}
                  <div className="bg-gradient-to-r from-[#1b2234] via-[#212b42] to-[#1b2234] border border-[#d47a37]/40 p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#f8b179] mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#d47a37]" />
                      <span>Point 18: Final Sovereign Takeaway</span>
                    </h4>
                    <p className="text-sm md:text-base font-semibold text-white italic leading-relaxed">
                      "{currentSkill.finalTakeaway}"
                    </p>
                  </div>
                </div>
              )}

              {/* Skill Bottom Navigation (Previous / Next Skill) */}
              <div className="pt-6 border-t border-[#252c3d] flex items-center justify-between gap-4">
                {prevSkill ? (
                  <button
                    onClick={() => handleSelectSkill(prevSkill.id)}
                    className="px-4 py-2 bg-[#181f2f] hover:bg-[#1e263a] text-slate-300 text-xs font-bold border border-[#28334b] flex items-center gap-2 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Skill #{prevSkill.skillNumber}: {prevSkill.name.split('&')[0]}</span>
                  </button>
                ) : <div />}

                {nextSkill && (
                  <button
                    onClick={() => handleSelectSkill(nextSkill.id)}
                    className="px-4 py-2 bg-[#181f2f] hover:bg-[#1e263a] text-slate-300 text-xs font-bold border border-[#28334b] flex items-center gap-2 cursor-pointer"
                  >
                    <span>Skill #{nextSkill.skillNumber}: {nextSkill.name.split('&')[0]}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Manifesto */}
      <div className="border-t border-[#252c3d] bg-[#0c0f17] p-4 text-center text-xs text-slate-500">
        <p className="max-w-4xl mx-auto italic">
          {MOTIVATIONAL_CLOSING_LINE}
        </p>
      </div>
    </div>
  );
};
