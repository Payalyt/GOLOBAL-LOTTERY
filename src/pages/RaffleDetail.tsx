import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, ArrowLeft, ArrowRight, Check, Sparkles, Smile, Trophy, Award, Search, Info } from 'lucide-react';

interface WinnerProfile {
  name: string;
  initials: string;
  prize: string;
  date: string;
  avatarBg: string;
}

interface DrawResult {
  raffle: string;
  raffleId: string;
  date: string;
  winnerName: string;
  nationality: string;
  flag: string;
  prize: string;
}

interface RaffleConfig {
  name: string;
  title: string;
  prizeAmount: string;
  pricePerTicket: number;
  textColor: string;
  bgColor: string;
  gradientBg: string;
  btnHoverColor: string;
  bannerRibbon: string;
  ticketsTotal: number;
  ticketsLeft: number;
  ticketPrefix: string;
  ticketStartNum: number;
  winners: WinnerProfile[];
  results: DrawResult[];
}

const raffleConfigs: Record<string, RaffleConfig> = {
  'SURE 1': {
    name: 'SURE 1',
    title: 'SURE1: Keep it simple, keep it SURE! There will be a winner.',
    prizeAmount: '$30,000',
    pricePerTicket: 10,
    textColor: 'text-pink-600',
    bgColor: 'bg-pink-600',
    gradientBg: 'from-pink-500 via-pink-600 to-pink-700',
    btnHoverColor: 'hover:bg-pink-50',
    bannerRibbon: 'bg-[#FFEB4A] text-zinc-900', // yellow accent
    ticketsTotal: 5000,
    ticketsLeft: 4547,
    ticketPrefix: 'SR1',
    ticketStartNum: 3,
    winners: [
      { name: 'Muhammed Parambil', initials: 'MP', prize: '$30,000', date: '10 June 2026', avatarBg: 'bg-[#E3F2FD] text-[#1E88E5]' },
      { name: 'Deepak Belvadi', initials: 'DB', prize: '$30,000', date: '1 March 2026', avatarBg: 'bg-[#E1BEE7] text-[#8E24AA]' },
      { name: 'Dineshan KV', initials: 'DK', prize: '$30,000', date: '12 January 2026', avatarBg: 'bg-[#C8E6C9] text-[#2E7D32]' },
      { name: 'Vikash Goyal', initials: 'VG', prize: '$30,000', date: '30 November 2025', avatarBg: 'bg-[#FFF9C4] text-[#F57F17]' },
      { name: 'Vetrivel Murugan', initials: 'VM', prize: '$30,000', date: '4 November 2025', avatarBg: 'bg-[#FFE0B2] text-[#E65100]' },
      { name: 'Mohamed Ismail', initials: 'MI', prize: '$30,000', date: '14 October 2025', avatarBg: 'bg-[#E0F7FA] text-[#00838F]' },
    ],
    results: [
      { raffle: 'SR1-2', raffleId: '59473773', date: '10 June 2026', winnerName: 'MUHAMMED SHUIBE ALIK', nationality: 'India', flag: '🇮🇳', prize: '$30,000' },
      { raffle: 'SR1-1', raffleId: 'TKT-26798559', date: '1 March 2026', winnerName: 'DEEPAK BELVADI', nationality: 'India', flag: '🇮🇳', prize: '$30,000' },
      { raffle: 'SRL-7', raffleId: 'TKT-26602058', date: '12 January 2026', winnerName: 'DINESHAN KV', nationality: 'Qatar', flag: '🇶🇦', prize: '$30,000' },
      { raffle: 'SRL-6', raffleId: 'TKT-26338170', date: '30 November 2025', winnerName: 'Vikash goyal', nationality: 'India', flag: '🇮🇳', prize: '$30,000' },
      { raffle: 'SRL-5', raffleId: 'TKT-26046904', date: '4 November 2025', winnerName: 'VC Vetrivelmurugan', nationality: 'India', flag: '🇮🇳', prize: '$30,000' },
    ]
  },
  'SURE 2': {
    name: 'SURE 2',
    title: 'SURE2: A stronger play, the same SURE promise! One winner is guaranteed.',
    prizeAmount: '$50,000',
    pricePerTicket: 15,
    textColor: 'text-purple-600',
    bgColor: 'bg-[#7C3AED]',
    gradientBg: 'from-purple-500 via-purple-600 to-purple-750',
    btnHoverColor: 'hover:bg-purple-50',
    bannerRibbon: 'bg-[#FFEB4A] text-zinc-900', // yellow accent
    ticketsTotal: 5000,
    ticketsLeft: 3561,
    ticketPrefix: 'SR2',
    ticketStartNum: 2,
    winners: [
      { name: 'Mariajohn Sathish', initials: 'MS', prize: '$50,000', date: '12 April 2026', avatarBg: 'bg-[#E3F2FD] text-[#1E88E5]' },
      { name: 'Imran Khan', initials: 'IK', prize: '$50,000', date: '28 December 2025', avatarBg: 'bg-[#FFE0B2] text-[#E65100]' },
      { name: 'Prabhakar Naik', initials: 'PN', prize: '$50,000', date: '28 December 2025', avatarBg: 'bg-[#E1BEE7] text-[#8E24AA]' },
    ],
    results: [
      { raffle: 'SR2-1', raffleId: 'TKT-26646136', date: '12 April 2026', winnerName: 'Mariajohn Sathish', nationality: 'India', flag: '🇮🇳', prize: '$50,000' },
      { raffle: 'SRL-4', raffleId: 'TKT-26100246', date: '28 December 2025', winnerName: 'PRABHAKAR NAIK', nationality: 'Saudi Arabia', flag: '🇸🇦', prize: '$50,000' },
      { raffle: 'SRL-3', raffleId: 'TKT-26409076', date: '28 December 2025', winnerName: 'Imran khan', nationality: 'India', flag: '🇮🇳', prize: '$50,000' },
    ]
  },
  'SURE 3': {
    name: 'SURE 3',
    title: 'SURE3: The ultimate triple draw! High stakes, guaranteed triumph.',
    prizeAmount: '$100,000',
    pricePerTicket: 30,
    textColor: 'text-teal-600',
    bgColor: 'bg-[#0D9488]',
    gradientBg: 'from-teal-500 via-teal-600 to-teal-700',
    btnHoverColor: 'hover:bg-teal-50',
    bannerRibbon: 'bg-[#FFEB4A] text-zinc-900', // yellow accent
    ticketsTotal: 5000,
    ticketsLeft: 2943,
    ticketPrefix: 'SR3',
    ticketStartNum: 1,
    winners: [
      { name: 'Vetrivel Murugan', initials: 'VM', prize: '$100,000', date: '1 June 2026', avatarBg: 'bg-[#E1BEE7] text-[#8E24AA]' },
      { name: 'Dineshan KV', initials: 'DK', prize: '$100,000', date: '15 May 2026', avatarBg: 'bg-[#C8E6C9] text-[#2E7D32]' },
      { name: 'Vikash Goyal', initials: 'VG', prize: '$100,000', date: '1 May 2026', avatarBg: 'bg-[#FFF9C4] text-[#F57F17]' },
    ],
    results: [
      { raffle: 'SR3-1', raffleId: 'TKT-27419111', date: '1 June 2026', winnerName: 'Vetrivel Murugan', nationality: 'India', flag: '🇮🇳', prize: '$100,000' },
      { raffle: 'SRL-8', raffleId: 'TKT-25310182', date: '15 May 2026', winnerName: 'DINESHAN KV', nationality: 'Qatar', flag: '🇶🇦', prize: '$100,000' },
      { raffle: 'SRL-2', raffleId: 'TKT-24381023', date: '1 May 2026', winnerName: 'Vikash Goyal', nationality: 'India', flag: '🇮🇳', prize: '$100,000' },
    ]
  }
};

export function RaffleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTickets } = useCart();
  const { isLoggedIn, user } = useAuth();
  
  // Normalize params to match SURE 1, SURE 2, or SURE 3
  const normalizedId = id ? id.replace(/-/g, '').replace(/\s+/g, '').toUpperCase() : '';
  let activeKey = 'SURE 1';
  if (normalizedId.includes('2') || normalizedId.includes('SURE2')) {
    activeKey = 'SURE 2';
  } else if (normalizedId.includes('3') || normalizedId.includes('SURE3')) {
    activeKey = 'SURE 3';
  }
  
  const config = raffleConfigs[activeKey];
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedResult, setSelectedResult] = useState<DrawResult | null>(null);
  
  const [selectionMode, setSelectionMode] = useState<'quick' | 'manual'>('quick');
  const [manualDigits, setManualDigits] = useState<number[][]>([[0]]);

  // Set window title dynamically
  useEffect(() => {
    document.title = `${config.name} | Golobal Lottery`;
    setTicketCount(1);
    setSelectionMode('quick');
    setCurrentPage(1);
  }, [config]);

  // Sync manualDigits with ticketCount
  useEffect(() => {
    const length = 4; // User requested 4 digit selection
    setManualDigits(prev => {
      const next = [...prev];
      if (next.length < ticketCount) {
        for (let i = next.length; i < ticketCount; i++) {
          next.push(Array.from({ length }).map(() => 0));
        }
      } else if (next.length > ticketCount) {
        return next.slice(0, ticketCount);
      }
      return next;
    });
  }, [ticketCount, config]);

  const handleIncrement = () => setTicketCount(prev => prev + 1);
  const handleDecrement = () => setTicketCount(prev => Math.max(1, prev - 1));

  // Generate dynamic Ticket Codes based on count
  const generateTicketCodes = (): string[] => {
    const codes: string[] = [];
    for (let i = 0; i < ticketCount; i++) {
      codes.push(`${config.ticketPrefix}-${(config.ticketStartNum + i).toString().padStart(4, '0')}`);
    }
    return codes;
  };

  const handleAddToCart = () => {
    const codes = generateTicketCodes();
    const length = 4;
    
    // Create cart ticket elements
    const ticketsToAdd = codes.map((code, idx) => {
      const digitNumbers = selectionMode === 'manual'
        ? (manualDigits[idx] || Array.from({ length }).map(() => 0))
        : Array.from({ length }).map(() => Math.floor(Math.random() * 10));
      
      return {
        id: Date.now() + idx,
        numbers: digitNumbers, // compatible with Cart.tsx render circles
        gameName: config.name,
        price: config.pricePerTicket,
        isFavorite: false
      };
    });
    
    addTickets(ticketsToAdd);
    navigate('/cart');
  };

  const percentageLeft = (config.ticketsLeft / config.ticketsTotal) * 100;

  // Search filter results
  const filteredResults = config.results.filter(
    res =>
      res.raffle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.raffleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.winnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.nationality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#FAF9FC] dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans pb-16">
      
      {/* Upper breadcrumb & quick info */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-150 dark:border-zinc-800 py-3 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex gap-4">
            <Link to="/raffles/sure1" className={`text-xs font-bold px-3 py-1 rounded transition-colors ${config.name === 'SURE 1' ? 'bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300' : 'text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>SURE 1</Link>
            <Link to="/raffles/sure2" className={`text-xs font-bold px-3 py-1 rounded transition-colors ${config.name === 'SURE 2' ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300' : 'text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>SURE 2</Link>
            <Link to="/raffles/sure3" className={`text-xs font-bold px-3 py-1 rounded transition-colors ${config.name === 'SURE 3' ? 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300' : 'text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>SURE 3</Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT side - Purchasing Sidebar Widget (35% width on desktop) */}
          <div className="lg:col-span-4 w-full">
            <div className={`p-6 sm:p-8 rounded-3xl text-white shadow-xl bg-gradient-to-b ${config.gradientBg} relative overflow-hidden transition-all duration-300`}>
              
              {/* Floating aesthetic background shape */}
              <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-white bg-opacity-10 pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-40 h-40 rounded-full bg-white bg-opacity-5 pointer-events-none" />
              
              {/* Game Badge */}
              <div className="inline-block bg-white bg-opacity-20 backdrop-blur-md text-xs font-black tracking-widest px-3.5 py-1.5 rounded-full uppercase mb-4 shadow-inner">
                {config.name} Raffle Draw
              </div>
              
              {/* Prize Details */}
              <div className="space-y-1 mb-6">
                <span className="text-[11px] font-bold text-white/80 tracking-wider block uppercase">Guaranteed Grand Prize</span>
                <h1 className="text-4xl sm:text-5xl font-black font-sans tracking-tight leading-none">
                  {config.prizeAmount}
                </h1>
                <p className="text-xs text-white/90 font-medium">Exciting prize with every draw</p>
              </div>

              {/* Tickets Progress */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-5 border border-white/15 mb-6 shadow-inner">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-white/70 uppercase mb-2">
                  <span>Tickets Sold</span>
                  <span className="font-mono text-white">{config.ticketsTotal - config.ticketsLeft} / {config.ticketsTotal}</span>
                </div>
                <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${100 - percentageLeft}%` }}
                  />
                </div>
                <p className="text-[10px] text-yellow-300 font-black block text-right mt-2 tracking-wide uppercase">
                  {config.ticketsLeft} Opportunities Left
                </p>
              </div>

              {/* Ticket selector pricing structure */}
              <div className="space-y-5">
                
                {/* Price Per Ticket row */}
                <div className="flex justify-between items-center text-sm border-b border-white/20 pb-3">
                  <span className="text-white/85 font-medium">Price per ticket</span>
                  <span className="font-mono font-black text-lg">${config.pricePerTicket}.00</span>
                </div>

                {/* Amount counters */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-white/80 tracking-wider uppercase block">Ticket Quantity</label>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleDecrement}
                      className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white font-black text-2xl flex items-center justify-center border border-white/20 select-none shadow-sm"
                    >
                      -
                    </button>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl text-zinc-950 dark:text-zinc-100 font-mono font-black text-lg px-6 py-3 shrink-0 flex items-center justify-center min-w-[70px] shadow-inner">
                      {ticketCount}
                    </div>
                    <button 
                      onClick={handleIncrement}
                      className="w-12 h-12 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white font-black text-2xl flex items-center justify-center border border-white/20 select-none shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Drawn Codes Row */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black tracking-widest text-white/85 uppercase block">YOUR ASSIGNED CODES:</span>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                    {generateTicketCodes().map((code) => (
                      <span key={code} className="bg-white/90 dark:bg-zinc-900/90 px-3 py-1.5 rounded-lg text-sm font-mono font-black text-zinc-950 dark:text-zinc-100 border border-white/20 dark:border-zinc-800 uppercase shadow-md">
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Selection Mode Toggle */}
                <div className="bg-white/10 p-1 rounded-xl flex border border-white/10 my-3">
                  <button
                    type="button"
                    onClick={() => setSelectionMode('quick')}
                    className={`flex-1 py-1.5 px-2.5 text-[9px] font-black uppercase rounded-lg transition-all ${
                      selectionMode === 'quick' ? 'bg-white text-zinc-950 font-black shadow-sm' : 'text-white/85 hover:text-white'
                    }`}
                  >
                    Quick Random
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode('manual')}
                    className={`flex-1 py-1.5 px-2.5 text-[9px] font-black uppercase rounded-lg transition-all ${
                      selectionMode === 'manual' ? 'bg-white text-zinc-950 font-black shadow-sm' : 'text-white/85 hover:text-white'
                    }`}
                  >
                    Select Numbers
                  </button>
                </div>

                {/* Manual Digits grid */}
                {selectionMode === 'manual' && (
                  <div className="bg-black/20 border border-white/10 p-3 rounded-xl space-y-3 my-2 max-h-[220px] overflow-y-auto text-left">
                    <span className="text-[9px] font-black tracking-widest text-yellow-300 uppercase block">Choose Your Numbers:</span>
                    {Array.from({ length: ticketCount }).map((_, tIdx) => {
                      const ticketDigits = manualDigits[tIdx] || Array.from({ length: 4 }).map(() => 0);
                      return (
                        <div key={tIdx} className="border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
                          <div className="text-[8px] text-white/70 font-bold uppercase tracking-wider mb-1.5">Ticket #{tIdx + 1} ({generateTicketCodes()[tIdx]}):</div>
                          <div className="flex gap-2">
                            {ticketDigits.map((digit, dIdx) => (
                              <div key={dIdx} className="flex-1 space-y-1">
                                <div className="text-[8px] text-yellow-300/85 font-black uppercase tracking-tight text-center">Digit {dIdx + 1}</div>
                                <div className="grid grid-cols-5 gap-1">
                                  {Array.from({ length: 10 }).map((_, val) => {
                                    const isDigitSelected = digit === val;
                                    return (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => {
                                          setManualDigits(prev => {
                                            const next = [...prev];
                                            if (!next[tIdx]) {
                                              const length = 4;
                                              next[tIdx] = Array.from({ length }).map(() => 0);
                                            }
                                            const updatedTicket = [...next[tIdx]];
                                            updatedTicket[dIdx] = val;
                                            next[tIdx] = updatedTicket;
                                            return next;
                                          });
                                        }}
                                        className={`py-1 text-center font-mono font-bold text-[10px] rounded transition-all ${
                                          isDigitSelected ? 'bg-yellow-300 text-zinc-950 font-black shadow-inner scale-102' : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                      >
                                        {val}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Total Cost Display */}
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-xs font-bold tracking-wider text-white/80 uppercase">Total Amount:</span>
                  <span className="text-3xl font-black font-sans text-yellow-300">
                    ${(ticketCount * config.pricePerTicket).toFixed(2)}
                  </span>
                </div>

                {/* Big Purchase button */}
                <button 
                  onClick={handleAddToCart}
                  className={`w-full bg-white text-zinc-950 font-black text-sm tracking-widest px-4 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all uppercase flex items-center justify-center gap-2 block ${config.btnHoverColor} active:scale-98`}
                >
                  <Trophy className="w-4 h-4 text-zinc-950" /> ADD TO CART
                </button>

              </div>

            </div>
          </div>

          {/* RIGHT side - Main Visual Showcase of Results and Winners */}
          <div className="lg:col-span-8 w-full space-y-8">
            
            {/* Top White Card: Header and Profile Showcase */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-150 dark:border-zinc-800">
              
              {/* Slogan details and ribbon */}
              <div className="space-y-4 mb-6">
                <span className="text-xs font-black tracking-widest text-zinc-400 uppercase font-mono">GUARANTEED TO DRAW WINNER</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {config.title}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100/60 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-extrabold text-xs  uppercase tracking-wide rounded-full font-sans">
                  <Sparkles className="w-3.5 h-3.5" /> 1 WINNER OF {config.prizeAmount} EACH TIME
                </div>
              </div>

              <hr className="border-gray-100 dark:border-zinc-800 my-6" />

              {/* Winners profile block */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Previous Winners</h3>
                  <Link to="/winners" className="text-xs font-extrabold text-[#E52535] hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Grid model circles */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
                  {config.winners.map((win, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 dark:bg-zinc-950 border border-gray-100 dark:border-zinc-850 hover:shadow-sm transition-shadow">
                      {/* Initials circle */}
                      <div className={`w-12 h-12 rounded-full ${win.avatarBg} flex items-center justify-center font-black text-sm uppercase shadow-inner mb-2.5`}>
                        {win.initials}
                      </div>
                      
                      {/* Sub-badge */}
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-indigo-100 text-[#4754EB] rounded-full scale-90 mb-1 leading-none tracking-wide text-center truncate w-full">
                        Raffle Winner
                      </span>
                      
                      {/* Details text */}
                      <p className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 truncate w-full mb-0.5 leading-tight">{win.name}</p>
                      <p className="text-[10px] font-black text-emerald-600 block leading-none mb-1">{win.prize}</p>
                      <p className="text-[9px] text-zinc-400 block leading-none truncate w-full">{win.date}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom White Card: Draw History Results Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-150 dark:border-zinc-800">
              
              {/* Section Header with searching */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-black tracking-tight uppercase text-zinc-900 dark:text-zinc-100">Draw Results</h2>
                  <p className="text-xs text-zinc-500 font-medium">Verify official entries from preceding draws</p>
                </div>
                
                {/* Search field */}
                <div className="relative max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search results..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 pl-9 pr-4 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto rounded-xl border border-gray-150 dark:border-zinc-800 shadow-inner">
                <table className="min-w-full divide-y divide-gray-150 dark:divide-zinc-800 text-left">
                  <thead className="bg-gray-50 dark:bg-zinc-950 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest text-center">
                    <tr>
                      <th className="px-4 py-3 text-left">Raffle</th>
                      <th className="px-4 py-3">Raffle ID</th>
                      <th className="px-4 py-3">Raffle Date</th>
                      <th className="px-4 py-3 text-left">Winner Name</th>
                      <th className="px-4 py-3">Nationality</th>
                      <th className="px-4 py-3">Prize</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 dark:divide-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-950 transition-colors">
                          <td className={`px-4 py-3.5 font-black text-left font-mono ${config.textColor}`}>{row.raffle}</td>
                          <td className="px-4 py-3.5 font-mono text-zinc-500 dark:text-zinc-400 text-center">{row.raffleId}</td>
                          <td className="px-4 py-3.5 text-zinc-400 dark:text-zinc-500 text-center">{row.date}</td>
                          <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100 text-left truncate max-w-[120px]">{row.winnerName}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="inline-flex items-center gap-1">
                              <span className="text-base leading-none select-none">{row.flag}</span>
                              <span className="text-[11px] text-zinc-500">{row.nationality}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono font-black text-emerald-600 text-center">{row.prize}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedResult(row)}
                              className="text-[10px] font-black text-[#E52535] hover:underline uppercase leading-none"
                            >
                              VIEW
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-zinc-400 font-bold">
                          No results match your query criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table pagination controller */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-150 dark:border-zinc-800">
                <span className="text-[11px] text-zinc-400 font-bold">Showing {filteredResults.length} records</span>
                <div className="flex gap-1.5">
                  <button className="p-2 border dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-40" disabled>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-xl bg-black dark:bg-zinc-950 text-yellow-300 font-mono font-bold text-xs flex items-center justify-center shadow">
                    01
                  </button>
                  <button className="w-8 h-8 rounded-xl text-zinc-400 font-mono font-semibold text-xs hover:bg-gray-150/40 dark:hover:bg-zinc-850 flex items-center justify-center">
                    02
                  </button>
                  <button className="p-2 border dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-455 text-zinc-400 hover:text-zinc-650 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Lightbox / Modal for detailed view */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-zinc-800">
            <h3 className="text-lg font-black tracking-tight uppercase text-zinc-950 dark:text-white mb-1 flex items-center gap-1.5 border-b dark:border-zinc-800 pb-3">
              <Trophy className="w-5 h-5 text-yellow-500" /> Certificate of winning
            </h3>
            
            <div className="space-y-4 pt-1">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Lottery Name</label>
                <p className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">{config.name} Raffle Draw</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Raffle Code</label>
                  <p className="text-sm font-black text-red-600 font-mono">{selectedResult.raffle}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Ticket ID</label>
                  <p className="text-sm font-mono font-extrabold text-zinc-800 dark:text-zinc-200">{selectedResult.raffleId}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Winner Holder</label>
                <p className="text-sm font-black text-zinc-950 dark:text-zinc-100">{selectedResult.winnerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Draw Date</label>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{selectedResult.date}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Nationality</label>
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <span>{selectedResult.flag}</span> {selectedResult.nationality}
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center">
                <label className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold block mb-0.5">Prize Amount</label>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-sans leading-none">{selectedResult.prize}</p>
                <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-1.5 uppercase tracking-wide">Verified by Golobal Lottery System</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedResult(null)}
              className="mt-6 w-full bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs py-3 rounded-xl transition-all uppercase tracking-widest"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default RaffleDetail;
