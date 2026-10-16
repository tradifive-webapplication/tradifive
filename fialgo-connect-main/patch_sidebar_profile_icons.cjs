const fs = require('fs');

const path = 'src/components/AppSidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add User as IconlyUser to react-iconly import
code = code.replace(
  `import { Home, Category, Discovery, Document, Star, ShieldDone, TwoUsers, Scan, TicketStar, Discount, Work, Bag, Video as IconlyVideo, Message, Notification, Logout, Wallet, Setting } from "react-iconly";`,
  `import { Home, Category, Discovery, Document, Star, ShieldDone, TwoUsers, Scan, TicketStar, Discount, Work, Bag, Video as IconlyVideo, Message, Notification, Logout, Wallet, Setting, User as IconlyUser } from "react-iconly";`
);

// 2. Replace User in Profile menu item
code = code.replace(
  `<User size={15} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<IconlyUser set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);
code = code.replace(
  `<User size={15} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<IconlyUser set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);

// 3. Replace UserCheck in Switch Accounts menu item
code = code.replace(
  `<UserCheck size={15} className="text-slate-550 transition-colors shrink-0" />`,
  `<TwoUsers set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 transition-colors shrink-0" />`
);
code = code.replace(
  `<UserCheck size={15} className="text-slate-555 transition-colors shrink-0" />`,
  `<TwoUsers set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-555 transition-colors shrink-0" />`
);

// 4. Update Setting icon size in Settings menu item
code = code.replace(
  `<Setting set="curved" stroke="bold" primaryColor="currentColor" size={15} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<Setting set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-slate-850 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);
code = code.replace(
  `<Setting set="curved" stroke="bold" primaryColor="currentColor" size={15} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`,
  `<Setting set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-slate-855 dark:group-hover:text-slate-200 transition-colors shrink-0" />`
);

// 5. Update Logout icon size in Logout menu item
code = code.replace(
  `<Logout set="curved" stroke="bold" primaryColor="currentColor" size={15} className="text-slate-550 group-hover:text-red-550 transition-colors shrink-0" />`,
  `<Logout set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-550 group-hover:text-red-550 transition-colors shrink-0" />`
);
code = code.replace(
  `<Logout set="curved" stroke="bold" primaryColor="currentColor" size={15} className="text-slate-555 group-hover:text-red-555 transition-colors shrink-0" />`,
  `<Logout set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className="text-slate-555 group-hover:text-red-555 transition-colors shrink-0" />`
);

fs.writeFileSync(path, code);
console.log('Successfully patched AppSidebar.tsx profile menu icons to larger Curved Iconly components!');
