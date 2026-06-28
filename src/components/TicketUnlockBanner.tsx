import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function TicketUnlockBanner() {
  const navigate = useNavigate();
  const { language } = useAuth();

  const perks = [
    {
      en: 'Comprehensive Hot & Cold Heatmaps',
      bn: 'বিস্তারিত হট ও কোল্ড হিটম্যাপ'
    },
    {
      en: 'Personalized Lucky Number Generator',
      bn: 'ব্যক্তিগত লাকি নম্বর জেনারেটর'
    },
    {
      en: 'Next Draw Probability Calculator',
      bn: 'পরবর্তী ড্র সম্ভাবনা ক্যালকুলেটর'
    },
    {
      en: 'Automatic Winners Match-Alerts',
      bn: 'স্বয়ংক্রিয় বিজয়ী ম্যাচ-অ্যালার্ট'
    }
  ];

  return (
    <div className="relative my-12 overflow-hidden bg-gradient-to-br from-[#0F0D24] via-[#1A163F] to-[#0A0818] p-8 sm:p-12 rounded-[32px] border border-[#2B245F] shadow-2xl">
      {/* Visual background decorations */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E52535] rounded-full blur-[140px] opacity-[0.05] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[350px] h-[350px] bg-[#1268A2] rounded-full blur-[120px] opacity-[0.06] pointer-events-none" />

      {/* Grid subtle print layout */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(ellipse at center, #ffffff 1px, transparent 0)',
        backgroundSize: '24px 24px'
      }} />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left Side text & list */}
        <div className="text-left max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#1E1A3C] text-yellow-300 font-extrabold text-[9px] tracking-widest px-3.5 py-1.5 rounded-full uppercase border border-[#2B245F]">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin-slow" />
            {language === 'en' ? 'EXCLUSIVE FREEMIUM BENEFIT' : 'এক্সক্লুসিভ ফ্রি সুবিধা'}
          </div>
          
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight uppercase">
            {language === 'en' 
              ? 'Unlock Advanced AI Lucky Number & Probability Statistics!' 
              : 'উন্নত এআই লাকি নম্বর এবং সম্ভাবনা পরিসংখ্যান আনলক করুন!'}
          </h3>
          
          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
            {language === 'en' 
              ? 'Join thousands of smart drawers utilizing our dynamic analytics suite. Register your phone number to reveal historical heatmaps, cold/hot number frequencies, and simulated checkout odds.'
              : 'আমাদের ডায়নামিক অ্যানালিটিক্স স্যুট ব্যবহার করে হাজার হাজার স্মার্ট লটারি ড্রয়ারদের সাথে যোগ দিন। ঐতিহাসিক হিটম্যাপ, ঠাণ্ডা/গরম নম্বরের ফ্রিকোয়েন্সি এবং সিমুলেটেড চেকআউট সম্ভাবনা দেখতে আপনার ফোন নম্বর দিয়ে নিবন্ধন করুন।'}
          </p>

          {/* Checklist stats perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            {perks.map((p, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-white">
                <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/20 shrink-0" />
                <span className="font-semibold text-zinc-300">
                  {language === 'en' ? p.en : p.bn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side visual action button & promo badge */}
        <div className="text-center w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-4 items-center justify-center">
          
          {/* Static Stats Mini Frame */}
          <div className="bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-60 text-left space-y-3 shadow-xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block">
                {language === 'en' ? 'LIVE PREVIEW' : 'লাইভ প্রিভিউ'}
              </span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <div className="flex items-end justify-between font-mono">
              <div>
                <span className="text-[8px] text-zinc-500 uppercase block font-sans">
                  {language === 'en' ? 'Most Common (30 Days)' : 'সবচেয়ে সাধারণ (৩০ দিন)'}
                </span>
                <span className="text-sm font-black text-white mt-1 inline-block">12, 45, 78, 92</span>
              </div>
              <div className="text-xs font-black text-green-500">+18.4%</div>
            </div>
            {/* Visual histogram bar charts */}
            <div className="flex items-end gap-1.5 h-6 pt-1 select-none">
              <div className="bg-red-500 h-[40%] flex-1 rounded-sm"></div>
              <div className="bg-yellow-400 h-[80%] flex-1 rounded-sm"></div>
              <div className="bg-[#12A054] h-[60%] flex-1 rounded-sm"></div>
              <div className="bg-purple-500 h-[100%] flex-1 rounded-sm"></div>
              <div className="bg-[#1AA3E5] h-[75%] flex-1 rounded-sm"></div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-white hover:bg-zinc-100 text-black font-black text-xs uppercase px-8 py-4 rounded-xl tracking-widest leading-none shadow-xl transition-all duration-300 hover:scale-[1.03]"
          >
            {language === 'en' ? 'GET FREE ACCESS NOW' : 'এখনই ফ্রি অ্যাক্সেস নিন'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default TicketUnlockBanner;
