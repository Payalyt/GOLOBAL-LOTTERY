import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';
import { useCart } from '../context/CartContext';
import { useAuth, DynamicGame } from '../context/AuthContext';
import { resolveBannerImage } from './Hero';
import { t } from '../utils/translations';
import { LayoutGrid, Flame, Gift, Sparkles, Layers, Trophy, Zap, Timer, Activity } from 'lucide-react';

export function GameGrid() {
  const navigate = useNavigate();
  const { addTickets } = useCart();
  const { dynamicGames, siteConfig, language } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'thai' | 'mega7' | 'wild5' | 'easy6' | 'fast5' | 'scratch' | 'raffle'>('all');

  // Show all games in the carousel, sorted in original order, filtered to prevent crash on bad documents and inactive games
  const listGames = [...dynamicGames]
    .filter(g => g && g.name && g.isActive !== false)
    .sort((a, b) => {
      const order = ['MEGA7', 'WILD5', 'EASY6', 'FAST5', 'LOTTERY', 'THAI GOVT LOTTERY', 'THAI GOVE KOTTERY', 'SCRATCH CARDS', 'SURE 1', 'SURE 2', 'SURE 3', 'PICK 1', 'PICK 2'];
      const idxA = order.indexOf((a.name || '').trim().toUpperCase());
      const idxB = order.indexOf((b.name || '').trim().toUpperCase());
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });

  const filteredGames = listGames.filter(game => {
    const name = game.name.trim().toUpperCase();
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'thai') {
      return name === 'THAI GOVT LOTTERY' || name === 'THAI GOVE KOTTERY' || name === 'LOTTERY' || name.includes('THAI');
    }
    if (selectedCategory === 'mega7') {
      return name === 'MEGA7';
    }
    if (selectedCategory === 'wild5') {
      return name === 'WILD5';
    }
    if (selectedCategory === 'easy6') {
      return name === 'EASY6';
    }
    if (selectedCategory === 'fast5') {
      return name === 'FAST5';
    }
    if (selectedCategory === 'scratch') {
      return name === 'SCRATCH CARDS';
    }
    if (selectedCategory === 'raffle') {
      return name.startsWith('SURE') || name.startsWith('PICK') || name.includes('RAFFLE');
    }
    return true;
  });

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Quick generate lucky ticket and add to cart directly!
  const handleQuickPlay = (e: React.MouseEvent, game: DynamicGame) => {
    e.stopPropagation();
    
    // Choose lottery size rules
    let size = 5;
    let max = 49;
    if (game.name === 'MEGA7') { size = 7; max = 99; }
    else if (game.name === 'EASY6') { size = 6; max = 39; }
    else if (game.name.toUpperCase().startsWith('PICK 1')) { size = 1; max = 9; }
    else if (game.name.toUpperCase().startsWith('PICK 2')) { size = 2; max = 9; }

    const numbers: number[] = [];
    while (numbers.length < size) {
      const num = Math.floor(Math.random() * max) + 1;
      if (!numbers.includes(num)) numbers.push(num);
    }
    numbers.sort((a, b) => a - b);

    // Call checkout context to add this random pre-buy ticket to cart
    addTickets([{
      id: Date.now() + Math.floor(Math.random() * 900),
      numbers,
      price: game.price,
      gameName: game.name,
      isFavorite: false
    }]);

    alert(`🎫 Quick Luck numbers generated for ${game.name}: (${numbers.join(', ')}). Added to your cart!`);
  };

  return (
    <div className="mt-8">
      {/* Header section with elegant title, divider line and next/prev buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow flex items-center gap-2 sm:gap-4">
          <h3 className="text-lg sm:text-xl font-black tracking-wider text-zinc-900 dark:text-zinc-100 shrink-0 uppercase animate-fade-in">
            {language === 'en' ? 'OUR GAMES' : 'আমাদের গেমসমূহ'}
          </h3>
          <div className="h-[2px] bg-zinc-200 dark:bg-zinc-800 flex-grow" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 shrink-0">
          <button 
            onClick={() => handleScroll('left')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors cursor-pointer"
          >
            ←
          </button>
          <button 
            onClick={() => handleScroll('right')}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-colors cursor-pointer"
          >
            →
          </button>
        </div>
      </div>
      
      {/* Slide / grid view */}
      {filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-center">
          <span className="text-2xl mb-2">🎯</span>
          <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            {language === 'en' ? 'No active games found in this category' : 'এই ক্যাটাগরিতে কোনো সক্রিয় গেম পাওয়া যায়নি'}
          </p>
          <button 
            onClick={() => setSelectedCategory('all')}
            className="mt-3 text-[10px] font-black tracking-widest text-[#E52535] uppercase hover:underline cursor-pointer"
          >
            {language === 'en' ? 'Show All Games' : 'সব গেম দেখুন'}
          </button>
        </div>
      ) : (
        <div 
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {filteredGames.map((game) => {
          // Determine the game's theme color (consistent with WILD 5 style)
          let themeColor = '#1C2C80'; // fallback to WILD 5 blue
          if (game.name === 'MEGA7') themeColor = '#E52535';
          else if (game.name === 'WILD5' || game.name === 'WILD') themeColor = '#1C2C80';
          else if (game.name === 'EASY6' || game.name === 'EASY') themeColor = '#12A054';
          else if (game.name === 'FAST5') themeColor = '#1AA3E5';
          else if (game.name === 'LOTTERY') themeColor = '#F9A825';
          else if (game.name === 'SCRATCH CARDS') themeColor = '#9C27B0';
          else if (game.name.toUpperCase().startsWith('SURE 1') || game.name === 'SURE 1') themeColor = '#EC4899';
          else if (game.name.toUpperCase().startsWith('SURE 2') || game.name === 'SURE 2') themeColor = '#8B5CF6';
          else if (game.name.toUpperCase().startsWith('SURE 3') || game.name === 'SURE 3') themeColor = '#14B8A6';
          else if (game.name.toUpperCase().startsWith('PICK 1') || game.name === 'PICK 1') themeColor = '#8F3EA5';
          else if (game.name.toUpperCase().startsWith('PICK 2') || game.name === 'PICK 2') themeColor = '#F97316';
          else if (game.bgHex) themeColor = game.bgHex;

          let cardBg = '';
          let cardStyle: React.CSSProperties = {};
          let bulletCircle = 'bg-white font-black';
          let headerText = 'GRAND PRIZE';
          let subtitleExtra = null;
          let prizeLabel = game.prize;

          // Refined background logic to support dynamic branding
          // Priority: Explicit Image/Gradient -> Force Solid Switch -> Default Color
          if (game.cardBgType === 'image' && game.cardBgImage) {
            cardStyle = {
              backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%), url(${resolveBannerImage(game.cardBgImage)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            };
          } else if (game.cardBgType === 'gradient' && game.cardBgGradient) {
            cardStyle = {
              background: game.cardBgGradient,
            };
          } else if (siteConfig.allGamesSolidBg || game.isSolidStyle || game.cardBgType === 'color') {
            const activeBgHex = siteConfig.allGamesSolidBg ? (siteConfig.allGamesSolidHex || '#1C2C80') : (game.bgHex || themeColor);
            cardStyle = { backgroundColor: activeBgHex };
            themeColor = activeBgHex;
          } else {
            // Default fallback
            cardStyle = { backgroundColor: game.bgHex || themeColor };
          }

          let headerTextTranslated = language === 'en' ? 'GRAND PRIZE' : 'গ্র্যান্ড প্রাইজ';
          if (game.name === 'FAST5') {
            headerTextTranslated = language === 'en' ? 'GRAND PRIZE' : 'গ্র্যান্ড প্রাইজ';
            prizeLabel = '$6,000';
            subtitleExtra = language === 'en' ? 'MONTHLY FOR 25 YEARS' : '২৫ বছর ধরে প্রতি মাসে';
          } else if (game.name.toUpperCase().startsWith('PICK')) {
            const multiplier = game.name === 'PICK 2' ? '40X' : '20X';
            headerTextTranslated = language === 'en' ? `PRIZE UP TO ${game.prize}` : `${game.prize} পর্যন্ত পুরস্কার`;
            prizeLabel = language === 'en' ? `WIN ${multiplier} YOUR ENTRY VALUE` : `আপনার এন্ট্রি মূল্যের ${multiplier} জিতুন`;
          }

          // Convert targetDateStr to Date
          const drawDateObj = game.targetDateStr ? new Date(game.targetDateStr) : new Date();

          // Determine what to show in the circle (number or initial)
          const circleContent = /\d/.test(game.name) ? game.name.match(/\d+/)?.[0] : game.name.charAt(0);

          return (
            <div 
              key={game.name}
              onClick={() => {
                if (game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY') {
                  navigate('/thai-lottery');
                } else {
                  navigate(`/games/${game.name}`);
                }
              }}
              className="cursor-pointer group flex-shrink-0 w-[270px] sm:w-[290px] snap-start rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform select-none flex flex-col justify-between"
              style={{ background: 'transparent' }}
            >
              <div 
                className={`${cardBg} text-white p-6 h-[400px] flex flex-col justify-between relative`}
                style={cardStyle}
              >
                
                {/* Header indicators */}
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-base tracking-tighter uppercase">{game.name.split(' ')[0]}</span>
                    {(game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY' || game.name.trim().toUpperCase() === 'LOTTERY' || game.name.trim().toUpperCase().includes('THAI')) ? (
                      <img src="https://i.postimg.cc/d0hfdLyv/THAI.webp" alt="THAI" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <span 
                        className={`w-5 h-5 rounded-full ${bulletCircle} font-black text-[11px] flex items-center justify-center`}
                        style={{ color: themeColor }}
                      >
                        {circleContent}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{game.drawTime}</span>
                </div>

                {/* Center Content: Prize Details & Subtitle */}
                <div className="text-center my-auto flex flex-col justify-center items-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/70 block">{headerTextTranslated}</span>
                  <p className="text-3xl font-black tracking-tight text-white mt-1 leading-tight select-all">
                    {prizeLabel}
                  </p>
                  {subtitleExtra && (
                    <span className="text-[10px] font-black uppercase text-yellow-300 tracking-wider mt-1 block">
                      {subtitleExtra}
                    </span>
                  )}

                  {/* NEXT DRAW block inside a subtle countdown wrapper */}
                  <div className="mt-6 w-full text-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50 block">
                      {language === 'en' ? 'NEXT DRAW' : 'পরবর্তী ড্র'}
                    </span>
                    <div className="mt-2.5">
                      {game.name === 'SCRATCH CARDS' ? (
                        <div className="bg-white/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
                          {language === 'en' ? 'INSTANT PLAY' : 'তাৎক্ষণিক খেলুন'}
                        </div>
                      ) : (
                        <CountdownTimer targetDate={drawDateObj} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer buttons row */}
                <div className="z-10 w-full flex justify-center mt-auto">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY') {
                        navigate('/thai-lottery');
                      } else {
                        navigate(`/games/${game.name}`);
                      }
                    }}
                    className="bg-black/25 hover:bg-black/45 border border-white/10 text-white font-extrabold text-[10px] tracking-wider uppercase py-2.5 px-6 rounded-full transition-all hover:scale-[1.03]"
                  >
                    {game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY' ? (language === 'en' ? 'PLAY NOW' : 'খেলুন এখনই') : (language === 'en' ? `PLAY FOR $${game.price}` : `$${game.price}-এ খেলুন`)}
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
export default GameGrid;
