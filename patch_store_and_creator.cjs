const fs = require('fs');

// 1. Patch MyStore.tsx
const pathStore = 'src/pages/creator/MyStore.tsx';
let codeStore = fs.readFileSync(pathStore, 'utf8');

// Add react-iconly imports at the top
const reactIconlyImportStore = `import {
   Bag as IconlyBag,
   Plus as IconlyPlus,
   TicketStar as IconlyTicketStar,
   Wallet as IconlyWallet
} from "react-iconly";\n`;

codeStore = codeStore.replace(
  `import React, { useState, useEffect } from 'react';`,
  `import React, { useState, useEffect } from 'react';\n` + reactIconlyImportStore
);

// Update TABS in MyStore
codeStore = codeStore.replace(
  `const TABS = [\n  { id: 'listings', label: 'My Listings',  icon: Package },\n  { id: 'add',      label: 'Add Listing',  icon: Plus },\n  { id: 'orders',   label: 'Orders',       icon: Star },\n  { id: 'earnings', label: 'Earnings',     icon: DollarSign },\n];`,
  `const TABS = [\n  { id: 'listings', label: 'My Listings',  icon: IconlyBag },\n  { id: 'add',      label: 'Add Listing',  icon: IconlyPlus },\n  { id: 'orders',   label: 'Orders',       icon: IconlyTicketStar },\n  { id: 'earnings', label: 'Earnings',     icon: IconlyWallet },\n];`
);

// Fallback for CRLF
codeStore = codeStore.replace(
  `const TABS = [\r\n  { id: 'listings', label: 'My Listings',  icon: Package },\r\n  { id: 'add',      label: 'Add Listing',  icon: Plus },\r\n  { id: 'orders',   label: 'Orders',       icon: Star },\r\n  { id: 'earnings', label: 'Earnings',     icon: DollarSign },\r\n];`,
  `const TABS = [\n  { id: 'listings', label: 'My Listings',  icon: IconlyBag },\n  { id: 'add',      label: 'Add Listing',  icon: IconlyPlus },\n  { id: 'orders',   label: 'Orders',       icon: IconlyTicketStar },\n  { id: 'earnings', label: 'Earnings',     icon: IconlyWallet },\n];`
);

// Update icon rendering in MyStore tabs map
codeStore = codeStore.replace(
  `                    <Icon size={14} />`,
  `                    <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

fs.writeFileSync(pathStore, codeStore);
console.log('Successfully patched MyStore.tsx with Iconly tab components!');

// 2. Patch CreatorAnalytics.tsx
const pathAnalytics = 'src/pages/CreatorAnalytics.tsx';
let codeAnalytics = fs.readFileSync(pathAnalytics, 'utf8');

// Define statIconColorMap
const statIconColorMapDef = `const statIconColorMap: any = {
  purple: 'text-purple-500 dark:text-purple-400 shrink-0',
  emerald: 'text-emerald-500 dark:text-emerald-400 shrink-0',
  blue: 'text-blue-500 dark:text-blue-400 shrink-0',
  pink: 'text-pink-500 dark:text-pink-400 shrink-0',
  amber: 'text-amber-500 dark:text-amber-400 shrink-0',
};\n\n`;

codeAnalytics = codeAnalytics.replace(
  `const statColorMap: any = {`,
  statIconColorMapDef + `const statColorMap: any = {`
);

// Replace StatCard with no circle div wrapper
codeAnalytics = codeAnalytics.replace(
  `      <div className={\`p-1.5 rounded-lg border \${statColorMap[color]} flex items-center justify-center\`}>
        <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />
      </div>`,
  `      <Icon set="curved" primaryColor="currentColor" size={21} stroke="bold" strokeWidth={2} className={statIconColorMap[color]} />`
);

fs.writeFileSync(pathAnalytics, codeAnalytics);
console.log('Successfully patched CreatorAnalytics.tsx to remove circles from StatCard icons!');
