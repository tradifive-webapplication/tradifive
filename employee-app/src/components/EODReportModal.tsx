import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, FileText } from "lucide-react";

interface EODReportModalProps {
  onClose: () => void;
  onSubmit: (reportText: string) => Promise<void>;
  totalMinutes: number;
}

export default function EODReportModal({ onClose, onSubmit, totalMinutes }: EODReportModalProps) {
  const [report, setReport] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.trim()) return;
    
    setSubmitting(true);
    try {
      await onSubmit(report);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121212] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
            <FileText size={16} className="text-indigo-400" /> End of Day Report
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
            <div>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Session Total</p>
              <p className="text-2xl font-black text-white mt-1">{formatMinutes(totalMinutes)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              What did you accomplish today? *
            </label>
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="e.g., Completed the frontend PR, reviewed the new MT5 integration, and fixed bugs..."
              rows={5}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-indigo-500 resize-none"
              required
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-[11px] font-bold text-neutral-400 hover:text-white uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !report.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-[11px] font-bold uppercase tracking-widest transition-colors"
            >
              <Send size={14} />
              {submitting ? "Submitting..." : "Submit & Check Out"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
