const fs = require('fs');

const code = fs.readFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/node_modules/react-iconly/dist/lib/mapIcons.js', 'utf-8');
const names = ['Search', 'Category', 'User', 'Setting', 'Ticket', 'Game', 'ShieldDone', 'Document', 'Bookmark', 'Home', 'Notification', 'Plus', 'Menu', 'CloseSquare'];
let icons = {};

names.forEach(name => {
  const regex = new RegExp(`var ${name} = \\\({[\\s\\S]*?displayName = \\\"Iconly${name}\\\"`);
  const match = code.match(regex);
  if (match) {
    const block = match[0];
    const lightIdx = block.indexOf('const Light = () =>');
    if (lightIdx !== -1) {
      const endIdx = block.indexOf('const Broken = () =>', lightIdx) !== -1 ? block.indexOf('const Broken = () =>', lightIdx) : block.indexOf('const TwoTone = () =>', lightIdx);
      if (endIdx !== -1) {
        let lightBlock = block.substring(lightIdx, endIdx);
        
        const transMatch = lightBlock.match(/transform: \"translate\((.*?)\)\"/);
        let transform = transMatch ? transMatch[1] : null;
        
        let paths = [];
        let dMatches = [...lightBlock.matchAll(/d: \"(.*?)\"/g)];
        dMatches.forEach(m => paths.push(m[1]));
        
        if (paths.length > 0) {
          icons[name] = { transform, paths };
        }
      }
    }
  }
});

fs.writeFileSync('c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app/extracted_icons.json', JSON.stringify(icons, null, 2));
