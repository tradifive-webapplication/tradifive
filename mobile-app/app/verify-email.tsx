import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, Platform, SafeAreaView, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { Lock } from '../components/Iconly';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await AuthService.resendOtp(email);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (err: any) {
      Alert.alert('Resend Failed', err.message || 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert('Error', 'Please enter the valid code.');
      return;
    }
    setLoading(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      await AuthService.verifyOtp(email, otp);
      await useStore.getState().init();
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    setFocusedField(null);
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
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>
                  We sent a code to <Text style={{ color: '#000000', fontFamily: fontBold }}>{email}</Text>. Please enter it below.
                </Text>
              </View>

              <View style={styles.formContainer}>
                {/* OTP Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Verification Code</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'otp' && styles.inputFocused,
                  ]}>
                    <View style={styles.inputIcon}><Lock size={20} color="#98A2B3" /></View>
                    <TextInput
                      style={styles.input}
                      placeholder="00000000"
                      placeholderTextColor="#98A2B3"
                      value={otp}
                      onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, '').slice(0, 8))}
                      onFocus={() => { setFocusedField('otp'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                      onBlur={handleBlur}
                      keyboardType="numeric"
                      maxLength={8}
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
                    disabled={resending}
                    activeOpacity={0.7}
                  >
                    {resending ? (
                      <ActivityIndicator color="#64748B" size="small" />
                    ) : (
                      <Text style={styles.linkText}>Resend Code</Text>
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
    color: '#1E293B',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fontMed,
    fontSize: 16,
    color: '#0F172A',
  },
  loginButton: {
    backgroundColor: '#ff4d4d',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#ff4d4d',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontFamily: fontBold,
    fontWeight: '700',
    fontSize: 16,
    color: '#FFFFFF',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 4,
  },
  linkText: {
    fontFamily: fontSemi,
    fontWeight: '600',
    fontSize: 14,
    color: '#64748B',
  },
});
