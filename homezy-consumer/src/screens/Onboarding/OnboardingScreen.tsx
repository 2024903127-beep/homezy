import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { Home, Zap, ShieldCheck } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { colors, radius, spacing, typography } from '@/theme/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: Home,
    title: 'Premium Home Services',
    subtitle: 'Book trusted professionals for all your home needs - cleaning, plumbing, electrical, AC repair & more.',
    bg: '#0F9D58',
  },
  {
    id: '2',
    icon: Zap,
    title: 'Book in 60 Seconds',
    subtitle: 'Choose a service, pick your slot, and confirm your booking. A verified professional is on their way.',
    bg: '#FF7B2F',
  },
  {
    id: '3',
    icon: ShieldCheck,
    title: 'Verified & Trusted',
    subtitle: 'Every Homezy professional is background-checked, trained, and rated by thousands of happy customers.',
    bg: '#3B82F6',
  },
];

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
    }
  ).current;

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      navigation.replace('Login');
    }
  };

  const handleSkip = () => navigation.replace('Login');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Skip */}
      <Pressable style={styles.skip} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      {/* Slides */}
      <Animated.FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => {
          const IconComponent = item.icon;
          return (
            <View style={[styles.slide, { backgroundColor: item.bg }]}>
              <View style={styles.iconContainer}>
                <IconComponent size={56} color={colors.white} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          );
        }}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return <Animated.View key={i} style={[styles.dot, { width: dotWidth, opacity }]} />;
        })}
      </View>

      {/* Next / Get Started Button */}
      <Pressable style={styles.btn} onPress={handleNext}>
        <Text style={styles.btnText}>
          {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </Text>
      </Pressable>

      <Text style={styles.terms}>By continuing, you agree to our Terms & Privacy Policy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: 'center' },
  skip: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10 },
  skipText: { ...typography.bodyBold, color: 'rgba(255,255,255,0.8)' },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: 120,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  btn: {
    position: 'absolute',
    bottom: 64,
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  btnText: { ...typography.h4, color: colors.primary },
  terms: {
    position: 'absolute',
    bottom: spacing.lg,
    ...typography.small,
    color: 'rgba(255,255,255,0.6)',
  },
});
