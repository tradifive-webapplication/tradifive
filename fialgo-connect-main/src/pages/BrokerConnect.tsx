import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink,
  Shield,
  Zap,
  Globe,
  ShieldCheck,
  Headset,
  ChevronRight,
  Lock,
  Sparkles,
  Server,
  Terminal,
  Activity,
  ArrowLeft,
  Search,
  Plus,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { MT5Connector } from "@/components/MT5Connector";
import { IndianBrokerConnector } from "@/components/IndianBrokerConnector";
import { useTrading } from "@/contexts/TradingContext";
import { useMarket } from "@/contexts/MarketContext";
import { usePlan } from "@/hooks/usePlan";
import { toast } from "sonner";

const BROKERS = [
  { id: 'mt5', name: 'MetaTrader 5', icon: Server, color: 'blue', status: 'Available', market: 'forex' },
  { id: 'mt4', name: 'MetaTrader 4', icon: Terminal, color: 'indigo', status: 'Soon', market: 'forex' },
  { id: 'ibkr', name: 'Interactive Brokers', icon: Activity, color: 'emerald', status: 'Beta', market: 'forex' },
  { id: 'ic', name: 'IC Markets', icon: Globe, color: 'slate', status: 'Partner', market: 'forex' },
  { id: 'pepperstone', name: 'Pepperstone', icon: Zap, color: 'amber', status: 'Available', market: 'forex' },
  { id: 'vantage', name: 'Vantage', icon: Shield, color: 'blue', status: 'Available', market: 'forex' },
  { id: 'zerodha', name: 'Zerodha Kite', icon: Activity, color: 'blue', status: 'Available', market: 'indian' },
  { id: 'dhan', name: 'Dhan', icon: Zap, color: 'amber', status: 'Available', market: 'indian' },
  { id: 'upstox', name: 'Upstox', icon: Globe, color: 'indigo', status: 'Soon', market: 'indian' },
  { id: 'fyers', name: 'Fyers', icon: Shield, color: 'emerald', status: 'Soon', market: 'indian' },
];

export default function BrokerConnect() {
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { isProOrElite } = usePlan();
  const { activeMarket } = useMarket();

  const filteredBrokers = BROKERS.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) && b.market === activeMarket
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-10 px-6">
        <AnimatePresence mode="wait">
          {!selectedBroker ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                  <ShieldCheck size={12} />
                  Secure API Infrastructure
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Connect Broker Account</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
                  Sync your trading accounts in minutes. We support 40+ brokers via high-frequency MetaAPI and Direct FIX bridges.
                </p>
              </div>

              {/* Search Bar */}
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search for your broker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:ring-2 ring-blue-500/20 transition-all placeholder:text-slate-600 shadow-xl"
                />
              </div>

              {/* Broker Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrokers.map((broker) => (
                  <button
                    key={broker.id}
                    onClick={() => {
                      if (!isProOrElite && !['mt5', 'dhan', 'zerodha'].includes(broker.id)) {
                        toast.error("Premium Feature", {
                          description: "Upgrade to connect live proprietary brokers."
                        });
                        navigate('/upgrade');
                        return;
                      }
                      setSelectedBroker(broker.id);
                    }}
                    className="group relative bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/5 rounded-[32px] p-8 text-left hover:border-blue-500/30 transition-all hover:shadow-[0_20px_80px_rgba(37,99,235,0.08)] active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex items-start justify-between mb-10 relative z-10">
                      <div className={`p-4 rounded-2xl bg-blue-500/5 border border-white/5 group-hover:bg-blue-500 group-hover:border-blue-400 group-hover:text-white transition-all duration-300 shadow-xl shadow-black/20`}>
                        <broker.icon size={26} className={`text-blue-500 group-hover:text-white transition-colors`} />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-white/5 text-slate-500 border border-white/10`}>
                        {broker.status}
                      </span>
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-[19px] font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase">{broker.name}</h3>
                      <p className="text-[12px] text-slate-500 font-medium leading-relaxed">Direct API bridge for institutional execution telemetry.</p>
                    </div>
                    <div className="mt-8 flex items-center justify-between text-[11px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                      Initialize Sync <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
              </div>

              {/* Security Banner */}
              <div className="mt-12 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-6 max-w-2xl mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shrink-0">
                  <Lock size={22} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm mb-1 uppercase tracking-tight">Enterprise Grade Encryption</h4>
                  <p className="text-[11px] text-slate-400 font-medium">TradiFive uses AES-256 bank-level encryption. We never store your trading credentials; they are tokenized and processed in an isolated sandbox environment.</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="connector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6"
            >
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
                <div className="w-6 h-6 border-[1.5px] border-white/20 rounded-sm relative flex items-center justify-center">
                  <div className="w-3 h-[1.5px] bg-white/20" />
                </div>
                <button
                  onClick={() => setSelectedBroker(null)}
                  className="text-[12px] font-bold text-white/60 hover:text-white transition-colors"
                >
                  Close
                </button>
              </div>

              <div className="w-full max-w-md">
                {selectedBroker === 'mt5' && <MT5Connector />}
                {(selectedBroker === 'dhan' || selectedBroker === 'zerodha') && (
                  <IndianBrokerConnector brokerId={selectedBroker} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}






