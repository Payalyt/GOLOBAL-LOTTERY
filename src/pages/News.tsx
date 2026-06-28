import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';

interface NewsArticle {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerBg?: string; // CSS tailwind configuration
}

const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: 'Emirate Draw: Indian Player Wins INR 2.8 Million!',
    excerpt: "How one man's belief paid off big and why your moment could be next. He started with a single ticket and is now celebrating with family.",
    date: '11 June 2026',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    bannerTitle: 'SURE 1 WINNER',
    bannerSubtitle: '$30,000',
    bannerBg: 'bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 text-white',
  },
  {
    id: 2,
    title: 'One Number Away From $4 Million: Three Indian Expats Celebrate Golobal Lottery Wins',
    excerpt: 'Now, $50 Million MEGA7 Opportunity Awaits This Sunday. All three matched 6 of the 7 numbers to unlock the secondary prizes.',
    date: '4 June 2026',
    imageUrl: 'https://images.unsplash.com/photo-1556157382-97dea7d240ff?auto=format&fit=crop&q=80&w=400',
    bannerTitle: 'Winners every week!',
    bannerSubtitle: '$8,333 EASY6 WINNER',
    bannerBg: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white',
  },
  {
    id: 3,
    title: 'Golobal Lottery: You Spend This Much Every Week. Make It Count!',
    excerpt: 'A limited-time offer and the belief that one ticket can change everything. Check out our Eid special multipliers to learn more.',
    date: '29 May 2026',
    imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400',
    bannerTitle: 'EID BONANZA',
    bannerSubtitle: 'WIN 52 FREE TICKETS',
    bannerBg: 'bg-gradient-to-r from-red-650 from-red-600 via-[#E52535] to-amber-500 text-white',
  },
  {
    id: 4,
    title: 'Golobal Lottery Highlights Why Thousands of Players Return Every Week',
    excerpt: 'Limited-time promotions and life-changing prize opportunities continue to drive engagement globally. Explore our ongoing ticket referral systems.',
    date: '21 May 2026',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bannerTitle: 'FLASH SALE',
    bannerSubtitle: 'ONLY FOR $50',
    bannerBg: 'bg-gradient-to-r from-[#1E2E80] to-indigo-500 text-white',
  },
  {
    id: 5,
    title: '$25,000 Golobal Lottery EASY6 Brings Life-Changing Moment for One Indian Family',
    excerpt: 'The lucky winner almost hit $4 million. With his winnings, he plans to secure his daughters university education fees and travel home.',
    date: '14 May 2026',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    bannerTitle: 'Tamil Nadu is on fire!',
    bannerSubtitle: '$25,000 EASY6 WINNER',
    bannerBg: 'bg-gradient-to-r from-green-600 to-emerald-500 text-white',
  },
  {
    id: 6,
    title: 'One Number Away: Expat in Qatar Wins Big & the $50 Million Dream Isn\'t Over Yet',
    excerpt: 'Golobal Lottery Turns Everyday Hope Into Reality for Latest MEGA7 Winner. He has played consecutively for several draws and finally hit gold.',
    date: '7 May 2026',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    bannerTitle: 'One number away!',
    bannerSubtitle: '$40,000 WINNER',
    bannerBg: 'bg-gradient-to-r from-[#7C3AED] via-purple-600 to-purple-800 text-white',
  },
];

export function News() {
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  return (
    <div id="news-root-view" className="bg-[#FAF9FC] min-h-screen text-zinc-900 font-sans pb-16">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Content Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-150 space-y-8">
          
          {/* Back breadcrumb container */}
          <div className="flex justify-between items-center text-xs font-extrabold text-[#7e7e8d] uppercase tracking-wider">
            <Link 
              to="/" 
              className="hover:text-zinc-950 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#7e7e8d]" /> Back to Homepage
            </Link>
          </div>

          {/* Heading Row with divider line and dynamic "Play Now" button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-3xl font-black text-[#1E1B4B] tracking-tight shrink-0 uppercase">
                News
              </h1>
              {/* Solid divider decoration */}
              <div className="flex-1 h-[2px] bg-zinc-200 self-center hidden sm:block" />
            </div>

            {/* Play Now Premium Button matching the screenshot */}
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 bg-[#121331] hover:bg-[#1C1D42] text-white font-black text-xs tracking-widest px-6 py-2.5 rounded-full uppercase leading-none shadow transition-all active:scale-98 shrink-0 self-start sm:self-center"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" /> Play Now
            </Link>
          </div>

          {/* Grid of Articles (3 columns on medium/large) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
            {newsArticles.map((article) => (
              <div 
                key={article.id} 
                className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  
                  {/* Photo Head with Premium Graphic Banners */}
                  <div className="relative aspect-video w-full bg-zinc-100 overflow-hidden relative select-none shrink-0">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />

                    {/* Highly styled banner representing screenshot's overlay elements */}
                    {article.bannerTitle && (
                      <div className={`absolute bottom-0 inset-x-0 p-2 px-3 text-xs font-bold font-sans flex items-center justify-between ${article.bannerBg} shadow-inner`}>
                        <span className="uppercase tracking-wide font-black truncate max-w-[60%]">{article.bannerTitle}</span>
                        <span className="font-mono font-black border-l border-white/20 pl-2 shrink-0">{article.bannerSubtitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="p-5 space-y-3">
                    <p className="text-[11px] font-black text-zinc-400 font-sans uppercase">
                      {article.date}
                    </p>
                    <h3 className="font-extrabold text-base text-zinc-950 leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-red-650 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-zinc-500 text-xs font-semibold leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                </div>

                {/* READ MORE Outline Button at Footer of Card */}
                <div className="p-5 pt-0">
                  <button 
                    onClick={() => setActiveArticle(article)}
                    className="w-full sm:w-auto text-center border border-zinc-200 hover:border-zinc-400 text-zinc-950 bg-white font-black text-[10px] tracking-widest px-5 py-2.5 rounded-lg transition-colors uppercase"
                  >
                    Read More
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Pagination Component exactly matching < 01 02 03 ... 08 > */}
          <div className="flex justify-center items-center gap-2 pt-8">
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-zinc-400 disabled:opacity-45" disabled>
              &lt;
            </button>
            
            <button className="w-8 h-8 rounded-full bg-zinc-950 text-[#FFEB4A] font-bold text-xs flex items-center justify-center shadow select-none">
              01
            </button>
            
            <button className="w-8 h-8 rounded-full border border-gray-200 text-zinc-500 hover:text-zinc-950 font-bold text-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all select-none">
              02
            </button>

            <button className="w-8 h-8 rounded-full border border-gray-200 text-zinc-500 hover:text-zinc-950 font-bold text-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all select-none">
              03
            </button>

            <span className="text-zinc-400 text-xs px-1 select-none">...</span>

            <button className="w-8 h-8 rounded-full border border-gray-200 text-zinc-500 hover:text-zinc-950 font-bold text-xs flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all select-none">
              08
            </button>

            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 text-zinc-500 hover:text-zinc-950 transition-all">
              &gt;
            </button>
          </div>

        </div>

      </div>

      {/* Lightbox Modal overlay for the full article popup */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-w-lg w-full relative">
            
            {/* Image Header with styled banner decoration */}
            <div className="relative aspect-video bg-zinc-100 select-none">
              <img 
                src={activeArticle.imageUrl} 
                alt={activeArticle.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {activeArticle.bannerSubtitle && (
                <div className={`absolute bottom-0 inset-x-0 p-3 px-4 text-xs font-black flex items-center justify-between ${activeArticle.bannerBg}`}>
                  <span>{activeArticle.bannerTitle}</span>
                  <span className="font-mono">{activeArticle.bannerSubtitle}</span>
                </div>
              )}
            </div>

            {/* Core details inside Modal */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-black tracking-wide text-zinc-400 font-sans uppercase">
                <span>Golobal Lottery Official</span>
                <span>{activeArticle.date}</span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-zinc-950 uppercase tracking-tight leading-snug">
                {activeArticle.title}
              </h3>
              <p className="text-zinc-650 text-zinc-600 text-xs sm:text-sm leading-relaxed font-semibold">
                {activeArticle.excerpt} This lottery winning announcement represents an official verify action inside the Golobal Lottery verified directory. All entries are structured securely on our backend cloud structures.
              </p>
              
              <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-101 text-center text-[11px] text-zinc-700 font-bold">
                🎫 Every ticket purchase contributes to our flag CSR coral reef programs and creates new automatic raffle prize entries. Click "Play Now" at the main news page to take your chances!
              </div>
            </div>

            {/* Bottom Closing Trigger button */}
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="w-full bg-[#121331] hover:bg-black text-white font-black text-xs py-3.5 tracking-widest rounded-xl transition-all uppercase"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default News;
