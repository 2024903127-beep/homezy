import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  Map,
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  UserCheck,
  Flag,
  Wrench,
  Sparkles,
  ClipboardList,
  FileDown,
  Lock,
  KeyRound,
} from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingsStackParamList } from '@/navigation/types';
import { getBookingById, getPartnerLiveLocation, updateBooking } from '@/services/bookingService';
import { Modal, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { generateAndDownloadDeviceInvoice } from '@/services/deviceInvoiceService';
import ChatModal from '@/components/Chat/ChatModal';
import { useAuthStore } from '@/store/authStore';
import BookingStatusBadge from '@/components/BookingStatusBadge';
import Button from '@/components/Button';
import ErrorState from '@/components/ErrorState';
import SkeletonLoader from '@/components/SkeletonLoader';
import { colors, radius, shadows, spacing, typography } from '@/theme/theme';
import { MessageSquare } from 'lucide-react-native';
import { format } from 'date-fns';

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingTracking'>;

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: ClipboardList },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'PROVIDER_ASSIGNED', label: 'Partner Assigned', icon: UserCheck },
  { key: 'PROVIDER_ARRIVED', label: 'Partner Arrived', icon: Flag },
  { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
  { key: 'COMPLETED', label: 'Completed', icon: Sparkles },
];

function StatusTracker({ currentStatus }: { currentStatus: string }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);
  return (
    <View style={styles.tracker}>
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const isActive = i === currentIndex;
        const StepIcon = step.icon;
        return (
          <View key={step.key} style={styles.trackerStep}>
            <View style={styles.trackerLeft}>
              <View style={[styles.trackerDot, done && styles.trackerDotDone, isActive && styles.trackerDotActive]}>
                <StepIcon size={16} color={isActive || done ? '#0F9D58' : '#9CA3AF'} />
              </View>
              {i < STATUS_STEPS.length - 1 && (
                <View style={[styles.trackerLine, done && i < currentIndex && styles.trackerLineDone]} />
              )}
            </View>
            <Text style={[styles.trackerLabel, done && styles.trackerLabelDone, isActive && styles.trackerLabelActive]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function BookingTrackingScreen({ route, navigation }: Props) {
  const { bookingId } = route.params;
  const currentUser = useAuthStore((s) => s.user);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Generate next 3 available slot options
  const rescheduleSlots = [
    { label: 'Tomorrow, 10:00 AM', hoursToAdd: 24 },
    { label: 'Tomorrow, 02:00 PM', hoursToAdd: 28 },
    { label: 'Day after, 11:00 AM', hoursToAdd: 48 },
  ];

  const handleConfirmReschedule = async (hoursToAdd: number) => {
    setIsRescheduling(true);
    try {
      const newDate = new Date(Date.now() + hoursToAdd * 3600000);
      await updateBooking(bookingId, { scheduledAt: newDate.toISOString() });
      refetch();
      setRescheduleModalVisible(false);
      Alert.alert('Rescheduled!', 'Your service appointment has been updated to the new slot.');
    } catch {
      Alert.alert('Error', 'Unable to reschedule booking. Please contact support.');
    } finally {
      setIsRescheduling(false);
    }
  };

  const { data: booking, isLoading, isError, refetch } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => getBookingById(bookingId),
    refetchInterval: 8000,
  });

  const partnerId = booking?.provider?.id;
  const { data: partnerCoords } = useQuery({
    queryKey: ['partnerLocation', partnerId],
    queryFn: () => getPartnerLiveLocation(partnerId!),
    enabled: !!partnerId && ['PROVIDER_ASSIGNED', 'PROVIDER_ARRIVED', 'IN_PROGRESS'].includes(booking?.status || ''),
    refetchInterval: 5000,
  });


  const handleDownloadInvoice = async () => {
    if (!booking) return;
    try {
      setIsGeneratingPdf(true);
      await generateAndDownloadDeviceInvoice(booking, currentUser);
    } catch (error) {
      console.error('[BookingTrackingScreen] Invoice download failed:', error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (isError) return <ErrorState onRetry={refetch} />;

  if (isLoading || !booking) {
    return (
      <View style={{ padding: spacing.md }}>
        <SkeletonLoader height={120} borderRadius={16} style={{ marginBottom: 12 }} />
        <SkeletonLoader height={200} borderRadius={16} style={{ marginBottom: 12 }} />
        <SkeletonLoader height={100} borderRadius={16} />
      </View>
    );
  }

  const formattedDate = booking.scheduledAt
    ? format(new Date(booking.scheduledAt), 'EEE, d MMM • h:mm a')
    : 'Date not set';

  // Compute 4-digit start OTP to match partner verification
  const cleanId = bookingId.replace(/[^0-9]/g, '');
  const startOtp = cleanId.length >= 4 ? cleanId.slice(-4) : '1234';

  const showStartOtp = ['PROVIDER_ASSIGNED', 'PROVIDER_ARRIVED'].includes(booking.status);


  const customerLat = booking?.address?.latitude || 28.4595;
  const customerLng = booking?.address?.longitude || 77.0266;
  const partnerLat = partnerCoords?.latitude || (customerLat + 0.008);
  const partnerLng = partnerCoords?.longitude || (customerLng + 0.006);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Live Google Maps Tracking */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: (customerLat + partnerLat) / 2,
            longitude: (customerLng + partnerLng) / 2,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
        >
          {/* Customer Destination Marker */}
          <Marker
            coordinate={{ latitude: customerLat, longitude: customerLng }}
            title="Your Location"
            description={booking.address?.line1 || 'Service destination'}
            pinColor="#0F9D58"
          />

          {/* Partner Live Marker */}
          {booking.provider && (
            <Marker
              coordinate={{ latitude: partnerLat, longitude: partnerLng }}
              title={booking.provider.name}
              description={booking.status === 'PROVIDER_ARRIVED' ? 'Arrived at your location' : 'On the way'}
            >
              <View style={styles.partnerMarker}>
                <View style={styles.markerCircle}>
                  <Text style={styles.markerEmoji}>ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂºÃƒâ€šÃ‚Âµ</Text>
                </View>
                <View style={styles.markerPulse} />
              </View>
            </Marker>
          )}
        </MapView>
        <View style={styles.mapOverlayPill}>
          <View style={styles.pulseDot} />
          <Text style={styles.mapOverlayText}>
            {booking.status === 'PROVIDER_ARRIVED'
              ? 'Partner has arrived outside'
              : booking.status === 'IN_PROGRESS'
              ? 'Service in progress at home'
              : booking.provider
              ? 'Partner is en route (GPS live)'
              : 'Waiting for partner assignment'}
          </Text>
        </View>
      </View>

      {/* Start OTP Card ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â Urban Company style security handshake */}
      {showStartOtp && (
        <View style={styles.otpCard}>
          <View style={styles.otpHeader}>
            <View style={styles.otpIconBadge}>
              <KeyRound size={20} color="#0F9D58" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.otpTitle}>Service Start Code (OTP)</Text>
              <Text style={styles.otpSub}>Share this 4-digit PIN with your partner upon arrival</Text>
            </View>
          </View>
          <View style={styles.otpDigitsContainer}>
            {startOtp.split('').map((digit, idx) => (
              <View key={idx} style={styles.digitBox}>
                <Text style={styles.digitText}>{digit}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Service + status summary */}
      <View style={styles.card}>
        <View style={styles.statusRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{booking.service?.name ?? 'Homezy Service'}</Text>
            <View style={styles.dateRow}>
              <Calendar size={13} color={colors.textMuted} />
              <Text style={styles.scheduledAt}> {formattedDate}</Text>
            </View>
          </View>
          <BookingStatusBadge status={booking.status} />
        </View>
      </View>

      {/* Status tracker */}
      {booking.status !== 'CANCELLED' && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>BOOKING PROGRESS</Text>
          <StatusTracker currentStatus={booking.status} />
        </View>
      )}

      {/* Partner card */}
      {booking.provider ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>YOUR ASSIGNED PARTNER</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerAvatarText}>
                {booking.provider.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.providerName}>{booking.provider.name}</Text>
              {booking.provider.rating ? (
                <View style={styles.ratingRow}>
                  <Star size={13} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.providerRating}> {booking.provider.rating.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
                        <Button
              label="Call Partner"
              variant="outline"
              size="sm"
              onPress={() => Linking.openURL(`tel:${booking.provider!.phone}`)}
              style={styles.callBtn}
            />
            <Button
              label="Chat"
              variant="primary"
              size="sm"
              onPress={() => setChatVisible(true)}
              style={styles.chatBtn}
            />
          </View>
        </View>
      ) : (
        <View style={[styles.card, styles.waitingCard]}>
          <Clock size={24} color="#0F9D58" />
          <Text style={styles.waitingText}>Finding you the best verified partner nearby...</Text>
        </View>
      )}

      {/* Price summary */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>PAYMENT SUMMARY</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total Amount</Text>
          <Text style={styles.priceValue}>ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{booking.price}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Payment Mode</Text>
          <Text style={styles.priceValue}>{booking.paymentMode}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Payment Status</Text>
          <Text style={[styles.priceValue, { color: booking.paymentStatus === 'PAID' ? colors.success : colors.warning }]}>
            {booking.paymentStatus}
          </Text>
        </View>
      </View>

            {/* Reschedule Action (Available before partner starts work) */}
      {['PENDING', 'CONFIRMED', 'PROVIDER_ASSIGNED'].includes(booking.status) && (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>NEED TO CHANGE TIME?</Text>
          <Text style={styles.rescheduleHint}>Free rescheduling available up to 2 hours before the slot.</Text>
          <Button
            label="Reschedule Service Slot"
            variant="outline"
            onPress={() => setRescheduleModalVisible(true)}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}

      {/* Actions */}
      {booking.status === 'COMPLETED' && (
        <View style={styles.completedActions}>
          <Button
            label="Rate Partner & Experience"
            variant="outline"
            onPress={() => navigation.navigate('RateBooking', { bookingId: booking.id })}
            style={{ marginBottom: spacing.sm }}
          />
          <Button
            label={isGeneratingPdf ? 'Generating Invoice...' : 'Download Tax Invoice'}
            variant="primary"
            onPress={handleDownloadInvoice}
            loading={isGeneratingPdf}
          />
        </View>
      )}
          {booking.provider && (
        <ChatModal
          visible={chatVisible}
          onClose={() => setChatVisible(false)}
          bookingId={booking.id}
          myRole="CUSTOMER"
          recipientName={booking.provider.name}
        />
      )}
          {/* Reschedule Modal */}
      <Modal visible={rescheduleModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose a New Slot</Text>
            <Text style={styles.modalSub}>Select a convenient time for your service visit</Text>
            <View style={{ gap: spacing.sm, marginVertical: spacing.md }}>
              {rescheduleSlots.map((s, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.slotOption}
                  onPress={() => handleConfirmReschedule(s.hoursToAdd)}
                  disabled={isRescheduling}
                >
                  <Calendar size={18} color="#0F9D58" />
                  <Text style={styles.slotText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button
              label="Cancel"
              variant="outline"
              onPress={() => setRescheduleModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },

  mapContainer: {
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    ...shadows.sm,
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  partnerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F9D58',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...shadows.card,
  },
  markerEmoji: {
    fontSize: 18,
  },
  markerPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 157, 88, 0.25)',
    zIndex: -1,
  },
  mapOverlayPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...shadows.card,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0F9D58',
  },
  mapOverlayText: {
    ...typography.captionBold,
    color: '#1F2937',
  },

  // OTP Card Styles
  otpCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    ...shadows.card,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  otpIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpTitle: {
    ...typography.bodyBold,
    color: '#14532D',
    fontSize: 15,
  },
  otpSub: {
    ...typography.caption,
    color: '#166534',
    marginTop: 1,
  },
  otpDigitsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  digitBox: {
    width: 48,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F9D58',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  digitText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F9D58',
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  statusRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  serviceName: { ...typography.h3, color: colors.text, marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  scheduledAt: { ...typography.caption, color: colors.textMuted },

  sectionLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },

  tracker: { paddingVertical: spacing.xs },
  trackerStep: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  trackerLeft: { alignItems: 'center', width: 28, marginRight: spacing.sm },
  trackerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackerDotDone: { backgroundColor: '#E8F5E9' },
  trackerDotActive: { backgroundColor: '#C8E6C9', borderWidth: 2, borderColor: '#0F9D58' },
  trackerLine: { width: 2, height: 24, backgroundColor: '#E5E7EB', marginVertical: 2 },
  trackerLineDone: { backgroundColor: '#0F9D58' },
  trackerLabel: { ...typography.body, color: colors.textMuted, marginTop: 4, flex: 1 },
  trackerLabelDone: { color: colors.text, fontWeight: '500' },
  trackerLabelActive: { color: '#0F9D58', fontWeight: '700' },

  providerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerAvatarText: { ...typography.h3, color: '#0F9D58' },
  providerName: { ...typography.bodyBold, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  providerRating: { ...typography.captionBold, color: '#D97706' },
  callBtn: { minWidth: 80 },
  chatBtn: { minWidth: 70, marginLeft: 6 },

  waitingCard: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  waitingText: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceLabel: { ...typography.body, color: colors.textMuted },
  priceValue: { ...typography.bodyBold, color: colors.text },

  completedActions: { marginTop: spacing.sm },
  rescheduleHint: { ...typography.caption, color: colors.textMuted },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg },
  modalTitle: { ...typography.h3, color: colors.text },
  modalSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  slotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  slotText: { ...typography.bodyBold, color: colors.text },
});

