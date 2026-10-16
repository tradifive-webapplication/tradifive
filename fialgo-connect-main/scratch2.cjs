const fs = require('fs');
const path = 'c:\\Users\\nikil\\Downloads\\fialgo-connect-main\\fialgo-connect-main\\src\\pages\\RiskGuard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add states
const statesToAdd = `
   const [defaultStopLoss, setDefaultStopLoss] = useState(15);
   const [weekendCloseTime, setWeekendCloseTime] = useState("20:00");
   const [emotionSensitivity, setEmotionSensitivity] = useState(80);
   const [newsImpactLevel, setNewsImpactLevel] = useState("High");
   const [sleepTimeStart, setSleepTimeStart] = useState("23:00");
   const [checklistItems, setChecklistItems] = useState(3);
   const [psychologyInterval, setPsychologyInterval] = useState("Daily");
   const [reviewDay, setReviewDay] = useState("Saturday");
   const [voiceVolume, setVoiceVolume] = useState(80);
`;
content = content.replace('const [strategyName, setStrategyName] = useState("Breakout Pro");', 'const [strategyName, setStrategyName] = useState("Breakout Pro");\n' + statesToAdd);

// Helper for generating standard input HTML
function getInput(label, valueState, setFunc, type="text", suffix="") {
    let onChange = `e => ${setFunc}(e.target.value)`;
    if(type === "number") onChange = `e => ${setFunc}(Number(e.target.value))`;

    let inputHtml = `
                           <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">${label}</label>
                              <div className="relative flex items-center w-full">
                                <input type="${type}" value={${valueState}} onChange={${onChange}} className="w-full bg-slate-50 dark:bg-[#141414] border border-slate-200/60 dark:border-white/10 rounded-full pl-4 ${suffix ? 'pr-12' : 'pr-4'} py-2 text-[14px] font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-500/30 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all" />
                                ${suffix ? `<span className="absolute right-4 text-[11px] font-bold text-slate-400">${suffix}</span>` : ''}
                              </div>
                           </div>`;
    return inputHtml;
}

// 2. Risk Management Replace
// Drawdown Guard
content = content.replace(
    '<RiskGuardCard icon={ShieldAlert} title="Drawdown Guard" description="Max daily drawdown limits" value={`${maxDrawdown}%`} active={drawdownGuardActive} onToggle={setDrawdownGuardActive}>\n\n                        </RiskGuardCard>',
    '<RiskGuardCard icon={ShieldAlert} title="Drawdown Guard" description="Max daily drawdown limits" value={`${maxDrawdown}%`} active={drawdownGuardActive} onToggle={setDrawdownGuardActive}>' + getInput('MAX DAILY DRAWDOWN', 'maxDrawdown', 'setMaxDrawdown', 'number', '%') + '\n                        </RiskGuardCard>'
);

// Stop Loss Required
content = content.replace(
    '<RiskGuardCard icon={StopCircle} title="Stop Loss Required" description="Require SL on every execution" value={stopLossRequired ? "Active" : "Disabled"} active={stopLossRequired} onToggle={setStopLossRequired} />',
    '<RiskGuardCard icon={StopCircle} title="Stop Loss Required" description="Require SL on every execution" value={stopLossRequired ? "Active" : "Disabled"} active={stopLossRequired} onToggle={setStopLossRequired}>' + getInput('DEFAULT SL DISTANCE', 'defaultStopLoss', 'setDefaultStopLoss', 'number', 'Pips') + '\n                        </RiskGuardCard>'
);

// Weekend Lock
content = content.replace(
    '<RiskGuardCard icon={Calendar} title="Weekend Lock" description="Auto flatten before Friday close" value={weekendLock ? "Active" : "Disabled"} active={weekendLock} onToggle={setWeekendLock} />',
    '<RiskGuardCard icon={Calendar} title="Weekend Lock" description="Auto flatten before Friday close" value={weekendLock ? "Active" : "Disabled"} active={weekendLock} onToggle={setWeekendLock}>' + getInput('FRIDAY CLOSE TIME', 'weekendCloseTime', 'setWeekendCloseTime', 'time') + '\n                        </RiskGuardCard>'
);

// 3. Behaviour & Discipline Replace
content = content.replace(
    '<RiskGuardCard icon={HeartPulse} title="Emotional Detector" description="AI pacing detection" value={emotionalTradingDetector ? "Active" : "Disabled"} active={emotionalTradingDetector} onToggle={setEmotionalTradingDetector} />',
    '<RiskGuardCard icon={HeartPulse} title="Emotional Detector" description="AI pacing detection" value={emotionalTradingDetector ? "Active" : "Disabled"} active={emotionalTradingDetector} onToggle={setEmotionalTradingDetector}>' + getInput('SENSITIVITY SCORE', 'emotionSensitivity', 'setEmotionSensitivity', 'number', '%') + '\n                        </RiskGuardCard>'
);

content = content.replace(
    '<RiskGuardCard icon={AlertTriangle} title="News Filter" description="Block around high-impact news" value={newsFilter ? "Active" : "Disabled"} active={newsFilter} onToggle={setNewsFilter} />',
    '<RiskGuardCard icon={AlertTriangle} title="News Filter" description="Block around high-impact news" value={newsFilter ? "Active" : "Disabled"} active={newsFilter} onToggle={setNewsFilter}>' + getInput('IMPACT LEVEL', 'newsImpactLevel', 'setNewsImpactLevel', 'text') + '\n                        </RiskGuardCard>'
);

content = content.replace(
    '<RiskGuardCard icon={Moon} title="Sleep Protection" description="Disable midnight trading" value={sleepProtection ? "Active" : "Disabled"} active={sleepProtection} onToggle={setSleepProtection} />',
    '<RiskGuardCard icon={Moon} title="Sleep Protection" description="Disable midnight trading" value={sleepProtection ? "Active" : "Disabled"} active={sleepProtection} onToggle={setSleepProtection}>' + getInput('LOCKOUT START TIME', 'sleepTimeStart', 'setSleepTimeStart', 'time') + '\n                        </RiskGuardCard>'
);

content = content.replace(
    '<RiskGuardCard icon={CheckSquare} title="Pre-Trade Checklist" description="Mandatory popup checklist" value={preTradeChecklist ? "Active" : "Disabled"} active={preTradeChecklist} onToggle={setPreTradeChecklist} />',
    '<RiskGuardCard icon={CheckSquare} title="Pre-Trade Checklist" description="Mandatory popup checklist" value={preTradeChecklist ? "Active" : "Disabled"} active={preTradeChecklist} onToggle={setPreTradeChecklist}>' + getInput('REQUIRED CHECKS', 'checklistItems', 'setChecklistItems', 'number') + '\n                        </RiskGuardCard>'
);

content = content.replace(
    '<RiskGuardCard icon={Brain} title="Psychology Check" description="Mandatory mood-slider" value={psychologyCheck ? "Active" : "Disabled"} active={psychologyCheck} onToggle={setPsychologyCheck} />',
    '<RiskGuardCard icon={Brain} title="Psychology Check" description="Mandatory mood-slider" value={psychologyCheck ? "Active" : "Disabled"} active={psychologyCheck} onToggle={setPsychologyCheck}>' + getInput('CHECK FREQUENCY', 'psychologyInterval', 'setPsychologyInterval', 'text') + '\n                        </RiskGuardCard>'
);

content = content.replace(
    '<RiskGuardCard icon={Sparkles} title="AI Weekly Review" description="AI review of your trades" value={aiWeeklyReview ? "Active" : "Disabled"} active={aiWeeklyReview} onToggle={setAiWeeklyReview} />',
    '<RiskGuardCard icon={Sparkles} title="AI Weekly Review" description="AI review of your trades" value={aiWeeklyReview ? "Active" : "Disabled"} active={aiWeeklyReview} onToggle={setAiWeeklyReview}>' + getInput('REVIEW DAY', 'reviewDay', 'setReviewDay', 'text') + '\n                        </RiskGuardCard>'
);

content = content.replace(
    '<RiskGuardCard icon={Volume2} title="AI Voice Warning" description="Audible alerts for limits" value={aiVoiceWarning ? "Active" : "Disabled"} active={aiVoiceWarning} onToggle={setAiVoiceWarning} />',
    '<RiskGuardCard icon={Volume2} title="AI Voice Warning" description="Audible alerts for limits" value={aiVoiceWarning ? "Active" : "Disabled"} active={aiVoiceWarning} onToggle={setAiVoiceWarning}>' + getInput('ALERT VOLUME', 'voiceVolume', 'setVoiceVolume', 'number', '%') + '\n                        </RiskGuardCard>'
);

fs.writeFileSync(path, content, 'utf8');
