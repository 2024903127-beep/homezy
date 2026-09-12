import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import TextField from '@/components/TextField';
import Button from '@/components/Button';
import { Toast } from '@/components/Toast';
import { getBankDetails, saveBankDetails } from '@/services/kycService';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { ShieldCheck, CreditCard } from 'lucide-react-native';

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export default function BankDetailsScreen() {
  const { data } = useQuery({ queryKey: ['bank-details'], queryFn: getBankDetails });
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upiId, setUpiId] = useState('');
  const [ifscError, setIfscError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setAccountHolderName(data.accountHolderName);
      setAccountNumber(data.accountNumber);
      setIfsc(data.ifsc);
      setUpiId(data.upiId ?? '');
      setIsSaved(true);
    }
  }, [data]);

  const handleSave = async () => {
    const cleanIfsc = ifsc.trim().toUpperCase();
    if (cleanIfsc && !IFSC_REGEX.test(cleanIfsc)) {
      setIfscError('Enter a valid 11-character IFSC code (e.g. SBIN0001234)');
      return;
    }
    setIfscError(undefined);
    setSaving(true);
    try {
      await saveBankDetails({
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: cleanIfsc,
        upiId: upiId.trim() || undefined,
      });
      setIsSaved(true);
      Toast.show({ message: 'Bank details saved securely!', type: 'success' });
    } catch {
      Toast.show({ message: 'Failed to save bank details', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const maskedAccount = accountNumber
    ? `•••• •••• ${accountNumber.slice(-4)}`
    : 'Not configured';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Security Banner */}
      <View style={styles.secBanner}>
        <ShieldCheck size={20} color={colors.primary} />
        <Text style={styles.secText}>
          Your bank information is encrypted and used only for direct job payout transfers.
        </Text>
      </View>

      {isSaved && (
        <View style={styles.savedCard}>
          <CreditCard size={20} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={styles.savedTitle}>{accountHolderName}</Text>
            <Text style={styles.savedSub}>Account: {maskedAccount}</Text>
            <Text style={styles.savedSub}>IFSC: {ifsc}</Text>
          </View>
        </View>
      )}

      <TextField label="Account Holder Name" value={accountHolderName} onChangeText={setAccountHolderName} />
      <TextField
        label="Account Number"
        value={accountNumber}
        onChangeText={setAccountNumber}
        keyboardType="number-pad"
        secureTextEntry={isSaved && accountNumber.length > 4}
      />
      <TextField
        label="IFSC Code"
        value={ifsc}
        onChangeText={setIfsc}
        autoCapitalize="characters"
        maxLength={11}
        error={ifscError}
      />
      <TextField label="UPI ID (optional)" value={upiId} onChangeText={setUpiId} autoCapitalize="none" placeholder="name@upi" />

      <Button label="Save Bank Details" onPress={handleSave} loading={saving} style={{ marginTop: spacing.md }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: '#F8FAF9' },
  secBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  secText: { ...typography.caption, color: colors.primary, flex: 1 },
  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  savedTitle: { ...typography.bodyBold, color: colors.text },
  savedSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
});
