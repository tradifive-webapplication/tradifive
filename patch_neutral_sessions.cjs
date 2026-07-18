const fs = require('fs');

const path = 'src/pages/TradifiveAI.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Message as IconlyMessage to react-iconly imports
code = code.replace(
  '  Search as IconlySearch\r\n} from "react-iconly";',
  '  Search as IconlySearch,\r\n  Message as IconlyMessage\r\n} from "react-iconly";'
);
code = code.replace(
  '  Search as IconlySearch\n} from "react-iconly";',
  '  Search as IconlySearch,\n  Message as IconlyMessage\n} from "react-iconly";'
);

// 2. Replace MessageSquare with IconlyMessage inside the session render list
// Let's find the MessageSquare usage in lines 1830 to 1860
code = code.replace(
  `<MessageSquare
                          size={15}
                          className={\`shrink-0 mt-0.5 transition-colors \${currentSessionId === session.id
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                            }\`}
                        />`,
  `<IconlyMessage
                          set="curved"
                          primaryColor="currentColor"
                          size={15}
                          className={\`shrink-0 mt-0.5 transition-colors \${currentSessionId === session.id
                              ? "text-slate-600 dark:text-slate-350"
                              : "text-slate-400 group-hover:text-slate-650 dark:group-hover:text-slate-300"
                            }\`}
                        />`
);

// 3. Update subtitle class to be neutral gray/slate
code = code.replace(
  `\${currentSessionId === session.id
                              ? "text-indigo-600/75 dark:text-indigo-400/75"
                              : "text-slate-500 dark:text-slate-550"
                            }\`}>{session.lastMessage}</p>`,
  `\${currentSessionId === session.id
                              ? "text-slate-500 dark:text-slate-400"
                              : "text-slate-400 dark:text-slate-500"
                            }\`}>{session.lastMessage}</p>`
);

fs.writeFileSync(path, code);
console.log('Successfully set recent audit session items to neutral grey/slate colors!');
