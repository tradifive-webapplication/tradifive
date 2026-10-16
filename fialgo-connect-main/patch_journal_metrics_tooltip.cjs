const fs = require('fs');

const path = 'src/components/journal/JournalMetrics.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add tooltip imports at the top
const newImports = `import { Check, GripVertical, Percent } from "lucide-react";
import { 
  ChevronDown as IconlyChevronDown, 
  Show as IconlyShow, 
  Hide as IconlyHide, 
  Category as IconlyCategory, 
  InfoSquare as IconlyInfoSquare, 
  Graph as IconlyGraph, 
  Swap as IconlySwap 
} from "react-iconly";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

function MetricTooltip({ content }: { content: string }) {
  return (
    <Tooltip delayDuration={150}>
      <TooltipTrigger asChild>
        <button type="button" className="cursor-help focus:outline-none flex items-center justify-center shrink-0">
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] bg-slate-950 text-white dark:bg-white dark:text-slate-950 p-2.5 rounded-xl border border-white/10 dark:border-slate-200/50 shadow-xl text-[11px] font-semibold leading-relaxed tracking-tight">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}`;

code = code.replace(`import { Check, GripVertical, Percent } from "lucide-react";
import { 
  ChevronDown as IconlyChevronDown, 
  Show as IconlyShow, 
  Hide as IconlyHide, 
  Category as IconlyCategory, 
  InfoSquare as IconlyInfoSquare, 
  Graph as IconlyGraph, 
  Swap as IconlySwap 
} from "react-iconly";`, newImports);

// 2. Replace static METRIC_CONTENT Info icons
code = code.replace(
  `      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>
        <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-400 dark:text-slate-500 hover:text-slate-500 transition-colors" />`,
  `      <div className="flex items-center gap-1.5">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>
        <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />`
);

code = code.replace(
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>
        <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>
        <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
      </div>`
);

code = code.replace(
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
        <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
        <MetricTooltip content="Your current active streak of winning or losing trades, as well as current drawdown risk metrics." />
      </div>`
);

code = code.replace(
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>
        <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>
        <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio)." />
      </div>`
);

code = code.replace(
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>
        <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
      </div>`,
  `      <div className="flex items-center justify-between">
        <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>
        <MetricTooltip content="Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable." />
      </div>`
);

// 3. Replace dynamic metrics Info icons (loading and actual)
// PNL Loading:
code = code.replace(
  `        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-400 dark:text-slate-500 hover:text-slate-500 transition-colors" />`,
  `        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>
          <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />`
);
// PNL Actual:
code = code.replace(
  `        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-400 dark:text-slate-500 hover:text-slate-500 transition-colors" />`,
  `        <div className="flex items-center gap-1.5">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Account balance & P&L</p>
          <MetricTooltip content="Your current account balance, equity, and net profit/loss across all closed and open trades." />`
);

// Win Rate Loading:
code = code.replace(
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
        </div>`,
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>
          <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
        </div>`
);
// Win Rate Actual:
code = code.replace(
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
        </div>`,
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trade Win %</p>
          <MetricTooltip content="The percentage of winning trades relative to your total executed trades (excluding pending orders)." />
        </div>`
);

// Streak Loading:
code = code.replace(
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
        </div>`,
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
          <MetricTooltip content="Your current active streak of winning or losing trades, as well as current drawdown risk metrics." />
        </div>`
);
// Streak Actual:
code = code.replace(
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
        </div>`,
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
          <MetricTooltip content="Your current active streak of winning or losing trades, as well as current drawdown risk metrics." />
        </div>`
);

// Avg Win/Loss Loading:
code = code.replace(
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
        </div>`,
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>
          <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio)." />
        </div>`
);
// Avg Win/Loss Actual:
code = code.replace(
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
        </div>`,
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Avg Win/Loss</p>
          <MetricTooltip content="The average profit of your winning trades compared to the average loss of your losing trades (Win/Loss Ratio)." />
        </div>`
);

// Profit Factor Loading:
code = code.replace(
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
        </div>`,
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>
          <MetricTooltip content="Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable." />
        </div>`
);
// Profit Factor Actual:
code = code.replace(
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>
          <IconlyInfoSquare set="curved" primaryColor="currentColor" size={13} stroke="bold" className="text-slate-300 dark:text-slate-600 hover:text-slate-400 transition-colors" />
        </div>`,
  `        <div className="flex items-center justify-between">
          <p className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profit Factor</p>
          <MetricTooltip content="Gross profits divided by gross losses. A profit factor above 1.0 means your trading strategy is profitable." />
        </div>`
);

fs.writeFileSync(path, code);
console.log('Successfully wrapped all info icons with dynamic Tooltips and IconlyInfoSquare!');
