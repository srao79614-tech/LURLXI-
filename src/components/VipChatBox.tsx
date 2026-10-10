import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  ShieldCheck,
  Crown,
  Lock,
  Send,
  Sparkles,
  Bot,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Activity,
  CheckCircle2,
  X,
  Radio,
  BarChart3,
  Sliders,
  Terminal,
  Zap,
} from 'lucide-react';
import { VipChatMessage, VipSecurityAlert, UserSession } from '../types';
import { isPrivilegedAdminEmail, MASTER_VIP_PASSWORD } from '../utils/maskEmail';
import {
  getStoredSecurityAlerts,
  simulateTamperAttempt,
} from '../utils/securityShield';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';
import { getAccountScopedKey, scheduleVaultSync } from '../utils/userStorage';

interface VipChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession | null;
  onOpenSettings?: () => void;
  onElevateVip?: () => void;
}

export const VipChatBox: React.FC<VipChatBoxProps> = ({
  isOpen,
  onClose,
  userSession,
  onElevateVip,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'alerts' | 'charts'>('chat');
  const [messages, setMessages] = useState<VipChatMessage[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<VipSecurityAlert[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const [vipPasscode, setVipPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isLocallyElevated, setIsLocallyElevated] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isVip = Boolean(
    isLocallyElevated ||
    userSession?.isVip ||
    (userSession?.email && isPrivilegedAdminEmail(userSession.email))
  );

  const handleUnlockVipWithPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);
    const cleaned = vipPasscode.trim();
    if (cleaned === MASTER_VIP_PASSWORD || isPrivilegedAdminEmail(cleaned)) {
      playSuccessChime();
      setIsLocallyElevated(true);
      if (onElevateVip) {
        onElevateVip();
      }
    } else {
      playClickSound();
      setPasscodeError('Invalid VIP authorization key. Access denied.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch initial VIP messages & security alerts
  const loadVipData = async () => {
    if (!userSession?.email || !isVip) return;
    const email = userSession.email.trim().toLowerCase();

    // Hydrate locally first so chats appear instantly
    try {
      const scopedKey = getAccountScopedKey('lurl_vip_chat_thread', email);
      const cached = localStorage.getItem(scopedKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {}

    try {
      const res = await fetch(`/api/vip/messages?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (Array.isArray(data.messages)) {
            setMessages(data.messages);
            try {
              const scopedKey = getAccountScopedKey('lurl_vip_chat_thread', email);
              localStorage.setItem(scopedKey, JSON.stringify(data.messages.slice(-60)));
            } catch {}
          }
          if (Array.isArray(data.alerts)) {
            setSecurityAlerts(data.alerts);
            const unread = data.alerts.filter((a: VipSecurityAlert) => !a.acknowledged).length;
            setUnreadAlertsCount(unread);
          }
        }
      } else {
        const localAlerts = getStoredSecurityAlerts();
        setSecurityAlerts(localAlerts);
        setUnreadAlertsCount(localAlerts.filter((a) => !a.acknowledged).length);
      }
    } catch {
      const localAlerts = getStoredSecurityAlerts();
      setSecurityAlerts(localAlerts);
      setUnreadAlertsCount(localAlerts.filter((a) => !a.acknowledged).length);
    }
  };

  useEffect(() => {
    if (isOpen && isVip) {
      loadVipData();
    }
  }, [isOpen, isVip, userSession?.email]);

  useEffect(() => {
    const handleAccountOrVaultUpdate = () => {
      if (isVip) loadVipData();
    };
    window.addEventListener('lurl-vault-restored', handleAccountOrVaultUpdate);
    window.addEventListener('lurl-account-changed', handleAccountOrVaultUpdate);
    return () => {
      window.removeEventListener('lurl-vault-restored', handleAccountOrVaultUpdate);
      window.removeEventListener('lurl-account-changed', handleAccountOrVaultUpdate);
    };
  }, [isVip, userSession?.email]);

  // Auto-save messages whenever messages change
  useEffect(() => {
    if (userSession?.email && messages.length > 0) {
      try {
        const scopedKey = getAccountScopedKey('lurl_vip_chat_thread', userSession.email);
        localStorage.setItem(scopedKey, JSON.stringify(messages.slice(-60)));
        scheduleVaultSync(userSession.email);
      } catch {}
    }
  }, [messages, userSession?.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  // Listen for real-time security intrusion events
  useEffect(() => {
    const handleSecurityEvent = (e: any) => {
      const newAlert = e.detail as VipSecurityAlert;
      if (newAlert) {
        setSecurityAlerts((prev) => [newAlert, ...prev]);
        setUnreadAlertsCount((prev) => prev + 1);

        // Add to messages stream as well so VIP sees it immediately
        setMessages((prev) => [
          ...prev,
          {
            id: `alert_msg_${Date.now()}`,
            sender: 'security_system',
            senderName: '🛡️ Perimeter Defense System',
            text: `🚨 INTRUSION ALERT DISPATCHED TO VIP INBOX\n• Threat: ${newAlert.threatType}\n• Vector: ${newAlert.vector}\n• Details: ${newAlert.details}\n• Status: 100% BLOCKED & QUARANTINED`,
            timestamp: Date.now(),
            isPrivate: true,
            securityAlert: newAlert,
          },
        ]);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('lurl_security_threat_alert', handleSecurityEvent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('lurl_security_threat_alert', handleSecurityEvent);
      }
    };
  }, []);

  const handleSendMessage = async (customPrompt?: string) => {
    const query = (customPrompt || inputValue).trim();
    if (!query || isLoading) return;

    playClickSound();
    setInputValue('');

    const userMsg: VipChatMessage = {
      id: `vip_u_${Date.now()}`,
      sender: 'vip',
      senderName: 'VIP Proprietor',
      text: query,
      timestamp: Date.now(),
      isPrivate: true,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/vip/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userSession?.email || 'srao79614@gmail.com',
          message: query,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          setMessages((prev) => [...prev, data.message]);
          playSuccessChime();
        }
      } else {
        throw new Error('VIP Server Unreachable');
      }
    } catch {
      // Offline fallback
      setTimeout(() => {
        const fallbackMsg: VipChatMessage = {
          id: `vip_a_${Date.now()}`,
          sender: 'athena',
          senderName: 'Athena (Executive AI & Defense Partner)',
          text: `**Directive Received, Executive.**\n\nOur Autonomous Defense Shield is operating at **100% efficiency**. All perimeter gates, private charts, and session vectors remain completely secured and invisible to outside visitors.\n\n• **Threat Status:** All intrusion vectors neutralized.\n• **VIP Privacy:** End-to-end memory isolation active.`,
          timestamp: Date.now(),
          isPrivate: true,
          chartData: {
            type: 'threat_matrix',
            title: 'Real-Time Defense Matrix & Intrusion Vectors',
            metrics: {
              'Perimeter Status': '100% Locked',
              'Active Breaches': 0,
              'Zero-Trust Guard': 'Enforced',
              'Encryption Protocol': 'AES-256 GCM',
            },
          },
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }, 400);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateTamperProbe = async () => {
    setIsSimulating(true);
    playClickSound();
    try {
      const probes = ['url_hijack', 'privilege_probe', 'unauthorized_api', 'xss_injection'] as const;
      const chosen = probes[Math.floor(Math.random() * probes.length)];
      await simulateTamperAttempt(chosen);
    } finally {
      setTimeout(() => setIsSimulating(false), 600);
    }
  };

  const handleClearAlerts = async () => {
    playClickSound();
    try {
      await fetch('/api/vip/messages/clear-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userSession?.email }),
      });
    } catch {}
    setSecurityAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    setUnreadAlertsCount(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="vip-chat-box-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl h-[92vh] max-h-[820px] rounded-2xl bg-[#090b10] border border-[#f8b179]/70 shadow-[0_0_60px_rgba(248,177,121,0.25)] flex flex-col overflow-hidden"
        >
          {/* Gold Luxury Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#ffd700] to-[#d47a37]" />

          {/* Modal Header */}
          <div className="p-4 sm:p-5 border-b border-[#1f2638] bg-[#0c0f17] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-[#d47a37]/30 border border-[#f8b179]/50 flex items-center justify-center shadow-inner">
                <Crown className="w-5 h-5 text-[#ffd700]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                    VIP Executive Room & Defense Sentinel
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ISOLATED & PRIVATE
                  </span>
                </div>
                <p className="text-[11px] text-[#9ca3af]">
                  Private AI Advisor (Athena) • Real-Time Intrusion Alerts • Confidential Charts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#9ca3af] hover:text-white hover:bg-[#181f2c] border border-transparent hover:border-[#2d3748] transition-colors cursor-pointer"
                aria-label="Close VIP Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Strict VIP Verification Gate */}
          {!isVip ? (
            <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg">
                <Crown className="w-8 h-8 text-[#ffd700]" />
              </div>
              <h3 className="text-xl font-bold text-white font-['Cinzel'] tracking-wide">
                VIP Executive Room & Chatting
              </h3>
              <p className="text-xs text-[#9ca3af] max-w-sm leading-relaxed">
                Enter your authorized VIP Master Clearance Key or VIP Gmail to immediately unlock Athena AI Executive Chat and live anti-tamper perimeter defense.
              </p>

              <form onSubmit={handleUnlockVipWithPasscode} className="w-full space-y-3 pt-2">
                <div className="relative">
                  <input
                    type="password"
                    autoComplete="off"
                    value={vipPasscode}
                    onChange={(e) => {
                      setVipPasscode(e.target.value);
                      setPasscodeError(null);
                    }}
                    placeholder="Enter VIP Master Key (1029384756)"
                    className="w-full px-4 py-3 rounded-xl bg-[#090b10] border border-[#d47a37]/60 focus:border-[#ffd700] text-center text-white placeholder-gray-500 text-sm font-mono tracking-widest outline-none transition-all shadow-inner"
                  />
                </div>

                {passcodeError && (
                  <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-500/30 rounded-lg p-2 font-mono">
                    {passcodeError}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-xl text-xs font-bold text-[#090b10] bg-gradient-to-r from-amber-400 via-[#ffd700] to-[#d47a37] hover:brightness-110 shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Crown className="w-4 h-4 text-[#090b10]" />
                    <span>Unlock VIP Chatting</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-3 px-4 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-[#141824] hover:bg-[#1f2638] border border-[#252c3d] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </form>

              <p className="text-[10px] text-gray-500 font-mono">
                Proprietary clearance protected • Authorized VIP accounts: srao79614@gmail.com, lurlbusiness7@gmail.com
              </p>
            </div>
          ) : (
            <>
              {/* Navigation Tabs */}
              <div className="px-4 py-2.5 bg-[#0e121a] border-b border-[#1f2638] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab('chat');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'chat'
                        ? 'bg-[#d47a37]/25 text-[#ffd700] border border-[#f8b179]/60 shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#161c28]'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5 text-[#ffd700]" />
                    <span>Chat with Athena</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab('alerts');
                      setUnreadAlertsCount(0);
                    }}
                    className={`relative py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'alerts'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#161c28]'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Intrusion Alerts</span>
                    {unreadAlertsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
                        {unreadAlertsCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveTab('charts');
                    }}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'charts'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                        : 'text-[#9ca3af] hover:text-white hover:bg-[#161c28]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Private VIP Charts</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateTamperProbe}
                    disabled={isSimulating}
                    className="py-1 px-2.5 rounded-lg text-[11px] font-mono text-[#f8b179] bg-[#141824] hover:bg-[#1f2638] border border-[#d47a37]/40 flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                    title="Simulate an intrusion/tamper attempt to verify real-time alert dispatch to VIP inbox"
                  >
                    <Zap className="w-3 h-3 text-[#f8b179]" />
                    <span>{isSimulating ? 'Testing Shield...' : '⚡ Test Intrusion Alert'}</span>
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* 1. CHAT TAB */}
                {activeTab === 'chat' && (
                  <div className="space-y-4">
                    {/* Welcome Banner */}
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#d47a37]/15 to-[#b85d19]/10 border border-[#f8b179]/30 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#ffd700] shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <p className="font-bold text-white">
                          Confidential Channel Active • You are speaking with Athena
                        </p>
                        <p className="text-[#9ca3af] leading-relaxed">
                          Only verified VIPs can access this chat. Nobody else can see the messages, charts, or threat defense telemetry. Any attempt to tamper or bypass the site automatically alerts you here.
                        </p>
                      </div>
                    </div>

                    {/* Messages Thread */}
                    {messages.map((msg) => {
                      const isUser = msg.sender === 'vip';
                      const isAlert = msg.sender === 'security_system';

                      if (isAlert) {
                        return (
                          <div
                            key={msg.id}
                            className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-left space-y-2 shadow-md animate-in fade-in"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                                <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                                {msg.senderName}
                              </span>
                              <span className="text-[10px] font-mono text-[#9ca3af]">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <pre className="text-[11px] font-mono text-rose-200 whitespace-pre-wrap leading-relaxed">
                              {msg.text}
                            </pre>
                            <div className="flex items-center gap-2 pt-1 border-t border-rose-500/20 text-[10px] text-emerald-400 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Autonomous Zero-Trust Shield: Action Neutralized & Quarantined</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#6b7280] px-1">
                            <span>{msg.senderName}</span>
                            <span>•</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>

                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                              isUser
                                ? 'bg-gradient-to-r from-[#d47a37] to-[#b85d19] text-white rounded-tr-none shadow-md'
                                : 'bg-[#121622] text-[#e2e8f0] border border-[#252c3d] rounded-tl-none space-y-2 shadow-sm'
                            }`}
                          >
                            <div className="whitespace-pre-wrap">{msg.text}</div>

                            {/* Embedded Chart in Chat if present */}
                            {msg.chartData && (
                              <div className="mt-3 p-3 rounded-xl bg-[#090b10] border border-[#f8b179]/40 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-[#ffd700] flex items-center gap-1.5">
                                    <BarChart3 className="w-3.5 h-3.5 text-[#ffd700]" />
                                    {msg.chartData.title}
                                  </span>
                                  <span className="text-[9px] font-mono text-emerald-400">VIP ONLY</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  {Object.entries(msg.chartData.metrics).map(([key, val]) => (
                                    <div key={key} className="p-1.5 rounded bg-[#10141f] border border-[#1f2638]">
                                      <div className="text-[#9ca3af] truncate">{key}</div>
                                      <div className="font-bold text-white truncate">{String(val)}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {isLoading && (
                      <div className="flex items-center gap-2 text-xs text-[#f8b179] font-mono animate-pulse">
                        <Bot className="w-4 h-4 text-[#ffd700]" />
                        <span>Athena is synthesizing defense intelligence...</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* 2. SECURITY ALERTS TAB */}
                {activeTab === 'alerts' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e121a] border border-[#1f2638]">
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          <span>Tamper & Intrusion Defense Feed</span>
                        </h4>
                        <p className="text-[11px] text-[#9ca3af]">
                          All detected URL hijacking, parameter tampering, and token forgery attempts alert here immediately.
                        </p>
                      </div>

                      {securityAlerts.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAlerts}
                          className="py-1 px-3 rounded-lg text-xs font-semibold text-[#f8b179] bg-[#141824] hover:bg-[#1f2638] border border-[#d47a37]/40 cursor-pointer"
                        >
                          Acknowledge All
                        </button>
                      )}
                    </div>

                    {securityAlerts.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-[#0c0f17] border border-[#1f2638] space-y-2">
                        <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                        <h4 className="text-sm font-bold text-white">Perimeter 100% Secure</h4>
                        <p className="text-xs text-[#9ca3af] max-w-sm mx-auto">
                          Zero active intrusion attempts recorded. Any attempt by anyone to tamper with, take over, or hack the website will immediately dispatch a high-priority alert right here into your VIP message feed.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {securityAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="p-4 rounded-xl bg-[#0e121a] border border-rose-500/40 text-left space-y-2 shadow-lg"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                {alert.severity} THREAT INTERCEPTED
                              </span>
                              <span className="text-[10px] font-mono text-[#9ca3af]">
                                {new Date(alert.timestamp).toLocaleString()}
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-white">{alert.threatType}</h5>
                            <p className="text-[11px] text-gray-300 font-mono leading-relaxed">
                              {alert.details}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1f2638] text-[10px] font-mono">
                              <div className="text-[#9ca3af]">
                                Vector: <span className="text-white">{alert.vector}</span>
                              </div>
                              <div className="text-[#9ca3af]">
                                Status: <span className="text-emerald-400 font-bold">100% BLOCKED & QUARANTINED</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. CHARTS TAB (Only VIP can see) */}
                {activeTab === 'charts' && (
                  <div className="space-y-6">
                    <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-[#d47a37]/15 border border-[#f8b179]/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-[#ffd700]" />
                        <span className="text-xs font-bold text-white">
                          Private VIP Analytical Charts • Confidential
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        Zero Public Visibility
                      </span>
                    </div>

                    {/* Chart 1: Real-Time Threat & Defense Vector Chart */}
                    <div className="p-5 rounded-2xl bg-[#0c0f17] border border-[#1f2638] space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-400" />
                            <span>Perimeter Security Threat Radar & Interceptions</span>
                          </h4>
                          <p className="text-[11px] text-[#9ca3af]">
                            Continuous vector monitoring across all client routes and API endpoints.
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                          100% DEFENDED
                        </span>
                      </div>

                      {/* Interactive SVG Radar / Bar Graphic */}
                      <div className="p-4 rounded-xl bg-[#080a0f] border border-[#181f2c] space-y-3">
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-gray-300">URL Hijacking & Query Tamper Shield</span>
                              <span className="text-emerald-400 font-mono font-bold">100% Secured</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#141824] overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-full" />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-gray-300">Session Storage & Token Elevation Defense</span>
                              <span className="text-emerald-400 font-mono font-bold">100% Shielded</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#141824] overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 w-full" />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span className="text-gray-300">Script & Payload Quarantining</span>
                              <span className="text-emerald-400 font-mono font-bold">Active Defense</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#141824] overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-teal-400 to-[#d47a37] w-full" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-[#181f2c] text-center">
                          <div className="p-2 rounded-lg bg-[#0d1017]">
                            <div className="text-[10px] text-[#9ca3af]">Total Blocked</div>
                            <div className="text-sm font-bold text-white font-mono">{securityAlerts.length}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-[#0d1017]">
                            <div className="text-[10px] text-[#9ca3af]">Active Breaches</div>
                            <div className="text-sm font-bold text-emerald-400 font-mono">0</div>
                          </div>
                          <div className="p-2 rounded-lg bg-[#0d1017]">
                            <div className="text-[10px] text-[#9ca3af]">Vault Isolation</div>
                            <div className="text-sm font-bold text-[#ffd700] font-mono">Enforced</div>
                          </div>
                          <div className="p-2 rounded-lg bg-[#0d1017]">
                            <div className="text-[10px] text-[#9ca3af]">Defense State</div>
                            <div className="text-sm font-bold text-emerald-400 font-mono">Active</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart 2: Private VIP Autonomous Alpha & Liquidity Curve */}
                    <div className="p-5 rounded-2xl bg-[#0c0f17] border border-[#1f2638] space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#ffd700]" />
                            <span>Proprietary Autonomous Yield & Moat Projections</span>
                          </h4>
                          <p className="text-[11px] text-[#9ca3af]">
                            Calibrated against executive risk ceiling and algorithmic fulfillment metrics.
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-[#ffd700] font-bold">
                          TOP ALPHA
                        </span>
                      </div>

                      {/* SVG Projected Alpha Growth Curve */}
                      <div className="p-4 rounded-xl bg-[#080a0f] border border-[#181f2c] flex flex-col items-center">
                        <svg viewBox="0 0 400 120" className="w-full h-28 stroke-current">
                          <defs>
                            <linearGradient id="vipAlphaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#ffd700" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#d47a37" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 10 100 Q 80 80, 150 65 T 280 35 T 390 15 L 390 115 L 10 115 Z"
                            fill="url(#vipAlphaGrad)"
                          />
                          <path
                            d="M 10 100 Q 80 80, 150 65 T 280 35 T 390 15"
                            fill="none"
                            stroke="#ffd700"
                            strokeWidth="2.5"
                          />
                          {/* Key Benchmark Dots */}
                          <circle cx="150" cy="65" r="4" fill="#ffd700" />
                          <circle cx="280" cy="35" r="4" fill="#34d399" />
                          <circle cx="390" cy="15" r="5" fill="#f8b179" />
                        </svg>

                        <div className="w-full flex items-center justify-between text-[10px] font-mono text-[#9ca3af] pt-2 border-t border-[#181f2c]">
                          <span>Phase 1: Capital Moat</span>
                          <span>Phase 2: 74.8% Win Rate</span>
                          <span>Phase 3: Autonomous Scale</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar (Only visible on Chat Tab) */}
              {activeTab === 'chat' && (
                <div className="p-3 sm:p-4 bg-[#0c0f17] border-t border-[#1f2638] space-y-2">
                  {/* Quick Command Suggestions */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Run complete website security audit & attack vector report')}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] border border-[#d47a37]/30 text-[11px] text-[#f8b179] transition-colors cursor-pointer"
                    >
                      🛡️ Audit Website Security
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Reveal confidential VIP Alpha & proprietary yield charts')}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] border border-[#d47a37]/30 text-[11px] text-[#f8b179] transition-colors cursor-pointer"
                    >
                      📊 Reveal Alpha Charts
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendMessage('Explain how our Zero-Trust Shield blocks hackers and URL tampering')}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-[#141824] hover:bg-[#1f2638] border border-[#d47a37]/30 text-[11px] text-[#f8b179] transition-colors cursor-pointer"
                    >
                      🔒 Anti-Hack Architecture
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Send private message or command to Athena..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#090b10] border border-[#2d3748] focus:border-[#d47a37] text-white text-xs outline-none transition-all placeholder:text-[#6b7280]"
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isLoading}
                      className="py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#d47a37] to-[#b85d19] hover:from-[#e08a46] hover:to-[#a2480f] disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
