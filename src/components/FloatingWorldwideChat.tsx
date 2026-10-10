import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Globe,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  ThumbsUp,
  Send,
  Check,
  Share2,
  Users,
  Bot,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { logActivity } from '../utils/activityHistory';
import { logWorldwideStrategyHistory } from '../utils/userStorage';
import { WorldwidePost, ConversationType } from './WorldwideConversationColumn';
import { WorldwideActiveUser } from '../types';

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

export const FloatingWorldwideChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [posts, setPosts] = useState<WorldwidePost[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [activeUsers, setActiveUsers] = useState<WorldwideActiveUser[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const [filter, setFilter] = useState<ConversationType>('all');
  const [postType, setPostType] = useState<'strategy' | 'tactic' | 'thought'>('strategy');
  const [tagInput, setTagInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [authorName, setAuthorName] = useState(() => {
    try {
      const s = localStorage.getItem('lurl_session');
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed?.name) return parsed.name;
        if (parsed?.email) return String(parsed.email).split('@')[0];
      }
    } catch (_) {}
    return 'Verified Trader';
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [aiLoadingId, setAiLoadingId] = useState<string | null>(null);
  const [aiBroadcasting, setAiBroadcasting] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  const updateRealPosts = (incoming: WorldwidePost[]) => {
    const clean = incoming.filter((p) => p && p.id && !LEGACY_FAKE_IDS.has(p.id));
    setPosts(clean);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (_) {}
  };

  const loadPosts = async () => {
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

  useEffect(() => {
    try {
      localStorage.removeItem('lurl_worldwide_conversations_v1');
    } catch (_) {}

    loadPosts();

    const handleCustomUpdate = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setPosts(parsed.filter((p) => p && p.id && !LEGACY_FAKE_IDS.has(p.id)));
          }
        }
      } catch (_) {}
    };

    window.addEventListener('storage', handleCustomUpdate);
    window.addEventListener('lurl-worldwide-update', handleCustomUpdate);

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

    // 1. Real WebSocket connection to /ws/worldwide
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let isUnmounted = false;

    const connectWs = () => {
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
              name: authorName || 'Verified Trader',
              flag: '🌐',
              location: 'Global Grid',
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
            reconnectTimer = setTimeout(connectWs, 3000);
          }
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (_) {}
    };

    connectWs();

    // 2. Real-time SSE fallback stream
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
      window.removeEventListener('storage', handleCustomUpdate);
      window.removeEventListener('lurl-worldwide-update', handleCustomUpdate);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (ws) ws.close();
      if (eventSource) eventSource.close();
    };
  }, []);

  const handleMessageInputChange = (val: string) => {
    setMessageInput(val);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(
          JSON.stringify({
            type: 'typing',
            author: authorName.trim() || 'Verified Trader',
            flag: '🌐',
            isTyping: val.trim().length > 0,
          })
        );
      } catch (_) {}
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    playClickSound();
    setAiError(null);

    const cleanText = messageInput.trim();
    const cleanAuthor = authorName.trim() || 'Verified Trader';
    const cleanTag =
      tagInput.trim() ||
      (postType === 'strategy'
        ? 'Breakout'
        : postType === 'tactic'
        ? 'Execution Rule'
        : 'Market Bias');

    const msgId = `ww-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const optimisticPost: WorldwidePost = {
      id: msgId,
      author: cleanAuthor,
      flag: '🌐',
      location: 'Global Grid',
      roleBadge:
        postType === 'strategy'
          ? 'SMC Specialist'
          : postType === 'tactic'
          ? 'Tactical Scalper'
          : 'Market Thinker',
      type: postType,
      tag: cleanTag,
      text: cleanText,
      timestamp: Date.now(),
      likes: 1,
      hasLiked: true,
      replies: [],
    };

    const updated = [optimisticPost, ...posts];
    setPosts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lurl-worldwide-update'));
    } catch (_) {}

    setMessageInput('');
    setTagInput('');
    playSuccessChime();

    logActivity('trading', `Published Worldwide ${postType.toUpperCase()}`, cleanText.slice(0, 80));
    logWorldwideStrategyHistory('trading', postType, cleanTag, cleanText);

    try {
      const res = await fetch('/api/worldwide/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: msgId,
          author: cleanAuthor,
          flag: '🌐',
          location: 'Global Grid',
          roleBadge: optimisticPost.roleBadge,
          type: postType,
          category: 'trading',
          tag: cleanTag,
          text: cleanText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const serverPost = data.post || data.message;
        if (data.success && serverPost) {
          setPosts((prev) => {
            const replaced = prev.map((p) => (p.id === msgId ? serverPost : p));
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

  const handleRequestAiInsight = async (post?: WorldwidePost) => {
    playClickSound();
    setAiError(null);
    if (post) {
      setAiLoadingId(post.id);
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
            : messageInput.trim() ||
              'Share a real-time quantitative trading & business execution insight for the Worldwide stream.',
          category: 'trading',
          requestedBy: authorName.trim() || 'Verified Trader',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gemini AI Worldwide Insight failed');
      }
      playSuccessChime();
      if (!post && messageInput.trim()) {
        setMessageInput('');
      }
    } catch (err: any) {
      setAiError(err?.message || 'Real Gemini API call failed.');
    } finally {
      setAiLoadingId(null);
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
          flag: '🌐',
          text,
        }),
      });
      if (res.ok) {
        setReplyInput((prev) => ({ ...prev, [postId]: '' }));
        playSuccessChime();
      }
    } catch (_) {}
  };

  const handleLike = async (id: string) => {
    playClickSound();
    let delta = 1;
    const updated = posts.map((p) => {
      if (p.id === id) {
        const hasLiked = !!p.hasLiked;
        delta = hasLiked ? -1 : 1;
        return {
          ...p,
          likes: Math.max(0, p.likes + delta),
          hasLiked: !hasLiked,
        };
      }
      return p;
    });

    setPosts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('lurl-worldwide-update'));
    } catch (_) {}

    try {
      await fetch('/api/worldwide/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, delta }),
      });
    } catch (_) {}
  };

  const handleShare = (id: string, text: string) => {
    playClickSound();
    navigator.clipboard.writeText(`[LURL Worldwide Conversation] ${text}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === 'all') return true;
    return p.type === filter;
  });

  return (
    <>
      {/* 1. Floating Worldwide Conversation Icon */}
      <div className="fixed bottom-36 right-6 z-50 flex items-center justify-end pointer-events-auto">
        {!isOpen && (
          <motion.button
            id="floating-worldwide-btn"
            type="button"
            onClick={() => {
              playClickSound();
              setIsOpen(true);
              setIsMinimized(false);
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="group relative flex items-center gap-2.5 p-1 cursor-pointer focus:outline-none"
            aria-label="Open Worldwide Conversations"
            title="Real-Time WebSocket Worldwide Conversation Stream"
          >
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-75 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />

            <div className="relative w-14 h-14 rounded-full bg-[#0d131f] border-2 border-emerald-400/40 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/30 animate-spin-slow opacity-80" />
              <div className="relative z-10 flex flex-col items-center justify-center text-emerald-300">
                <Globe className="w-6 h-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              </div>
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d131f]" />
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d131f]/95 text-white font-medium text-xs border border-emerald-400/30 shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Worldwide Chat</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">
                {onlineCount} ONLINE
              </span>
            </span>
          </motion.button>
        )}
      </div>

      {/* 2. Floating Conversation Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-worldwide-window"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : undefined,
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[460px] ${
              isMinimized ? 'h-auto' : 'h-[640px] max-h-[85vh]'
            } bg-[#0b0e17]/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-gray-200`}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#0d1624] via-[#09111c] to-[#070b12] border-b border-emerald-500/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white tracking-wide flex items-center gap-1.5">
                      Worldwide Conversation
                    </h3>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      {wsConnected ? 'WS LIVE' : 'SSE SYNC'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 font-mono">
                    <Users className="w-3 h-3 text-cyan-400" />
                    <span>
                      {onlineCount} {onlineCount === 1 ? 'Real User Connected' : 'Real Users Connected'} •{' '}
                      {posts.length} Posts
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  title={isMinimized ? 'Expand Window' : 'Minimize Window'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsOpen(false);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Close Worldwide Conversation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Active Users Strip */}
                {activeUsers.length > 0 && (
                  <div className="px-3 py-1.5 bg-[#06090f] border-b border-[#192233] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono shrink-0">
                    <span className="text-emerald-400 font-bold shrink-0">● Connected:</span>
                    {activeUsers.slice(0, 6).map((u) => (
                      <span
                        key={u.clientId}
                        className="px-2 py-0.5 rounded bg-[#111726] text-gray-300 border border-[#232f46] shrink-0"
                      >
                        {u.flag} {u.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Filter Tabs */}
                <div className="px-3 py-2 bg-[#080b12] border-b border-[#1f2739] flex items-center justify-between gap-1.5 shrink-0 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1.5">
                    {(['all', 'strategy', 'tactic', 'thought'] as ConversationType[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setFilter(tab);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                          filter === tab
                            ? 'bg-emerald-500 text-[#070b12] font-bold shadow-sm'
                            : 'bg-[#121724] text-gray-400 hover:text-white hover:bg-[#1a2235]'
                        }`}
                      >
                        {tab === 'all' ? 'All Live' : tab}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={aiBroadcasting}
                    onClick={() => handleRequestAiInsight()}
                    className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                    title="Ask real Google Gemini AI to broadcast a strategy into Worldwide Chat"
                  >
                    {aiBroadcasting ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Bot className="w-3 h-3" />
                    )}
                    <span>+ Gemini AI Insight</span>
                  </button>
                </div>

                {typingUser && (
                  <div className="px-3 py-1 bg-emerald-950/30 border-b border-emerald-500/20 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{typingUser} is typing...</span>
                  </div>
                )}

                {aiError && (
                  <div className="px-3 py-1.5 bg-red-950/50 border-b border-red-500/40 text-[11px] font-mono text-red-200 shrink-0">
                    ⚠️ {aiError}
                  </div>
                )}

                {/* Feed Stream */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 divide-y divide-[#182030]/50">
                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 px-4 space-y-2">
                      <Globe className="w-8 h-8 text-emerald-400/60 mx-auto" />
                      <div className="text-xs font-bold text-white font-mono">
                        Real-Time Worldwide Stream Ready
                      </div>
                      <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                        Zero simulated or fake posts. Publish the first real message below or click{' '}
                        <strong className="text-purple-300">+ Gemini AI Insight</strong> to generate a live Gemini AI strategy!
                      </p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => (
                      <div key={post.id} className="pt-3 first:pt-0 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white text-[12px]">{post.author}</span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                              <span>{post.flag}</span>
                              <span className="hidden sm:inline">{post.location}</span>
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                                post.isAiInsight
                                  ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                  : 'bg-white/5 border-white/10 text-gray-300'
                              }`}
                            >
                              {post.roleBadge}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono shrink-0">
                            {formatTime(post.timestamp)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              post.isAiInsight
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : post.type === 'strategy'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : post.type === 'tactic'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            }`}
                          >
                            {post.isAiInsight ? 'GEMINI AI' : post.type}: {post.tag || 'General'}
                          </span>
                        </div>

                        <p
                          className={`text-xs leading-relaxed font-sans select-text whitespace-pre-wrap p-2.5 rounded-xl border ${
                            post.isAiInsight
                              ? 'bg-purple-950/25 border-purple-500/30 text-purple-100'
                              : 'bg-[#111623] border-[#1e273c] text-gray-200'
                          }`}
                        >
                          {post.text}
                        </p>

                        {/* Replies */}
                        {post.replies && post.replies.length > 0 && (
                          <div className="pl-3 border-l-2 border-emerald-500/30 space-y-1.5 pt-1">
                            {post.replies.map((rep) => (
                              <div
                                key={rep.id}
                                className={`p-2 rounded-lg text-[11px] ${
                                  rep.isAi
                                    ? 'bg-purple-950/30 border border-purple-500/30 text-purple-200'
                                    : 'bg-[#0d121d] border border-[#1d263b] text-gray-300'
                                }`}
                              >
                                <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                                  <span className="font-bold text-white">
                                    {rep.flag || '🌐'} {rep.author}
                                  </span>
                                  <span className="text-gray-500">{formatTime(rep.timestamp)}</span>
                                </div>
                                <p className="whitespace-pre-wrap leading-relaxed">{rep.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                                post.hasLiked
                                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                                  : 'hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{post.likes}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setReplyingToId(replyingToId === post.id ? null : post.id)
                              }
                              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Reply ({post.replies?.length || 0})</span>
                            </button>

                            <button
                              type="button"
                              disabled={aiLoadingId === post.id}
                              onClick={() => handleRequestAiInsight(post)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-colors cursor-pointer disabled:opacity-50"
                              title="Ask real Google Gemini AI to analyze and reply to this post"
                            >
                              {aiLoadingId === post.id ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              <span>AI Analyze</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShare(post.id, post.text)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                              title="Copy quote"
                            >
                              {copiedId === post.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Share2 className="w-3 h-3" />
                              )}
                            </button>
                          </div>

                          <span className="text-[10px] text-gray-500 font-mono">WS Live</span>
                        </div>

                        {replyingToId === post.id && (
                          <div className="pt-1.5 flex items-center gap-1.5">
                            <input
                              type="text"
                              value={replyInput[post.id] || ''}
                              onChange={(e) =>
                                setReplyInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                              }
                              placeholder="Write a real-time reply..."
                              className="flex-1 bg-[#121724] border border-[#232c40] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendReply(post.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#070b12] text-xs font-bold cursor-pointer"
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Composer Form */}
                <form
                  onSubmit={handlePublish}
                  className="p-3 bg-[#080b12] border-t border-emerald-500/30 flex flex-col gap-2 shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-[#121724] px-2 py-1 rounded-lg border border-[#232c40] text-[11px] flex-1">
                      <span className="text-gray-500 shrink-0">Handle:</span>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Your Nickname"
                        className="bg-transparent text-white focus:outline-none w-full text-[11px]"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-[#121724] px-2 py-1 rounded-lg border border-[#232c40] text-[11px]">
                      <select
                        value={postType}
                        onChange={(e) => setPostType(e.target.value as any)}
                        className="bg-transparent text-emerald-300 focus:outline-none cursor-pointer font-bold uppercase text-[10px]"
                      >
                        <option value="strategy" className="bg-[#121724] text-amber-300">
                          Strategy
                        </option>
                        <option value="tactic" className="bg-[#121724] text-cyan-300">
                          Tactic
                        </option>
                        <option value="thought" className="bg-[#121724] text-purple-300">
                          Thought
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      rows={2}
                      value={messageInput}
                      onChange={(e) => handleMessageInputChange(e.target.value)}
                      placeholder={`Publish a real ${postType} to connected users worldwide...`}
                      className="w-full bg-[#121724] border border-[#232c40] rounded-xl px-3 py-2 pr-20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="absolute right-2 bottom-2 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-[#070b12] text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-md"
                    >
                      <Send className="w-3 h-3" />
                      <span>Post</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
