import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated, Platform, LayoutAnimation, UIManager } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SLIDES = [
  {
    id: 1,
    title: "CONNECT",
    subtitle: "Connect with traders, mentors, communities, and your broker.",
    image: require('../assets/images/tradifive-connect-transparent.png'),
    bgText: "CONNECT"
  },
  {
    id: 2,
    title: "PROTECT",
    subtitle: "Control risk, prevent emotional decisions, and safeguard your capital with AI RiskGuard.",
    image: require('../assets/images/tradifive-protect-riskguard-transparent.png'),
    bgText: "PROTECT"
  },
  {
    id: 3,
    title: "GROW",
    subtitle: "Analyse every trade, improve with AI insights, and become a disciplined trader.",
    image: require('../assets/images/tradifive-grow-transparent.png'),
    bgText: "GROW"
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentSlide < SLIDES.length - 1) {
      const nextSlide = currentSlide + 1;
      
      // Slow, elegant glide upward
      LayoutAnimation.configureNext({
        duration: 700,
        update: { 
          type: LayoutAnimation.Types.easeInEaseOut,
        }
      });
      setCurrentSlide(nextSlide);
    } else {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/login');
    }
  };

  const handleSkip = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={{ flex: 1 }} />

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          <View style={styles.iconContainer}>
            <ChevronUp size={24} color="white" />
          </View>
        </View>

        <Image
          source={require('../assets/images/bottom-glow.png')}
          style={styles.bottomGlow}
          resizeMode="stretch"
        />
      </View>

      {/* MESSAGE (Now on Top Layer) */}
      <View style={[styles.topContent, { top: currentSlide === 0 ? height * 0.46 : currentSlide === 1 ? height * 0.32 : height * 0.12 }]}>
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={{ position: 'absolute', opacity: currentSlide === index ? 1 : 0, width: '100%', left: 30 }}>
            <Text style={styles.subtitle}>{slide.subtitle}</Text>
          </View>
        ))}
      </View>

      {/* BACKGROUND TEXT (Outside) */}
      <View style={[styles.bgTextContainer, { top: currentSlide === 0 ? height * 0.56 : currentSlide === 1 ? height * 0.42 : height * 0.22 }]}>
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={{ position: 'absolute', opacity: currentSlide === index ? 1 : 0, width: '100%', left: 30 }}>
            <View style={{ transform: [{ scaleY: 3.7 }], width: '100%' }}>
              <Text style={styles.bgText} numberOfLines={1} ellipsizeMode="clip">
                {slide.bgText}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* ILLUSTRATION (Forward and Pass-through) */}
      <View style={[styles.imageContainer, { top: currentSlide === 0 ? height * 0.48 : currentSlide === 1 ? height * 0.36 : height * 0.13 }]} pointerEvents="none">
        {SLIDES.map((slide, index) => (
          slide.image && (
            <View
              key={slide.id}
              style={{
                position: 'absolute',
                opacity: currentSlide === index ? 1 : 0,
                width: '100%',
                alignItems: 'center'
              }}
            >
              <Image
                source={slide.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )
        ))}
      </View>

      <View style={[styles.bottomCard, { height: currentSlide === 0 ? height * 0.18 : currentSlide === 1 ? height * 0.35 : height * 0.50 }]}>
        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: 60,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    zIndex: 10,
  },
  bgTextContainer: {
    position: 'absolute',
    width: width,
    alignItems: 'flex-start',
    paddingHorizontal: 30,
    opacity: 0.18,
    zIndex: 20,
  },
  bgText: {
    width: '100%',
    fontSize: 70,
    fontFamily: 'Inter_900Black',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
  },
  topContent: {
    position: 'absolute',
    width: width,
    paddingHorizontal: 30,
    zIndex: 60,
  },
  subtitle: {
    color: '#e5e7eb',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Inter_400Regular',
    fontWeight: '400',
    lineHeight: 22,
  },
  imageContainer: {
    position: 'absolute',
    width: width,
    alignItems: 'center',
    zIndex: 150,
  },
  image: {
    width: width * 0.95,
    height: height * 0.48,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 10, // Sitting tighter on the curve
    zIndex: 30,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    justifyContent: 'flex-end',
    paddingBottom: 30,
    zIndex: 100,
  },
  nextButton: {
    backgroundColor: '#ff4d4d',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 0,
    width: width,
    height: 200,
    zIndex: 1,
    opacity: 1,
  }
});
