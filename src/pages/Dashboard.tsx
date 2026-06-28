import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../utils/translations';
import { 
  User, 
  CreditCard, 
  TrendingUp, 
  Send, 
  FileText, 
  Ticket, 
  History, 
  BellRing, 
  ShieldCheck, 
  Activity, 
  Heart, 
  Inbox as InboxIcon,
  Pencil,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';

export function Dashboard() {
  const { user, setUser, isLoggedIn, tickets, updateUserBalance, updateUserProfileFields, withdrawalRequests = [], addWithdrawalRequest, addDepositRequest, depositRequests = [], siteConfig, language, theme } = useAuth();
  const { tickets: cartTickets } = useCart();
  const navigate = useNavigate();

  // Active tabs state
  const [activeTab, setActiveTab] = useState<string>('Personal Details');

  // Persistence of custom fields using localStorage so it survives reload
  const [gender, setGender] = useState<string>(() => localStorage.getItem('db_gender') || 'Male');
  const [employer, setEmployer] = useState<string>(() => localStorage.getItem('db_employer') || 'nil');
  const [region, setRegion] = useState<string>(() => localStorage.getItem('db_region') || 'nil');
  const [address1, setAddress1] = useState<string>(() => localStorage.getItem('db_address1') || 'nil');
  const [address2, setAddress2] = useState<string>(() => localStorage.getItem('db_address2') || '');
  const [city, setCity] = useState<string>(() => localStorage.getItem('db_city') || 'nil');
  const [zipcode, setZipcode] = useState<string>(() => localStorage.getItem('db_zipcode') || '');

  // Editing panels state triggers
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Form Fields Editing States
  const [editName, setEditName] = useState(user?.name || 'Meshkat sorif payal');
  const [editProfileImage, setEditProfileImage] = useState(user?.profileImage || '');
  const [editNationality, setEditNationality] = useState(user?.country || 'Bangladesh');
  const [editDob, setEditDob] = useState(user?.dob || '08/10/2005');
  const [editGender, setEditGender] = useState(gender);
  const [editEmployer, setEditEmployer] = useState(employer);
  const [editRegion, setEditRegion] = useState(region);
  const [editNid, setEditNid] = useState(user?.nidNumber || '');
  const [editPassport, setEditPassport] = useState(user?.passportNumber || '');

  const [editEmail, setEditEmail] = useState(user?.email || 'md.meshkat200@gmail.com');
  const [editPhone, setEditPhone] = useState(user?.phone || '+8801986259552');

  const [editAddress1, setEditAddress1] = useState(address1);
  const [editAddress2, setEditAddress2] = useState(address2);
  const [editCity, setEditCity] = useState(city);
  const [editCountry, setEditCountry] = useState(user?.country || 'Bangladesh');
  const [editZipcode, setEditZipcode] = useState(zipcode);

  // Add credit card details
  const [depositAmount, setDepositAmount] = useState('100');
  const [cardHolder, setCardHolder] = useState(user?.name || 'Meshkat sorif payal');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [bankWithdrawAmount, setBankWithdrawAmount] = useState('');
  const [bankWithdrawName, setBankWithdrawName] = useState('');
  const [bankWithdrawIban, setBankWithdrawIban] = useState('');
  const [bankWithdrawBranch, setBankWithdrawBranch] = useState('');
  
  const [commissionDepositAmount, setCommissionDepositAmount] = useState('8500');

  // Agent System state variables
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<'card' | 'agent' | 'crypto'>('card');
  const [selectedCommissionMethod, setSelectedCommissionMethod] = useState<'card' | 'agent' | 'gateway'>('card');
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<'bank' | 'agent' | 'gateway'>('bank');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
  
  const [agentDepositReference, setAgentDepositReference] = useState('');
  const [agentDepositChannel, setAgentDepositChannel] = useState<string>('WhatsApp');
  
  const [agentCommissionReference, setAgentCommissionReference] = useState('');
  const [agentCommissionChannel, setAgentCommissionChannel] = useState<string>('WhatsApp');
  
  const [agentWithdrawReference, setAgentWithdrawReference] = useState('');
  const [agentWithdrawChannel, setAgentWithdrawChannel] = useState<string>('WhatsApp');

  // Password and secure state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Helper functions for social agent direct application launching
  const getDirectLink = (platform: 'WhatsApp' | 'Telegram' | 'IMO') => {
    const rawPhone = siteConfig.bkashNumber || '8801986259552';
    const cleanPhone = rawPhone.replace(/[^\d]/g, ''); // standard digits only e.g. 8801986259552
    
    if (platform === 'WhatsApp') {
      return `whatsapp://send?phone=${cleanPhone}`;
    } else if (platform === 'Telegram') {
      const handle = siteConfig.agentTelegramLink?.split('/').pop() || 'md_meshkat_payal';
      return `tg://resolve?domain=${handle}`;
    } else if (platform === 'IMO') {
      return `imo://chat?phone=${cleanPhone}`;
    }
    return '#';
  };

  const getWebLink = (platform: 'WhatsApp' | 'Telegram' | 'IMO') => {
    if (platform === 'WhatsApp') {
      return siteConfig.agentWhatsappLink || 'https://wa.me/8801986259552';
    } else if (platform === 'Telegram') {
      return siteConfig.agentTelegramLink || 'https://t.me/md_meshkat_payal';
    } else if (platform === 'IMO') {
      return siteConfig.agentImoLink || 'https://imo.im/8801986259552';
    }
    return '#';
  };

  const handleAgentClick = (platform: 'WhatsApp' | 'Telegram' | 'IMO', e: React.MouseEvent) => {
    e.preventDefault();
    const deep = getDirectLink(platform);
    const web = getWebLink(platform);
    
    // Attempt direct application launch
    window.location.href = deep;
    
    // Fallback to web link after 1000ms if client hasn't redirected away
    setTimeout(() => {
      window.open(web, '_blank');
    }, 1000);
  };

  // Communications checkboxes
  const [comEmail, setComEmail] = useState(true);
  const [comSms, setComSms] = useState(true);
  const [comNewsletter, setComNewsletter] = useState(false);

  // Menu options listed in screenshots
  const menuItems = [
    { label: 'Personal Details', icon: User },
    { label: 'Add Credit', icon: CreditCard },
    { label: 'My Orders', icon: FileText },
    { label: 'My Tickets', icon: Ticket },
    { label: 'Transactions', icon: History },
    { label: 'Communications', icon: BellRing },
    { label: 'Account & Security', icon: ShieldCheck },
    { label: 'Play Responsibly', icon: Activity },
    { label: 'Favorites', icon: Heart },
    { label: 'Inbox', icon: InboxIcon },
    { label: 'Our Games', icon: Activity },
  ];

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 bg-white border border-gray-200 rounded-3xl shadow-xl text-center space-y-6 text-zinc-900">
        <div className="w-16 h-16 rounded-full bg-red-550 bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0F0D24]">Access Restricted</h2>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Unlock advanced probability checkers, transaction wallets, and tickets. Please log in first.
        </p>
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-[#0F0D24] hover:bg-[#1E1A3C] text-white font-black py-4 px-6 rounded-xl text-xs uppercase tracking-widest transition-all"
        >
          LOG IN TO MY ACCOUNT
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center">
        <p>Loading your account details...</p>
      </div>
    );
  }

  const userTickets = tickets.filter(t => t.email === user.email);

  // Form Saves handlers
  const savePersonalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name: editName,
      profileImage: editProfileImage,
      country: editNationality,
      dob: editDob,
      nidNumber: editNid,
      passportNumber: editPassport
    });
    setGender(editGender);
    setEmployer(editEmployer);
    setRegion(editRegion);
    localStorage.setItem('db_gender', editGender);
    localStorage.setItem('db_employer', editEmployer);
    localStorage.setItem('db_region', editRegion);
    setIsEditingPersonal(false);
  };

  const saveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      email: editEmail,
      phone: editPhone
    });
    setIsEditingContact(false);
  };

  const saveAddressInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      country: editCountry
    });
    setAddress1(editAddress1);
    setAddress2(editAddress2);
    setCity(editCity);
    setZipcode(editZipcode);
    localStorage.setItem('db_address1', editAddress1);
    localStorage.setItem('db_address2', editAddress2);
    localStorage.setItem('db_city', editCity);
    localStorage.setItem('db_zipcode', editZipcode);
    setIsEditingAddress(false);
  };

  // Add credit trigger
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid deposit amount.");
      return;
    }
    updateUserBalance(user.email, amt);
    alert(`🎉 Success! $${amt.toFixed(2)} credited securely using card ending in ${cardNumber.slice(-4) || '4312'}.`);
    setCardNumber('');
    setCvv('');
    setExpiry('');
    setActiveTab('Personal Details');
  };

  const handleCommissionDepositSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = parseFloat(commissionDepositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid commission deposit amount.");
      return;
    }
    const nextCommission = (user.commissionBalance || 0) + amt;
    updateUserProfileFields(user.email, { commissionBalance: nextCommission });
    alert(`🎉 Success! $${amt.toFixed(2)} added to Commission Balance securely using card ending in ${cardNumber.slice(-4) || '4312'}.`);
    setCardNumber('');
    setCvv('');
    setExpiry('');
    setActiveTab('Bank Withdraw');
  };

  const handleAgentDepositSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid deposit amount.");
      return;
    }
    if (addDepositRequest) {
      addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: `Agent (${agentDepositChannel})`,
        transactionId: agentDepositReference || 'AGENT-REF-' + Math.floor(100000 + Math.random() * 900000)
      });
    }
    alert(`🎉 Success! Agent Deposit request for $${amt.toFixed(2)} via ${agentDepositChannel} has been submitted to Admin.`);
    setAgentDepositReference('');
    setActiveTab('Transactions');
  };

  const handleAgentCommissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(commissionDepositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid commission amount.");
      return;
    }
    const nextCommission = (user.commissionBalance || 0) + amt;
    updateUserProfileFields(user.email, { commissionBalance: nextCommission });
    if (addDepositRequest) {
      addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: `Agent (${agentCommissionChannel}) Commission`,
        transactionId: agentCommissionReference || 'AGENT-COM-' + Math.floor(100000 + Math.random() * 900000),
        details: 'Commission paid via Authorized Local Agent'
      });
    }
    alert(`🎉 Success! Agent Commission Payment of $${amt.toFixed(2)} submitted. Your Commission Balance has been updated immediately for testing convenience.`);
    setAgentCommissionReference('');
    setActiveTab('Bank Withdraw');
  };

  const handleAgentWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(bankWithdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid withdrawal amount.");
      return;
    }
    if (amt < 81967.21) {
      alert("Minimum withdrawal amount is $81,967.21");
      return;
    }
    if (user.balance < amt) {
      alert("Insufficient wallet balance for this withdrawal.");
      return;
    }
    const commissionNeeded = amt * 0.10;
    const currentComm = user.commissionBalance || 0;
    if (currentComm < commissionNeeded) {
      alert(`⚠️ Insufficient Commission Balance! You need $${commissionNeeded.toFixed(2)} (10% of $${amt.toFixed(2)}) in your Commission Balance to authorize this withdrawal. Currently you have $${currentComm.toFixed(2)}.`);
      return;
    }

    const nextBalance = user.balance - amt;
    const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
    updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

    if (addWithdrawalRequest) {
      addWithdrawalRequest({
        amount: amt,
        bankName: `Agent (${agentWithdrawChannel})`,
        iban: agentWithdrawReference || 'Agent Contact ID',
        accountName: user.name
      });
    }

    alert(`🎉 Agent Withdrawal request for $${amt.toFixed(2)} submitted successfully! 10% commission ($${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
    setBankWithdrawAmount('');
    setAgentWithdrawReference('');
    setActiveTab('Transactions');
  };

  const handleBankWithdrawSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = parseFloat(bankWithdrawAmount);
    
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid withdrawal amount.");
      return;
    }
    
    if (amt < 81967.21) {
      alert("Minimum withdrawal amount is $81,967.21");
      return;
    }

    if (user.balance < amt) {
      alert("Insufficient wallet balance for this withdrawal.");
      return;
    }

    const commissionNeeded = amt * 0.10;
    const currentCommission = user.commissionBalance || 0;

    if (currentCommission < commissionNeeded) {
      alert(`Insufficient Commission Balance.\n\nGovernment regulations require a 10% commission ($${commissionNeeded.toFixed(2)}) to be paid beforehand. Please deposit the required commission amount to proceed.`);
      return;
    }

    // Process withdrawal
    const nextBalance = user.balance - amt;
    const nextCommission = currentCommission - commissionNeeded;
    updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

    if (addWithdrawalRequest) {
      addWithdrawalRequest({
        email: user.email,
        amount: amt,
        bankName: `${bankWithdrawName} (Branch: ${bankWithdrawBranch})`,
        iban: bankWithdrawIban,
        accountName: user.name
      });
    }

    alert(`🎉 Withdrawal request for $${amt.toFixed(2)} submitted successfully! 10% commission ($${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
    setBankWithdrawAmount('');
    setBankWithdrawName('');
    setBankWithdrawIban('');
    setBankWithdrawBranch('');
    setActiveTab('Transactions');
  };

  const getTabLabel = (label: string, lang: 'en' | 'bn') => {
    if (lang === 'en') return label;
    switch (label) {
      case 'Personal Details': return 'ব্যক্তিগত তথ্য';
      case 'Add Credit': return 'টাকা যোগ করুন';
      case 'My Orders': return 'আমার অর্ডার';
      case 'My Tickets': return 'আমার টিকিট';
      case 'Transactions': return 'লেনদেন';
      case 'Communications': return 'যোগাযোগ';
      case 'Account & Security': return 'অ্যাকাউন্ট ও নিরাপত্তা';
      case 'Play Responsibly': return 'দায়িত্বশীলভাবে খেলুন';
      case 'Favorites': return 'প্রিয়সমূহ';
      case 'Inbox': return 'ইনবক্স';
      case 'Our Games': return 'আমাদের গেম';
      default: return label;
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100 font-sans">
      
      {/* Container holding My Account with exact card layout */}
      <div className="bg-white dark:bg-zinc-950 border border-[#E5E5EB] dark:border-zinc-850 rounded-[32px] shadow-sm p-6 sm:p-10 select-none">
        
        {/* Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F0D24] dark:text-white">
            {language === 'en' ? 'My Account' : 'আমার অ্যাকাউন্ট'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="p-2 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Balances Panel */}
        <div className="mt-6 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#0F0D24] via-[#1A1638] to-[#0F0D24] rounded-[32px] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl relative overflow-hidden border border-zinc-800">
            {/* Decorative background blur */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] pointer-events-none -mt-10 -mr-10"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none -mb-10 -ml-10"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner backdrop-blur-md">
                <CreditCard className="w-8 h-8 text-yellow-300 drop-shadow-md" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-400 font-extrabold tracking-[0.2em] uppercase block drop-shadow">
                  {language === 'en' ? 'Total Wallet Balance' : 'মোট ওয়ালেট ব্যালেন্স'}
                </span>
                <div className="text-4xl sm:text-6xl font-black text-white font-sans leading-none tracking-tight drop-shadow-lg">
                  <span className="text-emerald-400 font-light mr-1">$</span>{user.balance.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Action buttons on the right side of balance */}
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <button 
                type="button"
                onClick={() => setActiveTab('Add Credit')}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase px-6 py-4 rounded-xl tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 border border-emerald-400/50 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                {language === 'en' ? 'ADD CREDIT' : 'টাকা যোগ করুন'}
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('Bank Withdraw')}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm font-black text-xs uppercase px-6 py-4 rounded-xl tracking-widest transition-all flex items-center gap-2 shadow-lg active:scale-95 cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-400 stroke-[3]" />
                {language === 'en' ? 'WITHDRAW' : 'উত্তোলন করুন'}
              </button>
            </div>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-[24px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-extrabold tracking-wider uppercase block">
                  {language === 'en' ? 'Commission Balance' : 'কমিশন ব্যালেন্স'}
                </span>
                <div className="text-2xl font-black text-zinc-900 dark:text-white font-sans leading-none">
                  $ {(user.commissionBalance || 0).toFixed(2)}
                </div>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setActiveTab('Add Commission')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase px-5 py-3 rounded-xl tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              {language === 'en' ? 'DEPOSIT COMMISSION' : 'কমিশন ডিপোজিট করুন'}
            </button>
          </div>
        </div>

        {/* Divider line across layout */}
        <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-10" />

        {/* Vertical Tab + View Contents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Sidebar Tabs (12 Tabs matching Image 3) */}
          <div className="lg:col-span-3 border-r-0 lg:border-r border-zinc-200 lg:pr-8 space-y-1 text-left dark:border-zinc-800">
            {menuItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.label);
                    setIsEditingPersonal(false);
                    setIsEditingContact(false);
                    setIsEditingAddress(false);
                  }}
                  className={`w-full text-left py-3.5 px-4 rounded-xl text-xs uppercase tracking-wide font-extrabold flex items-center justify-between transition-all select-none border-l-4 cursor-pointer ${
                    isActive
                      ? 'border-[#E52535] bg-zinc-100/70 dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-sm'
                      : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#E52535]' : 'text-zinc-400'}`} />
                    <span>{getTabLabel(item.label, language)}</span>
                  </div>

                  {/* Badges indicators for active components */}
                  {item.label === 'My Tickets' && userTickets.length > 0 && (
                    <span className="bg-[#E52535] text-white text-[9px] font-black tracking-normal px-2 py-0.5 rounded-full">
                      {userTickets.length}
                    </span>
                  )}
                  {item.label === 'Inbox' && (
                    <span className="bg-[#E52535] text-white text-[9px] font-black tracking-normal px-2 py-0.5 rounded-full">
                      2
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT COLUMN: View Contents */}
          <div className="lg:col-span-9 min-h-[460px]">
            
            {/* TAB: Our Games */}
            {activeTab === 'Our Games' && (
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-zinc-900 dark:text-zinc-100">
                <h2 className="text-2xl font-black mb-1">{language === 'en' ? 'Our Games' : 'আমাদের গেম'}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">{language === 'en' ? 'List of all live drawing systems, raffles and instant games' : 'সব লাইভ ড্রয়িং সিস্টেম, র‌্যাফেল এবং ইনস্ট্যান্ট গেমের তালিকা'}</p>
                
                <div className="space-y-8">
                  {/* Category: Life Changing Games */}
                  <div>
                    <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      {t('thai_lottery', language)}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'MEGA7', link: '/games/MEGA7', price: '15', desc: 'Life-changing draw rewards' },
                        { name: 'WILD5', link: '/games/WILD5', price: '10', desc: 'Match 5 high-potential draw' },
                        { name: 'EASY6', link: '/games/EASY6', price: '6', desc: 'Easy entry, higher odds' },
                        { name: 'FAST5', link: '/games/FAST5', price: '8', desc: 'Instant results draw' },
                        { name: 'LOTTERY', link: '/games/LOTTERY', price: '5', desc: 'Standard ticket draw' },
                        { name: 'SCRATCH CARDS', link: '/games/SCRATCH%20CARDS', price: '5', desc: 'Instantly reveal lucky prizes' },
                      ].map((item) => (
                        <div key={item.name} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-red-500 dark:hover:border-red-500 transition-all bg-zinc-50/50 dark:bg-zinc-900/40">
                          <div>
                            <span className="text-xs font-black tracking-wide text-zinc-500 dark:text-zinc-400 block mb-1">GOLOBAL</span>
                            <h4 className="text-base font-black text-zinc-900 dark:text-white">{item.name}</h4>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-tight">{item.desc}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">${item.price} <span className="text-[9px] text-zinc-400">/ Ticket</span></span>
                            <Link to={item.link} className="px-3 py-1.5 bg-[#0F0D24] hover:bg-[#E52535] text-white text-[9px] font-black uppercase rounded-lg tracking-wider transition-all">
                              {language === 'en' ? 'PLAY' : 'খেলুন'}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category: Raffle Draws */}
                  <div>
                    <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      {t('raffles', language)}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'SURE 1', link: '/raffles/sure1', price: '10', desc: 'Guaranteed raffle slot 1' },
                        { name: 'SURE 2', link: '/raffles/sure2', price: '15', desc: 'Guaranteed raffle slot 2' },
                        { name: 'SURE 3', link: '/raffles/sure3', price: '30', desc: 'Grand super guaranteed raffle' },
                      ].map((item) => (
                        <div key={item.name} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-pink-500 dark:hover:border-pink-500 transition-all bg-zinc-50/50 dark:bg-zinc-900/40">
                          <div>
                            <span className="text-xs font-black tracking-wide text-zinc-500 dark:text-zinc-400 block mb-1">RAFFLE</span>
                            <h4 className="text-base font-black text-zinc-900 dark:text-white">{item.name}</h4>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-tight">{item.desc}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">${item.price} <span className="text-[9px] text-zinc-400">/ Ticket</span></span>
                            <Link to={item.link} className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-[9px] font-black uppercase rounded-lg tracking-wider transition-all">
                              {language === 'en' ? 'PLAY' : 'খেলুন'}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category: Rush Draws */}
                  <div>
                    <h3 className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                      {t('rush_draws', language)}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'PICK 1', link: '/rush/pick1', price: '3', desc: 'Fast pick 1 draw' },
                        { name: 'PICK 2', link: '/rush/pick2', price: '4', desc: 'Fast pick 2 draw' },
                      ].map((item) => (
                        <div key={item.name} className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between hover:border-orange-500 dark:hover:border-orange-500 transition-all bg-zinc-50/50 dark:bg-zinc-900/40">
                          <div>
                            <span className="text-xs font-black tracking-wide text-zinc-500 dark:text-zinc-400 block mb-1">RUSH</span>
                            <h4 className="text-base font-black text-zinc-900 dark:text-white">{item.name}</h4>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-tight">{item.desc}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">${item.price} <span className="text-[9px] text-zinc-400">/ Ticket</span></span>
                            <Link to={item.link} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[9px] font-black uppercase rounded-lg tracking-wider transition-all">
                              {language === 'en' ? 'PLAY' : 'খেলুন'}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'Personal Details' && (
              <div className="space-y-6">
                
                {/* Panel 1: Personal Information */}
                <div className="bg-[#F8F9FA] border border-zinc-200/50 rounded-2xl p-6 relative">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      Personal Information
                    </h3>
                    {!isEditingPersonal && (
                      <button 
                        onClick={() => setIsEditingPersonal(true)}
                        className="text-zinc-400 hover:text-[#E52535] p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-zinc-200 shadow-sm"
                        title="Edit Personal Information"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isEditingPersonal ? (
                    <form onSubmit={savePersonalInfo} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Full Name</label>
                            <input 
                              type="text" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                              required
                            />
                        </div>
                        <div className="col-span-1 sm:col-span-2 mb-2">
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-3">Profile Avatar</label>
                          <div className="flex flex-wrap gap-4 items-center">
                            {/* Preset Avatars */}
                            {[
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver&backgroundColor=c0aede',
                              'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=d1d4f9',
                              'https://api.dicebear.com/7.x/bottts/svg?seed=Robot1&backgroundColor=f4d160',
                            ].map((url) => (
                              <button
                                key={url}
                                type="button"
                                onClick={() => setEditProfileImage(url)}
                                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${editProfileImage === url ? 'border-[#E52535] scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                              >
                                <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                          
                          <div className="mt-4">
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Or paste custom image URL</label>
                            <input 
                              type="text" 
                              value={editProfileImage}
                              onChange={(e) => setEditProfileImage(e.target.value)}
                              className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                              placeholder="https://example.com/logo.png"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Nationality</label>
                          <input 
                            type="text" 
                            value={editNationality}
                            onChange={(e) => setEditNationality(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Date of Birth</label>
                          <input 
                            type="text" 
                            value={editDob}
                            onChange={(e) => setEditDob(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            placeholder="DD/MM/YYYY"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Gender</label>
                          <select 
                            value={editGender}
                            onChange={(e) => setEditGender(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Employer</label>
                          <input 
                            type="text" 
                            value={editEmployer}
                            onChange={(e) => setEditEmployer(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Region</label>
                          <input 
                            type="text" 
                            value={editRegion}
                            onChange={(e) => setEditRegion(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">NID Card Number</label>
                          <input 
                            type="text" 
                            value={editNid}
                            onChange={(e) => setEditNid(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            placeholder="e.g. 55248963251"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Passport Number</label>
                          <input 
                            type="text" 
                            value={editPassport}
                            onChange={(e) => setEditPassport(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            placeholder="e.g. A0458923"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-4">
                        <button type="submit" className="bg-[#E52535] hover:bg-red-700 text-white font-black px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
                          Save Changes
                        </button>
                        <button type="button" onClick={() => setIsEditingPersonal(false)} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-extrabold px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4 text-xs font-semibold">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Full Name</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{user.name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Profile Logo</span>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-200 mt-1">
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#E9E4FA] text-[#6944BA] flex items-center justify-center font-black text-xs">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Nationality</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{user.country}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Date of Birth</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{user.dob}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Gender</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{gender}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Employer</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{employer}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Region</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{region}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">NID Card Number</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{user.nidNumber || 'Not set (Click edit to add)'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Passport Number</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{user.passportNumber || 'Not set (Click edit to add)'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Panel 2: Contact Information */}
                <div className="bg-[#F8F9FA] border border-zinc-200/50 rounded-2xl p-6 relative">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      Contact Information
                    </h3>
                    {!isEditingContact && (
                      <button 
                        onClick={() => setIsEditingContact(true)}
                        className="text-zinc-400 hover:text-[#E52535] p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-zinc-200 shadow-sm"
                        title="Edit Contact Information"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isEditingContact ? (
                    <form onSubmit={saveContactInfo} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Phone Number</label>
                          <input 
                            type="text" 
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-4">
                        <button type="submit" className="bg-[#E52535] hover:bg-red-700 text-white font-black px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
                          Save Changes
                        </button>
                        <button type="button" onClick={() => setIsEditingContact(false)} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-extrabold px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4 text-xs font-semibold">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Email</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{user.email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Phone Number</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Panel 3: Address Information */}
                <div className="bg-[#F8F9FA] border border-zinc-200/50 rounded-2xl p-6 relative">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      Address Information
                    </h3>
                    {!isEditingAddress && (
                      <button 
                        onClick={() => setIsEditingAddress(true)}
                        className="text-zinc-400 hover:text-[#E52535] p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-zinc-200 shadow-sm"
                        title="Edit Address Details"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isEditingAddress ? (
                    <form onSubmit={saveAddressInfo} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Address (Line 1)</label>
                          <input 
                            type="text" 
                            value={editAddress1}
                            onChange={(e) => setEditAddress1(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Address (Line 2)</label>
                          <input 
                            type="text" 
                            value={editAddress2}
                            onChange={(e) => setEditAddress2(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">City</label>
                          <input 
                            type="text" 
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Country of Residence</label>
                          <input 
                            type="text" 
                            value={editCountry}
                            onChange={(e) => setEditCountry(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Zip / Post Code</label>
                          <input 
                            type="text" 
                            value={editZipcode}
                            onChange={(e) => setEditZipcode(e.target.value)}
                            className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-4">
                        <button type="submit" className="bg-[#E52535] hover:bg-red-700 text-white font-black px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
                          Save Changes
                        </button>
                        <button type="button" onClick={() => setIsEditingAddress(false)} className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-extrabold px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4 text-xs font-semibold">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Address (Line 1)</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{address1}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Address (Line 2)</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{address2 || ' '}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">City</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{city}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Country of Residence</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{user.country}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Zip / Post Code</span>
                        <p className="text-[#0F0D24] font-bold text-[13px]">{zipcode || ' '}</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: Add Credit */}
            {activeTab === 'Add Credit' && (
              <div className="space-y-6">
                <div className="bg-[#F8F9FA] border border-zinc-200/50 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">
                    Add Credit Gateway
                  </h3>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                        Select Top-Up Amount ($)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {['20', '50', '100', '250', '500'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setDepositAmount(val)}
                            className={`py-3.5 text-center font-bold text-xs rounded-xl border transition-all ${
                              depositAmount === val
                                ? 'bg-[#0F0D24] border-[#0F0D24] text-white shadow'
                                : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                            }`}
                          >
                            ${val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                        Or enter custom amount ($)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2 mt-4">
                        Select Top-Up Method
                      </label>
                      <div className="grid grid-cols-3 gap-2.5 mb-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDepositMethod('card')}
                          className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                            selectedDepositMethod === 'card'
                              ? 'bg-[#0F0D24] border-[#0F0D24] text-white shadow'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          💳 Manual Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDepositMethod('agent')}
                          className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                            selectedDepositMethod === 'agent'
                              ? 'bg-[#0F0D24] border-[#0F0D24] text-white shadow'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          👥 Local Agent
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDepositMethod('crypto')}
                          className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                            selectedDepositMethod === 'crypto'
                              ? 'bg-[#0F0D24] border-[#0F0D24] text-white shadow'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          🪙 Crypto Pay
                        </button>
                      </div>
                    </div>

                    {(selectedDepositMethod === 'card' || selectedDepositMethod === 'crypto') ? (
                      <div className="animate-fade-in space-y-5">
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                          <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Secure Payment Gateways
                          </h4>
                          <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                            {language === 'en' 
                              ? 'Follow the instructions for your selected gateway below. After sending funds, enter your Transaction ID (TrxID) for instant credit approval.' 
                              : 'আপনার পছন্দের গেটওয়ে সিলেক্ট করে নির্দেশনা অনুযায়ী টাকা পাঠান। পাঠানোর পর ট্রানজেকশন আইডি (TrxID) ইনপুট দিয়ে সাবমিট করুন।'}
                          </p>
                        </div>

                        <div className="space-y-4">
                          {(siteConfig.paymentGateways || [])
                            .filter(g => g.enabled && (g.type === 'deposit' || g.type === 'both'))
                            .filter(g => selectedDepositMethod === 'crypto' ? (g.name.includes('USDT') || g.name.includes('Crypto')) : (!g.name.includes('USDT') && !g.name.includes('Crypto')))
                            .map((gateway) => (
                              <div key={gateway.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Payment Method</span>
                                    <h5 className="font-black text-zinc-950 uppercase text-sm">{gateway.name}</h5>
                                  </div>
                                  <div className="text-right">
                                    <span className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest border border-zinc-200">
                                      MIN: ${gateway.minAmount || 10}
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-zinc-50 border border-dashed border-zinc-300 p-4 rounded-xl text-center mb-4">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Send Funds To:</span>
                                  <p className="font-mono text-lg font-black text-zinc-900 break-all select-all">{gateway.numberOrAddress}</p>
                                </div>

                                <div className="space-y-4">
                                  <div className="text-[11px] text-zinc-600 font-medium bg-zinc-50/50 p-3 rounded-lg border border-zinc-100 italic">
                                    " {gateway.instructions} "
                                  </div>

                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      placeholder="Transaction ID / TrxID"
                                      className="flex-1 bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 font-mono"
                                      id={`dep-trx-${gateway.id}`}
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const input = document.getElementById(`dep-trx-${gateway.id}`) as HTMLInputElement;
                                        if (!input?.value) return alert("Please enter Transaction ID");
                                        setAgentDepositReference(input.value);
                                        setAgentDepositChannel(gateway.name as any);
                                        handleAgentDepositSubmit();
                                      }}
                                      className="bg-[#E52535] hover:bg-red-700 text-white font-black text-[10px] px-5 rounded-xl uppercase tracking-widest transition-all shadow-sm"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Agent Info Instructions Card */}
                        <div className="bg-[#EBF5FF] border border-blue-200 p-4 rounded-xl text-blue-900 text-xs leading-relaxed">
                          <p className="font-bold uppercase tracking-wider mb-1 text-blue-950 flex items-center gap-1">
                            ℹ️ CONNECT WITH OUR AUTHORIZED LOCAL AGENTS
                          </p>
                          <p>{siteConfig.agentInstructions || 'You can deposit, withdraw or pay commission directly through our authorized local agents via WhatsApp, IMO or Telegram. Click any agent button below to initiate an instant chat. After transferring the money, please provide the details below.'}</p>
                        </div>

                        {/* Social Agents Contact buttons row */}
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                            1. Select Agent Social Platform to Chat:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              type="button"
                              onClick={(e) => handleAgentClick('WhatsApp', e)}
                              className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                            >
                              <svg className="w-5 h-5 text-white fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.023-5.11-2.885-6.974C16.526 1.809 14.048.784 11.41.784c-5.439 0-9.865 4.42-9.869 9.858-.002 1.718.452 3.393 1.312 4.881L1.87 21.082l5.777-1.513c-1.428.877-2.228 1.341-1.002.585zM17.47 16.924c-.322-.162-1.905-.94-2.202-1.047-.297-.108-.514-.162-.73.162-.217.324-.838 1.048-1.027 1.265-.19.217-.378.243-.7.08-.323-.162-1.36-.5-2.593-1.6c-.96-.855-1.608-1.91-1.796-2.23-.19-.323-.02-.497.14-.658.146-.145.324-.378.486-.567.163-.189.216-.324.324-.54.109-.217.054-.405-.027-.567-.08-.162-.73-1.756-1-2.404-.263-.633-.53-.548-.73-.558-.189-.01-.405-.01-.622-.01-.216 0-.568.08-.865.405-.297.324-1.135 1.108-1.135 2.703 0 1.594 1.162 3.134 1.324 3.35.162.216 2.287 3.493 5.54 4.896.774.333 1.38.532 1.85.682.778.247 1.487.212 2.047.129.624-.093 1.905-.779 2.176-1.495.27-.716.27-1.33.19-1.46-.082-.13-.298-.21-.62-.372z" />
                              </svg>
                              WHATSAPP AGENT
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleAgentClick('IMO', e)}
                              className="flex items-center justify-center gap-2.5 bg-[#00A0E9] hover:bg-[#008ccd] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                            >
                              <span className="w-5 h-5 bg-white text-[#00A0E9] rounded-full text-[9px] font-black font-sans shrink-0 flex items-center justify-center border border-white leading-none">
                                imo
                              </span>
                              IMO AGENT
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleAgentClick('Telegram', e)}
                              className="flex items-center justify-center gap-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                            >
                              <svg className="w-5 h-5 text-white fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M11.944 0C5.344 0 0 5.344 0 12c0 6.656 5.344 12 11.944 12 6.656 0 12-5.344 12-12 0-6.656-5.344-12-12-12zm5.813 8.219l-1.938 9.156c-.144.644-.525.8-.144.8l-2.956-2.181-1.425 1.375c-.156.156-.287.287-.587.287l.213-3.012 5.488-4.962c.238-.212-.05-.331-.369-.119L9.25 14.1l-2.919-.912c-.637-.2-1.25-.3-1.25-.8 0-.469.744-.7 1.25-.881l11.394-4.394c.525-.187 1.012-.081 1.012.306 0 .156-.025.331-.081.419z" />
                              </svg>
                              TELEGRAM AGENT
                            </button>
                          </div>
                        </div>

                        {/* Submission details block */}
                        <div className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-4 shadow-inner">
                          <p className="text-xs font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-100 pb-2">
                            2. Submit Agent Transaction Details for Approval
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                                Connected Agent Channel
                              </label>
                              <select
                                value={agentDepositChannel}
                                onChange={(e) => setAgentDepositChannel(e.target.value as any)}
                                className="w-full bg-zinc-50 border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900"
                              >
                                <option value="WhatsApp">WhatsApp Agent</option>
                                <option value="IMO">IMO Agent</option>
                                <option value="Telegram">Telegram Agent</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                                Transaction ID / Sender Contact (imo/wa/tg)
                              </label>
                              <input
                                type="text"
                                placeholder=""
                                value={agentDepositReference}
                                onChange={(e) => setAgentDepositReference(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 font-mono text-zinc-900"
                                required={selectedDepositMethod === 'agent'}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleAgentDepositSubmit}
                            className="w-full bg-[#0F0D24] hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-md transition-all active:scale-95 mt-2"
                          >
                            SUBMIT AGENT DEPOSIT REQUEST
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* TAB: Add Commission */}
            {activeTab === 'Bank Withdraw' && (
              <div className="space-y-6">
                <div className="bg-[#F8F9FA] border border-zinc-200/50 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-2">Request Bank Withdrawal</h3>
                  <p className="text-sm text-zinc-500 font-medium mb-6">Withdraw your available balance directly to your bank account. Note: A 10% government commission fee applies and will be deducted from your Commission Balance.</p>
                  
                  <div className="mb-4">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                      Select Withdrawal Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedWithdrawMethod('bank')}
                        className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'bank'
                            ? 'bg-[#0F0D24] border-[#0F0D24] text-white shadow'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        🏦 Bank Wire
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedWithdrawMethod('agent')}
                        className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'agent'
                            ? 'bg-[#0F0D24] border-[#0F0D24] text-white shadow'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        👥 Local Agent
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedWithdrawMethod('gateway')}
                        className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'gateway'
                            ? 'bg-[#0F0D24] border-[#0F0D24] text-white shadow'
                            : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        💳 Local Wallet
                      </button>
                    </div>
                  </div>
                  
                  {selectedWithdrawMethod === 'gateway' ? (
                    <div className="animate-fade-in space-y-6">
                      <div className="grid grid-cols-1 gap-4">
                        {(siteConfig.paymentGateways || []).filter(g => g.enabled && (g.type === 'withdrawal' || g.type === 'both')).map((gateway) => (
                          <div key={gateway.id} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-black text-zinc-950 uppercase text-sm">{gateway.name} Withdrawal</h5>
                              <span className="text-[9px] font-black bg-zinc-100 px-2 py-1 rounded text-zinc-500 uppercase tracking-widest">Local Payout</span>
                            </div>

                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const amount = (e.target as any).amount.value;
                                const wallet = (e.target as any).wallet.value;
                                if (parseFloat(amount) < (gateway.minAmount || 10)) return alert(`Minimum withdrawal for ${gateway.name} is $${gateway.minAmount || 10}`);
                                if (!wallet) return alert(`Please enter your ${gateway.name} account number`);
                                setBankWithdrawAmount(amount);
                                setBankWithdrawIban(wallet);
                                setBankWithdrawName(gateway.name);
                                handleBankWithdrawSubmit(e);
                              }}
                              className="space-y-4"
                            >
                              <div>
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Amount to Withdraw ($)</label>
                                <input 
                                  name="amount"
                                  type="number" 
                                  className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-lg font-bold outline-none focus:border-zinc-950 transition-colors text-zinc-900"
                                  placeholder="0.00"
                                  required
                                  min={gateway.minAmount || 10}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Your {gateway.name} Number / Address</label>
                                <input 
                                  name="wallet"
                                  type="text" 
                                  className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm font-mono outline-none focus:border-zinc-950 transition-colors text-zinc-900"
                                  placeholder="Enter your receiving wallet details"
                                  required
                                />
                              </div>
                              <button
                                type="submit"
                                className="w-full bg-zinc-900 hover:bg-black text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl shadow-md transition-all active:scale-95"
                              >
                                Request {gateway.name} Withdrawal
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : selectedWithdrawMethod === 'bank' ? (
                    <form onSubmit={handleBankWithdrawSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Withdrawal Amount ($)</label>
                        <input 
                          type="number" 
                          value={bankWithdrawAmount}
                          onChange={(e) => setBankWithdrawAmount(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-lg font-bold outline-none focus:border-zinc-900 transition-colors text-zinc-900"
                          placeholder=""
                          required={selectedWithdrawMethod === 'bank'}
                          min="81967.21"
                          step="0.01"
                        />
                        <p className="text-[10px] text-zinc-400 font-medium mt-1">Minimum withdrawal amount: $81,967.21</p>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Bank Name</label>
                        <input 
                          type="text" 
                          value={bankWithdrawName}
                          onChange={(e) => setBankWithdrawName(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 transition-colors text-zinc-900"
                          placeholder=""
                          required={selectedWithdrawMethod === 'bank'}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Account Number</label>
                        <input 
                          type="text" 
                          value={bankWithdrawIban}
                          onChange={(e) => setBankWithdrawIban(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm font-mono outline-none focus:border-zinc-900 transition-colors tracking-widest text-zinc-900"
                          placeholder=""
                          required={selectedWithdrawMethod === 'bank'}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Branch Name</label>
                        <input 
                          type="text" 
                          value={bankWithdrawBranch}
                          onChange={(e) => setBankWithdrawBranch(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 transition-colors text-zinc-900"
                          placeholder=""
                          required={selectedWithdrawMethod === 'bank'}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-md transition-all active:scale-95 mt-4"
                      >
                        CONFIRM WITHDRAWAL
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleAgentWithdrawSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-zinc-200/60 shadow-sm">
                      {/* Agent Info Instructions Card */}
                      <div className="bg-[#EBF5FF] border border-blue-200 p-4 rounded-xl text-blue-900 text-xs leading-relaxed">
                        <p className="font-bold uppercase tracking-wider mb-1 text-blue-950 flex items-center gap-1">
                          ℹ️ CASH OUT VIA AUTHORIZED LOCAL AGENTS
                        </p>
                        <p>{siteConfig.agentInstructions || 'You can deposit, withdraw or pay commission directly through our authorized local agents via WhatsApp, IMO or Telegram. Click any agent button below to initiate an instant chat. After transferring the money, please provide the details below.'}</p>
                      </div>

                      {/* Social Agents Contact buttons row */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                          1. Click below to contact an Authorized Agent:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <button
                            type="button"
                            onClick={(e) => handleAgentClick('WhatsApp', e)}
                            className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                          >
                            <svg className="w-5 h-5 text-white fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.023-5.11-2.885-6.974C16.526 1.809 14.048.784 11.41.784c-5.439 0-9.865 4.42-9.869 9.858-.002 1.718.452 3.393 1.312 4.881L1.87 21.082l5.777-1.513c-1.428.877-2.228 1.341-1.002.585zM17.47 16.924c-.322-.162-1.905-.94-2.202-1.047-.297-.108-.514-.162-.73.162-.217.324-.838 1.048-1.027 1.265-.19.217-.378.243-.7.08-.323-.162-1.36-.5-2.593-1.6c-.96-.855-1.608-1.91-1.796-2.23-.19-.323-.02-.497.14-.658.146-.145.324-.378.486-.567.163-.189.216-.324.324-.54.109-.217.054-.405-.027-.567-.08-.162-.73-1.756-1-2.404-.263-.633-.53-.548-.73-.558-.189-.01-.405-.01-.622-.01-.216 0-.568.08-.865.405-.297.324-1.135 1.108-1.135 2.703 0 1.594 1.162 3.134 1.324 3.35.162.216 2.287 3.493 5.54 4.896.774.333 1.38.532 1.85.682.778.247 1.487.212 2.047.129.624-.093 1.905-.779 2.176-1.495.27-.716.27-1.33.19-1.46-.082-.13-.298-.21-.62-.372z" />
                            </svg>
                            WHATSAPP AGENT
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAgentClick('IMO', e)}
                            className="flex items-center justify-center gap-2.5 bg-[#00A0E9] hover:bg-[#008ccd] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                          >
                            <span className="w-5 h-5 bg-white text-[#00A0E9] rounded-full text-[9px] font-black font-sans shrink-0 flex items-center justify-center border border-white leading-none">
                              imo
                            </span>
                            IMO AGENT
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAgentClick('Telegram', e)}
                            className="flex items-center justify-center gap-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                          >
                            <svg className="w-5 h-5 text-white fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M11.944 0C5.344 0 0 5.344 0 12c0 6.656 5.344 12 11.944 12 6.656 0 12-5.344 12-12 0-6.656-5.344-12-12-12zm5.813 8.219l-1.938 9.156c-.144.644-.525.8-.144.8l-2.956-2.181-1.425 1.375c-.156.156-.287.287-.587.287l.213-3.012 5.488-4.962c.238-.212-.05-.331-.369-.119L9.25 14.1l-2.919-.912c-.637-.2-1.25-.3-1.25-.8 0-.469.744-.7 1.25-.881l11.394-4.394c.525-.187 1.012-.081 1.012.306 0 .156-.025.331-.081.419z" />
                            </svg>
                            TELEGRAM AGENT
                          </button>
                        </div>
                      </div>

                      {/* Withdrawal form items */}
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Withdrawal Amount ($)</label>
                          <input 
                            type="number" 
                            value={bankWithdrawAmount}
                            onChange={(e) => setBankWithdrawAmount(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-lg font-bold outline-none focus:border-zinc-900 transition-colors text-zinc-900"
                            placeholder=""
                            required={selectedWithdrawMethod === 'agent'}
                            min="81967.21"
                            step="0.01"
                          />
                          <p className="text-[10px] text-zinc-400 font-medium mt-1">Minimum withdrawal amount: $81,967.21</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                              Agent Channel Connected
                            </label>
                            <select
                              value={agentWithdrawChannel}
                              onChange={(e) => setAgentWithdrawChannel(e.target.value as any)}
                              className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-900 text-zinc-900"
                            >
                              <option value="WhatsApp">WhatsApp Agent</option>
                              <option value="IMO">IMO Agent</option>
                              <option value="Telegram">Telegram Agent</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                              Your Social Account Username / Number
                            </label>
                            <input
                              type="text"
                              placeholder=""
                              value={agentWithdrawReference}
                              onChange={(e) => setAgentWithdrawReference(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-900 font-mono text-zinc-900"
                              required={selectedWithdrawMethod === 'agent'}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-md transition-all active:scale-95 mt-4"
                        >
                          SUBMIT AGENT WITHDRAWAL REQUEST
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Add Commission */}
            {activeTab === 'Add Commission' && (
              <div className="space-y-6">
                <div className="bg-[#F8F9FA] border border-emerald-200/50 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest mb-6">
                    Commission Deposit Gateway
                  </h3>

                  <form onSubmit={handleCommissionDepositSubmit} className="space-y-6">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                        Select Commission Amount ($)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {['1500', '3500', '5000', '8500', '10000'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setCommissionDepositAmount(val)}
                            className={`py-3.5 text-center font-bold text-xs rounded-xl border transition-all ${
                              commissionDepositAmount === val
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                                : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                            }`}
                          >
                            ${val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                        Or enter custom amount ($)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={commissionDepositAmount}
                        onChange={(e) => setCommissionDepositAmount(e.target.value)}
                        className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2 mt-4">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-3 gap-3 mb-2">
                        <button
                          type="button"
                          onClick={() => setSelectedCommissionMethod('card')}
                          className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                            selectedCommissionMethod === 'card'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          💳 Manual Pay
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCommissionMethod('agent')}
                          className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                            selectedCommissionMethod === 'agent'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          👥 Local Agent
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedCommissionMethod('gateway')}
                          className={`py-3 text-center font-bold text-[10px] rounded-xl border transition-all uppercase tracking-wider ${
                            selectedCommissionMethod === 'gateway'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow'
                              : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          🪙 Crypto Pay
                        </button>
                      </div>
                    </div>

                    {(selectedCommissionMethod === 'card' || selectedCommissionMethod === 'gateway') ? (
                      <div className="animate-fade-in space-y-5">
                         <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                          <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Secure Payment Gateways
                          </h4>
                          <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                            Follow the instructions for your selected gateway below. After sending funds, enter your Transaction ID (TrxID) for instant commission approval.
                          </p>
                        </div>

                        <div className="space-y-4">
                          {(siteConfig.paymentGateways || [])
                            .filter(g => g.enabled && (g.type === 'deposit' || g.type === 'both'))
                            .filter(g => selectedCommissionMethod === 'gateway' ? (g.name.includes('USDT') || g.name.includes('Crypto')) : (!g.name.includes('USDT') && !g.name.includes('Crypto')))
                            .map((gateway) => (
                              <div key={gateway.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Payment Method</span>
                                    <h5 className="font-black text-zinc-950 uppercase text-sm">{gateway.name}</h5>
                                  </div>
                                  <div className="text-right">
                                    <span className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest border border-zinc-200">
                                      MIN: ${gateway.minAmount || 10}
                                    </span>
                                  </div>
                                </div>

                                <div className="bg-zinc-50 border border-dashed border-zinc-300 p-4 rounded-xl text-center mb-4">
                                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Send Funds To:</span>
                                  <p className="font-mono text-lg font-black text-zinc-900 break-all select-all">{gateway.numberOrAddress}</p>
                                </div>

                                <div className="space-y-4">
                                  <div className="text-[11px] text-zinc-600 font-medium bg-zinc-50/50 p-3 rounded-lg border border-zinc-100 italic">
                                    " {gateway.instructions} "
                                  </div>

                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      placeholder="Transaction ID / TrxID"
                                      className="flex-1 bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 font-mono"
                                      id={`comm-trx-${gateway.id}`}
                                    />
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const input = document.getElementById(`comm-trx-${gateway.id}`) as HTMLInputElement;
                                        if (!input?.value) return alert("Please enter Transaction ID");
                                        setAgentCommissionReference(input.value);
                                        setAgentCommissionChannel(gateway.name);
                                        handleCommissionDepositSubmit();
                                      }}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-5 rounded-xl uppercase tracking-widest transition-all shadow-sm"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Agent Info Instructions Card */}
                        <div className="bg-[#EBF5FF] border border-blue-200 p-4 rounded-xl text-blue-900 text-xs leading-relaxed">
                          <p className="font-bold uppercase tracking-wider mb-1 text-blue-950 flex items-center gap-1">
                            ℹ️ CONNECT WITH OUR AUTHORIZED LOCAL AGENTS
                          </p>
                          <p>{siteConfig.agentInstructions || 'You can deposit, withdraw or pay commission directly through our authorized local agents via WhatsApp, IMO or Telegram. Click any agent button below to initiate an instant chat. After transferring the money, please provide the details below.'}</p>
                        </div>

                        {/* Social Agents Contact buttons row */}
                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                            1. Select Agent Social Platform to Chat:
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              type="button"
                              onClick={(e) => handleAgentClick('WhatsApp', e)}
                              className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                            >
                              <svg className="w-5 h-5 text-white fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.023-5.11-2.885-6.974C16.526 1.809 14.048.784 11.41.784c-5.439 0-9.865 4.42-9.869 9.858-.002 1.718.452 3.393 1.312 4.881L1.87 21.082l5.777-1.513c-1.428.877-2.228 1.341-1.002.585zM17.47 16.924c-.322-.162-1.905-.94-2.202-1.047-.297-.108-.514-.162-.73.162-.217.324-.838 1.048-1.027 1.265-.19.217-.378.243-.7.08-.323-.162-1.36-.5-2.593-1.6c-.96-.855-1.608-1.91-1.796-2.23-.19-.323-.02-.497.14-.658.146-.145.324-.378.486-.567.163-.189.216-.324.324-.54.109-.217.054-.405-.027-.567-.08-.162-.73-1.756-1-2.404-.263-.633-.53-.548-.73-.558-.189-.01-.405-.01-.622-.01-.216 0-.568.08-.865.405-.297.324-1.135 1.108-1.135 2.703 0 1.594 1.162 3.134 1.324 3.35.162.216 2.287 3.493 5.54 4.896.774.333 1.38.532 1.85.682.778.247 1.487.212 2.047.129.624-.093 1.905-.779 2.176-1.495.27-.716.27-1.33.19-1.46-.082-.13-.298-.21-.62-.372z" />
                              </svg>
                              WHATSAPP AGENT
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleAgentClick('IMO', e)}
                              className="flex items-center justify-center gap-2.5 bg-[#00A0E9] hover:bg-[#008ccd] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                            >
                              <span className="w-5 h-5 bg-white text-[#00A0E9] rounded-full text-[9px] font-black font-sans shrink-0 flex items-center justify-center border border-white leading-none">
                                imo
                              </span>
                              IMO AGENT
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleAgentClick('Telegram', e)}
                              className="flex items-center justify-center gap-2.5 bg-[#0088cc] hover:bg-[#0077b3] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
                            >
                              <svg className="w-5 h-5 text-white fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M11.944 0C5.344 0 0 5.344 0 12c0 6.656 5.344 12 11.944 12 6.656 0 12-5.344 12-12 0-6.656-5.344-12-12-12zm5.813 8.219l-1.938 9.156c-.144.644-.525.8-.144.8l-2.956-2.181-1.425 1.375c-.156.156-.287.287-.587.287l.213-3.012 5.488-4.962c.238-.212-.05-.331-.369-.119L9.25 14.1l-2.919-.912c-.637-.2-1.25-.3-1.25-.8 0-.469.744-.7 1.25-.881l11.394-4.394c.525-.187 1.012-.081 1.012.306 0 .156-.025.331-.081.419z" />
                              </svg>
                              TELEGRAM AGENT
                            </button>
                          </div>
                        </div>

                        {/* Submission details block */}
                        <div className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-4 shadow-inner">
                          <p className="text-xs font-bold uppercase tracking-widest text-zinc-800 border-b border-zinc-100 pb-2">
                            2. Submit Commission Reference for Verification
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                                Connected Agent Channel
                              </label>
                              <select
                                value={agentCommissionChannel}
                                onChange={(e) => setAgentCommissionChannel(e.target.value as any)}
                                className="w-full bg-zinc-50 border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900"
                              >
                                <option value="WhatsApp">WhatsApp Agent</option>
                                <option value="IMO">IMO Agent</option>
                                <option value="Telegram">Telegram Agent</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                                Transaction ID / Sender Contact (imo/wa/tg)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. IMO-01726XXXXX or TxnID"
                                value={agentCommissionReference}
                                onChange={(e) => setAgentCommissionReference(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 font-mono text-zinc-900"
                                required={selectedCommissionMethod === 'agent'}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleAgentCommissionSubmit}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-md transition-all active:scale-95 mt-2"
                          >
                            SUBMIT AGENT COMMISSION DEPOSIT
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* TAB 5: My Orders */}
            {activeTab === 'My Orders' && (
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200/50 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">
                    Order Invoices History
                  </h3>

                  {userTickets.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 italics font-medium text-xs">
                      No tickets purchased yet. Visit the draws to load dynamic statistics and secure tickets.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userTickets.map((t, index) => (
                        <div key={t.id} className="border border-zinc-200 rounded-xl p-5 hover:bg-zinc-50 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
                            <div>
                              <span className="text-[10.5px] font-black text-[#0F0D24] uppercase block tracking-wide">
                                Invoice #ED-{t.id.toString().substring(0,6).toUpperCase()}
                              </span>
                              <span className="text-[10px] text-zinc-400 mt-0.5 block">{t.purchaseDate}</span>
                            </div>

                            <div className="text-right sm:text-right space-y-1">
                              <span className="font-mono text-xs font-black text-[#0F0D24] block">${t.price.toFixed(2)}</span>
                              <span className="bg-green-150 bg-green-50 text-green-700 text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded border border-green-200">
                                SUCCESSFUL
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: My Tickets */}
            {activeTab === 'My Tickets' && (
              <div className="space-y-6 select-none">
                <div className="bg-white border border-zinc-250/55 rounded-2xl py-12 px-6 flex items-center justify-center min-h-[300px]">
                  
                  {userTickets.length === 0 ? (
                    /* Centered "You have no tickets yet." message matching screenshot Image 2 exactly */
                    <div className="text-center space-y-5">
                      <p className="text-zinc-500 font-medium text-sm">
                        You have no tickets yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="bg-[#0F0D24] text-white hover:bg-[#1E1A3C] font-black text-xs uppercase px-8 py-3.5 rounded-xl tracking-wider select-none leading-none shadow-md transition-all active:scale-95"
                      >
                        Buy Now
                      </button>
                    </div>
                  ) : (
                    <div className="w-full space-y-4 text-left">
                      <h4 className="text-zinc-400 text-[10px] font-black uppercase tracking-wider mb-2">My Active Purchased Tickets</h4>
                      {userTickets.map((t) => (
                        <div key={t.id} className="p-5 border border-zinc-200 rounded-2xl bg-zinc-50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div className="space-y-2">
                            <span className="bg-zinc-900 text-yellow-300 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase">
                              {t.gameName} DRAW
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {t.numbers.map((num, i) => (
                                <span key={i} className="bg-zinc-950 text-yellow-300 font-mono font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-yellow-300/20">
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            {t.status === 'Pending' && (
                              <span className="bg-amber-100 text-amber-700 text-[9px] font-black tracking-widest px-3 py-1.5 rounded-md border border-amber-200 uppercase">
                                Waiting Draw
                              </span>
                            )}
                            {t.status === 'Won' && (
                              <span className="bg-green-100 text-green-700 text-[9px] font-black tracking-widest px-3 py-1.5 rounded-md border border-green-200 uppercase">
                                WON: {t.payout}
                              </span>
                            )}
                            {t.status === 'Lost' && (
                              <span className="bg-zinc-200 text-zinc-650 text-[9px] font-black tracking-widest px-3 py-1.5 rounded-md uppercase">
                                Claim Finished
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB 7: Transactions */}
            {activeTab === 'Transactions' && (
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200/50 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">
                    Audit Ledger Transactions
                  </h3>

                  <div className="border border-zinc-200 rounded-xl overflow-hidden font-mono text-[11px]">
                    <div className="grid grid-cols-3 bg-zinc-900 text-zinc-400 p-3.5 uppercase font-bold tracking-wider">
                      <span>Description</span>
                      <span className="text-center">Status</span>
                      <span className="text-right">Value</span>
                    </div>

                    <div className="divide-y divide-zinc-150">
                      {/* Real Deposits Ledger */}
                      {depositRequests.filter(d => d.email === user.email).map((dep) => (
                        <div key={dep.id} className="grid grid-cols-3 p-3.5 hover:bg-zinc-55 font-semibold">
                          <span className="text-zinc-800">Deposit: {dep.gateway}</span>
                          <span className="text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              dep.status === 'Approved' ? 'bg-green-50 text-green-600' :
                              dep.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {dep.status}
                            </span>
                          </span>
                          <span className={`text-right ${dep.status === 'Approved' ? 'text-green-600' : 'text-zinc-400'}`}>
                            +${dep.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}

                      {/* Real Withdrawals Ledger */}
                      {withdrawalRequests.filter(w => w.email === user.email).map((wd) => (
                        <div key={wd.id} className="grid grid-cols-3 p-3.5 hover:bg-zinc-55 font-semibold">
                          <span className="text-zinc-800">Withdraw: {wd.bankName}</span>
                          <span className="text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              wd.status === 'Approved' ? 'bg-zinc-100 text-zinc-650' :
                              wd.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                            }`}>
                              {wd.status}
                            </span>
                          </span>
                          <span className="text-right text-red-600">
                            -${wd.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}

                      {userTickets.map((t) => (
                        <div key={t.id} className="grid grid-cols-3 p-3.5 hover:bg-zinc-55 font-semibold">
                          <span className="text-zinc-800">Buy Ticket {t.gameName}</span>
                          <span className="text-center"><span className="bg-zinc-100 text-zinc-650 px-1.5 py-0.5 rounded text-[9px]">DEBITED</span></span>
                          <span className="text-right text-red-650 text-red-600">-${t.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: Communications */}
            {activeTab === 'Communications' && (
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200/50 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">
                    Mail & Draw Subscriptions
                  </h3>
                  <p className="text-zinc-500 text-xs font-semibold leading-relaxed mb-6">
                    Choose which notifications you wish to keep active. Real-time draw verification lists are dispatched automatically once certified.
                  </p>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 bg-zinc-50 border p-4 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comEmail}
                        onChange={(e) => setComEmail(e.target.checked)}
                        className="w-4 h-4 text-red-650 mt-0.5 rounded accent-[#E52535]"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-[#0F0D24] block uppercase">Email Result alerts</span>
                        <p className="text-zinc-400 text-[10.5px] mt-0.5 font-medium">Get lucky tickets payouts verification delivered directly to your register email inbox.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 bg-zinc-50 border p-4 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comSms}
                        onChange={(e) => setComSms(e.target.checked)}
                        className="w-4 h-4 text-red-650 mt-0.5 rounded accent-[#E52535]"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-[#0F0D24] block uppercase">SMS Notification bulletins</span>
                        <p className="text-zinc-400 text-[10.5px] mt-0.5 font-medium">Receive direct SMS notification bulletins moments after the weekly drawing halts.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 bg-zinc-50 border p-4 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comNewsletter}
                        onChange={(e) => setComNewsletter(e.target.checked)}
                        className="w-4 h-4 text-red-650 mt-0.5 rounded accent-[#E52535]"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-[#0F0D24] block uppercase">Golobal Lottery VIP newsletter</span>
                        <p className="text-zinc-400 text-[10.5px] mt-0.5 font-medium">Be the first to know about grand prize resets, promotional voucher rules, and charity reports.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: Account & Security */}
            {activeTab === 'Account & Security' && (
              <div className="space-y-6">
                <div className="bg-[#F8F9FA] border border-zinc-200/50 rounded-2xl p-6 sm:p-8">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-6">Change Security Credentials</h3>
                  
                  <form onSubmit={(e) => { e.preventDefault(); alert("🔐 Security Password updated successfully!"); setOldPassword(''); setNewPassword(''); }} className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="w-full bg-white border border-zinc-350 p-3 pr-10 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-sm font-semibold outline-none focus:border-zinc-900 text-zinc-900"
                        placeholder="Must exceed 8 characters"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#0F0D24] text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-800 transition-all font-sans"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 10: Play Responsibly */}
            {activeTab === 'Play Responsibly' && (
              <div className="space-y-6 text-zinc-800">
                <div className="bg-white border border-zinc-200/50 rounded-2xl p-6 relative">
                  <div className="flex items-center gap-3 mb-4 text-[#E52535]">
                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Responsible Play Council</h3>
                  </div>

                  <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6">
                    Golobal Lottery promotes fun and fair sweepstakes limits. Use our custom scheduler constraints to maintain control over your gameplay.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-zinc-55 border p-4 rounded-xl flex justify-between items-center bg-gray-50">
                      <div>
                        <span className="text-xs font-black block text-[#0F0D24]">Set Weekly Deposit Limit</span>
                        <p className="text-[10px] text-zinc-400 font-medium">Establish a ceiling constraints top-up value across any 7-day loop.</p>
                      </div>
                      <select className="border text-xs font-bold rounded p-1">
                        <option>Unlimited</option>
                        <option>$100 / week</option>
                        <option>$300 / week</option>
                        <option>$500 / week</option>
                      </select>
                    </div>

                    <div className="bg-zinc-55 border p-4 rounded-xl flex justify-between items-center bg-gray-50">
                      <div>
                        <span className="text-xs font-black block text-[#0F0D24]">Cooling-Off Self Exclusion</span>
                        <p className="text-[10px] text-zinc-400 font-medium font-semibold">Self-lock your account from ticketing for specified intervals.</p>
                      </div>
                      <button className="bg-red-50 text-[#E52535] border border-red-200 hover:bg-red-100 font-black text-[9px] uppercase px-3 py-1.5 rounded-lg">
                        LOCK ACCOUNT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 11: Favorites */}
            {activeTab === 'Favorites' && (
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200/50 rounded-2xl p-6">
                  <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest mb-4">Saved Lucky Numbers</h3>
                  <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6">
                    Configure your key choice alignments here. These numbers can be recalled when checking out play slips instantly.
                  </p>

                  <div className="bg-zinc-50 border rounded-2xl p-5 border-dashed border-zinc-300">
                    <span className="text-[10px] text-zinc-400 font-extrabold block mb-2 uppercase select-none">My Super Seven Slips</span>
                    <div className="flex gap-2.5">
                      {[11, 24, 38, 49, 52, 60, 71].map((val) => (
                        <span key={val} className="w-8 h-8 rounded-full bg-zinc-900 text-yellow-300 flex items-center justify-center font-mono font-black text-xs shadow-md">
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 12: Inbox */}
            {activeTab === 'Inbox' && (
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200/50 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">My Board Inbox Message</h3>
                    <span className="text-[9px] font-black uppercase text-[#E52535] tracking-widest bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                      2 Unread
                    </span>
                  </div>

                  <div className="space-y-3.5 select-none">
                    <div className="border border-zinc-200 p-4 rounded-xl shadow-xs bg-zinc-50 border-l-4 border-l-[#E52535]">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-[#0F0D24] block uppercase">Verification Success! ✔</span>
                        <span className="text-[9px] text-zinc-400 font-bold">1 hour ago</span>
                      </div>
                      <p className="text-zinc-500 text-[11px] leading-relaxed mt-1 font-semibold">
                        Your phone number (+8801986259552) was successfully verified. Advanced lucky analysis dashboard access is unlocked!
                      </p>
                    </div>

                    <div className="border border-zinc-200 p-4 rounded-xl shadow-xs bg-zinc-50 border-l-4 border-l-[#E52535]">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-[#0F0D24] block uppercase">Voucher Code active! 🎁</span>
                        <span className="text-[9px] text-zinc-400 font-bold">Yesterday</span>
                      </div>
                      <p className="text-zinc-500 text-[11px] leading-relaxed mt-1 font-semibold">
                        Enjoy a 5% discount on Mega7 slips with discount code: GOLOBALWIN. Enjoy and Win Big!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;
