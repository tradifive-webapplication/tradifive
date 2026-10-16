const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// Find the exact broken section boundaries
// The missing functions need to go between line 517 (end of toggleFollowUser) and the isLocked line

// Find the end of toggleFollowUser
const toggleEnd = content.indexOf("    // without refreshing, but a full reload isn't needed usually.\n    }\n  };");
if (toggleEnd === -1) {
  console.error('Cannot find toggleFollowUser end!');
  // Try alternate version
  const alt = content.indexOf("// without refreshing");
  console.log('Alt search at:', alt);
  process.exit(1);
}

const insertAfter = toggleEnd + "    // without refreshing, but a full reload isn't needed usually.\n    }\n  };".length;

// Find the isLocked line to detect what comes after
const isLockedLine = content.indexOf('  const isLocked = privacySettings.is_private');
console.log('insertAfter position:', insertAfter);
console.log('isLocked position:', isLockedLine);

// What's between these two points?
const gap = content.substring(insertAfter, isLockedLine);
console.log('Gap content:', JSON.stringify(gap));

// The functions to insert
const functions = `

  const handleFollowStatClick = (type) => {
    if (!profile?.id || profile.id === 'not-found' || profile.id.startsWith('mock-')) return;
    const isOwnProfile = currentUserId === profile.id;
    const isPrivate = privacySettings.is_private;
    const isFollowing = followedUsers[profile.id];
    if (!isOwnProfile && isPrivate && !isFollowing) {
      toast.error(\`This account is private. Follow to see their \${type}.\`);
      return;
    }
    setFollowListState({ isOpen: true, type });
  };

  const navigate = useNavigate();

  const handleStartConversation = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { toast.error("Please log in to send messages."); return; }
      const targetId = profile?.id;
      if (!targetId || targetId === 'not-found' || targetId.startsWith('mock-')) {
        toast.error("This user hasn't set up their profile yet."); return;
      }
      if (authUser.id === targetId) { toast.error("You cannot message yourself."); return; }
      // Block if private and NOT a confirmed follower.
      // hasRequested=true = pending request only, NOT approved yet.
      const isPrivate = privacySettings.is_private;
      const isActuallyFollowing = followedUsers[targetId] === true;
      if (isPrivate && !isActuallyFollowing) {
        if (hasRequested) {
          toast.error("Your follow request is still pending. You can message them once they accept.");
        } else {
          toast.error("This account is private. Follow them first to send a message.");
        }
        return;
      }
      const user1_id = authUser.id < targetId ? authUser.id : targetId;
      const user2_id = authUser.id > targetId ? authUser.id : targetId;
      const { data: existing } = await supabase
        .from('dm_conversations').select('id')
        .eq('user1_id', user1_id).eq('user2_id', user2_id).maybeSingle();
      if (existing) { navigate(\`/inbox?conv=\${existing.id}\`); return; }
      const { data: existingReversed } = await supabase
        .from('dm_conversations').select('id')
        .eq('user1_id', user2_id).eq('user2_id', user1_id).maybeSingle();
      if (existingReversed) { navigate(\`/inbox?conv=\${existingReversed.id}\`); return; }
      const { data: created, error } = await supabase
        .from('dm_conversations')
        .insert({ user1_id, user2_id, last_message_at: new Date().toISOString() })
        .select().single();
      if (error) { console.error(error); navigate('/inbox'); return; }
      navigate(\`/inbox?conv=\${created.id}\`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      navigate('/inbox');
    }
  };

  const handleLikePost = async (postId) => {
    if (!currentUserId) { toast.error("Please log in to like posts."); return; }
    const isCurrentlyLiked = likedPosts[postId] || false;
    const nextLiked = !isCurrentlyLiked;
    setLikedPosts(prev => ({ ...prev, [postId]: nextLiked }));
    setLikesOffsets(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (nextLiked ? 1 : -1) }));
    try {
      if (nextLiked) {
        await supabase.from('social_post_likes').insert([{ post_id: postId, user_id: currentUserId }]);
      } else {
        await supabase.from('social_post_likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
      }
      const { data: postData } = await supabase.from('social_posts').select('like_count').eq('id', postId).single();
      const currentCount = postData?.like_count || 0;
      const newCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
      await supabase.from('social_posts').update({ like_count: newCount }).eq('id', postId);
    } catch (err) { console.error("Error toggling like:", err); }
  };

  const formatCount = (baseVal, offset) => {
    const total = Math.max(0, baseVal + offset);
    if (total >= 1000) return (total / 1000).toFixed(1).replace(/\\.0$/, '') + 'k';
    return total.toString();
  };

  const headerActions = (
    <div className="flex items-center gap-4">
    </div>
  );

`;

// Replace the gap between toggleEnd and isLocked with our functions
content = content.slice(0, insertAfter) + functions + content.slice(isLockedLine);

fs.writeFileSync('src/pages/UserProfilePublic.tsx', content);
console.log('Done! Lines:', content.split('\n').length);
