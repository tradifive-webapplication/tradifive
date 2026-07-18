const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

// The user wants all the transparent whitish/blackish backgrounds of cards to be #171717
code = code.replace(/background: "rgba\(255,255,255,0\.0[123]5?\)"/g, 'background: "#171717"');
code = code.replace(/background: "rgba\(255, 255, 255, 0\.0[123]5?\)"/g, 'background: "#171717"');
code = code.replace(/background: activeFeature === i \? "rgba\(255,255,255,0\.08\)" : "rgba\(255,255,255,0\.02\)"/g, 'background: activeFeature === i ? "#262626" : "#171717"');

// Fix the CSS classes that have transparent backgrounds
code = code.replace(/background: rgba\(255,255,255,0\.0[123]5?\);/g, 'background: #171717;');

fs.writeFileSync('src/pages/Landing.tsx', code);
console.log('Replaced backgrounds to #171717');
