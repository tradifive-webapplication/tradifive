import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator,
  Switch, Modal, SafeAreaView, Alert
} from 'react-native';
import { ChevronLeft, Edit as Pencil, Camera, Lock, Work as Briefcase, User as UserIcon, CloseSquare as X, Location as MapPin, Message as MailIcon, Call as PhoneIcon, Category } from '../../components/Iconly';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../app/store';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getAvatarUrl } from '../../app/utils/avatar';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../../app/utils/supabase';

const h = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const localStyles = StyleSheet.create({
  sectionHeader: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#94a3b8',
    marginBottom: 10,
    paddingLeft: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f6',
  },
  inputIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#8e8e93',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: '#000000',
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
  },
  section: {
    marginBottom: 24,
  },
  lastRow: {
    borderBottomWidth: 0,
  }
});

const SectionHeader = ({ title }: { title: string }) => {
  const { isDark } = useAppTheme();
  return (
    <Text style={[localStyles.sectionHeader, isDark && { color: '#94a3b8' }]}>{title}</Text>
  );
};

const InputField = ({ label, value, onChangeText, placeholder, icon: Icon, style, keyboardType, autoCapitalize, autoCorrect, multiline, numberOfLines, editable, rightElement }: any) => {
  const { isDark } = useAppTheme();
  return (
    <View style={[localStyles.inputWrap, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.05)' }, style]}>
      {Icon && (
        <View style={[localStyles.inputIconContainer, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
          <Icon size={16} color={isDark ? '#cbd5e1' : '#000000'} stroke="bold" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={[localStyles.inputLabel, { color: isDark ? '#64748b' : '#8e8e93' }]}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#475569' : '#a1a1aa'}
          style={[localStyles.input, { color: editable === false ? (isDark ? '#475569' : '#a1a1aa') : (isDark ? '#e8e8e8' : '#000000') }]}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
      </View>
      {rightElement && <View style={{ marginLeft: 12, justifyContent: 'center' }}>{rightElement}</View>}
    </View>
  );
};

const TagsInput = ({ label, tags, setTags, icon: Icon, style }: any) => {
  const { isDark } = useAppTheme();
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = (text?: string) => {
    const val = typeof text === 'string' ? text : inputValue;
    const trimmed = val.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t: string) => t !== tagToRemove));
  };

  return (
    <View style={[localStyles.inputWrap, { flexDirection: 'column', alignItems: 'stretch' }, isDark && { borderBottomColor: 'rgba(255, 255, 255, 0.05)' }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {Icon && (
          <View style={[localStyles.inputIconContainer, isDark && { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
            <Icon size={16} color={isDark ? '#cbd5e1' : '#000000'} stroke="bold" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[localStyles.inputLabel, { color: isDark ? '#64748b' : '#8e8e93' }]}>{label}</Text>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            onSubmitEditing={() => handleAddTag()}
            placeholder={tags.length === 0 ? "e.g. Swing Trader, Options" : "Add another tag..."}
            placeholderTextColor={isDark ? '#475569' : '#a1a1aa'}
            style={[localStyles.input, { color: isDark ? '#e8e8e8' : '#000000', height: 24 }]}
            returnKeyType="done"
            blurOnSubmit={false}
          />
        </View>
      </View>
      
      {tags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginLeft: 46 }}>
          {tags.map((tag: string, index: number) => (
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1e1e2d' : '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: isDark ? '#f8fafc' : '#334155', marginRight: 4 }}>{tag}</Text>
              <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} onPress={() => removeTag(tag)} style={{ padding: 2 }}>
                <X size={12} color={isDark ? '#94a3b8' : '#64748b'} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function ProfileTab() {
  const { isDark, theme } = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentUser = useStore(state => state.currentUser);
  const updateProfileState = useStore(state => state.updateProfileState);

  // --- MODAL STATES (Public Profile Info) ---
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editBannerUrl, setEditBannerUrl] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [accountType, setAccountType] = useState('Public');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isModalUpdating, setIsModalUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);

  // --- MAIN SCREEN STATES (Private/Contact Info) ---
  const [mainFirstName, setMainFirstName] = useState('');
  const [mainLastName, setMainLastName] = useState('');
  const [mainEmail, setMainEmail] = useState('');
  const [mainPhone, setMainPhone] = useState('');
  const [mainCountry, setMainCountry] = useState('');
  const [mainState, setMainState] = useState('');
  const [mainCity, setMainCity] = useState('');
  const [isMainUpdating, setIsMainUpdating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Modal States
      setEditDisplayName(currentUser.display_name || '');
      setEditUsername(currentUser.username || '');
      setEditBio(currentUser.bio || '');
      setEditBannerUrl(currentUser.banner_url || '');
      setEditAvatarUrl(currentUser.avatar_url || '');
      setEditTags(currentUser.tags || []);
      setAccountType(currentUser.is_private ? 'Private' : 'Public');

      // Main Screen States
      setMainFirstName(currentUser.first_name || '');
      setMainLastName(currentUser.last_name || '');
      setMainEmail(currentUser.email || '');
      setMainPhone(currentUser.phone_number || '');
      setMainCountry(currentUser.country || '');
      setMainState(currentUser.state || '');
      setMainCity(currentUser.city || '');
    }
  }, [currentUser, isModalOpen]);

  // Username Availability Checker
  useEffect(() => {
    if (!editUsername || editUsername === currentUser?.username) {
      setUsernameStatus('idle');
      return;
    }
    
    if (editUsername.length < 3) {
      setUsernameStatus('taken');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', editUsername.toLowerCase())
          .maybeSingle();
        
        if (data && data.id !== currentUser?.id) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (err) {
        setUsernameStatus('idle');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [editUsername, currentUser]);

  // Reliable Base64 to ArrayBuffer converter for React Native
  const decodeBase64 = (base64: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const lookup = new Uint8Array(256);
    for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;

    let bufferLength = base64.length * 0.75;
    if (base64[base64.length - 1] === '=') bufferLength--;
    if (base64[base64.length - 2] === '=') bufferLength--;

    const bytes = new Uint8Array(bufferLength);
    let p = 0;
    for (let i = 0; i < base64.length; i += 4) {
      let encoded1 = lookup[base64.charCodeAt(i)];
      let encoded2 = lookup[base64.charCodeAt(i + 1)];
      let encoded3 = lookup[base64.charCodeAt(i + 2)];
      let encoded4 = lookup[base64.charCodeAt(i + 3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      if (encoded3 !== undefined && encoded3 !== 64) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      if (encoded4 !== undefined && encoded4 !== 64) bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return bytes.buffer;
  };

  const pickAvatar = async () => {
    h();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setEditAvatarUrl(asset.uri);
    }
  };

  const pickBanner = async () => {
    h();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setEditBannerUrl(asset.uri);
    }
  };

  // Unified Save Profile Function
  const handleSaveProfile = async () => {
    h();
    if (!currentUser) return;
    
    // Validation
    const requiredFields = [
      { value: editDisplayName, name: 'Display Name' },
      { value: editUsername, name: 'Username' },
      { value: editBio, name: 'Bio' },
      { value: mainFirstName, name: 'First Name' },
      { value: mainLastName, name: 'Last Name' },
      { value: mainEmail, name: 'Contact Email' },
      { value: mainPhone, name: 'Phone Number' },
      { value: mainCountry, name: 'Country' },
      { value: mainState, name: 'State / Province' },
      { value: mainCity, name: 'City' }
    ];

    for (const field of requiredFields) {
      if (!field.value || field.value.trim() === '') {
        Alert.alert('Missing Information', `Please fill out your ${field.name}.`);
        return;
      }
    }

    if (editTags.length === 0 && tagInput.trim() === '') {
      Alert.alert('Missing Information', 'Please add at least one Trading Style Tag.');
      return;
    }

    if (usernameStatus === 'taken') {
      Alert.alert('Username Unavailable', 'The username you selected is already taken. Please choose another one.');
      return;
    }

    setIsMainUpdating(true);

    try {
      let finalAvatarUrl = currentUser.avatar_url;
      if (editAvatarUrl && editAvatarUrl !== currentUser.avatar_url) {
        try {
          const base64Str = await FileSystem.readAsStringAsync(editAvatarUrl, { encoding: 'base64' });
          const fileName = `${currentUser.id}/avatar_${Date.now()}.jpg`;
          const arrayBuffer = decodeBase64(base64Str);

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

          if (!uploadError) {
            finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
          }
        } catch (err) { console.error('Avatar upload error:', err); finalAvatarUrl = editAvatarUrl; }
      } else if (editAvatarUrl) {
        finalAvatarUrl = editAvatarUrl;
      }

      let finalBannerUrl = currentUser.banner_url;
      if (editBannerUrl && editBannerUrl !== currentUser.banner_url) {
        try {
          const base64Str = await FileSystem.readAsStringAsync(editBannerUrl, { encoding: 'base64' });
          const fileName = `${currentUser.id}/banner_${Date.now()}.jpg`;
          const arrayBuffer = decodeBase64(base64Str);

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, arrayBuffer, { contentType: 'image/jpeg', upsert: true });

          if (!uploadError) {
            finalBannerUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
          }
        } catch (err) { console.error('Banner upload error:', err); finalBannerUrl = editBannerUrl; }
      } else if (editBannerUrl) {
        finalBannerUrl = editBannerUrl;
      }

      let tagsArray = editTags;
      if (tagInput.trim() && !(Array.isArray(tagsArray) ? tagsArray : []).includes(tagInput.trim())) {
        tagsArray = [...(Array.isArray(tagsArray) ? tagsArray : []), tagInput.trim()];
        setEditTags(tagsArray);
        setTagInput('');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editDisplayName,
          username: editUsername,
          bio: editBio,
          banner_url: finalBannerUrl,
          avatar_url: finalAvatarUrl,
          first_name: mainFirstName,
          last_name: mainLastName,
          email: mainEmail,
          phone_number: mainPhone,
          country: mainCountry,
          state: mainState,
          city: mainCity,
          tags: tagsArray,
          is_private: accountType === 'Private',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      updateProfileState(
        editDisplayName, editBio, finalBannerUrl, finalAvatarUrl, tagsArray,
        accountType.toLowerCase(), accountType === 'Private', mainCountry, mainState, mainCity,
        editUsername, mainFirstName, mainLastName, mainPhone, mainEmail
      );
      
      Alert.alert('Success', 'Profile updated successfully!');
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      // Let the user see exactly what Supabase is complaining about
      Alert.alert('Database Error', err.message || 'Failed to update profile.');
    } finally {
      setIsMainUpdating(false);
    }
  };


  const styles = React.useMemo(() => StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: isDark ? '#0a0a0a' : '#fff',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#222' : '#f1f5f9',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#222' : '#f1f5f9',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#111' : '#f8fafc',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    scrollContent: {
      padding: 16,
    },

    // Wide Box Styles
    topWideBox: {
      backgroundColor: isDark ? '#0a0a0a' : '#fff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e2e8f0',
      overflow: 'hidden',
      marginBottom: 24,
    },
    wideBanner: {
      height: 120,
      width: '100%',
      backgroundColor: isDark ? '#1a1a1a' : '#f1f5f9',
      position: 'relative',
    },
    bannerOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    bannerOverlayText: {
      color: '#fff',
      fontFamily: 'Inter_600SemiBold',
      fontSize: 13,
    },
    topWideContent: {
      padding: 16,
      paddingTop: 0,
      flexDirection: 'row',
      alignItems: 'flex-end',
      position: 'relative',
    },
    avatarWrapper: {
      position: 'relative',
      marginTop: -40,
      marginRight: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: '#fff',
      backgroundColor: isDark ? '#111' : '#f8fafc',
    },
    cameraIconContainer: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#4f46e5',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    topInfo: {
      flex: 1,
      paddingBottom: 8,
    },
    topName: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 2,
    },
    topEmail: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: isDark ? '#a1a1aa' : '#64748b',
    },
    editModeToggle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#4f46e5',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },

    // Section Cards
    sectionCard: {
      backgroundColor: isDark ? '#0a0a0a' : '#fff',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e2e8f0',
      padding: 16,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Inter_700Bold',
      color: isDark ? '#f8fafc' : '#0f172a',
      marginBottom: 16,
    },

    formContainer: {
      gap: 0,
    },
    inputGroup: {
      width: '100%',
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
      color: isDark ? '#94a3b8' : '#475569',
      marginBottom: 8,
      marginLeft: 4,
    },
    inputWrapper: {
      width: '100%',
      height: 52,
      backgroundColor: isDark ? '#111' : '#f8fafc',
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e2e8f0',
    },
    inputText: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_500Medium',
      color: isDark ? '#f8fafc' : '#0f172a',
    },

    saveMainButton: {
      backgroundColor: '#0f172a',
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    saveMainButtonText: {
      color: '#fff',
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
    },

    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 15,
    },
    settingRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: isDark ? '#ffffff' : '#000000',
    },
    settingSub: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: isDark ? '#a1a1aa' : '#8e8e93',
      marginTop: 1,
    },
    accountTypeToggle: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#1a1a1a' : '#f1f5f9',
      borderRadius: 8,
      padding: 2,
    },
    accountTypeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    accountTypeBtnActive: {
      backgroundColor: isDark ? '#0a0a0a' : '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    accountTypeText: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: isDark ? '#a1a1aa' : '#64748b',
    },
    accountTypeTextActive: {
      color: isDark ? '#f8fafc' : '#0f172a',
    },
  }), [isDark]);


  return (
    <View style={{ flex: 1 }}>
      {/* Top Wide Box (Editable) */}
          <View style={styles.topWideBox}>
            <TouchableOpacity activeOpacity={0.8} onPress={pickBanner} style={styles.wideBanner}>
              <Image
                source={{ uri: editBannerUrl || currentUser?.banner_url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&fit=crop' }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay}>
                <Camera size={20} color="#fff" set="bold" />
                <Text style={styles.bannerOverlayText}>Edit Cover</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.topWideContent}>
              <TouchableOpacity activeOpacity={0.8} onPress={pickAvatar} style={styles.avatarWrapper}>
                <Image
                  source={{ uri: getAvatarUrl(editAvatarUrl || currentUser?.avatar_url, currentUser?.email) }}
                  style={styles.avatar}
                />
                <View style={styles.cameraIconContainer}>
                  <Camera size={14} color="#fff" set="bold" />
                </View>
              </TouchableOpacity>

              <View style={styles.topInfo}>
                <Text style={styles.topName}>{editDisplayName || currentUser?.first_name || 'Trader'}</Text>
                <Text style={styles.topEmail}>{editUsername ? `@${editUsername}` : currentUser?.email}</Text>
              </View>
            </View>
          </View>

          <View style={[styles.formContainer, { paddingTop: 8 }]}>
            {/* Public Profile Settings */}
            <View style={localStyles.section}>
              <SectionHeader title="Public Profile" />
              <View style={[localStyles.card, isDark && { backgroundColor: '#1a1a1a', borderColor: '#333' }]}>
                <InputField label="Display Name" value={editDisplayName} onChangeText={setEditDisplayName} placeholder="Your public name" icon={UserIcon} />
                <InputField 
                  label="Username" 
                  value={editUsername} 
                  onChangeText={setEditUsername} 
                  placeholder="username" 
                  icon={UserIcon} 
                  autoCapitalize="none" 
                  autoCorrect={false} 
                  rightElement={
                    usernameStatus === 'checking' ? <ActivityIndicator size="small" color="#4f46e5" /> :
                    usernameStatus === 'available' ? <Text style={{ color: '#10b981', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Available</Text> :
                    usernameStatus === 'taken' ? <Text style={{ color: '#ef4444', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Taken</Text> : null
                  }
                />
                <InputField label="Bio" value={editBio} onChangeText={setEditBio} placeholder="Tell us about yourself" icon={Pencil} multiline={true} numberOfLines={4} />
                <TagsInput label="Trading Style Tags" tags={editTags} setTags={setEditTags} icon={Category} style={localStyles.lastRow} />
              </View>
            </View>

            <View style={localStyles.section}>
              <SectionHeader title="Account Settings" />
              <View style={[localStyles.card, isDark && { backgroundColor: '#1a1a1a', borderColor: '#333' }]}>
                <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
                  <View style={styles.settingRowLeft}>
                    <Lock size={20} color={isDark ? '#cbd5e1' : '#000000'} stroke="bold" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.settingTitle}>Account Type</Text>
                      <Text style={styles.settingSub}>Choose who can view your feed</Text>
                    </View>
                  </View>
                  <View style={styles.accountTypeToggle}>
                    <TouchableOpacity
                      onPress={() => { h(); setAccountType('Public'); }}
                      style={[styles.accountTypeBtn, accountType === 'Public' ? styles.accountTypeBtnActive : {}]}
                    >
                      <Text style={[styles.accountTypeText, accountType === 'Public' ? styles.accountTypeTextActive : {}]}>Public</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => { h(); setAccountType('Private'); }}
                      style={[styles.accountTypeBtn, accountType === 'Private' ? styles.accountTypeBtnActive : {}]}
                    >
                      <Text style={[styles.accountTypeText, accountType === 'Private' ? styles.accountTypeTextActive : {}]}>Private</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* 1. Personal Details Form on Main Screen */}
            <View style={localStyles.section}>
              <SectionHeader title="Personal Details" />
              <View style={[localStyles.card, isDark && { backgroundColor: '#1a1a1a', borderColor: '#333' }]}>
                <InputField label="First Name" value={mainFirstName} onChangeText={setMainFirstName} placeholder="First name" icon={UserIcon} />
                <InputField label="Last Name" value={mainLastName} onChangeText={setMainLastName} placeholder="Last name" icon={UserIcon} />
                <InputField 
                  label="Contact Email" 
                  value={mainEmail} 
                  onChangeText={setMainEmail} 
                  placeholder="email@example.com" 
                  keyboardType="email-address" 
                  autoCapitalize="none" 
                  icon={MailIcon} 
                  editable={false}
                  rightElement={
                    <TouchableOpacity onPress={() => { h(); setIsEmailModalOpen(true); }} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#4f46e5', borderRadius: 6 }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Change</Text>
                    </TouchableOpacity>
                  }
                />
                <InputField label="Phone Number" value={mainPhone} onChangeText={setMainPhone} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" icon={PhoneIcon} style={localStyles.lastRow} />
              </View>
            </View>

            {/* 2. Location Form on Main Screen */}
            <View style={localStyles.section}>
              <SectionHeader title="Location" />
              <View style={[localStyles.card, isDark && { backgroundColor: '#1a1a1a', borderColor: '#333' }]}>
                <InputField label="Country" value={mainCountry} onChangeText={setMainCountry} placeholder="e.g. United States" icon={MapPin} />
                <InputField label="State / Province" value={mainState} onChangeText={setMainState} placeholder="e.g. CA" icon={MapPin} />
                <InputField label="City" value={mainCity} onChangeText={setMainCity} placeholder="e.g. SF" icon={MapPin} style={localStyles.lastRow} />
              </View>
            </View>

            {/* Save Main Details Button */}
            <TouchableOpacity
              style={styles.saveMainButton}
              onPress={handleSaveProfile}
              disabled={isMainUpdating}
            >
              {isMainUpdating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveMainButtonText}>Save Profile</Text>
              )}
            </TouchableOpacity>

          </View>
          <View style={{ height: 24 }} />

          {/* Change Email Modal */}
          <Modal visible={isEmailModalOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsEmailModalOpen(false)}>
            <View style={{ flex: 1, backgroundColor: isDark ? '#000' : '#f8fafc' }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsEmailModalOpen(false)} style={styles.backButton}>
                  <X size={24} color={isDark ? '#fff' : '#000'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Email</Text>
                <View style={{ width: 40 }} />
              </View>
              <View style={{ padding: 24 }}>
                <Text style={{ fontSize: 15, color: isDark ? '#a1a1aa' : '#64748b', marginBottom: 24, fontFamily: 'Inter_400Regular', lineHeight: 22 }}>
                  For security reasons, changing your email requires verification. A confirmation link will be sent to your new email address.
                </Text>
                <View style={[localStyles.card, isDark && { backgroundColor: '#1a1a1a', borderColor: '#333' }]}>
                  <InputField 
                    label="New Email Address" 
                    value={newEmail} 
                    onChangeText={setNewEmail} 
                    placeholder="Enter new email" 
                    keyboardType="email-address" 
                    autoCapitalize="none" 
                    icon={MailIcon} 
                    style={localStyles.lastRow}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.saveMainButton, { marginTop: 24 }]}
                  disabled={isEmailSending || !newEmail.includes('@')}
                  onPress={async () => {
                    h();
                    setIsEmailSending(true);
                    const { error } = await supabase.auth.updateUser({ email: newEmail });
                    setIsEmailSending(false);
                    if (error) {
                      Alert.alert('Error', error.message);
                    } else {
                      Alert.alert('Verification Sent', 'Please check your new inbox for a confirmation link to finalize the change.');
                      setIsEmailModalOpen(false);
                      setNewEmail('');
                    }
                  }}
                >
                  {isEmailSending ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveMainButtonText}>Send Verification Link</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
    </View>
  );
}

// Force HMR reload
