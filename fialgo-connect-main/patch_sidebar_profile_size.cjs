const fs = require('fs');

const path = 'src/components/AppSidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

// Update IconlyUser size from 21 to 17
code = code.replace(
  `<IconlyUser set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<IconlyUser set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);
code = code.replace(
  `<IconlyUser set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<IconlyUser set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);

// Update TwoUsers size from 21 to 17
code = code.replace(
  `<TwoUsers set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 transition-colors shrink-0" />`,
  `<TwoUsers set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-550 transition-colors shrink-0" />`
);
code = code.replace(
  `<TwoUsers set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-555 transition-colors shrink-0" />`,
  `<TwoUsers set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-555 transition-colors shrink-0" />`
);

// Update Setting size from 21 to 17
code = code.replace(
  `<Setting set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<Setting set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);
code = code.replace(
  `<Setting set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<Setting set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);
code = code.replace(
  `<Setting set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<Setting set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);

// Update Logout size from 21 to 17
code = code.replace(
  `<Logout set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-red-550 transition-colors shrink-0" />`,
  `<Logout set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-red-550 transition-colors shrink-0" />`
);
code = code.replace(
  `<Logout set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-red-555 transition-colors shrink-0" />`,
  `<Logout set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-red-555 transition-colors shrink-0" />`
);

fs.writeFileSync(path, code);
console.log('Successfully resized Profile menu icons from size 21 down to size 17!');
