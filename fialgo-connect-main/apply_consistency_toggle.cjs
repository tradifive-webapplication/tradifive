const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const toggleComponent = `
const ConsistencyToggleButton = ({ label, checked, onChange, icon: Icon }: any) => (
   <button
      onClick={onChange}
      className={\`inline-flex items-center gap-1.5 h-[44px] px-4 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 \${
         checked
         ? "border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:from-[#1E1B4B] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#3730A340] text-indigo-700 dark:text-indigo-400"
         : "border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#252528] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#333336] text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.4),0_0_0_2px_#44444A]"
      }\`}
   >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
   </button>
);
`;

if(!content.includes('ConsistencyToggleButton')) {
   content = content.replace('const CustomCheckbox =', toggleComponent + '\nconst CustomCheckbox =');
}

const oldSwitchOffAll = /<CustomCheckbox label="Switch off all" checked=\{globalOff\} onChange=\{\(\) => handleGlobalOff\(!globalOff\)\} \/>/;
const newSwitchOffAll = `<ConsistencyToggleButton label="Switch off all" checked={globalOff} onChange={() => handleGlobalOff(!globalOff)} icon={Power} />`;

const oldEmailOnly = /<CustomCheckbox label="Email only" checked=\{globalEmailOnly\} onChange=\{\(\) => handleEmailOnly\(!globalEmailOnly\)\} \/>/;
const newEmailOnly = `<ConsistencyToggleButton label="Email only" checked={globalEmailOnly} onChange={() => handleEmailOnly(!globalEmailOnly)} icon={Mail} />`;

content = content.replace(oldSwitchOffAll, newSwitchOffAll);
content = content.replace(oldEmailOnly, newEmailOnly);

// Make sure Mail icon is imported
if (!content.includes('import { Mail')) {
   content = content.replace('import {', 'import { Mail,');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Toggles updated!');
