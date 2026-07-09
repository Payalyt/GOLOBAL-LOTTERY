import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, ArrowLeft, Clock, Ticket, CheckCircle, Info, Dices, Trophy
} from 'lucide-react';

interface LotteryRow {
  number: string;
  directBet: number;
  rumbleBet: number;
}

interface GameOption {
  id: string;
  title: string;
  description: string;
  tag: string;
  numDigits: number;
  minVal?: number;
  maxVal?: number;
  accentColor: string; // Left glowing vertical bar color
  odds: string;
  payout: string;
}

export default function ThaiLottery() {
  const { user, isLoggedIn, updateUserBalance, siteConfig } = useAuth();
  const navigate = useNavigate();

  const thaiDrawResults = (siteConfig?.drawResults || []).filter(
    dr => dr.gameName?.toUpperCase() === 'THAI GOVT LOTTERY' || dr.gameName?.toUpperCase() === 'THAI GOVE KOTTERY'
  );

  // Selected game mode state (null means showing the game menu)
  const [selectedGame, setSelectedGame] = useState<GameOption | null>(null);
  const [activeView, setActiveView] = useState<'play' | 'prizes' | 'results'>('play');

  // Rows of inputs for the active betting board - Default to 8 rows as shown in mockup
  const [betRows, setBetRows] = useState<LotteryRow[]>([
    { number: '', directBet: 0, rumbleBet: 0 },
    { number: '', directBet: 0, rumbleBet: 0 },
    { number: '', directBet: 0, rumbleBet: 0 },
    { number: '', directBet: 0, rumbleBet: 0 },
    { number: '', directBet: 0, rumbleBet: 0 },
    { number: '', directBet: 0, rumbleBet: 0 },
    { number: '', directBet: 0, rumbleBet: 0 },
    { number: '', directBet: 0, rumbleBet: 0 }
  ]);

  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [placingBets, setPlacingBets] = useState(false);

  // Available Thai Lottery official game types as requested (Exactly 8 categories from mockup / instructions)
  const gameOptions: GameOption[] = [
    {
      id: '3up',
      title: '3UP',
      description: '3 Digits. Prediction of the top three numbers of the 1st prize.',
      tag: '3UP',
      numDigits: 3,
      accentColor: 'from-amber-400 to-orange-500',
      odds: '1 in 1,000',
      payout: '4,000 Baht'
    },
    {
      id: '3up_down',
      title: '3UP DOWN',
      description: '3 Digits. Prediction of the first or last 3 digits of any secondary prize.',
      tag: '3UP DOWN',
      numDigits: 3,
      accentColor: 'from-cyan-400 to-indigo-500',
      odds: '1 in 500',
      payout: '4,000 Baht'
    },
    {
      id: '2up',
      title: '2UP',
      description: '2 Digits. Prediction of the last 2 digits of the 1st prize.',
      tag: '2UP',
      numDigits: 2,
      accentColor: 'from-purple-500 to-pink-500',
      odds: '1 in 100',
      payout: '2,000 Baht'
    },
    {
      id: '2up_down',
      title: '2UP DOWN',
      description: '2 Digits. Prediction of the bottom 2-digit official drawn number.',
      tag: '2UP DOWN',
      numDigits: 2,
      accentColor: 'from-teal-400 to-emerald-500',
      odds: '1 in 100',
      payout: '20,000 Baht'
    },
    {
      id: '4_up',
      title: '4 UP',
      description: '4 Digits. Prediction of first 4 digits of the top prizes.',
      tag: '4 UP',
      numDigits: 4,
      accentColor: 'from-rose-500 to-pink-600',
      odds: '1 in 10,000',
      payout: '80,000 Baht'
    },
    {
      id: '4_down',
      title: '4 DOWN',
      description: '4 Digits. Prediction of bottom 4-digit secondary drawn numbers.',
      tag: '4 DOWN',
      numDigits: 4,
      accentColor: 'from-orange-400 to-red-500',
      odds: '1 in 10,000',
      payout: '40,000 Baht'
    },
    {
      id: '6up',
      title: '6UP',
      description: '6 Digits. Exact prediction of the 1st Prize main jackpot number.',
      tag: '6UP',
      numDigits: 6,
      accentColor: 'from-yellow-400 to-amber-600',
      odds: '1 in 1,000,000',
      payout: '6,000,000 Baht'
    },
    {
      id: '6up_down',
      title: '6UP DOWN',
      description: '6 Digits. Prediction of second prize full drawn numbers.',
      tag: '6UP DOWN',
      numDigits: 6,
      accentColor: 'from-lime-400 to-emerald-500',
      odds: '1 in 500,000',
      payout: '200,000 Baht'
    },
  ];

  // Board operations
  const handleAddRow = () => {
    setBetRows([...betRows, { number: '', directBet: 0, rumbleBet: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (betRows.length === 1) {
      setBetRows([{ number: '', directBet: 0, rumbleBet: 0 }]);
    } else {
      setBetRows(betRows.filter((_, i) => i !== index));
    }
  };

  const handleRowChange = (index: number, field: keyof LotteryRow, value: string) => {
    const updated = [...betRows];
    if (field === 'number') {
      const sanitized = value.replace(/[^0-9]/g, '');
      updated[index].number = sanitized;
    } else {
      if (value === '') {
        (updated[index] as any)[field] = 0;
      } else {
        updated[index][field] = Math.max(0, parseFloat(value) || 0);
      }
    }
    setBetRows(updated);
  };

  const handleQuickPickRow = (index: number) => {
    if (!selectedGame) return;
    let num = '';
    for (let i = 0; i < selectedGame.numDigits; i++) {
      num += Math.floor(Math.random() * 10).toString();
    }
    const updated = [...betRows];
    updated[index].number = num;
    setBetRows(updated);
  };

  const handleQuickPickAll = () => {
    if (!selectedGame) return;
    const updated = betRows.map(row => {
      let num = '';
      for (let i = 0; i < selectedGame.numDigits; i++) {
        num += Math.floor(Math.random() * 10).toString();
      }
      return { ...row, number: num };
    });
    setBetRows(updated);
  };

  // Calculations
  const calculateTotalBet = () => {
    return betRows.reduce((sum, r) => {
      const dbVal = parseFloat(String(r.directBet)) || 0;
      const rbVal = parseFloat(String(r.rumbleBet)) || 0;
      return sum + (r.number.trim() !== '' ? (dbVal + rbVal) : 0);
    }, 0);
  };

  const calculateDiscount = () => {
    const total = calculateTotalBet();
    const activeRowsCount = betRows.filter(r => r.number.trim().length > 0).length;
    // 5% discount for 4 or more active rows
    return activeRowsCount >= 4 ? Math.round(total * 0.05 * 100) / 100 : 0;
  };

  const calculatePayable = () => {
    return parseFloat((calculateTotalBet() - calculateDiscount()).toFixed(2));
  };

  // Submit bets
  const handlePlaceBets = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isLoggedIn || !user) {
      setErrorMessage('Please log in first to purchase tickets.');
      return;
    }

    const filledRows = betRows.filter(row => row.number.trim() !== '');

    if (filledRows.length === 0) {
      setErrorMessage('Please enter at least one ticket number to submit.');
      return;
    }

    // Input Validation
    for (let i = 0; i < betRows.length; i++) {
      const row = betRows[i];
      if (row.number.trim() === '') continue; // Skip empty rows

      if (selectedGame) {
        if (row.number.length !== selectedGame.numDigits) {
          setErrorMessage(`Ticket #${i + 1} must be exactly ${selectedGame.numDigits} digits.`);
          return;
        }
      }

      const dbVal = parseFloat(String(row.directBet)) || 0;
      const rbVal = parseFloat(String(row.rumbleBet)) || 0;
      if (dbVal <= 0 && rbVal <= 0) {
        setErrorMessage(`Please enter a valid bet amount (Direct or Rumble) for ticket #${i + 1}.`);
        return;
      }
    }

    const cost = calculatePayable();
    if (user.balance < cost) {
      setErrorMessage('Insufficient balance. Please refill your wallet.');
      return;
    }

    setPlacingBets(true);
    try {
      const { db } = await import('../lib/firebase');
      const { doc, setDoc } = await import('firebase/firestore');

      const totalCost = cost;
      const updatedBalance = parseFloat((user.balance - totalCost).toFixed(2));

      // 1. Update User Balance in Firestore
      const userRef = doc(db, 'users', user.email.toLowerCase());
      await setDoc(userRef, { balance: updatedBalance }, { merge: true });

      // 2. Add Tickets to purchasedTickets Collection
      for (const row of filledRows) {
        const ticketId = 'THAI-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
        const numbersArr = row.number.split('').map(Number);
        const dbVal = parseFloat(String(row.directBet)) || 0;
        const rbVal = parseFloat(String(row.rumbleBet)) || 0;

        const newTicket = {
          id: ticketId,
          email: user.email.toLowerCase(),
          gameName: 'THAI GOVT LOTTERY',
          thaiLotteryType: selectedGame?.title,
          thaiLotteryNumber: row.number,
          directBet: dbVal,
          rumbleBet: rbVal,
          price: dbVal + rbVal,
          purchaseDate: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          status: 'Pending',
          numbers: numbersArr,
          isThaiLottery: true
        };

        await setDoc(doc(db, 'purchasedTickets', ticketId), newTicket);
      }

      // Update local context
      updateUserBalance(user.email, -totalCost);

      setOrderSuccess(true);
      // Reset rows to 8 empty slots
      setBetRows([
        { number: '', directBet: 0, rumbleBet: 0 },
        { number: '', directBet: 0, rumbleBet: 0 },
        { number: '', directBet: 0, rumbleBet: 0 },
        { number: '', directBet: 0, rumbleBet: 0 },
        { number: '', directBet: 0, rumbleBet: 0 },
        { number: '', directBet: 0, rumbleBet: 0 },
        { number: '', directBet: 0, rumbleBet: 0 },
        { number: '', directBet: 0, rumbleBet: 0 }
      ]);
    } catch (err: any) {
      setErrorMessage('Error purchasing tickets: ' + err.message);
    } finally {
      setPlacingBets(false);
    }
  };

  const openWalletRefill = () => {
    navigate('/my-account');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none pb-24">
      {/* Centered premium container mirroring the mockups */}
      <div className="w-full max-w-[550px] mx-auto px-4 pt-6 space-y-5">
        
        {/* ==========================================
           HEADER (As shown in Mockup 1)
           ========================================== */}
        <div className="bg-[#0b0821]/80 border border-zinc-900/60 rounded-2xl p-4 flex justify-between items-center shadow-2xl">
          <div className="flex items-center gap-3">
            <img src="https://i.postimg.cc/d0hfdLyv/THAI.webp" alt="Thai Lottery" className="w-9 h-9 rounded-full object-cover shrink-0 shadow-md border border-zinc-800" />
            <div>
              <h1 className="text-[13.5px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-indigo-200 to-cyan-300">
                THAI LOTTERY
              </h1>
              <p className="text-[9.5px] text-zinc-500 font-extrabold uppercase tracking-wider">
                Thailand Lottery Official Games
              </p>
            </div>
          </div>

          {/* Wallet Balance Display Pill */}
          <button 
            onClick={openWalletRefill}
            className="bg-[#120f3a] hover:bg-[#161247] border border-indigo-500/20 px-3.5 py-1.5 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <span className="text-[10px] text-zinc-400 font-extrabold tracking-wider">USD</span>
            <span className="font-mono font-black text-xs text-white">
              {user?.balance !== undefined ? user.balance.toFixed(2) : '0.00'}
            </span>
            <div className="w-4.5 h-4.5 bg-blue-600 text-white font-extrabold rounded-full flex items-center justify-center text-xs shadow">
              +
            </div>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!selectedGame ? (
            /* ==========================================
               SCREEN 1: CLEAN GAME SELECTION MENU
               ========================================== */
            <motion.div
              key="menu-selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Close Time Capsule Banner */}
              <div className="flex justify-center">
                <div className="bg-[#0b0821]/90 border border-zinc-900/80 rounded-full px-5 py-2 flex items-center gap-2 shadow-lg">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-[11px] font-extrabold text-zinc-300 uppercase tracking-widest">
                    Close Time: <b className="text-white text-yellow-400">Jul 16, 01:15 AM</b>
                  </span>
                </div>
              </div>

              {/* View Tabs */}
              <div className="flex bg-[#0b0821]/80 p-1 rounded-xl border border-zinc-900/60 shadow-lg">
                <button
                  onClick={() => setActiveView('play')}
                  className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-lg transition-all ${
                    activeView === 'play' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Play Game
                </button>
                <button
                  onClick={() => setActiveView('prizes')}
                  className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-lg transition-all ${
                    activeView === 'prizes' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Prize List
                </button>
                <button
                  onClick={() => setActiveView('results')}
                  className={`flex-1 text-[10px] font-black uppercase tracking-wider py-2.5 rounded-lg transition-all ${
                    activeView === 'results' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Draw Results
                </button>
              </div>

              {activeView === 'play' && (
              <>
              {/* Game Options List (ONLY Game name and play button as requested) */}
              <div className="bg-[#0b0821]/50 border border-zinc-900 rounded-3xl p-4 shadow-xl space-y-3.5">
                {gameOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setSelectedGame(opt);
                      setOrderSuccess(false);
                      setErrorMessage('');
                    }}
                    className="relative bg-[#070514] hover:bg-[#110e2b] border border-zinc-900 hover:border-indigo-500/40 rounded-2xl p-4 flex items-center justify-between transition duration-300 group cursor-pointer overflow-hidden"
                  >
                    {/* Glowing vertical bar on left border */}
                    <div className={`absolute top-0 left-0 w-[4px] h-full bg-gradient-to-b ${opt.accentColor}`} />

                    <div className="pl-3">
                      <h3 className="text-[13px] font-black text-white group-hover:text-yellow-400 tracking-wide transition duration-200">
                        {opt.title}
                      </h3>
                    </div>

                    {/* Oval shaped PLAY NOW button precisely matching Mockup 1 */}
                    <button className="flex items-center gap-2 bg-[#0c0926]/80 border border-zinc-800/80 hover:border-indigo-500/40 px-3.5 py-1.5 rounded-full shadow transition-all group-hover:scale-[1.03]">
                      <div className="w-5 h-5 bg-white text-indigo-950 font-black rounded-full flex items-center justify-center text-[10px] shadow-sm">
                        ▶
                      </div>
                      <span className="text-[9.5px] font-black text-white/90 uppercase tracking-wider">
                        PLAY NOW
                      </span>
                      <span className="text-zinc-500 text-xs font-bold group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Disclaimer Footnote */}
              <p className="text-[9.5px] text-zinc-600 text-center uppercase tracking-widest font-black">
                Official Thailand State Lottery Terminal
              </p>
              </>
              )}

              {activeView === 'prizes' && (
                <div className="bg-[#0b0821]/50 border border-zinc-900 rounded-3xl p-5 shadow-xl space-y-4">
                  <h3 className="text-yellow-400 font-black text-center text-sm uppercase tracking-widest border-b border-zinc-900 pb-3">Official Prize Structure</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { name: '1st Prize', count: '1', prize: '6,000,000 Baht' },
                      { name: '3-Digit Front', count: '2', prize: '4,000 Baht' },
                      { name: '3-Digit Rear', count: '2', prize: '4,000 Baht' },
                      { name: '2-Digit Last', count: '1', prize: '2,000 Baht' },
                      { name: '2nd Prize', count: '5', prize: '200,000 Baht' },
                      { name: '3rd Prize', count: '10', prize: '80,000 Baht' },
                      { name: '4th Prize', count: '50', prize: '40,000 Baht' },
                      { name: '5th Prize', count: '100', prize: '20,000 Baht' }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center py-2.5 px-3 bg-[#070514] rounded-xl border border-zinc-900 hover:border-zinc-800 transition-colors">
                        <span className="text-white font-bold">{row.name}</span>
                        <div className="flex gap-6 items-center">
                          <span className="text-zinc-500 font-mono text-[10px] w-4 text-center">{row.count}</span>
                          <span className="text-yellow-400 font-black tracking-wider w-24 text-right">{row.prize}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeView === 'results' && (
                <div className="space-y-6">
                  <div className="bg-[#0b0821]/50 border border-zinc-900 rounded-3xl p-5 shadow-xl text-center py-6">
                    <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2 animate-bounce" />
                    <h3 className="text-white font-black text-sm uppercase tracking-widest">Thai Govt Lottery Official Results</h3>
                    <p className="text-zinc-500 text-xs mt-1">Live from government draws. Updates instantly on result publishing.</p>
                  </div>

                  {thaiDrawResults.length === 0 ? (
                    <div className="bg-[#050312]/80 border border-zinc-900 rounded-3xl p-8 text-center space-y-2">
                      <p className="text-zinc-400 font-bold text-xs uppercase tracking-wider">No draws published yet</p>
                      <p className="text-zinc-500 text-[10.5px]">Results will be published here automatically once the live drawing results are saved by the admin.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {thaiDrawResults.map((dr, idx) => (
                        <div 
                          key={dr.id || idx}
                          className="bg-[#0b0821]/80 border border-zinc-900/60 rounded-3xl p-5 shadow-xl space-y-4 hover:border-yellow-500/20 transition-all duration-300"
                        >
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
                            <div className="text-left">
                              <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest block">Draw Date</span>
                              <span className="text-white font-black text-xs uppercase">{dr.date}</span>
                            </div>
                            {dr.refCode && (
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Ref Code</span>
                                <span className="text-zinc-300 font-mono text-[10.5px] font-bold">{dr.refCode}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 py-1">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block text-left">Winning Numbers / ড্র রেজাল্ট নাম্বার:</span>
                            <div className="flex flex-wrap gap-2 justify-start items-center">
                              {dr.numbers.map((num, nIdx) => (
                                <div 
                                  key={nIdx}
                                  className="w-10 h-10 bg-gradient-to-b from-yellow-400 to-amber-600 border border-yellow-300 text-zinc-950 font-black text-sm rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/10 font-mono transform hover:scale-110 transition-transform"
                                >
                                  {num}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 bg-[#050312]/60 p-3 rounded-2xl border border-zinc-900 text-left">
                            <div>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Total Winners</span>
                              <span className="text-emerald-400 font-black text-xs font-mono">{dr.totalWinners || '0 Players'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Total Paid Out</span>
                              <span className="text-yellow-500 font-black text-xs font-mono">{dr.totalPaid || '$0.00'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            /* ==========================================
               SCREEN 2: INTERACTIVE TICKET BUILDER BOARD
               ========================================== */
            <motion.div
              key="betting-board"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Top Navigation Row */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setSelectedGame(null)}
                  className="w-9 h-9 bg-[#0b0821]/90 border border-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-800 transition shadow cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="bg-zinc-950/20 text-zinc-500 font-extrabold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full">
                  Interactive Ticket Slip
                </div>
              </div>

              {/* Large Active Category Card Mockup 2 */}
              <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-center py-4 rounded-2xl shadow-xl border border-indigo-500/20 tracking-wider text-[14px]">
                {selectedGame.title.toUpperCase()}
              </div>

              {/* Error Alert Message box */}
              {errorMessage && (
                <div className="bg-red-950/40 border border-red-500/30 text-red-400 font-semibold rounded-2xl p-3 text-xs text-center">
                  ⚠️ {errorMessage}
                </div>
              )}

              {/* Order Success Screen */}
              {orderSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#0b0821] border border-emerald-500/20 rounded-3xl p-6 text-center space-y-4 shadow-2xl"
                >
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-[13.5px] font-black text-white uppercase tracking-wider">TICKETS PURCHASED SUCCESSFULLY!</h3>
                    <p className="text-zinc-400 text-[10px] font-semibold mt-1">
                      Slips processed successfully. You can track your purchase history in the dashboard.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedGame(null);
                      setOrderSuccess(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] tracking-widest uppercase py-2.5 px-8 rounded-xl transition cursor-pointer"
                  >
                    CONTINUE TO GAME LIST
                  </button>
                </motion.div>
              )}

              {/* Main Ticket Generator Grid list */}
              {!orderSuccess && (
                <form onSubmit={handlePlaceBets} className="space-y-4">
                  <div className="bg-[#0b0821]/80 border border-zinc-900 rounded-3xl p-4 shadow-xl space-y-4">
                    
                    {/* Columns Label Row (NUMBER, DIRECT, RUMBLE columns precisely matching Image 2) */}
                    <div className="grid grid-cols-12 gap-2 text-[9.5px] font-black tracking-widest text-zinc-500 uppercase">
                      <span className="col-span-4 text-center">NUMBER</span>
                      <span className="col-span-4 text-center">DIRECT</span>
                      <span className="col-span-4 text-center">RUMBLE</span>
                    </div>

                    {/* Active Slips Rows */}
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                      {betRows.map((row, index) => (
                        <div 
                          key={index} 
                          className="grid grid-cols-12 gap-2 bg-[#050312] p-1.5 rounded-xl items-center relative group/row"
                        >
                          {/* Number Input Field (Gold Border as in Image 2) */}
                          <div className="col-span-4 relative">
                            <input
                              type="text"
                              value={row.number}
                              maxLength={selectedGame.numDigits}
                              onChange={(e) => handleRowChange(index, 'number', e.target.value)}
                              placeholder="Number"
                              className="bg-transparent border border-yellow-500/45 hover:border-yellow-500 focus:border-yellow-500 text-yellow-400 font-mono font-black text-center text-xs py-2 px-1 rounded-xl w-full focus:outline-none transition tracking-widest placeholder:text-zinc-700"
                            />
                            {/* Embedded Quick Pick dice option */}
                            <button
                              type="button"
                              onClick={() => handleQuickPickRow(index)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-yellow-400 transition"
                              title="Quick Pick Digit"
                            >
                              <Dices className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Direct Bet Input (Gold Border as in Image 2) */}
                          <div className="col-span-4">
                            <input
                              type="text"
                              value={row.directBet === 0 && row.number === '' ? '' : row.directBet}
                              placeholder="Direct"
                              onChange={(e) => handleRowChange(index, 'directBet', e.target.value)}
                              className="bg-transparent border border-yellow-500/45 hover:border-yellow-500 focus:border-yellow-500 text-white font-mono font-black text-center text-xs py-2 px-1 rounded-xl w-full focus:outline-none transition"
                            />
                          </div>

                          {/* Rumble Bet Input (Gold Border as in Image 2) */}
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={row.rumbleBet === 0 && row.number === '' ? '' : row.rumbleBet}
                              placeholder="Rumble"
                              onChange={(e) => handleRowChange(index, 'rumbleBet', e.target.value)}
                              className="bg-transparent border border-yellow-500/45 hover:border-yellow-500 focus:border-yellow-500 text-white font-mono font-black text-center text-xs py-2 px-1 rounded-xl w-full focus:outline-none transition"
                            />
                          </div>

                          {/* Delete ticket row option */}
                          <div className="col-span-1 text-center">
                            {betRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(index)}
                                className="text-zinc-600 hover:text-red-500 transition p-1"
                                title="Delete Slip"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Pick All & Add Row Buttons */}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={handleQuickPickAll}
                        className="bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-400 font-extrabold text-[8.5px] tracking-wider uppercase px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                      >
                        🎲 QUICK PICK ALL
                      </button>
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="bg-[#0d2a27]/40 border border-[#0d9488]/40 hover:border-[#0d9488]/80 text-[#0d9488] font-bold text-[9.5px] tracking-widest px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition uppercase cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> ADD ROW
                      </button>
                    </div>

                  </div>

                  {/* Calculations Status Grid Panels matching Image 2 */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Bet Total */}
                    <div className="bg-[#0b0821]/85 border border-zinc-900 rounded-2xl p-3 text-center shadow-md">
                      <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase block">
                        BET TOTAL
                      </span>
                      <span className="font-mono font-black text-xs text-white mt-1.5 block">
                        {calculateTotalBet().toFixed(2)}
                      </span>
                    </div>

                    {/* Volume Discount */}
                    <div className="bg-[#0b0821]/85 border border-zinc-900 rounded-2xl p-3 text-center shadow-md">
                      <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase block">
                        DISCOUNT (5%)
                      </span>
                      <span className="font-mono font-black text-xs text-teal-400 mt-1.5 block">
                        {calculateDiscount().toFixed(2)}
                      </span>
                    </div>

                    {/* Final Payable */}
                    <div className="bg-[#0b0821]/85 border border-zinc-900 rounded-2xl p-3 text-center shadow-md">
                      <span className="text-[8px] font-black tracking-widest text-indigo-400 uppercase block">
                        PAYABLE
                      </span>
                      <span className="font-mono font-black text-xs text-yellow-400 mt-1.5 block">
                        {calculatePayable().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Purple/Blue Gradient Submit Button precisely as Image 2 */}
                  <button
                    type="submit"
                    disabled={placingBets}
                    className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white hover:opacity-95 disabled:opacity-50 font-black text-center py-4 rounded-2xl shadow-xl transition-all tracking-widest text-xs uppercase cursor-pointer"
                  >
                    {placingBets ? 'SUBMITTING...' : 'SUBMIT'}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Small Help Info disclaimer box */}
        <div className="bg-[#0b0821]/20 border border-zinc-950 rounded-xl p-3 flex gap-2 text-[10px] text-zinc-600 leading-normal">
          <Info className="w-4 h-4 text-zinc-700 shrink-0 mt-0.5" />
          <p>
            Please verify all numbers on your ticket slips before clicking Submit. Draw outcomes are parsed automatically based on official government records.
          </p>
        </div>

      </div>
    </div>
  );
}
