import React, { useState } from 'react';
import { useAuth, MenuPage } from '../../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

export function AdminPagesTab() {
  const { menuPages, addMenuPage, updateMenuPage, deleteMenuPage } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim()) {
      setErrorMsg('Page Title cannot be empty.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await addMenuPage({
        menuTitle: newPageTitle,
        pageTitle: newPageTitle,
        pageSubtitle: 'How to play and win',
        content: 'Enter the rules text here...',
        isActive: true,
        order: (menuPages?.length || 0) + 1
      });
      setSuccessMsg(`Page "${newPageTitle}" created successfully! Scroll down to edit its content.`);
      setNewPageTitle('');
      setShowAddForm(false);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to add page. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
        <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">Custom Rules & Pages</h3>
        <button 
          type="button" 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setErrorMsg('');
          }} 
          className="flex items-center gap-1 text-xs font-bold text-amber-500 hover:underline"
        >
          <Plus size={14}/> {showAddForm ? 'Cancel' : 'Add Page'}
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-xs font-bold">
          {successMsg}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreatePage} className="p-4 border border-amber-500/30 rounded-xl bg-amber-500/5 space-y-3">
          <h4 className="text-xs font-black uppercase text-amber-500">Create New Custom Page</h4>
          <div>
            <label className="block text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase mb-1">Page Title / Menu Title</label>
            <input 
              type="text" 
              placeholder="e.g. Terms & Conditions, Rules, Support" 
              value={newPageTitle} 
              onChange={e => setNewPageTitle(e.target.value)} 
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-amber-500"
            />
          </div>
          {errorMsg && <p className="text-[10px] text-red-500 font-bold uppercase">{errorMsg}</p>}
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-xs font-bold">Create Page</button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 text-xs font-bold">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {menuPages?.map(page => (
          <PageEditor key={page.id} item={page} onUpdate={updateMenuPage} onDelete={deleteMenuPage} />
        ))}
        {menuPages?.length === 0 && <div className="text-center py-10 text-gray-500">No custom pages found.</div>}
      </div>
    </div>
  );
}

function PageEditor({ item, onUpdate, onDelete }: any) {
  const [local, setLocal] = useState<MenuPage>(item);

  React.useEffect(() => {
    setLocal(item);
  }, [item]);

  const handleSave = () => onUpdate(item.id, local);

  return (
    <div className="p-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-900/30 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Menu Title (e.g. Rules)" value={local.menuTitle} onChange={e => setLocal({...local, menuTitle: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        <input type="text" placeholder="Page Title (e.g. Terms & Conditions)" value={local.pageTitle} onChange={e => setLocal({...local, pageTitle: e.target.value})} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm" />
        <textarea placeholder="Page Content / Rules text" value={local.content} onChange={e => setLocal({...local, content: e.target.value})} rows={5} className="md:col-span-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm font-mono"></textarea>
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={local.isActive} onChange={e => setLocal({...local, isActive: e.target.checked})} className="rounded text-amber-500" />
          <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Published in Header</span>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => onDelete(item.id)} className="px-3 py-1 text-red-500 border border-red-200 dark:border-red-900/50 rounded hover:bg-red-50 text-xs font-bold">Delete</button>
          <button type="button" onClick={handleSave} className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 text-xs font-bold">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
