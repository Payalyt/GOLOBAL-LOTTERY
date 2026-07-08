import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shuffle, Heart, Trash2, Plus, ChevronDown, Check, HelpCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth, getInitialGames } from '../context/AuthContext';
import { resolveBannerImage } from '../components/Hero';

interface Ticket {
  id: number;
  numbers: number[];
  isFavorite: boolean;
}

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
    prizes: [
      { label: 'Match any 7 Numbers', count: 7, prize: '$50,000,000' },
      { label: 'Match any 6 Numbers', count: 6, prize: '$45,000' },
      { label: 'Match any 5 Numbers', count: 5, prize: '$300' },
      { label: 'Match any 4 Numbers', count: 4, prize: '$20' },
      { label: 'Match any 3 Numbers', count: 3, prize: '$3' },
    ]
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
    prizes: [
      { label: 'Match any 5 Numbers', count: 5, prize: '$3,000,000' },
      { label: 'Match any 4 Numbers', count: 4, prize: '$25,000' },
      { label: 'Match any 3 Numbers', count: 3, prize: '$4,000' },
      { label: 'Match any 2 Numbers', count: 2, prize: '$100' },
    ]
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
    prizes: [
      { label: 'Match any 6 Numbers', count: 6, prize: '$4,000,000' },
      { label: 'Match any 5 Numbers', count: 5, prize: '$25,000' },
      { label: 'Match any 4 Numbers', count: 4, prize: '$4,000' },
      { label: 'Match any 3 Numbers', count: 3, prize: '$2' },
    ]
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
    prizes: [
      { label: 'Match any 5 Numbers', count: 5, prize: '$6,000 / Month for 25 Years' },
      { label: 'Match any 4 Numbers', count: 4, prize: '$20,500 Cash' },
      { label: 'Match any 3 Numbers', count: 3, prize: '$2,500 Cash' },
      { label: 'Match any 2 Numbers', count: 2, prize: '$50 Cash' },
    ]
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
    prizes: [
      { label: 'Match 1 Standard Order', count: 1, prize: '$10,000' },
      { label: 'Exact Match Digit', count: 1, prize: '$1,000 Guaranteed' }
    ]
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
    prizes: [
      { label: 'Match 2 Standard Order', count: 2, prize: '$25,000' },
      { label: 'Match 1 Digit', count: 1, prize: '$2,500 Cash' }
    ]
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
    prizes: [
      { label: 'Match All 3 Digits', count: 3, prize: '$50,000 Cash' },
      { label: 'Match Any 2 Digits', count: 2, prize: '$5,000 Cash' },
      { label: 'Match Any 1 Digit', count: 1, prize: '$500 Cash' }
    ]
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
    prizes: [
      { label: 'Correct Flag Pick', count: 1, prize: '$60,000' },
      { label: 'Consolation Bonus', count: 1, prize: '$1,000 Cash' }
    ]
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
    prizes: [
      { label: 'Match Both 2 Numbers', count: 2, prize: '$100,000' },
      { label: 'Match 1 Number', count: 1, prize: '$5,000 Cash' }
    ]
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
    prizes: [
      { label: 'Match any 6 Numbers', count: 6, prize: '$1,000,000' },
      { label: 'Match any 5 Numbers', count: 5, prize: '$10,000' },
      { label: 'Match any 4 Numbers', count: 4, prize: '$500' },
      { label: 'Match any 3 Numbers', count: 3, prize: '$10' },
    ]
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
    prizes: [
      { label: 'Top Prize', count: 1, prize: '$50,000' },
      { label: 'Instant Bonus', count: 1, prize: '$500' },
    ]
  }
};

export function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTickets } = useCart();
  const { isLoggedIn, user, dynamicGames, siteConfig } = useAuth();
  
  const gameNormalized = id?.replace(/-/g, '').replace(/\s+/g, '').toUpperCase() || 'EASY6';
  
  // Robust game matching falling back to hardcoded presets if not in database
  let game = dynamicGames.find(g => g.name.replace(/\s+/g, '').toUpperCase() === gameNormalized);
  if (!game) {
    const initialGames = getInitialGames();
    game = initialGames.find(g => g.name.replace(/\s+/g, '').toUpperCase() === gameNormalized);
  }
  if (!game) {
    game = dynamicGames.find(g => g.name === 'EASY6') || dynamicGames[0];
  }

  // Robust config mapping to prevent falling back to EASY6 when game name casing or spacing differs (e.g., MEGA7 vs MEGA 7)
  const configKey = Object.keys(gameConfigs).find(
    k => k.replace(/\s+/g, '').toUpperCase() === game.name.replace(/\s+/g, '').toUpperCase()
  );
  const config = (configKey ? gameConfigs[configKey] : null) || gameConfigs['EASY6'];
  const maxSelections = game.ballCount || config.maxSelections;
  const numRange = game.maxBallValue || config.numRange;
  const brandBg = config.brandBg;
  const brandText = config.brandText;
  const brandBorder = config.brandBorder;
  const brandLightBg = config.brandLightBg;
  const bannerGradient = config.bannerGradient;
  const ticketType = config.ticketType;

  // Resolve dynamic prizes or use config fallback
  let displayPrizes = game.prizeBreakdown && game.prizeBreakdown.length > 0
    ? game.prizeBreakdown
    : [...(config.prizes || [])];

  // Auto-sync first item with game's main jackpot prize if it exists
  if (displayPrizes.length > 0 && game.prize) {
    displayPrizes = [
      { ...displayPrizes[0], prize: game.prize },
      ...displayPrizes.slice(1)
    ];
  }

  // Dynamic banner background logic matching GameGrid logic for consistency
  // Priority: Explicit Image/Gradient -> Force Solid Switch -> Default Color
  let bannerStyle: React.CSSProperties = {};
  
  if (game.cardBgType === 'image' && game.cardBgImage) {
    bannerStyle = {
      backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.85) 100%), url(${resolveBannerImage(game.cardBgImage)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else if (game.cardBgType === 'gradient' && game.cardBgGradient) {
    bannerStyle = {
      background: game.cardBgGradient,
    };
  } else if (siteConfig.allGamesSolidBg || game.isSolidStyle || game.cardBgType === 'color') {
    const activeBgHex = siteConfig.allGamesSolidBg ? (siteConfig.allGamesSolidHex || '#1C2C80') : (game.bgHex || '#E52535');
    bannerStyle = { backgroundColor: activeBgHex };
  } else {
    // Default fallback - use class if nothing set
    bannerStyle = {};
  }

  const [tickets, setTickets] = useState<Ticket[]>([{ id: Date.now(), numbers: [], isFavorite: false }]);
  const [favoriteSets, setFavoriteSets] = useState<number[][]>(() => {
    const saved = localStorage.getItem(`favorites_${game.name}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Countdown simulation hook
  const [timeRemaining, setTimeRemaining] = useState({ days: 1, hours: 14, mins: 24, secs: 50 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return { days: 1, hours: 14, mins: 24, secs: 50 }; // reset / loop
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // FAQ collapse accordion state
  const [isFaqOpen, setIsFaqOpen] = useState(false);

  // Tickets helper modifications
  const addTicketUI = () => {
    setTickets([...tickets, { id: Date.now() + tickets.length, numbers: [], isFavorite: false }]);
  };

  const removeTicket = (ticketId: number) => {
    if (tickets.length <= 1) {
      setTickets([{ id: Date.now(), numbers: [], isFavorite: false }]);
      return;
    }
    setTickets(tickets.filter(t => t.id !== ticketId));
  };
  
  const handleAddToCart = () => {
    const validTickets = tickets.filter(t => t.numbers.length === maxSelections);
    if (validTickets.length === 0) {
      alert(`Please select exactly ${maxSelections} choices for at least one ticket first.`);
      return;
    }
    
    addTickets(validTickets.map(t => ({
      id: t.id,
      numbers: t.numbers,
      price: game.price,
      gameName: game.name,
      isFavorite: t.isFavorite
    })));
    navigate('/cart');
  };

  const toggleFavorite = (ticketId: number, currentNumbers: number[]) => {
    const currentTicket = tickets.find(t => t.id === ticketId);
    if (!currentTicket) return;

    if (currentNumbers.length < maxSelections) {
      alert(`Please select ${maxSelections} options before marking as favorite.`);
      return;
    }

    const isNowFavorite = !currentTicket.isFavorite;
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, isFavorite: isNowFavorite } : t));

    let updatedSets = [...favoriteSets];
    if (isNowFavorite) {
      if (!updatedSets.some(set => JSON.stringify([...set].sort()) === JSON.stringify([...currentNumbers].sort()))) {
        updatedSets.push([...currentNumbers]);
      }
    } else {
      updatedSets = updatedSets.filter(set => JSON.stringify([...set].sort()) !== JSON.stringify([...currentNumbers].sort()));
    }
    setFavoriteSets(updatedSets);
    localStorage.setItem(`favorites_${game.name}`, JSON.stringify(updatedSets));
  };

  const loadFavoriteSet = (ticketId: number, set: number[]) => {
    setTickets(tickets.map(t => t.id === ticketId ? { ...t, numbers: [...set] } : t));
  };

  const generateRandom = (ticketId: number) => {
    const randomNumbers = new Set<number>();
    while(randomNumbers.size < maxSelections) {
      if (ticketType === 'digits') {
        randomNumbers.add(Math.floor(Math.random() * 10));
      } else if (ticketType === 'flags') {
        randomNumbers.add(Math.floor(Math.random() * 36) + 1);
      } else {
        randomNumbers.add(Math.floor(Math.random() * numRange) + 1);
      }
    }
    updateTicketNumbers(ticketId, Array.from(randomNumbers).sort((a,b) => a-b));
  };

  const toggleNumber = (ticketId: number, num: number) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    let newNumbers = [...ticket.numbers];
    if (newNumbers.includes(num)) {
      newNumbers = newNumbers.filter(n => n !== num);
    } else if (newNumbers.length < maxSelections) {
      newNumbers.push(num);
    }
    updateTicketNumbers(ticketId, newNumbers);
  };

  const updateTicketNumbers = (ticketId: number, numbers: number[]) => {
    setTickets(tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, numbers };
      }
      return t;
    }));
  };

  const getGridValues = () => {
    if (ticketType === 'digits') {
      return Array.from({ length: 10 }).map((_, i) => i);
    }
    if (ticketType === 'flags') {
      return flagOptions.map(f => f.code);
    }
    return Array.from({ length: numRange }).map((_, i) => i + 1);
  };

  return (
    <div className="bg-[#FAF9FC] dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans pb-16">
      
      {/* Maximum Container Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR COLUMN: Styled Brand card matching premium mocks */}
          <div className="lg:col-span-3">
            <div 
              className={`rounded-[28px] ${!bannerStyle.background && !bannerStyle.backgroundColor && !bannerStyle.backgroundImage ? `bg-gradient-to-br ${bannerGradient}` : ''} p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[500px]`}
              style={bannerStyle}
            >
              
              {/* Decorative radial gradients inside */}
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-black/10 rounded-full blur-2xl pointer-events-none" />

              {/* Day & Logo area */}
              <div className="space-y-5 relative z-10">
                <span className="text-zinc-200/90 text-[10px] font-black tracking-widest uppercase block">
                  {game.drawTime} DRAW
                </span>

                {/* Styled Badge Pill looking like the Corporate Header Logo */}
                <div className="inline-flex bg-white text-zinc-950 font-sans font-black tracking-tighter rounded-full pl-5 pr-4 py-2 items-center gap-1.5 shadow-md">
                  <span className={`${brandText} text-sm tracking-wider uppercase font-extrabold italic`}>
                    {game.name.substring(0, game.name.length - 2)}
                  </span>
                  <span className={`w-5.5 h-5.5 rounded-full ${brandBg} text-white flex items-center justify-center font-bold text-xs font-mono select-none`}>
                    {game.name.slice(-1)}
                  </span>
                </div>
              </div>

              {/* Prize Value Info */}
              <div className="space-y-1 my-8 relative z-10">
                <span className="text-[10px] text-zinc-350 font-black tracking-widest uppercase block">
                  GRAND PRIZE
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-sans tracking-tight text-white leading-tight">
                  {game.prize}
                </div>
              </div>

              {/* Next Draw Countdown */}
              <div className="space-y-4 pt-4 border-t border-white/10 relative z-10">
                <span className="text-[10px] text-zinc-200/90 font-black tracking-widest uppercase block">
                  NEXT DRAW IN
                </span>

                {/* Digital Boxed Clock Layout matching mockup */}
                <div className="flex items-center gap-2 select-none">
                  
                  {/* Days */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/20 w-12 h-14 rounded-xl flex items-center justify-center font-sans font-black text-xl text-white shadow-inner">
                      {String(timeRemaining.days).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-300 tracking-wider mt-1.5 uppercase">DAYS</span>
                  </div>

                  <span className="text-white/40 font-bold self-start mt-4 animate-pulse shrink-0">:</span>

                  {/* Hours */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/20 w-12 h-14 rounded-xl flex items-center justify-center font-sans font-black text-xl text-white shadow-inner">
                      {String(timeRemaining.hours).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-300 tracking-wider mt-1.5 uppercase">HOURS</span>
                  </div>

                  <span className="text-white/40 font-bold self-start mt-4 animate-pulse shrink-0">:</span>

                  {/* Minutes */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/20 w-12 h-14 rounded-xl flex items-center justify-center font-sans font-black text-xl text-white shadow-inner">
                      {String(timeRemaining.mins).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-300 tracking-wider mt-1.5 uppercase">MINS</span>
                  </div>

                  <span className="text-white/40 font-bold self-start mt-4 animate-pulse shrink-0">:</span>

                  {/* Seconds */}
                  <div className="flex flex-col items-center">
                    <div className="bg-white/10 border border-white/20 w-12 h-14 rounded-xl flex items-center justify-center font-sans font-black text-xl text-white shadow-inner">
                      {String(timeRemaining.secs).padStart(2, '0')}
                    </div>
                    <span className="text-[9px] font-bold text-zinc-300 tracking-wider mt-1.5 uppercase">SECS</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* RIGHT MAIN WORKING PANELS: Tickets, selections & details matching Screenshots */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* Play Selection Container */}
            <div className="bg-white dark:bg-zinc-900 border border-[#E5E5EB] dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-sm">
              
              {/* Headline */}
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-[#0F0D24] dark:text-white uppercase tracking-wide">
                    Play {game.name}
                  </h2>
                  <div className="h-[2px] bg-zinc-800 w-12 mt-1.5 rounded-full" />
                </div>
                <span className="text-xs font-bold text-zinc-400 uppercase">
                  Select {maxSelections} {ticketType === 'flags' ? 'flags' : 'digits/numbers'}
                </span>
              </div>

              <span className="text-[10px] tracking-wider text-zinc-400 font-black uppercase block mb-4">Tickets</span>

              {/* Tickets Iterator Layout */}
              <div className="space-y-6">
                {tickets.map((ticket, idx) => (
                  <div key={ticket.id} className="border border-zinc-200 dark:border-zinc-800 rounded-[20px] p-5 sm:p-6 bg-white dark:bg-zinc-900/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors relative">
                    
                    {/* Header bar of ticket */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-zinc-950 dark:text-zinc-100 text-sm">Ticket {idx + 1}</span>
                        
                        {/* Favorites Selector Dropdown */}
                        {favoriteSets.length > 0 && (
                          <div className="relative group">
                            <button className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1">
                              My Favorites <ChevronDown className="w-3 h-3 text-zinc-400" />
                            </button>
                            {/* Hidden Dropdown list */}
                            <div className="absolute left-0 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg p-2 py-1 z-20 hidden group-hover:block min-w-[140px] text-xs">
                              {favoriteSets.map((set, setIdx) => (
                                <button
                                  key={setIdx}
                                  type="button"
                                  onClick={() => loadFavoriteSet(ticket.id, set)}
                                  className="w-full text-left font-mono font-bold py-1.5 px-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 tracking-wider flex items-center justify-between"
                                >
                                  <span>
                                    {ticketType === 'flags' 
                                      ? set.map(num => flagOptions.find(f => f.code === num)?.flag || num).join(' ')
                                      : set.join(', ')}
                                  </span>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-zinc-500">
                          Price per Ticket: <span className="text-zinc-950 dark:text-zinc-100 font-black">${game.price}</span>
                        </span>

                        {/* Interactive toolbox */}
                        <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                          {/* Shuffle Select */}
                          <button 
                            type="button" 
                            onClick={() => generateRandom(ticket.id)}
                            className={`p-2 rounded-lg hover:${brandLightBg} transition-colors text-zinc-400 hover:${brandText}`}
                            title="Quick Shuffle Set"
                          >
                            <Shuffle className="w-4 h-4" />
                          </button>

                          {/* Heart Favorite */}
                          <button 
                            type="button" 
                            onClick={() => toggleFavorite(ticket.id, ticket.numbers)}
                            className={`p-2 rounded-lg hover:${brandLightBg} transition-colors text-zinc-400 hover:text-red-500`}
                            title="Add to Favorite Sets"
                          >
                            <Heart className={`w-4 h-4 ${ticket.isFavorite ? 'text-red-500 fill-red-500' : ''}`} />
                          </button>

                          {/* Trash Remove */}
                          <button 
                            type="button" 
                            onClick={() => removeTicket(ticket.id)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-zinc-400 hover:text-red-650 hover:text-red-600 transition-colors"
                            title="Remove Ticket Slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Pre-selection circle indices summary with ? placeholders */}
                    <div className="flex flex-wrap gap-2.5 mb-6 justify-center bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl">
                      {Array.from({ length: maxSelections }).map((_, placeholderIdx) => {
                        const hasNum = ticket.numbers[placeholderIdx] !== undefined;
                        const sortedNumbers = [...ticket.numbers].sort((a,b) => a-b);
                        const numVal = sortedNumbers[placeholderIdx];

                        if (hasNum) {
                          const displayValue = ticketType === 'flags'
                            ? (flagOptions.find(f => f.code === numVal)?.flag || numVal)
                            : numVal;
                          return (
                            <span 
                              key={placeholderIdx}
                              className={`w-11 h-11 rounded-full font-sans font-extrabold text-[#000] bg-[#FFD700] hover:scale-105 transition-transform flex items-center justify-center shadow-md animate-scaleUp text-lg`}
                            >
                              {displayValue}
                            </span>
                          );
                        }
                        return (
                          <span 
                            key={placeholderIdx}
                          className="w-11 h-11 rounded-full font-mono font-bold text-sm text-zinc-400 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center select-none"
                          >
                            ?
                          </span>
                        );
                      })}
                    </div>

                    {/* Selections Grid adaptively matching numbers limit */}
                    <div className="w-full">
                      {ticketType === 'flags' ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-2.5">
                          {getGridValues().map((value) => {
                            const isSelected = ticket.numbers.includes(value);
                            const option = flagOptions.find(f => f.code === value);
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => toggleNumber(ticket.id, value)}
                                className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all border ${
                                  isSelected
                                    ? `${brandBg} text-white font-extrabold shadow-md border-transparent scale-102`
                                    : 'bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                }`}
                              >
                                <span className="text-2xl mb-1">{option?.flag}</span>
                                <span className="text-[10px] font-bold tracking-tight text-center leading-none truncate w-full mb-1">{option?.name}</span>
                                <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-black/25 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                }`}>
                                  #{value}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="grid grid-cols-5 sm:grid-cols-10 gap-x-2.5 gap-y-3 justify-items-center">
                          {getGridValues().map((value) => {
                            const isSelected = ticket.numbers.includes(value);
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => toggleNumber(ticket.id, value)}
                                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-extrabold font-sans transition-all active:scale-95 duration-100 ${
                                  isSelected
                                    ? `${brandBg} text-white font-black shadow-md transform scale-[1.05]`
                                    : 'bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-350/80 dark:hover:border-zinc-700'
                                }`}
                              >
                                {value}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>

              {/* Add Ticket Trigger Button */}
              <button 
                type="button"
                onClick={addTicketUI}
                className="mt-6 flex items-center justify-center gap-2 border border-zinc-350/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-black text-xs uppercase px-6 py-3.5 rounded-xl tracking-wider select-none leading-none shadow-sm transition-all active:scale-95 mx-auto"
              >
                <Plus className={`w-4 h-4 ${brandText} stroke-[3]`} />
                ADD MORE
              </button>

              <div className="h-[1px] bg-zinc-200/60 my-6" />

              {/* Draw Date Summary Portion */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-extrabold block mb-1">Draw Date</p>
                <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-350 font-semibold text-xs leading-none">
                  <span className={`w-2.5 h-2.5 rounded-full ${brandBg} inline-block shadow-sm`} />
                  <span>Next Draw: 19 June 2026 at 10:00 am</span>
                </div>
              </div>

              {/* Purchase Details Bar */}
              <div className="bg-[#F8F9FA] dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">Total Cart Price</span>
                  <div className="text-xl font-black text-zinc-950 dark:text-zinc-100 font-sans">
                    ${(tickets.filter(t => t.numbers.length === maxSelections).length * game.price).toFixed(2) || '0.00'}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleAddToCart}
                  className={`${brandBg} hover:opacity-95 text-white font-black text-xs tracking-widest uppercase p-4 px-8 rounded-xl leading-none scale-100 transition-transform active:scale-95 shadow-md`}
                >
                  ADD TO CART
                </button>
              </div>

            </div>

            {/* Prizes Matching List Block matching Screenshots exactly */}
            <div className="bg-white dark:bg-zinc-900 border border-[#E5E5EB] dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-sm">
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest block">
                    Prizes breakdown
                  </h3>
                  <div className="h-[2px] bg-zinc-400 w-8 mt-1 rounded-full" />
                </div>
              </div>

              <span className="text-[10px] tracking-wider text-zinc-400 font-black uppercase block mb-4">Main Draw</span>

              {/* Custom Sphere matches mockup list */}
              <div className="space-y-4 font-semibold text-xs sm:text-sm text-zinc-800 dark:text-zinc-300 leading-none">
                {displayPrizes.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900 transition-colors">
                    
                    {/* Display match text and balls row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <span className="text-zinc-[#0F0D24] dark:text-white font-bold shrink-0">{p.label}</span>
                      
                      <div className="flex gap-1 items-center">
                        {Array.from({ length: Math.max(5, maxSelections) }).map((_, ballIdx) => {
                          const isColored = ballIdx < p.count;
                          return (
                            <span 
                              key={ballIdx}
                              className={`w-4 h-4 rounded-full inline-block ${isColored ? brandBg : 'bg-zinc-200'}`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <span className={`text-right font-black font-sans text-sm ${brandText}`}>{p.prize}</span>
                  </div>
                ))}
              </div>
              
              <span className="text-[10px] text-zinc-400 block mt-4 font-semibold italic">* Prizes are shared</span>
            </div>

            {/* Embedded Mini Latest Results block matching screen 1 exactly */}
            <div className="bg-white dark:bg-zinc-900 border border-[#E5E5EB] dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-[#0F0D24] dark:text-zinc-100 uppercase tracking-wide">
                    {game.name} Latest Results
                  </h3>
                  <div className="h-[2px] bg-zinc-800 dark:bg-zinc-700 w-8 mt-1.5 rounded-full" />
                </div>

                <Link 
                  to={`/results/${game.name}`}
                  className="text-[10px] font-black tracking-widest text-zinc-500 hover:text-[#E21024] uppercase flex items-center gap-0.5 leading-none"
                >
                  View Details <span className="text-xs">→</span>
                </Link>
              </div>

              <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-950 transition-colors">
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block mb-3">Winning Combination</span>
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  {/* Drawing Green Balls row */}
                  <div className="flex flex-wrap gap-2">
                    {ticketType === 'flags' ? (
                      [1, 5, 12].map((num, i) => {
                        const opt = flagOptions.find(f => f.code === num);
                        return (
                          <span 
                            key={i}
                            className={`w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-2xl flex items-center justify-center shadow-sm select-none`}
                            title={opt?.name}
                          >
                            {opt?.flag}
                          </span>
                        );
                      })
                    ) : (
                      [3, 7, 12, 19, 21, 28, 35].slice(0, maxSelections).map((ballNum, i) => (
                        <span 
                          key={i}
                          className={`w-9 h-9 rounded-full ${brandBg} text-white font-sans font-black text-xs flex items-center justify-center shadow-sm select-none`}
                        >
                          {ballNum}
                        </span>
                      ))
                    )}
                  </div>

                  <div className="text-right flex flex-col justify-center sm:text-right leading-none">
                    <span className="text-xs text-zinc-400 font-bold block">12 June 2026</span>
                    <span className="text-xs font-black text-[#0F0D24] dark:text-zinc-100 block mt-1">214 Winners</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exclusive Ticket Unlock static Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0F0D24] via-[#1A163F] to-[#0A0818] p-6 sm:p-8 rounded-[28px] border border-[#2B245F] shadow-md">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-xl space-y-2 text-left">
                  <h4 className="text-lg sm:text-xl font-black text-white leading-tight uppercase">
                    YOUR TICKET UNLOCKED
                  </h4>
                  <p className="text-zinc-400 text-[10.5px] leading-relaxed font-semibold">
                    EXCLUSIVE OFFERS & SO MUCH MORE. Create a Golobal Account history log to reveal potential high frequency draw stats.
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={() => navigate('/register')}
                  className="bg-white hover:bg-zinc-100 text-[#0f0d24] font-black text-[10px] uppercase tracking-wider px-6 py-3 rounded-lg leading-none shrink-0"
                >
                  PLAY NOW
                </button>
              </div>
            </div>

            {/* Know More Collapsible section matching Screenshot 1 exactly */}
            <div className="bg-white dark:bg-zinc-900 border border-[#E5E5EB] dark:border-zinc-800 rounded-[28px] p-6 sm:p-8 shadow-sm">
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest block">
                    Know More About {game.name}
                  </h3>
                  <div className="h-[2px] bg-zinc-400 w-8 mt-1 rounded-full" />
                </div>
              </div>

              {/* Interactive Accordion Panel */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setIsFaqOpen(!isFaqOpen)}
                  className="w-full text-left p-4 bg-zinc-50 dark:bg-zinc-950 border-b border-transparent hover:bg-zinc-100/80 dark:hover:bg-zinc-900 transition-all font-black text-xs uppercase flex items-center justify-between text-zinc-800 dark:text-zinc-200"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-zinc-500" />
                    <span>How To Play?</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isFaqOpen ? 'rotate-180' : ''}`} />
                </button>

                {isFaqOpen && (
                  <div className="p-4 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed font-semibold space-y-2 select-text">
                    <p>
                      1. Select {maxSelections} {ticketType === 'flags' ? 'flags from the 36-nation map' : `different numbers out of the ${numRange} options`}.
                    </p>
                    <p>
                      2. Add as many ticket sets to your cart as needed to maximize probability ratios.
                    </p>
                    <p>
                      3. Tune in on {game.drawTime} draws where simulated randomizer sequences verify winners. Good Luck!
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

export default GameDetail;
