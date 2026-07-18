import { useTrading } from "@/contexts/TradingContext";
import { motion, AnimatePresence } from "framer-motion";

export default function LiveTrades() {
  const { trades } = useTrading();

  return (
    <div className="mt-6 pb-24">
      <p className="mb-3 text-xs font-medium text-muted-foreground">Live Trades</p>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {trades.slice(0, 8).map((trade) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass flex items-center justify-between rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold">{trade.pair}</p>
                <p className="text-[10px] text-muted-foreground">
                  {trade.type.toUpperCase()} · {trade.lot} lot · {trade.time}
                </p>
              </div>
              <p
                className={`text-sm font-bold ${
                  trade.profit >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
