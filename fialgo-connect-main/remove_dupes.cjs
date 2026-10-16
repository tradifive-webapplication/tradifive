const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const badStr1 = `                                     <div className="flex justify-between items-center">
                                        <div>
                                           <p className="text-[12px] font-bold text-slate-500 dark:text-[#b5bac1] uppercase tracking-wide">Display Name</p>
                                           <p className="text-[16px] text-slate-900 dark:text-white font-medium mt-0.5">{profile.firstName} {profile.lastName}</p>
                                        </div>
                                        <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 bg-slate-100 dark:bg-[#2C2C2E] text-slate-900 dark:text-white font-semibold text-[13px] rounded-xl hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-colors shadow-sm">Edit</button>
                                     </div>
                                     
                                     <div className="h-[1px] bg-slate-200 dark:bg-slate-800/50 w-full" />
                                     
                                     <div className="flex justify-between items-center">
                                        <div>
                                           <p className="text-[12px] font-bold text-slate-500 dark:text-[#b5bac1] uppercase tracking-wide">Username</p>
                                           <p className="text-[16px] text-slate-900 dark:text-white font-medium mt-0.5">{profile.name}</p>
                                        </div>
                                        <button onClick={() => setIsEditModalOpen(true)} className="px-5 py-2 bg-slate-100 dark:bg-[#2C2C2E] text-slate-900 dark:text-white font-semibold text-[13px] rounded-xl hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-colors shadow-sm">Edit</button>
                                     </div>

                                     <div className="h-[1px] bg-slate-200 dark:bg-slate-800/50 w-full" />

`;

const countryStr = `                                     <div>
                                        <label className="text-[12px] font-bold text-slate-500 dark:text-[#b5bac1] uppercase tracking-wide block mb-2">Country</label>
                                        <p className="text-[14px] text-slate-900 dark:text-white font-medium bg-slate-50 dark:bg-[#252528] p-3.5 rounded-xl border border-slate-200 dark:border-transparent">{profile.country || "Not specified"}</p>
                                     </div>\n`;

// Handle \r\n differences
const replaceRegex1 = new RegExp(badStr1.replace(/\n/g, '\\r?\\n').replace(/[.*+?^$\{\}()|[\\]\\\\]/g, '\\\\$&'), 'g');
const replaceRegex2 = new RegExp(countryStr.replace(/\n/g, '\\r?\\n').replace(/[.*+?^$\{\}()|[\\]\\\\]/g, '\\\\$&'), 'g');

let changed = false;

if (content.includes('Display Name') && content.includes('Username') && content.includes('Account Details')) {
    // Basic replace if exact match works
    if (content.includes(badStr1)) {
        content = content.replace(badStr1, '');
        changed = true;
    } else {
        // Fallback to manual replace with regex or split
        let lines = content.split('\\n');
        // Let's just do standard replace for both \n and \r\n
        content = content.replace(badStr1.replace(/\\n/g, '\\r\\n'), '');
        content = content.replace(badStr1, '');
        changed = true;
    }
}

if (content.includes('Profile Information')) {
    content = content.replace(countryStr.replace(/\\n/g, '\\r\\n'), '');
    content = content.replace(countryStr, '');
    changed = true;
}

// Rename Account Details to Contact Information to make sense
content = content.replace(
    'Account Details',
    'Contact Information'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Removed duplicates successfully.');
