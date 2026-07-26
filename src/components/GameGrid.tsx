import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';
import { useCart } from '../context/CartContext';
import { useAuth, DynamicGame } from '../context/AuthContext';
import { resolveBannerImage } from './Hero';
import { LayoutGrid, Flame, Gift, Sparkles, Layers, Trophy, Zap, Timer, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function GameGrid() {
  const navigate = useNavigate();
  const { addTickets } = useCart();
  const { dynamicGames, siteConfig, language } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'thai' | 'mega7' | 'wild5' | 'easy6' | 'fast5' | 'scratch' | 'raffle'>('all');

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

  const categories = [
    { id: 'all', label: language === 'en' ? 'HOT GAMES' : 'হট গেমসমূহ', icon: '🔥' },
    { id: 'lottery', label: language === 'en' ? 'LOTTERY' : 'লটারি', icon: '🎟️' },
    { id: 'thai', label: language === 'en' ? 'THAI 6D' : 'থাই ৬ডি', icon: '🇹🇭' },
    { id: 'raffle', label: language === 'en' ? 'RAFFLES' : 'র্যাফেল', icon: '🎁' },
    { id: 'pick', label: language === 'en' ? 'FAST PICK' : 'ফাস্ট পিক', icon: '⚡' },
    { id: 'scratch', label: language === 'en' ? 'SCRATCH' : 'স্ক্র্যাচ', icon: '🃏' },
  ];

  const filteredGames = listGames.filter(g => {
    const nameUpper = (g.name || '').toUpperCase();
    if (selectedCategory === 'lottery') {
      return ['MEGA7', 'WILD5', 'EASY6', 'FAST5', 'LOTTERY'].some(n => nameUpper.includes(n));
    }
    if (selectedCategory === 'thai') {
      return nameUpper.includes('THAI');
    }
    if (selectedCategory === 'raffle') {
      return nameUpper.includes('SURE');
    }
    if (selectedCategory === 'pick') {
      return nameUpper.includes('PICK');
    }
    if (selectedCategory === 'scratch') {
      return nameUpper.includes('SCRATCH');
    }
    return true;
  });

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-4 sm:mt-8">
      {/* Category Bar like Betjili */}
      <div className="flex overflow-x-auto gap-2 sm:gap-3 py-2 mb-4 scrollbar-hide snap-x select-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer snap-start shrink-0 ${
                isActive 
                  ? 'bg-[#E1BC4A] text-zinc-950 shadow-md shadow-[#E1BC4A]/20 scale-[1.02]' 
                  : 'bg-zinc-800/80 dark:bg-zinc-900/90 text-zinc-300 hover:bg-zinc-700/80 border border-zinc-700/50'
              }`}
            >
              <span className="text-sm sm:text-base">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex-grow flex items-center gap-2 sm:gap-4">
          <h3 className="text-base sm:text-xl font-black tracking-wider text-zinc-900 dark:text-zinc-100 shrink-0 uppercase animate-fade-in">
            {language === 'en' ? 'OUR GAMES' : 'আমাদের গেমসমূহ'}
          </h3>
          <div className="h-[2px] bg-zinc-200 dark:bg-zinc-800 flex-grow" />
        </div>
        <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 shrink-0">
          <button 
            onClick={() => handleScroll('left')} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            <ChevronLeft size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>
          <button 
            onClick={() => handleScroll('right')} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            <ChevronRight size={16} className="text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-6 pt-1 snap-x snap-mandatory scrollbar-hide" ref={scrollRef}>
        {filteredGames.map((game) => {
          let themeColor = '#1e3c72';
          if (game.name === 'MEGA7') themeColor = '#E11D48';
          else if (game.name === 'WILD5') themeColor = '#A3E635';
          else if (game.name === 'EASY6') themeColor = '#059669';
          else if (game.name === 'FAST5') themeColor = '#F59E0B';
          else if (game.name.toUpperCase().startsWith('SURE 1') || game.name === 'SURE 1') themeColor = '#EC4899';
          else if (game.name.toUpperCase().startsWith('SURE 2') || game.name === 'SURE 2') themeColor = '#8B5CF6';
          else if (game.name.toUpperCase().startsWith('SURE 3') || game.name === 'SURE 3') themeColor = '#14B8A6';
          else if (game.name.toUpperCase().startsWith('PICK 1') || game.name === 'PICK 1') themeColor = '#8F3EA5';
          else if (game.name.toUpperCase().startsWith('PICK 2') || game.name === 'PICK 2') themeColor = '#F97316';
          else if (game.bgHex) themeColor = game.bgHex;

          let cardStyle: React.CSSProperties = {};
          const hasCustomImage = game.cardBgType === 'image' && Boolean(game.cardBgImage);
          
          if (hasCustomImage) {
            cardStyle = {
              backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0) 65%, rgba(0, 0, 0, 0.8) 100%), url(${resolveBannerImage(game.cardBgImage!)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            };
          } else if (game.cardBgType === 'gradient' && game.cardBgGradient) {
            cardStyle = { background: game.cardBgGradient };
          } else if (siteConfig.allGamesSolidBg || game.isSolidStyle || game.cardBgType === 'color') {
            const activeBgHex = siteConfig.allGamesSolidBg ? (siteConfig.allGamesSolidHex || '#1C2C80') : (game.bgHex || themeColor);
            cardStyle = { backgroundColor: activeBgHex };
            themeColor = activeBgHex;
          } else {
            const color = game.bgHex || themeColor;
            cardStyle = { 
              background: `linear-gradient(135deg, ${color}C0 0%, #080c14FA 100%)`,
              border: `1px solid ${color}26`
            };
          }

          let headerTextTranslated = language === 'en' ? 'GRAND PRIZE' : 'গ্র্যান্ড প্রাইজ';
          let subtitleExtra = null;
          let prizeLabel = game.prize;

          if (game.name === 'FAST5') {
            prizeLabel = '$6,000';
            subtitleExtra = language === 'en' ? 'MONTHLY FOR 25 YEARS' : '২৫ বছর ধরে প্রতি মাসে';
          } else if (game.name.toUpperCase().startsWith('PICK')) {
            const multiplier = game.name === 'PICK 2' ? '40X' : '20X';
            headerTextTranslated = language === 'en' ? `PRIZE UP TO ${game.prize}` : `${game.prize} পর্যন্ত পুরস্কার`;
            prizeLabel = language === 'en' ? `WIN ${multiplier} YOUR ENTRY VALUE` : `আপনার এন্ট্রি মূল্যের ${multiplier} জিতুন`;
          }

          const drawDateObj = game.targetDateStr ? new Date(game.targetDateStr) : new Date();
          const circleContent = /\d/.test(game.name) ? game.name.match(/\d+/)?.[0] : game.name.charAt(0);
          
          let btnStyle: React.CSSProperties = {};
          let btnClass = 'bg-black/25 hover:bg-black/45 border border-white/10 text-white font-extrabold text-[8px] sm:text-[10px] tracking-wider uppercase py-1.5 sm:py-2.5 px-4 sm:px-6 rounded-full transition-all hover:scale-[1.03]';
          
          if (game.buttonColor) {
            if (game.buttonColor.startsWith('#') || game.buttonColor.startsWith('rgb')) {
              btnStyle.backgroundColor = game.buttonColor;
            } else {
              btnClass = `${game.buttonColor} border border-white/10 font-extrabold text-[8px] sm:text-[10px] tracking-wider uppercase py-1.5 sm:py-2.5 px-4 sm:px-6 rounded-full transition-all hover:scale-[1.03]`;
            }
          }
          if (game.buttonTextColor) {
            if (game.buttonTextColor.startsWith('#') || game.buttonTextColor.startsWith('rgb')) {
              btnStyle.color = game.buttonTextColor;
            } else {
              if (game.buttonColor && !game.buttonColor.startsWith('#') && !game.buttonColor.startsWith('rgb')) {
                  btnClass += ` ${game.buttonTextColor}`;
              } else {
                  btnClass = btnClass.replace('text-white', game.buttonTextColor);
              }
            }
          }

          return (
            <motion.div 
              key={game.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ duration: 0.45, delay: (listGames.indexOf(game) % 4) * 0.08, ease: [0.215, 0.61, 0.355, 1] }}
              whileHover={{ 
                y: -8, 
                scale: 1.02, 
                boxShadow: `0 20px 30px -10px rgba(0, 0, 0, 0.4), 0 0 20px 2px ${themeColor}66` 
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY') {
                  navigate('/thai-lottery');
                } else {
                  navigate(`/games/${game.name}`);
                }
              }}
              className="cursor-pointer group rounded-2xl sm:rounded-3xl overflow-hidden select-none flex flex-col justify-between w-[220px] xs:w-[250px] sm:w-[280px] h-[340px] sm:h-[400px] shrink-0 snap-start border border-transparent dark:border-white/5 bg-transparent"
            >
              <div className="text-white p-3 sm:p-5 h-full flex flex-col justify-between relative" style={cardStyle}>
                {/* Top header bar */}
                <div className="flex justify-between items-center w-full z-10">
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10">
                    <span className="font-extrabold text-[10px] sm:text-xs tracking-tighter uppercase">{game.name.split(' ')[0]}</span>
                    {(game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY' || game.name.trim().toUpperCase() === 'LOTTERY' || game.name.trim().toUpperCase().includes('THAI')) ? (
                      <img src="https://i.postimg.cc/d0hfdLyv/THAI.webp" alt="THAI" className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover" />
                    ) : (
                      <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white font-black text-[8px] sm:text-[10px] flex items-center justify-center" style={{ color: themeColor }}>
                        {circleContent}
                      </span>
                    )}
                  </div>
                  <span className="text-[7.5px] sm:text-[9.5px] font-extrabold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider text-amber-300">
                    {game.drawTime}
                  </span>
                </div>

                {hasCustomImage ? (
                  <>
                    {/* Empty spacer so the image artwork and pre-printed prize graphics in center remain 100% visible and unblocked */}
                    <div className="flex-1" />

                    {/* Compact timer box positioned neatly in the lower empty area above play button */}
                    <div className="z-10 w-full mb-2 sm:mb-2.5 flex justify-center">
                      <div className="bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl inline-flex flex-col items-center shadow-xl">
                        <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-amber-300 block mb-0.5 sm:mb-1">
                          {language === 'en' ? 'NEXT DRAW' : 'পরবর্তী ড্র'}
                        </span>
                        {game.name === 'SCRATCH CARDS' ? (
                          <div className="bg-amber-500 text-black px-3 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                            {language === 'en' ? 'INSTANT PLAY' : 'তাৎক্ষণিক খেলুন'}
                          </div>
                        ) : (
                          <CountdownTimer targetDate={drawDateObj} />
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* Center Content for standard cards without custom banner image */
                  <div className="text-center my-auto flex flex-col justify-center items-center z-10 px-1 py-1">
                    <span className="text-[7.5px] sm:text-[9.5px] font-black uppercase tracking-[0.12em] text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] block">
                      {headerTextTranslated}
                    </span>
                    <p className="text-lg xs:text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)] mt-0.5 sm:mt-1 leading-none select-all">
                      {prizeLabel}
                    </p>
                    {subtitleExtra && (
                      <span className="text-[7.5px] sm:text-[10px] font-black uppercase text-yellow-300 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] mt-1 block">
                        {subtitleExtra}
                      </span>
                    )}

                    <div className="mt-2.5 sm:mt-4 w-full text-center flex justify-center">
                      <div className="bg-black/50 backdrop-blur-md border border-white/15 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl inline-flex flex-col items-center shadow-xl">
                        <span className="text-[7px] sm:text-[8.5px] font-black uppercase tracking-widest text-amber-300/90 block mb-1">
                          {language === 'en' ? 'NEXT DRAW' : 'পরবর্তী ড্র'}
                        </span>
                        {game.name === 'SCRATCH CARDS' ? (
                          <div className="bg-amber-500 text-black px-3 py-0.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest">
                            {language === 'en' ? 'INSTANT PLAY' : 'তাৎক্ষণিক খেলুন'}
                          </div>
                        ) : (
                          <CountdownTimer targetDate={drawDateObj} />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="z-10 w-full flex justify-center mt-auto">
                  <motion.button 
                    whileHover={{ scale: 1.05, filter: "brightness(1.12)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY') {
                        navigate('/thai-lottery');
                      } else {
                        navigate(`/games/${game.name}`);
                      }
                    }}
                    className={btnClass}
                    style={btnStyle}
                  >
                    {game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY' ? (language === 'en' ? 'PLAY NOW' : 'খেলুন এখনই') : (language === 'en' ? `PLAY FOR $${game.price}` : `$${game.price}-এ খেলুন`)}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default GameGrid;
