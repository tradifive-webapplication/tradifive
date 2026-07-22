import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { Message } from '../components/Iconly';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthService } from './services/auth.service';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleReset = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Call Supabase auth to send reset email
      await AuthService.resetPasswordForEmail(email);
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert(
        "Instructions Sent", 
        "If an account exists with this email, you will receive password reset instructions shortly.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
          {/* HEADER AREA */}
          <LinearGradient
            colors={['#000000', '#000000']}
            style={styles.header}
          >
            <Image
              source={require('../assets/images/bottom-glow.png')}
              style={styles.bottomGlow}
              resizeMode="stretch"
              {...({ pointerEvents: 'none' } as any)}
            />
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', paddingTop: 20 }}>
              <View style={styles.headerRow}>
                <TouchableOpacity
                  onPress={async () => {
                    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.back();
                  }}
                  style={styles.backButton}
                  activeOpacity={0.8}
                >
                  <ArrowLeft size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../assets/images/Logo_only.png')}
                    style={styles.logoSymbol}
                    resizeMode="contain"
                  />
                  <Image
                    source={require('../assets/images/dark-mode-logo.png')}
                    style={styles.logoText}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>

          {/* CONTENT AREA */}
          <View style={styles.contentContainer}>
            <View style={styles.contentMaxWidth}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  No worries! Enter your email address below and we will send you instructions.
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email address</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'email' && styles.inputFocused,
                    error ? styles.inputErrorContainer : null
                  ]}>
                    <View style={styles.inputIcon}><Message size={20} color="#98A2B3" /></View>
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor="#98A2B3"
                      value={email}
                      onChangeText={(val) => { setEmail(val); if (error) validate(); }}
                      onFocus={() => { setFocusedField('email'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                      onBlur={handleBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleReset}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Send Instructions</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Inter_400Regular';
const fontBold = Platform.OS === 'ios' ? 'System' : 'Inter_700Bold';
const fontSemi = Platform.OS === 'ios' ? 'System' : 'Inter_600SemiBold';
const fontMed = Platform.OS === 'ios' ? 'System' : 'Inter_500Medium';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: height * 0.25,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 24,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  logoSymbol: {
    width: 44,
    height: 44,
  },
  logoText: {
    width: 155,
    height: 34,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentMaxWidth: {
    width: '100%',
    maxWidth: 420,
  },
  textContainer: {
    marginBottom: 32,
  },
  title: {
    fontFamily: fontBold,
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 34,
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontFamily,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
  },
  formContainer: {
    width: '100%',
    marginTop: 8,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: fontSemi,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  inputErrorContainer: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: fontMed,
    fontWeight: '500',
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
  },
  errorText: {
    fontFamily: fontMed,
    fontWeight: '500',
    fontSize: 13,
    color: '#EF4444',
    marginTop: 8,
    marginLeft: 4,
  },
  loginButton: {
    height: 52,
    backgroundColor: '#ff4d4d',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonText: {
    fontFamily: fontBold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  }
});
