import fs from 'fs';
import path from 'path';

const rootDir = 'c:/Users/nikil/Downloads/fialgo-connect-main/fialgo-connect-main/mobile-app';
const authServicePath = path.join(rootDir, 'app/services/auth.service.ts');
const signupPath = path.join(rootDir, 'app/signup.tsx');
const verifyEmailPath = path.join(rootDir, 'app/verify-email.tsx');

// 1. Update AuthService to add verifyOtp
let authServiceContent = fs.readFileSync(authServicePath, 'utf-8');
const verifyOtpMethod = `
  static async verifyOtp(email: string, otp: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });
    if (error) throw new Error(error.message);
    return data;
  }
`;
if (!authServiceContent.includes('verifyOtp')) {
  authServiceContent = authServiceContent.replace(
    /static async signUpWithEmail/,
    verifyOtpMethod + '\n  static async signUpWithEmail'
  );
  fs.writeFileSync(authServicePath, authServiceContent);
  console.log('Added verifyOtp to AuthService');
}

// 2. Create verify-email.tsx
const verifyEmailCode = `import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { AuthService } from './services/auth.service';
import { useStore } from './store';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email as string;
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
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

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
          {/* HEADER SECTION (DARK) */}
          <View style={{ height: 260, backgroundColor: 'black', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', zIndex: 10, paddingTop: 40 }}>
            <Image
              source={require('../assets/images/Tradifive-logo-1.bmp')}
              style={{ width: 210, height: 70, zIndex: 20 }}
              resizeMode="contain"
            />
            <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 140, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
              <Image
                source={require('../assets/images/bottom-glow.png')}
                style={{ width: '100%', height: '100%', opacity: 0.9 }}
                resizeMode="stretch"
              />
            </View>
          </View>

          {/* FORM SECTION */}
          <View style={{ flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 32, paddingTop: 32, paddingBottom: 40 }}>
            <View style={{ gap: 20 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 24, color: '#0f172a', marginBottom: 8 }}>Verify your email</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: '#64748b', lineHeight: 22 }}>
                  We sent a 6-digit code to <Text style={{ color: '#000000', fontFamily: 'Inter_700Bold' }}>{email}</Text>. Please enter it below.
                </Text>
              </View>

              <View>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  placeholder="000000"
                  placeholderTextColor="#94a3b8"
                  style={styles.inputText}
                  value={otp}
                  onChangeText={(val) => setOtp(val.replace(/[^0-9]/g, '').slice(0, 6))}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                style={{
                  backgroundColor: '#ff4d4d',
                  height: 56,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 16,
                  shadowColor: '#ef4444',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.btnText}>Verify Account</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.replace('/login')} style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#64748b' }}>Back to login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  inputLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputText: {
    fontFamily: 'Inter_500Medium',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center'
  },
  btnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: '#ffffff',
  }
});
`;

fs.writeFileSync(verifyEmailPath, verifyEmailCode);
console.log('Created verify-email.tsx');

// 3. Update signup.tsx
let signupContent = fs.readFileSync(signupPath, 'utf-8');

const alertCodeToReplace = `      if (!data?.session) {
        console.log('[Signup] No session returned (email confirm is ON). Auto-logging in...');
        try {
          await AuthService.signInWithEmail(email, password);
        } catch (loginErr: any) {
          console.warn('[Signup Auto-Login] Failed:', loginErr.message);
          // If auto-login fails (e.g. email not confirmed), show helpful message
          Alert.alert(
            'Account Created',
            'Your account was created but email confirmation is required to log in.\\n\\nTip: Go to your Supabase Dashboard → Authentication → Providers → Email and turn off "Confirm email" to log in instantly.',
            [{ text: 'OK', onPress: () => router.replace('/login') }]
          );
          return;
        }
      }`;

const pushToVerifyCode = `      if (!data?.session) {
        console.log('[Signup] No session returned (email confirm is ON). Redirecting to OTP...');
        router.push({ pathname: '/verify-email', params: { email } });
        return;
      }`;

if (signupContent.includes(alertCodeToReplace)) {
  signupContent = signupContent.replace(alertCodeToReplace, pushToVerifyCode);
  fs.writeFileSync(signupPath, signupContent);
  console.log('Updated signup.tsx to redirect to verify-email');
} else {
  // Try regex replace if exact string matching fails
  signupContent = signupContent.replace(
    /if \(!data\?\.session\) \{[\s\S]*?Alert\.alert\([\s\S]*?'Account Created'[\s\S]*?return;\n\s+\}/,
    pushToVerifyCode
  );
  fs.writeFileSync(signupPath, signupContent);
  console.log('Updated signup.tsx to redirect to verify-email (regex method)');
}
