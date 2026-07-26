import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { Sparkles, LogIn, UserPlus, Trophy, Ticket, ShieldCheck, Zap } from 'lucide-react';
import { Footer } from '../components/Footer';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between border-b border-amber-500/20">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Trophy className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500">
              GLOBAL LOTTERY PORTAL
            </h1>
            <p className="text-xs text-amber-300/70 tracking-widest uppercase">Official Grand Draw</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/25 text-white font-semibold text-sm transition-all border border-white/15"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>Login</span>
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25"
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </button>
        </div>
      </header>

      {/* Main Full-Screen Lottery Poster Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full flex flex-col justify-center items-center">
        <div className="w-full space-y-6">
          {/* Stunning Full Screen Lottery Poster / Hero */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-500/20 bg-gradient-to-b from-slate-900/90 via-slate-950 to-black p-6 md:p-12 text-center">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-64 h-64 text-amber-400 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-6 shadow-inner">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Official Live Grand Jackpot Draw</span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500">
              $10,000,000 GRAND JACKPOT
            </h2>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-medium">
              Secure your lucky ticket today. Daily international draws, instant verified payouts, and 100% proven fair results.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/40 hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <Ticket className="w-6 h-6" />
                <span>Get Lucky Ticket Now</span>
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg border border-white/20 transition-all flex items-center justify-center gap-3"
              >
                <LogIn className="w-6 h-6 text-amber-400" />
                <span>Member Portal Login</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10">
              <div className="flex items-center justify-center gap-3 bg-white/5 py-3 px-4 rounded-xl border border-white/5">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">100% Proven Fair & Secure</span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/5 py-3 px-4 rounded-xl border border-white/5">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-semibold text-slate-200">1-Min Instant Withdrawals</span>
              </div>
              <div className="flex items-center justify-center gap-3 bg-white/5 py-3 px-4 rounded-xl border border-white/5">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-slate-200">VIP Level 1 Bonus Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

