import { motion } from "framer-motion";

interface StatusPillProps {
  connected: boolean;
}

export default function StatusPill({ connected }: StatusPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium glass ${
        connected ? "text-success" : "text-destructive"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${connected ? "bg-success" : "bg-[#D1E4FF] dark:bg-blue-500estructive"}`} />
      {connected ? "Algo Connected" : "MT5 Disconnected"}
    </motion.div>
  );
}


