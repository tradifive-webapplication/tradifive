const fs = require('fs');

const path = './src/pages/Settings.tsx';
let content = fs.readFileSync(path, 'utf8');

const cacheUpdateSnippet = `           if (error) throw error;

           const currentCacheStr = localStorage.getItem('prof_cache_data');
           if (currentCacheStr) {
               try {
                   const currentCache = JSON.parse(currentCacheStr);
                   const updatedCache = {
                       ...currentCache,
                       first_name: profile.firstName,
                       last_name: profile.lastName,
                       display_name: \`\${profile.firstName} \${profile.lastName}\`.trim() || profile.name,
                       username: profile.name,
                       avatar_url: profile.avatarUrl,
                       banner_url: profile.bannerUrl,
                       bio: profile.bio
                   };
                   localStorage.setItem('prof_cache_data', JSON.stringify(updatedCache));
               } catch (e) {}
           }`;

content = content.replace('           if (error) throw error;', cacheUpdateSnippet);

const oldBannerPreview = `{/* Custom Cover Banner Upload */}
                                      <div className="flex flex-col gap-2">
                                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cover Banner</label>
                                      <div className="flex items-center gap-4 p-3 rounded-[8px] bg-white dark:bg-[#1e1f22] border border-slate-200 dark:border-slate-800 shadow-sm">
                                         <div className="w-16 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-800">
                                            <img 
                                            src={profile.bannerUrl || "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&fit=crop&q=80"} 
                                            alt="Banner preview" 
                                            className="w-full h-full object-cover" 
                                            />
                                         </div>
                                         <button
                                            type="button"
                                            onClick={() => bannerUploadRef.current?.click()}
                                            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-[4px] transition-all"
                                         >
                                            Upload Cover
                                         </button>`;

const newBannerPreview = `{/* Custom Cover Banner Upload */}
                                      <div className="flex flex-col gap-2">
                                      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cover Banner</label>
                                      <div className="flex flex-col gap-3 p-3 rounded-[8px] bg-white dark:bg-[#1e1f22] border border-slate-200 dark:border-slate-800 shadow-sm">
                                         <div className="w-full h-24 sm:h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-800 relative group">
                                            <img 
                                            src={profile.bannerUrl || "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&fit=crop&q=80"} 
                                            alt="Banner preview" 
                                            className="w-full h-full object-cover" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button type="button" onClick={() => bannerUploadRef.current?.click()} className="px-4 py-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white border border-white/30 text-xs font-bold rounded-full shadow-lg transition-all">Change Cover</button>
                                            </div>
                                         </div>
                                         <button
                                            type="button"
                                            onClick={() => bannerUploadRef.current?.click()}
                                            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-[4px] transition-all"
                                         >
                                            Upload Cover
                                         </button>`;

// A safer replace strategy that removes whitespace differences
function simplify(str) {
  return str.replace(/\s+/g, ' ').trim();
}

const simplifiedContent = simplify(content);
const simplifiedOld = simplify(oldBannerPreview);

if (!simplifiedContent.includes(simplifiedOld)) {
  console.log("Could not find the banner preview block!");
} else {
  // We can do a line by line replacement to be safe or Regex.
  // Instead, let's use the power of JS replace with a robust regex
  const regexPattern = oldBannerPreview.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  const regex = new RegExp(regexPattern);
  content = content.replace(regex, newBannerPreview);
  
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully replaced handleUpdateProfile and banner preview in Settings.tsx!");
}
