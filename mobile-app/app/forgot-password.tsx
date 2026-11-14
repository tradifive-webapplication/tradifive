import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, Platform, SafeAreaView, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { Message, Lock, Show, Hide } from '../components/Iconly';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AuthService } from './services/auth.service';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const validateEmail = () => {
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

  const handleSendInstructions = async () => {
    if (!validateEmail()) return;
    
    setLoading(true);
    setError('');
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Sends recovery instructions & 6-digit OTP code to user's email
      await AuthService.resetPasswordForEmail(email.trim());
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setResendCooldown(60);
      setStep('verify');
      Alert.alert(
        "Reset Code & Link Sent", 
        `We have sent a 6-digit code and a password reset link to ${email.trim()}.\n\nYou can enter the 6-digit code below to set a new password right away, or click the link in your email.`
      );
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || resendCooldown > 0) return;
    setResending(true);
    setError('');
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await AuthService.resetPasswordForEmail(email.trim());
      setResendCooldown(60);
      Alert.alert('Code Resent', 'A new password reset code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Could not resend the code.');
    } finally {
      setResending(false);
    }
  };

  const handleResetWithOtp = async () => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the 6-digit recovery code from your email');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      await AuthService.resetPasswordWithOtp(email.trim(), cleanOtp, newPassword);

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        'Password Reset Successful!',
        'Your password has been updated. You can now log in with your new password.',
        [
          {
            text: 'Log In Now',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code.');
      Alert.alert('Reset Failed', err.message || 'Invalid recovery code.');
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
                  if (step === 'verify') setStep('request');
                  else router.back();
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
            {step === 'request' ? (
              <>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Reset Password</Text>
                  <Text style={styles.subtitle}>
                    Enter your email address below. We'll send you a 6-digit recovery code and a reset link.
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
                        onChangeText={(val) => { setEmail(val); if (error) setError(''); }}
                        onFocus={() => { setFocusedField('email'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                        onBlur={() => setFocusedField(null)}
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
                    onPress={handleSendInstructions}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loginButtonText}>Send Instructions</Text>
                    )}
                  </TouchableOpacity>

                  <View style={{ alignItems: 'center', marginTop: 24 }}>
                    <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
                      <Text style={{ fontFamily: fontSemi, fontSize: 14, color: '#64748B' }}>
                        Remember your password? <Text style={{ color: '#ff4d4d', fontWeight: '700' }}>Log In</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Enter Recovery Code</Text>
                  <Text style={styles.subtitle}>
                    Enter the 6-digit code sent to <Text style={{ color: '#0F172A', fontWeight: '700' }}>{email}</Text> and choose a new password.
                  </Text>
                </View>

                <View style={styles.formContainer}>
                  {/* OTP Code Input */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>6-Digit Recovery Code</Text>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="000000"
                      placeholderTextColor="#CBD5E1"
                      value={otp}
                      onChangeText={(val) => { setOtp(val); if (error) setError(''); }}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                  </View>

                  {/* New Password */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={[
                      styles.inputContainer,
                      focusedField === 'newPassword' && styles.inputFocused,
                    ]}>
                      <View style={styles.inputIcon}><Lock size={20} color="#98A2B3" /></View>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#98A2B3"
                        value={newPassword}
                        onChangeText={(v) => { setNewPassword(v); if (error) setError(''); }}
                        onFocus={() => setFocusedField('newPassword')}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                        {showPassword ? <Hide size={20} color="#98A2B3" /> : <Show size={20} color="#98A2B3" />}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <View style={[
                      styles.inputContainer,
                      focusedField === 'confirmPassword' && styles.inputFocused,
                    ]}>
                      <View style={styles.inputIcon}><Lock size={20} color="#98A2B3" /></View>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#98A2B3"
                        value={confirmPassword}
                        onChangeText={(v) => { setConfirmPassword(v); if (error) setError(''); }}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                      />
                    </View>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleResetWithOtp}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loginButtonText}>Update Password</Text>
                    )}
                  </TouchableOpacity>

                  {/* Resend & Web Link Options */}
                  <View style={{ marginTop: 24, alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={handleResend} disabled={resending || resendCooldown > 0} activeOpacity={0.7}>
                      {resending ? (
                        <ActivityIndicator size="small" color="#64748B" />
                      ) : (
                        <Text style={{ fontFamily: fontSemi, fontSize: 14, color: resendCooldown > 0 ? '#94A3B8' : '#ff4d4d' }}>
                          {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't get the code? Resend"}
                        </Text>
                      )}
                    </TouchableOpacity>

                    <Text style={{ fontFamily: fontMed, fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 16 }}>
                      Tip: You can also tap the link in your email to reset your password via your web browser.
                    </Text>

                    <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7} style={{ marginTop: 8 }}>
                      <Text style={{ fontFamily: fontSemi, fontSize: 14, color: '#64748B' }}>
                        Back to <Text style={{ color: '#0F172A', fontWeight: '700' }}>Log In</Text>
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
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
    marginBottom: 28,
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
    marginTop: 4,
  },
  inputWrapper: {
    marginBottom: 20,
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
  otpInput: {
    height: 58,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    textAlign: 'center',
    fontSize: 26,
    letterSpacing: 10,
    fontFamily: fontBold,
    color: '#0F172A',
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
    marginTop: 6,
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
