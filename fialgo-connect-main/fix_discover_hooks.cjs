const fs = require('fs');

const path = 'src/pages/Discover.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Move finalMentors, finalChannels, finalTraders, finalPeople above DiscoverSkeleton and early return
// Let's capture the blocks we want to move:
const mentorsBlock = `    const finalMentors = useMemo(() => mentors.map(m => {
        const name = m.full_name || m.username || "Active Mentor";
        const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
            id: m.id,
            name: name,
            title: m.trading_style || "Professional Mentor",
            avatar: m.avatar_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=random&color=fff\`,
            onlineCount: (charCodeSum * 13) % 400 + 10,
            memberCount: (charCodeSum * 47) % 2000 + 100,
            verified: m.is_verified || false,
            tags: [m.preferred_market, m.trading_style].filter(Boolean) as string[]
        };
    }), [mentors]);`;

const channelsBlock = `    const finalChannels = useMemo(() => channels.map(c => {
        const charCodeSum = c.name?.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0;
        
        const fallbackCovers = [
            'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
            'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f',
            'https://images.unsplash.com/photo-1605792657660-596af9009e82',
            'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74',
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            'https://images.unsplash.com/photo-1642543492481-44e81e3914a7'
        ];
        
        return {
            id: c.id,
            name: c.name,
            onlineCount: (charCodeSum * 7) % 300 + 15,
            memberCount: (c as any).memberCount || c.member_count || ((charCodeSum * 19) % 2000 + 500),
            description: c.description || "Official Tradifive communication channel.",
            icon: c.icon || "C",
            avatar_url: (c as any).avatar_url || c.avatar_url || \`https://i.pravatar.cc/150?img=\${charCodeSum % 70}\`,
            cover_url: (c as any).cover_url || c.cover_url || fallbackCovers[charCodeSum % fallbackCovers.length],
            locked: c.channel_type === "private" || c.channel_type === "premium"
        };
    }), [channels]);`;

const tradersBlock = `    const finalTraders = useMemo(() => traders
        .filter(t => {
            const name = (t.full_name || t.username || '').trim().toLowerCase();
            return name.length > 0 && !PLACEHOLDER_NAMES.includes(name);
        })
        .map((t, idx) => {
            const name = t.full_name || t.username || "Active Trader";
            const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return {
                id: t.id,
                name: name,
                avatar: t.avatar_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=random&color=fff\`,
                winRate: t.win_rate ? \`\${t.win_rate}%\` : "-",
                profit: t.roi_all_time ? \`\${t.roi_all_time >= 0 ? '+' : ''}\${t.roi_all_time}%\` : "-",
                onlineCount: (charCodeSum * 17) % 300 + 5,
                memberCount: (charCodeSum * 31) % 1500 + 50,
                rank: idx + 1
            };
        }), [traders]);`;

const peopleBlock = `    const finalPeople = useMemo(() => people
        .filter(p => {
            const name = (p.full_name || p.username || '').trim().toLowerCase();
            return name.length > 0 && !PLACEHOLDER_NAMES.includes(name);
        })
        .map((p) => {
            const name = p.full_name || p.username || "Active User";
            const charCodeSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            
            const fallbackCovers = [
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
                'https://images.unsplash.com/photo-1642543492481-44e81e3914a7',
                'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf',
                'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
                'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f',
                'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74'
            ];
            
            return {
                id: p.id,
                name: name,
                handle: p.username ? \`@\${p.username}\` : "@user",
                avatar: p.avatar_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=random&color=fff\`,
                cover_url: (p as any).cover_url || fallbackCovers[charCodeSum % fallbackCovers.length],
                winRate: p.win_rate ? \`\${p.win_rate}%\` : "-",
                profit: p.roi_all_time ? \`\${p.roi_all_time >= 0 ? '+' : ''}\${p.roi_all_time}%\` : "-",
                onlineCount: (charCodeSum * 19) % 200 + 1,
                memberCount: 0,
                mutual: (charCodeSum * 7) % 15
            };
        }), [people]);`;

// Remove them from their current position (after early return)
code = code.replace(mentorsBlock, '');
code = code.replace(channelsBlock, '');
code = code.replace(tradersBlock, '');
code = code.replace(peopleBlock, '');

// Insert them right after useDiscoverData hook call
const insertAfter = `    const { mentors, channels, traders, people, searchResults, loading, searching } = useDiscoverData(user?.id ?? "", searchQuery);`;

const newInsertContent = `${insertAfter}

${mentorsBlock}

${channelsBlock}

${tradersBlock}

${peopleBlock}`;

code = code.replace(insertAfter, newInsertContent);

// 2. Fix the second occurrence of noScroll={true}
code = code.replace(
  `<DashboardLayout breadcrumbs={[{ label: "Discover", path: "/discover" }]} noPadding={true} noScroll={true}>`,
  `<DashboardLayout breadcrumbs={[{ label: "Discover", path: "/discover" }]} noPadding={true} noScroll={false}>`
);

fs.writeFileSync(path, code);
console.log('Successfully refactored hooks and disabled double scroll container in Discover.tsx!');
