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

    {/* Master Share Modal - Small & Systematic */}
    <AnimatePresence>
      {shareModalOpen && fileToShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-full max-w-sm bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share size={14} className="text-slate-400" />
                <h3 className="text-[13px] font-bold text-slate-900 dark:text-white">Share File</h3>
              </div>
              <button onClick={() => setShareModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
            
            <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">File Selected</p>
              <p className="text-[12px] font-semibold text-purple-600 dark:text-purple-400 truncate">
                {fileToShare.name}
              </p>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-1 p-3 pb-2">
              {[
                { id: 'channels', label: 'Channels' },
                { id: 'users', label: 'Users' },
                { id: 'groups', label: 'Groups' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => { setShareTab(t.id as any); setSelectedTargets([]); setSearchQuery(''); }}
                  className={\`flex-1 py-1.5 rounded-md transition-all font-bold text-[11px] \${
                    shareTab === t.id 
                      ? 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white' 
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                  }\`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            
            {/* Search */}
            <div className="px-3 pb-3">
              <input 
                type="text" 
                placeholder={\`Search \${shareTab}...\`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 rounded-md text-[12px] border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white outline-none focus:border-purple-500/50 transition-all placeholder-slate-400"
              />
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 max-h-[160px]">
              {shareTab === 'channels' && channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => {
                const isSelected = selectedTargets.includes(c.id);
                return (
                  <button 
                    key={c.id} 
                    onClick={() => toggleTarget(c.id)}
                    className={\`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between \${
                      isSelected 
                        ? 'bg-purple-50 dark:bg-purple-500/10' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }\`}
                  >
                    <div className="flex items-center gap-2.5">
                      <c.icon size={14} className={isSelected ? 'text-purple-500' : 'text-slate-400'} />
                      <span className={\`text-[12px] font-bold \${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}\`}>{c.name}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-purple-500" />}
                  </button>
                );
              })}

              {shareTab === 'users' && users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).map(u => {
                const isSelected = selectedTargets.includes(u.id);
                return (
                  <button 
                    key={u.id} 
                    onClick={() => toggleTarget(u.id)}
                    className={\`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between \${
                      isSelected 
                        ? 'bg-purple-50 dark:bg-purple-500/10' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }\`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[9px] font-bold text-slate-500">
                        {u.avatar}
                      </div>
                      <span className={\`text-[12px] font-bold \${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}\`}>{u.name}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-purple-500" />}
                  </button>
                );
              })}

              {shareTab === 'groups' && groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(g => {
                const isSelected = selectedTargets.includes(g.id);
                return (
                  <button 
                    key={g.id} 
                    onClick={() => toggleTarget(g.id)}
                    className={\`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between \${
                      isSelected 
                        ? 'bg-purple-50 dark:bg-purple-500/10' 
                        : 'hover:bg-slate-50 dark:hover:bg-white/5'
                    }\`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users size={14} className={isSelected ? 'text-purple-500' : 'text-slate-400'} />
                      <span className={\`text-[12px] font-bold \${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}\`}>{g.name}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-purple-500" />}
                  </button>
                );
              })}
              
              {/* Empty state handlers */}
              {shareTab === 'channels' && channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[11px] py-4">No channels found.</p>
              )}
              {shareTab === 'users' && users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[11px] py-4">No students found.</p>
              )}
              {shareTab === 'groups' && groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-slate-500 text-[11px] py-4">No groups found.</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2">
              <button 
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-1.5 rounded-full text-[12px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendShare}
                disabled={selectedTargets.length === 0}
                className="px-5 py-1.5 rounded-full text-[12px] font-bold text-white bg-purple-500 hover:bg-purple-600 transition-all shadow-sm shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Share {selectedTargets.length > 0 ? \`(\${selectedTargets.length})\` : ''}
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
