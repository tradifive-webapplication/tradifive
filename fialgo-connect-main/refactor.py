import sys

file_path = "src/pages/Profile.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace loading state
content = content.replace(
    'const [loading, setLoading] = useState(() => {',
    'const [loadingProfile, setLoadingProfile] = useState(() => {'
)

# Replace other loading states
content = content.replace(
    'const [loadingProfile, setLoadingProfile] = useState(() => {\n    return localStorage.getItem(`prof_cache_data_${userIdSync}`) === null;\n  });',
    '''const [loadingProfile, setLoadingProfile] = useState(() => {
    return localStorage.getItem(`prof_cache_data_${userIdSync}`) === null;
  });
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [postsPage, setPostsPage] = useState(0);
  const [bookmarksPage, setBookmarksPage] = useState(0);'''
)

# Replace all if (loading)
content = content.replace('if (loading) {', 'if (loadingProfile) {')
content = content.replace('loading ? (', 'loadingProfile ? (')

# Find the massive fetchProfileAndData
start_str = """  useEffect(() => {
    fetchProfileAndData();
  }, []);"""

new_fetch_logic = """  useEffect(() => {
    fetchCoreProfile();
    fetchPostsData(0);
    fetchTradesData();
    fetchBookmarksData(0);
  }, []);

  const fetchCoreProfile = async () => {
    // Check local cache for immediate render
    const cacheProf = localStorage.getItem(`prof_cache_data_${userIdSync}`);
    if (cacheProf) {
      setProfile(JSON.parse(cacheProf));
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile({
          id: "guest",
          display_name: "Guest Trader",
          username: "guest",
          bio: "",
          avatar_url: "",
          banner_url: "/default-cover.png",
        });
        setLoadingProfile(false);
        return;
      }
      
      const [ profRes, followersRes, followingRes, sugRes ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('social_follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
          supabase.from('social_follows').select('following_id').eq('follower_id', user.id),
          supabase.from('profiles').select('id, display_name, username, avatar_url, win_rate, bio').neq('id', user.id).limit(10)
      ]);

      const profileData = profRes.data;
      if (profileData) {
        const emailUsername = (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : "trader");
        if (profileData.display_name === "Guest Trader" || !profileData.display_name || profileData.username === "guest_trader" || !profileData.username) {
          const meta = user.user_metadata || {};
          const resolvedDisplayName = meta.full_name || meta.name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || emailUsername;
          const resolvedUsername = profileData.username && profileData.username !== "guest_trader" ? profileData.username : emailUsername;
          const resolvedAvatarUrl = profileData.avatar_url || meta.avatar_url || meta.picture || defaultAvatar;

          const updatedProfile = {
            ...profileData,
            display_name: profileData.display_name && profileData.display_name !== "Guest Trader" ? profileData.display_name : resolvedDisplayName,
            username: resolvedUsername,
            bio: profileData.bio || "",
            avatar_url: resolvedAvatarUrl,
            banner_url: profileData.banner_url || "/default-cover.png",
          };
          supabase.from('profiles').update({
            display_name: updatedProfile.display_name,
            username: updatedProfile.username,
            avatar_url: updatedProfile.avatar_url,
            banner_url: updatedProfile.banner_url
          }).eq('id', user.id).then();
          setProfile(updatedProfile);
          localStorage.setItem(`prof_cache_data_${userIdSync}`, JSON.stringify(updatedProfile));
        } else {
          setProfile(profileData);
          localStorage.setItem(`prof_cache_data_${userIdSync}`, JSON.stringify(profileData));
        }
      } else {
        const meta = user.user_metadata || {};
        const emailUsername = (user.email ? user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : "trader");
        const resolvedDisplayName = meta.full_name || meta.name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || emailUsername;
        const fallbackProfile = {
          id: user.id,
          display_name: resolvedDisplayName,
          username: emailUsername,
          bio: "",
          avatar_url: meta.avatar_url || meta.picture || defaultAvatar,
          banner_url: "/default-cover.png"
        };
        setProfile(fallbackProfile);
        localStorage.setItem(`prof_cache_data_${userIdSync}`, JSON.stringify(fallbackProfile));
      }

      if (followersRes.count !== null) {
        setFollowerCount(followersRes.count);
        localStorage.setItem(`prof_cache_followers_${userIdSync}`, String(followersRes.count));
      }
      if (followingRes.data) {
        setFollowingCount(followingRes.data.length);
        localStorage.setItem(`prof_cache_following_${userIdSync}`, String(followingRes.data.length));
        const map = {};
        followingRes.data.forEach((f) => { map[f.following_id] = true; });
        setFollowedUsers(map);
      }

      if (sugRes.data) {
        const realTraders = sugRes.data.filter((p) => {
          const name = (p.display_name || '').trim().toLowerCase();
          return name.length > 0 && !PLACEHOLDER_NAMES.includes(name);
        }).slice(0, 5);
        setSuggestedTraders(realTraders);
      }

    } catch (err) {
      console.error("Error loading core profile data:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchPostsData = async (page = 0) => {
    if (page === 0) setLoadingPosts(true);
    const cachePosts = localStorage.getItem(`prof_cache_posts_${userIdSync}`);
    if (cachePosts && page === 0) {
      setPosts(JSON.parse(cachePosts));
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingPosts(false); return; }

      const [postsRes, likesRes] = await Promise.all([
        supabase.from('social_posts').select('*, profiles (id, first_name, last_name, avatar_url, username, display_name, bio, banner_url)')
          .eq('user_id', user.id).neq('post_type', 'story')
          .order('created_at', { ascending: false })
          .range(page * 15, (page + 1) * 15 - 1),
        supabase.from('social_post_likes').select('post_id').eq('user_id', user.id)
      ]);

      if (!postsRes.error && postsRes.data) {
        const localPosts = JSON.parse(localStorage.getItem('fialgo_local_posts') || '[]').filter(p => !p.user_id || p.user_id === user.id);
        
        setPosts(prev => {
           const newPosts = page === 0 ? postsRes.data : [...prev, ...postsRes.data];
           const dbIds = new Set(newPosts.map(f => String(f.id)));
           const filteredLocal = localPosts.filter(p => !dbIds.has(String(p.id)));
           const combined = [...filteredLocal, ...newPosts];
           combined.sort((a, b) => {
             const timeA = a && a.created_at ? new Date(a.created_at).getTime() : 0;
             const timeB = b && b.created_at ? new Date(b.created_at).getTime() : 0;
             return isNaN(timeB) || isNaN(timeA) ? 0 : timeB - timeA;
           });
           if(page === 0) {
              localStorage.setItem(`prof_cache_posts_${userIdSync}`, JSON.stringify(combined));
           }
           setOwnPostsCount(combined.length);
           return combined;
        });
      }

      if (likesRes.data) {
        const likedMap = JSON.parse(localStorage.getItem("fialgo_local_post_likes") || "{}");
        likesRes.data.forEach((l) => { likedMap[l.post_id] = true; });
        setLikedPosts(likedMap);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchTradesData = async () => {
    setLoadingTrades(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingTrades(false); return; }

      const [tradesRes, mt5Res] = await Promise.all([
        supabase.from('trades').select('id, profit, created_at, closed_at').eq('user_id', user.id),
        supabase.from('mt5_accounts').select('balance').eq('user_id', user.id).maybeSingle()
      ]);

      const tradesData = tradesRes.data;
      if (tradesData && tradesData.length > 0) {
        const total = tradesData.length;
        const wins = tradesData.filter((t) => Number(t.profit) > 0).length;
        const wr = total > 0 ? Math.round((wins / total) * 100) : 0;
        const pnlSum = tradesData.reduce((acc, t) => acc + Number(t.profit || 0), 0);

        setTotalTradesCount(total);
        setWinRateVal(`${wr}%`);

        let currentStreak = 0;
        const sortedTrades = [...tradesData].sort((a, b) => new Date(b.closed_at || b.created_at).getTime() - new Date(a.closed_at || a.created_at).getTime());
        for (const t of sortedTrades) {
          if (Number(t.profit) > 0) { currentStreak++; } else { break; }
        }
        setStreakVal(`${currentStreak} Day${currentStreak !== 1 ? 's' : ''}`);

        let best = 0;
        let runLen = 0;
        const chronoTrades = [...tradesData].sort((a, b) => new Date(a.closed_at || a.created_at).getTime() - new Date(b.closed_at || b.created_at).getTime());
        for (const t of chronoTrades) {
          if (Number(t.profit) > 0) { runLen++; if (runLen > best) best = runLen; } else { runLen = 0; }
        }
        setBestStreak(best);

        const today = new Date();
        const dots = [];
        const dailyPnl = {};
        for (const t of tradesData) {
          const d = new Date(t.closed_at || t.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          dailyPnl[key] = (dailyPnl[key] || 0) + Number(t.profit || 0);
        }
        for (let i = 14; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (dailyPnl[key] !== undefined) {
            dots.push({ date: key, status: dailyPnl[key] > 0 ? 'green' : 'red' });
          } else {
            dots.push({ date: key, status: 'gray' });
          }
        }
        setStreakDots(dots);

        const calMap = {};
        for (const [key, pnl] of Object.entries(dailyPnl)) {
          calMap[key] = pnl > 0 ? 'green' : 'red';
        }
        setCalendarDayMap(calMap);

        const balance = mt5Res.data?.balance || 10000;
        const roiPercent = balance > 0 ? (pnlSum / balance) * 100 : 0;
        const calculatedRoi = (pnlSum >= 0 ? "+" : "") + roiPercent.toFixed(2) + "%";
        setRoiVal(calculatedRoi);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTrades(false);
    }
  };

  const fetchBookmarksData = async (page = 0) => {
    if (page === 0) setLoadingBookmarks(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingBookmarks(false); return; }

      const bookmarksRes = await supabase.from('social_post_bookmarks')
        .select('post_id, social_posts(*, profiles(id, first_name, last_name, avatar_url, username, display_name, bio, banner_url))')
        .eq('user_id', user.id)
        .range(page * 15, (page + 1) * 15 - 1);

      if (bookmarksRes && !bookmarksRes.error && bookmarksRes.data) {
        const bookmarkMap = JSON.parse(localStorage.getItem("fialgo_local_bookmarks") || "{}");
        bookmarksRes.data.forEach((b) => { bookmarkMap[b.post_id] = true; });
        setBookmarkedPosts(bookmarkMap);
        const parsedSavedPosts = bookmarksRes.data.map((b) => b.social_posts).filter((p) => p !== null);
        setSavedPosts(prev => page === 0 ? parsedSavedPosts : [...prev, ...parsedSavedPosts]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookmarks(false);
    }
  };"""

end_str = "  const toggleFollowUser = async (targetUserId: string, targetName: string) => {"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_fetch_logic + "\n" + content[end_idx:]
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced fetchProfileAndData successfully")
else:
    print("Could not find start or end strings")
