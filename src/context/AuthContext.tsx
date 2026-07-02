import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, doc, onSnapshot, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, limit 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, signOut 
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface UserProfile {
  name: string;
  email: string;
  balance: number;
  role: 'user' | 'admin';
  dob: string;
  phone: string;
  country: string;
  winningsBalance?: number;
  commissionBalance?: number;
  profileImage?: string;
  nidNumber?: string;
  passportNumber?: string;
  password?: string;
}

export interface WithdrawalRequest {
  id: string;
  email: string;
  amount: number;
  bankName: string;
  iban: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  accountName?: string;
  userBalanceAtRequest?: number;
  commissionDeducted?: number;
}

export interface PurchasedTicket {
  id: number;
  numbers: number[];
  price: number;
  gameName: string;
  purchaseDate: string;
  email: string;
  status: 'Pending' | 'Won' | 'Lost';
  payout?: string;
}

export interface HistoricalDraw {
  id: string;
  gameName: string;
  drawDate: string;
  winningNumbers: number[];
  status: string;
}

export interface DynamicGame {
  id?: string;
  name: string;
  prize: string;
  price: number;
  drawTime: string;
  targetDateStr: string;
  bgHex: string;
  isSolidStyle: boolean;
  ballCount?: number;
  maxBallValue?: number;
  cardBgType?: 'image' | 'gradient' | 'color';
  cardBgImage?: string;
  cardBgGradient?: string;
  prizeBreakdown?: { label: string; count: number; prize: string }[];
}

export interface PaymentGateway {
  id: string;
  name: string;
  numberOrAddress: string;
  instructions: string;
  enabled: boolean;
  type: 'deposit' | 'withdrawal' | 'both';
  minAmount?: number;
  maxAmount?: number;
}

export interface DailyRaffleWinner {
  id: string;
  name: string;
  country: string;
  flag: string;
  ticket: string;
  prize: string;
  game: string;
  avatarBg: string;
  initials: string;
  imageUrl?: string;
}

export function getGameColor(gameName: string): string {
  const name = gameName?.trim().toUpperCase() || '';
  if (name.includes('MEGA7') || name.includes('MEGA 7')) return 'bg-red-600 text-white';
  if (name.includes('WILD5') || name.includes('WILD 5')) return 'bg-blue-600 text-white';
  if (name.includes('EASY6') || name.includes('EASY 6')) return 'bg-green-600 text-white';
  if (name.includes('FAST5') || name.includes('FAST 5')) return 'bg-blue-500 text-white';
  if (name.includes('LOTTERY')) return 'bg-yellow-600 text-white';
  if (name.includes('SCRATCH')) return 'bg-purple-600 text-white';
  if (name.includes('SURE 1') || name.includes('SURE1')) return 'bg-pink-500 text-white';
  if (name.includes('SURE 2') || name.includes('SURE2')) return 'bg-purple-600 text-white';
  if (name.includes('SURE 3') || name.includes('SURE3')) return 'bg-teal-500 text-white';
  if (name.includes('PICK 1') || name.includes('PICK1')) return 'bg-purple-600 text-white';
  if (name.includes('PICK 2') || name.includes('PICK2')) return 'bg-orange-500 text-white';
  return 'bg-zinc-600 text-white'; // default fallback
}

export function extractYoutubeId(urlOrId: string): string {
  if (!urlOrId) return 'dQw4w9WgXcQ';
  let trimmed = urlOrId.trim();
  
  // If it's already an 11-char ID
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?') && !trimmed.includes('=')) {
    return trimmed;
  }

  // Prepend protocol if missing to make URL parser happy
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }
  
  // Try parsing using URL API
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtube.com')) {
      if (url.searchParams.has('v')) {
        const v = url.searchParams.get('v');
        if (v && v.length === 11) return v;
      }
      const pathnameParts = url.pathname.split('/');
      // Handles /embed/ID, /shorts/ID, /v/ID, etc.
      for (let i = 0; i < pathnameParts.length; i++) {
        if ((pathnameParts[i] === 'embed' || pathnameParts[i] === 'shorts' || pathnameParts[i] === 'v') && pathnameParts[i+1]) {
          const id = pathnameParts[i+1].split('?')[0];
          if (id.length === 11) return id;
        }
      }
      // General fallback for last segment
      const last = pathnameParts[pathnameParts.length - 1];
      if (last && last.length === 11) return last;
    } else if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.substring(1).split('?')[0];
      if (id.length === 11) return id;
    }
  } catch (e) {
    // URL parsing failed
  }

  // Regex fallback (including shorts)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = trimmed.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  
  // Fallback to strip query string and get last 11 chars
  try {
    const withoutQuery = trimmed.split('?')[0];
    const parts = withoutQuery.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length === 11) {
      return lastPart;
    }
  } catch (e) {}
  
  return urlOrId.trim();
}

export function getYoutubeThumbnail(urlOrId: string): string {
  const videoId = extractYoutubeId(urlOrId);
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export interface DepositRequest {
  id: string;
  email: string;
  amount: number;
  gateway: string;
  transactionId: string;
  details?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface GrandPrizeWinner {
  id: string;
  name: string;
  prize: string;
  imageUrl: string;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  buttonText: string;
  flyerTitle: string;
  flyerAmount: string;
  flyerSub: string;
  flyerExtra?: string;
  flyerGradient: string;
  accentColor: string;
  targetLink: string;
  isActive: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerBg?: string;
  isActive: boolean;
}

export interface VideoWinner {
  id: string;
  title: string;
  name: string;
  prizeText: string;
  date: string;
  thumbnailUrl: string;
  youtubeId: string;
  isActive: boolean;
}

export interface DrawResult {
  id: string;
  gameName: string;
  date: string;
  numbers: number[];
  totalWinners: string;
  totalPaid: string;
  refCode?: string;
}

export interface CustomBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  isActive: boolean;
  buttonText?: string;
  bgType?: 'image' | 'color' | 'gradient';
  bgColor?: string;
  bgGradient?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  hideShadow?: boolean;
}

export interface SiteThemeConfig {
  primaryHex: string;
  primaryLogoText: string;
  logoImageUrl?: string;
  heroHeadline: string;
  heroJackpotAmount: string;
  heroDetails: string;
  heroDaysToGo: string;
  bannerMascotUrl: string;
  customBgColor: string;
  heroBannerBgType: 'gradient' | 'solid';
  heroBannerBgSolidHex: string;
  allGamesSolidBg: boolean;
  allGamesSolidHex: string;
  hideHeroShadow?: boolean;
  // bKash & Nagad Payment Configs
  bkashNumber: string;
  bkashEnabled: boolean;
  bkashInstructions: string;
  nagadNumber: string;
  nagadEnabled: boolean;
  nagadInstructions: string;
  // Rocket, Visa, Mastercard, USDT configs
  rocketNumber: string;
  rocketEnabled: boolean;
  rocketInstructions: string;
  visaEnabled: boolean;
  visaInstructions: string;
  mastercardEnabled: boolean;
  mastercardInstructions: string;
  usdtAddress: string;
  usdtEnabled: boolean;
  usdtInstructions: string;
  // Finance settings
  governmentFeePct: number;
  minWithdrawalAmount?: number;
  maxWithdrawalAmount: number;
  usdExchangeRate?: number;
  // Agent configuration
  agentWhatsappLink: string;
  agentImoLink: string;
  agentTelegramLink: string;
  agentEnabled: boolean;
  agentInstructions: string;
  // Custom Banners
  banners?: CustomBanner[];
  // Dynamic Payment Gateways
  paymentGateways?: PaymentGateway[];
  // Footer customizer fields
  footerEmail?: string;
  footerWhatsapp?: string;
  footerTelegram?: string;
  footerImo?: string;
  footerLiveChat?: string;
  footerLicenseBoard?: string;
  footerLicenseSerial?: string;
  footerGccCompliance?: string;
  // Customizable Showcase sections
  grandPrizeWinners?: GrandPrizeWinner[];
  youtubeVideoUrl?: string;
  youtubeThumbnailUrl?: string;
  youtubeVideoTitle?: string;
  youtubeVideoSubtitle?: string;
  youtubeVideoDescription?: string;
  youtubeVideoDetails?: string;
  totalMetricRegisteredUsers?: string;
  totalMetricTicketsPurchased?: string;
  totalMetricRegisteredUsersBase?: string;
  totalMetricTicketsPurchasedBase?: string;
  totalMetricRegisteredUsersRate?: string;
  totalMetricTicketsPurchasedRate?: string;
  videoWinners?: VideoWinner[];
  drawResults?: DrawResult[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  user: UserProfile | null;
  setUser: (profile: UserProfile | null) => void;
  allUsers: UserProfile[];
  setAllUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  tickets: PurchasedTicket[];
  buyTickets: (newTickets: Array<{ id: number; numbers: number[]; price: number; gameName: string }>) => boolean;
  updateUserBalance: (email: string, amount: number) => void;
  updateUserProfileFields: (email: string, fields: Partial<UserProfile>) => Promise<void>;
  deleteUserFirestore: (email: string) => Promise<void>;
  triggerDraw: (gameName: string, winningNumbers: number[]) => { matchedIds: number[]; payoutTotal: number };
  logout: () => void;
  historicalDraws: HistoricalDraw[];
  addHistoricalDraw: (draw: HistoricalDraw) => void;
  siteConfig: SiteThemeConfig;
  updateSiteConfig: (config: Partial<SiteThemeConfig>) => void;
  dynamicGames: DynamicGame[];
  updateDynamicGame: (name: string, fields: Partial<DynamicGame>) => void;
  addDynamicGame: (game: DynamicGame) => Promise<void>;
  deleteDynamicGame: (name: string) => Promise<void>;
  // Raffle Winners dynamic configuration states
  raffleWinners: DailyRaffleWinner[];
  setRaffleWinners: React.Dispatch<React.SetStateAction<DailyRaffleWinner[]>>;
  addRaffleWinner: (winner: Omit<DailyRaffleWinner, 'id'>) => void;
  deleteRaffleWinner: (id: string) => void;
  updateRaffleWinner: (id: string, fields: Partial<DailyRaffleWinner>) => void;
  // Dynamic Promotions
  promotions: Promotion[];
  setPromotions: React.Dispatch<React.SetStateAction<Promotion[]>>;
  addPromotion: (promo: Omit<Promotion, 'id'>) => Promise<void>;
  updatePromotion: (id: string, fields: Partial<Promotion>) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  // Dynamic News Articles
  newsArticles: NewsArticle[];
  setNewsArticles: React.Dispatch<React.SetStateAction<NewsArticle[]>>;
  addNewsArticle: (news: Omit<NewsArticle, 'id'>) => Promise<void>;
  updateNewsArticle: (id: string, fields: Partial<NewsArticle>) => Promise<void>;
  deleteNewsArticle: (id: string) => Promise<void>;
  // Withdrawal requests
  withdrawalRequests: WithdrawalRequest[];
  setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  addWithdrawalRequest: (req: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => void;
  updateWithdrawalStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  // Deposit requests
  depositRequests: DepositRequest[];
  setDepositRequests: React.Dispatch<React.SetStateAction<DepositRequest[]>>;
  addDepositRequest: (req: Omit<DepositRequest, 'id' | 'date' | 'status'>) => void;
  addApprovedDeposit: (req: Omit<DepositRequest, 'id' | 'date' | 'status'>) => void;
  updateDepositStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  // Theme management
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Language management
  language: 'en' | 'bn';
  toggleLanguage: () => void;
  setLanguage: (lang: 'en' | 'bn') => void;
  allUsersCount: number;
  allTicketsCount: number;
}

const DEFAULT_USERS: UserProfile[] = [
  {
    name: 'Meshkat sorif payal',
    email: 'md.meshkat200@gmail.com',
    balance: 500,
    role: 'user',
    dob: '08/10/2005',
    phone: '+8801986259552',
    country: 'Bangladesh',
    winningsBalance: 180,
    nidNumber: '55248963251',
    passportNumber: 'A0458923',
    password: '1111'
  },
  {
    name: 'Meshkat Sorif Payal (Admin)',
    email: 'payalyt6279@gmail.com',
    balance: 10000,
    role: 'admin',
    dob: '08/10/2005',
    phone: '+8801986259552',
    country: 'Bangladesh',
    winningsBalance: 5000,
    password: '111111'
  },
  {
    name: 'Admin Controller',
    email: 'admin@goloballottery.com',
    balance: 10000,
    role: 'admin',
    dob: '01/01/1990',
    phone: '+97140000000',
    country: 'United Arab Emirates',
    winningsBalance: 0,
    nidNumber: '00000000000',
    passportNumber: 'N0000000',
    password: '111111'
  }
];

const DEFAULT_SITE_CONFIG: SiteThemeConfig = {
  primaryHex: '#E52535',
  primaryLogoText: 'GOLOBAL',
  logoImageUrl: '',
  heroHeadline: 'Reach for the skies with',
  heroJackpotAmount: '$50,000,000',
  heroDetails: 'Draw ends 21st June & resets to $30,000,000',
  heroDaysToGo: '3',
  bannerMascotUrl: '/images/emirates_winner_mascot_1781774955947.jpg',
  customBgColor: '#F4F4F6',
  heroBannerBgType: 'gradient',
  heroBannerBgSolidHex: '#E52535',
  allGamesSolidBg: false,
  allGamesSolidHex: '#E52535',
  hideHeroShadow: false,
  // bKash & Nagad defaults
  bkashNumber: '+8801986259552',
  bkashEnabled: true,
  bkashInstructions: 'Please cash out or send money to the Admin bKash personal number: +8801986259552. Provide your Transaction ID (TrxID) for prompt approval.',
  nagadNumber: '+8801849182390',
  nagadEnabled: true,
  nagadInstructions: 'Send money to our official Nagad personal number: +8801849182390. Provide your 8-character Transaction ID for verification.',
  // Rocket, Visa, Mastercard, USDT defaults
  rocketNumber: '+8801725918231',
  rocketEnabled: true,
  rocketInstructions: 'Send money to our Rocket personal wallet: +8801725918231. Enter your Rocket TxID to authorize credit.',
  visaEnabled: true,
  visaInstructions: 'Specify your Visa card credentials below. Top-ups are processed through a highly-secure payment gateway instantly.',
  mastercardEnabled: true,
  mastercardInstructions: 'Specify your Mastercard credentials. Transactions are guarded by 3D-Secure and local bank protocols.',
  usdtAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  usdtEnabled: true,
  usdtInstructions: 'Send USDT (ERC20/TRC20) to our secure address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Enter the TxHash for instant validation.',
  governmentFeePct: 10,
  minWithdrawalAmount: 10,
  maxWithdrawalAmount: 100000000,
  usdExchangeRate: 117,
  // Agent defaults
  agentWhatsappLink: 'https://wa.me/8801986259552',
  agentImoLink: 'https://imo.im/8801986259552',
  agentTelegramLink: 'https://t.me/md_meshkat_payal',
  agentEnabled: true,
  agentInstructions: 'You can deposit, withdraw or pay commission directly through our authorized local agents via WhatsApp, IMO or Telegram. Click any agent button below to initiate an instant chat. After transferring the money, please provide the details below.',
  // Footer customizer fields default values
  footerEmail: 'support@draw.com',
  footerWhatsapp: '+1 234 567 890',
  footerTelegram: '@drawsupport',
  footerImo: 'Live IMO',
  footerLiveChat: '24/7 Agent',
  footerLicenseBoard: 'Curacao eGaming Regulatory Authority',
  footerLicenseSerial: '#1668/JAZ - 2026 AUDITED LOTTERY PROTOCOL',
  footerGccCompliance: 'GCC-L-984210',
  // Default Custom Banners
  banners: [
    {
      id: "b-1",
      title: "BIGGER, BETTER, BOLDER DRAW TODAY!",
      subtitle: "Win the guaranteed grand cash jackpot prize this week",
      imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200",
      linkUrl: "/dashboard",
      isActive: true,
      buttonText: "PLAY NOW",
      bgType: "image",
      bgColor: "#0f0f14",
      bgGradient: "linear-gradient(135deg, #FF2E42 0%, #1c0204 100%)",
      textColor: "#ffffff",
      buttonColor: "#FFD700",
      buttonTextColor: "#09090b"
    },
    {
      id: "b-2",
      title: "DAILY SURE RAFFLE EXTRAVAGANZA",
      subtitle: "Get free simulated entry multiplier coupon using GOLOBAL50",
      imageUrl: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=1200",
      linkUrl: "/promotions",
      isActive: false,
      buttonText: "VIEW PROMOTIONS",
      bgType: "gradient",
      bgColor: "#121214",
      bgGradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
      textColor: "#ffffff",
      buttonColor: "#FFD700",
      buttonTextColor: "#09090b"
    }
  ],
  paymentGateways: [
    {
      id: 'pg-1',
      name: 'bKash',
      numberOrAddress: '+8801986259552',
      instructions: 'Please cash out or send money to the Admin bKash personal number: +8801986259552. Provide your Transaction ID (TrxID) for prompt approval.',
      enabled: true,
      type: 'both'
    },
    {
      id: 'pg-2',
      name: 'Nagad',
      numberOrAddress: '+8801849182390',
      instructions: 'Send money to our official Nagad personal number: +8801849182390. Provide your 8-character Transaction ID for verification.',
      enabled: true,
      type: 'both'
    },
    {
      id: 'pg-3',
      name: 'Rocket',
      numberOrAddress: '+8801725918231',
      instructions: 'Send money to our Rocket personal wallet: +8801725918231. Enter your Rocket TxID to authorize credit.',
      enabled: true,
      type: 'both'
    },
    {
      id: 'pg-4',
      name: 'USDT (TRC20)',
      numberOrAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      instructions: 'Send USDT (ERC20/TRC20) to our secure address: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e. Enter the TxHash for instant validation.',
      enabled: true,
      type: 'both'
    },
    {
      id: 'pg-5',
      name: 'Dokan Pay',
      numberOrAddress: 'API-Enabled',
      instructions: 'Pay securely using bKash, Nagad, Rocket or Bank Transfer via Dokan Pay gateway.',
      enabled: true,
      type: 'deposit'
    }
  ],
  grandPrizeWinners: [
    {
      id: 'gpw-1',
      name: 'Robert Burkovski',
      prize: '$2,042,205',
      imageUrl: '/images/emirates_winner_robert_1781775078543.jpg',
      isActive: true
    }
  ],
  youtubeVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtubeThumbnailUrl: '/images/emirates_interview_thumbnail_1781775097474.jpg',
  youtubeVideoTitle: "From Mother's Blessings to AED 100 Million",
  youtubeVideoSubtitle: 'INTERVIEWS',
  youtubeVideoDescription: 'Meet our lucky winners',
  youtubeVideoDetails: 'Discover the deep stories of global participants who completed life-changing draw wins.',
  totalMetricRegisteredUsers: '119,230,692',
  totalMetricTicketsPurchased: '105,485,912',
  totalMetricRegisteredUsersBase: '119230000',
  totalMetricTicketsPurchasedBase: '105485000',
  totalMetricRegisteredUsersRate: '12',
  totalMetricTicketsPurchasedRate: '25',
  videoWinners: [
    {
      id: 'vw-1',
      title: "From Mother's Blessings to AED 100 Mill...",
      name: 'Sriram Rajagopalan',
      prizeText: '$27,229,408',
      date: '16 March 2025',
      thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600',
      youtubeId: 'dQw4w9WgXcQ',
      isActive: true
    },
    {
      id: 'vw-2',
      title: 'Meet our first Canadian Grand Prize Win...',
      name: 'Robert Burkovski',
      prizeText: '$6,807 EVERY MONTH X 25 YEARS',
      date: '16 December 2023',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600',
      youtubeId: 'dQw4w9WgXcQ',
      isActive: true
    },
    {
      id: 'vw-3',
      title: 'Our AED 15 million Grand Prize Winner, M...',
      name: 'Mohammad Inam',
      prizeText: '$4,084,111',
      date: '15 December 2023',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600',
      youtubeId: 'dQw4w9WgXcQ',
      isActive: true
    },
    {
      id: 'vw-4',
      title: '"I don\'t think much-if I need it, I buy it."',
      name: 'Mohammad Inam',
      prizeText: '$4,084,111',
      date: '15 December 2023',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
      youtubeId: 'dQw4w9WgXcQ',
      isActive: true
    },
    {
      id: 'vw-5',
      title: 'Magesh Kumar secured a worry-free life',
      name: 'Magesh Kumar',
      prizeText: '$6,807 EVERY MONTH X 25 YEARS',
      date: '14 October 2023',
      thumbnailUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600',
      youtubeId: 'dQw4w9WgXcQ',
      isActive: true
    },
    {
      id: 'vw-6',
      title: 'Freilyn achieved her financial freedom by',
      name: 'Freilyn Angob',
      prizeText: '$6,807 EVERY MONTH X 25 YEARS',
      date: '9 September 2023',
      thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
      youtubeId: 'dQw4w9WgXcQ',
      isActive: true
    }
  ],
  drawResults: [
    // MEGA7
    { id: 'dr-1', gameName: 'MEGA7', date: '14 June 2026', numbers: [4, 12, 18, 32, 49, 15, 21], totalWinners: '1,250 Players', totalPaid: '$45,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-2', gameName: 'MEGA7', date: '07 June 2026', numbers: [8, 11, 23, 27, 35, 42, 45], totalWinners: '1,090 Players', totalPaid: '$38,200.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-3', gameName: 'MEGA7', date: '31 May 2026', numbers: [1, 9, 14, 22, 30, 39, 48], totalWinners: '1,430 Players', totalPaid: '$53,100.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-4', gameName: 'MEGA7', date: '24 May 2026', numbers: [3, 7, 19, 25, 34, 41, 47], totalWinners: '990 Players', totalPaid: '$31,400.00', refCode: 'EMD-2941-XQ9' },
    // WILD5
    { id: 'dr-5', gameName: 'WILD5', date: '13 June 2026', numbers: [5, 12, 19, 27, 35], totalWinners: '840 Players', totalPaid: '$18,500.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-6', gameName: 'WILD5', date: '06 June 2026', numbers: [2, 10, 15, 22, 31], totalWinners: '750 Players', totalPaid: '$14,200.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-7', gameName: 'WILD5', date: '30 May 2026', numbers: [1, 5, 12, 18, 29], totalWinners: '910 Players', totalPaid: '$21,000.00', refCode: 'EMD-2941-XQ9' },
    // EASY6
    { id: 'dr-8', gameName: 'EASY6', date: '12 June 2026', numbers: [23, 11, 35, 39, 31, 25], totalWinners: '540 Players', totalPaid: '$4,512.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-9', gameName: 'EASY6', date: '05 June 2026', numbers: [4, 18, 22, 29, 33, 9], totalWinners: '412 Players', totalPaid: '$3,110.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-10', gameName: 'EASY6', date: '29 May 2026', numbers: [12, 15, 19, 21, 30, 37], totalWinners: '625 Players', totalPaid: '$5,980.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-11', gameName: 'EASY6', date: '22 May 2026', numbers: [2, 10, 16, 27, 34, 38], totalWinners: '390 Players', totalPaid: '$3,400.00', refCode: 'EMD-2941-XQ9' },
    // FAST5
    { id: 'dr-12', gameName: 'FAST5', date: '13 June 2026', numbers: [7, 14, 22, 35, 41], totalWinners: '640 Players', totalPaid: '1 Grand Winner (Monthly)', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-13', gameName: 'FAST5', date: '06 June 2026', numbers: [3, 11, 25, 30, 39], totalWinners: '430 Players', totalPaid: '$11,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-14', gameName: 'FAST5', date: '30 May 2026', numbers: [9, 15, 18, 26, 33], totalWinners: '580 Players', totalPaid: '$12,500.00', refCode: 'EMD-2941-XQ9' },
    // SURE 1
    { id: 'dr-15', gameName: 'SURE 1', date: '16 June 2026', numbers: [7], totalWinners: '3,210 Players', totalPaid: '$31,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-16', gameName: 'SURE 1', date: '15 June 2026', numbers: [4], totalWinners: '2,890 Players', totalPaid: '$27,500.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-17', gameName: 'SURE 1', date: '14 June 2026', numbers: [9], totalWinners: '3,100 Players', totalPaid: '$30,000.00', refCode: 'EMD-2941-XQ9' },
    // SURE 2
    { id: 'dr-18', gameName: 'SURE 2', date: '15 June 2026', numbers: [2, 9], totalWinners: '1,450 Players', totalPaid: '$36,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-19', gameName: 'SURE 2', date: '08 June 2026', numbers: [5, 0], totalWinners: '1,120 Players', totalPaid: '$29,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-20', gameName: 'SURE 2', date: '01 June 2026', numbers: [3, 7], totalWinners: '1,280 Players', totalPaid: '$32,000.00', refCode: 'EMD-2941-XQ9' },
    // SURE 3
    { id: 'dr-21', gameName: 'SURE 3', date: '11 June 2026', numbers: [1, 9, 5], totalWinners: '610 Players', totalPaid: '$52,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-22', gameName: 'SURE 3', date: '01 June 2026', numbers: [6, 2, 8], totalWinners: '480 Players', totalPaid: '$41,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-23', gameName: 'SURE 3', date: '21 May 2026', numbers: [3, 0, 7], totalWinners: '520 Players', totalPaid: '$44,500.00', refCode: 'EMD-2941-XQ9' },
    // PICK 1
    { id: 'dr-24', gameName: 'PICK 1', date: '16 June 2026', numbers: [1], totalWinners: '110 Players', totalPaid: '$60,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-25', gameName: 'PICK 1', date: '15 June 2026', numbers: [15], totalWinners: '95 Players', totalPaid: '$5,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-26', gameName: 'PICK 1', date: '14 June 2026', numbers: [7], totalWinners: '105 Players', totalPaid: '$6,000.00', refCode: 'EMD-2941-XQ9' },
    // PICK 2
    { id: 'dr-27', gameName: 'PICK 2', date: '16 June 2026', numbers: [4, 18], totalWinners: '125 Players', totalPaid: '$100,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-28', gameName: 'PICK 2', date: '15 June 2026', numbers: [7, 12], totalWinners: '88 Players', totalPaid: '$5,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-29', gameName: 'PICK 2', date: '14 June 2026', numbers: [3, 9], totalWinners: '102 Players', totalPaid: '$8,000.00', refCode: 'EMD-2941-XQ9' },
    // LOTTERY
    { id: 'dr-30', gameName: 'LOTTERY', date: '16 June 2026', numbers: [5, 12, 19, 27, 33, 41], totalWinners: '241 Players', totalPaid: '$1,000,000.00', refCode: 'EMD-2941-XQ9' },
    { id: 'dr-31', gameName: 'LOTTERY', date: '09 June 2026', numbers: [1, 10, 15, 22, 38, 44], totalWinners: '189 Players', totalPaid: '$15,000.00', refCode: 'EMD-2941-XQ9' }
  ]
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
  allUsers: [],
  setAllUsers: () => {},
  tickets: [],
  buyTickets: () => false,
  updateUserBalance: () => {},
  updateUserProfileFields: async () => {},
  triggerDraw: () => ({ matchedIds: [], payoutTotal: 0 }),
  logout: () => {},
  historicalDraws: [],
  addHistoricalDraw: () => {},
  siteConfig: DEFAULT_SITE_CONFIG,
  updateSiteConfig: () => {},
  dynamicGames: [],
  updateDynamicGame: () => {},
  addDynamicGame: async () => {},
  deleteDynamicGame: async () => {},
  raffleWinners: [],
  setRaffleWinners: () => {},
  addRaffleWinner: () => {},
  deleteRaffleWinner: () => {},
  updateRaffleWinner: () => {},
  promotions: [],
  setPromotions: () => {},
  addPromotion: async () => {},
  updatePromotion: async () => {},
  deletePromotion: async () => {},
  newsArticles: [],
  setNewsArticles: () => {},
  addNewsArticle: async () => {},
  updateNewsArticle: async () => {},
  deleteNewsArticle: async () => {},
  withdrawalRequests: [],
  setWithdrawalRequests: () => {},
  addWithdrawalRequest: () => {},
  updateWithdrawalStatus: () => {},
  depositRequests: [],
  setDepositRequests: () => {},
  addDepositRequest: () => {},
  addApprovedDeposit: () => {},
  updateDepositStatus: () => {},
  theme: 'dark',
  toggleTheme: () => {},
  language: 'en',
  toggleLanguage: () => {},
  setLanguage: () => {}
});

export const getInitialGames = (): DynamicGame[] => [
  { name: 'MEGA7', prize: '$50,000,000', price: 15, drawTime: 'Sunday', targetDateStr: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), bgHex: '#E52535', isSolidStyle: false, ballCount: 7, maxBallValue: 99 },
  { name: 'WILD5', prize: '$3,000,000', price: 10, drawTime: 'Saturday', targetDateStr: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#1C2C80', isSolidStyle: false, ballCount: 5, maxBallValue: 49 },
  { name: 'EASY6', prize: '$4,000,000', price: 6, drawTime: 'Friday', targetDateStr: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), bgHex: '#12A054', isSolidStyle: false, ballCount: 6, maxBallValue: 39 },
  { name: 'FAST5', prize: '$6,000', price: 8, drawTime: 'Saturday', targetDateStr: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), bgHex: '#1AA3E5', isSolidStyle: false, ballCount: 5, maxBallValue: 39 },
  { name: 'LOTTERY', prize: '$1,000,000', price: 5, drawTime: 'Daily', targetDateStr: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#F9A825', isSolidStyle: false, ballCount: 6, maxBallValue: 45 },
  { name: 'SCRATCH CARDS', prize: 'INSTANT WIN', price: 5, drawTime: 'Play Now', targetDateStr: new Date().toISOString(), bgHex: '#9C27B0', isSolidStyle: false, ballCount: 0, maxBallValue: 0 },
  { name: 'SURE 1', prize: '$10,000', price: 10, drawTime: 'Daily', targetDateStr: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#EC4899', isSolidStyle: false, ballCount: 1, maxBallValue: 10 },
  { name: 'SURE 2', prize: '$25,000', price: 15, drawTime: 'Weekly', targetDateStr: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#8B5CF6', isSolidStyle: false, ballCount: 2, maxBallValue: 20 },
  { name: 'SURE 3', prize: '$50,000', price: 30, drawTime: 'Monthly', targetDateStr: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#14B8A6', isSolidStyle: false, ballCount: 3, maxBallValue: 10 },
  { name: 'PICK 1', prize: '$60,000', price: 3, drawTime: 'Daily', targetDateStr: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), bgHex: '#8F3EA5', isSolidStyle: false, ballCount: 1, maxBallValue: 36 },
  { name: 'PICK 2', prize: '$100,000', price: 4, drawTime: 'Daily', targetDateStr: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), bgHex: '#F97316', isSolidStyle: false, ballCount: 2, maxBallValue: 20 },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('allUsers');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [dynamicGames, setDynamicGames] = useState<DynamicGame[]>(getInitialGames);
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [historicalDraws, setHistoricalDraws] = useState<HistoricalDraw[]>([]);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [raffleWinners, setRaffleWinners] = useState<DailyRaffleWinner[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);

  const intelligentMergeConfig = (defaultConfig: SiteThemeConfig, data: Partial<SiteThemeConfig>): SiteThemeConfig => {
    const merged = { ...defaultConfig, ...data };
    if (data.paymentGateways && Array.isArray(data.paymentGateways)) {
      const defaultGateways = defaultConfig.paymentGateways || [];
      const mergedGateways = [...defaultGateways];
      data.paymentGateways.forEach((g: any) => {
        const idx = mergedGateways.findIndex(dg => dg.id === g.id);
        if (idx > -1) {
          mergedGateways[idx] = { ...mergedGateways[idx], ...g };
        } else {
          mergedGateways.push(g);
        }
      });
      merged.paymentGateways = mergedGateways;
    }
    return merged;
  };

  const [siteConfig, setSiteConfig] = useState<SiteThemeConfig>(() => {
    try {
      const saved = localStorage.getItem('siteConfig');
      if (saved) {
        const parsed = JSON.parse(saved);
        return intelligentMergeConfig(DEFAULT_SITE_CONFIG, parsed);
      }
    } catch (e) {
      console.warn("Could not load siteConfig from localStorage:", e);
    }
    return DEFAULT_SITE_CONFIG;
  });

  const [allUsersCount, setAllUsersCount] = useState<number>(0);
  const [allTicketsCount, setAllTicketsCount] = useState<number>(0);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [language, setLanguage] = useState<'en' | 'bn'>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'bn') ? saved : 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- SEED DATABASE ON MOUNT ---
  useEffect(() => {
    const seedDatabase = async () => {
      try {
        // 1. Seed Site Config (Public Read)
        const configRef = doc(db, 'siteConfigs', 'default');
        try {
          const configSnap = await getDoc(configRef);
          if (!configSnap.exists()) {
            await setDoc(configRef, DEFAULT_SITE_CONFIG);
          }
        } catch (e) {
          console.log("Site config seeding skipped (likely permissions or exists)");
        }

        // 2. Seed Users (Protected)
        // We only attempt this if we are likely an admin or if we can read the doc
        for (const u of DEFAULT_USERS) {
          try {
            const userRef = doc(db, 'users', u.email.toLowerCase());
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              // Note: This might still fail if not admin, which is fine
              await setDoc(userRef, u);
            }
          } catch (e) {
            // Silently skip if no permission to read/write specific user doc
          }
        }

        // 3. Seed Dynamic Games (Public Read)
        try {
          const gamesColl = collection(db, 'dynamicGames');
          const gamesSnap = await getDocs(gamesColl);
          
          const initialGames = [
            { name: 'MEGA7', prize: '$50,000,000', price: 15, drawTime: 'Sunday', targetDateStr: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), bgHex: '#E52535', isSolidStyle: false, ballCount: 7, maxBallValue: 99 },
            { name: 'WILD5', prize: '$3,000,000', price: 10, drawTime: 'Saturday', targetDateStr: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#1C2C80', isSolidStyle: false, ballCount: 5, maxBallValue: 49 },
            { name: 'EASY6', prize: '$4,000,000', price: 6, drawTime: 'Friday', targetDateStr: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), bgHex: '#12A054', isSolidStyle: false, ballCount: 6, maxBallValue: 39 },
            { name: 'FAST5', prize: '$6,000', price: 8, drawTime: 'Saturday', targetDateStr: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 13 * 60 * 60 * 1000).toISOString(), bgHex: '#1AA3E5', isSolidStyle: false, ballCount: 5, maxBallValue: 39 },
            { name: 'LOTTERY', prize: '$1,000,000', price: 5, drawTime: 'Daily', targetDateStr: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#F9A825', isSolidStyle: false, ballCount: 6, maxBallValue: 45 },
            { name: 'SCRATCH CARDS', prize: 'INSTANT WIN', price: 5, drawTime: 'Play Now', targetDateStr: new Date().toISOString(), bgHex: '#9C27B0', isSolidStyle: false, ballCount: 0, maxBallValue: 0 },
            { name: 'SURE 1', prize: '$10,000', price: 10, drawTime: 'Daily', targetDateStr: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#EC4899', isSolidStyle: false, ballCount: 1, maxBallValue: 10 },
            { name: 'SURE 2', prize: '$25,000', price: 15, drawTime: 'Weekly', targetDateStr: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#8B5CF6', isSolidStyle: false, ballCount: 2, maxBallValue: 20 },
            { name: 'SURE 3', prize: '$50,000', price: 30, drawTime: 'Monthly', targetDateStr: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), bgHex: '#14B8A6', isSolidStyle: false, ballCount: 3, maxBallValue: 10 },
            { name: 'PICK 1', prize: '$60,000', price: 3, drawTime: 'Daily', targetDateStr: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), bgHex: '#8F3EA5', isSolidStyle: false, ballCount: 1, maxBallValue: 36 },
            { name: 'PICK 2', prize: '$100,000', price: 4, drawTime: 'Daily', targetDateStr: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), bgHex: '#F97316', isSolidStyle: false, ballCount: 2, maxBallValue: 20 },
          ];

          const existingGamesMap: Record<string, any> = {};
          gamesSnap.forEach(d => {
            existingGamesMap[d.id] = d.data();
          });

          for (const g of initialGames) {
            const existing = existingGamesMap[g.name];
            if (!existing || !existing.price || !existing.prize || !existing.targetDateStr) {
              await setDoc(doc(db, 'dynamicGames', g.name), g, { merge: true });
            }
          }
        } catch (e) {
          console.log("Games seeding skipped");
        }

        // 4. Seed Raffle Winners (Public Read)
        try {
          const raffleColl = collection(db, 'raffleWinners');
          const raffleSnap = await getDocs(raffleColl);
          if (raffleSnap.empty) {
            const initialWinners = [
              {
                id: 'w-1',
                name: 'Abishek Patel',
                country: 'India',
                flag: '🇮🇳',
                ticket: 'SR1-0487B',
                prize: '$30,000.00',
                game: 'SURE 1 DRAW',
                avatarBg: 'bg-gradient-to-tr from-amber-500 to-orange-600',
                initials: 'AP',
                imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&auto=format'
              },
              {
                id: 'w-2',
                name: 'Tariq Al-Mansoor',
                country: 'UAE',
                flag: '🇦🇪',
                ticket: 'SR3-9381X',
                prize: '$360,000.00',
                game: 'SURE 3 DRAW',
                avatarBg: 'bg-gradient-to-tr from-red-500 to-rose-600',
                initials: 'TM',
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format'
              },
              {
                id: 'w-3',
                name: 'Salma Begum',
                country: 'Bangladesh',
                flag: '🇧🇩',
                ticket: 'SR2-1249A',
                prize: '$50,000.00',
                game: 'SURE 2 DRAW',
                avatarBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600',
                initials: 'SB',
                imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format'
              },
              {
                id: 'w-4',
                name: 'Muhammad Rizwan',
                country: 'Pakistan',
                flag: '🇵🇰',
                ticket: 'SR1-5819D',
                prize: '$30,000.00',
                game: 'SURE 1 DRAW',
                avatarBg: 'bg-gradient-to-tr from-blue-500 to-indigo-600',
                initials: 'MR',
                imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&auto=format'
              }
            ];
            for (const w of initialWinners) {
              await setDoc(doc(db, 'raffleWinners', w.id), w);
            }
          }
        } catch (e) {
          console.log("Raffle winners seeding skipped");
        }

        // Seed Promotions (Public Read)
        try {
          const promoColl = collection(db, 'promotions');
          const promoSnap = await getDocs(promoColl);
          if (promoSnap.empty) {
            const initialPromos = [
              {
                id: 'p-1',
                title: 'MEGA7 Rollover to USD 50 Million',
                date: '31/05/2026',
                excerpt: 'Purchase a MEGA7 ticket during the promotional period to enter the draw... High odds and monumental rollovers inside the drawing engines.',
                buttonText: 'READ MORE',
                flyerTitle: 'MEGA7 Rollover',
                flyerAmount: '$50,000,000',
                flyerSub: 'EXTENDED: Reach for the skies with $50M!',
                flyerExtra: 'ENDS 21st JUNE • RESETS TO $30,000,000',
                flyerGradient: 'from-amber-600 via-[#E52535] to-[#4A030A] text-white',
                accentColor: '[#E52535]',
                targetLink: '/games/mega7',
                isActive: true
              },
              {
                id: 'p-2',
                title: 'WIN 52 FREE TICKETS PROMO',
                date: '24/05/2026',
                excerpt: 'Congratulations to Our Eid Bonanza Winners! Every purchase qualifies you automatically for the free tickets multiplier pools.',
                buttonText: 'READ MORE',
                flyerTitle: 'EID BONANZA',
                flyerAmount: 'WIN 52 FREE',
                flyerSub: 'Buy 5 tickets of any game to qualify instantly!',
                flyerExtra: 'OFFER ENDS 31 MAY • ADD TO CART',
                flyerGradient: 'from-purple-850 via-[#7C3AED] to-[#1C1F5C] text-white',
                accentColor: '[#7C3AED]',
                targetLink: '/dashboard',
                isActive: true
              },
              {
                id: 'p-3',
                title: 'BUY 3 PICK2 GET 2 FREE',
                date: '12/02/2026',
                excerpt: 'Add 5 PICK2 tickets to your cart in a single transaction during the promotional times to instantly avail of the automatic bonus free codes.',
                buttonText: 'READ MORE',
                flyerTitle: 'BUY 3 GET 2 FREE',
                flyerAmount: '$150,000',
                flyerSub: 'Live your dreams with Pick2 prize multipliers!',
                flyerExtra: 'LIMITED TIME OFFER • PICK TICKETS NOW',
                flyerGradient: 'from-emerald-700 via-[#0D9488] to-[#113C4A] text-white',
                accentColor: 'teal-600',
                targetLink: '/rush/pick2',
                isActive: true
              }
            ];
            for (const p of initialPromos) {
              await setDoc(doc(db, 'promotions', p.id), p);
            }
          }
        } catch (e) {
          console.log("Promotions seeding skipped");
        }

        // Seed News Articles (Public Read)
        try {
          const newsColl = collection(db, 'newsArticles');
          const newsSnap = await getDocs(newsColl);
          if (newsSnap.empty) {
            const initialNews = [
              {
                id: 'n-1',
                title: 'Emirate Draw: Indian Player Wins INR 2.8 Million!',
                excerpt: "How one man's belief paid off big and why your moment could be next. He started with a single ticket and is now celebrating with family.",
                date: '11 June 2026',
                imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
                bannerTitle: 'SURE 1 WINNER',
                bannerSubtitle: '$30,000',
                bannerBg: 'bg-gradient-to-r from-pink-600 via-pink-500 to-rose-600 text-white',
                isActive: true
              },
              {
                id: 'n-2',
                title: 'One Number Away From $4 Million: Three Indian Expats Celebrate Golobal Lottery Wins',
                excerpt: 'Now, $50 Million MEGA7 Opportunity Awaits This Sunday. All three matched 6 of the 7 numbers to unlock the secondary prizes.',
                date: '4 June 2026',
                imageUrl: 'https://images.unsplash.com/photo-1556157382-97dea7d240ff?auto=format&fit=crop&q=80&w=400',
                bannerTitle: 'Winners every week!',
                bannerSubtitle: '$8,333 EASY6 WINNER',
                bannerBg: 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white',
                isActive: true
              },
              {
                id: 'n-3',
                title: 'Golobal Lottery: You Spend This Much Every Week. Make It Count!',
                excerpt: 'A limited-time offer and the belief that one ticket can change everything. Check out our Eid special multipliers to learn more.',
                date: '29 May 2026',
                imageUrl: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=400',
                bannerTitle: 'EID BONANZA',
                bannerSubtitle: 'WIN 52 FREE TICKETS',
                bannerBg: 'bg-gradient-to-r from-red-650 from-red-600 via-[#E52535] to-amber-500 text-white',
                isActive: true
              },
              {
                id: 'n-4',
                title: 'Golobal Lottery Highlights Why Thousands of Players Return Every Week',
                excerpt: 'Limited-time promotions and life-changing prize opportunities continue to drive engagement globally. Explore our ongoing ticket referral systems.',
                date: '21 May 2026',
                imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                bannerTitle: 'FLASH SALE',
                bannerSubtitle: 'ONLY FOR $50',
                bannerBg: 'bg-gradient-to-r from-[#1E2E80] to-indigo-500 text-white',
                isActive: true
              },
              {
                id: 'n-5',
                title: '$25,000 Golobal Lottery EASY6 Brings Life-Changing Moment for One Indian Family',
                excerpt: 'The lucky winner almost hit $4 million. With his winnings, he plans to secure his daughters university education fees and travel home.',
                date: '14 May 2026',
                imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
                bannerTitle: 'Tamil Nadu is on fire!',
                bannerSubtitle: '$25,000 EASY6 WINNER',
                bannerBg: 'bg-gradient-to-r from-green-600 to-emerald-500 text-white',
                isActive: true
              },
              {
                id: 'n-6',
                title: 'One Number Away: Expat in Qatar Wins Big & the $50 Million Dream Isn\'t Over Yet',
                excerpt: 'Golobal Lottery Turns Everyday Hope Into Reality for Latest MEGA7 Winner. He has played consecutively for several draws and finally hit gold.',
                date: '7 May 2026',
                imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
                bannerTitle: 'One number away!',
                bannerSubtitle: '$40,000 WINNER',
                bannerBg: 'bg-gradient-to-r from-[#7C3AED] via-purple-600 to-purple-800 text-white',
                isActive: true
              }
            ];
            for (const n of initialNews) {
              await setDoc(doc(db, 'newsArticles', n.id), n);
            }
          }
        } catch (e) {
          console.log("News seeding skipped");
        }

        // 5. Seed Deposit Requests (Protected)
        try {
          const depositColl = collection(db, 'depositRequests');
          const depositSnap = await getDocs(depositColl);
          if (depositSnap.empty) {
            const initialDeposits = [
              {
                id: 'DEP-7819',
                email: 'md.meshkat200@gmail.com',
                amount: 250,
                gateway: 'bKash',
                transactionId: 'BK8291HA90',
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
                status: 'Pending'
              }
            ];
            for (const d of initialDeposits) {
              await setDoc(doc(db, 'depositRequests', d.id), d);
            }
          }
        } catch (e) {
          // Silently skip
        }

        // 6. Seed Withdrawal Requests (Protected)
        try {
          const withdrawalColl = collection(db, 'withdrawalRequests');
          const withdrawalSnap = await getDocs(withdrawalColl);
          if (withdrawalSnap.empty) {
            const initialWithdrawals = [
              {
                id: 'WD-8491',
                email: 'md.meshkat200@gmail.com',
                amount: 80,
                bankName: 'Golobal Bank',
                iban: 'AE4502401000987654321',
                date: new Date(Date.now() - 36 * 60 * 60 * 1000).toLocaleDateString('en-GB'),
                status: 'Pending'
              }
            ];
            for (const w of initialWithdrawals) {
              await setDoc(doc(db, 'withdrawalRequests', w.id), w);
            }
          }
        } catch (e) {
          // Silently skip
        }
      } catch (err) {
        console.warn('General seeding warning (likely normal):', err);
      }
    };

    seedDatabase();
  }, []);

  // --- PUBLIC DATA & AUTH STATE REAL-TIME LISTENERS ---
  useEffect(() => {
    const unsubSite = onSnapshot(doc(db, 'siteConfigs', 'default'), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteThemeConfig>;
        const merged = intelligentMergeConfig(DEFAULT_SITE_CONFIG, data);
        setSiteConfig(merged);
        try {
          localStorage.setItem('siteConfig', JSON.stringify(merged));
        } catch (e) {
          console.warn("Could not save siteConfig to localStorage:", e);
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'siteConfigs/default'));

    const unsubGames = onSnapshot(collection(db, 'dynamicGames'), (snap) => {
      const list: DynamicGame[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data && data.name) {
          list.push({ ...data, id: d.id } as DynamicGame);
        }
      });
      if (list.length > 0) {
        setDynamicGames(list);
      } else {
        setDynamicGames(getInitialGames());
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'dynamicGames'));

    const unsubRaffle = onSnapshot(collection(db, 'raffleWinners'), (snap) => {
      const list: DailyRaffleWinner[] = [];
      snap.forEach((d) => list.push(d.data() as DailyRaffleWinner));
      setRaffleWinners(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'raffleWinners'));

    const unsubDraws = onSnapshot(collection(db, 'historicalDraws'), (snap) => {
      const list: HistoricalDraw[] = [];
      snap.forEach((d) => list.push(d.data() as HistoricalDraw));
      setHistoricalDraws(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'historicalDraws'));

    const unsubPromotions = onSnapshot(collection(db, 'promotions'), (snap) => {
      const list: Promotion[] = [];
      snap.forEach((d) => {
        const p = d.data() as Promotion;
        list.push({ ...p, id: d.id });
      });
      setPromotions(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'promotions'));

    const unsubNews = onSnapshot(collection(db, 'newsArticles'), (snap) => {
      const list: NewsArticle[] = [];
      snap.forEach((d) => {
        const n = d.data() as NewsArticle;
        list.push({ ...n, id: d.id });
      });
      setNewsArticles(list);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'newsArticles'));

    const unsubAllUsersCount = onSnapshot(collection(db, 'users'), (snap) => {
      setAllUsersCount(snap.size);
    }, (err) => console.log('unsubAllUsersCount err', err));

    const unsubAllTicketsCount = onSnapshot(collection(db, 'purchasedTickets'), (snap) => {
      setAllTicketsCount(snap.size);
    }, (err) => console.log('unsubAllTicketsCount err', err));

    let unsubUserDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      if (firebaseUser && firebaseUser.email) {
        setIsLoggedIn(true);
        setAuthInitialized(true);
        const emailLower = firebaseUser.email.toLowerCase();
        
        // Listen to the user document in real-time
        unsubUserDoc = onSnapshot(doc(db, 'users', emailLower), async (snap) => {
          const isAdminEmail = ['payalyt6279@gmail.com', 'admin@goloballottery.com', 'payal@gmail.com', 'admin.payal@gmail.com'].includes(emailLower);
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            if (isAdminEmail && data.role !== 'admin') {
              data.role = 'admin';
              await setDoc(doc(db, 'users', emailLower), { role: 'admin' }, { merge: true });
            }
            setUser(data);
          } else {
            const defaultProfile: UserProfile = {
              name: firebaseUser.displayName || (isAdminEmail ? 'Admin Controller' : 'Golobal Lottery Player'),
              email: emailLower,
              balance: isAdminEmail ? 10000.0 : 0.0,
              role: isAdminEmail ? 'admin' : 'user',
              dob: '08/10/2005',
              phone: firebaseUser.phoneNumber || '+8801986555111',
              country: 'Bangladesh',
              winningsBalance: isAdminEmail ? 5000.0 : 0,
              commissionBalance: isAdminEmail ? 1200.0 : 0
            };
            await setDoc(doc(db, 'users', emailLower), defaultProfile);
            setUser(defaultProfile);
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, `users/${emailLower}`));

      } else {
        setAuthInitialized(true);
        // Allow local mock session to survive if Firebase Auth fails or is disabled
        const isLocalLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLocalLoggedIn) {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    });

    return () => {
      unsubSite();
      unsubGames();
      unsubRaffle();
      unsubDraws();
      unsubPromotions();
      unsubNews();
      unsubAllUsersCount();
      unsubAllTicketsCount();
      unsubAuth();
      if (unsubUserDoc) {
        unsubUserDoc();
      }
    };
  }, []);

  // --- USER-SPECIFIC OR ADMIN-SPECIFIC REAL-TIME LISTENERS ---
  useEffect(() => {
    if (!authInitialized) return;

    if (!isLoggedIn || !user) {
      setAllUsers([]);
      setDepositRequests([]);
      setWithdrawalRequests([]);
      setTickets([]);
      return;
    }

    // Only proceed if Firebase Auth actually has a user. 
    // If we have a local session but no Firebase user, we wait for Firebase Auth to catch up or fail.
    if (!auth.currentUser) return;

    const emailLower = user.email.toLowerCase();
    let unsubDeposits: () => void;
    let unsubWithdrawals: () => void;
    let unsubTickets: () => void;
    let unsubUsers: (() => void) | null = null;

    if (user.role === 'admin') {
      // Admins listen to EVERYTHING in full
      unsubDeposits = onSnapshot(collection(db, 'depositRequests'), (snap) => {
        const list: DepositRequest[] = [];
        snap.forEach((d) => list.push(d.data() as DepositRequest));
        setDepositRequests(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'depositRequests'));

      unsubWithdrawals = onSnapshot(collection(db, 'withdrawalRequests'), (snap) => {
        const list: WithdrawalRequest[] = [];
        snap.forEach((d) => list.push(d.data() as WithdrawalRequest));
        setWithdrawalRequests(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'withdrawalRequests'));

      unsubTickets = onSnapshot(collection(db, 'purchasedTickets'), (snap) => {
        const list: PurchasedTicket[] = [];
        snap.forEach((d) => list.push(d.data() as PurchasedTicket));
        setTickets(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'purchasedTickets'));

      unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        const list: UserProfile[] = [];
        snap.forEach((d) => list.push(d.data() as UserProfile));
        setAllUsers(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    } else {
      // Normal users only listen to their OWN records via Firestore queries
      const depositsQuery = query(collection(db, 'depositRequests'), where('email', '==', emailLower));
      unsubDeposits = onSnapshot(depositsQuery, (snap) => {
        const list: DepositRequest[] = [];
        snap.forEach((d) => list.push(d.data() as DepositRequest));
        setDepositRequests(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'depositRequests (filtered)'));

      const withdrawalsQuery = query(collection(db, 'withdrawalRequests'), where('email', '==', emailLower));
      unsubWithdrawals = onSnapshot(withdrawalsQuery, (snap) => {
        const list: WithdrawalRequest[] = [];
        snap.forEach((d) => list.push(d.data() as WithdrawalRequest));
        setWithdrawalRequests(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'withdrawalRequests (filtered)'));

      const ticketsQuery = query(collection(db, 'purchasedTickets'), where('email', '==', emailLower));
      unsubTickets = onSnapshot(ticketsQuery, (snap) => {
        const list: PurchasedTicket[] = [];
        snap.forEach((d) => list.push(d.data() as PurchasedTicket));
        setTickets(list);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'purchasedTickets (filtered)'));

      // Normal users don't have access to other users' list
      setAllUsers([]);
    }

    return () => {
      unsubDeposits();
      unsubWithdrawals();
      unsubTickets();
      if (unsubUsers) {
        unsubUsers();
      }
    };
  }, [isLoggedIn, user?.email, user?.role]);

  // Sync state helpers
  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn.toString());
  }, [isLoggedIn]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
  }, [allUsers]);

  // --- ACTIONS ---
  const buyTickets = (newTickets: Array<{ id: number; numbers: number[]; price: number; gameName: string }>): boolean => {
    if (!user) return false;
    const totalCost = newTickets.reduce((sum, t) => sum + t.price, 0);
    if (user.balance < totalCost) {
      return false; // Insufficient balance
    }

    const createdTickets: PurchasedTicket[] = newTickets.map(t => ({
      id: t.id || Date.now() + Math.random(),
      numbers: t.numbers,
      price: t.price,
      gameName: t.gameName,
      purchaseDate: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      email: user.email,
      status: 'Pending'
    }));

    const updatedBalance = parseFloat((user.balance - totalCost).toFixed(2));

    try {
      // 1. Update own user balance in Firestore
      const userRef = doc(db, 'users', user.email.toLowerCase());
      setDoc(userRef, { ...user, balance: updatedBalance }, { merge: true });

      // 2. Add each ticket in purchasedTickets
      createdTickets.forEach(async (t) => {
        await setDoc(doc(db, 'purchasedTickets', String(t.id)), t);
      });

      setUser(prev => prev ? { ...prev, balance: updatedBalance } : null);
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'purchasedTickets');
      return false;
    }
  };

  const updateUserBalance = async (email: string, amount: number) => {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfile;
        const newBal = parseFloat((uData.balance + amount).toFixed(2));
        await setDoc(userRef, { balance: newBal }, { merge: true });
        if (user && user.email.toLowerCase() === email.toLowerCase()) {
          setUser(prev => prev ? { ...prev, balance: newBal } : null);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${email}`);
    }
  };

  const updateUserProfileFields = async (email: string, fields: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      await setDoc(userRef, fields, { merge: true });
      if (user && user.email.toLowerCase() === email.toLowerCase()) {
        setUser(prev => prev ? { ...prev, ...fields } : null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${email}`);
    }
  };

  const deleteUserFirestore = async (email: string) => {
    try {
      const userRef = doc(db, 'users', email.toLowerCase());
      await deleteDoc(userRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${email}`);
    }
  };

  const addHistoricalDraw = async (draw: HistoricalDraw) => {
    try {
      await setDoc(doc(db, 'historicalDraws', draw.id), draw);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `historicalDraws/${draw.id}`);
    }
  };

  const triggerDraw = (gameName: string, winningNumbers: number[]) => {
    let payoutTotal = 0;
    const matchedIds: number[] = [];

    // Evaluate won tickets
    tickets.forEach(async (t) => {
      if (t.gameName.toUpperCase() === gameName.toUpperCase() && t.status === 'Pending') {
        const matchesCount = t.numbers.filter(num => winningNumbers.includes(num)).length;
        let won = false;
        let payout = 0;

        if (matchesCount >= 3) {
          won = true;
          payout = t.price * (matchesCount === 3 ? 5 : matchesCount === 4 ? 20 : matchesCount === 5 ? 100 : 1000);
          payoutTotal += payout;
          matchedIds.push(t.id);
        }

        const updatedStatus = (won ? 'Won' : 'Lost') as 'Won' | 'Lost';
        const updatedPayout = won ? `$${payout.toFixed(2)}` : undefined;

        try {
          // Update ticket status in Firestore
          await setDoc(doc(db, 'purchasedTickets', String(t.id)), {
            status: updatedStatus,
            payout: updatedPayout
          }, { merge: true });

          // If won, update balance in user profiles
          if (won) {
            const userRef = doc(db, 'users', t.email.toLowerCase());
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const uData = userSnap.data() as UserProfile;
              const newBal = parseFloat((uData.balance + payout).toFixed(2));
              await setDoc(userRef, { balance: newBal }, { merge: true });
              if (user && user.email.toLowerCase() === t.email.toLowerCase()) {
                setUser(prev => prev ? { ...prev, balance: newBal } : null);
              }
            }
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `purchasedTickets/${t.id}`);
        }
      }
    });

    return { matchedIds, payoutTotal };
  };

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.setItem('isLoggedIn', 'false');
      setIsLoggedIn(false);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateSiteConfig = async (newConfig: Partial<SiteThemeConfig>) => {
    try {
      setSiteConfig(prev => ({ ...prev, ...newConfig }));
      await setDoc(doc(db, 'siteConfigs', 'default'), newConfig, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'siteConfigs/default');
    }
  };

  const updateDynamicGame = async (name: string, fields: Partial<DynamicGame>) => {
    try {
      await setDoc(doc(db, 'dynamicGames', name), fields, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `dynamicGames/${name}`);
    }
  };

  const addDynamicGame = async (game: DynamicGame) => {
    try {
      await setDoc(doc(db, 'dynamicGames', game.name), game);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `dynamicGames/${game.name}`);
    }
  };

  const deleteDynamicGame = async (name: string) => {
    try {
      await deleteDoc(doc(db, 'dynamicGames', name));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `dynamicGames/${name}`);
    }
  };

  const addRaffleWinner = async (winner: Omit<DailyRaffleWinner, 'id'>) => {
    try {
      const id = 'w-' + Date.now();
      const newWinner = { ...winner, id };
      await setDoc(doc(db, 'raffleWinners', id), newWinner);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'raffleWinners');
    }
  };

  const deleteRaffleWinner = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'raffleWinners', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `raffleWinners/${id}`);
    }
  };

  const updateRaffleWinner = async (id: string, fields: Partial<DailyRaffleWinner>) => {
    try {
      await setDoc(doc(db, 'raffleWinners', id), fields, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `raffleWinners/${id}`);
    }
  };

  const addPromotion = async (promo: Omit<Promotion, 'id'>) => {
    try {
      const id = 'p-' + Date.now();
      const newPromo = { ...promo, id };
      await setDoc(doc(db, 'promotions', id), newPromo);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'promotions');
    }
  };

  const deletePromotion = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'promotions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `promotions/${id}`);
    }
  };

  const updatePromotion = async (id: string, fields: Partial<Promotion>) => {
    try {
      await setDoc(doc(db, 'promotions', id), fields, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `promotions/${id}`);
    }
  };

  const addNewsArticle = async (news: Omit<NewsArticle, 'id'>) => {
    try {
      const id = 'n-' + Date.now();
      const newNews = { ...news, id };
      await setDoc(doc(db, 'newsArticles', id), newNews);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'newsArticles');
    }
  };

  const deleteNewsArticle = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'newsArticles', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `newsArticles/${id}`);
    }
  };

  const updateNewsArticle = async (id: string, fields: Partial<NewsArticle>) => {
    try {
      await setDoc(doc(db, 'newsArticles', id), fields, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `newsArticles/${id}`);
    }
  };

  const addWithdrawalRequest = async (req: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => {
    try {
      const id = 'WD-' + Math.floor(1000 + Math.random() * 9000);
      const newReq: WithdrawalRequest = {
        ...req,
        id,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'Pending'
      };
      await setDoc(doc(db, 'withdrawalRequests', id), newReq);

      // We no longer deduct here because Dashboard.tsx already deducts it before calling this.
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'withdrawalRequests');
    }
  };

  const updateWithdrawalStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const reqRef = doc(db, 'withdrawalRequests', id);
      const reqSnap = await getDoc(reqRef);
      if (reqSnap.exists()) {
        const req = reqSnap.data() as WithdrawalRequest;
        if (status === 'Rejected' && req.status === 'Pending') {
          const userRef = doc(db, 'users', req.email.toLowerCase());
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const uData = userSnap.data() as UserProfile;
            const currentBal = uData.balance || 0;
            const currentComm = uData.commissionBalance || 0;
            
            const nextBal = currentBal + req.amount;
            const nextComm = currentComm + (req.commissionDeducted || 0);
            
            await setDoc(userRef, { balance: nextBal, commissionBalance: nextComm }, { merge: true });
            if (user && user.email.toLowerCase() === req.email.toLowerCase()) {
              setUser(prev => prev ? { ...prev, balance: nextBal, commissionBalance: nextComm } : null);
            }
          }
        }
        await setDoc(reqRef, { status }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `withdrawalRequests/${id}`);
    }
  };

  const addDepositRequest = async (req: Omit<DepositRequest, 'id' | 'date' | 'status'>) => {
    try {
      const id = 'DEP-' + Math.floor(1000 + Math.random() * 9000);
      const newReq: DepositRequest = {
        ...req,
        id,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'Pending'
      };
      await setDoc(doc(db, 'depositRequests', id), newReq);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'depositRequests');
    }
  };

  const addApprovedDeposit = async (req: Omit<DepositRequest, 'id' | 'date' | 'status'>) => {
    try {
      const id = 'DEP-' + Math.floor(1000 + Math.random() * 9000);
      const newReq: DepositRequest = {
        ...req,
        id,
        date: new Date().toLocaleDateString('en-GB'),
        status: 'Approved'
      };
      await setDoc(doc(db, 'depositRequests', id), newReq);
      await updateUserBalance(req.email, req.amount);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'depositRequests');
    }
  };

  const updateDepositStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const reqRef = doc(db, 'depositRequests', id);
      const reqSnap = await getDoc(reqRef);
      if (reqSnap.exists()) {
        const req = reqSnap.data() as DepositRequest;
        if (status === 'Approved' && req.status === 'Pending') {
          // Check if it's a commission deposit based on gateway or details
          const isCommission = req.gateway.toLowerCase().includes('commission') || req.details?.toLowerCase().includes('commission');
          
          if (isCommission) {
            const userTarget = allUsers.find(u => u.email === req.email);
            const currentComm = userTarget?.commissionBalance || 0;
            await updateUserProfileFields(req.email, { commissionBalance: currentComm + req.amount });
          } else {
            await updateUserBalance(req.email, req.amount);
          }
        }
        await setDoc(reqRef, { status }, { merge: true });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `depositRequests/${id}`);
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      setIsLoggedIn,
      user,
      setUser,
      allUsers,
      setAllUsers,
      tickets,
      buyTickets,
      updateUserBalance,
      updateUserProfileFields,
      deleteUserFirestore,
      triggerDraw,
      logout,
      historicalDraws,
      addHistoricalDraw,
      siteConfig,
      updateSiteConfig,
      dynamicGames,
      updateDynamicGame,
      addDynamicGame,
      deleteDynamicGame,
      // Raffle Winners Provider items
      raffleWinners,
      setRaffleWinners,
      addRaffleWinner,
      deleteRaffleWinner,
      updateRaffleWinner,
      // Dynamic Promotions
      promotions,
      setPromotions,
      addPromotion,
      deletePromotion,
      updatePromotion,
      // Dynamic News Articles
      newsArticles,
      setNewsArticles,
      addNewsArticle,
      deleteNewsArticle,
      updateNewsArticle,
      // Withdrawal requests
      withdrawalRequests,
      setWithdrawalRequests,
      addWithdrawalRequest,
      updateWithdrawalStatus,
      // Deposit requests
      depositRequests,
      setDepositRequests,
      addDepositRequest,
      addApprovedDeposit,
      updateDepositStatus,
      // Theme management
      theme,
      toggleTheme,
      // Language management
      language,
      toggleLanguage,
      setLanguage,
      allUsersCount,
      allTicketsCount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
