import os
import re

file_path = r"c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\pages\RiskGuard.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Create the FeatureBox component
feature_box_component = """
// --- Advanced Feature Box ---
function FeatureBox({ title, description, icon: Icon, active, onToggle, value, isEmergency }: any) {
   return (
      <motion.div
         initial={{ opacity: 0, y: 10 }}
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         className={`p-5 rounded-[22px] border-2 bg-gradient-to-b shadow-[0_4px_7px_-5px_rgba(0,0,0,0.12),0_0_0_2px_#E2E8F0] hover:shadow-[0_8px_15px_-5px_rgba(0,0,0,0.15),0_0_0_2px_#D0D0D5] transition-all flex flex-col justify-between space-y-4 relative overflow-hidden isolate ${
            isEmergency 
               ? 'from-rose-50 to-white border-rose-100 dark:from-rose-950/20 dark:to-transparent dark:border-rose-900/30' 
               : 'from-[#F8F9FC] to-[#FFFFFF] border-white dark:from-[#1E1E1E] dark:to-[#1E1E1E] dark:border-white/5'
         } dark:bg-none dark:rounded-[20px] dark:shadow-none dark:hover:shadow-none`}
      >
         <div className="relative z-20 flex items-start justify-between">
            <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  isEmergency 
                     ? 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-500 dark:border-rose-900/50' 
                     : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border-transparent dark:border-white/5'
               }`}>
                  <Icon size={16} strokeWidth={2.5} />
               </div>
               <div>
                  <h3 className="text-[13px] font-semibold text-slate-800 dark:text-white leading-tight">{title}</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-snug pr-2">{description}</p>
               </div>
            </div>
            {isEmergency ? (
               <button className="px-3 py-1.5 text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors shrink-0">
                  Trigger
               </button>
            ) : (
               <Switch checked={active} onChange={onToggle} />
            )}
         </div>
         {value && !isEmergency && (
            <div className="flex justify-between items-end pt-2 border-t border-slate-100 dark:border-slate-800/50">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Setting</span>
               <span className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400">{value}</span>
            </div>
         )}
      </motion.div>
   );
}
"""

if "// --- Custom Neumorphic Toggle Switch" in content:
    content = content.replace("export default function RiskGuard", feature_box_component + "\nexport default function RiskGuard")

advanced_rules_jsx = """
               {/* ADVANCED RULES GRID */}
               <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-white/10">
                  <div className="mb-6">
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="text-indigo-500" size={24} />
                        Advanced AI Protections
                     </h2>
                     <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Configure advanced behavioral and psychological safeguards for your account.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     <FeatureBox title="Consecutive Loss Lock" description="Lock trading after consecutive losses" icon={Lock} active={true} onToggle={()=>{}} value="3 Losses" />
                     <FeatureBox title="Daily Profit Target Lock" description="Lock in profits once target is hit" icon={Target} active={false} onToggle={()=>{}} value="₹10,000" />
                     <FeatureBox title="Risk Per Trade" description="Maximum risk allowed per trade" icon={Activity} active={true} onToggle={()=>{}} value="1%" />
                     <FeatureBox title="No Averaging Down" description="Block adding positions to losing trades" icon={TrendingDown} active={true} onToggle={()=>{}} value="Strict" />
                     <FeatureBox title="Martingale Detection" description="Detect and block martingale lot sizing" icon={AlertOctagon} active={true} onToggle={()=>{}} value="Active" />
                     <FeatureBox title="Stop Loss Required" description="Block trades missing a hard Stop Loss" icon={ShieldCheck} active={true} onToggle={()=>{}} value="Required" />
                     <FeatureBox title="Emotional Trading Detector" description="Analyze rapid orders to pause trading" icon={HeartPulse} active={false} onToggle={()=>{}} value="High Sens." />
                     <FeatureBox title="Sleep Protection" description="Block trading during local sleeping hours" icon={Moon} active={true} onToggle={()=>{}} value="11 PM - 6 AM" />
                     <FeatureBox title="Weekend Lock" description="Block opening positions on weekends" icon={Calendar} active={true} onToggle={()=>{}} value="Fri - Sun" />
                     <FeatureBox title="One Instrument Mode" description="Limit trading to a single ticker symbol" icon={Target} active={false} onToggle={()=>{}} value="NIFTY50" />
                     <FeatureBox title="Psychology Check" description="Require a calm-check quiz before start" icon={Brain} active={false} onToggle={()=>{}} value="Required" />
                     <FeatureBox title="Pre-Trade Checklist" description="Mandatory checklist before first trade" icon={CheckSquare} active={false} onToggle={()=>{}} value="4 Steps" />
                     <FeatureBox title="AI Voice Warning" description="Audible alerts when nearing risk limits" icon={Volume2} active={false} onToggle={()=>{}} value="Medium Vol" />
                     <FeatureBox title="Account Protection" description="Hard lock if unauthorized geolocs detected" icon={ShieldCheck} active={true} onToggle={()=>{}} value="Active" />
                     <FeatureBox title="Risk Score Check" description="Disable terminal if AI Risk Score < 60" icon={Activity} active={true} onToggle={()=>{}} value="Min 60/100" />
                     <FeatureBox title="Family Emergency Lock" description="Absolute lock that requires 2FA to unlock" icon={Power} active={false} onToggle={()=>{}} isEmergency={true} />
                  </div>
               </div>
"""

target = "</div>\n               </div>\n            </div>\n\n            {/* HARD STOP OVERLAY */}"
if target in content:
    content = content.replace(target, advanced_rules_jsx + "\n" + target)
else:
    # Try another pattern
    target = "</div>\n               </div>\n            </div>"
    if target in content:
        content = content.replace(target, advanced_rules_jsx + "\n" + target)
    else:
        print("Could not find the insertion target")

imports_to_add = ["HeartPulse", "Moon", "Volume2", "CheckSquare", "Target", "TrendingDown", "AlertOctagon", "ShieldCheck", "Calendar", "Brain", "Power", "ShieldAlert", "Activity", "Lock"]
for imp in imports_to_add:
    if imp not in content:
        if "Crown\n} from \"lucide-react\";" in content:
            content = content.replace("Crown\n} from \"lucide-react\";", f"Crown,\n   {imp}\n}} from \"lucide-react\";")
        elif "Crown," in content:
            content = content.replace("Crown,", f"Crown, {imp},")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated successfully")
