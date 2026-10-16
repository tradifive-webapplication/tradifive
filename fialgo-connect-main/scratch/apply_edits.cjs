const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, '../src/pages/Settings.tsx');
const cssPath = path.join(__dirname, '../src/theme-switch.css');

let settingsContent = fs.readFileSync(settingsPath, 'utf8');

// Normalize all newlines to \n to avoid CRLF mismatch on Windows
settingsContent = settingsContent.replace(/\r\n/g, '\n');

// 1. Add Pencil to imports
const oldImport = 'CircleUserRound, Languages, BellRing, MessageCircle, AlertCircle, Inbox, MoreVertical, ArrowRight, Plus, Minus, Download, LogOut';
const newImport = 'CircleUserRound, Languages, BellRing, MessageCircle, AlertCircle, Inbox, MoreVertical, ArrowRight, Plus, Minus, Download, LogOut, Pencil';
if (settingsContent.includes(oldImport)) {
  settingsContent = settingsContent.replace(oldImport, newImport);
  console.log('1. Added Pencil to imports');
} else if (settingsContent.includes(newImport)) {
  console.log('1. Already updated: Pencil in imports');
} else {
  console.log('1. Failed: oldImport not found');
}

// 2. Add type option to ConsistencyToggleButton
const oldToggleDef = `const ConsistencyToggleButton = ({ label, checked, onChange, icon: Icon }: any) => (
   <button
      type="button"
      onClick={onChange}
      className={\`inline-flex items-center gap-1.5 h-[44px] px-4 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 \${
         checked
         ? "border-white dark:border-transparent bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:from-[#1E1E1E] dark:to-[#121212] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#3730A340] text-indigo-700 dark:text-indigo-400"
         : "border-white dark:border-transparent bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#121212] dark:to-[#121212] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#333336] text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.4),0_0_0_2px_#44444A]"
      }\`}
   >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
   </button>
);`;

const newToggleDef = `const ConsistencyToggleButton = ({ label, checked, onChange, icon: Icon, type = 'button' }: any) => (
   <button
      type={type}
      onClick={onChange}
      className={\`inline-flex items-center gap-1.5 h-[44px] px-5 rounded-[16px] border-2 text-[12px] font-bold tracking-tight transition-all duration-300 \${
         checked
         ? "border-white dark:border-transparent bg-gradient-to-b from-[#E0E7FF] to-[#EEF2FF] dark:from-[#1E1E1E] dark:to-[#121212] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#818CF840] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#3730A340] text-indigo-700 dark:text-indigo-400"
         : "border-white dark:border-transparent bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#121212] dark:to-[#121212] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#333336] text-slate-500 dark:text-slate-400 hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] dark:hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.4),0_0_0_2px_#44444A]"
      }\`}
   >
      {Icon && <Icon size={14} />}
      <span>{label}</span>
   </button>
);`;

if (settingsContent.includes(oldToggleDef)) {
  settingsContent = settingsContent.replace(oldToggleDef, newToggleDef);
  console.log('2. Updated ConsistencyToggleButton definition');
} else {
  console.log('2. Failed: ConsistencyToggleButton definition not matched');
}

// 3. Mini profile card updates
const oldMiniProfile = `                  <div 
                     onClick={() => setActiveTab('profile')}
                     className="bg-slate-200/50 dark:bg-[#121212] p-3 rounded-[16px] flex items-center gap-3 shadow-sm border border-slate-300/30 dark:border-transparent cursor-pointer hover:bg-slate-300/30 dark:hover:bg-[#292929]/50 transition-all"
                  >
                     <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-300 dark:bg-[#111111] shadow-inner">
                        <img 
                           src={profile.avatarUrl || \`https://api.dicebear.com/7.x/initials/svg?seed=\${profile.firstName || profile.name || 'T'}\`} 
                           alt="Avatar" 
                           className="w-full h-full object-cover" 
                        />
                     </div>
                     <div className="min-w-0 flex-1 text-left">
                        <p className="text-[12px] font-semibold text-slate-800 dark:text-white truncate leading-tight">
                           {displayName}
                        </p>
                        <p className="text-[10px] text-blue-500 hover:text-blue-600 font-extrabold transition-colors mt-0.5">
                           edit profile
                        </p>
                     </div>
                     <div className="text-slate-500 dark:text-slate-400 p-1">
                        <User size={16} />
                     </div>
                  </div>`;

const newMiniProfile = `                  <div 
                     onClick={() => setActiveTab('profile')}
                     className="group bg-slate-200/50 dark:bg-[#121212] p-3 rounded-[16px] flex items-center gap-3 shadow-sm border border-slate-300/30 dark:border-transparent cursor-pointer hover:bg-slate-300/30 dark:hover:bg-[#292929]/50 transition-all"
                  >
                     <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-300 dark:bg-[#111111] shadow-inner">
                        <img 
                           src={profile.avatarUrl || \`https://api.dicebear.com/7.x/initials/svg?seed=\${profile.firstName || profile.name || 'T'}\`} 
                           alt="Avatar" 
                           className="w-full h-full object-cover" 
                        />
                     </div>
                     <div className="min-w-0 flex-1 text-left">
                        <p className="text-[12px] font-semibold text-slate-855 dark:text-white truncate leading-tight">
                           {displayName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span className="text-[11px] text-blue-500 dark:text-blue-400 font-bold tracking-wide group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                              edit profile
                           </span>
                           <Pencil size={11} className="text-blue-500 dark:text-blue-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors" />
                        </div>
                     </div>
                     <div className="text-slate-500 dark:text-slate-400 p-1">
                        <User size={16} />
                     </div>
                  </div>`;

if (settingsContent.includes(oldMiniProfile)) {
  settingsContent = settingsContent.replace(oldMiniProfile, newMiniProfile);
  console.log('3. Updated Mini Profile Card');
} else {
  console.log('3. Failed: oldMiniProfile not found');
}

// 4. Remove double borders from Theme Switch card & make it smaller
const oldThemeCard = `                            <div className="bg-slate-50 dark:bg-[#151515] p-6 rounded-2xl border border-slate-200 dark:border-[#2a2a2a] space-y-6 shadow-sm mt-4">
                               
                               {/* Color Theme Box */}
                               <div className="bg-white dark:bg-[#1e1e1f] rounded-xl p-5 border border-slate-200/80 dark:border-white/5 shadow-sm transition-all hover:border-slate-300 dark:hover:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex gap-4">
                                     <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#2a2a2b] flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                     </div>
                                     <div className="space-y-1">
                                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">Global Color Theme</h3>
                                        <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] max-w-md">
                                           Toggles the full lighting environment across the entire application interface. Changes are applied instantly.
                                        </p>
                                     </div>
                                  </div>
                                  <label className="theme-switch shrink-0" style={{ '--toggle-size': '14px' } as any}>
                                     <input 
                                        type="checkbox" 
                                        className="theme-switch__checkbox" 
                                        checked={theme === 'dark'} 
                                        onChange={(e) => handleThemeChange(e.target.checked ? 'dark' : 'light')} 
                                     />
                                     <div className="theme-switch__container">
                                        <div className="theme-switch__circle-container">
                                           <div className="theme-switch__sun-moon-container">
                                              <div className="theme-switch__moon">
                                                 <div className="theme-switch__spot"></div>
                                                 <div className="theme-switch__spot"></div>
                                                 <div className="theme-switch__spot"></div>
                                              </div>
                                           </div>
                                        </div>
                                        <div className="theme-switch__clouds"></div>
                                        <div className="theme-switch__stars-container">
                                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                                              <path fillRule="evenodd" clipRule="evenodd" d="M110.155 0.584106C110.198 1.48805 110.605 2.32757 111.266 2.92376C111.927 3.51995 112.775 3.81177 113.57 3.65934C114.365 3.50692 115.012 2.93297 115.342 2.06206C115.672 1.19115 115.626 0.223837 115.228 -0.627798C114.83 -1.47943 114.116 -2.1287 113.253 -2.43329C112.389 -2.73787 111.455 -2.57008 110.686 -2.0003C109.917 -1.43053 109.435 -0.551398 109.351 0.354148C109.309 0.812297 109.395 1.27218 109.589 1.70114C109.784 2.13009 110.082 2.5168 110.457 2.83061C110.832 3.14441 111.273 3.37682 111.751 3.51139C112.228 3.64596 112.729 3.67919 113.218 3.60833C114.072 3.49089 114.834 2.99846 115.334 2.25324C115.833 1.50802 116.024 0.585573 115.86 -0.279768C115.696 -1.14511 115.195 -1.9168 114.469 -2.42777C113.743 -2.93874 112.846 -3.15175 111.966 -3.02325C111.086 -2.89475 110.289 -2.43501 109.734 -1.73373C109.18 -1.03245 108.91 -0.141525 108.981 0.755495C109.052 1.65251 109.458 2.49397 110.126 3.09071C110.793 3.68745 111.662 3.98772 112.544 3.84065" fill="currentColor"></path>
                                           </svg>
                                        </div>
                                     </div>
                                  </label>
                               </div>
                            </div>`;

const newThemeCard = `                            <div className="mt-4">
                               
                               {/* Color Theme Box */}
                               <div 
                                  onClick={() => handleThemeChange(theme === 'dark' ? 'light' : 'dark')}
                                  className="bg-slate-50 dark:bg-[#151515] p-6 rounded-2xl border border-slate-200 dark:border-[#2a2a2a] shadow-sm transition-all hover:border-slate-300 dark:hover:border-[#333333] flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
                               >
                                  <div className="flex gap-4">
                                     <div className="w-10 h-10 rounded-full bg-white dark:bg-[#2a2a2b] border border-slate-200/80 dark:border-transparent flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 shadow-sm">
                                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                                     </div>
                                     <div className="space-y-1 text-left">
                                        <h3 className="text-[16px] font-bold text-slate-900 dark:text-white mb-1">Global Color Theme</h3>
                                        <p className="text-[13px] text-slate-500 dark:text-[#B5BAC1] max-w-md">
                                           Toggles the full lighting environment across the entire application interface. Changes are applied instantly.
                                        </p>
                                     </div>
                                  </div>
                                  <div className="theme-switch shrink-0" style={{ '--toggle-size': '10.5px' } as any}>
                                     <input 
                                        type="checkbox" 
                                        className="theme-switch__checkbox" 
                                        checked={theme === 'dark'} 
                                        readOnly
                                     />
                                     <div className="theme-switch__container">
                                        <div className="theme-switch__circle-container">
                                           <div className="theme-switch__sun-moon-container">
                                              <div className="theme-switch__moon">
                                                 <div className="theme-switch__spot"></div>
                                                 <div className="theme-switch__spot"></div>
                                                 <div className="theme-switch__spot"></div>
                                              </div>
                                           </div>
                                        </div>
                                        <div className="theme-switch__clouds"></div>
                                        <div className="theme-switch__stars-container">
                                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                                              <path fillRule="evenodd" clipRule="evenodd" d="M110.155 0.584106C110.198 1.48805 110.605 2.32757 111.266 2.92376C111.927 3.51995 112.775 3.81177 113.57 3.65934C114.365 3.50692 115.012 2.93297 115.342 2.06206C115.672 1.19115 115.626 0.223837 115.228 -0.627798C114.83 -1.47943 114.116 -2.1287 113.253 -2.43329C112.389 -2.73787 111.455 -2.57008 110.686 -2.0003C109.917 -1.43053 109.435 -0.551398 109.351 0.354148C109.309 0.812297 109.395 1.27218 109.589 1.70114C109.784 2.13009 110.082 2.5168 110.457 2.83061C110.832 3.14441 111.273 3.37682 111.751 3.51139C112.228 3.64596 112.729 3.67919 113.218 3.60833C114.072 3.49089 114.834 2.99846 115.334 2.25324C115.833 1.50802 116.024 0.585573 115.86 -0.279768C115.696 -1.14511 115.195 -1.9168 114.469 -2.42777C113.743 -2.93874 112.846 -3.15175 111.966 -3.02325C111.086 -2.89475 110.289 -2.43501 109.734 -1.73373C109.18 -1.03245 108.91 -0.141525 108.981 0.755495C109.052 1.65251 109.458 2.49397 110.126 3.09071C110.793 3.68745 111.662 3.98772 112.544 3.84065" fill="currentColor"></path>
                                           </svg>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>`;

if (settingsContent.includes(oldThemeCard)) {
  settingsContent = settingsContent.replace(oldThemeCard, newThemeCard);
  console.log('4. Updated Theme Switch Card');
} else {
  console.log('4. Failed: oldThemeCard not found');
}

// 5. Creator tab Save Details
const oldCreatorSave = `                              <div className="pt-2">
                                 <button 
                                     type="button" 
                                     onClick={() => { toast.success("Creator details updated!"); }}
                                     className="px-5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-[#2b2d31] dark:hover:bg-[#3f4147] text-slate-800 dark:text-white font-bold text-[14px] rounded-full transition-colors"
                                  >
                                     Save Details
                                  </button>
                              </div>`;

const newCreatorSave = `                              <div className="pt-2">
                                 <ConsistencyToggleButton 
                                    label="Save Details" 
                                    checked={true} 
                                    onChange={() => { toast.success("Creator details updated!"); }} 
                                 />
                              </div>`;

if (settingsContent.includes(oldCreatorSave)) {
  settingsContent = settingsContent.replace(oldCreatorSave, newCreatorSave);
  console.log('5. Updated Creator Tab Save Details');
} else {
  console.log('5. Failed: oldCreatorSave not found');
}

// 6. Profile edit modal Save Details
const oldProfileSave = `                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end gap-3">
                           <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2 bg-slate-100 dark:bg-[#2C2C2E] text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-colors">Cancel</button>
                           <button type="submit" className="px-6 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors">Save Details</button>
                        </div>`;

const newProfileSave = `                        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex justify-end items-center gap-3">
                           <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-[#2C2C2E] text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#3C3C3E] transition-colors">Cancel</button>
                           <ConsistencyToggleButton 
                              label="Save Details" 
                              checked={true} 
                              type="submit" 
                           />
                        </div>`;

if (settingsContent.includes(oldProfileSave)) {
  settingsContent = settingsContent.replace(oldProfileSave, newProfileSave);
  console.log('6. Updated Profile Edit Modal Save Details');
} else {
  console.log('6. Failed: oldProfileSave not found');
}

// 7. Diamond Elite Pricing Card colors
const oldEliteCard = `                              <div 
                                 onClick={() => setSelectedPlan('elite')}
                                 className={\`cursor-pointer p-6 rounded-[32px] border-[2px] transition-all duration-300 flex flex-col relative overflow-hidden \${
                                    selectedPlan === 'elite' 
                                    ? 'border-amber-400 dark:border-amber-500/60 bg-gradient-to-b from-amber-500/5 to-transparent dark:from-amber-900/20 dark:to-[#1A1A1C] shadow-[0_8px_20px_-5px_rgba(245,158,11,0.2)] md:-translate-y-2 scale-[1.02] z-10' 
                                    : 'border-amber-200 dark:border-amber-500/30 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#1C1C1E] dark:to-[#121214] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3)] hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-[0_8px_15px_-5px_rgba(245,158,11,0.15)]'
                                 }\`}
                              >`;

const newEliteCard = `                              <div 
                                 onClick={() => setSelectedPlan('elite')}
                                 className={\`cursor-pointer p-6 rounded-[32px] border-[2px] transition-all duration-300 flex flex-col relative overflow-hidden \${
                                    selectedPlan === 'elite' 
                                    ? 'border-[#fbbf24] dark:border-[#f59e0b]/80 bg-gradient-to-b from-[#f59e0b]/5 to-transparent dark:from-[#78350f]/20 dark:to-[#121214] shadow-[0_8px_20px_-5px_rgba(245,158,11,0.2)] md:-translate-y-2 scale-[1.02] z-10' 
                                    : 'border-[#fde68a] dark:border-[#f59e0b]/30 bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#1C1C1E] dark:to-[#121214] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3)] hover:border-[#fbbf24] dark:hover:border-[#f59e0b]/60 hover:shadow-[0_8px_15px_-5px_rgba(245,158,11,0.15)]'
                                 }\`}
                              >`;

if (settingsContent.includes(oldEliteCard)) {
  settingsContent = settingsContent.replace(oldEliteCard, newEliteCard);
  console.log('7a. Updated Diamond Elite Pricing Card classes');
} else {
  console.log('7a. Failed: oldEliteCard not found');
}

const oldEliteButton = `                                 <button 
                                    onClick={() => toast.success("Checkout process initialized! Thank you.")}
                                    className="w-full flex items-center justify-center h-10 rounded-full border-2 border-amber-300/40 dark:border-amber-400/30 bg-gradient-to-b from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 shadow-[0_4px_7px_-5px_rgba(245,158,11,0.4),0_0_0_2px_rgba(245,158,11,0.2)] text-white font-bold text-[12px] hover:brightness-110 transition-all hover:shadow-[0_8px_15px_-5px_rgba(245,158,11,0.6),0_0_0_2px_rgba(245,158,11,0.4)] active:scale-95 mb-8"
                                 >`;

const newEliteButton = `                                 <button 
                                    onClick={() => toast.success("Checkout process initialized! Thank you.")}
                                    className="w-full flex items-center justify-center h-10 rounded-full border-2 border-[#fcd34d]/40 dark:border-[#fbbf24]/30 bg-gradient-to-b from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 shadow-[0_4px_7px_-5px_rgba(245,158,11,0.4),0_0_0_2px_rgba(245,158,11,0.2)] text-white font-bold text-[12px] hover:brightness-110 transition-all hover:shadow-[0_8px_15px_-5px_rgba(245,158,11,0.6),0_0_0_2px_rgba(245,158,11,0.4)] active:scale-95 mb-8"
                                 >`;

if (settingsContent.includes(oldEliteButton)) {
  settingsContent = settingsContent.replace(oldEliteButton, newEliteButton);
  console.log('7b. Updated Elite upgrade button border colors');
} else {
  console.log('7b. Failed: oldEliteButton not found');
}

// 8. Remove the border divider down of logout button
const oldDivider = `<div className="mt-auto pt-6 px-2 flex flex-col gap-1.5 opacity-60">`;
const newDivider = `<div className="mt-auto pt-6 px-2 flex flex-col gap-1.5 opacity-60">`; // Already updated in last run

// Write modified settings back, restoring CRLF newlines if the original had them (or just keeping LF)
fs.writeFileSync(settingsPath, settingsContent.replace(/\n/g, '\r\n'), 'utf8');
console.log('Settings.tsx normalized and written successfully');
