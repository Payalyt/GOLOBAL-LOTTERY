import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Landmark, CreditCard, CheckCircle2, ShoppingBag, ShieldCheck, HelpCircle } from 'lucide-react';

export function Checkout() {
  const { tickets, clearCart } = useCart();
  const { user, buyTickets, updateUserBalance, isLoggedIn, siteConfig, language } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pick up any discount resolved in Cart
  const discount = location.state?.discount || 0;
  const subtotal = tickets.reduce((acc, t) => acc + t.price, 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'bkash' | 'nagad'>('wallet');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // bKash & Nagad specific checkout states
  const [mfsSenderNumber, setMfsSenderNumber] = useState('');
  const [mfsTxId, setMfsTxId] = useState('');

  const [completed, setCompleted] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      alert("Please log in to finalize your purchase.");
      navigate('/login');
      return;
    }

    if (tickets.length === 0) {
      alert("Your cart is empty! Pick numbers from active games first.");
      navigate('/');
      return;
    }

    // Validation validation for MFS options
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      if (!mfsSenderNumber || !mfsTxId) {
        alert(`Please insert your ${paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Account Number and Transaction ID (TrxID) for validation.`);
        return;
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Check if user has sufficient balance before executing buy tickets
      const currentUserBalance = user.balance;
      if (currentUserBalance < totalAmount) {
        setIsProcessing(false);
        if (confirm(language === 'en' 
          ? `Insufficient balance. You are short of $${(totalAmount - currentUserBalance).toFixed(2)}. Would you like to go to the Deposit page?` 
          : `আপনার ব্যালেন্স পর্যাপ্ত নয়। আপনার আরও $${(totalAmount - currentUserBalance).toFixed(2)} প্রয়োজন। আপনি কি ডিপোজিট পেজে যেতে চান?`)) {
          navigate('/dashboard?tab=Add Credit');
        }
        return;
      }

      // Execute buy tickets
      const success = buyTickets(tickets);
      if (success) {
        const idPrefix = paymentMethod === 'bkash' ? 'BKS' : paymentMethod === 'nagad' ? 'NGD' : 'REC';
        setReceiptId(idPrefix + '-' + Math.floor(100000 + Math.random() * 900000) + '-BD');
        clearCart();
        setCompleted(true);
      } else {
        alert("Transaction failed! Please check your payment details.");
      }
      setIsProcessing(false);
    }, 1500);
  };

  if (completed) {
    return (
      <div className="bg-gray-100 dark:bg-zinc-950 min-h-screen py-16 px-4 text-gray-900 dark:text-zinc-100 flex justify-center items-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-850 text-center space-y-6">
          <div className="mx-auto bg-green-50 dark:bg-emerald-950/30 w-20 h-20 rounded-full flex items-center justify-center text-green-500 dark:text-green-400 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-zinc-150">PAYMENT SECURED</h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono tracking-widest uppercase">Transaction: {receiptId}</p>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-950 rounded-xl p-5 border border-gray-150 dark:border-zinc-800 text-left text-sm space-y-3">
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Charged To:</span>
              <span className="font-bold text-gray-800 dark:text-zinc-200">{user?.name}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Account Email:</span>
              <span className="font-semibold text-gray-700 dark:text-zinc-300 truncate max-w-[200px]">{user?.email}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Items:</span>
              <span className="font-medium text-gray-800 dark:text-zinc-200">{tickets.length} Draw Tickets</span>
            </div>
            <div className="border-t dark:border-zinc-800 pt-2 flex justify-between font-extrabold text-gray-900 dark:text-zinc-100">
              <span>Paid Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-zinc-400">
            Tickets have been safely deployed to your active account list! You can log matches and view live draw status under the user panel.
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-black dark:bg-zinc-100 hover:bg-gray-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              My Dashboard
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-150 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              Play More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-zinc-950 min-h-screen py-10 px-4 text-gray-900 dark:text-zinc-100">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-2 mb-8">
          <Landmark className="w-7 h-7 text-gray-800 dark:text-zinc-200" />
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-zinc-100">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Order Summary on Right Column in mobile / Left on desktop */}
          <div className="md:col-span-4 md:order-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-850 shadow-sm space-y-4">
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-850 pb-2">Order Summary</h2>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tickets.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-zinc-500 italic">No tickets in shopping cart.</p>
                ) : (
                  tickets.map((t, index) => (
                    <div key={index} className="flex justify-between items-center text-xs text-gray-700 dark:text-zinc-300">
                      <div>
                        <span className="font-bold text-red-600 dark:text-red-400 mr-1.5">{t.gameName}</span>
                        <span className="text-gray-400 dark:text-zinc-500">({t.numbers.length} numbers)</span>
                      </div>
                      <span className="font-mono font-bold">${t.price.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-850 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                  <span>Subtotal:</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-bold">
                    <span>Discount code:</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 dark:border-zinc-850 pt-2 flex justify-between font-extrabold text-gray-900 dark:text-zinc-100 text-base">
                  <span>Total Due:</span>
                  <span className="font-mono text-lg text-green-600 dark:text-green-400">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {isLoggedIn && user && (
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 p-3.5 rounded-xl text-xs space-y-1">
                  <p className="text-gray-500 dark:text-zinc-400 font-semibold uppercase">Wallet Ledger</p>
                  <p className="text-gray-950 dark:text-zinc-200 flex justify-between">
                    <span>Your Balance:</span>
                    <b className="font-mono text-green-700 dark:text-green-450">${user.balance.toFixed(2)}</b>
                  </p>
                  {user.balance < totalAmount && (
                    <div className="text-red-700 dark:text-red-400 font-extrabold pt-2">
                      ⚠️ Balance is short of ${(totalAmount - user.balance).toFixed(2)}!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Payment Fields Left Column */}
          <div className="md:col-span-8 md:order-1 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-gray-100 dark:border-zinc-850 shadow-sm space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 uppercase">Choose Payment Destination</h2>
            
            {/* Quick selectors tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 border rounded-xl flex flex-col justify-start text-left gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'wallet' 
                    ? 'border-gray-950 dark:border-zinc-100 bg-gray-50 dark:bg-zinc-950 ring-2 ring-black/5 dark:ring-white/5' 
                    : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-850'
                }`}
              >
                <span className="font-bold text-xs text-gray-900 dark:text-zinc-100 flex items-center gap-1 justify-between w-full">
                  Global Wallet
                  <Landmark className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal leading-tight">Instant wallet cash.</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-xl flex flex-col justify-start text-left gap-1 transition-all cursor-pointer ${
                  paymentMethod === 'card' 
                    ? 'border-gray-950 dark:border-zinc-100 bg-gray-50 dark:bg-zinc-950 ring-2 ring-black/5 dark:ring-white/5' 
                    : 'border-gray-200 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-850'
                }`}
              >
                <span className="font-bold text-xs text-gray-900 dark:text-zinc-100 flex items-center gap-1 justify-between w-full">
                  Visa / MasterCard
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                </span>
                <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal leading-tight">International Bank Card.</span>
              </button>

              {siteConfig.bkashEnabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 border rounded-xl flex flex-col justify-start text-left gap-1 transition-all relative overflow-hidden cursor-pointer ${
                    paymentMethod === 'bkash' 
                      ? 'border-[#e2136e] bg-[#fbf0f5] dark:bg-[#1e0712] ring-2 ring-[#e2136e]/10 font-bold' 
                      : 'border-gray-200 dark:border-zinc-800 hover:bg-pink-50/30 dark:hover:bg-pink-950/10'
                  }`}
                >
                  <span className="font-bold text-xs text-gray-950 dark:text-zinc-100 flex items-center gap-1 justify-between w-full">
                    bKash Pay
                    <span className="w-2 h-2 rounded-full bg-[#e2136e]" />
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal leading-tight">Fast Mobile Transfer.</span>
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-[#e2136e]" />
                </button>
              )}

              {siteConfig.nagadEnabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 border rounded-xl flex flex-col justify-start text-left gap-1 transition-all relative overflow-hidden cursor-pointer ${
                    paymentMethod === 'nagad' 
                      ? 'border-[#f25220] bg-[#fdf2ee] dark:bg-[#200e0a] ring-2 ring-[#f25220]/10 font-bold' 
                      : 'border-gray-200 dark:border-zinc-800 hover:bg-orange-50/30 dark:hover:bg-orange-950/10'
                  }`}
                >
                  <span className="font-bold text-xs text-gray-950 dark:text-zinc-100 flex items-center gap-1 justify-between w-full">
                    Nagad (নগদ)
                    <span className="w-2 h-2 rounded-full bg-[#f25220]" />
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-normal leading-tight">Secured Bangladesh MFS.</span>
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-[#f25220]" />
                </button>
              )}
            </div>

            <form onSubmit={handlePay} className="space-y-6 pt-2">
              
              {paymentMethod === 'wallet' && (
                <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl p-6 text-sm text-gray-700 dark:text-zinc-300 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-black dark:text-zinc-100 text-base">
                    <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" /> Secure Wallet Transaction
                  </div>
                  <p>
                    By checking out, the amount of <b className="font-mono text-black dark:text-zinc-100">${totalAmount.toFixed(2)}</b> will be safely debited from your personal balance.
                  </p>
                  {isLoggedIn && user ? (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 dark:text-zinc-500">Status Account: <b className="text-zinc-700 dark:text-zinc-300">{user.name}</b></p>
                      <p className="text-xs text-gray-500">Playable Balance: <b className="font-mono text-green-700 dark:text-green-450">${user.balance.toFixed(2)}</b></p>
                    </div>
                  ) : (
                    <p className="text-red-700 dark:text-red-400 font-semibold pt-1">
                      ⚠️ Please sign in to verify your balance.
                    </p>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-zinc-400">Cardholder Name</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={cardHolder} 
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border text-gray-950 dark:text-zinc-100 border-gray-300 dark:border-zinc-800 rounded-xl mt-1.5 pl-3 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-700 focus:border-black dark:focus:border-zinc-750 text-sm"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-zinc-400">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border text-gray-950 dark:text-zinc-100 border-gray-300 dark:border-zinc-800 rounded-xl mt-1.5 pl-3 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-700 focus:border-black dark:focus:border-zinc-750 text-sm"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-zinc-400">Expiry Date (MM/YY)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={expiry} 
                        onChange={(e) => setExpiry(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border text-gray-950 dark:text-zinc-100 border-gray-300 dark:border-zinc-800 rounded-xl mt-1.5 pl-3 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-700 focus:border-black dark:focus:border-zinc-750 text-sm"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-zinc-400">CVV Code</label>
                      <input 
                        type="password" 
                        maxLength={4} 
                        placeholder="" 
                        value={cvv} 
                        onChange={(e) => setCvv(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border text-gray-950 dark:text-zinc-100 border-gray-300 dark:border-zinc-800 rounded-xl mt-1.5 pl-3 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-700 focus:border-black dark:focus:border-zinc-750 text-sm font-mono"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bkash' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-[#fcf3f7] dark:bg-[#1f0d14] border border-[#e2136e]/20 dark:border-[#e2136e]/30 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 font-black text-[#e2136e] dark:text-[#f43f8e] text-base">
                      <span className="bg-[#e2136e] text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded leading-none mr-1">bKash Pay</span>
                      Official bKash Payment Gateway
                    </div>
                    
                    <div className="text-xs text-zinc-650 dark:text-zinc-400 space-y-2 leading-relaxed">
                      <p>
                        To finalize payment, please Send Money or Cash Out exactly <b className="font-mono text-gray-900 dark:text-zinc-100 text-sm font-black">${totalAmount.toFixed(2)}</b> to the Admin bKash Account Number:
                      </p>
                      
                      {/* Copyable MFS Account box */}
                      <div className="bg-white dark:bg-zinc-950 p-3.5 border border-[#e2136e]/10 dark:border-[#e2136e]/20 rounded-lg flex items-center justify-between shadow-sm">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Official Admin bKash Wallet</span>
                          <span className="block font-mono font-black text-[#e2136e] dark:text-[#f43f8e] text-lg tracking-wider">{siteConfig.bkashNumber || '+8801986259552'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(siteConfig.bkashNumber || '+8801986259552');
                          }}
                          className="bg-[#e2136e] hover:bg-[#c91061] text-white font-bold text-[10px] px-3 py-2 rounded-lg transition cursor-pointer"
                        >
                          COPY NUMBER
                        </button>
                      </div>

                      <p className="italic text-[11px] text-[#e2136e] bg-pink-50 dark:bg-[#280c16] p-2.5 rounded border border-[#e2136e]/5 dark:border-[#e2136e]/15 leading-normal">
                        💡 <b>Instructions Suffix:</b> {siteConfig.bkashInstructions || 'Please type Cash Out or Send Money to the Admin bkash number shown above.'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Input forms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-zinc-400">Your bKash Number (Sender)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={mfsSenderNumber} 
                        onChange={(e) => setMfsSenderNumber(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border text-gray-900 dark:text-zinc-100 border-gray-300 dark:border-zinc-800 rounded-xl mt-1.5 px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#e2136e] text-sm"
                        required={paymentMethod === 'bkash'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-zinc-400">bKash Transaction ID (TrxID)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={mfsTxId} 
                        onChange={(e) => setMfsTxId(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border text-gray-900 dark:text-zinc-100 border-gray-300 dark:border-zinc-800 rounded-xl mt-1.5 px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#e2136e] font-mono tracking-wider uppercase text-sm"
                        required={paymentMethod === 'bkash'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'nagad' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-[#fef4f0] dark:bg-[#200e0a] border border-[#f25220]/20 dark:border-[#f25220]/30 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 font-black text-[#f25220] dark:text-[#ff6433] text-base">
                      <span className="bg-[#f25220] text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded leading-none mr-1">Nagad Pay</span>
                      Official Nagad Payment Gateway
                    </div>
                    
                    <div className="text-xs text-zinc-650 dark:text-zinc-400 space-y-2 leading-relaxed">
                      <p>
                        To finalize payment, please Send Money or Cash Out exactly <b className="font-mono text-gray-900 dark:text-zinc-100 text-sm font-black">${totalAmount.toFixed(2)}</b> to the Admin Nagad Account Number:
                      </p>
                      
                      {/* Copyable MFS Account box */}
                      <div className="bg-white dark:bg-zinc-950 p-3.5 border border-[#f25220]/10 dark:border-[#f25220]/20 rounded-lg flex items-center justify-between shadow-sm">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Official Admin Nagad Wallet</span>
                          <span className="block font-mono font-black text-[#f25220] dark:text-[#ff6433] text-lg tracking-wider">{siteConfig.nagadNumber || '+8801849182390'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(siteConfig.nagadNumber || '+8801849182390');
                          }}
                          className="bg-[#f25220] hover:bg-[#d84013] text-white font-bold text-[10px] px-3 py-2 rounded-lg transition cursor-pointer"
                        >
                          COPY NUMBER
                        </button>
                      </div>

                      <p className="italic text-[11px] text-[#f25220] bg-orange-50 dark:bg-[#2e1510] p-2.5 rounded border border-[#f25220]/5 dark:border-[#f25220]/15 leading-normal">
                        💡 <b>Instructions Suffix:</b> {siteConfig.nagadInstructions || 'Send Money or Cash Out to our official Nagad personal/merchant wallet.'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Input forms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-zinc-400">Your Nagad Number (Sender)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={mfsSenderNumber} 
                        onChange={(e) => setMfsSenderNumber(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border text-gray-900 dark:text-zinc-100 border-gray-300 dark:border-zinc-800 rounded-xl mt-1.5 px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#f25220] text-sm"
                        required={paymentMethod === 'nagad'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-zinc-400">Nagad 8-digit TxID / Token </label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={mfsTxId} 
                        onChange={(e) => setMfsTxId(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border text-gray-900 dark:text-zinc-100 border-gray-300 dark:border-zinc-800 rounded-xl mt-1.5 px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#f25220] font-mono tracking-wider uppercase text-sm"
                        required={paymentMethod === 'nagad'}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-black dark:bg-zinc-100 hover:bg-gray-900 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-extrabold uppercase py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-xs tracking-widest flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? 'Processing Securely...' : `CONFIRM AND PAY $${totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
