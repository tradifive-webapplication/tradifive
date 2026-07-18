const fs = require('fs');

// 1. Patch AppSidebar.tsx
const pathSidebar = 'src/components/AppSidebar.tsx';
let codeSidebar = fs.readFileSync(pathSidebar, 'utf8');

// Define WrappedCrown near WrappedSparkles
const wrappedCrownDef = `const WrappedCrown = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Crown size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};\n\n`;

codeSidebar = codeSidebar.replace(
  'const WrappedSparkles = (props: any) => {',
  wrappedCrownDef + 'const WrappedSparkles = (props: any) => {'
);

// Swap Star with WrappedCrown for Creator Dashboard
codeSidebar = codeSidebar.replace(
  `  { path: "/creator/analytics", icon: Star, label: "Creator Dashboard" },`,
  `  { path: "/creator/analytics", icon: WrappedCrown, label: "Creator Dashboard" },`
);

fs.writeFileSync(pathSidebar, codeSidebar);
console.log('Successfully patched AppSidebar.tsx with WrappedCrown icon!');

// 2. Patch CreatorAnalytics.tsx
const pathAnalytics = 'src/pages/CreatorAnalytics.tsx';
let codeAnalytics = fs.readFileSync(pathAnalytics, 'utf8');

// Add react-iconly imports
const iconlyImports = `import {
  TwoUsers as IconlyTwoUsers,
  User as IconlyUser,
  Swap as IconlySwap,
  Wallet as IconlyWallet,
  Buy as IconlyBuy,
  Activity as IconlyActivity,
  Show as IconlyShow
} from "react-iconly";\n`;

codeAnalytics = codeAnalytics.replace(
  `import React, { useState, useRef, useEffect } from 'react';`,
  `import React, { useState, useRef, useEffect } from 'react';\n` + iconlyImports
);

// Define WrappedGraduationCap
const wrappedCapDef = `const WrappedGraduationCap = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <GraduationCap size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};\n\n`;

codeAnalytics = codeAnalytics.replace(
  `const GlassCard = ({ children, className = "" }`,
  wrappedCapDef + `const GlassCard = ({ children, className = "" }`
);

// Update StatCard to pass Iconly props
codeAnalytics = codeAnalytics.replace(
  `      <div className={\`p-1.5 rounded-lg border \${statColorMap[color]}\`}>
        <Icon size={14} />
      </div>`,
  `      <div className={\`p-1.5 rounded-lg border \${statColorMap[color]} flex items-center justify-center\`}>
        <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />
      </div>`
);

// Swap icons in StatCards list (lines 127-134)
codeAnalytics = codeAnalytics.replace(`icon={Users}`, `icon={IconlyTwoUsers}`);
codeAnalytics = codeAnalytics.replace(`icon={UserCheck}`, `icon={IconlyUser}`);
codeAnalytics = codeAnalytics.replace(`icon={Repeat}`, `icon={IconlySwap}`);
codeAnalytics = codeAnalytics.replace(`icon={DollarSign}`, `icon={IconlyWallet}`);
codeAnalytics = codeAnalytics.replace(`icon={ShoppingCart}`, `icon={IconlyBuy}`);
codeAnalytics = codeAnalytics.replace(`icon={GraduationCap}`, `icon={WrappedGraduationCap}`);
codeAnalytics = codeAnalytics.replace(`icon={Activity}`, `icon={IconlyActivity}`);
codeAnalytics = codeAnalytics.replace(`icon={Eye}`, `icon={IconlyShow}`);

fs.writeFileSync(pathAnalytics, codeAnalytics);
console.log('Successfully patched CreatorAnalytics.tsx with Iconly components!');
