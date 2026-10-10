import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface ThreeDLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ThreeDLogo: React.FC<ThreeDLogoProps> = ({
  size = 'md',
  showText = false,
  interactive = true,
  className = '',
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Motion coordinates for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [18, -18]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-18, 18]), springConfig);
  const shadowX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  const shadowY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-15, 15]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    setAutoRotate(false);
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
    setAutoRotate(true);
  };

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-28 h-28',
    hero: 'w-48 h-48 sm:w-60 sm:h-60',
  };

  return (
    <div
      ref={containerRef}
      id="three-d-logo-wrapper"
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ perspective: 1200 }}
    >
      {/* 3D Container with Spring Rotations */}
      <motion.div
        id="three-d-logo-card"
        className={`relative ${sizeClasses[size]} cursor-pointer flex items-center justify-center rounded-full`}
        style={{
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Ambient Warm Copper Glow */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-60 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212,122,55,0.5) 0%, rgba(184,93,25,0.2) 60%, transparent 80%)',
          }}
        />

        {/* 3D Orbit Ring */}
        <motion.div
          className="absolute -inset-3 sm:-inset-4 rounded-full border border-[#d47a37]/30 pointer-events-none"
          style={{ transform: 'translateZ(-15px) rotateX(65deg)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#f8b179] shadow-[0_0_8px_#f8b179]" />
        </motion.div>

        {/* Outer Metallic Bezel */}
        <div
          className="absolute inset-0 rounded-full p-[2px] shadow-2xl transition-all duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #f8b179 0%, #b85d19 45%, #6a310c 70%, #f3974e 100%)',
            transform: 'translateZ(10px)',
          }}
        >
          <div className="w-full h-full rounded-full bg-[#0d0f16]" />
        </div>

        {/* The Exact Logo Image with 3D Depth */}
        <div
          className="relative w-[92%] h-[92%] rounded-full overflow-hidden flex items-center justify-center bg-[#0d0f16]"
          style={{
            transform: 'translateZ(25px)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8), 0 10px 30px rgba(184,93,25,0.4)',
          }}
        >
          {/* Real Generated High-Res Logo */}
          <img
            src="/assets/lurl_logo.jpg"
            alt="LURL Official Insignia"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full filter contrast-110 brightness-105 transition-transform duration-700"
            onError={(e) => {
              // Fallback to high-fidelity SVG render if file is loading
              e.currentTarget.style.display = 'none';
              const fallback = document.getElementById('svg-logo-fallback');
              if (fallback) fallback.style.display = 'block';
            }}
          />

          {/* High-Fidelity SVG Fallback matching the interlocking copper ribbons */}
          <svg
            id="svg-logo-fallback"
            style={{ display: 'none' }}
            viewBox="0 0 200 200"
            className="w-full h-full p-2"
          >
            <defs>
              <linearGradient id="lurlGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8b179" />
                <stop offset="35%" stopColor="#d47a37" />
                <stop offset="70%" stopColor="#b85d19" />
                <stop offset="100%" stopColor="#7a340a" />
              </linearGradient>
              <radialGradient id="ringShadow" cx="50%" cy="50%" r="50%">
                <stop offset="60%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
              </radialGradient>
              <filter id="metallicRelief" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* Circular Ring Frame */}
            <circle cx="100" cy="100" r="92" fill="none" stroke="url(#lurlGold)" strokeWidth="11" />
            <circle cx="100" cy="100" r="92" fill="url(#ringShadow)" />

            {/* Interlocking Monogram Curves (LURL / LR ribbons) */}
            <g filter="url(#metallicRelief)">
              <path
                d="M 54 50 C 40 85 45 130 82 142 C 105 150 120 135 125 110 C 130 85 115 65 95 65 C 75 65 68 85 72 108 C 76 130 92 145 120 145 C 148 145 158 115 156 85"
                fill="none"
                stroke="url(#lurlGold)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 115 110 C 125 130 145 145 160 148"
                fill="none"
                stroke="url(#lurlGold)"
                strokeWidth="15"
                strokeLinecap="round"
              />
            </g>
          </svg>

          {/* Dynamic Light Sheen / Specular Glint */}
          <div
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none opacity-60 mix-blend-overlay"
            style={{ transform: 'translateZ(30px)' }}
          />
        </div>

        {/* 3D Floating Particle Accents in Hero Mode */}
        {size === 'hero' && (
          <>
            <motion.div
              className="absolute -top-3 right-6 w-3 h-3 rounded-full bg-[#f8b179] blur-[1px] shadow-[0_0_12px_#f8b179]"
              animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transform: 'translateZ(35px)' }}
            />
            <motion.div
              className="absolute -bottom-2 left-8 w-2.5 h-2.5 rounded-full bg-[#d47a37] blur-[1px] shadow-[0_0_10px_#d47a37]"
              animate={{ y: [0, 6, 0], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{ transform: 'translateZ(35px)' }}
            />
          </>
        )}
      </motion.div>

      {/* Brand Text (Optional) */}
      {showText && (
        <div className="mt-4 text-center" style={{ transform: 'translateZ(20px)' }}>
          <h1 className="font-['Cinzel'] tracking-[0.25em] text-2xl sm:text-3xl font-extrabold uppercase bg-gradient-to-r from-[#f8b179] via-[#d47a37] to-[#f3974e] bg-clip-text text-transparent drop-shadow-sm">
            LURL
          </h1>
          <p className="text-xs tracking-widest text-[#9ca3af] uppercase mt-0.5 font-medium">
            Autonomous Business Intelligence Core
          </p>
        </div>
      )}
    </div>
  );
};
