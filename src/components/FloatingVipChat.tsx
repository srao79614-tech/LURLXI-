import React from 'react';
import { motion } from 'motion/react';
import { Crown, ShieldCheck } from 'lucide-react';
import { UserSession } from '../types';
import { isPrivilegedAdminEmail } from '../utils/maskEmail';
import { playClickSound } from '../utils/soundEffects';
import { VipChatBox } from './VipChatBox';

interface FloatingVipChatProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  userSession: UserSession | null;
  onOpenSettings?: () => void;
  onElevateVip?: () => void;
  unreadAlertsCount?: number;
}

export const FloatingVipChat: React.FC<FloatingVipChatProps> = ({
  isOpen,
  onOpen,
  onClose,
  userSession,
  onOpenSettings,
  onElevateVip,
  unreadAlertsCount = 0,
}) => {
  const isVip = Boolean(
    userSession?.isVip || (userSession?.email && isPrivilegedAdminEmail(userSession.email))
  );

  return (
    <>
      {/* 1. Floating VIP Chatting Launcher Button */}
      <div className="fixed bottom-52 right-6 z-50 flex items-center justify-end pointer-events-auto">
        {!isOpen && (
          <motion.button
            id="floating-vip-chat-btn"
            type="button"
            onClick={() => {
              playClickSound();
              onOpen();
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            className="group relative flex items-center gap-2.5 p-1 cursor-pointer focus:outline-none"
            aria-label="Open VIP Chatting & Defense Sentinel"
            title="Real-Time VIP Athena AI Chat & Autonomous Anti-Tamper Sentinel"
          >
            {/* Ambient luxury gold pulsating halo */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-amber-500 via-[#ffd700] to-[#d47a37] opacity-80 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />

            {/* Glowing gold circular emblem */}
            <div className="relative w-14 h-14 rounded-full bg-[#0d1017] border-2 border-[#ffd700]/70 shadow-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-[#ffd700]/25 to-[#d47a37]/40 animate-spin-slow opacity-90" />
              <div className="relative z-10 flex flex-col items-center justify-center text-[#ffd700]">
                <Crown className="w-6 h-6 drop-shadow-[0_0_10px_rgba(255,215,0,0.85)]" />
              </div>
              <span
                className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-[#0d1017] ${
                  isVip ? 'bg-[#ffd700]' : 'bg-amber-400'
                }`}
              />
            </div>

            {/* Pill Label */}
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0d1017]/95 text-white font-medium text-xs border border-[#ffd700]/50 shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#ffd700] animate-ping" />
              <span className="font-bold text-[#fce0cd]">VIP Chat</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/25 text-[#ffd700] rounded font-mono font-bold border border-amber-500/40">
                {isVip ? 'ATHENA VIP' : 'SECURE'}
              </span>
              {unreadAlertsCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-bold font-mono animate-bounce">
                  {unreadAlertsCount}
                </span>
              )}
            </span>
          </motion.button>
        )}
      </div>

      {/* 2. VIP Chatting Box & Security Defense Room */}
      <VipChatBox
        isOpen={isOpen}
        onClose={onClose}
        userSession={userSession}
        onOpenSettings={onOpenSettings}
        onElevateVip={onElevateVip}
      />
    </>
  );
};
