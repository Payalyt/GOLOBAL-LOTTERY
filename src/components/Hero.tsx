import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function resolveBannerImage(url: string): string {
  if (!url) return '';
  // Convert old /src/assets/images paths to /images
  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', '/images/');
  }
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

  // Ensure slide index is within bounds if banners change
  useEffect(() => {
    if (currentSlide >= activeBanners.length) {
      setCurrentSlide(0);
    }
  }, [activeBanners.length, currentSlide]);

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
    const banner = activeBanners[currentSlide] || activeBanners[0];
    const resolvedImageUrl = resolveBannerImage(banner.imageUrl);

    const hasText = !!((banner.title && banner.title.trim()) || (banner.subtitle && banner.subtitle.trim()) || (banner.buttonText && banner.buttonText.trim()));

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
      const shadowGradient = (banner.hideShadow || !hasText)
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
        className={`relative w-full overflow-hidden rounded-[12px] sm:rounded-[24px] md:rounded-[32px] ${
          hasText 
            ? 'min-h-[160px] xs:min-h-[190px] sm:min-h-[340px] md:min-h-[420px] p-3 xs:p-4 sm:p-8 md:p-12' 
            : 'aspect-[2.1/1] sm:aspect-[2.4/1] md:aspect-[2.6/1] p-0'
        } flex flex-col md:flex-row items-center justify-between shadow-xl sm:shadow-2xl border transition-all duration-750 ease-in-out`}
        style={bgStyle}
      >
        {/* Absolute ambient light overlays */}
        {banner.bgType === 'image' && !banner.hideShadow && hasText && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
        )}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/10 via-transparent to-white/10 pointer-events-none" />
        {!banner.hideShadow && hasText && (
          <div className="absolute bottom-0 left-1/4 w-1/2 h-[120px] bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        )}
        
        {/* LEFT/RIGHT CAROUSEL NAVIGATION CONTROLS */}
        {activeBanners.length > 1 && (
          <>
            <button 
              onClick={handlePrevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer hidden sm:flex"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={handleNextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white hover:scale-105 active:scale-95 transition-all z-20 cursor-pointer hidden sm:flex"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* LEFT CONTENT: Banner Description & Headers */}
        {((banner.title && banner.title.trim()) || (banner.subtitle && banner.subtitle.trim())) ? (
          <div className="relative w-full md:w-[65%] flex flex-col justify-center items-start text-left z-10 space-y-1.5 sm:space-y-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span 
                className="text-white text-[8px] sm:text-[9px] font-black tracking-widest px-2 py-0.5 sm:px-3 sm:py-1 rounded-md uppercase flex items-center gap-1 shadow-md border border-white/10"
                style={{ backgroundColor: siteConfig.primaryHex }}
              >
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-300 animate-pulse" />
                {language === 'en' ? 'EXCLUSIVE CAMPAIGN' : 'বিশেষ ক্যাম্পেইন'}
              </span>
              {activeBanners.length > 1 && (
                <span className="bg-black/60 text-zinc-400 border border-zinc-800 text-[8px] sm:text-[8.5px] font-mono px-1.5 py-0.5 sm:px-2 rounded-full font-bold">
                  {currentSlide + 1} / {activeBanners.length}
                </span>
              )}
            </div>

            <div className="space-y-1 sm:space-y-3">
              {banner.title && banner.title.trim() && (
                <h2 
                  className="text-xl xs:text-2xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight alfa-slab-one-regular drop-shadow-md uppercase"
                  style={{ color: textColor }}
                >
                  {banner.title}
                </h2>
              )}
              {banner.subtitle && banner.subtitle.trim() && (
                <p 
                  className="text-[10px] sm:text-base md:text-lg font-medium max-w-xl leading-snug sm:leading-relaxed drop-shadow opacity-90 line-clamp-2 sm:line-clamp-none"
                  style={{ color: textColor }}
                >
                  {banner.subtitle}
                </p>
              )}
            </div>

            {banner.buttonText && banner.buttonText.trim() && (
              <div className="pt-1 sm:pt-4">
                <button 
                  type="button"
                  onClick={() => navigate(banner.linkUrl || '/dashboard')}
                  className="w-auto hover:opacity-95 font-black text-[10px] sm:text-xs uppercase px-4 py-1.5 sm:px-10 sm:py-4 rounded-lg sm:rounded-xl tracking-wider sm:tracking-widest transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] cursor-pointer shadow-lg flex items-center justify-center gap-1.5 sm:gap-2 border border-black/10"
                  style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
                >
                  {banner.buttonText}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" style={{ color: buttonTextColor }} />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Show slide indicator only if there are multiple slides and no text content */
          activeBanners.length > 1 && (
            <div className="absolute top-3 left-3 sm:top-6 sm:left-6 bg-black/60 text-zinc-300 border border-zinc-800 text-[8px] sm:text-[8.5px] font-mono px-2 py-0.5 sm:py-1 rounded-full font-bold z-10">
              SLIDE {currentSlide + 1} OF {activeBanners.length}
            </div>
          )
        )}

        {/* BOTTOM DOTS NAVIGATION */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 select-none z-20">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 cursor-pointer ${
                  idx === currentSlide 
                    ? 'bg-yellow-400 w-5 sm:w-6 h-1.5 sm:h-2 rounded-full' 
                    : 'bg-white/30 hover:bg-white/50 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // FALLBACK: Default Golobal Lottery static hero banner (original style perfectly preserved, compact on mobile!)
  return (
    <div 
      className="relative w-full overflow-hidden rounded-[14px] sm:rounded-[32px] min-h-[170px] xs:min-h-[200px] sm:min-h-[420px] flex flex-row items-center justify-between p-3 xs:p-4 sm:p-12 shadow-xl sm:shadow-2xl border"
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
      <div className="absolute top-[-80px] left-[-80px] w-[200px] sm:w-[500px] h-[200px] sm:h-[500px] bg-[#E1BC4A] rounded-full blur-[80px] sm:blur-[150px] opacity-25 pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[180px] sm:w-[400px] h-[180px] sm:h-[400px] bg-yellow-500 rounded-full blur-[70px] sm:blur-[130px] opacity-15 pointer-events-none" />
      
      {/* Dynamic Star Overlay */}
      <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath fill-rule='evenodd' d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm1-61c3.105 0 5.622-2.517 5.622-5.622S38.105 17.756 35 17.756s-5.622 2.517-5.622 5.622S31.895 29 35 29zM19 64c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm62 20c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z'/%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* LEFT SIDE: Stylized Mascot Image & Floating Badges */}
      <div className="relative w-[38%] md:w-[45%] flex justify-center md:justify-start items-center h-full z-10 shrink-0">
        
        {/* Animated 3 Days badge - Hidden or compact on small mobile */}
        <div className="absolute -top-3 -left-2 md:-left-4 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] border-2 sm:border-4 border-white text-zinc-950 rounded-full w-10 h-10 xs:w-12 xs:h-12 sm:w-24 sm:h-24 flex flex-col items-center justify-center shadow-2xl transform -rotate-12 z-20 animate-bounce cursor-default select-none">
          <span className="text-xs xs:text-sm sm:text-3xl font-black leading-none tracking-tight">{siteConfig.heroDaysToGo}</span>
          <span className="text-[6px] xs:text-[7px] sm:text-[9.5px] font-black tracking-widest text-center leading-tight">{language === 'en' ? <>DAYS<br />TO GO</> : <>দিন<br />বাকি</>}</span>
        </div>

        {/* Dynamic Illustrator Image Card with gold tinting border */}
        <div className="relative w-full max-w-[110px] xs:max-w-[140px] sm:max-w-[340px] md:max-w-md rounded-[12px] sm:rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-2 sm:border-4 border-white/10 group bg-black">
          <img 
            src={resolveBannerImage(siteConfig.bannerMascotUrl)} 
            alt="Golobal Lottery Winner" 
            className="w-full object-cover scale-[1.02] group-hover:scale-105 transition-transform duration-[1200ms] h-[100px] xs:h-[130px] sm:h-[280px] md:h-[320px]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = "/images/emirates_winner_mascot_1781774955947.jpg";
            }}
          />
          {!siteConfig.hideHeroShadow && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* RIGHT SIDE: Real high-contrast jackpot announcements */}
      <div className="relative w-[60%] md:w-[52%] flex flex-col items-end justify-center text-right z-10 shrink-0">
        
        {/* Banner Badges row */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-4 justify-end">
          <span className="bg-[#FFED4A] text-zinc-950 font-black text-[7px] sm:text-[9px] tracking-wider px-1.5 py-0.5 sm:px-3 sm:py-1 rounded uppercase shadow-sm animate-pulse">
            {language === 'en' ? 'LIMITED TIME' : 'সীমিত সময়'}
          </span>
          <span className="text-white text-[7px] sm:text-[9px] font-black tracking-wider bg-black/60 px-1.5 py-0.5 sm:px-3 sm:py-1 rounded border border-white/10 uppercase flex items-center gap-0.5">
            MEGA <span style={{ color: siteConfig.primaryHex }} className="font-extrabold text-red-500">7</span>
          </span>
        </div>

        {/* Bold Headline & Subheadings */}
        <div className="space-y-0.5 sm:space-y-2 flex flex-col items-end">
          <h1 className="gold-3d-text text-xl xs:text-2xl sm:text-6xl md:text-7xl lg:text-8xl select-none leading-none tracking-wider text-right uppercase">
            {siteConfig.heroHeadline || 'GLOBAL LOTTERY'}
          </h1>
          <p className="neon-yellow-text text-2xl xs:text-3xl sm:text-7xl md:text-8xl font-bold select-all leading-none my-0.5 sm:my-2 text-right">
            {siteConfig.heroJackpotAmount || '$50,000'}
          </p>
        </div>

        {/* Enhanced Call-to-Action purchase row */}
        <div className="mt-2 sm:mt-8 flex items-center justify-end">
          <button 
            type="button"
            onClick={() => navigate('/games/MEGA7')}
            className="btn-premium-orange hover:opacity-95 text-white font-bold text-[10px] xs:text-xs sm:text-xl md:text-2xl uppercase px-3 py-1.5 xs:px-5 xs:py-2.5 sm:px-10 sm:py-4 rounded-full tracking-wider sm:tracking-widest transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] cursor-pointer shadow-lg flex items-center justify-center gap-1 sm:gap-2 border-none"
          >
            {language === 'en' ? 'BUY TICKET' : 'টিকিট কিনুন'}
            <ArrowRight className="w-3 h-3 sm:w-5 sm:h-5 text-white stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;

