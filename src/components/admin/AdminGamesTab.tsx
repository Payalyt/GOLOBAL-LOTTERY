import React, { useState, useEffect } from 'react';
import { DynamicGame, useAuth } from '../../context/AuthContext';
import { Plus, Trash2, Save } from 'lucide-react';

export function AdminGamesTab() {
  const { dynamicGames, updateDynamicGame, addDynamicGame, deleteDynamicGame, siteConfig, updateSiteConfig } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 🇹🇭 Thai Lottery Config States
  const DEFAULT_THAI_PRIZES = [
    { name: '1st Prize', count: '1', prize: '6,000,000 Baht' },
    { name: '3-Digit Front', count: '2', prize: '4,000 Baht' },
    { name: '3-Digit Rear', count: '2', prize: '4,000 Baht' },
    { name: '2-Digit Last', count: '1', prize: '2,000 Baht' },
    { name: '2nd Prize', count: '5', prize: '200,000 Baht' },
    { name: '3rd Prize', count: '10', prize: '80,000 Baht' },
    { name: '4th Prize', count: '50', prize: '40,000 Baht' },
    { name: '5th Prize', count: '100', prize: '20,000 Baht' }
  ];

  const DEFAULT_THAI_MULTIPLIERS = {
    firstPrize: 66666.66,
    front3: 40,
    rear3: 40,
    last2: 20,
    consolation: 1000,
    threeUpDirect: 500,
    threeUpRumble: 100,
    threeUpSingle: 10,
    threeUpSum: 15,
    twoUpDirect: 90,
    downDirect: 90,
    downSingle: 8,
    downSum: 15
  };

  const [thaiDrawTime, setThaiDrawTime] = useState(siteConfig?.thaiLotteryDrawTime || 'Jul 16, 01:15 AM');
  const [thaiPrizes, setThaiPrizes] = useState(siteConfig?.thaiPrizes || DEFAULT_THAI_PRIZES);
  const [thaiMultipliers, setThaiMultipliers] = useState(siteConfig?.thaiLotteryPrizes || DEFAULT_THAI_MULTIPLIERS);
  const [thaiSuccess, setThaiSuccess] = useState('');

  useEffect(() => {
    if (siteConfig) {
      if (siteConfig.thaiLotteryDrawTime) setThaiDrawTime(siteConfig.thaiLotteryDrawTime);
      if (siteConfig.thaiPrizes) setThaiPrizes(siteConfig.thaiPrizes);
      if (siteConfig.thaiLotteryPrizes) setThaiMultipliers(siteConfig.thaiLotteryPrizes);
    }
  }, [siteConfig]);

  const handleSaveThaiConfig = async () => {
    try {
      setThaiSuccess('');
      await updateSiteConfig({
        thaiLotteryDrawTime: thaiDrawTime,
        thaiPrizes: thaiPrizes,
        thaiLotteryPrizes: thaiMultipliers
      });
      setThaiSuccess('Thai Lottery settings and prize structures saved successfully!');
      setTimeout(() => setThaiSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Failed to save Thai Lottery settings.');
    }
  };

  const addThaiPrizeRow = () => {
    setThaiPrizes(prev => [...prev, { name: 'New Prize Tier', count: '1', prize: '1,000 Baht' }]);
  };

  const removeThaiPrizeRow = (idx: number) => {
    setThaiPrizes(prev => prev.filter((_, i) => i !== idx));
  };

  const updateThaiPrizeField = (idx: number, key: 'name' | 'count' | 'prize', value: string) => {
    setThaiPrizes(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName.trim()) {
      setErrorMsg('Game name is required.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await addDynamicGame({
        id: Date.now().toString(),
        name: newGameName.trim().toUpperCase(),
        prize: '$1,000,000',
        price: 10,
        drawTime: '21:00 UTC',
        targetDateStr: 'SUNDAY',
        bgHex: '#1e3c72',
        isSolidStyle: false,
        cardBgType: 'gradient',
        cardBgGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        isActive: true,
        buttonColor: 'bg-emerald-500',
        buttonTextColor: 'text-white'
      });
      setSuccessMsg(`Game "${newGameName.trim().toUpperCase()}" created successfully! Scroll down to configure it.`);
      setNewGameName('');
      setShowAddForm(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to add game. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
        <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">
          Games & Prize Breakdowns
        </h3>
        <button 
          type="button" 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setErrorMsg('');
          }} 
          className="flex items-center gap-1 text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded-lg hover:bg-amber-600"
        >
          <Plus size={14}/> {showAddForm ? 'Cancel' : 'Add New Game'}
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold">
          {successMsg}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreateGame} className="p-4 border border-amber-500/30 rounded-xl bg-amber-500/5 space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-500">Create New Lottery Game</h4>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Game Name</label>
            <input 
              type="text" 
              placeholder="e.g. MEGA MAX, POWERBALL, SLATE7" 
              value={newGameName} 
              onChange={e => setNewGameName(e.target.value)} 
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500"
            />
          </div>
          {errorMsg && <p className="text-[10px] text-red-500 font-bold uppercase">{errorMsg}</p>}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-bold">Create Game</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold">Cancel</button>
          </div>
        </form>
      )}
      
      <div className="space-y-12">
        {dynamicGames?.map((game, index) => (
          <GameEditor key={game.id || index} game={game} updateDynamicGame={updateDynamicGame} deleteDynamicGame={deleteDynamicGame} />
        ))}
      </div>

      {/* 🇹🇭 Thai Govt Lottery Settings & Prize Structure */}
      <div className="border-t border-gray-200 dark:border-zinc-850 pt-8 mt-12 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 pb-4">
          <div>
            <h4 className="text-base font-black uppercase text-teal-500 tracking-wider flex items-center gap-2">
              <span>🇹🇭</span> Thai Govt Lottery Global Settings
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              Configure Thai Lottery close timings, custom payout multipliers, and the official prize display pool.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveThaiConfig}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.01] shadow-lg shadow-teal-600/10 self-start sm:self-center"
          >
            <Save size={14} /> Save Thai Config
          </button>
        </div>

        {thaiSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold">
            {thaiSuccess}
          </div>
        )}

        {/* Section 1: Draw Close Time */}
        <div className="bg-gray-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-gray-100 dark:border-zinc-850 space-y-4">
          <h5 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            1. Draw Close Timing
          </h5>
          <div className="max-w-md">
            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
              Thai Lottery Draw Close Time Text
            </label>
            <input
              type="text"
              value={thaiDrawTime}
              onChange={(e) => setThaiDrawTime(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Jul 16, 01:15 AM"
            />
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
              This text is displayed on the main Thai Lottery ticket purchasing board.
            </p>
          </div>
        </div>

        {/* Section 2: Payout Multipliers */}
        <div className="bg-gray-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-gray-100 dark:border-zinc-850 space-y-4">
          <h5 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
            2. Payout Multipliers (x of Bet Amount)
          </h5>
          <p className="text-xs text-gray-400">
            Configure the dynamic multiplier rates used to compute real-time payouts for matching slips.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">1st Prize (6UP)</label>
              <input
                type="number"
                step="0.01"
                value={thaiMultipliers.firstPrize}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, firstPrize: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Front 3 Digits</label>
              <input
                type="number"
                value={thaiMultipliers.front3}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, front3: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Rear 3 Digits</label>
              <input
                type="number"
                value={thaiMultipliers.rear3}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, rear3: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Last 2 Digits</label>
              <input
                type="number"
                value={thaiMultipliers.last2}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, last2: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">3UP Direct</label>
              <input
                type="number"
                value={thaiMultipliers.threeUpDirect}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, threeUpDirect: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">3UP Rumble</label>
              <input
                type="number"
                value={thaiMultipliers.threeUpRumble}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, threeUpRumble: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">3UP Single</label>
              <input
                type="number"
                value={thaiMultipliers.threeUpSingle}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, threeUpSingle: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">3UP Sum</label>
              <input
                type="number"
                value={thaiMultipliers.threeUpSum}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, threeUpSum: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">2UP Direct</label>
              <input
                type="number"
                value={thaiMultipliers.twoUpDirect}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, twoUpDirect: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Down Direct</label>
              <input
                type="number"
                value={thaiMultipliers.downDirect}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, downDirect: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Down Single</label>
              <input
                type="number"
                value={thaiMultipliers.downSingle}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, downSingle: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Down Sum</label>
              <input
                type="number"
                value={thaiMultipliers.downSum}
                onChange={(e) => setThaiMultipliers(p => ({ ...p, downSum: Number(e.target.value) }))}
                className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Official Prize Pool Display */}
        <div className="bg-gray-50/50 dark:bg-zinc-900/30 p-5 rounded-2xl border border-gray-100 dark:border-zinc-850 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              3. Official Prize Structure List
            </h5>
            <button
              type="button"
              onClick={addThaiPrizeRow}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
            >
              <Plus size={14} /> Add New Row
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Edit the prize tiers shown on the user page under the "Official Prize Pool Structure" table.
          </p>

          <div className="grid gap-2">
            {thaiPrizes.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Prize Name (e.g. 1st Prize)"
                    value={p.name}
                    onChange={(e) => updateThaiPrizeField(i, 'name', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="text"
                    placeholder="Count"
                    value={p.count}
                    onChange={(e) => updateThaiPrizeField(i, 'count', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Prize Value"
                    value={p.prize}
                    onChange={(e) => updateThaiPrizeField(i, 'prize', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white font-semibold text-emerald-500 outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeThaiPrizeRow(i)}
                  className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {thaiPrizes.length === 0 && (
              <p className="text-xs text-gray-400 italic">No prize tiers configured. Click "Add New Row" to start.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleSaveThaiConfig}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-teal-600/15"
          >
            <Save size={14} /> Save Thai Lottery Settings
          </button>
        </div>
      </div>
    </div>
  );
}

const GameEditor: React.FC<{ game: DynamicGame, updateDynamicGame: any, deleteDynamicGame: any }> = ({ game, updateDynamicGame, deleteDynamicGame }) => {
  const [localGame, setLocalGame] = useState<DynamicGame>(game);
  const [gradColor1, setGradColor1] = useState('#1e3c72');
  const [gradColor2, setGradColor2] = useState('#2a5298');
  const [gradAngle, setGradAngle] = useState(135);
  const [editorSuccess, setEditorSuccess] = useState('');
  const [editorError, setEditorError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setLocalGame(game);
    // Try to parse existing linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)
    const match = game.cardBgGradient?.match(/linear-gradient\((\d+)deg,\s*(#[a-fA-F0-9]{3,8}|[a-zA-Z]+)\s+0%,\s*(#[a-fA-F0-9]{3,8}|[a-zA-Z]+)\s+100%\)/);
    if (match) {
      setGradAngle(Number(match[1]));
      setGradColor1(match[2]);
      setGradColor2(match[3]);
    }
  }, [game]);

  const handleBuilderChange = (c1: string, c2: string, angle: number) => {
    setGradColor1(c1);
    setGradColor2(c2);
    setGradAngle(angle);
    updateField('cardBgGradient', `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`);
  };
  
  const handleSave = async () => {
    setEditorError('');
    setEditorSuccess('');
    try {
      await updateDynamicGame(game.name, localGame);
      setEditorSuccess('Game details updated successfully!');
      setTimeout(() => setEditorSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setEditorError('Failed to update game details.');
    }
  };

  const updateField = (field: keyof DynamicGame, value: any) => {
    setLocalGame(prev => ({ ...prev, [field]: value }));
  };

  const addPrizeTier = () => {
    const current = localGame.prizeBreakdown || [];
    setLocalGame(prev => ({ ...prev, prizeBreakdown: [...current, { label: 'Match X', count: 1, prize: '$100' }] }));
  };

  const removePrizeTier = (index: number) => {
    const current = [...(localGame.prizeBreakdown || [])];
    current.splice(index, 1);
    setLocalGame(prev => ({ ...prev, prizeBreakdown: current }));
  };

  const updatePrizeTier = (index: number, field: string, value: string | number) => {
    const current = [...(localGame.prizeBreakdown || [])];
    current[index] = { ...current[index], [field]: value };
    setLocalGame(prev => ({ ...prev, prizeBreakdown: current }));
  };

  // Convert ISO Date to Datetime-Local format (YYYY-MM-DDTHH:MM)
  const formatIsoForInput = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  const setShortcutTime = (minutesToAdd: number) => {
    const futureDate = new Date(Date.now() + minutesToAdd * 60 * 1000);
    updateField('targetDateStr', futureDate.toISOString());
  };

  // Preset Colors for Solid Color Picker
  const solidColorPresets = [
    { label: 'Rose Red', hex: '#E11D48' },
    { label: 'Lime Green', hex: '#A3E635' },
    { label: 'Emerald', hex: '#059669' },
    { label: 'Amber Gold', hex: '#F59E0B' },
    { label: 'Hot Pink', hex: '#EC4899' },
    { label: 'Royal Blue', hex: '#1C2C80' },
    { label: 'Sunset Orange', hex: '#F97316' },
    { label: 'Cosmic Purple', hex: '#8B5CF6' },
    { label: 'Deep Indigo', hex: '#4F46E5' },
    { label: 'Teal Blue', hex: '#06B6D4' }
  ];

  // Preset Gradients for Card Backgrounds
  const gradientPresets = [
    { name: 'Red Fire', css: 'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)' },
    { name: 'Acid Lime', css: 'linear-gradient(135deg, #A3E635 0%, #4D7C0F 100%)' },
    { name: 'Deep Forest', css: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' },
    { name: 'Classic Navy', css: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
    { name: 'Sugar Pink', css: 'linear-gradient(135deg, #EC4899 0%, #9D174D 100%)' },
    { name: 'Nebula Violet', css: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)' },
    { name: 'Vibrant Amber', css: 'linear-gradient(135deg, #F59E0B 0%, #92400E 100%)' },
    { name: 'Sunset Tangerine', css: 'linear-gradient(135deg, #F97316 0%, #9A3412 100%)' }
  ];

  // Calculate live preview style
  let previewStyle: React.CSSProperties = {};
  if (localGame.cardBgType === 'image' && localGame.cardBgImage) {
    previewStyle = {
      backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.85) 100%), url(${localGame.cardBgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  } else if (localGame.cardBgType === 'gradient' && localGame.cardBgGradient) {
    previewStyle = { background: localGame.cardBgGradient };
  } else {
    previewStyle = { backgroundColor: localGame.bgHex || '#1e3c72' };
  }

  return (
    <div className="border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 bg-gray-50 dark:bg-zinc-900/30 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-850">
        <div>
          <h4 className="font-extrabold text-xl text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <span>{localGame.name}</span>
            {!localGame.isActive && (
              <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold uppercase px-2 py-0.5 rounded-full">Inactive</span>
            )}
          </h4>
          <p className="text-xs text-gray-400 mt-1">ID: {localGame.id || 'Default'}</p>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-4 py-2 rounded-xl shrink-0 shadow-sm">
          <input 
            type="checkbox" 
            checked={localGame.isActive !== false} 
            onChange={(e) => updateField('isActive', e.target.checked)}
            className="w-4.5 h-4.5 rounded text-amber-500 bg-gray-100 border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 focus:ring-amber-500"
          />
          <span className="text-xs sm:text-sm font-bold text-gray-700 dark:text-zinc-300">Active Game</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Ticket Price */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
            Ticket Price ($)
          </label>
          <input 
            type="number" 
            value={localGame.price} 
            onChange={(e) => updateField('price', Number(e.target.value))}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Main Prize */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
            Grand Prize
          </label>
          <input 
            type="text" 
            value={localGame.prize} 
            onChange={(e) => updateField('prize', e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-semibold outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="e.g. $50,000,000 or 16M Baht"
          />
        </div>

        {/* Draw Day (Frequency Text) */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
            Display Day Label
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={localGame.drawTime || ''} 
              onChange={(e) => updateField('drawTime', e.target.value)}
              className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="e.g. SUNDAY, FRIDAY, DAILY"
            />
            <select
              onChange={(e) => updateField('drawTime', e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-2 py-2 text-xs text-gray-600 dark:text-zinc-300 outline-none"
              defaultValue=""
            >
              <option value="" disabled>Presets</option>
              <option value="SUNDAY">Sunday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="FRIDAY">Friday</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="TWICE MONTHLY">Twice Monthly</option>
              <option value="PLAY NOW">Play Now</option>
            </select>
          </div>
        </div>

        {/* Exact Next Draw Datetime Target */}
        <div className="md:col-span-2">
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5 flex items-center justify-between">
            <span>Countdown End Date & Time</span>
            <span className="text-[10px] text-amber-500 font-bold lowercase">sets countdown timer</span>
          </label>
          <input 
            type="datetime-local" 
            value={formatIsoForInput(localGame.targetDateStr)} 
            onChange={(e) => {
              if (e.target.value) {
                const isodate = new Date(e.target.value).toISOString();
                updateField('targetDateStr', isodate);
              }
            }}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-amber-500"
          />
          {/* Quick set shortcuts */}
          <div className="flex gap-1.5 flex-wrap mt-2">
            <span className="text-[9px] font-bold text-gray-400 self-center uppercase tracking-wider mr-1">Shortcuts:</span>
            <button type="button" onClick={() => setShortcutTime(60)} className="px-2.5 py-1 text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-600 dark:text-zinc-300 rounded-lg transition-colors">In 1 Hour</button>
            <button type="button" onClick={() => setShortcutTime(1440)} className="px-2.5 py-1 text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-600 dark:text-zinc-300 rounded-lg transition-colors">In 24 Hours</button>
            <button type="button" onClick={() => setShortcutTime(4320)} className="px-2.5 py-1 text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-600 dark:text-zinc-300 rounded-lg transition-colors">In 3 Days</button>
            <button type="button" onClick={() => setShortcutTime(10080)} className="px-2.5 py-1 text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-600 dark:text-zinc-300 rounded-lg transition-colors">In 7 Days</button>
          </div>
        </div>

        {/* Optional Redirect URL */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">
            Redirect URL (Optional)
          </label>
          <input 
            type="text" 
            value={localGame.customUrl || ''} 
            onChange={(e) => updateField('customUrl', e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Leave empty or e.g. /games/MEGA7"
          />
        </div>
      </div>

      {/* BACKGROUND CUSTOMIZATION ENGINE */}
      <div className="border-t border-gray-200 dark:border-zinc-850 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-black uppercase tracking-wider text-amber-500">
            Game Background Styling
          </h5>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Solid, Gradient or Custom Image</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Select Type and Controls */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1.5">
                Background Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'color', label: 'Solid Color' },
                  { value: 'gradient', label: 'Gradient' },
                  { value: 'image', label: 'Image URL' }
                ].map((typeOption) => (
                  <button
                    key={typeOption.value}
                    type="button"
                    onClick={() => updateField('cardBgType', typeOption.value)}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all uppercase ${
                      (localGame.cardBgType || 'gradient') === typeOption.value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'border-gray-200 dark:border-zinc-850 bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-850'
                    }`}
                  >
                    {typeOption.label.split(' / ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Render SOLID COLOR controls */}
            {(localGame.cardBgType || 'gradient') === 'color' && (
              <div className="space-y-3.5 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-850">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
                      Custom Color (HEX)
                    </label>
                    <input 
                      type="text" 
                      value={localGame.bgHex || ''} 
                      onChange={(e) => updateField('bgHex', e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white font-mono outline-none"
                      placeholder="e.g. #FF2E42"
                    />
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <input 
                      type="color" 
                      value={localGame.bgHex && localGame.bgHex.startsWith('#') ? localGame.bgHex : '#1C2C80'} 
                      onChange={(e) => updateField('bgHex', e.target.value)}
                      className="w-12 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
                    />
                    <span className="text-xs font-bold text-gray-400 uppercase">Picker</span>
                  </div>
                </div>

                {/* Preset circles */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Popular Solid Presets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {solidColorPresets.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => updateField('bgHex', preset.hex)}
                        className={`w-7 h-7 rounded-full border-2 transition-all relative ${
                          localGame.bgHex === preset.hex 
                            ? 'border-white ring-2 ring-amber-500 scale-110 shadow-md' 
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: preset.hex }}
                        title={preset.label}
                      >
                        {localGame.bgHex === preset.hex && (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Render GRADIENT controls */}
            {(localGame.cardBgType || 'gradient') === 'gradient' && (
              <div className="space-y-4 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
                    Custom Gradient Rule
                  </label>
                  <input 
                    type="text" 
                    value={localGame.cardBgGradient || ''} 
                    onChange={(e) => updateField('cardBgGradient', e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white font-mono outline-none"
                    placeholder="e.g. linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)"
                  />
                </div>

                {/* Interactive Color Selector */}
                <div className="p-3 bg-gray-50 dark:bg-zinc-900/40 rounded-lg border border-gray-150 dark:border-zinc-800 space-y-3">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Gradient Creator
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Color 1 (Start)</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={gradColor1} 
                          onChange={(e) => handleBuilderChange(e.target.value, gradColor2, gradAngle)}
                          className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-zinc-700 bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={gradColor1} 
                          onChange={(e) => handleBuilderChange(e.target.value, gradColor2, gradAngle)}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-[11px] text-gray-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Color 2 (End)</label>
                      <div className="flex gap-1.5 items-center">
                        <input 
                          type="color" 
                          value={gradColor2} 
                          onChange={(e) => handleBuilderChange(gradColor1, e.target.value, gradAngle)}
                          className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-zinc-700 bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={gradColor2} 
                          onChange={(e) => handleBuilderChange(gradColor1, e.target.value, gradAngle)}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-[11px] text-gray-900 dark:text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1">Angle: {gradAngle}°</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="360" 
                        value={gradAngle} 
                        onChange={(e) => handleBuilderChange(gradColor1, gradColor2, Number(e.target.value))}
                        className="w-full accent-amber-500 mt-1 cursor-pointer"
                      />
                      <div className="text-[10px] text-gray-400 font-bold mt-1 text-right">{gradAngle}° deg</div>
                    </div>
                  </div>
                </div>

                {/* Presets Grid */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Premium Presets
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {gradientPresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          updateField('cardBgGradient', preset.css);
                          // Sync picker colors
                          const match = preset.css.match(/linear-gradient\((\d+)deg,\s*(#[a-fA-F0-9]{3,8}|[a-zA-Z]+)\s+0%,\s*(#[a-fA-F0-9]{3,8}|[a-zA-Z]+)\s+100%\)/);
                          if (match) {
                            setGradAngle(Number(match[1]));
                            setGradColor1(match[2]);
                            setGradColor2(match[3]);
                          }
                        }}
                        className={`h-11 rounded-lg text-[9px] font-black uppercase text-white p-1 text-center flex items-center justify-center border-2 transition-all shadow-inner ${
                          localGame.cardBgGradient === preset.css
                            ? 'border-white ring-2 ring-amber-500 scale-[1.02]'
                            : 'border-transparent opacity-85 hover:opacity-100 hover:scale-[1.01]'
                        }`}
                        style={{ background: preset.css }}
                      >
                        <span className="bg-black/45 px-1.5 py-0.5 rounded backdrop-blur-[1px]">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Render IMAGE URL controls */}
            {(localGame.cardBgType || 'gradient') === 'image' && (
              <div className="space-y-3 bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-850">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 mb-1">
                    Background Image URL
                  </label>
                  <input 
                    type="text" 
                    value={localGame.cardBgImage || ''} 
                    onChange={(e) => updateField('cardBgImage', e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none"
                    placeholder="e.g. https://images.unsplash.com/... or Imgbb direct link"
                  />
                  <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1.5 block">
                    💡 Tip: Supports standard direct URLs, Imgbb links (even raw sharing URLs), and CDN pictures.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Visual Live Card Preview Column */}
          <div className="lg:col-span-4 space-y-2">
            <span className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400">
              Live Preview
            </span>
            <div 
              className="rounded-2xl h-[220px] p-4 flex flex-col justify-between text-white relative shadow-lg overflow-hidden border border-white/10"
              style={previewStyle}
            >
              {/* Header info */}
              <div className="flex justify-between items-center w-full">
                <span className="font-extrabold text-xs uppercase tracking-tighter">{localGame.name || 'GAME'}</span>
                <span className="text-[8px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {localGame.drawTime || 'SUNDAY'}
                </span>
              </div>

              {/* Middle Prize & timer preview */}
              <div className="text-center my-auto">
                <span className="text-[7px] font-black tracking-widest text-white/70 block uppercase">GRAND PRIZE</span>
                <p className="text-xl font-black tracking-tight leading-tight mt-0.5 text-white">
                  {localGame.prize || '$10,000,000'}
                </p>
                
                <div className="mt-3.5 flex gap-1 justify-center">
                  {['01', '12', '45', '56'].map((num, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="bg-black/35 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                        {num}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer play button preview */}
              <div className="w-full flex justify-center mt-auto">
                <div className="w-full text-center bg-white/20 border border-white/10 text-white font-extrabold text-[8px] tracking-wider uppercase py-1.5 rounded-full">
                  PLAY FOR ${localGame.price || 10}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Button styles settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-gray-200 dark:border-zinc-800 pt-5">
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">
            Button BG Color
          </label>
          <input 
            type="text" 
            value={localGame.buttonColor || ''} 
            onChange={(e) => updateField('buttonColor', e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            placeholder="e.g. bg-emerald-500 or #10b981"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 mb-1">
            Button Text Color
          </label>
          <input 
            type="text" 
            value={localGame.buttonTextColor || ''} 
            onChange={(e) => updateField('buttonTextColor', e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
            placeholder="e.g. text-white or #ffffff"
          />
        </div>
      </div>
      
      {/* Prize Breakdown Winners Tier */}
      <div className="space-y-3.5 border-t border-gray-200 dark:border-zinc-800 pt-5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            Prize Tiers
          </label>
          <button type="button" onClick={addPrizeTier} className="text-xs font-bold text-amber-600 dark:text-amber-500 flex items-center gap-1 hover:underline">
            <Plus size={14} /> Add New Tier
          </button>
        </div>
        
        <div className="grid gap-2">
          {localGame.prizeBreakdown?.map((tier, i) => (
            <div key={i} className="flex flex-wrap sm:flex-nowrap gap-2 items-center bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div className="flex-1 min-w-[120px]">
                <input 
                  type="text" 
                  placeholder="Match Tier (e.g. Match 6)"
                  value={tier.label} 
                  onChange={(e) => updatePrizeTier(i, 'label', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="w-24">
                <input 
                  type="number" 
                  placeholder="Winners"
                  value={tier.count} 
                  onChange={(e) => updatePrizeTier(i, 'count', Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="flex-1 min-w-[120px]">
                <input 
                  type="text" 
                  placeholder="Prize Amount (e.g. $10,000)"
                  value={tier.prize} 
                  onChange={(e) => updatePrizeTier(i, 'prize', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 dark:text-white font-semibold text-emerald-500 outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <button type="button" onClick={() => removePrizeTier(i)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {(!localGame.prizeBreakdown || localGame.prizeBreakdown.length === 0) && (
            <div className="text-xs text-gray-400 dark:text-zinc-500 italic py-1">No prize tiers or winning categories configured. Click "Add New Tier" to begin.</div>
          )}
        </div>
      </div>

      {editorSuccess && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold">
          {editorSuccess}
        </div>
      )}

      {editorError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-bold">
          {editorError}
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-zinc-800 mt-5">
        <div>
          {!confirmDelete ? (
            <button 
              type="button"
              onClick={() => setConfirmDelete(true)} 
              className="flex items-center gap-1.5 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-colors"
            >
              <Trash2 size={14} /> Delete Game
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-red-500 uppercase">Are you sure?</span>
              <button 
                type="button"
                onClick={() => deleteDynamicGame(game.name)} 
                className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600"
              >
                Yes, Delete
              </button>
              <button 
                type="button"
                onClick={() => setConfirmDelete(false)} 
                className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg text-xs font-bold hover:bg-gray-300"
              >
                No
              </button>
            </div>
          )}
        </div>
        <button 
          type="button"
          onClick={handleSave} 
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-all hover:scale-[1.01] shadow-md shadow-amber-500/20"
        >
          <Save size={14} /> Save Game Details
        </button>
      </div>
    </div>
  );
};
