import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Job } from '@/types/models';
import JobStatusBadge from './JobStatusBadge';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { MapPin, Clock, IndianRupee, Zap, Timer } from 'lucide-react-native';

interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
  isIncoming?: boolean;
  onExpire?: (jobId: string) => void;
}

const STATUS_ACCENT: Partial<Record<string, string>> = {
  PENDING: colors.warning,
  CONFIRMED: colors.primary,
  PROVIDER_ASSIGNED: colors.secondary,
  PROVIDER_ARRIVED: colors.primary,
  IN_PROGRESS: colors.success,
  COMPLETED: colors.success,
  CANCELLED: colors.danger,
};

const ACCEPTANCE_WINDOW_SECONDS = 30;

export default function JobCard({ job, onPress, isIncoming = false, onExpire }: JobCardProps) {
  const accentColor = STATUS_ACCENT[job.status] ?? colors.textMuted;
  const scheduledDate = new Date(job.scheduledAt);
  const isToday = new Date().toDateString() === scheduledDate.toDateString();
  const timeLabel = isToday
    ? `Today, ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : scheduledDate.toLocaleDateString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  // 30-second acceptance countdown timer for incoming requests
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (!isIncoming) return 0;
    const createdAtMs = new Date(job.createdAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - createdAtMs) / 1000);
    return Math.max(0, ACCEPTANCE_WINDOW_SECONDS - elapsedSeconds);
  });

  useEffect(() => {
    if (!isIncoming) return;
    if (secondsRemaining <= 0) {
      onExpire?.(job.id);
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.(job.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIncoming, secondsRemaining, job.id, onExpire]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(job)}
    >
      {/* Left status accent bar */}
      <View style={[styles.accentBar, { backgroundColor: isIncoming ? colors.danger : accentColor }]} />

      <View style={styles.body}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.serviceName} numberOfLines={1}>{job.serviceName}</Text>
          <JobStatusBadge status={job.status} />
        </View>

        {/* Incoming badge with live countdown */}
        {isIncoming && (
          <View style={styles.incomingBanner}>
            <View style={styles.newBadge}>
              <Zap size={10} color={colors.white} fill={colors.white} />
              <Text style={styles.newBadgeText}>New Request</Text>
            </View>
            <View style={[styles.timerBadge, secondsRemaining <= 10 && styles.timerUrgent]}>
              <Timer size={12} color={secondsRemaining <= 10 ? '#EF4444' : '#B45309'} />
              <Text style={[styles.timerText, secondsRemaining <= 10 && styles.timerTextUrgent]}>
                {secondsRemaining > 0 ? `${secondsRemaining}s to accept` : 'Expiring...'}
              </Text>
            </View>
          </View>
        )}

        {/* Customer */}
        <Text style={styles.customer} numberOfLines={1}>
          {isIncoming ? 'New customer request' : job.customer.name}
        </Text>

        {/* Details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MapPin size={12} color={colors.textMuted} />
            <Text style={styles.detailText} numberOfLines={1}>
              {job.address.city}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={12} color={colors.textMuted} />
            <Text style={styles.detailText}>{timeLabel}</Text>
          </View>
        </View>

        {/* Footer row */}
        <View style={styles.footer}>
          <View style={styles.priceRow}>
            <IndianRupee size={14} color={colors.primary} />
            <Text style={styles.price}>{job.price}</Text>
          </View>
          <Text style={styles.payMode}>
            {job.paymentMode === 'COD' ? '💵 Cash on Delivery' : '💳 Paid Online'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    ...shadows.card,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  accentBar: { width: 4, backgroundColor: colors.primary },

  body: { flex: 1, padding: spacing.md },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  serviceName: { ...typography.bodyBold, color: colors.text, flex: 1 },

  incomingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  newBadgeText: { ...typography.caption, color: colors.white, fontWeight: '700', fontSize: 10 },

  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  timerUrgent: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  timerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  timerTextUrgent: {
    color: '#EF4444',
  },

  customer: { ...typography.caption, color: colors.textMuted, marginTop: 4 },

  detailsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { ...typography.caption, color: colors.textMuted },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { ...typography.bodyBold, color: colors.primary, fontSize: 15 },
  payMode: { ...typography.caption, color: colors.textMuted },
});



export function JobCardSkeleton() {
  return (
    <View style={[styles.card, { padding: spacing.md, backgroundColor: colors.white }]}>
      <View style={{ height: 16, width: '60%', backgroundColor: '#E5E7EB', borderRadius: radius.xs, marginBottom: 8 }} />
      <View style={{ height: 12, width: '40%', backgroundColor: '#F3F4F6', borderRadius: radius.xs, marginBottom: 12 }} />
      <View style={{ height: 12, width: '80%', backgroundColor: '#F3F4F6', borderRadius: radius.xs }} />
    </View>
  );
}
