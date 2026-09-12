import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme/theme';
import Button from './Button';

interface Props {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
  style?: ViewStyle;
}

export default function EmptyState({ title, subtitle, ctaLabel, onCta, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Search size={36} color="#0F9D58" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {ctaLabel && onCta ? (
        <Button label={ctaLabel} onPress={onCta} style={styles.cta} />
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
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(15,157,88,0.2)',
  },
  title: { ...typography.h3, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  cta: { marginTop: spacing.lg, paddingHorizontal: spacing.xl },
});
