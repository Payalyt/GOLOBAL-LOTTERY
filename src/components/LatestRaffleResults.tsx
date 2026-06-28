import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Gift, ShieldCheck } from 'lucide-react';

export function LatestRaffleResults() {
  const { raffleWinners, language } = useAuth();

  return (
    <div className="mt-12">
      {/* Header section with styling */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-xl font-black tracking-wider text-zinc-900 dark:text-white shrink-0 uppercase">
              {language === 'en' ? 'DAILY SURE RAFFLE WINNERS' : 'দৈনিক শিওর র‌্যাফেল বিজয়ীগণ'}
            </h3>
          </div>
          <div className="h-[2px] bg-zinc-200 dark:bg-zinc-850 flex-grow" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {raffleWinners.map((w, i) => (
          <div 
            key={w.id || i} 
            className="bg-white dark:bg-zinc-900 border border-[#E5E5EB] dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group border-b-4 border-b-emerald-500"
          >
            {/* Soft decorative background spotlight */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E52535] rounded-full blur-[45px] opacity-[0.03] pointer-events-none" />

            {/* Premium "Verified Winner Claim" badge */}
            <div className="absolute top-2.5 right-3 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-transparent dark:border-emerald-900/40 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-2.5 h-2.5" /> {language === 'en' ? 'Verified' : 'যাচাইকৃত'}
            </div>

            <div className="flex gap-4 items-center">
              {/* Image or initials avatar */}
              {w.imageUrl ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-850 shrink-0 shadow-inner bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center">
                  <img src={w.imageUrl} alt={w.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className={`w-12 h-12 rounded-full ${w.avatarBg || 'bg-gradient-to-tr from-zinc-700 to-zinc-900'} text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-inner shrink-0 uppercase`}>
                  {w.initials}
                </div>
              )}

              <div className="space-y-0.5 leading-none text-left">
                <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">{w.game}</span>
                <span className="text-sm font-extrabold text-[#0F0D24] dark:text-white truncate max-w-[120px] inline-block">{w.name}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs">{w.flag}</span>
                  <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-450 uppercase">{w.country}</span>
                </div>
              </div>
            </div>

            {/* Ticket details badge row */}
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100/65 dark:border-zinc-850 rounded-xl p-3 mt-4 flex justify-between items-center">
              <div>
                <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-black uppercase block tracking-wider">
                  {language === 'en' ? 'WINNING TICKET' : 'বিজয়ী টিকিট'}
                </span>
                <span className="text-xs font-black font-mono tracking-wide text-zinc-700 dark:text-zinc-300 mt-1 block uppercase">
                  🎫 {w.ticket}
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[8px] text-[#E52535] dark:text-red-400 font-black uppercase tracking-widest block">
                  {language === 'en' ? 'CLAIMED VALUE' : 'দাবিকৃত মূল্য'}
                </span>
                <span className="text-sm font-black text-green-600 dark:text-emerald-400 mt-0.5 block">
                  {w.prize}
                </span>
              </div>
            </div>

          </div>
        ))}
        
        {raffleWinners.length === 0 && (
          <div className="col-span-full py-10 text-center bg-zinc-50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl">
            <Gift className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">
              {language === 'en' ? 'No active raffle winners declared today yet.' : 'আজকে এখনও কোনো র‌্যাফেল বিজয়ী ঘোষণা করা হয়নি।'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LatestRaffleResults;
