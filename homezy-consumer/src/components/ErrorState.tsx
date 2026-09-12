import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme/theme';
import Button from './Button';

interface Props {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export default function ErrorState({
  title = 'Something went wrong',
  subtitle = 'We had trouble loading this. Please try again.',
  onRetry,
  style,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <AlertTriangle size={36} color="#EF4444" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {onRetry ? (
        <Button label="Try Again" onPress={onRetry} style={styles.btn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  title: { ...typography.h3, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  btn: { marginTop: spacing.lg, paddingHorizontal: spacing.xl, backgroundColor: '#0F9D58' },
});
