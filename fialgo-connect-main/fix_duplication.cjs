const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const lines = code.split('\n');

// Find the start of the duplication
const startIndex = lines.findIndex(l => l.includes('// Dynamic execution limits') && lines.indexOf(l) > 900);

if (startIndex !== -1) {
   // Find the end of the duplication
   const endIndex = lines.findIndex((l, index) => index > startIndex && l.includes('Indian markets are open" };'));
   
   if (endIndex !== -1) {
       // Replace the whole block from startIndex to endIndex + 1 (the `}, [activeMarket]);` line)
       // Wait, we need to replace from startIndex down to the `}, [activeMarket]);`
       const endHookIndex = lines.findIndex((l, index) => index > endIndex && l.includes('}, [activeMarket]);'));
       
       if (endHookIndex !== -1) {
           lines.splice(startIndex, endHookIndex - startIndex + 1,
               '    return { isOpen: true, text: "Indian markets are open" };',
               '  }, [activeMarket]);',
               '',
               '  return ('
           );
           
           fs.writeFileSync('src/pages/Dashboard.tsx', lines.join('\n'));
           console.log('Fixed duplication!');
       } else {
           console.log('End hook not found');
       }
   } else {
       console.log('End of duplication not found');
   }
} else {
   console.log('Start of duplication not found');
}
