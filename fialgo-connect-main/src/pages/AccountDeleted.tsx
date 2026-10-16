import { UserX, ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function AccountDeleted() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-8 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top red accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-800" />
          
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center relative">
                <UserX className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-white tracking-tight">Account Deleted</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              This account has been permanently deleted from the TradiFive platform.
            </p>
            <p className="text-slate-500 text-xs mt-2 pb-6 border-b border-slate-800/50">
              You can no longer log in or access any services using these credentials. If you believe this is an error, please contact support.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Link 
              to="/contact" 
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-3.5 px-4 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link 
              to="/" 
              className="w-full flex items-center justify-center gap-2 bg-slate-800/50 text-slate-300 font-medium py-3.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              Return to Website
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
