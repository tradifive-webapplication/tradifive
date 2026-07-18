const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

const handleStartConversationStart = content.indexOf('const handleStartConversation = async () => {');
const endFuncStr = 'navigate(`/messages?convo=${existing.id}`);';
const handleStartConversationEnd = content.indexOf(endFuncStr, handleStartConversationStart) + endFuncStr.length + 10; // includes the close brace

const newFunc = `const handleStartConversation = async () => {
    try {
      // Always fetch current auth user at click time (don't rely on state)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        toast.error("Please log in to send messages.");
        return;
      }

      const targetId = profile?.id;
      if (!targetId || targetId === 'not-found' || targetId.startsWith('mock-')) {
        toast.error("This user hasn't set up their profile yet.");
        return;
      }

      if (authUser.id === targetId) {
        toast.error("You cannot message yourself.");
        return;
      }

      const isLockedAccount = privacySettings.is_private && !followedUsers[targetId] && authUser.id !== targetId;
      if (isLockedAccount) {
        toast.error("You must follow this private account to send them a message.");
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
        navigate(\`/messages?convo=\${existing.id}\`);
      } else {
        // Create new conversation
        const { data: newConvo, error } = await supabase
          .from('dm_conversations')
          .insert([{ user1_id, user2_id }])
          .select('id')
          .single();
          
        if (error) throw error;
        navigate(\`/messages?convo=\${newConvo.id}\`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to start conversation.");
    }
  };`;

content = content.slice(0, handleStartConversationStart) + newFunc + content.slice(content.indexOf('}', handleStartConversationEnd) + 1);

fs.writeFileSync('src/pages/UserProfilePublic.tsx', content);
console.log('Fixed handleStartConversation');
