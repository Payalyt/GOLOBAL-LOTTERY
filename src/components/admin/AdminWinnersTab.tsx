import React, { useState } from 'react';
import { useAuth, SiteThemeConfig } from '../../context/AuthContext';
import { Plus, Trash2, Save, Video, Trophy, Star } from 'lucide-react';

export function AdminWinnersTab() {
  const { siteConfig, updateSiteConfig, raffleWinners, addRaffleWinner, deleteRaffleWinner, updateRaffleWinner } = useAuth();
  const [configForm, setConfigForm] = useState<Partial<SiteThemeConfig>>(siteConfig || {});
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'grand' | 'live'>('grand');

  const handleSave = async () => {
    setIsSaving(true);
    await updateSiteConfig(configForm);
    setIsSaving(false);
    alert('Winners config saved!');
  };

  const handleAddLiveWinner = async () => {
    const name = prompt('Enter Winner Name:');
    if (!name) return;
    try {
      await addRaffleWinner({
        name,
        prizeText: '$1,000',
        game: 'EASY6',
        date: new Date().toISOString().split('T')[0],
        ticket: '#000000',
        country: 'Bangladesh',
        avatarBg: 'bg-emerald-500'
      });
      alert('Winner added! Scroll down to edit details.');
    } catch (err) {
      console.error(err);
      alert('Failed to add winner.');
    }
  };

  // Grand Prize Winners
  const addGrandPrizeWinner = () => {
    const current = configForm.grandPrizeWinners || [];
    setConfigForm({ ...configForm, grandPrizeWinners: [...current, { id: Date.now().toString(), name: 'New Winner', prize: '$1,000,000', imageUrl: '', isActive: true }] });
  };
  const updateGrandPrizeWinner = (index: number, field: string, value: any) => {
    const current = [...(configForm.grandPrizeWinners || [])];
    current[index] = { ...current[index], [field]: value };
    setConfigForm({ ...configForm, grandPrizeWinners: current });
  };
  const removeGrandPrizeWinner = (index: number) => {
    const current = [...(configForm.grandPrizeWinners || [])];
    current.splice(index, 1);
    setConfigForm({ ...configForm, grandPrizeWinners: current });
  };

  // Video Winners
  const addVideoWinner = () => {
    const current = configForm.videoWinners || [];
    setConfigForm({ ...configForm, videoWinners: [...current, { id: Date.now().toString(), name: 'New Winner', title: 'Life Changed', prizeText: '$100,000', date: '2024-05-01' }] });
  };
  const updateVideoWinner = (index: number, field: string, value: any) => {
    const current = [...(configForm.videoWinners || [])];
    current[index] = { ...current[index], [field]: value };
    setConfigForm({ ...configForm, videoWinners: current });
  };
  const removeVideoWinner = (index: number) => {
    const current = [...(configForm.videoWinners || [])];
    current.splice(index, 1);
    setConfigForm({ ...configForm, videoWinners: current });
  };

  return (
    <div className="space-y-6">
      
      <div className="flex gap-4 border-b border-gray-100 dark:border-zinc-800 pb-3">
        <button type="button" onClick={() => setActiveSubTab('grand')} className={`text-sm font-black uppercase pb-2 ${activeSubTab === 'grand' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500'}`}>Grand & Video Winners</button>
        <button type="button" onClick={() => setActiveSubTab('live')} className={`text-sm font-black uppercase pb-2 ${activeSubTab === 'live' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500'}`}>Daily Sure Raffle & Live Game Winners</button>
      </div>

      {activeSubTab === 'grand' && (
        <>
          {/* Grand Prize Hall */}
          <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" /> Grand Prize Hall
              </h3>
              <button type="button" onClick={addGrandPrizeWinner} className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Winner
              </button>
            </div>
            <div className="grid gap-4">
              {configForm.grandPrizeWinners?.map((w, i) => (
                <div key={w.id} className="p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/30 flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <input type="text" placeholder="Winner Name" value={w.name} onChange={(e) => updateGrandPrizeWinner(i, 'name', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                    <input type="text" placeholder="Prize (e.g. $1,000,000)" value={w.prize} onChange={(e) => updateGrandPrizeWinner(i, 'prize', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                    <input type="text" placeholder="Image URL (optional)" value={w.imageUrl} onChange={(e) => updateGrandPrizeWinner(i, 'imageUrl', e.target.value)} className="w-full md:col-span-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <button type="button" onClick={() => removeGrandPrizeWinner(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={20}/></button>
                </div>
              ))}
              {(!configForm.grandPrizeWinners || configForm.grandPrizeWinners.length === 0) && (
                <div className="text-sm text-gray-500 italic py-4 text-center">No grand prize winners added.</div>
              )}
            </div>
          </div>

          {/* Video Stories */}
          <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Video size={16} className="text-amber-500" /> Video Stories
              </h3>
              <button type="button" onClick={addVideoWinner} className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add Video Story
              </button>
            </div>
            <div className="grid gap-4">
              {configForm.videoWinners?.map((v, i) => (
                <div key={v.id} className="p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/30 flex flex-col md:flex-row gap-4 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Video Title</label>
                      <input type="text" placeholder="Title" value={v.title} onChange={(e) => updateVideoWinner(i, 'title', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">YouTube Link or ID</label>
                      <input type="text" placeholder="https://youtube.com/..." value={v.youtubeId} onChange={(e) => updateVideoWinner(i, 'youtubeId', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Winner Name</label>
                      <input type="text" placeholder="Name" value={v.name} onChange={(e) => updateVideoWinner(i, 'name', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Prize Amount</label>
                      <input type="text" placeholder="e.g. $100,000" value={v.prizeText} onChange={(e) => updateVideoWinner(i, 'prizeText', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Date</label>
                      <input type="date" value={v.date} onChange={(e) => updateVideoWinner(i, 'date', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase">Custom Thumbnail (Optional)</label>
                      <input type="text" placeholder="Image URL" value={v.thumbnailUrl || ''} onChange={(e) => updateVideoWinner(i, 'thumbnailUrl', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeVideoWinner(i)} className="p-2 mt-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={20}/></button>
                </div>
              ))}
              {(!configForm.videoWinners || configForm.videoWinners.length === 0) && (
                <div className="text-sm text-gray-500 italic py-4 text-center">No video stories added.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:bg-amber-600">
              {isSaving ? 'Saving...' : 'Save Winner Settings'}
            </button>
          </div>
        </>
      )}

      {activeSubTab === 'live' && (
        <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
            <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Star size={16} className="text-amber-500" /> Daily Sure Raffle & Live Game Winners
            </h3>
            <button type="button" onClick={handleAddLiveWinner} className="text-xs font-bold text-amber-500 flex items-center gap-1 hover:underline">
              <Plus size={14} /> Add Live Winner
            </button>
          </div>
          <div className="grid gap-4">
            {raffleWinners?.map((w: any, i: number) => (
              <div key={w.id || i} className="p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/30 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  <input type="text" placeholder="Winner Name" value={w.name} onChange={(e) => updateRaffleWinner(w.id, { name: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" placeholder="Game (e.g. EASY6, MEGA7)" value={w.game} onChange={(e) => updateRaffleWinner(w.id, { game: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" placeholder="Prize (e.g. $1,000)" value={w.prizeText} onChange={(e) => updateRaffleWinner(w.id, { prizeText: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" placeholder="Ticket No." value={w.ticket} onChange={(e) => updateRaffleWinner(w.id, { ticket: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" placeholder="Country" value={w.country} onChange={(e) => updateRaffleWinner(w.id, { country: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                  <input type="date" value={w.date} onChange={(e) => updateRaffleWinner(w.id, { date: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" placeholder="Image URL (optional)" value={w.imageUrl || ''} onChange={(e) => updateRaffleWinner(w.id, { imageUrl: e.target.value })} className="w-full md:col-span-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
                </div>
                <button type="button" onClick={() => deleteRaffleWinner(w.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"><Trash2 size={20}/></button>
              </div>
            ))}
            {(!raffleWinners || raffleWinners.length === 0) && (
              <div className="text-sm text-gray-500 italic py-4 text-center">No live winners added.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
