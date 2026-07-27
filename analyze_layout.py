import re
import sys

def main():
    try:
        with open('src/pages/RiskGuard.tsx', 'r', encoding='utf-8') as f:
            content = f.read()

        start_marker = "{/* CORE RISK SETTINGS COMMAND GRID"
        start_idx = content.find(start_marker)
        
        if start_idx == -1:
            print("Could not find start marker")
            return
            
        end_marker = "{/* SIDEBAR */}"
        end_idx = content.find(end_marker, start_idx)
        
        if end_idx == -1:
            print("Could not find end marker")
            return
            
        grid_block = content[start_idx:end_idx]
        
        parts = re.split(r'(\{\/\*\s+BOX.*?\*\/})', grid_block)
        
        boxes = {}
        current_box_name = None
        current_box_content = ""
        
        for part in parts:
            if part.startswith('{/* BOX'):
                if current_box_name:
                    boxes[current_box_name] = current_box_content
                current_box_name = part.strip()
                current_box_content = part
            else:
                if current_box_name:
                    current_box_content += part
        
        if current_box_name:
            boxes[current_box_name] = current_box_content
            
        # Clean up trailing divs by truncating after the last </motion.div>
        for k, v in boxes.items():
            last_motion = v.rfind('</motion.div>')
            if last_motion != -1:
                boxes[k] = v[:last_motion + 13] # Include </motion.div>
                
        # Reconstruct the new layout
        new_layout = f"""            {{/* CORE RISK SETTINGS COMMAND GRID (RESTRUCTURED BY CATEGORY) */}}
            <div className="space-y-12 pt-4 pb-20">

               {{/* TRADING CONTROL SECTION */}}
               <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-white/10 pb-3 pl-1">
                     <IconlySetting set="curved" className="text-slate-500" size={{20}} />
                     <h2 className="text-[16px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Trading Control</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                     {boxes.get('{/* BOX 1: TARGET CAPITAL GUARD */}', '')}
                     {boxes.get('{/* BOX 5: SESSION SENTINEL */}', '')}
                  </div>
               </div>

               {{/* RISK MANAGEMENT SECTION */}}
               <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-white/10 pb-3 pl-1">
                     <IconlyShieldDone set="curved" className="text-slate-500" size={{20}} />
                     <h2 className="text-[16px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Risk Management</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                     {boxes.get('{/* BOX 2: MAX LOT GUARD */}', '')}
                     {boxes.get('{/* BOX 3: DRAWDOWN GUARD */}', '')}
                     {{activeMarket === 'indian' && (
                        <>
                           {boxes.get('{/* BOX: GUARDIAN PIN */}', '')}
                           {boxes.get('{/* BOX: TERMINAL HARD STOP */}', '')}
                        </>
                     )}}
                  </div>
               </div>

               {{/* BEHAVIOR & DISCIPLINE SECTION */}}
               <div className="space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-white/10 pb-3 pl-1">
                     <IconlyActivity set="curved" className="text-slate-500" size={{20}} />
                     <h2 className="text-[16px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">Behavior & Discipline</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                     {boxes.get('{/* BOX 4: DISCIPLINE SENTINEL */}', '')}
                  </div>
               </div>

            </div>
            
"""
        
        # Replace the old block with the new layout
        new_content = content[:start_idx] + new_layout + content[end_idx:]
        
        with open('src/pages/RiskGuard.tsx', 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print("Updated layout successfully")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
