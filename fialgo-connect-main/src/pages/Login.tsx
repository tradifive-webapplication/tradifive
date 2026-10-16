import { useState, useEffect, useRef } from "react";
import {
   User as IconlyUser,
   Message as IconlyMessage,
   Lock as IconlyLock,
   Show as IconlyShow,
   Hide as IconlyHide,
   ArrowRight as IconlyArrowRight,
   ArrowLeft as IconlyArrowLeft
} from "react-iconly";


import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// Icons handled entirely via react-iconly
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import tradifiveLogo from "@/assets/tradifive-login-logo.png";
import { supabase } from "@/lib/supabase";
import { PushableButton } from "@/components/PushableButton";
import { toast } from "sonner";
import { recordUserActivity } from "@/lib/activity";
import { loginLimiter, otpLimiter } from "@/lib/rateLimiter";
import { sanitizeEmail, sanitizeName, sanitizeReferralCode, validatePassword } from "@/lib/sanitize";

export default function Login() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  // Sanitize the referral code from the URL to prevent injection
  const referralCode = sanitizeReferralCode(searchParams.get('ref') || "");
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'signup' && !referralCode);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'auth' | 'otp' | 'verify_signup' | 'forgot_password'>('auth');
  const [otpCode, setOtpCode] = useState("");
  const [isResetSent, setIsResetSent] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [tempUser, setTempUser] = useState<any>(null);
  const navigate = useNavigate();

  // Force white mode only on the login/register pages and disable page-level scrolling
  useEffect(() => {
    document.documentElement.classList.remove("dark");

    // Save original overflow styles
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    // Disable scrolling on body and html
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      // Restore original overflow styles on unmount
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (location.state?.mode) {
      setIsLogin(location.state.mode !== 'signup');
    }

    // Handle authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Only redirect automatically if they JUST signed in or registered
      if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        // We check if this was a programmatic redirect or a fresh login
        // If they just arrived at the page and were already logged in, we let them stay
        const isFreshLogin = sessionStorage.getItem('fresh_login') === 'true';
        if (isFreshLogin) {
          navigate("/home");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.state, navigate]);

  const finalizeLogin = async (user: any, loginMethod = "Email & Password") => {
    // Reset the login rate limiter on successful auth
    loginLimiter.reset();

    // Clear old cached profile from localStorage to prevent session pollution.
    // NOTE: We only store non-sensitive theme/preferences in localStorage.
    // Profile data is fetched fresh from Supabase on each session.
    try {
      localStorage.removeItem("tradifive_cached_display_name");
      localStorage.removeItem("tradifive_cached_username");
      localStorage.removeItem("tradifive_cached_avatar_url");
      localStorage.removeItem("tradifive_cached_mt5_acc");

      // Clear any stale mock profile overrides from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('tradifive_mock_profile_') || key.startsWith('tradifive_privacy_user_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn("localStorage not accessible during login cleanup");
    }

    // Set marker for fresh login so the listener knows to redirect
    sessionStorage.setItem('fresh_login', 'true');

    try {
      // Update last_login_at timestamp
      await supabase
        .from('profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      // Record activity
      await recordUserActivity('LOGIN', `User logged in from ${window.location.hostname}`);

      // Fire the "New sign-in detected" security email — runs in background, non-blocking
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.access_token) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl) {
          fetch(`${supabaseUrl}/functions/v1/send-login-email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${sessionData.session.access_token}`,
            },
            body: JSON.stringify({ method: loginMethod }),
          }).catch(() => {/* Non-critical — don't block login */ });
        }
      }
    } catch {
      // Non-critical: don't block login on audit failures
    }

    toast.success("Welcome back!");
    navigate("/home");
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    // Rate-limit OTP verification attempts
    if (otpLimiter.isBlocked()) {
      const secs = otpLimiter.getRemainingLockoutSeconds();
      toast.error(`Too many attempts. Please wait ${secs} seconds.`);
      return;
    }

    setIsLoading(true);

    if (!tempUser?.email) {
      toast.error("Session expired. Please sign in again.");
      setStep('auth');
      setIsLoading(false);
      return;
    }

    try {
      const isSignup = step === 'verify_signup';
      // Verify using Supabase server-side email OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: tempUser.email,
        token: otpCode,
        type: isSignup ? 'signup' : 'email',
      });

      if (error) {
        otpLimiter.recordFailedAttempt();
        const remaining = otpLimiter.attemptsRemaining();
        toast.error(`Invalid code. ${remaining > 0 ? `${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` : 'Account temporarily locked.'}`);
        setIsLoading(false);
      } else {
        otpLimiter.reset();

        // Create profile now that the user is actually authenticated
        if (isSignup && tempUser.profileData) {
          await supabase.from('profiles').upsert(tempUser.profileData, { onConflict: 'id' });
          if (tempUser.referralCode) {
            await supabase.rpc('register_referral', { 
              referral_code_input: tempUser.referralCode, 
              new_user_id: tempUser.profileData.id 
            });
          }
        }

        await finalizeLogin(data?.user || tempUser);
      }
    } catch {
      toast.error("Verification failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsResetSent(true);
        toast.success("Reset link sent to your email!");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiter before processing
    if (loginLimiter.isBlocked()) {
      const secs = loginLimiter.getRemainingLockoutSeconds();
      setLockoutSeconds(secs);
      toast.error(`Too many failed attempts. Please wait ${secs} seconds before trying again.`);
      return;
    }

    setIsLoading(true);

    // Sanitize all inputs before use
    const cleanEmail = sanitizeEmail(email);
    const cleanFirstName = sanitizeName(firstName);
    const cleanLastName = sanitizeName(lastName);

    if (!cleanEmail) {
      toast.error("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      if (!isLogin) {
        // Sign Up — validate password strength
        const pwError = validatePassword(password);
        if (pwError) {
          toast.error(pwError);
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              first_name: cleanFirstName,
              last_name: cleanLastName,
              referred_by: referralCode,
            },
          },
        });

        if (error) {
          toast.error(error.message);
        } else if (data.user) {
          const generatedUsername = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(100 + Math.random() * 900);

          const profileData = {
            id: data.user.id,
            email: cleanEmail,
            first_name: cleanFirstName,
            last_name: cleanLastName,
            full_name: `${cleanFirstName} ${cleanLastName}`.trim(),
            username: generatedUsername,
            avatar_url: "/default-avatar.svg",
            referred_by: referralCode || null,
            xp_total: 0,
            xp_level: 1,
            streak_days: 0,
            created_at: new Date().toISOString(),
          };

          if (data.session) {
            // Email verification is disabled, user is logged in immediately
            await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
            if (referralCode) {
              const { error: rpcError } = await supabase.rpc('register_referral', {
                referral_code_input: referralCode,
                new_user_id: data.user.id
              });
              if (rpcError) console.error('Failed to register referral:', rpcError);
            }
            toast.success("Account created successfully!");
            navigate("/home");
          } else {
            // Email verification is required, user is NOT logged in yet
            setTempUser({ 
              email: cleanEmail,
              profileData,
              referralCode
            });
            setStep('verify_signup');
            toast.success("Verification email sent! Please check your inbox.");
          }
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          // Record failed attempt for rate limiting
          const isNowLocked = loginLimiter.recordFailedAttempt();
          if (isNowLocked) {
            const secs = loginLimiter.getRemainingLockoutSeconds();
            toast.error(`Too many failed attempts. Account locked for ${secs} seconds.`);
          } else {
            const remaining = loginLimiter.attemptsRemaining();
            toast.error(`${error.message}${remaining <= 2 ? ` (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)` : ''}`);
          }
        } else {
          // Check if 2FA is enabled for this user
          const { data: profile } = await supabase
            .from('profiles')
            .select('two_factor_enabled')
            .eq('id', data.user.id)
            .single();

          if (profile?.two_factor_enabled) {
            // Send a server-side email OTP via Supabase Auth
            const { error: otpError } = await supabase.auth.signInWithOtp({
              email: cleanEmail,
              options: { shouldCreateUser: false },
            });

            if (otpError) {
              toast.error("Failed to send verification code. Please try again.");
              setIsLoading(false);
              return;
            }

            setTempUser(data.user);
            setStep('otp');
            toast.info("2FA Verification Required", {
              description: "A 6-digit verification code has been sent to your email.",
              duration: 10000,
            });
            setIsLoading(false);
            return;
          }

          // No 2FA — proceed as normal
          await finalizeLogin(data.user);
        }
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      if (step !== 'otp') setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const toastId = toast.loading("Initializing Google login...");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Only redirect to our own origin — prevents open redirect
          redirectTo: `${window.location.origin}/home`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast.error(`Login failed: ${error.message}`, { id: toastId });
        return;
      }

      if (data?.url) {
        sessionStorage.setItem('fresh_login', 'true');
        toast.success("Redirecting to Google...", { id: toastId });
        window.location.href = data.url;
      } else {
        toast.dismiss(toastId);
      }
    } catch {
      toast.error("Failed to initialize Google login.", { id: toastId });
    }
  };

  const handleAppleLogin = async () => {
    toast.info("Apple login coming soon!");
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "linear-gradient(to right, #3b82f6 0%, #93c5fd 35%, #eff6ff 60%, #ffffff 85%)"
      }}
      className="flex h-screen h-[100dvh] w-screen font-sans selection:bg-primary/10 relative overflow-hidden dark:!bg-black"
    >
      {/* All fonts loaded globally via index.html (Inter) */}

      {/* Left Side - Spline Robot (loaded in isolated iframe to avoid Vite bundling issues) */}
      <div className="hidden lg:flex lg:w-1/2 p-6 bg-transparent shrink-0 items-center justify-center">
        <div className="w-full h-full bg-[#000000] rounded-[2rem] flex flex-col items-start justify-start p-12 relative overflow-hidden shadow-2xl border border-white/5">

          {/* Robot Web Component — using spline-viewer to allow global mouse tracking */}
          <div className="absolute inset-0 z-0 pointer-events-auto">
            <div className="w-full h-full rounded-[2rem] overflow-hidden">
              {/* @ts-ignore - Custom Web Component */}
              <spline-viewer 
                ref={(node: any) => {
                  if (node) {
                    node.eventsTarget = "global";
                    node.setAttribute("events-target", "global");
                  }
                }}
                url="/scene.splinecode" 
                events-target="global" 
                style={{ width: '100%', height: '100%' }}
              ></spline-viewer>
            </div>
          </div>

          {/* Top-Left Branding Overlay */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-start pointer-events-none"
          >
            <img src={tradifiveLogo} alt="Tradifive" className="w-[180px] h-auto mb-3" />
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] leading-tight">AI-Powered Trading, Unleashed.</p>
          </motion.div>

          {/* Mask to hide Spline watermark (Bottom Right) */}
          <div className="absolute bottom-0 right-0 w-40 h-12 bg-black z-20 pointer-events-none shadow-[-20px_-10px_40px_rgba(0,0,0,0.8)]" />

          {/* Footer */}
          <div className="absolute bottom-10 left-12 z-10">
            <p className="text-white/40 text-[10px] tracking-[0.2em] font-bold uppercase whitespace-nowrap">
              Built by a <span className="text-white font-black cursor-default">Trader</span>, for <span className="text-white font-black cursor-default">Traders</span>
            </p>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-0" />
        </div>
      </div>

      {/* Right Side - Form area */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-8 lg:px-20 bg-white lg:bg-transparent dark:bg-black lg:dark:bg-transparent relative h-full overflow-y-auto py-6 lg:py-12 amazing-scrollbar">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-[420px]"
        >


          <div className="mb-6 lg:mb-10 text-left">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-1.5 lg:mb-2">
              {step === 'otp' || step === 'verify_signup' ? "Verify" : step === 'forgot_password' ? "Forgot" : isLogin ? "Welcome" : "Get"} <span className="text-primary">{step === 'otp' ? "Identity" : step === 'verify_signup' ? "Email" : step === 'forgot_password' ? "Password?" : isLogin ? "Back" : "Started"}</span>
            </h2>
            <p className="text-slate-500 text-xs lg:text-sm font-semibold">
              {step === 'otp' ? "Enter the institutional 2FA code to continue." : step === 'verify_signup' ? `Check your inbox for the 6-digit code sent to ${tempUser?.email}` : step === 'forgot_password' ? (isResetSent ? "Check your inbox for the reset link." : "Enter your email to receive reset instructions.") : isLogin ? "Please enter your details to sign in." : "Fill in the information to get started."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'auth' ? (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-5 lg:mb-8" style={{ perspective: '800px' }}>
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#141414] hover:border-slate-300 dark:hover:border-[#444444] py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-[12px] font-bold uppercase text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                    style={{ transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)', transformStyle: 'preserve-3d' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) rotateX(4deg) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotateX(0deg) scale(1)'; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={handleAppleLogin}
                    className="flex items-center justify-center gap-2 bg-white dark:bg-[#1E1E1E] border border-slate-200/60 dark:border-[#333333] hover:bg-slate-50 dark:hover:bg-[#141414] hover:border-slate-300 dark:hover:border-[#444444] py-2.5 lg:py-3 rounded-xl text-[11px] lg:text-[12px] font-bold uppercase text-slate-700 dark:text-slate-200 transition-all shadow-sm"
                    style={{ transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)', transformStyle: 'preserve-3d' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px) rotateX(4deg) scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotateX(0deg) scale(1)'; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 384 512"
                      className="w-3.5 h-3.5 lg:w-4 lg:h-4"
                      fill="currentColor"
                    >
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                    </svg>
                    Apple
                  </button>
                </div>

                <div className="flex items-center gap-3 lg:gap-4 mb-5 lg:mb-8">
                  <div className="h-px flex-1 bg-slate-200 lg:bg-slate-100 dark:bg-[#1E1E1E]" />
                  <span className="text-[9px] lg:text-[10px] text-slate-400 lg:text-slate-300 uppercase tracking-widest font-black">Or</span>
                  <div className="h-px flex-1 bg-slate-200 lg:bg-slate-100 dark:bg-[#1E1E1E]" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5 lg:space-y-4">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        key="signup-names"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-3 lg:gap-4"
                      >
                        <div className="space-y-1 lg:space-y-1.5">
                          <label className="text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 lg:text-slate-400 ml-1">First Name</label>
                          <div className="relative group">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                              <IconlyUser set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />
                            </div>
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="w-full bg-white lg:bg-slate-50 dark:bg-[#141414] border border-slate-200 lg:border-slate-100 dark:border-[#333333] rounded-xl py-2.5 lg:py-3 pl-10 pr-3.5 lg:pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 lg:placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-[13px] lg:text-sm font-semibold lg:font-medium shadow-sm"
                              placeholder="John"
                              required={!isLogin}
                            />
                          </div>
                        </div>
                        <div className="space-y-1 lg:space-y-1.5">
                          <label className="text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 lg:text-slate-400 ml-1">Last Name</label>
                          <div className="relative group">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                              <IconlyUser set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />
                            </div>
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="w-full bg-white lg:bg-slate-50 dark:bg-[#141414] border border-slate-200 lg:border-slate-100 dark:border-[#333333] rounded-xl py-2.5 lg:py-3 pl-10 pr-3.5 lg:pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 lg:placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-[13px] lg:text-sm font-semibold lg:font-medium shadow-sm"
                              placeholder="Doe"
                              required={!isLogin}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1 lg:space-y-1.5">
                    <label className="text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 lg:text-slate-400 ml-1">Email Address</label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                        <IconlyMessage set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white lg:bg-slate-50 dark:bg-[#141414] border border-slate-200 lg:border-slate-100 dark:border-[#333333] rounded-xl py-2.5 lg:py-3 pl-10 pr-3.5 lg:pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 lg:placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-[13px] lg:text-sm font-semibold lg:font-medium shadow-sm"
                        placeholder="name@example.com"
                        required
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 lg:space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 lg:text-slate-400">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setStep('forgot_password')}
                          className="text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                        <IconlyLock set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />
                      </div>
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white lg:bg-slate-50 dark:bg-[#141414] border border-slate-200 lg:border-slate-100 dark:border-[#333333] rounded-xl py-2.5 lg:py-3 pl-10 pr-10 text-slate-900 dark:text-white placeholder:text-slate-400 lg:placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-[13px] lg:text-sm font-semibold lg:font-medium shadow-sm"
                        placeholder="••••••••"
                        required
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      >
                        {showPw ? <IconlyHide set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} /> : <IconlyShow set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1 lg:space-y-1.5"
                      >
                        <label className="text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 lg:text-slate-400 ml-1">Confirm Password</label>
                        <div className="relative group">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                            <IconlyLock set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />
                          </div>
                          <input
                            type={showPw ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white lg:bg-slate-50 dark:bg-[#141414] border border-slate-200 lg:border-slate-100 dark:border-[#333333] rounded-xl py-2.5 lg:py-3 pl-10 pr-3.5 lg:pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 lg:placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-[13px] lg:text-sm font-semibold lg:font-medium shadow-sm"
                            placeholder="••••••••"
                            required={!isLogin}
                            autoComplete="new-password"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="pt-4 lg:pt-6" style={{ perspective: '600px' }}>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full text-white font-bold uppercase tracking-wide text-xs lg:text-sm py-3 lg:py-3.5 rounded-xl flex items-center justify-center disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #3b82f6 100%)',
                        boxShadow: '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        transformStyle: 'preserve-3d',
                      }}
                      onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,99,235,0.4), 0 4px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)'; } }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotateX(0deg) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
                      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(-1px) rotateX(2deg) scale(0.98)'; }}
                      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; }}
                    >
                      {isLoading ? "Processing..." : (
                        <>
                          {isLogin ? "Sign In" : "Create Account"}
                          <IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <p className="mt-8 lg:mt-12 text-center text-[10px] lg:text-[11px] font-bold text-slate-500 lg:text-slate-400 tracking-wide uppercase">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                    }}
                    className="text-primary hover:text-primary/70 ml-1 font-bold"
                    style={{
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      display: 'inline-block',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'; e.currentTarget.style.textShadow = '0 2px 8px rgba(37,99,235,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.textShadow = 'none'; }}
                  >
                    {isLogin ? "Create one" : "Sign in here"}
                  </button>
                </p>
              </motion.div>
            ) : step === 'forgot_password' ? (
              <motion.div
                key="forgot-password-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col"
              >
                {!isResetSent ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1 lg:space-y-1.5">
                      <label className="text-[9px] lg:text-[10px] font-extrabold uppercase tracking-wider text-slate-500 lg:text-slate-400 ml-1">Email Address</label>
                      <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">
                          <IconlyMessage set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white lg:bg-slate-50 dark:bg-[#141414] border border-slate-200 lg:border-slate-100 dark:border-[#333333] rounded-xl py-2.5 lg:py-3 pl-10 pr-3.5 lg:pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 lg:placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200 text-[13px] lg:text-sm font-semibold lg:font-medium shadow-sm"
                          placeholder="name@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full text-white font-bold uppercase tracking-wide text-xs lg:text-sm py-3 lg:py-3.5 rounded-xl flex items-center justify-center disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #3b82f6 100%)',
                          boxShadow: '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      >
                        {isLoading ? "Processing..." : (
                          <>
                            Send Instructions
                            <IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('auth')}
                      className="w-full mt-4 py-2 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <IconlyArrowLeft set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} />
                      Back to Login
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-4 relative z-10 flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600 border border-blue-100 dark:border-blue-600/20">
                      <IconlyMessage set="bold" primaryColor="currentColor" size={28} />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Check your inbox</h3>
                    <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">
                      We've sent a link to <br/> 
                      <span className="text-slate-900 dark:text-white font-bold underline decoration-primary decoration-2 underline-offset-4">{email}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetSent(false);
                        setStep('auth');
                      }}
                      className="w-full text-white font-bold uppercase tracking-wide text-xs lg:text-sm py-3 lg:py-3.5 rounded-xl flex items-center justify-center disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #3b82f6 100%)',
                        boxShadow: '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                      }}
                    >
                      Back to Login
                    </button>
                  </div>
                )}
              </motion.div>
            ) : step === 'otp' || step === 'verify_signup' ? (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center"
              >
                {/* Shield icon removed per request */}

                <form onSubmit={handleVerifyOTP} className="w-full space-y-6 lg:space-y-8 flex flex-col items-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(val) => setOtpCode(val)}
                  >
                    <InputOTPGroup className="gap-1.5 lg:gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-10 lg:w-12 h-12 lg:h-14 text-lg lg:text-xl font-black border-slate-200 dark:border-[#333333] rounded-xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  <div className="w-full space-y-3 lg:space-y-4">
                    <div className="pt-2" style={{ perspective: '600px' }}>
                      <button
                        type="submit"
                        disabled={isLoading || otpCode.length !== 6}
                        className="w-full text-white font-bold uppercase tracking-wide text-xs lg:text-sm py-3 lg:py-3.5 rounded-xl flex items-center justify-center disabled:opacity-50"
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #3b82f6 100%)',
                          boxShadow: '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)',
                          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                          transformStyle: 'preserve-3d',
                        }}
                        onMouseEnter={e => { if (!isLoading && otpCode.length === 6) { e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(37,99,235,0.4), 0 4px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25)'; } }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotateX(0deg) scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)'; }}
                        onMouseDown={e => { if (!isLoading && otpCode.length === 6) e.currentTarget.style.transform = 'translateY(-1px) rotateX(2deg) scale(0.98)'; }}
                        onMouseUp={e => { if (!isLoading && otpCode.length === 6) e.currentTarget.style.transform = 'translateY(-4px) rotateX(6deg) scale(1.02)'; }}
                      >
                        {isLoading ? "Verifying..." : (
                          <>
                            {step === 'verify_signup' ? "Verify Account" : "Authorize Access"}
                            <IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />
                          </>
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('auth');
                        setOtpCode("");
                      }}
                      className="w-full py-2 lg:py-4 text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <IconlyArrowLeft set="bold" primaryColor="currentColor" size={14} />
                      Back to Login
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}






