const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Settings.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `<h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6">Profile Information</h2>`;
const nextCardStr = `{/* CARD 2: Additional Info */}`;

const startIndex = content.indexOf(targetStr);
if (startIndex === -1) {
    console.error('Target string not found!');
    process.exit(1);
}

const endIndex = content.indexOf(nextCardStr, startIndex);
if (endIndex === -1) {
    console.error('Next card string not found!');
    process.exit(1);
}

console.log(`Found target at index ${startIndex}, next card at ${endIndex}`);

const discordCardMarkup = `
                               <h2 className="text-[20px] font-bold text-slate-900 dark:text-white mb-6">My Account</h2>
                               
                               {/* DISCORD STYLE "MY ACCOUNT" CARD */}
                               <div className="rounded-[8px] bg-slate-100 dark:bg-[#252528] overflow-hidden mb-8 relative border border-slate-200 dark:border-transparent">
                                  {/* Banner */}
                                  <div className="h-[100px] bg-indigo-600 dark:bg-indigo-700 w-full relative">
                                     {profile.bannerUrl && (
                                        <img src={profile.bannerUrl} alt="banner" className="w-full h-full object-cover" />
                                     )}
                                  </div>
                                  
                                  {/* Avatar display overlapping banner */}
                                  <div className="absolute top-[60px] left-4 z-10">
                                     <div className="w-[80px] h-[80px] rounded-full border-[6px] border-slate-100 dark:border-[#252528] overflow-hidden bg-slate-300 dark:bg-[#111111] shadow-md">
                                        <img 
                                           src={profile.avatarUrl || \`https://api.dicebear.com/7.x/initials/svg?seed=\${profile.firstName || profile.name || 'T'}\`} 
                                           alt="Avatar" 
                                           className="w-full h-full object-cover" 
                                        />
                                     </div>
                                  </div>

                                  {/* User details row under banner */}
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 pt-3 pb-4 gap-4">
                                     <div className="pl-24">
                                        <h3 className="text-[18px] font-extrabold text-slate-900 dark:text-white leading-tight">
                                           {profile.firstName} {profile.lastName}
                                        </h3>
                                        <p className="text-[13px] text-slate-500 dark:text-[#b5bac1] mt-0.5">
                                           @{profile.name || "username"}
                                        </p>
                                     </div>
                                     <button 
                                        type="button"
                                        onClick={() => setActiveTab('profiles')} 
                                        className="sm:ml-auto px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-[4px] text-xs font-bold transition-all shadow-sm active:translate-y-[1px]"
                                     >
                                        Edit User Profile
                                     </button>
                                  </div>

                                  {/* Inner Account Details Box */}
                                  <div className="bg-white dark:bg-[#1e1f22] rounded-[8px] p-4 m-4 mt-2 space-y-4 border border-slate-200 dark:border-transparent">
                                     {/* Row 1: Display Name */}
                                     <div className="flex justify-between items-center">
                                        <div>
                                           <p className="text-[10px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider">Display Name</p>
                                           <p className="text-[14px] text-slate-800 dark:text-[#dbdee1] font-semibold mt-0.5">
                                              {profile.firstName} {profile.lastName}
                                           </p>
                                        </div>
                                        <button 
                                           type="button"
                                           onClick={() => setIsEditModalOpen(true)} 
                                           className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#4e5058] dark:hover:bg-[#6d6f78] text-slate-850 dark:text-white text-xs font-bold rounded-[4px] transition-colors"
                                        >
                                           Edit
                                        </button>
                                     </div>

                                     <div className="h-[1px] bg-slate-100 dark:bg-[#2f3136]" />

                                     {/* Row 2: Username */}
                                     <div className="flex justify-between items-center">
                                        <div>
                                           <p className="text-[10px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider">Username</p>
                                           <p className="text-[14px] text-slate-800 dark:text-[#dbdee1] font-semibold mt-0.5">
                                              {profile.name}
                                           </p>
                                        </div>
                                        <button 
                                           type="button"
                                           onClick={() => setIsEditModalOpen(true)} 
                                           className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#4e5058] dark:hover:bg-[#6d6f78] text-slate-850 dark:text-white text-xs font-bold rounded-[4px] transition-colors"
                                        >
                                           Edit
                                        </button>
                                     </div>

                                     <div className="h-[1px] bg-slate-100 dark:bg-[#2f3136]" />

                                     {/* Row 3: Email */}
                                     <div className="flex justify-between items-center">
                                        <div>
                                           <p className="text-[10px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider">Email</p>
                                           <div className="flex items-center gap-2 mt-0.5">
                                              <p className="text-[14px] text-slate-800 dark:text-[#dbdee1] font-semibold">
                                                 {profile.email}
                                              </p>
                                              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-400/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                                                 Verified
                                              </span>
                                           </div>
                                        </div>
                                        <button 
                                           type="button"
                                           onClick={() => setIsEditModalOpen(true)} 
                                           className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#4e5058] dark:hover:bg-[#6d6f78] text-slate-850 dark:text-white text-xs font-bold rounded-[4px] transition-colors"
                                        >
                                           Edit
                                        </button>
                                     </div>

                                     <div className="h-[1px] bg-slate-100 dark:bg-[#2f3136]" />

                                     {/* Row 4: Phone Number */}
                                     <div className="flex justify-between items-center">
                                        <div>
                                           <p className="text-[10px] font-bold text-slate-500 dark:text-[#949ba4] uppercase tracking-wider">Phone Number</p>
                                           <p className="text-[14px] text-slate-800 dark:text-[#dbdee1] font-semibold mt-0.5">
                                              You haven't added a phone number yet.
                                           </p>
                                        </div>
                                        <button 
                                           type="button"
                                           onClick={() => setShowSmsModal(true)} 
                                           className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#4e5058] dark:hover:bg-[#6d6f78] text-slate-850 dark:text-white text-xs font-bold rounded-[4px] transition-colors"
                                        >
                                           Add
                                        </button>
                                     </div>
                                  </div>
                               </div>
                               
                               `;

const newContent = content.substring(0, startIndex) + discordCardMarkup + content.substring(endIndex);
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully updated Settings.tsx with Discord Layout!');
