import re

file_path = "src/pages/RiskGuard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Base replacement for standard inputs and selects
target1 = r"p-2\.5 rounded-\[16px\] border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5"
replacement1 = "px-3 py-0 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] h-[40px] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none"

# Base replacement for steppers
target2 = r"p-1\.5 rounded-\[16px\] border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5"
replacement2 = "px-1.5 py-0 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] h-[40px] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none"

# Base replacement for time inputs
target3 = r"p-2 rounded-\[14px\] border border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-white/5"
replacement3 = "px-3 py-0 rounded-[22px] border-2 border-white bg-gradient-to-b from-[#F4F4F4] to-[#FFFFFF] shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E7E7E7] h-[40px] dark:bg-none dark:bg-[#1E1E1E] dark:border-[1px] dark:border-white/5 dark:rounded-[20px] dark:shadow-none"

content = re.sub(target1, replacement1, content)
content = re.sub(target2, replacement2, content)
content = re.sub(target3, replacement3, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced!")
