import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Home } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme/theme';

import { requestOtp, verifyOtp } from '@/services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const PHONE_REGEX = /^\d{10}$/;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await requestOtp({ phone: cleanPhone, email: email.trim() || undefined });
      navigation.navigate('OtpVerify', { phone: cleanPhone, email: email.trim() || undefined });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not request OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Hero top section */}
      <View style={styles.hero}>
        <View style={styles.logoBox}>
          <Home size={40} color={colors.white} />
        </View>
        <Text style={styles.brand}>Homezy</Text>
        <Text style={styles.tagline}>Your home, perfectly cared for</Text>
      </View>

      {/* Card bottom sheet */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome to Homezy</Text>
        <Text style={styles.cardSubtitle}>Enter your phone number to sign in or register</Text>

        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>+91</Text>
          </View>
          <View style={styles.phoneInput}>
            <TextField
              placeholder="10-digit mobile number"
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                if (error) setError(undefined);
              }}
              keyboardType="phone-pad"
              maxLength={10}
              error={error}
            />
          </View>
        </View>

        <View style={{ marginBottom: spacing.md }}>
          <TextField
            placeholder="Email address (to receive OTP on Gmail)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Button
          label="Send Verification Code"
          onPress={handleContinue}
          loading={loading}
          style={styles.btn}
        />
      </View>

      <Text style={styles.terms}>
        By continuing, you agree to our{' '}
        <Text style={styles.link}>Terms of Service</Text> and{' '}
        <Text style={styles.link}>Privacy Policy</Text>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brand: { ...typography.h1, color: colors.white, letterSpacing: 1 },
  tagline: { ...typography.body, color: 'rgba(255,255,255,0.75)', marginTop: spacing.xs },

  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cardTitle: { ...typography.h2, color: colors.text, marginBottom: 4 },
  cardSubtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },

  phoneRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  countryCode: {
    height: 50,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: { ...typography.bodyBold, color: colors.text },
  phoneInput: { flex: 1 },

  btn: { marginTop: spacing.sm, borderRadius: radius.pill },

  terms: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
  },
  link: { color: colors.primary, fontWeight: '600' },
});
