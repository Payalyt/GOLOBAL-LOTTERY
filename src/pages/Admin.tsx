import React, { useState, useEffect } from 'react';
import { useAuth, SiteThemeConfig } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminGamesTab } from '../components/admin/AdminGamesTab';
import { AdminWinnersTab } from '../components/admin/AdminWinnersTab';
import { AdminNewsTab } from '../components/admin/AdminNewsTab';
import { AdminPagesTab } from '../components/admin/AdminPagesTab';

import { Menu, X, Settings, Image as ImageIcon, Type, CreditCard, Paintbrush, Users, FileText, Trophy, Award, Gamepad2, Newspaper, Megaphone } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function Admin() {
  const { 
    user, 
    siteConfig, 
    updateSiteConfig, 
    theme, 
    allUsers, 
    dynamicGames, 
    updateDynamicGame, 
    triggerDraw, 
    newsArticles, 
    addNewsArticle, 
    updateNewsArticle, 
    deleteNewsArticle, 
    promotions, 
    addPromotion, 
    updatePromotion, 
    deletePromotion, 
    menuPages, 
    addMenuPage, 
    updateMenuPage, 
    deleteMenuPage,
    depositRequests,
    updateDepositStatus,
    withdrawalRequests,
    updateWithdrawalStatus,
    updateUserProfileFields
  } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('General');
  
  const [configForm, setConfigForm] = useState<Partial<SiteThemeConfig>>(siteConfig || {});

  useEffect(() => {
    if (siteConfig && Object.keys(siteConfig).length > 0) {
      setConfigForm(prev => {
        if (!prev || Object.keys(prev).length === 0) {
          return siteConfig;
        }
        return { ...siteConfig, ...prev };
      });
    }
  }, [siteConfig]);
  
  // Custom states for user list editing & searching
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<any | null>(null);
  const [userEditForm, setUserEditForm] = useState<any>({});
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Custom inline alerts and confirmations to bypass blocked confirm()/alert() in sandbox iframe
  const [adminAlert, setAdminAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showAdminAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setAdminAlert({ message, type });
    setTimeout(() => {
      setAdminAlert(null);
    }, 4500);
  };

  const [confirmDepositAction, setConfirmDepositAction] = useState<{ id: string; type: 'Approved' | 'Rejected' | 'Delete' } | null>(null);
  const [confirmWithdrawalAction, setConfirmWithdrawalAction] = useState<{ id: string; type: 'Approved' | 'Rejected' | 'Delete' } | null>(null);
  
  // Deposit Search, Filter, and Edit States
  const [depositFilter, setDepositFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [depositSearch, setDepositSearch] = useState('');
  const [editingDepositId, setEditingDepositId] = useState<string | null>(null);
  const [depositEditForm, setDepositEditForm] = useState({
    email: '',
    amount: 0,
    gateway: '',
    transactionId: '',
    details: '',
    status: 'Pending' as 'Pending' | 'Approved' | 'Rejected'
  });
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [newDepositForm, setNewDepositForm] = useState({
    email: '',
    amount: 0,
    gateway: 'bKash',
    transactionId: '',
    details: ''
  });

  // Withdrawal Search, Filter, and Edit States
  const [withdrawalFilter, setWithdrawalFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [withdrawalSearch, setWithdrawalSearch] = useState('');
  const [editingWithdrawalId, setEditingWithdrawalId] = useState<string | null>(null);
  const [withdrawalEditForm, setWithdrawalEditForm] = useState({
    email: '',
    amount: 0,
    bankName: '',
    iban: '',
    accountName: '',
    sourceWallet: 'main' as 'main' | 'winnings',
    status: 'Pending' as 'Pending' | 'Approved' | 'Rejected'
  });
  const [showAddWithdrawalModal, setShowAddWithdrawalModal] = useState(false);
  const [newWithdrawalForm, setNewWithdrawalForm] = useState({
    email: '',
    amount: 0,
    bankName: 'bKash',
    iban: '',
    accountName: '',
    sourceWallet: 'main' as 'main' | 'winnings'
  });
  
  // Manual Draw results admin states
  const [newDraw, setNewDraw] = useState({
    gameName: 'MEGA7',
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    numbersStr: '',
    totalWinners: '1,200 Players',
    totalPaid: '$45,000.00',
    country: 'Bangladesh'
  });
  const [editingDrawId, setEditingDrawId] = useState<string | null>(null);
  const [editingDrawForm, setEditingDrawForm] = useState({
    gameName: '',
    date: '',
    numbersStr: '',
    totalWinners: '',
    totalPaid: '',
    country: ''
  });

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-bold">Loading Admin...</div>;
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest text-red-500 mb-2">Access Denied</h2>
          <p className="text-gray-500 font-medium">You do not have administrative privileges.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setConfigForm(prev => ({ ...prev, [name]: val }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteConfig(configForm);
      showAdminAlert('Settings updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving config', err);
      showAdminAlert('Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'Games', icon: Trophy, label: 'Games & Prizes' },
    { id: 'Deposits', icon: CreditCard, label: 'Deposits' },
    { id: 'Withdrawals', icon: CreditCard, label: 'Withdrawals' },
    { id: 'News', icon: FileText, label: 'News & Promos' },
    { id: 'Winners', icon: Award, label: 'Global Winners' },
    { id: 'Pages', icon: FileText, label: 'Pages & Rules' },
    { id: 'General', icon: Settings, label: 'General Settings' },
    { id: 'Text', icon: Type, label: 'Text & Content' },
    { id: 'Media', icon: ImageIcon, label: 'Logos & Banners' },
    { id: 'Payment', icon: CreditCard, label: 'Payment Gateways' },
    { id: 'Design', icon: Paintbrush, label: 'Colors & Theme' },
    { id: 'Contact', icon: FileText, label: 'Contact Settings' },
    { id: 'Users', icon: Users, label: 'User List' },
    { id: 'Draws', icon: Trophy, label: 'Game Draws' }
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-[#0f141f] text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#151c2a] border-r border-gray-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-zinc-800">
            <h1 className="text-lg font-black uppercase tracking-widest text-amber-500">Admin Panel</h1>
            <button onClick={() => setSidebarOpen(false)} className="p-2 lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-amber-500 text-white shadow-md' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
            <button onClick={() => navigate('/')} className="w-full py-2.5 px-4 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl text-sm font-bold hover:brightness-95 transition-all text-center">
              Exit Admin
            </button>
          </div>
        </div>
      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <header className="h-16 bg-white dark:bg-[#151c2a] border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-black uppercase tracking-wider text-gray-800 dark:text-gray-200 hidden sm:block">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all ${isSaving ? 'opacity-70' : 'hover:bg-amber-600'}`}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {adminAlert && (
              <div 
                className={`p-4 rounded-2xl font-bold border flex items-center justify-between text-xs uppercase tracking-widest shadow-md transition-all duration-300 animate-pulse ${
                  adminAlert.type === 'success' 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500' 
                    : 'bg-red-500/15 border-red-500/30 text-red-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{adminAlert.type === 'success' ? '✅' : '❌'}</span>
                  <span>{adminAlert.message}</span>
                </div>
                <button onClick={() => setAdminAlert(null)} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg text-sm leading-none">✕</button>
              </div>
            )}

            {activeTab === 'General' && (
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">General Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Minimum Withdrawal Limit ($)</label>
                    <input
                      type="number"
                      name="minWithdrawalAmount"
                      value={configForm.minWithdrawalAmount !== undefined ? configForm.minWithdrawalAmount : 10}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, minWithdrawalAmount: Number(e.target.value) }))}
                      className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                      placeholder="10"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Minimum amount in USDT/USD a user can request for withdrawal.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Government Commission Fee Rate (%)</label>
                    <input
                      type="number"
                      name="governmentFeePct"
                      value={configForm.governmentFeePct !== undefined ? configForm.governmentFeePct : 10}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, governmentFeePct: Number(e.target.value) }))}
                      className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                      placeholder="10"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Fee percentage deducted from Commission Balance when withdrawing.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Show 3-Line Mobile Menu</label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" name="slideMenuEnabled" checked={configForm.slideMenuEnabled !== false} onChange={handleChange} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${configForm.slideMenuEnabled !== false ? "bg-amber-500" : "bg-gray-300 dark:bg-zinc-700"}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${configForm.slideMenuEnabled !== false ? "transform translate-x-4" : ""}`}></div>
                    </div>
                    <span className="ml-3 text-sm font-bold text-gray-700 dark:text-gray-300">{configForm.slideMenuEnabled !== false ? "Enabled" : "Disabled"}</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'Design' && (
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Theme Colors & Design</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Primary Hex Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" name="primaryHex" value={configForm.primaryHex || '#FF003C'} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                      <input type="text" name="primaryHex" value={configForm.primaryHex || '#FF003C'} onChange={handleChange} className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Background Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" name="customBgColor" value={configForm.customBgColor || '#121D3D'} onChange={handleChange} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                      <input type="text" name="customBgColor" value={configForm.customBgColor || '#121D3D'} onChange={handleChange} className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Text' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Hero Section Text</h3>
                  <div className="grid gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Hero Headline</label>
                      <input type="text" name="heroHeadline" value={configForm.heroHeadline || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Hero Jackpot Amount</label>
                      <input type="text" name="heroJackpotAmount" value={configForm.heroJackpotAmount || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <h3 className="text-sm font-black uppercase text-[#12A098] mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">AI Lucky Number Banner Content</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Headline (English)</label>
                      <input type="text" name="unlockHeadlineEn" value={configForm.unlockHeadlineEn || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Headline (Bengali)</label>
                      <input type="text" name="unlockHeadlineBn" value={configForm.unlockHeadlineBn || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Subtitle (English)</label>
                      <input type="text" name="unlockSubEn" value={configForm.unlockSubEn || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Subtitle (Bengali)</label>
                      <input type="text" name="unlockSubBn" value={configForm.unlockSubBn || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">AI Benefits Checklist (English, split by commas)</label>
                      <input type="text" name="unlockPerksEn" value={configForm.unlockPerksEn || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" placeholder="e.g. Multi-draw analysis, High-probability hotspots, Custom ML predictions" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">AI Benefits Checklist (Bengali, split by commas)</label>
                      <input type="text" name="unlockPerksBn" value={configForm.unlockPerksBn || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" placeholder="e.g. Multi-draw analysis, High-probability hotspots, Custom ML predictions" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <h3 className="text-sm font-black uppercase text-amber-500 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Total Metrics Values</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Registered Participants</label>
                      <input type="text" name="totalMetricRegisteredUsers" placeholder="e.g. 119,230,692" value={configForm.totalMetricRegisteredUsers || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Tickets Sold & Drawn</label>
                      <input type="text" name="totalMetricTicketsPurchased" placeholder="e.g. 105,485,912" value={configForm.totalMetricTicketsPurchased || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <h3 className="text-sm font-black uppercase text-amber-500 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Footer Custom Texts</h3>
                  <div className="grid grid-cols-1 gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Footer Description (English)</label>
                        <textarea name="footerDescEn" value={configForm.footerDescEn || ''} onChange={handleChange} rows={3} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Footer Description (Bengali)</label>
                        <textarea name="footerDescBn" value={configForm.footerDescBn || ''} onChange={handleChange} rows={3} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Copyright (English)</label>
                        <input type="text" name="footerCopyrightEn" value={configForm.footerCopyrightEn || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Copyright (Bengali)</label>
                        <input type="text" name="footerCopyrightBn" value={configForm.footerCopyrightBn || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Compliance Notice / Sub-desc (English)</label>
                        <textarea name="footerSubDescEn" value={configForm.footerSubDescEn || ''} onChange={handleChange} rows={2} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Compliance Notice / Sub-desc (Bengali)</label>
                        <textarea name="footerSubDescBn" value={configForm.footerSubDescBn || ''} onChange={handleChange} rows={2} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Media' && (
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Logo URLs</h3>
                <div className="grid gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Main Logo URL</label>
                    <input type="text" name="logoUrl" value={configForm.logoUrl || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Payment' && (
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">Payment Gateways</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Manage unlimited custom payment channels (bKash, Nagad, Rocket, Upay, USDT, local banks, etc.)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentGws = configForm.paymentGateways || siteConfig.paymentGateways || [];
                      const newGw = {
                        id: `pg-${Date.now()}`,
                        name: 'New Gateway',
                        numberOrAddress: '',
                        instructions: 'Instructions on how to pay or withdraw using this gateway.',
                        enabled: true,
                        type: 'both' as 'deposit' | 'withdrawal' | 'both',
                        minAmount: 10,
                        maxAmount: 10000
                      };
                      setConfigForm(prev => ({
                        ...prev,
                        paymentGateways: [...currentGws, newGw]
                      }));
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all self-start sm:self-auto"
                  >
                    + Add Custom Gateway
                  </button>
                </div>

                <div className="space-y-6">
                  {((configForm.paymentGateways || siteConfig.paymentGateways || []) as any[]).map((gw, index) => (
                    <div key={gw.id || index} className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl space-y-4 bg-gray-50/50 dark:bg-zinc-900/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={gw.name}
                            onChange={(e) => {
                              const list = [...(configForm.paymentGateways || siteConfig.paymentGateways || [])];
                              list[index] = { ...list[index], name: e.target.value };
                              setConfigForm(prev => ({ ...prev, paymentGateways: list }));
                            }}
                            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white"
                            placeholder="Gateway Name"
                          />
                          <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-extrabold px-2 py-0.5 rounded uppercase">
                            {gw.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center cursor-pointer">
                            <span className="text-xs font-bold text-gray-500 mr-2">{gw.enabled ? 'Enabled' : 'Disabled'}</span>
                            <div className="relative">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={gw.enabled}
                                onChange={(e) => {
                                  const list = [...(configForm.paymentGateways || siteConfig.paymentGateways || [])];
                                  list[index] = { ...list[index], enabled: e.target.checked };
                                  setConfigForm(prev => ({ ...prev, paymentGateways: list }));
                                }}
                              />
                              <div className={`block w-10 h-6 rounded-full transition-colors ${gw.enabled ? 'bg-amber-500' : 'bg-gray-300 dark:bg-zinc-700'}`}></div>
                              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${gw.enabled ? 'transform translate-x-4' : ''}`}></div>
                            </div>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...(configForm.paymentGateways || siteConfig.paymentGateways || [])];
                              list.splice(index, 1);
                              setConfigForm(prev => ({ ...prev, paymentGateways: list }));
                            }}
                            className="text-red-500 hover:text-red-600 text-xs font-bold px-2 py-1 bg-red-50 dark:bg-red-950/20 rounded border border-red-100 dark:border-red-950/50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
                            Wallet Number / Address / Account Info
                          </label>
                          <input
                            type="text"
                            value={gw.numberOrAddress}
                            onChange={(e) => {
                              const list = [...(configForm.paymentGateways || siteConfig.paymentGateways || [])];
                              list[index] = { ...list[index], numberOrAddress: e.target.value };
                              setConfigForm(prev => ({ ...prev, paymentGateways: list }));
                            }}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none font-mono"
                            placeholder="e.g. +8801700000000 or USDT Address"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
                            Gateway Type / Channel Scope
                          </label>
                          <select
                            value={gw.type}
                            onChange={(e) => {
                              const list = [...(configForm.paymentGateways || siteConfig.paymentGateways || [])];
                              list[index] = { ...list[index], type: e.target.value as any };
                              setConfigForm(prev => ({ ...prev, paymentGateways: list }));
                            }}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none"
                          >
                            <option value="both">Both Deposit & Withdrawal</option>
                            <option value="deposit">Deposit Only</option>
                            <option value="withdrawal">Withdrawal Only</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
                            Min Transaction Limit ($)
                          </label>
                          <input
                            type="number"
                            value={gw.minAmount || ''}
                            onChange={(e) => {
                              const list = [...(configForm.paymentGateways || siteConfig.paymentGateways || [])];
                              list[index] = { ...list[index], minAmount: Number(e.target.value) };
                              setConfigForm(prev => ({ ...prev, paymentGateways: list }));
                            }}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none"
                            placeholder="10"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
                            Max Transaction Limit ($)
                          </label>
                          <input
                            type="number"
                            value={gw.maxAmount || ''}
                            onChange={(e) => {
                              const list = [...(configForm.paymentGateways || siteConfig.paymentGateways || [])];
                              list[index] = { ...list[index], maxAmount: Number(e.target.value) };
                              setConfigForm(prev => ({ ...prev, paymentGateways: list }));
                            }}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none"
                            placeholder="10000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1">
                          Payment Instructions (Shown to Users)
                        </label>
                        <textarea
                          value={gw.instructions}
                          onChange={(e) => {
                            const list = [...(configForm.paymentGateways || siteConfig.paymentGateways || [])];
                            list[index] = { ...list[index], instructions: e.target.value };
                            setConfigForm(prev => ({ ...prev, paymentGateways: list }));
                          }}
                          rows={2}
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none"
                          placeholder="Provide detailed instructions for cash-out, send money, or bank transfer..."
                        />
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {((configForm.paymentGateways || siteConfig.paymentGateways || []) as any[]).length === 0 && (
                    <div className="text-center py-10 text-gray-500 italic text-xs">
                      No payment gateways configured yet. Click "+ Add Custom Gateway" to add one!
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-150 dark:border-zinc-800">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10"
                  >
                    {isSaving ? 'Saving...' : 'Save All Gateways'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'Contact' && (
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Contact & Social Links</h3>
                <div className="grid gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Agent WhatsApp Link</label>
                    <input type="text" name="agentWhatsappLink" value={configForm.agentWhatsappLink || ""} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Agent Telegram Link</label>
                    <input type="text" name="agentTelegramLink" value={configForm.agentTelegramLink || ""} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Agent IMO Link</label>
                    <input type="text" name="agentImoLink" value={configForm.agentImoLink || ""} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Footer Phone / WhatsApp</label>
                    <input type="text" name="footerWhatsapp" value={configForm.footerWhatsapp || ""} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Users' && (
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-3">
                  <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">Registered Users ({allUsers?.length || 0})</h3>
                  
                  {/* Search input field */}
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search name, email, or phone..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold outline-none focus:border-amber-500 transition-all text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-500 dark:text-zinc-400">
                    <thead className="bg-gray-50 dark:bg-zinc-900/50 text-xs uppercase font-bold text-gray-700 dark:text-zinc-300">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Country</th>
                        <th className="px-4 py-3">Balances</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(allUsers || [])
                        .filter(u => 
                          !userSearchQuery ||
                          u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                          u.phone?.toLowerCase().includes(userSearchQuery.toLowerCase())
                        )
                        .map((u, i) => (
                          <tr key={i} className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50/55 dark:hover:bg-zinc-900/20 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                              <div className="font-extrabold">{u.name}</div>
                              <span className="text-[9px] text-gray-400 block uppercase font-mono">{u.uid?.substring(0, 8)}</span>
                            </td>
                            <td className="px-4 py-3 text-xs font-semibold">{u.email}</td>
                            <td className="px-4 py-3 text-xs font-semibold">{u.phone || 'N/A'}</td>
                            <td className="px-4 py-3 text-xs font-semibold">{u.country || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <div className="text-[10px] space-y-0.5">
                                <p><span className="text-zinc-400">Main:</span> <span className="font-bold text-zinc-800 dark:text-zinc-200">${(u.balance || 0).toFixed(2)}</span></p>
                                <p><span className="text-zinc-400">Wins:</span> <span className="font-bold text-emerald-600 dark:text-emerald-400">${(u.winningsBalance || 0).toFixed(2)}</span></p>
                                <p><span className="text-zinc-400">Comm:</span> <span className="font-bold text-blue-600 dark:text-blue-400">${(u.commissionBalance || 0).toFixed(2)}</span></p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                u.role === 'admin' 
                                  ? 'bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400' 
                                  : 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setSelectedUserToEdit(u);
                                  setUserEditForm({ ...u });
                                }}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                      {(allUsers || []).filter(u => 
                        !userSearchQuery ||
                        u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        u.phone?.toLowerCase().includes(userSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-xs text-gray-400 italic">
                            No users found matching "{userSearchQuery}"
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Edit User Modal Dialog Overlay */}
                {selectedUserToEdit && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-3xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-[#151c2a] rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-gray-150 dark:border-zinc-800 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">Edit User Profile</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{selectedUserToEdit.email}</p>
                        </div>
                        <button
                          onClick={() => setSelectedUserToEdit(null)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 flex items-center justify-center text-gray-400 transition-all cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh] text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                            <input
                              type="text"
                              value={userEditForm.name || ''}
                              onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">User Role</label>
                            <select
                              value={userEditForm.role || 'user'}
                              onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Main Balance ($)</label>
                            <input
                              type="number"
                              step="any"
                              value={userEditForm.balance !== undefined ? userEditForm.balance : 0}
                              onChange={(e) => setUserEditForm({ ...userEditForm, balance: Number(e.target.value) })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Winnings Balance ($)</label>
                            <input
                              type="number"
                              step="any"
                              value={userEditForm.winningsBalance !== undefined ? userEditForm.winningsBalance : 0}
                              onChange={(e) => setUserEditForm({ ...userEditForm, winningsBalance: Number(e.target.value) })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Comm Balance ($)</label>
                            <input
                              type="number"
                              step="any"
                              value={userEditForm.commissionBalance !== undefined ? userEditForm.commissionBalance : 0}
                              onChange={(e) => setUserEditForm({ ...userEditForm, commissionBalance: Number(e.target.value) })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone Number</label>
                            <input
                              type="text"
                              value={userEditForm.phone || ''}
                              onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Country</label>
                            <input
                              type="text"
                              value={userEditForm.country || ''}
                              onChange={(e) => setUserEditForm({ ...userEditForm, country: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">National ID (NID)</label>
                            <input
                              type="text"
                              value={userEditForm.nidNumber || ''}
                              onChange={(e) => setUserEditForm({ ...userEditForm, nidNumber: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white font-mono"
                              placeholder="N/A"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Passport Number</label>
                            <input
                              type="text"
                              value={userEditForm.passportNumber || ''}
                              onChange={(e) => setUserEditForm({ ...userEditForm, passportNumber: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white font-mono"
                              placeholder="N/A"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Date of Birth</label>
                            <input
                              type="text"
                              value={userEditForm.dob || ''}
                              onChange={(e) => setUserEditForm({ ...userEditForm, dob: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white"
                              placeholder="YYYY-MM-DD"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Password (Plaintext View/Edit)</label>
                            <input
                              type="text"
                              value={userEditForm.password || ''}
                              onChange={(e) => setUserEditForm({ ...userEditForm, password: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-bold outline-none text-zinc-900 dark:text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-6 border-t border-gray-150 dark:border-zinc-800 flex justify-end gap-3 bg-gray-50 dark:bg-zinc-900/40">
                        <button
                          type="button"
                          onClick={() => setSelectedUserToEdit(null)}
                          className="px-4 py-2.5 border border-gray-250 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await updateUserProfileFields(selectedUserToEdit.email, userEditForm);
                              setSelectedUserToEdit(null);
                              showAdminAlert('User profile fields updated successfully!', 'success');
                            } catch (error) {
                              console.error('Failed to update user profile fields:', error);
                              showAdminAlert('Failed to update user.', 'error');
                            }
                          }}
                          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10"
                        >
                          Save Profile
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Deposits' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">Deposit Requests</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Manage, edit, approve or reject user deposit transactions</p>
                    </div>
                    <button 
                      onClick={() => setShowAddDepositModal(!showAddDepositModal)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all self-start sm:self-auto"
                    >
                      {showAddDepositModal ? 'Close Form' : '+ Add Manual Deposit'}
                    </button>
                  </div>

                  {/* Manual Add Form */}
                  {showAddDepositModal && (
                    <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase text-amber-500">Create Offline/Manual Deposit</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">User Email</label>
                          <input 
                            type="email" 
                            value={newDepositForm.email} 
                            onChange={(e) => setNewDepositForm(p => ({ ...p, email: e.target.value }))}
                            placeholder="user@example.com"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Amount ($)</label>
                          <input 
                            type="number" 
                            value={newDepositForm.amount || ''} 
                            onChange={(e) => setNewDepositForm(p => ({ ...p, amount: Number(e.target.value) }))}
                            placeholder="Amount in USD"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Gateway</label>
                          <select 
                            value={newDepositForm.gateway} 
                            onChange={(e) => setNewDepositForm(p => ({ ...p, gateway: e.target.value }))}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                            <option value="USDT">USDT (Crypto)</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Local Agent">Local Agent</option>
                            <option value="Local Agent (Commission)">Local Agent (Commission)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Transaction ID</label>
                          <input 
                            type="text" 
                            value={newDepositForm.transactionId} 
                            onChange={(e) => setNewDepositForm(p => ({ ...p, transactionId: e.target.value }))}
                            placeholder="e.g. TRX123456"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 mb-1">Details / Note</label>
                        <input 
                          type="text" 
                          value={newDepositForm.details} 
                          onChange={(e) => setNewDepositForm(p => ({ ...p, details: e.target.value }))}
                          placeholder="Offline deposit, commission payout etc."
                          className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => {
                            if (!newDepositForm.email || !newDepositForm.amount) {
                              showAdminAlert('Please fill user email and amount!', 'error');
                              return;
                            }
                            const id = 'DEP-MAN-' + Date.now();
                            const newReq = {
                              id,
                              email: newDepositForm.email.trim().toLowerCase(),
                              amount: newDepositForm.amount,
                              gateway: newDepositForm.gateway,
                              transactionId: newDepositForm.transactionId || 'MANUAL-' + Math.floor(1000 + Math.random() * 9000),
                              details: newDepositForm.details || 'Manual offline deposit added by admin',
                              date: new Date().toISOString(),
                              status: 'Pending'
                            };
                            setDoc(doc(db, 'depositRequests', id), newReq).then(() => {
                              showAdminAlert('Manual deposit request created!', 'success');
                              setShowAddDepositModal(false);
                              setNewDepositForm({ email: '', amount: 0, gateway: 'bKash', transactionId: '', details: '' });
                            });
                          }}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase"
                        >
                          Submit Request
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex gap-1.5 self-start">
                      {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setDepositFilter(f as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            depositFilter === f
                              ? 'bg-amber-500 text-white shadow'
                              : 'bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <div className="w-full sm:w-64">
                      <input 
                        type="text" 
                        placeholder="Search email or TxID..." 
                        value={depositSearch}
                        onChange={(e) => setDepositSearch(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Edit Deposit Row Form */}
                  {editingDepositId && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-amber-500">Edit Deposit Entry</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">User Email</label>
                          <input type="email" value={depositEditForm.email} onChange={(e) => setDepositEditForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Amount ($)</label>
                          <input type="number" value={depositEditForm.amount || ''} onChange={(e) => setDepositEditForm(p => ({ ...p, amount: Number(e.target.value) }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Gateway</label>
                          <input type="text" value={depositEditForm.gateway} onChange={(e) => setDepositEditForm(p => ({ ...p, gateway: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Transaction ID</label>
                          <input type="text" value={depositEditForm.transactionId} onChange={(e) => setDepositEditForm(p => ({ ...p, transactionId: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Status</label>
                          <select value={depositEditForm.status} onChange={(e) => setDepositEditForm(p => ({ ...p, status: e.target.value as any }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none">
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase">Details</label>
                        <input type="text" value={depositEditForm.details} onChange={(e) => setDepositEditForm(p => ({ ...p, details: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setEditingDepositId(null)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded text-xs font-bold uppercase">Cancel</button>
                        <button 
                          onClick={() => {
                            setDoc(doc(db, 'depositRequests', editingDepositId), depositEditForm, { merge: true }).then(() => {
                              showAdminAlert('Deposit details updated!', 'success');
                              setEditingDepositId(null);
                            });
                          }}
                          className="px-4 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold uppercase"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-500 dark:text-zinc-400">
                      <thead className="bg-gray-50 dark:bg-zinc-900/50 uppercase font-black tracking-wider text-[10px] text-gray-700 dark:text-zinc-300 border-b border-gray-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-3">User Email</th>
                          <th className="px-4 py-3">Gateway</th>
                          <th className="px-4 py-3">TxID</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {(depositRequests || [])
                          .filter(r => depositFilter === 'All' || r.status === depositFilter)
                          .filter(r => !depositSearch || r.email.toLowerCase().includes(depositSearch.toLowerCase()) || (r.transactionId || '').toLowerCase().includes(depositSearch.toLowerCase()))
                          .map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/10">
                              <td className="px-4 py-3">
                                <div className="font-bold text-gray-900 dark:text-white">{req.email}</div>
                                {req.details && <div className="text-[10px] text-gray-400 italic mt-0.5">{req.details}</div>}
                              </td>
                              <td className="px-4 py-3 font-semibold uppercase text-pink-500">{req.gateway}</td>
                              <td className="px-4 py-3 font-mono">{req.transactionId || 'N/A'}</td>
                              <td className="px-4 py-3 text-emerald-500 font-bold">${(req.amount || 0).toFixed(2)}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{req.date || 'N/A'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                  req.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                                  'bg-amber-500/10 text-amber-500 animate-pulse'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                                {req.status === 'Pending' && (
                                  <>
                                    {confirmDepositAction?.id === req.id && confirmDepositAction?.type === 'Approved' ? (
                                      <button 
                                        onClick={() => {
                                          updateDepositStatus(req.id, 'Approved');
                                          setConfirmDepositAction(null);
                                          showAdminAlert(`Approved deposit of $${req.amount} for ${req.email}!`, 'success');
                                        }}
                                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-black uppercase tracking-wider animate-pulse"
                                      >
                                        Click to Confirm Approve
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => setConfirmDepositAction({ id: req.id, type: 'Approved' })}
                                        className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[9px] font-black uppercase tracking-wider"
                                      >
                                        Approve
                                      </button>
                                    )}

                                    {confirmDepositAction?.id === req.id && confirmDepositAction?.type === 'Rejected' ? (
                                      <button 
                                        onClick={() => {
                                          updateDepositStatus(req.id, 'Rejected');
                                          setConfirmDepositAction(null);
                                          showAdminAlert(`Rejected deposit of $${req.amount} for ${req.email}.`, 'success');
                                        }}
                                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-black uppercase tracking-wider animate-pulse"
                                      >
                                        Click to Confirm Reject
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => setConfirmDepositAction({ id: req.id, type: 'Rejected' })}
                                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-[9px] font-black uppercase tracking-wider"
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </>
                                )}
                                <button 
                                  onClick={() => {
                                    setEditingDepositId(req.id);
                                    setDepositEditForm({
                                      email: req.email,
                                      amount: req.amount,
                                      gateway: req.gateway,
                                      transactionId: req.transactionId,
                                      details: req.details || '',
                                      status: req.status
                                    });
                                  }}
                                  className="px-2 py-1 text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 rounded text-[9px] font-bold uppercase"
                                >
                                  Edit
                                </button>
                                
                                {confirmDepositAction?.id === req.id && confirmDepositAction?.type === 'Delete' ? (
                                  <button 
                                    onClick={() => {
                                      deleteDoc(doc(db, 'depositRequests', req.id)).then(() => {
                                        showAdminAlert('Deposit request deleted!', 'success');
                                        setConfirmDepositAction(null);
                                      });
                                    }}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[9px] font-black uppercase tracking-wider animate-pulse"
                                  >
                                    Click to Delete
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => setConfirmDepositAction({ id: req.id, type: 'Delete' })}
                                    className="px-2 py-1 text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded text-[9px] font-bold uppercase"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        {(!depositRequests || depositRequests.length === 0) && (
                          <tr>
                            <td colSpan={7} className="text-center py-6 text-gray-400 italic">No deposit requests found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Withdrawals' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-zinc-800 pb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200">Withdrawal Requests</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Manage, approve or reject user withdrawals via bKash, Nagad, and Bank Transfer</p>
                    </div>
                    <button 
                      onClick={() => setShowAddWithdrawalModal(!showAddWithdrawalModal)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all self-start sm:self-auto"
                    >
                      {showAddWithdrawalModal ? 'Close Form' : '+ Add Manual Withdrawal'}
                    </button>
                  </div>

                  {/* Manual Add Form */}
                  {showAddWithdrawalModal && (
                    <div className="p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-xl border border-gray-200 dark:border-zinc-800 space-y-4">
                      <h4 className="text-xs font-bold uppercase text-amber-500">Create Offline/Manual Withdrawal Request</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">User Email</label>
                          <input 
                            type="email" 
                            value={newWithdrawalForm.email} 
                            onChange={(e) => setNewWithdrawalForm(p => ({ ...p, email: e.target.value }))}
                            placeholder="user@example.com"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Amount ($)</label>
                          <input 
                            type="number" 
                            value={newWithdrawalForm.amount || ''} 
                            onChange={(e) => setNewWithdrawalForm(p => ({ ...p, amount: Number(e.target.value) }))}
                            placeholder="Amount in USD"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Payment Method / Bank</label>
                          <select 
                            value={newWithdrawalForm.bankName} 
                            onChange={(e) => setNewWithdrawalForm(p => ({ ...p, bankName: e.target.value }))}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="bKash Personal">bKash Personal</option>
                            <option value="Nagad Personal">Nagad Personal</option>
                            <option value="Rocket Personal">Rocket Personal</option>
                            <option value="Dutch-Bangla Bank">Dutch-Bangla Bank</option>
                            <option value="Sonali Bank">Sonali Bank</option>
                            <option value="City Bank">City Bank</option>
                            <option value="USDT TRC20">USDT Wallet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Account Number / IBAN</label>
                          <input 
                            type="text" 
                            value={newWithdrawalForm.iban} 
                            onChange={(e) => setNewWithdrawalForm(p => ({ ...p, iban: e.target.value }))}
                            placeholder="e.g. 017XXXXXXXX"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Account Holder Name</label>
                          <input 
                            type="text" 
                            value={newWithdrawalForm.accountName} 
                            onChange={(e) => setNewWithdrawalForm(p => ({ ...p, accountName: e.target.value }))}
                            placeholder="Full name of receiver"
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 mb-1">Source Balance Wallet</label>
                          <select 
                            value={newWithdrawalForm.sourceWallet} 
                            onChange={(e) => setNewWithdrawalForm(p => ({ ...p, sourceWallet: e.target.value as any }))}
                            className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            <option value="main">Main Deposit Balance</option>
                            <option value="winnings">Winning Prizes Balance</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => {
                            if (!newWithdrawalForm.email || !newWithdrawalForm.amount || !newWithdrawalForm.iban) {
                              showAdminAlert('Please fill user email, amount, and receiver account/phone!', 'error');
                              return;
                            }
                            const id = 'WITH-MAN-' + Date.now();
                            const newReq = {
                              id,
                              email: newWithdrawalForm.email.trim().toLowerCase(),
                              amount: newWithdrawalForm.amount,
                              bankName: newWithdrawalForm.bankName,
                              iban: newWithdrawalForm.iban,
                              accountName: newWithdrawalForm.accountName || 'Not Specified',
                              sourceWallet: newWithdrawalForm.sourceWallet,
                              date: new Date().toISOString(),
                              status: 'Pending',
                              isDebited: false
                            };
                            setDoc(doc(db, 'withdrawalRequests', id), newReq).then(() => {
                              showAdminAlert('Manual withdrawal request created!', 'success');
                              setShowAddWithdrawalModal(false);
                              setNewWithdrawalForm({ email: '', amount: 0, bankName: 'bKash', iban: '', accountName: '', sourceWallet: 'main' });
                            });
                          }}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase"
                        >
                          Submit Withdrawal
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="flex gap-1.5 self-start">
                      {['All', 'Pending', 'Approved', 'Rejected'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setWithdrawalFilter(f as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            withdrawalFilter === f
                              ? 'bg-amber-500 text-white shadow'
                              : 'bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <div className="w-full sm:w-64">
                      <input 
                        type="text" 
                        placeholder="Search email, bank or phone..." 
                        value={withdrawalSearch}
                        onChange={(e) => setWithdrawalSearch(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Edit Withdrawal Row Form */}
                  {editingWithdrawalId && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-4">
                      <h4 className="text-xs font-black uppercase text-amber-500">Edit Withdrawal Entry</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">User Email</label>
                          <input type="email" value={withdrawalEditForm.email} onChange={(e) => setWithdrawalEditForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Amount ($)</label>
                          <input type="number" value={withdrawalEditForm.amount || ''} onChange={(e) => setWithdrawalEditForm(p => ({ ...p, amount: Number(e.target.value) }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Bank/Method</label>
                          <input type="text" value={withdrawalEditForm.bankName} onChange={(e) => setWithdrawalEditForm(p => ({ ...p, bankName: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Account Number / Phone</label>
                          <input type="text" value={withdrawalEditForm.iban} onChange={(e) => setWithdrawalEditForm(p => ({ ...p, iban: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Account Name</label>
                          <input type="text" value={withdrawalEditForm.accountName} onChange={(e) => setWithdrawalEditForm(p => ({ ...p, accountName: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-400 uppercase">Source Wallet</label>
                          <select value={withdrawalEditForm.sourceWallet} onChange={(e) => setWithdrawalEditForm(p => ({ ...p, sourceWallet: e.target.value as any }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded px-2 py-1 text-xs outline-none">
                            <option value="main">Main Wallet</option>
                            <option value="winnings">Winnings Wallet</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setEditingWithdrawalId(null)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded text-xs font-bold uppercase">Cancel</button>
                        <button 
                          onClick={() => {
                            setDoc(doc(db, 'withdrawalRequests', editingWithdrawalId), withdrawalEditForm, { merge: true }).then(() => {
                              showAdminAlert('Withdrawal details updated!', 'success');
                              setEditingWithdrawalId(null);
                            });
                          }}
                          className="px-4 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold uppercase"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* List Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-500 dark:text-zinc-400">
                      <thead className="bg-gray-50 dark:bg-zinc-900/50 uppercase font-black tracking-wider text-[10px] text-gray-700 dark:text-zinc-300 border-b border-gray-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-3">User Email</th>
                          <th className="px-4 py-3">Payment Method</th>
                          <th className="px-4 py-3">Account Number</th>
                          <th className="px-4 py-3">Account Name</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Source Wallet</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {(withdrawalRequests || [])
                          .filter(r => withdrawalFilter === 'All' || r.status === withdrawalFilter)
                          .filter(r => !withdrawalSearch || r.email.toLowerCase().includes(withdrawalSearch.toLowerCase()) || (r.bankName || '').toLowerCase().includes(withdrawalSearch.toLowerCase()) || (r.iban || '').toLowerCase().includes(withdrawalSearch.toLowerCase()))
                          .map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/10">
                              <td className="px-4 py-3">
                                <div className="font-bold text-gray-900 dark:text-white">{req.email}</div>
                                <div className="text-[9px] text-gray-400 italic mt-0.5">{req.date || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-3 font-semibold uppercase text-pink-500">{req.bankName}</td>
                              <td className="px-4 py-3 font-mono font-bold text-amber-500">{req.iban}</td>
                              <td className="px-4 py-3 font-medium">{req.accountName || 'N/A'}</td>
                              <td className="px-4 py-3 text-red-500 font-extrabold">${(req.amount || 0).toFixed(2)}</td>
                              <td className="px-4 py-3 uppercase text-[10px] font-bold text-gray-400">{req.sourceWallet || 'main'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  req.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                  req.status === 'Rejected' ? 'bg-red-500/10 text-red-500' :
                                  'bg-amber-500/10 text-amber-500 animate-pulse'
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                                {req.status === 'Pending' && (
                                  <>
                                    {confirmWithdrawalAction?.id === req.id && confirmWithdrawalAction?.type === 'Approved' ? (
                                      <button 
                                        onClick={() => {
                                          updateWithdrawalStatus(req.id, 'Approved');
                                          setConfirmWithdrawalAction(null);
                                          showAdminAlert(`Approved withdrawal of $${req.amount} for ${req.email}!`, 'success');
                                        }}
                                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-black uppercase tracking-wider animate-pulse"
                                      >
                                        Click to Confirm Approve
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => setConfirmWithdrawalAction({ id: req.id, type: 'Approved' })}
                                        className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[9px] font-black uppercase tracking-wider"
                                      >
                                        Approve
                                      </button>
                                    )}

                                    {confirmWithdrawalAction?.id === req.id && confirmWithdrawalAction?.type === 'Rejected' ? (
                                      <button 
                                        onClick={() => {
                                          updateWithdrawalStatus(req.id, 'Rejected');
                                          setConfirmWithdrawalAction(null);
                                          showAdminAlert(`Rejected withdrawal of $${req.amount} for ${req.email}.`, 'success');
                                        }}
                                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-black uppercase tracking-wider animate-pulse"
                                      >
                                        Click to Confirm Reject
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={() => setConfirmWithdrawalAction({ id: req.id, type: 'Rejected' })}
                                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-[9px] font-black uppercase tracking-wider"
                                      >
                                        Reject
                                      </button>
                                    )}
                                  </>
                                )}
                                <button 
                                  onClick={() => {
                                    setEditingWithdrawalId(req.id);
                                    setWithdrawalEditForm({
                                      email: req.email,
                                      amount: req.amount,
                                      bankName: req.bankName,
                                      iban: req.iban,
                                      accountName: req.accountName || '',
                                      sourceWallet: req.sourceWallet || 'main',
                                      status: req.status
                                    });
                                  }}
                                  className="px-2 py-1 text-amber-500 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 rounded text-[9px] font-bold uppercase"
                                >
                                  Edit
                                </button>
                                
                                {confirmWithdrawalAction?.id === req.id && confirmWithdrawalAction?.type === 'Delete' ? (
                                  <button 
                                    onClick={() => {
                                      deleteDoc(doc(db, 'withdrawalRequests', req.id)).then(() => {
                                        showAdminAlert('Withdrawal request deleted!', 'success');
                                        setConfirmWithdrawalAction(null);
                                      });
                                    }}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[9px] font-black uppercase tracking-wider animate-pulse"
                                  >
                                    Click to Delete
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => setConfirmWithdrawalAction({ id: req.id, type: 'Delete' })}
                                    className="px-2 py-1 text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded text-[9px] font-bold uppercase"
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        {(!withdrawalRequests || withdrawalRequests.length === 0) && (
                          <tr>
                            <td colSpan={8} className="text-center py-6 text-gray-400 italic">No withdrawal requests found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Games' && <AdminGamesTab />}
            {activeTab === 'Winners' && <AdminWinnersTab />}
            {activeTab === 'News' && <AdminNewsTab />}
            {activeTab === 'Pages' && <AdminPagesTab />}
            {activeTab === 'Draws' && (
              <div className="space-y-6">
                {/* 1. Run Live Draw Section */}
                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Run Live Draw & Simulate</h3>
                  <div className="grid gap-6">
                    {dynamicGames?.map(game => (
                      <div key={game.id} className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-900/30">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-base text-gray-800 dark:text-white uppercase">{game.name}</h4>
                          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{game.prize} Jackpot</span>
                        </div>
                        <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Enter Winning Numbers (comma separated)</label>
                            <input type="text" id={`draw-${game.id}`} placeholder="e.g. 12, 45, 67, 89, 21" className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none" />
                          </div>
                          <button onClick={() => {
                              const input = document.getElementById(`draw-${game.id}`) as HTMLInputElement;
                              const nums = input.value.split(",").map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
                              if (nums.length > 0) {
                                if (confirm(`Are you sure you want to draw ${nums.join(", ")} for ${game.name}?`)) {
                                  const newDrawResult = {
                                    id: Date.now().toString(),
                                    gameName: game.name,
                                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                                    numbers: nums,
                                    totalWinners: '1 Player',
                                    totalPaid: game.prize || '$10,000.00',
                                    country: 'Bangladesh'
                                  };
                                  const currentDraws = siteConfig?.drawResults || [];
                                  updateSiteConfig({ drawResults: [newDrawResult, ...currentDraws] });
                                  triggerDraw(game.name, nums);
                                  input.value = "";
                                  alert("Draw completed & result appended!");
                                }
                              } else {
                                alert("Please enter valid numbers");
                              }
                            }}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-colors shrink-0"
                          >
                            Run Draw
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Add Manual Draw Result */}
                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <h3 className="text-sm font-black uppercase text-amber-500 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Add Custom Draw Result Manually</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Game Name</label>
                      <select 
                        value={newDraw.gameName}
                        onChange={(e) => setNewDraw(prev => ({ ...prev, gameName: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none"
                      >
                        {dynamicGames?.map(g => (
                          <option key={g.id || g.name} value={g.name}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Draw Date Text</label>
                      <input 
                        type="text" 
                        value={newDraw.date} 
                        onChange={(e) => setNewDraw(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" 
                        placeholder="e.g. 26 Jun 2026, 10:30 am"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Winning Numbers (comma split)</label>
                      <input 
                        type="text" 
                        value={newDraw.numbersStr} 
                        onChange={(e) => setNewDraw(prev => ({ ...prev, numbersStr: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none font-mono" 
                        placeholder="e.g. 13, 6"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Total Winners Description</label>
                      <input 
                        type="text" 
                        value={newDraw.totalWinners} 
                        onChange={(e) => setNewDraw(prev => ({ ...prev, totalWinners: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" 
                        placeholder="e.g. 1,250 Players"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Total Prizes Paid</label>
                      <input 
                        type="text" 
                        value={newDraw.totalPaid} 
                        onChange={(e) => setNewDraw(prev => ({ ...prev, totalPaid: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" 
                        placeholder="e.g. $45,000.00"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Country</label>
                      <input 
                        type="text" 
                        value={newDraw.country} 
                        onChange={(e) => setNewDraw(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-medium outline-none" 
                        placeholder="e.g. India or Bangladesh"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => {
                        const nums = newDraw.numbersStr.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
                        if (nums.length === 0) {
                          alert('Please enter valid drawing numbers!');
                          return;
                        }
                        const drawObj = {
                          id: 'dr-' + Date.now().toString(),
                          gameName: newDraw.gameName,
                          date: newDraw.date,
                          numbers: nums,
                          totalWinners: newDraw.totalWinners,
                          totalPaid: newDraw.totalPaid,
                          country: newDraw.country
                        };
                        const updated = [drawObj, ...(siteConfig?.drawResults || [])];
                        updateSiteConfig({ drawResults: updated });
                        alert('Custom Draw Result added!');
                        setNewDraw(prev => ({ ...prev, numbersStr: '' }));
                      }}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-colors"
                    >
                      Save Draw Result
                    </button>
                  </div>
                </div>

                {/* 3. Manage Draw Results List & History */}
                <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                  <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Latest Draw Results History</h3>
                  
                  {/* Editing block */}
                  {editingDrawId && (
                    <div className="p-4 border border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl space-y-4 mb-4">
                      <h4 className="text-xs font-black uppercase text-amber-500">Currently Editing Draw Result</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">Game Name</label>
                          <input type="text" value={editingDrawForm.gameName} onChange={(e) => setEditingDrawForm(p => ({ ...p, gameName: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">Date</label>
                          <input type="text" value={editingDrawForm.date} onChange={(e) => setEditingDrawForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">Numbers (comma split)</label>
                          <input type="text" value={editingDrawForm.numbersStr} onChange={(e) => setEditingDrawForm(p => ({ ...p, numbersStr: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">Winners</label>
                          <input type="text" value={editingDrawForm.totalWinners} onChange={(e) => setEditingDrawForm(p => ({ ...p, totalWinners: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">Prizes Paid</label>
                          <input type="text" value={editingDrawForm.totalPaid} onChange={(e) => setEditingDrawForm(p => ({ ...p, totalPaid: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase text-gray-500 dark:text-zinc-400 mb-1">Country</label>
                          <input type="text" value={editingDrawForm.country} onChange={(e) => setEditingDrawForm(p => ({ ...p, country: e.target.value }))} className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-medium outline-none" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingDrawId(null)} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase">Cancel</button>
                        <button 
                          onClick={() => {
                            const nums = editingDrawForm.numbersStr.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
                            if (nums.length === 0) {
                              alert('Please enter valid drawing numbers!');
                              return;
                            }
                            const updated = (siteConfig?.drawResults || []).map((d: any) => {
                              if (d.id === editingDrawId) {
                                return {
                                  ...d,
                                  gameName: editingDrawForm.gameName,
                                  date: editingDrawForm.date,
                                  numbers: nums,
                                  totalWinners: editingDrawForm.totalWinners,
                                  totalPaid: editingDrawForm.totalPaid,
                                  country: editingDrawForm.country
                                };
                              }
                              return d;
                            });
                            updateSiteConfig({ drawResults: updated });
                            alert('Draw Result updated!');
                            setEditingDrawId(null);
                          }}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-500 dark:text-zinc-400">
                      <thead className="bg-gray-50 dark:bg-zinc-900/50 uppercase font-black tracking-wider text-[10px] text-gray-700 dark:text-zinc-300 border-b border-gray-200 dark:border-zinc-800">
                        <tr>
                          <th className="px-4 py-3">Game</th>
                          <th className="px-4 py-3">Draw Date</th>
                          <th className="px-4 py-3">Winning Numbers</th>
                          <th className="px-4 py-3">Winners</th>
                          <th className="px-4 py-3">Prize Paid</th>
                          <th className="px-4 py-3">Country</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-850">
                        {(siteConfig?.drawResults || []).map((draw: any, i: number) => (
                          <tr key={draw.id || i} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/10">
                            <td className="px-4 py-3 font-bold text-gray-900 dark:text-white uppercase">{draw.gameName}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{draw.date}</td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1 flex-wrap">
                                {draw.numbers?.map((n: number, circleIdx: number) => (
                                  <span key={circleIdx} className="bg-zinc-800 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                    {n}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium">{draw.totalWinners}</td>
                            <td className="px-4 py-3 font-semibold text-emerald-500">{draw.totalPaid}</td>
                            <td className="px-4 py-3 font-bold text-amber-500 uppercase">{draw.country || 'Global'}</td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <button 
                                onClick={() => {
                                  setEditingDrawId(draw.id);
                                  setEditingDrawForm({
                                    gameName: draw.gameName,
                                    date: draw.date,
                                    numbersStr: draw.numbers?.join(', ') || '',
                                    totalWinners: draw.totalWinners,
                                    totalPaid: draw.totalPaid,
                                    country: draw.country || ''
                                  });
                                }} 
                                className="px-2.5 py-1 text-amber-500 hover:bg-amber-500/10 rounded font-bold uppercase text-[10px] mr-1"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this draw result?')) {
                                    const updated = (siteConfig?.drawResults || []).filter((d: any) => d.id !== draw.id);
                                    updateSiteConfig({ drawResults: updated });
                                    alert('Draw Result deleted!');
                                  }
                                }} 
                                className="px-2.5 py-1 text-red-500 hover:bg-red-500/10 rounded font-bold uppercase text-[10px]"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!siteConfig?.drawResults || siteConfig.drawResults.length === 0) && (
                          <tr>
                            <td colSpan={7} className="text-center py-6 text-gray-400 italic">No historical draw results configured.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
