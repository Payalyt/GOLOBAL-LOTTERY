import React, { useState } from 'react';
import { Trash2, Heart, Sparkles, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export function Cart() {
  const { tickets, removeTicket, toggleFavorite } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const subtotal = tickets.reduce((acc, t) => acc + t.price, 0);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponSuccess, setCouponSuccess] = useState(false);

  const handleApplyCoupon = () => {
    const enteredCoupon = coupon.trim().toLowerCase();
    if (enteredCoupon === 'golobal50' || enteredCoupon === 'sxl10') {
      setDiscount(subtotal * 0.5);
      setCouponSuccess(true);
    } else {
      alert("Invalid coupon code! Try using GOLOBAL50 or sxl10 for a 50% sandbox discount.");
      setCouponSuccess(false);
      setDiscount(0);
    }
  };

  const finalTotal = Math.max(0, subtotal - discount);

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
              <div className="bg-white p-12 rounded-2xl text-center border border-gray-205 border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <p className="text-lg font-bold text-gray-400">Your cart is currently empty.</p>
                <p className="text-sm text-gray-500 mt-1 mb-6">You haven't selected any tickets yet.</p>
                <Link to="/" className="bg-black hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all uppercase tracking-wider">
                  Browse Active Games
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <div key={ticket.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wider uppercase px-2.5 py-1 bg-red-100 text-red-600 rounded">
                          {ticket.gameName}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">#Ticket {index + 1}</span>
                      </div>
                      
                      {/* Picked Numbers list */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {ticket.numbers.map((n, idx) => (
                          <span 
                            key={idx} 
                            className="bg-black text-yellow-300 font-mono font-bold w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-sm border border-white/10"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 sm:self-center self-end">
                      <span className="font-mono font-extrabold text-xl text-gray-900">${ticket.price.toFixed(2)}</span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFavorite(ticket.id)}
                          className="p-2 border rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Save as Favorite"
                        >
                          <Heart 
                            size={18} 
                            className={ticket.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'} 
                          />
                        </button>
                        <button
                          onClick={() => removeTicket(ticket.id)}
                          className="p-2 border rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-gray-950 space-y-6">
              <h2 className="font-extrabold text-lg tracking-tight uppercase border-b pb-3">ESTIMATED SUMMARY</h2>
              
              {/* Wallet Integration */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Available Balance</span>
                {isLoggedIn && user ? (
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono font-extrabold text-2xl text-green-600">${user.balance.toFixed(2)}</span>
                    <Link to="/dashboard" className="text-[10px] font-bold bg-white text-gray-800 px-2 py-1 rounded border border-gray-300 hover:bg-gray-50">
                      + ADD FUND
                    </Link>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500">
                    <Link to="/login" className="font-bold text-black underline">Log in</Link> to check your dynamic credits.
                  </div>
                )}
              </div>

              {/* Coupon Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 block">Promo Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-black" 
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors uppercase tracking-wider shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {couponSuccess && (
                  <p className="text-[10px] font-bold text-green-600">🎉 Code loaded! 50% Discount applied.</p>
                )}
              </div>

              {/* Subtotal Breakdowns */}
              <div className="border-t pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Voucher Discount</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>VAT (Digital Rules)</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-extrabold text-lg tracking-tight">
                  <span className="uppercase">Final Amount</span>
                  <span className="font-mono text-xl text-gray-900">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              {tickets.length > 0 && (
                <button 
                  onClick={() => {
                    if (!isLoggedIn) {
                      alert("Please log in to complete your transaction.");
                      navigate('/login');
                      return;
                    }
                    navigate('/checkout', { state: { discount } });
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-red-100 uppercase tracking-widest text-xs flex items-center justify-center gap-1.5"
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
