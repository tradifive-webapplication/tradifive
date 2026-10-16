import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find handleLikePost
    # It looks like this:
    #         try {
    #             if (nextLiked) {
    #                 await supabase.from('social_post_likes').insert([{ post_id: postId, user_id: user.id }]);
    #             } else {
    #                 await supabase.from('social_post_likes').delete().match({ post_id: postId, user_id: user.id });
    #             }
    #         } catch (error) {

    # Or in UserProfilePublic.tsx:
    #         try {
    #             if (nextLiked) {
    #                 await supabase.from('social_post_likes').insert([{ post_id: postId, user_id: currentUserId }]);
    #             } else {
    #                 await supabase.from('social_post_likes').delete().eq('post_id', postId).eq('user_id', currentUserId);
    #             }
    #         } catch (err) {

    # We can just replace the block inside the try catch.
    # We will search for the entire try block.
    
    # We'll use a regex that matches `try { ... } catch` for handleLikePost
    # A safer way is to find `await supabase.from('social_post_likes').insert` and append the manual count update after the if-else block.
    
    # Let's split by lines and find the block
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if "await supabase.from('social_post_likes').delete()" in line:
            # We are inside the else block. The next line should be }
            # Wait, let's find the closing brace of the if-else block.
            # Usually it's `      }` or `            }`
            j = i + 1
            while j < len(lines):
                if '}' in lines[j] and 'catch' not in lines[j]:
                    # This is the closing brace of the else block.
                    # We inject our code right after this line.
                    indent = lines[j][:len(lines[j]) - len(lines[j].lstrip())]
                    injection = [
                        indent + "// Fallback for missing SQL triggers",
                        indent + "const { data: postData } = await supabase.from('social_posts').select('like_count').eq('id', postId).single();",
                        indent + "const currentCount = postData?.like_count || 0;",
                        indent + "const newCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);",
                        indent + "await supabase.from('social_posts').update({ like_count: newCount }).eq('id', postId);"
                    ]
                    lines = lines[:j+1] + injection + lines[j+1:]
                    break
                j += 1
            break

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    print(f'Patched {filepath}')

patch_file('src/pages/Home.tsx')
patch_file('src/pages/UserProfilePublic.tsx')
