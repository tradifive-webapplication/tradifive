const fs = require('fs');

const path = 'src/pages/MentorshipHub.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add react-iconly imports at the top
const reactIconlyImport = `import {
   TwoUsers as IconlyTwoUsers,
   Graph as IconlyGraph
} from "react-iconly";\n`;

code = code.replace(
  `import React, { useState } from 'react';`,
  `import React, { useState } from 'react';\n` + reactIconlyImport
);

// 2. Define WrappedBookOpen and WrappedCrown near the top
const iconWrappers = `const WrappedBookOpen = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <BookOpen size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};

const WrappedCrown = (props: any) => {
  const { set, primaryColor, stroke, size, strokeWidth, ...rest } = props;
  return <Crown size={size} strokeWidth={strokeWidth || 2} {...rest} />;
};\n\n`;

code = code.replace(
  `const STATUS_STYLES: Record<string, string> = {`,
  iconWrappers + `const STATUS_STYLES: Record<string, string> = {`
);

// 3. Update TABS array
code = code.replace(
  `const TABS = [\n  { id: 'students', label: 'Student CRM', icon: Users },\n  { id: 'classroom', label: 'Classroom', icon: BookOpen },\n  { id: 'vault', label: 'Resource Vault', icon: Crown },\n  { id: 'insights', label: 'Performance Insights', icon: BarChart2 },\n];`,
  `const TABS = [\n  { id: 'students', label: 'Student CRM', icon: IconlyTwoUsers },\n  { id: 'classroom', label: 'Classroom', icon: WrappedBookOpen },\n  { id: 'vault', label: 'Resource Vault', icon: WrappedCrown },\n  { id: 'insights', label: 'Performance Insights', icon: IconlyGraph },\n];`
);

// Also try with simple newlines in case CRLF differs
code = code.replace(
  `const TABS = [\r\n  { id: 'students', label: 'Student CRM', icon: Users },\r\n  { id: 'classroom', label: 'Classroom', icon: BookOpen },\r\n  { id: 'vault', label: 'Resource Vault', icon: Crown },\r\n  { id: 'insights', label: 'Performance Insights', icon: BarChart2 },\r\n];`,
  `const TABS = [\n  { id: 'students', label: 'Student CRM', icon: IconlyTwoUsers },\n  { id: 'classroom', label: 'Classroom', icon: WrappedBookOpen },\n  { id: 'vault', label: 'Resource Vault', icon: WrappedCrown },\n  { id: 'insights', label: 'Performance Insights', icon: IconlyGraph },\n];`
);

// 4. Update tab button rendering loop to set size={17} with bold Iconly props
code = code.replace(
  `                    <Icon size={14} />`,
  `                    <Icon set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

fs.writeFileSync(path, code);
console.log('Successfully swapped Mentorship Hub tab icons to curved Iconly/wrapped icons with large size and bold weight!');
