import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, Platform, SafeAreaView, Dimensions, Animated
} from 'react-native';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AuthService } from './services/auth.service';
import { useStore } from './store';
import { LinearGradient } from 'expo-linear-gradient';
import { Message, Lock, Show, Hide } from '../components/Iconly';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AlertTriangle, CheckCircle, Mail } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Inter_400Regular';
const fontBold = Platform.OS === 'ios' ? 'System' : 'Inter_700Bold';
const fontSemi = Platform.OS === 'ios' ? 'System' : 'Inter_600SemiBold';
const fontMed = Platform.OS === 'ios' ? 'System' : 'Inter_500Medium';

// ─── Error Banner ────────────────────────────────────────────────────────────
function ErrorBanner({ message, onAction, actionLabel }: { message: string; onAction?: () => void; actionLabel?: string }) {
  return (
    <View style={bannerStyles.container}>
      <AlertTriangle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
      <Text style={bannerStyles.text}>{message}</Text>
      {onAction && actionLabel && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={bannerStyles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  text: {
    flex: 1,
    fontFamily: fontMed,
    fontSize: 13.5,
    color: '#B91C1C',
    lineHeight: 19,
  },
  action: {
    fontFamily: fontBold,
    fontSize: 13,
    color: '#EF4444',
    textDecorationLine: 'underline',
  },
});

// ─── OTP Verify Modal (inline) ───────────────────────────────────────────────
function OtpVerifyCard({ email, onClose, onVerified }: { email: string; onClose: () => void; onVerified: () => void }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (otp.length < 6) { setError('Please enter the 6-digit code'); return; }
    setLoading(true);
    setError('');
    try {
      if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await AuthService.verifyOtp(email, otp);
      setSuccess(true);
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => onVerified(), 1200);
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await AuthService.resendOtp(email);
      setError('');
    } catch (err: any) {
      setError('Could not resend code: ' + (err.message || 'Unknown error'));
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={otpStyles.card}>
      <View style={otpStyles.iconRow}>
        <View style={otpStyles.iconCircle}>
          <Mail size={28} color="#0F172A" />
        </View>
      </View>
      <Text style={otpStyles.title}>Verify your email</Text>
      <Text style={otpStyles.sub}>
        We sent a 6-digit code to{'\n'}
        <Text style={{ color: '#0F172A', fontFamily: fontBold }}>{email}</Text>
      </Text>

      {success ? (
        <View style={otpStyles.successRow}>
          <CheckCircle size={20} color="#16A34A" />
          <Text style={otpStyles.successText}>Email verified! Logging you in…</Text>
        </View>
      ) : (
        <>
          {error ? <ErrorBanner message={error} /> : null}
          <TextInput
            style={otpStyles.otpInput}
            placeholder="000000"
            placeholderTextColor="#CBD5E1"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
          <TouchableOpacity style={otpStyles.btn} onPress={handleVerify} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={otpStyles.btnText}>Verify Email</Text>}
          </TouchableOpacity>
          <View style={otpStyles.row}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={otpStyles.link}>Back to login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResend} disabled={resending} activeOpacity={0.7}>
              {resending ? <ActivityIndicator size="small" color="#64748B" /> : <Text style={otpStyles.link}>Resend code</Text>}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const otpStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconRow: { alignItems: 'center', marginBottom: 16 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontFamily: fontBold, fontSize: 22, color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  sub: { fontFamily: fontFamily, fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  otpInput: {
    height: 60, backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#CBD5E1',
    borderRadius: 16, textAlign: 'center', fontSize: 28, letterSpacing: 12,
    fontFamily: fontBold, color: '#0F172A', marginBottom: 20,
  },
  btn: {
    height: 52, backgroundColor: '#ff4d4d', borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#ff4d4d', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
  },
  btnText: { fontFamily: fontBold, fontSize: 16, color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  link: { fontFamily: fontSemi, fontSize: 14, color: '#64748B' },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', paddingVertical: 16 },
  successText: { fontFamily: fontSemi, fontSize: 15, color: '#16A34A' },
});

// ─── Main Login Screen ───────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginError, setLoginError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showOtpCard, setShowOtpCard] = useState(false);

  const haptic = (style = Haptics.ImpactFeedbackStyle.Medium) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(style).catch(() => {});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    setLoginError('');
    if (!validate()) { haptic(Haptics.ImpactFeedbackStyle.Light); return; }
    setLoading(true);
    haptic();
    try {
      await AuthService.signInWithEmail(email.trim(), password);
      await useStore.getState().init();
      if (Platform.OS !== 'web') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg: string = err.message || 'An error occurred. Please try again.';
      const lower = msg.toLowerCase();

      if (lower.includes('email not confirmed') || lower.includes('verify') || lower.includes('confirm')) {
        // Show OTP card inline
        setShowOtpCard(true);
      } else if (lower.includes('invalid login credentials') || lower.includes('invalid credential') || lower.includes('wrong password')) {
        setLoginError('Incorrect email or password. Please check your credentials and try again.');
        setErrors(prev => ({ ...prev, password: ' ' }));
      } else if (lower.includes('too many requests') || lower.includes('rate limit')) {
        setLoginError('Too many attempts. Please wait a few minutes and try again.');
      } else if (lower.includes('user not found') || lower.includes('no user found')) {
        setLoginError('No account found with this email. Please sign up first.');
        setErrors(prev => ({ ...prev, email: 'No account found with this email' }));
      } else if (lower.includes('network') || lower.includes('fetch')) {
        setLoginError('Network error. Please check your internet connection and try again.');
      } else {
        setLoginError(msg);
      }
      haptic(Haptics.ImpactFeedbackStyle.Heavy);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = () => {
    setShowOtpCard(false);
    setLoginError('');
    router.replace('/login');
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
        {/* HEADER */}
        <LinearGradient colors={['#000000', '#000000']} style={styles.header}>
          <Image
            source={require('../assets/images/bottom-glow.png')}
            style={styles.bottomGlow}
            resizeMode="stretch"
            {...({ pointerEvents: 'none' } as any)}
          />
          <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 20 }}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/Logo_only.png')} style={styles.logoSymbol} resizeMode="contain" />
              <Image source={require('../assets/images/dark-mode-logo.png')} style={styles.logoText} resizeMode="contain" />
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          <View style={styles.contentMaxWidth}>

            {/* OTP Verification inline card (replaces form) */}
            {showOtpCard ? (
              <>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Email not verified</Text>
                  <Text style={styles.subtitle}>Enter the code we sent to confirm your account</Text>
                </View>
                <OtpVerifyCard email={email} onClose={() => setShowOtpCard(false)} onVerified={handleOtpVerified} />
              </>
            ) : (
              <>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>Welcome back</Text>
                  <Text style={styles.subtitle}>Log in to continue to TradiFive</Text>
                </View>

                {/* Global error banner */}
                {loginError ? (
                  <ErrorBanner
                    message={loginError}
                    onAction={loginError.includes('sign up') ? () => router.push('/signup') : undefined}
                    actionLabel={loginError.includes('sign up') ? 'Sign up' : undefined}
                  />
                ) : null}

                <View style={styles.formContainer}>
                  {/* Email */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Email address</Text>
                    <View style={[
                      styles.inputContainer,
                      focusedField === 'email' && styles.inputFocused,
                      errors.email ? styles.inputErrorContainer : null,
                    ]}>
                      <View style={styles.inputIcon}><Message size={20} color="#98A2B3" /></View>
                      <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor="#98A2B3"
                        value={email}
                        onChangeText={(v) => { setEmail(v); if (errors.email) setErrors(p => ({ ...p, email: '' })); setLoginError(''); }}
                        onFocus={() => { setFocusedField('email'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </View>
                    {errors.email && errors.email.trim() ? <Text style={styles.errorText}>⚠ {errors.email}</Text> : null}
                  </View>

                  {/* Password */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={[
                      styles.inputContainer,
                      focusedField === 'password' && styles.inputFocused,
                      errors.password && errors.password.trim() ? styles.inputErrorContainer : null,
                    ]}>
                      <View style={styles.inputIcon}><Lock size={20} color="#98A2B3" /></View>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#98A2B3"
                        value={password}
                        onChangeText={(v) => { setPassword(v); if (errors.password) setErrors(p => ({ ...p, password: '' })); setLoginError(''); }}
                        onFocus={() => { setFocusedField('password'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        {showPassword ? <Hide size={20} color="#98A2B3" /> : <Show size={20} color="#98A2B3" />}
                      </TouchableOpacity>
                    </View>
                    {errors.password && errors.password.trim() ? <Text style={styles.errorText}>⚠ {errors.password}</Text> : null}
                  </View>

                  {/* Forgot password */}
                  <View style={styles.forgotRow}>
                    <TouchableOpacity onPress={() => { haptic(Haptics.ImpactFeedbackStyle.Light); router.push('/forgot-password'); }} activeOpacity={0.7}>
                      <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginButtonText}>Log In</Text>}
                  </TouchableOpacity>

                  {/* Sign up link */}
                  <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => { haptic(Haptics.ImpactFeedbackStyle.Light); router.push('/signup'); }} activeOpacity={0.7}>
                      <Text style={styles.signUpLink}>Sign up</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: height * 0.26,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  bottomGlow: { position: 'absolute', bottom: 0, width, height: 200 },
  logoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0 },
  logoSymbol: { width: 44, height: 44 },
  logoText: { width: 155, height: 34 },
  contentContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentMaxWidth: { width: '100%', maxWidth: 420 },
  textContainer: { marginBottom: 28 },
  title: { fontFamily: fontBold, fontWeight: '800', fontSize: 28, lineHeight: 34, color: '#0F172A', letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontFamily: fontFamily, fontWeight: '500', fontSize: 15, lineHeight: 22, color: '#64748B' },
  formContainer: { width: '100%' },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontFamily: fontSemi, fontWeight: '600', fontSize: 14, color: '#334155', marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', height: 52,
    backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: 'transparent', borderRadius: 14, paddingHorizontal: 16,
  },
  inputFocused: { borderColor: '#0F172A', backgroundColor: '#FFFFFF' },
  inputErrorContainer: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontFamily: fontMed, fontWeight: '500', fontSize: 15, color: '#0F172A', height: '100%' },
  eyeButton: { padding: 6, marginLeft: 8 },
  errorText: { fontFamily: fontMed, fontWeight: '500', fontSize: 13, color: '#EF4444', marginTop: 6, marginLeft: 4 },
  forgotRow: { alignItems: 'flex-end', marginTop: 2, marginBottom: 20 },
  forgotPasswordText: { fontFamily: fontSemi, fontWeight: '600', fontSize: 14, color: '#ff4d4d' },
  loginButton: {
    height: 52, backgroundColor: '#ff4d4d', borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#ff4d4d', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  loginButtonText: { fontFamily: fontBold, fontWeight: '700', fontSize: 16, color: '#FFFFFF', letterSpacing: 0.5 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 22 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontFamily: fontSemi, fontWeight: '600', fontSize: 13, color: '#94A3B8', marginHorizontal: 16, letterSpacing: 1 },
  googleButton: {
    height: 52, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0',
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  googleButtonText: { fontFamily: fontSemi, fontWeight: '600', fontSize: 15, color: '#0F172A' },
  signUpContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  signUpText: { fontFamily: fontFamily, fontWeight: '500', fontSize: 15, color: '#64748B' },
  signUpLink: { fontFamily: fontBold, fontWeight: '700', fontSize: 15, color: '#0F172A' },
});
