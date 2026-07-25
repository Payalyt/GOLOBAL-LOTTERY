import React, { useState } from 'react';

const LOGO_FALLBACKS = [
  '/images/3d_lottery_logo.jpg',
  '/assets/3d_lottery_logo.jpg',
  '/images/3d_lottery_logo_1784951997317.jpg',
  '/assets/3d_lottery_logo_1784951997317.jpg'
];

interface Smart3DLogoProps {
  className?: string;
  customUrl?: string;
}

export function Smart3DLogo({ className = "w-full h-full object-contain", customUrl }: Smart3DLogoProps) {
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [isFailed, setIsFailed] = useState(false);

  // If customUrl is provided, try customUrl first, then step through LOGO_FALLBACKS
  const currentSrc = customUrl && attemptIndex === 0 
    ? customUrl 
    : LOGO_FALLBACKS[customUrl ? attemptIndex - 1 : attemptIndex];

  if (isFailed || !currentSrc) {
    return (
      <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-amber-600 via-[#E1BC4A] to-yellow-300 flex items-center justify-center shadow-[0_10px_25px_rgba(225,188,74,0.4)] relative overflow-hidden border border-amber-300/40 select-none">
        <div className="absolute inset-0 bg-radial from-white/30 to-transparent opacity-80" />
        <span className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] font-bodoni tracking-wider">777</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt="3D Lottery Logo"
      className={className}
      onError={() => {
        const maxAttempts = customUrl ? LOGO_FALLBACKS.length : LOGO_FALLBACKS.length - 1;
        if (attemptIndex < maxAttempts) {
          setAttemptIndex(prev => prev + 1);
        } else {
          setIsFailed(true);
        }
      }}
    />
  );
}

const POSTER_FALLBACKS = [
  '/images/lottery_poster.jpg',
  '/assets/lottery_poster.jpg',
  '/images/lottery_login_poster_1784951984139.jpg',
  '/assets/lottery_login_poster_1784951984139.jpg'
];

export function SmartPosterBackground() {
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [isFailed, setIsFailed] = useState(false);

  const currentSrc = POSTER_FALLBACKS[attemptIndex];

  return (
    <div className="fixed inset-0 z-0 bg-[#080c14] overflow-hidden pointer-events-none">
      {!isFailed && currentSrc && (
        <img
          src={currentSrc}
          alt="Lottery Poster Background"
          className="w-full h-full object-cover scale-105 filter brightness-[0.55] contrast-125 transition-opacity duration-500"
          onError={() => {
            if (attemptIndex < POSTER_FALLBACKS.length - 1) {
              setAttemptIndex(prev => prev + 1);
            } else {
              setIsFailed(true);
            }
          }}
        />
      )}
      {/* High-tech glow and ambient lottery background layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/20 backdrop-blur-[1px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl" />
    </div>
  );
}
