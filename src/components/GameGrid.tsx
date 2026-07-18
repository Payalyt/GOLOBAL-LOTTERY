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

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow flex items-center gap-2 sm:gap-4">
          <h3 className="text-lg sm:text-xl font-black tracking-wider text-zinc-900 dark:text-zinc-100 shrink-0 uppercase animate-fade-in">
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

      <div className="flex overflow-x-auto gap-3 sm:gap-6 pb-6 pt-2 snap-x snap-mandatory scrollbar-hide" ref={scrollRef}>
        {listGames.map((game) => {
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
          
          if (game.cardBgType === 'image' && game.cardBgImage) {
            cardStyle = {
              backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.8) 100%), url(${resolveBannerImage(game.cardBgImage)})`,
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
              className="cursor-pointer group rounded-2xl sm:rounded-3xl overflow-hidden select-none flex flex-col justify-between w-full sm:w-[290px] sm:flex-shrink-0 sm:snap-start border border-transparent dark:border-white/5 bg-transparent"
            >
              <div className="text-white p-3 sm:p-6 h-[270px] sm:h-[400px] flex flex-col justify-between relative" style={cardStyle}>
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-[11px] sm:text-base tracking-tighter uppercase">{game.name.split(' ')[0]}</span>
                    {(game.name.trim().toUpperCase() === 'THAI GOVT LOTTERY' || game.name.trim().toUpperCase() === 'THAI GOVE KOTTERY' || game.name.trim().toUpperCase() === 'LOTTERY' || game.name.trim().toUpperCase().includes('THAI')) ? (
                      <img src="https://i.postimg.cc/d0hfdLyv/THAI.webp" alt="THAI" className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover" />
                    ) : (
                      <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white font-black text-[9px] sm:text-[11px] flex items-center justify-center" style={{ color: themeColor }}>
                        {circleContent}
                      </span>
                    )}
                  </div>
                  <span className="text-[7.5px] sm:text-[10px] font-bold opacity-80 uppercase tracking-widest">{game.drawTime}</span>
                </div>

                <div className="text-center my-auto flex flex-col justify-center items-center">
                  <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.1em] text-white/70 block">{headerTextTranslated}</span>
                  <p className="text-base xs:text-lg sm:text-3xl font-black tracking-tight text-white mt-0.5 sm:mt-1 leading-tight select-all">
                    {prizeLabel}
                  </p>
                  {subtitleExtra && (
                    <span className="text-[7.5px] sm:text-[10px] font-black uppercase text-yellow-300 tracking-wider mt-0.5 sm:mt-1 block">
                      {subtitleExtra}
                    </span>
                  )}
                  <div className="mt-3 sm:mt-6 w-full text-center">
                    <span className="text-[7.5px] sm:text-[9px] font-black uppercase tracking-widest text-white/50 block">
                      {language === 'en' ? 'NEXT DRAW' : 'পরবর্তী ড্র'}
                    </span>
                    <div className="mt-1.5 sm:mt-2.5">
                      {game.name === 'SCRATCH CARDS' ? (
                        <div className="bg-white/20 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest inline-block">
                          {language === 'en' ? 'INSTANT PLAY' : 'তাৎক্ষণিক খেলুন'}
                        </div>
                      ) : (
                        <CountdownTimer targetDate={drawDateObj} />
                      )}
                    </div>
                  </div>
                </div>

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
