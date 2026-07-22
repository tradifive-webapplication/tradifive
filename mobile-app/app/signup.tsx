import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Image, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AuthService } from './services/auth.service';
import { useStore } from './store';
import { LinearGradient } from 'expo-linear-gradient';
import { Message, Lock, Show, Hide } from '../components/Iconly';
import * as WebBrowser from 'expo-web-browser';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/[0-9]/.test(password) || !/[a-zA-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one letter and one number';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleEmailBlur = async () => {
    setFocusedField(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    
    const exists = await AuthService.checkEmailExists(email);
    if (exists) {
      setErrors(prev => ({ ...prev, email: 'Email is already registered' }));
    } else {
      if (errors.email === 'Email is already registered') {
        setErrors(prev => {
          const newErr = {...prev};
          delete newErr.email;
          return newErr;
        });
      }
    }
  };

  const handleSignup = async () => {
    const isValid = validate();
    
    if (!isValid) return;
    
    if (!agreed) {
      Alert.alert('Error', 'You must agree to the Terms and Privacy Policies.');
      return;
    }
    setLoading(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      
      const data = await AuthService.signUp(email.trim(), password, {
        first_name: firstName.trim(),
        last_name: lastName.trim()
      });

      if (!data?.session) {
        console.log('[Signup] No session returned (email confirm is ON). Redirecting to OTP...');
        router.push({ pathname: '/verify-email', params: { email } });
        return;
      }

      await useStore.getState().init();

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.replace('/(tabs)');
    } catch (err: any) {
      let msg = err.message || 'Could not complete registration.';
      
      // Map standard Supabase errors to our inline UI
      if (msg.includes('already registered')) {
        setErrors(prev => ({ ...prev, email: 'Email is already registered' }));
      } else if (msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('slow') || msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('network')) {
        msg += '\n\nTip: Supabase email verification can be slow or rate-limited. You can turn off "Confirm email" in your Supabase Dashboard (Authentication > Providers > Email) to sign up instantly.';
        Alert.alert('Sign Up Failed', msg);
      } else {
        Alert.alert('Sign Up Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      if (err.message && err.message.includes('cancelled')) {
        return;
      }
      Alert.alert('Google Sign Up Error', err.message || 'Failed to initialize Google Authorization.');
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join Tradifive today</Text>
              </View>

              <View style={styles.formContainer}>
                
                {/* Name Row */}
                <View style={styles.nameRow}>
                  {/* First Name */}
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <View style={[
                      styles.inputContainer,
                      focusedField === 'firstName' && styles.inputFocused,
                      errors.firstName ? styles.inputErrorContainer : null
                    ]}>
                      <TextInput
                        style={styles.input}
                        placeholder="John"
                        placeholderTextColor="#98A2B3"
                        value={firstName}
                        onChangeText={(val) => { setFirstName(val); if (errors.firstName) validate(); }}
                        onFocus={() => { setFocusedField('firstName'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                        onBlur={handleBlur}
                      />
                    </View>
                    {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                  </View>

                  {/* Last Name */}
                  <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <View style={[
                      styles.inputContainer,
                      focusedField === 'lastName' && styles.inputFocused,
                      errors.lastName ? styles.inputErrorContainer : null
                    ]}>
                      <TextInput
                        style={styles.input}
                        placeholder="Doe"
                        placeholderTextColor="#98A2B3"
                        value={lastName}
                        onChangeText={(val) => { setLastName(val); if (errors.lastName) validate(); }}
                        onFocus={() => { setFocusedField('lastName'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                        onBlur={handleBlur}
                      />
                    </View>
                    {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                  </View>
                </View>

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
                      onBlur={handleEmailBlur}
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

                {/* Confirm Password Input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={[
                    styles.inputContainer,
                    focusedField === 'confirmPassword' && styles.inputFocused,
                    errors.confirmPassword ? styles.inputErrorContainer : null
                  ]}>
                    <View style={styles.inputIcon}><Lock size={20} color="#98A2B3" /></View>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#98A2B3"
                      value={confirmPassword}
                      onChangeText={(val) => { setConfirmPassword(val); if (errors.confirmPassword) validate(); }}
                      onFocus={() => { setFocusedField('confirmPassword'); Platform.OS !== 'web' && Haptics.selectionAsync(); }}
                      onBlur={handleBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      {showConfirmPassword ? (
                        <Hide size={20} color="#98A2B3" />
                      ) : (
                        <Show size={20} color="#98A2B3" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                {/* Terms and Privacy Row */}
                <View style={styles.rememberRow}>
                  <TouchableOpacity
                    style={styles.rememberContainer}
                    onPress={async () => {
                      if (Platform.OS !== 'web') await Haptics.selectionAsync();
                      setAgreed(!agreed);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                      {agreed && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.rememberText}>
                      I agree to the <Text style={styles.redText} onPress={() => WebBrowser.openBrowserAsync('https://tradifive.com/terms-of-service')}>Terms</Text> and <Text style={styles.redText} onPress={() => WebBrowser.openBrowserAsync('https://tradifive.com/privacy-policy')}>Privacy Policies</Text>
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={[styles.loginButton, (!agreed || loading) && { opacity: 0.5 }]}
                  onPress={handleSignup}
                  disabled={loading || !agreed}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.loginButtonText}>Create Account</Text>
                  )}
                </TouchableOpacity>

                {/* Sign In Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push('/login')}>
                    <Text style={styles.signUpLink}>Sign in</Text>
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
                    onPress={handleGoogleSignup}
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
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  contentMaxWidth: {
    width: '100%',
    maxWidth: 420,
  },
  textContainer: {
    marginBottom: 20,
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
  nameRow: {
    flexDirection: 'row',
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 12,
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
    flex: 1,
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
    fontSize: 13,
    color: '#475569',
    flex: 1,
  },
  redText: {
    fontFamily: fontBold,
    fontWeight: '700',
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
    marginTop: 16,
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
    marginVertical: 16,
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
