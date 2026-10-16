const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

// 1. Layout
code = code.replace(
  'className="p-4 md:p-8 max-w-7xl mx-auto pb-24 space-y-6 font-sans"',
  'className="w-full px-4 md:px-6 py-6 pb-24 space-y-6 font-sans"'
);

// 2. TABS array
const newTabs = `const TABS = [
  { id: 'students', label: 'Student CRM', icon: Users },
  { id: 'signals', label: 'Signals & Feed', icon: Pin },
  { id: 'classroom', label: 'Classroom', icon: BookOpen },
  { id: 'vault', label: 'Resource Vault', icon: Crown },
  { id: 'insights', label: 'Performance Insights', icon: BarChart2 },
];`;
code = code.replace(/const TABS = \[[\s\S]*?\];/, newTabs);

// 3. Tab Mapping
const newTabMapping = `const tabContent: Record<string, React.ReactNode> = {
    students: <StudentsTab navigate={navigate} />,
    signals: <SignalsTab />,
    classroom: <ClassroomTab />,
    vault: <ResourceVaultTab />,
    insights: <InsightsTab />,
  };`;
code = code.replace(/const tabContent: Record<string, React\.ReactNode> = \{[\s\S]*?\};/, newTabMapping);

// 4. Rename Functions
code = code.replace(/function LessonsTab\(\) \{/g, 'function ClassroomTab() {');
code = code.replace(/function GuidanceTab\(\) \{/g, 'function SignalsTab() {');

// 5. Update StudentsTab title & desc
code = code.replace(
  'Student Roster',
  'Student CRM'
);
code = code.replace(
  'Manage your students and create groups',
  'Manage your students, view tiers, and track progress'
);

// 6. Update ClassroomTab title
code = code.replace(
  'Lesson Plans',
  'Classroom'
);
code = code.replace(
  'Create and manage educational modules',
  'Create and manage structured courses and modules'
);

// 7. Update SignalsTab title
code = code.replace(
  'Guidance Posts',
  'Signals & Feed'
);
code = code.replace(
  'Share insights and market updates',
  'Share trade signals, chart markups, and market updates'
);

// 8. We need to add a ResourceVaultTab right before InsightsTab
const vaultCode = `
function ResourceVaultTab() {
  const [files, setFiles] = useState([
    { id: 1, name: 'Pro Scalper EA.ex5', type: 'Expert Advisor', size: '1.2 MB', downloads: 124, date: '2 days ago' },
    { id: 2, name: 'Liquidity Sweeps Indicator.pine', type: 'TradingView Script', size: '45 KB', downloads: 342, date: '1 week ago' },
    { id: 3, name: 'Mentorship Rulebook v2.pdf', type: 'PDF Document', size: '3.4 MB', downloads: 89, date: '3 weeks ago' }
  ]);

  return (
    <div className="space-y-5 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#171717] dark:to-[#0A0A0A] border-2 border-white dark:border-[#262626] rounded-[22px] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#262626] premium-flat-card p-5 md:p-6">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
        <div>
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <Crown size={16} className="text-blue-500" /> Resource Vault
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Share EAs, indicators, and PDFs with your students</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-purple-500 hover:bg-purple-600 text-white transition-all shadow-sm shadow-purple-500/20">
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
            <div className="flex items-center gap-4 text-[12px] font-bold text-slate-400 shrink-0">
              <span className="flex flex-col items-center"><span className="text-slate-700 dark:text-slate-300">{f.downloads}</span><span className="text-[9px] uppercase">downloads</span></span>
              <span className="flex flex-col items-center"><span className="text-slate-700 dark:text-slate-300">{f.date}</span><span className="text-[9px] uppercase">uploaded</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsTab() {
`;

code = code.replace('function InsightsTab() {', vaultCode);

// Add some mock trade alerts to SignalsTab
const tradeAlertMock = `  const [posts, setPosts] = useState([
    { id: 99, title: 'TRADE ALERT: LONG EURUSD', body: 'Entry: 1.0950\\nTake Profit: 1.1020\\nStop Loss: 1.0920\\n\\nWait for the M15 sweep of Asian session lows before executing.', tag: 'Trade Alert', pinned: true, likes: 142, reads: 310, time: '10m ago' },
    ...MOCK_POSTS
  ]);`;
code = code.replace('const [posts, setPosts] = useState(MOCK_POSTS);', tradeAlertMock);

// Update TAG_STYLES to include Trade Alert
code = code.replace(
  "'Market Update': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',",
  "'Market Update': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',\n  'Trade Alert': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',"
);

// Add 'Trade Alert' to the select dropdown options
code = code.replace(
  /\{?\['Strategy', 'Risk', 'Mindset', 'Market Update'\]\.map/g,
  "{['Trade Alert', 'Strategy', 'Risk', 'Mindset', 'Market Update'].map"
);

fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Mentorship Hub structurally updated!');
