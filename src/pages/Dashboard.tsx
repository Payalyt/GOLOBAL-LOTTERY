import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  const { user, setUser, isLoggedIn, tickets, updateUserBalance, updateUserProfileFields, withdrawalRequests = [], addWithdrawalRequest, addDepositRequest, addApprovedDeposit, depositRequests = [], siteConfig, language, theme } = useAuth();
  const { tickets: cartTickets } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Track previous requests for notifications
  const prevDepositsRef = useRef(depositRequests);
  const prevWithdrawalsRef = useRef(withdrawalRequests);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'success' | 'error'}[]>([]);

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
  const [depositGatewayName, setDepositGatewayName] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Bank'>('bKash');
  const [depositPhoneOrAccount, setDepositPhoneOrAccount] = useState('');
  const [depositTrxId, setDepositTrxId] = useState('');

  const [withdrawGatewayName, setWithdrawGatewayName] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Bank'>('bKash');
  const [withdrawPhoneOrAccount, setWithdrawPhoneOrAccount] = useState('');
  const [withdrawAmountInput, setWithdrawAmountInput] = useState('');
  const [withdrawAccountName, setWithdrawAccountName] = useState('');
  const [withdrawBankName, setWithdrawBankName] = useState('');
  const [withdrawBranch, setWithdrawBranch] = useState('');

  const [commissionGatewayName, setCommissionGatewayName] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Bank'>('bKash');
  const [commissionPhoneOrAccount, setCommissionPhoneOrAccount] = useState('');
  const [commissionTrxId, setCommissionTrxId] = useState('');

  // Legacy variables kept or adapted to prevent compilation errors
  const [selectedDepositMethod, setSelectedDepositMethod] = useState<'manual_gateway' | 'card' | 'agent' | 'crypto'>('manual_gateway');
  const [cryptoSubMethod, setCryptoSubMethod] = useState<'automatic' | 'manual'>('automatic');
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  const [selectedCommissionMethod, setSelectedCommissionMethod] = useState<'manual_gateway' | 'card' | 'agent'>('manual_gateway');
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<'manual_gateway' | 'bank' | 'agent'>('manual_gateway');
  const [isProcessingDokan, setIsProcessingDokan] = useState(false);
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

    const gatewayName = depositGatewayName;
    const matched = (siteConfig.paymentGateways || []).find(g => 
      g.enabled && g.name.toLowerCase().replace(/\s/g, '').includes(gatewayName.toLowerCase())
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

    if (addDepositRequest) {
      await addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: gatewayName,
        transactionId: depositTrxId,
        details: `Sender Number: ${depositPhoneOrAccount}`
      });
      alert(`🎉 Manual Deposit request of $${amt.toFixed(2)} via ${gatewayName} submitted successfully! It will be verified by our Admin team and added to your balance shortly.`);
      setDepositAmount('100');
      setDepositPhoneOrAccount('');
      setDepositTrxId('');
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

    const gatewayName = commissionGatewayName;
    const matched = (siteConfig.paymentGateways || []).find(g => 
      g.enabled && g.name.toLowerCase().replace(/\s/g, '').includes(gatewayName.toLowerCase())
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

    if (addDepositRequest) {
      await addDepositRequest({
        email: user.email,
        amount: amt,
        gateway: `${gatewayName} (Commission)`,
        transactionId: commissionTrxId,
        details: `Sender Number: ${commissionPhoneOrAccount}. Commission Deposit.`
      });
      alert(`🎉 Commission Deposit request of $${amt.toFixed(2)} via ${gatewayName} submitted successfully! It will be verified by our Admin team and credited to your Commission Balance once approved.`);
      setCommissionDepositAmount('100');
      setCommissionPhoneOrAccount('');
      setCommissionTrxId('');
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

    const gatewayName = withdrawGatewayName;
    const matched = (siteConfig.paymentGateways || []).find(g => 
      g.enabled && g.name.toLowerCase().replace(/\s/g, '').includes(gatewayName.toLowerCase())
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

    const nextBalance = parseFloat((currentBal - amt).toFixed(2));
    const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
    await updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

    if (addWithdrawalRequest) {
      await addWithdrawalRequest({
        email: user.email,
        amount: amt,
        bankName: gatewayName === 'Bank' ? `Bank (${withdrawBankName}, Branch: ${withdrawBranch})` : gatewayName,
        iban: withdrawPhoneOrAccount,
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
        iban: agentWithdrawReference || 'Agent Contact ID',
        accountName: user.name,
        commissionDeducted: commissionNeeded
      });
    }

    alert(`🎉 Agent Withdrawal request for $${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission ($${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
    setBankWithdrawAmount('');
    setAgentWithdrawReference('');
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
        bankName: `${bankWithdrawName} (Branch: ${bankWithdrawBranch})`,
        iban: bankWithdrawIban,
        accountName: user.name,
        commissionDeducted: commissionNeeded
      });
    }

    alert(`🎉 Withdrawal request for $${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission ($${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
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
                <div className="bg-white border border-zinc-200/85 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
                  <h3 className="text-lg font-black text-zinc-950 uppercase tracking-widest mb-6 border-b pb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#E52535]" /> 
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
                            ? 'bg-[#E52535] border-[#E52535] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        🏦 {language === 'en' ? 'Manual Pay' : 'ম্যানুয়াল পে'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDepositMethod('agent')}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedDepositMethod === 'agent'
                            ? 'bg-[#E52535] border-[#E52535] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        👥 {language === 'en' ? 'Local Agent' : 'লোকাল এজেন্ট'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDepositMethod('crypto')}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedDepositMethod === 'crypto'
                            ? 'bg-[#E52535] border-[#E52535] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
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
                                  ? 'bg-[#E52535] border-[#E52535] text-white shadow-md'
                                  : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
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

                      {/* Selector Box for Nagad, bKash, Rocket, Upay, Bank */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                          {language === 'en' ? 'Select Payment Method' : 'পেমেন্ট মাধ্যম সিলেক্ট করুন'}
                        </label>
                        <select
                          value={depositGatewayName}
                          onChange={(e) => setDepositGatewayName(e.target.value as any)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all cursor-pointer"
                        >
                          <option value="bKash">bKash / বিকাশ</option>
                          <option value="Nagad">Nagad / নগদ</option>
                          <option value="Rocket">Rocket / রকেট</option>
                          <option value="Upay">Upay / উপায়</option>
                          <option value="Bank">Bank / ব্যাংক</option>
                        </select>
                      </div>

                      {/* Matching dynamic gateway details */}
                      {(() => {
                        const matched = (siteConfig.paymentGateways || []).find(g => 
                          g.enabled && g.name.toLowerCase().replace(/\s/g, '').includes(depositGatewayName.toLowerCase())
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

                            <button
                              type="submit"
                              className="w-full bg-[#E52535] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
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
                              className="w-full bg-[#E52535] hover:bg-red-700 disabled:bg-red-400 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
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
                              <span className="text-[9px] font-black text-[#E52535] uppercase tracking-widest block mb-1">
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
                              className="w-full bg-[#E52535] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                            >
                              {language === 'en' ? 'SUBMIT CRYPTO DEPOSIT FOR VERIFICATION' : 'ক্রিপ্টো ডিপোজিট রিকোয়েস্ট পাঠান'}
                            </button>

                            <div className="mt-6 pt-6 border-t border-zinc-200/40 space-y-4">
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
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Bank Withdraw */}
            {activeTab === 'Bank Withdraw' && (
              <div className="space-y-6">
                <div className="bg-white border border-zinc-200/85 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
                  <h3 className="text-lg font-black text-zinc-950 uppercase tracking-widest mb-2 flex items-center gap-2 border-b pb-4">
                    <span className="text-[#E52535]">🏦</span> 
                    {language === 'en' ? 'Withdraw Funds' : 'উইথড্র করুন'}
                  </h3>
                  
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 leading-relaxed mb-6">
                    <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-amber-950">
                      ⚠️ {language === 'en' ? 'Commission Fee Requirement' : 'কমিশন ফি নোটিশ'}
                    </p>
                    <p>
                      {language === 'en' 
                        ? `A ${siteConfig.governmentFeePct ?? 10}% government commission fee applies. This fee will be deducted from your Commission Balance (Available Commission Balance: $${(user?.commissionBalance || 0).toFixed(2)}).`
                        : `আপনার উইথড্র পরিমাণের ওপর ${siteConfig.governmentFeePct ?? 10}% সরকারি কমিশন ফি প্রযোজ্য হবে। এই ফি-টি আপনার কমিশন ব্যালেন্স থেকে কাটা হবে (আপনার বর্তমান কমিশন ব্যালেন্স: $${(user?.commissionBalance || 0).toFixed(2)})।`}
                    </p>
                  </div>

                  {/* Withdrawal Method Selection */}
                  <div className="mb-6">
                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-2">
                      {language === 'en' ? 'Select Withdrawal Channel' : 'উইথড্র পদ্ধতি সিলেক্ট করুন'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedWithdrawMethod('manual_gateway')}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'manual_gateway'
                            ? 'bg-[#E52535] border-[#E52535] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        🏦 {language === 'en' ? 'Manual Pay' : 'ম্যানুয়াল উইথড্র'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedWithdrawMethod('agent')}
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'agent'
                            ? 'bg-[#E52535] border-[#E52535] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        👥 {language === 'en' ? 'Local Agent' : 'লোকাল এজেন্ট'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedWithdrawMethod('bank')} // using 'bank' as key for crypto withdraw to keep schema compatible or define custom flow
                        className={`py-3 px-1 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all uppercase tracking-wider ${
                          selectedWithdrawMethod === 'bank'
                            ? 'bg-[#E52535] border-[#E52535] text-white shadow-md scale-[1.02]'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                        }`}
                      >
                        🪙 {language === 'en' ? 'Crypto USDT' : 'ক্রিপ্টো USDT'}
                      </button>
                    </div>
                  </div>

                  {selectedWithdrawMethod === 'manual_gateway' && (
                    <form onSubmit={handleManualWithdrawalSubmit} className="space-y-6">
                      {/* Amount Input */}
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
                          className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-lg font-black outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all"
                          placeholder="0.00"
                          required
                        />
                        <p className="text-[10px] text-zinc-400 mt-1 font-semibold">
                          {language === 'en' 
                            ? `Minimum withdrawal amount: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}` 
                            : `সর্বনিম্ন উইথড্র পরিমাণ: $${(siteConfig.minWithdrawalAmount ?? 10).toFixed(2)}`}
                        </p>
                      </div>

                      {/* Method Selector */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-3">
                          {language === 'en' ? 'Select Payout Channel' : 'উইথড্র মাধ্যম সিলেক্ট করুন'}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {[
                            { key: 'bKash', label: 'bKash / বিকাশ', color: 'bg-[#E2125A]', text: 'text-white' },
                            { key: 'Nagad', label: 'Nagad / নগদ', color: 'bg-[#F26422]', text: 'text-white' },
                            { key: 'Rocket', label: 'Rocket / রকেট', color: 'bg-[#8C3494]', text: 'text-white' },
                            { key: 'Upay', label: 'Upay / উপায়', color: 'bg-[#1D60FF]', text: 'text-white' },
                            { key: 'Bank', label: 'Bank / ব্যাংক', color: 'bg-[#1C2C80]', text: 'text-white' }
                          ].map((m) => (
                            <button
                              key={m.key}
                              type="button"
                              onClick={() => setWithdrawGatewayName(m.key as any)}
                              className={`py-3.5 px-2 text-center font-bold text-[10px] sm:text-xs rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                                withdrawGatewayName === m.key
                                  ? `${m.color} border-transparent ${m.text} shadow-md scale-[1.03]`
                                  : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                              }`}
                            >
                              <span>{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Instruction Cards for selected withdrawal channel */}
                      {(() => {
                        const matched = (siteConfig.paymentGateways || []).find(g => 
                          g.enabled && g.name.toLowerCase().replace(/\s/g, '').includes(withdrawGatewayName.toLowerCase())
                        );

                        return (
                          <div className="animate-fade-in space-y-5 bg-zinc-50 border border-zinc-200/60 p-5 rounded-2xl">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-200">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                {language === 'en' ? 'Withdrawal Instructions' : 'উইথড্র নির্দেশনাবলী'}
                              </span>
                              <span className="bg-zinc-200/80 text-zinc-700 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-zinc-300">
                                Min Limit: ${matched?.minAmount || siteConfig.minWithdrawalAmount || 10}
                              </span>
                            </div>

                            {matched?.instructions && (
                              <div className="text-xs text-zinc-600 font-medium italic bg-white border border-zinc-150 p-4 rounded-xl">
                                <p className="font-bold text-zinc-700 not-italic mb-1 uppercase tracking-wider text-[9px]">Instructions:</p>
                                "{matched.instructions}"
                              </div>
                            )}

                            {/* Inputs */}
                            <div className="space-y-4">
                              {withdrawGatewayName === 'Bank' ? (
                                <>
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
                                        className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900"
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
                                        className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900"
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
                                        className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900 font-mono"
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
                                        className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900"
                                        required
                                      />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                                      Recipient {withdrawGatewayName} Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. 01712345678"
                                      value={withdrawPhoneOrAccount}
                                      onChange={(e) => setWithdrawPhoneOrAccount(e.target.value)}
                                      className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                                      Account Holder Name (Optional)
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Ashraful"
                                      value={withdrawAccountName}
                                      onChange={(e) => setWithdrawAccountName(e.target.value)}
                                      className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-950 text-zinc-900"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-[#E52535] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                            >
                              {language === 'en' ? 'SUBMIT WITHDRAWAL REQUEST' : 'উইথড্র রিকোয়েস্ট পাঠান'}
                            </button>
                          </div>
                        );
                      })()}
                    </form>
                  )}

                  {selectedWithdrawMethod === 'agent' && (
                    <form onSubmit={handleAgentWithdrawSubmit} className="space-y-6">
                      {/* Amount Input */}
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 block mb-1">
                          {language === 'en' ? 'Enter Withdrawal Amount ($)' : 'উইথড্র পরিমাণ লিখুন ($)'}
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="any"
                          value={bankWithdrawAmount}
                          onChange={(e) => setBankWithdrawAmount(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-lg font-black outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all"
                          placeholder="0.00"
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
                                setAgentWithdrawChannel(ch.name);
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
                            ? 'Contact an authorized local agent using the buttons above, share your account details, and enter your Agent Contact Reference below to initiate withdraw verification.' 
                            : 'ওপরের বাটনে ক্লিক করে লোকাল এজেন্টের সাথে যোগাযোগ করুন, আপনার অ্যাকাউন্ট ডিটেইলস শেয়ার করুন এবং নিচে ভেরিফিকেশনের জন্য রেফারেন্স আইডি দিন।'}
                        </p>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                            {language === 'en' ? 'Selected Agent Channel' : 'সিলেক্টেড এজেন্ট চ্যানেল'}
                          </label>
                          <select
                            value={agentWithdrawChannel}
                            onChange={(e) => setAgentWithdrawChannel(e.target.value)}
                            className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900"
                          >
                            <option value="WhatsApp">WhatsApp Agent</option>
                            <option value="IMO">IMO Agent</option>
                            <option value="Telegram">Telegram Agent</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 block mb-1">
                            {language === 'en' ? 'Agent Chat ID / Phone / Reference' : 'এজেন্ট চ্যাট আইডি / ফোন / রেফারেন্স'} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Chat reference with Agent"
                            value={agentWithdrawReference}
                            onChange={(e) => setAgentWithdrawReference(e.target.value)}
                            className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-zinc-950 hover:bg-zinc-900 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        {language === 'en' ? 'SUBMIT AGENT WITHDRAW REQUEST' : 'এজেন্ট উইথড্র রিকোয়েস্ট পাঠান'}
                      </button>
                    </form>
                  )}

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
                        
                        const govFeePct = siteConfig.governmentFeePct ?? 10;
                        const commissionNeeded = amt * (govFeePct / 100);
                        const currentComm = user.commissionBalance || 0;
                        
                        if (currentComm < commissionNeeded) {
                          alert(`⚠️ Insufficient Commission Balance! You need $${commissionNeeded.toFixed(2)} (${govFeePct}% of $${amt.toFixed(2)}) in your Commission Balance to authorize this withdrawal. Currently you have $${currentComm.toFixed(2)}.`);
                          return;
                        }

                        if (!withdrawPhoneOrAccount) {
                          alert("Please enter your USDT (TRC20) Recipient Wallet Address.");
                          return;
                        }

                        const nextBalance = user.balance - amt;
                        const nextCommission = parseFloat((currentComm - commissionNeeded).toFixed(2));
                        await updateUserProfileFields(user.email, { balance: nextBalance, commissionBalance: nextCommission });

                        if (addWithdrawalRequest) {
                          addWithdrawalRequest({
                            email: user.email,
                            amount: amt,
                            bankName: 'USDT (TRC20)',
                            iban: withdrawPhoneOrAccount,
                            accountName: user.name,
                            commissionDeducted: commissionNeeded
                          });
                        }

                        alert(`🎉 USDT Withdrawal request for $${amt.toFixed(2)} submitted successfully! ${govFeePct}% commission ($${commissionNeeded.toFixed(2)}) was deducted from your Commission Balance.`);
                        setWithdrawAmountInput('');
                        setWithdrawPhoneOrAccount('');
                        setActiveTab('Transactions');
                      }}
                      className="space-y-6"
                    >
                      {/* Amount Input */}
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
                          className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-lg font-black outline-none focus:border-zinc-950 focus:bg-white text-zinc-900 transition-all"
                          placeholder="0.00"
                          required
                        />
                      </div>

                      {/* USDT fields */}
                      <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl space-y-4">
                        <div className="text-xs text-zinc-600 font-medium italic bg-white border border-zinc-150 p-4 rounded-xl">
                          <p className="font-bold text-zinc-700 not-italic mb-1 uppercase tracking-wider text-[9px]">Instructions:</p>
                          "Withdrawals via USDT (TRC20) are processed within 1-2 hours. Please double check your wallet address before submitting. A 10% commission fee is deducted from your commission balance."
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
                            className="w-full bg-white border border-zinc-300 p-3 rounded-xl text-xs font-bold outline-none text-zinc-900 font-mono"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-[#E52535] hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]"
                      >
                        {language === 'en' ? 'SUBMIT CRYPTO WITHDRAWAL REQUEST' : 'ক্রিপ্টো উইথড্র রিকোয়েস্ট পাঠান'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Add Commission */}
            {activeTab === 'Add Commission' && (
              <div className="space-y-6">
                <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
                  <h3 className="text-lg font-black text-emerald-950 uppercase tracking-widest mb-2 flex items-center gap-2 border-b pb-4">
                    <span className="text-emerald-600">🪙</span> 
                    {language === 'en' ? 'Add Commission Balance' : 'কমিশন ব্যালেন্স অ্যাড করুন'}
                  </h3>
                  
                  <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl text-xs text-emerald-900 leading-relaxed mb-6">
                    <p className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-emerald-950">
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
                                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
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
                        onChange={(e) => setCommissionGatewayName(e.target.value as any)}
                        className="w-full bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-sm font-semibold outline-none focus:border-emerald-600 focus:bg-white text-zinc-900 transition-all cursor-pointer"
                      >
                        <option value="bKash">bKash / বিকাশ</option>
                        <option value="Nagad">Nagad / নগদ</option>
                        <option value="Rocket">Rocket / রকেট</option>
                        <option value="Upay">Upay / উপায়</option>
                        <option value="Bank">Bank / ব্যাংক</option>
                      </select>
                    </div>

                    {/* Gateway Instructions & Fields */}
                    {(() => {
                      const matched = (siteConfig.paymentGateways || []).find(g => 
                        g.enabled && g.name.toLowerCase().replace(/\s/g, '').includes(commissionGatewayName.toLowerCase())
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
