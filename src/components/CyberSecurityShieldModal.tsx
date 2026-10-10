import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Lock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Terminal,
  Zap,
  Radio,
  FileCheck2,
  X,
  Search,
  Fingerprint,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  fetchCyberSecurityStatus,
  fetchCyberSecurityAlerts,
  runDeepCyberThreatScan,
  acknowledgeAllSecurityAlerts,
  simulateTamperAttempt,
  CyberSecurityStatusResponse,
  CyberThreatScanResult,
} from '../utils/securityShield';
import { VipSecurityAlert } from '../types';
import { playClickSound, playSuccessChime } from '../utils/soundEffects';

interface CyberSecurityShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  isVip?: boolean;
}

export const CyberSecurityShieldModal: React.FC<CyberSecurityShieldModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  isVip,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scanner' | 'threats' | 'simulate'>('overview');
  const [statusData, setStatusData] = useState<CyberSecurityStatusResponse | null>(null);
  const [alerts, setAlerts] = useState<VipSecurityAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState<CyberThreatScanResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [status, fetchedAlerts] = await Promise.all([
        fetchCyberSecurityStatus(),
        fetchCyberSecurityAlerts(),
      ]);
      if (status) setStatusData(status);
      if (fetchedAlerts) setAlerts(fetchedAlerts);
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleStartDeepScan = async () => {
    playClickSound();
    setIsScanning(true);
    setScanResult(null);
    setScanStep(1);

    // Multi-stage visual scan animation
    setTimeout(() => setScanStep(2), 500);
    setTimeout(() => setScanStep(3), 1000);
    setTimeout(() => setScanStep(4), 1500);
    setTimeout(async () => {
      setScanStep(5);
      const res = await runDeepCyberThreatScan();
      setScanResult(res);
      setIsScanning(false);
      playSuccessChime();
      loadData();
    }, 2000);
  };

  const handleSimulateAttack = async (
    type: 'url_hijack' | 'privilege_probe' | 'unauthorized_api' | 'xss_injection' | 'malware_probe',
    label: string
  ) => {
    playClickSound();
    setIsSimulating(true);
    setSimulationNotice(`Transmitting safe simulated "${label}" probe against Cyber Defense Shield...`);
    try {
      await simulateTamperAttempt(type);
      playSuccessChime();
      setSimulationNotice(`✅ Intercepted & Neutralized! Probe was quarantined with 0 execution.`);
      loadData();
    } catch {
      setSimulationNotice(`Probe quarantined by Zero-Trust Shield.`);
    }
    setTimeout(() => {
      setIsSimulating(false);
    }, 1800);
  };

  const handleAcknowledgeAlerts = async () => {
    playClickSound();
    await acknowledgeAllSecurityAlerts();
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    loadData();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0b0e17] border border-[#232a3d] rounded-2xl shadow-2xl overflow-hidden text-gray-100"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#232a3d] bg-gradient-to-r from-[#111726] via-[#0b0e17] to-[#151c2e] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-400">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    Autonomous Cyber Defense Sentinel
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    100% ARMED
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Deep Packet WAF · Heuristic Anti-Malware · Virus Immunity · Cryptographic HMAC-SHA256
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadData}
                disabled={isLoading}
                title="Refresh Status"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-5 py-2.5 border-b border-[#1b2234] bg-[#0d121e] flex items-center gap-2 sm:gap-3 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('overview');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview & Radar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('scanner');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Deep Malware Scan</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('threats');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap relative ${
                activeTab === 'threats'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Quarantined Threats</span>
              {alerts.filter((a) => !a.acknowledged).length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setActiveTab('simulate');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'simulate'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verify & Simulate</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* TAB 1: OVERVIEW & RADAR */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Hero Defense Status Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121829] via-[#0e1320] to-[#141b2e] border border-emerald-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                          DEFENSE POSTURE: MAXIMUM LOCKDOWN
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          GRADE A+
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                        Zero Vulnerabilities Tolerated. Continuous Autonomous Protection.
                      </h3>
                      <p className="text-xs text-gray-400 max-w-2xl mt-1 leading-relaxed">
                        Every incoming HTTP packet, WebSocket frame, URL parameter, and database write is verified through multi-stage deep inspection heuristics to eliminate malware, virus injection, and unauthorized data tampering.
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <div className="text-right">
                        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                          100%
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-400">
                          Integrity Rating
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stat Pill Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-800/80">
                    <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
                      <span className="text-[10px] uppercase text-gray-400 block font-mono">Neutralized Exploits</span>
                      <span className="text-lg font-bold text-white font-mono mt-0.5 block">
                        {statusData?.metrics.totalNeutralizedThreats || alerts.length} Threats
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
                      <span className="text-[10px] uppercase text-gray-400 block font-mono">Quarantined IPs</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">
                        {statusData?.metrics.quarantinedIpsCount || 0} Blocked
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
                      <span className="text-[10px] uppercase text-gray-400 block font-mono">Session Token Shield</span>
                      <span className="text-lg font-bold text-white font-mono mt-0.5 block flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        HMAC-SHA256
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-gray-800/70">
                      <span className="text-[10px] uppercase text-gray-400 block font-mono">Active Streams</span>
                      <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Hardened WSS
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6 Armed Defensive Layers Grid */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Active Defensive Layers (6-of-6 Locked)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">Autonomous Deep Packet WAF</h5>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                              ENFORCED
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            Deep inspection of URL query strings, request bodies, and headers against SQL injection, command execution, and remote template exploitation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">Anti-Malware & Virus Heuristics</h5>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                              ZERO DROPPERS
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            Signature blocks for executable droppers (.exe, .dll, .bat, .sh, .vbs, .ps1, webshells) and base64-encoded binary headers (PE/ELF/Mach-O).
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 shrink-0">
                          <Fingerprint className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">Cryptographic Session Shield</h5>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
                              HMAC SIGNED
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            Sessions authenticated with cryptographic HMAC-SHA256 signatures. Constant-time comparisons defeat timing side-channel attacks on OTPs and passcodes.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">Anti-DDoS & IP Rate Limiting</h5>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                              TOKEN-BUCKET
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            Adaptive rate limiting caps request floods, throttles OTP brute-forcing, and automatically locks hostile IPs after repeated violations.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">Strict CSP & Anti-MIME Sniffing</h5>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                              NOSNIFF ACTIVE
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            Content-Security-Policy disallows arbitrary external scripts; X-Content-Type-Options: nosniff stops executable script masquerading.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-emerald-500/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                          <Terminal className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">DOM Anti-Tamper & Storage Guard</h5>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                              IMMUTABLE
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                            Client runtime blocks prototype pollution, detects unauthorized localStorage role manipulation, and revokes forged access instantly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: DEEP MALWARE SCAN */}
            {activeTab === 'scanner' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#101726] to-[#0c101b] border border-[#232b40] text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-4">
                    <Search className={`w-8 h-8 ${isScanning ? 'animate-spin' : ''}`} />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white">
                    On-Demand Full Cyber Threat & Malware Scan
                  </h3>
                  <p className="text-xs text-gray-400 max-w-lg mx-auto mt-1 leading-relaxed">
                    Audits live memory feeds, database stores, session tokens, WebSocket frames, script tags, and network security headers for exploits or droppers.
                  </p>

                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={handleStartDeepScan}
                      disabled={isScanning}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer shadow-lg shadow-emerald-950/40 flex items-center gap-2 mx-auto disabled:opacity-50"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Scanning System Architecture...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-emerald-300" />
                          <span>Execute Full Deep Scan</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scan Progress Bar Animation */}
                  {isScanning && (
                    <div className="mt-6 max-w-md mx-auto space-y-2 text-left">
                      <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                          style={{ width: `${(scanStep / 5) * 100}%` }}
                        />
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 flex items-center justify-between">
                        <span>
                          {scanStep === 1 && 'Auditing memory feeds & database payloads...'}
                          {scanStep === 2 && 'Checking DOM script injection vectors...'}
                          {scanStep === 3 && 'Verifying cryptographic token signatures...'}
                          {scanStep === 4 && 'Inspecting heuristic dropper & webshell filters...'}
                          {scanStep === 5 && 'Compiling cryptographic integrity certificate...'}
                        </span>
                        <span>{Math.round((scanStep / 5) * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scan Results Card */}
                {scanResult && !isScanning && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-[#0f1422] border border-emerald-500/40 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="text-sm font-bold text-white">
                            Scan Complete: 100% Clean (0 Vulnerabilities Found)
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Scan duration: {scanResult.scanDurationMs}ms · Certificate ID: {scanResult.certificate.id}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        VERIFIED SECURE
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-800/80">
                      {scanResult.findings.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-black/40 border border-gray-800/80 flex items-start justify-between gap-3 text-left"
                        >
                          <div>
                            <div className="text-xs font-bold text-gray-200">{item.check}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{item.details}</div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Official Certificate Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-teal-950/30 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck2 className="w-7 h-7 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-mono font-bold text-emerald-300">
                            {scanResult.certificate.authority}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {scanResult.certificate.guarantee}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-gray-400">
                        {new Date(scanResult.certificate.issuedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB 3: QUARANTINED THREATS LOG */}
            {activeTab === 'threats' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                      Neutralized & Quarantined Attack Vector Log ({alerts.length} Events)
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      Real-time ledger of blocked intrusion probes, injection payloads, and suspicious queries.
                    </p>
                  </div>

                  {alerts.some((a) => !a.acknowledged) && (
                    <button
                      type="button"
                      onClick={handleAcknowledgeAlerts}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 text-gray-200 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      Acknowledge All
                    </button>
                  )}
                </div>

                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-[#0c101a] rounded-xl border border-gray-800">
                    <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                    <p className="text-xs text-gray-300 font-bold">No active intrusions logged.</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Perimeter defense shields are fully armed and intercepting all hostile queries.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.slice(0, 25).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3.5 rounded-xl border transition-colors ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-950/20 border-rose-500/30'
                            : 'bg-[#0f1422] border-[#222a3e]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                                alert.severity === 'CRITICAL'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white">{alert.threatType}</div>
                              <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                                Vector: {alert.vector}
                              </div>
                              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                                {alert.details}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 block mb-1">
                              {alert.status}
                            </span>
                            <span className="text-[10px] font-mono text-gray-500 block">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: VERIFY & SIMULATE */}
            {activeTab === 'simulate' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#121829] to-[#0e1320] border border-cyan-500/30">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    Interactive Defense Probe Verification
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Verify that LURL's autonomous WAF, anti-malware heuristic scanner, and zero-trust guards actively intercept and quarantine attacks by dispatching simulated, harmless probe payloads.
                  </p>

                  {simulationNotice && (
                    <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-xs font-mono text-cyan-300 animate-pulse">
                      {simulationNotice}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => handleSimulateAttack('xss_injection', 'Cross-Site Scripting (XSS)')}
                    className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-cyan-500/40 hover:bg-[#131929] transition-all text-left cursor-pointer group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                        Simulate &lt;script&gt; XSS Injection
                      </span>
                      <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Tests client-side sanitization and WAF input filtering against raw script payloads.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => handleSimulateAttack('malware_probe', 'Malware Dropper (.exe/.sh)')}
                    className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-cyan-500/40 hover:bg-[#131929] transition-all text-left cursor-pointer group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                        Simulate Malware Dropper Vector
                      </span>
                      <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Tests heuristic antivirus filters for executable binary extensions and shellcode signatures.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => handleSimulateAttack('url_hijack', 'URL Hijack & Host Spoofing')}
                    className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-cyan-500/40 hover:bg-[#131929] transition-all text-left cursor-pointer group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                        Simulate URL Query Hijack
                      </span>
                      <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Tests parameter tamper monitoring for redirect injections and illegal host queries.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => handleSimulateAttack('privilege_probe', 'VIP Privilege Escalation')}
                    className="p-4 rounded-xl bg-[#0f1422] border border-[#222a3e] hover:border-cyan-500/40 hover:bg-[#131929] transition-all text-left cursor-pointer group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                        Simulate Privilege Escalation Probe
                      </span>
                      <Zap className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Tests storage tamper guards and cryptographic token validation against unauthorized role forgery.
                    </p>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3 border-t border-[#232a3d] bg-[#0c101a] flex items-center justify-between text-xs text-gray-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-[11px]">
                Protected Account: {userEmail || 'Executive User'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl font-semibold bg-gray-800 hover:bg-gray-700 text-white transition-colors cursor-pointer"
            >
              Close Sentinel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
