const fs = require('fs');

const path = 'src/components/AppSidebar.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Insert helper status icon components near top of file (after WrappedCrown definition)
const helperComponents = `const StatusOnlineIcon = () => (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
  </div>
);

const StatusIdleIcon = () => (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  </div>
);

const StatusDndIcon = () => (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm3 10.5H9a.75.75 0 010-1.5h6a.75.75 0 010 1.5z" clipRule="evenodd" />
    </svg>
  </div>
);

const StatusInvisibleIcon = () => (
  <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
    <svg className="w-3 h-3 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
    </svg>
  </div>
);\n\n`;

code = code.replace(
  'const WrappedCrown = (props: any) => {',
  helperComponents + 'const WrappedCrown = (props: any) => {'
);

// 2. Replace active status rendering in menu item (lines 1004-1020 approx)
const activeStatusTarget = `                      <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
                        {userStatus === "Online" && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                        {userStatus === "Idle" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 relative overflow-hidden">
                            <div className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-white dark:bg-[#1E1E1E]" />
                          </div>
                        )}
                        {userStatus === "Do Not Disturb" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex items-center justify-center">
                            <div className="w-1.5 h-[2px] bg-white rounded-full" />
                          </div>
                        )}
                        {userStatus === "Invisible" && (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#1E1E1E]" />
                          </div>
                        )}
                      </div>`;

const activeStatusReplacement = `                      <div className="w-[15px] h-[15px] flex items-center justify-center shrink-0">
                        {userStatus === "Online" && <StatusOnlineIcon />}
                        {userStatus === "Idle" && <StatusIdleIcon />}
                        {userStatus === "Do Not Disturb" && <StatusDndIcon />}
                        {userStatus === "Invisible" && <StatusInvisibleIcon />}
                      </div>`;

code = code.replace(activeStatusTarget, activeStatusReplacement);

// 3. Replace individual items in Status Flyout (Online, Idle, Dnd, Invisible)
// Item 1: Online
code = code.replace(
  `<div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />`,
  `<StatusOnlineIcon />`
);

// Item 2: Idle
const idleTarget = `<div className="w-2.5 h-2.5 rounded-full bg-amber-500 relative overflow-hidden shrink-0">
                          <div className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-white dark:bg-[#1E1E1E]" />
                        </div>`;
code = code.replace(idleTarget, `<StatusIdleIcon />`);

// Item 3: Do Not Disturb
const dndTarget = `<div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 flex items-center justify-center">
                            <div className="w-1.5 h-[2px] bg-white rounded-full" />
                          </div>`;
code = code.replace(dndTarget, `<StatusDndIcon />`);

// Item 4: Invisible
const invisibleTarget = `<div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500 shrink-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#1E1E1E]" />
                          </div>`;
code = code.replace(invisibleTarget, `<StatusInvisibleIcon />`);

fs.writeFileSync(path, code);
console.log('Successfully updated Online Status flyout icons to clean inline SVG vector components!');
