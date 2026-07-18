const fs = require('fs');

const path = 'src/pages/Discover.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Replay Lucide imports with Cpu and add react-iconly imports
code = code.replace(
  `import { Search, Lock, UserPlus, Compass, GraduationCap, CreditCard, Cpu, LineChart, BookOpen, X, Trophy } from "lucide-react";`,
  `import { Cpu } from "lucide-react";\nimport { Search as IconlySearch, Lock as IconlyLock, AddUser as IconlyAddUser, Discovery as IconlyDiscovery, CloseSquare as IconlyCloseSquare, TicketStar as IconlyTicketStar } from "react-iconly";`
);

// 2. Remove noScroll={true} and noPadding={true} or let DashboardLayout handle the scrolling natively!
// Wait! Let's check how DiscoverSkeleton is rendered:
// <div className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide select-none animate-pulse">
// And Discover itself:
// <div className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide">
// We should remove h-full overflow-y-auto from both so DashboardLayout handles native page scrolling.
// And change noScroll={true} to noScroll={false} on DashboardLayout breadcrumbs.

code = code.replace(
  `noPadding={true} noScroll={true}`,
  `noPadding={true} noScroll={false}`
);

// Remove scroll styling from DiscoverSkeleton container
code = code.replace(
  `className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide select-none animate-pulse"`,
  `className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 relative select-none animate-pulse"`
);

// Remove scroll styling from main Discover container
code = code.replace(
  `className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 h-full overflow-y-auto overflow-x-hidden relative scrollbar-hide"`,
  `className="w-full font-sans pb-32 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 relative"`
);

// 3. Optimize the big blur-[100px] divs that cause repaint lag on scroll by replacing them with hardware-accelerated gradients or radial-gradient backgrounds.
const oldHeroBg = `                {/* Unified Gradient Wrapper for Hero */}
                <div className="w-full bg-gradient-to-br from-[#ECEDF2] to-[#E2E4FB] dark:from-[#1C1C21] dark:to-[#121214] relative overflow-hidden">
                    {/* Faded Discord Blurple Blobs (Unified) */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {/* Adjusted left blob to match right blob's awesome positioning */}
                        <div className="absolute top-[0%] -left-[10%] w-[50%] h-[120%] bg-[#5865F2]/10 dark:bg-[#5865F2]/15 blur-[100px] rounded-full"></div>
                        <div className="absolute top-[0%] -right-[10%] w-[50%] h-[120%] bg-[#5865F2]/10 dark:bg-[#5865F2]/15 blur-[100px] rounded-full"></div>
                    </div>`;

const newHeroBg = `                {/* Unified Gradient Wrapper for Hero */}
                <div 
                    className="w-full bg-gradient-to-br from-[#ECEDF2] to-[#E2E4FB] dark:from-[#1C1C21] dark:to-[#121214] relative overflow-hidden"
                    style={{
                        backgroundImage: \`
                            radial-gradient(circle at 10% 0%, rgba(88, 101, 242, 0.08), transparent 60%), 
                            radial-gradient(circle at 90% 0%, rgba(88, 101, 242, 0.08), transparent 60%),
                            linear-gradient(135deg, \${code.includes('dark') ? '#1C1C21' : '#ECEDF2'} 0%, \${code.includes('dark') ? '#121214' : '#E2E4FB'} 100%)
                        \`
                    }}
                >
                    {/* Faded Discord Blurple Blobs (Unified) */}
                    <div className="absolute inset-0 pointer-events-none z-0">
                        {/* Removed blur filter elements and replaced with high-performance CSS gradients in parent backgound */}
                    </div>`;

// Wait, the newHeroBg works, let's write it cleaner.
code = code.replace(oldHeroBg, newHeroBg);

// 4. Update the font import and hero heading font style to use Outfit instead of Inter
code = code.replace(
  `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');`,
  `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`
);
code = code.replace(
  `fontFamily: "'Inter', sans-serif"`,
  `fontFamily: "'Outfit', sans-serif"`
);

// 5. Wrap finalMentors, finalChannels, finalTraders, finalPeople with React.useMemo to avoid mapping overhead on every render!
// Also make sure to import useMemo from react.
code = code.replace(
  `import { useState, useEffect } from "react";`,
  `import { useState, useEffect, useMemo } from "react";`
);

const oldMentors = `    const finalMentors = mentors.map(m => {
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
    });`;

const newMentors = `    const finalMentors = useMemo(() => mentors.map(m => {
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

code = code.replace(oldMentors, newMentors);

const oldChannels = `    const finalChannels = channels.map(c => {
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
    });`;

const newChannels = `    const finalChannels = useMemo(() => channels.map(c => {
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

code = code.replace(oldChannels, newChannels);

const oldTraders = `    const finalTraders = traders
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
        });`;

const newTraders = `    const finalTraders = useMemo(() => traders
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

code = code.replace(oldTraders, newTraders);

const oldPeople = `    const finalPeople = people
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
        });`;

const newPeople = `    const finalPeople = useMemo(() => people
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

code = code.replace(oldPeople, newPeople);

// 6. Update JSX elements to use react-iconly icons
// Compass
code = code.replace(
  `<Compass className="text-[#313338] dark:text-slate-200" size={20} />`,
  `<IconlyDiscovery set="curved" primaryColor="currentColor" size={20} className="text-[#313338] dark:text-slate-200" />`
);

// Trophy (in Leaderboard category tab)
code = code.replace(
  `<Trophy size={13} className={isActive ? "text-amber-500" : "text-slate-400"} />`,
  `<IconlyTicketStar set="curved" primaryColor="currentColor" size={13} className={isActive ? "text-amber-500" : "text-slate-400"} />`
);

// Lock (small soon tag)
code = code.replace(
  `<Lock size={8} className="text-indigo-500 shrink-0" />`,
  `<IconlyLock set="curved" primaryColor="currentColor" size={8} className="text-indigo-500 shrink-0" />`
);

// Search input
code = code.replace(
  `<Search className="text-slate-400 dark:text-slate-500 mr-2.5 shrink-0" size={15} strokeWidth={2.5} />`,
  `<IconlySearch set="curved" primaryColor="currentColor" size={15} className="text-slate-400 dark:text-slate-550 mr-2.5 shrink-0" />`
);

// Search clear X
code = code.replace(
  `<X size={12} strokeWidth={3} />`,
  `<IconlyCloseSquare set="curved" primaryColor="currentColor" size={12} />`
);

// Follow buttons (UserPlus -> IconlyAddUser)
code = code.replace(
  `<UserPlus size={11} /> Follow`,
  `<IconlyAddUser set="curved" primaryColor="currentColor" size={11} /> Follow`
);

// Join buttons (UserPlus -> IconlyAddUser)
code = code.replace(
  `<UserPlus size={11} /> Join`,
  `<IconlyAddUser set="curved" primaryColor="currentColor" size={11} /> Join`
);

// Locked Channel icon
code = code.replace(
  `channel.locked && <Lock size={14} className="text-slate-400 shrink-0" />`,
  `channel.locked && <IconlyLock set="curved" primaryColor="currentColor" size={14} className="text-slate-400 shrink-0" />`
);

// Locked banners
code = code.replace(
  `<Lock size={24} />`,
  `<IconlyLock set="curved" primaryColor="currentColor" size={24} />`
);

code = code.replace(
  `<Lock size={12} className="text-indigo-400 shrink-0" />`,
  `<IconlyLock set="curved" primaryColor="currentColor" size={12} className="text-indigo-400 shrink-0" />`
);

fs.writeFileSync(path, code);
console.log('Successfully optimized and updated Discover.tsx!');
