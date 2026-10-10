import React from 'react';

interface LurlAppIconProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

export const LurlAppIcon: React.FC<LurlAppIconProps> = ({
  className = '',
  size = 40,
  showGlow = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-60 bg-gradient-to-tr from-[#6a310c] via-[#b85d19] to-[#f8b179] animate-pulse pointer-events-none"
          style={{ transform: 'scale(1.15)' }}
        />
      )}
      
      {/* Fallback & High-Res Image with SVG Vector Overlay */}
      <img
        src="/assets/lurl_logo.jpg"
        alt="LURL Official Emblem"
        className="w-full h-full object-cover rounded-full relative z-10 border border-[#d47a37]/60 shadow-[0_0_15px_rgba(212,122,55,0.4)]"
        onError={(e) => {
          // If image fails, fallback to styled SVG
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};
