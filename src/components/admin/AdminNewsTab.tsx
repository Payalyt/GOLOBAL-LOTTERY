import React, { useState } from 'react';
import { useAuth, NewsArticle, Promotion } from '../../context/AuthContext';
import { Plus, Trash2, Edit } from 'lucide-react';

export function AdminNewsTab() {
  const { newsArticles, addNewsArticle, updateNewsArticle, deleteNewsArticle, promotions, addPromotion, updatePromotion, deletePromotion } = useAuth();
  
  const [activeSubTab, setActiveSubTab] = useState<'news' | 'promo'>('news');

  // News State
  const [showAddNewsForm, setShowAddNewsForm] = useState(false);
  const [newNewsTitle, setNewNewsTitle] = useState('');
  const [newNewsExcerpt, setNewNewsExcerpt] = useState('');
  const [newsError, setNewsError] = useState('');
  const [newsSuccess, setNewsSuccess] = useState('');

  // Promo State
  const [showAddPromoForm, setShowAddPromoForm] = useState(false);
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoExcerpt, setNewPromoExcerpt] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTitle.trim()) {
      setNewsError('News title is required.');
      return;
    }
    setNewsError('');
    setNewsSuccess('');
    try {
      await addNewsArticle({
        title: newNewsTitle,
        excerpt: newNewsExcerpt || 'Short description here',
        date: new Date().toISOString().split('T')[0],
        imageUrl: '',
        isActive: true,
        bannerBg: '#1e3c72'
      });
      setNewsSuccess('News article created successfully!');
      setNewNewsTitle('');
      setNewNewsExcerpt('');
      setShowAddNewsForm(false);
      setTimeout(() => setNewsSuccess(''), 5000);
    } catch (err: any) {
      console.error(err);
      setNewsError('Failed to add news article.');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoTitle.trim()) {
      setPromoError('Promotion title is required.');
      return;
    }
    setPromoError('');
    setPromoSuccess('');
    try {
      await addPromotion({
        title: newPromoTitle,
        date: new Date().toISOString().split('T')[0],
        excerpt: newPromoExcerpt || 'Promo details',
        buttonText: 'Claim Now',
        flyerTitle: 'BONUS',
        flyerAmount: '100%',
        flyerSub: 'DEPOSIT MATCH',
        flyerGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        accentColor: '#FFD700',
        targetLink: '/dashboard',
        isActive: true
      });
      setPromoSuccess('Promotion created successfully!');
      setNewPromoTitle('');
      setNewPromoExcerpt('');
      setShowAddPromoForm(false);
      setTimeout(() => setPromoSuccess(''), 5000);
    } catch (err: any) {
      console.error(err);
      setPromoError('Failed to add promotion.');
    }
  };

  return (
    <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
      <div className="flex gap-4 border-b border-gray-100 dark:border-zinc-800 pb-3">
        <button type="button" onClick={() => setActiveSubTab('news')} className={`text-sm font-black uppercase pb-2 ${activeSubTab === 'news' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500'}`}>News Articles</button>
        <button type="button" onClick={() => setActiveSubTab('promo')} className={`text-sm font-black uppercase pb-2 ${activeSubTab === 'promo' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500'}`}>Promotions</button>
      </div>

      {activeSubTab === 'news' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-gray-500">News Management</h4>
            <button 
              type="button" 
              onClick={() => {
                setShowAddNewsForm(!showAddNewsForm);
                setNewsError('');
              }} 
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold uppercase hover:bg-amber-600"
            >
              <Plus size={14}/> {showAddNewsForm ? 'Cancel' : 'Add News'}
            </button>
          </div>

          {newsSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold">
              {newsSuccess}
            </div>
          )}

          {showAddNewsForm && (
            <form onSubmit={handleCreateNews} className="p-4 border border-amber-500/30 rounded-xl bg-amber-500/5 space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-500">Create New News Article</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">News Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Draw results for Mega Millions" 
                    value={newNewsTitle} 
                    onChange={e => setNewNewsTitle(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Short Excerpt / Intro</label>
                  <textarea 
                    placeholder="e.g. A quick summary of the article..." 
                    value={newNewsExcerpt} 
                    onChange={e => setNewNewsExcerpt(e.target.value)} 
                    rows={2}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              {newsError && <p className="text-[10px] text-red-500 font-bold uppercase">{newsError}</p>}
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-bold">Create Article</button>
                <button type="button" onClick={() => setShowAddNewsForm(false)} className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {newsArticles?.map(news => (
              <NewsEditor key={news.id} item={news} onUpdate={updateNewsArticle} onDelete={deleteNewsArticle} />
            ))}
            {newsArticles?.length === 0 && <div className="text-center py-10 text-gray-500">No news articles found.</div>}
          </div>
        </div>
      )}

      {activeSubTab === 'promo' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black uppercase text-gray-500">Promotions Management</h4>
            <button 
              type="button" 
              onClick={() => {
                setShowAddPromoForm(!showAddPromoForm);
                setPromoError('');
              }} 
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold uppercase hover:bg-amber-600"
            >
              <Plus size={14}/> {showAddPromoForm ? 'Cancel' : 'Add Promotion'}
            </button>
          </div>

          {promoSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold">
              {promoSuccess}
            </div>
          )}

          {showAddPromoForm && (
            <form onSubmit={handleCreatePromo} className="p-4 border border-amber-500/30 rounded-xl bg-amber-500/5 space-y-3">
              <h4 className="text-xs font-black uppercase text-amber-500">Create New Promotion</h4>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Promotion Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Mega Deposit 100% Match Bonus" 
                    value={newPromoTitle} 
                    onChange={e => setNewPromoTitle(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Short Excerpt / Terms</label>
                  <textarea 
                    placeholder="e.g. Get up to $100 matching bonus on your first deposit..." 
                    value={newPromoExcerpt} 
                    onChange={e => setNewPromoExcerpt(e.target.value)} 
                    rows={2}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              {promoError && <p className="text-[10px] text-red-500 font-bold uppercase">{promoError}</p>}
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-bold">Create Promotion</button>
                <button type="button" onClick={() => setShowAddPromoForm(false)} className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {promotions?.map(promo => (
              <PromoEditor key={promo.id} item={promo} onUpdate={updatePromotion} onDelete={deletePromotion} />
            ))}
            {promotions?.length === 0 && <div className="text-center py-10 text-gray-500">No promotions found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function NewsEditor({ item, onUpdate, onDelete }: any) {
  const [local, setLocal] = useState<NewsArticle>({
    bgType: 'image',
    ...item
  });

  React.useEffect(() => {
    setLocal(prev => ({ ...prev, ...item }));
  }, [item]);

  const handleSave = () => onUpdate(item.id, local);

  return (
    <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Title</label>
          <input type="text" placeholder="Title" value={local.title} onChange={e => setLocal({...local, title: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Publish Date</label>
          <input type="date" value={local.date} onChange={e => setLocal({...local, date: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Excerpt / Contents</label>
          <textarea rows={3} placeholder="Excerpt" value={local.excerpt} onChange={e => setLocal({...local, excerpt: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2 p-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-amber-500">News Background style</label>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'image', label: 'Image URL' },
              { value: 'color', label: 'Solid Color' },
              { value: 'gradient', label: 'Gradient' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLocal(prev => ({ ...prev, bgType: opt.value as any }))}
                className={`py-2 px-3 border rounded-lg text-xs font-bold uppercase transition-all ${
                  local.bgType === opt.value
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {local.bgType === 'image' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Custom Image URL</label>
              <input type="text" placeholder="https://images.unsplash.com/photo-..." value={local.imageUrl} onChange={e => setLocal({...local, imageUrl: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}

          {local.bgType === 'color' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Solid Color HEX</label>
                <input type="text" placeholder="e.g. #1E1B4B" value={local.bannerBg || ''} onChange={e => setLocal({...local, bannerBg: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2 items-center">
                <input type="color" value={local.bannerBg && local.bannerBg.startsWith('#') ? local.bannerBg : '#1E1B4B'} onChange={e => setLocal({...local, bannerBg: e.target.value})} className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent" />
                <span className="text-xs font-bold text-gray-400 uppercase">Select Color</span>
              </div>
            </div>
          )}

          {local.bgType === 'gradient' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Gradient CSS Rule</label>
                <input type="text" placeholder="e.g. linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" value={local.bannerBg || ''} onChange={e => setLocal({...local, bannerBg: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Preset Gradients</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)',
                    'linear-gradient(135deg, #A3E635 0%, #4D7C0F 100%)',
                    'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
                    'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    'linear-gradient(135deg, #EC4899 0%, #9D174D 100%)',
                    'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
                    'linear-gradient(135deg, #F59E0B 0%, #92400E 100%)',
                    'linear-gradient(135deg, #F97316 0%, #9A3412 100%)',
                  ].map(css => (
                    <button
                      key={css}
                      type="button"
                      onClick={() => setLocal({...local, bannerBg: css})}
                      className="w-10 h-10 rounded-lg border-2 border-transparent hover:scale-105 transition-transform"
                      style={{ background: css }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={local.isActive} onChange={e => setLocal({...local, isActive: e.target.checked})} className="rounded text-amber-500" />
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Published</span>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onDelete(item.id)} className="px-3.5 py-2 text-red-500 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 text-xs font-bold">Delete</button>
          <button type="button" onClick={handleSave} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function PromoEditor({ item, onUpdate, onDelete }: any) {
  const [local, setLocal] = useState<Promotion>({
    bgType: 'gradient',
    ...item
  });

  React.useEffect(() => {
    setLocal(prev => ({ ...prev, ...item }));
  }, [item]);

  const handleSave = () => onUpdate(item.id, local);

  return (
    <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Promo Title</label>
          <input type="text" placeholder="Promo Title" value={local.title} onChange={e => setLocal({...local, title: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Flyer Amount (e.g. 100%)</label>
          <input type="text" placeholder="Flyer Amount (e.g. 100%)" value={local.flyerAmount} onChange={e => setLocal({...local, flyerAmount: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Excerpt / Condition (e.g. Deposit $500 get $500)</label>
          <textarea rows={3} placeholder="Excerpt / Condition (e.g. Deposit $500 get $500)" value={local.excerpt} onChange={e => setLocal({...local, excerpt: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Target Link (e.g. /dashboard)</label>
          <input type="text" placeholder="Target Link (e.g. /dashboard)" value={local.targetLink} onChange={e => setLocal({...local, targetLink: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Flyer Category / Extra info</label>
          <input type="text" placeholder="Flyer Category" value={local.flyerExtra || ''} onChange={e => setLocal({...local, flyerExtra: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        </div>

        <div className="md:col-span-2 p-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-3">
          <label className="block text-xs font-black uppercase tracking-wider text-amber-500">Promotion Background Style</label>
          
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'gradient', label: 'Gradient' },
              { value: 'color', label: 'Solid Color' },
              { value: 'image', label: 'Image URL' }
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLocal(prev => ({ ...prev, bgType: opt.value as any }))}
                className={`py-2 px-3 border rounded-lg text-xs font-bold uppercase transition-all ${
                  local.bgType === opt.value
                    ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm'
                    : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-500'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {local.bgType === 'gradient' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Gradient CSS Rule</label>
                <input type="text" placeholder="e.g. linear-gradient(135deg, #1e3c72, #2a5298)" value={local.bgGradient || local.flyerGradient || ''} onChange={e => setLocal({...local, bgGradient: e.target.value, flyerGradient: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Preset Gradients</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'linear-gradient(135deg, #E11D48 0%, #9F1239 100%)',
                    'linear-gradient(135deg, #A3E635 0%, #4D7C0F 100%)',
                    'linear-gradient(135deg, #059669 0%, #064e3b 100%)',
                    'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    'linear-gradient(135deg, #EC4899 0%, #9D174D 100%)',
                    'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)',
                    'linear-gradient(135deg, #F59E0B 0%, #92400E 100%)',
                    'linear-gradient(135deg, #F97316 0%, #9A3412 100%)',
                  ].map(css => (
                    <button
                      key={css}
                      type="button"
                      onClick={() => setLocal({...local, bgGradient: css, flyerGradient: css})}
                      className="w-10 h-10 rounded-lg border-2 border-transparent hover:scale-105 transition-transform"
                      style={{ background: css }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {local.bgType === 'color' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Solid Color HEX</label>
                <input type="text" placeholder="e.g. #1e3c72" value={local.bgSolid || ''} onChange={e => setLocal({...local, bgSolid: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono" />
              </div>
              <div className="flex gap-2 items-center">
                <input type="color" value={local.bgSolid && local.bgSolid.startsWith('#') ? local.bgSolid : '#1e3c72'} onChange={e => setLocal({...local, bgSolid: e.target.value})} className="w-10 h-10 border-0 rounded cursor-pointer bg-transparent" />
                <span className="text-xs font-bold text-gray-400 uppercase">Select Color</span>
              </div>
            </div>
          )}

          {local.bgType === 'image' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Background Image URL</label>
              <input type="text" placeholder="https://images.unsplash.com/photo-..." value={local.bgImage || ''} onChange={e => setLocal({...local, bgImage: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={local.isActive} onChange={e => setLocal({...local, isActive: e.target.checked})} className="rounded text-amber-500" />
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Published</span>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onDelete(item.id)} className="px-3.5 py-2 text-red-500 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 text-xs font-bold">Delete</button>
          <button type="button" onClick={handleSave} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
