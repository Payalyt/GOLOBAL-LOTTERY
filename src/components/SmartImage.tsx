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
    <div className="fixed inset-0 z-0 bg-[#060911] overflow-hidden pointer-events-none">
      {!isFailed && currentSrc && (
        <img
          src={currentSrc}
          alt="Lottery Poster Background"
          className="w-full h-full object-cover scale-105 filter brightness-[0.45] contrast-125 transition-opacity duration-500"
          onError={() => {
            if (attemptIndex < POSTER_FALLBACKS.length - 1) {
              setAttemptIndex(prev => prev + 1);
            } else {
              setIsFailed(true);
            }
          }}
        />
      )}
      {/* High-tech casino glow and ambient lighting layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#060911] via-[#060911]/70 to-[#060911]/30 backdrop-blur-[2px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}

export function CasinoPosterShowcase({ className = "" }: { className?: string }) {
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [isFailed, setIsFailed] = useState(false);

  const currentSrc = POSTER_FALLBACKS[attemptIndex];

  return (
    <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden border-2 border-amber-500/40 shadow-[0_25px_60px_rgba(225,188,74,0.25)] bg-[#0c1220] flex flex-col justify-between p-6 sm:p-8 ${className}`}>
      {/* Poster Background Image */}
      {!isFailed && currentSrc ? (
        <img
          src={currentSrc}
          alt="Global Casino Lottery Poster"
          className="absolute inset-0 w-full h-full object-cover filter brightness-[0.75] contrast-125 transition-transform duration-700 hover:scale-105"
          onError={() => {
            if (attemptIndex < POSTER_FALLBACKS.length - 1) {
              setAttemptIndex(prev => prev + 1);
            } else {
              setIsFailed(true);
            }
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-zinc-950 to-rose-950" />
      )}

      {/* Vignette Overlay & Gold Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/40 to-transparent z-1" />
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-black/80 z-1" />

      {/* Top Header Row on Poster */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/50 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>🔥 LIVE CASINO LOTTERY</span>
        </div>
        <div className="bg-zinc-950/80 backdrop-blur-md border border-zinc-700 text-zinc-200 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
          24/7 INSTANT PAYOUTS
        </div>
      </div>

      {/* Center Grand Jackpot Display */}
      <div className="relative z-10 my-auto py-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-500/30 border border-amber-400/60 px-4 py-1.5 rounded-full text-amber-300 text-xs font-black uppercase tracking-[0.2em] shadow-inner mb-3">
          ✨ MEGA GRAND DRAW JACKPOT ✨
        </div>
        
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          $10,000,000
        </h3>
        <p className="text-xs sm:text-sm font-black text-amber-400 tracking-[0.3em] uppercase mt-1 drop-shadow">
          USDT / BDT MULTI-CURRENCY
        </p>

        {/* Live Draw Ticker Tags */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-sm">
          <span className="bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-[10px] font-black px-3 py-1 rounded-lg">
            🇹🇭 THAI GOVT LOTTERY
          </span>
          <span className="bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-[10px] font-black px-3 py-1 rounded-lg">
            🇦🇪 EMIRATES DRAW 50
          </span>
          <span className="bg-zinc-900/90 border border-amber-500/30 text-amber-300 text-[10px] font-black px-3 py-1 rounded-lg">
            ⚡ RUSH 3-MIN CASINO
          </span>
        </div>
      </div>

      {/* Bottom Features Footer on Poster */}
      <div className="relative z-10 grid grid-cols-3 gap-2 text-center pt-4 border-t border-amber-500/30 bg-zinc-950/60 backdrop-blur-md rounded-2xl p-3">
        <div>
          <div className="text-amber-400 font-black text-xs sm:text-sm">100%</div>
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">PROVEN FAIR</div>
        </div>
        <div>
          <div className="text-emerald-400 font-black text-xs sm:text-sm">⚡ 1-MIN</div>
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">FAST WITHDRAW</div>
        </div>
        <div>
          <div className="text-yellow-400 font-black text-xs sm:text-sm">🏆 VIP</div>
          <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">LEVEL 1 BONUS</div>
        </div>
      </div>
    </div>
  );
}
