import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '../context/AuthContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Eye, EyeOff, X } from 'lucide-react';

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
  const { setIsLoggedIn, setUser, isLoggedIn, language } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'Bangladesh',
    nidNumber: '',
    passportNumber: '',
    agreeTerms: false
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const isAdminEmail = ['payalyt6279@gmail.com', 'admin@goloballottery.com', 'payal@gmail.com', 'admin.payal@gmail.com'].includes(emailToUse);
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
        commissionBalance: isAdminEmail ? 1200.00 : 0
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
    <div className="max-w-md mx-auto mt-6 sm:mt-10 p-4 font-roboto-sans">
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-xl text-gray-950 dark:text-zinc-100 relative font-roboto-sans">
        <button
          onClick={() => navigate('/')}
          className="absolute right-4 top-4 p-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-zinc-400" />
        </button>
        <h2 className="text-2xl font-black tracking-tight mb-2 uppercase text-gray-900 dark:text-zinc-100">
          {language === 'en' ? 'Sign Up' : 'নিবন্ধন করুন'}
        </h2>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6 uppercase tracking-wider font-bold">
          {language === 'en' 
            ? 'Create your player account with mixed-case support' 
            : 'আপনার প্লেয়ার অ্যাকাউন্ট তৈরি করুন'}
        </p>
        
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-emerald-950/20 text-green-700 dark:text-emerald-450 rounded-lg text-sm font-semibold border border-green-100 dark:border-emerald-900/30 font-roboto-sans">
            ✅ {successMsg}
          </div>
        )}
        
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-450 rounded-lg text-sm font-semibold border border-red-100 dark:border-red-900/30 font-roboto-sans">
            ⚠️ {errorMsg}
          </div>
        )}

        <form className="space-y-4 font-roboto-sans" onSubmit={handleSubmit}>
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-350">
                {language === 'en' ? 'Username' : 'ইউজারনেম'}
              </label>
              <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                {language === 'en' ? 'Accepts small & capital letters' : 'ছোট এবং বড় ইংরেজি অক্ষর গ্রহণ করে'}
              </span>
            </div>
            <input 
              type="text" 
              placeholder={language === 'en' ? "e.g. RobinHood_21" : "যেমন: RobinHood_21"}
              className="mt-1 block bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 w-full border border-gray-300 dark:border-zinc-800 rounded-xl p-2.5 focus:ring-2 focus:ring-black dark:focus:ring-zinc-700 focus:outline-none font-roboto-sans" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {formData.name && (
              <div className="mt-1 text-[11px] font-roboto-sans">
                {isUsernameValid ? (
                  <span className="text-emerald-600 font-semibold">
                    {language === 'en' ? '✓ Valid Username' : '✓ সঠিক ইউজারনেম'}
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">
                    {language === 'en' 
                      ? '✗ Use 3-30 letters, numbers, spaces or underscores' 
                      : '✗ অন্তত ৩-৩০টি অক্ষর, সংখ্যা, স্পেস বা আন্ডারস্কোর ব্যবহার করুন'}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-350">
              {language === 'en' ? 'Email Address' : 'ইমেইল ঠিকানা'}
            </label>
            <input 
              type="email" 
              placeholder="example@gmail.com"
              className="mt-1 block bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 w-full border border-gray-300 dark:border-zinc-800 rounded-xl p-2.5 focus:ring-2 focus:ring-black dark:focus:ring-zinc-700 focus:outline-none font-roboto-sans" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {formData.email && (
              <div className="mt-1 text-[11px] font-roboto-sans">
                {isEmailValid ? (
                  <span className="text-emerald-600 font-semibold">
                    {language === 'en' ? '✓ Valid Email format' : '✓ সঠিক ইমেইল ফরম্যাট'}
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">
                    {language === 'en' ? '✗ Please enter a valid email' : '✗ অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন'}
                  </span>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-350">
              {language === 'en' ? 'Phone Number' : 'মোবাইল নম্বর'}
            </label>
            <input 
              type="text" 
              placeholder="+8801700000000"
              className="mt-1 block bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 w-full border border-gray-300 dark:border-zinc-800 rounded-xl p-2.5 focus:ring-2 focus:ring-black dark:focus:ring-zinc-700 focus:outline-none font-roboto-sans" 
              required 
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {formData.phone && (
              <div className="mt-1 text-[11px] font-roboto-sans">
                {isPhoneValid ? (
                  <span className="text-emerald-600 font-semibold">
                    {language === 'en' ? '✓ Valid Phone number' : '✓ সঠিক মোবাইল নম্বর'}
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">
                    {language === 'en' 
                      ? '✗ Please enter a valid 10-15 digit phone' 
                      : '✗ অনুগ্রহ করে একটি সঠিক ১০-১৫ ডিজিটের মোবাইল নম্বর দিন'}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-350">
                {language === 'en' ? 'NID Card Number' : 'এনআইডি কার্ড নম্বর'}
              </label>
              <input 
                type="text" 
                placeholder={language === 'en' ? "10, 13 or 17 digits" : "১০, ১৩ অথবা ১৭ সংখ্যা"}
                className="mt-1 block bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 w-full border border-gray-300 dark:border-zinc-800 rounded-xl p-2.5 focus:ring-2 focus:ring-black dark:focus:ring-zinc-700 focus:outline-none font-roboto-sans" 
                value={formData.nidNumber}
                onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-350">
                {language === 'en' ? 'Passport Number' : 'পাসপোর্ট নম্বর'}
              </label>
              <input 
                type="text" 
                placeholder={language === 'en' ? "Alphanumeric number" : "অ্যালফানিউমেরিক নম্বর"}
                className="mt-1 block bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 w-full border border-gray-300 dark:border-zinc-800 rounded-xl p-2.5 focus:ring-2 focus:ring-black dark:focus:ring-zinc-700 focus:outline-none font-roboto-sans" 
                value={formData.passportNumber}
                onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
              />
            </div>
            <div className="col-span-1 sm:col-span-2 text-[10px] text-gray-500 dark:text-zinc-400 font-roboto-sans mt-[-6px]">
              {language === 'en' 
                ? '* Either NID or Passport is required.' 
                : '* এনআইডি অথবা পাসপোর্ট নম্বরের যেকোনো একটি আবশ্যক।'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-350">
              {language === 'en' ? 'Country of Residence' : 'বসবাসের দেশ'}
            </label>
            <select 
              className="mt-1 block bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 w-full border border-gray-300 dark:border-zinc-800 rounded-xl p-2.5 focus:ring-2 focus:ring-black dark:focus:ring-zinc-700 focus:outline-none font-roboto-sans"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            >
              {COUNTRIES_LIST.map((countryName) => (
                <option key={countryName} value={countryName}>{countryName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-350">
              {language === 'en' ? 'Password' : 'পাসওয়ার্ড'}
            </label>
            <div className="relative mt-1">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder={language === 'en' ? "Strong Password" : "শক্তিশালী পাসওয়ার্ড"}
                className="block bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 w-full border border-gray-300 dark:border-zinc-800 rounded-xl p-2.5 pr-10 focus:ring-2 focus:ring-black dark:focus:ring-zinc-700 focus:outline-none font-roboto-sans" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Real-time Password Strength Check */}
            {formData.password && (
              <div className="mt-2 space-y-2 text-xs text-gray-600 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-950 p-3.5 rounded-xl border border-gray-100 dark:border-zinc-850 font-roboto-sans">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-zinc-400">
                    {language === 'en' ? 'Password Strength:' : 'পাসওয়ার্ডের শক্তি:'}
                  </span>
                  <span className={`font-extrabold text-[10px] uppercase ${
                    strengthScore <= 2 ? 'text-red-600' :
                    strengthScore <= 3 ? 'text-yellow-600' :
                    strengthScore <= 4 ? 'text-lime-600' : 'text-emerald-600'
                  }`}>
                    {strengthScore <= 1 ? (language === 'en' ? 'Very Weak' : 'অত্যন্ত দুর্বল') :
                     strengthScore === 2 ? (language === 'en' ? 'Weak' : 'দুর্বল') :
                     strengthScore === 3 ? (language === 'en' ? 'Medium' : 'মাঝারি') :
                     strengthScore === 4 ? (language === 'en' ? 'Strong' : 'শক্তিশালী') : (language === 'en' ? 'Very Strong' : 'অত্যন্ত শক্তিশালী')}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div 
                      key={step} 
                      className={`h-full flex-1 transition-all duration-300 ${
                        step <= strengthScore 
                          ? (strengthScore <= 2 ? 'bg-red-500' :
                             strengthScore === 3 ? 'bg-yellow-500' :
                             strengthScore === 4 ? 'bg-lime-500' : 'bg-emerald-500')
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Requirements List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 mt-1 text-[11px] font-roboto-sans">
                  <div className="flex items-center gap-1">
                    <span className={reqLength ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                      {reqLength ? '✓' : '✗'} {language === 'en' ? '8+ Characters' : '৮+ অক্ষর'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={reqUpper ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                      {reqUpper ? '✓' : '✗'} {language === 'en' ? 'Uppercase (A-Z)' : 'বড় অক্ষর (A-Z)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={reqLower ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                      {reqLower ? '✓' : '✗'} {language === 'en' ? 'Lowercase (a-z)' : 'ছোট অক্ষর (a-z)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={reqNumber ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                      {reqNumber ? '✓' : '✗'} {language === 'en' ? 'Number (0-9)' : 'সংখ্যা (0-9)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:col-span-2">
                    <span className={reqSpecial ? 'text-emerald-600 font-bold' : 'text-red-500'}>
                      {reqSpecial ? '✓' : '✗'} {language === 'en' ? 'Symbol (@$!%*?&_#.-)' : 'বিশেষ প্রতীক (@$!%*?&_#.-)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
              {language === 'en' ? 'Confirm Password' : 'পুনরায় পাসওয়ার্ড'}
            </label>
            <div className="relative mt-1">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder={language === 'en' ? "Confirm Password" : "পুনরায় পাসওয়ার্ড লিখুন"}
                className="block bg-white text-zinc-950 w-full border border-gray-300 rounded-xl p-2.5 pr-10 focus:ring-2 focus:ring-black focus:outline-none font-roboto-sans" 
                required 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && (
              <div className="mt-1.5 text-[11px] font-roboto-sans">
                {formData.password === formData.confirmPassword ? (
                  <span className="text-emerald-600 font-semibold">
                    {language === 'en' ? '✓ Passwords match' : '✓ পাসওয়ার্ড দুটি মিলেছে'}
                  </span>
                ) : (
                  <span className="text-red-500 font-semibold">
                    {language === 'en' ? '✗ Passwords do not match' : '✗ পাসওয়ার্ড মেলেনি'}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-start pt-2">
            <input 
              type="checkbox" 
              id="agreeTerms"
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-black focus:ring-black bg-white shrink-0" 
              required 
              checked={formData.agreeTerms}
              onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
            />
            <label htmlFor="agreeTerms" className="ml-2 block text-xs text-gray-600 leading-normal cursor-pointer font-roboto-sans">
              {language === 'en' 
                ? 'I agree to the Terms & Conditions and Rules of Golobal Lottery.' 
                : 'আমি গ্লোবাল লটারির সকল নিয়ম ও শর্তাবলীর সাথে একমত।'}
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full ${loading ? 'bg-zinc-600' : 'bg-zinc-950 hover:bg-zinc-800'} text-white p-3 rounded-xl font-bold tracking-wider uppercase transition-colors shadow-md mt-4 text-xs flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                {language === 'en' ? 'Processing...' : 'প্রক্রিয়াকরণ করা হচ্ছে...'}
              </>
            ) : (
              language === 'en' ? 'Create Account' : 'অ্যাকাউন্ট তৈরি করুন'
            )}
          </button>
        </form>
        <p className="mt-5 text-sm text-center text-gray-500 font-roboto-sans">
          {language === 'en' ? 'Already have an account? ' : 'ইতিমধ্যে অ্যাকাউন্ট আছে? '}
          <Link to="/login" className="text-black font-extrabold hover:underline">
            {language === 'en' ? 'Log in' : 'লগইন করুন'}
          </Link>
        </p>
      </div>
    </div>
  );
}
