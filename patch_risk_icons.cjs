const fs = require('fs');

const path = 'src/pages/RiskGuard.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add react-iconly imports at the top
const reactIconlyImport = `import {
   Discovery as IconlyDiscovery,
   Activity as IconlyActivity,
   ShieldDone as IconlyShieldDone,
   Graph as IconlyGraph,
   TimeSquare as IconlyTimeSquare
} from "react-iconly";\n`;

// Insert the react-iconly imports right after the react import
code = code.replace(
  'import React, { useState, useEffect, useRef } from "react";',
  'import React, { useState, useEffect, useRef } from "react";\n' + reactIconlyImport
);

// 2. Replace Target inside Target Capital Guard
code = code.replace(
  `<Target size={16} />`,
  `<IconlyDiscovery set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

// 3. Replace Shield inside Max Lot Guard
code = code.replace(
  `<Shield size={16} />`,
  `<IconlyShieldDone set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

// 4. Replace TrendingDown inside Drawdown Guard
code = code.replace(
  `<TrendingDown size={16} />`,
  `<IconlyGraph set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

// 5. Replace Brain inside Discipline Sentinel (around line 1224)
code = code.replace(
  `<Brain size={16} />`,
  `<IconlyActivity set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

// 6. Replace Clock inside Session Sentinel
code = code.replace(
  `<Clock size={16} />`,
  `<IconlyTimeSquare set="curved" primaryColor="currentColor" size={17} stroke="bold" strokeWidth={2} />`
);

fs.writeFileSync(path, code);
console.log('Successfully swapped Risk Guard header icons to react-iconly icons with proper stroke weights and sizes!');
