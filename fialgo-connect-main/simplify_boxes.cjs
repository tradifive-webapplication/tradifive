const fs = require('fs');
const file = 'src/pages/Settings.tsx';
let content = fs.readFileSync(file, 'utf8');

const overlyComplexBox = 'p-8 rounded-[22px] border-2 border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#212123] dark:to-[#171719] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#2B2B2F]';
const overlyComplexBox2 = 'p-8 rounded-[22px] border-2 border-white dark:border-[#1A1A1A] bg-gradient-to-b from-[#F8F9FC] to-[#FFFFFF] dark:from-[#212123] dark:to-[#171719] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] dark:shadow-[0_4px_7px_-5px_rgba(0,0,0,0.3),0_0_0_2px_#2B2B2F]'; // just in case

const simpleBox = 'p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-slate-800 shadow-sm';

if (content.includes(overlyComplexBox)) {
    content = content.split(overlyComplexBox).join(simpleBox);
    console.log('Replaced all overly complex boxes with simple boxes.');
    fs.writeFileSync(file, content, 'utf8');
} else {
    console.log('Could not find the overly complex box class string.');
}
