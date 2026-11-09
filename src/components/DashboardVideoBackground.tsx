import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Sparkles } from 'lucide-react';

interface DashboardVideoBackgroundProps {
  videoUrl?: string;
  scrimOpacity?: string;
}

export const DashboardVideoBackground: React.FC<DashboardVideoBackgroundProps> = ({
  videoUrl = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_021419_291eb2af-5ed4-45a0-a1d6-3ef58f4bca0b.mp4',
  scrimOpacity = 'bg-[#06080e]/35',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Guarantee autoplay execution across all modern browsers and iframe sandboxes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.loop = true;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoaded(true);
        })
        .catch((err) => {
          console.warn('Video autoPlay pending interaction:', err);
          // If browser blocked autoplay, attempt muted play on first document click
          const startOnInteraction = () => {
            video.play().then(() => setIsPlaying(true)).catch(() => {});
            window.removeEventListener('click', startOnInteraction);
            window.removeEventListener('keydown', startOnInteraction);
          };
          window.addEventListener('click', startOnInteraction);
          window.addEventListener('keydown', startOnInteraction);
        });
    }
  }, [videoUrl]);

  const togglePlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 bg-[#06080e]">
      {/* High-Definition 3D Looping Ambient Video Animation */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        controls={false}
        onLoadedData={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-80'
        }`}
      />

      {/* Primary Contrast Scrim Layer for Readability */}
      <div className={`absolute inset-0 ${scrimOpacity} backdrop-blur-[0.5px] pointer-events-none`} />

      {/* Subtle Radial Vignette Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,8,14,0.65)_100%)] pointer-events-none" />

      {/* Interactive Bottom-Right Playback Control Badge */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        <button
          type="button"
          onClick={togglePlayback}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a0d14]/85 hover:bg-[#141b28] border border-[#d47a37]/40 hover:border-[#d47a37] text-white text-[11px] font-mono shadow-lg backdrop-blur-md transition-all cursor-pointer group"
          title={isPlaying ? 'Pause 3D Background Animation' : 'Play 3D Background Animation'}
        >
          <Sparkles className="w-3 h-3 text-[#f8b179] animate-pulse" />
          <span className="text-[#9ca3af] group-hover:text-white">3D Animation</span>
          <span className="text-[#f8b179] font-bold">
            {isPlaying ? (
              <span className="inline-flex items-center gap-1">
                <Pause className="w-2.5 h-2.5" /> LIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Play className="w-2.5 h-2.5" /> PAUSED
              </span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
};
