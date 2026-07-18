const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldComponentRegex = /const AnimatedCheckboxStyles = \(\) => \([\s\S]*?const CustomCheckbox = \(\{ label, checked, onChange \}: \{ label: string, checked: boolean, onChange: \(\) => void \}\) => \([\s\S]*?<\/div>\s*\);/m;

const newComponent = `const AnimatedCheckboxStyles = () => (
   <style>{\`
      .glitch-checkbox-wrapper {
         display: inline-flex;
         align-items: center;
         gap: 12px;
         cursor: pointer;
      }
      .glitch-checkbox-wrapper input[type="checkbox"] {
         display: none;
      }
      .glitch-checkbox-wrapper .box {
         width: 22px;
         height: 22px;
         background-color: #0a0a0c;
         border-radius: 4px;
         position: relative;
         transition: background-color 0.15s ease;
         display: flex;
         align-items: center;
         justify-content: center;
      }
      .dark .glitch-checkbox-wrapper .box {
         background-color: #000;
      }
      .glitch-checkbox-wrapper input[type="checkbox"]:checked + .box {
         background-color: #e52e2e;
      }
      .glitch-checkbox-wrapper .box svg {
         width: 14px;
         height: 14px;
         stroke: white;
         stroke-width: 3.5;
         stroke-linecap: square;
         stroke-linejoin: miter;
         fill: none;
         opacity: 0;
         transform: scale(0.5);
         transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .glitch-checkbox-wrapper input[type="checkbox"]:checked + .box svg {
         opacity: 1;
         transform: scale(1);
      }
      .glitch-checkbox-wrapper .label {
         font-weight: 900;
         font-style: italic;
         font-size: 13px;
         color: #fff;
         text-transform: uppercase;
         letter-spacing: 1px;
         text-shadow: -1.5px 0px 0px #0ff, 1.5px 0px 0px #f00;
         transition: all 0.2s;
      }
      .glitch-checkbox-wrapper:hover .label {
         text-shadow: -2px 0px 0px #0ff, 2px 0px 0px #f00;
      }
      .glitch-checkbox-wrapper:active .box {
         transform: scale(0.95);
      }
   \`}</style>
);

const CustomCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => {
   const id = React.useId().replace(/:/g, '');
   return (
      <label className="glitch-checkbox-wrapper" htmlFor={\`checkbox-\${id}\`}>
         <input 
            type="checkbox" 
            id={\`checkbox-\${id}\`} 
            checked={checked} 
            onChange={onChange} 
         />
         <div className="box">
            <svg viewBox="0 0 14 14">
               <polyline points="2.5 7 6 10.5 11.5 3"></polyline>
            </svg>
         </div>
         <span className="label">{label}</span>
      </label>
   );
};`;

if (oldComponentRegex.test(content)) {
    content = content.replace(oldComponentRegex, newComponent);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully updated CustomCheckbox to glitch style!");
} else {
    console.log("Could not find the old CustomCheckbox component to replace.");
}
