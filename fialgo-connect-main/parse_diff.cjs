const fs = require('fs');
const diff = `@@ -654,135 +654,6 @@
             {/* Header Card (Consistent Tactile Neumorphic / Claymorphic Outer container with dual-border & soft shadow specs) */}
             <div className="bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] dark:from-[#181D30] dark:to-[#0E121F] rounded-[32px] overflow-hidden border-2 border-white dark:border-[#1E2538] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),_0_0_0_2px_#E7E7E7] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.4),_0_0_0_2px_#262F47] relative">
               
-              {/* Cover Banner */}
-              <div className="h-44 sm:h-52 w-full relative bg-slate-900 overflow-hidden border-b border-white/10 dark:border-[#1E2538]">
-                {loading ? (
-                  <div className="w-full h-full animate-pulse bg-slate-350 dark:bg-slate-800" />
-                ) : (
-                  <div className="w-full h-full relative">
-                    <img 
-                      src={profile?.banner_url || "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&fit=crop&q=80"} 
-                      alt="Cover" 
-                      className="w-full h-full object-cover opacity-90 scale-105"
-                    />
-                    {/* Blue/Cyberpunk gradient overlays to match image banner */}
-                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
-                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-950/40 mix-blend-multiply" />
-                  </div>
-                )}
-
-
-                {/* Cover Banner Crown pill status */}
-                <div className="absolute bottom-4 right-6 bg-[#000000]/45 backdrop-blur-md text-white text-[11px] font-extrabold px-3.5 py-2 rounded-full flex items-center gap-1.5 border border-white/10 shadow-lg">
-                  <Crown size={12} className="text-yellow-400 fill-yellow-400" />
-                  <span>Elite Trader</span>
-                </div>
-              </div>
-
-              {/* Profile Details Area */}
-              <div className="px-8 pb-5 relative pt-4">
-                
-                {/* Horizontal Layout containing Avatar & Stats top-level row */}
-                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
-                  
-                  {/* Left: Avatar container overlapping covers */}
-                  <div className="relative -mt-16 sm:-mt-20 shrink-0">
-                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-[#1A2238] overflow-hidden bg-white dark:bg-[#0E121F] relative">
-                      {loading ? (
-                        <div className="w-full h-full animate-pulse bg-slate-200 dark:bg-slate-700" />
-                      ) : (
-                        <img 
-                          src={profile?.avatar_url || \`https://api.dicebear.com/7.x/initials/svg?seed=\${profile?.display_name || 'T'}\`} 
-                          alt="Avatar" 
-                          className="w-full h-full object-cover"
-                        />
-                      )}
-                    </div>
-                  </div>
-
-                  {/* Right: Stats display horizontally positioned next to the avatar (Using Inter font weights) */}
-                  <div className="flex flex-1 justify-around sm:justify-end gap-6 sm:gap-14 w-full sm:w-auto py-2 sm:py-0 text-center sm:text-right">
-                    <div className="min-w-[65px] text-center">
-                      <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{ownPostsCount}</p>
-                      <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mt-2 leading-none">posts</p>
-                    </div>
-                    <div className="border-r border-slate-200 dark:border-slate-800/80 h-8 self-center hidden sm:block" />
-                    <div 
-                      onClick={() => handleFollowStatClick('followers')}
-                      className="min-w-[75px] text-center cursor-pointer hover:opacity-70 transition-opacity"
-                    >
-                      <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{followerCount}</p>
-                      <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mt-2 leading-none">followers</p>
-                    </div>
-                    <div className="border-r border-slate-200 dark:border-slate-800/80 h-8 self-center hidden sm:block" />
-                    <div 
-                      onClick={() => handleFollowStatClick('following')}
-                      className="min-w-[75px] text-center cursor-pointer hover:opacity-70 transition-opacity"
-                    >
-                      <p className="text-xl sm:text-[23px] font-extrabold text-slate-900 dark:text-white leading-none tracking-tight font-sans">{followingCount}</p>
-                      <p className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mt-2 leading-none">following</p>
-                    </div>
-
-                  </div>
-
-                </div>
-
-                {/* Info and buttons layout below the avatar level */}
-                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-end">
-                  
-                  {/* Left columns: Profile identity labels & pills */}
-                  <div className="md:col-span-8 text-center sm:text-left">
-                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2 leading-tight">
-                      {loading ? (
-                        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg" />
-                      ) : (
-                        <>
-                          {profile?.display_name || profile?.full_name || (!isUUID(username || '') ? username : "Anonymous Trader")}
-                          <CheckCircle2 size={20} className="text-blue-500 fill-blue-500 text-white dark:text-[#0E121F] shrink-0" />
-                          {profile?.account_type === 'creator' && (
-                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 ml-2">
-                                  <Crown size={12} className="text-purple-600 dark:text-purple-400" />
-                                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Creator</span>
-                              </div>
-                          )}
-                        </>
-                      )}
-                    </h1>
-                     <p className="text-[13px] font-semibold text-slate-455 dark:text-slate-500 mt-1">
-                      {loading ? (
-                        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg inline-block" />
-                      ) : (
-                        \`@\${profile?.username || (!isUUID(username || '') ? username : "trader")}\`
-                      )}
-                    </p>
-                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-2.5 mb-1.5 select-none">
-                      <span className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-655 dark:text-blue-400 text-[10.5px] font-black px-2.5 py-1 rounded-lg border border-blue-500/25 flex items-center gap-1 shadow-sm shrink-0">
-                        <Crown size={12} className="text-blue-500" /> Lvl {levelVal}
-                      </span>
-                      <div className="flex items-center gap-2 flex-1 max-w-[180px] min-w-[120px]">
-                        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative">
-                          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: \`\${Math.min(100, (xpVal / xpRequiredVal) * 100)}%\` }} />
-                        </div>
-                        <span className="text-[9.5px] text-slate-455 dark:text-slate-500 font-bold shrink-0">{xpVal}/{xpRequiredVal} XP</span>
-                      </div>
-                    </div>
-                    <p className="text-[14px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed mt-3.5 max-w-xl">
-                      {profile?.bio || "This user hasn't added a bio yet."}
-                    </p>
-
-                    {/* Badges row */}
-                    {profile?.account_type === 'creator' && (
-                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
-                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-650 dark:text-purple-400 text-[11px] font-bold border border-purple-500/10 shadow-sm">
-                          <Crown size={11} className="fill-purple-500/20 text-purple-500" /> Elite Trader
-                        </span>
-                      </div>
-                    )}
-
-                    {/* Geographic and join info */}
-                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-slate-500 dark:text-slate-400 text-xs font-bold mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-800/40">
-                      {privacySettings.show_location && (
-                        <>`;
let cleaned = diff.split('\n').filter(l => l.startsWith('-')).map(l => l.substring(1)).join('\n');
// We need to apply the requested changes here before saving!
// 1. Remove Elite trader badge:
cleaned = cleaned.replace(/\{\/\* Cover Banner Crown pill status \*\/\}\s*<div className="absolute bottom-4 right-6[\s\S]*?<\/div>/, '');
// 2. Change Cover banner fallback:
cleaned = cleaned.replace(/<img \s*src=\{profile\?\.banner_url \|\| "https:\/\/images\.unsplash\.com\/photo-1557682250-33bd709cbe85\?w=1200&fit=crop&q=80"\} \s*alt="Cover" \s*className="w-full h-full object-cover opacity-90 scale-105"\s*\/>/g, 
`{profile?.banner_url && (
                      <img 
                        src={profile.banner_url} 
                        alt="Cover" 
                        className="w-full h-full object-cover opacity-90 scale-105"
                      />
                    )}`);
// 3. Remove the other Elite trader badge:
cleaned = cleaned.replace(/\{\/\* Badges row \*\/\}\s*\{profile\?\.account_type === 'creator' && \(\s*<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">\s*<span className="inline-flex items-center gap-1\.5 px-3 py-1\.5 rounded-lg bg-purple-500\/10 text-purple-650 dark:text-purple-400 text-\[11px\] font-bold border border-purple-500\/10 shadow-sm">\s*<Crown size=\{11\} className="fill-purple-500\/20 text-purple-500" \/> Elite Trader\s*<\/span>\s*<\/div>\s*\)\}/, '');

fs.writeFileSync('restored_block.tsx', cleaned);
console.log('Restored block written successfully!');
