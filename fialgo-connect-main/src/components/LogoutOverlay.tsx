import { motion } from "framer-motion";

export default function LogoutOverlay() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-[#0d0d0f] flex flex-col items-center justify-center text-center p-6"
    >
      <div className="space-y-2">
        <h2 className="text-white text-[17px] font-medium tracking-tight">Logging out of all accounts</h2>
        <p className="text-slate-500 text-[13px] font-medium">Please wait</p>
        
        {/* Subtle Progress Bar */}
        <div className="w-32 h-[2px] bg-white/5 rounded-full mt-6 overflow-hidden relative mx-auto">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "linear"
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
}
