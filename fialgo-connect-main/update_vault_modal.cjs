const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

const start = code.indexOf('function ResourceVaultTab({ navigate }) {') !== -1 
  ? code.indexOf('function ResourceVaultTab({ navigate }) {') 
  : code.indexOf('function ResourceVaultTab({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {');

const end = code.indexOf('function InsightsTab() {');
if (start === -1 || end === -1) {
  console.log("Could not find start or end index.");
  process.exit(1);
}

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
    
    // If they selected a channel, simulate routing there for effect
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
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-purple-100 dark:hover:bg-purple-500/20 flex items-center justify-center transition-all text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 ml-2"
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

    {/* Master Share Modal */}
    <AnimatePresence>
      {shareModalOpen && fileToShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-lg bg-white dark:bg-[#111111] rounded-[24px] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-white/5 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-extrabold text-slate-900 dark:text-white">Share Resource</h3>
                <button onClick={() => setShareModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
              <p className="text-[13px] font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1.5 mt-1">
                <Crown size={14} /> {fileToShare.name}
              </p>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-2 p-4 pb-2">
              {[
                { id: 'channels', label: 'Channels', icon: MessageCircle },
                { id: 'users', label: 'Direct Message', icon: Users },
                { id: 'groups', label: 'Student Groups', icon: Users },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setShareTab(t.id as any); setSelectedTargets([]); setSearchQuery(''); }}
                  className={\`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl transition-all font-bold text-[12px] border \${
                    shareTab === t.id 
                      ? 'bg-purple-500 text-white border-purple-500 shadow-sm shadow-purple-500/20' 
                      : 'bg-slate-50 dark:bg-[#1A1A1A] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-slate-200 dark:border-white/5'
                  }\`}
                >
                  <t.icon size={16} />
                  {t.label}
                </button>
              ))}
            </div>
            
            {/* Search */}
            <div className="px-4 pb-4">
              <input 
                type="text" 
                placeholder={\`Search \${shareTab}...\`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full text-[13px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/20 transition-all placeholder-slate-400"
              />
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 min-h-[200px]">
              {shareTab === 'channels' && channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => {
                const isSelected = selectedTargets.includes(c.id);
                return (
                  <button 
                    key={c.id} 
                    onClick={() => toggleTarget(c.id)}
                    className={\`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between \${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/10' 
                        : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#1A1A1A] hover:border-purple-200 dark:hover:border-purple-500/30'
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 \${isSelected ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}\`}>
                        <c.icon size={18} />
                      </div>
                      <div>
                        <h4 className={\`text-[14px] font-bold \${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}\`}>{c.name}</h4>
                        <span className={\`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 inline-block \${
                          c.type === 'Private' ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        }\`}>
                          {c.type} Channel
                        </span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} className="text-purple-500" />}
                  </button>
                );
              })}

              {shareTab === 'users' && users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => {
                const isSelected = selectedTargets.includes(u.id);
                return (
                  <button 
                    key={u.id} 
                    onClick={() => toggleTarget(u.id)}
                    className={\`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between \${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/10' 
                        : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#1A1A1A] hover:border-purple-200 dark:hover:border-purple-500/30'
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                        {u.avatar}
                      </div>
                      <div>
                        <h4 className={\`text-[14px] font-bold \${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}\`}>{u.name}</h4>
                        <p className="text-[11px] text-slate-500">Student</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} className="text-purple-500" />}
                  </button>
                );
              })}

              {shareTab === 'groups' && groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(g => {
                const isSelected = selectedTargets.includes(g.id);
                return (
                  <button 
                    key={g.id} 
                    onClick={() => toggleTarget(g.id)}
                    className={\`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between \${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/10' 
                        : 'border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#1A1A1A] hover:border-purple-200 dark:hover:border-purple-500/30'
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={\`w-10 h-10 rounded-full flex items-center justify-center shrink-0 \${isSelected ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}\`}>
                        <Users size={16} />
                      </div>
                      <h4 className={\`text-[14px] font-bold \${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-900 dark:text-white'}\`}>{g.name}</h4>
                    </div>
                    {isSelected && <CheckCircle2 size={20} className="text-purple-500" />}
                  </button>
                );
              })}
              
              {/* Empty state handlers */}
              {shareTab === 'channels' && channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[12px] py-4">No channels found.</p>
              )}
              {shareTab === 'users' && users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[12px] py-4">No students found.</p>
              )}
              {shareTab === 'groups' && groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[12px] py-4">No groups found.</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
              <button 
                onClick={handleSendShare}
                disabled={selectedTargets.length === 0}
                className="w-full py-3 rounded-full text-[13px] font-bold text-white bg-purple-500 hover:bg-purple-600 transition-all shadow-sm shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={15} /> 
                {selectedTargets.length > 0 ? \`Send to \${selectedTargets.length} destination\${selectedTargets.length > 1 ? 's' : ''}\` : 'Select a destination'}
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
console.log('Done');
