import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Landmark, CreditCard, CheckCircle2, ShoppingBag, ShieldCheck, HelpCircle } from 'lucide-react';

export function Checkout() {
  const { tickets, clearCart } = useCart();
  const { user, buyTickets, updateUserBalance, isLoggedIn, siteConfig } = useAuth();
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

  const handleSimulateTopup = () => {
    if (user) {
      updateUserBalance(user.email, 500.00);
      alert("🎉 Sandbox Top-Up Alert! Gratefully added $500 to your playable balance!");
    } else {
      alert("Please log in first before checking out.");
      navigate('/login');
    }
  };

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
        alert(`Insufficient balance. Please deposit funds via Dashboard. Short of $${(totalAmount - currentUserBalance).toFixed(2)}`);
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
      <div className="bg-gray-100 min-h-screen py-16 px-4 text-gray-900 flex justify-center items-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center space-y-6">
          <div className="mx-auto bg-green-50 w-20 h-20 rounded-full flex items-center justify-center text-green-500 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">PAYMENT SECURED</h1>
            <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">Transaction: {receiptId}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-150 text-left text-sm space-y-3">
            <div className="flex justify-between text-gray-500">
              <span>Charged To:</span>
              <span className="font-bold text-gray-800">{user?.name}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Account Email:</span>
              <span className="font-semibold text-gray-700 truncate max-w-[200px]">{user?.email}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Items:</span>
              <span className="font-medium text-gray-800">{tickets.length} Draw Tickets</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-extrabold text-gray-900">
              <span>Paid Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Tickets have been safely deployed to your active account list! You can log matches and view live draw status under the user panel.
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors"
            >
              My Dashboard
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-150 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-colors"
            >
              Play More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4 text-gray-900">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-2 mb-8">
          <Landmark className="w-7 h-7 text-gray-800" />
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Secure Checkout</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Order Summary on Right Column in mobile / Left on desktop */}
          <div className="md:col-span-4 md:order-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-500 border-b pb-2">Order Summary</h2>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tickets.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No tickets in shopping cart.</p>
                ) : (
                  tickets.map((t, index) => (
                    <div key={index} className="flex justify-between items-center text-xs text-gray-700">
                      <div>
                        <span className="font-bold text-red-650 text-red-600 mr-1.5">{t.gameName}</span>
                        <span className="text-gray-400">({t.numbers.length} numbers)</span>
                      </div>
                      <span className="font-mono font-bold">${t.price.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Discount code:</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-extrabold text-gray-900 text-base">
                  <span>Total Due:</span>
                  <span className="font-mono text-lg text-green-600">${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {isLoggedIn && user && (
                <div className="bg-zinc-50 border border-zinc-150 p-3.5 rounded-xl text-xs space-y-1">
                  <p className="text-gray-500 font-semibold uppercase">Wallet Ledger</p>
                  <p className="text-gray-950 flex justify-between">
                    <span>Your Balance:</span>
                    <b className="font-mono text-green-700">${user.balance.toFixed(2)}</b>
                  </p>
                  {user.balance < totalAmount && (
                    <div className="text-red-700 font-extrabold pt-2">
                      ⚠️ Balance is short of ${(totalAmount - user.balance).toFixed(2)}!
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Quick Sandbox Action */}
            {isLoggedIn && user && user.balance < totalAmount && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <p className="font-black">💡 Sandbox Simulation Assist:</p>
                <p className="text-[11px] leading-relaxed">
                  Need more credits? Click below to immediately load a simulated <b>$500</b> into your Account Balance for checkout matches.
                </p>
                <button 
                  onClick={handleSimulateTopup}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-extrabold py-2 px-3 rounded uppercase tracking-wider"
                >
                  🔋 Instant Free $500 Credit
                </button>
              </div>
            )}
          </div>

          {/* Payment Fields Left Column */}
          <div className="md:col-span-8 md:order-1 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 uppercase">Choose Payment Destination</h2>
            
            {/* Quick selectors tabs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-3 border rounded-xl flex flex-col justify-start text-left gap-1 transition-all ${
                  paymentMethod === 'wallet' 
                    ? 'border-gray-950 bg-gray-50 ring-2 ring-black/5' 
                    : 'border-gray-200 hover:bg-gray-50/50'
                }`}
              >
                <span className="font-bold text-xs text-gray-900 flex items-center gap-1 justify-between w-full">
                  Golobal Wallet
                  <Landmark className="w-3.5 h-3.5 text-zinc-500" />
                </span>
                <span className="text-[10px] text-gray-400 font-normal leading-tight">Instant wallet cash.</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 border rounded-xl flex flex-col justify-start text-left gap-1 transition-all ${
                  paymentMethod === 'card' 
                    ? 'border-gray-950 bg-gray-50 ring-2 ring-black/5' 
                    : 'border-gray-200 hover:bg-gray-50/50'
                }`}
              >
                <span className="font-bold text-xs text-gray-900 flex items-center gap-1 justify-between w-full">
                  Visa / MasterCard
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                </span>
                <span className="text-[10px] text-gray-400 font-normal leading-tight">International Bank Card.</span>
              </button>

              {siteConfig.bkashEnabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 border rounded-xl flex flex-col justify-start text-left gap-1 transition-all relative overflow-hidden ${
                    paymentMethod === 'bkash' 
                      ? 'border-[#e2136e] bg-[#fbf0f5] ring-2 ring-[#e2136e]/10 font-bold' 
                      : 'border-gray-200 hover:bg-pink-50/30'
                  }`}
                >
                  <span className="font-bold text-xs text-gray-950 flex items-center gap-1 justify-between w-full">
                    bKash Pay
                    <span className="w-2 h-2 rounded-full bg-[#e2136e]" />
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal leading-tight">Fast Mobile Transfer.</span>
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-[#e2136e]" />
                </button>
              )}

              {siteConfig.nagadEnabled !== false && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 border rounded-xl flex flex-col justify-start text-left gap-1 transition-all relative overflow-hidden ${
                    paymentMethod === 'nagad' 
                      ? 'border-[#f25220] bg-[#fdf2ee] ring-2 ring-[#f25220]/10 font-bold' 
                      : 'border-gray-200 hover:bg-orange-50/30'
                  }`}
                >
                  <span className="font-bold text-xs text-gray-950 flex items-center gap-1 justify-between w-full">
                    Nagad (নগদ)
                    <span className="w-2 h-2 rounded-full bg-[#f25220]" />
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal leading-tight">Secured Bangladesh MFS.</span>
                  <div className="absolute top-0 right-0 w-1.5 h-full bg-[#f25220]" />
                </button>
              )}
            </div>

            <form onSubmit={handlePay} className="space-y-6 pt-2">
              
              {paymentMethod === 'wallet' && (
                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-6 text-sm text-gray-700 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-black text-base">
                    <ShieldCheck className="w-5 h-5 text-green-600" /> Secure Wallet Transaction
                  </div>
                  <p>
                    By checking out, the amount of <b className="font-mono text-black">${totalAmount.toFixed(2)}</b> will be safely debited from your personal balance.
                  </p>
                  {isLoggedIn && user ? (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500">Status Account: <b>{user.name}</b></p>
                      <p className="text-xs text-gray-500">Playable Balance: <b className="font-mono text-green-700">${user.balance.toFixed(2)}</b></p>
                    </div>
                  ) : (
                    <p className="text-red-700 font-semibold pt-1">
                      ⚠️ Please sign in to verify your balance.
                    </p>
                  )}
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Cardholder Name</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={cardHolder} 
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="bg-white border text-gray-950 border-gray-300 rounded-xl mt-1.5 pl-3 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={cardNumber} 
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="bg-white border text-gray-950 border-gray-300 rounded-xl mt-1.5 pl-3 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Expiry Date (MM/YY)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={expiry} 
                        onChange={(e) => setExpiry(e.target.value)}
                        className="bg-white border text-gray-950 border-gray-300 rounded-xl mt-1.5 pl-3 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">CVV Code</label>
                      <input 
                        type="password" 
                        maxLength={4} 
                        placeholder="" 
                        value={cvv} 
                        onChange={(e) => setCvv(e.target.value)}
                        className="bg-white border text-gray-950 border-gray-300 rounded-xl mt-1.5 pl-3 pr-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                        required={paymentMethod === 'card'}
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 mt-2">
                    💡 <b>Sandbox hint:</b> For card payments, we suggest switching back to the "Golobal Wallet" tab where you can play with real welcome rewards ($200) or simulated top-ups.
                  </div>
                </div>
              )}

              {paymentMethod === 'bkash' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-[#fcf3f7] border border-[#e2136e]/20 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 font-black text-[#e2136e] text-base">
                      <span className="bg-[#e2136e] text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded leading-none mr-1">bKash Pay</span>
                      Official bKash Sandbox Wallet
                    </div>
                    
                    <div className="text-xs text-zinc-650 space-y-2 leading-relaxed">
                      <p>
                        To finalize payment, please Send Money or Cash Out exactly <b className="font-mono text-gray-900 text-sm font-black">${totalAmount.toFixed(2)}</b> (Approx. <b className="font-mono font-black">{(totalAmount * 117).toFixed(0)} BDT</b>) to the Admin bKash Account Number:
                      </p>
                      
                      {/* Copyable MFS Account box */}
                      <div className="bg-white p-3.5 border border-[#e2136e]/10 rounded-lg flex items-center justify-between shadow-sm">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Official Admin Bkash Wallet</span>
                          <span className="block font-mono font-black text-[#e2136e] text-lg tracking-wider">{siteConfig.bkashNumber || '+8801986259552'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(siteConfig.bkashNumber || '+8801986259552');
                            alert("📋 Number copied successfully!");
                          }}
                          className="bg-[#e2136e] hover:bg-[#c91061] text-white font-bold text-[10px] px-3 py-2 rounded-lg transition"
                        >
                          COPY NUMBER
                        </button>
                      </div>

                      <p className="italic text-[11px] text-[#e2136e] bg-pink-50 p-2.5 rounded border border-[#e2136e]/5 leading-normal">
                        💡 <b>Instructions Suffix:</b> {siteConfig.bkashInstructions || 'Please type Cash Out or Send Money to the Admin bkash number shown above.'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Input forms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650">Your bKash Number (Sender)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={mfsSenderNumber} 
                        onChange={(e) => setMfsSenderNumber(e.target.value)}
                        className="bg-white border text-gray-950 border-gray-300 rounded-xl mt-1.5 px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#e2136e] text-sm"
                        required={paymentMethod === 'bkash'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-650">bKash Transaction ID (TrxID)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={mfsTxId} 
                        onChange={(e) => setMfsTxId(e.target.value)}
                        className="bg-white border text-gray-950 border-gray-300 rounded-xl mt-1.5 px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#e2136e] font-mono tracking-wider uppercase text-sm"
                        required={paymentMethod === 'bkash'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'nagad' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <div className="bg-[#fef4f0] border border-[#f25220]/20 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2 font-black text-[#f25220] text-base">
                      <span className="bg-[#f25220] text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded leading-none mr-1">Nagad Pay</span>
                      Official Nagad Sandbox Wallet
                    </div>
                    
                    <div className="text-xs text-zinc-650 space-y-2 leading-relaxed">
                      <p>
                        To finalize payment, please Send Money or Cash Out exactly <b className="font-mono text-gray-900 text-sm font-black">${totalAmount.toFixed(2)}</b> (Approx. <b className="font-mono font-black">{(totalAmount * 117).toFixed(0)} BDT</b>) to the Admin Nagad Account Number:
                      </p>
                      
                      {/* Copyable MFS Account box */}
                      <div className="bg-white p-3.5 border border-[#f25220]/10 rounded-lg flex items-center justify-between shadow-sm">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Official Admin Nagad Wallet</span>
                          <span className="block font-mono font-black text-[#f25220] text-lg tracking-wider">{siteConfig.nagadNumber || '+8801849182390'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(siteConfig.nagadNumber || '+8801849182390');
                            alert("📋 Number copied successfully!");
                          }}
                          className="bg-[#f25220] hover:bg-[#d84013] text-white font-bold text-[10px] px-3 py-2 rounded-lg transition"
                        >
                          COPY NUMBER
                        </button>
                      </div>

                      <p className="italic text-[11px] text-[#f25220] bg-orange-50 p-2.5 rounded border border-[#f25220]/5 leading-normal">
                        💡 <b>Instructions Suffix:</b> {siteConfig.nagadInstructions || 'Send Money or Cash Out to our official Nagad personal/merchant wallet.'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Input forms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-655">Your Nagad Number (Sender)</label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={mfsSenderNumber} 
                        onChange={(e) => setMfsSenderNumber(e.target.value)}
                        className="bg-white border text-gray-950 border-gray-300 rounded-xl mt-1.5 px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#f25220] text-sm"
                        required={paymentMethod === 'nagad'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-655">Nagad 8-digit TxID / Token </label>
                      <input 
                        type="text" 
                        placeholder="" 
                        value={mfsTxId} 
                        onChange={(e) => setMfsTxId(e.target.value)}
                        className="bg-white border text-gray-950 border-gray-300 rounded-xl mt-1.5 px-3 py-2.5 w-full focus:outline-none focus:ring-1 focus:ring-[#f25220] font-mono tracking-wider uppercase text-sm"
                        required={paymentMethod === 'nagad'}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-black hover:bg-gray-900 text-white font-extrabold uppercase py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-xs tracking-widest flex items-center justify-center gap-1.5"
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
