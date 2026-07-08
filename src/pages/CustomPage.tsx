import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function CustomPage() {
  const { id } = useParams<{ id: string }>();
  const { menuPages } = useAuth();

  const page = menuPages.find(p => p.id === id);

  if (!page) {
    return (
      <div id="page-not-found-view" className="bg-[#FAF9FC] dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans pb-16 flex items-center justify-center">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 max-w-md w-full shadow-sm border border-gray-150 dark:border-zinc-850 text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black text-[#1E1B4B] dark:text-zinc-100 uppercase tracking-tight">
            Page Not Found
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            The page you are looking for does not exist or has been removed.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center bg-[#121331] hover:bg-[#1C1D42] text-white font-black text-xs tracking-widest px-6 py-3 rounded-full uppercase leading-none shadow transition-all"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  // Parse custom simple markdown helper
  const parseMarkdownToJsx = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    let listOpen = false;
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // Close list if line is not a list item
      if (listOpen && !trimmed.startsWith('-')) {
        listOpen = false;
      }

      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${index}`} className="text-base sm:text-lg font-black text-[#1E1B4B] dark:text-zinc-100 mt-6 mb-3 tracking-tight uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            {trimmed.replace('### ', '')}
          </h3>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${index}`} className="text-lg sm:text-xl font-black text-[#1E1B4B] dark:text-zinc-100 mt-8 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2 uppercase">
            {trimmed.replace('## ', '')}
          </h2>
        );
      } else if (trimmed.startsWith('- ')) {
        if (!listOpen) {
          listOpen = true;
        }
        elements.push(
          <div key={`li-${index}`} className="flex items-start gap-2.5 ml-4 my-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
            <p className="text-zinc-650 dark:text-zinc-300 text-xs sm:text-sm font-semibold leading-relaxed">
              {trimmed.replace('- ', '')}
            </p>
          </div>
        );
      } else if (trimmed === '') {
        // Empty line spacer
        elements.push(<div key={`space-${index}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${index}`} className="text-zinc-650 dark:text-zinc-300 text-xs sm:text-sm font-semibold leading-relaxed mb-4">
            {trimmed}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div id="custom-root-view" className="bg-[#FAF9FC] dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Content Card Container */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-150 dark:border-zinc-850 space-y-8">
          
          {/* Back breadcrumb container */}
          <div className="flex justify-between items-center text-xs font-extrabold text-[#7e7e8d] uppercase tracking-wider">
            <Link 
              to="/" 
              className="hover:text-zinc-950 dark:hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#7e7e8d]" /> Back to Homepage
            </Link>
          </div>

          {/* Heading Row with divider line and dynamic "Play Now" button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#1E1B4B] dark:text-zinc-100 tracking-tight shrink-0 uppercase">
                {page.pageTitle}
              </h1>
              {/* Solid divider decoration */}
              <div className="flex-1 h-[2px] bg-zinc-200 dark:bg-zinc-800 self-center hidden sm:block" />
            </div>

            {/* Play Now Premium Button */}
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center gap-2 bg-[#121331] dark:bg-zinc-800 hover:bg-[#1C1D42] dark:hover:bg-zinc-700 text-white font-black text-xs tracking-widest px-6 py-2.5 rounded-full uppercase leading-none shadow transition-all active:scale-98 shrink-0 self-start sm:self-center"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" /> Play Now
            </Link>
          </div>

          {/* Banner area if specified, else beautiful gradient graphic head */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-[#1E1B4B] to-slate-900 text-white p-6 sm:p-8 flex flex-col justify-end min-h-[140px] sm:min-h-[180px] border border-zinc-800 shadow-sm select-none">
            {page.bannerUrl && (
              <img 
                src={page.bannerUrl} 
                alt={page.pageTitle} 
                className="absolute inset-0 w-full h-full object-cover opacity-25"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            
            <div className="relative z-10 space-y-2 max-w-2xl">
              <span className="text-[9px] font-black tracking-widest text-amber-400 uppercase">Information Portal</span>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none text-white">{page.menuTitle}</h2>
              {page.pageSubtitle && (
                <p className="text-zinc-300 text-xs sm:text-sm font-semibold max-w-xl">{page.pageSubtitle}</p>
              )}
            </div>
          </div>

          {/* Page body content container parsed nicely */}
          <div className="max-w-4xl mx-auto bg-zinc-50/60 dark:bg-zinc-900/20 p-5 sm:p-8 rounded-2xl border border-zinc-150 dark:border-zinc-800">
            <div className="space-y-1">
              {parseMarkdownToJsx(page.content)}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
