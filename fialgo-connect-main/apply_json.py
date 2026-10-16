import sys
import json

def replace_block(content, title_match, old_p_start, tooltip_text, sub_text, color):
    # Find the h3 line containing title_match
    idx = content.find(title_match)
    if idx == -1:
        print(f"Could not find title: {title_match}")
        return content
        
    # We want to find the start of the h3 tag
    h3_start = content.rfind('<h3', 0, idx)
    if h3_start == -1:
        print(f"Could not find <h3 for: {title_match}")
        return content
        
    # Extract the h3 line
    h3_end = content.find('</h3>', idx) + 5
    h3_line = content[h3_start:h3_end]
    
    # find the previous '<div>'
    div_idx = content.rfind('<div>', 0, h3_start)
    if div_idx == -1:
        print(f"Could not find wrapper div for: {title_match}")
        return content
        
    # find the end of the p tag
    p_idx = content.find(old_p_start, idx)
    if p_idx == -1:
        print(f"Could not find p tag starting with: {old_p_start} near {title_match}")
        return content
        
    p_end = content.find('</p>', p_idx) + 4
    
    # Extract the block to replace
    old_block = content[div_idx:p_end]
    
    if "TooltipProvider" in old_block:
        print(f"Already applied tooltip for {title_match}")
        return content
    
    # Get indentation
    lines = old_block.split('\n')
    indent = ""
    if len(lines) > 0:
        indent = lines[0][:len(lines[0]) - len(lines[0].lstrip())]
    
    new_block = f"""<div>
{indent}   <div className="flex items-center gap-1.5">
{indent}      {h3_line}
{indent}      <TooltipProvider delayDuration={{100}}>
{indent}         <Tooltip>
{indent}            <TooltipTrigger asChild>
{indent}               <button type="button" className="text-slate-400 hover:text-{color} transition-colors">
{indent}                  <Info size={{13}} strokeWidth={{2.5}} />
{indent}               </button>
{indent}            </TooltipTrigger>
{indent}            <TooltipContent side="top" className="max-w-[200px] p-2 bg-white dark:bg-[#1A1A1C] border border-slate-200 dark:border-[#252528] shadow-xl">
{indent}               <p className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{tooltip_text}</p>
{indent}            </TooltipContent>
{indent}         </Tooltip>
{indent}      </TooltipProvider>
{indent}   </div>
{indent}   <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub_text}</p>"""
    
    return content.replace(old_block, new_block)

def main():
    with open('src/pages/RiskGuard.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
        
    with open('data.json', 'r', encoding='utf-8') as f:
        replacements = json.load(f)
        
    for r in replacements:
        content = replace_block(content, r['titleMatch'], r['oldP'], r['tooltip'], r['sub'], r['color'])
        
    with open('src/pages/RiskGuard.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done applying tooltips via Python JSON runner.")

if __name__ == '__main__':
    main()
