$path = "c:\Users\nikil\Downloads\fialgo-connect-main\fialgo-connect-main\src\pages\RiskGuard.tsx"
$content = Get-Content -Raw -Encoding UTF8 $path

$content = $content -replace '(?s)<p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">\s*<span className="w-1\.5 h-1\.5 rounded-full bg-slate-500 shrink-0"></span>Trading Control\s*</p>', ''

$content = $content -replace '(?s)<p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">\s*<span className="w-1\.5 h-1\.5 rounded-full bg-slate-500 shrink-0"></span>Risk Management\s*</p>', ''

$content = $content -replace '(?s)<p className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">\s*<span className="w-1\.5 h-1\.5 rounded-full bg-slate-500 shrink-0"></span>Behaviour & Discipline\s*</p>', ''

$content = $content -replace 'bg-white dark:bg-\[#141414\]', 'bg-slate-50 dark:bg-[#141414]'

Set-Content -Path $path -Value $content -Encoding UTF8 -NoNewline
