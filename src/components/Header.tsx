import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Smart3DLogo } from './SmartImage';
import { LogIn, UserPlus } from 'lucide-react';

export function Header() {
  const { isLoggedIn, user, logout, language } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Smart3DLogo className="w-6 h-6 object-contain" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 uppercase">
              {language === 'en' ? 'GLOBAL LOTTERY' : 'গ্লোবাল লটারি'}
            </span>
            <span className="block text-[10px] text-amber-300/70 tracking-widest uppercase">Official Grand Draw</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-emerald-400">${user.balance.toFixed(2)}</span>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/15"
              >
                Dashboard
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;


