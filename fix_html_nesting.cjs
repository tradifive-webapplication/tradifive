const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// Change <p> to <div> for username (around line 747)
content = content.replace(
    '<p className="text-[13px] font-semibold text-slate-455 dark:text-slate-500 mt-1">',
    '<div className="text-[13px] font-semibold text-slate-455 dark:text-slate-500 mt-1">'
);
content = content.replace(
    /`@\${profile\?\.username \|\| \(\!isUUID\(username \|\| ''\) \? username : "trader"\)}`\s*\n\s*<\/p>/,
    '`@${profile?.username || (!isUUID(username || \'\') ? username : "trader")}`\n                      </div>'
);

// Change <p> to <div> for bio (around line 765)
content = content.replace(
    '<p className="text-[14px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed mt-3.5 max-w-xl">',
    '<div className="text-[14px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed mt-3.5 max-w-xl">'
);
content = content.replace(
    /profile\?\.bio \|\| "No bio provided\."\s*\n\s*<\/p>/,
    'profile?.bio || "No bio provided."\n                      </div>'
);

fs.writeFileSync('src/pages/UserProfilePublic.tsx', content);
console.log('Successfully fixed HTML nesting in UserProfilePublic.tsx');
