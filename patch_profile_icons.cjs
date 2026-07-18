const fs = require('fs');

const path = 'src/pages/Profile.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add react-iconly imports at the top
const iconlyImports = `import {
   Discovery as IconlyDiscovery,
   Location as IconlyLocation,
   Calendar as IconlyCalendar,
   Graph as IconlyGraph,
   ShieldDone as IconlyShieldDone,
   Activity as IconlyActivity,
   Edit as IconlyEdit,
   Send as IconlySend
} from "react-iconly";\n`;

code = code.replace(
  `import React, { useState, useEffect, useRef } from "react";`,
  `import React, { useState, useEffect, useRef } from "react";\n` + iconlyImports
);

// 2. Define WrappedTarget and WrappedFlame near PLACEHOLDER_NAMES
const wrappers = `const WrappedTarget = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Target size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedFlame = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Flame size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};\n\n`;

code = code.replace(
  `const PLACEHOLDER_NAMES = [`,
  wrappers + `const PLACEHOLDER_NAMES = [`
);

// 3. Replace metadata icons in the geographic/join info section
code = code.replace(
  `<Globe size={13.5} className="text-slate-400 shrink-0" />`,
  `<IconlyDiscovery set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

code = code.replace(
  `<MapPin size={13.5} className="text-slate-400" />`,
  `<IconlyLocation set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

code = code.replace(
  `<Calendar size={13.5} className="text-slate-400" />`,
  `<IconlyCalendar set="curved" primaryColor="currentColor" size={16} stroke="bold" strokeWidth={2} className="text-slate-400 shrink-0" />`
);

// 4. Replace Edit/Share button icons
code = code.replace(
  `<Pencil size={13} />`,
  `<IconlyEdit set="curved" primaryColor="currentColor" size={15} stroke="bold" strokeWidth={2} />`
);

code = code.replace(
  `<Share2 size={13} />`,
  `<IconlySend set="curved" primaryColor="currentColor" size={15} stroke="bold" strokeWidth={2} />`
);

// 5. Replace Quick Stats icons
code = code.replace(
  `{ title: "Trades", value: totalTradesCount.toLocaleString(), icon: <BarChart2 size={16} className="text-blue-500" />, color: "bg-blue-500/10 text-blue-600" },`,
  `{ title: "Trades", value: totalTradesCount.toLocaleString(), icon: <IconlyGraph set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-blue-500" />, color: "bg-blue-500/10 text-blue-600" },`
);

code = code.replace(
  `{ title: "Win Rate", value: winRateVal, icon: <CheckCircle2 size={16} className="text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-600" },`,
  `{ title: "Win Rate", value: winRateVal, icon: <IconlyShieldDone set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-600" },`
);

code = code.replace(
  `{ title: "ROI (All Time)", value: roiVal, icon: <TrendingUp size={16} className="text-emerald-500 animate-pulse" />, color: "bg-emerald-500/10 text-emerald-600", highlighted: true },`,
  `{ title: "ROI (All Time)", value: roiVal, icon: <IconlyActivity set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-emerald-500 animate-pulse" />, color: "bg-emerald-500/10 text-emerald-600", highlighted: true },`
);

code = code.replace(
  `{ title: "Avg RR", value: avgRRVal, icon: <Target size={16} className="text-purple-500" />, color: "bg-purple-500/10 text-purple-600" },`,
  `{ title: "Avg RR", value: avgRRVal, icon: <WrappedTarget set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-purple-500" />, color: "bg-purple-500/10 text-purple-600" },`
);

code = code.replace(
  `{ title: "Streak", value: streakVal, icon: <Flame size={16} className="text-orange-500 animate-pulse" />, color: "bg-orange-500/10 text-orange-600" }`,
  `{ title: "Streak", value: streakVal, icon: <WrappedFlame set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="text-orange-500 animate-pulse" }`
);

fs.writeFileSync(path, code);
console.log('Successfully swapped Profile page icons with Curved react-iconly components!');
