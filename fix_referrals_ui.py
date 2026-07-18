# -*- coding: utf-8 -*-
import sys
import re

path = 'src/pages/Referrals.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix TierCard rendering
pattern = r"\{TIERS\.map\(\(tier, i\) => \(\s*<TierCard key=\{tier\.label\} tier=\{tier\} referred=\{stats\.totalReferred\} index=\{i\} />\s*\)\)\}"
new_code = '''{TIERS.map((tier, i) => {
                    let refCount = stats.totalReferred;
                    if (i === 1) refCount = (stats as any).proCount || 0;
                    if (i === 2) refCount = (stats as any).eliteCount || 0;
                    return <TierCard key={tier.label} tier={tier} referred={refCount} index={i} />;
                  })}'''
content = re.sub(pattern, new_code, content, flags=re.DOTALL)


# Fix banner conditions
pattern2 = r"stats\.totalReferred >= 3 && !proClaimed"
new_code2 = "(stats as any).proCount >= 3 && !proClaimed"
content = content.replace(pattern2, new_code2)

pattern3 = r"stats\.totalReferred >= 5 && !eliteClaimed"
new_code3 = "(stats as any).eliteCount >= 5 && !eliteClaimed"
content = content.replace(pattern3, new_code3)


# Fix subValue for metrics
pattern4 = r"subValue=\{\\$\{Math\.max\(0, 3 - stats\.totalReferred\)\} more for Pro Unlock\\}"
new_code4 = "subValue={\\ Pro purchases for Pro Unlock}"
content = content.replace(pattern4, new_code4)

pattern5 = r"progress=\{Math\.min\(100, \(stats\.totalReferred / 3\) \* 100\)\}"
new_code5 = "progress={Math.min(100, (((stats as any).proCount || 0) / 3) * 100)}"
content = content.replace(pattern5, new_code5)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
