const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const stateRegex = /const \[notifications, setNotifications\] = useState\(\{[\s\S]*?\]\n   \}\);/m;
const newState = `const [notifications, setNotifications] = useState({
      messages: [
         { id: 'direct', label: 'Direct Messages', push: true, app: true, email: false },
         { id: 'group', label: 'Group Messages', push: true, app: true, email: false },
         { id: 'mentions', label: 'Mentions & Tags', push: true, app: true, email: true },
      ],
      channels: [
         { id: 'new_post', label: 'New Channel Posts', push: false, app: true, email: false },
         { id: 'live_stream', label: 'Live Streams & Voice Chats', push: true, app: true, email: false },
         { id: 'replies', label: 'Replies to Your Posts', push: true, app: true, email: true },
         { id: 'community', label: 'Community Events & Announcements', push: false, app: true, email: true },
      ],
      ai: [
         { id: 'daily_brief', label: 'AI Daily Briefings', push: true, app: true, email: false },
         { id: 'trade_analysis', label: 'Post-Trade Analysis', push: false, app: true, email: true },
         { id: 'insights', label: 'AI Market Insights & Alerts', push: true, app: true, email: false },
         { id: 'habits', label: 'Trading Habits Feedback', push: false, app: true, email: true },
      ],
      alerts: [
         { id: 'trade', label: 'Trade Execution Alerts', push: true, app: true, email: true },
         { id: 'price', label: 'Price Drops & Spikes', push: true, app: true, email: false },
         { id: 'risk', label: 'Risk Guard Warnings', push: true, app: true, email: true },
         { id: 'system', label: 'System & Downtime Alerts', push: true, app: true, email: true },
      ],
      security: [
         { id: 'login', label: 'New Device Logins', push: true, app: true, email: true },
         { id: 'billing', label: 'Subscription & Billing', push: false, app: false, email: true },
         { id: 'sms_alerts', label: 'SMS Security Alerts', push: true, app: false, email: false },
      ]
   });`;

const sectionMapRegex = /\{\[\s*\{\s*key: 'messages'[\s\S]*?\]\.map\(\(section\) => \(/m;
const newSectionMap = `{[
                                 {
                                    key: 'messages',
                                    title: 'Messages',
                                    desc: 'Control alerts for direct messages, groups, and tags.',
                                    icon: MessageSquare
                                 },
                                 {
                                    key: 'channels',
                                    title: 'Channels & Community',
                                    desc: 'Stay updated on community posts, replies, and live streams.',
                                    icon: Radio
                                 },
                                 {
                                    key: 'ai',
                                    title: 'AI Coach',
                                    desc: 'Get notified about AI insights, daily briefings, and trade analysis.',
                                    icon: Bot
                                 },
                                 {
                                    key: 'alerts',
                                    title: 'Trading Alerts',
                                    desc: 'Configure trade execution, risk, and system downtime alerts.',
                                    icon: AlertTriangle
                                 },
                                 {
                                    key: 'security',
                                    title: 'Account & Security',
                                    desc: 'Manage billing, login alerts, and SMS security notifications.',
                                    icon: Shield
                                 }
                              ].map((section) => (`;

if (stateRegex.test(content) && sectionMapRegex.test(content)) {
    content = content.replace(stateRegex, newState);
    content = content.replace(sectionMapRegex, newSectionMap);
    fs.writeFileSync(file, content, 'utf8');
    console.log("Successfully expanded notifications");
} else {
    console.log("Could not find patterns to replace.");
}
