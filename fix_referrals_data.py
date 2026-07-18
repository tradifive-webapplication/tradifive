# -*- coding: utf-8 -*-
import sys
import re

path = 'src/pages/Referrals.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace query
q_target = '.select("*, profiles!referrals_referred_id_fkey(display_name, username, created_at)")'
q_replace = '.select("*, profiles!referrals_referred_id_fkey(display_name, username, created_at, account_type)")'
content = content.replace(q_target, q_replace)

# Replace stats parsing
pattern = r"let totalXP = 0;.*?setStats\(\{ totalReferred: refsData\.length, rewardsEarned: totalXP \}\);"
new_code = '''let totalXP = 0;
            let totalProElite = 0;
            let totalElite = 0;
            const friendsList = refsData.map((r: any) => {
              const xp = r.referrer_xp || r.xp_rewarded || 500;
              totalXP += xp;
              const profile = r.profiles || {};
              const name = profile.display_name || profile.username || "Unknown Trader";
              const initials = name.substring(0, 2).toUpperCase();
              const accountType = profile.account_type || 'starter';
              
              if (accountType === 'pro' || accountType === 'elite' || accountType === 'creator') {
                totalProElite++;
              }
              if (accountType === 'elite' || accountType === 'creator') {
                totalElite++;
              }
              
              const dateStr = profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently';
              let statusStr = Signed up - ;
              if (accountType === 'pro') statusStr = Pro Plan Active - ;
              if (accountType === 'elite' || accountType === 'creator') statusStr = Elite Plan Active - ;
              
              return {
                name,
                initials,
                status: statusStr,
                xpEarned: xp,
                accountType
              };
            });
            setFriends(friendsList);
            setStats({ totalReferred: refsData.length, rewardsEarned: totalXP, proCount: totalProElite, eliteCount: totalElite } as any);'''

content = re.sub(pattern, new_code, content, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
