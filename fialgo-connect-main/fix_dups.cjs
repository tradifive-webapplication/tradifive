const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'RiskGuard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const duplicateBlock = `   const [defaultStopLoss, setDefaultStopLoss] = useState(15);
   const [weekendCloseTime, setWeekendCloseTime] = useState("20:00");
   const [emotionSensitivity, setEmotionSensitivity] = useState(80);
   const [newsImpactLevel, setNewsImpactLevel] = useState("High");
   const [sleepTimeStart, setSleepTimeStart] = useState("23:00");
   const [checklistItems, setChecklistItems] = useState(3);
   const [psychologyInterval, setPsychologyInterval] = useState("Daily");
   const [reviewDay, setReviewDay] = useState("Saturday");
   const [voiceVolume, setVoiceVolume] = useState(80);`;

// Find first index
const firstIndex = content.indexOf(duplicateBlock);
if (firstIndex !== -1) {
    // Find second index starting after the first one
    const secondIndex = content.indexOf(duplicateBlock, firstIndex + duplicateBlock.length);
    if (secondIndex !== -1) {
        // Remove the second occurrence
        content = content.substring(0, secondIndex) + content.substring(secondIndex + duplicateBlock.length);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Removed duplicate block');
    } else {
        console.log('No second occurrence found');
    }
} else {
    console.log('Block not found');
}
