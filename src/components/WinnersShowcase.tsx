import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function WinnersShowcase() {
  const navigate = useNavigate();
  const { language } = useAuth();

  return (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: Robert Burkovski Grand Prize Winner */}
        <div className="bg-white dark:bg-zinc-900 border border-[#E5E5EB] dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
          <div className="p-4 flex-grow flex flex-col items-center">
            {/* Image card wrapper */}
            <div className="relative w-full rounded-2xl overflow-hidden aspect-square max-h-[300px]">
              <img 
                src="/src/assets/images/emirates_winner_robert_1781775078543.jpg" 
                alt={language === 'en' ? 'Robert Burkovski - Golobal Lottery Winner' : 'রবার্ট বারকোভস্কি - গ্লোবাল লটারি বিজয়ী'} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {/* Bottom blue info overlay matches mockup */}
              <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-[#1268A2] to-[#1AA3E5] text-white p-3 rounded-xl shadow-md text-center leading-none">
                <span className="text-[11px] font-black uppercase tracking-wider block">Robert Burkovski</span>
                <span className="text-base font-black tracking-tight block mt-1">$2,042,205</span>
              </div>
            </div>

            {/* Slider dots indicator underneath portrait */}
            <div className="flex gap-1 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
            </div>
          </div>

          <div className="bg-[#F8F9FA] dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-850 p-4 text-center">
            <span className="text-xs font-black uppercase tracking-widest text-[#151329] dark:text-zinc-200 select-none">
              {language === 'en' ? 'Grand Prize Winners' : 'গ্র্যান্ড প্রাইজ বিজয়ী'}
            </span>
          </div>
        </div>

        {/* CARD 2: YouTube Style Video Interview Block */}
        <div className="bg-white dark:bg-zinc-900 border border-[#E5E5EB] dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
          <div className="p-4 flex-grow flex flex-col justify-start">
            {/* Video player frame mockup */}
            <div className="relative w-full rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
              <img 
                src="/src/assets/images/emirates_interview_thumbnail_1781775097474.jpg" 
                alt="Golobal Lottery Winner Interview" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Glowing red play button */}
              <div className="absolute bg-[#DF1B2F] hover:bg-red-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-all cursor-pointer z-10">
                <Play className="w-6 h-6 fill-white ml-0.5" />
              </div>

              {/* Watch on YouTube indicator bottom left */}
              <div className="absolute bottom-2.5 left-3 bg-black/60 text-white px-2 py-1 rounded text-[9px] font-bold flex items-center gap-1">
                <span className="text-[#DF1B2F] font-black">▶</span> {language === 'en' ? 'Watch on YouTube' : 'ইউটিউবে দেখুন'}
              </div>

              {/* Title tag on top left */}
              <div className="absolute top-2.5 left-3 right-3 bg-black/50 text-white p-2 rounded text-[10px] font-black line-clamp-1 leading-none text-left">
                {language === 'en' ? "From Mother's Blessings to AED 100 Million" : "মায়ের দোয়া থেকে ১০০ মিলিয়ন দিরহাম"}
              </div>
            </div>

            {/* Video subheadings */}
            <div className="mt-4 text-left px-1.5">
              <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider block">
                {language === 'en' ? 'INTERVIEWS' : 'সাক্ষাৎকার'}
              </span>
              <p className="text-sm font-black text-zinc-950 dark:text-white leading-snug mt-1 uppercase">
                {language === 'en' ? 'Meet our lucky winners' : 'আমাদের ভাগ্যবান বিজয়ীদের সাথে দেখা করুন'}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal mt-1.5">
                {language === 'en' 
                  ? 'Discover the deep stories of global participants who completed life-changing draw wins.'
                  : 'জীবন বদলে দেওয়া ড্র বিজয়ী বৈশ্বিক অংশগ্রহণকারীদের গভীর গল্পগুলো আবিষ্কার করুন।'}
              </p>
            </div>
          </div>

          <div 
            onClick={() => navigate('/winners')}
            className="bg-[#F8F9FA] dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-850 p-4 text-center flex justify-between items-center px-6 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-300">
              {language === 'en' ? 'KNOW MORE' : 'আরও জানুন'}
            </span>
            <span className="text-xs font-bold text-red-600">→</span>
          </div>
        </div>

        {/* CARD 3: Deep Blue Winners Accumulator Box */}
        <div className="bg-[#151329] rounded-3xl p-6 flex flex-col justify-between shadow-xl min-h-[360px] text-white overflow-hidden group border border-[#1E1A3C]">
          {/* Accent graphics top-right */}
          <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-[#E52535] rounded-full blur-[70px] opacity-[0.15] pointer-events-none" />

          <div className="space-y-3.5 mt-4 relative z-10">
            <span className="text-xs font-bold text-[#1AA3E5] uppercase tracking-[0.2em] block">
              {language === 'en' ? 'TOTAL METRIC' : 'মোট পরিসংখ্যান'}
            </span>
            <h4 className="text-2xl font-black uppercase tracking-tight text-white leading-snug select-none">
              {language === 'en' ? 'Total winners & counting...' : 'মোট বিজয়ী এবং গণনা চলছে...'}
            </h4>
          </div>

          {/* Large dynamic figure counter */}
          <div className="text-left py-8 relative z-10 matches-accumulation-text matches-text-container">
            <p className="text-4xl sm:text-5xl font-black tracking-tight text-yellow-300 drop-shadow-[0_2px_10px_rgba(253,224,71,0.15)] select-all font-bold-font">
              1,230,692
            </p>
            <span className="text-[10px] font-extrabold text-white/50 tracking-wider block mt-2 uppercase">
              {language === 'en' ? 'Registered participants around the globe' : 'সারা বিশ্ব জুড়ে নিবন্ধিত অংশগ্রহণকারী'}
            </span>
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between items-center text-xs relative z-10">
            <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">
              {language === 'en' ? 'Live statistics' : 'লাইভ পরিসংখ্যান'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </div>

      </div>
    </div>
  );
}
export default WinnersShowcase;
