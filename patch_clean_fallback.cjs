const fs = require('fs');

// 1. Patch TradifiveAI.tsx
const pathAI = 'src/pages/TradifiveAI.tsx';
let codeAI = fs.readFileSync(pathAI, 'utf8');

const targetFallbackAI = `    // Default Fallback
    return \`### 🤖 TradiFive Offline Strategy Engine
    
    I am currently running in **Offline Backup Mode** because the Moonshot/Kimi API key is returning an authentication error (*Invalid Authentication*).
    
    However, I can still analyze your local account data:
    *   **Account Name**: \${userName}
    *   **Live Balance**: \$\${balanceVal.toLocaleString()} USD
    *   **Active Drawdown**: \${drawdownStr}
    *   **Connection Status**: \${isConnected ? "Live Sync Active" : "Demo Simulation Mode"}
    
    Try asking me one of these questions:
    1.  *"what is my name"*
    2.  *"suggest me best trade"*
    3.  *"what is my lot size risk"*
    4.  *"how do i prevent overtrading"*
    5.  *"what is the drawdown risk audit"*
    
    *Note: To restore full conversational AI capability, please check your \\\`VITE_KIMI_API_KEY\\\` setup.*\`;`;

const newFallbackAI = `    // Default Fallback
    return \`I am your TradiFive Strategy Coach. I can help you analyze your:
- **Drawdown diagnostics** (type "drawdown")
- **Trade history** (type "trade history")
- **Calculated lot sizes** (type "lot size")
- **Afternoon overtrading rules** (type "overtrade")
- **Rally regret FOMO mindset** (type "fomo")

What would you like to check next?\`;`;

codeAI = codeAI.replace(targetFallbackAI, newFallbackAI);
// Also try with simple newlines in case CRLF differs
codeAI = codeAI.replace(
  `    // Default Fallback
    return \`### 🤖 TradiFive Offline Strategy Engine\r\n    \r\n    I am currently running in **Offline Backup Mode** because the Moonshot/Kimi API key is returning an authentication error (*Invalid Authentication*).\r\n    \r\n    However, I can still analyze your local account data:\r\n    *   **Account Name**: \${userName}\r\n    *   **Live Balance**: \$\${balanceVal.toLocaleString()} USD\r\n    *   **Active Drawdown**: \${drawdownStr}\r\n    *   **Connection Status**: \${isConnected ? "Live Sync Active" : "Demo Simulation Mode"}\r\n    \r\n    Try asking me one of these questions:\r\n    1.  *"what is my name"*\r\n    2.  *"suggest me best trade"*\r\n    3.  *"what is my lot size risk"*\r\n    4.  *"how do i prevent overtrading"*\r\n    5.  *"what is the drawdown risk audit"*\r\n    \r\n    *Note: To restore full conversational AI capability, please check your \\\`VITE_KIMI_API_KEY\\\` setup.*\`;`,
  newFallbackAI
);

fs.writeFileSync(pathAI, codeAI);

// 2. Patch FloatingAICoach.tsx
const pathFloating = 'src/components/FloatingAICoach.tsx';
let codeFloating = fs.readFileSync(pathFloating, 'utf8');

const targetFallbackFloating = `    // Default Fallback
    let aiResponseText = \`### 🤖 TradiFive Offline Strategy Engine
    
    I am currently running in **Offline Backup Mode** because the Moonshot/Kimi API key is returning an authentication error (*Invalid Authentication*).
    
    However, I can still analyze your local account data:
    *   **Account Name**: \${userName}
    *   **Live Balance**: \$\${balanceVal.toLocaleString()} USD
    *   **Active Drawdown**: \${drawdownStr}
    *   **Connection Status**: \${isConnected ? "Live Sync Active" : "Demo Simulation Mode"}
    
    Try asking me one of these questions:
    1.  *"what is my name"*
    2.  *"suggest me best trade"*
    3.  *"what is my lot size risk"*
    4.  *"how do i prevent overtrading"*
    5.  *"what is the drawdown risk audit"*
    
    *Note: To restore full conversational AI capability, please check your \\\`VITE_KIMI_API_KEY\\\` setup.*\`;`;

const newFallbackFloating = `    // Default Fallback
    let aiResponseText = \`I am your TradiFive Strategy Coach. I can help you analyze your:
- **Drawdown diagnostics** (type "drawdown")
- **Trade history** (type "trade history")
- **Calculated lot sizes** (type "lot size")
- **Afternoon overtrading rules** (type "overtrade")
- **Rally regret FOMO mindset** (type "fomo")

What would you like to check next?\`;`;

codeFloating = codeFloating.replace(targetFallbackFloating, newFallbackFloating);
codeFloating = codeFloating.replace(
  `    // Default Fallback\r\n    let aiResponseText = \`### 🤖 TradiFive Offline Strategy Engine\r\n    \r\n    I am currently running in **Offline Backup Mode** because the Moonshot/Kimi API key is returning an authentication error (*Invalid Authentication*).\r\n    \r\n    However, I can still analyze your local account data:\r\n    *   **Account Name**: \${userName}\r\n    *   **Live Balance**: \$\${balanceVal.toLocaleString()} USD\r\n    *   **Active Drawdown**: \${drawdownStr}\r\n    *   **Connection Status**: \${isConnected ? "Live Sync Active" : "Demo Simulation Mode"}\r\n    \r\n    Try asking me one of these questions:\r\n    1.  *"what is my name"*\r\n    2.  *"suggest me best trade"*\r\n    3.  *"what is my lot size risk"*\r\n    4.  *"how do i prevent overtrading"*\r\n    5.  *"what is the drawdown risk audit"*\r\n    \r\n    *Note: To restore full conversational AI capability, please check your \\\`VITE_KIMI_API_KEY\\\` setup.*\`;`,
  newFallbackFloating
);

fs.writeFileSync(pathFloating, codeFloating);

console.log('Successfully removed TradiFive Offline Strategy Engine debug fallbacks!');
