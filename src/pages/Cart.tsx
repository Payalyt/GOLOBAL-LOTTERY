import React, { useState } from 'react';
import { Trash2, Heart, Sparkles, CreditCard, ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Cart() {
  const { tickets, removeTicket, toggleFavorite, clearCart } = useCart();
  const { user, isLoggedIn, buyTickets, language, siteConfig } = useAuth();
  const navigate = useNavigate();
  const subtotal = tickets.reduce((acc, t) => acc + t.price, 0);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState(false);

  // States for direct seamless checkout
  const [completed, setCompleted] = useState(false);
  const [receiptId, setReceiptId] = useState('');
  const [purchasedTicketsSnapshot, setPurchasedTicketsSnapshot] = useState<any[]>([]);
  const [paidTotal, setPaidTotal] = useState(0);

  const handleApplyCoupon = () => {
    const enteredCoupon = coupon.trim().toUpperCase();
    const dynamicCodes = siteConfig?.promoCodes || [];
    const foundPromo = dynamicCodes.find(p => p.code.toUpperCase() === enteredCoupon && p.isActive);

    if (foundPromo) {
      if (foundPromo.minCartAmount && subtotal < foundPromo.minCartAmount) {
        alert(language === 'en'
          ? `This promo code requires a minimum purchase amount of $${foundPromo.minCartAmount.toFixed(2)}.`
          : `এই প্রোমো কোডটির জন্য নূন্যতম $${foundPromo.minCartAmount.toFixed(2)} মূল্যের টিকিট কিনতে হবে।`);
        return;
      }
      
      let calcDiscount = 0;
      if (foundPromo.discountType === 'percentage') {
        calcDiscount = subtotal * (foundPromo.value / 100);
      } else {
        calcDiscount = foundPromo.value;
      }
      setDiscount(Math.min(subtotal, calcDiscount));
      setCouponSuccess(true);
    } else if (enteredCoupon === 'GOLOBAL50' || enteredCoupon === 'SXL10') {
      const pct = enteredCoupon === 'GOLOBAL50' ? 0.5 : 0.1;
      setDiscount(subtotal * pct);
      setCouponSuccess(true);
    } else {
      alert(language === 'en' ? "Invalid or inactive promo code!" : "অকার্যকর বা নিষ্ক্রিয় প্রোমো কোড!");
      setCouponSuccess(false);
      setDiscount(0);
    }
  };

  const finalTotal = Math.max(0, subtotal - discount);

  const handleProceedCheckout = () => {
    if (!isLoggedIn || !user) {
      navigate('/login');
      return;
    }

    if (tickets.length === 0) {
      alert("Your cart is empty! Pick numbers from active games first.");
      return;
    }

    // Check if user has sufficient balance before executing direct checkout
    if (user.balance < finalTotal) {
      alert(language === 'en'
        ? `Insufficient balance! Your current wallet balance is $${user.balance.toFixed(2)}, but this checkout requires $${finalTotal.toFixed(2)}. Please add funds to your wallet from your Dashboard.`
        : `আপনার ব্যালেন্স পর্যাপ্ত নয়! আপনার বর্তমান ব্যালেন্স $${user.balance.toFixed(2)}, কিন্তু এই ক্রয়ের জন্য $${finalTotal.toFixed(2)} প্রয়োজন। অনুগ্রহ করে ড্যাশবোর্ড থেকে ওয়ালেটে ফান্ড যুক্ত করুন।`
      );
      return;
    }

    // Store the exact total paid before clearing cart
    setPaidTotal(finalTotal);

    // Capture tickets snapshot for display on completion screen
    setPurchasedTicketsSnapshot([...tickets]);

    // Execute direct purchase from wallet balance
    const success = buyTickets(tickets);
    if (success) {
      setReceiptId('REC-' + Math.floor(100000 + Math.random() * 900000) + '-BD');
      clearCart();
      setCompleted(true);
    } else {
      alert("Direct purchase failed! Please try again.");
    }
  };

  if (completed) {
    return (
      <div className="bg-gray-100 dark:bg-zinc-950 min-h-screen py-16 px-4 text-gray-900 dark:text-zinc-100 flex justify-center items-center">
        <div className="max-w-md w-full bg-white dark:bg-[#111726] rounded-3xl shadow-xl p-8 border border-gray-150 dark:border-zinc-800 text-center space-y-6">
          <div className="mx-auto bg-green-50 dark:bg-emerald-950/30 w-20 h-20 rounded-full flex items-center justify-center text-green-500 dark:text-green-400 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">PAYMENT SECURED</h1>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-mono tracking-widest uppercase">Transaction: {receiptId}</p>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-950 rounded-2xl p-5 border border-gray-150 dark:border-zinc-800 text-left text-sm space-y-3">
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Account Holder:</span>
              <span className="font-bold text-gray-850 dark:text-zinc-200">{user?.name}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Account Email:</span>
              <span className="font-semibold text-gray-700 dark:text-zinc-300 truncate max-w-[200px]">{user?.email}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-zinc-400">
              <span>Purchased Items:</span>
              <span className="font-medium text-gray-800 dark:text-zinc-200">{purchasedTicketsSnapshot.length} Draw Tickets</span>
            </div>
            <div className="border-t border-gray-200 dark:border-zinc-800 pt-2 flex justify-between font-black text-gray-900 dark:text-zinc-100 text-base">
              <span>Total Deducted:</span>
              <span className="text-green-600 dark:text-green-400">${paidTotal.toFixed(2)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 dark:text-zinc-500">
            Tickets have been safely deployed to your active account list! You can check your draw matches, ticket details, and winnings history under your dashboard panel.
          </p>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-black dark:bg-zinc-100 hover:bg-gray-850 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer"
            >
              My Dashboard
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-zinc-200 font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-colors cursor-pointer border border-gray-200 dark:border-zinc-700"
            >
              Play More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8 text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <div className="p-2 bg-black text-white rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">SHOPPING CART</h1>
            <p className="text-sm text-gray-500">Review your picked tickets and apply coupons before checkout.</p>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-grow w-full lg:w-2/3">
            {tickets.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 p-12 rounded-2xl text-center border border-gray-150 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-gray-400 dark:text-zinc-400">Your cart is currently empty.</p>
                <p className="text-sm text-gray-500 dark:text-zinc-500 mt-1 mb-6">You haven't selected any tickets yet.</p>
                <Link to="/" className="bg-black dark:bg-zinc-100 hover:bg-gray-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-all uppercase tracking-wider">
                  Browse Active Games
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wider uppercase px-2.5 py-1 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded">
                          {ticket.gameName}
                        </span>
                        <span className="text-xs font-semibold text-gray-400 dark:text-zinc-500">#Ticket {index + 1}</span>
                      </div>
                      
                      {/* Picked Numbers list */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {ticket.numbers.map((n, idx) => (
                          <span 
                            key={idx} 
                            className="bg-black dark:bg-zinc-950 text-yellow-300 font-mono font-bold w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm border border-white/10 dark:border-zinc-800"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 sm:self-center self-end">
                      <span className="font-mono font-extrabold text-xl text-gray-900 dark:text-zinc-100">${ticket.price.toFixed(2)}</span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFavorite(ticket.id)}
                          className="p-2 border border-gray-200 dark:border-zinc-850 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Save as Favorite"
                        >
                          <Heart 
                            size={18} 
                            className={ticket.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'} 
                          />
                        </button>
                        <button
                          onClick={() => removeTicket(ticket.id)}
                          className="p-2 border border-gray-200 dark:border-zinc-850 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove from Cart"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Summary Sidebar */}
          <div className="w-full lg:w-80 shrink-0 sticky top-24">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-850 text-gray-950 dark:text-zinc-100 space-y-6">
              <h2 className="font-extrabold text-lg tracking-tight uppercase border-b border-gray-100 dark:border-zinc-850 pb-3">ESTIMATED SUMMARY</h2>
              
              {/* Wallet Integration */}
              <div className="bg-gray-50 dark:bg-zinc-950 rounded-xl p-4 border border-gray-100 dark:border-zinc-850">
                <span className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">Available Balance</span>
                {isLoggedIn && user ? (
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono font-extrabold text-2xl text-green-600 dark:text-green-450">${user.balance.toFixed(2)}</span>
                    <Link to="/dashboard" className="text-[10px] font-bold bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 px-2 py-1 rounded border border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">
                      + ADD FUND
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                    <Link to="/login" className="font-bold text-black dark:text-white underline">Log in</Link> to check your dynamic credits.
                  </div>
                )}
              </div>

              {/* Coupon Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 block">Promo Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full border border-gray-300 dark:border-zinc-800 rounded-xl p-2 text-sm bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-zinc-750" 
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-black dark:bg-zinc-100 hover:bg-gray-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors uppercase tracking-wider shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponSuccess && (
                  <p className="text-[10px] font-bold text-green-600 dark:text-green-400">🎉 Code loaded! 50% Discount applied.</p>
                )}
              </div>

              {/* Subtotal Breakdowns */}
              <div className="border-t border-gray-100 dark:border-zinc-850 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-zinc-100">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                    <span>Voucher Discount</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500 dark:text-zinc-400">
                  <span>VAT (Digital Rules)</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="border-t border-gray-100 dark:border-zinc-850 pt-3 flex justify-between font-extrabold text-lg tracking-tight">
                  <span className="uppercase">Final Amount</span>
                  <span className="font-mono text-xl text-gray-900 dark:text-zinc-100">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {tickets.length > 0 && (
                <button 
                  onClick={handleProceedCheckout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md uppercase tracking-widest text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
