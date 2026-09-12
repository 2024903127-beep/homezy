import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { CheckCircle2, Bell, MapPin, Star } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import Button from '@/components/Button';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingSuccess'>;

export default function BookingSuccessScreen({ navigation, route }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8, delay: 100 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true, delay: 100 }),
    ]).start();
  }, [opacity, scale]);

  const bookingId = route.params.bookingId;
  const shortId = bookingId.slice(-6).toUpperCase();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, { transform: [{ scale }], opacity }]}>
        <CheckCircle2 size={52} color="#0F9D58" />
      </Animated.View>

      <Animated.View style={{ opacity, width: '100%' }}>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your booking is placed and we're finding the best professional near you.
        </Text>

        <View style={styles.refCard}>
          <Text style={styles.refLabel}>BOOKING REF</Text>
          <Text style={styles.refId}># {shortId}</Text>
        </View>

        <View style={styles.steps}>
          {[
            { icon: Bell, text: "We'll notify you when a provider accepts" },
            { icon: MapPin, text: 'Track your provider\'s live location' },
            { icon: Star, text: 'Rate your service after completion' },
          ].map((step, i) => {
            const StepIcon = step.icon;
            return (
              <View key={i} style={styles.step}>
                <View style={styles.stepIconWrap}>
                  <StepIcon size={18} color="#0F9D58" />
                </View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            );
          })}
        </View>

        <Button
          label="Track My Booking"
          onPress={() => {
            navigation.popToTop();
            (navigation.getParent() as any)?.navigate('BookingsTab', {
              screen: 'BookingTracking',
              params: { bookingId },
            });
          }}
          style={styles.trackBtn}
        />
        <Button
          label="Back to Home"
          variant="ghost"
          onPress={() => navigation.popToTop()}
          style={{ marginTop: spacing.sm }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(15,157,88,0.2)',
    ...shadows.card,
  },
  title: { ...typography.h1, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  refCard: {
    backgroundColor: '#E8F5EE',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(15,157,88,0.2)',
  },
  refLabel: { ...typography.overline, color: '#0F9D58' },
  refId: { ...typography.h3, color: '#0F9D58', marginTop: spacing.xs },

  steps: { marginBottom: spacing.lg },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  stepIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepText: { ...typography.body, color: colors.textSecondary, flex: 1 },

  trackBtn: { marginTop: spacing.sm },
});
