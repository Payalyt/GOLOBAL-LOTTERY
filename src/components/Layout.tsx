import React from 'react';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { siteConfig, theme } = useAuth();
  const isCheckoutPath = location.pathname.startsWith('/dokan-checkout');
  const isAdminPath = location.pathname.startsWith('/admin');

  const isDark = theme === 'dark';

  return (
    <div 
      className={`min-h-screen font-sans flex flex-col transition-colors duration-200 overflow-x-hidden ${
        isDark 
          ? "bg-[#121D3D] text-zinc-100" 
          : "bg-gray-100 text-gray-900"
      }`}
      style={isDark ? { backgroundColor: siteConfig.customBgColor || '#121D3D' } : { backgroundColor: '#F3F4F6' }}
    >
      {!isCheckoutPath && !isAdminPath && <Header />}
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

