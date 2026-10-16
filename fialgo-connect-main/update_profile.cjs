const fs = require('fs');
let content = fs.readFileSync('src/pages/UserProfilePublic.tsx', 'utf8');

// 1. Add Clock to lucide-react imports if missing
if (!content.includes('Clock')) {
    content = content.replace(/import\s*\{\s*([^}]+)\}\s*from\s*['"]lucide-react['"]/, (match, imports) => {
        return `import { ${imports.trim()}, Clock } from 'lucide-react'`;
    });
}

// 2. Add hasRequested state
const stateInsertPos = content.indexOf('const [followedUsers, setFollowedUsers] = useState');
content = content.slice(0, stateInsertPos) + 'const [hasRequested, setHasRequested] = useState<boolean>(false);\n  ' + content.slice(stateInsertPos);

// 3. Add hasRequested check to data fetching
const followFetchTarget = `.eq('follower_id', currentUser.id)
            .eq('following_id', profileId)
            .maybeSingle();`;

const followFetchReplacement = followFetchTarget + `

          // Check if follow request exists
          const { data: requestRecord } = await supabase
            .from('social_follow_requests')
            .select('*')
            .eq('requester_id', currentUser.id)
            .eq('target_id', profileId)
            .maybeSingle();
          if (requestRecord) {
             setHasRequested(true);
          } else {
             setHasRequested(false);
          }`;

content = content.replace(followFetchTarget, followFetchReplacement);

// 4. Update toggleFollowUser
const toggleTarget = `    const isFollowing = followedUsers[targetUserId] || false;
    
    // Optimistic UI updates
    setFollowedUsers(prev => ({ ...prev, [targetUserId]: !isFollowing }));
    setFollowerCount(prev => prev + (isFollowing ? -1 : 1));`;

const toggleReplacement = `    const isFollowing = followedUsers[targetUserId] || false;
    const isPrivate = privacySettings.is_private;

    if (isPrivate && !isFollowing) {
        try {
            if (hasRequested) {
                const { error } = await supabase.from('social_follow_requests').delete().eq('requester_id', currentUser.id).eq('target_id', targetUserId);
                if (error) throw error;
                setHasRequested(false);
                toast.info(\`Cancelled follow request to \${targetName}\`);
            } else {
                const { error } = await supabase.from('social_follow_requests').insert([{ requester_id: currentUser.id, target_id: targetUserId }]);
                if (error) throw error;
                setHasRequested(true);
                toast.success(\`Follow request sent to \${targetName}\`);
            }
        } catch (err: any) {
            console.error("Error toggling follow request:", err);
            toast.error("Failed to update follow request.");
        }
        return;
    }
    
    // Optimistic UI updates
    setFollowedUsers(prev => ({ ...prev, [targetUserId]: !isFollowing }));
    setFollowerCount(prev => prev + (isFollowing ? -1 : 1));`;

content = content.replace(toggleTarget, toggleReplacement);

// 5. Update Follow button render
const buttonRenderTarget = `{followedUsers[profile?.id] ? <><UserCheck size={13} /> Following</> : <><UserPlus size={13} /> Follow</>}`;
const buttonRenderReplacement = `{followedUsers[profile?.id] ? <><UserCheck size={13} /> Following</> : (hasRequested ? <><Clock size={13} /> Requested</> : <><UserPlus size={13} /> Follow</>)}`;
content = content.replace(buttonRenderTarget, buttonRenderReplacement);

fs.writeFileSync('src/pages/UserProfilePublic.tsx', content);
console.log('Successfully updated UserProfilePublic.tsx');
