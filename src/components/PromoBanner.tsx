import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Gift, Tv } from 'lucide-react';

export function PromoBanner() {
  return (
    <div 
      id="premium-promo-showcase" 
      className="w-full bg-[#0b0f19]/80 rounded-3xl p-6 md:p-8 border border-teal-500/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] space-y-8 my-6 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.8) 0%, rgba(5, 7, 12, 0.95) 100%)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      {/* 4. Subheadings/Section Title: "Recent Winners" */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-teal-500/10 pb-4 gap-4">
        <div>
          <h3 
            id="subheading-winners-title"
            style={{
              fontFamily: "'Bebas Neue', 'Montserrat', sans-serif",
              fontWeight: 600,
              textTransform: 'uppercase',
              color: '#14B8A6', /* Teal */
              fontSize: 'clamp(24px, 4vw, 32px)',
              letterSpacing: '1.5px',
              borderBottom: '3px solid #14B8A6',
              paddingBottom: '8px',
              display: 'inline-block',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              margin: 0
            }}
          >
            Recent Winners
          </h3>
          <p className="text-zinc-400 text-xs mt-2 font-medium tracking-wide">
            LIVE DRAWING HIGHLIGHTS & TICKET VERIFICATION
          </p>
        </div>
        
        {/* 3. Ticket Number Display inside a grey badge */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-sans">
            LATEST TICKET:
          </span>
          <span 
            id="ticket-badge-display"
            style={{
              fontFamily: "'Oswald', monospace",
              fontWeight: 700,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '15px',
              letterSpacing: '1.5px',
              display: 'inline-flex',
              alignItems: 'center',
              textTransform: 'uppercase',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)'
            }}
          >
            Serial: GL-884920
          </span>
        </div>
      </div>

      {/* Grid of Notices and Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: 1. Alert/Notice Text Box */}
        <div 
          className="flex flex-col justify-between p-5 rounded-2xl border border-red-500/20 bg-black/30 backdrop-blur-md relative overflow-hidden group hover:border-red-500/30 transition-all duration-300"
          style={{
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Subtle accent light */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest font-sans">
              <Tv className="w-4 h-4 text-red-500 animate-pulse" />
              <span>LIVE BROADCAST NOTICE</span>
            </div>

            {/* Alert Notice Text using 'Hind Siliguri' bold */}
            <div 
              id="bangla-live-alert-box"
              style={{
                fontFamily: "'Hind Siliguri', sans-serif",
                fontWeight: 700,
                color: '#39FF14', /* Neon Green */
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(57, 255, 20, 0.3)',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '18px',
                textShadow: '0 0 10px rgba(57,255,20,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
              }}
            >
              <span className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
              </span>
              <span className="leading-tight">
                Today's Draw is Live at 9:00 PM!
              </span>
            </div>
          </div>

          <p className="text-zinc-500 text-[11px] mt-4 tracking-wide font-sans leading-relaxed">
            * Real-time auditable drawings are broadcasted on our YouTube channel and official portal.
          </p>
        </div>

        {/* CARD 2: 2. Rules/Instructions Box */}
        <div 
          className="flex flex-col justify-between p-5 rounded-2xl border border-orange-500/20 bg-black/20 backdrop-blur-md relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300"
          style={{
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Subtle accent light */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase tracking-widest font-sans">
              <Gift className="w-4 h-4 text-orange-500" />
              <span>PROMOTIONAL OFFER</span>
            </div>

            {/* Rules/Instructions Body Text: Montserrat / Hind Siliguri, size 16px, line-height 1.6 */}
            <div className="space-y-2">
              <p 
                id="promo-rules-text"
                style={{
                  fontFamily: "'Montserrat', 'Hind Siliguri', sans-serif",
                  fontWeight: 400,
                  color: '#FFFFFF',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  margin: 0,
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                Buy 1 Ticket and Get 1 Free
              </p>
              
              <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-lg w-max">
                <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin-slow" />
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                  BUY 1 GET 1 FREE
                </span>
              </div>
            </div>
          </div>

          <p className="text-zinc-500 text-[11px] mt-4 tracking-wide font-sans leading-relaxed">
            * Exclusive promotional ticket deal valid for the next 24 hours only.
          </p>
        </div>

      </div>
    </div>
  );
}
