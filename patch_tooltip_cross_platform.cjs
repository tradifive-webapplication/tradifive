const fs = require('fs');

const path = 'src/components/journal/JournalMetrics.tsx';
let code = fs.readFileSync(path, 'utf8');

const tooltipMap = {
  'Account balance & P&L': 'Your current account balance, equity, and net profit/loss across all closed and open trades.',
  'Trade Win %': 'The percentage of winning trades relative to your total executed trades (excluding pending orders).',
  'Current Streak': 'Your current active streak of winning or losing trades, as well as current drawdown risk metrics.',
  'Avg Win/Loss': 'The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio).',
  'Profit Factor': 'Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable.'
};

let lines = code.split(/\r?\n/);

for (let i = 0; i < lines.length; i++) {
  for (const [title, desc] of Object.entries(tooltipMap)) {
    if (lines[i].includes(title)) {
      // Look at the next line or the line after it for IconlyInfoSquare
      if (lines[i+1] && lines[i+1].includes('IconlyInfoSquare')) {
        const indent = lines[i+1].match(/^\s*/)[0];
        lines[i+1] = `${indent}<MetricTooltip content="${desc}" />`;
      } else if (lines[i+2] && lines[i+2].includes('IconlyInfoSquare')) {
        const indent = lines[i+2].match(/^\s*/)[0];
        lines[i+2] = `${indent}<MetricTooltip content="${desc}" />`;
      }
    }
  }
}

fs.writeFileSync(path, lines.join('\n'));
console.log('Successfully patched tooltips cross-platform!');
