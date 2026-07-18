const fs = require('fs');

const path = 'c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/src/pages/Login.tsx';
let content = fs.readFileSync(path, 'utf8');

const returnRegex = /return \([\s\S]*?\);\n}/;

const newReturn = `return (
    <div
      style={{ fontFamily: "'Inter', sans-serif" }}
      className="flex h-[100dvh] w-screen bg-white font-sans overflow-hidden"
    >
      {/* Dynamic Background */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#2563EB]/10 blur-[120px] rounded-full" />
      </motion.div>

      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-1/2 p-6 shrink-0 items-center justify-center relative z-10 h-[75%] mt-auto mb-auto">
        <div className="w-full h-full bg-[#000000] rounded-[14px] flex flex-col items-start justify-start p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="w-full h-full pointer-events-auto">
              <Spline scene="/scene.splinecode" onLoad={(app) => setSplineApp(app)} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center justify-center w-full mt-10 pointer-events-none"
          >
            <img src={tradifiveLogo} alt="Tradifive" className="w-[180px] h-auto mb-3" />
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] leading-tight text-center">AI-Powered Trading, Unleashed.</p>
          </motion.div>
          <div className="absolute bottom-0 right-0 w-40 h-12 bg-black z-20 pointer-events-none shadow-[-20px_-10px_40px_rgba(0,0,0,0.8)]" />
          <div className="absolute bottom-10 left-12 z-10">
            <p className="text-white/40 text-[10px] tracking-[0.2em] font-bold uppercase whitespace-nowrap">
              Built by a <span className="text-white font-black cursor-default">Trader</span>, for <span className="text-white font-black cursor-default">Traders</span>
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none z-0" />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-8 lg:px-20 bg-white relative z-10 h-full overflow-y-auto amazing-scrollbar">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
              {step === 'otp' ? "Verify Identity" : isLogin ? "Welcome Back" : "Create an Account"}
            </h2>
            <p className="text-slate-500 text-sm">
              {step === 'otp' ? "Enter the institutional 2FA code to continue." : isLogin ? "Enter your details below to securely sign in." : "Fill in your information to get started."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'auth' ? (
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={isLogin ? { opacity: 0, x: -20 } : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={isLogin ? { opacity: 0, x: -20 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 h-14 rounded-[14px] text-[13px] font-medium text-slate-700 transition-colors shadow-sm"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Google
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -4 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    onClick={handleGithubLogin}
                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 h-14 rounded-[14px] text-[13px] font-medium text-slate-700 transition-colors shadow-sm"
                  >
                    <Github className="w-5 h-5 text-slate-900" />
                    GitHub
                  </motion.button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-slate-100" />
                  <span className="text-xs text-slate-400 font-medium">or continue with email</span>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>

                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                >
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        key="signup-names"
                        initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                        animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                          <div className="relative group">
                            <input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="peer w-full bg-white border border-slate-200 rounded-[14px] h-[56px] px-4 pt-4 pb-1 text-slate-900 placeholder-transparent focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors text-sm shadow-sm"
                              placeholder="First Name"
                              id="firstName"
                              required={!isLogin}
                            />
                            <label htmlFor="firstName" className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:text-[#2563EB] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-[10px] pointer-events-none font-medium">First Name</label>
                          </div>
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                          <div className="relative group">
                            <input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="peer w-full bg-white border border-slate-200 rounded-[14px] h-[56px] px-4 pt-4 pb-1 text-slate-900 placeholder-transparent focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors text-sm shadow-sm"
                              placeholder="Last Name"
                              id="lastName"
                              required={!isLogin}
                            />
                            <label htmlFor="lastName" className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:text-[#2563EB] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-[10px] pointer-events-none font-medium">Last Name</label>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                    <div className="relative group">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full bg-white border border-slate-200 rounded-[14px] h-[56px] px-4 pt-4 pb-1 text-slate-900 placeholder-transparent focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors text-sm shadow-sm"
                        placeholder="Email Address"
                        id="email"
                        required
                      />
                      <label htmlFor="email" className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:text-[#2563EB] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-[10px] pointer-events-none font-medium">Email Address</label>
                      {email.includes('@') && email.includes('.') && (
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                           <ShieldCheck className="w-5 h-5" />
                         </div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                    <div className="relative group">
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="peer w-full bg-white border border-slate-200 rounded-[14px] h-[56px] px-4 pt-4 pb-1 text-slate-900 placeholder-transparent focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors text-sm shadow-sm pr-12"
                        placeholder="Password"
                        id="password"
                        required
                      />
                      <label htmlFor="password" className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:text-[#2563EB] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-[10px] pointer-events-none font-medium">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                        animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                        exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                      >
                        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
                          <div className="relative group mt-4">
                            <input
                              type={showPw ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="peer w-full bg-white border border-slate-200 rounded-[14px] h-[56px] px-4 pt-4 pb-1 text-slate-900 placeholder-transparent focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors text-sm shadow-sm pr-12"
                              placeholder="Confirm Password"
                              id="confirmPassword"
                              required={!isLogin}
                            />
                            <label htmlFor="confirmPassword" className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-4 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:text-[#2563EB] peer-[:not(:placeholder-shown)]:-translate-y-2.5 peer-[:not(:placeholder-shown)]:text-[10px] pointer-events-none font-medium">Confirm Password</label>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }} className="pt-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#2563EB] blur-md opacity-20 rounded-[14px]" />
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full h-[56px] bg-[#2563EB] text-white rounded-[14px] font-medium text-[15px] shadow-sm flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span className="flex items-center gap-2">
                            {isLogin ? "Sign In" : "Create Account"}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.form>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mt-8 text-center text-[13px] text-slate-500 font-medium"
                >
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      // Reset fields to ensure clean state and avoid error shake on mount
                      setFirstName("");
                      setLastName("");
                      setEmail("");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-[#2563EB] hover:text-[#1d4ed8] font-semibold transition-colors"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                </motion.p>
              </motion.div>
            ) : (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-[#2563EB]/10 rounded-[14px] flex items-center justify-center mb-8 border border-[#2563EB]/20">
                  <ShieldCheck className="text-[#2563EB] w-8 h-8" />
                </div>

                <form onSubmit={handleVerifyOTP} className="w-full space-y-8 flex flex-col items-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(val) => setOtpCode(val)}
                  >
                    <InputOTPGroup className="gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="w-12 h-14 text-xl font-bold border-slate-200 rounded-[14px] bg-white text-slate-900 focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  <div className="w-full space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#2563EB] blur-md opacity-20 rounded-[14px]" />
                      <motion.button
                        type="submit"
                        disabled={isLoading || otpCode.length !== 6}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative w-full h-[56px] bg-[#2563EB] text-white rounded-[14px] font-medium text-[15px] shadow-sm flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span className="flex items-center gap-2">
                            Authorize Access
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </motion.button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setStep('auth');
                        setOtpCode("");
                      }}
                      className="w-full py-4 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Back to Login
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}`;

content = content.replace(returnRegex, newReturn);
fs.writeFileSync(path, content);
console.log("Successfully updated Login.tsx return block!");
