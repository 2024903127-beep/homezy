import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { JobStatus } from '@/types/models';
import { colors, radius, spacing, typography } from '@/theme/theme';

const STATUS_LABEL: Record<JobStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROVIDER_ASSIGNED: 'Assigned to You',
  PROVIDER_ARRIVED: 'Arrived',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_COLOR: Record<JobStatus, string> = {
  PENDING: colors.warning,
  CONFIRMED: colors.secondary,
  PROVIDER_ASSIGNED: colors.secondary,
  PROVIDER_ARRIVED: colors.primary,
  IN_PROGRESS: colors.primary,
  COMPLETED: colors.success,
  CANCELLED: colors.danger,
};

export default function JobStatusBadge({ status }: { status: JobStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}1A`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: { ...typography.small, fontWeight: '600' },
});
