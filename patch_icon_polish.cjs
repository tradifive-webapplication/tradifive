const fs = require('fs');

const path = 'src/pages/TradifiveAI.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Change IconlySearch back to Lucide Search (but keep the fixed hover color class)
code = code.replace(
  `<IconlySearch set="curved" primaryColor="currentColor" size={15} className="text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors" stroke="bold" onClick={`,
  `<Search size={15} strokeWidth={2.5} className="text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors" onClick={`
);

// 2. Add strokeWidth={2} to all react-iconly components in TradifiveAI.tsx
code = code.replace(
  'stroke="bold" className={`transition-transform duration-200 ${showPlusMenu ? "rotate-45" : ""}`} />',
  'stroke="bold" strokeWidth={2} className={`transition-transform duration-200 ${showPlusMenu ? "rotate-45" : ""}`} />'
);

code = code.replace(
  'stroke="bold" className="text-indigo-400 shrink-0" />',
  'stroke="bold" strokeWidth={2} className="text-indigo-400 shrink-0" />'
);

code = code.replace(
  '<IconlyVoice set="curved" primaryColor="currentColor" size={16} stroke="bold" />',
  '<IconlyVoice set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} />'
);

code = code.replace(
  '<IconlyArrowUp set="curved" primaryColor="currentColor" size={14} stroke="bold" />',
  '<IconlyArrowUp set="curved" primaryColor="currentColor" size={14} stroke="bold" strokeWidth={2} />'
);

code = code.replace(
  '<item.icon set="curved" primaryColor="currentColor" size={18} stroke="bold" />',
  '<item.icon set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} />'
);

code = code.replace(
  '<IconlyPlus set="curved" primaryColor="currentColor" size={16} className="shrink-0" stroke="bold" />',
  '<IconlyPlus set="curved" primaryColor="currentColor" size={16} className="shrink-0" stroke="bold" strokeWidth={2} />'
);

// 3. Make IconlyMessage bold with strokeWidth={2} as well to match the other icons
code = code.replace(
  `<IconlyMessage
                          set="curved"
                          primaryColor="currentColor"
                          size={15}
                          className={\`shrink-0 mt-0.5 transition-colors \${currentSessionId === session.id
                              ? "text-slate-600 dark:text-slate-350"
                              : "text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-300"
                            }\`}
                        />`,
  `<IconlyMessage
                          set="curved"
                          primaryColor="currentColor"
                          size={15}
                          stroke="bold"
                          strokeWidth={2}
                          className={\`shrink-0 mt-0.5 transition-colors \${currentSessionId === session.id
                              ? "text-slate-600 dark:text-slate-350"
                              : "text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-300"
                            }\`}
                        />`
);

fs.writeFileSync(path, code);
console.log('Successfully polished search icon and applied bold weights to all Iconly icons!');
