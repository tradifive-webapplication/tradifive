import { useTrading } from "@/contexts/TradingContext";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { useMemo } from "react";

function ActivityFeed() {
  const { trades, isAlgoRunning } = useTrading();

  const feed = useMemo(() => {
    return trades.slice(0, 6).map((t) => ({
      id: t.id,
      icon: t.profit >= 0 ? CheckCircle2 : AlertCircle,
      text: t.profit >= 0
        ? `Profit booked on ${t.pair}`
        : `SL hit on ${t.pair}`,
      color: t.profit >= 0 ? "text-success" : "text-destructive",
      time: t.time,
    }));
  }, [trades]);

  return (
    <div className="mt-6">
      <p className="mb-3 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Activity size={12} />
        Activity Feed
      </p>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {feed.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 glass"
            >
              <item.icon size={14} className={`mt-0.5 shrink-0 ${item.color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{item.text}</p>
                <p className="text-[10px] text-muted-foreground">{item.time}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {!isAlgoRunning && (
        <p className="mt-3 text-center text-[10px] text-muted-foreground">
          Start algo to see live activity
        </p>
      )}
    </div>
  );
}

export default function LivePanel() {
  const { trades } = useTrading();

  return (
    <aside className="fixed right-0 top-0 z-30 h-screen w-[320px] border-l border-glass-border bg-card/30 backdrop-blur-2xl overflow-y-auto">
      <div className="p-5">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Live Trades
        </h3>

        <div className="mt-4 space-y-2">
          <AnimatePresence initial={false}>
            {trades.slice(0, 8).map((trade) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass flex items-center justify-between rounded-xl px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    {trade.profit >= 0 ? (
                      <TrendingUp size={12} className="text-success" />
                    ) : (
                      <TrendingDown size={12} className="text-destructive" />
                    )}
                    <p className="text-xs font-semibold">{trade.pair}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {trade.type.toUpperCase()} · {trade.lot} lot · {trade.time}
                  </p>
                </div>
                <p
                  className={`text-xs font-bold ${
                    trade.profit >= 0 ? "text-success" : "text-destructive"
                  }`}
                >
                  {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <ActivityFeed />
      </div>
    </aside>
  );
}
