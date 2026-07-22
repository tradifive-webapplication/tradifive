import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Image, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { X, Image as ImageIcon, Video as VideoIcon, Send } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { supabase } from '../app/utils/supabase';
import { useStore } from '../app/store';
import { useAppTheme } from '../hooks/useAppTheme';

const { width, height } = Dimensions.get('window');

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ visible, onClose, onPostCreated }) => {
  const { isDark } = useAppTheme();
  const currentUser = useStore(state => state.currentUser);
  
  const [content, setContent] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setContent('');
    setMediaUri(null);
    setMediaType(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const pickMedia = async (type: 'image' | 'video') => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setMediaUri(result.assets[0].uri);
      setMediaType(type);
    }
  };

  const uploadMedia = async (uri: string, type: 'image' | 'video'): Promise<string | null> => {
    try {
      if (!currentUser?.id) return null;
      
      const fileExt = uri.split('.').pop() || (type === 'image' ? 'jpg' : 'mp4');
      const fileName = `${currentUser.id}_${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;
      
      let fileBody: any;
      
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileBody = await response.blob();
      } else {
        const response = await fetch(uri);
        fileBody = await response.blob();
      }

      const { data, error } = await supabase.storage
        .from('avatars') // Assuming avatars bucket is used for all user uploads for now as in web app
        .upload(filePath, fileBody, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading media:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return publicUrl;
    } catch (err) {
      console.error('Exception during upload:', err);
      return null;
    }
  };

  const handleSubmit = async () => {
    if ((!content.trim() && !mediaUri) || !currentUser?.id) return;
    
    setIsSubmitting(true);
    
    try {
      let finalMediaUrl = null;
      
      if (mediaUri) {
        finalMediaUrl = await uploadMedia(mediaUri, mediaType || 'image');
      }
      
      const { data, error } = await supabase.from('social_posts').insert([
        {
          user_id: currentUser.id,
          content: content.trim(),
          media_url: finalMediaUrl,
          post_type: mediaType === 'video' ? 'video' : (finalMediaUrl ? 'image' : 'text'),
          like_count: 0,
          comment_count: 0,
          share_count: 0,
          bookmark_count: 0,
        }
      ]);

      if (error) throw error;
      
      onPostCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
        <View style={[styles.header, { borderBottomColor: isDark ? '#222' : '#e2e8f0' }]}>
          <TouchableOpacity onPress={handleClose} style={styles.iconBtn}>
            <X size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Create Post</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={isSubmitting || (!content.trim() && !mediaUri)}
            style={[
              styles.submitBtn,
              { opacity: (!content.trim() && !mediaUri) || isSubmitting ? 0.5 : 1 }
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
          placeholder="What's on your mind?"
          placeholderTextColor={isDark ? '#666' : '#94a3b8'}
          multiline
          value={content}
          onChangeText={setContent}
          autoFocus
        />

        {mediaUri && (
          <View style={styles.mediaPreviewContainer}>
            <TouchableOpacity 
              style={styles.removeMediaBtn} 
              onPress={() => { setMediaUri(null); setMediaType(null); }}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
            
            {mediaType === 'video' ? (
              <Video
                source={{ uri: mediaUri }}
                style={styles.mediaPreview}
                useNativeControls
                resizeMode={ResizeMode.COVER}
              />
            ) : (
              <Image source={{ uri: mediaUri }} style={styles.mediaPreview} />
            )}
          </View>
        )}

        <View style={[styles.toolbar, { borderTopColor: isDark ? '#222' : '#e2e8f0' }]}>
          <TouchableOpacity style={styles.toolbarBtn} onPress={() => pickMedia('image')}>
            <ImageIcon size={24} color="#3b82f6" />
            <Text style={[styles.toolbarText, { color: isDark ? '#d1d5db' : '#475569' }]}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarBtn} onPress={() => pickMedia('video')}>
            <VideoIcon size={24} color="#ec4899" />
            <Text style={[styles.toolbarText, { color: isDark ? '#d1d5db' : '#475569' }]}>Video</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  input: {
    padding: 20,
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  mediaPreviewContainer: {
    margin: 20,
    position: 'relative',
    height: width * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    gap: 8,
  },
  toolbarText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  }
});
