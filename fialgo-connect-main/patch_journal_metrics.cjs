const fs = require('fs');

const path = 'src/components/journal/JournalMetrics.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Update imports
const oldImport = `import { Info, RefreshCw, LayoutGrid, Check, GripVertical, LineChart, Eye, EyeOff, Percent, DollarSign, ChevronDown } from "lucide-react";`;
const newImport = `import { Check, GripVertical, Percent } from "lucide-react";
import { 
  ChevronDown as IconlyChevronDown, 
  Show as IconlyShow, 
  Hide as IconlyHide, 
  Category as IconlyCategory, 
  InfoSquare as IconlyInfoSquare, 
  Graph as IconlyGraph, 
  Swap as IconlySwap 
} from "react-iconly";`;

code = code.replace(oldImport, newImport);

// 2. Replace Info icon usages in metrics with IconlyInfoSquare
// We will replace <Info size={13} className="text-slate-300" />
code = code.replace(
  /<Info size=\{13\} className="text-slate-300" \/>/g,
  `<IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />`
);
// Replace <Info size={13} className="text-slate-400" />
code = code.replace(
  /<Info size=\{13\} className="text-slate-400" \/>/g,
  `<IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-400 dark:text-slate-500 hover:text-slate-500 transition-colors" />`
);

// 3. Replace LineChart usage in PNL card
code = code.replace(
  `<LineChart size={16} className="text-indigo-500" />`,
  `<IconlyGraph set="curved" primaryColor="currentColor" size={16} stroke="bold" className="text-indigo-500" />`
);

// 4. Style resync button
const oldResync = `          <button
            onClick={async () => {
              toast.promise(
                (async () => {
                  if (activeMarket === 'indian') {
                    const { error } = await supabase.functions.invoke('sync-indian-trades');
                    if (error) throw error;
                  } else {
                    const { error } = await supabase.functions.invoke('sync-metaapi-trades');
                    if (error) throw error;
                  }
                  await refetch();
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                })(),
                {
                  loading: 'Synchronizing trades...',
                  success: 'Sync complete! Refreshing page...',
                  error: 'Sync failed'
                }
              );
            }}
            className="text-emerald-500 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-blue-300 transition-colors font-bold"
          >
            Resync
          </button>`;

const newResync = `          <button
            onClick={async () => {
              toast.promise(
                (async () => {
                  if (activeMarket === 'indian') {
                    const { error } = await supabase.functions.invoke('sync-indian-trades');
                    if (error) throw error;
                  } else {
                    const { error } = await supabase.functions.invoke('sync-metaapi-trades');
                    if (error) throw error;
                  }
                  await refetch();
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                })(),
                {
                  loading: 'Synchronizing trades...',
                  success: 'Sync complete! Refreshing page...',
                  error: 'Sync failed'
                }
              );
            }}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-400/20 text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-sm"
          >
            <IconlySwap set="curved" primaryColor="currentColor" size={11} stroke="bold" />
            <span>Resync</span>
          </button>`;

code = code.replace(oldResync, newResync);

// 5. Update settings bar icons and style to match the premium curved set="curved"
code = code.replace(
  `<ChevronDown size={11} className={\`transition-transform duration-200 \${currencyOpen ? "rotate-180" : ""}\`} />`,
  `<IconlyChevronDown set="curved" primaryColor="currentColor" size={11} className={\`transition-transform duration-200 \${currencyOpen ? "rotate-180" : ""}\`} stroke="bold" />`
);

code = code.replace(
  `{hideBalance ? <EyeOff size={13} /> : <Eye size={13} />}`,
  `{hideBalance ? <IconlyHide set="curved" primaryColor="currentColor" size={13} stroke="bold" /> : <IconlyShow set="curved" primaryColor="currentColor" size={13} stroke="bold" />}`
);

code = code.replace(
  `{hideOnlyBalance ? <EyeOff size={13} /> : <Eye size={13} />}`,
  `{hideOnlyBalance ? <IconlyHide set="curved" primaryColor="currentColor" size={13} stroke="bold" /> : <IconlyShow set="curved" primaryColor="currentColor" size={13} stroke="bold" />}`
);

code = code.replace(
  `<Percent size={13} />`,
  `<Percent size={12} strokeWidth={2.5} />`
);

code = code.replace(
  `{isEditMode ? <Check size={16} strokeWidth={3} /> : <LayoutGrid size={16} />}`,
  `{isEditMode ? <Check size={16} strokeWidth={3} /> : <IconlyCategory set="curved" primaryColor="currentColor" size={15} stroke="bold" />}`
);

// 6. Polish Card header texts (Upper case metrics labels)
code = code.replace(
  /className="text-\[10px\] font-bold text-slate-400 uppercase tracking-widest"/g,
  `className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"`
);
code = code.replace(
  /className="text-\[13px\] font-medium text-slate-500 dark:text-slate-400"/g,
  `className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider"`
);

// 7. Update metric numbers to use Outfit and font-black
code = code.replace(
  `h3 className={\`text-[28px] font-bold text-slate-900 dark:text-white tracking-tight leading-none transition-all duration-300 \${hideBalance || hideOnlyBalance || percentageOnly ? 'blur-[5px] select-none opacity-40' : ''}\`}`,
  `h3 className={\`text-[28px] font-black text-slate-900 dark:text-white tracking-tight leading-none transition-all duration-300 \${hideBalance || hideOnlyBalance || percentageOnly ? 'blur-[5px] select-none opacity-40' : ''}\`} style={{ fontFamily: "'Outfit', sans-serif" }}`
);
code = code.replace(
  `className="text-[26px] font-bold text-slate-900 dark:text-white dark:text-white tracking-tight leading-none"`,
  `className="text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}`
);
code = code.replace(
  `className="text-[26px] font-bold text-slate-900 dark:text-white dark:text-white tracking-tight leading-none"`,
  `className="text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}`
);

fs.writeFileSync(path, code);
console.log('Successfully patched JournalMetrics.tsx with Iconly icons, Outfit fonts, and premium styling!');
