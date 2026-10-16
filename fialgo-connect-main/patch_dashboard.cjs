const fs = require('fs');

let dashboardCode = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const lines = dashboardCode.split('\n');

// Find the incomplete line
let i = lines.length - 1;
while (i >= 0) {
  if (lines[i].includes('border border-slate-100 dark:border-white/1')) {
     lines[i] = '                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl p-4 flex flex-col gap-3">';
     lines.splice(i + 1); // remove everything after it
     lines.push('                       <p className="text-[13px] text-slate-500 font-medium text-center py-4">No recent journal entries to preview.</p>');
     lines.push('                    </div>');
     lines.push('                  </div>');
     lines.push('                </div>');
     lines.push('              )}');
     lines.push('            </GlassCard>');
     lines.push('          </div>');
     lines.push('        </div>');
     lines.push('      </div>');
     lines.push('      </UITooltipProvider>');
     lines.push('    </DashboardLayout>');
     lines.push('  );');
     lines.push('}');
     lines.push('');
     lines.push('export default Dashboard;');
     break;
  }
  i--;
}

fs.writeFileSync('src/pages/Dashboard.tsx', lines.join('\n'));
console.log('Patched Dashboard.tsx again!');
