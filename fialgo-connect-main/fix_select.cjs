const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

// Ensure SelectGroup is imported
if (!content.includes('SelectGroup')) {
    content = content.replace('SelectContent,', 'SelectContent, SelectGroup,');
}

// Wrap items in SelectGroup
const oldItems = `<SelectItem value="English" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">English</SelectItem>
                                          <SelectItem value="Hindi" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Hindi (हिंदी)</SelectItem>
                                          <SelectItem value="Kannada" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Kannada (ಕನ್ನಡ)</SelectItem>
                                          <SelectItem value="Spanish" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Spanish (Español)</SelectItem>
                                          <SelectItem value="Marathi" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Marathi (मराठी)</SelectItem>`;

const newItems = `<SelectGroup>
                                          <SelectItem value="English" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">English</SelectItem>
                                          <SelectItem value="Hindi" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Hindi (हिंदी)</SelectItem>
                                          <SelectItem value="Kannada" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Kannada (ಕನ್ನಡ)</SelectItem>
                                          <SelectItem value="Spanish" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Spanish (Español)</SelectItem>
                                          <SelectItem value="Marathi" className="text-[13px] font-bold focus:bg-slate-100 dark:focus:bg-[#2A2A2C] cursor-pointer py-2.5">Marathi (मराठी)</SelectItem>
                                          </SelectGroup>`;

if (content.includes(oldItems)) {
    content = content.replace(oldItems, newItems);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully wrapped SelectItems in SelectGroup');
} else {
    console.log('Items not found!');
}
