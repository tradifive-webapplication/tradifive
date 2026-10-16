const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const authBlockStr = `                               {/* CARD 3: Authentication */}
                               <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-sm mt-8">
                                  <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                     Password & Authentication
                                  </h4>
                                  <div className="flex items-center gap-4">
                                     <button onClick={() => toast.success("Password reset email sent")} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] rounded-xl shadow-md transition-colors">Change Password</button>
                                  </div>
                               </div>`;

// Remove authBlock from general tab
if (content.includes(authBlockStr)) {
    content = content.replace(authBlockStr, '');
} else {
    // try removing with \r\n
    content = content.replace(authBlockStr.replace(/\n/g, '\r\n'), '');
}

const securityTabStr = `
                        {activeTab === 'security' && (
                           <motion.div
                              key="security"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-6"
                           >
                               <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-sm">
                                  <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                     Password & Authentication
                                  </h4>
                                  <p className="text-[13px] text-slate-500 mb-6">Manage your account security and password.</p>
                                  <div className="flex items-center gap-4">
                                     <button onClick={() => toast.success("Password reset email sent")} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] rounded-xl shadow-md transition-colors">Change Password</button>
                                  </div>
                               </div>
                           </motion.div>
                        )}
`;

// Insert it right after the general tab ends
const generalEndStr = `                            </motion.div>
                         )}`;

if (content.includes(generalEndStr)) {
    content = content.replace(generalEndStr, generalEndStr + securityTabStr);
} else {
    content = content.replace(generalEndStr.replace(/\n/g, '\r\n'), generalEndStr.replace(/\n/g, '\r\n') + securityTabStr.replace(/\n/g, '\r\n'));
}

fs.writeFileSync(file, content, 'utf8');
console.log('Moved auth to security tab.');
