import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, ExternalLink, Sparkles } from 'lucide-react';

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
  return (
    <div id="winners-root-view" className="bg-[#FAF9FC] min-h-screen text-zinc-900 font-sans pb-16">
      
      {/* Decorative Golden Graphic Header Banner */}
      <div id="winners-golden-banner" className="relative overflow-hidden bg-gradient-to-r from-[#FBC02D] via-[#F9A825] to-[#F57F17] py-12 text-center text-white shadow-md">
        {/* Artistic curved overlays */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-black/5 rounded-full blur-xl pointer-events-none animate-pulse" />
        
        {/* Dynamic Curved Vector Accent */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider select-none drop-shadow-md">
          Grand Prize Winners
        </h1>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Main Content Box wrapped with beautiful borders */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-150 space-y-12">
          
          {/* Back breadcrumb container */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-100">
            <Link 
              to="/" 
              className="text-xs font-extrabold text-[#7e7e8d] hover:text-zinc-950 flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4 text-[#7e7e8d]" /> Back to Homepage
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#EEF2F6] text-[#334155] text-[10px] font-extrabold rounded-full uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-500" /> Guaranteed Draws
            </div>
          </div>

          {/* First Section: Winners List */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight shrink-0">
                Winners
              </h2>
              {/* Thick divider accent line right-aligned */}
              <div className="flex-1 h-[2px] bg-[#E2E8F0] self-center" />
            </div>

            {/* Winners Avatar Circles Grid (8 winners, 4 columns on large, etc) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {grandWinners.map((winner, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center text-center p-4 rounded-3xl hover:bg-zinc-50/50 hover:shadow-xs transition-all duration-200"
                >
                  
                  {/* Container for Avatar Circle and bottom arc flag decoration */}
                  <div className="relative w-32 h-32 rounded-full p-0.5 border-2 border-gray-200 shadow-sm shrink-0 bg-white group overflow-hidden">
                    
                    {/* Circle Image Wrapper */}
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img 
                        src={winner.avatarUrl} 
                        alt={winner.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Styled flag curves exactly matching the Emirate Draw visual */}
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

                  {/* Draw Winner Badge overlaying */}
                  <span className="inline-block px-3 py-1 bg-[#1E2E80] text-white text-[9px] font-black rounded-full select-none -translate-y-2 uppercase shadow-sm tracking-wider">
                    Draw Winner
                  </span>

                  {/* Winner Content elements */}
                  <h4 className="font-extrabold text-zinc-900 text-sm mt-1 mb-0.5 truncate max-w-[150px]">
                    {winner.name}
                  </h4>
                  <p className="text-lg font-black text-[#1E1B4B] tracking-tight leading-none my-1">
                    {winner.prize}
                  </p>
                  <p className="text-[10px] font-bold text-zinc-400 block tracking-wide">
                    {winner.date}
                  </p>

                </div>
              ))}
            </div>
          </div>

          {/* Second Section: Winners Living the Dream (YouTube styled videos) */}
          <div className="space-y-8 pt-4">
            
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight shrink-0">
                Winners Living the Dream
              </h2>
              {/* Thick divider accent line right-aligned */}
              <div className="flex-1 h-[2px] bg-[#E2E8F0] self-center" />
            </div>

            {/* Video Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videoWinners.map((v, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-2xl overflow-hidden border border-gray-150 shadow-sm flex flex-col hover:shadow-md transition-shadow group cursor-pointer"
                >
                  
                  {/* Simulated interactive Embedded YouTube Container with hover controls */}
                  <div className="relative aspect-video bg-black overflow-hidden select-none shrink-0 w-full">
                    {/* Thumbnail Image */}
                    <img 
                      src={v.thumbnailUrl} 
                      alt={v.title} 
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-75 transition-opacity"
                    />

                    {/* Dark gradient shadow elements (like YouTube player) */}
                    <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/55 to-transparent p-3 text-white">
                      <p className="text-xs font-semibold truncate max-w-[90%] tracking-wide text-white drop-shadow">
                        {v.title}
                      </p>
                    </div>

                    {/* Big red YouTube Logo Play trigger button */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[52px] h-[36px] bg-red-650 bg-red-600 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-110 transition-all duration-200">
                        {/* Play white triangle symbol */}
                        <div className="w-0 h-0 border-t-[7px] border-t-transparent border-l-[11px] border-l-white border-b-[7px] border-b-transparent ml-1" />
                      </div>
                    </div>

                    {/* Bottom strip overlay with YouTube play watermarks */}
                    <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-3xs p-2 px-3 text-white flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                      </span>
                      <span className="font-mono text-zinc-400">Golobal Lottery</span>
                    </div>

                  </div>

                  {/* Lower metadata card content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                    
                    <div className="space-y-2">
                      {/* Red capsule draw badge */}
                      <span className="inline-block px-2.5 py-0.5 bg-[#FFE4E6] text-[#E11D48] text-[9px] font-black rounded uppercase tracking-wider">
                        Draw Winner
                      </span>
                      {/* Bold name */}
                      <h4 className="font-extrabold text-zinc-950 text-base leading-snug">
                        {v.name}
                      </h4>
                    </div>

                    {/* Price structure styled exactly as "Won $Amount" */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-100">
                      <p className="text-sm font-bold text-zinc-900 leading-none">
                        <span className="text-[#0070BC] font-extrabold">Won</span> {v.prizeText}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">
                        {v.date}
                      </p>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Pagination Controls styled exactly as < [01] 02 > */}
            <div className="flex justify-center items-center gap-2 pt-6">
              <button 
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 text-zinc-400 hover:text-zinc-700 transition-all duration-150 disabled:opacity-40" 
                disabled
              >
                &lt;
              </button>
              
              <button className="w-8 h-8 rounded-full bg-zinc-950 text-[#FFEB4A] font-bold text-xs flex items-center justify-center shadow-md select-none">
                01
              </button>

              <button className="w-8 h-8 rounded-full border border-gray-200 text-zinc-500 hover:text-zinc-950 font-bold text-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all select-none">
                02
              </button>

              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 text-zinc-500 hover:text-zinc-950 transition-all duration-150">
                &gt;
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Winners;
