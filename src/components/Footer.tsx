import React, { useState } from 'react';
import { ShieldCheck, Globe, X, FileText, Landmark, Award, BookOpen, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolveBannerImage } from './Hero';

interface DocumentModal {
  title: string;
  category: string;
  content: React.ReactNode;
}

export function Footer() {
  const { siteConfig, language } = useAuth();
  const [activeDoc, setActiveDoc] = useState<DocumentModal | null>(null);

  const openDocument = (title: string, category: string, content: React.ReactNode) => {
    setActiveDoc({ title, category, content });
  };

  const handleClose = () => {
    setActiveDoc(null);
  };

  return (
    <footer className="bg-[#0F0D24] text-zinc-400 py-16 border-t border-[#1E1A3C] text-xs relative z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Upper Brand Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-10 border-b border-zinc-800/60 mb-10">
          <div className="space-y-2">
            {/* Logo */}
            <div className="flex items-center gap-3 leading-none select-none">
              {siteConfig.logoImageUrl ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-zinc-800 shadow-md bg-white flex items-center justify-center p-1">
                  <img 
                    src={resolveBannerImage(siteConfig.logoImageUrl)} 
                    alt={siteConfig.primaryLogoText || 'Logo'} 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-[#E52535] flex items-center justify-center shadow-md overflow-hidden shrink-0">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black tracking-[0.25em] text-[#E52535] uppercase leading-none">
                  {language === 'en' ? (siteConfig.primaryLogoText || 'GOLOBAL') : (siteConfig.primaryLogoText === 'GOLOBAL' ? 'গ্লোবাল' : siteConfig.primaryLogoText)}
                </span>
                <span className="text-xl font-black tracking-[0.08em] text-white leading-none mt-1 uppercase font-bold-font">
                  {language === 'en' ? 'LOTTERY' : 'লটারি'}
                </span>
              </div>
            </div>
            <p className="text-zinc-500 text-[11px] max-w-md font-semibold">
              {language === 'en' 
                ? 'The premier lottery and sweepstakes draw in the UAE and internationally. Raising hopes and changing lives, one dream ticket at a time.'
                : 'সংযুক্ত আরব আমিরাত এবং আন্তর্জাতিকভাবে প্রধান লটারি ও সুইপস্টেক ড্র। একবারে একটি স্বপ্ন টিকিট কিনে মানুষের জীবন পরিবর্তন করা।'}
            </p>
          </div>

          {/* Core Support Badges */}
          <div className="flex flex-wrap gap-4 items-center select-none">
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-650 bg-red-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">18+</span>
              <div className="leading-none text-left">
                <span className="text-white font-black block text-[9px] uppercase tracking-wide">
                  {language === 'en' ? 'Age 18+ Only' : '১৮+ বয়স শুধুমাত্র'}
                </span>
                <span className="text-[8px] text-zinc-500 block mt-0.5 font-bold uppercase">
                  {language === 'en' ? 'Responsible Play Assured' : 'দায়িত্বশীল খেলা নিশ্চিত'}
                </span>
              </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
              <div className="leading-none text-left">
                <span className="text-white font-black block text-[9px] uppercase tracking-wide">
                  {language === 'en' ? 'SSL Guaranteed' : 'এসএসএল গ্যারান্টিযুক্ত'}
                </span>
                <span className="text-[8px] text-zinc-500 block mt-0.5 font-bold uppercase">
                  {language === 'en' ? '100% Encrypted Payments' : '১০০% এনক্রিপ্ট করা পেমেন্ট'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-extrabold text-white text-[10px] uppercase tracking-wider mb-4 border-l-2 border-[#E52535] pl-2.5 text-left">
              {language === 'en' ? 'GET STARTED' : 'শুরু করুন'}
            </h4>
            <ul className="space-y-2.5 text-[11px] font-black text-left">
              <li>
                <Link to="/games/MEGA7" className="hover:text-[#E52535] transition-colors uppercase block">
                  {language === 'en' ? 'MEGA7 Draw' : 'মেগা৭ ড্র'}
                </Link>
              </li>
              <li>
                <Link to="/games/EASY6" className="hover:text-[#E52535] transition-colors uppercase block">
                  {language === 'en' ? 'EASY6 Draw' : 'ইজি৬ ড্র'}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => openDocument(
                    language === 'en' ? "Sure 1-3 Raffles Overview" : "নিশ্চিত ১-৩ র‌্যাফেল ড্র ওভারভিউ",
                    language === 'en' ? "GET STARTED" : "শুরু করুন",
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        Our <b>Sure 1-3 Raffles</b> represent the ultimate entry-level games of probability designed to ensure high win rates. Standardized to fit any budget:
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><b>SURE 1:</b> Ticket price is $10. Grand prize $30,000. Players select or draw a single digit from 1 to 10. Win chance is 1 in 10!</li>
                        <li><b>SURE 2:</b> Ticket price is $15. Grand prize $50,000. Players select 2 digits from 1 to 20. Win chance is 1 in 190!</li>
                        <li><b>SURE 3:</b> Ticket price is $30. Grand prize $360,000. Players select 3 digits from 1 to 10. Win chance is 1 in 1,000!</li>
                      </ul>
                      <p className="leading-relaxed">
                        Entries are pooled hourly, with live dynamic randomized selection broadcasted instantly.
                      </p>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors uppercase text-left block w-full"
                >
                  {language === 'en' ? 'Sure 1-3 Raffles' : 'নিশ্চিত ১-৩ র‌্যাফেলস'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => openDocument(
                    language === 'en' ? "Discount Coupon Codes Guidelines" : "ডিসকাউন্ট কুপন কোড গাইডলাইন",
                    language === 'en' ? "GET STARTED" : "শুরু করুন",
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        Promotional coupon codes are periodically published by the system platform to encourage responsible play. Here are the active codes:
                      </p>
                      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-2 font-mono text-xs">
                        <div className="flex justify-between border-b border-zinc-800 pb-2">
                          <span className="text-green-400 font-extrabold">GOLOBAL50</span>
                          <span className="text-zinc-300">Get 50% discount on cart checkout tickets</span>
                        </div>
                        <div className="flex justify-between pt-1">
                          <span className="text-green-400 font-extrabold">SUREBONUS</span>
                          <span className="text-zinc-300">Get $5 free trial credits upon first signup</span>
                        </div>
                      </div>
                      <p className="leading-relaxed text-zinc-400 text-[10px]">
                        *Coupons can be applied during the checkout sequence in your shopping cart. Limits apply per user profile.
                      </p>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors uppercase text-left block w-full"
                >
                  {language === 'en' ? 'Discount Coupon Codes' : 'ডিসকাউন্ট কুপন কোড'}
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-extrabold text-white text-[10px] uppercase tracking-wider mb-4 border-l-2 border-[#E52535] pl-2.5 text-left">
              {language === 'en' ? 'PARTICIPATION HELP' : 'অংশগ্রহণ সহায়তা'}
            </h4>
            <ul className="space-y-2.5 text-[11px] font-black text-left">
              <li>
                <button 
                  onClick={() => openDocument(
                    language === 'en' ? "How to Choose Numbers" : "কীভাবে নম্বর চয়ন করবেন",
                    language === 'en' ? "PARTICIPATION HELP" : "অংশগ্রহণ সহায়তা",
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        Selecting the winning sequence requires a balanced mix of strategy and intuition. Here are three professional strategies favored by global winners:
                      </p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li><b>The Balanced Mix Method:</b> Choose a combination of even and odd numbers. A drawing where all numbers are even or all numbers are odd is extremely rare (less than 3% of historic draws).</li>
                        <li><b>High-Low Spread Strategy:</b> Ensure your numbers cover both the low end (1–25) and high end (26–49) of the number pool.</li>
                        <li><b>Simulated Randomized Smart Pick:</b> Utilize our advanced AI smart-pick algorithm which evaluates frequency models to compile a statistically diversified ticket instantly.</li>
                      </ol>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors text-left block w-full"
                >
                  {language === 'en' ? 'How to choose Numbers' : 'কীভাবে নম্বর চয়ন করবেন'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openDocument(
                    language === 'en' ? "Raffle Probability Rules" : "র‌্যাফেল সম্ভাবনার নিয়মাবলী",
                    language === 'en' ? "PARTICIPATION HELP" : "অংশগ্রহণ সহায়তা",
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        All games conducted on our platform operate with strict mathematical probabilities audited by third-party councils:
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
                          <thead>
                            <tr className="bg-zinc-900 text-zinc-300 font-extrabold border-b border-zinc-800">
                              <th className="p-2.5">Game</th>
                              <th className="p-2.5">Selection Spec</th>
                              <th className="p-2.5">Win Odds</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800 text-zinc-400">
                            <tr>
                              <td className="p-2.5 font-bold text-white">MEGA7</td>
                              <td className="p-2.5">7 / 99 balls</td>
                              <td className="p-2.5">1 in 14,284,912</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-bold text-white">EASY6</td>
                              <td className="p-2.5">6 / 39 balls</td>
                              <td className="p-2.5">1 in 3,262,623</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-bold text-white">WILD5</td>
                              <td className="p-2.5">5 / 49 balls</td>
                              <td className="p-2.5">1 in 1,906,884</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <p className="leading-relaxed text-[11px] text-zinc-400">
                        Numbers are drawn using a fully audited Cryptographic Pseudo-Random Number Generator (C-PRNG) guaranteeing zero human intervention.
                      </p>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors text-left block w-full"
                >
                  {language === 'en' ? 'Raffle Probability Rules' : 'র‌্যাফেল সম্ভাবনার নিয়মাবলী'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openDocument(
                    language === 'en' ? "Winners & Claims Guide" : "বিজয়ী এবং দাবি নির্দেশিকা",
                    language === 'en' ? "PARTICIPATION HELP" : "অংশগ্রহণ সহায়তা",
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        Claiming your winnings is a transparent, highly-secured process. Here is how your prizes are dispatched:
                      </p>
                      <ul className="list-disc pl-5 space-y-2.5">
                        <li><b>Under $1,000 USD:</b> Immediately credited to your online wallet's Winnings Balance upon draw finalization.</li>
                        <li><b>$1,000 USD – $50,000 USD:</b> Scheduled for automatic bank transfer or mobile gateway checkout after standard anti-fraud and TrxID validation.</li>
                        <li><b>Over $50,000 USD (Grand Prize):</b> Managed directly by our Claims Relations department. Winners are invited to complete video validation or coordinate secure international bank wires.</li>
                      </ul>
                      <div className="bg-red-950/20 border border-red-900/40 p-3 rounded-xl text-red-200 text-[11px]">
                        <b>Important Regulatory Notice:</b> A nominal government withdrawal tax fee of <b>{siteConfig.governmentFeePct ?? 10}%</b> is withheld at source for all withdrawals.
                      </div>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors text-left block w-full"
                >
                  {language === 'en' ? 'Winners & Claims Guide' : 'বিজয়ী এবং দাবি নির্দেশিকা'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openDocument(
                    language === 'en' ? "Responsible Gaming Council" : "দায়িত্বশীল গেমিং কাউন্সিল",
                    language === 'en' ? "PARTICIPATION HELP" : "অংশগ্রহণ সহায়তা",
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        We are strictly committed to offering a safe, entertaining environment. Gaming should always be about fun, not financial pressure.
                      </p>
                      <div className="space-y-2.5">
                        <h4 className="font-extrabold text-white text-[12px]">Core Protection Principles:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li><b>Deposit Limits:</b> Administer threshold limits on how much credit you top-up daily/weekly.</li>
                          <li><b>Self-Exclusion:</b> Request your profile to be temporarily banned or deleted if you feel gaming is affecting your livelihood.</li>
                          <li><b>Age Gate:</b> We maintain a strict zero-tolerance age restriction of 18 years and above. All profiles are subjected to manual database verification.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors text-left block w-full"
                >
                  {language === 'en' ? 'Responsible Gaming Council' : 'দায়িত্বশীল গেমিং কাউন্সিল'}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white text-[10px] uppercase tracking-wider mb-4 border-l-2 border-[#E52535] pl-2.5 text-left">
              {language === 'en' ? 'LEGALITY & SAFETY' : 'আইন ও নিরাপত্তা'}
            </h4>
            <ul className="space-y-2.5 text-[11px] font-black text-left">
              <li>
                <button 
                  onClick={() => openDocument(
                    language === 'en' ? "Terms of Purchase & Draw" : "ক্রয় ও ড্র শর্তাবলী",
                    language === 'en' ? "LEGALITY & SAFETY" : "আইন ও নিরাপত্তা",
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        By purchasing a digital ticket or participating in any raffle draw on this platform, you legally consent to the following terms:
                      </p>
                      <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                        <li>All ticket sales are final. Once numbers are chosen and submitted to the blockchain pool, they cannot be edited or refunded.</li>
                        <li>The draw times specified for all custom games are authoritative. Winners are finalized in real-time.</li>
                        <li>Payments and withdrawals are subjected to strict anti-fake deposit tracking. Any user attempting fraudulent receipt submissions will have their account permanently banned and credentials blacklisted.</li>
                      </ul>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors text-left block w-full"
                >
                  {language === 'en' ? 'Terms of Purchase & Draw' : 'ক্রয় ও ড্র শর্তাবলী'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openDocument(
                    language === 'en' ? "Privacy & Cookie Declarations" : "গোপনীয়তা ও কুকি ঘোষণা",
                    language === 'en' ? "LEGALITY & SAFETY" : "আইন ও নিরাপত্তা",
                    <div className="space-y-4">
                      <p className="leading-relaxed">
                        We value your privacy as our absolute highest priority. Our declarations guarantee:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                        <li>We do not sell, trade, or expose your mobile number, wallet address, or emails to third-party advertisers.</li>
                        <li>Your session metadata is fully encrypted using TLS 1.3 standards.</li>
                        <li>Your local state coordinates (including shopping cart and balance) are kept securely in browser-bound sandbox environments.</li>
                      </ul>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors text-left block w-full"
                >
                  {language === 'en' ? 'Privacy & Cookie Declarations' : 'গোপনীয়তা ও কুকি ঘোষণা'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openDocument(
                    language === 'en' ? "Regulated License Details" : "নিয়ন্ত্রিত লাইসেন্স বিবরণ",
                    language === 'en' ? "LEGALITY & SAFETY" : "আইন ও নিরাপত্তা",
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3 bg-zinc-900 p-3.5 rounded-xl border border-zinc-800">
                        <Landmark className="w-8 h-8 text-yellow-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase font-mono">Government Protocol Seal</span>
                          <span className="text-white text-xs font-black uppercase tracking-wider block">Official Gaming License Directory</span>
                        </div>
                      </div>
                      <p className="leading-relaxed">
                        Golobal Lottery is fully regulated and licensed to operate simulated commercial sweeps and lotteries globally. Here are our certification coordinates:
                      </p>
                      <div className="space-y-3 font-mono text-[11px] bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
                        <div>
                          <span className="text-zinc-500 block">LICENSE ISSUING BOARD:</span>
                          <span className="text-white font-extrabold uppercase">{siteConfig.footerLicenseBoard || 'Curacao eGaming Regulatory Authority'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">LICENSE SERIAL ID:</span>
                          <span className="text-white font-extrabold">{siteConfig.footerLicenseSerial || '#1668/JAZ - 2026 AUDITED LOTTERY PROTOCOL'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">GCC DIGITAL COMPLIANCE:</span>
                          <span className="text-white font-extrabold">{siteConfig.footerGccCompliance || 'GCC-L-984210'} (Ministry of Economy & Safety Authority)</span>
                        </div>
                      </div>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors text-left block w-full"
                >
                  {language === 'en' ? 'Regulated License Details' : 'নিয়ন্ত্রিত লাইসেন্স বিবরণ'}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => openDocument(
                    language === 'en' ? "Anti-Fraud Disclosures" : "প্রতারণা প্রতিরোধ ডিসক্লোজার",
                    language === 'en' ? "LEGALITY & SAFETY" : "আইন ও নিরাপত্তা",
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3 bg-red-950/25 p-3.5 rounded-xl border border-red-900/30">
                        <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-red-400 block uppercase font-mono">SECURE ESCROW PROTOCOL</span>
                          <span className="text-white text-xs font-black uppercase tracking-wider block">Zero Tolerance Anti-Fraud</span>
                        </div>
                      </div>
                      <p className="leading-relaxed">
                        To maintain absolute integrity and protect user capital, we employ a sophisticated real-time verification system:
                      </p>
                      <ul className="list-disc pl-5 space-y-2">
                        <li><b>Manual Deposit Auditing:</b> Every mobile wallet deposit (bKash, Nagad, Rocket) or blockchain transaction is strictly verified by our financial staff prior to credit approval. Users submitting duplicate or fabricated TrxID numbers will face immediate account blacklisting.</li>
                        <li><b>Iban Validation:</b> High-value bank transfers undergo immediate verification to ensure matching accounts.</li>
                        <li><b>Security Firewalls:</b> IP-based geolocation monitors ensure zero unauthorized network exploitation.</li>
                      </ul>
                    </div>
                  )}
                  className="hover:text-[#E52535] transition-colors text-left block w-full"
                >
                  {language === 'en' ? 'Anti-Fraud Disclosures' : 'প্রতারণা প্রতিরোধ ডিসক্লোজার'}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-white text-[10px] uppercase tracking-wider mb-4 border-l-2 border-[#E52535] pl-2.5 text-left font-bold">
              {language === 'en' ? 'CONTACT SUPPORT' : 'গ্রাহক সেবা'}
            </h4>
            <div className="flex flex-col gap-2.5">
              <a href={`mailto:${siteConfig.footerEmail || 'support@draw.com'}`} className="bg-zinc-900 border border-zinc-800 hover:border-[#E52535] p-3 rounded-xl flex items-center justify-between text-zinc-300 transition-colors group">
                <span className="text-[11px] font-black uppercase tracking-wider group-hover:text-white">
                  {language === 'en' ? 'Email Support' : 'ইমেইল সাপোর্ট'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{siteConfig.footerEmail || 'support@draw.com'}</span>
              </a>
              <a href={`https://wa.me/${(siteConfig.footerWhatsapp || '+1 234 567 890').replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="bg-zinc-900 border border-zinc-800 hover:border-green-500 p-3 rounded-xl flex items-center justify-between text-zinc-300 transition-colors group">
                <span className="text-[11px] font-black uppercase tracking-wider group-hover:text-white">
                  {language === 'en' ? 'WhatsApp' : 'হোয়াটসঅ্যাপ'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{siteConfig.footerWhatsapp || '+1 234 567 890'}</span>
              </a>
              <a href={`https://t.me/${(siteConfig.footerTelegram || '@drawsupport').replace('@', '')}`} target="_blank" rel="noreferrer" className="bg-zinc-900 border border-zinc-800 hover:border-blue-500 p-3 rounded-xl flex items-center justify-between text-zinc-300 transition-colors group">
                <span className="text-[11px] font-black uppercase tracking-wider group-hover:text-white">
                  {language === 'en' ? 'Telegram' : 'টেলিগ্রাম'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{siteConfig.footerTelegram || '@drawsupport'}</span>
              </a>
              <a href={siteConfig.agentImoLink || "https://imo.im/"} target="_blank" rel="noreferrer" className="bg-zinc-900 border border-zinc-800 hover:border-teal-500 p-3 rounded-xl flex items-center justify-between text-zinc-300 transition-colors group">
                <span className="text-[11px] font-black uppercase tracking-wider group-hover:text-white">
                  {language === 'en' ? 'IMO Chat' : 'ইমো চ্যাট'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{siteConfig.footerImo || 'Live IMO'}</span>
              </a>
              <a href={siteConfig.agentWhatsappLink || "https://wa.me/1234567890"} target="_blank" rel="noreferrer" className="bg-zinc-900 border border-zinc-800 hover:border-purple-500 p-3 rounded-xl flex items-center justify-between text-zinc-300 transition-colors group">
                <span className="text-[11px] font-black uppercase tracking-wider group-hover:text-white">
                  {language === 'en' ? 'Live Chat' : 'লাইভ চ্যাট'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{siteConfig.footerLiveChat || '24/7 Agent'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Corporate bottom lines */}
        <div className="mt-12 pt-8 border-t border-zinc-800/65 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-zinc-500">
          <div className="space-y-1 text-center md:text-left font-semibold">
            <p>&copy; 2026 Golobal Lottery Registered Platform. All corporate marks, logos & licenses are properties of their respective governing entities.</p>
            <p className="opacity-75">
              {language === 'en' 
                ? 'This platform stimulates raffle draws, lottery statistics tracking, and lucky pick purchases with verified secure payments.'
                : 'এই প্ল্যাটফর্মটি যাচাইকৃত নিরাপদ পেমেন্টের মাধ্যমে র‌্যাফেল ড্র, লটারির পরিসংখ্যান ট্র্যাকিং এবং লাকি পিক ক্রয় সিমুলেট করে।'}
            </p>
          </div>

          <div className="flex gap-4 items-center shrink-0">
            <span className="flex items-center gap-1 font-extrabold text-zinc-400 select-none">
              <Globe className="w-3 h-3 text-[#E52535]" />
              {language === 'en' ? 'English (UAE)' : 'বাংলা (বাংলাদেশ)'}
            </span>
            <span className="text-zinc-700">|</span>
            <span className="cursor-default text-zinc-400 font-black tracking-wider">SECURE ENDPOINT v4.2</span>
          </div>
        </div>

      </div>

      {/* Dynamic Popups for all menu options */}
      {activeDoc && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-900 flex justify-between items-start gap-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#E52535] uppercase block mb-1">
                  {activeDoc.category}
                </span>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">
                  {activeDoc.title}
                </h3>
              </div>
              <button 
                onClick={handleClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 text-xs text-zinc-300 leading-relaxed space-y-4">
              {activeDoc.content}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-900/50 border-t border-zinc-900 flex justify-end">
              <button
                onClick={handleClose}
                className="bg-[#E52535] hover:bg-red-700 text-white font-black uppercase tracking-wider text-[10px] px-5 py-2.5 rounded-xl transition-all"
              >
                {language === 'en' ? 'Acknowledge & Close' : 'সম্মত ও বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;
