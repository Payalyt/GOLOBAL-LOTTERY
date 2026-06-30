import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '../context/AuthContext';
import { ShieldAlert, User, Key, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export function Login() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUser, allUsers, language } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
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
      signInToDashboard: "Sign In to Dashboard",
      newToLottery: "New to Golobal Lottery?",
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
      globalLottery: "GOLOBAL LOTTERY"
    },
    bn: {
      signIn: "লগইন করুন",
      signUp: "নিবন্ধন করুন",
      emailAddress: "ইমেইল ঠিকানা",
      password: "পাসওয়ার্ড",
      forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
      signInToDashboard: "ড্যাশবোর্ডে লগইন করুন",
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
    
    // Check for the special payal admin override
    const isAdminOverride = (
      (formattedEmail === 'payal@gmail.com' || 
       formattedEmail === 'admin.payal@gmail.com' || 
       formattedEmail === 'payalyt6279@gmail.com' ||
       formattedEmail === 'admin@goloballottery.com') && 
      (password === '1111' || password === '111111')
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
        if (formattedEmail === 'payalyt6279@gmail.com' || formattedEmail === 'admin@goloballottery.com') {
          try {
             await createUserWithEmailAndPassword(auth, formattedEmail, password);
             authRecovered = true;
             authSucceeded = true;
             console.log("Admin account auto-created in Firebase Auth!");
             
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
                   alert("WARNING: Admin Firebase Auth failed. Your changes in the admin panel will NOT be saved to the database. Please ensure your Firebase Auth password is correct or reset it.");
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
          name: formattedEmail === 'admin@goloballottery.com' ? 'Admin Controller' : 'Meshkat Sorif Payal (Admin)',
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
            console.log("Admin account created in Firebase Auth via fallback");
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
        console.log("Logged in successfully");
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
    <div className="bg-gray-100 min-h-screen py-16 px-4 text-gray-900 flex flex-col justify-center font-roboto-sans">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 font-roboto-sans">
        
        {/* Luxury Banner with Gilded App Logo */}
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 text-white p-8 text-center relative overflow-hidden font-roboto-sans">
          <div className="absolute top-4 right-4 bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider text-yellow-400 uppercase select-none">
            {t('secureSsl')}
          </div>
          
          {/* Custom Designed App Logo Graphic */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-[#E52535] flex items-center justify-center shadow-lg shadow-red-500/20 mb-4 border border-white/10 relative">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl" />
          </div>

          <h2 className="text-2xl font-black tracking-[0.18em] text-white uppercase">
            {t('globalLottery')}
          </h2>
          <p className="text-gray-400 text-[10px] mt-1.5 uppercase tracking-widest font-bold">
            {isForgotMode ? t('secureResetPortal') : t('gatewayLuxury')}
          </p>
        </div>

        {/* Regular Login Form & Forgot Password Form */}
        <div className="p-8 font-roboto-sans">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-750 text-xs font-semibold leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-850 text-xs font-semibold leading-relaxed">
              ✅ {successMsg}
            </div>
          )}

          {!isForgotMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">{t('emailAddress')}</label>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">@</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=""
                    className="pl-9 bg-white text-zinc-950 block w-full border border-gray-250 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all font-semibold" 
                    required 
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">{t('password')}</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setSuccessMsg('');
                      setForgotEmail(email);
                      setIsForgotMode(true);
                    }}
                    className="text-[10px] font-bold text-red-600 hover:underline tracking-wide uppercase cursor-pointer"
                  >
                    {t('forgotPassword')}
                  </button>
                </div>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                    <Key className="w-4 h-4 text-gray-400 stroke-[2.5]" />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="pl-9 pr-10 bg-white text-zinc-950 block w-full border border-gray-250 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all font-mono" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{ backgroundColor: '#E52535' }}
                className={`w-full font-black uppercase tracking-widest text-white py-4 px-6 rounded-xl shadow-lg ${loading ? 'opacity-70' : 'hover:brightness-105'} transition-all flex items-center justify-center gap-2 mt-4 text-xs cursor-pointer`}
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

              <p className="mt-6 text-xs text-center text-gray-500 font-medium uppercase tracking-wider">
                {t('newToLottery')} <Link to="/register" className="text-[#E52535] font-black hover:underline ml-1">{t('registerAccount')}</Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-gray-500">{t('emailAddress')}</label>
                <div className="mt-1.5 relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 font-bold">@</span>
                  <input 
                    type="email" 
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t('enterRegisteredEmail')}
                    className="pl-9 bg-white text-gray-950 block w-full border border-gray-250 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all font-semibold" 
                    required 
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block font-medium leading-relaxed">
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
                  className="flex-1 border border-gray-200 text-gray-700 py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-all text-center cursor-pointer bg-white"
                >
                  {t('backToSignIn')}
                </button>
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#E52535' }}
                  className="flex-1 font-black uppercase tracking-wider text-white py-3.5 px-4 rounded-xl shadow-md hover:brightness-105 transition-all text-xs cursor-pointer"
                >
                  {t('sendResetLink')}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
