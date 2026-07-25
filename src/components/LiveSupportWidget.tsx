import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatSupportLink, getDisplaySupportLabel } from '../utils/support';
import { MessageSquare, PhoneCall, Send, Mail, Headphones, X, ExternalLink, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
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
              <div className="p-4 space-y-2.5 overflow-y-auto max-h-[420px]">
                {/* WhatsApp */}
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-emerald-950 dark:text-emerald-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <MessageSquare className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wide">WhatsApp Support</div>
                      <div className="text-[11px] opacity-80 font-mono">{whatsappLabel}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>

                {/* Telegram */}
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-all text-sky-950 dark:text-sky-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wide">Telegram Support</div>
                      <div className="text-[11px] opacity-80 font-mono">{telegramLabel}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>

                {/* IMO */}
                <a
                  href={imoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 transition-all text-teal-950 dark:text-teal-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wide">IMO Live Chat</div>
                      <div className="text-[11px] opacity-80 font-mono">{imoLabel}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>

                {/* Email Support */}
                <a
                  href={emailLink}
                  className="group flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-amber-950 dark:text-amber-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wide">Email Support</div>
                      <div className="text-[11px] opacity-80 font-mono">{emailLabel}</div>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </a>

                {/* Live Chat External Link if configured */}
                {liveChatTarget && liveChatTarget.startsWith('http') && (
                  <a
                    href={liveChatTarget}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all text-purple-950 dark:text-purple-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-wide">External Live Desk</div>
                        <div className="text-[11px] opacity-80">Tawk.to / Direct Portal</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </a>
                )}

                <div className="pt-2 text-center text-[10px] text-gray-400 dark:text-zinc-500 font-medium flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {language === 'bn' ? 'অফিসিয়াল নিরাপদ সাপোর্ট সার্ভিস' : 'Official Verified Support Services'}
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
        onClick={() => setIsOpen(prev => !prev)}
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
