import re

with open('src/pages/UserProfilePublic.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace import if needed
if 'import FeedCard' not in content:
    content = content.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport FeedCard from "@/components/FeedCard";')

lines = content.split('\n')
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'posts.map((post: any) => {' in line:
        start_idx = i
        break

for i in range(start_idx + 1, len(lines)):
    if lines[i].strip() == '})':
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_map = """                  posts.map((post: any) => {
                    const isLiked = likedPosts[post.id] || false;
                    return (
                        <FeedCard 
                            key={post.id}
                            feed={post}
                            currentUserId={currentUserId || ""}
                            followedUsers={followedUsers}
                            onToggleFollow={toggleFollowUser}
                            isLiked={isLiked}
                            likes={Math.max(0, (post.like_count ?? post.likes_count ?? 0) + (likesOffsets[post.id] || 0))}
                            onLike={() => handleLikePost(post.id)}
                            onVote={async (postId, updatedMediaUrl) => {
                                try {
                                    await supabase.from('social_posts').update({ media_url: updatedMediaUrl }).eq('id', postId);
                                    setPosts(prev => prev.map(p => p.id === postId ? { ...p, media_url: updatedMediaUrl } : p));
                                } catch (error) {
                                    console.error("Error saving vote:", error);
                                }
                            }}
                        />
                    );
"""
    lines = lines[:start_idx] + new_map.split('\n') + lines[end_idx:]
    with open('src/pages/UserProfilePublic.tsx', 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print('Successfully updated UserProfilePublic.tsx inline.')
else:
    print('Failed to find boundaries')
