import re

file_path = r"c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\pages\RiskGuard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r"(\s*\{\/\* ADVANCED RULES GRID \*\/\}[\s\S]*?</div>\n)\n</div>\n               </div>\n            </div>", content)
if match:
    block = match.group(1)
    
    modified_block = block.replace('<div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-white/10">', '<div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-white/10 max-w-7xl mx-auto z-10 w-full relative">')
    
    new_content = "\n                  </div>\n               </div>\n" + modified_block + "\n            </div>"
    content = content.replace(match.group(0), new_content)
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed layout")
else:
    print("Could not find the block to fix")
