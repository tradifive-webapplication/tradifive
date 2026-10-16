const fs = require('fs');

const path = 'src/components/journal/JournalTradesTable.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update imports
const oldImport = `import { Share2, Info, ArrowUpRight, ArrowDownRight, ChevronDown, LayoutGrid } from "lucide-react";`;
const newImport = `import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { 
  ChevronDown as IconlyChevronDown, 
  Category as IconlyCategory, 
  InfoSquare as IconlyInfoSquare, 
  Send as IconlySend 
} from "react-iconly";`;

code = code.replace(oldImport, newImport);

// 2. Replace Info icon usages in metrics bar with IconlyInfoSquare
code = code.replace(
  `<Info size={10} />`,
  `<IconlyInfoSquare set="curved" primaryColor="currentColor" size={11} stroke="bold" className="text-slate-400 dark:text-slate-500" />`
);

// 3. Replace LayoutGrid usage
code = code.replace(
  `<LayoutGrid size={16} />`,
  `<IconlyCategory set="curved" primaryColor="currentColor" size={15} stroke="bold" />`
);

// 4. Replace ChevronDown in Close All
code = code.replace(
  `Close All <ChevronDown size={14} />`,
  `Close All <IconlyChevronDown set="curved" primaryColor="currentColor" size={11} stroke="bold" />`
);

// 5. Replace Share2 icon with IconlySend (paper plane)
code = code.replace(
  `<Share2 size={16} />`,
  `<IconlySend set="curved" primaryColor="currentColor" size={14} stroke="bold" />`
);

// 6. Style metric titles inside the bar
code = code.replace(
  /className="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest"/g,
  `className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"`
);

// 7. Update metrics numbers to use Outfit and font-black
code = code.replace(
  /className=\{\`text-\[13px\] font-bold text-slate-900 dark:text-white tabular-nums (.*)\`\}/g,
  `className={\`text-[13px] font-black text-slate-900 dark:text-white tabular-nums $1\`} style={{ fontFamily: "'Outfit', sans-serif" }}`
);
code = code.replace(
  /className=\{\`text-\[13px\] font-bold tabular-nums (.*)\`\}/g,
  `className={\`text-[13px] font-black tabular-nums $1\`} style={{ fontFamily: "'Outfit', sans-serif" }}`
);

// 8. Style table headers
code = code.replace(
  `tr className="bg-slate-50 dark:bg-[#1E1E20] text-[9px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap"`,
  `tr className="bg-slate-50 dark:bg-[#1E1E20] text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap"`
);

fs.writeFileSync(path, code);
console.log('Successfully patched JournalTradesTable.tsx with Iconly icons and premium styling!');
