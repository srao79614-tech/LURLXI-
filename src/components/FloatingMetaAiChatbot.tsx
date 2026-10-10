import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CategoryType, ChatMessage } from '../types';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import {
  logAiDoubtClarifiedHistory,
  getAccountScopedKey,
  getActiveSessionEmail,
  getUserPerformance,
  buildAccountActivityContextForChatbot,
  scheduleVaultSync,
} from '../utils/userStorage';
import { getActivityHistory, logActivity } from '../utils/activityHistory';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Minus,
  Maximize2,
  ChevronDown,
  TrendingUp,
  Bot,
  ShoppingBag,
  Rocket,
  ShieldCheck,
  Compass,
  ExternalLink,
  RefreshCw,
  Database,
  Zap,
} from 'lucide-react';

interface FloatingMetaAiChatbotProps {
  currentCategory: CategoryType;
  onSelectCategory?: (category: CategoryType) => void;
}

export const FloatingMetaAiChatbot: React.FC<FloatingMetaAiChatbotProps> = ({
  currentCategory,
  onSelectCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [category, setCategory] = useState<CategoryType>(currentCategory);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoVoice, setAutoVoice] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [activeModel, setActiveModel] = useState('gemini-3-flash-preview');
  const [modelMode, setModelMode] = useState<'fast' | 'pro'>('fast');
  const [hasKey, setHasKey] = useState(true);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const [activeEmail, setActiveEmail] = useState<string>(() => getActiveSessionEmail());
  const [syncedActivityCount, setSyncedActivityCount] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const refreshSyncedCount = (emailInput?: string) => {
    const targetEmail = emailInput || getActiveSessionEmail();
    const perf = getUserPerformance(targetEmail);
    const acts = getActivityHistory(targetEmail);
    setSyncedActivityCount((perf.history?.length || 0) + acts.length);
  };

  useEffect(() => {
    setCategory(currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    refreshSyncedCount(activeEmail);
  }, [activeEmail]);

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setHasKey(Boolean(data.hasGeminiKey));
          if (data.model) setActiveModel(data.model);
        }
      })
      .catch(() => {});
  }, []);

  const getCategoryWelcome = (cat: CategoryType): ChatMessage => ({
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    content: `Hello! I am your **LURL Live Gemini AI Advisor** for **${cat.toUpperCase()}**.
Every reply is generated in real time by Google Gemini (\`${activeModel}\`) and is **100% integrated with all your saved account activities** (${activeEmail}).

🎙️ **Voice Enabled**: Tap the mic to speak.
🔊 **Read Aloud**: Auto-voice is ${autoVoice ? 'Enabled' : 'Off'}.`,
    timestamp: Date.now(),
    category: cat,
    modelUsed: activeModel,
    suggestedPrompts:
      cat === 'trading'
        ? [
            'Analyze my saved learning history & trading performance',
            'How do I identify institutional liquidity sweeps?',
            'Calculate optimal Kelly position sizing',
          ]
        : cat === 'dropshipping'
        ? [
            'Review my saved activities and recommend my next step',
            'What is the 3-second viral video hook formula?',
            'How do I negotiate 48-hour private ERP shipping?',
          ]
        : cat === 'ecommerce'
        ? [
            'Summarize what I have learnt so far in my account',
            'How do I lift Contribution Margin 2 past 26%?',
            'What automated Klaviyo flows generate 40% of revenue?',
          ]
        : cat === 'skill-development'
        ? [
            'Review my mastered skills and suggest the next skill to learn',
            'How does targeted deliberate struggle stimulate myelination?',
            'What are the 3 best skills to stack for top 0.1% leverage?',
          ]
        : [
            'Analyze my progress and recommend my next startup milestone',
            'How do I build a defensible AI software moat?',
            'What metrics do VCs look for in Seed rounds?',
          ],
  });

  const loadAccountMessages = (cat: CategoryType, emailInput?: string): ChatMessage[] => {
    const email = emailInput || getActiveSessionEmail();
    try {
      const scopedKey = getAccountScopedKey(`lurl_ai_chat_messages_${cat}`, email);
      const legacyKey = getAccountScopedKey(`lurl_chat_messages_${cat}`, email);
      const saved = localStorage.getItem(scopedKey) || localStorage.getItem(legacyKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [getCategoryWelcome(cat)];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadAccountMessages(currentCategory, getActiveSessionEmail())
  );

  // Reload messages when category or active account changes
  useEffect(() => {
    const currentEmail = getActiveSessionEmail();
    setActiveEmail(currentEmail);
    setMessages(loadAccountMessages(category, currentEmail));
    refreshSyncedCount(currentEmail);
  }, [category]);

  // Listen for account switch, vault restore, or chat updates from main AiChatbot
  useEffect(() => {
    const syncAll = () => {
      const currentEmail = getActiveSessionEmail();
      setActiveEmail(currentEmail);
      setMessages(loadAccountMessages(category, currentEmail));
      refreshSyncedCount(currentEmail);
    };
    window.addEventListener('lurl-vault-restored', syncAll);
    window.addEventListener('lurl-account-changed', syncAll);
    window.addEventListener('lurl-chat-updated', syncAll);
    window.addEventListener('lurl-performance-updated', () => refreshSyncedCount());
    window.addEventListener('lurl-activity-updated', () => refreshSyncedCount());
    return () => {
      window.removeEventListener('lurl-vault-restored', syncAll);
      window.removeEventListener('lurl-account-changed', syncAll);
      window.removeEventListener('lurl-chat-updated', syncAll);
      window.removeEventListener('lurl-performance-updated', () => refreshSyncedCount());
      window.removeEventListener('lurl-activity-updated', () => refreshSyncedCount());
    };
  }, [category]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setInputMessage('Speech recognition requires Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      playClickSound();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Mic start error:', err);
        setIsListening(false);
      }
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`~[\]]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const persistMessagesForAccount = (updated: ChatMessage[], cat: CategoryType, emailInput?: string) => {
    const email = emailInput || getActiveSessionEmail();
    try {
      const scopedKey = getAccountScopedKey(`lurl_ai_chat_messages_${cat}`, email);
      localStorage.setItem(scopedKey, JSON.stringify(updated.slice(-60)));
      scheduleVaultSync(email);
      window.dispatchEvent(new CustomEvent('lurl-chat-updated', { detail: { category: cat, email } }));
    } catch {}
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    playClickSound();
    setInputMessage('');
    setLastFailedQuery(null);

    const currentEmail = getActiveSessionEmail();
    setActiveEmail(currentEmail);

    const historyForApi = messages
      .filter((m) => !m.isError)
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: Date.now(),
      category,
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    persistMessagesForAccount(nextMessages, category, currentEmail);
    setIsLoading(true);

    try {
      const activitySummary = buildAccountActivityContextForChatbot(currentEmail);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: query,
          conversationHistory: historyForApi,
          email: currentEmail,
          activitySummary,
          modelMode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.reply) {
        throw new Error(data.error || `Gemini API returned HTTP ${response.status}`);
      }

      const reply = data.reply;
      logAiDoubtClarifiedHistory(category, query, reply, currentEmail);
      logActivity(
        category,
        `AI Advisor: ${query.slice(0, 55)}${query.length > 55 ? '...' : ''}`,
        reply.replace(/[#*_`>-]/g, '').slice(0, 180),
        { modelUsed: data.modelUsed || activeModel, source: 'floating-chatbot' },
        currentEmail
      );
      refreshSyncedCount(currentEmail);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        category,
        modelUsed: data.modelUsed || activeModel,
        latencyMs: data.latencyMs,
        groundingSources: Array.isArray(data.groundingSources) ? data.groundingSources : [],
      };

      const completedMessages = [...nextMessages, assistantMsg];
      setMessages(completedMessages);
      persistMessagesForAccount(completedMessages, category, currentEmail);
      playSuccessChime();

      if (autoVoice) {
        speakText(reply);
      }
    } catch (err: any) {
      setLastFailedQuery(query);
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Real Gemini API Error**: ${
          err?.message || 'Unable to reach server Gemini endpoint.'
        }\n\nNo fake or simulated response was generated. Please verify \`GEMINI_API_KEY\` in **Settings > Secrets** or click Retry below.`,
        timestamp: Date.now(),
        category,
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySwitch = (cat: CategoryType) => {
    playClickSound();
    setCategory(cat);
    setShowCategoryMenu(false);
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    const currentEmail = getActiveSessionEmail();
    setMessages(loadAccountMessages(cat, currentEmail));
  };

  const handleResetChat = () => {
    playClickSound();
    const currentEmail = getActiveSessionEmail();
    const fresh = [getCategoryWelcome(category)];
    setMessages(fresh);
    persistMessagesForAccount(fresh, category, currentEmail);
  };

  const categoryIcons: Record<CategoryType, React.ReactNode> = {
    trading: <TrendingUp className="w-3.5 h-3.5 text-[#f8b179]" />,
    dropshipping: <Bot className="w-3.5 h-3.5 text-[#f8b179]" />,
    ecommerce: <ShoppingBag className="w-3.5 h-3.5 text-[#f8b179]" />,
    startup: <Rocket className="w-3.5 h-3.5 text-[#f8b179]" />,
    'skill-development': <Compass className="w-3.5 h-3.5 text-[#f8b179]" />,
  };

  return (
    <>
      {/* 1. Floating Gemini AI Icon */}
      <div className="fixed bottom-20 right-6 z-50 flex items-center justify-end pointer-events-auto">
        {!isOpen && (
          <motion.button
            id="floating-meta-ai-btn"
            type="button"
            onClick={() => {
              playClickSound();
              setIsOpen(true);
              setIsMinimized(false);
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="group relative flex items-center gap-2.5 p-1 cursor-pointer focus:outline-none"
            aria-label="Open Gemini AI Assistant"
            title="Chat with Real-Time LURL Gemini AI"
          >
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#0084ff] via-[#a855f7] to-[#06b6d4] opacity-75 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />

            <div className="relative w-14 h-14 rounded-full bg-[#0d111c] border-2 border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0084ff]/30 via-[#ec4899]/30 to-[#06b6d4]/40 animate-spin-slow opacity-90" />
              <div className="relative z-10 flex flex-col items-center justify-center">
                <Sparkles className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              </div>
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0d111c]" />
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#121624]/95 text-white font-medium text-xs border border-white/10 shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Ask Gemini AI</span>
            </span>
          </motion.button>
        )}
      </div>

      {/* 2. Floating Chat Window Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-meta-ai-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : undefined,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[calc(100vh-5rem)] rounded-2xl bg-[#0c101a]/95 border border-[#263148] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-white"
          >
            {/* Header */}
            <div className="relative px-4 py-3 bg-gradient-to-r from-[#141b2d] via-[#111726] to-[#141b2d] border-b border-[#232c42] flex items-center justify-between select-none">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-[#0084ff] via-[#ec4899] to-[#06b6d4] flex items-center justify-center shadow-lg">
                  <div className="w-full h-full rounded-full bg-[#0a0d14] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0a0d14]" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs tracking-wide text-white">
                      LURL Gemini AI
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30 font-mono">
                      {activeModel}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {hasKey ? 'Real Server API Key Active' : 'GEMINI_API_KEY Required'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setAutoVoice(!autoVoice);
                  }}
                  className={`p-1.5 rounded hover:bg-white/10 transition-colors cursor-pointer ${
                    autoVoice ? 'text-emerald-400' : 'text-[#9ca3af]'
                  }`}
                  title={autoVoice ? 'Auto-Voice Speech is ON' : 'Turn Auto-Voice Speech ON'}
                >
                  {autoVoice ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={handleResetChat}
                  className="p-1.5 rounded text-[#9ca3af] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-1.5 rounded text-[#9ca3af] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setIsOpen(false);
                    if (window.speechSynthesis) window.speechSynthesis.cancel();
                  }}
                  className="p-1.5 rounded text-[#9ca3af] hover:text-red-400 hover:bg-white/10 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <div className="px-3 py-1.5 bg-[#0e1320] border-b border-[#1f2638] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9ca3af] text-[10px] uppercase">Focus:</span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                      className="px-2 py-0.5 rounded bg-[#182032] hover:bg-[#202b44] text-white border border-[#2b3854] flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      {categoryIcons[category]}
                      <span className="capitalize font-medium">{category}</span>
                      <ChevronDown className="w-3 h-3 text-[#9ca3af]" />
                    </button>

                    {showCategoryMenu && (
                      <div className="absolute top-full left-0 mt-1 w-48 rounded-lg bg-[#141b2a] border border-[#2b3854] shadow-2xl z-30 py-1 overflow-hidden">
                        {(
                          ['trading', 'dropshipping', 'ecommerce', 'startup', 'skill-development'] as CategoryType[]
                        ).map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategorySwitch(cat)}
                            className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs hover:bg-[#1f2a42] cursor-pointer ${
                              category === cat
                                ? 'text-[#f8b179] font-bold bg-[#1a2337]'
                                : 'text-[#cbd5e1]'
                            }`}
                          >
                            {categoryIcons[cat]}
                            <span className="capitalize">
                              {cat === 'skill-development' ? 'Skill Dev' : cat}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setModelMode(modelMode === 'fast' ? 'pro' : 'fast');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
                      modelMode === 'fast'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    }`}
                    title="Switch between Fast Flash-Lite and Deep Reasoning Flash"
                  >
                    <Zap className="w-2.5 h-2.5" />
                    <span>{modelMode === 'fast' ? 'Fast' : 'Pro'}</span>
                  </button>

                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono" title="All account activities synced to AI">
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>{syncedActivityCount} Synced</span>
                  </span>
                </div>
              </div>
            )}

            {!isMinimized && (
              <>
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 max-h-[380px] min-h-[260px] text-xs font-sans">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[#d47a37] to-[#b35e22] text-white rounded-br-xs shadow-md'
                            : msg.isError
                            ? 'bg-red-950/40 text-red-200 border border-red-500/40 rounded-bl-xs shadow-md'
                            : 'bg-[#151b2a] text-[#e2e8f0] border border-[#232c42] rounded-bl-xs shadow-md'
                        }`}
                      >
                        {msg.role === 'assistant' && (msg.modelUsed || msg.latencyMs) && (
                          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/10 text-[10px] font-mono text-cyan-300">
                            <span>{msg.modelUsed || activeModel}</span>
                            {typeof msg.latencyMs === 'number' && msg.latencyMs > 0 && (
                              <span className="text-emerald-400">
                                {(msg.latencyMs / 1000).toFixed(2)}s
                              </span>
                            )}
                          </div>
                        )}

                        {msg.content}

                        {msg.groundingSources && msg.groundingSources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                            {msg.groundingSources.slice(0, 3).map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/40 text-[10px] text-cyan-300 border border-cyan-500/30 hover:bg-black/60"
                              >
                                <span className="truncate max-w-[140px]">{src.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            ))}
                          </div>
                        )}

                        {msg.isError && lastFailedQuery && (
                          <button
                            type="button"
                            onClick={() => handleSendMessage(lastFailedQuery)}
                            className="mt-2 px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>

                      <div className="text-[9px] text-[#6b7280] font-mono mt-1 px-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      {msg.suggestedPrompts && (
                        <div className="w-full mt-2.5 space-y-1.5">
                          <div className="text-[10px] text-[#9ca3af] font-mono">
                            Suggested Live Queries:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.suggestedPrompts.map((prompt, i) => (
                              <button
                                key={i}
                                type="button"
                                disabled={isLoading}
                                onClick={() => handleSendMessage(prompt)}
                                className="text-left text-[11px] px-2.5 py-1 rounded-full bg-[#182032] hover:bg-[#202b44] text-[#cbd5e1] hover:text-white border border-[#2b3854] cursor-pointer transition-colors disabled:opacity-50"
                              >
                                {prompt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 p-3 bg-[#151b2a] border border-[#232c42] rounded-2xl rounded-bl-xs w-44 text-[#cbd5e1] text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                      <span className="font-mono text-[10px] text-cyan-300 ml-1">
                        Gemini Thinking...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Footer */}
                <div className="p-2.5 bg-[#0e1320] border-t border-[#1f2638]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        isListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[#182032] hover:bg-[#232e48] text-[#9ca3af] hover:text-white border border-[#2a3754]'
                      }`}
                      title={isListening ? 'Listening... click to stop' : 'Click to speak'}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={
                        isListening
                          ? 'Listening to voice...'
                          : `Ask live Gemini AI about ${category}...`
                      }
                      className="flex-1 bg-[#131928] border border-[#25314a] focus:border-cyan-500 text-white placeholder-[#6b7280] text-xs px-3 py-2 rounded-xl focus:outline-none"
                    />

                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        inputMessage.trim() && !isLoading
                          ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white shadow-lg hover:brightness-110'
                          : 'bg-[#182032] text-[#4b5563] cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
