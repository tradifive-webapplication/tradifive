const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

const start = code.indexOf('function ResourceVaultTab({ navigate }) {') !== -1 
  ? code.indexOf('function ResourceVaultTab({ navigate }) {') 
  : code.indexOf('function ResourceVaultTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {');

const end = code.indexOf('function InsightsTab() {');

const oldVault = code.substring(start, end);

const newVault = `function ResourceVaultTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  const [files, setFiles] = useState([
    { id: 1, name: 'Pro Scalper EA.ex5', type: 'Expert Advisor', size: '1.2 MB', downloads: 124, date: '2 days ago' },
    { id: 2, name: 'Liquidity Sweeps Indicator.pine', type: 'TradingView Script', size: '45 KB', downloads: 342, date: '1 week ago' },
    { id: 3, name: 'Mentorship Rulebook v2.pdf', type: 'PDF Document', size: '3.4 MB', downloads: 89, date: '3 weeks ago' }
  ]);
  
  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<any>(null);
  
  // Modal inner state
  const [shareTab, setShareTab] = useState<'channels' | 'users' | 'groups'>('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

  // Mock data for sharing targets
  const channels = [
    { id: 'c1', name: 'General Chat', type: 'Public', icon: MessageCircle },
    { id: 'c2', name: 'VIP Mentorship', type: 'Private', icon: Shield },
    { id: 'c3', name: 'Trade Alerts', type: 'Private', icon: Zap },
  ];
  
  const users = [
    { id: 'u1', name: 'Marcus Webb', avatar: 'MW' },
    { id: 'u2', name: 'Aisha Patel', avatar: 'AP' },
    { id: 'u3', name: 'Diego Santos', avatar: 'DS' },
  ];
  
  const groups = [
    { id: 'g1', name: 'Alpha Traders' },
    { id: 'g2', name: 'Beginner Bootcamp Q2' },
  ];

  const handleOpenShare = (file: any) => {
    setFileToShare(file);
    setShareTab('channels');
    setSelectedTargets([]);
    setSearchQuery('');
    setShareModalOpen(true);
  };

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSendShare = () => {
    if (selectedTargets.length === 0) {
      toast.error('Please select at least one destination to share to.');
      return;
    }
    toast.success(\`"\${fileToShare.name}" has been shared successfully!\`);
    setShareModalOpen(false);
    
    if (shareTab === 'channels') {
      setTimeout(() => navigate('/channel'), 800);
    }
  };

  return (
    <>
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
        {files.length === 0 ? (
           <div className="text-center py-10">
             <Crown size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
             <p className="text-[14px] font-bold text-slate-500 dark:text-slate-400">No resources uploaded yet.</p>
           </div>
        ) : (
          files.map((f, i) => (
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
                
                <button 
                  onClick={() => handleOpenShare(f)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 flex items-center justify-center transition-all text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 ml-2"
                  title="Share Resource"
                >
                  <Share size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>

    {/* Master Share Modal - Aesthetic from Channel Creation */}
    <AnimatePresence>
      {shareModalOpen && fileToShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-[440px] bg-[#F8FAFC] dark:bg-[#111111] rounded-[24px] shadow-2xl overflow-hidden flex flex-col relative"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShareModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-200/60 hover:bg-slate-300 dark:bg-[#1A1A1A]/80 dark:hover:bg-[#252528] flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors z-10"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="p-6 pt-7 relative pb-4">
              <div className="mb-4 space-y-3">
                <div className="w-11 h-11 rounded-[14px] bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20 dark:ring-indigo-500/30 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
                  <Share size={18} className="fill-indigo-500/20" />
                </div>
                <div>
                  <h3 className="text-[19px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Share Resource
                  </h3>
                  <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
                    Select where you want to send <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{fileToShare.name}</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-6 flex flex-col gap-3">
              {/* Tabs matching the aesthetic */}
              <div className="flex gap-2">
                {[
                  { id: 'channels', label: 'Channels', icon: MessageCircle },
                  { id: 'users', label: 'Direct Message', icon: Users },
                  { id: 'groups', label: 'Student Groups', icon: Users },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setShareTab(t.id as any); setSelectedTargets([]); setSearchQuery(''); }}
                    className={\`flex-1 py-2.5 rounded-xl transition-all font-bold text-[11.5px] flex items-center justify-center gap-1.5 border-2 \${
                      shareTab === t.id 
                        ? 'bg-white dark:bg-[#1A1A1A] border-indigo-200 dark:border-[#333] text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-white/5'
                    }\`}
                  >
                    <t.icon size={13} />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search matching input aesthetic */}
              <input 
                type="text" 
                placeholder={\`Search \${shareTab}...\`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#1A1A1A] border-2 border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-[13px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>

            {/* List Content */}
            <div className="px-6 mt-4 mb-4 flex-1 overflow-y-auto space-y-2 max-h-[160px]">
              {shareTab === 'channels' && channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => {
                const isSelected = selectedTargets.includes(c.id);
                return (
                  <button 
                    key={c.id} 
                    onClick={() => toggleTarget(c.id)}
                    className={\`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm \${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] hover:border-slate-300 dark:hover:border-[#444]'
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-[#252528] text-slate-500'}\`}>
                        <c.icon size={14} />
                      </div>
                      <span className={\`text-[13px] font-bold \${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}\`}>{c.name}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-indigo-500" />}
                  </button>
                );
              })}

              {shareTab === 'users' && users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => {
                const isSelected = selectedTargets.includes(u.id);
                return (
                  <button 
                    key={u.id} 
                    onClick={() => toggleTarget(u.id)}
                    className={\`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm \${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] hover:border-slate-300 dark:hover:border-[#444]'
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        {u.avatar}
                      </div>
                      <span className={\`text-[13px] font-bold \${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}\`}>{u.name}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-indigo-500" />}
                  </button>
                );
              })}

              {shareTab === 'groups' && groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(g => {
                const isSelected = selectedTargets.includes(g.id);
                return (
                  <button 
                    key={g.id} 
                    onClick={() => toggleTarget(g.id)}
                    className={\`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between shadow-sm \${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] hover:border-slate-300 dark:hover:border-[#444]'
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={\`w-8 h-8 rounded-full flex items-center justify-center shrink-0 \${isSelected ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-[#252528] text-slate-500'}\`}>
                        <Users size={14} />
                      </div>
                      <span className={\`text-[13px] font-bold \${isSelected ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}\`}>{g.name}</span>
                    </div>
                    {isSelected && <Check size={16} className="text-indigo-500" />}
                  </button>
                );
              })}
              
              {/* Empty state handlers */}
              {shareTab === 'channels' && channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[12px] py-4 font-medium">No channels found.</p>
              )}
              {shareTab === 'users' && users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[12px] py-4 font-medium">No students found.</p>
              )}
              {shareTab === 'groups' && groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[12px] py-4 font-medium">No groups found.</p>
              )}
            </div>

            {/* Footer Action Area */}
            <div className="px-6 py-5 bg-white dark:bg-[#1A1A1A] flex items-center justify-center gap-6 border-t border-slate-100 dark:border-[#222]">
              <button 
                onClick={() => setShareModalOpen(false)}
                className="text-[13.5px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendShare}
                disabled={selectedTargets.length === 0}
                className="px-6 py-2.5 rounded-xl text-[13.5px] font-bold text-white bg-[#A78BFA] hover:bg-[#8B5CF6] transition-all shadow-md shadow-[#A78BFA]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Share {selectedTargets.length > 0 ? \`(\${selectedTargets.length})\` : ''} <ChevronRight size={14} className="stroke-[3px]" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
`;

code = code.replace(oldVault, newVault);
fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Done replacing modal');
