import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { verifyOtp, requestOtp } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerify'>;

export default function OtpVerifyScreen({ route }: Props) {
  const { phone, email } = route.params;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const login = useAuthStore((s) => s.login);

  const handleVerify = async () => {
    if (otp.length < 4) {
      setError('Enter the 6-digit verification code');
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      const { token, provider } = await verifyOtp({ phone, otp });
      await login(token, provider);
      // RootNavigator swaps to Main once isAuthenticated flips true.
      // New providers land on Main with verificationStatus === 'UNVERIFIED',
      // and ProfileScreen should nudge them toward the KYC screen.
    } catch {
      setError('Invalid or expired verification code. Please check your email / SMS and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await requestOtp({ phone, email });
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify your number</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to +91 {phone}
        {email ? ` and ${email}` : ''}
      </Text>
      <TextField
        label="OTP"
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        error={error}
      />
      <Button label="Verify & Continue" onPress={handleVerify} loading={loading} />
      <Button
        label={resending ? 'Resending...' : 'Resend OTP'}
        onPress={handleResend}
        variant="ghost"
        disabled={resending}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
});
