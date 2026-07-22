import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { X, Search, Crown, User } from 'lucide-react-native';
import { supabase } from '../app/utils/supabase';
import { getAvatarUrl } from '../app/utils/avatar';
import { useRouter } from 'expo-router';


const { height } = Dimensions.get('window');

interface FollowListModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_pro?: boolean;
  is_verified?: boolean;
}

export function FollowListModal({ isVisible, onClose, userId, type }: FollowListModalProps) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<ProfileData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isVisible || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        let profileIds: string[] = [];

        if (type === 'followers') {
          const { data } = await supabase
            .from('social_follows')
            .select('follower_id')
            .eq('following_id', userId);
          if (data) profileIds = data.map(d => d.follower_id);
        } else {
          const { data } = await supabase
            .from('social_follows')
            .select('following_id')
            .eq('follower_id', userId);
          if (data) profileIds = data.map(d => d.following_id);
        }

        let finalUsers: ProfileData[] = [];
        if (profileIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, is_pro, is_verified')
            .in('id', profileIds);
            
          if (profilesData) {
            finalUsers = profilesData;
          }
        }
        
        setUsers(finalUsers);
      } catch (err) {
        console.error("Error fetching follow list:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    setSearchQuery("");
  }, [isVisible, userId, type]);

  const getCleanedFirstName = (fullName: string) => {
    if (!fullName) return "";
    return fullName.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim().split(' ')[0] || "Trader";
  };

  const filteredUsers = users.filter(u => 
    (u.display_name && u.display_name.toLowerCase().includes(searchQuery.toLowerCase())) || 
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderItem = ({ item }: { item: ProfileData }) => {
    const avatarUrl = getAvatarUrl(item.avatar_url, undefined, item.username);
    
    return (
      <TouchableOpacity 
        style={styles.userRow}
        onPress={() => {
          onClose();
          router.push(`/user/${item.id}`);
        }}
      >
        <View style={styles.avatarContainer}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarInitial}>
              {getCleanedFirstName(item.display_name).charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {item.display_name || 'Trader'}
            </Text>
            {item.is_pro && (
              <View style={styles.creatorBadge}>
                <Crown size={10} color="#c084fc" />
                <Text style={styles.creatorText}>Pro</Text>
              </View>
            )}
          </View>
          <Text style={styles.username} numberOfLines={1}>
            @{item.username || 'user'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{type === 'followers' ? 'Followers' : 'Following'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color="#94a3b8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.emptyText}>Loading {type}...</Text>
            </View>
          ) : filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <User size={40} color="#334155" style={{ opacity: 0.5, marginBottom: 12 }} />
              <Text style={styles.emptyText}>
                {searchQuery ? "No matches found" : `No ${type} yet`}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.92,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    color: '#0f172a',
    fontFamily: 'Inter_700Bold',
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    height: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#64748b',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  displayName: {
    color: '#0f172a',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginRight: 6,
  },
  creatorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creatorText: {
    color: '#a855f7',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  username: {
    color: '#64748b',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  emptyText: {
    color: '#64748b',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  }
});
