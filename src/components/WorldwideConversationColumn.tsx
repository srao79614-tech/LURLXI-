import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { UserSession, WorldwideActiveUser } from '../types';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { logWorldwideStrategyHistory } from '../utils/userStorage';
import {
  Globe,
  Send,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Zap,
  Target,
  Lightbulb,
  Check,
  Share2,
  Filter,
  Users,
  Bot,
  RefreshCw,
} from 'lucide-react';

export type ConversationType = 'all' | 'strategy' | 'tactic' | 'thought';

export interface WorldwideReply {
  id: string;
  author: string;
  flag?: string;
  text: string;
  timestamp: number;
  isAi?: boolean;
}

export interface WorldwidePost {
  id: string;
  author: string;
  authorEmail?: string;
  flag: string;
  location: string;
  roleBadge: string;
  type: 'strategy' | 'tactic' | 'thought' | 'message';
  text: string;
  tag?: string;
  timestamp: number;
  likes: number;
  hasLiked?: boolean;
  isAiInsight?: boolean;
  modelUsed?: string;
  replies?: WorldwideReply[];
}

const STORAGE_KEY = 'lurl_worldwide_conversations_v2';
const LEGACY_FAKE_IDS = new Set([
  'ww-init-1',
  'ww-init-2',
  'ww-init-3',
  'ww-init-4',
  'ww_seed_1',
  'ww_seed_2',
  'ww_seed_3',
  'ww_seed_4',
  'ww_seed_5',
  'thought-1',
  'thought-2',
]);

interface WorldwideConversationColumnProps {
  userSession?: UserSession | null;
  className?: string;
  isFullWidth?: boolean;
}

export const WorldwideConversationColumn: React.FC<WorldwideConversationColumnProps> = ({
  userSession,
  className = '',
}) => {
  const [posts, setPosts] = useState<WorldwidePost[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [activeUsers, setActiveUsers] = useState<WorldwideActiveUser[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // Filter Tab
  const [activeFilter, setActiveFilter] = useState<ConversationType>('all');

  // Form State
  const [postType, setPostType] = useState<'strategy' | 'tactic' | 'thought'>('strategy');
  const [thoughtInput, setThoughtInput] = useState('');
  const [selectedTag, setSelectedTag] = useState('BTC Setup');
  const [authorName, setAuthorName] = useState(userSession?.name || 'Verified Trader');
  const [authorFlag, setAuthorFlag] = useState('🌐');
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Reply & Real Gemini AI Insight State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [aiAnalyzingId, setAiAnalyzingId] = useState<string | null>(null);
  const [aiBroadcasting, setAiBroadcasting] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (userSession?.name) {
      setAuthorName(userSession.name);
    } else if (userSession?.email) {
      setAuthorName(userSession.email.split('@')[0]);
    }
  }, [userSession]);

  // Helper to merge and deduplicate real posts (rejecting any legacy fake seed IDs)
  const updateRealPosts = (incoming: WorldwidePost[]) => {
    const clean = incoming.filter((p) => p && p.id && !LEGACY_FAKE_IDS.has(p.id));
    setPosts(clean);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (_) {}
  };

  // Connect to Real Server (REST + WebSocket /ws/worldwide + SSE /api/worldwide/stream)
  useEffect(() => {
    // Purge old v1 fake cache if present
    try {
      localStorage.removeItem('lurl_worldwide_conversations_v1');
    } catch (_) {}

    const fetchServerMessages = async () => {
      try {
        const res = await fetch('/api/worldwide/messages');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.messages)) {
            updateRealPosts(data.messages);
          }
          if (typeof data.onlineCount === 'number') {
            setOnlineCount(Math.max(1, data.onlineCount));
          }
          if (Array.isArray(data.activeUsers)) {
            setActiveUsers(data.activeUsers);
          }
        }
      } catch (_) {}
    };

    fetchServerMessages();

    const handleLocalUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setPosts(parsed.filter((p) => p && p.id && !LEGACY_FAKE_IDS.has(p.id)));
          }
        }
      } catch (_) {}
    };

    window.addEventListener('lurl-worldwide-update', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    // 1. Real WebSocket connection to /ws/worldwide
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isUnmounted = false;

    const connectWebSocket = () => {
      if (isUnmounted || typeof window === 'undefined') return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/worldwide`;
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          ws?.send(
            JSON.stringify({
              type: 'join',
              name: userSession?.name || authorName || 'Verified Trader',
              email: userSession?.email,
              flag: authorFlag || '🌐',
              location: 'Live WebSocket',
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            handleRealtimePayload(payload);
          } catch (_) {}
        };

        ws.onclose = () => {
          setWsConnected(false);
          if (!isUnmounted) {
            reconnectTimer = setTimeout(connectWebSocket, 3000);
          }
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (_) {}
    };

    const handleRealtimePayload = (payload: any) => {
      if (!payload || typeof payload !== 'object') return;
      if (typeof payload.onlineCount === 'number') {
        setOnlineCount(Math.max(1, payload.onlineCount));
      }
      if (Array.isArray(payload.activeUsers)) {
        setActiveUsers(payload.activeUsers);
      }

      if (payload.type === 'init' && Array.isArray(payload.messages)) {
        updateRealPosts(payload.messages);
      } else if (payload.type === 'new_message') {
        const msg = payload.message || payload.post;
        if (msg && msg.id && !LEGACY_FAKE_IDS.has(msg.id)) {
          setPosts((prev) => {
            const exists = prev.some((p) => p.id === msg.id);
            const next = exists
              ? prev.map((p) => (p.id === msg.id ? msg : p))
              : [msg, ...prev];
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch (_) {}
            return next;
          });
        }
      } else if (payload.type === 'update_message') {
        const msg = payload.message || payload.post;
        if (msg && msg.id) {
          setPosts((prev) => {
            const next = prev.map((p) => (p.id === msg.id ? { ...p, ...msg } : p));
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch (_) {}
            return next;
          });
        }
      } else if (payload.type === 'typing' && payload.author) {
        if (payload.isTyping && payload.author !== authorName) {
          setTypingUser(`${payload.flag || '🌐'} ${payload.author}`);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2500);
        } else {
          setTypingUser(null);
        }
      }
    };

    connectWebSocket();

    // 2. SSE Stream backup for proxy environments
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/worldwide/stream');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleRealtimePayload(payload);
        } catch (_) {}
      };
    } catch (_) {}

    return () => {
      isUnmounted = true;
      window.removeEventListener('lurl-worldwide-update', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (ws) ws.close();
      if (eventSource) eventSource.close();
    };
  }, []);

  const savePosts = (newPosts: WorldwidePost[]) => {
    const clean = newPosts.filter((p) => p && p.id && !LEGACY_FAKE_IDS.has(p.id));
    setPosts(clean);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      window.dispatchEvent(new CustomEvent('lurl-worldwide-update'));
    } catch (_) {}
  };

  const handleTypingChange = (val: string) => {
    setThoughtInput(val);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: 'typing',
            author: authorName.trim() || 'Verified Trader',
            flag: authorFlag,
            isTyping: val.trim().length > 0,
          })
        );
      } catch (_) {}
    }
  };

  // Submit new real thought/strategy/tactic
  const handlePostThought = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = thoughtInput.trim();
    if (!cleanText) return;

    playClickSound();
    setAiError(null);

    const cleanAuthor = authorName.trim() || 'Verified Trader';
    const roleBadge =
      postType === 'strategy'
        ? 'Tactical Strategist'
        : postType === 'tactic'
        ? 'Execution Specialist'
        : 'Market Observer';

    const messageId = `ww-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const optimisticPost: WorldwidePost = {
      id: messageId,
      author: cleanAuthor,
      authorEmail: userSession?.email,
      flag: authorFlag || '🌐',
      location: 'Live Terminal',
      roleBadge,
      type: postType,
      tag: selectedTag,
      text: cleanText,
      timestamp: Date.now(),
      likes: 1,
      hasLiked: true,
      replies: [],
    };

    savePosts([optimisticPost, ...posts]);
    setThoughtInput('');
    playSuccessChime();

    logWorldwideStrategyHistory('trading', postType, selectedTag, cleanText);

    try {
      const res = await fetch('/api/worldwide/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: messageId,
          author: cleanAuthor,
          authorEmail: userSession?.email,
          flag: authorFlag || '🌐',
          location: 'Live Terminal',
          roleBadge,
          type: postType,
          category: 'trading',
          tag: selectedTag,
          text: cleanText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const serverPost = data.post || data.message;
        if (data.success && serverPost) {
          setPosts((prev) => {
            const replaced = prev.map((p) => (p.id === messageId ? serverPost : p));
            const deduplicated = replaced.filter(
              (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx
            );
            localStorage.setItem(STORAGE_KEY, JSON.stringify(deduplicated));
            window.dispatchEvent(new CustomEvent('lurl-worldwide-update'));
            return deduplicated;
          });
        }
      }
    } catch (_) {}
  };

  // Trigger real Gemini AI Insight on an existing post or new topic
  const handleRequestGeminiInsight = async (post?: WorldwidePost) => {
    playClickSound();
    setAiError(null);
    if (post) {
      setAiAnalyzingId(post.id);
    } else {
      setAiBroadcasting(true);
    }

    try {
      const res = await fetch('/api/worldwide/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post?.id,
          prompt: post
            ? undefined
            : thoughtInput.trim() ||
              `Provide a real-time ${selectedTag} quantitative strategy & risk rule for worldwide traders.`,
          category: 'trading',
          requestedBy: authorName.trim() || 'Verified Trader',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gemini AI Worldwide Insight failed');
      }
      playSuccessChime();
      if (!post && thoughtInput.trim()) {
        setThoughtInput('');
      }
    } catch (err: any) {
      setAiError(err?.message || 'Real Gemini API request failed.');
    } finally {
      setAiAnalyzingId(null);
      setAiBroadcasting(false);
    }
  };

  const handleSendReply = async (postId: string) => {
    const text = (replyInput[postId] || '').trim();
    if (!text) return;
    playClickSound();

    try {
      const res = await fetch('/api/worldwide/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: postId,
          author: authorName.trim() || 'Verified Trader',
          flag: authorFlag || '🌐',
          text,
        }),
      });
      if (res.ok) {
        setReplyInput((prev) => ({ ...prev, [postId]: '' }));
        playSuccessChime();
      }
    } catch (_) {}
  };

  const handleToggleLike = async (postId: string) => {
    playClickSound();
    let delta = 1;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const currentlyLiked = p.hasLiked;
        delta = currentlyLiked ? -1 : 1;
        return {
          ...p,
          likes: Math.max(0, p.likes + delta),
          hasLiked: !currentlyLiked,
        };
      }
      return p;
    });
    savePosts(updated);

    try {
      await fetch('/api/worldwide/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId, delta }),
      });
    } catch (_) {}
  };

  const handleCopyPost = (post: WorldwidePost) => {
    playClickSound();
    navigator.clipboard.writeText(
      `[${post.type.toUpperCase()}] ${post.author} (${post.location}): ${post.text}`
    );
    setCopiedPostId(post.id);
    setTimeout(() => setCopiedPostId(null), 2000);
  };

  const filteredPosts = posts.filter((p) => {
    if (activeFilter === 'all') return true;
    return p.type === activeFilter;
  });

  const availableTags = [
    'BTC Setup',
    'Liquidity Sweep',
    'Order Flow',
    'Risk Rule',
    'Wyckoff',
    'Macro Bias',
    'Scalping',
  ];

  const flags = ['🌐', '🇺🇸', '🇬🇧', '🇯🇵', '🇦🇪', '🇨🇭', '🇸🇬', '🇩🇪', '🇦🇺', '🇨🇦'];

  return (
    <div
      id="worldwide-conversation-column"
      className={`rounded-xl bg-[#0f131f] border border-[#212b40] flex flex-col h-full shadow-2xl overflow-hidden ${className}`}
    >
      {/* Column Header */}
      <div className="p-3.5 bg-gradient-to-r from-[#141b2c] via-[#111624] to-[#141b2c] border-b border-[#212b40] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Worldwide Conversation
              </h3>
              <span
                className={`w-2 h-2 rounded-full ${
                  wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>
            <p className="text-[10px] font-mono text-[#9ca3af] flex items-center gap-1.5">
              <Users className="w-3 h-3 text-emerald-400" />
              <span>
                {onlineCount} {onlineCount === 1 ? 'Real Connection' : 'Real Connections'} •{' '}
                {wsConnected ? 'WebSocket Live' : 'SSE Sync'}
              </span>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#182032] text-cyan-300 border border-cyan-700/40 shrink-0">
          {posts.length} Real Posts
        </span>
      </div>

      {/* Active Connected Presence Strip */}
      {activeUsers.length > 0 && (
        <div className="px-3 py-1.5 bg-[#0a0e17] border-b border-[#1c2538] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
          <span className="text-emerald-400 font-bold shrink-0">● Active Now:</span>
          {activeUsers.slice(0, 6).map((u) => (
            <span
              key={u.clientId}
              className="px-2 py-0.5 rounded bg-[#141b2b] text-gray-300 border border-[#232f46] shrink-0"
            >
              {u.flag} {u.name}
            </span>
          ))}
        </div>
      )}

      {/* Express Input Composer Box */}
      <div className="p-3 bg-[#0d101a] border-b border-[#1f283d]">
        <form onSubmit={handlePostThought} className="space-y-2.5">
          <div className="flex items-center gap-1 bg-[#141824] p-0.5 rounded-lg border border-[#212a3d] text-[10px] font-mono">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setPostType('strategy');
              }}
              className={`flex-1 py-1 rounded flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                postType === 'strategy'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Target className="w-3 h-3" />
              <span>Strategy</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setPostType('tactic');
              }}
              className={`flex-1 py-1 rounded flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                postType === 'tactic'
                  ? 'bg-[#d47a37] text-white shadow'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Tactic</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setPostType('thought');
              }}
              className={`flex-1 py-1 rounded flex items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                postType === 'thought'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
            >
              <Lightbulb className="w-3 h-3" />
              <span>Thought</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={2}
              value={thoughtInput}
              onChange={(e) => handleTypingChange(e.target.value)}
              placeholder={`Publish a real ${postType} to connected users worldwide (or ask Gemini AI to broadcast an insight)...`}
              className="w-full px-3 py-2 bg-[#121624] border border-[#26334d] focus:border-cyan-500 rounded-lg text-white placeholder-[#6b7280] text-xs font-mono resize-none outline-none leading-relaxed"
            />
          </div>

          {aiError && (
            <div className="text-[10px] font-mono text-red-300 bg-red-950/40 border border-red-500/40 rounded px-2.5 py-1.5">
              ⚠️ {aiError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <select
                value={authorFlag}
                onChange={(e) => setAuthorFlag(e.target.value)}
                className="bg-[#141926] text-white border border-[#253046] rounded px-1.5 py-1 text-xs cursor-pointer outline-none"
                title="Your Country Flag"
              >
                {flags.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>

              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-[#141926] text-[#cbd5e1] border border-[#253046] rounded px-2 py-1 text-[10px] cursor-pointer outline-none"
              >
                {availableTags.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={aiBroadcasting}
                onClick={() => handleRequestGeminiInsight()}
                className="px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 transition-all cursor-pointer disabled:opacity-50"
                title="Generate & broadcast a real Google Gemini AI insight to everyone in Worldwide Chat"
              >
                {aiBroadcasting ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Bot className="w-3 h-3" />
                )}
                <span>Ask Gemini AI</span>
              </button>

              <button
                type="submit"
                disabled={!thoughtInput.trim()}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow ${
                  thoughtInput.trim()
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white'
                    : 'bg-[#182030] text-[#4b5563] cursor-not-allowed border border-[#232b3d]'
                }`}
              >
                <Send className="w-3 h-3" />
                <span>Publish Live</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Real-time typing indicator */}
      {typingUser && (
        <div className="px-3 py-1 bg-cyan-950/30 border-b border-cyan-500/20 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{typingUser} is typing a live message...</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-3 py-1.5 bg-[#0d1017] border-b border-[#1f283d] flex items-center gap-1 text-[10px] font-mono overflow-x-auto">
        <span className="text-[#6b7280] uppercase tracking-wider flex items-center gap-1 mr-1">
          <Filter className="w-2.5 h-2.5" />
          Filter:
        </span>
        {(['all', 'strategy', 'tactic', 'thought'] as ConversationType[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              playClickSound();
              setActiveFilter(tab);
            }}
            className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === tab
                ? 'bg-[#1d273c] text-white font-bold border border-[#2d3b59]'
                : 'text-[#9ca3af] hover:text-white'
            }`}
          >
            {tab === 'all' ? 'All Live' : `${tab}s`}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 divide-y divide-[#182030] max-h-[480px]">
        {filteredPosts.length === 0 ? (
          <div className="py-10 px-4 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono text-white font-bold">
              100% Real Worldwide Stream — Zero Fake Seed Posts
            </div>
            <p className="text-[11px] font-mono text-[#9ca3af] max-w-xs mx-auto leading-relaxed">
              No simulated messages are pre-filled. Publish the first real strategy above or click{' '}
              <strong className="text-purple-300">Ask Gemini AI</strong> to generate a live AI market analysis!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const timeAgoStr = getTimeAgo(post.timestamp);
            const isStrategy = post.type === 'strategy';
            const isTactic = post.type === 'tactic';

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-3 first:pt-0 space-y-2 group"
              >
                {/* Author Info & Tag Header */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{post.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{post.author}</span>
                        <span className="text-[9px] text-[#6b7280]">• {post.location}</span>
                      </div>
                      <div className="text-[10px] text-[#9ca3af] flex items-center gap-1">
                        <span
                          className={
                            post.isAiInsight
                              ? 'text-purple-300 font-semibold'
                              : 'text-[#f8b179] font-medium'
                          }
                        >
                          {post.roleBadge}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {post.tag && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161c2b] text-[#cbd5e1] border border-[#252f44]">
                        {post.tag}
                      </span>
                    )}
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold border ${
                        post.isAiInsight
                          ? 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                          : isStrategy
                          ? 'bg-purple-950/70 text-purple-300 border-purple-800/50'
                          : isTactic
                          ? 'bg-[#2b1b11] text-[#f8b179] border-[#d47a37]/50'
                          : 'bg-cyan-950/70 text-cyan-300 border-cyan-800/50'
                      }`}
                    >
                      {post.isAiInsight ? 'GEMINI AI' : post.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <p
                  className={`text-xs font-mono leading-relaxed whitespace-pre-wrap p-2.5 rounded-lg border ${
                    post.isAiInsight
                      ? 'bg-purple-950/20 border-purple-500/30 text-purple-100'
                      : 'bg-[#121622]/60 border-[#1c2436] text-[#cbd5e1]'
                  }`}
                >
                  {post.text}
                </p>

                {/* Replies List */}
                {post.replies && post.replies.length > 0 && (
                  <div className="pl-3 border-l-2 border-[#232f46] space-y-1.5 pt-1">
                    {post.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className={`p-2 rounded-lg text-[11px] font-mono ${
                          rep.isAi
                            ? 'bg-purple-950/30 border border-purple-500/30 text-purple-200'
                            : 'bg-[#0b0e16] border border-[#1c2436] text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span className="font-bold text-white">
                            {rep.flag || '🌐'} {rep.author}
                          </span>
                          <span className="text-gray-500">{getTimeAgo(rep.timestamp)}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{rep.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Footer: Timestamp, AI Analyze, Reply, Share, Like */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#6b7280] pt-0.5">
                  <span>⏱️ {timeAgoStr}</span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={aiAnalyzingId === post.id}
                      onClick={() => handleRequestGeminiInsight(post)}
                      className="px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                      title="Ask real Google Gemini AI to analyze this post"
                    >
                      {aiAnalyzingId === post.id ? (
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-2.5 h-2.5" />
                      )}
                      <span>AI Analyze</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setReplyingToId(replyingToId === post.id ? null : post.id)
                      }
                      className="px-2 py-0.5 rounded hover:bg-[#182132] text-[#9ca3af] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>Reply ({post.replies?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyPost(post)}
                      className="p-1 rounded hover:bg-[#182132] text-[#9ca3af] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                      title="Copy conversation"
                    >
                      {copiedPostId === post.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3 h-3" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id)}
                      className={`px-2 py-0.5 rounded flex items-center gap-1 border transition-all cursor-pointer ${
                        post.hasLiked
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50 font-bold'
                          : 'bg-[#141926] text-[#9ca3af] hover:text-white border-[#222b40]'
                      }`}
                    >
                      <ThumbsUp className="w-2.5 h-2.5" />
                      <span>{post.likes}</span>
                    </button>
                  </div>
                </div>

                {/* Inline Reply Input */}
                {replyingToId === post.id && (
                  <div className="pt-1.5 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={replyInput[post.id] || ''}
                      onChange={(e) =>
                        setReplyInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Write a real-time reply..."
                      className="flex-1 bg-[#090c14] border border-[#26334d] rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSendReply(post.id)}
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-mono font-bold cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
