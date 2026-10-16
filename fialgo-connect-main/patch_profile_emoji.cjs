const fs = require('fs');

const path = 'src/pages/Profile.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace {profile?.country_emoji || "🌍"} with a matching Globe icon
code = code.replace(
  `{profile?.country_emoji || "🌍"}`,
  `<Globe size={13.5} className="text-slate-400 shrink-0" />`
);

fs.writeFileSync(path, code);
console.log('Successfully replaced profile country emoji with matching Globe icon!');
