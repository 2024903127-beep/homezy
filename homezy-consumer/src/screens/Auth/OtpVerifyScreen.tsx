import React, { useRef, useState, useEffect } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import Button from '@/components/Button';
import { verifyOtp, requestOtp } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

const OTP_SLOTS = [0, 1, 2, 3, 4, 5];

export default function OtpVerifyScreen({ route, navigation }: Props) {
  const { phone, email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [timer, setTimer] = useState(30);
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const login = useAuthStore((s) => s.login);

  // Countdown timer for resend
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleVerify = async () => {
    if (otp.length < 4) {
      shake();
      setError('Please enter the 6-digit verification code');
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const res = await verifyOtp({ phone, otp });
      await login(res.token, res.user);
    } catch (err: any) {
      shake();
      setError(err?.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    setError(undefined);
    setTimer(30);
    try {
      await requestOtp({ phone, email });
    } catch {}
    finally { setResending(false); }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <ArrowLeft size={22} color="#111827" />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient colors={['#00C896', '#00B386']} style={styles.iconGradient}>
            <MessageSquare size={32} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.iconBadge}>
            <Text style={styles.iconBadgeText}>🔐</Text>
          </View>
        </View>

        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>+91 {phone}</Text>
          {email ? (
            <>
              {'\n'}and to <Text style={styles.phone}>{email}</Text>
            </>
          ) : null}
        </Text>

        {/* OTP Slots UI */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <View style={styles.slotsRow}>
            {OTP_SLOTS.map((i) => {
              const char = otp[i] ?? '';
              const isCurrent = i === otp.length;
              const isFilled = i < otp.length;
              return (
                <Pressable
                  key={i}
                  style={[
                    styles.slot,
                    isFilled && styles.slotFilled,
                    isCurrent && styles.slotActive,
                    !!error && styles.slotError,
                  ]}
                  onPress={() => inputRef.current?.focus()}
                >
                  <Text style={styles.slotText}>{char}</Text>
                  {isCurrent && !char && <View style={styles.cursor} />}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Hidden real input */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={otp}
          onChangeText={(t) => {
            setOtp(t.replace(/\D/g, '').slice(0, 6));
            if (error) setError(undefined);
          }}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          caretHidden
        />

        {error ? (
          <Text style={styles.errorText}>⚠️  {error}</Text>
        ) : null}

        <Button
          label="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          style={styles.btn}
        />

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive it? </Text>
          <Pressable onPress={handleResend} disabled={timer > 0 || resending}>
            <Text style={[styles.resendBtn, timer > 0 && styles.resendDisabled]}>
              {timer > 0 ? `Resend in ${timer}s` : resending ? 'Sending...' : 'Resend OTP'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  iconBadgeText: { fontSize: 16 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  phone: { color: '#111827', fontWeight: '700' },

  slotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slot: {
    width: 48,
    height: 58,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotFilled: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  slotActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  slotError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  slotText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  cursor: {
    width: 2,
    height: 22,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: spacing.md,
    textAlign: 'center',
    fontWeight: '500',
  },
  devBadge: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  devText: { fontSize: 12, color: '#065F46', fontWeight: '600' },

  btn: {
    width: '100%',
    height: 54,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendLabel: { fontSize: 14, color: '#6B7280' },
  resendBtn: { fontSize: 14, fontWeight: '700', color: colors.primary },
  resendDisabled: { color: '#9CA3AF' },
});
