const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

const target = `      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
        <div>
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <Users size={16} className="text-purple-500" /> Student CRM
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Manage your students, view tiers, and track progress</p>
        </div>
      </div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">`;

const replacement = `      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5 gap-4">
        <div>
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <Users size={16} className="text-purple-500" /> Student CRM
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-[#949ba4] mt-1 font-medium">Manage your students, view tiers, and track progress</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-end w-full xl:w-auto">`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Moved controls to header!');
