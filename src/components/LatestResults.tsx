import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LatestResults() {
  const navigate = useNavigate();
  const { historicalDraws, language } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = dir === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Mock initial result records to ensure high fidelity if no drawings have been simulated inside the Admin panel yet.
  // PICK2 and EASY6 are prioritized first to match the mockup perfectly on first render!
  const presetResults = [
    {
      gameName: 'PICK2',
      date: '26 Jun 2026, 10:30 am',
      numbers: [13, 6],
      totalWinners: 0,
      totalPrizes: '$0',
    },
    {
      gameName: 'EASY6',
      date: '26 Jun 2026',
      numbers: [33, 4, 39, 31, 27, 26],
      totalWinners: 0,
      totalPrizes: '$0',
    },
    {
      gameName: 'PICK1',
      date: '17 Jun 2026, 07:00 pm',
      numbers: [2],
      totalWinners: 142,
      totalPrizes: '$4,260.00',
    },
    {
      gameName: 'MEGA7',
      date: '15 Jun 2026, 09:00 pm',
      numbers: [4, 12, 18, 32, 49, 72, 85],
      totalWinners: 1254,
      totalPrizes: '$45,200.00',
    },
    {
      gameName: 'WILD5',
      date: '14 Jun 2026, 08:30 pm',
      numbers: [3, 11, 24, 38, 47],
      totalWinners: 531,
      totalPrizes: '$15,930.00',
    }
  ];

  // Merge simulated drawings on top of defaults
  const displayResults = [...historicalDraws.map(hd => {
    // Generate simulated winners stats
    const winnersCount = hd.winningNumbers.reduce((a, b) => a + b, 0) % 15;
    const prizesTotal = winnersCount * (hd.gameName.startsWith('MEGA') ? 250 : 50);

    return {
      gameName: hd.gameName,
      date: hd.drawDate,
      numbers: hd.winningNumbers,
      totalWinners: winnersCount,
      totalPrizes: `$${prizesTotal.toFixed(2)}`,
    };
  }), ...presetResults];

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
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <button 
            onClick={() => handleScroll('left')}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-xs transition-colors"
          >
            ←
          </button>
          <button 
            onClick={() => handleScroll('right')}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center font-bold text-xs transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Slider of Results */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayResults.map((result, idx) => {
          const hasManyNumbers = result.numbers.length > 4;

          return (
            <div 
              key={idx}
              className="w-[310px] sm:w-[350px] md:w-[380px] flex-shrink-0 bg-white dark:bg-zinc-900 border border-[#E5E5EB] dark:border-zinc-800 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all snap-start flex flex-col justify-between"
            >
              {/* Card Header: Title & ALL RESULTS Link */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-sans font-extrabold text-xl tracking-tight text-zinc-950 dark:text-white uppercase leading-none">{result.gameName}</h4>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium mt-1.5">
                    {language === 'en' ? 'Results from' : 'ফলাফল তারিখ:'} {result.date}
                  </p>
                </div>
                <button 
                  onClick={() => navigate(`/results/${result.gameName}`)}
                  className="text-[10px] font-extrabold text-zinc-950 dark:text-zinc-300 hover:text-[#E52535] dark:hover:text-red-400 transition-colors uppercase tracking-wider flex items-center gap-1 shrink-0"
                >
                  {language === 'en' ? 'ALL RESULTS' : 'সব ফলাফল'} <span className="text-xs">→</span>
                </button>
              </div>

              {/* Inner Content Area */}
              <div className="bg-[#F4F4F6] dark:bg-zinc-950 rounded-[20px] p-4 flex justify-between items-center gap-3 min-h-[76px]">
                {/* Left: Spheres row */}
                <div className={`flex flex-wrap gap-1.5 items-center ${hasManyNumbers ? 'justify-center w-full' : 'justify-start'}`}>
                  {result.numbers.map((n, circleIdx) => {
                    let sphereBg = 'bg-[#8F3EA5]';
                    if (result.gameName === 'PICK2') sphereBg = 'bg-[#F29F05]';
                    else if (result.gameName.startsWith('MEGA')) sphereBg = 'bg-[#DF1B2F]';
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
                  <div className="text-right shrink-0 border-l border-zinc-200/80 dark:border-zinc-800 pl-4 leading-tight space-y-1">
                    <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      {language === 'en' ? 'Total Winners:' : 'মোট বিজয়ী:'} <span className={`font-mono font-bold ${result.gameName === 'PICK2' ? 'text-[#F29F05]' : 'text-zinc-800 dark:text-zinc-200'}`}>{result.totalWinners}</span>
                    </div>
                    <div className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                      {language === 'en' ? 'Total Prizes:' : 'মোট পুরস্কার:'} <span className={`font-mono font-black ${result.gameName === 'PICK2' ? 'text-[#F29F05]' : 'text-zinc-800 dark:text-zinc-200'}`}>{result.totalPrizes}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
export default LatestResults;
