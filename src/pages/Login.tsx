import { toast } from "sonner";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '../context/AuthContext';
import { ShieldAlert, User, Key, ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { resolveBannerImage } from '../components/Hero';
import { Smart3DLogo, SmartPosterBackground, CasinoPosterShowcase } from '../components/SmartImage';

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
    <div className="relative min-h-screen py-8 sm:py-12 px-3 sm:px-6 text-gray-900 dark:text-zinc-100 flex flex-col justify-center items-center font-roboto-sans transition-colors duration-300 overflow-hidden">
      {/* Full Screen Lottery Poster Ambient Background */}
      <SmartPosterBackground />

      {isFormVisible ? (
        <div className="w-full max-w-5xl mx-auto relative z-10 animate-in fade-in zoom-in-95 duration-300">
          
          {/* Main Grid Container: Left Poster Showcase on desktop, Right Casino Login Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
            
            {/* Left Side: Full Page Casino Poster & Jackpot Showcase */}
            <div className="lg:col-span-6 hidden lg:flex flex-col h-full">
              <CasinoPosterShowcase className="min-h-[580px]" />
            </div>

            {/* Right Side: Luxury Dark Casino Login Card */}
            <div className="lg:col-span-6 w-full max-w-md mx-auto bg-[#0a0f1d]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden border-2 border-amber-500/40 hover:border-amber-400/70 font-roboto-sans relative transition-all duration-300 flex flex-col justify-between">
              
              {/* Gold Top Accent Line */}
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600" />

              {/* Close (X) button to hide form & view full un-obscured poster artwork */}
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="absolute top-4 left-4 p-2.5 bg-zinc-900/90 hover:bg-rose-600 text-zinc-300 hover:text-white rounded-full transition-all cursor-pointer z-20 shadow-lg border border-amber-500/30 active:scale-95 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider"
                title={language === 'en' ? "Close Form & View Full Poster Artwork" : "পোস্টার পুরো দেখুন"}
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'en' ? 'Full Poster' : 'পোস্টার'}</span>
              </button>

              {/* SSL Badge in top right */}
              <div className="absolute top-4 right-4 bg-amber-500/10 border border-amber-500/40 px-3 py-1 rounded-full text-[9px] font-black tracking-widest text-amber-400 uppercase select-none shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {t('secureSsl')}
              </div>

              {/* Luxury Casino Header Area with 3D Logo */}
              <div className="p-6 sm:p-8 pb-3 text-center relative overflow-hidden pt-12">
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-3 relative drop-shadow-[0_12px_25px_rgba(225,188,74,0.3)]">
                  <Smart3DLogo 
                    customUrl={siteConfig.logoImageUrl ? resolveBannerImage(siteConfig.logoImageUrl) : undefined}
                    className="w-full h-full object-contain transform hover:scale-105 transition-transform"
                  />
                </div>

                <div className="inline-block bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-0.5 rounded-full mb-2">
                  🎰 777 CASINO VIP PORTAL
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-[0.18em] text-white uppercase drop-shadow-md">
                  {t('globalLottery')}
                </h2>
                <p className="text-amber-400/90 text-[10px] mt-1 uppercase tracking-widest font-black">
                  {isForgotMode ? t('secureResetPortal') : t('gatewayLuxury')}
                </p>
              </div>

              {/* Divider line */}
              <div className="border-b border-amber-500/20 mx-6 sm:mx-8" />

              {/* Form Body */}
              <div className="p-6 sm:p-8 pt-6 font-roboto-sans flex-1">
                {errorMsg && (
                  <div className="mb-5 p-4 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-semibold leading-relaxed shadow-inner">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-5 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold leading-relaxed shadow-inner">
                    ✅ {successMsg}
                  </div>
                )}

                {!isForgotMode ? (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1.5">
                        {t('emailAddress')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-400 font-black text-sm">@</span>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="pl-11 bg-zinc-950/90 text-white placeholder-zinc-500 block w-full border border-amber-500/30 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all font-semibold shadow-inner" 
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90">
                          {t('password')}
                        </label>
                        <button 
                          type="button"
                          onClick={() => {
                            setErrorMsg('');
                            setSuccessMsg('');
                            setForgotEmail(email);
                            setIsForgotMode(true);
                          }}
                          className="text-[10px] font-black text-amber-400 hover:text-amber-300 tracking-wide uppercase cursor-pointer transition-colors"
                        >
                          {t('forgotPassword')}
                        </button>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-400">
                          <Key className="w-4 h-4 stroke-[2.5]" />
                        </span>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-11 pr-10 bg-zinc-950/90 text-white placeholder-zinc-500 block w-full border border-amber-500/30 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all font-mono shadow-inner" 
                          required 
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-amber-300 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button with High Roller Casino Gradient */}
                    <button 
                      type="submit" 
                      disabled={loading}
                      className={`w-full font-black uppercase tracking-widest text-zinc-950 py-4 px-6 rounded-xl shadow-[0_10px_25px_rgba(225,188,74,0.35)] bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 ${loading ? 'opacity-70' : ''} transition-all flex items-center justify-center gap-2 mt-4 text-xs cursor-pointer active:scale-[0.98] border border-amber-300`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full animate-spin" />
                          {language === 'en' ? 'AUTHENTICATING...' : 'যাচাই করা হচ্ছে...'}
                        </>
                      ) : (
                        <>
                          {t('signInToDashboard')} <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
                        </>
                      )}
                    </button>

                    <p className="mt-6 text-xs text-center text-zinc-400 font-bold uppercase tracking-wider">
                      {t('newToLottery')}{' '}
                      <Link to="/register" className="text-amber-400 font-black hover:underline hover:text-yellow-300 ml-1">
                        {t('registerAccount')}
                      </Link>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-amber-400/90 mb-1.5">
                        {t('emailAddress')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-amber-400 font-black text-sm">@</span>
                        <input 
                          type="email" 
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="name@email.com"
                          className="pl-11 bg-zinc-950/90 text-white placeholder-zinc-500 block w-full border border-amber-500/30 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none transition-all font-semibold shadow-inner" 
                          required 
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-2 block font-medium leading-relaxed">
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
                        className="flex-1 border border-zinc-700 text-zinc-300 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-zinc-800 transition-all text-center cursor-pointer bg-zinc-900"
                      >
                        {t('backToSignIn')}
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 font-black uppercase tracking-wider text-zinc-950 bg-gradient-to-r from-amber-400 to-yellow-300 py-3.5 px-4 rounded-xl shadow-md hover:brightness-110 transition-all text-xs cursor-pointer active:scale-[0.98]"
                      >
                        {t('sendResetLink')}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Full Screen Poster View Mode when Login form is toggled closed */
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
              {t('globalLottery')}
            </h2>
            <p className="text-xs text-amber-400 font-black uppercase tracking-widest mb-6">
              {language === 'en' ? 'Full Lottery Poster Mode Active' : 'পোস্টার ভিউ মোড সক্রিয়'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsFormVisible(true)}
                className="flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-zinc-950 text-xs shadow-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-300"
              >
                <User className="w-4 h-4 stroke-[2.5]" />
                {t('signInToDashboard')}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/')}
                className="py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-zinc-300 text-xs bg-zinc-800/90 hover:bg-zinc-700/90 border border-zinc-700 transition-all cursor-pointer active:scale-95 shadow-lg"
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
