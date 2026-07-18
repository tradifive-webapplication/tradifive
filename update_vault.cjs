const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

const start = code.indexOf('function ResourceVaultTab() {');
const end = code.indexOf('function InsightsTab() {');

const oldVault = code.substring(start, end);

const newVault = `function ResourceVaultTab() {
  const [files, setFiles] = useState([
    { id: 1, name: 'Pro Scalper EA.ex5', type: 'Expert Advisor', size: '1.2 MB', downloads: 124, date: '2 days ago' },
    { id: 2, name: 'Liquidity Sweeps Indicator.pine', type: 'TradingView Script', size: '45 KB', downloads: 342, date: '1 week ago' },
    { id: 3, name: 'Mentorship Rulebook v2.pdf', type: 'PDF Document', size: '3.4 MB', downloads: 89, date: '3 weeks ago' }
  ]);
  const [sharingFileId, setSharingFileId] = useState<number | null>(null);

  return (
    <div className="space-y-5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#171717] dark:to-[#0A0A0A] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#262626] premium-flat-card p-5 md:p-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
        <div>
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <Crown size={16} className="text-blue-500" /> Resource Vault
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Share EAs, indicators, and PDFs with your students</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-sm shadow-purple-500/20">
          <Plus size={14} /> Upload File
        </button>
      </div>

      <div className="space-y-3">
        {files.map((f, i) => (
          <div key={f.id} className="p-4 rounded-xl border border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1C1C1C] hover:bg-slate-100/80 dark:hover:bg-[#222] transition-all flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0">
              <Crown size={18} className="text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug">{f.name}</h3>
              <p className="text-[12px] text-slate-500">{f.type} · {f.size}</p>
            </div>
            <div className="flex items-center gap-6 text-[12px] font-bold text-slate-400 shrink-0">
              <span className="flex flex-col items-center"><span className="text-slate-700 dark:text-slate-300">{f.downloads}</span><span className="text-[9px] uppercase">downloads</span></span>
              <span className="flex flex-col items-center"><span className="text-slate-700 dark:text-slate-300">{f.date}</span><span className="text-[9px] uppercase">uploaded</span></span>
              
              <div className="relative">
                <button 
                  onClick={() => setSharingFileId(sharingFileId === f.id ? null : f.id)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-all text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 ml-2"
                  title="Share Resource"
                >
                  <Share size={14} />
                </button>
                
                <AnimatePresence>
                  {sharingFileId === f.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#262626] rounded-xl shadow-lg border border-slate-200 dark:border-white/10 z-10 py-1.5 overflow-hidden"
                    >
                      <button onClick={() => { toast.success('Shared to all students!'); setSharingFileId(null); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-all">
                        <Users size={15} className="text-slate-400" /> All Students
                      </button>
                      <button onClick={() => { toast.success('Shared to Community Channel!'); setSharingFileId(null); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-all">
                        <MessageCircle size={15} className="text-slate-400" /> Channel
                      </button>
                      <button onClick={() => { toast.success('Select a group to share with...'); setSharingFileId(null); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-all">
                        <Users size={15} className="text-slate-400" /> Specific Group
                      </button>
                      <button onClick={() => { toast.success('Link copied! Paste in inbox to send.'); setSharingFileId(null); }} className="w-full text-left px-4 py-2.5 text-[13px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-all">
                        <Pin size={15} className="text-slate-400" /> Copy for Inbox
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`;

code = code.replace(oldVault, newVault);
fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Done');
