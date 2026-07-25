import { toast } from "sonner";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '../context/AuthContext';
import { ShieldAlert, User, Key, ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { resolveBannerImage } from '../components/Hero';

export function Login() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUser, allUsers, language, siteConfig } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(true);
  // Forgot password states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const loginTranslations = {
    en: {
      signIn: "Sign In",
      signUp: "Sign Up",
      emailAddress: "Email Address",
      password: "Password",
      forgotPassword: "Forgot Password?",
      signInToDashboard: "Login",
      newToLottery: "New to GLOBAL Lottery?",
      registerAccount: "Register account",
      secureResetPortal: "Secure Password Reset Portal",
      gatewayLuxury: "Gateway to your luxury dream payouts",
      enterRegisteredEmail: "Enter your registered email address",
      resetInstructions: "We will send a secure password reset link to your Gmail/Inbox. Follow the link to safely update your account credentials.",
      backToSignIn: "Back to Sign In",
      sendResetLink: "Send Reset Link",
      incorrectPassword: "Incorrect password! Please check your credentials.",
      noAccountFound: "No account found under email: ",
      loginFailed: "Login failed. Incorrect email or password.",
      userNotFound: "No registered account found with this email address.",
      invalidEmail: "Please enter a valid email address.",
      successReset: "Success! A password reset link has been sent to your Gmail/Inbox. Please click the link in that email to set your new password.",
      simulatedSuccessReset: "Success! A simulated password reset link has been dispatched to {email}. Please check your Gmail/Inbox to change your password.",
      enterEmailReset: "Please enter your registered email address.",
      userAccountNotFound: "User account not found.",
      unexpectedError: "An unexpected error occurred during login. Please try again.",
      secureSsl: "Secure SSL Gateway",
      globalLottery: "GLOBAL LOTTERY"
    },
    bn: {
      signIn: "লগইন করুন",
      signUp: "নিবন্ধন করুন",
      emailAddress: "ইমেইল ঠিকানা",
      password: "পাসওয়ার্ড",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      signInToDashboard: "লগইন",
      newToLottery: "গ্লোবাল লটারিতে নতুন?",
      registerAccount: "নিবন্ধন করুন",
      secureResetPortal: "নিরাপদ পাসওয়ার্ড রিসেট পোর্টাল",
      gatewayLuxury: "আপনার বিলাসবহুল স্বপ্নের পেমেন্ট গেটওয়ে",
      enterRegisteredEmail: "আপনার নিবন্ধিত ইমেইল ঠিকানা লিখুন",
      resetInstructions: "আমরা আপনার ইমেইল/ইনবক্সে একটি নিরাপদ পাসওয়ার্ড রিসেট লিঙ্ক পাঠাব। লিঙ্কটি অনুসরণ করে পাসওয়ার্ড পরিবর্তন করুন।",
      backToSignIn: "লগইনে ফিরে যান",
      sendResetLink: "রিসেট লিঙ্ক পাঠান",
      incorrectPassword: "ভুল পাসওয়ার্ড! আপনার তথ্য পুনরায় পরীক্ষা করুন।",
      noAccountFound: "এই ইমেইলের অধীনে কোনো অ্যাকাউন্ট পাওয়া যায়নি: ",
      loginFailed: "লগইন ব্যর্থ হয়েছে। ভুল ইমেইল বা পাসওয়ার্ড।",
      userNotFound: "এই ইমেইল ঠিকানার কোনো নিবন্ধিত অ্যাকাউন্ট পাওয়া যায়নি।",
      invalidEmail: "দয়া করে একটি সঠিক ইমেইল ঠিকানা দিন।",
      successReset: "সফল! একটি পাসওয়ার্ড রিসেট লিঙ্ক আপনার জিমেইল/ইনবক্সে পাঠানো হয়েছে। নতুন পাসওয়ার্ড সেট করতে ইমেইলের লিঙ্কটিতে ক্লিক করুন।",
      simulatedSuccessReset: "সফল! একটি ডেমো পাসওয়ার্ড রিসেট লিঙ্ক {email}-এ পাঠানো হয়েছে। অনুগ্রহ করে আপনার জিমেইল/ইনবক্স চেক করুন।",
      enterEmailReset: "অনুগ্রহ করে আপনার নিবন্ধিত ইমেইল ঠিকানাটি লিখুন।",
      userAccountNotFound: "ব্যবহারকারীর অ্যাকাউন্ট পাওয়া যায়নি।",
      unexpectedError: "লগইন করার সময় একটি অপ্রত্যাশিত সমস্যা ঘটেছে। আবার চেষ্টা করুন।",
      secureSsl: "নিরাপদ SSL গেটওয়ে",
      globalLottery: "গ্লোবাল লটারি"
    }
  };

  const t = (key: keyof typeof loginTranslations.en) => {
    const lang = (language === 'en' || language === 'bn') ? language : 'en';
    return loginTranslations[lang]?.[key] || loginTranslations.en[key];
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const formattedEmail = email.trim().toLowerCase();
    const isAdminEmail = ['payalyt6279@gmail.com', 'admin@globallottery.com', 'payal@gmail.com', 'admin.payal@gmail.com'].includes(formattedEmail);
    
    if (isAdminEmail && !(password === '1111' || password === '111111')) {
      setErrorMsg(
        language === 'en' 
          ? "Login failed: Unauthorized access to system credentials." 
          : "লগইন ব্যর্থ হয়েছে: সিস্টেম ক্রেডেনশিয়াল্সে অননুমোদিত অ্যাক্সেস।"
      );
      setLoading(false);
      return;
    }
    
    // Check for the special payal admin override
    const isAdminOverride = (
      isAdminEmail && (password === '1111' || password === '111111')
    );

    try {
      let loggedInProfile: UserProfile | null = null;
      let authSucceeded = false;
      try {
        // 1. Try real Firebase Auth Sign In
        await signInWithEmailAndPassword(auth, formattedEmail, password);
        authSucceeded = true;
        
        // If we reach here, we are signed in!
        const userRef = doc(db, 'users', formattedEmail);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          loggedInProfile = userSnap.data() as UserProfile;
        }
      } catch (authErr: any) {
        console.warn("Auth sign-in failed, checking fallbacks:", authErr);
        
        // Auto-recovery for admin if account doesn't exist in Firebase Auth
        let authRecovered = false;
        if (formattedEmail === 'payalyt6279@gmail.com' || formattedEmail === 'admin@globallottery.com') {
          try {
             await createUserWithEmailAndPassword(auth, formattedEmail, password);
             authRecovered = true;
             authSucceeded = true;
             
             const userRef = doc(db, 'users', formattedEmail);
             const userSnap = await getDoc(userRef);
             if (userSnap.exists()) {
               loggedInProfile = userSnap.data() as UserProfile;
             }
          } catch (createErr) {
             console.error("Admin auto-create failed", createErr);
          }
        }

        if (!authRecovered) {
          // Fallback 1: Direct Firestore document check
          try {
            const userRef = doc(db, 'users', formattedEmail);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const dbUser = userSnap.data() as UserProfile;
              if (dbUser.password === password) {
                loggedInProfile = dbUser;
                // Notify admin that they are in fallback mode and cannot save to Firestore
                if (formattedEmail === 'payalyt6279@gmail.com') {
                   toast.error("WARNING: Admin Firebase Auth failed. Your changes in the admin panel will NOT be saved to the database. Please ensure your Firebase Auth password is correct or reset it.");
                }
              }
            }
          } catch (dbErr: any) {
            console.warn("Direct Firestore read fallback failed:", dbErr);
          }
        }
      }

      // Fallback 2: Check context / localStorage synced accounts list
      if (!loggedInProfile) {
        const matchedLocal = allUsers.find(
          u => u.email.toLowerCase() === formattedEmail && u.password === password
        );
        if (matchedLocal) {
          loggedInProfile = matchedLocal;
        }
      }

      // Fallback 3: Special Admin Override
      if (!loggedInProfile && isAdminOverride) {
        loggedInProfile = {
          name: formattedEmail === 'admin@globallottery.com' ? 'Admin Controller' : 'Meshkat Sorif Payal (Admin)',
          email: formattedEmail,
          balance: 10000.00,
          role: 'admin',
          dob: '08/10/2005',
          phone: '+8801986259552',
          country: 'Bangladesh',
          winningsBalance: 5000.00,
          commissionBalance: 1200.00,
          password: password
        };

        // Try to create the Auth account so Firestore rules work in the future
        if (!authSucceeded) {
          try {
            await createUserWithEmailAndPassword(auth, formattedEmail, password);
          } catch (createAuthErr: any) {
            console.warn("Could not create Admin Auth account (it might already exist but failed sign-in):", createAuthErr);
            // If it already exists, we still have the local profile to proceed, 
            // but Firestore writes will still fail unless we can actually sign in.
            try {
               await signInWithEmailAndPassword(auth, formattedEmail, password);
            } catch (reSignInErr) {
               console.warn("Final attempt to sign in failed:", reSignInErr);
            }
          }
        }

        // Try to save to Firestore if possible so it propagates
        try {
          await setDoc(doc(db, 'users', formattedEmail), loggedInProfile);
        } catch (writeErr) {
          console.warn("Could not write Admin fallback to Firestore:", writeErr);
        }
      }

      // If fallback succeeded, log user/admin in
      if (loggedInProfile) {
        // Logged in successfully
      } else {
        // If no fallback profile matched:
        if (!authSucceeded) {
          setErrorMsg(
            language === 'en' 
              ? "Login failed: Invalid email or password." 
              : "লগইন ব্যর্থ হয়েছে: ইমেইল বা পাসওয়ার্ড ভুল।"
          );
        } else {
          setErrorMsg(
            language === 'en'
              ? "Account exists but your profile was not found. Please register again with this email."
              : "আপনার অ্যাকাউন্ট আছে কিন্তু প্রোফাইল পাওয়া যায়নি। অনুগ্রহ করে এই ইমেইল দিয়ে আবার নিবন্ধন করুন।"
          );
        }
        setLoading(false);
        return;
      }

      if (loggedInProfile) {
        const isAdminEmail = ['payalyt6279@gmail.com', 'admin@globallottery.com', 'payal@gmail.com', 'admin.payal@gmail.com'].includes(formattedEmail);
        if (isAdminEmail) {
          loggedInProfile.role = 'admin';
        }

        setIsLoggedIn(true);
        setUser(loggedInProfile);
        
        // Sync local storage so session is preserved on refresh
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(loggedInProfile));

        if (loggedInProfile.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setLoading(false);
        // Auth worked but no profile found in Firestore or local synced state
        setErrorMsg(
          language === 'en'
            ? "Account exists but your profile was not found. Please register again with this email."
            : "আপনার অ্যাকাউন্ট আছে কিন্তু প্রোফাইল পাওয়া যায়নি। অনুগ্রহ করে এই ইমেইল দিয়ে আবার নিবন্ধন করুন।"
        );
      }

    } catch (err: any) {
      console.error("Firebase Login Error: ", err);
      setLoading(false);
      setErrorMsg(t('unexpectedError'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const formattedEmail = forgotEmail.trim().toLowerCase();

    if (!formattedEmail) {
      setErrorMsg(t('enterEmailReset'));
      return;
    }

    try {
      // Send real Firebase Auth password reset email
      await sendPasswordResetEmail(auth, formattedEmail);
      setSuccessMsg(t('successReset'));
      setEmail(formattedEmail);
    } catch (err: any) {
      console.error("Forgot password email send error: ", err);
      
      // Check for user existence in our Firestore database to provide custom feedback/simulation fallback
      try {
        const userRef = doc(db, 'users', formattedEmail);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setSuccessMsg(t('simulatedSuccessReset').replace('{email}', formattedEmail));
          return;
        }
      } catch (dbErr) {
        console.warn("Firestore check failed:", dbErr);
      }

      if (err.code === 'auth/user-not-found') {
        setErrorMsg(t('userNotFound'));
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg(t('invalidEmail'));
      } else {
        setErrorMsg(err.message || t('unexpectedError'));
      }
    }
  };

  return (
    <div className="relative min-h-screen py-12 px-4 text-gray-900 dark:text-zinc-100 flex flex-col justify-center items-center font-roboto-sans transition-colors duration-300 overflow-hidden">
      {/* Full Screen Lottery Poster Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="/assets/lottery_poster.jpg" 
          alt="Lottery Poster Background" 
          className="w-full h-full object-cover scale-105 filter brightness-[0.55] contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20 backdrop-blur-[1px]" />
      </div>

      {isFormVisible ? (
        <div className="max-w-md w-full mx-auto bg-white/95 dark:bg-[#101622]/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden border border-white/20 dark:border-zinc-700/50 font-roboto-sans relative z-10 transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95">
          
          {/* Close (X) button to hide form & view full poster wallpaper */}
          <button
            type="button"
            onClick={() => setIsFormVisible(false)}
            className="absolute top-4 left-4 p-2 bg-gray-100/80 dark:bg-zinc-800/80 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-gray-600 dark:text-zinc-300 rounded-full transition-all cursor-pointer z-20 shadow-md active:scale-95"
            title={language === 'en' ? "Close Form & View Poster" : "লগইন ফরম বন্ধ করুন"}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        
        {/* Luxury Header Area with SSL Badge and 3D Logo */}
        <div className="p-6 sm:p-8 pb-4 text-center relative overflow-hidden">
          {/* SSL Badge in top right */}
          <div className="absolute top-4 right-4 bg-zinc-100 dark:bg-[#181f2f] border border-zinc-200/50 dark:border-zinc-800/80 px-3 py-1 rounded-full text-[8px] font-black tracking-widest text-amber-500 dark:text-amber-400 uppercase select-none shadow-sm">
            {t('secureSsl')}
          </div>
          
          {/* Pure 3D Logo Graphic - No Yellow Background Tile */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-3 relative mt-2">
            {siteConfig.logoImageUrl ? (
              <img 
                src={resolveBannerImage(siteConfig.logoImageUrl)} 
                alt="App Logo" 
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src="/assets/3d_lottery_logo.jpg" 
                alt="3D Lottery Logo" 
                className="w-full h-full object-contain rounded-2xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.7)] transform hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            )}
          </div>

          <h2 className="text-2xl font-black tracking-[0.18em] text-zinc-900 dark:text-white uppercase">
            {t('globalLottery')}
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 text-[10px] mt-1.5 uppercase tracking-widest font-black">
            {isForgotMode ? t('secureResetPortal') : t('gatewayLuxury')}
          </p>
        </div>

        {/* Divider line */}
        <div className="border-b border-gray-100 dark:border-zinc-800/80 mx-6 sm:mx-8" />

        {/* Regular Login Form & Forgot Password Form */}
        <div className="p-6 sm:p-8 pt-6 font-roboto-sans">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-750 dark:text-red-400 text-xs font-semibold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 text-emerald-850 dark:text-emerald-400 text-xs font-semibold leading-relaxed">
              ✅ {successMsg}
            </div>
          )}

          {!isForgotMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-400">{t('emailAddress')}</label>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 dark:text-zinc-500 font-bold text-sm">@</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="pl-11 bg-gray-50 dark:bg-[#0c111c] text-zinc-950 dark:text-zinc-100 block w-full border border-gray-200 dark:border-zinc-800/80 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all font-semibold shadow-inner" 
                    required 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-400">{t('password')}</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setForgotEmail(email);
                      setIsForgotMode(true);
                    }}
                    className="text-[10px] font-black text-amber-500 hover:text-amber-400 tracking-wide uppercase cursor-pointer"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 dark:text-zinc-500">
                    <Key className="w-4 h-4 text-gray-400 dark:text-zinc-500 stroke-[2.5]" />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-11 pr-10 bg-gray-50 dark:bg-[#0c111c] text-zinc-950 dark:text-zinc-100 block w-full border border-gray-200 dark:border-zinc-800/80 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all font-mono shadow-inner" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full font-black uppercase tracking-widest text-white py-4 px-6 rounded-xl shadow-lg ${loading ? 'opacity-70' : 'hover:brightness-105'} transition-all flex items-center justify-center gap-2 mt-4 text-xs cursor-pointer active:scale-[0.98]`}
                style={{ backgroundColor: siteConfig.primaryHex || '#FF003C' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    {language === 'en' ? 'Authenticating...' : 'যাচাই করা হচ্ছে...'}
                  </>
                ) : (
                  <>
                    {t('signInToDashboard')} <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
                  </>
                )}
              </button>

              <p className="mt-6 text-xs text-center text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
                {t('newToLottery')}{' '}
                <Link to="/register" className="text-amber-500 dark:text-amber-400 font-black hover:underline ml-1">
                  {t('registerAccount')}
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-400">{t('emailAddress')}</label>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 dark:text-zinc-500 font-bold text-sm">@</span>
                  <input 
                    type="email" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="pl-11 bg-gray-50 dark:bg-[#0c111c] text-zinc-950 dark:text-zinc-100 block w-full border border-gray-200 dark:border-zinc-800/80 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition-all font-semibold shadow-inner" 
                    required 
                  />
                </div>
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 mt-2 block font-medium leading-relaxed">
                  {t('resetInstructions')}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setErrorMsg('');
                    setSuccessMsg('');
                    setIsForgotMode(false);
                  }}
                  className="flex-1 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all text-center cursor-pointer bg-white dark:bg-[#151c2a]"
                >
                  {t('backToSignIn')}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: siteConfig.primaryHex || '#FF003C' }}
                  className="flex-1 font-black uppercase tracking-wider text-white py-3.5 px-4 rounded-xl shadow-md hover:brightness-105 transition-all text-xs cursor-pointer active:scale-[0.98]"
                >
                  {t('sendResetLink')}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
      ) : (
        /* Poster View Mode when Login form is closed */
        <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md w-full mx-auto px-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-zinc-950/85 backdrop-blur-2xl p-8 sm:p-10 rounded-[2.5rem] border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.9)] flex flex-col items-center w-full relative overflow-hidden">
            {/* Top Glow Accent */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4 relative drop-shadow-[0_12px_25px_rgba(0,0,0,0.8)]">
              <img 
                src="/assets/3d_lottery_logo.jpg" 
                alt="3D Lottery Logo" 
                className="w-full h-full object-contain rounded-2xl transform hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-[0.18em] text-white mb-2 drop-shadow-md">
              {t('globalLottery')}
            </h2>
            <p className="text-xs text-amber-400 font-black uppercase tracking-widest mb-8">
              {language === 'en' ? 'Full Poster View Mode Active' : 'পোস্টার ভিউ মোড সক্রিয়'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsFormVisible(true)}
                className="flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-white text-xs shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
                style={{ backgroundColor: siteConfig.primaryHex || '#FF003C' }}
              >
                <User className="w-4 h-4 stroke-[2.5]" />
                {t('signInToDashboard')}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-zinc-300 text-xs bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 transition-all cursor-pointer active:scale-95 shadow-lg"
              >
                {language === 'en' ? 'Back to Home' : 'হোমে ফিরে যান'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
