import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatSupportLink, getDisplaySupportLabel } from '../utils/support';
import { Headphones, X, ExternalLink, ShieldCheck, CheckCircle2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const WhatsappLogo = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001l-1.416 5.166 5.289-1.385a9.972 9.972 0 004.78 1.222h.005c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.039-5.174-2.928-7.062a9.92 9.92 0 00-7.062-2.941zm5.82 14.331c-.244.685-1.42 1.309-1.959 1.393-.501.077-1.156.111-3.328-.787-2.781-1.149-4.571-3.974-4.71-4.159-.138-.184-1.127-1.498-1.127-2.858 0-1.36.713-2.028.968-2.302.254-.275.553-.344.737-.344.184 0 .368.001.529.009.171.008.401-.065.627.478.232.558.788 1.921.857 2.062.069.141.115.306.023.491-.092.185-.138.306-.277.472-.138.165-.292.368-.417.493-.138.139-.283.291-.122.567.161.276.717 1.182 1.541 1.916 1.061.944 1.956 1.236 2.232 1.374.276.138.438.115.6-.069.162-.184.692-.806.876-1.082.184-.276.368-.23.622-.138.254.092 1.611.759 1.888.898.276.138.461.207.53.322.069.115.069.668-.175 1.353z"/>
  </svg>
);

const TelegramLogo = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.07-.75 4.19-1.82 6.98-3.02 8.38-3.6 3.99-1.65 4.82-1.94 5.36-1.95.12 0 .38.03.55.17.14.12.18.28.2.42-.01.06.01.24 0 .38z"/>
  </svg>
);

const ImoLogo = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
  </svg>
);

const EmailLogo = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const LiveSupportLogo = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2a7 7 0 0 1 14 0v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z"/>
  </svg>
);

export function LiveSupportWidget() {
  const { siteConfig, language } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'chat'>('quick');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      id: '1',
      sender: 'agent',
      text: language === 'bn' 
        ? 'হ্যালো! গ্লোবাল লটারি কাস্টমার কেয়ারে স্বাগতম। আপনাকে কীভাবে সাহায্য করতে পারি?' 
        : 'Hello! Welcome to Global Lottery 24/7 Support. How can we assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  if (siteConfig.liveChatEnabled === false) return null;

  const emailLink = formatSupportLink('email', siteConfig.footerEmail);
  const whatsappLink = formatSupportLink('whatsapp', siteConfig.footerWhatsapp || siteConfig.agentWhatsappLink);
  const telegramLink = formatSupportLink('telegram', siteConfig.footerTelegram || siteConfig.agentTelegramLink);
  const imoLink = formatSupportLink('imo', siteConfig.footerImo || siteConfig.agentImoLink);
  const liveChatTarget = formatSupportLink('livechat', siteConfig.liveChatUrl || siteConfig.footerLiveChat);

  const emailLabel = getDisplaySupportLabel('email', siteConfig.footerEmail);
  const whatsappLabel = getDisplaySupportLabel('whatsapp', siteConfig.footerWhatsapp || siteConfig.agentWhatsappLink);
  const telegramLabel = getDisplaySupportLabel('telegram', siteConfig.footerTelegram || siteConfig.agentTelegramLink);
  const imoLabel = getDisplaySupportLabel('imo', siteConfig.footerImo || siteConfig.agentImoLink);

  const handleToggleSupport = () => {
    if ((window as any).Tawk_API) {
      if (typeof (window as any).Tawk_API.showWidget === 'function') {
        (window as any).Tawk_API.showWidget();
      }
      if (typeof (window as any).Tawk_API.maximize === 'function') {
        (window as any).Tawk_API.maximize();
        return;
      }
    }
    setIsOpen(prev => !prev);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'user', text: userMsg, time: nowTime }
    ]);
    setInputMessage('');

    // Auto agent reply after short delay
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: language === 'bn'
            ? `আপনার বার্তাটি পাওয়া গেছে। আমাদের অফিসিয়াল এজেন্ট হোয়াটসঅ্যাপে বা টেলিগ্রামে তাৎক্ষণিক সরাসরি চ্যাট করতে নিচের বাটনটিতে ক্লিক করতে পারেন।`
            : `Message received! For instant 1-on-1 agent assistance with deposits or tickets, you can also connect directly on WhatsApp or Telegram.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="mb-4 w-[calc(100vw-2.5rem)] sm:w-96 bg-white dark:bg-[#0f172a] rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-amber-500/30 overflow-hidden flex flex-col max-h-[580px]"
          >
            {/* Widget Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 p-4 text-white relative flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white font-black">
                    <Headphones className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm tracking-wide leading-tight flex items-center gap-1.5">
                    {language === 'bn' ? '২৪/৭ লাইভ কাস্টমার সাপোর্ট' : '24/7 Live Support Agent'}
                    <ShieldCheck className="w-4 h-4 text-emerald-200 fill-emerald-500/20" />
                  </h3>
                  <p className="text-[11px] text-amber-100 font-medium">
                    {language === 'bn' ? 'অনলাইন - তাত্ক্ষণিক উত্তর' : 'Online • Instant Response'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 text-white flex items-center justify-center transition-colors"
                aria-label="Close support chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Channel / Chat Switcher Tabs */}
            <div className="flex border-b border-gray-100 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/50 p-1">
              <button
                onClick={() => setActiveTab('quick')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'quick'
                    ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                }`}
              >
                {language === 'bn' ? 'সোশ্যাল চ্যানেলসমূহ' : 'Direct Channels'}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'chat'
                    ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-gray-500 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200'
                }`}
              >
                {language === 'bn' ? 'মেসেজ পাঠান' : 'Live Chat Box'}
              </button>
            </div>

            {/* Tab Body */}
            {activeTab === 'quick' ? (
              <div className="p-4 space-y-3 overflow-y-auto max-h-[420px]">
                {/* Live Support Desk (Tawk.to) */}
                <a
                  href={liveChatTarget || '#'}
                  onClick={(e) => {
                    if ((window as any).Tawk_API) {
                      if (typeof (window as any).Tawk_API.showWidget === 'function') {
                        (window as any).Tawk_API.showWidget();
                      }
                      if (typeof (window as any).Tawk_API.maximize === 'function') {
                        e.preventDefault();
                        (window as any).Tawk_API.maximize();
                        setIsOpen(false);
                      }
                    }
                  }}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 border border-purple-400/40 transition-all text-white shadow-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-md border border-white/30 group-hover:scale-105 transition-transform shrink-0">
                      <LiveSupportLogo />
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-wide text-white">24/7 TAWK LIVE CHAT</div>
                      <div className="text-[11px] font-extrabold text-purple-200 mt-0.5">
                        {language === 'bn' ? 'সরাসরি এজেন্টদের সাথে চ্যাট করতে ক্লিক করুন' : 'Tap for Instant 1-on-1 Support Agent'}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>

                <div className="pt-2 text-center text-[11px] text-gray-500 dark:text-zinc-400 font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {language === 'bn' ? 'অফিসিয়াল ২৪/৭ কাস্টমার চ্যাট সাপোর্ট' : 'Official 24/7 Live Support Chat'}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[380px]">
                {/* Messages Container */}
                <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50/50 dark:bg-zinc-900/30">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-medium leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-amber-500 text-white rounded-br-xs shadow-sm'
                            : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-100 border border-gray-100 dark:border-zinc-700/50 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-zinc-500 mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="p-2.5 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={language === 'bn' ? 'এখানে মেসেজ লিখুন...' : 'Type your message...'}
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 border-none rounded-xl px-3.5 py-2 text-xs font-medium outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0 shadow-md shadow-amber-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <button
        onClick={handleToggleSupport}
        className="group relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs rounded-full shadow-[0_10px_25px_rgba(225,188,74,0.4)] border border-amber-300/40 transition-all transform hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
        </span>
        <Headphones className="w-4 h-4" />
        <span className="hidden sm:inline uppercase tracking-wider font-extrabold text-[11px]">
          {isOpen 
            ? (language === 'bn' ? 'বন্ধ করুন' : 'Close Support')
            : (language === 'bn' ? 'লাইভ সাপোর্ট' : 'Live Support')}
        </span>
      </button>
    </div>
  );
}
