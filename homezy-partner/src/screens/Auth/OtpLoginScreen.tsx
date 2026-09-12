import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { requestOtp } from '@/services/authService';
import { colors, spacing, typography } from '@/theme/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpLogin'>;

const PHONE_REGEX = /^[6-9]\d{9}$/;

export default function OtpLoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!PHONE_REGEX.test(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await requestOtp({ phone, email: email.trim() || undefined });
      navigation.navigate('OtpVerify', { phone, email: email.trim() || undefined });
    } catch {
      setError('Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Partner Login with OTP</Text>
      <Text style={styles.subtitle}>Enter your phone and email to receive verification code.</Text>
      <TextField
        label="Mobile Number"
        placeholder="10-digit mobile number"
        keyboardType="phone-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        error={error}
      />
      <TextField
        label="Email Address (Optional)"
        placeholder="To receive OTP on Gmail"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Button label="Send Verification Code" onPress={handleContinue} loading={loading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, marginBottom: spacing.xl },
});
