import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, Platform, SafeAreaView, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { Lock } from '../components/Iconly';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StatusBar } from 'expo-status-bar';
import { AuthService } from './services/auth.service';
import { useStore } from './store';

const { width, height } = Dimensions.get('window');

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setResending(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await AuthService.resendOtp(email);
      setResendCooldown(60);
      Alert.alert('Code Sent', 'A new 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Resend Failed', err.message || 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      await AuthService.verifyOtp(email, cleanOtp);
      // Sign out temporary session so user logs in with their credentials
      await AuthService.signOut();
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        'Email Verified!',
        'Your email has been verified successfully. Please log in with your credentials to access your account.',
        [
          {
            text: 'Log In Now',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" translucent />
      <KeyboardAwareScrollView
        style={{ flex: 1, backgroundColor: '#000000' }}
        contentContainerStyle={{ flexGrow: 1, backgroundColor: '#FFFFFF' }}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
        contentInsetAdjustmentBehavior="never"
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
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>
                  We sent a code to <Text style={{ color: '#000000', fontFamily: fontBold }}>{email}</Text>. Please enter it below.
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* OTP Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>6-Digit Verification Code</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'otp' && styles.inputFocused,
                  ]}>
                    <View style={styles.inputIcon}><Lock size={20} color="#98A2B3" /></View>
                    <TextInput
                      style={[styles.input, { letterSpacing: 6, fontSize: 20, fontWeight: '700' }]}
                      placeholder="000000"
                      placeholderTextColor="#CBD5E1"
                      value={otp}
                      onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, '').slice(0, 6))}
                      onFocus={() => { setFocusedField('otp'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                      onBlur={handleBlur}
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleVerify}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Verify Account</Text>
                  )}
                </TouchableOpacity>

                {/* Links */}
                <View style={styles.linksContainer}>
                  <TouchableOpacity
                    onPress={async () => {
                      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.replace('/login');
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.linkText}>Back to login</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={resending || resendCooldown > 0}
                    activeOpacity={0.7}
                  >
                    {resending ? (
                      <ActivityIndicator color="#64748B" size="small" />
                    ) : (
                      <Text style={[styles.linkText, resendCooldown > 0 && { color: '#94A3B8' }]}>
                        {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

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
    backgroundColor: '#000000',
  },
  header: {
    height: height * 0.25,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 140,
    opacity: 0.9,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 20,
  },
  logoSymbol: {
    width: 32,
    height: 32,
  },
  logoText: {
    width: 140,
    height: 32,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 40,
  },
  contentMaxWidth: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  textContainer: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fontBold,
    fontSize: 24,
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontMed,
    fontSize: 15,
    color: '#64748B',
    lineHeight: 22,
  },
  formContainer: {
    gap: 20,
  },
  inputWrapper: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: fontBold,
    fontSize: 14,
    color: '#334155',
    marginBottom: 2,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputFocused: {
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: fontMed,
    fontSize: 15,
    color: '#0F172A',
    height: '100%',
  },
  loginButton: {
    backgroundColor: '#000000',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontFamily: fontBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    fontFamily: fontSemi,
    fontSize: 14,
    color: '#64748B',
  },
});
