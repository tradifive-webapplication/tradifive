import { motion } from "framer-motion";
import { Check, Circle, ArrowRight, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTrading } from "@/contexts/TradingContext";
import { Progress } from "@/components/ui/progress";

interface ChecklistItem {
  label: string;
  completed: boolean;
  route: string;
}

export default function GetStartedChecklist() {
  const navigate = useNavigate();
  const { isConnected, strategy, brokerConnected } = useTrading();

  const items: ChecklistItem[] = [
    { label: "Create Fialgo Account", completed: true, route: "/profile" },
    { label: "Start Your First Bot", completed: !!strategy, route: "/strategy" },
    { label: "Connect Trading Account", completed: brokerConnected, route: "/broker-connect" },
    { label: "Choose Your Plan (Free / Paid)", completed: false, route: "/settings" },
  ];

  const completedCount = items.filter((i) => i.completed).length;
  const progress = Math.round((completedCount / items.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card mt-6 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket size={16} className="text-primary" />
          <h3 className="text-sm font-bold">Get Started</h3>
        </div>
        <span className="text-xs font-semibold text-primary">{progress}%</span>
      </div>

      <Progress value={progress} className="h-2 mb-5 bg-muted" />

      <div className="space-y-1">
        {items.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.06 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.route)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm hover:bg-accent/50 transition-colors group"
          >
            {item.completed ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success/15">
                <Check size={14} className="text-success" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border">
                <Circle size={10} className="text-muted-foreground" />
              </div>
            )}
            <span className={`flex-1 text-left font-medium ${item.completed ? "text-muted-foreground line-through" : ""}`}>
              {item.label}
            </span>
            {!item.completed && (
              <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
