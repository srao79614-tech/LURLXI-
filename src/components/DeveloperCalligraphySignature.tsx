import React from 'react';
import { motion } from 'motion/react';

interface DeveloperCalligraphySignatureProps {
  variant?: 'footer' | 'auth' | 'compact';
  className?: string;
}

export const DeveloperCalligraphySignature: React.FC<DeveloperCalligraphySignatureProps> = ({
  variant = 'footer',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className={`w-full flex flex-col items-center justify-center select-none ${
        variant === 'footer' ? 'pt-6 mt-6 border-t border-[#1c2333]/80 pb-2' : 'pt-4 mt-4 border-t border-[#1f2937]/60'
      } ${className}`}
    >
      <div
        className="inline-flex flex-col items-center text-center"
        style={{
          fontFamily: "'Dancing Script', 'Great Vibes', 'Alex Brush', cursive",
        }}
      >
        {/* Top Centered Line: AI-POWERED */}
        <div className="text-[13px] sm:text-[14px] font-semibold tracking-[0.18em] text-[#f8b179] drop-shadow-[0_0_8px_rgba(248,177,121,0.35)] mb-0.5">
          AI-POWERED
        </div>

        {/* Aligned Two-Line Creator Block */}
        <div className="inline-grid grid-cols-[auto_auto] gap-x-1.5 text-left text-[12px] sm:text-[13px] leading-snug text-[#e5e7eb]/90">
          <span className="text-right font-medium text-[#cbd5e1] tracking-wider">
            CREATED BY
          </span>
          <span className="font-semibold text-[#f8b179] tracking-wide">
            : K NISHANTH(CEO,MD)
          </span>

          <span className="text-right font-medium text-[#cbd5e1] tracking-wider">
            &nbsp;
          </span>
          <span className="font-semibold text-[#f8b179] tracking-wide">
            : S SAIKEERTHAN(BOD)
          </span>
        </div>
      </div>
    </motion.div>
  );
};
