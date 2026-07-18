// Set this to false to disable all mock data instantly!
export const ENABLE_MOCK_DATA = true;

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Diya", "Isha", "Kavya", "Neha", "Priya", "Riya", "Sneha", "Ananya", "Aadya", "Kiara", "Rahul", "Vikram", "Siddharth", "Rohan", "Karan", "Pooja", "Anjali", "Meera", "Sanya", "Tara"];
const lastNames = ["Sharma", "Verma", "Patel", "Singh", "Kumar", "Gupta", "Desai", "Mehta", "Bose", "Das", "Reddy", "Nair", "Iyer", "Rao", "Joshi", "Kapoor", "Chopra", "Malhotra", "Bhatia", "Ahluwalia"];
const cities = ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur"];

const images = [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80',
    'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    null, null, null, null, null, null
];

const postTemplates = [
    "NIFTY50 setting up for a massive breakout above {level}! Volumes are looking solid on the 15m timeframe. Who else is taking the CE trade today? 🚀📉 #Nifty #OptionTrading",
    "BankNifty is consolidating beautifully at the demand zone. Stop loss at {level}, aiming for 52,000 before expiry. Keep your risk managed! 🎯📊",
    "Reliance just broke its multi-month resistance! If it sustains above 3000, we could see an easy 10% move from here. Accumulating for the long term. 📈💰 #Reliance",
    "Just closed my HDFC Bank puts for a quick 40% ROI in the morning session! Scalping is highly rewarding if you follow price action rigidly. Who else booked profits today?",
    "Trading psychology is 90% of the game. If you can't hold your winners, your setup doesn't matter. Focus on your mind! 🧠💡",
    "TCS earnings came out surprisingly positive, seeing a huge gap up tomorrow. Anyone holding calls overnight? 🌙📞",
    "FIIs bought 2000 Cr in cash market today. Market breadth is completely favoring the bulls. Buy on dips strategy remains intact! 🐂💸",
    "Lost 2% today but followed all my rules. A disciplined loss is better than a lucky win. See you all tomorrow! 📘✔️",
    "Gold is breaking out of the channel, safe haven demand is back. Are you rotating into commodities? 🥇🏦",
    "Is anyone tracking Adani Ports? Massive volume spike in the last 15 minutes of trading. Something big is brewing! 🚢👀",
    "Just hit my 15th consecutive profitable day! Consistency > Home runs. Let's go! 🔥💪",
    "What's your favorite indicator for intraday? I strictly rely on VWAP and Volume Profile. Keep it simple! 📏📉",
    "Bear trap on the hourly chart perfectly executed. Smart money just absorbed all the retail selling. Prepare for a short squeeze! 🐻🪤",
    "Option selling is like picking up pennies in front of a steamroller unless you hedge perfectly. Don't sell naked! 🛡️⚠️",
    "Any swing traders here? ITC is looking prime for a 5% move this week. Dividend yield is a bonus! 🚬💸"
];

function randomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateProfiles(count: number) {
    const profiles = [];
    for (let i = 0; i < count; i++) {
        const first = firstNames[i % firstNames.length];
        const last = randomItem(lastNames);
        // Mix of avatars: 70% have dicebear avatars, 30% have no avatar (null)
        const hasAvatar = Math.random() > 0.3;
        const isMale = i % 2 === 0;
        // Use randomuser.me for real human portraits (0 to 99 are valid)
        const avatarUrl = `https://randomuser.me/api/portraits/${isMale ? 'men' : 'women'}/${i % 100}.jpg`;
        
        profiles.push({
            id: `mock-p-${i}`,
            full_name: `${first} ${last}`,
            username: `${first.toLowerCase()}_${last.toLowerCase()}${Math.floor(Math.random() * 100)}`,
            avatar_url: hasAvatar ? avatarUrl : null,
            location: `${randomItem(cities)}, India`,
            streak_days: Math.floor(Math.random() * 30),
            win_rate: Math.floor(Math.random() * 40) + 40, // 40-80%
            total_trades: Math.floor(Math.random() * 500) + 50
        });
    }
    return profiles;
}

export const mockProfiles = generateProfiles(30);

export const mockFeeds = mockProfiles.map((profile, i) => {
    const template = postTemplates[i % postTemplates.length];
    const content = template.replace('{level}', `${Math.floor(Math.random() * 25000 + 1000)}`);
    return {
        id: `demo-feed-${i}`,
        user_id: profile.id,
        content: content,
        media_url: randomItem(images),
        post_type: randomItem(images) ? 'image' : 'text',
        likes: Math.floor(Math.random() * 1000) + 10,
        has_liked: Math.random() > 0.4, // Randomly set likes so the heart appears red on some
        comments_count: Math.floor(Math.random() * 100),
        created_at: new Date(Date.now() - 1000 * 60 * (i * 25 + 5)).toISOString(),
        profiles: profile
    };
});

export const mockStories = mockProfiles.slice(0, 10).map((profile, i) => ({
    id: `demo-story-${i}`,
    user_id: profile.id,
    content: `Live Trade Update! #${i}`,
    media_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    post_type: 'story',
    created_at: new Date(Date.now() - 1000 * 60 * (i * 10 + 2)).toISOString(),
    profiles: profile
}));

export const mockConversations = mockProfiles.map((profile, i) => ({
    id: `demo-conv-${i}`,
    name: profile.full_name,
    designation: 'Pro Trader',
    content: `You received a message from ${profile.full_name} regarding your trade logic.`,
    avatar: profile.avatar_url || '/default-avatar.svg',
    lastMessage: 'Sure, I will check the charts and get back to you! 📈',
    time: i === 0 ? 'Just now' : `${i * 5}m ago`,
    unread: i < 5 ? Math.floor(Math.random() * 3) + 1 : 0,
    department: 'Trading',
    status: i % 3 === 0 ? 'Online' : 'Offline',
    roleTag: 'TRADER',
    verified: i % 2 === 0,
    email: `${profile.username}@example.com`,
    timezone: 'IST',
    partnerId: `demo-partner-${i}`
}));

export const mockNotifications = mockProfiles.map((profile, i) => ({
    id: `demo-notif-${i}`,
    type: i % 2 === 0 ? 'FOLLOW' : 'LIKE',
    title: i % 2 === 0 ? 'New Follower' : 'Post Liked',
    message: i % 2 === 0 ? `${profile.full_name} started following you.` : `${profile.full_name} liked your recent post.`,
    is_read: i > 4,
    created_at: new Date(Date.now() - 1000 * 60 * (i * 15 + 5)).toISOString(),
    profiles: profile
}));

export const mockChannels = [
    { id: 'c1', name: 'Nifty Options Elite', description: 'Daily index option strategies and analysis.', avatar_url: 'https://randomuser.me/api/portraits/men/90.jpg', memberCount: 14500, is_premium: true, price: 999 },
    { id: 'c2', name: 'Swing Trading Ideas', description: 'Curated swing setups for Indian equities.', avatar_url: 'https://randomuser.me/api/portraits/women/89.jpg', memberCount: 8200, is_premium: false, price: 0 },
    { id: 'c3', name: 'Forex Scalpers', description: 'High probability scalping setups.', avatar_url: 'https://randomuser.me/api/portraits/men/88.jpg', memberCount: 3400, is_premium: true, price: 1499 },
    { id: 'c4', name: 'Crypto Alpha', description: 'On-chain analysis and low cap gems.', avatar_url: 'https://randomuser.me/api/portraits/women/87.jpg', memberCount: 22000, is_premium: false, price: 0 },
    { id: 'c5', name: 'Price Action Masters', description: 'Pure price action reading techniques.', avatar_url: 'https://randomuser.me/api/portraits/men/86.jpg', memberCount: 12000, is_premium: true, price: 1999 },
    { id: 'c6', name: 'BankNifty Warriors', description: 'Exclusive BankNifty setups.', avatar_url: 'https://randomuser.me/api/portraits/men/85.jpg', memberCount: 45000, is_premium: false, price: 0 },
    { id: 'c7', name: 'Commodity Kings', description: 'Gold, Silver, and Crude Oil daily levels.', avatar_url: 'https://randomuser.me/api/portraits/men/84.jpg', memberCount: 5600, is_premium: true, price: 499 },
    { id: 'c8', name: 'Invest & Hold', description: 'Long-term value investing discussions.', avatar_url: 'https://randomuser.me/api/portraits/women/83.jpg', memberCount: 18000, is_premium: false, price: 0 },
    { id: 'c9', name: 'Algorithmic Wizards', description: 'Python, Pine Script, and automated systems.', avatar_url: 'https://randomuser.me/api/portraits/men/82.jpg', memberCount: 4100, is_premium: true, price: 2999 },
    { id: 'c10', name: 'Options Selling Squad', description: 'Theta decay strategies and hedged portfolios.', avatar_url: 'https://randomuser.me/api/portraits/women/81.jpg', memberCount: 9200, is_premium: true, price: 1499 },
    { id: 'c11', name: 'Beginner Traders Q&A', description: 'Safe space for new traders to ask questions.', avatar_url: 'https://randomuser.me/api/portraits/men/80.jpg', memberCount: 32000, is_premium: false, price: 0 },
    { id: 'c12', name: 'Dividend Hunters', description: 'Building passive income through stocks.', avatar_url: 'https://randomuser.me/api/portraits/women/79.jpg', memberCount: 11000, is_premium: false, price: 0 }
];

export const mockMarketplaceProducts = [
    { id: 'p1', title: 'Ultimate Price Action Guide', description: 'Master price action with 50+ real chart examples.', type: 'course', price: 1999, originalPrice: 3999, rating: 4.8, reviews: 340, thumbnail_url: 'https://randomuser.me/api/portraits/women/70.jpg', creator: { full_name: 'Aisha Khan', username: 'aisha_k', display_name: 'Aisha' } },
    { id: 'p2', title: 'Nifty Intraday Masterclass', description: 'Learn my proprietary setup for Nifty 50.', type: 'webinar', price: 999, originalPrice: 1999, rating: 4.9, reviews: 120, thumbnail_url: 'https://randomuser.me/api/portraits/men/71.jpg', creator: { full_name: 'Rahul Sharma', username: 'rahul_trades', display_name: 'Rahul S.' } },
    { id: 'p3', title: 'Algorithmic Trading Starter Kit', description: 'Ready-to-use Python scripts for Zerodha API.', type: 'code', price: 4999, originalPrice: 9999, rating: 4.7, reviews: 85, thumbnail_url: 'https://randomuser.me/api/portraits/men/72.jpg', creator: { full_name: 'Vikram Singh', username: 'vikram_algo', display_name: 'Vikram Algo' } },
    { id: 'p4', title: 'Trading Psychology 101', description: 'Overcome fear and greed with practical exercises.', type: 'ebook', price: 499, originalPrice: 999, rating: 4.6, reviews: 450, thumbnail_url: 'https://randomuser.me/api/portraits/women/73.jpg', creator: { full_name: 'Dr. Priya Desai', username: 'priya_mind', display_name: 'Dr. Priya' } }
];
