import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronLeft, UserPlus, UserCheck } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from './utils/supabase';
import { getAvatarUrl } from './utils/avatar';
import { useStore } from './store';
import * as Haptics from 'expo-haptics';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUser = useStore(state => state.currentUser);
  const followingIds = useStore(state => state.followingIds);
  const followUser = useStore(state => state.followUser);
  const unfollowUser = useStore(state => state.unfollowUser);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, display_name, avatar_url, email')
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .neq('id', currentUser?.id || '')
          .limit(20);
        if (!error && data) {
          setResults(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleToggleFollow = async (userId: string, isFollowing: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isFollowing) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#333' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, height: 40, backgroundColor: '#1e293b', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            style={{ flex: 1, marginLeft: 8, color: '#fff', fontSize: 16 }}
            autoFocus
          />
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const isFollowing = followingIds.includes(item.id);
            return (
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                onPress={() => router.push(`/user/${item.id}`)}
              >
                <Image 
                  source={{ uri: getAvatarUrl(item.avatar_url, item.email, item.username) }} 
                  style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' }} 
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{item.display_name}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 14 }}>@{item.username}</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleToggleFollow(item.id, isFollowing)}
                  style={{
                    backgroundColor: isFollowing ? '#334155' : '#0095f6',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  {isFollowing ? <UserCheck size={16} color="#fff" /> : <UserPlus size={16} color="#fff" />}
                  <Text style={{ color: '#fff', marginLeft: 6, fontWeight: '600' }}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={() => (
            query.length >= 2 && !loading ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ color: '#94a3b8', fontSize: 16 }}>No users found.</Text>
              </View>
            ) : null
          )}
        />
      )}
    </View>
  );
}
