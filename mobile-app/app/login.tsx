import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AuthService } from './services/auth.service';
import { useStore } from './store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Message, Lock, Show, Hide } from '../components/Iconly';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleLogin = async () => {
    const isValid = validate();

    if (!isValid) return;
    setLoading(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      await AuthService.signInWithEmail(email.trim(), password);
      await useStore.getState().init();

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      let msg = err.message || 'An error occurred.';
      if (msg.toLowerCase().includes('confirm') || msg.toLowerCase().includes('verify')) {
        msg += '\n\nTip: Please verify your email first, or go to your Supabase Dashboard under Authentication > Providers > Email and turn off "Confirm email" to log in instantly.';
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('credential')) {
        msg += '\n\nTip: Double-check your credentials. If you recently signed up, make sure your email is confirmed, or disable "Confirm email" in your Supabase Auth settings to log in instantly.';
      }
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await AuthService.signInWithGoogle();
      await useStore.getState().init();
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err.message && err.message.includes('cancelled')) return;
      console.error('[Google Auth Error]:', err.message);
      Alert.alert('Google Auth Error', err.message || 'Failed to initialize Google Authorization.');
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
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
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
            </SafeAreaView>
          </LinearGradient>

          {/* CONTENT AREA */}
          <View style={styles.contentContainer}>
            <View style={styles.contentMaxWidth}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Log in to continue to TradiFive</Text>
              </View>

              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Email address</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'email' && styles.inputFocused,
                    errors.email ? styles.inputErrorContainer : null
                  ]}>
                    <View style={styles.inputIcon}><Message size={20} color="#98A2B3" /></View>
                    <TextInput
                      style={styles.input}
                      placeholder="you@example.com"
                      placeholderTextColor="#98A2B3"
                      value={email}
                      onChangeText={(val) => { setEmail(val); if (errors.email) validate(); }}
                      onFocus={() => { setFocusedField('email'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                      onBlur={handleBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                {/* Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'password' && styles.inputFocused,
                    errors.password ? styles.inputErrorContainer : null
                  ]}>
                    <View style={styles.inputIcon}><Lock size={20} color="#98A2B3" /></View>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#98A2B3"
                      value={password}
                      onChangeText={(val) => { setPassword(val); if (errors.password) validate(); }}
                      onFocus={() => { setFocusedField('password'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                      onBlur={handleBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? (
                        <Hide size={20} color="#98A2B3" />
                      ) : (
                        <Show size={20} color="#98A2B3" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                {/* Remember and Forgot Password Row */}
                <View style={styles.rememberRow}>
                  <TouchableOpacity
                    style={styles.rememberContainer}
                    onPress={async () => {
                      if (Platform.OS !== 'web') await Haptics.selectionAsync();
                      setRememberMe(!rememberMe);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Log in</Text>
                  )}
                </TouchableOpacity>

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/signup')}>
                    <Text style={styles.signUpLink}>Sign up</Text>
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity
                    onPress={handleGoogleLogin}
                    style={styles.socialButton}
                    activeOpacity={0.8}
                  >
                    <Image source={require('../assets/images/google-icon.png')} style={{ width: 18, height: 18 }} />
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {
                      Platform.OS !== 'web' && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert("Coming soon", "Apple login coming soon!");
                    }}
                    style={styles.socialButton}
                    activeOpacity={0.8}
                  >
                    <Image source={require('../assets/images/apple-icon.png')} style={{ width: 18, height: 18 }} />
                    <Text style={styles.socialButtonText}>Apple</Text>
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
    marginBottom: 6,
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
  },
  inputWrapper: {
    marginBottom: 16,
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
  eyeButton: {
    padding: 6,
    marginLeft: 8,
  },
  errorText: {
    fontFamily: fontMed,
    fontWeight: '500',
    fontSize: 13,
    color: '#EF4444',
    marginTop: 8,
    marginLeft: 4,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rememberText: {
    fontFamily: fontMed,
    fontWeight: '500',
    fontSize: 15,
    color: '#475569',
  },
  forgotPasswordText: {
    fontFamily: fontSemi,
    fontWeight: '600',
    fontSize: 15,
    color: '#ff4d4d',
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
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    fontFamily: fontFamily,
    fontWeight: '500',
    fontSize: 15,
    color: '#64748B',
  },
  signUpLink: {
    fontFamily: fontBold,
    fontWeight: '700',
    fontSize: 15,
    color: '#0F172A',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontFamily: fontSemi,
    fontWeight: '600',
    fontSize: 13,
    color: '#94A3B8',
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
      }
    })
  },
  socialButtonText: {
    fontFamily: fontSemi,
    fontWeight: '600',
    fontSize: 14,
    color: '#0F172A',
  }
});
