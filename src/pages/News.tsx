import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { useAuth, NewsArticle } from '../context/AuthContext';

export function News() {
  const { newsArticles } = useAuth();
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  // Filter only active news articles
  const activeArticles = newsArticles.filter(n => n.isActive !== false);

  return (
    <div id="news-root-view" className="bg-[#FAF9FC] dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans pb-16">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Content Card Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-150 dark:border-zinc-850 space-y-8">
          
          {/* Back breadcrumb container */}
          <div className="flex justify-between items-center text-xs font-extrabold text-[#7e7e8d] uppercase tracking-wider">
            <Link 
              to="/" 
              className="hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#7e7e8d]" /> Back to Homepage
            </Link>
          </div>

          {/* Heading Row with divider line and dynamic "Play Now" button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-3xl font-black text-[#1E1B4B] dark:text-zinc-100 tracking-tight shrink-0 uppercase">
                News
              </h1>
              {/* Solid divider decoration */}
              <div className="flex-1 h-[2px] bg-zinc-200 dark:bg-zinc-800 self-center hidden sm:block" />
            </div>

            {/* Play Now Premium Button matching the screenshot */}
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 bg-[#121331] dark:bg-zinc-800 hover:bg-[#1C1D42] dark:hover:bg-zinc-700 text-white font-black text-xs tracking-widest px-6 py-2.5 rounded-full uppercase leading-none shadow transition-all active:scale-98 shrink-0 self-start sm:self-center"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" /> Play Now
            </Link>
          </div>

          {/* Grid of Articles (3 columns on medium/large) */}
          {activeArticles.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl border border-zinc-150 dark:border-zinc-800">
              <Sparkles className="w-12 h-12 text-zinc-300 mx-auto mb-3 animate-pulse" />
              <p className="text-zinc-500 dark:text-zinc-400 font-extrabold text-sm uppercase tracking-wider">No News Available</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1 font-semibold">Check back soon for the latest drawing winners, announcements and lotto releases!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
              {activeArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="bg-white dark:bg-zinc-900/40 rounded-2xl border border-gray-150 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
                >
                  <div>
                    
                    {/* Photo Head with Premium Graphic Banners */}
                    <div 
                      className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden select-none shrink-0"
                      style={
                        article.bgType === 'color' && article.bannerBg
                          ? { backgroundColor: article.bannerBg }
                          : article.bgType === 'gradient' && article.bannerBg
                          ? { background: article.bannerBg }
                          : {}
                      }
                    >
                      {(!article.bgType || article.bgType === 'image') && article.imageUrl ? (
                        <img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      ) : (article.bgType === 'color' || article.bgType === 'gradient') ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-white/20 animate-pulse" />
                        </div>
                      ) : null}

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
                      <p className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 font-sans uppercase">
                        {article.date}
                      </p>
                      <h3 className="font-extrabold text-base text-zinc-950 dark:text-zinc-100 leading-snug line-clamp-2 uppercase tracking-tight group-hover:text-red-650 dark:group-hover:text-red-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold leading-relaxed line-clamp-3">
                        {article.excerpt}
                      </p>
                    </div>

                  </div>

                  {/* READ MORE Outline Button at Footer of Card */}
                  <div className="p-5 pt-0">
                    <button 
                      onClick={() => setActiveArticle(article)}
                      className="w-full sm:w-auto text-center border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-950 dark:text-zinc-200 bg-white dark:bg-zinc-900 font-black text-[10px] tracking-widest px-5 py-2.5 rounded-lg transition-colors uppercase cursor-pointer"
                    >
                      Read More
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

          {/* Pagination Component exactly matching < 01 02 03 ... 08 > */}
          <div className="flex justify-center items-center gap-2 pt-8">
            <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-400 disabled:opacity-45" disabled>
              &lt;
            </button>
            
            <button className="w-8 h-8 rounded-full bg-zinc-950 dark:bg-zinc-800 text-[#FFEB4A] font-bold text-xs flex items-center justify-center shadow select-none">
              01
            </button>
            
            <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-bold text-xs flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-all select-none">
              02
            </button>

            <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-bold text-xs flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-all select-none">
              03
            </button>

            <span className="text-zinc-400 dark:text-zinc-600 text-xs px-1 select-none">...</span>

            <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-bold text-xs flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 active:scale-95 transition-all select-none">
              08
            </button>

            <button className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-all">
              &gt;
            </button>
          </div>

        </div>

      </div>

      {/* Lightbox Modal overlay for the full article popup */}
      {activeArticle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 max-w-lg w-full relative">
            
            {/* Image Header with styled banner decoration */}
            <div 
              className="relative aspect-video bg-zinc-100 dark:bg-zinc-800 select-none"
              style={
                activeArticle.bgType === 'color' && activeArticle.bannerBg
                  ? { backgroundColor: activeArticle.bannerBg }
                  : activeArticle.bgType === 'gradient' && activeArticle.bannerBg
                  ? { background: activeArticle.bannerBg }
                  : {}
              }
            >
              {(!activeArticle.bgType || activeArticle.bgType === 'image') && activeArticle.imageUrl ? (
                <img 
                  src={activeArticle.imageUrl} 
                  alt={activeArticle.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (activeArticle.bgType === 'color' || activeArticle.bgType === 'gradient') ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white/20 animate-pulse" />
                </div>
              ) : null}
              {activeArticle.bannerSubtitle && (
                <div className={`absolute bottom-0 inset-x-0 p-3 px-4 text-xs font-black flex items-center justify-between ${activeArticle.bannerBg}`}>
                  <span>{activeArticle.bannerTitle}</span>
                  <span className="font-mono">{activeArticle.bannerSubtitle}</span>
                </div>
              )}
            </div>

            {/* Core details inside Modal */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-black tracking-wide text-zinc-400 dark:text-zinc-500 font-sans uppercase">
                <span>Golobal Lottery Official</span>
                <span>{activeArticle.date}</span>
              </div>
              <h3 className="font-extrabold text-lg sm:text-xl text-zinc-950 dark:text-zinc-100 uppercase tracking-tight leading-snug">
                {activeArticle.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-semibold">
                {activeArticle.excerpt} This lottery winning announcement represents an official verify action inside the Golobal Lottery verified directory. All entries are structured securely on our backend cloud structures.
              </p>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 text-center text-[11px] text-zinc-700 dark:text-yellow-250 font-bold">
                🎫 Every ticket purchase contributes to our flag CSR coral reef programs and creates new automatic raffle prize entries. Click "Play Now" at the main news page to take your chances!
              </div>
            </div>

            {/* Bottom Closing Trigger button */}
            <div className="p-6 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="w-full bg-[#121331] dark:bg-zinc-800 hover:bg-black dark:hover:bg-zinc-750 text-white font-black text-xs py-3.5 tracking-widest rounded-xl transition-all uppercase cursor-pointer"
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
