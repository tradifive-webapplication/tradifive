const fs = require('fs');

// 1. Patch LiveSessions.tsx
const pathLive = 'src/pages/creator/LiveSessions.tsx';
let codeLive = fs.readFileSync(pathLive, 'utf8');

// Add react-iconly imports
const reactIconlyImportLive = `import {
   Calendar as IconlyCalendar,
   Play as IconlyPlay
} from "react-iconly";\n`;

codeLive = codeLive.replace(
  `import React, { useState, useEffect } from 'react';`,
  `import React, { useState, useEffect } from 'react';\n` + reactIconlyImportLive
);

// Define WrappedRadio
const wrappedRadioDef = `const WrappedRadio = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Radio size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};\n\n`;

codeLive = codeLive.replace(
  `export interface LiveSession {`,
  wrappedRadioDef + `export interface LiveSession {`
);

// Update TABS array
codeLive = codeLive.replace(
  `    { id: 'upcoming', label: 'Upcoming Sessions', icon: Calendar },\n    { id: 'recordings', label: 'Past Recordings', icon: PlayCircle },\n    ...(isCreator ? [{ id: 'stream', label: 'Stream Settings', icon: Radio }] : [])`,
  `    { id: 'upcoming', label: 'Upcoming Sessions', icon: IconlyCalendar },\n    { id: 'recordings', label: 'Past Recordings', icon: IconlyPlay },\n    ...(isCreator ? [{ id: 'stream', label: 'Stream Settings', icon: WrappedRadio }] : [])`
);

// Also try with CRLF
codeLive = codeLive.replace(
  `    { id: 'upcoming', label: 'Upcoming Sessions', icon: Calendar },\r\n    { id: 'recordings', label: 'Past Recordings', icon: PlayCircle },\r\n    ...(isCreator ? [{ id: 'stream', label: 'Stream Settings', icon: Radio }] : [])`,
  `    { id: 'upcoming', label: 'Upcoming Sessions', icon: IconlyCalendar },\n    { id: 'recordings', label: 'Past Recordings', icon: IconlyPlay },\n    ...(isCreator ? [{ id: 'stream', label: 'Stream Settings', icon: WrappedRadio }] : [])`
);

// Replace tab icon rendering loop
codeLive = codeLive.replace(
  `                    <Icon size={14} />`,
  `                    <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

fs.writeFileSync(pathLive, codeLive);
console.log('Successfully patched LiveSessions.tsx tabs with Curved Iconly components!');

// 2. Patch MentorshipHub.tsx
const pathMentorship = 'src/pages/MentorshipHub.tsx';
let codeMentorship = fs.readFileSync(pathMentorship, 'utf8');

// Add more react-iconly imports
const newIconlyImports = `import {
   TwoUsers as IconlyTwoUsers,
   Graph as IconlyGraph,
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   Swap as IconlySwap
} from "react-iconly";`;

codeMentorship = codeMentorship.replace(
  `import {
   TwoUsers as IconlyTwoUsers,
   Graph as IconlyGraph
} from "react-iconly";`,
  newIconlyImports
);

// Define WrappedTarget and statIconColorMap near STATUS_STYLES
const targetAndColorMap = `const WrappedTarget = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Target size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const statIconColorMap: Record<number, string> = {
  0: 'text-emerald-500 dark:text-emerald-400 shrink-0',
  1: 'text-purple-500 dark:text-purple-400 shrink-0',
  2: 'text-blue-500 dark:text-blue-400 shrink-0',
  3: 'text-rose-500 dark:text-rose-400 shrink-0',
};\n\n`;

codeMentorship = codeMentorship.replace(
  `const STATUS_STYLES: Record<string, string> = {`,
  targetAndColorMap + `const STATUS_STYLES: Record<string, string> = {`
);

// Update COMMUNITY_STATS rendering icons list
codeMentorship = codeMentorship.replace(
  `            const icons = [Target, TrendingUp, BarChart2, Activity];`,
  `            const icons = [WrappedTarget, IconlySwap, IconlyDiscovery, IconlyActivity];`
);

// Remove the circle container around icons in COMMUNITY_STATS render
codeMentorship = codeMentorship.replace(
  `                  <div className={\`p-1.5 rounded-lg border \${colors[i]}\`}>
                    <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />
                  </div>`,
  `                  <Icon set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className={statIconColorMap[i]} />`
);

// Check in case CRLF differs
codeMentorship = codeMentorship.replace(
  `                  <div className={\`p-1.5 rounded-lg border \${colors[i]}\`}>\r\n                    <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />\r\n                  </div>`,
  `                  <Icon set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className={statIconColorMap[i]} />`
);

fs.writeFileSync(pathMentorship, codeMentorship);
console.log('Successfully patched MentorshipHub.tsx COMMUNITY_STATS to remove circles and use Curved Iconly!');
