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
  maxWithdrawalAmount: number;
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
  // Withdrawal requests
  withdrawalRequests: WithdrawalRequest[];
  setWithdrawalRequests: React.Dispatch<React.SetStateAction<WithdrawalRequest[]>>;
  addWithdrawalRequest: (req: Omit<WithdrawalRequest, 'id' | 'date' | 'status'>) => void;
  updateWithdrawalStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  // Deposit requests
  depositRequests: DepositRequest[];
  setDepositRequests: React.Dispatch<React.SetStateAction<DepositRequest[]>>;
  addDepositRequest: (req: Omit<DepositRequest, 'id' | 'date' | 'status'>) => void;
  updateDepositStatus: (id: string, status: 'Approved' | 'Rejected') => void;
  // Theme management
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Language management
  language: 'en' | 'bn';
  toggleLanguage: () => void;
  setLanguage: (lang: 'en' | 'bn') => void;
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
  maxWithdrawalAmount: 100000000,
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
    }
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
  withdrawalRequests: [],
  setWithdrawalRequests: () => {},
  addWithdrawalRequest: () => {},
  updateWithdrawalStatus: () => {},
  depositRequests: [],
  setDepositRequests: () => {},
  addDepositRequest: () => {},
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
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteThemeConfig>(DEFAULT_SITE_CONFIG);

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
        setSiteConfig({ ...DEFAULT_SITE_CONFIG, ...data });
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

      // Deduct winnings balance
      const userRef = doc(db, 'users', req.email.toLowerCase());
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data() as UserProfile;
        const currentWinBal = uData.winningsBalance !== undefined ? uData.winningsBalance : 180;
        const nextWinBal = Math.max(0, currentWinBal - req.amount);
        await setDoc(userRef, { winningsBalance: nextWinBal }, { merge: true });
        if (user && user.email.toLowerCase() === req.email.toLowerCase()) {
          setUser(prev => prev ? { ...prev, winningsBalance: nextWinBal } : null);
        }
      }
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
        if (status === 'Rejected') {
          const userRef = doc(db, 'users', req.email.toLowerCase());
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const uData = userSnap.data() as UserProfile;
            const currentWinBal = uData.winningsBalance !== undefined ? uData.winningsBalance : 180;
            const nextWinBal = currentWinBal + req.amount;
            await setDoc(userRef, { winningsBalance: nextWinBal }, { merge: true });
            if (user && user.email.toLowerCase() === req.email.toLowerCase()) {
              setUser(prev => prev ? { ...prev, winningsBalance: nextWinBal } : null);
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

  const updateDepositStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const reqRef = doc(db, 'depositRequests', id);
      const reqSnap = await getDoc(reqRef);
      if (reqSnap.exists()) {
        const req = reqSnap.data() as DepositRequest;
        if (status === 'Approved' && req.status === 'Pending') {
          await updateUserBalance(req.email, req.amount);
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
      // Withdrawal requests
      withdrawalRequests,
      setWithdrawalRequests,
      addWithdrawalRequest,
      updateWithdrawalStatus,
      // Deposit requests
      depositRequests,
      setDepositRequests,
      addDepositRequest,
      updateDepositStatus,
      // Theme management
      theme,
      toggleTheme,
      // Language management
      language,
      toggleLanguage,
      setLanguage
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
