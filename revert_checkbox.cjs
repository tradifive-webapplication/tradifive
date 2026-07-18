const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const AnimatedCheckboxStyles = \(\) => \([\s\S]*?const CustomCheckbox = \(\{ label, checked, onChange \}: \{ label: string, checked: boolean, onChange: \(\) => void \}\) => \{[\s\S]*?<\/label>\s*\);\s*\};/m;

const newCode = `const AnimatedCheckboxStyles = () => null;

const CustomCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
   <div className="flex items-center gap-2 cursor-pointer group" onClick={onChange}>
      <div className={\`w-4 h-4 rounded-[4px] border-[1.5px] flex items-center justify-center transition-all \${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'}\`}>
         {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </div>
      <span className={\`text-[11px] font-black uppercase tracking-widest \${checked ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}\`}>{label}</span>
   </div>
);`;

if (regex.test(content)) {
    content = content.replace(regex, newCode);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Replaced with simple checkbox successfully");
} else {
    console.log("Could not find glitch checkbox");
}
