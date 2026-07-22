import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { User, TickSquare, CloseSquare, ChevronLeft, Discovery } from '../../components/Iconly';
import { useStore } from '../store';
import { AuthService } from '../services/auth.service';

const triggerHaptic = (type: Haptics.NotificationFeedbackType | Haptics.ImpactFeedbackStyle) => {
  if (Platform.OS !== 'web') {
    if (type === Haptics.ImpactFeedbackStyle.Light) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.notificationAsync(type as Haptics.NotificationFeedbackType);
    }
  }
};

const fontFamily = Platform.OS === 'ios' ? 'System' : 'Inter_400Regular';
const fontBold = Platform.OS === 'ios' ? 'System' : 'Inter_700Bold';
const fontSemi = Platform.OS === 'ios' ? 'System' : 'Inter_600SemiBold';
const fontMed = Platform.OS === 'ios' ? 'System' : 'Inter_500Medium';

export default function UsernameModal() {
  const insets = useSafeAreaInsets();
  const currentUser = useStore(state => state.currentUser);
  const hasRealSession = useStore(state => state.hasRealSession);
  const updateUsernameState = useStore(state => state.updateUsernameState);

  // Set to true to force show for testing
  const FORCE_SHOW_FOR_TESTING = false;
  const [testForceShow, setTestForceShow] = useState(false);

  const visible = (FORCE_SHOW_FOR_TESTING && testForceShow) || (!!currentUser && hasRealSession && !currentUser.has_chosen_username);

  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isValidFormat, setIsValidFormat] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focusedField, setFocusedField] = useState<boolean>(false);

  const slideAnim = useRef(new Animated.Value(400)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Keyboard offset animation for smooth upward movement
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        Animated.timing(keyboardHeight, {
          toValue: Platform.OS === 'ios' ? e.endCoordinates.height : e.endCoordinates.height,
          duration: 250,
          useNativeDriver: false, // height cannot use native driver
        }).start();
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (visible && currentUser) {
      const emailPrefix = currentUser.email?.split('@')[0] || '';
      const firstName = currentUser.first_name || '';
      const lastName = currentUser.last_name || '';
      
      const list = new Set<string>();
      const cleanFirst = firstName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanLast = lastName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const cleanEmail = emailPrefix.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();

      // Generate 12 unique suggestions
      if (cleanFirst) {
        list.add(cleanFirst);
        if (cleanLast) {
          list.add(`${cleanFirst}_${cleanLast}`);
          list.add(`${cleanFirst}${cleanLast}`);
        }
        list.add(`${cleanFirst}trades`);
        list.add(`${cleanFirst}_fx`);
        list.add(`${cleanFirst}${Math.floor(100 + Math.random() * 900)}`);
      }
      if (cleanEmail) {
        list.add(cleanEmail);
        list.add(`${cleanEmail}_pro`);
        list.add(`${cleanEmail}${Math.floor(100 + Math.random() * 900)}`);
      }
      
      const array = Array.from(list).filter(s => s.length >= 4 && s.length <= 15);
      
      // Fill remaining to ensure we have exactly 10 suggestions
      const adjectives = ['pro', 'trade', 'capital', 'fx', 'alpha', 'smart', 'bull', 'bear'];
      let attempts = 0;
      while (array.length < 10 && attempts < 50) {
        attempts++;
        const randAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randNum = Math.floor(100 + Math.random() * 900);
        const randBase = cleanFirst || 'user';
        array.push(`${randBase}_${randAdj}${randNum}`);
      }
      
      const finalSuggestions = Array.from(new Set(array)).filter(s => s.length >= 4 && s.length <= 15).slice(0, 10);
      setSuggestions(finalSuggestions);
      // Set empty username initially if we want user to type their own, but since we are showing suggestions, we can auto-select the first.
      setUsername(''); 
      setStep(1);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible, currentUser]);

  useEffect(() => {
    if (step !== 1) return;
    
    if (!username) {
      setErrorMsg(null);
      setIsValidFormat(false);
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (username.length < 4) {
      setErrorMsg('Must be at least 4 characters');
      setIsValidFormat(false);
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }
    if (username.length > 15) {
      setErrorMsg('Cannot exceed 15 characters');
      setIsValidFormat(false);
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }
    if (!usernameRegex.test(username)) {
      setErrorMsg('Letters, numbers, underscores, dots only');
      setIsValidFormat(false);
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }

    setErrorMsg(null);
    setIsValidFormat(true);
    setIsAvailable(false);
    setIsChecking(true);

    const checkTimeout = setTimeout(async () => {
      try {
        const taken = await AuthService.checkUsernameExists(username, currentUser?.id);
        setIsChecking(false);
        if (taken) {
          setErrorMsg('Username is already taken');
          setIsAvailable(false);
          triggerHaptic(Haptics.NotificationFeedbackType.Error);
        } else {
          setErrorMsg(null);
          setIsAvailable(true);
          triggerHaptic(Haptics.NotificationFeedbackType.Success);
        }
      } catch (e) {
        setIsChecking(false);
        setErrorMsg('Error checking availability');
        setIsAvailable(false);
      }
    }, 500);

    return () => clearTimeout(checkTimeout);
  }, [username, step, currentUser]);

  const handleNext = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1) {
      if (isValidFormat && !isChecking && isAvailable) {
        setStep(2);
      }
    } else if (step === 2) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    if (step === 1) {
      handleClose();
    } else if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!username || !currentUser) return;
    
    setLoading(true);
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);

    const safetyTimer = setTimeout(() => {
      updateUsernameState(username);
      setLoading(false);
      setTestForceShow(false);
    }, 10000);

    try {
      updateUsernameState(username);
      triggerHaptic(Haptics.NotificationFeedbackType.Success);
      setTestForceShow(false);

      if (!currentUser.id.startsWith('mock-user-id')) {
        AuthService.updateUsername(currentUser.id, username).catch(() => {});
      }
    } catch (e: any) {
      updateUsernameState(username);
      setErrorMsg(e.message || 'Failed to update username');
      triggerHaptic(Haptics.NotificationFeedbackType.Error);
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  };

  const handleClose = async () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    try {
      await AuthService.signOut();
    } catch (e) {}
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
          
          <Animated.View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom + 20, 32),
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.grabber} />
            
            <Animated.View style={{ paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 0 }}>
              
              {step === 1 && (
                <View style={styles.contentContainer}>
                  <View style={styles.header}>
                    <Text style={styles.title}>Create a username</Text>
                    <Text style={styles.subtitle}>
                      Choose a unique username to represent yourself in the community.
                    </Text>
                  </View>

                  <View style={styles.formContainer}>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>Username</Text>
                      <View style={[
                        styles.inputContainer,
                        focusedField && styles.inputFocused,
                        !!errorMsg ? styles.inputErrorContainer : null,
                        isValidFormat && isAvailable && !isChecking && styles.inputSuccessContainer
                      ]}>
                        <View style={styles.inputIcon}>
                          <User size={20} color={focusedField ? "#0F172A" : "#98A2B3"} set="bulk" />
                        </View>
                        <TextInput
                          value={username}
                          onChangeText={(val) => setUsername(val.toLowerCase().trim())}
                          onFocus={() => setFocusedField(true)}
                          onBlur={() => setFocusedField(false)}
                          placeholder="Type your username"
                          placeholderTextColor="#98A2B3"
                          autoCapitalize="none"
                          autoCorrect={false}
                          maxLength={15}
                          style={styles.input}
                          editable={!loading}
                        />
                        <View style={styles.statusIndicator}>
                          {isChecking && <ActivityIndicator size="small" color="#98A2B3" />}
                          {!isChecking && isValidFormat && isAvailable && (
                            <TickSquare size={22} color="#10B981" set="bulk" />
                          )}
                          {!isChecking && !isAvailable && username.length > 0 && !!errorMsg && (
                            <CloseSquare size={22} color="#EF4444" set="bulk" />
                          )}
                        </View>
                      </View>
                      <View style={styles.messageContainer}>
                        {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
                        {isValidFormat && isAvailable && !errorMsg && <Text style={styles.successText}>Username is available</Text>}
                      </View>
                    </View>

                    {suggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 32 }}>
                          <Text style={styles.suggestionsTitle}>Suggestions</Text>
                        </View>
                        <ScrollView 
                          horizontal 
                          keyboardShouldPersistTaps="handled"
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.suggestionsList}
                        >
                          {suggestions.map((sug, i) => (
                            <TouchableOpacity
                              key={i}
                              onPress={() => {
                                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                                setUsername(sug);
                              }}
                              style={[
                                styles.suggestionChip,
                                username === sug && styles.suggestionChipSelected
                              ]}
                            >
                              <Text style={[
                                styles.suggestionChipText,
                                username === sug && styles.suggestionChipTextSelected
                              ]}>
                                @{sug}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={handleNext}
                      disabled={!isValidFormat || isChecking || !isAvailable || loading}
                      activeOpacity={0.8}
                      style={[
                        styles.loginButton,
                        (!isValidFormat || isChecking || !isAvailable) && styles.loginButtonDisabled,
                        { marginTop: 12 }
                      ]}
                    >
                      <Text style={styles.loginButtonText}>Continue</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {step === 2 && (
                <View style={styles.contentContainer}>
                  <View style={styles.headerRow}>
                    <TouchableOpacity onPress={handleBack} style={{ padding: 4 }}>
                      <ChevronLeft size={28} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={[styles.title, { marginBottom: 0, marginLeft: 8 }]}>Terms & Policies</Text>
                  </View>

                  <View style={styles.termsBox}>
                    <Text style={styles.infoParagraphLarge}>
                      By tapping <Text style={styles.boldText}>I agree</Text>, you agree to create your account and accept Tradifive's{' '}
                      <Text style={styles.blueLink}>Terms</Text> and{' '}
                      <Text style={styles.blueLink}>Privacy Policy</Text>.
                    </Text>
                    <Text style={styles.infoParagraphLarge}>
                      We use this information to provide, personalize, and improve your trading experience.
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleNext}
                    disabled={loading}
                    activeOpacity={0.8}
                    style={[styles.loginButton, { marginTop: 24 }]}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.loginButtonText}>I agree</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  grabber: {
    width: 36,
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: fontBold,
    fontWeight: '800',
    fontSize: 26,
    lineHeight: 32,
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
    marginBottom: 4,
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
  inputSuccessContainer: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
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
  statusIndicator: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    height: 24,
    justifyContent: 'center',
    marginTop: 4,
  },
  errorText: {
    fontFamily: fontMed,
    fontWeight: '500',
    fontSize: 13,
    color: '#EF4444',
    marginLeft: 4,
  },
  successText: {
    fontFamily: fontMed,
    fontWeight: '500',
    fontSize: 13,
    color: '#10B981',
    marginLeft: 4,
  },
  suggestionsContainer: {
    marginTop: 0,
    marginBottom: 8,
    marginLeft: -28,
    marginRight: -28,
  },
  suggestionsTitle: {
    fontFamily: fontSemi,
    fontWeight: '600',
    fontSize: 14,
    color: '#94A3B8',
  },
  suggestionsList: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 28,
    paddingBottom: 4,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  suggestionChipSelected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#ff4d4d',
  },
  suggestionChipText: {
    fontFamily: fontSemi,
    fontSize: 14,
    color: '#475569',
  },
  suggestionChipTextSelected: {
    color: '#ff4d4d',
    fontFamily: fontBold,
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
  loginButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontFamily: fontBold,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  termsBox: {
    paddingHorizontal: 4,
  },
  infoParagraphLarge: {
    fontFamily: fontFamily,
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
    marginBottom: 16,
  },
  boldText: {
    fontFamily: fontBold,
    fontWeight: '700',
    color: '#0F172A',
  },
  blueLink: {
    fontFamily: fontSemi,
    fontWeight: '600',
    color: '#ff4d4d',
  },
});
