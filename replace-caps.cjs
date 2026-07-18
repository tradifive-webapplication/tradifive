const fs = require('fs');
let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

const replacement = `const CAPABILITIES = [
  {
    id: "01",
    tag: "Capital Protection",
    title: "Autonomous Risk Guard",
    desc: "Set your daily max drawdown. The terminal enforces extreme discipline by locking you out if you tilt, protecting your capital.",
    m: "0.1s",
    mt: "React Speed",
    icon: Shield,
    color: "#a855f7"
  },
  {
    id: "02",
    tag: "Analytics Core",
    title: "Smart Trade Journal",
    desc: "Every trade is automatically synced, logged, and analyzed. Stop manually entering data and start understanding your true edge.",
    m: "100%",
    mt: "Auto-Synced",
    icon: Layers,
    color: "#ec4899"
  },
  {
    id: "03",
    tag: "Social Network",
    title: "The Community Hub",
    desc: "Connect with elite traders. Features direct Messages, premium Signal Channels, and a vibrant Social Feed all in one place.",
    m: "3-in-1",
    mt: "Social Suite",
    icon: MessageSquare,
    color: "#3b82f6"
  }
];`;

const startIdx = code.indexOf('const CAPABILITIES = [');
const endMarker = 'function Features() {';
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    code = code.substring(0, startIdx) + replacement + '\n\n' + code.substring(endIdx);
    fs.writeFileSync('src/pages/Landing.tsx', code, 'utf8');
    console.log("Replaced successfully via substring.");
} else {
    console.log("Could not find start or end index.", startIdx, endIdx);
}
