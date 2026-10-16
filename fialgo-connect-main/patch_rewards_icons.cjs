const fs = require('fs');

const path = 'src/pages/CompetitionsRewards.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add react-iconly imports at the top
const iconlyImports = `import {
  Activity as IconlyActivity,
  Star as IconlyStar,
  ShieldDone as IconlyShieldDone,
  Gift as IconlyGift
} from "react-iconly";\n`;

code = code.replace(
  `import React, { useState, useEffect } from "react";`,
  `import React, { useState, useEffect } from "react";\n` + iconlyImports
);

// 2. Define icon wrapper components at module level
const wrappers = `
const WrappedTrophy = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Trophy size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedTarget = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Target size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedFlame = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Flame size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedCrown = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Crown size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedZap = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Zap size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedAward = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Award size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedMedal = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Medal size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedLock = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Lock size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};\n`;

code = code.replace(
  `export default function CompetitionsRewards() {`,
  wrappers + `export default function CompetitionsRewards() {`
);

// 3. Replace XP Milestones icon box
const milestoneTarget = `                  <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${m.unlocked ? m.bg : 'bg-slate-100 dark:bg-[#1A1A1A]'} border \${m.border}\`}>
                    {m.unlocked
                      ? <Icon size={18} className={m.color} />
                      : <Lock size={14} className="text-slate-300 dark:text-slate-700" />}
                  </div>`;

const milestoneReplacement = `                  {(() => {
                    const iconColor = m.unlocked ? \`\${m.color} shrink-0 mt-0.5\` : 'text-slate-350 dark:text-slate-650 shrink-0 mt-0.5';
                    if (!m.unlocked) {
                      return <WrappedLock set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />;
                    }
                    return (
                      <>
                        {m.label === "Rookie" && <IconlyStar set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {m.label === "Competitor" && <WrappedTarget set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {m.label === "Challenger" && <WrappedZap set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {m.label === "Elite Trader" && <WrappedTrophy set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {m.label === "Legend" && <WrappedCrown set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                      </>
                    );
                  })()}`;

code = code.replace(milestoneTarget, milestoneReplacement);

// 4. Replace Redeemable Rewards icon box
const redeemTarget = `                  <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 \${canAfford ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600' : 'bg-slate-100 dark:bg-[#1A1A1A] text-slate-400'}\`}>
                    <Icon size={18} />
                  </div>`;

const redeemReplacement = `                  {(() => {
                    const iconColor = canAfford ? 'text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5' : 'text-slate-455 dark:text-slate-600 shrink-0 mt-0.5';
                    return (
                      <>
                        {r.id === 1 && <IconlyActivity set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {r.id === 2 && <IconlyStar set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {r.id === 3 && <WrappedMedal set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {r.id === 4 && <IconlyGift set="curved" primaryColor="currentColor" size={22} stroke="bold" strokeWidth={2} className={iconColor} />}
                      </>
                    );
                  })()}`;

code = code.replace(redeemTarget, redeemReplacement);

// 5. Replace Achievement Badges icon box
const badgeTarget = `                  <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center \${b.earned ? \`bg-white dark:bg-[#1A1A1A] shadow-lg \${b.glow}\` : 'bg-slate-100 dark:bg-[#1A1A1A]'}\`}>
                    <Icon size={22} className={b.color} />
                  </div>`;

const badgeReplacement = `                  {(() => {
                    const iconColor = b.earned ? \`\${b.color} shrink-0 mt-0.5\` : 'text-slate-350 dark:text-slate-650 shrink-0 mt-0.5';
                    return (
                      <>
                        {b.label === "First Win" && <WrappedTrophy set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "7-Day Streak" && <WrappedFlame set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "Risk Tamer" && <IconlyShieldDone set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "Podium Finisher" && <WrappedAward set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "Century Trader" && <WrappedTarget set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                        {b.label === "Legend Status" && <WrappedCrown set="curved" primaryColor="currentColor" size={26} stroke="bold" strokeWidth={2} className={iconColor} />}
                      </>
                    );
                  })()}`;

code = code.replace(badgeTarget, badgeReplacement);

fs.writeFileSync(path, code);
console.log('Successfully updated CompetitionsRewards.tsx icons to curved Iconly vector components!');
