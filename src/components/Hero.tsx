import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function resolveBannerImage(url: string): string {
  if (!url) return '';
  // Convert standard Imgbb sharing link to direct image link!
  // e.g., https://ibb.co/spTPp8qB -> https://i.ibb.co/spTPp8qB/image.png
  // e.g., http://ibb.co/spTPp8qB -> https://i.ibb.co/spTPp8qB/image.png
  const imgbbRegex = /https?:\/\/ibb\.co\/([a-zA-Z0-9]+)/i;
  const match = url.match(imgbbRegex);
  if (match && match[1]) {
    return `https://i.ibb.co/${match[1]}/image.png`;
  }
  return url;
}

export function Hero() {
  const navigate = useNavigate();
  const { siteConfig, language } = useAuth();
  
  // Find active custom banners
  const activeBanners = siteConfig.banners?.filter(b => b.isActive) || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play timer for custom banners
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % activeBanners.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % activeBanners.length);
  };

  // If there are active custom banners, render the dynamic slider
  if (activeBanners.length > 0) {
    const banner = activeBanners[currentSlide];
    const resolvedImageUrl = resolveBannerImage(banner.imageUrl);

    // Dynamic background styles based on customized configurations
    let bgStyle: React.CSSProperties = {};
    if (banner.bgType === 'color') {
      bgStyle = {
        backgroundColor: banner.bgColor || '#0f0f14',
        borderColor: `${siteConfig.primaryHex}40`
      };
    } else if (banner.bgType === 'gradient') {
      bgStyle = {
        backgroundImage: banner.bgGradient || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        borderColor: `${siteConfig.primaryHex}40`
      };
    } else {
      // Default / Image background
      const shadowGradient = banner.hideShadow 
        ? 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0))'
        : 'linear-gradient(135deg, rgba(10, 10, 15, 0.95) 35%, rgba(15, 15, 25, 0.5) 65%, rgba(0, 0, 0, 0.95) 100%)';
        
      bgStyle = {
        backgroundImage: `${shadowGradient}, url(${resolvedImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderColor: `${siteConfig.primaryHex}40`
      };
    }

    const textColor = banner.textColor || '#ffffff';
    const buttonBgColor = banner.buttonColor || '#FFD700';
    const buttonTextColor = banner.buttonTextColor || '#09090b';
    
    return (
      <div 
        className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] min-h-[350px] sm:min-h-[420px] flex flex-col md:flex-row items-center justify-between p-6 sm:p-12 shadow-2xl border transition-all duration-750 ease-in-out"
        style={bgStyle}
      >
        {/* Absolute ambient light overlays */}
        {banner.bgType === 'image' && !banner.hideShadow && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
        )}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/10 via-transparent to-white/10 pointer-events-none" />
        {!banner.hideShadow && (
          <div className="absolute bottom-0 left-1/4 w-1/2 h-[120px] bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        )}
        
        {/* LEFT/RIGHT CAROUSEL NAVIGATION CONTROLS */}
        {activeBanners.length > 1 && (
          <>
            <button 
              onClick={handlePrevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* LEFT CONTENT: Banner Description & Headers */}
        <div className="relative w-full md:w-[65%] flex flex-col justify-center items-start text-left z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span 
              className="text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-md uppercase flex items-center gap-1 shadow-md border border-white/10"
              style={{ backgroundColor: siteConfig.primaryHex }}
            >
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
              {language === 'en' ? 'EXCLUSIVE CAMPAIGN' : 'বিশেষ ক্যাম্পেইন'}
            </span>
            {activeBanners.length > 1 && (
              <span className="bg-black/60 text-zinc-400 border border-zinc-800 text-[8.5px] font-mono px-2 py-0.5 rounded-full font-bold">
                SLIDE {currentSlide + 1} OF {activeBanners.length}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <h2 
              className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight alfa-slab-one-regular drop-shadow-md uppercase"
              style={{ color: textColor }}
            >
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p 
                className="text-[12px] sm:text-base md:text-lg font-medium max-w-xl leading-relaxed drop-shadow opacity-90"
                style={{ color: textColor }}
              >
                {banner.subtitle}
              </p>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="button"
              onClick={() => navigate(banner.linkUrl || '/dashboard')}
              className="w-full sm:w-auto hover:opacity-95 font-black text-xs uppercase px-10 py-4 rounded-xl tracking-widest transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] cursor-pointer shadow-lg flex items-center justify-center gap-2 border border-black/10"
              style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            >
              {banner.buttonText || (language === 'en' ? "EXPLORE NOW" : "খেলুন এখনই")}
              <ArrowRight className="w-4 h-4 stroke-[3]" style={{ color: buttonTextColor }} />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Decorative Glassmorphism card framing the image detail or showing empty spacing */}
        {resolvedImageUrl && (
          <div className="relative w-full md:w-[30%] flex justify-center md:justify-end items-center mt-8 md:mt-0 z-10">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFD700]/10 to-transparent rounded-[24px] blur-xl pointer-events-none" />
            <div className="bg-black/45 backdrop-blur-md p-2 rounded-[28px] border border-white/10 shadow-2xl overflow-hidden max-w-[240px] transform hover:rotate-2 transition-transform duration-500 hidden md:block">
              <img 
                src={resolvedImageUrl} 
                alt={banner.title} 
                className="w-full h-[200px] object-cover rounded-[20px] shadow-inner"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {/* BOTTOM DOTS NAVIGATION */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 select-none z-20">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide 
                    ? 'bg-yellow-400 scale-125 w-6' 
                    : 'bg-white/20 hover:bg-white/40'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // FALLBACK: Default Golobal Lottery static hero banner (original style perfectly preserved!)
  return (
    <div 
      className="relative w-full overflow-hidden rounded-[24px] sm:rounded-[32px] min-h-[350px] sm:min-h-[420px] flex flex-col md:flex-row items-center justify-between p-6 sm:p-12 shadow-2xl border"
      style={{ 
        background: siteConfig.heroBannerBgType === 'solid' 
          ? siteConfig.heroBannerBgSolidHex 
          : `linear-gradient(135deg, ${siteConfig.primaryHex}, #1c0204)`,
        borderColor: siteConfig.heroBannerBgType === 'solid'
          ? `${siteConfig.heroBannerBgSolidHex}50`
          : `${siteConfig.primaryHex}50`
      }}
    >
      {/* Absolute background graphics & overlay particles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[-80px] left-[-80px] w-[500px] h-[500px] bg-[#FF2E42] rounded-full blur-[150px] opacity-25 pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-yellow-500 rounded-full blur-[130px] opacity-15 pointer-events-none" />
      
      {/* Dynamic Star Overlay */}
      <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm1-61c3.105 0 5.622-2.517 5.622-5.622S38.105 17.756 35 17.756s-5.622 2.517-5.622 5.622S31.895 29 35 29zM19 64c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm62 20c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z'/%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* LEFT SIDE: Stylized Mascot Image & Floating Badges */}
      <div className="relative w-full md:w-[45%] flex justify-center md:justify-start items-center h-full z-10 shrink-0">
        
        {/* Animated 3 Days badge */}
        <div className="absolute -top-6 -left-2 md:-left-4 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] border-4 border-white text-zinc-950 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex flex-col items-center justify-center shadow-2xl transform -rotate-12 z-20 animate-bounce cursor-default select-none">
          <span className="text-2xl sm:text-3xl font-black leading-none tracking-tight">{siteConfig.heroDaysToGo}</span>
          <span className="text-[8px] sm:text-[9.5px] font-black tracking-widest text-center leading-tight">{language === 'en' ? <>DAYS<br />TO GO</> : <>দিন<br />বাকি</>}</span>
        </div>

        {/* Floating VIP Badge overlay */}
        <div className="absolute -bottom-4 right-2 sm:right-6 md:-right-4 bg-black/85 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-xl z-20 transform rotate-3 select-none">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-[10px] font-black uppercase tracking-wider">{language === 'en' ? 'GUESS & WIN BIG' : 'অনুমান করুন ও জিতুন'}</span>
        </div>

        {/* Dynamic Illustrator Image Card with gold tinting border */}
        <div className="relative max-w-[240px] sm:max-w-[340px] md:max-w-md w-full rounded-[20px] sm:rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 mt-4 md:mt-0 group bg-black">
          <img 
            src={resolveBannerImage(siteConfig.bannerMascotUrl)} 
            alt="Golobal Lottery Winner" 
            className="w-full object-cover scale-[1.02] group-hover:scale-105 transition-transform duration-[1200ms] h-[200px] sm:h-[280px] md:h-[320px]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/src/assets/images/emirates_winner_mascot_1781774955947.jpg";
            }}
          />
          {/* Shimmer gradient glass layer */}
          {!siteConfig.hideHeroShadow && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
          )}
          <div className="absolute bottom-4 left-4">
            <div 
              className="flex items-center gap-1.5 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest shadow-md"
              style={{ backgroundColor: siteConfig.primaryHex }}
            >
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
              {language === 'en' ? 'GRAND PRIZE IS WAITING' : 'গ্র্যান্ড প্রাইজ অপেক্ষা করছে'}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Real high-contrast jackpot announcements */}
      <div className="relative w-full md:w-[52%] flex flex-col items-center md:items-end justify-center text-center md:text-right mt-10 md:mt-0 z-10 shrink-0">
        
        {/* Banner Badges row */}
        <div className="flex flex-wrap items-center gap-2 mb-4 justify-center md:justify-end">
          <span className="bg-[#FFED4A] text-zinc-950 font-black text-[9px] tracking-widest px-3 py-1 rounded-md uppercase shadow-sm animate-pulse">
            {language === 'en' ? 'LIMITED TIME JACKPOT' : 'সীমিত সময়ের জ্যাকপট'}
          </span>
          <span className="text-white text-[9px] font-black tracking-widest bg-black/60 px-3 py-1 rounded-md border border-white/10 uppercase flex items-center gap-1">
            MEGA <span style={{ color: siteConfig.primaryHex }} className="font-extrabold text-red-500">7</span> {language === 'en' ? 'DRAW' : 'ড্র'}
          </span>
        </div>

        {/* Bold Headline & Subheadings */}
        <div className="space-y-1.5">
          <h2 className="text-white text-sm sm:text-xl md:text-2xl font-bold font-bold-font tracking-tight uppercase opacity-90">
            {siteConfig.heroHeadline}
          </h2>
          <p className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#FFD700] tracking-tighter drop-shadow-[0_4px_25px_rgba(255,215,0,0.45)] select-all leading-none my-1 alfa-slab-one-regular">
            {siteConfig.heroJackpotAmount}
          </p>
          <div className="pt-2">
            <span className="text-zinc-100 text-[9px] sm:text-[11px] font-semibold tracking-[0.14em] uppercase bg-black/45 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/5 inline-block">
              {siteConfig.heroDetails}
            </span>
          </div>
        </div>

        {/* Enhanced Call-to-Action purchase row */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-center md:justify-end">
          <button 
            type="button"
            onClick={() => navigate('/games/MEGA7')}
            className="w-full sm:w-auto bg-[#FFD700] hover:bg-[#FFC800] text-zinc-950 font-black text-xs uppercase px-10 py-4 rounded-xl tracking-widest transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] cursor-pointer shadow-[0_10px_25px_rgba(255,215,0,0.3)] flex items-center justify-center gap-2"
          >
            {language === 'en' ? 'BUY TICKETS NOW' : 'টিকিট কিনুন এখনই'}
            <ArrowRight className="w-4 h-4 text-zinc-950 stroke-[3]" />
          </button>
        </div>

        <div className="flex gap-2 mt-10 justify-center md:justify-end select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"></span>
        </div>
      </div>
    </div>
  );
}

export default Hero;

