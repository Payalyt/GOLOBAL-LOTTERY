import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolveBannerImage } from './Hero';
import { motion } from 'motion/react';

export function WinnersShowcase() {
  const navigate = useNavigate();
  const { language, siteConfig } = useAuth();

  // Load custom grand prize winners or use fallback default
  const activeWinners = siteConfig.grandPrizeWinners?.filter(w => w.isActive) || [];
  const winnersToDisplay = activeWinners.length > 0 ? activeWinners : [
    {
      id: 'default',
      name: 'Robert Burkovski',
      prize: '$2,042,205',
      imageUrl: '/images/emirates_winner_robert_1781775078543.jpg'
    }
  ];

  const [currentWinnerIdx, setCurrentWinnerIdx] = useState(0);
  
  // Real-time ticking metrics states
  const [liveRegisteredUsers, setLiveRegisteredUsers] = useState<number>(0);
  const [liveTicketsPurchased, setLiveTicketsPurchased] = useState<number>(0);

  useEffect(() => {
    const baseUsers = parseInt((siteConfig.totalMetricRegisteredUsers || "119,230,692").replace(/[^0-9]/g, ''), 10) || 119230692;
    const baseTickets = parseInt((siteConfig.totalMetricTicketsPurchased || "105,485,912").replace(/[^0-9]/g, ''), 10) || 105485912;

    // Deterministic offset based on fixed epoch in early 2025
    const epoch = 1760000000000;
    const secondsPassed = Math.max(0, Math.floor((Date.now() - epoch) / 1000));
    
    // Rates represent units of growth.
    const rateUsers = Number(siteConfig.totalMetricRegisteredUsersRate) || 12;
    const rateTickets = Number(siteConfig.totalMetricTicketsPurchasedRate) || 25;

    // Calculate dynamic base value that increases deterministically over time
    const initialUsers = baseUsers + Math.floor(secondsPassed * (rateUsers / 100));
    const initialTickets = baseTickets + Math.floor(secondsPassed * (rateTickets / 100));

    setLiveRegisteredUsers(initialUsers);
    setLiveTicketsPurchased(initialTickets);

    // Dynamic ticker to increment values in real-time
    const interval = setInterval(() => {
      setLiveRegisteredUsers(prev => {
        const increment = Math.floor(Math.random() * Math.max(1, Math.round(rateUsers / 4))) + 1;
        return prev + increment;
      });
      setLiveTicketsPurchased(prev => {
        const increment = Math.floor(Math.random() * Math.max(1, Math.round(rateTickets / 4))) + 1;
        return prev + increment;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [siteConfig.totalMetricRegisteredUsers, siteConfig.totalMetricTicketsPurchased, siteConfig.totalMetricRegisteredUsersRate, siteConfig.totalMetricTicketsPurchasedRate]);

  const displayRegisteredUsers = liveRegisteredUsers > 0 
    ? liveRegisteredUsers.toLocaleString('en-US') 
    : (siteConfig.totalMetricRegisteredUsers || "119,230,692");

  const displayTicketsPurchased = liveTicketsPurchased > 0 
    ? liveTicketsPurchased.toLocaleString('en-US') 
    : (siteConfig.totalMetricTicketsPurchased || "105,485,912");

  // Auto-rotate grand prize winners if there are more than 1
  useEffect(() => {
    if (winnersToDisplay.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentWinnerIdx(prev => (prev + 1) % winnersToDisplay.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [winnersToDisplay.length]);

  // Handle slide index bounds
  useEffect(() => {
    if (currentWinnerIdx >= winnersToDisplay.length) {
      setCurrentWinnerIdx(0);
    }
  }, [winnersToDisplay.length, currentWinnerIdx]);

  const currentWinner = winnersToDisplay[currentWinnerIdx] || winnersToDisplay[0];

  // YouTube Configuration
  const youtubeVideoUrl = siteConfig.youtubeVideoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const youtubeThumbnailUrl = siteConfig.youtubeThumbnailUrl || "/images/emirates_interview_thumbnail_1781775097474.jpg";
  const youtubeVideoTitle = siteConfig.youtubeVideoTitle || (language === 'en' ? "From Mother's Blessings to AED 100 Million" : "মায়ের দোয়া থেকে ১০০ মিলিয়ন দিরহাম");
  const youtubeVideoSubtitle = siteConfig.youtubeVideoSubtitle || (language === 'en' ? 'INTERVIEWS' : 'সাক্ষাৎকার');
  const youtubeVideoDescription = siteConfig.youtubeVideoDescription || (language === 'en' ? 'Meet our lucky winners' : 'আমাদের ভাগ্যবান বিজয়ীদের সাথে দেখা করুন');
  const youtubeVideoDetails = siteConfig.youtubeVideoDetails || (language === 'en' 
    ? 'Discover the deep stories of global participants who completed life-changing draw wins.'
    : 'জীবন বদলে দেওয়া ড্র বিজয়ী বৈশ্বিক অংশগ্রহণকারীদের গভীর গল্পগুলো আবিষ্কার করুন।');

  return (
    <div id="winners-showcase-section" className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: Robert Burkovski / Custom Grand Prize Winner Slider */}
        <motion.div 
          id="card-grand-prize-winners" 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          transition={{ duration: 0.5, delay: 0 }}
          whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.35)" }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="p-4 flex-grow flex flex-col items-center">
            {/* Image card wrapper */}
            <div className="relative w-full rounded-2xl overflow-hidden aspect-square max-h-[300px]">
              <img 
                src={resolveBannerImage(currentWinner.imageUrl)} 
                alt={currentWinner.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {/* Bottom blue info overlay matches mockup */}
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-[#1268A2] to-[#1AA3E5] text-white p-3 rounded-xl shadow-md text-center leading-none">
                <span className="text-[11px] font-black uppercase tracking-wider block">{currentWinner.name}</span>
                <span className="text-base font-black tracking-tight block mt-1">{currentWinner.prize}</span>
              </div>
            </div>

            {/* Slider dots indicator underneath portrait */}
            {winnersToDisplay.length > 1 && (
              <div className="flex gap-1.5 mt-4">
                {winnersToDisplay.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentWinnerIdx(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentWinnerIdx ? 'bg-red-600 px-2' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
            {winnersToDisplay.length <= 1 && (
              <div className="flex gap-1 mt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
              </div>
            )}
          </div>

          <div className="bg-zinc-950 border-t border-zinc-850 p-4 text-center">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-200 select-none">
              {language === 'en' ? 'Grand Prize Winners' : 'গ্র্যান্ড প্রাইজ বিজয়ী'}
            </span>
          </div>
        </motion.div>

        {/* CARD 2: YouTube Style Video Interview Block */}
        <motion.div 
          id="card-youtube-interview" 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.35)" }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 flex flex-col justify-between group"
        >
          <div className="p-4 flex-grow flex flex-col justify-start">
            {/* Video player frame mockup */}
            <a 
              href={youtubeVideoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="relative w-full rounded-2xl overflow-hidden aspect-video flex items-center justify-center block cursor-pointer"
            >
              <img 
                src={resolveBannerImage(youtubeThumbnailUrl)} 
                alt="Golobal Lottery Winner Interview" 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
              {/* Glowing red play button */}
              <div className="absolute bg-[#DF1B2F] hover:bg-red-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-all z-10">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>

              {/* Watch on YouTube indicator bottom left */}
              <div className="absolute bottom-2.5 left-3 bg-black/60 text-white px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1 z-10">
                <span className="text-[#DF1B2F] font-black">▶</span> {language === 'en' ? 'Watch on YouTube' : 'ইউটিউবে দেখুন'}
              </div>

              {/* Title tag on top left */}
              <div className="absolute top-2.5 left-3 right-3 bg-black/50 text-white p-2 rounded text-[10px] font-black line-clamp-1 leading-none text-left z-10">
                {youtubeVideoTitle}
              </div>
            </a>

            {/* Video subheadings */}
            <div className="mt-4 text-left px-1.5">
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block">
                {youtubeVideoSubtitle}
              </span>
              <p className="text-sm font-black text-white leading-snug mt-1 uppercase">
                {youtubeVideoDescription}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal mt-1.5">
                {youtubeVideoDetails}
              </p>
            </div>
          </div>

          <a 
            href={youtubeVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-950 border-t border-zinc-850 p-4 text-center flex justify-between items-center px-6 cursor-pointer hover:bg-zinc-900 transition-colors"
          >
            <span className="text-xs font-black uppercase tracking-widest text-zinc-300">
              {language === 'en' ? 'KNOW MORE' : 'আরও জানুন'}
            </span>
            <span className="text-xs font-bold text-red-600">→</span>
          </a>
        </motion.div>

        {/* CARD 3: Deep Blue Winners Accumulator Box */}
        <motion.div 
          id="card-total-metrics" 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -6, scale: 1.015, boxShadow: "0 20px 30px -5px rgba(225,188,74,0.15)" }}
          className="bg-[#151329] rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[360px] text-white overflow-hidden group border border-[#1E1A3C] relative"
        >
          {/* Accent graphics top-right */}
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-[#E1BC4A] rounded-full blur-[70px] opacity-[0.15] pointer-events-none" />

          <div className="space-y-3.5 mt-2 relative z-10">
            <span className="text-xs font-bold text-[#1AA3E5] uppercase tracking-[0.2em] block">
              {language === 'en' ? 'TOTAL METRIC' : 'মোট পরিসংখ্যান'}
            </span>
            <h4 className="text-xl font-black uppercase tracking-tight text-white leading-snug select-none">
              {language === 'en' ? 'Total winners & counting...' : 'মোট বিজয়ী এবং গণনা চলছে...'}
            </h4>
          </div>

          {/* Large dynamic figures inside card */}
          <div className="text-left py-4 relative z-10 space-y-5">
            {/* Registered Users */}
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-yellow-300 drop-shadow-[0_2px_10px_rgba(253,224,71,0.15)] font-mono leading-none">
                {displayRegisteredUsers}
              </p>
              <span className="text-[10px] font-extrabold text-white/50 tracking-wider block mt-1.5 uppercase leading-none">
                {language === 'en' ? 'Registered participants around the globe' : 'সারা বিশ্ব জুড়ে নিবন্ধিত অংশগ্রহণকারী'}
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 w-full" />

            {/* Tickets Purchased */}
            <div>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-[#1AA3E5] drop-shadow-[0_2px_10px_rgba(26,163,229,0.15)] font-mono leading-none">
                {displayTicketsPurchased}
              </p>
              <span className="text-[10px] font-extrabold text-white/50 tracking-wider block mt-1.5 uppercase leading-none">
                {language === 'en' ? 'Total Tickets Sold & Drawn' : 'মোট বিক্রিত ও ড্র হওয়া টিকেট'}
              </span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-xs relative z-10 mt-2">
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">
              {language === 'en' ? 'Live statistics' : 'লাইভ পরিসংখ্যান'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
export default WinnersShowcase;
