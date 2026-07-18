const fs = require('fs');

const path = 'src/pages/Discover.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Revert noScroll={false} back to noScroll={true} (both occurrences)
code = code.replace(
  `noPadding={true} noScroll={false}`,
  `noPadding={true} noScroll={true}`
);

code = code.replace(
  `<DashboardLayout breadcrumbs={[{ label: "Discover", path: "/discover" }]} noPadding={true} noScroll={false}>`,
  `<DashboardLayout breadcrumbs={[{ label: "Discover", path: "/discover" }]} noPadding={true} noScroll={true}>`
);

// 2. Restore scroll classes in DiscoverSkeleton
code = code.replace(
  `className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 relative select-none animate-pulse"`,
  `className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide select-none animate-pulse"`
);

// 3. Restore scroll classes in main Discover container
code = code.replace(
  `className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 relative"`,
  `className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide"`
);

fs.writeFileSync(path, code);
console.log('Successfully reverted scroll containment to its original behavior!');
