import React, { useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import Button from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const STATS = [
  { value: '50K+', label: 'Active Partners' },
  { value: '₹45K', label: 'Avg Monthly' },
  { value: '4.9⭐', label: 'Partner Rating' },
];

const FEATURES = [
  { emoji: '🔔', title: 'Real-time Job Alerts', desc: 'Get instant notifications for jobs near you' },
  { emoji: '💰', title: 'Instant Payouts', desc: 'Withdraw earnings to UPI within 24 hours' },
  { emoji: '📈', title: 'Grow Your Business', desc: 'Build ratings and unlock premium tier' },
  { emoji: '🛡️', title: 'Fully Insured', desc: 'All jobs covered under Homezy insurance' },
];

export default function WelcomeScreen({ navigation }: Props) {
  const btnScale = useRef(new Animated.Value(1)).current;

  const animBtn = (toValue: number) => {
    Animated.spring(btnScale, { toValue, useNativeDriver: true, tension: 120 }).start();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Hero section */}
      <LinearGradient
        colors={['#1A73E8', '#0F5BC4', '#0A47A0']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative elements */}
        <View style={[styles.circle, { width: 300, height: 300, top: -80, right: -80, opacity: 0.1 }]} />
        <View style={[styles.circle, { width: 160, height: 160, bottom: -40, left: -40, opacity: 0.08 }]} />

        {/* Logo row */}
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Image source={require('@/assets/logo.png')} style={styles.logoImg} resizeMode="contain" />
          </View>
          <Text style={styles.logoText}>Homezy</Text>
          <View style={styles.partnerBadge}>
            <Text style={styles.partnerBadgeText}>PARTNER</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Start Earning{'\n'}on Your Schedule</Text>
        <Text style={styles.heroSub}>
          Join India's fastest-growing home services platform and build your professional career.
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {STATS.map((s, i) => (
            <View key={s.label} style={[styles.statBox, i > 0 && styles.statBorder]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Features card */}
      <View style={styles.featuresCard}>
        <Text style={styles.featuresTitle}>Why partner with us?</Text>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA buttons */}
      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ scale: btnScale }] }}>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('PasswordLogin')}
            onPressIn={() => animBtn(0.96)}
            onPressOut={() => animBtn(1)}
          >
            <LinearGradient colors={['#1A73E8', '#0F5BC4']} style={styles.primaryBtnGrad}>
              <Text style={styles.primaryBtnText}>Login to Partner App</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Pressable style={styles.outlineBtn} onPress={() => navigation.navigate('OtpLogin')}>
          <Text style={styles.outlineBtnText}>Register with OTP →</Text>
        </Pressable>

        <Text style={styles.terms}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  hero: {
    paddingTop: 52,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoImg: { width: '100%', height: '100%' },
  logoText: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', flex: 1 },
  partnerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  partnerBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.5 },

  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.3)',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontWeight: '500' },

  featuresCard: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: spacing.md,
    letterSpacing: 0.2,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureEmoji: { fontSize: 20 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  featureDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },

  actions: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 44,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  primaryBtn: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: '#1A73E8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnGrad: {
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  outlineBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: '#1A73E8',
    marginBottom: spacing.sm,
  },
  outlineBtnText: { fontSize: 16, fontWeight: '700', color: '#1A73E8' },

  terms: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 17,
  },
  termsLink: { color: '#1A73E8', fontWeight: '600' },
});
