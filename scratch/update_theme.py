import os
import re

files = [
    r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\pages\RiskGuard.tsx',
    r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\components\RiskGuardCard.tsx',
    r'c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\components\RiskScoreCard.tsx'
]

replacements = [
    # Card Backgrounds
    (r'dark:bg-\[#1E1E1E\]', r'dark:bg-[#191B1E]'),
    
    # Borders
    (r'dark:border-white/5', r'dark:border-[#2B2F35]'),
    (r'dark:border-white/10', r'dark:border-[#2B2F35]'),
    (r'dark:border-white/20', r'dark:border-[#2B2F35]'),
    (r'border-slate-200/60', r'border-slate-200/60 dark:border-[#2B2F35]'),
    
    # Inputs/Secondary Backgrounds
    (r'dark:bg-\[#141414\]', r'dark:bg-[#22252A]'),
    (r'dark:bg-\[#202020\]', r'dark:bg-[#22252A]'),
    (r'dark:bg-white/5', r'dark:bg-[#22252A]'),
    
    # Hover States
    (r'dark:hover:bg-white/5', r'dark:hover:bg-[#292D33]'),
    (r'dark:hover:bg-white/10', r'dark:hover:bg-[#292D33]'),
    
    # Active/Selected Backgrounds
    (r'dark:bg-white/10', r'dark:bg-[#2B2E35]'),
    
    # Focus Borders
    (r'focus-within:border-indigo-500/30', r'focus-within:border-indigo-500/30 dark:focus-within:border-[#3A4049]'),
    (r'focus:border-indigo-500/30', r'focus:border-indigo-500/30 dark:focus:border-[#3A4049]'),
    
    # Main Page Title
    (r'text-2xl font-black text-slate-900 dark:text-white', r'text-[24px] font-bold text-slate-900 dark:text-[#F5F7FA] antialiased'),
    (r'text-slate-500 dark:text-slate-400 mt-1\.5', r'text-[12px] font-medium text-slate-500 dark:text-[#8E99A8] mt-1.5 antialiased'),
    
    # Section Titles
    (r'text-\[11px\] font-bold text-slate-400 uppercase tracking-widest', r'text-[11px] font-bold text-slate-400 uppercase tracking-widest dark:text-[#91A0B3]'),
    (r'text-\[13px\] font-bold truncate leading-tight', r'text-[14px] font-semibold truncate leading-tight antialiased'),
    (r'dark:text-white', r'dark:text-[#F5F7FA]'),
    (r'dark:text-slate-300', r'dark:text-[#E8ECF2]'),
    
    # Regular Descriptions
    (r'text-\[10\.5px\] text-slate-400 dark:text-slate-400 font-medium', r'text-[12px] text-slate-400 dark:text-[#8E99A8] font-medium antialiased'),
    
    # Small Uppercase Labels
    (r'text-\[9px\] font-bold text-slate-400 dark:text-slate-300 uppercase', r'text-[10px] font-semibold text-slate-400 dark:text-[#91A0B3] uppercase tracking-[0.06em] antialiased'),
    (r'text-\[9px\] font-bold text-slate-400 uppercase', r'text-[10px] font-semibold text-slate-400 dark:text-[#91A0B3] uppercase tracking-[0.06em] antialiased'),
    
    # Inputs/Numbers
    (r'text-\[13px\] font-bold text-slate-800 dark:text-\[#F5F7FA\]', r'text-[13px] font-semibold text-slate-800 dark:text-[#FFFFFF] tabular-nums antialiased'),
    
    # Success/Live Badges
    (r'dark:bg-emerald-950/30', r'dark:bg-[#22D99A]/10'),
    (r'dark:text-emerald-400', r'dark:text-[#22D99A]'),
    (r'emerald-500', r'[#22D99A]'),
    
    # Brand Accents (Indigo -> #6C63FF)
    (r'dark:accent-indigo-500', r'dark:accent-[#6C63FF]'),
    (r'dark:bg-indigo-500', r'dark:bg-[#6C63FF]'),
    (r'dark:text-indigo-400', r'dark:text-[#8DB8FF]'),
    (r'dark:border-indigo-500/20', r'dark:border-[#6C63FF]/20'),
    
    # Muted text
    (r'dark:text-slate-500', r'dark:text-[#6F7A89]'),
    (r'dark:text-slate-400', r'dark:text-[#9AA4B2]'),
    
    # Tab Background
    (r'dark:bg-slate-800/50', r'dark:bg-[#191B1E]'),
    
    # General Drop Shadows and Glows
    (r'shadow-\[.*?\]', ''),
    (r'drop-shadow-\[.*?\]', ''),
    (r'blur-\[.*?\]', ''),
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
