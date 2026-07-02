import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles, AlertCircle, Sparkle } from 'lucide-react';
import { useAuth, Promotion } from '../context/AuthContext';

export function Promotions() {
  const navigate = useNavigate();
  const { promotions } = useAuth();
  const [activePromo, setActivePromo] = useState<Promotion | null>(null);

  // Only display active promotions
  const activePromotions = promotions.filter(p => p.isActive !== false);

  return (
    <div id="promotions-root-view" className="bg-[#FAF9FC] min-h-screen text-zinc-900 font-sans pb-16">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Card Container wrapper */}
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
                Promotions
              </h1>
              {/* Solid divider decoration */}
              <div className="flex-1 h-[2px] bg-zinc-200 self-center hidden sm:block" />
            </div>

            {/* Play Now Premium Button exactly styled as screenshot */}
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 bg-[#121331] hover:bg-[#1C1D42] text-white font-black text-xs tracking-widest px-6 py-2.5 rounded-full uppercase leading-none shadow transition-all active:scale-98 shrink-0 self-start sm:self-center"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" /> Play Now
            </Link>
          </div>

          {/* Grid of Promotion Cards (3 columns structure strictly matching Screenshot 3) */}
          {activePromotions.length === 0 ? (
            <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-zinc-150">
              <Sparkles className="w-12 h-12 text-zinc-300 mx-auto mb-3 animate-pulse" />
              <p className="text-zinc-500 font-extrabold text-sm uppercase tracking-wider">No Active Promotions</p>
              <p className="text-zinc-400 text-xs mt-1 font-semibold">Check back soon for exciting campaigns and custom bonus multipliers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
              {activePromotions.map((promo) => (
                <div 
                  key={promo.id} 
                  className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
                >
                  <div>
                    
                    {/* Visual Promotional Flyer utilizing pure high-fidelity CSS text design */}
                    <div className={`aspect-[4/3] w-full bg-gradient-to-br ${promo.flyerGradient} p-6 flex flex-col justify-between relative select-none shrink-0 overflow-hidden`}>
                      
                      {/* Radial light glow element overlay */}
                      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/20 pointer-events-none" />
                      
                      {/* Upper Ribbon and Badge */}
                      <div className="flex justify-between items-start relative z-10 w-full">
                        <span className="bg-white/15 backdrop-blur-md px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded border border-white/10">
                          {promo.flyerTitle}
                        </span>
                        <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-sm flex items-center gap-1 shrink-0 animate-pulse">
                          <Sparkle className="w-2.5 h-2.5 fill-white" /> Extended
                        </span>
                      </div>

                      {/* Bold Golden Amount display */}
                      <div className="space-y-1 my-auto relative z-10 text-center">
                        <span className="text-[10px] tracking-widest uppercase font-extrabold text-yellow-300 block">
                          Guaranteed Grand Draw
                        </span>
                        <h3 className="text-3xl font-black font-sans leading-none tracking-tight text-white drop-shadow">
                          {promo.flyerAmount}
                        </h3>
                        <p className="text-[10px] text-zinc-100 font-bold max-w-[90%] mx-auto leading-tight">
                          {promo.flyerSub}
                        </p>
                      </div>

                      {/* Bottom Flyer Fineprint info bar */}
                      {promo.flyerExtra && (
                        <div className="bg-black/20 backdrop-blur-3xs p-1.5 px-2 text-[8px] rounded border border-white/5 relative z-10 text-center uppercase tracking-wide font-extrabold text-[#FFEA4A] shrink-0 truncate">
                          {promo.flyerExtra}
                        </div>
                      )}

                    </div>

                  {/* Body textual Content details */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-extrabold text-base text-zinc-950 leading-snug line-clamp-1 truncate uppercase tracking-tight">
                      {promo.title}
                    </h3>
                    <p className="text-[11px] font-black text-zinc-400 font-sans uppercase">
                      Valid Till: {promo.date}
                    </p>
                    <p className="text-zinc-500 text-xs font-semibold leading-relaxed line-clamp-3">
                      {promo.excerpt}
                    </p>
                  </div>

                </div>

                {/* READ MORE Outline Action Button */}
                <div className="p-5 pt-0">
                  <button 
                    onClick={() => setActivePromo(promo)}
                    className="w-full bg-[#121331] hover:bg-black text-white font-black text-[10px] tracking-widest px-5 py-3 rounded-lg transition-colors uppercase leading-none shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {promo.buttonText}
                  </button>
                </div>

              </div>
            ))}
          </div>
          )}

        </div>

      </div>

      {/* Lightbox Modal overlay for the Promo detail page */}
      {activePromo && (
        <div id="promo-modal" className="fixed inset-0 bg-black/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 max-w-md w-full relative">
            
            {/* Upper Flyer Box display */}
            <div className={`aspect-[4/3] w-full bg-gradient-to-br ${activePromo.flyerGradient} p-8 flex flex-col justify-between relative select-none`}>
              <div className="flex justify-between items-start">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 text-[9px] font-black tracking-widest rounded uppercase">
                  ACTIVE CAMPAIGN
                </span>
                <span className="bg-yellow-400 text-zinc-950 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded shadow-sm">
                  PROMOTED
                </span>
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-4xl font-black tracking-tight leading-none drop-shadow">{activePromo.flyerAmount}</h3>
                <p className="text-xs text-white/95 font-medium">{activePromo.flyerSub}</p>
              </div>
              <div className="text-center font-mono text-[9px] text-yellow-300 font-bold uppercase tracking-wider">
                {activePromo.flyerExtra}
              </div>
            </div>

            {/* Content text */}
            <div className="p-6 sm:p-8 space-y-4">
              <h3 className="font-extrabold text-lg sm:text-xl text-zinc-950 uppercase tracking-tight leading-snug">
                {activePromo.title}
              </h3>
              <p className="text-zinc-650 text-zinc-600 text-xs sm:text-sm leading-relaxed font-semibold">
                {activePromo.excerpt} This promotion will automatically claim the valid rewards for your tickets cart upon checking out. Please log in or generate standard drawing selections to register.
              </p>
              
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/60 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-emerald-800 uppercase tracking-wide">Automatic Activation</p>
                  <p className="text-[11px] text-emerald-700/90 font-medium">Eligible rewards apply instantly on your checkout voucher. No separate coupon pasting required.</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row inside Modal */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setActivePromo(null)}
                className="flex-1 bg-zinc-150 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 font-extrabold text-xs py-3.5 tracking-wider rounded-xl transition-all uppercase"
              >
                Close Info
              </button>
              <button
                onClick={() => {
                  setActivePromo(null);
                  navigate(activePromo.targetLink);
                }}
                className="flex-1 bg-[#121331] hover:bg-black text-white font-black text-xs py-3.5 tracking-widest rounded-xl transition-all uppercase shadow"
              >
                Claim Offer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Promotions;
