const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import ThemeSwitch')) {
    const importMatch = content.match(/import.*?from.*?;/g);
    if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(lastImport, lastImport + '\nimport ThemeSwitch from "../components/ThemeSwitch";');
    }
}

const targetStr = `<div className="w-full md:w-48 flex md:justify-end">
                                            <div className="flex items-center gap-3">
                                                <span className={\`text-[12px] font-bold \${theme === 'light' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}\`}>Light</span>
                                                <button 
                                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                                    className={\`relative w-12 h-6 rounded-full transition-colors \${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}\`}
                                                >
                                                    <div className={\`absolute top-1/2 -translate-y-1/2 left-1 w-4 h-4 rounded-full bg-white transition-transform \${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}\`} />
                                                </button>
                                                <span className={\`text-[12px] font-bold \${theme === 'dark' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}\`}>Dark</span>
                                            </div>
                                        </div>`;

const replaceStr = `<div className="w-full md:w-48 flex justify-end">
                                            <ThemeSwitch checked={theme === 'dark'} onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
                                        </div>`;

if(content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully integrated ThemeSwitch');
} else {
    console.log('Target string not found for replacement!');
}
