const fs = require('fs');

const path = 'src/pages/Profile.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Star as IconlyStar to react-iconly imports
code = code.replace(
  `   Edit as IconlyEdit,\n   Send as IconlySend\n} from "react-iconly";`,
  `   Edit as IconlyEdit,\n   Send as IconlySend,\n   Star as IconlyStar\n} from "react-iconly";`
);

// 2. Define WrappedTrophy helper
const trophyDef = `const WrappedTrophy = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Trophy size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};\n\n`;

code = code.replace(
  `const WrappedTarget = (props: any) => {`,
  trophyDef + `const WrappedTarget = (props: any) => {`
);

// 3. Replace target header Trophy icon
code = code.replace(
  `<Trophy size={16} className="text-blue-500" />`,
  `<WrappedTrophy size={18} className="text-blue-500 shrink-0" />`
);

// 4. Replace Discipline score ShieldCheck icon
code = code.replace(
  `<ShieldCheck size={22} className="text-emerald-500" />`,
  `<IconlyShieldDone set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className="text-emerald-500 shrink-0" />`
);

// 5. Replace achievements ledger loop wrapper & icons
const ledgerTarget = `                            <div className={\`p-2.5 rounded-xl shrink-0 \${
                              badge.status === "unlocked" ? "bg-blue-500/10 text-blue-500" : "bg-slate-200 dark:bg-[#1A1A1A] text-slate-400"
                            }\`}>
                              {badge.id === 1 ? <Trophy size={18} /> : 
                               badge.id === 2 ? <ShieldCheck size={18} /> : 
                               badge.id === 3 ? <TrendingUp size={18} /> : 
                               badge.id === 4 ? <Target size={18} /> : 
                               badge.id === 5 ? <Flame size={18} /> : <Star size={18} />}
                            </div>`;

const ledgerReplacement = `                            {(() => {
                              const iconColor = badge.status === "unlocked" ? "text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" : "text-slate-455 dark:text-slate-600 shrink-0 mt-0.5";
                              return (
                                <>
                                  {badge.id === 1 && <WrappedTrophy set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                                  {badge.id === 2 && <IconlyShieldDone set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                                  {badge.id === 3 && <IconlyActivity set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                                  {badge.id === 4 && <WrappedTarget set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                                  {badge.id === 5 && <WrappedFlame set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                                  {badge.id === 6 && <IconlyStar set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                                </>
                              );
                            })()}`;

code = code.replace(ledgerTarget, ledgerReplacement);

// Also handle if CRLF is present in target
code = code.replace(
  `                            <div className={\`p-2.5 rounded-xl shrink-0 \${
                              badge.status === "unlocked" ? "bg-blue-500/10 text-blue-500" : "bg-slate-200 dark:bg-[#1A1A1A] text-slate-400"
                            }\`}>\r\n                              {badge.id === 1 ? <Trophy size={18} /> : \r\n                               badge.id === 2 ? <ShieldCheck size={18} /> : \r\n                               badge.id === 3 ? <TrendingUp size={18} /> : \r\n                               badge.id === 4 ? <Target size={18} /> : \r\n                               badge.id === 5 ? <Flame size={18} /> : <Star size={18} />}\r\n                            </div>`,
  ledgerReplacement
);

fs.writeFileSync(path, code);
console.log('Successfully patched Profile.tsx achievements section, removed circle containers, and set bold Curved Iconly icons!');
