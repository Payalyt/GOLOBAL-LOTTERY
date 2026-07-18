const fs = require('fs');

const adminCode = `import React, { useState } from 'react';
import { useAuth, SiteThemeConfig } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Settings, Image as ImageIcon, Type, CreditCard, Paintbrush, Users, FileText, Trophy } from 'lucide-react';

export function Admin() {
  const { user, siteConfig, updateSiteConfig, theme, allUsers, dynamicGames, triggerDraw } = useAuth();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('General');
  
  const [configForm, setConfigForm] = useState<Partial<SiteThemeConfig>>(siteConfig || {});
  const [isSaving, setIsSaving] = useState(false);

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
      alert('Settings updated successfully!');
    } catch (err) {
      console.error('Error saving config', err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
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
    <div className={\`flex h-screen overflow-hidden \${theme === 'dark' ? 'bg-[#0f141f] text-white' : 'bg-gray-100 text-gray-900'}\`}>
      <div className={\`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#151c2a] border-r border-gray-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out \${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}\`}>
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
                      className={\`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all \${isActive ? 'bg-amber-500 text-white shadow-md' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}\`}
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

      <div className={\`flex-1 flex flex-col transition-all duration-300 \${sidebarOpen ? 'lg:ml-64' : 'ml-0'}\`}>
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
            <button onClick={handleSave} disabled={isSaving} className={\`px-6 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all \${isSaving ? 'opacity-70' : 'hover:bg-amber-600'}\`}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">

            {(activeTab === 'Design' || activeTab === 'General') && (
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Theme & Layout</h3>
                <div className="mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Show 3-Line Mobile Menu</label>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" name="slideMenuEnabled" checked={configForm.slideMenuEnabled !== false} onChange={handleChange} />
                      <div className={\`block w-10 h-6 rounded-full transition-colors \${configForm.slideMenuEnabled !== false ? "bg-amber-500" : "bg-gray-300 dark:bg-zinc-700"}\`}></div>
                      <div className={\`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${configForm.slideMenuEnabled !== false ? "transform translate-x-4" : ""}\`}></div>
                    </div>
                    <span className="ml-3 text-sm font-bold text-gray-700 dark:text-gray-300">{configForm.slideMenuEnabled !== false ? "Enabled" : "Disabled"}</span>
                  </label>
                </div>
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
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Payment Gateways</h3>
                <div className="space-y-8">
                  <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-pink-500 uppercase tracking-wide">bKash</h4>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" name="bkashEnabled" checked={configForm.bkashEnabled || false} onChange={handleChange} />
                          <div className={\`block w-10 h-6 rounded-full transition-colors \${configForm.bkashEnabled ? 'bg-pink-500' : 'bg-gray-300 dark:bg-zinc-700'}\`}></div>
                          <div className={\`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${configForm.bkashEnabled ? 'transform translate-x-4' : ''}\`}></div>
                        </div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">bKash Agent Number</label>
                      <input type="text" name="bkashAgentNumber" value={configForm.bkashAgentNumber || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none font-mono" />
                    </div>
                  </div>
                  
                  <div className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-green-500 uppercase tracking-wide">USDT (Crypto)</h4>
                      <label className="flex items-center cursor-pointer">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" name="usdtEnabled" checked={configForm.usdtEnabled || false} onChange={handleChange} />
                          <div className={\`block w-10 h-6 rounded-full transition-colors \${configForm.usdtEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-zinc-700'}\`}></div>
                          <div className={\`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform \${configForm.usdtEnabled ? 'transform translate-x-4' : ''}\`}></div>
                        </div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">USDT Address (TRC20)</label>
                      <input type="text" name="usdtAddress" value={configForm.usdtAddress || ''} onChange={handleChange} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none font-mono" />
                    </div>
                  </div>
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
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Registered Users ({allUsers?.length || 0})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-500 dark:text-zinc-400">
                    <thead className="bg-gray-50 dark:bg-zinc-900/50 text-xs uppercase font-bold text-gray-700 dark:text-zinc-300">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Balance</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Country</th>
                        <th className="px-4 py-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers?.map((u, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-zinc-800">
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                          <td className="px-4 py-3">{u.email}</td>
                          <td className="px-4 py-3 text-green-600 dark:text-green-400 font-bold">\${u.balance.toFixed(2)}</td>
                          <td className="px-4 py-3">{u.phone}</td>
                          <td className="px-4 py-3">{u.country}</td>
                          <td className="px-4 py-3 uppercase text-[10px] font-black">{u.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'Draws' && (
              <div className="bg-white dark:bg-[#151c2a] rounded-2xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-sm font-black uppercase text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Draw Winning Numbers</h3>
                <div className="grid gap-6">
                  {dynamicGames?.map(game => (
                    <div key={game.id} className="p-5 border border-gray-200 dark:border-zinc-800 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-lg text-gray-800 dark:text-white">{game.name}</h4>
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{game.prize} Jackpot</span>
                      </div>
                      <div className="flex gap-4 items-end">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-1.5">Enter Winning Numbers (comma separated)</label>
                          <input type="text" id={\`draw-\${game.id}\`} placeholder="e.g. 12, 45, 67, 89, 21" className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none" />
                        </div>
                        <button onClick={() => {
                            const input = document.getElementById(\`draw-\${game.id}\`) as HTMLInputElement;
                            const nums = input.value.split(",").map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
                            if (nums.length > 0) {
                              if (confirm(\`Are you sure you want to draw \${nums.join(", ")} for \${game.name}?\`)) {
                                triggerDraw(game.name, nums);
                                input.value = "";
                                alert("Draw completed!");
                              }
                            } else {
                              alert("Please enter valid numbers");
                            }
                          }}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-colors"
                        >
                          Run Draw
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/Admin.tsx', adminCode);
