import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BookingStatus } from '@/types/models';
import { colors, radius, spacing, typography } from '@/theme/theme';

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PROVIDER_ASSIGNED: 'Assigned',
  PROVIDER_ARRIVED: 'Arrived',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const STATUS_DOT_COLOR: Record<BookingStatus, string> = {
  PENDING:           colors.statusPending,
  CONFIRMED:         colors.statusConfirmed,
  PROVIDER_ASSIGNED: colors.statusAssigned,
  PROVIDER_ARRIVED:  colors.statusArrived,
  IN_PROGRESS:       colors.statusInProgress,
  COMPLETED:         colors.statusCompleted,
  CANCELLED:         colors.statusCancelled,
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const color = STATUS_DOT_COLOR[status];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}60` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    gap: 4,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { ...typography.small, fontWeight: '700' },
});
