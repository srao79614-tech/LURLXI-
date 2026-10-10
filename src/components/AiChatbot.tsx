import React, { useState, useRef, useEffect } from 'react';
import { CategoryType, ChatMessage } from '../types';
import {
  logAiDoubtClarifiedHistory,
  scheduleVaultSync,
  getAccountScopedKey,
  getActiveSessionEmail,
  getUserPerformance,
  buildAccountActivityContextForChatbot,
} from '../utils/userStorage';
import { getActivityHistory, logActivity } from '../utils/activityHistory';
import {
  Bot,
  Send,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Link2,
  Headphones,
  Globe,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Activity,
} from 'lucide-react';

interface AiChatbotProps {
  category: CategoryType;
  userEmail?: string;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  resetKey?: number;
}

interface ServerAiStatus {
  hasGeminiKey: boolean;
  model: string;
  status: string;
  message: string;
}

export const AiChatbot: React.FC<AiChatbotProps> = ({
  category,
  userEmail,
  initialQuery = '',
  onClearInitialQuery,
  resetKey = 0,
}) => {
  const activeEmail = (userEmail || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
  const [modelMode, setModelMode] = useState<'auto' | 'fast'>('auto');
  const [savedActivitiesCount, setSavedActivitiesCount] = useState<number>(() => {
    try {
      const perf = getUserPerformance(activeEmail);
      const acts = getActivityHistory(activeEmail);
      return (perf.history?.length || 0) + (acts?.length || 0);
    } catch {
      return 0;
    }
  });

  const getWelcomeMessage = (cat: CategoryType): ChatMessage => ({
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    content: `Welcome to the **LURL Real-Time Google Gemini AI Advisor** for **${cat.toUpperCase()}**.
Every response is generated live on the server using the official \`@google/genai\` SDK and Google Search grounding — **100% real, with zero simulated or canned responses**.

🎙️ **Voice Chat Activated**: Click the **Microphone** icon to speak your question aloud or enable **Voice ON** to hear responses spoken aloud.
🌐 **Live Grounded Intelligence**: Ask any question about ${cat}, quantitative formulas, market structure, coding, or strategy.`,
    timestamp: Date.now(),
    category: cat,
    modelUsed: 'gemini-3.8-flash',
    suggestedPrompts: [
      cat === 'trading'
        ? 'How do I identify institutional liquidity sweeps before London open?'
        : cat === 'dropshipping'
        ? 'What exact hook structure generates >35% 3-second hold rate on TikTok?'
        : cat === 'ecommerce'
        ? 'How do I lift my Contribution Margin 2 (CM2) from 14% to 28%?'
        : cat === 'skill-development'
        ? 'How do I structure a 45-minute deliberate practice session for maximum myelination?'
        : 'How do I build a defensible AI software moat against generic LLM wrappers?',
      cat === 'trading'
        ? 'Calculate Kelly criterion position sizing for a 45% win rate and 1:3 R:R'
        : cat === 'dropshipping'
        ? 'What are the strict criteria to negotiate 48-hour SLAs with private ERP agents?'
        : cat === 'ecommerce'
        ? 'Design a 4-step post-purchase Klaviyo flow with high retention conversion'
        : cat === 'skill-development'
        ? 'What are the top 3 asymmetric skills to stack with software engineering for top 0.1% leverage?'
        : 'What are the benchmarks to raise a $3M seed round at a $20M valuation cap?',
    ],
  });

  const getStoredChatMessages = (cat: CategoryType, emailOverride?: string): ChatMessage[] => {
    const targetEmail = (emailOverride || activeEmail).trim().toLowerCase();
    try {
      const scopedKey = getAccountScopedKey(`lurl_ai_chat_messages_${cat}`, targetEmail);
      const raw = localStorage.getItem(scopedKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [getWelcomeMessage(cat)];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => getStoredChatMessages(category, activeEmail));
  const [aiStatus, setAiStatus] = useState<ServerAiStatus>({
    hasGeminiKey: true,
    model: 'gemini-3.8-flash',
    status: 'Verifying Server Gemini API...',
    message: '',
  });

  const refreshSavedCount = (emailOverride?: string) => {
    try {
      const target = (emailOverride || activeEmail).trim().toLowerCase();
      const perf = getUserPerformance(target);
      const acts = getActivityHistory(target);
      setSavedActivitiesCount((perf.history?.length || 0) + (acts?.length || 0));
    } catch {}
  };

  useEffect(() => {
    const scopedKey = getAccountScopedKey(`lurl_ai_chat_messages_${category}`, activeEmail);
    if (resetKey > 0) {
      const fresh = [getWelcomeMessage(category)];
      setMessages(fresh);
      try {
        localStorage.setItem(scopedKey, JSON.stringify(fresh));
        scheduleVaultSync(activeEmail);
      } catch {}
    } else {
      setMessages(getStoredChatMessages(category, activeEmail));
    }
    refreshSavedCount(activeEmail);
  }, [resetKey, category, activeEmail]);

  useEffect(() => {
    try {
      if (messages && messages.length > 0) {
        const scopedKey = getAccountScopedKey(`lurl_ai_chat_messages_${category}`, activeEmail);
        localStorage.setItem(scopedKey, JSON.stringify(messages.slice(-60)));
        if (messages.length > 1) {
          scheduleVaultSync(activeEmail);
        }
      }
    } catch {}
  }, [messages, category, activeEmail]);

  useEffect(() => {
    const handleVaultOrAccountSync = () => {
      const currentEmail = (userEmail || getActiveSessionEmail() || 'guest@lurl.app').trim().toLowerCase();
      setMessages(getStoredChatMessages(category, currentEmail));
      refreshSavedCount(currentEmail);
    };
    window.addEventListener('lurl-vault-restored', handleVaultOrAccountSync);
    window.addEventListener('lurl-account-changed', handleVaultOrAccountSync);
    window.addEventListener('lurl-chat-updated', handleVaultOrAccountSync);
    window.addEventListener('lurl-activity-updated', handleVaultOrAccountSync);
    window.addEventListener('lurl-performance-updated', handleVaultOrAccountSync);
    return () => {
      window.removeEventListener('lurl-vault-restored', handleVaultOrAccountSync);
      window.removeEventListener('lurl-account-changed', handleVaultOrAccountSync);
      window.removeEventListener('lurl-chat-updated', handleVaultOrAccountSync);
      window.removeEventListener('lurl-activity-updated', handleVaultOrAccountSync);
      window.removeEventListener('lurl-performance-updated', handleVaultOrAccountSync);
    };
  }, [category, activeEmail, userEmail]);

  useEffect(() => {
    let active = true;
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((data) => {
        if (active && data) {
          setAiStatus({
            hasGeminiKey: Boolean(data.hasGeminiKey),
            model: data.model || 'gemini-3.8-flash',
            status: data.status || 'Connected & Active',
            message: data.message || '',
          });
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  // Voice Chat (Speech Recognition & Speech Synthesis) State
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const directDownloadUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://lurl.online';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isListening]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setSpeechTranscript(currentTranscript);
          setInputQuery(currentTranscript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech Recognition Error:', event.error);
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech Recognition init failed:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle external query trigger (e.g. from Codex)
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  // Voice Speech Synthesis Handler
  const speakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    setSpeakingMessageId(msgId);
    setIsSpeechPaused(false);

    const cleanSpeech = text
      .replace(/[*#`_]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/https?:\/\/\S+/g, 'link provided')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.name.includes('Google') ||
        v.name.includes('Natural') ||
        v.name.includes('Daniel') ||
        v.name.includes('Samantha') ||
        v.lang.startsWith('en')
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
      setIsSpeechPaused(false);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
      setIsSpeechPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePauseResumeSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsSpeechPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsSpeechPaused(true);
      }
    }
  };

  const stopSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setIsSpeechPaused(false);
  };

  const toggleMicListening = () => {
    if (!recognitionRef.current) {
      setInputQuery('Voice input requires Chrome, Edge, or Safari.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current?.start(), 150);
      }
    }
  };

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(directDownloadUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInputQuery('');
    setSpeechTranscript('');
    setLastFailedQuery(null);

    const userMsgId = `user-${Date.now()}`;
    const historyForApi = messages
      .filter((m) => !m.isError)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: 'user',
        content: query,
        timestamp: Date.now(),
        category,
      },
    ]);
    setIsLoading(true);

    const isDiagnostic =
      query.length < 40 ||
      query.toLowerCase().includes('how') ||
      query.toLowerCase().includes('should') ||
      query.toLowerCase().includes('why');

    try {
      const activitySummary = buildAccountActivityContextForChatbot(activeEmail);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message: query,
          diagnosticMode: isDiagnostic,
          conversationHistory: historyForApi,
          email: activeEmail,
          activitySummary,
          modelMode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success || !data.reply) {
        throw new Error(data.error || `Gemini API error (HTTP ${response.status})`);
      }

      const replyContent = data.reply;
      logAiDoubtClarifiedHistory(category, query, replyContent, activeEmail);
      logActivity(
        category as any,
        `AI Chatbot (${category.toUpperCase()}): "${query.slice(0, 55)}"`,
        `Clarified via ${data.modelUsed || aiStatus.model || 'gemini-3.8-flash'} & saved to account vault.`,
        { modelUsed: data.modelUsed },
        activeEmail
      );

      const asstMsgId = `asst-${Date.now()}`;
      setMessages((prev) => {
        const updated: ChatMessage[] = [
          ...prev,
          {
            id: asstMsgId,
            role: 'assistant',
            content: replyContent,
            timestamp: Date.now(),
            category,
            modelUsed: data.modelUsed || aiStatus.model || 'gemini-3.8-flash',
            latencyMs: data.latencyMs,
            groundingSources: Array.isArray(data.groundingSources) ? data.groundingSources : [],
          },
        ];
        try {
          const scopedKey = getAccountScopedKey(`lurl_ai_chat_messages_${category}`, activeEmail);
          localStorage.setItem(scopedKey, JSON.stringify(updated.slice(-60)));
          scheduleVaultSync(activeEmail);
        } catch {}
        return updated;
      });
      refreshSavedCount(activeEmail);
      window.dispatchEvent(new CustomEvent('lurl-chat-updated', { detail: { category, email: activeEmail } }));

      if (autoSpeak) {
        speakText(replyContent, asstMsgId);
      }
    } catch (err: any) {
      setLastFailedQuery(query);
      const errMsgId = `asst-err-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: errMsgId,
          role: 'assistant',
          content: `### ⚠️ Real-Time Gemini API Error\n\n${
            err?.message || 'Unable to reach the server-side Gemini API.'
          }\n\n*No simulated or fake fallback response was generated. Please verify that \`GEMINI_API_KEY\` is configured in **Settings > Secrets** or click **Retry Request** below.*`,
          timestamp: Date.now(),
          category,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-chatbot-section" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-[#252c3d] gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d47a37]/15 text-[#f8b179] border border-[#d47a37]/30 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#f8b179]" /> Real Google Gemini SDK
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Headphones className="w-3 h-3" /> Voice Chat Active
            </span>
            <span className="text-xs text-[#34d399] flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#34d399] animate-ping" />
              Model: {aiStatus.model} (Zero Simulation)
            </span>
          </div>
          <h2 className="font-['Cinzel'] text-2xl sm:text-3xl font-bold tracking-wide text-white">
            LURL Real-Time Gemini AI Core & Voice Advisor
          </h2>
          <p className="text-sm text-[#9ca3af] mt-1 max-w-2xl">
            Powered directly by server-side <code className="text-[#f8b179]">GEMINI_API_KEY</code> and live Google Search grounding for {category.toUpperCase()}. Every response is 100% real LLM inference.
          </p>
        </div>

        {/* Action Controls: Voice Auto-Speak & Live Online Status */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyDirectLink}
            title="Copy Official Live Website URL"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border border-[#252c3d] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>{linkCopied ? 'Copied Live URL!' : 'Copy Official URL'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              autoSpeak
                ? 'bg-[#d47a37]/20 border-[#d47a37] text-[#f8b179]'
                : 'bg-[#141824] border-[#252c3d] text-gray-400'
            }`}
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-[#f8b179]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Voice: {autoSpeak ? 'ON' : 'OFF'}</span>
          </button>

          <div
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141824] border flex items-center gap-1.5 shadow-sm ${
              aiStatus.hasGeminiKey
                ? 'text-emerald-400 border-emerald-500/40'
                : 'text-amber-400 border-amber-500/40'
            }`}
          >
            {aiStatus.hasGeminiKey ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>
              Server API Key:{' '}
              <span className="font-mono font-bold">
                {aiStatus.hasGeminiKey ? 'ACTIVE' : 'MISSING'}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Account Activity Integration & Model Speed Bar */}
      <div className="mb-3 p-3 rounded-2xl bg-[#0c111d] border border-[#d47a37]/30 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Account Vault Synced: {activeEmail}</span>
          </span>
          <span className="text-[#9ca3af] font-mono text-[11px]">
            • <strong className="text-[#f8b179]">{savedActivitiesCount}</strong> Saved Activities & Chat Threads Linked
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#090b10] border border-[#252c3d]">
            <button
              type="button"
              onClick={() => setModelMode('auto')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                modelMode === 'auto'
                  ? 'bg-[#d47a37] text-white'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
              title="Grounded Gemini Flash Intelligence"
            >
              Grounded Flash
            </button>
            <button
              type="button"
              onClick={() => setModelMode('fast')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                modelMode === 'fast'
                  ? 'bg-emerald-600 text-white'
                  : 'text-[#9ca3af] hover:text-white'
              }`}
              title="Ultra-Fast Gemini 3.1 Flash-Lite"
            >
              ⚡ Fast Lite
            </button>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              handleSendMessage(
                `Analyze all my saved activities, course mastery, demo trading performance, and learning history for my account (${activeEmail}) and give me my personalized next 3 execution steps in ${category.toUpperCase()}.`
              )
            }
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Analyze My Saved Activities</span>
          </button>
        </div>
      </div>

      {/* Quick Strategic Prompts Bar */}
      <div className="mb-4 p-3 rounded-2xl bg-[#101420] border border-[#252c3d] flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-mono font-bold text-[#f8b179] uppercase tracking-wider px-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Live Gemini {category.toUpperCase()} Prompts:
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            {
              label: '🏛️ Category Solution & Stack',
              prompt: `Give me the complete ${category} Category Solution Architecture, Problem Diagnosis, and 4-Layer System Stack.`,
            },
            {
              label: '♟️ Master Strategy & Phases',
              prompt: `Explain the complete ${category} Master Strategy, Strategic Doctrine, 4 Phases, and Risk Rules.`,
            },
            {
              label: '⚡ All 5 Tactical SOPs',
              prompt: `Show me the complete ${category} Tactical Playbook and all 5 step-by-step execution tactics.`,
            },
            {
              label: '🎓 30-Day Mastery Roadmap',
              prompt: `How to learn and master ${category} from scratch: give me the 30-day study roadmap, daily schedule, and checklist.`,
            },
          ].map((btn, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(btn.prompt)}
              className="px-3 py-1.5 rounded-xl bg-[#161c2c] hover:bg-[#d47a37] text-xs font-bold text-[#cbd5e1] hover:text-white border border-[#2a354d] transition-colors cursor-pointer disabled:opacity-50"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-2xl bg-[#0e1118] border border-[#252c3d] shadow-2xl overflow-hidden flex flex-col h-[650px] relative">
        {/* Chat Stream Header */}
        <div className="p-4 bg-[#121622] border-b border-[#1f2638] flex flex-wrap items-center justify-between gap-3 text-xs text-[#9ca3af]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#d47a37]" />
            <span className="font-semibold text-white">
              Domain: {category.toUpperCase()} • Real-Time Gemini Inference
            </span>
          </div>

          {speakingMessageId && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[11px]">
              <div className="flex items-center gap-1 h-3">
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3" />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2.5" />
              </div>
              <span>Speaking Response Aloud...</span>
              <button
                type="button"
                onClick={togglePauseResumeSpeech}
                className="hover:text-white px-1 font-bold cursor-pointer"
              >
                {isSpeechPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                onClick={stopSpeech}
                className="hover:text-red-400 font-bold px-1 cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            @google/genai • Google Search Grounding
          </span>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md mt-1 ${
                    msg.isError
                      ? 'bg-red-600'
                      : 'bg-gradient-to-br from-[#d47a37] to-[#b85d19]'
                  }`}
                >
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed relative group ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white shadow-lg'
                    : msg.isError
                    ? 'bg-red-950/30 border border-red-500/40 text-red-200 shadow-md'
                    : 'bg-[#141824] border border-[#252c3d] text-[#e5e7eb] shadow-md'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#252c3d]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-[#f8b179] font-semibold">
                        {msg.isError ? 'Gemini API Diagnostic' : 'Live Gemini AI Response'}
                      </span>
                      {msg.modelUsed && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          {msg.modelUsed}
                        </span>
                      )}
                      {typeof msg.latencyMs === 'number' && msg.latencyMs > 0 && (
                        <span className="text-[10px] font-mono text-[#9ca3af]">
                          ⚡ {(msg.latencyMs / 1000).toFixed(2)}s
                        </span>
                      )}
                    </div>

                    {!msg.isError && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => speakText(msg.content, msg.id)}
                          title="Speak aloud with Executive Voice"
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#0e1118] hover:bg-[#1f2638] text-[#f8b179] border border-[#252c3d] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {speakingMessageId === msg.id && !isSpeechPaused ? (
                            <>
                              <VolumeX className="w-3 h-3 text-amber-400" /> Stop Audio
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 text-[#f8b179]" /> Listen Voice
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {msg.role === 'assistant' ? (
                  <div className="space-y-3 prose prose-invert max-w-none text-xs sm:text-sm">
                    {msg.content.split('\n\n').map((block, bIdx) => {
                      if (block.startsWith('### ')) {
                        return (
                          <h3
                            key={bIdx}
                            className="font-['Cinzel'] text-sm sm:text-base font-bold text-[#f8b179] tracking-wider pt-1 border-b border-[#252c3d] pb-1.5"
                          >
                            {block.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (block.startsWith('1. ') || block.startsWith('- ')) {
                        return (
                          <div key={bIdx} className="space-y-1.5 pl-2">
                            {block.split('\n').map((line, lIdx) => (
                              <p key={lIdx} className="leading-relaxed">
                                {line}
                              </p>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <p key={bIdx} className="leading-relaxed whitespace-pre-wrap">
                          {block}
                        </p>
                      );
                    })}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Real Google Search Grounding Citations */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#252c3d]/70">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-2">
                      <Globe className="w-3 h-3" /> Live Google Search Grounding Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingSources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0b0e16] hover:bg-[#1a2234] text-[11px] text-cyan-300 border border-cyan-500/30 transition-colors"
                        >
                          <span className="truncate max-w-[200px]">{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Retry button if real API call returned an error */}
                {msg.isError && lastFailedQuery && (
                  <div className="mt-3 pt-3 border-t border-red-500/30 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendMessage(lastFailedQuery)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Request with Gemini API</span>
                    </button>
                  </div>
                )}

                {/* Suggested Follow-up Prompts */}
                {msg.suggestedPrompts && (
                  <div className="mt-4 pt-3 border-t border-[#252c3d]/60 space-y-2">
                    <span className="text-[11px] font-mono text-[#9ca3af] block">
                      Recommended Strategic Queries:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestedPrompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-3 py-1.5 rounded-lg text-xs bg-[#0e1118] hover:bg-[#1a2030] text-[#f8b179] border border-[#d47a37]/30 transition-all text-left cursor-pointer disabled:opacity-50"
                        >
                          → {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-[10px] text-[#6b7280] text-right font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d47a37] to-[#b85d19] flex items-center justify-center text-white shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-2xl p-4 bg-[#141824] border border-[#252c3d] text-[#e5e7eb] flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[#d47a37] animate-spin" />
                <span className="text-xs text-[#9ca3af]">
                  Querying live Google Gemini API ({aiStatus.model}) with Google Search grounding...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live Microphone Recording Waveform HUD */}
        {isListening && (
          <div className="px-4 py-2 bg-gradient-to-r from-red-500/15 via-amber-500/15 to-red-500/15 border-t border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 h-4">
                <span className="w-1.5 h-3 bg-red-400 rounded-full animate-pulse" />
                <span className="w-1.5 h-5 bg-red-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-3.5 bg-red-400 rounded-full animate-pulse" />
                <span className="w-1.5 h-4 bg-red-400 rounded-full animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold text-white">Voice Listening Active:</span>
                <span className="text-xs text-red-200 ml-2 italic">
                  {speechTranscript || 'Speak your business question now...'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleMicListening}
              className="text-xs font-bold text-red-300 hover:text-white px-2.5 py-1 rounded-lg bg-red-900/40 border border-red-500/40 cursor-pointer"
            >
              Finish & Send
            </button>
          </div>
        )}

        {/* Query Input Area */}
        <div className="p-4 bg-[#121622] border-t border-[#1f2638]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              id="voice-mic-button"
              onClick={toggleMicListening}
              title={isListening ? 'Stop listening' : 'Start voice input (Speech-to-Text)'}
              className={`p-3 rounded-xl border flex items-center justify-center transition-all cursor-pointer shadow-md ${
                isListening
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-[#141824] hover:bg-[#1f2638] text-[#f8b179] border-[#d47a37]/40'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                id="chatbot-query-input"
                placeholder={
                  isListening
                    ? 'Listening to your voice...'
                    : `Ask live Google Gemini AI about ${category.toUpperCase()}...`
                }
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isLoading}
                className="w-full pl-4 pr-14 py-3 rounded-xl bg-[#090b10] border border-[#252c3d] focus:border-[#d47a37] focus:ring-2 focus:ring-[#d47a37]/30 text-white placeholder-[#4b5563] text-xs sm:text-sm outline-none transition-all disabled:opacity-50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#6b7280]">
                ENTER
              </span>
            </div>

            <button
              type="submit"
              id="chatbot-send-button"
              disabled={isLoading || !inputQuery.trim()}
              className="py-3 px-5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] active:scale-[0.98] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </form>

          <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-[#6b7280] gap-2">
            <span>
              Real Server-Side <code className="text-[#f8b179]">GEMINI_API_KEY</code> • Zero Simulated Responses
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {aiStatus.model} Connected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
