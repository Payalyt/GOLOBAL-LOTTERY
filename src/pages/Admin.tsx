import React, { useState } from 'react';
import { useAuth, UserProfile, DynamicGame, getGameColor, extractYoutubeId, getYoutubeThumbnail, DailyRaffleWinner, PaymentGateway } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ShieldCheck, Moon, Sun, Users, Radio, History, Newspaper, Plus, DollarSign, Award, Trash2, Sliders, TrendingUp, Coins, Check, Calendar, Ticket, Gift, Edit2, X, Sparkles, Trophy, FileSpreadsheet, FileText, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveBannerImage } from '../components/Hero';
import { ExcelSheet, ExcelColumn } from '../components/ExcelSheet';

const DEFAULT_GAME_PRIZES: Record<string, { label: string; count: number; prize: string }[]> = {
  'MEGA7': [
    { label: 'Match any 7 Numbers', count: 7, prize: '$50,000,000' },
    { label: 'Match any 6 Numbers', count: 6, prize: '$45,000' },
    { label: 'Match any 5 Numbers', count: 5, prize: '$300' },
    { label: 'Match any 4 Numbers', count: 4, prize: '$20' },
    { label: 'Match any 3 Numbers', count: 3, prize: '$3' },
  ],
  'WILD5': [
    { label: 'Match any 5 Numbers', count: 5, prize: '$3,000,000' },
    { label: 'Match any 4 Numbers', count: 4, prize: '$25,000' },
    { label: 'Match any 3 Numbers', count: 3, prize: '$4,000' },
    { label: 'Match any 2 Numbers', count: 2, prize: '$100' },
  ],
  'EASY6': [
    { label: 'Match any 6 Numbers', count: 6, prize: '$4,000,000' },
    { label: 'Match any 5 Numbers', count: 5, prize: '$25,000' },
    { label: 'Match any 4 Numbers', count: 4, prize: '$4,000' },
    { label: 'Match any 3 Numbers', count: 3, prize: '$2' },
  ],
  'FAST5': [
    { label: 'Match any 5 Numbers', count: 5, prize: '$6,000 / Month for 25 Years' },
    { label: 'Match any 4 Numbers', count: 4, prize: '$20,500 Cash' },
    { label: 'Match any 3 Numbers', count: 3, prize: '$2,500 Cash' },
    { label: 'Match any 2 Numbers', count: 2, prize: '$50 Cash' },
  ],
  'SURE 1': [
    { label: 'Match 1 Standard Order', count: 1, prize: '$10,005' },
    { label: 'Exact Match Digit', count: 1, prize: '$1,000 Guaranteed' }
  ],
  'SURE 2': [
    { label: 'Match 2 Standard Order', count: 2, prize: '$25,005' },
    { label: 'Match 1 Digit', count: 1, prize: '$2,500 Cash' }
  ],
  'SURE 3': [
    { label: 'Match All 3 Digits', count: 3, prize: '$50,005 Cash' },
    { label: 'Match Any 2 Digits', count: 2, prize: '$5,000 Cash' },
    { label: 'Match Any 1 Digit', count: 1, prize: '$500 Cash' }
  ],
  'PICK 1': [
    { label: 'Correct Flag Pick', count: 1, prize: '$60,005' },
    { label: 'Consolation Bonus', count: 1, prize: '$1,000 Cash' }
  ],
  'PICK 2': [
    { label: 'Match Both 2 Numbers', count: 2, prize: '$100,005' },
    { label: 'Match 1 Number', count: 1, prize: '$5,000 Cash' }
  ],
  'LOTTERY': [
    { label: 'Match any 6 Numbers', count: 6, prize: '$1,000,005' },
    { label: 'Match any 5 Numbers', count: 5, prize: '$10,005' },
    { label: 'Match any 4 Numbers', count: 4, prize: '$500' },
    { label: 'Match any 3 Numbers', count: 3, prize: '$10' },
  ],
  'SCRATCH CARDS': [
    { label: 'Top Prize', count: 1, prize: '$50,005' },
    { label: 'Instant Bonus', count: 1, prize: '$500' },
  ]
};

const getDefaultPrizesForGame = (gameName: string, ballCount: number, mainPrize: string) => {
  const normalized = gameName.trim().toUpperCase();
  if (DEFAULT_GAME_PRIZES[normalized]) {
    const list = DEFAULT_GAME_PRIZES[normalized].map(p => ({ ...p }));
    if (list.length > 0 && mainPrize) {
      list[0].prize = mainPrize;
    }
    return list;
  }
  const list = [];
  const balls = ballCount || 5;
  for (let i = balls; i >= Math.max(1, balls - 3); i--) {
    list.push({
      label: `Match any ${i} Numbers`,
      count: i,
      prize: i === balls ? (mainPrize || '$1,000,000') : `$${Math.pow(10, i) * 5}`
    });
  }
  return list;
};

export function Admin() {
  const { 
    user, 
    allUsers, 
    setAllUsers, 
    tickets, 
    updateUserBalance, 
    updateUserProfileFields,
    triggerDraw,
    historicalDraws,
    addHistoricalDraw,
    siteConfig,
    updateSiteConfig,
    dynamicGames,
    updateDynamicGame,
    addDynamicGame,
    deleteDynamicGame,
    // raffle winners dynamic handlers
    raffleWinners,
    addRaffleWinner,
    deleteRaffleWinner,
    updateRaffleWinner,
    // Dynamic promotions & news
    promotions = [],
    addPromotion,
    deletePromotion,
    updatePromotion,
    newsArticles = [],
    addNewsArticle,
    deleteNewsArticle,
    updateNewsArticle,
    withdrawalRequests = [],
    setWithdrawalRequests,
    updateWithdrawalStatus,
    depositRequests = [],
    setDepositRequests,
    updateDepositStatus,
    deleteUserFirestore,
    logout,
    menuPages = [],
    addMenuPage,
    deleteMenuPage,
    updateMenuPage
  } = useAuth();
  
  const navigate = useNavigate();

  const handleManualTicketStatus = async (ticketId: any, status: 'Won' | 'Lost') => {
    let payoutStr = '';
    if (status === 'Won') {
      const amt = prompt('Enter payout amount (e.g. 12000 Baht or $100):', '12000 Baht');
      if (amt === null) return;
      payoutStr = amt;
    }
    try {
      await setDoc(doc(db, 'purchasedTickets', String(ticketId)), {
        status: status,
        payout: status === 'Won' ? payoutStr : undefined
      }, { merge: true });
      alert(`Ticket #${ticketId} status updated to ${status}!`);
    } catch (e) {
      alert('Failed to update ticket: ' + e);
    }
  };

  const getGatewayLogo = (gateway: string) => {
    const g = gateway.toLowerCase();
    if (g.includes('bkash')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#E2136E]/10 border border-[#E2136E]/20 text-[#E2136E] font-black text-[10px] px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E2136E]" />
          bKash
        </span>
      );
    }
    if (g.includes('nagad')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#F57C20]/10 border border-[#F57C20]/20 text-[#F57C20] font-black text-[10px] px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F57C20]" />
          Nagad
        </span>
      );
    }
    if (g.includes('rocket')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-[#8C3494]/10 border border-[#8C3494]/20 text-[#8C3494] font-black text-[10px] px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8C3494]" />
          Rocket
        </span>
      );
    }
    if (g.includes('usdt') || g.includes('crypto')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          USDT
        </span>
      );
    }
    if (g.includes('card') || g.includes('visa') || g.includes('mastercard')) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] px-2.5 py-1 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Card
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-black text-[10px] px-2.5 py-1 rounded-lg">
        {gateway}
      </span>
    );
  };
  const [activeTab, setActiveTab] = useState<'users' | 'lottery' | 'announcements' | 'customizer' | 'raffle' | 'withdrawals' | 'deposits' | 'gateways' | 'menupages' | 'navmenus'>('lottery');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // Site Customizer State
  const [primaryHex, setPrimaryHex] = useState(siteConfig.primaryHex);
  const [primaryLogoText, setPrimaryLogoText] = useState(siteConfig.primaryLogoText);
  const [logoImageUrl, setLogoImageUrl] = useState(siteConfig.logoImageUrl || '');
  const [heroHeadline, setHeroHeadline] = useState(siteConfig.heroHeadline);
  const [heroJackpotAmount, setHeroJackpotAmount] = useState(siteConfig.heroJackpotAmount);
  const [heroDetails, setHeroDetails] = useState(siteConfig.heroDetails);
  const [heroDaysToGo, setHeroDaysToGo] = useState(siteConfig.heroDaysToGo);
  const [bannerMascotUrl, setBannerMascotUrl] = useState(siteConfig.bannerMascotUrl);

  const [heroBannerBgType, setHeroBannerBgType] = useState(siteConfig.heroBannerBgType || 'gradient');
  const [heroBannerBgSolidHex, setHeroBannerBgSolidHex] = useState(siteConfig.heroBannerBgSolidHex || '#E52535');
  const [allGamesSolidBg, setAllGamesSolidBg] = useState(siteConfig.allGamesSolidBg || false);
  const [allGamesSolidHex, setAllGamesSolidHex] = useState(siteConfig.allGamesSolidHex || '#E52535');
  const [hideHeroShadow, setHideHeroShadow] = useState(siteConfig.hideHeroShadow || false);

  // bKash & Nagad Gateways Local States
  const [bkashNumber, setBkashNumber] = useState(siteConfig.bkashNumber || '+8801986259552');
  const [bkashEnabled, setBkashEnabled] = useState(siteConfig.bkashEnabled !== false);
  const [bkashInstructions, setBkashInstructions] = useState(siteConfig.bkashInstructions || '');
  const [nagadNumber, setNagadNumber] = useState(siteConfig.nagadNumber || '+8801849182390');
  const [nagadEnabled, setNagadEnabled] = useState(siteConfig.nagadEnabled !== false);
  const [nagadInstructions, setNagadInstructions] = useState(siteConfig.nagadInstructions || '');

  // Local Agent Links Config States
  const [agentWhatsappLink, setAgentWhatsappLink] = useState(siteConfig.agentWhatsappLink || 'https://wa.me/8801986259552');
  const [agentImoLink, setAgentImoLink] = useState(siteConfig.agentImoLink || 'https://imo.im/8801986259552');
  const [agentTelegramLink, setAgentTelegramLink] = useState(siteConfig.agentTelegramLink || 'https://t.me/md_meshkat_payal');
  const [agentEnabled, setAgentEnabled] = useState(siteConfig.agentEnabled !== false);
  const [agentInstructions, setAgentInstructions] = useState(siteConfig.agentInstructions || '');

  // Form states for CRUD operations on raffle winners list
  const [newWinnerName, setNewWinnerName] = useState('');
  const [newWinnerCountry, setNewWinnerCountry] = useState('Bangladesh');
  const [newWinnerFlag, setNewWinnerFlag] = useState('🇧🇩');
  const [newWinnerTicket, setNewWinnerTicket] = useState('SR1-1049B');
  const [newWinnerPrize, setNewWinnerPrize] = useState('$30,000.00');
  const [newWinnerGame, setNewWinnerGame] = useState('MEGA7');
  const [newWinnerInitials, setNewWinnerInitials] = useState('SB');
  const [winnerAvatarBg, setWinnerAvatarBg] = useState('bg-gradient-to-tr from-emerald-500 to-teal-600');
  const [newWinnerImageUrl, setNewWinnerImageUrl] = useState('');

  // Custom Banners states
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerImageUrl, setNewBannerImageUrl] = useState('');
  const [newBannerLinkUrl, setNewBannerLinkUrl] = useState('/dashboard');
  const [newBannerButtonText, setNewBannerButtonText] = useState('PLAY NOW');
  const [newBannerIsActive, setNewBannerIsActive] = useState(true);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Direct unlimited deposit and withdrawal entries states
  const [adminDepEmail, setAdminDepEmail] = useState('md.meshkat200@gmail.com');
  const [adminDepMethod, setAdminDepMethod] = useState('bKash');
  const [adminDepAmount, setAdminDepAmount] = useState('500');
  const [adminDepStatus, setAdminDepStatus] = useState<'Approved' | 'Pending' | 'Rejected'>('Approved');
  const [adminDepTransId, setAdminDepTransId] = useState('');

  const [adminWdEmail, setAdminWdEmail] = useState('md.meshkat200@gmail.com');
  const [adminWdAmount, setAdminWdAmount] = useState('200');
  const [adminWdBank, setAdminWdBank] = useState('City Bank PLC');
  const [adminWdIban, setAdminWdIban] = useState('BD01CITY2004859632');
  const [adminWdStatus, setAdminWdStatus] = useState<'Approved' | 'Pending' | 'Rejected'>('Pending');
  const [adminWdAccountName, setAdminWdAccountName] = useState('Meshkat sorif payal');

  // Advanced customization states
  const [newBannerBgType, setNewBannerBgType] = useState<'image' | 'color' | 'gradient'>('image');
  const [newBannerBgColor, setNewBannerBgColor] = useState('#0f0f14');
  const [newBannerBgGradient, setNewBannerBgGradient] = useState('linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)');
  const [newBannerTextColor, setNewBannerTextColor] = useState('#ffffff');
  const [newBannerButtonColor, setNewBannerButtonColor] = useState('#FFD700');
  const [newBannerButtonTextColor, setNewBannerButtonTextColor] = useState('#09090b');
  const [newBannerHideShadow, setNewBannerHideShadow] = useState(false);

  // Grand Prize Winners states
  const [newGpwName, setNewGpwName] = useState('');
  const [newGpwPrize, setNewGpwPrize] = useState('');
  const [newGpwImageUrl, setNewGpwImageUrl] = useState('');
  const [newGpwIsActive, setNewGpwIsActive] = useState(true);
  const [editingGpwId, setEditingGpwId] = useState<string | null>(null);

  // YouTube Video states
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState(siteConfig.youtubeVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [youtubeThumbnailUrl, setYoutubeThumbnailUrl] = useState(siteConfig.youtubeThumbnailUrl || '/images/emirates_interview_thumbnail_1781775097474.jpg');
  const [youtubeVideoTitle, setYoutubeVideoTitle] = useState(siteConfig.youtubeVideoTitle || "From Mother's Blessings to AED 100 Million");
  const [youtubeVideoSubtitle, setYoutubeVideoSubtitle] = useState(siteConfig.youtubeVideoSubtitle || 'INTERVIEWS');
  const [youtubeVideoDescription, setYoutubeVideoDescription] = useState(siteConfig.youtubeVideoDescription || 'Meet our lucky winners');
  const [youtubeVideoDetails, setYoutubeVideoDetails] = useState(siteConfig.youtubeVideoDetails || 'Discover the deep stories of global participants who completed life-changing draw wins.');

  // Live Statistics states
  const [totalMetricRegisteredUsers, setTotalMetricRegisteredUsers] = useState(siteConfig.totalMetricRegisteredUsers || '1,230,692');
  const [totalMetricTicketsPurchased, setTotalMetricTicketsPurchased] = useState(siteConfig.totalMetricTicketsPurchased || '3,485,912');

  // Finance Config States
  const [governmentFeePct, setGovernmentFeePct] = useState(siteConfig.governmentFeePct !== undefined ? siteConfig.governmentFeePct : 10);
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState(siteConfig.minWithdrawalAmount !== undefined ? siteConfig.minWithdrawalAmount : 10);
  const [maxWithdrawalAmount, setMaxWithdrawalAmount] = useState(siteConfig.maxWithdrawalAmount !== undefined ? siteConfig.maxWithdrawalAmount : 100000000);
  const [usdExchangeRate, setUsdExchangeRate] = useState(siteConfig.usdExchangeRate !== undefined ? siteConfig.usdExchangeRate : 117);

  // Video Winners states
  const [newVwTitle, setNewVwTitle] = useState('');
  const [newVwName, setNewVwName] = useState('');
  const [newVwPrizeText, setNewVwPrizeText] = useState('');
  const [newVwDate, setNewVwDate] = useState('');
  const [newVwThumbnailUrl, setNewVwThumbnailUrl] = useState('');
  const [newVwYoutubeId, setNewVwYoutubeId] = useState('');
  const [newVwIsActive, setNewVwIsActive] = useState(true);
  const [editingVwId, setEditingVwId] = useState<string | null>(null);

  // Draw Results states
  const [newDrGameName, setNewDrGameName] = useState('MEGA7');
  const [newDrDate, setNewDrDate] = useState('');
  const [newDrNumbers, setNewDrNumbers] = useState('');
  const [newDrTotalWinners, setNewDrTotalWinners] = useState('');
  const [newDrTotalPaid, setNewDrTotalPaid] = useState('');
  const [newDrRefCode, setNewDrRefCode] = useState('EMD-2941-XQ9');
  const [editingDrId, setEditingDrId] = useState<string | null>(null);
  const [drawFilter, setDrawFilter] = useState('ALL');

  // Dynamic Gateways Local States
  const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);
  const [gwName, setGwName] = useState('');
  const [gwNumber, setGwNumber] = useState('');
  const [gwInstructions, setGwInstructions] = useState('');
  const [gwEnabled, setGwEnabled] = useState(true);
  const [gwType, setGwType] = useState<'deposit' | 'withdrawal' | 'both'>('both');
  const [gwMinAmount, setGwMinAmount] = useState('10');
  const [gwMaxAmount, setGwMaxAmount] = useState('100000');

  // Manual User Profile Editor States
  const [selectedEditUser, setSelectedEditUser] = useState<UserProfile | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserBalance, setEditUserBalance] = useState('');
  const [editUserWinnings, setEditUserWinnings] = useState('');
  const [editUserCommission, setEditUserCommission] = useState('');
  const [editUserCountry, setEditUserCountry] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserRole, setEditUserRole] = useState<'user' | 'admin'>('user');

  const handleSelectUserForEdit = (user: UserProfile) => {
    setSelectedEditUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserPassword(user.password || '');
    setEditUserBalance(user.balance.toString());
    setEditUserWinnings((user.winningsBalance || 0).toString());
    setEditUserCommission((user.commissionBalance || 0).toString());
    setEditUserCountry(user.country || '');
    setEditUserPhone(user.phone || '');
    setEditUserRole(user.role || 'user');
  };

  const handleSaveUserManualChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditUser) return;

    const balanceNum = parseFloat(editUserBalance);
    const winningsNum = parseFloat(editUserWinnings);
    const commissionNum = parseFloat(editUserCommission);

    if (isNaN(balanceNum) || isNaN(winningsNum) || isNaN(commissionNum)) {
      alert("Please enter valid numeric balance values.");
      return;
    }

    const updatedFields: Partial<UserProfile> = {
      name: editUserName,
      password: editUserPassword,
      balance: balanceNum,
      winningsBalance: winningsNum,
      commissionBalance: commissionNum,
      country: editUserCountry,
      phone: editUserPhone,
      role: editUserRole,
    };

    try {
      await updateUserProfileFields(selectedEditUser.email, updatedFields);
      
      // Update local state allUsers
      setAllUsers(prev => prev.map(u => {
        if (u.email.toLowerCase() === selectedEditUser.email.toLowerCase()) {
          return { ...u, ...updatedFields };
        }
        return u;
      }));

      alert("🎉 User Profile updated successfully!");
      setSelectedEditUser(null);
    } catch (err) {
      alert("Error saving manual user modifications.");
    }
  };

  const currentBanners = siteConfig.banners || [];
  const currentGpws = siteConfig.grandPrizeWinners || [];
  const currentVws = siteConfig.videoWinners || [];
  const currentDrs = siteConfig.drawResults || [];
  const currentGateways = siteConfig.paymentGateways || [];

  const handleAddGateway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gwName || !gwNumber) {
      alert("Please enter Name and Number/Address");
      return;
    }

    const gatewayData = {
      id: editingGatewayId || 'gw-' + Date.now(),
      name: gwName,
      numberOrAddress: gwNumber,
      instructions: gwInstructions,
      enabled: gwEnabled,
      type: gwType,
      minAmount: parseFloat(gwMinAmount),
      maxAmount: parseFloat(gwMaxAmount)
    };

    let updatedGateways;
    if (editingGatewayId) {
      updatedGateways = currentGateways.map(g => g.id === editingGatewayId ? gatewayData : g);
    } else {
      updatedGateways = [...currentGateways, gatewayData];
    }

    updateSiteConfig({ paymentGateways: updatedGateways });
    resetGatewayForm();
    alert(editingGatewayId ? "Gateway updated!" : "Gateway added!");
  };

  const resetGatewayForm = () => {
    setEditingGatewayId(null);
    setGwName('');
    setGwNumber('');
    setGwInstructions('');
    setGwEnabled(true);
    setGwType('both');
    setGwMinAmount('10');
    setGwMaxAmount('100000');
  };

  const handleEditGateway = (gw: any) => {
    setEditingGatewayId(gw.id);
    setGwName(gw.name);
    setGwNumber(gw.numberOrAddress);
    setGwInstructions(gw.instructions);
    setGwEnabled(gw.enabled);
    setGwType(gw.type);
    setGwMinAmount(String(gw.minAmount || 10));
    setGwMaxAmount(String(gw.maxAmount || 100000));
  };

  const handleDeleteGateway = (id: string) => {
    const updated = currentGateways.filter(g => g.id !== id);
    updateSiteConfig({ paymentGateways: updated });
  };

  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBannerBgType === 'image' && !newBannerImageUrl) {
      alert("Please specify a Background Image URL!");
      return;
    }

    if (editingBannerId) {
      // Edit mode
      const updatedBanners = currentBanners.map(b => 
        b.id === editingBannerId 
          ? { 
              ...b, 
              title: newBannerTitle, 
              subtitle: newBannerSubtitle, 
              imageUrl: newBannerImageUrl, 
              linkUrl: newBannerLinkUrl, 
              buttonText: newBannerButtonText, 
              isActive: newBannerIsActive,
              bgType: newBannerBgType,
              bgColor: newBannerBgColor,
              bgGradient: newBannerBgGradient,
              textColor: newBannerTextColor,
              buttonColor: newBannerButtonColor,
              buttonTextColor: newBannerButtonTextColor,
              hideShadow: newBannerHideShadow
            } 
          : b
      );
      updateSiteConfig({ banners: updatedBanners });
      setEditingBannerId(null);
      alert("🎉 Custom banner updated successfully!");
    } else {
      // Add mode
      const newBanner = {
        id: 'banner-' + Date.now(),
        title: newBannerTitle,
        subtitle: newBannerSubtitle,
        imageUrl: newBannerImageUrl,
        linkUrl: newBannerLinkUrl,
        buttonText: newBannerButtonText,
        isActive: newBannerIsActive,
        bgType: newBannerBgType,
        bgColor: newBannerBgColor,
        bgGradient: newBannerBgGradient,
        textColor: newBannerTextColor,
        buttonColor: newBannerButtonColor,
        buttonTextColor: newBannerButtonTextColor,
        hideShadow: newBannerHideShadow
      };
      const updatedBanners = [...currentBanners, newBanner];
      updateSiteConfig({ banners: updatedBanners });
      alert("🎉 Custom banner added successfully! Check it out on the homepage.");
    }

    setNewBannerTitle('');
    setNewBannerSubtitle('');
    setNewBannerImageUrl('');
    setNewBannerLinkUrl('/dashboard');
    setNewBannerButtonText('PLAY NOW');
    setNewBannerIsActive(true);
    setNewBannerBgType('image');
    setNewBannerBgColor('#0f0f14');
    setNewBannerBgGradient('linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)');
    setNewBannerTextColor('#ffffff');
    setNewBannerButtonColor('#FFD700');
    setNewBannerButtonTextColor('#09090b');
    setNewBannerHideShadow(false);
  };

  const handleEditBanner = (bannerItem: any) => {
    setEditingBannerId(bannerItem.id);
    setNewBannerTitle(bannerItem.title);
    setNewBannerSubtitle(bannerItem.subtitle || '');
    setNewBannerImageUrl(bannerItem.imageUrl || '');
    setNewBannerLinkUrl(bannerItem.linkUrl || '/dashboard');
    setNewBannerButtonText(bannerItem.buttonText || 'PLAY NOW');
    setNewBannerIsActive(bannerItem.isActive);
    setNewBannerBgType(bannerItem.bgType || 'image');
    setNewBannerBgColor(bannerItem.bgColor || '#0f0f14');
    setNewBannerBgGradient(bannerItem.bgGradient || 'linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)');
    setNewBannerTextColor(bannerItem.textColor || '#ffffff');
    setNewBannerButtonColor(bannerItem.buttonColor || '#FFD700');
    setNewBannerButtonTextColor(bannerItem.buttonTextColor || '#09090b');
    setNewBannerHideShadow(bannerItem.hideShadow || false);
  };

  const handleCancelEditBanner = () => {
    setEditingBannerId(null);
    setNewBannerTitle('');
    setNewBannerSubtitle('');
    setNewBannerImageUrl('');
    setNewBannerLinkUrl('/dashboard');
    setNewBannerButtonText('PLAY NOW');
    setNewBannerIsActive(true);
    setNewBannerBgType('image');
    setNewBannerBgColor('#0f0f14');
    setNewBannerBgGradient('linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)');
    setNewBannerTextColor('#ffffff');
    setNewBannerButtonColor('#FFD700');
    setNewBannerButtonTextColor('#09090b');
    setNewBannerHideShadow(false);
  };

  const handleToggleBannerActive = (id: string) => {
    const updatedBanners = currentBanners.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
    updateSiteConfig({ banners: updatedBanners });
  };

  const handleDeleteBanner = (id: string) => {
    const updatedBanners = currentBanners.filter(b => b.id !== id);
    updateSiteConfig({ banners: updatedBanners });
    if (editingBannerId === id) {
      handleCancelEditBanner();
    }
  };

  // Grand Prize Winners CRUD helpers
  const handleToggleGpwActive = (id: string) => {
    const updatedGpws = currentGpws.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g);
    updateSiteConfig({ grandPrizeWinners: updatedGpws });
  };

  const handleDeleteGpw = (id: string) => {
    const updatedGpws = currentGpws.filter(g => g.id !== id);
    updateSiteConfig({ grandPrizeWinners: updatedGpws });
    if (editingGpwId === id) {
      handleCancelEditGpw();
    }
  };

  const handleSaveGpw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGpwName || !newGpwPrize) {
      alert("Please enter a Name and Prize for the Grand Prize Winner!");
      return;
    }

    if (editingGpwId) {
      // Edit mode
      const updatedGpws = currentGpws.map(g => 
        g.id === editingGpwId 
          ? { 
              ...g, 
              name: newGpwName, 
              prize: newGpwPrize, 
              imageUrl: newGpwImageUrl || '/images/emirates_winner_robert_1781775078543.jpg',
              isActive: newGpwIsActive
            } 
          : g
      );
      updateSiteConfig({ grandPrizeWinners: updatedGpws });
      setEditingGpwId(null);
      alert("🎉 Grand prize winner updated successfully!");
    } else {
      // Add mode
      const newGpw = {
        id: 'gpw-' + Math.floor(1000 + Math.random() * 9000),
        name: newGpwName,
        prize: newGpwPrize,
        imageUrl: newGpwImageUrl || '/images/emirates_winner_robert_1781775078543.jpg',
        isActive: newGpwIsActive
      };
      const updatedGpws = [...currentGpws, newGpw];
      updateSiteConfig({ grandPrizeWinners: updatedGpws });
      alert("🎉 Grand prize winner added successfully!");
    }

    setNewGpwName('');
    setNewGpwPrize('');
    setNewGpwImageUrl('');
    setNewGpwIsActive(true);
  };

  const handleEditGpw = (gpw: any) => {
    setEditingGpwId(gpw.id);
    setNewGpwName(gpw.name);
    setNewGpwPrize(gpw.prize);
    setNewGpwImageUrl(gpw.imageUrl);
    setNewGpwIsActive(gpw.isActive);
  };

  const handleCancelEditGpw = () => {
    setEditingGpwId(null);
    setNewGpwName('');
    setNewGpwPrize('');
    setNewGpwImageUrl('');
    setNewGpwIsActive(true);
  };

  // --- Video Winners CRUD Helpers ---
  const handleToggleVwActive = (id: string) => {
    const updated = currentVws.map(v => v.id === id ? { ...v, isActive: !v.isActive } : v);
    updateSiteConfig({ videoWinners: updated });
  };

  const handleDeleteVw = (id: string) => {
    const updated = currentVws.filter(v => v.id !== id);
    updateSiteConfig({ videoWinners: updated });
    if (editingVwId === id) {
      handleCancelEditVw();
    }
  };

  const handleSaveVw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVwTitle || !newVwName) {
      alert("Please enter a Title and Name for the Video Winner!");
      return;
    }

    const cleanYoutubeId = extractYoutubeId(newVwYoutubeId || 'dQw4w9WgXcQ');
    const autoThumbnailUrl = newVwThumbnailUrl.trim() || getYoutubeThumbnail(cleanYoutubeId);

    if (editingVwId) {
      // Edit mode
      const updated = currentVws.map(v => 
        v.id === editingVwId 
          ? { 
              ...v, 
              title: newVwTitle, 
              name: newVwName, 
              prizeText: newVwPrizeText,
              date: newVwDate,
              thumbnailUrl: autoThumbnailUrl,
              youtubeId: cleanYoutubeId,
              isActive: newVwIsActive
            } 
          : v
      );
      updateSiteConfig({ videoWinners: updated });
      setEditingVwId(null);
      alert("🎉 Video winner details updated successfully!");
    } else {
      // Add mode
      const newVw = {
        id: 'vw-' + Math.floor(1000 + Math.random() * 9000),
        title: newVwTitle,
        name: newVwName,
        prizeText: newVwPrizeText,
        date: newVwDate,
        thumbnailUrl: autoThumbnailUrl,
        youtubeId: cleanYoutubeId,
        isActive: newVwIsActive
      };
      const updated = [...currentVws, newVw];
      updateSiteConfig({ videoWinners: updated });
      alert("🎉 Video winner details added successfully!");
    }

    setNewVwTitle('');
    setNewVwName('');
    setNewVwPrizeText('');
    setNewVwDate('');
    setNewVwThumbnailUrl('');
    setNewVwYoutubeId('');
    setNewVwIsActive(true);
  };

  const handleEditVw = (vw: any) => {
    setEditingVwId(vw.id);
    setNewVwTitle(vw.title);
    setNewVwName(vw.name);
    setNewVwPrizeText(vw.prizeText);
    setNewVwDate(vw.date);
    setNewVwThumbnailUrl(vw.thumbnailUrl);
    setNewVwYoutubeId(vw.youtubeId);
    setNewVwIsActive(vw.isActive !== false);
  };

  const handleCancelEditVw = () => {
    setEditingVwId(null);
    setNewVwTitle('');
    setNewVwName('');
    setNewVwPrizeText('');
    setNewVwDate('');
    setNewVwThumbnailUrl('');
    setNewVwYoutubeId('');
    setNewVwIsActive(true);
  };

  // --- Draw Results CRUD Helpers ---
  const handleDeleteDr = (id: string) => {
    const updated = currentDrs.filter(d => d.id !== id);
    updateSiteConfig({ drawResults: updated });
    if (editingDrId === id) {
      handleCancelEditDr();
    }
  };

  const handleSaveDr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrDate || !newDrNumbers) {
      alert("Please enter a Date and Winning Numbers (comma separated)!");
      return;
    }

    // Parse numbers array
    const numbersArr = newDrNumbers
      .split(',')
      .map(n => parseInt(n.trim(), 10))
      .filter(n => !isNaN(n));

    if (numbersArr.length === 0) {
      alert("Winning numbers must be valid numbers separated by commas (e.g. 4,12,18,32)");
      return;
    }

    if (editingDrId) {
      // Edit mode
      const updated = currentDrs.map(d => 
        d.id === editingDrId 
          ? { 
              ...d, 
              gameName: newDrGameName,
              date: newDrDate,
              numbers: numbersArr,
              totalWinners: newDrTotalWinners || '0 Players',
              totalPaid: newDrTotalPaid || '$0.00',
              refCode: newDrRefCode || 'EMD-2941-XQ9'
            } 
          : d
      );
      updateSiteConfig({ drawResults: updated });
      setEditingDrId(null);
      alert("🎉 Draw results updated successfully!");
    } else {
      // Add mode
      const newDr = {
        id: 'dr-' + Math.floor(1000 + Math.random() * 9000),
        gameName: newDrGameName,
        date: newDrDate,
        numbers: numbersArr,
        totalWinners: newDrTotalWinners || '0 Players',
        totalPaid: newDrTotalPaid || '$0.00',
        refCode: newDrRefCode || 'EMD-2941-XQ9'
      };
      const updated = [newDr, ...currentDrs]; // Prepend latest
      updateSiteConfig({ drawResults: updated });
      alert("🎉 Draw results added successfully!");
    }

    // Reset fields
    setNewDrDate('');
    setNewDrNumbers('');
    setNewDrTotalWinners('');
    setNewDrTotalPaid('');
    setNewDrRefCode('EMD-2941-XQ9');
  };

  const handleEditDr = (dr: any) => {
    setEditingDrId(dr.id);
    setNewDrGameName(dr.gameName);
    setNewDrDate(dr.date);
    setNewDrNumbers(dr.numbers.join(', '));
    setNewDrTotalWinners(dr.totalWinners);
    setNewDrTotalPaid(dr.totalPaid);
    setNewDrRefCode(dr.refCode || 'EMD-2941-XQ9');
  };

  const handleCancelEditDr = () => {
    setEditingDrId(null);
    setNewDrGameName('MEGA7');
    setNewDrDate('');
    setNewDrNumbers('');
    setNewDrTotalWinners('');
    setNewDrTotalPaid('');
    setNewDrRefCode('EMD-2941-XQ9');
  };

  const handleAdminAddDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(adminDepAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid deposit amount!");
      return;
    }
    if (!adminDepEmail) {
      alert("Please enter a user email!");
      return;
    }

    const newDepReq = {
      id: 'DEP-ADM-' + Math.floor(1000 + Math.random() * 9000),
      email: adminDepEmail,
      amount: amountNum,
      gateway: adminDepMethod,
      transactionId: adminDepTransId || ('TXN' + Math.floor(100000 + Math.random() * 900000)),
      date: new Date().toLocaleDateString('en-GB'),
      status: adminDepStatus,
    };

    setDepositRequests(prev => [newDepReq, ...prev]);

    if (adminDepStatus === 'Approved') {
      updateUserBalance(adminDepEmail, amountNum);
      alert(`✅ Deposit of $${amountNum} added & APPROVED. User's wallet has been credited!`);
    } else {
      alert(`🎉 Deposit record added with status: ${adminDepStatus}`);
    }

    setAdminDepTransId('');
  };

  const handleAdminAddWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(adminWdAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid withdrawal amount!");
      return;
    }
    if (!adminWdEmail) {
      alert("Please enter a user email!");
      return;
    }

    const newWdReq = {
      id: 'WD-ADM-' + Math.floor(1000 + Math.random() * 9000),
      email: adminWdEmail,
      amount: amountNum,
      bankName: adminWdBank,
      iban: adminWdIban,
      status: adminWdStatus,
      accountName: adminWdAccountName,
      date: new Date().toLocaleDateString('en-GB'),
    };

    setWithdrawalRequests(prev => [newWdReq, ...prev]);

    if (adminWdStatus === 'Approved') {
      updateUserBalance(adminWdEmail, -amountNum);
      alert(`✅ Withdrawal of $${amountNum} added & APPROVED. Amount has been debited from user's balance!`);
    } else {
      alert(`🎉 Withdrawal record added with status: ${adminWdStatus}`);
    }
  };

  // Temporary edit states for selected dynamic game
  const [selectedGameToEdit, setSelectedGameToEdit] = useState<string>('MEGA7');
  const [editingGame, setEditingGame] = useState<DynamicGame | null>(null);

  // Footer & Contact Info States
  const [footerEmail, setFooterEmail] = useState(siteConfig.footerEmail || 'support@draw.com');
  const [footerWhatsapp, setFooterWhatsapp] = useState(siteConfig.footerWhatsapp || '+1 234 567 890');
  const [footerTelegram, setFooterTelegram] = useState(siteConfig.footerTelegram || '@drawsupport');
  const [footerImo, setFooterImo] = useState(siteConfig.footerImo || 'Live IMO');
  const [footerLiveChat, setFooterLiveChat] = useState(siteConfig.footerLiveChat || '24/7 Agent');
  const [footerLicenseBoard, setFooterLicenseBoard] = useState(siteConfig.footerLicenseBoard || 'Curacao eGaming Regulatory Authority');
  const [footerLicenseSerial, setFooterLicenseSerial] = useState(siteConfig.footerLicenseSerial || '#1668/JAZ - 2026 AUDITED LOTTERY PROTOCOL');
  const [footerGccCompliance, setFooterGccCompliance] = useState(siteConfig.footerGccCompliance || 'GCC-L-984210');

  // Add Dynamic Game form states
  const [isAddingGame, setIsAddingGame] = useState(false);
  const [newGameName, setNewGameName] = useState('');
  const [newGamePrize, setNewGamePrize] = useState('$50,000,000');
  const [newGamePrice, setNewGamePrice] = useState(10);
  const [newGameDrawTime, setNewGameDrawTime] = useState('Every Sunday');
  const [newGameBallCount, setNewGameBallCount] = useState(5);
  const [newGameMaxBallValue, setNewGameMaxBallValue] = useState(49);
  const [newGameBgHex, setNewGameBgHex] = useState('#E52535');

  React.useEffect(() => {
    const game = dynamicGames.find(g => g.name === selectedGameToEdit || g.id === selectedGameToEdit);
    if (game) {
      setEditingGame({ ...game });
    }
  }, [selectedGameToEdit, dynamicGames]);

  const handleCreateNewGame = async () => {
    if (!newGameName.trim()) {
      alert('Please provide a game name title.');
      return;
    }
    try {
      const newGame: DynamicGame = {
        name: newGameName.trim().toUpperCase(),
        prize: newGamePrize,
        price: Number(newGamePrice) || 10,
        drawTime: newGameDrawTime,
        targetDateStr: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        bgHex: newGameBgHex,
        isSolidStyle: true,
        ballCount: Number(newGameBallCount) || 5,
        maxBallValue: Number(newGameMaxBallValue) || 49,
        cardBgType: 'color',
        isActive: true
      };
      await addDynamicGame(newGame);
      setSelectedGameToEdit(newGame.name);
      setIsAddingGame(false);
      // Reset form fields
      setNewGameName('');
      setNewGamePrize('$50,000,000');
      setNewGamePrice(10);
      setNewGameDrawTime('Every Sunday');
      setNewGameBallCount(5);
      setNewGameMaxBallValue(49);
      alert(`🎉 New game ${newGame.name} added successfully!`);
    } catch (err) {
      alert('❌ Failed to add new game.');
    }
  };

  const handleDeleteSelectedGame = async () => {
    const gameIdToDelete = selectedGameToEdit;
    if (!gameIdToDelete) return;
    try {
      await deleteDynamicGame(gameIdToDelete);
      alert(`🗑️ Game "${gameIdToDelete}" deleted successfully.`);
      if (dynamicGames.length > 1) {
        const remaining = dynamicGames.filter(g => g.name !== gameIdToDelete);
        setSelectedGameToEdit(remaining[0].name);
      } else {
        setEditingGame(null);
      }
    } catch (err) {
      alert('❌ Failed to delete game.');
    }
  };

  const handleUpdateEditingGame = (fields: Partial<DynamicGame>) => {
    setEditingGame(prev => prev ? { ...prev, ...fields } : null);
  };

  const saveIndividualGameSettings = async () => {
    if (!editingGame) return;
    try {
      // Use id if available for doc path, otherwise use name
      const docId = editingGame.id || editingGame.name;
      await updateDynamicGame(docId, editingGame);
      alert(`✅ ${editingGame.name} settings saved successfully!`);
    } catch (err) {
      alert('❌ Failed to save game settings.');
    }
  };

  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteConfig({
      primaryHex,
      primaryLogoText,
      logoImageUrl,
      heroHeadline,
      heroJackpotAmount,
      heroDetails,
      heroDaysToGo,
      bannerMascotUrl,
      heroBannerBgType,
      heroBannerBgSolidHex,
      allGamesSolidBg,
      allGamesSolidHex,
      hideHeroShadow,
      bkashNumber,
      bkashEnabled,
      bkashInstructions,
      nagadNumber,
      nagadEnabled,
      nagadInstructions,
      agentWhatsappLink,
      agentImoLink,
      agentTelegramLink,
      agentEnabled,
      agentInstructions,
      // Footer and support custom details
      footerEmail,
      footerWhatsapp,
      footerTelegram,
      footerImo,
      footerLiveChat,
      footerLicenseBoard,
      footerLicenseSerial,
      footerGccCompliance,
      // Showcase customization sections
      youtubeVideoUrl,
      youtubeThumbnailUrl,
      youtubeVideoTitle,
      youtubeVideoSubtitle,
      youtubeVideoDescription,
      youtubeVideoDetails,
      totalMetricRegisteredUsers,
      totalMetricTicketsPurchased,
      governmentFeePct,
      minWithdrawalAmount,
      maxWithdrawalAmount,
      usdExchangeRate
    });
    alert("✨ Website dynamic theme configuration & payment gateways updated successfully! Walk back to homepage or checkout to view your custom branding.");
  };

  // Draw simulation state
  const [selectedGame, setSelectedGame] = useState('MEGA7');
  const [customNumbersString, setCustomNumbersString] = useState('5, 12, 19, 22, 34, 40, 48');
  const [drawResult, setDrawResult] = useState<{ matchedIds: number[]; payoutTotal: number } | null>(null);

  // User credit adjust state
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('100');

  // Announcement creator state
  const [bulletinTitle, setBulletinTitle] = useState('');
  const [bulletinSummary, setBulletinSummary] = useState('');
  const [isPromo, setIsPromo] = useState(false);

  // Sub tab for announcements
  const [announcementsSubTab, setAnnouncementsSubTab] = useState<'promotions' | 'news'>('promotions');

  // Dynamic Promotions form state
  const [promoFormTitle, setPromoFormTitle] = useState('');
  const [promoFormDate, setPromoFormDate] = useState('');
  const [promoFormExcerpt, setPromoFormExcerpt] = useState('');
  const [promoFormBtnText, setPromoFormBtnText] = useState('READ MORE');
  const [promoFormFlyerTitle, setPromoFormFlyerTitle] = useState('MEGA7 Rollover');
  const [promoFormFlyerAmount, setPromoFormFlyerAmount] = useState('$50,000,000');
  const [promoFormFlyerSub, setPromoFormFlyerSub] = useState('Reach for the skies!');
  const [promoFormFlyerExtra, setPromoFormFlyerExtra] = useState('ENDS THIS SUNDAY');
  const [promoFormFlyerGradient, setPromoFormFlyerGradient] = useState('from-amber-600 via-[#E52535] to-[#4A030A] text-zinc-900 dark:text-white');
  const [promoFormAccentColor, setPromoFormAccentColor] = useState('[#E52535]');
  const [promoFormTargetLink, setPromoFormTargetLink] = useState('/games/mega7');
  const [promoFormIsActive, setPromoFormIsActive] = useState(true);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

  // Dynamic News form state
  const [newsFormTitle, setNewsFormTitle] = useState('');
  const [newsFormExcerpt, setNewsFormExcerpt] = useState('');
  const [newsFormDate, setNewsFormDate] = useState('');
  const [newsFormImageUrl, setNewsFormImageUrl] = useState('');
  const [newsFormBannerTitle, setNewsFormBannerTitle] = useState('');
  const [newsFormBannerSubtitle, setNewsFormBannerSubtitle] = useState('');
  const [newsFormBannerBg, setNewsFormBannerBg] = useState('bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 text-zinc-900 dark:text-white');
  const [newsFormIsActive, setNewsFormIsActive] = useState(true);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [publishedBulletins, setPublishedBulletins] = useState<Array<{title: string, summary: string, isPromo: boolean, date: string}>>([
    {
      title: 'Golobal Lottery Celebrates Year-End Mega Winners',
      summary: 'Dozens of global winners took home cash prize multipliers in the festive Sure1 and Sure2 raffles.',
      isPromo: false,
      date: '18/06/2026'
    },
    {
      title: '50% Welcome Multiplier Special',
      summary: 'Use the official code EMIRATES50 on checkout to play your preferred numbers for half off.',
      isPromo: true,
      date: '18/06/2026'
    }
  ]);

  // Deny access if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className={`min-h-screen bg-[#FAF9FC] dark:bg-[#070709] text-zinc-900 dark:text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans ${theme === "dark" ? "dark" : ""}`}>
        <div className="max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8 text-zinc-500 dark:text-zinc-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-wider text-zinc-900 dark:text-white">404</h1>
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">Page Not Found</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-sm mx-auto mt-2">
              The directory or path you specified does not exist or has been restricted by system firewall protocols.
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 dark:text-white font-black py-3.5 rounded-xl text-[10px] uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 transition transform active:scale-95 cursor-pointer shadow-lg"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Generate random drawing numbers based on game
  const handleAutoGenerateNumbers = () => {
    const matchedGame = dynamicGames.find(g => g.name === selectedGame);
    let size = matchedGame?.ballCount || 5;
    let max = matchedGame?.maxBallValue || (selectedGame === 'MEGA7' ? 99 : selectedGame === 'EASY6' ? 39 : 49);

    const nums: number[] = [];
    while (nums.length < size) {
      const pin = Math.floor(Math.random() * max) + 1;
      if (!nums.includes(pin)) nums.push(pin);
    }
    nums.sort((a, b) => a - b);
    setCustomNumbersString(nums.join(', '));
  };

  // Perform full drawing trigger
  const handleTriggerOfficialDraw = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const winningNumbers = customNumbersString
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));

      if (winningNumbers.length === 0) {
        alert("Please specify or click generate winning numbers first!");
        return;
      }

      // Execute ticket logic matcher inside context
      const result = triggerDraw(selectedGame, winningNumbers);
      setDrawResult(result);

      // Record in historical draws list
      addHistoricalDraw({
        id: 'DRW-' + Math.floor(1000 + Math.random() * 9000),
        gameName: selectedGame,
        drawDate: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        winningNumbers,
        status: 'Triggered'
      });

      alert(`🏆 Draw Cleared successfully for ${selectedGame}! Matched tickets count: ${result.matchedIds.length}. Total simulated payout made: $${result.payoutTotal.toFixed(2)}.`);
    } catch (err: any) {
      alert("Invalid coordinate numbers series format. Use comma separated integers.");
    }
  };

  // Handle manual adjustments
  const handleBalanceAdjust = (e: React.FormEvent, dir: 'add' | 'deduct') => {
    e.preventDefault();
    if (!selectedUserEmail) {
      alert("Please select a target user account.");
      return;
    }
    const amt = parseFloat(adjustmentAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Enter a non-zero positive number.");
      return;
    }

    const mult = dir === 'add' ? 1 : -1;
    updateUserBalance(selectedUserEmail, amt * mult);
    alert(`💼 Adjusted user account balance successfully!`);
    setAdjustmentAmount('100');
  };

  const handleBalanceOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserEmail) {
      alert("Please select a target user account.");
      return;
    }
    const amt = parseFloat(adjustmentAmount);
    if (isNaN(amt) || amt < 0) {
      alert("Enter a valid number.");
      return;
    }
    updateUserProfileFields(selectedUserEmail, { balance: amt });
    alert(`💼 Exact balance set successfully to $${amt}!`);
    setAdjustmentAmount('');
  };

  // Promote/demote role
  const handleToggleUserRole = (email: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.email === email) {
        const nextRole = u.role === 'admin' ? 'user' : 'admin';
        return { ...u, role: nextRole as 'user' | 'admin' };
      }
      return u;
    }));
    alert("User permissions altered successfully!");
  };

  // Publish announcement
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletinTitle || !bulletinSummary) {
      alert("Please enter a title and summary.");
      return;
    }

    const newBtn = {
      title: bulletinTitle,
      summary: bulletinSummary,
      isPromo,
      date: new Date().toLocaleDateString('en-GB')
    };

    setPublishedBulletins(prev => [newBtn, ...prev]);
    setBulletinTitle('');
    setBulletinSummary('');
    alert("🎉 Bulletin published instantly to simulated files!");
  };

  // Save dynamic promotion
  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoFormTitle || !promoFormExcerpt) {
      alert("Please enter promotion Title and Excerpt.");
      return;
    }

    const promoData = {
      title: promoFormTitle,
      date: promoFormDate || new Date().toLocaleDateString('en-GB'),
      excerpt: promoFormExcerpt,
      buttonText: promoFormBtnText || 'READ MORE',
      flyerTitle: promoFormFlyerTitle || 'MEGA7 Rollover',
      flyerAmount: promoFormFlyerAmount || '$50,000,000',
      flyerSub: promoFormFlyerSub || 'Reach for the skies!',
      flyerExtra: promoFormFlyerExtra,
      flyerGradient: promoFormFlyerGradient || 'from-amber-600 via-[#E52535] to-[#4A030A] text-zinc-900 dark:text-white',
      accentColor: promoFormAccentColor || '[#E52535]',
      targetLink: promoFormTargetLink || '/games/mega7',
      isActive: promoFormIsActive
    };

    try {
      if (editingPromoId) {
        if (updatePromotion) {
          await updatePromotion(editingPromoId, promoData);
          alert("🎉 Promotion updated successfully!");
        }
        setEditingPromoId(null);
      } else {
        if (addPromotion) {
          await addPromotion(promoData);
          alert("🎉 New promotion added successfully!");
        }
      }
      // Reset form
      setPromoFormTitle('');
      setPromoFormDate('');
      setPromoFormExcerpt('');
      setPromoFormBtnText('READ MORE');
      setPromoFormFlyerTitle('MEGA7 Rollover');
      setPromoFormFlyerAmount('$50,000,000');
      setPromoFormFlyerSub('Reach for the skies!');
      setPromoFormFlyerExtra('ENDS THIS SUNDAY');
      setPromoFormFlyerGradient('from-amber-600 via-[#E52535] to-[#4A030A] text-zinc-900 dark:text-white');
      setPromoFormAccentColor('[#E52535]');
      setPromoFormTargetLink('/games/mega7');
      setPromoFormIsActive(true);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save promotion.");
    }
  };

  const handleEditPromotionClick = (promo: any) => {
    setEditingPromoId(promo.id);
    setPromoFormTitle(promo.title);
    setPromoFormDate(promo.date);
    setPromoFormExcerpt(promo.excerpt);
    setPromoFormBtnText(promo.buttonText);
    setPromoFormFlyerTitle(promo.flyerTitle);
    setPromoFormFlyerAmount(promo.flyerAmount);
    setPromoFormFlyerSub(promo.flyerSub);
    setPromoFormFlyerExtra(promo.flyerExtra || '');
    setPromoFormFlyerGradient(promo.flyerGradient);
    setPromoFormAccentColor(promo.accentColor);
    setPromoFormTargetLink(promo.targetLink);
    setPromoFormIsActive(promo.isActive !== false);
  };

  const handleDeletePromotionClick = async (id: string) => {
    try {
      if (deletePromotion) {
        await deletePromotion(id);
        alert("🗑️ Promotion deleted successfully.");
      }
    } catch (err) {
      alert("❌ Failed to delete promotion.");
    }
  };

  // Save dynamic news article
  const handleSaveNewsArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsFormTitle || !newsFormExcerpt) {
      alert("Please enter news Title and Excerpt.");
      return;
    }

    const newsData = {
      title: newsFormTitle,
      excerpt: newsFormExcerpt,
      date: newsFormDate || new Date().toLocaleDateString('en-GB'),
      imageUrl: newsFormImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      bannerTitle: newsFormBannerTitle,
      bannerSubtitle: newsFormBannerSubtitle,
      bannerBg: newsFormBannerBg || 'bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 text-zinc-900 dark:text-white',
      isActive: newsFormIsActive
    };

    try {
      if (editingNewsId) {
        if (updateNewsArticle) {
          await updateNewsArticle(editingNewsId, newsData);
          alert("🎉 News article updated successfully!");
        }
        setEditingNewsId(null);
      } else {
        if (addNewsArticle) {
          await addNewsArticle(newsData);
          alert("🎉 New news article added successfully!");
        }
      }
      // Reset form
      setNewsFormTitle('');
      setNewsFormExcerpt('');
      setNewsFormDate('');
      setNewsFormImageUrl('');
      setNewsFormBannerTitle('');
      setNewsFormBannerSubtitle('');
      setNewsFormBannerBg('bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 text-zinc-900 dark:text-white');
      setNewsFormIsActive(true);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save news article.");
    }
  };

  const handleEditNewsClick = (news: any) => {
    setEditingNewsId(news.id);
    setNewsFormTitle(news.title);
    setNewsFormExcerpt(news.excerpt);
    setNewsFormDate(news.date);
    setNewsFormImageUrl(news.imageUrl);
    setNewsFormBannerTitle(news.bannerTitle || '');
    setNewsFormBannerSubtitle(news.bannerSubtitle || '');
    setNewsFormBannerBg(news.bannerBg || 'bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 text-zinc-900 dark:text-white');
    setNewsFormIsActive(news.isActive !== false);
  };

  const handleDeleteNewsClick = async (id: string) => {
    try {
      if (deleteNewsArticle) {
        await deleteNewsArticle(id);
        alert("🗑️ News article deleted successfully.");
      }
    } catch (err) {
      alert("❌ Failed to delete news article.");
    }
  };

  // Delete simulated user profile
  const handleDeleteUser = async (email: string) => {
    if (email === user?.email) {
      alert("Cannot delete your own admin profile!");
      return;
    }
    
    if (deleteUserFirestore) {
       await deleteUserFirestore(email);
    }
    // Update local state temporarily for fast feedback
    setAllUsers(prev => prev.filter(u => u.email !== email));
  };

  // Let's compute statistics
  const totalUserBalance = allUsers.reduce((sum, u) => sum + u.balance, 0);
  
  const totalWinningsWon = tickets
    .filter(t => t.status === 'Won')
    .reduce((sum, t) => {
      const raw = t.payout ? parseFloat(t.payout.replace('$', '')) : 0;
      return sum + raw;
    }, 0);

  const totalTicketsBought = tickets.length;
  const totalSalesRevenue = tickets.reduce((sum, t) => sum + t.price, 0);

  const pendingWithdrawRequests = withdrawalRequests.filter(r => r.status === 'Pending');
  const approvedWithdrawRequests = withdrawalRequests.filter(r => r.status === 'Approved');
  
  const totalWithdrawCount = withdrawalRequests.length;
  const totalWithdrawAmount = withdrawalRequests.reduce((sum, r) => sum + r.amount, 0);

  // Conversion rate (realistic 1 USD = 117 BDT)
  const USD_TO_BDT = siteConfig.usdExchangeRate ?? 117;

  return (
    <div className={`min-h-screen bg-[#FAF9FC] dark:bg-[#070709] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-red-500/30 ${theme === "dark" ? "dark" : ""}`}>
      
      {/* Dynamic Sidebar Backdrop (Mobile Only) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Primary Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#09090b]/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800/70 px-4 sm:px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldCheck className="w-5.5 h-5.5 text-zinc-900 dark:text-white animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white leading-none flex items-center gap-1.5">
              <span className="text-red-600 dark:text-red-400 font-extrabold bg-red-100 dark:bg-red-950/40 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/40 text-[10px] tracking-widest">
                ADMIN
              </span>
              <span className="text-zinc-800 dark:text-zinc-200 font-black text-xs tracking-widest">
                CORE PANEL
              </span>
            </h2>
            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-1 block">Root Administrator Terminal • এডমিন কন্ট্রোল</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop Toggle Sidebar Button (3-Line Menu toggle) */}
          <button 
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            className="hidden lg:flex p-2.5 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-850 rounded-xl transition-all cursor-pointer items-center gap-1.5 text-[9.5px] font-black uppercase tracking-widest px-3.5 shadow-sm hover:shadow active:scale-95"
            title={isSidebarVisible ? "Hide Sidebar Menu" : "Show Sidebar Menu"}
          >
            <List className="w-4 h-4 text-red-500 shrink-0" />
            <span>{isSidebarVisible ? "Hide Menu" : "Show Menu"}</span>
          </button>

          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">{user?.name}</span>
            <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Master Administrator</span>
          </div>
          <div className="h-8 w-[1px] bg-zinc-100 dark:bg-zinc-800 mx-1 hidden sm:block" />
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-red-600/20 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer group flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3.5"
            title="Sign Out"
          >
            <span>Exit</span>
            <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform text-red-500" />
          </button>
        </div>
      </header>

      <div className="w-full px-1 sm:px-2 py-4 space-y-4 pb-20">
        
        {/* Mobile Status Bar (Visible on smaller screens) */}
        <div className="lg:hidden flex justify-between items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 p-4 rounded-3xl shadow-sm dark:shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-[0.2em]">System operational</span>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <button 
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex justify-center items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 dark:bg-zinc-800 transition-all active:scale-95"
            >
              {theme === 'dark' ? (
                <><Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode</>
              ) : (
                <><Moon className="w-3.5 h-3.5 text-indigo-500" /> Dark Mode</>
              )}
            </button>
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex justify-center items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 dark:bg-zinc-800 transition-all active:scale-95"
            >
              Menu ☰ <Sliders className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Global Admin Banner (Desktop) */}
        <div className="hidden lg:flex bg-white dark:bg-[#0d0d11] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 p-8 rounded-[32px] flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md dark:shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-600/50 to-transparent group-hover:via-red-500/70 transition-all duration-1000" />
          <div className="flex items-center gap-6">
            <div className="p-5 bg-gradient-to-br from-red-600 to-red-700 rounded-3xl text-zinc-900 dark:text-white shadow-sm dark:shadow-xl shadow-red-900/20 shrink-0 transform group-hover:rotate-3 transition-transform">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-900 dark:text-white italic font-alfa drop-shadow-md">ADMIN CORE PANEL</h1>
                <span className="text-[10px] font-black tracking-widest bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full">LIVE MODE</span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 text-xs mt-2 uppercase tracking-[0.1em] font-semibold leading-relaxed max-w-xl">
                Manual system controllers, live lottery triggers, deposit & withdrawal approvals, visual adjustments, and site branding management.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
            <button 
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:border-zinc-700 active:translate-y-0 flex items-center gap-2"
            >
              {theme === 'dark' ? (
                <><Sun className="w-3.5 h-3.5 text-amber-500" /> Light Mode</>
              ) : (
                <><Moon className="w-3.5 h-3.5 text-indigo-500" /> Dark Mode</>
              )}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:border-zinc-700 active:translate-y-0"
            >
              Public Dashboard
            </button>
            <button 
              onClick={() => navigate('/')}
              className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-4 rounded-2xl transition-all shadow-sm dark:shadow-xl shadow-red-600/10 active:translate-y-0"
            >
              Go to Live Site
            </button>
          </div>
        </div>

        {/* Statistics Hero Bento Grid (Beautiful currency dual metric layout USD + Bangladeshi Taka BDT) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Users Total Balance Capital */}
          <div className="bg-white dark:bg-[#0e0e12] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl relative overflow-hidden group hover:border-zinc-300 dark:border-zinc-700 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-colors" />
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black tracking-widest text-zinc-500 dark:text-zinc-500 uppercase">USERS TOTAL BALANCE</span>
              <span className="p-2 bg-red-950/40 text-red-500 border border-red-900/40 rounded-xl"><Users className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white font-mono">${totalUserBalance.toFixed(2)}</span>
              <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-mono block mt-0.5">৳{(totalUserBalance * USD_TO_BDT).toLocaleString('en-BD', { maximumFractionDigits: 0 })} BDT</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 block mt-2 uppercase font-extrabold">Across {allUsers.length} simulated member accounts</span>
            </div>
          </div>

          {/* Card 2: Total Money Won */}
          <div className="bg-white dark:bg-[#0e0e12] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl relative overflow-hidden group hover:border-zinc-300 dark:border-zinc-700 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-600/5 rounded-full blur-2xl group-hover:bg-yellow-600/10 transition-colors" />
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black tracking-widest text-zinc-500 dark:text-zinc-500 uppercase">TOTAL MONEY WON</span>
              <span className="p-2 bg-yellow-950/40 text-yellow-500 border border-yellow-900/40 rounded-xl"><Award className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-yellow-500 font-mono">${totalWinningsWon.toFixed(2)}</span>
              <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-mono block mt-0.5">৳{(totalWinningsWon * USD_TO_BDT).toLocaleString('en-BD', { maximumFractionDigits: 0 })} BDT</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 block mt-2 uppercase font-extrabold">Distributed prize disbursements</span>
            </div>
          </div>

          {/* Card 3: Total Tickets Bought */}
          <div className="bg-white dark:bg-[#0e0e12] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl relative overflow-hidden group hover:border-zinc-300 dark:border-zinc-700 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-600/5 rounded-full blur-2xl group-hover:bg-green-600/10 transition-colors" />
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black tracking-widest text-zinc-500 dark:text-zinc-500 uppercase">TICKETS PURCHASED</span>
              <span className="p-2 bg-green-950/40 text-green-400 border border-green-900/40 rounded-xl"><Ticket className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-emerald-400 font-mono">{totalTicketsBought} pcs</span>
              <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-mono block mt-0.5">${totalSalesRevenue.toFixed(2)} USD (৳{(totalSalesRevenue * USD_TO_BDT).toLocaleString('en-BD', { maximumFractionDigits: 0 })})</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 block mt-2 uppercase font-extrabold">Cumulative drawing ticket sales</span>
            </div>
          </div>

          {/* Card 4: Total WithdrawalsRequested */}
          <div className="bg-white dark:bg-[#0e0e12] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 p-6 rounded-3xl shadow-sm dark:shadow-xl relative overflow-hidden group hover:border-zinc-300 dark:border-zinc-700 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-2xl group-hover:bg-blue-600/10 transition-colors" />
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black tracking-widest text-zinc-500 dark:text-zinc-500 uppercase">WITHDRAW REQUESTS</span>
              <span className="p-2 bg-blue-950/40 text-blue-400 border border-blue-900/40 rounded-xl"><TrendingUp className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black tracking-tight text-blue-400 font-mono">{totalWithdrawCount} files</span>
              <span className="text-sm font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-mono block mt-0.5">${totalWithdrawAmount.toFixed(2)} USD (৳{(totalWithdrawAmount * USD_TO_BDT).toLocaleString('en-BD', { maximumFractionDigits: 0 })})</span>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 block mt-2 uppercase font-extrabold">{pendingWithdrawRequests.length} Pending • {approvedWithdrawRequests.length} Approved</span>
            </div>
          </div>
        </div>

        {/* Game Winning Numbers At-a-Glance Panel */}
        <div className="bg-white dark:bg-[#0e0e12] border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm dark:shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
                <span className="text-lg">🎯</span> Live Games &amp; Current Winning Numbers
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">Quick status and most recent winning sequences configured across all lotteries.</p>
            </div>
            <span className="text-[9px] font-black tracking-widest text-zinc-500 dark:text-zinc-500 uppercase px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">Real-Time Monitor</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dynamicGames.map((game) => {
              // Find the latest draw record for this game name
              const gameDraws = historicalDraws
                .filter(d => d.gameName.toUpperCase() === game.name.toUpperCase())
                .sort((a, b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime());
              const latestDraw = gameDraws[0];

              return (
                <div 
                  key={game.name}
                  className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-850/60 flex flex-col justify-between transition hover:border-zinc-300 dark:hover:border-zinc-700"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider block truncate">{game.name}</span>
                      <span className="text-[8px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest block mt-0.5">{game.drawTime}</span>
                    </div>
                    <span className={`text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full ${
                      game.isActive !== false 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                        : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/10'
                    }`}>
                      {game.isActive !== false ? '🟢 Active' : '🔴 OFF'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900/60">
                    <span className="text-[9px] font-black tracking-wider text-zinc-500 dark:text-zinc-500 uppercase block mb-1.5">Latest Winning Sequence</span>
                    {latestDraw ? (
                      <div className="flex flex-wrap gap-1 items-center">
                        {latestDraw.winningNumbers.map((num, i) => (
                          <span 
                            key={i} 
                            className="w-6 h-6 rounded-full bg-red-600 dark:bg-red-950/80 text-white dark:text-red-300 text-[10px] font-black flex items-center justify-center border border-red-500/20 shadow-sm font-mono"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-zinc-400 italic">No drawing results yet</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Responsive Grid with Desktop Left Sidebar and Mobile Swiper */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Sidebar (Desktop Only) */}
          {isSidebarVisible && (
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-[#0b0b0e] border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl space-y-6 shadow-sm dark:shadow-xl">
              
              <div className="space-y-3">
                <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 dark:text-zinc-500 uppercase block px-3">Primary Management</span>
                
                <button 
                  onClick={() => setActiveTab('lottery')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'lottery' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'lottery' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <Radio className={`w-4 h-4 shrink-0 ${activeTab === 'lottery' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-red-500'}`} />
                    <span>Lottery Draws</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'lottery' ? 'text-red-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Winning numbers & prices
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab('raffle')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'raffle' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'raffle' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <Gift className={`w-4 h-4 shrink-0 ${activeTab === 'raffle' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-red-500'}`} />
                    <span>Raffle Winners</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'raffle' ? 'text-red-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Daily cash draw winners
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab('users')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'users' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'users' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <Users className={`w-4 h-4 shrink-0 ${activeTab === 'users' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-red-500'}`} />
                    <span>User Database</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'users' ? 'text-red-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Balances & Roles
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 dark:text-zinc-500 uppercase block px-3">Financial Gateway</span>

                <button 
                  onClick={() => setActiveTab('deposits')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'deposits' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'deposits' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <Coins className={`w-4 h-4 shrink-0 ${activeTab === 'deposits' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500'}`} />
                    <span>Deposits Queue</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'deposits' ? 'text-emerald-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Verify user top-ups
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab('withdrawals')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'withdrawals' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'withdrawals' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <TrendingUp className={`w-4 h-4 shrink-0 ${activeTab === 'withdrawals' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500'}`} />
                    <span>Withdrawals</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'withdrawals' ? 'text-emerald-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Payout requests ledger
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab('gateways')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'gateways' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'gateways' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <DollarSign className={`w-4 h-4 shrink-0 ${activeTab === 'gateways' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500'}`} />
                    <span>Method Settings</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'gateways' ? 'text-emerald-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    bKash/Nagad/Crypto
                  </span>
                </button>
              </div>

              <div className="space-y-3">
                <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 dark:text-zinc-500 uppercase block px-3">Site Branding</span>

                <button 
                  onClick={() => setActiveTab('customizer')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'customizer' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'customizer' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <Sliders className={`w-4 h-4 shrink-0 ${activeTab === 'customizer' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500'}`} />
                    <span>Visual Identity</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'customizer' ? 'text-indigo-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Colors, Logos, Banners
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab('announcements')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'announcements' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'announcements' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <Newspaper className={`w-4 h-4 shrink-0 ${activeTab === 'announcements' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500'}`} />
                    <span>Announcements</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'announcements' ? 'text-indigo-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Notices & News bulletins
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab('menupages')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'menupages' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'menupages' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'menupages' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500'}`} />
                    <span>Menu Pages</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'menupages' ? 'text-indigo-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Manage frontend pages
                  </span>
                </button>

                <button 
                  onClick={() => setActiveTab('navmenus')}
                  className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1 transition-all cursor-pointer group ${
                    activeTab === 'navmenus' 
                      ? 'text-zinc-900 dark:text-white border border-white/20' 
                      : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-50 dark:bg-zinc-900/50 bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-200 dark:border-zinc-900/80'
                  }`}
                  style={activeTab === 'navmenus' ? { background: `linear-gradient(to right, ${siteConfig.primaryHex}, ${siteConfig.primaryHex}dd)`, boxShadow: `0 8px 16px -3px ${siteConfig.primaryHex}40` } : {}}
                >
                  <div className="flex items-center gap-2.5 font-black text-xs uppercase tracking-wider">
                    <List className={`w-4 h-4 shrink-0 ${activeTab === 'navmenus' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-orange-500'}`} />
                    <span>App Navigation</span>
                  </div>
                  <span className={`text-[10px] font-medium leading-relaxed text-left ${activeTab === 'navmenus' ? 'text-orange-100/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                    Manage header dropdowns
                  </span>
                </button>
              </div>
            </div>


            {/* Quick Live Telemetry card */}
            <div className="bg-[#121215]/60 border border-zinc-100 dark:border-zinc-200 dark:border-zinc-800/40 p-5 rounded-3xl text-xs space-y-2">
              <span className="font-extrabold text-yellow-500 uppercase tracking-widest text-[9px] block">Live Telemetry</span>
              <p className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 leading-relaxed">Changes saved here are reactive and directly persist in your mock localStorage state instantly.</p>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800/60 my-2" />
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-500 font-mono text-[10px]">
                <span>Status:</span>
                <span className="text-emerald-500 flex items-center gap-1">🟢 Connected</span>
              </div>
            </div>
          </div>
          )}
          {/* Right Content Column (Dynamic section container) */}
          <div className={`w-full ${isSidebarVisible ? 'lg:col-span-3' : 'lg:col-span-4'} bg-white dark:bg-[#0b0b0e] border-none p-6 sm:p-8 rounded-[32px] min-h-[500px] shadow-md dark:shadow-2xl`}>
          
          {/* TAB 8: Payment Gateways Manager */}
          {activeTab === 'gateways' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                  <DollarSign className="w-5 h-5 text-emerald-500" /> {editingGatewayId ? 'Edit Gateway' : 'Add New Payment Gateway'}
                </h3>
                
                <form onSubmit={handleAddGateway} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Gateway Name (e.g. bKash, USDT)</label>
                      <input 
                        type="text"
                        value={gwName}
                        onChange={(e) => setGwName(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                        placeholder="Method Name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Number or Wallet Address</label>
                      <input 
                        type="text"
                        value={gwNumber}
                        onChange={(e) => setGwNumber(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                        placeholder="+880... or 0x..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Gateway Usage Type</label>
                      <select 
                        value={gwType}
                        onChange={(e) => setGwType(e.target.value as any)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                      >
                        <option value="deposit">Deposit Only</option>
                        <option value="withdrawal">Withdrawal Only</option>
                        <option value="both">Both (Deposit & Withdrawal)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Payment Instructions</label>
                      <textarea 
                        value={gwInstructions}
                        onChange={(e) => setGwInstructions(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none h-[116px] resize-none"
                        placeholder="How should the user pay?"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Min Amount ($)</label>
                        <input 
                          type="number"
                          value={gwMinAmount}
                          onChange={(e) => setGwMinAmount(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">Enabled</label>
                        <div className="flex items-center h-[46px]">
                          <input 
                            type="checkbox"
                            checked={gwEnabled}
                            onChange={(e) => setGwEnabled(e.target.checked)}
                            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-2 flex gap-3">
                    <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all">
                      {editingGatewayId ? 'Update Gateway' : 'Add Gateway'}
                    </button>
                    {editingGatewayId && (
                      <button 
                        type="button" 
                        onClick={resetGatewayForm}
                        className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-black px-6 py-4 rounded-xl text-xs uppercase tracking-widest transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Payment_Gateways_Config.xlsx ({currentGateways.length} Rows)
                  </h4>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">Double click any cell to edit • Rightmost button to delete</span>
                </div>

                <ExcelSheet
                  sheetName="Payment_Gateways_Config"
                  columns={[
                    { key: 'name', label: 'Gateway Name', type: 'text' },
                    { key: 'numberOrAddress', label: 'Wallet Address / Number', type: 'text' },
                    { key: 'type', label: 'Usage Type', type: 'select', options: ['deposit', 'withdrawal', 'both'] },
                    { key: 'minAmount', label: 'Min Amount ($)', type: 'number' },
                    { key: 'instructions', label: 'Instructions Text', type: 'text' },
                    { key: 'enabled', label: 'Is Enabled', type: 'boolean' }
                  ]}
                  data={currentGateways}
                  onDataChange={async (updated) => {
                    let anyChanged = false;
                    const nextGateways = currentGateways.map(gw => {
                      const newRow = updated.find(r => r.id === gw.id);
                      if (newRow) {
                        let hasChanged = false;
                        for (const key of ['name', 'numberOrAddress', 'type', 'minAmount', 'instructions', 'enabled']) {
                          if (newRow[key] !== gw[key]) {
                            hasChanged = true;
                          }
                        }
                        if (hasChanged) {
                          anyChanged = true;
                          return {
                            ...gw,
                            name: newRow.name,
                            numberOrAddress: newRow.numberOrAddress,
                            type: newRow.type,
                            minAmount: parseFloat(newRow.minAmount) || 0,
                            instructions: newRow.instructions,
                            enabled: !!newRow.enabled
                          };
                        }
                      }
                      return gw;
                    });
                    if (anyChanged) {
                      try {
                        await updateSiteConfig({ paymentGateways: nextGateways });
                      } catch (err) {
                        console.error("Error updating site gateways:", err);
                      }
                    }
                  }}
                  onDeleteRow={(idx, row) => {
                    handleDeleteGateway(row.id);
                  }}
                />
              </div>
            </div>
          )}
          {activeTab === 'lottery' && (
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* Detailed Page Guide / কুইক এডমিন গাইড */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl" />
                <h3 className="text-xs font-black text-red-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-red-500" /> 💡 Admin Control Guide • এই পেজের কাজের বিবরণী
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                      এখানে আপনি লটারির রেজাল্ট ড্র করতে পারবেন, নতুন ড্র-এর সময় নির্ধারণ করতে পারবেন এবং লটারির মূল্য পরিবর্তন করতে পারবেন।
                    </p>
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><b>Live Operations Ledger:</b> প্ল্যাটফর্মের মোট টিকিট বিক্রি, অর্জিত আয় এবং বিজয়ীদের মোট পেমেন্টের লাইভ হিসাব দেখায়।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><b>Active Lotteries Selector (বাম পাশের তালিকা):</b> ৯টি লটারি গেমের মধ্য থেকে যেকোনো একটি সিলেক্ট করুন তার সেটিংস পরিবর্তন করার জন্য।</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2.5">
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><b>Trigger Instant Random Winner (র্যান্ডম ড্র):</b> লটারির রেজাল্ট হিসেবে র্যান্ডম বিজয়ী টিকিট ঘোষণা করে এবং তাৎক্ষণিকভাবে বিজয়ীদের একাউন্টে টাকা যোগ করে।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><b>Trigger Specified Winner (টার্গেটেড ড্র):</b> কোনো নির্দিষ্ট ব্যবহারকারীর ইমেইল দিয়ে তাকে ইচ্ছাকৃতভাবে বিজয়ী বানানোর জন্য ব্যবহার করুন।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-red-500 mt-0.5">•</span>
                        <span><b>Update Draw Settings:</b> টিকিটের মূল্য (Ticket Price) এবং পরবর্তী ড্র এর সময় (Next Draw Date & Time) লাইভ পরিবর্তন করতে সাহায্য করে।</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Part 1: All Games Consolidated Financial Tracker (All Game tools and Money Tracker in One Place) */}
              <div className="bg-[#18181b] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-500 via-red-500 to-red-600" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800/60 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-black text-yellow-400 tracking-widest uppercase flex items-center gap-1">
                      <Coins className="w-3 h-3" /> Live Operations Ledger
                    </span>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">Consolidated Financial Operations Center</h2>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">Aggregate performance parameters, real-time ticket revenue matrix, and global simulated cash flows in one unified terminal.</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-805 border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Global Synced State</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase block tracking-wider">Total Platform Tickets Sold</span>
                    <span className="text-2xl font-black text-zinc-900 dark:text-white font-mono block mt-1">{tickets.length}</span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-0.5 uppercase">Across all nine lotteries</span>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase block tracking-wider">Cumulative Sales Revenue</span>
                    <span className="text-2xl font-black text-green-400 font-mono block mt-1">
                      ${tickets.reduce((sum, t) => sum + t.price, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-0.5 uppercase">Direct simulated cash intake</span>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase block tracking-wider">Winner Disbursements</span>
                    <span className="text-2xl font-black text-yellow-500 font-mono block mt-1">
                      ${tickets.filter(t => t.status === 'Won').reduce((sum, t) => {
                        const raw = t.payout ? parseFloat(t.payout.replace('$', '')) : 0;
                        return sum + raw;
                      }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-0.5 uppercase">Awarded simulated payouts</span>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase block tracking-wider">Top Grossing Game Title</span>
                    <span className="text-lg font-black text-red-400 font-mono block mt-1.5 truncate">
                      {(() => {
                        const salesMap: { [key: string]: number } = {};
                        dynamicGames.forEach(g => { salesMap[g.name] = 0; });
                        tickets.forEach(t => {
                          const gName = t.gameName.toUpperCase();
                          if (salesMap[gName] !== undefined) {
                            salesMap[gName] += t.price;
                          } else {
                            salesMap[gName] = t.price;
                          }
                        });
                        let topGame = 'MEGA7';
                        let maxSales = -1;
                        Object.keys(salesMap).forEach(k => {
                          if (salesMap[k] > maxSales) {
                            maxSales = salesMap[k];
                            topGame = k;
                          }
                        });
                        return maxSales > 0 ? `${topGame} ($${maxSales})` : 'MEGA7 ($0)';
                      })()}
                    </span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-0.5 uppercase">Calculated dynamically</span>
                  </div>
                </div>

                {/* Grid performance status representation for All games inside one single display */}
                <div className="mt-5 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px]">
                  <div className="grid grid-cols-5 bg-white dark:bg-zinc-950 p-2.5 font-bold uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                    <span>Lottery Game</span>
                    <span>Ticket Price</span>
                    <span className="text-center">Tickets Purchased</span>
                    <span className="text-right">Accumulated Sales Pool</span>
                    <span className="text-right">Game Target Ratio</span>
                  </div>
                  <div className="divide-y divide-zinc-805 divide-zinc-900 max-h-40 overflow-y-auto">
                    {dynamicGames.map(g => {
                      const gameTickets = tickets.filter(t => t.gameName.toUpperCase() === g.name.toUpperCase());
                      const totalSales = gameTickets.reduce((sum, t) => sum + t.price, 0);
                      const activeTarget = 15; // standard target milestone
                      const salesPercent = Math.min(100, Math.floor((gameTickets.length / activeTarget) * 100));

                      return (
                        <div key={g.name} className="grid grid-cols-5 p-2.5 items-center hover:bg-white dark:bg-zinc-950/40 transition">
                          <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.bgHex || '#E52535' }} />
                            {g.name}
                          </span>
                          <span className="font-mono text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">${g.price || 10}</span>
                          <span className="text-center font-bold text-zinc-900 dark:text-white font-mono">{gameTickets.length} <span className="text-zinc-650 text-[10px]">🎟️</span></span>
                          <span className="text-right font-mono text-green-400 font-bold">${totalSales.toFixed(2)}</span>
                          <span className="text-right font-mono text-yellow-400 text-[10px] font-bold">{salesPercent}% Loaded</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Part 2: Main Layout with Sidebar game selector menus ("alda alda menu") & specific draw tools */}
              <div className="grid grid-cols-1 gap-8 items-start">
                
                {/* INTERACTIVE LEFT MENU BAR ("protakta game ar alda alda item set and check balance progress bar") */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 tracking-widest block">Active Lotteries Selector</span>
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase">9 Managed Products</span>
                  </div>

                  <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                    {dynamicGames.map(game => {
                      const isSelected = selectedGame === game.name;
                      const gameTickets = tickets.filter(t => t.gameName.toUpperCase() === game.name.toUpperCase());
                      const totalTaka = gameTickets.reduce((sum, t) => sum + t.price, 0);
                      
                      // Establish target sales goal to show beautiful horizontal progress balance bar
                      const targetTicketCount = 15;
                      const percentVal = Math.min(100, Math.round((gameTickets.length / targetTicketCount) * 100));

                      return (
                        <div 
                          key={game.name}
                          onClick={() => {
                            setSelectedGame(game.name);
                            // Set custom default numbers based on game's expected length
                            const size = game.ballCount || 5;
                            const maxVal = game.maxBallValue || 49;
                            const nums: number[] = [];
                            while (nums.length < size) {
                              const pin = Math.floor(Math.random() * maxVal) + 1;
                              if (!nums.includes(pin)) nums.push(pin);
                            }
                            nums.sort((a, b) => a - b);
                            setCustomNumbersString(nums.join(', '));
                          }}
                          className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative overflow-hidden select-none ${
                            isSelected 
                              ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-sm dark:shadow-xl scale-[1.01]' 
                              : 'bg-white dark:bg-zinc-950/80 border-zinc-200 dark:border-zinc-800/60 hover:border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:bg-zinc-900/30'
                          }`}
                        >
                          {/* Colored glowing left accent */}
                          <div className="absolute top-0 left-0 w-[3px] h-full" style={{ backgroundColor: game.bgHex || '#E52535' }} />

                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm">{game.name}</h4>
                                <span className="bg-white dark:bg-zinc-950 px-1.5 py-0.5 rounded text-[8.5px] font-mono tracking-wider text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 uppercase font-bold">
                                  {game.drawTime}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 block mt-0.5 uppercase tracking-wider">
                                Price: <b className="text-zinc-700 dark:text-zinc-300 font-mono">${game.price}</b> • Ball: <b className="text-[#FFD700] font-mono">{game.ballCount || 5} (1-{game.maxBallValue || 49})</b>
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-black text-green-400 font-mono block">${totalTaka.toFixed(0)}</span>
                              <span className="text-[8.5px] text-zinc-500 dark:text-zinc-500 block mt-0.5 font-bold uppercase tracking-wider">
                                {gameTickets.length} Sold
                              </span>
                            </div>
                          </div>

                          {/* Beautiful dynamic balance bar (tickets purchase progress metrics progress visualizer) */}
                          <div className="mt-4 space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                              <span>Draw Completion progress</span>
                              <span style={{ color: game.bgHex || '#E52535' }}>{percentVal}%</span>
                            </div>
                            
                            {/* Matte progress bar track */}
                            <div className="w-full h-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-300 relative"
                                style={{ 
                                  width: `${percentVal}%`,
                                  backgroundColor: game.bgHex || '#E52535',
                                  boxShadow: `0 0 10px ${(game.bgHex || '#E52535')}80`
                                }}
                              />
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SELECTED GAME DETAILED CONTROL desk ("elda draw algorithm set and countdown schedulers") */}
                <div className="lg:col-span-8 space-y-6">
                  {(() => {
                    const matchGame = dynamicGames.find(g => g.name === selectedGame);
                    if (!matchGame) return null;

                    const matchedTicketsNum = tickets.filter(t => t.gameName.toUpperCase() === selectedGame.toUpperCase());
                    const matchedSalesAmt = matchedTicketsNum.reduce((sum, t) => sum + t.price, 0);

                    return (
                      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6 animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: matchGame.bgHex || '#E52535' }} />
                        
                        {/* Selected Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white" style={{ backgroundColor: matchGame.bgHex || '#E52535' }}>
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-zinc-900 dark:text-white">{matchGame.name} Draw Desk</h3>
                                <span className="bg-red-950/60 border border-red-900 text-red-400 px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider">
                                  Draw Scheduled
                                </span>
                              </div>
                              <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">Customize properties and perform live draw validation matching for this game.</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-500 block font-bold uppercase tracking-widest">Selected Game Sales</span>
                            <span className="text-xl font-mono font-black text-zinc-900 dark:text-white">${matchedSalesAmt.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Fast inline mini parameters customizer ("alda alda menu thak set kora") */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-zinc-950/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">Jackpot Prize</label>
                            <input 
                              type="text"
                              value={matchGame.prize}
                              onChange={(e) => updateDynamicGame(matchGame.name, { prize: e.target.value })}
                              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 text-xs rounded-lg text-zinc-900 dark:text-white w-full font-bold focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">Ticket Price ($)</label>
                            <input 
                              type="number"
                              value={matchGame.price}
                              onChange={(e) => updateDynamicGame(matchGame.name, { price: Math.max(1, Number(e.target.value) || 1) })}
                              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 text-xs rounded-lg text-zinc-900 dark:text-white w-full font-mono focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">Draw Schedule Time</label>
                            <input 
                              type="text"
                              value={matchGame.drawTime}
                              onChange={(e) => updateDynamicGame(matchGame.name, { drawTime: e.target.value })}
                              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 text-xs rounded-lg text-zinc-900 dark:text-white w-full focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-3 pt-2 border-t border-zinc-200 dark:border-zinc-900">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">Date and Clock Target Scheduler (Interactive Countdown)</label>
                            <input 
                              type="datetime-local"
                              value={(() => {
                                try {
                                  const date = new Date(matchGame.targetDateStr);
                                  const tzoffset = date.getTimezoneOffset() * 60000;
                                  return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -1).substring(0, 16);
                                } catch(err) {
                                  return '';
                                }
                              })()}
                              onChange={(e) => {
                                if (e.target.value) {
                                  updateDynamicGame(matchGame.name, { targetDateStr: new Date(e.target.value).toISOString() });
                                }
                              }}
                              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-2 text-xs rounded-lg text-zinc-900 dark:text-white w-full font-mono focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* DRAW EXECUTION INTERPRETER FOR SELECTED SLOT */}
                        <form onSubmit={handleTriggerOfficialDraw} className="bg-[#18181b] p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5">
                              <Sliders className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-500" /> Draw Verification System
                            </span>
                            
                            {/* Auto generate helper button */}
                            <button 
                              type="button"
                              onClick={handleAutoGenerateNumbers}
                              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:bg-zinc-800 text-yellow-400 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg transition"
                            >
                              ⚡ Auto Generates coordinates numbers
                            </button>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase block tracking-wider mb-1">Winning Sequence</span>
                            <input 
                              type="text" 
                              value={customNumbersString}
                              onChange={(e) => setCustomNumbersString(e.target.value)}
                              placeholder={`e.g. Comma separated digits`}
                              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-yellow-400 font-mono text-center tracking-widest text-xl rounded-xl p-3.5 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500"
                              required
                            />
                            <span className="text-[9px] text-zinc-500 dark:text-zinc-500 block mt-1.5">
                              {matchGame.name.toUpperCase() === 'THAI GOVT LOTTERY' || matchGame.name.toUpperCase() === 'THAI LOTTERY' ? (
                                <span>Note: Enter the winning 3-digit number (e.g. <b className="text-[#FFD700]">1, 2, 3</b> for combination <b className="text-[#FFD700]">123</b>) which will resolve all tickets based on their Direct/Rumble configurations.</span>
                              ) : (
                                <span>Note: Requires <b className="text-[#FFD700]">{matchGame.ballCount || 5}</b> ball integers ranged <b className="text-[#FFD700]">1 to {matchGame.maxBallValue || 49}</b></span>
                              )}
                            </span>
                          </div>

                          <button 
                            type="submit"
                            style={{ backgroundColor: matchGame.bgHex || '#E52535' }}
                            className="w-full text-zinc-900 dark:text-white font-extrabold py-3.5 rounded-xl text-xs tracking-widest uppercase shadow transition duration-200 active:scale-95"
                          >
                            🚀 Trigger Live Drawing matching
                          </button>
                        </form>

                        {/* DRAW RESULTS LOGS OR TICKETS BOUGHT LOG SHEET */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 tracking-wider">Purchase History ledger (Simulated Users)</h4>
                          
                          <div className="bg-white dark:bg-zinc-950 rounded-xl max-h-48 overflow-y-auto divide-y divide-zinc-900 text-xs">
                            {matchedTicketsNum.length === 0 ? (
                              <p className="p-4 text-center text-zinc-650 italic text-[11px]">No simulated tickets purchased for {matchGame.name} today.</p>
                            ) : (
                              matchedTicketsNum.map((t, index) => (
                                <div key={index} className="p-3 flex justify-between items-center hover:bg-zinc-90 w-full hover:bg-zinc-50 dark:bg-zinc-900/50">
                                  <div>
                                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{t.email}</span>
                                    <span className="text-zinc-550 block text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">{t.purchaseDate}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {t.isThaiLottery || t.gameName.toUpperCase() === 'THAI GOVT LOTTERY' ? (
                                      <div className="text-right mr-2 space-y-0.5">
                                        <div className="flex items-center gap-1.5 justify-end">
                                          <span className="bg-zinc-900 text-[8px] font-extrabold px-1.5 py-0.5 rounded text-white/80 uppercase">
                                            {t.thaiLotteryType}
                                          </span>
                                          <span className="bg-zinc-950 text-yellow-300 font-mono font-black text-xs px-2 py-0.5 rounded border border-yellow-500/10">
                                            {t.thaiLotteryNumber || t.numbers.join('')}
                                          </span>
                                        </div>
                                        <div className="text-[9.5px] text-zinc-500 font-medium">
                                          Direct: <b>${t.directBet || t.price}</b> {t.rumbleBet > 0 && <span>• Rumble: <b>${t.rumbleBet}</b></span>}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-1">
                                        {t.numbers.map((n, i) => (
                                          <span key={i} className="bg-zinc-100 dark:bg-zinc-800 text-[10.5px] px-1.5 py-0.5 rounded font-bold text-zinc-900 dark:text-white font-mono">{n}</span>
                                        ))}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${
                                        t.status === 'Won' ? 'bg-green-950 text-green-400 border border-green-900/40' :
                                        t.status === 'Lost' ? 'bg-red-950 text-red-400 border border-red-900/40' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400'
                                      }`}>
                                        {t.status.toUpperCase()}
                                      </span>
                                      {t.status === 'Pending' && (
                                        <div className="flex gap-1 ml-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleManualTicketStatus(t.id, 'Won')}
                                            className="bg-green-600 hover:bg-green-700 text-white font-black text-[9px] px-1.5 py-0.5 rounded transition"
                                            title="Mark Won"
                                          >
                                            W
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleManualTicketStatus(t.id, 'Lost')}
                                            className="bg-red-650 hover:bg-red-750 text-white font-black text-[9px] px-1.5 py-0.5 rounded transition"
                                            title="Mark Lost"
                                          >
                                            L
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* CALCULATION FEEDBACK SHIELD */}
                        {drawResult && selectedGame === matchGame.name && (
                          <div className="bg-green-950/40 border border-green-900/50 rounded-xl p-4.5 p-4 text-xs space-y-2">
                            <span className="font-black text-green-400 uppercase tracking-widest text-[10px] block mb-1">✓ Process cleared successfully</span>
                            <div className="text-zinc-700 dark:text-zinc-300">
                              Calculated matching coordinates indices results for this session. Correctly allocated jackpot winnings in payouts count: <b className="text-zinc-900 dark:text-white font-mono">{drawResult.matchedIds.length} tickets</b> belonging to users database. Verified payouts total is <b className="text-green-400 font-mono">${drawResult.payoutTotal.toFixed(2)}</b>.
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Users Database Management Directory */}
          {activeTab === 'users' && (
            <div className="space-y-8 text-left">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                  <Users className="w-5 h-5 text-red-500" /> Registered User Registry Profiles
                </h2>
                <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1">Inspect existing live profiles, append trial credits, promote administrative power, or clear accounts.</p>
              </div>

              {/* Detailed Page Guide / কুইক এডমিন গাইড */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl" />
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-cyan-400" /> 💡 Admin Control Guide • এই পেজের কাজের বিবরণী
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                      এখানে আপনি লটারি সাইটের সকল রেজিস্টার্ড কাস্টমার প্রোফাইল দেখতে পারবেন, ব্যালেন্স বাড়াতে/কমাতে পারবেন এবং এডমিন রোল পরিবর্তন করতে পারবেন।
                    </p>
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span><b>Manual Credit Adjustment (টাকা যোগ-বিয়োগ):</b> ড্রপডাউন থেকে ইউজার সিলেক্ট করুন, টাকার পরিমাণ লিখুন এবং ব্যালেন্স যোগ করতে Refill বা বিয়োগ করতে Debit বাটনে চাপুন।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span><b>User Registry Table (ব্যবহারকারী তালিকা):</b> প্রতিটি ইউজারের ইমেইল, একাউন্ট ব্যালেন্স, উইনিং ব্যালেন্স, ও রোল (User / Admin) এর লাইভ স্টেট দেখতে পাবেন।</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2.5">
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span><b>Make Admin Button (এডমিন প্রমোশন):</b> কোনো সাধারণ মেম্বারকে সিস্টেমে এডমিন হিসেবে প্রমোট করার জন্য এই বাটন ব্যবহার করুন।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span><b>Ban User Button (ইউজার নিষিদ্ধকরণ):</b> কোনো ইউজার একাউন্টকে নিষিদ্ধ বা নিষ্ক্রিয় করার জন্য এই বাটন ব্যবহার করুন।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span><b>Delete Profile Button (প্রোফাইল ডিলিট):</b> ডাটাবেজ থেকে স্থায়ীভাবে কোনো কাস্টমারের প্রোফাইল মুছে ফেলার জন্য এই ডাস্টবিন বাটনটি ব্যবহার করুন।</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Balance adjusting form */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm uppercase text-zinc-900 dark:text-white tracking-wide">Manual Credit Refill/Debit</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 leading-normal">Select any user account inside the registry and instantly adjust their active credits status.</p>
                </div>

                <form className="flex flex-wrap gap-2 justify-end">
                  <select 
                    value={selectedUserEmail}
                    onChange={(e) => setSelectedUserEmail(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs p-2.5 rounded-xl block shrink-0 min-w-[200px]"
                  >
                    <option value="">-- Choose User profile --</option>
                    {allUsers.map(u => (
                      <option key={u.email} value={u.email}>
                        {u.name} (${u.balance})
                      </option>
                    ))}
                  </select>

                  <input 
                    type="number" 
                    value={adjustmentAmount} 
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    placeholder="Amt"
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs p-2.5 rounded-xl w-20 font-mono tracking-wider" 
                  />

                  <button 
                    onClick={(e) => handleBalanceAdjust(e, 'add')}
                    className="bg-green-600 hover:bg-green-700 text-zinc-900 dark:text-white font-bold p-2.5 rounded-xl text-xs uppercase cursor-pointer shrink-0"
                  >
                    + Load
                  </button>
                  <button 
                    onClick={(e) => handleBalanceAdjust(e, 'deduct')}
                    className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold p-2.5 rounded-xl text-xs uppercase cursor-pointer shrink-0 border border-zinc-300 dark:border-zinc-700"
                  >
                    - Deduct
                  </button>
                  <button 
                    onClick={(e) => handleBalanceOverride(e)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-zinc-900 dark:text-white font-bold p-2.5 rounded-xl text-xs uppercase cursor-pointer shrink-0 ml-1"
                  >
                    = Set Exact
                  </button>
                </form>
              </div>

              {/* Manual User Profile Full Editor Form */}
              {selectedEditUser && (
                <div className="bg-[#0b0b10] border-2 border-red-500/40 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-md dark:shadow-2xl animate-fade-in mb-8">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-red-650/5 rounded-full blur-3xl" />
                  <div className="flex justify-between items-center border-b border-zinc-805 pb-4">
                    <div>
                      <span className="text-[9px] font-black tracking-widest text-red-500 uppercase">Interactive Override Terminal</span>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white mt-1 uppercase">Manually Edit Profile: {selectedEditUser.name}</h3>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 mt-0.5">Modify main account balance, winnings wallet, security permissions, and core credentials.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSelectedEditUser(null)}
                      className="p-2 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveUserManualChanges} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Full Name (নাম)</label>
                      <input 
                        type="text" 
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm p-3 rounded-xl block w-full mt-1.5 text-zinc-900 dark:text-white font-semibold focus:ring-1 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Email Address (ইমেইল - Read Only)</label>
                      <input 
                        type="email" 
                        value={editUserEmail}
                        disabled
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 text-sm p-3 rounded-xl block w-full mt-1.5 text-zinc-500 dark:text-zinc-500 font-semibold cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Profile Password (পাসওয়ার্ড)</label>
                      <input 
                        type="text" 
                        value={editUserPassword}
                        onChange={(e) => setEditUserPassword(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm p-3 rounded-xl block w-full mt-1.5 text-zinc-900 dark:text-white font-mono focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-green-450 uppercase tracking-wider block">Main Balance (৳ / $ একাউন্ট ব্যালেন্স)</label>
                      <input 
                        type="number" 
                        step="any"
                        value={editUserBalance}
                        onChange={(e) => setEditUserBalance(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm p-3 rounded-xl block w-full mt-1.5 text-green-400 font-black font-mono focus:ring-1 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-yellow-500 uppercase tracking-wider block">Winnings Balance (৳ / $ উইনিং ব্যালেন্স)</label>
                      <input 
                        type="number" 
                        step="any"
                        value={editUserWinnings}
                        onChange={(e) => setEditUserWinnings(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm p-3 rounded-xl block w-full mt-1.5 text-yellow-500 font-black font-mono focus:ring-1 focus:ring-yellow-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">Commission Balance (৳ / $ কমিশন ব্যালেন্স)</label>
                      <input 
                        type="number" 
                        step="any"
                        value={editUserCommission}
                        onChange={(e) => setEditUserCommission(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm p-3 rounded-xl block w-full mt-1.5 text-indigo-400 font-black font-mono focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Country (দেশ)</label>
                      <input 
                        type="text" 
                        value={editUserCountry}
                        onChange={(e) => setEditUserCountry(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm p-3 rounded-xl block w-full mt-1.5 text-zinc-900 dark:text-white font-semibold focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Phone Number (মোবাইল নম্বর)</label>
                      <input 
                        type="text" 
                        value={editUserPhone}
                        onChange={(e) => setEditUserPhone(e.target.value)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm p-3 rounded-xl block w-full mt-1.5 text-zinc-900 dark:text-white font-mono focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Security Role Permission (রোল)</label>
                      <select 
                        value={editUserRole}
                        onChange={(e) => setEditUserRole(e.target.value as 'user' | 'admin')}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm p-3 rounded-xl block w-full mt-1.5 text-zinc-900 dark:text-white font-bold focus:ring-1 focus:ring-red-500"
                      >
                        <option value="user">USER (সাধারণ মেম্বার)</option>
                        <option value="admin">ADMIN (মাস্টার এডমিন)</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setSelectedEditUser(null)}
                        className="px-5 py-3 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-zinc-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm dark:shadow-xl shadow-red-650/10 cursor-pointer"
                      >
                        Apply Changes Manually
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Interactive Excel Database Spreadsheet Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" /> Live Synchronized User Registry Sheet
                  </span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">Double click any cell to edit • Rightmost button to delete</span>
                </div>
                <ExcelSheet
                  sheetName="User_Administration"
                  columns={[
                    { key: 'name', label: 'Full Name', type: 'text' },
                    { key: 'email', label: 'Email Address', type: 'text', readOnly: true },
                    { key: 'password', label: 'Password', type: 'text' },
                    { key: 'phone', label: 'Phone Number', type: 'text' },
                    { key: 'country', label: 'Country', type: 'text' },
                    { key: 'balance', label: 'Main Balance ($)', type: 'number' },
                    { key: 'winningsBalance', label: 'Winnings ($)', type: 'number' },
                    { key: 'commissionBalance', label: 'Commission ($)', type: 'number' },
                    { key: 'role', label: 'Role', type: 'select', options: ['user', 'admin'] }
                  ]}
                  data={allUsers}
                  onDataChange={async (updated) => {
                    const oldData = allUsers;
                    setAllUsers(updated);
                    for (let i = 0; i < updated.length; i++) {
                      const newRow = updated[i];
                      const oldRow = oldData.find(u => u.email === newRow.email);
                      if (oldRow) {
                        const changedFields: any = {};
                        let hasChanged = false;
                        for (const key of ['name', 'password', 'phone', 'country', 'balance', 'winningsBalance', 'commissionBalance', 'role']) {
                          if (newRow[key] !== oldRow[key]) {
                            changedFields[key] = newRow[key];
                            hasChanged = true;
                          }
                        }
                        if (hasChanged) {
                          try {
                            await updateUserProfileFields(newRow.email, changedFields);
                          } catch (err) {
                            console.error("Error updating user:", err);
                          }
                        }
                      }
                    }
                  }}
                  onDeleteRow={(idx, row) => {
                    handleDeleteUser(row.email);
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: News & Announcements center */}
          {activeTab === 'announcements' && (
            <div className="space-y-8 text-left text-zinc-900 dark:text-white">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                  <Newspaper className="w-5 h-5 text-red-500" /> Dynamic Promotions & News Manager
                </h2>
                <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1">Configure live promotions, flyers, discount banners and lottery news published in real-time to the public frontend pages.</p>
              </div>

              {/* Sub-tab selection */}
              <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <button
                  type="button"
                  onClick={() => setAnnouncementsSubTab('promotions')}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                    announcementsSubTab === 'promotions'
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white'
                  }`}
                >
                  📢 Active Promotions ({promotions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAnnouncementsSubTab('news')}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                    announcementsSubTab === 'news'
                      ? 'bg-red-600 text-white shadow'
                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white'
                  }`}
                >
                  📰 News Articles ({newsArticles.length})
                </button>
              </div>

              {/* Sub-tab 1: PROMOTIONS */}
              {announcementsSubTab === 'promotions' && (
                <div className="grid grid-cols-1 gap-8 items-start">
                  
                  {/* Promotion Edit/Add Form */}
                  <form onSubmit={handleSavePromotion} className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-500">
                      {editingPromoId ? '✏️ Edit Promotion' : '➕ Create New Promotion'}
                    </h3>
                    
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Promotion Main Title</label>
                      <input 
                        type="text" 
                        value={promoFormTitle}
                        onChange={(e) => setPromoFormTitle(e.target.value)}
                        placeholder="e.g. MEGA7 Rollover to $50 Million"
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Expiry / Valid Date text</label>
                      <input 
                        type="text" 
                        value={promoFormDate}
                        onChange={(e) => setPromoFormDate(e.target.value)}
                        placeholder="e.g. 31/05/2026"
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Excerpt summary (under card detail)</label>
                      <textarea 
                        value={promoFormExcerpt}
                        onChange={(e) => setPromoFormExcerpt(e.target.value)}
                        placeholder="Provide details about standard tickets or entry requirements..."
                        rows={3}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Button Label</label>
                        <input 
                          type="text" 
                          value={promoFormBtnText}
                          onChange={(e) => setPromoFormBtnText(e.target.value)}
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Target Link</label>
                        <input 
                          type="text" 
                          value={promoFormTargetLink}
                          onChange={(e) => setPromoFormTargetLink(e.target.value)}
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-3">
                      <span className="text-[10px] font-black text-yellow-500 tracking-wider block uppercase">🎨 Flyer Visual Design Attributes</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Badge Title</label>
                          <input 
                            type="text" 
                            value={promoFormFlyerTitle}
                            onChange={(e) => setPromoFormFlyerTitle(e.target.value)}
                            placeholder="e.g. MEGA7 Rollover"
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Grand Promo Text</label>
                          <input 
                            type="text" 
                            value={promoFormFlyerAmount}
                            onChange={(e) => setPromoFormFlyerAmount(e.target.value)}
                            placeholder="e.g. $50,000,000"
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Flyer Sub-text</label>
                          <input 
                            type="text" 
                            value={promoFormFlyerSub}
                            onChange={(e) => setPromoFormFlyerSub(e.target.value)}
                            placeholder="e.g. Buy 5 tickets to entry"
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Flyer Footer Banner</label>
                          <input 
                            type="text" 
                            value={promoFormFlyerExtra}
                            onChange={(e) => setPromoFormFlyerExtra(e.target.value)}
                            placeholder="e.g. OFFER ENDS SUNDAY"
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Flyer Theme Gradient Classes (Tailwind)</label>
                        <select 
                          value={promoFormFlyerGradient}
                          onChange={(e) => setPromoFormFlyerGradient(e.target.value)}
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        >
                          <option value="from-amber-600 via-[#E52535] to-[#4A030A] text-zinc-900 dark:text-white">🔥 Amber-Red Glow (Mega7 Theme)</option>
                          <option value="from-purple-800 via-[#7C3AED] to-[#1C1F5C] text-zinc-900 dark:text-white">🔮 Royal Purple-Violet (Eid Special)</option>
                          <option value="from-emerald-700 via-[#0D9488] to-[#113C4A] text-zinc-900 dark:text-white">🌲 Emerald-Teal Multiplier (Green Dreams)</option>
                          <option value="from-blue-600 via-indigo-700 to-[#0A0D2A] text-zinc-900 dark:text-white">🌀 Deep Space Blue Cosmic</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="promoFormIsActiveCheckbox"
                        checked={promoFormIsActive}
                        onChange={(e) => setPromoFormIsActive(e.target.checked)}
                        className="h-4 w-4 bg-white dark:bg-zinc-950 rounded border-zinc-200 dark:border-zinc-800 text-red-600 focus:ring-red-500" 
                      />
                      <label htmlFor="promoFormIsActiveCheckbox" className="text-xs text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-semibold cursor-pointer">
                        Is Active / Visible on frontend Promotions list
                      </label>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        type="submit" 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black p-3 rounded-xl text-xs uppercase tracking-widest transition-all"
                      >
                        {editingPromoId ? 'Save Changes' : 'Publish Promotion'}
                      </button>
                      {editingPromoId && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingPromoId(null);
                            setPromoFormTitle('');
                            setPromoFormDate('');
                            setPromoFormExcerpt('');
                            setPromoFormIsActive(true);
                          }}
                          className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold p-3 rounded-xl text-xs uppercase"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Promotions Excel Spreadsheet Editor */}
                  <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5 font-mono">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Frontend_Slider_Promos.xlsx ({promotions.length} Rows)
                      </h3>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-500">Double click any cell to edit</span>
                    </div>

                    <ExcelSheet
                      sheetName="Frontend_Slider_Promos"
                      columns={[
                        { key: 'title', label: 'Promo Title', type: 'text' },
                        { key: 'date', label: 'Valid Date', type: 'text' },
                        { key: 'excerpt', label: 'Short Excerpt', type: 'text' },
                        { key: 'btnText', label: 'Button Text', type: 'text' },
                        { key: 'targetLink', label: 'Target Link', type: 'text' },
                        { key: 'flyerTitle', label: 'Flyer Badge', type: 'text' },
                        { key: 'flyerAmount', label: 'Grand Prize', type: 'text' },
                        { key: 'flyerSub', label: 'Flyer Desc', type: 'text' },
                        { key: 'isActive', label: 'Is Active', type: 'boolean' }
                      ]}
                      data={promotions}
                      onDataChange={async (updated) => {
                        const oldData = promotions;
                        for (let i = 0; i < updated.length; i++) {
                          const newRow = updated[i];
                          const oldRow = oldData.find(p => p.id === newRow.id);
                          if (oldRow) {
                            const changedFields: any = {};
                            let hasChanged = false;
                            for (const key of ['title', 'date', 'excerpt', 'btnText', 'targetLink', 'flyerTitle', 'flyerAmount', 'flyerSub', 'isActive']) {
                              if (newRow[key] !== oldRow[key]) {
                                changedFields[key] = newRow[key];
                                hasChanged = true;
                              }
                            }
                            if (hasChanged) {
                              try {
                                await updatePromotion(newRow.id, changedFields);
                              } catch (err) {
                                console.error("Error updating promo:", err);
                              }
                            }
                          }
                        }
                      }}
                      onDeleteRow={(idx, row) => {
                        handleDeletePromotionClick(row.id);
                      }}
                    />
                  </div>

                </div>
              )}

              {/* Sub-tab 2: NEWS ARTICLES */}
              {announcementsSubTab === 'news' && (
                <div className="grid grid-cols-1 gap-8 items-start">
                  
                  {/* News Edit/Add Form */}
                  <form onSubmit={handleSaveNewsArticle} className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-red-500">
                      {editingNewsId ? '✏️ Edit News Article' : '➕ Create New News Article'}
                    </h3>
                    
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">News Title / Slogan</label>
                      <input 
                        type="text" 
                        value={newsFormTitle}
                        onChange={(e) => setNewsFormTitle(e.target.value)}
                        placeholder="e.g. Indian Expat Wins AED 10 Million!"
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Release Date text</label>
                      <input 
                        type="text" 
                        value={newsFormDate}
                        onChange={(e) => setNewsFormDate(e.target.value)}
                        placeholder="e.g. 11 June 2026"
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Excerpt / Summary Description</label>
                      <textarea 
                        value={newsFormExcerpt}
                        onChange={(e) => setNewsFormExcerpt(e.target.value)}
                        placeholder="Write details about the story here..."
                        rows={4}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Featured Image URL</label>
                      <input 
                        type="text" 
                        value={newsFormImageUrl}
                        onChange={(e) => setNewsFormImageUrl(e.target.value)}
                        placeholder="e.g. https://images.unsplash.com/photo-..."
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1"
                      />
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-500 mt-1 block">Leave empty to use clean default placeholder.</span>
                    </div>

                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-3">
                      <span className="text-[10px] font-black text-yellow-500 tracking-wider block uppercase font-sans">🎖️ Card Highlight Overlay (Optional)</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Banner Header</label>
                          <input 
                            type="text" 
                            value={newsFormBannerTitle}
                            onChange={(e) => setNewsFormBannerTitle(e.target.value)}
                            placeholder="e.g. SURE1 WINNER"
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Banner Subtitle</label>
                          <input 
                            type="text" 
                            value={newsFormBannerSubtitle}
                            onChange={(e) => setNewsFormBannerSubtitle(e.target.value)}
                            placeholder="e.g. $30,000"
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase block">Banner Overlay Background Style</label>
                        <select 
                          value={newsFormBannerBg}
                          onChange={(e) => setNewsFormBannerBg(e.target.value)}
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 w-full mt-1 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        >
                          <option value="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 text-zinc-900 dark:text-white">💗 Pink-Rose Gradient (SURE1 style)</option>
                          <option value="bg-gradient-to-r from-emerald-600 to-teal-500 text-zinc-900 dark:text-white">💚 Emerald-Teal Gradient (EASY6 style)</option>
                          <option value="bg-gradient-to-r from-red-650 from-red-600 via-[#E52535] to-amber-500 text-zinc-900 dark:text-white">❤️ Eid Red-Gold Special</option>
                          <option value="bg-gradient-to-r from-[#1E2E80] to-indigo-500 text-zinc-900 dark:text-white">💙 Deep Royal Indigo-Blue</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="checkbox" 
                        id="newsFormIsActiveCheckbox"
                        checked={newsFormIsActive}
                        onChange={(e) => setNewsFormIsActive(e.target.checked)}
                        className="h-4 w-4 bg-white dark:bg-zinc-950 rounded border-zinc-200 dark:border-zinc-800 text-red-600 focus:ring-red-500" 
                      />
                      <label htmlFor="newsFormIsActiveCheckbox" className="text-xs text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-semibold cursor-pointer">
                        Is Active / Visible on frontend News list
                      </label>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button 
                        type="submit" 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black p-3 rounded-xl text-xs uppercase tracking-widest transition-all"
                      >
                        {editingNewsId ? 'Save Changes' : 'Publish Article'}
                      </button>
                      {editingNewsId && (
                        <button 
                          type="button"
                          onClick={() => {
                            setEditingNewsId(null);
                            setNewsFormTitle('');
                            setNewsFormDate('');
                            setNewsFormExcerpt('');
                            setNewsFormImageUrl('');
                            setNewsFormIsActive(true);
                          }}
                          className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold p-3 rounded-xl text-xs uppercase"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  {/* News Articles Excel Spreadsheet Editor */}
                  <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 tracking-wider flex items-center gap-1.5 font-mono">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> News_Articles.xlsx ({newsArticles.length} Rows)
                      </h3>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-500">Double click any cell to edit</span>
                    </div>

                    <ExcelSheet
                      sheetName="News_Articles"
                      columns={[
                        { key: 'title', label: 'Article Title', type: 'text' },
                        { key: 'category', label: 'Category', type: 'text' },
                        { key: 'date', label: 'Release Date', type: 'text' },
                        { key: 'imageUrl', label: 'Image URL', type: 'image' },
                        { key: 'excerpt', label: 'Summary', type: 'text' },
                        { key: 'content', label: 'Content Markdown', type: 'text' },
                        { key: 'isActive', label: 'Is Active', type: 'boolean' }
                      ]}
                      data={newsArticles}
                      onDataChange={async (updated) => {
                        const oldData = newsArticles;
                        for (let i = 0; i < updated.length; i++) {
                          const newRow = updated[i];
                          const oldRow = oldData.find(n => n.id === newRow.id);
                          if (oldRow) {
                            const changedFields: any = {};
                            let hasChanged = false;
                            for (const key of ['title', 'category', 'date', 'imageUrl', 'excerpt', 'content', 'isActive']) {
                              if (newRow[key] !== oldRow[key]) {
                                changedFields[key] = newRow[key];
                                hasChanged = true;
                              }
                            }
                            if (hasChanged) {
                              try {
                                await updateNewsArticle(newRow.id, changedFields);
                              } catch (err) {
                                console.error("Error updating news article:", err);
                              }
                            }
                          }
                        }
                      }}
                      onDeleteRow={(idx, row) => {
                        handleDeleteNewsClick(row.id);
                      }}
                    />
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 4: Website Customizer Dashboard */}
          {activeTab === 'customizer' && (
            <div className="space-y-8 animate-fade-in text-zinc-900 dark:text-white text-left">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-white">
                  <Sliders className="w-5 h-5 text-red-500" /> Real-time System Theme & Brand Customizer
                </h2>
                <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1 font-medium">
                  Adjust color palettes, edit logo text, and swap hero banner details. Changes propagate instantly across all active views.
                </p>
              </div>

              {/* Detailed Page Guide / কুইক এডমিন গাইড */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-2xl" />
                <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-purple-400" /> 💡 Admin Control Guide • এই পেজের কাজের বিবরণী
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                      এখানে আপনি কোনো কোড এডিট না করেই সম্পূর্ণ ওয়েবসাইটের রঙ, ব্যানার স্লোগান, কন্টাক্ট ইনফরমেশন এবং ফুটার কাস্টমাইজ করতে পারবেন।
                    </p>
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span><b>Quick Palette Presets (কালার প্যালেট):</b> ওয়েবসাইটের প্রধান ব্র্যান্ডিং কালার হিসেবে Golobal Red, Cyan Neon, Emerald বা Royal Gold সেট করার বাটন।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span><b>Header & Footer settings (ব্র্যান্ড নাম):</b> সাইটের নাম, লোগো টেক্সট, কপিরাইট নোটিশ এবং কন্টাক্ট ইমেইল পরিবর্তন করার ইনপুট।</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2.5">
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span><b>Hero Slogan & Jackpot Amount (ব্যানার টেক্সট ও জ্যাকপট):</b> হোমপেজের বড় ব্যানার টাইটেল, অফার সাব-টাইটেল, টপ নোটিফিকেশন বার এবং জ্যাকপটের মেগা অ্যামাউন্ট এডিট করার ফিল্ড।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-purple-400 mt-0.5">•</span>
                        <span><b>Save Branding Settings (সংরক্ষণ বাটন):</b> আপনার করা সব পরিবর্তন হোমপেজ এবং সাইটে লাইভ কার্যকর করতে এই বড় কালো সেভ বাটনে চাপুন।</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 items-start">
                
                {/* Form Editor panel */}
                <form onSubmit={handleSaveSiteConfig} className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900 border border-zinc-805 border-zinc-200 dark:border-zinc-800 rounded-2xl p-6.5 p-6 space-y-6">
                  
                  {/* Preset Quick Colors Row */}
                  <div>
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block mb-2.5">Quick Brand Palette Presets</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryHex('#E52535')}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-900 dark:text-white bg-[#E52535] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-2 h-2 bg-white rounded-full"></span> Golobal Red
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryHex('#0284C7')}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-900 dark:text-white bg-[#0284C7] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-2 h-2 bg-white rounded-full"></span> Sky Blue
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryHex('#059669')}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-900 dark:text-white bg-[#059669] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-2 h-2 bg-white rounded-full"></span> Emerald Forest
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryHex('#D97706')}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-900 dark:text-white bg-[#D97706] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-2 h-2 bg-white rounded-full"></span> Solar Gold
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimaryHex('#7C3AED')}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-900 dark:text-white bg-[#7C3AED] hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="w-2 h-2 bg-white rounded-full"></span> Purple Amethyst
                      </button>
                    </div>
                  </div>

                  {/* Brand Custom Hex Box */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Main Brand Accent Hex Color</label>
                      <div className="flex gap-2 mt-1.5 items-center">
                        <input 
                          type="color" 
                          value={primaryHex}
                          onChange={(e) => setPrimaryHex(e.target.value)}
                          className="w-12 h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer p-1"
                        />
                        <input 
                          type="text" 
                          value={primaryHex}
                          onChange={(e) => setPrimaryHex(e.target.value)}
                          placeholder=""
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 w-full text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Logo Headline Text Badge</label>
                      <input 
                        type="text" 
                        value={primaryLogoText}
                        onChange={(e) => setPrimaryLogoText(e.target.value)}
                        placeholder="GLOBAL"
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500 font-bold uppercase"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Logo Image URL (Optional)</label>
                      <div className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          value={logoImageUrl}
                          onChange={(e) => setLogoImageUrl(e.target.value)}
                          placeholder="e.g., https://domain.com/logo.png"
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 flex-1 mt-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500 font-medium"
                        />
                        {logoImageUrl && (
                          <div className="mt-1.5 w-11 h-11 bg-white rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 p-1">
                            <img src={resolveBannerImage(logoImageUrl)} alt="Logo Preview" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Hero Settings Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Hero Banner Headline</label>
                      <input 
                        type="text" 
                        value={heroHeadline}
                        onChange={(e) => setHeroHeadline(e.target.value)}
                        placeholder=""
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Hero Jackpot Slogan Text</label>
                      <input 
                        type="text" 
                        value={heroJackpotAmount}
                        onChange={(e) => setHeroJackpotAmount(e.target.value)}
                        placeholder=""
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500 font-bold text-yellow-550"
                        required
                      />
                    </div>
                  </div>

                  {/* Draw End and Days Counter */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Subheading Draw Ends Info</label>
                      <input 
                        type="text" 
                        value={heroDetails}
                        onChange={(e) => setHeroDetails(e.target.value)}
                        placeholder=""
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block font-bold text-center">Days Remaining</label>
                      <input 
                        type="text" 
                        value={heroDaysToGo}
                        onChange={(e) => setHeroDaysToGo(e.target.value)}
                        placeholder=""
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-red-500 text-center font-bold"
                        required
                      />
                    </div>
                  </div>

                  {/* Mascot Image URL */}
                  <div>
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Banner Illustration Mascot Image Link</label>
                    <input 
                      type="text" 
                      value={bannerMascotUrl}
                      onChange={(e) => setBannerMascotUrl(e.target.value)}
                      placeholder=""
                      className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                    />
                    <div className="flex flex-wrap gap-2 mt-2 select-none">
                      <button
                        type="button"
                        onClick={() => setBannerMascotUrl('/images/emirates_winner_mascot_1781774955947.jpg')}
                        className="bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-350 hover:text-zinc-900 dark:text-white px-3 py-1.5 rounded text-[9.5px] font-bold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                      >
                        ⭐ Default Mascot
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerMascotUrl('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=400')}
                        className="bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-350 hover:text-zinc-900 dark:text-white px-3 py-1.5 rounded text-[9.5px] font-bold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                      >
                        💰 Wealth Gold Vault
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerMascotUrl('https://images.unsplash.com/photo-1561414927-6d86591d0c4f?auto=format&fit=crop&q=80&w=400')}
                        className="bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-350 hover:text-zinc-900 dark:text-white px-3 py-1.5 rounded text-[9.5px] font-bold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                      >
                        🏆 Winner Spotlight
                      </button>
                    </div>
                  </div>

                  {/* Hero Background styling selection */}
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Hero Banner Background Mode</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setHeroBannerBgType('gradient')}
                        className={`py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          heroBannerBgType === 'gradient'
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-500 text-zinc-900 dark:text-white font-extrabold'
                            : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white'
                        }`}
                      >
                        🌋 Dark Gradient
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroBannerBgType('solid')}
                        className={`py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          heroBannerBgType === 'solid'
                            ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-500 text-zinc-900 dark:text-white font-extrabold'
                            : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white'
                        }`}
                      >
                        🎨 Solid Custom Color
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">Global Games Background Override</span>
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest block">Force ALL Games Solid Background</span>
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-medium">Global override to use flat colors for all game cards</span>
                        </div>
                        <input 
                          type="checkbox"
                          checked={allGamesSolidBg}
                          onChange={(e) => setAllGamesSolidBg(e.target.checked)}
                          className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
                        />
                      </div>
                      {allGamesSolidBg && (
                        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Global Solid Hex</label>
                          <input 
                            type="color" 
                            value={allGamesSolidHex || '#1C2C80'}
                            onChange={(e) => setAllGamesSolidHex(e.target.value)}
                            className="w-8 h-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={allGamesSolidHex || '#1C2C80'}
                            onChange={(e) => setAllGamesSolidHex(e.target.value)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 flex-1 text-xs font-mono text-zinc-900 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer & Contact Details Customizer */}
                  <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block border-b border-[#212126] pb-2">
                      📞 Support Contacts & Legal Customizer (ফুটার কন্টাক্ট ও লাইসেন্স এডিটর)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Email Support Address</label>
                        <input 
                          type="email" 
                          value={footerEmail}
                          onChange={(e) => setFooterEmail(e.target.value)}
                          placeholder="support@draw.com"
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">WhatsApp Number / Link</label>
                        <input 
                          type="text" 
                          value={footerWhatsapp}
                          onChange={(e) => setFooterWhatsapp(e.target.value)}
                          placeholder="+1 234 567 890"
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Telegram Username</label>
                        <input 
                          type="text" 
                          value={footerTelegram}
                          onChange={(e) => setFooterTelegram(e.target.value)}
                          placeholder="@drawsupport"
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">IMO Chat ID / Text</label>
                        <input 
                          type="text" 
                          value={footerImo}
                          onChange={(e) => setFooterImo(e.target.value)}
                          placeholder="Live IMO"
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Live Chat Text / Link</label>
                        <input 
                          type="text" 
                          value={footerLiveChat}
                          onChange={(e) => setFooterLiveChat(e.target.value)}
                          placeholder="24/7 Agent"
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#212126]">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">License Board</label>
                        <input 
                          type="text" 
                          value={footerLicenseBoard}
                          onChange={(e) => setFooterLicenseBoard(e.target.value)}
                          placeholder="Curacao eGaming Regulatory Authority"
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">License Serial ID Info</label>
                        <input 
                          type="text" 
                          value={footerLicenseSerial}
                          onChange={(e) => setFooterLicenseSerial(e.target.value)}
                          placeholder="#1668/JAZ - 2026 AUDITED LOTTERY PROTOCOL"
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">GCC Compliance ID</label>
                      <input 
                        type="text" 
                        value={footerGccCompliance}
                        onChange={(e) => setFooterGccCompliance(e.target.value)}
                        placeholder="GCC-L-984210"
                        className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 w-full mt-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button for Site Config */}
                  <button 
                    type="submit" 
                    style={{ backgroundColor: primaryHex }}
                    className="w-full text-zinc-900 dark:text-white font-extrabold p-4 rounded-xl text-xs uppercase tracking-widest transform transition active:scale-95 shadow-md cursor-pointer hover:opacity-95 mb-4"
                  >
                    💾 Save Dynamic Branding Changes
                  </button>
                </form>

                {/* Real-time Dynamic Game Settings Configuration */}
                <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
                  <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2">
                      <div>
                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">🎛️ Game Settings Editor</span>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-0.5">Edit, add or delete lottery games live.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingGame(!isAddingGame)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1 ${
                          isAddingGame
                            ? 'bg-yellow-500 text-zinc-950 font-extrabold'
                            : 'bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 text-green-400 hover:text-zinc-900 dark:text-white border border-green-500/20'
                        }`}
                      >
                        {isAddingGame ? '❌ Cancel' : '➕ Add Game'}
                      </button>
                    </div>

                     {/* Game Selector Tab bar inside customizer with inline delete button */}
                     <div className="flex flex-wrap gap-2 pb-2">
                       {dynamicGames.map((game) => (
                         <div 
                           key={game.name} 
                           className={`flex items-center gap-1.5 p-1 rounded-xl border transition-all ${
                             !isAddingGame && selectedGameToEdit === game.name
                               ? 'bg-red-950/85 border-red-500/50 text-zinc-900 dark:text-white'
                               : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:border-zinc-300 dark:border-zinc-700'
                           }`}
                         >
                           <button
                             type="button"
                             onClick={() => {
                               setSelectedGameToEdit(game.name);
                               setIsAddingGame(false);
                             }}
                             className={`px-2 py-1 rounded-lg text-xs font-black transition whitespace-nowrap cursor-pointer ${
                               !isAddingGame && selectedGameToEdit === game.name
                                 ? 'text-zinc-900 dark:text-white'
                                 : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white'
                             }`}
                           >
                             {game.name}
                           </button>
                           <button
                             type="button"
                             onClick={async () => {
                               const confirmDel = window.confirm(`Are you sure you want to permanently delete the game "${game.name}"?`);
                               if (!confirmDel) return;
                               try {
                                 await deleteDynamicGame(game.name);
                                 alert(`🗑️ Game "${game.name}" deleted successfully.`);
                                 if (dynamicGames.length > 1) {
                                   const remaining = dynamicGames.filter(g => g.name !== game.name);
                                   setSelectedGameToEdit(remaining[0].name);
                                 } else {
                                   setEditingGame(null);
                                 }
                               } catch (err) {
                                 alert('❌ Failed to delete game.');
                               }
                             }}
                             className="p-1.5 hover:bg-red-900/40 text-red-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                             title={`Delete ${game.name}`}
                           >
                             <Trash2 className="w-3.5 h-3.5" />
                           </button>
                         </div>
                       ))}
                     </div>

                    {/* Selected Game Config Form fields */}
                    {(() => {
                      if (isAddingGame) {
                        return (
                          <div className="space-y-3 pt-2 text-zinc-700 dark:text-zinc-300">
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/60 mb-2">
                              <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest block">➕ CREATE A NEW LOTTERY GAME</span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 block leading-tight mt-0.5">Define name, jackpot prize, ticket price, and draw frequency.</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Game Name Title</label>
                                <input 
                                  type="text"
                                  value={newGameName}
                                  onChange={(e) => setNewGameName(e.target.value)}
                                  placeholder="E.g. COCO9"
                                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none focus:border-green-500 uppercase font-black"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Grand Jackpot Prize</label>
                                <input 
                                  type="text"
                                  value={newGamePrize}
                                  onChange={(e) => setNewGamePrize(e.target.value)}
                                  placeholder="E.g. $45,000,000"
                                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none focus:border-green-500 font-bold"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Ticket Price ($)</label>
                                <input 
                                  type="number"
                                  value={newGamePrice}
                                  onChange={(e) => setNewGamePrice(Number(e.target.value))}
                                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none focus:border-green-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Draw Frequency Description</label>
                                <input 
                                  type="text"
                                  value={newGameDrawTime}
                                  onChange={(e) => setNewGameDrawTime(e.target.value)}
                                  placeholder="E.g. Every Friday"
                                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none focus:border-green-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Balls to Select (e.g. 5, 6, 7)</label>
                                <input 
                                  type="number"
                                  value={newGameBallCount}
                                  onChange={(e) => setNewGameBallCount(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Max Ball Value (e.g. 39, 49)</label>
                                <input 
                                  type="number"
                                  value={newGameMaxBallValue}
                                  onChange={(e) => setNewGameMaxBallValue(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Card Solid Color Hex</label>
                              <div className="flex gap-2 mt-1 items-center">
                                <input 
                                  type="color" 
                                  value={newGameBgHex}
                                  onChange={(e) => setNewGameBgHex(e.target.value)}
                                  className="w-10 h-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded cursor-pointer p-0.5"
                                />
                                <input 
                                  type="text" 
                                  value={newGameBgHex}
                                  onChange={(e) => setNewGameBgHex(e.target.value)}
                                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 flex-1 text-zinc-800 dark:text-zinc-200 font-mono text-xs focus:outline-none"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleCreateNewGame}
                              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-[10px] uppercase tracking-widest transition transform active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                            >
                              🚀 Create & Launch Game Now
                            </button>
                          </div>
                        );
                      }

                      if (!editingGame) return (
                        <div className="py-12 text-center text-zinc-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          Select a game to customize
                        </div>
                      );

                      return (
                        <div className="space-y-3 pt-2 text-zinc-700 dark:text-zinc-300">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Game Name Title</label>
                              <input 
                                type="text"
                                value={editingGame.name}
                                onChange={(e) => handleUpdateEditingGame({ name: e.target.value })}
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Grand Jackpot Prize</label>
                              <input 
                                type="text"
                                value={editingGame.prize}
                                onChange={(e) => handleUpdateEditingGame({ prize: e.target.value })}
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none font-bold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Ticket Price ($)</label>
                              <input 
                                type="number"
                                value={editingGame.price}
                                onChange={(e) => handleUpdateEditingGame({ price: Number(e.target.value) })}
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Draw Frequency Description</label>
                              <input 
                                type="text"
                                value={editingGame.drawTime}
                                onChange={(e) => handleUpdateEditingGame({ drawTime: e.target.value })}
                                placeholder="Sunday or Daily"
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Balls/Digits to Select (e.g. 5, 6, 7)</label>
                              <input 
                                type="number"
                                value={editingGame.ballCount || 5}
                                onChange={(e) => handleUpdateEditingGame({ ballCount: Math.max(1, parseInt(e.target.value) || 1) })}
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Max Ball Value Range (e.g. 39, 49, 99)</label>
                              <input 
                                type="number"
                                value={editingGame.maxBallValue || 49}
                                onChange={(e) => handleUpdateEditingGame({ maxBallValue: Math.max(1, parseInt(e.target.value) || 1) })}
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Target Draw Countdown Date & Time (Real-Time)</label>
                              <input 
                                type="datetime-local"
                                value={(() => {
                                  try {
                                    const date = new Date(editingGame.targetDateStr);
                                    const tzoffset = date.getTimezoneOffset() * 60000;
                                    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, -1);
                                    return localISOTime.substring(0, 16);
                                  } catch(err) {
                                    return '';
                                  }
                                })()}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleUpdateEditingGame({ targetDateStr: new Date(e.target.value).toISOString() });
                                  }
                                }}
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 w-full text-xs mt-1 text-zinc-900 dark:text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-3 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                            <div>
                              <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest block">Force Solid Game Card Style</span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-medium">Use a flat color instead of gradients or images for this game card</span>
                            </div>
                            <input 
                              type="checkbox"
                              checked={editingGame.isSolidStyle || false}
                              onChange={(e) => handleUpdateEditingGame({ isSolidStyle: e.target.checked })}
                              className="w-5 h-5 accent-red-600 rounded-lg cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between py-3 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                            <div>
                              <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest block">Game Status (ON / OFF)</span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-medium">When turned OFF, this game will be hidden from the website</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateEditingGame({ isActive: editingGame.isActive !== false ? false : true })}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                                editingGame.isActive !== false 
                                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/25' 
                                  : 'bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-350'
                              }`}
                            >
                              {editingGame.isActive !== false ? '🟢 Active (ON)' : '🔴 Disabled (OFF)'}
                            </button>
                          </div>

                          {/* Card Background Style Type */}
                          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-900 space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Game Card Background Type</label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { type: 'color', label: '🎨 Color' },
                                { type: 'gradient', label: '🌌 Gradient' },
                                { type: 'image', label: '🖼️ Image' }
                              ].map((item) => (
                                <button
                                  key={item.type}
                                  type="button"
                                  onClick={() => {
                                    const updates: any = { cardBgType: item.type };
                                    if (item.type === 'gradient') {
                                      if (!editingGame.cardBgGradient) updates.cardBgGradient = 'linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)';
                                      updates.isSolidStyle = false;
                                    }
                                    if (item.type === 'image') {
                                      if (!editingGame.cardBgImage) updates.cardBgImage = 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200';
                                      updates.isSolidStyle = false;
                                    }
                                    handleUpdateEditingGame(updates);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition whitespace-nowrap cursor-pointer ${
                                    (editingGame.cardBgType || 'color') === item.type
                                      ? 'bg-yellow-500 text-zinc-950 border-yellow-500'
                                      : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:text-white'
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Conditional Card Background Fields */}
                          {(editingGame.cardBgType === 'color' || !editingGame.cardBgType) && (
                            <div className="grid grid-cols-1 gap-3 pt-1">
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">Solid Card Color</label>
                                <div className="flex gap-2 mt-1 items-center">
                                  <input 
                                    type="color" 
                                    value={editingGame.bgHex || '#E52535'}
                                    onChange={(e) => handleUpdateEditingGame({ bgHex: e.target.value })}
                                    className="w-10 h-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded cursor-pointer p-0.5"
                                  />
                                  <input 
                                    type="text" 
                                    value={editingGame.bgHex || '#E52535'}
                                    onChange={(e) => handleUpdateEditingGame({ bgHex: e.target.value })}
                                    placeholder="#E52535"
                                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 w-full text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {editingGame.cardBgType === 'gradient' && (
                            <div className="grid grid-cols-1 gap-3 pt-1">
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">Custom CSS Gradient</label>
                                <textarea 
                                  value={editingGame.cardBgGradient || 'linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)'}
                                  onChange={(e) => handleUpdateEditingGame({ cardBgGradient: e.target.value })}
                                  placeholder="linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)"
                                  rows={2}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:border-yellow-500 mt-1"
                                />
                                {/* Gradient presets for game card */}
                                <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                                  {[
                                    { name: '🔴 Crimson Sunset', value: 'linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)' },
                                    { name: '👑 Midnight Gold', value: 'linear-gradient(135deg, #111827 0%, #d97706 100%)' },
                                    { name: '🟢 Emerald Oasis', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' },
                                    { name: '🔵 Electric Blue', value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }
                                  ].map((preset) => (
                                    <button
                                      key={preset.name}
                                      type="button"
                                      onClick={() => handleUpdateEditingGame({ cardBgGradient: preset.value })}
                                      className="h-7 rounded border border-white/5 hover:border-white/20 text-[9px] font-bold text-zinc-900 dark:text-white text-left pl-2 flex items-center transition cursor-pointer"
                                      style={{ background: preset.value }}
                                    >
                                      {preset.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {editingGame.cardBgType === 'image' && (
                            <div className="grid grid-cols-1 gap-3 pt-1">
                              <div>
                                <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">Card Background Image URL</label>
                                <input 
                                  type="text" 
                                  value={editingGame.cardBgImage || ''}
                                  onChange={(e) => handleUpdateEditingGame({ cardBgImage: e.target.value })}
                                  placeholder="https://images.unsplash.com/... or ImgBB sharing link"
                                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 w-full text-zinc-800 dark:text-zinc-200 focus:outline-none text-xs mt-1 font-mono"
                                />
                                <p className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase mt-1 font-semibold leading-tight">
                                  💡 Supports standard links & auto-resolves <b>ImgBB sharing links</b>! Fits beautifully on the card background with safe overlays!
                                </p>
                                {/* Quick Image presets */}
                                <div className="flex flex-wrap gap-1.5 pt-1.5">
                                  {[
                                    { name: '💰 Gold Coins', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200' },
                                    { name: '⚡ Red Lightnings', url: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=1200' },
                                    { name: '✨ Sparkles', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200' }
                                  ].map((imgPreset) => (
                                    <button
                                      key={imgPreset.name}
                                      type="button"
                                      onClick={() => handleUpdateEditingGame({ cardBgImage: imgPreset.url })}
                                      className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-2 py-1 rounded text-[8.5px] font-bold transition-colors cursor-pointer"
                                    >
                                      {imgPreset.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Game Prizes Breakdown Customization */}
                          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-900 space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest block font-black">
                                🏆 Prizes Breakdown Customizer (All Games)
                              </label>
                              <span className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-black tracking-wider">
                                manually adjust prize payouts
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              {(() => {
                                // Resolve list of prizes to edit
                                const defaultPrizesList = getDefaultPrizesForGame(editingGame.name, editingGame.ballCount || 5, editingGame.prize);
                                const currentPrizesList = editingGame.prizeBreakdown && editingGame.prizeBreakdown.length > 0
                                  ? editingGame.prizeBreakdown
                                  : defaultPrizesList;

                                return currentPrizesList.map((p, idx) => (
                                  <div key={idx} className="bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 block truncate">{p.label}</span>
                                      <span className="text-[8px] text-zinc-500 dark:text-zinc-500 font-mono">Tier Match Level Count: {p.count}</span>
                                    </div>
                                    <div className="w-1/2">
                                      <input 
                                        type="text"
                                        value={p.prize}
                                        onChange={(e) => {
                                          const updatedBreakdown = currentPrizesList.map((item, curIdx) => 
                                            curIdx === idx ? { ...item, prize: e.target.value } : { ...item }
                                          );
                                          
                                          const updates: Partial<DynamicGame> = { prizeBreakdown: updatedBreakdown };
                                          // If it's the 1st tier (top prize), let's sync the main jackpot field automatically for consistency
                                          if (idx === 0) {
                                            updates.prize = e.target.value;
                                          }
                                          handleUpdateEditingGame(updates);
                                        }}
                                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 px-2 w-full text-xs text-zinc-900 dark:text-white text-right font-sans font-black focus:outline-none focus:border-red-500"
                                        placeholder="e.g. $50,000,000"
                                      />
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                              type="button"
                              onClick={saveIndividualGameSettings}
                              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition transform active:scale-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Update Settings
                            </button>
                            <button
                              type="button"
                              onClick={handleDeleteSelectedGame}
                              className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-red-950 text-red-500 hover:text-zinc-900 dark:text-white border border-red-500/20 hover:border-red-700 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Game
                            </button>
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Banner Real-time interactive preview card */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-500 tracking-wider">Estimated Live Hero Preview</h3>
                  <div 
                    className="p-6 rounded-2xl border flex flex-col justify-between text-left relative overflow-hidden"
                    style={{ 
                      background: heroBannerBgType === 'solid' 
                        ? heroBannerBgSolidHex 
                        : `linear-gradient(135deg, ${primaryHex}, #1c0204)`, 
                      borderColor: heroBannerBgType === 'solid'
                        ? `${heroBannerBgSolidHex}60`
                        : `${primaryHex}60`,
                      minHeight: '260px'
                    }}
                  >
                    {/* Badge */}
                    <div className="flex justify-between items-center z-10 select-none">
                      <span className="bg-[#FFED4A] text-zinc-950 font-black text-[7.5px] tracking-widest px-2 py-0.5 rounded">LIVE PREVIEW</span>
                      <span className="bg-black/60 text-zinc-900 dark:text-white border border-white/10 text-[8px] font-black px-2 py-0.5 rounded uppercase font-mono">
                        {primaryLogoText} DRAW
                      </span>
                    </div>

                    {/* Slogans */}
                    <div className="my-4 space-y-1 z-10 text-zinc-900 dark:text-white leading-tight">
                      <span className="text-[10px] tracking-wide text-zinc-700 dark:text-zinc-300 uppercase leading-none block">{heroHeadline}</span>
                      <h4 className="text-3xl font-black text-[#FFD700] leading-none tracking-tight">{heroJackpotAmount}</h4>
                      <p className="text-[8px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 mt-1">{heroDetails}</p>
                    </div>

                    {/* Footer image indicator preview */}
                    <div className="flex justify-between items-center mt-2 z-10">
                      <div className="flex items-center gap-1.5 bg-black/50 p-1.5 rounded-lg border border-white/5">
                        <span className="text-[9px] font-bold text-[#FFD700]">{heroDaysToGo} Days Remaining</span>
                      </div>
                      <span className="text-[8.5px] font-black text-zinc-900 dark:text-white bg-black/40 px-2 py-1.5 rounded-md">BUY TICKETS NOW</span>
                    </div>

                    {/* Faint Mascot preview representation in bottom right helper background card */}
                    <div className="absolute right-[-20px] bottom-[-20px] w-24 h-24 rounded-full opacity-40 overflow-hidden border border-white/10 pointer-events-none">
                      <img src={resolveBannerImage(bannerMascotUrl)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl space-y-2.5 text-xs text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-mono">
                    <p className="font-bold text-zinc-900 dark:text-white text-xs">🛠️ Site Context Variables State</p>
                    <ul className="space-y-1 text-[11px] leading-relaxed">
                      <li>• Theme Color: <span className="text-green-400">{primaryHex}</span></li>
                      <li>• Logo Slogan: <span className="text-zinc-700 dark:text-zinc-300">{primaryLogoText}</span></li>
                      <li>• Image URL: <span className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 truncate block w-full">{bannerMascotUrl}</span></li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* CUSTOM BANNER MANAGEMENT SECTION */}
              <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="p-1.5 bg-yellow-500/10 text-yellow-450 border border-yellow-500/20 rounded-lg">🖼️</span>
                    Custom Homepage Banners & Slides Manager
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1 text-left">
                    Add custom banners, upload or paste background image URLs, and change active slides. If any active custom banners are present, they will replace the default banner on the homepage in an interactive slider carousel. If all are deactivated, it falls back to the default Golobal Lottery layout.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Create New Banner Form */}
                  <form onSubmit={handleAddBanner} className="lg:col-span-5 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4 text-xs text-zinc-350 text-left">
                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-900 pb-2">
                      <h4 className="text-xs font-black text-yellow-500 uppercase tracking-wider">
                        {editingBannerId ? '✏️ Edit Slide Banner' : 'Add New Slide Banner'}
                      </h4>
                      {editingBannerId && (
                        <button 
                          type="button"
                          onClick={handleCancelEditBanner}
                          className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-2 py-1 rounded text-[9px] font-bold border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Banner Large Title (ঐচ্ছিক - খালি রাখলে শুধু ব্যানার দেখাবে)</label>
                        <input 
                          type="text"
                          value={newBannerTitle}
                          onChange={(e) => setNewBannerTitle(e.target.value)}
                          placeholder="e.g. GET 100% DEPOSIT BONUS TO PLAY! (খালি রাখতে পারেন)"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-yellow-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Banner Subtitle / Slogan (ঐচ্ছিক - খালি রাখতে পারেন)</label>
                        <input 
                          type="text"
                          value={newBannerSubtitle}
                          onChange={(e) => setNewBannerSubtitle(e.target.value)}
                          placeholder="e.g. valid for first time users who sign up in June (খালি রাখতে পারেন)"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-yellow-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Button Text (খালি রাখলে বাটন লুকাবে)</label>
                          <input 
                            type="text"
                            value={newBannerButtonText}
                            onChange={(e) => setNewBannerButtonText(e.target.value)}
                            placeholder="e.g. PLAY NOW (খালি রাখতে পারেন)"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-yellow-500 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Target Link / URL</label>
                          <input 
                            type="text"
                            value={newBannerLinkUrl}
                            onChange={(e) => setNewBannerLinkUrl(e.target.value)}
                            placeholder="e.g. /promotions"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-yellow-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Background Style Type Selectors */}
                      <div>
                        <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1.5">Background Style Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setNewBannerBgType('image')}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              newBannerBgType === 'image'
                                ? 'bg-yellow-500 text-zinc-950 border-yellow-500'
                                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:text-white'
                            }`}
                          >
                            🖼️ Image URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewBannerBgType('color')}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              newBannerBgType === 'color'
                                ? 'bg-yellow-500 text-zinc-950 border-yellow-500'
                                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:text-white'
                            }`}
                          >
                            🎨 Solid Color
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewBannerBgType('gradient')}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                              newBannerBgType === 'gradient'
                                ? 'bg-yellow-500 text-zinc-950 border-yellow-500'
                                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-zinc-900 dark:text-white'
                            }`}
                          >
                            🌌 Gradient
                          </button>
                        </div>
                      </div>

                      {/* Conditional Background Settings */}
                      {newBannerBgType === 'image' && (
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Background Image URL</label>
                          <input 
                            type="text"
                            value={newBannerImageUrl}
                            onChange={(e) => setNewBannerImageUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/... or https://ibb.co/..."
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:border-yellow-500"
                          />
                          <p className="text-[9px] text-zinc-500 dark:text-zinc-500 mt-1 uppercase font-semibold">
                            💡 Supports standard image links and auto-resolves <b>ImgBB sharing links</b>!
                          </p>

                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-900">
                            <div>
                              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">Hide Shadow Overlay</span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-500">Remove black shadow gradient from this banner</span>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={newBannerHideShadow}
                              onChange={(e) => setNewBannerHideShadow(e.target.checked)}
                              className="w-4 h-4 accent-yellow-500 rounded cursor-pointer"
                            />
                          </div>
                          
                          {/* Quick Preset Images */}
                          <div className="mt-2.5 space-y-1.5">
                            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">Quick Background Presets</span>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={() => setNewBannerImageUrl('https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200')}
                                className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-2 py-1 rounded text-[9px] font-bold transition-colors cursor-pointer"
                              >
                                💰 Gold Vault
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewBannerImageUrl('https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=1200')}
                                className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-2 py-1 rounded text-[9px] font-bold transition-colors cursor-pointer"
                              >
                                🌌 Cyber Sparks
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewBannerImageUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200')}
                                className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-2 py-1 rounded text-[9px] font-bold transition-colors cursor-pointer"
                              >
                                📈 Success Chart
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewBannerImageUrl('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200')}
                                className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-2 py-1 rounded text-[9px] font-bold transition-colors cursor-pointer"
                              >
                                🌃 City Skyline
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {newBannerBgType === 'color' && (
                        <div className="space-y-2">
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Solid Background Color (Hex)</label>
                          <div className="flex gap-2">
                            <input 
                              type="color"
                              value={newBannerBgColor}
                              onChange={(e) => setNewBannerBgColor(e.target.value)}
                              className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent cursor-pointer overflow-hidden p-0"
                            />
                            <input 
                              type="text"
                              value={newBannerBgColor}
                              onChange={(e) => setNewBannerBgColor(e.target.value)}
                              placeholder="#0f0f14"
                              className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:border-yellow-500"
                            />
                          </div>
                          
                          {/* Color Presets */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">Quick Color Presets</span>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {[
                                { name: '🔴 Draw Crimson', hex: '#1c0204' },
                                { name: '⚫ Deep Charcoal', hex: '#09090b' },
                                { name: '🔵 Royal Navy', hex: '#0a1128' },
                                { name: '🟢 Emerald Dark', hex: '#051f14' },
                                { name: '🟣 Cyber Violet', hex: '#14051f' },
                                { name: '🔥 Hot Orange', hex: '#240a02' }
                              ].map((preset) => (
                                <button
                                  key={preset.hex}
                                  type="button"
                                  onClick={() => setNewBannerBgColor(preset.hex)}
                                  className="w-6 h-6 rounded border border-white/10 relative group hover:scale-110 active:scale-95 transition-all cursor-pointer"
                                  style={{ backgroundColor: preset.hex }}
                                  title={preset.name}
                                >
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black text-zinc-900 dark:text-white text-[8px] py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap z-20">
                                    {preset.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {newBannerBgType === 'gradient' && (
                        <div className="space-y-2">
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider">Custom CSS Gradient</label>
                          <textarea 
                            value={newBannerBgGradient}
                            onChange={(e) => setNewBannerBgGradient(e.target.value)}
                            placeholder="linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)"
                            rows={2}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:border-yellow-500"
                          />
                          
                          {/* Gradient Presets */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block">Quick Gradient Presets</span>
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              {[
                                { name: '🔴 Crimson Sunset', value: 'linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)' },
                                { name: '👑 Midnight Gold', value: 'linear-gradient(135deg, #111827 0%, #d97706 100%)' },
                                { name: '🌌 Cyber Aurora', value: 'linear-gradient(135deg, #09090b 0%, #31103f 50%, #1e1b4b 100%)' },
                                { name: '🟢 Emerald Oasis', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' },
                                { name: '🔵 Electric Blue', value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
                                { name: '🔥 Magma Core', value: 'linear-gradient(135deg, #ea580c 0%, #000000 100%)' }
                              ].map((preset) => (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => setNewBannerBgGradient(preset.value)}
                                  className="h-8 rounded border border-white/10 hover:border-white/30 text-[9px] font-bold text-zinc-900 dark:text-white text-left pl-2 flex items-center transition hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow"
                                  style={{ background: preset.value }}
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Typography & Button Color Theme */}
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-900 space-y-3">
                        <span className="text-[9px] font-extrabold text-yellow-500 uppercase tracking-wider block">🎨 Typography & Button Theme</span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[8px] tracking-wider mb-1">Text Color</label>
                            <div className="flex gap-1.5">
                              <input 
                                type="color"
                                value={newBannerTextColor}
                                onChange={(e) => setNewBannerTextColor(e.target.value)}
                                className="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-800 bg-transparent cursor-pointer overflow-hidden p-0"
                              />
                              <input 
                                type="text"
                                value={newBannerTextColor}
                                onChange={(e) => setNewBannerTextColor(e.target.value)}
                                placeholder="#ffffff"
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-1 text-zinc-900 dark:text-white font-mono text-[10px]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[8px] tracking-wider mb-1">Button Color</label>
                            <div className="flex gap-1.5">
                              <input 
                                type="color"
                                value={newBannerButtonColor}
                                onChange={(e) => setNewBannerButtonColor(e.target.value)}
                                className="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-800 bg-transparent cursor-pointer overflow-hidden p-0"
                              />
                              <input 
                                type="text"
                                value={newBannerButtonColor}
                                onChange={(e) => setNewBannerButtonColor(e.target.value)}
                                placeholder="#FFD700"
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-1 text-zinc-900 dark:text-white font-mono text-[10px]"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[8px] tracking-wider mb-1">Button Text Color</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="color"
                              value={newBannerButtonTextColor}
                              onChange={(e) => setNewBannerButtonTextColor(e.target.value)}
                              className="w-7 h-7 rounded border border-zinc-200 dark:border-zinc-800 bg-transparent cursor-pointer overflow-hidden p-0"
                            />
                            <input 
                              type="text"
                              value={newBannerButtonTextColor}
                              onChange={(e) => setNewBannerButtonTextColor(e.target.value)}
                              placeholder="#09090b"
                              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-1 text-zinc-900 dark:text-white font-mono text-[10px]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1.5">
                        <input 
                          type="checkbox" 
                          id="newBannerIsActive"
                          checked={newBannerIsActive}
                          onChange={(e) => setNewBannerIsActive(e.target.checked)}
                          className="h-4 w-4 bg-zinc-50 dark:bg-zinc-900 rounded border-zinc-200 dark:border-zinc-800 text-yellow-550 focus:ring-yellow-500 accent-yellow-500 cursor-pointer" 
                        />
                        <label htmlFor="newBannerIsActive" className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-semibold cursor-pointer select-none">
                          Enable this banner immediately
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-zinc-950 font-extrabold uppercase text-xs p-3.5 rounded-xl transition-all cursor-pointer shadow mt-2"
                    >
                      {editingBannerId ? '✏️ Update Selected Banner' : '🚀 Add Custom Banner Slide'}
                    </button>
                  </form>

                  {/* Active Banners List Grid */}
                  <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4 text-left">
                    <div>
                      <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Manage Banners ({currentBanners.length})</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Toggle status, edit, or remove custom slide decks</p>
                    </div>

                    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {currentBanners.map((bannerItem) => (
                        <div 
                          key={bannerItem.id}
                          className="bg-[#121215] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                        >
                          <div className="flex items-center gap-3">
                            {/* Small thumbnail preview */}
                            <div className="w-20 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow">
                              {bannerItem.bgType === 'color' ? (
                                <div className="w-full h-full" style={{ backgroundColor: bannerItem.bgColor || '#0f0f14' }} />
                              ) : bannerItem.bgType === 'gradient' ? (
                                <div className="w-full h-full" style={{ background: bannerItem.bgGradient || 'linear-gradient(135deg, #FF2E42, #1c0204)' }} />
                              ) : (
                                <img src={resolveBannerImage(bannerItem.imageUrl)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              )}
                              <span className="absolute bottom-0 right-0 text-[7px] bg-black/85 px-1 py-0.5 rounded text-zinc-700 dark:text-zinc-300 uppercase font-black tracking-tight scale-90 border-t border-l border-zinc-200 dark:border-zinc-800">
                                {bannerItem.bgType || 'image'}
                              </span>
                            </div>
                            
                            <div className="leading-tight min-w-0 flex-1">
                              <span className="font-extrabold text-zinc-900 dark:text-white text-xs block truncate">{bannerItem.title || "No Title (সরাসরি ব্যানার)"}</span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block truncate mt-1">
                                {bannerItem.subtitle || "No subtitle"} • <span className="font-mono text-yellow-500">{bannerItem.linkUrl}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                            {/* Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleBannerActive(bannerItem.id)}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition border cursor-pointer uppercase ${
                                bannerItem.isActive 
                                  ? 'bg-green-950/60 text-green-400 border-green-800/60' 
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800'
                              }`}
                            >
                              {bannerItem.isActive ? '● Active' : '○ Inactive'}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEditBanner(bannerItem)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition ${
                                editingBannerId === bannerItem.id
                                  ? 'bg-yellow-500 text-zinc-950'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800'
                              }`}
                              title="Edit Banner details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this custom banner?")) {
                                  handleDeleteBanner(bannerItem.id);
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-red-950/40 text-red-500 hover:bg-red-900/60 flex items-center justify-center cursor-pointer transition"
                              title="Delete Banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {currentBanners.length === 0 && (
                        <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black">No custom banners created. Create your first banner on the left!</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#121215] p-3 rounded-xl border border-zinc-200 dark:border-zinc-900 text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">
                      💡 <b>Note:</b> You can disable all custom banners to instantly switch back to the classic Golobal Lottery themed hero section with the jackpot counters and mascots.
                    </div>
                  </div>
                </div>
              </div>

              {/* HOMEPAGE STATISTICS & VIDEO LINK CUSTOMIZER */}
              <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg">📊</span>
                    Showcase Section: Stats & YouTube Video
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1 text-left">
                    Configure the live drawing YouTube video link, thumbnail, titles, and manually override the live statistics shown in the third card.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* YouTube settings */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-2 text-indigo-400">📺 YouTube Live Draw Card Settings</h4>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">YouTube Video URL</label>
                        <input 
                          type="text" 
                          value={youtubeVideoUrl} 
                          onChange={(e) => setYoutubeVideoUrl(e.target.value)}
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Thumbnail Image URL</label>
                        <input 
                          type="text" 
                          value={youtubeThumbnailUrl} 
                          onChange={(e) => setYoutubeThumbnailUrl(e.target.value)}
                          placeholder="Image URL"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Card Title</label>
                          <input 
                            type="text" 
                            value={youtubeVideoTitle} 
                            onChange={(e) => setYoutubeVideoTitle(e.target.value)}
                            placeholder="e.g. From Mother's Blessings to..."
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Card Tag/Category</label>
                          <input 
                            type="text" 
                            value={youtubeVideoSubtitle} 
                            onChange={(e) => setYoutubeVideoSubtitle(e.target.value)}
                            placeholder="e.g. INTERVIEWS"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Card Short Slogan</label>
                        <input 
                          type="text" 
                          value={youtubeVideoDescription} 
                          onChange={(e) => setYoutubeVideoDescription(e.target.value)}
                          placeholder="e.g. Meet our lucky winners"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Card Detail Description</label>
                        <textarea 
                          rows={2}
                          value={youtubeVideoDetails} 
                          onChange={(e) => setYoutubeVideoDetails(e.target.value)}
                          placeholder="e.g. Discover the deep stories of global participants..."
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Stats settings */}
                    <div className="space-y-4 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-2 text-emerald-400">💰 Finance System Configuration</h4>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Government Fee Percentage (%)</label>
                          <input 
                            type="number" 
                            value={governmentFeePct} 
                            onChange={(e) => setGovernmentFeePct(Number(e.target.value))}
                            placeholder="e.g. 10"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono block">Deducted automatically from user winning payouts (Default: 10%)</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Global Exchange Rate (1 USD = X BDT)</label>
                          <input 
                            type="number" 
                            value={usdExchangeRate} 
                            onChange={(e) => setUsdExchangeRate(Number(e.target.value))}
                            placeholder="e.g. 117"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                          />
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono block">System-wide standard conversion rate (Default: 117)</span>
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Min Withdrawal Amount (USD)</label>
                          <input 
                            type="number" 
                            value={minWithdrawalAmount} 
                            onChange={(e) => setMinWithdrawalAmount(Number(e.target.value))}
                            placeholder="e.g. 10"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Max Withdrawal Amount (USD)</label>
                          <input 
                            type="number" 
                            value={maxWithdrawalAmount} 
                            onChange={(e) => setMaxWithdrawalAmount(Number(e.target.value))}
                            placeholder="e.g. 1000000"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-emerald-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800/60">
                        <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-2 text-indigo-400">📊 Live Statistics Manually Adjustable Counts</h4>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Registered Users Counter</label>
                          <input 
                            type="text" 
                            value={totalMetricRegisteredUsers} 
                            onChange={(e) => setTotalMetricRegisteredUsers(e.target.value)}
                            placeholder="e.g. 1,230,692"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                          />
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono block">Shown in Yellow as "Registered participants around the globe"</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Tickets Purchased Counter</label>
                          <input 
                            type="text" 
                            value={totalMetricTicketsPurchased} 
                            onChange={(e) => setTotalMetricTicketsPurchased(e.target.value)}
                            placeholder="e.g. 3,485,912"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                          />
                          <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono block">Shown in Blue as "Total Tickets Sold & Drawn"</span>
                        </div>
                      </div>

                      {/* Instant Save buttons row */}
                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={handleSaveSiteConfig}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-xs p-3.5 rounded-xl transition-all cursor-pointer shadow flex items-center justify-center gap-2"
                        >
                          💾 Save Stats & YouTube Draw Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRAND PRIZE WINNERS CAROUSEL MANAGER */}
              <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">🏆</span>
                    Grand Prize Winners Manager
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1 text-left">
                    Add or edit Grand Prize Winners featured in the slide deck in Card 1. Upload or paste custom image URLs, name, and total winnings.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-8 items-start">
                  
                  {/* GPW Form */}
                  <form onSubmit={handleSaveGpw} className="lg:col-span-5 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4">
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-2 text-red-400">
                      {editingGpwId ? '✏️ Edit Grand Prize Winner' : '🚀 Add Grand Prize Winner'}
                    </h4>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Winner Full Name</label>
                      <input 
                        type="text" 
                        value={newGpwName}
                        onChange={(e) => setNewGpwName(e.target.value)}
                        placeholder="e.g. Robert Burkovski"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Prize Won (Amount)</label>
                      <input 
                        type="text" 
                        value={newGpwPrize}
                        onChange={(e) => setNewGpwPrize(e.target.value)}
                        placeholder="e.g. $2,042,205"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-extrabold uppercase">Winner Portrait URL</label>
                      <input 
                        type="text" 
                        value={newGpwImageUrl}
                        onChange={(e) => setNewGpwImageUrl(e.target.value)}
                        placeholder="e.g. /images/... or URL"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-800 dark:text-zinc-200 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1.5">
                      <input 
                        type="checkbox" 
                        id="newGpwIsActive"
                        checked={newGpwIsActive}
                        onChange={(e) => setNewGpwIsActive(e.target.checked)}
                        className="h-4 w-4 bg-zinc-50 dark:bg-zinc-900 rounded border-zinc-200 dark:border-zinc-800 text-red-550 focus:ring-red-500 accent-red-500 cursor-pointer" 
                      />
                      <label htmlFor="newGpwIsActive" className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-semibold cursor-pointer select-none text-xs">
                        Activate this winner slide immediately
                      </label>
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-xs p-3 rounded-xl transition-all cursor-pointer shadow"
                      >
                        {editingGpwId ? '💾 Update Winner' : '🚀 Add Winner'}
                      </button>
                      {editingGpwId && (
                        <button
                          type="button"
                          onClick={handleCancelEditGpw}
                          className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-extrabold uppercase text-xs p-3 rounded-xl transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  {/* GPW List */}
                  <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4 text-left">
                    <div>
                      <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider mb-1">Manage Grand Prize Winners ({currentGpws.length})</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase tracking-wide">Toggle status, edit, or remove winners featured in the slide show</p>
                    </div>

                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {currentGpws.map((gpwItem) => (
                        <div 
                          key={gpwItem.id}
                          className="bg-[#121215] border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:border-zinc-700 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                        >
                          <div className="flex items-center gap-3">
                            {/* Portrait Preview */}
                            <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center shadow">
                              <img src={resolveBannerImage(gpwItem.imageUrl)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            
                            <div className="leading-tight min-w-0 flex-1">
                              <span className="font-extrabold text-zinc-900 dark:text-white text-xs block truncate">{gpwItem.name}</span>
                              <span className="text-[10px] text-yellow-500 font-mono block truncate mt-1">
                                {gpwItem.prize}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                            {/* Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleGpwActive(gpwItem.id)}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition border cursor-pointer uppercase ${
                                gpwItem.isActive 
                                  ? 'bg-green-950/60 text-green-400 border-green-800/60' 
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800'
                              }`}
                            >
                              {gpwItem.isActive ? '● Active' : '○ Inactive'}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEditGpw(gpwItem)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition ${
                                editingGpwId === gpwItem.id
                                  ? 'bg-red-500 text-zinc-950'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800'
                              }`}
                              title="Edit Winner details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this grand prize winner?")) {
                                  handleDeleteGpw(gpwItem.id);
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-red-950/40 text-red-500 hover:bg-red-900/60 flex items-center justify-center cursor-pointer transition"
                              title="Delete Winner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {currentGpws.length === 0 && (
                        <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black">No grand prize winners created. Create your first winner on the left!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* WINNERS VIDEO GALLERY MANAGER (Winners Living the Dream) */}
              <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">📹</span>
                    Winners Video Gallery Manager
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 mt-1">
                    Manage the YouTube-styled video cards that appear in the &quot;Winners Living the Dream&quot; video section on the Winners page.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Form Column */}
                  <form onSubmit={handleSaveVw} className="lg:col-span-4 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850/80 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-900 pb-2">
                      {editingVwId ? 'Edit Video Winner' : 'Add New Video Winner'}
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Video Title</label>
                        <input
                          type="text"
                          value={newVwTitle}
                          onChange={(e) => setNewVwTitle(e.target.value)}
                          placeholder="e.g. From Mother's Blessings to AED 100 Mill..."
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Winner's Name</label>
                        <input
                          type="text"
                          value={newVwName}
                          onChange={(e) => setNewVwName(e.target.value)}
                          placeholder="e.g. Sriram Rajagopalan"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Prize Text</label>
                          <input
                            type="text"
                            value={newVwPrizeText}
                            onChange={(e) => setNewVwPrizeText(e.target.value)}
                            placeholder="e.g. $27,229,408"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Draw Date</label>
                          <input
                            type="text"
                            value={newVwDate}
                            onChange={(e) => setNewVwDate(e.target.value)}
                            placeholder="e.g. 16 March 2025"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Thumbnail Image URL</label>
                        <input
                          type="text"
                          value={newVwThumbnailUrl}
                          onChange={(e) => setNewVwThumbnailUrl(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/..."
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">YouTube Video Link or ID (ইউটিউব ভিডিও লিংক বা আইডি)</label>
                        <input
                          type="text"
                          value={newVwYoutubeId}
                          onChange={(e) => setNewVwYoutubeId(e.target.value)}
                          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ (অথবা shorts বা ১১ অক্ষরের আইডি)"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="newVwIsActive"
                          checked={newVwIsActive}
                          onChange={(e) => setNewVwIsActive(e.target.checked)}
                          className="rounded border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-red-500 focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="newVwIsActive" className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold cursor-pointer select-none">
                          Display Active on Website
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2 px-4 rounded-xl cursor-pointer transition active:scale-97"
                      >
                        {editingVwId ? 'Update Details' : 'Add Video Card'}
                      </button>
                      {editingVwId && (
                        <button
                          type="button"
                          onClick={handleCancelEditVw}
                          className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  {/* List Column */}
                  <div className="lg:col-span-8 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-900 pb-2 flex justify-between items-center">
                      <span>Video Winner Cards ({currentVws.length})</span>
                      <span className="text-[9px] text-zinc-500 dark:text-zinc-500 lowercase font-normal">videos are displayed on the /winners page</span>
                    </h4>

                    <div className="max-h-[460px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 font-sans">
                      {currentVws.map((vwItem) => (
                        <div
                          key={vwItem.id}
                          className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            {vwItem.thumbnailUrl ? (
                              <img
                                src={vwItem.thumbnailUrl}
                                alt=""
                                className="w-16 aspect-video object-cover rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0"
                              />
                            ) : (
                              <div className="w-16 aspect-video bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0 flex items-center justify-center text-zinc-600 text-xs font-mono">
                                No Img
                              </div>
                            )}
                            <div className="min-w-0">
                              <span className="font-extrabold text-zinc-900 dark:text-white text-xs block truncate">{vwItem.title}</span>
                              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block truncate mt-0.5">
                                <span className="font-bold text-red-400">{vwItem.name}</span> • Won {vwItem.prizeText || 'N/A'} • {vwItem.date}
                              </span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono block mt-1">
                                YouTube: {vwItem.youtubeId}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                            {/* Toggle switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleVwActive(vwItem.id)}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-bold transition border cursor-pointer uppercase ${
                                vwItem.isActive !== false
                                  ? 'bg-green-950/60 text-green-400 border-green-800/60'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800'
                              }`}
                            >
                              {vwItem.isActive !== false ? '● Active' : '○ Inactive'}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEditVw(vwItem)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition ${
                                editingVwId === vwItem.id
                                  ? 'bg-red-500 text-zinc-950'
                                  : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800'
                              }`}
                              title="Edit Video Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this video winner?")) {
                                  handleDeleteVw(vwItem.id);
                                }
                              }}
                              className="w-7 h-7 rounded-lg bg-red-950/40 text-red-500 hover:bg-red-900/60 flex items-center justify-center cursor-pointer transition"
                              title="Delete Video Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {currentVws.length === 0 && (
                        <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black">No video cards created. Create your first card on the left!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ALL GAMES DRAW RESULTS & PAST DRAWING RECORDS MANAGER */}
              <div className="mt-12 pt-12 border-t border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">🎰</span>
                    All Games Draw Results &amp; Past Records
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 mt-1">
                    Add or modify official winning combination draws and past records for EASY6, MEGA7, WILD5, SURE 1/2/3, PICK 1/2, LOTTERY.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Form Column */}
                  <form onSubmit={handleSaveDr} className="lg:col-span-4 bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850/80 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest border-b border-zinc-200 dark:border-zinc-900 pb-2">
                      {editingDrId ? 'Edit Draw Result' : 'Add New Draw Result'}
                    </h4>

                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Select Game Name</label>
                        <select
                          value={newDrGameName}
                          onChange={(e) => setNewDrGameName(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                        >
                          {dynamicGames.map(g => (
                            <option key={g.name} value={g.name}>{g.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Draw Date</label>
                        <input
                          type="text"
                          value={newDrDate}
                          onChange={(e) => setNewDrDate(e.target.value)}
                          placeholder="e.g. 14 June 2026"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block">Winning Numbers</label>
                          <span className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase font-bold">comma-separated</span>
                        </div>
                        <input
                          type="text"
                          value={newDrNumbers}
                          onChange={(e) => setNewDrNumbers(e.target.value)}
                          placeholder="e.g. 4, 12, 18, 32, 49, 15, 21"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition font-mono"
                          required
                        />
                        <p className="text-[9px] text-zinc-500 dark:text-zinc-500 mt-1">
                          Enter numbers separated by commas. For PICK 1 flags, use codes 1 to 36.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Total Winners</label>
                          <input
                            type="text"
                            value={newDrTotalWinners}
                            onChange={(e) => setNewDrTotalWinners(e.target.value)}
                            placeholder="e.g. 1,250 Players"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Total Paid / Prize</label>
                          <input
                            type="text"
                            value={newDrTotalPaid}
                            onChange={(e) => setNewDrTotalPaid(e.target.value)}
                            placeholder="e.g. $45,000.00"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1">Drawing Match Ref Code</label>
                        <input
                          type="text"
                          value={newDrRefCode}
                          onChange={(e) => setNewDrRefCode(e.target.value)}
                          placeholder="e.g. EMD-2941-XQ9"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 transition font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black text-xs py-2 px-4 rounded-xl cursor-pointer transition active:scale-97"
                      >
                        {editingDrId ? 'Update Record' : 'Save Draw Result'}
                      </button>
                      {editingDrId && (
                        <button
                          type="button"
                          onClick={handleCancelEditDr}
                          className="bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>

                  {/* List Column */}
                  <div className="lg:col-span-8 space-y-3 font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-200 dark:border-zinc-900 pb-2">
                      <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest shrink-0">
                        Historical Draw Records ({currentDrs.length})
                      </h4>
                      {/* Game Filter Tab list or select dropdown */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-[9px] text-zinc-500 dark:text-zinc-500 uppercase font-black shrink-0">Filter Game:</label>
                        <select
                          value={drawFilter}
                          onChange={(e) => setDrawFilter(e.target.value)}
                          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-lg px-2 py-1 text-[10px] text-zinc-900 dark:text-white focus:outline-none"
                          style={{ minWidth: '100px' }}
                          id="admin-draw-filter-select"
                        >
                          <option value="ALL">Show All Games</option>
                          {dynamicGames.map(g => (
                            <option key={g.name} value={g.name}>{g.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="max-h-[460px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                      {currentDrs
                        .filter(dr => {
                          return drawFilter === 'ALL' || dr.gameName === drawFilter;
                        })
                        .map((drItem) => (
                          <div
                            key={drItem.id}
                            className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-850 hover:border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                <span className="bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                  {drItem.gameName}
                                </span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold">
                                  {drItem.date}
                                </span>
                                {drItem.refCode && (
                                  <span className="text-[9px] text-zinc-500 dark:text-zinc-500 font-mono">
                                    Ref: {drItem.refCode}
                                  </span>
                                )}
                              </div>

                              {/* Numbers list styled as balls */}
                              <div className="flex flex-wrap gap-1 mb-2">
                                {drItem.numbers.map((val: number, idx: number) => (
                                  <span
                                    key={idx}
                                    className="w-5.5 h-5.5 rounded-full bg-red-650 bg-red-600 text-zinc-950 font-black text-[9px] flex items-center justify-center shadow-xs select-none"
                                  >
                                    {val}
                                  </span>
                                ))}
                              </div>

                              <div className="text-[10px] text-zinc-500 dark:text-zinc-500">
                                Winners: <span className="text-zinc-700 dark:text-zinc-300 font-bold">{drItem.totalWinners}</span> • Paid: <span className="text-zinc-700 dark:text-zinc-300 font-black">{drItem.totalPaid}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleEditDr(drItem)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition ${
                                  editingDrId === drItem.id
                                    ? 'bg-red-500 text-zinc-950'
                                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800'
                                }`}
                                title="Edit Draw results"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this draw result record?")) {
                                    handleDeleteDr(drItem.id);
                                  }
                                }}
                                className="w-7 h-7 rounded-lg bg-red-950/40 text-red-500 hover:bg-red-900/60 flex items-center justify-center cursor-pointer transition"
                                title="Delete Draw Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                      {currentDrs.length === 0 && (
                        <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-2xl">
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 uppercase font-black">No draw results found. Create your first record on the left!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: Dynamic Raffle Winners Manager */}
          {activeTab === 'raffle' && (
            <div className="space-y-8 animate-fade-in text-left">
              
              {/* Detailed Page Guide / কুইক এডমিন গাইড */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl" />
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" /> 💡 Admin Control Guide • এই পেজের কাজের বিবরণী
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                      এখানে আপনি প্রতিদিনের র‍্যাফেল ড্র-তে কোন কোন ইউজার কত টাকা পুরষ্কার জিতেছে তার একটি কাস্টম বা রিয়েল তালিকা তৈরি করতে পারবেন, যা হোমপেজে প্রচারমূলক প্রমাণ হিসেবে দেখাবে।
                    </p>
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span><b>Declare Dynamic Winner Row (নতুন বিজয়ী যোগ):</b> নতুন কোনো বিজয়ীর নাম, প্রোফাইল ইমেজ, টিকিট নম্বর, পুরষ্কারের পরিমাণ এবং তারিখ লিখে বিজয়ী তালিকায় এন্ট্রি দেওয়ার ফর্ম।</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2.5">
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span><b>Raffle Winner Ledger List (বিজয়ী মেম্বারস টেবিল):</b> বর্তমানে র‍্যাফেল ড্র জিতেছে এমন ইউজারদের সম্পূর্ণ তালিকা।</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span><b>Action - Erase Record (বিজয়ী ডিলিট করা):</b> তালিকা থেকে কোনো বিজয়ীর নাম বাদ দেওয়ার জন্য লাল Trash বাটনটিতে চাপ দিন। এটি করার সাথে সাথে হোমপেজের বিজয়ী বোর্ড আপডেট হয়ে যাবে।</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#18181b] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-500 via-emerald-500 to-teal-600" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800/60 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase flex items-center gap-1.5 font-mono">
                      <Gift className="w-3.5 h-3.5" /> Dynamic Sure Raffle Winners
                    </span>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">Sure Raffle Winners Administration Controls</h2>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">Edit, delete, and add simulated raffle winners. Content updates will propagate instantly to the homepage "Daily Sure Raffle Winners" grid in real-time.</p>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Active Live Synced State</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form to Declare New Winner */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newWinnerName || !newWinnerTicket || !newWinnerPrize) {
                        alert("Please fill out name, ticket value, and prize amount!");
                        return;
                      }
                      addRaffleWinner({
                        name: newWinnerName,
                        country: newWinnerCountry,
                        flag: newWinnerFlag,
                        ticket: newWinnerTicket.toUpperCase(),
                        prize: newWinnerPrize,
                        game: newWinnerGame,
                        avatarBg: winnerAvatarBg,
                        imageUrl: newWinnerImageUrl || undefined,
                        initials: newWinnerInitials.toUpperCase() || newWinnerName.substring(0, 2).toUpperCase()
                      });
                      setNewWinnerName('');
                      setNewWinnerImageUrl('');
                      alert("✨ New dynamic raffle winner successfully created and published!");
                    }}
                    className="lg:col-span-5 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4"
                  >
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-900 pb-2">Declare New Raffle Winner</h3>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Full Name</label>
                        <input 
                          type="text"
                          value={newWinnerName}
                          onChange={(e) => {
                            setNewWinnerName(e.target.value);
                            // Auto generate initials
                            const words = e.target.value.trim().split(/\s+/);
                            if (words.length > 1) {
                              setNewWinnerInitials((words[0][0] + words[1][0]).toUpperCase());
                            } else if (words.length > 0 && words[0].length > 1) {
                              setNewWinnerInitials(words[0].substring(0, 2).toUpperCase());
                            }
                          }}
                          placeholder="e.g. Rakib Hossain"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Custom Profile Image URL / Logo (optional)</label>
                        <input 
                          type="text"
                          value={newWinnerImageUrl}
                          onChange={(e) => setNewWinnerImageUrl(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/... or /images/winner.jpg"
                          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Initials (Avatar)</label>
                          <input 
                            type="text"
                            maxLength={2}
                            value={newWinnerInitials}
                            onChange={(e) => setNewWinnerInitials(e.target.value.toUpperCase())}
                            placeholder="e.g. MP"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white font-mono text-center text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Country Name</label>
                          <input 
                            type="text"
                            value={newWinnerCountry}
                            onChange={(e) => setNewWinnerCountry(e.target.value)}
                            placeholder="e.g. Bangladesh"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Country Flag Emoji</label>
                          <input 
                            type="text"
                            value={newWinnerFlag}
                            onChange={(e) => setNewWinnerFlag(e.target.value)}
                            placeholder="e.g. 🇧🇩"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-center text-xs focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Winning Ticket Code</label>
                          <input 
                            type="text"
                            value={newWinnerTicket}
                            onChange={(e) => setNewWinnerTicket(e.target.value)}
                            placeholder="e.g. SR1-9382B"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white font-mono uppercase text-xs focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Prize Unlocked</label>
                          <input 
                            type="text"
                            value={newWinnerPrize}
                            onChange={(e) => setNewWinnerPrize(e.target.value)}
                            placeholder="e.g. $30,000.00"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1">Raffle Game Draw Title</label>
                          <select
                            value={newWinnerGame}
                            onChange={(e) => setNewWinnerGame(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 text-zinc-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 appearance-none font-bold"
                          >
                            <optgroup label="Life Changing Games" className="bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">
                              <option value="MEGA7">MEGA7</option>
                              <option value="WILD5">WILD5</option>
                              <option value="EASY6">EASY6</option>
                              <option value="FAST5">FAST5</option>
                              <option value="LOTTERY">LOTTERY</option>
                              <option value="THAI GOVT LOTTERY">THAI GOVT LOTTERY</option>
                              <option value="SCRATCH CARDS">SCRATCH CARDS</option>
                            </optgroup>
                            <optgroup label="Raffle Draws" className="bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">
                              <option value="SURE 1">SURE 1</option>
                              <option value="SURE 2">SURE 2</option>
                              <option value="SURE 3">SURE 3</option>
                            </optgroup>
                            <optgroup label="Rush Draws" className="bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">
                              <option value="PICK 1">PICK 1</option>
                              <option value="PICK 2">PICK 2</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider mb-1.5">Avatar Circle Color Representation</label>
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-center">
                          <button
                            type="button"
                            onClick={() => setWinnerAvatarBg('bg-gradient-to-tr from-amber-500 to-orange-600')}
                            className={`p-2 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white ${winnerAvatarBg === 'bg-gradient-to-tr from-amber-500 to-orange-600' ? 'ring-2 ring-white/80' : ''} bg-gradient-to-tr from-amber-500 to-orange-600`}
                          >
                            Amber Glow
                          </button>
                          <button
                            type="button"
                            onClick={() => setWinnerAvatarBg('bg-gradient-to-tr from-emerald-500 to-teal-600')}
                            className={`p-2 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white ${winnerAvatarBg === 'bg-gradient-to-tr from-emerald-500 to-teal-600' ? 'ring-2 ring-white/80' : ''} bg-gradient-to-tr from-emerald-500 to-teal-600`}
                          >
                            Emerald Sea
                          </button>
                          <button
                            type="button"
                            onClick={() => setWinnerAvatarBg('bg-gradient-to-tr from-blue-500 to-indigo-600')}
                            className={`p-2 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white ${winnerAvatarBg === 'bg-gradient-to-tr from-blue-500 to-indigo-600' ? 'ring-2 ring-white/80' : ''} bg-gradient-to-tr from-blue-500 to-indigo-600`}
                          >
                            Royal Blue
                          </button>
                          <button
                            type="button"
                            onClick={() => setWinnerAvatarBg('bg-gradient-to-tr from-red-500 to-rose-600')}
                            className={`p-2 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white ${winnerAvatarBg === 'bg-gradient-to-tr from-red-500 to-rose-600' ? 'ring-2 ring-white/80' : ''} bg-gradient-to-tr from-red-500 to-rose-600`}
                          >
                            Rose Red
                          </button>
                          <button
                            type="button"
                            onClick={() => setWinnerAvatarBg('bg-gradient-to-tr from-pink-500 to-rose-500')}
                            className={`p-2 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white ${winnerAvatarBg === 'bg-gradient-to-tr from-pink-500 to-rose-500' ? 'ring-2 ring-white/80' : ''} bg-gradient-to-tr from-pink-500 to-rose-500`}
                          >
                            Pink Sunset
                          </button>
                          <button
                            type="button"
                            onClick={() => setWinnerAvatarBg('bg-gradient-to-tr from-purple-500 to-violet-700')}
                            className={`p-2 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white ${winnerAvatarBg === 'bg-gradient-to-tr from-purple-500 to-violet-700' ? 'ring-2 ring-white/80' : ''} bg-gradient-to-tr from-purple-500 to-violet-700`}
                          >
                            Deep Violet
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold uppercase text-xs p-3.5 rounded-xl transition-all cursor-pointer shadow mt-2"
                    >
                      🚀 Declare Sure Raffle Winner
                    </button>
                  </form>

                  {/* Right Column: Excel Sheet Winners Registry */}
                  <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-850 space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-2 mb-2">
                        <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Raffle_Winners_Registry.xlsx ({raffleWinners.length} Rows)
                        </h3>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">Double click any cell to edit</span>
                      </div>
                      
                      <ExcelSheet
                        sheetName="Raffle_Winners_Registry"
                        columns={[
                          { key: 'name', label: 'Winner Name', type: 'text' },
                          { key: 'initials', label: 'Initials (Avatar)', type: 'text' },
                          { key: 'ticket', label: 'Ticket Code', type: 'text' },
                          { key: 'prize', label: 'Prize', type: 'text' },
                          { key: 'game', label: 'Game Name', type: 'text' },
                          { key: 'country', label: 'Country', type: 'text' },
                          { key: 'flag', label: 'Flag Emoji', type: 'text' },
                          { key: 'imageUrl', label: 'Avatar URL', type: 'image' }
                        ]}
                        data={raffleWinners}
                        onDataChange={async (updated) => {
                          const oldData = raffleWinners;
                          for (let i = 0; i < updated.length; i++) {
                            const newRow = updated[i];
                            const oldRow = oldData.find(w => w.id === newRow.id);
                            if (oldRow) {
                              const changedFields: any = {};
                              let hasChanged = false;
                              for (const key of ['name', 'initials', 'ticket', 'prize', 'game', 'country', 'flag', 'imageUrl']) {
                                if (newRow[key] !== oldRow[key]) {
                                  changedFields[key] = newRow[key];
                                  hasChanged = true;
                                }
                              }
                              if (hasChanged) {
                                try {
                                  await updateRaffleWinner(newRow.id, changedFields);
                                } catch (err) {
                                  console.error("Error updating raffle winner:", err);
                                }
                              }
                            }
                          }
                        }}
                        onDeleteRow={(idx, row) => {
                          deleteRaffleWinner(row.id);
                        }}
                      />
                    </div>

                    <div className="bg-[#15231c]/60 border border-emerald-950 p-3 rounded-xl text-[10px] text-emerald-400 leading-relaxed font-mono mt-3">
                      💡 <b>Pro-Tip:</b> Want to test the real-time layout rendering? Declaring more winners automatically appends them to the "DAILY SURE RAFFLE WINNERS" section of the main landing page instantly. No refresh required.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: Withdrawals Ledger Manager */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Detailed Page Guide / কুইক এডমিন গাইড */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden text-left mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl" />
                <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-cyan-400" /> 💡 Admin Control Guide • এই পেজের কাজের বিবরণী
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                      এখানে আপনি ব্যবহারকারীদের উইনিং ব্যালেন্স থেকে ব্যাংকের মাধ্যমে টাকা উত্তোলনের (Cashout) অনুরোধসমূহ দেখতে, অনুমোদন করতে বা রিজেক্ট করতে পারবেন।
                    </p>
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span><b>Approve Button (অনুমোদন বাটন):</b> গ্রাহকের ব্যাংকে টাকা পাঠানো সম্পূর্ণ হলে এই সবুজ টিক বাটনে চাপ দিন। এটি রিকোয়েস্টটিকে "Approved" হিসেবে চিহ্নিত করবে এবং গ্রাহকের ড্যাশবোর্ডে "Total Claimed to Date" বাড়াবে।</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2.5">
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span><b>Reject Button (প্রত্যাখ্যান ও রিফান্ড বাটন):</b> কোনো কারণে গ্রাহকের টাকা তোলার তথ্য ভুল হলে এই লাল ক্রস বাটনে চাপ দিন। এটি রিকোয়েস্টটিকে "Rejected" করে দিবে এবং তাৎক্ষণিকভাবে উত্তোলনের পুরো টাকাটি গ্রাহকের উইনিংস ব্যালেন্সে রিফান্ড (ফেরত) করে দিবে!</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 💸 CREATE CUSTOM WITHDRAWAL ENTRY PANEL */}
              <div className="bg-[#18181b] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-cyan-500 via-blue-500 to-indigo-500" />
                <div className="border-b border-zinc-200 dark:border-zinc-800/60 pb-3 mb-5">
                  <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Admin Withdrawal Injection System
                  </span>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">Direct Custom Withdrawal Generator (Unlimited)</h2>
                  <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">Directly inject withdrawal requests for any registered user. Selecting "Approved" debits the user's winnings wallet instantly.</p>
                </div>

                <form onSubmit={handleAdminAddWithdrawal} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-end text-xs font-semibold">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">User Email</label>
                    <select 
                      value={adminWdEmail} 
                      onChange={(e) => setAdminWdEmail(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 text-xs font-bold"
                    >
                      {allUsers.map(u => (
                        <option key={u.email} value={u.email}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">Withdrawal Gateway</label>
                    <select 
                      value={adminWdBank} 
                      onChange={(e) => setAdminWdBank(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 text-xs font-bold"
                    >
                      <option value="bKash">bKash (Mobile Wallet)</option>
                      <option value="Nagad">Nagad (Mobile Wallet)</option>
                      <option value="Rocket">Rocket (Mobile Wallet)</option>
                      <option value="City Bank PLC">City Bank PLC</option>
                      <option value="Dutch-Bangla Bank">Dutch-Bangla Bank (DBBL)</option>
                      <option value="USDT (TRC20)">USDT (TRC20 Wallet)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">Account Name</label>
                    <input 
                      type="text" 
                      required
                      value={adminWdAccountName} 
                      onChange={(e) => setAdminWdAccountName(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 font-bold"
                      placeholder="e.g. Meshkat sorif payal"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">IBAN / Phone Number</label>
                    <input 
                      type="text" 
                      required
                      value={adminWdIban} 
                      onChange={(e) => setAdminWdIban(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 font-mono font-bold"
                      placeholder="BD01CITY200..."
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">Amount ($ USD)</label>
                    <input 
                      type="number" 
                      min="1" 
                      required
                      value={adminWdAmount} 
                      onChange={(e) => setAdminWdAmount(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 font-mono font-bold"
                      placeholder="e.g. 200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">Ledger Status</label>
                    <div className="flex gap-2">
                      <select 
                        value={adminWdStatus} 
                        onChange={(e) => setAdminWdStatus(e.target.value as any)}
                        className="flex-1 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 text-xs font-bold"
                      >
                        <option value="Pending">Pending (Verification Ledger)</option>
                        <option value="Approved">Approved (Debit Wallet)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button 
                        type="submit" 
                        className="bg-cyan-600 hover:bg-cyan-500 text-zinc-900 dark:text-white px-4 py-2.5 rounded-xl font-bold transition-all border border-cyan-500 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Inject
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-[#18181b] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 via-cyan-500 to-teal-500" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800/60 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Withdrawal Control Center
                    </span>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">Simulated Direct Bank Withdrawals Ledger</h2>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">Approve, deny, and monitor payout requests. Refunding user winnings occurs automatically upon rejection.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">Pending Queue</span>
                    <span className="text-2xl font-black text-yellow-500 font-mono block mt-1">{pendingWithdrawRequests.length} files</span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-1 uppercase">Awaiting admin sign-off</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">Approved / Paid Out</span>
                    <span className="text-2xl font-black text-green-400 font-mono block mt-1">
                      ${approvedWithdrawRequests.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                    </span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-1 uppercase">Disbursed to bank wires</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">Simulated Exchange Rate</span>
                    <span className="text-2xl font-black text-cyan-400 font-mono block mt-1">1 USD = {USD_TO_BDT} BDT</span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-1 uppercase">Global system standard conversion</span>
                  </div>
                </div>

                {/* Interactive Excel Withdrawals Ledger Sheet */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" /> Withdrawal_Requests_Ledger.xlsx ({withdrawalRequests.length} Rows)
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">Double click "Status" cell to modify status (Pending / Approved / Rejected)</span>
                  </div>
                  <ExcelSheet
                    sheetName="Withdrawal_Requests_Ledger"
                    columns={[
                      { key: 'id', label: 'Withdrawal ID', type: 'text', readOnly: true },
                      { key: 'email', label: 'User Email', type: 'text', readOnly: true },
                      { key: 'amount', label: 'Amount ($)', type: 'number', readOnly: true },
                      { key: 'bankName', label: 'Payment Gateway', type: 'text', readOnly: true },
                      { key: 'accountName', label: 'Account Name', type: 'text', readOnly: true },
                      { key: 'iban', label: 'Account No / IBAN / Wallet', type: 'text', readOnly: true },
                      { key: 'date', label: 'Request Date', type: 'text', readOnly: true },
                      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] }
                    ]}
                    data={withdrawalRequests}
                    onDataChange={async (updated) => {
                      const oldData = withdrawalRequests;
                      for (let i = 0; i < updated.length; i++) {
                        const newRow = updated[i];
                        const oldRow = oldData.find(r => r.id === newRow.id);
                        if (oldRow && newRow.status !== oldRow.status) {
                          try {
                            await updateWithdrawalStatus(newRow.id, newRow.status);
                          } catch (err) {
                            console.error("Error updating withdrawal status:", err);
                          }
                        }
                      }
                    }}
                  />
                </div>

                <div className="bg-[#112328] border border-cyan-950 p-4 rounded-xl text-[10px] text-cyan-400 font-mono leading-relaxed mt-4">
                  💡 <b>Real-time Integration Note:</b> Rejecting a withdrawal request instantly refunds the amount to the user's "Winnings Wallet" dynamic balance. Approving a request marks the request as settled, which is shown on the user's dashboard "Total Claimed to Date".
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: Deposits Verification Queue */}
          {activeTab === 'deposits' && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* Detailed Page Guide / কুইক এডমিন গাইড */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden text-left mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl" />
                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" /> 💡 Deposit Control Guide • এই পেজের কাজের বিবরণী
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2.5">
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                      গ্রাহকদের করা bKash, Nagad, Rocket, Credit/Debit Card বা USDT ডিপোজিট রিকোয়েস্ট ভেরিফাই বা যাচাই করার সেন্টার।
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400">
                      গ্রাহক যখন ম্যানুয়ালি টাকা পাঠিয়ে ট্রানজেকশন আইডি (TrxID) দিয়ে সাবমিট করবে, সেটি সরাসরি এখানে জমা হবে। আপনি আপনার bKash/Nagad ওয়ালেটে টাকা চেক করে অনুমোদন করবেন।
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    <ul className="space-y-1.5 text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span><b>Approve Button (সবুজ টিক):</b> ওয়ালেটে টাকা জমা হয়ে থাকলে এই সবুজ বাটনে ক্লিক করুন। সাথে সাথে গ্রাহকের মেইন ব্যালেন্স রিয়েলটাইমে যোগ হয়ে যাবে!</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 mt-0.5">•</span>
                        <span><b>Reject Button (লাল ক্রস):</b> গ্রাহক যদি ভুয়া ট্রানজেকশন আইডি দিয়ে সাবমিট করে, তবে এই ক্রস বাটনে চাপ দিয়ে ডিনাই করুন।</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 💰 CREATE CUSTOM DEPOSIT ENTRY PANEL */}
              <div className="bg-[#18181b] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-500 via-emerald-500 to-green-500" />
                <div className="border-b border-zinc-200 dark:border-zinc-800/60 pb-3 mb-5">
                  <span className="text-[10px] font-black text-yellow-400 tracking-widest uppercase flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Admin Deposit Injection System
                  </span>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">Direct Custom Deposit Generator (Unlimited)</h2>
                  <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">Directly inject verified or pending deposit ledger files for any registered user. Selecting "Approved" credits the user wallet instantly.</p>
                </div>

                <form onSubmit={handleAdminAddDeposit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-end text-xs font-semibold">
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">User Email</label>
                    <select 
                      value={adminDepEmail} 
                      onChange={(e) => setAdminDepEmail(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 text-xs font-bold"
                    >
                      {allUsers.map(u => (
                        <option key={u.email} value={u.email}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">Payment Gateway</label>
                    <select 
                      value={adminDepMethod} 
                      onChange={(e) => setAdminDepMethod(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 text-xs font-bold"
                    >
                      <option value="bKash">bKash (Mobile Wallet)</option>
                      <option value="Nagad">Nagad (Mobile Wallet)</option>
                      <option value="Rocket">Rocket (Mobile Wallet)</option>
                      <option value="USDT (TRC20)">USDT (TRC20 Wallet)</option>
                      <option value="Visa/MasterCard">Visa/MasterCard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">Amount ($ USD)</label>
                    <input 
                      type="number" 
                      min="1" 
                      required
                      value={adminDepAmount} 
                      onChange={(e) => setAdminDepAmount(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 font-mono font-bold"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">Transaction ID (Optional)</label>
                    <input 
                      type="text" 
                      value={adminDepTransId} 
                      onChange={(e) => setAdminDepTransId(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 font-mono"
                      placeholder="Auto-Generated if empty"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mb-1.5">Ledger Status</label>
                    <div className="flex gap-2">
                      <select 
                        value={adminDepStatus} 
                        onChange={(e) => setAdminDepStatus(e.target.value as any)}
                        className="flex-1 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl outline-none focus:border-zinc-500 text-xs font-bold"
                      >
                        <option value="Approved">Approved (Credit Wallet)</option>
                        <option value="Pending">Pending (Verification Queue)</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button 
                        type="submit" 
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold transition-all border border-emerald-500 flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Inject
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-[#18181b] border border-zinc-200 dark:border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-500 via-green-500 to-teal-500" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800/60 pb-4 mb-5">
                  <div>
                    <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" /> Deposit Verification Ledger
                    </span>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">Manual Deposit Verification Ledger Queue</h2>
                    <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">Approve or deny manual mobile banking (bKash, Nagad, Rocket), USDT, and Card deposits securely to prevent fake submissions.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">Pending Verification</span>
                    <span className="text-2xl font-black text-yellow-500 font-mono block mt-1">
                      {depositRequests.filter(r => r.status === 'Pending').length} files
                    </span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-1 uppercase">Awaiting admin review</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">Total Approved Deposits</span>
                    <span className="text-2xl font-black text-green-400 font-mono block mt-1">
                      ${depositRequests.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                    </span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-1 uppercase">Credited into member wallets</span>
                  </div>
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850">
                    <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-500 uppercase tracking-wider block">Total Rejected Deposits</span>
                    <span className="text-2xl font-black text-red-500 font-mono block mt-1">
                      {depositRequests.filter(r => r.status === 'Rejected').length} files
                    </span>
                    <span className="text-[9px] text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 block mt-1 uppercase">Fake or invalid submissions flagged</span>
                  </div>
                </div>

                {/* Interactive Excel Deposits Verification Ledger Sheet */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 font-mono font-bold">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Deposit_Requests_Ledger.xlsx ({depositRequests.length} Rows)
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-medium">Double click "Status" cell to approve or reject</span>
                  </div>
                  
                  <ExcelSheet
                    sheetName="Deposit_Requests_Ledger"
                    columns={[
                      { key: 'id', label: 'Deposit ID', type: 'text', readOnly: true },
                      { key: 'email', label: 'User Email', type: 'text' },
                      { key: 'gateway', label: 'Gateway', type: 'text', readOnly: true },
                      { key: 'amount', label: 'Amount ($)', type: 'number', readOnly: true },
                      { key: 'transactionId', label: 'Transaction ID (TrxID)', type: 'text', readOnly: true },
                      { key: 'date', label: 'Date', type: 'text', readOnly: true },
                      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'] }
                    ]}
                    data={depositRequests}
                    onDataChange={async (updated) => {
                      const oldData = depositRequests;
                      for (let i = 0; i < updated.length; i++) {
                        const newRow = updated[i];
                        const oldRow = oldData.find(r => r.id === newRow.id);
                        if (oldRow && newRow.status !== oldRow.status) {
                          if (newRow.status === 'Approved') {
                            let targetEmail = newRow.email;
                            if (newRow.email.includes('pending_crypto') || newRow.email.includes('unknown_crypto_payer')) {
                              const enteredEmail = prompt("This crypto deposit was received via the general checkout widget without a registered user account link.\n\nPlease enter the correct registered user email address to credit this deposit to:", "");
                              if (enteredEmail === null) continue;
                              targetEmail = enteredEmail.trim();
                            }
                            try {
                              await updateDepositStatus(newRow.id, 'Approved', targetEmail);
                              alert(`✅ Deposit request APPROVED for ${targetEmail}!`);
                            } catch (err) {
                              console.error("Error approving deposit:", err);
                            }
                          } else if (newRow.status === 'Rejected') {
                            try {
                              await updateDepositStatus(newRow.id, 'Rejected');
                              alert(`❌ Deposit request REJECTED!`);
                            } catch (err) {
                              console.error("Error rejecting deposit:", err);
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'menupages' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden text-left mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-500" /> Menu Pages
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 max-w-xl font-medium leading-relaxed">
                      Create and manage custom frontend pages (e.g. Terms, Privacy Policy).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/40 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 text-center">
                <FileText className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-2">Menu Pages Manager</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto mb-4">You can easily map a JSON array of pages here in future iterations or connect it directly to your frontend router config.</p>
                <div className="inline-block bg-white dark:bg-zinc-950 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  Coming soon...
                </div>
              </div>
            </div>
          )}

          {activeTab === 'navmenus' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 relative overflow-hidden text-left mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-600/5 rounded-full blur-2xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <List className="w-5 h-5 text-orange-500" /> App Navigation
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 max-w-xl font-medium leading-relaxed">
                      Configure main dropdown menus in the header navigation (THAI LOTTERY, RAFFLES, etc.). Paste JSON directly to update.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-left shadow-sm">
                 <div className="border-b border-zinc-200 dark:border-zinc-800/60 pb-3 mb-5">
                   <span className="text-[10px] font-black text-orange-400 tracking-widest uppercase flex items-center gap-1">
                     <Edit2 className="w-3.5 h-3.5" /> Navigation Editor
                   </span>
                   <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-1">Menu JSON Editor</h2>
                   <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">Edit the raw JSON data that powers your header navigation structure.</p>
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    <textarea 
                      className="w-full h-[400px] bg-zinc-50 dark:bg-[#0b0b0d] text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl outline-none focus:border-zinc-500 font-mono text-xs shadow-inner whitespace-pre"
                      value={siteConfig.navMenuData ? JSON.stringify(siteConfig.navMenuData, null, 2) : "{\n  \"THAI LOTTERY\": {\n    \"title\": \"LIFE CHANGING\",\n    \"items\": []\n  }\n}"}
                      onChange={(e) => {
                        try {
                           const parsed = JSON.parse(e.target.value);
                           updateSiteConfig({ navMenuData: parsed });
                        } catch (err) {
                           // Allow typing invalid json momentarily
                        }
                      }}
                      onBlur={(e) => {
                         try {
                           const parsed = JSON.parse(e.target.value);
                           updateSiteConfig({ navMenuData: parsed });
                           alert("App Navigation saved successfully!");
                         } catch (err) {
                           alert("Invalid JSON format! Please check for syntax errors.");
                         }
                      }}
                    />
                    <div className="text-[10px] text-zinc-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 p-3 rounded-lg border border-orange-500/20 font-medium">
                      ⚠️ Note: Ensure your JSON structure precisely matches the expected MenuData interface: Record&lt;string, MenuCategory&gt;. Click away from the editor to save.
                    </div>
                 </div>
              </div>
            </div>
          )}

          </div> {/* End Right Content Column */}

        </div> {/* End Responsive Grid */}

        {/* Mobile Fullscreen Slide-over Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop with elegant fade-in blur */}
            <div 
              className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Slide-over panel container */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xs bg-white dark:bg-[#0b0b0d] border-l border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-md dark:shadow-2xl p-6 flex flex-col justify-between transform transition duration-300 ease-in-out">
                
                <div className="space-y-6">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-red-600/10 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <span className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white block">System Control</span>
                        <span className="text-[8px] text-zinc-500 dark:text-zinc-500 uppercase tracking-widest block font-bold">Admin Hub</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white font-bold text-xs bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 h-8 w-8 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Drawer Navigation Links */}
                  <div>
                    <span className="text-[9px] font-black text-zinc-600 tracking-widest uppercase block mb-3 pl-2">System Sections</span>
                    <div className="space-y-1.5">
                      {[
                        { id: 'lottery', icon: Radio, text: '1. Lottery Draws' },
                        { id: 'users', icon: Users, text: '2. Users Database' },
                        { id: 'announcements', icon: Newspaper, text: '3. News Bulletin' },
                        { id: 'customizer', icon: Sliders, text: '4. Live Customizer' },
                        { id: 'raffle', icon: Gift, text: '5. Raffle Winners' },
                        { id: 'withdrawals', icon: TrendingUp, text: '6. Withdrawals Ledger' },
                        { id: 'deposits', icon: Coins, text: '7. Deposits Queue' },
                        { id: 'menupages', icon: FileText, text: '8. Menu Pages' },
                        { id: 'navmenus', icon: List, text: '9. App Navigation' }
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.id as any);
                              setIsMobileMenuOpen(false);
                            }}
                            className={`w-full text-left py-3 px-4 rounded-xl flex items-center gap-3.5 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer ${
                              activeTab === item.id 
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/15' 
                                : 'text-zinc-500 dark:text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white bg-zinc-50 dark:bg-zinc-900/30 hover:bg-zinc-50 dark:bg-zinc-900/60 border border-transparent hover:border-zinc-200 dark:border-zinc-800'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-inherit" /> {item.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="border-t border-zinc-200 dark:border-zinc-900 pt-5 space-y-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-black text-[10px] uppercase py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors text-center cursor-pointer tracking-wider"
                  >
                    User Dashboard
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="w-full bg-white hover:bg-zinc-100 text-black font-black text-[10px] uppercase py-3 rounded-xl transition-colors text-center cursor-pointer tracking-wider"
                  >
                    Live Website View
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
export default Admin;
