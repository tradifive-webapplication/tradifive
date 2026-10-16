const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add AnimatedCheckbox import
if (!content.includes('AnimatedCheckbox')) {
    const importMatch = content.match(/import.*?from.*?;/g);
    if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        content = content.replace(lastImport, lastImport + '\nimport { AnimatedCheckbox } from "../components/AnimatedCheckbox";');
    }
}
// Add icons for messages, texts, alerts if they don't exist
if (!content.includes('MessageSquare, Smartphone, AlertTriangle')) {
    content = content.replace('import {', 'import { MessageSquare, Smartphone, AlertTriangle,');
}

// 2. Replace state
const oldState = `const [notifications, setNotifications] = useState({
      trading: [
         { id: 'risk', label: 'Risk Guard Warnings', push: true, app: true, email: false },
         { id: 'trade', label: 'Trade Executed', push: true, app: true, email: true },
         { id: 'limit', label: 'Daily Limit Reached', push: true, app: true, email: true },
      ],
      account: [
         { id: 'challenge', label: 'Challenge Status Updates', push: true, app: true, email: true },
         { id: 'billing', label: 'Billing & Subscriptions', push: false, app: true, email: true },
         { id: 'security', label: 'Security & Login Alerts', push: true, app: true, email: true },
      ],
      aiSystem: [
         { id: 'insights', label: 'Market Insights (AI)', push: true, app: true, email: false },
         { id: 'coach', label: 'Tradifive AI Coach Tips', push: true, app: true, email: true },
         { id: 'updates', label: 'Platform & System Updates', push: false, app: true, email: false },
      ]
   });`;

const newState = `const [notifications, setNotifications] = useState({
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
         { id: 'system', label: 'System Alerts', push: true, app: true, email: true },
      ],
      account: [
         { id: 'challenge', label: 'Challenge Updates', push: true, app: true, email: true },
         { id: 'billing', label: 'Billing & Subs', push: false, app: true, email: true },
         { id: 'security', label: 'Security Alerts', push: true, app: true, email: true },
      ]
   });`;

content = content.replace(oldState, newState);

// 3. Replace the JSX tab
const tabStart = `{activeTab === "notifications" && (`;
const tabEnd = `)}
                        {activeTab === "privacy" && (`;

const startIndex = content.indexOf(tabStart);
const endIndex = content.indexOf(tabEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const oldTab = content.substring(startIndex, endIndex);
    
    const newTab = `{activeTab === "notifications" && (
                           <motion.div
                              key="notifications"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-6"
                           >
                              {/* GLOBAL CONTROL HUB */}
                              <div className="flex items-center justify-end gap-8 px-8 py-5 bg-slate-50 dark:bg-[#141414] dark:bg-slate-800/30 rounded-[24px] border border-slate-100 dark:border-[#333333] mb-8">
                                 <div className="flex items-center gap-3">
                                    <JoystickSwitch checked={globalOff} onChange={handleGlobalOff} />
                                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Switch off all</span>
                                 </div>
                                 <div className="flex items-center gap-3">
                                    <JoystickSwitch checked={globalEmailOnly} onChange={handleEmailOnly} />
                                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email only</span>
                                 </div>
                              </div>

                              {[
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
                                 },
                                 {
                                    key: 'account',
                                    title: 'Account & Billing',
                                    desc: 'Updates regarding your subscriptions and security.',
                                    icon: User
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
                                          <p className="text-[12px] font-medium text-slate-500 leading-relaxed max-w-sm">
                                             {section.desc}
                                          </p>
                                       </div>
                                       
                                       {/* Toggles */}
                                       <div className="lg:col-span-2">
                                          <div className="flex items-center justify-between mb-4 px-2">
                                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</span>
                                             <div className="flex items-center gap-8 md:gap-12 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <span className="w-8 text-center">Push</span>
                                                <span className="w-8 text-center">App</span>
                                                <span className="w-8 text-center">Email</span>
                                             </div>
                                          </div>

                                          {(notifications as any)[section.key].map((notif: any, i: number) => (
                                             <div 
                                                key={notif.id}
                                                className={\`flex flex-col md:flex-row md:items-center justify-between py-3 gap-4 \${i !== (notifications as any)[section.key].length - 1 ? 'border-b border-slate-100 dark:border-[#222]' : ''}\`}
                                             >
                                                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{notif.label}</span>
                                                <div className="flex items-center gap-8 md:gap-12">
                                                   <div className="w-8 flex justify-center">
                                                      <AnimatedCheckbox
                                                         checked={notif.push}
                                                         onChange={(checked) => handleToggle(section.key, notif.id, 'push')}
                                                      />
                                                   </div>
                                                   <div className="w-8 flex justify-center">
                                                      <AnimatedCheckbox
                                                         checked={notif.app}
                                                         onChange={(checked) => handleToggle(section.key, notif.id, 'app')}
                                                      />
                                                   </div>
                                                   <div className="w-8 flex justify-center">
                                                      <AnimatedCheckbox
                                                         checked={notif.email}
                                                         onChange={(checked) => handleToggle(section.key, notif.id, 'email')}
                                                      />
                                                   </div>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </motion.div>
                        `;
    content = content.replace(oldTab, newTab);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully updated notifications tab.');
} else {
    console.log('Could not find notifications tab boundaries.');
}
