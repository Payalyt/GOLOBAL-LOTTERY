import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export function LatestResults() {
  const navigate = useNavigate();
  const { historicalDraws, siteConfig, language } = useAuth();

  // Merge simulated drawings on top of siteConfig's configured draw results
  const customDraws = historicalDraws.map(hd => {
    const winnersCount = hd.winningNumbers.reduce((a, b) => a + b, 0) % 15;
    const prizesTotal = winnersCount * (hd.gameName.startsWith('MEGA') ? 250 : 50);
    return {
      id: hd.id,
      gameName: hd.gameName,
      date: hd.drawDate,
      numbers: hd.winningNumbers,
      totalWinners: `${winnersCount} Players`,
      totalPaid: `$${prizesTotal.toFixed(2)}`,
      country: hd.country || 'International'
    };
  });

  let baseResults = [...customDraws, ...(siteConfig?.drawResults || [])];
  
  // Ensure we have enough items for a continuous scroll without visual gaps
  if (baseResults.length > 0) {
    while (baseResults.length < 5) {
      baseResults = [...baseResults, ...baseResults];
    }
  }

  const renderCard = (result: any, idx: number, keyPrefix: string) => {
    const hasManyNumbers = result.numbers.length > 4;

    return (
      <motion.div 
        key={`${keyPrefix}-${idx}`}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10px" }}
        transition={{ duration: 0.45, delay: (idx % 3) * 0.08, ease: [0.215, 0.61, 0.355, 1] }}
        whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.35)" }}
        className="w-[310px] sm:w-[350px] md:w-[380px] flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded-[24px] p-5 shadow-sm flex flex-col justify-between select-none"
      >
        {/* Card Header: Title & ALL RESULTS Link */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-sans font-extrabold text-xl tracking-tight text-white uppercase leading-none">{result.gameName}</h4>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-1.5">
              {language === 'en' ? 'Results from' : 'ফলাফল তারিখ:'} {result.date}
            </p>
          </div>
          <button 
            onClick={() => navigate(`/results/${result.gameName}`)}
            className="text-[10px] font-extrabold text-zinc-300 hover:text-amber-500 transition-colors uppercase tracking-wider flex items-center gap-1 shrink-0"
          >
            {language === 'en' ? 'ALL RESULTS' : 'সব ফলাফল'} <span className="text-xs">→</span>
          </button>
        </div>

        {/* Inner Content Area */}
        <div className="bg-zinc-950 rounded-[20px] p-4 flex justify-between items-center gap-3 min-h-[76px]">
          {/* Left: Spheres row */}
          <div className={`flex flex-wrap gap-1.5 items-center ${hasManyNumbers ? 'justify-center w-full' : 'justify-start'}`}>
            {result.numbers.map((n: number, circleIdx: number) => {
              let sphereBg = 'bg-[#8F3EA5]';
              if (result.gameName === 'PICK2') sphereBg = 'bg-[#F29F05]';
              else if (result.gameName.startsWith('MEGA')) sphereBg = 'bg-[#E1BC4A]';
              else if (result.gameName === 'WILD5') sphereBg = 'bg-[#1C2C80]';
              else if (result.gameName === 'EASY6') sphereBg = 'bg-[#12A054]';

              return (
                <span 
                  key={circleIdx}
                  className={`${sphereBg} text-white font-sans font-bold text-xs w-8.5 h-8.5 rounded-full flex items-center justify-center shadow-sm shrink-0`}
                >
                  {n}
                </span>
              );
            })}
          </div>

          {/* Right: Stats block (hidden for games with many numbers to preserve space) */}
          {!hasManyNumbers && (
            <div className="text-right shrink-0 border-l border-zinc-800 pl-4 leading-tight space-y-1">
              <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Winners:' : 'মোট বিজয়ী:'} <span className="font-mono text-white">{result.totalWinners}</span>
              </div>
              <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                {language === 'en' ? 'Prizes:' : 'মোট পুরস্কার:'} <span className="font-mono font-black text-amber-500">{result.totalPaid || result.totalPrizes}</span>
              </div>
              {result.country && (
                <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                  {language === 'en' ? 'Country:' : 'দেশ:'} <span className="font-sans text-emerald-400 font-extrabold uppercase">{result.country}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom stats row for long-number games */}
        {hasManyNumbers && (
          <div className="mt-3 pt-2 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-400 font-semibold px-1">
            <div>
              {language === 'en' ? 'Winners: ' : 'বিজয়ী: '}
              <span className="text-white font-mono">{result.totalWinners}</span>
            </div>
            <div>
              {language === 'en' ? 'Prizes: ' : 'পুরস্কার: '}
              <span className="text-amber-500 font-mono">{result.totalPaid || result.totalPrizes}</span>
            </div>
            {result.country && (
              <div className="text-emerald-400 font-bold uppercase text-[9px] tracking-wider">
                {result.country}
              </div>
            )}
          </div>
        )}

      </motion.div>
    );
  };

  return (
    <div className="mt-12">
      {/* Header element to match mockup exactly */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-grow flex items-center gap-4">
          <h3 className="text-xl font-black tracking-wider text-zinc-900 dark:text-white shrink-0 uppercase">
            {language === 'en' ? 'LATEST RESULTS' : 'সর্বশেষ ফলাফল'}
          </h3>
          <div className="h-[2px] bg-zinc-200 dark:bg-zinc-850 flex-grow" />
        </div>
      </div>

      {/* Infinite Slider of Results */}
      <div className="overflow-hidden w-full relative group pb-4">
        <div className="flex w-max animate-marquee-left">
          {/* First Set */}
          <div className="flex gap-6 pr-6 w-max">
            {baseResults.map((result, idx) => renderCard(result, idx, 'set1'))}
          </div>
          {/* Second Set (Duplicate for seamless loop) */}
          <div className="flex gap-6 pr-6 w-max" aria-hidden="true">
            {baseResults.map((result, idx) => renderCard(result, idx, 'set2'))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default LatestResults;
