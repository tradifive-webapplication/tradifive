const fs = require('fs');
let code = fs.readFileSync('src/pages/Channel.tsx', 'utf8');

// 1. Modal Wrapper Size & Corners
code = code.replace(
  'sm:max-w-[480px] bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#212123] dark:to-[#171719] border-2 border-white dark:border-[#1A1A1A] rounded-[32px]',
  'sm:max-w-[400px] bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#212123] dark:to-[#171719] border-2 border-white dark:border-[#1A1A1A] rounded-[24px]'
);

// 2. Padding
code = code.replace(
  '<div className="p-8 relative pt-10">',
  '<div className="p-6 relative pt-6">'
);

// 3. Icon size & margin
code = code.replace(
  '<div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 ring-1 ring-indigo-600/20 dark:ring-indigo-500/30">',
  '<div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-600/20 dark:ring-indigo-500/30">'
);
code = code.replace(
  '<Megaphone size={24} className="fill-indigo-600/20" />',
  '<Megaphone size={18} className="fill-indigo-600/20" />'
);
code = code.replace(
  '<DialogHeader className="mb-6 space-y-4">',
  '<DialogHeader className="mb-5 space-y-3">'
);

// 4. Title & Description
code = code.replace(
  '<DialogTitle className="text-[22px] font-black text-slate-900 dark:text-white tracking-tight">',
  '<DialogTitle className="text-[18px] font-extrabold text-slate-900 dark:text-white tracking-tight">'
);
code = code.replace(
  '<p className="text-[13.5px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">',
  '<p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">'
);

// 5. Form spacing
code = code.replace(
  '<form onSubmit={handleCreateChannel} className="space-y-6">',
  '<form onSubmit={handleCreateChannel} className="space-y-4">'
);

// 6. Inputs & Labels
code = code.replace(
  /className="w-full bg-white dark:bg-\[#1A1A1A\] border-2 border-slate-200 dark:border-\[#333\] rounded-2xl px-5 py-3\.5 text-\[14\.5px\] font-bold/g,
  'className="w-full bg-white dark:bg-[#1A1A1A] border-2 border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-[13px] font-bold'
);
code = code.replace(
  /className="w-full bg-white dark:bg-\[#1A1A1A\] border-2 border-slate-200 dark:border-\[#333\] rounded-2xl px-5 py-3\.5 text-\[14\.5px\] font-medium/g,
  'className="w-full bg-white dark:bg-[#1A1A1A] border-2 border-slate-200 dark:border-[#333] rounded-xl px-4 py-2.5 text-[13px] font-medium'
);
// Labels don't need changing, they are already text-[13px] font-bold

// 7. Privacy Mode Buttons
code = code.replace(
  /className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2/g,
  'className={`flex flex-col items-center justify-center p-2 rounded-xl border-2'
);
code = code.replace(
  /className={`w-8 h-8 rounded-full mb-2/g,
  'className={`w-6 h-6 rounded-full mb-1.5'
);
code = code.replace(
  /<Globe size=\{14\} \/>/g,
  '<Globe size={12} />'
);
code = code.replace(
  /<Lock size=\{14\} \/>/g,
  '<Lock size={12} />'
);
code = code.replace(
  /<span className="text-\[12px\] font-bold">Public<\/span>/g,
  '<span className="text-[11px] font-bold">Public</span>'
);
code = code.replace(
  /<span className="text-\[12px\] font-bold">Private<\/span>/g,
  '<span className="text-[11px] font-bold">Private</span>'
);
code = code.replace(
  /<span className="text-\[10px\] text-slate-400 text-center mt-0\.5/g,
  '<span className="text-[9px] text-slate-400 text-center mt-0.5'
);

// 8. Bottom Buttons (Cancel / Continue)
code = code.replace(
  '<div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#222]">',
  '<div className="flex items-center justify-end gap-2 pt-3 mt-2 border-t border-slate-100 dark:border-[#222]">'
);
code = code.replace(
  '<button \n                                  type="button"\n                                  onClick={() => setIsCreateModalOpen(false)}\n                                  className="px-5 py-2.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"\n                                >',
  '<button \n                                  type="button"\n                                  onClick={() => setIsCreateModalOpen(false)}\n                                  className="px-4 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"\n                                >'
);
code = code.replace(
  '<button \n                                  type="button"\n                                  onClick={() => setCreateStep(2)}\n                                  className="px-6 py-2.5 rounded-xl bg-indigo-400 hover:bg-indigo-500 text-white text-[13px] font-bold transition-all flex items-center gap-2 shadow-sm"\n                                >',
  '<button \n                                  type="button"\n                                  onClick={() => setCreateStep(2)}\n                                  className="px-5 py-2 rounded-xl bg-indigo-400 hover:bg-indigo-500 text-white text-[12px] font-bold transition-all flex items-center gap-2 shadow-sm"\n                                >'
);
code = code.replace(
  '<button \n                                  type="submit"\n                                  disabled={isCreating}\n                                  className="px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[13px] font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"\n                                >',
  '<button \n                                  type="submit"\n                                  disabled={isCreating}\n                                  className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[12px] font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"\n                                >'
);


fs.writeFileSync('src/pages/Channel.tsx', code);
console.log('Modal resized to be compact and professional!');
