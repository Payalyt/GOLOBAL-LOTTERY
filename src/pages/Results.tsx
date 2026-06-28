import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface GameConfig {
  maxSelections: number;
  numRange: number;
  brandBg: string;
  brandText: string;
  brandBorder: string;
  brandLightBg: string;
  bannerGradient: string;
  ticketType: 'numbers' | 'digits' | 'flags';
  prizes: { label: string; count: number; prize: string }[];
}

const flagOptions = [
  { flag: '🇦🇪', name: 'UAE', code: 1 },
  { flag: '🇸🇦', name: 'Saudi Arabia', code: 2 },
  { flag: '🇴🇲', name: 'Oman', code: 3 },
  { flag: '🇶🇦', name: 'Qatar', code: 4 },
  { flag: '🇧🇭', name: 'Bahrain', code: 5 },
  { flag: '🇰🇼', name: 'Kuwait', code: 6 },
  { flag: '🇮🇳', name: 'India', code: 7 },
  { flag: '🇵🇰', name: 'Pakistan', code: 8 },
  { flag: '🇧🇩', name: 'Bangladesh', code: 9 },
  { flag: '🇵🇭', name: 'Philippines', code: 10 },
  { flag: '🇱🇰', name: 'Sri Lanka', code: 11 },
  { flag: '🇳🇵', name: 'Nepal', code: 12 },
  { flag: '🇪🇬', name: 'Egypt', code: 13 },
  { flag: '🇬🇧', name: 'United Kingdom', code: 14 },
  { flag: '🇺🇸', name: 'United States', code: 15 },
  { flag: '🇨🇦', name: 'Canada', code: 16 },
  { flag: '🇦🇺', name: 'Australia', code: 17 },
  { flag: '🇩🇪', name: 'Germany', code: 18 },
  { flag: '🇫🇷', name: 'France', code: 19 },
  { flag: '🇧🇷', name: 'Brazil', code: 20 },
  { flag: '🇷🇺', name: 'Russia', code: 21 },
  { flag: '🇨🇳', name: 'China', code: 22 },
  { flag: '🇯🇵', name: 'Japan', code: 23 },
  { flag: '🇰🇷', name: 'South Korea', code: 24 },
  { flag: '🇸🇬', name: 'Singapore', code: 25 },
  { flag: '🇹🇷', name: 'Turkey', code: 26 },
  { flag: '🇮🇩', name: 'Indonesia', code: 27 },
  { flag: '🇲🇾', name: 'Malaysia', code: 28 },
  { flag: '🇿🇦', name: 'South Africa', code: 29 },
  { flag: '🇹🇭', name: 'Thailand', code: 30 },
  { flag: '🇻🇳', name: 'Vietnam', code: 31 },
  { flag: '🇪🇸', name: 'Spain', code: 32 },
  { flag: '🇮🇹', name: 'Italy', code: 33 },
  { flag: '🇳🇱', name: 'Netherlands', code: 34 },
  { flag: '🇨🇭', name: 'Switzerland', code: 35 },
  { flag: '🇮🇪', name: 'Ireland', code: 36 },
];

const gameConfigs: Record<string, GameConfig> = {
  'MEGA7': {
    maxSelections: 7,
    numRange: 49,
    brandBg: 'bg-[#DF1B2F]',
    brandText: 'text-[#DF1B2F]',
    brandBorder: 'border-[#DF1B2F]',
    brandLightBg: 'bg-red-50',
    bannerGradient: 'from-[#DF1B2F] via-[#9B0A16] to-[#3B0207]',
    ticketType: 'numbers',
    prizes: []
  },
  'WILD5': {
    maxSelections: 5,
    numRange: 37,
    brandBg: 'bg-[#1C2C80]',
    brandText: 'text-[#1C2C80]',
    brandBorder: 'border-[#1C2C80]',
    brandLightBg: 'bg-indigo-50',
    bannerGradient: 'from-[#1C2C80] via-[#151D48] to-[#0A0F29]',
    ticketType: 'numbers',
    prizes: []
  },
  'EASY6': {
    maxSelections: 6,
    numRange: 39,
    brandBg: 'bg-[#12A054]',
    brandText: 'text-[#12A054]',
    brandBorder: 'border-[#12A054]',
    brandLightBg: 'bg-green-50',
    bannerGradient: 'from-[#12A054] via-[#0D5E34] to-[#052E17]',
    ticketType: 'numbers',
    prizes: []
  },
  'FAST5': {
    maxSelections: 5,
    numRange: 42,
    brandBg: 'bg-[#0284C7]',
    brandText: 'text-[#0284C7]',
    brandBorder: 'border-[#0284C7]',
    brandLightBg: 'bg-sky-50',
    bannerGradient: 'from-[#0284C7] via-[#0369A1] to-[#0C4A6E]',
    ticketType: 'numbers',
    prizes: []
  },
  'SURE 1': {
    maxSelections: 1,
    numRange: 10,
    brandBg: 'bg-[#EC4899]',
    brandText: 'text-[#EC4899]',
    brandBorder: 'border-[#EC4899]',
    brandLightBg: 'bg-pink-50',
    bannerGradient: 'from-[#EC4899] via-[#DB2777] to-[#9D174D]',
    ticketType: 'digits',
    prizes: []
  },
  'SURE 2': {
    maxSelections: 2,
    numRange: 10,
    brandBg: 'bg-[#7C3AED]',
    brandText: 'text-[#7C3AED]',
    brandBorder: 'border-[#7C3AED]',
    brandLightBg: 'bg-purple-50',
    bannerGradient: 'from-[#7C3AED] via-[#6D28D9] to-[#4C1D95]',
    ticketType: 'digits',
    prizes: []
  },
  'SURE 3': {
    maxSelections: 3,
    numRange: 10,
    brandBg: 'bg-[#0D9488]',
    brandText: 'text-[#0D9488]',
    brandBorder: 'border-[#0D9488]',
    brandLightBg: 'bg-teal-50',
    bannerGradient: 'from-[#0D9488] via-[#0F766E] to-[#115E59]',
    ticketType: 'digits',
    prizes: []
  },
  'PICK 1': {
    maxSelections: 1,
    numRange: 36,
    brandBg: 'bg-[#8B5CF6]',
    brandText: 'text-[#8B5CF6]',
    brandBorder: 'border-[#8B5CF6]',
    brandLightBg: 'bg-violet-50',
    bannerGradient: 'from-[#8B5CF6] via-[#7C3AED] to-[#5B21B6]',
    ticketType: 'flags',
    prizes: []
  },
  'PICK 2': {
    maxSelections: 2,
    numRange: 20,
    brandBg: 'bg-[#F97316]',
    brandText: 'text-[#F97316]',
    brandBorder: 'border-[#F97316]',
    brandLightBg: 'bg-orange-50',
    bannerGradient: 'from-[#F97316] via-[#EA580C] to-[#C2410C]',
    ticketType: 'numbers',
    prizes: []
  },
  'LOTTERY': {
    maxSelections: 6,
    numRange: 45,
    brandBg: 'bg-[#F9A825]',
    brandText: 'text-[#F9A825]',
    brandBorder: 'border-[#F9A825]',
    brandLightBg: 'bg-yellow-50',
    bannerGradient: 'from-[#F9A825] via-[#F57F17] to-[#E65100]',
    ticketType: 'numbers',
    prizes: []
  },
  'SCRATCH CARDS': {
    maxSelections: 0,
    numRange: 0,
    brandBg: 'bg-[#9C27B0]',
    brandText: 'text-[#9C27B0]',
    brandBorder: 'border-[#9C27B0]',
    brandLightBg: 'bg-purple-50',
    bannerGradient: 'from-[#9C27B0] via-[#7B1FA2] to-[#4A148C]',
    ticketType: 'numbers',
    prizes: []
  }
};

export function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dynamicGames } = useAuth();
  
  const gameNormalized = id?.replace(/-/g, '').replace(/\s+/g, '').toUpperCase() || 'EASY6';
  const initialGame = dynamicGames.find(g => g.name.replace(/\s+/g, '').toUpperCase() === gameNormalized) || dynamicGames.find(g => g.name === 'EASY6') || dynamicGames[0];

  const [activeGame, setActiveGame] = useState(initialGame);

  // Sync state if param changes
  useEffect(() => {
    const matched = dynamicGames.find(g => g.name.replace(/\s+/g, '').toUpperCase() === gameNormalized);
    if (matched) {
      setActiveGame(matched);
    }
  }, [gameNormalized, dynamicGames]);

  const config = gameConfigs[activeGame.name] || gameConfigs['EASY6'];
  const maxSelections = config.maxSelections;
  const numRange = config.numRange;
  const brandBg = config.brandBg;
  const brandText = config.brandText;
  const bannerGradient = config.bannerGradient;
  const ticketType = config.ticketType;

  // Countdown timer hooks
  const [timeRemaining, setTimeRemaining] = useState({ days: 1, hours: 14, mins: 24, secs: 32 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return { days: 1, hours: 14, mins: 24, secs: 32 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getHistoricalDraws = (gameName: string) => {
    switch(gameName) {
      case 'MEGA7':
        return [
          { date: '14 June 2026', numbers: [4, 12, 18, 32, 49, 15, 21], totalWinners: '1,250 Players', totalPaid: '$45,000.00' },
          { date: '07 June 2026', numbers: [8, 11, 23, 27, 35, 42, 45], totalWinners: '1,090 Players', totalPaid: '$38,200.00' },
          { date: '31 May 2026', numbers: [1, 9, 14, 22, 30, 39, 48], totalWinners: '1,430 Players', totalPaid: '$53,100.00' },
          { date: '24 May 2026', numbers: [3, 7, 19, 25, 34, 41, 47], totalWinners: '990 Players', totalPaid: '$31,400.00' },
        ];
      case 'WILD5':
        return [
          { date: '13 June 2026', numbers: [5, 12, 19, 27, 35], totalWinners: '840 Players', totalPaid: '$18,500.00' },
          { date: '06 June 2026', numbers: [2, 10, 15, 22, 31], totalWinners: '750 Players', totalPaid: '$14,200.00' },
          { date: '30 May 2026', numbers: [1, 5, 12, 18, 29], totalWinners: '910 Players', totalPaid: '$21,000.00' },
        ];
      case 'EASY6':
        return [
          { date: '12 June 2026', numbers: [23, 11, 35, 39, 31, 25], totalWinners: '540 Players', totalPaid: '$4,512.00' },
          { date: '05 June 2026', numbers: [4, 18, 22, 29, 33, 9], totalWinners: '412 Players', totalPaid: '$3,110.00' },
          { date: '29 May 2026', numbers: [12, 15, 19, 21, 30, 37], totalWinners: '625 Players', totalPaid: '$5,980.00' },
          { date: '22 May 2026', numbers: [2, 10, 16, 27, 34, 38], totalWinners: '390 Players', totalPaid: '$3,400.00' },
        ];
      case 'FAST5':
        return [
          { date: '13 June 2026', numbers: [7, 14, 22, 35, 41], totalWinners: '640 Players', totalPaid: '1 Grand Winner (Monthly)' },
          { date: '06 June 2026', numbers: [3, 11, 25, 30, 39], totalWinners: '430 Players', totalPaid: '$11,000.00' },
          { date: '30 May 2026', numbers: [9, 15, 18, 26, 33], totalWinners: '580 Players', totalPaid: '$12,500.00' },
        ];
      case 'SURE 1':
        return [
          { date: '16 June 2026', numbers: [7], totalWinners: '3,210 Players', totalPaid: '$31,000.00' },
          { date: '15 June 2026', numbers: [4], totalWinners: '2,890 Players', totalPaid: '$27,500.00' },
          { date: '14 June 2026', numbers: [9], totalWinners: '3,100 Players', totalPaid: '$30,000.00' },
        ];
      case 'SURE 2':
        return [
          { date: '15 June 2026', numbers: [2, 9], totalWinners: '1,450 Players', totalPaid: '$36,000.00' },
          { date: '08 June 2026', numbers: [5, 0], totalWinners: '1,120 Players', totalPaid: '$29,000.00' },
          { date: '01 June 2026', numbers: [3, 7], totalWinners: '1,280 Players', totalPaid: '$32,000.00' },
        ];
      case 'SURE 3':
        return [
          { date: '11 June 2026', numbers: [1, 9, 5], totalWinners: '610 Players', totalPaid: '$52,000.00' },
          { date: '01 June 2026', numbers: [6, 2, 8], totalWinners: '480 Players', totalPaid: '$41,000.00' },
          { date: '21 May 2026', numbers: [3, 0, 7], totalWinners: '520 Players', totalPaid: '$44,500.00' },
        ];
      case 'PICK 1':
        return [
          { date: '16 June 2026', numbers: [1], totalWinners: '110 Players', totalPaid: '$60,000.00' },
          { date: '15 June 2026', numbers: [15], totalWinners: '95 Players', totalPaid: '$5,000.00' },
          { date: '14 June 2026', numbers: [7], totalWinners: '105 Players', totalPaid: '$6,000.00' },
        ];
      case 'PICK 2':
        return [
          { date: '16 June 2026', numbers: [4, 18], totalWinners: '125 Players', totalPaid: '$100,000.00' },
          { date: '15 June 2026', numbers: [7, 12], totalWinners: '88 Players', totalPaid: '$5,000.00' },
          { date: '14 June 2026', numbers: [3, 9], totalWinners: '102 Players', totalPaid: '$8,000.00' },
        ];
      case 'LOTTERY':
        return [
          { date: '16 June 2026', numbers: [5, 12, 19, 27, 33, 41], totalWinners: '241 Players', totalPaid: '$1,000,000.00' },
          { date: '09 June 2026', numbers: [1, 10, 15, 22, 38, 44], totalWinners: '189 Players', totalPaid: '$15,000.00' },
        ];
      case 'SCRATCH CARDS':
        return [
          { date: 'Instant', numbers: [], totalWinners: 'Thousands Daily', totalPaid: '$50,000.00' },
        ];
      default:
        return [
          { date: '16 June 2026', numbers: Array.from({ length: maxSelections }, (_, i) => (i * 5 + 3) % numRange + 1), totalWinners: '241 Players', totalPaid: '$2,100.00' },
        ];
    }
  };

  const currentDrawList = getHistoricalDraws(activeGame.name);
  const latestDraw = currentDrawList[0];
  const pastDraws = currentDrawList.slice(1);

  return (
    <div className="bg-[#FAF9FC] min-h-screen text-zinc-900 font-sans pb-16">
      
      {/* Maximum Container Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Quick Game Tabs Selector: Now listing ALL available games styled elegantly! */}
        <div className="flex gap-2 p-2 bg-zinc-200/50 rounded-2xl overflow-x-auto mb-8 shadow-inner max-w-full">
          {dynamicGames.map((g) => {
            const isSelected = activeGame.name === g.name;
            const liveConfig = gameConfigs[g.name] || gameConfigs['EASY6'];
            const tabColor = liveConfig.brandBg;
            return (
              <button
                key={g.name}
                type="button"
                onClick={() => {
                  if (g.name.startsWith('SURE ')) {
                    navigate(`/raffles/${g.name.toLowerCase().replace(/\s+/g, '')}`);
                  } else {
                    setActiveGame(g);
                    navigate(`/results/${g.name.toLowerCase().replace(/\s+/g, '')}`);
                  }
                }}
                className={`py-2 px-5 rounded-xl text-xs font-black tracking-wide whitespace-nowrap transition-all uppercase ${
                  isSelected ? `${tabColor} text-white shadow-md scale-102` : 'bg-transparent text-zinc-650 hover:bg-zinc-200 text-zinc-600'
                }`}
              >
                {g.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR COLUMN: Styled Brand Card */}
          <div className="lg:col-span-3">
            <div className={`rounded-[28px] bg-gradient-to-br ${bannerGradient} p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[520px]`}>
              
              {/* Decorative radial gradients inside */}
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-black/10 rounded-full blur-2xl pointer-events-none" />

              {/* Day & Logo area */}
              <div className="space-y-5 relative z-10">
                <span className="text-zinc-205/90 text-xs font-black tracking-widest uppercase block">
                  {activeGame.drawTime} DRAW
                </span>

                {/* Styled Badgelike Pill exactly matching branding */}
                <div className="inline-flex bg-white text-zinc-950 font-sans font-black tracking-tighter rounded-full pl-5 pr-4 py-2 items-center gap-1.5 shadow-md">
                  <span className={`${brandText} text-sm tracking-widest uppercase font-extrabold italic`}>
                    {activeGame.name.substring(0, activeGame.name.length - 2)}
                  </span>
                  <span className={`w-5.5 h-5.5 rounded-full ${brandBg} text-white flex items-center justify-center font-bold text-xs font-mono select-none`}>
                    {activeGame.name.slice(-1)}
                  </span>
                </div>
              </div>

              {/* Prize Value Info */}
              <div className="space-y-1 my-8 relative z-10">
                <span className="text-[10px] text-zinc-350 font-black tracking-widest uppercase block">
                  GRAND PRIZE
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight text-white leading-tight">
                  {activeGame.prize}
                </div>
              </div>

              {/* Next Draw Countdown */}
              <div className="space-y-5 pt-4 border-t border-white/10 relative z-10">
                <span className="text-[10px] text-zinc-200/90 font-black tracking-widest uppercase block">
                  NEXT DRAW
                </span>

                {/* Digital Clock Boxed Squares Layout */}
                <div className="flex items-center gap-2 select-none">
                  
                  {/* Days */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/20 w-11 h-13 rounded-xl flex items-center justify-center font-sans font-black text-lg text-white shadow-inner">
                      {String(timeRemaining.days).padStart(2, '0')}
                    </div>
                    <span className="text-[8.5px] font-bold text-zinc-300 tracking-wider mt-1.5 uppercase">DAYS</span>
                  </div>

                  <span className="text-white/40 font-bold self-start mt-3 animate-pulse shrink-0">:</span>

                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/20 w-11 h-13 rounded-xl flex items-center justify-center font-sans font-black text-lg text-white shadow-inner">
                      {String(timeRemaining.hours).padStart(2, '0')}
                    </div>
                    <span className="text-[8.5px] font-bold text-zinc-300 tracking-wider mt-1.5 uppercase">HOURS</span>
                  </div>

                  <span className="text-white/40 font-bold self-start mt-3 animate-pulse shrink-0">:</span>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/20 w-11 h-13 rounded-xl flex items-center justify-center font-sans font-black text-lg text-white shadow-inner">
                      {String(timeRemaining.mins).padStart(2, '0')}
                    </div>
                    <span className="text-[8.5px] font-bold text-zinc-300 tracking-wider mt-1.5 uppercase">MINS</span>
                  </div>

                  <span className="text-white/40 font-bold self-start mt-3 animate-pulse shrink-0">:</span>

                  {/* Seconds */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/20 w-11 h-13 rounded-xl flex items-center justify-center font-sans font-black text-lg text-white shadow-inner">
                      {String(timeRemaining.secs).padStart(2, '0')}
                    </div>
                    <span className="text-[8.5px] font-bold text-zinc-300 tracking-wider mt-1.5 uppercase">SECS</span>
                  </div>

                </div>

                {/* PLAY NOW BUTTON */}
                <Link
                  to={`/games/${activeGame.name}`}
                  className="bg-[#0f0d24] text-white hover:bg-[#1a1738] tracking-widest uppercase text-[10.5px] font-black py-4 px-6 rounded-full w-full block text-center shadow-md transition-transform active:scale-95 duration-100 mt-6"
                >
                  PLAY FOR ${activeGame.price}
                </Link>
              </div>

            </div>
          </div>

          {/* RIGHT MAIN DRAW RESULTS LISTING PANEL: Matches Mockup exactly */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Back to Play anchor link */}
            <div className="flex justify-start">
              <Link 
                to={`/games/${activeGame.name}`}
                className="inline-flex items-center gap-1.5 text-xs font-black text-zinc-500 hover:text-zinc-950 uppercase tracking-wider transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400 stroke-[3]" />
                Back to Game Selection
              </Link>
            </div>

            {/* Results Display Area Card Container */}
            <div className="bg-white border border-[#E5E5EB] rounded-[28px] p-6 sm:p-8 shadow-sm">
              
              {/* Headline */}
              <div className="pb-4 border-b border-zinc-100 flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#0F0D24] uppercase tracking-wide">
                    {activeGame.name} Draw Results
                  </h2>
                  <div className="h-[2px] bg-zinc-800 w-12 mt-1.5 rounded-full" />
                </div>
              </div>

              {/* Winning Combination box */}
              <div className="border border-zinc-200/80 rounded-2xl p-6 sm:p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                <span className="text-[10.5px] text-zinc-400 font-black uppercase tracking-wider block mb-4">LATEST COMBINATION</span>
                
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  {/* Big winning range balls */}
                  <div className="flex flex-wrap gap-2.5">
                    {ticketType === 'flags' ? (
                      latestDraw.numbers.map((val, i) => {
                        const opt = flagOptions.find(f => f.code === val);
                        return (
                          <div key={i} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-3 rounded-xl shadow-sm animate-fadeIn">
                            <span className="text-3xl">{opt?.flag}</span>
                            <span className="text-xs font-black text-zinc-850 uppercase">{opt?.name}</span>
                          </div>
                        );
                      })
                    ) : (
                      latestDraw.numbers.map((ballNum, i) => (
                        <span 
                          key={i}
                          className={`w-12 h-12 rounded-full ${brandBg} text-white font-sans font-black text-sm flex items-center justify-center shadow-md select-none animate-fadeIn`}
                        >
                          {ballNum}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Draw date context and counts */}
                  <div className="text-left md:text-right shrink-0">
                    <span className="text-zinc-400 font-bold text-xs flex items-center md:justify-end gap-1 font-sans">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      {latestDraw.date}
                    </span>
                    <div className="mt-2 text-xs font-black text-[#0F0D24]">
                      Total Winners: <span className="font-sans font-extrabold text-[#12A054] text-sm ml-0.5">{latestDraw.totalWinners}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Border Row with total sum payouts */}
                <div className="mt-6 pt-5 border-t border-zinc-100/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-zinc-500">
                  <span>Guaranteed Drawing Matching Ref: <span className="font-mono text-zinc-900 font-extrabold select-all">EMD-2941-XQ9</span></span>
                  <span>Total Prizes Disbursed: <span className="text-green-650 font-black text-sm text-zinc-950">{latestDraw.totalPaid}</span></span>
                </div>
              </div>

              {/* Past Results list */}
              <div className="mt-12 mb-6">
                <h3 className="text-sm font-black text-zinc-950 uppercase tracking-widest block">
                  Past Drawing Records
                </h3>
                <div className="h-[2px] bg-zinc-400 w-8 mt-1.5 rounded-full" />
              </div>

              {/* Preceding past draws sequence listing */}
              <div className="space-y-4">
                {pastDraws.map((past, i) => (
                  <div 
                    key={i} 
                    className="border border-zinc-200 hover:border-zinc-350/80 rounded-[20px] p-5 sm:p-6 bg-white hover:bg-zinc-50/20 transition-all flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5"
                  >
                    
                    {/* Left: Drawn date */}
                    <div className="flex items-center gap-2 font-sans font-bold text-xs text-zinc-500 min-w-[120px]">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <span>{past.date}</span>
                    </div>

                    {/* Middle: Drawn balls */}
                    <div className="flex flex-wrap gap-1.5">
                      {ticketType === 'flags' ? (
                        past.numbers.map((val, idx) => {
                          const opt = flagOptions.find(f => f.code === val);
                          return (
                            <span key={idx} className="text-2xl" title={opt?.name}>{opt?.flag}</span>
                          );
                        })
                      ) : (
                        past.numbers.map((ballNum, j) => (
                          <span 
                            key={j}
                            className={`w-8 h-8 rounded-full ${brandBg} text-white font-sans font-black text-[11px] flex items-center justify-center shadow-sm select-none`}
                          >
                            {ballNum}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Right: Stats values */}
                    <div className="flex items-center gap-5 text-[11px] font-bold text-zinc-505 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 w-full lg:w-auto justify-between lg:justify-end">
                      <span>Total Winners: <span className="text-zinc-900 font-extrabold">{past.totalWinners}</span></span>
                      <span>Total Paid: <span className="text-zinc-900 font-black">{past.totalPaid}</span></span>
                    </div>

                  </div>
                ))}
              </div>

              {/* Flat Pagination Controls exactly matching mockup */}
              <div className="flex items-center justify-center gap-1.5 mt-8 select-none">
                <button type="button" className="w-7 h-7 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 flex items-center justify-center text-xs">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                
                <button type="button" className="w-7 h-7 rounded-lg bg-[#0F0D24] text-white font-black text-xs">01</button>
                <button type="button" className="w-7 h-7 rounded-lg text-zinc-650 font-bold hover:bg-zinc-100/50 text-xs">02</button>
                <button type="button" className="w-7 h-7 rounded-lg text-zinc-650 font-bold hover:bg-zinc-100/50 text-xs">03</button>
                <span className="text-zinc-350 text-xs px-1">...</span>
                <button type="button" className="w-7 h-7 rounded-lg text-zinc-650 font-bold hover:bg-zinc-100/50 text-xs">09</button>

                <button type="button" className="w-7 h-7 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 flex items-center justify-center text-xs">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

export default Results;
