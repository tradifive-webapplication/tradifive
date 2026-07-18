import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ConnectionSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/dashboard"), 3000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20 glow-success"
        >
          <CheckCircle2 size={40} className="text-success" />
        </motion.div>

        <h1 className="text-2xl font-bold">Connected!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your MT5 account is now linked to TradiFive
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-success glass">
            <span className="h-2 w-2 rounded-full bg-success" />
            Algo Connected
          </div>
        </motion.div>

        <p className="mt-8 text-[10px] text-muted-foreground">Redirecting to dashboard...</p>
      </motion.div>
    </div>
  );
}
