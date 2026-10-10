import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryType, ThoughtPost, UserSession } from '../types';
import { logWorldwideStrategyHistory, logWordChartAuditHistory } from '../utils/userStorage';
import { WorldwideConversationColumn } from './WorldwideConversationColumn';
import {
  Share2,
  UploadCloud,
  Image as ImageIcon,
  Video,
  Sparkles,
  MessageCircle,
  ThumbsUp,
  TrendingUp,
  BarChart2,
  Send,
  Zap,
  Filter,
  CheckCircle,
  Crown,
  Eye,
  FileText,
  Globe,
} from 'lucide-react';

interface ShareThoughtsFuseProps {
  currentCategory: CategoryType;
  userSession: UserSession | null;
  onRequestLogin: () => void;
}

export const ShareThoughtsFuse: React.FC<ShareThoughtsFuseProps> = ({
  currentCategory,
  userSession,
  onRequestLogin,
}) => {
  const [thoughts, setThoughts] = useState<ThoughtPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postText, setPostText] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // Real-time word conversion analysis state
  const [conversionScore, setConversionScore] = useState({
    cvr: '2.5% CVR',
    hookScore: 72,
    wordScore: 'Awaiting Copy Input',
    estimatedRoas: '2.40x ROAS',
  });
  const [isAnalyzingCopy, setIsAnalyzingCopy] = useState(false);
  const [aiCopyAudit, setAiCopyAudit] = useState<{
    rewrittenHook: string;
    tacticalFeedback: string;
    modelUsed: string;
    latencyMs: number;
  } | null>(null);
  const [aiCopyError, setAiCopyError] = useState<string | null>(null);

  const handleRunGeminiCopyAudit = async () => {
    if (!postText.trim() || isAnalyzingCopy) return;
    setIsAnalyzingCopy(true);
    setAiCopyError(null);
    try {
      const res = await fetch('/api/thoughts/analyze-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: postTitle.trim(),
          text: postText.trim(),
          category: currentCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.analysis) {
        throw new Error(data.error || 'Gemini copy analysis failed');
      }
      setConversionScore({
        cvr: data.analysis.cvr,
        hookScore: data.analysis.hookScore,
        wordScore: `🤖 ${data.analysis.wordScore}`,
        estimatedRoas: data.analysis.estimatedRoas,
      });
      setAiCopyAudit({
        rewrittenHook: data.analysis.rewrittenHook || '',
        tacticalFeedback: data.analysis.tacticalFeedback || '',
        modelUsed: data.analysis.modelUsed || 'gemini-3.8-flash',
        latencyMs: data.analysis.latencyMs || 0,
      });
      logWordChartAuditHistory(
        currentCategory,
        postTitle.trim() || 'Gemini Word Conversion Audit',
        Number(data.analysis.hookScore) || 85,
        data.analysis.cvr || '3.8% CVR',
        data.analysis.estimatedRoas || '3.10x ROAS',
        `🤖 ${data.analysis.wordScore}`,
        postText.trim(),
        data.analysis.rewrittenHook || '',
        userSession?.email
      );
    } catch (err: any) {
      setAiCopyError(err?.message || 'Unable to run Gemini AI copy analysis.');
    } finally {
      setIsAnalyzingCopy(false);
    }
  };

  // Calculate live conversion heuristics as user types
  useEffect(() => {
    const text = postText.trim();
    if (!text) {
      setConversionScore({
        cvr: '2.5% CVR',
        hookScore: 72,
        wordScore: 'Awaiting Copy Input',
        estimatedRoas: '2.40x ROAS',
      });
      return;
    }

    const hasNumbers = /\d+/.test(text);
    const hasUrgentWords = /(now|today|exclusive|breakout|profit|scale|roi|cvr|system|instant|proven)/i.test(text);
    const hasQuestion = /\?/.test(text);
    const wordCount = text.split(/\s+/).length;

    let score = 70;
    if (hasNumbers) score += 10;
    if (hasUrgentWords) score += 12;
    if (hasQuestion) score += 6;
    if (mediaUrl) score += 10;
    if (wordCount > 15) score += 4;
    score = Math.min(99, score);

    const cvrVal = (2.0 + (score / 100) * 3.8).toFixed(1) + '% CVR';
    const roasVal = (1.8 + (score / 100) * 2.6).toFixed(2) + 'x ROAS';
    const classification =
      score > 90
        ? '🔥 High-Converting Viral Copy'
        : score > 80
        ? '⚡ Strong Operational Narrative'
        : 'Standard Educational Copy';

    setConversionScore({
      cvr: cvrVal,
      hookScore: score,
      wordScore: classification,
      estimatedRoas: roasVal,
    });
  }, [postText, mediaUrl]);

  // Load thoughts from server
  const loadThoughts = async () => {
    try {
      const res = await fetch(`/api/thoughts?category=${activeFilter}`);
      const data = await res.json();
      if (data.success && data.thoughts) {
        setThoughts(data.thoughts);
      }
    } catch (err) {
      console.error('Failed to load thoughts:', err);
    }
  };

  useEffect(() => {
    loadThoughts();
    const handleWorldwideSync = () => loadThoughts();
    window.addEventListener('lurl-worldwide-update', handleWorldwideSync);
    return () => window.removeEventListener('lurl-worldwide-update', handleWorldwideSync);
  }, [activeFilter]);

  // Handle media file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video');
    setMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFuseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession) {
      onRequestLogin();
      return;
    }
    if (!postTitle.trim() || !postText.trim()) return;

    setIsUploading(true);
    try {
      const response = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: currentCategory,
          title: postTitle.trim(),
          text: postText.trim(),
          mediaUrl: mediaUrl || undefined,
          mediaType: mediaUrl ? mediaType : undefined,
          authorName: userSession.isVip ? 'LURL VIP Executive' : userSession.name || userSession.email.split('@')[0],
          authorEmail: userSession.email,
          isVip: userSession.isVip,
        }),
      });

      const data = await response.json();
      if (data.success && data.thought) {
        setThoughts([data.thought, ...thoughts]);
        logWorldwideStrategyHistory(
          currentCategory,
          'strategy',
          postTitle.trim(),
          postText.trim(),
          userSession.email
        );
        logWordChartAuditHistory(
          currentCategory,
          postTitle.trim(),
          conversionScore.hookScore,
          conversionScore.cvr,
          conversionScore.estimatedRoas,
          conversionScore.wordScore,
          postText.trim(),
          aiCopyAudit?.rewrittenHook,
          userSession.email
        );
        window.dispatchEvent(new CustomEvent('lurl-worldwide-update'));
        setPostTitle('');
        setPostText('');
        setMediaUrl('');
        setAiCopyAudit(null);
      }
    } catch (err) {
      console.error('Fuse submit failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInput[postId]?.trim();
    if (!text) return;

    if (!userSession) {
      onRequestLogin();
      return;
    }

    try {
      const response = await fetch(`/api/thoughts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: userSession.isVip ? 'LURL VIP Executive' : userSession.name || userSession.email.split('@')[0],
          text,
          isVip: userSession.isVip,
        }),
      });

      const data = await response.json();
      if (data.success && data.comment) {
        setThoughts(
          thoughts.map((t) => (t.id === postId ? { ...t, comments: [...t.comments, data.comment] } : t))
        );
        setCommentInput({ ...commentInput, [postId]: '' });
      }
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/thoughts/${postId}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setThoughts(thoughts.map((t) => (t.id === postId ? { ...t, likes: data.likes } : t)));
      }
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return (
    <section id="share-thoughts-fuse-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-[#252c3d] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d47a37]/15 text-[#f8b179] border border-[#d47a37]/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Fuse Feature & Public Conversation
            </span>
            <span className="text-xs text-[#9ca3af]">Live Community Creative & Word Conversion</span>
          </div>
          <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold tracking-wide text-white">
            Share Thoughts & Word Conversion Feed
          </h2>
          <p className="text-sm text-[#9ca3af] mt-1 max-w-3xl">
            Upload photos, setups, or video creatives for your business. See in real-time how your words and visual hooks are converting, and engage in public discourse to clarify your business ideas.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0e1118] p-1.5 rounded-xl border border-[#252c3d]">
          {(['all', 'trading', 'dropshipping', 'ecommerce', 'startup', 'skill-development'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                activeFilter === filter
                  ? 'bg-[#d47a37] text-white'
                  : 'text-[#9ca3af] hover:text-white hover:bg-[#161a26]'
              }`}
            >
              {filter === 'skill-development' ? 'Skill Dev' : filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Fuse Upload & Word Conversion Analyzer (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-[#0e1118] border border-[#d47a37]/30 p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f2638]">
              <h3 className="font-['Cinzel'] text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#f8b179]" /> The Fuse Feature
              </h3>
              <span className="text-[11px] font-mono text-[#f8b179] bg-[#d47a37]/10 px-2 py-0.5 rounded-md border border-[#d47a37]/30">
                {currentCategory.toUpperCase()}
              </span>
            </div>

            <form onSubmit={handleFuseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                  Business Setup Title / Ad Hook
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scaled this 3-second hook to 4.8% CVR"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] border border-[#252c3d] focus:border-[#d47a37] text-white text-xs placeholder-[#4b5563] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                  Thought Narrative & Conversion Copy
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your strategy, trade setup, video script, or conversion hypothesis. Notice how the metrics update below..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] border border-[#252c3d] focus:border-[#d47a37] text-white text-xs placeholder-[#4b5563] outline-none transition-all resize-none"
                />
              </div>

              {/* Media Upload Area */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                  Upload Photo or Video Creative
                </label>

                <label className="border-2 border-dashed border-[#252c3d] hover:border-[#d47a37]/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-[#090b10]/80 transition-colors">
                  <UploadCloud className="w-7 h-7 text-[#d47a37] mb-1.5" />
                  <span className="text-xs text-[#d1d5db] font-medium">
                    {mediaUrl ? 'Creative Loaded (Click to Change)' : 'Click or Drag Photo / Video'}
                  </span>
                  <span className="text-[10px] text-[#6b7280] mt-0.5">Supports JPG, PNG, MP4, WebM</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Media Preview if attached */}
                {mediaUrl && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-[#252c3d] max-h-48 bg-black flex items-center justify-center">
                    {mediaType === 'video' ? (
                      <video src={mediaUrl} controls className="max-h-48 w-full object-contain" />
                    ) : (
                      <img
                        src={mediaUrl}
                        alt="Creative Preview"
                        referrerPolicy="no-referrer"
                        className="max-h-48 w-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setMediaUrl('')}
                      className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-[10px] hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Word Conversion Heuristic + Real Gemini AI Copy Audit */}
              <div className="p-4 rounded-xl bg-[#141824] border border-[#252c3d] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#f8b179] flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Word Conversion Analysis
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#34d399] font-mono">{conversionScore.wordScore}</span>
                    <button
                      type="button"
                      disabled={!postText.trim() || isAnalyzingCopy}
                      onClick={handleRunGeminiCopyAudit}
                      className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40 transition-all"
                      title="Audit your copy & hook with real server-side Google Gemini AI"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isAnalyzingCopy ? 'Gemini Auditing...' : 'Gemini AI Audit'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-[#090b10] border border-[#1f2638]">
                    <span className="text-[9px] text-[#6b7280] block uppercase">Est. Conversion</span>
                    <span className="text-xs font-bold text-white font-mono">{conversionScore.cvr}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#090b10] border border-[#1f2638]">
                    <span className="text-[9px] text-[#6b7280] block uppercase">Hook Score</span>
                    <span className="text-xs font-bold text-[#f8b179] font-mono">
                      {conversionScore.hookScore}/100
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#090b10] border border-[#1f2638]">
                    <span className="text-[9px] text-[#6b7280] block uppercase">Est. ROAS</span>
                    <span className="text-xs font-bold text-[#34d399] font-mono">
                      {conversionScore.estimatedRoas}
                    </span>
                  </div>
                </div>

                {aiCopyError && (
                  <div className="text-[11px] font-mono text-red-300 bg-red-950/40 border border-red-500/40 rounded-lg p-2">
                    ⚠️ {aiCopyError}
                  </div>
                )}

                {aiCopyAudit && (
                  <div className="p-3 rounded-lg bg-purple-950/25 border border-purple-500/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-purple-300">
                      <span>🤖 Real Gemini Audit ({aiCopyAudit.modelUsed})</span>
                      <span>{(aiCopyAudit.latencyMs / 1000).toFixed(2)}s</span>
                    </div>
                    {aiCopyAudit.tacticalFeedback && (
                      <p className="text-gray-200 text-[11px] leading-relaxed">
                        {aiCopyAudit.tacticalFeedback}
                      </p>
                    )}
                    {aiCopyAudit.rewrittenHook && (
                      <div className="pt-1.5 border-t border-purple-500/20 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-amber-300 font-mono">
                          <span className="text-gray-400">Suggested Hook: </span>
                          &ldquo;{aiCopyAudit.rewrittenHook}&rdquo;
                        </div>
                        <button
                          type="button"
                          onClick={() => setPostTitle(aiCopyAudit.rewrittenHook)}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold shrink-0 cursor-pointer"
                        >
                          Apply Hook
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                id="fuse-submit-button"
                disabled={isUploading || !postTitle.trim() || !postText.trim()}
                className="w-full py-3 px-6 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#d47a37] via-[#b85d19] to-[#8d3d0a] hover:from-[#e08a46] hover:to-[#a2480f] shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-4 h-4" /> Fuse into Public & Worldwide Feed
              </button>
            </form>
          </div>

          {/* Real-Time Worldwide Strategy & Tactics Stream */}
          <WorldwideConversationColumn userSession={userSession} />
        </div>

        {/* Right Column: Share Thoughts Column / Public Discussion Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-['Cinzel'] text-base font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#f8b179]" /> The Public Conversation
            </h3>
            <span className="text-xs text-[#9ca3af]">{thoughts.length} Thought Posts Live</span>
          </div>

          <div className="space-y-6">
            {thoughts.length === 0 ? (
              <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] p-10 text-center space-y-3">
                <Globe className="w-10 h-10 text-[#f8b179] mx-auto opacity-80" />
                <h4 className="font-['Cinzel'] text-base font-bold text-white">
                  100% Real Public Feed — Zero Fake Seed Posts
                </h4>
                <p className="text-xs text-[#9ca3af] max-w-md mx-auto leading-relaxed">
                  All simulated placeholder posts have been removed. Publish a thought on the left or broadcast a strategy in the Worldwide Conversation column to populate the live feed.
                </p>
              </div>
            ) : (
              thoughts.map((post) => (
              <motion.div
                key={post.id}
                id={`thought-card-${post.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-[#0e1118] border border-[#252c3d] hover:border-[#d47a37]/40 transition-colors p-5 sm:p-6 shadow-xl space-y-4"
              >
                {/* Author & Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#d47a37] to-[#8d3d0a] flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{post.authorName}</span>
                        {post.isVip && (
                          <span className="px-2 py-0.5 rounded-full bg-[#f8b179]/20 text-[#f8b179] text-[10px] font-bold border border-[#f8b179]/40 flex items-center gap-1">
                            <Crown className="w-3 h-3" /> VIP
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#6b7280]">
                        Domain: {post.category.toUpperCase()} • {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Word Conversion Badges */}
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 text-[10px] font-mono font-bold">
                      {post.metrics.conversionRate}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#d47a37]/10 text-[#f8b179] border border-[#d47a37]/30 text-[10px] font-mono font-bold">
                      {post.metrics.estimatedRoas}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{post.title}</h4>
                  <p className="text-xs text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                    {post.text}
                  </p>
                </div>

                {/* Media Attachment if Present */}
                {post.mediaUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#252c3d] max-h-72 bg-black flex items-center justify-center">
                    {post.mediaType === 'video' ? (
                      <video src={post.mediaUrl} controls className="max-h-72 w-full object-contain" />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt={post.title}
                        referrerPolicy="no-referrer"
                        className="max-h-72 w-full object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Engagement Bar */}
                <div className="pt-3 border-t border-[#1f2638] flex items-center justify-between text-xs text-[#9ca3af]">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 hover:text-[#f8b179] transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes} Helpful</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                    }
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments.length} Public Clarifications</span>
                  </button>
                </div>

                {/* Clarification Comments Thread */}
                {post.comments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#1a202c]">
                    {post.comments.map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 rounded-xl bg-[#090b10] border border-[#1f2638] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white flex items-center gap-1">
                            {comm.author}
                            {comm.isVip && <Crown className="w-3 h-3 text-[#f8b179]" />}
                          </span>
                          <span className="text-[10px] text-[#6b7280]">
                            {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[#d1d5db]">{comm.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Input Form */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Clarify this thought through the word..."
                    value={commentInput[post.id] || ''}
                    onChange={(e) =>
                      setCommentInput({ ...commentInput, [post.id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddComment(post.id);
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#090b10] border border-[#252c3d] text-white text-xs placeholder-[#4b5563] outline-none focus:border-[#d47a37]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(post.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#d47a37] hover:bg-[#b85d19] text-white text-xs font-semibold cursor-pointer shadow-md transition-colors"
                  >
                    Post
                  </button>
                </div>
              </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
