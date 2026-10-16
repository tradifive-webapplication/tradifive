const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change Save Preferences button
const oldButton = /<MissionControlButton className="px-16 py-1">\s*Save Preferences\s*<\/MissionControlButton>/;
const newButton = `<PushableButton type="primary" className="px-16 py-3" onClick={() => toast.success("Preferences saved")}>\n                                     Save Preferences\n                                  </PushableButton>`;
content = content.replace(oldButton, newButton);

// 2. Change Global Off toggle
const oldGlobalOff = /<div className="flex items-center gap-3">\s*<JoystickSwitch checked=\{globalOff\} onChange=\{handleGlobalOff\} \/>\s*<span className="[^"]+">Switch off all<\/span>\s*<\/div>/;
const newGlobalOff = `<CustomCheckbox label="Switch off all" checked={globalOff} onChange={() => handleGlobalOff(!globalOff)} />`;
content = content.replace(oldGlobalOff, newGlobalOff);

// 3. Change Email Only toggle
const oldEmailOnly = /<div className="flex items-center gap-3">\s*<JoystickSwitch checked=\{globalEmailOnly\} onChange=\{handleEmailOnly\} \/>\s*<span className="[^"]+">Email only<\/span>\s*<\/div>/;
const newEmailOnly = `<CustomCheckbox label="Email only" checked={globalEmailOnly} onChange={() => handleEmailOnly(!globalEmailOnly)} />`;
content = content.replace(oldEmailOnly, newEmailOnly);

// 4. Remove borders
const oldBorder = /className=\{`flex flex-col md:flex-row md:items-center justify-between py-3 gap-4 \$\{i !== \(notifications as any\)\[section\.key\]\.length - 1 \? 'border-b border-slate-50 dark:border-\[\#222222\] dark:border-\[\#333333\]' : ''\}`\}/g;
const newBorder = `className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-4"`;
content = content.replace(oldBorder, newBorder);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated UI elements');
