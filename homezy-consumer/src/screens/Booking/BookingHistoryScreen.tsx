import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Clock,
  CheckCircle2,
  UserCheck,
  Flag,
  Wrench,
  Sparkles,
  XCircle,
  ClipboardList,
  ChevronRight,
} from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingsStackParamList } from '@/navigation/types';
import { getBookingHistory, updateBooking } from '@/services/bookingService';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useToastStore } from '@/store/toastStore';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { Booking } from '@/types/models';
import { format } from 'date-fns';

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingHistory'>;

const STATUS_ICONS: Record<string, React.ElementType> = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PROVIDER_ASSIGNED: UserCheck,
  PROVIDER_ARRIVED: Flag,
  IN_PROGRESS: Wrench,
  COMPLETED: Sparkles,
  CANCELLED: XCircle,
};

function BookingCard({
  booking,
  onPress,
  onCancel,
}: {
  booking: Booking;
  onPress: () => void;
  onCancel: () => void;
}) {
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);
  const StatusIcon = STATUS_ICONS[booking.status] ?? ClipboardList;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceIconWrap}>
            <StatusIcon size={22} color="#0F9D58" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {booking.service?.name ?? 'Home Service'}
            </Text>
            <Text style={styles.dateText}>
              {format(new Date(booking.scheduledAt), 'dd MMM yyyy, hh:mm a')}
            </Text>
          </View>
        </View>
        <BookingStatusBadge status={booking.status} />
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.priceValue}>₹{booking.price}</Text>
        </View>

        <View style={styles.actionRow}>
          {canCancel && (
            <Pressable
              style={styles.cancelBtn}
              onPress={(e) => {
                e.stopPropagation();
                onCancel();
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          )}
          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>Details</Text>
            <ChevronRight size={16} color="#0F9D58" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function BookingHistoryScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const toast = useToastStore();

  const { data: bookings, isLoading, isError, refetch } = useQuery({
    queryKey: ['bookings'],
    queryFn: getBookingHistory,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateBooking(id, { status: 'CANCELLED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: () => {
      toast.error('Failed to cancel booking. Please try again.');
    },
  });

  const handleCancel = (booking: Booking) => {
    const serviceName = booking.service?.name ?? 'appointment';
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your ${serviceName}?`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(booking.id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {[1, 2, 3].map((i) => (
          <SkeletonLoader key={i} height={120} style={{ marginHorizontal: spacing.md, marginBottom: spacing.md }} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <ErrorState subtitle="Could not load bookings" onRetry={refetch} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => navigation.navigate('BookingTracking', { bookingId: item.id })}
            onCancel={() => handleCancel(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No Bookings Yet"
            subtitle="When you book a home service, your active and past orders will show up here."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAF9' },
  loadingContainer: { paddingTop: spacing.md },
  listContent: { padding: spacing.md, paddingBottom: spacing.xxl },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    ...typography.bodyBold,
    color: colors.text,
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  priceValue: {
    ...typography.bodyBold,
    color: '#0F9D58',
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cancelBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelBtnText: {
    ...typography.caption,
    color: '#EF4444',
    fontWeight: '600',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    ...typography.caption,
    color: '#0F9D58',
    fontWeight: '600',
  },
});
