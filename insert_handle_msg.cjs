const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// Find where handleStartConversation should go - right after setFollowListState block
// and before handleLikePost
const insertAnchor = '  const handleLikePost = async (postId: string) => {';
const insertPos = content.indexOf(insertAnchor);
if (insertPos === -1) {
  console.error('Could not find handleLikePost anchor!');
  process.exit(1);
}

// Also check: is navigate defined already?
if (!content.includes('const navigate = useNavigate();')) {
  console.log('navigate not defined - need to add it');
  // Add navigate before handleLikePost
  const navCode = `  const navigate = useNavigate();\n\n`;
  content = content.slice(0, insertPos) + navCode + content.slice(insertPos);
}

// Now insert handleStartConversation right before handleLikePost
const handleStartConversation = `  const handleStartConversation = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast.error("Please log in to send messages.");
        return;
      }

      const targetId = profile?.id;

      // Block if profile not valid
      if (!targetId || targetId === 'not-found' || targetId.startsWith('mock-')) {
        toast.error("This user hasn't set up their profile yet.");
        return;
      }

      // Block messaging yourself
      if (authUser.id === targetId) {
        toast.error("You cannot message yourself.");
        return;
      }

      // Block if private account and NOT a confirmed follower.
      // hasRequested=true means a pending request was sent but NOT yet approved — still blocked.
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

      // Ensure consistent ordering for the unique constraint
      const user1_id = authUser.id < targetId ? authUser.id : targetId;
      const user2_id = authUser.id > targetId ? authUser.id : targetId;

      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('dm_conversations')
        .select('id')
        .eq('user1_id', user1_id)
        .eq('user2_id', user2_id)
        .maybeSingle();

      if (existing) {
        navigate(\`/inbox?conv=\${existing.id}\`);
        return;
      }

      // Also check with reversed order
      const { data: existingReversed } = await supabase
        .from('dm_conversations')
        .select('id')
        .eq('user1_id', user2_id)
        .eq('user2_id', user1_id)
        .maybeSingle();

      if (existingReversed) {
        navigate(\`/inbox?conv=\${existingReversed.id}\`);
        return;
      }

      // Create new conversation
      const { data: created, error } = await supabase
        .from('dm_conversations')
        .insert({
          user1_id,
          user2_id,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('DM conversation insert error:', error);
        toast.info("Opening inbox...");
        navigate('/inbox');
        return;
      }

      navigate(\`/inbox?conv=\${created.id}\`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      toast.info("Opening inbox...");
      navigate('/inbox');
    }
  };\n\n`;

// Only insert if not already there
if (!content.includes('const handleStartConversation')) {
  const likePos = content.indexOf('  const handleLikePost = async (postId: string) => {');
  content = content.slice(0, likePos) + handleStartConversation + content.slice(likePos);
  console.log('Inserted handleStartConversation');
} else {
  console.log('handleStartConversation already exists, skipping insert');
}

fs.writeFileSync('src/pages/UserProfilePublic.tsx', content);
console.log('Done! Lines:', content.split('\n').length);
