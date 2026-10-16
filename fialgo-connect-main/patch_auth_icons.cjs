const fs = require('fs');

// 1. Patch Login.tsx
const pathLogin = 'src/pages/Login.tsx';
let codeLogin = fs.readFileSync(pathLogin, 'utf8');

// Add react-iconly imports at the top
const reactIconlyImportLogin = `import {
   User as IconlyUser,
   Message as IconlyMessage,
   Lock as IconlyLock,
   Show as IconlyShow,
   Hide as IconlyHide,
   ArrowRight as IconlyArrowRight
} from "react-iconly";\n`;

codeLogin = codeLogin.replace(
  `import { useState, useEffect, useRef } from "react";`,
  `import { useState, useEffect, useRef } from "react";\n` + reactIconlyImportLogin
);

// Replace User in inputs (First and Last Name)
// Use unique replace strings to avoid duplicates
codeLogin = codeLogin.replace(
  `<User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />`,
  `<IconlyUser set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />`
);
codeLogin = codeLogin.replace(
  `<User className="w-3.5 h-3.5 lg:w-4 lg:h-4" />`,
  `<IconlyUser set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />`
);

// Replace Mail in input
codeLogin = codeLogin.replace(
  `<Mail className="w-3.5 h-3.5 lg:w-4 lg:h-4" />`,
  `<IconlyMessage set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />`
);

// Replace Lock in inputs (Password and Confirm Password)
codeLogin = codeLogin.replace(
  `<Lock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />`,
  `<IconlyLock set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />`
);
codeLogin = codeLogin.replace(
  `<Lock className="w-3.5 h-3.5 lg:w-4 lg:h-4" />`,
  `<IconlyLock set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />`
);

// Replace eye toggle icons
codeLogin = codeLogin.replace(
  `{showPw ? <EyeOff size={16} /> : <Eye size={16} />}`,
  `{showPw ? <IconlyHide set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} /> : <IconlyShow set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />}`
);

// Replace button ArrowRight icons
codeLogin = codeLogin.replace(
  `<ArrowRight className="w-4 h-4 ml-2" />`,
  `<IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />`
);
codeLogin = codeLogin.replace(
  `<ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 ml-2" />`,
  `<IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />`
);

fs.writeFileSync(pathLogin, codeLogin);
console.log('Successfully patched Login.tsx inputs with Iconly components!');

// 2. Patch ForgotPassword.tsx
const pathForgot = 'src/pages/ForgotPassword.tsx';
let codeForgot = fs.readFileSync(pathForgot, 'utf8');

// Add react-iconly imports at the top
const reactIconlyImportForgot = `import {
   Message as IconlyMessage,
   ArrowLeft as IconlyArrowLeft,
   ArrowRight as IconlyArrowRight
} from "react-iconly";\n`;

codeForgot = codeForgot.replace(
  `import { useState } from "react";`,
  `import { useState } from "react";\n` + reactIconlyImportForgot
);

// Replace Back to Sign In ArrowLeft icon
codeForgot = codeForgot.replace(
  `<ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />`,
  `<IconlyArrowLeft set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} className="mr-2 group-hover:-translate-x-1 transition-transform" />`
);

// Replace Email Address Mail icon
codeForgot = codeForgot.replace(
  `<Mail size={16} />`,
  `<IconlyMessage set="curved" primaryColor="currentColor" size={19} stroke="bold" strokeWidth={2} />`
);

// Replace Send link button ArrowRight icon
codeForgot = codeForgot.replace(
  `<ArrowRight className="w-3.5 h-3.5 ml-2" />`,
  `<IconlyArrowRight set="curved" primaryColor="currentColor" size={18} stroke="bold" strokeWidth={2} className="ml-2" />`
);

fs.writeFileSync(pathForgot, codeForgot);
console.log('Successfully patched ForgotPassword.tsx inputs with Iconly components!');
