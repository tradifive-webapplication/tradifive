const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '..', 'mobile-app', 'app', 'user', '[id].tsx');
let content = fs.readFileSync(p, 'utf8');

content = content.replace("import { useRouter } from 'expo-router';", "import { useRouter, useLocalSearchParams } from 'expo-router';\nimport { UserPlus, UserCheck } from 'lucide-react-native';\nimport { supabase } from '../../utils/supabase';");

content = content.replace('export default function ProfileScreen() {', `export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [viewedUser, setViewedUser] = useState(null);
  const [viewedFollowers, setViewedFollowers] = useState(0);
  const [viewedFollowing, setViewedFollowing] = useState(0);
  const followingIds = useStore(state => state.followingIds);
  const followUser = useStore(state => state.followUser);
  const unfollowUser = useStore(state => state.unfollowUser);
  const isBypassed = useStore(state => state.isBypassed);

  useEffect(() => {
    if (!id || isBypassed) return;
    supabase.from('profiles').select('*').eq('id', id).single().then(({data}) => {
      if (data) setViewedUser(data);
    });
    supabase.from('social_follows').select('*', { count: 'exact', head: true }).eq('following_id', id).then(({count}) => {
      setViewedFollowers(count || 0);
    });
    supabase.from('social_follows').select('*', { count: 'exact', head: true }).eq('follower_id', id).then(({count}) => {
      setViewedFollowing(count || 0);
    });
    const sub = supabase.channel('user_profile_follows_' + id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_follows' }, (payload) => {
        if (payload.new?.following_id === id && payload.eventType === 'INSERT') setViewedFollowers(prev => prev + 1);
        if (payload.old?.following_id === id && payload.eventType === 'DELETE') setViewedFollowers(prev => Math.max(0, prev - 1));
        if (payload.new?.follower_id === id && payload.eventType === 'INSERT') setViewedFollowing(prev => prev + 1);
        if (payload.old?.follower_id === id && payload.eventType === 'DELETE') setViewedFollowing(prev => Math.max(0, prev - 1));
      }).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [id, isBypassed]);

  const isFollowing = typeof id === 'string' && followingIds.includes(id);
  const handleFollowToggle = async () => {
    if (typeof id !== 'string') return;
    if (isFollowing) {
      await unfollowUser(id);
    } else {
      await followUser(id);
    }
  };`);

content = content.replace(/currentUser\?\.username/g, 'viewedUser?.username');
content = content.replace(/currentUser\?\.display_name/g, 'viewedUser?.display_name');
content = content.replace(/currentUser\?\.bio/g, 'viewedUser?.bio');
content = content.replace(/currentUser\?\.avatar_url/g, 'viewedUser?.avatar_url');
content = content.replace(/currentUser\?\.banner_url/g, 'viewedUser?.banner_url');
content = content.replace(/followerCount/g, 'viewedFollowers');
content = content.replace(/followingCount/g, 'viewedFollowing');

// Find the section for Edit / Add Banner and replace it
content = content.replace(/{viewedUser\?\.bio \? \([\s\S]*?\) : \([\s\S]*?<Plus size={14} color="#0095f6" \/>[\s\S]*?<\/TouchableOpacity>[\s\S]*?\)}/, `{viewedUser?.bio ? (
              <Text style={styles.profileBio}>
                {viewedUser.bio}
              </Text>
            ) : null}
            {currentUser?.id !== id && (
              <TouchableOpacity 
                onPress={handleFollowToggle}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 12,
                  alignSelf: 'flex-start',
                  backgroundColor: isFollowing ? '#334155' : '#0095f6',
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                {isFollowing ? <UserCheck size={16} color="#fff" /> : <UserPlus size={16} color="#fff" />}
                <Text style={{
                  fontSize: 14,
                  color: '#fff',
                  fontFamily: 'Inter_600SemiBold',
                  marginLeft: 6
                }}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}`);

fs.writeFileSync(p, content);
console.log('Successfully refactored user/[id].tsx');
