import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Raffles() {
  const { addTickets } = useCart();
  const { language, dynamicGames } = useAuth();
  const navigate = useNavigate();

  // Dynamic ticket amounts chosen by keys
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({
    'SURE 1': 1,
    'SURE 2': 1,
    'SURE 3': 1,
  });

  const handleAdjustCount = (raffleName: string, dir: 'inc' | 'dec') => {
    setTicketCounts(prev => {
      const current = prev[raffleName] || 1;
      const next = dir === 'inc' ? current + 1 : Math.max(1, current - 1);
      return { ...prev, [raffleName]: next };
    });
  };

  const handleAddRaffleToCart = (raffleName: string, pricePerTicket: number) => {
    const qty = ticketCounts[raffleName] || 1;
    const newRaffleTickets = [];

    // Each SURE raffle ticket represents 5 numbers from 1 to 49
    for (let q = 0; q < qty; q++) {
      const numbers: number[] = [];
      while (numbers.length < 5) {
        const pin = Math.floor(Math.random() * 49) + 1;
        if (!numbers.includes(pin)) numbers.push(pin);
      }
      numbers.sort((a, b) => a - b);

      newRaffleTickets.push({
        id: Date.now() + Math.floor(Math.random() * 10000),
        numbers,
        price: pricePerTicket,
        gameName: raffleName,
        isFavorite: false
      });
    }

    addTickets(newRaffleTickets);
    alert(
      language === 'en' 
        ? `🎉 Successfully added ${qty} ticket(s) for ${raffleName} to your cart!`
        : `🎉 সফলভাবে আপনার কার্টে ${raffleName}-এর জন্য ${qty}টি টিকিট যোগ করা হয়েছে!`
    );

    // Reset qty to 1
    setTicketCounts(prev => ({ ...prev, [raffleName]: 1 }));
  };

  const defaultRaffles = [
    {
      name: 'SURE 1',
      prize: '$30,000',
      price: 10,
      left: 4547,
      total: 5000,
      bg: 'linear-gradient(135deg, #E52554 0%, #B0173A 100%)',
      progress: 91,
      customUrl: ''
    },
    {
      name: 'SURE 2',
      prize: '$50,000',
      price: 15,
      left: 3561,
      total: 5000,
      bg: 'linear-gradient(135deg, #8F3EA5 0%, #5C236E 100%)',
      progress: 71,
      customUrl: ''
    },
    {
      name: 'SURE 3',
      prize: '$360,000',
      price: 30,
      left: 8318,
      total: 20000,
      bg: 'linear-gradient(135deg, #12A098 0%, #0A6762 100%)',
      progress: 41,
      customUrl: ''
    }
  ];

  const rafflesData = defaultRaffles.map(def => {
    const live = dynamicGames?.find(g => g.name.toUpperCase() === def.name.toUpperCase());
    if (live) {
      const left = live.leftTickets !== undefined ? Number(live.leftTickets) : def.left;
      const total = live.totalTickets !== undefined ? Number(live.totalTickets) : def.total;
      const progress = total > 0 ? Math.round((left / total) * 100) : 0;
      
      let background = def.bg;
      if (live.cardBgType === 'gradient' && live.cardBgGradient) {
        background = live.cardBgGradient;
      } else if (live.cardBgType === 'color' && live.bgHex) {
        background = live.bgHex;
      } else if (live.bgHex) {
        background = live.bgHex;
      }

      return {
        name: live.name,
        prize: live.prize || def.prize,
        price: live.price || def.price,
        left,
        total,
        bg: background,
        progress,
        customUrl: live.customUrl
      };
    }
    return def;
  });

  return (
    <div className="bg-[#0D0B1E] text-white py-12 px-6 sm:px-10 rounded-3xl mt-12 overflow-hidden shadow-2xl relative border border-slate-900">
      
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#8F3EA5] rounded-full blur-[140px] opacity-[0.14] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#12A098] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />

      {/* Title block to match the Golobal Lottery interface */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex-grow flex items-center gap-4">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-[0.25em] text-[#12A098] uppercase">
              {language === 'en' ? 'RAFFLE DRAWS' : 'র‌্যাফেল ড্র'}
            </span>
            <span className="text-xl font-black text-white mt-1 uppercase tracking-wide">
              {language === 'en' ? 'SURE WIN DRAWS' : 'শিওর উইন ড্র'}
            </span>
          </div>
          <div className="h-[1px] bg-slate-800 flex-grow" />
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <button className="w-8 h-8 rounded-full border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors">
            ←
          </button>
          <button className="w-8 h-8 rounded-full border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors">
            →
          </button>
        </div>
      </div>

      {/* Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {rafflesData.map((raffle) => {
          const qty = ticketCounts[raffle.name] || 1;
          const totalCost = raffle.price * qty;
          const bgStyle = raffle.bg.startsWith('linear') || raffle.bg.startsWith('radial')
            ? { backgroundImage: raffle.bg }
            : { backgroundColor: raffle.bg };

          return (
            <div 
              key={raffle.name} 
              style={bgStyle}
              className="rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[390px] hover:scale-[1.01] transition-transform duration-300 relative group overflow-hidden"
            >
              {/* Dotted translucent grid overlay on card */}
              <div className="absolute inset-0 bg-opacity-[0.15] pointer-events-none" style={{
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 0)',
                backgroundSize: '15px 15px',
              }} />

              {/* Top Row: Title badge */}
              <div className="flex justify-between items-start w-full relative z-10">
                <span className="font-mono text-zinc-300 text-[10px] uppercase font-bold tracking-widest bg-black/15 px-3 py-1 rounded-full border border-white/5">
                  {language === 'en' ? 'EXCLUSIVE DRAW' : 'বিশেষ ড্র'}
                </span>
                <h4 className="text-xl font-black tracking-wider text-white select-none">{raffle.name}</h4>
              </div>

              {/* Mid Row: Prize & Tickets left */}
              <div className="my-auto py-4 relative z-10 space-y-1.5 matches-text-container text-left">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest block">
                  {language === 'en' ? 'PRIZE' : 'পুরস্কার'}
                </span>
                <p className="text-4xl font-extrabold tracking-tight text-white select-all">{raffle.prize}</p>
                
                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-white/95 font-semibold">
                    <span>{language === 'en' ? 'TICKETS LEFT' : 'টিকিট বাকি'}</span>
                    <span className="font-mono text-yellow-300 font-bold">
                      {raffle.left.toLocaleString()} <span className="text-white/70">{language === 'en' ? 'of' : '/'} {raffle.total.toLocaleString()}</span>
                    </span>
                  </div>
                  {/* Custom progress visual bar */}
                  <div className="w-full bg-black/30 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-yellow-300 h-full rounded-full transition-all duration-500"
                      style={{ width: `${raffle.total > 0 ? (raffle.left / raffle.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom control rows & Buy actions */}
              <div className="border-t border-white/10 pt-4 relative z-10 space-y-4">
                
                {/* Selector Row */}
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-white/60 block uppercase font-bold leading-tight">
                      {language === 'en' ? 'Price per Ticket' : 'টিকিট প্রতি মূল্য'}
                    </span>
                    <span className="text-sm font-black text-white font-mono mt-0.5 inline-block">${raffle.price}</span>
                  </div>

                  {/* Interacting selectors */}
                  <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5 text-sm">
                    <button 
                      type="button"
                      onClick={() => handleAdjustCount(raffle.name, 'dec')}
                      className="text-white hover:text-yellow-300 font-bold px-1 select-none active:scale-90"
                    >
                      －
                    </button>
                    <span className="font-mono font-bold text-white w-4 text-center select-none">{qty}</span>
                    <button 
                      type="button"
                      onClick={() => handleAdjustCount(raffle.name, 'inc')}
                      className="text-white hover:text-yellow-300 font-bold px-1 select-none active:scale-90"
                    >
                      ＋
                    </button>
                  </div>
                </div>

                {/* Final Button action */}
                <div className="flex justify-between items-center gap-4">
                  <div className="leading-none text-left">
                    <span className="text-[9px] text-white/60 uppercase font-black tracking-widest block">
                      {language === 'en' ? 'TOTAL' : 'মোট'}
                    </span>
                    <span className="text-base font-black text-white font-mono mt-1 inline-block">${totalCost}</span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      if (raffle.customUrl) {
                        if (raffle.customUrl.startsWith('http')) {
                          window.open(raffle.customUrl, '_blank');
                        } else {
                          navigate(raffle.customUrl);
                        }
                      } else {
                        handleAddRaffleToCart(raffle.name, raffle.price);
                      }
                    }}
                    className="flex-1 bg-[#E1BC4A] hover:bg-yellow-500 text-[#121D3D] font-extrabold text-[10px] tracking-wider uppercase py-3 px-4 rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-center"
                  >
                    {raffle.customUrl 
                      ? (language === 'en' ? 'GO TO DRAW' : 'ড্র-তে যান') 
                      : (language === 'en' ? 'ADD TO CART' : 'কার্টে যোগ করুন')}
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}

export default Raffles;
