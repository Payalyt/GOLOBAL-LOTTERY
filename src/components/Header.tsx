import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronDown, User as UserIcon, Menu, X, Landmark, Trophy, FileText, Gift, Flame, Sparkles, Coins, ShieldCheck, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { t } from '../utils/translations';

import { resolveBannerImage } from './Hero';

const menuData = {
  'THAI LOTTERY': {
    title: 'LIFE CHANGING',
    items: [
      { name: 'THAI GOVT LOTTERY', link: '/thai-lottery', color: 'bg-indigo-600 font-extrabold border border-yellow-400/30', price: '10', logo: 'https://i.postimg.cc/d0hfdLyv/THAI.webp' },
      { name: 'MEGA7', link: '/games/MEGA7', color: 'bg-red-600', price: '15' },
      { name: 'WILD5', link: '/games/WILD5', color: 'bg-blue-600', price: '10' },
      { name: 'EASY6', link: '/games/EASY6', color: 'bg-green-600', price: '6' },
      { name: 'FAST5', link: '/games/FAST5', color: 'bg-blue-500', price: '8' },
      { name: 'LOTTERY', link: '/games/LOTTERY', color: 'bg-yellow-600', price: '5' },
      { name: 'SCRATCH CARDS', link: '/games/SCRATCH%20CARDS', color: 'bg-purple-600', price: '5' },
    ]
  },
  RAFFLES: {
    title: 'RAFFLE DRAWS',
    items: [
      { name: 'SURE 1', link: '/raffles/sure1', color: 'bg-pink-500', price: '10' },
      { name: 'SURE 2', link: '/raffles/sure2', color: 'bg-purple-600', price: '15' },
      { name: 'SURE 3', link: '/raffles/sure3', color: 'bg-teal-500', price: '30' },
    ]
  },
  RUSH: {
    title: 'RUSH DRAWS',
    items: [
      { name: 'PICK 1', link: '/rush/pick1', color: 'bg-purple-600', price: '3' },
      { name: 'PICK 2', link: '/rush/pick2', color: 'bg-orange-500', price: '4' },
    ]
  },
  RESULTS: {
    title: 'RESULTS',
    isSpecial: true,
    groups: [
      { title: 'LIFE CHANGING', items: [
          { name: 'MEGA7', link: '/results/MEGA7', color: 'bg-red-600', text: 'SEE ALL RESULTS' },
          { name: 'WILD5', link: '/results/WILD5', color: 'bg-blue-600', text: 'SEE ALL RESULTS' },
          { name: 'EASY6', link: '/results/EASY6', color: 'bg-green-600', text: 'SEE ALL RESULTS' },
          { name: 'FAST5', link: '/results/FAST5', color: 'bg-blue-500', text: 'SEE ALL RESULTS' },
          { name: 'LOTTERY', link: '/results/LOTTERY', color: 'bg-yellow-600', text: 'SEE ALL RESULTS' },
          { name: 'SCRATCH CARDS', link: '/results/SCRATCH%20CARDS', color: 'bg-purple-600', text: 'SEE ALL RESULTS' },
      ]},
      { title: 'RAFFLE DRAWS', items: [
          { name: 'SURE 1', link: '/results/sure1', color: 'bg-pink-500', text: 'SEE ALL RESULTS' },
          { name: 'SURE 2', link: '/results/sure2', color: 'bg-purple-600', text: 'SEE ALL RESULTS' },
          { name: 'SURE 3', link: '/results/sure3', color: 'bg-teal-500', text: 'SEE ALL RESULTS' },
      ]},
      { title: 'RUSH DRAWS', items: [
          { name: 'PICK 1', link: '/results/pick1', color: 'bg-purple-600', text: 'SEE ALL RESULTS' },
          { name: 'PICK 2', link: '/results/pick2', color: 'bg-orange-500', text: 'SEE ALL RESULTS' },
          { name: 'POK', link: '/results/POK', color: 'bg-indigo-600', text: 'SEE ALL RESULTS' },
      ]}
    ]
  },
  WINNERS: {
    title: 'WINNERS',
    isSpecial: true,
    groups: [
      { title: 'LIFE CHANGING', items: [
        { name: 'MEGA7', link: '/winners/MEGA7', color: 'bg-red-600', text: 'SEE ALL WINNERS' },
        { name: 'WILD5', link: '/winners/WILD5', color: 'bg-blue-600', text: 'SEE ALL WINNERS' },
        { name: 'EASY6', link: '/winners/EASY6', color: 'bg-green-600', text: 'SEE ALL WINNERS' },
        { name: 'FAST5', link: '/winners/FAST5', color: 'bg-blue-500', text: 'SEE ALL WINNERS' },
        { name: 'LOTTERY', link: '/winners/LOTTERY', color: 'bg-yellow-600', text: 'SEE ALL WINNERS' },
        { name: 'SCRATCH CARDS', link: '/winners/SCRATCH%20CARDS', color: 'bg-purple-600', text: 'SEE ALL WINNERS' },
      ]},
      { title: 'RAFFLE DRAWS', items: [
        { name: 'SURE 1', link: '/winners/sure1', color: 'bg-pink-500', text: 'SEE ALL WINNERS' },
        { name: 'SURE 2', link: '/winners/sure2', color: 'bg-purple-600', text: 'SEE ALL WINNERS' },
        { name: 'SURE 3', link: '/winners/sure3', color: 'bg-teal-500', text: 'SEE ALL WINNERS' },
      ]},
      { title: 'RUSH DRAWS', items: [
        { name: 'PICK 1', link: '/winners/pick1', color: 'bg-purple-600', text: 'SEE ALL WINNERS' },
        { name: 'PICK 2', link: '/winners/pick2', color: 'bg-orange-500', text: 'SEE ALL WINNERS' },
        { name: 'POK', link: '/winners/POK', color: 'bg-indigo-600', text: 'SEE ALL WINNERS' },
      ]},
      { title: 'HALL OF FAME', items: [
        { name: 'HALL OF FAME', link: '/winners/hall-of-fame', color: 'bg-yellow-600', text: 'SEE ALL WINNERS' },
        { name: 'GRAND PRIZE WINNERS', link: '/winners/grand-prize', color: 'bg-yellow-700', text: 'SEE ALL WINNERS' },
      ]}
    ]
  }
};


export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, user, logout, siteConfig, theme, toggleTheme, language, toggleLanguage, setLanguage, menuPages } = useAuth();
  const { tickets } = useCart();
  const headerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  const finalMenuData = siteConfig.navMenuData || menuData;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => { 
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener("mousedown", handleClickOutside); 
    };
  }, []);

  // Soft Purple avatar helper based on name
  const getInitials = (name: string) => {
    if (!name) return 'Ms';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getMenuLabel = (menu: string, lang: 'en' | 'bn') => {
    if (menu === 'THAI LOTTERY') return t('thai_lottery', lang);
    if (menu === 'RAFFLES') return t('raffles', lang);
    if (menu === 'RUSH') return t('rush_draws', lang);
    if (menu === 'RESULTS') return t('results', lang);
    if (menu === 'WINNERS') return t('winners', lang);
    return menu;
  };

  const isDark = theme === 'dark';

  const getHeaderStyle = () => {
    if (!isDark) {
      return isScrolled ? { backgroundColor: 'rgba(255, 255, 255, 0.85)' } : undefined;
    }
    const baseColor = siteConfig.customBgColor === '#121D3D' ? '#0b0f19' : (siteConfig.customBgColor || '#0b0f19');
    if (isScrolled) {
      if (baseColor.startsWith('#') && baseColor.length === 7) {
        return { backgroundColor: `${baseColor}CC` };
      }
      return { backgroundColor: 'rgba(11, 15, 25, 0.8)' };
    }
    return { backgroundColor: baseColor };
  };

  return (
    <header 
      className={`sticky top-0 z-50 border-b transition-all duration-300 backdrop-blur-md ${
        isScrolled
          ? isDark 
            ? "text-white border-teal-500/10 shadow-lg shadow-teal-950/10" 
            : "text-zinc-900 border-zinc-200/60 shadow-md"
          : isDark 
            ? "text-white border-white/5 shadow-sm" 
            : "bg-white text-zinc-900 border-zinc-200 shadow-sm"
      }`} 
      ref={headerRef}
      style={getHeaderStyle()}
    >
      {/* Notice Banner - Bright Yellow (#F1C40F) background, Deep Navy (#0b0f19) text */}
      <div className="bg-[#F1C40F] text-[#0b0f19] py-1.5 px-3 overflow-hidden select-none border-b border-teal-500/10">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-[10px] sm:text-xs font-bold font-sans">
          <div className="flex items-center gap-1 shrink-0 bg-[#0b0f19] text-[#F1C40F] px-2 py-0.5 rounded-md font-black text-[9px] tracking-wider uppercase animate-pulse">
            <span>🔔</span>
            <span>{language === 'en' ? 'NOTICE' : 'নোটিশ'}</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee whitespace-nowrap inline-block font-bold">
              {language === 'en' 
                ? '🏆 WELCOME TO THE GLOBAL AUDITED LOTTERY PROTOCOL! NEW MEGA7 JACKPOT IS NOW ACTIVE WITH RECORD-BREAKING WEEKLY PRIZES. TOP UP SECURELY VIA BKASH, NAGAD, PERSONAL AGENTS, OR DEPOSIT USDT INSTANTLY! ' 
                : '🏆 গ্লোবাল অডিটেড লটারি প্রটোকলে আপনাকে স্বাগতম! মেগা৭ জ্যাকপট এখন আরো আকর্ষণীয় এবং রেকর্ড পরিমাণ উইকলি পুরস্কারসহ লাইভ। বিকাশ, নগদ, লোকাল এজেন্ট বা ইউএসডিটি দিয়ে নিরাপদভাবে ডিপোজিট করুন! '}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 gap-x-4 lg:gap-x-6 xl:gap-x-8">
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 leading-none select-none shrink-0">
              {/* Premium App Logo */}
              {siteConfig.logoImageUrl ? (
                <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden shrink-0 flex items-center justify-center">
                  <img 
                    src={resolveBannerImage(siteConfig.logoImageUrl)} 
                    alt={siteConfig.primaryLogoText || 'GLOBAL'} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-[#E1BC4A] to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/20 overflow-hidden shrink-0 hidden sm:flex">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                  <div className="absolute inset-0 bg-white/10 opacity-50 mix-blend-overlay" />
                </div>
              )}
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-[14px] sm:text-[18px] font-black tracking-[0.2em] sm:tracking-[0.25em] text-zinc-800 dark:text-zinc-100 uppercase leading-none truncate">
                  {language === 'en' ? (siteConfig.primaryLogoText === 'GLOBAL' ? 'GLOBAL' : siteConfig.primaryLogoText || 'GLOBAL') : (siteConfig.primaryLogoText === 'GLOBAL' || siteConfig.primaryLogoText === 'GLOBAL' ? 'গ্লোবাল' : siteConfig.primaryLogoText)}
                </span>
                <span className="text-[18px] sm:text-[24px] font-black tracking-[0.1em] sm:tracking-[0.15em] text-zinc-900 dark:text-white flex items-center justify-start mt-1 uppercase font-bold-font leading-none truncate">
                  L<span style={{ color: siteConfig.primaryHex || '#E1BC4A' }}>O</span>TTERY
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-x-3.5 xl:gap-x-6 text-[11px] xl:text-xs font-bold tracking-wider text-zinc-700 dark:text-zinc-200 shrink">
            {Object.keys(finalMenuData).map((menu) => {
              const data = finalMenuData[menu as keyof typeof menuData] as any;
              return (
                <div className="relative flex items-center group" key={menu}>
                  <button 
                    className={`flex items-center hover:opacity-85 transition-colors uppercase cursor-pointer ${activeMenu === menu ? 'text-amber-500' : ''}`}
                    style={activeMenu === menu ? { color: siteConfig.primaryHex || '#E1BC4A' } : {}}
                    onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
                  >
                    {getMenuLabel(menu, language)} <ChevronDown className="ml-1 w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  {activeMenu === menu && (
                    <div 
                      className={`absolute top-full left-1/2 -translate-x-1/2 ${data.isSpecial ? 'w-[850px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'w-72'} bg-white dark:bg-[#121D3D] border border-gray-200 dark:border-zinc-800 p-4 mt-3 rounded-xl shadow-xl text-black dark:text-white z-50`}
                      style={{ backgroundColor: theme === 'dark' ? (siteConfig.customBgColor || '#121D3D') : undefined }}
                    >
                      {'groups' in data ? (
                        data.groups.map((group: any) => (
                          <div key={group.title} className="p-1.5">
                             <h4 className="text-gray-400 dark:text-zinc-500 text-[10px] mb-2.5 font-bold uppercase tracking-wider">{group.title}</h4>
                             {group.items.map((item: any) => (
                              <Link to={item.link} key={item.name} className={`flex items-center justify-between ${item.color} text-white px-2.5 py-2 mb-1.5 rounded-lg font-bold hover:opacity-95 text-xs whitespace-nowrap overflow-hidden relative`} onClick={() => setActiveMenu(null)}>
                                  <div className="flex items-center gap-2 truncate">
                                    {item.logo && (
                                      <img src={item.logo} alt={item.name} className="w-5 h-5 rounded-full object-cover shrink-0 bg-white" />
                                    )}
                                    <span className="truncate">{item.name}</span>
                                  </div>
                                  <span className="bg-black bg-opacity-20 px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap ml-2 shrink-0">
                                    {item.text}
                                  </span>
                               </Link>
                             ))}
                          </div>
                        ))
                      ) : (
                        <>
                          <h4 className="text-gray-400 dark:text-zinc-500 text-[10px] mb-2.5 font-bold uppercase tracking-wider">{data.title}</h4>
                          {data.items.map((item: any) => (
                            <Link to={item.link} key={item.name} className={`flex items-center justify-between ${item.color} text-white px-2.5 py-2 mb-1.5 rounded-lg font-bold hover:opacity-95 text-xs whitespace-nowrap overflow-hidden relative`} onClick={() => setActiveMenu(null)}>
                              <div className="flex items-center gap-2 truncate">
                                {item.logo && (
                                  <img src={item.logo} alt={item.name} className="w-5 h-5 rounded-full object-cover shrink-0 bg-white shadow-sm" />
                                )}
                                <span className="truncate">{item.name}</span>
                              </div>
                              {!('price' in item) ? (
                                <span className="bg-black bg-opacity-20 px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap ml-2 shrink-0">
                                  {language === 'en' ? 'SEE ALL' : 'সব দেখুন'}
                                </span>
                              ) : (
                                <span className="bg-black bg-opacity-20 px-1.5 py-0.5 rounded text-[8px] whitespace-nowrap ml-2 shrink-0">
                                  {language === 'en' ? `PLAY FOR $${item.price}` : `$${item.price}-এ খেলুন`}
                                </span>
                              )}
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <Link to="/promotions" className="hover:text-amber-500 transition-colors uppercase self-center pt-px">{t('promotions', language)}</Link>
            <Link to="/news" className="hover:text-amber-500 transition-colors uppercase self-center pt-px">{t('news', language)}</Link>
            {(menuPages || []).filter(p => p.isActive !== false && p.id !== 'faq' && p.id !== 'support').map(p => (
              <Link key={p.id} to={`/pages/${p.id}`} className="hover:text-amber-500 transition-colors uppercase self-center pt-px">
                {p.menuTitle}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3 z-10">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-zinc-650 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-yellow-400 rounded-full transition-all focus:outline-none cursor-pointer"
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-[19px] sm:h-[19px] text-zinc-800 dark:text-zinc-200 stroke-[2.5]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-[19px] sm:h-[19px] text-zinc-800 dark:text-zinc-200 stroke-[2.5]" />
              )}
            </button>

            {/* Language Toggle Button */}
            <button
              onClick={toggleLanguage}
              className="p-1.5 sm:p-2 text-zinc-650 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-yellow-400 rounded-full transition-all focus:outline-none cursor-pointer flex items-center gap-1"
              title={language === 'en' ? "বাংলায় দেখুন" : "View in English"}
            >
              <Globe className="w-4 h-4 sm:w-[19px] sm:h-[19px] text-zinc-800 dark:text-zinc-200 stroke-[2.5]" />
              <span className="hidden xs:inline text-[9px] font-black text-zinc-800 dark:text-zinc-200 bg-zinc-200/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded uppercase">{language === 'en' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Shopping Cart Icon with Badge - Smaller on mobile */}
            <Link to="/cart" className="relative p-1.5 sm:p-2 text-zinc-650 dark:text-zinc-400 hover:text-red-650 rounded-full transition-all" title={t('view_cart', language)}>
              <ShoppingCart className="w-4 h-4 sm:w-[19px] sm:h-[19px] text-zinc-800 dark:text-zinc-200 stroke-[2.5]" />
              <span style={{ backgroundColor: siteConfig.primaryHex }} className="absolute -top-0.5 -right-0.5 sm:-top-1.5 sm:-right-1.5 text-white text-[8px] sm:text-[10px] font-black w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950">
                {tickets.length}
              </span>
            </Link>
            
            {isLoggedIn && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Compact wallet balance display at top for Mobile/Tablets */}
                <div 
                  onClick={() => navigate('/my-account')}
                  className="flex lg:hidden items-center gap-1 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 rounded-full px-2 py-1 text-emerald-600 dark:text-emerald-400 cursor-pointer select-none active:scale-95 transition-transform"
                  title={t('wallet_balance', language)}
                >
                  <span className="text-[10px] font-black leading-none">${user.balance.toFixed(2)}</span>
                </div>

                {/* User Info Text - Hidden on mobile */}
                <div 
                  className="hidden lg:flex items-center gap-2 bg-black border border-zinc-800 rounded-xl px-3 py-1.5 shadow-md text-white"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wide">{t('wallet_balance', language)}</span>
                    <span className="text-sm font-black text-emerald-400 leading-none mt-0.5">${user.balance.toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Purple initials avatar circle - Hidden on mobile, only in drawer */}
                <div 
                  onClick={() => navigate('/my-account')}
                  className="hidden lg:flex w-8 h-8 rounded-full bg-[#E9E4FA] text-[#6944BA] items-center justify-center font-black text-xs cursor-pointer select-none transition-transform active:scale-95 shadow-inner overflow-hidden"
                  title="My Account"
                >
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>

                {user.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="hidden lg:block text-[9px] font-extrabold text-white bg-amber-500 hover:bg-amber-600 cursor-pointer uppercase font-sans border border-amber-500 px-2 py-1.5 rounded shadow-sm transition-colors"
                  >
                    Admin
                  </button>
                )}

                <button 
                  onClick={logout} 
                  className="hidden lg:block text-[9px] font-extrabold text-amber-500 hover:underline cursor-pointer uppercase font-sans border border-amber-500/20 px-2 py-1.5 rounded hover:bg-amber-500/10"
                >
                  {t('logout', language)}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link to="/login" className="text-[10px] sm:text-xs font-extrabold text-zinc-100 hover:text-white border border-[#2C3B69] hover:bg-[#2C3B69] rounded-lg px-2 sm:px-4 py-1.5 sm:py-2 transition-colors uppercase bg-transparent">
                  {t('login', language)}
                </Link>
                <Link to="/register" className="text-[10px] sm:text-xs font-black bg-[#E1BC4A] text-[#121D3D] hover:bg-yellow-500 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors uppercase shadow-md shadow-[#E1BC4A]/10">
                  {t('register', language)}
                </Link>
              </div>
            )}

            {/* Premium Custom Animated Hamburger Button (Morphic Lines) */}
            <button style={{ display: siteConfig.slideMenuEnabled === false ? "none" : "flex" }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex flex-col justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors focus:outline-none cursor-pointer group"
              aria-label="Toggle Menu"
            >
              <div className="w-4 h-3.5 sm:w-5 sm:h-4 flex flex-col justify-between relative">
                <span className={`w-full h-0.5 bg-zinc-800 dark:bg-zinc-200 rounded-full transition-all duration-300 origin-left ${isMobileMenuOpen ? 'rotate-45 translate-x-[2px] -translate-y-[1px]' : ''}`} />
                <span className={`w-full h-0.5 bg-zinc-800 dark:bg-zinc-200 rounded-full transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 translate-x-3' : ''}`} />
                <span className={`w-full h-0.5 bg-zinc-800 dark:bg-zinc-200 rounded-full transition-all duration-300 origin-left ${isMobileMenuOpen ? '-rotate-45 translate-x-[2px] translate-y-[1px]' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Overlay & Content */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-45 bg-zinc-950/60 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile Navigation Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 240 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[320px] bg-white dark:bg-[#121D3D] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-y-auto lg:hidden flex flex-col justify-between text-zinc-900 dark:text-zinc-100"
              style={{ backgroundColor: theme === 'dark' ? (siteConfig.customBgColor || '#121D3D') : undefined }}
            >
              <div className="space-y-6">
                {/* Drawer Header with Logo & Close Icon */}
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                     {siteConfig.logoImageUrl ? (
                      <div className="w-11 h-11 overflow-hidden shrink-0 flex items-center justify-center">
                        <img 
                          src={resolveBannerImage(siteConfig.logoImageUrl)} 
                          alt={siteConfig.primaryLogoText || 'Logo'} 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-[#E1BC4A] to-yellow-600 flex items-center justify-center shadow-md overflow-hidden shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-black tracking-[0.25em] text-amber-500 dark:text-amber-400 uppercase leading-none">
                        {language === 'en' ? (siteConfig.primaryLogoText || 'GLOBAL') : (siteConfig.primaryLogoText === 'GLOBAL' ? 'গ্লোবাল' : siteConfig.primaryLogoText)}
                      </span>
                      <span className="text-base font-black tracking-[0.08em] text-zinc-950 dark:text-white leading-none mt-1 uppercase font-bold-font">
                        {language === 'en' ? 'LOTTERY' : 'লটারি'}
                      </span>
                    </div>
                  </Link>
                  
                  {/* Close button inside drawer */}
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Navigation Menu Items */}
                <div className="space-y-5 text-left">
                  {/* Section: Life Changing Games */}
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block mb-2 flex items-center gap-1.5 font-sans">
                      <Flame className="w-3.5 h-3.5 text-red-500" /> {t('thai_lottery', language)}
                    </span>
                    <div className="space-y-1">
                      {finalMenuData['THAI LOTTERY'].items.map((item) => (
                        <Link
                          to={item.link}
                          key={item.name}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{item.name}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded">
                            {language === 'en' ? `PLAY $${item.price}` : `$${item.price}-এ`}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Section: Daily Sure Raffles */}
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block mb-2 flex items-center gap-1.5 font-sans">
                      <Gift className="w-3.5 h-3.5 text-pink-500" /> {t('raffles', language)}
                    </span>
                    <div className="space-y-1">
                      {finalMenuData.RAFFLES.items.map((item) => (
                        <Link
                          to={item.link}
                          key={item.name}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{item.name}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 rounded">
                            {language === 'en' ? `PLAY $${item.price}` : `$${item.price}-এ`}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Section: Rush Draws */}
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block mb-2 flex items-center gap-1.5 font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" /> {t('rush_draws', language)}
                    </span>
                    <div className="space-y-1">
                      {finalMenuData.RUSH.items.map((item) => (
                        <Link
                          to={item.link}
                          key={item.name}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">{item.name}</span>
                          <span className="text-[9px] font-black px-1.5 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded">
                            {language === 'en' ? `PLAY $${item.price}` : `$${item.price}-এ`}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  {/* Quick Sections Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Link
                      to="/results"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition text-center"
                    >
                      <Trophy className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-[9px] font-black uppercase tracking-wider">{language === 'en' ? 'Draw Results' : 'ড্র ফলাফল'}</span>
                    </Link>
                    <Link
                      to="/winners"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition text-center"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1" />
                      <span className="text-[9px] font-black uppercase tracking-wider">{language === 'en' ? 'All Winners' : 'সব বিজয়ী'}</span>
                    </Link>
                  </div>

                  {/* News & Promotions */}
                  <div className="flex gap-2 pt-1">
                    <Link
                      to="/promotions"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-black uppercase text-center tracking-wider transition-colors"
                    >
                      {language === 'en' ? '🎁 PROMO' : '🎁 অফার'}
                    </Link>
                    <Link
                      to="/news"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 py-2.5 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-black uppercase text-center tracking-wider transition-colors"
                    >
                      {language === 'en' ? '📰 NEWS' : '📰 খবর'}
                    </Link>
                  </div>

                  {/* Dynamic Custom Pages */}
                  {(menuPages || []).filter(p => p.isActive !== false && p.id !== 'faq' && p.id !== 'support').length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(menuPages || []).filter(p => p.isActive !== false && p.id !== 'faq' && p.id !== 'support').map(p => (
                        <Link
                          key={p.id}
                          to={`/pages/${p.id}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex-1 min-w-[45%] py-2.5 px-3 rounded-lg bg-zinc-150 dark:bg-zinc-800/80 hover:bg-zinc-250 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-black uppercase text-center tracking-wider transition-colors"
                        >
                          📄 {p.menuTitle}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Clean decorative divider */}
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

              {/* Drawer Footer with Authenticated State or Actions */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-6 text-left">
                {isLoggedIn && user ? (
                  <div className="space-y-4">
                    {/* User Profile Info Card */}
                    <div className="flex items-center gap-4 bg-black p-4 rounded-xl border border-zinc-800 shadow-md text-white">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 text-zinc-100 border-2 border-zinc-800 flex items-center justify-center font-black text-sm shadow-inner">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(user.name)
                        )}
                      </div>
                      <div className="leading-tight flex-1">
                        <span className="text-xs font-black text-zinc-300 block truncate max-w-[180px] uppercase tracking-wide mb-1">{user.name}</span>
                        <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 inline-block">
                          <span className="text-xs text-zinc-400 font-bold block uppercase tracking-wider mb-0.5">{t('wallet_balance', language)}</span>
                          <span className="text-xl text-emerald-400 font-black block leading-none">${user.balance.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        to="/my-account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider transition-all"
                      >
                        👤 {t('account_dashboard', language)}
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full text-center py-2.5 rounded-xl border border-amber-500 bg-amber-500 hover:bg-amber-600 text-xs font-bold text-white uppercase tracking-wider transition-all shadow-md"
                        >
                          ⚙️ Admin Panel
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-2 px-4 rounded-lg text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-red-100 dark:border-red-950/40 cursor-pointer uppercase transition-all"
                      >
                        {t('logout', language)}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center py-2.5 rounded-lg border border-[#2C3B69] text-zinc-100 text-xs font-black uppercase tracking-wider hover:bg-[#2C3B69] transition-colors bg-transparent"
                    >
                      {t('login', language)}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-center py-2.5 rounded-lg bg-[#E1BC4A] hover:bg-yellow-500 text-[#121D3D] text-xs font-black uppercase tracking-wider transition-colors shadow-md shadow-[#E1BC4A]/10"
                    >
                      {t('register', language)}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;

