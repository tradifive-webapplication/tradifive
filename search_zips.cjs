const fs = require('fs');
const cp = require('child_process');
fs.readdirSync('c:/Users/nikil/Downloads').filter(f => f.endsWith('.zip')).forEach(z => {
  try {
    let out = cp.execSync(`tar -tf "c:/Users/nikil/Downloads/${z}"`).toString();
    if (out.includes('AppSidebar.tsx')) {
      console.log(z);
    }
  } catch(e) {}
});
