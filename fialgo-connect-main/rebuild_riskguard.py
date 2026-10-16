import re
import sys

def main():
    try:
        with open('src/pages/RiskGuard.tsx', 'r', encoding='utf-8') as f:
            content = f.read()

        start_marker = "{/* CORE RISK SETTINGS COMMAND GRID"
        start_idx = content.find(start_marker)
        
        sidebar_marker = "{/* SIDEBAR */}"
        sidebar_idx = content.find(sidebar_marker, start_idx)
        
        if start_idx == -1 or sidebar_idx == -1:
            print("Markers not found!")
            return

        new_layout = """            {/* CORE RISK SETTINGS COMMAND GRID - 9 BOX DESIGN */}
            <div className="pt-4 pb-20">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                  
                  {/* BOX 1: Daily Loss Limit */}
                  <RiskGuardCard 
                     icon={TrendingDown} 
                     title="Daily Loss Limit" 
                     description="Stop trading when daily loss limit is reached"
                     value={`₹5,000 (2%)`}
                     valueColor="text-rose-500"
                     colorTheme="rose"
                     active={hardStopActive}
                     onToggle={() => setHardStopActive(!hardStopActive)}
                     onEdit={() => {}}
                  />

                  {/* BOX 2: Daily Profit Target */}
                  <RiskGuardCard 
                     icon={TrendingUp} 
                     title="Daily Profit Target" 
                     description="Stop trading when daily profit target is achieved"
                     value={`₹10,000 (4%)`}
                     valueColor="text-[#10B981]"
                     colorTheme="emerald"
                     active={true}
                     onToggle={() => {}}
                     onEdit={() => {}}
                  />

                  {/* BOX 3: Daily Trade Limit */}
                  <RiskGuardCard 
                     icon={ClipboardList} 
                     title="Daily Trade Limit" 
                     description="Limit the number of trades you can take per day"
                     value={`${tradeLimit} Trades`}
                     valueColor="text-blue-500"
                     colorTheme="blue"
                     active={tradeLimit > 0}
                     onToggle={() => {}}
                     onEdit={() => {}}
                  />

                  {/* BOX 4: Max Drawdown */}
                  <RiskGuardCard 
                     icon={AlertTriangle} 
                     title="Max Drawdown" 
                     description="Stop trading when drawdown limit is reached"
                     value={`₹15,000 (${maxDrawdown}%)`}
                     valueColor="text-amber-500"
                     colorTheme="amber"
                     active={drawdownGuardActive}
                     onToggle={() => setDrawdownGuardActive(!drawdownGuardActive)}
                     onEdit={() => {}}
                  />

                  {/* BOX 5: Max Lot Size */}
                  <RiskGuardCard 
                     icon={PieChart} 
                     title="Max Lot Size" 
                     description="Limit maximum lot size per trade"
                     value={`0.50 Lots`}
                     valueColor="text-purple-500"
                     colorTheme="purple"
                     active={maxLotActive}
                     onToggle={() => setMaxLotActive(!maxLotActive)}
                     onEdit={() => {}}
                  />

                  {/* BOX 6: Risk Per Trade */}
                  <RiskGuardCard 
                     icon={Percent} 
                     title="Risk Per Trade" 
                     description="Maximum risk allowed per trade"
                     value={`1%`}
                     valueColor="text-teal-500"
                     colorTheme="teal"
                     active={true}
                     onToggle={() => {}}
                     onEdit={() => {}}
                  />

                  {/* BOX 7: Consecutive Loss Lock */}
                  <RiskGuardCard 
                     icon={Lock} 
                     title="Consecutive Loss Lock" 
                     description="Lock trading after consecutive losses"
                     value={`3 Losses`}
                     valueColor="text-rose-500"
                     colorTheme="rose"
                     active={stopAfterLoss}
                     onToggle={() => setStopAfterLoss(!stopAfterLoss)}
                     onEdit={() => {}}
                  />

                  {/* BOX 8: Cooldown After Loss */}
                  <RiskGuardCard 
                     icon={Timer} 
                     title="Cooldown After Loss" 
                     description="Wait time after a loss before next trade"
                     value={`${waitPeriod} Minutes`}
                     valueColor="text-indigo-500"
                     colorTheme="indigo"
                     active={revengeGuard}
                     onToggle={() => setRevengeGuard(!revengeGuard)}
                     onEdit={() => {}}
                  />

                  {/* BOX 9: No Trading After Time */}
                  <RiskGuardCard 
                     icon={Clock} 
                     title="No Trading After Time" 
                     description="Stop opening new trades after this time"
                     value={`8:00 PM`}
                     valueColor="text-amber-500"
                     colorTheme="amber"
                     active={disciplineActive}
                     onToggle={() => setDisciplineActive(!disciplineActive)}
                     onEdit={() => {}}
                  />

               </div>

            </div>
"""

        card_component = """
const RiskGuardCard = ({ icon: Icon, title, description, value, valueColor, colorTheme, active, onToggle, onEdit }: any) => {
   return (
      <div className={`p-4 rounded-[16px] border flex flex-col justify-between min-h-[140px] transition-all ${active ? 'bg-white dark:bg-[#111113] border-slate-200 dark:border-white/10 shadow-sm' : 'bg-slate-50 dark:bg-[#0a0a0b] border-slate-100 dark:border-white/5 opacity-70 grayscale-[20%]'}`}>
         <div className="flex items-start justify-between">
            <div className="flex items-start gap-3.5">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-${colorTheme}-500/30 bg-${colorTheme}-500/10 text-${colorTheme}-500 shrink-0`}>
                  <Icon size={18} strokeWidth={2} />
               </div>
               <div>
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 leading-[1.4] max-w-[140px]">{description}</p>
               </div>
            </div>
            <Switch checked={active} onChange={onToggle} />
         </div>
         <div className="flex items-end justify-between mt-4">
            <div className={`text-[13px] font-bold ${active ? valueColor : 'text-slate-400'} pl-[54px]`}>
               {value}
            </div>
            <button onClick={onEdit} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>
            </button>
         </div>
      </div>
   );
};
"""
        
        parts = content.split("{/* TRADING CONTROL SECTION */}")
        if len(parts) < 2:
            parts = content.split("{/* CORE RISK SETTINGS COMMAND GRID")
            
        before_grid = parts[0]
        
        # We need to find the sidebar
        after_grid_and_sidebar = content[content.find("{/* SIDEBAR */}"):]
        
        icons_to_add = ["TrendingUp", "TrendingDown", "ClipboardList", "PieChart", "Percent"]
        for icon in icons_to_add:
            if icon not in before_grid:
                before_grid = before_grid.replace("import {", f"import {{\n   {icon},", 1)

        riskguard_decl = "export default function RiskGuard()"
        if riskguard_decl in before_grid:
            before_grid = before_grid.replace(riskguard_decl, card_component + "\n" + riskguard_decl)
            
        final_content = before_grid + new_layout + "\n            </div>\n            {/* Closes flex-1 main content column */}\n            " + after_grid_and_sidebar
        
        with open('src/pages/RiskGuard.tsx', 'w', encoding='utf-8') as f:
            f.write(final_content)
            
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
