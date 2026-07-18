const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { Select,')) {
    const importMatch = content.match(/import.*?from.*?;/g);
    if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(lastImport, lastImport + '\nimport { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";');
    }
}

const targetSelect = `<select 
                                       value={language} 
                                       onChange={e => setLanguage(e.target.value)} 
                                       className="w-full md:w-64 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                                    >
                                       <option value="English">English</option>
                                       <option value="Hindi">Hindi (हिंदी)</option>
                                       <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                                       <option value="Spanish">Spanish (Español)</option>
                                       <option value="Marathi">Marathi (मराठी)</option>
                                    </select>`;

const newSelect = `<Select value={language} onValueChange={setLanguage}>
                                       <SelectTrigger className="w-full md:w-64 h-11 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#333] rounded-xl px-4 text-[13px] font-bold text-slate-700 dark:text-slate-200 focus:ring-0 focus:ring-offset-0">
                                          <SelectValue placeholder="Select Language" />
                                       </SelectTrigger>
                                       <SelectContent className="bg-white dark:bg-[#1C1C1E] border-slate-200 dark:border-[#333] rounded-xl">
                                          <SelectItem value="English" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">English</SelectItem>
                                          <SelectItem value="Hindi" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Hindi (हिंदी)</SelectItem>
                                          <SelectItem value="Kannada" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Kannada (ಕನ್ನಡ)</SelectItem>
                                          <SelectItem value="Spanish" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Spanish (Español)</SelectItem>
                                          <SelectItem value="Marathi" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Marathi (मराठी)</SelectItem>
                                       </SelectContent>
                                    </Select>`;

if(content.includes(targetSelect)) {
    content = content.replace(targetSelect, newSelect);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully updated language select box');
} else {
    console.log('Target select box not found for replacement!');
}
