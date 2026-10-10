import React, { useState } from "react";
import { Brain, Download, ShieldCheck, Copy, CheckCircle2, Lock, Mail, Wallet, ShieldAlert, Play, FileCode2, ExternalLink, UploadCloud, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";

const BROKERS = [
  { id: 'vantage', name: 'Vantage Markets', url: 'https://vantage.com/ib' },
  { id: 'exness', name: 'Exness', url: 'https://exness.com/ib' },
  { id: 'xm', name: 'XM Global', url: 'https://xm.com/ib' },
  { id: 'fusion', name: 'Fusion Markets', url: 'https://fusionmarkets.com/ib' },
  { id: 'blackbull', name: 'BlackBull Markets', url: 'https://blackbull.com/ib' },
];

const ALGOS = [
  { 
    id: 'tradifive_v1', 
    name: 'Tradifive v1', 
    risk: 'Aggressive', 
    deposit: 500, 
    roi: '15-25% / month',
    desc: 'Aggressive compounding algorithm designed for rapid growth on smaller account balances.' 
  }
];

const boxStyle = "p-5 md:p-6 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:rounded-[22px] dark:shadow-none";

export default function AITrading() {
  const [setupPath, setSetupPath] = useState<"new" | "transfer" | null>(null);
  const [selectedBroker, setSelectedBroker] = useState("");
  const [selectedAlgo, setSelectedAlgo] = useState<string | null>(null);
  
  const [proofUploaded, setProofUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [mt5Account, setMt5Account] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<"pending" | "active" | "inactive">("inactive");
  const [hasPaid, setHasPaid] = useState(false);

  // Fake toggle just so you (the admin) can test both success and failure states easily in UI
  const [demoHasDeposited, setDemoHasDeposited] = useState(false);

  const navigate = useNavigate();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setProofUploaded(true);
      toast.success("Proof uploaded successfully!", { description: "Our admin team will review it shortly." });
    }, 1500);
  };

  const handleVerify = () => {
    if (!mt5Account) {
      toast.error("Please enter your MT5 Account Number");
      return;
    }
    
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      
      const algo = ALGOS.find(a => a.id === selectedAlgo);
      
      if (!demoHasDeposited) {
        toast.error(`Minimum Deposit Not Met`, {
          description: `The ${algo?.name} requires a minimum deposit of $${algo?.deposit}. Our system detected $0.00 in MT5 Account ${mt5Account}.`,
          duration: 6000,
          icon: <ShieldAlert className="text-red-500" />
        });
        return;
      }

      setIsConnected(true);
      setLicenseStatus("active");
      toast.success("Verification Successful!", {
        description: `Deposit requirement of $${algo?.deposit} met. License generated for ${algo?.name}.`
      });
    }, 2000);
  };

  const handleDownloadAndGoToDashboard = () => {
    localStorage.setItem("tradifive_auto_trade_setup", "true");
    window.dispatchEvent(new Event("tradifive_auto_trade_setup_done"));
    toast.success("Downloading Tradifive v1.ex5...", { description: "Your dashboard will now track live trades." });
    setTimeout(() => {
      navigate('/auto-trade/dashboard');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-none mx-auto w-full font-sans select-none px-2 md:px-6">
        
        {/* Header - Styled like RiskGuard */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 w-full mt-4">
           <div className="flex-1">
              <h1 className="text-[24px] font-bold text-slate-800 dark:text-[#F7F8FA] tracking-tight leading-none">AI Trading</h1>
              <p className="text-[12px] text-slate-500 dark:text-[#8B95A5] mt-2 font-normal">Automate your trading with our institutional-grade algorithms. Get the EA 100% Free.</p>
           </div>
           
           <div className="flex-none flex justify-end">
              <div className="px-4 py-2 rounded-[22px] border-2 relative group w-full sm:w-auto transition-all duration-300 border-white bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:bg-none dark:bg-[#191B1E] dark:border-[1px] dark:border-[#2B2F35] dark:rounded-[22px] dark:shadow-none">
                 <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 bg-white dark:bg-[#1A1A1C] text-slate-400 border border-slate-200 dark:border-[#2B2F35] shadow-sm">
                          <Play size={14} strokeWidth={2.5} className="text-slate-600 dark:text-slate-300" />
                       </div>
                       <div className="pr-1">
                          <h3 className="text-[13px] font-bold text-slate-800 dark:text-[#F5F7FA] leading-tight">Test Deposit</h3>
                          <p className="text-[10px] font-medium text-slate-400 dark:text-[#6F7A89] mt-0.5">Force success or fail</p>
                       </div>
                    </div>
                    <div className="flex items-center">
                       <button 
                         onClick={() => setDemoHasDeposited(!demoHasDeposited)}
                         className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${demoHasDeposited ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-rose-500/10 text-rose-600 border-rose-500/30'}`}
                       >
                         {demoHasDeposited ? 'YES ($5000)' : 'NO ($0)'}
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Onboarding Steps */}
          <div className="lg:col-span-7 space-y-6">

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-10 pb-4">
              
              {/* Step 1: Broker Setup & Proof */}
              <div className="relative pl-8">
                <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-[#F8F9FC] dark:ring-[#121214]">1</div>
                <div className={`${boxStyle}`}>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-[#F7F8FA] mb-1">Broker Setup & Proof</h3>
                  <p className="text-[12px] text-slate-500 dark:text-[#8B95A5] mb-6">Connect your broker account to Tradifive and upload proof.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    <button 
                      onClick={() => { setSetupPath("new"); setSelectedBroker(""); }}
                      className={`p-4 rounded-xl border text-left transition-all ${setupPath === "new" ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-[#2B2F35]/40 shadow-sm' : 'border-slate-200 dark:border-[#2B2F35] bg-white dark:bg-[#1A1A1C] hover:border-slate-300 dark:hover:border-white/20'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-bold text-slate-900 dark:text-[#F7F8FA]">Open New Account</span>
                        {setupPath === "new" && <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#8B95A5]">Create a brand new broker account.</p>
                    </button>
                    
                    <button 
                      onClick={() => { setSetupPath("transfer"); setSelectedBroker(""); }}
                      className={`p-4 rounded-xl border text-left transition-all ${setupPath === "transfer" ? 'border-slate-900 bg-slate-50 dark:border-white dark:bg-[#2B2F35]/40 shadow-sm' : 'border-slate-200 dark:border-[#2B2F35] bg-white dark:bg-[#1A1A1C] hover:border-slate-300 dark:hover:border-white/20'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-bold text-slate-900 dark:text-[#F7F8FA]">Change IB (Transfer)</span>
                        {setupPath === "transfer" && <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#8B95A5]">Link an existing account to Tradifive.</p>
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {setupPath === "new" && (
                      <motion.div 
                        key="new"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pt-3">
                          <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Supported Brokers:</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {BROKERS.map(broker => (
                              <a 
                                key={broker.id}
                                href={broker.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#151518] border border-slate-200 dark:border-[#2B2F35] rounded-xl hover:border-slate-900 dark:hover:border-white transition-colors group"
                              >
                                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white text-center flex items-center gap-1.5">
                                  {broker.name} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {setupPath === "transfer" && (
                      <motion.div 
                        key="transfer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-3 pt-3">
                          <div className="bg-slate-50/50 dark:bg-[#1A1A1C] p-4 rounded-xl border border-slate-200 dark:border-[#2B2F35]">
                            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-2">Select your current broker for instructions:</p>
                            
                            <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                              <SelectTrigger className="w-full bg-white dark:bg-[#151518] border-slate-200 dark:border-[#2B2F35] rounded-lg h-10 text-[13px] text-slate-900 dark:text-[#F7F8FA]">
                                <SelectValue placeholder="-- Choose Broker --" />
                              </SelectTrigger>
                              <SelectContent>
                                {BROKERS.map(b => (
                                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {selectedBroker && (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-white dark:bg-[#151518] border border-slate-200 dark:border-[#2B2F35] rounded-lg"
                              >
                                <h4 className="text-[12px] font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2"><Mail className="w-3.5 h-3.5" /> Email Template</h4>
                                <p className="text-[11px] text-slate-500 dark:text-[#8B95A5] mb-2.5">Send this from your registered email to <strong>support@{selectedBroker}.com</strong>:</p>
                                <div className="bg-slate-50 dark:bg-[#1A1A1C] p-3 rounded-md border border-slate-100 dark:border-white/5 relative">
                                  <p className="text-[11px] font-mono text-slate-700 dark:text-slate-300">
                                    Subject: Change IB<br/><br/>
                                    Hello,<br/>
                                    Please move my account under IB: <strong>TRDF940182</strong>.
                                  </p>
                                  <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" onClick={() => handleCopy("Please move my trading account under Partner IB Number: TRDF940182")}><Copy className="w-3.5 h-3.5" /></button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Upload Proof Section */}
                  <AnimatePresence>
                    {setupPath && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 border-t border-slate-200 dark:border-[#2B2F35] pt-5">
                          <h4 className="text-[13px] font-bold text-slate-900 dark:text-[#F7F8FA] mb-1.5">Upload Account Proof</h4>
                          <p className="text-[11px] text-slate-500 dark:text-[#8B95A5] mb-4">Upload a screenshot of your broker dashboard showing your MT5 account under our IB.</p>
                          
                          {!proofUploaded ? (
                            <button 
                              onClick={handleUpload} 
                              disabled={isUploading} 
                              className="w-full border-2 border-dashed border-slate-300 dark:border-[#2B2F35] rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#151518] hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
                            >
                              {isUploading ? (
                                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-white rounded-full animate-spin"></div>
                              ) : (
                                <>
                                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1A1A1C] flex items-center justify-center mb-1">
                                    <UploadCloud className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                                  </div>
                                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">Click to upload screenshot</span>
                                  <span className="text-[10px] font-medium text-slate-400">PNG, JPG up to 5MB</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                 <div>
                                   <p className="text-[12px] font-bold text-emerald-900 dark:text-emerald-400">Proof Submitted</p>
                                   <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-500/80">Pending admin approval</p>
                                 </div>
                               </div>
                               <button 
                                 onClick={() => setProofUploaded(false)} 
                                 className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 underline underline-offset-2"
                               >
                                 Replace
                               </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Step 2: One-Time Fee */}
              <div className="relative pl-8">
                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-[#F8F9FC] dark:ring-[#121214] transition-colors ${proofUploaded ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-[#2B2F35] text-slate-500'}`}>2</div>
                <div className={`${boxStyle} transition-all duration-300 ${!proofUploaded ? 'opacity-50 grayscale-[20%] pointer-events-none' : ''}`}>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-[#F7F8FA] mb-1">Pay One-Time Activation Fee</h3>
                  <p className="text-[12px] text-slate-500 dark:text-[#8B95A5] mb-5">Pay the one-time activation fee to unlock lifetime access to our AI bots.</p>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#2B2F35] rounded-xl">
                     <div>
                        <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">Lifetime Access</p>
                        <p className="text-[18px] font-bold text-slate-900 dark:text-white">₹1,00,000</p>
                     </div>
                     <Button
                        onClick={() => {
                          toast.success("Payment successful!");
                          setHasPaid(true);
                        }}
                        disabled={hasPaid}
                        className={`rounded-xl px-6 h-11 text-[13px] font-semibold shadow-sm transition-all ${hasPaid ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                     >
                        {hasPaid ? (
                           <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Paid Successfully</span>
                        ) : "Pay Now"}
                     </Button>
                  </div>
                </div>
              </div>

              {/* Step 3: Choose AI Algo */}
              <div className="relative pl-8">
                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-[#F8F9FC] dark:ring-[#121214] transition-colors ${hasPaid ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-[#2B2F35] text-slate-500'}`}>3</div>
                <div className={`${boxStyle} transition-all duration-300 ${!hasPaid ? 'opacity-50 grayscale-[20%] pointer-events-none' : ''} p-8`}>
                  
                  {/* Top Header of Step 3 matching the screenshot */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h3 className="text-[22px] font-medium tracking-tight leading-tight">
                      <span className="text-slate-400 dark:text-slate-500">Automated systems spot</span><br/>
                      <span className="text-slate-900 dark:text-white">opportunities — and Trade them</span>
                    </h3>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                      <button className="px-4 py-1.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-full shadow-sm flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Algorithm
                      </button>
                      <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Backtest</button>
                      <button className="px-4 py-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Deploy</button>
                    </div>
                  </div>
                  
                  {/* Cards Container */}
                  <div className="relative flex flex-col md:flex-row w-full md:min-h-[300px]">
                    {/* Left Light Card */}
                    <div className="w-full md:w-[62%] bg-[#F5F5F5] dark:bg-[#111111] p-6 rounded-2xl flex flex-col justify-between border border-slate-200/60 dark:border-white/5 z-0 pb-[100px] md:pb-6">
                       <div>
                          <h4 className="text-[18px] text-slate-900 dark:text-white leading-tight font-medium mb-3 tracking-tight">Tradifive (v1.0.0)<br/>added institutional logic</h4>
                          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed md:max-w-[85%]">
                            Algorithms monitor the market tick-by-tick, identifying optimal entries and executing trades with precision, avoiding emotional noise.
                          </p>
                       </div>
                       <div className="mt-8">
                          <div className="flex flex-wrap gap-2 mb-6">
                             <span className="px-3 py-1 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-sm">v1.0.0</span>
                             <span className="px-3 py-1 bg-[#E8F5E9] dark:bg-[#1B2B1E] text-[#2E7D32] dark:text-[#4CAF50] rounded-full text-[11px] font-medium border border-[#C8E6C9] dark:border-transparent">Open source</span>
                             <span className="px-3 py-1 bg-white dark:bg-[#1E1E1E] border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-medium text-slate-700 dark:text-slate-300 shadow-sm">database</span>
                          </div>
                          <div className="flex justify-between items-center text-[12px]">
                             <span className="text-slate-400">(27) setups found</span>
                             <span className="text-slate-900 dark:text-white underline underline-offset-2 font-medium cursor-pointer">Read more</span>
                          </div>
                       </div>
                    </div>
                    
                    {/* Right Dark Card Overlay */}
                    <div className="w-full md:w-[50%] md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 bg-[#1C1C1C] text-white p-7 rounded-2xl shadow-2xl flex flex-col justify-between border border-white/10 z-10 -mt-[80px] md:mt-0 min-h-[260px]">
                       <div>
                          <h4 className="text-[17px] font-medium mb-3">Secure execution</h4>
                          <p className="text-[13px] text-[#A0A0A0] leading-relaxed">
                            No trades without strict risk-management. AI must backtest any strategy that executes live positions on your account.
                          </p>
                       </div>
                       <div className="mt-8">
                          <p className="text-[11px] text-[#707070] mb-5">v1.0.0 securely encrypted</p>
                          <div className="flex items-center justify-between">
                             <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#4CAF50] bg-[#4CAF50]/10 px-3 py-1.5 rounded-full border border-[#4CAF50]/20">
                               <CheckCircle2 className="w-3.5 h-3.5"/> Deployed
                             </span>
                             <button 
                               onClick={() => setSelectedAlgo("tradifive_v1")}
                               className="bg-white text-black px-4 py-2 rounded-full text-[13px] font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1 shadow-md"
                             >
                               {selectedAlgo === "tradifive_v1" ? "Selected ✓" : "Activate Algo →"}
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Step 4: Verify MT5 */}
              <div className="relative pl-8">
                <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ring-4 ring-[#F8F9FC] dark:ring-[#121214] transition-colors ${selectedAlgo ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-200 dark:bg-[#2B2F35] text-slate-500'}`}>4</div>
                <div className={`${boxStyle} transition-all duration-300 ${!selectedAlgo ? 'opacity-50 grayscale-[20%] pointer-events-none' : ''}`}>
                  <h3 className="text-[16px] font-bold text-slate-900 dark:text-[#F7F8FA] mb-1">Connect & Verify Balance</h3>
                  <p className="text-[12px] text-slate-500 dark:text-[#8B95A5] mb-5">
                    Enter your MT5 Account Number to verify your <strong>${ALGOS.find(a => a.id === selectedAlgo)?.deposit}</strong> deposit.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="e.g. 8492018" 
                      className="flex-1 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#2B2F35] rounded-xl px-4 py-2.5 text-[13px] text-slate-900 dark:text-[#F7F8FA] focus:outline-none focus:ring-1 focus:ring-slate-400 font-medium shadow-sm"
                      value={mt5Account}
                      onChange={(e) => setMt5Account(e.target.value)}
                    />
                    <Button 
                      onClick={handleVerify} 
                      disabled={isConnected || isVerifying} 
                      className={`rounded-xl px-6 h-11 text-[13px] font-semibold shadow-sm transition-all ${isConnected ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900'}`}
                    >
                      {isVerifying ? (
                         <div className="flex items-center gap-2">
                           <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                           Checking
                         </div>
                      ) : isConnected ? (
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Verified</span>
                      ) : "Verify Deposit"}
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: License */}
          <div className="lg:col-span-5 sticky top-6">
            <div className={`${boxStyle} flex flex-col`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-bold text-slate-900 dark:text-[#F7F8FA] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-slate-700 dark:text-slate-300" /> License Status
                </h3>
                {licenseStatus === "active" ? (
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Active
                  </span>
                ) : (
                  <span className="bg-slate-100 dark:bg-[#1A1A1C] text-slate-400 dark:text-[#6F7A89] border border-slate-200 dark:border-[#2B2F35] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Inactive
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#1A1A1C] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#2B2F35] w-fit mb-4 mx-auto">
                <FileCode2 className="w-4 h-4 text-slate-500" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-[#8B95A5]">Tradifive v1.ex5</span>
              </div>
              
              {licenseStatus !== "active" ? (
                <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-slate-50/50 dark:bg-[#1A1A1C] rounded-xl border border-slate-200 dark:border-[#2B2F35]">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-[#2B2F35] border border-slate-200 dark:border-transparent flex items-center justify-center mb-4 shadow-sm">
                    <Lock className="w-5 h-5 text-slate-400 dark:text-[#6F7A89]" />
                  </div>
                  <h4 className="text-[14px] font-bold text-slate-800 dark:text-[#F7F8FA] mb-1.5">License Locked</h4>
                  <p className="text-[12px] text-slate-500 dark:text-[#8B95A5] max-w-[200px] leading-relaxed">
                    Complete setup steps to verify deposit and unlock EA download.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-slate-50 dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#2B2F35] rounded-xl p-3 mb-5 flex items-center gap-3">
                    <div className="bg-white dark:bg-[#2B2F35] border border-slate-100 dark:border-transparent shadow-sm p-2 rounded-lg">
                      <Brain className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-0.5">Assigned Bot</p>
                      <p className="font-bold text-slate-900 dark:text-white text-[13px]">{ALGOS.find(a => a.id === selectedAlgo)?.name}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#1A1A1C] rounded-xl p-4 mb-2 border border-slate-200 dark:border-[#2B2F35]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#8B95A5] mb-2">Universal Key</p>
                    <div className="font-mono text-[16px] flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span className="tracking-widest">TRDF-8492-AX91</span>
                      <button onClick={() => handleCopy("TRDF-8492-AX91")} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1.5 bg-white dark:bg-[#2B2F35] rounded-md shadow-sm border border-slate-200 dark:border-transparent">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={licenseStatus === "active" ? handleDownloadAndGoToDashboard : undefined}
                disabled={licenseStatus !== "active"} 
                className={`w-full mt-6 font-bold flex items-center gap-2 justify-center rounded-xl h-12 text-[13px] shadow-sm transition-all ${licenseStatus === "active" ? 'bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 hover:scale-[1.01]' : 'bg-slate-100 dark:bg-[#1A1A1C] text-slate-400 dark:text-[#6F7A89] cursor-not-allowed border border-slate-200 dark:border-[#2B2F35]'}`}
              >
                <Download className="w-4 h-4" /> {licenseStatus === "active" ? "Download Bot & View Dashboard" : "Complete Setup to Download"}
              </Button>
            </div>
            
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
