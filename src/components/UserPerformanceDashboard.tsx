import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CategoryType,
  UserPerformanceProfile,
  LearningHistoryEvent,
  CourseProgress,
} from '../types';
import {
  getUserPerformance,
  toggleChapterCompletion,
  clearUserHistory,
} from '../utils/userStorage';
import { playSuccessChime, playClickSound } from '../utils/soundEffects';
import { CATEGORIES_DATA } from '../data/categoriesData';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Circle,
  Activity,
  Calendar,
  History,
  Download,
  Trash2,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Layers,
} from 'lucide-react';

interface UserPerformanceDashboardProps {
  onSelectCourse: (category: CategoryType) => void;
  userEmail?: string;
  resetKey?: number;
  onAskVoiceAdvisor?: (prompt: string, category?: CategoryType) => void;
}

export const UserPerformanceDashboard: React.FC<UserPerformanceDashboardProps> = ({
  onSelectCourse,
  userEmail,
  resetKey = 0,
}) => {
  const [profile, setProfile] = useState<UserPerformanceProfile>(() =>
    getUserPerformance(userEmail)
  );
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState<string>('');

  useEffect(() => {
    setProfile(getUserPerformance(userEmail));
  }, [userEmail, resetKey]);

  const handleToggleChapter = (
    category: CategoryType,
    chapterId: string,
    chapterTitle: string
  ) => {
    playClickSound();
    toggleChapterCompletion(category, chapterId, chapterTitle, userEmail);
    setProfile(getUserPerformance(userEmail));
    playSuccessChime();
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your learning history log?')) {
      clearUserHistory(userEmail);
      setProfile(getUserPerformance(userEmail));
    }
  };

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `LURL_Performance_Report_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Prepare chart data for Category Mastery vs Benchmark
  const courseChartData = [
    {
      name: 'Trading',
      category: 'trading',
      userScore: profile.courses.trading?.masteryScore || 0,
      benchmark: 70,
      completion: Math.round(
        ((profile.courses.trading?.completedChapterIds.length || 0) /
          (profile.courses.trading?.totalChapters || 2)) *
          100
      ),
    },
    {
      name: 'AI Dropship',
      category: 'dropshipping',
      userScore: profile.courses.dropshipping?.masteryScore || 0,
      benchmark: 65,
      completion: Math.round(
        ((profile.courses.dropshipping?.completedChapterIds.length || 0) /
          (profile.courses.dropshipping?.totalChapters || 2)) *
          100
      ),
    },
    {
      name: 'E-Commerce',
      category: 'ecommerce',
      userScore: profile.courses.ecommerce?.masteryScore || 0,
      benchmark: 60,
      completion: Math.round(
        ((profile.courses.ecommerce?.completedChapterIds.length || 0) /
          (profile.courses.ecommerce?.totalChapters || 2)) *
          100
      ),
    },
    {
      name: 'AI Startup',
      category: 'startup',
      userScore: profile.courses.startup?.masteryScore || 0,
      benchmark: 75,
      completion: Math.round(
        ((profile.courses.startup?.completedChapterIds.length || 0) /
          (profile.courses.startup?.totalChapters || 2)) *
          100
      ),
    },
    {
      name: 'Skill Development',
      category: 'skill-development',
      userScore: profile.courses['skill-development']?.masteryScore || 88,
      benchmark: 80,
      completion: Math.round(
        ((profile.courses['skill-development']?.completedChapterIds.length || 0) /
          (profile.courses['skill-development']?.totalChapters || 3)) *
          100
      ),
    },
  ];

  const filteredHistory = profile.history.filter((item) => {
    const matchesType =
      historyFilter === 'all' ? true : item.type === historyFilter;
    const matchesSearch =
      historySearch === ''
        ? true
        : item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
          item.description.toLowerCase().includes(historySearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalCompletedChapters = Object.values(profile.courses).reduce(
    (acc, curr) => acc + curr.completedChapterIds.length,
    0
  );
  const totalAllChapters = Object.values(profile.courses).reduce(
    (acc, curr) => acc + curr.totalChapters,
    0
  );
  const overallCoursePercent = Math.round(
    (totalCompletedChapters / Math.max(totalAllChapters, 1)) * 100
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#252c3d] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d47a37]/20 text-[#f8b179] border border-[#d47a37]/40 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Personal Executive Telemetry
            </span>
            <span className="text-xs text-[#34d399] font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Storage Synced Locally
            </span>
          </div>
          <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
            User Performance & Learning Analytics
          </h2>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1 max-w-2xl">
            Detailed performance graphics and storage tracking for {profile.email}. Monitor chapter completion, knowledge velocity, and cross-domain discipline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#d47a37]/40 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Learning Record
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] relative overflow-hidden">
          <div className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Overall Course Progress</span>
            <BookOpen className="w-4 h-4 text-[#d47a37]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-['Cinzel'] mt-2">
            {overallCoursePercent}%
          </div>
          <div className="text-xs text-[#9ca3af] mt-1">
            {totalCompletedChapters} of {totalAllChapters} Chapters Mastered
          </div>
          <div className="w-full bg-[#1c2230] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#d47a37] to-[#f8b179] h-full rounded-full transition-all duration-500"
              style={{ width: `${overallCoursePercent}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] relative overflow-hidden">
          <div className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Knowledge Mastery</span>
            <Award className="w-4 h-4 text-[#f8b179]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-['Cinzel'] mt-2">
            {profile.performanceMetrics?.overallMastery ?? profile.overallMastery ?? 28}/100
          </div>
          <div className="text-xs text-[#34d399] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Top 5% Operational Standard
          </div>
          <div className="w-full bg-[#1c2230] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${profile.performanceMetrics?.overallMastery ?? profile.overallMastery ?? 28}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] relative overflow-hidden">
          <div className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Study Time Invested</span>
            <Clock className="w-4 h-4 text-[#38bdf8]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-['Cinzel'] mt-2">
            {Math.floor((profile.totalStudyMinutes || 0) / 60)}h {(profile.totalStudyMinutes || 0) % 60}m
          </div>
          <div className="text-xs text-[#9ca3af] mt-1">
            Across 4 Specialized Tracks
          </div>
          <div className="w-full bg-[#1c2230] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full"
              style={{ width: `${Math.min(100, ((profile.totalStudyMinutes || 0) / 600) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] relative overflow-hidden">
          <div className="text-[11px] font-mono text-[#9ca3af] uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Execution Discipline</span>
            <Sparkles className="w-4 h-4 text-[#e879f9]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-['Cinzel'] mt-2">
            {profile.performanceMetrics?.disciplineScore ?? 85}%
          </div>
          <div className="text-xs text-[#9ca3af] mt-1">
            Strict SOP Adherence Index
          </div>
          <div className="w-full bg-[#1c2230] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${profile.performanceMetrics?.disciplineScore ?? 85}%` }}
            />
          </div>
        </div>
      </div>

      {/* Performance Graphics Section (Recharts Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphic 1: Weekly Study Velocity & Comprehension Curve */}
        <div className="p-6 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Cinzel'] text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#d47a37]" /> Weekly Study Velocity & Score
              </h3>
              <p className="text-xs text-[#9ca3af]">Daily learning minutes and calculated retention score</p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#141824] text-[10px] font-mono text-[#f8b179] border border-[#252c3d]">
              Past 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profile.weeklyVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d47a37" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#d47a37" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2638" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090b10',
                    borderColor: '#d47a37',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="minutes"
                  name="Study Minutes"
                  stroke="#d47a37"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#velocityGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Comprehension %"
                  stroke="#34d399"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#scoreGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphic 2: Course Mastery vs Institutional Benchmark */}
        <div className="p-6 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Cinzel'] text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#f8b179]" /> Course Mastery vs Institutional Benchmark
              </h3>
              <p className="text-xs text-[#9ca3af]">Your competence score vs top 5% hedge & venture benchmark</p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#141824] text-[10px] font-mono text-emerald-400 border border-[#252c3d]">
              Target: 70+
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2638" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090b10',
                    borderColor: '#252c3d',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="userScore" name="Your Mastery Score" fill="#d47a37" radius={[4, 4, 0, 0]} />
                <Bar dataKey="benchmark" name="Hedge Benchmark" fill="#374151" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Specific Course Learning Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-['Cinzel'] text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#d47a37]" /> Progress by Specific Course
          </h3>
          <span className="text-xs text-[#9ca3af]">Click any chapter checkbox to toggle completed status</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['trading', 'dropshipping', 'ecommerce', 'startup', 'skill-development'] as CategoryType[]).map((cat) => {
            const course = profile.courses[cat];
            const meta = CATEGORIES_DATA[cat];
            const compPercent = Math.round(
              ((course?.completedChapterIds.length || 0) / (course?.totalChapters || 2)) * 100
            );

            return (
              <div
                key={cat}
                className="p-5 rounded-2xl bg-[#0e1118] border border-[#252c3d] hover:border-[#d47a37]/50 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#f8b179]">
                        COURSE TRACK // {cat.toUpperCase()}
                      </span>
                      <h4 className="font-['Cinzel'] text-base font-bold text-white mt-0.5">
                        {meta?.title || course?.title}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#141824] text-[#f8b179] border border-[#d47a37]/30">
                      {compPercent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#1c2230] h-2 rounded-full my-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#d47a37] to-[#f8b179] h-full rounded-full transition-all duration-300"
                      style={{ width: `${compPercent}%` }}
                    />
                  </div>

                  {/* Course Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-[#9ca3af] py-2 border-y border-[#1f2638] my-3">
                    <div>
                      <span className="block text-[#6b7280]">Chapters:</span>
                      <strong className="text-white">
                        {course?.completedChapterIds.length || 0} / {course?.totalChapters || 2}
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[#6b7280]">Time Spent:</span>
                      <strong className="text-white">{course?.minutesSpent || 0} min</strong>
                    </div>
                    <div>
                      <span className="block text-[#6b7280]">Mastery:</span>
                      <strong className="text-emerald-400">{course?.masteryScore || 50}/100</strong>
                    </div>
                  </div>

                  {/* Chapters List */}
                  <div className="space-y-2 mt-3">
                    <div className="text-[11px] font-semibold text-gray-400">Chapters Checklist:</div>
                    {meta?.chapters.map((ch) => {
                      const isDone = course?.completedChapterIds.includes(ch.id);
                      return (
                        <div
                          key={ch.id}
                          onClick={() => handleToggleChapter(cat, ch.id, ch.title)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs transition-colors ${
                            isDone
                              ? 'bg-[#141824] border-[#34d399]/40 text-gray-200'
                              : 'bg-[#090b10] border-[#1f2638] text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#4b5563] shrink-0" />
                            )}
                            <span className={isDone ? 'font-medium text-white line-through opacity-80' : ''}>
                              Ch {ch.number}: {ch.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#6b7280]">{ch.readTime}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1f2638] flex justify-end">
                  <button
                    type="button"
                    onClick={() => onSelectCourse(cat)}
                    className="text-xs font-bold text-[#f8b179] hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    Open Course Codex & Practice →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Storage & History Activity Timeline */}
      <div className="p-6 rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#1f2638] gap-3">
          <div>
            <h3 className="font-['Cinzel'] text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-[#d47a37]" /> Personal Learning History & Action Log
            </h3>
            <p className="text-xs text-[#9ca3af]">Chronological storage of chapters read, AI queries, and strategy checkpoints</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/30 border border-red-900/40 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Log
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['all', 'chapter_completed', 'ai_query', 'session_started'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setHistoryFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer capitalize ${
                  historyFilter === f
                    ? 'bg-[#d47a37] text-white shadow-sm'
                    : 'bg-[#141824] text-[#9ca3af] hover:text-white border border-[#252c3d]'
                }`}
              >
                {f === 'all'
                  ? 'All Activities'
                  : f === 'chapter_completed'
                  ? 'Chapters Mastered'
                  : f === 'ai_query'
                  ? 'AI Inquiries'
                  : 'Sessions'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Search history records..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs outline-none focus:border-[#d47a37]"
            />
          </div>
        </div>

        {/* History Table / Timeline List */}
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6b7280]">
              No history entries found matching your query.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#141824] border border-[#1f2638] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:border-[#d47a37]/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#d47a37] mt-1.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{item.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#090b10] text-[#f8b179] border border-[#252c3d]">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[#9ca3af] mt-0.5 text-[11px] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#6b7280] whitespace-nowrap sm:text-right pl-5 sm:pl-0">
                  {new Date(item.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
