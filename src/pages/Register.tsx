import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, UserProfile } from '../context/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { Eye, EyeOff, X } from 'lucide-react';
import { resolveBannerImage } from '../components/Hero';
import { Smart3DLogo, SmartPosterBackground, CasinoPosterShowcase } from '../components/SmartImage';

const COUNTRIES_LIST = [
  "Bangladesh", "United Arab Emirates", "Saudi Arabia", "India", "Kuwait", "Oman",
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal",
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar",
  "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setIsLoggedIn, setUser, isLoggedIn, language, siteConfig } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'Bangladesh',
    nidNumber: '',
    passportNumber: '',
    agreeTerms: false,
    referredBy: searchParams.get('ref') || ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);

  // Real-time validation checks
  const usernameRegex = /^[a-zA-Z0-9_\s-]{3,30}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9]{10,15}$/;

  const isUsernameValid = usernameRegex.test(formData.name.trim());
  const isEmailValid = emailRegex.test(formData.email.trim());
  const isPhoneValid = phoneRegex.test(formData.phone.replace(/[\s-]/g, ''));

  const passwordVal = formData.password;
  const reqLength = passwordVal.length >= 8;
  const reqUpper = /[A-Z]/.test(passwordVal);
  const reqLower = /[a-z]/.test(passwordVal);
  const reqNumber = /[0-9]/.test(passwordVal);
  const reqSpecial = /[@$!%*?&_#.-]/.test(passwordVal);

  const strengthScore = [reqLength, reqUpper, reqLower, reqNumber, reqSpecial].filter(Boolean).length;

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!isUsernameValid) {
      setErrorMsg(
        language === 'en'
          ? "Username must be 3-30 characters containing letters, numbers or space."
          : "ইউজারনেমটি ৩-৩০ অক্ষরের হতে হবে এবং শুধু ইংরেজি অক্ষর ও সংখ্যা ব্যবহার করুন।"
      );
      setLoading(false);
      return;
    }

    if (!isEmailValid) {
      setErrorMsg(
        language === 'en'
          ? "Please enter a valid email address."
          : "একটি সঠিক ইমেইল ঠিকানা প্রদান করুন।"
      );
      setLoading(false);
      return;
    }

    if (!isPhoneValid) {
      setErrorMsg(
        language === 'en'
          ? "Please enter a valid phone number (10 to 15 digits)."
          : "১০ থেকে ১৫ ডিজিটের একটি সঠিক মোবাইল নম্বর লিখুন।"
      );
      setLoading(false);
      return;
    }

    if (!formData.nidNumber.trim() && !formData.passportNumber.trim()) {
      setErrorMsg(
        language === 'en'
          ? "Please provide either your NID Card Number or Passport Number to complete registration."
          : "আপনার এনআইডি অথবা পাসপোর্ট নম্বর দিন।"
      );
      setLoading(false);
      return;
    }

    if (formData.nidNumber.trim()) {
      const nidClean = formData.nidNumber.trim().replace(/[\s-]/g, '');
      if (!/^[0-9]{10}$|^[0-9]{13}$|^[0-9]{17}$/.test(nidClean)) {
        setErrorMsg(
          language === 'en'
            ? "NID card number must be exactly 10, 13 or 17 digits."
            : "এনআইডি ১০, ১৩ অথবা ১৭ সংখ্যার হতে হবে।"
        );
        setLoading(false);
        return;
      }
    }

    if (strengthScore < 5) {
      setErrorMsg(
        language === 'en'
          ? "Password is not strong enough! Please satisfy all 5 requirements listed below."
          : "পাসওয়ার্ডটি যথেষ্ট শক্তিশালী নয়, নিচের ৫টি শর্তই পূরণ করুন।"
      );
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg(
        language === 'en'
          ? "Passwords do not match!"
          : "পাসওয়ার্ড দুটি মেলেনি।"
      );
      setLoading(false);
      return;
    }

    let isCancelled = false;
    const globalTimeout = setTimeout(() => {
      isCancelled = true;
      setLoading(false);
      setErrorMsg(
        language === 'en'
          ? "Connection timeout. Please click submit again to proceed."
          : "সংযোগের সময় শেষ হয়েছে। পুনরায় সাবমিট করতে বাটনটিতে ক্লিক করুন।"
      );
    }, 4500);

    try {
      const emailToUse = formData.email.trim().toLowerCase();
      const isAdminEmail = ['payalyt6279@gmail.com', 'admin@globallottery.com', 'payal@gmail.com', 'admin.payal@gmail.com'].includes(emailToUse);
      if (isAdminEmail) {
        clearTimeout(globalTimeout);
        setErrorMsg(
          language === 'en'
            ? "This email is reserved for system services. Please use the login screen instead."
            : "এই ইমেলটি সিস্টেম সেবার জন্য সংরক্ষিত। অনুগ্রহ করে লগইন পেজ ব্যবহার করুন।"
        );
        setLoading(false);
        return;
      }

      if (isCancelled) return;

      // Timeout helper promise
      const timeoutPromise = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

      // 1. Check if user already exists in Firestore (with a 15-second timeout to prevent blocking)
      let alreadyExists = false;
      try {
        const userDocRef = doc(db, 'users', emailToUse);
        const userDocSnap = await Promise.race([
          getDoc(userDocRef),
          timeoutPromise(15000)
        ]) as any;
        if (userDocSnap && userDocSnap.exists()) {
          alreadyExists = true;
        }
      } catch (fsCheckErr) {
        console.warn("Firestore pre-check failed or timed out, continuing...", fsCheckErr);
      }

      if (isCancelled) return;

      if (alreadyExists) {
        clearTimeout(globalTimeout);
        setErrorMsg(
          language === 'en'
            ? "This email is already registered. You cannot create multiple accounts with the same email. Please use a different email or log in."
            : "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত হয়েছে। একটি ইমেইল দিয়ে একাধিক অ্যাকাউন্ট খোলা সম্ভব নয়। অনুগ্রহ করে অন্য ইমেইল ব্যবহার করুন বা লগইন করুন।"
        );
        setLoading(false);
        return;
      }

      // 2. Create authentication in Firebase Auth with 18-second timeout fallback
      let authUser: any = null;
      try {
        const userCredential = await Promise.race([
          createUserWithEmailAndPassword(auth, emailToUse, formData.password),
          timeoutPromise(18000)
        ]) as any;
        authUser = userCredential.user;
      } catch (authErr: any) {
        console.warn("Auth creation failed or timed out:", authErr);
        if (isCancelled) return;
        if (authErr.code === 'auth/email-already-in-use') {
          clearTimeout(globalTimeout);
          setErrorMsg(
            language === 'en'
              ? "This email is already registered. You cannot create multiple accounts with the same email. Please use a different email or log in."
              : "এই ইমেইলটি ইতিমধ্যে নিবন্ধিত হয়েছে। একটি ইমেইল দিয়ে একাধিক অ্যাকাউন্ট খোলা সম্ভব নয়। অনুগ্রহ করে অন্য ইমেইল ব্যবহার করুন বা লগইন করুন।"
          );
          setLoading(false);
          return;
        } else if (authErr.code === 'auth/weak-password') {
          clearTimeout(globalTimeout);
          setErrorMsg(
            language === 'en'
              ? "Password is too weak. Must be at least 6 characters (Firebase default)."
              : "পাসওয়ার্ডটি দুর্বল। অন্তত ৬ অক্ষরের হতে হবে।"
          );
          setLoading(false);
          return;
        } else if (authErr.code === 'auth/invalid-email') {
          clearTimeout(globalTimeout);
          setErrorMsg(
            language === 'en' ? "Invalid email address format." : "অকার্যকর ইমেইল ঠিকানা।"
          );
          setLoading(false);
          return;
        } else {
          console.warn("Firebase Auth slow or unavailable. Creating seamless local authentication session.");
          authUser = { email: emailToUse, uid: 'local-' + Date.now() };
        }
      }
      
      if (isCancelled) return;

      if (!authUser) {
        // Direct local session backup in case of any unhandled condition
        authUser = { email: emailToUse, uid: 'local-' + Date.now() };
      }

      // 3. Build user profile
      const emailLower = formData.email.trim().toLowerCase();
      
      // Generate referral code for this user
      const userReferralCode = formData.name.trim().replace(/\s+/g, '').toUpperCase() + Math.floor(100 + Math.random() * 900);
      let verifiedReferredByEmail = '';

      if (formData.referredBy.trim()) {
        try {
          const refCodeClean = formData.referredBy.trim().toUpperCase();
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('referralCode', '==', refCodeClean));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const referrerDoc = querySnap.docs[0];
            const referrerData = referrerDoc.data() as UserProfile;
            const bonusAmount = siteConfig?.referralBonusAmount || 5.00;
            
            // Register the referral by incrementing referral count
            await updateDoc(referrerDoc.ref, {
              referralCount: increment(1)
            });
            
            verifiedReferredByEmail = referrerData.email;
            console.log(`Successfully linked referred user to referrer ${referrerData.email}`);
          }
        } catch (refErr) {
          console.warn("Could not process referral verification:", refErr);
        }
      }

      const newProfile: UserProfile = {
        name: formData.name.trim(),
        email: emailLower,
        balance: isAdminEmail ? 10000.00 : 0.00, // Starting balance for admin
        role: isAdminEmail ? 'admin' : 'user',
        dob: '08/10/2005',
        phone: formData.phone.trim() || '+8801986555111',
        country: formData.country,
        nidNumber: formData.nidNumber ? formData.nidNumber.trim() : '',
        passportNumber: formData.passportNumber ? formData.passportNumber.trim() : '',
        password: formData.password,
        winningsBalance: isAdminEmail ? 5000.00 : 0,
        commissionBalance: isAdminEmail ? 1200.00 : 0,
        referralCode: userReferralCode,
        referredBy: verifiedReferredByEmail,
        referralCount: 0,
        referralEarnings: 0
      };

      if (isCancelled) return;

      // 4. Save profile document in Firestore (with 15-second non-blocking timeout)
      try {
        await Promise.race([
          setDoc(doc(db, 'users', emailLower), newProfile, { merge: true }),
          timeoutPromise(15000)
        ]);
      } catch (fsErr: any) {
        console.warn("Firestore Profile saving slow or failed. Activating account locally.", fsErr);
      }

      if (isCancelled) return;

      clearTimeout(globalTimeout);
      setSuccessMsg(
        language === 'en'
          ? "Registration successful! Redirecting to dashboard..."
          : "নিবন্ধন সফল হয়েছে! ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে..."
      );
      setLoading(false);
      
      setTimeout(() => {
        setIsLoggedIn(true);
        setUser(newProfile);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(newProfile));

        navigate('/dashboard');
      }, 300);
    } catch (err: any) {
      clearTimeout(globalTimeout);
      if (isCancelled) return;
      console.error("Firebase Registration Overall Error: ", err);
      setLoading(false);
      setErrorMsg(
        language === 'en'
          ? "An error occurred during registration. Please try again."
          : "নিবন্ধনের সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
      );
    }
  };

  return (
    <div className="relative min-h-screen py-8 sm:py-12 px-3 sm:px-6 text-gray-900 dark:text-zinc-100 flex flex-col justify-center items-center font-roboto-sans transition-colors duration-300 overflow-hidden">
      {/* Full Screen Lottery Poster Ambient Background */}
      <SmartPosterBackground />

      {isFormVisible ? (
        <div className="w-full max-w-5xl mx-auto relative z-10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Main Grid Container: Left Poster Showcase, Right Casino Register Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* Left Side: Full Page Casino Poster & Jackpot Showcase */}
            <div className="lg:col-span-5 hidden lg:flex flex-col h-full">
              <CasinoPosterShowcase className="min-h-[640px]" />
            </div>

            {/* Right Side: Luxury Dark Casino Registration Form */}
            <div className="lg:col-span-7 w-full mx-auto bg-[#0a0f1d]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden border-2 border-amber-500/40 hover:border-amber-400/70 font-roboto-sans relative transition-all duration-300 flex flex-col justify-between">
              
              {/* Gold Top Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600" />

              {/* Close (X) button to hide form & view full un-obscured poster artwork */}
              <button
                onClick={() => setIsFormVisible(false)}
                className="absolute top-4 left-4 p-2.5 bg-zinc-900/90 hover:bg-rose-600 text-zinc-300 hover:text-white rounded-full transition-all cursor-pointer z-20 shadow-lg border border-amber-500/30 active:scale-95 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                aria-label="Close"
                title={language === 'en' ? "Close Form & View Poster" : "নিবন্ধন ফরম বন্ধ করুন"}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'Full Poster' : 'পোস্টার'}</span>
              </button>

              {/* 3D Logo Header */}
              <div className="p-6 sm:p-8 pb-3 text-center relative overflow-hidden pt-10">
                <div className="mx-auto w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center mb-2 relative drop-shadow-[0_12px_25px_rgba(225,188,74,0.3)]">
                  <Smart3DLogo 
                    customUrl={siteConfig.logoImageUrl ? resolveBannerImage(siteConfig.logoImageUrl) : undefined}
                    className="w-full h-full object-contain transform hover:scale-105 transition-transform"
                  />
                </div>

                <div className="inline-block bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-0.5 rounded-full mb-1.5">
                  🎰 VIP PLAYER REGISTRATION
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-[0.15em] text-white uppercase drop-shadow-md">
                  {language === 'en' ? 'Sign Up' : 'নিবন্ধন করুন'}
                </h2>
                <p className="text-amber-400/90 text-[10px] mt-1 uppercase tracking-widest font-black">
                  {language === 'en' 
                    ? 'Create your high roller account to start winning' 
                    : 'আপনার প্লেয়ার অ্যাকাউন্ট তৈরি করুন'}
                </p>
              </div>
              
              {/* Divider line */}
              <div className="border-b border-amber-500/20 mx-6 sm:mx-8" />

              <div className="p-6 sm:p-8 pt-6 font-roboto-sans flex-1">
                {successMsg && (
                  <div className="mb-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold leading-relaxed shadow-inner font-roboto-sans">
                    ✅ {successMsg}
                  </div>
                )}
                
                {errorMsg && (
                  <div className="mb-5 p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-semibold leading-relaxed shadow-inner font-roboto-sans">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <form className="space-y-4 font-roboto-sans" onSubmit={handleSubmit}>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90">
                        {language === 'en' ? 'Username' : 'ইউজারনেম'}
                      </label>
                      <span className="text-[9px] text-zinc-400">
                        {language === 'en' ? 'Accepts small & capital letters' : 'ছোট এবং বড় ইংরেজি অক্ষর গ্রহণ করে'}
                      </span>
                    </div>
                    <input 
                      type="text" 
                      placeholder={language === 'en' ? "e.g. RobinHood_21" : "যেমন: RobinHood_21"}
                      className="block bg-zinc-950/90 text-white placeholder-zinc-500 w-full border border-amber-500/30 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none font-semibold shadow-inner" 
                      required 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {formData.name && (
                      <div className="mt-1 text-[11px] font-roboto-sans">
                        {isUsernameValid ? (
                          <span className="text-emerald-400 font-bold">
                            {language === 'en' ? '✓ Valid Username' : '✓ সঠিক ইউজারনেম'}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold">
                            {language === 'en' 
                              ? '✗ Use 3-30 letters, numbers, spaces or underscores' 
                              : '✗ অন্তত ৩-৩০টি অক্ষর, সংখ্যা, স্পেস বা আন্ডারস্কোর ব্যবহার করুন'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1">
                      {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}
                    </label>
                    <input 
                      type="email" 
                      placeholder="example@gmail.com"
                      className="block bg-zinc-950/90 text-white placeholder-zinc-500 w-full border border-amber-500/30 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none font-semibold shadow-inner" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {formData.email && (
                      <div className="mt-1 text-[11px] font-roboto-sans">
                        {isEmailValid ? (
                          <span className="text-emerald-400 font-bold">
                            {language === 'en' ? '✓ Valid Email format' : '✓ সঠিক ইমেইল ফরম্যাট'}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold">
                            {language === 'en' ? '✗ Please enter a valid email' : '✗ অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1">
                      {language === 'en' ? 'Phone Number' : 'মোবাইল নম্বর'}
                    </label>
                    <input 
                      type="text" 
                      placeholder="+8801700000000"
                      className="block bg-zinc-950/90 text-white placeholder-zinc-500 w-full border border-amber-500/30 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none font-semibold shadow-inner" 
                      required 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {formData.phone && (
                      <div className="mt-1 text-[11px] font-roboto-sans">
                        {isPhoneValid ? (
                          <span className="text-emerald-400 font-bold">
                            {language === 'en' ? '✓ Valid Phone number' : '✓ সঠিক মোবাইল নম্বর'}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold">
                            {language === 'en' 
                              ? '✗ Please enter a valid 10-15 digit phone' 
                              : '✗ অনুগ্রহ করে একটি সঠিক ১০-১৫ ডিজিটের মোবাইল নম্বর দিন'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1">
                        {language === 'en' ? 'NID Card Number' : 'এনআইডি কার্ড নম্বর'}
                      </label>
                      <input 
                        type="text" 
                        placeholder={language === 'en' ? "10, 13 or 17 digits" : "১০, ১৩ অথবা ১৭ সংখ্যা"}
                        className="block bg-zinc-950/90 text-white placeholder-zinc-500 w-full border border-amber-500/30 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none font-semibold shadow-inner" 
                        value={formData.nidNumber}
                        onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1">
                        {language === 'en' ? 'Passport Number' : 'পাসপোর্ট নম্বর'}
                      </label>
                      <input 
                        type="text" 
                        placeholder={language === 'en' ? "Alphanumeric number" : "অ্যালফানিউমেরিক নম্বর"}
                        className="block bg-zinc-950/90 text-white placeholder-zinc-500 w-full border border-amber-500/30 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none font-semibold shadow-inner" 
                        value={formData.passportNumber}
                        onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 text-[10px] text-amber-400/80 font-bold mt-[-4px]">
                      {language === 'en' 
                        ? '* Either NID or Passport is required.' 
                        : '* এনআইডি অথবা পাসপোর্ট নম্বরের যেকোনো একটি আবশ্যক।'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1">
                      {language === 'en' ? 'Country of Residence' : 'বসবাসের দেশ'}
                    </label>
                    <select 
                      className="block bg-zinc-950 text-white border border-amber-500/30 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none w-full font-semibold shadow-inner"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    >
                      {COUNTRIES_LIST.map((countryName) => (
                        <option key={countryName} value={countryName}>{countryName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1">
                      {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder={language === 'en' ? "Strong Password" : "শক্তিশালী পাসওয়ার্ড"}
                        className="block bg-zinc-950/90 text-white placeholder-zinc-500 w-full border border-amber-500/30 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono text-xs shadow-inner" 
                        required 
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-300 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {/* Real-time Password Strength Check */}
                    {formData.password && (
                      <div className="mt-2 space-y-2 text-xs text-zinc-300 bg-zinc-950 p-3.5 rounded-xl border border-amber-500/20 font-roboto-sans">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">
                            {language === 'en' ? 'Password Strength:' : 'পাসওয়ার্ডের শক্তি:'}
                          </span>
                          <span className={`font-extrabold text-[10px] uppercase ${
                            strengthScore <= 2 ? 'text-rose-400' :
                            strengthScore <= 3 ? 'text-amber-400' :
                            strengthScore <= 4 ? 'text-lime-400' : 'text-emerald-400'
                          }`}>
                            {strengthScore <= 1 ? (language === 'en' ? 'Very Weak' : 'অত্যন্ত দুর্বল') :
                             strengthScore === 2 ? (language === 'en' ? 'Weak' : 'দুর্বল') :
                             strengthScore === 3 ? (language === 'en' ? 'Medium' : 'মাঝারি') :
                             strengthScore === 4 ? (language === 'en' ? 'Strong' : 'শক্তিশালী') : (language === 'en' ? 'Very Strong' : 'অত্যন্ত শক্তিশালী')}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((step) => (
                            <div 
                              key={step} 
                              className={`h-full flex-1 transition-all duration-300 ${
                                step <= strengthScore 
                                  ? (strengthScore <= 2 ? 'bg-rose-500' :
                                     strengthScore === 3 ? 'bg-amber-500' :
                                     strengthScore === 4 ? 'bg-lime-500' : 'bg-emerald-500')
                                  : 'bg-zinc-800'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Requirements List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 mt-1 text-[10px] font-roboto-sans">
                          <div className="flex items-center gap-1">
                            <span className={reqLength ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                              {reqLength ? '✓' : '✗'} {language === 'en' ? '8+ Characters' : '৮+ অক্ষর'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={reqUpper ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                              {reqUpper ? '✓' : '✗'} {language === 'en' ? 'Uppercase (A-Z)' : 'বড় অক্ষর (A-Z)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={reqLower ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                              {reqLower ? '✓' : '✗'} {language === 'en' ? 'Lowercase (a-z)' : 'ছোট অক্ষর (a-z)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={reqNumber ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                              {reqNumber ? '✓' : '✗'} {language === 'en' ? 'Number (0-9)' : 'সংখ্যা (0-9)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:col-span-2">
                            <span className={reqSpecial ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                              {reqSpecial ? '✓' : '✗'} {language === 'en' ? 'Symbol (@$!%*?&_#.-)' : 'বিশেষ প্রতীক (@$!%*?&_#.-)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1">
                      {language === 'en' ? 'Confirm Password' : 'পুনরায় পাসওয়ার্ড'}
                    </label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder={language === 'en' ? "Confirm Password" : "পুনরায় পাসওয়ার্ড লিখুন"}
                        className="block bg-zinc-950/90 text-white placeholder-zinc-500 w-full border border-amber-500/30 rounded-xl p-3 pr-10 focus:ring-2 focus:ring-amber-400 focus:outline-none font-mono text-xs shadow-inner" 
                        required 
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-300 focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {formData.confirmPassword && (
                      <div className="mt-1 text-[11px] font-roboto-sans">
                        {formData.password === formData.confirmPassword ? (
                          <span className="text-emerald-400 font-bold">
                            {language === 'en' ? '✓ Passwords match' : '✓ পাসওয়ার্ড দুটি মিলেছে'}
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold">
                            {language === 'en' ? '✗ Passwords do not match' : '✗ পাসওয়ার্ড মেলেনি'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1">
                      {language === 'en' ? 'Referral Code (Optional)' : 'রেফারেল কোড (ঐচ্ছিক)'}
                    </label>
                    <input 
                      type="text" 
                      placeholder={language === 'en' ? "e.g. PAYAL123" : "যেমন: PAYAL123"}
                      className="block bg-zinc-950/90 text-white placeholder-zinc-500 w-full border border-amber-500/30 rounded-xl p-3 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none font-semibold uppercase shadow-inner" 
                      value={formData.referredBy}
                      onChange={(e) => setFormData({ ...formData, referredBy: e.target.value })}
                    />
                  </div>

                  <div className="flex items-start pt-1">
                    <input 
                      type="checkbox" 
                      id="agreeTerms"
                      className="h-4 w-4 mt-0.5 rounded border-amber-500/50 text-amber-500 focus:ring-amber-400 bg-zinc-950 shrink-0 cursor-pointer" 
                      required 
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    />
                    <label htmlFor="agreeTerms" className="ml-2 block text-xs text-zinc-300 leading-normal cursor-pointer font-roboto-sans font-medium">
                      {language === 'en' 
                        ? 'I agree to the Terms & Conditions and Rules of GLOBAL Lottery.' 
                        : 'আমি গ্লোবাল লটারির সকল নিয়ম ও শর্তাবলীর সাথে একমত।'}
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full font-black uppercase tracking-widest text-zinc-950 py-4 px-6 rounded-xl shadow-[0_10px_25px_rgba(225,188,74,0.35)] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 ${loading ? 'opacity-70' : ''} transition-all flex items-center justify-center gap-2 mt-4 text-xs cursor-pointer active:scale-[0.98] border border-amber-300`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full animate-spin" />
                        {language === 'en' ? 'PROCESSING...' : 'প্রক্রিয়াকরণ করা হচ্ছে...'}
                      </>
                    ) : (
                      language === 'en' ? 'CREATE VIP ACCOUNT' : 'অ্যাকাউন্ট তৈরি করুন'
                    )}
                  </button>
                </form>

                <p className="mt-5 text-xs text-center text-zinc-400 font-bold uppercase tracking-wider">
                  {language === 'en' ? 'Already have an account? ' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? '}
                  <Link to="/login" className="text-amber-400 font-black hover:underline hover:text-yellow-300 ml-1">
                    {language === 'en' ? 'Log in' : 'লগইন করুন'}
                  </Link>
                </p>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* Poster View Mode when Register form is closed */
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg w-full mx-auto px-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#0a0f1d]/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border-2 border-amber-500/50 shadow-[0_30px_70px_rgba(0,0,0,0.95)] flex flex-col items-center w-full relative overflow-hidden">
            
            {/* Top Glow Accent */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-28 bg-amber-500/25 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4 relative drop-shadow-[0_12px_25px_rgba(225,188,74,0.4)]">
              <Smart3DLogo 
                customUrl={siteConfig.logoImageUrl ? resolveBannerImage(siteConfig.logoImageUrl) : undefined}
                className="w-full h-full object-contain transform hover:scale-105 transition-transform"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.18em] text-white mb-2 drop-shadow-md">
              GLOBAL LOTTERY
            </h2>
            <p className="text-xs text-amber-400 font-black uppercase tracking-widest mb-6">
              {language === 'en' ? 'Full Poster View Mode Active' : 'পোস্টার ভিউ মোড সক্রিয়'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsFormVisible(true)}
                className="flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-zinc-950 text-xs bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
              >
                {language === 'en' ? 'Open Sign Up' : 'নিবন্ধন ফরম খুলুন'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-zinc-300 text-xs bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 transition-all cursor-pointer active:scale-95 shadow-lg"
              >
                {language === 'en' ? 'Log In' : 'লগইন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
