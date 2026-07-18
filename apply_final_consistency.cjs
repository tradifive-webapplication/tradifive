const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const newCustomCheckbox = `const CustomCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
   <button
      onClick={onChange}
      className={\`inline-flex items-center justify-center gap-1.5 h-[32px] px-3.5 rounded-[12px] border-2 text-[11px] font-bold uppercase tracking-widest transition-all duration-300 \${
         checked
         ? "border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:from-[#1E1B4B] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#3730A340] text-indigo-700 dark:text-indigo-400"
         : "border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#252528] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#333336] text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.4),0_0_0_2px_#44444A]"
      }\`}
   >
      {checked && <Check size={12} strokeWidth={3} />}
      <span>{label}</span>
   </button>
);`;

// Replace CustomCheckbox definition
const customCheckboxRegex = /const CustomCheckbox = \(\{ label, checked, onChange \}: \{ label: string, checked: boolean, onChange: \(\) => void \}\) => \([\s\S]*?<\/div>\s*\);/;
content = content.replace(customCheckboxRegex, newCustomCheckbox);

// Replace Save Preferences button
const saveButtonRegex = /<PushableButton type="primary" className="px-16 py-3" onClick=\{\(\) => toast\.success\("Preferences saved"\)\}>\s*Save Preferences\s*<\/PushableButton>/;
const newSaveButton = `<button
                                    onClick={() => toast.success("Preferences saved")}
                                    className="inline-flex items-center justify-center gap-2 h-[48px] px-10 rounded-[16px] border-2 text-[14px] font-bold tracking-tight transition-all duration-300 border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:from-[#1E1B4B] dark:to-[#1A1A1C] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#3730A340] text-indigo-700 dark:text-indigo-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#818CF860] dark:hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.4),0_0_0_2px_#3730A360]"
                                 >
                                    <Save size={16} />
                                    <span>Save Preferences</span>
                                 </button>`;
content = content.replace(saveButtonRegex, newSaveButton);

fs.writeFileSync(file, content, 'utf8');
console.log('Applied consistency UI to checkboxes and save button!');
