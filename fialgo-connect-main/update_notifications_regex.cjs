const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Replace CustomCheckbox using Regex
content = content.replace(/const CustomCheckbox = \(\{ label, checked, onChange \}: \{ label: string, checked: boolean, onChange: \(\) => void \}\) => \(\s*<div className="flex items-center gap-2 cursor-pointer group" onClick=\{onChange\}>\s*<div className=\{`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all \$\{checked \? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'\}`\}>\s*\{checked && <Check size=\{10\} className="text-white" \/>\}\s*<\/div>\s*<span className=\{`text-\[11px\] font-black uppercase tracking-widest \$\{checked \? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600'\}`\}>\{label\}<\/span>\s*<\/div>\s*\);/, 
`const AnimatedCheckboxStyles = () => (
   <style>{\`
      .animated-checkbox-wrapper input[type="checkbox"] { display: none; }
      .animated-checkbox-wrapper .check { cursor: pointer; position: relative; margin: auto; width: 18px; height: 18px; -webkit-tap-highlight-color: transparent; transform: translate3d(0, 0, 0); }
      .animated-checkbox-wrapper .check:before { content: ""; position: absolute; top: -15px; left: -15px; width: 48px; height: 48px; border-radius: 50%; background: rgba(34,50,84,0.03); opacity: 0; transition: opacity 0.2s ease; }
      .dark .animated-checkbox-wrapper .check:before { background: rgba(255,255,255,0.05); }
      .animated-checkbox-wrapper .check svg { position: relative; z-index: 1; fill: none; stroke-linecap: round; stroke-linejoin: round; stroke: #c8ccd4; stroke-width: 1.5; transform: translate3d(0, 0, 0); transition: all 0.2s ease; }
      .dark .animated-checkbox-wrapper .check svg { stroke: #555; }
      .animated-checkbox-wrapper .check svg path { stroke-dasharray: 60; stroke-dashoffset: 0; }
      .animated-checkbox-wrapper .check svg polyline { stroke-dasharray: 22; stroke-dashoffset: 66; }
      .animated-checkbox-wrapper .check:hover:before { opacity: 1; }
      .animated-checkbox-wrapper .check:hover svg { stroke: #4285f4; }
      .dark .animated-checkbox-wrapper .check:hover svg { stroke: #6b9cfa; }
      .animated-checkbox-wrapper input[type="checkbox"]:checked + .check svg { stroke: #4285f4; }
      .animated-checkbox-wrapper input[type="checkbox"]:checked + .check svg path { stroke-dashoffset: 60; transition: all 0.3s linear; }
      .animated-checkbox-wrapper input[type="checkbox"]:checked + .check svg polyline { stroke-dashoffset: 42; transition: all 0.2s linear; transition-delay: 0.15s; }
   \`}</style>
);

const CustomCheckbox = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
   <div className="flex items-center gap-2 cursor-pointer group" onClick={(e) => { e.preventDefault(); onChange(); }}>
      <div className="animated-checkbox-wrapper">
         <input type="checkbox" checked={checked} readOnly />
         <div className="check">
            <svg width="18px" height="18px" viewBox="0 0 18 18">
               <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
               <polyline points="1 9 7 14 15 4"></polyline>
            </svg>
         </div>
      </div>
      <span className={\`text-[11px] font-black uppercase tracking-widest \${checked ? 'text-slate-900 dark:text-white' : 'text-slate-400 group-hover:text-slate-600'}\`}>{label}</span>
   </div>
);`);

if (!content.includes('<AnimatedCheckboxStyles />')) {
   content = content.replace('{/* SIDEBAR */}', '<AnimatedCheckboxStyles />\n               {/* SIDEBAR */}');
}

if (!content.includes('MessageSquare') && !content.includes('Smartphone')) {
    content = content.replace('import {', 'import { MessageSquare, Smartphone, AlertTriangle,');
}

// 2. Replace state using regex
content = content.replace(/const \[notifications, setNotifications\] = useState\(\{[\s\S]*?aiSystem: \[[\s\S]*?\]\s*\}\);/, 
`const [notifications, setNotifications] = useState({
      messages: [
         { id: 'direct', label: 'Direct Messages', push: true, app: true, email: false },
         { id: 'group', label: 'Group Messages', push: true, app: true, email: false },
         { id: 'mentions', label: 'Mentions & Tags', push: true, app: true, email: true },
      ],
      text: [
         { id: 'sms_alerts', label: 'SMS Security Alerts', push: true, app: false, email: false },
         { id: 'push_marketing', label: 'Push Marketing & Promos', push: false, app: false, email: false },
      ],
      alerts: [
         { id: 'trade', label: 'Trade Execution Alerts', push: true, app: true, email: true },
         { id: 'price', label: 'Price Drops & Spikes', push: true, app: true, email: false },
         { id: 'risk', label: 'Risk Guard Warnings', push: true, app: true, email: true },
         { id: 'system', label: 'System & Downtime Alerts', push: true, app: true, email: true },
      ]
   });`);


// 3. Replace the sections mapping using regex
content = content.replace(/\{\[\s*\{\s*key: 'trading',[\s\S]*?\{\/\* GLOBAL ACTION FOOTER \*\/\}/, 
`{[
                                 {
                                    key: 'messages',
                                    title: 'Messages Notifications',
                                    desc: 'Control alerts for direct messages, groups, and tags.',
                                    icon: MessageSquare
                                 },
                                 {
                                    key: 'text',
                                    title: 'Text Notifications',
                                    desc: 'Manage SMS and push alerts to your devices.',
                                    icon: Smartphone
                                 },
                                 {
                                    key: 'alerts',
                                    title: 'Alerts',
                                    desc: 'Configure trade execution, risk, and price alerts.',
                                    icon: AlertTriangle
                                 }
                              ].map((section) => (
                                 <div key={section.key} className="p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] shadow-sm">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                       {/* Category Info */}
                                       <div className="lg:col-span-1">
                                          <div className="flex items-center gap-3 mb-3">
                                             <div className="p-2 bg-blue-50 dark:bg-blue-600/10 rounded-lg text-blue-600">
                                                <section.icon size={18} />
                                             </div>
                                             <h4 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{section.title}</h4>
                                          </div>
                                          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{section.desc}</p>
                                       </div>

                                       {/* Action Matrix */}
                                       <div className="lg:col-span-2 space-y-1">
                                          {(notifications as any)[section.key].map((notif: any, i: number) => (
                                             <div
                                                key={notif.id}
                                                className={\`flex flex-col md:flex-row md:items-center justify-between py-3 gap-4 \${i !== (notifications as any)[section.key].length - 1 ? 'border-b border-slate-50 dark:border-[#222222] dark:border-[#333333]' : ''}\`}
                                             >
                                                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{notif.label}</span>
                                                <div className="flex items-center gap-4">
                                                   <CustomCheckbox
                                                      label="Push"
                                                      checked={notif.push}
                                                      onChange={() => toggleNotif(section.key, notif.id, 'push')}
                                                   />
                                                   <CustomCheckbox
                                                      label="In-app"
                                                      checked={notif.app}
                                                      onChange={() => toggleNotif(section.key, notif.id, 'app')}
                                                   />
                                                   <CustomCheckbox
                                                      label="Email"
                                                      checked={notif.email}
                                                      onChange={() => toggleNotif(section.key, notif.id, 'email')}
                                                   />
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              ))}

                              {/* GLOBAL ACTION FOOTER */}`);

fs.writeFileSync(file, content, 'utf8');
console.log("Successfully updated Settings.tsx using Regex!");
