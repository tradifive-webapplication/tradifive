const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'index.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const multiplier = 2.4;

const newCssContent = cssContent.replace(/(-?\d*\.?\d+)vmin/g, (match, p1) => {
    const val = parseFloat(p1);
    const newVal = val * multiplier;
    // Round to 3 decimal places to avoid floating point precision issues
    return `${Math.round(newVal * 1000) / 1000}px`;
});

fs.writeFileSync(cssPath, newCssContent);
console.log('Successfully scaled down custom-ui-switch values in index.css');
