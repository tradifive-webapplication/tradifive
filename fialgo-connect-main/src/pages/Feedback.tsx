import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Star, Bug, MessageSquare, UploadCloud, ChevronDown, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [subRatings, setSubRatings] = useState({ performance: 0, setup: 0, trust: 0 });
  const [questions, setQuestions] = useState({
    perform: null,
    trust: null,
    losses: null,
    recommend: null
  });

  const [bugReport, setBugReport] = useState({ category: "UI Bug", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("user_feedback").insert([{
        user_id: user.id,
        rating,
        performance_rating: subRatings.performance,
        setup_rating: subRatings.setup,
        trust_rating: subRatings.trust,
        category: bugReport.category,
        description: bugReport.description
      }]);

      if (!error) {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
        // Clear form
        setRating(0);
        setBugReport({ category: "UI Bug", description: "" });
      }
    } catch (err) {
      console.error("Feedback submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubRating = (category: keyof typeof subRatings, val: number) => {
    setSubRatings(prev => ({ ...prev, [category]: val }));
  };

  const handleAnswer = (q: keyof typeof questions, val: string) => {
    setQuestions(prev => ({ ...prev, [q]: val }));
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto w-full pb-24">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mt-2 mb-10 h-[60px]">
           <div className="flex flex-col pt-1">
              <h1 
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-[32px] font-black uppercase tracking-tighter text-foreground leading-none"
              >
                Product Intelligence
              </h1>
              <p className="text-[14px] text-slate-500 font-medium tracking-tight mt-2">Operational Analytics // User Experience & Protocol refinement.</p>
           </div>
        </div>

        <div className="space-y-6 flex flex-col items-center">

           {/* A. RATING SYSTEM */}
           <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full">
             <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-10 border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm text-center">
               <h2 style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Overall Satisfaction Index</h2>
               <div className="flex justify-center gap-2 mb-8">
                 {[1, 2, 3, 4, 5].map((star) => (
                   <button 
                     key={star}
                     onMouseEnter={() => setHoverRating(star)}
                     onMouseLeave={() => setHoverRating(0)}
                     onClick={() => setRating(star)}
                     className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                   >
                     <Star size={48} className={`${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} transition-all`} strokeWidth={1} />
                   </button>
                 ))}
               </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-2xl mx-auto border-t border-slate-50 dark:border-white/5 dark:border-white/5 pt-10 mt-2">
                  {[
                    { id: 'performance', label: 'PERFORMANCE' },
                    { id: 'setup', label: 'EASE OF SETUP' },
                    { id: 'trust', label: 'TRUST LEVEL' }
                  ].map((cat) => (
                    <div key={cat.id} className="flex flex-col items-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{cat.label}</p>
                     <div className="flex gap-1">
                       {[1, 2, 3, 4, 5].map((star) => (
                         <button key={star} onClick={() => handleSubRating(cat.id as any, star)} className="focus:outline-none">
                           <Star size={20} className={`${subRatings[cat.id as keyof typeof subRatings] >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'} transition-colors`} />
                         </button>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </motion.section>

           {/* B. SMART QUESTIONS */}
           <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="w-full">
             <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-8 border border-slate-100 dark:border-[#333333] dark:border-white/5 shadow-sm">
               <h2 style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                 <MessageSquare size={16} className="text-slate-200" /> Contextual Insights Engine
               </h2>
               
               <div className="space-y-4">
                 {[
                   { id: 'perform', label: 'Did the bot perform up to your expectations?' },
                   { id: 'trust', label: 'Do you feel comfortable trusting the system autonomously?' },
                   { id: 'losses', label: 'Did you experience unexpected losses due to setting configurations?' },
                   { id: 'recommend', label: 'Would you recommend Fialgo to other traders?' }
                 ].map((q) => (
                    <div key={q.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 bg-slate-50 dark:bg-[#141414] border border-slate-100 dark:border-[#333333] rounded-[20px]">
                      <p className="text-[15px] font-black text-foreground uppercase tracking-tight leading-tight">{q.label}</p>
                      <div className="flex items-center gap-2 bg-white/50 dark:bg-[#141414]/50 p-1.5 rounded-xl border border-slate-200 dark:border-[#333333] shrink-0">
                        {['Yes', 'Neutral', 'No'].map(ans => (
                          <button 
                            key={ans} onClick={() => handleAnswer(q.id as any, ans)}
                            className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${questions[q.id as keyof typeof questions] === ans ? (ans === 'Yes' ? 'bg-[#10B981] text-white shadow-lg' : ans === 'No' ? 'bg-red-500 text-white shadow-lg' : 'bg-slate-900 text-white shadow-lg') : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            {ans}
                          </button>
                        ))}
                      </div>
                   </div>
                 ))}
               </div>
             </div>
           </motion.section>

           {/* C. BUG REPORT SYSTEM */}
           <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full">
             <div className="bg-white dark:bg-[#1E1E1E] rounded-[24px] p-8 border border-border/80 shadow-sm">
               <h2 style={{ fontFamily: "'Inter', sans-serif" }} className="text-[14px] font-bold text-foreground uppercase tracking-wider mb-6 flex items-center gap-2">
                 <Bug size={18} className="text-primary" /> Report an Issue
               </h2>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                   <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Issue Category</label>
                   <div className="relative">
                     <select 
                       value={bugReport.category}
                       onChange={e => setBugReport({...bugReport, category: e.target.value})}
                       className="w-full appearance-none bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#333333] rounded-xl px-4 py-3 text-[14px] font-bold text-foreground focus:outline-none focus:border-primary cursor-pointer"
                     >
                       <option>MT5 Connection Issue</option>
                       <option>Trade Execution Error</option>
                       <option>UI / Design Bug</option>
                       <option>Payment & Billing</option>
                       <option>Other</option>
                     </select>
                     <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                 </div>

                 <div>
                   <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
                   <textarea 
                     value={bugReport.description}
                     onChange={e => setBugReport({...bugReport, description: e.target.value})}
                     placeholder="Please describe exactly what went wrong..."
                     rows={4}
                     className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#333333] rounded-xl px-4 py-3 text-[14px] font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:border-primary resize-none"
                   />
                 </div>

                 <div className="border-2 border-dashed border-slate-200 dark:border-[#333333] rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 dark:bg-[#141414] transition-colors cursor-pointer group">
                   <div className="w-12 h-12 bg-white dark:bg-[#1E1E1E] rounded-full flex items-center justify-center border border-slate-200 dark:border-[#333333] mx-auto mb-3 group-hover:scale-110 transition-transform">
                     <UploadCloud size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                   </div>
                   <p className="text-[14px] font-bold text-slate-700 dark:text-slate-300">Upload screenshot</p>
                   <p className="text-[12px] font-medium text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                 </div>

                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-[14px] transition-all flex items-center justify-center gap-2 shadow-sm shadow-primary/20 disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : submitted ? <><CheckCircle2 size={18} /> Sent Successfully</> : "Submit Report"}
                  </button>
               </form>
             </div>
           </motion.section>

        </div>
      </div>
    </DashboardLayout>
  );
}




