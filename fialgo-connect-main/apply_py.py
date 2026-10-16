import sys

def replace_block(content, old_h3, new_h3, old_p_start, tooltip_text, sub_text, color):
    # Find the old h3 line
    idx = content.find(old_h3)
    if idx == -1:
        print(f"Could not find h3: {old_h3}")
        return content
    
    # find the previous '<div>'
    div_idx = content.rfind('<div>', 0, idx)
    if div_idx == -1:
        print(f"Could not find wrapper div for: {old_h3}")
        return content
        
    # find the end of the p tag
    p_idx = content.find(old_p_start, idx)
    if p_idx == -1:
        print(f"Could not find p tag starting with: {old_p_start}")
        return content
        
    p_end = content.find('</p>', p_idx) + 4
    
    # Extract the block to replace
    old_block = content[div_idx:p_end]
    
    # Get indentation
    lines = old_block.split('\n')
    indent = ""
    if len(lines) > 0:
        indent = lines[0][:len(lines[0]) - len(lines[0].lstrip())]
    
    new_block = f"""<div>
{indent}   <div className="flex items-center gap-1.5">
{indent}      {new_h3}
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
        
    replacements = [
        (
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Target Capital Guard</h3>',
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Target Capital Guard</h3>',
            '<p className="text-[10px] text-slate-400 font-medium">Configure target goals',
            'Set profit goals to track progress and stay motivated.',
            'Track your profit goals',
            'indigo-500'
        ),
        (
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Max Lot Guard</h3>',
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">{activeMarket === \\'indian\\' ? \\'Max Quantity Guard\\' : \\'Max Lot Guard\\'}</h3>'.replace("\\'", "'"),
            '<p className="text-[10px] text-slate-400 font-medium">Enforce maximum order volume',
            'Enforce maximum order volume thresholds to prevent oversized trades.',
            'Enforce position sizing limits',
            'blue-500'
        ),
        (
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Drawdown Guard</h3>',
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Drawdown Guard</h3>',
            '<p className="text-[10px] text-slate-400 font-medium">Protect equity with',
            'Automatically lock your terminal if the daily loss limit is hit.',
            'Protect equity with daily limits',
            'emerald-500'
        ),
        (
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Expiry & Event Locks</h3>',
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Expiry & Event Locks</h3>',
            '<p className="text-[10px] text-slate-400 font-medium">Freeze trading on high',
            'Freeze trading on high-volatility days like options expiries.',
            'Block high-volatility days',
            'purple-500'
        ),
        (
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Discipline Sentinel</h3>',
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Discipline Sentinel</h3>',
            '<p className="text-[10px] text-slate-400 font-medium">Restrict the maximum number of trades',
            'Restrict the maximum number of trades per day to prevent overtrading.',
            'Lock max daily executions',
            'cyan-500'
        ),
        (
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Session Sentinel</h3>',
            '<h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">Session Sentinel</h3>',
            '<p className="text-[10px] text-slate-400 font-medium">Only allow trading during',
            'Only allow trading during specified market sessions.',
            'Restrict hourly trading windows',
            'sky-500'
        )
    ]
    
    for old_h3, new_h3, p_start, tooltip, sub, color in replacements:
        content = replace_block(content, old_h3, new_h3, p_start, tooltip, sub, color)
        
    with open('src/pages/RiskGuard.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Done applying tooltips via Python.")

if __name__ == '__main__':
    main()
