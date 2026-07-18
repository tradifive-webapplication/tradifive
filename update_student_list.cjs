const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

// 1. Check if Check icon is imported, if not, we can use CheckCircle2 or just add Check
if (!code.includes('Check,')) {
  code = code.replace(/import {/, 'import {\n  Check,');
}

// 2. Replace the native checkbox with a beautiful custom one with curved corners
const oldCheckbox = `{/* Checkbox */}
            <div className="flex items-center justify-center shrink-0 pr-1">
              <input 
                type="checkbox" 
                checked={selectedStudents.includes(s.id)}
                onChange={() => toggleStudent(s.id)}
                className="w-4 h-4 text-purple-600 bg-slate-100 border-slate-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer accent-purple-500"
              />
            </div>`;

const newCheckbox = `{/* Custom Checkbox */}
            <div 
              className="flex items-center justify-center shrink-0 pr-2 cursor-pointer"
              onClick={(e) => { e.stopPropagation(); toggleStudent(s.id); }}
            >
              <div className={\`w-5 h-5 rounded-[6px] border-2 transition-all flex items-center justify-center \${
                selectedStudents.includes(s.id)
                  ? 'border-purple-500 bg-purple-500 shadow-[0_0_0_4px_rgba(168,85,247,0.15)]'
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1A1A1A] hover:border-purple-400'
              }\`}>
                {selectedStudents.includes(s.id) && <Check size={12} className="text-white" strokeWidth={4} />}
              </div>
            </div>`;

code = code.replace(oldCheckbox, newCheckbox);

// 3. Replace the avatar div with a rounded-full circular avatar that supports image URL
const oldAvatar = `{/* Avatar + Name */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer" onClick={() => toggleStudent(s.id)}>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-extrabold text-purple-600 dark:text-purple-400 shrink-0 border border-purple-500/15">
                {s.avatar}
              </div>`;

const newAvatar = `{/* Avatar + Name */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer" onClick={() => toggleStudent(s.id)}>
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-extrabold text-purple-600 dark:text-purple-400 shrink-0 border border-purple-500/15">
                {/* When real data comes, it will fetch avatarUrl here */}
                {/* {s.avatarUrl ? <img src={s.avatarUrl} alt={s.name} className="w-full h-full object-cover" /> : s.avatar} */}
                {s.avatar}
              </div>`;

code = code.replace(oldAvatar, newAvatar);

fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Updated checkbox and avatar!');
