import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { t } from '../utils/translations';
import { Login } from './Login';
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
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export function Dashboard() {
  const { user, setUser, isLoggedIn, tickets, updateUserBalance, updateUserProfileFields, withdrawalRequests = [], addWithdrawalRequest, addDepositRequest, addApprovedDeposit, depositRequests = [], siteConfig, language, setLanguage, theme, toggleTheme, systemNotifications = [], markNotificationAsRead } = useAuth();
  const { tickets: cartTickets } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Track previous requests for notifications
  const prevDepositsRef = useRef(depositRequests);
  const prevWithdrawalsRef = useRef(withdrawalRequests);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'success' | 'error'}[]>([]);

  // Real-time toast alerts for database notifications
  const prevNotificationsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!user || !systemNotifications) return;

    const unreadNew = systemNotifications.filter(
      n => !n.read && !prevNotificationsRef.current.includes(n.id)
    );

    unreadNew.forEach(n => {
      const type = n.type === 'success' || n.type === 'payment' ? 'success' : 'error';
      const newNotif = {
        id: n.id,
        message: `${n.title}: ${n.message}`,
        type: type as 'success' | 'error'
      };
      setNotifications(prev => [...prev, newNotif]);
      
      // Auto-remove notification from floating toasts after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(x => x.id !== newNotif.id));
      }, 10000);
    });

    // Sync ref
    prevNotificationsRef.current = systemNotifications.map(n => n.id);
  }, [systemNotifications, user]);

  useEffect(() => {
    if (!user) return;

    // Check for newly approved/rejected deposits
    depositRequests.forEach(req => {
      const prev = prevDepositsRef.current.find(p => p.id === req.id);
      if (prev && prev.status === 'Pending' && req.status !== 'Pending' && req.email.toLowerCase() === user.email.toLowerCase()) {
        const type = req.status === 'Approved' ? 'success' : 'error';
        const isComm = req.gateway.toLowerCase().includes('commission') || req.details?.toLowerCase().includes('commission');
        const msg = req.status === 'Approved' 
          ? `🎉 Your ${isComm ? 'Commission ' : ''}Deposit of $${req.amount} has been Approved!`
          : `❌ Your ${isComm ? 'Commission ' : ''}Deposit of $${req.amount} was Rejected.`;
        
        const newNotif = { id: Date.now().toString() + Math.random(), message: msg, type };
        setNotifications(prev => [...prev, newNotif]);
        
        // Auto-remove notification after 8 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 8000);
      }
    });

    // Check for newly approved/rejected withdrawals
    withdrawalRequests.forEach(req => {
      const prev = prevWithdrawalsRef.current.find(p => p.id === req.id);
      if (prev && prev.status === 'Pending' && req.status !== 'Pending' && req.email.toLowerCase() === user.email.toLowerCase()) {
        const type = req.status === 'Approved' ? 'success' : 'error';
        const msg = req.status === 'Approved' 
          ? `🎉 Your Withdrawal of $${req.amount} has been Approved and transferred to your bank!`
          : `❌ Your Withdrawal of $${req.amount} was Rejected and funds have been returned to your balance.`;
        
        const newNotif = { id: Date.now().toString() + Math.random(), message: msg, type };
        setNotifications(prev => [...prev, newNotif]);
        
        // Auto-remove notification after 8 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 8000);
      }
    });

    prevDepositsRef.current = depositRequests;
    prevWithdrawalsRef.current = withdrawalRequests;
  }, [depositRequests, withdrawalRequests, user]);

  useEffect(() => {
    if (!user) return;
    const paymentStatus = searchParams.get('payment');
    const paymentAmountStr = searchParams.get('amount');
    const paymentOrderId = searchParams.get('order_id') || 'auto-' + Date.now();
    const transactionId = searchParams.get('transaction_id') || searchParams.get('txID') || searchParams.get('trx_id');

    const runVerificationAndDeposit = async () => {
      if (paymentStatus === 'success' && paymentAmountStr) {
        const amount = parseFloat(paymentAmountStr);
        if (isNaN(amount) || amount <= 0) return;

        let isVerified = true;
        let finalDetails = `Automatic Payment approved. Order ID: ${paymentOrderId}`;

        if (transactionId) {
          try {
            console.log("Verifying Dokan Pay transaction:", transactionId);
            const res = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionId })
            });
            const data = await res.json();
            
            if (data.status === "1" || data.message === "success" || data.status === 1 || data.success) {
              isVerified = true;
              finalDetails = `Dokan Pay Verified. TxID: ${transactionId}. Order ID: ${paymentOrderId}`;
              console.log("Transaction successfully verified!", data);
            } else {
              isVerified = false;
              console.warn("Dokan Pay verification failed:", data);
              alert(`⚠️ Dokan Pay verification failed for TxID ${transactionId}: ${data.message || 'Invalid transaction'}`);
            }
          } catch (err) {
            console.error("Failed to verify transaction securely:", err);
            isVerified = true; 
          }
        }

        if (isVerified) {
          addApprovedDeposit({
            email: user.email,
            amount,
            gateway: 'Dokan Pay',
            details: finalDetails,
            phone: user.phone || 'N/A'
          });

          const successMsg = `⚡ Dokan Pay payment successful! Added $${amount} to your account automatically!`;
          const newNotif = { id: Date.now().toString(), message: successMsg, type: 'success' as const };
          setNotifications(prev => [...prev, newNotif]);
          
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
          }, 12000);
        }
        
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('payment');
        newParams.delete('amount');
        newParams.delete('order_id');
        newParams.delete('transaction_id');
        newParams.delete('txID');
        newParams.delete('trx_id');
        setSearchParams(newParams);
      } else if (paymentStatus === 'cancel') {
        const cancelMsg = `❌ Dokan Pay payment cancelled or failed. Please try again.`;
        const newNotif = { id: Date.now().toString(), message: cancelMsg, type: 'error' as const };
        setNotifications(prev => [...prev, newNotif]);
        
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== newNotif.id));
        }, 8000);

        const newParams = new URLSearchParams(searchParams);
        newParams.delete('payment');
        setSearchParams(newParams);
      }
    };

    runVerificationAndDeposit();
  }, [searchParams, user, addApprovedDeposit, setSearchParams]);

  // Active tabs state
  const [activeTab, setActiveTab] = useState<string>(() => searchParams.get('tab') || 'Personal Details');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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

  // Manual payment gateway states
  const [depositGatewayName, setDepositGatewayName] = useState<string>('bKash');
  const [depositPhoneOrAccount, setDepositPhoneOrAccount] = useState('');
  const [depositTrxId, setDepositTrxId] = useState('');

  const [withdrawGatewayName, setWithdrawGatewayName] = useState<string>('bKash');
  const [withdrawPhoneOrAccount, setWithdrawPhoneOrAccount] = useState('');
  const [withdrawAmountInput, setWithdrawAmountInput] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawBankName, setWithdrawBankName] = useState('');
  const [withdrawBranch, setWithdrawBranch] = useState('');

  const [commissionGatewayName, setCommissionGatewayName] = useState<string>('bKash');
  const [commissionPhoneOrAccount, setCommissionPhoneOrAccount] = useState('');
  const [commissionTrxId, setCommissionTrxId] = useState('');

  // Legacy variables kept or adapted to prevent compilation errors
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<'manual_gateway' | 'card' | 'agent' | 'crypto'>('manual_gateway');
  const [cryptoSubMethod, setCryptoSubMethod] = useState<'automatic' | 'manual'>('automatic');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const [selectedCommissionMethod, setSelectedCommissionMethod] = useState<'manual_gateway' | 'card' | 'agent'>('manual_gateway');
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<'crypto_usdt' | 'crypto_ltc' | 'crypto_usd' | 'bank'>('crypto_usdt');
  const [isProcessingDokan, setIsProcessingDokan] = useState(false);
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
  const [agentDepositReference, setAgentDepositReference] = useState('');
  const [agentDepositChannel, setAgentDepositChannel] = useState<string>('WhatsApp');
  const [agentCommissionReference, setAgentCommissionReference] = useState('');
  const [agentCommissionChannel, setAgentCommissionChannel] = useState<string>('WhatsApp');
  const [agentWithdrawReference, setAgentWithdrawReference] = useState('');
  const [agentWithdrawChannel, setAgentWithdrawChannel] = useState<string>('WhatsApp');

  // Checkboxes for double confirmation and fake prevention
  const [declareDeposit, setDeclareDeposit] = useState(false);
  const [declareWithdraw, setDeclareWithdraw] = useState(false);
  const [declareCommission, setDeclareCommission] = useState(false);

  // Helper functions for validating fake deposits / withdrawals
  const isFakeTrxId = (trx: string): boolean => {
    const cleaned = trx.trim().toLowerCase();
    if (cleaned.length < 8) return true;
    
    // Check for single character repeating (e.g., "11111111", "aaaaaaaa")
    if (/^(.)\1+$/.test(cleaned)) return true;
    
    // Check for continuous numbers/sequences (e.g., "12345678", "abcdefgh")
    const numSeq = "01234567890123456789";
    const alphaSeq = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
    if (numSeq.includes(cleaned) || alphaSeq.includes(cleaned)) return true;
    
    // Check for descending continuous numbers/sequences
    const revNumSeq = "98765432109876543210";
    const revAlphaSeq = "zyxwvutsrqponmlkjihgfedcbazyxwvutsrqponmlkjihgfedcba";
    if (revNumSeq.includes(cleaned) || revAlphaSeq.includes(cleaned)) return true;

    return false;
  };

  const isValidBDPhone = (phone: string): boolean => {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length === 11 && digits.startsWith('01')) {
      return /^01[3-9]\d{8}$/.test(digits);
    }
    if (digits.length === 13 && digits.startsWith('8801')) {
      return /^8801[3-9]\d{8}$/.test(digits);
    }
    return false;
  };

  const isMFSGateway = (name: string): boolean => {
    const n = name.toLowerCase();
    return n.includes('bkash') || n.includes('nagad') || n.includes('rocket') || n.includes('upay');
  };

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
    { label: 'Refer & Earn', icon: Sparkles },
  ];

  if (!isLoggedIn) {
    return <Login />;
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
        gateway: 'Credit/Debit Card',
        transactionId: 'CARD-DEP-' + Math.floor(100000 + Math.random() * 900000),
        details: `Card ending in ${cardNumber.slice(-4) || '4312'}`
      });
    }
    alert(`🎉 Deposit request for $${amt.toFixed(2)} submitted successfully! It will be credited once approved by an Admin.`);
    setCardNumber('');
    setCvv('');
    setExpiry('');
    setActiveTab('Transactions');
  };

  const handleCommissionDepositSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    const amt = parseFloat(commissionDepositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid commission deposit amount.");
      return;
    }
    if (addDepositRequest) {
      addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: 'Credit/Debit Card (Commission)',
        transactionId: 'CARD-COM-' + Math.floor(100000 + Math.random() * 900000),
        details: `Commission paid via Card ending in ${cardNumber.slice(-4) || '4312'}`
      });
    }
    alert(`🎉 Commission Deposit request for $${amt.toFixed(2)} submitted successfully! It will be added to your Commission Balance once approved by an Admin.`);
    setCardNumber('');
    setCvv('');
    setExpiry('');
    setActiveTab('Transactions');
  };

  const handleAgentDepositSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid deposit amount.");
      return;
    }
    if (!declareDeposit) {
      alert(language === 'en'
        ? "⚠️ Please confirm the declaration checkbox stating you have contacted the local agent and completed the payment."
        : "⚠️ অনুগ্রহ করে ডিক্লেয়ারেশন বক্সে টিক মার্ক দিয়ে নিশ্চিত করুন যে আপনি এজেন্টের সাথে কথা বলে টাকা পাঠিয়েছেন।");
      return;
    }
    if (!agentDepositReference || agentDepositReference.trim().length < 4) {
      alert(language === 'en'
        ? "❌ Please enter a valid Sender Phone / IMO ID / Username. This is required so our agents can match your payment."
        : "❌ অনুগ্রহ করে আপনার ইমো আইডি, টেলিগ্রাম ইউজারনেম বা সঠিক মোবাইল নাম্বারটি লিখুন যেন এজেন্ট মিলিয়ে দেখতে পারেন।");
      return;
    }

    if (addDepositRequest) {
      addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: `Agent (${agentDepositChannel})`,
        transactionId: agentDepositReference.trim()
      });
    }
    alert(`🎉 Success! Agent Deposit request for $${amt.toFixed(2)} via ${agentDepositChannel} has been submitted to Admin.`);
    setAgentDepositReference('');
    setDeclareDeposit(false);
    setActiveTab('Transactions');
  };

  const handleCreateCryptoInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid deposit amount.");
      return;
    }

    if (amt < 2) {
      alert("Minimum deposit amount for crypto payments is $2.00");
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const response = await fetch("/api/nowpayments/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amt,
          email: user.email
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create payment invoice.");
      }

      if (data.invoice_url) {
        alert(language === 'en' 
          ? "Redirecting you to NOWPayments secure crypto payment portal..." 
          : "আপনাকে NOWPayments-এর নিরাপদ ক্রিপ্টো পেমেন্ট পেজে নিয়ে যাওয়া হচ্ছে...");
        window.location.href = data.invoice_url;
      } else {
        alert("Unexpected response from server: Payment invoice URL missing.");
      }
    } catch (err: any) {
      console.error("Error creating payment link:", err);
      alert(`❌ Error: ${err.message || "Failed to generate crypto payment link. Please try again."}`);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleManualDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid deposit amount.");
      return;
    }

    if (!declareDeposit) {
      alert(language === 'en'
        ? "⚠️ Please confirm the declaration checkbox at the bottom stating you have completed this transaction."
        : "⚠️ অনুগ্রহ করে নিচে দেওয়া পেমেন্ট কনফার্মেশন ডিক্লেয়ারেশন বক্সে টিক মার্ক দিন।");
      return;
    }

    const gatewayName = depositGatewayName;
    const matched = (siteConfig.paymentGateways || []).find(g => 
      g.enabled && g.name === gatewayName
    );

    const minAmt = matched ? matched.minAmount : 10;
    if (amt < minAmt) {
      alert(`Minimum deposit amount for ${gatewayName} is $${minAmt.toFixed(2)}`);
      return;
    }

    if (!depositPhoneOrAccount) {
      alert("Please enter your Phone or Account Number.");
      return;
    }
    if (!depositTrxId) {
      alert("Please enter your Transaction ID (TrxID).");
      return;
    }

    // Bangladesh MFS validation
    if (isMFSGateway(gatewayName) && !isValidBDPhone(depositPhoneOrAccount)) {
      alert(language === 'en'
        ? "❌ Invalid Mobile Number! For bKash/Nagad/Rocket/Upay, please enter a valid 11-digit Bangladeshi mobile number starting with 01."
        : "❌ ভুল মোবাইল নাম্বার! বিকাশ/নগদ/রকেট/উপায় এর জন্য দয়া করে সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নাম্বার (যেমন 017XXXXXXXX) প্রদান করুন।");
      return;
    }

    // Alphanumeric/Fake TrxID pattern check
    if (isFakeTrxId(depositTrxId)) {
      alert(language === 'en'
        ? "❌ Invalid or Fake Transaction ID format! Please enter the correct Transaction ID (TrxID) from your receipt. Continuous numbers or repeated characters are blocked."
        : "❌ ট্রানজেকশন আইডি সঠিক নয়! দয়া করে আপনার পেমেন্ট রিসিট থেকে সঠিক Transaction ID (TrxID) প্রদান করুন। শুধু একই অক্ষর বা ক্রমানুসারে সংখ্যা দিলে রিকোয়েস্ট সাবমিট হবে না।");
      return;
    }

    if (addDepositRequest) {
      await addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: gatewayName,
        transactionId: depositTrxId.trim(),
        details: `Sender Number: ${depositPhoneOrAccount}`
      });
      alert(`🎉 Manual Deposit request of $${amt.toFixed(2)} via ${gatewayName} submitted successfully! It will be verified by our Admin team and added to your balance shortly.`);
      setDepositAmount('100');
      setDepositPhoneOrAccount('');
      setDepositTrxId('');
      setDeclareDeposit(false);
      setActiveTab('Transactions');
    }
  };

  const handleManualCommissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(commissionDepositAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid commission deposit amount.");
      return;
    }

    if (!declareCommission) {
      alert(language === 'en'
        ? "⚠️ Please confirm the declaration checkbox at the bottom stating you have completed this transaction."
        : "⚠️ অনুগ্রহ করে নিচে দেওয়া পেমেন্ট কনফার্মেশন ডিক্লেয়ারেশন বক্সে টিক মার্ক দিন।");
      return;
    }

    const gatewayName = commissionGatewayName;
    const matched = (siteConfig.paymentGateways || []).find(g => 
      g.enabled && g.name === gatewayName
    );

    const minAmt = matched ? matched.minAmount : 10;
    if (amt < minAmt) {
      alert(`Minimum commission deposit amount for ${gatewayName} is $${minAmt.toFixed(2)}`);
      return;
    }

    if (!commissionPhoneOrAccount) {
      alert("Please enter your Phone or Account Number.");
      return;
    }
    if (!commissionTrxId) {
      alert("Please enter your Transaction ID (TrxID).");
      return;
    }

    // Bangladesh MFS validation
    if (isMFSGateway(gatewayName) && !isValidBDPhone(commissionPhoneOrAccount)) {
      alert(language === 'en'
        ? "❌ Invalid Mobile Number! For bKash/Nagad/Rocket/Upay, please enter a valid 11-digit Bangladeshi mobile number starting with 01."
        : "❌ ভুল মোবাইল নাম্বার! বিকাশ/নগদ/রকেট/উপায় এর জন্য দয়া করে সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নাম্বার (যেমন 017XXXXXXXX) প্রদান করুন।");
      return;
    }

    // Alphanumeric/Fake TrxID pattern check
    if (isFakeTrxId(commissionTrxId)) {
      alert(language === 'en'
        ? "❌ Invalid or Fake Transaction ID format! Please enter the correct Transaction ID (TrxID) from your receipt. Continuous numbers or repeated characters are blocked."
        : "❌ ট্রানজেকশন আইডি সঠিক নয়! দয়া করে আপনার পেমেন্ট রিসিট থেকে সঠিক Transaction ID (TrxID) প্রদান করুন। শুধু একই অক্ষর বা ক্রমানুসারে সংখ্যা দিলে রিকোয়েস্ট সাবমিট হবে না।");
      return;
    }

    if (addDepositRequest) {
      await addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: `${gatewayName} (Commission)`,
        transactionId: commissionTrxId.trim(),
        details: `Sender Number: ${commissionPhoneOrAccount}. Commission Deposit.`
      });
      alert(`🎉 Commission Deposit request of $${amt.toFixed(2)} via ${gatewayName} submitted successfully! It will be verified by our Admin team and credited to your Commission Balance once approved.`);
      setCommissionDepositAmount('100');
      setCommissionPhoneOrAccount('');
      setCommissionTrxId('');
      setDeclareCommission(false);
      setActiveTab('Transactions');
    }
  };

  const handleManualWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(withdrawAmountInput);
    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid withdrawal amount.");
      return;
    }

    if (!declareWithdraw) {
      alert(language === 'en'
        ? "⚠️ Please confirm the declaration checkbox at the bottom stating you authorize this withdrawal and understand fake requests lead to account suspension."
        : "⚠️ অনুগ্রহ করে নিচে দেওয়া ডিক্লেয়ারেশন বক্সে টিক মার্ক দিয়ে নিশ্চিত করুন যে আপনি উইথড্র রিকোয়েস্ট পাঠাতে চান।");
      return;
    }

    const gatewayName = withdrawGatewayName;
    const matched = (siteConfig.paymentGateways || []).find(g => 
      g.enabled && g.name === gatewayName
    );

    const minWd = matched ? matched.minAmount : (siteConfig.minWithdrawalAmount ?? 10);
    if (amt < minWd) {
      alert(`Minimum withdrawal amount for ${gatewayName} is $${minWd.toFixed(2)}`);
      return;
    }

    const currentBal = user.balance || 0;
    if (currentBal < amt) {
      alert("Insufficient wallet balance for this withdrawal.");
      return;
    }

    const govFeePct = siteConfig.governmentFeePct ?? 10;
    const commissionNeeded = amt * (govFeePct / 100);
    const currentComm = user.commissionBalance || 0;
    if (currentComm < commissionNeeded) {
      alert(`⚠️ Insufficient Commission Balance! You need $${commissionNeeded.toFixed(2)} (${govFeePct}% of $${amt.toFixed(2)}) in your Commission Balance to authorize this withdrawal. Currently you have $${currentComm.toFixed(2)}.`);
      return;
    }

    if (!withdrawPhoneOrAccount) {
      alert("Please enter your Recipient Phone or Account Number.");
      return;
    }

    // Bangladesh MFS Recipient validation
    if (isMFSGateway(gatewayName) && !isValidBDPhone(withdrawPhoneOrAccount)) {
      alert(language === 'en'
        ? "❌ Invalid Recipient Number! For bKash/Nagad/Rocket/Upay, please enter a valid 11-digit Bangladeshi mobile number starting with 01."
        : "❌ ভুল নাম্বার! বিকাশ/নগদ/রকেট/উপায় উইথড্র এর জন্য দয়া করে সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নাম্বার প্রদান করুন।");
      return;
    }

    const nextBalance = parseFloat((currentBal - amt).toFixed(2));
    const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
    await updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

    if (addWithdrawalRequest) {
      await addWithdrawalRequest({
        email: user.email,
        amount: amt,
        bankName: gatewayName === 'Bank' ? `Bank (${withdrawBankName}, Branch: ${withdrawBranch})` : gatewayName,
        iban: withdrawPhoneOrAccount.trim(),
        accountName: withdrawAccountName || user.name,
        commissionDeducted: commissionNeeded
      });
    }

    alert(`🎉 Manual Withdrawal request of $${amt.toFixed(2)} via ${gatewayName} submitted successfully! ${govFeePct}% commission ($${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
    setWithdrawAmountInput('');
    setWithdrawPhoneOrAccount('');
    setWithdrawAccountName('');
    setWithdrawBankName('');
    setWithdrawBranch('');
    setDeclareWithdraw(false);
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
    if (addDepositRequest) {
      addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: `Agent (${agentCommissionChannel}) Commission`,
        transactionId: agentCommissionReference || 'AGENT-COM-' + Math.floor(100000 + Math.random() * 900000),
        details: 'Commission paid via Authorized Local Agent'
      });
    }
    alert(`🎉 Success! Agent Commission Payment request for $${amt.toFixed(2)} submitted. It will be added to your Commission Balance once approved by an Admin.`);
    setAgentCommissionReference('');
    setActiveTab('Transactions');
  };

  const handleAgentWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(bankWithdrawAmount);
    
    const govFeePct = siteConfig.governmentFeePct ?? 10;
    const minWd = siteConfig.minWithdrawalAmount ?? 10;
    const maxWd = siteConfig.maxWithdrawalAmount ?? 100000000;

    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid withdrawal amount.");
      return;
    }

    if (!declareWithdraw) {
      alert(language === 'en'
        ? "⚠️ Please confirm the declaration checkbox at the bottom stating you authorize this withdrawal."
        : "⚠️ অনুগ্রহ করে নিচে দেওয়া ডিক্লেয়ারেশন বক্সে টিক মার্ক দিয়ে নিশ্চিত করুন যে আপনি উইথড্র রিকোয়েস্ট পাঠাতে চান।");
      return;
    }

    if (!agentWithdrawReference || agentWithdrawReference.trim().length < 4) {
      alert(language === 'en'
        ? "❌ Please enter a valid Agent Contact ID or Recipient Mobile Number."
        : "❌ অনুগ্রহ করে এজেন্টের কন্টাক্ট আইডি বা রিসিভার মোবাইল নাম্বার লিখুন।");
      return;
    }

    // Bangladesh MFS validation
    if (isMFSGateway(agentWithdrawChannel) && !isValidBDPhone(agentWithdrawReference)) {
      alert(language === 'en'
        ? "❌ Invalid Recipient Number! For bKash/Nagad/Rocket/Upay, please enter a valid 11-digit Bangladeshi mobile number starting with 01."
        : "❌ ভুল নাম্বার! বিকাশ/নগদ/রকেট/উপায় উইথড্র এর জন্য দয়া করে সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নাম্বার প্রদান করুন।");
      return;
    }

    if (amt < minWd) {
      alert(`Minimum withdrawal amount is $${minWd.toFixed(2)}`);
      return;
    }
    if (amt > maxWd) {
      alert(`Maximum withdrawal amount is $${maxWd.toFixed(2)}`);
      return;
    }
    if (user.balance < amt) {
      alert("Insufficient wallet balance for this withdrawal.");
      return;
    }
    
    const commissionNeeded = amt * (govFeePct / 100);
    const currentComm = user.commissionBalance || 0;
    
    if (currentComm < commissionNeeded) {
      alert(`⚠️ Insufficient Commission Balance! You need $${commissionNeeded.toFixed(2)} (${govFeePct}% of $${amt.toFixed(2)}) in your Commission Balance to authorize this withdrawal. Currently you have $${currentComm.toFixed(2)}.`);
      return;
    }

    const nextBalance = user.balance - amt;
    const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
    updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

    if (addWithdrawalRequest) {
      addWithdrawalRequest({
        email: user.email,
        amount: amt,
        bankName: `Agent (${agentWithdrawChannel})`,
        iban: agentWithdrawReference.trim(),
        accountName: user.name,
        commissionDeducted: commissionNeeded
      });
    }

    alert(`🎉 Agent Withdrawal request for $${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission ($${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
    setBankWithdrawAmount('');
    setAgentWithdrawReference('');
    setDeclareWithdraw(false);
    setActiveTab('Transactions');
  };

  const handleBankWithdrawSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = parseFloat(bankWithdrawAmount);
    
    const govFeePct = siteConfig.governmentFeePct ?? 10;
    const minWd = siteConfig.minWithdrawalAmount ?? 10;
    const maxWd = siteConfig.maxWithdrawalAmount ?? 100000000;

    if (isNaN(amt) || amt <= 0) {
      alert("Please specify a valid withdrawal amount.");
      return;
    }

    if (!declareWithdraw) {
      alert(language === 'en'
        ? "⚠️ Please confirm the declaration checkbox at the bottom stating you authorize this withdrawal."
        : "⚠️ অনুগ্রহ করে নিচে দেওয়া ডিক্লেয়ারেশন বক্সে টিক মার্ক দিয়ে নিশ্চিত করুন যে আপনি উইথড্র রিকোয়েস্ট পাঠাতে চান।");
      return;
    }

    if (!bankWithdrawIban || bankWithdrawIban.trim().length < 4) {
      alert(language === 'en'
        ? "❌ Please enter a valid Bank Account Number / Wallet Number."
        : "❌ অনুগ্রহ করে সঠিক ব্যাংক অ্যাকাউন্ট বা মোবাইল ওয়ালেট নম্বর দিন।");
      return;
    }

    // Bangladesh MFS validation if MFS selected as Bank
    if (isMFSGateway(bankWithdrawName) && !isValidBDPhone(bankWithdrawIban)) {
      alert(language === 'en'
        ? "❌ Invalid Recipient Number! For bKash/Nagad/Rocket/Upay, please enter a valid 11-digit Bangladeshi mobile number starting with 01."
        : "❌ ভুল নাম্বার! বিকাশ/নগদ/রকেট/উপায় উইথড্র এর জন্য দয়া করে সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নাম্বার প্রদান করুন।");
      return;
    }
    
    if (amt < minWd) {
      alert(`Minimum withdrawal amount is $${minWd.toFixed(2)}`);
      return;
    }
    
    if (amt > maxWd) {
      alert(`Maximum withdrawal amount is $${maxWd.toFixed(2)}`);
      return;
    }

    if (user.balance < amt) {
      alert("Insufficient wallet balance for this withdrawal.");
      return;
    }

    const commissionNeeded = amt * (govFeePct / 100);
    const currentCommission = user.commissionBalance || 0;

    if (currentCommission < commissionNeeded) {
      alert(`Insufficient Commission Balance.\n\nGovernment regulations require a ${govFeePct}% commission ($${commissionNeeded.toFixed(2)}) to be paid beforehand. Please deposit the required commission amount to proceed.`);
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
        bankName: `${bankWithdrawName} (Branch: ${bankWithdrawBranch || 'Main'})`,
        iban: bankWithdrawIban.trim(),
        accountName: user.name,
        commissionDeducted: commissionNeeded
      });
    }

    alert(`🎉 Withdrawal request for $${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission ($${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
    setBankWithdrawAmount('');
    setBankWithdrawName('');
    setBankWithdrawIban('');
    setBankWithdrawBranch('');
    setDeclareWithdraw(false);
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
      case 'Refer & Earn': return 'রেফার ও ইনকাম';
      default: return label;
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 text-zinc-900 dark:text-zinc-100 font-sans relative">
      
      {/* Notifications Toast */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 rounded-xl shadow-lg border text-sm font-bold flex items-start gap-3 backdrop-blur-md animate-in slide-in-from-right-8 fade-in ${
                n.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'
              }`}
            >
              <div className="flex-1 leading-snug">{n.message}</div>
              <button 
                onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Container holding My Account with exact card layout */}
      <div className="bg-white dark:bg-zinc-950 border border-[#E5E5EB] dark:border-zinc-850 rounded-[32px] shadow-sm p-6 sm:p-10 select-none">
        
        {/* Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
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

        {/* User Gilded Profile Bar */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0f1d] border border-[#1a233d] p-5 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            {/* Custom Gilded Geometric overlapping brand emblem */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 via-[#E1BC4A] to-yellow-600 flex items-center justify-center shadow-lg border border-yellow-300/30 relative shrink-0">
              <span className="text-zinc-950 font-black text-lg tracking-tighter">G</span>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-[#0a0f1d] flex items-center justify-center" title="Online">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase tracking-wider">{user.username || user.email.split('@')[0]}</span>
                <span className="bg-yellow-500/10 text-yellow-400 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full border border-yellow-500/20">
                  👑 VIP Lvl 1
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Personal Info')}
                className="text-xs text-zinc-400 hover:text-[#E1BC4A] transition-colors font-bold uppercase tracking-wider flex items-center gap-1 mt-1 text-left"
              >
                {language === 'en' ? 'Manage Profile ›' : 'প্রোফাইল নিয়ন্ত্রণ ›'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start sm:self-center">
            <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
              {language === 'en' ? 'Verified Account' : 'যাচাইকৃত অ্যাকাউন্ট'} ✅
            </span>
          </div>
        </div>

        {/* Balances Panel */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Wallet (Styled exactly as the golden card in references) */}
          <div className="md:col-span-8 bg-gradient-to-r from-yellow-400 via-[#E1BC4A] to-yellow-500 rounded-[28px] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-yellow-300/20 text-zinc-950 min-h-[180px]">
            {/* Glossy decorative overlays */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-[40px] pointer-events-none"></div>
            <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 bg-black/5 rounded-full blur-[30px] pointer-events-none"></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-900/80">
                  <span>{language === 'en' ? 'MAIN WALLET' : 'মূল ওয়ালেট'}</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      alert(language === 'en' ? "Wallet balance refreshed successfully!" : "ওয়ালেট ব্যালেন্স সফলভাবে রিফ্রেশ করা হয়েছে!");
                    }}
                    className="hover:scale-110 active:scale-95 transition-all text-zinc-900/60 hover:text-zinc-900"
                    title="Refresh Balance"
                  >
                    <svg className="w-3.5 h-3.5 animate-spin-hover" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                    </svg>
                  </button>
                </div>
                
                {/* Single Currency High contrast bold Display (USDT Only) */}
                <div className="space-y-0.5">
                  <div className="text-4xl sm:text-5xl font-black font-sans leading-none tracking-tight flex items-baseline">
                    <span className="text-2xl sm:text-3xl font-extrabold mr-1.5">USDT</span>
                    {(user.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs font-black tracking-wider text-zinc-900/70">
                    {language === 'en' ? 'Available Wallet Balance' : 'ওয়ালেট ব্যালেন্স'}
                  </div>
                </div>
              </div>
              
              {/* Wallet Bag Circular Icon */}
              <div className="w-14 h-14 rounded-full bg-black/10 border border-white/20 flex items-center justify-center shadow-inner">
                <CreditCard className="w-7 h-7 text-zinc-950" />
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="flex items-center gap-3 mt-6 relative z-10 pt-2 border-t border-black/10">
              <button 
                type="button"
                onClick={() => setActiveTab('Add Credit')}
                className="bg-zinc-950 hover:bg-zinc-900 text-white font-black text-[11px] uppercase px-5 py-3.5 rounded-xl tracking-wider transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3] text-yellow-400" />
                {language === 'en' ? 'Deposit' : 'ডিপোজিট'}
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('Bank Withdraw')}
                className="bg-white/20 hover:bg-white/35 text-zinc-950 font-black text-[11px] uppercase px-5 py-3.5 rounded-xl tracking-wider transition-all flex items-center gap-2 border border-black/10 active:scale-95 cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
                {language === 'en' ? 'Withdrawal' : 'উত্তোলন'}
              </button>
            </div>
          </div>

          {/* Commission Balance card (Matching reference structure) */}
          <div className="md:col-span-4 bg-[#0a0f1d] border border-[#1a233d] rounded-[28px] p-8 flex flex-col justify-between shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-[40px] pointer-events-none"></div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-extrabold tracking-[0.2em] uppercase block">
                {language === 'en' ? 'COMMISSION WALLET' : 'কমিশন ওয়ালেট'}
              </span>
              <div className="space-y-0.5">
                <div className="text-3xl font-black font-sans leading-none text-[#E1BC4A]">
                  USDT {(user.commissionBalance || 0).toFixed(2)}
                </div>
                <div className="text-[11px] font-bold text-zinc-500">
                  {language === 'en' ? 'For Withdrawal Fees' : 'উইথড্র ফি এর জন্য'}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button 
                type="button"
                onClick={() => setActiveTab('Add Commission')}
                className="w-full bg-[#161d31] hover:bg-[#1f2945] text-[#E1BC4A] border border-[#2a3861] font-black text-[11px] uppercase py-3.5 rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                {language === 'en' ? 'Deposit Commission' : 'কমিশন জমা করুন'}
              </button>
            </div>
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
                      ? 'border-[#E1BC4A] bg-[#2C3B69] text-white shadow-sm'
                      : 'border-transparent text-zinc-600 dark:text-zinc-300 hover:text-[#E1BC4A] hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#E1BC4A]' : 'text-zinc-400'}`} />
                    <span>{getTabLabel(item.label, language)}</span>
                  </div>

                  {/* Badges indicators for active components */}
                  {item.label === 'My Tickets' && userTickets.length > 0 && (
                    <span className="bg-[#E1BC4A] text-white text-[9px] font-black tracking-normal px-2 py-0.5 rounded-full">
                      {userTickets.length}
                    </span>
                  )}
                  {item.label === 'Inbox' && (
                    <span className="bg-[#E1BC4A] text-white text-[9px] font-black tracking-normal px-2 py-0.5 rounded-full">
                      2
                    </span>
                  )}
                </button>
              );
            })}

            {/* Preferences Card inside My Account Sidebar */}
            <div className="mt-8 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-150 dark:border-zinc-800/80 space-y-4">
              <span className="text-[10px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase block">
                {language === 'en' ? 'App Settings' : 'অ্যাপ সেটিংস'}
              </span>
              
              {/* Theme Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                  {language === 'en' ? 'Dark Mode' : 'ডার্ক মোড'}
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative w-12 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full p-1 transition-colors duration-300 flex items-center justify-between cursor-pointer focus:outline-none shrink-0"
                  title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  <div 
                    className={`absolute w-4 h-4 bg-white dark:bg-zinc-950 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-2.5 h-2.5 text-indigo-400" />
                    ) : (
                      <Sun className="w-2.5 h-2.5 text-amber-500" />
                    )}
                  </div>
                  <Sun className={`w-2.5 h-2.5 text-amber-500 transition-opacity duration-300 ml-0.5 ${theme === 'dark' ? 'opacity-30' : 'opacity-100'}`} />
                  <Moon className={`w-2.5 h-2.5 text-indigo-400 transition-opacity duration-300 mr-0.5 ${theme === 'dark' ? 'opacity-100' : 'opacity-30'}`} />
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300">
                  {language === 'en' ? 'Language' : 'ভাষা'}
                </span>
                <div className="flex items-center border border-zinc-250 dark:border-zinc-700 rounded-lg p-0.5 bg-white dark:bg-zinc-900 font-sans text-[10px] font-black shrink-0">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                      language === 'en' 
                        ? 'bg-zinc-800 text-white dark:bg-zinc-700' 
                        : 'text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('bn')}
                    className={`px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                      language === 'bn' 
                        ? 'bg-[#E1BC4A] text-white' 
                        : 'text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    বাং
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: View Contents */}
          <div className="lg:col-span-9 min-h-[460px]">
            
            {/* TAB: Refer & Earn */}
            {activeTab === 'Refer & Earn' && (
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 rounded-[24px] shadow-sm text-zinc-900 dark:text-zinc-100 space-y-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[#E1BC4A]">
                    <Sparkles className="w-6 h-6 animate-pulse text-[#E1BC4A]" />
                    {language === 'en' ? 'Refer & Earn Rewards' : 'রেফার এবং ইনকাম পুরস্কার'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 uppercase font-bold tracking-wider">
                    {language === 'en' ? 'Invite friends and earn 10% real-time commission on every deposit they make!' : 'বন্ধুদের আমন্ত্রণ জানান এবং তাদের প্রতিটা ডিপোজিটের ওপর সাথে সাথে ১০% কমিশন পান!'}
                  </p>
                </div>

                {/* Referral Link & Code Copy Card */}
                <div className="bg-gray-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Code copy */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Your Referral Code</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-[#0f141f] border border-zinc-250 dark:border-zinc-800 px-4 py-3 rounded-xl font-mono font-black text-lg text-amber-500 text-center tracking-widest select-all">
                          {user.referralCode || 'NOT_FOUND'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(user.referralCode || '');
                            alert(language === 'en' ? 'Referral code copied!' : 'রেফারেল কোড কপি করা হয়েছে!');
                          }}
                          className="px-4 py-3.5 bg-[#2C3B69] hover:bg-[#E1BC4A] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          {language === 'en' ? 'Copy' : 'কপি'}
                        </button>
                      </div>
                    </div>

                    {/* URL copy */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Your Referral Invitation Link</label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-[#0f141f] border border-zinc-250 dark:border-zinc-800 px-4 py-3.5 rounded-xl font-mono text-xs text-zinc-500 dark:text-zinc-400 truncate select-all">
                          {`${window.location.origin}/register?ref=${user.referralCode || ''}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referralCode || ''}`);
                            alert(language === 'en' ? 'Referral link copied!' : 'রেফারেল লিংক কপি করা হয়েছে!');
                          }}
                          className="px-4 py-3.5 bg-[#2C3B69] hover:bg-[#E1BC4A] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                        >
                          {language === 'en' ? 'Link' : 'লিংক'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total Referred count */}
                  <div className="bg-[#111622] text-white p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Referred Friends</span>
                    <span className="text-3xl font-black font-sans text-amber-500 mt-2">{user.referralCount || 0} Players</span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Successfully registered</span>
                  </div>

                  {/* Earnings */}
                  <div className="bg-[#111622] text-white p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Referral Earnings</span>
                    <span className="text-3xl font-black font-sans text-[#E1BC4A] mt-2">USDT {(user.referralEarnings || 0).toFixed(2)}</span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase mt-1">Credited to commission balance</span>
                  </div>

                  {/* Promo Banner / Info */}
                  <div className="bg-yellow-500/10 dark:bg-yellow-500/5 text-zinc-900 dark:text-yellow-400/90 p-5 rounded-2xl border border-yellow-500/20 flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Commission Rate</span>
                    <span className="text-3xl font-black font-sans text-amber-500 mt-2">10% Deposit</span>
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase mt-1">Paid instantly on approval</span>
                  </div>
                </div>

                {/* Detailed Guide */}
                <div className="bg-zinc-50 dark:bg-zinc-950/40 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200">{language === 'en' ? 'How does it work?' : 'কিভাবে কাজ করে?'}</h4>
                  <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-2 list-decimal list-inside font-medium leading-relaxed">
                    <li>{language === 'en' ? 'Copy your unique link or invitation code.' : 'আপনার ইউনিক রেফারেল লিংক অথবা ইনভাইটেশন কোডটি কপি করুন।'}</li>
                    <li>{language === 'en' ? 'Share it with your friends via WhatsApp, Telegram, IMO or social media.' : 'এটি আপনার বন্ধুদের সাথে WhatsApp, Telegram, IMO বা সোশ্যাল মিডিয়ায় শেয়ার করুন।'}</li>
                    <li>{language === 'en' ? 'When they register using your code, they will be marked as referred by you. There is no instant reward on registration.' : 'তারা যখন আপনার কোড দিয়ে একাউন্ট খুলবে, তখন তারা আপনার সাথে যুক্ত হবে। রেজিস্ট্রেশনে কোনো তাৎক্ষণিক বোনাস নেই।'}</li>
                    <li>{language === 'en' ? 'Whenever they deposit money into their account, you will instantly receive 10% of their deposit amount credited to your Commission Balance!' : 'তারা যখনই তাদের একাউন্টে ডিপোজিট করবে, আপনি সাথে সাথে তাদের ডিপোজিটকৃত টাকার ১০% কমিশন আপনার কমিশন ব্যালেন্সে পেয়ে যাবেন!'}</li>
                  </ul>
                </div>
              </div>
            )}

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
                            <span className="text-xs font-black tracking-wide text-zinc-500 dark:text-zinc-400 block mb-1">GLOBAL</span>
                            <h4 className="text-base font-black text-zinc-900 dark:text-white">{item.name}</h4>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-tight">{item.desc}</p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">${item.price} <span className="text-[9px] text-zinc-400">/ Ticket</span></span>
                            <Link to={item.link} className="px-3 py-1.5 bg-[#2C3B69] hover:bg-[#E1BC4A] text-white text-[9px] font-black uppercase rounded-lg tracking-wider transition-all">
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
                        className="text-zinc-400 hover:text-[#E1BC4A] p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-zinc-200 shadow-sm"
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
                                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${editProfileImage === url ? 'border-[#E1BC4A] scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
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
                        <button type="submit" className="bg-[#E1BC4A] hover:bg-red-700 text-white font-black px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
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
                        <p className="text-white font-bold text-[13px]">{user.name}</p>
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
                        <p className="text-white font-bold text-[13px]">{user.country}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Date of Birth</span>
                        <p className="text-white font-bold text-[13px]">{user.dob}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Gender</span>
                        <p className="text-white font-bold text-[13px]">{gender}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Employer</span>
                        <p className="text-white font-bold text-[13px]">{employer}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Region</span>
                        <p className="text-white font-bold text-[13px]">{region}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">NID Card Number</span>
                        <p className="text-white font-bold text-[13px]">{user.nidNumber || 'Not set (Click edit to add)'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Passport Number</span>
                        <p className="text-white font-bold text-[13px]">{user.passportNumber || 'Not set (Click edit to add)'}</p>
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
                        className="text-zinc-400 hover:text-[#E1BC4A] p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-zinc-200 shadow-sm"
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
                        <button type="submit" className="bg-[#E1BC4A] hover:bg-red-700 text-white font-black px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
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
                        <p className="text-white font-bold text-[13px]">{user.email}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Phone Number</span>
                        <p className="text-white font-bold text-[13px]">{user.phone}</p>
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
                        className="text-zinc-400 hover:text-[#E1BC4A] p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-zinc-200 shadow-sm"
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
                        <button type="submit" className="bg-[#E1BC4A] hover:bg-red-700 text-white font-black px-5 py-3 rounded-xl text-[10px] uppercase tracking-wider">
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
                        <p className="text-white font-bold text-[13px]">{address1}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Address (Line 2)</span>
                        <p className="text-white font-bold text-[13px]">{address2 || ' '}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">City</span>
                        <p className="text-white font-bold text-[13px]">{city}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Country of Residence</span>
                        <p className="text-white font-bold text-[13px]">{user.country}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-0.5">Zip / Post Code</span>
                        <p className="text-white font-bold text-[13px]">{zipcode || ' '}</p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: Add Credit */}
            {activeTab === 'Add Credit' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
                  <h3 className="text-lg font-black text-zinc-950 dark:text-white uppercase tracking-widest mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#E1BC4A]" /> 
                    {language === 'en' ? 'Deposit Funds' : 'ডিপোজিট করুন'}
                  </h3>

                  {/* Method Selector Tabs */}
                  <div className="mb-6">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                      {language === 'en' ? 'Select Deposit Method' : 'ডিপোজিট পদ্ধতি সিলেক্ট করুন'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDepositMethod('manual_gateway')}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedDepositMethod === 'manual_gateway'
                            ? 'bg-[#E1BC4A] border-[#E1BC4A] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        🏦 {language === 'en' ? 'Manual Pay' : 'ম্যানুয়াল পে'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDepositMethod('agent')}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedDepositMethod === 'agent'
                            ? 'bg-[#E1BC4A] border-[#E1BC4A] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        👥 {language === 'en' ? 'Local Agent' : 'লোকাল এজেন্ট'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDepositMethod('crypto')}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedDepositMethod === 'crypto'
                            ? 'bg-[#E1BC4A] border-[#E1BC4A] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        🪙 {language === 'en' ? 'Crypto USDT' : 'ক্রিপ্টো USDT'}
                      </button>
                    </div>
                  </div>

                  {/* FORM CONTENT BASED ON SELECTED METHOD */}
                  {selectedDepositMethod === 'manual_gateway' && (
                    <form onSubmit={handleManualDepositSubmit} className="space-y-6">
                      {/* Amount Presets */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                          {language === 'en' ? 'Select Deposit Amount ($)' : 'ডিপোজিট পরিমাণ সিলেক্ট করুন ($)'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {['20', '50', '100', '250', '500'].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setDepositAmount(val)}
                              className={`py-3.5 text-center font-bold text-xs rounded-xl border transition-all ${
                                depositAmount === val
                                  ? 'bg-[#E1BC4A] border-[#E1BC4A] text-white shadow-md'
                                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                              }`}
                            >
                              ${val}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Amount */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                          {language === 'en' ? 'Or enter custom amount ($)' : 'অথবা কাস্টম পরিমাণ লিখুন ($)'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all"
                          required
                        />
                      </div>

                      {/* Selector Box for Dynamic Gateways */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                          {language === 'en' ? 'Select Payment Method' : 'পেমেন্ট মাধ্যম সিলেক্ট করুন'}
                        </label>
                        <select
                          value={depositGatewayName}
                          onChange={(e) => setDepositGatewayName(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all cursor-pointer"
                        >
                          {(siteConfig.paymentGateways || [])
                            .filter(g => g.enabled && (g.type === 'both' || g.type === 'deposit'))
                            .map(g => (
                              <option key={g.id} value={g.name}>{g.name}</option>
                            ))}
                        </select>
                      </div>

                      {/* Matching dynamic gateway details */}
                      {(() => {
                        const matched = (siteConfig.paymentGateways || []).find(g => 
                          g.enabled && g.name === depositGatewayName
                        );

                        if (!matched) {
                          return (
                            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
                              <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                                ⚠️ {depositGatewayName} {language === 'en' 
                                  ? 'gateway is currently not active in the system. Please configure it in Admin -> Gateways, or choose another active gateway.' 
                                  : 'গেটওয়েটি বর্তমানে সিস্টেমে সক্রিয় নেই। এডমিন প্যানেল থেকে সক্রিয় করুন অথবা অন্য একটি সচল গেটওয়ে নির্বাচন করুন।'}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="animate-fade-in space-y-5 bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                {language === 'en' ? 'Payment Details' : 'পেমেন্ট বিস্তারিত'}
                              </span>
                              <span className="bg-zinc-200/80 text-zinc-700 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-zinc-300">
                                Min Amount: ${matched.minAmount || 10}
                              </span>
                            </div>

                            <div className="bg-white border border-zinc-200/80 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">
                                {depositGatewayName === 'Bank' ? 'Bank Account Details:' : 'Send Money to Number:'}
                              </span>
                              <p className="font-mono text-base sm:text-lg font-black text-zinc-950 select-all break-all mb-2">
                                {matched.numberOrAddress}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(matched.numberOrAddress);
                                  alert("Copied to clipboard!");
                                }}
                                className="text-[9px] font-black tracking-widest uppercase bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg"
                              >
                                COPY / কপি করুন
                              </button>
                            </div>

                            <div className="text-xs text-zinc-600 font-medium italic bg-white border border-zinc-150 p-4 rounded-xl">
                              <p className="font-bold text-zinc-700 not-italic mb-1 uppercase tracking-wider text-[9px]">Instructions:</p>
                              "{matched.instructions}"
                            </div>

                            {/* Warning Banner */}
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl text-left space-y-1">
                              <p className="text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                ⚠️ Warning / সতর্কীকরণ
                              </p>
                              <p className="text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                                {language === 'en'
                                  ? 'Submitting false, inaccurate, or reused transaction information is strictly forbidden. Fake deposit requests are automatically flagged. Any attempt to exploit or upload fake transaction details will lead to immediate, irreversible account ban and confiscation of all assets.'
                                  : 'ভুয়া, অসত্য বা পূর্বে ব্যবহৃত পেমেন্ট তথ্য সাবমিট করা কঠোরভাবে নিষিদ্ধ। কৃত্রিম বা ভুয়া ডিপোজিট রিকোয়েস্ট স্বয়ংক্রিয়ভাবে ব্লক করা হবে। কোনো অ্যাকাউন্ট থেকে ভুয়া ট্রানজেকশন সাবমিট করার চেষ্টা করা হলে অ্যাকাউন্ট চিরতরে ব্যান করা হবে এবং ব্যালেন্স বাজেয়াপ্ত করা হবে।'}
                              </p>
                            </div>

                            {/* Inputs: User Phone, TrxID */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div>
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                                  {depositGatewayName === 'Bank' ? 'Your Bank Account Number / Name' : 'Your Sender Mobile Number'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={depositGatewayName === 'Bank' ? 'Account No' : 'e.g. 01712345678'}
                                  value={depositPhoneOrAccount}
                                  onChange={(e) => setDepositPhoneOrAccount(e.target.value)}
                                  className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                                  {language === 'en' ? 'Transaction ID / TrxID' : 'ট্রানজেকশন আইডি / TrxID'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. TRX8291039"
                                  value={depositTrxId}
                                  onChange={(e) => setDepositTrxId(e.target.value)}
                                  className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900 font-mono"
                                  required
                                />
                              </div>
                            </div>

                            {/* Declaration Checkbox */}
                            <div className="flex items-start gap-3 bg-white p-3.5 border border-zinc-250 rounded-xl">
                              <input
                                id="declareDepositManual"
                                type="checkbox"
                                checked={declareDeposit}
                                onChange={(e) => setDeclareDeposit(e.target.checked)}
                                className="mt-1 h-4.5 w-4.5 rounded border-zinc-350 text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                              />
                              <label htmlFor="declareDepositManual" className="text-[11px] text-zinc-600 font-bold select-none cursor-pointer leading-relaxed text-left">
                                {language === 'en'
                                  ? 'I declare under full personal liability that I have sent the correct amount from my own wallet/account and have specified the correct transaction info. I understand that submitting fake requests is fraud.'
                                  : 'আমি সম্পূর্ণ ব্যক্তিগত দায়িত্বে ঘোষণা করছি যে আমি আমার নিজের ওয়ালেট থেকে সঠিক পরিমাণ টাকা পাঠিয়েছি এবং সঠিক ট্রানজেকশন তথ্য প্রদান করেছি। আমি জানি যে ভুয়া রিকোয়েস্ট সাবমিট করা একটি প্রতারণা।'}
                              </label>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#E1BC4A] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                            >
                              {language === 'en' ? 'SUBMIT DEPOSIT FOR VERIFICATION' : 'ডিপোজিট রিকোয়েস্ট পাঠান'}
                            </button>
                          </div>
                        );
                      })()}
                    </form>
                  )}

                  {selectedDepositMethod === 'agent' && (
                    <form onSubmit={handleAgentDepositSubmit} className="space-y-6">
                      {/* Amount Input */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                          {language === 'en' ? 'Enter Deposit Amount ($)' : 'ডিপোজিট পরিমাণ লিখুন ($)'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all"
                          required
                        />
                      </div>

                      {/* Agent Channels */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                          {language === 'en' ? '1. Connect with Local Agent via App:' : '১. লোকাল এজেন্টের সাথে যোগাযোগ করুন:'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { name: 'WhatsApp', color: 'bg-emerald-600', icon: '💬' },
                            { name: 'IMO', color: 'bg-blue-600', icon: '📞' },
                            { name: 'Telegram', color: 'bg-sky-500', icon: '✈️' }
                          ].map((ch) => (
                            <button
                              key={ch.name}
                              type="button"
                              onClick={(e) => {
                                setAgentDepositChannel(ch.name);
                                handleAgentClick(ch.name as any, e);
                              }}
                              className={`py-3.5 text-center font-bold text-xs rounded-xl text-white ${ch.color} shadow-sm hover:opacity-90 active:scale-95 transition-all flex flex-col items-center justify-center gap-1`}
                            >
                              <span>{ch.icon}</span>
                              <span className="text-[10px]">{ch.name} Agent</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl space-y-4">
                        <p className="text-xs text-zinc-600 font-medium italic">
                          {language === 'en' 
                            ? 'Click any channel above to directly chat with our authorized local agent, obtain payment details, send your payment, then enter the Sender Contact or reference below to verify.' 
                            : 'ওপরের যেকোনো মাধ্যমে আমাদের অনুমোদিত লোকাল এজেন্টের সাথে চ্যাট করুন, পেমেন্ট নাম্বার নিয়ে টাকা পাঠান, এবং নিচে আপনার কন্টাক্ট আইডি বা রেফারেন্স লিখে সাবমিট করুন।'}
                        </p>

                        {/* Warning Banner */}
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl text-left space-y-1">
                          <p className="text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            ⚠️ Agent Rules / এজেন্টের নিয়মাবলী
                          </p>
                          <p className="text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                            {language === 'en'
                              ? 'Any fake, uncoordinated, or arbitrary request submitted without contacting and paying our agent first will result in immediate permanent block of your account. Ensure you connect with the agent and send the funds before submitting.'
                              : 'প্রথমে এজেন্টের সাথে যোগাযোগ ও পেমেন্ট না করে এখানে কোনো প্রকার ভুয়া বা আন্দাজে রিকোয়েস্ট সাবমিট করলে আপনার অ্যাকাউন্ট তাৎক্ষণিকভাবে চিরতরে ব্লক করা হবে। দয়া করে আগে টাকা পাঠান তারপর সঠিক রেফারেন্স এখানে লিখুন।'}
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                            {language === 'en' ? 'Connected Agent Channel' : 'কানেক্টেড এজেন্ট চ্যানেল'}
                          </label>
                          <select
                            value={agentDepositChannel}
                            onChange={(e) => setAgentDepositChannel(e.target.value)}
                            className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900"
                          >
                            <option value="WhatsApp">WhatsApp Agent</option>
                            <option value="IMO">IMO Agent</option>
                            <option value="Telegram">Telegram Agent</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                            {language === 'en' ? 'Sender Phone / IMO ID / Username' : 'প্রেরক ফোন নাম্বার / ইমো আইডি / ইউজারনেম'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. IMO-017XXXXXXXX or Telegram @username"
                            value={agentDepositReference}
                            onChange={(e) => setAgentDepositReference(e.target.value)}
                            className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 font-mono"
                            required
                          />
                        </div>
                      </div>

                      {/* Declaration Checkbox */}
                      <div className="flex items-start gap-3 bg-white p-3.5 border border-zinc-250 rounded-xl">
                        <input
                          id="declareDepositAgent"
                          type="checkbox"
                          checked={declareDeposit}
                          onChange={(e) => setDeclareDeposit(e.target.checked)}
                          className="mt-1 h-4.5 w-4.5 rounded border-zinc-350 text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <label htmlFor="declareDepositAgent" className="text-[11px] text-zinc-600 font-bold select-none cursor-pointer leading-relaxed text-left">
                          {language === 'en'
                            ? 'I declare that I have contacted the selected agent, completed the transaction, and sent the specified amount. I understand that submitting fake agent requests will permanently ban my account.'
                            : 'আমি ঘোষণা করছি যে আমি এজেন্টের সাথে যোগাযোগ করেছি, টাকা পাঠিয়েছি এবং সঠিক রেফারেন্সটি দিয়েছি। আমি জানি যে কোনো প্রকার মিথ্যা তথ্য দিলে আমার ওয়ালেট চিরতরে ব্যান করা হবে।'}
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        {language === 'en' ? 'SUBMIT AGENT DEPOSIT REQUEST' : 'এজেন্ট ডিপোজিট রিকোয়েস্ট পাঠান'}
                      </button>
                    </form>
                  )}

                  {selectedDepositMethod === 'crypto' && (
                    <div className="space-y-6">
                      {/* Sub Method Toggle (Automatic vs Manual) */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                          {language === 'en' ? 'Select Crypto Processing Mode' : 'ক্রিপ্টো প্রসেসিং মোড সিলেক্ট করুন'}
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
                          <button
                            type="button"
                            onClick={() => setCryptoSubMethod('automatic')}
                            className={`py-3 px-1 text-center font-bold text-xs rounded-xl transition-all uppercase tracking-wider ${
                              cryptoSubMethod === 'automatic'
                                ? 'bg-zinc-900 text-white shadow-sm font-black'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            ⚡ {language === 'en' ? 'Automatic Pay' : 'অটোমেটিক পে'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCryptoSubMethod('manual')}
                            className={`py-3 px-1 text-center font-bold text-xs rounded-xl transition-all uppercase tracking-wider ${
                              cryptoSubMethod === 'manual'
                                ? 'bg-zinc-900 text-white shadow-sm font-black'
                                : 'text-zinc-600 hover:text-zinc-900'
                            }`}
                          >
                            📝 {language === 'en' ? 'Manual Send' : 'ম্যানুয়াল সেন্ড'}
                          </button>
                        </div>
                      </div>

                      {cryptoSubMethod === 'automatic' ? (
                        <form onSubmit={handleCreateCryptoInvoice} className="space-y-6">
                          {/* Amount Input */}
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                              {language === 'en' ? 'Enter Crypto Deposit Amount ($)' : 'ক্রিপ্টো ডিপোজিট পরিমাণ লিখুন ($)'}
                            </label>
                            <input
                              type="number"
                              min="2"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all"
                              required
                            />
                          </div>

                          <div className="animate-fade-in space-y-5 bg-emerald-50/50 border border-emerald-200/60 p-6 rounded-2xl">
                            <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                              <span className="text-2xl">⚡</span>
                              <div>
                                <h4 className="font-extrabold text-xs text-zinc-950 uppercase tracking-widest">
                                  {language === 'en' ? 'Instant Automated Payment' : 'ইনস্ট্যান্ট অটোমেটিক পেমেন্ট'}
                                </h4>
                                <p className="text-[10px] text-zinc-500 font-medium">
                                  Powered by NOWPayments API Gateway
                                </p>
                              </div>
                            </div>

                            <p className="text-xs text-zinc-600 font-semibold leading-relaxed">
                              {language === 'en' 
                                ? "Pay instantly using BTC, USDT, ETH, TRX, LTC, or other supported cryptocurrencies. Once the network confirms your payment, your wallet balance is instantly credited to your account — no manual audit or waiting required!" 
                                : "BTC, USDT, ETH, TRX, LTC বা অন্যান্য ক্রিপ্টো কারেন্সি দিয়ে ইনস্ট্যান্ট পেমেন্ট করুন। পেমেন্ট কনফার্ম হওয়ার সাথে সাথে আপনার অ্যাকাউন্টে অটোমেটিক ব্যালেন্স যোগ হবে — কোনো ম্যানুয়াল রিভিউ বা অপেক্ষা করার প্রয়োজন নেই!"}
                            </p>

                            <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                              🛡️ {language === 'en' ? 'Zero-fee secure blockchain checkout' : 'জিরো-ফি সুরক্ষিত ব্লকচেইন চেকআউট'}
                            </div>

                            <button
                              type="submit"
                              disabled={isCreatingInvoice}
                              className="w-full bg-[#E1BC4A] hover:bg-red-700 disabled:bg-red-400 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                            >
                              {isCreatingInvoice ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  {language === 'en' ? 'GENERATING PAYMENT LINK...' : 'পেমেন্ট লিংক তৈরি হচ্ছে...'}
                                </>
                              ) : (
                                <>
                                  🪙 {language === 'en' ? 'PAY WITH CRYPTO INSTANTLY' : 'ইনস্ট্যান্ট ক্রিপ্টো পেমেন্ট করুন'}
                                </>
                              )}
                            </button>

                            <div className="mt-6 pt-6 border-t border-emerald-200/40 space-y-4">
                              <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                                <div className="text-center">
                                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center justify-center gap-1.5">
                                    🎁 {language === 'en' ? 'Support Golobal Lottery' : 'গ্লোবাল লটারি প্রজেক্ট সাপোর্ট করুন'}
                                  </h4>
                                  <p className="text-[9px] text-zinc-500 font-semibold mt-1">
                                    {language === 'en' ? 'Choose your preferred instant secure checkout below:' : 'নিচের যেকোনো একটি নিরাপদ পেমেন্ট মেথড বেছে নিন:'}
                                  </p>
                                </div>

                                <div className="border border-zinc-100 rounded-xl overflow-hidden bg-zinc-50 p-1 flex justify-center shadow-inner">
                                  <iframe 
                                    src="https://nowpayments.io/embeds/donation-widget?api_key=46939299-dcc1-403d-9c4b-13c833682370&theme=light" 
                                    width="100%" 
                                    height="320" 
                                    frameBorder="0" 
                                    scrolling="no" 
                                    style={{ borderRadius: "10px", overflow: "hidden" }}
                                    title="NOWPayments Donation Widget"
                                  />
                                </div>

                                <div className="flex flex-col items-center justify-center gap-2 pt-1">
                                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">
                                    {language === 'en' ? 'Or use direct checkout page:' : 'অথবা সরাসরি পে করুন:'}
                                  </span>
                                  <a href="https://nowpayments.io/donation?api_key=46939299-dcc1-403d-9c4b-13c833682370" target="_blank" rel="noreferrer noopener" className="inline-block hover:scale-105 transition-all">
                                    <img src="https://nowpayments.io/images/embeds/donation-button-white.svg" alt="Cryptocurrency & Bitcoin donation button by NOWPayments" className="h-10" referrerPolicy="no-referrer" />
                                  </a>
                                </div>

                                <div className="pt-3 border-t border-zinc-100 flex flex-col items-center gap-2">
                                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">
                                    🔒 {language === 'en' ? 'Accepted Payment Methods' : 'স্বীকৃত পেমেন্ট পদ্ধতিসমূহ'}
                                  </span>
                                  <div className="flex flex-wrap justify-center gap-1.5">
                                    {['VISA', 'Mastercard', 'BTC', 'USDT', 'ETH', 'TRX', 'LTC'].map((method) => (
                                      <span key={method} className="text-[8px] font-black tracking-widest uppercase bg-zinc-100 text-zinc-700 px-2 py-1 rounded border border-zinc-200/60 shadow-xs">
                                        {method}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!user) return;
                            const amt = parseFloat(depositAmount);
                            if (isNaN(amt) || amt <= 0) {
                              alert("Please specify a valid deposit amount.");
                              return;
                            }
                            if (!depositTrxId) {
                              alert("Please enter USDT Transaction Hash (TxHash).");
                              return;
                            }
                            if (addDepositRequest) {
                              addDepositRequest({
                                email: user.email,
                                amount: amt,
                                gateway: 'USDT (TRC20)',
                                transactionId: depositTrxId,
                                details: `Sender Address: ${depositPhoneOrAccount || 'Not Specified'}`
                              });
                              alert(`🎉 Crypto Deposit request of $${amt.toFixed(2)} submitted successfully! It will be verified by our Admin team shortly.`);
                              setDepositAmount('100');
                              setDepositPhoneOrAccount('');
                              setDepositTrxId('');
                              setActiveTab('Transactions');
                            }
                          }}
                          className="space-y-6"
                        >
                          {/* Amount Input */}
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                              {language === 'en' ? 'Enter USDT Deposit Amount ($)' : 'USDT ডিপোজিট পরিমাণ লিখুন ($)'}
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all"
                              required
                            />
                          </div>

                          {/* Crypto details */}
                          <div className="animate-fade-in space-y-5 bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                            <div className="bg-white border border-zinc-200/80 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                              <span className="text-[9px] font-black text-[#E1BC4A] uppercase tracking-widest block mb-1">
                                USDT (TRC20) Wallet Address:
                              </span>
                              <p className="font-mono text-xs sm:text-sm font-black text-zinc-950 select-all break-all mb-2">
                                0x742d35Cc6634C0532925a3b844Bc454e4438f44e
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
                                  alert("USDT Address Copied!");
                                }}
                                className="text-[9px] font-black tracking-widest uppercase bg-zinc-900 hover:bg-zinc-800 text-white px-3 py-1.5 rounded-lg"
                              >
                                COPY ADDRESS / কপি করুন
                              </button>
                            </div>

                            <div className="text-xs text-zinc-600 font-medium italic bg-white border border-zinc-150 p-4 rounded-xl">
                              <p className="font-bold text-zinc-700 not-italic mb-1 uppercase tracking-wider text-[9px]">Instructions:</p>
                              "Send USDT (TRC20) to our secure address above. Enter your Sender Wallet Address and Transaction Hash (TxHash/TxID) below for instant audit & verification."
                            </div>

                            {/* Inputs: User Wallet, TxHash */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                                  {language === 'en' ? 'Your Sender Wallet Address' : 'আপনার প্রেরক ওয়ালেট অ্যাড্রেস'}
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. T9yD14NjX..."
                                  value={depositPhoneOrAccount}
                                  onChange={(e) => setDepositPhoneOrAccount(e.target.value)}
                                  className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 font-mono"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                                  {language === 'en' ? 'Transaction Hash (TxID) *' : 'ট্রানজেকশন হ্যাশ (TxID) *'} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. f8319a27b9c9d..."
                                  value={depositTrxId}
                                  onChange={(e) => setDepositTrxId(e.target.value)}
                                  className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 font-mono"
                                  required
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#E1BC4A] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                            >
                              {language === 'en' ? 'SUBMIT CRYPTO DEPOSIT FOR VERIFICATION' : 'ক্রিপ্টো ডিপোজিট রিকোয়েস্ট পাঠান'}
                            </button>

                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-2">
                              <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest">
                                🔒 {language === 'en' ? 'Accepted Payment Methods' : 'স্বীকৃত পেমেন্ট পদ্ধতিসমূহ'}
                              </span>
                              <div className="flex flex-wrap justify-center gap-1.5">
                                {['VISA', 'Mastercard', 'BTC', 'USDT', 'ETH', 'TRX', 'LTC'].map((method) => (
                                  <span key={method} className="text-[8px] font-black tracking-widest uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded border border-zinc-200/60 dark:border-zinc-700 shadow-xs">
                                    {method}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'Bank Withdraw' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
                  <h3 className="text-lg font-black text-zinc-950 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <span className="text-[#E1BC4A]">🏦</span> 
                    {language === 'en' ? 'Withdraw Funds' : 'উইথড্র করুন'}
                  </h3>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-4 rounded-2xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed mb-6">
                    <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-amber-950 dark:text-amber-100">
                      ⚠️ {language === 'en' ? 'Commission Fee Requirement' : 'কমিশন ফি নোটিশ'}
                    </p>
                    <p>
                      {language === 'en' 
                        ? `A ${siteConfig.governmentFeePct ?? 10}% government commission fee applies. This fee will be deducted from your Commission Balance (Available Commission Balance: USDT ${(user?.commissionBalance || 0).toFixed(2)}).`
                        : `আপনার উইথড্র পরিমাণের ওপর ${siteConfig.governmentFeePct ?? 10}% সরকারি কমিশন ফি প্রযোজ্য হবে। এই ফি-টি আপনার কমিশন ব্যালেন্স থেকে কাটা হবে (আপনার বর্তমান কমিশন ব্যালেন্স: USDT ${(user?.commissionBalance || 0).toFixed(2)})।`}
                    </p>
                  </div>

                  {/* Withdrawal Method Selection */}
                  <div className="mb-6">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                      {language === 'en' ? 'Select Withdrawal Channel' : 'উইথড্র পদ্ধতি সিলেক্ট করুন'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWithdrawMethod('crypto_usdt');
                          setWithdrawPhoneOrAccount('');
                        }}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'crypto_usdt'
                            ? 'bg-[#E1BC4A] border-[#E1BC4A] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        🪙 USDT (TRC20)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWithdrawMethod('crypto_ltc');
                          setWithdrawPhoneOrAccount('');
                        }}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'crypto_ltc'
                            ? 'bg-[#E1BC4A] border-[#E1BC4A] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        🪙 LTC (Litecoin)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWithdrawMethod('crypto_usd');
                          setWithdrawPhoneOrAccount('');
                        }}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'crypto_usd'
                            ? 'bg-[#E1BC4A] border-[#E1BC4A] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        🪙 USD (Payeer/PM)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWithdrawMethod('bank');
                          setWithdrawPhoneOrAccount('');
                        }}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'bank'
                            ? 'bg-[#E1BC4A] border-[#E1BC4A] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        🏦 {language === 'en' ? 'Bank Transfer' : 'ব্যাংক ট্রান্সফার'}
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Commission Calculator & Insufficient Balance Warning */}
                  {(() => {
                    const amt = parseFloat(withdrawAmountInput);
                    if (isNaN(amt) || amt <= 0) return null;

                    const govFeePct = siteConfig.governmentFeePct ?? 10;
                    const commissionNeeded = amt * (govFeePct / 100);
                    const currentComm = user?.commissionBalance || 0;
                    const isInsufficient = currentComm < commissionNeeded;
                    const deficit = parseFloat((commissionNeeded - currentComm).toFixed(2));

                    return (
                      <div className={`p-5 rounded-2xl border transition-all mb-6 ${
                        isInsufficient 
                          ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-950 dark:text-rose-100' 
                          : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-950 dark:text-emerald-100'
                      }`}>
                        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs mb-3 border-b pb-2 border-zinc-200/40">
                          <span>{isInsufficient ? '⚠️' : '✅'}</span>
                          <span>
                            {language === 'en' 
                              ? 'Withdrawal & Commission Summary' 
                              : 'উইথড্র এবং কমিশন সামারি'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-extrabold mb-1">
                              {language === 'en' ? 'Requested Withdrawal' : 'অনুরোধকৃত উইথড্র'}
                            </span>
                            <span className="text-sm font-black text-zinc-900 dark:text-white">
                              ${amt.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-extrabold mb-1">
                              {language === 'en' ? `Commission Fee (${govFeePct}%)` : `কমিশন ফি (${govFeePct}%)`}
                            </span>
                            <span className={`text-sm font-black ${isInsufficient ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              ${commissionNeeded.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[10px] uppercase tracking-wider font-extrabold mb-1">
                              {language === 'en' ? 'Your Commission Balance' : 'আপনার কমিশন ব্যালেন্স'}
                            </span>
                            <span className="text-sm font-black text-zinc-900 dark:text-white">
                              ${currentComm.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {isInsufficient ? (
                          <div className="mt-4 pt-3 border-t border-rose-200/50 text-xs space-y-2 leading-relaxed">
                            <p className="font-bold text-rose-700 dark:text-rose-300">
                              {language === 'en'
                                ? `⚠️ Insufficient Commission Balance! You need to add at least $${deficit.toFixed(2)} more to your Commission Balance to authorize this withdrawal.`
                                : `⚠️ কমিশন ব্যালেন্স অপর্যাপ্ত! এই উইথড্র সম্পন্ন করতে আপনার কমিশন ব্যালেন্স-এ আরও অন্তত $${deficit.toFixed(2)} অ্যাড বা রিচার্জ করতে হবে।`}
                            </p>
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setActiveTab('Add Commission')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl shadow-sm transition-all"
                              >
                                <span>🪙</span>
                                {language === 'en' ? 'Add Commission Balance Now' : 'কমিশন ব্যালেন্স অ্যাড করুন'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 pt-3 border-t border-emerald-200/50 text-xs leading-relaxed">
                            <p className="font-bold text-emerald-700 dark:text-emerald-400">
                              {language === 'en'
                                ? `✅ Perfect! You have enough Commission Balance. $${commissionNeeded.toFixed(2)} will be deducted upon submission.`
                                : `✅ চমৎকার! আপনার পর্যাপ্ত কমিশন ব্যালেন্স রয়েছে। উইথড্র করার পর আপনার কমিশন ব্যালেন্স থেকে $${commissionNeeded.toFixed(2)} কেটে নেওয়া হবে।`}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 1. USDT (TRC20) Form */}
                  {selectedWithdrawMethod === 'crypto_usdt' && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!user) return;
                        const amt = parseFloat(withdrawAmountInput);
                        if (isNaN(amt) || amt <= 0) {
                          alert("Please specify a valid withdrawal amount.");
                          return;
                        }
                        const minWd = siteConfig.minWithdrawalAmount ?? 10;
                        if (amt < minWd) {
                          alert(`Minimum withdrawal amount is $${minWd.toFixed(2)}`);
                          return;
                        }
                        if (user.balance < amt) {
                          alert("Insufficient wallet balance for this withdrawal.");
                          return;
                        }
                        
                        if (!declareWithdraw) {
                          alert(language === 'en'
                            ? "⚠️ Please confirm the declaration checkbox at the bottom stating you authorize this withdrawal and understand fake requests lead to account suspension."
                            : "⚠️ অনুগ্রহ করে নিচে দেওয়া ডিক্লেয়ারেশন বক্সে টিক মার্ক দিয়ে নিশ্চিত করুন যে আপনি উইথড্র রিকোয়েস্ট পাঠাতে চান।");
                          return;
                        }

                        const govFeePct = siteConfig.governmentFeePct ?? 10;
                        const commissionNeeded = amt * (govFeePct / 100);
                        const currentComm = user.commissionBalance || 0;
                        
                        if (currentComm < commissionNeeded) {
                          alert(`⚠️ Insufficient Commission Balance! You need USDT ${commissionNeeded.toFixed(2)} (${govFeePct}% of USDT ${amt.toFixed(2)}) in your Commission Balance to authorize this withdrawal. Currently you have USDT ${currentComm.toFixed(2)}.`);
                          return;
                        }

                        if (!withdrawPhoneOrAccount) {
                          alert("Please enter your Recipient USDT (TRC20) Wallet Address.");
                          return;
                        }

                        const nextBalance = parseFloat((user.balance - amt).toFixed(2));
                        const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
                        await updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

                        if (addWithdrawalRequest) {
                          await addWithdrawalRequest({
                            email: user.email,
                            amount: amt,
                            bankName: 'Crypto USDT (TRC20)',
                            iban: withdrawPhoneOrAccount,
                            accountName: user.name,
                            commissionDeducted: commissionNeeded
                          });
                        }

                        alert(`🎉 USDT Withdrawal request for USDT ${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission (USDT ${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
                        setWithdrawAmountInput('');
                        setWithdrawPhoneOrAccount('');
                        setDeclareWithdraw(false);
                        setActiveTab('Transactions');
                      }}
                      className="space-y-6 animate-fade-in"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                          {language === 'en' ? 'Enter Withdrawal Amount ($)' : 'উইথড্র পরিমাণ লিখুন ($)'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={withdrawAmountInput}
                          onChange={(e) => setWithdrawAmountInput(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 p-3.5 rounded-xl text-lg font-black outline-none focus:border-zinc-950 dark:focus:border-amber-500 focus:bg-white text-zinc-900 dark:text-white transition-all"
                          placeholder="0.00"
                          required
                        />
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                          {language === 'en' 
                            ? `Minimum withdrawal amount: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}` 
                            : `সর্বনিম্ন উইথড্র পরিমাণ: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}`}
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl space-y-2">
                          <p className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                            <span>ℹ️</span> {language === 'en' ? 'USDT WITHDRAWAL INSTRUCTIONS' : 'ইউএসডিটি উইথড্র নির্দেশনা'}
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-300">
                            {language === 'en'
                              ? "Withdrawals via USDT (TRC20) are processed securely within 1-2 hours. Please double check that you have pasted a valid TRC20 network address. Entering ERC20, BEP20, or other networks will result in permanent loss of funds."
                              : "USDT (TRC20) এর মাধ্যমে উইথড্র ১ থেকে ২ ঘণ্টার মধ্যে সফলভাবে প্রসেস করা হয়। দয়া করে নিশ্চিত হোন যে আপনি একটি সঠিক TRC20 ওয়ালেট অ্যাড্রেস দিয়েছেন। অন্য কোনো নেটওয়ার্ক (যেমন ERC20, BEP20) ব্যবহার করলে আপনার ডলার চিরতরে হারিয়ে যেতে পারে।"}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            {language === 'en'
                              ? `⚠️ Make sure your Commission Balance has at least $${(parseFloat(withdrawAmountInput || '0') * (siteConfig.governmentFeePct ?? 10) / 100).toFixed(2)} to complete this request.`
                              : `⚠️ নিশ্চিত করুন যে এই উইথড্র করার জন্য আপনার কমিশন ব্যালেন্স-এ অন্তত $${(parseFloat(withdrawAmountInput || '0') * (siteConfig.governmentFeePct ?? 10) / 100).toFixed(2)} রয়েছে।`}
                          </p>
                        </div>

                        {/* Warning Banner */}
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl text-left space-y-1">
                          <p className="text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            ⚠️ Warning / সতর্কীকরণ
                          </p>
                          <p className="text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                            {language === 'en'
                              ? 'Entering false, invalid, or third-party addresses is strictly prohibited. Your withdrawal destination MUST be owned by you. Submitting fake or coordinated withdrawal requests will result in absolute account ban and forfeiture of all assets.'
                              : 'ভুল, ভুল নেটওয়ার্কের (যেমন ERC20, BEP20) বা অন্যের অ্যাড্রেস দেওয়া কঠোরভাবে নিষিদ্ধ। উইথড্র অ্যাড্রেসটি অবশ্যই আপনার নিজের হতে হবে। কোনো ধরনের ভুয়া রিকোয়েস্ট সাবমিট করা হলে অ্যাকাউন্ট সাথে সাথে ব্যান করা হবে এবং ব্যালেন্স বাজেয়াপ্ত করা হবে।'}
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                            {language === 'en' ? 'Your Recipient USDT (TRC20) Wallet Address' : 'আপনার প্রাপক USDT (TRC20) ওয়ালেট অ্যাড্রেস'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. T9yD14NjX..."
                            value={withdrawPhoneOrAccount}
                            onChange={(e) => setWithdrawPhoneOrAccount(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 dark:text-white font-mono"
                            required
                          />
                        </div>
                      </div>

                      {/* Declaration Checkbox */}
                      <div className="flex items-start gap-3 bg-white p-3.5 border border-zinc-250 rounded-xl">
                        <input
                          id="declareWithdrawUSDT"
                          type="checkbox"
                          checked={declareWithdraw}
                          onChange={(e) => setDeclareWithdraw(e.target.checked)}
                          className="mt-1 h-4.5 w-4.5 rounded border-zinc-350 text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <label htmlFor="declareWithdrawUSDT" className="text-[11px] text-zinc-600 font-bold select-none cursor-pointer leading-relaxed text-left">
                          {language === 'en'
                            ? 'I declare under full personal liability that I am the sole owner of this withdrawal wallet. I understand that submitting fake requests is fraud and leads to immediate account termination.'
                            : 'আমি সম্পূর্ণ ব্যক্তিগত দায়িত্বে ঘোষণা করছি যে এই ওয়ালেট অ্যাড্রেসটির একমাত্র মালিক আমি নিজেই। আমি জানি যে ভুয়া রিকোয়েস্ট সাবমিট করা প্রতারণা এবং এর জন্য অ্যাকাউন্ট চিরতরে বাতিল করা হবে।'}
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#E1BC4A] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        {language === 'en' ? 'SUBMIT USDT WITHDRAWAL REQUEST' : 'USDT উইথড্র রিকোয়েস্ট পাঠান'}
                      </button>
                    </form>
                  )}

                  {/* 2. LTC (Litecoin) Form */}
                  {selectedWithdrawMethod === 'crypto_ltc' && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!user) return;
                        const amt = parseFloat(withdrawAmountInput);
                        if (isNaN(amt) || amt <= 0) {
                          alert("Please specify a valid withdrawal amount.");
                          return;
                        }
                        const minWd = siteConfig.minWithdrawalAmount ?? 10;
                        if (amt < minWd) {
                          alert(`Minimum withdrawal amount is $${minWd.toFixed(2)}`);
                          return;
                        }
                        if (user.balance < amt) {
                          alert("Insufficient wallet balance for this withdrawal.");
                          return;
                        }

                        if (!declareWithdraw) {
                          alert(language === 'en'
                            ? "⚠️ Please confirm the declaration checkbox at the bottom stating you authorize this withdrawal and understand fake requests lead to account suspension."
                            : "⚠️ অনুগ্রহ করে নিচে দেওয়া ডিক্লেয়ারেশন বক্সে টিক মার্ক দিয়ে নিশ্চিত করুন যে আপনি উইথড্র রিকোয়েস্ট পাঠাতে চান।");
                          return;
                        }
                        
                        const govFeePct = siteConfig.governmentFeePct ?? 10;
                        const commissionNeeded = amt * (govFeePct / 100);
                        const currentComm = user.commissionBalance || 0;
                        
                        if (currentComm < commissionNeeded) {
                          alert(`⚠️ Insufficient Commission Balance! You need USDT ${commissionNeeded.toFixed(2)} (${govFeePct}% of USDT ${amt.toFixed(2)}) in your Commission Balance to authorize this withdrawal. Currently you have USDT ${currentComm.toFixed(2)}.`);
                          return;
                        }

                        if (!withdrawPhoneOrAccount) {
                          alert("Please enter your Recipient Litecoin (LTC) Wallet Address.");
                          return;
                        }

                        const nextBalance = parseFloat((user.balance - amt).toFixed(2));
                        const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
                        await updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

                        if (addWithdrawalRequest) {
                          await addWithdrawalRequest({
                            email: user.email,
                            amount: amt,
                            bankName: 'Crypto LTC (Litecoin)',
                            iban: withdrawPhoneOrAccount,
                            accountName: user.name,
                            commissionDeducted: commissionNeeded
                          });
                        }

                        alert(`🎉 LTC Withdrawal request for LTC equivalent of $${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission (USDT ${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
                        setWithdrawAmountInput('');
                        setWithdrawPhoneOrAccount('');
                        setDeclareWithdraw(false);
                        setActiveTab('Transactions');
                      }}
                      className="space-y-6 animate-fade-in"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                          {language === 'en' ? 'Enter Withdrawal Amount ($)' : 'উইথড্র পরিমাণ লিখুন ($)'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={withdrawAmountInput}
                          onChange={(e) => setWithdrawAmountInput(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 p-3.5 rounded-xl text-lg font-black outline-none focus:border-zinc-950 dark:focus:border-amber-500 focus:bg-white text-zinc-900 dark:text-white transition-all"
                          placeholder="0.00"
                          required
                        />
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                          {language === 'en' 
                            ? `Minimum withdrawal amount: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}` 
                            : `সর্বনিম্ন উইথড্র পরিমাণ: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}`}
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl space-y-2">
                          <p className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                            <span>ℹ️</span> {language === 'en' ? 'LITECOIN WITHDRAWAL INSTRUCTIONS' : 'লাইটকয়েন উইথড্র নির্দেশনা'}
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-300">
                            {language === 'en'
                              ? "Withdrawals via Litecoin (LTC) are processed within 1-2 hours. Ensure that you are providing a direct, valid Litecoin (LTC) recipient address. Market exchange rates will be automatically updated at the time of payout."
                              : "Litecoin (LTC) উইথড্র ১ থেকে ২ ঘণ্টার মধ্যে সম্পন্ন হয়। আপনার ওয়ালেটটি সরাসরি লাইটকয়েন রিসিভ সমর্থন করে কিনা এবং অ্যাড্রেসটি সঠিক কিনা তা নিশ্চিত করুন। পেমেন্ট প্রসেসিংয়ের সময় লাইটকয়েনের বর্তমান মার্কেট রেট হিসাব করা হবে।"}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            {language === 'en'
                              ? `⚠️ Make sure your Commission Balance has at least $${(parseFloat(withdrawAmountInput || '0') * (siteConfig.governmentFeePct ?? 10) / 100).toFixed(2)} to complete this request.`
                              : `⚠️ নিশ্চিত করুন যে এই উইথড্র করার জন্য আপনার কমিশন ব্যালেন্স-এ অন্তত $${(parseFloat(withdrawAmountInput || '0') * (siteConfig.governmentFeePct ?? 10) / 100).toFixed(2)} রয়েছে।`}
                          </p>
                        </div>

                        {/* Warning Banner */}
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl text-left space-y-1">
                          <p className="text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            ⚠️ Warning / সতর্কীকরণ
                          </p>
                          <p className="text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                            {language === 'en'
                              ? 'Entering false, invalid, or third-party addresses is strictly prohibited. Your withdrawal destination MUST be owned by you. Submitting fake or coordinated withdrawal requests will result in absolute account ban and forfeiture of all assets.'
                              : 'ভুল, ভুল নেটওয়ার্কের বা অন্যের অ্যাড্রেস দেওয়া কঠোরভাবে নিষিদ্ধ। উইথড্র অ্যাড্রেসটি অবশ্যই আপনার নিজের হতে হবে। কোনো ধরনের ভুয়া রিকোয়েস্ট সাবমিট করা হলে অ্যাকাউন্ট সাথে সাথে ব্যান করা হবে এবং ব্যালেন্স বাজেয়াপ্ত করা হবে।'}
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                            {language === 'en' ? 'Your Recipient Litecoin (LTC) Wallet Address' : 'আপনার প্রাপক লাইটকয়েন (LTC) ওয়ালেট অ্যাড্রেস'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. LLyD14NjX..."
                            value={withdrawPhoneOrAccount}
                            onChange={(e) => setWithdrawPhoneOrAccount(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 dark:text-white font-mono"
                            required
                          />
                        </div>
                      </div>

                      {/* Declaration Checkbox */}
                      <div className="flex items-start gap-3 bg-white p-3.5 border border-zinc-250 rounded-xl">
                        <input
                          id="declareWithdrawLTC"
                          type="checkbox"
                          checked={declareWithdraw}
                          onChange={(e) => setDeclareWithdraw(e.target.checked)}
                          className="mt-1 h-4.5 w-4.5 rounded border-zinc-350 text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <label htmlFor="declareWithdrawLTC" className="text-[11px] text-zinc-600 font-bold select-none cursor-pointer leading-relaxed text-left">
                          {language === 'en'
                            ? 'I declare under full personal liability that I am the sole owner of this withdrawal wallet. I understand that submitting fake requests is fraud and leads to immediate account termination.'
                            : 'আমি সম্পূর্ণ ব্যক্তিগত দায়িত্বে ঘোষণা করছি যে এই ওয়ালেট অ্যাড্রেসটির একমাত্র মালিক আমি নিজেই। আমি জানি যে ভুয়া রিকোয়েস্ট সাবমিট করা প্রতারণা এবং এর জন্য অ্যাকাউন্ট চিরতরে বাতিল করা হবে।'}
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#E1BC4A] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        {language === 'en' ? 'SUBMIT LTC WITHDRAWAL REQUEST' : 'LTC উইথড্র রিকোয়েস্ট পাঠান'}
                      </button>
                    </form>
                  )}

                  {/* 3. USD (Payeer/PM) Form */}
                  {selectedWithdrawMethod === 'crypto_usd' && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!user) return;
                        const amt = parseFloat(withdrawAmountInput);
                        if (isNaN(amt) || amt <= 0) {
                          alert("Please specify a valid withdrawal amount.");
                          return;
                        }
                        const minWd = siteConfig.minWithdrawalAmount ?? 10;
                        if (amt < minWd) {
                          alert(`Minimum withdrawal amount is $${minWd.toFixed(2)}`);
                          return;
                        }
                        if (user.balance < amt) {
                          alert("Insufficient wallet balance for this withdrawal.");
                          return;
                        }

                        if (!declareWithdraw) {
                          alert(language === 'en'
                            ? "⚠️ Please confirm the declaration checkbox at the bottom stating you authorize this withdrawal and understand fake requests lead to account suspension."
                            : "⚠️ অনুগ্রহ করে নিচে দেওয়া ডিক্লেয়ারেশন বক্সে টিক মার্ক দিয়ে নিশ্চিত করুন যে আপনি উইথড্র রিকোয়েস্ট পাঠাতে চান।");
                          return;
                        }
                        
                        const govFeePct = siteConfig.governmentFeePct ?? 10;
                        const commissionNeeded = amt * (govFeePct / 100);
                        const currentComm = user.commissionBalance || 0;
                        
                        if (currentComm < commissionNeeded) {
                          alert(`⚠️ Insufficient Commission Balance! You need USDT ${commissionNeeded.toFixed(2)} (${govFeePct}% of USDT ${amt.toFixed(2)}) in your Commission Balance to authorize this withdrawal. Currently you have USDT ${currentComm.toFixed(2)}.`);
                          return;
                        }

                        if (!withdrawPhoneOrAccount) {
                          alert("Please enter your Recipient USD Account ID.");
                          return;
                        }

                        const nextBalance = parseFloat((user.balance - amt).toFixed(2));
                        const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
                        await updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

                        if (addWithdrawalRequest) {
                          await addWithdrawalRequest({
                            email: user.email,
                            amount: amt,
                            bankName: 'Crypto USD (PM/Payeer)',
                            iban: withdrawPhoneOrAccount,
                            accountName: user.name,
                            commissionDeducted: commissionNeeded
                          });
                        }

                        alert(`🎉 USD Withdrawal request for $${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission (USDT ${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
                        setWithdrawAmountInput('');
                        setWithdrawPhoneOrAccount('');
                        setDeclareWithdraw(false);
                        setActiveTab('Transactions');
                      }}
                      className="space-y-6 animate-fade-in"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                          {language === 'en' ? 'Enter Withdrawal Amount ($)' : 'উইথড্র পরিমাণ লিখুন ($)'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={withdrawAmountInput}
                          onChange={(e) => setWithdrawAmountInput(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 p-3.5 rounded-xl text-lg font-black outline-none focus:border-zinc-950 dark:focus:border-amber-500 focus:bg-white text-zinc-900 dark:text-white transition-all"
                          placeholder="0.00"
                          required
                        />
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                          {language === 'en' 
                            ? `Minimum withdrawal amount: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}` 
                            : `সর্বনিম্ন উইথড্র পরিমাণ: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}`}
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl space-y-2">
                          <p className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                            <span>ℹ️</span> {language === 'en' ? 'USD (PAYEER/PM) WITHDRAWAL INSTRUCTIONS' : 'পেয়ার/পিএম উইথড্র নির্দেশনা'}
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-300">
                            {language === 'en'
                              ? "Withdrawals via USD (Perfect Money or Payeer Account) are completed within 1-2 hours. Payeer account IDs usually start with 'P' (e.g. P10294827), and Perfect Money account IDs start with 'U' (e.g. U1827492)."
                              : "Perfect Money বা Payeer USD উইথড্র সাধারণত ১ থেকে ২ ঘণ্টার মধ্যে সম্পন্ন হয়ে থাকে। Payeer আইডি সাধারণত 'P' (যেমন: P10294827) এবং Perfect Money আইডি 'U' (যেমন: U1827492) দিয়ে শুরু হয়ে থাকে। সঠিক আইডি প্রদান নিশ্চিত করুন।"}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            {language === 'en'
                              ? `⚠️ Make sure your Commission Balance has at least $${(parseFloat(withdrawAmountInput || '0') * (siteConfig.governmentFeePct ?? 10) / 100).toFixed(2)} to complete this request.`
                              : `⚠️ নিশ্চিত করুন যে এই উইথড্র করার জন্য আপনার কমিশন ব্যালেন্স-এ অন্তত $${(parseFloat(withdrawAmountInput || '0') * (siteConfig.governmentFeePct ?? 10) / 100).toFixed(2)} রয়েছে।`}
                          </p>
                        </div>

                        {/* Warning Banner */}
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl text-left space-y-1">
                          <p className="text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            ⚠️ Warning / সতর্কীকরণ
                          </p>
                          <p className="text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                            {language === 'en'
                              ? 'Entering false, invalid, or third-party addresses is strictly prohibited. Your withdrawal destination MUST be owned by you. Submitting fake or coordinated withdrawal requests will result in absolute account ban and forfeiture of all assets.'
                              : 'ভুল, অসত্য বা অন্যের অ্যাকাউন্ট আইডি দেওয়া কঠোরভাবে নিষিদ্ধ। উইথড্র অ্যাকাউন্টটি অবশ্যই আপনার নিজের হতে হবে। কোনো ধরনের ভুয়া রিকোয়েস্ট সাবমিট করা হলে অ্যাকাউন্ট সাথে সাথে ব্যান করা হবে এবং ব্যালেন্স বাজেয়াপ্ত করা হবে।'}
                          </p>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                            {language === 'en' ? 'Your Recipient Perfect Money (U...) or Payeer (P...) Account ID' : 'আপনার প্রাপক Perfect Money (U...) অথবা Payeer (P...) অ্যাকাউন্ট আইডি'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. P10294827 or U1827492"
                            value={withdrawPhoneOrAccount}
                            onChange={(e) => setWithdrawPhoneOrAccount(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 dark:text-white font-mono"
                            required
                          />
                        </div>
                      </div>

                      {/* Declaration Checkbox */}
                      <div className="flex items-start gap-3 bg-white p-3.5 border border-zinc-250 rounded-xl">
                        <input
                          id="declareWithdrawUSD"
                          type="checkbox"
                          checked={declareWithdraw}
                          onChange={(e) => setDeclareWithdraw(e.target.checked)}
                          className="mt-1 h-4.5 w-4.5 rounded border-zinc-350 text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <label htmlFor="declareWithdrawUSD" className="text-[11px] text-zinc-600 font-bold select-none cursor-pointer leading-relaxed text-left">
                          {language === 'en'
                            ? 'I declare under full personal liability that I am the sole owner of this withdrawal account. I understand that submitting fake requests is fraud and leads to immediate account termination.'
                            : 'আমি সম্পূর্ণ ব্যক্তিগত দায়িত্বে ঘোষণা করছি যে এই অ্যাকাউন্ট অ্যাড্রেসটির একমাত্র মালিক আমি নিজেই। আমি জানি যে ভুয়া রিকোয়েস্ট সাবমিট করা প্রতারণা এবং এর জন্য অ্যাকাউন্ট চিরতরে বাতিল করা হবে।'}
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#E1BC4A] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        {language === 'en' ? 'SUBMIT USD WITHDRAWAL REQUEST' : 'USD উইথড্র রিকোয়েস্ট পাঠান'}
                      </button>
                    </form>
                  )}

                  {/* 4. Direct Bank Transfer Form */}
                  {selectedWithdrawMethod === 'bank' && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!user) return;
                        const amt = parseFloat(withdrawAmountInput);
                        if (isNaN(amt) || amt <= 0) {
                          alert("Please specify a valid withdrawal amount.");
                          return;
                        }
                        const minWd = siteConfig.minWithdrawalAmount ?? 10;
                        if (amt < minWd) {
                          alert(`Minimum withdrawal amount is $${minWd.toFixed(2)}`);
                          return;
                        }
                        if (user.balance < amt) {
                          alert("Insufficient wallet balance for this withdrawal.");
                          return;
                        }

                        if (!declareWithdraw) {
                          alert(language === 'en'
                            ? "⚠️ Please confirm the declaration checkbox at the bottom stating you authorize this withdrawal and understand fake requests lead to account suspension."
                            : "⚠️ অনুগ্রহ করে নিচে দেওয়া ডিক্লেয়ারেশন বক্সে টিক মার্ক দিয়ে নিশ্চিত করুন যে আপনি উইথড্র রিকোয়েস্ট পাঠাতে চান।");
                          return;
                        }
                        
                        const govFeePct = siteConfig.governmentFeePct ?? 10;
                        const commissionNeeded = amt * (govFeePct / 100);
                        const currentComm = user.commissionBalance || 0;
                        
                        if (currentComm < commissionNeeded) {
                          alert(`⚠️ Insufficient Commission Balance! You need USDT ${commissionNeeded.toFixed(2)} (${govFeePct}% of USDT ${amt.toFixed(2)}) in your Commission Balance to authorize this withdrawal. Currently you have USDT ${currentComm.toFixed(2)}.`);
                          return;
                        }

                        if (!withdrawBankName || !withdrawBranch || !withdrawPhoneOrAccount || !withdrawAccountName) {
                          alert("Please fill in all required bank fields.");
                          return;
                        }

                        const nextBalance = parseFloat((user.balance - amt).toFixed(2));
                        const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
                        await updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

                        if (addWithdrawalRequest) {
                          await addWithdrawalRequest({
                            email: user.email,
                            amount: amt,
                            bankName: `Bank (${withdrawBankName}, Branch: ${withdrawBranch})`,
                            iban: withdrawPhoneOrAccount,
                            accountName: withdrawAccountName,
                            commissionDeducted: commissionNeeded
                          });
                        }

                        alert(`🎉 Bank Withdrawal request of $${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission (USDT ${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
                        setWithdrawAmountInput('');
                        setWithdrawBankName('');
                        setWithdrawBranch('');
                        setWithdrawPhoneOrAccount('');
                        setWithdrawAccountName('');
                        setDeclareWithdraw(false);
                        setActiveTab('Transactions');
                      }}
                      className="space-y-6 animate-fade-in"
                    >
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                          {language === 'en' ? 'Enter Withdrawal Amount ($)' : 'উইথড্র পরিমাণ লিখুন ($)'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={withdrawAmountInput}
                          onChange={(e) => setWithdrawAmountInput(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 p-3.5 rounded-xl text-lg font-black outline-none focus:border-zinc-950 dark:focus:border-amber-500 focus:bg-white text-zinc-900 dark:text-white transition-all"
                          placeholder="0.00"
                          required
                        />
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                          {language === 'en' 
                            ? `Minimum withdrawal amount: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}` 
                            : `সর্বনিম্ন উইথড্র পরিমাণ: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}`}
                        </p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl space-y-2">
                          <p className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[9px] flex items-center gap-1.5">
                            <span>ℹ️</span> {language === 'en' ? 'BANK TRANSFER WITHDRAWAL INSTRUCTIONS' : 'ব্যাংক উইথড্র নির্দেশনা'}
                          </p>
                          <p className="text-zinc-600 dark:text-zinc-300">
                            {language === 'en'
                              ? "Withdrawals via Direct Bank Transfer are processed via local electronic channels within 1-2 business days. Please double check that you have filled in the Bank Name, Branch Name, Account Number, and Account Holder Name exactly as printed on your cheque book."
                              : "সরাসরি ব্যাংক ট্রান্সফার স্থানীয় ব্যাংকিং চ্যানেলের মাধ্যমে ১ থেকে ২ কর্মদিবসের মধ্যে প্রসেস হয়। অনুগ্রহ করে ব্যাংক নাম, ব্রাঞ্চ নাম, সঠিক অ্যাকাউন্ট নম্বর এবং অ্যাকাউন্ট হোল্ডারের নাম চেক বইয়ের তথ্যের সাথে মিলিয়ে নিখুঁতভাবে টাইপ করুন।"}
                          </p>
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                            {language === 'en'
                              ? `⚠️ Make sure your Commission Balance has at least $${(parseFloat(withdrawAmountInput || '0') * (siteConfig.governmentFeePct ?? 10) / 100).toFixed(2)} to complete this request.`
                              : `⚠️ নিশ্চিত করুন যে এই উইথড্র করার জন্য আপনার কমিশন ব্যালেন্স-এ অন্তত $${(parseFloat(withdrawAmountInput || '0') * (siteConfig.governmentFeePct ?? 10) / 100).toFixed(2)} রয়েছে।`}
                          </p>
                        </div>

                        {/* Warning Banner */}
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl text-left space-y-1">
                          <p className="text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                            ⚠️ Warning / সতর্কীকরণ
                          </p>
                          <p className="text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                            {language === 'en'
                              ? 'Entering false, invalid, or third-party bank accounts is strictly prohibited. Your withdrawal destination MUST be owned by you. Submitting fake or coordinated withdrawal requests will result in absolute account ban and forfeiture of all assets.'
                              : 'ভুল, অসত্য বা অন্যের ব্যাংক অ্যাকাউন্ট দেওয়া কঠোরভাবে নিষিদ্ধ। উইথড্র ব্যাংক অ্যাকাউন্টটি অবশ্যই আপনার নিজের হতে হবে। কোনো ধরনের ভুয়া রিকোয়েস্ট সাবমিট করা হলে অ্যাকাউন্ট সাথে সাথে ব্যান করা হবে এবং ব্যালেন্স বাজেয়াপ্ত করা হবে।'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                              Bank Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Dutch-Bangla Bank"
                              value={withdrawBankName}
                              onChange={(e) => setWithdrawBankName(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 dark:text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                              Branch Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Motijheel Branch"
                              value={withdrawBranch}
                              onChange={(e) => setWithdrawBranch(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                              Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 102.120.49129"
                              value={withdrawPhoneOrAccount}
                              onChange={(e) => setWithdrawPhoneOrAccount(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 dark:text-white font-mono"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                              Account Holder Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Md. Ashraful Islam"
                              value={withdrawAccountName}
                              onChange={(e) => setWithdrawAccountName(e.target.value)}
                              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 dark:text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Declaration Checkbox */}
                      <div className="flex items-start gap-3 bg-white p-3.5 border border-zinc-250 rounded-xl">
                        <input
                          id="declareWithdrawBank"
                          type="checkbox"
                          checked={declareWithdraw}
                          onChange={(e) => setDeclareWithdraw(e.target.checked)}
                          className="mt-1 h-4.5 w-4.5 rounded border-zinc-350 text-amber-600 focus:ring-amber-500 accent-amber-500 cursor-pointer"
                        />
                        <label htmlFor="declareWithdrawBank" className="text-[11px] text-zinc-600 font-bold select-none cursor-pointer leading-relaxed text-left">
                          {language === 'en'
                            ? 'I declare under full personal liability that I am the sole owner of this bank account. I understand that submitting fake requests is fraud and leads to immediate account termination.'
                            : 'আমি সম্পূর্ণ ব্যক্তিগত দায়িত্বে ঘোষণা করছি যে এই ব্যাংক অ্যাকাউন্টটির একমাত্র মালিক আমি নিজেই। আমি জানি যে ভুয়া রিকোয়েস্ট সাবমিট করা প্রতারণা এবং এর জন্য অ্যাকাউন্ট চিরতরে বাতিল করা হবে।'}
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#E1BC4A] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        {language === 'en' ? 'SUBMIT BANK WITHDRAWAL REQUEST' : 'ব্যাংক উইথড্র রিকোয়েস্ট পাঠান'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Add Commission */}
            {activeTab === 'Add Commission' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
                  <h3 className="text-lg font-black text-emerald-950 dark:text-white uppercase tracking-widest mb-2 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <span className="text-emerald-600">🪙</span> 
                    {language === 'en' ? 'Add Commission Balance' : 'কমিশন ব্যালেন্স অ্যাড করুন'}
                  </h3>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/30 p-4 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed mb-6">
                    <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-emerald-950 dark:text-emerald-100">
                      💡 {language === 'en' ? 'Why pay commission?' : 'কেন কমিশন পে করবেন?'}
                    </p>
                    <p>
                      {language === 'en' 
                        ? `Before requesting a withdrawal, you must load and maintain an active Commission Balance to cover government commission fees (currently ${siteConfig.governmentFeePct ?? 10}%). This commission must be paid manually using our verified gateways below.`
                        : `উইথড্র করার পূর্বে আপনার উইথড্র পরিমাণের ওপর নির্ধারিত সরকারি কমিশন ফি (${siteConfig.governmentFeePct ?? 10}%) কভার করার জন্য আপনার কমিশন ব্যালেন্স রিচার্জ থাকতে হবে। নিচের যেকোনো ম্যানুয়াল গেটওয়ে ব্যবহার করে এটি পে করতে পারবেন।`}
                    </p>
                  </div>

                  <form onSubmit={handleManualCommissionSubmit} className="space-y-6">
                    {/* Amount Input */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-3">
                        {language === 'en' ? 'Select Commission Amount' : 'কমিশন পরিমাণ সিলেক্ট করুন'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-3">
                        {['1500', '3500', '5000', '8500', '10000'].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setCommissionDepositAmount(val)}
                            className={`py-3.5 px-2 text-center font-bold text-xs rounded-xl border transition-all ${
                              commissionDepositAmount === val
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                : 'bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                            }`}
                          >
                            ${parseFloat(val).toLocaleString()}
                          </button>
                        ))}
                      </div>

                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                        {language === 'en' ? 'Or Enter Custom Amount ($)' : 'অথবা কাস্টম পরিমাণ লিখুন ($)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={commissionDepositAmount}
                        onChange={(e) => setCommissionDepositAmount(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-lg font-black outline-none focus:border-emerald-600 focus:bg-white text-zinc-900 transition-all"
                        placeholder="0.00"
                        required
                      />
                    </div>

                     {/* Method Selector */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                        {language === 'en' ? 'Select Commission Payment Channel' : 'কমিশন পেমেন্ট মাধ্যম সিলেক্ট করুন'}
                      </label>
                      <select
                        value={commissionGatewayName}
                        onChange={(e) => setCommissionGatewayName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white text-zinc-900 transition-all cursor-pointer"
                      >
                        {(siteConfig.paymentGateways || [])
                          .filter(g => g.enabled && (g.type === 'both' || g.type === 'deposit'))
                          .map(g => (
                            <option key={g.id} value={g.name}>{g.name}</option>
                          ))}
                      </select>
                    </div>

                    {/* Gateway Instructions & Fields */}
                    {(() => {
                      const matched = (siteConfig.paymentGateways || []).find(g => 
                        g.enabled && g.name === commissionGatewayName
                      );

                      return (
                        <div className="animate-fade-in space-y-5 bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                          <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                              {language === 'en' ? 'Commission Payment Instructions' : 'কমিশন পেমেন্ট নির্দেশনাবলী'}
                            </span>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              {commissionGatewayName} Payout Gateway
                            </span>
                          </div>

                          {matched ? (
                            <>
                              <div className="bg-white border border-zinc-200/80 rounded-xl p-4 text-center">
                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                                  {language === 'en' ? 'Send Funds To:' : 'এই নম্বরে পেমেন্ট করুন:'}
                                </span>
                                <p className="font-mono text-xl font-black text-zinc-950 break-all select-all">
                                  {matched.numberOrAddress}
                                </p>
                                {matched.instructions && (
                                  <p className="text-[11px] text-zinc-500 font-medium italic mt-2.5 border-t pt-2 border-zinc-100">
                                    " {matched.instructions} "
                                  </p>
                                )}
                              </div>

                              {/* Warning Banner */}
                              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-xl text-left space-y-1">
                                <p className="text-red-700 dark:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                  ⚠️ Warning / সতর্কীকরণ
                                </p>
                                <p className="text-red-600 dark:text-red-400 text-[11px] leading-relaxed">
                                  {language === 'en'
                                    ? 'Submitting false, inaccurate, or reused transaction information is strictly forbidden. Fake commission deposit requests are automatically flagged. Any attempt to exploit or upload fake details will lead to immediate, irreversible account ban and confiscation of all assets.'
                                    : 'ভুয়া, অসত্য বা পূর্বে ব্যবহৃত পেমেন্ট তথ্য সাবমিট করা কঠোরভাবে নিষিদ্ধ। কৃত্রিম বা ভুয়া কমিশন ডিপোজিট রিকোয়েস্ট স্বয়ংক্রিয়ভাবে ব্লক করা হবে। কোনো অ্যাকাউন্ট থেকে ভুয়া ট্রানজেকশন সাবমিট করার চেষ্টা করা হলে অ্যাকাউন্ট চিরতরে ব্যান করা হবে এবং ব্যালেন্স বাজেয়াপ্ত করা হবে।'}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                                    {language === 'en' ? 'Your Sender Phone / Account Number' : 'আপনার সেন্ডার ফোন / অ্যাকাউন্ট নাম্বার'} <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 01712345678"
                                    value={commissionPhoneOrAccount}
                                    onChange={(e) => setCommissionPhoneOrAccount(e.target.value)}
                                    className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 text-zinc-900"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                                    {language === 'en' ? 'Transaction ID (TrxID)' : 'ট্রানজেকশন আইডি / TrxID'} <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="e.g. TRX8291039"
                                    value={commissionTrxId}
                                    onChange={(e) => setCommissionTrxId(e.target.value)}
                                    className="w-full bg-white border border-zinc-350 p-3 rounded-xl text-xs font-bold outline-none focus:border-emerald-600 text-zinc-900 font-mono"
                                    required
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-6 text-zinc-500 text-xs font-medium italic">
                              {language === 'en' 
                                ? `No gateway details found for ${commissionGatewayName}. Please consult admin.`
                                : `${commissionGatewayName} এর জন্য কোনো গেটওয়ে সেট করা নেই। দয়া করে এডমিনের সাথে যোগাযোগ করুন।`}
                            </div>
                          )}

                          {matched && (
                            <div className="flex items-start gap-3 bg-white p-3.5 border border-zinc-250 rounded-xl">
                              <input
                                id="declareDepositCommission"
                                type="checkbox"
                                checked={declareCommission}
                                onChange={(e) => setDeclareCommission(e.target.checked)}
                                className="mt-1 h-4.5 w-4.5 rounded border-zinc-350 text-emerald-600 focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
                              />
                              <label htmlFor="declareDepositCommission" className="text-[11px] text-zinc-600 font-bold select-none cursor-pointer leading-relaxed text-left">
                                {language === 'en'
                                  ? 'I declare under full personal liability that I have sent the correct commission amount from my own wallet/account and have specified the correct transaction info. I understand that submitting fake requests is fraud.'
                                  : 'আমি সম্পূর্ণ ব্যক্তিগত দায়িত্বে ঘোষণা করছি যে আমি আমার নিজের ওয়ালেট থেকে সঠিক পরিমাণ টাকা পাঠিয়েছি এবং সঠিক ট্রানজেকশন তথ্য প্রদান করেছি। আমি জানি যে ভুয়া রিকোয়েস্ট সাবমিট করা একটি প্রতারণা।'}
                              </label>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={!matched}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                          >
                            {language === 'en' ? 'SUBMIT COMMISSION DEPOSIT' : 'কমিশন ডিপোজিট রিকোয়েস্ট পাঠান'}
                          </button>
                        </div>
                      );
                    })()}
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
                              <span className="text-[10.5px] font-black text-white uppercase block tracking-wide">
                                Invoice #ED-{t.id.toString().substring(0,6).toUpperCase()}
                              </span>
                              <span className="text-[10px] text-zinc-400 mt-0.5 block">{t.purchaseDate}</span>
                            </div>

                            <div className="text-right sm:text-right space-y-1">
                              <span className="font-mono text-xs font-black text-white block">${t.price.toFixed(2)}</span>
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
                        className="bg-[#2C3B69] text-white hover:bg-[#1E1A3C] font-black text-xs uppercase px-8 py-3.5 rounded-xl tracking-wider select-none leading-none shadow-md transition-all active:scale-95"
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
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-zinc-900 text-yellow-300 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase">
                                {t.gameName} DRAW
                              </span>
                              {t.thaiLotteryType && (
                                <span className="bg-blue-600 text-white text-[9px] font-extrabold tracking-wide px-2 py-0.5 rounded-md uppercase">
                                  {t.thaiLotteryType}
                                </span>
                              )}
                            </div>

                            {t.isThaiLottery || t.gameName === 'THAI LOTTERY' ? (
                              <div className="pt-2 space-y-2 text-xs text-zinc-650 font-semibold">
                                <div className="flex items-center gap-2">
                                  <span className="text-zinc-400 font-black uppercase text-[9px] tracking-wider">Bet Number:</span>
                                  <span className="font-mono font-black text-xs text-yellow-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-yellow-500/20">
                                    {t.thaiLotteryNumber || t.numbers.join('')}
                                  </span>
                                </div>
                                <div className="flex gap-4 text-[10px] text-zinc-400 uppercase tracking-wide">
                                  <span>Direct: <b className="font-mono text-zinc-900 dark:text-white">${t.directBet || t.price}</b></span>
                                  {t.rumbleBet > 0 && (
                                    <span>Rumble: <b className="font-mono text-zinc-900 dark:text-white">${t.rumbleBet}</b></span>
                                  )}
                                  <span>Total: <b className="font-mono text-zinc-900 dark:text-white">${t.price}</b></span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {t.numbers.map((num, i) => (
                                  <span key={i} className="bg-zinc-950 text-yellow-300 font-mono font-black text-xs w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-yellow-300/20">
                                    {num}
                                  </span>
                                ))}
                              </div>
                            )}
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
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-6">
                    Audit Ledger Transactions
                  </h3>

                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden font-mono text-[11px]">
                    <div className="grid grid-cols-3 bg-zinc-900 dark:bg-zinc-950 text-zinc-400 p-3.5 uppercase font-bold tracking-wider">
                      <span>Description</span>
                      <span className="text-center">Status</span>
                      <span className="text-right">Value</span>
                    </div>

                    <div className="divide-y divide-zinc-150 dark:divide-zinc-800">
                      {/* Real Deposits Ledger */}
                      {depositRequests.filter(d => d.email === user.email).map((dep) => (
                        <div key={dep.id} className="grid grid-cols-3 p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-semibold">
                          <span className="text-zinc-800 dark:text-zinc-200">Deposit: {dep.gateway}</span>
                          <span className="text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              dep.status === 'Approved' ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' :
                              dep.status === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                            }`}>
                              {dep.status}
                            </span>
                          </span>
                          <span className={`text-right ${dep.status === 'Approved' ? 'text-green-600' : 'text-zinc-400 dark:text-zinc-500'}`}>
                            +${dep.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}

                      {/* Real Withdrawals Ledger */}
                      {withdrawalRequests.filter(w => w.email === user.email).map((wd) => (
                        <div key={wd.id} className="grid grid-cols-3 p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-semibold">
                          <span className="text-zinc-800 dark:text-zinc-200">Withdraw: {wd.bankName}</span>
                          <span className="text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                              wd.status === 'Approved' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300' :
                              wd.status === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400' : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
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
                        <div key={t.id} className="grid grid-cols-3 p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-semibold">
                          <span className="text-zinc-800 dark:text-zinc-200">Buy Ticket {t.gameName}</span>
                          <span className="text-center"><span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 px-1.5 py-0.5 rounded text-[9px]">DEBITED</span></span>
                          <span className="text-right text-red-600">-${t.price.toFixed(2)}</span>
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
                        className="w-4 h-4 text-red-650 mt-0.5 rounded accent-[#E1BC4A]"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-white block uppercase">Email Result alerts</span>
                        <p className="text-zinc-400 text-[10.5px] mt-0.5 font-medium">Get lucky tickets payouts verification delivered directly to your register email inbox.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 bg-zinc-50 border p-4 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comSms}
                        onChange={(e) => setComSms(e.target.checked)}
                        className="w-4 h-4 text-red-650 mt-0.5 rounded accent-[#E1BC4A]"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-white block uppercase">SMS Notification bulletins</span>
                        <p className="text-zinc-400 text-[10.5px] mt-0.5 font-medium">Receive direct SMS notification bulletins moments after the weekly drawing halts.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 bg-zinc-50 border p-4 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={comNewsletter}
                        onChange={(e) => setComNewsletter(e.target.checked)}
                        className="w-4 h-4 text-red-650 mt-0.5 rounded accent-[#E1BC4A]"
                      />
                      <div>
                        <span className="text-xs font-extrabold text-white block uppercase">Golobal Lottery VIP newsletter</span>
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
                      className="w-full bg-[#2C3B69] text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-zinc-800 transition-all font-sans"
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
                  <div className="flex items-center gap-3 mb-4 text-[#E1BC4A]">
                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Responsible Play Council</h3>
                  </div>

                  <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6">
                    Golobal Lottery promotes fun and fair sweepstakes limits. Use our custom scheduler constraints to maintain control over your gameplay.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-zinc-55 border p-4 rounded-xl flex justify-between items-center bg-gray-50">
                      <div>
                        <span className="text-xs font-black block text-white">Set Weekly Deposit Limit</span>
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
                        <span className="text-xs font-black block text-white">Cooling-Off Self Exclusion</span>
                        <p className="text-[10px] text-zinc-400 font-medium font-semibold">Self-lock your account from ticketing for specified intervals.</p>
                      </div>
                      <button className="bg-red-50 text-[#E1BC4A] border border-red-200 hover:bg-red-100 font-black text-[9px] uppercase px-3 py-1.5 rounded-lg">
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
                    <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded" style={{ color: siteConfig.primaryHex || '#E1BC4A' }}>
                      {systemNotifications.filter(n => !n.read).length} Unread
                    </span>
                  </div>

                  <div className="space-y-3.5 select-none">
                    {systemNotifications.length === 0 ? (
                      <div className="text-center py-8 text-zinc-400 font-semibold text-xs">
                        No notifications or messages in your inbox.
                      </div>
                    ) : (
                      systemNotifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          className={`border p-4 rounded-xl shadow-xs border-l-4 transition-all ${
                            notif.read 
                              ? 'border-zinc-150 bg-white/70 dark:bg-zinc-900 border-l-zinc-300 dark:border-l-zinc-700' 
                              : 'border-zinc-200 bg-zinc-50 dark:bg-zinc-900 font-semibold shadow-xs'
                          }`}
                          style={!notif.read ? { borderLeftColor: siteConfig.primaryHex || '#E1BC4A' } : {}}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-black block uppercase ${notif.read ? 'text-zinc-600 dark:text-zinc-400' : 'text-white dark:text-white'}`}>
                                  {notif.title}
                                </span>
                                {!notif.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block shrink-0" />
                                )}
                              </div>
                              <span className="text-[9px] text-zinc-400 font-bold block mt-0.5">{notif.date}</span>
                            </div>
                            
                            {!notif.read && (
                              <button
                                type="button"
                                onClick={() => markNotificationAsRead(notif.id)}
                                className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors cursor-pointer shrink-0"
                                style={{ color: siteConfig.primaryHex || '#E1BC4A' }}
                              >
                                Mark Read
                              </button>
                            )}
                          </div>
                          <p className={`text-xs leading-relaxed mt-1.5 ${notif.read ? 'text-zinc-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
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
