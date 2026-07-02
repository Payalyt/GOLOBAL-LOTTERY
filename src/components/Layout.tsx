import React from 'react';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');
  const isCheckoutPath = location.pathname.startsWith('/dokan-checkout');

  return (
    <div className="min-h-screen bg-[#F4F4F6] dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans flex flex-col transition-colors duration-200 overflow-x-hidden">
      {!isAdminPath && !isCheckoutPath && <Header />}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
