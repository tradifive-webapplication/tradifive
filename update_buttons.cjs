const fs = require('fs');
let code = fs.readFileSync('src/pages/MentorshipHub.tsx', 'utf8');

// 1. Live Sessions Button Color
code = code.replace(
  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20',
  'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-500/20'
);

// 2. Tabs container: rounded-[22px] -> rounded-full
// It has "flex items-center gap-1 bg-gradient-to-b... rounded-[22px]"
code = code.replace(
  /className="flex items-center gap-1 bg-gradient-to-b.*?rounded-\[22px\].*?"/,
  (match) => match.replace('rounded-[22px]', 'rounded-full')
);

// 3. Make all buttons pill-shaped
// We can find all instances of `<button` and replace `rounded-xl` or `rounded-lg` with `rounded-full`
const buttonRegex = /<button[\s\S]*?>/g;
code = code.replace(buttonRegex, (match) => {
  return match
    .replace('rounded-xl', 'rounded-full')
    .replace('rounded-lg', 'rounded-full');
});

// 4. Update the Tier Filter buttons (since they were 'rounded-lg' and we just replaced them inside <button>)
// Let's also check the actual Tabs inside the TABS.map
// They were `rounded-xl` and we replaced them in the <button regex
// Let's just do a blanket check in case any missed.

fs.writeFileSync('src/pages/MentorshipHub.tsx', code);
console.log('Done!');
