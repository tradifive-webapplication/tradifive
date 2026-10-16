const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const CustomCheckbox = \(\{ label, checked, onChange \}: \{ label: string, checked: boolean, onChange: \(\) => void \}\) => \([\s\S]*?<\/button>\s*\);/;

const newCustomCheckbox = `const CustomCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
   <div className="flex items-center gap-2 cursor-pointer group" onClick={onChange}>
      <div className={\`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all duration-300 \${
         checked
         ? "border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:from-[#1E1B4B] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#3730A340]"
         : "border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#252528] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#333336]"
      }\`}>
         {checked && <Check size={12} strokeWidth={3} className="text-indigo-700 dark:text-indigo-400" />}
      </div>
      <span className={\`text-[11px] font-black uppercase tracking-widest \${checked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'}\`}>{label}</span>
   </div>
);`;

content = content.replace(regex, newCustomCheckbox);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed CustomCheckbox to be a tick box');
