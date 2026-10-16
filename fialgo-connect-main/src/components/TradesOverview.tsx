import { motion } from "framer-motion";
import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { useTrading } from "@/contexts/TradingContext";

const cards = [
  { label: "Open Trades", icon: TrendingUp, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Pending Trades", icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-500/10" },
  { label: "Closed Trades", icon: CheckCircle2, color: "text-success", bgColor: "bg-success/10" },
];

export default function TradesOverview() {
  const { trades, isAlgoRunning } = useTrading();

  const counts = [
    isAlgoRunning ? Math.floor(trades.length * 0.3) : 0,
    isAlgoRunning ? Math.floor(trades.length * 0.15) : 0,
    trades.length,
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mt-6">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ scale: 1.02 }}
          className="glass-card flex items-center gap-3"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.bgColor}`}>
            <card.icon size={18} className={card.color} />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">{card.label}</p>
            <motion.p
              key={counts[i]}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold"
            >
              {counts[i]}
            </motion.p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
