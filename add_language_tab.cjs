const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = '{activeTab === "trading" && (';

const languageBlock = `{activeTab === "language" && (
                           <motion.div
                              key="language"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-6"
                           >
                              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6">Language Preferences</h2>
                              
                              <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-sm">
                                 <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                    <Globe size={14} className="text-blue-600" /> Interface Language
                                 </h4>
                                 
                                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#222] pb-6">
                                    <div>
                                       <p className="text-[14px] font-bold text-slate-900 dark:text-white">App Language</p>
                                       <p className="text-[12px] font-medium text-slate-500 mt-1">Select the language used across the application.</p>
                                    </div>
                                    <select 
                                       value={language} 
                                       onChange={e => setLanguage(e.target.value)} 
                                       className="w-full md:w-64 bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 text-[13px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                                    >
                                       <option value="English">English</option>
                                       <option value="Hindi">Hindi (हिंदी)</option>
                                       <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                                       <option value="Spanish">Spanish (Español)</option>
                                       <option value="Marathi">Marathi (मराठी)</option>
                                    </select>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                        
                        `;

if(content.includes(targetStr)) {
    content = content.replace(targetStr, languageBlock + targetStr);
    
    // Check if Globe is imported from lucide-react
    if(!content.includes('Globe,')) {
        content = content.replace(/import \{([^}]+)\} from "lucide-react";/, 'import {$1, Globe} from "lucide-react";');
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully added language tab');
} else {
    console.log('Target string not found for replacement!');
}
