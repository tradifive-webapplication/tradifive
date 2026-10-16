import os
import re

files = [
    r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\pages\RiskGuard.tsx',
    r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\components\RiskGuardCard.tsx',
    r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\components\RiskScoreCard.tsx'
]

replacements = [
    # 1. Main Page Title
    (r'text-\[25px\] font-semibold text-slate-800 dark:text-\[#F5F7FA\] tracking-tight leading-none',
     r'text-[24px] font-bold text-slate-800 dark:text-[#F7F8FA] tracking-tight leading-none'),
    (r'text-\[24px\] font-bold text-slate-900 dark:text-\[#F5F7FA\] antialiased',
     r'text-[24px] font-bold text-slate-900 dark:text-[#F7F8FA] antialiased'),

    # 2. Main Page Subtitle
    (r'text-\[12px\] text-slate-400 dark:text-\[#9AA4B2\] mt-2 font-medium',
     r'text-[12px] text-slate-400 dark:text-[#8B95A5] mt-2 font-normal'),

    # 3. Card Titles
    (r'text-\[14px\] font-semibold truncate leading-tight antialiased \$\{active \? "text-slate-800 dark:text-\[#F5F7FA\]" : "text-slate-500 dark:text-\[#E8ECF2\]"',
     r'text-[14px] font-semibold truncate leading-tight antialiased ${active ? "text-slate-800 dark:text-[#F5F7FA]" : "text-slate-500 dark:text-[#E2E7EE]"'),
    (r'text-\[14px\] font-semibold text-slate-800 dark:text-\[#F5F7FA\] leading-tight',
     r'text-[14px] font-semibold text-slate-800 dark:text-[#E2E7EE] leading-tight'),
     
    # 4. Card Subtitles
    (r'text-\[12px\] text-slate-400 dark:text-\[#8E99A8\] font-medium antialiased truncate mt-0\.5',
     r'text-[11px] font-normal text-slate-400 dark:text-[#778396] antialiased truncate mt-0.5'),

    # 5. Uppercase Field Labels
    (r'text-\[10px\] font-semibold text-slate-400 dark:text-\[#91A0B3\] uppercase tracking-\[0\.06em\]',
     r'text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em]'),
    (r'text-\[9px\] font-bold text-slate-400 dark:text-\[#E8ECF2\] uppercase mb-1\.5 block tracking-widest',
     r'text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] mb-1.5 block antialiased'),
    (r'text-\[9px\] font-bold text-slate-400 dark:text-\[#E8ECF2\] uppercase tracking-wider px-1 mb-1 block',
     r'text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] px-1 mb-1 block antialiased'),
    (r'text-\[9px\] font-bold text-slate-400 uppercase mb-1 block tracking-widest',
     r'text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] mb-1 block antialiased'),
    (r'text-\[9px\] font-bold text-slate-400 uppercase block tracking-widest',
     r'text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] block antialiased'),
    (r'text-\[11px\] font-bold text-slate-400 uppercase tracking-widest',
     r'text-[10px] font-semibold text-slate-400 dark:text-[#91A0B4] uppercase tracking-[0.06em] antialiased'),

    # 6 & 8. Input and dropdown values
    (r'text-\[14px\] font-bold text-slate-800 dark:text-\[#F5F7FA\] outline-none',
     r'text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] outline-none tabular-nums'),
    (r'text-\[14px\] font-bold text-slate-800 dark:text-\[#F5F7FA\]  text-center',
     r'text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] text-center tabular-nums'),
    (r'text-\[13px\] font-semibold text-slate-800 dark:text-\[#FFFFFF\] tabular-nums antialiased',
     r'text-[13px] font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums antialiased'),
    (r'font-semibold text-slate-800 dark:text-\[#F5F7FA\]',
     r'font-semibold text-slate-800 dark:text-[#F5F7FA] tabular-nums'),
     
    # 7. Small helper text and slider values
    (r'text-\[10px\] font-medium dark:text-\[#8793A5\]', 
     r'text-[10px] font-medium dark:text-[#8793A5]'),
    (r'text-\[9px\] font-bold text-slate-400',
     r'text-[10px] font-medium text-slate-400 dark:text-[#8793A5] antialiased'),

    # 9 & 10. Active/Inactive Tabs
    (r'text-\[12px\] font-bold transition-all \$\{activeTab === \'([a-z_]+)\' \? \'bg-white dark:bg-\[#2A2A2E\] text-slate-800 dark:text-\[#F5F7FA\] shadow-sm\' : \'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300\'\}',
     r'text-[13px] font-medium transition-all ${activeTab === \'\1\' ? \'bg-white dark:bg-[#2B2E35] font-semibold text-slate-800 dark:text-[#FFFFFF] shadow-sm\' : \'text-slate-500 dark:text-[#778396] hover:text-slate-700 dark:hover:text-[#F5F7FA]\'}'),
    
    # 13. Muted or unavailable data
    (r'text-slate-500 dark:text-\[#6F7A89\]', r'text-slate-500 dark:text-[#667181]'),
    (r'text-slate-500 dark:text-\[#9AA4B2\]', r'text-slate-500 dark:text-[#667181]'),
    
    # 14. Disabled Badge Text
    (r'bg-slate-100 text-slate-500 dark:bg-\[#2B2E35\] dark:text-\[#E8ECF2\]',
     r'bg-slate-100 text-slate-500 dark:bg-[#22252A] dark:text-[#9AA6B6]'),
     
    # Interactive Links
    (r'text-\[#106efb\] dark:text-\[#8DB8FF\]', r'text-[#106efb] dark:text-[#8DB8FF]'),
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for old, new in replacements:
            content = re.sub(old, new, content)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print('Updated successfully')
