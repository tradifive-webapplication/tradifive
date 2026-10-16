import { motion } from "framer-motion";
import { useTrading } from "@/contexts/TradingContext";
import { TrendingUp, TrendingDown, Wallet, BarChart3, DollarSign } from "lucide-react";

export default function HeroCard() {
  const { balance, equity, netProfit } = useTrading();
  const isPositive = netProfit >= 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Balance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card col-span-1 premium-flat-card border dark:border-transparent"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
            <Wallet size={16} className="text-primary" />
          </div>
          <p className="text-xs text-muted-foreground dark:text-white/60">Total Balance</p>
        </div>
        <motion.p
          key={balance}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          ${balance.toLocaleString()}
        </motion.p>
      </motion.div>

      {/* Equity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card col-span-1 premium-flat-card border dark:border-transparent"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <BarChart3 size={16} className="text-muted-foreground dark:text-white/40" />
          </div>
          <p className="text-xs text-muted-foreground dark:text-white/60">Equity</p>
        </div>
        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">${equity.toLocaleString()}</p>
      </motion.div>

      {/* Net Profit */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`glass-card col-span-1 premium-pnl-card border dark:border-transparent ${isPositive ? "border-success/20" : "border-destructive/20"}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isPositive ? "bg-success/15" : "bg-destructive/15"}`}>
            <DollarSign size={16} className={isPositive ? "text-success dark:text-emerald-400" : "text-destructive"} />
          </div>
          <p className="text-xs text-muted-foreground dark:text-white/60">Net Profit</p>
        </div>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp size={18} className="text-success dark:text-emerald-400" />
          ) : (
            <TrendingDown size={18} className="text-destructive" />
          )}
          <motion.p
            key={netProfit}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold tracking-tight ${isPositive ? "text-success dark:text-emerald-450" : "text-destructive"}`}
          >
            {isPositive ? "+" : ""}${netProfit.toLocaleString()}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}


