import React from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme/theme';

interface DutyToggleProps {
  isOnDuty: boolean;
  onToggle: (value: boolean) => void;
  loading?: boolean;
}

export default function DutyToggle({ isOnDuty, onToggle, loading }: DutyToggleProps) {
  return (
    <View style={[styles.container, isOnDuty ? styles.onDuty : styles.offDuty]}>
      <View>
        <Text style={styles.label}>{isOnDuty ? "You're Online" : "You're Offline"}</Text>
        <Text style={styles.sublabel}>
          {isOnDuty ? 'Receiving new job requests' : 'Go online to start receiving jobs'}
        </Text>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Switch
          value={isOnDuty}
          onValueChange={onToggle}
          trackColor={{ false: '#ffffff55', true: '#ffffff55' }}
          thumbColor={colors.white}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  onDuty: { backgroundColor: colors.success },
  offDuty: { backgroundColor: colors.textMuted },
  label: { ...typography.bodyBold, color: colors.white },
  sublabel: { ...typography.caption, color: colors.white, opacity: 0.85, marginTop: 2 },
});
