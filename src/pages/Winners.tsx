import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, ExternalLink, Sparkles, X, Gift, Search, Award } from 'lucide-react';
import { useAuth, extractYoutubeId, getYoutubeThumbnail, getGameColor } from '../context/AuthContext';

interface GrandWinner {
  name: string;
  prize: string;
  date: string;
  flagTheme: 'india' | 'uae' | 'canada';
  avatarUrl: string;
}

interface VideoWinner {
  title: string;
  name: string;
  prizeText: string;
  date: string;
  thumbnailUrl: string;
  youtubeId: string;
}

const grandWinners: GrandWinner[] = [
  {
    name: 'Sriram R.',
    prize: '$27,229,408',
    date: '16 March 2025',
    flagTheme: 'india',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Robert Burkovski',
    prize: '$2,042,205',
    date: '16 December 2023',
    flagTheme: 'canada',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Mohammad Inam',
    prize: '$4,084,111',
    date: '15 December 2023',
    flagTheme: 'uae',
    avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Magesh Kumar',
    prize: '$2,042,205',
    date: '14 October 2023',
    flagTheme: 'india',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Freilyn Angob',
    prize: '$2,042,205',
    date: '9 September 2023',
    flagTheme: 'uae',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Mohd Adil Khan',
    prize: '$2,042,205',
    date: '22 July 2023',
    flagTheme: 'india',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Russel Tuazon',
    prize: '$4,084,111',
    date: '13 January 2023',
    flagTheme: 'uae',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250',
  },
  {
    name: 'Ajay Ogula',
    prize: '$4,084,111',
    date: '16 December 2022',
    flagTheme: 'india',
    avatarUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=250',
  },
];

const videoWinners: VideoWinner[] = [
  {
    title: "From Mother's Blessings to AED 100 Mill...",
    name: 'Sriram Rajagopalan',
    prizeText: '$27,229,408',
    date: '16 March 2025',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    title: 'Meet our first Canadian Grand Prize Win...',
    name: 'Robert Burkovski',
    prizeText: '$6,807 EVERY MONTH X 25 YEARS',
    date: '16 December 2023',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    title: 'Our AED 15 million Grand Prize Winner, M...',
    name: 'Mohammad Inam',
    prizeText: '$4,084,111',
    date: '15 December 2023',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    title: '"I don\'t think much-if I need it, I buy it."',
    name: 'Mohammad Inam',
    prizeText: '$4,084,111',
    date: '15 December 2023',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    title: 'Magesh Kumar secured a worry-free life',
    name: 'Magesh Kumar',
    prizeText: '$6,807 EVERY MONTH X 25 YEARS',
    date: '14 October 2023',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600',
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    title: 'Freilyn achieved her financial freedom by',
    name: 'Freilyn Angob',
    prizeText: '$6,807 EVERY MONTH X 25 YEARS',
    date: '9 September 2023',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    youtubeId: 'dQw4w9WgXcQ'
  },
];

export function Winners() {
  const { id } = useParams<{ id?: string }>();
  const { siteConfig, raffleWinners } = useAuth();
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  
  // Tab states: 'grand' | 'live' | 'video'
  const [activeTab, setActiveTab] = useState<'grand' | 'live' | 'video'>(() => {
    if (id) {
      const lower = id.toLowerCase();
      if (lower === 'hall-of-fame' || lower === 'grand-prize') {
        return 'grand';
      }
      return 'live';
    }
    return 'grand';
  });

  const normalizeGameParam = (param?: string): string => {
    if (!param) return 'ALL';
    const lower = param.toLowerCase();
    if (lower === 'mega7') return 'MEGA7';
    if (lower === 'wild5') return 'WILD5';
    if (lower === 'easy6') return 'EASY6';
    if (lower === 'fast5') return 'FAST5';
    if (lower === 'lottery') return 'LOTTERY';
    if (lower === 'scratch%20cards' || lower === 'scratch cards') return 'SCRATCH CARDS';
    if (lower === 'sure1' || lower === 'sure 1') return 'SURE 1';
    if (lower === 'sure2' || lower === 'sure 2') return 'SURE 2';
    if (lower === 'sure3' || lower === 'sure 3') return 'SURE 3';
    if (lower === 'pick1' || lower === 'pick 1') return 'PICK 1';
    if (lower === 'pick2' || lower === 'pick 2') return 'PICK 2';
    return 'ALL';
  };

  const [gameFilter, setGameFilter] = useState<string>(() => {
    if (id) {
      return normalizeGameParam(id);
    }
    return 'ALL';
  });

  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    if (id) {
      const lower = id.toLowerCase();
      if (lower === 'hall-of-fame' || lower === 'grand-prize') {
        setActiveTab('grand');
      } else {
        setActiveTab('live');
        setGameFilter(normalizeGameParam(id));
      }
    }
  }, [id]);

  const availableGames = [
    'ALL',
    'MEGA7',
    'WILD5',
    'EASY6',
    'FAST5',
    'LOTTERY',
    'SCRATCH CARDS',
    'SURE 1',
    'SURE 2',
    'SURE 3',
    'PICK 1',
    'PICK 2'
  ];

  // Filter dynamic game winners
  const filteredWinners = raffleWinners.filter((w) => {
    const matchesGame = gameFilter === 'ALL' || w.game?.trim().toUpperCase() === gameFilter.toUpperCase();
    const matchesSearch = !searchQuery || 
      w.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      w.ticket?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.country?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGame && matchesSearch;
  });

  // Calculate sum of prize payouts or total count
  const totalPrizeCount = filteredWinners.length;
  
  // Custom video winners fallback
  const dbVideoWinners = siteConfig?.videoWinners || [];
  const activeVideoWinners = dbVideoWinners.length > 0
    ? dbVideoWinners.filter(vw => vw.isActive !== false)
    : videoWinners;

  return (
    <div id="winners-root-view" className="bg-[#FAF9FC] dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans pb-16">
      
      {/* Decorative Golden Graphic Header Banner */}
      <div id="winners-golden-banner" className="relative overflow-hidden bg-gradient-to-r from-[#FBC02D] via-[#F9A825] to-[#F57F17] py-12 text-center text-white shadow-md">
        {/* Artistic curved overlays */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-black/5 rounded-full blur-xl pointer-events-none animate-pulse" />
        
        {/* Dynamic Curved Vector Accent */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider select-none drop-shadow-md">
          {activeTab === 'grand' && 'Grand Prize Hall'}
          {activeTab === 'live' && 'Live Draw Winners'}
          {activeTab === 'video' && 'Winners Living the Dream'}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Main Content Box wrapped with beautiful borders */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-150 dark:border-zinc-850 space-y-8">
          
          {/* Back breadcrumb container */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-zinc-800">
            <Link 
              to="/" 
              className="text-xs font-extrabold text-[#7e7e8d] hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 text-[#7e7e8d]" /> Back to Homepage
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EEF2F6] dark:bg-zinc-800 text-[#334155] dark:text-zinc-300 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-500" /> Guaranteed Draws
            </div>
          </div>

          {/* Elegant Tabs Selection */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF9FC] dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850 rounded-2xl">
            <button
              onClick={() => setActiveTab('grand')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'grand'
                  ? 'bg-[#1E1B4B] dark:bg-zinc-800 text-white shadow-md scale-[1.02]'
                  : 'text-[#475569] dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              👑 Grand Prize Hall
            </button>
            <button
              onClick={() => {
                setActiveTab('live');
                setGameFilter('ALL');
              }}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-[#1E1B4B] dark:bg-zinc-800 text-white shadow-md scale-[1.02]'
                  : 'text-[#475569] dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              🎫 Live Game Winners
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'video'
                  ? 'bg-[#1E1B4B] dark:bg-zinc-800 text-white shadow-md scale-[1.02]'
                  : 'text-[#475569] dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              📹 Video Stories
            </button>
          </div>

          {/* TAB 1: Grand Prize Winners */}
          {activeTab === 'grand' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-[#1E1B4B] dark:text-zinc-100 tracking-tight shrink-0">
                  Hall of Fame
                </h2>
                <div className="flex-1 h-[2px] bg-[#E2E8F0] dark:bg-zinc-800 self-center" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {grandWinners.map((winner, idx) => (
                  <div 
                    key={idx} 
                    className="flex flex-col items-center text-center p-4 rounded-3xl hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40 hover:shadow-xs transition-all duration-200"
                  >
                    <div className="relative w-32 h-32 rounded-full p-0.5 border-2 border-gray-200 dark:border-zinc-800 shadow-sm shrink-0 bg-white dark:bg-zinc-900 group overflow-hidden">
                      <div className="w-full h-full rounded-full overflow-hidden relative">
                        <img 
                          src={winner.avatarUrl} 
                          alt={winner.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="absolute bottom-0 inset-x-0 h-[15px] flex overflow-hidden">
                        {winner.flagTheme === 'india' && (
                          <div className="w-full h-full flex flex-col justify-stretch">
                            <div className="bg-[#FF9933] flex-1" />
                            <div className="bg-white flex-1 flex justify-center items-center">
                              <div className="w-[3px] h-[3px] rounded-full bg-[#000080]" />
                            </div>
                            <div className="bg-[#128807] flex-1" />
                          </div>
                        )}
                        {winner.flagTheme === 'uae' && (
                          <div className="w-full h-full flex relative">
                            <div className="w-[11px] h-full bg-[#E52535] shrink-0" />
                            <div className="flex-1 flex flex-col h-full">
                              <div className="bg-[#128807] flex-1" />
                              <div className="bg-white flex-1" />
                              <div className="bg-black flex-1" />
                            </div>
                          </div>
                        )}
                        {winner.flagTheme === 'canada' && (
                          <div className="w-full h-full flex justify-stretch">
                            <div className="bg-[#FF0000] flex-1" />
                            <div className="bg-white flex-1 flex justify-center items-center relative">
                              <span className="text-[6px] text-[#FF0000] font-black -mt-0.5 select-none font-sans">🍁</span>
                            </div>
                            <div className="bg-[#FF0000] flex-1" />
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="inline-block px-3 py-1 bg-[#1E2E80] text-white text-[9px] font-black rounded-full select-none -translate-y-2 uppercase shadow-sm tracking-wider">
                      Draw Winner
                    </span>

                    <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm mt-1 mb-0.5 truncate max-w-[150px]">
                      {winner.name}
                    </h4>
                    <p className="text-lg font-black text-[#1E1B4B] dark:text-yellow-400 tracking-tight leading-none my-1">
                      {winner.prize}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-400 block tracking-wide">
                      {winner.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Live Draw & Game Winners */}
          {activeTab === 'live' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-[#1E1B4B] dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    🏆 Live Winners Ledger
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Real-time certified declarations added instantly from the admin panel.</p>
                </div>

                {/* Live Search and filters */}
                <div className="relative max-w-sm w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-zinc-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, ticket or country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 placeholder-zinc-450 focus:outline-none focus:border-[#1E1B4B] dark:focus:border-zinc-700 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Game Pills Filter Selector */}
              <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar border-b border-gray-100 dark:border-zinc-800 pb-4">
                {availableGames.map((game) => {
                  const isSelected = gameFilter.toUpperCase() === game.toUpperCase();
                  const pillColor = game === 'ALL' ? 'bg-[#1E1B4B] dark:bg-zinc-850 text-white' : getGameColor(game);

                  return (
                    <button
                      key={game}
                      onClick={() => setGameFilter(game)}
                      className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 border cursor-pointer ${
                        isSelected 
                          ? `${pillColor} border-transparent shadow-sm scale-105` 
                          : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white border-gray-200 dark:border-zinc-800'
                      }`}
                    >
                      {game === 'ALL' ? '🌟 All Winners' : game}
                    </button>
                  );
                })}
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500 px-1">
                <span>Showing {totalPrizeCount} certified winners</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> 100% Secure & Verified
                </span>
              </div>

              {/* Winners Grid */}
              {filteredWinners.length === 0 ? (
                <div className="text-center py-16 bg-[#FAF9FC] dark:bg-zinc-900/20 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800">
                  <Gift className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                  <h3 className="text-sm font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">No Winners Found</h3>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Try changing your filters or add new entries from the admin panel!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredWinners.map((w, index) => (
                    <div 
                      key={w.id || index}
                      className="bg-white dark:bg-zinc-900/40 rounded-2xl p-5 border border-gray-150 dark:border-zinc-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            {w.imageUrl ? (
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-xs">
                                <img src={w.imageUrl} alt={w.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xs ${w.avatarBg || 'bg-gradient-to-tr from-emerald-500 to-teal-600'}`}>
                                {w.initials || w.name.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className="absolute -top-1 -right-1 bg-amber-400 border border-white text-[9px] p-0.5 rounded-full shadow-xs">🏆</span>
                          </div>
                          
                          <div className="leading-tight min-w-0 flex-1">
                            <h4 className="font-extrabold text-zinc-900 dark:text-zinc-100 text-sm truncate">{w.name}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-xs">{w.flag}</span>
                              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">{w.country}</span>
                            </div>
                          </div>
                        </div>

                        {/* Game tag */}
                        <div className="mt-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-2xs ${getGameColor(w.game)}`}>
                            {w.game}
                          </span>
                        </div>
                      </div>

                      {/* Ticket and Prize */}
                      <div className="mt-5 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider block">Ticket Code</span>
                          <span className="text-xs font-mono font-black text-zinc-850 dark:text-zinc-200 uppercase tracking-widest">{w.ticket}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider block">Won Amount</span>
                          <span className="text-base font-black text-emerald-600 tracking-tight leading-none mt-0.5 block">{w.prize}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Video Stories */}
          {activeTab === 'video' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-[#1E1B4B] dark:text-zinc-100 tracking-tight shrink-0">
                  Winners Living the Dream
                </h2>
                <div className="flex-1 h-[2px] bg-[#E2E8F0] dark:bg-zinc-800 self-center" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeVideoWinners.map((v, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedVideo(v)}
                    className="bg-white dark:bg-zinc-900/40 rounded-2xl overflow-hidden border border-gray-150 dark:border-zinc-800 shadow-sm flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden select-none shrink-0 w-full">
                      <img 
                        src={v.thumbnailUrl || getYoutubeThumbnail(v.youtubeId)} 
                        alt={v.title} 
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-75 transition-opacity"
                      />

                      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/55 to-transparent p-3 text-white">
                        <p className="text-xs font-semibold truncate max-w-[90%] tracking-wide text-white drop-shadow">
                          {v.title}
                        </p>
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[52px] h-[36px] bg-red-650 bg-red-600 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-110 transition-all duration-200">
                          <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[11px] border-l-white border-b-[7px] border-b-transparent ml-1" />
                        </div>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-3xs p-2 px-3 text-white flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                        </span>
                        <span className="font-mono text-zinc-400">Golobal Lottery</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-2">
                        <span className="inline-block px-2.5 py-0.5 bg-[#FFE4E6] dark:bg-red-950/40 text-[#E11D48] dark:text-red-450 text-[9px] font-black rounded uppercase tracking-wider">
                          Draw Winner
                        </span>
                        <h4 className="font-extrabold text-zinc-950 dark:text-zinc-100 text-base leading-snug">
                          {v.name}
                        </h4>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-zinc-800">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-200 leading-none">
                          <span className="text-[#0070BC] dark:text-blue-400 font-extrabold">Won</span> {v.prizeText}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">
                          {v.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center gap-2 pt-6">
                <button 
                  className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-850 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 text-zinc-400 hover:text-zinc-700 transition-all duration-150" 
                  disabled
                >
                  &lt;
                </button>
                <button className="w-8 h-8 rounded-full bg-zinc-950 text-[#FFEB4A] font-bold text-xs flex items-center justify-center shadow-md select-none">
                  01
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-bold text-xs flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-all select-none cursor-pointer">
                  02
                </button>
                <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all duration-150 cursor-pointer">
                  &gt;
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* YouTube Video Modal Popup */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden max-w-3xl w-full relative shadow-2xl scale-100 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full border border-zinc-800 transition z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full">
              <iframe 
                src={`https://www.youtube.com/embed/${extractYoutubeId(selectedVideo.youtubeId)}?autoplay=1`} 
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="p-5 border-t border-zinc-900 bg-zinc-900">
              <span className="inline-block px-2.5 py-0.5 bg-red-950 text-red-400 text-[9px] font-black rounded uppercase tracking-wider mb-2">
                Winner Story
              </span>
              <h3 className="text-white text-base font-extrabold">{selectedVideo.title}</h3>
              <p className="text-zinc-400 text-xs mt-1">
                Winner: <span className="text-white font-bold">{selectedVideo.name}</span> • Prize: <span className="text-[#0070BC] font-black">{selectedVideo.prizeText}</span> • {selectedVideo.date}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Winners;
